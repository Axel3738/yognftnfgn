// Före/efter, steg 2 igen: överdraget PLATT på taket, bara 30–40 cm ner.
import { genereraBild } from '/home/user/yognftnfgn/bildannonser/kie.mjs';
import { writeFileSync, readFileSync } from 'node:fs';
const UT = new URL('./gen/', import.meta.url).pathname;
const CDN = 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/';
const res = JSON.parse(readFileSync(`${UT}resultat.json`, 'utf8'));
const bar = res['fe-1-bar'].url;
const t0 = Date.now();
const r = await genereraBild({
  referensBilder: [bar, `${CDN}tak-van.jpg`, `${CDN}image4.png`],
  bildformat: '1:1', filformat: 'png',
  prompt: `Photorealistic photo edit. Use the FIRST reference photo (white caravan on a gravel driveway by a lake) and keep everything identical: same caravan, same angle, same house, birch trees, lake, light and ground. Only add a roof cover like the one in the other two reference photos: a thin, matte black fabric sheet lying FLAT and tight on top of the caravan's roof, following the roof's shape, with its edge coming down only about 30–40 cm over the top of the walls (the windows stay fully visible and uncovered). From the edge, thin black webbing straps run straight down the white walls at regular intervals and hook under the bottom edge of the caravan. The cover must look like a fitted roof sheet, not a tent or a tarp draped over the whole caravan. No text, no logos, no people.`,
}, { timeoutMs: 420000 });
const url = r.urler[0];
const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
writeFileSync(`${UT}fe-2-med.png`, buf);
res['fe-2-med'] = { url, taskId: r.taskId, modell: r.modell, bytes: buf.length, tid_s: Math.round((Date.now() - t0) / 1000) };
writeFileSync(`${UT}resultat.json`, JSON.stringify(res, null, 2));
console.log(`✓ fe-2-med: ${buf.length} B → ${url}`);
