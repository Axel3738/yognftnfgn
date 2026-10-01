for n in C1_1_H1 C1_1_H2 C1_1_H3 G_1_H1 G_1_H2 G_1_H3 PD_1_H1 PD_1_H2 PD_1_H3 SP_1_H1 SP_1_H2 SP_1_H3; do
  for f in 1 2 3 4; do
    node /home/user/yognftnfgn/pipeline/omdubb/elevenlabs-omdubb.mjs --kalla=src/$n.mp4 --srt=srt-no/$n.srt --ut=dub/$n.mp4 --rost="Martin - Clear and Comforting" > dub/$n.log 2>&1 && break
    grep -q 429 dub/$n.log && sleep 30 || { echo "FEL $n"; break; }
  done
  echo "== $n"; tail -3 dub/$n.log
done
