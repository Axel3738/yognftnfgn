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
import { lasProduktfil } from './produktfil.mjs';
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

async function allaSidor(sokvag, params = {}, limit = 100) {
  const ut = [];
  let nasta = null;
  for (;;) {
    const j = nasta
      ? await (await fetch(nasta)).json()
      : await graph(sokvag, { ...params, limit });
    ut.push(...(j.data ?? []));
    nasta = j.paging?.next ?? null;
    if (!nasta) break;
  }
  return ut;
}

// ⚠️ Läs ALDRIG /act_<id>/ads med hela creative-blocket över ett helt konto —
// Graph svarar "Please reduce the amount of data you're asking for" (mätt
// 2026-09-09 på MagiBorsten, 80 kampanjer). Hitta kampanjerna först, läs
// annonserna per kampanj.
//
// ⚠️ Annonsprefixet är INTE detsamma i båda källkontona. Damaskerna heter
// `Damasker_` i SE och `Gamasjer_` i NO — produkten har olika namn på
// språken. Därför matchas KAMPANJEN på ett mönster, och prefixet läses ur
// annonserna i stället för att antas.
// Kampanjerna slås upp i tre lager, det första som ger träff vinner:
//  1. kampanjId — produktfilens kalla.kampanj_id / kalla.no_kampanj_id, exakt.
//  2. annonsprefixen — varje kampanj som har annonser vars namn börjar med
//     något av prefixen (lätt fråga: bara name + campaign, aldrig creative).
//     ⚠️ Kampanjnamnet är svenskt ("Fiskespöhållaren | BE ROAS 1.50") medan
//     annonserna heter Rodholder_… — ett namnmönster på prefixet gav 0
//     annonser på TackleBay 2026-09-10. Prefixet sitter på ANNONSEN.
//  3. kampanjMonster — namnmönstret, som förut.
export async function lasKonto(kontoId, kampanjMonster, { kampanjId = null, prefix = [] } = {}) {
  const allaKampanjer = await allaSidor(`/act_${kontoId}/campaigns`, { fields: 'id,name,status,objective' });
  let kampanjer = kampanjId ? allaKampanjer.filter((c) => String(c.id) === String(kampanjId)) : [];
  if (kampanjer.length === 0 && prefix.length > 0) {
    const ids = new Set();
    for (const pre of prefix) {
      const rader = await allaSidor(`/act_${kontoId}/ads`, {
        fields: 'name,campaign{id}',
        filtering: JSON.stringify([{ field: 'name', operator: 'CONTAIN', value: `${pre}_` }]),
      });
      for (const a of rader) if (a.name.startsWith(`${pre}_`) && a.campaign?.id) ids.add(String(a.campaign.id));
    }
    kampanjer = allaKampanjer.filter((c) => ids.has(String(c.id)));
  }
  if (kampanjer.length === 0 && kampanjMonster) kampanjer = allaKampanjer.filter((c) => kampanjMonster.test(c.name));

  const annonser = [];
  for (const k of kampanjer) {
    // 15 per sida: med asset_feed_spec i creative-blocket svarar Meta
    // "Please reduce the amount of data" på 100 (TackleBay 2026-09-10).
    const rader = await allaSidor(`/${k.id}/ads`, {
      fields: [
        'id', 'name', 'status', 'effective_status',
        'adset{id,name,status,effective_status,daily_budget}',
        'campaign{id,name,status,objective}',
        'creative{id,name,object_story_spec,asset_feed_spec,image_hash,image_url,video_id,thumbnail_url,object_type,link_url}',
      ].join(','),
    }, 15);
    annonser.push(...rader);
  }
  const traff = annonser;

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
      // Dynamiska creatives (asset_feed_spec) bär copyn i bodies/titles/
      // descriptions och bilderna som en lista av hashar — object_story_spec
      // har då bara page_id. 23 av 89 TackleBay-källor var sådana och kom
      // tillbaka med tom copy (2026-09-10). Första posten i varje lista är
      // den som visas; övriga hashar sparas som `bilder`.
      const afs = a.creative?.asset_feed_spec ?? null;
      const lank = spec.link_data ?? spec.video_data ?? (afs
        ? {
            message: afs.bodies?.[0]?.text ?? null,
            name: afs.titles?.[0]?.text ?? null,
            description: afs.descriptions?.[0]?.text ?? null,
            link: afs.link_urls?.[0]?.website_url ?? null,
            image_hash: afs.images?.[0]?.hash ?? null,
            video_id: afs.videos?.[0]?.video_id ?? null,
            call_to_action: { type: afs.call_to_action_types?.[0] ?? null },
          }
        : {});
      const cta = lank.call_to_action ?? {};
      return {
        id: a.id,
        namn: a.name,
        status: a.status,
        effektiv: a.effective_status,
        adset: a.adset ? { id: a.adset.id, namn: a.adset.name, status: a.adset.status, effektiv: a.adset.effective_status, budget: a.adset.daily_budget } : null,
        kampanj: a.campaign ? { id: a.campaign.id, namn: a.campaign.name, status: a.campaign.status, mal: a.campaign.objective } : null,
        typ: a.creative?.video_id || lank.video_id ? 'video' : 'bild',
        dynamisk: Boolean(afs),
        creative: {
          id: a.creative?.id ?? null,
          image_hash: a.creative?.image_hash ?? lank.image_hash ?? null,
          image_url: a.creative?.image_url ?? null,
          video_id: a.creative?.video_id ?? lank.video_id ?? null,
          thumbnail: a.creative?.thumbnail_url ?? null,
          bilder: afs ? (afs.images ?? []).map((b) => ({ hash: b.hash, etikett: b.adlabels?.[0]?.name ?? null })) : [],
          videor: afs ? (afs.videos ?? []).map((v) => ({ video_id: v.video_id, etikett: v.adlabels?.[0]?.name ?? null })) : [],
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

  const { p } = lasProduktfil(produktId);
  const prefix = p.kalla?.annonsprefix;
  if (!prefix) throw new Error(`produkter/${produktId}.yaml saknar kalla.annonsprefix.`);
  if (String(p.meta?.ad_account_id) !== MALKONTO.id) {
    throw new Error(`meta.ad_account_id är ${p.meta?.ad_account_id}, ska vara ${MALKONTO.id}. Stoppar.`);
  }

  // Kampanjmönstret per marknad. SE slås upp på det kända kampanj-id:t när
  // produktfilen bär ett; annars på prefixet. NO har egna produktnamn.
  // Prefixen kan vara flera (SE: Rodholder_ OCH Fiskespöhållare_ i samma
  // kampanj, mätt 2026-09-10) och skilja sig per marknad (NO: Gamasjer_ för
  // damaskerna). Ett namnmönster utan träff är inte ett fel — det är lager 3.
  const lista = (v) => (Array.isArray(v) ? v : [v]).map((x) => String(x ?? '').trim()).filter(Boolean);
  const PREFIX = { SE: lista(prefix), NO: lista(p.kalla?.no_annonsprefix ?? prefix) };
  const KAMPANJ_ID = { SE: p.kalla?.kampanj_id || null, NO: p.kalla?.no_kampanj_id || null };
  const MONSTER = {
    SE: p.kalla?.kampanj ? new RegExp(p.kalla.kampanj.split('|')[0].trim(), 'i') : null,
    NO: p.kalla?.no_kampanjmonster ? new RegExp(p.kalla.no_kampanjmonster, 'i') : null,
  };

  console.log(`Källprefix SE: ${PREFIX.SE.join('_, ')}_ · NO: ${PREFIX.NO.join('_, ')}_ · Mål: ${MALKONTO.namn} ${MALKONTO.id}`);
  console.log(`Kampanj-id: SE ${KAMPANJ_ID.SE ?? '—'} · NO ${KAMPANJ_ID.NO ?? '—'} · namnmönster: SE ${MONSTER.SE?.source ?? '—'} · NO ${MONSTER.NO?.source ?? '—'}\n`);

  const resultat = {};
  for (const [marknad, konto] of Object.entries(KONTON)) {
    const rader = await lasKonto(konto.id, MONSTER[marknad], { kampanjId: KAMPANJ_ID[marknad], prefix: PREFIX[marknad] });
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
    else if (med.length === 0) {
      const k = [...new Set(rader.map((r) => `${r.kampanj?.namn} (${r.kampanj?.status})`))].join(', ');
      console.log(`   ⏸  ${rader.length} annonser finns men ingen räknas: kampanjen är avstängd — ${k}. PAUSED är ett beslut, inte kandidatmaterial.`);
    }
  }

  const mapp = join(ROT, 'output', produktId);
  mkdirSync(mapp, { recursive: true });
  writeFileSync(join(mapp, 'kallannonser.json'), JSON.stringify(resultat, null, 2));
  console.log(`\n✓ ${join('factory/output', produktId, 'kallannonser.json')}`);
}
