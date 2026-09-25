// kommentarer/klassa.mjs — vad en annonskommentar ÄR, med rena regler.
//
// Regler, ingen modell: samma ord ger samma hink vecka efter vecka, så
// trenden går att läsa. Sessionen som kör /kommentarer dömer sedan det
// reglerna inte kan (vilka leads som är nya, vad som ska göras) — reglerna
// sorterar, sessionen tänker.
//
// Fyra nivåer, den första som träffar vinner:
//   ALLVARLIGT  🔴  bluffanklagelse, köpare som inte fått sin vara, köpare som
//                   är missnöjd med varan, hot om anmälan, fara/säkerhet, spam.
//                   Kräver en människa i dag.
//   INVÄNDNING  🟡  skäl att inte köpa (fukt, pris, kvalitet, "funkar det?").
//                   Samma klusternamn som tools/annonskommentarer.mjs så
//                   invändningsmatrisen kan läsa båda.
//   FRÅGA       🔵  köpfråga som förtjänar ett svar i tråden (pris, storlek,
//                   finns den till …, Klarna). En obesvarad fråga är en förlorad order.
//   ÖVRIGT          beröm, taggade vänner, allt annat.
//
// Språken är sv/nb/da/fi/en — CaraShell US och Norge kommenterar också.
// Mätt 2026-09-24 på 204 kommentarer/72 h: "Värsta skräpet", "Riktigt skräp.
// Går sönder direkt" (båtmotorkåpan ×3), "Finns på Temu för 300", "Fukten då???".

export const NIVA = Object.freeze({ ALLVARLIGT: 'allvarligt', INVANDNING: 'invandning', FRAGA: 'fraga', OVRIGT: 'ovrigt' });

// Köparens egen röst: "jag köpte", "min kom", "fick hem". Skiljer en köpare som
// är missnöjd (allvarligt — VA:n ska ta det) från en förbipasserande som tycker
// att produkten ser dålig ut (invändning — creative ska svara).
const KOPARE = /\b(köpte|beställde|jag (har )?(köpt|köpte|beställt|beställde|fick)|vi (har )?(köpt|köpte|beställt|beställde|fick)|har köpt|fick hem|fick den|fick min|min (kom|har kommit|kom fram)|kom (idag|i dag|igår|i går)|jeg (har )?(kjøpt|kjøbt|bestilt|fikk)|kjøpte|bestilte|jeg købte|vi købte|ostin|tilasin|i (bought|ordered|received|got mine)|we (bought|ordered)|mine (arrived|came))\b/iu;
// "skit" före ett positivt ord är beröm ("skit bra"), inte missnöje.
const MISSNOJD = /(sönder|trasig|trasiga|dålig|dåligt|skräp|(?<!\p{L})skit(?!\s*(bra|snygg|smart|kul|nice|najs|gött|bäst|fin))(?!\p{L})|värdelös|sprack|spricker|höll inte|håller inte|revs|luktar|pengarna tillbaka|returnera|fel storlek|inte som på bild|inte alls som|besviken|fattas|för kort|för liten|för stor|passade inte|passar inte|ødelagt|dårlig|dårleg|søppel|elendig|skuffet|rikki|huono|(?<!\p{L})broken?(?!\p{L})|junk|garbage|(?<!\p{L})cheap(?!\p{L})|disappointed|not as (pictured|described)|refund)/giu;

/** Allvarligt: [kategori, regex, negerbar]. Ordningen är prioriteten. */
export const ALLVARLIGT = [
  ['ej levererat', /((inte|aldrig|ej) (har )?fått (min|mina|mitt|någon|något|ordern|order|paket|paketet|varan|varorna|beställning|beställningen|leverans|leveransen|den|dem|det|grejen|produkten)|har inte kommit|inte kommit än|ej kommit|väntat (i |på )?\d+\s?(dagar|veckor|v\b|mån)|väntar fortfarande|ingen leverans|var (är|e) min (order|beställning|vara|paket)|(ikke|aldri) (har )?fått (pakken|varen|bestillingen|ordren|min|mitt|noe|den)|ikke kommet|venter fortsatt|ikke modtaget|aldrig modtaget|en ole saanut|ei ole tullut|never (received|arrived|came)|still waiting|haven'?t received|not received|no tracking)/giu, false],
  ['bluff-anklagelse', /((?<!\p{L})bluff|(?<!\p{L})scam|bedrägeri|bedragare|lurendrej|(?<!\p{L})lurad|(?<!\p{L})lurade|svindel|svindlere|oseriös|oseriöst|oseriösa|(?<!\p{L})fake(?!\p{L})|falsk (butik|sida|reklam)|(?<!\p{L})stjäl|(?<!\p{L})juks|lureri|(?<!\p{L})snyd|fupfirma|huijau|huijari|(?<!\p{L})fraud|(?<!\p{L})rip[- ]?off(?!\p{L})|don'?t (buy|order)|(?<!\p{L})köp (inte|ej)(?!\p{L})|handla (inte|ej)|varning för|varnar för|ikke kjøp|ikke bestill|køb ikke)/giu, true],
  ['hot om anmälan', /((?<!\p{L})arn(?!\p{L})|reklamationsnämnd|konsumentverket|polisanmäl|anmäl(a|er|t|de)? (er|dig|butiken|sidan|annonsen|företaget|detta)|advokat|stämma er|stämmer er|forbrukerrådet|forbrukertilsynet|forbrugerrådet|kuluttaja(neuvonta|viranomainen)|chargeback|återkräv|report(ed)? (you|this)|lawyer|sue you)/giu, true],
  ['fara/säkerhet', /((?<!\p{L})brann(?!\p{L})|brinner|börjar brinna|eldsvåda|brandfarlig|(?<!\p{L})farligt?(?!\p{L})|livsfarlig|skadade (sig|mig|barnet)|kortslut|elchock|(?<!\p{L})giftigt?(?!\p{L})|explod|(?<!\p{L})brenner|brannfarlig|tulipalo|vaarallinen|caught fire|dangerous|toxic|(?<!\p{L})burned|electric shock)/giu, true],
  ['spam/länk', /((?<!\p{L})whatsapp|(?<!\p{L})telegram(?!\p{L})|(?<!\p{L})crypto|bitcoin|inbox me|dm me|skriv till mig privat|click here|free money)/giu, false],
];
// En länk ensam är spam — men "finns på Temu https://…" är en prisinvändning (den räknas där).
const LANK = /(https?:\/\/|www\.)/iu;

/** Invändningar: [kluster, regex]. Namnen följer tools/annonskommentarer.mjs KLUSTER. */
export const INVANDNINGAR = [
  ['fukt/mögel/ventilation', /(fukt|mögel|mögla|kondens|ventil|självdrag|luftar|(?<!\p{L})andas|(?<!\p{L})tätt(?!\p{L})|instängd|unket|diffusion|(?<!\p{L})mugg(?!\p{L})|jordslag|fugt|skimmel|kosteu|moisture|(?<!\p{L})mou?ld(y)?(?!\p{L})|condensation|ventilat|breathab)/giu],
  ['skepsis/kritik', /(skräp|onödigt|onödig|rekommenderas ej|rekommenderar inte|inte bra|kan inte vara bra|fungerar inte|funkar inte|värdelös|(?<!\p{L})dålig|(?<!\p{L})dåligt|meningslös|pengarna i sjön|bortkastade|søppel|dårleg|unødvendig|ubrukelig|ikke bra|virker ikke|ubrugelig|turha|roskaa|useless|pointless|waste of money|doesn'?t work|garbage|junk)/giu],
  ['pris/konkurrent', /(temu|(?<!\p{L})wish(?!\p{L})|aliexpress|alibaba|(?<!\p{L})shein|biltema|(?<!\p{L})jula(?!\p{L})|clas ohlson|(?<!\p{L})rusta(?!\p{L})|(?<!\p{L})kina(?!\p{L})|kinesisk|dropship|billigare|halva priset|för dyr|(?<!\p{L})dyrt?(?!\p{L})|överpris|ocker|kostar ju|billigere|kallis|halvempi|cheaper|overpriced|too expensive)/giu],
  ['förtroende', /(seriös|seriöst|lita på|litar inte|kan man lita|finns ni|vem är ni|recension|omdöme|trustpilot|kan stole|troværdig|luotettava|(?<!\p{L})legit|(?<!\p{L})trust(?!\p{L})|(?<!\p{L})reviews?(?!\p{L}))/giu],
  ['kvalitet/material', /(kvalitet|kvalité|material|(?<!\p{L})tyg(?!\p{L})|(?<!\p{L})plast|hållbar|slitstark|(?<!\p{L})tunn(?!\p{L})|(?<!\p{L})tunt(?!\p{L})|(?<!\p{L})tjock|går sönder|gick sönder|håller inte|(?<!\p{L})reva|revor|skaver|nöter|nöta|sliter|slits|materiale|(?<!\p{L})tynn|holdbar|laatu|ohut|quality|flimsy|(?<!\p{L})thin(?!\p{L})|durable|(?<!\p{L})(tears?|torn|rips?|ripped)(?!\p{L}))/giu],
  ['fungerar det', /(fungerar|funkar|funka|håller den|(?<!\p{L})tål(?!\p{L})|tåler|vattentät|(?<!\p{L})regn|(?<!\p{L})vind(?!ruta|\p{L}*ow)|blåser|(?<!\p{L})storm|(?<!\p{L})snö(?!\p{L})|(?<!\p{L})sol(en)?(?!\p{L})|(?<!\p{L})uv(?!\p{L})|(?<!\p{L})frost|virker|vanntett|blåse|blåst|blåsig|toimii|kestää|does it work|waterproof|(?<!\p{L})wind(y|s)?(?!\p{L})|(?<!\p{L})rain|(?<!\p{L})snow|blow (off|away)|hail)/giu],
  ['storlek/passform', /(storlek|(?<!\p{L})passar|passform|(?<!\p{L})mått(?!\p{L})|måtten|(?<!\p{L})längd|(?<!\p{L})bredd|(?<!\p{L})cm(?!\p{L})|(?<!\p{L})meter(?!\p{L})|\d\s?m(?!\p{L})|för liten|för stor|finns den i|andra storlekar|(?<!\p{L})modell|helintegrer|størrelse|(?<!\p{L})passer|(?<!\p{L})koko|sopii|(?<!\p{L})size|(?<!\p{L})fits?(?!\p{L})|dimension|length|width|\d\s?(ft|feet|foot)(?!\p{L}))/giu],
  ['frakt/leverans', /(frakt|leverans|levereras|skickas|leveranstid|porto|postnord|instabox|budbee|levering|sendes|toimitus|shipping|delivery|ship to)/giu],
  ['retur/garanti', /(retur|ångra|garanti|öppet köp|pengarna tillbaka|angrerett|reklamasjon|fortrydelse|palautus|takuu|(?<!\p{L})returns?(?!\p{L})|warranty|money back)/giu],
  ['betalning', /(klarna|swish|faktura|delbetal|avbetal|vipps|mobilepay|paypal|afterpay|(?<!\p{L})betala)/giu],
  ['önskemål', /(skulle vara|skulle varit|hade varit|önskar|(?<!\p{L})borde|(?<!\p{L})saknar|om det fanns|fans lösa|lösa sidor|tillbehör|(?<!\p{L})burde|skulle vært|ønsker|toivoisin|would be (nice|better)|wish it|should have)/giu],
];
// Invändningar där "inte" framför vänder betydelsen ("inte dåligt" är beröm).
const NEGERBARA_INVANDNINGAR = new Set(['skepsis/kritik']);

const FRAGEORD = /^(var|vad|hur|vilken|vilka|när|varför|finns|går det|kan man|kan jag|passar|funkar|fungerar|tål|är den|är det|hvor|hva|hvordan|hvilken|finnes|passer|mikä|missä|miten|kuinka|onko|where|what|how|which|when|why|does|do you|can i|can you|is it|is this|are they|will it)(?!\p{L})/iu;
const KOPFRAGA = /(vad kostar|kostar(?!\p{L})|(?<!\p{L})pris(et)?(?!\p{L})|var köper|var kan man (köpa|beställa|hitta)|(hur|var) (kan )?(man |jag |ni )?beställ|(?<!\p{L})länk(en)?(?!\p{L})|finns (den|det|ni)|leverera(r|s)? (ni|till)|skickar ni|hvor kjøper|hva koster|(?<!\p{L})koster(?!\p{L})|mitä maksaa|missä myy|how much|where (can i|to) buy|(?<!\p{L})link(?!\p{L})|(?<!\p{L})price(?!\p{L})|ship to)/iu;

const NEGPRIS = /(dyr|billig|temu|(?<!\p{L})wish(?!\p{L})|aliexpress|(?<!\p{L})kina|ocker|överpris|overpriced|expensive|cheaper|kallis)/iu;
const TAGG_BARA = /^(@…[\s,.!]*)+$/;
// Korta berömord kräver ordgräns: "Sebra" är inte "bra" (mätt 2026-09-24 — en invändning om
// band som nöter lacken hamnade som beröm). \p{L} i stället för \b, som inte känner å/ä/ö.
const BEROM = /(?<!\p{L})(bra|toppen|kanon|perfekt|grym|smart|bäst|snygg|genialt|love|great|awesome|perfect|genius|amazing|hyvä|loistava|elsker|genial|nice)(?!\p{L})|nöjd|fornøyd|rekommenderar|älskar|behöver en|måste ha|need this|want this|vill ha/iu;
const NEGATION = /(?<!\p{L})(inte|ej|aldrig|knappast|tveksamt|ikke|aldri|ei|not|never|no)(?!\p{L})/iu;
const NEG_ORD = /^(inte|ej|aldrig|ingen|inget|inga|ikke|aldri|ingen|ikkje|ei|not|never|no|non|isn'?t|wasn'?t|don'?t|doesn'?t|didn'?t)$/iu;

/**
 * Finns en träff som INTE är negerad? En negation bland de två orden före
 * träffen vänder den ("ingen bluff", "inte gått sönder", "not cheap"); med
 * `efter` räknas också "inte" direkt efter ("returnerade den inte"). Ren.
 */
export function traffUtanNegation(re, text, { efter = false } = {}) {
  const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
  for (const m of text.matchAll(r)) {
    const fore = text.slice(0, m.index).split(/[\s,.!?;:]+/).filter(Boolean).slice(-2);
    if (fore.some((o) => NEG_ORD.test(o))) continue;
    if (efter && /^\p{L}*\s+(\p{L}+\s+)?(inte|ej|not|ikke)(?!\p{L})/iu.test(text.slice(m.index + m[0].length))) continue;
    return true;
  }
  return false;
}

/**
 * Klassa en (redan maskerad) kommentar. Ren.
 * @returns {{ niva: string, kategori: string, allvar: 0|1|2|3, kopare: boolean, fraga: boolean, taggar: number }}
 */
export function klassa(text) {
  const t = String(text ?? '').trim();
  const taggar = (t.match(/@…/g) ?? []).length;
  if (!t) return { niva: NIVA.OVRIGT, kategori: 'tom', allvar: 0, kopare: false, fraga: false, taggar };
  const kopare = KOPARE.test(t);
  const utanTaggar = t.replace(/^(@…\s*)+/, '');
  const kopfraga = KOPFRAGA.test(t);
  const fraga = /\?/.test(t) || FRAGEORD.test(utanTaggar) || kopfraga;

  for (const [kategori, re, negerbar] of ALLVARLIGT) {
    if (negerbar ? traffUtanNegation(re, t) : new RegExp(re.source, re.flags.replace('g', '')).test(t)) return { niva: NIVA.ALLVARLIGT, kategori, allvar: 3, kopare, fraga, taggar };
  }
  // En köpare som är missnöjd med sin vara är ett kundtjänstärende, inte en invändning.
  if (kopare && traffUtanNegation(MISSNOJD, t, { efter: true })) return { niva: NIVA.ALLVARLIGT, kategori: 'missnöjd köpare', allvar: 3, kopare, fraga, taggar };

  if (TAGG_BARA.test(t)) return { niva: NIVA.OVRIGT, kategori: 'tagg/vän', allvar: 0, kopare, fraga: false, taggar };

  // "Vad kostar 9,5 m?" är en köpfråga, inte en prisinvändning — utom när
  // kunden jämför ("finns på Temu för 300") eller tycker att det är dyrt.
  const invandning = INVANDNINGAR.find(([namn, re]) => (NEGERBARA_INVANDNINGAR.has(namn) ? traffUtanNegation(re, t) : new RegExp(re.source, re.flags.replace('g', '')).test(t)))?.[0] ?? null;
  // En länk utan invändning är spam; med en invändning ("finns på Temu https://…") räknas invändningen.
  if (LANK.test(t) && !invandning) return { niva: NIVA.ALLVARLIGT, kategori: 'spam/länk', allvar: 3, kopare, fraga, taggar };
  if (kopfraga && !NEGPRIS.test(t) && (!invandning || ['pris/konkurrent', 'storlek/passform', 'frakt/leverans', 'betalning', 'förtroende'].includes(invandning))) {
    const kategori = /(kost|(?<!\p{L})pris(et)?(?!\p{L})|price|koster|how much|maksaa)/iu.test(t) ? 'pris' : (invandning ?? 'köpfråga');
    return { niva: NIVA.FRAGA, kategori, allvar: 1, kopare, fraga: true, taggar };
  }
  // En storleks-, frakt- eller tillbehörsfråga är en köpfråga: den ska besvaras i tråden.
  if (invandning && fraga && ['storlek/passform', 'frakt/leverans', 'önskemål'].includes(invandning)) {
    return { niva: NIVA.FRAGA, kategori: invandning === 'önskemål' ? 'köpfråga' : invandning, allvar: 1, kopare, fraga, taggar };
  }
  if (invandning) {
    // Beröm som råkar nämna "material" eller "sol" är beröm, inte en invändning.
    const mjuk = !['skepsis/kritik', 'fukt/mögel/ventilation', 'pris/konkurrent'].includes(invandning);
    if (!(mjuk && !fraga && BEROM.test(t) && !NEGATION.test(t))) {
      return { niva: NIVA.INVANDNING, kategori: invandning, allvar: 2, kopare, fraga, taggar };
    }
  }

  if (fraga) return { niva: NIVA.FRAGA, kategori: kopfraga ? 'köpfråga' : 'fråga', allvar: 1, kopare, fraga, taggar };
  if (BEROM.test(t)) return { niva: NIVA.OVRIGT, kategori: NEGATION.test(t) ? 'skepsis/kritik' : 'beröm', allvar: 0, kopare, fraga, taggar };
  return { niva: NIVA.OVRIGT, kategori: 'övrigt', allvar: 0, kopare, fraga, taggar };
}

/** Sortering för rapporten: allvarligast först, sedan flest likes, sedan nyast. Ren. */
export function prioritet(a, b) {
  return (b.allvar - a.allvar) || ((b.likes ?? 0) - (a.likes ?? 0)) || String(b.tid).localeCompare(String(a.tid));
}
