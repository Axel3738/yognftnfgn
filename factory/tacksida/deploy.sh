#!/usr/bin/env bash
# Deployar tacksides-extensionen till EN OPS-butiks Fabriken-app med Shopify CLI.
#
#   SHOPIFY_APP_AUTOMATION_TOKEN=… bash factory/tacksida/deploy.sh carashell [--torr]
#
# Kräver:
#   • SHOPIFY_APP_AUTOMATION_TOKEN — Dev Dashboard → appen "Factory (Carashell)"
#     → Settings → App Automation Token (Shopifys dokumenterade väg för CI:
#     https://shopify.dev/docs/apps/launch/deployment/deploy-in-ci-cd-pipeline).
#     Läggs in i Environments på claude.ai; syns i en redan körande session.
#   • SHOPIFY_CLIENT_ID_<suffix> för butiken (samma nyckel som fabriken).
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

if [[ -z "${SHOPIFY_APP_AUTOMATION_TOKEN:-}" ]]; then
  echo "STOPP: SHOPIFY_APP_AUTOMATION_TOKEN saknas i miljön." >&2
  echo "Skapas i Dev Dashboard → appen → Settings → App Automation Token, läggs i Environments." >&2
  exit 2
fi

# Butikens client id via samma uppslag som fabriken (domän → suffix → nyckel).
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
echo "Butik: $BUTIK · client id: ${CLIENT_ID:0:6}…"

cd "$APP"
if [[ ! -d node_modules/@shopify/cli ]]; then
  echo "Installerar beroenden (npm install)…"
  npm install --no-audit --no-fund >/dev/null
fi

export SHOPIFY_CLI_NO_ANALYTICS=1
export SHOPIFY_FLAG_APP_CONFIG="$BUTIK"
KONFIG="shopify.app.$BUTIK.toml"

echo "1. Hämtar appens konfig från Dev Dashboard → $KONFIG"
node_modules/.bin/shopify app config link --client-id "$CLIENT_ID" --file-name "$KONFIG" --force

if ! grep -qE '^\s*scopes\s*=' "$KONFIG"; then
  echo "STOPP: $KONFIG saknar [access_scopes].scopes — deploy hade skrivit över appens rättigheter. Rör ingenting." >&2
  exit 4
fi
echo "   scopes i konfigen: $(grep -E '^\s*scopes\s*=' "$KONFIG" | head -1 | tr -d '\n' | cut -c1-120)…"

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
