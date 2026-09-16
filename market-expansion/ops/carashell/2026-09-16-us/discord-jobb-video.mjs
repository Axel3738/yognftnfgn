#!/usr/bin/env node
// discord-jobb-video.mjs — bygger Discord-rapporten (läge oversatt, marknad US) för
// CaraShells andra US-runda ur resultat-meta-video.json + rostkoll-us.json.
//   node market-expansion/ops/carashell/2026-09-16-us/discord-jobb-video.mjs   → discord-jobb-video.json
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HAR = dirname(fileURLToPath(import.meta.url));
const res = JSON.parse(readFileSync(join(HAR, 'resultat-meta-video.json'), 'utf8'));
const rost = JSON.parse(readFileSync(join(HAR, 'rostkoll-us.json'), 'utf8'));
const upp = Object.entries(res).filter(([, v]) => v?.resultat?.ok);
const hoppade = Object.entries(res).filter(([, v]) => !v?.resultat?.ok);
const videor = upp.filter(([k]) => /_H\d$/.test(k)), bilder = upp.filter(([k]) => !/_H\d$/.test(k));
const rad = ([k, v]) => `${k.replace('_US_', '_')} -> ${k} (ad set ${v.resultat.adset.namn}), ad ${v.resultat.annons.id}`;
const jobb = {
  brand: 'CaraShell', butik: 'carashell', datum: '2026-09-16', lage: 'oversatt', marknad: 'US', server: 'CaraShell', kanal: 'annons-uppladdning',
  gjort: [
    `Second US round for the roof cover, on Axel's order: every remaining SE ad translated to American English and uploaded to CARASHELL_US_Taköverdrag in Magiborsten UK (act 1107817401910319), one ad set per concept. The 4 image ads already there were skipped as instructed.`,
    `${videor.length} videos dubbed with HeyGen (English US voice clone + lip sync), scripts rewritten for the US: $199 (was $249, $50 off), free US shipping, 90-day guarantee, "RV"/"trailer". No "today only", no Swedish law, no kronor. Swedish word captions replaced by English ones in the same pill.`,
    ...videor.map(rad),
    `${bilder.length} inherited batch #1 image ads redrawn in English (text removed with Kie / repainted, English layer in PIL): $199 / $249 / 20% off, 90-day guarantee, Johan's review.`,
    ...bilder.map(rad),
    `Voice check 12/12 green (rostkoll.py), and the four top videos were transcribed back with ElevenLabs Scribe against the script: 0 missed words on GT_2 and SP_2.`,
    `HeyGen credits: 6849 -> 5997 (852 used, 12 proofreads + 12 renders, no re-renders).`,
    `Landing link https://carashell.com/products/takskyddet?country=US (own US domain), price on the page $199 (compare $249).`,
    `Notion: no rows exist for these inherited ads (the hub only holds batch #2/#3) - nothing to move.`,
  ],
  varningar: [
    `The US campaign is still PAUSED (never run). All ${upp.length} new ads are ACTIVE inside it, nothing spends until the owner switches the campaign on.`,
    `The 4 image ads uploaded this morning (CaraShellRoof_US_*_4_1) still say "14-day right of withdrawal" in their primary text - the US page now says 90-day guarantee. Not touched (skipped on instruction); needs a new creative if it should change.`,
    ...hoppade.map(([k, v]) => `${k}: not uploaded - ${v?.hoppad || v?.resultat?.fel || 'unknown reason'}`),
  ],
  action_axel: [
    `Switch on the campaign CARASHELL_US_Taköverdrag Husvagn & Husbil 6,5 × 3 m in Magiborsten UK when you want the US test to start (Ads Manager -> campaign toggle). Everything inside is live and waiting.`,
  ],
  nasta_korning: '2026-09-17 17:05',
};
writeFileSync(join(HAR, 'discord-jobb-video.json'), JSON.stringify(jobb, null, 2));
console.log(`discord-jobb-video.json: ${videor.length} videor, ${bilder.length} bilder, ${hoppade.length} hoppade`);
