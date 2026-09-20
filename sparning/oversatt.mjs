// Språklagret: allt kunden ser byggs på SVENSKA i hela kedjan (ordboken,
// skedena, delskedena, sidans texter, Shopify-meddelandena) och byts till
// butikens språk i sista ledet — med EN tabell per språk, svensk mening →
// översatt mening (sparning/sprak/nb.json, da.json, fi.json).
//
// Varför så och inte ett språk per fil i varje modul: kedjan har ~400 svenska
// strängar spridda över åtta filer och testas i 150 tester på svenska. Ett
// enda uppslag i slutet ger samma sida i Norge som i Sverige, och en ny
// mening som saknar översättning faller tillbaka på svenskan och RÄKNAS
// (`okanda()`), i stället för att en norsk kund tyst får engelska.
//
// Svenska ('sv') är identiteten: T(x) === x, inga uppslag.
//
// ⚠️ Översättningarna är skrivna av sessionen 2026-09-20 (bokmål, danska,
// finska) — inte av en modersmålstalare. Finskan är den osäkraste. En kund
// som klagar på en formulering: rätta i JSON-filen, aldrig i koden.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));

export const SPRAK = {
  sv: { namn: 'svenska', locale: 'sv-SE', html: 'sv' },
  nb: { namn: 'norska (bokmål)', locale: 'nb-NO', html: 'nb' },
  da: { namn: 'danska', locale: 'da-DK', html: 'da' },
  fi: { namn: 'finska', locale: 'fi-FI', html: 'fi' },
};

export function lasSprakfil(kod) {
  const fil = join(ROT, 'sprak', `${kod}.json`);
  if (!existsSync(fil)) throw new Error(`Språkfilen sparning/sprak/${kod}.json saknas.`);
  const j = JSON.parse(readFileSync(fil, 'utf8'));
  if (!j.ord || typeof j.ord !== 'object') throw new Error(`sparning/sprak/${kod}.json saknar tabellen "ord".`);
  return j;
}

// { kod, locale, T, okanda(), ord } — T byter en svensk mening mot butikens
// språk. Platshållare ({{tid}}, {{bolag}}, {{datum}}) står kvar oöversatta i
// tabellen och byts efteråt av sidan precis som förut.
export function skapaOversattare(kod = 'sv') {
  const k = String(kod || 'sv').toLowerCase();
  if (!SPRAK[k]) throw new Error(`Okänt språk "${kod}" — känner ${Object.keys(SPRAK).join(', ')}.`);
  if (k === 'sv') {
    return { kod: k, locale: SPRAK.sv.locale, html: 'sv', T: (s) => s, okanda: () => [], ord: {} };
  }
  const fil = lasSprakfil(k);
  const ord = fil.ord;
  const OKANDA = new Set();
  const T = (s) => {
    if (s == null) return s;
    const text = String(s);
    if (Object.prototype.hasOwnProperty.call(ord, text)) return ord[text];
    // Frasordboken putsar bort avslutande punkt; tabellen kan bära endera.
    const utanPunkt = text.replace(/\.+$/, '');
    if (utanPunkt !== text && Object.prototype.hasOwnProperty.call(ord, utanPunkt)) return ord[utanPunkt] + '.';
    if (text.trim()) OKANDA.add(text);
    return text;
  };
  return { kod: k, locale: SPRAK[k].locale, html: SPRAK[k].html, T, okanda: () => Array.from(OKANDA), ord };
}

// Översätter en färdig data-fil (paketdata.byggData().data) på plats:
// frasordboken `f` byts, och en ordlista `o` med skedenas och delskedenas
// etiketter läggs till, så sidans skript (som bär de svenska etiketterna
// inbäddat ur uppacka.mjs) kan slå upp dem. Landsnamnen `l` lämnas — de
// visas inte längre i någon vy och kontrollen räknar på dem.
export function oversattData(data, ov, { steg = [], delsteg = [], statusar = [] } = {}) {
  if (!ov || ov.kod === 'sv') return data;
  data.f = (data.f ?? []).map((t) => ov.T(t));
  const o = {};
  for (const rad of steg) if (rad && rad[1]) o[rad[1]] = ov.T(rad[1]);
  for (const rad of delsteg) if (rad && rad[1]) o[rad[1]] = ov.T(rad[1]);
  for (const rad of statusar) if (rad && rad[1]) o[rad[1]] = ov.T(rad[1]);
  data.o = o;
  data.sprak = ov.kod;
  return data;
}
