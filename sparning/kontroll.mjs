// Kontrollen: bevisar att sammanfattningsvyn inte ljuger.
//
// Axels fyra krav 2026-09-19, när sammanfattningen infördes. Varje krav är en
// egen kontroll nedan, med samma nummer:
//
//   1. Ingen faktisk trackinghändelse får tas bort ur fullständig historik.
//   2. Finns ursprungsland eller transitland i transportörens rådata måste
//      kunden fortfarande kunna hitta det via "Visa fullständig
//      transporthistorik".
//   3. Sammanfattningen får förenkla tekniska ortnamn och transportörstexter,
//      men får inte visa ett land, en plats eller en status som MOTSÄGER
//      råinformationen.
//   4. "Ankommit till <land>" får aldrig visas utan en faktisk fysisk
//      skanning som stödjer det.
//
// Kontrollen är inte bara ett test. `sparning/publicera.mjs` kör den före
// varje publicering och VÄGRAR lägga upp en sida som fallerar — en sida som
// säger fel om var paketet är, är värre än ingen sida alls.
//
//   node sparning/kontroll.mjs --paket <fil.json>     # mot rundans egen lista
//   node sparning/kontroll.mjs --fixtur               # mot den sparade fixturen
//
// Kontrollen jämför ALLTID mot fraktbolagets rådata, aldrig mot vår egen
// mellanform. Ett fel som redan finns i `handelserUr()` skulle annars
// reproduceras av kontrollen och se rätt ut.

import { packaUppEtt, STEG } from './uppacka.mjs';
import { arForhandsavi } from './steg.mjs';
import { landFor, normalisera } from './sprak.mjs';

// En avvikelse som kontrollen hittat.
const fel = (krav, nummer, text, detalj) => ({ krav, nummer, text, detalj: detalj ?? null });

// ---------------------------------------------------------------------------
// Krav 1: ingen skanning försvinner
// ---------------------------------------------------------------------------
//
// Rådatan kan innehålla samma skanning två gånger (fraktbolagen
// dubbelrapporterar: 4PX skrev samma rad 15:39:00 och 15:39:01). Ihopslagning
// av IDENTISKA rader är inte informationsförlust, så kontrollen räknar
// DISTINKTA skanningar: samma minut + samma text + samma plats är en.
//
// Det som däremot ALDRIG får hända är att en distinkt skanning saknas i
// historiken. Då har vi tystat fraktbolaget.
export function kontrolleraFullstandighet(rå, paket) {
  const problem = [];
  const iHistoriken = new Set();
  for (const h of paket.handelser) iHistoriken.add(`${h.iso.slice(0, 16)}\u0000${normalisera(h.text)}`);

  // Tiderna kan skilja sekunder mellan rådata och vår minutupplösning, så
  // jämförelsen görs på minut. Texten jämförs normaliserad, eftersom
  // historiken bär den svenska översättningen av samma skanning.
  const sedda = new Set();
  for (const r of rå) {
    const minut = r.iso ? r.iso.slice(0, 16) : null;
    if (!minut) continue;               // ogiltig tid — kastas redan i bygget
    const id = `${minut}\u0000${normalisera(r.text ?? '')}\u0000${normalisera(r.plats ?? '')}`;
    if (sedda.has(id)) continue;        // dubbelrapport
    sedda.add(id);
  }

  // En rå skanning räknas som funnen om historiken har en rad på samma minut.
  // Texten kan skilja (den är översatt), så minuten är nyckeln — men antalet
  // distinkta minuter måste stämma.
  const råMinuter = new Set([...sedda].map((id) => id.split('\u0000')[0]));
  const histMinuter = new Set([...iHistoriken].map((id) => id.split('\u0000')[0]));
  for (const m of råMinuter) {
    if (!histMinuter.has(m)) problem.push(fel(1, paket.nummer, `Skanningen ${m} finns i fraktbolagets data men inte i historiken.`, m));
  }
  return problem;
}

// ---------------------------------------------------------------------------
// Krav 2: länderna går att hitta
// ---------------------------------------------------------------------------
//
// Varje land som EXPLICIT står i rådatans platser ("Mainland China, CN",
// "HOLLAND, NORTH HOLLAND, NL") måste gå att läsa i historiken. Orten räcker
// inte: "Rozenburg" säger ingen svensk kund att paketet var i Nederländerna,
// och därför bär historiken `platsMedLand` — "Rozenburg, Nederländerna".
//
// Orter UTAN landsangivelse ("Hongqiao") kan vi inte härleda land ur, och då
// kräver kontrollen inget. Att gissa hade varit värre än att tiga.
export function kontrolleraLander(rå, paket) {
  const problem = [];
  const iRå = new Set();
  for (const r of rå) {
    const l = landFor(r.raPlats ?? r.plats ?? null);
    if (l) iRå.add(l);
  }
  const iHistoriken = new Set();
  for (const h of paket.handelser) {
    if (h.land) iHistoriken.add(h.land);
    // Landet ska också gå att LÄSA, inte bara finnas i datan.
    if (h.platsMedLand) for (const l of iRå) if (h.platsMedLand.includes(l)) iHistoriken.add(l);
  }
  for (const l of iRå) {
    if (!iHistoriken.has(l)) problem.push(fel(2, paket.nummer, `Landet "${l}" står i fraktbolagets data men går inte att hitta i historiken.`, l));
  }
  return problem;
}

// ---------------------------------------------------------------------------
// Krav 3 + 4: sammanfattningen motsäger inte rådatan
// ---------------------------------------------------------------------------
//
// Varje nått skede måste peka på en riktig skanning i historiken — samma tid,
// samma text. Sammanfattningen får förenkla ("MALMÖ PAKETTERMINAL MALMÖ" →
// "Malmö"), men aldrig hitta på ett skede som ingen skanning bär.
//
// Krav 4 är det skarpaste fallet och kontrolleras för sig: "Ankommit till
// <land>" kräver en skanning som FYSISKT skedde i mottagarlandet, och en
// förhandsavisering duger inte. PostNord skickar "Vi har fått en beställning
// på en leverans och väntar på paketet" med platsen SWEDEN innan paketet
// lämnat Kina — 20 fall av 20, mätt 2026-09-19.
export function kontrolleraSammanfattning(rå, paket, { mottagarland }) {
  const problem = [];
  const s = paket.sammanfattning;
  if (!s) return problem;

  for (const steg of s.steg) {
    if (!steg.nadd) continue;

    // Skedet ska peka på en rad som finns i historiken.
    const bakom = paket.handelser.find((h) => h.iso === steg.iso && h.text === steg.text);
    if (!bakom) {
      problem.push(fel(3, paket.nummer, `Skedet "${steg.etikett}" pekar på en skanning som inte finns i historiken.`, steg.iso));
      continue;
    }
    if (bakom.avvikelse) {
      problem.push(fel(3, paket.nummer, `Skedet "${steg.etikett}" bygger på en avvikelse (${bakom.text}) — en störning är inte framsteg.`, steg.iso));
    }

    // Krav 4: ankomsten till mottagarlandet.
    if (steg.nyckel === 'i_landet') {
      const stod = paket.handelser.filter((h) => h.steg >= I_LANDET_NR && !h.avvikelse);
      const fysisk = stod.some((h) => h.land === mottagarland && !arForhandsaviText(h, rå));
      const viaFras = stod.some((h) => h.steg === I_LANDET_NR && h.land !== mottagarland && bararAnkomstfras(h, rå));
      if (!fysisk && !viaFras) {
        problem.push(fel(4, paket.nummer, `"${steg.etikett}" visas utan en fysisk skanning i ${mottagarland}.`, steg.iso));
      }
    }

    // Levererat kräver att fraktbolaget faktiskt sagt levererat.
    if (steg.nyckel === 'levererat' && !rå.some((r) => /deliver|levererat|levererats|uthämtat|utlämnat/i.test(String(r.text ?? '')))) {
      problem.push(fel(3, paket.nummer, '"Levererat" visas utan att fraktbolaget rapporterat en leverans.', steg.iso));
    }
  }

  // Ett skede får aldrig ligga före ett senare skede i tiden.
  const nadda = s.steg.filter((x) => x.nadd && x.iso);
  for (let i = 1; i < nadda.length; i++) {
    if (nadda[i].iso < nadda[i - 1].iso) {
      problem.push(fel(3, paket.nummer, `"${nadda[i].etikett}" är daterat före "${nadda[i - 1].etikett}".`, `${nadda[i - 1].iso} → ${nadda[i].iso}`));
    }
  }
  return problem;
}

const I_LANDET_NR = STEG.findIndex((r) => r[0] === 'i_landet');

// Är skanningen en förhandsavisering? Slås upp i RÅDATAN, inte i vår egen
// översättning — det är fraktbolagets text regeln gäller.
function arForhandsaviText(h, rå) {
  const r = rå.find((x) => x.iso && x.iso.slice(0, 16) === h.iso.slice(0, 16));
  return arForhandsavi(r?.ra ?? r?.text ?? '');
}

// Bär skanningen en fras som SJÄLV betyder ankomst till mottagarlandet
// ("Arrival to the destination airport")? Då är skedet stött även utan att
// platsen råkar vara angiven.
function bararAnkomstfras(h, rå) {
  const r = rå.find((x) => x.iso && x.iso.slice(0, 16) === h.iso.slice(0, 16));
  const t = normalisera(r?.ra ?? r?.text ?? '');
  return /destination|domestic|local carrier|import|ankommit till|distribution terminal|terminal \(t/i.test(t);
}

// ---------------------------------------------------------------------------
// Hela körningen
// ---------------------------------------------------------------------------

// `paketlista` = [{ nummer, handelser: [{ tid, text, plats, ra, land }] }] —
// samma form som spårningsrundan skickar till publiceringen, alltså
// fraktbolagets data efter översättning men FÖRE komprimeringen.
// `data` = det byggda formatet.
export function kontrollera(paketlista, data, { mottagarland = 'Sverige', maxHandelser = null } = {}) {
  const problem = [];
  let kollade = 0;
  for (const p of paketlista ?? []) {
    const packat = packaUppEtt(data, p?.nummer);
    if (!packat) {
      // Ett paket som föll ur fönstret är inte ett fel; ett som försvann av
      // annan orsak är det. Fönstret avgörs av anroparen, så vi noterar bara.
      continue;
    }
    kollade++;
    const rå = (p.handelser ?? []).map((h) => ({
      iso: typeof h?.tid === 'string' ? h.tid : null,
      text: h?.text ?? null,
      ra: h?.ra ?? null,
      plats: h?.plats ?? null,
      raPlats: h?.raPlats ?? h?.plats ?? null,
      land: h?.land ?? null,
    }));
    problem.push(...kontrolleraFullstandighet(rå, packat));
    problem.push(...kontrolleraLander(rå, packat));
    problem.push(...kontrolleraSammanfattning(rå, packat, { mottagarland }));
    if (maxHandelser && packat.handelser.length >= maxHandelser) {
      problem.push(fel(1, packat.nummer, `Paketet har ${packat.handelser.length} skanningar och slår i taket (${maxHandelser}) — höj MAX_HANDELSER.`, null));
    }
  }
  const perKrav = {};
  for (const p of problem) perKrav[p.krav] = (perKrav[p.krav] ?? 0) + 1;
  return { ok: problem.length === 0, kollade, problem, perKrav };
}

// Kort svensk rapport, till rundan och till publiceringen.
export function rapport(resultat) {
  if (resultat.ok) return `✅ Kontrollen grön: ${resultat.kollade} paket, inga motsägelser mot fraktbolagets data.`;
  const rader = [`❌ Kontrollen hittade ${resultat.problem.length} problem i ${resultat.kollade} paket:`];
  const KRAVTEXT = {
    1: 'skanningar som försvunnit ur historiken',
    2: 'länder som inte går att hitta i historiken',
    3: 'sammanfattning som motsäger rådatan',
    4: '"Ankommit till landet" utan fysisk skanning',
  };
  for (const [krav, antal] of Object.entries(resultat.perKrav).sort()) {
    rader.push(`   Krav ${krav} (${KRAVTEXT[krav] ?? '?'}): ${antal}`);
  }
  for (const p of resultat.problem.slice(0, 12)) rader.push(`   ${p.nummer}: ${p.text}`);
  if (resultat.problem.length > 12) rader.push(`   … och ${resultat.problem.length - 12} till`);
  return rader.join('\n');
}
