#!/usr/bin/env node
// Take-raten på tacksides-erbjudandet — läs-bart, ur Shopify.
//
//   node factory/tacksida/rapport.mjs [--butik carashell] [--dagar 14] [--json]
//
// Räknar, för perioden:
//   • kandidatordrar = ordrar som INTE själva är tillägg (den som fick se kortet)
//   • tilläggsordrar = ordrar med cart-attributet kalla=tacksida ELLER någon av
//     rabattkoderna i rabatter.lage.json (attributet är facit; koden är reserv
//     om någon skrev in den för hand)
//   • take-rate = tilläggsordrar / kandidatordrar, per produkt och per plats
//     (attributet plats: tack / orderstatus), omsättning på tilläggsraderna
//     per valuta (summeras aldrig ihop över valutor — CLAUDE.md-regeln)
//
// Ingen dom under 200 kandidatordrar (researchen: ~200 sessioner innan något
// läses alls, ~460 för ±2 procentenheter). Skriptet skriver det rakt ut.
// Skriver inget i butiken. Noll beroenden.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { losNycklar, suffixForDoman, normaliseraDoman } from '../token.mjs';
import { graphql } from '../shopify.mjs';
import { lasYaml } from '../yaml.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const MINSTA_UNDERLAG = 200;

// ------------------------------------------------------------- ren logik

export function klassaOrder(o, koder) {
  const attr = Object.fromEntries((o.customAttributes ?? []).map((a) => [a.key, a.value]));
  const viaAttribut = attr.kalla === 'tacksida';
  const viaKod = (o.discountCodes ?? []).some((k) => koder.includes(String(k).toUpperCase()));
  return {
    tillagg: viaAttribut || viaKod,
    plats: attr.plats ?? (viaKod ? 'kod' : null),
    efterOrder: attr.efter_order ?? null,
    kod: (o.discountCodes ?? []).find((k) => koder.includes(String(k).toUpperCase())) ?? null,
  };
}

export function sammanstall(ordrar, koder, handles) {
  const ut = { kandidater: 0, tillagg: 0, perProdukt: {}, perPlats: {}, omsattning: {}, underlagRacker: false };
  for (const o of ordrar) {
    const k = klassaOrder(o, koder);
    if (!k.tillagg) { ut.kandidater += 1; continue; }
    ut.tillagg += 1;
    ut.perPlats[k.plats ?? 'okänd'] = (ut.perPlats[k.plats ?? 'okänd'] ?? 0) + 1;
    for (const li of o.lineItems?.nodes ?? []) {
      const h = li.product?.handle;
      if (!handles.includes(h)) continue;
      ut.perProdukt[h] = (ut.perProdukt[h] ?? 0) + li.quantity;
      const val = li.discountedTotalSet?.shopMoney?.currencyCode ?? o.presentmentCurrencyCode ?? '?';
      const belopp = Number(li.discountedTotalSet?.presentmentMoney?.amount ?? 0);
      const cur = li.discountedTotalSet?.presentmentMoney?.currencyCode ?? val;
      ut.omsattning[cur] = Math.round(((ut.omsattning[cur] ?? 0) + belopp) * 100) / 100;
    }
  }
  ut.takeRate = ut.kandidater > 0 ? ut.tillagg / ut.kandidater : null;
  ut.underlagRacker = ut.kandidater >= MINSTA_UNDERLAG;
  return ut;
}

// ------------------------------------------------------------- nät

async function anslut(butikId) {
  const butik = lasYaml(readFileSync(join(HAR, '..', 'butiker', `${butikId}.yaml`), 'utf8'));
  const doman = normaliseraDoman(butik?.butik?.myshopify);
  const suffix = suffixForDoman(doman);
  if (!suffix) throw new Error(`Ingen SHOPIFY_SHOP_<suffix> bär ${doman}.`);
  const { shop, clientId, clientSecret } = losNycklar(suffix);
  if (normaliseraDoman(shop) !== doman) throw new Error(`Nycklarna för ${suffix} pekar inte på ${doman}.`);
  const j = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
  }).then((r) => r.json());
  if (!j.access_token) throw new Error('Token nekad.');
  process.env.SHOPIFY_STORE_DOMAIN = shop;
  process.env.SHOPIFY_ADMIN_TOKEN = j.access_token;
  return shop;
}

async function hamtaOrdrar(fran) {
  const alla = [];
  let cursor = null;
  for (let i = 0; i < 40; i++) {
    const d = await graphql(
      `query tacksidaOrdrar($q: String!, $cursor: String) {
        orders(first: 100, after: $cursor, query: $q, sortKey: CREATED_AT, reverse: true) {
          pageInfo { hasNextPage endCursor }
          nodes { name createdAt presentmentCurrencyCode discountCodes
            customAttributes { key value }
            lineItems(first: 10) { nodes { quantity product { handle } discountedTotalSet { presentmentMoney { amount currencyCode } shopMoney { amount currencyCode } } } } }
        } }`,
      { q: `created_at:>=${fran} status:any`, cursor }
    );
    alla.push(...d.orders.nodes);
    if (!d.orders.pageInfo.hasNextPage) break;
    cursor = d.orders.pageInfo.endCursor;
  }
  return alla;
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (n, std) => (args.indexOf(n) >= 0 ? args[args.indexOf(n) + 1] : std);
  const butik = arg('--butik', 'carashell');
  const dagar = Number(arg('--dagar', '14'));
  const json = args.includes('--json');
  const lageFil = join(HAR, 'rabatter.lage.json');
  const produktFil = join(HAR, 'produkter.lage.json');
  if (!existsSync(lageFil) || !existsSync(produktFil)) throw new Error('kör produkter.mjs och rabatter.mjs först.');
  const koder = Object.values(JSON.parse(readFileSync(lageFil, 'utf8')).koder).map((k) => k.kod.toUpperCase());
  const handles = Object.values(JSON.parse(readFileSync(produktFil, 'utf8')).produkter).map((p) => p.handle);

  const shop = await anslut(butik);
  const fran = new Date(Date.now() - dagar * 86400e3).toISOString();
  const ordrar = await hamtaOrdrar(fran);
  const s = sammanstall(ordrar, koder, handles);
  const ut = { butik, shop, dagar, fran, ordrar: ordrar.length, ...s };
  if (json) return console.log(JSON.stringify(ut, null, 2));

  console.log(`Tacksidan — ${butik}, senaste ${dagar} dygnen (${ordrar.length} ordrar lästa)`);
  console.log(`  kandidatordrar: ${s.kandidater}`);
  console.log(`  tilläggsordrar: ${s.tillagg}${s.tillagg ? ` (${Object.entries(s.perPlats).map(([p, n]) => `${p}: ${n}`).join(', ')})` : ''}`);
  console.log(`  take-rate: ${s.takeRate == null ? '–' : `${(s.takeRate * 100).toFixed(1)} %`}${s.underlagRacker ? '' : `  ⚠️ under ${MINSTA_UNDERLAG} kandidatordrar — ingen dom än`}`);
  for (const [h, n] of Object.entries(s.perProdukt)) console.log(`  ${h}: ${n} st`);
  for (const [cur, b] of Object.entries(s.omsattning)) console.log(`  omsättning på tilläggsraderna: ${b} ${cur}`);
  if (s.tillagg === 0) console.log('  (inga tilläggsordrar än — kortet syns för kunden först när blocket lagts in i kassaredigeraren)');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`FEL: ${e.message}`);
    process.exit(1);
  });
}
