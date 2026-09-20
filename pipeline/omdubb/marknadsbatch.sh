#!/bin/bash
# marknadsbatch.sh — kör marknadsvideo.mjs över en hel mapp källvideor.
#
#   pipeline/omdubb/marknadsbatch.sh <marknad> <kallmapp> <srtmapp> <utmapp> \
#       <produktfil> <butiksfil> [produktbild]
#
# En video i taget med flit. Varje körning drar ElevenLabs-krediter per cue och
# tar ~2-4 minuter (OCR-passen är det tunga), så parallellt hade bara gjort
# felen svårare att läsa. Videor som redan finns i utmappen hoppas — avbryt och
# starta om utan att göra om något.
#
# Summerar till sist: klara, hoppade, FELADE. En video som felar stoppar INTE
# batchen — den namnges, och listan är det som avgör om ordet "klart" får
# skrivas (samma regel som factory/rakning.mjs).

set -u
MARKNAD="$1"; KALLA="$2"; SRT="$3"; UT="$4"; PRODUKT="$5"; BUTIK="$6"; BILD="${7:-}"
ROT="$(cd "$(dirname "$0")/../.." && pwd)"
mkdir -p "$UT"

klara=0; hoppade=0; felade=0; FELLISTA=""; UTAN_MANUS=""

for f in "$KALLA"/*.mp4; do
  [ -e "$f" ] || continue
  n="$(basename "$f" .mp4)"
  manus="$SRT/$n.srt"
  # Målnamnet bär marknaden direkt efter brandprefixet — samma form som kontots
  # norska annonser (CaraShellRoof_NO_OB_101_H1), så datan går att skära per
  # land. Matchar namnet inte mönstret läggs marknaden först, hellre än att en
  # video tyst får ett namn som inte säger vilket land den hör till.
  malnamn="$(echo "$n" | sed -E "s/^([A-Za-z]+)_/\1_${MARKNAD}_/")"
  case "$malnamn" in *"_${MARKNAD}_"*) ;; *) malnamn="${MARKNAD}_${n}" ;; esac
  ut="$UT/$malnamn.mp4"
  if [ ! -f "$manus" ]; then
    UTAN_MANUS="$UTAN_MANUS $n"; continue
  fi
  if [ -f "$ut" ]; then
    hoppade=$((hoppade+1)); continue
  fi
  echo "─── $n ───────────────────────────────────────────"
  # ⚠️ EXITKODEN FÅR INTE GÅ GENOM ETT RÖR. `cmd | tail` returnerar TAILS status,
  # som alltid är 0 — mätt 2026-09-20: två videor felade (en med överlappande
  # slutkort, en som aldrig skrev sin fil) och batchen rapporterade "FELADE: 0".
  # Loggen skrivs därför till fil, och koden läses direkt.
  logg="$UT/$malnamn.logg"
  timeout "${TAK:-2400}" node "$ROT/pipeline/omdubb/marknadsvideo.mjs" \
      --kalla="$f" --srt="$manus" --marknad="$MARKNAD" --inbrand --captions \
      --produkt="$PRODUKT" --butik="$BUTIK" \
      ${BILD:+--produktbild="$BILD"} --ut="$ut" > "$logg" 2>&1
  kod=$?
  tail -4 "$logg"
  # En video utan fil är alltid ett fel, oavsett vad exitkoden säger.
  if [ "$kod" -eq 0 ] && [ -f "$ut" ]; then
    klara=$((klara+1))
  else
    felade=$((felade+1)); FELLISTA="$FELLISTA $n(kod=$kod)"
  fi
done

echo
echo "══ BATCH $MARKNAD ══"
echo "  klara:   $klara"
echo "  hoppade: $hoppade (fanns redan)"
echo "  FELADE:  $felade$FELLISTA"
[ -n "$UTAN_MANUS" ] && echo "  UTAN MANUS (aldrig försökta):$UTAN_MANUS"
[ "$felade" -gt 0 ] && exit 1
[ -n "$UTAN_MANUS" ] && exit 1
exit 0
