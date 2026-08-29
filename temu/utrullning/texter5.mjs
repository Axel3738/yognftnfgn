// Batch 5 (2026-08-28) — svensk mastercopy för 14 av offertens 17 produkter.
// Tre skapas INTE ännu: lövblåsaren (batterikonfig oklar), jetfläkten
// (motstridiga batteribesked) och fotokudden (custom-produkt utan länk).
//
// Räkneorden är låsta mot CWD-offerten och bilderna: 104 delar (inte 100,
// inte 111), 46/60 delar (inte 48/68), 37 L, 21 fack, 14,3 cm, 20,2 cm.
// Bilder märkta med fel antal eller kinesisk text används ALDRIG.
//
// Översättningarna ligger i texter5-no/da/fi/en.mjs (subagenter, korrlästa).

export const T5_SV = {
  arbetslampa: {
    titel: 'Arbetslampa för Makita-batteri – 15 LED med USB-uttag',
    problemH: 'Pannlampan bländar och mobilen dör',
    problemP: 'Under bilen, i förrådet, vid friggeboden efter mörkrets inbrott – ljuset sitter alltid åt fel håll, och batteriet du redan äger sitter i skruvdragaren och gör ingenting.',
    losningH: 'Lampan som drivs av batteriet du redan har',
    losningP: 'En arbetslampa med 15 dioder som kliver rakt på Makita 18V-fästet. Bärhandtag, stabil fot och två USB-uttag så mobilen laddar medan du jobbar. Batteri ingår inte – det är hela poängen: du har det redan.',
    bullets: [
      '<strong>Lyser upp hela arbetsytan</strong> – 15 dioder med brett ljus i stället för en smal kägla',
      '<strong>Kliver rakt på batteriet du äger</strong> – passar Makita 18V-fästet',
      '<strong>Laddar mobilen samtidigt</strong> – två USB-uttag i foten',
      '<strong>Följer med dit jobbet är</strong> – bärhandtag, 16 cm hög',
      '<strong>Batteri ingår inte</strong> – lampan drivs av ditt eget Makita 18V-batteri',
    ],
    option: 'Färg', varden: ['Blå', 'Gul', 'Röd'],
    alt: { main: 'Arbetslampan med 15 dioder och bärhandtag', b2: 'Arbetslampan snett framifrån med strömbrytaren' },
  },

  diskstall: {
    titel: 'Diskställ i Två Våningar – Hela Diskens Torkyta på 42 cm',
    problemH: 'Disken slåss om en droppbricka',
    problemP: 'Tallrikarna balanserar på glasen, besticken ligger i en hög och skärbrädan lutar mot kaklet. Varje middag slutar med samma tetris vid diskhon.',
    losningH: 'Två våningar som ger varje sak sin plats',
    losningP: 'Tallrikar och skärbräda står på högkant där de torkar, glasen hänger upp och ner på egna pinnar, besticken har sitt eget fack – och under alltihop sitter en avrinningsbricka som leder vattnet dit du vill. 42 × 28 cm på bänken, 29 cm högt.',
    bullets: [
      '<strong>Middagsdisken för hela familjen ryms</strong> – två våningar i stället för en trång bricka',
      '<strong>Glasen torkar upp och ner</strong> – egna pinnar, inga vattenränder i botten',
      '<strong>Inget vatten på bänken</strong> – avrinningsbrickan leder ut i hon',
      '<strong>Bestick och skärbräda har egna fack</strong> – inget ligger och skvalpar',
    ],
    option: 'Färg', varden: ['Svart', 'Vit'],
    alt: { main: 'Diskstället i två våningar fullt med disk vid diskhon', b2: 'Diskstället med tallrikar, glas och bestick på plats' },
  },

  bankhylla: {
    titel: 'Bänkhylla med Utdragbar Korg – Dubbel Yta på Samma Bänk',
    problemH: 'Bänkytan tog slut för tre apparater sedan',
    problemP: 'Kaffebryggaren, frukostgrejerna och burkarna trängs på samma halvmeter. Det enda som växer i köket är högen.',
    losningH: 'Hyllan som skapar en våning till',
    losningP: 'En träskiva att ställa saker på – och under den en metallkorg på skenor som du drar ut som en låda. Det som stod i vägen får en egen plats, utan att du borrar eller bygger om något.',
    bullets: [
      '<strong>Dubbelt så mycket bänkyta</strong> – ställ ovanpå, förvara undertill',
      '<strong>Korgen glider ut som en låda</strong> – du ser allt utan att lyfta av något',
      '<strong>Står stadigt av sig själv</strong> – ingen borrning, inga hål i väggen',
      '<strong>Trä och svart metall</strong> – ser ut som en möbel, inte som en pallkrage',
    ],
    option: 'Färg', varden: ['Svart', 'Vit'],
    alt: { main: 'Bänkhyllan med träskiva och utdragbar korg på köksbänken', b2: 'Bänkhyllan med korgen utdragen', b3: 'Bänkhyllan snett framifrån' },
  },

  luffarschack: {
    titel: 'Luffarschack i Trä – Klassikern som Ligger Framme',
    problemH: 'Spelkvällen dör i en app-store',
    problemP: 'Alla vill göra något tillsammans, men spelen ligger i en kartong längst in i garderoben och mobilerna är närmare till hands.',
    losningH: 'Spelet som står framme och blir spelat',
    losningP: 'Luffarschack i trä, 14,3 × 14,3 cm, med brickor som ligger kvar i sina fack. Snyggt nog för soffbordet, enkelt nog för att femåringen och farfar ska spela på samma villkor.',
    bullets: [
      '<strong>Spelas av alla åldrar direkt</strong> – reglerna kan alla redan',
      '<strong>Ligger framme och används</strong> – trä som passar på soffbordet',
      '<strong>Brickorna har egna fack</strong> – inget lock som ska hittas, inget som tappas bort',
      '<strong>14,3 cm brett</strong> – får plats på brickbordet, balkongbordet och i väskan',
    ],
    alt: { main: 'Luffarschack i trä med svarta och vita brickor', b2: 'Brädet i närbild med brickorna i sina fack' },
  },

  glasspints: {
    titel: 'Glasspints med Lock 2-pack – Gör Glassen Direkt i Burken',
    problemH: 'Hemmagjord glass förvaras i en plastlåda med isskorpa',
    problemP: 'Maskinen gör jobbet, men sen skrapas allt över i en burk som varken håller tätt eller ser ut som något – och halva satsen fryser sönder.',
    losningH: 'Burkarna som går från maskin till frys med lock',
    losningP: 'Två pints i 16 oz-format med tättslutande lock. Gör glassen, sätt på locket, in i frysen – och servera ur samma burk. Räfflat, genomskinligt glas som visar vilken smak som är vilken.',
    bullets: [
      '<strong>Från maskin till frys utan mellansteg</strong> – gör och förvara i samma burk',
      '<strong>Locket håller tätt</strong> – ingen isskorpa, ingen fryssmak',
      '<strong>Du ser vad som är i</strong> – genomskinligt glas i stället för anonym plast',
      '<strong>Två burkar</strong> – en i frysen medan den andra äts ur',
    ],
    alt: { main: 'De två glaspintarna med lock på köksbänken', b2: 'Burken med locken i flera färger' },
  },

  kastfanga: {
    titel: 'Kasta & Fånga-set – 4 Korgar och Bollar på Lina',
    problemH: 'Kubb-säsongen är två helger lång',
    problemP: 'Utespelen kräver plan mark, många deltagare och en timmes uppställning. Resten av sommaren ligger de i förrådet.',
    losningH: 'Spelet som är igång på trettio sekunder',
    losningP: 'Fyra korgar med rem – en i handen eller runt nacken – och bollar på 84 cm lina. Kasta, fånga i korgen, byt håll. Funkar på gräsmattan, stranden och campingen, två spelare eller hela sällskapet.',
    bullets: [
      '<strong>Igång på trettio sekunder</strong> – ingen plan att kritas, inget att skruva',
      '<strong>Alla kan vara med direkt</strong> – fånga i korg är lättare än att fånga med hand',
      '<strong>Fyra korgar i setet</strong> – två matcher samtidigt eller hela familjen i ring',
      '<strong>Bollen försvinner inte</strong> – linan sitter i korgen, inget letande i rabatten',
    ],
    alt: { main: 'De fyra gröna korgarna med bollar på lina på en filt i gräset', b2: 'Måtten – korgen är 13 cm bred och linan 84 cm' },
  },

  magnetplattor: {
    titel: 'Magnetplattor i Storformat – Byggset i Låda med Handtag',
    problemH: 'Byggleksakerna dör när bitarna är för små',
    problemP: 'Femtio mikrodelar under soffan, en trasig manual och ett barn som gav upp efter tio minuter. Det byggs mer på skärmen än på golvet.',
    losningH: 'Stora plattor som klickar ihop av sig själva',
    losningP: 'Magnetplattor i storformat som dras ihop åt rätt håll – torn, hus och fordon växer fram utan manual. Kommer i en låda med handtag så bygget plockas undan lika fort som det plockas fram. Välj 46 eller 60 delar.',
    bullets: [
      '<strong>Bygget lyckas direkt</strong> – magneterna sätter sig rätt själva',
      '<strong>Stora plattor, inga smådelar i soffan</strong> – gjort för mindre händer',
      '<strong>Städas på en minut</strong> – allt ner i lådan med handtag',
      '<strong>Växer med barnet</strong> – geometri och balans utan att det märks',
    ],
    option: 'Antal delar', varden: ['46 delar', '60 delar'],
    alt: { main: 'Torn och byggen av färgglada magnetplattor', b2: 'Ett större bygge av magnetplattorna' },
  },

  mcvaska: {
    titel: 'Motocentric Bakväska 37 L – Hjälmen Går i Väskan',
    problemH: 'Hjälmen dinglar på styret eller stannar hemma',
    problemP: 'Den som kör vet: hjälmen får inte plats någonstans när du parkerat, och ryggsäcken rymmer inte både den och regnstället.',
    losningH: 'Bakväskan som sväljer hela hjälmen',
    losningP: 'En bakväska på 37 liter från Motocentric som spänns fast på dynan eller pakethållaren. Hjälmen går i, regnstället och handskarna bredvid, och reflexdetaljerna syns i mörkret.',
    bullets: [
      '<strong>Hjälmen får äntligen en plats</strong> – 37 liter sväljer den med marginal',
      '<strong>Sitter fast på hojen</strong> – spännremmar för dyna eller pakethållare',
      '<strong>Syns i mörkret</strong> – reflexdetaljer på baksidan',
      '<strong>Packar mer än hjälmen</strong> – regnställ, handskar och kedjelås ryms bredvid',
    ],
    alt: { main: 'Bakväskan monterad på motorcykeln', b2: 'Väskan fastspänd på dynan' },
  },

  somnadskit: {
    titel: 'Sömnadskit 104 Delar – Allt i Ett Fodral',
    problemH: 'Knappen lossnar och hela hemmet saknar en nål',
    problemP: 'Fållen som släppt, knappen i handen fem minuter före avfärd – och närmaste nål och tråd finns i en annan bostad.',
    losningH: 'Hela sylådan i ett fodral med dragkedja',
    losningP: '104 delar i ett fodral: 24 trådfärger, nålar, saxar, måttband, tryckknappar och nålpåträdare – sorterat i egna hållare så det ser likadant ut efter femte användningen. I byrålådan hemma eller i resväskan.',
    bullets: [
      '<strong>Knappen är fastsydd på fem minuter</strong> – tråd, nål och sax på samma ställe',
      '<strong>104 delar med egna platser</strong> – kitet ser likadant ut efter varje användning',
      '<strong>24 trådfärger</strong> – rätt färg till plagget i stället för närmaste',
      '<strong>Följer med i resväskan</strong> – platt fodral med dragkedja',
    ],
    alt: { main: 'Sömnadskitet öppet med trådrullar, saxar och tillbehör' },
  },

  reseask: {
    titel: 'Medicinask i Fickformat – 7 Fack med Tätslutande Lock',
    problemH: 'Tabletterna reser i en skallrande burk',
    problemP: 'Helgväskan packas och medicinen åker med i originalkartongen som tar plats, eller löst i en burk där allt blandas.',
    losningH: 'Asken som tar veckans doser i jackfickan',
    losningP: 'Sju egna fack under ett tätslutande lock, 9 × 7 × 3,5 cm – asken försvinner i jackfickan eller necessären. Facken håller isär dagarna, locket håller tabletterna torra.',
    bullets: [
      '<strong>Veckans doser i jackfickan</strong> – 9 × 7 cm, mindre än en kortlek',
      '<strong>Sju fack håller isär dagarna</strong> – inget löst som blandas',
      '<strong>Locket sluter tätt</strong> – tabletterna ligger torrt i väskan',
      '<strong>Öppnas med en hand</strong> – spärren släpper med tummen',
    ],
    option: 'Färg', varden: ['Vit', 'Grön'],
    alt: { main: 'Den vita medicinasken öppen med tabletter i facken', b2: 'Den gröna medicinasken med måtten 9 × 7 cm' },
  },

  veckodosett: {
    titel: 'Veckodosett 21 Fack – Morgon, Middag och Kväll i Sju Dagar',
    problemH: '"Tog jag morgondosen?" är en daglig fråga',
    problemP: 'Tre doser om dagen och sju burkar i badrumsskåpet – till slut håller ingen räkningen, och det är just räkningen som är poängen.',
    losningH: 'En vecka fylld på söndagen, sen är det bara att öppna',
    losningP: 'Sju dagsaskar med tre fack var – morgon, middag, kväll – i ett fodral med lock. Fyll allt på söndagen. Dagens ask åker med i fickan, resten står kvar hemma, och svaret på frågan syns i facket.',
    bullets: [
      '<strong>Svaret syns i facket</strong> – tomt fack betyder tagen dos',
      '<strong>Dagens ask följer med</strong> – lossna och ta i fickan, resten står hemma',
      '<strong>21 fack fyllda på en gång</strong> – en påfyllning i veckan i stället för tre om dagen',
      '<strong>Locket håller ordningen</strong> – askarna sitter på plats i fodralet',
    ],
    alt: { main: 'Veckodosetten med sju dagsaskar i fodralet', b2: 'En dagsask lossad ur fodralet' },
  },

  sandbild: {
    titel: '3D-sandbild 20 cm – Nytt Landskap Varje Gång Du Vänder Den',
    problemH: 'Prydnaderna har sett likadana ut sedan de packades upp',
    problemP: 'Hyllan är möblerad och klar – och död. Inget i rummet förändras förrän någon flyttar.',
    losningH: 'Tavlan som ritar om sig själv',
    losningP: 'Vänd på ramen och sanden sjunker långsamt genom vätskan till ett nytt bergslandskap – varje gång olikt det förra. Rund ram, 20,2 cm bred, står på fot på hyllan eller skrivbordet.',
    bullets: [
      '<strong>Ny bild varje gång</strong> – sanden lägger sig aldrig likadant två gånger',
      '<strong>Rummets lugnaste blickfång</strong> – långsam rörelse i stället för ännu en stillastående prydnad',
      '<strong>Vänds med ett grepp</strong> – står stadigt på egen fot',
      '<strong>20 cm rund</strong> – tar hyllplats som en bok, syns som en tavla',
    ],
    option: 'Färg', varden: ['Röd', 'Bärnsten'],
    alt: { main: 'Den röda 3D-sandbilden på en hylla', b2: 'Måtten – ramen är 20,2 cm bred och 21,4 cm hög', b3: 'Sandbilden i bärnstensfärg' },
  },

  dysonborste: {
    titel: 'Pälsborste till Dyson-dammsugare – Borsta och Sug i Samma Drag',
    problemH: 'Pälsen borstas ur – och landar på golvet',
    problemP: 'Hunden fäller, borsten fylls, och allt du kammat ur singlar ner på mattan du just dammsugit. Två sysslor som gör varandra ogjorda.',
    losningH: 'Borsten som sitter på dammsugaren',
    losningP: 'Ett borsthuvud som ansluts till Dyson V7, V8, V10, V11 eller V15 – med slang och adaptrar i kitet. Piggarna lossar underullen och maskinen suger upp den i samma drag. Pälsen hamnar i behållaren, inte på golvet.',
    bullets: [
      '<strong>Pälsen hamnar i dammsugaren</strong> – inte på golvet du just gjort rent',
      '<strong>Passar din Dyson</strong> – V7, V8, V10, V11 och V15 med medföljande adaptrar',
      '<strong>Slangen ger räckvidd</strong> – borsta i soffan utan att lyfta maskinen',
      '<strong>Skonsamma piggar</strong> – lossar underull utan att dra i huden',
    ],
    alt: { main: 'Borsthuvudet på dammsugaren intill hund och katt', b2: 'Kitets delar – borsthuvud, slang och adaptrar, märkta V7–V15' },
  },

  jetflakt: {
    titel: 'Jetfläkt för Makita-batteri – Blås Rent utan Sladd',
    problemH: 'Tryckluften på burk tar slut mitt i jobbet',
    problemP: 'Dammet i datorn, spånen på arbetsbänken, löven på trappen – burkarna kostar och dör, och kompressorn med slang står i ett förråd du inte är i.',
    losningH: 'Turbofläkten som kliver på batteriet du redan har',
    losningP: 'En handhållen jetfläkt med borstlös motor som blåser bort damm, spån och löv med ett riktat luftflöde. Pistolgrepp, avtryckare, och foten kliver rakt på Makita 18V-fästet – samma batteri som i skruvdragaren. Batteri ingår inte: den drivs av det du redan äger.',
    bullets: [
      '<strong>Blåser rent där burkluften tog slut</strong> – damm, spån och löv utan förbrukningsvaror',
      '<strong>Kliver rakt på batteriet du äger</strong> – passar Makita 18V-fästet',
      '<strong>Borstlös motor i pistolgrepp</strong> – riktas med en hand',
      '<strong>Batteri ingår inte</strong> – fläkten drivs av ditt eget verktygsbatteri',
    ],
    alt: { main: 'Jetfläkten utan batteri, snett framifrån' },
  },

  magnethylla: {
    titel: 'Magnethylla för Tvättmaskin och Kylskåp – Förvaring Utan Borr',
    problemH: 'Tvättmedlet står på golvet bakom dörren',
    problemP: 'Tvättstugan har noll hyllor och hyresvärden har åsikter om borrhål. Så flaskorna står på maskinen och ramlar av vid varje centrifugering.',
    losningH: 'Hyllan som sätter sig fast på plåten',
    losningP: 'En hylla med magnetbaksida som fäster direkt på tvättmaskinens eller kylskåpets sida. 29,5 cm bred med kant som håller flaskorna på plats – uppe på sekunder, flyttas lika fort, lämnar inga hål.',
    bullets: [
      '<strong>Upp på sekunder, inga hål</strong> – magneten fäster direkt på plåten',
      '<strong>Flaskorna står kvar</strong> – kanten håller emot när maskinen centrifugerar',
      '<strong>Flyttas när du vill</strong> – lossa, sätt fast på nästa plåtyta',
      '<strong>29,5 cm bred</strong> – tvättmedel, sköljmedel och fläckborttagare på rad',
    ],
    option: 'Färg', varden: ['Svart', 'Vit'],
    alt: { main: 'Två svarta magnethyllor med tvättmedel på tvättmaskinens sida', b2: 'Den vita hyllan med måtten 29,5 × 9,5 × 7,5 cm' },
  },
};
