/* StatCam verified sample run — baked from real job 84bca8fd9d96 (demo mode). */
window.SAMPLE_DATA = {
 "_provenance": "VERIFIED RUN 84bca8fd9d96 on api.statcam.sieralabs.com — 31 Oct 2026. Synthetic demo mode (no API keys); every number computed from that run.",
 "job": {
  "id": "84bca8fd9d96",
  "agent_log": [
   {
    "t": 1793381666.7,
    "stage": "plan",
    "text": "Plan: ① ingest upload → ② extract frames → ③ track players (synthetic) → ④ write stats code (mock) → ⑤ execute (local) → ⑥ dashboard"
   },
   {
    "t": 1793381667.9,
    "stage": "frames",
    "text": "8 preview frames extracted from a 30 fps source"
   },
   {
    "t": 1793381667.9,
    "stage": "track",
    "text": "Tracking locked: 12 objects at 97.0% confidence"
   },
   {
    "t": 1793381668.0,
    "stage": "codegen",
    "text": "Stats code ready (mock)"
   },
   {
    "t": 1793381668.0,
    "stage": "analyze",
    "text": "Analyst read: P6 is the engine: 0.2 km covered — 128% of the squad-median workload."
   }
  ]
 },
 "result": {
  "mode": "debug",
  "sport": "soccer",
  "label": "Soccer",
  "fileName": "sample-match.mp4",
  "duration": "01:30",
  "trackedLabel": "TRACKING · 11 PLAYERS",
  "confidence": "97.0%",
  "frames": "2,700",
  "positionsCount": "29,700",
  "summaryText": "P6 ran 0.2 km",
  "kpis": [
   {
    "value": "0.2",
    "unit": " km",
    "label": "TOP DISTANCE",
    "sub": "P6"
   },
   {
    "value": "32.6",
    "unit": " km/h",
    "label": "TOP SPEED",
    "sub": "P1"
   },
   {
    "value": "28",
    "unit": "",
    "label": "SPRINTS",
    "sub": "TEAM"
   }
  ],
  "players": {
   "P1": {
    "id": "P1",
    "name": "P1 · Tracked",
    "distance": "0.2 km",
    "pct": 82,
    "topSpeed": "32.6 km/h",
    "sprints": 4
   },
   "P2": {
    "id": "P2",
    "name": "P2 · Tracked",
    "distance": "0.2 km",
    "pct": 80,
    "topSpeed": "26.2 km/h",
    "sprints": 1
   },
   "P3": {
    "id": "P3",
    "name": "P3 · Tracked",
    "distance": "0.2 km",
    "pct": 68,
    "topSpeed": "25.1 km/h",
    "sprints": 1
   },
   "P4": {
    "id": "P4",
    "name": "P4 · Tracked",
    "distance": "0.1 km",
    "pct": 60,
    "topSpeed": "23.1 km/h",
    "sprints": 0
   },
   "P5": {
    "id": "P5",
    "name": "P5 · Tracked",
    "distance": "0.2 km",
    "pct": 87,
    "topSpeed": "29.8 km/h",
    "sprints": 4
   },
   "P6": {
    "id": "P6",
    "name": "P6 · Tracked",
    "distance": "0.2 km",
    "pct": 100,
    "topSpeed": "30.9 km/h",
    "sprints": 4
   },
   "P7": {
    "id": "P7",
    "name": "P7 · Tracked",
    "distance": "0.2 km",
    "pct": 67,
    "topSpeed": "25.7 km/h",
    "sprints": 1
   },
   "P8": {
    "id": "P8",
    "name": "P8 · Tracked",
    "distance": "0.2 km",
    "pct": 78,
    "topSpeed": "25.5 km/h",
    "sprints": 2
   },
   "P9": {
    "id": "P9",
    "name": "P9 · Tracked",
    "distance": "0.2 km",
    "pct": 78,
    "topSpeed": "29.0 km/h",
    "sprints": 3
   },
   "P10": {
    "id": "P10",
    "name": "P10 · Tracked",
    "distance": "0.2 km",
    "pct": 76,
    "topSpeed": "30.3 km/h",
    "sprints": 4
   },
   "P11": {
    "id": "P11",
    "name": "P11 · Tracked",
    "distance": "0.2 km",
    "pct": 99,
    "topSpeed": "30.9 km/h",
    "sprints": 4
   }
  },
  "analysis": {
   "tactical": [
    "P6 is the engine: 0.2 km covered — 128% of the squad-median workload.",
    "Speed profile: P1 peaks at 32.6 km/h — that is the transition outlet when possession turns over.",
    "Work-rate spread is 40% between the most and least active player (P6 vs P4) — pressing is not collective yet.",
    "Team sprint volume: 28 in the analyzed segment — high-intensity chaos, expect late-game fatigue."
   ],
   "forward": "Next session: build drills that lift the median (0.2 km) rather than the top — collective pressing over individual workload. Re-run the other segment of this match to compare halves.",
   "computed": true,
   "note": "Computed from tracking data. Spark's full tactical reasoning activates with API keys."
  }
 },
 "moments": [
  {
   "peak_kmh": 32.6,
   "peak_by": "P1",
   "sprints": 14,
   "ball_kmh": 65.6,
   "spread_m": 73.5,
   "start_s": 35.0,
   "end_s": 40.0,
   "label": "Fastest burst",
   "description": "peak 32.6 km/h (P1), 14 sprints, ball at 65.6 km/h, block spread 73.5 m",
   "intent": "speed"
  },
  {
   "peak_kmh": 31.1,
   "peak_by": "P1",
   "sprints": 5,
   "ball_kmh": 68.4,
   "spread_m": 83.4,
   "start_s": 85.0,
   "end_s": 90.0,
   "label": "Fastest burst",
   "description": "peak 31.1 km/h (P1), 5 sprints, ball at 68.4 km/h, block spread 83.4 m",
   "intent": "speed"
  },
  {
   "peak_kmh": 30.9,
   "peak_by": "P6",
   "sprints": 3,
   "ball_kmh": 60.1,
   "spread_m": 69.0,
   "start_s": 15.0,
   "end_s": 20.0,
   "label": "Fastest burst",
   "description": "peak 30.9 km/h (P6), 3 sprints, ball at 60.1 km/h, block spread 69.0 m",
   "intent": "speed"
  }
 ],
 "plan": {
  "focus": [
   "Collective pressing — work-rate gap is 40% (P6 vs P4)",
   "Repeat-sprint conditioning — 28 team sprints, expect late-game fatigue"
  ],
  "sessions": [
   {
    "day": "Tuesday",
    "title": "Pressing shape",
    "drills": [
     {
      "name": "5v5 +3 press triggers",
      "duration_min": 25,
      "why": "Close the 40% work-rate gap as a unit, not individually"
     },
     {
      "name": "Shadow-press rondo",
      "duration_min": 15,
      "why": "Synchronize the block — spread metric showed stretched phases"
     }
    ]
   },
   {
    "day": "Thursday",
    "title": "Repeat-sprint engine",
    "drills": [
     {
      "name": "10 × 30m shuttles @ 90%",
      "duration_min": 20,
      "why": "Match the peak demand: P1 hit 32.6 km/h"
     },
     {
      "name": "Transition 3v2 chains",
      "duration_min": 20,
      "why": "Convert sprint bursts into controlled exits"
     }
    ]
   },
   {
    "day": "Saturday",
    "title": "Game application",
    "drills": [
     {
      "name": "8v8 with pressing triggers",
      "duration_min": 30,
      "why": "Transfer Tuesday/Thursday patterns into real play"
     },
     {
      "name": "Median-load conditioning test",
      "duration_min": 10,
      "why": "Target: lift squad median from 0.18 km toward 0.23 km"
     }
    ]
   }
  ],
  "computed": true,
  "note": "Computed from this match's tracking data. Spark's full periodization reasoning activates with API keys."
 },
 "chat": [
  {
   "q": "Who was the fastest player?",
   "a": "Top speed: P1 at 32.6 km/h. P1 recorded the most sprints (4); team total 28. High sprint counts with low distance usually mean short explosive presses rather than end-to-end running.",
   "mode": "computed"
  },
  {
   "q": "Why did we look weak in the second half?",
   "a": "Reading the data honestly: work-rate is uneven — 0.1 km separates the most and least active players (P6 vs P4). Segments of play with low collective distance usually mean the block stopped pressing together. The heatmap panel shows where each player spent time — clusters on one side are where the opposition found space.",
   "mode": "computed"
  },
  {
   "q": "Which player covered the most distance?",
   "a": "P6 covered the most ground: 0.2 km in the analyzed segment. Squad median was 0.2 km — the spread from most to least active is 0.1 km.",
   "mode": "computed"
  }
 ],
 "whispers": [
  {
   "t": 0,
   "text": "t+0s — ball in the middle third; peak intensity 9.8 km/h (P2), 0 sprints in the last 5s, block spread 78.2 m. Block is stretched — press as a unit."
  },
  {
   "t": 6,
   "text": "t+6s — ball in the middle third; peak intensity 28.3 km/h (P1), 2 sprints in the last 5s, block spread 81.9 m. Block is stretched — press as a unit."
  },
  {
   "t": 12,
   "text": "t+12s — ball in the middle third; peak intensity 28.9 km/h (P11), 11 sprints in the last 5s, block spread 83.3 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 18,
   "text": "t+18s — ball in the middle third; peak intensity 30.9 km/h (P6), 7 sprints in the last 5s, block spread 66.7 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 24,
   "text": "t+24s — ball in the middle third; peak intensity 6.6 km/h (P4), 0 sprints in the last 5s, block spread 72.3 m. Block is stretched — press as a unit."
  },
  {
   "t": 30,
   "text": "t+30s — ball in the middle third; peak intensity 25.7 km/h (P5), 1 sprints in the last 5s, block spread 81.3 m. Block is stretched — press as a unit."
  },
  {
   "t": 36,
   "text": "t+36s — ball in the middle third; peak intensity 32.6 km/h (P1), 25 sprints in the last 5s, block spread 84.4 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 42,
   "text": "t+42s — ball in the middle third; peak intensity 23.2 km/h (P2), 0 sprints in the last 5s, block spread 63.4 m. Block is stretched — press as a unit."
  },
  {
   "t": 48,
   "text": "t+48s — ball in the defensive third; peak intensity 11.7 km/h (P6), 0 sprints in the last 5s, block spread 65.2 m. Block is stretched — press as a unit."
  },
  {
   "t": 54,
   "text": "t+54s — ball in the defensive third; peak intensity 29.3 km/h (P11), 10 sprints in the last 5s, block spread 73.9 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 60,
   "text": "t+60s — ball in the middle third; peak intensity 30.3 km/h (P10), 11 sprints in the last 5s, block spread 87.6 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 66,
   "text": "t+66s — ball in the middle third; peak intensity 27.9 km/h (P9), 10 sprints in the last 5s, block spread 91.6 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 72,
   "text": "t+72s — ball in the attacking third; peak intensity 12.5 km/h (P7), 0 sprints in the last 5s, block spread 66.5 m. Block is stretched — press as a unit."
  },
  {
   "t": 78,
   "text": "t+78s — ball in the middle third; peak intensity 30.8 km/h (P6), 9 sprints in the last 5s, block spread 75.5 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 84,
   "text": "t+84s — ball in the attacking third; peak intensity 30.3 km/h (P11), 5 sprints in the last 5s, block spread 80.0 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  }
 ],
 "video": "samples/sample-match-2026.mp4",
 "cardFile": "sample-card.svg"
};
