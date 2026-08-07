// CLI för video-lokaliseringen (docs/video-localization.md).
// Skickar mp4:or till HeyGen Video Translate, kollar status och laddar ner resultat.
// Proofread-steget (lokaliseringen) görs i HeyGens UI innan rendering — detta skript
// hanterar transporten runt omkring.
//
//   node localize.mjs langs
//   node localize.mjs submit --file=../input/annons.mp4 --lang=Norwegian [--title=namn]
//   node localize.mjs submit --url=https://.../annons.mp4 --lang=Norwegian
//   node localize.mjs status --id=<video_translate_id> [--wait]
//   node localize.mjs download --id=<video_translate_id> [--out=output/localized/]
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  listTargetLanguages, uploadAsset, submitTranslate, getTranslateStatus, downloadResult,
} from './heygen.mjs';

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

    default:
      console.log('Kommandon: langs | submit | status | download  (se kommentaren överst i filen)');
      process.exitCode = cmd ? 1 : 0;
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exitCode = 1;
});
