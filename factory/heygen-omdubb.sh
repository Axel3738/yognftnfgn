#!/bin/bash
# Omdubbningen i tre steg. Alla tre är idempotenta och kan köras om.
#
#   factory/heygen-omdubb.sh proofread <marknad> <språk> <titelprefix> <videomapp> <id ...>
#   factory/heygen-omdubb.sh render    <marknad>
#   factory/heygen-omdubb.sh hamta     <marknad>
#
# <marknad> är suffixet på arbetsmapparna: proof-<m>, srt-fixad-<m>, dubbad-<m>,
# sessions-<m>.txt, render-ids-<m>.txt.
#
# ⚠️ proofread kostar 0 krediter. render DRAR krediter — kör den först när
# `node factory/srt-fixa.mjs --marknad=<m>` har svarat ✅ på varje rad OCH
# täthetsgrinden är grön.
#
# ⚠️ HeyGen svarar status "failed" med failure_message "video pending
# moderation by our team" medan videon står i moderationskö. Det är ett
# VÄNTELÄGE, inte ett fel — hamta-steget skiljer på dem.
set -u
cd /home/user/yognftnfgn/pipeline
S=/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad
STEG=${1:?ange proofread|render|hamta}
M=${2:?ange marknad}

case "$STEG" in
proofread)
  SPRAK=${3:?ange språk, t.ex. "Norwegian Bokmål (Norway)"}
  PREFIX=${4:?ange titelprefix}
  MAPP=${5:?ange videomapp}
  shift 5
  mkdir -p "$S/proof-$M"
  : > "$S/sessions-$M.txt"
  for f in "$@"; do
    if [ ! -f "$S/proof-$M/${PREFIX}${f}-translated.srt" ]; then
      # ⚠️ Skriv videons namn till LOGGEN, inte bara till stdout. Sessions-id:t
      # paras ihop med namnet efteråt, och en video som misslyckas måste synas
      # i loggen — annars tappas den tyst ur listan.
      echo "PROOFREAD $f" | tee -a "$S/proof-$M/logg.txt"
      node localize.mjs proofread --file="$MAPP/${f}.mp4" --lang="$SPRAK" \
        --title="${PREFIX}${f}" --out="$S/proof-$M" 2>&1 \
        | grep -E "Proofread-session|SRT nedladdad|Fel|Error|error" \
        | tee -a "$S/proof-$M/logg.txt"
    else
      echo "SKIP $f" | tee -a "$S/proof-$M/logg.txt"
    fi
  done
  # Sessions-id:na läses ur loggen, inte ur stdout — en buffrad pipe kan annars
  # tappa dem helt och då finns ingen väg tillbaka till sessionen.
  #
  # ⚠️ Para id:t med SRT-FILNAMNET, aldrig med "PROOFREAD"-raden via `paste - -`.
  # En video som misslyckas skriver en PROOFREAD-rad men inget id, och då
  # förskjuts hela listan: varenda video får fel sessions-id.
  python3 - "$S/proof-$M/logg.txt" "$PREFIX" > "$S/sessions-$M.txt" <<'PY'
import re, sys
logg, prefix = sys.argv[1], sys.argv[2]
sess = None
for rad in open(logg, encoding='utf-8'):
    m = re.search(r'krediter\): (\S+)', rad)
    if m:
        sess = m.group(1); continue
    m = re.search(re.escape(prefix) + r'(\S+)-translated\.srt', rad)
    if m and sess:
        print(f'{m.group(1)}\t{sess}'); sess = None
PY
  echo "PROOFREADS KLARA — $(wc -l < "$S/sessions-$M.txt") sessioner"
  ;;

render)
  touch "$S/render-ids-$M.txt"
  while read -r id sess; do
    [ -z "${sess:-}" ] && continue
    grep -q "^$id " "$S/render-ids-$M.txt" && { echo "SKIP $id"; continue; }
    [ -f "$S/srt-fixad-$M/${id}.srt" ] || { echo "INGEN SRT $id"; continue; }
    echo "=== $id"
    node localize.mjs apply-srt --id="$sess" --srt="$S/srt-fixad-$M/${id}.srt" 2>&1 | grep -E "✅|⚠️|Fel|Error"
    r=$(node localize.mjs render --id="$sess" 2>&1 | grep -oP 'Rendering startad: \K\S+')
    if [ -n "$r" ]; then echo "$id $r" >> "$S/render-ids-$M.txt"; echo "  render $r"
    else echo "  RENDER MISSLYCKADES"; fi
  done < "$S/sessions-$M.txt"
  echo "ALLA RENDER INSKICKADE"
  ;;

hamta)
  mkdir -p "$S/dubbad-$M"
  total=$(wc -l < "$S/render-ids-$M.txt")
  kvar=1; varv=0
  while [ "$kvar" != "0" ] && [ "$varv" -lt 90 ]; do
    kvar=0
    while read -r id vid; do
      [ -z "${vid:-}" ] && continue
      [ -f "$S/dubbad-$M/${id}.mp4" ] && continue
      svar=$(node localize.mjs status --id="$vid" 2>&1)
      st=$(echo "$svar" | grep -oP '"status":\s*"\K[^"]+' | head -1)
      orsak=$(echo "$svar" | grep -oP '"failure_message":\s*"\K[^"]*' | head -1)
      if [ "$st" = "success" ]; then
        node localize.mjs download --id="$vid" --out="$S/dubbad-$M" >/dev/null 2>&1
        f=$(ls -t "$S/dubbad-$M"/*.mp4 2>/dev/null | head -1)
        [ -n "$f" ] && [ "$f" != "$S/dubbad-$M/${id}.mp4" ] && mv "$f" "$S/dubbad-$M/${id}.mp4"
        echo "HÄMTAD $id"
      elif [ "$st" = "failed" ] && echo "$orsak" | grep -qi "moderation"; then
        kvar=$((kvar+1))
      elif [ "$st" = "failed" ]; then
        echo "PÅ RIKTIGT MISSLYCKAD $id — $orsak"
      else
        kvar=$((kvar+1))
      fi
    done < "$S/render-ids-$M.txt"
    [ "$kvar" != "0" ] && { echo "väntar på $kvar (moderation eller rendering)"; sleep 60; }
    varv=$((varv+1))
  done
  echo "HÄMTNING KLAR — $(ls "$S/dubbad-$M"/*.mp4 2>/dev/null | wc -l) av $total"
  ;;

*) echo "Okänt steg: $STEG"; exit 2 ;;
esac
