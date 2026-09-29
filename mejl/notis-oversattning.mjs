// Registrerar fraktmejlen på kundens språk som Shopifys EGNA översättningar
// av notiserna — ingen inklistring, ingen Cowork. Noll beroenden.
//
//   node mejl/notis-oversattning.mjs matstrumpor                 # torrt: läser och jämför, skriver inget
//   node mejl/notis-oversattning.mjs matstrumpor --skarpt        # registrerar alla språk, läser tillbaka
//   node mejl/notis-oversattning.mjs matstrumpor --skarpt --om-inaktuell   # bara språk som inte redan är våra
//
// Vägen (mätt 2026-09-29 på Matstrumpor, appen "Fabriken"): varje notis är en
// översättningsbar resurs, `translatableResources(resourceType: EMAIL_TEMPLATE)`,
// med nycklarna `title` (ämnesraden) och `body_html` (mallen). Huvudspråket
// (svenska) går INTE att skriva via API — bara i admin — men översättningarna
// går: `translationsRegister` med huvudtextens digest, samma mekanism som
// Translate & Adapt. Shopify skickar sedan notisen på det språk kunden
// handlade på ("If translations are available for an email notification,
// then a customer is automatically sent email notifications in the language
// that they placed their order in", help.shopify.com → Languages →
// Notifications, läst 2026-09-29).
//
// ⚠️ Före första körningen bar våra tre egna mallar Shopifys STANDARD-
// översättningar på alla elva språk (updatedAt null — Shopifys egna, inte
// registrerade av någon): en tysk kund hade fått Shopifys tyska standardmejl
// med fraktbolagets spårningslänk och Shop-knappen, inte vårt mejl.
//
// ⚠️ När huvudmallen (svenska) klistras om i admin byter den digest, och
// översättningarna märks `outdated`. Kör då med --om-inaktuell — det gör
// inget alls när allt redan stämmer, så det går att köra varje timme.
//
// Källorna: mejl/bygg-butik.mjs (mallarna, registret → mejl_sprak) och
// mejl/butiker/<id>.json → shopify_mallar (notisernas id).

import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { byggButik } from './bygg-butik.mjs';
import { sparningsKedja } from './mallar.mjs';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const sha = (s) => createHash('sha256').update(s ?? '').digest('hex').slice(0, 16);
const alias = (locale) => `l_${locale.replace(/[^a-z0-9]/gi, '_')}`;

// Frågan: huvudtexten (digest) + nuvarande översättning per språk.
export function lasFraga(locales) {
  const delar = locales.map((l) => `${alias(l)}: translations(locale: "${l}") { key value outdated updatedAt }`).join(' ');
  return `query($id: ID!) { translatableResource(resourceId: $id) { resourceId translatableContent { key value digest locale } ${delar} } }`;
}

// Läget för ett språk i en notis: 'lika' (vår text, aktuell), 'inaktuell'
// (vår text men huvudmallen har ändrats sedan), 'annan' (någon annans —
// t.ex. Shopifys standard), 'saknas'.
export function lageFor(befintliga, onskat) {
  const t = befintliga.find((x) => x.key === 'title');
  const b = befintliga.find((x) => x.key === 'body_html');
  if (!t && !b) return 'saknas';
  if (t?.value !== onskat.title || b?.value !== onskat.body_html) return 'annan';
  if (t?.outdated || b?.outdated) return 'inaktuell';
  return 'lika';
}

// Huvudmallen måste vara vår: bär butikens spårningskedja och sidans adress.
// Annars har någon bytt mallen i admin och vi vet inte vad översättningarna
// ska spegla — stoppa hellre än att lägga elva språk över en främmande mall.
export function arVarMall(body, reg) {
  return typeof body === 'string' && body.includes(sparningsKedja(reg.prefix)) && body.includes(`/pages/${reg.handle}?nummer=`);
}

export async function kor(id, { skarpt = false, omInaktuell = false, klient = null, logg = console.log } = {}) {
  const b = byggButik(id);
  if (!b.oversattningar.length) throw new Error(`${id}: registret (sparning/butiker.json) bär ingen mejl_sprak — inget att översätta.`);
  const idn = b.brand.shopify_mallar ?? {};
  const k = klient ?? (await skapaKlient(lasButik(id)));
  const locales = b.oversattningar.map((o) => o.locale);
  const rapport = { butik: id, tid: new Date().toISOString(), lage: skarpt ? 'skarpt' : 'torr', mallar: {} };
  let fel = 0;

  for (const mallId of Object.keys(idn).length ? Object.keys(idn) : []) {
    const resurs = idn[mallId];
    const las = async () => (await k.graphql(lasFraga(locales), { id: resurs })).translatableResource;
    const r = await las();
    if (!r) throw new Error(`${id}/${mallId}: ${resurs} finns inte i Shopify (translatableResource svarade null).`);
    const bas = Object.fromEntries(r.translatableContent.map((c) => [c.key, c]));
    if (!arVarMall(bas.body_html?.value, b.reg)) {
      throw new Error(`${id}/${mallId}: huvudmallen i Shopify är inte vår (saknar ${b.reg.prefix}-kedjan eller /pages/${b.reg.handle}) — stoppar, rör ingen översättning.`);
    }
    const rad = { resurs, huvud_titel: bas.title?.value, huvud_sha: sha(bas.body_html?.value), sprak: {} };
    const attRegistrera = [];
    for (const o of b.oversattningar) {
      const m = o.mallar.find((x) => x.id === mallId);
      const onskat = { title: m.amne, body_html: m.html };
      const lage = lageFor(r[alias(o.locale)] ?? [], onskat);
      rad.sprak[o.locale] = { fore: lage, sha: sha(m.html), tecken: m.html.length };
      if (!omInaktuell || lage !== 'lika') attRegistrera.push({ locale: o.locale, onskat });
    }
    if (skarpt && attRegistrera.length) {
      const translations = attRegistrera.flatMap(({ locale, onskat }) => [
        { locale, key: 'title', value: onskat.title, translatableContentDigest: bas.title.digest },
        { locale, key: 'body_html', value: onskat.body_html, translatableContentDigest: bas.body_html.digest },
      ]);
      await k.graphql(
        `mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { field message } translations { locale key } } }`,
        { id: resurs, t: translations },
      );
      // Tillbakaläsning: varje språk ska nu vara vårt och aktuellt.
      const efter = await las();
      for (const o of b.oversattningar) {
        const m = o.mallar.find((x) => x.id === mallId);
        const lage = lageFor(efter[alias(o.locale)] ?? [], { title: m.amne, body_html: m.html });
        rad.sprak[o.locale].efter = lage;
        if (lage !== 'lika') fel++;
      }
    }
    rad.registrerade = skarpt ? attRegistrera.map((x) => x.locale) : [];
    rapport.mallar[mallId] = rad;
    const kort = Object.entries(rad.sprak).map(([l, v]) => `${l}:${v.efter ?? v.fore}`).join(' ');
    logg(`${mallId} (${resurs.split('/').pop()}) — ${skarpt ? `${attRegistrera.length} registrerade, ` : ''}${kort}`);
  }
  if (!Object.keys(idn).length) throw new Error(`${id}: mejl/butiker/${id}.json saknar shopify_mallar (notisernas EmailTemplate-id).`);
  rapport.fel = fel;
  return rapport;
}

const arDirekt = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (arDirekt) {
  const args = process.argv.slice(2);
  const id = args.find((a) => !a.startsWith('--')) ?? 'matstrumpor';
  const skarpt = args.includes('--skarpt');
  const rapport = await kor(id, { skarpt, omInaktuell: args.includes('--om-inaktuell') });
  const antalReg = Object.values(rapport.mallar).reduce((s, m) => s + m.registrerade.length, 0);
  // Filen skrivs bara när något registrerades: spårningsrutinen kör skriptet
  // varje timme och får aldrig lämna en smutsig arbetskopia (git pull --rebase).
  if (skarpt && antalReg) {
    const ut = join(ROT, 'output', 'butiker', id, 'oversattningar');
    mkdirSync(ut, { recursive: true });
    writeFileSync(join(ut, 'lage.json'), `${JSON.stringify(rapport, null, 1)}\n`);
  }
  const antal = antalReg;
  console.log(
    skarpt
      ? rapport.fel
        ? `❌ ${rapport.fel} språk stämde inte vid tillbakaläsningen.`
        : antal
          ? `✅ ${antal} översättningar registrerade, alla lästa tillbaka lika och aktuella.`
          : '✅ Alla språk var redan våra och aktuella — inget registrerat.'
      : 'Torrt — inget skrivet. Kör med --skarpt för att registrera.',
  );
  process.exit(rapport.fel ? 1 : 0);
}
