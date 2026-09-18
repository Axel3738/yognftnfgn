#!/usr/bin/env node
// Bygger manifestet till bygg-kampanj.mjs ur SE-exporten, den finska copyn och de färdiga FI-filerna.
//
//   node temu/takoverdrag/fi-kampanj/manifest.mjs --se <se-ads.json> --copy <fi-copy.json> \
//        --bilder <mapp med FI_<namn>.jpg> --videor <mapp med FI_<namn>.mp4> --ut <manifest.json>
//
// Annonser vars FI-fil saknas (väntar redigerare) tas INTE med — de listas i manifestets `saknas`.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const args = process.argv.slice(2);
const val = (f) => args[args.indexOf(f) + 1];
const se = JSON.parse(readFileSync(val('--se'), 'utf8')).data;
const copy = JSON.parse(readFileSync(val('--copy'), 'utf8')).versioner;
const B = path.resolve(val('--bilder')), V = path.resolve(val('--videor'));
const DATUM = new Date().toISOString().slice(0, 10);

const perAnnons = {};
for (const [k, v] of Object.entries(copy)) for (const n of v.annonser) perAnnons[n] = v;

const adsets = [];
const annonser = [];
const saknas = [];
mkdirSync(`${V}/thumb`, { recursive: true });
for (const ad of se) {
  const seAdset = ad.adset.name;
  if (!adsets.some((a) => a.se_namn === seAdset)) adsets.push({ se_namn: seAdset, fi_namn: `FI | ${seAdset}` });
  const c = perAnnons[ad.name];
  if (!c) { saknas.push({ se_namn: ad.name, skal: 'ingen finsk copy' }); continue; }
  const video = !!ad.creative.object_story_spec?.video_data;
  const bas = { se_namn: ad.name, fi_namn: `FI_${ad.name}`, adset: seAdset, rubrik: c.rubrik, text: c.text, lankbeskrivning: c.lankbeskrivning };
  if (video) {
    const fil = `${V}/FI_${ad.name}.mp4`;
    if (!existsSync(fil)) { saknas.push({ se_namn: ad.name, skal: 'ingen FI-video (väntar redigerare)' }); continue; }
    const thumb = `${V}/thumb/FI_${ad.name}.jpg`;
    if (!existsSync(thumb)) spawnSync('ffmpeg', ['-y', '-v', 'error', '-ss', '1.0', '-i', fil, '-frames:v', '1', '-q:v', '3', thumb]);
    annonser.push({ ...bas, typ: 'video', fil, thumb });
  } else {
    const fil = `${B}/FI_${ad.name}.jpg`;
    if (!existsSync(fil)) { saknas.push({ se_namn: ad.name, skal: 'ingen FI-bild' }); continue; }
    annonser.push({ ...bas, typ: 'bild', fil });
  }
}
const M = {
  konto: 'act_1619718346388201',                 // Magiborsten FI — verifierat 2026-09-18 via /me/adaccounts
  page_id: '1317870104733246',                    // Majavakauppa — samma sida som kontots 70 befintliga FI-annonser
  pixel_id: '1554276343018184',                   // se FI-KAMPANJ-LOGG.md: kontots enda köp-pixel, används av Axels 19 FI-adsets — FRÅGA till Axel
  link: 'https://majavakauppa.fi/products/asuntovaunun-kattopeite-9-pituutta-3-m-levea-suojaa-kalleimman-pinnan',
  kampanjnamn: `Kattopeite Asuntovaunu | FI | Launch ${DATUM}`,
  dagsbudget_ore: 110000,                         // platshållare ≈ 100 €/dag (kontot är i SEK) — sätts av Axel före aktivering
  adsets, annonser, saknas,
};
writeFileSync(val('--ut'), JSON.stringify(M, null, 1));
console.log(`${adsets.length} adsets · ${annonser.length} annonser (${annonser.filter((a) => a.typ === 'video').length} video, ${annonser.filter((a) => a.typ === 'bild').length} bild) · saknas ${saknas.length}`);
for (const s of saknas) console.log('  saknas:', s.se_namn, '—', s.skal);
