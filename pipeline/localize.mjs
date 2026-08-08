// CLI för video-lokaliseringen (docs/video-localization.md).
//
// STANDARDFLÖDE (kreditsnålt — rendera ALDRIG före proofread):
//   node localize.mjs proofread --file=annons.mp4 --lang="Norwegian Bokmål (Norway)"   # 0 krediter
//     ↳ transkriberar + översätter UTAN att rendera; laddar ner SRT för granskning
//   (gör lokaliseringsrättningarna i SRT-filen)
//   node localize.mjs apply-srt --id=<proofread_id> --srt=rättad.srt                   # 0 krediter
//   node localize.mjs render --id=<proofread_id>                                       # DRAR krediter
//   node localize.mjs status --id=<video_translate_id> [--wait]
//   node localize.mjs download --id=<video_translate_id> [--out=output/localized/]
//
// Övriga kommandon:
//   node localize.mjs check
//   node localize.mjs langs
//   node localize.mjs submit --file=... --lang=...   # ⚠️ renderar DIREKT utan proofread
//   node localize.mjs burn --video=fil.mp4 --srt=fil.srt [--out=...]
//     ↳ bränner in stylade captions lokalt med ffmpeg — gratis, inget konto behövs
//   node localize.mjs captions --id=<video_translate_id> [--srt=fil.srt] [--preset=whisper] [--name=adnamn]
//     ↳ alternativ: Veeds Subtitle API via fal.ai (kräver FAL_KEY, ~$0.10/min)
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

// I Claude Codes webbmiljö går utgående HTTPS via en proxy som Nodes fetch inte
// plockar upp från miljön automatiskt — starta i så fall om med proxy-stödet påslaget.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const { spawnSync } = await import('node:child_process');
  const { existsSync } = await import('node:fs');
  const env = { ...process.env, NODE_USE_ENV_PROXY: '1' };
  const ca = '/root/.ccr/ca-bundle.crt';
  if (!env.NODE_EXTRA_CA_CERTS && existsSync(ca)) env.NODE_EXTRA_CA_CERTS = ca;
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], { stdio: 'inherit', env });
  process.exit(r.status ?? 1);
}
import {
  checkQuota, listTargetLanguages, uploadAsset, submitTranslate, getTranslateStatus, downloadResult,
  proofreadCreate, proofreadStatus, proofreadGetSrt, proofreadUploadSrt, proofreadGenerate, fetchFresh,
} from './heygen.mjs';
import {
  submitSubtitles, getSubtitlesStatus, getSubtitlesResult, downloadUrl,
} from './veed.mjs';

const [cmd, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(
  rest.filter((a) => a.startsWith('--')).map((a) => {
    const [k, ...v] = a.slice(2).split('=');
    return [k, v.length ? v.join('=') : true];
  }),
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  switch (cmd) {
    case 'check': {
      const quota = await checkQuota();
      console.log('✅ HeyGen-kopplingen funkar.');
      console.log(`   Kvar-kvot: ${JSON.stringify(quota)}`);
      break;
    }

    case 'langs': {
      const langs = await listTargetLanguages();
      console.log(langs.join('\n'));
      break;
    }

    case 'proofread': {
      if (!args.lang) throw new Error('Ange --lang=<målspråk> (se `node localize.mjs langs`).');
      let videoUrl = args.url;
      if (!videoUrl) {
        if (!args.file) throw new Error('Ange --file=<lokal mp4> eller --url=<publik mp4-URL>.');
        console.log(`Laddar upp ${args.file} …`);
        videoUrl = await uploadAsset(args.file);
      }
      const title = args.title ?? (args.file ? path.basename(args.file, path.extname(args.file)) : undefined);
      const pid = await proofreadCreate({ videoUrl, outputLanguage: args.lang, title });
      console.log(`Proofread-session skapad (0 krediter): ${pid}`);
      let st = await proofreadStatus(pid);
      while (!['completed', 'success', 'failed'].includes(st.status)) {
        console.log(`status: ${st.status} … väntar 15s`);
        await sleep(15_000);
        st = await proofreadStatus(pid);
      }
      if (st.status === 'failed') throw new Error(`Proofread misslyckades: ${JSON.stringify(st)}`);
      const { srt_url, original_srt_url } = await proofreadGetSrt(pid);
      const outDir = typeof args.out === 'string' ? args.out : 'output/localized';
      await mkdir(outDir, { recursive: true });
      const { writeFile } = await import('node:fs/promises');
      const base = path.join(outDir, (title ?? pid).replace(/[^\w.-]+/g, '_'));
      await writeFile(`${base}-translated.srt`, await fetchFresh(srt_url));
      if (original_srt_url) await writeFile(`${base}-original.srt`, await fetchFresh(original_srt_url));
      console.log(`SRT nedladdad: ${base}-translated.srt`);
      console.log('Nästa steg: gör lokaliseringsrättningarna i SRT:en, sen:');
      console.log(`  node localize.mjs apply-srt --id=${pid} --srt=<rättad.srt>`);
      console.log(`  node localize.mjs render --id=${pid}`);
      break;
    }

    case 'apply-srt': {
      if (!args.id || typeof args.srt !== 'string') throw new Error('Ange --id=<proofread_id> och --srt=<rättad srt-fil>.');
      const { readFile } = await import('node:fs/promises');
      const content = await readFile(args.srt, 'utf8');
      await proofreadUploadSrt(args.id, content);
      const { srt_url } = await proofreadGetSrt(args.id);
      const live = await fetchFresh(srt_url);
      if (live.trim() !== content.trim()) {
        console.warn('⚠️  Verifiering: innehållet på servern matchar inte filen exakt — dubbelkolla innan render.');
      } else {
        console.log('✅ Rättad SRT uppladdad och verifierad.');
      }
      console.log(`Rendera när du är redo (DRAR krediter): node localize.mjs render --id=${args.id}`);
      break;
    }

    case 'render': {
      if (!args.id) throw new Error('Ange --id=<proofread_id>.');
      const before = await checkQuota();
      const vid = await proofreadGenerate(args.id);
      console.log(`Rendering startad: ${vid}`);
      console.log(`Kvot före render: ${JSON.stringify(before?.remaining_quota ?? before)}`);
      console.log(`Följ med: node localize.mjs status --id=${vid} --wait`);
      break;
    }

    case 'submit': {
      console.warn('⚠️  submit renderar DIREKT utan proofread — använd `proofread` för det kreditsnåla flödet.');
      if (!args.lang) throw new Error('Ange --lang=<målspråk> (se `node localize.mjs langs`).');
      let videoUrl = args.url;
      if (!videoUrl) {
        if (!args.file) throw new Error('Ange --file=<lokal mp4> eller --url=<publik mp4-URL>.');
        console.log(`Laddar upp ${args.file} …`);
        videoUrl = await uploadAsset(args.file);
      }
      const title = args.title ?? (args.file ? path.basename(args.file, path.extname(args.file)) : undefined);
      const id = await submitTranslate({ videoUrl, outputLanguage: args.lang, title });
      console.log(`Skickat. video_translate_id: ${id}`);
      console.log('⚠️  Glöm inte proofread-steget i HeyGens UI innan videon godkänns — se docs/video-localization.md.');
      break;
    }

    case 'status': {
      if (!args.id) throw new Error('Ange --id=<video_translate_id>.');
      let data = await getTranslateStatus(args.id);
      while (args.wait && data.status !== 'success' && data.status !== 'failed') {
        console.log(`status: ${data.status} … väntar 30s`);
        await sleep(30_000);
        data = await getTranslateStatus(args.id);
      }
      console.log(JSON.stringify(data, null, 2));
      break;
    }

    case 'download': {
      if (!args.id) throw new Error('Ange --id=<video_translate_id>.');
      const outDir = typeof args.out === 'string' ? args.out : 'output/localized';
      await mkdir(outDir, { recursive: true });
      const data = await getTranslateStatus(args.id);
      const name = (data.title ?? args.id).replace(/[^\w.-]+/g, '_');
      const outPath = path.join(outDir, `${name}.mp4`);
      await downloadResult(args.id, outPath);
      console.log(`Sparad: ${outPath}`);
      console.log('Nästa steg: Veed → auto-subtitles på målspråket → burn-in → leverans.');
      break;
    }

    case 'burn': {
      if (!args.video || !args.srt) throw new Error('Ange --video=<mp4> och --srt=<srt-fil>.');
      const { spawnSync } = await import('node:child_process');
      const outPath = typeof args.out === 'string'
        ? args.out
        : args.video.replace(/\.mp4$/i, '') + '-captions.mp4';
      // Vit fet text på halvtransparent mörk platta. MarginV håller texten inom
      // mitt-4:5 av en 9:16-video — Meta croppar till ~4:5 i feed, så captions
      // närmare botten klipps bort. Justera force_style här vid behov.
      const style = "FontName=Liberation Sans,Bold=1,FontSize=10,PrimaryColour=&H00FFFFFF,BorderStyle=4,BackColour=&H80101010,Outline=1,Shadow=0,MarginV=68,Alignment=2";
      const srtEscaped = args.srt.replace(/([:'\\])/g, '\\$1');
      const r = spawnSync('ffmpeg', [
        '-y', '-v', 'error', '-i', args.video,
        '-vf', `subtitles=${srtEscaped}:force_style='${style}'`,
        '-c:a', 'copy', outPath,
      ], { stdio: 'inherit' });
      if (r.error?.code === 'ENOENT') throw new Error('ffmpeg saknas — installera med: apt-get install -y ffmpeg');
      if (r.status !== 0) throw new Error(`ffmpeg misslyckades (exit ${r.status}).`);
      console.log(`✅ Färdig video med inbrända captions: ${outPath}`);
      break;
    }

    case 'captions': {
      if (!args.id) throw new Error('Ange --id=<video_translate_id> (HeyGen-jobbet vars video ska textas).');
      const data = await getTranslateStatus(args.id);
      if (data.status !== 'success') throw new Error(`HeyGen-jobbet är inte klart (status: ${data.status}).`);

      let srtContent;
      if (typeof args.srt === 'string') {
        const { readFile } = await import('node:fs/promises');
        srtContent = await readFile(args.srt, 'utf8');
      } else if (data.caption_url) {
        const res = await fetch(data.caption_url);
        if (!res.ok) throw new Error(`Kunde inte hämta HeyGens SRT: HTTP ${res.status}`);
        srtContent = await res.text();
      }

      console.log('Skickar till Veed Subtitle API …');
      const reqId = await submitSubtitles({
        videoUrl: data.url,
        srtContent,
        preset: typeof args.preset === 'string' ? args.preset : undefined,
      });
      let st = await getSubtitlesStatus(reqId);
      while (st.status !== 'COMPLETED') {
        if (st.status === 'FAILED' || st.status === 'ERROR') throw new Error(`Veed-jobbet misslyckades: ${JSON.stringify(st)}`);
        console.log(`veed: ${st.status} … väntar 15s`);
        await sleep(15_000);
        st = await getSubtitlesStatus(reqId);
      }
      const resultUrl = await getSubtitlesResult(reqId);
      const outDir = typeof args.out === 'string' ? args.out : 'output/localized';
      await mkdir(outDir, { recursive: true });
      const name = (args.name ?? data.title ?? args.id).replace(/[^\w.-]+/g, '_');
      const outPath = path.join(outDir, `${name}-captions.mp4`);
      await downloadUrl(resultUrl, outPath);
      console.log(`✅ Färdig video med inbrända captions: ${outPath}`);
      break;
    }

    default:
      console.log('Kommandon: proofread | apply-srt | render | status | download | burn | check | langs | submit | captions  (se kommentaren överst i filen)');
      process.exitCode = cmd ? 1 : 0;
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  if (/fetch failed|CONNECT|allowlist|403|407/i.test(String(err.cause ?? err.message))) {
    console.error('   (Nätverksfel — kontrollera att api.heygen.com och upload.heygen.com är tillåtna i environmentets nätverkspolicy.)');
  }
  process.exitCode = 1;
});
