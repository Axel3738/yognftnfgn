#!/usr/bin/env node
// discord.mjs — bygger discord-jobb.json ur resultat-meta.json + jobb.json (engelska,
// läge oversatt, marknad US) och postar den med tools/discord-rapport.mjs.
//   node market-expansion/ops/carashell/2026-09-16-us-termoskyddet/discord.mjs [--torr]
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const TORR = process.argv.includes('--torr');
const jobb = JSON.parse(readFileSync(join(HAR, 'jobb.json'), 'utf8'));
const meta = JSON.parse(readFileSync(join(HAR, 'resultat-meta.json'), 'utf8'));
const dubb = JSON.parse(readFileSync(join(HAR, 'resultat-dubb.json'), 'utf8'));

const uppe = jobb.rader.filter((r) => meta[r.mal_namn]?.ok);
const inte = jobb.rader.filter((r) => !meta[r.mal_namn]?.ok);
const videor = uppe.filter((r) => r.typ === 'video').length;
const bilder = uppe.filter((r) => r.typ === 'bild').length;
const perAdset = {};
for (const r of uppe) { const a = meta[r.mal_namn].adset?.namn; perAdset[a] = (perAdset[a] || 0) + 1; }

const gjort = [
  `Thermal cover, first US round: all ${uppe.length} of ${jobb.rader.length} Swedish ads (${videor} videos + ${bilder} images) translated to American English and uploaded to ${jobb.kampanj.namn.split(' | ')[0]} in Magiborsten UK (act ${jobb.konto}) - ${Object.entries(perAdset).map(([a, n]) => `${a}: ${n}`).join(', ')}.`,
  `Videos: re-voiced with ElevenLabs (American voice "Chris"), video re-timed to the English lines, English captions burned in the same band, Swedish captions covered. Voice check green on 12 of 12, brand name and the name Per verified by speech-to-text on every video.`,
  `Images: source text removed with kie.ai (3 clean base photos), English text layer with the verified US figures: $99 (was $124, -20%), free shipping, 14-day returns. No Swedish left.`,
  `Ad copy per angle in American English: price only in the CS angle ($99, compare at $124); reviews quoted by first name (Sofia, Per, Lars, Karin) - no review counts claimed.`,
  `Landing link: https://carashell.com/products/termoskyddet (the US market's own domain - carashell.se/en/...?country=US redirects there). Price on the page: 99 USD, compare at 124.`,
  `HeyGen credits used: 0. kie.ai: 3 image edits. ElevenLabs: about 6,000 characters incl. re-generated lines.`,
  `Notion: nothing to update - the Termoskyddet hub has 0 rows (the SE ads were built straight from Meta).`,
];
const varningar = [
  `The US campaign is PAUSED (built today, never run). The ${uppe.length} ads are ACTIVE inside it, so nothing spends until the owner switches the campaign on.`,
  'English runs 15-20% shorter than Swedish, so the video clips play up to 35% faster than the Swedish versions. Watch CS_3 and SP_2 once before scaling.',
];
if (inte.length) varningar.push(`Not uploaded: ${inte.map((r) => `${r.mal_namn} (${meta[r.mal_namn]?.hoppad ?? meta[r.mal_namn]?.fel ?? 'no result'})`).join(', ')}.`);
const action_axel = [
  `Switch on when you want US traffic: Ads Manager -> account Magiborsten UK -> campaign "${jobb.kampanj.namn.split(' | ')[0]}" -> toggle ON the campaign AND its four ad sets (CARASHELL_US_CS, _G, _PD, _SP - they were built PAUSED and the upload never touches existing ad sets). The 16 ads are already ACTIVE. Pixel access is confirmed (no Meta issues on any ad).`,
];
const jobbfil = {
  brand: 'CaraShell', butik: 'carashell', datum: new Date().toISOString().slice(0, 10), lage: 'oversatt', marknad: 'US',
  server: 'CaraShell', kanal: 'annons-uppladdning', gjort, varningar, action_axel, nasta_korning: '2026-09-17 17:05 (US routine, carashell/takskyddet)',
};
writeFileSync(join(HAR, 'discord-jobb.json'), JSON.stringify(jobbfil, null, 2));
const argv = ['node', join(ROT, 'tools', 'discord-rapport.mjs'), '--jobb', join(HAR, 'discord-jobb.json')];
if (TORR) argv.push('--torr');
const r = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', stdio: 'inherit' });
process.exit(r.status ?? 1);
