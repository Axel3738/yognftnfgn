#!/usr/bin/env node
// bilder-dinosaurie-1.mjs — städar adventlane-dinosaurie-1.png (dinosaurie-kalendern)
//
// KÄLLBILD: <SCRATCH>/advent/bilder/adventlane-dinosaurie-1.png (800 × 800)
//           Leverantörens reklambild, rippad från adventlane.se. Originalet sparas
//           som adventlane-dinosaurie-1.png.original innan något skrivs över.
//
// VAD SOM TAS BORT
//   1. Reklamtexten uppe till vänster — "Fine gift box" / "Christmas vibe" i
//      gräddvit serif, uppmätt bbox x 42..355, y 39..153. Den ligger som ett
//      lager ovanpå fotot och är ren säljtext. BESKÄRS bort: allt ovanför y=168
//      klipps av. Marginalen är mätt, inte gissad — sista textpixeln ligger på
//      y=153 (max-luminans 253 på y=152, 54 på y=154), och askens högsta punkt
//      ligger på y=196 (vid x=120). Snittet på y=168 har alltså 15 px luft till
//      texten och 28 px luft till produkten. Ingen produktkant klipps.
//
//   2. Guldskylten "Merry Christmas" uppe till höger, uppmätt x 491..687,
//      y 123..216. Den går INTE att beskära bort: den hänger rakt ovanför asken,
//      och dess nederkant (y=216) ligger bara två pixlar över askens överkant
//      (y=218 vid x=490, y=231 vid x=725). Ett snitt under skylten hade kapat
//      hela askens ovansida på vänstra halvan. Den fylls därför igen i stället.
//
// VARFÖR FYLLNINGEN ÄR FÖRSVARLIG HÄR: ytan bakom skylten är inte ett motiv utan
// nattsvart granris. Uppmätt median i granen runt omkring är (10, 16, 11) och den
// är konstant i höjdled — sju höjdband mellan y=140 och y=244 gav 8..12 i rött,
// 14..19 i grönt. Samma svarta yta fortsätter till höger om skylten (x 745..795)
// och ovanför den (y 60..120).
//
// HUR HÅLET FYLLS: inte med en målad plätt. Fyllningen KOPIERAS ur samma bild,
// från granen rakt ovanför skylten — källan ligger exakt 153 rader upp och i
// samma kolumner, så barr och grenar fortsätter i sin egen riktning i stället
// för att gissas fram. Den remsan (x 491..694, y 15..87) hamnar utanför
// beskärningen och syns alltså aldrig två gånger i den färdiga bilden. En första
// version fyllde med platt medianfärg; det blev en död svart ruta som skvallrade
// om att någon retuscherat. Ljusa fragment i källan (kulreflexer, lum > 70) och
// varma pixlar (guldljus som studsat in i granen) lagas bort ur remsan INNAN den
// kopieras, med medianen av dugliga grannar, och remsan skalas till samma
// luminansnivå som granen bredvid hålet. Ingen vit låda, ingen AI, inget påhittat
// motiv — bara gran ur samma foto.
//
// VAD SOM MEDVETET STÅR KVAR
//   * Askens EGET tryck: "ADVENT CALENDAR" (både på framsidan och spegelvänt på
//     ovansidan), "DINO THEMES", åldersmärket "3+ ages", luckesiffrorna och hela
//     djungelmotivet. Så ser varan ut i kundens hand.
//   * Julgranen, guldkulorna, guldgranen och guldsnöret till höger. Det är
//     rekvisita i fotot, inte pålagd text. Guldkulan strax till vänster om
//     skylten (cirkel med centrum ≈ (461, 200), radie 29) tangerar "C":et i
//     Christmas — fyllningen börjar därför på x=491, en pixel till höger om
//     kulans yttersta punkt (x=490 vid y=199), så att kulan behålls hel.
//   * Alla 24 minidinosaurier längst ner.
//
// UTDATA: skriver över adventlane-dinosaurie-1.png. Efter beskärningen är bilden
// 800 × 632; kortsidan skalas upp till 800 px (lanczos3 + lätt sharpen) → 1013 × 800.

import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const MAPP = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/advent/bilder';
const FIL = `${MAPP}/adventlane-dinosaurie-1.png`;
const ORIGINAL = `${FIL}.original`;

// --- 1. spara originalet en gång -------------------------------------------
if (!existsSync(ORIGINAL)) writeFileSync(ORIGINAL, readFileSync(FIL));

const { data: rå, info } = await sharp(ORIGINAL)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const B = info.width;   // 800
const H = info.height;  // 800

const bild = new Float32Array(B * H * 3);
for (let i = 0; i < B * H * 3; i++) bild[i] = rå[i];

const idx = (x, y) => (y * B + x) * 3;
const lum = (x, y) => {
  const i = idx(x, y);
  return 0.299 * bild[i] + 0.587 * bild[i + 1] + 0.114 * bild[i + 2];
};

// --- 2. mät granens färg på REN gran, utanför skylten ------------------------
// Två prover, båda ur samma träd och samma ljus: remsan till höger om skylten
// (guldsnöret på x≈733 undviks) och bandet ovanför skylten. Bara mörka pixlar
// räknas, så ingen guldkula kan smyga in i medianen.
const median = (a) => a.sort((u, v) => u - v)[a.length >> 1];
const R = [], G = [], Bl = [];
const prov = [
  { x0: 745, x1: 795, y0: 140, y1: 244 }, // till höger om skylten
  { x0: 500, x1: 690, y0: 60, y1: 120 },  // rakt ovanför skylten
];
for (const p of prov) {
  for (let y = p.y0; y <= p.y1; y++) {
    for (let x = p.x0; x <= p.x1; x++) {
      if (lum(x, y) >= 50) continue; // guld, kulor och ljusa barr bort
      const i = idx(x, y);
      R.push(bild[i]); G.push(bild[i + 1]); Bl.push(bild[i + 2]);
    }
  }
}
const GRAN = [median(R), median(G), median(Bl)];

// granens kornighet: std för högfrekvensen (pixel minus sitt 3×3-medel)
let s = 0, s2 = 0, n = 0;
for (let y = 175; y <= 240; y++) {
  for (let x = 746; x <= 794; x++) {
    let lok = 0, c = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      lok += lum(x + dx, y + dy); c++;
    }
    const d = lum(x, y) - lok / c;
    s += d; s2 += d * d; n++;
  }
}
const std = Math.sqrt(s2 / n - (s / n) ** 2);

// --- 3. skyltens hål ---------------------------------------------------------
// Askens överkant i skyltens x-spann är rak och uppmätt kolumn för kolumn:
// y=218 vid x=490 och y=231 vid x=725 → 0,0553 px lutning per kolumn. Hålet
// slutar två pixlar OVANFÖR den linjen, så att askens ljusa överkant aldrig
// rörs. Skyltens understa guldpixel ligger på y=216 — den ryms med marginal.
const askKant = (x) => 218 + 0.0553 * (x - 490);
const HÅL = { x0: 491, x1: 694 };
const YCROP = 168;

let frö = 20260916; // fast frö = identisk bild vid varje körning
const slump = () => {
  frö = (frö * 1664525 + 1013904223) >>> 0;
  return frö / 4294967296;
};

// brus först, sedan ett mjukningssteg så kornen får granens storlek
const brus = new Float32Array(B * H);
for (let y = YCROP - 2; y <= 235; y++) {
  for (let x = HÅL.x0 - 2; x <= HÅL.x1 + 2; x++) brus[y * B + x] = slump() - 0.5;
}
const brusMjuk = (x, y) => {
  let v = 0, c = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    v += brus[(y + dy) * B + x + dx]; c++;
  }
  return (v / c) * 2;
};

// --- 3b. lappen: granen 153 rader ovanför, samma kolumner --------------------
const DY = 153;                 // källrad = målrad − 153  →  y 15..87
const LJUS_GRÄNS = 70;          // ljusare än så: kulreflex, inte granris
const REMSA = { x0: HÅL.x0, x1: HÅL.x1, y0: YCROP - DY, y1: 240 - DY };

// Vilka källpixlar duger inte? Två sorter: kulreflexer (för ljusa) och varma
// pixlar (r > g) — granen är grön, allt varmt är guldljus som studsat dit.
// Masken vidgas 2 px så reflexens halo följer med.
const källa = Float32Array.from(bild); // lappen läses ur en orörd kopia
const kassera = new Uint8Array(B * H);
for (let y = REMSA.y0 - 4; y <= REMSA.y1 + 4; y++) {
  for (let x = REMSA.x0 - 4; x <= REMSA.x1 + 4; x++) {
    const i = idx(x, y);
    const varm = källa[i] > källa[i + 1] + 4 && lum(x, y) > 26;
    if (lum(x, y) > LJUS_GRÄNS || varm) {
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        kassera[(y + dy) * B + x + dx] = 1;
      }
    }
  }
}

// Laga remsan INNAN den kopieras: varje kasserad pixel får medianen av de
// dugliga grannarna inom ±5 px (±9 om det inte räcker). Det behåller barrens
// struktur i stället för att stansa in en platt fyrkant — första försöket satte
// medianfärgen rakt av och lämnade små mörka rutor i lövverket.
const lagad = Float32Array.from(källa);
for (let y = REMSA.y0; y <= REMSA.y1; y++) {
  for (let x = REMSA.x0; x <= REMSA.x1; x++) {
    if (!kassera[y * B + x]) continue;
    let val = null;
    for (const r of [5, 9]) {
      const R2 = [], G2 = [], B2 = [];
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const xx = x + dx, yy = y + dy;
        if (kassera[yy * B + xx]) continue;
        const j = idx(xx, yy);
        R2.push(källa[j]); G2.push(källa[j + 1]); B2.push(källa[j + 2]);
      }
      if (R2.length >= 12) { val = [median(R2), median(G2), median(B2)]; break; }
    }
    const d = brusMjuk(x, y + DY) * std * 2.2;
    const f = val ?? [GRAN[0] - 0 + d, GRAN[1] + d, GRAN[2] + d];
    const i = idx(x, y);
    lagad[i] = f[0]; lagad[i + 1] = f[1]; lagad[i + 2] = f[2];
  }
}
// ett utjämningssteg, bara på de lagade pixlarna, så sömmarna inte blir kantiga
const slät = Float32Array.from(lagad);
for (let y = REMSA.y0; y <= REMSA.y1; y++) {
  for (let x = REMSA.x0; x <= REMSA.x1; x++) {
    if (!kassera[y * B + x]) continue;
    const acc = [0, 0, 0];
    let c = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const j = idx(x + dx, y + dy);
      acc[0] += lagad[j]; acc[1] += lagad[j + 1]; acc[2] += lagad[j + 2]; c++;
    }
    const i = idx(x, y);
    for (let k = 0; k < 3; k++) slät[i + k] = acc[k] / c;
  }
}

// Nivåjustering: lappen ligger 153 rader högre upp i granen och kan vara någon
// nyans ljusare där. Den skalas därför mot granen PÅ SAMMA HÖJD som hålet —
// remsan x 696..727 alldeles till höger om skylten (guldsnöret på x≈733 hamnar
// utanför). Skalan räknas på LUMINANS och läggs på alla tre kanalerna lika.
// Kanalvis korrigering testades och förkastades: i nästan svart gran är
// medianens färgton ren brusgissning, och en kanalvis faktor (0,91 / 0,62 /
// 0,60) vred barren röda — precis den varma fläck som ser ut som en rest av
// skylten. Klamringen gör dessutom att steget aldrig kan ändra bilden drastiskt.
const nivåLum = (x0, x1, y0, y1) => {
  const L = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const l = lum(x, y);
      if (l > 120) continue; // ljusa reflexer ska inte styra nivån
      L.push(l);
    }
  }
  return median(L);
};
const NIVÅ = nivåLum(696, 727, YCROP, 228);
const LL = [];
for (let y = REMSA.y0; y <= REMSA.y1; y++) {
  for (let x = REMSA.x0; x <= REMSA.x1; x++) {
    const i = idx(x, y);
    const l = 0.299 * slät[i] + 0.587 * slät[i + 1] + 0.114 * slät[i + 2];
    if (l > 120) continue;
    LL.push(l);
  }
}
const LAPP = median(LL);
const G0 = Math.min(1.25, Math.max(0.8, NIVÅ / Math.max(1, LAPP)));
const GAIN = [G0, G0, G0];

// Kantremsa: 3 px in från hålets sidor tonas fyllningen mot originalet, men BARA
// där originalet redan är mörk gran. Ligger guldkulan utanför kanten behålls den
// skarp i stället för att smetas in i fyllningen.
const KANT = 3;
for (let x = HÅL.x0; x <= HÅL.x1; x++) {
  const yNed = Math.floor(askKant(x)) - 2;
  for (let y = YCROP; y <= yNed; y++) {
    const i = idx(x, y);
    const sj = idx(x, y - DY);
    const fyll = [
      slät[sj] * GAIN[0],
      slät[sj + 1] * GAIN[1],
      slät[sj + 2] * GAIN[2],
    ];

    // hur nära sido- eller underkanten ligger pixeln?
    const nära = Math.min(x - HÅL.x0, HÅL.x1 - x, yNed - y);
    let a = 1; // 1 = ren fyllning
    if (nära < KANT) {
      const utanförMörkt =
        (x - HÅL.x0 <= nära ? lum(HÅL.x0 - 1, y) : 999) < 50 ||
        (HÅL.x1 - x <= nära ? lum(HÅL.x1 + 1, y) : 999) < 50 ||
        (yNed - y <= nära ? lum(x, yNed + 1) : 999) < 50;
      if (utanförMörkt) a = (nära + 1) / (KANT + 1);
    }
    for (let k = 0; k < 3; k++) {
      bild[i + k] = fyll[k] * a + bild[i + k] * (1 - a);
    }
  }
}

// --- 3c. mjuka upp sömmen mot guldkulan -------------------------------------
// Fyllningen börjar på x=491, en pixel till höger om kulans yttersta punkt. Utan
// det här steget slutar kulans suddiga kant tvärt i en rak lodrät linje — i
// originalet tonade den ut i "C":ets sken. Kolumnerna 489..494 blandas därför
// horisontellt över ±2 px, starkast mitt i sömmen, så kulan får tillbaka en
// optiskt trolig mjuk kant i stället för ett knivrakt snitt.
const förSöm = Float32Array.from(bild);
for (let y = YCROP; y <= Math.floor(askKant(HÅL.x0)) - 2; y++) {
  for (let x = 489; x <= 494; x++) {
    const w = 1 - Math.abs(x - 491.5) / 3.5; // 1 i sömmen, 0 i ytterkanterna
    const i = idx(x, y);
    for (let k = 0; k < 3; k++) {
      let sum = 0, c = 0;
      for (let dx = -2; dx <= 2; dx++) { sum += förSöm[idx(x + dx, y) + k]; c++; }
      bild[i + k] = förSöm[i + k] * (1 - w) + (sum / c) * w;
    }
  }
}

// --- 4. tillbaka till bytes, beskär, skala upp, skriv ------------------------
const ut = Buffer.alloc(B * H * 3);
for (let i = 0; i < B * H * 3; i++) {
  ut[i] = Math.max(0, Math.min(255, Math.round(bild[i])));
}

const nyH = H - YCROP;                   // 632
const skala = 800 / Math.min(B, nyH);    // kortsidan upp till 800 px

await sharp(ut, { raw: { width: B, height: H, channels: 3 } })
  .extract({ left: 0, top: YCROP, width: B, height: nyH })
  .resize({
    width: Math.round(B * skala),
    height: Math.round(nyH * skala),
    kernel: 'lanczos3',
  })
  .sharpen({ sigma: 0.6 })
  .png({ compressionLevel: 9 })
  .toFile(FIL);

const slut = await sharp(FIL).metadata();
console.log(
  `klar: ${slut.width} × ${slut.height} — gran ${GRAN.join(",")}, nivå ${NIVÅ.toFixed(1)}, lapp ${LAPP.toFixed(1)}, gain ${GAIN.map(g=>g.toFixed(2)).join(",")}, korn-std ${std.toFixed(2)}`,
);
