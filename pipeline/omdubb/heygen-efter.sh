#!/bin/bash
# rostkoll + captions för alla hämtade renderingar (hoppar över redan captionade).
# bash heygen-efter.sh <state.json> <källmapp>
STATE=$1; KALLA=$2; ROT=/home/user/yognftnfgn; BF=$ROT/factory/output/termoskyddet/bildfix
node -e 'const s=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); for(const [n,v] of Object.entries(s)) if(v.fil) console.log(n, v.fil, v.srt);' "$STATE" | while read namn fil srt; do
  [ -f "$BF/$namn.mp4" ] && { echo "♻️ $namn captionad"; continue; }
  echo "=== $namn"
  python3 $ROT/pipeline/rostkoll.py --kalla "$KALLA/$namn.mp4" --ny "$fil" --srt "$srt" </dev/null 2>&1 | tail -5
  python3 $ROT/pipeline/no-captions.py "$fil" "$srt" "$BF/$namn.mp4" --band=975:1065 --font-px=31 --max-chars=30 </dev/null 2>&1 | tail -5
done
