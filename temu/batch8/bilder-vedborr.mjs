// Vedklyvborr (id `vedborr`) — bygger galleribilderna ur leverantörsbilden.
//
// Källan (/tmp/b8/bilder/image5.jpg, 1920×1920) är ett måttdiagram: kon,
// tre skaft och plastasken utplacerade på vitt med engelska/metriska
// måttetiketter och streckade måttlinjer runtomkring. Inget ska målas över —
// varje utsnitt är beskuret så att etiketterna och måttlinjerna hamnar utanför
// ramen. De enda pixlar som vitmålas är en bit ren bakgrund uppe till höger i
// konutsnittet där en måttlinje skär in (ingen text, ingen produkt).
//
// Siffrorna i infografiken kommer UTESLUTANDE ur temu/batch8/fakta.mjs.
//
// Kör:  node temu/batch8/bilder-vedborr.mjs [källbild] [ut-sv] [ut-no]
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';
import { FAKTA } from './fakta.mjs';

const SRC = process.argv[2] || '/tmp/b8/bilder/image5.jpg';
const UT_SV = process.argv[3] || '/tmp/b8/ut/vedborr';
const UT_NO = process.argv[4] || '/tmp/b8/ut-no/vedborr';
mkdirSync(UT_SV, { recursive: true });
mkdirSync(UT_NO, { recursive: true });

const F = FAKTA.vedborr.latt;
const BLA = '#0b2a3d', GUL = '#ffd24a', GRA = '#5b6b76', SVART = '#12212b';
const S = 1600;

/* ---------- 1. textfria utsnitt ur källbilden ----------
   Rutorna är uppmätta med pixelprofil (mörka pixlar < 200) på källbilden:
     kon    x 1096–1657, y  282–1728   (måtttext "85mm" ligger x > 1680,
                                        "32mm" ligger y > 1740)
     skaft  x  281– 988, y  986–1728   (måtttext "65mm" x < 217, "10mm" y > 1800)
     ask    x  150– 600, y   20– 420   (måtttexterna ligger nedåt/vänster om den) */
const RUTA = {
  kon:   { left: 1088, top: 272, width: 576, height: 1456 },
  skaft: { left: 302, top: 992, width: 690, height: 738 },
  ask:   { left: 150, top: 18, width: 470, height: 402 },
  // enskilt sexkantskaft (det tredje) — bär 65 mm / 10 mm
  ettSkaft: { left: 772, top: 992, width: 222, height: 738 },
  // konens nedre cylinder — bär 32 mm-basen
  konBas: { left: 1088, top: 1330, width: 576, height: 398 },
  // konens spets — bär spiralgängan
  konSpets: { left: 1180, top: 300, width: 420, height: 520 },
};

const skar = (r) => sharp(SRC).extract(r).png().toBuffer();

// Två måttmarkeringar ligger bredvid det FÖRSTA skaftets spets (de lodräta
// hjälplinjerna till "10mm" plus dess vågräta pil). De sitter på ren vit
// bakgrund vid sidan av skaftet, så de vitmålas i stället för att kapa bort
// skaftspetsarna. Rutorna är satta så att de inte når in i skaftsilhuetten:
// skaftet spänner x 341–435 på de raderna, rutorna slutar vid 345 resp. börjar
// vid 444.
const TICKS = [
  { left: 296, top: 1708, width: 45, height: 26 },
  { left: 444, top: 1708, width: 32, height: 26 },
];
async function skaftRen(ruta) {
  const bas = await skar(ruta);
  const lock = TICKS
    .filter((t) => t.top + t.height > ruta.top && t.top < ruta.top + ruta.height)
    .map((t) => ({
      input: { create: { width: t.width, height: t.height, channels: 3, background: '#ffffff' } },
      left: t.left - ruta.left, top: t.top - ruta.top,
    }));
  return lock.length ? sharp(bas).composite(lock).png().toBuffer() : bas;
}

// Konutsnittet: en måttlinje löper in uppe till höger. Där finns bara vit
// bakgrund och ingen produkt (spetsen ligger till vänster om x 1385 i källan),
// så den remsan vitmålas i stället för att kapa bort halva konen.
async function konRen() {
  const bas = await skar(RUTA.kon);
  const tackW = RUTA.kon.left + RUTA.kon.width - 1385;      // 279 px
  return sharp(bas).composite([{
    input: { create: { width: tackW, height: 34, channels: 3, background: '#ffffff' } },
    left: 1385 - RUTA.kon.left, top: 0,
  }]).png().toBuffer();
}

/* ---------- 2. hjälpare ---------- */
// Skalar in ett utsnitt i en ruta utan att förvränga det.
async function passa(png, maxW, maxH) {
  const m = await sharp(png).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(png).resize(w, h).png().toBuffer(), w, h };
}
const txt = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const duk = () => sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } });

/* ---------- 3. hero: konen + de tre skaften, ingen text ---------- */
async function hero(fil) {
  const kon = await passa(await konRen(), 560, 1290);
  const skaft = await passa(await skaftRen(RUTA.skaft), 700, 670);
  const botten = 1440;
  await duk().composite([
    { input: kon.buf, left: 1600 - 170 - kon.w, top: botten - kon.h },
    { input: skaft.buf, left: 190, top: botten - skaft.h },
  ]).jpeg({ quality: 92 }).toFile(fil);
  console.log('✔', fil);
}

/* ---------- 4. detalj: de tre skafttyperna i närbild ---------- */
async function detalj(fil) {
  const n = await passa(await skaftRen({ left: 302, top: 1120, width: 690, height: 610 }), 1400, 1240);
  await duk().composite([{ input: n.buf, left: Math.round((S - n.w) / 2), top: Math.round((S - n.h) / 2) }])
    .jpeg({ quality: 92 }).toFile(fil);
  console.log('✔', fil);
}

/* ---------- 5. infografik ----------
   Varje rad: gul etikettruta med siffran, fet rubrik, grå undertext och ett
   utsnitt ur den riktiga bilden till höger. Siffrorna hämtas ur FAKTA. */
const ORD = {
  sv: {
    rubrik: 'VEDKLYVBORR – MÅTT OCH INNEHÅLL',
    rader: [
      [`${F.konDiameterMm} MM`, 'Konens diameter', 'Bredaste punkten vid basen', 'konBas'],
      [`${F.konHojdMm} MM`, 'Konens höjd', 'Gängad spiral hela vägen upp till spetsen', 'kon'],
      [`${F.skaft} ST`, 'Skaft i satsen', 'Rund, SDS och sexkant', 'skaft'],
      [`${F.skaftLangdMm} MM`, 'Skaftets längd', `${F.skaftDiameterMm} mm skaftdiameter på alla tre`, 'ettSkaft'],
      [`${F.askMm[0]} × ${F.askMm[1]} MM`, 'Plastask', 'Konen och skaften ligger i asken', 'ask'],
      ['OBS', 'Ingen slagfunktion', 'Roterande verktyg – inte för slagborr', 'konSpets'],
    ],
  },
  no: {
    rubrik: 'VEDKLØYVERBOR – MÅL OG INNHOLD',
    rader: [
      [`${F.konDiameterMm} MM`, 'Kjeglens diameter', 'Bredeste punktet ved foten', 'konBas'],
      [`${F.konHojdMm} MM`, 'Kjeglens høyde', 'Gjenget spiral hele veien opp til spissen', 'kon'],
      [`${F.skaft} STK`, 'Tapper i settet', 'Rund, SDS og sekskant', 'skaft'],
      [`${F.skaftLangdMm} MM`, 'Tappens lengde', `${F.skaftDiameterMm} mm tappdiameter på alle tre`, 'ettSkaft'],
      [`${F.askMm[0]} × ${F.askMm[1]} MM`, 'Plasteske', 'Kjeglen og tappene ligger i esken', 'ask'],
      ['OBS', 'Ikke bruk slagfunksjon', 'Roterende verktøy – ikke for slagbor', 'konSpets'],
    ],
  },
};

async function fakta(sprak, fil) {
  const o = ORD[sprak];
  const rader = o.rader, radH = Math.floor((S - 120) / rader.length);   // 246 px
  const lager = [], svg = [
    `<rect x="0" y="0" width="${S}" height="120" fill="${BLA}"/>`,
    `<text x="${S / 2}" y="78" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="46" fill="#ffffff" letter-spacing="2">${txt(o.rubrik)}</text>`,
  ];
  for (let g = 0; g < rader.length; g++) {
    const [etikett, rubrik, under, bild] = rader[g];
    const y = 120 + g * radH;
    if (g) svg.push(`<rect x="80" y="${y}" width="${S - 160}" height="2" fill="#e4e8ea"/>`);
    // gul etikettruta — bredden följer texten så inget klipps
    const bw = Math.max(150, Math.round(etikett.length * 25) + 44);
    svg.push(`<rect x="84" y="${y + 82}" width="${bw}" height="72" rx="12" fill="${GUL}"/>`);
    svg.push(`<text x="${84 + bw / 2}" y="${y + 133}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="38" fill="${SVART}">${txt(etikett)}</text>`);
    const tx = 84 + bw + 40;
    svg.push(`<text x="${tx}" y="${y + 108}" font-family="DejaVu Sans" font-weight="bold" font-size="42" fill="${BLA}">${txt(rubrik)}</text>`);
    svg.push(`<text x="${tx}" y="${y + 158}" font-family="DejaVu Sans" font-size="26" fill="${GRA}">${txt(under)}</text>`);
    const kall = (bild === 'skaft' || bild === 'ettSkaft') ? skaftRen : skar;
    const p = await passa(await kall(RUTA[bild]), 190, radH - 54);
    lager.push({ input: p.buf, top: y + Math.round((radH - p.h) / 2), left: 1330 + Math.round((190 - p.w) / 2) });
  }
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await duk().composite(lager).jpeg({ quality: 92 }).toFile(fil);
  console.log('✔', fil);
}

/* ---------- 6. kör ---------- */
for (const ut of [UT_SV, UT_NO]) {
  await hero(`${ut}/vedborr-hero.jpg`);
  await detalj(`${ut}/vedborr-detalj.jpg`);
}
await fakta('sv', `${UT_SV}/vedborr-fakta.jpg`);
await fakta('no', `${UT_NO}/vedborr-fakta.jpg`);

// Referensbild för Higgsfield (ren produkt utan mått) — används till miljöbilden.
await hero('/tmp/b8/vedborr-ref.jpg');
