// OPS Factory steg 2 — bygger Shopify-produkten ur en produktfil.
//
//   node factory/build-store.mjs factory/produkter/<id>.yaml --dry-run
//   node factory/build-store.mjs factory/produkter/<id>.yaml
//
// Flöde: validera filen (kritiska fel = stopp) → bygg sidan ur mallen →
// skriv förhandsvisning + plan till factory/output/<id>/ →
// dry-run: stanna där · skarpt: skapa produkten i Shopify som DRAFT.
// Publicerar ALDRIG tema eller butik live. Rör inga annonsflöden.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { validera } from './validera.mjs';
import { byggKortBeskrivning, byggForhandsvisning, SEKTIONSORDNING } from './sida.mjs';
import { laddaEnv } from './env.mjs';
import { skapaProdukt } from './shopify.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));

const kortText = (text, max) =>
  String(text ?? '').length <= max ? String(text ?? '') : `${String(text).slice(0, max - 1).trimEnd()}…`;

// Bygger hela planen (ProductSetInput + kringdata) ur en validerad produktfil.
// Ren funktion utan nätverk — samma plan i dry-run och skarpt läge.
export function byggPlan(p) {
  const riktigaVarianter = Array.isArray(p.varianter) && p.varianter.length > 0;
  const optionNamn = riktigaVarianter ? 'Variant' : 'Title';
  const varianter = riktigaVarianter ? p.varianter : [{ namn: 'Default Title' }];
  const bilder = (p.media?.bilder ?? []).filter(Boolean);
  const videor = (p.media?.videor ?? []).filter(Boolean);

  const seoBeskrivning = kortText(
    [p.benefits?.[0], p.garantier?.[0]].filter(Boolean).join('. '),
    160
  );

  const input = {
    title: p.produkt.namn,
    handle: p.produkt.id,
    // ACTIVE från start (Axels bakläxa 2026-09-08: DRAFT ger 404 i menyn och
    // "Exempel på produktnamn" i kundvyn — trial-lösenordet skyddar butiken).
    status: 'ACTIVE',
    descriptionHtml: byggKortBeskrivning(p),
    vendor: p.brand.namn,
    seo: {
      title: kortText(`${p.produkt.namn} – ${p.brand.namn}`, 70),
      description: seoBeskrivning,
    },
    productOptions: [
      { name: optionNamn, values: varianter.map((v) => ({ name: v.namn })) },
    ],
    variants: varianter.map((v) => ({
      optionValues: [{ optionName: optionNamn, name: v.namn }],
      price: p.ekonomi.pris.toFixed(2),
      ...(p.ekonomi.jamforpris > 0 ? { compareAtPrice: p.ekonomi.jamforpris.toFixed(2) } : {}),
      ...(v.sku ? { sku: v.sku } : {}),
    })),
    // En bild är antingen en URL-sträng (alt = produktnamnet) eller
    // { url, alt } — alt-texten bär språkmärkningen [SV]/[NO] som temats
    // gallerifilter läser (omärkt = visas för alla språk).
    files: bilder.map((b) => ({
      originalSource: typeof b === 'string' ? b : b.url,
      contentType: 'IMAGE',
      alt: typeof b === 'string' ? p.produkt.namn : (b.alt ?? p.produkt.namn),
    })),
  };

  return {
    input,
    sektioner: [...SEKTIONSORDNING, 'sticky-atc'],
    // Video kan inte skickas som extern fil via productSet — hanteras i temasteget.
    hoppadeOver: videor.map((url) => `video (läggs på i temasteget): ${url}`),
  };
}

export function skrivUtdata(p, plan) {
  const mapp = join(FACTORY_ROT, 'output', p.produkt.id);
  mkdirSync(mapp, { recursive: true });
  const forhandsvisning = join(mapp, 'forhandsvisning.html');
  const planFil = join(mapp, 'plan.json');
  writeFileSync(forhandsvisning, byggForhandsvisning(p));
  writeFileSync(planFil, `${JSON.stringify(plan, null, 2)}\n`);
  return { forhandsvisning, planFil };
}

function visaPlan(p, plan) {
  const i = plan.input;
  console.log('Det här skapas i Shopify:');
  console.log(`   Produkt:   ${i.title}  (handle: ${i.handle}, status: ${i.status})`);
  console.log(`   Brand:     ${i.vendor}`);
  for (const v of i.variants) {
    const namn = v.optionValues[0].name;
    const jamfor = v.compareAtPrice ? `  (jämförpris ${v.compareAtPrice})` : '';
    console.log(`   Variant:   ${namn} — ${v.price} ${p.ekonomi.valuta}${jamfor}`);
  }
  console.log(`   Bilder:    ${i.files.length} st`);
  console.log(`   SEO:       ${i.seo.title}`);
  console.log(`              ${i.seo.description}`);
  console.log(`   Sektioner: ${plan.sektioner.join(' → ')}`);
  for (const rad of plan.hoppadeOver) console.log(`   Hoppas över: ${rad}`);
}

async function huvud() {
  const argument = process.argv.slice(2);
  const dryRun = argument.includes('--dry-run') || argument.includes('--dry');
  const fil = argument.find((a) => !a.startsWith('--'));
  if (!fil) {
    console.error('Användning: node factory/build-store.mjs <produktfil.yaml> [--dry-run]');
    process.exit(1);
  }

  laddaEnv();
  const p = lasYaml(readFileSync(fil, 'utf8'));
  const { fel, varningar, nyckeltal } = validera(p);

  console.log(`\nBygger butik ur ${fil}${dryRun ? '  (DRY-RUN)' : ''}\n`);
  if (fel.length > 0) {
    console.error(`❌ ${fel.length} kritiska fel — STOPP:`);
    for (const f of fel) console.error(`   • ${f}`);
    process.exit(1);
  }
  if (varningar.length > 0) {
    console.log(`⚠️  ${varningar.length} varningar (stoppar inte):`);
    for (const v of varningar) console.log(`   • ${v}`);
    console.log('');
  }

  const plan = byggPlan(p);
  const filer = skrivUtdata(p, plan);
  visaPlan(p, plan);
  console.log(`\n   Break-even-ROAS: ${nyckeltal.breakEvenRoas}  ·  Marginal: ${nyckeltal.marginal} ${p.ekonomi.valuta} (${nyckeltal.marginalProcent} %)`);
  console.log(`\nFörhandsvisning: ${filer.forhandsvisning}`);
  console.log(`Plan:            ${filer.planFil}`);

  if (dryRun) {
    console.log('\n✅ Dry-run klar — inget skickades till Shopify.\n');
    return;
  }

  console.log('\nSkickar till Shopify …');
  const produkt = await skapaProdukt(plan.input);
  console.log(`\n✅ Produkten skapad som DRAFT (inte publicerad).`);
  console.log(`   Admin:  https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/products/${produkt.legacyResourceId}`);
  if (produkt.onlineStorePreviewUrl) console.log(`   Förhandsvisning i butiken: ${produkt.onlineStorePreviewUrl}`);
  console.log('');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
