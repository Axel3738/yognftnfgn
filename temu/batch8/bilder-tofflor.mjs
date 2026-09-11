// Fodrade utetofflor (TEMU-B8-TOFFLOR) — bygger produktbilderna.
//
// Källor (båda 1200×1200, GRANSKADE):
//   /tmp/b8/t-tofflor.jpg      = svart kamouflage, Temus top_gallery_url
//                                (= https://img.kwcdn.com/product/fancy/cba497b7-8b36-4e62-92a3-aff1c33043fe.jpg)
//   /tmp/b8/bilder/image8.png  = khaki kamouflage
// Ingen av bilderna har leverantörstext, kinesisk text eller vattenstämpel —
// bara produktens egen gjutna "SPORT"-prägling på hälremmen och leverantörens
// gummilogga på remfästet. Det är fysiska detaljer på skon, inte pålagd
// marknadsföringstext, och går inte att beskära bort utan att hälremmen
// (ett av de låsta fakta) försvinner. Utsnitten nedan är ändå valda så att
// präglingen hamnar utanför rutan överallt utom i heron.
//
// ⚠️ LÅST FAKTA (temu/batch8/fakta.mjs): storlek 40–47, färgerna Khaki och
// Svart, fodrad inomhustoffel i foppatoffelmodell med plyschfoder och hälrem,
// kamouflagemönster. INGA mått, ingen vikt, inget material utöver "plysch"
// finns låst — påstå aldrig något annat. Axels besked 2026-09-11: säljs som
// INOMHUStoffel; enda tillåtna utomhusformuleringen är "tål att du går ut och
// hämtar veden".
//
// Kör:
//   node temu/batch8/bilder-tofflor.mjs                 # hero + detalj + fakta (sv & no)
//   node temu/batch8/bilder-tofflor.mjs --miljo <fil>   # normalisera AI-bild → 1600×1600
//   node temu/batch8/bilder-tofflor.mjs --gif <video>   # AI-video → GIF (kräver ffmpeg-static)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync, copyFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const SVART = process.env.TOFFLOR_SVART || '/tmp/b8/t-tofflor.jpg';
const KHAKI = process.env.TOFFLOR_KHAKI || '/tmp/b8/bilder/image8.png';
const UT = { sv: '/tmp/b8/ut/tofflor', no: '/tmp/b8/ut-no/tofflor' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt ur källbilderna (x, y, bredd, höjd i 1200×1200-koordinater)
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.        */
const UTSNITT = {
  hero:    [SVART, [110, 95, 1060, 1050]],   // hela paret, utan korgen och trälisten i vänsterkant
  detalj:  [SVART, [400, 430, 480, 450]],    // plyschfodret + hälremmens vävda band
  paret:   [SVART, [130, 560, 620, 560]],    // båda skornas framdel, fodret syns inuti
  khaki:   [KHAKI, [90, 760, 660, 400]],     // khakiskons sida — andra färgen
  plysch:  [SVART, [140, 420, 330, 400]],    // enbart fodret
  halrem:  [SVART, [560, 430, 330, 380]],    // remmen i vävt band över fodret
  camo:    [SVART, [740, 120, 380, 390]],    // kamouflagetrycket på ovandelen
  sula:    [SVART, [330, 880, 560, 280]],    // den grova sulan mot golvet
};

async function utsnitt(namn) {
  const [fil, [left, top, width, height]] = UTSNITT[namn];
  return sharp(fil).extract({ left, top, width, height }).png().toBuffer();
}

// Skalar in en bild i en ruta och returnerar buffert + verklig storlek.
async function passa(buf, maxW, maxH) {
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer(), w, h };
}

// Lägger en buffert centrerad på vit kvadrat och skriver samma jpeg till båda mapparna.
async function vitKvadrat(buf, maxW, maxH, filnamn) {
  const p = await passa(buf, maxW, maxH);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/${filnamn}`);
  console.log(`✔ ${filnamn} (sv + no)`);
}

/* ---------- 1. hero — hela paret ur den riktiga leverantörsbilden ---------- */
async function hero() {
  await vitKvadrat(await utsnitt('hero'), 1480, 1480, 'tofflor-hero.jpg');
}

/* ---------- 2. detalj — plyschfodret och hälremmen ---------- */
async function detalj() {
  await vitKvadrat(await utsnitt('detalj'), 1400, 1400, 'tofflor-detalj.jpg');
}

/* ---------- 3. faktabild — bara det som står i fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'TOFFLORNA I KORTHET',
    rader: [
      { ruta: '40–47',      titel: 'STORLEKAR',      under: 'Åtta storlekar i samma modell', bild: 'paret' },
      { ruta: '2 FÄRGER',   titel: 'KHAKI OCH SVART', under: 'Båda i kamouflagetryck',        bild: 'khaki' },
      { ruta: 'PLYSCH',     titel: 'FODRET',         under: 'Mjukt plyschfoder på insidan',   bild: 'plysch' },
      { ruta: 'HÄLREM',     titel: 'REM BAKTILL',    under: 'Hälrem i vävt band',             bild: 'halrem' },
      { ruta: 'KAMOUFLAGE', titel: 'MÖNSTRET',       under: 'Tryckt över hela ovandelen',     bild: 'camo' },
      { ruta: 'INOMHUS',    titel: 'SÅ ANVÄNDS DEN', under: 'Tål att du går ut och hämtar veden', bild: 'sula' },
    ],
  },
  no: {
    rubrik: 'TØFLENE I KORTE TREKK',
    rader: [
      { ruta: '40–47',      titel: 'STØRRELSER',     under: 'Åtte størrelser i samme modell', bild: 'paret' },
      { ruta: '2 FARGER',   titel: 'KHAKI OG SVART', under: 'Begge i kamuflasjetrykk',        bild: 'khaki' },
      { ruta: 'PLYSJ',      titel: 'FÔRET',          under: 'Mykt plysjfôr på innsiden',      bild: 'plysch' },
      { ruta: 'HÆLREM',     titel: 'REM BAK',        under: 'Hælrem i vevd bånd',             bild: 'halrem' },
      { ruta: 'KAMUFLASJE', titel: 'MØNSTERET',      under: 'Trykt over hele oversiden',      bild: 'camo' },
      { ruta: 'INNENDØRS',  titel: 'SLIK BRUKES DEN', under: 'Tåler at du går ut og henter veden', bild: 'sula' },
    ],
  },
};

async function fakta(språk) {
  const O = ORD[språk];
  const bandH = 120, radH = Math.floor((S - bandH) / O.rader.length);   // 246 vid sex rader
  const lager = [];
  const svg = [
    `<rect x="0" y="0" width="${S}" height="${bandH}" fill="${BLÅ}"/>`,
    `<text x="${S / 2}" y="78" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="48" fill="#ffffff" letter-spacing="3">${esc(O.rubrik)}</text>`,
  ];
  for (let g = 0; g < O.rader.length; g++) {
    const r = O.rader[g], y = bandH + g * radH;
    if (g) svg.push(`<rect x="90" y="${y}" width="${S - 180}" height="2" fill="#e4e8ea"/>`);
    svg.push(`<text x="96" y="${y + 76}" font-family="DejaVu Sans" font-weight="bold" font-size="38" fill="${BLÅ}" letter-spacing="1">${esc(r.titel)}</text>`);
    svg.push(`<text x="96" y="${y + 116}" font-family="DejaVu Sans" font-size="25" fill="${GRÅ}">${esc(r.under)}</text>`);
    const rw = Math.max(130, r.ruta.length * 21 + 40);
    svg.push(`<rect x="96" y="${y + 140}" width="${rw}" height="52" rx="10" fill="${GUL}"/>`);
    svg.push(`<text x="${96 + rw / 2}" y="${y + 177}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="32" fill="#12212b">${esc(r.ruta)}</text>`);
    const p = await passa(await utsnitt(r.bild), 420, radH - 40);
    lager.push({ input: p.buf, top: y + Math.floor((radH - p.h) / 2), left: 1510 - p.w });
  }
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT[språk]}/tofflor-fakta.jpg`);
  console.log(`✔ tofflor-fakta.jpg (${språk})`);
}

/* ---------- 4. miljöbild — normaliserar en nedladdad AI-bild ---------- */
async function miljo(fil) {
  const jpg = await sharp(fil).resize(S, S, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/tofflor-miljo.jpg`);
  console.log('✔ tofflor-miljo.jpg (sv + no)');
}

/* ---------- 5. GIF ur AI-videon ---------- */
async function gif(video, fps = 10, bredd = 480) {
  const FF = (await import('/tmp/gifjobb/node_modules/ffmpeg-static/index.js')).default;
  const pal = '/tmp/b8/work/tofflor-palett.png';
  const filter = `fps=${fps},scale=${bredd}:-1:flags=lanczos`;
  execFileSync(FF, ['-y', '-v', 'error', '-i', video, '-vf', `${filter},palettegen=max_colors=200:stats_mode=diff`, '-frames:v', '1', '-update', '1', pal]);
  const ut = `${UT.sv}/tofflor-miljo.gif`;
  execFileSync(FF, ['-y', '-v', 'error', '-i', video, '-i', pal, '-lavfi',
    `${filter}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`, '-loop', '0', ut]);
  const m = await sharp(ut, { animated: true }).metadata();
  console.log(`✔ tofflor-miljo.gif — ${m.pages} rutor, ${(statSync(ut).size / 1048576).toFixed(2)} MB`);
  copyFileSync(ut, `${UT.no}/tofflor-miljo.gif`);   // identisk fil, ingen omkodning
}

/* ---------- körning ---------- */
const arg = process.argv.slice(2);
if (arg[0] === '--miljo') await miljo(arg[1]);
else if (arg[0] === '--gif') await gif(arg[1], Number(arg[2] || 10), Number(arg[3] || 480));
else { await hero(); await detalj(); await fakta('sv'); await fakta('no'); }
