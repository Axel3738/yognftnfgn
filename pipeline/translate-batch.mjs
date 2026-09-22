#!/usr/bin/env node
// translate-batch.mjs — batchkörning av HeyGen-lokalisering över en hel Drive-batch
// (rutinen /translate-no). Kör stegvis, state skrivs till disk efter VARJE API-anrop
// så en containeromstart aldrig kostar omrenderingar.
//
//   node translate-batch.mjs proofread --manifest=<batch.json> [--bara=<slug>]   # 0 krediter*
//   node translate-batch.mjs status    --manifest=<batch.json>                    # läge + kvot
//   node translate-batch.mjs apply     --manifest=<batch.json> --srtdir=<mapp>    # rättade SRT:er
//   node translate-batch.mjs render    --manifest=<batch.json> [--bara=<slug>]    # DRAR krediter
//   node translate-batch.mjs download  --manifest=<batch.json> --out=<mapp>
//
// ⚠️ `--marknad=<KOD>` är OBLIGATORISK på varje kommando (NO, US, DK, FI, UK …).
// Språket kommer ur pipeline/sprak.mjs; `--lang` får bara upprepa tabellen.
// Tre spärrar mot fel språk (mätt 2026-09-20: US-videor med norsk röst):
// HeyGens `output_language` läses på sessionen (proofread, render, download),
// och SRT-texten språkkollas — både HeyGens översättning och den rättade.
// Fel språk ⇒ posten stoppas, exit 1, ingen fil i out/.
//
// *) proofread renderar inget, men HeyGen kräver ändå att kontot har 'api'-krediter —
//    är de slut failar sessionen med "Insufficient credit. This operation requires
//    'api' credits" (verifierat 2026-08-29, 47 sessioner). Kör ALLTID `status` först
//    och avbryt om kvoten inte räcker: en failad session bränner ändå ~0,2 kredit.
//
// Manifestet: { "<slug>": { produkt, link, pris_nok, videos: { "<namn>": "<drive-id>" } } }
// Filerna förväntas nedladdade till <manifestmapp>/<slug>/up/<namn>.mp4 (≤32 MB).
// State: <manifest>.state.json bredvid manifestet.
// En session som failat återskapas automatiskt vid nästa proofread-körning —
// samma sak vid HeyGens kända SRT-persist-bugg: kör proofread igen för den videon.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const { spawnSync } = await import('node:child_process');
  const env = { ...process.env, NODE_USE_ENV_PROXY: '1' };
  const ca = '/root/.ccr/ca-bundle.crt';
  if (!env.NODE_EXTRA_CA_CERTS && existsSync(ca)) env.NODE_EXTRA_CA_CERTS = ca;
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], { stdio: 'inherit', env });
  process.exit(r.status ?? 1);
}

const h = await import(new URL('./heygen.mjs', import.meta.url));
const { heygenSprakFor, sprakfamilj, kollaSprak, srtText, namnFor } = await import(new URL('./sprak.mjs', import.meta.url));

const [cmd, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(rest.filter(a => a.startsWith('--')).map(a => {
  const [k, ...v] = a.slice(2).split('=');
  return [k, v.length ? v.join('=') : true];
}));
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (!args.manifest) { console.error('Ange --manifest=<batch.json>'); process.exit(1); }
const mDir = path.dirname(path.resolve(args.manifest));
const manifest = JSON.parse(readFileSync(args.manifest, 'utf8'));
const stateFile = path.resolve(args.manifest) + '.state.json';
const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : {};
const save = () => writeFileSync(stateFile, JSON.stringify(state, null, 1));
// ⛔ Inget tyst standardspråk. Här stod `args.lang || 'Norwegian Bokmål (Norway)'`
// och `args.marknad || 'NO'` — och 2026-09-20 kördes CaraShells US-runda utan
// flaggorna: fyra videor för USA fick NORSK röstmodell som läste ENGELSK text
// och gick live så (batch-loggen sa "amerikansk engelska"). Marknaden är
// obligatorisk, språket kommer ur pipeline/sprak.mjs, och ett `--lang` som
// säger emot tabellen stoppar körningen i stället för att vinna tyst.
const MARKNAD = String(args.marknad ?? '').trim().toUpperCase();
if (!MARKNAD || MARKNAD === 'true') {
  console.error('✗ Ange --marknad=<KOD> (NO, US, DK, FI, UK …). Utan marknad renderar HeyGen på fel språk — mätt 2026-09-20: fyra US-videor fick norsk röst.');
  process.exit(1);
}
const TABELLSPRAK = heygenSprakFor(MARKNAD);
const LANG = typeof args.lang === 'string' ? args.lang : TABELLSPRAK;
if (!LANG) {
  console.error(`✗ Marknaden ${MARKNAD} har inget HeyGen-språk i pipeline/sprak.mjs — lägg in raden (namnet ur listTargetLanguages) och kör igen.`);
  process.exit(1);
}
if (TABELLSPRAK && LANG !== TABELLSPRAK) {
  console.error(`✗ --lang="${LANG}" stämmer inte med marknaden ${MARKNAD} (${TABELLSPRAK} enligt pipeline/sprak.mjs). Rätta det ena — en video på fel språk går live utan felmeddelande.`);
  process.exit(1);
}
const FAMILJ = sprakfamilj(LANG);
console.log(`Marknad: ${MARKNAD} · HeyGen-språk: ${LANG}${FAMILJ ? ` (${namnFor(FAMILJ)})` : ' (ingen SRT-språkkoll för det här språket)'}`);
let sprakfel = 0;   // exit 1 i slutet om något jobb hamnade på fel språk

/** Posten skapades för ett annat språk? En batchmapp per marknad — state saknar
 *  språkdimension, så en NO-post som återanvänds för US hade renderat norska. */
function felSprakIState(st, key) {
  if (st?.sprak && st.sprak !== LANG) { console.error(`✗ ${key}: state-posten skapades för "${st.sprak}", inte "${LANG}" — en batchmapp per marknad. Hoppar.`); sprakfel++; return true; }
  return false;
}
/** HeyGens eget besked om sessionens språk mot det vi bad om. */
function felSprakHosHeygen(st, key, outputLanguage) {
  if (outputLanguage && outputLanguage !== LANG) { console.error(`✗ ${key}: HeyGen säger output_language "${outputLanguage}", vi bad om "${LANG}". Renderas INTE.`); st.sprakfel = `HeyGen: ${outputLanguage}`; sprakfel++; return true; }
  return false;
}
/** SRT-texten mot marknadens språkfamilj (gratis, utan nät). null = kunde inte dömas. */
function kollaSrt(st, key, srt, vad) {
  if (!FAMILJ) return null;
  const k = kollaSprak(srtText(srt), FAMILJ);
  st.sprakkoll = { ...(st.sprakkoll ?? {}), [vad]: { ok: k.ok, gissat: k.gissat, ord: k.ord, skal: k.skal } };
  if (k.ok === false) { console.error(`✗ ${key}: ${vad} — ${k.skal}. Stoppat.`); st.sprakfel = `${vad}: ${k.skal}`; sprakfel++; }
  else if (k.ok === null) console.log(`  ? ${key}: ${vad} — ${k.skal}`);
  else {
    // En rättad SRT som nu är på rätt språk släpper sitt eget stopp (inte HeyGens).
    if (typeof st.sprakfel === 'string' && st.sprakfel.startsWith(`${vad}:`)) delete st.sprakfel;
    console.log(`  ✓ ${key}: ${vad} är ${namnFor(FAMILJ)} (${k.poang[FAMILJ]} funktionsord)`);
  }
  return k.ok;
}

const jobs = [];
for (const [slug, p] of Object.entries(manifest)) {
  if (args.bara && slug !== args.bara) continue;
  for (const name of Object.keys(p.videos)) jobs.push({ slug, name, key: `${slug}_${name}` });
}

async function quotaGuard(min) {
  const q = await h.checkQuota();
  const api = q?.details?.api ?? q?.remaining_quota ?? 0;
  console.log(`Kvot: api=${api} plan_credit=${q?.details?.plan_credit}`);
  if (api < min) {
    console.error(`✗ För få api-krediter (${api} < ${min}). Fyll på på app.heygen.com innan du kör — en körning utan täckning bränner krediter på failade sessioner.`);
    process.exit(2);
  }
  return q;
}

switch (cmd) {
  case 'status': {
    await quotaGuard(0);
    for (const j of jobs) {
      const st = state[j.key] || {};
      let läge = 'ej startad';
      if (st.proofreadId) läge = st.srtDone === 'failed' ? 'PROOFREAD FAIL' : st.srtDone ? 'SRT hämtad' : 'proofread pågår';
      if (st.srtApplied) läge = 'SRT rättad + uppladdad';
      if (st.renderId) läge = st.downloaded ? 'nedladdad' : 'renderar/renderad';
      // Äldre state (före 2026-09-22) bär inget språk — fråga HeyGen (gratis GET),
      // så en gammal batch går att revidera i efterhand: det var så felet hittades.
      if (!st.output_language && st.proofreadId) {
        try { const s = await h.proofreadStatus(st.proofreadId); if (s.output_language) { st.output_language = s.output_language; save(); } } catch (e) { console.error('  (kunde inte läsa språket hos HeyGen:', e.message + ')'); }
      }
      if (st.output_language && st.output_language !== LANG) sprakfel++;
      const sprak = st.output_language ? (st.output_language === LANG ? `✓ ${st.output_language}` : `✗ FEL SPRÅK: ${st.output_language}`) : (st.sprak ? st.sprak : 'språk okänt');
      console.log(`${j.key}: ${läge}${st.error ? ` (${st.error})` : ''}${st.sprakfel ? ` (SPRÅKFEL: ${st.sprakfel})` : ''} · ${sprak}`);
    }
    break;
  }

  case 'proofread': {
    // Grov tumregel ur körloggen: ~1 api-kredit per påbörjad videominut för
    // transkribering+rendering. Kräv minst antalet videor som lägstanivå.
    await quotaGuard(jobs.length);
    for (const j of jobs) {
      state[j.key] ||= {};
      const st = state[j.key];
      if (st.srtDone === 'failed' || st.error) { delete st.proofreadId; delete st.srtDone; delete st.error; } // återskapa failade
      if (felSprakIState(st, j.key)) continue;
      try {
        if (!st.assetUrl) { st.assetUrl = await h.uploadAsset(path.join(mDir, j.slug, 'up', j.name + '.mp4')); save(); console.log('upload ok', j.key); }
        if (!st.proofreadId) { st.proofreadId = await h.proofreadCreate({ videoUrl: st.assetUrl, outputLanguage: LANG, title: MARKNAD + '_' + j.key }); st.sprak = LANG; st.marknad = MARKNAD; save(); console.log('proofread skapad', j.key, `(${LANG})`); }
      } catch (e) { st.error = e.message; save(); console.error('FEL', j.key, e.message); }
    }
    // polla + hämta SRT
    const srtDir = path.join(mDir, 'srt-orig'); mkdirSync(srtDir, { recursive: true });
    let open = jobs.filter(j => state[j.key].proofreadId && !state[j.key].srtDone);
    while (open.length) {
      for (const j of open) {
        const st = state[j.key];
        try {
          const s = await h.proofreadStatus(st.proofreadId);
          if (s.output_language) st.output_language = s.output_language;
          if (['completed', 'success'].includes(s.status)) {
            // getSrt returnerar URL:er ({original_srt_url, srt_url}) — hämta texten färskt
            const urls = await h.proofreadGetSrt(st.proofreadId);
            const oversatt = await h.fetchFresh(urls.srt_url);
            writeFileSync(path.join(srtDir, j.key + '.srt'), oversatt);
            writeFileSync(path.join(srtDir, j.key + '.orig.srt'), await h.fetchFresh(urls.original_srt_url));
            // Två kontroller innan posten räknas som klar: HeyGens eget språk på
            // sessionen, och språket i texten HeyGen faktiskt översatte till.
            // Fel på någon ⇒ 'fel-sprak', och apply/render vägrar posten.
            if (felSprakHosHeygen(st, j.key, s.output_language) || kollaSrt(st, j.key, oversatt, 'HeyGens översättning') === false) {
              st.srtDone = 'fel-sprak'; save();
            } else { st.srtDone = true; save(); console.log('SRT klar', j.key); }
          } else if (s.status === 'failed') {
            st.srtDone = 'failed'; st.error = s.failure_message || 'proofread failed'; save();
            console.error('PROOFREAD FAIL', j.key, st.error);
          }
        } catch (e) { console.error('pollfel', j.key, e.message); }
      }
      open = jobs.filter(j => state[j.key].proofreadId && !state[j.key].srtDone);
      if (open.length) { console.log(open.length + ' kvar …'); await sleep(20000); }
    }
    break;
  }

  case 'apply': {
    // Laddar upp rättade SRT:er och verifierar att de slog igenom (CDN:en laggar).
    if (!args.srtdir) { console.error('Ange --srtdir=<mapp med rättade .srt>'); process.exit(1); }
    for (const j of jobs) {
      const st = state[j.key]; if (!st?.proofreadId || st.srtDone !== true) continue;
      if (felSprakIState(st, j.key)) continue;
      const f = path.join(args.srtdir, j.key + '.srt');
      if (!existsSync(f)) { console.log('ingen rättad SRT för', j.key, '— hoppar'); continue; }
      const srt = readFileSync(f, 'utf8');
      // Den rättade SRT:n är det som läses upp — är den på fel språk läser
      // marknadens röst fel språk. Subagentens text kontrolleras precis som HeyGens.
      if (kollaSrt(st, j.key, srt, 'den rättade SRT:n') === false) { save(); continue; }
      await h.proofreadUploadSrt(st.proofreadId, srt);
      let ok = false;
      for (let i = 0; i < 8 && !ok; i++) {  // upp till 8×8 s — CDN-lagg
        await sleep(8000);
        const urls = await h.proofreadGetSrt(st.proofreadId);
        const live = await h.fetchFresh(urls.srt_url);
        ok = live.replace(/\s+/g, ' ').trim() === srt.replace(/\s+/g, ' ').trim();
      }
      if (!ok) { st.srtApplied = 'MISMATCH'; save(); console.error('⚠️ SRT persisterade inte för', j.key, '— känd HeyGen-bugg: skapa NY proofread-session (kör proofread igen efter att ha nollat posten i state-filen).'); continue; }
      st.srtApplied = true; save(); console.log('SRT verifierad', j.key);
    }
    break;
  }

  case 'render': {
    await quotaGuard(jobs.length);
    for (const j of jobs) {
      const st = state[j.key]; if (!st?.proofreadId || st.srtApplied !== true || st.renderId) continue;
      if (felSprakIState(st, j.key)) continue;
      if (st.sprakfel) { console.error(`✗ ${j.key}: språkfel kvarstår (${st.sprakfel}) — renderas inte.`); sprakfel++; continue; }
      try {
        // Sista spärren före det enda betalsteget: HeyGens egen uppgift om
        // sessionens språk, läst live. Ett fel här kostar inga krediter.
        const s = await h.proofreadStatus(st.proofreadId);
        if (s.output_language) { st.output_language = s.output_language; save(); }
        if (felSprakHosHeygen(st, j.key, s.output_language)) { save(); continue; }
        st.renderId = await h.proofreadGenerate(st.proofreadId); save();
        console.log('render startad', j.key, st.renderId);
      } catch (e) { console.error('RENDERFEL', j.key, e.message); }
    }
    break;
  }

  case 'download': {
    const out = args.out || path.join(mDir, 'out'); mkdirSync(out, { recursive: true });
    let open = jobs.filter(j => state[j.key]?.renderId && !state[j.key].downloaded);
    while (open.length) {
      for (const j of open) {
        const st = state[j.key];
        try {
          const s = await h.getTranslateStatus(st.renderId);  // v3 — v2 ljuger om moderation
          if (s.status === 'success') {
            // Renderns språk enligt HeyGen. Fel språk laddas aldrig ned — en fil
            // som ligger i out/ blir en annons, och det var så 2026-09-20 hände.
            if (s.output_language) st.output_language = s.output_language;
            if (felSprakHosHeygen(st, j.key, s.output_language)) { st.downloaded = 'fel-sprak'; save(); continue; }
            await h.downloadResult(st.renderId, path.join(out, j.key + '.mp4'));
            st.downloaded = true; save(); console.log('nedladdad', j.key);
          } else if (s.status === 'failed' && /moderation/i.test(s.failure_message || '')) {
            console.log('moderationskö:', j.key, '— väntar (släpps oftast inom ~1 h)');
          } else if (s.status === 'failed') { st.downloaded = 'failed'; st.error = s.failure_message || 'render failed'; save(); console.error('RENDER FAIL', j.key, st.error); }
        } catch (e) { console.error('pollfel', j.key, e.message); }
      }
      open = jobs.filter(j => state[j.key]?.renderId && !state[j.key].downloaded);
      if (open.length) { console.log(open.length + ' kvar (moderationsköer kan ta ~1 h) …'); await sleep(30000); }
    }
    break;
  }

  default:
    console.error('Okänt kommando. Se kommentaren högst upp i filen.');
    process.exit(1);
}
if (sprakfel) {
  console.error(`✗ ${sprakfel} språkfel — poster på fel språk är stoppade (se state-filen: srtDone/downloaded = 'fel-sprak', sprakfel). Ingen av dem får laddas upp.`);
  process.exit(1);
}
