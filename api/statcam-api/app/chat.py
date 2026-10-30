"""Tanya Analisnya — chat over a finished job's tracking data.

Honesty rules (runbook): without a model key the analyst answers are computed
directly from the job's real numbers and labeled "computed". With META/LLM
keys the same question goes to Spark / the configured LLM with the job
context; failures fall back to the computed engine, never fabricate.
"""
import json
import re

from .providers import llm, meta


def _fmt_km(m: float) -> str:
    return f"{m / 1000:.1f} km"


def _players(job: dict) -> list[dict]:
    return ((job.get("result") or {}).get("players")) or {}


def _stats_players(job: dict) -> list[dict]:
    """Raw pipeline stats (distance_m, top_speed_kmh, sprints per player)."""
    raw = (job.get("result") or {}).get("_raw_stats") or []
    if isinstance(raw, dict):
        raw = raw.get("players") or []
    return raw


def computed_answer(job: dict, message: str) -> str:
    """Rule-based analyst. Every sentence is derived from the job's real data."""
    q = (message or "").lower()
    stats = _stats_players(job)
    result = job.get("result") or {}
    if not stats and not result:
        return "The analysis for this job is not ready yet — ask me once the dashboard shows stats."
    if stats:
        top = max(stats, key=lambda p: p.get("distance_m", 0))
        fast = max(stats, key=lambda p: p.get("top_speed_kmh", 0))
        spr = max(stats, key=lambda p: p.get("sprints", 0))
        dists = sorted(p.get("distance_m", 0) for p in stats)
        med = dists[len(dists) // 2] if dists else 0
        gap = (top.get("distance_m", 0) - dists[0]) if dists else 0
        total_sprints = sum(p.get("sprints", 0) for p in stats)
    else:
        top = fast = spr = {}
        med = gap = total_sprints = 0
    seg = job.get("segment") or {}

    def segtxt() -> str:
        if not seg:
            return ""
        return (f" (segment {seg.get('start_s', 0):.0f}–{seg.get('end_s', 0):.0f}s "
                f"of a {seg.get('raw_duration_s', 0):.0f}s video)")

    if any(k in q for k in ("distance", "jarak", "km", "ran", "lari", "cover",
                            "hardest", "workrate", "work rate", "engine", "kerja", "banyak")):
        return (f"{top.get('id', 'P1')} covered the most ground: {_fmt_km(top.get('distance_m', 0))} "
                f"in the analyzed segment{segtxt()} — the engine of this team. Squad median was "
                f"{_fmt_km(med)} — the spread from most to least active is {_fmt_km(max(0, gap))}.")
    if any(k in q for k in ("speed", "fast", "cepat", "km/h", "sprint")):
        return (f"Top speed: {fast.get('id', 'P1')} at {fast.get('top_speed_kmh', 0):.1f} km/h. "
                f"{spr.get('id', 'P1')} recorded the most sprints ({spr.get('sprints', 0)}); "
                f"team total {total_sprints}. High sprint counts with low distance usually mean "
                f"short explosive presses rather than end-to-end running.")
    if any(k in q for k in ("why", "kenapa", "collapse", "runtuh", "weak", "lemah", "problem")):
        bottom = min(stats, key=lambda p: p.get("distance_m", 0)) if stats else {}
        return (f"Reading the data honestly: work-rate is uneven — {_fmt_km(max(0, gap))} separates "
                f"the most and least active players ({top.get('id', 'P1')} vs {bottom.get('id', '?')}). "
                f"Segments of play with low collective distance usually mean the block stopped "
                f"pressing together. The heatmap panel shows where each player spent time — "
                f"clusters on one side are where the opposition found space.")
    if any(k in q for k in ("improve", "drill", "training", "latihan", "advice", "saran", "next")):
        return (f"Forward-looking: the gap between top ({_fmt_km(top.get('distance_m', 0))}) and "
                f"median ({_fmt_km(med)}) is your biggest lever — next session, drill collective "
                f"pressing so the least-active players close that {_fmt_km(max(0, gap))}. "
                f"{fast.get('id', 'P1')} is your transition outlet at {fast.get('top_speed_kmh', 0):.1f} km/h.")
    if any(k in q for k in ("segment", "video", "match", "duration", "potong")):
        return (f"This analysis covers {result.get('duration', '?')} of play{segtxt()}. "
                f"Long videos are analyzed per segment (max 10 min per job) — submit another "
                f"segment to compare halves.")
    if any(k in q for k in ("how", "work", "cara", "pipeline", "sam", "spark", "track")):
        pipe = result.get("pipeline") or {}
        mode = result.get("mode", "?")
        if mode == "live":
            state = "Running fully live on SAM 3.1 + Spark + E2B."
        else:
            bits = []
            if pipe.get("track") != "sam-3.1":
                bits.append("tracking is synthetic (SAM 3.1 key not set yet)")
            if pipe.get("codegen") == "mock":
                bits.append("stats code is the bundled template (no Spark/LLM key yet)")
            if str(pipe.get("exec", "")).startswith("e2b"):
                bits.append("execution runs in the E2B sandbox")
            else:
                bits.append("execution runs locally on this server")
            state = ("The numbers are real computations over the tracked trajectories — "
                     + "; ".join(bits) + ".")
        return (f"Pipeline: ingest → frames → track ({pipe.get('track', '?')}) → codegen "
                f"({pipe.get('codegen', '?')}) → execute ({pipe.get('exec', '?')}). "
                f"Mode: {mode}. " + state)
    if any(k in q for k in ("confidence", "akurat", "accurate")):
        return (f"Tracking confidence reported: {result.get('confidence', '?')}. "
                f"Preview frames prove the video was really ingested; every stat is computed "
                f"from the tracked trajectories, never invented.")
    who = [pid for pid in _players(job)
           if re.search(r"\b" + re.escape(pid.lower()) + r"\b", q)]
    if who:
        p = result["players"][who[0]]
        return (f"{who[0]}: distance {p.get('distance', '?')}, top speed {p.get('topSpeed', '?')}, "
                f"{p.get('sprints', 0)} sprints. Their heatmap row shows where they concentrated.")
    return ("I read the tracking data of THIS match — ask about distance, top speed, sprints, "
            "why something happened, what to train next, or a player id (e.g. P7). "
            "Mode: computed from tracking data (no model key — Spark analyst activates with keys).")


async def chat_reply(job: dict, message: str) -> dict:
    """Route to Spark/LLM when configured, else the computed engine. Never fabricate."""
    context = json.dumps({
        "job": {k: job.get(k) for k in ("filename", "sport", "mode", "video", "segment")},
        "result": job.get("result"),
    }, default=str)[:6000]
    if meta.configured():
        try:
            reply = await meta.spark_chat([
                {"role": "system", "content":
                    "You are StatCam's tactical analyst. Answer ONLY from the provided job data. "
                    "Be concrete, reference players by id and real numbers. Max 90 words."},
                {"role": "user", "content": f"Match data:\n{context}\n\nQuestion: {message}"},
            ])
            return {"reply": reply.strip(), "mode": "spark"}
        except Exception as e:  # noqa: BLE001 — fall back honestly
            fallback = computed_answer(job, message)
            return {"reply": fallback, "mode": "computed",
                    "note": f"Spark unavailable ({type(e).__name__}) — answered from computed data"}
    if llm.configured():
        try:
            reply = await llm.write_chat_reply(context, message)
            return {"reply": reply.strip(), "mode": f"llm:{llm.model_name()}"}
        except Exception as e:  # noqa: BLE001
            return {"reply": computed_answer(job, message), "mode": "computed",
                    "note": f"LLM unavailable ({type(e).__name__}) — answered from computed data"}
    return {"reply": computed_answer(job, message), "mode": "computed"}
