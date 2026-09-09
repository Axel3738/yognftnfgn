#!/bin/bash
# Kör röstkollen på varje färdig fil i en uppsättning.
#   factory/rostsvep.sh <marknad> [dubbad|klar]
S=/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad
M=${1:?ange marknad}; STEG=${2:-dubbad}
fel=0; n=0
for f in $S/$STEG-$M/*.mp4; do
  [ -e "$f" ] || continue
  b=$(basename "$f" .mp4); srt=$S/srt-fixad-$M/$b.srt
  [ -f "$srt" ] || { echo "  ?  $b — ingen SRT"; continue; }
  ut=$(python3 /home/user/yognftnfgn/factory/rostkoll.py "$f" "$srt" 2>/dev/null)
  sp=$(echo "$ut" | grep -oP 'Spridning \K[\d.]+')
  if echo "$ut" | grep -q '^✅'; then echo "  ✅ $b   spridning ${sp}x"
  else echo "  ❌ $b   spridning ${sp}x"; echo "$ut" | sed -n '/⛔/,$p' | sed 's/^/       /'; fel=$((fel+1)); fi
  n=$((n+1))
done
echo
[ "$fel" = "0" ] && echo "✅ $n av $n har jämnt taltempo" || echo "⛔ $fel av $n har ojämnt taltempo"
