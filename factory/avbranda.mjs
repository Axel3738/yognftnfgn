// avbranda.mjs — tvättar bort bas-temats ursprungsbutik ur en OPS-butiks tema.
//
//   node factory/avbranda.mjs <butik-id> [--torr]
//
// `ops-tema.zip` är exporterat från Matstrumpor. Strukturen är det vi vill ha;
// texten är det vi INTE vill ha. Fabriken skrev om produktmallen och
// startsidan, men inte footern, inte butiksinställningarna och inte
// sektionernas defaults — så varje ny butik ärvde Matstrumpors bolagsblock,
// deras supportmejl, deras logga och deras Instagram tills en människa råkade
// se det (Axels bakläxa 2026-09-09 på DryTrek).
//
// Steget är en REGELTABELL, inte en engångsfix: samma körning tvättar varje
// ny butik. Kör `factory/kallskanning-kor.mjs` efteråt — rapporten ska vara tom.
//
// ⚠️ Två av fynden syns INTE i källskanningen men är precis lika fel:
// `brand_image` pekar på Matstrumpors logga (en fil som inte ens finns i den
// nya butiken) och `social_facebook_link` på deras Facebook-sida. Ingen av dem
// innehåller ordet "matstrumpor". Skanningen är ett golv, inte ett tak.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql, hamtaArbetstema, skrivTemafiler, verifieraTemafiler } from './shopify.mjs';
import { hamtaAllaTemafiler } from './kallskanning-kor.mjs';
import { skannaTema, rapport } from './kallskanning.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

// Reglerna. Varje rad: [regex, ersättning eller funktion av butiken].
// Ordningen spelar roll — mejlen först, annars äter domänregeln upp den.
export function byggRegler(butik) {
  const b = butik.butik;
  const doman = (b.supportmail ?? '').split('@')[1] ?? `${b.id}.se`;
  const brand = b.brand;

  return [
    // 1. Supportmejlen — måste före domänregeln.
    [/kundsupport@matstrumpor\.se/gi, b.supportmail],
    // 2. Domänen i löptext och länkar.
    [/matstrumpor\.se/gi, doman],
    // 3. Brandnamnet.
    [/Matstrumpor/g, brand],
    [/matstrumpor/g, brand.toLowerCase()],
    // 4. Produktord ur källbutikens sortiment, i defaults och kommentarer.
    //    De beskriver strumpor och blir nonsens i varje annan butik.
    [/Sushi-Strumpor: "3 - Par"\n\s*och "5 - Par"/g, 'en produkt med paketvarianter'],
    [/\(t\.ex\. Sushi-Strumpor/gi, '(t.ex. en produkt'],
    [/sushi-strumpor/gi, 'exempelprodukt'],
    [/Strumporna är stretchiga — hamnar du mellan två storlekar fungerar båda\./g,
      'Passar de flesta — hamnar du mellan två storlekar fungerar båda.'],
    [/ger `bogo` strumpor/g, 'ger `bogo` varor'],
    [/Produkten har bara en variant \(Pizza, Hamburgare, Donut\)\./g,
      'Produkten har bara en variant.'],
    [/\bstrumporna\b/gi, 'varorna'],
    [/\bstrumpan\b/gi, 'varan'],
    [/\bstrumpor\b/gi, 'varor'],
  ];
}

// Inställningar som pekar på källbutiken utan att nämna den vid namn.
// Skanningen hittar dem aldrig — de måste nollas explicit.
export function stadaSettings(text, butik) {
  const b = butik.butik;
  const j = JSON.parse(String(text).replace(/^\s*\/\*[\s\S]*?\*\//, ''));
  const c = j.current ?? {};

  c.brand_description = `<p>${butik.branding?.positionering ?? b.brand}</p>`;
  // Loggan är källbutikens fil och finns inte ens i den nya butiken.
  c.brand_image = '';
  // Sociala länkar ärvs ALDRIG — en ny butik har inga konton, och att peka
  // kunden till källbutikens Instagram är värre än att inte peka alls.
  for (const k of Object.keys(c)) if (/^social_.*_link$/.test(k)) c[k] = '';

  // Presetnamnet bär källbutikens namn i temaväljaren.
  if (j.presets && j.presets.Matstrumpor && !j.presets[b.brand]) {
    j.presets[b.brand] = j.presets.Matstrumpor;
    delete j.presets.Matstrumpor;
  }
  j.current = c;
  return JSON.stringify(j, null, 2);
}

// Footerns bolagsblock. Skrivs alltid om — det är butikens juridiska text.
export function byggFooterblock(butik) {
  const b = butik.butik;
  const doman = (b.supportmail ?? '').split('@')[1] ?? '';
  return (
    `<p>${doman} drivs av<br/>${b.bolagsnamn}<br/>Org.nr ${b.orgnr}</p>` +
    `<p>${b.supportmail}</p>`
  );
}

export function tillampa(filnamn, innehall, butik) {
  if (filnamn === 'config/settings_data.json') {
    innehall = stadaSettings(innehall, butik);
  }
  if (filnamn === 'sections/footer-group.json') {
    // ⚠️ Regex duger INTE här. Originalets subtext innehåller escapade
    // citattecken (länken till /pages/om-oss), så ett `"[^"]*"`-mönster
    // klipper mitt i strängen och lämnar trasig JSON — Shopify svarar
    // "Invalid JSON in sections/footer-group.json" (mätt 2026-09-09).
    // Parsa i stället. /pages/om-oss finns inte i en OPS-butik, så länken
    // faller bort med resten av blocket.
    const j = JSON.parse(String(innehall).replace(/^\s*\/\*[\s\S]*?\*\//, ''));
    for (const sek of Object.values(j.sections ?? {})) {
      for (const block of Object.values(sek.blocks ?? {})) {
        if (typeof block?.settings?.subtext === 'string') {
          block.settings.subtext = byggFooterblock(butik);
        }
      }
    }
    innehall = JSON.stringify(j, null, 2);
  }
  let ut = innehall;
  for (const [re, ers] of byggRegler(butik)) ut = ut.replace(re, ers);
  return ut;
}

if (process.argv[1] && process.argv[1].endsWith('avbranda.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const butikId = arg.find((a) => !a.startsWith('--'));
  const torr = arg.includes('--torr');
  if (!butikId) throw new Error('Ange butiks-id: node factory/avbranda.mjs <butik-id>');

  const butik = lasYaml(readFileSync(join(ROT, 'butiker', `${butikId}.yaml`), 'utf8'));
  const tema = await hamtaArbetstema();
  if (!tema) throw new Error('Inget utkasttema.');

  const filer = await hamtaAllaTemafiler(tema.id);
  console.log(`${tema.name}: ${Object.keys(filer).length} filer lästa`);

  const fore = skannaTema(filer);
  console.log(`Före: ${fore.traffar.length} rader med källtext`);

  const andrade = {};
  for (const [namn, innehall] of Object.entries(filer)) {
    const nytt = tillampa(namn, innehall, butik);
    if (nytt !== innehall) andrade[namn] = nytt;
  }

  console.log(`\n${Object.keys(andrade).length} filer ska skrivas om:`);
  for (const n of Object.keys(andrade)) console.log(`   ${n}`);

  if (torr) {
    const efter = skannaTema({ ...filer, ...andrade });
    console.log(`\n(torrkörning) Efter: ${efter.traffar.length} rader kvar`);
    console.log(rapport(efter));
    process.exit(0);
  }

  // Skriv i omgångar — themeFilesUpsert tar inte hur många som helst.
  //
  // ⚠️ config/settings_data.json går INTE att byte-verifiera. Shopify skriver
  // om filen när den tas emot (normaliserar och stryker fält), så storleken
  // skiljer sig alltid — 9 691 byte i temat mot 13 070 lokalt, mätt
  // 2026-09-09. Den filen verifieras på INNEHÅLL i stället, av
  // slutskanningen längst ned.
  const BYTEUNDANTAG = new Set(['config/settings_data.json']);
  const namn = Object.keys(andrade);
  for (let i = 0; i < namn.length; i += 10) {
    const bit = Object.fromEntries(namn.slice(i, i + 10).map((n) => [n, andrade[n]]));
    await skrivTemafiler(tema.id, bit);
    const attVerifiera = Object.fromEntries(
      Object.entries(bit).filter(([n]) => !BYTEUNDANTAG.has(n))
    );
    const avvik = Object.keys(attVerifiera).length
      ? await verifieraTemafiler(tema.id, attVerifiera)
      : [];
    if (avvik.length > 0) throw new Error(`Skrivningen tog inte: ${avvik.join('; ')}`);
    console.log(`   ✅ ${Object.keys(bit).length} filer skrivna och tillbakalästa`);
  }

  const efterFiler = await hamtaAllaTemafiler(tema.id);
  const efter = skannaTema(efterFiler);
  console.log('\n' + rapport(efter));
  process.exit(efter.rent ? 0 : 1);
}
