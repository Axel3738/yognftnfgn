// Skapar/uppdaterar kollektionen "Din gratisprodukt" i Bäverbutiken — den
// kollektion rabattkoden (mejl/konfig.json → erbjudande.kod) ger en gratis
// produkt ur. Idempotent: körs den igen synkas produktlistan och texten.
//
//   node mejl/kollektion.mjs [--torr]
//
// Produkterna slås upp på handle ur konfigen. En handle som inte finns som
// aktiv produkt stoppar körningen — en gratisprodukt som inte går att lägga i
// korgen gör hela erbjudandet till ett brutet löfte.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { kravProxy, hamtaProdukter, skapaEllerUppdateraKollektion } from './shopify.mjs';

kravProxy();

const ROT = dirname(fileURLToPath(import.meta.url));
const konfig = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
const torr = process.argv.includes('--torr');
const e = konfig.erbjudande;

export function beskrivning(k) {
  const o = k.erbjudande;
  const hjul = `${k.butik.url}/pages/${k.hjul.handle}`;
  return [
    `<p><strong>Har du handlat hos oss förut?</strong> Då får du en av produkterna nedan gratis vid nästa köp — vilken avgör <a href="${hjul}">lyckohjulet</a>.</p>`,
    `<p>Så funkar det: <a href="${hjul}">snurra hjulet</a>, lägg vinsten i korgen och handla för minst ${o.minsta_kop_sek} kr till. Koden <strong>${o.kod}</strong> läggs på automatiskt och vinsten blir 0 kr i kassan. Ligger bara vinsten i korgen står den till fullt pris tills du lagt till varor för ${o.minsta_kop_sek} kr.</p>`,
    `<p>Gäller en gång per kund, för dig som lagt minst en order hos ${k.butik.namn} tidigare, med samma e-postadress som förra ordern.</p>`,
  ].join('\n');
}

const alla = await hamtaProdukter();
const valda = [];
for (const handle of e.gratisprodukter) {
  const p = alla.find((x) => x.handle === handle);
  if (!p) {
    console.error(`❌ Gratisprodukten "${handle}" finns inte som aktiv produkt. Rätta mejl/konfig.json.`);
    process.exit(1);
  }
  valda.push(p);
}

console.log(`Kollektion "${e.kollektion_titel}" (/collections/${e.kollektion_handle}) — ${valda.length} produkter:`);
for (const p of valda) console.log(`  • ${p.titel} — ${p.pris} kr (lager ${p.lager}, ${p.lagerpolicy})`);

if (torr) {
  console.log('\n--torr: inget skrivet.');
  process.exit(0);
}

const r = await skapaEllerUppdateraKollektion({
  handle: e.kollektion_handle,
  titel: e.kollektion_titel,
  beskrivningHtml: beskrivning(konfig),
  produktIds: valda.map((p) => p.id),
});
console.log(
  r.skapad
    ? `✅ Skapad och publicerad i Online Store: ${r.id}`
    : `✅ Uppdaterad: ${r.id} (+${r.tillagda} / −${r.borttagna} produkter)`
);
console.log(`Länk: ${konfig.butik.url}/collections/${e.kollektion_handle}`);
