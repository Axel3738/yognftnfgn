// temafil-sync.mjs — ser till att temats språkfil (locales/<språk>.json) faktiskt bär våra
// _temanycklar.json-texter, och registrerar om det som saknas. Läser filen, inte översättnings-API:t.
//
//   node worldwide/granskning/temafil-sync.mjs [--sprak it,nl,pl] [--skarpt]
//
// Mätt 2026-10-01: translationsRegister svarade OK på 262 nycklar i tre omgångar à 100, men den
// FÖRSTA omgången (sections.map … cart.* … collections.*) hamnade aldrig i locales/it.json — de två
// senare skrev över den. API:ts egen lista sa samtidigt att nycklar saknades som fanns i filen.
// Därför: en omgång i taget, paus, och filen läses tillbaka efter varje omgång.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasButik, skapaKlient } from '../../sparning/butik.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const a = process.argv.slice(2);
const skarpt = a.includes('--skarpt');
const SPRAK = a.includes('--sprak') ? a[a.indexOf('--sprak') + 1].split(',') : ['de', 'fr', 'es', 'it', 'nl', 'pl', 'pt-PT'];
const TEMA = 'gid://shopify/OnlineStoreTheme/210420334941';
const RESURS = 'gid://shopify/OnlineStoreThemeLocaleContent/210420334941';
const paus = (ms) => new Promise((o) => setTimeout(o, ms));
const k = await skapaKlient({ ...lasButik('baverbutiken'), env_suffix: 'SE' });

async function filen(l) {
  const d = await k.graphql(`query($f:[String!]){ theme(id:"${TEMA}"){ files(filenames:$f, first:1){ nodes{ body{ ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { f: [`locales/${l}.json`] });
  const c = d.theme.files.nodes[0]?.body?.content ?? '{}';
  const j = JSON.parse(c.replace(/^\/\*[\s\S]*?\*\//, ''));
  const platt = {};
  const gå = (o, p) => { for (const [kk, v] of Object.entries(o)) { const q = p ? `${p}.${kk}` : kk; if (v && typeof v === 'object' && !Array.isArray(v)) gå(v, q); else platt[q] = v; } };
  gå(j, '');
  return platt;
}

const innehall = new Map((await k.graphql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key value digest } } }`, { id: RESURS })).translatableResource.translatableContent.map((c) => [c.key, c]));
let fel = 0;
for (const l of SPRAK) {
  const fil = join(ROT, '..', 'oversattning', l, '_temanycklar.json');
  if (!existsSync(fil)) continue;
  const vara = JSON.parse(readFileSync(fil, 'utf8'));
  for (let varv = 1; varv <= 4; varv++) {
    const platt = await filen(l);
    const saknas = Object.entries(vara).filter(([kk, v]) => innehall.get(kk)?.digest && platt[kk] !== v);
    console.log(`${l} varv ${varv}: ${Object.keys(vara).length - saknas.length} av ${Object.keys(vara).length} i locales/${l}.json, ${saknas.length} saknas`);
    if (!saknas.length) break;
    if (!skarpt) { console.log(`  torrt: skulle registrera ${saknas.slice(0, 6).map(([kk]) => kk).join(', ')}…`); break; }
    const omgang = saknas.slice(0, 60);
    const r = await k.graphql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { translations { key } userErrors { field message } } }`,
      { id: RESURS, t: omgang.map(([kk, v]) => ({ key: kk, value: v, locale: l, translatableContentDigest: innehall.get(kk).digest })) });
    if (r.translationsRegister.userErrors.length) console.log('  userErrors:', JSON.stringify(r.translationsRegister.userErrors).slice(0, 300));
    await paus(12000);
  }
  const slut = await filen(l);
  const kvar = Object.entries(vara).filter(([kk, v]) => innehall.get(kk)?.digest && slut[kk] !== v);
  if (kvar.length) { fel++; console.log(`❌ ${l}: ${kvar.length} nycklar saknas fortfarande: ${kvar.slice(0, 5).map(([kk]) => kk).join(', ')}`); } else console.log(`✅ ${l}: alla nycklar i locales/${l}.json`);
}
process.exit(fel ? 1 : 0);
