// kallor.mjs — mätningarna bonusmotorn räknar på. LÄS-BARA överallt.
//
// Fyra mätningar, fyra källor:
//   recensioner — Judge.me (nyckel finns), Trustpilot (om nyckel läggs in),
//                 plus det VA:n själv rapporterat in och som blivit godkänt
//   tvister     — kundtjänstens veckorapporter (status won/needs response)
//   kundtjanst  — samma rapporter: obesvarade, svarstid, risk, SOP-täckning
//   produkttest — Notion "Product test center", statusen är trappan
//   commission  — commission/leaderboard.json (redigerarnas andel av spenden)
//
// En källa som inte går att läsa rapporteras med orsak. Den får ALDRIG bli
// noll: noll betyder "ingen tjänade något", och det är en helt annan sak än
// "vi kunde inte mäta".

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// ------------------------------------------------------------ recensioner

/**
 * Judge.me: produktrecensionerna. Namnet på den som recenserar följer med,
 * och det är TEXTEN vi letar VA:ns namn i.
 */
export async function judgeMe({ env = process.env, fetchFn = fetch, dagar = 60, logg = () => {} } = {}) {
  const butiker = [
    { id: 'baverbutiken', namn: 'Bäverbutiken', token: env.JUDGEME_API_TOKEN, shop: env.JUDGEME_SHOP_DOMAIN },
    { id: 'beverbutikken', namn: 'Beverbutikken', token: env.JUDGEME_NO_API_TOKEN, shop: env.JUDGEME_NO_SHOP_DOMAIN },
  ].filter((b) => b.token && b.shop);

  if (!butiker.length) return { status: 'saknas', orsak: 'JUDGEME_API_TOKEN + JUDGEME_SHOP_DOMAIN saknas i miljön', recensioner: [] };

  const grans = new Date(Date.now() - dagar * 86_400_000).toISOString();
  const ut = [];
  for (const b of butiker) {
    try {
      for (let sida = 1; sida <= 10; sida++) {
        const u = new URL('https://judge.me/api/v1/reviews');
        u.searchParams.set('api_token', b.token);
        u.searchParams.set('shop_domain', b.shop);
        u.searchParams.set('per_page', '100');
        u.searchParams.set('page', String(sida));
        const r = await fetchFn(u);
        if (!r.ok) throw new Error(`Judge.me svarade ${r.status}`);
        const j = await r.json();
        const rader = j.reviews ?? [];
        for (const rev of rader) {
          if (String(rev.created_at ?? '') < grans) continue;
          ut.push({
            kalla: 'Judge.me',
            butik: b.namn,
            betyg: Number(rev.rating) || 0,
            kund: rev.reviewer?.name ?? '',
            text: `${rev.title ?? ''} ${rev.body ?? ''}`.trim(),
            datum: rev.created_at,
            lank: rev.product_external_id ? `https://judge.me/reviews/${rev.id}` : '',
          });
        }
        if (rader.length < 100) break;
      }
      logg(`  Judge.me ${b.namn}: ${ut.length} recensioner hittills`);
    } catch (e) {
      logg(`  Judge.me ${b.namn}: ${e.message}`);
    }
  }
  return { status: 'ok', orsak: null, recensioner: ut };
}

/**
 * Trustpilot. Den publika sajten svarar 403 på maskiner (mätt 2026-09-21), så
 * vägen in är API-nyckeln. Utan nyckel rapporteras det som saknat — och VA:n
 * kan ändå få betalt genom att rapportera in recensionen med länk på sajten.
 */
export async function trustpilot({ env = process.env, fetchFn = fetch, dagar = 60, logg = () => {} } = {}) {
  const nyckel = env.TRUSTPILOT_API_KEY;
  const enheter = String(env.TRUSTPILOT_BUSINESS_UNITS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!nyckel) {
    return {
      status: 'saknas',
      orsak: 'TRUSTPILOT_API_KEY saknas. Utan den läser vi inga Trustpilot-recensioner automatiskt — VA:n får rapportera in dem med länk i stället.',
      recensioner: [],
    };
  }
  if (!enheter.length) {
    return { status: 'saknas', orsak: 'TRUSTPILOT_BUSINESS_UNITS saknas (kommaseparerade business unit-id:n)', recensioner: [] };
  }
  const grans = new Date(Date.now() - dagar * 86_400_000).toISOString();
  const ut = [];
  for (const enhet of enheter) {
    try {
      const u = new URL(`https://api.trustpilot.com/v1/business-units/${enhet}/reviews`);
      u.searchParams.set('apikey', nyckel);
      u.searchParams.set('perPage', '100');
      u.searchParams.set('orderBy', 'createdat.desc');
      const r = await fetchFn(u);
      if (!r.ok) throw new Error(`Trustpilot svarade ${r.status}`);
      const j = await r.json();
      for (const rev of j.reviews ?? []) {
        if (String(rev.createdAt ?? '') < grans) continue;
        ut.push({
          kalla: 'Trustpilot',
          butik: rev.businessUnit?.displayName ?? enhet,
          betyg: Number(rev.stars) || 0,
          kund: rev.consumer?.displayName ?? '',
          text: `${rev.title ?? ''} ${rev.text ?? ''}`.trim(),
          datum: rev.createdAt,
          lank: rev.links?.find?.((l) => l.rel === 'self')?.href ?? '',
        });
      }
      logg(`  Trustpilot ${enhet}: ${ut.length} recensioner hittills`);
    } catch (e) {
      logg(`  Trustpilot ${enhet}: ${e.message}`);
    }
  }
  return { status: 'ok', orsak: null, recensioner: ut };
}

// ------------------------------------------------- kundtjänst och tvister

/** Veckorapporterna: tvister, obesvarade, svarstid, risk, SOP. */
export function kundtjanstMatningar(rot, { veckor = 12 } = {}) {
  const mapp = join(rot, 'kundtjanst', 'korningar');
  if (!existsSync(mapp)) return { status: 'saknas', orsak: 'kundtjanst/korningar/ finns inte', tvister: [], veckor: [] };

  const tvister = new Map();
  const veckorader = [];
  for (const brand of readdirSync(mapp).filter((d) => !d.startsWith('_') && !d.startsWith('.'))) {
    const filer = readdirSync(join(mapp, brand)).filter((f) => f.endsWith('.json')).sort().slice(-veckor);
    for (const fil of filer) {
      let r;
      try { r = JSON.parse(readFileSync(join(mapp, brand, fil), 'utf8')); } catch { continue; }
      const n = r.nyckeltal ?? {};
      veckorader.push({
        brand,
        vecka: r.vecka,
        datum: (r.kord ?? '').slice(0, 10),
        obesvarade: n.obesvarade ?? null,
        medianTimmar: n.medianSvarstidTimmar ?? null,
        risk: n.risk ?? null,
        arenden: n.arenden ?? null,
        sopSaknas: Array.isArray(r.sop?.saknas) ? r.sop.saknas.length : null,
      });
      for (const t of r.tvister ?? []) {
        const order = String(t.order ?? '').trim();
        if (!order) continue;
        // Senaste rapporten vinner: en tvist kan gå från "needs response" till "won".
        tvister.set(order, {
          order,
          brand,
          typ: t.typ ?? null,
          belopp: t.belopp ?? null,
          valuta: t.valuta ?? 'SEK',
          deadline: t.deadline ?? null,
          initierad: t.initierad ?? null,
          status: t.status ?? null,
          besvarad: String(t.status ?? '').toLowerCase() !== 'needs response',
          utfall: ['won', 'lost'].includes(String(t.status ?? '').toLowerCase()) ? String(t.status).toLowerCase() : null,
          oppen: t.oppen !== false,
          rapport: (r.kord ?? '').slice(0, 10) || null,
        });
      }
    }
  }
  return { status: 'ok', orsak: null, tvister: [...tvister.values()], veckor: veckorader };
}

/**
 * Veckorapportens tvister + tvisterna lästa direkt ur Shopify (stonebite/
 * kallor/shopify.mjs hamtaAllaTvister). Butik för butik: har Shopify svarat
 * för butiken (`ok`, eller `saknas` = kör inte Shopify Payments) är Shopify
 * sanningen och veckorapportens rader för den butiken släpps helt — de kan
 * vara en vecka gamla. För en butik Shopify INTE svarade för står
 * veckorapportens rader kvar, märkta `kalla: 'veckorapport'` med rapportens
 * datum, så att sidan kan säga hur gammal uppgiften är. Ren.
 */
export function slaIhopTvister(veckorader = [], live = null) {
  if (!live) return veckorader;
  const lasta = new Set((live.butiker ?? []).filter((b) => b.status === 'ok' || b.status === 'saknas').map((b) => b.id));
  const kvar = veckorader.filter((t) => !lasta.has(t.brand)).map((t) => ({ ...t, kalla: t.kalla ?? 'veckorapport' }));
  return [...(live.lista ?? []), ...kvar];
}

// -------------------------------------------------------------- produkttest

const STEG = [
  { id: 'produkt_godkand', statusar: ['Ads review', 'In progress 2', 'To be Reviewed', 'Ready to launch', 'Testing', 'Made a sheet + notion', 'Has gotten over 2000 sek spend', 'Continue to scale', 'Hires for this product'] },
  { id: 'produkt_testad', statusar: ['Has gotten over 2000 sek spend', 'Continue to scale', 'Hires for this product'] },
  { id: 'produkt_skalad', statusar: ['Continue to scale', 'Hires for this product'] },
];

/**
 * Product test center i Notion. Statusen ÄR trappan: en produkt som nått
 * "Continue to scale" har passerat alla steg under, och testaren får betalt
 * för varje steg en gång.
 */
export async function produkttest({ env = process.env, fetchFn = fetch, databaser = [], logg = () => {} } = {}) {
  const token = env.NOTION_TOKEN;
  if (!token) return { status: 'saknas', orsak: 'NOTION_TOKEN saknas i miljön', rader: [] };

  const ut = [];
  for (const db of databaser) {
    try {
      let cursor;
      let varv = 0;
      do {
        const r = await fetchFn(`https://api.notion.com/v1/databases/${db.id}/query`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
          body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
        });
        if (!r.ok) throw new Error(`Notion svarade ${r.status}`);
        const j = await r.json();
        for (const sida of j.results ?? []) {
          const p = sida.properties ?? {};
          const titel = (p.Namn?.title ?? p.Name?.title ?? []).map((x) => x.plain_text).join('').trim();
          const status = p.Status?.status?.name ?? null;
          const typ = p.Typ?.select?.name ?? null;
          const ansvarig = (p.Ansvarig?.people ?? []).map((x) => x.name).filter(Boolean)[0] ?? null;
          const datum = p['Godkänd datum']?.date?.start ?? p.Skapad?.date?.start ?? sida.created_time ?? null;
          if (!titel) continue;
          const steg = STEG.filter((s) => s.statusar.includes(status)).map((s) => s.id);
          if (typ === 'Profitable') steg.push('produkt_lonsam');
          if (!steg.length) continue;
          ut.push({
            produkt: titel,
            butik: db.namn,
            ansvarig,
            status,
            typ,
            datum,
            steg,
            lank: sida.url ?? '',
          });
        }
        cursor = j.has_more ? j.next_cursor : null;
      } while (cursor && ++varv < 10);
      logg(`  Produkttest ${db.namn}: ${ut.length} rader hittills`);
    } catch (e) {
      logg(`  Produkttest ${db.namn}: ${e.message}`);
    }
  }
  return { status: 'ok', orsak: null, rader: ut };
}

// --------------------------------------------------------------- commission

/** Redigerarnas andel av spenden — räknad av commission-körningen. */
export function commission(rot) {
  const fil = join(rot, 'commission', 'leaderboard.json');
  if (!existsSync(fil)) return { status: 'saknas', orsak: 'commission/leaderboard.json finns inte', rader: [] };
  try {
    const lb = JSON.parse(readFileSync(fil, 'utf8'));
    return {
      status: 'ok',
      orsak: null,
      manad: lb.manad,
      uppdaterad: lb.uppdaterad ?? null,
      rader: (lb.rader ?? []).map((r) => ({
        personId: r.id, namn: r.namn, usd: r.usd, annonser: r.annonser, datum: lb.period?.till ?? null,
      })),
    };
  } catch (e) {
    return { status: 'fel', orsak: e.message, rader: [] };
  }
}

// ------------------------------------------------------- sammanfattningar

/**
 * Recensionerna i siffror — det sidan visar och det VA-teamet jagar.
 * `medNamn` är nyckeltalet: hur många recensioner som faktiskt nämner någon
 * i teamet. Är det noll är bonusen bara ett löfte, inte en drivkraft.
 */
export function sammanfattaRecensioner(recensioner = [], personer = [], { veckor = 12, nu = new Date() } = {}) {
  const namnformer = personer.map((p) => ({
    id: p.id,
    namn: p.namn,
    former: [p.fornamn, ...(p.alias ?? [])].filter(Boolean).map((x) => String(x).toLowerCase()),
  }));
  const harNamn = (text) => {
    const t = String(text ?? '').toLowerCase();
    return namnformer.filter((p) => p.former.some((n) => n.length >= 3
      && new RegExp(`(^|[^\\p{L}])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'u').test(t)));
  };

  const perButik = new Map();
  const perVecka = new Map();
  let bra = 0;
  let medNamn = 0;
  const senaste = [];

  for (const r of recensioner) {
    const butik = r.butik || 'Okänd butik';
    const b = perButik.get(butik) ?? { butik, antal: 0, summaBetyg: 0, fyraFem: 0, medNamn: 0, kallor: new Set() };
    b.antal += 1;
    b.summaBetyg += Number(r.betyg) || 0;
    b.kallor.add(r.kalla ?? 'okänd');
    if (Number(r.betyg) >= 4) { b.fyraFem += 1; bra += 1; }
    const traffar = harNamn(r.text);
    if (traffar.length) { b.medNamn += 1; medNamn += 1; }
    perButik.set(butik, b);

    const v = String(r.datum ?? '').slice(0, 10);
    if (v) {
      const rad = perVecka.get(v.slice(0, 7)) ?? { manad: v.slice(0, 7), antal: 0, medNamn: 0 };
      rad.antal += 1;
      if (traffar.length) rad.medNamn += 1;
      perVecka.set(v.slice(0, 7), rad);
    }
    senaste.push({
      butik, kalla: r.kalla, betyg: r.betyg, kund: r.kund,
      text: String(r.text ?? '').slice(0, 220), datum: r.datum, lank: r.lank ?? '',
      personer: traffar.map((p) => p.namn),
    });
  }

  senaste.sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
  return {
    antal: recensioner.length,
    fyraFem: bra,
    medNamn,
    snitt: recensioner.length ? recensioner.reduce((s, r) => s + (Number(r.betyg) || 0), 0) / recensioner.length : null,
    butiker: [...perButik.values()].map((b) => ({
      ...b,
      kallor: [...b.kallor],
      snitt: b.antal ? b.summaBetyg / b.antal : null,
    })).sort((a, b) => b.antal - a.antal),
    manader: [...perVecka.values()].sort((a, b) => a.manad.localeCompare(b.manad)).slice(-veckor),
    senaste: senaste.slice(0, 60),
    medNamnSenaste: senaste.filter((r) => r.personer.length).slice(0, 25),
  };
}

/** Produkttesten i siffror: var i trappan produkterna står. */
export function sammanfattaProdukttest(rader = []) {
  const steg = { produkt_godkand: 0, produkt_testad: 0, produkt_lonsam: 0, produkt_skalad: 0 };
  const perAnsvarig = new Map();
  for (const r of rader) {
    for (const s of r.steg ?? []) if (steg[s] !== undefined) steg[s] += 1;
    const a = r.ansvarig || 'Ingen ansvarig';
    const p = perAnsvarig.get(a) ?? { ansvarig: a, antal: 0, lonsamma: 0, skalade: 0 };
    p.antal += 1;
    if ((r.steg ?? []).includes('produkt_lonsam')) p.lonsamma += 1;
    if ((r.steg ?? []).includes('produkt_skalad')) p.skalade += 1;
    perAnsvarig.set(a, p);
  }
  return {
    antal: rader.length,
    steg,
    personer: [...perAnsvarig.values()].sort((a, b) => b.antal - a.antal),
    rader: rader.slice(0, 200),
  };
}
