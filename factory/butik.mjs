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
const HANDLE = /^[a-z0-9-]+$/;

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const tal = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const objekt = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const satt = (v) => v !== undefined && v !== null && v !== '';

// NISCHBUTIK (AdventLane 2026-09-10, Axels beslut i /ny-ops-prompten): en
// butik som ska rymma fler produkter senare byggs som flerproduktsbutik
// redan med sin första produkt — kollektionen skapas, startsidan visar
// kollektionen och huvudmenyn får kollektionsraden. Annars byggs butiken om
// när produkt nr 2 kommer. Signalen är `butik.kollektion.alltid: true`;
// utan den avgör antalet produktfiler som förr (två eller fler = kollektion).
// `butik` får vara hela konfigen eller bara butik:-blocket; `produkter` en
// lista eller ett antal.
export function arNischbutik(butik, produkter) {
  const bu = butik?.butik ?? butik ?? {};
  const antal = Array.isArray(produkter) ? produkter.filter(Boolean).length : Number(produkter) || 0;
  return antal > 1 || bu?.kollektion?.alltid === true;
}

// butik.marknader — raderna marknad.mjs bygger marknad + locale + webPresence
// av, och som butik.mjs/policyer.mjs skriver fraktländerna ur. Tom lista är
// en varning (marknad.mjs stoppar först i steg 16), fel form är ett fel.
export function kontrolleraMarknader(marknader) {
  const fel = [];
  const varningar = [];
  if (!satt(marknader)) {
    varningar.push('butik.marknader är tom — SE + NO är standard i varje OPS (steget marknad stoppar utan)');
    return { fel, varningar };
  }
  if (!Array.isArray(marknader)) return { fel: ['butik.marknader måste vara en lista med land/locale/valuta'], varningar };
  if (lista(marknader).length === 0) {
    varningar.push('butik.marknader är tom — SE + NO är standard i varje OPS (steget marknad stoppar utan)');
  }
  lista(marknader).forEach((m, i) => {
    const plats = `butik.marknader[${i}]`;
    if (!objekt(m)) {
      fel.push(`${plats}: en marknad är ett block med land, locale och valuta`);
      return;
    }
    if (!text(m.land) || !/^[A-Za-z]{2}$/.test(m.land.trim())) fel.push(`${plats}: land ska vara en tvåbokstavskod (NO, DK, FI …)`);
    if (!text(m.locale) || !/^[a-z]{2}(-[A-Za-z]{2})?$/.test(m.locale.trim())) fel.push(`${plats}: locale ska vara en Shopify-locale (nb, da, fi …)`);
    if (satt(m.valuta) && !KANDA_VALUTOR.includes(m.valuta)) {
      fel.push(`${plats}: valuta "${m.valuta}" är okänd (tillåtna: ${KANDA_VALUTOR.join(', ')})`);
    }
  });
  return { fel, varningar };
}

// butik.startsida — copyn startsida.mjs skriver till index.json. Formen
// kontrolleras, aldrig innehållet: tomma fält får neutrala defaults.
export function kontrolleraStartsida(s) {
  const fel = [];
  const varningar = [];
  if (!satt(s)) {
    varningar.push('startsida saknas i butik.yaml — startsidan får bara neutrala defaults ur butikens villkor');
    return { fel, varningar };
  }
  if (!objekt(s)) return { fel: ['startsida måste vara ett block (usp, hero, berattelse …)'], varningar };
  for (const falt of ['usp', 'marquee']) {
    if (satt(s[falt]) && !Array.isArray(s[falt])) fel.push(`startsida.${falt} måste vara en lista`);
  }
  for (const falt of ['hero', 'berattelse', 'galleri', 'statement', 'omdomen', 'trygghet', 'garanti']) {
    if (satt(s[falt]) && !objekt(s[falt])) fel.push(`startsida.${falt} måste vara ett block`);
  }
  if (satt(s.faq) && !Array.isArray(s.faq)) fel.push('startsida.faq måste vara en lista med fraga/svar');
  lista(s.faq).forEach((f, i) => {
    if (!objekt(f) || !text(f.fraga)) fel.push(`startsida.faq[${i}]: fraga saknas`);
  });
  const kolumner = lista(s.galleri?.kolumner);
  if (kolumner.length > 3) fel.push(`startsida.galleri.kolumner har ${kolumner.length} rader — max 3`);
  for (const falt of ['berattelse', 'trygghet', 'garanti']) {
    const t = s[falt]?.text;
    if (satt(t) && !Array.isArray(t) && typeof t !== 'string') fel.push(`startsida.${falt}.text är en lista med stycken (eller en sträng)`);
  }
  return { fel, varningar };
}

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

  // --- Fälten resten av kedjan läser ur butik: (KEDJAN.md regel 7) ---
  const bu = b?.butik ?? {};
  // moms_i_pris: dokumenterar hur break-even ska räknas (OPS-butikerna säljer
  // MED moms, Bäverbutiken utan). Bara true/false är tillåtet.
  if (satt(bu.moms_i_pris) && typeof bu.moms_i_pris !== 'boolean') fel.push('butik.moms_i_pris är true eller false');
  if (!satt(bu.moms_i_pris)) varningar.push('butik.moms_i_pris är inte satt (true = priserna inkluderar skatt)');
  // markorer_sv: butikens egna svenska ord som aldrig får stå kvar på /nb.
  // Utan listan hoppar kundvyn över markörskanningen och rapporterar manuellt.
  if (satt(bu.markorer_sv)) {
    if (!Array.isArray(bu.markorer_sv)) fel.push('butik.markorer_sv måste vara en lista med ord');
    else if (lista(bu.markorer_sv).some((m) => typeof m !== 'string')) fel.push('butik.markorer_sv: varje rad är ett ord eller en fras');
  }
  if (lista(bu.markorer_sv).length === 0) {
    varningar.push('butik.markorer_sv saknas — kundvyns markörskanning på översatta sidor blir manuell');
  }
  const mk = kontrolleraMarknader(bu.marknader);
  fel.push(...mk.fel);
  varningar.push(...mk.varningar);
  // kollektion: bara flerproduktsbutiker. Finns blocket ska handle + titel finnas.
  if (satt(bu.kollektion)) {
    if (!objekt(bu.kollektion)) fel.push('butik.kollektion måste vara ett block med handle och titel');
    else {
      if (!text(bu.kollektion.handle)) fel.push('butik.kollektion.handle saknas');
      else if (!HANDLE.test(bu.kollektion.handle.trim())) {
        fel.push(`butik.kollektion.handle "${bu.kollektion.handle}" får bara ha små bokstäver, siffror och bindestreck`);
      }
      if (!text(bu.kollektion.titel)) fel.push('butik.kollektion.titel saknas');
      if (satt(bu.kollektion.alltid) && typeof bu.kollektion.alltid !== 'boolean') {
        fel.push('butik.kollektion.alltid är true/false (true = nischbutik: kollektionen byggs även med en produkt)');
      }
    }
  }
  // startsida ligger på toppnivå i mallen; en fil som lagt den under butik:
  // accepteras också (samma form).
  const ss = kontrolleraStartsida(b?.startsida ?? bu.startsida);
  fel.push(...ss.fel);
  varningar.push(...ss.varningar);

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
  // Länderna butiken faktiskt postar till, i klartext. Norge ska SYNAS i
  // kundvyn (Axels beslut 2026-09-08) — en norsk besökare ska aldrig behöva
  // gissa om vi skickar dit, och "Fri frakt" utan land svarar inte på det.
  const LANDNAMN = { NO: 'Norge', DK: 'Danmark', FI: 'Finland', SE: 'Sverige', GB: 'Storbritannien' };
  const lander = [
    text(b?.butik?.huvudmarknad) ?? 'Sverige',
    ...(b?.butik?.marknader ?? []).map((m) => LANDNAMN[m.land] ?? m.land).filter(Boolean),
  ];

  return {
    tid: produktLeveranstid ?? text(f.leveranstid),
    kostnad: fri ? 0 : (tal(f.standardpris) ?? 0),
    gratis_over: fri ? 0 : (tal(f.fri_over) ?? 0),
    lander: [...new Set(lander)],
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
    ekonomi: {
      ...p.ekonomi,
      valuta: text(p.ekonomi?.valuta) ?? text(b.valuta),
      // Följer med så valideringen kan visa nettotalen bredvid (aldrig i
      // stället för) break-even rakt på priset — BESLUT-VANTAR.md punkt 1.
      ...(typeof b.moms_i_pris === 'boolean' ? { moms_i_pris: b.moms_i_pris } : {}),
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
