"""
Meta Model API adapter — SAM 3.1 (video tracking) + Muse Spark (codegen).

Base: https://api.meta.ai/v1  (Unified API surface, one auth + billing)
Auth: Bearer <META_API_KEY>

Endpoint shapes below follow Meta's documented surface; the exact SAM video
endpoint path is marked TO-VERIFY against dev.meta.ai docs once a live key is
available. All provider specifics live here so main/pipeline never change.
"""
import base64
import os
from pathlib import Path

import httpx

BASE_URL = os.environ.get("META_API_BASE", "https://api.meta.ai/v1")
SPARK_MODEL = os.environ.get("META_SPARK_MODEL", "muse-spark-1.3")
# SAM 3.1 model id on the catalog; endpoint path verified against docs at key time.
SAM_MODEL = os.environ.get("META_SAM_MODEL", "sam-3.1")

TIMEOUT = httpx.Timeout(120.0, connect=30.0)


def _api_key() -> str:
    # Read lazily so keys added at runtime (admin page) take effect immediately.
    return os.environ.get("META_API_KEY", "")


def _headers():
    return {"Authorization": f"Bearer {_api_key()}", "Content-Type": "application/json"}


def configured() -> bool:
    return bool(_api_key())


async def spark_chat(messages: list[dict], max_tokens: int = 4000) -> str:
    """Chat/completions-style call to Muse Spark. Returns assistant text."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.post(
            f"{BASE_URL}/chat/completions",
            headers=_headers(),
            json={
                "model": SPARK_MODEL,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": 0.2,
            },
        )
        r.raise_for_status()
        data = r.json()
        return data["choices"][0]["message"]["content"]


async def sam_track_video(video_path: Path, prompt: str) -> dict:
    """SAM 3.1: noun-phrase prompt -> detections + masks + identity tracks.

    Returns {"tracks": [{"id","label","frames":[{"frame","x","y","w","h"}]}], "confidence": float}.
    TO-VERIFY: exact endpoint path/payload against dev.meta.ai once keyed.
    """
    # Send the video as base64; for long videos the caller should pre-trim.
    raw = video_path.read_bytes()
    b64 = base64.b64encode(raw).decode()
    async with httpx.AsyncClient(timeout=httpx.Timeout(600.0, connect=30.0)) as client:
        r = await client.post(
            f"{BASE_URL}/sam/track",
            headers=_headers(),
            json={
                "model": SAM_MODEL,
                "input": {"video_base64": b64, "mime": "video/mp4"},
                "prompt": prompt,
            },
        )
        r.raise_for_status()
        return r.json()


CODEGEN_SYSTEM = """You write short, dependency-light Python 3 analysis scripts.
Rules:
- Read trajectories from /input/tracks.json
- Write results ONLY to /output/stats.json (create the dir if needed)
- No network, no pip installs. Standard library + numpy only.
- Output schema: {"players": [{"id": "P1", "distance_m": float, "top_speed_kmh": float,
  "sprints": int, "heatmap": [[float x 8 cols] x 3 rows]}], "confidence": float,
  "notes": str}
- distance: sum of per-frame centroid displacement, scaled by meters_per_pixel
  (provided in input meta). top_speed: max over 1-second windows. sprints:
  count of windows where speed > sprint_threshold_kmh (in meta). heatmap:
  3 rows x 8 cols normalized 0..1 occupancy grid over the frame.
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
    # Strip markdown fences if the model wrapped the code.
    code = code.strip()
    if code.startswith("```"):
        code = code.split("\n", 1)[1]
        if "```" in code:
            code = code.rsplit("```", 1)[0]
    return code.strip()
