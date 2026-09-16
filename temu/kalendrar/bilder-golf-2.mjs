#!/usr/bin/env node
/**
 * bilder-golf-2.mjs — städar adventlane-golf-2.jpg
 *
 * KÄLLBILD: adventlane-golf-2.jpg (1464 × 1464 px), rippad från adventlane.se.
 *           Det är en LEVERANTÖRSBILD FRÅN 1688.com (kinesisk B2B-sajt).
 *
 * VAD SOM SKA BORT:
 *   En halvgenomskinlig vattenstämpel "op403k02 … 9g6.1688.com" som ligger som
 *   ett lager tvärs över bildens nedersta produktrad.
 *   Uppmätt bandbredd: x 758–1452, y 1381–1424 (versalhöjd ~35 px, g:ets stapel
 *   ner till 1424). Hela bilden är genomsökt kvadrant för kvadrant — det finns
 *   BARA denna enda förekomst, inga Amazon-ikoner och ingen pålagd reklamtext.
 *
 * VARFÖR HELA NEDERSTA RADEN BESKÄRS BORT (och inte bara textbandet):
 *   Stämpeln ligger INTE på vit yta. Den löper över den blå bollmarkören
 *   (blått + vit pilgrafik) och över den svarta mikrofiberhandduken (vävd
 *   textur, veck, karbinhake). Ytan bakom är alltså allt annat än enfärgad, så
 *   övermålning är utesluten enligt bildbriefen — en flat låda hade synts direkt.
 *
 *   Ett snitt precis ovanför texten (y = 1379) hade gått rakt genom fem
 *   produkter. Uppmätta underkanter i nedersta raden:
 *       peggar x 0–180 .......... y 1208–1429  →  50 px bortklippta (~25 %)
 *       rengöringsborste ........ y 1250–1447  →  68 px (~42 %)
 *       spikverktyg ............. y 1250–1447  →  68 px (~43 %)
 *       blå bollmarkör .......... y 1230–1451  →  72 px (~37 %)
 *       svart handduk ........... y 1235–1461  →  82 px (~38 %)
 *   Det är avklippta produktkanter rakt av, vilket briefen förbjuder.
 *
 *   Därför tas hela raden bort i stället. Det kostar ingen information på
 *   produktsidan: adventlane-golf-1.png visar exakt samma fem artiklar
 *   (handduk, borste, spikverktyg, blå + svart markör, peggar) hela och
 *   ostämplade. Bilderna ligger bredvid varandra i galleriet.
 *
 * SNITTET:
 *   y = 1230. Raden ovanför slutar på y = 1226 (silverklämman, x 1172–1182) och
 *   den svarta bollmarkören på y = 1225 — snittet tar alltså inte en enda pixel
 *   av raden som behålls. Den blå markören i nedersta raden börjar på y = 1230.
 *
 * DEN LILLA VITMÅLNINGEN:
 *   Nedersta radens peggar börjar högre än de andra (y = 1208) och sticker
 *   därför upp 22 px ovanför snittet som en stump i nedre vänstra hörnet.
 *   Den vitas bort (x 0–150, y 1200–1230). Bakgrunden där är uppmätt exakt
 *   255/255/255 i varje provpunkt, så det är ren vit på ren vit — ingen
 *   vit låda ovanpå en fotoyta. Peggarna finns kvar i raden ovanför.
 *
 * VAD SOM MEDVETET STÅR KVAR:
 *   Askens eget tryck — "GOLF", "ADVENT CALENDAR", "Merry Christmas",
 *   "24 Days" och ryggtexten "Merry Christmas Happily Golf" — samt texten
 *   "STROKECounter / PLAYER 1 / PLAYER 2" som är tryckt på slagräknaren.
 *   Det är hur varan faktiskt ser ut när kunden får hem den.
 *
 * UTDATA: skriver ÖVER originalfilen (filnamnet behålls, uppladdningsskriptet
 *         döper om den). Originalet sparas som *.original först.
 */

import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
import { readFile, writeFile, access } from 'node:fs/promises';

const SCRATCH = process.argv[2]
  || '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/advent';
const FIL = `${SCRATCH}/bilder/adventlane-golf-2.jpg`;
const ORIGINAL = `${FIL}.original`;

// --- Uppmätta koordinater ------------------------------------------------
const SNITT = { left: 0, top: 0, width: 1464, height: 1230 };   // behåll rad 1–3
const PEGGSTUMP = { left: 0, top: 1200, width: 150, height: 30 }; // vitas bort

// --- Leveransformat ------------------------------------------------------
const DUK = 1464;      // vit kvadratisk botten, samma mått som källan
const MARGINAL = 40;   // ~40 px luft runt produkten

/** Spara originalet en gång — kör man om skriptet ska källan inte skrivas över. */
async function sparaOriginal() {
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

/**
 * Kontrollmätning, INTE ett bevis: räknar ljusgrå lågmättade pixlar (stämpelns
 * ton) som ligger ovanpå MÖRK omgivning — så ser vattenstämpeln ut där den
 * korsar handduken. Rena vita ytor och bollarnas gråskalor ger inte utslag.
 * Den slutgiltiga kontrollen är ögonen på den färdiga bilden.
 */
async function ljusTextPaMorktUnderlag(fil) {
  const { data, info } = await sharp(fil).flatten({ background: '#ffffff' })
    .raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const ton = (x, y) => {
    const i = (y * W + x) * C;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return { r, mx: Math.max(r, g, b), mn: Math.min(r, g, b) };
  };
  let traffar = 0;
  for (let y = 4; y < H - 4; y++) {
    for (let x = 4; x < W - 4; x++) {
      const p = ton(x, y);
      if (!(p.mn > 150 && p.mx < 235 && (p.mx - p.mn) < 16)) continue;
      // omgivningen 4 px upp/ner ska vara tydligt mörkare (textur under texten)
      const upp = ton(x, y - 4), ner = ton(x, y + 4);
      if (upp.mx < 90 && ner.mx < 90) traffar++;
    }
  }
  return traffar;
}

async function main() {
  await sparaOriginal();

  // 1) Beskär bort nedersta produktraden — där och bara där ligger stämpeln.
  const beskuren = await sharp(ORIGINAL)
    .flatten({ background: '#ffffff' })
    .extract(SNITT)
    .png()
    .toBuffer();
  console.log(`· beskuret till ${SNITT.width} × ${SNITT.height} px `
    + '(nedersta raden med 1688-stämpeln borttagen)');

  // 2) Vita bort peggstumpen som sticker upp ovanför snittet. Ren vit på ren vit.
  const stump = await sharp({
    create: {
      width: PEGGSTUMP.width, height: PEGGSTUMP.height,
      channels: 3, background: '#ffffff',
    },
  }).png().toBuffer();
  const stadad = await sharp(beskuren)
    .composite([{ input: stump, left: PEGGSTUMP.left, top: PEGGSTUMP.top }])
    .png()
    .toBuffer();
  console.log('· peggstumpen vitad bort (x 0–150, y 1200–1230)');

  // 3) Trimma bort den vita luften så produkten kan centreras exakt.
  const ram = await innehallsRam(stadad);
  console.log(`· innehållsram: x ${ram.left}–${ram.left + ram.width - 1}, `
    + `y ${ram.top}–${ram.top + ram.height - 1} (${ram.width} × ${ram.height})`);
  const trimmad = await sharp(stadad).extract(ram).png().toBuffer();

  // 4) Skala in i duken med ~40 px marginal (lätt nedskalning, lanczos3).
  const inner = DUK - MARGINAL * 2;
  const skalad = await sharp(trimmad)
    .resize({ width: inner, height: inner, fit: 'inside', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.5 })
    .png()
    .toBuffer();
  const sm = await sharp(skalad).metadata();
  console.log(`· skalad till ${sm.width} × ${sm.height} px`);

  // 5) Lägg på vit kvadratisk botten, centrerad.
  await sharp({
    create: { width: DUK, height: DUK, channels: 3, background: '#ffffff' },
  })
    .composite([{ input: skalad, gravity: 'centre' }])
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(FIL);

  const slut = await sharp(FIL).metadata();
  console.log(`✅ ${FIL} — ${slut.width} × ${slut.height} px`);

  const fore = await ljusTextPaMorktUnderlag(ORIGINAL);
  const efter = await ljusTextPaMorktUnderlag(FIL);
  console.log(`· kontrollmätning "ljus text på mörkt underlag": `
    + `original ${fore} px → resultat ${efter} px`);
}

await main();
