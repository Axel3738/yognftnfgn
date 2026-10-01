// live.mjs — UGC-looparna live på matstrumpor.se. Axels order 2026-10-01: "Kör allt förutom det
// mörka blocket. … på produktsidan så ändrar du allt i produktbeskrivningen."
//
//   node matstrumpor/ugc-loopar/live.mjs --steg tema     [--skarpt]  # startsidan: förslag 1–4
//   node matstrumpor/ugc-loopar/live.mjs --steg rubrik   [--skarpt]  # orange del i berättelsens rubrik, alla språk
//   node matstrumpor/ugc-loopar/live.mjs --steg produkt  [--skarpt]  # produktbeskrivningen: förslag 6, alla språk
//                                                                     # (bandet, förslag 5, togs bort 2026-10-01 kväll)
//   node matstrumpor/ugc-loopar/live.mjs --aterstall     [--skarpt]  # lägger tillbaka originalen ur backup/
//
// Utan --skarpt skrivs ingenting, skriptet säger bara vad som skulle ändras. Före första
// skarpa skrivningen sparas originalen i backup/ (committas), och varje skrivning läses
// tillbaka. Bara Matstrumpor, bara det publicerade temat, bara produkten sushi-strumpor.
//
// ⛔ Katarinas loopar (*_sv) visas bara för svenska kunder i Sverige (ms-loop.liquid +
// sektionernas ms_sverige). Produktbeskrivningen bär inga Katarina-loopar alls, för där
// går det inte att villkora på land.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const TEMA = join(HAR, 'tema');
const BACKUP = join(HAR, 'backup');
export const MARK = 'ms-loopar';
export const PRODUKT_HANDLE = 'sushi-strumpor';
const SPRAK = () => JSON.parse(readFileSync(join(HAR, 'sprak.json'), 'utf8'));
const FILER = () => JSON.parse(readFileSync(join(HAR, 'filer.json'), 'utf8'));
const LOOPAR = ['avslojandet', 'rullen', 'uppackningen', 'plocka', 'ladan', 'soffan', 'strumpan_sv', 'reaktionen_sv', 'tamago_sv'];
/** Looparna i produktbeskrivningen, i ordning. */
export const BESKRIVNINGENS_LOOPAR = ['uppackningen', 'avslojandet'];

// ------------------------------------------------------------------ rena byggare

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** case-grenarna i ms-loop.liquid: loopnamn → mp4 + jpg ur filer.json. */
export function byggKallor(filer) {
  return LOOPAR.map((n) => {
    if (!filer[n]?.mp4 || !filer[n]?.jpg) throw new Error(`filer.json saknar ${n} — kör filer.mjs --skarpt.`);
    return `    when '${n}'\n      assign ms_mp4 = '${filer[n].mp4}'\n      assign ms_jpg = '${filer[n].jpg}'`;
  }).join('\n');
}

/** snippets/ms-loop-text.liquid: varje text på alla språk (sv = else-grenen). */
export function byggTexter(sprak) {
  const nycklar = Object.keys(sprak.sv);
  const saknar = [];
  for (const l of Object.keys(sprak)) for (const n of nycklar) if (n !== 'strumpan' && !sprak[l][n]) saknar.push(`${l}.${n}`);
  if (saknar.length) throw new Error(`sprak.json saknar: ${saknar.join(', ')}`);
  const grenar = nycklar.map((n) => {
    const per = Object.keys(sprak).filter((l) => l !== 'sv' && sprak[l][n]).map((l) => `{%- when '${l}' -%}${esc(sprak[l][n])}`).join('');
    return `{%- when '${n}' -%}{%- case request.locale.iso_code -%}${per}{%- else -%}${esc(sprak.sv[n])}{%- endcase -%}`;
  }).join('\n');
  return `{%- comment -%} ${MARK}: texterna på alla språk ur matstrumpor/ugc-loopar/sprak.json — byggs av live.mjs, ändra i repot. {%- endcomment -%}\n{%- case t -%}\n${grenar}\n{%- endcase -%}\n`;
}

const SETTING = `    {
      "type": "select",
      "id": "ms_loop",
      "label": "Matstrumpor: loop",
      "default": "ingen",
      "options": [
        { "value": "ingen", "label": "Ingen" },
${LOOPAR.filter((n) => !n.endsWith('_sv')).map((n) => `        { "value": "${n}", "label": "${n}" }`).join(',\n')}
      ]
    },
`;
const AKTIV = `section.settings.ms_loop != blank and section.settings.ms_loop != 'ingen'`;

function laggTillSetting(kod) {
  const s = kod.indexOf('{% schema %}');
  const i = kod.indexOf('"settings": [\n', s);
  if (s < 0 || i < 0) throw new Error('schemat saknar "settings": [');
  const efter = i + '"settings": [\n'.length;
  return kod.slice(0, efter) + SETTING + kod.slice(efter);
}

/** sections/image-banner.liquid: loopen i bildytan (mobil) och som kort (dator). Idempotent. */
export function patchaBanner(kod) {
  if (kod.includes(MARK)) return kod;
  const a1 = '{%- if section.settings.image != blank -%}\n    <div class="banner__media media';
  const i1 = kod.indexOf(a1);
  if (i1 < 0 || kod.indexOf(a1, i1 + 1) >= 0) throw new Error('image-banner: ankaret för bildytan hittas inte exakt en gång.');
  const radslut = kod.indexOf('\n', i1 + a1.length);
  const mobil = `\n      {%- comment -%} ${MARK} {%- endcomment -%}{%- if ${AKTIV} -%}{% render 'ms-loop-hero', del: 'mobil', loop: section.settings.ms_loop, id: section.id %}{%- endif -%}`;
  let ut = kod.slice(0, radslut) + mobil + kod.slice(radslut);
  const a2 = '</div>\n\n{% schema %}';
  const i2 = ut.indexOf(a2);
  if (i2 < 0 || ut.indexOf(a2, i2 + 1) >= 0) throw new Error('image-banner: ankaret före schemat hittas inte exakt en gång.');
  const kort = `  {%- if ${AKTIV} -%}{% render 'ms-loop-hero', del: 'kort', loop: section.settings.ms_loop, id: section.id %}{%- endif -%}\n`;
  ut = ut.slice(0, i2) + kort + ut.slice(i2);
  return laggTillSetting(ut);
}

/** sections/rich-text.liquid: loopen före texten när ms_loop är satt. Idempotent. */
export function patchaRichText(kod) {
  if (kod.includes(MARK)) return kod;
  const a = '<div class="rich-text__wrapper rich-text__wrapper--{{ section.settings.desktop_content_position }}{% if section.settings.full_width %} page-width{% endif %}">\n';
  const i = kod.indexOf(a);
  if (i < 0 || kod.indexOf(a, i + 1) >= 0) throw new Error('rich-text: ankaret hittas inte exakt en gång.');
  const ny = `<div class="rich-text__wrapper{% if ${AKTIV} %} ms-loop-wrapper{% endif %} rich-text__wrapper--{{ section.settings.desktop_content_position }}{% if section.settings.full_width %} page-width{% endif %}">\n`
    + `      {%- comment -%} ${MARK} {%- endcomment -%}{%- if ${AKTIV} -%}{{ 'ms-loopar.css' | asset_url | stylesheet_tag }}<script src="{{ 'ms-loopar.js' | asset_url }}" defer="defer"></script><div class="ms-loop-kort ms-loop-berattelse">{% render 'ms-loop', loop: section.settings.ms_loop %}</div>{%- endif -%}\n`;
  return laggTillSetting(kod.slice(0, i) + ny + kod.slice(i + a.length));
}

/** templates/index.json: förslag 1–4. Ren; samma objekt tillbaka om allt redan står rätt. */
export function patchaIndex(index) {
  const ut = JSON.parse(JSON.stringify(index));
  const s = ut.sections;
  let andrat = false;
  const satt = (obj, k, v) => { if (obj[k] !== v) { obj[k] = v; andrat = true; } };
  if (!s.hero || s.hero.type !== 'image-banner') throw new Error('index.json: hero är inte image-banner.');
  if (!s.berattelse || s.berattelse.type !== 'rich-text') throw new Error('index.json: berattelse är inte rich-text.');
  satt(s.hero.settings, 'ms_loop', 'avslojandet');
  satt(s.berattelse.settings, 'ms_loop', 'rullen');
  const h = s.berattelse.blocks?.h?.settings;
  if (!h?.heading) throw new Error('index.json: berättelsens rubrik saknas.');
  if (!h.heading.includes('<em>')) satt(h, 'heading', accentRubrik(h.heading, 'sv'));
  if (!s.ms_loop_band) {
    s.ms_loop_band = { type: 'ms-loop-band', settings: {} };
    const i = ut.order.indexOf('trustpilot_rad');
    ut.order.splice(i >= 0 ? i + 1 : 1, 0, 'ms_loop_band');
    andrat = true;
  }
  if (!s.ms_loop_grid) {
    s.ms_loop_grid = { type: 'ms-loop-grid', settings: {} };
    const i = ut.order.indexOf('ugc_galleri');
    ut.order.splice(i >= 0 ? i + 1 : ut.order.length, 0, 'ms_loop_grid');
    andrat = true;
  }
  for (const k of ['ugc_galleri', 'ugc_markning']) if (s[k] && s[k].disabled !== true) { s[k].disabled = true; andrat = true; }
  return andrat ? ut : index;
}

/** Den del av berättelsens rubrik som blir orange, per språk (rubrikerna fanns redan översatta). */
export const ACCENT = {
  sv: 'aldrig blandar ihop', nb: 'aldri forveksler', da: 'aldrig forveksler', fi: 'koskaan sekoita',
  en: 'never mix up', de: 'nie verwechselt', fr: 'ne mélange jamais', nl: 'nooit meer verwisselt',
  es: 'nunca se confunden', it: 'non si confondono mai', pl: 'nigdy nie pomylisz', 'pt-PT': 'nunca confundes',
  ja: '取り違えようのない', 'zh-TW': '永遠不會搞混的',
};
export function accentRubrik(text, lok) {
  if (String(text).includes('<em>')) return text;
  const d = ACCENT[lok];
  if (!d || !text.includes(d)) throw new Error(`rubriken på ${lok} bär inte "${d}": "${text}"`);
  return text.replace(d, `<em>${d}</em>`);
}

/** Tar bort elementet som börjar vid `start`, med allt inuti (räknar inre element av samma tagg). */
function utanElement(html, start) {
  const tagg = /^<(\w+)/.exec(html.slice(start))?.[1];
  if (!tagg) throw new Error('inget element vid start.');
  const re = new RegExp(`</?${tagg}\\b[^>]*>`, 'g');
  re.lastIndex = start;
  let djup = 0;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    djup += m[0][1] === '/' ? -1 : 1;
    if (djup === 0) {
      const slut = re.lastIndex + (html[re.lastIndex] === '\n' ? 1 : 0);
      return html.slice(0, start) + html.slice(slut);
    }
  }
  throw new Error(`<${tagg}> vid ${start} stängs aldrig.`);
}

/** Bandet med tre små loopar överst (live 2026-10-01 kväll) bort — Axel: etiketterna krockade på mobilen. */
export function utanBand(html) {
  let ut = html.replace(/<style>\.ms-loop-mini[^<]*<\/style>\n?/g, '');
  for (let i = ut.indexOf('<div class="ms-loop-mini"'); i >= 0; i = ut.indexOf('<div class="ms-loop-mini"')) ut = utanElement(ut, i);
  return ut;
}

/** Loopnamnet ur en posteradress (ms-loop-uppackningen-v2.jpg → uppackningen). */
export function loopUrPoster(url) {
  const m = /\/ms-loop-([a-z-]+?)(?:-v\d+)?\.jpg/.exec(url);
  return m ? m[1].replace(/-sv$/, '_sv') : null;
}

/** Byter varje loops poster och källa i beskrivningen mot filer.json:s (nya versioner av klippen). */
export function nyaAdresser(html, filer) {
  return html.replace(/<video\b[^>]*>[\s\S]*?<\/video>/g, (v) => {
    const poster = /poster="([^"]*)"/.exec(v)?.[1];
    const namn = poster && loopUrPoster(poster);
    if (!namn) return v;
    if (!filer[namn]?.mp4 || !filer[namn]?.jpg) throw new Error(`filer.json saknar ${namn}.`);
    return v.replace(/poster="[^"]*"/, `poster="${filer[namn].jpg}"`).replace(/<source src="[^"]*"/, `<source src="${filer[namn].mp4}"`);
  });
}

/** Produktbeskrivningen: uppackningen i stället för leverantörens webp, avslöjandet efter "Ser ut som sushi".
 *  Bär beskrivningen redan looparna tas bandet bort och adresserna byts till filer.json:s. */
export function byggBeskrivning(html, lok, filer) {
  if (html.includes('ms-loop-beskr')) return nyaAdresser(utanBand(html), filer);
  const video = (n, stil, extra = '') => `<video autoplay muted loop playsinline preload="metadata" poster="${filer[n].jpg}" style="${stil}"${extra}><source src="${filer[n].mp4}" type="video/mp4"></video>`;
  const stor = 'display:block;width:100%;max-width:420px;height:auto;aspect-ratio:1/1;object-fit:cover;border-radius:18px';
  // 1. Leverantörens webp (15,7 MB, samma film som MatSokker har) → vår uppackning, med webp:ens alt-text.
  const webp = /<p>\s*<img[^>]*ezgif[^>]*>\s*<\/p>/;
  const m = html.match(webp);
  if (!m) throw new Error(`${lok}: leverantörens ezgif-bild hittas inte i beskrivningen.`);
  const alt = (m[0].match(/alt="([^"]*)"/) ?? [])[1] ?? '';
  let ut = html.replace(webp, `<div class="ms-loop-beskr" style="margin:14px 0 18px">${video('uppackningen', stor, alt ? ` aria-label="${alt}"` : ' aria-hidden="true"')}</div>`);
  // 2. Avslöjandet efter stycket som följer den andra rubriken ("Ser ut som sushi. Är strumpor.").
  const h3 = [...ut.matchAll(/<h3>/g)].map((x) => x.index);
  if (h3.length < 2) throw new Error(`${lok}: beskrivningen har färre än två rubriker.`);
  const slut = ut.indexOf('</p>', h3[1]);
  if (slut < 0 || (h3[2] != null && slut > h3[2])) throw new Error(`${lok}: stycket efter andra rubriken hittas inte.`);
  const efter = slut + '</p>'.length;
  ut = ut.slice(0, efter) + `\n<div class="ms-loop-beskr" style="margin:14px 0 18px">${video('avslojandet', stor, ' aria-hidden="true"')}</div>` + ut.slice(efter);
  return ut;
}

/** Kontrollen efter skrivning: två loopar med filer.json:s adresser, inget band, ingen webp. */
export function beskrivningsfel(html, filer) {
  const fel = [];
  const videor = (html.match(/<video\b/g) ?? []).length;
  if (videor !== BESKRIVNINGENS_LOOPAR.length) fel.push(`${videor} videor`);
  if (html.includes('ms-loop-mini')) fel.push('bandet kvar');
  if (html.includes('ezgif')) fel.push('ezgif kvar');
  for (const n of BESKRIVNINGENS_LOOPAR) if (!html.includes(filer[n].mp4) || !html.includes(filer[n].jpg)) fel.push(`${n} har inte filer.json:s adress`);
  return fel;
}

// ------------------------------------------------------------------ butiken

async function klientFor() {
  (await import('../../mejl/shopify.mjs')).kravProxy();
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  return skapaKlient(lasButik('matstrumpor'));
}

async function huvudtema(k) {
  const t = await k.graphql('{ themes(first: 5, roles: [MAIN]) { nodes { id name role } } }');
  const tema = (t.themes?.nodes ?? []).find((x) => x.role === 'MAIN');
  if (!tema) throw new Error('hittar inget publicerat tema.');
  return tema;
}

async function lasFiler(k, temaId, namn) {
  const d = await k.graphql(
    `query($id: ID!, $n: [String!]) { theme(id: $id) { files(filenames: $n, first: 20) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
    { id: temaId, n: namn }
  );
  const ut = {};
  for (const f of d.theme?.files?.nodes ?? []) ut[f.filename] = f.body?.content ?? null;
  return ut;
}

const lasJson = (text) => JSON.parse(text.slice(text.indexOf('{')));

function backupa(namn, innehall) {
  const fil = join(BACKUP, namn.replace(/\//g, '__'));
  mkdirSync(BACKUP, { recursive: true });
  if (existsSync(fil)) return false; // första originalet behålls
  writeFileSync(fil, innehall);
  return true;
}

async function skrivTemafiler(k, temaId, filer) {
  const u = await k.graphql(
    `mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename message } } }`,
    { id: temaId, files: filer.map(({ filename, value }) => ({ filename, body: { type: 'TEXT', value } })) }
  );
  const fel = u.themeFilesUpsert?.userErrors ?? [];
  if (fel.length) throw new Error(`themeFilesUpsert: ${fel.map((e) => `${e.filename}: ${e.message}`).join('; ')}`);
  const efter = await lasFiler(k, temaId, filer.map((f) => f.filename));
  for (const f of filer) {
    const ok = f.filename.endsWith('.json') ? JSON.stringify(lasJson(efter[f.filename] ?? '{}')) === JSON.stringify(lasJson(f.value)) : efter[f.filename] === f.value;
    if (!ok) throw new Error(`${f.filename} lästes tillbaka med annat innehåll.`);
  }
}

async function stegTema(k, { skarpt }) {
  const tema = await huvudtema(k);
  console.log(`Tema: "${tema.name}" (publicerat)`);
  const namn = ['sections/image-banner.liquid', 'sections/rich-text.liquid', 'templates/index.json',
    'snippets/ms-loop.liquid', 'snippets/ms-loop-text.liquid', 'snippets/ms-loop-hero.liquid',
    'sections/ms-loop-band.liquid', 'sections/ms-loop-grid.liquid', 'assets/ms-loopar.css', 'assets/ms-loopar.js'];
  const fore = await lasFiler(k, tema.id, namn);
  const nya = {
    'snippets/ms-loop.liquid': readFileSync(join(TEMA, 'ms-loop.liquid'), 'utf8').replace('{{{ kallor }}}', byggKallor(FILER())),
    'snippets/ms-loop-text.liquid': byggTexter(SPRAK()),
    'snippets/ms-loop-hero.liquid': readFileSync(join(TEMA, 'ms-loop-hero.liquid'), 'utf8'),
    'sections/ms-loop-band.liquid': readFileSync(join(TEMA, 'ms-loop-band.liquid'), 'utf8'),
    'sections/ms-loop-grid.liquid': readFileSync(join(TEMA, 'ms-loop-grid.liquid'), 'utf8'),
    'assets/ms-loopar.css': readFileSync(join(TEMA, 'ms-loopar.css'), 'utf8'),
    'assets/ms-loopar.js': readFileSync(join(TEMA, 'ms-loopar.js'), 'utf8'),
    'sections/image-banner.liquid': patchaBanner(fore['sections/image-banner.liquid']),
    'sections/rich-text.liquid': patchaRichText(fore['sections/rich-text.liquid']),
  };
  const index = lasJson(fore['templates/index.json']);
  const nyIndex = patchaIndex(index);
  nya['templates/index.json'] = nyIndex === index ? fore['templates/index.json'] : JSON.stringify(nyIndex, null, 2) + '\n';
  // Ordningen spelar roll: snippets, sektioner och assets först, mallen sist (annars pekar
  // startsidan en stund på sektioner som inte finns).
  const ordning = namn.filter((n) => !['templates/index.json'].includes(n)).concat(['templates/index.json']);
  const skriv = ordning.filter((n) => nya[n] !== fore[n]).map((n) => ({ filename: n, value: nya[n] }));
  for (const n of ordning) console.log(`  ${n}: ${nya[n] === fore[n] ? 'står redan rätt' : fore[n] == null ? 'saknas, skapas' : 'ändras'}`);
  if (!skriv.length) return;
  if (!skarpt) { console.log('  torrt: inget skrivet (--skarpt skriver).'); return; }
  for (const n of ['sections/image-banner.liquid', 'sections/rich-text.liquid', 'templates/index.json']) if (fore[n] != null && backupa(n, fore[n])) console.log(`  original sparat: backup/${n.replace(/\//g, '__')}`);
  const forst = skriv.filter((f) => !f.filename.startsWith('templates/') && !['sections/image-banner.liquid', 'sections/rich-text.liquid'].includes(f.filename));
  const sen = skriv.filter((f) => !forst.includes(f));
  if (forst.length) await skrivTemafiler(k, tema.id, forst);
  if (sen.length) await skrivTemafiler(k, tema.id, sen);
  console.log(`  ✓ ${skriv.length} filer skrivna och lästa tillbaka`);
}

async function stegRubrik(k, { skarpt }) {
  const tema = await huvudtema(k);
  const nr = tema.id.split('/').pop();
  const id = `gid://shopify/OnlineStoreThemeJsonTemplate/index?theme_id=${nr}`;
  const r = await k.graphql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key value digest } } }`, { id });
  const post = r.translatableResource.translatableContent.find((c) => /^section\.index\.json\.berattelse\.h\.heading:/.test(c.key));
  if (!post) throw new Error('berättelsens rubrik finns inte bland temats översättningsbara texter.');
  if (!post.value.includes('<em>')) throw new Error(`den svenska rubriken saknar <em> (${post.value}) — kör --steg tema --skarpt först.`);
  for (const lok of Object.keys(ACCENT).filter((l) => l !== 'sv')) {
    const t = await k.graphql(`query($id: ID!, $l: String!) { translatableResource(resourceId: $id) { translations(locale: $l) { key value outdated } } }`, { id, l: lok });
    const nu = t.translatableResource.translations.find((x) => x.key === post.key);
    if (!nu) { console.log(`  ${lok}: ingen översättning finns — hoppar`); continue; }
    const ny = accentRubrik(nu.value, lok);
    if (ny === nu.value && !nu.outdated) { console.log(`  ${lok}: står redan rätt`); continue; }
    console.log(`  ${lok}: "${nu.value}" → "${ny}"${nu.outdated ? ' (var markerad inaktuell)' : ''}`);
    if (!skarpt) continue;
    if (backupa(`rubrik-${lok}.txt`, nu.value)) console.log(`    original sparat: backup/rubrik-${lok}.txt`);
    let svar;
    for (let f = 0; f < 3; f += 1) {
      try {
        svar = await k.graphql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { message } } }`,
          { id, t: [{ locale: lok, key: post.key, value: ny, translatableContentDigest: post.digest }] });
        break;
      } catch (e) { if (f === 2) throw e; await new Promise((res) => setTimeout(res, 3000)); }
    }
    if (svar.translationsRegister?.userErrors?.length) throw new Error(`${lok}: ${svar.translationsRegister.userErrors[0].message}`);
    const las = await k.graphql(`query($id: ID!, $l: String!) { translatableResource(resourceId: $id) { translations(locale: $l) { key value outdated } } }`, { id, l: lok });
    const efter = las.translatableResource.translations.find((x) => x.key === post.key);
    if (efter?.value !== ny || efter.outdated) throw new Error(`${lok}: rubriken lästes tillbaka som "${efter?.value}"${efter?.outdated ? ' (inaktuell)' : ''}`);
    console.log('    ✓ registrerad och tillbakaläst');
  }
}

async function stegProdukt(k, { skarpt }) {
  const sprak = SPRAK(); const filer = FILER();
  const p = await k.graphql(`{ productByHandle(handle: "${PRODUKT_HANDLE}") { id descriptionHtml seo { description } } }`);
  const prod = p.productByHandle;
  console.log(`Produkten ${PRODUKT_HANDLE}: SEO-beskrivning ${prod.seo?.description ? 'satt' : 'TOM (Shopify tar den ur beskrivningens text)'}`);
  const nySv = byggBeskrivning(prod.descriptionHtml, 'sv', filer);
  console.log(`  sv: ${nySv === prod.descriptionHtml ? 'står redan rätt' : `ändras (${prod.descriptionHtml.length} → ${nySv.length} tecken)`}`);
  const lokaler = Object.keys(sprak).filter((l) => l !== 'sv');
  const nuTr = {};
  for (const lok of lokaler) {
    const r = await k.graphql(`query($id: ID!, $l: String!) { translatableResource(resourceId: $id) { translations(locale: $l) { key value outdated } } }`, { id: prod.id, l: lok });
    nuTr[lok] = r.translatableResource.translations.find((x) => x.key === 'body_html');
    if (!nuTr[lok]) throw new Error(`${lok}: produkten saknar översatt beskrivning.`);
    const ny = byggBeskrivning(nuTr[lok].value, lok, filer); // kastar om strukturen inte stämmer — före första skrivningen
    console.log(`  ${lok}: ${ny === nuTr[lok].value ? 'står redan rätt' : `ändras (${nuTr[lok].value.length} → ${ny.length} tecken)`}`);
  }
  if (!skarpt) { console.log('  torrt: alla 14 språk går att bygga, inget skrivet (--skarpt skriver).'); return; }
  if (backupa('produkt-sv.html', prod.descriptionHtml)) console.log('  original sparat: backup/produkt-sv.html');
  for (const lok of lokaler) backupa(`produkt-${lok}.html`, nuTr[lok].value);
  if (nySv !== prod.descriptionHtml) {
    await k.graphql(`mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { userErrors { message } } }`, { p: { id: prod.id, descriptionHtml: nySv } });
  }
  const las = await k.graphql(`query($id: ID!) { product(id: $id) { descriptionHtml } translatableResource(resourceId: $id) { translatableContent { key digest } } }`, { id: prod.id });
  const tillbaka = las.product.descriptionHtml;
  const svFel = beskrivningsfel(tillbaka, filer);
  if (svFel.length) throw new Error(`sv lästes tillbaka med: ${svFel.join(', ')}.`);
  console.log(`  ✓ sv skriven och tillbakaläst: ${BESKRIVNINGENS_LOOPAR.join(' + ')}, inget band, ingen ezgif${tillbaka === nySv ? '' : ' (Shopify har normaliserat HTML:en)'}`);
  const digest = las.translatableResource.translatableContent.find((c) => c.key === 'body_html').digest;
  for (const lok of lokaler) {
    const ny = byggBeskrivning(nuTr[lok].value, lok, filer);
    let svar;
    for (let f = 0; f < 3; f += 1) {
      try {
        svar = await k.graphql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { message } } }`,
          { id: prod.id, t: [{ locale: lok, key: 'body_html', value: ny, translatableContentDigest: digest }] });
        break;
      } catch (e) { if (f === 2) throw e; await new Promise((res) => setTimeout(res, 3000)); }
    }
    if (svar.translationsRegister?.userErrors?.length) throw new Error(`${lok}: ${svar.translationsRegister.userErrors[0].message}`);
    const r = await k.graphql(`query($id: ID!, $l: String!) { translatableResource(resourceId: $id) { translations(locale: $l) { key value outdated } } }`, { id: prod.id, l: lok });
    const b = r.translatableResource.translations.find((x) => x.key === 'body_html');
    const fel = beskrivningsfel(b.value, filer);
    if (b.outdated) fel.push('inaktuell');
    if (fel.length) throw new Error(`${lok}: lästes tillbaka med: ${fel.join(', ')}.`);
    console.log(`  ✓ ${lok} registrerad och tillbakaläst`);
  }
}

async function stegAterstall(k, { skarpt }) {
  if (!existsSync(BACKUP)) throw new Error('ingen backup/ finns.');
  console.log('Återställning ur backup/ — inte byggd för att köras i onödan. Filerna:');
  const fil = (n) => join(BACKUP, n);
  const tema = await huvudtema(k);
  const temafiler = ['sections/image-banner.liquid', 'sections/rich-text.liquid', 'templates/index.json'].filter((n) => existsSync(fil(n.replace(/\//g, '__'))));
  for (const n of temafiler) console.log(`  tema: ${n}`);
  if (existsSync(fil('produkt-sv.html'))) console.log('  produkten: sv + översättningar');
  if (!skarpt) { console.log('  torrt: inget skrivet.'); return; }
  if (temafiler.length) await skrivTemafiler(k, tema.id, temafiler.map((n) => ({ filename: n, value: readFileSync(fil(n.replace(/\//g, '__')), 'utf8') })));
  if (existsSync(fil('produkt-sv.html'))) {
    const p = await k.graphql(`{ productByHandle(handle: "${PRODUKT_HANDLE}") { id } }`);
    const id = p.productByHandle.id;
    await k.graphql(`mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { userErrors { message } } }`, { p: { id, descriptionHtml: readFileSync(fil('produkt-sv.html'), 'utf8') } });
    const tc = await k.graphql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } } }`, { id });
    const digest = tc.translatableResource.translatableContent.find((c) => c.key === 'body_html').digest;
    for (const lok of Object.keys(SPRAK()).filter((l) => l !== 'sv')) {
      if (!existsSync(fil(`produkt-${lok}.html`))) continue;
      await k.graphql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { message } } }`,
        { id, t: [{ locale: lok, key: 'body_html', value: readFileSync(fil(`produkt-${lok}.html`), 'utf8'), translatableContentDigest: digest }] });
    }
  }
  console.log('  ✓ återställt (rubrikernas <em> ligger kvar i översättningarna: rör inget utan loopen)');
}

async function main() {
  const argv = process.argv.slice(2);
  const skarpt = argv.includes('--skarpt');
  const steg = argv[argv.indexOf('--steg') + 1];
  const k = await klientFor();
  if (argv.includes('--aterstall')) return stegAterstall(k, { skarpt });
  if (steg === 'tema') return stegTema(k, { skarpt });
  if (steg === 'rubrik') return stegRubrik(k, { skarpt });
  if (steg === 'produkt') return stegProdukt(k, { skarpt });
  console.error('Ange --steg tema|rubrik|produkt eller --aterstall.');
  process.exit(2);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.error('FEL:', e.message); process.exit(1); });
