// CLI för video-lokaliseringen (docs/video-localization.md).
// Skickar mp4:or till HeyGen Video Translate, kollar status och laddar ner resultat.
// Proofread-steget (lokaliseringen) görs i HeyGens UI innan rendering — detta skript
// hanterar transporten runt omkring.
//
//   node localize.mjs check
//   node localize.mjs langs
//   node localize.mjs submit --file=../input/annons.mp4 --lang=Norwegian [--title=namn]
//   node localize.mjs submit --url=https://.../annons.mp4 --lang=Norwegian
//   node localize.mjs status --id=<video_translate_id> [--wait]
//   node localize.mjs download --id=<video_translate_id> [--out=output/localized/]
//   node localize.mjs captions --id=<video_translate_id> [--srt=fil.srt] [--preset=whisper] [--name=adnamn]
//     ↳ tar HeyGen-jobbets video + SRT (eller din redigerade --srt) och bränner in
//       captions via Veeds Subtitle API (fal.ai, kräver FAL_KEY)
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

    case 'submit': {
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
      console.log('Kommandon: check | langs | submit | status | download | captions  (se kommentaren överst i filen)');
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
