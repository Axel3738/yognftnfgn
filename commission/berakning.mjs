// berakning.mjs — ren räknelogik för redigerarnas commission.
//
// Ingen I/O här: modulen får Notion-rader, Meta-annonser och personlistan som
// vanliga objekt och lämnar tillbaka en färdig rapport. Allt nätverk ligger i
// notion.mjs och meta.mjs, allt utskrivande i run.mjs — så att den här filen
// går att testa utan nycklar.
//
// Reglerna (Axels beslut 2026-08-30):
//  1. Commission = SATS × spend under kalendermånaden på annonser vars
//     Notion-rad är Approved. Månadens sista körning är slutavräkningen.
//  2. Bara redigerare får utbetalning. Rader på Axel/manager och rader utan
//     Ansvarig redovisas var för sig — spenden syns, men betalas inte ut.
//  3. ENDAST svenska annonser räknas (Axels beslut 2026-08-31). Utlandska
//     marknadskonton och annonser med marknadskod i namnet filtreras bort.

/** 0,4 % av spenden. */
export const SATS = 0.004;

/** Marknadskoder som får strykas när en översatt annons matchas mot originalet.
 *  Konceptkoderna i namnkonventionen (CS, GT, PD, SP, SO, CI, UG, G) står
 *  medvetet INTE här — de får aldrig strykas. */
export const MARKNADSKODER = ['SE', 'NO', 'DK', 'FI', 'UK', 'DE', 'NL', 'US'];

/**
 * Annonskonton som INTE är den svenska marknaden. Commission räknas bara på
 * svenska annonser (Axels beslut 2026-08-31) — översättningarna görs av
 * HeyGen-rutinen, inte av redigerarna.
 *
 * Listan är konto-id, inte namn: kontonamnen är otydliga ("Finland DK",
 * "Norge", "nya kungen") och ett namnbyte får aldrig tyst släppa in en
 * utländsk marknad i utbetalningen.
 */
export const UTLANDSKA_KONTON = new Map([
  ['1050941584152547', 'Magiborsten NO'],
  ['915422744950975', 'Magiborsten DK'],
  ['1619718346388201', 'Magiborsten FI'],
  ['1107817401910319', 'Magiborsten UK'],
  ['918424617391896', 'Snark mexico'],
  ['1070420775502885', 'SNarklös FI'],
  ['1418612340124566', 'Norge'],
  ['1356652809967926', 'Finland DK'],
  ['1023341917138110', 'NYC Grill (USD)'],
]);

/** Marknadskod i annonsnamnet — en översatt annons kan ligga i ett svenskt konto. */
const FRAMMANDE_MARKNAD = /(^|[_\s-])(NO|DK|FI|UK|GB|DE|NL|US|MX|ES|FR|PL)([_\s-]|$)/i;

/**
 * Är annonsen svensk? Två spärrar: kontot får inte vara ett marknadskonto, och
 * namnet får inte bära en marknadskod. Båda måste hålla.
 */
export function arSvensk(annons) {
  if (UTLANDSKA_KONTON.has(String(annons.konto?.id))) return false;
  return !FRAMMANDE_MARKNAD.test(annons.adNamn ?? '');
}

/** Statusen som gör en rad utbetalningsgrundande. */
export const GODKAND_STATUS = 'Approved';

/** Bara rader vars Typ innehåller det här är annonser. INKLUDERING, aldrig
 *  uteslutning — annars smyger nya stödsidor in i utbetalningen. */
export const ANNONSTYP = /pending approval/i;

// ------------------------------------------------------------- Kördagar

/** Sista dagen i månaden som `datum` ligger i. */
export function sistaDagen(datum) {
  return new Date(Date.UTC(datum.getUTCFullYear(), datum.getUTCMonth() + 1, 0)).getUTCDate();
}

/** Var tredje dag (1, 4, 7 … 28) plus alltid månadens sista dag.
 *  Returnerar `{ kor, skal }` — aldrig bara true/false, rapporten ska kunna
 *  skriva ut VARFÖR den kör. */
export function arKordag(datum) {
  const dag = datum.getUTCDate();
  const sista = sistaDagen(datum);
  if (dag === sista) return { kor: true, slutavrakning: true, skal: `${dag} är månadens sista dag — slutavräkning` };
  if (dag % 3 === 1) return { kor: true, slutavrakning: false, skal: `dag ${dag} — var tredje dag räknat från den 1:a` };
  return { kor: false, slutavrakning: false, skal: `dag ${dag} är varken var-tredje-dag (1, 4, 7 …) eller månadens sista (${sista})` };
}

/** Perioden en körning ska mäta: från den 1:a till och med dagens datum. */
export function period(datum) {
  const ar = datum.getUTCFullYear();
  const man = String(datum.getUTCMonth() + 1).padStart(2, '0');
  return {
    manad: `${ar}-${man}`,
    fran: `${ar}-${man}-01`,
    till: datum.toISOString().slice(0, 10),
    heltMatad: datum.getUTCDate() === sistaDagen(datum),
  };
}

// ------------------------------------------------------------- Namnnycklar

/** Notion-titlar har eftersläpande blanksteg ("Trimmerbelt_PD_16_1 ") och
 *  varierande versaler. Nyckeln måste tåla båda. */
export function normalisera(namn) {
  return String(namn ?? '').trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Annonsnamnet ur en Notion-titel.
 *
 * Titlarna bär ofta briefens beskrivning efter själva namnet:
 *   "Trimmerbelt_SP_3_H1 – VIDEO: UGC proof-led – skeptikern blir övertygad"
 *   "Enginecover_PD_1_H6 NO ACCeSS"
 * medan annonsen i Meta bara heter "Trimmerbelt_SP_3_H1". Utan den här
 * strykningen matchar inte en enda av redigerarnas rader, och alla får 0 kr.
 *
 * Bara första ordet plockas ut, och bara när det ser ut som ett annonsnamn
 * enligt docs/naming-convention.md (innehåller "_"). Titlar utan understreck
 * ("BRYN SWIPE") lämnas hela, så att ett löst förstaord aldrig råkar matcha.
 */
export function annonsnamn(titel) {
  const rent = String(titel ?? '').trim();
  const forsta = rent.split(/\s+/)[0] ?? '';
  const skalat = forsta.replace(/[–—\-:,.]+$/u, '');
  return skalat.includes('_') ? skalat : rent;
}

/** Samma namn utan marknadskod, så att Trimmerbelt_NO_PD_16_1 hittar
 *  Trimmerbelt_PD_16_1. Bara hela underscore-segment stryks — ett namn som
 *  bara innehåller bokstäverna räknas aldrig som marknad. */
export function basnyckel(namn, marknader = MARKNADSKODER) {
  const koder = new Set(marknader.map((m) => m.toUpperCase()));
  const delar = normalisera(namn).split('_').filter((d) => !koder.has(d));
  return delar.join('_');
}

// ------------------------------------------------- Register över godkända rader

/**
 * Bygger uppslagsregistret från hubbarnas rader.
 * Rader som inte är Approved eller inte har en annons-Typ sorteras bort här.
 *
 * @param {Array<{namn:string, rader:Array}>} hubbar
 * @returns {{exakt:Map, bas:Map, godkanda:Array, bortsorterade:number}}
 */
export function byggRegister(hubbar, { marknader = MARKNADSKODER } = {}) {
  const godkanda = [];
  let bortsorterade = 0;

  for (const hubb of hubbar) {
    for (const rad of hubb.rader ?? []) {
      if (!ANNONSTYP.test(rad.typ ?? '') || (rad.status ?? '') !== GODKAND_STATUS) {
        bortsorterade++;
        continue;
      }
      const titel = String(rad.namn ?? '').trim();
      const namn = annonsnamn(titel);
      if (!namn) { bortsorterade++; continue; }
      godkanda.push({
        ...rad,
        titel,
        namn,
        hubb: hubb.namn,
        ansvariga: [...new Set(rad.ansvariga ?? [])],
        nyckel: normalisera(namn),
        bas: basnyckel(namn, marknader),
      });
    }
  }

  const exakt = new Map();
  const bas = new Map();
  for (const rad of godkanda) {
    if (!exakt.has(rad.nyckel)) exakt.set(rad.nyckel, []);
    exakt.get(rad.nyckel).push(rad);
    if (!bas.has(rad.bas)) bas.set(rad.bas, []);
    bas.get(rad.bas).push(rad);
  }
  return { exakt, bas, godkanda, bortsorterade };
}

/** Två rader är i konflikt om de bär samma namn men olika Ansvarig — då går det
 *  inte att veta vem som ska ha pengarna, och ingen får dem förrän Axel rett ut det. */
function ansvarignyckel(rad) {
  return [...rad.ansvariga].sort().join('+');
}
function harKonflikt(rader) {
  return new Set(rader.map(ansvarignyckel)).size > 1;
}

// --------------------------------------------------------------- Matchning

/**
 * Kopplar varje annons med spend till en godkänd Notion-rad.
 * Exakt namn vinner alltid över marknadsvariant.
 */
export function matcha(annonser, register) {
  const traffar = [];
  const omatchade = [];
  const konflikter = new Map();

  for (const annons of annonser) {
    const nyckel = normalisera(annons.adNamn);
    const bas = basnyckel(annons.adNamn);
    let rader = register.exakt.get(nyckel);
    let typ = 'exakt';
    if (!rader?.length) { rader = register.bas.get(bas); typ = 'variant'; }
    if (!rader?.length) { omatchade.push(annons); continue; }

    if (harKonflikt(rader)) {
      const k = rader[0].nyckel;
      if (!konflikter.has(k)) konflikter.set(k, { namn: rader[0].namn, rader, annonser: [], spend: 0 });
      const post = konflikter.get(k);
      post.annonser.push(annons);
      post.spend += annons.spend;
      continue;
    }
    traffar.push({ annons, rad: rader[0], typ });
  }
  return { traffar, omatchade, konflikter: [...konflikter.values()] };
}

// ----------------------------------------------------------- Sammanräkning

const tomBelopp = () => ({ exakt: {}, variant: {}, spend: {}, commission: {} });

function addera(mal, valuta, belopp) {
  mal[valuta] = (mal[valuta] ?? 0) + belopp;
}

function summeraCommission(post, sats) {
  for (const [valuta, belopp] of Object.entries(post.spend)) {
    post.commission[valuta] = avrunda(belopp * sats);
  }
  for (const nyckel of ['exakt', 'variant', 'spend']) {
    for (const valuta of Object.keys(post[nyckel])) post[nyckel][valuta] = avrunda(post[nyckel][valuta]);
  }
}

/** Öresavrundning. Utan den blir summorna 1234.5600000000002. */
export function avrunda(tal) {
  return Math.round(tal * 100) / 100;
}

/**
 * Räknar ihop hela rapporten.
 *
 * @param {object} indata
 * @param {Array} indata.hubbar     Notion-hubbar med rader.
 * @param {Array} indata.annonser   Annonser med spend: {adId, adNamn, spend, konto:{id,namn,valuta}}
 * @param {Array} indata.personer   team.json-users: {id, namn, notionUserId, roll}
 * @param {Date}  indata.datum      Körningens datum (UTC).
 * @param {number} [indata.sats]
 */
export function berakna({ hubbar, annonser, personer, datum, sats = SATS, koppla = null }) {
  const register = byggRegister(hubbar);
  let traffar, omatchade, konflikter;
  if (koppla) {
    // Extern koppling (commission/koppling.mjs): hubbrad per annons, produkt som
    // reserv. Kopplingen avgör VEM; den här funktionen räknar pengarna.
    traffar = []; omatchade = []; konflikter = [];
    for (const annons of annonser) {
      const k = koppla(annons);
      if (!k) { omatchade.push(annons); continue; }
      traffar.push({
        annons,
        rad: { namn: k.radnamn ?? annons.adNamn, hubb: k.hubb ?? k.via, ansvariga: k.ansvariga, url: null },
        typ: k.via === 'produkt' ? 'variant' : 'exakt',
      });
    }
  } else {
    ({ traffar, omatchade, konflikter } = matcha(annonser, register));
  }

  const personPaNotionId = new Map(
    personer.filter((p) => p.notionUserId).map((p) => [p.notionUserId, p]),
  );

  /** En post per mottagare, plus tre samlingsposter för det som inte betalas ut. */
  const poster = new Map();
  const hamta = (id, mall) => {
    if (!poster.has(id)) poster.set(id, { ...mall, ...tomBelopp(), annonser: [] });
    return poster.get(id);
  };

  const utanMottagare = { id: '_utan_ansvarig', namn: 'Ingen Ansvarig i Notion', roll: 'ingen', ...tomBelopp(), annonser: [] };
  const okanda = new Map();
  const traffadeRader = new Set();

  for (const { annons, rad, typ } of traffar) {
    traffadeRader.add(rad.url ?? rad.namn);
    const valuta = annons.konto.valuta;

    if (!rad.ansvariga.length) {
      addera(utanMottagare[typ], valuta, annons.spend);
      addera(utanMottagare.spend, valuta, annons.spend);
      utanMottagare.annonser.push({ ...annons, rad: rad.namn, hubb: rad.hubb, typ });
      continue;
    }

    // Flera ansvariga på samma rad delar lika på creativens spend.
    const andel = annons.spend / rad.ansvariga.length;
    for (const notionId of rad.ansvariga) {
      const person = personPaNotionId.get(notionId);
      let post;
      if (person) {
        post = hamta(person.id, { id: person.id, namn: person.namn, roll: person.roll, notionUserId: notionId });
      } else {
        // Okänd Notion-användare: aldrig tyst bortkastad — hon ska läggas till
        // i dashboard/data/team.json innan nästa körning.
        if (!okanda.has(notionId)) okanda.set(notionId, { notionUserId: notionId, ...tomBelopp(), rader: new Set(), annonser: [] });
        post = okanda.get(notionId);
        post.rader.add(rad.namn);
      }
      addera(post[typ], valuta, andel);
      addera(post.spend, valuta, andel);
      post.annonser.push({ ...annons, spend: avrunda(andel), rad: rad.namn, hubb: rad.hubb, typ });
    }
  }

  for (const post of [...poster.values(), utanMottagare, ...okanda.values()]) summeraCommission(post, sats);
  for (const post of okanda.values()) post.rader = [...post.rader];

  const alla = [...poster.values()].sort((a, b) => (b.spend.SEK ?? 0) - (a.spend.SEK ?? 0));
  const redigerare = alla.filter((p) => p.roll === 'editor');
  const ejRedigerare = alla.filter((p) => p.roll !== 'editor');

  // Godkända rader som ingen annons matchade — creativen är godkänd men har
  // inte spenderat något den här månaden (eller ligger inte uppe i kontot).
  const utanSpend = koppla ? [] : register.godkanda.filter((r) => !traffadeRader.has(r.url ?? r.namn));

  const valutor = [...new Set(annonser.map((a) => a.konto.valuta))].sort();
  const totalt = tomBelopp();
  for (const p of redigerare) {
    for (const [v, b] of Object.entries(p.spend)) addera(totalt.spend, v, b);
    for (const [v, b] of Object.entries(p.commission)) addera(totalt.commission, v, b);
  }
  summeraCommission(totalt, sats);

  const kord = arKordag(datum);
  return {
    kord: new Date(datum).toISOString(),
    period: period(datum),
    kordag: kord,
    sats,
    valutor,
    redigerare,
    ejRedigerare,
    utanMottagare,
    okandaAnsvariga: [...okanda.values()],
    konflikter,
    totalt,
    godkandaRader: register.godkanda.length,
    raderUtanSpend: utanSpend.map((r) => ({ namn: r.namn, hubb: r.hubb, url: r.url })),
    annonserUtanGodkandRad: {
      antal: omatchade.length,
      spend: omatchade.reduce((acc, a) => { addera(acc, a.konto.valuta, a.spend); return acc; }, {}),
    },
  };
}
