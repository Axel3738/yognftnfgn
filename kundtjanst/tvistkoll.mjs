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

/** Kalenderdagar kvar till deadline. Ingen deadline: null. Ren. */
export function dagarKvar(deadline, nu = new Date()) {
  if (!deadline) return null;
  const d = Date.parse(`${String(deadline).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d)) return null;
  const idag = Date.parse(`${new Date(nu).toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.round((d - idag) / DAG);
}

/**
 * De tvister som kräver handling nu: öppna, och antingen med deadline inom
 * `grans` dagar (förfallna räknas in — de är värst) eller helt utan avläst
 * deadline. En okänd deadline larmas hellre än den tigs ihjäl: repots regel är
 * att det som inte går att läsa rapporteras som okänt, aldrig som noll. Ren.
 */
export function bradskande(lista = [], { nu = new Date(), grans = LARMGRANS_DAGAR } = {}) {
  return lista
    .filter((x) => OPPEN.includes(x.status))
    .map((x) => ({ ...x, kvar: dagarKvar(x.evidensSenast, nu) }))
    .filter((x) => x.kvar === null || x.kvar <= grans)
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

/** Chargeback = pengarna är redan dragna och en förlust är slutgiltig. Ren. */
export function arChargeback(t) {
  return String(t?.typ ?? '').toLowerCase() === 'chargeback' ? 1 : 0;
}

const belopp = (x) => `${Number(x.belopp ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} ${x.valuta ?? ''}`.trim();

/** "1 day left" / "due today" / "2 days OVERDUE" / "no deadline read". Ren. */
export function narText(kvar) {
  if (kvar === null) return 'no deadline read';
  if (kvar < 0) return `${Math.abs(kvar)} day${Math.abs(kvar) === 1 ? '' : 's'} OVERDUE`;
  if (kvar === 0) return 'due TODAY';
  return `${kvar} day${kvar === 1 ? '' : 's'} left`;
}

/**
 * Discord-texten. Engelska — VA:n läser den (Axels order 2026-09-05).
 * Kundadresser förekommer inte här: ordernumret är nyckeln.
 */
export function renderaLarm(rader, { brand, nu = new Date(), grans = LARMGRANS_DAGAR } = {}) {
  const datum = new Date(nu).toISOString().slice(0, 10);
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
    `${rader.length} open dispute${rader.length === 1 ? '' : 's'} need${rader.length === 1 ? 's' : ''} evidence within ${grans} day${grans === 1 ? '' : 's'}${brast ? ` — ${brast}` : ''}.`,
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
    ut.push(`• **${order}** — ${mark}, ${String(x.orsak).replace(/_/g, ' ')} — ${belopp(x)} — ${x.evidensSenast ? `due ${x.evidensSenast}` : 'due date unknown'} — ${narText(x.kvar)}`);
  }
  ut.push(
    '',
    '**What to do, for each one — the SOPs are in `kundtjanst/sop/`, start at `00-MASTER.md`:**',
    '1. "Not received"? CHECK THE TRACKING FIRST. Delivered with a scan → fight. Stuck or no scan → refund, do not fight.',
    '2. Shopify admin → Settings → Payments → Disputes → open the order.',
    '3. Attach the proof: delivery scan, order confirmation, and the email thread.',
    '4. Submit before the due date. Do not wait for the weekly report.',
  );
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
