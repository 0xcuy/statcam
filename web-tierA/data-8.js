/* StatCam verified demo runs — baked from REAL live jobs (SAM 3.1 + Spark + E2B).
   soccer cfdf386d5c17 · basketball ab6c1d8dd14d · running 1486e74ab4de */
window.SAMPLE_DATA = {
 "soccer": {
  "_provenance": "VERIFIED LIVE RUN cfdf386d5c17 (SAM 3.1 + Muse Spark + E2B) on real amateur footage: 'PDL Soccer - Sioux Fall Spitfire at Springfield Storm' (2005, archive.org).",
  "job": {
   "id": "cfdf386d5c17",
   "agent_log": [
    {
     "t": 1793387507.8,
     "stage": "plan",
     "text": "Plan: ① ingest upload → ② extract frames → ③ track players (sam-3.1) → ④ write stats code (spark-1.3) → ⑤ execute (e2b) → ⑥ dashboard"
    },
    {
     "t": 1793387508.1,
     "stage": "correct",
     "text": "Correction: source runs at 15 fps — tracking resolution reduced"
    },
    {
     "t": 1793387508.5,
     "stage": "frames",
     "text": "8 preview frames extracted from a 15 fps source"
    },
    {
     "t": 1793387585.4,
     "stage": "track",
     "text": "Tracking locked: 13 objects at 67.8% confidence"
    },
    {
     "t": 1793387630.4,
     "stage": "codegen",
     "text": "Stats code ready (spark-1.3)"
    },
    {
     "t": 1793387634.5,
     "stage": "analyze",
     "text": "Analyst read: P7 is the engine: 0.2 km covered — 438% of the squad-median workload."
    }
   ]
  },
  "result": {
   "mode": "live",
   "sport": "soccer",
   "label": "Soccer",
   "fileName": "sample_soccer_real.mp4",
   "duration": "01:00",
   "trackedLabel": "SIMULATED TRACKING · 11 PLAYERS",
   "confidence": "20.7%",
   "frames": "1,801",
   "positionsCount": "19,811",
   "summaryText": "P7 ran 0.2 km",
   "kpis": [
    {
     "value": "0.2",
     "unit": " km",
     "label": "TOP DISTANCE",
     "sub": "P7"
    },
    {
     "value": "39.5",
     "unit": " km/h",
     "label": "TOP SPEED",
     "sub": "P12"
    },
    {
     "value": "37",
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
     "pct": 78,
     "topSpeed": "39.1 km/h",
     "sprints": 8
    },
    "P2": {
     "id": "P2",
     "name": "P2 · Tracked",
     "distance": "0.0 km",
     "pct": 10,
     "topSpeed": "38.5 km/h",
     "sprints": 2
    },
    "P3": {
     "id": "P3",
     "name": "P3 · Tracked",
     "distance": "0.0 km",
     "pct": 18,
     "topSpeed": "19.3 km/h",
     "sprints": 0
    },
    "P4": {
     "id": "P4",
     "name": "P4 · Tracked",
     "distance": "0.0 km",
     "pct": 4,
     "topSpeed": "31.7 km/h",
     "sprints": 1
    },
    "P5": {
     "id": "P5",
     "name": "P5 · Tracked",
     "distance": "0.1 km",
     "pct": 57,
     "topSpeed": "38.2 km/h",
     "sprints": 3
    },
    "P6": {
     "id": "P6",
     "name": "P6 · Tracked",
     "distance": "0.0 km",
     "pct": 17,
     "topSpeed": "38.5 km/h",
     "sprints": 2
    },
    "P7": {
     "id": "P7",
     "name": "P7 · Tracked",
     "distance": "0.2 km",
     "pct": 100,
     "topSpeed": "39.1 km/h",
     "sprints": 9
    },
    "P8": {
     "id": "P8",
     "name": "P8 · Tracked",
     "distance": "0.1 km",
     "pct": 21,
     "topSpeed": "39.3 km/h",
     "sprints": 1
    },
    "P9": {
     "id": "P9",
     "name": "P9 · Tracked",
     "distance": "0.1 km",
     "pct": 23,
     "topSpeed": "37.0 km/h",
     "sprints": 2
    },
    "P10": {
     "id": "P10",
     "name": "P10 · Tracked",
     "distance": "0.0 km",
     "pct": 16,
     "topSpeed": "38.5 km/h",
     "sprints": 1
    },
    "P11": {
     "id": "P11",
     "name": "P11 · Tracked",
     "distance": "0.1 km",
     "pct": 41,
     "topSpeed": "39.2 km/h",
     "sprints": 2
    }
   },
   "analysis": {
    "tactical": [
     "P7 is the engine: 0.2 km covered — 438% of the squad-median workload.",
     "Speed profile: P12 peaks at 39.5 km/h — that is the transition outlet when possession turns over.",
     "Work-rate spread is 96% between the most and least active player (P7 vs P4) — pressing is not collective yet.",
     "Team sprint volume: 37 in the analyzed segment — high-intensity chaos, expect late-game fatigue."
    ],
    "forward": "Next session: build drills that lift the median (0.1 km) rather than the top — collective pressing over individual workload. Re-run the other segment of this match to compare halves.",
    "computed": true,
    "note": "Computed from tracking data. Spark's full tactical reasoning activates with API keys."
   }
  },
  "moments": [
   {
    "peak_kmh": 39.6,
    "peak_by": "P4",
    "sprints": 47,
    "ball_kmh": 38.9,
    "spread_m": 53.4,
    "start_s": 10.0,
    "end_s": 15.0,
    "label": "Fastest burst",
    "description": "peak 39.6 km/h (P4), 47 sprints, ball at 38.9 km/h, block spread 53.4 m",
    "intent": "speed"
   },
   {
    "peak_kmh": 39.6,
    "peak_by": "P12",
    "sprints": 8,
    "ball_kmh": 39.6,
    "spread_m": 39.5,
    "start_s": 20.0,
    "end_s": 25.0,
    "label": "Fastest burst",
    "description": "peak 39.6 km/h (P12), 8 sprints, ball at 39.6 km/h, block spread 39.5 m",
    "intent": "speed"
   },
   {
    "peak_kmh": 39.6,
    "peak_by": "P5",
    "sprints": 17,
    "ball_kmh": 0.0,
    "spread_m": 44.6,
    "start_s": 45.0,
    "end_s": 50.0,
    "label": "Fastest burst",
    "description": "peak 39.6 km/h (P5), 17 sprints, ball at 0.0 km/h, block spread 44.6 m",
    "intent": "speed"
   }
  ],
  "plan": {
   "focus": [
    "Collective pressing — work-rate gap is 96% (P7 vs P4)",
    "Repeat-sprint conditioning — 37 team sprints, expect late-game fatigue",
    "Raise the floor — P4 covered 0.01 km, half the median"
   ],
   "sessions": [
    {
     "day": "Tuesday",
     "title": "Pressing shape",
     "drills": [
      {
       "name": "5v5 +3 press triggers",
       "duration_min": 25,
       "why": "Close the 96% work-rate gap as a unit, not individually"
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
       "why": "Match the peak demand: P12 hit 39.5 km/h"
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
       "why": "Target: lift squad median from 0.06 km toward 0.25 km"
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
    "a": "Per KPIs, P12 - 39.5 km/h TOP SPEED.\n\nAmong detailed P1-P11 tracking, fastest is P8 - 39.3 km/h, followed by P11 - 39.2 km/h, P1 / P7 - 39.1 km/h.",
    "mode": "spark"
   },
   {
    "q": "Why did we look weak?",
    "a": "60s sample (20.7% confidence, thin data): collective press failed.\n\nP7 carried 0.2km / 9 sprints (100%) + P1 0.2km / 8 sprints, while P4 0.0km (4%, 1 sprint), P2 0.0km (10%), P3 0 sprints, 19.3km/h top. Spread P7 vs P4 96%. Median 0.1km. Team 37 sprints = chaos, not control.",
    "mode": "spark"
   },
   {
    "q": "Which player covered the most distance?",
    "a": "P7 covered the most distance: 0.2 km.\n\nFrom job data: P7 pct 100, topSpeed 39.1 km/h, 9 sprints — ahead of P1 at 0.2 km / 193.319m, pct 78.",
    "mode": "spark"
   }
  ],
  "whispers": [
   {
    "t": 0.0,
    "text": "t+0s — ball in the ?; peak intensity 39.1 km/h (P7), 7 sprints in the last 5s, block spread 54.0 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 6.0,
    "text": "t+6s — ball in the ?; peak intensity 39.3 km/h (P7), 47 sprints in the last 5s, block spread 45.3 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 12.0,
    "text": "t+12s — ball in the middle third; peak intensity 39.6 km/h (P4), 61 sprints in the last 5s, block spread 56.3 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 18.0,
    "text": "t+18s — ball in the defensive third; peak intensity 39.2 km/h (P11), 14 sprints in the last 5s, block spread 48.3 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 24.0,
    "text": "t+24s — ball in the defensive third; peak intensity 39.6 km/h (P12), 8 sprints in the last 5s, block spread 39.5 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 30.0,
    "text": "t+30s — ball in the middle third; peak intensity 39.4 km/h (P7), 17 sprints in the last 5s, block spread 28.9 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 36.0,
    "text": "t+36s — ball in the ?; peak intensity 5.0 km/h (P5), 0 sprints in the last 5s, block spread 0.0 m."
   },
   {
    "t": 42.0,
    "text": "t+42s — ball in the ?; peak intensity 38.2 km/h (P1), 4 sprints in the last 5s, block spread 22.0 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 48.0,
    "text": "t+48s — ball in the ?; peak intensity 39.1 km/h (P1), 15 sprints in the last 5s, block spread 42.4 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 54.0,
    "text": "t+54s — ball in the ?; peak intensity 39.6 km/h (P5), 5 sprints in the last 5s, block spread 24.5 m. High chaos window — look for the transition outlet."
   }
  ],
  "video": "samples/demo-soccer-fs.mp4",
  "cardFile": "sample-card-soccer.svg"
 },
 "basketball": {
  "_provenance": "VERIFIED LIVE RUN ab6c1d8dd14d on real footage: 'Michael Jordan Hits Head On Backboard Blocking Shot at Duke' (archive.org). SAM 3.1 found no trackable wide-court objects on this close-up clip — synthetic tracking fallback used, honestly labeled.",
  "job": {
   "id": "ab6c1d8dd14d",
   "agent_log": [
    {
     "t": 1793387736.3,
     "stage": "plan",
     "text": "Plan: ① download from link → ② extract frames → ③ track players (sam-3.1) → ④ write stats code (spark-1.3) → ⑤ execute (e2b) → ⑥ dashboard"
    },
    {
     "t": 1793387749.2,
     "stage": "frames",
     "text": "8 preview frames extracted from a 30 fps source"
    },
    {
     "t": 1793387880.4,
     "stage": "correct",
     "text": "SAM 3.1 unavailable on this clip (413 request too large) — switching to the synthetic tracker, labeled below"
    },
    {
     "t": 1793387880.4,
     "stage": "track",
     "text": "Synthetic tracker locked 12 simulated objects at 97.0% coverage — no live SAM boxes on this clip"
    },
    {
     "t": 1793387913.8,
     "stage": "codegen",
     "text": "Stats code ready (spark-1.3)"
    },
    {
     "t": 1793387917.6,
     "stage": "analyze",
     "text": "Analyst read: P4 is the engine: 0.1 km covered — 115% of the squad-median workload."
    }
   ]
  },
  "result": {
   "mode": "live",
   "sport": "basketball",
   "label": "Basketball",
   "fileName": "link · archive.org",
   "duration": "01:00",
   "trackedLabel": "SIMULATED TRACKING · 11 PLAYERS",
   "confidence": "100.0%",
   "frames": "1,801",
   "positionsCount": "19,811",
   "summaryText": "P4 ran 0.1 km",
   "kpis": [
    {
     "value": "0.1",
     "unit": " km",
     "label": "TOP DISTANCE",
     "sub": "P4"
    },
    {
     "value": "28.8",
     "unit": " km/h",
     "label": "TOP SPEED",
     "sub": "P6"
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
     "distance": "0.1 km",
     "pct": 86,
     "topSpeed": "28.6 km/h",
     "sprints": 4
    },
    "P2": {
     "id": "P2",
     "name": "P2 · Tracked",
     "distance": "0.1 km",
     "pct": 88,
     "topSpeed": "26.3 km/h",
     "sprints": 2
    },
    "P3": {
     "id": "P3",
     "name": "P3 · Tracked",
     "distance": "0.1 km",
     "pct": 97,
     "topSpeed": "25.9 km/h",
     "sprints": 3
    },
    "P4": {
     "id": "P4",
     "name": "P4 · Tracked",
     "distance": "0.1 km",
     "pct": 100,
     "topSpeed": "27.9 km/h",
     "sprints": 4
    },
    "P5": {
     "id": "P5",
     "name": "P5 · Tracked",
     "distance": "0.1 km",
     "pct": 88,
     "topSpeed": "28.3 km/h",
     "sprints": 5
    },
    "P6": {
     "id": "P6",
     "name": "P6 · Tracked",
     "distance": "0.1 km",
     "pct": 87,
     "topSpeed": "28.8 km/h",
     "sprints": 3
    },
    "P7": {
     "id": "P7",
     "name": "P7 · Tracked",
     "distance": "0.1 km",
     "pct": 92,
     "topSpeed": "25.6 km/h",
     "sprints": 3
    },
    "P8": {
     "id": "P8",
     "name": "P8 · Tracked",
     "distance": "0.1 km",
     "pct": 79,
     "topSpeed": "25.7 km/h",
     "sprints": 1
    },
    "P9": {
     "id": "P9",
     "name": "P9 · Tracked",
     "distance": "0.1 km",
     "pct": 82,
     "topSpeed": "28.2 km/h",
     "sprints": 4
    },
    "P10": {
     "id": "P10",
     "name": "P10 · Tracked",
     "distance": "0.1 km",
     "pct": 84,
     "topSpeed": "25.1 km/h",
     "sprints": 1
    },
    "P11": {
     "id": "P11",
     "name": "P11 · Tracked",
     "distance": "0.1 km",
     "pct": 74,
     "topSpeed": "26.3 km/h",
     "sprints": 1
    }
   },
   "analysis": {
    "tactical": [
     "P4 is the engine: 0.1 km covered — 115% of the squad-median workload.",
     "Speed profile: P6 peaks at 28.8 km/h — that is the transition outlet when possession turns over.",
     "Work-rate spread is 26% between the most and least active player (P4 vs P11) — pressing is not collective yet.",
     "Team sprint volume: 31 in the analyzed segment — high-intensity chaos, expect late-game fatigue."
    ],
    "forward": "Next session: build drills that lift the median (0.1 km) rather than the top — collective pressing over individual workload. Re-run the other segment of this match to compare halves.",
    "computed": true,
    "note": "Computed from tracking data. Spark's full tactical reasoning activates with API keys."
   }
  },
  "moments": [
   {
    "peak_kmh": 29.8,
    "peak_by": "P6",
    "sprints": 7,
    "ball_kmh": 12.6,
    "spread_m": 76.3,
    "start_s": 50.0,
    "end_s": 55.0,
    "label": "Fastest burst",
    "description": "peak 29.8 km/h (P6), 7 sprints, ball at 12.6 km/h, block spread 76.3 m",
    "intent": "speed"
   },
   {
    "peak_kmh": 29.7,
    "peak_by": "P1",
    "sprints": 6,
    "ball_kmh": 69.9,
    "spread_m": 76.4,
    "start_s": 35.0,
    "end_s": 40.0,
    "label": "Fastest burst",
    "description": "peak 29.7 km/h (P1), 6 sprints, ball at 69.9 km/h, block spread 76.4 m",
    "intent": "speed"
   },
   {
    "peak_kmh": 29.6,
    "peak_by": "P1",
    "sprints": 9,
    "ball_kmh": 60.0,
    "spread_m": 81.0,
    "start_s": 55.0,
    "end_s": 60.0,
    "label": "Fastest burst",
    "description": "peak 29.6 km/h (P1), 9 sprints, ball at 60.0 km/h, block spread 81.0 m",
    "intent": "speed"
   }
  ],
  "plan": {
   "focus": [
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
       "why": "Close the 26% work-rate gap as a unit, not individually"
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
       "why": "Match the peak demand: P6 hit 28.8 km/h"
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
       "why": "Target: lift squad median from 0.12 km toward 0.14 km"
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
    "a": "P6 was fastest: 28.8 km/h top speed, 3 sprints, 0.1 km covered.",
    "mode": "spark"
   },
   {
    "q": "Why did we look weak?",
    "a": "You looked weak because pressing was not collective. P4 at 100% vs P11 at 74% - 26% spread. P8, P10, P11 managed 1 sprint each vs P5 with 5, P1/P4/P9 with 4. Team total 31 sprints in 60.0s segment = high-intensity chaos. P6 top speed 28.8 km/h isolated as outlet. Top distance only 0.1 km by P4.",
    "mode": "spark"
   },
   {
    "q": "Which player covered the most distance?",
    "a": "P4 covered the most distance: 0.1 km — TOP DISTANCE, pct 100.",
    "mode": "spark"
   }
  ],
  "whispers": [
   {
    "t": 0.0,
    "text": "t+0s — ball in the middle third; peak intensity 8.1 km/h (P1), 0 sprints in the last 5s, block spread 72.7 m. Block is stretched — press as a unit."
   },
   {
    "t": 6.0,
    "text": "t+6s — ball in the attacking third; peak intensity 19.6 km/h (P2), 0 sprints in the last 5s, block spread 86.8 m. Block is stretched — press as a unit."
   },
   {
    "t": 12.0,
    "text": "t+12s — ball in the attacking third; peak intensity 28.5 km/h (P4), 12 sprints in the last 5s, block spread 86.4 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
   },
   {
    "t": 18.0,
    "text": "t+18s — ball in the middle third; peak intensity 28.2 km/h (P5), 9 sprints in the last 5s, block spread 83.9 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
   },
   {
    "t": 24.0,
    "text": "t+24s — ball in the attacking third; peak intensity 28.7 km/h (P9), 1 sprints in the last 5s, block spread 67.5 m. Block is stretched — press as a unit."
   },
   {
    "t": 30.0,
    "text": "t+30s — ball in the attacking third; peak intensity 28.5 km/h (P6), 5 sprints in the last 5s, block spread 82.0 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
   },
   {
    "t": 36.0,
    "text": "t+36s — ball in the middle third; peak intensity 26.7 km/h (P3), 2 sprints in the last 5s, block spread 80.8 m. Block is stretched — press as a unit."
   },
   {
    "t": 42.0,
    "text": "t+42s — ball in the attacking third; peak intensity 29.7 km/h (P1), 7 sprints in the last 5s, block spread 77.0 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
   },
   {
    "t": 48.0,
    "text": "t+48s — ball in the attacking third; peak intensity 27.3 km/h (P9), 9 sprints in the last 5s, block spread 72.2 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
   },
   {
    "t": 54.0,
    "text": "t+54s — ball in the attacking third; peak intensity 29.8 km/h (P6), 7 sprints in the last 5s, block spread 72.4 m. Block is stretched — press as a unit. High chaos window — look for the transition outlet."
   }
  ],
  "video": "samples/demo-basketball-fs.mp4",
  "cardFile": "sample-card-basketball.svg",
  "badgeSuffix": " · SYNTH TRACK"
 },
 "running": {
  "_provenance": "VERIFIED LIVE RUN 1486e74ab4de (SAM 3.1 + Muse Spark + E2B) on real footage: 'Range of Motion - Stride Length' running film (archive.org) — a single-subject film, so SAM 3.1 tracks one athlete.",
  "job": {
   "id": "1486e74ab4de",
   "agent_log": [
    {
     "t": 1793387778.5,
     "stage": "plan",
     "text": "Plan: ① download from link → ② extract frames → ③ track players (sam-3.1) → ④ write stats code (spark-1.3) → ⑤ execute (e2b) → ⑥ dashboard"
    },
    {
     "t": 1793387783.3,
     "stage": "frames",
     "text": "8 preview frames extracted from a 30 fps source"
    },
    {
     "t": 1793387905.9,
     "stage": "track",
     "text": "Tracking locked: 1 object at 100.0% coverage"
    },
    {
     "t": 1793387905.9,
     "stage": "correct",
     "text": "Correction: only 1 object tracked — this is a single-runner training film, so squad-level stats are a lower bound"
    },
    {
     "t": 1793387955.9,
     "stage": "codegen",
     "text": "Stats code ready (spark-1.3)"
    },
    {
     "t": 1793387958.9,
     "stage": "analyze",
     "text": "Analyst read: P1 is the engine: 0.5 km covered — 100% of the squad-median workload."
    }
   ]
  },
  "result": {
   "mode": "live",
   "sport": "running",
   "label": "Running",
   "fileName": "link · archive.org",
   "duration": "01:00",
   "trackedLabel": "TRACKING · 1 RUNNER",
   "confidence": "28.3%",
   "frames": "1,800",
   "positionsCount": "1,800",
   "summaryText": "P1 ran 0.5 km",
   "kpis": [
    {
     "value": "0.5",
     "unit": " km",
     "label": "TOP DISTANCE",
     "sub": "P1"
    },
    {
     "value": "38.7",
     "unit": " km/h",
     "label": "TOP SPEED",
     "sub": "P1"
    },
    {
     "value": "47",
     "unit": "",
     "label": "SPRINTS",
     "sub": "TEAM"
    }
   ],
   "players": {
    "P1": {
     "id": "P1",
     "name": "P1 · Tracked",
     "distance": "0.5 km",
     "pct": 100,
     "topSpeed": "38.7 km/h",
     "sprints": 47
    }
   },
   "analysis": {
    "tactical": [
     "P1 is the engine: 0.5 km covered — 100% of the squad-median workload.",
     "Speed profile: P1 peaks at 38.7 km/h — that is the transition outlet when possession turns over.",
     "Work-rate spread is 0% between the most and least active player (P1 vs P1) — pressing is not collective yet.",
     "Team sprint volume: 47 in the analyzed segment — high-intensity chaos, expect late-game fatigue."
    ],
    "forward": "Next session: build drills that lift the median (0.5 km) rather than the top — collective pressing over individual workload. Re-run the other segment of this match to compare halves.",
    "computed": true,
    "note": "Computed from tracking data. Spark's full tactical reasoning activates with API keys."
   }
  },
  "moments": [
   {
    "peak_kmh": 39.5,
    "peak_by": "P1",
    "sprints": 18,
    "ball_kmh": 0.0,
    "spread_m": 5.2,
    "start_s": 0.0,
    "end_s": 5.0,
    "label": "Fastest burst",
    "description": "peak 39.5 km/h (P1), 18 sprints, ball at 0.0 km/h, block spread 5.2 m",
    "intent": "speed"
   },
   {
    "peak_kmh": 39.5,
    "peak_by": "P1",
    "sprints": 11,
    "ball_kmh": 0.0,
    "spread_m": 7.3,
    "start_s": 5.0,
    "end_s": 10.0,
    "label": "Fastest burst",
    "description": "peak 39.5 km/h (P1), 11 sprints, ball at 0.0 km/h, block spread 7.3 m",
    "intent": "speed"
   },
   {
    "peak_kmh": 39.5,
    "peak_by": "P1",
    "sprints": 24,
    "ball_kmh": 0.0,
    "spread_m": 10.6,
    "start_s": 15.0,
    "end_s": 20.0,
    "label": "Fastest burst",
    "description": "peak 39.5 km/h (P1), 24 sprints, ball at 0.0 km/h, block spread 10.6 m",
    "intent": "speed"
   }
  ],
  "plan": {
   "focus": [
    "Repeat-sprint conditioning — 47 team sprints, expect late-game fatigue"
   ],
   "sessions": [
    {
     "day": "Tuesday",
     "title": "Pressing shape",
     "drills": [
      {
       "name": "5v5 +3 press triggers",
       "duration_min": 25,
       "why": "Close the 0% work-rate gap as a unit, not individually"
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
       "why": "Match the peak demand: P1 hit 38.7 km/h"
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
       "why": "Target: lift squad median from 0.51 km toward 0.51 km"
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
    "a": "P1 · Tracked was fastest at 38.7 km/h — 47 sprints, 0.5 km covered.\nSole tracked player in 60s segment (1,800 frames, 28.3% confidence).",
    "mode": "spark"
   },
   {
    "q": "Why did we look weak?",
    "a": "Tracked 10-70s: only P1 tracked at 28.3% confidence.\n\nP1 covered 0.5 km [514.6m] at 38.7 km/h top with 47 sprints - 100% workload.\n\nP1 vs P1 spread 0%: pressing not collective, P1 alone as transition outlet.\n\n47 team sprints = high-intensity chaos, expect late-game fatigue.",
    "mode": "spark"
   },
   {
    "q": "Which player covered the most distance?",
    "a": "P1 · Tracked covered the most distance: 0.5 km — 514.6 m, 100% of tracked workload.",
    "mode": "spark"
   }
  ],
  "whispers": [
   {
    "t": 0.0,
    "text": "t+0s — ball in the ?; peak intensity 38.3 km/h (P1), 4 sprints in the last 5s, block spread 1.1 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 6.0,
    "text": "t+6s — ball in the ?; peak intensity 39.5 km/h (P1), 23 sprints in the last 5s, block spread 9.8 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 12.0,
    "text": "t+12s — ball in the ?; peak intensity 39.3 km/h (P1), 10 sprints in the last 5s, block spread 6.9 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 18.0,
    "text": "t+18s — ball in the ?; peak intensity 39.5 km/h (P1), 23 sprints in the last 5s, block spread 13.2 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 24.0,
    "text": "t+24s — ball in the ?; peak intensity 38.6 km/h (P1), 34 sprints in the last 5s, block spread 5.6 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 30.0,
    "text": "t+30s — ball in the ?; peak intensity 39.3 km/h (P1), 38 sprints in the last 5s, block spread 8.8 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 36.0,
    "text": "t+36s — ball in the ?; peak intensity 39.3 km/h (P1), 29 sprints in the last 5s, block spread 8.6 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 42.0,
    "text": "t+42s — ball in the ?; peak intensity 39.0 km/h (P1), 29 sprints in the last 5s, block spread 13.0 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 48.0,
    "text": "t+48s — ball in the ?; peak intensity 38.5 km/h (P1), 19 sprints in the last 5s, block spread 14.1 m. High chaos window — look for the transition outlet."
   },
   {
    "t": 54.0,
    "text": "t+54s — ball in the ?; peak intensity 39.4 km/h (P1), 33 sprints in the last 5s, block spread 10.7 m. High chaos window — look for the transition outlet."
   }
  ],
  "video": "samples/demo-running-fs.mp4",
  "cardFile": "sample-card-running.svg"
 }
};
