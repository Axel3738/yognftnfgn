// tackning.mjs — vilka svenska texter i butiken saknar översättning (eller har en föråldrad) på
// worldwide-språken? Läs-bart, direkt ur Shopifys översättnings-API.
//
//   node worldwide/granskning/tackning.mjs [--sprak en,de] [--typer LINK,PAGE] [--ut fil.json]
//
// En text räknas när källvärdet (svenska) ser svenskt ut och språket saknar en giltig översättning.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasButik, skapaKlient } from '../../sparning/butik.mjs';
import { svenskRad } from './kund.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const W = JSON.parse(readFileSync(join(ROT, '..', 'konfig.json'), 'utf8'));
const U = JSON.parse(readFileSync(join(ROT, '..', 'urval.json'), 'utf8'));
const a = process.argv.slice(2);
const arg = (n, d = null) => (a.includes(n) ? a[a.indexOf(n) + 1] : d);
const TYPER = arg('--typer') ? arg('--typer').split(',') : ['LINK', 'MENU', 'PAGE', 'COLLECTION', 'SHOP', 'SHOP_POLICY', 'ONLINE_STORE_THEME', 'ONLINE_STORE_THEME_JSON_TEMPLATE', 'ONLINE_STORE_THEME_SECTION_GROUP', 'ONLINE_STORE_THEME_SETTINGS_DATA_SECTIONS', 'ONLINE_STORE_THEME_SETTINGS_CATEGORY', 'ONLINE_STORE_THEME_LOCALE_CONTENT', 'ONLINE_STORE_THEME_APP_EMBED', 'DELIVERY_METHOD_DEFINITION', 'PAYMENT_GATEWAY', 'FILTER', 'PRODUCT', 'PRODUCT_OPTION', 'PRODUCT_OPTION_VALUE', 'METAFIELD', 'MEDIA_IMAGE'];
const SPRAK = arg('--sprak') ? arg('--sprak').split(',') : W.marknad.locales;

const k = await skapaKlient({ ...lasButik('baverbutiken'), env_suffix: 'SE' });
const text = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// Produkterna kunden kan nå: alla aktiva i onlinebutiken (urvalets 16 märks).
const urval = new Set(U.produkter.filter((p) => !p.under).map((p) => p.handle));
const produkter = new Map();
let e = null;
do {
  const d = await k.graphql(`query($e:String){ products(first: 250, after: $e, query: "status:active") { pageInfo { hasNextPage endCursor } nodes { id handle onlineStoreUrl } } }`, { e });
  for (const p of d.products.nodes) if (p.onlineStoreUrl) produkter.set(p.id, p.handle);
  e = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
} while (e);

const ut = [];
for (const typ of TYPER) {
  for (const locale of SPRAK) {
    let efter = null, n = 0;
    try {
      do {
        const d = await k.graphql(`query($t: TranslatableResourceType!, $e: String, $l: String!) { translatableResources(resourceType: $t, first: 100, after: $e) { pageInfo { hasNextPage endCursor } nodes { resourceId translatableContent { key value type } translations(locale: $l) { key value outdated } } } }`, { t: typ, e: efter, l: locale });
        for (const r of d.translatableResources.nodes) {
          if (typ === 'PRODUCT' && !produkter.has(r.resourceId)) continue;
          for (const c of r.translatableContent) {
            if (!c.value || typeof c.value !== 'string') continue;
            const t = text(c.value);
            if (!t || t.length < 2) continue;
            // Bara texter som ser svenska ut (en kort rad räknas via svenskRad; långa med å/ä/ö).
            const sv = svenskRad(t.slice(0, 400), 'en') || /[åäöÅÄÖ]/.test(t);
            if (!sv) continue;
            const tr = r.translations.find((x) => x.key === c.key);
            const lage = !tr?.value ? 'saknas' : tr.outdated ? 'föråldrad' : null;
            if (!lage) continue;
            n++;
            ut.push({ typ, locale, resurs: r.resourceId, handle: produkter.get(r.resourceId) ?? null, urval: urval.has(produkter.get(r.resourceId)), key: c.key, lage, sv: t.slice(0, 160), oversattning: tr?.value ? text(tr.value).slice(0, 160) : null });
          }
        }
        efter = d.translatableResources.pageInfo.hasNextPage ? d.translatableResources.pageInfo.endCursor : null;
      } while (efter);
    } catch (err) { console.log(`⚠️ ${typ} ${locale}: ${err.message.slice(0, 140)}`); continue; }
    if (n) console.log(`${typ.padEnd(44)} ${locale.padEnd(5)} ${n} svenska texter utan giltig översättning`);
  }
}
const urvalsfel = ut.filter((x) => x.typ !== 'PRODUCT' || x.urval);
console.log(`\nTotalt ${ut.length} (utanför produkter eller i urvalet: ${urvalsfel.length})`);
if (arg('--ut')) writeFileSync(arg('--ut'), JSON.stringify(ut, null, 1));
