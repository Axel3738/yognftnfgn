// Offert 4 (2026-08-25): språkversioner av galleriets textbärande bilder.
// Sharp-metoden: originalfotot behålls, textytorna täcks och ersätts med skarp
// vektortext. Måttbilder utan ord (bara cm) byggs EN gång — språkneutrala för
// sv/no/da/fi. UK använder de engelska originalen (tum-angivelser).
//
//   node offert4.mjs            # genererar allt till /tmp/fix/offert4/klart/
//
// Källbilder: /tmp/fix/offert4/<produkt>/<fil> (nedladdade från Drive-batchen).

import sharp from 'sharp';
import fs from 'node:fs';

const BAS = '/tmp/fix/offert4';
const UT = `${BAS}/klart`;
fs.mkdirSync(UT, { recursive: true });

const svg = (w, h, inner) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${inner}</svg>`);

const text = (x, y, str, size, { vikt = 'bold', fill = '#111', ankare = 'middle', rot = null, familj = 'DejaVu Sans, sans-serif' } = {}) =>
  `<text x="${x}" y="${y}" font-family="${familj}" font-size="${size}" font-weight="${vikt}" fill="${fill}" text-anchor="${ankare}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${str}</text>`;

const rekt = (x, y, w, h, fill, rx = 0, opacity = 1) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}" opacity="${opacity}"/>`;

/** Pil med huvuden i båda ändar. */
const pil = (x1, y1, x2, y2, farg = '#111', b = 3) => {
  const hode = (x, y, vx, vy) => {
    const l = Math.hypot(vx, vy); vx /= l; vy /= l;
    const px = -vy, py = vx, s = 9;
    return `<polygon points="${x},${y} ${x - vx * s * 1.8 + px * s},${y - vy * s * 1.8 + py * s} ${x - vx * s * 1.8 - px * s},${y - vy * s * 1.8 - py * s}" fill="${farg}"/>`;
  };
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${farg}" stroke-width="${b}"/>` +
    hode(x1, y1, x1 - x2, y1 - y2) + hode(x2, y2, x2 - x1, y2 - y1);
};

async function bygg(kalla, mal, lager) {
  const bild = sharp(`${BAS}/${kalla}`);
  const { width: w, height: h } = await bild.metadata();
  await bild.composite([{ input: svg(w, h, lager(w, h)) }]).jpeg({ quality: 92 }).toFile(`${UT}/${mal}`);
  console.log(mal);
}

const SPRAK = {
  sv: { fore: 'Före', efter: 'Efter', vattentat: 'VATTENTÄT', rubrikMatt: 'Mått &amp; material',
        omkrets: 'Omkrets 43 cm', material: 'Material: 100 % polyester', vuxen: 'Vuxen: höjd 44 cm × omkrets 43 cm',
        tejp: ['Djungel', 'ACU', 'Snö', 'Öken'],
        tryckH: 'Tryckt design – inte 3D-textur', tryckP: 'Mönstret är tryckt platt i tyget',
        andas: 'Andas och leder bort fukt', spanne: 'Justerbart spänne under foten', forefterPenna: 'Före · Efter' },
  no: { fore: 'Før', efter: 'Etter', vattentat: 'VANNTETT', rubrikMatt: 'Mål &amp; materiale',
        omkrets: 'Omkrets 43 cm', material: 'Materiale: 100 % polyester', vuxen: 'Voksen: høyde 44 cm × omkrets 43 cm',
        tejp: ['Jungel', 'ACU', 'Snø', 'Ørken'],
        tryckH: 'Trykt design – ikke 3D-tekstur', tryckP: 'Mønsteret er trykt flatt i stoffet',
        andas: 'Puster og leder bort fukt', spanne: 'Justerbar spenne under foten', forefterPenna: 'Før · Etter' },
  da: { fore: 'Før', efter: 'Efter', vattentat: 'VANDTÆT', rubrikMatt: 'Mål &amp; materiale',
        omkrets: 'Omkreds 43 cm', material: 'Materiale: 100 % polyester', vuxen: 'Voksen: højde 44 cm × omkreds 43 cm',
        tejp: ['Jungle', 'ACU', 'Sne', 'Ørken'],
        tryckH: 'Trykt design – ikke 3D-tekstur', tryckP: 'Mønstret er trykt fladt i stoffet',
        andas: 'Åndbart og fugttransporterende', spanne: 'Justerbart spænde under foden', forefterPenna: 'Før · Efter' },
  fi: { fore: 'Ennen', efter: 'Jälkeen', vattentat: 'VEDENPITÄVÄ', rubrikMatt: 'Mitat &amp; materiaali',
        omkrets: 'Ympärys 43 cm', material: 'Materiaali: 100 % polyesteri', vuxen: 'Aikuinen: korkeus 44 cm × ympärys 43 cm',
        tejp: ['Viidakko', 'ACU', 'Lumi', 'Aavikko'],
        tryckH: 'Painettu kuosi – ei 3D-pintaa', tryckP: 'Kuvio on painettu kankaaseen sileänä',
        andas: 'Hengittävä ja kosteutta siirtävä', spanne: 'Säädettävä solki jalan alla', forefterPenna: 'Ennen · Jälkeen' },
};

// ── Språkneutrala måttbilder (en version för sv/no/da/fi) ──────────────────

// Tanköverdraget: täck tum-etiketterna och gallon-texten, rita rena cm-mått.
await bygg('tankoverdrag/tankoverdrag-03.jpg', 'matt-tankoverdrag.jpg', () =>
  rekt(40, 225, 100, 375, '#fff') +           // vänster måttext
  rekt(95, 590, 320, 165, '#fff') +           // "120cm/47.24in"
  rekt(400, 595, 320, 140, '#fff') +          // "100cm/39.37in"
  rekt(570, 190, 200, 70, '#fff') +           // "275 Gallon (1000L)"
  pil(112, 250, 112, 575) + text(88, 420, '116 cm', 30, { rot: -90 }) +
  pil(135, 630, 385, 712) + text(255, 700, '120 cm', 30, { rot: 18 }) +
  pil(420, 712, 665, 632) + text(545, 702, '100 cm', 30, { rot: -18 }) +
  text(668, 232, '1000 L IBC', 26)
);

// Jättefotbollen: vit pill över tum-texten, egen pil i samma lägen.
await bygg('jattefotboll/jattefotboll-02.jpeg', 'matt-jattefotboll.jpg', () =>
  rekt(628, 295, 96, 310, '#fff', 18) +
  pil(655, 175, 655, 722) + text(684, 450, '60 cm', 34, { rot: -90 })
);

// Gravstenspennan: täck vänster + nedre måttext, egna etiketter (kommatecken).
await bygg('gravstenspenna/gravstenspenna-08.jpeg', 'matt-gravstenspenna.jpg', () =>
  rekt(0, 320, 132, 110, '#fff') +
  rekt(150, 665, 170, 100, '#fff') +
  text(62, 385, '14,3 cm', 28, { ankare: 'middle' }) +
  text(228, 706, 'Ø 1,4 cm', 24, { ankare: 'middle' })
);

// Kamouflagetejpen: täck båda tum-texterna, egna rena mått.
await bygg('kamouflagetejp/kamouflagetejp-05.jpg', 'matt-kamouflagetejp.jpg', () =>
  rekt(0, 30, 125, 320, '#f5f3f0') +
  rekt(125, 620, 525, 175, '#f5f3f0') +
  text(56, 210, '5 cm', 30, { rot: -56 }) +
  text(385, 720, '450 cm', 44, { rot: -12 })
);

// ── Språkspecifika bilder ──────────────────────────────────────────────────

for (const [sprak, t] of Object.entries(SPRAK)) {
  // Tanköverdraget före/efter: nya pills exakt över originalens.
  await bygg('tankoverdrag/tankoverdrag-02.jpg', `forefter-tankoverdrag-${sprak}.jpg`, () =>
    rekt(470, 172, 235, 55, '#fff', 10) + text(587, 209, t.fore, 30) +
    rekt(470, 567, 235, 62, '#fff', 10) + text(587, 608, t.efter, 34)
  );

  // Gravstenspennan: mörkt band nertill med översatt VATTENTÄT.
  await bygg('gravstenspenna/gravstenspenna-01.jpeg', `vattentat-gravstenspenna-${sprak}.jpg`, (w, h) =>
    rekt(0, h - 120, w, 120, '#0c0c0c') +
    text(w / 2, h - 45, t.vattentat, 44, { fill: '#fff' })
  );

  // Benskydden: täck all engelsk text, rita om måtten + materialraderna.
  await bygg('benskydd/benskydd-03.jpg', `matt-benskydd-${sprak}.jpg`, (w) =>
    rekt(0, 0, w, 90, '#fff') +
    rekt(620, 140, 180, 320, '#fff') +
    rekt(0, 595, w, 205, '#fff') +
    text(400, 40, t.rubrikMatt, 34) +
    text(400, 78, t.omkrets, 24, { vikt: 'normal' }) +
    pil(672, 160, 672, 440) + text(700, 300, '44 cm', 26, { rot: -90 }) +
    `<line x1="40" y1="640" x2="760" y2="640" stroke="#999" stroke-width="2"/>` +
    text(400, 685, t.material, 25, { vikt: 'normal' }) +
    text(400, 735, t.vuxen, 25, { vikt: 'normal' }) +
    `<line x1="40" y1="765" x2="760" y2="765" stroke="#999" stroke-width="2"/>`
  );

  // Benskydden: detaljbildernas engelska rubriker ersätts.
  await bygg('benskydd/benskydd-04.jpeg', `karborre-benskydd-${sprak}.jpg`, (w) =>
    rekt(0, 0, w, 100, '#fff') +
    text(w / 2, 62, t.andas, 28)
  );
  await bygg('benskydd/benskydd-05.jpeg', `spanne-benskydd-${sprak}.jpg`, (w) =>
    rekt(0, 0, w, 100, '#fff') +
    text(w / 2, 62, t.spanne, 28)
  );

  // Gravstenspennan: före/efter-bildens svarta toppbanner ersätts.
  await bygg('gravstenspenna/gravstenspenna-02.jpeg', `forefter-gravstenspenna-${sprak}.jpg`, (w) =>
    rekt(0, 0, w, 150, '#111') +
    text(w / 2, 92, t.forefterPenna, 40, { fill: '#fff' })
  );

  // Tejpens fyra mönsterbilder: täck engelska etiketten, egen etikett.
  const monster = [
    ['kamouflagetejp/kamouflagetejp-01.jpg', 0], // Jungle
    ['kamouflagetejp/kamouflagetejp-02.jpg', 1], // ACU
    ['kamouflagetejp/kamouflagetejp-03.jpg', 2], // Snow
    ['kamouflagetejp/kamouflagetejp-07.jpg', 3], // Desert
  ];
  for (const [fil, idx] of monster) {
    await bygg(fil, `tejp-monster${idx + 1}-${sprak}.jpg`, (w) => {
      const desert = idx === 3;
      const tackH = desert ? Math.round(w * 0.14) : Math.round(w * 0.075);
      return rekt(0, 0, Math.round(w * 0.62), tackH, '#fff') +
        text(20, Math.round(tackH * 0.62), t.tejp[idx], Math.round(w * 0.042), { ankare: 'start' });
    });
  }

  // Badshortsen: ren "tryckt design"-banner i samma stil som originalets chip.
  const W = 800, H = 800;
  const banner = svg(W, H,
    rekt(0, 0, W, H, '#e9e9e9') +
    rekt(55, 285, 690, 230, '#111', 26) +
    text(W / 2, 385, t.tryckH, 34, { fill: '#fff' }) +
    text(W / 2, 448, t.tryckP, 26, { fill: '#cfcfcf', vikt: 'normal' })
  );
  await sharp(banner).jpeg({ quality: 92 }).toFile(`${UT}/tryck-badshorts-${sprak}.jpg`);
  console.log(`tryck-badshorts-${sprak}.jpg`);
}

console.log('\nKlart →', UT);
