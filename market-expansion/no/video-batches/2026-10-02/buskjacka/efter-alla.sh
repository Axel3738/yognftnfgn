for n in CS_1_H1 CS_1_H2 CS_1_H3 G_1_H1 G_1_H2 G_1_H3 PD_1_H1 PD_1_H2 PD_1_H3 SP_1_H1 SP_1_H2 SP_1_H3; do
  [ -f final/NO_buskjakke_$n.mp4 ] && [ -f final/$n.ordkoll ] && continue
  until grep -q "^✓ dub/$n.mp4" dub.log; do grep -q "^FEL $n" dub.log && continue 2; sleep 5; done
  bash efter.sh $n --band=${BAND:-1215:1345} > final/$n.efter.log 2>&1
  node /home/user/yognftnfgn/pipeline/ordkoll.mjs final/NO_buskjakke_$n.mp4 dub/$n.mp4.srt --sprak no > final/$n.ordkoll 2>&1; echo "$n ordkoll exit $?" >> final/ordkoll-summary.txt
  python3 qa.py $n; echo "$n klar" >> efter.progress
done
echo ALLT >> efter.progress
