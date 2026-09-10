// Kattkojan (batch 6) — två infografiker ur leverantörens huvudbild.
//
// Källa: Temu-listningens huvudbild (den CWD offererade), 800×800. Den visar
// grå koja i Oxford-liknande tyg, sadeltak, välvd dörr med flik, svart
// metallstativ med fyra ben och en lös liggmatta bredvid. Inga mått, ingen
// vikt, ingen denier, inget om värmereflex eller vattenpelare är känt — och
// då står det inte heller något sådant här. Varje rad pekar på något som
// syns i bilden eller står i offerten (färgerna grå / gräsgrön / svart).
// Reparerat 2026-09-10 efter granskning: inga utfallslöften ("kyler inte",
// "i stället för in", "ingen plats") och inget räkneord på öppningar —
// baksidan av kojan syns inte på bilden, så antalet är okänt. Formen får
// beskrivas (lutande tak, står på ben, flik), effekten bara med butikens
// tillåtna verb (lyfter, bromsar, dämpar) — aldrig absolut.
//
// Bild 1 (fakta): sex rader = fet rubrik + undertext + utsnitt ur källbilden
//   som visar just den detaljen (sharp.extract, koordinater uppmätta för hand).
// Bild 2 (färger): tre färgprover — INGA AI-hus i grönt/svart, vi har ingen
//   riktig bild av dem, så bara prover + texten att sidan visar den grå.
//
// Kör:  node temu/batch6/kattkoja-bilder.mjs <utmapp> [sv|no]
//       (källbilden ligger i /tmp/katt/goods.jpeg, kan bytas med KALLA=...)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const UT = process.argv[2] || '/tmp/katt/ut';
const SPRÅK = process.argv[3] || 'sv';
const SRC = process.env.KALLA || '/tmp/katt/goods.jpeg';
mkdirSync(UT, { recursive: true });

// Bildtexterna följer butikens språk — svensk text på en norsk produktsida
// är samma fel som kinesisk text på en svensk.
const ORD = {
  sv: {
    faktaRubrik: 'DET HÄR ÄR KOJAN',
    rader: [
      ['Står på ben', 'stativ i metall – lyfter kojan från den kalla marken'],
      ['Sadeltak i Oxford-tyg', 'lutande tak – vatten rinner av'],
      ['Isolerade väggar', 'behåller värmen katten själv avger'],
      ['Öppning med flik', 'fliken bromsar draget i dörren'],
      ['Lös liggmatta ingår', 'går att ta ut och skaka'],
      ['Hopfällbar', 'tar liten plats i förrådet över sommaren'],
    ],
    fargRubrik: 'TRE FÄRGER',
    farger: ['Grå', 'Gräsgrön', 'Svart'],
    visas: 'PÅ BILDERNA',
    fargFot: 'Bilderna på sidan visar den grå',
  },
  no: {
    faktaRubrik: 'DETTE ER HUSET',
    rader: [
      ['Står på ben', 'stativ i metall – løfter huset fra den kalde bakken'],
      ['Saltak i Oxford-stoff', 'skrått tak – vann renner av'],
      ['Isolerte vegger', 'holder på varmen katten selv avgir'],
      ['Åpning med klaff', 'klaffen demper trekken i døren'],
      ['Løs liggematte følger med', 'kan tas ut og ristes'],
      ['Sammenleggbar', 'tar liten plass i boden om sommeren'],
    ],
    fargRubrik: 'TRE FARGER',
    farger: ['Grå', 'Gressgrønn', 'Svart'],
    visas: 'PÅ BILDENE',
    fargFot: 'Bildene på siden viser den grå',
  },
}[SPRÅK];
if (!ORD) throw new Error(`okänt språk: ${SPRÅK}`);

const BLA = '#0b2a3d', GUL = '#ffd24a', GRA = '#5b6b76', LINJE = '#e4e8ea';
const S = 1600;
const text = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const meta = await sharp(SRC).metadata();
if (meta.width !== 800 || meta.height !== 800)
  throw new Error(`utsnitten är uppmätta för 800×800, källan är ${meta.width}×${meta.height}`);

/* ---------- utsnitt ur källbilden (uppmätta i 800×800) ---------- */
// [left, top, width, height] — en detalj per rad, i samma ordning som ORD.rader.
const UTSNITT = [
  { ben: [20, 510, 300, 190] },     // vänster framben + stativets ram
  { tak: [340, 70, 400, 255] },     // nock, högra takfallet och takfoten
  { vagg: [535, 228, 210, 130] },   // slät väggyta ovanför katten, utan pilar
  { dorr: [68, 268, 278, 176] },    // den välvda dörren med fliken — väggkant x=70, pilen börjar x=347
  { matta: [430, 575, 370, 225] },  // den lösa liggmattan
  { hela: [0, 60, 800, 740] },      // hela kojan nedskalad
];
const TW = 330, TH = 200;           // miniatyrernas yta i bild 1

// Utsnitt → miniatyr med rundade hörn. Hela kojan får 'contain' på vitt
// (den ska visas hel, inte beskuren); detaljerna fyller ytan ('cover').
async function miniatyr(box, hel) {
  const [left, top, width, height] = box;
  const bild = await sharp(SRC).extract({ left, top, width, height })
    .resize(TW, TH, hel ? { fit: 'contain', background: '#ffffff' } : { fit: 'cover' })
    .png().toBuffer();
  const mask = Buffer.from(`<svg width="${TW}" height="${TH}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${TW}" height="${TH}" rx="18" fill="#000"/></svg>`);
  return sharp(bild).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

/* ---------- 1. fakta ---------- */
{
  const band = 120, start = 136, radH = 240, lager = [];
  const svg = [`<rect x="0" y="0" width="${S}" height="${band}" fill="${BLA}"/>`,
    `<text x="${S / 2}" y="78" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="52" fill="#ffffff" letter-spacing="3">${text(ORD.faktaRubrik)}</text>`];
  for (let i = 0; i < ORD.rader.length; i++) {
    const [rubrik, under] = ORD.rader[i];
    const y = start + i * radH;
    if (i) svg.push(`<rect x="90" y="${y}" width="${S - 180}" height="2" fill="${LINJE}"/>`);
    // gul nummerruta
    svg.push(`<rect x="90" y="${y + 66}" width="70" height="70" rx="14" fill="${GUL}"/>`);
    svg.push(`<text x="125" y="${y + 115}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="38" fill="#12212b">${i + 1}</text>`);
    svg.push(`<text x="190" y="${y + 98}" font-family="DejaVu Sans" font-weight="bold" font-size="42" fill="${BLA}">${text(rubrik)}</text>`);
    svg.push(`<text x="190" y="${y + 148}" font-family="DejaVu Sans" font-size="29" fill="${GRA}">${text(under)}</text>`);
    // miniatyr till höger, tunn ram så den vita 'contain'-ytan ser avsiktlig ut
    const tl = S - 90 - TW, tt = y + 20;
    const box = Object.values(UTSNITT[i])[0];
    lager.push({ input: await miniatyr(box, i === 5), top: tt, left: tl });
    svg.push(`<rect x="${tl + 1}" y="${tt + 1}" width="${TW - 2}" height="${TH - 2}" rx="17" fill="none" stroke="${LINJE}" stroke-width="2"/>`);
  }
  // ramarna ska ligga ovanpå miniatyrerna → text-svg:n läggs sist
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT}/kattkoja-fakta.jpg`);
  console.log(`✔ ${UT}/kattkoja-fakta.jpg`);
}

/* ---------- 2. färger ---------- */
{
  // Färgproverna är illustrationer av offertens tre färger — inte foton.
  const PROV = ['#8a8f94', '#4f7a3a', '#1e1e1e'];
  const kortW = 400, gap = 80, x0 = (S - (kortW * 3 + gap * 2)) / 2;
  const provTop = 300, provH = 700;
  const svg = [`<rect x="0" y="0" width="${S}" height="120" fill="${BLA}"/>`,
    `<text x="${S / 2}" y="78" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="52" fill="#ffffff" letter-spacing="3">${text(ORD.fargRubrik)}</text>`];
  for (let i = 0; i < 3; i++) {
    const x = x0 + i * (kortW + gap);
    svg.push(`<rect x="${x}" y="${provTop}" width="${kortW}" height="${provH}" rx="28" fill="${PROV[i]}" stroke="#d0d6da" stroke-width="2"/>`);
    svg.push(`<text x="${x + kortW / 2}" y="${provTop + provH + 92}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="46" fill="${BLA}">${text(ORD.farger[i])}</text>`);
  }
  // gul etikett på den grå: det är den som syns på produktbilderna
  const ew = 280, ex = x0 + kortW / 2 - ew / 2, ey = provTop + provH + 130;
  svg.push(`<rect x="${ex}" y="${ey}" width="${ew}" height="58" rx="10" fill="${GUL}"/>`);
  svg.push(`<text x="${ex + ew / 2}" y="${ey + 41}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="28" fill="#12212b" letter-spacing="1">${text(ORD.visas)}</text>`);
  svg.push(`<text x="${S / 2}" y="1440" text-anchor="middle" font-family="DejaVu Sans" font-size="34" fill="${GRA}">${text(ORD.fargFot)}</text>`);
  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 }])
    .jpeg({ quality: 92 }).toFile(`${UT}/kattkoja-farger.jpg`);
  console.log(`✔ ${UT}/kattkoja-farger.jpg`);
}
