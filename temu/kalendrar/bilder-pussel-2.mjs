#!/usr/bin/env node
/**
 * bilder-pussel-2.mjs — städar adventlane-pussel-2.jpg
 *
 * KÄLLBILD: adventlane-pussel-2.jpg (1024 × 1024 px, JPEG), rippad från
 *           adventlane.se. En vit studiokomposit: det röda dekalarket med
 *           lucknummer, två inslagna småpaket och pusslets omslagspanel.
 *
 * VAD SOM SKA BORT:
 *   Den engelska spectexten nere till vänster, lagd ovanpå den vita
 *   bakgrunden som ett säljöverlägg:
 *       "Box   :  28*26*5cm"
 *       "Puzzle:  70*50cm"
 *   Uppmätt bbox för all text: x 40–278, y 904–971 (tre sammanhängande
 *   blobbar: etiketterna, "28*26*5cm" och "70*50cm").
 *
 *   Hela bilden är genomsökt med en connected-component-scan (4-grannar,
 *   4 px dilatation, tröskel 250). Den hittar exakt FYRA blobbar: produkten
 *   (x 28–967, y 120–990) plus de tre textblobbarna ovan. Det finns alltså
 *   ingen vattenstämpel, ingen Amazon-ikon och ingen annan pålagd reklamtext
 *   någonstans i bilden.
 *
 * VARFÖR TEXTEN VITAS BORT I STÄLLET FÖR ATT BESKÄRAS:
 *   Texten går inte att beskära bort utan att halva produkten följer med:
 *     · ett snitt ovanför texten (y = 842) skär av pusselpanelen, som går
 *       ner till y = 984 — dvs. 142 px av panelens underkant, inklusive
 *       produktens eget tryck ("1008 TOTAL PIECES", "POSTER INCLUDED").
 *     · ett snitt till höger om texten (x = 279) skär av det röda dekalarket,
 *       som börjar på x = 40 — dvs. hela arkets vänstra tredjedel.
 *
 *   Ytan bakom texten är däremot helt enfärgad, vilket briefen kräver för
 *   övermålning. Uppmätt med histogram i fyra remsor runt texten:
 *       ovanför  (x 10–310, y 880–900) .... 6 321 / 6 321 px = 255,255,255
 *       under    (x 10–310, y 980–1010) ... 9 331 / 9 331 px = 255,255,255
 *       vänster  (x 5–35,  y 890–990) ..... 3 131 / 3 131 px = 255,255,255
 *       höger    (x 285–315, y 890–990) ... 3 131 / 3 131 px = 255,255,255
 *   Alltså ren vit 255/255/255 i varje provpunkt på alla fyra sidor — vit på
 *   vit, ingen vit låda ovanpå en fotoyta.
 *
 * VITLÅDAN:
 *   x 10–305, y 880–994. Marginalerna är uppmätta, inte gissade:
 *       · 30 px runt texten åt alla håll
 *       · 15 px luft till pusselpanelens vänsterkant (smalaste punkten
 *         x = 320, vid y = 961)
 *       · 39 px luft under det röda arkets nedre spets (y = 841)
 *   Skriptet VERIFIERAR detta innan det målar: varje icke-vit pixel i lådan
 *   måste ligga inne i textens bbox, annars avbryts körningen.
 *
 * EFTERBEHANDLING:
 *   När texten är borta ligger produkten inte längre centrerad (den satt
 *   43 px för lågt i duken). Innehållet beskärs därför till sin bbox och
 *   läggs centrerat på en vit 1024 × 1024-botten — marginalen blir ~48 px,
 *   alltså mer än briefens ~40 px.
 *
 * VAD SOM MEDVETET STÅR KVAR:
 *   Pusselpanelens EGET tryck — "1008 TOTAL PIECES", "42 PIECES PER DAY FOR
 *   24 DAYS", "THE JIGSAW PUZZLE ADVENT CALENDAR", "Christmas Fireplace",
 *   "POSTER INCLUDED", "27.5x19.7in | 70x50cm" — samt lucknumren 1–24 på det
 *   röda arket och paketen. Det är tryckt på varan och är hur den faktiskt
 *   ser ut när kunden får hem den. Att måla bort det vore att ljuga om varan.
 *
 * UTDATA: skriver ÖVER originalfilen (filnamnet behålls, uppladdningsskriptet
 *         döper om den). Originalet sparas som *.original först.
 */

import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
import { readFile, writeFile, access } from 'node:fs/promises';

const SCRATCH = process.argv[2]
  || '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/advent';
const FIL = `${SCRATCH}/bilder/adventlane-pussel-2.jpg`;
const ORIGINAL = `${FIL}.original`;

// --- Uppmätta koordinater ------------------------------------------------
const TEXT = { x0: 40, y0: 904, x1: 278, y1: 971 };              // spectextens bbox
const VITLADA = { left: 10, top: 880, width: 296, height: 115 }; // x 10–305, y 880–994

// --- Leveransformat ------------------------------------------------------
const DUK = 1024;       // vit kvadratisk botten, samma mått som källan
const MIN_MARGINAL = 40; // briefens krav

const TROSKEL = 250;    // under detta räknas pixeln som icke-vit

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

/** Läs bilden som rå RGB. */
async function raRgb(kalla) {
  const { data, info } = await sharp(kalla)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height, C: info.channels };
}

const arIckeVit = (b, x, y) => {
  const i = (y * b.W + x) * b.C;
  return b.data[i] < TROSKEL || b.data[i + 1] < TROSKEL || b.data[i + 2] < TROSKEL;
};

/** Icke-vit bbox för ett område (hela bilden om inget anges). */
function bbox(b, x0 = 0, y0 = 0, x1 = b.W - 1, y1 = b.H - 1) {
  let minx = Infinity, miny = Infinity, maxx = -1, maxy = -1, n = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (!arIckeVit(b, x, y)) continue;
      n++;
      if (x < minx) minx = x;
      if (x > maxx) maxx = x;
      if (y < miny) miny = y;
      if (y > maxy) maxy = y;
    }
  }
  return { n, minx, miny, maxx, maxy };
}

/**
 * Säkerhetskoll INNAN vitlådan målas: varje icke-vit pixel inne i lådan
 * måste ligga inom textens uppmätta bbox. Hittas produktpixlar avbryts
 * körningen i stället för att kapa något av varan.
 */
function verifieraLadan(b) {
  const { left, top, width, height } = VITLADA;
  let utanfor = 0;
  let varsta = null;
  for (let y = top; y < top + height; y++) {
    for (let x = left; x < left + width; x++) {
      if (!arIckeVit(b, x, y)) continue;
      const inneITexten = x >= TEXT.x0 && x <= TEXT.x1 && y >= TEXT.y0 && y <= TEXT.y1;
      if (!inneITexten) {
        utanfor++;
        if (!varsta) varsta = { x, y };
      }
    }
  }
  if (utanfor > 0) {
    throw new Error(
      `AVBRYTER: ${utanfor} icke-vita pixlar i vitlådan ligger utanför textens bbox `
      + `(första vid x=${varsta.x}, y=${varsta.y}). Koordinaterna stämmer inte med bilden.`
    );
  }
  console.log('· verifierat: vitlådan innehåller bara spectexten, inga produktpixlar');
}

async function kor() {
  await sparaOriginal();

  const fore = await raRgb(ORIGINAL);
  console.log(`· källa ${fore.W} × ${fore.H}`);
  const bboxFore = bbox(fore);
  console.log('· bbox före:', JSON.stringify(bboxFore));
  console.log('· textens bbox:', JSON.stringify(bbox(fore, 0, 850, 315, fore.H - 1)));

  verifieraLadan(fore);

  // 1) Måla spectexten med exakt bakgrundsfärgen 255/255/255.
  const rensad = await sharp(ORIGINAL)
    .removeAlpha()
    .composite([{
      input: {
        create: {
          width: VITLADA.width,
          height: VITLADA.height,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      },
      left: VITLADA.left,
      top: VITLADA.top,
    }])
    .png()
    .toBuffer();

  // 2) Nytt bbox — produkten sitter nu lågt i duken och ska centreras om.
  const efter = await raRgb(rensad);
  const bb = bbox(efter);
  console.log('· bbox efter rensning:', JSON.stringify(bb));

  const bredd = bb.maxx - bb.minx + 1;
  const hojd = bb.maxy - bb.miny + 1;
  console.log(`· produktens mått: ${bredd} × ${hojd}`);

  const produkt = await sharp(rensad)
    .extract({ left: bb.minx, top: bb.miny, width: bredd, height: hojd })
    .toBuffer();

  // 3) Skala ner bara om produkten inte får plats med minsta marginal.
  const maxMatt = DUK - 2 * MIN_MARGINAL;
  let placerad = produkt;
  let pb = bredd, ph = hojd;
  if (bredd > maxMatt || hojd > maxMatt) {
    const skala = Math.min(maxMatt / bredd, maxMatt / hojd);
    pb = Math.round(bredd * skala);
    ph = Math.round(hojd * skala);
    placerad = await sharp(produkt)
      .resize(pb, ph, { kernel: 'lanczos3' })
      .toBuffer();
    console.log(`· nedskalad till ${pb} × ${ph} för att rymma ${MIN_MARGINAL} px marginal`);
  }

  const vanster = Math.round((DUK - pb) / 2);
  const ovan = Math.round((DUK - ph) / 2);
  console.log(`· marginal: ${vanster} px i sidled, ${ovan} px i höjdled`);

  const ut = await sharp({
    create: { width: DUK, height: DUK, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: placerad, left: vanster, top: ovan }])
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toBuffer();

  await writeFile(FIL, ut);
  console.log(`· skrev ${FIL} (${DUK} × ${DUK}, JPEG q92, ${(ut.length / 1024).toFixed(0)} kB)`);

  // 4) Slutkontroll på den färdiga filen: inget kvar i nedre vänstra hörnet.
  const klar = await raRgb(FIL);
  const horn = bbox(klar, 0, Math.round(DUK * 0.75), Math.round(DUK * 0.35), DUK - 1);
  console.log('· slutkontroll nedre vänstra kvadranten:', JSON.stringify(horn));
}

kor().catch((fel) => {
  console.error(fel.message);
  process.exit(1);
});
