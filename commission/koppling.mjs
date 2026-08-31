// koppling.mjs — vem gjorde annonsen?
//
// Ren logik, ingen I/O. Två steg, i den här ordningen:
//
//   1. HUBBEN, per annons. Annonsen matchas mot en rad i en creative hub som
//      har någon i Ansvarig. Två namnsystem finns i kontona:
//        Bäverbutiken   Enginecover_PD_22_H1  -> raden heter likadant
//        Grillkliniken  "235 H1"              -> raden heter "235"
//   2. PRODUKTEN, per kampanj. Hittas ingen hubbrad matchas kampanjnamnet mot
//      produkten i "Product test center SE BÄVER", och spenden går till
//      produktens ägare.
//
// Hubben går alltid först: den är per annons och därmed exaktare än produkten.
//
// (Incident 2026-08-31: rutinen läste bara Bäverbutikens hubbar, bara rader med
// Typ "Pending Approval", och kunde varken sifferschemat eller produkterna.
// Resultatet blev 33,74 kr i stället för drygt 2 200 kr, och tre av fem
// redigerare fick noll.)

/** Statusen spelar ingen roll — en rad med Ansvarig är gjord av någon oavsett
 *  var i flödet den står. Det enda som utesluts är rader helt utan Ansvarig. */

/** Löpnumret först i ett namn: "235 H1" → "235", "128 b2" → "128".
 *  "B69 LISTICLE" ger null — det är inget löpnummer. */
export function nummer(namn) {
  return (String(namn ?? '').trim().match(/^(\d{1,4})\b/) || [])[1] ?? null;
}

/** En rad som handlar om att ÖVERSÄTTA en creative är inte den svenska creativen.
 *  "129 to norwegian" och "Translation 115" ska aldrig ärva den svenska spenden —
 *  det jobbet gjorde någon annan. Sådana rader används bara om ingen annan finns. */
export function arOversattning(namn) {
  // "translat" måste tillåtas fortsätta ("Translation 115"), därför \w* i stället
  // för ett avslutande \b — annars matchar ordet aldrig.
  return /\btranslat\w*|\b(to\s+(norwegian|english|danish|finnish)|norwegian|english|engelsk|norska|danska|finska)\b/i
    .test(String(namn ?? ''));
}

/** Notion-titlar bär ofta briefens beskrivning efter namnet, och Meta-namnet är
 *  bara första ordet: "Trimmerbelt_SP_3_H1 – VIDEO: ..." → "Trimmerbelt_SP_3_H1".
 *  Titlar utan understreck lämnas hela — där är hela titeln namnet. */
export function annonsnamn(titel) {
  const rent = String(titel ?? '').trim();
  const forsta = (rent.split(/\s+/)[0] ?? '').replace(/[–—\-:,.]+$/u, '');
  return forsta.includes('_') ? forsta : rent;
}

export const normalisera = (s) => String(s ?? '').trim().replace(/\s+/g, ' ').toUpperCase();

/**
 * Register över hubbrader med Ansvarig.
 * @param {Array<{namn:string, rader:Array<{namn:string, ansvariga:string[]}>}>} hubbar
 */
export function byggHubbregister(hubbar) {
  const exakt = new Map();
  const perNummer = new Map();
  let rader = 0, oversattningar = 0;

  for (const h of hubbar ?? []) {
    for (const r of h.rader ?? []) {
      if (!r.ansvariga?.length) continue;
      rader++;
      const oversatt = arOversattning(r.namn);
      if (oversatt) oversattningar++;
      const post = { hubb: h.namn, radnamn: r.namn, ansvariga: [...new Set(r.ansvariga)], oversatt };

      const nyckel = normalisera(annonsnamn(r.namn));
      if (!exakt.has(nyckel) || (exakt.get(nyckel).oversatt && !oversatt)) exakt.set(nyckel, post);

      const n = nummer(r.namn);
      // En riktig creative slår alltid en översättningsrad med samma nummer.
      if (n && (!perNummer.has(n) || (perNummer.get(n).oversatt && !oversatt))) perNummer.set(n, post);
    }
  }
  return { exakt, perNummer, rader, oversattningar };
}

// ------------------------------------------------------- Produktmatchning

const rensaKampanj = (s) => String(s ?? '').toLowerCase()
  .replace(/\s*\|.*$/, '')                                  // "| BE ROAS ... | Launch ..."
  .replace(/\s*[–-]\s*kopia\s*$/, '')
  .replace(/\b(abo-test|cbo|ugc axel|brynis lagris|lagerrensingsrea)\b.*$/, '')
  .replace(/\d{2}-\d{2}(-\d{2,4})?/g, '')
  .replace(/[^a-zåäö0-9 ]/g, ' ')
  .replace(/\s+/g, ' ').trim();

/** Bestämd form → stam: "Motorhöljet" → "motorhölj", "Tofflorna" → "toffl". */
const stam = (o) => o.replace(/(erna|orna|arna|arne|en|et|er|na|n|t|a|e)$/, '');

/** Ord som är för generella för att avgöra en matchning på egen hand. */
const SVAGA = new Set(['420d', 'herr', 'mini', 'set', 'frost', 'aluminium', 'pack', 'trådlös']);

const ordAv = (s) => rensaKampanj(s).split(' ')
  .filter((o) => o.length >= 4 && !SVAGA.has(o))
  .map(stam)
  .filter((o) => o.length >= 4);

/**
 * Kampanjnamn → produktens ägare. Returnerar null när ingen produkt är tydligt
 * bäst — hellre okopplat än fel person.
 * @param {string} kampanj
 * @param {Array<{namn:string, ansvarig:string}>} produkter
 */
export function produktAgare(kampanj, produkter) {
  const kOrd = ordAv(kampanj);
  if (!kOrd.length) return null;
  let bast = null, hogsta = 0, nastHogsta = 0;
  for (const p of produkter ?? []) {
    let poang = 0;
    for (const a of kOrd) for (const b of ordAv(p.namn)) {
      if (a === b) poang += 3;
      else if (a.length >= 6 && b.length >= 6 && (a.startsWith(b) || b.startsWith(a))) poang += 2;
    }
    if (poang > hogsta) { nastHogsta = hogsta; hogsta = poang; bast = p; }
    else if (poang > nastHogsta) nastHogsta = poang;
  }
  // Oavgjort mellan två produkter = vi vet inte. Betala aldrig ut på en gissning.
  return hogsta >= 2 && hogsta > nastHogsta ? bast.ansvarig : null;
}

// ---------------------------------------------------------------- Koppling

/**
 * Kopplar en annons till en eller flera personer.
 * @returns {{ansvariga:string[], via:'hubb'|'produkt'}|null}
 */
export function kopplaAnnons(annons, register, produkter) {
  let rad = register.exakt.get(normalisera(annonsnamn(annons.adNamn)));
  if (!rad) {
    const n = nummer(annons.adNamn);
    if (n) rad = register.perNummer.get(n);
  }
  if (rad) return { ansvariga: rad.ansvariga, via: 'hubb', radnamn: rad.radnamn };

  const agare = produktAgare(annons.kampanj, produkter);
  return agare ? { ansvariga: [agare], via: 'produkt' } : null;
}
