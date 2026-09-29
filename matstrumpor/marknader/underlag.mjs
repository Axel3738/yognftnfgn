// underlag.mjs — det svenska översättningsunderlaget för Matstrumpor, läst ur
// Shopify. Butiken är byggd för hand (inte av fabriken), så det finns ingen
// yaml att bygga underlaget ur: sanningen är det som står i butiken just nu.
//
//   node matstrumpor/marknader/underlag.mjs            # skriver output/underlag-sv.json
//   node matstrumpor/marknader/underlag.mjs --visa     # bara sammanfattning, ingen fil
//
// Underlaget är ett platt JSON-objekt nyckel → svensk sträng, samma form som
// factory/oversattning.mjs (nycklarna är för människor, registreringen matchar
// på VÄRDE). Bredvid skrivs underlag-sv.resurser.json: vilka Shopify-resurser
// (id, typ, handle) som bär texterna, så bygg.mjs vet vad som ska registreras.
//
// Vad som tas med (kundsynligt):
//   produkt.<handle>.title|body_html|meta_title|meta_description  aktiva + olistade produkter
//   option.<handle>.<n>                                             optionens NAMN ("Par", "Storlek")
//   optionvarde.<handle>.<n>                                        optionens VÄRDEN ("5 - Par", "One Size")
//   kollektion.<handle>.title|body_html
//   sida.<handle>.title|body_html                                   publicerade sidor utom spårningssidan
//   policy.<TYP>.body                                               Shopifys tre policyer
//   meny.<id>.title                                                 alla menylänkar
//   paket.<handle>.rubrik|underrubrik|bricka|gratis_text            ms_paketniva (kräver translatable — bygg.mjs --steg definition)
//   tema.<mall>.<nyckel> / temagrupp.<grupp>.<nyckel> / temainst.<nyckel>   MAIN-temats JSON-texter
//   frakt.<id>.name|description                                     fraktsättens namn i kassan
//   filter.<id>.label                                               kollektionsfiltren
//   liquid.<fil>.<n>                                                hårdkodad svensk text i ms-*.liquid (patchas av bygg.mjs)
//
// Hoppar: handle, tekniska värden (shopify://, http, färger, tal, ren Liquid),
// metafält (Judge.me/Loox/Google — inte text), temats locale-strängar (temat
// bär egna nb/da/fi/en-filer), e-postmallar (eget spår: mejl/), spårningssidan.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasButik, skapaKlient } from '../../sparning/butik.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
export const KONFIG = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
export const OUTPUT = join(ROT, 'output');
export const underlagsfil = (locale = 'sv') => join(OUTPUT, `underlag-${locale}.json`);
export const resursfil = () => join(OUTPUT, 'underlag-sv.resurser.json');

// Samma tekniska undantag som factory/marknad.mjs arLacka: inget att översätta.
const TEKNISKT = /^(shopify:\/\/|https?:\/\/|\/|[a-z0-9_-]+$|[A-Z0-9_]+$|#[0-9a-fA-F]{3,8}$|-?\d+([.,]\d+)?$)/;
export const arText = (v) => {
  const s = String(v ?? '').trim();
  if (!s) return false;
  if (TEKNISKT.test(s)) return false;
  if (/^\{\{[^}]*\}\}$/.test(s)) return false;           // ren Liquid, kunden ser värdet
  if (/^(Default Title|Title)$/.test(s)) return false;   // Shopifys egen enproduktsoption
  return true;
};

// Hårdkodade kundtexter i temats egna snippets — exakt som de står i filen.
// bygg.mjs --steg tema byter dem mot locale-grenar. Nycklarna är stabila.
export const LIQUID_TEXTER = {
  'snippets/ms-paket.liquid': {
    valj_paket: 'Välj paket',
    lada: 'Låda',
    gratis: 'gratis',
    gratis_per_sushilada: 'Gratis per sushilåda',
    atpinnar_i_tra: 'Ätpinnar i trä',
    par: 'par',
    varde: 'värde',
    gratis_pa_kopet: 'Gratis på köpet',
    // Sortvalet per låda (rullistan i A/B-varianten sortval:b) — skärmläsarens etikett, "Sort i låda 1".
    sort_i_lada: 'Sort i låda',
  },
  // Köpknappen i paketväljaren (JS). Mätt 2026-09-29 av QA som kund: "Lägger i…" på varje språk.
  'assets/ms-paket.js': {
    lagger_i: 'Lägger i…',
    fel_lagga_i: 'Kunde inte lägga i varukorgen.',
    fel_forsok_igen: 'Det gick inte att lägga i varukorgen. Försök igen.',
  },
  'snippets/ms-sista-dag.liquid': {
    fars_dag: 'Beställ senast 24 oktober så är paketet framme till fars dag.',
    jul: 'Beställ senast 8 december så är paketet framme till jul.',
  },
  'snippets/ms-trust-row.liquid': {
    fri_frakt: 'Fri frakt i Sverige',
    oppet_kop: '30 dagars öppet köp',
    trygg_betalning: 'Trygg betalning',
  },
  'snippets/ms-bundle-picker.liquid': {
    popularast: 'Populärast',
    valj_paket: 'Välj paket',
    spara: 'Spara',
    slutsald: 'Slutsåld',
    billigare_per: 'billigare per',
    st: 'st',
  },
  'sections/ms-compare.liquid': { egenskap: 'Egenskap', ja: 'Ja', nej: 'Nej' },
  'sections/ms-reviews.liquid': { verifierat_kop: 'Verifierat köp' },
  'sections/ms-review-slider.liquid': { verifierat_kop: 'Verifierat köp' },
  // Leveransraden: text-parametern kommer ur product.json, "arbetsdagar" står i snippeten.
  'snippets/ms-delivery-estimate.liquid': { beraknad_leverans: 'Beräknad leverans', arbetsdagar: 'arbetsdagar' },
  // custom_liquid-block i JSON-mallarna (patchaMallJson) — nycklarna heter liquid.product.* / liquid.index.*
  'templates/product.json': { ms_storlek: 'Passar strl 36–44 · stretchigt material' },
  'templates/index.json': { ugc_markning: 'Miljöbilderna är AI-genererade illustrationer.' },
};

/** Ren: en alt-text som bara är ett filnamn (bevis-1.png) — ingen kundtext. */
export const arFilnamn = (v) => /^[^\s/]+\.(png|jpe?g|webp|gif|svg|avif)$/i.test(String(v ?? '').trim());

const slug = (s) =>String(s).toLowerCase().replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'x';

async function translatableIds(k, ids) {
  const ut = [];
  for (let i = 0; i < ids.length; i += 50) {
    const d = await k.graphql(`query($ids: [ID!]!) { translatableResourcesByIds(first: 50, resourceIds: $ids) { nodes { resourceId translatableContent { key value digest locale } } } }`, { ids: ids.slice(i, i + 50) });
    ut.push(...(d.translatableResourcesByIds?.nodes ?? []));
  }
  return ut;
}
async function translatableTyp(k, typ) {
  const ut = [];
  let efter = null;
  for (let s = 0; s < 30; s++) {
    const d = await k.graphql(`query($t: TranslatableResourceType!, $efter: String) { translatableResources(first: 100, resourceType: $t, after: $efter) { pageInfo { hasNextPage endCursor } nodes { resourceId translatableContent { key value digest locale } } } }`, { t: typ, efter });
    ut.push(...(d.translatableResources?.nodes ?? []));
    if (!d.translatableResources?.pageInfo?.hasNextPage) break;
    efter = d.translatableResources.pageInfo.endCursor;
  }
  return ut;
}

/** Ren logik: en resurs' translatableContent → underlagsrader { nyckel, value, key }. */
export function raderUr(prefix, content, { hoppaKeys = ['handle'] } = {}) {
  const ut = [];
  for (const c of content ?? []) {
    if (hoppaKeys.includes(c.key)) continue;
    if (!arText(c.value)) continue;
    // Temats nycklar bär ett hash-suffix (":3syj88j5f6ixv") — bort ur den mänskliga nyckeln.
    const ren = String(c.key).replace(/:[0-9a-z]{8,}$/i, '').replace(/^section\.[^.]+\.json\./, '').replace(/^section\.sections\/[^.]+\.json\./, '');
    ut.push({ nyckel: `${prefix}.${ren}`, key: c.key, value: c.value, digest: c.digest });
  }
  return ut;
}

export async function byggUnderlag({ k, konfig = KONFIG, logg = () => {} } = {}) {
  const underlag = { _om: `Svenskt underlag ur Shopify (${konfig.butik}), skrivet av matstrumpor/marknader/underlag.mjs ${new Date().toISOString().slice(0, 16)}Z. Nycklar för människor; registreringen matchar på värde. Allt med _-prefix ignoreras.` };
  const resurser = [];
  const laggTill = (typ, id, handle, prefix, content, opts) => {
    const rader = raderUr(prefix, content, opts);
    if (rader.length === 0) return 0;
    resurser.push({ id, typ, handle, prefix, keys: rader.map((r) => r.key) });
    for (const r of rader) {
      if (underlag[r.nyckel] !== undefined && underlag[r.nyckel] !== r.value) {
        // Samma mänskliga nyckel två gånger med olika text: gör den unik.
        underlag[`${r.nyckel}#${slug(r.value)}`] = r.value;
      } else {
        underlag[r.nyckel] = r.value;
      }
    }
    return rader.length;
  };

  // Produkter: aktiva + olistade (ätpinnarna är UNLISTED men syns i paketet och varukorgen).
  const prod = await k.graphql(`{ products(first: 50, query: "status:active OR status:unlisted") { nodes { id handle title status options { id name optionValues { id name } } } } }`);
  const produkter = prod.products.nodes.filter((p) => p.status !== 'ARCHIVED' && p.status !== 'DRAFT');
  logg(`Produkter: ${produkter.map((p) => `${p.handle} (${p.status})`).join(', ')}`);
  for (const p of produkter) {
    const ids = [p.id, ...p.options.map((o) => o.id), ...p.options.flatMap((o) => o.optionValues.map((v) => v.id))];
    for (const r of await translatableIds(k, ids)) {
      if (r.resourceId === p.id) laggTill('produkt', r.resourceId, p.handle, `produkt.${p.handle}`, r.translatableContent);
      else if (r.resourceId.includes('ProductOptionValue/')) laggTill('optionvarde', r.resourceId, p.handle, `optionvarde.${p.handle}`, r.translatableContent);
      else laggTill('option', r.resourceId, p.handle, `option.${p.handle}`, r.translatableContent);
    }
  }

  // Kollektioner, sidor (utom spårningssidan), policyer, menylänkar, filter, fraktsätt.
  const koll = await k.graphql(`{ collections(first: 50) { nodes { id handle } } }`);
  const kollId = new Map(koll.collections.nodes.map((c) => [c.id, c.handle]));
  for (const r of await translatableTyp(k, 'COLLECTION')) laggTill('kollektion', r.resourceId, kollId.get(r.resourceId) ?? null, `kollektion.${kollId.get(r.resourceId) ?? r.resourceId.split('/').pop()}`, r.translatableContent);

  const sidor = await k.graphql(`{ pages(first: 50) { nodes { id handle isPublished } } }`);
  const hoppaSidor = new Set(konfig.oversattning?.hoppa_sidor ?? []);
  const sidId = new Map(sidor.pages.nodes.map((s) => [s.id, s]));
  for (const r of await translatableTyp(k, 'PAGE')) {
    const s = sidId.get(r.resourceId);
    if (!s || !s.isPublished || hoppaSidor.has(s.handle)) continue;
    laggTill('sida', r.resourceId, s.handle, `sida.${s.handle}`, r.translatableContent);
  }

  const pol = await k.graphql(`{ shop { shopPolicies { id type } } }`);
  const polTyp = new Map(pol.shop.shopPolicies.map((p) => [p.id, p.type]));
  for (const r of await translatableTyp(k, 'SHOP_POLICY')) laggTill('policy', r.resourceId, null, `policy.${polTyp.get(r.resourceId) ?? r.resourceId.split('/').pop()}`, r.translatableContent);

  for (const r of await translatableTyp(k, 'LINK')) laggTill('menylänk', r.resourceId, null, `meny.${r.resourceId.split('/').pop()}`, r.translatableContent);
  for (const r of await translatableTyp(k, 'FILTER')) laggTill('filter', r.resourceId, null, `filter.${r.resourceId.split('/').pop()}`, r.translatableContent);
  for (const r of await translatableTyp(k, 'DELIVERY_METHOD_DEFINITION')) laggTill('fraktsätt', r.resourceId, null, `frakt.${r.resourceId.split('/').pop()}`, r.translatableContent);

  // Bildernas alt-text (Files). Startsidans miljöbilder bär svensk alt ("Fyra par fötter i soffan …
  // (AI-genererad illustrationsbild)") som skärmläsare och Google läste på alla språk (QA 2026-09-29).
  // Filnamn som alt (bevis-1.png, 022_H1-thumb.jpg) är ingen kundtext och tas inte med.
  for (const r of await translatableTyp(k, 'MEDIA_IMAGE')) {
    const alt = (r.translatableContent ?? []).find((c) => c.key === 'alt');
    if (!alt || arFilnamn(alt.value)) continue;
    laggTill('bildalt', r.resourceId, null, `bildalt.${r.resourceId.split('/').pop()}`, r.translatableContent);
  }

  // Paketnivåerna — bara om definitionen är translatable (annars tom translatableContent).
  const def = await k.graphql(`{ metaobjectDefinitionByType(type: "ms_paketniva") { capabilities { translatable { enabled } } } }`);
  const paketTranslatable = def.metaobjectDefinitionByType?.capabilities?.translatable?.enabled === true;
  const paket = await k.graphql(`{ metaobjects(type: "ms_paketniva", first: 30) { nodes { id handle } } }`);
  const paketHandle = new Map(paket.metaobjects.nodes.map((m) => [m.id, m.handle]));
  let paketRader = 0;
  if (paketTranslatable) {
    for (const r of await translatableIds(k, [...paketHandle.keys()])) {
      paketRader += laggTill('paket', r.resourceId, paketHandle.get(r.resourceId), `paket.${paketHandle.get(r.resourceId)}`, r.translatableContent, { hoppaKeys: ['handle', 'ab_variant', 'rabattkod'] });
    }
  }
  underlag._paketnivaer = paketTranslatable
    ? `ms_paketniva är translatable — ${paketRader} texter med.`
    : '⚠️ ms_paketniva saknar translatable-capability: paketnivåernas texter (Köp 1 – Få 1 GRATIS …) är INTE med. Kör `node matstrumpor/marknader/bygg.mjs --steg definition` och bygg underlaget igen.';
  logg(underlag._paketnivaer);

  // Temat: JSON-mallar, sektionsgrupper, temainställningar (brand_description) — bara MAIN-temat.
  const temaId = konfig.tema_id;
  const temaNr = String(temaId).split('/').pop();
  const f = await k.graphql(`query($id: ID!) { theme(id: $id) { name role files(first: 250, filenames: ["templates/*.json", "sections/*-group.json"]) { nodes { filename } } } }`, { id: temaId });
  if (f.theme?.role !== 'MAIN') throw new Error(`Temat ${temaId} är inte MAIN längre (${f.theme?.role ?? 'saknas'}) — uppdatera tema_id i konfig.json efter att ha läst themes { role }.`);
  const filnamn = f.theme.files.nodes.map((x) => x.filename);
  const temaIds = [
    ...filnamn.filter((x) => /^templates\/.+\.json$/.test(x)).map((x) => `gid://shopify/OnlineStoreThemeJsonTemplate/${x.replace(/^templates\//, '').replace(/\.json$/, '')}?theme_id=${temaNr}`),
    ...filnamn.filter((x) => /^sections\/[^/]+-group\.json$/.test(x)).map((x) => `gid://shopify/OnlineStoreThemeSectionGroup/${x.replace(/^sections\//, '').replace(/\.json$/, '')}?theme_id=${temaNr}`),
  ];
  for (const r of await translatableIds(k, temaIds)) {
    const namn = r.resourceId.split('/').pop().split('?')[0];
    const typ = r.resourceId.includes('SectionGroup/') ? 'temagrupp' : 'temamall';
    laggTill(typ, r.resourceId, namn, `${typ === 'temagrupp' ? 'temagrupp' : 'tema'}.${namn}`, r.translatableContent);
  }
  for (const r of await translatableTyp(k, 'ONLINE_STORE_THEME_SETTINGS_CATEGORY')) {
    if (!r.resourceId.includes(`theme_id=${temaNr}`)) continue;
    laggTill('temainställning', r.resourceId, null, 'temainst', r.translatableContent);
  }

  // Hårdkodad liquid-text (patchas, registreras inte).
  for (const [fil, texter] of Object.entries(LIQUID_TEXTER)) {
    // Samma nyckel som temapatch.mjs liquidNyckel: filnamn utan mapp och utan .liquid/.json
    // (mätt 2026-09-27: `.json` följde med och gav `liquid.product.json.ms_storlek`, som temat aldrig slog upp).
    for (const [n, v] of Object.entries(texter)) underlag[`liquid.${fil.replace(/^.*\//, '').replace(/\.(liquid|json)$/, '')}.${n}`] = v;
  }
  underlag._liquid = 'liquid.*-raderna är hårdkodad text i temats ms-*.liquid — de patchas med locale-grenar av bygg.mjs --steg tema, aldrig via translationsRegister.';

  return { underlag, resurser, paketTranslatable };
}

export function sammanfatta(underlag) {
  const per = {};
  let tecken = 0;
  for (const [n, v] of Object.entries(underlag)) {
    if (n.startsWith('_')) continue;
    const typ = n.split('.')[0];
    per[typ] = (per[typ] ?? 0) + 1;
    tecken += String(v).length;
  }
  return { per, antal: Object.values(per).reduce((a, b) => a + b, 0), tecken };
}

async function huvud() {
  const arg = process.argv.slice(2);
  const butik = lasButik(KONFIG.butik);
  const k = await skapaKlient(butik);
  const { underlag, resurser } = await byggUnderlag({ k, logg: (s) => console.log(s) });
  const s = sammanfatta(underlag);
  console.log(`Underlag: ${s.antal} texter, ${s.tecken} tecken — ${Object.entries(s.per).map(([t, n]) => `${t} ${n}`).join(', ')}`);
  if (arg.includes('--visa')) return;
  mkdirSync(OUTPUT, { recursive: true });
  writeFileSync(underlagsfil('sv'), JSON.stringify(underlag, null, 1) + '\n');
  writeFileSync(resursfil(), JSON.stringify({ _om: 'Shopify-resurserna underlaget kom ur; bygg.mjs registrerar översättningar per resurs.', resurser }, null, 1) + '\n');
  console.log(`Skrev ${underlagsfil('sv')} och ${resursfil()}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
