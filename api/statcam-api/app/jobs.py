"""Job store: in-memory dict mirrored to disk (data/jobs/<id>.json)."""
import json
import threading
from pathlib import Path

DATA = Path("/data")
UPLOADS = DATA / "uploads"
JOBS = DATA / "jobs"

for d in (UPLOADS, JOBS):
    d.mkdir(parents=True, exist_ok=True)

_cache: dict[str, dict] = {}
# Read-modify-write (progress/log updates) can interleave between the pipeline
# coroutine and the download-progress thread — serialize updates.
JOB_LOCK = threading.Lock()


def job_dir(job_id: str) -> Path:
    d = UPLOADS / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_job(job: dict):
    _cache[job["id"]] = job
    (JOBS / f"{job['id']}.json").write_text(json.dumps(job, default=str))


def update_job(job_id: str, **kw):
    """Locked read-modify-write — safe from progress callbacks and pipeline."""
    with JOB_LOCK:
        job = get_job(job_id)
        if not job:
            return None
        job.update(kw)
        save_job(job)
        return job


def append_log(job_id: str, stage: str, text: str, t: float):
    with JOB_LOCK:
        job = get_job(job_id)
        if not job:
            return None
        log = job.get("agent_log") or []
        log.append({"t": round(t, 1), "stage": stage, "text": text})
        job["agent_log"] = log
        save_job(job)
        return job


def get_job(job_id: str) -> dict | None:
    if job_id in _cache:
        return _cache[job_id]
    p = JOBS / f"{job_id}.json"
    if p.exists():
        job = json.loads(p.read_text())
        _cache[job_id] = job
        return job
    return None
