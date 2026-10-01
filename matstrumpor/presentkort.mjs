#!/usr/bin/env node
// presentkort.mjs — presentkortet till återköparna EFTER ringrundan (Axels
// beslut 2026-10-01: "en presentkod på 200 kronor, som vi skapar i Shopify
// efteråt, efter att jag har fått prata med kunderna").
//
//   node matstrumpor/presentkort.mjs                          torrt: vilka som får, vad det kostar
//   node matstrumpor/presentkort.mjs --ja                     skapa presentkorten i Shopify
//   node matstrumpor/presentkort.mjs --belopp 200 --till 2026-12-31
//   node matstrumpor/presentkort.mjs --bara-nadda <anteckningar.md>   bara de Axel nådde (ur sidans export)
//   node matstrumpor/presentkort.mjs --skicka --ja            låt Shopify mejla kortet till kunden
//
// Mottagarna läses ur output/ringlista/ringlista.json (bygg listan först:
// node matstrumpor/ringlista.mjs). Standard: ALLA återköpare, med eller utan
// telefon — belöningen gäller köpbeteendet, inte om de svarade i telefon.
//
// Skriver output/ringlista/presentkort-logg.jsonl (gitignorerad): kund-id,
// kortets sista tecken och HELA koden — Shopify visar koden bara en gång, vid
// skapandet. En kund i loggen får aldrig ett kort till, hur många gånger
// skriptet än körs. Utan --ja skapas ingenting. Varje kort läses tillbaka.
//
// Shopify: giftCardCreate(initialValue, customerId, expiresOn, note) via appen
// "Fabriken" (write_gift_cards, mätt 2026-10-01). --skicka kör
// giftCardSendNotificationToCustomer efteråt — Shopifys egen presentkortsmall.

import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
export const LISTA = join(ROT, 'output', 'ringlista', 'ringlista.json');
export const LOGG = join(ROT, 'output', 'ringlista', 'presentkort-logg.jsonl');
export const BELOPP_STANDARD = 200;
export const BELOPP_TAK = 300; // över marginalen på en standardorder (245 kr) — kräver att någon ändrar här med flit
export const GALLER_TILL_STANDARD = '2026-12-31';

/** Namn + ordernummer ur sidans export ("## Namn (#1234, #2345) — ATERKOP — Nådd"). Ren. */
export function naddaUrAnteckningar(md) {
  const ut = [];
  for (const rad of String(md).split('\n')) {
    const m = /^## .*\(([^)]*)\)\s+—\s+(\w+)\s+—\s+(.+)$/.exec(rad.trim());
    if (!m) continue;
    ut.push({ ordrar: m[1].split(',').map((s) => s.trim()).filter(Boolean), grupp: m[2].toLowerCase(), status: m[3].trim() });
  }
  return ut;
}

/** Vilka återköpare som ska få kort. `nadda` = rader ur naddaUrAnteckningar; `redan` = kund-id ur loggen. Ren. */
export function valjMottagare(lista, { nadda = null, redan = new Set() } = {}) {
  const alla = lista.aterkopare ?? [];
  const hoppade = [];
  let urval = alla;
  if (nadda) {
    const naddaOrdrar = new Set(nadda.filter((r) => r.status === 'Nådd').flatMap((r) => r.ordrar));
    urval = alla.filter((k) => k.ordrar.some((o) => naddaOrdrar.has(o.nummer)));
    for (const k of alla) if (!urval.includes(k)) hoppade.push({ kund: k.namn, skal: 'inte nådd enligt anteckningarna' });
  }
  const mottagare = [];
  for (const k of urval) {
    if (redan.has(String(k.id))) { hoppade.push({ kund: k.namn, skal: 'har redan fått ett kort (loggen)' }); continue; }
    mottagare.push(k);
  }
  return { mottagare, hoppade };
}

export function lasLogg(fil = LOGG) {
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter(Boolean).map((r) => JSON.parse(r));
}

/** Skapa ETT kort och läs tillbaka det. Returnerar { id, sista, kod, saldo }. */
export async function skapaKort(klient, { kundId, belopp, till, notering }) {
  const d = await klient.graphql(
    `mutation($input: GiftCardCreateInput!) { giftCardCreate(input: $input) {
      giftCard { id lastCharacters balance { amount currencyCode } expiresOn customer { id } }
      giftCardCode
      userErrors { field message } } }`,
    { input: { initialValue: belopp.toFixed(2), customerId: `gid://shopify/Customer/${kundId}`, expiresOn: till, note: notering } }
  );
  const g = d.giftCardCreate?.giftCard;
  if (!g?.id) throw new Error(`Shopify gav inget kort tillbaka: ${JSON.stringify(d).slice(0, 300)}`);
  const kontroll = await klient.graphql('query($id: ID!) { giftCard(id: $id) { id enabled balance { amount } customer { id } expiresOn } }', { id: g.id });
  const k = kontroll.giftCard;
  if (!k?.enabled || Number(k.balance.amount) !== belopp || !String(k.customer?.id ?? '').endsWith(`/${kundId}`)) {
    throw new Error(`Tillbakaläsningen stämmer inte för ${g.id}: ${JSON.stringify(k)}`);
  }
  return { id: g.id, sista: g.lastCharacters, kod: d.giftCardCreate.giftCardCode, saldo: Number(k.balance.amount), till: k.expiresOn };
}

export async function skickaKort(klient, id) {
  const d = await klient.graphql('mutation($id: ID!) { giftCardSendNotificationToCustomer(id: $id) { giftCard { id } userErrors { field message } } }', { id });
  if (!d.giftCardSendNotificationToCustomer?.giftCard?.id) throw new Error(`Skicket gick inte: ${JSON.stringify(d).slice(0, 300)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = process.argv.slice(2);
  const flagga = (n) => (arg.includes(n) ? arg[arg.indexOf(n) + 1] : null);
  const ja = arg.includes('--ja');
  const skicka = arg.includes('--skicka');
  const belopp = Number(flagga('--belopp') ?? BELOPP_STANDARD);
  const till = flagga('--till') ?? GALLER_TILL_STANDARD;
  const anteckningar = flagga('--bara-nadda');

  if (!Number.isFinite(belopp) || belopp <= 0 || belopp > BELOPP_TAK) { console.error(`Beloppet ${belopp} kr är inte tillåtet (1–${BELOPP_TAK} kr). Marginalen på en standardorder är 245 kr.`); process.exit(1); }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(till) || Date.parse(till) < Date.now()) { console.error(`--till ${till} måste vara ett datum framåt (YYYY-MM-DD).`); process.exit(1); }
  if (!existsSync(LISTA)) { console.error(`Hittar inte ${LISTA} — kör node matstrumpor/ringlista.mjs först.`); process.exit(1); }
  if (anteckningar && !existsSync(anteckningar)) { console.error(`Hittar inte ${anteckningar}.`); process.exit(1); }

  const lista = JSON.parse(readFileSync(LISTA, 'utf8'));
  const nadda = anteckningar ? naddaUrAnteckningar(readFileSync(anteckningar, 'utf8')) : null;
  const redan = new Set(lasLogg().map((r) => String(r.kundId)));
  const { mottagare, hoppade } = valjMottagare(lista, { nadda, redan });

  console.log(`${ja ? 'SKARPT' : 'TORRT'} · ${belopp} kr per kort, gäller till ${till} · ${mottagare.length} mottagare · ${hoppade.length} hoppade · som mest ${belopp * mottagare.length} kr i presentkort`);
  for (const h of hoppade) console.log(`  hoppar ${h.kund}: ${h.skal}`);
  for (const k of mottagare) console.log(`  ${k.namn.padEnd(28)} ${k.epost ?? '(ingen e-post)'}  ${k.antalTillfallen} datum, ${k.antalOrdrar} ordrar`);
  if (!ja) { console.log('\nIngenting skapat. Lägg till --ja för att skapa korten i Shopify.'); process.exit(0); }
  if (!mottagare.length) { console.log('Ingen att skapa kort för.'); process.exit(0); }

  const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
  const klient = await skapaKlient(lasButik('matstrumpor'));
  const info = await klient.kolla();
  if (!info.scopes.includes('write_gift_cards')) { console.error(`Appen ${info.app} saknar write_gift_cards.`); process.exit(1); }
  const notering = `Tack-presentkort, ringrundan ${new Date().toISOString().slice(0, 10)} (matstrumpor/presentkort.mjs)`;
  let skapade = 0;
  for (const k of mottagare) {
    try {
      const kort = await skapaKort(klient, { kundId: k.id, belopp, till, notering });
      let skickat = false;
      if (skicka) { await skickaKort(klient, kort.id); skickat = true; }
      appendFileSync(LOGG, `${JSON.stringify({ tid: new Date().toISOString(), kundId: k.id, namn: k.namn, epost: k.epost, belopp, till, kortId: kort.id, sista: kort.sista, kod: kort.kod, skickat })}\n`);
      skapade++;
      console.log(`  ✅ ${k.namn}: kort …${kort.sista}, ${kort.saldo} kr${skickat ? ', mejlat av Shopify' : ''}`);
    } catch (fel) {
      console.error(`  ❌ ${k.namn}: ${fel.message}`);
    }
  }
  console.log(`\n${skapade} av ${mottagare.length} kort skapade. Koderna står i ${LOGG} (gitignorerad).`);
}
