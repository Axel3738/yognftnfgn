// kampanj.mjs — bygger OPS-butikens kampanj i det gemensamma annonskontot.
//
//   node factory/kampanj.mjs <produkt-id> --marknad SE [--torr]
//
// Steg 8 i `/ny-annonser`. ALLT föds PAUSED, på alla tre nivåer.
//
// ⚠️ Kontokartan kontrolleras på ID, aldrig på namn:
//   källa SE  MagiBorsten      1867947880635861
//   källa NO  Magiborsten NO   1050941584152547
//   MÅL       MagiBorsten DK    915422744950975   ← båda marknaderna
// Målkontot är INTE tomt — Bäverbutikens danska kampanjer ligger där med
// deras sida och pixel. Därför prefixas kampanjnamnet alltid med brandet
// OCH marknaden, och sida/pixel tas ur produktfilen, aldrig ur kontot.
//
// Media ska redan ligga i målkontot (factory/media-upload.mjs) — image_hash
// och video_id är per konto och går inte att referera från källkontot.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { api, ingaEnhancements, väntaPåThumb } from '../tools/meta-lib.mjs';
import { MALKONTO } from './kallannonser.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

// Vinkeln ur annonsnamnet: Damasker_PD_2_1 → PD, Damasker_SP_4_H1 → SP4.
export function vinkelAv(namn) {
  const del = String(namn).split('_');
  const kod = del[1] ?? '';
  if (kod === 'SP' && del[2] === '4') return 'SP4';
  return kod;
}

export function byggSpec({ typ, media, copy, pageId, igId, lank }) {
  const cta = { type: 'SHOP_NOW', value: { link: lank } };
  const gemensamt = {
    message: copy.message,
    name: copy.headline,
    ...(copy.description ? { description: copy.description } : {}),
    link: lank,
    call_to_action: cta,
  };
  const spec = { page_id: pageId, ...(igId ? { instagram_actor_id: igId } : {}) };
  if (typ === 'video') {
    spec.video_data = {
      video_id: media.id,
      image_url: media.thumb,
      message: copy.message,
      title: copy.headline,
      ...(copy.description ? { link_description: copy.description } : {}),
      call_to_action: cta,
    };
  } else {
    spec.link_data = { ...gemensamt, image_hash: media.id };
  }
  return spec;
}

if (process.argv[1] && process.argv[1].endsWith('kampanj.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const produktId = arg.find((a) => !a.startsWith('--') && !String(arg[arg.indexOf(a) - 1] ?? '').startsWith('--'));
  const marknad = arg.includes('--marknad') ? arg[arg.indexOf('--marknad') + 1] : 'SE';
  const torr = arg.includes('--torr');

  const p = lasYaml(readFileSync(join(ROT, 'produkter', `${produktId}.yaml`), 'utf8'));
  const butikId = 'drytrek';
  const butik = lasYaml(readFileSync(join(ROT, 'butiker', `${butikId}.yaml`), 'utf8'));

  // --- spärrarna, före allt annat
  const act = String(p.meta?.ad_account_id ?? '');
  if (act !== MALKONTO.id) throw new Error(`ad_account_id är ${act}, ska vara ${MALKONTO.id} (${MALKONTO.namn}). Stoppar.`);
  const pageId = String(p.meta?.page_id ?? '');
  const pixelId = String(p.meta?.pixel_id ?? '');
  if (!pageId) throw new Error('meta.page_id är tom — kampanjen kan inte byggas utan sidan.');
  if (!pixelId) throw new Error('meta.pixel_id är tom.');
  if (pixelId === '1554276343018184') throw new Error('Det är BÄVERBUTIKENS pixel. Stoppar.');

  const doman = (butik.butik.supportmail ?? '').split('@')[1];
  if (!doman) throw new Error('Butikens domän går inte att härleda ur supportmail.');
  const lank = `https://${doman}/products/${produktId}`;

  const mediaFil = join(ROT, 'output', produktId, 'media-i-malkontot.json');
  if (!existsSync(mediaFil)) throw new Error('media-i-malkontot.json saknas — kör factory/media-upload.mjs först.');
  const media = JSON.parse(readFileSync(mediaFil, 'utf8'));

  const copyFil = join(ROT, 'annonscopy', `${produktId}-se.json`);
  const copyblock = JSON.parse(readFileSync(copyFil, 'utf8')).vinklar;

  const brand = butik.butik.brand;
  const kampanjnamn = `${brand.toUpperCase()}_${marknad}_${p.produkt.namn.split(/[–—-]/)[0].trim()} | BE-ROAS ${(p.ekonomi.pris / (p.ekonomi.pris - p.ekonomi.inkopskostnad)).toFixed(2)} | 2026-09-09`;
  const budget = Math.round((p.meta?.testbudget_per_dag ?? 1000) * 100);

  console.log(`Mål: ${MALKONTO.namn} ${act} (${MALKONTO.valuta})`);
  console.log(`Sida: ${pageId} · Pixel: ${pixelId}`);
  console.log(`Länk: ${lank}`);
  console.log(`Kampanj: ${kampanjnamn}`);
  console.log(`Budget: ${budget / 100} ${MALKONTO.valuta}/dag (CBO)\n`);

  const attBygga = Object.entries(media).map(([namn, m]) => ({
    namn,
    typ: m.typ === 'video_id' ? 'video' : 'bild',
    id: m.id,
    vinkel: vinkelAv(namn),
  }));
  const utanCopy = attBygga.filter((a) => !copyblock[a.vinkel]);
  if (utanCopy.length > 0) {
    throw new Error(`Saknar copy för vinklarna: ${[...new Set(utanCopy.map((a) => a.vinkel))].join(', ')}`);
  }
  console.log(`${attBygga.length} annonser att bygga:`);
  for (const a of attBygga) console.log(`   ${a.typ.padEnd(5)} ${a.vinkel.padEnd(4)} ${a.namn}`);

  if (torr) { console.log('\n(torrkörning — inget skapades i Meta)'); process.exit(0); }

  // --- kampanjen
  const kampanj = await api(`act_${act}/campaigns`, {
    form: {
      name: kampanjnamn,
      objective: 'OUTCOME_SALES',
      status: 'PAUSED',
      special_ad_categories: '[]',
      buying_type: 'AUCTION',
      daily_budget: String(budget),
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    },
  });
  console.log(`\n✅ Kampanj ${kampanj.id} (PAUSED)`);

  // --- adsetet. Targeting sätts EXPLICIT — ingen fallback-geo.
  const adset = await api(`act_${act}/adsets`, {
    form: {
      name: `${brand.toUpperCase()}_${marknad}_Test_ABO`,
      campaign_id: kampanj.id,
      status: 'PAUSED',
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'OFFSITE_CONVERSIONS',
      destination_type: 'WEBSITE',
      promoted_object: JSON.stringify({ pixel_id: pixelId, custom_event_type: 'PURCHASE' }),
      targeting: JSON.stringify({
        geo_locations: { countries: [marknad] },
        age_min: 25,
        age_max: 65,
        targeting_automation: { advantage_audience: 1 },
      }),
    },
  });
  console.log(`✅ Adset ${adset.id} (PAUSED, geo ${marknad})`);

  // --- annonserna
  const byggda = [];
  const misslyckade = [];
  for (const a of attBygga) {
    const copy = copyblock[a.vinkel].slutlig ?? copyblock[a.vinkel];
    try {
      const m = { id: a.id };
      if (a.typ === 'video') m.thumb = await väntaPåThumb(a.id);
      const spec = byggSpec({ typ: a.typ, media: m, copy, pageId, igId: null, lank });
      const creative = await api(`act_${act}/adcreatives`, {
        form: {
          name: `DRYTREK_${a.namn}`,
          object_story_spec: JSON.stringify(spec),
          degrees_of_freedom_spec: JSON.stringify(ingaEnhancements()),
        },
      });
      const annons = await api(`act_${act}/ads`, {
        form: {
          name: `DryTrek_${a.namn.replace(/^Damasker_/, 'Damasker_')}`,
          adset_id: adset.id,
          creative: JSON.stringify({ creative_id: creative.id }),
          status: 'PAUSED',
        },
      });
      byggda.push({ namn: a.namn, annonsId: annons.id });
      console.log(`   ✅ ${a.namn} → annons ${annons.id}`);
    } catch (e) {
      misslyckade.push({ namn: a.namn, fel: e.message.slice(0, 160) });
      console.log(`   ❌ ${a.namn}: ${e.message.slice(0, 160)}`);
    }
  }

  // --- RÄKNINGEN, läst ur Meta och inte ur minnet
  const iKontot = await api(`${kampanj.id}/ads`, { params: { fields: 'id,name,status', limit: 100 } });
  console.log('\n─── RÄKNING ───');
  console.log(`  media i målkontot   : ${attBygga.length}`);
  console.log(`  annonser byggda     : ${byggda.length}`);
  console.log(`  misslyckade         : ${misslyckade.length}`);
  console.log(`  annonser i kampanjen: ${(iKontot.data ?? []).length}  ← läst ur Meta`);
  for (const m of misslyckade) console.log(`     ❌ ${m.namn}: ${m.fel}`);
  console.log(`\nStatus i kontot: ${[...new Set((iKontot.data ?? []).map((x) => x.status))].join(', ') || '(inga)'}`);
}
