// Spårningsrundan: Shopifys skickade ordrar → 17TRACK → tillbaka in i Shopify
// som fulfillment-event. Körs varje timme av rutinen (/sparning).
//
//   node sparning/kor.mjs                # skarpt
//   node sparning/kor.mjs --torr         # läs allt, skriv inget, registrera inget
//   node sparning/kor.mjs --kolla        # bara nyckel + Shopify-rättigheter
//   node sparning/kor.mjs --dagar 30     # hur långt bakåt ordrarna läses (standard 14)
//   node sparning/kor.mjs --max 500      # tak på nya registreringar per körning (standard 150)
//   node sparning/kor.mjs --ingen-sida   # hoppa över spårningssidan (bara event i Shopify)
//
// Minnet är sparning/lage.json (committas av rutinen): vilka nummer som är
// registrerade hos 17TRACK, senast skrivna status, och när paketet blev
// levererat. Utan filen registreras allt om (kostar kvot) — därför pushas
// den efter varje körning.
//
// Läs-bara mot 17TRACK utöver registreringen. Mot Shopify skrivs ENBART
// fulfillmentEventCreate — aldrig ordrar, fulfillments eller notiser i sig.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { kravProxy, graphql } from '../mejl/shopify.mjs';
import { nyckel, registrera, hamta } from './17track.mjs';
import { bolagskod, tolka, planera } from './status.mjs';
import { handelserUr } from './paketdata.mjs';
import { oversattFras, stadaPlats, landFor, okandaFraser } from './sprak.mjs';
import { sistaBiten } from './sistabiten.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const LAGE = join(ROT, 'lage.json');
const UT = join(ROT, 'output');
const PAKETFIL = join(UT, 'paket.json');
const arg = process.argv.slice(2);
const torr = arg.includes('--torr');
const kolla = arg.includes('--kolla');
const ingenSida = arg.includes('--ingen-sida');
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

// Kandidater: en rad per spårningsnummer som inte är levererat. De får event
// i Shopify och är de enda som kan kosta registreringskvot.
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

// Spårningssidan ska bära MER än de här: ett paket som varit på väg i tre
// veckor ligger utanför orderfönstret (${DAGAR} dagar) men är precis det en
// kund vill slå upp, och ett levererat paket ska gå att spåra dagen efter.
// Paketminnet räcker 60 dagar bakåt, så resten hämtas därifrån. De får inga
// event och registreras aldrig — bara läses, och att läsa är gratis hos
// 17TRACK. Bara registreringen kostar kvot.
const iRundan = new Set(kandidater.map((k) => k.nummer));
const baraSidan = Object.entries(lage.paket)
  .filter(([n, p]) => p?.registrerad && !iRundan.has(n))
  .map(([n, p]) => ({ nummer: n, bolag: p.bolag ?? '', kod: p.kod ?? null, order: p.order ?? null, fulfillment: p.fulfillment ?? null, redan: [], baraSidan: true }));
if (baraSidan.length) console.log(`  Dessutom ${baraSidan.length} paket ur minnet, bara för spårningssidan (inga event, ingen kvot).`);

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
const attHamta = [...kandidater.filter((k) => torr || lage.paket[k.nummer]?.registrerad), ...baraSidan];
let skrivna = 0;
let fel = 0;
const rader = [];
// Paketen till spårningssidan, med skanningarna översatta till svenska.
// Ligger bara i minnet och skickas vidare till publiceringen — de sparas
// aldrig i lage.json, se kommentaren vid --paket i publicera.mjs.
const forSidan = [];
if (attHamta.length && nyckel()) {
  const h = await hamta(attHamta.map((k) => ({ number: k.nummer, carrier: k.kod ?? lage.paket[k.nummer]?.kod ?? undefined })));
  const perNummer = new Map(h.accepterade.map((p) => [p.number, p]));
  for (const k of attHamta) {
    const rå = perNummer.get(k.nummer);
    if (!rå) continue;
    const t = tolka(rå);
    forSidan.push({
      nummer: k.nummer,
      bolag: k.bolag || t.bolag || null,
      statusKod: t.status ?? lage.paket[k.nummer]?.status ?? null,
      handelser: handelserUr(rå, { oversattFras, stadaPlats, landFor, nu: Date.now() }),
      // Sista biten i Sverige: bolag + deras eget nummer, ur misc_info.
      // Läses här för det är enda stället 17TRACK-svaret finns i original.
      sistaBiten: sistaBiten(rå.track_info && rå.track_info.misc_info, k.nummer),
    });
    if (k.baraSidan) continue; // ur minnet: bara till sidan, inga event och ingen lagefil-ändring
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

// --- 7. Spårningssidan ------------------------------------------------------
// Kundens sida, baverbutiken.se/pages/spara. Skanningarna är redan hämtade
// ovan, så sidan byggs i samma körning — de skickas vidare på disk (en
// gitignorerad fil) i stället för att sparas i paketminnet.
const okanda = okandaFraser();
if (okanda.length) {
  // Fraktbolagen hittar på nya texter. Utan den här raden visas den generella
  // meningen ("Paketet är på väg") i tysthet och ordboken växer aldrig.
  console.log(`⚠️ ${okanda.length} fraser saknas i sparning/fraser.json — kunden får en generell mening för dem:`);
  for (const f of okanda.slice(0, 15)) console.log(`     ${f}`);
  if (okanda.length > 15) console.log(`     … och ${okanda.length - 15} till`);
}
if (ingenSida) {
  console.log('--ingen-sida: spårningssidan rörs inte.');
} else if (!forSidan.length) {
  console.log('Inga skanningar hämtade — spårningssidan lämnas som den är.');
} else {
  mkdirSync(UT, { recursive: true });
  writeFileSync(PAKETFIL, `${JSON.stringify(forSidan)}\n`);
  const r = spawnSync(process.execPath, [join(ROT, 'publicera.mjs'), '--paket', PAKETFIL, ...(torr ? ['--torr'] : [])], { stdio: 'inherit' });
  if (r.status !== 0) {
    // Sidan är kundens vy, men eventen i Shopify är redan skrivna och sparade.
    // Rundan får inte se ut att ha misslyckats i sin huvuduppgift.
    console.log(`⚠️ Spårningssidan publicerades inte (kod ${r.status}). Eventen ovan är skrivna. Kör: node sparning/publicera.mjs --paket ${PAKETFIL}`);
  }
}
process.exit(fel && !skrivna ? 1 : 0);
