#!/bin/bash
# assemble1080.sh v5 — coach-first, 90.0s, 1920x1080, sidechain music ducking
set -e
cd "$(dirname "$0")"
MUSIC=music/out/statcam_demo_bgm/audio.flac

V=(card1080-1.mp4 take_tour.mp4 card1080-2.mp4 take_tour.mp4 take_tour.mp4 card1080-3.mp4 take_tour.mp4 take_tour.mp4 card1080-4.mp4 take_tour.mp4 card1080-5.mp4 card1080-7.mp4)
SS=(0 5.4 0 35.8 72.7 0 28.5 11.4 0 55.7 0 0)
DD=(7.5 6.0 2.5 12.0 12.1 2.5 7.3 16.0 2.5 12.0 2.5 7.0)

IN=""
VCHAIN=""
CONCAT=""
for i in 0 1 2 3 4 5 6 7 8 9 10 11; do
  IN="$IN -i ${V[$i]}"
  VCHAIN="$VCHAIN[$i:v]trim=start=${SS[$i]}:duration=${DD[$i]},setpts=PTS-STARTPTS,fps=30,format=yuv420p[v$i];"
  CONCAT="$CONCAT[v$i]"
done

# audio: 12=music, 13..21=vo1..vo9, 22..25=whoosh1..4
IN="$IN -ss 110 -t 90 -i $MUSIC"
for n in 1 2 3 4 5 6 7 8 9; do IN="$IN -i vo/vo$n.wav"; done
for n in 0 1 2 3; do IN="$IN -i sfx/w$n.wav"; done

OFF=(1200 8500 16800 28800 36000 42300 52600 69200 83400)
WT=(13500 40100 65900 80400)

ACHAIN=""
for j in 0 1 2 3 4 5 6 7 8; do
  ACHAIN="$ACHAIN[$((13+j)):a]aresample=48000,volume=1.7,adelay=${OFF[$j]}|${OFF[$j]}[a$j];"
done
for j in 0 1 2 3; do
  ACHAIN="$ACHAIN[$((22+j)):a]aresample=48000,volume=0.5,adelay=${WT[$j]}|${WT[$j]}[wh$j];"
done

ffmpeg -y -loglevel error $IN -filter_complex "
$VCHAIN
${CONCAT}concat=n=12:v=1:a=0[vout];
[12:a]aresample=48000,volume=0.55,afade=t=in:st=0:d=0.8,afade=t=out:st=87.5:d=2[mus];
$ACHAIN
[a0][a1][a2][a3][a4][a5][a6][a7][a8]amix=inputs=9:normalize=0[vosum];
[vosum]asplit=2[vskey][vsmix];
[mus][vskey]sidechaincompress=threshold=0.02:ratio=7:attack=25:release=520[mdyn];
[mdyn][vsmix][wh0][wh1][wh2][wh3]amix=inputs=6:normalize=0,alimiter=limit=0.9,afade=t=out:st=87.9:d=1.7[aout]
" -map "[vout]" -map "[aout]" -t 90 -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart statcam-demo-90s-1080.mp4
ffprobe -v error -show_entries format=duration,size -of csv=p=0 statcam-demo-90s-1080.mp4
