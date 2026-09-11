// Solcellslampa med rörelsesensor (id `solcellslampa`) — bygger galleribilderna
// ur leverantörsbilden.
//
// Källan (/tmp/b8/t-lampa.jpeg, 1200×1200 — Temus top_gallery_url) är en ren
// studiobild på VIT botten UTAN text, utan vattenstämpel och utan
// marknadsföringsgrafik. Den visar däremot TVÅ lampor ovanpå varandra och vi
// säljer EN (se fakta.mjs: "beskär till en enhet"), så allt här utgår från den
// ÖVRE lampan. Pixelprofil (gråvärde < 205) på källan ger:
//     radsegment  [65–605]  (övre lampan) och [629–1169] (den nedre)
//     kolsegment  [102–1117]
// Ingen pixel målas över — den nedre lampan hamnar helt utanför varje ram.
//
// ⛔ /tmp/b8/bilder/image7.png får INTE användas: den visar 74-LED-varianten
//    och dess mått. Den här produkten är 210-LED-versionen.
//
// Siffrorna i infografiken kommer UTESLUTANDE ur temu/batch8/fakta.mjs
// (210 lysdioder, 1200 mAh, 3 huvuden, rörelsesensor, solcellsdrift).
//
// Kör:  node temu/batch8/bilder-solcellslampa.mjs [källbild] [ut-sv] [ut-no]
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';
import { FAKTA } from './fakta.mjs';

const SRC = process.argv[2] || '/tmp/b8/t-lampa.jpeg';
const UT_SV = process.argv[3] || '/tmp/b8/ut/solcellslampa';
const UT_NO = process.argv[4] || '/tmp/b8/ut-no/solcellslampa';
mkdirSync(UT_SV, { recursive: true });
mkdirSync(UT_NO, { recursive: true });

const F = FAKTA.solcellslampa.latt;
const BLA = '#0b2a3d', GUL = '#ffd24a', GRA = '#5b6b76', SVART = '#12212b';
const S = 1600;

/* ---------- 1. utsnitt ur källbilden (alla ur den ÖVRE lampan) ----------
   Den övre lampan ligger y 65–605, x 102–1117. Varje ruta nedan slutar långt
   ovanför y 629 där den nedre lampan börjar. */
const RUTA = {
  // hela enheten med liten luft runt om — blir hero
  hel: { left: 82, top: 45, width: 1056, height: 580 },
  // mitthuvudet med sensorkupan under — blir detalj
  sensor: { left: 350, top: 230, width: 470, height: 380 },
  // sensorkupan i närbild
  sensorNara: { left: 460, top: 450, width: 250, height: 165 },
  // solcellspanelen ovanpå lampan
  panel: { left: 345, top: 45, width: 540, height: 190 },
  // ren närbild på diodrutan, helt innanför mitthuvudets vita ljusyta
  // (ytan spänner x 409–741, y 277–488 i källan — ingen svart ram med)
  led: { left: 440, top: 300, width: 270, height: 160 },
  // ett av sidohuvudena
  sida: { left: 780, top: 255, width: 340, height: 290 },
};

const skar = (r) => sharp(SRC).extract(r).png().toBuffer();

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

/* ---------- 3. hero: EN lampa, centrerad på vit kvadrat, ingen text ---------- */
async function hero(fil) {
  const p = await passa(await skar(RUTA.hel), 1400, 1180);
  await duk().composite([{
    input: p.buf, left: Math.round((S - p.w) / 2), top: Math.round((S - p.h) / 2),
  }]).jpeg({ quality: 92 }).toFile(fil);
  console.log('✔', fil);
}

/* ---------- 4. detalj: mitthuvudet + rörelsesensorn ---------- */
async function detalj(fil) {
  const p = await passa(await skar(RUTA.sensor), 1240, 1240);
  await duk().composite([{
    input: p.buf, left: Math.round((S - p.w) / 2), top: Math.round((S - p.h) / 2),
  }]).jpeg({ quality: 92 }).toFile(fil);
  console.log('✔', fil);
}

/* ---------- 5. infografik ----------
   Varje rad: gul etikettruta med siffran, fet rubrik, grå undertext och ett
   utsnitt ur den riktiga bilden till höger. Allt hämtas ur FAKTA — inga mått,
   inga lumen, ingen vattentäthet, ingen batteritid och ingen räckvidd, för
   inget av det står i faktalistan. */
const ORD = {
  sv: {
    rubrik: 'SOLCELLSLAMPA – SÅ ÄR DEN BYGGD',
    rader: [
      [`${F.lysdioder} ST`, 'Lysdioder', 'Fördelade över lampans tre huvuden', 'led'],
      [`${F.huvuden} ST`, 'Ljushuvuden', 'Ett mitthuvud och två sidohuvuden', 'sida'],
      ['SENSOR', 'Rörelsesensor', 'Kupan sitter under mitthuvudet', 'sensorNara'],
      ['SOL', 'Solcellsdrift', 'Panelen sitter ovanpå lampan', 'panel'],
      [`${F.batteriMah} MAH`, 'Inbyggt batteri', 'Laddas av solcellspanelen', 'hel'],
    ],
  },
  no: {
    rubrik: 'SOLCELLELAMPE – SLIK ER DEN BYGD',
    rader: [
      [`${F.lysdioder} STK`, 'Lysdioder', 'Fordelt over lampens tre hoder', 'led'],
      [`${F.huvuden} STK`, 'Lyshoder', 'Ett midthode og to sidehoder', 'sida'],
      ['SENSOR', 'Bevegelsessensor', 'Kuppelen sitter under midthodet', 'sensorNara'],
      ['SOL', 'Solcelledrift', 'Panelet sitter oppå lampen', 'panel'],
      [`${F.batteriMah} MAH`, 'Innebygd batteri', 'Lades av solcellepanelet', 'hel'],
    ],
  },
};

async function fakta(sprak, fil) {
  const o = ORD[sprak];
  const rader = o.rader, radH = Math.floor((S - 120) / rader.length);   // 296 px
  const lager = [], svg = [
    `<rect x="0" y="0" width="${S}" height="120" fill="${BLA}"/>`,
    `<text x="${S / 2}" y="78" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="46" fill="#ffffff" letter-spacing="2">${txt(o.rubrik)}</text>`,
  ];
  // alla etikettrutor får samma bredd som den längsta texten kräver — då står
  // rubrikerna i linje och ingen text klipps
  const bw = Math.max(...rader.map(([e]) => Math.round(e.length * 25) + 44), 150);
  for (let g = 0; g < rader.length; g++) {
    const [etikett, rubrik, under, bild] = rader[g];
    const y = 120 + g * radH;
    if (g) svg.push(`<rect x="80" y="${y}" width="${S - 160}" height="2" fill="#e4e8ea"/>`);
    svg.push(`<rect x="84" y="${y + 112}" width="${bw}" height="72" rx="12" fill="${GUL}"/>`);
    svg.push(`<text x="${84 + bw / 2}" y="${y + 163}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="38" fill="${SVART}">${txt(etikett)}</text>`);
    const tx = 84 + bw + 40;
    svg.push(`<text x="${tx}" y="${y + 138}" font-family="DejaVu Sans" font-weight="bold" font-size="42" fill="${BLA}">${txt(rubrik)}</text>`);
    svg.push(`<text x="${tx}" y="${y + 188}" font-family="DejaVu Sans" font-size="26" fill="${GRA}">${txt(under)}</text>`);
    const p = await passa(await skar(RUTA[bild]), 230, radH - 64);
    lager.push({ input: p.buf, top: y + Math.round((radH - p.h) / 2), left: 1300 + Math.round((230 - p.w) / 2) });
  }
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await duk().composite(lager).jpeg({ quality: 92 }).toFile(fil);
  console.log('✔', fil);
}

/* ---------- 6. kör ---------- */
for (const ut of [UT_SV, UT_NO]) {
  await hero(`${ut}/solcellslampa-hero.jpg`);
  await detalj(`${ut}/solcellslampa-detalj.jpg`);
}
await fakta('sv', `${UT_SV}/solcellslampa-fakta.jpg`);
await fakta('no', `${UT_NO}/solcellslampa-fakta.jpg`);

// Referensbild för Higgsfield (en enda lampa, ren vit botten).
await hero('/tmp/b8/solcellslampa-ref.jpg');

/* ---------- 7. miljöbild + GIF (Higgsfield, körs utanför det här skriptet) ----
   Miljöbilden och GIF:en är AI-genererade och byggs inte av sharp. Stegen,
   för att kunna göra om dem:

   1. media_import_url på Temus egen produktbild (referens, riktig produkt):
        https://img.kwcdn.com/product/open/8069cf640477435a802cca0f09174cb7-goods.jpeg
   2. generate_image  model "gpt_image_2", medias [{role:"image", value:<media_id>}],
      aspect_ratio "1:1", quality "high", resolution "2k", count 2.
      Prompt: svensk villa/garage i dagsljus, lampan monterad på fasaden,
      fotorealistiskt, ingen text, inga logotyper. Bästa varianten sparas som
      solcellslampa-miljo.jpg (1600×1600, q92) i BÅDA språkmapparna.
   3. Samma prompt fast NATT och lampan SLÄCKT → startbild till videon.
   4. generate_video model "seedance_2_5", mode "omni_reference", duration 5,
      aspect_ratio "1:1", medias [{role:"start_image", value:<media_id av nattbilden>}].
      Rörelsen: någon går uppför uppfarten i mörkret och lampan tänds. Det är
      produktens faktiska funktion (rörelsesensor) — inget påhittat.
   5. GIF ur mp4:an med ffmpeg (2,5 MB, 50 rutor, 480×480):
        ffmpeg -i lampa.mp4 -vf "fps=10,scale=480:-1:flags=lanczos,\
          palettegen=max_colors=200:stats_mode=diff" -frames:v 1 palett.png
        ffmpeg -i lampa.mp4 -i palett.png -lavfi "fps=10,scale=480:-1:flags=lanczos[x];\
          [x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" \
          -loop 0 solcellslampa-miljo.gif                                      */
