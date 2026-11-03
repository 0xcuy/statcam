#!/bin/bash
V=(card1080-1.mp4 take_tour.mp4 card1080-2.mp4 take_tour.mp4 take_tour.mp4 card1080-3.mp4 take_tour.mp4 take_tour.mp4 card1080-4.mp4 take_tour.mp4 take_tour.mp4 take8b.mp4 card1080-5.mp4 card1080-7.mp4)
SS=(0 5.4 0 35.8 72.7 80.7 0 28.5 11.4 0 55.7 19.5 0 0)
DD=(7.5 6.0 2.5 10.0 8.0 7.9 2.5 7.3 14.0 2.5 11.0 8.5 2.5 7.0)
for i in 0 1 2 3 4 5 6 7 8 9 10 11 12 13; do
  ffmpeg -y -loglevel error -i "${V[$i]}" -vf "trim=start=${SS[$i]}:duration=${DD[$i]},setpts=PTS-STARTPTS,fps=30" -an /tmp/diag$i.mp4
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 /tmp/diag$i.mp4)
  echo "seg$i ${V[$i]} ss=${SS[$i]} want=${DD[$i]} got=$d"
done
