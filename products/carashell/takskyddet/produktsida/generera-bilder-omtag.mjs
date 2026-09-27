// Tredje försöket: studio (krokar under kanten), krokmakro (rätt krokform) och
// före/efter i tre steg (bar husvagn utan referens → överdrag på → stapla).
import { genereraBild } from '/home/user/yognftnfgn/bildannonser/kie.mjs';
import { writeFileSync, readFileSync } from 'node:fs';

const UT = new URL('./gen/', import.meta.url).pathname;
const CDN = 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/';
const REF = { husbil: `${CDN}image4.png`, husbilFram: `${CDN}tak-van.jpg`, hopvikt: `${CDN}tak-hopvikt.jpg`, spanne: `${CDN}tak-spanne.jpg` };
const GEMENSAMT = 'Photorealistic commercial product photography. No text, no letters, no logos, no watermark, no people.';

async function kor(namn, jobb) {
  const t0 = Date.now();
  const r = await genereraBild({ ...jobb, bildformat: '1:1', filformat: 'png' }, { timeoutMs: 420000 });
  const url = r.urler[0];
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(`${UT}${namn}.png`, buf);
  const fil = `${UT}resultat.json`;
  const res = JSON.parse(readFileSync(fil, 'utf8'));
  res[namn] = { url, taskId: r.taskId, modell: r.modell, bytes: buf.length, prompt: jobb.prompt, ref: jobb.referensBilder ?? [], tid_s: Math.round((Date.now() - t0) / 1000) };
  writeFileSync(fil, JSON.stringify(res, null, 2));
  console.log(`✓ ${namn}: ${buf.length} B, ${Math.round((Date.now() - t0) / 1000)} s → ${url}`);
  return url;
}

const vilka = process.argv.slice(2);
const alla = vilka.length === 0;

const jobb = [];

if (alla || vilka.includes('studio')) jobb.push(kor('studio-husbil', {
  referensBilder: [REF.husbilFram, REF.spanne],
  prompt: `${GEMENSAMT} A modern white integrated motorhome standing in a clean light-grey photo studio with soft even lighting and a soft floor shadow. On its roof lies a matte black 210D oxford roof cover: it covers the entire roof and its edge hangs about 30–40 cm down over the sides. From the edge of the cover, black webbing straps run straight down the white sides at regular intervals and disappear under the lower body edge, where they are hooked and pulled taut. IMPORTANT: nothing hangs below the body — no strap, no hook and no loose end is visible under the vehicle or on the floor. Three-quarter front view from a slightly elevated camera so the covered roof is clearly visible. Sharp, catalog quality. Square format.`,
}));

if (alla || vilka.includes('krokar')) jobb.push(kor('krokar-makro', {
  referensBilder: [REF.spanne],
  prompt: `${GEMENSAMT} Macro product photo on a light grey stone surface of the two straps in the reference photo: two identical black webbing straps, each with a black plastic slide adjuster buckle, each ending in the SAME black plastic hook as in the reference — a flat, wide J-shaped hook with a straight shank and a rounded lip that turns back (NOT an S-hook, NOT a round wire hook). Both hooks identical in shape and size, lying side by side diagonally across the frame with the hooks in the lower right. Shallow depth of field, soft directional studio light, high detail on the strap weave and the smooth hook surface. Square format.`,
}));

if (alla || vilka.includes('fore-efter')) jobb.push((async () => {
  // Steg 1: bar husvagn, ingen referens (annars kopieras överdraget in).
  const bar = await kor('fe-1-bar', {
    referensBilder: [],
    prompt: `${GEMENSAMT} A white caravan (travel trailer with a tow hitch and a grey stripe along the side) parked on a gravel driveway beside a dark-grey Swedish wooden house, birch trees with yellow autumn leaves and a lake in the background, soft overcast autumn daylight. The caravan is completely bare: plain white roof, nothing on it, no straps. Three-quarter front view, camera slightly elevated so the roof is visible. Square format.`,
  });
  // Steg 2: samma bild + överdraget på.
  const med = await kor('fe-2-med', {
    referensBilder: [bar, REF.husbil, REF.spanne],
    prompt: `${GEMENSAMT} Take the first reference photo (the white caravan on the gravel driveway) and keep EVERYTHING identical — same caravan, same angle, same house, trees, lake, light and ground. Only add the black roof cover from the other reference photos onto the caravan's roof: matte black 210D oxford fabric covering the whole roof, its edge hanging about 30–40 cm down over the sides, and black webbing straps running down the white sides at regular intervals, hooked under the lower body edge and pulled taut. Square format.`,
  });
  // Steg 3: stapla.
  await kor('fore-efter-husvagn', {
    referensBilder: [bar, med],
    prompt: `Create one square image that shows the two reference photos stacked vertically: the FIRST reference photo (bare caravan) on top and the SECOND reference photo (same caravan with the black roof cover) below, each cropped to a wide 2:1 panel, separated by a thin white gap. Do not alter the photos in any other way, do not add text, labels, arrows or icons.`,
  });
})());

await Promise.all(jobb);
console.log('KLART');
