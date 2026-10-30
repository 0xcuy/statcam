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
OUT = ROOT / "web-tierA" / "samples" / "sample-match.mp4"

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

    def step(self, players, t):
        if t % FPS == 0 and random.random() < 0.5:
            tx = random.uniform(W * 0.55, W - 60) if random.random() < 0.5 else random.uniform(60, W * 0.45)
            ty = random.uniform(50, H - 50)
            self.vx += (tx - self.x) * 0.02 + random.uniform(-.6, .6)
            self.vy += (ty - self.y) * 0.02 + random.uniform(-.6, .6)
        near = min(players, key=lambda p: math.hypot(p.x - self.x, p.y - self.y))
        self.vx += (near.x - self.x) * 0.006 + random.uniform(-.5, .5)
        self.vy += (near.y - self.y) * 0.006 + random.uniform(-.5, .5)
        v = math.hypot(self.vx, self.vy) or 1
        if v > 5.0:
            self.vx, self.vy = self.vx / v * 5.0, self.vy / v * 5.0
        self.x = max(20, min(W - 20, self.x + self.vx))
        self.y = max(24, min(H - 20, self.y + self.vy))
        self.trail.append((self.x, self.y))
        if len(self.trail) > 16:
            self.trail.pop(0)


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
