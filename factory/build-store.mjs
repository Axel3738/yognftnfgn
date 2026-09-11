// OPS Factory steg 2 — bygger Shopify-produkten ur en produktfil.
//
//   node factory/build-store.mjs factory/produkter/<id>.yaml --dry-run
//   node factory/build-store.mjs factory/produkter/<id>.yaml
//
// Flöde: validera filen (kritiska fel = stopp) → bygg sidan ur mallen →
// skriv förhandsvisning + plan till factory/output/<id>/ →
// dry-run: stanna där · skarpt: skapa produkten i Shopify som ACTIVE.
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

/** Fogar ihop meningar med ". " utan att dubblera skiljetecken. */
export const fogaMeningar = (delar) =>
  (delar ?? [])
    .map((x) => String(x ?? '').trim())
    .filter(Boolean)
    .map((x, i, a) => (i === a.length - 1 || /[.!?:…]$/.test(x) ? x : `${x}.`))
    .join(' ');

/**
 * SEO-titeln: produktnamn + brand, men brandet stryks hellre än kapas.
 *
 * `kortText` klipper mitt i ordet, och en titel som slutar "– AdventLa…" ser
 * ut som ett fel i butiken snarare än som en förkortning (mätt 2026-09-11 på
 * smyckeskalendern, 70 tecken jämnt). Ryms inte brandet får namnet stå ensamt.
 */
export function seoTitel(namn, brand, max = 70) {
  const n = String(namn ?? '').trim();
  const b = String(brand ?? '').trim();
  const hel = b ? `${n} – ${b}` : n;
  if (hel.length <= max) return hel;
  return kortText(n, max);
}

// Produktens handle i butiken: `produkt.handle` när det står i filen, annars
// `produkt.id`. De två skiljer sig när butiken byggdes under ett annat namn
// än filens id (TankGuard: id `tankguard`, handle `tankoverdraget`, produkt
// 15989715108184). Alla uppslag mot Shopify ska gå på det här värdet —
// id:t är filens och statens namn, inte butikens.
export const produktHandle = (p) =>
  (typeof p?.produkt?.handle === 'string' && p.produkt.handle.trim() !== ''
    ? p.produkt.handle.trim()
    : p?.produkt?.id);

// En bild i `media.bilder` (och `offer.bonus_produkt.bilder`) är antingen en
// URL-sträng (alt = produktnamnet) eller { url, alt }. Alt-texten bär
// språkmärkningen [SV]/[NO] som temats gallerifilter läser (omärkt = visas
// för alla språk). Returnerar { url, alt } eller null för en tom rad.
export function bildPost(b, standardAlt) {
  if (typeof b === 'string') return b.trim() ? { url: b.trim(), alt: standardAlt } : null;
  if (b && typeof b === 'object' && typeof b.url === 'string' && b.url.trim()) {
    const alt = typeof b.alt === 'string' && b.alt.trim() ? b.alt.trim() : standardAlt;
    return { url: b.url.trim(), alt };
  }
  return null;
}

// Bygger hela planen (ProductSetInput + kringdata) ur en validerad produktfil.
// Ren funktion utan nätverk — samma plan i dry-run och skarpt läge.
// `butik` är valfri (KEDJAN.md: byggPlan(produkt, butik)) — vendor faller
// tillbaka på butikens brand när produktfilen saknar eget brandnamn.
export function byggPlan(p, butik = null) {
  const riktigaVarianter = Array.isArray(p.varianter) && p.varianter.length > 0;
  const optionNamn = riktigaVarianter ? 'Variant' : 'Title';
  const varianter = riktigaVarianter ? p.varianter : [{ namn: 'Default Title' }];
  // Listorna tål null, tom sträng och (efter yaml-fixen) `[]` — men aldrig
  // krascha på en felskriven rad: valideringen har redan sagt sitt.
  const lista = (v) => (Array.isArray(v) ? v : []);
  const bilder = lista(p.media?.bilder).map((b) => bildPost(b, p.produkt.namn)).filter(Boolean);
  const videor = lista(p.media?.videor).filter((v) => typeof v === 'string' && v.trim() !== '');
  const vendor = p.brand?.namn ?? butik?.butik?.brand ?? '';

  // Meningsskiljetecknet läggs bara till om raden inte redan har ett — annars
  // står det ".." mitt i Google-träffen ("…fram till julafton.. 14 dagars
  // ångerrätt", mätt 2026-09-11 på åtta av AdventLanes tolv produkter).
  const seoBeskrivning = kortText(fogaMeningar([p.benefits?.[0], p.garantier?.[0]]), 160);

  const input = {
    title: p.produkt.namn,
    handle: produktHandle(p),
    // ACTIVE, inte DRAFT (Axels bakläxa 2026-09-08 på TankGuard): en DRAFT
    // produkt ger 404 i menyn och "Exempel på produktnamn" i kundvyn. Butiken
    // är ändå lösenordsskyddad under trialen, så ACTIVE exponerar ingenting.
    status: 'ACTIVE',
    descriptionHtml: byggKortBeskrivning(p),
    vendor,
    seo: {
      title: seoTitel(p.produkt.namn, vendor, 70),
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
      // Sälj vidare när lagret tar slut (Axels regel 2026-09-09). Shopifys
      // default är DENY — då slutar produkten säljas tyst mitt i en kampanj
      // medan annonserna fortsätter kosta pengar. Dropshipping har inget
      // eget lager att ta slut, så saldot ska aldrig få stoppa ett köp.
      inventoryPolicy: 'CONTINUE',
      inventoryItem: { tracked: false },
    })),
    // Sträng eller { url, alt } — se bildPost. Alt-texten är det enda som
    // skiljer en [NO]-bild från en [SV]-bild i temats gallerifilter, så den
    // får aldrig ersättas med produktnamnet när filen satt en egen.
    files: bilder.map((b) => ({
      originalSource: b.url,
      contentType: 'IMAGE',
      alt: b.alt,
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

  // Fristående körning: produktfilen ensam, ingen butikskonfig (vendor = brand.namn).
  const plan = byggPlan(p, null);
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
  console.log(`\n✅ Produkten skapad som ACTIVE (butiken är lösenordsskyddad under trialen).`);
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
