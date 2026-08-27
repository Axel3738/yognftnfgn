// Slutbygge, alla sex annonser: kie.ai-scener + Poppins-typografi.
// Ett gemensamt typografisystem => setet hänger ihop, och svenska diakriter blir alltid rätt.
import { sharp, rubrik, pill, stampel, doc, esc, FONT, DEFS } from './layout2.mjs';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./ads-v2/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const S = 1080;
const ROD = '#B01F1F';

async function bygg(bas, w, h, inner, ut) {
  await sharp(bas).resize(w, h, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .composite([{ input: doc(w, h, inner), left: 0, top: 0 }])
    .jpeg({ quality: 94 }).toFile(OUT + ut);
  console.log('✓', ut);
}

/* P1 — två lådor, korall */
{
  const r = rubrik({ text: 'Den vänstra ger du bort.|Den högra blir din.', x: S / 2, y: 112,
    maxBredd: S - 120, maxSize: 66, maxRader: 2, fill: '#2A1410' });
  const p = pill({ cx: S / 2, cy: S - 92, bredd: 700, hojd: 104, text: 'KÖP 1 – FÅ 1 GRATIS' });
  await bygg('kie-out/D1-tva-lador.png', S, S, r.svg + p, 'P1-tva-lador.jpg');
}

/* P2 — fötter + låda */
{
  const st = stampel({ cx: 236, cy: 232, r: 158, rader: ['KÖP 1', 'FÅ 1', 'GRATIS'], bas: 60 });
  const r = rubrik({ text: 'Skämt i lådan. Strumpa på foten.', x: S / 2, y: S - 66,
    maxBredd: S - 130, maxSize: 52, maxRader: 1, fill: '#3A2016', skugga: true });
  await bygg('kie-out/D2-fotter-box.png', S, S, st + r.svg, 'P2-fotter-box.jpg');
}

/* P3 — staplade lådor */
{
  const wm = rubrik({ text: 'SUSHISTRUMPOR', x: S / 2, y: 118, maxBredd: S - 150,
    maxSize: 72, maxRader: 1, fill: '#ffffff', spacing: 1.5 });
  const un = rubrik({ text: 'Tjugo par strumpor i fyra lådor.', x: S / 2, y: 178,
    maxBredd: S - 300, maxSize: 34, maxRader: 1, fill: '#D6ECFB' });
  const p = pill({ cx: S / 2, cy: 300, bredd: 700, hojd: 104, text: 'KÖP 2 – FÅ 2 GRATIS' });
  await bygg('kie-out/D3-staplade-lador.png', S, S, wm.svg + un.svg + p, 'P3-staplade.jpg');
}

/* P4 — svävande låda, orange */
{
  const r = rubrik({ text: 'Ser ut som mat.|Är tio par strumpor.', x: S / 2, y: 108,
    maxBredd: S - 120, maxSize: 66, maxRader: 2, fill: '#2A1410' });
  const p = pill({ cx: S / 2, cy: S - 92, bredd: 700, hojd: 104, text: 'KÖP 1 – FÅ 1 GRATIS' });
  await bygg('kie-out/D4-box-svavande.png', S, S, r.svg + p, 'P4-svavande.jpg');
}

/* P5 — transformationen: banner + delad bild + pil */
{
  const BAN = 196, PH = S - BAN, PW = S / 2;
  const vanster = await sharp('kie-out/L1-tray-bord.png')
    .extract({ left: 60, top: 300, width: 660, height: 1000 })
    .resize(PW, PH, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }).toBuffer();
  const hoger = await sharp('kie-out/R1-box-gra.png')
    .resize(PW, PH, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }).toBuffer();

  const pil = doc(320, 190, `<g transform="rotate(-10 160 95)" filter="url(#pill)">
    <path d="M46 95 L210 95" stroke="#ffffff" stroke-width="40" stroke-linecap="round"/>
    <path d="M46 95 L210 95" stroke="#141414" stroke-width="21" stroke-linecap="round"/>
    <path d="M184 44 L258 95 L184 146 Z" fill="#141414" stroke="#ffffff" stroke-width="13" stroke-linejoin="round"/>
  </g>`);

  const ban = rubrik({ text: 'Sushin är slut ikväll.|Strumporna finns kvar.', x: S / 2, y: 84,
    maxBredd: S - 100, maxSize: 62, maxRader: 2, fill: '#141414' });

  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([
      { input: vanster, left: 0, top: BAN },
      { input: hoger, left: PW, top: BAN },
      { input: pil, left: Math.round(S / 2 - 160), top: Math.round(BAN + PH / 2 - 95) },
      { input: doc(S, S, ban.svg), left: 0, top: 0 },
    ]).jpeg({ quality: 94 }).toFile(OUT + 'P5-transformation.jpg');
  console.log('✓ P5-transformation.jpg');
}

/* P6 — kontrastannonsen, 4:5 */
{
  const W = 1080, H = 1350, BG = '#F0EAE1', INK = '#14100E', MINT = '#79E4A5';
  const LW = 360, LH = 460, LX = 66, LY = 505;
  const RW = 556, RH = 700, RX = 470, RY = 320;

  const vanster = await sharp('kie-out/F-vanliga-strumpor.png')
    .extract({ left: 130, top: 400, width: 700, height: 560 })   // centrerar strumporna
    .resize(LW - 18, LH - 18, { fit: 'cover', kernel: 'lanczos3' }).toBuffer();

  // Rundade hörn + skugga => högerbilden blir ett medvetet bildkort, inte en klumpig ruta
  const mask = Buffer.from(
    `<svg width="${RW}" height="${RH}"><rect width="${RW}" height="${RH}" rx="26" fill="#fff"/></svg>`);
  const hoger = await sharp('kie-out/F-box-glow.png')
    .resize(RW, RH, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();

  const rV = rubrik({ text: 'Detta är en dammsamlare.', x: LX + LW / 2, y: 408,
    maxBredd: LW + 130, maxSize: 36, maxRader: 2, fill: INK });
  const rH = rubrik({ text: 'Detta är en reaktion.', x: RX + RW / 2, y: 258,
    maxBredd: RW + 30, maxSize: 46, maxRader: 2, fill: INK });
  const tag = rubrik({ text: 'Gör present till reaktion.', x: W / 2, y: 1108,
    maxBredd: W - 220, maxSize: 38, maxRader: 1, fill: '#4A4038' });

  const kb = 348, kh = 84, ky = 1152;
  const knapp =
    `<rect x="${W / 2 - kb / 2}" y="${ky}" width="${kb}" height="${kh}" rx="${kh / 2}" fill="${MINT}" filter="url(#pill)"/>` +
    `<text x="${W / 2}" y="${ky + 55}" text-anchor="middle" font-family="${FONT}" font-weight="700" ` +
    `font-size="38" fill="${INK}">${esc('Fixa presenten')}</text>`;
  const wm = `<text x="${W / 2}" y="1306" text-anchor="middle" font-family="${FONT}" font-weight="700" ` +
    `font-size="26" letter-spacing="6" fill="#8A8078">MATSTRUMPOR.SE</text>`;
  const linje = `<line x1="250" y1="1046" x2="830" y2="1046" stroke="#CFC3B6" stroke-width="2"/>`;
  const ram = `<rect x="${LX}" y="${LY}" width="${LW}" height="${LH}" rx="6" fill="#141414"/>`;

  await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
    .composite([
      { input: doc(W, H, ram), left: 0, top: 0 },
      { input: vanster, left: LX + 9, top: LY + 9 },
      { input: hoger, left: RX, top: RY },
      { input: doc(W, H, rV.svg + rH.svg + linje + tag.svg + knapp + wm), left: 0, top: 0 },
    ]).jpeg({ quality: 94 }).toFile(OUT + 'P6-kontrast.jpg');
  console.log('✓ P6-kontrast.jpg');
}
