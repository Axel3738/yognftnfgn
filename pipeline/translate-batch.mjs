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
const LANG = args.lang || 'Norwegian Bokmål (Norway)';

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
      console.log(`${j.key}: ${läge}${st.error ? ` (${st.error})` : ''}`);
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
      try {
        if (!st.assetUrl) { st.assetUrl = await h.uploadAsset(path.join(mDir, j.slug, 'up', j.name + '.mp4')); save(); console.log('upload ok', j.key); }
        if (!st.proofreadId) { st.proofreadId = await h.proofreadCreate({ videoUrl: st.assetUrl, outputLanguage: LANG, title: 'NO_' + j.key }); save(); console.log('proofread skapad', j.key); }
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
          if (['completed', 'success'].includes(s.status)) {
            // getSrt returnerar URL:er ({original_srt_url, srt_url}) — hämta texten färskt
            const urls = await h.proofreadGetSrt(st.proofreadId);
            writeFileSync(path.join(srtDir, j.key + '.srt'), await h.fetchFresh(urls.srt_url));
            writeFileSync(path.join(srtDir, j.key + '.orig.srt'), await h.fetchFresh(urls.original_srt_url));
            st.srtDone = true; save(); console.log('SRT klar', j.key);
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
      const f = path.join(args.srtdir, j.key + '.srt');
      if (!existsSync(f)) { console.log('ingen rättad SRT för', j.key, '— hoppar'); continue; }
      const srt = readFileSync(f, 'utf8');
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
      try {
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
            await h.downloadResult(st.renderId, path.join(out, j.key + '.mp4'));
            st.downloaded = true; save(); console.log('nedladdad', j.key);
          } else if (s.status === 'failed') { st.downloaded = 'failed'; st.error = 'render failed'; save(); console.error('RENDER FAIL', j.key); }
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
