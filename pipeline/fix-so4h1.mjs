#!/usr/bin/env node
// fix-so4h1.mjs — löser COPY GATE punkt 1 i "Boat cover 420D creative hub".
//
//   node fix-so4h1.mjs [--dry]
//
// Enginecover_SO_4_H1 (act_1867947880635861, kampanj Motorhöljet, adset
// Motorhölje SO Batch 3) kör två textrader som briefens hard rules förbjuder:
//
//   1. Rubriken "Skydda din motor – innan vintern"
//      → bryter mot "Never reference winter, cold or autumn. It is August,
//        boating season."
//   2. Raden "Beställ innan lagret tar slut 👇"
//      → bryter mot "Never write 'innan lagret tar slut'. Only 'så länge lagret
//        räcker' is permitted."
//
// Briefen är uttrycklig om åtgärden: "Byt texten, pausa inte annonsen." Annonsen
// är kontots näst mest effektiva (CPA 107,76 kr, 1 190 kr vinst per 1 000), så
// ingreppet är medvetet minimalt — allt annat i texten står kvar ordagrant.
// Ersättningarna behåller originalets "innan X"-struktur och dess brådska, men
// pekar på nästa regn i stället för på vintern.
//
// Creatives går inte att uppdatera i efterhand (bara namn och status), så en ny
// creative byggs och kopplas på annonsen. Media, CTA, länk, beskrivning och
// enhancement-avstängningar följer med oförändrade.

const API = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_ACCESS_TOKEN;
const ACT = 'act_1867947880635861';        // MagiBorsten (SE)
const AD_ID = '120249525912940291';        // Enginecover_SO_4_H1
const DRY = process.argv.includes('--dry');

const FORBIDDEN_TITLE = 'Skydda din motor – innan vintern';
const FORBIDDEN_LINE = 'Beställ innan lagret tar slut 👇';
const NEW_TITLE = 'Skydda din motor – innan nästa regn';
const NEW_LINE = 'Så länge lagret räcker – beställ ditt hölje nu 👇';

if (!TOKEN) { console.error('✗ META_ACCESS_TOKEN saknas.'); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(path, { method = 'GET', form, params } = {}) {
  const url = new URL(`${API}/${path}`);
  let body;
  if (method === 'GET') {
    url.searchParams.set('access_token', TOKEN);
    for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  } else { body = new URLSearchParams(form); body.append('access_token', TOKEN); }
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { method, body });
    const json = await res.json().catch(() => ({}));
    if (res.ok && !json.error) return json;
    const e = json.error || {};
    if ((e.code === 17 || e.is_transient || res.status >= 500) && attempt < 10) {
      console.log(`  … väntar 60s (${e.code}, försök ${attempt})`); await sleep(60_000); continue;
    }
    throw new Error(`${path} → ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
}

const ad = await api(AD_ID, { params: {
  fields: 'name,status,effective_status,adset{name},campaign{name},creative{id,object_story_spec,degrees_of_freedom_spec}',
}});
const spec = ad.creative.object_story_spec;
const data = spec.video_data || spec.link_data;

console.log(`${ad.name} — ${ad.effective_status} · ${ad.campaign.name} / ${ad.adset.name}`);
console.log(`gammal rubrik: ${JSON.stringify(data.title || data.name)}`);
console.log(`gammal text:\n${data.message}\n`);

if (!(data.title || data.name || '').includes('vintern') && !data.message.includes(FORBIDDEN_LINE)) {
  console.log('Ingen förbjuden text kvar — inget att göra.'); process.exit(0);
}

if (data.title === FORBIDDEN_TITLE) data.title = NEW_TITLE;
else if (data.name === FORBIDDEN_TITLE) data.name = NEW_TITLE;
else console.log(`⚠ rubriken matchar inte den briefen pekar ut — lämnas orörd`);

if (data.message.includes(FORBIDDEN_LINE)) data.message = data.message.replace(FORBIDDEN_LINE, NEW_LINE);
else console.log('⚠ raden "Beställ innan lagret tar slut" fanns inte i texten');

// Meta läser ut både image_url och image_hash för video-thumbnails men accepterar bara en
if (spec.video_data && data.image_hash && data.image_url) delete data.image_url;

// standard_enhancements är utfasat och gör hela anropet ogiltigt om det skickas med
const dof = ad.creative.degrees_of_freedom_spec || {};
for (const dead of ['standard_enhancements', 'standard_enhancements_catalog'])
  delete dof.creative_features_spec?.[dead];

console.log(`ny rubrik: ${JSON.stringify(data.title || data.name)}`);
console.log(`ny text:\n${data.message}`);

if (DRY) { console.log('\n--dry: inget skickat.'); process.exit(0); }

const creative = await api(`${ACT}/adcreatives`, { method: 'POST', form: {
  name: `${ad.name}_creative_copygate`,
  object_story_spec: JSON.stringify(spec),
  degrees_of_freedom_spec: JSON.stringify(dof),
}});
await api(AD_ID, { method: 'POST', form: { creative: JSON.stringify({ creative_id: creative.id }) } });
console.log(`\n✓ ${ad.name} → ny creative ${creative.id}`);
