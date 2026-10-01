// geokoll.mjs — sajten så som en kund i ett RIKTIGT land ser den. Globalpings prober
// (api.globalping.io, gratis, ingen nyckel) gör GET från datorer i landet. Containern går ut på
// nätet från USA, så ?country= och POST /localization simulerar bara landet. Shopifys egen
// geolokalisering syns bara härifrån: vart en länk UTAN ?country= tar kunden, och om .no eller .se
// skickar en besökare vidare.
//
//   node matstrumpor/marknader/geokoll.mjs <url> --land DE,AT [--limit 2] [--folj] [--bot] [--json <fil>]
//   node matstrumpor/marknader/geokoll.mjs --annonser [--bara DE,FR] [--json <fil>]
//
// Per prob skrivs status, Location, sidans språk (<html lang>), landet och valutan Shopify valde
// (Shopify.country och Shopify.currency, annars kakorna localization och cart_currency), og:price,
// certifikatet sett utifrån och svarstiden.
//
// --annonser tar varje kampanjlänk i annonser/marknader.json (utom lansering_stopp) från varje land
// i kampanjens geo och följer en omdirigering. ✅ betyder 200 utan omdirigering, sidans språk är
// kampanjens och landet Shopify valde ligger i kampanjens geo. Exit 1 om något är ❌, exit 2 om
// inget gick att mäta.
//
// ⚠️ Mätt 2026-10-01 kväll: Shopify geolokaliserar inte en förfrågan som ser ut som en bot. Med
// Globalpings egen User-Agent fick prober i DE, GB och FR landet US och USD på .com, utan
// omdirigering. Med en webbläsares UA och Accept-Language fick samma prober sitt eget land, och
// .com/de/products/sushi-strumpor gav 302 till den engelska produktsidan. Skriptet skickar därför
// alltid Facebook-appens UA (där annonsklicken öppnas), Accept-Language och Accept. --bot visar
// botens svar.
// ⚠️ 429 är Shopifys botskydd mot datacenter-IP, inte ett fel på sajten. Mät med --limit 2 och läs
// den prob som svarade. Globalping tar 250 mätningar i timmen per IP, och den kvoten delas av allt
// som körs i containern.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
const API = 'https://api.globalping.io/v1/measurements';
export const UA_FACEBOOK = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/480.0.0;FBBV/1;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/18.0;FBSS/3;FBCR/;FBID/phone;FBOP/5]';
const MAPPAR = new Set(['sv', 'nb', 'da', 'fi', 'en', 'de', 'fr', 'nl', 'es', 'it', 'pl', 'pt-pt', 'ja', 'zh-tw']);

// Sidans språk ur adressen: språkmappen först, annars domänens huvudspråk.
export function sprakFor(url) {
  const u = new URL(url);
  const mapp = u.pathname.split('/')[1]?.toLowerCase();
  if (MAPPAR.has(mapp)) return mapp.replace(/-(\w+)$/, (_, r) => `-${r.toUpperCase()}`);
  if (u.hostname.endsWith('.se')) return 'sv';
  if (u.hostname.endsWith('.no')) return 'nb';
  return 'en';
}

// Accept-Language som en webbläsare i landet skickar för sidans språk.
export function acceptLanguage(locale, land) {
  const bas = locale.includes('-') ? locale : `${locale}-${land}`;
  return `${bas},${locale.split('-')[0]};q=0.9,en;q=0.5`;
}

// Det som går att läsa ur ett Globalping-resultat. Kroppen är kapad vid 10 000 byte, men Shopify
// skriver landet, valutan och og:price i sidhuvudet, före kapningen.
export function tolka(resultat = {}) {
  const h = resultat.headers ?? {};
  const b = resultat.rawBody ?? '';
  const kakor = {};
  for (const c of [].concat(h['set-cookie'] ?? [])) {
    const [par] = String(c).split(';');
    const i = par.indexOf('=');
    if (i > 0) kakor[par.slice(0, i).trim()] = par.slice(i + 1);
  }
  const traff = (re) => b.match(re)?.[1] ?? null;
  return {
    status: resultat.statusCode ?? null,
    location: h.location ?? null,
    lang: traff(/<html[^>]*\blang="([^"]+)"/),
    land: traff(/Shopify\.country = "([A-Z]{2})"/) ?? kakor.localization ?? null,
    valuta: traff(/Shopify\.currency = \{"active":"([A-Z]{3})"/) ?? kakor.cart_currency ?? null,
    pris: traff(/og:price:amount" content="([^"]+)"/),
    tls: resultat.tls ? { ok: resultat.tls.authorized ?? null, utgar: resultat.tls.expiresAt ?? null, utfardare: resultat.tls.issuer?.O ?? resultat.tls.issuer?.CN ?? null } : null,
    ms: resultat.timings?.total ?? null,
  };
}

// pt och pt-PT är samma språk för kampanjen; zh-TW och ja måste stämma exakt när båda bär region.
export function sammaSprak(sida, kampanj) {
  const a = String(sida ?? '').toLowerCase();
  const b = String(kampanj ?? '').toLowerCase();
  if (!a || !b) return false;
  return a === b || (!b.includes('-') && a.split('-')[0] === b) || (!a.includes('-') && b.split('-')[0] === a);
}

// Domen över en kampanjlänk mätt från ett land. `forsta` är svaret på länken, `slut` svaret efter
// en följd omdirigering (eller samma som forsta).
export function dom({ forsta, slut }, kampanj) {
  if (!forsta || forsta.status == null) return { ok: null, varfor: 'proben svarade inte' };
  if (forsta.status === 429) return { ok: null, varfor: 'Shopifys botskydd (429) mot proben' };
  const fel = [];
  if (forsta.status !== 200) fel.push(`${forsta.status} → ${forsta.location ?? '?'}`);
  const s = slut ?? forsta;
  if (s.status !== 200) fel.push(`slutsidan svarar ${s.status}`);
  if (!sammaSprak(s.lang, kampanj.locale)) fel.push(`sidan är på ${s.lang ?? '?'}, annonsen på ${kampanj.locale}`);
  const info = [];
  if (s.land && !kampanj.geo.includes(s.land)) {
    // Shopify kan placera en prob i ett annat land än Globalping gör (WEDOS i Luxemburg blev CZ,
    // 2026-10-01). Då säger mätningen inget om kunden i landet, och det är inget fel på sajten.
    const prob = forsta.prob?.land;
    if (prob && s.land !== prob) info.push(`Shopify placerar proben i ${s.land}, inte i ${prob}`);
    else fel.push(`Shopify valde ${s.land}, utanför kampanjens ${kampanj.geo.join('/')}`);
  }
  if (fel.length) return { ok: false, varfor: [...fel, ...info].join('; ') };
  return info.length ? { ok: null, varfor: info.join('; ') } : { ok: true, varfor: '' };
}

const vanta = (ms) => new Promise((r) => setTimeout(r, ms));

export async function matning(url, lander, { limit = 2, bot = false, locale } = {}) {
  const u = new URL(url);
  const lok = locale ?? sprakFor(url);
  const sprak = acceptLanguage(lok, lander[0]);
  const request = { method: 'GET', path: u.pathname };
  if (u.search) request.query = u.search.slice(1);
  if (!bot) request.headers = { 'User-Agent': UA_FACEBOOK, 'Accept-Language': sprak, Accept: 'text/html,application/xhtml+xml' };
  const body = { type: 'http', target: u.hostname, locations: lander.map((country) => ({ country, limit })), measurementOptions: { protocol: 'HTTPS', request } };
  const svar = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (svar.status === 429) throw Object.assign(new Error('Globalpings kvot är slut för den här timmen (250 mätningar per IP)'), { kod: 'KVOT' });
  if (!svar.ok) throw new Error(`Globalping svarade ${svar.status}: ${(await svar.text()).slice(0, 300)}`);
  const { id } = await svar.json();
  let d;
  for (let i = 0; i < 30; i++) {
    await vanta(2000);
    d = await (await fetch(`${API}/${id}`)).json();
    if (d.status === 'finished') break;
  }
  return (d?.results ?? []).map((r) => ({ prob: { land: r.probe?.country, stad: r.probe?.city, nat: r.probe?.network }, ...tolka(r.result) }));
}

// Första proben som faktiskt svarade (inte 429 och inte tom), annars den första.
const basta = (rader) => rader.find((r) => r.status != null && r.status !== 429) ?? rader[0];

function rad(r) {
  const tls = r.tls ? ` · tls ${r.tls.ok ? 'ok' : 'FEL'}${r.tls.utgar ? ` t.o.m. ${r.tls.utgar.slice(0, 10)}` : ''}` : '';
  return `${r.prob.land} ${String(r.prob.stad ?? '').slice(0, 12).padEnd(12)} ${String(r.prob.nat ?? '').slice(0, 16).padEnd(16)} | ${r.status ?? '–'}${r.location ? ` → ${r.location}` : ''} | lang ${r.lang ?? '–'} · land ${r.land ?? '–'} · ${r.valuta ?? '–'}${r.pris ? ` ${r.pris}` : ''}${tls}${r.ms ? ` · ${r.ms} ms` : ''}`;
}

async function enUrl(url, lander, flaggor) {
  const rader = await matning(url, lander, flaggor);
  for (const r of rader) console.log(rad(r));
  const ut = [{ url, rader }];
  if (flaggor.folj) {
    for (const r of rader.filter((x) => x.location && [301, 302, 307, 308].includes(x.status))) {
      const f = await matning(r.location, [r.prob.land], { ...flaggor, limit: 2 });
      console.log(`   följd ${r.location}`);
      for (const x of f) console.log(`   ${rad(x)}`);
      ut.push({ url: r.location, rader: f });
    }
  }
  return ut;
}

async function annonserna(bara) {
  const M = JSON.parse(readFileSync(join(ROT, 'annonser/marknader.json'), 'utf8'));
  const ut = [];
  for (const [kod, k] of Object.entries(M.kampanjer)) {
    if (!k?.lank || k.lansering_stopp || (bara && !bara.includes(kod))) continue;
    for (const land of k.geo) {
      let forsta = basta(await matning(k.lank, [land], { locale: k.locale }));
      // Alla prober fick 429 (Shopifys botskydd): en gång till med fler prober.
      if (!forsta || forsta.status == null || forsta.status === 429) forsta = basta(await matning(k.lank, [land], { locale: k.locale, limit: 3 }));
      let slut = forsta;
      if (forsta?.location && [301, 302, 307, 308].includes(forsta.status)) slut = basta(await matning(forsta.location, [land], { locale: k.locale }));
      const d = dom({ forsta, slut }, k);
      const ikon = d.ok === true ? '✅' : d.ok === false ? '❌' : '⚪';
      console.log(`${ikon} ${kod.padEnd(4)} ${land} | ${forsta ? rad(forsta) : 'inget svar'}${slut !== forsta && slut ? `\n            slutsidan: ${rad(slut)}` : ''}${d.varfor ? `\n            ${d.varfor}` : ''}`);
      ut.push({ kod, land, lank: k.lank, forsta, slut, dom: d });
    }
  }
  const fel = ut.filter((x) => x.dom.ok === false).length;
  const omatt = ut.filter((x) => x.dom.ok === null).length;
  console.log(`\n${ut.length - fel - omatt} av ${ut.length} länk/land-par rätt, ${fel} fel, ${omatt} gick inte att mäta (mätt ${new Date().toISOString()}).`);
  return { ut, fel, omatt };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv.slice(2);
  const varde = (f) => { const i = arg.indexOf(f); return i >= 0 ? arg[i + 1] : undefined; };
  const jsonFil = varde('--json');
  try {
    if (arg.includes('--annonser')) {
      const { ut, fel, omatt } = await annonserna(varde('--bara')?.split(','));
      if (jsonFil) writeFileSync(jsonFil, JSON.stringify(ut, null, 1));
      process.exit(fel ? 1 : ut.length && omatt === ut.length ? 2 : 0);
    }
    const url = arg.find((a) => /^https?:\/\//.test(a));
    const lander = varde('--land')?.split(',');
    if (!url || !lander) {
      console.error('Användning: geokoll.mjs <url> --land DE,AT [--limit 2] [--folj] [--bot] [--json <fil>] | --annonser [--bara DE,FR]');
      process.exit(2);
    }
    const ut = await enUrl(url, lander, { limit: Number(varde('--limit') ?? 2), bot: arg.includes('--bot'), folj: arg.includes('--folj') });
    if (jsonFil) writeFileSync(jsonFil, JSON.stringify(ut, null, 1));
  } catch (e) {
    console.error(`⛔ ${e.message}`);
    process.exit(2);
  }
}
