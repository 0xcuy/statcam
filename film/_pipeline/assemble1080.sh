#!/bin/bash
# assemble1080.sh v7 — coach-first + all three sports, ~95.7s, 1920x1080, ducking
set -e
cd "$(dirname "$0")"
MUSIC=music/out/statcam_demo_bgm/audio.flac

#                  card1    hero     card2    results  chat    plan     card3    log     fs       card4    bb       running  card5    endcard
V=(card1080-1.mp4 take_tour.mp4 card1080-2.mp4 take_tour.mp4 take_tour.mp4 take_tour.mp4 card1080-3.mp4 take_tour.mp4 take_tour.mp4 card1080-4.mp4 take_tour.mp4 take8b.mp4 card1080-5.mp4 card1080-7.mp4)
SS=(0             5.4      0        35.8     72.7     80.7     0        28.5    11.4     0        55.7     19.5     0        0)
DD=(8.0           6.5      2.5      11.0     8.5      4.1      2.5      8.0     16.0     2.5      12.0     8.5      2.5      4.5)

IN=""
VCHAIN=""
CONCAT=""
for i in 0 1 2 3 4 5 6 7 8 9 10 11 12 13; do
  IN="$IN -i ${V[$i]}"
  VCHAIN="$VCHAIN[$i:v]trim=start=${SS[$i]}:duration=${DD[$i]},setpts=PTS-STARTPTS,fps=30,format=yuv420p[v$i];"
  CONCAT="$CONCAT[v$i]"
done

# audio: 14=music, 15..24=vo, 25..29=whoosh
IN="$IN -ss 110 -t 100 -i $MUSIC"
for n in 1 2 3 4 5 6 7 8 10 9; do IN="$IN -i vo/vo$n.wav"; done
for n in 0 1 2 3 4; do IN="$IN -i sfx/w$n.wav"; done

OFF=(1200 9000 17800 28800 37300 44300 54000 70500 82500 88400)
WT=(14500 40600 67100 86700 89000)

ACHAIN=""
for j in 0 1 2 3 4 5 6 7 8 9; do
  ACHAIN="$ACHAIN[$((15+j)):a]aresample=48000,volume=1.55,adelay=${OFF[$j]}|${OFF[$j]}[a$j];"
done
for j in 0 1 2 3 4; do
  ACHAIN="$ACHAIN[$((25+j)):a]aresample=48000,volume=0.5,adelay=${WT[$j]}|${WT[$j]}[wh$j];"
done

ffmpeg -y -loglevel error $IN -filter_complex "
$VCHAIN
${CONCAT}concat=n=14:v=1:a=0[vout];
[14:a]aresample=48000,volume=0.55,afade=t=in:st=0:d=0.8,afade=t=out:st=93.5:d=2[mus];
$ACHAIN
[a0][a1][a2][a3][a4][a5][a6][a7][a8][a9]amix=inputs=10:normalize=0[vosum];
[vosum]asplit=2[vskey][vsmix];
[mus][vskey]sidechaincompress=threshold=0.02:ratio=7:attack=25:release=520[mdyn];
[mdyn][vsmix][wh0][wh1][wh2][wh3][wh4]amix=inputs=7:normalize=0,alimiter=limit=0.9,afade=t=out:st=94.2:d=1.5[aout]
" -map "[vout]" -map "[aout]" -t 94.8 -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart statcam-demo-final.mp4
ffprobe -v error -show_entries format=duration,size -of csv=p=0 statcam-demo-final.mp4
