// plan-bof.mjs — regin för fars dag-batchen omgång 4 (extra BOF-batch), 2026-09-29 kväll.
//
// Axels order 2026-09-29: "gör en till extra batch för fars dag för alla produkter
// och gärna dubbelt så mycket bildads och sedan normal kvantitet videos så att vi
// pushar extra mycket BOF fars dag annonser. Det verkar ge väldigt bra resultat.
// Speciellt för alla produkter som går så sjukt bra nu och ta detta in till
// accountance när du gör nya batcher fram till sista oktober."
//
// Per produkt: FD_3_H1/H2/H3 (video, 13 s, omklipp av samma förälder som FD_1 —
// BOF: tittaren vet vad produkten är; hooken besvarar invändningen, säger priset
// eller sista dagen; rad 2–3 gemensamma; slutkort med erbjudandet) och
// FD_4_1–FD_4_4 (bild, samma foto/badge/prisband/bottenrad som FD_2_1 — bara
// budskapet skiljer: _1 invändningen, _2 priset först, _3 sista beställningsdagen,
// _4 vad han får). Tolv produkter: de elva hubbarna från omgång 1–3 + ATV-Kapellet
// (BREAKTHROUGH 2026-09-29, egen hub sedan samma dag). Alla tolv kampanjerna
// lästes ACTIVE i MagiBorsten 2026-09-29 kväll; priserna lästes live samma kväll
// (baverbutiken.se/products.json) och stämmer med plan.mjs.
//
// Bilderna/klippen är plan.mjs-regin (avläst frame för frame 2026-09-28) i ny
// ordning — ingen påhittad sekund. Copyn (svenska rader) skrivs av sonnet
// (CLAUDE.md regel 6) och ligger i copy/bof/<nyckel>.json.

import { PRODUKTER as BAS } from './plan.mjs';

export const DATUM = '2026-09-29';
export const FARS_DAG = '2026-11-08';
export const SISTA_BESTALLNING = '2026-10-19';
export const SISTA_LAUNCH = '2026-10-31';

const D = 'DRIVE 1-8-ycjSrheQilknhRhfPfsbVAriiFPu-';
// ATV-Kapellet: förälderns video är inte transkriberad (ffmpeg saknas i rutinens
// container) — källan är Drive-filen med EDITOR PICKS, som i batch #1 samma dag.
const ATV = {
  nyckel: 'atv', prefix: 'ATVKapell', produkt: 'the ATV cover (3XL)',
  hub: '3ea270ab-908c-8157-a2a2-ca2cb28cb792', hubnamn: 'ATV cover creative hub', datakalla: 'e68270ab-908c-8316-a89c-07bd784ea4bd',
  landning: 'https://baverbutiken.se/products/atv-kapell-storlek-3xl-256-110-120-cm-svart',
  pris: 579, jamfor: 759, prisText: '579 kr, ord. 759 kr', prisNot: 'one variant (3XL)',
  siffror: ['579', '759', '256', '110', '120', '3', '8', '19'],
  be: { roas: 1.62, aov: 684, cpa: 422 },
  forälder: { namn: 'ATVKapell_PD_1_H1', ad: '120250320728410291', video: null, langd: null, spend: 7336, kop: 27, roas: 2.52, cpa: 272, vb: 4075,
    beskrivning: 'the product demo (BREAKTHROUGH 2026-09-29: 77 % of the campaign\'s spend in its first week, hook rate 36 %) — the uncovered ATV, the cover pulled over it, the covered ATV' },
  benchmark: 'ATVKapell_PD_1_H1 is itself the top spender',
  avatar: 'atv-agaren-som-parkerar-ute', begar: 'skydda-det-jag-ager', mekanism: 'skrapet-pa-kapellet-inte-lacken', tro: 'att-den-inte-passar-min',
  hook: {
    H1: { bild: 'Wide shot: the uncovered ATV parked outdoors by a wall, still, leaves on the paint. First frame: the whole ATV, no people.', effekt: 'freeze 0.5 s, then cut-in', mekanik: 'freeze', kalla: `${D} [EDITOR PICKS: the parent's wide shot of the uncovered ATV standing still]`, ref: 'parent — the problem shot' },
    H2: { bild: 'Medium shot: two hands pull the black cover over the ATV from front to back; seat and handlebars disappear last. First frame: the cover half on.', effekt: 'cut-in', mekanik: 'cut-in', kalla: `${D} [EDITOR PICKS: the shot where the cover is pulled over the ATV]`, ref: 'parent — the demo shot' },
  },
  rader: [
    { bild: 'Medium shot: the cover is pulled over the ATV, then a wide shot of the covered ATV.', effekt: 'none', kalla: `${D} [EDITOR PICKS: the cover-on shot and the covered wide shot]`, ref: 'parent — demo beat', frihet: 'b-roll order free' },
    { bild: 'Wide shot of the covered ATV; the three measurements 256 × 110 × 120 cm as a caption over the cover. First frame: the covered ATV.', effekt: 'zoom-in 1 s', mekanik: 'zoom-in', kalla: 'CDN https://cdn.shopify.com/s/files/1/1013/0322/2621/files/b10-atvkapell-fakta-se.jpg?v=1789216302 (the page\'s dimension image; the covered ATV from the Drive file behind it)', ref: '—', frihet: 'music free' },
    { bild: 'Wide shot: the covered ATV inside a garage, black against the wall.', effekt: 'none', kalla: `${D} [EDITOR PICKS: the covered ATV in a garage or by a wall]`, ref: '—', frihet: 'b-roll order free' },
  ],
  slutbild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/b10-atvkapell-hero-se.jpg?v=1789216302',
  bild: { foto: 'The product hero photo: the black cover on an ATV, no people.', ref: 'none — the product has no static yet; composition as the other FD statics', parentBild: null },
  extraRegler: [
    'One size only: 3XL, 256 × 110 × 120 cm — every ad says "mät din ATV först" or shows the three measurements. Never a brand list (Polaris, Honda …), never "vattentätt", "vindtätt" or "UV" — the parent\'s live copy carries them, the page does not.',
    'The page\'s lifestyle pictures are AI-generated illustrations: use the Drive footage or the hero photo, never the illustrations as "proof".',
  ],
};

/** BOF-överlägget per produkt: invändningen (avatarens tvivel), svaret ur sidan, klippordningen. */
const BOF = {
  takoverdrag: { invandning: 'finns den för min husvagn?', svar: 'nio längder, 3 × 5,5 till 3 × 13,5 m, från 1 129 kr; remmar på alla fyra sidor, kanten 30 till 40 cm ner över väggen', tro: 'att-den-inte-finns-for-min', siffrorExtra: ['5,5', '13,5'],
    h3: 'rader:2', rad2: 'rader:1', rad3: 'rader:0', fakta: 'nio storlekar 3 × 5,5 till 3 × 13,5 m (från 1 129 kr, större storlekar kostar mer och sidan visar varje) · remmar på alla fyra sidor · kanten hänger 30 till 40 cm ner över sidoväggen · 210D-väv' },
  termoskydd: { invandning: '559 kr för ett överdrag?', svar: '559 kr mot 932 kr; sitter utanpå glaset i dörrkarmen, 211 × 171 cm, vindrutan och båda sidorutorna', tro: 'att-priset-ar-for-hogt-for-ett-overdrag', siffrorExtra: [],
    h3: 'rader:2', rad2: 'rader:0', rad3: 'rader:1', fakta: 'utanpå glaset, fästs i dörrkarmen · 211 × 171 cm, täcker vindrutan och båda sidorutorna · mörkläggande · håller kupén från imma på morgonen (sidans egen rad)' },
  ibc: { invandning: 'räcker inte en presenning?', svar: 'tyget stänger ute ljuset så algerna inte växer; dragkedja på sidan, lucka för locket, passar 1000-literstanken', tro: 'att-en-presenning-racker', siffrorExtra: [],
    h3: 'rader:2', rad2: 'rader:0', rad3: 'rader:1', fakta: 'stänger ute ljuset så alger inte växer · dragkedja på sidan · lucka på ovansidan för locket, lucka nertill för kranen · passar 1000 l IBC-tank' },
  batmotor: { invandning: 'passar den min motor?', svar: 'nio storlekar, 0 till 5 hk upp till 250 till 350 hk, mät först; dras på utan verktyg och spänns med en rem', tro: 'att-den-inte-passar-min-motor', siffrorExtra: ['0', '5', '250', '350'],
    h2: 'rader:2', h3: 'foto', rad2: 'hook:H1', rad3: 'foto', klippNot: { rad2: 'in H1 this is the same take as the hook: continue it without a cut (the strap being tightened is the second half of the take)', rad3: 'in H3 this is the same still as the hook: continue the zoom without a cut; the caption carries the size list' }, fakta: '420D Oxford-tyg (materialnamnet, utan värdeord) · täcker kåpan ner över riggen · spänns med en rem · nio storlekar 0 till 5 hk upp till 250 till 350 hk, mät först · dras på utan verktyg · håller regn, smuts och löv borta när båten står still',
    stopp: '⛔ Axel 2026-09-29 (products/batmotorskyddet-420d/dna.md, överst): NEVER "tål en hel vinter", "slitstarkt", "kraftigt", "tåligt", "premium", "vattentätt", "tätt", "vattnet rinner av", "UV", "sitter kvar i storm", any function not on the product photo (ventilation, zip, lining, padding, drawstring, double straps), no staged durability demo, no "hela vintern". Say "håller regn, smuts och löv borta", "ett tygöverdrag", "spänns med en rem". The hook builds on the problem, the fit question or the price — never on the material\'s strength. The parent\'s snow shots (0:15–0:19) and the water-bead macro (0:08–0:10) are NOT used in this batch.' },
  sotarset: { invandning: 'kan jag verkligen rensa själv?', svar: 'nio böjliga stänger som skruvas ihop till 3,69 m, borsten 100 mm, drivs med borrmaskinen; når bakom kaminen', tro: 'att-bara-sotaren-kan-rensa-roret', siffrorExtra: [],
    h3: 'rader:0', rad2: 'rader:1', rad3: 'hook:H1', fakta: 'nio böjliga stänger, skruvas ihop till 3,69 m · nylonborste 100 mm · drivs med borrmaskin · följer krökarna i röret · når bakom kaminen eller torktumlaren (sidans rad)' },
  tofflor: { invandning: 'vilken storlek, vilken färg?', svar: 'storlek 40 till 47, khaki eller svart, plysch från häl till tå, hälrem', tro: 'att-fel-storlek-gor-presenten-vardelos', siffrorExtra: [],
    h3: 'rader:0', rad2: 'rader:1', rad3: 'rader:2', fakta: 'storlek 40 till 47 · khaki eller svart · plyschfoder från häl till tå · hälrem så tofflan sitter kvar i trappan · inomhustoffla (högst "en snabb sväng ut på altanen efter veden")' },
  beltgrinder: { invandning: 'kräver det inte teknik?', svar: 'slipbandet gör jobbet; 3-i-1: slipband, polerskiva, knivslip; sätt kniven mot bandet i vinkel', tro: 'att-slipa-kniv-kraver-teknik', siffrorExtra: [],
    h3: 'rader:1', rad2: 'rader:0', rad3: 'hook:H2', fakta: '3-i-1: slipband, polerhjul och knivslip · mini-bänkmodell · kniven dras längs bandet i vinkel · för knivar, mejslar, yxor och trä (sidan) — no time claim, no seconds' },
  solcellslampa: { invandning: 'måste en elektriker sätta upp den?', svar: 'ingen kabel: solcell och 1200 mAh batteri, rörelsesensorn tänder tre huvuden med 210 lysdioder, skruvas upp själv', tro: 'att-en-utelampa-kraver-elektriker', siffrorExtra: [],
    h3: 'rader:0', rad2: 'rader:2', rad3: 'rader:1', fakta: 'solcell på ovansidan, 1200 mAh batteri, ingen kabel · rörelsesensor · tre huvuden som vinklas · 210 lysdioder · fjärrkontroll · skruvas upp på vägg eller stolpe' },
  golfkalender: { invandning: 'vad finns i luckorna?', svar: '24 luckor med golfbollar, peggar, bollmarkeringar, greenlagare med spegel, klubbrengöringsborste och golfhandduk', tro: 'att-en-present-till-golfaren-maste-vara-en-klubba', siffrorExtra: [],
    h3: 'rader:1', rad2: 'rader:0', rad3: 'rader:2', fakta: '24 luckor · innehåll enligt sidan: golfbollar, peggar, bollmarkeringar, greenlagare med spegel, klubbrengöringsborste, golfhandduk · never socks, never an age, never "barnsäker"' },
  taljset: { invandning: 'är det farligt att börja tälja?', svar: '30 delar i väskan: 6 knivar, 6 järn, strop och skärskyddade handskar; allt i en väska', tro: 'att-talja-kraver-att-man-letar-ihop-verktyg', siffrorExtra: [],
    h3: 'rader:0', rad2: 'rader:1', rad3: 'rader:2', fakta: '30 delar · 6 knivar och 6 järn · skärskyddade handskar ("Handskarna skyddar när kniven slinter", sidans rad) · strop · allt i en väska med dragkedja' },
  rodholder: { invandning: 'passar de mina spön?', svar: 'fyra kraftiga hållare, ett spö per hållare, för strand, sjö och båt; ett set är EN färg: grön, orange, rosa eller blå', tro: 'att-trassel-i-baten-hor-till', siffrorExtra: [],
    h3: 'rader:2', rad2: 'rader:0', rad3: 'rader:1', fakta: 'fyra hållare i ett set · ett spö per hållare · kraftig konstruktion · för strand, sjö och båtfiske · ett set är EN färg (grön, orange, rosa eller blå) — the page states little: never a load, size or "1 sekund" claim' },
  atv: { invandning: 'passar den min ATV?', svar: 'en storlek: 3XL, 256 × 110 × 120 cm, mät din ATV först; skräpet lägger sig på kapellet i stället för på lacken', tro: 'att-den-inte-passar-min', siffrorExtra: [],
    h3: 'rader:1', rad2: 'rader:0', rad3: 'rader:2', fakta: 'en storlek: 3XL, 256 × 110 × 120 cm — mät först · helsvart · läggs över hela ATV:n mellan turerna · skräpet lägger sig på kapellet, inte på lacken' },
};

/** Slår upp ett klipp ur basregin: 'hook:H1', 'rader:0' eller 'foto' (produktfotot som stillbild). */
function klipp(p, ref) {
  if (ref === 'foto') return { bild: `Still: the product photo (${p.slutbild}) with a slow zoom-in 1 s; the strap and the fabric fill the frame.`, effekt: 'zoom-in 1 s, hold to 3 s', mekanik: 'zoom-in', kalla: `CDN ${p.slutbild}`, ref: 'the landing page\'s own photo', frihet: 'crop free, the product must fill the frame' };
  const [typ, i] = ref.split(':');
  const k = typ === 'hook' ? p.hook[i] : p.rader[Number(i)];
  return { bild: k.bild, effekt: k.effekt, mekanik: k.mekanik ?? (k.effekt === 'none' ? 'none' : k.effekt.split(' ')[0]), kalla: k.kalla, ref: k.ref, frihet: k.frihet ?? 'none' };
}

export const PRODUKTER = [...BAS, ATV].map((p) => {
  const b = BOF[p.nyckel];
  if (!b) throw new Error(`BOF-överlägg saknas för ${p.nyckel}`);
  return {
    ...p,
    bof: b,
    siffror: [...new Set([...p.siffror, ...b.siffrorExtra])],
    // FD_3: tre hookklipp (H1 = föräldrahook 1, H2 = föräldrahook 2, H3 = ett tredje klipp ur regin) + två gemensamma kroppsrader + slutkort.
    fd3: {
      hook: { H1: klipp(p, 'hook:H1'), H2: klipp(p, b.h2 ?? 'hook:H2'), H3: klipp(p, b.h3) },
      rader: [klipp(p, b.rad2), klipp(p, b.rad3)].map((k, i) => (b.klippNot?.[`rad${i + 2}`] ? { ...k, frihet: `${k.frihet}; ${b.klippNot[`rad${i + 2}`]}` } : k)),
    },
  };
});

export const BILDKONCEPT = [
  { nr: 1, tagg: 'invandningen', jobb: 'answer the objection (the product-aware buyer\'s doubt) in the headline, the page\'s fact in the sub-line' },
  { nr: 2, tagg: 'priset-forst', jobb: 'the price itself is the headline (sale price against compare-at), the sub-line says what he gets' },
  { nr: 3, tagg: 'sista-dagen', jobb: 'the order deadline (19 October) is the headline, the sub-line ties it to Father\'s Day and the product' },
  { nr: 4, tagg: 'vad-han-far', jobb: 'what he gets: the contents/size/fact list from the page as the headline and sub-line' },
];
