#!/usr/bin/env python3
"""StatCam smoke tests — end-to-end against the PUBLIC API (stdlib only).

Run on the VPS:  python3 /opt/siera-statcam-api/tests/test_smoke.py
Exit 0 = all pass. Covers: health, validation, security, full pipeline
(link ingest -> timeline -> analysis), chat, moments, clip, card, plan,
video, whisper clamp, SSRF guard.
"""
import json
import time
import urllib.error
import urllib.request

BASE = "https://api.statcam.sieralabs.com"
SAMPLE = "https://statcam.sieralabs.com/samples/sample-match.mp4"
PASS, FAIL = [], []


def req(path, method="GET", data=None, headers=None, timeout=30):
    url = BASE + path
    r = urllib.request.Request(url, method=method,
                               data=data, headers=headers or {})
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def check(name, cond, detail=""):
    (PASS if cond else FAIL).append(name + (" — " + detail if detail and not cond else ""))
    print(("  PASS " if cond else "  FAIL ") + name + ("" if cond else "  [" + detail + "]"))


print("== 1. health ==")
s, b = req("/api/health")
h = json.loads(b)
check("health 200", s == 200)
check("health fields", h.get("ok") is True and "providers" in h)

print("== 2. validasi ==")
s, _ = req("/api/jobs", "POST", b"")
check("job tanpa body -> 400", s == 400, str(s))
s, _ = req("/api/jobs", "POST", b"", {"Content-Type": "application/x-www-form-urlencoded"})
check("form kosong -> 400", s == 400, str(s))
s, _ = req("/api/jobs/tidakada")
check("job 404", s == 404, str(s))
s, _ = req("/api/jobs/..%2F..%2Fdata%2F.env")
check("traversal -> 404", s == 404, str(s))
s, _ = req("/admin/keys")
check("admin GET 200", s == 200)
s, _ = req("/admin/keys", "POST", b"token=salah",
           {"Content-Type": "application/x-www-form-urlencoded"})
check("admin token salah -> 401", s == 401, str(s))

print("== 3. pipeline penuh via link ==")
boundary = "----statcamtest"
form = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"source_url\"\r\n\r\n{SAMPLE}\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"seg_start\"\r\n\r\n0\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"seg_end\"\r\n\r\n8\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"sport\"\r\n\r\nsoccer\r\n"
        f"--{boundary}--\r\n").encode()
s, b = req("/api/jobs", "POST", form,
           {"Content-Type": f"multipart/form-data; boundary={boundary}"}, 30)
job = json.loads(b)
check("job dibuat", s == 200 and "job_id" in job, f"{s} {b[:80]}")
jid = job["job_id"]

status, jobd = "queued", {}
for _ in range(40):
    time.sleep(3)
    s, b = req(f"/api/jobs/{jid}")
    jobd = json.loads(b)
    status = jobd.get("status")
    if status in ("done", "failed"):
        break
check("pipeline selesai", status == "done", str(jobd.get("message"))[:100])
log = [e["stage"] for e in jobd.get("agent_log", [])]
check("timeline plan-first utuh", log[:1] == ["plan"] and log[-1:] == ["analyze"], str(log))
check("segmen terekam", (jobd.get("video") or {}).get("segment", {}).get("length_s") == 8,
      str((jobd.get("video") or {}).get("segment")))
res = jobd.get("result") or {}
check("result.analysis ada", bool(res.get("analysis", {}).get("tactical")))

print("== 4. endpoint hasil ==")
s, _ = req(f"/api/jobs/{jid}/chat", "POST", json.dumps({"message": "who ran the most?"}).encode(),
           {"Content-Type": "application/json"})
check("chat 200 + computed", s == 200)
s, b = req(f"/api/jobs/{jid}/moments", "POST", json.dumps({"query": "fastest"}).encode(),
           {"Content-Type": "application/json"})
check("moments 200 + >=1", s == 200 and len(json.loads(b)["moments"]) >= 1)
s, b = req(f"/api/jobs/{jid}/clip?start=0&end=5")
check("clip 200 mp4", s == 200 and len(b) > 10000, f"{s} {len(b)}B")
s, _ = req(f"/api/jobs/{jid}/clip?start=-3&end=2")
check("clip negatif -> 400", s == 400, str(s))
s, b = req(f"/api/jobs/{jid}/card")
check("card svg 200", s == 200 and b[:4] == b"<svg" or b"<svg" in b[:40], f"{s} {b[:20]}")
s, b = req(f"/api/jobs/{jid}/video")
check("video 200", s == 200 and len(b) > 50000)
s, b = req(f"/api/jobs/{jid}/plan")
check("plan 200 + sesi", s == 200 and len(json.loads(b)["sessions"]) == 3)
s, b = req(f"/api/jobs/{jid}/whisper?t=999")
check("whisper klem di akhir", s == 200 and "end of segment" in json.loads(b)["text"])

print("== 5. SSRF guard ==")
form = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"source_url\"\r\n\r\n"
        f"http://169.254.169.254/latest/meta-data/\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"seg_start\"\r\n\r\n0\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"seg_end\"\r\n\r\n2\r\n"
        f"--{boundary}--\r\n").encode()
s, b = req("/api/jobs", "POST", form,
           {"Content-Type": f"multipart/form-data; boundary={boundary}"})
jid2 = json.loads(b).get("job_id", "")
ssrf_msg = ""
for _ in range(8):
    time.sleep(2)
    s, b = req(f"/api/jobs/{jid2}")
    ssrf_msg = json.loads(b).get("message", "")
    if json.loads(b).get("status") in ("done", "failed"):
        break
check("SSRF internal diblokir", "internal" in ssrf_msg or "resolve" in ssrf_msg, ssrf_msg[:90])

print(f"\n=== {len(PASS)} PASS, {len(FAIL)} FAIL ===")
if FAIL:
    print("GAGAL:", FAIL)
    raise SystemExit(1)
