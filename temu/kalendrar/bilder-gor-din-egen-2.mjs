#!/usr/bin/env node
/**
 * bilder-gor-din-egen-2.mjs — städar adventlane-gor-din-egen-2.jpg
 *
 * KÄLLBILD: adventlane-gor-din-egen-2.jpg (1920 × 1920 px), rippad från
 *           adventlane.se. Det är en LEVERANTÖRSBILD från en kinesisk B2B-sajt:
 *           själva fotot (två blå askar på persikofärgad bakgrund med granar) är
 *           bra, men det ligger två säljlager ovanpå.
 *
 * VAD SOM SKA BORT (allt är pålagda lager, inget av det är tryckt på varan):
 *
 *   1) SPECPANELEN ÖVERST — ett ljust panelband tvärs över hela bilden,
 *      y 0–489 (uppmätt: sista panelljusa raden ligger på y = 489 i varje
 *      kolumnprov från x = 240 till x = 1800). Den innehåller
 *        · orange rubrikruta "盲盒规格材质"
 *        · en spec-lista (名称 / 规格 / 箱规 / 材料 / 色差) med mått och vikter
 *        · en tabell i tre kolumnpar, 24 rader "1号 4x4x7cm" … "24号 7x24.5x7cm"
 *      Måtten är leverantörens fabriksdata, inte kundinformation.
 *
 *   2) REKLAMRADERNA NEDERST — vit text direkt på bakgrunden:
 *        rad 1 "源头大厂、免费设计"   uppmätt bbox x 60–767, y 1678–1751
 *        rad 2 "可定制LOGO/颜色"      uppmätt bbox x 60–690, y 1786–1859
 *      ("egen fabrik, gratis design" / "LOGO och färg kan anpassas") — ren
 *      B2B-säljtext mot återförsäljare.
 *
 * SNITTET: left 0, top 492, width 1920, height 1176  (behåller y 492–1667).
 *
 *   Övre snittet: panelen slutar på y = 489, snittet läggs på y = 492 med tre
 *   pixlars marginal. Mellan panelen och asken (y 490–590) är bakgrunden ren
 *   persika, så inget av produkten offras. Askarnas band/handtag går redan i
 *   originalet in bakom panelen — de blir alltså inte kortare av snittet.
 *
 *   Undre snittet: reklamtexten börjar på y = 1678. Snittet läggs på y = 1668,
 *   tio pixlar ovanför, så hela textbandet försvinner — även skuggan under
 *   bokstäverna. Inget av bokstäverna når över y = 1668 (kontrollmätt kolumn
 *   för kolumn: ingen vit textpixel alls i x 0–1200 mellan y 1560 och 1678).
 *
 * VARFÖR BESKÄRNING OCH INTE ÖVERMÅLNING:
 *   Bakom specpanelen ligger granen, bakgrundens ljusövergång och askarnas
 *   uppåtgående band — allt annat än enfärgat, så övermålning är utesluten
 *   enligt bildbriefen. Ytan bakom reklamraderna ÄR i och för sig i stort sett
 *   enfärgad (uppmätt 245/189/154 ± 5 i hela bandet), men eftersom panelen
 *   överst ändå måste beskäras bort gör samma snitt jobbet i en enda operation
 *   utan en enda målad pixel. Ingen risk för en synlig flat platta.
 *
 * VAD SNITTET KOSTAR — det öppna locket:
 *   Den högra asken står öppen med locket nedfällt framåt som en stor blå
 *   platta. Plattan börjar på y ≈ 1632 (uppmätt: första blå pixeln till höger
 *   om askens kant, x > 1705) och löper ner till y ≈ 1905 — alltså rakt genom
 *   reklamtextens band. Locket kan inte behållas helt OCH texten tas bort med
 *   ett rakt snitt.
 *   Snittet på y = 1668 tar med askens hela underkant (kartongramen slutar på
 *   y ≈ 1655) plus lockets översta ~35 px, som läser som askens fot. Alternativet
 *   — att i stället beskära bort vänsterkanten (x < 790) för att rädda locket —
 *   hade kapat hela den stängda presentasken med "MERRY Christmas"-trycket mitt
 *   itu. Det vore en avklippt produktkant rakt av. Locket är en enfärgad blå
 *   platta utan information; presentaskens framsida är produktens ansikte.
 *   Därför offras locket och inte asken.
 *
 * VAD SOM MEDVETET STÅR KVAR:
 *   Askarnas eget tryck — "WE WISH YOU A VERY / MERRY Christmas / AND HAPPY NEW
 *   YEAR" på den stängda presentasken, och luckornas siffror 1–24 med sina
 *   motiv (tomte, snögubbe, granar, ljusslinga) i den öppna kalendern. Det är
 *   hur varan faktiskt ser ut när kunden får hem den. Granarna och den
 *   persikofärgade fotobakgrunden är fotografi, inte pålägg, och står också kvar.
 *
 * FORMAT: 1920 × 1176 px liggande, JPEG q92. Ingen vit botten läggs på —
 *   askarna sitter centrerade i snittet och fotobakgrunden är persikofärgad,
 *   så vita fält runt om hade sett ut som ett misstag. Kortsidan 1176 px
 *   ligger klart över briefens 800 px, så ingen uppskalning behövs.
 *
 * UTDATA: skriver ÖVER originalfilen (filnamnet behålls, uppladdningsskriptet
 *         döper om den). Originalet sparas som *.original först.
 */

import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
import { readFile, writeFile, access } from 'node:fs/promises';

const SCRATCH = process.argv[2]
  || '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/advent';
const FIL = `${SCRATCH}/bilder/adventlane-gor-din-egen-2.jpg`;
const ORIGINAL = `${FIL}.original`;

// --- Uppmätta koordinater ------------------------------------------------
const PANEL_UNDERKANT = 489;   // sista raden med specpanel
const TEXT_OVERKANT = 1678;    // första raden med reklamtext
const SNITT = { left: 0, top: 492, width: 1920, height: 1176 }; // y 492–1667

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

/** Läser bilden som råa RGB-pixlar med en px(x, y)-funktion. */
async function pixlar(kalla) {
  const { data, info } = await sharp(kalla).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  return {
    W,
    H,
    px: (x, y) => {
      const i = (y * W + x) * C;
      return [data[i], data[i + 1], data[i + 2]];
    },
  };
}

/**
 * Kontrollmätning 1: specpanelen. Den är en ljus, ljuskrämig platta
 * (r > 225, g > 200, b > 185) som täcker hela bildbredden. Räknar rader där
 * fler än halva bredden är panelljus — fotot självt har ingen sådan rad.
 */
async function panelrader(kalla) {
  const { W, H, px } = await pixlar(kalla);
  let rader = 0;
  for (let y = 0; y < H; y++) {
    let ljus = 0;
    for (let x = 0; x < W; x += 4) {
      const p = px(x, y);
      if (p[0] > 225 && p[1] > 200 && p[2] > 185) ljus++;
    }
    if (ljus > (W / 4) * 0.5) rader++;
  }
  return rader;
}

/**
 * Kontrollmätning 2: reklamtexten. Den är vit (r,g,b > 230) och ligger på
 * bildens vänstra tredjedel (x < 1200) under mitten. Räknar sådana pixlar.
 * Askarnas vita siffror ligger alla till höger om x = 850 och ovanför
 * textbandet, så de ger inget utslag i den nedre vänstra kvadranten.
 */
async function vitTextNereTillVanster(kalla) {
  const { H, px } = await pixlar(kalla);
  let n = 0;
  for (let y = Math.floor(H * 0.55); y < H; y++) {
    for (let x = 0; x < 820; x++) {
      const p = px(x, y);
      if (p[0] > 230 && p[1] > 230 && p[2] > 226) n++;
    }
  }
  return n;
}

async function main() {
  await sparaOriginal();

  const km = await sharp(ORIGINAL).metadata();
  console.log(`· källa: ${km.width} × ${km.height} px`);

  // 1) Verifiera att de uppmätta gränserna stämmer mot källan innan snittet.
  const { px } = await pixlar(ORIGINAL);
  const sistaPanel = px(960, PANEL_UNDERKANT);
  const forstaFri = px(960, SNITT.top);
  console.log(`· panelens sista rad (y ${PANEL_UNDERKANT}): rgb ${sistaPanel.join('/')}`);
  console.log(`· snittets första rad (y ${SNITT.top}): rgb ${forstaFri.join('/')} (ren bakgrund)`);
  const marginal = TEXT_OVERKANT - (SNITT.top + SNITT.height);
  console.log(`· marginal ner till reklamtexten: ${marginal} px`);

  // 2) Snittet.
  await sharp(ORIGINAL)
    .extract(SNITT)
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(FIL);

  const slut = await sharp(FIL).metadata();
  console.log(`✅ ${FIL} — ${slut.width} × ${slut.height} px`);

  // 3) Kontrollmätningar före/efter. Ögonen på bilden är det slutgiltiga beviset.
  console.log(`· panelrader:  original ${await panelrader(ORIGINAL)} → resultat ${await panelrader(FIL)}`);
  console.log(`· vit text nere t.v.: original ${await vitTextNereTillVanster(ORIGINAL)} px`
    + ` → resultat ${await vitTextNereTillVanster(FIL)} px`);
}

await main();
