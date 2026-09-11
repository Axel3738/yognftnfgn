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

  // Kampanjmönstret per marknad. SE slås upp på det kända kampanj-id:t när
  // produktfilen bär ett; annars på prefixet. NO har egna produktnamn.
  //
  // ⚠️ NO har INGEN fallback, och ska aldrig få en igen. Fram till 2026-09-11
  // föll fältet tillbaka på 'gamasj|damask' — DryTreks damaskkampanj. Ingen
  // produktfil satte fältet, så VARJE körning läste DryTreks NO-kampanj som
  // om den vore produktens egen: CatCabin fick "16 annonser, 0 ACTIVE" och
  // den norska halvan såg tom ut, medan den riktiga kampanjen (Isolert
  // Utekattehus NO, 11 ACTIVE) aldrig ens lästes. Ett tyst fel på en annan
  // produkts data är värre än ett stopp — därför stoppar det här.
  if (p.kalla?.no_kampanjmonster === undefined || p.kalla?.no_kampanjmonster === null) {
    throw new Error(
      `produkter/${produktId}.yaml saknar kalla.no_kampanjmonster.\n` +
        `Den norska kampanjen heter sällan som den svenska (produktnamnet är översatt),\n` +
        `och utan mönstret går den inte att hitta. Slå upp den i Magiborsten NO\n` +
        `(${KONTON.NO.id}) och skriv in den del av kampanjnamnet som är unik, t.ex.\n` +
        `  no_kampanjmonster: "Isolert Utekattehus"\n` +
        `Finns det bevisligen ingen norsk kampanj: sätt fältet till "" och kör igen —\n` +
        `då läses NO som en äkta nolla i stället för som en gissning.`
    );
  }
  // Tom sträng = "det finns bevisligen ingen norsk kampanj". Den får ALDRIG
  // bli new RegExp('') — det mönstret matchar varje kampanjnamn i kontot och
  // hade dragit in hela Magiborsten NO som om allt vore produktens.
  const ingenNo = String(p.kalla.no_kampanjmonster).trim() === '';
  const MONSTER = {
    SE: new RegExp(p.kalla?.kampanj ? p.kalla.kampanj.split('|')[0].trim() : prefix, 'i'),
    NO: ingenNo ? null : new RegExp(p.kalla.no_kampanjmonster, 'i'),
  };

  console.log(`Källprefix SE: ${prefix}_ · Mål: ${MALKONTO.namn} ${MALKONTO.id}`);
  console.log(
    `Kampanjmönster: SE /${MONSTER.SE.source}/i · ` +
      `NO ${MONSTER.NO ? `/${MONSTER.NO.source}/i` : '— produktfilen säger att ingen norsk kampanj finns'}\n`
  );

  const resultat = {};
  for (const [marknad, konto] of Object.entries(KONTON)) {
    if (!MONSTER[marknad]) {
      resultat[marknad] = { konto, annonser: [], ingen_kampanj: true };
      console.log(`${marknad} — ${konto.namn} (${konto.id}): ingen källkampanj (kalla.no_kampanjmonster är tom)`);
      continue;
    }
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
