#!/usr/bin/env node
// ops-byt-bild.mjs — byter BILDEN i en annons som redan är live i OPS-kontot,
// utan att pausa, byta namn eller röra adset/kampanj. Annonsen får en ny
// creative med exakt samma object_story_spec (sida, länk, primärtext,
// rubrik, beskrivning, CTA) men ny image_hash, och annonsen pekas om.
//
//   node tools/ops-byt-bild.mjs <nyckel> --annons <ad_id> --fil <bild.png> [--torr] [--json]
//
// Byggd 2026-09-15 för CaraShell: fyra bildannonser gick live utan textlagret
// (bara fotot). Axels beslut: "pausa inte dom utan gör bara de förra
// versionerna mycket bättre" — alltså byt bilden i den annons som redan
// samlar data, i stället för att skapa en ny och pausa den gamla.
//
// Spärrar: annonsen måste ligga på OPS-kontot 915422744950975 och bära
// butikens prefix. Varje skrivning läses tillbaka: creative-id:t ska ha bytt
// och statusen ska stå kvar som den var. Aktiverar aldrig något.

import { existsSync, statSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { api, laddaUppBild, ingaEnhancements, säkerställProxy } from './meta-lib.mjs';
import { laddaButik, sakerstallKonto, tillhorButiken, OPS_ANNONSKONTO } from '../factory/register.mjs';

const BILD = ['.png', '.jpg', '.jpeg'];

/** Ren funktion: ny object_story_spec = den gamla med ny image_hash i link_data. */
export function specMedNyBild(spec, hash) {
  if (!spec?.link_data) throw new Error('Annonsens creative saknar link_data — bara bildannonser (link_data) kan få ny bild här.');
  const ld = { ...spec.link_data, image_hash: hash };
  delete ld.picture;   // Meta fyller picture ur image_hash; en gammal picture-url pekar på den gamla bilden
  return { ...spec, link_data: ld };
}

function tolkaArgs(argv) {
  const ut = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const n = a.slice(2);
      const v = argv[i + 1];
      if (v !== undefined && !v.startsWith('--')) { ut[n] = v; i++; } else ut[n] = true;
    } else ut._.push(a);
  }
  return ut;
}

async function huvud() {
  const args = tolkaArgs(process.argv.slice(2));
  const JSONUT = Boolean(args.json);
  const TORR = Boolean(args.torr);
  console.log = (...a) => console.error(...a);
  const logg = (...a) => console.error(...a);
  const stopp = (m) => { logg(`✗ ${m}`); if (JSONUT) process.stdout.write(`${JSON.stringify({ ok: false, fel: m })}\n`); process.exit(1); };

  const nyckel = args._[0];
  if (!nyckel) stopp('Ange butikens nyckel: node tools/ops-byt-bild.mjs <nyckel> --annons <ad_id> --fil <bild.png>');
  if (!process.env.META_ACCESS_TOKEN) stopp('META_ACCESS_TOKEN saknas i miljön.');
  const annonsId = String(args.annons ?? '');
  const fil = args.fil;
  if (!/^\d+$/.test(annonsId)) stopp('Ange --annons <ad_id> (bara siffror).');
  if (!fil || !existsSync(fil)) stopp(`Filen finns inte: ${fil}`);
  if (!BILD.includes(extname(fil).toLowerCase())) stopp(`Bara bilder (${BILD.join(' ')}) — fick ${extname(fil)}.`);

  const butik = laddaButik(nyckel);
  const konto = sakerstallKonto(butik.post);
  if (konto !== OPS_ANNONSKONTO) stopp(`${butik.post.nyckel} pekar på konto ${konto}, inte OPS-kontot ${OPS_ANNONSKONTO}.`);
  if (!butik.prefix) stopp(`${butik.post.nyckel}: ${butik.prefixfel}`);

  const fore = await api(annonsId, { params: { fields: 'id,name,status,effective_status,account_id,adset_id,campaign_id,creative{id,object_story_spec,degrees_of_freedom_spec}' } });
  if (String(fore.account_id) !== OPS_ANNONSKONTO) stopp(`Annons ${annonsId} ligger på konto ${fore.account_id}, inte OPS-kontot. Rör den inte.`);
  if (!tillhorButiken(fore.name, butik.prefix)) stopp(`Annons "${fore.name}" bär inte ${butik.post.brand}s prefix (${butik.prefix.join(' / ')}). Rör den inte.`);
  const spec = fore.creative?.object_story_spec;
  let nySpec;
  try { nySpec = specMedNyBild(spec, TORR ? '<torr-image-hash>' : null); } catch (e) { stopp(e.message); }
  logg(`Annons: ${fore.name} (${annonsId}) ${fore.status}/${fore.effective_status} · creative ${fore.creative.id} · image_hash ${spec.link_data.image_hash}`);
  logg(`Ny bild: ${basename(fil)} (${(statSync(fil).size / 1048576).toFixed(2)} MB) · länk ${spec.link_data.link} · rubrik "${spec.link_data.name}"`);
  if (TORR) {
    logg('[TORRKÖRNING] Skulle ladda upp bilden, skapa en creative med samma spec och peka om annonsen. Inget skrevs.');
    if (JSONUT) process.stdout.write(`${JSON.stringify({ ok: true, torr: true, annons: annonsId, namn: fore.name, creative_fore: fore.creative.id })}\n`);
    return;
  }

  const hash = await laddaUppBild(konto, fil);
  nySpec = specMedNyBild(spec, hash);
  const dof = fore.creative?.degrees_of_freedom_spec ?? ingaEnhancements();
  const creative = await api(`act_${konto}/adcreatives`, { form: {
    name: `${fore.name} — textlager ${new Date().toISOString().slice(0, 10)}`,
    object_story_spec: JSON.stringify(nySpec),
    degrees_of_freedom_spec: JSON.stringify(dof),
  } });
  logg(`Ny creative ${creative.id} (image_hash ${hash})`);
  await api(annonsId, { form: { creative: JSON.stringify({ creative_id: creative.id }) } });

  const efter = await api(annonsId, { params: { fields: 'id,name,status,effective_status,creative{id,object_story_spec}' } });
  const bytt = String(efter.creative?.id) === String(creative.id) && efter.creative?.object_story_spec?.link_data?.image_hash === hash;
  if (!bytt) stopp(`Tillbakaläsningen visar creative ${efter.creative?.id} med hash ${efter.creative?.object_story_spec?.link_data?.image_hash} — bytet gick inte igenom.`);
  if (efter.status !== fore.status) logg(`⚠ Statusen ändrades ${fore.status} → ${efter.status} — det ska inte hända, en människa måste titta.`);
  logg(`✓ ${efter.name}: creative ${fore.creative.id} → ${efter.creative.id}, status ${efter.status}/${efter.effective_status} (oförändrad)`);
  if (JSONUT) process.stdout.write(`${JSON.stringify({ ok: true, annons: annonsId, namn: efter.name, creative_fore: fore.creative.id, creative_efter: efter.creative.id, image_hash: hash, status: efter.status, effective_status: efter.effective_status })}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  säkerställProxy();
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
