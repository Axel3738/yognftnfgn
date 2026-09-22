#!/usr/bin/env node
// mail.mjs — supportmejlen som KÄLLA, inte som rapport. Läser brevlådan för
// ett brand (samma två vägar som veckorapporten: IMAP där nätet tillåter,
// annars Loopias webbmejl över HTTPS), plockar KUNDERNAS mejl och söker i dem.
//
//   node kundtjanst/mail.mjs sok "husvagn" [--brand baverbutiken] [--dagar 90] [--json]
//   node kundtjanst/mail.mjs sok "taköverdrag,husvagn,husbil" --dagar 120
//
// Används av tools/invandningsmatris.mjs (Axels beslut 2026-09-22): kunder som
// mejlar före köp gör det sällan offentligt, så kommentarerna ensamma missar
// invändningar. Läs-bara: inget markeras som läst, inget svaras på.
// Kundadresser maskeras i allt som skrivs ut (ka***@gmail.com).
//
// Kräver KUNDTJANST_MAIL_PASS_<BRAND> i miljön. Saknas den säger resultatet
// vilken variabel som fattas — aldrig ett tyst tomt svar.

import { pathToFileURL } from 'node:url';
import { upptackBrands, korkonfig } from './brands.mjs';
import { lasViaImap, lasViaWebmail } from './run.mjs';
import { arEgen, arSystem } from './arenden.mjs';
import { maskeraText } from './maskera.mjs';

const DAG = 86_400_000;

/** Brandet med id:t, eller null. */
export function hittaBrand(brandId) {
  return upptackBrands().find((b) => b.id === brandId) ?? null;
}

/**
 * Läser inkorgen för ett brand `dagar` bakåt. Samma väg som run.mjs korBrand
 * (IMAP → webbmejl vid PROXY_SPARRAR_PORTEN). Returnerar alltid ett objekt:
 * { ok: true, inkorg, kalla } eller { ok: false, orsak, kod }.
 */
export async function lasBrevlada(brandId, { dagar = 90, env = process.env, logg = () => {}, nu = new Date() } = {}) {
  const brand = hittaBrand(brandId);
  if (!brand) return { ok: false, orsak: `okänt brand "${brandId}" — kända: ${upptackBrands().map((b) => b.id).join(', ')}`, kod: 'OKANT_BRAND' };
  const konfig = korkonfig(brand, env);
  if (!konfig.mail.konfigurerad) return { ok: false, orsak: `mejlen kan inte läsas — saknar ${konfig.mail.saknas.join(', ')}`, kod: 'NYCKEL_SAKNAS', saknas: konfig.mail.saknas };
  const period = { fran: new Date(nu.getTime() - dagar * DAG), till: nu };
  const via = konfig.mail.via;
  let last = null;
  if (via === 'imap' || via === 'auto') {
    const r = await lasViaImap(konfig, period, logg);
    if (r.ok) last = r;
    else if (via === 'imap' || r.kod !== 'PROXY_SPARRAR_PORTEN') return { ok: false, orsak: `IMAP ${konfig.mail.host}: ${r.fel}`, kod: r.kod ?? null };
    else logg(`IMAP spärrat av nätet — byter till webbmejlen ${konfig.mail.webmail}`);
  }
  if (!last) {
    const r = await lasViaWebmail(konfig, period, logg);
    if (!r.ok) return { ok: false, orsak: `Webbmejl ${konfig.mail.webmail}: ${r.fel}`, kod: r.kod ?? null };
    last = r;
  }
  const iPeriod = (m) => !m.datum || m.datum.getTime() >= period.fran.getTime() - DAG;
  return { ok: true, brand: konfig, inkorg: last.inkorg.filter(iPeriod), kalla: last.kalla, dagar };
}

/** Bara kundernas mejl: inte brandets egna, inte systemmejl, inte autosvar, inte listor. Ren. */
export function kundmejl(inkorg, brand) {
  return (inkorg ?? []).filter((m) => m && !m.autosvar && !m.listmejl && !arEgen(m.fran?.adress, brand) && !arSystem(m.fran?.adress, m.amne));
}

/** Sökorden ur en sträng: kommaseparerade, trimmade, tomma bort. Ren. */
export function sokord(s) {
  return String(s ?? '').split(/[,;]/).map((x) => x.trim()).filter(Boolean);
}

/**
 * Mejl vars ämne eller text nämner något av orden (skiftlägesokänsligt, som
 * delsträng — "husvagn" träffar "husvagnen" och "husvagnstak"). Ren.
 * Returnerar [{ amne, text, datum, traff }] med adresser maskerade.
 */
export function sokMejl(mejl, ord) {
  const lista = Array.isArray(ord) ? ord : sokord(ord);
  if (!lista.length) return [];
  const re = new RegExp(lista.map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'iu');
  const ut = [];
  for (const m of mejl ?? []) {
    const amne = String(m.amne ?? '');
    const text = String(m.text ?? m.helText ?? '');
    const traff = `${amne}\n${text}`.match(re);
    if (!traff) continue;
    ut.push({ amne: maskeraText(amne), text: maskeraText(text).replace(/\s+/g, ' ').trim(), datum: m.datum instanceof Date && !Number.isNaN(m.datum.getTime()) ? m.datum.toISOString().slice(0, 10) : null, traff: traff[0] });
  }
  return ut;
}

async function huvud(argv) {
  const flagga = (n, s = null) => { const i = argv.indexOf(`--${n}`); return i !== -1 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : s; };
  const kommando = argv[0];
  if (kommando !== 'sok' || !argv[1] || argv[1].startsWith('--')) {
    console.error('Användning: node kundtjanst/mail.mjs sok "<ord,ord>" [--brand baverbutiken] [--dagar 90] [--json]');
    process.exit(2);
  }
  const ord = sokord(argv[1]);
  const brandId = flagga('brand', 'baverbutiken');
  const dagar = Number(flagga('dagar', 90));
  const r = await lasBrevlada(brandId, { dagar, logg: (m) => console.error(`  ${m}`) });
  if (!r.ok) { console.error(`✗ ${r.orsak}`); process.exit(1); }
  const kunder = kundmejl(r.inkorg, r.brand);
  const traffar = sokMejl(kunder, ord);
  if (argv.includes('--json')) { console.log(JSON.stringify({ brand: brandId, dagar, kalla: r.kalla, inkorg: r.inkorg.length, kundmejl: kunder.length, ord, traffar }, null, 2)); return; }
  console.log(`${r.kalla} · ${kunder.length} kundmejl senaste ${dagar} d · ${traffar.length} nämner ${ord.join(' / ')}`);
  for (const t of traffar) console.log(`- ${t.datum ?? '—'} · ${t.amne || '(utan ämne)'} — ${t.text.slice(0, 200)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud(process.argv.slice(2)).catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
