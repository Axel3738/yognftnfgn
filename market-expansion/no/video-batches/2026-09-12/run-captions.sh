#!/bin/bash
set -u
BASE=/home/user/yognftnfgn/market-expansion/no/video-batches/2026-09-12
cd /home/user/yognftnfgn/pipeline || exit 1

FAILED=""
for slug in jetvifte solcellslarm termoskydd; do
  mkdir -p "$BASE/final/$slug"
  for f in "$BASE/render/${slug}_"*.mp4; do
    name=$(basename "$f" .mp4)
    concept=${name#${slug}_}
    srt="$BASE/srt-fixed/${name}.srt"
    out="$BASE/final/$slug/NO_${slug}_${concept}.mp4"
    if [ -f "$out" ]; then
      echo "finns redan: $out"
      continue
    fi
    echo "=== $name ==="
    python3 no-captions.py "$f" "$srt" "$out" </dev/null
    rc=$?
    if [ $rc -ne 0 ]; then
      echo "MISSLYCKADES ($rc): $name"
      FAILED="$FAILED $name"
    fi
  done
done
echo "KLART. Misslyckade: ${FAILED:-inga}"
