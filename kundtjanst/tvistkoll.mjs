#!/usr/bin/env node
// tvistkoll.mjs — den DAGLIGA snabbkollen. Läser BARA Shopify-tvisterna och
// larmar om någon har evidence-deadline inom några dagar. Inga mejl, ingen
// modell, inga filer: en körning tar sekunder i stället för tre kvart.
//
//   node kundtjanst/tvistkoll.mjs                  alla brands, larmgräns 3 dagar
//   node kundtjanst/tvistkoll.mjs --brand baverbutiken
//   node kundtjanst/tvistkoll.mjs --dagar 5        larma tidigare
//   node kundtjanst/tvistkoll.mjs --discord        posta larmet i brandets Discord
//   node kundtjanst/tvistkoll.mjs --torr           läs och visa, posta inget
//   node kundtjanst/tvistkoll.mjs --json           maskinläsbart på stdout
//   node kundtjanst/tvistkoll.mjs --fixtur <mapp>  läs tvister ur en mapp (tester)
//
// ⚠️ Varför den finns (Axels beslut 2026-09-13): veckorapporten går måndag
// 07:00. En tvist som kommer in på tisdag med deadline på torsdag hinner gå ut
// innan nästa rapport — och en obesvarad CHARGEBACK förloras. (En obesvarad
// inquiry gör det inte: den eskalerar till chargeback. Se renderaLarm.) Den här
// kollen täpper till den luckan utan att läsa om hela brevlådan varje dag.
//
// ⚠️ LÄS-BARA mot Shopify (bara GET). Skriver ingenting i repot — den behöver
// alltså inte pusha. Enda utdata är terminalen och en Discord-post på engelska.
//
// Fönstret bakåt är brett med flit (TVISTFONSTER_DAGAR): en tvist som
// initierades för två månader sedan kan ha deadline i morgon. Ordernamnen
// hämtas en order i taget för just de tvister som brådskar — att paginera hem
// ett år av ordrar för fyra rader vore att göra en snabbkoll långsam.

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { upptackBrands, korkonfig, valjBrands, brandUrEgenfil } from './brands.mjs';
import { lasYaml } from '../factory/yaml.mjs';
import { ShopifyLasare, normaliseraTvist } from './shopify.mjs';
import { postaDiscord } from './run.mjs';

const DAG = 86_400_000;
/** Så långt bakåt tvisterna läses. Deadline, inte startdatum, avgör brådskan. */
export const TVISTFONSTER_DAGAR = 180;
/** Standardgräns: larma när evidence ska in inom så här många dagar. */
export const LARMGRANS_DAGAR = 3;

const OPPEN = ['needs_response', 'under_review'];
/**
 * De statusar som fortfarande KRÄVER bevis av oss. `under_review` betyder att
 * något redan är inskickat och att Shopify har låst svaret — den räknas som
 * öppen, men den är inte VA:ns att göra något åt.
 *
 * ⛔ Blanda aldrig ihop de två listorna igen. Larmet 2026-09-23 07:41 CEST
 * postade tre tvister till VA:n som "3 open disputes need evidence within 3
 * days — 1 already past the due date": #5122 (2 dagar över), #4446 (i dag) och
 * #4407. **Alla tre stod `under_review`**, alltså redan besvarade, och ingen av
 * dem gick ens att röra. Samtidigt är rutinens hela existensberättigande de
 * tvister som verkligen väntar på svar — och de två som gjorde det (#4914 och
 * #4845, båda chargebacks) låg utanför gränsen och nämndes inte. Ett larm som
 * ropar om det som är gjort och tiger om det som inte är, slutar läsas.
 * Samma regel står i `kundtjanst/DASHBOARD-TVISTER.md` → Kända luckor punkt 3.
 *
 * ⚠️ **Men statusen var fel signal, och det kostade 509 kr.** Rättat 2026-09-29.
 * Antagandet ovan — "`under_review` betyder att något redan är inskickat" — är
 * FALSKT. Tvist `17751572829` (order `17584203399517`, 508,99 kr, `general`)
 * stod `inquiry` / `under_review` med deadline 2026-09-26 och
 * **`evidence_sent_on: null`**: ingenting hade någonsin skickats in. Den låg
 * utanför larmet i flera dygn just för att den var `under_review`, och
 * 2026-09-29 är den `chargeback` / `needs_response` med ny deadline 2026-10-10.
 * Pengarna är tagna.
 *
 * Det som avgör om VI fortfarande äger tvisten är alltså inte statusen utan
 * **`evidence_sent_on`**: är den tom har ingen svarat, oavsett vad statusen
 * säger. Är den satt är tvisten besvarad och VA:n ska inte röra den — vilket
 * också är exakt det 2026-09-23-larmet gjorde fel. Båda lärdomarna ryms i en
 * regel, och `obesvarad()` nedan är den.
 */
const BEHOVER_SVAR = ['needs_response'];

/**
 * Väntar tvisten på VÅRT svar? Öppen status OCH inget bevis inskickat. Ren.
 *
 * `evidence_sent_on` saknas i äldre data (fältet lästes inte före 2026-09-28) —
 * då faller domen tillbaka på statusen, som förut, så ingen gammal fixtur
 * börjar larma om något som är gjort.
 */
export function obesvarad(t) {
  if (!OPPEN.includes(t?.status)) return false;
  if (t?.bevisSkickat) return false;
  if (t?.bevisSkickat === undefined) return BEHOVER_SVAR.includes(t?.status);
  return true;
}

/** Kalenderdagar kvar till deadline. Ingen deadline: null. Ren. */
export function dagarKvar(deadline, nu = new Date()) {
  if (!deadline) return null;
  const d = Date.parse(`${String(deadline).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d)) return null;
  const idag = Date.parse(`${new Date(nu).toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.round((d - idag) / DAG);
}

/**
 * Timmar kvar till deadline, räknat på den RIKTIGA tidpunkten. Ren.
 *
 * ⚠️ `dagarKvar` ovan räknar kalenderdygn och säger "1 day left" om deadline
 * är i morgon — oavsett om det är i morgon kl 01:00 eller kl 23:59. Skillnaden
 * är ett helt arbetsdygn. Mätt 2026-09-28 på #5053: deadline var
 * `2026-09-28T01:00:00+02:00`, larmet sa "1 day left" söndag 05:40, och beviset
 * gick in 07:10 på måndagen — sex timmar för sent, för att alla inblandade
 * läste datumet som "hela måndagen".
 */
export function timmarKvar(tidpunkt, nu = new Date()) {
  if (!tidpunkt) return null;
  const d = Date.parse(String(tidpunkt));
  if (Number.isNaN(d)) return null;
  return (d - new Date(nu).getTime()) / 36e5;
}

/**
 * Klockslaget i deadline, som VA:n ska läsa det — men bara när det spelar roll.
 * Är deadline midnatt lokalt finns inget att varna för; är den mitt i natten
 * eller mitt på dagen måste timmen stå i larmet. Ren.
 */
export function klockslag(tidpunkt) {
  if (!tidpunkt) return null;
  const m = String(tidpunkt).match(/T(\d{2}):(\d{2})/);
  if (!m) return null;
  return m[1] === '00' && m[2] === '00' ? null : `${m[1]}:${m[2]}`;
}

/**
 * De tvister som kräver handling nu: de som fortfarande väntar på VÅRT svar
 * (`BEHOVER_SVAR`, alltså aldrig en `under_review`), och antingen med deadline
 * inom `grans` dagar (förfallna räknas in — de är värst) eller helt utan avläst
 * deadline. En okänd deadline larmas hellre än den tigs ihjäl: repots regel är
 * att det som inte går att läsa rapporteras som okänt, aldrig som noll. Ren.
 */
export function bradskande(lista = [], { nu = new Date(), grans = LARMGRANS_DAGAR } = {}) {
  return lista
    .filter(obesvarad)
    .map((x) => ({ ...x, kvar: dagarKvar(x.evidensSenast, nu), timmar: timmarKvar(x.evidensSenastTid, nu) }))
    // En ÖPPEN CHARGEBACK larmas ALLTID, oavsett hur många dagar som är kvar.
    // Mätt 2026-09-23: #4914 (348 kr, 7 dagar kvar) var osynlig i både
    // tvistkollen och morgonlistan bakom 3-dagarsgränsen — precis den tvist
    // som kostar pengar var den enda som inte stod där. Inquiries följer
    // gränsen: de eskalerar, de förloras inte på plats.
    .filter((x) => x.kvar === null || x.kvar <= grans || arChargeback(x))
    // Chargebacks först, sedan deadline, sedan belopp. Ordningen är mätt, inte
    // en känsla: av Bäverbutikens 50 tvister 2026-09-20 var 29 av 29 avgjorda
    // INQUIRIES vunna (100 %) medan chargebacks stod på 1 vunnen av 4 — alla
    // tre förluster någonsin var chargebacks. Det är alltså chargebacken som
    // kostar pengar, och den ska stå högst i larmet även om en inquiry
    // förfaller tidigare.
    .sort((a, b) => (arChargeback(b) - arChargeback(a))
      || ((a.kvar ?? 99) - (b.kvar ?? 99))
      || (b.belopp - a.belopp));
}

/**
 * Är fönstret stängt? Deadline passerad OCH inget bevis inskickat. Ren.
 *
 * ⛔ Mätt 2026-09-30 på **#4914** (chargeback, 348 kr): deadline
 * `2026-09-30T01:00:00+02:00`, `evidence_sent_on: null`, status `under_review`.
 * Ingen skickade in något, och klockan hann före. Dagen innan hände samma sak
 * med order `17584203399517` (509 kr). Larmet hade namngett båda i förväg.
 *
 * En sådan rad är inte längre en uppgift — bevisfönstret går inte att öppna
 * igen — men den får inte tigas bort heller: den är kvittot på vad uteblivet
 * svar kostade. Därför står den under egen rubrik i larmet, aldrig i listan
 * "need evidence" bland dem som fortfarande går att vinna.
 */
export function fonstretStangt(t, nu = new Date()) {
  // ⚠️ Bara ett AVLÄST och tomt bevisfält bevisar att ingen svarade. Saknas
  // fältet helt (data äldre än 2026-09-28) vet vi inte, och då stannar raden i
  // uppgiftslistan som förut — en förfallen tvist som KAN ha bevis inne får
  // aldrig bokföras som förlorad på en gissning.
  if (t?.bevisSkickat !== null) return false;
  const h = timmarKvar(t?.evidensSenastTid, nu);
  if (h !== null) return h < 0;
  return (dagarKvar(t?.evidensSenast, nu) ?? 99) < 0;
}

/** Chargeback = pengarna är redan dragna och en förlust är slutgiltig. Ren. */
export function arChargeback(t) {
  return String(t?.typ ?? '').toLowerCase() === 'chargeback' ? 1 : 0;
}

const belopp = (x) => `${Number(x.belopp ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} ${x.valuta ?? ''}`.trim();

/**
 * "1 day left" / "due today" / "2 days OVERDUE" / "no deadline read". Ren.
 *
 * Med `timmar` (den riktiga tidpunkten) skrivs timmarna ut i stället så fort
 * det är under ett dygn kvar — "19h left" ljuger inte på samma sätt som
 * "1 day left" gör när deadline är klockan ett på natten.
 */
export function narText(kvar, timmar = null) {
  if (timmar !== null && timmar <= 24) {
    if (timmar <= 0) {
      const h = Math.floor(Math.abs(timmar));
      return h < 24 ? `${h}h OVERDUE` : `${Math.floor(h / 24)} day${Math.floor(h / 24) === 1 ? '' : 's'} OVERDUE`;
    }
    return `${Math.floor(timmar)}h left`;
  }
  if (kvar === null) return 'no deadline read';
  if (kvar < 0) return `${Math.abs(kvar)} day${Math.abs(kvar) === 1 ? '' : 's'} OVERDUE`;
  if (kvar === 0) return 'due TODAY';
  return `${kvar} day${kvar === 1 ? '' : 's'} left`;
}

/**
 * Discord-texten. Engelska — VA:n läser den (Axels order 2026-09-05).
 * Kundadresser förekommer inte här: ordernumret är nyckeln.
 */
export function renderaLarm(alla, { brand, nu = new Date(), grans = LARMGRANS_DAGAR } = {}) {
  const datum = new Date(nu).toISOString().slice(0, 10);
  // Stängda fönster lyfts ur uppgiftslistan och får egen rubrik längst ner.
  const stangda = alla.filter((x) => fonstretStangt(x, nu));
  const rader = alla.filter((x) => !fonstretStangt(x, nu));
  // Förfallen och "förfaller idag" är INTE samma sak. En tvist med deadline i
  // dag går fortfarande att vinna — kallar man den "already past the due date"
  // hoppar VA:n över den och vi förlorar pengar som var räddningsbara.
  // (Mätt 2026-09-16: #4914 förföll samma dag och räknades som passerad.)
  const forfallna = rader.filter((x) => (x.kvar ?? 99) < 0).length;
  const idag = rader.filter((x) => x.kvar === 0).length;
  const cb = rader.filter(arChargeback).length;
  // Rött bara när det faktiskt brinner: en chargeback, eller något som
  // förfaller i dag eller har passerat. En inquiry med två dagar kvar är gul.
  const rubrik = cb || forfallna || idag ? '🔴' : '🟡';
  const brast = [
    cb && `${cb} real chargeback${cb === 1 ? '' : 's'}`,
    forfallna && `${forfallna} already past the due date`,
    idag && `${idag} due today`,
  ].filter(Boolean).join(', ');
  const ut = [
    `${rubrik} **Dispute deadlines — ${brand} (${datum})**`,
    '',
    rader.length
      ? `${rader.length} open dispute${rader.length === 1 ? '' : 's'} need${rader.length === 1 ? 's' : ''} evidence — every open chargeback, and inquiries due within ${grans} day${grans === 1 ? '' : 's'}${brast ? ` — ${brast}` : ''}.`
      : 'Nothing is waiting for evidence right now — but read the closed window at the bottom.',
    '',
    // ⚠️ Texten stod tidigare som "an unanswered dispute is lost automatically".
    // Det är FALSKT för inquiries och stod i larmet 2026-09-15..20. Mätt på 50
    // tvister 2026-09-20: 29 av 29 avgjorda inquiries vunna, 0 förlorade —
    // en obesvarad inquiry ESKALERAR till chargeback (#4914, #5044, #4706 gick
    // den vägen), den förloras inte på plats. Chargebacks däremot: 3 av 4
    // förlorade. Skriv aldrig tillbaka det gamla påståendet.
    '**CHARGEBACK = the money is already taken and a loss is final. Handle these first.**',
    '**INQUIRY = the bank is only asking. Unanswered it can escalate into a chargeback — that is the real cost of ignoring it.**',
    '',
  ];
  for (const x of rader) {
    const order = x.ordernamn ? `${x.ordernamn}` : `order ${x.orderId ?? 'unknown'}`;
    const mark = arChargeback(x) ? '🔴 CHARGEBACK' : 'inquiry';
    // Klockslaget skrivs ut när deadline INTE är midnatt och det är under två
    // dygn kvar. Utan det läses "due 2026-09-28" som hela den dagen, och för
    // #5053 var den dagen slut kl 01:00 (se `timmarKvar`).
    const tid = (x.kvar ?? 99) <= 1 ? klockslag(x.evidensSenastTid) : null;
    const nar = x.evidensSenast ? `due ${x.evidensSenast}${tid ? ` at ${tid}` : ''}` : 'due date unknown';
    ut.push(`• **${order}** — ${mark}, ${String(x.orsak).replace(/_/g, ' ')} — ${belopp(x)} — ${nar} — ${narText(x.kvar, x.timmar ?? null)}`);
  }
  ut.push(
    '',
    '**What to do, for each one — the SOPs are in `kundtjanst/sop/`, start at `START-HERE.md`:**',
    '1. "Not received"? CHECK THE TRACKING FIRST. Delivered with a scan → fight. Stuck or no scan → refund, do not fight.',
    '2. Shopify admin → Settings → Payments → Disputes → open the order.',
    '3. Attach the proof: delivery scan, order confirmation, and the email thread.',
    '4. Submit the DAY BEFORE the due date — see the clock warning below. Do not wait for the weekly report.',
    '',
    // ⚠️ Klockslaget. Mätt 2026-09-28 på alla fem öppna tvister i kontot:
    // varenda `evidence_due_by` står på 01:00 lokal tid. "Due 30 Sep" betyder
    // alltså att fönstret stänger när måndagen tar slut. Den gamla raden här sa
    // "press Submit on the due date" — vilket för #5053 blev sex timmar för
    // sent. Regeln står i larmet och inte bara i SOP:en, för det är larmet VA:n
    // läser på morgonen.
    '**⏰ The due date is not a whole day. Measured: every deadline in this account falls at 01:00 in the night.**',
    '"Due 30 Sep" means the window shuts as the 29th ends. Treat the day BEFORE the due date as your last',
    'working day, and submit during that day. A row showing hours instead of days is already inside the final day.',
    '',
    // Tidsstrategin (Axels beslut 2026-09-22). Larmet är säkerhetsnätet som
    // gör väntandet ofarligt — därför står regeln här och inte bara i SOP:en.
    '**⏳ When to submit: prepare now, send on the last working day.**',
    'A parcel that has not arrived yet is not a lost case: for "not received" we submit LAST, the day before the',
    'deadline, because by then the delivery scan usually exists. Build the evidence today and press **Save**;',
    `press *Submit* the day before the due date. An inquiry on this list is ≤ ${grans} days out, so decide it now. A chargeback is`,
    'listed from the day it opens however far off its deadline is, because it is the one that loses real money —',
    'gather its proof today even when the date is weeks away. **Always email the customer the same day anyway;**',
    '**only the evidence submission waits, and a customer who gets an answer often withdraws the dispute themselves.**',
  );
  if (stangda.length) {
    ut.push(
      '',
      `⛔ **The evidence window has closed on ${stangda.length === 1 ? 'this one' : `these ${stangda.length}`} — nothing was ever submitted.**`,
      'Not a task: the window cannot be reopened. It is here so the cost is visible, and so nobody spends time on it today.',
      '',
    );
    for (const x of stangda) {
      const order = x.ordernamn ? `${x.ordernamn}` : `order ${x.orderId ?? 'unknown'}`;
      const mark = arChargeback(x) ? '🔴 CHARGEBACK' : 'inquiry';
      ut.push(`• **${order}** — ${mark}, ${String(x.orsak).replace(/_/g, ' ')} — ${belopp(x)} — window closed ${x.evidensSenast}${klockslag(x.evidensSenastTid) ? ` at ${klockslag(x.evidensSenastTid)}` : ''}`);
    }
    ut.push(
      '',
      '**Still do one thing: email the customer.** A chargeback can be withdrawn by the cardholder even after our window shuts,',
      'and an inquiry that nobody answered escalates into a chargeback — talking to the customer is the only lever left.',
    );
  }
  return ut.join('\n');
}

/** Hela kollen för ett brand. `fixtur` ersätter nätet i tester. */
export async function kollaBrand(brand, { nu = new Date(), grans = LARMGRANS_DAGAR, env = process.env, fixtur = null, logg = () => {} } = {}) {
  const konfig = korkonfig(brand, env);
  const sedan = new Date(new Date(nu).getTime() - TVISTFONSTER_DAGAR * DAG);

  if (fixtur) {
    const fil = join(fixtur, brand.id, 'tvister.json');
    if (!existsSync(fil)) return { brand: konfig, tillganglig: false, orsak: 'ingen tvister.json i fixturen', lista: [], bradskande: [] };
    const lista = JSON.parse(readFileSync(fil, 'utf8')).map((d) => normaliseraTvist(d, []));
    return { brand: konfig, tillganglig: true, orsak: null, lista, bradskande: bradskande(lista, { nu, grans }) };
  }

  if (!konfig.shopify.konfigurerad) {
    return { brand: konfig, tillganglig: false, orsak: `Shopify inte kopplat (saknar ${konfig.shopify.saknas.join(', ')})`, lista: [], bradskande: [] };
  }

  const shopify = new ShopifyLasare({ shop: konfig.shopify.shop, adminToken: konfig.shopify.adminToken, clientId: konfig.shopify.clientId, clientSecret: konfig.shopify.clientSecret, butikId: brand.id, logg });
  let svar;
  try {
    svar = await shopify.hamtaTvister(sedan, []);
  } catch (e) {
    return { brand: konfig, tillganglig: false, orsak: e.message, lista: [], bradskande: [] };
  }
  if (!svar.tillganglig) return { brand: konfig, tillganglig: false, orsak: svar.orsak, lista: [], bradskande: [] };

  // Ordernamnen bara för de rader som faktiskt ska larmas — en GET per rad.
  const rader = bradskande(svar.lista, { nu, grans });
  for (const x of rader) {
    if (x.ordernamn || !x.orderId) continue;
    try { x.ordernamn = (await shopify.hamtaOrder(x.orderId))?.namn ?? null; } catch { /* namnet är trevligt, inte nödvändigt */ }
  }
  return { brand: konfig, tillganglig: true, orsak: null, lista: svar.lista, bradskande: rader };
}

// ------------------------------------------------------------------ CLI

function flagga(args, n, standard = null) {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : standard;
}

export async function huvud(argv = process.argv.slice(2), env = process.env) {
  const finns = (n) => argv.includes(`--${n}`);
  const torr = finns('torr');
  const fixtur = flagga(argv, 'fixtur') ? resolve(flagga(argv, 'fixtur')) : null;
  const grans = Number(flagga(argv, 'dagar')) || LARMGRANS_DAGAR;
  const datumArg = flagga(argv, 'datum');
  const nu = datumArg ? new Date(`${datumArg}T12:00:00Z`) : new Date();
  const logg = finns('verbose') ? (m) => console.error(`  ${m}`) : () => {};

  let alla;
  if (fixtur) {
    const { readdirSync } = await import('node:fs');
    alla = readdirSync(fixtur, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(fixtur, d.name, 'brand.yaml')))
      .map((d) => brandUrEgenfil(lasYaml(readFileSync(join(fixtur, d.name, 'brand.yaml'), 'utf8')), d.name));
  } else {
    alla = upptackBrands();
  }
  const brands = valjBrands(alla, flagga(argv, 'brand') ?? '--alla');
  if (!brands.length) { console.error('✗ Inga brands hittade.'); process.exit(1); }

  console.error(`Tvistkoll ${new Date(nu).toISOString().slice(0, 10)} — ${brands.length} brand(s), larmgräns ${grans} dagar${torr ? ' — TORR (inget postas)' : ''}`);
  const resultat = [];
  for (const b of brands) {
    const r = await kollaBrand(b, { nu, grans, env, fixtur, logg });
    resultat.push(r);
    if (!r.tillganglig) { console.error(`  ⚠️ ${b.brand}: tvisterna okända — ${r.orsak}`); continue; }
    const oppna = r.lista.filter((x) => OPPEN.includes(x.status)).length;
    console.error(`  ${b.brand}: ${r.lista.length} tvister, ${oppna} öppna, ${r.bradskande.length} brådskande`);
    if (!r.bradskande.length || torr || !finns('discord')) continue;
    try { console.error(`  ${await postaDiscord({ brand: r.brand }, { text: renderaLarm(r.bradskande, { brand: r.brand.brand, nu, grans }), env })}`); }
    catch (e) { console.error(`  ⚠️ Discord: ${e.message}`); }
  }

  const lasta = resultat.filter((r) => r.tillganglig);
  const larm = resultat.filter((r) => r.bradskande.length);

  if (finns('json')) {
    console.log(JSON.stringify(resultat.map((r) => ({
      brand: r.brand.id, tillganglig: r.tillganglig, orsak: r.orsak,
      tvister: r.lista.length, bradskande: r.bradskande.map((x) => ({ order: x.ordernamn ?? x.orderId, typ: x.typ, orsak: x.orsak, belopp: x.belopp, valuta: x.valuta, deadline: x.evidensSenast, kvar: x.kvar })),
    })), null, 2));
  } else if (larm.length) {
    console.log('');
    for (const r of larm) console.log(renderaLarm(r.bradskande, { brand: r.brand.brand, nu, grans }) + '\n');
  } else {
    console.log(`\nInga tvister med deadline inom ${grans} dagar. ${lasta.length} brand(s) lästa.`);
  }

  // Ett brand som inte kunde läsas är inte "noll tvister" — det är okänt, och
  // en körning där INGET brand kunde läsas är inte grön.
  const okanda = resultat.filter((r) => !r.tillganglig);
  if (okanda.length) console.log(`\n⚠️ Tvisterna kunde inte läsas för: ${okanda.map((r) => `${r.brand.brand} (${r.orsak})`).join('; ')}`);
  if (!lasta.length) { console.error('\n✗ Inget brand kunde läsas — körningen är inte grön.'); process.exitCode = 1; }
  return { resultat, larm: larm.length };
}

if (process.argv[1] && process.argv[1].endsWith('tvistkoll.mjs')) {
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
    process.exit(r.status ?? 1);
  }
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
