// AI-JOBB per produkt efter Axels granskning 2026-09-24. Körs av ai-kor.mjs.
// ref = alt-textens början på en RIKTIG bild som redan ligger i SE-butiken (referens för KIE).
// bilder[].plats: 'hero' = första bilden i galleriet (Axel bad om det på just dessa), annars efter skördebilderna.
// Alla alt-texter för AI-material slutar med "(AI-illustration)" — beskrivning.mjs skriver då märkningsraden.
// Inga påhittade utfall i prompterna (ingen snö som "smälter", inga grader) — bara produkten i sin miljö.
export const AI = {
  bathuv: {
    video: { ref: 'Båthuven över en båt på trailer vid st', prompt: 'A light autumn rain falls on the covered boat on its trailer; a few leaves drift down past it.' },
    bilder: [
      { namn: 'ai-hero', plats: 'hero', ref: 'Båthuven över en båt på trailer vid st', alt: 'Båthuven på en motorbåt på trailer på en grusuppfart (AI-illustration)', prompt: 'The same black boat cover fitted on a 5-metre motorboat on a trailer, parked on a gravel driveway beside a red wooden Swedish house, overcast autumn day, wet leaves on the ground.' },
      { namn: 'ai-2', ref: 'Båthuven på en båt på trailer i snö', alt: 'Båthuven med snö på, båten i vinterförvaring (AI-illustration)', prompt: 'The same covered boat on its trailer in an outdoor boat storage yard in winter, a thin layer of snow on the cover, other trailered boats blurred in the background.' },
    ] },
  kamadohuv: {
    video: { ref: 'Kamadohuven över en äggformad kamadogrill', prompt: 'Light rain begins to fall on the covered kamado grill on the deck; drops run off the black fabric; the autumn leaves behind it move slightly in the wind.' },
    bilder: [
      { namn: 'ai-hero', plats: 'hero', ref: 'Kamadohuven på grillens ben', alt: 'Kamadohuven över en äggformad kamadogrill på en trädäck-terrass (AI-illustration)', prompt: 'The same black cover placed over a large egg-shaped ceramic kamado grill standing in its metal cart on a wooden deck terrace, autumn garden behind, soft daylight.' },
      { namn: 'ai-2', ref: 'Kamadohuven på grillens ben', alt: 'Kamadogrillen utan huv bredvid en täckt kamado (AI-illustration)', prompt: 'Two egg-shaped ceramic kamado grills side by side on a stone patio: the left one uncovered, dark green glossy ceramic with its dome lid; the right one fitted with the same black cover from the reference so the shape underneath is obvious.' },
    ] },
  maskinhylla: { video: { ref: 'Maskinhyllan på väggen med fyra maskin', prompt: 'Very slow, gentle push-in towards the wall shelf full of tools; a hand lifts one drill off its slot and puts it back.' } },
  fonstertermomatta: { video: { ref: 'Mattan på husvagnens fönster', prompt: 'Morning sunlight slowly brightens on the caravan side; the silver mat in the window reflects it; a very slow gentle push-in.' } },
  laktarponcho: {
    bilder: [ { namn: 'ai-usb', ref: 'Ponchon med dragkedja fram', alt: 'Ponchon på läktaren med USB-kabeln till en powerbank (AI-illustration)', prompt: 'The same beige poncho worn by a person seen from the shoulders down, sitting on a cold stadium bench, a white USB cable running from inside the poncho to a small black power bank held in their gloved hand.' } ] },
  scooterkapell: {
    video: { ref: 'Kapellet med reflexremsor i kvällsljus', prompt: 'Evening; a car\'s headlights sweep past and the reflective strips on the cover flash brightly, then it is calm again.' },
    bilder: [ { namn: 'ai-fore-efter', ref: 'Scooterkapellet dras över scootern', alt: 'Promenadscooter utan kapell bredvid en med kapellet på (AI-illustration)', prompt: 'Two mobility scooters side by side outside a house entrance in light rain: the left one uncovered, a red four-wheel mobility scooter with a wet seat; the right one fitted with the same black cover with reflective strips from the reference.' } ] },
  krukbarrem: { video: { ref: 'Två personer lyfter en stor kruka med', prompt: 'The two people lift the large pot a few centimetres with the strap and carry it slowly to the right.' } },
  sorkkorgar: { video: { ref: 'Sorkkorg i jorden med växt', prompt: 'A hand presses soil around the plant inside the mesh basket in the ground.' } },
  slangboxhuv: {
    video: { ref: 'Slangboxhuven över slangboxen på husvä', prompt: 'Light snow falls on the covered hose box on the brick wall.' },
    bilder: [
      { namn: 'ai-hero', plats: 'hero', ref: 'Slangboxhuven över slangboxen på husvä', alt: 'Slangboxhuven över slangboxen på en tegelvägg en frostig morgon (AI-illustration)', prompt: 'The same black insulated cover over a wall-mounted garden hose box on a red brick house wall, frost on the lawn, low winter morning light, a garden tap beside it.' },
      { namn: 'ai-2', ref: 'Slangboxhuven över slangboxen på husvä', alt: 'Huven träs över slangboxen (AI-illustration)', prompt: 'Two hands pull the same black cover down over a wall-mounted hose reel box on a house wall; the hose box is half visible underneath.' },
    ] },
  regntunnehuv: {
    video: { ref: 'Tre regntunnor med huv', prompt: 'Rain falls on the covered barrels on the lawn; drops run off the black fabric.' },
    bilder: [
      { namn: 'ai-hero', plats: 'hero', ref: 'Tre regntunnor med huv', alt: 'Regntunnehuven på en blå 200-literstunna under stupröret (AI-illustration)', prompt: 'The same black cover fitted on a single blue plastic 200-litre rain barrel standing under a downpipe at the corner of a house, garden and lawn in the background, overcast day.' },
      { namn: 'ai-2', ref: 'Tre regntunnor med huv', alt: 'Dragskon åtdragen runt tunnans kant (AI-illustration)', prompt: 'Close-up of the drawstring at the bottom edge of the same black cover pulled tight around the rim of a blue plastic rain barrel.' },
    ] },
  bikupsjacka: { video: { ref: 'Två bikupor med vinterjackor i snö', prompt: 'Light snow falls slowly on the two covered beehives; nothing else moves.' } },
  krukvaxthuv: { video: { ref: 'Tre krukväxthuvar i beige fiberduk', prompt: 'A light breeze moves the three covered plants very slightly; a few leaves drift past on the ground. No snowflakes, no graphics.' } },   // första försöket lade in en tecknad snöflinga
  ljusslingevindor: {
    video: { ref: 'Ljusslingevinda, tom och med ljussling', prompt: 'Two hands wind a green Christmas light string onto the black winder, turn by turn.' },
    bilder: [ { namn: 'ai-fore-efter', ref: 'Ljusslingevinda, tom och med ljussling', alt: 'Trassliga ljusslingor i en låda bredvid slingor upplindade på vindorna (AI-illustration)', prompt: 'On a wooden table: on the left a cardboard box overflowing with tangled green Christmas light strings; on the right three of the same black winders with light strings neatly wound on them.' } ] },
  makitahallare: {
    video: { ref: 'Skruvdragare hängd i hållaren på vägge', prompt: 'A hand lifts the cordless drill off the teal wall holder and puts it back, clicking it into place.' },
    bilder: [ { namn: 'ai-fore-efter', ref: 'Makita-hållare på väggen med skruvdrag', alt: 'Verktyg i en hög på bänken bredvid samma verktyg upphängda i hållarna (AI-illustration)', prompt: 'Split scene in a garage: on the left a cluttered workbench with cordless tools and batteries lying in a pile; on the right a plywood wall where the same teal holders from the reference hold the tools neatly in a row.' } ] },
  varmesulor: {
    video: { ref: 'Värmesulorna med fjärrkontrollen, prod', prompt: 'A hand slides the same black insole into a brown winter boot; then boots step onto fresh snow.' },
    bilder: [ { namn: 'ai-stovel', ref: 'Värmesulorna med fjärrkontrollen, prod', alt: 'Värmesulan läggs i en vinterkänga, snö utanför dörren (AI-illustration)', prompt: 'A hand slides the same black heated insole into a brown leather winter boot in a doorway, snow-covered ground outside, the small remote lying beside the boot.' } ] },
  rcdrift: {
    video: { ref: 'QC-bild med den grå driftbilen', prompt: 'The same grey RC drift car slides sideways around the orange cones on a smooth floor, wheels spinning; the controller stays in the foreground.' },
    bilder: [ { namn: 'ai-drift', plats: 'hero', ref: 'QC-bild med den grå driftbilen', alt: 'Driftbilen i sladd mellan konerna (AI-illustration)', prompt: 'The same grey 1:24 RC drift car mid-drift on a smooth grey floor between the orange cones from the kit, slight motion blur on the wheels, the pistol-grip controller in the foreground.' } ] },
  rcoffroad: { video: { ref: 'Radiostyrd offroadbil 1:16 med metallk', prompt: 'The same blue RC car drives forward over the gravel, small stones flying, headlights on.' } },
  bordsfotboll: {
    video: { ref: 'Bordsfotbollsplanen med sarg, målbur', prompt: 'Two children\'s hands push the sliders and flick the small ball across the same tabletop football field; the ball rolls into the goal.' },
    bilder: [ { namn: 'ai-spel', ref: 'Bordsfotbollsplanen med sarg, målbur', alt: 'Två barn spelar bordsfotboll vid köksbordet, bara händerna syns (AI-illustration)', prompt: 'The same tabletop football game on a kitchen table, two children\'s hands on the sliders mid-game, warm evening light, no faces.' } ] },
  buskjacka: { video: { ref: 'Buskjackor över buskar i en snöig träd', prompt: 'Snow falls softly on the covered shrubs in the garden.' } },
  magnetblock: {
    video: { ref: 'Bygge med magnetiska byggblock', prompt: 'A child\'s hands snap the same magnetic cubes together, adding a block to the build on a wooden table.' },
    bilder: [ { namn: 'ai-lek', ref: 'Bygge med magnetiska byggblock', alt: 'Barnhänder bygger med magnetblocken på golvet (AI-illustration)', prompt: 'Two children\'s hands building with the same magnetic cubes on a living-room rug, the finished build from the reference in front of them, no faces.' } ] },
  poolpumphuv: { video: { ref: 'Poolvärmepumpens vinterhuv över pumpen', prompt: 'Light rain falls on the covered pool heat pump; drops run off the black cover.' } },
  regnkedja: { video: { ref: 'Regnkedjan hänger från hängrännan vid', prompt: 'Rain falls; water runs from the gutter down the copper rain chain, cup to cup, splashing gently at the bottom.' } },
  rullknivslip: {
    video: { ref: 'Kniven hålls mot vinkelblocket medan r', prompt: 'A hand rolls the same wooden sharpener back and forth along the knife blade resting on the angle block.' },
    bilder: [
      { namn: 'ai-hero', plats: 'hero', ref: 'Rullknivslipen i trä med det magnetisk', alt: 'Rullknivslipen och vinkelblocket på en köksbänk med en kockkniv (AI-illustration)', prompt: 'The same wooden rolling sharpener and the wooden angle block on a light oak kitchen counter next to a chef\'s knife, soft morning light, clean product photo.' },
      { namn: 'ai-2', ref: 'Rullknivslipen i trä med det magnetisk', alt: 'Kniven slipas mot vinkelblocket med rullen (AI-illustration)', prompt: 'A hand rolls the same wooden sharpener along the blade of a chef\'s knife that rests against the wooden angle block on a cutting board.' },
    ] },
  takachuv: { video: { ref: 'Huven över AC:n på husbilstaket i regn', prompt: 'Rain drops fall on the black AC cover on the motorhome roof and run off; the sky is grey.' } },
  vedklyvshuv: { video: { ref: 'Huven på vedklyven under tak i regn', prompt: 'Rain falls beyond the roof edge while the covered log splitter stays dry under the shelter; a few drops drip from the roof.' } },
  adelstenskalender: {
    video: { ref: 'Ädelstenskalendern öppen på bordet med grävblocken', prompt: 'The child\'s hands brush and chip gently at one pastel dig block with the small tool; a little dust falls onto the table; the red box and its printed lid stay exactly as in the image.' },
    bilder: [ { namn: 'ai-hero', plats: 'hero', ref: 'Den röda asken öppen med grävblocken o', alt: 'Ädelstenskalendern öppen på bordet med grävblocken och verktygen, barnhänder gräver (AI-illustration)', prompt: 'The same red advent calendar box, open, on a wooden table in warm Christmas light, the pastel dig blocks and small tools laid out in front, a child\'s hands brushing one block, no faces. The printed lid must stay exactly as in the reference: the gold "Merry Christmas" lettering and the Santa illustration, nothing else written on the box.' } ] },
  husbilskalender: {
    video: { ref: 'Retrobussarna i närbild', prompt: 'The camper van ornaments sway gently on their strings with warm fairy lights twinkling behind them.' },
    bilder: [ { namn: 'ai-hero', plats: 'hero', ref: 'Retrobussarna i närbild', alt: 'Retrobussarna hänger i en julgran med varma ljus (AI-illustration)', prompt: 'The same retro camper van ornaments hanging by thin gold strings from the branches of a Christmas tree with warm fairy lights, soft bokeh, close enough to see the vans clearly.' } ] },
  elcykeljacka: { video: { ref: 'Batteriskyddet lindat runt elcykelns rambatteri', prompt: 'Two hands wrap the same black battery cover around the e-bike frame battery and press the strap closed; the bike stands still in a garage.' } },
  cykelhallarskydd: { video: { ref: 'Cykelhållarskyddet över cyklarna bak p', prompt: 'The motorhome with the covered bikes stands still while light rain falls; a car passes in the blurred background.' } },
  lovsilar: { video: { ref: 'Vatten rinner genom lövsilen', prompt: 'Rainwater pours through the stainless mesh strainer while leaves are held back on top.' } },
};
