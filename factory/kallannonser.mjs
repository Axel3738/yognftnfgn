// kallannonser.mjs — läser källannonserna för en OPS-produkt ur BÅDA
// källkontona (SE + NO) och skriver dem till output/<id>/kallannonser.json.
//
//   node factory/kallannonser.mjs <produkt-id> [--alla]
//
// Steg 2 i `/ny-annonser`. Läser BARA — rör inget konto.
//
// ⚠️ Bara ACTIVE-annonser i aktiva adsets tas med. En PAUSED annons är ett
// beslut: den har dömts ut och ska inte återupplivas i en ny butik.
// `--alla` visar även de pausade, men markerar dem `med: false`.
//
// ⚠️ SE- och NO-uppsättningarna hålls åtskilda hela vägen. SE blir den
// svenska kampanjen, NO den norska. Blandas de hamnar svensk copy i Norge.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const GRAPH = 'https://graph.facebook.com/v21.0';

// Kontokartan. Kontrolleras alltid på ID, aldrig på namn — fyra konton
// heter nästan samma sak och fel konto kostar riktiga pengar.
export const KONTON = {
  SE: { id: '1867947880635861', namn: 'MagiBorsten', valuta: 'SEK' },
  NO: { id: '1050941584152547', namn: 'Magiborsten NO', valuta: 'NOK' },
};
export const MALKONTO = { id: '915422744950975', namn: 'MagiBorsten DK', valuta: 'SEK' };

async function graph(sokvag, params = {}) {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('Saknar META_ACCESS_TOKEN.');
  const url = new URL(`${GRAPH}${sokvag}`);
  for (const [k, v] of Object.entries({ access_token: token, ...params })) url.searchParams.set(k, v);
  const r = await fetch(url);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Meta ${sokvag}: ${j.error?.message ?? r.status}`);
  return j;
}

async function allaSidor(sokvag, params = {}) {
  const ut = [];
  let nasta = null;
  for (;;) {
    const j = nasta
      ? await (await fetch(nasta)).json()
      : await graph(sokvag, { ...params, limit: 100 });
    ut.push(...(j.data ?? []));
    nasta = j.paging?.next ?? null;
    if (!nasta) break;
  }
  return ut;
}

export async function lasKonto(kontoId, prefix) {
  const annonser = await allaSidor(`/act_${kontoId}/ads`, {
    fields: [
      'id', 'name', 'status', 'effective_status',
      'adset{id,name,status,effective_status,daily_budget,targeting}',
      'campaign{id,name,status,objective}',
      'creative{id,name,object_story_spec,asset_feed_spec,effective_object_story_id,image_hash,image_url,video_id,thumbnail_url,object_type,url_tags,link_url}',
    ].join(','),
  });
  const traff = annonser.filter((a) => String(a.name).startsWith(prefix));

  // Spend per annons, för rangordningen. De bevisade först.
  const utfall = new Map();
  for (const a of traff) {
    try {
      const j = await graph(`/${a.id}/insights`, {
        fields: 'spend,actions,purchase_roas',
        date_preset: 'maximum',
      });
      const rad = j.data?.[0];
      const kop = Number((rad?.actions ?? []).find((x) => x.action_type === 'omni_purchase')?.value ?? 0);
      utfall.set(a.id, {
        spend: Number(rad?.spend ?? 0),
        kop,
        roas: Number((rad?.purchase_roas ?? []).find((x) => x.action_type === 'omni_purchase')?.value ?? 0),
      });
    } catch {
      utfall.set(a.id, { spend: 0, kop: 0, roas: 0 });
    }
  }

  return traff
    .map((a) => {
      const spec = a.creative?.object_story_spec ?? {};
      const lank = spec.link_data ?? spec.video_data ?? {};
      const cta = lank.call_to_action ?? {};
      return {
        id: a.id,
        namn: a.name,
        status: a.status,
        effektiv: a.effective_status,
        adset: a.adset ? { id: a.adset.id, namn: a.adset.name, status: a.adset.status, effektiv: a.adset.effective_status, budget: a.adset.daily_budget } : null,
        kampanj: a.campaign ? { id: a.campaign.id, namn: a.campaign.name, status: a.campaign.status, mal: a.campaign.objective } : null,
        typ: a.creative?.video_id ? 'video' : 'bild',
        creative: {
          id: a.creative?.id ?? null,
          image_hash: a.creative?.image_hash ?? lank.image_hash ?? null,
          image_url: a.creative?.image_url ?? null,
          video_id: a.creative?.video_id ?? lank.video_id ?? null,
          thumbnail: a.creative?.thumbnail_url ?? null,
          page_id: spec.page_id ?? null,
          instagram_actor_id: spec.instagram_actor_id ?? spec.instagram_user_id ?? null,
        },
        copy: {
          message: lank.message ?? null,
          headline: lank.name ?? lank.title ?? null,
          description: lank.description ?? null,
          link: lank.link ?? a.creative?.link_url ?? null,
          cta: cta.type ?? null,
        },
        utfall: utfall.get(a.id),
        // ACTIVE-annons i ett ACTIVE adset i en ACTIVE kampanj.
        med:
          a.status === 'ACTIVE' &&
          a.adset?.status === 'ACTIVE' &&
          a.campaign?.status === 'ACTIVE',
      };
    })
    .sort((x, y) => y.utfall.spend - x.utfall.spend);
}

if (process.argv[1] && process.argv[1].endsWith('kallannonser.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const produktId = arg.find((a) => !a.startsWith('--'));
  const visaAlla = arg.includes('--alla');
  if (!produktId) throw new Error('Ange produkt-id: node factory/kallannonser.mjs <id>');

  const p = lasYaml(readFileSync(join(ROT, 'produkter', `${produktId}.yaml`), 'utf8'));
  const prefix = p.kalla?.annonsprefix;
  if (!prefix) throw new Error(`produkter/${produktId}.yaml saknar kalla.annonsprefix.`);
  if (String(p.meta?.ad_account_id) !== MALKONTO.id) {
    throw new Error(`meta.ad_account_id är ${p.meta?.ad_account_id}, ska vara ${MALKONTO.id}. Stoppar.`);
  }

  console.log(`Källprefix: ${prefix}_ · Mål: ${MALKONTO.namn} ${MALKONTO.id}\n`);

  const resultat = {};
  for (const [marknad, konto] of Object.entries(KONTON)) {
    const rader = await lasKonto(konto.id, `${prefix}_`);
    resultat[marknad] = { konto, annonser: rader };
    const med = rader.filter((r) => r.med);
    console.log(`${marknad} — ${konto.namn} (${konto.id}): ${rader.length} annonser, ${med.length} ACTIVE`);
    for (const r of visaAlla ? rader : med) {
      console.log(
        `   ${r.med ? '✅' : '⏸ '} ${String(Math.round(r.utfall.spend)).padStart(6)} ${konto.valuta} | ` +
          `${String(r.utfall.kop).padStart(3)} köp | ROAS ${r.utfall.roas.toFixed(2).padStart(5)} | ` +
          `${r.typ.padEnd(5)} | ${r.namn}`
      );
    }
    if (rader.length === 0) console.log('   (ingen källkampanj för produkten i det här kontot)');
  }

  const mapp = join(ROT, 'output', produktId);
  mkdirSync(mapp, { recursive: true });
  writeFileSync(join(mapp, 'kallannonser.json'), JSON.stringify(resultat, null, 2));
  console.log(`\n✓ ${join('factory/output', produktId, 'kallannonser.json')}`);
}
