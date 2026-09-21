// kallor/repo.mjs — det repot redan vet. Inga nycklar, inget nät.
//
// Rutinerna i huset skriver sina resultat till filer (commission/leaderboard.json,
// kundtjanst/korningar/, sparning/lage.json, factory/budgetlogg.jsonl). Den här
// modulen läser dem och skalar ner dem till det dashboarden visar — aldrig mer,
// så snapshoten inte sväller.
//
// Varje läsare svarar { status, orsak, ... }. En fil som saknas är inte ett fel
// som ska döda körningen: det betyder bara "den rutinen har inte kört än", och
// då ska sidan säga just det.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function jsonEller(fil, standard = null) {
  try {
    return existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : standard;
  } catch {
    return standard;
  }
}

function jsonlSista(fil, antal) {
  if (!existsSync(fil)) return [];
  const rader = readFileSync(fil, 'utf8').trim().split('\n').filter(Boolean);
  return rader.slice(-antal).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
}

// ------------------------------------------------------------ redigerarna

/**
 * Topplistan (commission/leaderboard.json) + folket (dashboard/data/team.json).
 * ⚠️ Spend följer ALDRIG med här — redigerarna ser bara sin ersättning i USD
 * (Axels beslut 2026-09-02). Filen innehåller ingen spend, och vi lägger
 * aldrig tillbaka den.
 */
export function lasRedigerare(rot) {
  const lb = jsonEller(join(rot, 'commission', 'leaderboard.json'));
  const team = jsonEller(join(rot, 'dashboard', 'data', 'team.json'), { users: [] });
  const folk = (team.users ?? []).filter((u) => u.active !== false).map((u) => ({
    id: u.id, namn: u.name, roll: u.role, epost: u.email ?? '', discord: u.discordUserId ?? '',
  }));
  if (!lb) return { status: 'saknas', orsak: 'commission/leaderboard.json finns inte — /commission har inte kört än.', folk, rader: [] };
  return {
    status: 'ok',
    orsak: null,
    manad: lb.manad,
    period: lb.period,
    uppdaterad: lb.uppdaterad ?? lb.kord ?? null,
    valuta: lb.valuta ?? { kod: 'USD' },
    sats: lb.sats ?? null,
    slutavrakning: Boolean(lb.slutavrakning),
    rader: (lb.rader ?? []).map((r) => ({
      plats: r.plats, id: r.id, namn: r.namn, usd: r.usd, annonser: r.annonser,
      okning: r.okning ?? null, flytt: r.flytt ?? 0, basta: r.basta ?? null,
      kampanjer: (r.kampanjer ?? []).slice(0, 3),
    })),
    folk,
  };
}

// -------------------------------------------------------------- produkter

/** Bäverbutikens produkter: break-even, budget och prefix. */
export function lasProdukter(rot) {
  const p = jsonEller(join(rot, 'products', 'products.json'), { products: [] });
  return (p.products ?? []).map((x) => ({
    id: x.id,
    namn: x.name,
    brand: x.brand,
    kontoId: x.ad_account_id,
    kampanjIds: x.campaign_ids ?? [],
    budget: x.daily_budget_sek ?? null,
    breakEvenRoas: x.break_even_roas ?? null,
    breakEvenCpa: x.break_even_cpa_sek ?? null,
    aov: x.aov_sek ?? null,
    skalar: Boolean(x.scaling),
    prefix: x.creative_prefix ?? null,
    status: x.status ?? null,
  }));
}

/** OPS-butikernas ekonomi ur fabrikens produktfiler (pris, break-even). */
export function lasOpsProdukter(rot) {
  const register = jsonEller(join(rot, 'factory', 'produkter', 'register.json'), {});
  const poster = register.butiker ?? register.produkter ?? {};
  return Object.entries(poster)
    .filter(([, v]) => v && typeof v === 'object')
    .map(([nyckel, v]) => ({
      nyckel,
      butik: v.butik ?? nyckel.split('/')[0],
      redigerare: v.redigerare ?? null,
      hub: v.notion ?? v.hub ?? null,
      kord: v.kord ?? null,
      briefantal: v.briefantal ?? null,
    }));
}

// ------------------------------------------------------------- kundtjänst

/** Senaste veckorapporten per brand + de fyra senaste veckorna som trend. */
export function lasKundtjanst(rot) {
  const mapp = join(rot, 'kundtjanst', 'korningar');
  if (!existsSync(mapp)) return { status: 'saknas', orsak: 'kundtjanst/korningar/ finns inte — /kundtjanst har inte kört än.', brands: [] };
  const brands = [];
  for (const id of readdirSync(mapp).filter((d) => !d.startsWith('_') && !d.startsWith('.'))) {
    const filer = existsSync(join(mapp, id)) ? readdirSync(join(mapp, id)).filter((f) => f.endsWith('.json')).sort() : [];
    if (!filer.length) continue;
    const senaste = jsonEller(join(mapp, id, filer[filer.length - 1]));
    if (!senaste) continue;
    const historik = jsonlSista(join(rot, 'kundtjanst', 'historik', `${id}.jsonl`), 8);
    const tvister = (senaste.tvister ?? []).map((t) => ({
      order: t.order ?? t.ordernummer ?? null,
      typ: t.typ ?? t.type ?? null,
      belopp: t.belopp ?? t.amount ?? null,
      valuta: t.valuta ?? t.currency ?? 'SEK',
      status: t.status ?? null,
      deadline: t.deadline ?? t.evidenceDeadline ?? t.evidence_due_by ?? null,
    }));
    brands.push({
      id,
      namn: senaste.namn ?? id,
      vecka: senaste.vecka ?? null,
      kord: senaste.kord ?? null,
      period: senaste.period ?? null,
      nyckeltal: senaste.nyckeltal ?? null,
      kategorier: (senaste.kategorier ?? []).slice(0, 6),
      plan: (senaste.plan ?? []).slice(0, 6),
      tvister,
      tvisterTillgangliga: senaste.tvisterTillgangliga !== false,
      historik: historik.map((h) => ({
        vecka: h.vecka, datum: h.datum, arenden: h.antalArenden, obesvarade: h.obesvarade,
        risk: h.riskPoang, tvister: h.tvister ?? null,
      })),
    });
  }
  return { status: brands.length ? 'ok' : 'saknas', orsak: brands.length ? null : 'inga körningar sparade än', brands };
}

// ---------------------------------------------------------------- leverans

const LEVERERAT = new Set(['DELIVERED', 'LEVERERAD']);
const PA_VAG = new Set(['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'CONFIRMED', 'READY_FOR_PICKUP', 'PICKUP']);

/** Paketen per butik ur sparning/lage.json. Bara summor — aldrig paketlistan. */
export function lasLeverans(rot) {
  const register = jsonEller(join(rot, 'sparning', 'butiker.json'), {});
  const butiker = [];
  for (const [id, v] of Object.entries(register)) {
    if (id === 'comment' || !v || typeof v !== 'object') continue;
    const fil = v.standard ? join(rot, 'sparning', 'lage.json') : join(rot, 'sparning', 'butiker', id, 'lage.json');
    const lage = jsonEller(fil);
    if (!lage) {
      butiker.push({ id, namn: v.namn ?? id, status: 'saknas', orsak: 'ingen lage.json — rutinen har inte kört för butiken än' });
      continue;
    }
    const paket = Object.values(lage.paket ?? {});
    const rakna = (test) => paket.filter(test).length;
    butiker.push({
      id,
      namn: v.namn ?? id,
      url: v.url ?? '',
      status: 'ok',
      paket: paket.length,
      levererade: rakna((p) => LEVERERAT.has(String(p.status ?? '').toUpperCase())),
      paVag: rakna((p) => PA_VAG.has(String(p.status ?? '').toUpperCase())),
      utanSkanning: rakna((p) => !p.senast),
      senasteKorning: lage.senaste_korning ?? null,
    });
  }
  return { status: butiker.length ? 'ok' : 'saknas', orsak: butiker.length ? null : 'sparning/butiker.json saknas', butiker };
}

// --------------------------------------------------------------- nattvakten

/** Nattvaktens beslut, senaste dygnen. Visar att maskineriet faktiskt går. */
export function lasBudgetlogg(rot, { rader = 400, dagar = 7 } = {}) {
  const logg = jsonlSista(join(rot, 'factory', 'budgetlogg.jsonl'), rader);
  if (!logg.length) return { status: 'saknas', orsak: 'factory/budgetlogg.jsonl är tom — ingen nattvakt har loggat än', beslut: [] };
  const grans = new Date(Date.now() - dagar * 86_400_000).toISOString().slice(0, 10);
  const beslut = logg.filter((r) => String(r.datum ?? '') >= grans).map((r) => ({
    datum: r.datum, butik: r.butik, namn: r.namn, atgard: r.atgard, typ: r.entitet_typ,
    gammalt: r.gammalt, nytt: r.nytt, genomford: r.genomford !== false,
    motivering: String(r.motivering ?? '').slice(0, 240),
  }));
  return { status: 'ok', orsak: null, beslut: beslut.slice(-120).reverse(), senaste: logg[logg.length - 1]?.datum ?? null };
}

// ----------------------------------------------------------------- profilen

/** Företagsfakta och varumärken för den publika sidan. */
export function lasProfil(rot) {
  return jsonEller(join(rot, 'stonebite', 'profil.json'), null);
}

/** Kartan över allt som är byggt, i kategorier. */
export function lasSystem(rot) {
  return jsonEller(join(rot, 'stonebite', 'system.json'), null);
}

/** Allt repot kan ge, i ett svep. */
export function samlaRepo(rot) {
  return {
    redigerare: lasRedigerare(rot),
    produkter: lasProdukter(rot),
    opsProdukter: lasOpsProdukter(rot),
    kundtjanst: lasKundtjanst(rot),
    leverans: lasLeverans(rot),
    budgetlogg: lasBudgetlogg(rot),
  };
}
