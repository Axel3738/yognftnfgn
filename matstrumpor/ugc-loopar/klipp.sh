#!/usr/bin/env bash
# klipp.sh — kvadratiska loopar ur Matstrumpors UGC-filmer (utan ljud, utan inbränd text).
#
#   bash matstrumpor/ugc-loopar/klipp.sh
#
# 1. Hämtar källorna i kallor.txt till output/kallor/ om de saknas: meta = ur kontot "nya kungen"
#    (GET /<video_id>?fields=source, META_ACCESS_TOKEN), drive = redigerarens länkdelade fil.
# 2. Klipper varje rad i loopar.txt till output/loopar/<namn>.mp4 (H.264, faststart) + .webm (VP9)
#    + <namn>.jpg (bildrutan som poster och i skärmdumpar) + <namn>.remsa.jpg (kontrollremsa).
# Kontrollera remsorna: ingen ruta ur nästa klipp, ingen text, produkten i bild.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
UT="$DIR/output"
mkdir -p "$UT/kallor" "$UT/loopar"

for n in $(grep -v '^#' "$DIR/loopar.txt" | awk 'NF{print $2}' | sort -u); do
  rad=$(grep "^$n " "$DIR/kallor.txt" || true)
  [ -z "$rad" ] && { echo "$n saknas i kallor.txt" >&2; exit 1; }
  typ=$(echo "$rad" | awk '{print $2}'); id=$(echo "$rad" | awk '{print $3}')
  fil="$UT/kallor/$n.mp4"
  [ -s "$fil" ] && continue
  if [ "$typ" = meta ]; then
    src=$(curl -sS "https://graph.facebook.com/v21.0/$id?fields=source&access_token=$META_ACCESS_TOKEN" | python3 -c "import json,sys;print(json.load(sys.stdin).get('source',''))")
    [ -z "$src" ] && { echo "Kunde inte hämta $n ($id) ur kontot" >&2; exit 1; }
    curl -sS -o "$fil" "$src"
  else
    curl -sSL -o "$fil" "https://drive.usercontent.google.com/download?id=$id&confirm=t"
    ffprobe -v error "$fil" >/dev/null 2>&1 || { echo "Drive-filen $n ($id) är inte en video (inte länkdelad?)" >&2; rm -f "$fil"; exit 1; }
  fi
done

grep -v '^#' "$DIR/loopar.txt" | while read -r namn kalla s e x y sida v snap; do
  [ -z "${namn:-}" ] && continue
  d=$(python3 -c "print(round($e-$s,2))")
  ffmpeg -nostdin -v error -y -ss "$s" -t "$d" -i "$UT/kallor/$kalla.mp4" -an \
    -vf "crop=$sida:$sida:$x:$y,scale=600:600:flags=lanczos,fps=30" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 25 -preset slow -movflags +faststart "$UT/loopar/$namn.mp4"
  ffmpeg -nostdin -v error -y -i "$UT/loopar/$namn.mp4" -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -an "$UT/loopar/$namn.webm"
  ffmpeg -nostdin -v error -y -i "$UT/loopar/$namn.mp4" -ss "$snap" -frames:v 1 -q:v 3 "$UT/loopar/$namn.jpg"
  ffmpeg -nostdin -v error -y -i "$UT/loopar/$namn.mp4" -vf "fps=4,scale=150:150,tile=14x1:padding=2" -frames:v 1 "$UT/loopar/$namn.remsa.jpg"
  echo "$namn v$v ${d}s $(du -k "$UT/loopar/$namn.mp4" | cut -f1) kB mp4, $(du -k "$UT/loopar/$namn.webm" | cut -f1) kB webm"
done
