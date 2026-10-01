// matris.mjs — alla 37 länder × alla 8 språk som kund, utan webbläsare (det Shopify ritar på servern).
//
//   node worldwide/granskning/matris.mjs [--lander US,DE] [--sprak en,de] [--sidor /,/products/x] [--ut fil.json]
//
// Per vy: status, <html lang>, Shopify.country, valutan, loggan, annonsradens fri frakt-rad och
// "A Swedish brand" på språket, priset på produktsidan i kundens valuta, svenska rader och kronor.
// Läs-bart. Landet sätts med POST /localization (kakan), språket med undermappen.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BAS, PRODUKTER, prefix, svenskRad } from './kund.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const W = JSON.parse(readFileSync(join(ROT, '..', 'konfig.json'), 'utf8'));
const SPRAKTEXT = JSON.parse(readFileSync(join(ROT, '..', 'tema', 'sprak.json'), 'utf8'));
const a = process.argv.slice(2);
const arg = (n, d = null) => (a.includes(n) ? a[a.indexOf(n) + 1] : d);

const avkoda = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'").replace(/&rsquo;/g, '’');

export async function vy(land, sprak, sokvag) {
  const r = await fetch(`${BAS}/localization`, {
    method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'user-agent': 'Mozilla/5.0' },
    body: new URLSearchParams({ form_type: 'localization', _method: 'put', utf8: '✓', country_code: land, language_code: sprak, return_to: '/' }),
  });
  const kaka = (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
  // Shopify skickar FÖRSTA sidvisningen i en ny session till landets standardspråk (mätt 2026-10-01:
  // /it/products/x → 302 /products/x en gång, sedan 200). En uppvärmning tar den omdirigeringen.
  await fetch(`${BAS}${prefix(sprak)}/`, { headers: { cookie: kaka, 'user-agent': 'Mozilla/5.0' }, redirect: 'manual' }).then((x) => x.text()).catch(() => {});
  const url = `${BAS}${prefix(sprak)}${sokvag}`;
  const s = await fetch(url, { headers: { cookie: kaka, 'user-agent': 'Mozilla/5.0', 'accept-language': sprak } });
  const h = await s.text();
  const text = avkoda(h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '\n')).split('\n').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const slides = [...h.matchAll(/id="AnnouncementSlide-bw-(frakt|svenskt)"[\s\S]*?<span class="announcement-text">([\s\S]*?)<\/span>/g)].map((m) => [m[1], avkoda(m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())]);
  const ut = {
    land, sprak, sokvag, url: s.url, status: s.status,
    lang: /<html[^>]*lang="([^"]+)"/.exec(h)?.[1] ?? null,
    shopifyLand: /Shopify\.country\s*=\s*"([^"]+)"/.exec(h)?.[1] ?? null,
    valuta: /"active":"([A-Z]{3})"/.exec(h)?.[1] ?? null,
    logga: /beaver-store-logga/.test(h) ? 'Beaver Store' : /Namnlos_design_44/.test(h) ? 'Bäverbutiken' : '?',
    frakt: Object.fromEntries(slides).frakt ?? null,
    svenskt: Object.fromEntries(slides).svenskt ?? null,
    svenska: text.map((x) => [x, svenskRad(x, sprak)]).filter(([, o]) => o).map(([x, o]) => `${x.slice(0, 120)} (${o})`).slice(0, 12),
    // "SEK kr" är ett val i valutaväljaren (räknas för sig, valutavaljare_sek).
    kronor: text.filter((x) => x !== 'SEK kr' && /(?<![\p{L}])(kr|SEK|kronor)(?![\p{L}])/u.test(x)).slice(0, 5),
    valutavaljare_sek: text.includes('SEK kr'),
    titel: avkoda(/<title>([\s\S]*?)<\/title>/.exec(h)?.[1]?.replace(/\s+/g, ' ').trim() ?? ''),
  };
  if (sokvag.startsWith('/products/')) {
    const j = await fetch(`${BAS}${prefix(sprak)}${sokvag}.js`, { headers: { cookie: kaka, 'user-agent': 'Mozilla/5.0' } }).then((x) => x.json()).catch(() => null);
    ut.pris = j ? j.price / 100 : null;
    ut.jamforpris = j?.compare_at_price ? j.compare_at_price / 100 : null;
    ut.produkttitel = j?.title ?? null;
    // Priset som texten på sidan visar (första prisraden med valutatecken).
    ut.prisrad = text.find((x) => /[$€£¥₩]|CHF|zł|Kč|Ft|lei|лв|kn|AED|HK\$|₪|RM|S\$/.test(x) && /\d/.test(x)) ?? null;
  }
  // Förväntat: fri frakt-raden och svenskt på kundens språk.
  const ft = (SPRAKTEXT.frakt_till[sprak] ?? SPRAKTEXT.frakt_till.en).split('[[land]]')[0].replace('[[flagga]]', '').trim();
  const sv = (SPRAKTEXT.svenskt[sprak] ?? SPRAKTEXT.svenskt.en).replace('🇸🇪', '').trim();
  ut.fel = [];
  if (ut.status !== 200) ut.fel.push(`status ${ut.status}`);
  if (!String(ut.lang).toLowerCase().startsWith(sprak.toLowerCase().slice(0, 2))) ut.fel.push(`lang ${ut.lang}`);
  if (ut.shopifyLand !== land) ut.fel.push(`land ${ut.shopifyLand}`);
  if (!ut.valuta || ut.valuta === 'SEK') ut.fel.push(`valuta ${ut.valuta}`);
  if (ut.logga !== 'Beaver Store') ut.fel.push(`logga ${ut.logga}`);
  if (!ut.frakt || !ut.frakt.includes(ft)) ut.fel.push(`fri frakt-rad: ${ut.frakt}`);
  if (!ut.svenskt || !ut.svenskt.includes(sv)) ut.fel.push(`svenskt-rad: ${ut.svenskt}`);
  if (ut.kronor.length) ut.fel.push(`kronor: ${ut.kronor[0]}`);
  return ut;
}

async function pool(jobb, n, f) {
  const ut = new Array(jobb.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < jobb.length) { const j = i++; try { ut[j] = await f(jobb[j]); } catch (e) { ut[j] = { ...jobb[j], fel: [`undantag: ${e.message}`] }; } } }));
  return ut;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const lander = arg('--lander') ? arg('--lander').split(',') : W.marknad.lander;
  const sprak = arg('--sprak') ? arg('--sprak').split(',') : W.marknad.locales;
  const sidor = arg('--sidor') ? arg('--sidor').split(',') : ['/', `/products/${PRODUKTER[0]}`];
  // --produkt-bara-en: produktsidorna bara på engelska (priset beror på landet, inte språket).
  const jobb = lander.flatMap((land) => sprak.flatMap((s) => sidor.filter((sv) => !(a.includes('--produkt-bara-en') && s !== 'en' && sv.startsWith('/products/'))).map((sokvag) => ({ land, sprak: s, sokvag }))));
  // Försiktigt: Shopify/Cloudflare svarar 429 och visar en utmaning för hela IP:t vid för många anrop
  // (mätt 2026-10-01: 6 parallella + två webbläsare). Standard: ett åt gången, en paus mellan vyerna.
  const paus = Number(arg('--paus', 1500));
  const res = await pool(jobb, Number(arg('--parallellt', 1)), async (j) => { const r = await vy(j.land, j.sprak, j.sokvag); await new Promise((o) => setTimeout(o, paus)); return r; });
  let fel = 0;
  for (const r of res) {
    if (r.fel?.length) fel++;
    console.log(`${r.fel?.length ? '❌' : '✅'} ${r.land} ${r.sprak.padEnd(5)} ${r.sokvag.slice(0, 30).padEnd(30)} ${r.status} ${r.lang} ${r.shopifyLand}/${r.valuta} ${r.pris != null ? `${r.pris} ${r.valuta}` : ''} · ${r.frakt ?? '—'}${r.fel?.length ? ` · FEL: ${r.fel.join('; ')}` : ''}${r.svenska?.length ? ` · svenska: ${r.svenska.slice(0, 3).join(' / ')}` : ''}`);
  }
  console.log(`\n${jobb.length} vyer · ${fel} med fel`);
  if (arg('--ut')) writeFileSync(arg('--ut'), JSON.stringify(res, null, 1));
}
