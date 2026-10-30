import json, math

IN = "/data/uploads/f4c15c71828c/input/tracks.json"
OUT = "/data/uploads/f4c15c71828c/output/stats.json"
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
        sprints = sum(1 for s in speeds if s > SPRINT_KMH)
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