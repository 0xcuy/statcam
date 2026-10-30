#!/usr/bin/env python3
"""Generate the StatCam sample video: a stylized top-down simulated tracking
view of a match (90s, 640x360, 30fps). Frames rendered with PIL, encoded via ffmpeg.
Output: web-tierA/samples/sample-match.mp4 (+ preview still for docs).
"""
import math
import random
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

W, H, FPS, DUR = 640, 360, 30, 90
N = FPS * DUR
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "web-tierA" / "samples" / "sample-match-v3.mp4"

random.seed(20261031)

# ---- players -----------------------------------------------------------------
class Player:
    def __init__(self, team, idx, hx, hy):
        self.team = team            # 0 = HOME (cyan), 1 = AWAY (red)
        self.idx = idx              # 1..5
        self.pid = f"P{team * 5 + idx}"
        self.hx, self.hy = hx, hy
        self.x, self.y = hx, hy
        self.vx = self.vy = 0.0
        self.burst = 0
        self.trail = []

    def step(self, ball, t):
        if self.burst <= 0 and random.random() < 0.010:
            self.burst = random.randint(35, 80)   # 1.2-2.6s sprint
        chase = random.random() < 0.35
        if chase:
            tx, ty = ball.x, ball.y
        else:
            tx, ty = self.hx, self.hy
        self.vx += (tx - self.x) * 0.0018 + random.uniform(-.16, .16)
        self.vy += (ty - self.y) * 0.0018 + random.uniform(-.16, .16)
        spd = 2.6 if self.burst > 0 else 0.75
        v = math.hypot(self.vx, self.vy) or 1
        if v > spd:
            self.vx, self.vy = self.vx / v * spd, self.vy / v * spd
        self.x = max(26, min(W - 26, self.x + self.vx))
        self.y = max(30, min(H - 26, self.y + self.vy))
        self.trail.append((self.x, self.y))
        if len(self.trail) > 26:
            self.trail.pop(0)
        if self.burst > 0:
            self.burst -= 1


class Ball:
    def __init__(self):
        self.x, self.y = W / 2, H / 2
        self.vx, self.vy = 0.0, 0.0
        self.trail = []
        self.b_mode, self.b_left = "dribble", random.randint(50, 130)
        self.b_target = (W / 2, H / 2)
        self.b_player = None

    def third(self):
        return 0 if self.x < W / 3 else (1 if self.x < 2 * W / 3 else 2)

    def step(self, players, t):
        if self.b_left <= 0:
            if self.b_mode == "dribble":
                # pass to a DIFFERENT third — decisive switch of play
                others = [i for i in (0, 1, 2) if i != self.third()]
                ti = random.choice(others)
                tx = (W / 6 + random.uniform(-40, 40) if ti == 0
                      else W / 2 + random.uniform(-40, 40) if ti == 1
                      else 5 * W / 6 + random.uniform(-40, 40))
                self.b_target = (tx, random.uniform(60, H - 60))
                self.b_mode, self.b_left = "pass", random.randint(45, 100)
            else:
                # dribble near a random player for a while
                self.b_player = random.choice(players)
                self.b_mode, self.b_left = "dribble", random.randint(50, 130)
        else:
            self.b_left -= 1

        if self.b_mode == "dribble":
            p = self.b_player or min(players, key=lambda q: math.hypot(q.x - self.x, q.y - self.y))
            tx, ty = p.x + random.uniform(-26, 26), p.y + random.uniform(-18, 18)
            k, cap = 0.045, 2.7
        else:
            tx, ty = self.b_target
            k, cap = 0.06, 5.4
        self.vx += (tx - self.x) * k + random.uniform(-.45, .45)
        self.vy += (ty - self.y) * k + random.uniform(-.35, .35)
        v = math.hypot(self.vx, self.vy) or 1
        if v > cap:
            self.vx, self.vy = self.vx / v * cap, self.vy / v * cap
        self.x = max(20, min(W - 20, self.x + self.vx))
        self.y = max(24, min(H - 20, self.y + self.vy))
        self.trail.append((self.x, self.y))
        if len(self.trail) > 16:
            self.trail.pop(0)
        if self.b_mode == "pass" and math.hypot(tx - self.x, ty - self.y) < 30:
            self.b_left = 0  # arrived — switch play again soon


roles = [(0.14, 0.50), (0.30, 0.22), (0.30, 0.78), (0.46, 0.38), (0.46, 0.62)]
players = []
for i, (rx, ry) in enumerate(roles):
    players.append(Player(0, i + 1, W * rx, H * ry))
    players.append(Player(1, i + 1, W * (1 - rx), H * (1 - ry)))
ball = Ball()

TCOL = {0: (34, 211, 238), 1: (248, 113, 113)}

import io
import os

from PIL import ImageFont

_FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]
_font = None
for _p in _FONT_PATHS:
    if os.path.exists(_p):
        _font = ImageFont.truetype(_p, 11)
        break


def _txt(d, xy, s, fill):
    if _font:
        d.text(xy, s, fill=fill, font=_font)
    else:
        d.text(xy, s, fill=fill)


def _png(img):
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


def pitch(d):
    for i in range(8):
        c = (10, 46, 20) if i % 2 else (12, 52, 23)
        d.rectangle([i * W / 8, 0, (i + 1) * W / 8, H], fill=c)
    lc = (255, 255, 255, 60)
    d.rectangle([12, 14, W - 12, H - 12], outline=lc, width=2)
    d.line([W / 2, 14, W / 2, H - 12], fill=lc, width=2)
    d.ellipse([W / 2 - 40, H / 2 - 40, W / 2 + 40, H / 2 + 40], outline=lc, width=2)
    d.rectangle([12, H / 2 - 55, 68, H / 2 + 55], outline=lc, width=2)
    d.rectangle([W - 68, H / 2 - 55, W - 12, H / 2 + 55], outline=lc, width=2)


def frame(t):
    img = Image.new("RGB", (W, H), (10, 46, 20))
    d = ImageDraw.Draw(img, "RGBA")
    pitch(d)
    # ball trail
    for j, (bx, by) in enumerate(ball.trail):
        a = int(90 * j / len(ball.trail))
        d.ellipse([bx - 2.5, by - 2.5, bx + 2.5, by + 2.5], fill=(255, 255, 255, a))
    for p in players:
        c = TCOL[p.team]
        for j, (px, py) in enumerate(p.trail):
            a = int(70 * j / len(p.trail))
            if j: d.line([p.trail[j - 1], (px, py)], fill=c + (a,), width=1)
        # tracking box
        d.rectangle([p.x - 7, p.y - 9, p.x + 7, p.y + 9], outline=c + (255,), width=2)
        d.rectangle([p.x - 7, p.y - 13, p.x + 7, p.y - 10], fill=c + (255,))
        _txt(d, (p.x - 5, p.y - 14), p.pid, (7, 10, 18, 255))
        if p.burst > 40:
            _txt(d, (p.x + 10, p.y - 8), "SPRINT", (251, 191, 36, 230))
    d.ellipse([ball.x - 3.4, ball.y - 3.4, ball.x + 3.4, ball.y + 3.4], fill=(255, 255, 255, 255))
    # HUD: scoreboard + scan sweep + label
    mm, ss = divmod(int(t // FPS), 60)
    d.rectangle([12, 12, 148, 30], fill=(7, 10, 18, 190))
    _txt(d, (18, 17), f"HOM 1 - 0 AWY  {mm:02d}:{ss:02d}", (243, 245, 248, 235))
    sweep = (t * 2.2) % (W + 120) - 60
    for k in range(40):
        a = int(38 * (1 - k / 40))
        d.line([sweep - k, 14, sweep - k, H - 14], fill=(34, 211, 238, a))
    d.rectangle([12, H - 30, 258, H - 14], fill=(7, 10, 18, 190))
    _txt(d, (18, H - 27), "SIMULATED TRACKING VIEW - DEMO", (139, 149, 169, 220))
    return img


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        pipe = subprocess.Popen(
            ["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-r", str(FPS),
             "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "28",
             "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT)],
            stdin=subprocess.PIPE)
        for t in range(N):
            for p in players:
                p.step(ball, t)
            ball.step(players, t)
            pipe.stdin.write(_png(frame(t)))
            if t % 300 == 0:
                print(f"frame {t}/{N}", file=sys.stderr)
        pipe.stdin.close()
        if pipe.wait() != 0:
            raise SystemExit("ffmpeg failed")
    print(f"OK -> {OUT} ({OUT.stat().st_size/1e6:.1f} MB)")


if __name__ == "__main__":
    main()
