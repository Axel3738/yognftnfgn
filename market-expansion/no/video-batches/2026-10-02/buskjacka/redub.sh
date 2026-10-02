for n in SP_1_H1; do
  node /home/user/yognftnfgn/pipeline/omdubb/elevenlabs-omdubb.mjs --kalla=src/$n.mp4 --srt=srt-no/$n.srt --ut=dub/$n.mp4 --rost="Martin - Clear and Comforting" > dub/$n.log 2>&1 || echo FEL $n
  bash efter.sh $n --band=1215:1345 > final/$n.efter.log 2>&1
  node /home/user/yognftnfgn/pipeline/ordkoll.mjs final/NO_buskjakke_$n.mp4 dub/$n.mp4.srt --sprak no > final/$n.ordkoll 2>&1
  python3 qa.py $n; echo "$n omgjord" >> efter.progress
done; echo REDUBBAT3 >> efter.progress
