// cogs.mjs — Matstrumpors varukostnad per produkt och LEVERANSLAND, ur cogs.json.
// Ren räknelogik, inget nät: kurserna skickas in (ECB via stonebite/kallor/valuta.mjs
// eller matstrumpor/konfig.json eur_sek), aldrig inbrända.
//
//   landadKostnad({ handle, variantTitel, antal, land }, kurser)  → { sek, valuta, belopp, kalla } | { saknas: orsak }
//   orderKostnad(rader, land, kurser)                              → summan per order + det som saknas
//   breakEvenForMarknad({ pris, valuta, kostnad_sek, kurser })     → break-even-ROAS/CPA i marknadens valuta
//
// Så läses arket (cogs.json → big5): raden med samma antal som orderraden vinner
// (1 låda / 2 lådor). Fler lådor än arket har rader för räknas med arkets
// största rad × (antal ÷ radens antal) — frakten skalar då linjärt, vilket
// överskattar kostnaden något. Det står i `kalla` så ingen tror att det är mätt.
// Sverige: Cost per item är landad (inköp + frakt) i SEK; tullen (EUR per order)
// läggs på av anroparen via konfig.json. Norden: null med orsak — ingen gissning.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
export const COGS_FIL = join(ROT, 'cogs.json');
export const lasCogs = (fil = COGS_FIL) => JSON.parse(readFileSync(fil, 'utf8'));

const r2 = (x) => Math.round(x * 100) / 100;

/** Kostnadsnyckeln för en variant: "sushi-5", "donut" … eller null. */
export function kostnadsnyckel(cogs, handle, variantTitel = '') {
  const p = cogs.produkter?.[handle];
  if (!p) return null;
  const v = p.varianter ?? {};
  if (v[variantTitel]) return v[variantTitel];
  if (v['*']) return v['*'];
  // Varianttiteln kan komma utan "/ One Size" — matcha på första ledet.
  const forsta = String(variantTitel).split('/')[0].trim();
  for (const [t, n] of Object.entries(v)) if (t.split('/')[0].trim() === forsta) return n;
  return null;
}

/** Vilket block landet hör till: 'sverige' | 'big5' | 'norden' | null. */
export function blockFor(cogs, land) {
  const l = String(land ?? '').toUpperCase();
  if (l === 'SE') return 'sverige';
  if ((cogs.big5?.lander ?? []).includes(l)) return 'big5';
  if ((cogs.norden?.lander ?? []).includes(l)) return 'norden';
  return null;
}

/** Omräkning till SEK. `kurser` = { sekPer: { USD: 9.9, EUR: 11.3, … } } (stonebite/kallor/valuta.mjs hamtaKurser) eller { eur_sek, usd_sek }. */
export function tillSek(belopp, valuta, kurser) {
  if (valuta === 'SEK') return belopp;
  const per = kurser?.sekPer?.[valuta] ?? (valuta === 'EUR' ? kurser?.eur_sek : valuta === 'USD' ? kurser?.usd_sek : null);
  if (!per) throw new Error(`Ingen kurs för ${valuta} — hämta ECB (stonebite/kallor/valuta.mjs), gissa aldrig.`);
  return belopp * per;
}

/**
 * Landad kostnad för EN orderrad (antal lådor av samma variant) till ett land.
 * → { sek, valuta, belopp, kalla } eller { saknas: '<orsak>' }
 */
export function landadKostnad({ handle, variantTitel = '', antal = 1, land }, kurser, cogs = lasCogs()) {
  const n = Math.max(1, Number(antal) || 1);
  const nyckel = kostnadsnyckel(cogs, handle, variantTitel);
  if (!nyckel) return { saknas: `okänd produkt ${handle} (${variantTitel}) — finns inte i cogs.json` };
  const block = blockFor(cogs, land);
  if (!block) return { saknas: `landet ${land} finns inte i något kostnadsblock i cogs.json` };
  if (block === 'sverige') {
    const k = cogs.sverige.kostnad?.[nyckel];
    if (k === null || k === undefined) return { saknas: `${handle}: ${cogs.sverige.saknas_orsak}` };
    return { sek: r2(k * n), valuta: 'SEK', belopp: r2(k * n), kalla: `Cost per item ${k} SEK × ${n}` };
  }
  if (block === 'norden') return { saknas: `${land}: ${cogs.norden.saknas_orsak}` };
  const rader = cogs.big5.rader?.[nyckel]?.[String(land).toUpperCase()];
  if (!rader || rader.length === 0) return { saknas: `${handle} till ${land}: ingen rad i Big 5-arket` };
  const exakt = rader.find((x) => x.antal === n);
  let belopp, kalla;
  if (exakt) { belopp = exakt.cost + exakt.frakt; kalla = `arket ${land} ${n} set: ${exakt.cost} + ${exakt.frakt} USD`; }
  else {
    const storst = [...rader].sort((a, b) => b.antal - a.antal)[0];
    const faktor = n / storst.antal;
    belopp = (storst.cost + storst.frakt) * faktor;
    kalla = `arket ${land} ${storst.antal} set × ${r2(faktor)} (linjärt — arket saknar rad för ${n})`;
  }
  return { sek: r2(tillSek(belopp, cogs.big5.valuta, kurser)), valuta: cogs.big5.valuta, belopp: r2(belopp), kalla };
}

/**
 * Hela orderns varukostnad: rader = [{ handle, variantTitel, antal }]. Big 5-frakten
 * i arket är per produktrad, så en blandad order (sushi + donut) får två frakter — det
 * överskattar; står i `anmarkning`. Sverige: tull per order läggs på när `tullSek` ges.
 */
export function orderKostnad(rader, land, kurser, { tullSek = 0, cogs = lasCogs() } = {}) {
  let sek = 0;
  const delar = [];
  const saknas = [];
  for (const rad of rader) {
    const k = landadKostnad({ ...rad, land }, kurser, cogs);
    if (k.saknas) { saknas.push(k.saknas); continue; }
    sek += k.sek;
    delar.push({ ...rad, ...k });
  }
  const block = blockFor(cogs, land);
  if (block === 'sverige' && tullSek) { sek += tullSek; delar.push({ tull: true, sek: r2(tullSek), kalla: 'tull per order (konfig.json)' }); }
  const anmarkning = block === 'big5' && delar.filter((d) => !d.tull).length > 1 ? 'blandad order: arkets frakt är per produktrad — summan överskattar frakten' : null;
  return { sek: r2(sek), delar, saknas, komplett: saknas.length === 0, anmarkning };
}

/**
 * Break-even för EN marknad: priset kunden betalar (i marknadens valuta) mot den landade
 * kostnaden i SEK. Meta rapporterar i kontots valuta (SEK), så ROAS-linjen räknas i SEK.
 *   break-even-ROAS = pris_sek / (pris_sek − kostnad_sek)
 * → { pris_sek, kostnad_sek, tackningsbidrag_sek, break_even_roas, break_even_cpa_sek }
 */
export function breakEvenForMarknad({ pris, valuta, kostnadSek, kurser }) {
  const prisSek = tillSek(Number(pris), valuta, kurser);
  const tb = prisSek - kostnadSek;
  if (!(tb > 0)) return { pris_sek: r2(prisSek), kostnad_sek: r2(kostnadSek), tackningsbidrag_sek: r2(tb), break_even_roas: null, break_even_cpa_sek: null, varning: 'kostnaden är lika med eller över priset' };
  return { pris_sek: r2(prisSek), kostnad_sek: r2(kostnadSek), tackningsbidrag_sek: r2(tb), break_even_roas: Math.round((prisSek / tb) * 1000) / 1000, break_even_cpa_sek: r2(tb) };
}
