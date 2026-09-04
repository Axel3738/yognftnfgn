#!/usr/bin/env node
// notion-till-marknad.mjs — laddar upp översatta creatives i produktens BEFINTLIGA
// kampanj i en marknads annonskonto (Magiborsten NO i dag). Används av /oversatt.
// Bygger på tools/meta-lib.mjs (samma spärrar som tools/notion-till-meta.mjs).
//
//   node tools/notion-till-marknad.mjs --marknad NO --jobb <jobb.json> --media <mapp>
//        --copy <adcopy-NO.json> [--bara <annonsnamn>] [--dry] [--aktivera]
//
//   jobb.json  från tools/oversattningskon.mjs (status KÖR körs, allt annat hoppas)
//   --media    mappen med färdiga filer: <mapp>/<målnamn>.jpg|.png|.mp4
//   --copy     { "<målnamn>": { message, headline, description } } — per annons
//   --aktivera slå på annonsen (+ adset körningen själv skapade) om marknadens
//              status är ACTIVE och kampanjen är ACTIVE
//
// SPÄRRAR SOM INTE GÅR ATT FLAGGA BORT:
//  1. Kampanjens account_id måste vara marknadens konto (marknader.json). Annars avbryt.
//  2. PAUSED med spend = avvecklad. Laddar inte upp.
//  3. Dubblett på annonsnamn i hela målkontot = redan gjord.
//  4. Vinkeln K kommer ur jobbfilen (SE-namnet), aldrig ur målnamnet. Adset =
//     "<adset_prefix> - <K>", exakt namn; saknas det klonas ett syskon (aldrig
//     fallback-geo). Nytt adset föds PAUSED.
//  5. Allt föds PAUSED. Aktivering rör bara annonsen och adset körningen skapade.
//
// Resultatet skrivs tillbaka i jobb.json (mal.annonsId, mal.adsetId, mal.status)
// så Notion-steget kan kommentera med id:n.

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import {
  säkerställProxy, api, alla, kampanjUtfall, hittaEllerSkapaAdset, laddaUppBild,
  laddaUppVideo, väntaPåThumb, ärvSidaOchIg, skapaAnnons, aktivera, ingaEnhancements, logg,
} from './meta-lib.mjs';

säkerställProxy();

const ROT = new URL('..', import.meta.url).pathname;
const args = process.argv.slice(2);
const flagga = (n, s = null) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s; };
const finns = (n) => args.includes(`--${n}`);
const DRY = finns('dry');
const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

const kod = (flagga('marknad') || '').toUpperCase();
if (!kod) dö('Ange --marknad <KOD>.');
const MARKNADER = JSON.parse(readFileSync(resolve(ROT, 'market-expansion/marknader.json'), 'utf8'));
const M = MARKNADER[kod];
if (!M) dö(`Okänd marknad "${kod}".`);
const jobbFil = flagga('jobb');
const mediaMapp = flagga('media');
const copyFil = flagga('copy');
if (!jobbFil || !existsSync(jobbFil)) dö('Ange --jobb <jobb.json> (från oversattningskon.mjs).');
if (!mediaMapp || !existsSync(mediaMapp)) dö('Ange --media <mapp> med de färdiga filerna.');
if (!copyFil || !existsSync(copyFil)) dö('Ange --copy <adcopy-<KOD>.json> med copy per annons.');
const bara = flagga('bara');

const jobbData = JSON.parse(readFileSync(jobbFil, 'utf8'));
if (jobbData.marknad !== kod) dö(`Jobbfilen är för marknad ${jobbData.marknad}, inte ${kod}.`);
const copy = JSON.parse(readFileSync(copyFil, 'utf8'));

function hittaMedia(namn) {
  for (const ä of ['.jpg', '.jpeg', '.png', '.mp4', '.mov']) {
    const f = join(mediaMapp, `${namn}${ä}`);
    if (existsSync(f)) return f;
  }
  return null;
}

const spara = () => writeFileSync(jobbFil, JSON.stringify(jobbData, null, 2));

async function main() {
  const körs = jobbData.jobb.filter(j => j.status === 'KÖR' && (!bara || j.mal?.annonsNamn === bara || j.namn === bara));
  logg(`=== ${M.kontonamn} (${M.act}) ${DRY ? '[DRY]' : '[SKARPT]'} — ${körs.length} annonser att ladda upp ===`);
  if (!körs.length) return;

  // Dubblettspärr: målkontot läst EN gång.
  const befintliga = new Set((await alla(`act_${M.act}/ads`, { fields: 'name' }, 100)).map(a => a.name.trim().toLowerCase()));
  const kampanjCache = new Map();
  const sidaCache = new Map();
  const enh = ingaEnhancements({ inlineKommentar: !!M.inline_comment });
  let ok = 0, fel = 0, hopp = 0;

  for (const j of körs) {
    const namn = j.mal.annonsNamn;
    logg(`\n▶ ${j.namn} → ${namn}`);
    try {
      const c = copy[namn];
      if (!c?.message || !c?.headline) { j.mal.status = 'SAKNAR_COPY'; hopp++; logg('  ⏭ ingen copy i copy-filen'); continue; }
      const fil = hittaMedia(namn);
      if (!fil) { j.mal.status = 'SAKNAR_MEDIA'; hopp++; logg(`  ⏭ ingen fil ${namn}.* i ${mediaMapp}`); continue; }
      if (befintliga.has(namn.toLowerCase())) {
        // Raden har redan ett annons-id från en tidigare körning (t.ex. avbruten av
        // Metas strypning) → klar, inte dubblett. Utan id är det en främmande dubblett.
        if (j.mal.annonsId) { ok++; logg(`  ✓ redan uppe sedan tidigare körning (${j.mal.annonsId})`); continue; }
        j.mal.status = 'DUBBLETT'; hopp++; logg('  ⏭ finns redan i kontot'); continue;
      }

      // Kampanjen: utfall + kontospärr, live.
      if (!kampanjCache.has(j.mal.kampanjId)) kampanjCache.set(j.mal.kampanjId, await kampanjUtfall(j.mal.kampanjId));
      const u = kampanjCache.get(j.mal.kampanjId);
      if (u.utfall === 'SAKNAS') { j.mal.status = 'KAMPANJ_SAKNAS'; hopp++; logg(`  ⏭ kampanjen finns inte (${u.fel})`); continue; }
      if (u.kampanj.account_id !== M.act) dö(`Kampanj ${j.mal.kampanjId} ligger på konto ${u.kampanj.account_id}, inte ${M.act}. Avbryter — fel annonskonto kostar riktiga pengar.`);
      if (u.utfall === 'AVVECKLAD') { j.mal.status = 'KAMPANJ_AVVECKLAD'; hopp++; logg(`  ⏭ "${u.kampanj.name}" är PAUSED med ${u.spend} kr spend — rörs inte`); continue; }

      const K = j.K;
      if (!K || new RegExp(`^(${kod}|SE)$`, 'i').test(K)) dö(`Ogiltig vinkel "${K}" för ${j.namn} — K måste komma ur SE-namnet.`);
      const adsetNamn = `${j.produkt.adset_prefix} - ${K}`;
      const { adset, skapad, mall } = await hittaEllerSkapaAdset({ kampanjId: j.mal.kampanjId, act: M.act, namn: adsetNamn, torr: DRY });
      logg(`  · adset: ${adset.name} (${adset.id})${skapad ? ` — nyskapat, klon av "${mall}"` : ''}`);

      const ärVideo = ['.mp4', '.mov'].includes(extname(fil).toLowerCase());
      logg(`  · ${ärVideo ? 'video' : 'bild'} ${(statSync(fil).size / 1048576).toFixed(2)} MB · länk ${j.mal.link}`);
      if (DRY) {
        logg(`  [dry] skulle skapa "${namn}" i ${adset.name}, status ${finns('aktivera') && u.utfall === 'ACTIVE' && M.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED'}`);
        logg(`  [dry] rubrik: ${c.headline}\n  [dry] text: ${c.message.slice(0, 90).replace(/\n/g, ' | ')}…`);
        j.mal.status = 'DRY'; ok++;
        continue;
      }

      if (!sidaCache.has(j.mal.kampanjId)) sidaCache.set(j.mal.kampanjId, await ärvSidaOchIg(j.mal.kampanjId));
      const { pageId, igId } = sidaCache.get(j.mal.kampanjId);
      if (M.page && pageId !== M.page) dö(`Kampanjens sida ${pageId} ≠ marknadens sida ${M.page} (marknader.json). Avbryter.`);

      let spec;
      if (ärVideo) {
        const videoId = await laddaUppVideo(M.act, fil);
        const thumb = await väntaPåThumb(videoId);
        spec = { page_id: pageId, video_data: {
          video_id: videoId, image_url: thumb, message: c.message, title: c.headline,
          link_description: c.description || undefined,
          call_to_action: { type: 'SHOP_NOW', value: { link: j.mal.link } },
        } };
      } else {
        const hash = await laddaUppBild(M.act, fil);
        spec = { page_id: pageId, link_data: {
          image_hash: hash, link: j.mal.link, message: c.message, name: c.headline,
          description: c.description || undefined,
          call_to_action: { type: 'SHOP_NOW', value: { link: j.mal.link } },
        } };
      }
      if (igId) spec.instagram_actor_id = igId;

      const { creativeId, annonsId } = await skapaAnnons({ act: M.act, adsetId: adset.id, namn, spec, enhancements: enh, dsa: M.dsa });
      Object.assign(j.mal, { annonsId, creativeId, adsetId: adset.id, adsetNamn: adset.name, adsetSkapat: skapad, status: 'PAUSED' });
      befintliga.add(namn.toLowerCase());
      logg(`  ✓ skapad PAUSED: ${namn} (${annonsId})`);

      if (finns('aktivera')) {
        if (u.utfall !== 'ACTIVE') logg(`  · kampanjen är ${u.kampanj.status} — annonsen lämnas PAUSED (kampanjen rörs aldrig)`);
        else if (M.status !== 'ACTIVE') logg(`  · marknadens status är ${M.status} — annonsen lämnas PAUSED`);
        else {
          const { efter, ändringar } = await aktivera({ annonsId, adset, skapad });
          j.mal.status = efter.status; j.mal.effective_status = efter.effective_status;
          logg(`  ✓ ${ändringar.join('; ')} → tillbakaläst ${efter.status}/${efter.effective_status}`);
        }
      }
      ok++;
      spara();
    } catch (e) {
      fel++;
      j.mal.status = 'FEL'; j.mal.fel = e.message;
      logg(`  ✗ ${e.message}`);
      spara();
    }
  }
  spara();
  logg(`\nKlart: ${ok} ${DRY ? 'skulle laddas upp' : 'uppladdade'} · ${hopp} hoppade · ${fel} fel`);
  if (fel) process.exit(2);
}

main().catch(e => dö(e.message));
