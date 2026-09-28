// plan.mjs — regin för fars dag-batchen 2026-09-28 (huvudsessionens beslut).
//
// Axels order 2026-09-28: "en batch på varje produkt som vi skalar just nu och
// som vi faktiskt gör nya annonser för i Notion … fars dag-rea … fars dag den
// åttonde november". Rean = dagens jämförpris (Axels svar samma dag).
//
// Sju produkter, inte elva: products/aktiva-hubbar.json listar elva hubbar,
// men kampanjerna för Biltvättborsten, Fågelmataren, Adventskalendern
// Racingbilar och MC-kapellet stod PAUSED med spend i MagiBorsten vid
// läsningen 2026-09-28 — leveransrundan laddar aldrig upp dit, så en fars
// dag-annons där hade aldrig gått live.
//
// Per produkt tre annonser: FD_1_H1 + FD_1_H2 (omklipp av produktens bästa
// video: ny svensk VO och nya textrader, hooken är enda skillnaden) och
// FD_2_1 (bild, görs av /bildannonser 20:00 ur produktfotot).
//
// Varje OUR AD-tid är avläst ur föräldervideon 2026-09-28: hämtad ur Meta via
// sidans token, en frame per sekund (imageio-ffmpeg), tittad frame för frame.
// Siffrorna (spend, köp, ROAS, AOV) är MagiBorsten last_30d läst samma dag;
// break-even-ROAS ur kampanjnamnet, break-even-CPA = kampanjens AOV ÷ BE-ROAS.
// Copyn (svenska rader) skrivs av sonnet-subagenter (CLAUDE.md regel 6) och
// ligger i copy/<nyckel>.json; bygg.mjs slår ihop plan + copy till briefer.

export const DATUM = '2026-09-28';
export const FARS_DAG = '2026-11-08';
export const SISTA_BESTALLNING = '2026-10-19';   // klaviyo/brands/baverbutiken.json → kalender (p90 20 dygn)

export const PRODUKTER = [
  {
    nyckel: 'takoverdrag', prefix: 'Takoverdrag', produkt: 'the caravan roof cover',
    hub: '7ec270ab-908c-82f6-a2a8-0153159b20fa', hubnamn: 'BÄVER For CARL Taköverdraget för Husvagn',
    landning: 'https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan',
    pris: 1129, jamfor: 1469, prisText: 'Från 1 129 kr, ord. 1 469 kr', prisNot: 'from price — the two smallest sizes, 3 × 5.5 and 3 × 6.5 m; the larger sizes cost more and the landing page shows each',
    siffror: ['1 129', '1 469', '210', '30', '40', '4', '9', '3', '8', '19'],
    be: { roas: 1.63, aov: 1238, cpa: 760 },
    forälder: { namn: 'Takoverdrag_GT_2_H1', ad: '120250147364200291', video: '2303666127122941', langd: 27.7, spend: 8182, kop: 30, roas: 4.24, cpa: 273, vb: 13124,
      beskrivning: 'the gift ad told by a woman about her husband ("Han pratar om husvagnen som om den vore ett husdjur … gav jag något han faktiskt använder. Varje vinter.")' },
    benchmark: 'Takoverdrag_SP_4_H1 (50 209 kr, 102 purchases, ROAS 2.61) is the product\'s top spender and the benchmark, not the parent',
    avatar: 'den-som-letar-present-till-en-pappa-med-husvagn', begar: 'skydda-det-jag-ager', mekanism: 'remmar-pa-alla-fyra-sidor-kanten-30-40-cm-ner', tro: 'att-en-present-till-honom-hamnar-i-en-lada',
    hook: {
      H1: { bild: 'Selfie, handheld: a woman in sunglasses and a pink T-shirt holds the packed black cover up beside her face in front of a white caravan (SWIFT lettering visible). First frame: her face and the packed cover.', effekt: 'cut-in', mekanik: 'cut-in', kalla: 'OUR AD Takoverdrag_GT_2_H1 0:03–0:06', ref: 'parent 0:03–0:06, same take' },
      H2: { bild: 'Medium: a woman in a denim jacket stands beside the caravan with the black roof cover on and gestures up at it; the cover\'s edge hangs down over the side wall. First frame: the covered roof edge and her raised hand.', effekt: 'zoom-in 1 s', mekanik: 'zoom-in', kalla: 'OUR AD Takoverdrag_GT_2_H1 0:09–0:12', ref: 'parent 0:09–0:12, same take' },
    },
    rader: [
      { bild: 'Close-up: water beads on the black cover\'s corner and runs off the edge; a dry pine needle lies on the fabric.', effekt: 'none', kalla: 'OUR AD Takoverdrag_GT_2_H1 0:20–0:23', ref: 'parent "Varje vinter" beat', frihet: 'crop free, the running water must stay in frame' },
      { bild: 'Close-up at the caravan\'s side: a hand pulls the side strap tight in its buckle, then the zip pocket on the cover\'s side.', effekt: 'none', kalla: 'OUR AD Takoverdrag_GT_2_H1 0:12–0:15', ref: 'parent strap beat', frihet: 'none' },
      { bild: 'Close-up: a hand smooths over the black woven fabric on the roof; the fabric label is in frame.', effekt: 'slow-mo 0.67× 3 s', kalla: 'OUR AD Takoverdrag_GT_2_H1 0:07–0:09', ref: 'parent fabric beat', frihet: 'crop free' },
    ],
    slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/takoverdrag-husvagn-grusplan.png?v=1790495818',
    bild: { foto: 'The product page hero photo: a white caravan on a gravel yard with the black roof cover on, the edge hanging down over the side walls, no people.', ref: 'Takoverdrag_CS_2_1 (Meta ad 120250147356750291: 19 711 kr, 76 purchases, ROAS 4.88, CPA 259 kr against break-even CPA 760 kr — the product\'s best static) for the price band', parentBild: 'Takoverdrag_CS_2_1' },
    extraRegler: [
      'The cover covers the roof only and its edge hangs 30–40 cm down over the sides — never "stannar vid takkanten", never a full cover in the picture (the parent\'s 0:00–0:02 shot shows a grey full-length cover: never use it).',
      'The parent\'s end (0:26–0:28, a van with an open rear) is not a caravan — never use it.',
    ],
  },
  {
    nyckel: 'termoskydd', prefix: 'Termoskydd', produkt: 'the motorhome thermal screen',
    hub: 'c5a270ab-908c-83e3-b721-81fde8643080', hubnamn: 'BÄVER Termoskyddet för Husbil',
    landning: 'https://baverbutiken.se/products/termoskydd-husbil-211-171-cm-utvandigt-och-morklaggande',
    pris: 559, jamfor: 932, prisText: '559 kr, ord. 932 kr', prisNot: 'one variant',
    siffror: ['559', '932', '211', '171', '90', '2', '8', '19'],
    be: { roas: 1.61, aov: 595, cpa: 370 },
    forälder: { namn: 'Termoskydd_CS_3', ad: '120250175770080291', video: '1819607612715450', langd: 15.6, spend: 5934, kop: 32, roas: 3.44, cpa: 185, vb: 6751,
      beskrivning: 'the price ad (BREAKTHROUGH 2026-09-21) with a man smoothing the cover onto the windscreen and the motorhome in snow at dusk' },
    benchmark: 'Termoskydd_CS_2 (13 160 kr, 53 purchases, ROAS 2.33) is the top spender and the benchmark',
    avatar: 'den-som-letar-present-till-en-pappa-med-husbil', begar: 'slippa-krangel', mekanism: 'skyddet-utanpa-glaset-i-dorrkarmen', tro: 'att-en-gardin-innanfor-racker',
    hook: {
      H1: { bild: 'Wide: the white motorhome parked in a snowy pine forest at dusk, the silver cover on the windscreen and both side windows, warm light inside. First frame: this shot.', effekt: 'slow-mo 0.5× 3 s', mekanik: 'slow-mo', kalla: 'OUR AD Termoskydd_CS_3 0:14–0:15', ref: 'parent end shot — WITHOUT its caption (the parent\'s caption there names the store)' },
      H2: { bild: 'Medium: a man in a grey T-shirt steps back from the covered windscreen and looks at it; the motorhome front fills the right half. First frame: the man and the covered windscreen.', effekt: 'zoom-in 1 s', mekanik: 'zoom-in', kalla: 'OUR AD Termoskydd_CS_3 0:08–0:10', ref: 'parent 0:08–0:10, same take' },
    },
    rader: [
      { bild: 'Close-up from the front: the man smooths the silver quilted cover onto the windscreen from the outside, the wiper under his hand.', effekt: 'none', kalla: 'OUR AD Termoskydd_CS_3 0:00–0:02', ref: 'parent opening', frihet: 'hold the last frame to fill 3 s' },
      { bild: 'Close-up: hands press the cover flat at the side, then a woman lays the flap over the side window.', effekt: 'none', kalla: 'OUR AD Termoskydd_CS_3 0:03–0:05', ref: 'parent fitting beat', frihet: 'none' },
      { bild: 'Macro: the quilted silver fabric, diamond stitching, light sliding across it.', effekt: 'none', kalla: 'OUR AD Termoskydd_CS_3 0:10–0:13', ref: 'parent fabric close-up — WITHOUT its captions (they carry invented urgency)', frihet: 'crop free' },
    ],
    slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/b6-termoskydd-se.jpg?v=1788958810',
    bild: { foto: 'The product photo: a white motorhome front straight on with the quilted silver cover on the windscreen and both side windows, no people.', ref: 'Termoskydd_BOF_7_1 (Meta ad 120250289497670291: 910 kr, 7 purchases, ROAS 4.93, CPA 130 kr against break-even CPA 370 kr) for the composition', parentBild: 'Termoskydd_BOF_7_1' },
    extraRegler: [
      'It is autumn: never "sommar", "trettio grader" or "morgonsolen" as a heat argument — the season is condensation, darkness and cold.',
      'Every parent clip carries burned captions ("Lagret minskar", "Beställ nu innan det är slut", a store name at 0:14–0:15): none of them may be visible.',
    ],
  },
  {
    nyckel: 'ibc', prefix: 'IBC', produkt: 'the IBC tank cover',
    hub: '76b270ab-908c-8393-8a47-01f6ae366d42', hubnamn: 'BÄVER IBC-Tanköverdraget',
    landning: 'https://baverbutiken.se/products/ibc-tankoverdrag-1000-l-stoppar-alger-uv',
    pris: 489, jamfor: 636, prisText: '489 kr, ord. 636 kr', prisNot: 'one variant',
    siffror: ['489', '636', '210', '1000', '120', '100', '116', '8', '19'],
    be: { roas: 1.51, aov: 667, cpa: 442 },
    forälder: { namn: 'IBC_PD_1_H1', ad: '120250005818370291', video: '826839650518396', langd: 44.6, spend: 33804, kop: 132, roas: 2.61, cpa: 256, vb: 24584,
      beskrivning: 'the product demo (green algae water in a jar next to clear water, the cover, the zip, the lid opening) — the product\'s top spender' },
    benchmark: 'IBC_PD_1_H1 is itself the top spender',
    avatar: 'den-som-letar-present-till-en-pappa-med-regnvattentank', begar: 'skydda-det-jag-ager', mekanism: 'tyget-stanger-ute-ljuset-sa-alger-inte-vaxer', tro: 'att-en-presenning-racker',
    hook: {
      H1: { bild: 'Medium: an older grey-haired man smiles and leans over the covered green tank in the garden, white hydrangeas behind him. First frame: his face and the cover.', effekt: 'slow-mo 0.5× 2 s, then freeze 1 s', mekanik: 'slow-mo', kalla: 'OUR AD IBC_PD_1_H1 0:33–0:34', ref: 'parent 0:33, the only shot with him — WITHOUT its caption' },
      H2: { bild: 'Wide: the covered green tank on its pallet in the garden in front of white hydrangeas, the valve flap at the bottom. First frame: the whole covered tank.', effekt: 'zoom-in 1 s', mekanik: 'zoom-in', kalla: 'OUR AD IBC_PD_1_H1 0:43–0:45', ref: 'parent end shot — WITHOUT its caption' },
    },
    rader: [
      { bild: 'Two glass jars side by side on a garden table: the left one green with algae, the right one clear.', effekt: 'none', kalla: 'OUR AD IBC_PD_1_H1 0:10–0:13', ref: 'parent jar beat', frihet: 'none — both jars in frame' },
      { bild: 'Close-up: a hand pulls the zip down the side of the green cover.', effekt: 'none', kalla: 'OUR AD IBC_PD_1_H1 0:23–0:26', ref: 'parent zip beat', frihet: 'none' },
      { bild: 'Close-up from above: a hand lifts the flap on top of the cover and the tank\'s red lid appears.', effekt: 'none', kalla: 'OUR AD IBC_PD_1_H1 0:30–0:33', ref: 'parent lid beat', frihet: 'none' },
    ],
    slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/tankoverdrag-tankoverdrag-01.jpg?v=1787626428',
    bild: { foto: 'The product photo: the green cover on a 1000-litre IBC tank, zip on the side, no people.', ref: 'IBC_PD_9_1 (Meta ad 120250231777490291: 244 kr, 3 purchases, ROAS 17.71, CPA 81 kr against break-even CPA 442 kr) for the composition', parentBild: 'IBC_PD_9_1' },
    extraRegler: [
      'The line and the picture say the same thing: no colour word the picture does not show (hub rule 2026-09-28).',
      'The parent\'s caption at 0:41 names the store — never use 0:39–0:42.',
    ],
  },
  {
    nyckel: 'batmotor', prefix: 'Batmotor', produkt: 'the outboard motor cover',
    hub: '3cf270ab-908c-8113-a35c-f9c1cd61d727', hubnamn: 'Boat motor cover creative hub',
    landning: 'https://baverbutiken.se/products/batmotorskydd-420d-heltackande-for-utombordare',
    pris: 579, jamfor: 965, prisText: '579 kr, ord. 965 kr', prisNot: 'same price for all nine sizes',
    siffror: ['579', '965', '420', '9', '8', '19'],
    be: { roas: 1.62, aov: 622, cpa: 384 },
    forälder: { namn: 'Batmotor_SP_1_H5', ad: '120250125804850291', video: '1061714239980711', langd: 27.6, spend: 27509, kop: 125, roas: 2.70, cpa: 220, vb: 18394,
      beskrivning: 'the social-proof demo that opens on a grey-haired man pulling the cover on at the trailer ("Dra över. Spänn remmen. Klart.") — the product\'s top spender' },
    benchmark: 'Batmotor_SP_1_H5 is itself the top spender',
    avatar: 'den-som-letar-present-till-en-pappa-med-bat', begar: 'skydda-det-jag-ager', mekanism: 'dras-over-hela-motorn-och-spanns-med-rem', tro: 'att-motorn-klarar-vintern-oskyddad',
    hook: {
      H1: { bild: 'Medium: a grey-haired man in a navy jacket pulls the black cover down over the outboard on a boat on its trailer and tightens the strap. First frame: the man and the half-covered motor.', effekt: 'cut-in', mekanik: 'cut-in', kalla: 'OUR AD Batmotor_SP_1_H5 0:00–0:03', ref: 'parent opening, same take — WITHOUT its caption' },
      H2: { bild: 'Close-up: gloved hands snap the buckle on the cover shut while snow falls. First frame: the open buckle between the gloves.', effekt: 'freeze 0.5 s', mekanik: 'freeze', kalla: 'OUR AD Batmotor_SP_1_H5 0:15–0:17', ref: 'parent snow beat — WITHOUT the checklist overlay' },
    },
    rader: [
      { bild: 'Macro: water beads on the black fabric and roll off.', effekt: 'slow-mo 0.67× 3 s', kalla: 'OUR AD Batmotor_SP_1_H5 0:08–0:10', ref: 'parent 420D beat — WITHOUT its caption', frihet: 'crop free' },
      { bild: 'Medium: a man in a winter jacket stands in the snow beside the covered motor on the boat.', effekt: 'none', kalla: 'OUR AD Batmotor_SP_1_H5 0:17–0:19', ref: 'parent snow beat — WITHOUT the checklist overlay', frihet: 'hold the last frame to fill 3 s' },
      { bild: 'Medium: a man by a garage points at the covered motor on the boat on its trailer.', effekt: 'none', kalla: 'OUR AD Batmotor_SP_1_H5 0:10–0:12', ref: 'parent garage beat — WITHOUT its caption', frihet: 'hold the last frame to fill 3 s' },
    ],
    slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/batmotorskydd-svart.jpg?v=1787313816',
    bild: { foto: 'The product photo: the black cover on an outboard motor, strap around the middle, no people.', ref: 'Batmotor_CS_2_1 (Meta ad 120250017784490291: 2 945 kr, 17 purchases, ROAS 3.68, CPA 173 kr against break-even CPA 384 kr) for the price band', parentBild: 'Batmotor_CS_2_1' },
    extraRegler: [
      'Never "saltvatten" (the page does not use it).',
      'The parent\'s end (0:23–0:27) is a phone mock-up with the store logo and "30 DAGARS ÖPPET KÖP" — never use it; the checklist overlays at 0:12–0:18 are burned in — cut from the clean clips.',
    ],
  },
  {
    nyckel: 'sotarset', prefix: 'Sotarset', produkt: 'the chimney sweep set',
    hub: '3e2270ab-908c-8171-bbae-fff6adedbe5a', hubnamn: 'Chimney sweep set creative hub',
    landning: 'https://baverbutiken.se/products/sotarset-med-bojliga-stanger-rensar-rokkanal-och-kaminror',
    pris: 459, jamfor: 599, prisText: '459 kr, ord. 599 kr', prisNot: 'one variant',
    siffror: ['459', '599', '9', '41', '3,69', '100', '8', '19'],
    be: { roas: 1.61, aov: 524, cpa: 325 },
    forälder: { namn: 'Sotarset_PD_1_H2', ad: '120250284711040291', video: '1078908058264404', langd: 20.5, spend: 10818, kop: 59, roas: 2.97, cpa: 183, vb: 9143,
      beskrivning: 'the product demo ("Du behöver inte krypa bakom kaminen för att rensa röret", soot bursting out of the pipe, the rods bending) — the product\'s top spender' },
    benchmark: 'Sotarset_PD_1_H2 is itself the top spender',
    avatar: 'den-som-letar-present-till-en-pappa-som-eldar-i-kaminen', begar: 'trygghet', mekanism: 'nio-bojliga-stanger-foljer-krokarna', tro: 'att-bara-sotaren-kan-rensa-roret',
    hook: {
      H1: { bild: 'Medium: a man in a black T-shirt crouches in a garage and screws the rods together into one long rod, the drill beside him. First frame: his hands on the rod joint.', effekt: 'cut-in', mekanik: 'cut-in', kalla: 'OUR AD Sotarset_PD_1_H2 0:09–0:12', ref: 'parent assembly beat — WITHOUT its caption' },
      H2: { bild: 'Close-up: the brush comes out of the stove pipe and a cloud of soot bursts out. First frame: the brush in the pipe opening.', effekt: 'slow-mo 0.5× 3 s', mekanik: 'slow-mo', kalla: 'OUR AD Sotarset_PD_1_H2 0:04–0:06', ref: 'parent soot beat — WITHOUT its caption' },
    },
    rader: [
      { bild: 'The brick chimney top against the trees, then the rods and the brush laid out on a wooden floor.', effekt: 'none', kalla: 'OUR AD Sotarset_PD_1_H2 0:00–0:03', ref: 'parent opening', frihet: 'none' },
      { bild: 'Medium: a woman in a grey fleece bends one of the white rods into an arc with her hand.', effekt: 'none', kalla: 'OUR AD Sotarset_PD_1_H2 0:13–0:16', ref: 'parent bending beat', frihet: 'none' },
      { bild: 'Looking straight up the flue from inside, towards the light.', effekt: 'slow-mo 0.67× 3 s', kalla: 'OUR AD Sotarset_PD_1_H2 0:16–0:18', ref: 'parent flue beat — WITHOUT the "24"/"PURE" stickers and caption', frihet: 'none' },
    ],
    slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/b8-sotarset-hero-se.jpg?v=1789119686',
    bild: { foto: 'The product hero photo: the chimney sweep set with the rods and the 100 mm nylon brush, no people.', ref: 'Sotarset_PD_6_1 (Meta ad 120250342271020291: 928 kr, 5 purchases, ROAS 3.17, CPA 186 kr against break-even CPA 325 kr) for the composition', parentBild: 'Sotarset_PD_6_1' },
    extraRegler: [
      'Spell it "sotarset" — the parent\'s captions say "sotarsätt" (typo); none of the parent\'s captions may be visible.',
      'No time claim ("på minuter", seconds) — nothing is measured.',
    ],
  },
  {
    nyckel: 'tofflor', prefix: 'Inomhustofflor', produkt: 'the lined camouflage slippers',
    hub: '3e1270ab-908c-8131-a121-fe435a4e22aa', hubnamn: 'Indoor slippers creative hub',
    landning: 'https://baverbutiken.se/products/fodrade-inomhustofflor-kamouflage-herr-40-47',
    pris: 489, jamfor: 978, prisText: '489 kr, ord. 978 kr', prisNot: 'same price for all 16 variants (khaki or black, 40–47)',
    siffror: ['489', '978', '40', '47', '8', '19'],
    be: { roas: 1.61, aov: 563, cpa: 350 },
    forälder: { namn: 'Inomhustofflor_SP_1_H2', ad: '120250268524830291', video: '1108339705052897', langd: 34.9, spend: 2137, kop: 11, roas: 3.00, cpa: 194, vb: 1842,
      beskrivning: 'the skeptic-to-convinced social-proof video with the slippers by the fireplace and the firewood stack' },
    benchmark: 'Inomhustofflor_SP_1_H1 (3 216 kr, 10 purchases, ROAS 1.73) is the top spender and the benchmark',
    avatar: 'den-som-letar-present-till-en-pappa-som-gar-efter-ved', begar: 'njutning', mekanism: 'plysch-fran-hal-till-ta-och-halrem', tro: 'att-tofflor-ar-en-trakig-present',
    hook: {
      H1: { bild: 'Close-up: two khaki camouflage slippers with white plush lining lie on a white box, like an opened gift. First frame: both slippers on the box.', effekt: 'zoom-in 1 s, hold to 3 s', mekanik: 'zoom-in', kalla: 'OUR AD Inomhustofflor_SP_1_H2 0:00–0:02', ref: 'parent opening — WITHOUT its caption' },
      H2: { bild: 'Low close-up: a bare foot slides into a black camouflage slipper on a wooden floor in front of a fire. First frame: the empty slipper in front of the flames.', effekt: 'slow-mo 0.5× 3 s', mekanik: 'slow-mo', kalla: 'OUR AD Inomhustofflor_SP_1_H2 0:07–0:09', ref: 'parent fireplace beat — WITHOUT its caption' },
    },
    rader: [
      { bild: 'Low shot: a man\'s feet in the khaki slippers on a wooden floor beside a stacked pile of firewood.', effekt: 'none', kalla: 'OUR AD Inomhustofflor_SP_1_H2 0:02–0:05', ref: 'parent firewood beat', frihet: 'none' },
      { bild: 'Close-up: a hand holds the khaki slipper open, the white plush lining fills the frame.', effekt: 'slow-mo 0.67× 3 s', kalla: 'OUR AD Inomhustofflor_SP_1_H2 0:26–0:28', ref: 'parent lining beat — WITHOUT its caption', frihet: 'crop free' },
      { bild: 'Close-up: a hand holds the black slipper against a white wall so the heel strap is in frame.', effekt: 'none', kalla: 'OUR AD Inomhustofflor_SP_1_H2 0:20–0:22', ref: 'parent strap beat — WITHOUT its caption', frihet: 'hold the last frame to fill 3 s' },
    ],
    slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/b8-tofflor-hero-se.jpg?v=1789119715',
    bild: { foto: 'The product hero photo: the camouflage slippers in khaki and black with the plush lining visible, no people.', ref: 'none — the product has no static with 3 purchases; composition as the other FD_2_1 statics', parentBild: null },
    extraRegler: [
      'Indoor slipper only: never waterproof, snow, non-slip or outdoor use — at most "en snabb sväng ut på altanen efter veden" (the page\'s own line).',
      'No "bästa tofflorna", no "många köper ett par till", no "alla pratar om" — the parent\'s captions carry them; none may be visible.',
    ],
  },
  {
    nyckel: 'beltgrinder', prefix: 'Beltgrinder', produkt: 'the mini belt grinder',
    hub: '3cc270ab-908c-813c-94fa-d90daa9bf776', hubnamn: 'Belt grinder creative hub',
    landning: 'https://baverbutiken.se/products/balteslipmaskin-mini-3-i-1-knivslip-polerare',
    pris: 909, jamfor: 1182, prisText: '909 kr, ord. 1 182 kr', prisNot: 'one variant',
    siffror: ['909', '1 182', '3', '7', '15', '8', '19'],
    be: { roas: 1.73, aov: 983, cpa: 568 },
    forälder: { namn: 'Beltgrinder_PD_4_H1', ad: '120250104966480291', video: '3020999078243756', langd: 10.6, spend: 3785, kop: 12, roas: 3.04, cpa: 315, vb: 2867,
      beskrivning: 'the demo with a kitchen knife against the belt, sparks, seen from above' },
    benchmark: 'Beltgrinder_PD_19_1 (static, 10 897 kr, 30 purchases, ROAS 2.75) is the top spender and the benchmark; PD_4_H1 is the best video',
    avatar: 'den-som-letar-present-till-en-pappa-med-hobbybank', begar: 'kontroll', mekanism: 'slipbandet-gor-jobbet-15-graders-vinkel', tro: 'att-slipa-kniv-kraver-teknik',
    langd: 12,
    hook: {
      H1: { bild: 'Close-up: a kitchen knife against the running belt, sparks fly off the edge. First frame: the blade on the belt.', effekt: 'cut-in', mekanik: 'cut-in', kalla: 'OUR AD Beltgrinder_PD_4_H1 0:01–0:04', ref: 'parent spark beat — WITHOUT its captions' },
      H2: { bild: 'Close-up: two hands hold the grinder up to the camera, the belt and the polishing wheel in frame. First frame: the machine between the hands.', effekt: 'freeze 0.5 s', mekanik: 'freeze', kalla: 'OUR AD Beltgrinder_PD_4_H1 0:00–0:01', ref: 'parent opening — WITHOUT its captions; hold and push in to fill 3 s' },
    },
    rader: [
      { bild: 'From above: a hand draws the knife along the belt at an angle, the other hand on the machine.', effekt: 'none', kalla: 'OUR AD Beltgrinder_PD_4_H1 0:04–0:07', ref: 'parent top view', frihet: 'none' },
      { bild: 'Same top view: the knife continues along the belt; the machine\'s belt, wheel and base are in frame.', effekt: 'slow-mo 0.67× 3 s', kalla: 'OUR AD Beltgrinder_PD_4_H1 0:07–0:09', ref: 'parent top view', frihet: 'none' },
    ],
    slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/temu2-balteslip.webp?v=1786982539',
    bild: { foto: 'The product photo: the mini belt grinder with its belt and polishing wheel, no people.', ref: 'Beltgrinder_PD_19_1 (Meta ad 120250148322650291: 10 897 kr, 30 purchases, ROAS 2.75, CPA 363 kr against break-even CPA 568 kr — the product\'s top spender) for the price band', parentBild: 'Beltgrinder_PD_19_1' },
    extraRegler: [
      'No time claim: never "10 sekunder" or any other seconds (hub rule 2026-09-28 — not measured). The parent\'s captions carry it; none may be visible.',
      'Never use the parent\'s 0:09–0:10 (a different machine on a green cutting mat).',
    ],
  },
];

// ---------------------------------------------------------------------------
// Omgång 2 samma dag: fyra hubbar som saknades (Axels skärmbild av Notion
// 2026-09-28: "Ligger det en i alla dessa?"). De stod inte i
// products/aktiva-hubbar.json (ändrad senast 2026-09-23), men alla fyra
// kampanjerna var ACTIVE i MagiBorsten vid läsningen.
PRODUKTER.push(
  {
    nyckel: 'solcellslampa', prefix: 'Solcellslampa', produkt: 'the solar motion sensor light',
    hub: '3e5270ab-908c-81ed-8316-f0f4327d75db', hubnamn: 'Solar motion sensor light creative hub',
    landning: 'https://baverbutiken.se/products/solcellslampa-med-rorelsesensor-tre-huvuden-210-led',
    pris: 589, jamfor: 775, prisText: '589 kr, ord. 775 kr', prisNot: 'one variant',
    siffror: ['589', '775', '210', '3', '1200', '8', '19'],
    be: { roas: 1.62, aov: 839, cpa: 518 },
    forälder: { namn: 'Solcellslampa_PD_3', ad: '120250253967570291', video: '1395372216133673', langd: 30.3, spend: 9887, kop: 25, roas: 2.13, cpa: 395, vb: 3114,
      beskrivning: 'the product demo that opens on an older man with the remote beside the lamp on a pole ("210 lampor, tre huvuden") — the product\'s top spender' },
    benchmark: 'Solcellslampa_PD_3 is itself the top spender',
    avatar: 'den-som-letar-present-till-en-pappa-med-mork-uppfart', begar: 'trygghet', mekanism: 'rorelsesensor-tander-tre-huvuden-utan-kabel', tro: 'att-en-utelampa-kraver-elektriker',
    hook: {
      H1: { bild: 'Medium, daylight: an older man in a navy T-shirt and a cap holds the remote and talks beside the lamp mounted on a wooden pole. First frame: the man, the remote and the lamp.', effekt: 'cut-in', mekanik: 'cut-in', kalla: 'OUR AD Solcellslampa_PD_3 0:00–0:03', ref: 'parent opening — WITHOUT its caption' },
      H2: { bild: 'Wide, evening: the lamp above a garage door switches on and lights the drive as a man arrives with his bicycle. First frame: the lit lamp over the garage door.', effekt: 'zoom-in 1 s', mekanik: 'zoom-in', kalla: 'OUR AD Solcellslampa_PD_3 0:04–0:06', ref: 'parent evening beat — WITHOUT its caption' },
    },
    rader: [
      { bild: 'Close-up: the LED panels of the three heads, a hand with a ring holds the remote in front of them.', effekt: 'slow-mo 0.67× 3 s', kalla: 'OUR AD Solcellslampa_PD_3 0:07–0:09', ref: 'parent LED close-up — WITHOUT its caption', frihet: 'crop free' },
      { bild: 'Medium: a woman in a denim shirt points up at the lamp\'s adjustable heads under a porch roof.', effekt: 'none', kalla: 'OUR AD Solcellslampa_PD_3 0:09–0:12', ref: 'parent heads beat — WITHOUT its caption', frihet: 'none' },
      { bild: 'Close-up on a kitchen counter: hands lift the lamp out of its box, the solar panel on top.', effekt: 'none', kalla: 'OUR AD Solcellslampa_PD_3 0:23–0:26', ref: 'parent unboxing — WITHOUT its caption', frihet: 'none' },
    ],
    slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/b8-solcellslampa-hero-se.jpg?v=1789119730',
    bild: { foto: 'The product hero photo: the solar light with its three heads and the solar panel, no people.', ref: 'none — the product has no static with 3 purchases; composition as the other FD_2_1 statics', parentBild: null },
    extraRegler: [
      'Never use the parent\'s 0:17–0:22: another creator\'s TikTok watermark is burned into those frames.',
      'No brightness or angle claims beyond the page (210 lysdioder, tre huvuden, 1200 mAh): never "2500 lumen", never "270 grader", never "vattentät" — the parent\'s captions carry them, the page does not.',
    ],
  },
  {
    nyckel: 'golfkalender', prefix: 'Golfkalender', produkt: 'the golf advent calendar',
    hub: '3e8270ab-908c-817b-9e74-efe7a636609e', hubnamn: 'Golf advent calendar creative hub',
    landning: 'https://baverbutiken.se/products/golf-adventskalender-24-golftillbehor',
    pris: 549, jamfor: 719, prisText: '549 kr, ord. 719 kr', prisNot: 'one variant',
    siffror: ['549', '719', '24', '8', '19'],
    be: { roas: 1.70, aov: 695, cpa: 409 },
    forälder: { namn: 'Golfkalender_PD_1', ad: '120250349281960291', video: '3628961317255943', langd: 22.3, spend: 4181, kop: 20, roas: 3.27, cpa: 209, vb: 3860,
      beskrivning: 'the unboxing demo ("Glöm chokladkalendern. Det här är för golfare.") — a hand opens the doors and shows the golf accessories; the product\'s top spender' },
    benchmark: 'Golfkalender_PD_1 is itself the top spender',
    avatar: 'den-som-letar-present-till-en-pappa-som-spelar-golf', begar: 'njutning', mekanism: 'golftillbehor-bakom-24-luckor', tro: 'att-en-present-till-golfaren-maste-vara-en-klubba',
    hook: {
      H1: { bild: 'Top-down: the closed calendar box ("GOLF ADVENT CALENDAR") on a lap, Christmas lights and a lamp behind it. First frame: the whole box.', effekt: 'cut-in', mekanik: 'cut-in', kalla: 'OUR AD Golfkalender_PD_1 0:00–0:03', ref: 'parent opening — WITHOUT its caption' },
      H2: { bild: 'Top-down: the calendar on the lap with most doors already opened. First frame: the opened doors.', effekt: 'zoom-in 1 s', mekanik: 'zoom-in', kalla: 'OUR AD Golfkalender_PD_1 0:18–0:20', ref: 'parent 0:18 — WITHOUT its caption' },
    },
    rader: [
      { bild: 'Close-up: a hand opens one door and lifts the cardboard insert out.', effekt: 'none', kalla: 'OUR AD Golfkalender_PD_1 0:03–0:06', ref: 'parent door beat — WITHOUT its caption', frihet: 'none' },
      { bild: 'Close-up: a hand holds a small golf tool from the door up in front of the calendar.', effekt: 'slow-mo 0.67× 3 s', kalla: 'OUR AD Golfkalender_PD_1 0:06–0:08', ref: 'parent tool beat — WITHOUT its caption', frihet: 'crop free' },
      { bild: 'Close-up: a finger opens door 08 and a golf ball sits inside, then the hand lifts the ball out.', effekt: 'none', kalla: 'OUR AD Golfkalender_PD_1 0:10–0:13', ref: 'parent ball beat — WITHOUT its caption', frihet: 'none' },
    ],
    slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/kalender-golf-1.png?v=1789563918',
    bild: { foto: 'The product photo: the golf advent calendar box, no people.', ref: 'none — the product has no static with 3 purchases; composition as the other FD_2_1 statics', parentBild: null },
    extraRegler: [
      'Never use the parent\'s flat lay at 0:14–0:17: it shows golf socks, which the page does not list.',
      'Only the page\'s contents may be named: golfbollar, peggar, bollmarkeringar, greenlagare med spegel, klubbrengöringsborste, golfhandduk. Never "barnsäker", never an age.',
    ],
  },
  {
    nyckel: 'taljset', prefix: 'Taljset', produkt: 'the 30-piece whittling set',
    hub: '3e8270ab-908c-8156-bd42-e5fcbe833705', hubnamn: 'Whittling set creative hub',
    landning: 'https://baverbutiken.se/products/taljset-30-delar-6-knivar-och-6-jarn',
    pris: 869, jamfor: 1139, prisText: '869 kr, ord. 1 139 kr', prisNot: 'one variant',
    siffror: ['869', '1 139', '30', '6', '8', '19'],
    be: { roas: 1.63, aov: 906, cpa: 556 },
    forälder: { namn: 'Taljset_PD_3', ad: '120250349207730291', video: '1584038393213339', langd: 24.5, spend: 2585, kop: 14, roas: 4.71, cpa: 185, vb: 4879,
      beskrivning: 'the demo ("Sluta köpa täljverktyg") with hands carving, the knives in the roll and a bearded man holding up the full set in its case' },
    benchmark: 'Taljset_PD_1 (3 067 kr, 13 purchases, ROAS 4.04) is the top spender and the benchmark; PD_3 carries more profit contribution',
    avatar: 'den-som-letar-present-till-en-pappa-som-vill-borja-talja', begar: 'njutning', mekanism: '30-delar-i-en-vaska-med-skarskyddade-handskar', tro: 'att-talja-kraver-att-man-letar-ihop-verktyg',
    hook: {
      H1: { bild: 'Medium: a bearded man in a dark sweater holds the open orange case up to the camera, knives, gouges and the strop in their slots. First frame: the man and the open case.', effekt: 'cut-in', mekanik: 'cut-in', kalla: 'OUR AD Taljset_PD_3 0:22–0:24', ref: 'parent end shot — WITHOUT its captions (they name the store)' },
      H2: { bild: 'Medium: a bearded man carves at a wooden table while a dog rests its head beside his hands. First frame: the man, the knife and the dog.', effekt: 'slow-mo 0.5× 3 s', mekanik: 'slow-mo', kalla: 'OUR AD Taljset_PD_3 0:16–0:17', ref: 'parent 0:16 — WITHOUT its caption' },
    },
    rader: [
      { bild: 'Close-up: hands carve a thin wooden stick with a knife, shavings on the table.', effekt: 'none', kalla: 'OUR AD Taljset_PD_3 0:02–0:04', ref: 'parent carving beat — WITHOUT its caption', frihet: 'hold the last frame to fill 3 s' },
      { bild: 'Close-up: the knives in their slots in the roll, the grey cut-resistant glove on top.', effekt: 'none', kalla: 'OUR AD Taljset_PD_3 0:12–0:15', ref: 'parent glove beat — WITHOUT its caption', frihet: 'none' },
      { bild: 'Close-up: a gouge hollows out the bowl of a wooden spoon.', effekt: 'none', kalla: 'OUR AD Taljset_PD_3 0:19–0:22', ref: 'parent spoon beat — WITHOUT its caption', frihet: 'none' },
    ],
    slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/b10-taljset-hero-se.jpg?v=1789216352',
    bild: { foto: 'The product hero photo: the 30-piece set laid out in its zip case, no people.', ref: 'none — the product has no static with 3 purchases; composition as the other FD_2_1 statics', parentBild: null },
    extraRegler: [
      'The parent\'s captions at 0:20–0:24 name the store and say "Länken finns nedan" — cut from the clean clip, never from the rendered ad.',
      'Sharp tools: never show a bare hand holding a blade towards the camera; the glove line is the page\'s own ("Handskarna skyddar när kniven slinter").',
    ],
  },
  {
    nyckel: 'rodholder', prefix: 'Rodholder', produkt: 'the fishing rod holders (4-pack)',
    hub: '3c3270ab-908c-80f8-824d-eed3c4aa94e1', hubnamn: 'Fish rod holder',
    landning: 'https://baverbutiken.se/products/fiskespohallare-4-pack-kraftig-forvaring',
    pris: 289, jamfor: 482, prisText: '289 kr, ord. 482 kr', prisNot: 'same price for all four colours',
    siffror: ['289', '482', '4', '8', '19'],
    be: { roas: 1.50, aov: 444, cpa: 296 },
    forälder: { namn: 'Fiskespöhållare_CS_1_H1', ad: '120249850603660291', video: '1074100205589263', langd: 29, spend: 3622, kop: 23, roas: 3.02, cpa: 157, vb: 3661,
      beskrivning: 'the price video with a hand full of coloured holders, the holders clipped onto rods by the lake and on the boat wall — the best ACTIVE video on profit contribution' },
    benchmark: 'Fiskespöhållare_PD_EXTRA (11 776 kr, 60 purchases, ROAS 2.14, vinstbidrag 5 005 kr) is the top spender and the benchmark; it is PAUSED at ad level (someone\'s decision), so the recut builds on the best active video',
    avatar: 'den-som-letar-present-till-en-pappa-som-fiskar', begar: 'slippa-krangel', mekanism: 'fyra-kraftiga-hallare-ett-spo-per-hallare', tro: 'att-trassel-i-baten-hor-till',
    hook: {
      H1: { bild: 'Close-up: two open hands full of blue and green rod holders (a tattoo and a watch on the wrist). First frame: the full hands.', effekt: 'cut-in', mekanik: 'cut-in', kalla: 'OUR AD Fiskespöhållare_CS_1_H1 0:03–0:06', ref: 'parent 0:03–0:06 — WITHOUT its caption' },
      H2: { bild: 'Medium on a boat: an orange holder keeps two rods upright against the boat\'s side wall, the lake glittering behind. First frame: the holder and the rods.', effekt: 'zoom-in 1 s', mekanik: 'zoom-in', kalla: 'OUR AD Fiskespöhållare_CS_1_H1 0:14–0:17', ref: 'parent boat beat — WITHOUT its caption' },
    },
    rader: [
      { bild: 'Close-up by a lake: fingers clip a blue holder onto a rod, then a row of orange and blue holders along the rods.', effekt: 'none', kalla: 'OUR AD Fiskespöhållare_CS_1_H1 0:06–0:09', ref: 'parent clip beat — WITHOUT its caption', frihet: 'none' },
      { bild: 'Top-down: holders in blue, orange, green and pink lie on a dark stone next to a rod and a reel.', effekt: 'slow-mo 0.67× 3 s', kalla: 'OUR AD Fiskespöhållare_CS_1_H1 0:18–0:20', ref: 'parent colour flat lay — WITHOUT its caption', frihet: 'crop free' },
      { bild: 'POV on the shore rocks: a rod with a blue holder on it, waves behind.', effekt: 'none', kalla: 'OUR AD Fiskespöhållare_CS_1_H1 0:20–0:23', ref: 'parent shore beat — WITHOUT its captions', frihet: 'none' },
    ],
    slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/1d426b7a-cfe0-49df-8b44-03c3aabbc326.jpg?v=1782033165',
    bild: { foto: 'The product photo: the rod holders, no people.', ref: 'Rodholder_PD_6_1 (Meta ad 120249936610640291: 2 882 kr, 17 purchases, ROAS 2.78, CPA 170 kr against break-even CPA 296 kr) for the composition', parentBild: 'Rodholder_PD_6_1' },
    extraRegler: [
      'Every parent caption is banned in this recut: "Idag och bara idag", "Lagret är begränsat", "När det är slut är det slut", "Fri frakt", "30 dagars öppet köp" — cut from the clean clips only.',
      'The page states little: fyra hållare i ett set, kraftig konstruktion, för strand, sjö och båtfiske. Never "på 1 sekund", never a load or size claim.',
    ],
  },
);
