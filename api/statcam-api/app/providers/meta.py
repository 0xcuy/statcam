"""
Meta Model API adapter — SAM 3.1 (video tracking) + Muse Spark (codegen).

Base: https://api.meta.ai/v1  (Unified API surface, one auth + billing)
Auth: Bearer <META_API_KEY>

VERIFIED LIVE 31 Okt 2026 against the real API (hackathon key):
- GET /v1/models, GET /v1/models/{id} — OpenAI-style catalog (sam-3.1,
  muse-spark-1.3, muse-image-1.0, …) — OK
- POST /v1/chat/completions with muse-spark-1.3 — OK (Spark codegen/chat path)
- SAM 3.1 runs on POST /v1/responses (Responses style): one user message with
  an input_text part (ONE short noun-phrase concept, e.g. "person") followed
  by an input_video part whose video_url accepts a data:video/mp4;base64 URI.
  Docs: https://dev.meta.ai/docs/sam/overview. Output is special-token text,
  per frame: <Nf><ordinal><|box;x1=..;y1=..;x2=..;y2=..;w=..;h=..|><|mask;..|>.
  Empty output text = zero matches for that concept.
"""
import base64
import math
import os
import re
import subprocess
import json as _json
from pathlib import Path

import httpx

BASE_URL = os.environ.get("META_API_BASE", "https://api.meta.ai/v1")
SPARK_MODEL = os.environ.get("META_SPARK_MODEL", "muse-spark-1.3")
SAM_MODEL = os.environ.get("META_SAM_MODEL", "sam-3.1")
# Concept chain tried in order until one yields enough objects —
# vocabulary is content-dependent ("soccer player" hits broadcast football,
# "person" hits amateur sideline footage).
PLAYER_CONCEPTS = [c.strip() for c in os.environ.get(
    "META_PLAYER_CONCEPTS", "soccer player,person").split(",") if c.strip()]
PLAYER_CONCEPT = PLAYER_CONCEPTS[0]  # kept for result notes
BALL_CONCEPT = os.environ.get("META_BALL_CONCEPT", "soccer ball")  # "" disables ball call
VISIBLE_WIDTH_M = float(os.environ.get("META_VISIBLE_WIDTH_M", "60.0"))  # rough scale estimate

TIMEOUT = httpx.Timeout(120.0, connect=30.0)


def _api_key() -> str:
    # Read lazily so keys added at runtime (admin page) take effect immediately.
    return os.environ.get("META_API_KEY", "")


def _headers():
    return {"Authorization": f"Bearer {_api_key()}", "Content-Type": "application/json"}


def configured() -> bool:
    return bool(_api_key())


async def spark_chat(messages: list[dict], max_tokens: int = 4000) -> str:
    """Chat/completions-style call to Muse Spark. Returns assistant text.

    Spark is a reasoning model: its thinking burns the max_tokens budget and
    `content` comes back null when the budget is exhausted — so on a null
    content we retry once with a much larger budget before giving up.
    """
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        for budget in (max_tokens, max(max_tokens * 4, 12000)):
            r = await client.post(
                f"{BASE_URL}/chat/completions",
                headers=_headers(),
                json={
                    "model": SPARK_MODEL,
                    "messages": messages,
                    "max_tokens": budget,
                    "temperature": 0.2,
                },
            )
            r.raise_for_status()
            data = r.json()
            choice = (data.get("choices") or [{}])[0]
            content = choice.get("message", {}).get("content")
            if content and choice.get("finish_reason") != "length":
                return content
        raise RuntimeError("Spark returned empty or truncated content (token budget exhausted)")


async def _sam_text(concept: str, video_path: Path) -> str:
    """One SAM 3.1 request for one noun-phrase concept over a video clip."""
    raw = video_path.read_bytes()
    b64 = base64.b64encode(raw).decode()
    body = {
        "model": SAM_MODEL,
        "input": [{"role": "user", "content": [
            {"type": "input_text", "text": concept},
            {"type": "input_video", "video_url": f"data:video/mp4;base64,{b64}"},
        ]}],
        "metadata": {"mask_encoding": "one_bit"},
    }
    async with httpx.AsyncClient(timeout=httpx.Timeout(900.0, connect=30.0)) as client:
        r = await _post(client, f"{BASE_URL}/responses", body)
        data = r.json()
    return "".join((c.get("text") or "") for o in (data.get("output") or [])
                   for c in (o.get("content") or []))


async def _post(client: httpx.AsyncClient, url: str, payload: dict):
    r = await client.post(url, headers=_headers(), json=payload)
    r.raise_for_status()
    return r


_FRAME_RE = re.compile(r"<(\d+)f>")
_BOX_RE = re.compile(r"(\d+)<\|box;x1=([\d.]+);y1=([\d.]+);x2=([\d.]+);y2=([\d.]+)[^|]*\|")


def _parse_sam_text(text: str, src_fps: float, mpp: float):
    """SAM special-token text -> (tracks, frames_with_match, total_frames).

    Frames are renumbered onto a 30 fps timeline so the analysis contract's
    dt math stays consistent. Coordinates are scaled by mpp (meters/pixel).
    """
    if not text.strip():
        return [], 0, 0
    parts = _FRAME_RE.split(text)
    per_obj: dict[int, list] = {}
    total_frames = 0
    frames_with = 0
    for i in range(1, len(parts), 2):
        fi = int(parts[i])
        seg = parts[i + 1]
        total_frames = max(total_frames, fi + 1)
        got = False
        for m in _BOX_RE.finditer(seg):
            ordinal = int(m.group(1))
            x1, y1, x2, y2 = (float(m.group(k)) for k in (2, 3, 4, 5))
            per_obj.setdefault(ordinal, []).append({
                "frame": round(fi * 30.0 / max(src_fps, 1.0)),
                "x": round((x1 + x2) / 2.0 * mpp, 3),
                "y": round((y1 + y2) / 2.0 * mpp, 3),
                "w": round(abs(x2 - x1) * mpp, 3),
                "h": round(abs(y2 - y1) * mpp, 3),
            })
            got = True
        if got:
            frames_with += 1
    tracks = []
    for ordinal, fr in sorted(per_obj.items()):
        fr = _drop_identity_switches(fr)
        if len(fr) < 4:
            continue  # barely-seen object — drop it, never invent
        tracks.append({"id": f"P{len(tracks) + 1}", "label": "player", "frames": fr})
    return tracks, frames_with, total_frames


def _drop_identity_switches(fr: list, max_mps: float = 11.0) -> list:
    """Remove points reached by a physically impossible sprint — SAM occasionally
    re-assigns an ordinal to a different person (identity switch), which shows
    up as a 100-300 m/s step. The real movement never exceeds ~12 m/s."""
    cleaned: list = []
    for f in sorted(fr, key=lambda p: p["frame"]):
        if cleaned:
            dt = (f["frame"] - cleaned[-1]["frame"]) / 30.0
            if dt > 0:
                step = math.hypot(f["x"] - cleaned[-1]["x"],
                                  f["y"] - cleaned[-1]["y"]) / dt
                if step > max_mps:
                    continue
        cleaned.append(f)
    return cleaned


def _median_area(track: dict) -> float:
    areas = [f["w"] * f["h"] for f in track["frames"]]
    areas.sort()
    return areas[len(areas) // 2]


def _prune_background(tracks: list[dict], max_players: int = 14) -> list[dict]:
    """Keep pitch-level people: drop tiny far-away/crowd matches, cap the count."""
    if not tracks:
        return []
    ref = max(_median_area(t) for t in tracks)
    kept = [t for t in tracks if _median_area(t) >= 0.25 * ref]
    kept.sort(key=_median_area, reverse=True)
    kept = kept[:max_players]
    kept.sort(key=lambda t: t["id"])
    for i, t in enumerate(kept, 1):
        t["id"] = f"P{i}"
    return kept


def _probe_stream(video_path: Path) -> tuple[int, int, float]:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,r_frame_rate", "-of", "json",
         str(video_path)],
        capture_output=True, text=True, timeout=30)
    st = _json.loads(r.stdout or "{}")["streams"][0]
    num, den = (st.get("r_frame_rate") or "30/1").split("/")
    fps = float(num) / float(den or 1) or 30.0
    return int(st["width"]), int(st["height"]), fps


async def sam_track_video(video_path: Path, prompt: str) -> dict:
    """SAM 3.1 live tracking -> tracks.json schema.

    One API call per concept (person, then the ball when configured). The
    ball is OPTIONAL — if its concept matches nothing, the job proceeds
    without it (insights degrade gracefully). Confidence = share of frames
    with at least one match (computed, not invented). meters are estimated
    from an assumed visible pitch width — an approximation, labeled as such.
    """
    w, h, fps = _probe_stream(video_path)
    mpp = VISIBLE_WIDTH_M / max(w, 1)
    best = ([], 0, 0, PLAYER_CONCEPTS[0])
    for concept in PLAYER_CONCEPTS:
        text = await _sam_text(concept, video_path)
        cand = _parse_sam_text(text, fps, mpp)
        cand_pruned = _prune_background(json.loads(json.dumps(cand[0])))
        if len(cand_pruned) > len(best[0]):
            best = (cand[0], cand[1], cand[2], concept)
        if len(cand_pruned) >= 6:
            break
    tracks, frames_with, total, used_concept = best
    tracks = _prune_background(json.loads(json.dumps(tracks)))
    if BALL_CONCEPT:
        try:
            btext = await _sam_text(BALL_CONCEPT, video_path)
            btracks, _, _ = _parse_sam_text(btext, fps, mpp)
            if btracks:
                ball = max(btracks, key=lambda t: len(t["frames"]))
                ball = dict(ball)
                ball.update({"id": "BALL", "label": "ball"})
                tracks.append(ball)
        except httpx.HTTPError:
            pass  # ball is optional — never fail the job over it
    return {"tracks": tracks, "confidence": round(frames_with / max(total, 1), 3),
            "mock": False,
            "note": (f"SAM 3.1 live tracking — concepts: {used_concept}"
                     f"{' + ' + BALL_CONCEPT if BALL_CONCEPT else ''}; "
                     f"meters estimated from ~{VISIBLE_WIDTH_M:.0f} m visible width")}


CODEGEN_SYSTEM = """You write short, dependency-light Python 3 analysis scripts.
Reply with ONLY the raw Python script — no markdown fences, no prose, no commentary before or after.
Rules:
- Read trajectories from /input/tracks.json
- Write results ONLY to /output/stats.json (create the dir if needed)
- No network, no pip installs. Standard library + numpy only.
- Output schema: {"players": [{"id": "P1", "distance_m": float, "top_speed_kmh": float,
  "sprints": int, "heatmap": [[float x 8 cols] x 3 rows]}], "confidence": float,
  "notes": str}
- Frame numbers in tracks.json are on a 30 fps timeline — use fps from meta
  (30.0) for dt. x,y is the tracked CENTER point in meters (do NOT add w/2);
  w,h is the object's size in meters. meters_per_pixel is 1.0 — never rescale.
- distance: sum of consecutive-frame centroid displacement. top_speed: max over
  1-second windows. sprints:
  count of windows where speed > sprint_threshold_kmh (in meta). heatmap:
  3 rows x 8 cols normalized 0..1 occupancy grid over the frame.
- If tracks.json is empty or has no usable frames, still write /output/stats.json
  (players: [], confidence: 0.0, notes explaining) — never crash, never invent.
- Be conservative: if data is thin, say so in notes instead of inventing.
- Print nothing except a final single line: DONE <num_players> players.
"""


async def spark_write_analysis_code(tracks_path: Path, meta: dict) -> str:
    """Ask Muse Spark to write the telemetry analysis script for these tracks."""
    tracks_preview = tracks_path.read_text()[:6000]
    user_msg = (
        "Write the analysis script per the system rules.\n\n"
        f"Video meta: {meta}\n\n"
        f"tracks.json preview (truncated):\n{tracks_preview}\n"
    )
    code = await spark_chat(
        [
            {"role": "system", "content": CODEGEN_SYSTEM},
            {"role": "user", "content": user_msg},
        ],
        max_tokens=3000,
    )
    code = _extract_code(code)
    compile(code, "analysis.py", "exec")  # validate — broken code raises here
    return code


def _extract_code(raw: str) -> str:
    """Spark sometimes wraps the script in prose or fences — pull out pure Python."""
    code = (raw or "").strip()
    blocks = re.findall(r"```(?:python)?\s*\n(.*?)```", code, re.S)
    if blocks:
        code = max(blocks, key=len).strip()
    else:
        lines = code.splitlines()
        for i, ln in enumerate(lines):
            if re.match(r"\s*(import |from |def |class |#)", ln):
                code = "\n".join(lines[i:])
                break
    return code.strip()
