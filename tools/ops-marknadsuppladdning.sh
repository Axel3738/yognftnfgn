#!/bin/bash
# ops-marknadsuppladdning.sh — laddar upp en HEL mapp färdiga marknadscreatives
# genom tools/ops-till-meta.mjs, en i taget.
#
#   tools/ops-marknadsuppladdning.sh <nyckel> <marknad> <mediamapp> <copymapp> [--torr]
#
#     <mediamapp>  färdiga filer, namngivna <PREFIX>_<MARKNAD>_<KONCEPT>_<N>.mp4|.jpg
#     <copymapp>   en JSON per annons: {"namn","message","headline"}
#                  filnamnet är KÄLLANS namn (utan marknadskoden) — copyn skrevs
#                  mot källan, medias namn bär marknaden.
#
# Varför en i taget: Meta stryper skrivningarna (kod 17) och uppladdaren backar
# av upp till 27 minuter per anrop. Parallellt gör bara felen svårare att läsa,
# och en halv batch i kontot är värre än en långsam.
#
# Varje rad rapporteras. En creative som felar stoppar INTE körningen — den
# namnges, och summan i slutet är det som avgör om ordet "klart" får skrivas
# (samma regel som factory/rakning.mjs). Exit 1 om något felade eller saknade
# copy.
#
# ⚠️ EN KÖRNING TAR TIMMAR (Meta stryper skrivningarna, kod 17 — Danmark
# 2026-09-20: 59 annonser på ~7 h). Väntar du ut den: vänta på PID:en
# (`until ! kill -0 <pid>`), ALDRIG på skriptets NAMN med `pgrep -f`. Mätt
# samma natt: två väntare sökte båda efter texten "dk-upp.sh", hittade
# VARANDRAS kommandorader och väntade på varandra i sex timmar medan
# uppladdningen för länge sedan var klar. En namnsökning matchar varje skal
# som råkar bära namnet i sin kommandorad, din egen väntare inräknad.

set -u
NYCKEL="$1"; MARKNAD="$2"; MEDIA="$3"; COPY="$4"; TORR="${5:-}"
ROT="$(cd "$(dirname "$0")/.." && pwd)"

uppe=0; felade=0; utan_copy=0; FELLISTA=""; COPYLISTA=""

# ⚠️ ALLA filändelser ops-till-meta.mjs tar (VIDEO + BILD i den filen). Globbade
# den bara *.mp4 och *.jpg tog körningen tyst noll av 36 danska bilder — de låg
# som .png — och laddade i stället upp fyra kvarglömda .jpg från ett mellansteg.
# Mätt 2026-09-20. En saknad ändelse syns inte som ett fel, bara som en kortare kö.
for f in "$MEDIA"/*.mp4 "$MEDIA"/*.mov "$MEDIA"/*.jpg "$MEDIA"/*.jpeg "$MEDIA"/*.png; do
  [ -e "$f" ] || continue
  namn="$(basename "$f")"; namn="${namn%.*}"
  # Copyn skrevs mot KÄLLANS namn — ta bort marknadskoden för att hitta den.
  kalla="$(echo "$namn" | sed -E "s/^([A-Za-z]+)_${MARKNAD}_/\1_/")"
  cj="$COPY/$kalla.json"
  if [ ! -f "$cj" ]; then
    utan_copy=$((utan_copy+1)); COPYLISTA="$COPYLISTA $namn"; continue
  fi
  primar="$(node -e "process.stdout.write(require('$cj').message)")"
  rubrik="$(node -e "process.stdout.write(require('$cj').headline)")"
  echo "─── $namn ───"
  if node "$ROT/tools/ops-till-meta.mjs" "$NYCKEL" --marknad "$MARKNAD" \
      --namn "$namn" --fil "$f" --primar "$primar" --rubrik "$rubrik" $TORR 2>&1 | tail -3; then
    uppe=$((uppe+1))
  else
    felade=$((felade+1)); FELLISTA="$FELLISTA $namn"
  fi
done

echo
echo "══ UPPLADDNING $NYCKEL $MARKNAD ══"
echo "  uppe:      $uppe"
echo "  FELADE:    $felade$FELLISTA"
echo "  UTAN COPY: $utan_copy$COPYLISTA"
[ "$felade" -gt 0 ] && exit 1
[ "$utan_copy" -gt 0 ] && exit 1
exit 0
