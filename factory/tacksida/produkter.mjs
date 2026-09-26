#!/usr/bin/env node
// Tilläggsprodukterna för tacksidan — in i butiken, idempotent.
//
//   node factory/tacksida/produkter.mjs [--torr] [--spec factory/tacksida/produkter.json]
//
// Läser specen, mintar butikens token (client credentials, samma väg som
// factory/token.mjs), och gör per produkt:
//   1. productSet på handle (skapa eller uppdatera): titel, beskrivning i husets
//      block (problem → lösning → funktioner → AI-rad → ångerrätt), pris,
//      jämförpris, SKU, bilder från källans CDN, mallen `product.<mall>`.
//   2. Publicerar i Online Store OCH Shop (upsellen länkar till kassan; en
//      opublicerad produkt ger "produkten finns inte" i cart-permalinken).
//   3. Registrerar översättningar (titel, beskrivning, SEO) för nb/en/fi/da när
//      specen bär dem — saknas ett språk rapporteras det, svenskan syns då.
//   4. Läser tillbaka: status, kanaler, mall, variant-id, och kundens publika
//      produktsida (200, rätt titel, inget paketblock, inget butiksnamn).
//
// Temamallen `templates/product.<mall>.json` skapas ur butikens
// templates/product.json UTAN paketblocken (ms_paket_a/b) och utan
// opf-sektionerna: ms-paket ritar annars ett tomt <ms-paket>-skal för en
// produkt utan paketnivåer (mätt 2026-09-26 i snippets/ms-paket.liquid), och
// opf-sektionerna läser metafält tilläggsprodukterna inte har.
//
// Skriver factory/tacksida/produkter.lage.json med id:n — det extensionen och
// rabattkoderna pekar på. Noll beroenden. Rör aldrig Sortimentet eller menyn:
// tilläggsprodukterna är inte butikens sortiment, de är erbjudandet efter köp.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { losNycklar, suffixForDoman, normaliseraDoman } from '../token.mjs';
import { graphql, skapaProdukt, hamtaArbetstema, hamtaTemafil, skrivTemafiler } from '../shopify.mjs';
import { hamtaOversattbara, registrera } from '../marknad.mjs';
import { eskapa } from '../sida.mjs';
import { lasYaml } from '../yaml.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const LAGE_FIL = join(HAR, 'produkter.lage.json');
const LOCALES = ['nb', 'en', 'fi', 'da'];

// ------------------------------------------------------------- ren logik

const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const lista = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim() !== '') : []);

/** Beskrivningen i husets block. Samma form som factory/bonus.mjs, plus AI-raden. */
export function byggBeskrivning(p, ord = {}) {
  const delar = [];
  if (text(p.problem_rubrik)) delar.push(`<h3>${eskapa(p.problem_rubrik)}</h3>`);
  if (text(p.problem_text)) delar.push(`<p>${eskapa(p.problem_text)}</p>`);
  if (text(p.losning_rubrik)) delar.push(`<h3>${eskapa(p.losning_rubrik)}</h3>`);
  if (text(p.losning_text)) delar.push(`<p>${eskapa(p.losning_text)}</p>`);
  const funk = lista(p.features);
  if (funk.length > 0) {
    delar.push(`<h3>${eskapa(ord.funktioner_rubrik ?? 'Funktioner')}</h3><ul>${funk.map((f) => `<li>${eskapa(f)}</li>`).join('')}</ul>`);
  }
  if (text(p.ai_rad)) delar.push(`<p><em>${eskapa(p.ai_rad)}</em></p>`);
  if (text(ord.angerratt_text)) delar.push(`<h3>${eskapa(ord.angerratt_rubrik ?? 'Ångerrätt')}</h3><p>${eskapa(ord.angerratt_text)}</p>`);
  return delar.join('\n');
}

/** productSet-input ur en spec-post. */
export function byggProduktInput(spec, p) {
  if (!text(p.titel_sv) || !text(p.handle) || !(Number(p.pris) > 0)) {
    throw new Error(`${p.id}: titel_sv, handle och pris krävs.`);
  }
  const bilder = Array.isArray(p.bilder) ? p.bilder.filter((b) => b && text(b.url)) : [];
  if (bilder.length === 0) throw new Error(`${p.id}: minst en bild krävs (visas i erbjudandekortet).`);
  return {
    title: p.titel_sv,
    handle: p.handle,
    status: 'ACTIVE',
    vendor: spec.vendor ?? 'CaraShell',
    tags: lista(spec.taggar),
    templateSuffix: text(spec.mall) ?? null,
    descriptionHtml: byggBeskrivning(p, { angerratt_text: spec.angerratt_text_sv }),
    seo: {
      title: `${p.titel_sv} – ${spec.vendor ?? 'CaraShell'}`.slice(0, 70),
      description: (text(p.seo_beskrivning) ?? text(p.problem_text) ?? '').slice(0, 160),
    },
    productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
    variants: [
      {
        optionValues: [{ optionName: 'Title', name: 'Default Title' }],
        price: Number(p.pris).toFixed(2),
        // null med flit: productSet är deklarativ, och ett utelämnat fält kan lämna ett gammalt jämförpris kvar.
        compareAtPrice: Number(p.jamforpris) > Number(p.pris) ? Number(p.jamforpris).toFixed(2) : null,
        ...(text(p.sku) ? { sku: p.sku } : {}),
        inventoryPolicy: 'CONTINUE',
        inventoryItem: { tracked: false },
      },
    ],
    files: bilder.map((b) => ({ originalSource: b.url, contentType: 'IMAGE', alt: text(b.alt) ?? p.titel_sv })),
  };
}

/** Mallen utan paketblock och opf-sektioner. Tar product.json-texten (med
 *  Shopifys kommentarshuvud), ger tillbaka JSON-text för product.<mall>.json. */
export function byggTillaggsmall(produktJsonText) {
  const j = JSON.parse(String(produktJsonText).replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
  const main = j.sections?.main;
  if (!main?.blocks) throw new Error('templates/product.json saknar main-sektionen.');
  const bortBlock = Object.keys(main.blocks).filter((k) => /^ms_paket/.test(k));
  for (const k of bortBlock) delete main.blocks[k];
  main.block_order = (main.block_order ?? []).filter((k) => !bortBlock.includes(k));
  const bortSekt = Object.keys(j.sections).filter((k) => /^opf_/.test(k));
  for (const k of bortSekt) delete j.sections[k];
  j.order = (j.order ?? []).filter((k) => !bortSekt.includes(k));
  return `${JSON.stringify(j, null, 2)}\n`;
}

/** Översättningsrader för en produkt: [{ key, value, digest }] för ett språk. */
export function byggOversattningsrader(p, locale, spec, oversattbart) {
  const o = p.oversattningar?.[locale] ?? {};
  const titel = p.titel?.[locale];
  const digest = (key) => oversattbart.find((r) => r.key === key)?.digest ?? null;
  const rader = [];
  if (text(titel) && digest('title')) rader.push({ key: 'title', value: titel, digest: digest('title') });
  const harKropp = text(o.problem_rubrik) || text(o.losning_text) || lista(o.features).length > 0;
  if (harKropp && digest('body_html')) {
    rader.push({
      key: 'body_html',
      value: byggBeskrivning({ ...p, ...o }, { funktioner_rubrik: o.funktioner_rubrik, angerratt_rubrik: o.angerratt_rubrik, angerratt_text: o.angerratt_text }),
      digest: digest('body_html'),
    });
  }
  if (text(titel) && digest('meta_title')) rader.push({ key: 'meta_title', value: `${titel} – ${spec.vendor ?? 'CaraShell'}`.slice(0, 70), digest: digest('meta_title') });
  if (text(o.seo_beskrivning) && digest('meta_description')) rader.push({ key: 'meta_description', value: o.seo_beskrivning.slice(0, 160), digest: digest('meta_description') });
  return rader;
}

// ------------------------------------------------------------- nät

// Nycklarna slås upp ur BUTIKSFILENS myshopify-domän (token.mjs
// suffixForDoman), aldrig ur butiks-id:t: `losNycklar('carashell')` hittar
// ingen SHOPIFY_SHOP_CARASHELL och faller tillbaka på den allmänna
// SHOPIFY_SHOP — en annan butik (mätt 2026-09-26: första körningen mintade
// mot fel domän och fick HTML tillbaka). Efter anslutningen kontrolleras att
// Shopify svarar med exakt den domänen, annars stopp före första skrivningen.
async function anslut(butikId) {
  const butikfil = join(HAR, '..', 'butiker', `${butikId}.yaml`);
  const butik = lasYaml(readFileSync(butikfil, 'utf8'));
  const doman = normaliseraDoman(butik?.butik?.myshopify);
  if (!doman) throw new Error(`${butikfil} saknar butik.myshopify.`);
  const suffix = suffixForDoman(doman);
  if (!suffix) throw new Error(`Ingen SHOPIFY_SHOP_<suffix> i miljön bär ${doman}.`);
  const { shop, clientId, clientSecret } = losNycklar(suffix);
  if (normaliseraDoman(shop) !== doman || !clientId || !clientSecret) {
    throw new Error(`Nycklarna för suffixet ${suffix} pekar inte på ${doman} eller är ofullständiga.`);
  }
  const svar = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
  });
  const j = await svar.json();
  if (!j.access_token) throw new Error(`Token nekad för ${shop}: ${JSON.stringify(j).slice(0, 200)}`);
  process.env.SHOPIFY_STORE_DOMAIN = shop;
  process.env.SHOPIFY_ADMIN_TOKEN = j.access_token;
  const d = await graphql(`{ shop { name myshopifyDomain primaryDomain { host } } }`);
  if (normaliseraDoman(d.shop.myshopifyDomain) !== doman) {
    throw new Error(`Shopify svarade med ${d.shop.myshopifyDomain}, väntade ${doman} — stopp.`);
  }
  return { shop, namn: d.shop.name, publikDoman: d.shop.primaryDomain.host };
}

async function publikationer() {
  const d = await graphql(`{ publications(first: 20) { nodes { id name } } }`);
  return d.publications.nodes;
}

async function publiceraI(produktId, pubs) {
  const valda = pubs.filter((p) => ['Online Store', 'Shop'].includes(p.name));
  if (valda.length === 0) return [];
  await graphql(
    `mutation tacksidaPublicera($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) { userErrors { field message } }
    }`,
    { id: produktId, input: valda.map((p) => ({ publicationId: p.id })) }
  );
  return valda.map((p) => p.name);
}

async function lasTillbaka(handle) {
  const d = await graphql(
    `query tacksidaLas($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) {
        id legacyResourceId handle title status templateSuffix onlineStoreUrl
        resourcePublicationsV2(first: 10) { nodes { publication { name } isPublished } }
        variants(first: 3) { nodes { id legacyResourceId price compareAtPrice sku availableForSale } }
        media(first: 20) { nodes { id } }
      }
    }`,
    { handle }
  );
  return d.productByIdentifier;
}

async function sakerstallMall(mall) {
  const tema = await hamtaArbetstema();
  const filnamn = `templates/product.${mall}.json`;
  const finns = await hamtaTemafil(tema.id, filnamn).catch(() => null);
  if (finns) return { temaId: tema.id, temaNamn: tema.name, filnamn, skapad: false };
  const bas = await hamtaTemafil(tema.id, 'templates/product.json');
  if (!bas) throw new Error('templates/product.json saknas i arbetstemat.');
  await skrivTemafiler(tema.id, { [filnamn]: byggTillaggsmall(bas) });
  return { temaId: tema.id, temaNamn: tema.name, filnamn, skapad: true };
}

async function kundvy(publikDoman, handle, titel) {
  const url = `https://${publikDoman}/products/${handle}?country=SE`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (tacksida-koll)', 'Accept-Language': 'sv' }, redirect: 'follow' });
    const html = await r.text();
    return {
      url,
      status: r.status,
      titelSyns: html.includes(eskapa(titel)) || html.includes(titel),
      paketblock: /<ms-paket\b/.test(html),
      butiksnamnIText: /b[äa]verbutiken/i.test(html),
      langd: html.length,
    };
  } catch (e) {
    return { url, status: 0, fel: e.message };
  }
}

// ------------------------------------------------------------- körning

async function main() {
  const args = process.argv.slice(2);
  const torr = args.includes('--torr');
  const specIx = args.indexOf('--spec');
  const specFil = specIx >= 0 ? args[specIx + 1] : join(HAR, 'produkter.json');
  const spec = JSON.parse(readFileSync(specFil, 'utf8'));

  console.log(`Tilläggsprodukter för tacksidan — ${spec.butik} ${torr ? '(TORRT: inget skrivs)' : '(SKARPT)'}`);
  const inputs = spec.produkter.map((p) => ({ p, input: byggProduktInput(spec, p) }));
  for (const { p, input } of inputs) {
    console.log(`  • ${p.id}: "${input.title}" ${input.variants[0].price} kr (jmf ${input.variants[0].compareAtPrice ?? '–'}), ${input.files.length} bilder, mall product.${input.templateSuffix ?? 'standard'}`);
    const sprak = LOCALES.filter((l) => text(p.titel?.[l]));
    const kroppar = LOCALES.filter((l) => text(p.oversattningar?.[l]?.problem_text));
    console.log(`    titlar: ${sprak.join(',') || 'inga'} · beskrivningar: ${kroppar.join(',') || 'inga (svenskan syns tills de finns)'}`);
  }
  if (torr) {
    console.log('\nTorrt: ingen anslutning, inget skrivet. Kör utan --torr för att skapa.');
    return;
  }

  const kopplad = await anslut(spec.butik);
  console.log(`\nConnected: ${kopplad.shop} (${kopplad.namn}, ${kopplad.publikDoman}) ✓`);

  const mall = await sakerstallMall(spec.mall);
  console.log(`Mall ${mall.filnamn} i "${mall.temaNamn}": ${mall.skapad ? 'skapad ur templates/product.json' : 'fanns redan'}`);

  const pubs = await publikationer();
  const lage = { butik: spec.butik, doman: kopplad.publikDoman, mall: spec.mall, uppdaterad: new Date().toISOString(), produkter: {} };
  for (const { p, input } of inputs) {
    const skapad = await skapaProdukt(input, { status: 'ACTIVE' });
    const kanaler = await publiceraI(skapad.id, pubs);
    const oversattbart = await hamtaOversattbara(skapad.id);
    const oversatt = {};
    for (const locale of LOCALES) {
      const rader = byggOversattningsrader(p, locale, spec, oversattbart);
      if (rader.length === 0) { oversatt[locale] = 'saknas'; continue; }
      const r = await registrera(skapad.id, locale, rader);
      oversatt[locale] = `${r.antal} fält (${rader.map((x) => x.key).join(',')})`;
    }
    const tillbaka = await lasTillbaka(p.handle);
    const kund = await kundvy(kopplad.publikDoman, p.handle, p.titel_sv);
    const variant = tillbaka.variants.nodes[0];
    lage.produkter[p.id] = {
      handle: p.handle,
      produkt_id: tillbaka.id,
      produkt_legacy_id: tillbaka.legacyResourceId,
      variant_id: variant.id,
      variant_legacy_id: variant.legacyResourceId,
      pris: variant.price,
      jamforpris: variant.compareAtPrice,
      sku: variant.sku,
      status: tillbaka.status,
      mall: tillbaka.templateSuffix,
      kanaler: tillbaka.resourcePublicationsV2.nodes.filter((n) => n.isPublished).map((n) => n.publication.name),
      bilder: tillbaka.media.nodes.length,
      oversatt,
      kundvy: kund,
    };
    const k = lage.produkter[p.id];
    console.log(`\n${p.id}: ${k.status}, kanaler ${k.kanaler.join('+') || 'INGA'} (nyss publicerad i ${kanaler.join('+') || '–'}), mall ${k.mall ?? 'standard'}, variant ${k.variant_legacy_id}, ${k.bilder} bilder`);
    console.log(`  översatt: ${Object.entries(oversatt).map(([l, v]) => `${l}=${v}`).join(' · ')}`);
    console.log(`  kundvy: ${kund.status} ${kund.url} · titel ${kund.titelSyns ? '✓' : '✗'} · paketblock ${kund.paketblock ? '✗ SYNS' : '✓ inget'} · butiksnamn ${kund.butiksnamnIText ? '✗ SYNS' : '✓ inget'}`);
  }
  writeFileSync(LAGE_FIL, `${JSON.stringify(lage, null, 2)}\n`);
  console.log(`\nSkrev ${LAGE_FIL}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`FEL: ${e.message}`);
    process.exit(1);
  });
}
