#!/usr/bin/env node
// enkat/publicera.mjs — lägger enkätsidan /pages/enkat i Matstrumpors butik.
//
//   node enkat/publicera.mjs            torrt: visar vad som skulle ändras
//   node enkat/publicera.mjs --skarpt   skriver temafilen, sidan och seo.hidden, läser tillbaka
//   node enkat/publicera.mjs --kontroll läser bara sidan som kund
//
// Sidan är dold: seo.hidden = 1 (ingen sitemap, noindex) och ingen menylänk.
// Den nås bara via länken i orderbekräftelsen, som Cowork klistrar in sist
// (enkat/cowork/1-lansering.txt). Bara Matstrumpor (Axels beslut 2026-10-01).

import { lasButik, skapaKlient } from '../sparning/butik.mjs';
import { hamtaLiveTema, hittaSida } from '../listicle/butik.mjs';
import { lasKonfig, byggMall } from './enkat.mjs';

const arg = process.argv.slice(2);
const skarpt = arg.includes('--skarpt');
const baraKontroll = arg.includes('--kontroll');
const k = lasKonfig();
const filnamn = `templates/page.${k.mallsuffix}.liquid`;

async function lasFil(klient, temaId) {
  const d = await klient.graphql(
    `query enkatFil($id: ID!, $namn: [String!]) { theme(id: $id) { files(filenames: $namn, first: 2) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
    { id: temaId, namn: [filnamn] }
  );
  return d.theme?.files?.nodes?.find((n) => n.filename === filnamn)?.body?.content ?? null;
}

/** Läs sidan som en svensk kund. Kräver formuläret, markören och noreply-fältet. */
export async function kontrollera({ fetchFn = fetch } = {}) {
  const url = `${k.sajt}/pages/${k.handle}?country=SE&v=${Date.now()}`;
  const r = await fetchFn(url, { headers: { 'cache-control': 'no-cache' }, redirect: 'follow' });
  const html = await r.text();
  const krav = {
    status200: r.status === 200,
    formular: html.includes('EnkatForm'),
    markor: html.includes(`value="${k.version}"`),
    noreply: html.includes(`value="${k.noreply}"`),
    fraga1: html.includes(k.fragor[0].text.slice(0, 30)),
    gdpr: html.includes('Skriv inga namn och inget om din hälsa'),
    noindex: /<meta[^>]+name="robots"[^>]+noindex/i.test(html),
    captcha: /hcaptcha|h-captcha|recaptcha/i.test(html),
  };
  return { url: r.url, krav };
}

async function main() {
  if (baraKontroll) {
    const { url, krav } = await kontrollera();
    console.log(`Som kund: ${url}`);
    for (const [n, v] of Object.entries(krav)) console.log(`  ${v ? '✅' : '❌'} ${n}`);
    return;
  }
  const klient = await skapaKlient(lasButik(k.butik));
  const tema = await hamtaLiveTema(klient);
  const mall = byggMall(k);
  const nu = await lasFil(klient, tema.id);
  console.log(`Butik: ${klient.shop} · tema "${tema.name}" (${tema.id})`);
  console.log(`Temafil ${filnamn}: ${nu === null ? 'finns inte' : nu === mall ? 'oförändrad' : 'ändras'}`);

  const sida = await hittaSida(klient, k.handle);
  console.log(`Sida /pages/${k.handle}: ${sida ? `finns (${sida.id}, mall ${sida.templateSuffix ?? '-'}, publicerad ${sida.isPublished})` : 'finns inte — skapas'}`);

  if (!skarpt) { console.log('\nTorrt. Kör med --skarpt för att skriva.'); return; }

  if (nu !== mall) {
    await klient.graphql(
      `mutation enkatTema($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { field message } } }`,
      { id: tema.id, files: [{ filename: filnamn, body: { type: 'TEXT', value: mall } }] }
    );
    const tillbaka = await lasFil(klient, tema.id);
    if (tillbaka !== mall) throw new Error(`${filnamn} lästes tillbaka olik det som skrevs.`);
    console.log(`✅ ${filnamn} skriven och tillbakaläst`);
  }

  const page = { title: k.titel, body: '', isPublished: true, templateSuffix: k.mallsuffix };
  let id = sida?.id;
  if (!id) {
    const d = await klient.graphql(`mutation enkatSida($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle templateSuffix } userErrors { field message } } }`, { page: { ...page, handle: k.handle } });
    id = d.pageCreate.page.id;
    if (d.pageCreate.page.handle !== k.handle) throw new Error(`Sidan fick adressen ${d.pageCreate.page.handle}, inte ${k.handle} (upptagen?).`);
  } else if (sida.templateSuffix !== k.mallsuffix || !sida.isPublished || sida.title !== k.titel) {
    await klient.graphql(`mutation enkatSidaUpp($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { page { id } userErrors { field message } } }`, { id, page });
  }
  console.log(`✅ Sida ${id}`);

  await klient.graphql(
    `mutation enkatDold($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { metafields { namespace key value } userErrors { field message } } }`,
    { m: [{ ownerId: id, namespace: 'seo', key: 'hidden', type: 'number_integer', value: '1' }] }
  );
  console.log('✅ seo.hidden = 1 (ingen sitemap, noindex)');

  const { url, krav } = await kontrollera();
  console.log(`\nSom kund: ${url}`);
  for (const [n, v] of Object.entries(krav)) console.log(`  ${v ? '✅' : (n === 'captcha' ? 'ℹ️' : '❌')} ${n}`);
  const fel = Object.entries(krav).filter(([n, v]) => !v && n !== 'captcha' && n !== 'noindex');
  if (fel.length) { console.error(`\n❌ Kundvyn saknar: ${fel.map(([n]) => n).join(', ')}`); process.exit(1); }
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
