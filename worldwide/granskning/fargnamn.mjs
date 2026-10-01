// Färgnamnen i Shopifys färgkategori på de åtta utlandsspråken (kassan och mejlen visar dem).
// Färgerna är metaobjekt (shopify--color-pattern); temat byter dem redan på produktsidan och i
// korgen (bw-appord → varden), men kassan läser Shopifys egna översättningar. Svenskan rörs aldrig.
// Kräver read_metaobjects på appen "Bäver uppladdare" (worldwide/cowork/4-slutklick.txt steg 2;
// utan den svarar translatableResources(METAOBJECT) med noll rader, mätt 2026-10-01).
//   node worldwide/granskning/fargnamn.mjs            torrt: visar vad som skulle registreras
//   node worldwide/granskning/fargnamn.mjs --skarpt   registrerar och läser tillbaka
import { readFileSync } from 'node:fs';
import { KONFIG } from '../bygg.mjs';
import { lasButik, skapaKlient } from '../../sparning/butik.mjs';

const SKARPT = process.argv.includes('--skarpt');
const TABELL = JSON.parse(readFileSync(new URL('../tema/fargnamn.json', import.meta.url), 'utf8')).farger;
const SPRAK = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt-PT'];

/** Ren funktion: vilka översättningar som ska registreras för en resurs (testbar utan nät). */
export function planFor(resurs, tabell = TABELL) {
  const ut = [];
  for (const c of resurs.translatableContent) {
    const rad = tabell[(c.value || '').trim()];
    if (!rad || !/label|name/i.test(c.key)) continue;
    for (const l of SPRAK) if (rad[l]) ut.push({ locale: l, key: c.key, value: rad[l], translatableContentDigest: c.digest, kalla: c.value });
  }
  return ut;
}

async function hamta(k) {
  const ut = []; let efter = null;
  for (;;) {
    const r = await k.graphql(`query($e: String) { translatableResources(first: 100, after: $e, resourceType: METAOBJECT) { pageInfo { hasNextPage endCursor } nodes { resourceId translatableContent { key value digest } } } }`, { e: efter });
    ut.push(...r.translatableResources.nodes);
    if (!r.translatableResources.pageInfo.hasNextPage) return ut;
    efter = r.translatableResources.pageInfo.endCursor;
  }
}

async function main() {
  const k = await skapaKlient({ ...lasButik('baverbutiken'), env_suffix: KONFIG.butik.env_suffix });
  const s = await k.graphql(`{ currentAppInstallation { accessScopes { handle } } }`);
  const scopes = s.currentAppInstallation.accessScopes.map((x) => x.handle);
  if (!scopes.includes('read_metaobjects') && !scopes.includes('write_metaobjects')) {
    console.log('❌ Appen saknar read_metaobjects — kör worldwide/cowork/4-slutklick.txt steg 2 först.');
    process.exit(1);
  }
  const resurser = await hamta(k);
  const traffade = new Set();
  let antal = 0, fel = 0;
  for (const r of resurser) {
    const plan = planFor(r);
    if (!plan.length) continue;
    plan.forEach((p) => traffade.add(p.kalla.trim()));
    console.log(`${r.resourceId}  ${plan[0].kalla} → ${plan.map((p) => `${p.locale}:${p.value}`).join(' ')}`);
    if (!SKARPT) continue;
    for (const l of SPRAK) {
      const t = plan.filter((p) => p.locale === l).map(({ locale, key, value, translatableContentDigest }) => ({ locale, key, value, translatableContentDigest }));
      if (!t.length) continue;
      const svar = await k.graphql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { translations { key value } userErrors { field message } } }`, { id: r.resourceId, t });
      const ue = svar.translationsRegister.userErrors;
      if (ue.length) { fel++; console.log(`  ❌ ${l}: ${ue.map((e) => e.message).join('; ')}`); } else antal += t.length;
    }
    // Tillbakaläsning: varje språk ska bära exakt tabellens ord.
    for (const l of SPRAK) {
      const rr = await k.graphql(`query($id: ID!, $l: String!) { translatableResource(resourceId: $id) { translations(locale: $l) { key value } } }`, { id: r.resourceId, l });
      for (const p of plan.filter((x) => x.locale === l)) {
        const v = rr.translatableResource.translations.find((x) => x.key === p.key)?.value;
        if (v !== p.value) { fel++; console.log(`  ❌ ${l} ${p.key}: läst "${v}", väntat "${p.value}"`); }
      }
    }
  }
  const saknas = Object.keys(TABELL).filter((f) => !traffade.has(f));
  console.log(`\n${resurser.length} metaobjekt lästa, ${traffade.size} av ${Object.keys(TABELL).length} färger hittade${saknas.length ? ` (saknas: ${saknas.join(', ')})` : ''}.`);
  console.log(SKARPT ? `${antal} översättningar registrerade, ${fel} fel.` : 'Torrt — inget registrerat. Lägg till --skarpt.');
  if (fel) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
