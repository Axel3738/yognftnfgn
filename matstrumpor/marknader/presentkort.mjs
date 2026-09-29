// presentkort.mjs — egna sidmallar utan strumpornas block: presentkortet och gratisätpinnarna.
//
//   node matstrumpor/marknader/presentkort.mjs                          # torrt: visar vad som tas bort
//   node matstrumpor/marknader/presentkort.mjs --skarpt                 # skriver mallen i MAIN och kopplar presentkortet till den
//   node matstrumpor/marknader/presentkort.mjs --profil atpinnar [--skarpt]   # samma sak för ätpinnarna (mallen "tillbehor")
//
// Ätpinnarna (2026-09-29, QA som kund på alla språk): "Äkta ätpinnar i trä" nås från varukorgsraden och
// visade strumpornas storleksrad ("Passar strl 36–44 · stretchigt material") och strumpornas sex frågor.
// Deras mall är strumpornas product.json UTAN de strumpbundna delarna — allt annat (leverans, trust-raden,
// recensioner, köpknappen) står kvar, så en ändring i product.json efter bygget följer inte med: kör om.
//
// Varför (mätt 2026-09-29, presentkortet läst som kund på /, /pt och /fr): presentkortet delade
// templates/product.json med strumporna och visade därför "Passar strl 36–44 · stretchigt material",
// "Fri frakt i Sverige", "30 dagars öppet köp", "Beräknad leverans 5–10 arbetsdagar", fars dag-raden och
// sex strumpfrågor ("Passar de alla?", "Hur fungerar Köp 1 – Få 1?"). Ett presentkort skickas med mejl —
// allt det var fel. Valörväljaren visade dessutom "150,00 kr" på euro-sidorna medan priset stod i euro.
//
// Mallen byggs UR strumpornas product.json (samma sektionsinställningar, samma bildlayout), men bara med
// blocken nedan. Inga egna texter: allt som syns är Shopifys egna strängar (redan översatta på alla
// språk), produktens titel (översatt) och den lokaliserade bilden (domantema.mjs v4). Därför behöver
// mallen inga översättningar — lägger du till ett block med egen text måste det registreras per språk.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
export const MALL = 'templates/product.presentkort.json';
export const SUFFIX = 'presentkort';
export const HANDLE = 'presentkort';
// Blocken som får följa med, i den ordningen. Valörväljaren är borta med flit: en enda valör, och dess
// etikett "150,00 kr" är text som inte följer marknadens valuta.
export const BLOCK = ['vendor', 'title', 'price', 'buy_buttons'];

/** Tar bort Shopifys autogenererade kommentar överst i en mallfil. */
export const utanKommentar = (text) => text.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');

// Strumpbundna delar av product.json: storleksraden, de två paketväljarna och strumpornas FAQ.
export const STRUMPBLOCK = ['ms_storlek', 'ms_sortval', 'ms_paket'];
export const STRUMPSEKTIONER = ['ms_faq_section'];
export const PROFILER = {
  presentkort: { handle: 'presentkort', suffix: 'presentkort', mall: 'templates/product.presentkort.json', presentkort: true },
  atpinnar: { handle: 'sushipinnar-i-akta-tra', suffix: 'tillbehor', mall: 'templates/product.tillbehor.json', presentkort: false },
};

/** Ren: strumpornas product.json (text) → en tillbehörsmall utan strumpbundna block och sektioner. */
export function tillbehorMall(produktJson) {
  const j = JSON.parse(utanKommentar(produktJson));
  const main = j.sections?.main;
  if (main?.type !== 'main-product') throw new Error('product.json saknar sektionen main (main-product)');
  if (!main.blocks?.buy_buttons) throw new Error('product.json saknar köpknappen');
  const mall = structuredClone(j);
  const bortaBlock = (main.block_order ?? []).filter((b) => STRUMPBLOCK.includes(b));
  const bortaSektioner = (j.order ?? []).filter((x) => STRUMPSEKTIONER.includes(x));
  for (const b of bortaBlock) delete mall.sections.main.blocks[b];
  mall.sections.main.block_order = main.block_order.filter((b) => !STRUMPBLOCK.includes(b));
  for (const x of bortaSektioner) delete mall.sections[x];
  mall.order = j.order.filter((x) => !STRUMPSEKTIONER.includes(x));
  return { text: JSON.stringify(mall, null, 2) + '\n', bortaBlock, bortaSektioner };
}

/** Ren: strumpornas product.json (text) → presentkortets mall (text) + vad som togs bort. */
export function presentkortMall(produktJson) {
  const j = JSON.parse(utanKommentar(produktJson));
  const main = j.sections?.main;
  if (main?.type !== 'main-product') throw new Error('product.json saknar sektionen main (main-product)');
  const saknas = BLOCK.filter((b) => !main.blocks?.[b]);
  if (saknas.length) throw new Error(`product.json saknar blocken ${saknas.join(', ')}`);
  const kop = main.blocks.buy_buttons;
  if (kop.type !== 'buy_buttons') throw new Error('blocket buy_buttons är inte en köpknapp');
  const blocks = Object.fromEntries(BLOCK.map((b) => [b, structuredClone(main.blocks[b])]));
  // Mottagarformuläret ("Jag vill skicka detta som en gåva") är hela poängen med ett presentkort.
  blocks.buy_buttons.settings = { ...blocks.buy_buttons.settings, show_gift_card_recipient: true };
  const mall = {
    sections: { main: { type: 'main-product', blocks, block_order: [...BLOCK], settings: structuredClone(main.settings ?? {}) } },
    order: ['main'],
  };
  const bortaBlock = (main.block_order ?? []).filter((b) => !BLOCK.includes(b));
  const bortaSektioner = (j.order ?? []).filter((s) => s !== 'main');
  return { text: JSON.stringify(mall, null, 2) + '\n', bortaBlock, bortaSektioner };
}

// Det som aldrig får synas i presentkortets sidinnehåll (svenska + stickprov på andra språk). Annonsraden
// överst ("Fri frakt i hela Sverige") ligger utanför <main> och gäller hela butiken — den räknas inte.
export const FORBJUDET = ['36–44', '36-44', '36 ao 44', 'Fri frakt', 'Beräknad leverans', 'arbetsdagar', 'Vanliga frågor', 'Köp 1 – Få 1', 'fars dag',
  'Livraison', 'Envío gratis', 'Kostenloser Versand', 'Beregnet levering', 'Valörer', '150,00 kr'];

/** Ren: sidans HTML → texten i <main> (skript och stilar borta). */
export function mainText(html) {
  const main = /<main[\s\S]*?<\/main>/.exec(html)?.[0];
  if (!main) throw new Error('sidan saknar <main>');
  return main.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, '\n')
    .split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
}

/** Ren: sidans HTML → de förbjudna raderna som finns kvar i sidinnehållet. */
export function kvarPaSidan(html) {
  const text = mainText(html);
  return FORBJUDET.filter((f) => text.includes(f));
}

// ---- Nät -------------------------------------------------------------------

async function huvud() {
  const arg = process.argv.slice(2);
  const skarpt = arg.includes('--skarpt');
  const profilNamn = arg.includes('--profil') ? arg[arg.indexOf('--profil') + 1] : 'presentkort';
  const P = PROFILER[profilNamn];
  if (!P) throw new Error(`okänd profil ${profilNamn} — finns: ${Object.keys(PROFILER).join(', ')}`);
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const KONFIG = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
  const k = await skapaKlient(lasButik(KONFIG.butik));
  const temaId = arg.includes('--tema') ? arg[arg.indexOf('--tema') + 1] : KONFIG.tema_id;
  const log = (s) => console.log(s);

  const d = await k.graphql(`query($id: ID!, $h: String!) { theme(id: $id) { name role files(filenames: ["templates/product.json"], first: 1) { nodes { body { ... on OnlineStoreThemeFileBodyText { content } } } } } productByHandle(handle: $h) { id title vendor isGiftCard templateSuffix } }`, { id: temaId, h: P.handle });
  const p = d.productByHandle;
  if (!p) throw new Error(`produkten ${P.handle} finns inte`);
  // Presentkortsmallen på en vanlig produkt (eller tvärtom) hade gett fel köpknapp — stoppa hellre.
  if (p.isGiftCard !== P.presentkort) throw new Error(`${P.handle} är ${p.isGiftCard ? '' : 'inte '}ett presentkort — fel profil, rör inte dess mall`);
  const { text, bortaBlock, bortaSektioner } = (P.presentkort ? presentkortMall : tillbehorMall)(d.theme.files.nodes[0].body.content);
  const blockOrder = JSON.parse(text).sections.main.block_order;
  log(`Tema: ${d.theme.name} (${d.theme.role})${skarpt ? '  SKARPT' : '  (torrt — --skarpt skriver)'}`);
  log(`${P.mall}: block ${blockOrder.join(', ')} · bort: ${bortaBlock.join(', ') || '–'} · sektioner bort: ${bortaSektioner.join(', ') || '–'}`);
  log(`${p.title}: mall "${p.templateSuffix || '(standard)'}" → "${P.suffix}"`);
  // Presentkortets leverantör var skriven med liten bokstav ("matstrumpor") medan alla andra produkter
  // visar "Matstrumpor" ovanför titeln (QA 2026-09-29).
  const vendorRatt = P.presentkort && /^matstrumpor$/i.test(p.vendor ?? '') && p.vendor !== 'Matstrumpor';
  if (vendorRatt) log(`leverantör "${p.vendor}" → "Matstrumpor"`);
  if (!skarpt) return;

  // Mallen först, sedan produkten — produkten får aldrig peka på en mall som inte finns.
  const r = await k.graphql(`mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }`,
    { id: temaId, files: [{ filename: P.mall, body: { type: 'TEXT', value: text } }] });
  if (r.themeFilesUpsert.userErrors.length) throw new Error(r.themeFilesUpsert.userErrors.map((e) => `${e.code} ${e.message}`).join('; '));
  let tillbaka = null;
  for (let forsok = 1; forsok <= 3; forsok++) {
    const las = await k.graphql(`query($id: ID!) { theme(id: $id) { files(filenames: ["${P.mall}"], first: 1) { nodes { body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { id: temaId });
    tillbaka = JSON.parse(utanKommentar(las.theme.files.nodes[0]?.body?.content ?? '{}'));
    if (JSON.stringify(tillbaka.sections?.main?.block_order) === JSON.stringify(blockOrder)) break;
    await new Promise((res) => setTimeout(res, 5000));
  }
  if (JSON.stringify(tillbaka.sections?.main?.block_order) !== JSON.stringify(blockOrder)) throw new Error(`${P.mall} läste tillbaka fel`);
  log(`✅ ${P.mall} skriven och tillbakaläst`);
  // --utan-koppling: bara mallen. Prova den som kund med /products/<handle>?view=<suffix> innan
  // produkten kopplas om — mallen syns inte för någon kund förrän produkten pekar på den.
  if (arg.includes('--utan-koppling')) { log(`mallen skriven, produkten orörd — prova /products/${P.handle}?view=${P.suffix}`); return; }

  const andra = { ...(p.templateSuffix !== P.suffix ? { templateSuffix: P.suffix } : {}), ...(vendorRatt ? { vendor: 'Matstrumpor' } : {}) };
  if (Object.keys(andra).length) {
    const u = await k.graphql(`mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { product { templateSuffix vendor } userErrors { field message } } }`, { p: { id: p.id, ...andra } });
    if (u.productUpdate.userErrors.length) throw new Error(u.productUpdate.userErrors.map((e) => e.message).join('; '));
    if (u.productUpdate.product.templateSuffix !== P.suffix) throw new Error('templateSuffix läste tillbaka fel');
    if (vendorRatt && u.productUpdate.product.vendor !== 'Matstrumpor') throw new Error('leverantören läste tillbaka fel');
  }
  log(`✅ ${p.title} använder mallen ${P.suffix}${vendorRatt ? ', leverantören heter Matstrumpor' : ''}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
