"""Ingest v2 — analyze from a pasted link (direct video URL or YouTube).

Runbook rule: long videos MUST be analyzed per segment, never whole.
Direct media links stream via httpx; page links (YouTube etc.) go through
yt-dlp when installed. Every failure surfaces as an honest message.
"""
import ipaddress
import re
import shutil
import socket
import subprocess
from pathlib import Path

import httpx

MAX_BYTES = 200 * 1024 * 1024   # same cap as file upload
MAX_SEGMENT_S = 600             # analyze at most 10 minutes per job
DIRECT_EXT = {".mp4", ".mov", ".webm", ".m4v"}
YTDL_FMT = "bv*[height<=720]+ba/b[height<=720]/b"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0 Safari/537.36")


def _assert_public_host(host: str):
    """SSRF guard: refuse hosts that resolve inside the server's networks."""
    if not host:
        raise RuntimeError("no host in link")
    h = host.lower().rstrip(".")
    if h in ("localhost",) or h.endswith(".local") or h.endswith(".internal"):
        raise RuntimeError("internal host blocked")
    try:
        infos = socket.getaddrinfo(h, None)
    except socket.gaierror:
        raise RuntimeError("could not resolve the video host")
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if (ip.is_private or ip.is_loopback or ip.is_link_local
                or ip.is_reserved or ip.is_multicast or ip.is_unspecified):
            raise RuntimeError("link host resolves to an internal address — blocked")


def _check_request(request: httpx.Request):
    """httpx request hook — re-checks on every redirect hop."""
    _assert_public_host(request.url.host)


def url_host(url: str) -> str:
    m = re.match(r"https?://([^/]+)", url or "")
    return m.group(1) if m else "link"


def is_page_link(url: str) -> bool:
    host = url_host(url).lower()
    return any(host == h or host.endswith("." + h)
               for h in ("youtube.com", "youtu.be", "vimeo.com", "tiktok.com",
                         "instagram.com", "facebook.com", "drive.google.com"))


def is_direct_media(url: str) -> bool:
    return (not is_page_link(url)
            and url.split("?", 1)[0].lower().endswith(tuple(DIRECT_EXT)))


def yt_dlp_path() -> str | None:
    return shutil.which("yt-dlp")


def _download_direct(url: str, dest_dir: Path, on_progress) -> Path:
    ext = Path(url.split("?", 1)[0]).suffix.lower()
    if ext not in DIRECT_EXT:
        ext = ".mp4"
    dest = dest_dir / f"raw{ext}"
    got = 0
    last_mb = -1
    with httpx.Client(follow_redirects=True, timeout=httpx.Timeout(30, read=120),
                      headers={"User-Agent": UA},
                      event_hooks={"request": [_check_request]}) as c:
        with c.stream("GET", url) as r:
            r.raise_for_status()
            clen = int(r.headers.get("content-length") or 0)
            if clen > MAX_BYTES:
                raise RuntimeError(
                    f"video too large ({clen // (1024 * 1024)} MB, max 200 MB)")
            with dest.open("wb") as f:
                for chunk in r.iter_bytes(256 * 1024):
                    got += len(chunk)
                    if got > MAX_BYTES:
                        f.close()
                        dest.unlink(missing_ok=True)
                        raise RuntimeError("video exceeds the 200 MB limit — paste a shorter segment")
                    mb = got // (1024 * 1024)
                    if on_progress and mb != last_mb:
                        last_mb = mb
                        on_progress(mb, clen // (1024 * 1024) if clen else 0)
                    f.write(chunk)
    if got < 1024:
        dest.unlink(missing_ok=True)
        raise RuntimeError("downloaded file looks empty")
    return dest


def download_video(url: str, dest_dir: Path, on_progress=None) -> Path:
    """Download url into dest_dir, return the local file path. Sync (thread-offloaded)."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    _assert_public_host(re.match(r"https?://([^/]+)", url).group(1))
    if is_direct_media(url):
        return _download_direct(url, dest_dir, on_progress)
    ytd = yt_dlp_path()
    if not ytd:
        raise RuntimeError(
            "this looks like a page link (YouTube/social) and yt-dlp is not installed "
            "on the server — paste a direct video link (.mp4/.webm/.mov/.m4v) or upload the file")
    # YouTube bot-walls datacenter IPs; alternate player clients sometimes pass.
    attempts = ([[], ["--extractor-args", "youtube:player_client=tv_embedded,web_embedded,android_vr"]])
    proc, files = None, []
    for extra in attempts:
        proc = subprocess.run(
            [ytd, "-f", YTDL_FMT, "--no-playlist", "--no-progress",
             "--max-filesize", str(MAX_BYTES), "-o", str(dest_dir / "raw.%(ext)s"), url] + extra,
            capture_output=True, text=True, timeout=900)
        files = sorted(p for p in dest_dir.glob("raw.*") if p.is_file())
        if proc.returncode == 0 and files:
            return files[0]
    lines = [l for l in (proc.stderr or proc.stdout or "").strip().splitlines() if l.strip()]
    tail = " | ".join(lines[-2:]) if lines else "unknown yt-dlp error"
    if "not a bot" in tail.lower() or is_page_link(url):
        raise RuntimeError(
            "YouTube blocks automated downloads from server IPs ('confirm you're not a "
            "bot'). Download the video on your device and use the Upload tab, or paste a "
            "direct video link (.mp4/.webm/.mov/.m4v)")
    raise RuntimeError(f"could not download from this link — yt-dlp says: {tail}")


def cut_segment(src: Path, start: float, end: float, dest: Path) -> dict:
    """ffmpeg-cut [start, end] into dest (stream copy — cut lands on the nearest
    keyframe, good enough for per-segment analysis)."""
    dur = max(0.0, end - start)
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.2f}", "-i", str(src),
         "-t", f"{dur:.2f}", "-c", "copy", str(dest)],
        capture_output=True, text=True, timeout=300, check=True)
    if not dest.exists() or dest.stat().st_size < 1024:
        raise RuntimeError("segment cut produced an empty file")
    return {"start_s": round(start, 1), "end_s": round(end, 1),
            "length_s": round(dur, 1)}
