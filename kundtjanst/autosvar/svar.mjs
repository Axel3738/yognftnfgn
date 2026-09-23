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
// ARG-mallen är Axels (feedbacken 2026-09-22 på de första utkasten): börja
// ALDRIG med "jag eskalerar detta" — börja med empati och sätt ord på
// problemet, och var minst lika arg på problemet som kunden, gärna argare:
//   "Hej Tobias! Jag förstår helt din frustration. En produkt som inte alls
//   ser ut som på bilden är helt oacceptabelt, och det är inget vi står för.
//   Jag har eskalerat det här direkt till vårt ansvariga team som ett
//   brådskande ärende. Du kan räkna med svar inom 48 timmar.
//   [ordernumret om det saknas | har du mer information … svara] [bilderna]"
// X är en HEL mening om kundens faktiska problem (t.x), personligt per ärende;
// en opostad order får antalet dagar ("legat opostad i 13 dagar").
//
// ⚠️ INGA TANKSTRECK i mejltext (Axels feedback 2026-09-22 på andra rundan:
// "det märker man direkt att det är AI och det känns bara opersonligt").
// Inga "—" mellan satser, inga "–" i intervall: "1-2 arbetsdagar",
// "24 sep till 1 okt". Testet kontrollerar varje mall på alla språk.
//
// WISMO-svaret (samma feedback): aldrig avsändningsdatum, aldrig fraktbolaget
// för första sträckan, aldrig "framme i Sverige" — bara var paketet ÄR
// ("ligger hos DHL för sista biten, 1-2 arbetsdagar"), länken och
// bävernumret. Returen (Axels beslut samma dag: "vill ha retur direkt →
// skicka returinformationen direkt") följer VA:ns egna returmejl i Skickat,
// plus "posta direkt till adressen, vi hämtar inte ut paket från ombud".
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

export const ESKALERING_TIMMAR = 48;   // "svar inom 48 timmar" (Axels beslut 2026-09-22: sätt förväntningen där, svara snabbare)

// Returblocket: r = { adress: [rader], ordernummer: '#6600' | '', dagar, frakt: 'kund'|'butik'|'', policy }.
// Aldrig ordet återbetalning (löftesspärren) — bara vad kunden ska göra.
const T = {
  sv: {
    halsning: (n) => (n ? `Hej ${n}!` : 'Hej!'),
    tack: 'Tack för ditt mejl.',
    kollat: (o) => `Jag har kollat upp din order ${o}.`,
    paVag: 'Paketet är skickat och på väg.',
    senaste: (d) => `Senaste uppdateringen från fraktbolaget: ${d}.`,
    ingenSkanning: 'Fraktbolaget brukar visa den första skanningen 2-4 dagar efter att paketet skickats.',
    folj: (l, nr) => (nr ? `Ditt spårningsnummer hos oss är ${nr}, och du följer paketet här: ${l}` : `Du följer paketet här: ${l}`),
    fonster: (a, b) => `Beräknad leverans: ${a} till ${b}.`,
    fonsterDagar: (a, b) => `Beräknad leveranstid är ${a}-${b} dagar från att paketet skickas.`,
    ejSkickad: (o, d, n) => `Din order ${o} är mottagen ${d} och packas inom ${n} arbetsdagar. Du får ett mejl med spårningslänk så fort paketet skickas.`,
    leveranstid: (a, b, n) => `Leveranstiden är ${a}-${b} dagar från att paketet skickats. Vi skickar inom ${n} arbetsdagar efter beställningen, och du får ett mejl med spårningslänk när det går iväg. Kolla även skräpposten om mejlet inte syns.`,
    oppettider: (h) => `Vi svarar på mejl inom ${h} timmar på vardagar. Skriv gärna ordernumret i mejlet, så går det snabbare.`,
    adress: (o) => `Tack, jag har skickat din nya adress vidare till vårt lager med prioritet. Din order ${o} har inte skickats än. Hinner de ändra innan paketet går iväg går det till den nya adressen. Hör av dig direkt om leveransbekräftelsen visar fel adress.`,
    // ARG (Axels feedback 2026-09-22): empati, problemet i klartext, sen eskaleringen.
    arg: (x) => `Jag förstår helt din frustration. ${x}`,
    eskalerat: (h) => `Jag har eskalerat det här direkt till vårt ansvariga team som ett brådskande ärende. Du kan räkna med svar inom ${h} timmar.`,
    merInfo: 'Har du mer information som kan hjälpa oss lösa det snabbare får du gärna svara på det här mejlet.',
    // Saknas ordernumret (inte i mejlet, ingen order på adressen) ersätter den här raden merInfo (Tobias-feedbacken).
    ordernummerArg: 'För att vi ska kunna hitta din order behöver vi ditt ordernummer. Skriv gärna det i ditt svar, tillsammans med annat som kan hjälpa oss lösa det snabbare.',
    opostad: (n) => `Din order har legat opostad i ${n} dagar, och det är inte acceptabelt.`,
    lageIntro: (o) => `Det här ser jag just nu om din order ${o}:`,
    // SOP 36/37: spårningen får stå still, sista biten tar 1-2 arbetsdagar, ombud/ute för leverans.
    stilla: 'Det är helt normalt att spårningen står still några dagar under transporten. Paketet är på väg ändå.',
    framme: (bolag) => `Paketet ligger hos ${bolag} för sista biten. Det brukar levereras inom 1-2 arbetsdagar.`,
    uteForLeverans: 'Paketet är ute för leverans i dag.',
    hamta: (bolag, nr, lank) => `Paketet finns att hämta hos ombudet${bolag ? ` (${bolag}${nr ? `, kolli ${nr}` : ''})` : ''}.${lank ? ` Ombud och öppettider: ${lank}` : ''}`,
    // SOP 06: levererat men inte mottaget — checklistan, aldrig ordet "borttappat".
    levererad: (d, plats) => `Enligt fraktbolaget levererades paketet ${d}${plats ? ` (${plats})` : ''}.`,
    levereradUtanDatum: 'Enligt fraktbolaget är paketet levererat.',
    levereradKolla: 'Kolla gärna: brevlådan, om det ligger en avi om ombud, närmaste utlämningsställe, hos grannar och en skyddad plats vid dörren. Hittar du det ändå inte: svara på det här mejlet så undersöker vi vidare direkt.',
    // SOP 11/30: bekräftelsen ligger oftast i skräpposten.
    skrappost: (b) => `Orderbekräftelsen och spårningsmejlet kan ha hamnat i skräpposten. Sök gärna på "${b}" i mejlen.`,
    // SOP 05/08: första svaret på en skadad eller fel vara ber om tre bilder.
    foton: 'För att vi ska kunna lösa det snabbt: skicka gärna en bild på varan, en på förpackningen och en på fraktetiketten, så har vi allt när vi tar det vidare.',
    // Den lugna kundens första svar på en skadad/fel vara (ENKEL `foton`): beklagan utan löfte, bilderna, ordernumret om det saknas.
    beklagar: 'Tråkigt att höra att leveransen inte blev som den skulle. Det tittar vi på direkt.',
    // Varan har slutat fungera/läcker (Hans bränslepump 2026-09-22): "leveransen" och fraktetiketten passar inte, be om bild eller video på felet.
    beklagarVara: 'Tråkigt att höra att varan inte fungerar som den ska. Det tittar vi på direkt.',
    fotonVara: 'För att vi ska kunna lösa det snabbt: skicka gärna en bild eller en kort video på varan där felet syns, så har vi allt när vi tar det vidare.',
    fotonOrdernummer: 'Skriv gärna även ditt ordernummer i svaret, så hittar vi ordern direkt.',
    // Returen — VA:ns egna returmejl i Skickat (2026-09-16, 2026-09-14) som förlaga + Axels rad om ombud (2026-09-22).
    retur: (r) => [
      'Så här gör du returen:',
      '1. Packa varan i originalförpackningen och i samma skick som du fick den.',
      `2. Skriv ditt namn och ordernummer${r.ordernummer ? ` (${r.ordernummer})` : ''} tydligt på utsidan av paketet, och lägg med en kopia av orderbekräftelsen inuti.`,
      '3. Skicka paketet till:',
      ...r.adress,
      'Skicka det som brev eller paket direkt till adressen ovan, inte till ett ombud. Vi hämtar inte ut paket från ombud.',
      '4. Använd gärna en spårbar frakttjänst, och svara på det här mejlet med spårningsnumret när du postat paketet. Då följer vi upp så fort det kommit fram.',
      ...(r.frakt === 'kund' ? ['Returfrakten står du själv för.'] : r.frakt === 'butik' ? ['Vi står för returfrakten. Svara på det här mejlet så ordnar vi en fraktsedel.'] : []),
      ...(r.dagar ? [`Returen ska skickas inom ${r.dagar} dagar från att du tog emot varan.`] : []),
      ...(r.policy ? [`Hela returpolicyn: ${r.policy}`] : []),
    ].join('\n'),
    // SOP 36 steg 1: utan order — be om ordernumret (bara med svar.fraga_ordernummer).
    ordernummer: 'För att kunna söka upp din order behöver jag ditt ordernummer. Det står i orderbekräftelsen du fick när du beställde. Kolla även skräpposten. Skicka det så återkommer vi så snart som möjligt.',
    // SOP 38: företagsuppgifterna är offentliga och ska gå ut direkt.
    foretag: (f) => `Här är företagsuppgifterna: ${f.namn}, organisationsnummer ${f.orgnr}, ${f.adress}.${f.moms ? ' Företaget är momsregistrerat.' : ''}`,
    avslut: 'Hör av dig om du undrar något mer.',
    halsningSlut: 'Vänliga hälsningar',
    signatur: (b) => `Kundtjänst ${b}`,
    // X = HELA meningen om kundens problem. Minst lika arg som kunden.
    x: {
      ej_levererad: 'Ett paket som inte kommit fram är helt oacceptabelt, och det är inget vi står för.',
      skadad_defekt: 'En vara som kommer fram trasig eller inte fungerar är helt oacceptabelt, och det är inget vi står för.',
      fel_vara: 'En produkt som inte stämmer med det du beställde är helt oacceptabelt, och det är inget vi står för.',
      som_pa_bilden: 'En produkt som inte alls ser ut som på bilden är helt oacceptabelt, och det är inget vi står för.',
      kvalitet: 'En vara som inte håller den kvalitet du betalat för är helt oacceptabelt, och det är inget vi står för.',
      var_ar_ordern: 'Att behöva vänta så här på sitt paket är inte acceptabelt, och det är inget vi står för.',
      aterbetalning: 'Det du beskriver är helt oacceptabelt, och det är inget vi står för.',
      avbestallning: 'Det du beskriver kring din avbeställning är inte acceptabelt, och det är inget vi står för.',
      retur_angerratt: 'Det du beskriver är helt oacceptabelt, och det är inget vi står för.',
      okand_debitering: 'En debitering du inte känner igen är helt oacceptabelt, och det ska redas ut direkt.',
      chargeback_hot: 'Det du beskriver är helt oacceptabelt, och det är inget vi står för.',
      vantat: 'Att du fått vänta på svar är inte acceptabelt, och det är inget vi står för.',
      levererat_ej_mottaget: 'Ett paket som markerats som levererat utan att du fått det är helt oacceptabelt, och det är inget vi står för.',
      standard: 'Det du beskriver är helt oacceptabelt, och det är inget vi står för.',
    },
  },
  nb: {
    halsning: (n) => (n ? `Hei ${n}!` : 'Hei!'),
    tack: 'Takk for e-posten din.',
    kollat: (o) => `Jeg har sjekket bestillingen din ${o}.`,
    paVag: 'Pakken er sendt og på vei.',
    senaste: (d) => `Siste oppdatering fra fraktselskapet: ${d}.`,
    ingenSkanning: 'Fraktselskapet viser vanligvis den første skanningen 2-4 dager etter at pakken er sendt.',
    folj: (l, nr) => (nr ? `Sporingsnummeret ditt hos oss er ${nr}, og du følger pakken her: ${l}` : `Du følger pakken her: ${l}`),
    fonster: (a, b) => `Beregnet levering: ${a} til ${b}.`,
    fonsterDagar: (a, b) => `Beregnet leveringstid er ${a}-${b} dager fra pakken sendes.`,
    ejSkickad: (o, d, n) => `Bestillingen din ${o} er mottatt ${d} og pakkes innen ${n} virkedager. Du får en e-post med sporingslenke så snart pakken sendes.`,
    leveranstid: (a, b, n) => `Leveringstiden er ${a}-${b} dager fra pakken er sendt. Vi sender innen ${n} virkedager etter bestillingen, og du får en e-post med sporingslenke når den går. Sjekk også søppelposten hvis e-posten ikke dukker opp.`,
    oppettider: (h) => `Vi svarer på e-post innen ${h} timer på hverdager. Skriv gjerne ordrenummeret i e-posten, så går det raskere.`,
    adress: (o) => `Takk, jeg har sendt den nye adressen din videre til lageret vårt med prioritet. Bestillingen din ${o} er ikke sendt ennå. Rekker de å endre før pakken går, sendes den til den nye adressen. Ta kontakt med en gang hvis leveringsbekreftelsen viser feil adresse.`,
    arg: (x) => `Jeg forstår frustrasjonen din fullt ut. ${x}`,
    eskalerat: (h) => `Jeg har eskalert dette direkte til det ansvarlige teamet vårt som en hastesak. Du kan regne med svar innen ${h} timer.`,
    merInfo: 'Har du mer informasjon som kan hjelpe oss å løse dette raskere, er det bare å svare på denne e-posten.',
    ordernummerArg: 'For at vi skal kunne finne bestillingen din trenger vi ordrenummeret ditt. Skriv det gjerne i svaret ditt, sammen med annet som kan hjelpe oss å løse dette raskere.',
    opostad: (n) => `Bestillingen din har ligget usendt i ${n} dager, og det er ikke akseptabelt.`,
    lageIntro: (o) => `Dette ser jeg akkurat nå om bestillingen din ${o}:`,
    stilla: 'Det er helt normalt at sporingen står stille noen dager underveis. Pakken er på vei likevel.',
    framme: (bolag) => `Pakken ligger hos ${bolag} for siste etappe. Den blir vanligvis levert innen 1-2 virkedager.`,
    uteForLeverans: 'Pakken er ute for levering i dag.',
    hamta: (bolag, nr, lank) => `Pakken kan hentes på utleveringsstedet${bolag ? ` (${bolag}${nr ? `, kolli ${nr}` : ''})` : ''}.${lank ? ` Utleveringssted og åpningstider: ${lank}` : ''}`,
    levererad: (d, plats) => `Ifølge fraktselskapet ble pakken levert ${d}${plats ? ` (${plats})` : ''}.`,
    levereradUtanDatum: 'Ifølge fraktselskapet er pakken levert.',
    levereradKolla: 'Sjekk gjerne: postkassen, om det ligger en hentelapp, nærmeste utleveringssted, hos naboer og et skjermet sted ved døren. Finner du den fortsatt ikke: svar på denne e-posten, så undersøker vi videre med en gang.',
    skrappost: (b) => `Ordrebekreftelsen og sporingsmailen kan ha havnet i søppelposten. Søk gjerne på "${b}" i e-posten.`,
    foton: 'For at vi skal kunne løse dette raskt: send gjerne et bilde av varen, ett av emballasjen og ett av fraktetiketten, så har vi alt når vi tar det videre.',
    beklagar: 'Leit å høre at leveransen ikke ble som den skulle. Det ser vi på med en gang.',
    beklagarVara: 'Leit å høre at varen ikke fungerer som den skal. Det ser vi på med en gang.',
    fotonVara: 'For at vi skal kunne løse dette raskt: send gjerne et bilde eller en kort video av varen der feilen synes, så har vi alt når vi tar det videre.',
    fotonOrdernummer: 'Skriv gjerne også ordrenummeret ditt i svaret, så finner vi bestillingen med en gang.',
    retur: (r) => [
      'Slik gjør du returen:',
      '1. Pakk varen i originalemballasjen og i samme stand som du fikk den.',
      `2. Skriv navnet ditt og ordrenummeret${r.ordernummer ? ` (${r.ordernummer})` : ''} tydelig på utsiden av pakken, og legg ved en kopi av ordrebekreftelsen.`,
      '3. Send pakken til:',
      ...r.adress,
      'Send den som brev eller pakke direkte til adressen over, ikke til et hentested. Vi henter ikke ut pakker fra hentesteder.',
      '4. Bruk gjerne en sporbar frakttjeneste, og svar på denne e-posten med sporingsnummeret når du har sendt pakken. Da følger vi opp så snart den har kommet frem.',
      ...(r.frakt === 'kund' ? ['Returfrakten betaler du selv.'] : r.frakt === 'butik' ? ['Vi dekker returfrakten. Svar på denne e-posten, så ordner vi en fraktseddel.'] : []),
      ...(r.dagar ? [`Returen må sendes innen ${r.dagar} dager etter at du mottok varen.`] : []),
      ...(r.policy ? [`Hele returpolicyen: ${r.policy}`] : []),
    ].join('\n'),
    ordernummer: 'For å finne bestillingen din trenger jeg ordrenummeret ditt. Det står i ordrebekreftelsen du fikk da du bestilte. Sjekk også søppelposten. Send det, så kommer vi tilbake til deg så snart som mulig.',
    foretag: (f) => `Her er firmaopplysningene: ${f.namn}, organisasjonsnummer ${f.orgnr}, ${f.adress}.${f.moms ? ' Selskapet er mva-registrert.' : ''}`,
    avslut: 'Ta kontakt hvis du lurer på noe mer.',
    halsningSlut: 'Vennlig hilsen',
    signatur: (b) => `Kundeservice ${b}`,
    x: {
      ej_levererad: 'En pakke som ikke har kommet frem er helt uakseptabelt, og det er ikke noe vi står for.',
      skadad_defekt: 'En vare som kommer frem ødelagt eller ikke fungerer er helt uakseptabelt, og det er ikke noe vi står for.',
      fel_vara: 'Et produkt som ikke stemmer med det du bestilte er helt uakseptabelt, og det er ikke noe vi står for.',
      som_pa_bilden: 'Et produkt som ikke ser ut som på bildet i det hele tatt er helt uakseptabelt, og det er ikke noe vi står for.',
      kvalitet: 'En vare som ikke holder den kvaliteten du har betalt for er helt uakseptabelt, og det er ikke noe vi står for.',
      var_ar_ordern: 'Å måtte vente slik på pakken sin er ikke akseptabelt, og det er ikke noe vi står for.',
      aterbetalning: 'Det du beskriver er helt uakseptabelt, og det er ikke noe vi står for.',
      avbestallning: 'Det du beskriver rundt kanselleringen din er ikke akseptabelt, og det er ikke noe vi står for.',
      retur_angerratt: 'Det du beskriver er helt uakseptabelt, og det er ikke noe vi står for.',
      okand_debitering: 'En belastning du ikke kjenner igjen er helt uakseptabelt, og det skal ryddes opp i med en gang.',
      chargeback_hot: 'Det du beskriver er helt uakseptabelt, og det er ikke noe vi står for.',
      vantat: 'At du har måttet vente på svar er ikke akseptabelt, og det er ikke noe vi står for.',
      levererat_ej_mottaget: 'En pakke som er merket som levert uten at du har fått den er helt uakseptabelt, og det er ikke noe vi står for.',
      standard: 'Det du beskriver er helt uakseptabelt, og det er ikke noe vi står for.',
    },
  },
  da: {
    halsning: (n) => (n ? `Hej ${n}!` : 'Hej!'),
    tack: 'Tak for din mail.',
    kollat: (o) => `Jeg har tjekket din ordre ${o}.`,
    paVag: 'Pakken er sendt og på vej.',
    senaste: (d) => `Seneste opdatering fra fragtfirmaet: ${d}.`,
    ingenSkanning: 'Fragtfirmaet viser normalt den første scanning 2-4 dage efter at pakken er sendt.',
    folj: (l, nr) => (nr ? `Dit sporingsnummer hos os er ${nr}, og du kan følge pakken her: ${l}` : `Du kan følge pakken her: ${l}`),
    fonster: (a, b) => `Forventet levering: ${a} til ${b}.`,
    fonsterDagar: (a, b) => `Forventet leveringstid er ${a}-${b} dage fra pakken sendes.`,
    ejSkickad: (o, d, n) => `Din ordre ${o} er modtaget ${d} og pakkes inden for ${n} hverdage. Du får en mail med sporingslink, så snart pakken er sendt.`,
    leveranstid: (a, b, n) => `Leveringstiden er ${a}-${b} dage fra pakken er sendt. Vi sender inden for ${n} hverdage efter bestillingen, og du får en mail med sporingslink, når den afsendes. Tjek også spam, hvis mailen ikke dukker op.`,
    oppettider: (h) => `Vi svarer på mails inden for ${h} timer på hverdage. Skriv gerne ordrenummeret i mailen, så går det hurtigere.`,
    adress: (o) => `Tak, jeg har sendt din nye adresse videre til vores lager med prioritet. Din ordre ${o} er ikke sendt endnu. Når de at ændre den, før pakken afsendes, sendes den til den nye adresse. Skriv straks, hvis leveringsbekræftelsen viser en forkert adresse.`,
    arg: (x) => `Jeg forstår fuldt ud din frustration. ${x}`,
    eskalerat: (h) => `Jeg har eskaleret det her direkte til vores ansvarlige team som en hastesag. Du kan regne med svar inden for ${h} timer.`,
    merInfo: 'Har du flere oplysninger, der kan hjælpe os med at løse det hurtigere, må du meget gerne svare på denne mail.',
    ordernummerArg: 'For at vi kan finde din ordre har vi brug for dit ordrenummer. Skriv det gerne i dit svar, sammen med andet, der kan hjælpe os med at løse det hurtigere.',
    opostad: (n) => `Din ordre har ligget uafsendt i ${n} dage, og det er ikke acceptabelt.`,
    lageIntro: (o) => `Det her kan jeg se lige nu om din ordre ${o}:`,
    stilla: 'Det er helt normalt, at sporingen står stille nogle dage undervejs. Pakken er på vej alligevel.',
    framme: (bolag) => `Pakken ligger hos ${bolag} til den sidste del. Den bliver normalt leveret inden for 1-2 hverdage.`,
    uteForLeverans: 'Pakken er ude til levering i dag.',
    hamta: (bolag, nr, lank) => `Pakken kan hentes i pakkeshoppen${bolag ? ` (${bolag}${nr ? `, kolli ${nr}` : ''})` : ''}.${lank ? ` Pakkeshop og åbningstider: ${lank}` : ''}`,
    levererad: (d, plats) => `Ifølge fragtfirmaet blev pakken leveret ${d}${plats ? ` (${plats})` : ''}.`,
    levereradUtanDatum: 'Ifølge fragtfirmaet er pakken leveret.',
    levereradKolla: 'Tjek gerne: postkassen, om der ligger en afhentningsseddel, nærmeste pakkeshop, hos naboer og et beskyttet sted ved døren. Finder du den stadig ikke: svar på denne mail, så undersøger vi det straks nærmere.',
    skrappost: (b) => `Ordrebekræftelsen og sporingsmailen kan være havnet i spam. Søg gerne på "${b}" i din mail.`,
    foton: 'For at vi kan løse det hurtigt: send gerne et billede af varen, et af emballagen og et af fragtlabelen, så har vi det hele, når vi går videre med sagen.',
    beklagar: 'Ærgerligt at høre, at leveringen ikke blev, som den skulle. Det kigger vi på med det samme.',
    beklagarVara: 'Ærgerligt at høre, at varen ikke fungerer, som den skal. Det kigger vi på med det samme.',
    fotonVara: 'For at vi kan løse det hurtigt: send gerne et billede eller en kort video af varen, hvor fejlen kan ses, så har vi det hele, når vi går videre med sagen.',
    fotonOrdernummer: 'Skriv gerne også dit ordrenummer i svaret, så finder vi ordren med det samme.',
    retur: (r) => [
      'Sådan gør du med returen:',
      '1. Pak varen i originalemballagen og i samme stand, som du modtog den.',
      `2. Skriv dit navn og ordrenummer${r.ordernummer ? ` (${r.ordernummer})` : ''} tydeligt uden på pakken, og læg en kopi af ordrebekræftelsen i.`,
      '3. Send pakken til:',
      ...r.adress,
      'Send den som brev eller pakke direkte til adressen ovenfor, ikke til en pakkeshop. Vi henter ikke pakker i pakkeshops.',
      '4. Brug gerne en sporbar fragtservice, og svar på denne mail med sporingsnummeret, når du har sendt pakken. Så følger vi op, så snart den er nået frem.',
      ...(r.frakt === 'kund' ? ['Returfragten betaler du selv.'] : r.frakt === 'butik' ? ['Vi betaler returfragten. Svar på denne mail, så sender vi en fragtlabel.'] : []),
      ...(r.dagar ? [`Returen skal sendes inden for ${r.dagar} dage, efter at du modtog varen.`] : []),
      ...(r.policy ? [`Hele returpolitikken: ${r.policy}`] : []),
    ].join('\n'),
    ordernummer: 'For at finde din ordre har jeg brug for dit ordrenummer. Det står i ordrebekræftelsen, du fik, da du bestilte. Tjek også spam. Send det, så vender vi tilbage hurtigst muligt.',
    foretag: (f) => `Her er virksomhedsoplysningerne: ${f.namn}, organisationsnummer ${f.orgnr}, ${f.adress}.${f.moms ? ' Virksomheden er momsregistreret.' : ''}`,
    avslut: 'Skriv endelig, hvis du har flere spørgsmål.',
    halsningSlut: 'Venlig hilsen',
    signatur: (b) => `Kundeservice ${b}`,
    x: {
      ej_levererad: 'En pakke, der ikke er nået frem, er helt uacceptabelt, og det er ikke noget, vi står for.',
      skadad_defekt: 'En vare, der kommer frem i stykker eller ikke virker, er helt uacceptabelt, og det er ikke noget, vi står for.',
      fel_vara: 'Et produkt, der ikke stemmer med det, du bestilte, er helt uacceptabelt, og det er ikke noget, vi står for.',
      som_pa_bilden: 'Et produkt, der slet ikke ligner billedet, er helt uacceptabelt, og det er ikke noget, vi står for.',
      kvalitet: 'En vare, der ikke holder den kvalitet, du har betalt for, er helt uacceptabelt, og det er ikke noget, vi står for.',
      var_ar_ordern: 'At skulle vente sådan på sin pakke er ikke acceptabelt, og det er ikke noget, vi står for.',
      aterbetalning: 'Det, du beskriver, er helt uacceptabelt, og det er ikke noget, vi står for.',
      avbestallning: 'Det, du beskriver omkring din annullering, er ikke acceptabelt, og det er ikke noget, vi står for.',
      retur_angerratt: 'Det, du beskriver, er helt uacceptabelt, og det er ikke noget, vi står for.',
      okand_debitering: 'Et træk, du ikke kan genkende, er helt uacceptabelt, og det skal der ryddes op i med det samme.',
      chargeback_hot: 'Det, du beskriver, er helt uacceptabelt, og det er ikke noget, vi står for.',
      vantat: 'At du har måttet vente på svar er ikke acceptabelt, og det er ikke noget, vi står for.',
      levererat_ej_mottaget: 'En pakke, der er markeret som leveret, uden at du har fået den, er helt uacceptabelt, og det er ikke noget, vi står for.',
      standard: 'Det, du beskriver, er helt uacceptabelt, og det er ikke noget, vi står for.',
    },
  },
  fi: {
    halsning: (n) => (n ? `Hei ${n}!` : 'Hei!'),
    tack: 'Kiitos viestistäsi.',
    kollat: (o) => `Tarkistin tilauksesi ${o}.`,
    paVag: 'Paketti on lähetetty ja matkalla.',
    senaste: (d) => `Viimeisin päivitys kuljetusyhtiöltä: ${d}.`,
    ingenSkanning: 'Kuljetusyhtiö näyttää ensimmäisen skannauksen yleensä 2-4 päivää lähetyksen jälkeen.',
    folj: (l, nr) => (nr ? `Seurantanumerosi meillä on ${nr}, ja voit seurata pakettia täällä: ${l}` : `Voit seurata pakettia täällä: ${l}`),
    fonster: (a, b) => `Arvioitu toimitus ${a} ja ${b} välillä.`,
    fonsterDagar: (a, b) => `Arvioitu toimitusaika on ${a}-${b} päivää paketin lähettämisestä.`,
    ejSkickad: (o, d, n) => `Tilauksesi ${o} on vastaanotettu ${d}, ja se pakataan ${n} arkipäivän kuluessa. Saat sähköpostin seurantalinkillä heti, kun paketti lähetetään.`,
    leveranstid: (a, b, n) => `Toimitusaika on ${a}-${b} päivää paketin lähettämisestä. Lähetämme ${n} arkipäivän kuluessa tilauksesta, ja saat sähköpostin seurantalinkillä, kun paketti lähtee. Tarkista myös roskaposti, jos viesti ei näy.`,
    oppettider: (h) => `Vastaamme sähköposteihin ${h} tunnin kuluessa arkipäivisin. Kirjoita tilausnumero viestiin, niin asia hoituu nopeammin.`,
    adress: (o) => `Kiitos, välitin uuden osoitteesi varastollemme kiireellisenä. Tilaustasi ${o} ei ole vielä lähetetty. Jos he ehtivät muuttaa osoitteen ennen lähetystä, paketti lähetetään uuteen osoitteeseen. Ota heti yhteyttä, jos lähetysvahvistuksessa näkyy väärä osoite.`,
    arg: (x) => `Ymmärrän turhautumisesi täysin. ${x}`,
    eskalerat: (h) => `Olen välittänyt tämän suoraan vastuutiimillemme kiireellisenä asiana. Voit odottaa vastausta ${h} tunnin kuluessa.`,
    merInfo: 'Jos sinulla on lisätietoja, jotka auttavat meitä ratkaisemaan asian nopeammin, vastaa tähän viestiin.',
    ordernummerArg: 'Jotta löydämme tilauksesi, tarvitsemme tilausnumerosi. Kirjoita se vastaukseesi yhdessä muiden tietojen kanssa, jotka voivat auttaa meitä ratkaisemaan asian nopeammin.',
    opostad: (n) => `Tilauksesi on ollut lähettämättä ${n} päivää, eikä se ole hyväksyttävää.`,
    lageIntro: (o) => `Tämän näen juuri nyt tilauksestasi ${o}:`,
    stilla: 'On aivan normaalia, että seuranta pysyy paikallaan muutaman päivän kuljetuksen aikana. Paketti on silti matkalla.',
    framme: (bolag) => `Paketti on ${bolag}:n käsittelyssä viimeistä osuutta varten. Se toimitetaan yleensä 1-2 arkipäivän kuluessa.`,
    uteForLeverans: 'Paketti on jakelussa tänään.',
    hamta: (bolag, nr, lank) => `Paketti on noudettavissa noutopisteestä${bolag ? ` (${bolag}${nr ? `, kolli ${nr}` : ''})` : ''}.${lank ? ` Noutopiste ja aukioloajat: ${lank}` : ''}`,
    levererad: (d, plats) => `Kuljetusyhtiön mukaan paketti toimitettiin ${d}${plats ? ` (${plats})` : ''}.`,
    levereradUtanDatum: 'Kuljetusyhtiön mukaan paketti on toimitettu.',
    levereradKolla: 'Tarkista: postilaatikko, mahdollinen saapumisilmoitus, lähin noutopiste, naapurit ja suojainen paikka oven luona. Jos et vieläkään löydä sitä: vastaa tähän viestiin, niin selvitämme asiaa heti lisää.',
    skrappost: (b) => `Tilausvahvistus ja seurantaviesti ovat voineet päätyä roskapostiin. Hae sähköpostistasi hakusanalla "${b}".`,
    foton: 'Jotta voimme ratkaista asian nopeasti: lähetä kuva tuotteesta, kuva pakkauksesta ja kuva rahtietiketistä, niin meillä on kaikki valmiina, kun viemme asiaa eteenpäin.',
    beklagar: 'Ikävä kuulla, ettei toimitus ollut sellainen kuin piti. Katsomme asian heti.',
    beklagarVara: 'Ikävä kuulla, ettei tuote toimi niin kuin pitäisi. Katsomme asian heti.',
    fotonVara: 'Jotta voimme ratkaista asian nopeasti: lähetä kuva tai lyhyt video tuotteesta niin, että vika näkyy, niin meillä on kaikki valmiina, kun viemme asiaa eteenpäin.',
    fotonOrdernummer: 'Kirjoita vastaukseen myös tilausnumerosi, niin löydämme tilauksen heti.',
    retur: (r) => [
      'Näin teet palautuksen:',
      '1. Pakkaa tuote alkuperäispakkaukseen ja samaan kuntoon kuin sen sait.',
      `2. Kirjoita nimesi ja tilausnumerosi${r.ordernummer ? ` (${r.ordernummer})` : ''} selvästi paketin päälle ja laita mukaan kopio tilausvahvistuksesta.`,
      '3. Lähetä paketti osoitteeseen:',
      ...r.adress,
      'Lähetä se kirjeenä tai pakettina suoraan yllä olevaan osoitteeseen, ei noutopisteeseen. Emme nouda paketteja noutopisteistä.',
      '4. Käytä mielellään seurattavaa lähetystapaa ja vastaa tähän viestiin seurantanumerolla, kun olet postittanut paketin. Seuraamme asiaa heti, kun paketti on saapunut.',
      ...(r.frakt === 'kund' ? ['Palautuskulut maksat itse.'] : r.frakt === 'butik' ? ['Me maksamme palautuskulut. Vastaa tähän viestiin, niin järjestämme rahtikirjan.'] : []),
      ...(r.dagar ? [`Palautus on lähetettävä ${r.dagar} päivän kuluessa tuotteen vastaanottamisesta.`] : []),
      ...(r.policy ? [`Koko palautuskäytäntö: ${r.policy}`] : []),
    ].join('\n'),
    ordernummer: 'Löytääkseni tilauksesi tarvitsen tilausnumerosi. Se on tilausvahvistuksessa, jonka sait tilatessasi. Tarkista myös roskaposti. Lähetä se, niin palaamme asiaan mahdollisimman pian.',
    foretag: (f) => `Tässä yritystiedot: ${f.namn}, organisaationumero ${f.orgnr}, ${f.adress}.${f.moms ? ' Yritys on alv-rekisteröity.' : ''}`,
    avslut: 'Ota yhteyttä, jos sinulla on muuta kysyttävää.',
    halsningSlut: 'Ystävällisin terveisin',
    signatur: (b) => `Asiakaspalvelu ${b}`,
    x: {
      ej_levererad: 'Paketti, joka ei ole saapunut perille, on täysin mahdotonta hyväksyä, emmekä seiso sellaisen takana.',
      skadad_defekt: 'Tuote, joka saapuu rikki tai ei toimi, on täysin mahdotonta hyväksyä, emmekä seiso sellaisen takana.',
      fel_vara: 'Tuote, joka ei vastaa tilaamaasi, on täysin mahdotonta hyväksyä, emmekä seiso sellaisen takana.',
      som_pa_bilden: 'Tuote, joka ei näytä lainkaan kuvan mukaiselta, on täysin mahdotonta hyväksyä, emmekä seiso sellaisen takana.',
      kvalitet: 'Tuote, joka ei vastaa laatua, josta olet maksanut, on täysin mahdotonta hyväksyä, emmekä seiso sellaisen takana.',
      var_ar_ordern: 'Tällainen pakettinsa odottaminen ei ole hyväksyttävää, emmekä seiso sellaisen takana.',
      aterbetalning: 'Kuvaamasi tilanne on täysin mahdotonta hyväksyä, emmekä seiso sellaisen takana.',
      avbestallning: 'Kuvaamasi tilanne peruutuksesi kanssa ei ole hyväksyttävää, emmekä seiso sellaisen takana.',
      retur_angerratt: 'Kuvaamasi tilanne on täysin mahdotonta hyväksyä, emmekä seiso sellaisen takana.',
      okand_debitering: 'Veloitus, jota et tunnista, on täysin mahdotonta hyväksyä, ja se selvitetään heti.',
      chargeback_hot: 'Kuvaamasi tilanne on täysin mahdotonta hyväksyä, emmekä seiso sellaisen takana.',
      vantat: 'Se, että olet joutunut odottamaan vastausta, ei ole hyväksyttävää, emmekä seiso sellaisen takana.',
      levererat_ej_mottaget: 'Paketti, joka on merkitty toimitetuksi vaikka et ole saanut sitä, on täysin mahdotonta hyväksyä, emmekä seiso sellaisen takana.',
      standard: 'Kuvaamasi tilanne on täysin mahdotonta hyväksyä, emmekä seiso sellaisen takana.',
    },
  },
  en: {
    halsning: (n) => (n ? `Hi ${n}!` : 'Hi!'),
    tack: 'Thanks for your email.',
    kollat: (o) => `I have looked up your order ${o}.`,
    paVag: 'The parcel has been shipped and is on its way.',
    senaste: (d) => `Latest update from the carrier: ${d}.`,
    ingenSkanning: 'The carrier usually shows the first scan 2-4 days after the parcel is shipped.',
    folj: (l, nr) => (nr ? `Your tracking number with us is ${nr}, and you can follow the parcel here: ${l}` : `You can follow the parcel here: ${l}`),
    fonster: (a, b) => `Estimated delivery: between ${a} and ${b}.`,
    fonsterDagar: (a, b) => `Estimated delivery time is ${a}-${b} days from when the parcel is shipped.`,
    ejSkickad: (o, d, n) => `Your order ${o} was received on ${d} and is packed within ${n} working days. You will get an email with a tracking link as soon as the parcel ships.`,
    leveranstid: (a, b, n) => `Delivery takes ${a}-${b} days from when the parcel is shipped. We ship within ${n} working days of the order, and you get an email with a tracking link when it leaves. Please check your spam folder if the email does not show up.`,
    oppettider: (h) => `We answer emails within ${h} hours on weekdays. Please include your order number in the email. It speeds things up.`,
    adress: (o) => `Thank you, I have passed your new address on to our warehouse as a priority. Your order ${o} has not shipped yet. If they can change it before the parcel leaves, it will go to the new address. Please reply straight away if the shipping confirmation shows the wrong address.`,
    arg: (x) => `I completely understand your frustration. ${x}`,
    eskalerat: (h) => `I have escalated this directly to our responsible team as an urgent case. You can expect a reply within ${h} hours.`,
    merInfo: 'If you have any more information that could help us resolve this faster, just reply to this email.',
    ordernummerArg: 'To find your order we need your order number. Please include it in your reply, along with anything else that could help us resolve this faster.',
    opostad: (n) => `Your order has sat unshipped for ${n} days, and that is not acceptable.`,
    lageIntro: (o) => `Here is what I can see right now for your order ${o}:`,
    stilla: 'It is completely normal for tracking to stand still for a few days during transit. The parcel is still on its way.',
    framme: (bolag) => `The parcel is with ${bolag} for the last leg. It is usually delivered within 1-2 working days.`,
    uteForLeverans: 'The parcel is out for delivery today.',
    hamta: (bolag, nr, lank) => `The parcel is ready for collection at the pickup point${bolag ? ` (${bolag}${nr ? `, parcel ${nr}` : ''})` : ''}.${lank ? ` Pickup point and opening hours: ${lank}` : ''}`,
    levererad: (d, plats) => `According to the carrier the parcel was delivered on ${d}${plats ? ` (${plats})` : ''}.`,
    levereradUtanDatum: 'According to the carrier the parcel has been delivered.',
    levereradKolla: 'Please check: your mailbox, any pickup notice, the nearest pickup point, with neighbours, and a sheltered spot by the door. If you still cannot find it: reply to this email and we will investigate further straight away.',
    skrappost: (b) => `The order confirmation and tracking email may have landed in your spam folder. Try searching your email for "${b}".`,
    foton: 'So we can resolve this quickly: please send a photo of the item, one of the packaging and one of the shipping label, so we have everything when we take it further.',
    beklagar: 'Sorry to hear the delivery was not as it should be. We will look into it straight away.',
    beklagarVara: 'Sorry to hear the item is not working as it should. We will look into it straight away.',
    fotonVara: 'So we can resolve this quickly: please send a photo or a short video of the item showing the fault, so we have everything when we take it further.',
    fotonOrdernummer: 'Please also include your order number in your reply, so we can find the order straight away.',
    retur: (r) => [
      'Here is how to return it:',
      '1. Pack the item in its original packaging and in the same condition you received it.',
      `2. Write your name and order number${r.ordernummer ? ` (${r.ordernummer})` : ''} clearly on the outside of the parcel, and include a copy of the order confirmation inside.`,
      '3. Send the parcel to:',
      ...r.adress,
      'Send it as a letter or parcel directly to the address above, not to a pickup point. We do not collect parcels from pickup points.',
      '4. Please use a tracked shipping service, and reply to this email with the tracking number once you have posted it. We will follow up as soon as it arrives.',
      ...(r.frakt === 'kund' ? ['Return shipping is at your own cost.'] : r.frakt === 'butik' ? ['We cover the return shipping. Reply to this email and we will arrange a label.'] : []),
      ...(r.dagar ? [`The return must be sent within ${r.dagar} days of receiving the item.`] : []),
      ...(r.policy ? [`Full return policy: ${r.policy}`] : []),
    ].join('\n'),
    ordernummer: 'To look up your order I need your order number. It is in the order confirmation you received when you ordered. Please check your spam folder too. Send it over and we will get back to you as soon as possible.',
    foretag: (f) => `Here are our company details: ${f.namn}, company registration number ${f.orgnr}, ${f.adress}.${f.moms ? ' The company is VAT registered.' : ''}`,
    avslut: 'Just reply if there is anything else.',
    halsningSlut: 'Kind regards',
    signatur: (b) => `Customer service ${b}`,
    x: {
      ej_levererad: 'A parcel that never arrived is completely unacceptable, and it is not something we stand for.',
      skadad_defekt: 'An item that arrives broken or does not work is completely unacceptable, and it is not something we stand for.',
      fel_vara: 'A product that is not what you ordered is completely unacceptable, and it is not something we stand for.',
      som_pa_bilden: 'A product that looks nothing like the picture is completely unacceptable, and it is not something we stand for.',
      kvalitet: 'An item that does not live up to the quality you paid for is completely unacceptable, and it is not something we stand for.',
      var_ar_ordern: 'Having to wait like this for your parcel is not acceptable, and it is not something we stand for.',
      aterbetalning: 'What you describe is completely unacceptable, and it is not something we stand for.',
      avbestallning: 'What you describe around your cancellation is not acceptable, and it is not something we stand for.',
      retur_angerratt: 'What you describe is completely unacceptable, and it is not something we stand for.',
      okand_debitering: 'A charge you do not recognise is completely unacceptable, and it will be sorted out straight away.',
      chargeback_hot: 'What you describe is completely unacceptable, and it is not something we stand for.',
      vantat: 'Having to wait for a reply is not acceptable, and it is not something we stand for.',
      levererat_ej_mottaget: 'A parcel marked as delivered when you never received it is completely unacceptable, and it is not something we stand for.',
      standard: 'What you describe is completely unacceptable, and it is not something we stand for.',
    },
  },
};

/** Språket för svaret: kundens om vi känner det, annars butikens. Ren. */
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

// Landet i "paketet är framme i …" — finskan i illativ (Ruotsiin). Okänt land ⇒ butikens.
// (Används inte i svaren sedan 2026-09-22 — Axel: nämn aldrig landet — men
// kvar för den som behöver ordet någon annanstans.)
const LAND = {
  SE: { sv: 'Sverige', nb: 'Sverige', da: 'Sverige', fi: 'Ruotsiin', en: 'Sweden' },
  NO: { sv: 'Norge', nb: 'Norge', da: 'Norge', fi: 'Norjaan', en: 'Norway' },
  DK: { sv: 'Danmark', nb: 'Danmark', da: 'Danmark', fi: 'Tanskaan', en: 'Denmark' },
  FI: { sv: 'Finland', nb: 'Finland', da: 'Finland', fi: 'Suomeen', en: 'Finland' },
};
export function landnamn(kod, sprak = 'sv') {
  const l = LAND[String(kod ?? '').toUpperCase()];
  return l ? (l[sprak] ?? l.sv) : (LAND.SE[sprak] ?? 'Sverige');
}

const DAG_MS = 86_400_000;
export const STILLA_DAGAR = 3;   // äldre senaste skanning än så ⇒ "spårningen får stå still"-raden (SOP 36)

/**
 * Returinformationen ur brandfilen (tvister: returadress, returfonster_dagar,
 * returfrakt_betalas_av, policy_url) som text på kundens språk, eller null
 * när butiken inte har någon returadress inskriven (då är returen VA:ns).
 * `ordernummer` = "#6600" eller tomt. Adressen skrivs på en rad per
 * kommadel ("STONEBITE ECOM AB, Sjöhed 160, 442 74 Harestad, Sverige").
 * Vem som betalar frakten sägs BARA när brandfilen säger det (kund/butik)
 * — tomt fält ⇒ ingen rad, aldrig en gissning. Ren.
 */
export function returText({ sprak = 'sv', brand = {}, ordernummer = '' } = {}) {
  const t = T[sprak] ?? T.sv;
  const tv = brand.tvister ?? {};
  const adress = String(tv.returadress ?? '').split(/\s*,\s*|\n/).map((s) => s.trim()).filter(Boolean);
  if (!adress.length) return null;
  const frakt = String(tv.returfrakt_betalas_av ?? '').trim().toLowerCase();
  return t.retur({
    adress,
    ordernummer: String(ordernummer ?? '').trim(),
    dagar: Number(tv.returfonster_dagar) || 0,
    frakt: ['kund', 'kunden', 'customer'].includes(frakt) ? 'kund' : ['butik', 'butiken', 'vi', 'store', 'shop'].includes(frakt) ? 'butik' : '',
    policy: String(tv.policy_url ?? '').trim(),
  });
}

/**
 * Läget för en order som rader (utan hälsning och utan "jag har kollat").
 * WISMO-svaret, `levererad`-svaret och det ARGA svarets faktastycke delar
 * dem, så kunden får samma sanning oavsett hink:
 *   • levererat enligt fraktbolaget ⇒ datum/plats + checklistan (SOP 06)
 *   • skickad ⇒ var paketet ÄR: ombud / ute för leverans / hos det inhemska
 *     bolaget för sista biten (SOP 36/37) — annars "skickat och på väg" +
 *     datumet för senaste uppdateringen; länken med bävernumret; fönstret
 *   • inte skickad ⇒ mottagen + packas inom N dagar + leveranstiden
 * Aldrig avsändningsdatum, aldrig första sträckans fraktbolag, aldrig ett
 * land eller en ort på vägen (Axels feedback 2026-09-22 på Hans-utkastet).
 * `stilla` = kunden säger att spårningen står still ⇒ lugnande raden (SOP 02);
 * `bekraftelse` = kunden saknar orderbekräftelsen ⇒ skräppost-raden (SOP 11/30).
 * Kastar när faktan inte räcker (ingen order, order utan datum). Ren.
 */
export function lageRader({ sprak = 'sv', fakta = {}, brand = {}, bekraftelse = false, stilla = false, nu = new Date() } = {}) {
  const t = T[sprak] ?? T.sv;
  const sv = brand.svar ?? {};
  const [levMin, levMax] = Array.isArray(sv.leverans_dagar) && sv.leverans_dagar.length === 2 ? sv.leverans_dagar : [7, 14];
  const packas = Number(sv.packas_dagar) || 2;
  const o = fakta.order;
  if (!o) throw new Error('läge utan order');
  const nuMs = nu instanceof Date ? nu.getTime() : Number(nu);
  const rader = [];
  const s = fakta.sandning;
  const sp = fakta.sparning ?? {};

  if (sp.levererad) {
    // SOP 06: levererat enligt fraktbolaget, kunden har det inte — checklistan, aldrig "borttappat".
    const h = sp.senaste;
    rader.push(h?.tid ? t.levererad(datumText(h.tid, sprak, { tid: true }), h.plats) : t.levereradUtanDatum);
    rader.push(t.levereradKolla);
    if (fakta.lank) rader.push(t.folj(fakta.lank, fakta.bavernummer));
    return rader;
  }
  if (s?.skickad) {
    // SOP 36/37: säg var paketet ÄR — ombud, ute för leverans, hos det inhemska bolaget — annars bara "på väg".
    const iLandet = Boolean(sp.sista?.namn);
    if (sp.status === 'READY_FOR_PICKUP') rader.push(t.hamta(sp.sista?.namn, sp.sista?.nummer, sp.sista?.lank));
    else if (sp.status === 'OUT_FOR_DELIVERY') rader.push(t.uteForLeverans);
    else if (iLandet) rader.push(t.framme(sp.sista.namn));
    else {
      rader.push(t.paVag);
      if (sp.senaste) {
        const h = sp.senaste;
        if (h.tid) rader.push(t.senaste(datumText(h.tid, sprak, { tid: true })));
        const alder = h.tid ? nuMs - new Date(h.tid).getTime() : 0;
        // SOP 02: säger kunden själv att spårningen står still får hen raden även när skanningen är färsk.
        if (alder > STILLA_DAGAR * DAG_MS || stilla) rader.push(t.stilla);
      } else {
        rader.push(t.ingenSkanning);
        if (stilla) rader.push(t.stilla);
      }
    }
    if (fakta.lank) rader.push(t.folj(fakta.lank, fakta.bavernummer));
    const fonsterPassar = !['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(sp.status) && !iLandet;
    if (fonsterPassar && fakta.fonster?.fran && fakta.fonster?.till) rader.push(t.fonster(kortDatum(fakta.fonster.fran, sprak), kortDatum(fakta.fonster.till, sprak)));
  } else if (s && !s.skickad) {
    // Sändning finns men utan datum: säg det vi vet, aldrig ett datum.
    rader.push(t.ingenSkanning);
    if (fakta.lank) rader.push(t.folj(fakta.lank, fakta.bavernummer));
  } else {
    if (!o.skapad) throw new Error('order utan datum');
    rader.push(t.ejSkickad(o.namn, datumText(o.skapad, sprak), packas));
    rader.push(t.fonsterDagar(levMin, levMax));
  }
  if (bekraftelse) rader.push(t.skrappost(brand.brand ?? ''));
  return rader;
}

/**
 * Det ENKLA svaret. `typ` = wismo|levererad|leveranstid|oppettider|adress|
 * ordernummer|foretag|foton|retur, `fakta` ur fakta.mjs, `brand` körkonfigen
 * (svar.leverans_dagar, packas_dagar, svarstid_timmar, foretag; tvister för
 * returen). `bekraftelse` = kunden nämner en saknad orderbekräftelse ⇒
 * skräppost-raden (SOP 11/30); `stilla` = kunden säger att spårningen står
 * still ⇒ lugnande raden (SOP 02); `behoverOrdernummer` = mejlet bär inget
 * ordernummer ⇒ `foton` ber om det; `ordernummer` = "#6600" till returen.
 * Returnerar { text } eller kastar om faktan inte räcker — anroparen ska då
 * lägga mejlet i SVÅR, aldrig skicka en halv mening.
 */
export function skrivEnkelt({ typ, sprak = 'sv', fakta = {}, brand = {}, namn = '', bekraftelse = false, stilla = false, behoverOrdernummer = false, ordernummer = '', fotonTyp = 'leverans', nu = new Date() } = {}) {
  const t = T[sprak] ?? T.sv;
  const sv = brand.svar ?? {};
  const [levMin, levMax] = Array.isArray(sv.leverans_dagar) && sv.leverans_dagar.length === 2 ? sv.leverans_dagar : [7, 14];
  const packas = Number(sv.packas_dagar) || 2;
  const rader = [t.halsning(namn), '', t.tack];
  const o = fakta.order;

  switch (typ) {
    case 'wismo': {
      if (!o) throw new Error('wismo utan order');
      rader.push(t.kollat(o.namn), ...lageRader({ sprak, fakta, brand, bekraftelse, stilla, nu }));
      break;
    }
    case 'levererad': {
      if (!o) throw new Error('levererad utan order');
      if (!fakta.sparning?.levererad) throw new Error('levererad utan leveransskanning');
      rader.push(t.kollat(o.namn), ...lageRader({ sprak, fakta, brand, nu }));
      break;
    }
    case 'foton':
      // SOP 05/08/07/15: den lugna kundens skadade, defekta eller fel vara — beklagan utan löfte + bilderna (+ ordernumret om det saknas). VA:n tar ärendet.
      // fotonTyp 'vara' (fotonTypFor): varan har slutat fungera ⇒ "varan", bild eller video på felet; 'leverans': transportskada/fel vara ⇒ "leveransen", varan + förpackningen + fraktetiketten.
      rader.push(fotonTyp === 'vara' ? t.beklagarVara : t.beklagar, fotonTyp === 'vara' ? t.fotonVara : t.foton);
      if (behoverOrdernummer) rader.push(t.fotonOrdernummer);
      break;
    case 'retur': {
      // Axels beslut 2026-09-22: "vill ha retur direkt → skicka returinformationen direkt". VA:n tar emot returen (flaggad + VA-mappen).
      const r = returText({ sprak, brand, ordernummer: ordernummer || o?.namn || '' });
      if (!r) throw new Error('retur utan returadress i brandfilen (tvister.returadress)');
      rader.push(r);
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
    case 'ordernummer':
      // SOP 36 steg 1 — bara när brandfilen slagit på det (svar.fraga_ordernummer).
      rader.push(t.ordernummer);
      break;
    case 'foretag': {
      // SOP 38: bara de godkända uppgifterna, ur brandfilen — aldrig ett personnamn.
      const f = sv.foretag;
      if (!f?.namn || !f?.orgnr || !f?.adress) throw new Error('foretag utan uppgifter i brandfilen (svar.foretag: namn, orgnr, adress)');
      rader.push(t.foretag(f));
      break;
    }
    default:
      throw new Error(`okänd enkel typ "${typ}"`);
  }
  rader.push('', slut(t, brand, sprak));
  return { text: rader.join('\n') };
}

// Vilket X den arga kunden får: det mest KONKRETA problemet i mejlet vinner
// över hotet ("min bank") — en kund som aldrig fått paketet och hotar med
// banken ska höra "ett paket som inte kommit fram", inte "det du beskriver".
// Personligt per ärende (Axels feedback 2026-09-22): "ser inte ut som på
// bilden" och "skräp/tunt som en ICA-kasse" får egna meningar.
const X_KONKRET = ['skadad_defekt', 'ej_levererad', 'fel_vara', 'okand_debitering'];
const X_OVRIGA = ['avbestallning', 'retur_angerratt', 'var_ar_ordern'];   // aterbetalning ⇒ standard: kunden har just BEGÄRT pengarna, inte väntat på dem (torrkörningen 2026-09-21)
const SOM_PA_BILDEN = /ser inte (alls )?ut som|inte (alls )?som på bild|stämmer (inte|ej) (in )?(på|med) (bilden|beskrivningen)|ser ikke ut som|ligner ikke billedet|ei näytä (lainkaan )?kuvan|not (at all )?(as|like) (the )?(picture|pictured|described)|looks nothing like/i;
const KVALITET = /\bskräp\b|\bskit\b|skitprodukt|kvalit|tunt som|tunn som|billig plast|\bplast\b|\busel\b|sopsäck|sop-?påse|søppel|\bskrald\b|\bdritt\b|\blort\b|\broska\b|\bpaska\b|laatu|\bgarbage\b|\brubbish\b|\bcrap\b|flimsy|cheap plastic/i;

/** X-nyckeln ur klassificeringen + ilskans orsaker (hinkar.arArg) + mejlets text. Ren. */
export function xNyckelFor(klass, argOrsaker = [], text = '') {
  if (argOrsaker.some((o) => /levererat/.test(o))) return 'levererat_ej_mottaget';
  const traffade = new Set((klass?.alla ?? []).map((a) => a.id));
  const t = String(text ?? '');
  if (SOM_PA_BILDEN.test(t)) return 'som_pa_bilden';
  if (traffade.has('skadad_defekt')) return 'skadad_defekt';
  if (KVALITET.test(t)) return 'kvalitet';
  const konkret = X_KONKRET.find((k) => traffade.has(k));
  if (konkret) return konkret;
  if (argOrsaker.some((o) => /tredje mejlet/.test(o))) return 'vantat';
  const ovrig = X_OVRIGA.find((k) => traffade.has(k));
  if (ovrig) return ovrig;
  return traffade.has('chargeback_hot') ? 'chargeback_hot' : 'standard';
}

/**
 * Det ARGA svaret — Axels mall 2026-09-22: hälsning med namn, empati,
 * problemet i klartext (X, eller "opostad i N dagar" när `opostadDagar`
 * ges), eskaleringen som brådskande ärende med "svar inom 48 timmar"
 * (brandfilens svar.eskalering_timmar), läget ur Shopify/17TRACK som eget
 * stycke (`lage` = { namn, rader } — bara med färsk fakta), sen ANTINGEN
 * "har du mer information … svara" ELLER, när ordernumret saknas
 * (`behoverOrdernummer`), "vi behöver ditt ordernummer" — plus bildförfrågan
 * (`foton`, SOP 05/08) och returblocket (`retur` = returText()) när kunden
 * bett om en retur. Inga tankstreck någonstans.
 */
export function skrivArgt({ sprak = 'sv', kategori = 'standard', brand = {}, xNyckel = null, foton = false, fotonTyp = 'leverans', lage = null, namn = '', opostadDagar = null, retur = null, behoverOrdernummer = false } = {}) {
  const t = T[sprak] ?? T.sv;
  const x = opostadDagar != null ? t.opostad(opostadDagar) : (t.x[xNyckel ?? kategori] ?? t.x.standard);
  const timmar = Number(brand?.svar?.eskalering_timmar) || ESKALERING_TIMMAR;
  const stycken = [`${t.arg(x)}\n${t.eskalerat(timmar)}`];
  if (lage?.namn && Array.isArray(lage.rader) && lage.rader.length) stycken.push([t.lageIntro(lage.namn), ...lage.rader].join('\n'));
  const info = behoverOrdernummer ? t.ordernummerArg : t.merInfo;
  stycken.push(foton ? `${info}\n${fotonTyp === 'vara' ? t.fotonVara : t.foton}` : info);
  if (retur) stycken.push(retur);
  return { text: `${t.halsning(namn)}\n\n${stycken.join('\n\n')}\n\n${t.halsningSlut}\n${signatur(brand, sprak)}`, x };
}

/** Ber svaret om bilder? Skadad/defekt eller fel vara enligt klassificeringen. Ren. */
export function villHaFoton(klass) {
  return (klass?.alla ?? []).some((a) => ['skadad_defekt', 'fel_vara'].includes(a.id));
}

// Varan har slutat fungera (inte skadats på vägen): läcker, fungerar inte, laddar inte …
const FUNKTIONSFEL = /läck|fungerar inte|funkar inte|slutat fungera|går inte att|laddar inte|startar inte|pumpar (dåligt|inte)|tappar (luft|tryck)|lekker|fungerer ikke|virker ikke|lader ikke|sluttet å fungere|leak|not working|doesn.t work|does not work|stopped working|won.t (charge|start|turn on)|ei toimi|vuotaa|lakkasi toimimasta/i;
// … men nämner kunden paketet, förpackningen eller transporten är det en transportskada, och då vill VA:n ha förpackningen och fraktetiketten.
const TRANSPORTSKADA = /förpackning|paket(et)? (var|kom|är|hade)|kartong|emballa|transport|fraktskad|krossa|bucklig|intryckt|vid leverans|kom fram|anlände|levererades|ankom|packag|parcel|box (was|arrived)|arrived|shipping damage|in transit|pakk(en|et) (var|kom)|leveringen|toimituksessa|pakkaus|saapui/i;

/**
 * Vilka bilder svaret ber om (Hans bränslepump 2026-09-22: "leveransen inte blev som den
 * skulle" + fraktetiketten passade inte en pump som läcker efter köpet).
 * 'vara' = skadad_defekt med funktionsfel-ord och inget om paketet/transporten ⇒ "varan",
 * bild eller kort video på felet. 'leverans' = allt annat (fel vara, för få, skadat i
 * transporten, oklart) ⇒ "leveransen", varan + förpackningen + fraktetiketten (SOP 05/08).
 * Osäkert ⇒ 'leverans', det är det VA:n alltid bett om. Ren.
 */
export function fotonTypFor({ klass, text = '' } = {}) {
  const ids = (klass?.alla ?? []).map((a) => a.id);
  if (ids.includes('fel_vara')) return 'leverans';
  const s = String(text ?? '');
  if (ids.includes('skadad_defekt') && FUNKTIONSFEL.test(s) && !TRANSPORTSKADA.test(s)) return 'vara';
  return 'leverans';
}

/** Säger kunden att spårningen står still eller inte uppdateras (SOP 02)? Ren. */
export function namnerStillaSparning(text) {
  return /(spårning|sporing|tracking|seuranta|status)[^.\n]{0,60}(inte (har )?uppdaterat|inte rört sig|står still|stått still|fast(nat)?|ikke (er )?oppdatert|står stille|ikke opdateret|not (been )?updat|hasn.t (moved|updated|changed)|stuck|ei ole päivittynyt|jumissa)|(inte uppdaterat|står still|ikke oppdatert|not updated|stuck)[^.\n]{0,40}(spårning|sporing|tracking|seuranta)/i.test(String(text ?? ''));
}

/** Nämner kunden en saknad orderbekräftelse eller ett saknat spårningsmejl? Ren. */
export function namnerBekraftelse(text) {
  return /(order|ordre|tilaus)?(bekräftelse|bekreftelse|bekræftelse|vahvistus|confirmation)|(inget|ingen|inte fått|not received|no|ikke fått|ikke modtaget)[^.]{0,30}(spårnings?mejl|sporings?(mail|e-post)|tracking (email|mail))/i.test(String(text ?? ''));
}

/** Alla meningar för ett språk (testerna kontrollerar att inget saknas). */
export function mallar(sprak) {
  return T[sprak] ?? null;
}
