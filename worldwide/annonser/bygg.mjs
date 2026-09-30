// bygg.mjs — Beaver Stores worldwide-kampanjer i Meta: en kampanj per vinnarprodukt, allt PAUSED.
//
//   node worldwide/annonser/bygg.mjs --lage                # vad som finns i kontot (läser bara)
//   node worldwide/annonser/bygg.mjs                       # torrt: planen för alla produkter
//   node worldwide/annonser/bygg.mjs --skarpt              # skapa kampanjer, adset och de annonser vars fil är klar
//   node worldwide/annonser/bygg.mjs --produkt batmotorskyddet --skarpt
//   node worldwide/annonser/bygg.mjs --aktivera --skarpt   # vägrar tills konto.json → budget_beslut är satt
//
// Källor: ../urval.json (vilka annonser — vinnarna ur MagiBorsten, rangordnade på vinstbidrag),
// copy-en.json (engelsk text, sonnet mot REGLER-ANNONS.md + docs/copy-regler.md), media.json (de
// engelska bilderna/videorna: bilder.mjs och video.mjs skriver dit), konto.json (konto, sida, pixel).
// Mönstret är matstrumpor/marknader/annonser/bygg.mjs: CBO per kampanj, ett adset, köp via
// Bäverbutikens pixel, 7 dagars klick, Advantage+ audience, feed-placeringar, DSA Stonebite.
//
// ⛔ Allt skapas PAUSED. Inget befintligt objekt i kontot rörs (CaraShells US-kampanjer ligger i
// samma konto — de känns igen på att namnet saknar BEAVERSTORE_). En annons utan engelsk fil
// skapas aldrig; den väntar i planen ("väntar på fil").

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROT, '..', '..');
const K = JSON.parse(readFileSync(join(ROT, 'konto.json'), 'utf8'));
const W = JSON.parse(readFileSync(join(ROT, '..', 'konfig.json'), 'utf8'));
const U = JSON.parse(readFileSync(join(ROT, '..', 'urval.json'), 'utf8'));
const lasJson = (f, def) => (existsSync(join(ROT, f)) ? JSON.parse(readFileSync(join(ROT, f), 'utf8')) : def);
const log = (s) => console.log(s);

// ------------------------------------------------------------------ ren logik (testad)

/** Annonsens worldwide-namn: marknadskoden direkt efter prefixet, som kontots andra
 *  marknadsannonser (CaraShellRoof_NO_…). Mellanslag och tankstreck blir understreck. */
export function wwNamn(kalla) {
  const ren = String(kalla).replace(/\s*[–—-]\s*kopia/i, '_kopia').replace(/[^\p{L}\p{N}_]+/gu, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const i = ren.indexOf('_');
  return i < 0 ? `${ren}_WW` : `${ren.slice(0, i)}_WW_${ren.slice(i + 1)}`;
}

/** Länderna för en produkt: marknadens, minus CaraShells länder för CaraShells produkter. */
export function geoFor(produktId, konto = K, marknad = W.marknad) {
  const ut = new Set(konto.annons_utan_lander ?? []);
  if (konto.caraShell_produkter.includes(produktId)) for (const c of konto.caraShell_lander) ut.add(c);
  return marknad.lander.filter((c) => !ut.has(c));
}

export const kampanjNamn = (p, datum = K.datum) => `BEAVERSTORE_WW_${p.namn} | BE ROAS ${p.be.toFixed(2)} | ${datum}`;
export const lank = (handle) => `https://${W.marknad.doman.host}/products/${handle}`;

/** Får kampanjen aktiveras? Bara med Axels budget och bara med minst en annons. */
export function farAktiveras(konto, annonser) {
  if (!konto.budget_beslut) return { ok: false, skal: 'ingen budget beslutad (konto.json → budget_beslut) — kampanjerna står PAUSED tills Axel sagt en budget' };
  if (!annonser.length) return { ok: false, skal: 'kampanjen har inga annonser' };
  return { ok: true };
}

/** Planen per produkt ur urval + copy + media: vilka annonser som kan skapas nu och vilka som väntar. */
export function plan(urval = U, copy = lasJson('copy-en.json', {}), media = lasJson('media.json', {})) {
  return urval.produkter.filter((p) => !p.under).map((p) => {
    const annonser = [];
    const sedda = new Set();
    for (const a of p.annonser) {
      const namn = wwNamn(a.namn);
      const c = copy[a.namn];
      const m = media[a.namn];
      let lage = 'klar';
      if (!c) lage = 'väntar på text';
      else if (c.hoppa) lage = `hoppas: ${c.hoppa}`;
      else if (m?.hoppa) lage = `hoppas: ${m.hoppa}`;
      else if (!m?.fil) lage = 'väntar på fil';
      else if (m.granskad !== true) lage = 'väntar på granskning (media.json → granskad)';
      if (m?.sha256 && sedda.has(m.sha256)) lage = 'dubblett (samma fil som en annan annons)';
      if (m?.sha256) sedda.add(m.sha256);
      annonser.push({ kalla: a.namn, namn, typ: a.typ, lage, copy: c, media: m });
    }
    return { id: p.id, namn: p.namn, be: p.be, handle: p.handle, kampanj: kampanjNamn(p), adset: `WW | ${geoFor(p.id).length} countries | ${K.datum}`, geo: geoFor(p.id), lank: lank(p.handle), annonser };
  });
}

// ------------------------------------------------------------------ Meta

async function meta() {
  const m = await import('../../tools/meta-lib.mjs');
  m.säkerställProxy();
  return m;
}

const sha = (fil) => createHash('sha256').update(readFileSync(fil)).digest('hex');

async function huvud() {
  const a = process.argv.slice(2);
  const skarpt = a.includes('--skarpt');
  const aktivera = a.includes('--aktivera');
  const bara = a.includes('--produkt') ? a[a.indexOf('--produkt') + 1] : null;
  const M = await meta();
  const planer = plan().filter((p) => !bara || p.id === bara);
  if (!a.includes('--lage')) {
    for (const p of planer) {
      const klara = p.annonser.filter((x) => x.lage === 'klar').length;
      log(`\n${p.kampanj}\n  ${p.geo.length} länder · ${p.lank} · ${klara} av ${p.annonser.length} annonser klara`);
      for (const x of p.annonser) log(`   ${x.lage === 'klar' ? '✓' : '·'} ${x.namn} (${x.typ}) — ${x.lage}`);
    }
  }
  const { api, alla, laddaUppBild, laddaUppVideo, väntaPåThumb, skapaAnnons, ingaEnhancements } = M;
  const konto = await api(`act_${K.konto}`, { params: { fields: 'name,currency,account_status' } });
  if (konto.name !== K.konto_namn) throw new Error(`Kontot heter "${konto.name}", konto.json säger "${K.konto_namn}" — fel konto, stopp.`);
  log(`\nKonto: ${konto.name} (${K.konto}, ${konto.currency}, status ${konto.account_status}) — ${skarpt ? 'SKARPT' : 'torrt'}${aktivera ? ' + aktivera' : ''}`);
  const kampanjer = await alla(`act_${K.konto}/campaigns`, { fields: 'id,name,status,effective_status,daily_budget' }, 100);
  const vara = kampanjer.filter((c) => c.name.startsWith('BEAVERSTORE_'));
  if (a.includes('--lage')) { for (const c of vara) log(`${c.name}: ${c.id} ${c.status}/${c.effective_status} ${Number(c.daily_budget) / 100} kr/dag`); if (!vara.length) log('inga BEAVERSTORE_-kampanjer än'); return; }

  const media = lasJson('media.json', {});
  // video.mjs/bildrita.mjs kan skriva media.json samtidigt: läs om filen och skriv bara in de poster bygget rört.
  const rorda = new Set();
  const sparaMedia = (namn) => {
    if (namn) rorda.add(namn);
    const pa = lasJson('media.json', {});
    for (const k of rorda) pa[k] = { ...pa[k], ...media[k] };
    writeFileSync(join(ROT, 'media.json'), JSON.stringify(pa, null, 1));
  };
  for (const p of planer) {
    log(`\n── ${p.kampanj} ──`);
    let kampanj = vara.find((c) => c.name === p.kampanj);
    if (kampanj) log(`kampanj finns: ${kampanj.id} ${kampanj.status}`);
    else if (!skarpt) { log(`torrt: kampanj CBO ${K.budget_sek_dag} kr/dag (platshållare), OUTCOME_SALES, PAUSED`); continue; }
    else {
      kampanj = await api(`act_${K.konto}/campaigns`, { form: { name: p.kampanj, objective: 'OUTCOME_SALES', status: 'PAUSED', special_ad_categories: '[]', buying_type: 'AUCTION', daily_budget: String(K.budget_sek_dag * 100), bid_strategy: 'LOWEST_COST_WITHOUT_CAP' } });
      kampanj.status = 'PAUSED';
      log(`✅ kampanj ${kampanj.id} PAUSED`);
    }
    let adset = (await alla(`${kampanj.id}/adsets`, { fields: 'id,name,status' }, 50)).find((x) => x.name === p.adset);
    if (!adset && skarpt) {
      adset = await api(`act_${K.konto}/adsets`, { form: {
        name: p.adset, campaign_id: kampanj.id, status: 'PAUSED', billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS', destination_type: 'WEBSITE',
        promoted_object: JSON.stringify({ pixel_id: K.pixel, custom_event_type: 'PURCHASE' }),
        attribution_spec: JSON.stringify([{ event_type: 'CLICK_THROUGH', window_days: 7 }]),
        targeting: JSON.stringify({ geo_locations: { countries: p.geo, location_types: ['home', 'recent'] }, age_min: 18, age_max: 65, targeting_automation: { advantage_audience: 1 }, ...K.placeringar }),
        dsa_beneficiary: K.dsa, dsa_payor: K.dsa,
      } });
      adset.status = 'PAUSED';
      log(`✅ adset ${adset.id} PAUSED (${p.geo.length} länder)`);
    } else if (adset) log(`adset finns: ${adset.id} ${adset.status}`);
    const finns = adset ? await alla(`${adset.id}/ads`, { fields: 'id,name,status' }, 50) : [];
    for (const x of p.annonser) {
      if (x.lage !== 'klar') continue;
      if (finns.some((f) => f.name === x.namn)) { log(`annons finns: ${x.namn}`); continue; }
      const fil = join(REPO, x.media.fil);
      if (!existsSync(fil)) { log(`⚠️ ${x.namn}: ${x.media.fil} finns inte på disk — hoppar`); continue; }
      if (!skarpt || !adset) { log(`torrt: ${x.namn} (${x.typ}) → ${p.lank}`); continue; }
      const m = media[x.kalla];
      if (x.typ === 'bild' && !m.image_hash) { m.image_hash = await laddaUppBild(K.konto, fil); sparaMedia(x.kalla); }
      if (x.typ === 'video' && !m.video_id) { m.video_id = await laddaUppVideo(K.konto, fil); sparaMedia(x.kalla); }
      const c = x.copy;
      const spec = x.typ === 'bild'
        ? { page_id: K.sida, instagram_user_id: K.instagram_user_id, link_data: { image_hash: m.image_hash, link: p.lank, message: c.text, name: c.rubrik, ...(c.beskrivning ? { description: c.beskrivning } : {}), call_to_action: { type: 'SHOP_NOW', value: { link: p.lank } } } }
        : { page_id: K.sida, instagram_user_id: K.instagram_user_id, video_data: { video_id: m.video_id, image_url: await väntaPåThumb(m.video_id), title: c.rubrik, message: c.text, ...(c.beskrivning ? { link_description: c.beskrivning } : {}), call_to_action: { type: 'SHOP_NOW', value: { link: p.lank } } } };
      const r = await skapaAnnons({ act: K.konto, adsetId: adset.id, namn: x.namn, spec, enhancements: ingaEnhancements(), dsa: { beneficiary: K.dsa, payor: K.dsa } });
      m.annons_id = r.annonsId; m.creative_id = r.creativeId; m.kampanj_id = kampanj.id; m.skapad = new Date().toISOString();
      sparaMedia(x.kalla);
      log(`✅ ${x.namn}: ${r.annonsId} PAUSED`);
    }
    if (aktivera && skarpt) {
      const ads = adset ? await alla(`${adset.id}/ads`, { fields: 'id,name,status' }, 50) : [];
      const f = farAktiveras(K, ads);
      if (!f.ok) log(`⛔ aktiverar INTE ${p.kampanj}: ${f.skal}`);
      else {
        for (const ad of ads) if (ad.status !== 'ACTIVE') await api(ad.id, { form: { status: 'ACTIVE' } });
        await api(adset.id, { form: { status: 'ACTIVE' } });
        await api(kampanj.id, { form: { status: 'ACTIVE' } });
        log(`✅ aktiverat ${p.kampanj}`);
      }
    }
    if (skarpt) {
      const k3 = await api(kampanj.id, { params: { fields: 'status,effective_status,daily_budget' } });
      const ads3 = adset ? await alla(`${adset.id}/ads`, { fields: 'name,status' }, 50) : [];
      log(`tillbakaläst: ${k3.status}/${k3.effective_status} ${Number(k3.daily_budget) / 100} kr/dag · ${ads3.length} annonser (${ads3.map((x) => x.status).join(',') || '—'})`);
    }
  }
}

export { sha };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
