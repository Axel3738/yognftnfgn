// Batch 5 (2026-08-29) — dansk oversättning av T5_SV (texter5.mjs), 14 produkter.
// Idiomatisk danska, skriven efter tonen i texter4.mjs (da-blocken), inte
// maskinöversatt. Räkneord låsta mot CWD-offerten precis som i texter5.mjs:
// 104 delar, 24 trådfärger, 46/60 delar, 37 L, 21 fack, 15 dioder, 14,3 cm,
// 20,2 cm, 9×7×3,5 cm, 29,5 cm, 42×28 cm, 84 cm, 16 oz, 13 cm, V7/V8/V10/V11/V15,
// Makita 18V — inget av dem ändrat i översättningen.
//
// Arbejdslampens "Batteri følger ikke med" är medvetet tydlig, precis som i
// den svenska källan — hela poängen med produkten.

export const T5_DA = {
  arbetslampa: {
    titel: 'Arbejdslampe til Makita-batteri – 15 LED med USB-stik',
    problemH: 'Pandelampen blænder, og mobilen dør',
    problemP: 'Under bilen, i skuret, ved kolonihavehuset efter mørkets frembrud – lyset sidder altid forkert, og batteriet du allerede har, sidder i skruemaskinen og laver ingenting.',
    losningH: 'Lampen der kører på batteriet, du allerede har',
    losningP: 'En arbejdslampe med 15 dioder, der klikker lige på Makita 18V-fatningen. Bærehåndtag, stabil fod og to USB-stik, så mobilen lader, mens du arbejder. Batteri følger ikke med – det er hele pointen: du har det allerede.',
    bullets: [
      '<strong>Lyser hele arbejdsfladen op</strong> – 15 dioder med bredt lys i stedet for en smal kegle',
      '<strong>Klikker lige på batteriet, du ejer</strong> – passer til Makita 18V-fatningen',
      '<strong>Lader mobilen samtidig</strong> – to USB-stik i foden',
      '<strong>Følger med, hvor arbejdet er</strong> – bærehåndtag, 16 cm høj',
      '<strong>Batteri følger ikke med</strong> – lampen kører på dit eget Makita 18V-batteri',
    ],
    option: 'Farve', varden: ['Blå', 'Gul', 'Rød'],
    alt: { main: 'Arbejdslampen med 15 dioder og bærehåndtag', b2: 'Arbejdslampen skråt forfra med afbryderen' },
  },

  diskstall: {
    titel: 'Opvaskestativ i To Etager – Al Opvasken Tørrer på 42 cm',
    problemH: 'Opvasken kæmper om én drypbakke',
    problemP: 'Tallerkenerne balancerer på glassene, bestikket ligger i en bunke, og skærebrættet læner mod flisen. Hver middag ender med det samme tetris ved køkkenvasken.',
    losningH: 'To etager der giver alting sin egen plads',
    losningP: 'Tallerkener og skærebræt står på højkant, hvor de tørrer, glassene hænger på hovedet på egne pinde, bestikket har sit eget rum – og under det hele sidder en afdrypningsbakke, der leder vandet, hvor du vil have det. 42 × 28 cm på bordet, 29 cm højt.',
    bullets: [
      '<strong>Hele familiens opvask er der plads til</strong> – to etager i stedet for en trang bakke',
      '<strong>Glassene tørrer på hovedet</strong> – egne pinde, ingen vandrender i bunden',
      '<strong>Intet vand på bordet</strong> – afdrypningsbakken leder det ud i vasken',
      '<strong>Bestik og skærebræt har egne rum</strong> – intet flyder rundt',
    ],
    option: 'Farve', varden: ['Sort', 'Hvid'],
    alt: { main: 'Opvaskestativet i to etager fyldt med opvask ved køkkenvasken', b2: 'Opvaskestativet med tallerkener, glas og bestik på plads' },
  },

  bankhylla: {
    titel: 'Køkkenhylde med Udtrækkelig Kurv – Dobbelt Plads på Bordpladen',
    problemH: 'Bordpladen slap op for tre apparater siden',
    problemP: 'Kaffemaskinen, morgenmadstingene og glassene trænges på den samme halve meter. Det eneste, der vokser i køkkenet, er bunken.',
    losningH: 'Hylden der skaber en etage mere',
    losningP: 'En træplade at stille ting på – og under den en metalkurv på skinner, du trækker ud som en skuffe. Det, der stod i vejen, får sin egen plads, uden at du borer eller bygger noget om.',
    bullets: [
      '<strong>Dobbelt så meget plads på bordpladen</strong> – stil ovenpå, opbevar nedenunder',
      '<strong>Kurven glider ud som en skuffe</strong> – du ser det hele uden at løfte noget af',
      '<strong>Står stabilt af sig selv</strong> – ingen boring, ingen huller i væggen',
      '<strong>Træ og sort metal</strong> – ligner en møbel, ikke en palleramme',
    ],
    option: 'Farve', varden: ['Sort', 'Hvid'],
    alt: { main: 'Køkkenhylden med træplade og udtrækkelig kurv på bordpladen', b2: 'Køkkenhylden med kurven trukket ud', b3: 'Køkkenhylden skråt forfra' },
  },

  luffarschack: {
    titel: 'Kryds og Bolle i Træ – Klassikeren der Ligger Fremme',
    problemH: 'Spilleaftenen dør i en app-butik',
    problemP: 'Alle vil gerne lave noget sammen, men spillene ligger i en kasse inderst i skabet, og mobilerne er lettere ved hånden.',
    losningH: 'Spillet der står fremme og bliver spillet',
    losningP: 'Kryds og bolle i træ, 14,3 × 14,3 cm, med brikker der ligger i deres eget rum. Pænt nok til sofabordet, enkelt nok til at femåringen og bedstefar spiller på lige vilkår.',
    bullets: [
      '<strong>Kan spilles af alle aldre med det samme</strong> – reglerne kender alle allerede',
      '<strong>Ligger fremme og bliver brugt</strong> – træ der passer på sofabordet',
      '<strong>Brikkerne har eget rum</strong> – intet låg der skal findes, intet der bliver væk',
      '<strong>14,3 cm bredt</strong> – er der plads til på klapbordet, altanbordet og i tasken',
    ],
    alt: { main: 'Kryds og bolle i træ med sorte og hvide brikker', b2: 'Brættet i nærbillede med brikkerne i deres rum' },
  },

  glasspints: {
    titel: 'Isbægre med Låg 2-pak – Lav Isen Direkte i Bægeret',
    problemH: 'Hjemmelavet is opbevares i en plastbøtte med isskorpe',
    problemP: 'Maskinen gør arbejdet, men bagefter skrabes det hele over i et bæger, der hverken slutter tæt eller ser ordentligt ud – og halvdelen af portionen fryser i stykker.',
    losningH: 'Bægrene der går fra maskine til fryser med låg',
    losningP: 'To bægre i 16 oz-format med tætsluttende låg. Lav isen, sæt låget på, ind i fryseren – og server fra samme bæger. Riflet, gennemsigtigt glas der viser, hvilken smag der er hvilken.',
    bullets: [
      '<strong>Fra maskine til fryser uden mellemtrin</strong> – lav og opbevar i samme bæger',
      '<strong>Låget slutter tæt</strong> – ingen isskorpe, ingen frysersmag',
      '<strong>Du kan se, hvad der er i</strong> – gennemsigtigt glas i stedet for anonym plast',
      '<strong>To bægre</strong> – et i fryseren, mens det andet spises af',
    ],
    alt: { main: 'De to isbægre med låg på køkkenbordet', b2: 'Bægeret med låg i flere farver' },
  },

  kastfanga: {
    titel: 'Kast & Fang-sæt – 4 Kurve og Bolde på Snor',
    problemH: 'Kubb-sæsonen varer to weekender',
    problemP: 'Havespillene kræver plan jord, mange deltagere og en times opstilling. Resten af sommeren ligger de i skuret.',
    losningH: 'Spillet der er i gang på tredive sekunder',
    losningP: 'Fire kurve med rem – en i hånden eller om nakken – og bolde på 84 cm snor. Kast, fang i kurven, skift side. Fungerer på plænen, stranden og campingpladsen, to spillere eller hele selskabet.',
    bullets: [
      '<strong>I gang på tredive sekunder</strong> – ingen bane at kridte op, intet at skrue',
      '<strong>Alle kan være med med det samme</strong> – at fange i en kurv er nemmere end at fange med hånden',
      '<strong>Fire kurve i sættet</strong> – to kampe på samme tid eller hele familien i ring',
      '<strong>Bolden forsvinder ikke</strong> – snoren sidder i kurven, ingen ledning i bedet',
    ],
    alt: { main: 'De fire grønne kurve med bolde på snor på et tæppe i græsset', b2: 'Målene – kurven er 13 cm bred og snoren 84 cm' },
  },

  magnetplattor: {
    titel: 'Magnetplader i Kæmpeformat – Byggesæt i Kasse med Håndtag',
    problemH: 'Byggelegetøjet dør, når brikkerne er for små',
    problemP: 'Halvtreds mikrodele under sofaen, en ødelagt manual og et barn, der gav op efter ti minutter. Der bliver bygget mere på skærmen end på gulvet.',
    losningH: 'Store plader der klikker sammen af sig selv',
    losningP: 'Magnetplader i kæmpeformat, der trækker sig sammen den rigtige vej – tårne, huse og køretøjer vokser frem uden manual. Kommer i en kasse med håndtag, så byggeriet ryddes væk lige så hurtigt, som det tages frem. Vælg 46 eller 60 dele.',
    bullets: [
      '<strong>Byggeriet lykkes med det samme</strong> – magneterne sætter sig rigtigt af sig selv',
      '<strong>Store plader, ingen smådele i sofaen</strong> – lavet til mindre hænder',
      '<strong>Ryddes op på et minut</strong> – det hele ned i kassen med håndtag',
      '<strong>Vokser med barnet</strong> – geometri og balance uden at det mærkes',
    ],
    option: 'Antal dele', varden: ['46 dele', '60 dele'],
    alt: { main: 'Tårne og byggerier af farverige magnetplader', b2: 'Et større byggeri af magnetpladerne' },
  },

  mcvaska: {
    titel: 'Motocentric Bagtaske 37 L – Hjelmen Går i Tasken',
    problemH: 'Hjelmen dingler på styret eller bliver hjemme',
    problemP: 'Den, der kører, ved det: hjelmen kan ikke være nogen steder, når du har parkeret, og rygsækken rummer ikke både den og regntøjet.',
    losningH: 'Bagtasken der sluger hele hjelmen',
    losningP: 'En bagtaske på 37 liter fra Motocentric, der spændes fast på sædet eller bagagebæreren. Hjelmen kan være i den, regntøjet og handskerne ved siden af, og reflekserne ses i mørket.',
    bullets: [
      '<strong>Hjelmen får endelig en plads</strong> – 37 liter sluger den med god margin',
      '<strong>Sidder fast på motorcyklen</strong> – spænderemme til sæde eller bagagebærer',
      '<strong>Ses i mørket</strong> – reflekser på bagsiden',
      '<strong>Pakker mere end hjelmen</strong> – regntøj, handsker og kædelås er der plads til',
    ],
    alt: { main: 'Bagtasken monteret på motorcyklen', b2: 'Tasken spændt fast på sædet' },
  },

  somnadskit: {
    titel: 'Sysæt 104 Dele – Alt i Ét Etui',
    problemH: 'Knappen falder af, og hele hjemmet mangler en nål',
    problemP: 'Sømmen der er gået op, knappen i hånden fem minutter før afgang – og nærmeste nål og tråd findes i en anden bolig.',
    losningH: 'Hele syskrinet i et etui med lynlås',
    losningP: '104 dele i ét etui: 24 trådfarver, nåle, sakse, målebånd, trykknapper og nåletræder – sorteret i egne holdere, så det ser ens ud efter femte brug. I skuffen derhjemme eller i kufferten.',
    bullets: [
      '<strong>Knappen er syet fast på fem minutter</strong> – tråd, nål og saks på samme sted',
      '<strong>104 dele med egne pladser</strong> – sættet ser ens ud efter hver brug',
      '<strong>24 trådfarver</strong> – den rette farve til tøjet i stedet for den nærmeste',
      '<strong>Følger med i kufferten</strong> – fladt etui med lynlås',
    ],
    alt: { main: 'Sysættet åbent med trådruller, sakse og tilbehør' },
  },

  reseask: {
    titel: 'Medicinæske i Lommeformat – 7 Rum med Tætsluttende Låg',
    problemH: 'Pillerne rejser i et skramlende glas',
    problemP: 'Weekendtasken pakkes, og medicinen kommer med i originalæsken, der fylder, eller løst i et glas, hvor det hele blandes sammen.',
    losningH: 'Æsken der tager ugens doser med i jakkelommen',
    losningP: 'Syv egne rum under et tætsluttende låg, 9 × 7 × 3,5 cm – æsken forsvinder i jakkelommen eller toilettasken. Rummene holder dagene adskilt, låget holder pillerne tørre.',
    bullets: [
      '<strong>Ugens doser i jakkelommen</strong> – 9 × 7 cm, mindre end et spil kort',
      '<strong>Syv rum holder dagene adskilt</strong> – intet løst der blandes',
      '<strong>Låget slutter tæt</strong> – pillerne ligger tørt i tasken',
      '<strong>Åbnes med én hånd</strong> – spærren slipper med tommelfingeren',
    ],
    option: 'Farve', varden: ['Hvid', 'Grøn'],
    alt: { main: 'Den hvide medicinæske åben med piller i rummene', b2: 'Den grønne medicinæske med målene 9 × 7 cm' },
  },

  veckodosett: {
    titel: 'Ugedoseringsæske 21 Rum – Morgen, Middag og Aften i Syv Dage',
    problemH: '"Tog jeg morgendosis?" er et dagligt spørgsmål',
    problemP: 'Tre doser om dagen og syv glas i badeværelsesskabet – til sidst holder ingen styr på det, og det er netop det, der er pointen.',
    losningH: 'En uge fyldt om søndagen, så er det bare at åbne',
    losningP: 'Syv dagsæsker med tre rum hver – morgen, middag, aften – i et etui med låg. Fyld det hele om søndagen. Dagens æske kommer med i lommen, resten står hjemme, og svaret på spørgsmålet ses i rummet.',
    bullets: [
      '<strong>Svaret ses i rummet</strong> – tomt rum betyder taget dosis',
      '<strong>Dagens æske følger med</strong> – tag den løs og put den i lommen, resten står hjemme',
      '<strong>21 rum fyldt på én gang</strong> – én påfyldning om ugen i stedet for tre om dagen',
      '<strong>Låget holder styr</strong> – æskerne sidder på plads i etuiet',
    ],
    alt: { main: 'Ugedoseringsæsken med syv dagsæsker i etuiet', b2: 'En dagsæske taget ud af etuiet' },
  },

  sandbild: {
    titel: '3D-sandbillede 20 cm – Nyt Landskab Hver Gang Du Vender Det',
    problemH: 'Pynten har set ens ud, siden det blev pakket ud',
    problemP: 'Hylden er møbleret og færdig – og død. Intet i rummet forandrer sig, før nogen flytter noget.',
    losningH: 'Billedet der tegner sig selv om',
    losningP: 'Vend rammen, og sandet synker langsomt gennem væsken til et nyt bjerglandskab – hver gang forskelligt fra det forrige. Rund ramme, 20,2 cm bred, står på fod på hylden eller skrivebordet.',
    bullets: [
      '<strong>Nyt billede hver gang</strong> – sandet lægger sig aldrig ens to gange',
      '<strong>Rummets roligste blikfang</strong> – langsom bevægelse i stedet for endnu en stillestående pynteting',
      '<strong>Vendes med ét greb</strong> – står stabilt på egen fod',
      '<strong>20 cm rundt</strong> – fylder som en bog på hylden, ses som et billede',
    ],
    option: 'Farve', varden: ['Rød', 'Rav'],
    alt: { main: 'Det røde 3D-sandbillede på en hylde', b2: 'Målene – rammen er 20,2 cm bred og 21,4 cm høj', b3: 'Sandbilledet i ravfarve' },
  },

  dysonborste: {
    titel: 'Pelsbørste til Dyson-støvsuger – Børst og Sug i Samme Bevægelse',
    problemH: 'Pelsen børstes ud – og lander på gulvet',
    problemP: 'Hunden taber hår, børsten fyldes, og alt det, du har redt ud, dratter ned på tæppet, du lige har støvsuget. To gøremål der gør hinanden ugjort.',
    losningH: 'Børsten der sidder på støvsugeren',
    losningP: 'Et børstehoved der tilsluttes Dyson V7, V8, V10, V11 eller V15 – med slange og adaptere i sættet. Piggene løsner underulden, og maskinen suger den op i samme bevægelse. Pelsen ender i beholderen, ikke på gulvet.',
    bullets: [
      '<strong>Pelsen ender i støvsugeren</strong> – ikke på gulvet du lige har gjort rent',
      '<strong>Passer til din Dyson</strong> – V7, V8, V10, V11 og V15 med medfølgende adaptere',
      '<strong>Slangen giver rækkevidde</strong> – børst i sofaen uden at løfte maskinen',
      '<strong>Skånsomme pigge</strong> – løsner underuld uden at trække i huden',
    ],
    alt: { main: 'Børstehovedet på støvsugeren ved siden af hund og kat', b2: 'Sættets dele – børstehoved, slange og adaptere, mærket V7–V15' },
  },

  jetflakt: {
    titel: 'Jetblæser til Makita-batteri – Blæs Rent uden Ledning',
    problemH: 'Trykluft på dåse slipper op midt i arbejdet',
    problemP: 'Støvet i computeren, spånerne på arbejdsbordet, løvet på trappen – dåserne koster og løber tør, og kompressoren med slange står i et skur, du ikke er i.',
    losningH: 'Turboblæseren der klikker på batteriet, du allerede har',
    losningP: 'En håndholdt jetblæser med børsteløs motor, der blæser støv, spåner og løv væk med en rettet luftstrøm. Pistolgreb, aftrækker, og foden klikker lige på Makita 18V-fatningen – samme batteri som i skruemaskinen. Batteri følger ikke med: den kører på det, du allerede ejer.',
    bullets: [
      '<strong>Blæser rent, hvor dåseluften slap op</strong> – støv, spåner og løv uden forbrugsvarer',
      '<strong>Klikker lige på batteriet, du ejer</strong> – passer til Makita 18V-fatningen',
      '<strong>Børsteløs motor i pistolgreb</strong> – rettes med én hånd',
      '<strong>Batteri følger ikke med</strong> – blæseren kører på dit eget værktøjsbatteri',
    ],
    alt: { main: 'Jetblæseren uden batteri, skråt forfra' },
  },

  magnethylla: {
    titel: 'Magnethylde til Vaskemaskine og Køleskab – Opbevaring Uden Boring',
    problemH: 'Vaskemidlet står på gulvet bag døren',
    problemP: 'Vaskerummet har nul hylder, og udlejeren har holdninger til borehuller. Så flaskerne står på maskinen og vælter ved hver centrifugering.',
    losningH: 'Hylden der sætter sig fast på pladen',
    losningP: 'En hylde med magnetbagside der sætter sig fast direkte på siden af vaskemaskinen eller køleskabet. 29,5 cm bred med en kant, der holder flaskerne på plads – oppe på sekunder, flyttes lige så hurtigt, efterlader ingen huller.',
    bullets: [
      '<strong>Oppe på sekunder, ingen huller</strong> – magneten sætter sig direkte fast på pladen',
      '<strong>Flaskerne bliver stående</strong> – kanten holder imod, når maskinen centrifugerer',
      '<strong>Flyttes når du vil</strong> – tag den løs, sæt den fast på næste plade',
      '<strong>29,5 cm bred</strong> – vaskemiddel, skyllemiddel og pletfjerner på række',
    ],
    option: 'Farve', varden: ['Sort', 'Hvid'],
    alt: { main: 'To sorte magnethylder med vaskemiddel på siden af vaskemaskinen', b2: 'Den hvide hylde med målene 29,5 × 9,5 × 7,5 cm' },
  },
};
