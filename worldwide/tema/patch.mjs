// patch.mjs — Bäverbutikens tema får ett VÄRLDSLÄGE: Beaver Store för engelska besökare.
//
//   node worldwide/tema/patch.mjs --lage                       # vilka filer som är patchade i MAIN
//   node worldwide/tema/patch.mjs --prov                       # kopia av MAIN + provmallar (torrt: säger bara vad)
//   node worldwide/tema/patch.mjs --prov --skarpt              # skriv kopian "WORLDWIDE PROV <datum>"
//   node worldwide/tema/patch.mjs --tema <gid> --skarpt        # patcha ett givet tema (MAIN = det publicerade)
//
// Världsläget (snippets/bw-lage.liquid) är på när sidan visas på engelska eller på
// beaverstoreco.com. Då byts loggan mot "BEAVER STORE" (samma bäver och svenska flagga),
// annonsraden blir "🇺🇸 Free shipping to the United States" + "🇸🇪 A Swedish brand",
// produktsidans lastbilsrad blir fri frakt till kundens land, förtroenderaden och
// recensionsbandet får engelska, och butiksnamnet i titel/og/sidfot blir "Beaver Store".
// Fri frakt-raden visas bara när kundens land ligger i marknaden "worldwide" — där är
// frakten fri (worldwide/bygg.mjs --steg frakt). Utan den marknaden syns aldrig raden.
//
// ⛔ Den svenska sidan ritas exakt som förut: varje patch ligger i en gren som bara tar när
// bw-lage säger "ww", och Sverige på baverbutiken.se har svenska. Testet
// worldwide/test/worldwide.test.mjs bevisar att svenska grenen är ordagrant originalet.
// Varje patch bär markören `bw-worldwide` och görs bara en gång (idempotent).
// themeFilesUpsert är INTE atomär (Matstrumpor 2026-09-27) — originalen sparas i
// worldwide/tema/original/<tema-id>/ innan något skrivs.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = dirname(fileURLToPath(import.meta.url));
export const MARKOR = 'bw-worldwide';
const CAP = `{%- capture bw -%}{%- render 'bw-lage' -%}{%- endcapture -%}{%- comment -%}${MARKOR}{%- endcomment -%}`;

function byt(innehall, fran, till, fil) {
  const n = innehall.split(fran).length - 1;
  if (n !== 1) throw new Error(`${fil}: väntade EN träff på ${JSON.stringify(fran.slice(0, 70))}, fick ${n}`);
  return innehall.replace(fran, till);
}

/** En patch per fil: ren funktion originaltext → ny text. Kastar om temat inte ser ut som väntat. */
export const PATCHAR = {
  'snippets/header-logo-block.liquid': (t, f) => byt(t,
    `    {%- if block.settings.logo -%}\n      {% comment %}`,
    `    ${CAP}\n    {%- if bw contains 'ww' -%}\n      <a href="{{ routes.root_url }}" itemprop="url" class="site-header__logo-link">\n        <img src="{{ 'beaver-store-logga.png' | asset_url }}" alt="Beaver Store" itemprop="logo" width="1920" height="1080" style="height:auto">\n      </a>\n    {%- elsif block.settings.logo -%}\n      {% comment %}`, f),

  'snippets/footer-logo.liquid': (t, f) => byt(t,
    `      <img src="{{ block.settings.logo | img_url: footer_logo_size, scale: 2 }}" alt="{{ block.settings.logo.alt | default: shop.name }}">`,
    `      ${CAP}\n      {%- if bw contains 'ww' -%}\n      <img src="{{ 'beaver-store-logga.png' | asset_url }}" alt="Beaver Store">\n      {%- else -%}\n      <img src="{{ block.settings.logo | img_url: footer_logo_size, scale: 2 }}" alt="{{ block.settings.logo.alt | default: shop.name }}">\n      {%- endif -%}`, f),

  'snippets/announcement-bar.liquid': (t, f) => {
    t = byt(t, `{% if show_announcement %}`,
      `${CAP}\n{%- if bw contains 'ww' -%}\n  {%- assign show_announcement = true -%}\n  {%- if bw contains 'frakt' -%}{%- assign announcement_block_count = 2 -%}{%- else -%}{%- assign announcement_block_count = 1 -%}{%- endif -%}\n{%- endif -%}\n\n{% if show_announcement %}`, f);
    t = byt(t, `          {%- assign slide_index = 0 -%}\n`,
      `          {%- if bw contains 'ww' -%}\n            {%- if bw contains 'frakt' -%}\n              <div id="AnnouncementSlide-bw-frakt" class="announcement-slider__slide" data-index="0">\n                <span class="announcement-text">{%- render 'bw-land', text: '[[flagga]] Free shipping to [[land]]' -%}</span>\n                <span class="announcement-link-text">Tracked all the way</span>\n              </div>\n            {%- endif -%}\n            <div id="AnnouncementSlide-bw-svenskt" class="announcement-slider__slide" data-index="{% if bw contains 'frakt' %}1{% else %}0{% endif %}">\n              <span class="announcement-text">🇸🇪 A Swedish brand</span>\n              <span class="announcement-link-text">From Gothenburg, Sweden</span>\n            </div>\n          {%- else -%}\n          {%- assign slide_index = 0 -%}\n`, f);
    return byt(t, `          {%- endfor -%}\n        </div>`, `          {%- endfor -%}\n          {%- endif -%}\n        </div>`, f);
  },

  'snippets/product-template.liquid': (t, f) => byt(t,
    `                            <span>{{ block.settings.text }}</span>\n                          </span>\n                        </li>`,
    `                            ${CAP}\n                            {%- if bw contains 'ww' and block.settings.icon == 'truck' -%}\n                            <span>{%- if bw contains 'frakt' -%}{%- render 'bw-land', text: 'Free shipping to [[flagga]] [[land]] · 5–10 business days' -%}{%- else -%}Tracked delivery · 5–10 business days{%- endif -%}</span>\n                            {%- else -%}\n                            <span>{{ block.settings.text }}</span>\n                            {%- endif -%}\n                          </span>\n                        </li>\n                        {%- if bw contains 'ww' and block.settings.icon == 'truck' -%}\n                        <li class="sales-point"><span class="icon-and-text"><span aria-hidden="true" style="font-size:18px;line-height:1">🇸🇪</span> <span>A Swedish brand from Gothenburg</span></span></li>\n                        {%- endif -%}`, f),

  'sections/bb-fortroende.liquid': (t, f) => {
    t = byt(t, `<div class="bb-fortroende" data-section-id`, `${CAP}\n<div class="bb-fortroende" data-section-id`, f);
    t = byt(t, `      {%- for block in section.blocks -%}\n        <li class="bb-fortroende__punkt"`,
      `      {%- for block in section.blocks -%}\n        {%- assign bw_titel = '' -%}{%- assign bw_rad = '' -%}{%- assign bw_dold = false -%}\n        {%- if bw contains 'ww' -%}\n          {%- case block.settings.ikon -%}\n            {%- when 'paket' -%}\n              {%- if bw contains 'frakt' -%}{%- assign bw_titel = 'Free shipping' -%}{%- capture bw_rad -%}{%- render 'bw-land', text: 'to [[flagga]] [[land]]' -%}{%- endcapture -%}{%- else -%}{%- assign bw_dold = true -%}{%- endif -%}\n            {%- when 'kort' -%}{%- assign bw_titel = 'Tracked delivery' -%}{%- assign bw_rad = 'Follow your parcel all the way' -%}\n            {%- when 'flagga' -%}{%- assign bw_titel = 'Swedish brand' -%}{%- assign bw_rad = 'Gothenburg · 14 days to change your mind' -%}\n          {%- endcase -%}\n        {%- endif -%}\n        {%- if bw_dold -%}{%- continue -%}{%- endif -%}\n        <li class="bb-fortroende__punkt"`, f);
    t = byt(t, `{{ betyg_text }} av 5 <span`, `{%- if bw contains 'ww' -%}{{ betyg_text | replace: ',', '.' }} out of 5{%- else -%}{{ betyg_text }} av 5{%- endif -%} <span`, f);
    t = byt(t, `{{ antal }} {{ block.settings.rad | default: 'recensioner från kunder' }}`, `{{ antal }} {% if bw contains 'ww' %}customer reviews{% else %}{{ block.settings.rad | default: 'recensioner från kunder' }}{% endif %}`, f);
    t = byt(t, `{{ block.settings.titel_reserv | default: 'Recensioner' }}`, `{% if bw contains 'ww' %}Reviews{% else %}{{ block.settings.titel_reserv | default: 'Recensioner' }}{% endif %}`, f);
    t = byt(t, `{{ block.settings.rad_reserv | default: 'från riktiga kunder' }}`, `{% if bw contains 'ww' %}from real customers{% else %}{{ block.settings.rad_reserv | default: 'från riktiga kunder' }}{% endif %}`, f);
    t = byt(t, `<span class="bb-fortroende__titel">{{ block.settings.titel }}</span>`, `<span class="bb-fortroende__titel">{% if bw_titel != '' %}{{ bw_titel }}{% else %}{{ block.settings.titel }}{% endif %}</span>`, f);
    return byt(t, `{%- if block.settings.rad != blank -%}<span class="bb-fortroende__rad">{{ block.settings.rad }}</span>{%- endif -%}`,
      `{%- if bw_rad != '' -%}<span class="bb-fortroende__rad">{{ bw_rad }}</span>{%- elsif block.settings.rad != blank -%}<span class="bb-fortroende__rad">{{ block.settings.rad }}</span>{%- endif -%}`, f);
  },

  'sections/bb-recensioner.liquid': (t, f) => {
    t = byt(t, `<div class="bb-rec" id="kunderna-sager"`, `${CAP}\n<div class="bb-rec" id="kunderna-sager"`, f);
    t = byt(t, `{{ betyg_text }} av 5 i snitt, baserat på {{ antal }} recensioner.</p>`,
      `{%- if bw contains 'ww' -%}{{ betyg_text | replace: ',', '.' }} out of 5 on average, based on {{ antal }} reviews.{%- else -%}{{ betyg_text }} av 5 i snitt, baserat på {{ antal }} recensioner.{%- endif -%}</p>\n      {%- endif -%}\n      {%- if bw contains 'ww' -%}\n        <p class="bb-rec__ingress" style="opacity:.75;font-size:14px">🇸🇪 Reviews from our customers in Sweden, translated from Swedish.</p>`, f);
    t = byt(t, `aria-label="Recensioner från kunder"`, `aria-label="{% if bw contains 'ww' %}Customer reviews{% else %}Recensioner från kunder{% endif %}"`, f);
    t = byt(t, `aria-label="{{ block.settings.betyg }} av 5 stjärnor"`, `aria-label="{{ block.settings.betyg }} {% if bw contains 'ww' %}out of 5 stars{% else %}av 5 stjärnor{% endif %}"`, f);
    t = byt(t, `</svg>Verifierat köp</span>`, `</svg>{% if bw contains 'ww' %}Verified purchase{% else %}Verifierat köp{% endif %}</span>`, f);
    t = byt(t, `aria-label="Föregående recensioner"`, `aria-label="{% if bw contains 'ww' %}Previous reviews{% else %}Föregående recensioner{% endif %}"`, f);
    return byt(t, `aria-label="Fler recensioner"`, `aria-label="{% if bw contains 'ww' %}More reviews{% else %}Fler recensioner{% endif %}"`, f);
  },

  'sections/footer.liquid': (t, f) => byt(t,
    `    <p class="footer__small-text">&copy; {{ 'now' | date: '%Y' }} Bäverbutiken. Alla rättigheter förbehållna.</p>`,
    `    ${CAP}\n    {%- if bw contains 'ww' -%}\n    <p class="footer__small-text">&copy; {{ 'now' | date: '%Y' }} Beaver Store · STONEBITE ECOM AB, Gothenburg, Sweden. All rights reserved.</p>\n    {%- else -%}\n    <p class="footer__small-text">&copy; {{ 'now' | date: '%Y' }} Bäverbutiken. Alla rättigheter förbehållna.</p>\n    {%- endif -%}`, f),

  'snippets/seo-title.liquid': (t, f) => {
    t = `${CAP}\n{%- assign bw_namn = shop.name -%}{%- if bw contains 'ww' -%}{%- assign bw_namn = 'Beaver Store' -%}{%- endif -%}\n` + t;
    t = byt(t, `    {{ shop.name }}\n  {%- else -%}`, `    {{ bw_namn }}\n  {%- else -%}`, f);
    t = byt(t, `{%- unless page_title contains shop.name -%}\n      &ndash; {{ shop.name }}`, `{%- unless page_title contains bw_namn -%}\n      &ndash; {{ bw_namn }}`, f);
    return t;
  },

  'snippets/social-meta-tags.liquid': (t, f) => {
    t = `${CAP}\n{%- assign bw_namn = shop.name -%}{%- if bw contains 'ww' -%}{%- assign bw_namn = 'Beaver Store' -%}{%- endif -%}\n` + t;
    return byt(t, `<meta property="og:site_name" content="{{ shop.name }}">`, `<meta property="og:site_name" content="{{ bw_namn }}">`, f);
  },
};

/** Nya filer (skrivs rakt av, ägs av worldwide/tema). */
export function nyaFiler() {
  return {
    'snippets/bw-lage.liquid': { text: readFileSync(join(ROT, 'snippets', 'bw-lage.liquid'), 'utf8') },
    'snippets/bw-land.liquid': { text: readFileSync(join(ROT, 'snippets', 'bw-land.liquid'), 'utf8') },
    'assets/beaver-store-logga.png': { base64: readFileSync(join(ROT, 'logga', 'beaver-store-logga-q.png')).toString('base64') },
  };
}

/** Patcha en fil om den inte redan bär markören. */
export function patchaFil(fil, innehall) {
  if (innehall.includes(MARKOR)) return { fil, lage: 'redan', text: innehall };
  const p = PATCHAR[fil];
  if (!p) throw new Error(`Ingen patch för ${fil}`);
  return { fil, lage: 'patchad', text: p(innehall, fil) };
}

// ---------------------------------------------------------------- Shopify

async function klient() {
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  // Bäverbutikens app "Bäver uppladdare" (write_themes) — nycklarna heter _SE.
  const butik = { ...lasButik('baverbutiken'), env_suffix: 'SE' };
  return skapaKlient(butik);
}

const FILFRAGA = `query($t:ID!,$f:[String!]){ theme(id:$t){ id name role files(filenames:$f, first:50){ nodes{ filename body{ ... on OnlineStoreThemeFileBodyText { content } } } } } }`;

export async function lasFiler(k, tema, filer) {
  const d = await k.graphql(FILFRAGA, { t: tema, f: filer });
  const ut = {};
  for (const n of d.theme.files.nodes) ut[n.filename] = n.body?.content ?? null;
  return { tema: d.theme, filer: ut };
}

export async function skrivFiler(k, tema, filer) {
  const files = Object.entries(filer).map(([filename, v]) => ({
    filename,
    body: v.base64 != null ? { type: 'BASE64', value: v.base64 } : { type: 'TEXT', value: v.text },
  }));
  for (let i = 0; i < files.length; i += 10) {
    const d = await k.graphql(`mutation($t:ID!,$f:[OnlineStoreThemeFilesUpsertFileInput!]!){ themeFilesUpsert(themeId:$t, files:$f){ upsertedThemeFiles{ filename } userErrors{ field message } } }`, { t: tema, f: files.slice(i, i + 10) });
    const fel = d.themeFilesUpsert.userErrors;
    if (fel?.length) throw new Error(`themeFilesUpsert: ${JSON.stringify(fel)}`);
  }
}

async function mainTema(k) {
  const d = await k.graphql(`{ themes(first:30){ nodes{ id name role } } }`);
  return d.themes.nodes.find((t) => t.role === 'MAIN');
}

async function huvud() {
  const a = process.argv.slice(2);
  const skarpt = a.includes('--skarpt');
  const k = await klient();
  const main = await mainTema(k);
  const filer = Object.keys(PATCHAR);

  if (a.includes('--lage')) {
    const { filer: inne } = await lasFiler(k, main.id, [...filer, ...Object.keys(nyaFiler())]);
    console.log(`MAIN: ${main.name} (${main.id})`);
    for (const f of [...filer, 'snippets/bw-lage.liquid', 'snippets/bw-land.liquid']) console.log(`  ${inne[f]?.includes(MARKOR) || (f.startsWith('snippets/bw-') && inne[f]) ? '✅' : '—'} ${f}`);
    return;
  }

  let mal = a.includes('--tema') ? a[a.indexOf('--tema') + 1] : null;
  const prov = a.includes('--prov');
  if (!mal && !prov) { console.error('Ange --prov eller --tema <gid> (MAIN: ' + main.id + ').'); process.exit(2); }

  // Källan är alltid MAIN (den publicerade svenska sidan).
  const { filer: original } = await lasFiler(k, main.id, filer);
  const plan = {};
  for (const f of filer) {
    if (original[f] == null) throw new Error(`${f} finns inte i MAIN`);
    const r = patchaFil(f, original[f]);
    plan[f] = r;
    console.log(`  ${r.lage === 'redan' ? '·' : '✎'} ${f} (${r.lage})`);
  }

  if (prov) {
    const namn = `WORLDWIDE PROV ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
    if (!skarpt) { console.log(`\nTorrt: skulle kopiera MAIN till "${namn}", patcha ${filer.length} filer, lägga ${Object.keys(nyaFiler()).length} nya filer och provmallarna product.wwtest.json + index.wwtest.json.`); return; }
    const d = await k.graphql(`mutation($id:ID!,$n:String){ themeDuplicate(id:$id, name:$n){ newTheme{ id name } userErrors{ field message } } }`, { id: main.id, n: namn });
    if (d.themeDuplicate.userErrors?.length) throw new Error(JSON.stringify(d.themeDuplicate.userErrors));
    mal = d.themeDuplicate.newTheme.id;
    console.log(`Kopia: ${namn} ${mal}`);
    // Vänta tills kopian är klar (filerna finns).
    for (let i = 0; i < 30; i++) {
      const { filer: f } = await lasFiler(k, mal, ['templates/product.claudeprodukter.json', 'templates/index.json']).catch(() => ({ filer: {} }));
      if (f['templates/product.claudeprodukter.json'] && f['templates/index.json']) {
        await skrivFiler(k, mal, { 'templates/product.wwtest.json': { text: f['templates/product.claudeprodukter.json'] }, 'templates/index.wwtest.json': { text: f['templates/index.json'] } });
        break;
      }
      await new Promise((r) => setTimeout(r, 4000));
    }
  } else if (skarpt) {
    const spar = join(ROT, 'original', mal.split('/').pop());
    mkdirSync(spar, { recursive: true });
    for (const f of filer) {
      const p = join(spar, f.replace(/\//g, '__'));
      if (!existsSync(p)) writeFileSync(p, original[f]);
    }
    console.log(`Originalen sparade i ${spar}`);
  }

  if (!skarpt) { console.log(`\nTorrt: ${Object.values(plan).filter((r) => r.lage === 'patchad').length} filer skulle patchas i ${mal}.`); return; }
  const skriv = { ...nyaFiler() };
  for (const [f, r] of Object.entries(plan)) if (r.lage === 'patchad') skriv[f] = { text: r.text };
  await skrivFiler(k, mal, skriv);
  // Tillbakaläsning
  const { filer: tillbaka } = await lasFiler(k, mal, [...filer, 'snippets/bw-lage.liquid', 'snippets/bw-land.liquid']);
  const saknas = [...filer].filter((f) => !tillbaka[f]?.includes(MARKOR));
  if (!tillbaka['snippets/bw-lage.liquid'] || !tillbaka['snippets/bw-land.liquid']) saknas.push('bw-lage/bw-land');
  if (saknas.length) { console.error(`✗ Tillbakaläsningen saknar: ${saknas.join(', ')}`); process.exit(1); }
  console.log(`✅ ${Object.keys(skriv).length} filer skrivna och tillbakalästa i ${mal}.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
