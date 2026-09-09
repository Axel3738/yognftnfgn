// Q4-ramverkets bonusprodukt (standard för VARJE OPS, Axels beslut
// 2026-09-07): den billiga komplementprodukten skapas i butiken så den kan
// (a) ligga GRATIS i paketnivåerna och (b) säljas som betald upsell i
// varukorgslådan. Läser produktfilens offer.bonus_produkt och skriver
// tillbaka produkt_id + variant_id i filen — inget stannar i chatten.
//
//   node factory/bonus.mjs factory/produkter/<id>.yaml [--torr]
//
// Idempotent: produkten slås upp på handle och uppdateras med sitt id vid
// omkörning (productSet). Produkten sätts ACTIVE och publiceras i Online
// Store — annars kan varken ms-paket (gratisraden) eller korg-upsellen lägga
// den i korgen. Beskrivningen följer husets sju block (problem → lösning →
// funktioner → garanti), texterna ordagrant ur produktfilen. Noll beroenden.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { eskapa } from './sida.mjs';
import { skapaProdukt, publiceraProdukt, hamtaProduktViaHandle, kontrolleraAnslutning } from './shopify.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const num = (gid) => (gid ? String(gid).split('/').pop() : '');

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

// productSet-input för bonusen. Kastar om titel, handle, pris eller bild saknas
// — en bonus utan bild syns varken i paketraden eller korgen.
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

// Skriver produkt_id + variant_id under offer.bonus_produkt i produktfilen.
// Ren textredigering (yaml-läsaren är bara en läsare) — kommentarer och
// ordning i filen rörs inte. Saknas raderna läggs de till efter handle-raden;
// saknas hela bonus_produkt-blocket görs inget och false returneras.
// Kraschar aldrig på en fil utan fälten (kontraktet i KEDJAN.md).
export function skrivTillbakaIdn(produktfil, produktId, variantId) {
  const ny = skrivIdnIText(readFileSync(produktfil, 'utf8'), produktId, variantId);
  if (ny === null) return false;
  writeFileSync(produktfil, ny);
  return true;
}

// Samma sak på en sträng — testbar utan filsystem. null = inget block att skriva i.
export function skrivIdnIText(yamlText, produktId, variantId) {
  const rader = String(yamlText).split('\n');
  const start = rader.findIndex((r) => /^\s*bonus_produkt:\s*(#.*)?$/.test(r));
  if (start === -1) return null;
  const blockIndent = rader[start].length - rader[start].trimStart().length;

  // Blockets slut: första raden med indent ≤ blockets som inte är tom/kommentar.
  let slut = rader.length;
  for (let i = start + 1; i < rader.length; i++) {
    const t = rader[i].trim();
    if (t === '' || t.startsWith('#')) continue;
    const indent = rader[i].length - rader[i].trimStart().length;
    if (indent <= blockIndent) { slut = i; break; }
  }
  const forstaRad = rader.slice(start + 1, slut).find((r) => r.trim() !== '' && !r.trim().startsWith('#'));
  const faltIndent = forstaRad ? ' '.repeat(forstaRad.length - forstaRad.trimStart().length) : ' '.repeat(blockIndent + 2);

  const radFor = (nyckel) => rader.findIndex((r, ix) => ix > start && ix < slut && new RegExp(`^\\s*${nyckel}:`).test(r));
  const satt = (nyckel, varde, ankare) => {
    const i = radFor(nyckel);
    const rad = `${faltIndent}${nyckel}: "${varde}"`;
    if (i !== -1) { rader[i] = rad; return; }
    // Efter första ankaret som finns (produkt_id före variant_id, båda efter
    // handle), annars först i blocket.
    const efter = ankare.map(radFor).find((ix) => ix !== -1);
    rader.splice(efter !== undefined ? efter + 1 : start + 1, 0, rad);
    slut++;
  };
  satt('produkt_id', String(produktId ?? ''), ['handle']);
  satt('variant_id', String(variantId ?? ''), ['produkt_id', 'handle']);
  return rader.join('\n');
}

// Produktfilen för ett produkt-id: ctx kan peka ut den; annars letas den upp i
// factory/produkter/ på produkt.id (filnamnet är inte alltid id:t —
// tacklebay-spohallaren.yaml bär id fiskespohallare-4-pack).
export function hittaProduktfil(produktId, { mapp = join(FACTORY_ROT, 'produkter') } = {}) {
  if (!text(produktId) || !existsSync(mapp)) return null;
  const direkt = join(mapp, `${produktId}.yaml`);
  const kandidater = [direkt, ...readdirSync(mapp).filter((f) => f.endsWith('.yaml')).map((f) => join(mapp, f))];
  for (const fil of kandidater) {
    if (!existsSync(fil)) continue;
    try {
      if (lasYaml(readFileSync(fil, 'utf8'))?.produkt?.id === produktId) return fil;
    } catch {
      // en trasig fil i mappen ska inte stoppa uppslaget
    }
  }
  return null;
}

// Hela steget: bonusen i butiken, ACTIVE + Online Store, id:n tillbaka i
// produktfilen och i minnet (produkt.offer.bonus_produkt). ctx = { produktfil? }.
export async function sakerstallBonus(ctx, produkt, { torr = false } = {}) {
  const input = byggBonusInput(produkt);
  if (torr) return { produkt_id: null, variant_id: null, input, skrivet: false, ny: null };

  const befintlig = await hamtaProduktViaHandle(input.handle);
  const skapad = await skapaProdukt(input, befintlig ? { id: befintlig.id, status: 'ACTIVE' } : {});
  const pub = await publiceraProdukt(skapad.id);
  const full = await hamtaProduktViaHandle(input.handle);
  const variantGid = full?.variants?.nodes?.[0]?.id ?? skapad.variantIds?.[0] ?? '';

  const ut = {
    produkt_id: num(skapad.id),
    variant_id: num(variantGid),
    gid: skapad.id,
    variant_gid: variantGid,
    handle: input.handle,
    titel: skapad.title ?? input.title,
    ny: !befintlig,
    publicerad: pub,
    skrivet: false,
    produktfil: null,
  };

  // Minnet först — paket-steget i samma körning ska se id:na.
  if (produkt.offer?.bonus_produkt) {
    produkt.offer.bonus_produkt.produkt_id = ut.produkt_id;
    produkt.offer.bonus_produkt.variant_id = ut.variant_id;
  }
  const fil = text(ctx?.produktfil) ?? text(ctx?.produktfiler?.[produkt.produkt?.id]) ?? hittaProduktfil(produkt.produkt?.id);
  if (fil && existsSync(fil)) {
    ut.produktfil = fil;
    ut.skrivet = skrivTillbakaIdn(fil, ut.produkt_id, ut.variant_id);
  }
  return ut;
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
  const r = await sakerstallBonus({ produktfil }, p);
  console.log(`✅ ${r.titel}: produkt ${r.produkt_id}, variant ${r.variant_id}, ${r.ny ? 'skapad' : 'uppdaterad'}, ${r.publicerad.status}${r.publicerad.publicerad ? `, publicerad i ${r.publicerad.kanal}` : ` — ${r.publicerad.notis ?? ''}`}`);
  console.log(r.skrivet ? '✅ produkt_id + variant_id skrivna i produktfilen.' : '⚠️ produktfilen saknar offer.bonus_produkt-blocket — id:n inte skrivna.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
