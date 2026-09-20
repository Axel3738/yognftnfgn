// Bygger den komprimerade datafilen som spårningssidan läser.
//
// Två steg, med en tydlig gräns emellan:
//
//   1. `handelserUr(post, …)` — ett 17TRACK-svar (ett paket) → en ren kedja
//      svenska händelser, nyast först.
//   2. `byggData(paket, { nu })` — alla paketens kedjor → det ordboks-
//      komprimerade objektet som `sparning/uppacka.mjs` packar upp.
//
// Formatet ÄGS av `sparning/uppacka.mjs` och får inte tolkas om här. Den här
// filen skriver bara det formatet; uppackaren läser det, både i Node och i
// kundens webbläsare. Testerna packar upp det den här filen byggt med
// `packaUppEtt()` — det är kontraktsbeviset.
//
// Varför komprimerat: rått väger 950 paket ~1,1 MB, mest för att samma fras
// ("Shipment information received") och samma plats ("MALMÖ PAKETTERMINAL
// MALMÖ") står om och om igen. Mätt 2026-09-19 på 204 av butikens paket
// (17TRACK /gettrackinfo, YunExpress + 4PX + PostNord): 1 873 händelser,
// 75 distinkta fraser och 92 distinkta platser. Alltså ~25 händelser per
// distinkt fras — ordboken är hela poängen.
//
// Kört hela vägen på just de 204 paketen 2026-09-19, med den riktiga
// ordboken i `sparning/sprak.mjs`: 1 851 händelser kvar efter ihopslagning
// (22 dubbelrapporter slogs ihop), 64 fraser, 82 platser, 0 okända fraser,
// **35 416 tecken** — 174 tecken per paket, alltså ~161 kB för 950 paket.
// Med en genomskinlig ordbok som behåller engelskan blev det 36 515 tecken,
// 14,8 % av samma data utan ordbok. Svenskan kostar alltså ingenting:
// ordboken bär varje fras EN gång.

import { FORMAT, STATUSAR, STANDARDLAND, isoTillMinut, I_LANDET_NR } from './uppacka.mjs';
import { klassificera } from './steg.mjs';
import { klassificeraDelsteg } from './delsteg.mjs';

// Tak per paket. Mätt 2026-09-19 på samma 204 paket: minst 1 händelse, median
// 5, flest 29. Taket är en spärr mot ett enskilt paket som fastnar i en
// slinga hos fraktbolaget, inte en beskärning av det normala.
//
// ⚠️ Höjt 30 → 120 2026-09-19 på Axels krav: "ingen faktisk trackinghändelse
// får tas bort ur fullständig historik". Med 30 låg det mest rapporterade
// paketet en enda skanning från taket, och nästa långsamma leverans hade
// tystat rader utan att någon märkte det. `sparning/kontroll.mjs` larmar om
// ett paket någonsin når taket — då ska det höjas igen, inte accepteras.
export const MAX_HANDELSER = 120;

// Fönstret sidan visar. Ett paket vars senaste skanning är äldre än så här
// många dagar tas bort ur filen — det är levererat sedan länge och ingen
// kund slår upp det. Utan fönstret växer filen obegränsat.
export const FONSTER_DAGAR = 45;

// Två skanningar med samma text och samma plats inom det här spannet räknas
// som EN. Fraktbolagen dubbelrapporterar: 4PX skrev "THE SHIPMENT ITEM IS
// UNDER TRANSPORTATION." i MALMÖ PAKETTERMINAL 15:39:00 och 15:39:01 samma
// dag — samma skanning, skickad två gånger.
//
// ⚠️ Sänkt från en timme till en minut 2026-09-19, på Axels krav att ingen
// faktisk trackinghändelse får tas bort ur fullständig historik. Med en
// timme föll ÄKTA skanningar bort: paketet 4PX3003132969051CN hade samma
// text och plats 03:03 och 03:45, två skilda hanteringar, och den tidigare
// försvann. `sparning/test/kontroll.test.mjs` fällde det.
//
// Formatet har ändå bara minutupplösning, så det som slås ihop nu är exakt
// det som annars hade blivit två identiska rader på samma minut i sidan.
const IHOP_MS = 60 * 1000 - 1;

// Hur långt fram i tiden en tidsstämpel får ligga innan den räknas som
// trasig. Fraktbolagens tidszoner är inte alltid rätt angivna, så en liten
// marginal behövs — men ett datum nästa vecka är ett fel, inte en skanning.
const FRAMTID_MS = 60 * 60 * 1000;

const DYGN_MS = 24 * 60 * 60 * 1000;

// CONFIRMED är reservstatusen när `statusKod` inte finns i STATUSAR. Den är
// den svagaste av dem ("Bekräftad") och ljuger därför minst för kunden.
const RESERVSTATUS = 0;

// ---------------------------------------------------------------------------
// 1. Ett 17TRACK-svar → svenska händelser
// ---------------------------------------------------------------------------

// `post` = ett accepterat svar ur `sparning/17track.mjs` hamta(), alltså
//   { number, carrier, track_info: { latest_status, latest_event,
//     tracking: { providers: [{ events: [{ time_iso, time_utc, description,
//     location, sub_status, stage }] }] } } }
//
// `oversattFras` och `stadaPlats` skickas IN (från `sparning/sprak.mjs`) i
// stället för att importeras, så den här modulen går att testa utan ordboken
// och ordboken går att byta ut utan att röra bygget.
//
// ⚠️ Anropen görs `oversattFras(beskrivning, understatus, { stage, plats })`
// och `stadaPlats(location)`. De extra argumenten är frivilliga för
// ordboken — en `oversattFras(text)` som bara tittar på första argumentet
// fungerar lika bra. Svaret får vara antingen en sträng eller `{ text }`
// (sparning/sprak.mjs lämnar `{ text, kand }`, där `kand` säger om frasen
// stod i ordboken eller härleddes ur understatusen — det avgörandet är
// ordbokens, inte byggets). Ingen översättning ⇒ `null`, och då hoppas
// händelsen över: hellre en kortare kedja än en engelsk rad hos kunden.
//
// Returnerar [{ tid, text, plats }] nyast först, där `tid` är en ISO-sträng
// i UTC och `plats` är en sträng eller null.
export function handelserUr(post, { oversattFras, stadaPlats, landFor, nu = Date.now() } = {}) {
  if (typeof oversattFras !== 'function' || typeof stadaPlats !== 'function') {
    throw new Error('handelserUr(): oversattFras och stadaPlats måste skickas in (de bor i sparning/sprak.mjs).');
  }
  // `nu` måste vara ett tal. Ett `nu: null` gav förut `gransFram = 3 600 000`
  // (null + tal = tal), och DÅ låg varenda verklig skanning "i framtiden" —
  // funktionen lämnade en tom kedja utan att säga ett ord, och paketet såg
  // ut att sakna skanningar. Hellre ett kast som syns.
  if (!Number.isFinite(nu)) {
    throw new Error('handelserUr(): { nu } måste vara millisekunder (utelämna det för Date.now()).');
  }
  const gransFram = nu + FRAMTID_MS;

  // Steg 1: plocka ut, tidsstämpla, översätt. Allt läses defensivt — saknas
  // ett fält blir det null, aldrig ett kast.
  const rader = [];
  for (const rad of raHandelser(post)) {
    const ms = forstaLasbaraTiden(rad.time_iso, rad.time_utc);
    if (ms === null) continue;            // ogiltig tid
    if (ms > gransFram) continue;         // framtida tid ⇒ trasig stämpel

    const plats = renText(fras(stadaPlats(rad.location ?? null)));
    const land = typeof landFor === 'function' ? renText(landFor(rad.location ?? null)) : null;
    const rå = renText(rad.description ?? null);
    let text = renText(fras(oversattFras(
      rad.description ?? null,
      rad.sub_status ?? null,
      { stage: rad.stage ?? null, plats },
    )));
    // ⚠️ Tidigare hoppades raden över när ingen svensk fras fanns. Det bröt
    // Axels krav 2026-09-19 ("ingen faktisk trackinghändelse får tas bort ur
    // fullständig historik"): en skanning med tid och plats men okänd text
    // försvann tyst. Nu behålls den med fraktbolagets egen text — den står
    // bara i den fullständiga historiken, aldrig i sammanfattningen, så
    // kunden möter fortfarande inte engelska i standardvyn.
    if (!text) text = rå;
    if (!text) continue;                  // varken översättning eller rå text

    rader.push({ ms, tid: new Date(ms).toISOString(), text, plats, land, ra: rå });
  }

  // Steg 2: nyast först. Ordningen i svaret är oftast redan så, men den är
  // inte garanterad — 4PX blandar när flera underleverantörer rapporterar.
  rader.sort((a, b) => b.ms - a.ms);

  // Steg 3: slå ihop dubbelrapporterna. Varje text+plats bär tiden för den
  // senaste rad som behölls; en äldre rad inom IHOP_MS från den är samma
  // skanning en gång till. Jämförelsen görs mot den BEHÅLLNA raden, så en
  // lång serie äkta skanningar med samma text inte kedjas ihop till en.
  const behallna = [];
  const senast = new Map();
  for (const rad of rader) {
    const nyckel = `${rad.text}\u0000${rad.plats ?? ''}`;
    const forra = senast.get(nyckel);
    if (forra !== undefined && forra - rad.ms <= IHOP_MS) continue;
    senast.set(nyckel, rad.ms);
    behallna.push({ tid: rad.tid, text: rad.text, plats: rad.plats, land: rad.land, ra: rad.ra });
    if (behallna.length >= MAX_HANDELSER) break;
  }
  return behallna;
}

// Alla providers händelser i en lista. Mätt 2026-09-19: alla 204 paket hade
// minst en händelse här, så ingen reservväg via `latest_event` behövs.
//
// Allt som inte är en lista behandlas som ingen lista alls. `for...of` över
// ett objekt kastar "is not iterable", och ett trasigt svar från 17TRACK ska
// ge ett paket utan skanningar — inte en kraschad publicering.
function raHandelser(post) {
  const providers = post?.track_info?.tracking?.providers;
  if (!Array.isArray(providers)) return [];
  const ut = [];
  for (const p of providers) {
    const events = p?.events;
    if (!Array.isArray(events)) continue;
    for (const e of events) if (e && typeof e === 'object') ut.push(e);
  }
  return ut;
}

// Första tidsfältet som går att läsa, i tur och ordning. `time_iso` bär
// fraktbolagets offset ("…+08:00") och är förstahandsvalet; `time_utc` är
// reserven.
//
// Varför "första LÄSBARA" och inte `time_iso ?? time_utc`: `??` faller bara
// tillbaka på null/undefined, så ett tomt `time_iso: ''` — eller en sträng
// som inte går att tolka — sänkte hela händelsen fast `time_utc` låg bredvid
// och var giltig. (Mätt 2026-09-19 på butikens 204 paket: alla 1 873
// händelser hade ett läsbart `time_iso`, så det här är en spärr mot ett svar
// vi ännu inte sett, inte en rättelse av dagens data.)
function forstaLasbaraTiden(...falt) {
  for (const f of falt) {
    const ms = tidTillMs(f);
    if (ms !== null) return ms;
  }
  return null;
}

// En tidsstämpel UTAN tidszon ("2026-09-18 09:00:00") läses som UTC.
//
// Varför: Date.parse() läser en zonlös stämpel som LOKAL tid, alltså olika
// beroende på vilken maskin bygget råkar köra på. 17TRACK:s `time_utc` är
// dokumenterad som UTC och skrivs "YYYY-MM-DD HH:mm:ss" — utan Z. Utan den
// här raden hade samma svar gett 09:00 i rutinens container (TZ=UTC) och
// 11:00 på en svensk maskin i sommartid, och kunden hade fått se fel klockslag.
// (Mätt 2026-09-19 på butikens 204 paket: alla 1 873 händelser bar ett
// `time_iso` med offset, så reservvägen användes inte en enda gång — den här
// spärren är till för det svar vi ännu inte sett.)
const UTAN_TIDSZON = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

function tidTillMs(tid) {
  if (tid === null || tid === undefined) return null;
  if (typeof tid === 'number') return Number.isFinite(tid) ? tid : null;
  if (typeof tid !== 'string') return null;
  const s = tid.trim();
  if (!s) return null;
  const ms = Date.parse(UTAN_TIDSZON.test(s) ? `${s.replace(' ', 'T')}Z` : s);
  if (!Number.isFinite(ms)) return null;
  return ms;
}

// Ordboken får svara med en sträng eller med ett objekt som bär `text`
// (sparning/sprak.mjs gör det senare). Båda formerna duger; bygget bryr sig
// bara om raden kunden ska läsa.
function fras(svar) {
  if (svar && typeof svar === 'object' && !Array.isArray(svar)) return svar.text ?? null;
  return svar;
}

function renText(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(/\s+/g, ' ');
  return s.length ? s : null;
}

// ---------------------------------------------------------------------------
// 2. Händelser → den komprimerade filen
// ---------------------------------------------------------------------------

// `paket` = [{ nummer, bolag, statusKod, handelser }] där `statusKod` är en
// Shopify-status ur STATUSAR i uppacka.mjs och `handelser` är utdata från
// handelserUr(). `nu` = millisekunder, skickas IN så bygget blir
// deterministiskt (och testbart) — den här modulen frågar aldrig klockan.
//
// Returnerar { data, statistik: { paket, handelser, fraser, platser, tecken,
// varningar } }.
export function byggData(paket, { nu, mottagarland = STANDARDLAND } = {}) {
  if (!Number.isFinite(nu)) {
    throw new Error('byggData(): { nu } måste vara millisekunder — bygget frågar aldrig klockan själv.');
  }
  const varningar = [];

  // Svep 1: läs paketen, normalisera numren, avgör status. Dubbletter löses
  // HÄR, innan något räknas.
  const poster = new Map();     // nummer → { statusIx, bolag, rader }

  for (const p of (paket ?? [])) {
    const nummer = nyckelFor(p?.nummer);
    if (!nummer) {
      varningar.push('Paket utan spårningsnummer hoppades över.');
      continue;
    }
    if (poster.has(nummer)) {
      varningar.push(`Dubblett: ${nummer} fanns redan, den senare posten vann.`);
    }

    let statusIx = STATUSAR.findIndex((rad) => rad[0] === p?.statusKod);
    if (statusIx < 0) {
      statusIx = RESERVSTATUS;
      varningar.push(`Okänd status "${p?.statusKod ?? ''}" på ${nummer} — skrevs som ${STATUSAR[RESERVSTATUS][0]}.`);
    }

    // Paket utan händelser tas med ändå: kunden ska få veta att numret finns
    // och att fraktbolaget inte rapporterat något än. Ett tomt svar är ett
    // svar; "numret hittades inte" hade varit fel.
    const rader = [];
    for (const h of (p?.handelser ?? [])) {
      const minut = isoTillMinut(h?.tid);
      if (minut === null) {
        varningar.push(`Ogiltig tid på ${nummer} hoppades över: ${String(h?.tid ?? '')}`);
        continue;
      }
      const text = renText(h?.text);
      if (!text) {
        varningar.push(`Händelse utan text på ${nummer} hoppades över.`);
        continue;
      }
      rader.push({ minut, text, plats: renText(h?.plats), land: renText(h?.land), ra: renText(h?.ra) ?? text });
    }

    // Formatet säger "händelserna ligger nyast först" (sparning/uppacka.mjs),
    // och byggData() är enda stället som skriver formatet — så ordningen
    // säkras här i stället för att lita på anroparen. handelserUr() lämnar
    // redan sorterat; den andra vägen in (färdiga kedjor ur lage.json via
    // sparning/publicera.mjs) gör det inte, och en kedja i fel ordning hade
    // visat kunden leveransen längst ned. Sorteringen är stabil i Node, så
    // två händelser på samma minut behåller sin inbördes ordning — och
    // därmed sekundordningen handelserUr() redan lagt dem i.
    rader.sort((a, b) => b.minut - a.minut);

    // Kundens fem skeden. Klassificeringen är REN GRUPPERING av de rader som
    // redan finns: den rör varken tid, text eller plats, och kan bara sätta
    // `steg` och `avvikelse`. En rad kan aldrig försvinna här.
    const klassade = klassificera(rader, {
      iMottagarlandet: (r) => !!r.land && r.land === mottagarland,
    });
    for (let i = 0; i < rader.length; i++) {
      rader[i].steg = klassade[i]?.steg ?? -1;
      rader[i].avvikelse = !!klassade[i]?.avvikelse;
    }

    // Var på den internationella sträckan? Samma sorts ren gruppering, ett
    // lager ned: den rör varken tid, text, plats eller `steg`, och gäller
    // BARA rader som redan klassats som internationell transport.
    const medDelsteg = klassificeraDelsteg(rader, {
      arInternationell: (r) => typeof r.steg === 'number' && r.steg >= 0 && r.steg < I_LANDET_NR,
    });
    for (let i = 0; i < rader.length; i++) rader[i].delsteg = medDelsteg[i]?.delsteg ?? -1;

    // Map.set på en nyckel som redan finns behåller platsen i ordningen men
    // byter värdet — den senare posten vinner, som varningen säger.
    poster.set(nummer, { statusIx, bolag: renText(p?.bolag), rader });
  }

  // Svep 2: ordböckerna byggs ur de poster som FAKTISKT hamnar i filen.
  // Räknades de i svep 1 fick en överskriven dubblett räkna med sina fraser
  // och platser: `statistik.handelser` blev större än antalet rader i datan,
  // och ordboken bar rader som ingen händelse pekade på. (Reproducerat:
  // samma nummer två gånger gav statistik.handelser 2 mot 1 rad i `k`.)
  // Numren i lage.json är fraktbolagens råa, så "YT26 2600 …" och
  // "YT262600…" kan mycket väl stå som två poster och falla ihop här.
  const fraser = new Raknare();
  const platser = new Raknare();
  const lander = new Raknare();
  const bolagsnamn = [];        // bolagen är få; först-sedd-ordning räcker
  const bolagIndex = new Map();
  let handelser = 0;

  for (const post of poster.values()) {
    if (post.bolag && !bolagIndex.has(post.bolag)) {
      bolagIndex.set(post.bolag, bolagsnamn.length);
      bolagsnamn.push(post.bolag);
    }
    for (const r of post.rader) {
      r.frasIx = fraser.lagg(r.text);
      r.platsIx = r.plats ? platser.lagg(r.plats) : null;
      r.landIx = r.land ? lander.lagg(r.land) : null;
      handelser++;
    }
  }

  // Fraserna och platserna sorteras efter hur ofta de används, vanligast
  // först. Det ger de vanligaste raderna de kortaste indexen (0–9 i stället
  // för 70-någonting) och därmed en mindre fil. Lika många användningar ⇒
  // först sedd först, så bygget blir deterministiskt.
  const fraslista = fraser.sorterad();
  const platslista = platser.sorterad();
  const landlista = lander.sorterad();

  const data = {
    v: FORMAT,
    byggd: isoTillMinut(nu) ?? 0,
    land: mottagarland,
    f: fraslista.lista,
    p: platslista.lista,
    l: landlista.lista,
    b: bolagsnamn,
    k: {},
  };
  for (const [nummer, post] of poster) {
    data.k[nummer] = [
      post.statusIx,
      post.bolag ? bolagIndex.get(post.bolag) : -1,
      post.rader.map((r) => [
        r.minut,
        fraslista.nyIndex[r.frasIx],
        r.platsIx === null ? -1 : platslista.nyIndex[r.platsIx],
        typeof r.steg === 'number' ? r.steg : -1,
        r.landIx === null ? -1 : landlista.nyIndex[r.landIx],
        r.avvikelse ? 1 : 0,
        // Fält 7, tillagt 2026-09-20. Inget FORMAT-byte behövs: uppackaren
        // läser e[6] defensivt, så äldre data ger -1 och visas som förut.
        typeof r.delsteg === 'number' ? r.delsteg : -1,
      ]),
    ];
  }

  return {
    data,
    statistik: {
      paket: Object.keys(data.k).length,
      handelser,
      fraser: data.f.length,
      platser: data.p.length,
      lander: data.l.length,
      tecken: JSON.stringify(data).length,
      varningar,
    },
  };
}

// Räknar hur ofta varje sträng används och ger den ett tillfälligt index.
// `sorterad()` ger den slutliga listan (vanligast först) plus en tabell från
// tillfälligt till slutligt index.
class Raknare {
  constructor() {
    this.index = new Map();
    this.lista = [];
    this.antal = [];
  }

  lagg(text) {
    let i = this.index.get(text);
    if (i === undefined) {
      i = this.lista.length;
      this.index.set(text, i);
      this.lista.push(text);
      this.antal.push(0);
    }
    this.antal[i]++;
    return i;
  }

  sorterad() {
    const ordning = this.lista.map((_, i) => i);
    ordning.sort((a, b) => (this.antal[b] - this.antal[a]) || (a - b));
    const nyIndex = new Array(this.lista.length);
    ordning.forEach((gammalt, nytt) => { nyIndex[gammalt] = nytt; });
    return { lista: ordning.map((i) => this.lista[i]), nyIndex };
  }
}

// Samma normalisering som uppacka.nyckel(), men den funktionen tar en sträng
// och ger alltid en sträng — här behövs "tomt ⇒ inget paket".
function nyckelFor(nummer) {
  const s = String(nummer ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return s.length ? s : null;
}

// ---------------------------------------------------------------------------
// 3. Fönstret
// ---------------------------------------------------------------------------

// Tar bort paket vars senaste händelse är äldre än FONSTER_DAGAR. Ett paket
// UTAN händelser behålls: det finns ingen tid att döma på, och det är just
// det nyss skickade paketet kunden slår upp. Antalet sådana bärs av
// anroparens eget fönster över ordrarna (kor.mjs läser 14 dagar bakåt).
export function filtreraFonster(paket, { nu } = {}) {
  if (!Number.isFinite(nu)) {
    throw new Error('filtreraFonster(): { nu } måste vara millisekunder — filtret frågar aldrig klockan själv.');
  }
  const grans = nu - FONSTER_DAGAR * DYGN_MS;
  return (paket ?? []).filter((p) => {
    const rader = p?.handelser ?? [];
    if (!rader.length) return true;
    let senaste = -Infinity;
    for (const h of rader) {
      const ms = tidTillMs(h?.tid);
      if (ms !== null && ms > senaste) senaste = ms;
    }
    if (senaste === -Infinity) return true;   // inga läsbara tider ⇒ behåll
    return senaste >= grans;
  });
}
