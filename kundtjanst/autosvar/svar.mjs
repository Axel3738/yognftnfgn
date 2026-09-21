// svar.mjs — texten i de automatiska svaren. Mallar, inte modell: varje
// mening här är läst av en människa en gång, och det enda som varierar är
// faktan ur Shopify/17TRACK (ordernummer, datum, skanning, länk) och
// butikens egna tal (leveranslöfte, svarstid). Aldrig ett datum eller nummer
// som inte kom därifrån.
//
// Fem språk: sv (identiteten), nb, da, fi, en. Kundens språk avgör
// (klassificering.gissaSprak); okänt ⇒ butikens eget (brands.sprakForLand).
// ⚠️ nb/da/fi/en är skrivna av sessionen 2026-09-21, inte av en modersmåls-
// talare. Finskan är osäkrast. Rätta här, aldrig i koden som anropar.
//
// ARG-mallen är Axels egen (2026-09-21) — X byts mot kundens faktiska
// problem: "Hej! Jag eskalerar detta direkt till våra ansvariga. När jag ser
// vad du varit med om med X blir till och med jag riktigt frustrerad. Så här
// ska det verkligen inte vara. Jag återkommer så snart som möjligt."
//
// Signaturen är butikens supportnamn (brandfilen svar.signatur), aldrig "AI".

export const SPRAK = ['sv', 'nb', 'da', 'fi', 'en'];

const LOCALE = { sv: 'sv-SE', nb: 'nb-NO', da: 'da-DK', fi: 'fi-FI', en: 'en-GB' };
// Klockslagen i kundens egen tidszon — en finsk kund läser 11:00, inte 10:00.
const TIDSZON = { sv: 'Europe/Stockholm', nb: 'Europe/Oslo', da: 'Europe/Copenhagen', fi: 'Europe/Helsinki', en: 'Europe/Stockholm' };

/** Ett datum som kunden läser det: "12 september 2026" / "12. september 2026" / "12 September 2026". */
export function datumText(d, sprak = 'sv', { tid = false } = {}) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const tz = TIDSZON[sprak] ?? TIDSZON.sv;
  const locale = LOCALE[sprak] ?? LOCALE.sv;
  const datum = new Intl.DateTimeFormat(locale, { timeZone: tz, day: 'numeric', month: 'long', year: 'numeric' }).format(dt);
  if (!tid) return datum;
  // Datum och klockslag var för sig — annars skjuter sv-SE in "kl." och en-GB "at".
  const klocka = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(dt);
  return `${datum} ${klocka}`;
}

/** Kort datum utan år: "12 sep" — för leveransfönster i samma mening. */
export function kortDatum(d, sprak = 'sv') {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE[sprak] ?? LOCALE.sv, { timeZone: TIDSZON[sprak] ?? TIDSZON.sv, day: 'numeric', month: 'short' }).format(dt).replace(/\.$/, '');
}

const T = {
  sv: {
    halsning: (n) => (n ? `Hej ${n}!` : 'Hej!'),
    tack: 'Tack för ditt mejl.',
    kollat: (o) => `Jag har kollat upp din order ${o}.`,
    skickad: (d) => `Paketet skickades ${d}.`,
    skickadMedBolag: (d, b) => `Paketet skickades ${d} med ${b}.`,
    senaste: (rad) => `Senaste skanningen: ${rad}.`,
    ingenSkanning: 'Fraktbolaget brukar visa den första skanningen 2–4 dagar efter att paketet skickats.',
    folj: (l) => `Du följer paketet här: ${l}`,
    fonster: (a, b) => `Beräknad leverans: ${a}–${b}.`,
    fonsterDagar: (a, b) => `Beräknad leveranstid är ${a}–${b} dagar från att paketet skickas.`,
    ejSkickad: (o, d, n) => `Din order ${o} är mottagen ${d} och packas inom ${n} arbetsdagar. Du får ett mejl med spårningslänk så fort paketet skickas.`,
    leveranstid: (a, b, n) => `Leveranstiden är ${a}–${b} dagar från att paketet skickats. Vi skickar inom ${n} arbetsdagar efter beställningen, och du får ett mejl med spårningslänk när det går iväg.`,
    oppettider: (h) => `Vi svarar på mejl inom ${h} timmar på vardagar. Skriv gärna ordernumret i mejlet, så går det snabbare.`,
    adress: (o) => `Tack, jag har skickat din nya adress vidare till vårt lager med prioritet. Din order ${o} har inte skickats än. Hinner de ändra innan paketet går iväg går det till den nya adressen — hör av dig direkt om leveransbekräftelsen visar fel adress.`,
    arg: (x) => `Hej! Jag eskalerar detta direkt till våra ansvariga. När jag ser vad du varit med om med ${x} blir till och med jag riktigt frustrerad. Så här ska det verkligen inte vara. Jag återkommer så snart som möjligt.`,
    avslut: 'Hör av dig om du undrar något mer.',
    halsningSlut: 'Vänliga hälsningar',
    signatur: (b) => `Kundtjänst ${b}`,
    x: { ej_levererad: 'paketet som inte kommit fram', skadad_defekt: 'varan som inte är som den ska', fel_vara: 'att du fått fel vara', var_ar_ordern: 'väntan på ditt paket', aterbetalning: 'pengarna du väntar på', avbestallning: 'avbeställningen', retur_angerratt: 'returen', okand_debitering: 'debiteringen', chargeback_hot: 'din beställning', vantat: 'att du fått vänta på svar', levererat_ej_mottaget: 'paketet som inte kommit fram trots att det markerats som levererat', standard: 'din beställning' },
  },
  nb: {
    halsning: (n) => (n ? `Hei ${n}!` : 'Hei!'),
    tack: 'Takk for e-posten din.',
    kollat: (o) => `Jeg har sjekket bestillingen din ${o}.`,
    skickad: (d) => `Pakken ble sendt ${d}.`,
    skickadMedBolag: (d, b) => `Pakken ble sendt ${d} med ${b}.`,
    senaste: (rad) => `Siste skanning: ${rad}.`,
    ingenSkanning: 'Fraktselskapet viser vanligvis den første skanningen 2–4 dager etter at pakken er sendt.',
    folj: (l) => `Du følger pakken her: ${l}`,
    fonster: (a, b) => `Beregnet levering: ${a}–${b}.`,
    fonsterDagar: (a, b) => `Beregnet leveringstid er ${a}–${b} dager fra pakken sendes.`,
    ejSkickad: (o, d, n) => `Bestillingen din ${o} er mottatt ${d} og pakkes innen ${n} virkedager. Du får en e-post med sporingslenke så snart pakken sendes.`,
    leveranstid: (a, b, n) => `Leveringstiden er ${a}–${b} dager fra pakken er sendt. Vi sender innen ${n} virkedager etter bestillingen, og du får en e-post med sporingslenke når den går.`,
    oppettider: (h) => `Vi svarer på e-post innen ${h} timer på hverdager. Skriv gjerne ordrenummeret i e-posten, så går det raskere.`,
    adress: (o) => `Takk, jeg har sendt den nye adressen din videre til lageret vårt med prioritet. Bestillingen din ${o} er ikke sendt ennå. Rekker de å endre før pakken går, sendes den til den nye adressen — ta kontakt med en gang hvis leveringsbekreftelsen viser feil adresse.`,
    arg: (x) => `Hei! Jeg eskalerer dette direkte til de ansvarlige hos oss. Når jeg ser hva du har opplevd med ${x}, blir til og med jeg skikkelig frustrert. Slik skal det virkelig ikke være. Jeg kommer tilbake til deg så snart som mulig.`,
    avslut: 'Ta kontakt hvis du lurer på noe mer.',
    halsningSlut: 'Vennlig hilsen',
    signatur: (b) => `Kundeservice ${b}`,
    x: { ej_levererad: 'pakken som ikke har kommet frem', skadad_defekt: 'varen som ikke er som den skal', fel_vara: 'at du fikk feil vare', var_ar_ordern: 'ventingen på pakken din', aterbetalning: 'pengene du venter på', avbestallning: 'kanselleringen', retur_angerratt: 'returen', okand_debitering: 'belastningen', chargeback_hot: 'bestillingen din', vantat: 'at du har måttet vente på svar', levererat_ej_mottaget: 'pakken som ikke har kommet frem selv om den er merket som levert', standard: 'bestillingen din' },
  },
  da: {
    halsning: (n) => (n ? `Hej ${n}!` : 'Hej!'),
    tack: 'Tak for din mail.',
    kollat: (o) => `Jeg har tjekket din ordre ${o}.`,
    skickad: (d) => `Pakken blev sendt ${d}.`,
    skickadMedBolag: (d, b) => `Pakken blev sendt ${d} med ${b}.`,
    senaste: (rad) => `Seneste scanning: ${rad}.`,
    ingenSkanning: 'Fragtfirmaet viser normalt den første scanning 2–4 dage efter at pakken er sendt.',
    folj: (l) => `Du kan følge pakken her: ${l}`,
    fonster: (a, b) => `Forventet levering: ${a}–${b}.`,
    fonsterDagar: (a, b) => `Forventet leveringstid er ${a}–${b} dage fra pakken sendes.`,
    ejSkickad: (o, d, n) => `Din ordre ${o} er modtaget ${d} og pakkes inden for ${n} hverdage. Du får en mail med sporingslink, så snart pakken er sendt.`,
    leveranstid: (a, b, n) => `Leveringstiden er ${a}–${b} dage fra pakken er sendt. Vi sender inden for ${n} hverdage efter bestillingen, og du får en mail med sporingslink, når den afsendes.`,
    oppettider: (h) => `Vi svarer på mails inden for ${h} timer på hverdage. Skriv gerne ordrenummeret i mailen, så går det hurtigere.`,
    adress: (o) => `Tak, jeg har sendt din nye adresse videre til vores lager med prioritet. Din ordre ${o} er ikke sendt endnu. Når de at ændre den, før pakken afsendes, sendes den til den nye adresse — skriv straks, hvis leveringsbekræftelsen viser en forkert adresse.`,
    arg: (x) => `Hej! Jeg eskalerer dette direkte til de ansvarlige hos os. Når jeg ser, hvad du har været igennem med ${x}, bliver selv jeg rigtig frustreret. Sådan skal det virkelig ikke være. Jeg vender tilbage så hurtigt som muligt.`,
    avslut: 'Skriv endelig, hvis du har flere spørgsmål.',
    halsningSlut: 'Venlig hilsen',
    signatur: (b) => `Kundeservice ${b}`,
    x: { ej_levererad: 'pakken, der ikke er nået frem', skadad_defekt: 'varen, der ikke er som den skal være', fel_vara: 'at du fik en forkert vare', var_ar_ordern: 'ventetiden på din pakke', aterbetalning: 'pengene, du venter på', avbestallning: 'annulleringen', retur_angerratt: 'returneringen', okand_debitering: 'trækket på dit kort', chargeback_hot: 'din ordre', vantat: 'at du har måttet vente på svar', levererat_ej_mottaget: 'pakken, der ikke er nået frem, selvom den er markeret som leveret', standard: 'din ordre' },
  },
  fi: {
    halsning: (n) => (n ? `Hei ${n}!` : 'Hei!'),
    tack: 'Kiitos viestistäsi.',
    kollat: (o) => `Tarkistin tilauksesi ${o}.`,
    skickad: (d) => `Paketti lähetettiin ${d}.`,
    skickadMedBolag: (d, b) => `Paketti lähetettiin ${d} kuljetusyhtiöllä ${b}.`,
    senaste: (rad) => `Viimeisin skannaus: ${rad}.`,
    ingenSkanning: 'Kuljetusyhtiö näyttää ensimmäisen skannauksen yleensä 2–4 päivää lähetyksen jälkeen.',
    folj: (l) => `Voit seurata pakettia täällä: ${l}`,
    fonster: (a, b) => `Arvioitu toimitus: ${a}–${b}.`,
    fonsterDagar: (a, b) => `Arvioitu toimitusaika on ${a}–${b} päivää paketin lähettämisestä.`,
    ejSkickad: (o, d, n) => `Tilauksesi ${o} on vastaanotettu ${d}, ja se pakataan ${n} arkipäivän kuluessa. Saat sähköpostin seurantalinkillä heti, kun paketti lähetetään.`,
    leveranstid: (a, b, n) => `Toimitusaika on ${a}–${b} päivää paketin lähettämisestä. Lähetämme ${n} arkipäivän kuluessa tilauksesta, ja saat sähköpostin seurantalinkillä, kun paketti lähtee.`,
    oppettider: (h) => `Vastaamme sähköposteihin ${h} tunnin kuluessa arkipäivisin. Kirjoita tilausnumero viestiin, niin asia hoituu nopeammin.`,
    adress: (o) => `Kiitos, välitin uuden osoitteesi varastollemme kiireellisenä. Tilaustasi ${o} ei ole vielä lähetetty. Jos he ehtivät muuttaa osoitteen ennen lähetystä, paketti lähetetään uuteen osoitteeseen — ota heti yhteyttä, jos lähetysvahvistuksessa näkyy väärä osoite.`,
    arg: (x) => `Hei! Välitän tämän suoraan vastuuhenkilöillemme. Kun näen, mitä olet joutunut kokemaan ${x}, turhaudun itsekin toden teolla. Näin ei todellakaan kuulu olla. Palaan asiaan mahdollisimman pian.`,
    avslut: 'Ota yhteyttä, jos sinulla on muuta kysyttävää.',
    halsningSlut: 'Ystävällisin terveisin',
    signatur: (b) => `Asiakaspalvelu ${b}`,
    x: { ej_levererad: 'saapumattoman paketin kanssa', skadad_defekt: 'tuotteen kanssa, joka ei ole niin kuin pitäisi', fel_vara: 'väärän tuotteen kanssa', var_ar_ordern: 'pakettisi odottamisen kanssa', aterbetalning: 'odottamiesi rahojen kanssa', avbestallning: 'peruutuksen kanssa', retur_angerratt: 'palautuksen kanssa', okand_debitering: 'veloituksen kanssa', chargeback_hot: 'tilauksesi kanssa', vantat: 'vastauksen odottamisen kanssa', levererat_ej_mottaget: 'paketin kanssa, jota et ole saanut vaikka se on merkitty toimitetuksi', standard: 'tilauksesi kanssa' },
  },
  en: {
    halsning: (n) => (n ? `Hi ${n}!` : 'Hi!'),
    tack: 'Thanks for your email.',
    kollat: (o) => `I have looked up your order ${o}.`,
    skickad: (d) => `The parcel was shipped on ${d}.`,
    skickadMedBolag: (d, b) => `The parcel was shipped on ${d} with ${b}.`,
    senaste: (rad) => `Latest scan: ${rad}.`,
    ingenSkanning: 'The carrier usually shows the first scan 2–4 days after the parcel is shipped.',
    folj: (l) => `You can follow the parcel here: ${l}`,
    fonster: (a, b) => `Estimated delivery: ${a}–${b}.`,
    fonsterDagar: (a, b) => `Estimated delivery time is ${a}–${b} days from when the parcel is shipped.`,
    ejSkickad: (o, d, n) => `Your order ${o} was received on ${d} and is packed within ${n} working days. You will get an email with a tracking link as soon as the parcel ships.`,
    leveranstid: (a, b, n) => `Delivery takes ${a}–${b} days from when the parcel is shipped. We ship within ${n} working days of the order, and you get an email with a tracking link when it leaves.`,
    oppettider: (h) => `We answer emails within ${h} hours on weekdays. Please include your order number in the email — it speeds things up.`,
    adress: (o) => `Thank you, I have passed your new address on to our warehouse as a priority. Your order ${o} has not shipped yet. If they can change it before the parcel leaves, it will go to the new address — please reply straight away if the shipping confirmation shows the wrong address.`,
    arg: (x) => `Hi! I am escalating this directly to our team leads. When I see what you have been through with ${x}, even I get genuinely frustrated. This is really not how it should be. I will get back to you as soon as possible.`,
    avslut: 'Just reply if there is anything else.',
    halsningSlut: 'Kind regards',
    signatur: (b) => `Customer service ${b}`,
    x: { ej_levererad: 'the parcel that never arrived', skadad_defekt: 'the item not being as it should', fel_vara: 'receiving the wrong item', var_ar_ordern: 'the wait for your parcel', aterbetalning: 'the money you are waiting for', avbestallning: 'the cancellation', retur_angerratt: 'the return', okand_debitering: 'the charge', chargeback_hot: 'your order', vantat: 'having to wait for a reply', levererat_ej_mottaget: 'the parcel that has not reached you even though it is marked as delivered', standard: 'your order' },
  },
};

/** Kundens språk ur gissningen ('no' → 'nb', okänt → butikens). */
export function valjSprak(gissat, butikens = 'sv') {
  const g = String(gissat ?? '').toLowerCase();
  if (g === 'no') return 'nb';
  if (SPRAK.includes(g)) return g;
  return SPRAK.includes(butikens) ? butikens : 'sv';
}

/** Förnamnet till hälsningen — bara om det ser ut som ett namn (inte en adress, max två ord, inga siffror). */
export function fornamn({ mejlnamn = '', ordernamn = '' } = {}) {
  for (const kandidat of [ordernamn, mejlnamn]) {
    const s = String(kandidat ?? '').replace(/["']/g, '').trim();
    if (!s || s.includes('@') || /\d/.test(s)) continue;
    const ord = s.split(/\s+/);
    if (ord.length > 3) continue;
    const f = ord[0];
    if (f.length < 2 || f.length > 20) continue;
    return f[0].toUpperCase() + f.slice(1);
  }
  return '';
}

/** Signaturen: brandfilens egen, annars "Kundtjänst <brand>" på kundens språk. */
export function signatur(brand, sprak) {
  const t = T[sprak] ?? T.sv;
  return String(brand?.svar?.signatur ?? '').trim() || t.signatur(brand?.brand ?? '');
}

function slut(t, brand, sprak) {
  return `${t.avslut}\n\n${t.halsningSlut}\n${signatur(brand, sprak)}`;
}

/**
 * Det ENKLA svaret. `typ` = wismo|leveranstid|oppettider|adress, `fakta` ur
 * fakta.mjs, `brand` körkonfigen (svar.leverans_dagar, packas_dagar,
 * svarstid_timmar). Returnerar { text } eller kastar om faktan inte räcker —
 * anroparen ska då lägga mejlet i SVÅR, aldrig skicka en halv mening.
 */
export function skrivEnkelt({ typ, sprak = 'sv', fakta = {}, brand = {}, namn = '' } = {}) {
  const t = T[sprak] ?? T.sv;
  const sv = brand.svar ?? {};
  const [levMin, levMax] = Array.isArray(sv.leverans_dagar) && sv.leverans_dagar.length === 2 ? sv.leverans_dagar : [7, 14];
  const packas = Number(sv.packas_dagar) || 2;
  const rader = [t.halsning(namn), '', t.tack];
  const o = fakta.order;

  switch (typ) {
    case 'wismo': {
      if (!o) throw new Error('wismo utan order');
      rader.push(t.kollat(o.namn));
      const s = fakta.sandning;
      if (s?.skickad) {
        rader.push(s.bolag ? t.skickadMedBolag(datumText(s.skickad, sprak), s.bolag) : t.skickad(datumText(s.skickad, sprak)));
        if (fakta.sparning?.senaste) {
          const h = fakta.sparning.senaste;
          const rad = [datumText(h.tid, sprak, { tid: true }), h.text, h.plats].filter(Boolean).join(' · ');
          rader.push(t.senaste(rad));
        } else {
          rader.push(t.ingenSkanning);
        }
        if (fakta.lank) rader.push(t.folj(fakta.lank));
        if (fakta.fonster?.fran && fakta.fonster?.till) rader.push(t.fonster(kortDatum(fakta.fonster.fran, sprak), kortDatum(fakta.fonster.till, sprak)));
      } else if (s && !s.skickad) {
        // Sändning finns men utan datum: säg det vi vet, aldrig ett datum.
        rader.push(t.ingenSkanning);
        if (fakta.lank) rader.push(t.folj(fakta.lank));
      } else {
        if (!o.skapad) throw new Error('order utan datum');
        rader.push(t.ejSkickad(o.namn, datumText(o.skapad, sprak), packas));
        rader.push(t.fonsterDagar(levMin, levMax));
      }
      break;
    }
    case 'leveranstid':
      rader.push(t.leveranstid(levMin, levMax, packas));
      break;
    case 'oppettider':
      rader.push(t.oppettider(Number(sv.svarstid_timmar) || 24));
      break;
    case 'adress':
      if (!o) throw new Error('adress utan order');
      rader.push(t.adress(o.namn));
      break;
    default:
      throw new Error(`okänd enkel typ "${typ}"`);
  }
  rader.push('', slut(t, brand, sprak));
  return { text: rader.join('\n') };
}

// Vilket X den arga kunden får: det mest KONKRETA problemet i mejlet vinner
// över hotet ("min bank") — en kund som aldrig fått paketet och hotar med
// banken ska höra "paketet som inte kommit fram", inte "din beställning".
const X_KONKRET = ['ej_levererad', 'skadad_defekt', 'fel_vara', 'okand_debitering'];
const X_OVRIGA = ['avbestallning', 'retur_angerratt', 'var_ar_ordern'];   // aterbetalning ⇒ standard: "pengarna du väntar på" var fel när kunden just BEGÄRT pengarna (torrkörningen 2026-09-21)

/** X-nyckeln ur klassificeringen + ilskans orsaker (hinkar.arArg). Ren. */
export function xNyckelFor(klass, argOrsaker = []) {
  if (argOrsaker.some((o) => /levererat/.test(o))) return 'levererat_ej_mottaget';
  const traffade = new Set((klass?.alla ?? []).map((a) => a.id));
  const konkret = X_KONKRET.find((k) => traffade.has(k));
  if (konkret) return konkret;
  if (argOrsaker.some((o) => /tredje mejlet/.test(o))) return 'vantat';
  const ovrig = X_OVRIGA.find((k) => traffade.has(k));
  if (ovrig) return ovrig;
  return traffade.has('chargeback_hot') ? 'chargeback_hot' : 'standard';
}

/** Det ARGA svaret — Axels mall med X ur kategorin. */
export function skrivArgt({ sprak = 'sv', kategori = 'standard', brand = {}, xNyckel = null } = {}) {
  const t = T[sprak] ?? T.sv;
  const x = t.x[xNyckel ?? kategori] ?? t.x.standard;
  return { text: `${t.arg(x)}\n\n${t.halsningSlut}\n${signatur(brand, sprak)}`, x };
}

/** Alla meningar för ett språk (testerna kontrollerar att inget saknas). */
export function mallar(sprak) {
  return T[sprak] ?? null;
}
