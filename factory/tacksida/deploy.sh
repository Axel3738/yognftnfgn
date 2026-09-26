#!/usr/bin/env bash
# Deployar tacksides-extensionen till EN OPS-butiks Fabriken-app med Shopify CLI.
#
#   bash factory/tacksida/deploy.sh carashell [--torr]
#
# Kräver (i Environments på claude.ai; syns i en redan körande session):
#   • SHOPIFY_APP_AUTOMATION_TOKEN_<BUTIK> (t.ex. _CARASHELL) — Dev Dashboard →
#     appen → Settings → App Automation Token (Shopifys dokumenterade väg för CI:
#     https://shopify.dev/docs/apps/launch/deployment/deploy-in-ci-cd-pipeline).
#     Token är PER APP, därför ett namn per butik. Delad
#     SHOPIFY_APP_AUTOMATION_TOKEN är reserv.
#   • Appen: TACKSIDA_CLIENT_ID_<BUTIK> (eller TACKSIDA_CLIENT_ID) för en egen
#     tacksides-app utan scopes — annars butikens Factory-app via
#     SHOPIFY_CLIENT_ID_<suffix> (samma nyckel som fabriken).
#
# Ordningen är Shopifys egen och den är inte förhandlingsbar:
#   1. `shopify app config link --client-id <id>` HÄMTAR appens riktiga konfig
#      (scopes, url:er, webhooks) till shopify.app.<butik>.toml. Deploy skickar
#      med konfigen — en handskriven toml med andra scopes hade skrivit över
#      appens scopes, och då slutar alla rutiner som mintar token via appen
#      att fungera. Därför vägrar skriptet deploya om den hämtade filen
#      saknar [access_scopes].scopes.
#   2. `shopify app deploy -c <butik> --allow-updates` bygger, laddar upp och
#      RELEASAR versionen — blocket finns då i kassaredigeraren men syns för
#      kunden först när någon lagt in det på tacksidan (Axels klick, README).
#
# --torr: kör steg 1 och visar vad steg 2 hade gjort, deployar inte.
set -euo pipefail

BUTIK="${1:?ange butik, t.ex. carashell}"
TORR=0
[[ "${2:-}" == "--torr" ]] && TORR=1

HAR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$HAR/app"
ROT="$(cd "$HAR/../.." && pwd)"

# Token per BUTIK vinner: SHOPIFY_APP_AUTOMATION_TOKEN_CARASHELL (Axels fråga
# 2026-09-26 — token är per app och varje butik har sin egen app, så ett namn
# per butik är det rätta). Den delade SHOPIFY_APP_AUTOMATION_TOKEN är reserv.
BUTIK_UPPER="$(echo "$BUTIK" | tr '[:lower:]-' '[:upper:]_')"
TOKEN_NAMN="SHOPIFY_APP_AUTOMATION_TOKEN_${BUTIK_UPPER}"
if [[ -n "${!TOKEN_NAMN:-}" ]]; then
  export SHOPIFY_APP_AUTOMATION_TOKEN="${!TOKEN_NAMN}"
  echo "Token: $TOKEN_NAMN"
elif [[ -n "${SHOPIFY_APP_AUTOMATION_TOKEN:-}" ]]; then
  echo "Token: SHOPIFY_APP_AUTOMATION_TOKEN (delad — sätt hellre $TOKEN_NAMN)"
else
  echo "STOPP: $TOKEN_NAMN (eller SHOPIFY_APP_AUTOMATION_TOKEN) saknas i miljön." >&2
  echo "Skapas i Dev Dashboard → appen → Settings → App Automation Token, läggs i Environments." >&2
  exit 2
fi

# Samma per butik för den egna tacksides-appens client id.
CLIENT_NAMN="TACKSIDA_CLIENT_ID_${BUTIK_UPPER}"
if [[ -n "${!CLIENT_NAMN:-}" ]]; then
  export TACKSIDA_CLIENT_ID="${!CLIENT_NAMN}"
fi

# Appen extensionen deployas till. Standard: butikens Factory-app (samma
# uppslag som fabriken: domän → suffix → nyckel). ⚠️ Den appen ligger i
# jobb-Gmailens Dev Dashboard-org (mätt 2026-09-26) — går den inte att nå
# skapas en EGEN app i Axels org "Carashell" (cowork/2-egen-app.txt) och dess
# client id sätts som TACKSIDA_CLIENT_ID i Environments. Den appen behöver
# inga scopes: kortet läser via Storefront-API:t (api_access i extensionen).
EGEN_APP=0
if [[ -n "${TACKSIDA_CLIENT_ID:-}" ]]; then
  CLIENT_ID="$TACKSIDA_CLIENT_ID"
  EGEN_APP=1
  echo "Deployar till den egna tacksides-appen (TACKSIDA_CLIENT_ID), inte Factory-appen."
else
CLIENT_ID="$(node --input-type=module -e "
import { readFileSync } from 'node:fs';
import { lasYaml } from '$ROT/factory/yaml.mjs';
import { suffixForDoman, losNycklar, normaliseraDoman } from '$ROT/factory/token.mjs';
const b = lasYaml(readFileSync('$ROT/factory/butiker/$BUTIK.yaml', 'utf8'));
const doman = normaliseraDoman(b.butik.myshopify);
const suffix = suffixForDoman(doman);
if (!suffix) { console.error('Ingen SHOPIFY_SHOP_<suffix> bär ' + doman); process.exit(3); }
const n = losNycklar(suffix);
if (normaliseraDoman(n.shop) !== doman || !n.clientId) { console.error('Nycklarna för ' + suffix + ' pekar inte på ' + doman); process.exit(3); }
process.stdout.write(n.clientId);
")"
fi
echo "Butik: $BUTIK · client id: ${CLIENT_ID:0:6}…"

cd "$APP"
if [[ ! -d node_modules/@shopify/cli ]]; then
  echo "Installerar beroenden (npm install)…"
  npm install --no-audit --no-fund >/dev/null
fi

export SHOPIFY_CLI_NO_ANALYTICS=1
KONFIG="shopify.app.$BUTIK.toml"

# Obs: SHOPIFY_FLAG_APP_CONFIG får INTE vara satt här — CLI:n läser den som
# --config och vägrar då kombinera med --client-id/--file-name (mätt 2026-09-26).
echo "1. Hämtar appens konfig från Dev Dashboard → $KONFIG"
env -u SHOPIFY_FLAG_APP_CONFIG node_modules/.bin/shopify app config link --client-id "$CLIENT_ID" --file-name "$KONFIG" --force

# Spärren gäller Factory-appen (154 scopes som rutinerna lever på). Den egna
# tacksides-appen HAR inga scopes med flit — då är en tom rad det rätta.
if [[ "$EGEN_APP" == "1" ]]; then
  echo "   egen app: inga scopes förväntas ($(grep -E '^\s*scopes\s*=' "$KONFIG" | head -1 | tr -d '\n' | cut -c1-80 || echo 'ingen scopes-rad'))"
elif ! grep -qE '^\s*scopes\s*=' "$KONFIG"; then
  echo "STOPP: $KONFIG saknar [access_scopes].scopes — deploy hade skrivit över appens rättigheter. Rör ingenting." >&2
  exit 4
else
  echo "   scopes i konfigen: $(grep -E '^\s*scopes\s*=' "$KONFIG" | head -1 | tr -d '\n' | cut -c1-120)…"
fi

if [[ "$TORR" == "1" ]]; then
  echo "2. (torrt) hade kört: shopify app deploy -c $BUTIK --allow-updates --message 'tacksida <datum>'"
  node_modules/.bin/shopify app build -c "$BUTIK" --skip-dependencies-installation
  exit 0
fi

echo "2. Deployar (bygger, laddar upp, releasar)"
node_modules/.bin/shopify app deploy -c "$BUTIK" --allow-updates --message "tacksida $(date -u +%Y-%m-%dT%H:%MZ)"

echo
echo "Klart. Blocket \"Tacksidan: erbjudande efter köp\" finns nu i kassaredigeraren."
echo "Kunden ser det först när det lagts in på tacksidan + orderstatussidan (README → Axels klick)."
