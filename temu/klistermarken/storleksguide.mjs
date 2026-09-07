// Bygger lokaliserade storleksguider ur den engelska originalbilden.
// Textrutorna målas över med bakgrundsfärgen och ny text ritas som skarp SVG.
import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
const SRC = '/tmp/fix/st/04.img';
const BG = '#fdf8e7';
const F = 'DejaVu Sans';

// Rutor att måla över, i originalets 2000×2000-koordinater
const RUTOR = [
  [770, 60, 470, 90],    // Finished Size
  [230, 255, 450, 95],   // actual size
  [280, 395, 340, 70],   // 16cm/6.3in
  [190, 490, 90, 370],   // 19cm/7.48in (lodrätt)
  [320, 1080, 1370, 95], // Received Size: …
  [1560, 1340, 100, 310],// 20cm/7.9in (lodrätt, höger)
  [1160, 1805, 300, 70], // 20cm/7.9in (nedre)
  [1400, 1870, 400, 80], // 1set = 4sheets
];

const T = {
  sv: { rubrik: 'Färdig storlek', verklig: 'verklig storlek', b: '16 cm', h: '19 cm', far: 'Du får: 20 × 20 cm × 4 ark', sida: '20 cm', botten: '20 cm', set: '1 set = 4 ark' },
  no: { rubrik: 'Ferdig størrelse', verklig: 'faktisk størrelse', b: '16 cm', h: '19 cm', far: 'Du får: 20 × 20 cm × 4 ark', sida: '20 cm', botten: '20 cm', set: '1 sett = 4 ark' },
  dk: { rubrik: 'Færdig størrelse', verklig: 'faktisk størrelse', b: '16 cm', h: '19 cm', far: 'Du får: 20 × 20 cm × 4 ark', sida: '20 cm', botten: '20 cm', set: '1 sæt = 4 ark' },
  fi: { rubrik: 'Valmis koko', verklig: 'todellinen koko', b: '16 cm', h: '19 cm', far: 'Saat: 20 × 20 cm × 4 arkkia', sida: '20 cm', botten: '20 cm', set: '1 sarja = 4 arkkia' },
  uk: { rubrik: 'Finished size', verklig: 'actual size', b: '16 cm / 6.3 in', h: '19 cm / 7.5 in', far: 'You receive: 20 × 20 cm (7.9 × 7.9 in) × 4 sheets', sida: '20 cm / 7.9 in', botten: '20 cm / 7.9 in', set: '1 set = 4 sheets' },
};

const txt = (x, y, s, storlek, { anchor = 'middle', vikt = 'bold', rot = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${F}" font-size="${storlek}" font-weight="${vikt}" fill="#1a1a1a"
     text-anchor="${anchor}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${s}</text>`;

for (const [land, t] of Object.entries(T)) {
  const maskar = RUTOR.map(([l, o, b, h]) => ({
    input: { create: { width: b, height: h, channels: 3, background: BG } }, left: l, top: o,
  }));
  const rensad = await sharp(SRC).composite(maskar).png().toBuffer();
  const svg = `<svg width="2000" height="2000" xmlns="http://www.w3.org/2000/svg">
    ${txt(1005, 128, t.rubrik, 62)}
    ${txt(240, 328, t.verklig, 52, { anchor: 'start' })}
    ${txt(450, 452, t.b, 44)}
    ${txt(232, 675, t.h, 44, { rot: -90 })}
    ${txt(1005, 1155, t.far, 54)}
    ${txt(1610, 1495, t.sida, 42, { rot: -90 })}
    ${txt(1310, 1862, t.botten, 42)}
    ${txt(1600, 1932, t.set, 46)}
  </svg>`;
  const ut = await sharp(rensad).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).jpeg({ quality: 92 }).toBuffer();
  const { writeFileSync } = await import('node:fs');
  writeFileSync(`/tmp/fix/stickers/storlek-${land}.jpg`, ut);
}
console.log('klart — 5 storleksguider');
