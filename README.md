<p align="center">
  <a href="https://statcam.sieralabs.com"><img src="web-tierA/samples/sample-card-soccer.svg" width="100%" alt="StatCam. Broadcast-grade sports analytics from ordinary footage. A Meta SAM 3.1 tracker follows every player and the ball, Muse Spark writes the analysis code, and a sandbox executes it. Live at statcam.sieralabs.com."></a>
</p>

<h1 align="center">StatCam</h1>

<p align="center">
  <b>Broadcast-grade sports analytics from ordinary footage.</b><br>
  Upload a match video or paste a link, and a three-stage pipeline runs: SAM 3.1 tracks every player and the ball frame by frame, Muse Spark writes the analysis code for the sport it sees, and a sandboxed runtime executes that code into KPIs, tactical reads and shareable report cards. Every stage says exactly what it did — including when it fell back.
</p>

<p align="center">
  <a href="https://statcam.sieralabs.com"><img alt="Live at statcam.sieralabs.com" src="https://img.shields.io/badge/live-statcam.sieralabs.com-7c3aed?style=flat-square&labelColor=17120d"></a>
  <a href="#how-a-job-works"><img alt="SAM 3.1 vision tracking" src="https://img.shields.io/badge/Meta-SAM_3.1-7c3aed?style=flat-square&labelColor=17120d"></a>
  <a href="#how-a-job-works"><img alt="Muse Spark match intelligence" src="https://img.shields.io/badge/Meta-Muse_Spark-7c3aed?style=flat-square&labelColor=17120d"></a>
  <a href="#honest-fallbacks"><img alt="Every degradation labeled" src="https://img.shields.io/badge/fallbacks-honest_and_labeled-10b981?style=flat-square&labelColor=17120d"></a>
  <a href="#honest-status"><img alt="22 of 22 smoke checks pass" src="https://img.shields.io/badge/smoke-22%2F22_pass-10b981?style=flat-square&labelColor=17120d"></a>
  <a href="LICENSE"><img alt="License MIT" src="https://img.shields.io/badge/license-MIT-5b5566?style=flat-square&labelColor=17120d"></a>
</p>

<p align="center">
  <a href="https://statcam.sieralabs.com"><b>statcam.sieralabs.com</b></a> ·
  <a href="https://statcam.sieralabs.com/#sample">Demos</a> ·
  <a href="#start-here">Start here</a> ·
  <a href="#api-reference">API</a> ·
  <a href="#security">Security</a> ·
  <a href="#local-development">Local development</a>
</p>

<p align="center"><sub>
  <a href="#the-loop">The loop</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#start-here">Start here</a> ·
  <a href="#how-a-job-works">How a job works</a> ·
  <a href="#honest-fallbacks">Honest fallbacks</a> ·
  <a href="#inside-one-verified-job">Inside one verified job</a> ·
  <a href="#api-reference">API reference</a> ·
  <a href="#honest-status">Honest status</a> ·
  <a href="#security">Security</a> ·
  <a href="#local-development">Local development</a> ·
  <a href="#repository-layout">Repository layout</a>
</sub></p>

---

## The loop

| | What happens | Where you can check it |
| --- | --- | --- |
| **Ingest** | A file upload or a public URL becomes a job. A segment window (`seg_start`/`seg_end`) bounds the analysis, so a full match costs minutes of video, not hours. | `POST /api/jobs` answers `{job_id, mode: "queued"}` |
| **Track** | Frames go to **Meta SAM 3.1** concept tracking with one noun phrase ("soccer player"), and the per-frame box/mask token stream is parsed into a 30 fps track table for every player and the ball. | `agent_log` stage `track` names the provider and the object count |
| **Codegen** | The track table plus the sport go to **Muse Spark**, which writes a Python analysis script to the pipeline's contract: 30 fps, meters, tracked-center coordinates. | `GET /api/jobs/{id}/code` returns the exact script that ran |
| **Execute** | The script runs in an **E2B sandbox**. KPIs — distance, top speed, sprints, thirds of the pitch — come from that execution, not from a template. | `pipeline.exec` reads `e2b` or `local` |
| **Read out** | Dashboard, live chat about the job, highlight moments, a shareable SVG card, and a plan of the next drill. | the endpoints under [API reference](#api-reference) |

There is no signup and no login. The landing page is the application, and the three demo buttons replay verified runs on real footage — soccer, basketball and running — with the mode label telling you which.

---

## Architecture

```mermaid
graph TD
    U([Browser<br/>statcam.sieralabs.com]) -->|upload or URL<br/>+ sport + segment| API[FastAPI<br/>nginx + Cloudflare in front]

    API -->|1. frames<br/>one noun-phrase concept| SAM["Meta SAM 3.1<br/>POST /v1/responses<br/>per-frame box + mask tokens"]
    API -->|2. track table + sport<br/>write code to a fixed contract| Spark["Muse Spark 1.3<br/>POST /v1/chat/completions<br/>reasoning model"]
    API -->|3. run that script<br/>KPIs come from execution| E2B["E2B sandbox<br/>Python runtime"]

    SAM -->|30 fps track table,<br/>players + ball| Spark
    Spark -->|analysis.py,<br/>compile()-validated| E2B
    E2B -->|KPIs, tactical reads,<br/>sprint episodes| API
    API -->|dashboard · chat · moments<br/>plan · whisper · SVG card| U
```

Three ways in, one pipeline. People use the web app in a browser; any HTTP client drives the same job lifecycle through the API; the demo buttons replay recorded verified runs client-side with a `VERIFIED RUN · REPLAY` label so a judge is never looking at an unlabeled recording.

> [!NOTE]
> **What we run, and what we don't.** The web app (vanilla static, [`web-tierA/`](web-tierA/)) and the FastAPI job orchestrator ([`api/`](api/)) are ours, on our own server. The models belong to Meta: SAM 3.1 does the tracking and Muse Spark does the codegen, reached through one Meta API key. The sandbox belongs to E2B, with a local runner as its fallback. No third-party service ever receives a user's identity, because there is none to receive: no accounts exist.

---

## Start here

<table>
  <tr>
    <td width="33%" valign="top">
      <img src="docs/icons/globe.svg" width="24" height="24" alt=""><br>
      <b>In a browser</b><br>
      <sub>Three demo buttons replay verified runs on real footage with audio and a live tracking overlay. Your own video or link runs the full pipeline.</sub><br>
      <a href="https://statcam.sieralabs.com">Open StatCam →</a>
    </td>
    <td width="33%" valign="top">
      <img src="docs/icons/terminal.svg" width="24" height="24" alt=""><br>
      <b>From the API</b><br>
      <sub>One POST creates a job, one GET polls it, one GET returns the analysis code Spark wrote. No account, no key needed to submit.</sub><br>
      <a href="#api-reference">API reference →</a>
    </td>
    <td width="33%" valign="top">
      <img src="docs/icons/list-checks.svg" width="24" height="24" alt=""><br>
      <b>By reading the log</b><br>
      <sub>Every job carries an <code>agent_log</code>: what each stage claimed, which provider ran, and which fallback fired. The UI renders it verbatim above the KPIs.</sub><br>
      <a href="#honest-fallbacks">Honest fallbacks →</a>
    </td>
  </tr>
</table>

---

## How a job works

The interesting engineering is all in the seams between the three model calls.

**Tracking (SAM 3.1).** The tracker is called with `POST /v1/responses`: a single user message containing one `input_text` part — a noun phrase, not a prompt — followed by the `input_video` part as a base64 data URL. The response is a stream of special tokens, one box and mask per matched object per frame (`<|box;x1=…;y1=…;x2=…;y2=…|>`), and an empty response means zero matches, which the pipeline treats as a result, not an error.

Three findings from running it against real footage shaped the adapter ([`app/providers/meta.py`](api/statcam-api/app/providers/meta.py)):

- **Concepts are content-dependent.** On a 720p Premier League clip, `soccer player` returns 16 objects at 88% frame coverage while `person` returns 1–3. On an amateur sideline clip it inverts: `soccer player` returns nothing and `person` works. So the adapter walks a concept chain (`META_PLAYER_CONCEPTS`, default `soccer player,person`) and keeps the first concept that yields ≥6 objects. The same clip at 640p drops to 4.2% coverage, so frames are never downscaled before tracking.
- **Identities switch, and the data shows it.** A re-association between two adjacent boxes appears as a physically impossible jump. Steps faster than 11 m/s are dropped from a player's path (the worst observed switch implied 302 m/s), which is what keeps distances honest.
- **Crowd members track fine and mean nothing.** Objects whose median area is under 25% of the largest object's are pruned, capped at 14 tracks, because the broadcast camera's zoom changes what "small" means and a fixed pixel threshold lies.

The ball is tracked like any other object and then **excluded from player KPIs** at the pipeline level — the ball travels 10+ km over a match and would win every leaderboard otherwise.

**Codegen (Muse Spark).** Spark 1.3 is a reasoning model, which shows in two ways the adapter handles: under a tight token budget it spends everything reasoning and returns `content: null`, so the call retries with a 4× budget; and it likes to write a friendly paragraph before the script, so the extraction layer takes the largest fenced block, falls back to the first code-like line, and validates the result with `compile()` before anything is executed. The generated code is written against a fixed contract — `fps: 30.0`, `x,y` as the tracked center point in meters (never re-scaled by frame width), sprint episodes counted on rising edges — so a different model could be swapped in and the outputs would still be comparable.

**Execution (E2B).** The sandbox runs Spark's script. Distances and speeds are physical because the adapter converts pixels to meters once, up front, from the configured visible width (`META_VISIBLE_WIDTH_M`, default 60 m for a broadcast wide shot) — and then deliberately hands the codegen a coordinate system where `meters_per_pixel: 1.0`, so the model has no unit conversion to get wrong.

---

## Honest fallbacks

The failure mode this project refuses is silent degradation: a pipeline that shows plausible numbers after its model call failed is worse than one that shows an error. So every stage has a named fallback, and the fallback is part of the result, not a hidden retry.

| Stage | Fallback | What the result says |
| --- | --- | --- |
| Tracking fails or finds 0 objects | `synthetic-fallback` | `pipeline.track: synthetic`; KPIs render against simulated motion, labeled in the UI and the card |
| Spark fails or writes invalid code | `mock-fallback` | `pipeline.codegen: mock`; a bundled analysis script runs, and the agent log says codegen fell back |
| E2B unavailable | `local-fallback` | `pipeline.exec: local`; the same script executes locally, honestly relabeled |

Each fallback is logged in the job's `agent_log` as its own stage entry, the mode chip stays truthful, and the share card prints the pipeline's real lineage — `LIVE · SAM 3.1 + SPARK` only when all three stages genuinely ran their providers. The 22-check smoke suite ([`tests/`](tests/)) exercises every fallback path, including the 0-object tracking case, and passed 22/22 against the live-configured deployment on 2026-10-31.

> [!TIP]
> Read `pipeline` on any job result before reading its KPIs. It is the job's own answer to "how were these numbers produced", and it is designed to be checked rather than trusted.

---

## Inside one verified job

The numbers below come from the live pipeline, not from a mock: a 20-second clip of a real amateur match, uploaded through the public site on 2026-10-31.

| Stage | What happened |
| --- | --- |
| Track (SAM 3.1) | 6–10 objects tracked, 94% frame coverage, concept chain resolved on the first candidate |
| Codegen (Muse Spark) | analysis script returned and `compile()`-validated; sandbox executed it |
| Execute (E2B) | KPIs produced from the script: top distance 0.1 km, top speed 39.5 km/h, 6 sprint episodes — physically plausible for a 20-second window |
| Read out | dashboard, moments, plan and chat all served from the same job result |

The three demo replays on the landing page are baked from this same verified-run lineage (demo job `20b56885d430`: 0.2 km, 32.5 km/h, 31 sprints over its window), each on real sport footage with audio, and each labeled `DEMO <SPORT> · REAL FOOTAGE · VERIFIED RUN`. The hero section draws SAM 3.1's actual tracking output — player boxes, ball trail, sprint callouts — as a transparent canvas synced to the underlying match video's `currentTime`, with camera-cut detection clearing boxes on scene changes rather than letting them float over new frames.

---

## API reference

Base URL: `https://statcam.sieralabs.com`. No authentication is needed for the public surface; admin key management is token-gated and rate-limited (see [Security](#security)).

| Method | Path | What it does |
| --- | --- | --- |
| `POST` | `/api/jobs` | Create a job: multipart file or `source_url`, `sport`, optional `seg_start`/`seg_end`. Answers `{job_id, mode}` |
| `GET` | `/api/jobs/{id}` | Full job state: `agent_log`, `progress`, `result` |
| `GET` | `/api/jobs/{id}/result` | KPIs, per-player stats, tactical analysis, `pipeline` lineage |
| `POST` | `/api/jobs/{id}/chat` | Ask a question about this job; answers are computed from its own data |
| `GET` | `/api/jobs/{id}/moments` | Highlight windows selected from the tracking and KPI data |
| `GET` | `/api/jobs/{id}/clip` | The source clip for a moment |
| `GET` | `/api/jobs/{id}/card` | Shareable SVG report card |
| `GET` | `/api/jobs/{id}/plan` | Training-plan suggestions derived from the KPIs |
| `GET` | `/api/jobs/{id}/whisper?t=` | Short tactical whisper at a timeline position |
| `GET` | `/api/jobs/{id}/video` | The annotated output video |
| `GET` | `/api/jobs/{id}/code` | The exact analysis script that executed |
| `GET` | `/api/health` | Provider status and mode (`LIVE` vs `DEMO MODE · NO API KEYS`) |
| `GET`/`POST` | `/admin/keys` | Key management (admin token; never returns key values) |

---

## Honest status

What works, and exactly what that means, read from the live deployment on 2026-10-31. 🟢 live · 🟡 live, with a gap the row names.

| Component | State | In one line |
| --- | --- | --- |
| Full pipeline on real footage | 🟢 **Live and verified** | SAM 3.1 → Spark → E2B ran end to end on an uploaded amateur match; KPIs physically plausible; smoke 22/22 in the live era. |
| Three-sport demos | 🟢 **Live** | Soccer, basketball and running: real footage, audio, verified-run replays, auto-opening video above the results. |
| Hero tracking overlay | 🟢 **Live** | Real SAM 3.1 tracks drawn over real match footage, synced to `currentTime`, camera-cut aware. |
| Honest fallbacks | 🟢 **Live on all three stages** | Every degradation labeled; fallback paths covered by smoke tests. |
| Chat / moments / plan / whisper | 🟢 **Live** | All computed from the job's own result; demo replays serve them from the baked verified run. |
| Basketball demo lineage | 🟡 **Real footage, synthetic track** | The basketball clip's tracking came back unusable, so that demo honestly runs the `synthetic-fallback` label on real footage — the label is visible, the limitation is stated here too. |
| YouTube source URLs | 🟡 **Constrained by YouTube, not by us** | Datacenter fetches hit YouTube's bot wall ("confirm you're not a bot"); direct file URLs and uploads work. |
| Account system | 🟢 **Deliberately absent** | No signup, no login, nothing to leak; jobs are anonymous by design. |
| MCP server | 🟡 **Planned** | An MCP wrapper over the job API is scoped as an optional bonus; the HTTP surface above is the complete public contract today. |

---

## Security

> [!IMPORTANT]
> Model provider keys are **never** in this repository — not in the tree, not in history, not in the demo data. They live in the deployment's environment file and in a local gitignored [`secrets/`](secrets/README.md) directory whose committed contents are SHA-256 fingerprints only. Keys that have passed through chat are rotated after use.

- **Rate limiting** on the two endpoints worth abusing: key submission is capped at 8 requests per 15 minutes per IP (brute-forcing an admin token is not a matter of patience), and job creation at 12 per 5 minutes per IP with a global cap (disk-fill is the cheap attack on any upload service). Loopback is exempt for local development.
- **Headers**: a strict Content-Security-Policy (`default-src 'self'`, no inline scripts, no framing), `X-Content-Type-Options`, `X-Frame-Options` and `Referrer-Policy` on both the web app and the API.
- **Key handling in the app**: the admin key endpoint stores and masks; responses never contain key values, and error paths were audited against echoing them.
- **Client IP resolution** prefers the platform's `CF-Connecting-IP`, then the last `X-Forwarded-For` entry, then the socket address, so the limiter cannot be trivially reset by header spoofing.

Please report a vulnerability privately rather than in a public issue.

---

## Local development

```bash
git clone https://github.com/0xcuy/statcam.git
cd statcam/api/statcam-api
pip install -r requirements.txt
uvicorn app.main:app --port 8010            # API on http://localhost:8010

cd ../../web-tierA && python3 -m http.server 8090   # web app on http://localhost:8090
```

Without provider keys the app is deliberately unglamorous and fully functional: `/api/health` reports `DEMO MODE · NO API KEYS`, and jobs run the labeled fallback chain (`synthetic-fallback`, `mock-fallback`, `local-fallback`) so the whole UX is testable at zero cost. Keys go in the environment, never in the repo:

```bash
META_API_KEY=...     # one Meta key covers SAM 3.1 and Muse Spark
E2B_API_KEY=...      # optional; absence falls back to local execution, labeled
ADMIN_TOKEN=...      # gates /admin/keys
```

The API is also containerized (`api/statcam-api/Dockerfile`), and the web tier ships its own nginx config with the security headers above (`web-tierA/nginx-default.conf`, built by [`web.Dockerfile`](web.Dockerfile)).

The smoke suite runs against a running instance:

```bash
python3 tests/test_smoke.py                 # 22 checks, all fallback paths included
```

---

## Repository layout

| Path | What lives there |
| --- | --- |
| [`web-tierA/`](web-tierA/) | The shipped frontend: vanilla static HTML/CSS/JS, dark broadcast theme, hero tracking overlay, three demo replays, no build step |
| [`api/statcam-api/`](api/statcam-api/) | The FastAPI orchestrator: job lifecycle, Meta SAM 3.1 + Spark adapters, E2B runner, honest fallback chain, rate limiting |
| [`tests/`](tests/) | Smoke suite (22 checks) covering live, fallback and edge paths |
| [`tools/`](tools/) | Asset tooling, including the simulated-tracking-view generator used for fallback visuals |
| [`web/`](web/) | The original React frontend, kept for provenance; superseded by `web-tierA/` |
| [`RUNBOOK.md`](RUNBOOK.md) | The operator runbook: deployment, verification, and every lesson the hard way |
| [`secrets/`](secrets/README.md) | Gitignored locally; only key *fingerprints* are committed as documentation |

---

## License

MIT. See [LICENSE](LICENSE).

<p align="center"><sub>
  Built by SIERA Labs for the Meta Global AI Hackathon 2026.<br>
  Tracking by Meta SAM 3.1 · Match intelligence by Muse Spark · Verified execution by E2B.<br>
  Demo footage is used in the context of a hackathon demonstration with credit; all rights remain with the rights holders.
</sub></p>
