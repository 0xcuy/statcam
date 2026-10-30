/* StatCam verified sample run — baked from real job 20b56885d430 (demo mode). */
window.SAMPLE_DATA = {
 "_provenance": "VERIFIED RUN 20b56885d430 on api.statcam.sieralabs.com — 31 Oct 2026. Synthetic demo mode (no API keys); every number computed from that run.",
 "job": {
  "id": "20b56885d430",
  "agent_log": [
   {
    "t": 1793382714.3,
    "stage": "plan",
    "text": "Plan: ① ingest upload → ② extract frames → ③ track players (synthetic) → ④ write stats code (mock) → ⑤ execute (local) → ⑥ dashboard"
   },
   {
    "t": 1793382715.5,
    "stage": "frames",
    "text": "8 preview frames extracted from a 30 fps source"
   },
   {
    "t": 1793382715.5,
    "stage": "track",
    "text": "Tracking locked: 12 objects at 97.0% confidence"
   },
   {
    "t": 1793382715.6,
    "stage": "codegen",
    "text": "Stats code ready (mock)"
   },
   {
    "t": 1793382715.6,
    "stage": "analyze",
    "text": "Analyst read: P6 is the engine: 0.2 km covered — 114% of the squad-median workload."
   }
  ]
 },
 "result": {
  "mode": "debug",
  "sport": "soccer",
  "label": "Soccer",
  "fileName": "sample-match-v3.mp4",
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
    "value": "32.5",
    "unit": " km/h",
    "label": "TOP SPEED",
    "sub": "P1"
   },
   {
    "value": "31",
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
    "pct": 100,
    "topSpeed": "32.5 km/h",
    "sprints": 4
   },
   "P2": {
    "id": "P2",
    "name": "P2 · Tracked",
    "distance": "0.2 km",
    "pct": 93,
    "topSpeed": "28.5 km/h",
    "sprints": 4
   },
   "P3": {
    "id": "P3",
    "name": "P3 · Tracked",
    "distance": "0.2 km",
    "pct": 89,
    "topSpeed": "29.6 km/h",
    "sprints": 3
   },
   "P4": {
    "id": "P4",
    "name": "P4 · Tracked",
    "distance": "0.2 km",
    "pct": 74,
    "topSpeed": "25.0 km/h",
    "sprints": 1
   },
   "P5": {
    "id": "P5",
    "name": "P5 · Tracked",
    "distance": "0.2 km",
    "pct": 87,
    "topSpeed": "26.4 km/h",
    "sprints": 5
   },
   "P6": {
    "id": "P6",
    "name": "P6 · Tracked",
    "distance": "0.2 km",
    "pct": 100,
    "topSpeed": "29.5 km/h",
    "sprints": 4
   },
   "P7": {
    "id": "P7",
    "name": "P7 · Tracked",
    "distance": "0.2 km",
    "pct": 93,
    "topSpeed": "28.5 km/h",
    "sprints": 4
   },
   "P8": {
    "id": "P8",
    "name": "P8 · Tracked",
    "distance": "0.1 km",
    "pct": 61,
    "topSpeed": "22.6 km/h",
    "sprints": 0
   },
   "P9": {
    "id": "P9",
    "name": "P9 · Tracked",
    "distance": "0.2 km",
    "pct": 84,
    "topSpeed": "28.1 km/h",
    "sprints": 4
   },
   "P10": {
    "id": "P10",
    "name": "P10 · Tracked",
    "distance": "0.2 km",
    "pct": 79,
    "topSpeed": "26.2 km/h",
    "sprints": 1
   },
   "P11": {
    "id": "P11",
    "name": "P11 · Tracked",
    "distance": "0.2 km",
    "pct": 72,
    "topSpeed": "25.2 km/h",
    "sprints": 1
   }
  },
  "analysis": {
   "tactical": [
    "P6 is the engine: 0.2 km covered — 114% of the squad-median workload.",
    "Speed profile: P1 peaks at 32.5 km/h — that is the transition outlet when possession turns over.",
    "Work-rate spread is 39% between the most and least active player (P6 vs P8) — pressing is not collective yet.",
    "Team sprint volume: 31 in the analyzed segment — high-intensity chaos, expect late-game fatigue."
   ],
   "forward": "Next session: build drills that lift the median (0.2 km) rather than the top — collective pressing over individual workload. Re-run the other segment of this match to compare halves.",
   "computed": true,
   "note": "Computed from tracking data. Spark's full tactical reasoning activates with API keys."
  }
 },
 "moments": [
  {
   "peak_kmh": 32.5,
   "peak_by": "P1",
   "sprints": 8,
   "ball_kmh": 9.6,
   "spread_m": 63.3,
   "start_s": 85.0,
   "end_s": 90.0,
   "label": "Fastest burst",
   "description": "peak 32.5 km/h (P1), 8 sprints, ball at 9.6 km/h, block spread 63.3 m",
   "intent": "speed"
  },
  {
   "peak_kmh": 32.0,
   "peak_by": "P1",
   "sprints": 19,
   "ball_kmh": 46.3,
   "spread_m": 84.2,
   "start_s": 10.0,
   "end_s": 15.0,
   "label": "Fastest burst",
   "description": "peak 32.0 km/h (P1), 19 sprints, ball at 46.3 km/h, block spread 84.2 m",
   "intent": "speed"
  },
  {
   "peak_kmh": 31.0,
   "peak_by": "P1",
   "sprints": 3,
   "ball_kmh": 23.0,
   "spread_m": 69.5,
   "start_s": 80.0,
   "end_s": 85.0,
   "label": "Fastest burst",
   "description": "peak 31.0 km/h (P1), 3 sprints, ball at 23.0 km/h, block spread 69.5 m",
   "intent": "speed"
  }
 ],
 "plan": {
  "focus": [
   "Collective pressing — work-rate gap is 39% (P6 vs P8)",
   "Repeat-sprint conditioning — 31 team sprints, expect late-game fatigue"
  ],
  "sessions": [
   {
    "day": "Tuesday",
    "title": "Pressing shape",
    "drills": [
     {
      "name": "5v5 +3 press triggers",
      "duration_min": 25,
      "why": "Close the 39% work-rate gap as a unit, not individually"
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
      "why": "Match the peak demand: P1 hit 32.5 km/h"
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
      "why": "Target: lift squad median from 0.19 km toward 0.22 km"
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
   "a": "Top speed: P1 at 32.5 km/h. P5 recorded the most sprints (5); team total 31. High sprint counts with low distance usually mean short explosive presses rather than end-to-end running.",
   "mode": "computed"
  },
  {
   "q": "Why did we look weak in the second half?",
   "a": "Reading the data honestly: work-rate is uneven — 0.1 km separates the most and least active players (P6 vs P8). Segments of play with low collective distance usually mean the block stopped pressing together. The heatmap panel shows where each player spent time — clusters on one side are where the opposition found space.",
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
   "text": "t+0s — ball in the middle third; peak intensity 9.0 km/h (P8), 0 sprints in the last 5s, block spread 72.6 m. Block is stretched — press as a unit."
  },
  {
   "t": 6,
   "text": "t+6s — ball in the attacking third; peak intensity 24.4 km/h (P10), 0 sprints in the last 5s, block spread 93.0 m. Block is stretched — press as a unit."
  },
  {
   "t": 12,
   "text": "t+12s — ball in the attacking third; peak intensity 28.5 km/h (P2), 12 sprints in the last 5s, block spread 88.6 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 18,
   "text": "t+18s — ball in the attacking third; peak intensity 32.0 km/h (P1), 16 sprints in the last 5s, block spread 73.4 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 24,
   "text": "t+24s — ball in the attacking third; peak intensity 7.9 km/h (P10), 0 sprints in the last 5s, block spread 69.3 m. Block is stretched — press as a unit."
  },
  {
   "t": 30,
   "text": "t+30s — ball in the attacking third; peak intensity 14.9 km/h (P8), 0 sprints in the last 5s, block spread 77.6 m. Block is stretched — press as a unit."
  },
  {
   "t": 36,
   "text": "t+36s — ball in the middle third; peak intensity 29.6 km/h (P3), 13 sprints in the last 5s, block spread 83.4 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 42,
   "text": "t+42s — ball in the middle third; peak intensity 30.9 km/h (P1), 16 sprints in the last 5s, block spread 73.9 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 48,
   "text": "t+48s — ball in the defensive third; peak intensity 24.0 km/h (P11), 0 sprints in the last 5s, block spread 71.0 m. Block is stretched — press as a unit."
  },
  {
   "t": 54,
   "text": "t+54s — ball in the defensive third; peak intensity 20.4 km/h (P8), 0 sprints in the last 5s, block spread 82.0 m. Block is stretched — press as a unit."
  },
  {
   "t": 60,
   "text": "t+60s — ball in the attacking third; peak intensity 28.5 km/h (P7), 6 sprints in the last 5s, block spread 82.6 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 66,
   "text": "t+66s — ball in the attacking third; peak intensity 29.1 km/h (P6), 15 sprints in the last 5s, block spread 65.4 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 72,
   "text": "t+72s — ball in the attacking third; peak intensity 14.7 km/h (P11), 0 sprints in the last 5s, block spread 70.8 m. Block is stretched — press as a unit."
  },
  {
   "t": 78,
   "text": "t+78s — ball in the attacking third; peak intensity 28.1 km/h (P9), 6 sprints in the last 5s, block spread 74.5 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
  },
  {
   "t": 84,
   "text": "t+84s — ball in the attacking third; peak intensity 31.0 km/h (P1), 3 sprints in the last 5s, block spread 71.1 m. Block is stretched — press as a unit."
  }
 ],
 "video": "samples/sample-match-v3.mp4",
 "cardFile": "sample-card.svg"
};
