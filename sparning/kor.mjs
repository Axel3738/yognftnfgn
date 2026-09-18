// Spårningsrundan: Shopifys skickade ordrar → 17TRACK → tillbaka in i Shopify
// som fulfillment-event. Körs varje timme av rutinen (/sparning).
//
//   node sparning/kor.mjs                # skarpt
//   node sparning/kor.mjs --torr         # läs allt, skriv inget, registrera inget
//   node sparning/kor.mjs --kolla        # bara nyckel + Shopify-rättigheter
//   node sparning/kor.mjs --dagar 30     # hur långt bakåt ordrarna läses (standard 14)
//   node sparning/kor.mjs --max 500      # tak på nya registreringar per körning (standard 150)
//
// Minnet är sparning/lage.json (committas av rutinen): vilka nummer som är
// registrerade hos 17TRACK, senast skrivna status, och när paketet blev
// levererat. Utan filen registreras allt om (kostar kvot) — därför pushas
// den efter varje körning.
//
// Läs-bara mot 17TRACK utöver registreringen. Mot Shopify skrivs ENBART
// fulfillmentEventCreate — aldrig ordrar, fulfillments eller notiser i sig.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { kravProxy, graphql } from '../mejl/shopify.mjs';
import { nyckel, registrera, hamta } from './17track.mjs';
import { bolagskod, tolka, planera } from './status.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const LAGE = join(ROT, 'lage.json');
const arg = process.argv.slice(2);
const torr = arg.includes('--torr');
const kolla = arg.includes('--kolla');
const dagarIx = arg.indexOf('--dagar');
const DAGAR = dagarIx > -1 ? Number(arg[dagarIx + 1]) : 14;
// Tak på registreringar per körning: varje registrering kostar 17TRACK-kvot.
// Torrkörningen 2026-09-18 hittade 2 607 oregistrerade paket på 45 dagar mot
// 200 gratis i startkvoten — utan tak hade första körningen bränt allt på
// paket som redan är framme. Nyast först, resten tas nästa timme.
const maxIx = arg.indexOf('--max');
const MAX_REG = maxIx > -1 ? Number(arg[maxIx + 1]) : 150;
const LEVERERAD_BEHALL_DAGAR = 60;

kravProxy();

// --- 1. Förutsättningar -----------------------------------------------------
const brister = [];
if (!nyckel()) brister.push('TRACK17_API_KEY saknas i miljön (Environments på claude.ai — syns först i en ny container).');
let scopes = [];
try {
  const s = await graphql(`query { currentAppInstallation { accessScopes { handle } } }`, {});
  scopes = s.currentAppInstallation.accessScopes.map((x) => x.handle);
} catch (fel) {
  brister.push(`Shopify svarar inte: ${fel.message}`);
}
if (scopes.length && !scopes.includes('write_fulfillments')) {
  brister.push('Shopify-appen saknar rättigheten write_fulfillments (behövs för fulfillmentEventCreate). Lägg till read_fulfillments + write_fulfillments på appen i Dev Dashboard och installera om den.');
}
if (kolla || brister.length) {
  console.log(brister.length ? `❌ ${brister.join('\n❌ ')}` : `✅ Nyckel finns, Shopify-appen har write_fulfillments (${scopes.length} rättigheter).`);
  if (kolla) process.exit(brister.length ? 1 : 0);
  if (!torr) process.exit(1);
  console.log('--torr: fortsätter läsningen trots bristerna, skriver inget.');
}

// --- 2. Läget ---------------------------------------------------------------
const lage = existsSync(LAGE) ? JSON.parse(readFileSync(LAGE, 'utf8')) : { comment: 'Skrivs av sparning/kor.mjs. nummer → { bolag, kod, order, fulfillment, registrerad, status, senast, levererad }', paket: {} };
lage.paket ??= {};

// --- 3. Skickade ordrar ur Shopify ------------------------------------------
const fran = new Date(Date.now() - DAGAR * 86400 * 1000).toISOString().slice(0, 10);
const ordrar = [];
let cursor = null;
for (let sida = 0; sida < 60; sida++) {
  const d = await graphql(
    `query($q: String!, $c: String) { orders(first: 100, after: $c, query: $q, sortKey: CREATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      nodes { name cancelledAt fulfillments(first: 3) { id status trackingInfo { number company } events(first: 25) { nodes { status happenedAt } } } } } }`,
    { q: `created_at:>=${fran} fulfillment_status:shipped`, c: cursor }
  );
  ordrar.push(...d.orders.nodes);
  if (!d.orders.pageInfo.hasNextPage) break;
  cursor = d.orders.pageInfo.endCursor;
}

// Kandidater: en rad per spårningsnummer som inte är levererat.
const kandidater = [];
let redanLevererade = 0;
for (const o of ordrar) {
  if (o.cancelledAt) continue;
  for (const f of o.fulfillments ?? []) {
    if (f.status !== 'SUCCESS') continue;
    const t = f.trackingInfo?.[0];
    if (!t?.number) continue;
    const redan = f.events.nodes.map((e) => e.status);
    if (redan.includes('DELIVERED')) { redanLevererade++; continue; }
    kandidater.push({ nummer: t.number, bolag: t.company ?? '', kod: bolagskod(t.company), order: o.name, fulfillment: f.id, redan });
  }
}
console.log(`Ordrar senaste ${DAGAR} dagarna: ${ordrar.length}. Paket att följa: ${kandidater.length} (${redanLevererade} redan levererade).`);

// --- 4. Registrera nya hos 17TRACK ------------------------------------------
const oregistrerade = kandidater.filter((k) => !lage.paket[k.nummer]?.registrerad);
const nya = oregistrerade.slice(0, MAX_REG);
console.log(`Oregistrerade: ${oregistrerade.length}, registreras nu (tak ${MAX_REG}): ${nya.length}${nya.length ? ` — ${nya.slice(0, 5).map((k) => k.nummer).join(', ')}${nya.length > 5 ? ' …' : ''}` : ''}`);
if (oregistrerade.length > MAX_REG) console.log(`  ${oregistrerade.length - MAX_REG} väntar till nästa körning (eller --max ${oregistrerade.length}).`);
if (!torr && nya.length) {
  const r = await registrera(nya.map((k) => ({ number: k.nummer, carrier: k.kod ?? undefined })));
  for (const k of nya) {
    const p = (lage.paket[k.nummer] ??= {});
    Object.assign(p, { bolag: k.bolag, kod: k.kod, order: k.order, fulfillment: k.fulfillment });
    if (r.accepterade.includes(k.nummer)) p.registrerad = new Date().toISOString().slice(0, 10);
  }
  if (r.avvisade.length) console.log(`⚠️ 17TRACK avvisade ${r.avvisade.length}: ${r.avvisade.map((a) => `${a.number} (${a.kod} ${a.fel})`).join('; ')}`);
  console.log(`Registrerade: ${r.accepterade.length}`);
}

// --- 5. Hämta status och skriv in i Shopify ---------------------------------
const attHamta = kandidater.filter((k) => torr || lage.paket[k.nummer]?.registrerad);
let skrivna = 0;
let fel = 0;
const rader = [];
if (attHamta.length && nyckel()) {
  const h = await hamta(attHamta.map((k) => ({ number: k.nummer, carrier: k.kod ?? lage.paket[k.nummer]?.kod ?? undefined })));
  const perNummer = new Map(h.accepterade.map((p) => [p.number, p]));
  for (const k of attHamta) {
    const rå = perNummer.get(k.nummer);
    if (!rå) continue;
    const t = tolka(rå);
    const p = (lage.paket[k.nummer] ??= { bolag: k.bolag, kod: k.kod, order: k.order, fulfillment: k.fulfillment });
    p.status17 = t.status17;
    p.senast = new Date().toISOString().slice(0, 16);
    const plan = planera(t, k.redan, p.status ?? null);
    rader.push(`${k.order} ${k.nummer} ${t.status17 ?? '–'}${t.plats ? ` @ ${t.plats}` : ''}${plan ? ` → ${plan.status}` : ''}`);
    if (!plan) continue;
    if (torr) { skrivna++; continue; }
    try {
      const m = await graphql(
        `mutation($e: FulfillmentEventInput!) { fulfillmentEventCreate(fulfillmentEvent: $e) { fulfillmentEvent { id } userErrors { field message } } }`,
        { e: { fulfillmentId: k.fulfillment, status: plan.status, happenedAt: plan.happenedAt, message: plan.message } }
      );
      const ue = m.fulfillmentEventCreate.userErrors;
      if (ue.length) throw new Error(ue.map((u) => u.message).join('; '));
      p.status = plan.status;
      if (plan.status === 'DELIVERED') p.levererad = new Date().toISOString().slice(0, 10);
      skrivna++;
    } catch (e) {
      fel++;
      console.log(`❌ ${k.order} ${k.nummer}: ${e.message}`);
    }
  }
  if (h.avvisade.length) console.log(`⚠️ 17TRACK kunde inte läsa ${h.avvisade.length}: ${h.avvisade.slice(0, 5).map((a) => `${a.number} (${a.fel})`).join('; ')}`);
}
for (const r of rader.slice(0, 40)) console.log('  ' + r);
if (rader.length > 40) console.log(`  … och ${rader.length - 40} till`);

// --- 6. Städa och spara -----------------------------------------------------
const grans = Date.now() - LEVERERAD_BEHALL_DAGAR * 86400 * 1000;
for (const [n, p] of Object.entries(lage.paket)) {
  if (p.levererad && new Date(p.levererad).getTime() < grans) delete lage.paket[n];
}
lage.senaste_korning = { datum: new Date().toISOString(), ordrar: ordrar.length, paket: kandidater.length, registrerade: nya.length, skrivna, fel, torr };
if (!torr) writeFileSync(LAGE, `${JSON.stringify(lage, null, 1)}\n`);
console.log(`${torr ? '--torr: ' : ''}Event ${torr ? 'som skulle skrivas' : 'skrivna'} i Shopify: ${skrivna}, fel: ${fel}. ${torr ? 'Inget sparat.' : 'Sparat i sparning/lage.json.'}`);
process.exit(fel && !skrivna ? 1 : 0);
