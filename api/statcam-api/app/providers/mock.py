"""Debug providers — run the full pipeline with zero API keys.

- mock_tracks: synthetic player/ball trajectories (physically plausible motion
  on a 105x68m pitch: jog / sprint / rest with per-player top speed),
  same JSON shape SAM 3.1 returns.
- MOCK_ANALYSIS_CODE: deterministic analysis script following the exact schema
  Muse Spark is asked to write (so debug validates the real contract).
- run_local: execute the script in a local subprocess (debug only).

Debug mode ALWAYS uses the bundled mock script — never model output — so local
execution is safe. Production (live) mode always uses E2B.
"""
import json
import math
import random
import subprocess
import sys
from pathlib import Path

PITCH_W, PITCH_H = 105.0, 68.0
FPS = 30


def mock_tracks(video_meta: dict, seed: str = "debug", n_players: int = 11) -> dict:
    rng = random.Random(f"statcam-debug-{seed}")
    duration = max(float(video_meta.get("duration_s", 60) or 60), 1)
    step = 15  # keep every 15th frame (2 fps), mirroring the real frame probe
    dt = step / FPS
    tracks = []

    # ---- ball first (players chase it on sprints) --------------------------
    THIRD = PITCH_W / 3

    def _ball_third(x: float) -> int:
        return min(2, int(x / THIRD))

    bx, by, bvx, bvy = PITCH_W / 2, PITCH_H / 2, 3.0, 1.5
    b_target = (PITCH_W / 2, PITCH_H / 2)
    b_mode, b_left = "dribble", rng.randint(6, 14)
    bframes = []
    for f in range(0, int(duration * FPS), step):
        if b_left <= 0:
            if b_mode == "dribble":
                # switch play: pass into a DIFFERENT third
                others = [i for i in (0, 1, 2) if i != _ball_third(bx)]
                ti = rng.choice(others)
                b_target = (THIRD * (ti * 2 + 1) + rng.uniform(-10, 10),
                            rng.uniform(12, PITCH_H - 12))
                b_mode, b_left = "pass", rng.randint(3, 6)
            else:
                b_mode, b_left = "dribble", rng.randint(6, 14)
                b_target = (bx + rng.uniform(-14, 14), by + rng.uniform(-9, 9))
        else:
            b_left -= 1
        goal = rng.uniform(16.0, 22.0) if b_mode == "pass" else rng.uniform(2.5, 5.5)
        dx, dy = b_target[0] - bx + rng.uniform(-6, 6), b_target[1] - by + rng.uniform(-4, 4)
        d = math.hypot(dx, dy) or 1
        bvx += (dx / d * goal - bvx) * 0.4
        bvy += (dy / d * goal - bvy) * 0.4
        bx += bvx * dt
        by += bvy * dt
        if bx < 1 or bx > PITCH_W - 1:
            bvx *= -0.6
            bx = min(max(bx, 1), PITCH_W - 1)
        if by < 1 or by > PITCH_H - 1:
            bvy *= -0.6
            by = min(max(by, 1), PITCH_H - 1)
        bframes.append({"frame": f, "x": round(bx, 2), "y": round(by, 2),
                        "w": 0.5, "h": 0.5})
    tracks.append({"id": "BALL", "label": "ball", "frames": bframes})

    # ---- players: jog / sprint / rest with per-player top speed ------------
    for i in range(n_players):
        pid = f"P{i + 1}"
        vmax = rng.uniform(7.2, 8.6) if i else rng.uniform(8.8, 9.1)  # 26–33 km/h; P1 quickest
        col, row = i % 4, (i // 4) % 3
        ax = 18 + col * (PITCH_W - 36) / 3 + rng.uniform(-6, 6)
        ay = 12 + row * (PITCH_H - 24) / 2 + rng.uniform(-5, 5)
        x, y = ax + rng.uniform(-4, 4), ay + rng.uniform(-4, 4)
        ang = rng.uniform(0, 2 * math.pi)
        vx, vy = math.cos(ang) * 2.0, math.sin(ang) * 2.0
        mode, mode_left = "jog", rng.randint(4, 12)
        cooldown = rng.randint(6, 24)
        frames = []
        for f in range(0, int(duration * FPS), step):
            if mode == "jog":
                if cooldown <= 0 and rng.random() < 0.22:
                    mode, mode_left = "sprint", rng.randint(4, 9)
            elif mode == "sprint":
                if mode_left <= 0:
                    mode, mode_left, cooldown = "rest", rng.randint(16, 44), rng.randint(16, 44)
                else:
                    mode_left -= 1
            else:  # rest
                if mode_left <= 0:
                    mode, mode_left = "jog", rng.randint(8, 24)
                else:
                    mode_left -= 1
            if cooldown > 0:
                cooldown -= 1
            if mode == "sprint":
                target_speed = vmax
                tx, ty = bx + rng.uniform(-8, 8), by + rng.uniform(-5, 5)
            elif mode == "jog":
                target_speed = rng.uniform(2.0, 3.4)
                tx, ty = ax + rng.uniform(-16, 16), ay + rng.uniform(-10, 10)
            else:
                target_speed = rng.uniform(0.9, 1.7)
                tx, ty = ax + rng.uniform(-5, 5), ay + rng.uniform(-4, 4)
            dx, dy = tx - x, ty - y
            d = math.hypot(dx, dy) or 1
            vx += (dx / d * target_speed - vx) * 0.35 + rng.uniform(-.4, .4)
            vy += (dy / d * target_speed - vy) * 0.35 + rng.uniform(-.4, .4)
            sp = math.hypot(vx, vy)
            if sp > vmax:
                vx, vy = vx / sp * vmax, vy / sp * vmax
            x += vx * dt
            y += vy * dt
            if x < 3 or x > PITCH_W - 3:
                vx *= -0.7
                x = min(max(x, 3), PITCH_W - 3)
            if y < 3 or y > PITCH_H - 3:
                vy *= -0.7
                y = min(max(y, 3), PITCH_H - 3)
            frames.append({"frame": f, "x": round(x, 2), "y": round(y, 2),
                           "w": 1.8, "h": 1.8})
        tracks.append({"id": pid, "label": "player", "frames": frames})

    return {"tracks": tracks, "confidence": 0.97, "mock": True,
            "note": "synthetic debug trajectories — no model was called"}


MOCK_ANALYSIS_CODE = '''
import json, math

IN = "/input/tracks.json"
OUT = "/output/stats.json"
FPS = 30
SPRINT_KMH = 25.0
PITCH_W, PITCH_H = 105.0, 68.0

def main():
    tracks = json.load(open(IN))["tracks"]
    players = []
    for t in tracks:
        if t.get("label") == "ball":
            continue
        fr = t["frames"]
        dist, speeds = 0.0, []
        for a, b in zip(fr, fr[1:]):
            d = math.hypot(b["x"] - a["x"], b["y"] - a["y"])
            dt = (b["frame"] - a["frame"]) / FPS
            dist += d
            if dt > 0:
                speeds.append(d / dt * 3.6)
        top = max(speeds, default=0.0)
        sprints = 0
        in_sprint = False
        for s in speeds:
            cur = s > SPRINT_KMH
            if cur and not in_sprint:
                sprints += 1
            in_sprint = cur
        grid = [[0] * 8 for _ in range(3)]
        for p in fr:
            c = min(7, int(p["x"] / PITCH_W * 8))
            r = min(2, int(p["y"] / PITCH_H * 3))
            grid[r][c] += 1
        peak = max(max(row) for row in grid) or 1
        heat = [[round(v / peak, 3) for v in row] for row in grid]
        players.append({"id": t["id"], "distance_m": round(dist, 1),
                        "top_speed_kmh": round(top, 1), "sprints": sprints,
                        "heatmap": heat})
    json.dump({"players": players, "confidence": 0.97,
               "notes": "debug mock — synthetic trajectories, local execution"},
              open(OUT, "w"))
    print(f"DONE {len(players)} players")

main()
'''.strip()


def run_local(code: str, workdir: Path, tracks: dict, timeout_s: int = 60) -> dict:
    """Debug-only local execution of the analysis script."""
    inp, out = workdir / "input", workdir / "output"
    inp.mkdir(exist_ok=True)
    out.mkdir(exist_ok=True)
    (inp / "tracks.json").write_text(json.dumps(tracks))
    # The script targets E2B-style absolute paths; remap into the job dir.
    code = code.replace("/input/", f"{inp}/").replace("/output/", f"{out}/")
    script = workdir / "analysis.py"
    script.write_text(code)
    r = subprocess.run([sys.executable, str(script)], capture_output=True,
                       text=True, timeout=timeout_s, cwd=str(workdir))
    if r.returncode != 0:
        raise RuntimeError(f"local analysis failed: {(r.stderr or '')[-600:]}")
    stats = json.loads((out / "stats.json").read_text())
    if "players" not in stats:
        raise RuntimeError("stats.json missing 'players'")
    return stats
