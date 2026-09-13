// kampanj.mjs — bygger OPS-butikens kampanj i det gemensamma annonskontot.
//
//   node factory/kampanj.mjs <produkt-id> --marknad SE|NO [--torr]
//
// Steg 8 i `/ny-annonser`. ALLT föds PAUSED, på alla tre nivåer.
//
// ⚠️ STRUKTUREN ÄR ABO MED ETT ADSET PER VINKEL — aldrig CBO med ett adset.
// Axels bakläxa 2026-09-09: DryTreks första svenska kampanj byggdes som CBO
// med alla 16 annonser i EN annonsuppsättning. Två fel i ett:
//   1. Det bryter CLAUDE.md regel 11 (nya tester = separat test-ABO med lika
//      budget per annons). I en CBO går pengarna dit Meta vill, och tre
//      vinklar svälter ihjäl bredvid en — precis mönster 5 i motorhöljets DNA.
//   2. Med alla vinklar i samma adset går datan inte att skära per vinkel.
//      Hela poängen med namnkonventionen är att kunna svara "vilken vinkel
//      bär den här produkten" — en enda uppsättning gör den frågan omöjlig.
// Källkampanjen som gav ROAS 2,83 har ett adset per vinkel. Vi speglar den.
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
//
// ⚠️ Prefixet måste skickas med när det är fler än ett ord. Det norska
// prefixet är `Gamasjer_NO`, så Gamasjer_NO_PD_2_1 ger "NO" som vinkel om
// man bara tar andra ordet — och då hittas ingen copy alls.
export function vinkelAv(namn, prefix = '') {
  let rest = String(namn);
  if (prefix && rest.startsWith(`${prefix}_`)) rest = rest.slice(prefix.length + 1);
  else rest = rest.split('_').slice(1).join('_');
  const del = rest.split('_');
  const kod = del[0] ?? '';
  if (kod === 'SP' && del[1] === '4') return 'SP4';
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

  if (marknad !== 'SE' && marknad !== 'NO') throw new Error(`--marknad ${marknad} finns inte. Välj SE eller NO.`);
  const suffix = marknad === 'NO' ? '-no' : '';

  const doman = (butik.butik.supportmail ?? '').split('@')[1];
  if (!doman) throw new Error('Butikens domän går inte att härleda ur supportmail.');
  // Norska annonser ska landa på den NORSKA sidan. Utan /nb får kunden svensk
  // text efter ett norskt löfte, och Shopify byter inte språk åt en besökare
  // som redan fått en svensk URL.
  //
  // ⚠️ `?country=NO` är INTE valfritt. /nb är bara ett SPRÅK på huvuddomänen,
  // vars marknad är Sverige — utan parametern får norrmannen norsk text men
  // SVENSKA priser (389 kr i stället för 381 NOK) och en kassa i SEK, medan
  // annonsen lovade 381 kr. Mätt 2026-09-10: 16 norska annonser hade rullat
  // en dag på /nb utan country. Shopify honorerar country= server-side och
  // sätter kakan, så priset är rätt redan i första renderingen.
  const lank = marknad === 'NO'
    ? `https://${doman}/nb/products/${produktId}?country=NO`
    : `https://${doman}/products/${produktId}`;

  const mediaFil = join(ROT, 'output', produktId, `media-i-malkontot${suffix}.json`);
  if (!existsSync(mediaFil)) throw new Error(`${mediaFil.split('/').pop()} saknas — kör factory/media-upload.mjs --marknad ${marknad} först.`);
  const media = JSON.parse(readFileSync(mediaFil, 'utf8'));

  const copyFil = join(ROT, 'annonscopy', `${produktId}-${marknad.toLowerCase()}.json`);
  if (!existsSync(copyFil)) throw new Error(`${copyFil.split('/').pop()} saknas — copyn för ${marknad} är inte skriven.`);
  const copyblock = JSON.parse(readFileSync(copyFil, 'utf8')).vinklar;

  const brand = butik.butik.brand;
  const kampanjnamn = `${brand.toUpperCase()}_${marknad}_${p.produkt.namn.split(/[–—-]/)[0].trim()} | BE-ROAS ${(p.ekonomi.pris / (p.ekonomi.pris - p.ekonomi.inkopskostnad)).toFixed(2)} | 2026-09-09`;
  const budget = Math.round((p.meta?.testbudget_per_dag ?? 1000) * 100);

  console.log(`Mål: ${MALKONTO.namn} ${act} (${MALKONTO.valuta})`);
  console.log(`Sida: ${pageId} · Pixel: ${pixelId}`);
  console.log(`Länk: ${lank}`);
  console.log(`Kampanj: ${kampanjnamn}`);
  console.log(`Budget: ${budget / 100} ${MALKONTO.valuta}/dag, fördelad lika över adseten (ABO)\n`);

  const kallprefix = marknad === 'NO'
    ? (p.kalla?.no_annonsprefix ?? p.kalla?.annonsprefix ?? '')
    : (p.kalla?.annonsprefix ?? '');

  const attBygga = Object.entries(media).map(([namn, m]) => ({
    namn,
    typ: m.typ === 'video_id' ? 'video' : 'bild',
    id: m.id,
    vinkel: vinkelAv(namn, kallprefix),
  }));
  const utanCopy = attBygga.filter((a) => !copyblock[a.vinkel]);
  if (utanCopy.length > 0) {
    throw new Error(`Saknar copy för vinklarna: ${[...new Set(utanCopy.map((a) => a.vinkel))].join(', ')}`);
  }
  // Ett adset per vinkel, lika budget i varje (regel 11 + källans struktur).
  const vinklar = [...new Set(attBygga.map((a) => a.vinkel))].sort();
  const perAdset = Math.round(budget / vinklar.length);
  console.log(`${attBygga.length} annonser i ${vinklar.length} annonsuppsättningar (ABO, ${perAdset / 100} ${MALKONTO.valuta}/dag styck):`);
  for (const v of vinklar) {
    const i = attBygga.filter((a) => a.vinkel === v);
    console.log(`   ${v.padEnd(4)} ${i.length} annonser: ${i.map((a) => a.namn).join(', ')}`);
  }

  if (torr) { console.log('\n(torrkörning — inget skapades i Meta)'); process.exit(0); }

  // --- kampanjen. INGEN kampanjbudget: budgeten bor i adseten (ABO).
  const kampanj = await api(`act_${act}/campaigns`, {
    form: {
      name: kampanjnamn,
      objective: 'OUTCOME_SALES',
      status: 'PAUSED',
      special_ad_categories: '[]',
      buying_type: 'AUCTION',
      // ⚠️ Meta KRÄVER det här fältet så fort kampanjen saknar egen budget.
      // FALSKT med flit: sant låter adseten låna 20 % av varandras budget,
      // och då är budgeten inte längre lika per annons — hela poängen med
      // ett test-ABO faller (regel 11).
      is_adset_budget_sharing_enabled: 'false',
    },
  });
  console.log(`\n✅ Kampanj ${kampanj.id} (PAUSED, ABO utan budgetdelning)`);

  // --- adseten, ett per vinkel. Targeting sätts EXPLICIT — ingen fallback-geo.
  const adsetAv = new Map();
  for (const v of vinklar) {
    const adset = await api(`act_${act}/adsets`, {
      form: {
        name: `${brand.toUpperCase()}_${marknad}_${v}`,
        campaign_id: kampanj.id,
        status: 'PAUSED',
        daily_budget: String(perAdset),
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'OFFSITE_CONVERSIONS',
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
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
    adsetAv.set(v, adset.id);
    console.log(`✅ Adset ${v}: ${adset.id} (PAUSED, geo ${marknad}, ${perAdset / 100} ${MALKONTO.valuta}/dag)`);
  }

  // --- annonserna
  const byggda = [];
  const misslyckade = [];
  for (const a of attBygga) {
    const copy = copyblock[a.vinkel].slutlig ?? copyblock[a.vinkel];
    const adsetId = adsetAv.get(a.vinkel);
    try {
      const m = { id: a.id };
      if (a.typ === 'video') m.thumb = await väntaPåThumb(a.id);
      const spec = byggSpec({ typ: a.typ, media: m, copy, pageId, igId: null, lank });
      const creative = await api(`act_${act}/adcreatives`, {
        form: {
          name: `${brand.toUpperCase()}_${a.namn}`,
          object_story_spec: JSON.stringify(spec),
          degrees_of_freedom_spec: JSON.stringify(ingaEnhancements()),
        },
      });
      const annons = await api(`act_${act}/ads`, {
        form: {
          name: `${brand}_${a.namn}`,
          adset_id: adsetId,
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
