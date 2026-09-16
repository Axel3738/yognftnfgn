#!/usr/bin/env node
/**
 * bilder-cocktail-1.mjs — städar adventlane-cocktail-1.png
 *
 * KÄLLBILD: adventlane-cocktail-1.png (489 × 504 px), rippad från adventlane.se.
 *           Den är i själva verket en SKÄRMDUMP FRÅN AMAZON.
 *
 * VAD SOM BESKÄRS BORT (uppmätt pixel för pixel, se kommentarer nedan):
 *   1. Amazons hjärt-ikon      — vit rundel, x 441–475, y 14–46
 *   2. Amazons dela-ikon       — vit rundel, x 443–477, y 59–93
 *   3. "Click to see full view" + den avklippta textraden — y 497–503
 *
 * VARFÖR BESKÄRNING OCH INTE ÖVERMÅLNING:
 *   Ikonerna ligger ovanpå julgrönska, en röd julkula och en apelsinskiva —
 *   ytan bakom är alltså INTE enfärgad. En vit låda där hade synts direkt.
 *   Ikonerna sitter i ett band längst till höger (x ≥ 433) där det bara finns
 *   dekor, ingen produkt. Kolumnerna x 428–432 är helt tomma genom hela
 *   bilden, så snittet vid x = 433 går i en naturlig lucka och lämnar inte
 *   en halv julkula kvar.
 *
 * VAD SOM STÅR KVAR (och ska stå kvar):
 *   Asken med det tryckta ordet "COCKTAIL", cocktailglaset, alla 24 flaskor
 *   med sina etiketter (MARTINI, MOJITO, NEGRONI …) och den tryckta juldekoren.
 *   Det är produktens eget tryck — så här ser varan ut när kunden får hem den.
 *
 * MÅTT:
 *   Produkten når som längst ut till x = 431 (understa flaskraden) och
 *   y = 485 (flaskornas skuggor). Snittet 433 × 486 tar alltså inte en enda
 *   produktpixel.
 *
 * UTDATA: skriver ÖVER originalfilen. Originalet sparas som *.original.
 */

import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
import { readFile, writeFile, access } from 'node:fs/promises';

const SCRATCH = process.argv[2]
  || '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/advent';
const FIL = `${SCRATCH}/bilder/adventlane-cocktail-1.png`;
const ORIGINAL = `${FIL}.original`;

// --- Uppmätta snittkoordinater -------------------------------------------
const SNITT = { left: 0, top: 0, width: 433, height: 486 };

// --- Leveransformat ------------------------------------------------------
const DUK = 1000;      // vit kvadratisk botten
const MARGINAL = 40;   // ~40 px luft runt produkten

/** Spara originalet en gång — kör man om skriptet ska källan inte skrivas över. */
async function saraOriginal() {
  try {
    await access(ORIGINAL);
    console.log('· original finns redan sparat');
  } catch {
    await writeFile(ORIGINAL, await readFile(FIL));
    console.log('· original sparat som', ORIGINAL);
  }
}

/** Hittar ramen runt allt som inte är vitt (så produkten kan centreras). */
async function innehallsRam(buffert) {
  const { data, info } = await sharp(buffert)
    .flatten({ background: '#ffffff' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C;
      if (data[i] > 244 && data[i + 1] > 244 && data[i + 2] > 244) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

async function main() {
  await saraOriginal();

  // 1) Beskär bort Amazon-gränssnittet (höger kant + textraden i botten).
  const beskuren = await sharp(ORIGINAL)
    .flatten({ background: '#ffffff' })   // PNG:n har alfa — lägg vit botten först
    .extract(SNITT)
    .png()
    .toBuffer();
  console.log(`· beskuret till ${SNITT.width} × ${SNITT.height} px`);

  // 2) Trimma bort den vita luften så produkten kan centreras exakt.
  const ram = await innehallsRam(beskuren);
  console.log(`· innehållsram: x ${ram.left}–${ram.left + ram.width - 1}, `
    + `y ${ram.top}–${ram.top + ram.height - 1} (${ram.width} × ${ram.height})`);

  const trimmad = await sharp(beskuren).extract(ram).png().toBuffer();

  // 3) Skala upp till leveransstorlek (lanczos3 + lätt skärpa, originalet är litet).
  const inner = DUK - MARGINAL * 2;
  const skalad = await sharp(trimmad)
    .resize({ width: inner, height: inner, fit: 'inside', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.6 })
    .png()
    .toBuffer();
  const sm = await sharp(skalad).metadata();
  console.log(`· uppskalad till ${sm.width} × ${sm.height} px`);

  // 4) Lägg på vit kvadratisk botten, centrerad.
  await sharp({
    create: { width: DUK, height: DUK, channels: 3, background: '#ffffff' },
  })
    .composite([{ input: skalad, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(FIL);

  const slut = await sharp(FIL).metadata();
  console.log(`✅ ${FIL} — ${slut.width} × ${slut.height} px`);
}

await main();
