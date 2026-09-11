// Sotarset med böjliga stänger (TEMU-B8-SOTARSET) — bygger produktbilderna.
//
// Källa: /tmp/b8/bilder/image3.jpg (800×800, leverantörens collage).
// Bilden är GRANSKAD och innehåller ingen leverantörstext, ingen vattenstämpel
// och ingen kinesisk text — därför beskärs den bara för komposition, inget
// målas över.
//
// ⚠️ LÅST FAKTA (temu/batch8/fakta.mjs): setet har NIO stänger à 410 mm
// (3,69 m räckvidd), ETT borsthuvud på 100 mm med nylonborst och en
// sexkantsadapter. Källbilden visar bara SEX stänger — därför får ingen
// bildtext påstå "nio" bredvid ett utsnitt där stängerna går att räkna.
// Faktabildens rad om nio stänger illustreras med KOPPLINGEN, inte med raden.
//
// Kör:
//   node temu/batch8/bilder-sotarset.mjs                 # hero + detalj + fakta (sv & no)
//   node temu/batch8/bilder-sotarset.mjs --miljo <fil>   # normalisera AI-bild → 1600×1600
//   node temu/batch8/bilder-sotarset.mjs --gif <video>   # AI-video → GIF (kräver ffmpeg-static)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync, copyFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const KÄLLA = process.env.SOTARSET_KALLA || '/tmp/b8/bilder/image3.jpg';
const UT = { sv: '/tmp/b8/ut/sotarset', no: '/tmp/b8/ut-no/sotarset' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt ur källbilden (x, y, bredd, höjd i 800×800-koordinater) --------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.        */
const UTSNITT = {
  koppling:  [612, 612, 188, 188],   // cirkelinsetet: hane + hona, skarven
  stangtopp: [515, 465, 215, 185],   // fyra stångtoppar med kopplingshylsa
  bojd:      [0, 395, 325, 205],     // handen som böjer en stång till en ögla
  borsthuvud:[332, 12, 372, 362],    // hela det svarta borsthuvudet, fritt från panelkanten
  borst:     [332, 175, 183, 170],   // navet: nylonstrån + skaftet som skruvas in i huvudet
  detalj:    [480, 425, 320, 375],   // stångtoppar + skarvcirkeln = detaljbilden
};

async function utsnitt(namn) {
  const [left, top, width, height] = UTSNITT[namn];
  return sharp(KÄLLA).extract({ left, top, width, height }).png().toBuffer();
}

// Skalar in en bild i en ruta och returnerar buffert + verklig storlek.
async function passa(buf, maxW, maxH) {
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer(), w, h };
}

/* ---------- 1. hero — hela den riktiga leverantörsbilden, centrerad ---------- */
async function hero() {
  const bild = await sharp(KÄLLA).resize(1520, 1520, { kernel: 'lanczos3' }).sharpen({ sigma: 0.7 }).png().toBuffer();
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: bild, top: 40, left: 40 }]).jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/sotarset-hero.jpg`);
  console.log('✔ sotarset-hero.jpg (sv + no)');
}

/* ---------- 2. detalj — skarven mellan två stänger ---------- */
async function detalj() {
  const p = await passa(await utsnitt('detalj'), 1400, 1440);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/sotarset-detalj.jpg`);
  console.log('✔ sotarset-detalj.jpg (sv + no)');
}

/* ---------- 3. faktabild — bara siffror ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'SETET I SIFFROR',
    rader: [
      { ruta: '9 ST',   titel: 'STÄNGER I SETET', under: 'Skarvas ihop en och en', bild: 'koppling' },
      { ruta: '41 CM',  titel: 'PER STÅNG',       under: 'Längden på varje enskild stång', bild: 'stangtopp' },
      { ruta: '3,69 M', titel: 'RÄCKVIDD',        under: 'Alla nio stängerna ihopskruvade', bild: 'bojd' },
      { ruta: '100 MM', titel: 'BORSTHUVUD',      under: 'Ett borsthuvud ingår', bild: 'borsthuvud' },
      { ruta: 'NYLON',  titel: 'BORSTEN',         under: 'Borsthuvudets borst är av nylon', bild: 'borst' },
    ],
  },
  no: {
    rubrik: 'SETTET I TALL',
    rader: [
      { ruta: '9 STK',  titel: 'STENGER I SETTET', under: 'Skrus sammen én og én', bild: 'koppling' },
      { ruta: '41 CM',  titel: 'PER STANG',        under: 'Lengden på hver enkelt stang', bild: 'stangtopp' },
      { ruta: '3,69 M', titel: 'REKKEVIDDE',       under: 'Alle ni stengene skrudd sammen', bild: 'bojd' },
      { ruta: '100 MM', titel: 'BØRSTEHODE',       under: 'Ett børstehode følger med', bild: 'borsthuvud' },
      { ruta: 'NYLON',  titel: 'BUSTEN',           under: 'Busten på børstehodet er av nylon', bild: 'borst' },
    ],
  },
};

async function fakta(språk) {
  const O = ORD[språk];
  const bandH = 120, radH = Math.floor((S - bandH) / O.rader.length);   // 296
  const lager = [];
  const svg = [
    `<rect x="0" y="0" width="${S}" height="${bandH}" fill="${BLÅ}"/>`,
    `<text x="${S / 2}" y="78" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="52" fill="#ffffff" letter-spacing="3">${esc(O.rubrik)}</text>`,
  ];
  for (let g = 0; g < O.rader.length; g++) {
    const r = O.rader[g], y = bandH + g * radH;
    if (g) svg.push(`<rect x="90" y="${y}" width="${S - 180}" height="2" fill="#e4e8ea"/>`);
    svg.push(`<text x="96" y="${y + 100}" font-family="DejaVu Sans" font-weight="bold" font-size="42" fill="${BLÅ}" letter-spacing="1">${esc(r.titel)}</text>`);
    svg.push(`<text x="96" y="${y + 144}" font-family="DejaVu Sans" font-size="27" fill="${GRÅ}">${esc(r.under)}</text>`);
    const rw = Math.max(130, r.ruta.length * 23 + 44);
    svg.push(`<rect x="96" y="${y + 170}" width="${rw}" height="58" rx="10" fill="${GUL}"/>`);
    svg.push(`<text x="${96 + rw / 2}" y="${y + 212}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="36" fill="#12212b">${esc(r.ruta)}</text>`);
    const p = await passa(await utsnitt(r.bild), 480, radH - 56);
    lager.push({ input: p.buf, top: y + Math.floor((radH - p.h) / 2), left: 1510 - p.w });
  }
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT[språk]}/sotarset-fakta.jpg`);
  console.log(`✔ sotarset-fakta.jpg (${språk})`);
}

/* ---------- 4. miljöbild — normaliserar en nedladdad AI-bild ---------- */
async function miljo(fil) {
  const jpg = await sharp(fil).resize(S, S, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/sotarset-miljo.jpg`);
  console.log('✔ sotarset-miljo.jpg (sv + no)');
}

/* ---------- 5. GIF ur AI-videon ---------- */
async function gif(video, fps = 10, bredd = 480) {
  const FF = (await import('/tmp/gifjobb/node_modules/ffmpeg-static/index.js')).default;
  const pal = '/tmp/b8/work/sotarset-palett.png';
  const filter = `fps=${fps},scale=${bredd}:-1:flags=lanczos`;
  execFileSync(FF, ['-y', '-v', 'error', '-i', video, '-vf', `${filter},palettegen=max_colors=200:stats_mode=diff`, '-frames:v', '1', '-update', '1', pal]);
  const ut = `${UT.sv}/sotarset-miljo.gif`;
  execFileSync(FF, ['-y', '-v', 'error', '-i', video, '-i', pal, '-lavfi',
    `${filter}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`, '-loop', '0', ut]);
  const m = await sharp(ut, { animated: true }).metadata();
  console.log(`✔ sotarset-miljo.gif — ${m.pages} rutor, ${(statSync(ut).size / 1048576).toFixed(2)} MB`);
  copyFileSync(ut, `${UT.no}/sotarset-miljo.gif`);   // identisk fil, ingen omkodning
}

/* ---------- körning ---------- */
const arg = process.argv.slice(2);
if (arg[0] === '--miljo') await miljo(arg[1]);
else if (arg[0] === '--gif') await gif(arg[1], Number(arg[2] || 10), Number(arg[3] || 480));
else { await hero(); await detalj(); await fakta('sv'); await fakta('no'); }
