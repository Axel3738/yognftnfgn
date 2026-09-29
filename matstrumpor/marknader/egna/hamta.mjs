// hamta.mjs — laddar ner källvideorna (de svenska annonserna) till kalla/<namn>.mp4.
//
//   node matstrumpor/marknader/egna/hamta.mjs            # alla i kallor.json som saknas
//
// Videorna ägs av sidan Matstrumpor.se i en annan Business Manager, så `GET /<video_id>?fields=source`
// svarar utan source med META_ACCESS_TOKEN (mätt 2026-09-29), och de finns inte bland kontots
// advideos. Annonsens förhandsvisning (`/<ad_id>/previews`) bär däremot mp4-länkar — den största
// är originalkvaliteten (720×1280). Samma väg fungerar för varje annons i nya kungen.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const { spawnSync } = await import('node:child_process');
  const env = { ...process.env, NODE_USE_ENV_PROXY: '1' };
  if (!env.NODE_EXTRA_CA_CERTS && existsSync('/root/.ccr/ca-bundle.crt')) env.NODE_EXTRA_CA_CERTS = '/root/.ccr/ca-bundle.crt';
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], { stdio: 'inherit', env });
  process.exit(r.status ?? 1);
}

const HAR = dirname(fileURLToPath(import.meta.url));
const KONTO = '730973156224390';
const t = process.env.META_ACCESS_TOKEN;
if (!t) { console.error('Saknar META_ACCESS_TOKEN'); process.exit(1); }
const kallor = JSON.parse(readFileSync(join(HAR, 'kallor.json'), 'utf8')).videor;
mkdirSync(join(HAR, 'kalla'), { recursive: true });
for (const [namn, k] of Object.entries(kallor)) {
  const fil = join(HAR, 'kalla', `${namn}.mp4`);
  if (existsSync(fil)) { console.log(`${namn}: finns`); continue; }
  const ads = await (await fetch(`https://graph.facebook.com/v23.0/act_${KONTO}/ads?fields=id,name&limit=50&filtering=${encodeURIComponent(JSON.stringify([{ field: 'name', operator: 'EQUAL', value: k.annons }]))}&access_token=${t}`)).json();
  const ad = (ads.data ?? []).find((a) => a.name === k.annons);
  if (!ad) { console.error(`${namn}: hittar inte annonsen ${k.annons}`); process.exitCode = 1; continue; }
  const p = await (await fetch(`https://graph.facebook.com/v23.0/${ad.id}/previews?ad_format=MOBILE_FEED_STANDARD&access_token=${t}`)).json();
  const src = (p.data?.[0]?.body ?? '').match(/src="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
  const sida = await (await fetch(src)).text();
  const lankar = [...new Set([...sida.matchAll(/https?:\\?\/\\?\/[^"'\s]*?\.mp4[^"'\s]*/g)].map((x) => x[0].replace(/\\\//g, '/').replace(/\\u0025/g, '%').replace(/&amp;/g, '&')))];
  let bast = null;
  for (const l of lankar) { const b = Buffer.from(await (await fetch(l)).arrayBuffer()); if (!bast || b.length > bast.length) bast = b; }
  if (!bast) { console.error(`${namn}: ingen mp4 i förhandsvisningen`); process.exitCode = 1; continue; }
  writeFileSync(fil, bast);
  console.log(`${namn}: ${bast.length} byte ur annons ${ad.id}`);
}
