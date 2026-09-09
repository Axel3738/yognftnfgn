// Q4-ramverkets bonusprodukt (standard för VARJE OPS, Axels beslut
// 2026-09-07): den billiga komplementprodukten skapas i butiken så den kan
// (a) ligga GRATIS i paketnivåerna och (b) säljas som betald upsell i
// varukorgslådan. Läser produktfilens offer.bonus_produkt och skriver
// tillbaka produkt_id + variant_id i filen — inget stannar i chatten.
//
//   node factory/bonus.mjs factory/produkter/<id>.yaml [--torr]
//
// Idempotent: productSet på handle uppdaterar samma produkt vid omkörning.
// Produkten sätts ACTIVE och publiceras i Online Store — annars kan
// varken ms-paket (gratisraden) eller korg-upsellen lägga den i korgen.
// Beskrivningen följer husets sju block (problem → lösning → funktioner →
// garanti), texterna ordagrant ur produktfilen. Noll beroenden.

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { eskapa } from './sida.mjs';
import { skapaProdukt, publiceraProdukt, hamtaProduktViaHandle, kontrolleraAnslutning } from './shopify.mjs';

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

export function byggBonusBeskrivning(b, garanti) {
  const delar = [];
  if (text(b.problem_rubrik)) delar.push(`<h3>${eskapa(b.problem_rubrik)}</h3>`);
  if (text(b.problem_text)) delar.push(`<p>${eskapa(b.problem_text)}</p>`);
  if (text(b.losning_rubrik)) delar.push(`<h3>${eskapa(b.losning_rubrik)}</h3>`);
  if (text(b.losning_text)) delar.push(`<p>${eskapa(b.losning_text)}</p>`);
  const funk = lista(b.features);
  if (funk.length > 0) delar.push(`<h3>Funktioner</h3><ul>${funk.map((f) => `<li>${eskapa(f)}</li>`).join('')}</ul>`);
  // Svensk lag, inga egna köplöften: blocket heter Ångerrätt och säger lagens 14 dagar.
  if (text(garanti)) delar.push(`<h3>Ångerrätt</h3><p>${eskapa(garanti)} enligt distansavtalslagen.</p>`);
  return delar.join('\n');
}

export function byggBonusInput(p) {
  const b = p.offer?.bonus_produkt ?? {};
  if (!text(b.titel) || !text(b.handle) || !(Number(b.pris) > 0)) {
    throw new Error('offer.bonus_produkt saknar titel, handle eller pris.');
  }
  const bilder = lista(b.bilder);
  if (bilder.length === 0) throw new Error('offer.bonus_produkt.bilder är tom — bonusen behöver minst en bild (visas i paketraden och korgen).');
  return {
    title: b.titel,
    handle: b.handle,
    status: 'ACTIVE',
    vendor: p.brand?.namn ?? '',
    descriptionHtml: byggBonusBeskrivning(b, lista(p.garantier)[0]),
    seo: { title: `${b.titel} – ${p.brand?.namn ?? ''}`.slice(0, 70), description: text(b.problem_text)?.slice(0, 160) ?? '' },
    productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
    variants: [
      {
        optionValues: [{ optionName: 'Title', name: 'Default Title' }],
        price: Number(b.pris).toFixed(2),
        ...(text(b.sku) ? { sku: b.sku } : {}),
      },
    ],
    files: bilder.map((url) => ({ originalSource: url, contentType: 'IMAGE', alt: b.titel })),
  };
}

export function skrivTillbakaIdn(produktfil, produktId, variantId) {
  let t = readFileSync(produktfil, 'utf8');
  t = t.replace(/(bonus_produkt:[\s\S]*?produkt_id: )"[^"]*"/, `$1"${produktId}"`);
  t = t.replace(/(bonus_produkt:[\s\S]*?variant_id: )"[^"]*"/, `$1"${variantId}"`);
  writeFileSync(produktfil, t);
}

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const produktfil = arg.find((a) => !a.startsWith('--'));
  const torr = arg.includes('--torr') || arg.includes('--dry');
  if (!produktfil) {
    console.error('Användning: node factory/bonus.mjs factory/produkter/<id>.yaml [--torr]');
    process.exit(1);
  }
  const p = lasYaml(readFileSync(produktfil, 'utf8'));
  const input = byggBonusInput(p);
  console.log(`Bonusprodukt: ${input.title} (handle ${input.handle}) — ${input.variants[0].price} ${p.ekonomi?.valuta ?? 'SEK'}, ${input.files.length} bilder, ACTIVE + Online Store`);
  if (torr) { console.log('(torrkörning — inget skapades)'); return; }

  const shop = await kontrolleraAnslutning();
  console.log(`Connected: ${shop.myshopifyDomain} ✓`);
  const produkt = await skapaProdukt(input);
  const pub = await publiceraProdukt(produkt.id);
  const full = await hamtaProduktViaHandle(input.handle);
  const variantId = full?.variants?.nodes?.[0]?.id ?? '';
  const num = (gid) => String(gid).split('/').pop();
  skrivTillbakaIdn(produktfil, num(produkt.id), num(variantId));
  console.log(`✅ ${produkt.title}: produkt ${num(produkt.id)}, variant ${num(variantId)}, ${pub.status}${pub.publicerad ? `, publicerad i ${pub.kanal}` : ` — ${pub.notis}`}`);
  console.log('✅ produkt_id + variant_id skrivna i produktfilen.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
