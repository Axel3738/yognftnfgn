// trippelkoll.mjs — läser TILLBAKA hela butiken ur Shopify och jämför med
// konfigen. Ingen rad kommer ur minnet eller ur en state-fil.
//
//   node factory/trippelkoll.mjs <butik-id> <produkt-handle>
//
// Regeln: säg ALDRIG "klart" utan tre kontroller mot kundens riktiga vy.
// Det här skriptet gör den första — API-kontrollen. De två andra
// (varukorgstestet och den visuella mobilkontrollen) KRÄVER en webbläsare
// och kan inte göras från en molnsession (se PROCESS.md). Skriptet skriver
// därför aldrig "klart" utan listar vad som återstår för en människa.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const IKON = { ok: '✅', fel: '❌', manuell: '🖐', varning: '⚠️ ' };

export async function samlaLage(handle) {
  const d = await graphql(
    `query opsFactoryTrippel($handle: String!) {
      shop { name myshopifyDomain currencyCode primaryDomain { host } }
      onlineStore { passwordProtection { enabled } }
      productByIdentifier(identifier: { handle: $handle }) {
        id title handle status
        variants(first: 100) { nodes { id title price compareAtPrice inventoryPolicy inventoryItem { tracked } } }
        media(first: 50) { nodes { id } }
        metafields(first: 50, namespace: "opf") { nodes { key } }
      }
      themes(first: 20) { nodes { id name role } }
      shopLocales { locale primary published }
      markets(first: 20) { nodes { id name handle status } }
      webPresences(first: 10) { nodes { id defaultLocale { locale } alternateLocales { locale } } }
      metaobjects(type: "ms_paketniva", first: 50) { nodes { id handle fields { key value } } }
      pages(first: 50) { nodes { handle title } }
      menus(first: 20) { nodes { handle items { title url } } }
      codeDiscountNodes(first: 50) {
        nodes { id codeDiscount { ... on DiscountCodeBasic { title status codes(first: 5) { nodes { code } } } } }
      }
    }`,
    { handle }
  );
  return d;
}

if (process.argv[1] && process.argv[1].endsWith('trippelkoll.mjs')) {
  laddaEnv();
  const [butikId, handle] = process.argv.slice(2);
  if (!butikId || !handle) throw new Error('Användning: node factory/trippelkoll.mjs <butik-id> <produkt-handle>');

  const butik = lasYaml(readFileSync(join(ROT, 'butiker', `${butikId}.yaml`), 'utf8'));
  const produkt = lasYaml(readFileSync(join(ROT, 'produkter', `${handle}.yaml`), 'utf8'));
  const d = await samlaLage(handle);

  const rader = [];
  const lagg = (utfall, namn, detalj) => rader.push({ utfall, namn, detalj });

  // ---- butiken
  lagg('ok', 'butik', `${d.shop.name} (${d.shop.myshopifyDomain}, ${d.shop.currencyCode})`);
  lagg(
    d.shop.primaryDomain.host.endsWith('myshopify.com') ? 'manuell' : 'ok',
    'domän',
    d.shop.primaryDomain.host.endsWith('myshopify.com')
      ? `fortfarande ${d.shop.primaryDomain.host} — riktig domän inte kopplad`
      : d.shop.primaryDomain.host
  );

  // ---- produkten
  const p = d.productByIdentifier;
  if (!p) {
    lagg('fel', 'produkt', `handle ${handle} finns inte i butiken`);
  } else {
    lagg(p.status === 'ACTIVE' ? 'ok' : 'fel', 'produkt', `${p.title} — ${p.status}`);
    const v = p.variants.nodes;
    const felPris = v.filter((x) => Number(x.price) !== produkt.ekonomi.pris);
    lagg(felPris.length === 0 ? 'ok' : 'fel', 'priser',
      felPris.length === 0
        ? `${produkt.ekonomi.pris} ${d.shop.currencyCode} på alla ${v.length} varianter, jämförpris ${produkt.ekonomi.jamforpris}`
        : `${felPris.length} varianter har fel pris`);
    const felLager = v.filter((x) => x.inventoryPolicy !== 'CONTINUE' || x.inventoryItem?.tracked !== false);
    lagg(felLager.length === 0 ? 'ok' : 'fel', 'lagerpolicy',
      felLager.length === 0
        ? `CONTINUE + tracked:false på alla ${v.length} varianter`
        : `${felLager.length} varianter stoppar försäljningen när saldot tar slut`);
    lagg(p.media.nodes.length > 0 ? 'ok' : 'fel', 'bilder', `${p.media.nodes.length} media`);
    lagg(p.metafields.nodes.length >= 8 ? 'ok' : 'fel', 'metafält', `${p.metafields.nodes.length} opf-fält`);
  }

  // ---- temat
  const opsTema = d.themes.nodes.find((t) => /\bcro\b/i.test(t.name));
  const live = d.themes.nodes.find((t) => t.role === 'MAIN');
  lagg(opsTema ? 'ok' : 'fel', 'OPS-temat', opsTema ? `${opsTema.name} (${opsTema.role})` : 'saknas');
  lagg(
    live && /cro/i.test(live.name) ? 'ok' : 'manuell',
    'publicerat tema',
    live && /cro/i.test(live.name)
      ? live.name
      : `kunden ser "${live?.name ?? '?'}" — OPS-temat är inte publicerat (API-spärrat, klicket är en människas)`
  );

  // ---- marknader och språk
  const nb = d.shopLocales.find((l) => l.locale === 'nb');
  lagg(nb?.published ? 'ok' : 'fel', 'locale nb', nb ? `publicerad: ${nb.published}` : 'saknas');
  const primar = d.shopLocales.find((l) => l.primary);
  lagg(primar?.locale === 'sv' ? 'ok' : 'manuell', 'primärspråk',
    primar?.locale === 'sv' ? 'svenska' : `${primar?.locale} — svenskan sätts som default i admin, API:t kan inte`);
  const norge = d.markets.nodes.find((m) => /norge|^no$/i.test(m.name) || m.handle === 'no');
  lagg(norge?.status === 'ACTIVE' ? 'ok' : 'fel', 'marknad Norge', norge ? norge.status : 'saknas');
  const wp = d.webPresences.nodes[0];
  const harNb = (wp?.alternateLocales ?? []).some((l) => l.locale === 'nb');
  lagg(harNb ? 'ok' : 'fel', 'nb på domänen', harNb ? 'nb ligger som alternateLocale' : 'nb saknas — /nb finns inte för kunden');

  // ---- paketen och koderna
  const nivaer = d.metaobjects.nodes;
  const forvald = nivaer.filter((n) => (n.fields.find((f) => f.key === 'forvald')?.value ?? '') === 'true');
  lagg(nivaer.length > 0 ? 'ok' : 'fel', 'paketnivåer', `${nivaer.length} nivåer`);
  lagg(forvald.length === 1 ? 'ok' : 'fel', 'förvald nivå',
    forvald.length === 1 ? `${forvald[0].handle}` : `${forvald.length} nivåer är förvalda — ska vara exakt 1 (mitten)`);
  const koder = d.codeDiscountNodes.nodes.map((n) => n.codeDiscount?.codes?.nodes?.[0]?.code).filter(Boolean);
  const kravda = nivaer
    .map((n) => n.fields.find((f) => f.key === 'rabattkod')?.value)
    .filter((k) => k && k.trim() !== '');
  const saknade = kravda.filter((k) => !koder.includes(k));
  lagg(saknade.length === 0 ? 'ok' : 'fel', 'rabattkoder',
    saknade.length === 0 ? `${kravda.length} koder finns: ${kravda.join(', ')}` : `saknas i kassan: ${saknade.join(', ')}`);

  // ---- sidorna
  const behovs = ['returpolicy', 'fraktpolicy', 'kopvillkor', 'contact'];
  const finns = d.pages.nodes.map((s) => s.handle);
  const utan = behovs.filter((h) => !finns.includes(h));
  lagg(utan.length === 0 ? 'ok' : 'fel', 'policysidor', utan.length === 0 ? `${behovs.length} sidor` : `saknas: ${utan.join(', ')}`);

  // ---- det som kräver en människa
  lagg('manuell', 'varukorgen', 'INTE testad — kräver en webbläsare, se PROCESS.md. Tom korg → lägg i varan → lådan ska glida in, inte skicka till /cart');
  lagg('manuell', 'mobilvyn', 'INTE granskad — kräver en webbläsare');
  if (d.onlineStore?.passwordProtection?.enabled) {
    lagg('manuell', 'lösenordsskydd', 'butiken är lösenordsskyddad — kundvyn går inte att nå utifrån');
  }

  console.log(`\nTRIPPELKOLL — ${butik.butik.brand} (${handle})\n`);
  for (const r of rader) console.log(`${IKON[r.utfall]} ${r.namn}: ${r.detalj}`);

  const fel = rader.filter((r) => r.utfall === 'fel');
  const manuella = rader.filter((r) => r.utfall === 'manuell');
  console.log(`\n${fel.length} fel · ${manuella.length} väntar på en människa · ${rader.length - fel.length - manuella.length} gröna`);
  console.log(
    fel.length === 0 && manuella.length === 0
      ? '\n✅ Allt grönt.'
      : '\n⚠️  DELVIS KLART — ordet "klart" får inte skrivas förrän raderna ovan är gröna.'
  );
}
