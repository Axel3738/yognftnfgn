// TackleBay på norsk (bokmål). Källspråket i butiken är svenska.
//
// Regel: ALLT kunden läser översätts (PROCESS.md fas 4 steg 14). Det som inte
// är översatt ska stå utskrivet som inte översatt — aldrig lämnas tyst, för
// halvöversatt är värre än osvenskt: kunden ser en norsk sida med svenska
// stycken och litar inte på butiken.
//
// Norge SYNS i kundvyn (Axel 2026-09-08): USP-strippen säger på svenska
// "Fri frakt – Sverige & Norge" och på norska "Gratis frakt i hele Norge".

export const LOCALE = 'nb';

// --- Produkterna -----------------------------------------------------------

export const PRODUKTER = {
  'fiskespohallare-4-pack': {
    produkt: {
      title: 'Fiskestangholder 4-pakning',
      body_html: '<p>Fire stenger. Fire plasser. Slutt på flokene.</p>',
      meta_title: 'Fiskestangholder 4-pakning – TackleBay',
      meta_description:
        'Hver stang får sin egen plass — ingen floker å greie ut før fisketuren. 14 dagers angrerett.',
    },
    metafalt: {
      problem_rubrik: 'Femten minutter på en floke før første kast',
      problem_text:
        'Stengene har ligget i en haug i garasjen siden sist. Snørene har funnet hverandre, en krok sitter i feil stang, og nå står du på brygga og piller i stedet for å fiske.',
      losning_rubrik: 'Fire stenger, fire plasser',
      losning_text:
        'Fire holdere skrus opp på veggen eller i båten og tar én stang hver. Stengene står oppreist, snørene henger fritt og ingenting hekter seg i noe annet. Neste gang løfter du ned en stang og går.',
      benefits: [
        'Hver stang får sin egen plass — ingen floker å greie ut før fisketuren.',
        'Fire holdere i ett sett rekker til hele oppsettet.',
        'Sitter like godt på garasjeveggen som i båten.',
        'Stengene står oppreist, så snørene henger fritt og holder seg hele.',
      ],
      features: [
        'Fire holdere i ett sett',
        'Kraftig konstruksjon som holder stengene stødig',
        'Monteres på vegg eller i båten',
        'For strand-, sjø- og båtfiske',
        'Passer både proffe og nybegynnere',
      ],
      garantier: ['14 dagers angrerett'],
      frakt: ['Leveringstid: 5–10 virkedager', 'Gratis frakt i hele Norge'],
      faq: [
        { fraga: 'Hvor mange stenger får plass?', svar: 'Fire — én per holder. Flere sett kan settes opp ved siden av hverandre.' },
        { fraga: 'Passer den i båten?', svar: 'Ja. Holderne monteres på vegg eller i båten og er laget for strand-, sjø- og båtfiske.' },
        { fraga: 'Passer alle stenger?', svar: 'Holderne er laget for vanlige stenger til strand-, sjø- og båtfiske, både grovere og slankere.' },
        { fraga: 'Følger det med skruer?', svar: 'Montering skjer med vanlige skruer mot vegg eller båt. Hvilket feste som passer avhenger av underlaget.' },
      ],
    },
  },

  'adventskalender-fiskedrag': {
    produkt: {
      title: 'Adventskalender Fiskesluker – 24 Sluker',
      body_html: '<p>24 luker. 24 sluker. Slutt på gavegjettingen.</p>',
      meta_title: 'Adventskalender Fiskesluker – 24 Sluker – TackleBay',
      meta_description:
        'Noe å åpne hver dag, ikke bare den 24. Ingen trenger å gjette størrelse eller merke. 14 dagers angrerett.',
    },
    metafalt: {
      problem_rubrik: 'Hva gir man den som allerede har alt i fiskeboksen?',
      problem_text:
        'Han har wobblere i tre størrelser, skjesluker han aldri bruker og en boks som ikke lar seg lukke. Et nytt snelle er for dyrt å sjanse på, og et gavekort sier ”jeg visste ikke”. Så det blir sokker. Igjen.',
      losning_rubrik: 'En sluk om dagen fram til jul',
      losning_text:
        'Bak hver luke sitter en sluk — en wobbler den ene dagen, en skjesluk den neste, en softbait-reke den tredje. Tjuefire morgener med noe å snu på i hånda og fundere over hvor det skal prøves. Julaften er det en ny boks, bygget én luke om gangen.',
      benefits: [
        'Noe å åpne hver dag, ikke bare den 24.',
        'Ingen trenger å gjette størrelse eller merke — slukene passer alle stenger.',
        'Boksen er fylt til våren med sluker som skal ut og prøves.',
        'Gaveproblemet er løst med ett kjøp.',
      ],
      features: [
        '24 luker med én fiskesluk bak hver',
        'Blandet innhold: wobblere, skjesluker og softbaits',
        'Klar til å gis bort som den er',
        'For den som fisker i ferskvann eller saltvann',
      ],
      garantier: ['14 dagers angrerett'],
      frakt: ['Leveringstid: 5–10 virkedager', 'Gratis frakt i hele Norge'],
      faq: [
        { fraga: 'Hva ligger bak lukene?', svar: 'Én fiskesluk per luke — wobblere, skjesluker og softbaits om hverandre. Ikke 24 av samme sort.' },
        { fraga: 'Rekker den fram før advent?', svar: 'Leveringstiden er 5–10 virkedager. Bestill i god tid før 1. desember.' },
        { fraga: 'Passer slukene alle stenger?', svar: 'Ja. Slukene er vanlige størrelser som fungerer med normale spinn- og snellesett.' },
        { fraga: 'Kan jeg gi den bort som den er?', svar: 'Ja. Kalenderen er klar til å gis bort rett ut av pakken.' },
      ],
    },
  },
};

// --- Startsidan (tema-JSON, bundet till TEMA-ID) ---------------------------
//
// Nycklarna är de Shopify genererar för sektionsinställningar i
// templates/index.json. De hämtas ur translatableResource vid körning —
// den här ordlistan matchar på VÄRDET i stället, för nyckelnamnen är
// hashade per sektion och inte läsbara i förväg.

export const STARTSIDA_PAR = [
  ['Allt på sin plats', 'Alt på sin plass'],
  [
    'Utrustning för den som redan fiskar — och presenter till den som redan har allt i lådan.',
    'Utstyr for deg som allerede fisker — og gaver til ham som allerede har alt i boksen.',
  ],
  ['Se sortimentet', 'Se sortimentet'],
  ['Sortimentet', 'Sortimentet'],
  [
    'truck:Fri frakt – Sverige & Norge|shield:14 dagars ångerrätt|star:Betala med Klarna',
    'truck:Gratis frakt i hele Norge|shield:14 dagers angrerett|star:Betal med Klarna',
  ],
  [
    'Fri frakt i Sverige och Norge|14 dagars ångerrätt|Trygg betalning med Klarna|Skickas från Sverige',
    'Gratis frakt i hele Norge|14 dagers angrerett|Trygg betaling med Klarna|Sendes fra Sverige',
  ],
  ['Fiskeprylar som gör en sak, och gör den bra', 'Fiskeutstyr som gjør én ting, og gjør den godt'],
  [
    '<p>Vi säljer inte allt. Vi säljer det som löser något konkret: spön som inte trasslar, och en present som inte blir ett presentkort.</p><p>Varje sak i sortimentet är vald för att den håller en säsong i båten, inte för att den fyller en katalog.</p>',
    '<p>Vi selger ikke alt. Vi selger det som løser noe konkret: stenger som ikke floker seg, og en gave som ikke blir et gavekort.</p><p>Hver ting i sortimentet er valgt fordi den holder en sesong i båten, ikke fordi den fyller en katalog.</p>',
  ],
  ['Fyra spön, fyra platser', 'Fire stenger, fire plasser'],
  ['Handla tryggt hos oss', 'Handle trygt hos oss'],
  [
    '<p>Fri frakt till hela Sverige och Norge, och 14 dagars ångerrätt enligt svensk lag.</p><p>Betala som du vill — Klarna, kort, Apple Pay eller Google Pay.</p>',
    '<p>Gratis frakt i hele Norge, og 14 dagers angrerett.</p><p>Betal som du vil — Klarna, kort, Apple Pay eller Google Pay.</p>',
  ],
  ['Vanliga frågor', 'Vanlige spørsmål'],
  ['Hur snabbt kommer paketet?', 'Hvor raskt kommer pakken?'],
  ['<p>5–10 arbetsdagar, med fri frakt inom Sverige och Norge.</p>', '<p>5–10 virkedager, med gratis frakt i hele Norge.</p>'],
  ['Kan jag ångra köpet?', 'Kan jeg angre kjøpet?'],
  [
    '<p>Ja. Du har 14 dagars ångerrätt enligt svensk lag. Hör av dig till hello@tacklebay.se så löser vi det.</p>',
    '<p>Ja. Du har 14 dagers angrerett. Ta kontakt på hello@tacklebay.se, så løser vi det.</p>',
  ],
  ['Skickar ni till Norge?', 'Sender dere til Norge?'],
  [
    '<p>Ja. Norge är en av våra två hemmamarknader och frakten är fri dit också.</p>',
    '<p>Ja. Norge er ett av våre to hjemmemarkeder, og frakten er gratis.</p>',
  ],
  ['14 dagars ångerrätt', '14 dagers angrerett'],
  [
    '<p>Ångrar du dig har du 14 dagar på dig enligt svensk lag. Hör av dig så löser vi det.</p>',
    '<p>Angrer du, har du 14 dager på deg. Ta kontakt, så løser vi det.</p>',
  ],
  ['Verifierade köp', 'Verifiserte kjøp'],
  ['Vad kunderna säger', 'Hva kundene sier'],
];

// --- Menyerna --------------------------------------------------------------

export const MENY_PAR = [
  ['Sortimentet', 'Sortimentet'],
  ['Spöhållaren', 'Stangholderen'],
  ['Fiskekalendern', 'Fiskekalenderen'],
  ['Kontakt', 'Kontakt'],
  ['Returpolicy', 'Returrett'],
  ['Fraktpolicy', 'Frakt'],
  ['Köpvillkor', 'Kjøpsvilkår'],
];

// --- INTE översatt (skrivs ut, aldrig tyst) --------------------------------

export const EJ_OVERSATT = [
  'Policysidorna (returpolicy, fraktpolicy, köpvillkor, integritetspolicy) — juridisk text, översätts separat.',
  'Temats egna köpsträngar (locales/nb.json) — Dawns standardsträngar, levereras med temat.',
  'Paket-metaobjektens rubriker (1 st / 2 st / 3 st) — siffror och "st", läsbart i båda språken.',
  'Recensionerna på startsidan — riktiga svenska omdömen med riktiga namn. En översatt recension är en påhittad recension. Norska omdömen kommer via Judge.me-importen (PROCESS.md fas 3).',
  'Produktbildernas metafält (media_losning, bild_lifestyle) — fil-URL:er, inte text. Språkversionerade bilder är ett eget steg (PROCESS.md fas 4 steg 15).',
];
