// trippelkoll.mjs — läser TILLBAKA hela butiken ur Shopify och jämför med
// konfigen. Ingen rad kommer ur minnet eller ur en state-fil (utom tema-id:t,
// som är låst i state enligt KEDJAN regel 1).
//
//   node factory/trippelkoll.mjs <butik-id> <produkt-id> [<produkt-id> …]
//
// Regeln (2026-09-07): säg ALDRIG "klart" utan tre kontroller mot kundens
// riktiga vy. Det här är den första — API-kontrollen. Den andra är kundvyn
// (kundvy-kor.mjs: riktig HTML, markörer, struktur, köptest). Den tredje —
// mobilvyn i temaredigeraren — kräver ögon och står alltid som manuell.
//
// KRAVEN KOMMER UR YAML, aldrig härifrån (KEDJAN regel 7): marknaderna och
// deras locales ur butik.marknader, paketnivåer och rabattkoder ur
// paket.byggPaketplan(produkt, butik), metafälten ur metafalt.byggMetafalt,
// sidorna ur samma menyrader ops.mjs skriver (ctx.menylankar / meny.mjs).
//
// samlaLage(ctx, butik, produkter) → { grona, fel, manuella, rader }
//   ctx: { shop?, arbetstemaId?, policyer?, menylankar?, huvudmenylankar? }
//   bedomLage(d, …) är den rena delen och testas med fixture-data.

import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql, valjArbetstema } from './shopify.mjs';
import { lasState } from './state.mjs';
import { sammanfoga } from './butik.mjs';
import { byggPaketplan, METAOBJEKT_TYP } from './paket.mjs';
import { byggMetafalt } from './metafalt.mjs';
import { byggPolicyer } from './policyer.mjs';
import { huvudmenyRader } from './meny.mjs';
import { TEMAFILER } from './tema.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
export const IKON = { ok: '✅', fel: '❌', manuell: '🖐', varning: '⚠️ ' };

// Huvudspråket följer landet bolaget sitter i (butik.land), om inte
// butik.locale säger något annat. Allmän tabell, inte butiksspecifik.
export const LOCALE_FOR_LAND = { SE: 'sv', NO: 'nb', DK: 'da', FI: 'fi', DE: 'de', GB: 'en', US: 'en' };
export function huvudlocale(butik) {
  const egen = String(butik?.butik?.locale ?? '').trim();
  if (egen) return egen;
  return LOCALE_FOR_LAND[String(butik?.butik?.land ?? '').toUpperCase()] ?? null;
}

const num = (gid) => String(gid ?? '').split('/').pop();
const prod = (x) => x?.p ?? x;

// Sidhandles: exakt de sidor menyerna pekar på. ctx:s menyrader först (samma
// som ops.mjs skrev); utan ctx byggs de om ur meny.mjs + policyer.mjs.
export function sidhandlesUr(ctx, butik, produkter) {
  const ps = (produkter ?? []).map(prod).filter(Boolean);
  const rader = [
    ...(ctx?.menylankar ?? []),
    ...(ctx?.huvudmenylankar ?? []),
  ];
  if (rader.length === 0 && ps.length > 0) {
    try { rader.push(...huvudmenyRader(butik, ps)); } catch { /* utan produkter finns ingen meny */ }
    rader.push(...(ctx?.policyer ?? byggPolicyer(ps[0])).map((x) => ({ url: `/pages/${x.handle}` })));
  }
  const handles = rader
    .map((r) => String(r?.url ?? '').match(/^\/pages\/([^/?#]+)/)?.[1])
    .filter(Boolean);
  return [...new Set(handles)];
}

// Kraven ur yaml och kedjans egna byggare — det facit tillbakaläsningen mäts mot.
export function byggKrav(butik, produkter, ctx = {}) {
  const ps = (produkter ?? []).map(prod).filter(Boolean);
  const marknader = (butik?.butik?.marknader ?? [])
    .map((m) => ({ land: String(m.land ?? '').toUpperCase(), locale: String(m.locale ?? '').trim(), valuta: m.valuta ?? null }))
    .filter((m) => m.land && m.locale);
  const perProdukt = ps.map((p) => {
    const handle = p.produkt?.handle ?? p.produkt?.id;
    let plan = null;
    let planFel = null;
    try { plan = byggPaketplan(p, butik); } catch (e) { planFel = e.message; }
    let metafalt = [];
    try { metafalt = byggMetafalt(p).filter((m) => m.value !== null && m.value !== undefined && m.value !== '').map((m) => m.key); } catch { metafalt = []; }
    return {
      handle,
      pris: Number(p.ekonomi?.pris),
      jamforpris: p.ekonomi?.jamforpris ?? null,
      antalBilder: Array.isArray(p.media?.bilder) ? p.media.bilder.filter(Boolean).length : 0,
      metafalt,
      plan,
      planFel,
      bonusHandle: p.offer?.bonus_produkt?.handle ?? null,
    };
  });
  return {
    valuta: butik?.butik?.valuta ?? null,
    huvudlocale: huvudlocale(butik),
    marknader,
    sidhandles: sidhandlesUr(ctx, butik, ps),
    produkter: perProdukt,
    arbetstemaId: ctx?.arbetstemaId ?? null,
  };
}

// Ren bedömning: d = tillbakaläsningen, krav = byggKrav(...).
// Returnerar { grona, fel, manuella, rader } där varje rad är { namn, detalj }.
export function bedomLage(d, krav) {
  const rader = [];
  const lagg = (utfall, namn, detalj) => rader.push({ utfall, namn, detalj });
  const shop = d.shop ?? {};

  // ---- butiken
  lagg('ok', 'butik', `${shop.name ?? '?'} (${shop.myshopifyDomain ?? '?'}, ${shop.currencyCode ?? '?'})`);
  if (krav.valuta && shop.currencyCode && shop.currencyCode !== krav.valuta) {
    lagg('fel', 'valuta', `butiken står i ${shop.currencyCode}, butik.yaml säger ${krav.valuta}`);
  }
  const host = shop.primaryDomain?.host ?? '';
  lagg(
    host.endsWith('myshopify.com') || !host ? 'manuell' : 'ok',
    'domän',
    host.endsWith('myshopify.com') || !host ? `fortfarande ${host || '?'} — riktig domän inte kopplad` : host
  );

  // ---- produkterna
  for (const k of krav.produkter) {
    const p = d.produkter?.[k.handle] ?? null;
    const pre = krav.produkter.length > 1 ? `${k.handle}: ` : '';
    if (!p) {
      lagg('fel', `${pre}produkt`, `handle ${k.handle} finns inte i butiken`);
      continue;
    }
    lagg(p.status === 'ACTIVE' ? 'ok' : 'fel', `${pre}produkt`, `${p.title} — ${p.status}`);
    const v = p.variants?.nodes ?? [];
    const felPris = v.filter((x) => Number(x.price) !== k.pris);
    lagg(v.length > 0 && felPris.length === 0 ? 'ok' : 'fel', `${pre}priser`,
      v.length === 0
        ? 'inga varianter lästes'
        : felPris.length === 0
          ? `${k.pris} ${shop.currencyCode ?? ''} på alla ${v.length} varianter, jämförpris ${k.jamforpris ?? '—'}`
          : `${felPris.length} varianter har fel pris (${felPris.map((x) => x.price).join(', ')})`);
    const felLager = v.filter((x) => x.inventoryPolicy !== 'CONTINUE' || x.inventoryItem?.tracked !== false);
    lagg(felLager.length === 0 ? 'ok' : 'fel', `${pre}lagerpolicy`,
      felLager.length === 0
        ? `CONTINUE + tracked:false på alla ${v.length} varianter`
        : `${felLager.length} varianter stoppar försäljningen när saldot tar slut — kör lagerpolicy.mjs`);
    const media = p.media?.nodes?.length ?? 0;
    lagg(media > 0 ? 'ok' : 'fel', `${pre}bilder`, `${media} media i butiken, ${k.antalBilder} i produktfilen`);
    const finnsFalt = new Set((p.metafields?.nodes ?? []).map((m) => m.key));
    const saknadeFalt = k.metafalt.filter((key) => !finnsFalt.has(key));
    lagg(saknadeFalt.length === 0 ? 'ok' : 'fel', `${pre}metafält`,
      saknadeFalt.length === 0 ? `${finnsFalt.size} opf-fält, alla ${k.metafalt.length} väntade finns` : `saknas: ${saknadeFalt.join(', ')}`);

    // ---- paketen och koderna (facit: byggPaketplan)
    if (k.planFel) {
      lagg('fel', `${pre}paketnivåer`, `paketkonfigen håller inte: ${k.planFel}`);
    } else if (k.plan) {
      const egna = (d.metaobjects ?? []).filter((n) => {
        const ref = n.fields?.find((f) => f.key === 'produkt')?.value;
        return ref && num(ref) === num(p.id);
      });
      const handles = new Set(egna.map((n) => n.handle));
      const saknadeNivaer = k.plan.poster.map((x) => x.handle).filter((h) => !handles.has(h));
      lagg(saknadeNivaer.length === 0 ? 'ok' : 'fel', `${pre}paketnivåer`,
        saknadeNivaer.length === 0 ? `${egna.length} nivåer i butiken, alla ${k.plan.poster.length} planerade finns` : `saknas: ${saknadeNivaer.join(', ')}`);
      const perVariant = new Map();
      for (const n of egna) {
        const v2 = (n.fields?.find((f) => f.key === 'ab_variant')?.value ?? '').toLowerCase();
        const forvald = (n.fields?.find((f) => f.key === 'forvald')?.value ?? '') === 'true';
        perVariant.set(v2, (perVariant.get(v2) ?? 0) + (forvald ? 1 : 0));
      }
      const felForvald = [...perVariant].filter(([, antal]) => antal !== 1);
      lagg(egna.length > 0 && felForvald.length === 0 ? 'ok' : 'fel', `${pre}förvald nivå`,
        egna.length === 0
          ? 'inga nivåer att bedöma'
          : felForvald.length === 0
            ? 'exakt en förvald per variant'
            : felForvald.map(([v2, antal]) => `variant ${v2 || '(alla)'}: ${antal} förvalda — ska vara exakt 1 (mitten)`).join('; '));
      const koderIButiken = new Map();
      for (const n of d.codeDiscountNodes ?? []) {
        const cd = n.codeDiscount ?? {};
        for (const c of cd.codes?.nodes ?? []) koderIButiken.set(c.code, cd);
      }
      const kodfel = [];
      for (const kod of k.plan.koder) {
        const cd = koderIButiken.get(kod.kod);
        if (!cd) { kodfel.push(`${kod.kod} finns inte`); continue; }
        if (cd.status && cd.status !== 'ACTIVE') kodfel.push(`${kod.kod} är ${cd.status}`);
        const belopp = cd.customerGets?.value?.amount?.amount;
        if (belopp !== undefined && Number(belopp) !== Number(kod.belopp)) kodfel.push(`${kod.kod} ger −${belopp}, ska ge −${kod.belopp}`);
        const minst = cd.minimumRequirement?.greaterThanOrEqualToQuantity;
        if (minst !== undefined && Number(minst) !== Number(kod.minstAntal)) kodfel.push(`${kod.kod} kräver ${minst} varor, ska kräva ${kod.minstAntal}`);
      }
      lagg(kodfel.length === 0 ? 'ok' : 'fel', `${pre}rabattkoder`,
        kodfel.length === 0
          ? (k.plan.koder.length > 0 ? `${k.plan.koder.length} koder finns och stämmer: ${k.plan.koder.map((x) => x.kod).join(', ')}` : 'inga koder planerade (alla nivåer ordinarie)')
          : kodfel.join('; '));
    }
    if (k.bonusHandle) {
      const b = d.produkter?.[k.bonusHandle] ?? null;
      lagg(b?.status === 'ACTIVE' ? 'ok' : 'fel', `${pre}bonusprodukt`, b ? `${b.title} — ${b.status}` : `handle ${k.bonusHandle} finns inte i butiken`);
    }
  }

  // ---- temat: id ur state (KEDJAN regel 1), annars CRO-temat.
  const teman = d.themes ?? [];
  const tema = valjArbetstema(teman, krav.arbetstemaId);
  lagg(tema ? 'ok' : 'fel', 'OPS-temat', tema ? `${tema.name} (${tema.role})` : `saknas — teman: ${teman.map((t) => `${t.name} (${t.role})`).join(', ') || 'inga'}`);
  if (tema) {
    const live = teman.find((t) => t.role === 'MAIN');
    // themePublish fungerar via API (mätt 2026-09-09 på DryTrek, noll
    // userErrors). Publiceringen görs vid --launch — tills dess ser kunden
    // live-temat, och raden står som väntande, inte som spärrad.
    lagg(tema.role === 'MAIN' ? 'ok' : 'manuell', 'publicerat tema',
      tema.role === 'MAIN' ? tema.name : `kunden ser "${live?.name ?? '?'}" — OPS-temat publiceras vid --launch (themePublish via API)`);
  }

  // ---- fabriksägda filer i det PUBLICERADE temat. Tema-steget skriver till
  // arbetstemat; det kunden laddar är live-temat. 2026-09-10 stod TankGuard
  // och HeimGuard live med den gamla ms-paket.js (koden före varorna,
  // dubbelköp) dagen efter att buggen rapporterats löst. Raden läser filen
  // ur live-temat och jämför byte för byte — grön betyder att kunden kör
  // fabrikens kod, inte att en fil med rätt namn finns.
  const liveFiler = d.livetemaFiler ?? {};
  for (const [fil, fabrik] of Object.entries(TEMAFILER)) {
    const inne = liveFiler[fil];
    const identisk = inne === fabrik;
    lagg(identisk ? 'ok' : 'fel', `fabriksfiler i publicerat tema`,
      identisk
        ? `${fil} är fabrikens (${Buffer.byteLength(fabrik, 'utf8')} byte)`
        : `${fil} ${inne == null ? 'saknas i live-temat' : `är ${Buffer.byteLength(inne, 'utf8')} byte, fabrikens ${Buffer.byteLength(fabrik, 'utf8')}`} — kör node factory/varukorgsfix.mjs <butik-id>`);
  }

  // ---- marknader och språk (krav: butik.marknader)
  const locales = d.shopLocales ?? [];
  const primar = locales.find((l) => l.primary);
  if (krav.huvudlocale) {
    lagg(primar?.locale === krav.huvudlocale ? 'ok' : 'manuell', 'primärspråk',
      primar?.locale === krav.huvudlocale ? krav.huvudlocale : `${primar?.locale ?? '?'} — ${krav.huvudlocale} sätts som default i admin (Settings → Languages)`);
  }
  const wps = d.webPresences ?? [];
  for (const m of krav.marknader) {
    const loc = locales.find((l) => l.locale === m.locale);
    lagg(loc?.published ? 'ok' : 'fel', `locale ${m.locale}`, loc ? `publicerad: ${loc.published}` : 'saknas — kör marknad.mjs');
    const mk = (d.markets ?? []).find((x) =>
      (x.conditions?.regionsCondition?.regions?.nodes ?? []).some((r) => r.code === m.land) ||
      x.handle === m.land.toLowerCase());
    lagg(mk?.status === 'ACTIVE' ? 'ok' : 'fel', `marknad ${m.land}`, mk ? `${mk.name} — ${mk.status}` : 'saknas — kör marknad.mjs');
    const harLoc = wps.some((wp) => (wp.alternateLocales ?? []).some((l) => l.locale === m.locale) || wp.defaultLocale?.locale === m.locale);
    lagg(harLoc ? 'ok' : 'fel', `${m.locale} på domänen`, harLoc ? `${m.locale} ligger på webPresence` : `${m.locale} saknas — /${m.locale} finns inte för kunden`);
    if (m.valuta && shop.currencyCode && m.valuta !== shop.currencyCode) {
      lagg('manuell', `valuta ${m.land}`, `${m.valuta} slås på i admin (Markets) — butiken står i ${shop.currencyCode}`);
    }
  }

  // ---- sidorna (facit: menyraderna)
  const finns = new Set((d.pages ?? []).map((s) => s.handle));
  const utan = krav.sidhandles.filter((h) => !finns.has(h));
  lagg(utan.length === 0 ? 'ok' : 'fel', 'sidor', utan.length === 0 ? `${krav.sidhandles.length} sidor: ${krav.sidhandles.join(', ')}` : `saknas: ${utan.join(', ')}`);

  // ---- menyn: varje produkt ska ha sin rad i huvudmenyn
  const huvudmeny = (d.menus ?? []).find((m) => m.handle === 'main-menu');
  if (huvudmeny) {
    const urls = (huvudmeny.items ?? []).map((i) => String(i.url ?? ''));
    const utanRad = krav.produkter.filter((k) => !urls.some((u) => u.includes(`/products/${k.handle}`)));
    lagg(utanRad.length === 0 ? 'ok' : 'fel', 'huvudmeny', utanRad.length === 0 ? `${urls.length} rader` : `saknar rad för: ${utanRad.map((k) => k.handle).join(', ')}`);
  }

  // ---- det som kräver en människa
  lagg('manuell', 'mobilvyn', 'INTE granskad — ögonjobb i temaredigeraren');
  if (d.onlineStore?.passwordProtection?.enabled) {
    lagg('manuell', 'lösenordsskydd', 'butiken är lösenordsskyddad (trial) — kundvyn kontrolleras med SHOPIFY_STOREFRONT_PASSWORD i kundvy-kor.mjs');
  }

  const grona = rader.filter((r) => r.utfall === 'ok').map(({ namn, detalj }) => ({ namn, detalj }));
  const fel = rader.filter((r) => r.utfall === 'fel').map(({ namn, detalj }) => ({ namn, detalj }));
  const manuella = rader.filter((r) => r.utfall === 'manuell').map(({ namn, detalj }) => ({ namn, detalj }));
  return { grona, fel, manuella, rader };
}

// ---- tillbakaläsningen -----------------------------------------------------------

const PRODUKTFALT = `
  id title handle status
  variants(first: 100) { nodes { id title price compareAtPrice inventoryPolicy inventoryItem { tracked } } }
  media(first: 50) { nodes { id } }
  metafields(first: 50, namespace: "opf") { nodes { key } }`;

export async function hamtaLage(handles) {
  const d = await graphql(
    `query opsFactoryTrippel {
      shop { name myshopifyDomain currencyCode primaryDomain { host } }
      onlineStore { passwordProtection { enabled } }
      themes(first: 20) { nodes { id name role } }
      shopLocales { locale primary published }
      markets(first: 50) { nodes { id name handle status conditions { regionsCondition { regions(first: 20) { nodes { ... on MarketRegionCountry { code } } } } } } }
      webPresences(first: 20) { nodes { id defaultLocale { locale } alternateLocales { locale } } }
      metaobjects(type: "${METAOBJEKT_TYP}", first: 100) { nodes { id handle fields { key value } } }
      pages(first: 100) { nodes { handle title } }
      menus(first: 20) { nodes { handle items { title url } } }
      codeDiscountNodes(first: 100) {
        nodes { id codeDiscount { ... on DiscountCodeBasic {
          title status codes(first: 5) { nodes { code } }
          customerGets { value { ... on DiscountAmount { amount { amount } } ... on DiscountPercentage { percentage } } }
          minimumRequirement { ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity } }
        } } }
      }
    }`
  );
  const produkter = {};
  for (const h of [...new Set(handles.filter(Boolean))]) {
    const q = await graphql(
      `query opsFactoryTrippelProdukt($handle: String!) { productByIdentifier(identifier: { handle: $handle }) { ${PRODUKTFALT} } }`,
      { handle: h }
    );
    produkter[h] = q.productByIdentifier ?? null;
  }
  // Fabriksägda filer ur det publicerade temat — innehållet, inte bara
  // storleken, så bedömningen kan jämföra byte för byte.
  const livetemaFiler = {};
  const live = (d.themes?.nodes ?? []).find((t) => t.role === 'MAIN');
  if (live) {
    const f = await graphql(
      `query opsFactoryTrippelLivefiler($id: ID!, $filenames: [String!]) {
        theme(id: $id) { files(first: 20, filenames: $filenames) {
          nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } }
        } }
      }`,
      { id: live.id, filenames: Object.keys(TEMAFILER) }
    );
    for (const n of f.theme?.files?.nodes ?? []) livetemaFiler[n.filename] = n.body?.content ?? null;
  }
  return {
    shop: d.shop,
    onlineStore: d.onlineStore,
    themes: d.themes?.nodes ?? [],
    livetemaFiler,
    shopLocales: d.shopLocales ?? [],
    markets: d.markets?.nodes ?? [],
    webPresences: d.webPresences?.nodes ?? [],
    metaobjects: d.metaobjects?.nodes ?? [],
    pages: d.pages?.nodes ?? [],
    menus: d.menus?.nodes ?? [],
    codeDiscountNodes: d.codeDiscountNodes?.nodes ?? [],
    produkter,
  };
}

// samlaLage(ctx, butik, produkter) → { grona, fel, manuella, rader }
export async function samlaLage(ctx, butik, produkter) {
  const krav = byggKrav(butik, produkter, ctx);
  const handles = [...krav.produkter.map((k) => k.handle), ...krav.produkter.map((k) => k.bonusHandle)].filter(Boolean);
  const d = await hamtaLage(handles);
  return bedomLage(d, krav);
}

// Kodkollen mot admin — reservvägen när korgen är stängd för molnsessionen
// (Cloudflare): rabattkodernas belopp och minsta antal, produkt- och
// bonuspriset. Exakt de definitioner kassan räknar med, så en grön kodkoll +
// ett ögonköp av en människa ersätter korgtestet. Rader [namn, ok, detalj].
export async function kodkoll(ctx, produkt, butik) {
  const p = prod(produkt);
  const handle = p.produkt?.handle ?? p.produkt?.id;
  const bonusHandle = p.offer?.bonus_produkt?.handle ?? null;
  const pris = Number(p.ekonomi?.pris);
  const bonuspris = Number(p.offer?.bonus_produkt?.pris) || 0;
  const plan = byggPaketplan(p, butik);
  const ut = [];
  const q = await graphql(
    `query opsFactoryKodkoll($h: String!, $b: String!) {
      produkt: productByIdentifier(identifier: { handle: $h }) { status variants(first: 1) { nodes { price } } }
      bonus: productByIdentifier(identifier: { handle: $b }) { status variants(first: 1) { nodes { price } } }
    }`,
    { h: handle, b: bonusHandle ?? handle }
  );
  const pPris = Number(q.produkt?.variants?.nodes?.[0]?.price);
  ut.push([`produktpriset i admin = ${pris} kr (ACTIVE)`, pPris === pris && q.produkt?.status === 'ACTIVE', `admin: ${pPris} kr, ${q.produkt?.status ?? '?'}`]);
  if (bonusHandle) {
    const bPris = Number(q.bonus?.variants?.nodes?.[0]?.price);
    ut.push([`bonuspriset i admin = ${bonuspris} kr fullpris (ACTIVE)`, bPris === bonuspris && q.bonus?.status === 'ACTIVE', `admin: ${bPris} kr, ${q.bonus?.status ?? '?'}`]);
  }
  for (const k of plan.koder) {
    const d = await graphql(
      `query opsFactoryKod($kod: String!) {
        codeDiscountNodeByCode(code: $kod) { codeDiscount { ... on DiscountCodeBasic {
          status
          customerGets { value { ... on DiscountAmount { amount { amount } } ... on DiscountPercentage { percentage } } }
          minimumRequirement { ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity } }
        } } }
      }`,
      { kod: k.kod }
    );
    const cd = d.codeDiscountNodeByCode?.codeDiscount;
    const belopp = Number(cd?.customerGets?.value?.amount?.amount);
    const minst = Number(cd?.minimumRequirement?.greaterThanOrEqualToQuantity);
    const ok = cd?.status === 'ACTIVE' && belopp === Number(k.belopp) && minst === Number(k.minstAntal);
    const kundpris = plan.poster.find((x) => x.kod === k.kod)?.kundpris;
    ut.push([`${k.kod}: −${k.belopp} kr vid minst ${k.minstAntal} varor ⇒ ${kundpris} kr i kassan`, ok, cd ? `admin: ${cd.status}, −${belopp} kr, minst ${minst}` : 'koden finns inte']);
  }
  return ut;
}

export function skrivRapport(lage, rubrik) {
  const rader = [`\nTRIPPELKOLL — ${rubrik}\n`];
  for (const r of lage.rader) rader.push(`${IKON[r.utfall]} ${r.namn}: ${r.detalj}`);
  rader.push(`\n${lage.fel.length} fel · ${lage.manuella.length} väntar på en människa · ${lage.grona.length} gröna`);
  rader.push(
    lage.fel.length === 0 && lage.manuella.length === 0
      ? '\n✅ Allt grönt.'
      : '\n⚠️  DELVIS KLART — ordet "klart" får inte skrivas förrän raderna ovan är gröna.'
  );
  return rader.join('\n');
}

async function huvud() {
  laddaEnv();
  const [butikId, ...produktIds] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!butikId || produktIds.length === 0) {
    console.error('Användning: node factory/trippelkoll.mjs <butik-id> <produkt-id> [<produkt-id> …]');
    process.exit(1);
  }
  const butik = lasYaml(readFileSync(join(ROT, 'butiker', `${butikId}.yaml`), 'utf8'));
  const produkter = produktIds.map((id) => sammanfoga(butik, lasYaml(readFileSync(join(ROT, 'produkter', `${id}.yaml`), 'utf8'))));
  const state = lasState(butik.butik.id, '_butik');
  const ctx = {
    arbetstemaId: state.arbetstemaId ?? state.steg?.['tema-upload']?.arbetstemaId ?? state.steg?.['tema-upload']?.temaId ?? null,
    policyer: byggPolicyer(produkter[0]),
  };
  const lage = await samlaLage(ctx, butik, produkter);
  console.log(skrivRapport(lage, `${butik.butik.brand} (${produktIds.join(', ')})`));
  process.exit(lage.fel.length === 0 ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
