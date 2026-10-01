#!/usr/bin/env bash
# klipp.sh — kvadratiska loopar ur Matstrumpors UGC-filmer (utan ljud, utan inbränd text).
#
#   bash matstrumpor/ugc-loopar/klipp.sh
#
# 1. Hämtar källfilmerna ur kontot "nya kungen" (GET /<video_id>?fields=source, META_ACCESS_TOKEN)
#    till output/kallor/ om de saknas. Id:n står i ../marknader/heygen/kallor.json.
# 2. Klipper varje rad i loopar.txt till output/loopar/<namn>.mp4 (H.264, faststart) + .webm (VP9)
#    + <namn>.jpg (bildrutan som poster och i skärmdumpar) + <namn>.remsa.jpg (kontrollremsa).
# Kontrollera remsorna: ingen ruta ur nästa klipp, ingen svensk text.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
UT="$DIR/output"
mkdir -p "$UT/kallor" "$UT/loopar"

for n in $(grep -v '^#' "$DIR/loopar.txt" | awk 'NF{print $2}' | sort -u); do
  [ -s "$UT/kallor/$n.mp4" ] && continue
  id=$(python3 -c "import json;print(json.load(open('$DIR/../marknader/heygen/kallor.json'))['$n']['video_id'])")
  src=$(curl -sS "https://graph.facebook.com/v21.0/$id?fields=source&access_token=$META_ACCESS_TOKEN" | python3 -c "import json,sys;print(json.load(sys.stdin).get('source',''))")
  [ -z "$src" ] && { echo "Kunde inte hämta $n ($id) ur kontot" >&2; exit 1; }
  curl -sS -o "$UT/kallor/$n.mp4" "$src"
done

grep -v '^#' "$DIR/loopar.txt" | while read -r namn kalla s e y snap; do
  [ -z "${namn:-}" ] && continue
  d=$(python3 -c "print(round($e-$s,2))")
  ffmpeg -nostdin -v error -y -ss "$s" -t "$d" -i "$UT/kallor/$kalla.mp4" -an \
    -vf "crop=720:720:0:$y,scale=600:600:flags=lanczos,fps=30" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 25 -preset slow -movflags +faststart "$UT/loopar/$namn.mp4"
  ffmpeg -nostdin -v error -y -i "$UT/loopar/$namn.mp4" -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -an "$UT/loopar/$namn.webm"
  ffmpeg -nostdin -v error -y -i "$UT/loopar/$namn.mp4" -ss "$snap" -frames:v 1 -q:v 3 "$UT/loopar/$namn.jpg"
  ffmpeg -nostdin -v error -y -i "$UT/loopar/$namn.mp4" -vf "fps=4,scale=150:150,tile=14x1:padding=2" -frames:v 1 "$UT/loopar/$namn.remsa.jpg"
  echo "$namn ${d}s $(du -k "$UT/loopar/$namn.mp4" | cut -f1) kB mp4, $(du -k "$UT/loopar/$namn.webm" | cut -f1) kB webm"
done
