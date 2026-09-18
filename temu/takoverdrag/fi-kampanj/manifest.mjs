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

// DSA-fälten (EU) tas ur SE-kampanjens adsets — aldrig ur huvudet. Alla 10 SE- och 19 FI-adsets bär samma värde (mätt 2026-09-18).
function dsaFran(seAds) {
  const a = seAds.find((x) => x.adset?.dsa_beneficiary);
  return a ? { beneficiary: a.adset.dsa_beneficiary, payor: a.adset.dsa_payor || a.adset.dsa_beneficiary } : { beneficiary: 'Axel Odhner', payor: 'Axel Odhner' };
}
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
// A/B-testet Bäver vs CaraShell i Finland (Axels beslut 2026-09-18): samma 34 annonser, en kampanj per butik.
//   baver        → Magiborsten FI, Majavakauppa-sidan, Bäverbutiken.se-pixeln, majavakauppa.fi
//   carashell    → Magiborsten FI (Axels beslut 2026-09-18 kl 15: "Legg bare ut i Magiborsten FI"), CaraShell-sidan,
//                  CaraShell-pixeln (måste vara delad till FI-kontot i Business Manager — byggskriptet stoppar annars),
//                  carashell.se/fi (FI-marknaden byggd 2026-09-18)
//   carashell_dk → den första CaraShell-armen, byggd i OPS-kontot MagiBorsten DK (kampanj 120249155398780172, PAUSED) —
//                  ersatt av `carashell` i FI-kontot; kvar bara som facit för vad som ligger i DK.
// Annonsnamnen är samma i alla armar (FI_Takoverdrag_…) så de går att jämföra rakt av — och de bär INTE
// prefixet CaraShell_, så nattvakten (/notionscalercs carashell) rör inte testet.
const caraAdset = (se) => `CARASHELL_FI_Kattopeite - ${se.replace(/^Taköverdrag Husvagn 6,5 × 3 m \| /, '').replace(/ \| Notionrunda /, ' | ').replace(/ \| 2026-09-09$/, '')}`;
const CARA = { page_id: '1381171778405935', pixel_id: '28589207184025756', link: 'https://carashell.se/fi/products/takskyddet?country=FI',
  kampanjnamn: `CARASHELL_FI_Kattopeite Asuntovaunu | Launch ${DATUM}`, adsetNamn: caraAdset };
const ARMAR = {
  baver: { konto: 'act_1619718346388201', kontonamn: 'Magiborsten FI', page_id: '1317870104733246', pixel_id: '1554276343018184',
    link: 'https://majavakauppa.fi/products/asuntovaunun-kattopeite-9-pituutta-3-m-levea-suojaa-kalleimman-pinnan',
    kampanjnamn: `Kattopeite Asuntovaunu | FI | Launch ${DATUM}`, adsetNamn: (se) => `FI | ${se}` },
  carashell: { konto: 'act_1619718346388201', kontonamn: 'Magiborsten FI', ...CARA },
  carashell_dk: { konto: 'act_915422744950975', kontonamn: 'Magiborsten DK', ...CARA },
};
const ARM = ARMAR[args.includes('--arm') ? val('--arm') : 'baver'];
if (!ARM) throw new Error('--arm baver|carashell|carashell_dk');
for (const a of adsets) a.fi_namn = ARM.adsetNamn(a.se_namn);
const M = {
  arm: args.includes('--arm') ? val('--arm') : 'baver',
  konto: ARM.konto, kontonamn: ARM.kontonamn, page_id: ARM.page_id, pixel_id: ARM.pixel_id, link: ARM.link,
  kampanjnamn: ARM.kampanjnamn,
  dagsbudget_ore: 110000,                         // platshållare ≈ 100 €/dag (kontot är i SEK) — sätts av Axel före aktivering
  dsa: dsaFran(se),                                // DSA-annonsör/betalare, lästa ur SE-kampanjens adsets
  // Metas creative-features: kopieras ur SE-kampanjens creatives (alla OPT_OUT). `standard_enhancements`
  // accepteras inte längre (Meta-fel 3858504, mätt 2026-09-18) — bara individuella features.
  degrees_of_freedom_spec: se[0].creative.degrees_of_freedom_spec || null,
  adsets, annonser, saknas,
};
writeFileSync(val('--ut'), JSON.stringify(M, null, 1));
console.log(`${adsets.length} adsets · ${annonser.length} annonser (${annonser.filter((a) => a.typ === 'video').length} video, ${annonser.filter((a) => a.typ === 'bild').length} bild) · saknas ${saknas.length}`);
for (const s of saknas) console.log('  saknas:', s.se_namn, '—', s.skal);
