// bilder-cocktail-2.mjs
// ---------------------------------------------------------------------------
// Källbild : <SCRATCH>/advent/bilder/adventlane-cocktail-2.jpg  (1200 × 1200, JPEG)
//            Rippad från adventlane.se, ursprungligen en leverantörsbild från en
//            kinesisk B2B-sajt.
//
// FELET    : En halvgenomskinlig vattenstämpel med firmanamnet
//            "义乌市耀强工艺品有限公司" ligger som ett lager ovanpå fotot.
//            Den är TILAD och förekommer TVÅ gånger (uppmätt av det här skriptet):
//              Band A: x  54–650,  y 256–307  → tvärs över askens övre fjärdedel
//                                                (ljusslingan, luckorna 1–4, rosettopparna)
//              Band B: x 565–1150, y 856–911  → tvärs över askens nedre högra hörn
//                                                OCH över flaskrad 5 (TOM COLLINS,
//                                                MINT JULEP, DARK N STORMY, LONG ISLAND)
//
// BESLUT   : Bilden går INTE att rädda. Se `utvarderaBeskarningar()` — varje
//            rektangel som innehåller hela asken skärs av band A, och varje
//            rektangel som innehåller hela flaskrutnätet skärs av band B.
//            Att måla över är uteslutet: ytorna bakom stämpeln är mörkblå
//            asktryck med snöflingor, guldbokstäver, röda rosetter och
//            flasketiketter — inte en enfärgad yta. Bildbriefen tillåter
//            övermålning bara på helt enfärgad botten.
//
// DÄRFÖR   : Skriptet skriver AVSIKTLIGT INTE över leveransfilen. Det lämnar
//            originalet orört och producerar i stället bevismaterial i
//            <SCRATCH>/advent/bevis-cocktail-2/ så att beslutet går att granska.
//            Kalendern har redan adventlane-cocktail-1.png som galleribild.
//
// Vad som INTE är ett fel i den här bilden: askens eget tryck
// ("COCKTAIL ADVENT CALENDAR", sifferluckorna 1–24, flasketiketterna).
// Det är hur varan faktiskt ser ut och skulle ha fått stå kvar.
// ---------------------------------------------------------------------------

import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SCRATCH = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/advent';
const KALLA   = path.join(SCRATCH, 'bilder', 'adventlane-cocktail-2.jpg');
const BEVIS   = path.join(SCRATCH, 'bevis-cocktail-2');

// Produktens utsträckning i bilden, avläst ur källbilden.
const ASKEN    = { x0:  62, y0: 122, x1:  748, y1: 1016 }; // hela presentasken inkl. vit sida
const FLASKOR  = { x0: 788, y0:   0, x1: 1090, y1: 1200 }; // rutnätet 6 × 4 flaskor

// ---------------------------------------------------------------------------
// 1. Mät vattenstämpelns band i stället för att lita på ögonmått.
//    Stämpeln är ljusare än den mörkblå asken och gråare än den vita bottnen,
//    så den syns som en avvikelse i båda zonerna.
// ---------------------------------------------------------------------------
async function matBanden() {
  const { data, info } = await sharp(KALLA).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const ljus = (x, y) => { const i = (y * W + x) * C; return (data[i] + data[i+1] + data[i+2]) / 3; };
  const gramarkerad = (x, y) => {
    const i = (y * W + x) * C, r = data[i], g = data[i+1], b = data[i+2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mx > 200 && mx < 251 && (mx - mn) < 12;   // grå där bottnen borde vara ren vit
  };

  // Vertikal utsträckning: mät upplysningen av den rena mörkblå askytan (x 200–280).
  // Ta FÖRSTA sammanhängande ljusa löpan — guldtexten "COCKTAIL" börjar vid y ≈ 312
  // och är också ljus, men den är askens eget tryck och hör inte till stämpeln.
  const referens = medel(230, 250, 200, 280);
  const bandRader = [];
  for (let y = 200; y < 360; y++) {
    const ljusRad = medel(y, y, 200, 280) > referens + 18;
    if (ljusRad) bandRader.push(y);
    else if (bandRader.length) break;          // löpan slut = stämpelbandets underkant
  }

  function medel(y0, y1, x0, x1) {
    let s = 0, n = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { s += ljus(x, y); n++; }
    return s / n;
  }

  // Horisontell utsträckning på vit botten (där stämpeln är entydigt mätbar).
  const vitZon = (x0, x1, y0, y1) => {
    let minX = Infinity, maxX = -1, minY = Infinity, maxY = -1, n = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (gramarkerad(x, y)) {
      n++; minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    return { n, minX, maxX, minY, maxY };
  };

  return {
    bandA: { yStart: bandRader[0], yStop: bandRader[bandRader.length - 1],
             vitVanster: vitZon(0, 61, 200, 360) },
    bandB: { vitHoger: vitZon(1092, 1199, 800, 960),
             vitMellan: vitZon(752, 786, 800, 960) },
  };
}

// ---------------------------------------------------------------------------
// 2. Pröva beskärningarna. En beskärning duger bara om den (a) inte snuddar
//    vid något stämpelband och (b) innehåller hela produkten.
// ---------------------------------------------------------------------------
const BAND_A = { x0:  54, y0: 256, x1:  650, y1: 307 };
const BAND_B = { x0: 565, y0: 856, x1: 1150, y1: 911 };

const krockar = (a, b) => !(a.x1 < b.x0 || a.x0 > b.x1 || a.y1 < b.y0 || a.y0 > b.y1);
const rymmer  = (yttre, inre) =>
  yttre.x0 <= inre.x0 && yttre.y0 <= inre.y0 && yttre.x1 >= inre.x1 && yttre.y1 >= inre.y1;

function utvarderaBeskarningar() {
  const forslag = [
    { namn: 'Hela bilden',                     r: { x0: 0,   y0: 0,   x1: 1199, y1: 1199 } },
    { namn: 'Bara asken',                      r: ASKEN },
    { namn: 'Bara flaskrutnätet',              r: FLASKOR },
    { namn: 'Asken under band A (y 310→)',     r: { ...ASKEN, y0: 310 } },
    { namn: 'Flaskrad 1–4 (y →775)',           r: { ...FLASKOR, y1: 775 } },
    { namn: 'Mittfältet mellan banden',        r: { x0: 0, y0: 310, x1: 1199, y1: 850 } },
  ];

  return forslag.map(({ namn, r }) => {
    const trafarA = krockar(r, BAND_A);
    const trafarB = krockar(r, BAND_B);
    const helAsk  = rymmer(r, ASKEN);
    const helFlask = rymmer(r, FLASKOR);
    let dom;
    if (trafarA || trafarB) dom = `stämpel kvar (${[trafarA && 'A', trafarB && 'B'].filter(Boolean).join('+')})`;
    else if (!helAsk && !helFlask) dom = 'ren, men produkten är avklippt';
    else dom = 'DUGER';
    return { namn, r, dom };
  });
}

// ---------------------------------------------------------------------------
// 3. Bevismaterial: banden zoomade 3× + hela bilden med banden inringade.
// ---------------------------------------------------------------------------
async function skrivBevis() {
  await mkdir(BEVIS, { recursive: true });

  for (const [namn, b] of [['band-A', BAND_A], ['band-B', BAND_B]]) {
    const marginal = 14;
    const left = Math.max(0, b.x0 - marginal), top = Math.max(0, b.y0 - marginal);
    const width = Math.min(1200 - left, b.x1 - b.x0 + marginal * 2);
    const height = Math.min(1200 - top, b.y1 - b.y0 + marginal * 2);
    await sharp(KALLA)
      .extract({ left, top, width, height })
      .resize({ width: width * 3, kernel: 'lanczos3' })
      .png()
      .toFile(path.join(BEVIS, `${namn}-3x.png`));
  }

  const ram = (b, farg) =>
    `<rect x="${b.x0}" y="${b.y0}" width="${b.x1 - b.x0}" height="${b.y1 - b.y0}" ` +
    `fill="none" stroke="${farg}" stroke-width="4"/>`;
  const svg = Buffer.from(
    `<svg width="1200" height="1200" xmlns="http://www.w3.org/2000/svg">` +
    ram(BAND_A, '#ff0066') + ram(BAND_B, '#ff0066') +
    `<rect x="${ASKEN.x0}" y="${ASKEN.y0}" width="${ASKEN.x1 - ASKEN.x0}" height="${ASKEN.y1 - ASKEN.y0}" fill="none" stroke="#00c2ff" stroke-width="3" stroke-dasharray="10 8"/>` +
    `<rect x="${FLASKOR.x0}" y="${FLASKOR.y0}" width="${FLASKOR.x1 - FLASKOR.x0}" height="${FLASKOR.y1 - FLASKOR.y0}" fill="none" stroke="#00c2ff" stroke-width="3" stroke-dasharray="10 8"/>` +
    `</svg>`);
  await sharp(KALLA).composite([{ input: svg, top: 0, left: 0 }]).png()
    .toFile(path.join(BEVIS, 'overlag.png'));
}

// ---------------------------------------------------------------------------
const matt = await matBanden();
console.log('Uppmätt:');
console.log('  Band A  mörkblå ask, upplyst y', matt.bandA.yStart, '→', matt.bandA.yStop);
console.log('  Band A  vit botten vänster om asken:', JSON.stringify(matt.bandA.vitVanster));
console.log('  Band B  vit botten höger om flaskorna:', JSON.stringify(matt.bandB.vitHoger));
console.log('  Band B  vit botten mellan ask och flaskor:', JSON.stringify(matt.bandB.vitMellan));

console.log('\nBeskärningsförsök:');
const domar = utvarderaBeskarningar();
for (const d of domar) console.log('  ' + d.namn.padEnd(30), d.dom);

await skrivBevis();
console.log('\nBevis skrivet till', BEVIS);

const nagonDuger = domar.some(d => d.dom === 'DUGER');
console.log(nagonDuger
  ? '\nSLUTSATS: en beskärning duger — leveransfilen kan byggas.'
  : '\nSLUTSATS: ingen beskärning duger. Leveransfilen lämnas ORÖRD och bilden ska INTE användas.');
