#!/usr/bin/env node
// bilder-golf-1.mjs — städar adventlane-golf-1.png (golfkalendern)
//
// KÄLLBILD: <SCRATCH>/advent/bilder/adventlane-golf-1.png (509 × 487)
//           Amazon-skärmdump rippad från adventlane.se. Originalet sparas som
//           adventlane-golf-1.png.original innan något skrivs över.
//
// VAD SOM TAS BORT (bara Amazons gränssnitt, inget av produkten):
//   1. Miniatyrraden i vänsterkanten — kolumn x=0..1 är högerkanten av Amazons
//      bildgalleri (blå markerad ruta överst, sedan en stapel miniatyrer).
//      Beskärs bort; kolumn 2..9 är redan ren vit bakgrund.
//   2. Hjärt-ikonen (spara-till-lista): vit cirkel, mätt x 453..487, y 5..38.
//   3. Dela-ikonen: vit cirkel, mätt x 452..485, y 50..83.
//   4. Sifferfragmentet x 448..451, y 57..67 — stumpen av en luckesiffra som
//      dela-ikonen redan hade ätit upp, och en lös guldprick x 468..475,
//      y 43..49 i springan mellan ikonerna. Lämnas de kvar ser de ut som smuts.
//
// VARFÖR IKONERNA INTE BESKÄRS BORT: de ligger mitt på produkten, på askens övre
// högra hörn. En beskärning vid x=452 skulle kapa askens högerkant, bollhållaren
// och peggarna. I stället fylls ytan igen — se metoden nedan. Ingen vit låda,
// ingen AI, inget påhittat motiv.
//
// METOD (två delar, för att ytan bakom ikonerna är två olika saker):
//   a) Askens lucksida (x ≤ 483) är platt. Uppmätt över hela panelen är den
//      (23, 69, 37) oavsett höjd — fyra höjdband gav samma median ±1 — och från
//      x≈476 tar askens mörkare högersida vid, (6, 56, 28). Hålet fylls därför
//      med kolumnens egen median plus en kornighet i samma amplitud som
//      kartongen runt omkring. Första försöket var Laplace-diffusion från hålets
//      rand; det blev en blek smet, eftersom guldgranen och ikonernas ljusa kant
//      ligger i randen och blöder in.
//   b) Askens högerkant (x 484..492) är en mjuk kant som vandrar ~1 px åt höger
//      per 40 rader: mörk kolumn på x=485 vid y≈6, 486 vid y≈45, 487 vid y≈85.
//      Den går inte att gissa fram med en flat median — den interpoleras rad för
//      rad mellan de närmaste RENA raderna ovanför och nedanför varje ikon
//      (y=10 → 34 och y=56 → 78). Då vandrar kanten vidare precis som den gör i
//      originalet i stället för att få hack där ikonen skar igenom den.
//
// VAD SOM MEDVETET STÅR KVAR: askens eget tryck — "GOLF", "ADVENT CALENDAR",
// "Merry Christmas", "24 Days", "Merry Christmas Happily Golf" längs sidan, alla
// luckesiffror och guldgranen — samt samtliga golftillbehör. Så ser varan ut;
// att måla bort det vore att ljuga om produkten.
//
// UTDATA: skriver över adventlane-golf-1.png, uppskalad till 800 px kortsida.

import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const MAPP = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/advent/bilder';
const FIL = `${MAPP}/adventlane-golf-1.png`;
const ORIGINAL = `${FIL}.original`;

// --- 1. spara originalet en gång -------------------------------------------
if (!existsSync(ORIGINAL)) writeFileSync(ORIGINAL, readFileSync(FIL));

const { data: rå, info } = await sharp(ORIGINAL)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const B = info.width;
const H = info.height;
const K = info.channels; // 4

const bild = new Float32Array(B * H * 3); // arbetskopia
const källa = new Float32Array(B * H * 3); // orörd, för kantinterpolationen
for (let i = 0, j = 0; i < B * H; i++, j += K) {
  for (let k = 0; k < 3; k++) {
    bild[i * 3 + k] = rå[j + k];
    källa[i * 3 + k] = rå[j + k];
  }
}

// --- 2. masken över ikonerna ------------------------------------------------
// Radien är tilltagen (mätt cirkel = 17 px) så att ikonernas gråa antialias-rand
// åker med. En ikon som är halvt kvar är inte borta.
// Masken klipps vid x=483: kantremsan 484..492 sköts av steg 4, inte av
// medianfyllningen.
const MASK_HÖGER = 483;
const CIRKLAR = [
  { cx: 470.0, cy: 21.5, r: 21 }, // hjärtat
  { cx: 469.0, cy: 66.5, r: 21 }, // dela-ikonen
];
const RUTOR = [
  { x0: 445, x1: 452, y0: 53, y1: 71 }, // sifferstumpen bredvid dela-ikonen
  { x0: 462, x1: 482, y0: 41, y1: 50 }, // den lösa guldpricken i springan
];

const mask = new Uint8Array(B * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x <= MASK_HÖGER; x++) {
    let träff = false;
    for (const c of CIRKLAR) {
      const dx = x - c.cx, dy = y - c.cy;
      if (dx * dx + dy * dy <= c.r * c.r) träff = true;
    }
    for (const r of RUTOR) {
      if (x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1) träff = true;
    }
    if (träff) mask[y * B + x] = 1;
  }
}
const hålPixlar = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < B; x++) if (mask[y * B + x] === 1) hålPixlar.push([x, y]);
}

// --- 3. fyllning av lucksidan: kolumnmedian --------------------------------
const median = (a) => (a.length ? a.sort((u, v) => u - v)[a.length >> 1] : null);
const kolumn = new Map();
for (let x = 430; x <= MASK_HÖGER; x++) {
  const R = [], G = [], Bl = [];
  for (let y = 0; y <= 188; y++) {
    const i = (y * B + x) * 3;
    const r = källa[i], g = källa[i + 1], b = källa[i + 2];
    if ((r + g + b) / 3 > 110) continue; // siffror, vit ikon, vit bakgrund
    if (r > g - 8) continue;             // guldgran och bruna toner
    R.push(r); G.push(g); Bl.push(b);
  }
  if (R.length > 30) kolumn.set(x, [median(R), median(G), median(Bl)]);
}
// jämna ut över ±2 kolumner så övergången till den mörkare högersidan blir mjuk
const bas = new Map();
for (const x of kolumn.keys()) {
  let r = 0, g = 0, b = 0, c = 0;
  for (let d = -2; d <= 2; d++) {
    const k = kolumn.get(x + d);
    if (!k) continue;
    r += k[0]; g += k[1]; b += k[2]; c++;
  }
  bas.set(x, [r / c, g / c, b / c]);
}
for (const [x, y] of hålPixlar) {
  const f = bas.get(x) ?? bas.get(MASK_HÖGER);
  const i = (y * B + x) * 3;
  bild[i] = f[0]; bild[i + 1] = f[1]; bild[i + 2] = f[2];
}

// --- 4. kantremsan x 484..492: interpolera mellan rena rader ----------------
// Ikonerna smetar ut kanten på raderna 11..33 och 57..77 (kontrollerat kolumn
// för kolumn i originalet: utanför dem ligger inga ikonpixlar på x ≥ 484).
const GAP = [
  { från: 10, till: 34 },
  { från: 56, till: 78 },
];
for (const g of GAP) {
  for (let y = g.från + 1; y < g.till; y++) {
    const t = (y - g.från) / (g.till - g.från);
    for (let x = 484; x <= 492; x++) {
      const a = (g.från * B + x) * 3;
      const b2 = (g.till * B + x) * 3;
      const i = (y * B + x) * 3;
      for (let k = 0; k < 3; k++) {
        bild[i + k] = källa[a + k] * (1 - t) + källa[b2 + k] * t;
      }
    }
  }
}

// --- 5. kornighet så fyllningen inte blir en plastig plätt ------------------
// Amplituden mäts på en ren bit av samma gröna lucksida (x 452..482, y 125..160)
// och läggs på som mjukat brus. Ingen struktur klonas — bara kornstorleken.
let sum = 0, sum2 = 0, antal = 0;
for (let y = 125; y <= 160; y++) {
  for (let x = 452; x <= 482; x++) {
    const i = (y * B + x) * 3;
    const l = (källa[i] + källa[i + 1] + källa[i + 2]) / 3;
    let lok = 0, c = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const j = ((y + dy) * B + x + dx) * 3;
      lok += (källa[j] + källa[j + 1] + källa[j + 2]) / 3; c++;
    }
    const d = l - lok / c;
    sum += d; sum2 += d * d; antal++;
  }
}
const std = Math.sqrt(sum2 / antal - (sum / antal) ** 2);

let frö = 20260916; // fast frö = samma bild varje körning
const slump = () => {
  frö = (frö * 1664525 + 1013904223) >>> 0;
  return frö / 4294967296;
};
const brus = new Float32Array(B * H);
for (const [x, y] of hålPixlar) brus[y * B + x] = (slump() - 0.5) * 2;
const brus2 = new Float32Array(B * H); // ett mjukningssteg → kartongens kornstorlek
for (const [x, y] of hålPixlar) {
  let s = 0, c = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    s += brus[(y + dy) * B + x + dx]; c++;
  }
  brus2[y * B + x] = s / c;
}
for (const [x, y] of hålPixlar) {
  const i = (y * B + x) * 3;
  const d = brus2[y * B + x] * std * 2.2;
  for (let k = 0; k < 3; k++) {
    bild[i + k] = Math.max(0, Math.min(255, bild[i + k] + d));
  }
}

// --- 6. mjuka upp sömmen ----------------------------------------------------
// Bara hålets yttersta pixlar, 3×3-medel, så att fyllningen inte möter den
// riktiga bilden med en knivskarp cirkelkant.
const söm = hålPixlar.filter(([x, y]) => {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (mask[(y + dy) * B + x + dx] !== 1) return true;
  }
  return false;
});
const kopia = Float32Array.from(bild);
for (const [x, y] of söm) {
  let r = 0, g = 0, b = 0, c = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const j = ((y + dy) * B + x + dx) * 3;
    r += kopia[j]; g += kopia[j + 1]; b += kopia[j + 2]; c++;
  }
  const i = (y * B + x) * 3;
  bild[i] = r / c; bild[i + 1] = g / c; bild[i + 2] = b / c;
}

// --- 7. tillbaka till bytes -------------------------------------------------
const ut = Buffer.alloc(B * H * 3);
for (let i = 0; i < B * H * 3; i++) ut[i] = Math.round(bild[i]);

// --- 8. beskär miniatyrraden, skala upp, skriv ------------------------------
const BESKÄR_VÄNSTER = 2; // kolumn 0..1 = Amazons miniatyrer
const nyB = B - BESKÄR_VÄNSTER;
const skala = 800 / Math.min(nyB, H);

await sharp(ut, { raw: { width: B, height: H, channels: 3 } })
  .extract({ left: BESKÄR_VÄNSTER, top: 0, width: nyB, height: H })
  .resize({
    width: Math.round(nyB * skala),
    height: Math.round(H * skala),
    kernel: 'lanczos3',
  })
  .sharpen({ sigma: 0.6 })
  .png({ compressionLevel: 9 })
  .toFile(FIL);

const slut = await sharp(FIL).metadata();
console.log(`klar: ${slut.width} × ${slut.height} px, korn-std ${std.toFixed(2)}`);
