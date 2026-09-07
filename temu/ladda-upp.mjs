#!/usr/bin/env node
// Laddar upp produkter till en eller flera butiker i EN körning.
//
//   node temu/ladda-upp.mjs produkter.json --alla --torrkorning
//   node temu/ladda-upp.mjs produkter.json --butik=dk
//
// Flaggor:
//   --alla              alla fem butiker (se, no, dk, fi, uk)
//   --butik=xx[,yy]     bara dessa
//   --torrkorning       skriver INGENTING, visar bara vad som skulle hända
//
// Ordningen är den i UTLANDS-LANSERING.md och den är inte förhandlingsbar:
//   verifiera butik -> inventera -> skapa bara det som saknas -> varianter
//   -> mall -> kanaler -> kategori -> verifiera resultatet.

import { readFileSync } from 'node:fs';
import { BUTIKER, pris } from './butiker.mjs';
import { Butik } from './api.mjs';

const MALL = 'claudeprodukter';

// ---------- argument ----------
const argv = process.argv.slice(2);
const fil = argv.find((a) => !a.startsWith('--'));
const torr = argv.includes('--torrkorning');
const alla = argv.includes('--alla');
const valda = argv.find((a) => a.startsWith('--butik='))?.split('=')[1]?.split(',') || [];

if (!fil) {
  console.error(`Användning: node temu/ladda-upp.mjs <produkter.json> [--alla | --butik=dk,fi] [--torrkorning]`);
  process.exit(1);
}
const lander = alla ? Object.keys(BUTIKER) : valda;
if (!lander.length) {
  console.error('Ange --alla eller --butik=xx');
  process.exit(1);
}
for (const l of lander) if (!BUTIKER[l]) { console.error(`Okänd butik: ${l}`); process.exit(1); }

const produkter = JSON.parse(readFileSync(fil, 'utf8'));
if (!Array.isArray(produkter)) { console.error('JSON-filen ska vara en lista med produkter.'); process.exit(1); }

// ---------- hjälpare ----------
const rad = (s = '') => console.log(s);
const rubrik = (s) => { rad(); rad('='.repeat(64)); rad(s); rad('='.repeat(64)); };

/** Priset för ett land: explicit angivet vinner ALLTID över uträkningen. */
function prisFor(p, land) {
  const explicit = p.priser?.[land];
  if (explicit != null) {
    const raknat = pris(land, p.pris_sek);
    if (p.pris_sek != null && Math.abs(raknat - explicit) > 0.011) {
      return { varde: explicit, notis: `explicit ${explicit} (faktorn hade gett ${raknat})` };
    }
    return { varde: explicit, notis: null };
  }
  if (p.pris_sek == null) throw new Error(`${p.namn}: saknar både priser.${land} och pris_sek`);
  return { varde: pris(land, p.pris_sek), notis: null };
}

function variantIn(p, land, v) {
  const { varde } = v.pris_sek != null || v.priser
    ? prisFor({ ...p, pris_sek: v.pris_sek ?? p.pris_sek, priser: v.priser ?? p.priser }, land)
    : prisFor(p, land);
  // Lokalisera optionerna: namnen kommer ur p.optionsnamn[land], vardena ur v.varden[land].
  const namn = p.optionsnamn?.[land] || p.optioner || ['Title'];
  const varden = v.varden?.[land] || v.varden?.se || (v.optionValues ? v.optionValues.map((o) => o.name) : ['Default Title']);
  return {
    price: String(varde),
    inventoryPolicy: 'CONTINUE',
    taxable: false,
    inventoryItem: { sku: v.sku, tracked: true },
    optionValues: varden.map((vv, i) => ({ optionName: namn[i], name: vv })),
  };
}

// ---------- huvudflöde ----------
const sammanstallning = [];

for (const land of lander) {
  const konf = BUTIKER[land];
  rubrik(`${konf.land} — ${konf.namn} (${konf.valuta})${torr ? '   [TORRKÖRNING]' : ''}`);

  let butik;
  try {
    butik = new Butik(land);
  } catch (e) {
    rad(`  ⨯ ${e.message}`);
    sammanstallning.push({ land, fel: 'saknar referenser' });
    continue;
  }

  let shop;
  try {
    shop = await butik.verifiera();
  } catch (e) {
    rad(`  ⨯ ${e.message}`);
    sammanstallning.push({ land, fel: 'butiksverifiering' });
    continue;
  }
  rad(`  ✓ ansluten: ${shop.name} (${shop.currencyCode})`);

  const { produkter: befintliga, skuIndex } = await butik.inventera();
  rad(`  ✓ inventerat: ${befintliga.length} produkter, ${skuIndex.size} SKU:er`);

  const kanaler = await butik.kanaler();
  rad(`  ✓ kanaler: ${kanaler.map((k) => k.name).join(', ')}`);

  const skapade = [], hoppade = [], fel = [];

  for (const p of produkter) {
    const text = p.text?.[land];
    if (!text) { fel.push(`${p.namn}: saknar text.${land}`); continue; }

    // REGEL 0 — inventera först. Finns någon av SKU:erna redan? Rör inte.
    const varianter = p.varianter?.length ? p.varianter : [{ sku: p.sku, varden: { se: ['Default Title'] } }];
    const traff = varianter.map((v) => skuIndex.get(v.sku)).find(Boolean);
    if (traff) {
      hoppade.push(`${p.namn} → finns redan som "${traff.titel}" (${traff.status})`);
      continue;
    }

    const optioner = (p.optionsnamn?.[land] || p.optioner || ['Title']);
    const priser = varianter.map((v) => variantIn(p, land, v));
    const notis = prisFor(p, land).notis;

    if (torr) {
      skapade.push(`${p.namn} → ${text.titel} · ${priser[0].price} ${konf.valuta} · ${priser.length} variant(er)${notis ? ` · ${notis}` : ''}`);
      continue;
    }

    try {
      // 1) Produkten. ProductCreateInput har INGET variants-falt — de skapas i steg 2.
      const skapad = await butik.mutera(
        `mutation($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
           productCreate(product: $product, media: $media) {
             product { id title handle }
             userErrors { field message }
           }
         }`,
        {
          product: {
            title: text.titel,
            descriptionHtml: text.beskrivning,
            vendor: konf.vendor,
            productType: p.produkttyp,
            tags: text.taggar || p.taggar || [],
            status: 'ACTIVE',
            templateSuffix: MALL,
            ...(p.kategori_gid ? { category: p.kategori_gid } : {}),
            productOptions: optioner.map((namn, i) => ({
              name: namn,
              values: [...new Set(priser.map((pv) => pv.optionValues[i]?.name))].map((n) => ({ name: n })),
            })),
          },
          media: (p.bilder || []).map((b) => ({
            originalSource: b.url,
            alt: b.alt?.[land] || b.alt?.sv || '',
            mediaContentType: 'IMAGE',
          })),
        },
        'productCreate'
      );

      const pid = skapad.product.id;

      // 2) Varianterna. REMOVE_STANDALONE_VARIANT rojer undan standardvarianten
      //    som productCreate alltid skapar. Pris, SKU, CONTINUE och moms-av satts har.
      await butik.mutera(
        `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
           productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: REMOVE_STANDALONE_VARIANT) {
             productVariants { id sku }
             userErrors { field message }
           }
         }`,
        { productId: pid, variants: priser },
        'productVariantsBulkCreate'
      );

      // 3) Alla forsaljningskanaler.
      await butik.mutera(
        `mutation($id: ID!, $input: [PublicationInput!]!) {
           publishablePublish(id: $id, input: $input) { userErrors { message } }
         }`,
        { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) },
        'publishablePublish'
      );

      skapade.push(`${p.namn} \u2192 ${text.titel} \u00b7 ${priser[0].price} ${konf.valuta} \u00b7 ${priser.length} variant(er)`);
      for (const v of varianter) skuIndex.set(v.sku, { titel: text.titel, status: 'ACTIVE' });
    } catch (e) {
      fel.push(`${p.namn}: ${e.message}`);
    }
  }

  rad();
  rad(`  ${torr ? 'SKULLE SKAPA' : 'SKAPADE'}: ${skapade.length}`);
  for (const s of skapade) rad(`    + ${s}`);
  rad(`  HOPPADE ÖVER (fanns redan): ${hoppade.length}`);
  for (const s of hoppade) rad(`    = ${s}`);
  if (fel.length) {
    rad(`  FEL: ${fel.length}`);
    for (const s of fel) rad(`    ⨯ ${s}`);
  }

  sammanstallning.push({ land, skapade: skapade.length, hoppade: hoppade.length, fel: fel.length });
}

rubrik('SAMMANSTÄLLNING');
for (const s of sammanstallning) {
  if (typeof s.fel === 'string') { rad(`  ${s.land.toUpperCase().padEnd(3)} \u2a2f ${s.fel}`); continue; }
  rad(`  ${s.land.toUpperCase().padEnd(3)} skapade ${String(s.skapade).padStart(3)} · hoppade över ${String(s.hoppade).padStart(3)} · fel ${s.fel}`);
}
if (torr) rad('\n  TORRKÖRNING — ingenting skrevs till någon butik.');
