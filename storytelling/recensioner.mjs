// recensioner.mjs — väljer recensionerna som visas på startsidan: riktiga,
// 5-stjärniga, från OLIKA produkter (Axels order 2026-09-27: "visa recensioner
// från olika produkter" — Judge.me:s egen karusell visade fyra Lövsilarna i
// rad). Läser Judge.me:s API, väljer, skriver storytelling/recensioner.json
// (committas; innehall.mjs bygger sektionens block ur den) och markerar samma
// recensioner som "featured" i Judge.me så deras karusell visar samma sak om
// Axel byter dess läge till manuellt.
//
//   node storytelling/recensioner.mjs            # välj + skriv json + synka featured
//   node storytelling/recensioner.mjs --torr     # visa bara urvalet
//   node storytelling/recensioner.mjs --antal 12 # fler eller färre (standard 12)
//
// Urvalet är en ren funktion (valj) så den går att testa utan nät. Ordningen:
// verifierade köpare först (Judge.me "buyer"/"verified-purchase"), sedan
// recensioner skrivna på sajten, sedan text med substans. Aldrig två från
// samma produkt, aldrig text som klagar på leveranstiden (den sanningen hör
// hemma i spårningen, inte i ett utdrag på startsidan), aldrig butiksrecensioner
// utan produkt. Namn visas som förnamn + initial.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
export const FIL = join(HAR, 'recensioner.json');
const API = 'https://judge.me/api/v1';

const VERIFIERAD = new Set(['buyer', 'verified-purchase']);
const KLAGAR = /tog ett tag|lång leverans|l[åa]ng v[äa]ntan|v[äa]nta(de)? l[äa]nge|sen leverans|dr[öo]jde|tog l[åa]ng tid|inte f[åa]tt|ingen leverans|kundtj[äa]nst/i;
const POSITIVT = /\b(kanon|perfekt|funkar|fungerar|n[öo]jd|rekommender|smidig|toppen|grym|suver[äa]n|bra)\b/i;

export const namnKort = (namn) => {
  const delar = String(namn ?? '').trim().split(/\s+/).filter(Boolean);
  if (!delar.length) return 'Kund';
  const fornamn = delar[0].charAt(0).toUpperCase() + delar[0].slice(1);
  return delar.length > 1 ? `${fornamn} ${delar[delar.length - 1].charAt(0).toUpperCase()}.` : fornamn;
};

export function poang(r) {
  const text = String(r.body ?? '');
  return (VERIFIERAD.has(r.verified) ? 3 : 0) + (r.source !== 'wizard' ? 1 : 0) + (r.has_published_pictures ? 2 : 0) + (text.length >= 70 ? 1 : 0) + (POSITIVT.test(text) ? 1 : 0);
}

/** Urvalet ur Judge.me:s råa lista. → [{ id, handle, produkt, namn, betyg, text, datum, verifierad }] */
export function valj(alla, { antal = 12 } = {}) {
  const kand = (alla ?? []).filter((r) => {
    const t = String(r.body ?? '').trim();
    return r.published && !r.hidden && r.curated !== 'spam' && r.rating === 5 && r.product_handle && r.product_title && !/Judge\.me Shop/i.test(r.product_title)
      && t.length >= 45 && t.length <= 230 && /[a-zåäö]{3,}/i.test(t) && !KLAGAR.test(t);
  });
  kand.sort((a, b) => poang(b) - poang(a) || String(b.created_at).localeCompare(String(a.created_at)));
  const ut = []; const sedda = new Set();
  for (const r of kand) {
    if (sedda.has(r.product_handle)) continue;
    sedda.add(r.product_handle);
    ut.push({ id: r.id, handle: r.product_handle, produkt: r.product_title, namn: namnKort(r.reviewer?.name), betyg: r.rating, text: String(r.body).replace(/\s+/g, ' ').trim(), datum: String(r.created_at).slice(0, 10), verifierad: VERIFIERAD.has(r.verified) });
    if (ut.length === antal) break;
  }
  return ut;
}

export function lasRecensioner(fil = FIL) {
  try { return JSON.parse(readFileSync(fil, 'utf8')); } catch { return []; }
}

async function hamtaAlla(tok, dom) {
  const alla = [];
  for (let p = 1; p <= 30; p++) {
    const r = await fetch(`${API}/reviews?api_token=${tok}&shop_domain=${dom}&per_page=100&page=${p}`);
    if (!r.ok) throw new Error(`Judge.me svarade ${r.status} på sidan ${p}`);
    const j = await r.json();
    if (!j.reviews?.length) break;
    alla.push(...j.reviews);
  }
  return alla;
}

async function sattFeatured(tok, dom, id, featured) {
  const s = await fetch(`${API}/reviews/${id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ api_token: tok, shop_domain: dom, featured }) });
  if (!s.ok) throw new Error(`Judge.me PUT ${id} svarade ${s.status}`);
}

export async function kor({ antal = 12, torr = false, logg = console.log, env = process.env } = {}) {
  const tok = env.JUDGEME_API_TOKEN, dom = env.JUDGEME_SHOP_DOMAIN;
  if (!tok || !dom) throw new Error('JUDGEME_API_TOKEN och JUDGEME_SHOP_DOMAIN saknas i miljön.');
  const alla = await hamtaAlla(tok, dom);
  const valda = valj(alla, { antal });
  logg(`Judge.me: ${alla.length} recensioner lästa, ${valda.length} valda (${valda.filter((v) => v.verifierad).length} verifierade köpare):`);
  for (const v of valda) logg(`  • ${v.verifierad ? '✓' : ' '} [${v.produkt.slice(0, 42)}] ${v.namn}: ${v.text.slice(0, 90)}`);
  if (torr) { logg('Torrt: inget skrivet.'); return valda; }
  writeFileSync(FIL, JSON.stringify(valda, null, 1) + '\n');
  // Featured i Judge.me = exakt det här urvalet (reversibelt).
  const valdaId = new Set(valda.map((v) => v.id));
  let av = 0, pa = 0;
  for (const r of alla) {
    if (r.featured && !valdaId.has(r.id)) { await sattFeatured(tok, dom, r.id, false); av++; }
    if (!r.featured && valdaId.has(r.id)) { await sattFeatured(tok, dom, r.id, true); pa++; }
  }
  logg(`   ✓ ${FIL.split('/').slice(-2).join('/')} skriven · Judge.me featured: ${pa} på, ${av} av`);
  return valda;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--antal');
  kor({ antal: i >= 0 ? Number(argv[i + 1]) : 12, torr: argv.includes('--torr') }).catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
