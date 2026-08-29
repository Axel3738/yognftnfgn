// Batch 5 (2026-08-28) — norsk (bokmål) översättning av T5_SV, 14 produkter.
// Källa: texter5.mjs (svensk mastercopy). Ton och terminologi refererad mot
// de norska (no:) blocken i texter4.mjs. Räkneord är låsta mot samma CWD-
// offert som den svenska versionen och får inte ändras.
//
// Kopplat till: docs/copy-regler.md (tre-frågorstestet, inga hastighets-
// eller absolutlöften, inga förbjudna ord).

export const T5_NO = {
  arbetslampa: {
    titel: 'Arbeidslampe for Makita-batteri – 15 LED med USB-uttak',
    problemH: 'Pannelampen blender og mobilen dør',
    problemP: 'Under bilen, i boden, ved hytta etter mørkets frembrudd – lyset sitter alltid feil vei, og batteriet du allerede eier ligger i skrutrekkeren og gjør ingenting.',
    losningH: 'Lampen som drives av batteriet du allerede har',
    losningP: 'En arbeidslampe med 15 dioder som kobles rett på Makita 18V-festet. Bærehåndtak, stabil fot og to USB-uttak så mobilen lader mens du jobber. Batteri følger ikke med – det er hele poenget: du har det allerede.',
    bullets: [
      '<strong>Lyser opp hele arbeidsflaten</strong> – 15 dioder med bredt lys i stedet for en smal kjegle',
      '<strong>Kobles rett på batteriet du eier</strong> – passer Makita 18V-festet',
      '<strong>Lader mobilen samtidig</strong> – to USB-uttak i foten',
      '<strong>Blir med dit jobben er</strong> – bærehåndtak, 16 cm høy',
      '<strong>Batteri følger ikke med</strong> – lampen drives av ditt eget Makita 18V-batteri',
    ],
    option: 'Farge', varden: ['Blå', 'Gul', 'Rød'],
    alt: { main: 'Arbeidslampen med 15 dioder og bærehåndtak', b2: 'Arbeidslampen skrått forfra med strømbryteren' },
  },

  diskstall: {
    titel: 'Oppvaskstativ i To Etasjer – Hele Oppvaskens Tørkeflate på 42 cm',
    problemH: 'Oppvasken kjemper om ett dryppebrett',
    problemP: 'Tallerkenene balanserer på glassene, bestikket ligger i en haug og skjærefjølen lener seg mot flisene. Hvert måltid ender med samme tetris ved oppvaskkummen.',
    losningH: 'To etasjer som gir hver ting sin plass',
    losningP: 'Tallerkener og skjærefjøl står på høykant der de tørker, glassene henger opp ned på egne pinner, bestikket har sitt eget rom – og under alt sammen sitter et dryppebrett som leder vannet dit du vil. 42 × 28 cm på benken, 29 cm høyt.',
    bullets: [
      '<strong>Middagsoppvasken for hele familien får plass</strong> – to etasjer i stedet for ett trangt brett',
      '<strong>Glassene tørker opp ned</strong> – egne pinner, ingen vannringer i bunnen',
      '<strong>Ikke noe vann på benken</strong> – dryppebrettet leder ut i kummen',
      '<strong>Bestikk og skjærefjøl har egne rom</strong> – ingenting ligger og skvulper',
    ],
    option: 'Farge', varden: ['Svart', 'Hvit'],
    alt: { main: 'Oppvaskstativet i to etasjer fullt av oppvask ved kummen', b2: 'Oppvaskstativet med tallerkener, glass og bestikk på plass' },
  },

  bankhylla: {
    titel: 'Benkehylle med Uttrekkbar Kurv – Dobbel Plass på Samme Benk',
    problemH: 'Benkeplassen tok slutt for tre apparater siden',
    problemP: 'Kaffetrakteren, frokostgreiene og boksene trenges på samme halvmeter. Det eneste som vokser på kjøkkenet, er haugen.',
    losningH: 'Hyllen som skaper en etasje til',
    losningP: 'En treplate å sette ting på – og under den en metallkurv på skinner som du trekker ut som en skuff. Det som sto i veien, får sin egen plass, uten at du borer eller bygger om noe.',
    bullets: [
      '<strong>Dobbelt så mye benkeplass</strong> – sett oppå, oppbevar under',
      '<strong>Kurven glir ut som en skuff</strong> – du ser alt uten å løfte av noe',
      '<strong>Står stødig av seg selv</strong> – ingen boring, ingen hull i veggen',
      '<strong>Tre og svart metall</strong> – ser ut som et møbel, ikke som en pallekarm',
    ],
    option: 'Farge', varden: ['Svart', 'Hvit'],
    alt: { main: 'Benkehyllen med treplate og uttrekkbar kurv på kjøkkenbenken', b2: 'Benkehyllen med kurven trukket ut', b3: 'Benkehyllen skrått forfra' },
  },

  luffarschack: {
    titel: 'Kryss og Bolle i Tre – Klassikeren som Ligger Fremme',
    problemH: 'Spillkvelden dør i en app-store',
    problemP: 'Alle vil gjøre noe sammen, men spillene ligger i en eske lengst inne i skapet, og mobilene er nærmere for hånden.',
    losningH: 'Spillet som ligger fremme og blir spilt',
    losningP: 'Kryss og bolle i tre, 14,3 × 14,3 cm, med brikker som ligger igjen i sine rom. Pent nok for stuebordet, enkelt nok til at femåringen og bestefar kan spille på like vilkår.',
    bullets: [
      '<strong>Spilles av alle aldre med en gang</strong> – reglene kan alle allerede',
      '<strong>Ligger fremme og brukes</strong> – tre som passer på stuebordet',
      '<strong>Brikkene har egne rom</strong> – ikke noe lokk å lete etter, ingenting som forsvinner',
      '<strong>14,3 cm bredt</strong> – får plass på brettbordet, balkongbordet og i vesken',
    ],
    alt: { main: 'Kryss og bolle i tre med svarte og hvite brikker', b2: 'Brettet i nærbilde med brikkene i sine rom' },
  },

  glasspints: {
    titel: 'Iskrembokser med Lokk 2-pk – Lag Isen Rett i Boksen',
    problemH: 'Hjemmelaget is oppbevares i en plastboks med isskorpe',
    problemP: 'Maskinen gjør jobben, men etterpå skrapes alt over i en boks som verken tetter godt eller ser ut som noe – og halve satsen fryser i stykker.',
    losningH: 'Boksene som går fra maskin til fryser med lokk',
    losningP: 'To pints i 16 oz-format med tettsittende lokk. Lag isen, sett på lokket, inn i fryseren – og server fra samme boks. Riflet, gjennomsiktig glass som viser hvilken smak som er hvilken.',
    bullets: [
      '<strong>Fra maskin til fryser uten mellomsteg</strong> – lag og oppbevar i samme boks',
      '<strong>Lokket tetter godt</strong> – ingen isskorpe, ingen frysesmak',
      '<strong>Du ser hva som er i</strong> – gjennomsiktig glass i stedet for anonym plast',
      '<strong>To bokser</strong> – én i fryseren mens den andre spises av',
    ],
    alt: { main: 'De to iskrembeholderne med lokk på kjøkkenbenken', b2: 'Boksen med lokkene i flere farger' },
  },

  kastfanga: {
    titel: 'Kast & Fang-sett – 4 Kurver og Baller på Snor',
    problemH: 'Kubb-sesongen varer to helger',
    problemP: 'Uteleker krever flatt underlag, mange deltakere og en time med oppsett. Resten av sommeren ligger de i boden.',
    losningH: 'Spillet som er i gang på tretti sekunder',
    losningP: 'Fire kurver med reim – i hånden eller rundt nakken – og baller på 84 cm snor. Kast, fang i kurven, bytt side. Fungerer på plenen, stranden og campingplassen, to spillere eller hele følget.',
    bullets: [
      '<strong>I gang på tretti sekunder</strong> – ingen bane å krite opp, ingenting å skru',
      '<strong>Alle kan være med med en gang</strong> – å fange i kurv er lettere enn å fange med hånd',
      '<strong>Fire kurver i settet</strong> – to kamper samtidig eller hele familien i ring',
      '<strong>Ballen forsvinner ikke</strong> – snoren sitter i kurven, ingen leting i bedet',
    ],
    alt: { main: 'De fire grønne kurvene med baller på snor på et teppe i gresset', b2: 'Målene – kurven er 13 cm bred og snoren 84 cm' },
  },

  magnetplattor: {
    titel: 'Magnetplater i Stort Format – Byggesett i Kasse med Håndtak',
    problemH: 'Byggelekene dør når bitene blir for små',
    problemP: 'Femti mikrodeler under sofaen, en ødelagt manual og et barn som ga opp etter ti minutter. Det bygges mer på skjermen enn på gulvet.',
    losningH: 'Store plater som klikker sammen av seg selv',
    losningP: 'Magnetplater i stort format som trekkes sammen riktig vei – tårn, hus og kjøretøy vokser frem uten manual. Kommer i en kasse med håndtak, så bygget ryddes bort like fort som det hentes frem. Velg 46 eller 60 deler.',
    bullets: [
      '<strong>Bygget lykkes med en gang</strong> – magnetene setter seg riktig av seg selv',
      '<strong>Store plater, ingen smådeler i sofaen</strong> – laget for mindre hender',
      '<strong>Ryddes på et minutt</strong> – alt ned i kassen med håndtak',
      '<strong>Vokser med barnet</strong> – geometri og balanse uten at det merkes',
    ],
    option: 'Antall deler', varden: ['46 deler', '60 deler'],
    alt: { main: 'Tårn og byggverk av fargerike magnetplater', b2: 'Et større byggverk av magnetplatene' },
  },

  mcvaska: {
    titel: 'Motocentric Bakveske 37 L – Hjelmen Går i Vesken',
    problemH: 'Hjelmen dingler på styret eller blir hjemme',
    problemP: 'Den som kjører vet: hjelmen får ikke plass noe sted når du har parkert, og ryggsekken rommer ikke både den og regntøyet.',
    losningH: 'Bakvesken som sluker hele hjelmen',
    losningP: 'En bakveske på 37 liter fra Motocentric som spennes fast på setet eller bagasjebrettet. Hjelmen går i, regntøyet og hanskene ved siden av, og reflekselementene synes i mørket.',
    bullets: [
      '<strong>Hjelmen får endelig en plass</strong> – 37 liter sluker den med margin',
      '<strong>Sitter fast på sykkelen</strong> – stropper for sete eller bagasjebrett',
      '<strong>Synes i mørket</strong> – reflekselementer på baksiden',
      '<strong>Pakker mer enn hjelmen</strong> – regntøy, hansker og kjettinglås får plass ved siden av',
    ],
    alt: { main: 'Bakvesken montert på motorsykkelen', b2: 'Vesken fastspent på setet' },
  },

  somnadskit: {
    titel: 'Sysett 104 Deler – Alt i Ett Etui',
    problemH: 'Knappen løsner og hele hjemmet mangler en nål',
    problemP: 'Fållen som har sluppet, knappen i hånden fem minutter før avreise – og nærmeste nål og tråd finnes i en annen bolig.',
    losningH: 'Hele sykurven i ett etui med glidelås',
    losningP: '104 deler i ett etui: 24 trådfarger, nåler, sakser, målebånd, trykknapper og nåletredere – sortert i egne holdere så det ser likt ut etter femte gangs bruk. I skuffen hjemme eller i kofferten.',
    bullets: [
      '<strong>Knappen er sydd fast på fem minutter</strong> – tråd, nål og saks på samme sted',
      '<strong>104 deler med egne plasser</strong> – settet ser likt ut etter hver bruk',
      '<strong>24 trådfarger</strong> – riktig farge til plagget i stedet for den nærmeste',
      '<strong>Blir med i kofferten</strong> – flatt etui med glidelås',
    ],
    alt: { main: 'Sysettet åpent med tråderuller, sakser og tilbehør' },
  },

  reseask: {
    titel: 'Medisinboks i Lommeformat – 7 Rom med Tettsittende Lokk',
    problemH: 'Tablettene reiser i en skranglende boks',
    problemP: 'Helgevesken pakkes, og medisinen blir med i originalesken som tar plass, eller løst i en boks der alt blandes.',
    losningH: 'Boksen som tar ukens doser i jakkelommen',
    losningP: 'Syv egne rom under et tettsittende lokk, 9 × 7 × 3,5 cm – boksen forsvinner i jakkelommen eller nødvendighetsvesken. Rommene holder dagene atskilt, lokket holder tablettene tørre.',
    bullets: [
      '<strong>Ukens doser i jakkelommen</strong> – 9 × 7 cm, mindre enn en kortstokk',
      '<strong>Syv rom holder dagene atskilt</strong> – ingenting løst som blandes',
      '<strong>Lokket lukker tett</strong> – tablettene ligger tørt i vesken',
      '<strong>Åpnes med én hånd</strong> – sperren slipper med tommelen',
    ],
    option: 'Farge', varden: ['Hvit', 'Grønn'],
    alt: { main: 'Den hvite medisinboksen åpen med tabletter i rommene', b2: 'Den grønne medisinboksen med målene 9 × 7 cm' },
  },

  veckodosett: {
    titel: 'Ukedosett 21 Rom – Morgen, Middag og Kveld i Syv Dager',
    problemH: '"Tok jeg morgendosen?" er et daglig spørsmål',
    problemP: 'Tre doser om dagen og syv bokser i baderomsskapet – til slutt holder ingen oversikten, og det er nettopp oversikten som er poenget.',
    losningH: 'En uke fylt på søndag, så er det bare å åpne',
    losningP: 'Syv dagsbokser med tre rom hver – morgen, middag, kveld – i et etui med lokk. Fyll alt på søndag. Dagens boks blir med i lommen, resten står igjen hjemme, og svaret på spørsmålet ses i rommet.',
    bullets: [
      '<strong>Svaret ses i rommet</strong> – tomt rom betyr tatt dose',
      '<strong>Dagens boks blir med</strong> – løsne og ta med i lommen, resten står hjemme',
      '<strong>21 rom fylt på én gang</strong> – én påfylling i uken i stedet for tre om dagen',
      '<strong>Lokket holder orden</strong> – boksene sitter på plass i etuiet',
    ],
    alt: { main: 'Ukedosetten med syv dagsbokser i etuiet', b2: 'En dagsboks løsnet fra etuiet' },
  },

  sandbild: {
    titel: '3D-sandbilde 20 cm – Nytt Landskap Hver Gang Du Snur Den',
    problemH: 'Pyntegjenstandene har sett like ut siden de ble pakket ut',
    problemP: 'Hyllen er møblert og ferdig – og død. Ingenting i rommet forandrer seg før noen flytter på det.',
    losningH: 'Bildet som tegner seg selv på nytt',
    losningP: 'Snu rammen, og sanden synker sakte gjennom væsken til et nytt fjellandskap – ulikt det forrige hver gang. Rund ramme, 20,2 cm bred, står på fot på hyllen eller skrivebordet.',
    bullets: [
      '<strong>Nytt bilde hver gang</strong> – sanden legger seg aldri likt to ganger',
      '<strong>Rommets roligste blikkfang</strong> – langsom bevegelse i stedet for enda en stillestående pyntegjenstand',
      '<strong>Snus med ett grep</strong> – står stødig på egen fot',
      '<strong>20 cm rund</strong> – tar hylleplass som en bok, synes som et bilde',
    ],
    option: 'Farge', varden: ['Rød', 'Rav'],
    alt: { main: 'Det røde 3D-sandbildet på en hylle', b2: 'Målene – rammen er 20,2 cm bred og 21,4 cm høy', b3: 'Sandbildet i ravfarge' },
  },

  dysonborste: {
    titel: 'Pelsbørste til Dyson-støvsuger – Børst og Sug i Samme Bevegelse',
    problemH: 'Pelsen børstes ut – og havner på gulvet',
    problemP: 'Hunden feller, børsten fylles, og alt du har kjemmet ut drysser ned på teppet du nettopp har støvsugd. To gjøremål som gjør hverandre ugjort.',
    losningH: 'Børsten som sitter på støvsugeren',
    losningP: 'Et børstehode som kobles til Dyson V7, V8, V10, V11 eller V15 – med slange og adaptere i settet. Piggene løsner underullen, og maskinen suger den opp i samme bevegelse. Pelsen havner i beholderen, ikke på gulvet.',
    bullets: [
      '<strong>Pelsen havner i støvsugeren</strong> – ikke på gulvet du nettopp gjorde rent',
      '<strong>Passer din Dyson</strong> – V7, V8, V10, V11 og V15 med medfølgende adaptere',
      '<strong>Slangen gir rekkevidde</strong> – børst i sofaen uten å løfte maskinen',
      '<strong>Skånsomme pigger</strong> – løsner underull uten å dra i huden',
    ],
    alt: { main: 'Børstehodet på støvsugeren ved siden av hund og katt', b2: 'Settets deler – børstehode, slange og adaptere, merket V7–V15' },
  },

  magnethylla: {
    titel: 'Magnethylle for Vaskemaskin og Kjøleskap – Oppbevaring Uten Boring',
    problemH: 'Vaskemiddelet står på gulvet bak døren',
    problemP: 'Vaskerommet har null hyller, og huseier har meninger om borehull. Så flaskene står på maskinen og faller av ved hver sentrifugering.',
    losningH: 'Hyllen som fester seg til platen',
    losningP: 'En hylle med magnetbakside som fester seg direkte på siden av vaskemaskinen eller kjøleskapet. 29,5 cm bred med kant som holder flaskene på plass – oppe på sekunder, flyttes like fort, etterlater ingen hull.',
    bullets: [
      '<strong>Oppe på sekunder, ingen hull</strong> – magneten fester seg direkte på platen',
      '<strong>Flaskene blir stående</strong> – kanten holder imot når maskinen sentrifugerer',
      '<strong>Flyttes når du vil</strong> – løsne, fest på neste plateflate',
      '<strong>29,5 cm bred</strong> – vaskemiddel, skyllemiddel og flekkfjerner på rad',
    ],
    option: 'Farge', varden: ['Svart', 'Hvit'],
    alt: { main: 'To svarte magnethyller med vaskemiddel på siden av vaskemaskinen', b2: 'Den hvite hyllen med målene 29,5 × 9,5 × 7,5 cm' },
  },
};
