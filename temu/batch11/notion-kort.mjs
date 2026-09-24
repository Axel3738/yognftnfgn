// Bygger Notion-korten för batch 11–13 (Product test center SE BÄVER) som JSON för notion-create-pages.
//   node temu/batch11/notion-kort.mjs > /tmp/.../kort.json
// Live-produkter: namn "<batch> <namn>", Landing page = SE-sidan. VÄNTA-produkter: "– VÄNTA: <orsak>" i
// namnet + engelsk ruta överst (CLAUDE.md: redigerarna läser kortets namn, inte batchrapporten).
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import { PRIS } from './priser.mjs';
import { readFileSync } from 'node:fs';
const COPY = JSON.parse(readFileSync(new URL('./copy.json', import.meta.url), 'utf8'));
const OFFERT = 'https://docs.google.com/spreadsheets/d/1zxPXYeyx228RVQ16-vrN19m-K2jKdq4x5snQ2KXAaj8';
const KORTNAMN = { bathuv: 'Båthuven 600D', kamadohuv: 'Kamadohuven', kajakhuv: 'Kajakhuven', varmesulor: 'Värmesulorna', krukvaxthuv: 'Krukväxthuven 3-pack', bikupsjacka: 'Bikupans vinterjacka', maskinhylla: 'Maskinhyllan', ljusslingevindor: 'Ljusslingevindorna 10-pack', makitahallare: 'Makita-hållaren 5-pack',
  fonstertermomatta: 'Fönstertermomattan 2-pack', varmemuff: 'Värmemuffen', laktarponcho: 'Läktarponchon', rcdrift: 'Radiostyrd driftbil 1:24', rcoffroad: 'Radiostyrd offroadbil 1:16',
  vedklyvshuv: 'Vedklyvshuven', scooterkapell: 'Scooterkapellet', poolpumphuv: 'Poolvärmepumpshuven', tradansikte: 'Trädansiktet', regnkedja: 'Regnkedjan 12 koppar', snosmaltmatta: 'Snösmältmattan', rullknivslip: 'Rullknivslipen', highlandcow: 'Highland Cow-kalendern', adelstenskalender: 'Ädelstenskalendern', takachuv: 'Tak-AC-huven', cykelhallarskydd: 'Cykelhållarskyddet 2 cyklar', krukbarrem: 'Krukbärremmen', buskjacka: 'Buskjackan 2-pack', sorkkorgar: 'Sorkkorgarna 15-pack', husbilskalender: 'Husbilskalendern', slangboxhuv: 'Slangboxhuven', lovsilar: 'Lövsilarna 6-pack', regntunnehuv: 'Regntunnehuven', elcykeljacka: 'Elcykelbatterijackan 2-pack', bordsfotboll: 'Bordsfotbollen', magnetblock: 'Magnetblocken 200 st' };
const b = new Butik('se');
const pages = [];
for (const [id, f] of Object.entries(FAKTA)) {
  const p = PRIS.find((x) => x.id === id).land;
  const fakta = Object.entries(f.latt || {}).map(([k, v]) => `- **${k}:** ${Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
  if (f.status === 'bygg') {
    const q = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{handle}}}`, { q: `sku:${f.sku}` });
    const url = `https://baverbutiken.se/products/${q.products.nodes[0].handle}`;
    const t = COPY[id].sv;
    pages.push({ properties: { Namn: `${f.batch} ${KORTNAMN[id]}`, Status: 'Products', Typ: 'Video - Pending Approval', 'Landing page': url },
      content: `**Product:** ${t.titel}\n**Landing page:** ${url}\n**Price:** ${p.SE.pris} kr (compare-at ${p.SE.jamfor} kr) · Norway ${p.NO.pris} NOK\n**Quote sheet:** ${OFFERT}\n\n## Locked facts (only these may be claimed)\n${fakta}\n${f.obs ? `\n**Note:** ${f.obs}` : ''}\n\n## Images\nThe store currently has the factory QC photo only (CWD 2026-09-18). Axel is harvesting the supplier gallery locally (BILDSKORD-BATCH11.md); more images, GIFs and video follow. Do not invent product details that are not visible in the photo or listed above.${t.varning ? `\n\n**Warning shown on the page:** ${t.varning}` : ''}` });
  } else {
    pages.push({ properties: { Namn: `${f.batch} ${KORTNAMN[id]} – VÄNTA: ${f.vanta}`, Status: 'Products', Typ: 'Video - Pending Approval' },
      content: `> ⚠️ **ON HOLD — do not start work on this card.** The product is NOT in the store yet. Reason: ${f.vanta}. When it goes live the name loses "VÄNTA" and a Landing page link is added.\n\n**Quote sheet:** ${OFFERT}\n**Planned price:** ${p.SE.pris} kr · Norway ${p.NO.pris} NOK\n\n## Locked facts so far\n${fakta || '- (none beyond the row name)'}` });
  }
}
console.log(JSON.stringify(pages));
console.error(`${pages.length} kort (${pages.filter((x) => x.properties['Landing page']).length} live, ${pages.filter((x) => !x.properties['Landing page']).length} VÄNTA)`);
