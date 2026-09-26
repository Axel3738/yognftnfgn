// Sidkollen — läser produktsidan som kunden ser den och felar när ett bevis
// mot köparens invändningar saknas (Axels fråga 2026-09-25: "hur kan vi
// garantera att vi dödar invändningarna på produktsidan och i funneln?").
// Garantin är inte copy. Den är den här kollen, varje dag i /matstrumporkungen,
// plus leveranstiden mätt om mot riktiga leveranser (leverans.mjs).
//
//   node matstrumpor/sida-koll.mjs                 live: sidan + Shopify (leveranstid, pris)
//   node matstrumpor/sida-koll.mjs --json          samma, som JSON
//   node matstrumpor/sida-koll.mjs --utan-shopify  bara sidan (leverans och pris blir "går inte att mäta")
//   node matstrumpor/sida-koll.mjs --html <fil>    offline mot en sparad sida (tester)
//
// Exit 1 = minst en röd rad. Nät nere eller Cloudflare-spärr = "går inte att
// mäta", exit 0 — en spärr är mätarens fel, inte sidans (samma regel som
// rutinvakten). Kollen ÄNDRAR aldrig något på sidan.
//
// Vad som mäts, och varför (invändningarna ur Axels strategidokument, sidan 7):
//   recensioner   socialt bevis: antalet Judge.me-recensioner som sidan visar
//   ai_bild       "ser sämre ut än i annonsen": ordet AI-genererad på sidan
//   material      "tunna, fula strumpor": materialsammansättningen står på sidan
//   leveranslofte "kommer sent": sidans löfte mot mätt p90 i arbetsdagar
//   sista_dag     "kommer sent": ett datum i säsong ("Beställ senast …")
//   prisformat    "ser utländskt ut": engelsk tusentalsavgränsare ("1,796 kr")
//   pris          sidans pris = Shopifys pris
//   erbjudande    Köp 1 – Få 1 syns (det annonserna lovar)
//   oppet_kop     30 dagars öppet köp syns
//   tull          sidan nämner tull/moms på ett sätt som kan säga emot "Skatter ingår"
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..');
const UTMAPP = join(HAR, 'output');

export const SIDA = 'https://matstrumpor.se/products/sushi-strumpor';
/** Under så här många recensioner är sidan en regression mot läget 2026-09-25 (8 st). */
export const GOLV_RECENSIONER = 8;
/** Arbetsmål tills Axel satt ett annat: under det här är raden gul, inte röd. */
export const MAL_RECENSIONER = 30;
export const MATERIALORD = /\b(bomull|polyester|polyamid|elastan|akryl|ull|bambu|viskos|nylon|spandex)\b/i;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

/** Sidans synliga text: skript, stilar och taggar bort, radbrutet. */
export function synligText(html) {
  return String(html ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

export function arCloudflareSparr(html) {
  return /Verifying your connection|cf_chl_opt|Enable JavaScript and cookies to continue/.test(String(html ?? ''));
}

/** Sidans leveranslöfte "5–10 arbetsdagar" → { min, max } eller null. */
export function leveransLofte(text) {
  const m = /(\d+)\s*[–-]\s*(\d+)\s*arbetsdagar/i.exec(text);
  return m ? { min: Number(m[1]), max: Number(m[2]) } : null;
}

/** Antalet recensioner sidan visar ("8 recensioner"), eller null. */
export function antalRecensioner(text) {
  const m = /(\d+)\s+recensioner\b/i.exec(text);
  return m ? Number(m[1]) : null;
}

const rad = (id, lage, vad, varde = null) => ({ id, lage, vad, ...(varde !== null ? { varde } : {}) });

/**
 * Domen. `html` = produktsidan, `idag` = 'ÅÅÅÅ-MM-DD' svensk tid,
 * `leverans` = leveransStatistik() eller null, `kalender` = brandfilens kalender,
 * `priser` = Shopifys variantpriser i kronor (heltal) eller null.
 */
export function bedomSida({ html, idag, leverans = null, kalender = {}, priser = null }) {
  const text = synligText(html);
  const rader = [];

  const n = antalRecensioner(text);
  if (n === null) rader.push(rad('recensioner', 'fel', 'recensionsräknaren syns inte på sidan (Judge.me-widgeten borta?)'));
  else if (n < GOLV_RECENSIONER) rader.push(rad('recensioner', 'fel', `${n} recensioner — färre än golvet ${GOLV_RECENSIONER} (läget 2026-09-25); har widgeten tappat recensioner?`, n));
  else if (n < MAL_RECENSIONER) rader.push(rad('recensioner', 'varning', `${n} recensioner — under målet ${MAL_RECENSIONER}; recensionsflödet och Judge.me-förfrågningarna ska fylla på`, n));
  else rader.push(rad('recensioner', 'ok', `${n} recensioner`, n));

  if (/AI-genererad|AI-bild|genererad illustration/i.test(text)) rader.push(rad('ai_bild', 'fel', 'sidan säger själv att en bild är AI-genererad — ta bort bilden och raden'));
  else rader.push(rad('ai_bild', 'ok', 'ingen AI-märkt bild'));

  const materialTraff = MATERIALORD.exec(text);
  if (materialTraff) rader.push(rad('material', 'ok', `materialet står på sidan (${materialTraff[1]})`));
  else rader.push(rad('material', 'fel', 'materialsammansättningen står ingenstans — kunder frågar om det i brevlådan (3 gånger på 30 dagar, W39)'));

  const lofte = leveransLofte(text);
  if (!lofte) rader.push(rad('leveranslofte', 'varning', 'inget leveranslöfte i arbetsdagar hittades på sidan'));
  else if (!leverans || !leverans.levererade) rader.push(rad('leveranslofte', 'omatbart', `löftet ${lofte.min}–${lofte.max} arbetsdagar; leveranstiden gick inte att mäta i den här körningen`));
  else if (leverans.arbetsdagar.p90 > lofte.max) rader.push(rad('leveranslofte', 'fel', `löftet ${lofte.min}–${lofte.max} arbetsdagar, men mätt p90 är ${leverans.arbetsdagar.p90} arbetsdagar (${leverans.dygn.p90} dygn) och ${leverans.over_loftet.andel} % av ${leverans.levererade} paket kom senare än löftet — sidan lovar mer än leveransen håller`, leverans.arbetsdagar.p90));
  else rader.push(rad('leveranslofte', 'ok', `löftet ${lofte.min}–${lofte.max} arbetsdagar håller: mätt p90 ${leverans.arbetsdagar.p90} arbetsdagar på ${leverans.levererade} paket`, leverans.arbetsdagar.p90));

  const jul = kalender.jul_sista_bestallning ?? null;
  if (jul && idag <= jul) {
    if (/Beställ senast/i.test(text)) rader.push(rad('sista_dag', 'ok', `${/Beställ senast[^\n]*/i.exec(text)[0].trim()}`));
    else rader.push(rad('sista_dag', 'fel', `säsong (fram till ${jul}) men ingen "Beställ senast"-rad på sidan`));
  } else rader.push(rad('sista_dag', 'ok', 'utanför säsong, ingen sista beställningsdag behövs'));

  const fulSiffra = /\b\d,\d{3}\s*kr\b/.exec(text);
  if (fulSiffra) rader.push(rad('prisformat', 'fel', `"${fulSiffra[0]}" har engelsk tusentalsavgränsare — butikens valutaformat ska vara {{amount_no_decimals_with_space_separator}} kr`));
  else rader.push(rad('prisformat', 'ok', 'inga engelska tusentalsavgränsare'));

  // Sidan visar bara den valda variantens pris (5-pack), så det är det som krävs.
  if (!priser?.length) rader.push(rad('pris', 'omatbart', 'Shopifys pris lästes inte i den här körningen'));
  else if (!new RegExp(`\\b${priser[0]}\\s*kr\\b`).test(text)) rader.push(rad('pris', 'fel', `Shopifys pris ${priser[0]} kr syns inte på sidan`));
  else rader.push(rad('pris', 'ok', `priset ${priser[0]} kr stämmer med Shopify`));

  if (/Köp 1\s*[–-]\s*Få 1/i.test(text)) rader.push(rad('erbjudande', 'ok', 'Köp 1 – Få 1 syns'));
  else rader.push(rad('erbjudande', 'varning', 'Köp 1 – Få 1 syns inte — annonserna lovar det'));

  if (/30 dagars öppet köp/i.test(text)) rader.push(rad('oppet_kop', 'ok', '30 dagars öppet köp syns'));
  else rader.push(rad('oppet_kop', 'fel', '30 dagars öppet köp syns inte'));

  if (/\btull/i.test(text)) rader.push(rad('tull', 'varning', 'sidan nämner tull — kontrollera att det inte säger emot "Skatter ingår" i kassan'));
  else rader.push(rad('tull', 'ok', 'inget om tull på sidan'));

  return rader;
}

export function sammanfatta(rader) {
  const antal = (l) => rader.filter((r) => r.lage === l).length;
  const fel = antal('fel');
  return { fel, varning: antal('varning'), ok: antal('ok'), omatbart: antal('omatbart'), lage: fel ? 'rott' : antal('varning') ? 'gult' : 'gront' };
}

const SYMBOL = { ok: '✅', varning: '🟡', fel: '❌', omatbart: '⚪' };

export function tabell(rader) {
  return ['| Kontroll | Läge | Vad |', '|---|---|---|', ...rader.map((r) => `| ${r.id} | ${SYMBOL[r.lage] ?? r.lage} ${r.lage} | ${r.vad} |`)].join('\n');
}

export function idagSE(nu = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(nu);
}

export function lasKalender() {
  try { return JSON.parse(readFileSync(join(ROT, 'klaviyo', 'brands', 'matstrumpor.json'), 'utf8')).kalender ?? {}; } catch { return {}; }
}

async function hamtaSida(url) {
  const r = await fetch(`${url}?k=${Date.now()}`, { headers: { 'User-Agent': UA, 'Accept-Language': 'sv-SE,sv;q=0.9' } });
  if (!r.ok) throw new Error(`sidan svarade ${r.status}`);
  return r.text();
}

async function shopifyDel() {
  const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
  const { matLeverans } = await import('./leverans.mjs');
  const k = await skapaKlient(lasButik('matstrumpor'));
  const d = await k.graphql('{ productByHandle(handle: "sushi-strumpor") { variants(first: 5) { nodes { price } } } }');
  const priser = (d.productByHandle?.variants?.nodes ?? []).map((v) => Math.round(Number(v.price)));
  const leverans = await matLeverans({ dagar: 45, klient: k });
  return { priser, leverans };
}

export async function kor({ arg = process.argv.slice(2), nu = new Date() } = {}) {
  const har = (f) => arg.includes(f);
  const varde = (f) => (arg.indexOf(f) >= 0 ? arg[arg.indexOf(f) + 1] : null);
  const idag = idagSE(nu);
  const kalender = lasKalender();
  const ut = { datum: idag, sida: SIDA, matt: nu.toISOString() };
  let html;
  if (varde('--html')) html = readFileSync(varde('--html'), 'utf8');
  else {
    try { html = await hamtaSida(SIDA); } catch (e) { ut.omatbart = `sidan gick inte att hämta: ${e.message}`; }
  }
  if (html && arCloudflareSparr(html)) { ut.omatbart = 'Cloudflare-spärr: sidan gick inte att läsa härifrån — mätarens fel, inte sidans'; html = null; }
  let leverans = null; let priser = null;
  if (!har('--utan-shopify')) {
    try { ({ leverans, priser } = await shopifyDel()); } catch (e) { ut.shopify_fel = e.message; }
  }
  if (html) {
    ut.rader = bedomSida({ html, idag, leverans, kalender, priser });
    ut.sammanfattning = sammanfatta(ut.rader);
  }
  if (leverans) ut.leverans = leverans;
  try { mkdirSync(UTMAPP, { recursive: true }); writeFileSync(join(UTMAPP, `sidkoll-${idag}.json`), JSON.stringify(ut, null, 2) + '\n'); } catch {}
  return ut;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const ut = await kor();
  if (process.argv.includes('--json')) console.log(JSON.stringify(ut, null, 2));
  else {
    console.log(`Sidkollen ${ut.datum} — ${ut.sida}`);
    if (ut.omatbart) console.log(`⚪ ${ut.omatbart}`);
    if (ut.shopify_fel) console.log(`⚪ Shopify: ${ut.shopify_fel}`);
    if (ut.rader) {
      console.log(tabell(ut.rader));
      const s = ut.sammanfattning;
      console.log(`\n${s.fel} röda · ${s.varning} gula · ${s.ok} gröna · ${s.omatbart} omätbara → ${s.lage.toUpperCase()}`);
    }
  }
  process.exit(ut.sammanfattning?.fel ? 1 : 0);
}
