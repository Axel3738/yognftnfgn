// Butikskonfigen: allt som gäller hela butiken, inte en enskild produkt.
//
// Produktfilen beskriver produkten. Butiksfilen beskriver företaget bakom —
// bolagsnamn, valuta, frakt, returvillkor. Nästa produkt ärver hela setupen
// utan att någon skriver in bolagsuppgifter en gång till.
//
// `sammanfoga(butik, produkt)` väver ihop dem till den form resten av fabriken
// läser (policyer, metafält, sidmall), så inget annat behöver veta om delningen.

import { readFileSync } from 'node:fs';
import { lasYaml } from './yaml.mjs';
import { fraktraderForKund } from './frakt.mjs';

const KANDA_VALUTOR = ['SEK', 'NOK', 'DKK', 'EUR', 'USD', 'GBP'];

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const tal = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function valideraButik(b) {
  const fel = [];
  const varningar = [];

  for (const falt of ['id', 'brand', 'bolagsnamn', 'orgnr', 'adress', 'supportmail', 'huvudmarknad']) {
    if (!text(b?.butik?.[falt])) fel.push(`butik.${falt} saknas`);
  }
  if (!text(b?.butik?.land)) fel.push('butik.land saknas');
  if (!text(b?.butik?.valuta)) {
    fel.push('butik.valuta saknas');
  } else if (!KANDA_VALUTOR.includes(b.butik.valuta)) {
    fel.push(`butik.valuta "${b.butik.valuta}" är okänd (tillåtna: ${KANDA_VALUTOR.join(', ')})`);
  }
  if (text(b?.butik?.supportmail) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.butik.supportmail)) {
    fel.push('butik.supportmail ser inte ut som en mejladress');
  } else if (text(b?.butik?.supportmail) && !/^hello@/i.test(b.butik.supportmail)) {
    fel.push('butik.supportmail ska alltid vara hello@<domän> (Axels beslut 2026-09-08)');
  }
  if (text(b?.butik?.id) && !/^[a-z0-9-]+$/.test(b.butik.id)) {
    fel.push(`butik.id "${b.butik.id}" får bara ha små bokstäver, siffror och bindestreck`);
  }
  // Axels namnregel 2026-09-07, skärpt 2026-09-08: helst ett HELT engelskt
  // brandnamn som svenskar/norrmän ändå kan läsa och uttala. å/ä/ö gör
  // namnet omöjligt som domän och oläsligt utomlands. Varning, inte stopp:
  // Hemvakten byggdes före regeln och befintliga butiker döps inte om.
  if (text(b?.butik?.brand) && /[åäöÅÄÖ]/.test(b.butik.brand)) {
    varningar.push(
      `butik.brand "${b.butik.brand}" innehåller å/ä/ö — namnregeln kräver helst ett helt engelskt namn utan å/ä/ö`
    );
  }

  const f = b?.frakt ?? {};
  if (f.fri_globalt === false && tal(f.standardpris) === null) {
    fel.push('frakt.standardpris krävs när frakt.fri_globalt är false');
  }
  if (f.express?.aktiv && tal(f.express.pris) === null) {
    fel.push('frakt.express.pris saknas fast express är aktiv');
  }

  const r = b?.retur ?? {};
  if (tal(r.oppet_kop_dagar) === null) varningar.push('retur.oppet_kop_dagar är inte satt');
  if (!text(f.leveranstid)) varningar.push('frakt.leveranstid är inte satt');
  if (lista(b?.garantier).length === 0) varningar.push('garantier är tom');

  // Exempeluppgifter får aldrig följa med till en riktig butik.
  const PLATSHALLARE = [/exempelbolaget/i, /556000-0000/, /exempelgatan/i, /example\.com/i];
  for (const [falt, varde] of Object.entries(b?.butik ?? {})) {
    if (typeof varde === 'string' && PLATSHALLARE.some((m) => m.test(varde))) {
      varningar.push(`butik.${falt} innehåller en exempeluppgift`);
    }
  }

  return { fel, varningar };
}

export function lasButik(sokvag) {
  const b = lasYaml(readFileSync(sokvag, 'utf8'));
  const { fel, varningar } = valideraButik(b);
  return { butik: b, fel, varningar };
}

// Fraktraderna som butikskonfigen ger, i den form produktfilen förut bar själv.
function fraktFranButik(b, produktLeveranstid) {
  const f = b?.frakt ?? {};
  const fri = f.fri_globalt !== false;
  const alternativ = [];
  if (f.express?.aktiv) {
    alternativ.push({
      namn: text(f.express.namn) ?? 'Express',
      pris: tal(f.express.pris) ?? 0,
      tid: text(f.express.tid) ?? null,
    });
  }
  return {
    tid: produktLeveranstid ?? text(f.leveranstid),
    kostnad: fri ? 0 : (tal(f.standardpris) ?? 0),
    gratis_over: fri ? 0 : (tal(f.fri_over) ?? 0),
    alternativ,
  };
}

// Butikskonfig + produktfil → den form policyer, metafält och sidmall läser.
// Produktfilen vinner där den säger något; butiken fyller resten.
export function sammanfoga(butik, produkt) {
  const b = butik?.butik ?? {};
  const p = produkt ?? {};
  const leveranstid = text(p.shipping?.tid) ?? text(p.leveranstid);

  return {
    ...p,
    produkt: p.produkt,
    brand: {
      namn: text(p.brand?.namn) ?? text(b.brand),
      domanideer: lista(p.brand?.domanideer),
      org_namn: text(b.bolagsnamn),
      orgnr: text(b.orgnr),
      adress: text(b.adress),
      kontakt_epost: text(b.supportmail),
    },
    // Momsen bor i butikskonfigen och vävs in här, för att skalningsekonomin
    // (factory/ekonomi.mjs) annars skulle behöva gissa den — och en gissning
    // åt fel håll flyttar break-even med tiotals procent.
    ekonomi: {
      ...p.ekonomi,
      valuta: text(p.ekonomi?.valuta) ?? text(b.valuta),
      moms_i_pris: b.moms_i_pris !== false,
      moms_procent: tal(p.ekonomi?.moms_procent) ?? tal(b.moms_procent) ?? 25,
    },
    shipping: fraktFranButik(butik, leveranstid),
    // Kundtexten om frakt härleds ur samma konfig som zonerna i kassan, så
    // sidan omöjligt kan säga något annat än vad kunden faktiskt betalar.
    fraktrader: fraktraderForKund(butik, leveranstid),
    // Butikens basgarantier först, produktens egna efter. Inga dubbletter.
    garantier: [...new Set([...lista(butik?.garantier), ...lista(p.garantier)])],
    retur: butik?.retur ?? {},
    policyText: butik?.policy ?? {},
    // Brand-configen: butikens egen visuella identitet. Återanvänds ALDRIG
    // mellan butiker — varje butik brandas från noll (factory/branding.mjs).
    branding: butik?.branding ?? null,
  };
}
