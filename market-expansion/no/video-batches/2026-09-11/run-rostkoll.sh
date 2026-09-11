#!/bin/bash
set -u
BASE=/home/user/yognftnfgn/market-expansion/no/video-batches/2026-09-11
cd /home/user/yognftnfgn/pipeline || exit 1

for slug in utekattkoja takoverdrag stegstod; do
  for f in "$BASE/final/$slug/NO_${slug}_"*.mp4; do
    [ -f "$f" ] || continue
    name=$(basename "$f" .mp4)
    concept=${name#NO_${slug}_}
    kalla="$BASE/$slug/up/${concept}.mp4"
    srt="$BASE/srt-fixed/${slug}_${concept}.srt"
    echo "=== $slug $concept ==="
    python3 rostkoll.py --ny "$f" --kalla "$kalla" --srt "$srt" </dev/null
  done
done
