// Batch 5 (2026-08-29) — brittisk engelsk översättning av T5_SV (texter5.mjs),
// för beavershop.co.uk. Ton och format hämtade från de engelska blocken (en:)
// i texter4.mjs. Samma 14 produktnycklar, samma fält, samma struktur.
//
// Räkneorden är låsta mot samma CWD-offert som den svenska mastercopyn och får
// inte ändras: 104 pieces, 24 thread colours, 46/60, 37-litre, 21 compartments,
// 15 LEDs, 14.3 cm, 20.2 cm, 9 × 7 × 3.5 cm, 29.5 cm, 42 × 28 cm, 84 cm, 16 oz,
// 13 cm, V7/V8/V10/V11/V15, Makita 18V. Engelska decimalpunkter, inte kommatecken.
//
// Brittisk stavning genomgående (colour, litre, organiser). "Luffarschack" är
// "noughts and crosses" (inte det amerikanska "tic-tac-toe").
// Arbetslampans "Battery not included" är medvetet kvar tydligt i både titel,
// lösningstext och sista bullet-punkten.

export const T5_EN = {
  arbetslampa: {
    titel: 'Work Light for Makita Battery – 15 LEDs with USB Port',
    problemH: 'The head torch blinds you and your phone dies',
    problemP: "Under the car, in the storage shed, by the garden cabin once night falls – the light's always pointing the wrong way, and the battery you already own is sitting in the drill, doing nothing.",
    losningH: 'The light that runs on the battery you already have',
    losningP: "A work light with 15 LEDs that clips straight onto the Makita 18V mount. Carry handle, stable base and two USB ports so your phone charges while you work. Battery not included – that's the whole point: you already have one.",
    bullets: [
      '<strong>Lights up the whole work area</strong> – 15 LEDs with broad light instead of a narrow beam',
      '<strong>Clips onto the battery you own</strong> – fits the Makita 18V mount',
      '<strong>Charges your phone at the same time</strong> – two USB ports in the base',
      '<strong>Goes wherever the job is</strong> – carry handle, 16 cm tall',
      '<strong>Battery not included</strong> – the light runs on your own Makita 18V battery',
    ],
    option: 'Colour', varden: ['Blue', 'Yellow', 'Red'],
    alt: { main: 'The work light with 15 LEDs and carry handle', b2: 'The work light at an angle from the front with the switch' },
  },

  diskstall: {
    titel: 'Two-Tier Dish Rack – 42 cm of Drying Space for the Whole Wash',
    problemH: 'The washing-up fights for space on one draining tray',
    problemP: 'Plates balance on top of the glasses, the cutlery sits in a heap, and the chopping board leans against the tiles. Every dinner ends with the same Tetris at the sink.',
    losningH: 'Two tiers that give every item its own place',
    losningP: 'Plates and the chopping board stand on their edge to dry, glasses hang upside down on their own pegs, and cutlery gets its own compartment – with a draining tray underneath that channels the water where you want it. 42 × 28 cm on the worktop, 29 cm tall.',
    bullets: [
      "<strong>The whole family's washing-up fits</strong> – two tiers instead of one cramped tray",
      '<strong>Glasses dry upside down</strong> – on their own pegs, no water rings in the base',
      '<strong>No water on the worktop</strong> – the draining tray channels it into the sink',
      '<strong>Cutlery and chopping board get their own spot</strong> – nothing left sloshing about',
    ],
    option: 'Colour', varden: ['Black', 'White'],
    alt: { main: 'The two-tier dish rack full of washing-up by the sink', b2: 'The dish rack with plates, glasses and cutlery in place' },
  },

  bankhylla: {
    titel: 'Countertop Shelf with Pull-Out Basket – Double the Space on the Same Worktop',
    problemH: 'Your worktop ran out of space three appliances ago',
    problemP: 'The coffee machine, the breakfast things and the jars all crowd the same half-metre. The only thing growing in the kitchen is the pile.',
    losningH: 'The shelf that adds a whole extra level',
    losningP: 'A wooden shelf to stand things on – and underneath it a metal basket on rails that slides out like a drawer. Whatever was in the way gets its own spot, without drilling or rebuilding anything.',
    bullets: [
      '<strong>Double the worktop space</strong> – stand things on top, store them underneath',
      '<strong>The basket slides out like a drawer</strong> – see everything without lifting anything off',
      '<strong>Stands on its own</strong> – no drilling, no holes in the wall',
      '<strong>Wood and black metal</strong> – looks like a piece of furniture, not a stack of crates',
    ],
    option: 'Colour', varden: ['Black', 'White'],
    alt: { main: 'The countertop shelf with wooden top and pull-out basket on the kitchen worktop', b2: 'The countertop shelf with the basket pulled out', b3: 'The countertop shelf from an angle' },
  },

  luffarschack: {
    titel: 'Wooden Noughts and Crosses – The Classic That Stays Out',
    problemH: 'Games night dies in an app store',
    problemP: 'Everyone wants to do something together, but the games are in a box at the back of the wardrobe and the phones are closer to hand.',
    losningH: 'The game that stays out – and gets played',
    losningP: 'Wooden noughts and crosses, 14.3 × 14.3 cm, with pieces that stay in their own slots. Smart enough for the coffee table, simple enough for a five-year-old and grandad to play on equal terms.',
    bullets: [
      '<strong>Anyone can play straight away</strong> – everyone already knows the rules',
      '<strong>Stays out and gets used</strong> – wood that suits the coffee table',
      '<strong>The pieces have their own slots</strong> – no lid to find, nothing to lose',
      '<strong>14.3 cm wide</strong> – fits the tray table, the balcony table and the bag',
    ],
    alt: { main: 'Wooden noughts and crosses with black and white pieces', b2: 'Close-up of the board with the pieces in their slots' },
  },

  glasspints: {
    titel: 'Ice Cream Pints with Lid, 2-Pack – Make It Straight in the Jar',
    problemH: 'Homemade ice cream ends up in a plastic tub with an ice crust',
    problemP: "The machine does the work, but then it all gets scraped into a tub that doesn't seal properly and doesn't look like much – and half the batch freezes solid.",
    losningH: 'The jars that go from machine to freezer, lid and all',
    losningP: 'Two 16 oz pints with a tight-sealing lid. Make the ice cream, put the lid on, into the freezer – and serve straight from the same jar. Ribbed, clear glass so you can see which flavour is which.',
    bullets: [
      '<strong>From machine to freezer in one step</strong> – make and store in the same jar',
      '<strong>The lid seals tight</strong> – no ice crust, no freezer taste',
      "<strong>You can see what's inside</strong> – clear glass instead of anonymous plastic",
      '<strong>Two jars</strong> – one in the freezer while you eat from the other',
    ],
    alt: { main: 'The two ice cream pint jars with lids on the kitchen worktop', b2: 'The jar with lids in several colours' },
  },

  kastfanga: {
    titel: 'Throw & Catch Set – 4 Baskets and Balls on a Cord',
    problemH: 'Garden games season lasts about two weekends',
    problemP: 'Outdoor games need level ground, plenty of players and an hour to set up. The rest of summer they sit in the shed.',
    losningH: "The game that's up and running in thirty seconds",
    losningP: 'Four baskets with a strap – held in hand or worn round the neck – and balls on an 84 cm cord. Throw, catch in the basket, swap sides. Works on the lawn, the beach and the campsite, with two players or the whole group.',
    bullets: [
      '<strong>Up and running in thirty seconds</strong> – no pitch to mark out, nothing to screw together',
      '<strong>Everyone can join in straight away</strong> – catching in a basket is easier than catching by hand',
      '<strong>Four baskets in the set</strong> – two matches at once, or the whole family in a circle',
      '<strong>The ball stays with the basket</strong> – the cord is fixed to the basket, no hunting in the flower bed',
    ],
    alt: { main: 'The four green baskets with balls on cords on a picnic blanket on the grass', b2: 'The dimensions – the basket is 13 cm wide and the cord 84 cm' },
  },

  magnetplattor: {
    titel: 'Large-Format Magnetic Tiles – Building Set in a Carry Case',
    problemH: 'Building toys die the moment the pieces are too small',
    problemP: 'Fifty tiny pieces under the sofa, a torn instruction sheet, and a child who gave up after ten minutes. More gets built on the screen than on the floor.',
    losningH: 'Big tiles that click together on their own',
    losningP: 'Large-format magnetic tiles that pull together the right way round – towers, houses and vehicles take shape with no instructions needed. Comes in a case with a handle, so the build gets packed away as fast as it comes out. Choose 46 or 60 pieces.',
    bullets: [
      '<strong>The build works first time</strong> – the magnets snap into place on their own',
      '<strong>Big tiles, no tiny pieces on the sofa</strong> – made for smaller hands',
      '<strong>Tidied away in a minute</strong> – everything goes back in the carry case',
      '<strong>Grows with your child</strong> – geometry and balance without them noticing',
    ],
    option: 'Piece count', varden: ['46 pieces', '60 pieces'],
    alt: { main: 'Towers and builds made from colourful magnetic tiles', b2: 'A larger build made from the magnetic tiles' },
  },

  mcvaska: {
    titel: 'Motocentric Rear Bag 37 L – Your Helmet Fits Inside',
    problemH: 'Your helmet dangles off the handlebars or stays at home',
    problemP: "Anyone who rides knows: there's nowhere for the helmet to go once you've parked, and a rucksack won't hold both that and your waterproofs.",
    losningH: 'The rear bag that swallows the whole helmet',
    losningP: 'A 37-litre rear bag from Motocentric that straps onto the seat or the luggage rack. The helmet fits in, waterproofs and gloves go alongside it, and the reflective details show up in the dark.',
    bullets: [
      '<strong>The helmet finally has somewhere to go</strong> – 37 litres swallows it with room to spare',
      '<strong>Stays put on the bike</strong> – straps for seat or luggage rack',
      '<strong>Shows up in the dark</strong> – reflective details on the back',
      '<strong>Packs more than the helmet</strong> – waterproofs, gloves and a chain lock fit alongside',
    ],
    alt: { main: 'The rear bag mounted on the motorcycle', b2: 'The bag strapped onto the seat' },
  },

  somnadskit: {
    titel: 'Sewing Kit, 104 Pieces – Everything in One Case',
    problemH: "A button comes loose and the whole house doesn't have a single needle",
    problemP: "The hem that's come down, the button in your hand five minutes before you leave – and the nearest needle and thread is in someone else's flat.",
    losningH: 'The whole sewing box in one zip-up case',
    losningP: '104 pieces in one case: 24 thread colours, needles, scissors, tape measure, snap fasteners and a needle threader – each sorted into its own holder, so it still looks the same after the fifth use. In the drawer at home or in the suitcase.',
    bullets: [
      "<strong>The button's sewn back on in five minutes</strong> – thread, needle and scissors all in one place",
      '<strong>104 pieces with their own spots</strong> – the kit looks the same after every use',
      '<strong>24 thread colours</strong> – the right colour for the garment, not just the nearest one',
      '<strong>Fits in the suitcase</strong> – flat, zip-up case',
    ],
    alt: { main: 'The sewing kit open with thread spools, scissors and accessories' },
  },

  reseask: {
    titel: 'Pocket Pill Box – 7 Compartments with a Tight-Sealing Lid',
    problemH: 'Your tablets travel in a rattling bottle',
    problemP: 'You pack for the weekend and the medicine comes along in its original box, taking up space, or loose in a tub where everything gets mixed up.',
    losningH: "The box that fits a week's doses in your jacket pocket",
    losningP: 'Seven separate compartments under a tight-sealing lid, 9 × 7 × 3.5 cm – the box disappears into a jacket pocket or wash bag. The compartments keep the days apart, the lid keeps the tablets dry.',
    bullets: [
      "<strong>A week's doses in your jacket pocket</strong> – 9 × 7 cm, smaller than a deck of cards",
      '<strong>Seven compartments keep the days apart</strong> – nothing loose to get mixed up',
      '<strong>The lid seals tight</strong> – tablets stay dry in the bag',
      '<strong>Opens with one hand</strong> – the catch releases with your thumb',
    ],
    option: 'Colour', varden: ['White', 'Green'],
    alt: { main: 'The white pill box open with tablets in the compartments', b2: 'The green pill box with the dimensions 9 × 7 cm' },
  },

  veckodosett: {
    titel: 'Weekly Pill Organiser, 21 Compartments – Morning, Midday and Evening for Seven Days',
    problemH: '"Did I take this morning’s dose?" is a daily question',
    problemP: "Three doses a day and seven bottles in the bathroom cabinet – eventually nobody's keeping count, and keeping count is the whole point.",
    losningH: "Fill it once on Sunday, then it's just open and go",
    losningP: "Seven daily boxes with three compartments each – morning, midday, evening – in one case with a lid. Fill it all on Sunday. Today's box goes in your pocket, the rest stays at home, and the answer to the question is right there in the compartment.",
    bullets: [
      "<strong>The answer's right there in the compartment</strong> – an empty slot means the dose was taken",
      "<strong>Today's box goes with you</strong> – pop it out and take it in your pocket, the rest stays home",
      '<strong>21 compartments filled in one go</strong> – one refill a week instead of three a day',
      '<strong>The lid keeps it all in order</strong> – the boxes sit securely in the case',
    ],
    alt: { main: 'The weekly organiser with seven daily boxes in the case', b2: 'One daily box removed from the case' },
  },

  sandbild: {
    titel: '3D Sand Art, 20 cm – A New Landscape Every Time You Turn It',
    problemH: 'Your ornaments have looked the same since you unpacked them',
    problemP: 'The shelf is arranged and finished – and dead still. Nothing in the room changes unless someone moves something.',
    losningH: 'The picture that redraws itself',
    losningP: 'Turn the frame over and the sand slowly sinks through the liquid into a new mountain landscape – different every time. Round frame, 20.2 cm across, stands on its own base on the shelf or the desk.',
    bullets: [
      '<strong>A new picture every time</strong> – no two turns settle the sand quite the same way',
      '<strong>The calmest thing to look at in the room</strong> – slow movement instead of yet another static ornament',
      '<strong>Turned with one flip</strong> – stands securely on its own base',
      '<strong>20 cm round</strong> – takes up shelf space like a book, stands out like a picture',
    ],
    option: 'Colour', varden: ['Red', 'Amber'],
    alt: { main: 'The red 3D sand art on a shelf', b2: 'Dimensions – the frame is 20.2 cm wide and 21.4 cm tall', b3: 'The sand art in amber' },
  },

  dysonborste: {
    titel: 'Pet Hair Brush for Dyson Vacuums – Brush and Vacuum in One Go',
    problemH: 'The fur gets brushed out – and lands on the floor',
    problemP: "The dog moults, the brush fills up, and everything you've combed out drifts down onto the rug you just vacuumed. Two jobs undoing each other.",
    losningH: 'The brush that fits on the vacuum',
    losningP: 'A brush head that connects to a Dyson V7, V8, V10, V11 or V15 – with a hose and adaptors included in the kit. The bristles loosen the undercoat and the machine sucks it up in the same motion. The fur ends up in the bin, not on the floor.',
    bullets: [
      '<strong>The fur ends up in the vacuum</strong> – not on the floor you just cleaned',
      '<strong>Fits your Dyson</strong> – V7, V8, V10, V11 and V15 with the adaptors included',
      '<strong>The hose gives you reach</strong> – brush on the sofa without lifting the machine',
      '<strong>Gentle bristles</strong> – loosen the undercoat without pulling at the skin',
    ],
    alt: { main: 'The brush head on the vacuum next to a dog and cat', b2: "The kit's parts – brush head, hose and adaptors, marked V7–V15" },
  },

  magnethylla: {
    titel: 'Magnetic Shelf for Washing Machine & Fridge – Storage Without Drilling',
    problemH: 'The washing powder sits on the floor behind the door',
    problemP: 'The utility room has no shelves, and your landlord has opinions about drill holes. So the bottles sit on top of the machine and fall off every time it spins.',
    losningH: 'The shelf that grips straight onto the metal',
    losningP: 'A shelf with a magnetic back that attaches straight onto the side of the washing machine or fridge. 29.5 cm wide with a lip that keeps the bottles in place – up in seconds, moved just as fast, no holes left behind.',
    bullets: [
      '<strong>Up in seconds, no holes</strong> – the magnet grips straight onto the metal',
      '<strong>The bottles stay put</strong> – the lip holds them in place when the machine spins',
      '<strong>Move it whenever you want</strong> – lift it off, stick it on the next metal surface',
      '<strong>29.5 cm wide</strong> – detergent, softener and stain remover in a row',
    ],
    option: 'Colour', varden: ['Black', 'White'],
    alt: { main: 'Two black magnetic shelves with washing powder on the side of the washing machine', b2: 'The white shelf with dimensions 29.5 × 9.5 × 7.5 cm' },
  },
};
