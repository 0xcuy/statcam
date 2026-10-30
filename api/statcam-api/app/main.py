"""StatCam backend — video upload -> SAM 3.1 tracking -> Spark codegen -> E2B execute."""
import os
import threading
import time
import uuid
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse

from .jobs import UPLOADS, get_job, job_dir, save_job
from .pipeline import run_pipeline
from .providers import e2bexec, llm, meta

ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")
KEYS_FILE = Path("/data/.env")
SAVABLE_KEYS = ("META_API_KEY", "E2B_API_KEY", "LLM_API_KEY", "LLM_BASE_URL", "LLM_MODEL")

# ---- rate limiting (best-effort anti brute-force / anti disk-fill) ---------
# Real client IP: Cloudflare sets CF-Connecting-IP; Traefik appends to
# X-Forwarded-For. Loopback is exempt (smoke suite + local checks).
RATE_LOCK = threading.Lock()
RATE: dict[str, list[float]] = {}


def _client_ip(request: Request) -> str:
    cip = request.headers.get("cf-connecting-ip")
    if cip:
        return cip.strip()
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


def _loopback(ip: str) -> bool:
    return ip in ("127.0.0.1", "::1", "testclient") or ip.startswith("127.") or ip.startswith("::ffff:127.")


def _rate_limited(request: Request, bucket: str, limit: int, window_s: float) -> bool:
    ip = _client_ip(request)
    if _loopback(ip):
        return False
    now = time.time()
    with RATE_LOCK:
        hits = [t for t in RATE.get(f"{bucket}:{ip}", []) if now - t < window_s]
        hits.append(now)
        RATE[f"{bucket}:{ip}"] = hits
        glob = [t for t in RATE.get(f"{bucket}:__all__", []) if now - t < window_s]
        glob.append(now)
        RATE[f"{bucket}:__all__"] = glob
    if len(hits) > limit:
        return True
    return len(glob) > limit * 6  # cap against XFF spoof-rotation


def _keys_page(saved_msg: str) -> str:
    return KEYS_PAGE.format(
        saved_msg=saved_msg,
        meta_state="already set ✅" if meta.configured() else "mk-…",
        e2b_state="already set ✅" if e2bexec.configured() else "e2b_…",
        llm_state="already set ✅" if llm.configured() else "sk-… / AI…",
        llm_base=os.environ.get("LLM_BASE_URL", ""),
        llm_model=os.environ.get("LLM_MODEL", ""),
    )


def _load_saved_keys():
    """Restore keys previously saved via the admin page (survives restarts)."""
    if KEYS_FILE.exists():
        for line in KEYS_FILE.read_text().splitlines():
            if line.startswith(SAVABLE_KEYS):
                k, v = line.split("=", 1)
                if v.strip() and not os.environ.get(k):
                    os.environ[k] = v.strip()


_load_saved_keys()


def _live_ready() -> bool:
    return meta.configured() and e2bexec.configured()

ALLOWED_EXT = {".mp4", ".mov", ".webm", ".m4v"}
MAX_BYTES = 200 * 1024 * 1024  # 200 MB

app = FastAPI(title="StatCam API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://statcam.sieralabs.com",
        "http://localhost:3000",
        "http://localhost:3100",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


def _providers():
    return {
        "track": "sam-3.1" if meta.configured() else "synthetic",
        "codegen": "spark-1.3" if meta.configured()
                   else (f"llm:{llm.model_name()}" if llm.configured() else "mock"),
        "exec": "e2b" if e2bexec.configured() else "local",
    }


@app.get("/api/health")
def health():
    from .ingest import yt_dlp_path
    return {
        "ok": True,
        "live_ready": _live_ready(),
        "meta_configured": meta.configured(),
        "e2b_configured": e2bexec.configured(),
        # the product's LLM is Muse Spark, served by the Meta key; the generic
        # llm.* provider remains available but is not what codegen uses today
        "llm_configured": meta.configured() or llm.configured(),
        "llm_model": ("spark-1.3" if meta.configured() else (llm.model_name() if llm.configured() else None)),
        "providers": _providers(),
        "link_ingest": True,
        "yt_dlp": bool(yt_dlp_path()),
        "time": time.time(),
    }


KEYS_PAGE = """<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>StatCam — API Keys</title>
<style>
body{{font-family:-apple-system,system-ui,sans-serif;background:#090B10;color:#F3F5F8;
margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}}
.card{{background:#11141C;border:1px solid #262C3A;border-radius:20px;padding:28px;width:100%;max-width:420px}}
h1{{font-size:20px;margin:0 0 6px}}p{{color:#9CA3AF;font-size:13px;line-height:1.6}}
label{{display:block;font-size:12px;font-weight:700;margin:16px 0 6px;color:#C9D1DC}}
input{{width:100%;box-sizing:border-box;background:#090B10;border:1px solid #2E3646;color:#fff;
border-radius:12px;padding:12px;font-size:14px}}
button{{width:100%;margin-top:20px;background:#0064E0;border:0;color:#fff;font-weight:700;
border-radius:12px;padding:13px;font-size:15px}}
.ok{{background:#12331F;color:#7DE2A0;border-radius:12px;padding:10px 14px;font-size:13px;margin-top:16px}}
.err{{background:#3B1D1D;color:#FF9B9B;border-radius:12px;padding:10px 14px;font-size:13px;margin-top:16px}}
small{{color:#5B6472;font-size:11px}}
</style></head><body><div class="card">
<h1>🔑 StatCam API Keys</h1>
<p>Keys are written straight to this server's disk (<code>/data/.env</code>, root-only).
They never pass through chat or any assistant.</p>
{saved_msg}
<form method="post">
<label>Admin token</label><input type="password" name="token" autocomplete="off" required>
<label>Meta Model API key <small>(dev.meta.ai — $150 hackathon credit)</small></label>
<input type="password" name="META_API_KEY" autocomplete="off" placeholder="{meta_state}">
<label>E2B API key <small>(e2b.dev dashboard)</small></label>
<input type="password" name="E2B_API_KEY" autocomplete="off" placeholder="{e2b_state}">
<label>Other LLM key <small>(optional — for testing codegen before the Meta key arrives.
OpenAI-compatible: OpenAI, DeepSeek, OpenRouter… or Gemini free tier via
aistudio.google.com)</small></label>
<input type="password" name="LLM_API_KEY" autocomplete="off" placeholder="{llm_state}">
<label>LLM base URL</label>
<input name="LLM_BASE_URL" autocomplete="off" placeholder="https://api.openai.com/v1" value="{llm_base}">
<label>LLM model</label>
<input name="LLM_MODEL" autocomplete="off" placeholder="gpt-4o-mini" value="{llm_model}">
<button type="submit">Save keys</button>
</form></div></body></html>"""


@app.get("/admin/keys", response_class=HTMLResponse)
def keys_form(saved: int = 0):
    saved_msg = (
        '<div class="ok">✅ Keys saved.</div>' if saved else ""
    )
    return _keys_page(saved_msg)


@app.post("/admin/keys")
async def keys_save(request: Request):
    if _rate_limited(request, "keys", limit=8, window_s=900):
        raise HTTPException(429, "too many attempts — wait 15 minutes")
    form = await request.form()
    if not ADMIN_TOKEN or form.get("token") != ADMIN_TOKEN:
        return HTMLResponse(
            _keys_page('<div class="err">❌ Wrong admin token.</div>'),
            status_code=401,
        )
    lines = []
    if KEYS_FILE.exists():
        lines = [
            l for l in KEYS_FILE.read_text().splitlines()
            if not l.startswith(SAVABLE_KEYS)
        ]
    for k in SAVABLE_KEYS:
        v = (form.get(k) or "").strip()
        if v:
            os.environ[k] = v
            lines.append(f"{k}={v}")
    KEYS_FILE.write_text("\n".join(lines) + "\n")
    os.chmod(KEYS_FILE, 0o600)
    return RedirectResponse("/admin/keys?saved=1", status_code=303)


@app.post("/api/jobs")
async def create_job(
    request: Request,
    background_tasks: BackgroundTasks,
    video: UploadFile | None = File(None),
    sport: str = Form("soccer"),
    prompt: str = Form("track players and the ball"),
    debug: bool = Form(False),
    source_url: str = Form(""),
    seg_start: float = Form(0.0),
    seg_end: float = Form(0.0),
):
    if _rate_limited(request, "jobs", limit=12, window_s=300):
        raise HTTPException(429, "too many analyses from this address — wait 5 minutes")
    if video is None and not source_url.strip():
        raise HTTPException(400, "provide a video file or source_url")
    if video is not None and source_url.strip():
        raise HTTPException(400, "provide either a video file or source_url, not both")

    job_id = uuid.uuid4().hex[:12]
    d = job_dir(job_id)
    job = {
        "id": job_id,
        "status": "queued",
        "stage": "ingest",
        "progress": 0,
        "mode": "queued",  # pipeline computes the real mode from providers
        "debug": debug,
        "sport": sport,
        "prompt": prompt,
        "created_at": time.time(),
        "message": "Queued",
    }
    if video is not None:
        ext = Path(video.filename or "").suffix.lower()
        if ext not in ALLOWED_EXT:
            raise HTTPException(400, f"unsupported file type {ext or '?'} — use mp4/mov/webm")
        body = await video.read()
        if len(body) > MAX_BYTES:
            raise HTTPException(413, "video too large (max 200 MB)")
        if len(body) < 1024:
            raise HTTPException(400, "file looks empty")
        src = d / f"source{ext}"
        src.write_bytes(body)
        job.update({"filename": video.filename, "source_path": str(src)})
    else:
        from .ingest import url_host
        url = source_url.strip()
        if not url.lower().startswith(("http://", "https://")) or len(url) > 2048:
            raise HTTPException(400, "source_url must be an http(s) link")
        job.update({
            "source_url": url,
            "filename": f"link · {url_host(url)}",
            "seg_start": max(0.0, float(seg_start)),
            "seg_end": max(0.0, float(seg_end)),
            "message": "Queued — link will be downloaded",
        })

    save_job(job)
    background_tasks.add_task(run_pipeline, job_id)
    return {"job_id": job_id, "mode": job["mode"]}


@app.get("/api/jobs/{job_id}")
def job_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    # Don't leak the absolute source path to clients.
    view = dict(job)
    view.pop("source_path", None)
    return view


@app.get("/api/jobs/{job_id}/result")
def job_result(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if job.get("status") != "done" or "result" not in job:
        raise HTTPException(409, f"result not ready (status={job.get('status')})")
    return job["result"]


@app.post("/api/jobs/{job_id}/chat")
async def job_chat(job_id: str, request: Request):
    """Tanya Analisnya — ask the analyst about THIS match's tracking data."""
    from . import chat as chat_engine
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if job.get("status") != "done":
        raise HTTPException(409, f"analysis not ready (status={job.get('status')})")
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, "JSON body required")
    message = str(body.get("message") or "")[:1000]
    if not message.strip():
        raise HTTPException(400, "message required")
    return await chat_engine.chat_reply(job, message)


@app.post("/api/jobs/{job_id}/moments")
async def job_moments(job_id: str, request: Request):
    """Cari Momen — natural-language search over this match's tracking data."""
    from . import insights
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if job.get("status") != "done":
        raise HTTPException(409, f"analysis not ready (status={job.get('status')})")
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, "JSON body required")
    return insights.search_moments(job, str(body.get("query") or ""))


@app.get("/api/jobs/{job_id}/clip")
def job_clip(job_id: str, start: float = 0.0, end: float = 5.0):
    """Auto-cut highlight clip from the analyzed source video."""
    from fastapi.responses import FileResponse

    from . import insights
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if job.get("status") != "done":
        raise HTTPException(409, f"analysis not ready (status={job.get('status')})")
    try:
        path = insights.moment_clip(job, start, end)
    except ValueError as e:
        raise HTTPException(400, str(e))
    return FileResponse(path, media_type="video/mp4",
                        filename=f"statcam_{job_id}_{int(start)}s_{int(end)}s.mp4")


@app.get("/api/jobs/{job_id}/card")
def job_card(job_id: str, start: float | None = None, end: float | None = None):
    """Shareable SVG report card (whole match or one moment window)."""
    from fastapi.responses import Response

    from . import insights
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if job.get("status") != "done":
        raise HTTPException(409, f"analysis not ready (status={job.get('status')})")
    if start is None or end is None:
        m = insights.search_moments(job, "")["moments"][0]
    else:
        tracks = insights._load_tracks(job)
        m = insights._window_metrics(tracks, float(start), float(end))
        m["start_s"], m["end_s"] = round(float(start), 1), round(float(end), 1)
        m["label"], m["description"] = "Moment report", ""
    svg = insights.moment_card_svg(job, m)
    return Response(svg, media_type="image/svg+xml")


@app.get("/api/jobs/{job_id}/plan")
def job_plan(job_id: str):
    """Rencana Latihan — weekly training plan from this match's weaknesses."""
    from . import insights
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if job.get("status") != "done":
        raise HTTPException(409, f"analysis not ready (status={job.get('status')})")
    try:
        return insights.training_plan(job)
    except ValueError as e:
        raise HTTPException(409, str(e))


@app.get("/api/jobs/{job_id}/whisper")
def job_whisper(job_id: str, t: float = 0.0):
    """Live-replay tactical whisper at replay time t (honest, computed)."""
    from . import insights
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if job.get("status") != "done":
        raise HTTPException(409, f"analysis not ready (status={job.get('status')})")
    return insights.whisper(job, t)


@app.get("/api/jobs/{job_id}/video")
def job_video(job_id: str):
    """The analyzed segment video (live replay source)."""
    from fastapi.responses import FileResponse

    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if job.get("status") != "done":
        raise HTTPException(409, f"analysis not ready (status={job.get('status')})")
    src = Path(job["source_path"])
    if not src.exists():
        raise HTTPException(404, "source video not available")
    return FileResponse(src, media_type="video/mp4", filename=f"statcam_{job_id}.mp4")


@app.get("/api/jobs/{job_id}/code")
def job_code(job_id: str):
    """The analysis script for this job — handy when debugging the pipeline."""
    from fastapi.responses import PlainTextResponse

    p = job_dir(job_id) / "analysis.py"
    if not p.exists():
        raise HTTPException(404, "code not available yet")
    return PlainTextResponse(p.read_text())


@app.get("/api/jobs/{job_id}/preview/{n}")
def job_preview(job_id: str, n: int):
    """One extracted preview frame (proves the video was really ingested)."""
    from fastapi.responses import FileResponse

    p = job_dir(job_id) / "frames" / f"f_{n:04d}.jpg"
    if not p.exists():
        raise HTTPException(404, "preview not available")
    return FileResponse(p, media_type="image/jpeg")
