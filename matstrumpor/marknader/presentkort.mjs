// presentkort.mjs — presentkortets egen sidmall, utan strumpornas block.
//
//   node matstrumpor/marknader/presentkort.mjs            # torrt: visar vad som tas bort
//   node matstrumpor/marknader/presentkort.mjs --skarpt   # skriver mallen i MAIN och kopplar presentkortet till den
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
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const KONFIG = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
  const k = await skapaKlient(lasButik(KONFIG.butik));
  const temaId = arg.includes('--tema') ? arg[arg.indexOf('--tema') + 1] : KONFIG.tema_id;
  const log = (s) => console.log(s);

  const d = await k.graphql(`query($id: ID!, $h: String!) { theme(id: $id) { name role files(filenames: ["templates/product.json"], first: 1) { nodes { body { ... on OnlineStoreThemeFileBodyText { content } } } } } productByHandle(handle: $h) { id title isGiftCard templateSuffix } }`, { id: temaId, h: HANDLE });
  const p = d.productByHandle;
  if (!p) throw new Error(`produkten ${HANDLE} finns inte`);
  if (!p.isGiftCard) throw new Error(`${HANDLE} är inte ett presentkort — rör inte dess mall`);
  const { text, bortaBlock, bortaSektioner } = presentkortMall(d.theme.files.nodes[0].body.content);
  log(`Tema: ${d.theme.name} (${d.theme.role})${skarpt ? '  SKARPT' : '  (torrt — --skarpt skriver)'}`);
  log(`${MALL}: block ${BLOCK.join(', ')} · bort: ${bortaBlock.join(', ')} · sektioner bort: ${bortaSektioner.join(', ')}`);
  log(`${p.title}: mall "${p.templateSuffix || '(standard)'}" → "${SUFFIX}"`);
  if (!skarpt) return;

  // Mallen först, sedan produkten — produkten får aldrig peka på en mall som inte finns.
  const r = await k.graphql(`mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }`,
    { id: temaId, files: [{ filename: MALL, body: { type: 'TEXT', value: text } }] });
  if (r.themeFilesUpsert.userErrors.length) throw new Error(r.themeFilesUpsert.userErrors.map((e) => `${e.code} ${e.message}`).join('; '));
  const las = await k.graphql(`query($id: ID!) { theme(id: $id) { files(filenames: ["${MALL}"], first: 1) { nodes { body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { id: temaId });
  const tillbaka = JSON.parse(utanKommentar(las.theme.files.nodes[0]?.body?.content ?? '{}'));
  if (JSON.stringify(tillbaka.sections?.main?.block_order) !== JSON.stringify(BLOCK)) throw new Error(`${MALL} läste tillbaka fel`);
  log(`✅ ${MALL} skriven och tillbakaläst`);
  // --utan-koppling: bara mallen. Prova den som kund med /products/presentkort?view=presentkort innan
  // produkten kopplas om — mallen syns inte för någon kund förrän produkten pekar på den.
  if (arg.includes('--utan-koppling')) { log(`mallen skriven, produkten orörd — prova /products/${HANDLE}?view=${SUFFIX}`); return; }

  if (p.templateSuffix !== SUFFIX) {
    const u = await k.graphql(`mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { product { templateSuffix } userErrors { field message } } }`, { p: { id: p.id, templateSuffix: SUFFIX } });
    if (u.productUpdate.userErrors.length) throw new Error(u.productUpdate.userErrors.map((e) => e.message).join('; '));
    if (u.productUpdate.product.templateSuffix !== SUFFIX) throw new Error('templateSuffix läste tillbaka fel');
  }
  log(`✅ ${p.title} använder mallen ${SUFFIX}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
