"""
E2B sandbox execution for Spark-generated analysis code.

The generated script reads /input/tracks.json and must write /output/stats.json.
We upload tracks.json, run the code, then download stats.json.
"""
import json
import os
from pathlib import Path

def _api_key() -> str:
    # Read lazily so keys added at runtime (admin page) take effect immediately.
    return os.environ.get("E2B_API_KEY", "")


def configured() -> bool:
    return bool(_api_key())


def run_analysis(code: str, tracks: dict, timeout_s: int = 120) -> dict:
    """Execute analysis code in an isolated E2B sandbox. Returns parsed stats.json."""
    from e2b_code_interpreter import Sandbox

    with Sandbox(api_key=_api_key(), timeout=timeout_s) as sbx:
        sbx.files.write("/input/tracks.json", json.dumps(tracks))
        sbx.files.make_dir("/output")
        result = sbx.run_code(code)
        if result.error:
            raise RuntimeError(
                f"sandbox error: {result.error.name}: {result.error.value}\n"
                f"{result.error.traceback or ''}"
            )
        raw = sbx.files.read("/output/stats.json")
    if isinstance(raw, bytes):
        raw = raw.decode()
    stats = json.loads(raw)
    if "players" not in stats:
        raise RuntimeError("stats.json missing 'players'")
    return stats
