// Bilborsten (batch 8, id `bilborste`) — bygger produktbilderna ur leverantörsbilden.
//
// Källbilden (offertens image4.jpg, 800×800) bär tre lager leverantörstext som
// måste bort innan bilden får ligga i butiken:
//   1. rubriken 双刷头拖把灰色 + badgen 小号不锈钢杆 335g (uppe till vänster)
//   2. måttexten 全长100CM längs skaftet + dess måttlinje
//   3. måttexten 25cm nere till vänster + dess måttlinje
//
// Texten går INTE att beskära bort: den ligger diagonalt längs produkten, som i
// sin tur går från nedre vänstra till övre högra hörnet. Lösningen är därför
// deterministisk segmentering i stället för målning: produkten är EN
// sammanhängande icke-vit komponent, och all leverantörstext är egna
// komponenter. Behålls bara produktens komponent försvinner texten utan att en
// enda pixel på produkten rörs. Måttlinjen längs skaftet nuddar produkten i båda
// ändarna och följer med komponenten — den tas bort geometriskt i steg 1b.
//
// LÅSTA FAKTA: temu/batch8/fakta.mjs. Ingen siffra i infografiken får finnas
// någon annanstans. Bilborsten säljs bara i bäverbutiken.se (CWD svarade
// OVERSIZE på Norge) — den norska infografiken byggs ändå så att mappen är
// komplett om beslutet ändras.
//
// Kör:  node temu/batch8/bilder-bilborste.mjs [källbild] [utmapp-sv] [utmapp-no]
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync, existsSync } from 'node:fs';
import { FAKTA } from './fakta.mjs';

const SRC = process.argv[2] || '/tmp/b8/bilder/image4.jpg';
const UT_SV = process.argv[3] || '/tmp/b8/ut/bilborste';
const UT_NO = process.argv[4] || '/tmp/b8/ut-no/bilborste';
mkdirSync(UT_SV, { recursive: true });
mkdirSync(UT_NO, { recursive: true });

const F = FAKTA.bilborste.latt;
const S = 1600;
const BLA = '#0b2a3d', GUL = '#ffd24a', GRA = '#5b6b76';

/* ---------- 1. segmentering: behåll bara produktens komponent ---------- */
const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;

const ickevit = new Uint8Array(W * H);
for (let p = 0; p < W * H; p++) {
  const i = p * C;
  if (!(data[i] > 232 && data[i + 1] > 232 && data[i + 2] > 232)) ickevit[p] = 1;
}

// 8-grannskap, iterativ stack (bilden är liten men rekursion spricker ändå)
const lbl = new Int32Array(W * H).fill(-1);
const storlek = [];
const stack = new Int32Array(W * H);
for (let s = 0; s < W * H; s++) {
  if (!ickevit[s] || lbl[s] !== -1) continue;
  const id = storlek.length; let sp = 0, n = 0;
  stack[sp++] = s; lbl[s] = id;
  while (sp) {
    const q = stack[--sp], qx = q % W, qy = (q - qx) / W; n++;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = qx + dx, ny = qy + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const r = ny * W + nx;
      if (ickevit[r] && lbl[r] === -1) { lbl[r] = id; stack[sp++] = r; }
    }
  }
  storlek.push(n);
}
const produktId = storlek.indexOf(Math.max(...storlek));

// Produktmask = största komponenten, rakt av. (Ett tidigare försök rensade
// smala radlöpor för att bli av med måttlinjen — det åt upp skaftets ljusa
// silverkant och lämnade ett streckat spår längs röret. Måttlinjen tas i stället
// bort geometriskt i steg 1b, och masken får vara orörd.)
const mask = new Uint8Array(W * H);
for (let p = 0; p < W * H; p++) if (lbl[p] === produktId) mask[p] = 1;

// Rensad källa: produktpixlar som de är, allt annat vitt.
const rent = Buffer.alloc(W * H * 3, 255);
for (let p = 0; p < W * H; p++) {
  if (!mask[p]) continue;
  const i = p * C, d = p * 3;
  rent[d] = data[i]; rent[d + 1] = data[i + 1]; rent[d + 2] = data[i + 2];
}

/* ---------- 1b. måttlinjen 全长100CM ---------- */
// Linjen löper från handtagets topp ner till leden och NUDDAR produkten i båda
// ändarna — den följer alltså med produktkomponenten och överlever radfiltret
// där den ligger ovanpå borstkardan och det röda ledhuset. Den är uppmätt i
// källan (mörka pixlar i y=170..250 samt pilspetsen vid leden) och är rak:
//   x = 831.75 − 0.983·y   (kontrollerad mot y=190→645, 210→625, 230→607,
//   250→586 och pilspetsen 600→242, 656→187 — alla inom 2 px).
// Pixlarna inom 3,5 px från linjen ersätts med medianen av omgivningen utanför
// 7 px. På vit botten ger det vitt, på det röda huset rött, på kardan kardafärg
// — ingenting hittas på, och inget av produktens egen form ritas om.
const LIN_A = -0.983, LIN_B = 831.75, LIN_Y0 = 28, LIN_Y1 = 658;
{
  const kopia = Buffer.from(rent);
  const avst = (x, y) => Math.abs(LIN_A * y + LIN_B - x) / Math.sqrt(1 + LIN_A * LIN_A);
  const kanal = [0, 1, 2];
  for (let y = LIN_Y0; y <= LIN_Y1; y++) {
    const cx = Math.round(LIN_A * y + LIN_B);
    for (let x = Math.max(0, cx - 6); x <= Math.min(W - 1, cx + 6); x++) {
      if (avst(x, y) > 3.5) continue;
      for (const c of kanal) {
        const v = [];
        for (let dy = -7; dy <= 7; dy++) for (let dx = -7; dx <= 7; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          if (avst(nx, ny) <= 7) continue;
          v.push(kopia[(ny * W + nx) * 3 + c]);
        }
        if (v.length) { v.sort((a, b) => a - b); rent[(y * W + x) * 3 + c] = v[v.length >> 1]; }
      }
    }
  }
}

// bbox räknas efter linjerensningen — på icke-vita pixlar i den rensade bilden
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (let p = 0; p < W * H; p++) {
  const d = p * 3;
  if (rent[d] > 244 && rent[d + 1] > 244 && rent[d + 2] > 244) continue;
  const px = p % W, py = (p - px) / W;
  if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py;
}
const RENT = await sharp(rent, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
console.log(`produktens bbox i källan: ${x0},${y0} → ${x1},${y1}`);

/** Klipper ut en ruta ur den rensade bilden och lägger den centrerad på vit kvadrat. */
async function påVit(left, top, w, h, ruta = S, fyllnad = 0.92) {
  const bit = await sharp(RENT).extract({ left, top, width: w, height: h }).png().toBuffer();
  const skala = Math.min((ruta * fyllnad) / w, (ruta * fyllnad) / h);
  const nw = Math.round(w * skala), nh = Math.round(h * skala);
  const skalad = await sharp(bit).resize(nw, nh, { kernel: 'lanczos3' }).png().toBuffer();
  return sharp({ create: { width: ruta, height: ruta, channels: 3, background: '#ffffff' } })
    .composite([{ input: skalad, top: Math.round((ruta - nh) / 2), left: Math.round((ruta - nw) / 2) }]);
}

/* ---------- 2. hero: hela produkten centrerad på vit kvadrat ---------- */
{
  const marg = 14;
  const bx = Math.max(0, x0 - marg), by = Math.max(0, y0 - marg);
  const bw = Math.min(W - bx, x1 - bx + marg + 1), bh = Math.min(H - by, y1 - by + marg + 1);
  const sida = Math.max(bw, bh);
  // kvadratiskt utsnitt runt produkten så inget beskärs på diagonalen
  const cx = bx + bw / 2, cy = by + bh / 2;
  const ex = Math.round(Math.max(0, Math.min(W - sida, cx - sida / 2)));
  const ey = Math.round(Math.max(0, Math.min(H - sida, cy - sida / 2)));
  for (const ut of [UT_SV, UT_NO]) {
    await (await påVit(ex, ey, Math.min(sida, W - ex), Math.min(sida, H - ey), S, 0.94))
      .jpeg({ quality: 92 }).toFile(`${ut}/bilborste-hero.jpg`);
  }
  console.log('✔ bilborste-hero.jpg (2 mappar)');
}

/* ---------- 3. detalj: borsthuvudet + den röda leden ---------- */
// Bär tre låsta fakta på en gång: två borsthuvuden, grå mikrofiber, 25 cm brett.
{
  const det = { left: 14, top: 546, width: 320, height: 254 };
  for (const ut of [UT_SV, UT_NO]) {
    await (await påVit(det.left, det.top, det.width, det.height, S, 0.88))
      .jpeg({ quality: 92 }).toFile(`${ut}/bilborste-detalj.jpg`);
  }
  console.log('✔ bilborste-detalj.jpg (2 mappar)');
}

/* ---------- 4. faktabild (sv + no) ---------- */
const ORD = {
  sv: {
    rubrik: 'BILTVÄTTBORSTEN I SIFFROR',
    fot: 'Måtten kommer från leverantörens specifikation.',
    rader: [
      ['100 CM', 'Borstens totala längd', 'hel'],
      ['25 CM', 'Borsthuvudets bredd', 'huvud'],
      ['2 BORSTAR', 'Två huvuden i grå mikrofiber', 'huvud'],
      ['335 G', 'Vikten på hela borsten', 'hel'],
      ['ROSTFRITT STÅL', 'Teleskopskaft i rostfritt stål', 'skaft'],
    ],
  },
  no: {
    rubrik: 'BILVASKEBØRSTEN I TALL',
    fot: 'Målene kommer fra leverandørens spesifikasjon.',
    rader: [
      ['100 CM', 'Børstens totale lengde', 'hel'],
      ['25 CM', 'Bredden på børstehodet', 'huvud'],
      ['2 BØRSTER', 'To hoder i grå mikrofiber', 'huvud'],
      ['335 G', 'Vekten på hele børsten', 'hel'],
      ['RUSTFRITT STÅL', 'Teleskopskaft i rustfritt stål', 'skaft'],
    ],
  },
};

// Kontroll: varje siffra i raderna måste gå att belägga i fakta.mjs.
const belagg = new Set([String(F.totalLangdCm), String(F.borsthuvudCm), String(F.viktG), String(F.borstar)]);
for (const spr of ['sv', 'no']) {
  for (const [r] of ORD[spr].rader) {
    for (const tal of r.match(/\d+/g) || []) {
      if (!belagg.has(tal)) throw new Error(`obelagd siffra i infografiken (${spr}): ${tal}`);
    }
  }
}

// Miniatyrer ur den rensade bilden — utsnitt, inga ritade symboler.
const UTSNITT = {
  hel: { left: 10, top: 16, width: 780, height: 784 },
  huvud: { left: 20, top: 556, width: 300, height: 240 },
  skaft: { left: 352, top: 268, width: 250, height: 196 },
};
const mini = {};
for (const [k, u] of Object.entries(UTSNITT)) {
  mini[k] = await sharp(RENT).extract(u).resize(300, 236, { fit: 'contain', background: '#ffffff', kernel: 'lanczos3' }).png().toBuffer();
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

for (const [spr, ut] of [['sv', UT_SV], ['no', UT_NO]]) {
  const o = ORD[spr];
  const topp = 128, fot = 78;
  const radH = Math.floor((S - topp - fot) / o.rader.length);
  const lager = [];
  const svg = [
    `<rect x="0" y="0" width="${S}" height="${topp}" fill="${BLA}"/>`,
    `<text x="${S / 2}" y="84" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="52" fill="#ffffff" letter-spacing="3">${esc(o.rubrik)}</text>`,
  ];
  for (let g = 0; g < o.rader.length; g++) {
    const [rubrik, under, bild] = o.rader[g];
    const y = topp + g * radH;
    if (g) svg.push(`<rect x="90" y="${y}" width="${S - 180}" height="2" fill="#e4e8ea"/>`);
    // gul etikettruta med det låsta talet, bredden följer textlängden
    const bw = Math.round(34 * rubrik.length + 56);
    svg.push(`<rect x="96" y="${y + 44}" width="${bw}" height="76" rx="12" fill="${GUL}"/>`);
    svg.push(`<text x="${96 + bw / 2}" y="${y + 99}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="46" fill="#12212b">${esc(rubrik)}</text>`);
    svg.push(`<text x="96" y="${y + 166}" font-family="DejaVu Sans" font-size="30" fill="${GRA}">${esc(under)}</text>`);
    lager.push({ input: mini[bild], top: y + Math.round((radH - 236) / 2), left: S - 300 - 96 });
  }
  svg.push(`<text x="${S / 2}" y="${S - 32}" text-anchor="middle" font-family="DejaVu Sans" font-size="27" fill="${GRA}">${esc(o.fot)}</text>`);
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toFile(`${ut}/bilborste-fakta.jpg`);
  console.log(`✔ bilborste-fakta.jpg (${spr})`);
}

/* ---------- 5. AI-referens ---------- */
// Miljöbilden och GIF:en görs med Higgsfield i sessionen, inte här. Den rensade
// heron laddas upp som referens (media_upload → PUT → media_confirm) så att
// AI:n ritar RÄTT produkt: grå dubbelborste, röd led, orange grepp, silverskaft.
// Filen nedan är den som laddas upp.
await sharp(RENT).jpeg({ quality: 96 }).toFile('/tmp/b8/bilborste-ref.jpg');
console.log('✔ /tmp/b8/bilborste-ref.jpg (AI-referens)');

if (!existsSync(`${UT_SV}/bilborste-hero.jpg`)) throw new Error('hero saknas');

/* ---------- 6. miljöbild + GIF (Higgsfield, körs i sessionen) ---------- */
// Dessa två filer går inte att bygga med sharp — de dokumenteras här så att
// nästa session kan göra om dem exakt.
//
// a) Referens: bilborste-ref.jpg laddas upp med media_upload → curl PUT →
//    media_confirm. (Temu-URL saknas för den här produkten, bilden kommer ur
//    offertens inbäddade image4 — därför uppladdning i stället för
//    media_import_url.)
//
// b) Miljöbild: generate_image, model "gpt_image_2", aspect_ratio "1:1",
//    quality "high", resolution "2k", count 2, medias [{role:"image",
//    value:<media_id>}]. Prompten beskriver en svensk villauppfart i tidig höst,
//    en man som tvättar SIDAN på en mörkblå kombi i chesthöjd — aldrig över taket,
//    skaftet är bara 100 cm — och räknar upp produktens delar (orange grepp,
//    silverfärgat teleskoprör med orange krage, rött ledhus, TVÅ runda grå
//    mikrofiberrondeller). Avslutas med "No text, no writing, no logos,
//    no watermarks". Resultatet skalas till 1600×1600 (fit cover) och sparas som
//    bilborste-miljo.jpg i båda mapparna.
//
// c) GIF: miljöbildens resultat-URL importeras med media_import_url och används
//    som start_image i generate_video, model "seedance_2_5", mode
//    "omni_reference", aspect_ratio "1:1", duration 5. Rörelsen är borsten som
//    dras längs den blöta bilsidan med lödder — det produkten faktiskt gör.
//    Får du "preset_recommendation": skicka om med declined_preset_id.
//    Videon blir 960×960, 5,0 s. GIF:en byggs med ffmpeg:
//      ffmpeg -i bilborste.mp4 -vf "fps=10,scale=480:-1:flags=lanczos,
//        palettegen=max_colors=200:stats_mode=diff" pal.png
//      ffmpeg -i bilborste.mp4 -i pal.png -lavfi "fps=10,scale=480:-1:flags=lanczos[x];
//        [x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" -loop 0 ut.gif
//    Utfall 2026-09-11: 50 rutor, 480×480, 2,47 MB (målet är < 4 MB och ≥ 30 rutor).
