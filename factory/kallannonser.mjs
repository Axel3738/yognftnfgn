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

// ⚠️ Läs ALDRIG /act_<id>/ads med hela creative-blocket över ett helt konto —
// Graph svarar "Please reduce the amount of data you're asking for" (mätt
// 2026-09-09 på MagiBorsten, 80 kampanjer). Hitta kampanjerna först, läs
// annonserna per kampanj.
//
// ⚠️ Annonsprefixet är INTE detsamma i båda källkontona. Damaskerna heter
// `Damasker_` i SE och `Gamasjer_` i NO — produkten har olika namn på
// språken. Därför matchas KAMPANJEN på ett mönster, och prefixet läses ur
// annonserna i stället för att antas.
export async function lasKonto(kontoId, kampanjMonster) {
  const kampanjer = (
    await allaSidor(`/act_${kontoId}/campaigns`, { fields: 'id,name,status,objective' })
  ).filter((c) => kampanjMonster.test(c.name));

  const annonser = [];
  for (const k of kampanjer) {
    const rader = await allaSidor(`/${k.id}/ads`, {
      fields: [
        'id', 'name', 'status', 'effective_status',
        'adset{id,name,status,effective_status,daily_budget}',
        'campaign{id,name,status,objective}',
        'creative{id,name,object_story_spec,image_hash,image_url,video_id,thumbnail_url,object_type,link_url}',
      ].join(','),
    });
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
          // Videoannonser bär beskrivningen som `link_description` i video_data
          // (mätt 2026-09-10: "24 biler i en gaveeske, klar til jul – 439 kr" på
          // alla 12 norska videor stod som null här medan detektorn såg den).
          description: lank.description ?? lank.link_description ?? null,
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

  // Kampanjmönstret per marknad. SE slås upp på det kända kampanj-id:t när
  // produktfilen bär ett; annars på prefixet. NO: `kalla.no_kampanjmonster`
  // när produkten heter något annat på norska (DryTrek: Damasker → Gamasjer),
  // annars SAMMA prefix — husets NO-kampanjer heter "<Prefix> NO | …".
  // ⚠️ Standardvärdet var 'gamasj|damask' (DryTreks ord) fram till 2026-09-10:
  // AdventLane läste då DryTreks pausade norska kampanj som sin egen och
  // rapporterade "16 annonser, 0 ACTIVE" medan "Adventskalender NO" låg
  // ACTIVE med 16. Ett butiksord är aldrig en standard (KEDJAN.md regel 7).
  const MONSTER = {
    SE: new RegExp(p.kalla?.kampanj ? p.kalla.kampanj.split('|')[0].trim() : prefix, 'i'),
    NO: new RegExp(p.kalla?.no_kampanjmonster ?? prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
  };

  console.log(`Källprefix SE: ${prefix}_ · Mål: ${MALKONTO.namn} ${MALKONTO.id}`);
  console.log(`Kampanjmönster: SE /${MONSTER.SE.source}/i · NO /${MONSTER.NO.source}/i\n`);

  const resultat = {};
  for (const [marknad, konto] of Object.entries(KONTON)) {
    const rader = await lasKonto(konto.id, MONSTER[marknad]);
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
