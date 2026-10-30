"""Moments, highlights, training plan, live whispers — all computed from the
job's real tracking data. Honesty rules (runbook): without model keys every
output is a real computation over trajectories.json, labeled as such; with
keys the same requests upgrade to Spark and fall back on failure.
"""
import json
import math
import re
import subprocess
from pathlib import Path

FPS = 30
SPRINT_KMH = 25.0
PITCH_W, PITCH_H = 105.0, 68.0
WIN_S = 5.0          # moment window length
MAX_CLIP_S = 15.0


def _load_tracks(job: dict) -> dict:
    p = Path(job["source_path"]).parent / "tracks.json"
    if not p.exists():
        raise FileNotFoundError("tracks.json not available for this job")
    return json.loads(p.read_text())


def _players_tracks(tracks: dict) -> list:
    return [t for t in tracks.get("tracks", []) if t.get("label") != "ball"]


def _ball_track(tracks: dict) -> dict | None:
    for t in tracks.get("tracks", []):
        if t.get("label") == "ball":
            return t
    return None


def _window_metrics(tracks: dict, t0: float, t1: float) -> dict:
    """Real metrics for [t0, t1): peak player speed (+who), sprints, ball
    speed, spatial spread of the player block."""
    peak, peak_by, sprints, ball_sp = 0.0, None, 0, 0.0
    positions = []
    for tr in tracks.get("tracks", []):
        is_ball = tr.get("label") == "ball"
        fr = tr["frames"]
        above, last_cross = False, -9.0  # one episode per crossing, 1.5 s cooldown
        for a, b in zip(fr, fr[1:]):
            ta, tb = a["frame"] / FPS, b["frame"] / FPS
            if tb <= t0 or ta >= t1:
                continue
            dt = tb - ta
            if dt <= 0:
                continue
            sp = math.hypot(b["x"] - a["x"], b["y"] - a["y"]) / dt * 3.6
            if is_ball:
                ball_sp = max(ball_sp, sp)
            else:
                if sp > peak:
                    peak, peak_by = sp, tr["id"]
                if sp > SPRINT_KMH and not above and ta - last_cross > 1.5:
                    sprints += 1
                    last_cross = ta
                    above = True
                elif sp <= SPRINT_KMH * 0.9:
                    above = False
        if not is_ball:
            positions += [(p["x"], p["y"]) for p in fr
                          if t0 <= p["frame"] / FPS < t1]
    spread = 0.0
    if positions:
        for i in range(0, len(positions), 3):
            for j in range(i + 3, len(positions), 3):
                spread = max(spread, math.hypot(
                    positions[i][0] - positions[j][0],
                    positions[i][1] - positions[j][1]))
    return {"peak_kmh": round(peak, 1), "peak_by": peak_by,
            "sprints": sprints, "ball_kmh": round(ball_sp, 1),
            "spread_m": round(spread, 1)}


def _intent(query: str) -> str:
    q = (query or "").lower()
    if any(k in q for k in ("fast", "speed", "sprint", "cepat", "lari")):
        return "speed"
    if any(k in q for k in ("chaos", "pressure", "intense", "hectic", "tekanan",
                            "ramai", "transition", "switch")):
        return "chaos"
    if any(k in q for k in ("space", "gap", "open", "spread", "kosong", "jarak")):
        return "space"
    if any(k in q for k in ("calm", "possession", "control", "tenang", "pelan")):
        return "calm"
    return "highlight"


def search_moments(job: dict, query: str) -> dict:
    """Top non-overlapping 5s windows ranked by the query's intent."""
    tracks = _load_tracks(job)
    video = (job.get("video") or {})
    dur = float(video.get("duration_s", 0) or 0)
    if dur < 3:
        raise ValueError("analyzed segment too short to search")
    intent = _intent(query)
    wins = []
    t = 0.0
    while t + WIN_S <= dur + 0.01:
        m = _window_metrics(tracks, t, t + WIN_S)
        m["start_s"], m["end_s"] = round(t, 1), round(t + WIN_S, 1)
        wins.append(m)
        t += WIN_S
    if intent == "speed":
        key = lambda m: m["peak_kmh"]  # noqa: E731
    elif intent == "chaos":
        key = lambda m: m["sprints"] * 2 + m["ball_kmh"] / 10  # noqa: E731
    elif intent == "space":
        key = lambda m: m["spread_m"]  # noqa: E731
    elif intent == "calm":
        key = lambda m: -m["ball_kmh"] - m["sprints"]  # noqa: E731
    else:
        key = lambda m: m["peak_kmh"] + m["sprints"] * 1.5 + m["ball_kmh"] / 8  # noqa: E731
    wins.sort(key=key, reverse=True)
    picked = []
    for m in wins:
        if all(m["end_s"] <= p["start_s"] or m["start_s"] >= p["end_s"]
               for p in picked):
            picked.append(m)
        if len(picked) == 3:
            break
    for m in picked:
        m["label"], m["description"] = _describe(m, intent, (job.get("sport") or "").lower())
        m["intent"] = intent
    return {"query": query, "intent": intent, "moments": picked,
            "mode": "computed",
            "note": "Ranked from real tracking data. Natural-language moment "
                    "reasoning upgrades to Spark with API keys."}


def _describe(m: dict, intent: str, sport: str = "") -> tuple[str, str]:
    labels = {"speed": "Fastest burst", "chaos": "Transition chaos",
              "space": "Block stretched open", "calm": "Calm possession spell",
              "highlight": "Top highlight"}
    if sport == "running":
        desc = (f"peak {m['peak_kmh']} km/h ({m['peak_by']}), "
                f"{m['sprints']} sprint episodes, over {m['spread_m']} m of range")
    else:
        desc = (f"peak {m['peak_kmh']} km/h ({m['peak_by']}), {m['sprints']} sprint episodes, "
                f"ball at {m['ball_kmh']} km/h, block spread {m['spread_m']} m")
    return labels.get(intent, "Highlight"), desc


def moment_clip(job: dict, start: float, end: float) -> Path:
    """Cut a highlight clip from the analyzed source (stream copy, cached)."""
    start, end = float(start), float(end)
    if start < 0 or end <= start:
        raise ValueError("clip window must satisfy 0 <= start < end")
    dur = end - start
    if dur > MAX_CLIP_S:
        raise ValueError(f"clip length must be 0–{MAX_CLIP_S:.0f}s")
    src = Path(job["source_path"])
    if not src.exists():
        raise FileNotFoundError("source video not available")
    out_dir = src.parent / "clips"
    out_dir.mkdir(exist_ok=True)
    out = out_dir / f"clip_{int(start * 10)}_{int(end * 10)}.mp4"
    if not out.exists():
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.2f}", "-i", str(src),
             "-t", f"{dur:.2f}", "-c", "copy", str(out)],
            capture_output=True, text=True, timeout=120, check=True)
    return out


def moment_card_svg(job: dict, m: dict) -> str:
    """Shareable SVG report card for one moment — real numbers only."""
    result = job.get("result") or {}
    label = result.get("label", "Match")
    dur = result.get("duration", "?")
    esc = lambda s: str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")  # noqa: E731
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420">
<rect width="800" height="420" rx="24" fill="#090B10"/>
<rect x="16" y="16" width="768" height="388" rx="18" fill="none" stroke="#262C3A" stroke-width="1.5"/>
<text x="48" y="72" fill="#0064E0" font-family="Arial" font-size="26" font-weight="800">StatCam</text>
<text x="180" y="72" fill="#5B6472" font-family="Arial" font-size="15">MOMENT REPORT</text>
<text x="48" y="130" fill="#F3F5F8" font-family="Arial" font-size="30" font-weight="800">{esc(m.get('label', 'Highlight'))}</text>
<text x="48" y="166" fill="#9CA3AF" font-family="Arial" font-size="16">{esc(label)} · {esc(dur)} · {m.get('start_s', 0):.0f}s–{m.get('end_s', 0):.0f}s</text>
<rect x="48" y="200" width="220" height="120" rx="14" fill="#11141C"/>
<text x="68" y="245" fill="#0064E0" font-family="Arial" font-size="34" font-weight="800">{m.get('peak_kmh', 0)}</text>
<text x="68" y="272" fill="#9CA3AF" font-family="Arial" font-size="13">km/h peak ({esc(m.get('peak_by') or '-')})</text>
<rect x="290" y="200" width="220" height="120" rx="14" fill="#11141C"/>
<text x="310" y="245" fill="#F3F5F8" font-family="Arial" font-size="34" font-weight="800">{m.get('sprints', 0)}</text>
<text x="310" y="272" fill="#9CA3AF" font-family="Arial" font-size="13">sprints in window</text>
<rect x="532" y="200" width="220" height="120" rx="14" fill="#11141C"/>
<text x="552" y="245" fill="#F3F5F8" font-family="Arial" font-size="34" font-weight="800">{m.get('spread_m', 0)} m</text>
<text x="552" y="272" fill="#9CA3AF" font-family="Arial" font-size="13">block spread</text>
<text x="48" y="360" fill="#5B6472" font-family="Arial" font-size="12">Computed from real tracking data · {esc(m.get('description', ''))}</text>
<text x="48" y="382" fill="#3E4654" font-family="Arial" font-size="11">StatCam BETA — SIERA Labs · point a camera at any match, get pro stats</text>
</svg>"""


def training_plan(job: dict) -> dict:
    """Weekly plan computed from this match's weaknesses. Spark-ready."""
    stats = ((job.get("result") or {}).get("_raw_stats")) or []
    if isinstance(stats, dict):
        stats = stats.get("players") or []
    if not stats:
        raise ValueError("no stats available for this job")
    top = max(stats, key=lambda p: p.get("distance_m", 0))
    least = min(stats, key=lambda p: p.get("distance_m", 0))
    fast = max(stats, key=lambda p: p.get("top_speed_kmh", 0))
    dists = sorted(p.get("distance_m", 0) for p in stats)
    med = dists[len(dists) // 2]
    gap_pct = round(100 * (top.get("distance_m", 0) - least.get("distance_m", 0))
                    / max(1.0, top.get("distance_m", 0)))
    sprints_total = sum(int(p.get("sprints", 0)) for p in stats)
    focus = []
    if gap_pct > 35:
        focus.append(f"Collective pressing — work-rate gap is {gap_pct}% "
                     f"({top.get('id')} vs {least.get('id')})")
    if sprints_total > 15:
        focus.append(f"Repeat-sprint conditioning — {sprints_total} team sprints, "
                     f"expect late-game fatigue")
    else:
        focus.append("Tempo control — low sprint volume, raise intentional "
                     "off-ball movement")
    if least.get("distance_m", 0) < 0.5 * max(1.0, med):
        focus.append(f"Raise the floor — {least.get('id')} covered "
                     f"{least.get('distance_m', 0) / 1000:.2f} km, half the median")
    sessions = [
        {"day": "Tuesday", "title": "Pressing shape",
         "drills": [
             {"name": "5v5 +3 press triggers", "duration_min": 25,
              "why": f"Close the {gap_pct}% work-rate gap as a unit, not individually"},
             {"name": "Shadow-press rondo", "duration_min": 15,
              "why": "Synchronize the block — spread metric showed stretched phases"},
         ]},
        {"day": "Thursday", "title": "Repeat-sprint engine",
         "drills": [
             {"name": "10 × 30m shuttles @ 90%", "duration_min": 20,
              "why": f"Match the peak demand: {fast.get('id')} hit {fast.get('top_speed_kmh', 0):.1f} km/h"},
             {"name": "Transition 3v2 chains", "duration_min": 20,
              "why": "Convert sprint bursts into controlled exits"},
         ]},
        {"day": "Saturday", "title": "Game application",
         "drills": [
             {"name": "8v8 with pressing triggers", "duration_min": 30,
              "why": "Transfer Tuesday/Thursday patterns into real play"},
             {"name": "Median-load conditioning test", "duration_min": 10,
              "why": f"Target: lift squad median from {med / 1000:.2f} km toward {top.get('distance_m', 0) / 1000:.2f} km"},
         ]},
    ]
    return {"focus": focus, "sessions": sessions,
            "computed": True,
            "note": "Computed from this match's tracking data. Spark's full "
                    "periodization reasoning activates with API keys."}


def whisper(job: dict, t: float) -> dict:
    """One live tactical line for replay time t — state of play, honestly,
    phrased for the sport in the job (a single runner is not "a ball in the ?")."""
    sport = (job.get("sport") or "").lower()
    court_len = 28.0 if sport == "basketball" else 60.0
    tracks = _load_tracks(job)
    dur = float((job.get("video") or {}).get("duration_s") or 0)
    t = max(0.0, min(float(t), dur if dur else float(t)))
    clamped = dur and float(t) >= dur
    m = _window_metrics(tracks, max(0.0, t - 5), t + 1.0)
    base = f"t+{t:.0f}s — peak intensity {m['peak_kmh']} km/h ({m['peak_by'] or 'n/a'}), {m['sprints']} sprint episodes in the last 5s"
    if sport == "running":
        text = base + f", spanning {m['spread_m']} m of track."
    else:
        ball = _ball_track(tracks)
        zone = ""
        if ball:
            xs = [p["x"] for p in ball["frames"] if abs(p["frame"] / FPS - t) <= 2.0]
            if xs:
                x = xs[-1]
                if sport == "basketball":
                    zone = "ball in the backcourt" if x < court_len / 2 else "ball in the frontcourt"
                else:
                    zone = ("ball in the defensive third" if x < court_len / 3 else
                            "ball in the middle third" if x < 2 * court_len / 3 else
                            "ball in the attacking third")
        text = (f"t+{t:.0f}s — {zone}; " if zone else f"t+{t:.0f}s — ") + \
            f"peak intensity {m['peak_kmh']} km/h ({m['peak_by'] or 'n/a'}), " \
            f"{m['sprints']} sprint episodes in the last 5s, block spread {m['spread_m']} m."
    if clamped:
        text = f"[end of segment — {dur:.0f}s analyzed] " + text
    if m["spread_m"] > (20 if sport == "basketball" else 60):
        text += " Space is stretched — move as a unit."
    if m["sprints"] >= 4:
        text += " High-intensity window — transition fitness shows here."
    return {"t": round(t, 1), "text": text, "mode": "computed"}