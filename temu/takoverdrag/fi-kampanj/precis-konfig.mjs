#!/usr/bin/env node
// Skriver no-precis-konfigen per video (captions-zon, suddrutor, finska PNG-lager) till <arbete>/precis/<namn>.json.
// Måtten kommer ur NO-facit (no-facit/precis-*.json, mätta 2026-09-16 på samma SE-källvideor) plus det som
// mättes 2026-09-18 för FI: blixtframen med "5-STAR REVIEW!" i CS_1/2/3 och stjärnanimationen i SP_4.
//
//   node temu/takoverdrag/fi-kampanj/precis-konfig.mjs --arbete <mapp>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
const A = path.resolve(args[args.indexOf('--arbete') + 1]);
const HAR = path.dirname(new URL(import.meta.url).pathname);
mkdirSync(`${A}/precis`, { recursive: true });

// Ordcaption-pillren: UGC-mallen (Carl Vicentes) ligger 77–83 % ner; Notionrunda-videorna CO_1/RI_1 något högre.
const UGC = { zon: [950, 1090], standard_cy: 1020, font_px: 32, max_chars: 34, x0: 0, x1: 720, bredd_max: 700, pad_x: 8, pad_y: 8, fyll: [] };
const HOG = { ...UGC, zon: [880, 1015], standard_cy: 947, pad_x: 34 };

const flash = JSON.parse(readFileSync(`${A}/flash.json`, 'utf8'));   // blixtframes (5-STAR REVIEW) per video
const L = (n) => `lager/${n}.png`;
const K = {};
const alla = ['CO_1_H1', 'CS_1_H1', 'CS_2_H1', 'CS_3_H1', 'GT_1_H1', 'GT_2_H1', 'GT_3_H1', 'GT_4_H1', 'GT_5_H1', 'PD_1_H1', 'PD_2_H1', 'PD_3_H1', 'PD_4_H1', 'RI_1_H1', 'SP_1_H1', 'SP_2_H1', 'SP_3_H1', 'SP_4_H1', 'UG_1_H1'];
for (const k of alla) K[k] = { captions: { ...UGC }, blur: [], lager: [] };
for (const k of ['CO_1_H1', 'RI_1_H1']) K[k].captions = { ...HOG };
for (const k of ['CO_1_H1', 'RI_1_H1', 'SP_4_H1', 'UG_1_H1']) K[k].blur_radie = 30;   // stor röd prisgrafik under lagren

// Blixtframen "RV ROOF COVER / 5-STAR REVIEW!" (0,17 s) — hela bilden suddas de framesen
for (const [namn, f] of Object.entries(flash)) for (const [a, b] of f) K[namn.replace('Takoverdrag_', '')].blur.push({ rect: [0, 0, 720, 1280], t: [a - 0.04, b + 0.04] });

// CO_1_H1: prisgrafik 1129/1469 KR 16,7–19,6, FRI FRAKT + 30 DAGARS 19,6–22,55, slutkort 22,55→
K.CO_1_H1.blur.push({ rect: [95, 315, 660, 625], t: [16.7, 19.6] }, { rect: [50, 315, 690, 625], t: [19.6, 22.55] }, { rect: [50, 120, 690, 640], t: [16.75, 17.45] }, { rect: [30, 760, 700, 1070], t: [22.55, 23.3] }, { rect: [108, 242, 618, 392], t: [22.55, 26] });
K.CO_1_H1.lager.push({ png: L('pris'), t: [16.7, 19.6] }, { png: L('jamforpris'), t: [16.7, 19.6] }, { png: L('frifrakt'), t: [19.6, 22.55] }, { png: L('oppetkop'), t: [20.5, 22.55] }, { png: L('slutkort_CO_1_H1'), t: [22.55, 26] });
// RI_1_H1: pris 22,3–25,1, frifrakt/öppet köp 25,1–28,35, slutkort 28,35→
K.RI_1_H1.blur.push({ rect: [95, 315, 660, 625], t: [22.3, 25.1] }, { rect: [50, 315, 690, 625], t: [25.1, 28.35] }, { rect: [50, 120, 690, 640], t: [22.15, 22.85] }, { rect: [30, 760, 700, 1070], t: [28.35, 29.1] }, { rect: [108, 242, 618, 392], t: [28.35, 32] });
K.RI_1_H1.lager.push({ png: L('pris'), t: [22.3, 25.1] }, { png: L('jamforpris'), t: [22.3, 25.1] }, { png: L('frifrakt'), t: [25.1, 28.35] }, { png: L('oppetkop'), t: [26.1, 28.35] }, { png: L('slutkort_RI_1_H1'), t: [28.35, 32] });
// SP_4_H1: 210D-VÄV 16,1–20,35, pris 25,9–28,7, stjärnor 29,0–34,0 (FI: inga recensioner → suddas utan ersättning), slutkort 36,75→
K.SP_4_H1.blur.push({ rect: [30, 262, 660, 545], t: [16.1, 20.35] }, { rect: [95, 315, 660, 625], t: [25.9, 28.7] }, { rect: [110, 690, 640, 870], t: [29.0, 34.2] }, { rect: [30, 760, 700, 1070], t: [36.75, 37.5] }, { rect: [108, 242, 618, 392], t: [36.75, 40] });
K.SP_4_H1.lager.push({ png: L('vav'), t: [16.1, 20.35] }, { png: L('pris'), t: [25.9, 28.7] }, { png: L('jamforpris'), t: [26.4, 28.7] }, { png: L('slutkort_SP_4_H1'), t: [36.75, 40] });
// UG_1_H1: pris uppe till vänster 18,2–20,95, slutkort 23,95→
K.UG_1_H1.blur.push({ rect: [20, 10, 715, 330], t: [18.2, 20.95] }, { rect: [30, 760, 700, 1070], t: [23.95, 24.7] }, { rect: [108, 242, 618, 392], t: [23.95, 27.2] });
K.UG_1_H1.lager.push({ png: L('pris_ug'), t: [18.5, 20.95] }, { png: L('slutkort_UG_1_H1'), t: [23.95, 27.2] });

for (const [k, v] of Object.entries(K)) writeFileSync(`${A}/precis/Takoverdrag_${k}.json`, JSON.stringify(v, null, 1));
console.log(`${Object.keys(K).length} precis-konfigar → ${A}/precis/`);
