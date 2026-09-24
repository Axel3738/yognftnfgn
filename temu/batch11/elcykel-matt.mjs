// Måttguide för elcykelbatteriets vinterskydd — ritad deterministiskt med sharp (SVG), ingen AI.
// Måtten kommer från leverantörens storleksbild (skörd 09: 21.2 in/54 cm × 18 in/45.7 cm, ramomkrets 30–40 cm).
//   node temu/batch11/elcykel-matt.mjs   → <scratch>/galleri/elcykeljacka/matt.jpg + matt-no.jpg
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const sharp = createRequire('/home/user/yognftnfgn/temu/package.json')('sharp');
const UT = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/galleri/elcykeljacka';
const TEXT = {
  sv: { rubrik: 'Passar det mitt batteri?', h: '54 cm', b: '45,7 cm', rad1: 'Utfällt mått', rad2: 'Passar ram eller batteri med 30–40 cm omkrets', rad3: 'Kardborreband på båda sidor · leverantörens mått' },
  no: { rubrik: 'Passer det batteriet mitt?', h: '54 cm', b: '45,7 cm', rad1: 'Utbrettet mål', rad2: 'Passer ramme eller batteri med 30–40 cm omkrets', rad3: 'Borrelås på begge sider · leverandørens mål' },
};
const svg = (t) => `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000" font-family="DejaVu Sans, sans-serif">
  <rect width="1000" height="1000" fill="#ffffff"/>
  <text x="500" y="92" text-anchor="middle" font-size="46" font-weight="bold" fill="#1a1a1a">${t.rubrik}</text>
  <!-- skyddet: svart kardborrekant, orange insida (54 hög × 45,7 bred → 540 × 457) -->
  <rect x="222" y="190" width="80" height="540" rx="10" fill="#111111"/>
  <rect x="698" y="190" width="80" height="540" rx="10" fill="#111111"/>
  <rect x="272" y="170" width="457" height="580" rx="60" fill="#111111"/>
  <rect x="286" y="184" width="429" height="552" rx="52" fill="#f0782a"/>
  <!-- höjdmått -->
  <line x1="150" y1="170" x2="150" y2="750" stroke="#1a1a1a" stroke-width="4"/>
  <polygon points="150,170 138,196 162,196" fill="#1a1a1a"/><polygon points="150,750 138,724 162,724" fill="#1a1a1a"/>
  <line x1="130" y1="170" x2="270" y2="170" stroke="#1a1a1a" stroke-width="2" stroke-dasharray="8 6"/>
  <line x1="130" y1="750" x2="270" y2="750" stroke="#1a1a1a" stroke-width="2" stroke-dasharray="8 6"/>
  <text x="112" y="472" text-anchor="middle" font-size="40" font-weight="bold" fill="#1a1a1a" transform="rotate(-90 112 472)">${t.h}</text>
  <!-- breddmått -->
  <line x1="272" y1="820" x2="729" y2="820" stroke="#1a1a1a" stroke-width="4"/>
  <polygon points="272,820 298,808 298,832" fill="#1a1a1a"/><polygon points="729,820 703,808 703,832" fill="#1a1a1a"/>
  <line x1="272" y1="755" x2="272" y2="840" stroke="#1a1a1a" stroke-width="2" stroke-dasharray="8 6"/>
  <line x1="729" y1="755" x2="729" y2="840" stroke="#1a1a1a" stroke-width="2" stroke-dasharray="8 6"/>
  <text x="500" y="872" text-anchor="middle" font-size="40" font-weight="bold" fill="#1a1a1a">${t.b}</text>
  <text x="500" y="930" text-anchor="middle" font-size="30" fill="#1a1a1a">${t.rad1} · ${t.rad2}</text>
  <text x="500" y="972" text-anchor="middle" font-size="24" fill="#666666">${t.rad3}</text>
</svg>`;
mkdirSync(UT, { recursive: true });
for (const [l, t] of Object.entries(TEXT)) {
  const ut = path.join(UT, l === 'sv' ? 'matt.jpg' : 'matt-no.jpg');
  await sharp(Buffer.from(svg(t))).jpeg({ quality: 92 }).toFile(ut);
  console.log('✔', ut);
}
