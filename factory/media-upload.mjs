// media-upload.mjs — laddar upp källannonsernas media i MÅLKONTOT.
//
//   node factory/media-upload.mjs <produkt-id> [--marknad SE|NO] [--torr]
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

/** Butikens brandprefix för media i det GEMENSAMMA OPS-kontot.
 *
 *  Alla OPS-butiker delar konto 915422744950975 (Axels beslut 2026-09-07), så
 *  varje uppladdad fil måste bära sin butiks namn för att biblioteket ska gå
 *  att skära per butik. Källan är produktfilens `brand.namn`, med
 *  `creative_prefix` som reserv — samma två fält som kampanjnamnen byggs av.
 *  VERSALER utan å/ä/ö, precis som kampanjprefixet (TANKGUARD_SE_…). */
export function brandprefixAv(produkt) {
  const rå = produkt?.brand?.namn || produkt?.creative_prefix || produkt?.produkt?.id;
  if (!rå) throw new Error('Produktfilen saknar brand.namn och creative_prefix — utan dem går media inte att skära per butik i det delade kontot.');
  return String(rå)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // å/ä/ö → a/a/o
    .replace(/[^A-Za-z0-9]+/g, '')
    .toUpperCase();
}

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
  const produktId = arg.find((a) => !a.startsWith('--') && !String(arg[arg.indexOf(a) - 1] ?? '').startsWith('--'));
  const marknad = (arg.includes('--marknad') ? arg[arg.indexOf('--marknad') + 1] : 'SE').toUpperCase();
  const torr = arg.includes('--torr');
  if (!produktId) throw new Error('Ange produkt-id.');
  if (marknad !== 'SE' && marknad !== 'NO') throw new Error(`--marknad ${marknad} finns inte. Välj SE eller NO.`);

  const p = lasYaml(readFileSync(join(ROT, 'produkter', `${produktId}.yaml`), 'utf8'));
  if (String(p.meta?.ad_account_id) !== MALKONTO.id) {
    throw new Error(`meta.ad_account_id är ${p.meta?.ad_account_id}, ska vara ${MALKONTO.id}. Stoppar.`);
  }
  // Två prefix med två olika jobb:
  //  - `prefix` är KÄLLANS annonsprefix (var brand-detektorn la ner filerna).
  //    För NO gäller `kalla.no_annonsprefix` (Gamasjer_NO_…), med SE-prefixet
  //    som reserv när produktfilen saknar fältet.
  //  - `brandprefix` är MÅLETS namn: media döps efter BUTIKENS brand, aldrig
  //    efter den butik modulen råkade skrivas för. Alla OPS-butiker delar
  //    konto 915422744950975 — hårdkodas prefixet får nästa butiks filer
  //    förra butikens namn, och biblioteket går inte att skära per butik.
  //    (Stod som `DRYTREK_` till 2026-09-09.)
  const suffix = marknad === 'NO' ? '-no' : '';
  const prefix = marknad === 'NO' ? (p.kalla.no_annonsprefix ?? p.kalla.annonsprefix) : p.kalla.annonsprefix;
  const brandprefix = brandprefixAv(p);

  const domar = JSON.parse(readFileSync(join(ROT, 'output', produktId, `brand-detektor${suffix}.json`), 'utf8'));
  const kallor = JSON.parse(readFileSync(join(ROT, 'output', produktId, 'kallannonser.json'), 'utf8'));
  const mediaMapp = join(ROT, '..', '.scratch', 'brand-detektor', prefix, 'media');

  const domAv = new Map(
    (Array.isArray(domar) ? domar : (domar.annonser ?? domar.rader ?? [])).map((d) => [d.namn ?? d.annons, d.dom])
  );

  const utfil = join(ROT, 'output', produktId, `media-i-malkontot${suffix}.json`);
  const redan = existsSync(utfil) ? JSON.parse(readFileSync(utfil, 'utf8')) : {};

  // `med` kräver ACTIVE hela vägen upp till kampanjen. Det är rätt i Sverige,
  // där en pausad annons är en utdömd annons.
  //
  // I Norge stängdes hela KAMPANJEN ner (Gamasjer NO, 6 kr spend totalt) —
  // marknaden lades ner, annonserna dömdes aldrig ut. Alla 16 ligger ACTIVE
  // i ACTIVE adsets inuti den pausade kampanjen. Att läsa det som 16
  // utdömda annonser vore att blanda ihop ett marknadsbeslut med en
  // creative-dom. Därför räknas annons + adset för NO, aldrig kampanjen.
  const kandidater = marknad === 'NO'
    ? (kallor.NO?.annonser ?? []).filter((a) => a.status === 'ACTIVE' && a.adset?.status === 'ACTIVE')
    : (kallor.SE?.annonser ?? []).filter((a) => a.med);
  console.log(`Målkonto: ${MALKONTO.namn} ${MALKONTO.id} · marknad ${marknad}`);
  console.log(`${kandidater.length} källannonser (ACTIVE annons i ACTIVE adset)\n`);

  let uppe = 0;
  let hoppade = 0;
  for (const a of kandidater) {
    const dom = domAv.get(a.namn) ?? 'okänd';
    // En ÅTGÄRDAD fil i output/<id>/bildfix/ vinner över domen. Domen speglar
    // KÄLLAN och ska stå kvar som historik — men steg 4 i /ny-annonser säger
    // "utesluten är inte klar: en annons som bär källans villkor ska FIXAS,
    // inte slängas". Fram till 2026-09-11 fanns ingen väg in för den fixade
    // filen, så allt utom `ren` föll ur bygget hur väl det än var åtgärdat.
    const atgardad = ['jpg', 'png', 'mp4']
      .map((e) => join(ROT, 'output', produktId, 'bildfix', `${a.namn}.${e}`))
      .find((f) => existsSync(f));
    if (dom !== 'ren' && !atgardad) {
      console.log(`   ⏭  ${a.namn}: dom "${dom}" — laddas INTE upp`);
      hoppade++;
      continue;
    }
    if (dom !== 'ren' && atgardad) {
      console.log(`   🛠  ${a.namn}: dom "${dom}" men åtgärdad fil finns — laddar upp den fixade`);
    }
    if (redan[a.namn]) {
      console.log(`   ♻️  ${a.namn}: redan uppe (${redan[a.namn].typ} ${redan[a.namn].id})`);
      uppe++;
      continue;
    }
    const fil = atgardad || join(mediaMapp, `${a.namn}.${a.typ === 'video' ? 'mp4' : 'jpg'}`);
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
      const namn = `${brandprefix}_${a.namn}`;
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
