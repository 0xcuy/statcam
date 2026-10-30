#!/usr/bin/env python3
"""Bake a verified live job into web-tierA/data-8.js as one sport's demo entry.

Sample/demo mode is fully client-side (zero API calls for judges), so every
demo sport needs a baked snapshot of a REAL verified run: agent log, result,
moments, plan, whispers and chat Q&As. This tool pulls all of it from the live
API for one finished job and replaces that sport's entry in data-8.js.

Usage:
  python3 tools/bake_demo_data.py JOB_ID SPORT --video samples/demo-x.mp4 \
      --provenance "..." [--base https://api.statcam.sieralabs.com]
"""
import argparse
import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "web-tierA" / "data-8.js"
CHAT_QS = [
    "Who was the fastest player?",
    "Who worked the hardest?",
    "What should we train this week?",
]


def get(base, path):
    with urllib.request.urlopen(base + path, timeout=60) as r:
        return json.load(r)


def post(base, path, body):
    req = urllib.request.Request(base + path, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("job_id")
    ap.add_argument("sport", choices=["soccer", "basketball", "running"])
    ap.add_argument("--video", default="")
    ap.add_argument("--provenance", default="")
    ap.add_argument("--badge-suffix", default="")
    ap.add_argument("--whispers-only", action="store_true",
                    help="refresh only the whispers array of the existing entry")
    ap.add_argument("--base", default="https://api.statcam.sieralabs.com")
    args = ap.parse_args()
    base = args.base.rstrip("/")

    job = get(base, f"/api/jobs/{args.job_id}")
    if job.get("status") != "done":
        print(f"job status = {job.get('status')} — run it to completion first", file=sys.stderr)
        return 1
    result = get(base, f"/api/jobs/{args.job_id}/result")
    try:
        mres = post(base, f"/api/jobs/{args.job_id}/moments",
                    {"query": "fastest bursts and key windows"})
        moments = (mres.get("moments") or [])[:3]
    except Exception as exc:  # noqa: BLE001 — moments are a demo garnish, never fatal
        print(f"moments unavailable ({exc}) — baking empty", file=sys.stderr)
        moments = []
    plan = get(base, f"/api/jobs/{args.job_id}/plan")
    chat = []
    for q in CHAT_QS:
        try:
            a = post(base, f"/api/jobs/{args.job_id}/chat", {"message": q})
            chat.append({"q": q, "a": str(a.get("reply", "")).strip(),
                         "mode": str(a.get("mode", "spark"))})
        except Exception as exc:  # noqa: BLE001
            print(f"chat '{q}' failed ({exc})", file=sys.stderr)
    dur = float(str(result.get("duration", "01:00")).replace(":", "")) if False else None
    # whispers: one every ~6 s across the known segment length (60 s default)
    whispers = []
    for t in range(0, 60, 6):
        try:
            w = get(base, f"/api/jobs/{args.job_id}/whisper?t={t}")
            whispers.append({"t": float(t), "text": str(w.get("text", "")).strip()})
        except Exception as exc:  # noqa: BLE001
            print(f"whisper t={t} failed ({exc})", file=sys.stderr)

    if args.whispers_only:
        src = DATA.read_text(encoding="utf-8")
        data = json.loads(src[src.find("{"): src.rfind("}") + 1])
        data[args.sport]["whispers"] = whispers
        body = json.dumps(data, ensure_ascii=False, indent=1)
        DATA.write_text("window.SAMPLE_DATA = " + body + ";\n", encoding="utf-8")
        json.loads(DATA.read_text().split("=", 1)[1].rsplit(";", 1)[0])
        print(f"whispers-only {args.sport} <- job {args.job_id}: {len(whispers)} whispers")
        return 0

    entry = {
        "_provenance": args.provenance,
        "job": {"id": args.job_id, "agent_log": job.get("agent_log", [])},
        "result": result,
        "moments": moments,
        "plan": plan,
        "chat": chat,
        "whispers": whispers,
        "video": args.video,
        "cardFile": f"sample-card-{args.sport}.svg",
    }
    if args.badge_suffix:
        entry["badgeSuffix"] = args.badge_suffix

    src = DATA.read_text(encoding="utf-8")
    data = json.loads(src[src.find("{"): src.rfind("}") + 1])
    data[args.sport] = entry
    body = json.dumps(data, ensure_ascii=False, indent=1)
    DATA.write_text("window.SAMPLE_DATA = " + body + ";\n", encoding="utf-8")
    json.loads(DATA.read_text().split("=", 1)[1].rsplit(";", 1)[0])
    print(f"baked {args.sport} <- job {args.job_id}: "
          f"{len(whispers)} whispers, {len(moments)} moments, {len(chat)} chats")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
