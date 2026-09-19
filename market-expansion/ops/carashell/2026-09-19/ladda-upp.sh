#!/bin/bash
# Laddar upp dagens sex norska bildannonser LIVE i CARASHELL_NO_Takovertrekket.
# En i taget — Metas rate limit (kod 17) backar av upp till 27 min per anrop,
# så parallellt går inte fortare, bara mer oläsbart. Resultatet per annons
# skrivs som en JSON-rad i resultat.jsonl.
set -u
cd /home/user/yognftnfgn
D=market-expansion/ops/carashell/2026-09-19
LANK="https://carashell.se/nb/products/takskyddet?country=NO"
: > $D/resultat.jsonl
for n in CS_6_1 CS_5_1 SP_5_1 SP_7_1 PD_7_1 PD_6_1; do
  namn="CaraShellRoof_NO_$n"
  echo "=== $namn ===" >&2
  node tools/ops-till-meta.mjs carashell/takskyddet --marknad NO --json \
    --namn "$namn" \
    --fil "$D/no/$namn.jpg" \
    --primar  "$(node -p "require('./$D/adcopy-NO.json')['$namn'].message")" \
    --rubrik  "$(node -p "require('./$D/adcopy-NO.json')['$namn'].headline")" \
    --beskrivning "$(node -p "require('./$D/adcopy-NO.json')['$namn'].description")" \
    --lank "$LANK" >> $D/resultat.jsonl
  echo "   exit=$?" >&2
done
echo "KLART" >&2
