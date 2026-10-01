#!/usr/bin/env node
// ekonomi/barometrar.mjs — Evolve Finance (modul 1–4) på våra riktiga siffror, per verksamhet.
// LÄS-BARA mot Shopify och Meta.
//
//   node ekonomi/barometrar.mjs                       # alla verksamheter som går att läsa
//   node ekonomi/barometrar.mjs --verksamhet matstrumpor
//   node ekonomi/barometrar.mjs --skriv               # + ekonomi/rapporter/<datum>.md och .json
//
// Vad som räknas och varför: ekonomi/README.md. Formlerna: ekonomi/berakna.mjs.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { upptackButiker, kandidatNycklar, mintaToken } from '../stonebite/kallor/shopify.mjs';
import { lasKostnader } from '../stonebite/kallor/vinst.mjs';
import { api } from '../stonebite/kallor/meta.mjs';
import { hamtaKurser } from '../stonebite/kallor/valuta.mjs';
import { kampanjTillhor, tullPerOrderEur } from '../stonebite/data.mjs';
import { orderrader, markeraNya, periodtal, kohorter, stresstest, aterkopsbidrag90, cogsAndel, manadUr } from './berakna.mjs';

const MAPP = dirname(fileURLToPath(import.meta.url));
const ROT = join(MAPP, '..');
const API = '2025-07';
const DAG = 86_400_000;
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const flagga = (n) => process.argv.includes(n);

const idag = arg('--datum') ?? new Date().toISOString().slice(0, 10);
const HISTORIK = Number(arg('--historik') ?? 430);
const fran = new Date(Date.parse(idag) - HISTORIK * DAG).toISOString().slice(0, 10);
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const KONFIG = JSON.parse(readFileSync(join(MAPP, 'konfig.json'), 'utf8'));

// ------------------------------------------------------------------ Shopify

async function lasButik(butik) {
  const fel = [];
  for (const nycklar of await kandidatNycklar(butik)) {
    let shop; let token;
    try { ({ shop, token } = await mintaToken(butik, { nycklar })); } catch (e) { fel.push(`${nycklar.via}: ${e.message}`); continue; }
    const h = { 'X-Shopify-Access-Token': token };
    const shopSvar = await fetch(`https://${shop}/admin/api/${API}/shop.json?fields=currency,name`, { headers: h });
    if (!shopSvar.ok) { fel.push(`${nycklar.via}: shop.json ${shopSvar.status}`); continue; }
    const { shop: info } = await shopSvar.json();
    const ordrar = [];
    let url = `https://${shop}/admin/api/${API}/orders.json?status=any&limit=250&created_at_min=${fran}T00:00:00Z&fields=created_at,cancelled_at,test,customer,shipping_address,current_total_price,current_total_tax,line_items`;
    let nekad = null;
    for (let sida = 0; url && sida < 400; sida++) {
      const svar = await fetch(url, { headers: h });
      if (svar.status === 429) { await new Promise((r) => setTimeout(r, 2000)); sida--; continue; }
      if (!svar.ok) { nekad = `${svar.status} ${(await svar.text()).slice(0, 120)}`; break; }
      const j = await svar.json();
      // Bara det som behövs, så minnet inte fylls av kundobjekt.
      for (const o of j.orders ?? []) ordrar.push({ created_at: o.created_at, cancelled_at: o.cancelled_at, test: o.test, customer: o.customer ? { id: o.customer.id } : null, shipping_address: o.shipping_address ? { country_code: o.shipping_address.country_code } : null, current_total_price: o.current_total_price, current_total_tax: o.current_total_tax, line_items: (o.line_items ?? []).map((li) => ({ variant_id: li.variant_id, quantity: li.quantity, current_quantity: li.current_quantity, title: li.title, variant_title: li.variant_title })) });
      const m = (svar.headers.get('link') ?? '').match(/<([^>]+)>;\s*rel="next"/);
      url = m ? m[1] : null;
    }
    if (nekad) { fel.push(`${nycklar.via}: ordrar ${nekad}`); continue; }
    let kostnader = new Map();
    try { kostnader = await lasKostnader(shop, token); } catch (e) { fel.push(`${nycklar.via}: kostnader ${e.message}`); }
    return { status: 'ok', via: nycklar.via, valuta: info.currency, namn: info.name, ordrar, kostnader };
  }
  return { status: 'fel', orsak: fel.join(' · ') || 'inga nycklar i miljön' };
}

/** Avgiftsandelen ur snapshoten (Shopify Payments avgifter ÷ nettot de senaste 8 dagarna). */
function avgiftsandelFor(butikId, snapshot, sekPer = {}) {
  const v = (snapshot?.vinst ?? []).find((x) => x.id === butikId);
  if (!v || v.status !== 'ok') return { andel: 0.03, kalla: 'antagen 3 % (Evolve modul 1: "~2,8 % + 0,30 $, avrunda till 3 %") — snapshoten saknar butiken' };
  // Nettot och avgifterna i butikens valuta står i snapshoten; avgifter som Shopify drog i
  // en annan valuta (CaraShells USD/NOK/DKK) räknas om till butikens valuta med ECB-kursen.
  const butikKurs = sekPer[v.valuta] ?? 1;
  let netto = 0; let avg = 0;
  for (const d of v.dagar ?? []) {
    netto += (d.netto ?? 0) - (d.utanAvgift ?? 0);
    avg += d.avgifter ?? 0;
    for (const [valuta, belopp] of Object.entries(d.avgifterAnnanValuta ?? {})) if (sekPer[valuta]) avg += (belopp * sekPer[valuta]) / butikKurs;
  }
  return netto > 0 ? { andel: avg / netto, kalla: `uppmätt: Shopify Payments avgifter ÷ netto, ${v.dagar.length} dagar i snapshoten` } : { andel: 0.03, kalla: 'antagen 3 %' };
}

/**
 * Matstrumpors landade kostnad per land (vara + frakt i USD per order, matstrumpor/cogs.json)
 * — samma källa och samma regel som sajtens vinst (stonebite/hamta.mjs byggKostnadPerLand):
 * bara "big5"-länderna, Sverige och Norden läser Cost per item.
 */
async function kostnadPerLandFor(butikId) {
  if (butikId !== 'matstrumpor') return null;
  try {
    const [{ lasCogs, landadKostnad, blockFor }, { handleUrTitel }] = await Promise.all([import('../matstrumpor/cogs.mjs'), import('../stonebite/hamta.mjs')]);
    const kurser = await hamtaKurser();
    if (kurser.status !== 'ok') return null;
    const cogs = lasCogs();
    return (li, land, antal) => {
      if (blockFor(cogs, land) !== 'big5') return null;
      const k = landadKostnad({ handle: handleUrTitel(li.title), variantTitel: li.variant_title ?? '', antal, land }, kurser, cogs);
      return k.saknas ? { saknas: k.saknas } : { kostnadSek: k.sek };
    };
  } catch { return null; }
}

// --------------------------------------------------------------------- Meta

async function spendPerDag(post) {
  const delat = !post.hela;
  const ut = {};
  let after = null;
  for (let sida = 0; sida < 60; sida++) {
    const j = await api(`act_${post.id}/insights`, {
      level: delat ? 'campaign' : 'account', time_range: { since: fran, until: iso(Date.parse(idag) - DAG) },
      time_increment: 1, fields: delat ? 'campaign_name,spend' : 'spend', limit: 500, ...(after ? { after } : {}),
    });
    for (const r of j.data ?? []) {
      if (delat && !kampanjTillhor(post, r.campaign_name)) continue;
      ut[r.date_start] = (ut[r.date_start] ?? 0) + (Number(r.spend) || 0);
    }
    after = j.paging?.next ? j.paging?.cursors?.after : null;
    if (!after) break;
  }
  return ut;
}

// ---------------------------------------------------------------- huvuddel

async function verksamhet(vm, { butiker, sekPer, snapshot }) {
  const saknas = [];
  const rader = [];
  const butikInfo = [];
  let tidigaste = null;
  for (const id of vm.butiker ?? []) {
    const b = butiker.find((x) => x.id === id || x.myshopify === `${id}.myshopify.com` || String(x.myshopify).replace(/_/g, '-') === `${id}.myshopify.com`);
    if (!b) { saknas.push(`${id}: finns inte bland butikerna`); continue; }
    if (b.av) continue;
    const l = await lasButik(b);
    if (l.status !== 'ok') { saknas.push(`${b.namn ?? id}: ${l.orsak}`); continue; }
    const kurs = sekPer[l.valuta];
    if (!kurs) { saknas.push(`${b.namn ?? id}: ingen växelkurs för ${l.valuta}`); continue; }
    const avg = avgiftsandelFor(b.id, snapshot, sekPer);
    const tull = tullPerOrderEur(b.id) * (sekPer.EUR ?? 0);
    const kostnadFor = (vid) => l.kostnader.get(`gid://shopify/ProductVariant/${vid}`)?.kostnad ?? null;
    const egna = orderrader(l.ordrar, { kostnadFor, kurs, tullSek: tull, avgiftsandel: avg.andel, kostnadPerLand: await kostnadPerLandFor(b.id) })
      .map((r) => ({ ...r, kund: r.kund === null ? null : `${b.id}:${r.kund}`, butik: b.id }));
    if (egna.length && (!tidigaste || egna[0].datum < tidigaste)) tidigaste = egna[0].datum;
    rader.push(...egna);
    butikInfo.push({ id: b.id, namn: l.namn, valuta: l.valuta, via: l.via, ordrar: egna.length, avgiftsandel: avg.andel, avgiftKalla: avg.kalla, tullSek: tull, cogs: cogsAndel(egna) });
  }
  rader.sort((a, b) => a.datum.localeCompare(b.datum));

  const spendDag = {};
  const extra = KONFIG.extra_konton?.[vm.id] ?? [];
  for (const post of [...(vm.konton ?? []), ...extra]) {
    try {
      const s = await spendPerDag(post);
      for (const [d, v] of Object.entries(s)) spendDag[d] = (spendDag[d] ?? 0) + v; // alla våra konton är i SEK
    } catch (e) { saknas.push(`${post.namn ?? post.id}: ${e.message}`); }
  }
  // En halv försäljning mot hela reklamen ger ett tal som ser dåligt ut av fel skäl (samma regel
  // som MER på sajten). Saknas en butik eller ett konto: inga tal som delar med reklamen.
  const komplett = saknas.length === 0;
  const spendMellan = (a, b) => (komplett ? Object.entries(spendDag).filter(([d]) => d >= a && d <= b).reduce((s, [, v]) => s + v, 0) : null);
  const spendPerManad = {};
  if (komplett) for (const [d, v] of Object.entries(spendDag)) spendPerManad[manadUr(d)] = (spendPerManad[manadUr(d)] ?? 0) + v;

  // Öppnade butiken inom fönstret ser vi hela historiken: då är alla första ordrar nya kunder.
  const oppnadInomFonstret = tidigaste && Date.parse(tidigaste) - Date.parse(fran) > 3 * DAG;
  const { bedombarFran } = markeraNya(rader, { forstaDag: oppnadInomFonstret ? tidigaste : fran, minHistorikDagar: oppnadInomFonstret ? 0 : 180 });

  const igar = iso(Date.parse(idag) - DAG);
  const f30 = iso(Date.parse(idag) - 30 * DAG);
  const f60 = iso(Date.parse(idag) - 60 * DAG);
  const f31 = iso(Date.parse(idag) - 31 * DAG);
  const nu = periodtal(rader, { fran: f30, till: igar, spend: spendMellan(f30, igar) });
  const forra = periodtal(rader, { fran: f60, till: f31, spend: spendMellan(f60, f31) });
  const cogsProcent = cogsAndel(rader.filter((r) => r.datum >= iso(Date.parse(idag) - 90 * DAG))).andel;
  const ltv90 = aterkopsbidrag90(rader, { idag, cogsProcent });
  const stress = stresstest(nu, { ltvExtra: ltv90.perKund ?? 0 });
  const kohort = kohorter(rader.filter((r) => r.datum >= bedombarFran), { spendPerManad, idag, cogsProcent });
  return { id: vm.id, namn: vm.namn, komplett: saknas.length === 0, saknas, butiker: butikInfo, bedombarFran, nu, forra, ltv90, stress, kohorter: kohort, spendPerManad };
}

const kr = (n) => (n === null || n === undefined || Number.isNaN(n) ? '–' : `${Math.round(n).toLocaleString('sv-SE')} kr`);
const pct = (n) => (n === null || n === undefined ? '–' : `${(n * 100).toFixed(1).replace('.', ',')} %`);
const tal = (n, d = 2) => (n === null || n === undefined ? '–' : n.toFixed(d).replace('.', ','));

function rapport(resultat) {
  const L = [`# Barometrarna ${idag} — Evolve Finance på våra siffror`, ''];
  L.push(`Senaste 30 hela dygnen (${resultat[0]?.nu.fran ?? ''}–${resultat[0]?.nu.till ?? ''}) jämfört med de 30 före. Allt i kronor, utan moms. Reklam = all spend i verksamhetens annonskonton (delade konton på kampanjprefix, som sajten). Nya kunder = första ordern i Shopify, inte Metas köp.`);
  L.push('');
  for (const r of resultat) {
    L.push(`## ${r.namn}`);
    L.push('');
    if (!r.komplett) L.push(`⚠️ **Ofullständig:** ${r.saknas.join(' · ')}. Talen nedan gäller bara det som gick att läsa${r.butiker.length ? '' : ' (inget)'}.`);
    if (!r.butiker.length) { L.push(''); continue; }
    const n = r.nu; const f = r.forra;
    L.push('');
    L.push('| Tal | Senaste 30 d | 30 d före | Kursens ribba |');
    L.push('|---|---|---|---|');
    L.push(`| Nettoomsättning | ${kr(n.netto)} | ${kr(f.netto)} | |`);
    L.push(`| Reklam | ${kr(n.spend)} | ${kr(f.spend)} | |`);
    L.push(`| MER (omsättning ÷ reklam) | ${tal(n.mer)} | ${tal(f.mer)} | |`);
    L.push(`| Ordrar / nya kunder / återköp | ${n.ordrar} / ${n.nya} / ${n.aterkop} | ${f.ordrar} / ${f.nya} / ${f.aterkop} | |`);
    L.push(`| AOV första order | ${kr(n.aovNy)} | ${kr(f.aovNy)} | modul 3: låg AOV är det svåraste att laga |`);
    L.push(`| AOV återköp | ${kr(n.aovAter)} | ${kr(f.aovAter)} | |`);
    L.push(`| **nCAC** (reklam ÷ nya kunder) | **${kr(n.ncac)}** | ${kr(f.ncac)} | modul 2 |`);
    L.push(`| Varukostnad | ${pct(n.cogsAndel)} | ${pct(f.cogsAndel)} | modul 3: max 30 % |`);
    L.push(`| Betalavgifter | ${pct(n.avgiftsAndel)} | ${pct(f.avgiftsAndel)} | modul 1: ~3 % |`);
    L.push(`| Tull per order | ${kr(n.tullPerOrder)} | | |`);
    L.push(`| Bidrag före reklam, första order | ${kr(n.bidragForeReklamNy)} | ${kr(f.bidragForeReklamNy)} | = max CAC för att gå jämnt ut på första ordern |`);
    L.push(`| **Bidrag per ny kund, första order** (efter reklam) | **${kr(n.bidragForstaOrder)}** | ${kr(f.bidragForstaOrder)} | modul 1 |`);
    L.push(`| Bidrag per återköp | ${kr(n.bidragAterkop)} | ${kr(f.bidragAterkop)} | ingen reklam på återköpet |`);
    L.push(`| AOV ÷ nCAC ("ROAS mot nya kunder") | ${tal(n.roasMotNya)} | ${tal(f.roasMotNya)} | modul 3: håll ≥ 0,7 bara om LTV bär resten |`);
    L.push('');
    const tack = Math.min(...r.butiker.map((b) => b.cogs.tackning));
    if (tack < 0.9) L.push(`Varukostnaden: Cost per item täcker ${pct(tack)} av omsättningen i sämsta butiken. Saknade rader räknas med butikens uppmätta procent — fyll i Cost per item i Shopify så blir talet exakt.`);
    L.push(`Återköp inom 90 dagar: ${r.ltv90.kunder ? `${kr(r.ltv90.perKund)} i bidrag per ny kund (${r.ltv90.kunder} kunder som hunnit 90 dagar)` : 'inga kunder har hunnit 90 dagar i fönstret'}.`);
    L.push('');
    if (r.stress) {
      L.push('**Stresstest (modul 3)** — bidrag per ny kund:');
      L.push('');
      L.push('| Läge | Första order | Efter 90 dagar |');
      L.push('|---|---|---|');
      for (const s of r.stress) L.push(`| ${s.namn} | ${kr(s.forstaOrder)} | ${kr(s.nittioDagar)} |`);
      L.push('');
    }
    const k = r.kohorter.filter((x) => x.kunder >= 20).slice(-8);
    if (k.length) {
      L.push('**Kohorter (modul 2)** — kronor per ny kund, bidrag före reklam, kumulativt:');
      L.push('');
      L.push('| Första köp | Kunder | nCAC | Månad 0 | Månad 1 | Månad 2 | Månad 3 | Tillbaka |');
      L.push('|---|---|---|---|---|---|---|---|');
      for (const x of k) {
        const c = (i) => (x.kumBidrag[i] === undefined ? '…' : kr(x.kumBidrag[i]));
        L.push(`| ${x.manad} | ${x.kunder} | ${kr(x.cac)} | ${c(0)} | ${c(1)} | ${c(2)} | ${c(3)} | ${x.paybackManad === null ? (x.cac === null ? '–' : 'inte än') : `månad ${x.paybackManad}`} |`);
      }
      L.push('');
      L.push(`Nya kunder räknas från ${r.bedombarFran} (första ordern vi kan se utan att kunden kan ha köpt tidigare).`);
      L.push('');
    }
    L.push('Butiker: ' + r.butiker.map((b) => `${b.namn} (${b.valuta}, ${b.ordrar} ordrar i fönstret, avgifter ${pct(b.avgiftsandel)} ${b.avgiftKalla.startsWith('uppmätt') ? 'uppmätt' : 'antagna'}, tull ${kr(b.tullSek)}/order)`).join(' · '));
    L.push('');
  }
  return L.join('\n');
}

async function main() {
  const reg = JSON.parse(readFileSync(join(ROT, 'stonebite', 'varumarken.json'), 'utf8'));
  const valda = arg('--verksamhet') ? [arg('--verksamhet')] : KONFIG.standard_verksamheter;
  const snapshotFil = join(ROT, 'stonebite', 'data', 'snapshot.json');
  const snapshot = existsSync(snapshotFil) ? JSON.parse(readFileSync(snapshotFil, 'utf8')) : null;
  const kurser = await hamtaKurser();
  const sekPer = kurser.sekPer ?? { SEK: 1 };
  const butiker = upptackButiker(ROT);
  const resultat = [];
  for (const id of valda) {
    const vm = reg.varumarken.find((v) => v.id === id) ?? (KONFIG.egna_verksamheter ?? []).find((v) => v.id === id);
    if (!vm) { console.error(`okänd verksamhet ${id}`); continue; }
    console.error(`… ${vm.namn}`);
    resultat.push(await verksamhet(vm, { butiker, sekPer, snapshot }));
  }
  const text = rapport(resultat);
  console.log(text);
  if (flagga('--skriv')) {
    mkdirSync(join(MAPP, 'rapporter'), { recursive: true });
    writeFileSync(join(MAPP, 'rapporter', `barometrar-${idag}.md`), text);
    writeFileSync(join(MAPP, 'rapporter', `barometrar-${idag}.json`), JSON.stringify({ idag, historikFran: fran, kurser: { datum: kurser.datum, sekPer }, resultat }, null, 1));
    console.error(`Skrev ekonomi/rapporter/barometrar-${idag}.md och .json`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(`Barometrarna stoppade: ${e.stack ?? e.message}`); process.exit(1); });
}
