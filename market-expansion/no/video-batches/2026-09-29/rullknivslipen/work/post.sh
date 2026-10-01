#!/bin/bash
cd /home/user/yognftnfgn/market-expansion/no/video-batches/2026-09-29/rullknivslipen
for k in CS_1_H1 CS_1_H2 CS_1_H3 GT_1_H1 GT_1_H2 GT_1_H3 PD_1_H1 PD_1_H2 PD_1_H3 SP_1_H1 SP_1_H2 SP_1_H3; do
  d=work/dub/NO_Rullknivslipen_$k.mp4; f=final/NO_rullknivslipen_$k.mp4
  while ! grep -q "✓ $d" work/dub/Rullknivslipen_$k.log 2>/dev/null; do sleep 15; done
  if [ ! -s $f ]; then
    python3 /home/user/yognftnfgn/pipeline/no-captions.py $d $d.srt $f </dev/null > work/cap_$k.log 2>&1; rc=$?
    if [ $rc = 3 ]; then python3 /home/user/yognftnfgn/pipeline/no-captions.py $d $d.srt $f --band=1225:1527 </dev/null > work/cap_$k.log 2>&1; rc=$?; fi
    echo "cap $k rc=$rc"
  fi
  python3 work/qa.py $f work/qa_$k.jpg
  python3 /home/user/yognftnfgn/pipeline/rostkoll.py --kalla src/Rullknivslipen_$k.mp4 --ny $f --srt $d.srt --omtajmad </dev/null > work/rost_$k.log 2>&1; echo "rost $k rc=$? $(tail -1 work/rost_$k.log)"
done
