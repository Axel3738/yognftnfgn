for n in GT_1_H1 GT_1_H2 GT_1_H3 PD_1_H1 PD_1_H2 PD_1_H3 SP_1_H1 SP_1_H2 SP_1_H3; do
  until grep -q "✓ dub/$n.mp4" dub.out; do sleep 5; done
  bash efter.sh $n
done
