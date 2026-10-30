"""Generic OpenAI-compatible LLM for the codegen stage.

One adapter covers OpenAI, DeepSeek, OpenRouter, Together, Fireworks, xAI —
and Gemini via Google's OpenAI-compatible endpoint
(https://generativelanguage.googleapis.com/v1beta/openai — free tier at
aistudio.google.com). It reuses the exact contract Muse Spark is asked to
write, so testing codegen with another LLM still validates the real pipeline.

Env:
  LLM_API_KEY   — the key
  LLM_BASE_URL  — e.g. https://api.openai.com/v1 (default)
  LLM_MODEL     — e.g. gpt-4o-mini (default)
"""
import os

import httpx


def _cfg():
    return {
        "base": os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/"),
        "key": os.environ.get("LLM_API_KEY", ""),
        "model": os.environ.get("LLM_MODEL", "gpt-4o-mini"),
    }


def configured() -> bool:
    return bool(_cfg()["key"])


def model_name() -> str:
    return _cfg()["model"]


async def write_analysis_code(tracks_preview: str, meta: dict) -> str:
    """Ask the configured LLM to write the telemetry analysis script."""
    from .meta import CODEGEN_SYSTEM  # same contract Spark gets

    cfg = _cfg()
    user_msg = (
        "Write the analysis script per the system rules.\n\n"
        f"Video meta: {meta}\n\n"
        f"tracks.json preview (truncated):\n{tracks_preview}\n"
    )
    async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=30.0)) as client:
        r = await client.post(
            f"{cfg['base']}/chat/completions",
            headers={
                "Authorization": f"Bearer {cfg['key']}",
                "Content-Type": "application/json",
            },
            json={
                "model": cfg["model"],
                "messages": [
                    {"role": "system", "content": CODEGEN_SYSTEM},
                    {"role": "user", "content": user_msg},
                ],
                "max_tokens": 3000,
                "temperature": 0.2,
            },
        )
        r.raise_for_status()
        code = r.json()["choices"][0]["message"]["content"]
    code = code.strip()
    if code.startswith("```"):
        code = code.split("\n", 1)[1]
        if "```" in code:
            code = code.rsplit("```", 1)[0]
    return code.strip()


async def write_chat_reply(context: str, message: str) -> str:
    """Tactical-analyst chat over one job's data (same OpenAI-compatible contract)."""
    cfg = _cfg()
    async with httpx.AsyncClient(timeout=httpx.Timeout(90.0, connect=30.0)) as client:
        r = await client.post(
            f"{cfg['base']}/chat/completions",
            headers={
                "Authorization": f"Bearer {cfg['key']}",
                "Content-Type": "application/json",
            },
            json={
                "model": cfg["model"],
                "messages": [
                    {"role": "system", "content":
                        "You are StatCam's tactical analyst. Answer ONLY from the provided "
                        "job data. Be concrete, reference players by id and real numbers. "
                        "Max 90 words."},
                    {"role": "user", "content": f"Match data:\n{context}\n\nQuestion: {message}"},
                ],
                "max_tokens": 400,
                "temperature": 0.3,
            },
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()
