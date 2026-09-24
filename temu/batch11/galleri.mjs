// Batch 11–13: GALLERIBESLUT per produkt efter Axels skörd 2026-09-24 (temu/bildskord/<id>/).
// Varje kontaktark granskades visuellt (skord/<id>-ark.jpg). Regler som styrde valen:
//  - bilder med mått/räkneord som inte finns i offerten används INTE (CLAUDE.md)
//  - engelsk text: beskärs bort (crop, deterministiskt) eller översätts med KIE (kie:), och granskas efter
//    ⚠️ 2026-09-24: KIE (nano-banana-edit) klarar BARA 1–2 ord ("3-PACK", "L · Storlek 41–46"). Meningar och
//    etiketter blev rappakalja ("Dippekedaja", "Så här sättet du påur") — nio av elva försök underkändes och
//    byttes till beskärning eller ströks. Skriv aldrig kie: för mer än två ord.
//  - "waterproof"/"100 %" o.dyl. får inte följa med — bilder med sådana löften beskärs eller hoppas
//  - QC-fotot (fabriksbilden) ligger kvar: qc:'forst' = det förblir hero, qc:'sist' = flyttas sist
// crop = [x, y, w, h] som andelar. fil = nummer i bildskord-mappen. alt = svenska (används i SE och NO).
// pad = lägg den beskurna bilden på vit kvadrat (1:1). bort = [alt-delsträngar] på befintliga medier som ska tas bort. gif: false = ingen GIF (befintlig tas bort). filNo = egen fil för NO. qc:'bort' = ta bort de gamla QC-medierna. ersatt = ladda om (vid VARJE körning — ta bort flaggan när omladdningen är gjord)
// bilderna även om alt-texten redan finns. AI-material (bilder + GIF) kommer från ai.mjs och läggs på av galleri-bygg.
export const GALLERI = {
  // ── redan live ────────────────────────────────────────────────────────────
  varmesulor: { qc: 'sist', bilder: [
    { fil: '10', alt: 'Värmesulorna med fjärrkontrollen, produktfoto' },
    { fil: '12', alt: 'Värmesulorna med USB-laddkabeln och fjärrkontrollen' },
    { fil: '15', alt: 'Värmesula storlek L, 41–46, med klipplinjer', kie: 'Replace the English text "L 41-46 Euro code" with Swedish "L · Storlek 41–46". Keep everything else identical.' },
  ] },
  krukvaxthuv: { qc: 'sist', bilder: [
    { fil: '10', alt: 'Tre krukväxthuvar i beige fiberduk över krukväxter' },
    { fil: '12', alt: 'Krukväxthuven över en växt i snö, dragkedjan stängd' },
    { fil: '06', alt: 'Tre krukväxthuvar – 3-pack', kie: 'Replace the English text "3 Packs" with Swedish "3-PACK" in the same style. Keep everything else identical.' },
    { fil: '05', alt: 'Huven med dragkedjan öppen över en tomatplanta', crop: [0, 0, 0.5, 1] },
    { fil: '11', alt: 'Huven över en gran i snö', crop: [0.48, 0.12, 0.5, 0.88] },
  ] },
  bikupsjacka: { qc: 'sist', bilder: [
    { fil: '06', alt: 'Bikupans vinterjacka runt en bikupa, spännremmar på framsidan' },
    { fil: '09', alt: 'Två bikupor med vinterjackor i snö' },
    { fil: '10', alt: 'Bikupor med vinterjacka i en snöig trädgård' },
    { fil: '11', alt: 'Tre bikupor med vinterjackor, snö på taken' },
  ] },
  ljusslingevindor: { qc: 'sist', bilder: [
    { fil: '09', alt: 'Ljusslingevinda, tom och med ljusslingan upplindad' },
    { fil: '11', alt: 'Ljusslingevindor framför öppen spis och julgran' },
    { fil: '08', alt: 'Ljusslingevinda med lila halloween-slinga' },
    { fil: '10', alt: 'Vindan med upplindad slinga vid julgranen', crop: [0, 0.16, 1, 0.84] },
    { fil: '12', alt: 'Tomte håller en ljusslingevinda' },
  ] },
  makitahallare: { qc: 'sist', bilder: [
    { fil: '12', alt: 'Makita-hållare på väggen med skruvdragare, tigersåg och ficklampa' },
    { fil: '15', alt: 'Hållaren i handen, plattan med fyra skruvhål' },
    { fil: '13', alt: 'Hållaren skruvas fast i väggen, maskinerna hängs i', crop: [0, 0.25, 1, 0.75] },
    { fil: '14', alt: 'Skruvdragare hängd i hållaren på väggen', crop: [0, 0, 1, 0.56] },
    { fil: '07', alt: 'Hållaren monteras med fyra skruvar', crop: [0, 0.2, 1, 0.8] },
    { fil: '11', alt: 'Två steg: skruva fast hållaren, skjut in maskinen', crop: [0, 0.13, 1, 0.4] },
  ] },
  rcdrift: { qc: 'forst', bilder: [] },   // Temu-skörden misslyckades (inloggning) — körs om
  // Axel 2026-09-24 (andra granskningen): fil 09 (renderad, ser genomskinlig ut som en presenning) tas bort — huven är helt svart.
  // Fil 08 (förrådet) är också en render där maskinen syns igenom huven — bort av samma skäl (2026-09-24).
  vedklyvshuv: { qc: 'sist', bort: ['under tak i regn', 'i ett förråd'], bilder: [
    { fil: '06', alt: 'Vedklyvshuven över en vedklyv, dragsko i kanten' },
    { fil: '07', alt: 'Huven framifrån och händer som drar åt dragskon' },
    { fil: '05', alt: 'Närbild på 210D-väven och dragskons söm' },
  ] },
  poolpumphuv: { qc: 'sist', bilder: [   // Axel 2026-09-24: bilden med huven i drift ska vara först, inte QC-rendern
    { fil: '07', alt: 'Poolvärmepumpens vinterhuv över pumpen, rören går ut genom öppningarna', crop: [0, 0.1, 0.9, 0.9] },
    { fil: '05', alt: 'Huven med snö på toppen' },
  ] },
  regnkedja: { qc: 'sist', bilder: [
    { fil: '02', alt: 'Regnkedjan hänger från hängrännan vid takfoten' },
    { fil: '06', alt: 'Regnkedjan under ett trätak' },
    { fil: '09', alt: 'Kedjans koppar i kopparfärg vid takfoten' },
    { fil: '11', alt: 'Regnkedjan vid ett modernt hus med trädäck' },
    { fil: '10', alt: 'Regnkedjan vid en blomsteraffär' },
    { fil: '12', alt: 'Regnkedjan vid ett uterum' },
  ] },
  // Axel 2026-09-24: "konstig ratio, låg kvalitet" — beskärningarna läggs på vit kvadrat (pad). Omladdade med ersatt: true
  // i SE + NO samma dag; flaggan är borttagen så körningarna är idempotenta igen (ersatt laddar om vid VARJE körning).
  // Axel 2026-09-24 (andra granskningen): GIF:en visade inte hur produkten används — byts mot bild (gif: false tar bort den).
  rullknivslip: { qc: 'sist', gif: false, bilder: [
    { fil: '04', alt: 'Rullknivslipen i trä med vinkelblocket och en kniv', crop: [0, 0.22, 1, 0.6], pad: true },
    { fil: '07', alt: 'Kniven hålls mot vinkelblocket medan rullen dras', crop: [0, 0.2, 1, 0.45], pad: true },
    { fil: '09', alt: 'Kniven slipas vid skärbrädan', crop: [0.22, 0.2, 0.78, 0.8], pad: true },
    { fil: '03', alt: 'Slipskivan lossas från rullen', crop: [0, 0.28, 0.68, 0.72], pad: true },
  ] },
  highlandcow: { qc: 'sist', gif: { fil: '09.mp4', alt: 'Kalendrarna på lagret, video' }, bilder: [   // GIF:en gjord om till 1:1 och flyttad sist (Axel 2026-09-24)
    { fil: '15', alt: 'Highland Cow-kalendern i julmiljö' },
    { fil: '10', alt: 'De 24 highland cow-figurerna uppradade' },
    { fil: '12', alt: 'Asken och figurerna' },
    { fil: '11', alt: 'Askens framsida' },
    { fil: '20', alt: 'Tre askar' },
    { fil: '14', alt: 'Asken i handen på lagret' },
  ] },
  // Axel 2026-09-24 (andra granskningen): första bilden var QC-fotot och GIF:en "riktigt dålig". Fil 20 var dessutom FEL ask
  // ("ADVENT CALENDAR"-designen med engelsk text) — den riktiga produkten är "Merry Christmas"-asken (QC-fotot), fil 19 utan textöverlägg.
  // Stengallret i fil 11 visar 32 stenar, så alt-texten får inte säga "24".
  adelstenskalender: { qc: 'sist', bort: ['Den röda asken öppen med grävblocken', '24 stenar'], bilder: [
    { fil: '19', alt: 'Ädelstenskalendern öppen: 24 luckor, grävblocken, hammaren, penseln och luppen' },
    { fil: '11', ny: '11b', alt: 'Exempel på ädelstenar som kan gömma sig i blocken', crop: [0.07, 0.63, 0.88, 0.35] },
  ] },
  cykelhallarskydd: { qc: 'sist', bilder: [
    { fil: '06', alt: 'Cykelhållarskyddet över cyklarna bak på en husbil' },
    { fil: '08', alt: 'Skyddet från sidan, cykelhållaren syns under' },
    { fil: '10', alt: 'Husbil med täckta cyklar på en bergsväg' },
    { fil: '12', alt: 'Husvagn med skyddet över cyklarna, varningsskylt' },
    { fil: '07', alt: 'Skyddet bak på husbilen med varningsskylt' },
    { fil: '11', alt: 'Husbil med skyddet på en grusväg' },
    { fil: '09', alt: 'Skyddet med varningsskylt, närbild' },
  ] },
  takachuv: { qc: 'sist', bilder: [
    { fil: '04', alt: 'Tak-AC-huven, svart med dragsko, och en husbil' },
    { fil: '05', alt: 'Huven över AC:n på husbilstaket i regn' },
    { fil: '07', alt: 'Huven på taket i snö' },
    { fil: '02', alt: 'Huven på taket i regn, inzoomad', crop: [0, 0, 1, 0.72] },
    { fil: '08', alt: 'Huven och husbilar' },
    { fil: '06', alt: 'Med huv och utan huv', kie: 'Replace "Protected" with Swedish "Med huv" and "Unprotected" with "Utan huv". Keep everything else identical.' },
  ] },
  buskjacka: { qc: 'sist', bilder: [
    { fil: '11', alt: 'Buskjackor över buskar i en snöig trädgård' },
    { fil: '09', alt: 'Buskjackan över en buske i snö', crop: [0.32, 0, 0.68, 1] },
    { fil: '03', alt: 'Två buskjackor i en trädgård', crop: [0, 0, 1, 0.72] },
    { fil: '10', alt: 'Buskjackan med dragkedjan öppen', crop: [0, 0, 0.5, 1] },
  ] },
  // Axel 2026-09-24 (andra granskningen): första bilden (QC, inzoomat plastfack) — "går inte att se att det är en kalender".
  // Fil 05 = asken öppen med 24 numrerade luckor; beskuren så den engelska texten uppe till höger försvinner, på vit kvadrat.
  husbilskalender: { qc: 'sist', bilder: [
    { fil: '05', ny: '05h', alt: 'Husbilskalendern öppen: 24 luckor med retrobussar att hänga upp', crop: [0, 0.27, 1, 0.72], pad: true },
    { fil: '06', alt: 'Retrobussarna i närbild', crop: [0, 0, 0.68, 0.85] },
    { fil: '10', alt: 'Retrobussar hängda i en julgran', crop: [0.32, 0.22, 0.6, 0.55] },
    { fil: '04', alt: 'Retrobussarna uppradade', crop: [0.42, 0, 0.58, 1] },
  ] },
  lovsilar: { qc: 'sist', bilder: [
    { fil: '09', alt: 'Två lövsilar i rostfritt nät' },
    { fil: '12', alt: 'Sex lövsilar', crop: [0, 0, 1, 0.7] },
    { fil: '11', alt: 'Lövsilen i stuprörets mynning med löv', crop: [0, 0, 1, 0.62] },
    { fil: '10', alt: 'Vatten rinner genom lövsilen', crop: [0, 0.32, 1, 0.68] },
    { fil: '13', alt: 'Nätet i närbild' },
  ] },
  // Axel 2026-09-24: QC-fotot (stickad olivgrön) var FEL produkt — skörden (svart med orange insida) är rätt. QC tas bort.
  elcykeljacka: { qc: 'bort', omskriven: true, bilder: [   // leverantörens video har engelska textöverlägg i varje sekund — AI-video i stället (ai.mjs)
    { fil: '10', alt: 'Batteriskyddet lindat runt elcykelns rambatteri, orange insida syns i kanten' },
    { fil: '12', alt: 'Batteriskyddet på rambatteriet och det hopvikta skyddet med kardborrebandet' },
    // Axel 2026-09-24: "passar det mitt batteri?" — måttguide ritad med sharp (elcykel-matt.mjs), måtten från leverantörens storleksbild (skörd 09)
    { fil: 'matt', filNo: 'matt-no', alt: 'Storleksguide: 54 × 45,7 cm utfällt, passar ramomkrets 30–40 cm' },
  ] },
  // Axel 2026-09-24 (andra granskningen): QC-högen "ser ut som tagen på ett lager" — AI-hero från QC-fotot först (ai.mjs), QC sist.
  magnetblock: { qc: 'sist', bilder: [
    { fil: '01', alt: 'Bygge med magnetiska byggblock', crop: [0, 0, 1, 0.72] },
    { fil: '02', alt: 'Hus och vattenfall byggt av blocken', crop: [0, 0, 1, 0.72] },
    { fil: '08', alt: 'Borg byggd av blocken', crop: [0, 0, 1, 0.72] },
    { fil: '09', alt: 'Torn och trädgård av blocken', crop: [0, 0, 1, 0.72] },
  ] },
  // Utan skörd men med AI-material (ai.mjs): posten måste finnas, annars hoppar galleri-bygg över produkten.
  // (2026-09-24: driftbilens GIF och bordsfotbollens spelbild + GIF låg färdiga i scratch men laddades aldrig upp.)
  rcoffroad: { qc: 'forst', bilder: [] },
  bordsfotboll: { qc: 'forst', bilder: [] },
  // ── nya (VÄNTA → bygg) ────────────────────────────────────────────────────
  bathuv: { bilder: [
    { fil: '08', alt: 'Båthuven över en båt på trailer vid stranden', crop: [0, 0.12, 1, 0.88] },
    { fil: '06', alt: 'Båthuven på en båt på trailer i snö', crop: [0, 0, 1, 0.78] },
  ] },
  kamadohuv: { bilder: [
    { fil: '04', alt: 'Kamadohuven i snö, regn, sol och blåst' },
    { fil: '06', alt: 'Handtaget på toppen och ventilen', crop: [0.27, 0, 0.46, 0.5] },
    { fil: '07', alt: 'Kamadohuven på grillens ben', crop: [0, 0.15, 0.55, 0.65] },
  ] },
  kajakhuv: { bilder: [
    { fil: '11', alt: 'Kajakhuven över en kajak på bryggan' },
    { fil: '04', alt: 'Kajakhuven på en kajak på bockar på bryggan' },
    { fil: '07', alt: 'Huven dras över kajaken' },
    { fil: '06', alt: 'Kajak med huv på stranden' },
    { fil: '10', alt: 'Kajak med huv på en kärra' },
    { fil: '05', alt: 'Kajak med huv vid ett hus' },
    { fil: '03', alt: 'Huven på kajaken, regnvatten på ytan' },
    { fil: '09', alt: 'Kajak med huv i garaget' },
  ] },
  maskinhylla: { bilder: [
    { fil: '04', alt: 'Maskinhyllan på väggen med fyra maskiner, batterier och lådor' },
    { fil: '06', alt: 'Fyra borrmaskiner hänger i hyllan' },
    { fil: '07', alt: 'Hyllan fullpackad med elverktyg', crop: [0, 0.12, 1, 0.88] },
    { fil: '12', alt: 'Hyllan från sidan med verktyg och krokar' },
    { fil: '13', alt: 'Den tomma hyllan i svart metall' },
  ] },
  fonstertermomatta: { bilder: [
    { fil: '09', alt: 'Termomattan med sugproppar' },
    { fil: '07', alt: 'Mattan ihoprullad med rem vid husvagnsfönstret' },
    { fil: '08', alt: 'Mattan på husvagnens fönster', crop: [0, 0, 1, 0.72] },
    { fil: '05', alt: 'Mattan i en takluckas öppning' },
  ] },
  laktarponcho: { gif: { fil: '10.mp4', alt: 'Ponchon tas på, video' }, bilder: [   // leverantörens video, första 5 s (utan de kinesiska undertexterna)
    { fil: '06', alt: 'Ponchon med dragkedja fram, i snö', crop: [0.12, 0.08, 0.88, 0.92] },
    { fil: '15', alt: 'Ponchon över axlarna', crop: [0.45, 0.2, 0.55, 0.8] },
    { fil: '05', alt: 'Ponchon i soffan', crop: [0, 0.22, 1, 0.5] },
    { fil: '13', alt: 'Ponchon och en tvättmaskin', crop: [0, 0.28, 1, 0.72] },
  ] },
  scooterkapell: { qc: 'sist', bilder: [
    { fil: '02', alt: 'Scooterkapellet dras över scootern' },
    { fil: '05', alt: 'Kapellet med reflexremsor i kvällsljus' },
    { fil: '12', alt: 'Kapellet fästs i nederkant' },
    { fil: '08', alt: 'Reflexremsorna lyser i mörker', crop: [0, 0.15, 1, 0.85] },
    { fil: '09', alt: 'Spännena i nederkant' },
    { fil: '06', alt: 'Reflexremsan i närbild' },
    { fil: '11', alt: 'Väven i närbild' },
  ] },
  krukbarrem: { bilder: [
    { fil: '05', alt: 'Två personer lyfter en stor kruka med bärremmen' },
    { fil: '06', alt: 'Bärremmen runt en kruka, två personer lyfter' },
    { fil: '07', alt: 'Krukan lyfts med remmen' },
    { fil: '04', alt: 'Remmen runt krukan', crop: [0, 0, 0.72, 1] },
    { fil: '03', alt: 'Kroken som håller remmen på plats', crop: [0, 0, 0.62, 1] },
  ] },
  sorkkorgar: { bilder: [
    { fil: '02', alt: 'Sorkkorgarna i rostfritt nät, olika storlekar, och en planterad växt' },
    { fil: '10', alt: 'Växt planterad i en sorkkorg' },
    { fil: '15', alt: 'Sorkkorg i jorden med växt' },
    { fil: '13', alt: 'Rötterna innanför nätet' },
    { fil: '09', alt: 'Fyra steg: korgen i hålet, växten i korgen, jord, klart', crop: [0, 0.12, 1, 0.88] },
  ] },
  slangboxhuv: { bilder: [
    { fil: '02', alt: 'Slangboxhuven över slangboxen på husväggen', crop: [0, 0, 1, 0.58] },
    { fil: '02', ny: '02b', alt: 'Huven och påsen med dragsko', crop: [0, 0.6, 1, 0.4] },
  ] },
  regntunnehuv: { bilder: [
    { fil: '04', alt: 'Tre regntunnor med huv på gräsmattan', crop: [0.02, 0.1, 0.55, 0.8] },
    { fil: '07', alt: 'Regntunnehuvar i trädgården', crop: [0.02, 0.1, 0.96, 0.85] },
  ] },
};
// Blir INTE byggda nu, trots skörd: varmemuff (slut hos CWD, pre-order), snosmaltmatta (spänning
// obekräftad + vattenstämpel på alla bilder), tradansikte (listningen har flera ansikten — vilket är
// offererat?). rcdrift/bordsfotboll: Temu-skörden misslyckades (inloggning), körs om.
