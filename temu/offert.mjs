// Läser en CWD-offert (Google Sheets → CSV) och normaliserar den till produktrader.
//
//   node temu/offert.mjs <fil.csv | google-sheets-länk>
//
// Arket har tre rader per produkt (Qty 1/2/3). **Qty 1 är styckkostnaden** —
// Qty 2/3 är totaler för flera enheter och får ALDRIG användas som styckpris
// (temu/cogs/README.md). Produkter utan ifylld SE-kostnad räknas som "utan quote".

const KOL = {
  namn: 3, notering: 4, market: 8,
  seKostnad: 9, seFrakt: 10, seTotal: 11,
  butikslank: 12, temu: 13, variant: 16,
};

// Landsblocken hittas i HUVUDET, aldrig hårdkodat: arken har olika många kolumner
// före NORWAY (batch 6 hade Qty på 17, batch 7 på 18). Hårdkodning läste
// fraktkostnaden som totalpris och halverade Norges inköpspris. (2026-09-09)
const LANDNAMN = { NORWAY: 'NO', FINLAND: 'FI', DENMARK: 'DK', UK: 'UK', US: 'US' };

function hittaLandsblock(rader) {
  const huvud = rader.find((r) => r.some((c) => /^NORWAY$/i.test((c || '').trim())));
  const under = huvud ? rader[rader.indexOf(huvud) + 1] : null;
  if (!huvud || !under) throw new Error('hittar inte landsblocken i offertens huvud');
  const block = {};
  for (let i = 0; i < huvud.length; i++) {
    const kod = LANDNAMN[(huvud[i] || '').trim().toUpperCase()];
    if (!kod || block[kod] !== undefined) continue;
    // Qty-kolumnen är den första "Qty" i underhuvudet på eller efter landrubriken
    const qty = under.findIndex((c, j) => j >= i && /^qty$/i.test((c || '').trim()));
    if (qty !== -1) block[kod] = qty;
  }
  return block;
}

/** Minimal CSV-läsare som klarar citerade fält med komma och radbrytningar. */
export function csvTillRader(text) {
  const rader = [], falt = [];
  let cur = '', iCitat = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (iCitat) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else iCitat = false; }
      else cur += c;
    } else if (c === '"') iCitat = true;
    else if (c === ',') { falt.push(cur); cur = ''; }
    else if (c === '\n') { falt.push(cur); rader.push([...falt]); falt.length = 0; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur || falt.length) { falt.push(cur); rader.push(falt); }
  return rader;
}

const tal = (v) => {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s || /overweight|oversize|per piece/i.test(s)) return null;
  // Arket har enstaka trasiga tal som "29.19.00" — ta de två första delarna
  const m = /^(\d+)[.,](\d{1,2})(?:[.,]\d+)?$/.exec(s) || /^(\d+)$/.exec(s);
  if (!m) return null;
  return Number(m[2] === undefined ? m[1] : `${m[1]}.${m[2]}`);
};

export function lasOffert(text) {
  const rader = csvTillRader(text);
  const LAND = hittaLandsblock(rader);
  const produkter = [];
  for (let i = 0; i < rader.length; i++) {
    const r = rader[i];
    const namn = (r[KOL.namn] || '').trim();
    if (!namn || namn === 'product name') continue;

    const q1 = r, q2 = rader[i + 1] || [], q3 = rader[i + 2] || [];
    const land = {};
    for (const [kod, qty] of Object.entries(LAND)) {
      land[kod] = { kostnad: tal(q1[qty + 1]), frakt: tal(q1[qty + 2]), total: tal(q1[qty + 3]),
                    leverans: (q1[qty + 4] || '').trim() || null, metod: (q1[qty + 5] || '').trim() || null,
                    // "1(2pcs)" i Qty-rutan betyder att offerten avser ett flerpack
                    qtyText: (q1[qty] || '').trim() || null };
    }
    land.SE = { kostnad: tal(q1[KOL.seKostnad]), frakt: tal(q1[KOL.seFrakt]), total: tal(q1[KOL.seTotal]),
                leverans: null, metod: null };

    const notering = (q1[KOL.notering] || '').trim();
    const harQuote = land.SE.total != null || Object.values(land).some((l) => l.total != null);
    produkter.push({
      namn, notering: notering || null,
      temu: (q1[KOL.temu] || '').trim() || null,
      variant: (q1[KOL.variant] || '').trim() || null,
      butikslank: (q1[KOL.butikslank] || '').trim() || null,
      land, harQuote,
      flerpack: (() => { const m = /\((\d+)\s*(?:pcs|st|pack)\)/i.exec(Object.values(land).map((l) => l.qtyText || '').join(' ')); return m ? Number(m[1]) : null; })(),
      // qty 2/3 sparas bara för spårbarhet — används ALDRIG som styckpris
      qty2SeTotal: tal(q2[KOL.seTotal]), qty3SeTotal: tal(q3[KOL.seTotal]),
    });
  }
  return produkter;
}

/** Rensar Temu-URL:en från spårningsparametrar. */
export const renUrl = (u) => (u || '').split('?')[0].trim();

/** Kort mappnamn för bildskörden, ur produktnamnet. */
export const mappnamn = (namn) =>
  namn.toLowerCase()
    .replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/é/g, 'e')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

// Körs den direkt: skriv ut en översikt
if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  if (!arg) { console.error('Användning: node temu/offert.mjs <fil.csv | google-sheets-länk>'); process.exit(1); }
  let text;
  if (/^https?:/.test(arg)) {
    const id = /\/d\/([a-zA-Z0-9_-]+)/.exec(arg)?.[1];
    if (!id) throw new Error('Hittar inget ark-ID i länken');
    const r = await fetch(`https://docs.google.com/spreadsheets/d/${id}/export?format=csv`);
    if (!r.ok) throw new Error(`Kunde inte hämta arket (HTTP ${r.status}). Är det delat med "alla med länken"?`);
    text = await r.text();
  } else {
    text = (await import('node:fs')).readFileSync(arg, 'utf8');
  }
  const p = lasOffert(text);
  const med = p.filter((x) => x.harQuote), utan = p.filter((x) => !x.harQuote);
  console.log(`\n${p.length} produkter i arket — ${med.length} med quote, ${utan.length} utan\n`);
  console.log('MED QUOTE (dessa körs):');
  for (const x of med) {
    const l = x.land;
    console.log(`  • ${x.namn}`);
    console.log(`      SE ${l.SE.total ?? '—'}  NO ${l.NO.total ?? '—'}  DK ${l.DK.total ?? '—'}  FI ${l.FI.total ?? '—'}  UK ${l.UK.total ?? '—'}   (USD, qty 1)`);
    console.log(`      ${renUrl(x.temu) || 'INGEN TEMU-LÄNK'}`);
    if (x.variant) console.log(`      varianter: ${x.variant.replace(/\n/g, ' / ')}`);
    if (x.flerpack) console.log(`      ⚠️ offerten avser ett ${x.flerpack}-PACK`);
    if (x.notering) console.log(`      notering: ${x.notering}`);
  }
  console.log('\nUTAN QUOTE (hoppas över):');
  for (const x of utan) console.log(`  · ${x.namn}${x.notering ? `  — ${x.notering}` : ''}`);
  console.log();
}
