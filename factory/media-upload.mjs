// media-upload.mjs — laddar upp källannonsernas media i MÅLKONTOT.
//
//   node factory/media-upload.mjs <produkt-id> [--torr]
//
// Steg 7 i `/ny-annonser`. `image_hash` och `video_id` är PER KONTO —
// Bäverbutikens creatives går inte att referera från OPS-kontot. Filen måste
// laddas upp på nytt.
//
// Källfilerna är redan nedladdade av brand-detektorn (--hamta) och ligger i
// .scratch/brand-detektor/<prefix>/media/. Vi laddar aldrig ner dem två gånger.
//
// ⚠️ Bara annonser med domen `ren` laddas upp. En `okänd` dom betyder att en
// yta inte gick att läsa — den ska stängas först, inte laddas upp och hoppas
// på (regeln i /ny-annonser steg 9).
//
// ⚠️ Media i kontot är INTE en annons. Det här steget fyller biblioteket;
// annonserna byggs i kampanjsteget och räknas med act_<id>/ads.

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { MALKONTO } from './kallannonser.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const GRAPH = 'https://graph.facebook.com/v21.0';

async function graphPost(sokvag, form) {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('Saknar META_ACCESS_TOKEN.');
  form.set('access_token', token);
  const r = await fetch(`${GRAPH}${sokvag}`, { method: 'POST', body: form });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Meta ${sokvag}: ${j.error?.message ?? r.status}`);
  return j;
}

export async function laddaUppVideo(kontoId, fil, namn) {
  const form = new FormData();
  form.set('name', namn);
  form.set('source', new Blob([readFileSync(fil)]), `${namn}.mp4`);
  const j = await graphPost(`/act_${kontoId}/advideos`, form);
  return j.id;
}

export async function laddaUppBild(kontoId, fil, namn) {
  const form = new FormData();
  form.set('filename', new Blob([readFileSync(fil)]), `${namn}.jpg`);
  const j = await graphPost(`/act_${kontoId}/adimages`, form);
  // Svaret är { images: { "<filnamn>": { hash, url } } }
  const forsta = Object.values(j.images ?? {})[0];
  if (!forsta?.hash) throw new Error(`Ingen hash tillbaka för ${namn}.`);
  return forsta.hash;
}

if (process.argv[1] && process.argv[1].endsWith('media-upload.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const produktId = arg.find((a) => !a.startsWith('--'));
  const torr = arg.includes('--torr');
  if (!produktId) throw new Error('Ange produkt-id.');

  const p = lasYaml(readFileSync(join(ROT, 'produkter', `${produktId}.yaml`), 'utf8'));
  if (String(p.meta?.ad_account_id) !== MALKONTO.id) {
    throw new Error(`meta.ad_account_id är ${p.meta?.ad_account_id}, ska vara ${MALKONTO.id}. Stoppar.`);
  }
  const prefix = p.kalla.annonsprefix;

  const domar = JSON.parse(readFileSync(join(ROT, 'output', produktId, 'brand-detektor.json'), 'utf8'));
  const kallor = JSON.parse(readFileSync(join(ROT, 'output', produktId, 'kallannonser.json'), 'utf8'));
  const mediaMapp = join(ROT, '..', '.scratch', 'brand-detektor', prefix, 'media');

  const domAv = new Map(
    (Array.isArray(domar) ? domar : (domar.annonser ?? domar.rader ?? [])).map((d) => [d.namn ?? d.annons, d.dom])
  );

  const utfil = join(ROT, 'output', produktId, 'media-i-malkontot.json');
  const redan = existsSync(utfil) ? JSON.parse(readFileSync(utfil, 'utf8')) : {};

  const kandidater = kallor.SE.annonser.filter((a) => a.med);
  console.log(`Målkonto: ${MALKONTO.namn} ${MALKONTO.id}`);
  console.log(`${kandidater.length} ACTIVE källannonser\n`);

  let uppe = 0;
  let hoppade = 0;
  for (const a of kandidater) {
    const dom = domAv.get(a.namn) ?? 'okänd';
    if (dom !== 'ren') {
      console.log(`   ⏭  ${a.namn}: dom "${dom}" — laddas INTE upp`);
      hoppade++;
      continue;
    }
    if (redan[a.namn]) {
      console.log(`   ♻️  ${a.namn}: redan uppe (${redan[a.namn].typ} ${redan[a.namn].id})`);
      uppe++;
      continue;
    }
    const fil = join(mediaMapp, `${a.namn}.${a.typ === 'video' ? 'mp4' : 'jpg'}`);
    if (!existsSync(fil)) {
      console.log(`   ❌ ${a.namn}: filen saknas lokalt (${fil}) — kör brand-detektorn med --hamta`);
      hoppade++;
      continue;
    }
    const mb = (statSync(fil).size / 1024 / 1024).toFixed(1);
    if (torr) {
      console.log(`   ▫️ ${a.namn}: ${a.typ}, ${mb} MB — skulle laddas upp`);
      continue;
    }
    try {
      const namn = `DRYTREK_${a.namn}`;
      const id =
        a.typ === 'video'
          ? await laddaUppVideo(MALKONTO.id, fil, namn)
          : await laddaUppBild(MALKONTO.id, fil, namn);
      redan[a.namn] = { typ: a.typ === 'video' ? 'video_id' : 'image_hash', id, namn };
      writeFileSync(utfil, JSON.stringify(redan, null, 2));
      console.log(`   ✅ ${a.namn}: ${a.typ} ${mb} MB → ${id}`);
      uppe++;
    } catch (e) {
      console.log(`   ❌ ${a.namn}: ${e.message.slice(0, 120)}`);
    }
  }

  console.log(`\nRäkning: ${uppe} media uppe, ${hoppade} hoppade av ${kandidater.length} ACTIVE källannonser.`);
  console.log('⚠️ Media i kontot är INTE en annons. Annonserna byggs i kampanjsteget.');
  if (!torr) console.log(`\n✓ ${utfil}`);
}
