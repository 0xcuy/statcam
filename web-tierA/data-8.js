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
    "text": "t+0s — peak intensity 39.1 km/h (P7), 3 sprint episodes in the last 5s, block spread 54.0 m."
   },
   {
    "t": 6.0,
    "text": "t+6s — peak intensity 39.3 km/h (P7), 11 sprint episodes in the last 5s, block spread 45.3 m. High-intensity window — transition fitness shows here."
   },
   {
    "t": 12.0,
    "text": "t+12s — ball in the middle third; peak intensity 39.6 km/h (P4), 13 sprint episodes in the last 5s, block spread 56.3 m. High-intensity window — transition fitness shows here."
   },
   {
    "t": 18.0,
    "text": "t+18s — ball in the attacking third; peak intensity 39.2 km/h (P11), 5 sprint episodes in the last 5s, block spread 48.3 m. High-intensity window — transition fitness shows here."
   },
   {
    "t": 24.0,
    "text": "t+24s — ball in the middle third; peak intensity 39.6 km/h (P12), 4 sprint episodes in the last 5s, block spread 39.5 m. High-intensity window — transition fitness shows here."
   },
   {
    "t": 30.0,
    "text": "t+30s — ball in the attacking third; peak intensity 39.4 km/h (P7), 9 sprint episodes in the last 5s, block spread 28.9 m. High-intensity window — transition fitness shows here."
   },
   {
    "t": 36.0,
    "text": "t+36s — peak intensity 5.0 km/h (P5), 0 sprint episodes in the last 5s, block spread 0.0 m."
   },
   {
    "t": 42.0,
    "text": "t+42s — peak intensity 38.2 km/h (P1), 2 sprint episodes in the last 5s, block spread 22.0 m."
   },
   {
    "t": 48.0,
    "text": "t+48s — peak intensity 39.1 km/h (P1), 4 sprint episodes in the last 5s, block spread 42.4 m. High-intensity window — transition fitness shows here."
   },
   {
    "t": 54.0,
    "text": "t+54s — peak intensity 39.6 km/h (P5), 3 sprint episodes in the last 5s, block spread 24.5 m."
   }
  ],
  "video": "samples/demo-soccer-fs.mp4",
  "cardFile": "sample-card-soccer.svg"
 },
 "basketball": {
  "_provenance": "VERIFIED LIVE RUN 7cc2e583b2f5 (SAM 3.1 + Muse Spark + E2B, no fallback) on real footage: 'MVHS vs Payson Wide Angle 20250204' by Jared Olsen (YouTube) — fixed full-court camera, court-band crop. Demo use with credit; all rights remain with the rights holder.",
  "job": {
   "id": "7cc2e583b2f5",
   "agent_log": [
    {
     "t": 1793397838.8,
     "stage": "plan",
     "text": "Plan: ① ingest upload → ② extract frames → ③ track players (sam-3.1) → ④ write stats code (spark-1.3) → ⑤ execute (e2b) → ⑥ dashboard"
    },
    {
     "t": 1793397841.7,
     "stage": "frames",
     "text": "8 preview frames extracted from a 30 fps source"
    },
    {
     "t": 1793397851.1,
     "stage": "correct",
     "text": "SAM payload re-encoded to 1280px without audio (22 MB → 7 MB) — Meta rejects larger uploads"
    },
    {
     "t": 1793398022.8,
     "stage": "track",
     "text": "Tracking locked: 15 objects at 99.9% confidence"
    },
    {
     "t": 1793398063.9,
     "stage": "codegen",
     "text": "Stats code ready (spark-1.3)"
    },
    {
     "t": 1793398067.3,
     "stage": "analyze",
     "text": "Analyst read: P13 is the engine: 0.1 km covered — 204% of the squad-median workload."
    }
   ]
  },
  "result": {
   "mode": "live",
   "pipeline": {
    "track": "sam-3.1",
    "codegen": "spark-1.3",
    "exec": "e2b"
   },
   "sport": "basketball",
   "label": "Basketball",
   "fileName": "mvhs-court.mp4",
   "duration": "01:00",
   "trackedLabel": "TRACKING · 11 PLAYERS",
   "confidence": "75.0%",
   "frames": "1,800",
   "positionsCount": "19,800",
   "summaryText": "P13 ran 0.1 km",
   "notes": "fps=30.0 threshold=22.0km/h; 15 players, 22216 points total. x,y used as center meters, no rescale. distance=sum centroid steps; top_speed=max 1s-window path/time; sprints=non-overlapping 1s windows>thr; heatmap=3x8 global-bounds occupancy proportion.",
   "kpis": [
    {
     "value": "0.1",
     "unit": " km",
     "label": "TOP DISTANCE",
     "sub": "P13"
    },
    {
     "value": "26.4",
     "unit": " km/h",
     "label": "TOP SPEED",
     "sub": "P13"
    },
    {
     "value": "2",
     "unit": "",
     "label": "SPRINTS",
     "sub": "TEAM"
    }
   ],
   "players": {
    "P1": {
     "id": "P1",
     "name": "P1 · Tracked",
     "color": "#4DA3FF",
     "badgeBg": "#0064E0",
     "distance": "0.1 km",
     "pct": 49,
     "topSpeed": "17.3 km/h",
     "sprints": 0,
     "animClass": "sc-p7",
     "heatmap": [
      [
       0.0,
       0.028409090909090908,
       0.003977272727272727,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.0,
       0.3886363636363636,
       0.2528409090909091,
       0.07670454545454546,
       0.02784090909090909,
       0.03579545454545455,
       0.08125,
       0.09147727272727273
      ],
      [
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.013068181818181817
      ]
     ]
    },
    "P2": {
     "id": "P2",
     "name": "P2 · Tracked",
     "color": "#FF6B6B",
     "badgeBg": "#E0245E",
     "distance": "0.1 km",
     "pct": 58,
     "topSpeed": "17.3 km/h",
     "sprints": 0,
     "animClass": "sc-p10",
     "heatmap": [
      [
       0.0,
       0.018679119412941963,
       0.2008005336891261,
       0.11274182788525684,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.0,
       0.00066711140760507,
       0.142761841227485,
       0.03602401601067378,
       0.0266844563042028,
       0.04136090727151434,
       0.24549699799866578,
       0.0
      ],
      [
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.14209472981987992,
       0.03268845897264843,
       0.0
      ]
     ]
    },
    "P3": {
     "id": "P3",
     "name": "P3 · Tracked",
     "color": "#4DA3FF",
     "badgeBg": "#0064E0",
     "distance": "0.0 km",
     "pct": 19,
     "topSpeed": "4.2 km/h",
     "sprints": 0,
     "animClass": "sc-p4",
     "heatmap": [
      [
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       1.0
      ]
     ]
    },
    "P4": {
     "id": "P4",
     "name": "P4 · Tracked",
     "color": "#4DA3FF",
     "badgeBg": "#E0245E",
     "distance": "0.1 km",
     "pct": 37,
     "topSpeed": "8.3 km/h",
     "sprints": 0,
     "animClass": "sc-p4",
     "heatmap": [
      [
       0.0,
       0.011333333333333334,
       0.027333333333333334,
       0.0,
       0.002,
       0.0,
       0.0,
       0.0
      ],
      [
       0.0,
       0.628,
       0.24666666666666667,
       0.046,
       0.03866666666666667,
       0.0,
       0.0,
       0.0
      ],
      [
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ]
     ]
    },
    "P5": {
     "id": "P5",
     "name": "P5 · Tracked",
     "color": "#FF6B6B",
     "badgeBg": "#0064E0",
     "distance": "0.0 km",
     "pct": 24,
     "topSpeed": "10.5 km/h",
     "sprints": 0,
     "animClass": "sc-p4",
     "heatmap": [
      [
       0.0,
       0.007518796992481203,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.37593984962406013,
       0.5585392051557465,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.05800214822771214,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ]
     ]
    },
    "P6": {
     "id": "P6",
     "name": "P6 · Tracked",
     "color": "#4DA3FF",
     "badgeBg": "#E0245E",
     "distance": "0.0 km",
     "pct": 15,
     "topSpeed": "12.8 km/h",
     "sprints": 0,
     "animClass": "sc-p4",
     "heatmap": [
      [
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.0,
       0.7521551724137931,
       0.010775862068965518,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.004310344827586207,
       0.02586206896551724,
       0.20689655172413793,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ]
     ]
    },
    "P7": {
     "id": "P7",
     "name": "P7 · Tracked",
     "color": "#FF6B6B",
     "badgeBg": "#0064E0",
     "distance": "0.1 km",
     "pct": 58,
     "topSpeed": "22.4 km/h",
     "sprints": 1,
     "animClass": "sc-p4",
     "heatmap": [
      [
       0.0,
       0.02008520998174072,
       0.017650639074863056,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.0,
       0.05356055995130858,
       0.5946439440048692,
       0.05356055995130858,
       0.04747413268411443,
       0.06999391357273281,
       0.03712720632988436,
       0.0
      ],
      [
       0.06999391357273281,
       0.035909920876445525,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ]
     ]
    },
    "P8": {
     "id": "P8",
     "name": "P8 · Tracked",
     "color": "#4DA3FF",
     "badgeBg": "#E0245E",
     "distance": "0.0 km",
     "pct": 28,
     "topSpeed": "12.1 km/h",
     "sprints": 0,
     "animClass": "sc-p4",
     "heatmap": [
      [
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.20828258221680876,
       0.0
      ],
      [
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.034713763702801465,
       0.7570036540803897
      ]
     ]
    },
    "P9": {
     "id": "P9",
     "name": "P9 · Tracked",
     "color": "#4DA3FF",
     "badgeBg": "#0064E0",
     "distance": "0.1 km",
     "pct": 48,
     "topSpeed": "12.6 km/h",
     "sprints": 0,
     "animClass": "sc-p4",
     "heatmap": [
      [
       0.0,
       0.0,
       0.040381379697139654,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.04374649467190129,
       0.49242849130678634,
       0.16769489624228828,
       0.03365114974761638,
       0.03813796971396523,
       0.07739764441951767,
       0.10544026920919798,
       0.0
      ],
      [
       0.0,
       0.0011217049915872126,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ]
     ]
    },
    "P10": {
     "id": "P10",
     "name": "P10 · Tracked",
     "color": "#FF6B6B",
     "badgeBg": "#E0245E",
     "distance": "0.1 km",
     "pct": 67,
     "topSpeed": "16.7 km/h",
     "sprints": 0,
     "animClass": "sc-p4",
     "heatmap": [
      [
       0.0,
       0.0,
       0.07579462102689487,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.07090464547677261,
       0.3404645476772616,
       0.1356968215158924,
       0.034229828850855744,
       0.0550122249388753,
       0.10941320293398533,
       0.08251833740831296,
       0.0
      ],
      [
       0.09596577017114914,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ]
     ]
    },
    "P11": {
     "id": "P11",
     "name": "P11 · Tracked",
     "color": "#4DA3FF",
     "badgeBg": "#0064E0",
     "distance": "0.1 km",
     "pct": 62,
     "topSpeed": "19.5 km/h",
     "sprints": 0,
     "animClass": "sc-p4",
     "heatmap": [
      [
       0.0,
       0.002898550724637681,
       0.01565217391304348,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.1443478260869565,
       0.2110144927536232,
       0.3130434782608696,
       0.02666666666666667,
       0.029565217391304348,
       0.034782608695652174,
       0.13391304347826086,
       0.0
      ],
      [
       0.04,
       0.03246376811594203,
       0.01565217391304348,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ]
     ]
    }
   },
   "analysis": {
    "tactical": [
     "P13 is the engine: 0.1 km covered — 204% of the squad-median workload.",
     "Speed profile: P13 peaks at 26.4 km/h — that is the transition outlet when possession turns over.",
     "Work-rate spread is 85% between the most and least active player (P13 vs P6) — pressing is not collective yet.",
     "Team sprint volume: 2 in the analyzed segment — controlled intensity."
    ],
    "forward": "Next session: build drills that lift the median (0.1 km) rather than the top — collective pressing over individual workload. Re-run the other segment of this match to compare halves.",
    "computed": true,
    "note": "Computed from tracking data. Spark's full tactical reasoning activates with API keys."
   },
   "_raw_stats": {
    "players": [
     {
      "id": "P1",
      "distance_m": 69.76910477349439,
      "top_speed_kmh": 17.274922163460428,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.028409090909090908,
        0.003977272727272727,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.0,
        0.3886363636363636,
        0.2528409090909091,
        0.07670454545454546,
        0.02784090909090909,
        0.03579545454545455,
        0.08125,
        0.09147727272727273
       ],
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.013068181818181817
       ]
      ]
     },
     {
      "id": "P2",
      "distance_m": 82.21038553946653,
      "top_speed_kmh": 17.31609447647786,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.018679119412941963,
        0.2008005336891261,
        0.11274182788525684,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.0,
        0.00066711140760507,
        0.142761841227485,
        0.03602401601067378,
        0.0266844563042028,
        0.04136090727151434,
        0.24549699799866578,
        0.0
       ],
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.14209472981987992,
        0.03268845897264843,
        0.0
       ]
      ]
     },
     {
      "id": "P3",
      "distance_m": 27.00653458529266,
      "top_speed_kmh": 4.201762787008808,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0
       ]
      ]
     },
     {
      "id": "P4",
      "distance_m": 52.81710260565756,
      "top_speed_kmh": 8.348948331068213,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.011333333333333334,
        0.027333333333333334,
        0.0,
        0.002,
        0.0,
        0.0,
        0.0
       ],
       [
        0.0,
        0.628,
        0.24666666666666667,
        0.046,
        0.03866666666666667,
        0.0,
        0.0,
        0.0
       ],
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ]
      ]
     },
     {
      "id": "P5",
      "distance_m": 33.9273135515866,
      "top_speed_kmh": 10.528643321465406,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.007518796992481203,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.37593984962406013,
        0.5585392051557465,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.05800214822771214,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ]
      ]
     },
     {
      "id": "P6",
      "distance_m": 21.31431342990984,
      "top_speed_kmh": 12.825776374747312,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.0,
        0.7521551724137931,
        0.010775862068965518,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.004310344827586207,
        0.02586206896551724,
        0.20689655172413793,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ]
      ]
     },
     {
      "id": "P7",
      "distance_m": 83.19124693849267,
      "top_speed_kmh": 22.40630582667384,
      "sprints": 1,
      "heatmap": [
       [
        0.0,
        0.02008520998174072,
        0.017650639074863056,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.0,
        0.05356055995130858,
        0.5946439440048692,
        0.05356055995130858,
        0.04747413268411443,
        0.06999391357273281,
        0.03712720632988436,
        0.0
       ],
       [
        0.06999391357273281,
        0.035909920876445525,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ]
      ]
     },
     {
      "id": "P8",
      "distance_m": 40.11921135840281,
      "top_speed_kmh": 12.100012210381175,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.20828258221680876,
        0.0
       ],
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.034713763702801465,
        0.7570036540803897
       ]
      ]
     },
     {
      "id": "P9",
      "distance_m": 68.24438814528219,
      "top_speed_kmh": 12.580045638966936,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.0,
        0.040381379697139654,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.04374649467190129,
        0.49242849130678634,
        0.16769489624228828,
        0.03365114974761638,
        0.03813796971396523,
        0.07739764441951767,
        0.10544026920919798,
        0.0
       ],
       [
        0.0,
        0.0011217049915872126,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ]
      ]
     },
     {
      "id": "P10",
      "distance_m": 95.98489850724177,
      "top_speed_kmh": 16.70815792371203,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.0,
        0.07579462102689487,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.07090464547677261,
        0.3404645476772616,
        0.1356968215158924,
        0.034229828850855744,
        0.0550122249388753,
        0.10941320293398533,
        0.08251833740831296,
        0.0
       ],
       [
        0.09596577017114914,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ]
      ]
     },
     {
      "id": "P11",
      "distance_m": 88.33920289426015,
      "top_speed_kmh": 19.450396129438953,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.002898550724637681,
        0.01565217391304348,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.1443478260869565,
        0.2110144927536232,
        0.3130434782608696,
        0.02666666666666667,
        0.029565217391304348,
        0.034782608695652174,
        0.13391304347826086,
        0.0
       ],
       [
        0.04,
        0.03246376811594203,
        0.01565217391304348,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ]
      ]
     },
     {
      "id": "P12",
      "distance_m": 76.7024897605817,
      "top_speed_kmh": 15.267002563668363,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.24050632911392406,
        0.4593128390596745,
        0.07655213984327909,
        0.028933092224231464,
        0.02230259192284509,
        0.029535864978902954,
        0.05304400241109102,
        0.06329113924050633
       ],
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.02652200120554551
       ]
      ]
     },
     {
      "id": "P13",
      "distance_m": 142.6368842209449,
      "top_speed_kmh": 26.350567014707714,
      "sprints": 1,
      "heatmap": [
       [
        0.0,
        0.008258258258258258,
        0.16441441441441443,
        0.04804804804804805,
        0.027777777777777776,
        0.0015015015015015015,
        0.0,
        0.0
       ],
       [
        0.024024024024024024,
        0.11036036036036036,
        0.11036036036036036,
        0.0,
        0.0015015015015015015,
        0.025525525525525526,
        0.4774774774774775,
        0.0
       ],
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0007507507507507507
       ]
      ]
     },
     {
      "id": "P14",
      "distance_m": 63.18895594405897,
      "top_speed_kmh": 13.818245460303269,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.0011467889908256881,
        0.005733944954128441,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.0,
        0.16341743119266056,
        0.44036697247706424,
        0.1628440366972477,
        0.06307339449541284,
        0.16341743119266056,
        0.0,
        0.0
       ],
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ]
      ]
     }
    ],
    "confidence": 0.75,
    "notes": "fps=30.0 threshold=22.0km/h; 15 players, 22216 points total. x,y used as center meters, no rescale. distance=sum centroid steps; top_speed=max 1s-window path/time; sprints=non-overlapping 1s windows>thr; heatmap=3x8 global-bounds occupancy proportion."
   }
  },
  "moments": [
   {
    "peak_kmh": 32.4,
    "peak_by": "P13",
    "sprints": 15,
    "ball_kmh": 31.5,
    "spread_m": 27.4,
    "start_s": 55.0,
    "end_s": 60.0,
    "label": "Fastest burst",
    "description": "peak 32.4 km/h (P13), 15 sprints, ball at 31.5 km/h, block spread 27.4 m",
    "intent": "speed"
   },
   {
    "peak_kmh": 32.3,
    "peak_by": "P12",
    "sprints": 14,
    "ball_kmh": 31.1,
    "spread_m": 15.3,
    "start_s": 5.0,
    "end_s": 10.0,
    "label": "Fastest burst",
    "description": "peak 32.3 km/h (P12), 14 sprints, ball at 31.1 km/h, block spread 15.3 m",
    "intent": "speed"
   },
   {
    "peak_kmh": 32.3,
    "peak_by": "P13",
    "sprints": 19,
    "ball_kmh": 29.0,
    "spread_m": 25.1,
    "start_s": 35.0,
    "end_s": 40.0,
    "label": "Fastest burst",
    "description": "peak 32.3 km/h (P13), 19 sprints, ball at 29.0 km/h, block spread 25.1 m",
    "intent": "speed"
   }
  ],
  "plan": {
   "focus": [
    "Collective pressing — work-rate gap is 85% (P13 vs P6)",
    "Tempo control — low sprint volume, raise intentional off-ball movement",
    "Raise the floor — P6 covered 0.02 km, half the median"
   ],
   "sessions": [
    {
     "day": "Tuesday",
     "title": "Pressing shape",
     "drills": [
      {
       "name": "5v5 +3 press triggers",
       "duration_min": 25,
       "why": "Close the 85% work-rate gap as a unit, not individually"
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
       "why": "Match the peak demand: P13 hit 26.4 km/h"
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
       "why": "Target: lift squad median from 0.07 km toward 0.14 km"
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
    "a": "Fastest player was P13 at 26.4 km/h top speed, per TOP SPEED KPI.\n\nNext best among listed players is P7 at 22.4 km/h with 1 sprint.",
    "mode": "spark"
   },
   {
    "q": "Who worked the hardest?",
    "a": "P13 worked hardest.\n\nTOP DISTANCE 0.1 km (P13), TOP SPEED 26.4 km/h (P13), summary: \"P13 ran 0.1 km\".\n\nNext tracked: P7 0.1 km, 22.4 km/h, 1 sprint.\nTEAM SPRINTS: 2.\n\nFile mvhs-court.mp4, 60.0s, 1800 frames.",
    "mode": "spark"
   },
   {
    "q": "What should we train this week?",
    "a": "60-s live sample mvhs-court.mp4 (1,800 frames, 75.0% confidence, 11 PLAYERS): train transition running.\n\nTEAM only 2 SPRINTS >22.0km/h - P13 26.4km/h and P7 22.4km/h with 1 sprint. Replicate outlets with P11 19.5km/h, P1/P2 17.3km/h.\n\nRaise floor: P3 0.0km 4.2km/h 19%, P6 0.0km 15%, P5 0.0km 24%, P8 0.0km 28%. Use P10 67% and P11 62% as connectors.",
    "mode": "spark"
   }
  ],
  "whispers": [
   {
    "t": 0.0,
    "text": "t+0s — ball in the frontcourt; peak intensity 31.9 km/h (P7), 2 sprint episodes in the last 5s, block spread 15.8 m."
   },
   {
    "t": 6.0,
    "text": "t+6s — ball in the frontcourt; peak intensity 31.7 km/h (P1), 2 sprint episodes in the last 5s, block spread 10.9 m."
   },
   {
    "t": 12.0,
    "text": "t+12s — ball in the backcourt; peak intensity 32.3 km/h (P12), 9 sprint episodes in the last 5s, block spread 18.3 m. High-intensity window — transition fitness shows here."
   },
   {
    "t": 18.0,
    "text": "t+18s — ball in the backcourt; peak intensity 32.1 km/h (P7), 8 sprint episodes in the last 5s, block spread 23.9 m. Space is stretched — move as a unit. High-intensity window — transition fitness shows here."
   },
   {
    "t": 24.0,
    "text": "t+24s — ball in the frontcourt; peak intensity 31.9 km/h (P13), 8 sprint episodes in the last 5s, block spread 27.5 m. Space is stretched — move as a unit. High-intensity window — transition fitness shows here."
   },
   {
    "t": 30.0,
    "text": "t+30s — ball in the backcourt; peak intensity 32.2 km/h (P13), 5 sprint episodes in the last 5s, block spread 27.6 m. Space is stretched — move as a unit. High-intensity window — transition fitness shows here."
   },
   {
    "t": 36.0,
    "text": "t+36s — ball in the backcourt; peak intensity 32.3 km/h (P13), 14 sprint episodes in the last 5s, block spread 27.4 m. Space is stretched — move as a unit. High-intensity window — transition fitness shows here."
   },
   {
    "t": 42.0,
    "text": "t+42s — ball in the backcourt; peak intensity 32.3 km/h (P13), 10 sprint episodes in the last 5s, block spread 25.1 m. Space is stretched — move as a unit. High-intensity window — transition fitness shows here."
   },
   {
    "t": 48.0,
    "text": "t+48s — ball in the backcourt; peak intensity 31.6 km/h (P13), 12 sprint episodes in the last 5s, block spread 25.1 m. Space is stretched — move as a unit. High-intensity window — transition fitness shows here."
   },
   {
    "t": 54.0,
    "text": "t+54s — ball in the backcourt; peak intensity 32.1 km/h (P9), 10 sprint episodes in the last 5s, block spread 27.3 m. Space is stretched — move as a unit. High-intensity window — transition fitness shows here."
   }
  ],
  "video": "samples/demo-basketball-court.mp4",
  "cardFile": "sample-card-basketball.svg"
 },
 "running": {
  "_provenance": "VERIFIED LIVE RUN a975a326c3e1 (SAM 3.1 + Muse Spark + E2B, no fallback) on real footage: 'Range of Motion - Stride Length' running film (archive.org) — a single-subject training film, meters scaled to the ~17 m visible park width. Demo use with credit; all rights remain with the rights holder.",
  "job": {
   "id": "a975a326c3e1",
   "agent_log": [
    {
     "t": 1793741014.9,
     "stage": "plan",
     "text": "Plan: ① ingest upload → ② extract frames → ③ track players (sam-3.1) → ④ write stats code (spark-1.3) → ⑤ execute (e2b) → ⑥ dashboard"
    },
    {
     "t": 1793741015.9,
     "stage": "frames",
     "text": "8 preview frames extracted from a 30 fps source"
    },
    {
     "t": 1793741209.7,
     "stage": "track",
     "text": "Tracking locked: 2 objects at 100.0% confidence"
    },
    {
     "t": 1793741209.7,
     "stage": "correct",
     "text": "Correction: only 2 objects tracked — pitch coverage is thin, treat squad-level stats as a lower bound"
    },
    {
     "t": 1793741270.7,
     "stage": "codegen",
     "text": "Stats code ready (spark-1.3)"
    },
    {
     "t": 1793741273.9,
     "stage": "analyze",
     "text": "Analyst read: P1 is the engine: 0.2 km covered — 100% of the squad-median workload."
    }
   ]
  },
  "result": {
   "mode": "live",
   "pipeline": {
    "track": "sam-3.1",
    "codegen": "spark-1.3",
    "exec": "e2b"
   },
   "sport": "running",
   "label": "Running",
   "fileName": "demo-running-fs.mp4",
   "duration": "01:00",
   "trackedLabel": "TRACKING · 2 PLAYERS",
   "confidence": "43.3%",
   "frames": "1,800",
   "positionsCount": "3,600",
   "summaryText": "P1 ran 0.2 km",
   "notes": "fps=30.0 thr=16.0 km/h; x,y=center(m) no rescale; distance=sum consecutive displacement; top_speed=max 1s-window displacement/dt; sprints=non-overlapping 1s windows>thr; heatmap=3x8 global bounds x[5.98,12.72] y[4.94,8.63] normalized; span=1800 frames.",
   "kpis": [
    {
     "value": "0.2",
     "unit": " km",
     "label": "TOP DISTANCE",
     "sub": "P1"
    },
    {
     "value": "18.8",
     "unit": " km/h",
     "label": "TOP SPEED",
     "sub": "P1"
    },
    {
     "value": "2",
     "unit": "",
     "label": "SPRINTS",
     "sub": "TEAM"
    }
   ],
   "players": {
    "P1": {
     "id": "P1",
     "name": "P1 · Tracked",
     "color": "#4DA3FF",
     "badgeBg": "#0064E0",
     "distance": "0.2 km",
     "pct": 100,
     "topSpeed": "18.8 km/h",
     "sprints": 2,
     "animClass": "sc-p7",
     "heatmap": [
      [
       0.08163265306122448,
       0.3163265306122449,
       0.5561224489795918,
       0.5,
       0.061224489795918366,
       0.061224489795918366,
       0.0,
       0.0
      ],
      [
       0.061224489795918366,
       0.413265306122449,
       1.0,
       0.6938775510204082,
       0.23469387755102042,
       0.07653061224489796,
       0.08163265306122448,
       0.025510204081632654
      ],
      [
       0.07142857142857142,
       0.07653061224489796,
       0.17857142857142858,
       0.10204081632653061,
       0.02040816326530612,
       0.0,
       0.030612244897959183,
       0.025510204081632654
      ]
     ]
    },
    "P2": {
     "id": "P2",
     "name": "P2 · Tracked",
     "color": "#FF6B6B",
     "badgeBg": "#E0245E",
     "distance": "0.1 km",
     "pct": 39,
     "topSpeed": "13.9 km/h",
     "sprints": 0,
     "animClass": "sc-p10",
     "heatmap": [
      [
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0,
       0.0
      ],
      [
       0.1796875,
       0.3671875,
       0.78125,
       1.0,
       0.671875,
       0.28125,
       0.09375,
       0.0078125
      ],
      [
       0.015625,
       0.921875,
       0.2890625,
       0.203125,
       0.1015625,
       0.0390625,
       0.0703125,
       0.0
      ]
     ]
    }
   },
   "analysis": {
    "tactical": [
     "P1 is the engine: 0.2 km covered — 100% of the squad-median workload.",
     "Speed profile: P1 peaks at 18.8 km/h — that is the transition outlet when possession turns over.",
     "Work-rate spread is 61% between the most and least active player (P1 vs P2) — pressing is not collective yet.",
     "Team sprint volume: 2 in the analyzed segment — controlled intensity."
    ],
    "forward": "Next session: build drills that lift the median (0.2 km) rather than the top — collective pressing over individual workload. Re-run the other segment of this match to compare halves.",
    "computed": true,
    "note": "Computed from tracking data. Spark's full tactical reasoning activates with API keys."
   },
   "_raw_stats": {
    "players": [
     {
      "id": "P1",
      "distance_m": 203.7322890576384,
      "top_speed_kmh": 18.757133171143188,
      "sprints": 2,
      "heatmap": [
       [
        0.08163265306122448,
        0.3163265306122449,
        0.5561224489795918,
        0.5,
        0.061224489795918366,
        0.061224489795918366,
        0.0,
        0.0
       ],
       [
        0.061224489795918366,
        0.413265306122449,
        1.0,
        0.6938775510204082,
        0.23469387755102042,
        0.07653061224489796,
        0.08163265306122448,
        0.025510204081632654
       ],
       [
        0.07142857142857142,
        0.07653061224489796,
        0.17857142857142858,
        0.10204081632653061,
        0.02040816326530612,
        0.0,
        0.030612244897959183,
        0.025510204081632654
       ]
      ]
     },
     {
      "id": "P2",
      "distance_m": 79.94621336985661,
      "top_speed_kmh": 13.90022422840725,
      "sprints": 0,
      "heatmap": [
       [
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
       ],
       [
        0.1796875,
        0.3671875,
        0.78125,
        1.0,
        0.671875,
        0.28125,
        0.09375,
        0.0078125
       ],
       [
        0.015625,
        0.921875,
        0.2890625,
        0.203125,
        0.1015625,
        0.0390625,
        0.0703125,
        0.0
       ]
      ]
     }
    ],
    "confidence": 0.43277777777777776,
    "notes": "fps=30.0 thr=16.0 km/h; x,y=center(m) no rescale; distance=sum consecutive displacement; top_speed=max 1s-window displacement/dt; sprints=non-overlapping 1s windows>thr; heatmap=3x8 global bounds x[5.98,12.72] y[4.94,8.63] normalized; span=1800 frames."
   }
  },
  "moments": [
   {
    "peak_kmh": 18.8,
    "peak_by": "P1",
    "sprints": 0,
    "ball_kmh": 0.0,
    "spread_m": 6.1,
    "start_s": 5.0,
    "end_s": 10.0,
    "label": "Fastest burst",
    "description": "peak 18.8 km/h (P1), 0 sprint episodes, over 6.1 m of range",
    "intent": "speed"
   },
   {
    "peak_kmh": 15.3,
    "peak_by": "P1",
    "sprints": 0,
    "ball_kmh": 0.0,
    "spread_m": 5.9,
    "start_s": 10.0,
    "end_s": 15.0,
    "label": "Fastest burst",
    "description": "peak 15.3 km/h (P1), 0 sprint episodes, over 5.9 m of range",
    "intent": "speed"
   },
   {
    "peak_kmh": 14.5,
    "peak_by": "P1",
    "sprints": 0,
    "ball_kmh": 0.0,
    "spread_m": 4.8,
    "start_s": 15.0,
    "end_s": 20.0,
    "label": "Fastest burst",
    "description": "peak 14.5 km/h (P1), 0 sprint episodes, over 4.8 m of range",
    "intent": "speed"
   }
  ],
  "plan": {
   "focus": [
    "Collective pressing — work-rate gap is 61% (P1 vs P2)",
    "Tempo control — low sprint volume, raise intentional off-ball movement",
    "Raise the floor — P2 covered 0.08 km, half the median"
   ],
   "sessions": [
    {
     "day": "Tuesday",
     "title": "Pressing shape",
     "drills": [
      {
       "name": "5v5 +3 press triggers",
       "duration_min": 25,
       "why": "Close the 61% work-rate gap as a unit, not individually"
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
       "why": "Match the peak demand: P1 hit 18.8 km/h"
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
       "why": "Target: lift squad median from 0.20 km toward 0.20 km"
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
    "a": "P1 was fastest: 18.8 km/h top speed vs P2 13.9 km/h. P1 covered 0.2 km with 2 sprints; P2 covered 0.1 km with 0 sprints.",
    "mode": "spark"
   },
   {
    "q": "Who worked the hardest?",
    "a": "P1 worked hardest: 0.2 km (203.7 m), 100% workload, 18.8 km/h top speed, 2 sprints.\n\nP2 managed 0.1 km (79.9 m), 13.9 km/h, 0 sprints. Spread 61% P1 vs P2.\n\nTeam: 2 sprints in 60.0s / 1,800 frames at 43.3% confidence.",
    "mode": "spark"
   },
   {
    "q": "What should we train this week?",
    "a": "Train collective pressing to close 61% gap: P1 0.2 km [203.7m], 18.8 km/h, 2 sprints vs P2 0.1 km [79.9m], 13.9 km/h, 0 sprints. Team: 2 sprints in 01:00, 1,800 frames. Lift median 0.2 km, use P1 as transition outlet. Confidence 43.3%.",
    "mode": "spark"
   }
  ],
  "whispers": [
   {
    "t": 0.0,
    "text": "t+0s — peak intensity 5.6 km/h (P1), 0 sprint episodes in the last 5s, spanning 1.4 m of track."
   },
   {
    "t": 6.0,
    "text": "t+6s — peak intensity 9.9 km/h (P1), 0 sprint episodes in the last 5s, spanning 3.3 m of track."
   },
   {
    "t": 12.0,
    "text": "t+12s — peak intensity 18.8 km/h (P1), 0 sprint episodes in the last 5s, spanning 6.0 m of track."
   },
   {
    "t": 18.0,
    "text": "t+18s — peak intensity 14.5 km/h (P1), 0 sprint episodes in the last 5s, spanning 6.2 m of track."
   },
   {
    "t": 24.0,
    "text": "t+24s — peak intensity 5.5 km/h (P1), 0 sprint episodes in the last 5s, spanning 1.9 m of track."
   },
   {
    "t": 30.0,
    "text": "t+30s — peak intensity 10.3 km/h (P1), 0 sprint episodes in the last 5s, spanning 3.2 m of track."
   },
   {
    "t": 36.0,
    "text": "t+36s — peak intensity 8.1 km/h (P1), 0 sprint episodes in the last 5s, spanning 2.7 m of track."
   },
   {
    "t": 42.0,
    "text": "t+42s — peak intensity 13.4 km/h (P2), 0 sprint episodes in the last 5s, spanning 3.8 m of track."
   },
   {
    "t": 48.0,
    "text": "t+48s — peak intensity 13.9 km/h (P2), 0 sprint episodes in the last 5s, spanning 4.3 m of track."
   },
   {
    "t": 54.0,
    "text": "t+54s — peak intensity 10.4 km/h (P2), 0 sprint episodes in the last 5s, spanning 3.0 m of track."
   }
  ],
  "video": "samples/demo-running-fs.mp4",
  "cardFile": "sample-card-running.svg"
 }
};
