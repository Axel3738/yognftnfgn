// dashboard.mjs — körningens resultat som MASKINLÄSBAR data för hemsidan.
//
// Varför en egen fil och inte markdown: sidan ska kunna sortera ärenden, filtrera
// på kategori och visa deadlines. Att läsa det ur en renderad rapporttext är att
// gissa; här ligger samma tal som rapporten, men strukturerade.
//
// ⚠️ Allt som rör en kund är MASKERAT redan här (maskera.mjs), inte i sidan.
// Filen committas till repot och sidan publiceras — adresser får aldrig ligga i
// klartext i någon av dem. Ordernumret är det VA:n söker på.
//
// Texten som visas för VA:n är engelsk (CLAUDE.md: språket följer läsaren).
// Kategorinamn hämtas ur klassificering.mjs så sidan och rapporten aldrig
// kan säga olika saker.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KATEGORI } from './klassificering.mjs';
import { maskeraAdress, maskeraText } from './maskera.mjs';
import { byggAtgardsplan, pengarIRisk } from './atgardsplan.mjs';

export const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const VERSION = 2;

const iso = (d) => (d instanceof Date ? d.toISOString() : d ? String(d) : null);
const dag = (d) => (d ? iso(d)?.slice(0, 10) ?? null : null);

/** Ett ärende som sidans tabellrad — maskerat, med det VA:n behöver för att agera. */
export function arendeRad(a) {
  const kat = KATEGORI[a.kategori] ?? null;
  return {
    kategori: a.kategori,
    kategoriEn: kat?.en ?? a.kategori,
    vikt: kat?.vikt ?? 0,
    kund: maskeraAdress(a.kund?.adress),
    ordernummer: a.ordernummer ?? [],
    amne: maskeraText(a.amne ?? '').slice(0, 140),
    utdrag: maskeraText(a.utdrag ?? '').slice(0, 200),
    sprak: a.sprak ?? 'okänt',
    besvarad: Boolean(a.besvarad),
    timmarObesvarad: a.timmarObesvarad ?? 0,
    larm: Boolean(a.larmObesvarad),
    svarstidTimmar: a.svarstidTimmar ?? null,
    antalInkommande: a.antalInkommande ?? 1,
    forsta: dag(a.forstaInkommande),
    senaste: dag(a.senasteInkommande),
    eskalering: a.eskalering ?? 0,
  };
}

/** En tvist som sidans rad: typ, pengar, deadline. */
export function tvistRad(x) {
  return {
    typ: x.typ ?? 'dispute',
    orsak: String(x.orsak ?? 'general').replace(/_/g, ' '),
    status: String(x.status ?? '').replace(/_/g, ' '),
    oppen: ['needs_response', 'under_review'].includes(x.status),
    belopp: Number(x.belopp) || 0,
    valuta: x.valuta ?? null,
    order: x.ordernamn ?? (x.orderId ? String(x.orderId) : null),
    initierad: dag(x.initierad),
    deadline: x.evidensSenast ?? null,
  };
}

/**
 * Hela sidans data för EN körning (ett brand, en vecka). `r` är run.mjs:s
 * resultatobjekt. Returnerar ett rent objekt — inget skrivs här.
 */
export function byggDashboard(r, { nu = new Date() } = {}) {
  const s = r.sammanfattning ?? {};
  const t = r.brand?.trosklar ?? {};
  const bort = r.bortfiltrerade ?? {};
  const tvister = r.tvister?.tillganglig ? (r.tvister.lista ?? []).map(tvistRad) : [];
  const pengar = pengarIRisk(r);
  const forra = r.forra ?? null;
  const sopTackta = new Set((r.sop?.tackta ?? []).map((x) => x.id));
  const sopSaknas = new Set(r.sop?.saknas ?? []);

  return {
    id: r.brand?.id,
    namn: r.brand?.brand ?? r.brand?.id,
    vecka: r.vecka,
    kord: iso(r.kord ?? nu),
    period: { fran: dag(r.period?.fran), till: dag(r.period?.till), dagar: r.dagar ?? t.ordrar_dagar ?? 7 },
    kallor: r.kallor ?? [],
    varningar: (r.varningar ?? []).map((v) => maskeraText(v)),
    trosklar: { obesvaradTimmar: t.obesvarad_timmar ?? 48, ordrarDagar: t.ordrar_dagar ?? 30, tvistgradGul: t.tvistgrans_gul_procent ?? 0.5, tvistgradRod: t.tvistgrans_rod_procent ?? 0.9 },

    // Vad som lästes och vad som sorterades bort — så "har du läst allt?" går att svara på.
    kallflode: {
      mejl: s.antalMejl ?? r.antalMejl ?? null,
      arenden: s.antalArenden ?? 0,
      spam: s.spam ?? 0,
      autosvar: bort.autosvar ?? 0,
      system: bort.system ?? 0,
      listmejl: bort.listmejl ?? 0,
      utanAvsandare: bort.utanAvsandare ?? 0,
    },

    nyckeltal: {
      risk: r.risk?.poang ?? 0,
      riskNiva: r.risk?.niva?.id ?? 'lag',
      riskNivaEn: r.risk?.niva?.en ?? 'Low',
      arenden: s.antalArenden ?? 0,
      obesvarade: s.obesvarade ?? 0,
      larmObesvarade: s.larmObesvarade ?? 0,
      medianSvarstidTimmar: s.medianSvarstidTimmar ?? null,
      besvaradeMedTid: s.besvaradeMedTid ?? 0,
      ordrar: r.ordrar?.antal ?? null,
      chargebacks: r.risk?.underlag?.chargebacks ?? null,
      forfragningar: r.risk?.underlag?.forfragningar ?? null,
      tvistgrad: r.risk?.tvistgrad ?? null,
      pengarIRisk: pengar.belopp,
      pengarValuta: pengar.valuta,
      oppnaTvister: pengar.antal,
      forra: forra ? {
        risk: forra.riskPoang ?? null, arenden: forra.antalArenden ?? null, obesvarade: forra.obesvarade ?? null,
        larmObesvarade: forra.larmObesvarade ?? null, medianSvarstidTimmar: forra.medianSvarstidTimmar ?? null,
        chargebacks: forra.tvister ?? null, tvistgrad: forra.tvistgrad ?? null,
      } : null,
    },

    kategorier: (s.topp ?? []).map((p) => ({
      id: p.id,
      en: KATEGORI[p.id]?.en ?? p.id,
      vikt: KATEGORI[p.id]?.vikt ?? 0,
      antal: p.antal,
      obesvarade: p.obesvarade,
      andel: s.antalArenden ? Math.round((p.antal / s.antalArenden) * 100) : 0,
      forra: forra?.perKategori?.[p.id] ?? null,
      sop: sopTackta.has(p.id) ? 'covered' : sopSaknas.has(p.id) ? 'missing' : 'unknown',
      sopTitel: (r.sop?.tackta ?? []).find((x) => x.id === p.id)?.sop ?? null,
      aterkommande: (r.aterkommande ?? []).find((x) => x.id === p.id) ?? null,
      mening: r.sammanfattningar?.[p.id] ?? null,
    })),

    // Ärendelistan är arbetsordningen: farligast och äldst först (samma sortering som arenden.mjs).
    arenden: (r.arenden ?? []).filter((a) => a.kategori !== 'spam').map(arendeRad),
    tvister,
    signaler: (r.risk?.signaler ?? []).filter((x) => x.poang > 0 || (x.varde !== null && x.varde > 0)).map((x) => ({
      id: x.id, en: x.en, varde: x.varde, poang: x.poang, detaljer: (x.detaljer ?? []).map((d) => maskeraText(d)),
    })),
    sop: r.sop ? { antal: r.sop.antalSop ?? 0, tackta: (r.sop.tackta ?? []).map((x) => x.id), saknas: r.sop.saknas ?? [], fel: r.sop.fel ?? null } : null,
    plan: byggAtgardsplan(r, { nu }).map((a) => ({ ...a, varfor: maskeraText(a.varfor) })),
  };
}

/** Skriver körningens dashboard-JSON bredvid rapporterna. Idempotent per vecka. */
export function skrivDashboard(r, { korningar } = {}) {
  const mapp = join(korningar ?? join(ROT, 'kundtjanst', 'korningar'), r.brand.id);
  mkdirSync(mapp, { recursive: true });
  const fil = join(mapp, `${r.vecka}.json`);
  writeFileSync(fil, `${JSON.stringify(byggDashboard(r), null, 2)}\n`);
  return fil;
}

// ------------------------------------------------------------------ Sidan

function lasJsonl(fil) {
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter(Boolean)
    .map((rad) => { try { return JSON.parse(rad); } catch { return null; } })
    .filter((x) => x && x.vecka);
}

/**
 * Allt sidan visar: varje brands senaste körning + historiken bakåt.
 * Läser `<brand>/<vecka>.json` (skrivna av skrivDashboard) och
 * `historik/<brand>.jsonl`. Veckor utan JSON (körda före version 2) syns
 * bara i historikkurvan — aldrig som en tom flik.
 */
export function samlaDashboard({ korningar, historik, nu = new Date() } = {}) {
  const kbas = korningar ?? join(ROT, 'kundtjanst', 'korningar');
  const hbas = historik ?? join(ROT, 'kundtjanst', 'historik');
  const brands = [];
  const mappar = existsSync(kbas) ? readdirSync(kbas, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name) : [];

  for (const id of mappar.sort()) {
    const mapp = join(kbas, id);
    const veckofiler = readdirSync(mapp).filter((f) => /^\d{4}-W\d{2}\.json$/.test(f)).sort();
    if (!veckofiler.length) continue;
    const veckor = {};
    for (const f of veckofiler) {
      try { veckor[f.slice(0, -5)] = JSON.parse(readFileSync(join(mapp, f), 'utf8')); } catch { /* trasig fil hoppas över, aldrig tyst i loggen nedan */ }
    }
    const nycklar = Object.keys(veckor).sort();
    if (!nycklar.length) continue;
    const senaste = veckor[nycklar[nycklar.length - 1]];
    brands.push({
      ...senaste,
      veckor: nycklar,
      historik: lasJsonl(join(hbas, `${id}.jsonl`)).sort((a, b) => a.vecka.localeCompare(b.vecka)).map((h) => ({
        vecka: h.vecka, risk: h.riskPoang ?? null, arenden: h.antalArenden ?? null, obesvarade: h.obesvarade ?? null,
        larm: h.larmObesvarade ?? null, median: h.medianSvarstidTimmar ?? null, chargebacks: h.tvister ?? null,
        forfragningar: h.forfragningar ?? null, tvistgrad: h.tvistgrad ?? null, ordrar: h.ordrar ?? null,
      })),
      arkiv: Object.fromEntries(nycklar.map((v) => [v, veckor[v]])),
    });
  }

  brands.sort((a, b) => (b.nyckeltal?.risk ?? 0) - (a.nyckeltal?.risk ?? 0));
  return { version: VERSION, uppdaterad: iso(nu), brands };
}
