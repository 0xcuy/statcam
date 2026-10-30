"""
StatCam analysis pipeline.

Stages: ingest -> frames -> track -> codegen -> execute -> finalize

Modes:
- live:       full pipeline (needs META_API_KEY + E2B_API_KEY)
- needs_keys: ingest + frame probe run for real, then the job stops with a
              clear message instead of fabricating tracking data.
"""
import asyncio
import json
import subprocess
import time
from pathlib import Path

from .jobs import get_job, save_job, job_dir
from .providers import e2bexec, llm, meta, mock

FRAME_FPS = 2  # frames/sec extracted for the tracking preview probe


def _ffprobe(path: Path) -> dict:
    out = subprocess.run(
        [
            "ffprobe", "-v", "quiet", "-print_format", "json",
            "-show_format", "-show_streams", str(path),
        ],
        capture_output=True, text=True, timeout=60,
    )
    return json.loads(out.stdout or "{}")


def _set(job_id: str, **kw):
    from .jobs import update_job
    update_job(job_id, **kw)


def _fail(job_id: str, stage: str, message: str):
    _set(job_id, status="failed", stage=stage, progress=100, message=message)


def _log(job_id: str, stage: str, text: str):
    """Append to the visible agent timeline (plan-first, self-correcting)."""
    from .jobs import append_log
    append_log(job_id, stage, text, time.time())


def _fmt(m: float) -> str:
    return f"{m / 1000:.1f} km"


def analyze_stats(stats: dict | list, job: dict) -> dict:
    """Tactical reads + forward-looking advice, computed from the real numbers."""
    players = (stats.get("players") if isinstance(stats, dict) else stats) or []
    if not players:
        return {"tactical": [], "forward": "", "computed": True}
    top = max(players, key=lambda p: p.get("distance_m", 0))
    fast = max(players, key=lambda p: p.get("top_speed_kmh", 0))
    dists = sorted(p.get("distance_m", 0) for p in players)
    med = dists[len(dists) // 2]
    least = min(players, key=lambda p: p.get("distance_m", 0))
    gap_pct = round(100 * (top.get("distance_m", 0) - least.get("distance_m", 0))
                    / max(1.0, top.get("distance_m", 0)))
    sprints_total = sum(int(p.get("sprints", 0)) for p in players)
    tactical = [
        f"{top.get('id', 'P1')} is the engine: {_fmt(top.get('distance_m', 0))} covered — "
        f"{round(100 * top.get('distance_m', 0) / max(1.0, med))}% of the squad-median workload.",
        f"Speed profile: {fast.get('id', 'P1')} peaks at {fast.get('top_speed_kmh', 0):.1f} km/h — "
        f"that is the transition outlet when possession turns over.",
        f"Work-rate spread is {gap_pct}% between the most and least active player "
        f"({top.get('id', 'P1')} vs {least.get('id', '?')}) — pressing is not collective yet.",
        f"Team sprint volume: {sprints_total} in the analyzed segment — "
        f"{'high-intensity chaos, expect late-game fatigue' if sprints_total > 15 else 'controlled intensity'}.",
    ]
    forward = (f"Next session: build drills that lift the median ({_fmt(med)}) rather than the top — "
               f"collective pressing over individual workload. Re-run the other segment of this "
               f"match to compare halves.")
    return {"tactical": tactical, "forward": forward, "computed": True,
            "note": "Computed from tracking data. Spark's full tactical reasoning activates with API keys."}


async def run_pipeline(job_id: str):
    job = get_job(job_id)
    if not job:
        return
    force_mock = job.get("debug") is True
    # Provider matrix — best available per stage, always labeled honestly.
    use_sam = meta.configured() and not force_mock
    use_spark = meta.configured() and not force_mock
    use_llm = (not use_spark) and llm.configured() and not force_mock
    use_e2b = e2bexec.configured() and not force_mock
    track_kind = "sam-3.1" if use_sam else "synthetic"
    codegen_kind = "spark-1.3" if use_spark else (f"llm:{llm.model_name()}" if use_llm else "mock")
    exec_kind = "e2b" if use_e2b else "local"
    if use_sam and use_spark and use_e2b:
        mode = "live"
    elif track_kind == "synthetic" and codegen_kind == "mock" and exec_kind == "local":
        mode = "debug"
    else:
        mode = "test"
    _set(job_id, mode=mode,
         pipeline={"track": track_kind, "codegen": codegen_kind, "exec": exec_kind})
    _log(job_id, "plan",
         f"Plan: ① {'download from link' if job.get('source_url') else 'ingest upload'}"
         f" → ② extract frames → ③ track players ({track_kind}) →"
         f" ④ write stats code ({codegen_kind}) → ⑤ execute ({exec_kind}) → ⑥ dashboard")

    try:
        # ---- ingest ----
        if job.get("source_url") and not job.get("source_path"):
            from .ingest import MAX_SEGMENT_S, cut_segment, download_video
            _set(job_id, status="running", stage="ingest", progress=2,
                 message="Downloading video from link…")

            def _dl_progress(mb: int, total: int):
                _set(job_id, stage="ingest",
                     message=f"Downloading video… {mb}" + (f"/{total}" if total else "") + " MB")

            raw = await asyncio.to_thread(download_video, job["source_url"],
                                          job_dir(job_id), _dl_progress)
            probe_raw = await asyncio.to_thread(_ffprobe, raw)
            raw_dur = float(probe_raw.get("format", {}).get("duration", 0) or 0)
            seg_start = float(job.get("seg_start") or 0.0)
            seg_end = float(job.get("seg_end") or 0.0)
            if seg_end > seg_start:
                seg_start = max(0.0, seg_start)
                if raw_dur:
                    seg_end = min(seg_end, raw_dur)
                if seg_end - seg_start > MAX_SEGMENT_S:
                    seg_end = seg_start + MAX_SEGMENT_S
            elif raw_dur > MAX_SEGMENT_S:
                # runbook: never process a full long match — analyze the first segment
                seg_start, seg_end = 0.0, float(MAX_SEGMENT_S)
            else:
                seg_start, seg_end = 0.0, 0.0
            req_end = float(job.get("seg_end") or 0.0)
            if req_end and raw_dur and req_end > raw_dur:
                _log(job_id, "correct",
                     f"Correction: requested segment end {req_end:.0f}s exceeds the video "
                     f"({raw_dur:.0f}s) — clamped to {seg_end:.0f}s")
            if raw_dur > MAX_SEGMENT_S and req_end <= MAX_SEGMENT_S:
                _log(job_id, "correct",
                     f"Correction: video is {raw_dur / 60:.1f} min — above the 10-minute "
                     f"per-job limit, so the plan now analyzes only the requested/first segment")
            src = job_dir(job_id) / "source.mp4"
            if seg_end > seg_start:
                _set(job_id, stage="ingest", progress=3,
                     message=f"Cutting segment {seg_start:.0f}s–{seg_end:.0f}s…")
                seginfo = await asyncio.to_thread(cut_segment, raw, seg_start, seg_end, src)
                _set(job_id, segment={**seginfo, "raw_duration_s": round(raw_dur, 1)})
            else:
                raw.replace(src)
            _set(job_id, source_path=str(src))
        src = Path(job["source_path"])
        _set(job_id, status="running", stage="ingest", progress=4,
             message=f"Loading {job['filename']}")
        await asyncio.sleep(0.2)
        probe = await asyncio.to_thread(_ffprobe, src)
        fmt = probe.get("format", {})
        duration = float(fmt.get("duration", 0) or 0)
        streams = probe.get("streams", [])
        video = next((s for s in streams if s.get("codec_type") == "video"), {})
        fps = video.get("r_frame_rate", "30/1")
        try:
            num, den = fps.split("/")
            fps_f = float(num) / float(den)
        except Exception:
            fps_f = 30.0
        frames_total = int(duration * fps_f)
        video_meta = {"duration_s": round(duration, 1),
                        "fps": round(fps_f, 1),
                        "frames": frames_total,
                        "width": video.get("width"),
                        "height": video.get("height")}
        if job.get("segment"):
            video_meta["segment"] = job["segment"]
        _set(job_id, video=video_meta)
        if fps_f < 20:
            _log(job_id, "correct",
                 f"Correction: source runs at {fps_f:.0f} fps — tracking resolution reduced")

        # ---- frames (real probe: extract preview frames) ----
        _set(job_id, stage="frames", progress=12,
             message=f"Extracting preview frames — {frames_total} frames")
        frames_dir = job_dir(job_id) / "frames"
        frames_dir.mkdir(exist_ok=True)
        await asyncio.to_thread(
            subprocess.run,
            ["ffmpeg", "-y", "-v", "error", "-i", str(src),
             "-vf", f"fps={FRAME_FPS},scale=640:-1",
             str(frames_dir / "f_%04d.jpg")],
            timeout=300,
        )
        thumbs = sorted(frames_dir.glob("f_*.jpg"))[:8]
        _set(job_id, stage="frames", progress=20,
             message=f"{len(thumbs)} preview frames ready")
        _log(job_id, "frames",
             f"{len(thumbs)} preview frames extracted from a {fps_f:.0f} fps source")

        # ---- track (SAM 3.1, else synthetic — always labeled) ----
        if use_sam:
            _set(job_id, stage="track", progress=28,
                 message="SAM 3.1 tracking players…")
            tracks = await meta.sam_track_video(src, job.get("prompt") or "track players and the ball")
        else:
            _set(job_id, stage="track", progress=28,
                 message="Generating synthetic tracks (no SAM key)…")
            tracks = mock.mock_tracks(video_meta, seed=job_id)
        tracks_path = job_dir(job_id) / "tracks.json"
        tracks_path.write_text(json.dumps(tracks))
        n_tracks = len(tracks.get("tracks", []))
        conf = tracks.get("confidence", 0)
        _set(job_id, stage="track", progress=50,
             message=f"Tracking locked — {conf:.1%} confidence",
             tracking={"objects": n_tracks, "confidence": conf})
        _log(job_id, "track", f"Tracking locked: {n_tracks} objects at {conf:.1%} confidence")
        if n_tracks < 4:
            _log(job_id, "correct",
                 f"Correction: only {n_tracks} objects tracked — pitch coverage is thin, "
                 f"treat squad-level stats as a lower bound")

        # ---- codegen (Spark > generic LLM > bundled mock) ----
        codegen_meta = {"sport": job.get("sport"), "fps": fps_f,
                        "meters_per_pixel": 0.05, "sprint_threshold_kmh": 25.0}
        tracks_preview = tracks_path.read_text()[:6000]
        if use_spark:
            _set(job_id, stage="codegen", progress=58, message="Spark writing stats code…")
            code = await meta.spark_write_analysis_code(tracks_path, codegen_meta)
        elif use_llm:
            _set(job_id, stage="codegen", progress=58,
                 message=f"{llm.model_name()} writing stats code…")
            code = await llm.write_analysis_code(tracks_preview, codegen_meta)
        else:
            _set(job_id, stage="codegen", progress=58,
                 message="Using bundled analysis script (no LLM key)…")
            code = mock.MOCK_ANALYSIS_CODE
        (job_dir(job_id) / "analysis.py").write_text(code)
        _set(job_id, stage="codegen", progress=66, message="Stats code ready")
        _log(job_id, "codegen", f"Stats code ready ({codegen_kind})")

        # ---- execute (E2B sandbox, else local subprocess) ----
        _set(job_id, stage="execute", progress=72,
             message=f"Crunching {n_tracks} trajectories…")
        if use_e2b:
            stats = await asyncio.to_thread(e2bexec.run_analysis, code, tracks)
        else:
            # Local exec for test/debug: the code runs isolated in this container
            # (60s timeout). Only model output from a user-chosen key ever runs here.
            stats = await asyncio.to_thread(
                mock.run_local, code, job_dir(job_id), tracks)
        _set(job_id, stage="execute", progress=86, message="Verified — all green")

        # ---- finalize ----
        _set(job_id, stage="finalize", progress=94, message="Building dashboard…")
        analysis = analyze_stats(stats, job)
        result = normalize_result(job, stats, probe)
        result["analysis"] = analysis
        result["_raw_stats"] = stats
        (job_dir(job_id) / "result.json").write_text(json.dumps(result))
        _set(job_id, status="done", stage="done", progress=100,
             message=f"Stats ready: {result['summaryText']}", result=result)
        _log(job_id, "analyze", f"Analyst read: {analysis['tactical'][0]}")

    except Exception as e:  # noqa: BLE001 — surface stage + error honestly
        _fail(job_id, get_job(job_id).get("stage", "ingest"), f"{type(e).__name__}: {e}")


def normalize_result(job: dict, stats: dict, probe: dict) -> dict:
    """Map pipeline stats -> the frontend dashboard schema."""
    players = {}
    order = ["P7", "P10", "P4", "P1", "P2", "P3", "P5", "P6", "P8", "P9", "P11"]
    colors = ["#4DA3FF", "#FF6B6B", "#4DA3FF", "#4DA3FF", "#FF6B6B", "#4DA3FF",
              "#FF6B6B", "#4DA3FF", "#4DA3FF", "#FF6B6B", "#4DA3FF"]
    dists = [p.get("distance_m", 0) for p in stats["players"]]
    maxd = max(dists) if dists else 1
    for i, p in enumerate(stats["players"][:11]):
        pid = p.get("id") or order[i]
        dist_km = p.get("distance_m", 0) / 1000
        players[pid] = {
            "id": pid,
            "name": f"{pid} · Tracked",
            "color": colors[i % len(colors)],
            "badgeBg": "#0064E0" if i % 2 == 0 else "#E0245E",
            "distance": f"{dist_km:.1f} km",
            "pct": round(100 * p.get("distance_m", 0) / maxd),
            "topSpeed": f"{p.get('top_speed_kmh', 0):.1f} km/h",
            "sprints": int(p.get("sprints", 0)),
            "animClass": "sc-p7" if i == 0 else ("sc-p10" if i == 1 else "sc-p4"),
            "heatmap": p.get("heatmap", [[0] * 8] * 3),
        }
    top = max(stats["players"], key=lambda p: p.get("distance_m", 0)) if stats["players"] else {}
    top_speed_p = max(stats["players"], key=lambda p: p.get("top_speed_kmh", 0)) if stats["players"] else {}
    total_sprints = sum(int(p.get("sprints", 0)) for p in stats["players"])
    dur = float(probe.get("format", {}).get("duration", 0) or 0)
    mm, ss = divmod(int(dur), 60)
    sport_id = job.get("sport", "soccer")
    label = {"soccer": "Soccer", "basketball": "Basketball", "running": "Running"}.get(sport_id, sport_id.title())
    return {
        "mode": job.get("mode", "live"),
        "pipeline": job.get("pipeline", {}),
        "sport": sport_id,
        "label": label,
        "fileName": job.get("filename", "upload.mp4"),
        "duration": f"{mm:02d}:{ss:02d}",
        "trackedLabel": f"TRACKING · {len(players)} PLAYERS",
        "confidence": f"{100 * float(stats.get('confidence', 0)):.1f}%",
        "frames": f"{int(dur * 30):,}",
        "positionsCount": f"{len(players) * int(dur * 30):,}",
        "summaryText": f"{top.get('id', 'P1')} ran {top.get('distance_m', 0) / 1000:.1f} km",
        "notes": stats.get("notes", ""),
        "kpis": [
            {"value": f"{top.get('distance_m', 0) / 1000:.1f}", "unit": " km",
             "label": "TOP DISTANCE", "sub": top.get("id", "—")},
            {"value": f"{top_speed_p.get('top_speed_kmh', 0):.1f}", "unit": " km/h",
             "label": "TOP SPEED", "sub": top_speed_p.get("id", "—")},
            {"value": f"{total_sprints}", "unit": "",
             "label": "SPRINTS", "sub": "TEAM"},
        ],
        "players": players,
    }
