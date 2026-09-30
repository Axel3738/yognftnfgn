#!/usr/bin/env bash
# Deployar värva-en-vän-kortet (checkout UI extension) till Matstrumpors EGEN
# tacksides-app med Shopify CLI. Samma väg som CaraShells tacksida
# (factory/tacksida/deploy.sh), men en egen app-mapp: en deploy här tar aldrig
# med CaraShells kort, och tvärtom.
#
#   bash matstrumpor/varva/deploy.sh [--torr]
#
# Kräver i Environments på claude.ai (syns i en redan körande session):
#   • TACKSIDA_CLIENT_ID_MATSTRUMPOR — appen "Matstrumpor Tacksida" (inga scopes),
#     skapad av matstrumpor/varva/cowork/1-tacksidan.txt.
#   • SHOPIFY_APP_AUTOMATION_TOKEN_MATSTRUMPOR — Dev Dashboard → appen → Settings →
#     App Automation Token (per app, därför per butik).
#
# Ordningen:
#   0. `node matstrumpor/varva.mjs --bygg` — kortets belopp, länkar och språk ur
#      konfig.json + sprak.json. Kortet räknar aldrig själv.
#   1. `shopify app config link` HÄMTAR appens riktiga konfig. En handskriven toml
#      hade skrivit över appens inställningar vid deploy.
#   2. `shopify app deploy` bygger, laddar upp och RELEASAR. Blocket finns då i
#      kassaredigeraren, men kunden ser det först när det lagts in på tacksidan
#      och orderstatussidan (steg 3 i Cowork-prompten).
#
# --torr: steg 0, 1 och en lokal build — deployar inte.
set -euo pipefail

TORR=0
[[ "${1:-}" == "--torr" ]] && TORR=1

HAR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$HAR/app"
ROT="$(cd "$HAR/../.." && pwd)"

if [[ -z "${TACKSIDA_CLIENT_ID_MATSTRUMPOR:-}" ]]; then
  echo "STOPP: TACKSIDA_CLIENT_ID_MATSTRUMPOR saknas i miljön (matstrumpor/varva/cowork/1-tacksidan.txt, steg 1–4)." >&2
  exit 2
fi
if [[ -z "${SHOPIFY_APP_AUTOMATION_TOKEN_MATSTRUMPOR:-}" ]]; then
  echo "STOPP: SHOPIFY_APP_AUTOMATION_TOKEN_MATSTRUMPOR saknas i miljön." >&2
  exit 2
fi
export SHOPIFY_APP_AUTOMATION_TOKEN="$SHOPIFY_APP_AUTOMATION_TOKEN_MATSTRUMPOR"
export SHOPIFY_CLI_NO_ANALYTICS=1

echo "0. Bygger kortets data och språk"
node "$ROT/matstrumpor/varva.mjs" --bygg

cd "$APP"
if [[ ! -d node_modules/@shopify/cli ]]; then
  echo "   installerar beroenden (npm install)…"
  npm install --no-audit --no-fund >/dev/null
fi

KONFIG="shopify.app.matstrumpor.toml"
echo "1. Hämtar appens konfig → $KONFIG"
env -u SHOPIFY_FLAG_APP_CONFIG node_modules/.bin/shopify app config link --client-id "$TACKSIDA_CLIENT_ID_MATSTRUMPOR" --file-name "$KONFIG" --force
echo "   scopes: $(grep -E '^\s*scopes\s*=' "$KONFIG" | head -1 | tr -d '\n' | cut -c1-80 || echo 'ingen scopes-rad') (appen ska inte ha några)"

if [[ "$TORR" == "1" ]]; then
  node_modules/.bin/shopify app build -c matstrumpor --skip-dependencies-installation
  echo "(torrt) hade kört: shopify app deploy -c matstrumpor --allow-updates"
  exit 0
fi

echo "2. Deployar (bygger, laddar upp, releasar)"
node_modules/.bin/shopify app deploy -c matstrumpor --allow-updates --message "varva $(date -u +%Y-%m-%dT%H:%MZ)"

echo
echo "Klart. Blocket \"Värva en vän\" finns nu i kassaredigeraren."
echo "Kunden ser det först när det lagts in på tacksidan + orderstatussidan (Cowork-prompten, steg 5–7)."
