// Marknadstabellen för takskyddets fyra engelskspråkiga marknader i Magiborsten UK.
//
// ⚠️ PRISERNA ÄR AVLÄSTA SOM KUND I VARJE LAND 2026-09-17, aldrig omräknade av mig:
//   POST https://carashell.com/localization  (country_code=<kod>&language_code=en)
//   GET  https://carashell.com/products/takskyddet.json
// Shopify räknar om från SEK med sin egen kurs och avrundar; de fasta priserna i
// prislistan finns bara för USD. ⚠️ Rör kursen sig mycket kan butikens pris ändras —
// läs om priserna innan nästa runda och jämför med tabellen nedan.
//
// Fraktraden är butikens egen text, läst på produktsidan i samma körning
// ("Free shipping to the UK" / "to Canada" / "to Australia" / "to New Zealand",
// plus "Free shipping to all countries" och "90-day guarantee" på alla fyra).

export const MARKNADER = Object.freeze({
  GB: {
    kod: 'GB', land: 'the UK', landEn: 'the UK', valuta: 'GBP',
    pris: '£152', jamforpris: '£191', spar: '£39',
    pris_tal: 'one hundred fifty-two pounds', pris_tal_kort: 'a hundred and fifty-two pounds',
    jamforpris_tal: 'one hundred ninety-one pounds', spar_tal: 'thirty-nine pounds',
    frakt: 'Free shipping to the UK', kampanjer: ['120251463790410435', '120251471243740435'],
  },
  CA: {
    kod: 'CA', land: 'Canada', landEn: 'Canada', valuta: 'CAD',
    pris: 'CA$284', jamforpris: 'CA$356', spar: 'CA$72',
    pris_tal: 'two hundred eighty-four dollars', pris_tal_kort: 'two hundred eighty-four dollars',
    jamforpris_tal: 'three hundred fifty-six dollars', spar_tal: 'seventy-two dollars',
    frakt: 'Free shipping to Canada', kampanjer: ['120251464335880435', '120251471271400435'],
  },
  AU: {
    kod: 'AU', land: 'Australia', landEn: 'Australia', valuta: 'AUD',
    pris: 'A$286', jamforpris: 'A$358', spar: 'A$72',
    pris_tal: 'two hundred eighty-six dollars', pris_tal_kort: 'two hundred eighty-six dollars',
    jamforpris_tal: 'three hundred fifty-eight dollars', spar_tal: 'seventy-two dollars',
    frakt: 'Free shipping to Australia', kampanjer: ['120251464373380435', '120251471312320435'],
  },
  NZ: {
    kod: 'NZ', land: 'New Zealand', landEn: 'New Zealand', valuta: 'NZD',
    pris: 'NZ$355', jamforpris: 'NZ$444', spar: 'NZ$89',
    pris_tal: 'three hundred fifty-five dollars', pris_tal_kort: 'three hundred fifty-five dollars',
    jamforpris_tal: 'four hundred forty-four dollars', spar_tal: 'eighty-nine dollars',
    frakt: 'Free shipping to New Zealand', kampanjer: ['120251464399510435', '120251471347220435'],
  },
});

export const KODER = Object.keys(MARKNADER);

/** Kampanjerna, per id: vilken marknad de gäller och vilken sorts kampanj det är. */
export const KAMPANJER = Object.freeze({
  '120251463790410435': { marknad: 'GB', namn: 'UK Taköverdrag CARASHELL', sort: 'produkt' },
  '120251471243740435': { marknad: 'GB', namn: 'UK LISTICLE Taköverdrag CARASHELL', sort: 'listicle' },
  '120251464335880435': { marknad: 'CA', namn: 'CA Taköverdrag CARASHELL', sort: 'produkt' },
  '120251471271400435': { marknad: 'CA', namn: 'CA LISTICLE Taköverdrag CARASHELL', sort: 'listicle' },
  '120251464373380435': { marknad: 'AU', namn: 'AU Taköverdrag CARASHELL', sort: 'produkt' },
  '120251471312320435': { marknad: 'AU', namn: 'AU LISTICLE Taköverdrag CARASHELL', sort: 'listicle' },
  '120251464399510435': { marknad: 'NZ', namn: 'NZ Taköverdrag CARASHELL', sort: 'produkt' },
  '120251471347220435': { marknad: 'NZ', namn: 'NZ LISTICLE Taköverdrag CARASHELL', sort: 'listicle' },
});

// Det som INTE byts, och varför (kontrollerat mot butiken 2026-09-17):
//   20%           rabatten är 20,0–20,4 % på alla fyra marknaderna — "20% off" är sant
//   90-day        butiken skriver själv "90-day guarantee" på produktsidan i alla fyra länderna
//   16 reviews    samma carashell.com, samma recensioner
//   21.3 × 9.8 ft produktens mått
//   5–10 business days  butikens egen leveranstid

/**
 * Byter pris och fraktland i en engelsk annonstext. Deterministisk med flit:
 * en modell som skriver om texten kan ändra annat, och Axels order var att bara
 * priserna skulle bli rätt. Returnerar { text, byten: [...] }.
 */
export function bytPris(text, kod) {
  const m = MARKNADER[kod];
  if (!m) throw new Error(`Okänd marknad "${kod}"`);
  const byten = [];
  let t = String(text ?? '');
  const ers = (re, till, vad) => {
    t = t.replace(re, (träff) => { byten.push({ vad, fran: träff, till }); return till; });
  };
  // Priserna först — längsta strängen först så "$249" aldrig delträffar.
  ers(/\$249/g, m.jamforpris, 'jämförpris');
  ers(/\$199/g, m.pris, 'pris');
  ers(/\$50\b/g, m.spar, 'besparing');
  // Fraktlandet. "free shipping in the US" → "free shipping to <land>"; versalisering behålls.
  t = t.replace(/([Ff]ree shipping) in the US/g, (_, f) => { byten.push({ vad: 'frakt', fran: `${f} in the US`, till: `${f} to ${m.land}` }); return `${f} to ${m.land}`; });
  return { text: t, byten };
}

/**
 * Kvarvarande US-spår i en text (kontrollen efter bytet). Marknadens EGNA
 * prisprefix (CA$, A$, NZ$) räknas inte som dollar — utan undantaget larmar
 * kontrollen på varje rätt pris den själv just skrivit.
 */
export function kvarUS(text, kod = null) {
  const m = kod ? MARKNADER[kod] : null;
  let t = String(text ?? '');
  if (m) {
    // Maskera marknadens egna priser innan sökningen.
    for (const p of [m.pris, m.jamforpris, m.spar]) t = t.split(p).join('‹pris›');
    t = t.replace(/(CA|A|NZ)\$\d[\d,.]*/g, '‹pris›');
  }
  const fynd = [];
  for (const re of [/\$\s?\d[\d,.]*/g, /\bUSD\b/g, /in the US\b/g, /\bUS\b(?!\$)/g]) {
    for (const x of t.match(re) || []) fynd.push(x);
  }
  return fynd;
}
