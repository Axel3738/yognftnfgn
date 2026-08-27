// Bygger alla BOGO-annonser + hund-swipen. Texterna läses ur texts.json.
import { readFileSync, mkdirSync } from 'node:fs';
import { sharp, textBlock, badge, pillBanner, esc } from './layout.mjs';

const T = JSON.parse(readFileSync(new URL('./texts.json', import.meta.url)));
const OUT = new URL('./ads-out/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const S = 1080;
const svgDoc = (w, h, inner) =>
  Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`);

// Lägger textlager ovanpå en färdig basbild
async function overlay(bas, w, h, inner, out) {
  await sharp(bas).resize(w, h, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .composite([{ input: svgDoc(w, h, inner), left: 0, top: 0 }])
    .jpeg({ quality: 92 }).toFile(OUT + out);
  console.log('✓', out);
}

/* ---------- D1: två lådor, korall. Rubrik + underrubrik i toppen ---------- */
{
  const rub = textBlock({ text: T.D1.rubrikBild, x: S / 2, y: 118, maxBredd: S - 130, maxSize: 74, maxRader: 2, fill: '#2B1512' });
  const und = textBlock({ text: T.D1.underrubrik, x: S / 2, y: 118 + rub.hojd + 18, maxBredd: S - 220, maxSize: 38, maxRader: 1, fill: '#5E2E23', weight: 'normal' });
  const b = pillBanner({ cx: S / 2, cy: S - 96, bredd: 720, hojd: 104, text: T.D1.banner, fill: '#B3261E' });
  await overlay('kie-out/D1-tva-lador.png', S, S, rub.svg + und.svg + b, 'D1-tva-lador-bogo.jpg');
}

/* ---------- D2: fötter + box, persika. Badge uppe till vänster ---------- */
{
  const bg = badge({ cx: 250, cy: 235, r: 168, rader: T.D2.badge, fill: '#B3261E', maxSize: 62 });
  const rub = textBlock({ text: T.D2.rubrikBild, x: S / 2, y: S - 74, maxBredd: S - 140, maxSize: 46, maxRader: 1, fill: '#3B2218' });
  await overlay('kie-out/D2-fotter-box.png', S, S, bg + rub.svg, 'D2-fotter-box-bogo.jpg');
}

/* ---------- D3: staplade lådor, blå. Wordmark + erbjudandebanner ---------- */
{
  const wm = textBlock({ text: T.D3.wordmark, x: S / 2, y: 112, maxBredd: S - 150, maxSize: 68, maxRader: 1, fill: '#ffffff' });
  const und = textBlock({ text: T.D3.underrubrik, x: S / 2, y: 178, maxBredd: S - 260, maxSize: 36, maxRader: 1, fill: '#DCEEFB', weight: 'normal' });
  // Bannern ligger i det blå tomrummet ovanför stapeln — täcker inte produkten
  const b = pillBanner({ cx: S / 2, cy: 292, bredd: 800, hojd: 116, text: T.D3.banner, fill: '#B3261E', maxSize: 62 });
  await overlay('kie-out/D3-staplade-lador.png', S, S, wm.svg + und.svg + b, 'D3-staplade-lador-bogo.jpg');
}

/* ---------- D4: svävande box, orange. Rubrik + underrubrik ---------- */
{
  const rub = textBlock({ text: T.D4.rubrikBild, x: S / 2, y: 106, maxBredd: S - 130, maxSize: 72, maxRader: 2, fill: '#2B1512' });
  const und = textBlock({ text: T.D4.underrubrik, x: S / 2, y: 106 + rub.hojd + 16, maxBredd: S - 240, maxSize: 38, maxRader: 1, fill: '#5E2E23', weight: 'normal' });
  const b = pillBanner({ cx: S / 2, cy: S - 92, bredd: 700, hojd: 100, text: T.D4.banner, fill: '#B3261E' });
  await overlay('kie-out/D4-box-svavande.png', S, S, rub.svg + und.svg + b, 'D4-box-svavande-bogo.jpg');
}

/* ---------- C: hund-swipen. Vit banner + delad bild + pil ---------- */
{
  const BAN = 190, PH = S - BAN, PW = S / 2;

  // Vänster: äkta sushi, beskuren runt trayn
  const vanster = await sharp('kie-out/L1-tray-bord.png')
    .extract({ left: 60, top: 300, width: 660, height: 1000 })
    .resize(PW, PH, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }).toBuffer();

  // Höger: boxen + en utrullad strumpa mot grå studio — visar både illusionen och att det ÄR en strumpa
  const hoger = await sharp('kie-out/R1-box-gra.png')
    .resize(PW, PH, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }).toBuffer();

  const arrow = svgDoc(300, 180, `<g transform="rotate(-12 150 90)">
    <path d="M40 90 L200 90" stroke="#ffffff" stroke-width="38" stroke-linecap="round"/>
    <path d="M40 90 L200 90" stroke="#111111" stroke-width="20" stroke-linecap="round"/>
    <path d="M175 40 L248 90 L175 140 Z" fill="#111111" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/></g>`);

  const ban = textBlock({ text: T.C.banner, x: S / 2, y: 86, maxBredd: S - 110, maxSize: 78, maxRader: 2, fill: '#111111' });

  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([
      { input: vanster, left: 0, top: BAN },
      { input: hoger, left: PW, top: BAN },
      { input: arrow, left: Math.round(S / 2 - 150), top: Math.round(BAN + PH / 2 - 90) },
      { input: svgDoc(S, S, ban.svg), left: 0, top: 0 },
    ]).jpeg({ quality: 92 }).toFile(OUT + 'C-sushi-till-strumpor.jpg');
  console.log('✓ C-sushi-till-strumpor.jpg');
}
