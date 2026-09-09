// avbranda.mjs — tvättar bort bas-temats ursprungsbutik ur en OPS-butiks tema.
//
//   avbranda(ctx, temaId, { torr }) → { borttagnaSektioner, omskrivnaFiler, kvar }
//   node factory/avbranda.mjs <butik-id> [--torr] [--tema <id>]
//
// `ops-tema.zip` är exporterat från Matstrumpor. Strukturen är det vi vill ha;
// texten är det vi INTE vill ha. Fabriken skrev om produktmallen och
// startsidan, men inte footern, inte butiksinställningarna och inte
// sektionernas defaults — så varje ny butik ärvde Matstrumpors bolagsblock,
// deras supportmejl, deras logga och deras Instagram tills en människa råkade
// se det (Axels bakläxa 2026-09-09 på DryTrek).
//
// Steget är en REGELTABELL, inte en engångsfix: samma körning tvättar varje
// ny butik, i tre lager (KEDJAN.md, steget `avbrandning`):
//
//   1. Sektionsgrupperna (footer-group.json + header-group.json):
//      kallskanning.avbrandaSektionsgrupp — ms-skrapkort/ms-cookies bort,
//      newsletter_enable av, källbutikens annonsblock bort. Fabrikens egna
//      annonsrader (tema.annonsrader) rörs aldrig.
//   2. Textreglerna på ALLA temafiler (byggRegler). Två grupper: de som är
//      entydiga källmarkörer (brand, mejl, domän, logga, citat) körs överallt;
//      produktorden ("strumpor" → "varor") körs BARA i Liquid/JS/CSS — i JSON-
//      mallarna kan de träffa butikens egen copy ("torra strumpor" är en
//      giltig nytta för DryTrek, Axel 2026-09-09).
//   3. Temainställningarna (settings_data.json): tema.rensaSettings —
//      sociala länkar, brand_description, logga, app-inbäddningar — plus
//      presetnamnet.
//
// Efteråt skannas temat igen (kallskanning) — `kvar` ska vara tom.
//
// ⚠️ Två av fynden syns INTE i källskanningen men är precis lika fel:
// `brand_image` pekar på Matstrumpors logga (en fil som inte ens finns i den
// nya butiken) och `social_facebook_link` på deras Facebook-sida. Ingen av dem
// innehåller ordet "matstrumpor". Skanningen är ett golv, inte ett tak.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { lasState } from './state.mjs';
import { hamtaArbetstema, hamtaTemafil, skrivTemafiler, verifieraTemafiler } from './shopify.mjs';
import { hamtaAllaTemafiler } from './kallskanning-kor.mjs';
import { skannaTema, rapport, avbrandaSektionsgrupp, tackning } from './kallskanning.mjs';
import { rensaSettings, annonsrader, lasTemaJson } from './tema.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const eskapa = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Reglerna. Varje rad: [regex, ersättning]. Ersättningen ges som funktion så
// ett brandnamn med "$" aldrig tolkas som en replace-mall.
// Ordningen spelar roll — mejlen först, annars äter domänregeln upp den;
// de hela citaten före de generiska orden.
//
//   alla    körs på varje fil (entydiga källmarkörer)
//   liquid  körs bara på .liquid/.js/.css (källbutikens produktord i
//           schema-defaults, kommentarer och fallbacks)
export function byggRegler(butik) {
  const b = butik?.butik ?? {};
  const brand = text(b.brand) ?? 'Butiken';
  const supportmail = text(b.supportmail) ?? '';
  const doman = supportmail.split('@')[1] ?? `${b.id ?? 'butiken'}.se`;
  // Flerproduktsbutik: butikens kollektion. Enproduktsbutik: Shopifys "all".
  const kollektion = text(b.kollektion?.handle) ?? 'all';
  const r = (re, ers) => [re, () => ers];

  const alla = [
    // 0. Platshållaren ur det RENSADE bas-temat (factory/rensa-kalla.mjs).
    //    Källan bär inte längre någon riktig adress — den bär SUPPORTMEJL,
    //    och här får den butikens egen. Utan den här raden renderas ett tomt
    //    mailto, vilket är en trasig länk i kundens vy.
    r(/SUPPORTMEJL/g, supportmail),
    // 1. Supportmejlen — måste före domänregeln.
    //    Behålls för butiker som byggdes ur det OSTÄDADE temat (HeimGuard,
    //    TankGuard, TackleBay, DryTrek). Den blir en no-op på nya butiker.
    r(/kundsupport@matstrumpor\.se/gi, supportmail),
    // 2. Domänen i löptext och länkar.
    r(/matstrumpor\.se/gi, doman),
    // 3. Hela citaten ur startsidan/inställningarna — före brandnamnet, som
    //    annars gör dem till "<Brand> som ser ut som mat".
    r(/Strumpor som ser ut som mat/gi, brand),
    r(/Strumpor man aldrig blandar ihop/gi, brand),
    // 4. Brandnamnet (även i filnamn som matstrumpor_61_dorrmattan.jpg).
    r(/Matstrumpor/g, brand),
    r(/matstrumpor/gi, brand.toLowerCase()),
    // 5. Källbutikens produkthandle — i mallar, kommentarer och exempel — och
    //    deras kollektion (länken gav 404 i varje ny butik). Snedstrecket kan
    //    vara JSON-escapat; det behålls som det står.
    r(/sushi-strumpor/gi, 'exempelprodukt'),
    [/(collections\\?\/)strumporna/gi, (_, p1) => `${p1}${kollektion}`],
    r(/"collection":\s*"strumporna"/g, `"collection":"${kollektion}"`),
    // 6. Presentbutikens löften i ikon-listor ("gift:…|star:…") och som text.
    r(/\|gift:Levereras presentklart/gi, ''),
    r(/gift:Levereras presentklart\|?/gi, ''),
    r(/\|star:Älskad av tusentals svenskar/gi, ''),
    r(/star:Älskad av tusentals svenskar\|?/gi, ''),
    r(/\|Levereras presentklart/gi, ''),
    r(/Levereras presentklart\|/gi, ''),
    r(/Levereras presentklart/gi, ''),
    r(/\|Älskad av tusentals svenskar/gi, ''),
    r(/Älskad av tusentals svenskar\|/gi, ''),
    r(/Älskad av tusentals svenskar/gi, ''),
    r(/Presenten som alltid landar rätt/gi, 'Vad kunderna säger'),
    // 7. Sockstorleksguiden i FAQ-defaults (blocks/ms-faq.liquid, index.json).
    r(/Passar de alla\?::En storlek passar de flesta, ungefär strl 36–44\.\|Hur snabbt kommer de\?::5–10 arbetsdagar med fri frakt inom Sverige\./g, ''),
    r(/En storlek passar de flesta, ungefär strl 36–44\./gi, ''),
    r(/,? ?ungefär strl 36–44/gi, ''),
    r(/strl 36–44/gi, ''),
    r(/En storlek passar de flesta/gi, 'Passar de flesta'),
    // 8. Källbutikens logga i Files och deras Facebook-sida. Snedstrecken kan
    //    vara JSON-escapade (minifierad settings_data).
    r(/shopify:\\?\/\\?\/shop_images\\?\/Namnlos_design_-_2026-03-19T120925\.579\.png/gi, ''),
    r(/Namnlos_design_-_2026-03-19T120925\.579/gi, ''),
    r(/https?:\\?\/\\?\/(?:www\.)?facebook\.com\\?\/profile\.php\?id=61584643820493\\?\/?/gi, ''),
    r(/profile\.php\?id=61584643820493/gi, ''),
  ];

  const liquid = [
    // Produktord ur källbutikens sortiment, i defaults och kommentarer.
    // De beskriver strumpor och blir nonsens i varje annan butik.
    r(/exempelprodukt: "3 - Par"\n\s*och "5 - Par"/g, 'en produkt med paketvarianter'),
    r(/\(t\.ex\. exempelprodukt/gi, '(t.ex. en produkt'),
    r(/Strumporna är stretchiga — hamnar du mellan två storlekar fungerar båda\./g,
      'Passar de flesta — hamnar du mellan två storlekar fungerar båda.'),
    r(/ger `bogo` strumpor/g, 'ger `bogo` varor'),
    r(/Produkten har bara en variant \(Pizza, Hamburgare, Donut\)\./g, 'Produkten har bara en variant.'),
    r(/\bstrumporna\b/gi, 'varorna'),
    r(/\bstrumpan\b/gi, 'varan'),
    r(/\bstrumpor\b/gi, 'varor'),
  ];

  return Object.assign([...alla, ...liquid], { alla, liquid });
}

const LIQUIDFIL = /\.(liquid|js|css)$/i;

function korRegler(innehall, regler) {
  let ut = String(innehall);
  for (const [re, ers] of regler) ut = ut.replace(re, ers);
  return ut;
}

// Inställningar som pekar på källbutiken utan att nämna den vid namn.
// Skanningen hittar dem aldrig — de måste nollas explicit. Själva
// rensningen är tema.rensaSettings (kontraktet); här läggs presetnamnet
// till, som bär källbutikens namn i temaväljaren.
export function stadaSettings(innehall, butik, alternativ = {}) {
  const j = lasTemaJson(innehall);
  const rent = rensaSettings(j, { butik, ...alternativ });
  const brand = text(butik?.butik?.brand);
  if (brand && rent.presets && rent.presets.Matstrumpor && !rent.presets[brand]) {
    rent.presets[brand] = rent.presets.Matstrumpor;
    delete rent.presets.Matstrumpor;
  }
  return `${JSON.stringify(rent, null, 2)}\n`;
}

// Footerns bolagsblock. Skrivs alltid om — det är butikens juridiska text.
// Samma rad som startsida.byggFooterGroup skriver, så de kan inte säga olika.
export function byggFooterblock(butik) {
  const b = butik?.butik ?? {};
  return (
    `<p>${eskapa(text(b.brand) ?? '')} drivs av<br/>${eskapa(text(b.bolagsnamn) ?? '')}<br/>Org.nr ${eskapa(text(b.orgnr) ?? '')}</p>` +
    `<p>${eskapa(text(b.supportmail) ?? '')}</p>`
  );
}

// En fil genom alla tre lagren. Ren logik: returnerar { innehall, borttaget }.
export function tillampa(filnamn, innehall, butik, alternativ = {}) {
  const regler = byggRegler(butik);
  const borttaget = [];
  let ut = String(innehall);

  if (filnamn === 'config/settings_data.json') {
    ut = stadaSettings(ut, butik, alternativ.settings ?? {});
  }

  if (filnamn === 'sections/footer-group.json' || filnamn === 'sections/header-group.json') {
    // ⚠️ Regex duger INTE här. Originalets subtext innehåller escapade
    // citattecken (länken till /pages/om-oss), så ett `"[^"]*"`-mönster
    // klipper mitt i strängen och lämnar trasig JSON — Shopify svarar
    // "Invalid JSON in sections/footer-group.json" (mätt 2026-09-09).
    // Parsa i stället. /pages/om-oss finns inte i en OPS-butik, så länken
    // faller bort med resten av blocket.
    const { json, borttaget: bort } = avbrandaSektionsgrupp(lasTemaJson(ut), { behall: annonsrader(butik) });
    borttaget.push(...bort.map((x) => `${filnamn}: ${x}`));
    if (filnamn === 'sections/footer-group.json') {
      for (const sek of Object.values(json.sections ?? {})) {
        for (const block of Object.values(sek.blocks ?? {})) {
          if (block?.type === 'text' && typeof block?.settings?.subtext === 'string') {
            block.settings.subtext = byggFooterblock(butik);
          }
        }
      }
    }
    ut = `${JSON.stringify(json, null, 2)}\n`;
  }

  ut = korRegler(ut, LIQUIDFIL.test(filnamn) ? regler : regler.alla);
  return { innehall: ut, borttaget };
}

// Alla filer genom tillampa. Ren logik — det avbranda() gör mot nätverket.
export function avbrandaFiler(filer, butik, alternativ = {}) {
  const andrade = {};
  const borttagnaSektioner = [];
  for (const [namn, innehall] of Object.entries(filer)) {
    const { innehall: nytt, borttaget } = tillampa(namn, innehall, butik, alternativ);
    borttagnaSektioner.push(...borttaget);
    if (nytt !== innehall) andrade[namn] = nytt;
  }
  return { andrade, borttagnaSektioner };
}

// Shopify skriver om JSON-filer när de tas emot (normaliserar, och för
// config/settings_data.json stryker den fält utan schema) — storleken
// skiljer sig alltid: 9 691 byte i temat mot 13 070 lokalt, mätt 2026-09-09.
// Därför: byte-verifiering för Liquid/JS/CSS, VÄRDE-verifiering (tolkad JSON)
// för mallar och sektionsgrupper, och settings_data verifieras på innehåll
// av slutskanningen.
const VARDEVERIFIERAS = /\.json$/i;
const BYTEUNDANTAG = new Set(['config/settings_data.json']);

function likaJson(a, b) {
  const norm = (v) => JSON.stringify(sortera(v));
  return norm(a) === norm(b);
}
function sortera(v) {
  if (Array.isArray(v)) return v.map(sortera);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortera(v[k])]));
  return v;
}

async function skrivOchVerifiera(temaId, andrade) {
  const namn = Object.keys(andrade);
  for (let i = 0; i < namn.length; i += 10) {
    const bit = Object.fromEntries(namn.slice(i, i + 10).map((n) => [n, andrade[n]]));
    await skrivTemafiler(temaId, bit);
    const byte = Object.fromEntries(Object.entries(bit).filter(([n]) => !VARDEVERIFIERAS.test(n) && !BYTEUNDANTAG.has(n)));
    const fel = Object.keys(byte).length > 0 ? [...(await verifieraTemafiler(temaId, byte))] : [];
    for (const n of Object.keys(bit).filter((x) => VARDEVERIFIERAS.test(x) && !BYTEUNDANTAG.has(x))) {
      const tillbaka = await hamtaTemafil(temaId, n);
      try {
        if (!likaJson(lasTemaJson(tillbaka), lasTemaJson(bit[n]))) fel.push(`${n}: innehållet i temat skiljer sig från det skrivna`);
      } catch (e) {
        fel.push(`${n}: gick inte att tolka efter uppladdning (${e.message})`);
      }
    }
    if (fel.length > 0) throw new Error(`Skrivningen tog inte: ${fel.join('; ')}`);
  }
}

// Kontraktet (KEDJAN.md): avbranda(ctx, temaId, { torr }) →
// { borttagnaSektioner, omskrivnaFiler, kvar }. `ctx.butik` är butiksfilen
// (ett rent butiksobjekt tas också emot). Temat är alltid det givna id:t
// (regel 1) — hamtaArbetstema faller bara tillbaka på CRO-temat utan id.
export async function avbranda(ctx, temaId, { torr = false, settings = {} } = {}) {
  const butik = ctx?.butik?.butik ? ctx.butik : ctx;
  if (!butik?.butik?.brand) throw new Error('avbranda: ctx.butik saknar butik.brand — läs butiksfilen först.');
  const tema = await hamtaArbetstema(temaId ?? null);

  const filer = await hamtaAllaTemafiler(tema.id);
  const fore = skannaTema(filer);
  const { andrade, borttagnaSektioner } = avbrandaFiler(filer, butik, { settings });
  const omskrivnaFiler = Object.keys(andrade);
  const { lasta, saknade } = tackning(filer);

  if (torr) {
    const efter = skannaTema({ ...filer, ...andrade });
    return { temaId: tema.id, temaNamn: tema.name, torr: true, fore: fore.traffar.length, borttagnaSektioner, omskrivnaFiler, kvar: efter.traffar, lasta, saknade };
  }

  if (omskrivnaFiler.length > 0) await skrivOchVerifiera(tema.id, andrade);

  // Slutskanningen läser om ALLT ur temat — det är den som verifierar
  // settings_data.json, och den som avgör om steget är grönt.
  const efter = skannaTema(await hamtaAllaTemafiler(tema.id));
  return { temaId: tema.id, temaNamn: tema.name, torr: false, fore: fore.traffar.length, borttagnaSektioner, omskrivnaFiler, kvar: efter.traffar, lasta, saknade };
}

// ---------------------------------------------------------------------------
if (process.argv[1] && /[\\/]avbranda\.mjs$/.test(process.argv[1])) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const varde = (flagga) => (arg.includes(flagga) ? arg[arg.indexOf(flagga) + 1] : null);
  const flaggvarden = new Set([varde('--tema')].filter(Boolean));
  const butikId = arg.find((a) => !a.startsWith('--') && !flaggvarden.has(a));
  const torr = arg.includes('--torr');
  if (!butikId) throw new Error('Ange butiks-id: node factory/avbranda.mjs <butik-id> [--torr] [--tema <id>]');
  const butiksfil = join(ROT, 'butiker', `${butikId}.yaml`);
  if (!existsSync(butiksfil)) throw new Error(`Ingen butiksfil: factory/butiker/${butikId}.yaml`);
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));

  const state = lasState(butikId, '_butik');
  const temaIdUrState =
    state.steg?.['tema-upload']?.arbetstemaId ?? state.steg?.['tema-upload']?.temaId ?? state.steg?.tema?.temaId ?? null;

  const r = await avbranda({ butik }, varde('--tema') ?? temaIdUrState, { torr });
  console.log(`${r.temaNamn}: ${r.fore} rader med källtext före${torr ? ' (torrkörning)' : ''}`);
  console.log(`\n${r.borttagnaSektioner.length} källsektioner/-inställningar/-annonser bort:`);
  for (const s of r.borttagnaSektioner) console.log(`   ${s}`);
  console.log(`\n${r.omskrivnaFiler.length} filer ${torr ? 'skulle skrivas om' : 'omskrivna och tillbakalästa'}:`);
  for (const n of r.omskrivnaFiler) console.log(`   ${n}`);
  console.log(`\n  kända smittade filer lästa: ${r.lasta.join(', ') || '(inga)'}`);
  if (r.saknade.length > 0) console.log(`  ⚠️ fanns inte i temat: ${r.saknade.join(', ')}`);
  console.log('\n' + rapport({ rent: r.kvar.length === 0, traffar: r.kvar }));
  process.exit(r.kvar.length === 0 ? 0 : 1);
}
