#!/usr/bin/env node
// rensa-kalla.mjs — rensar Matstrumpor ur BAS-TEMAT en gång för alla.
//
//   node factory/rensa-kalla.mjs --torr    visa vad som skulle ändras
//   node factory/rensa-kalla.mjs           skriv om factory/tema/ops-tema.zip
//
// VARFÖR (Axel 2026-09-09, om TackleBays förhandsvisning): "Matstrumpor email
// popup är liksom kvar samt cookie förfrågan, det är verkligen horribelt."
//
// Han har rätt, och det är inte butikens fel — det är KÄLLANS. `ops-tema.zip`
// är exporterad från Matstrumpor, och varje ny OPS-butik ärver därför:
//
//   sections/footer-group.json   ms_skrapkort (e-postpopupen) + ms_cookies
//   config/settings_data.json    deras Facebook, Instagram, brand_description,
//                                logo och brand_image
//   templates/index.json         deras kollektion (strumporna), deras produkt
//                                (sushi-strumpor) och FYRA RIKTIGA KUNDERS
//                                recensioner (Wide Pia, Jonas, Gittan, Annika)
//
// `factory/avbranda.mjs` städar det vid varje bygge, men det är en plåstring:
// en körning som avbryts före det steget lämnar en butik med en annan firmas
// popup och en annan firmas kunder. AVBRANDNING.md kallade den här filen
// "rensa KÄLLAN" och den blev aldrig skriven. Nu är den det.
//
// ⚠️ Rör ALDRIG assets/ms-paket.js. Den ägs av fabriken (tema.mjs TEMAFILER)
// och ett test kräver att zip:ens kopia är byte-identisk med källfilen.
//
// ⚠️ `ms-`-prefixet betyder INTE "Matstrumpor-skräp". ms-usp-bar,
// ms-faq-section, ms-guarantee-section, ms-marquee, ms-sticky-atc,
// ms-app-slot, ms-bundle-products och ms-compare är husets EGNA CRO-block.
// Bara skrapkortet och cookierutan ska bort.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
const ZIP = join(ROT, 'factory', 'tema', 'ops-tema.zip');
const TORR = process.argv.includes('--torr');

/** Sektioner som ska ut ur sektionsgrupperna. Skrapkortet är Matstrumpors
 *  e-postklubb (byter rabattkod mot mejladress) och cookierutan deras. */
export const UT_UR_GRUPPER = ['ms-skrapkort', 'ms-cookies'];

/** Sektionsfiler som tas bort HELT ur källan, inte bara ur grupperna.
 *
 *  `ms-skrapkort.liquid` är källbutikens e-postklubb: den byter en rabattkod
 *  mot en mejladress och driver den via deras Klaviyo. Den hör till en annan
 *  firmas kampanj, inte till fabriken. Ligger filen kvar kan den läggas
 *  tillbaka med ett klick i temaredigeraren, och den bär deras verktyg.
 *
 *  `ms-cookies.liquid` får ligga kvar: en cookieruta är generisk, filen bär
 *  inget brandnamn, och den renderas inte längre eftersom den är ute ur
 *  sektionsgruppen. */
export const TA_BORT_FILER = ['sections/ms-skrapkort.liquid'];

/** Inställningar som bär källbutikens identitet. Tomma, inte borttagna —
 *  Shopify vill ha nycklarna kvar, och brandsteget fyller dem per butik. */
export const TOMMA_INSTALLNINGAR = [
  'social_facebook_link', 'social_instagram_link', 'social_twitter_link',
  'social_tiktok_link', 'social_youtube_link', 'social_pinterest_link',
  'social_snapchat_link', 'social_tumblr_link', 'social_vimeo_link',
  'brand_description', 'brand_headline', 'logo', 'brand_image', 'favicon',
];

/** Tar bort en sektion ur en sektionsgrupp, både ur `sections` och `order`. */
export function rensaSektionsgrupp(json, typerAttTaBort = UT_UR_GRUPPER) {
  const d = typeof json === 'string' ? JSON.parse(json) : structuredClone(json);
  const bort = [];
  for (const [id, sek] of Object.entries(d.sections || {})) {
    if (typerAttTaBort.includes(sek?.type)) { delete d.sections[id]; bort.push(`${id} (${sek.type})`); }
  }
  // Nyhetsbrevet är INGEN sektion — det är en inställning på footer-sektionen.
  // Därför överlevde det när skrapkortet togs bort, och skanningen hittade det
  // efteråt. Det är källbutikens e-postklubb och ska vara av från början.
  for (const sek of Object.values(d.sections || {})) {
    const s = sek?.settings;
    if (!s) continue;
    if (s.newsletter_enable) { s.newsletter_enable = false; bort.push('footer.newsletter_enable → false'); }
    if (s.newsletter_heading) { s.newsletter_heading = ''; bort.push('footer.newsletter_heading → tom'); }
  }
  if (Array.isArray(d.order)) d.order = d.order.filter((id) => id in (d.sections || {}));
  return { json: d, borttaget: bort };
}

/** Tömmer källbutikens identitet ur settings_data.json. */
export function rensaInstallningar(json) {
  const d = typeof json === 'string' ? JSON.parse(json) : structuredClone(json);
  const c = d.current || {};
  const tomda = [];
  for (const nyckel of TOMMA_INSTALLNINGAR) {
    if (c[nyckel]) { tomda.push(`${nyckel} = ${String(c[nyckel]).slice(0, 60)}`); c[nyckel] = ''; }
  }
  // Nyhetsbrevet i sidfoten är källbutikens e-postklubb, inte husets.
  if (c.newsletter_enable) { c.newsletter_enable = false; tomda.push('newsletter_enable = true'); }
  // Presetnamnet läcker källbutikens namn in i temaredigeraren.
  if (d.preset) { tomda.push(`preset = ${d.preset}`); delete d.preset; }
  if (c.preset) { tomda.push(`current.preset = ${c.preset}`); delete c.preset; }
  // Presetens NYCKEL är också källbutikens namn ("Matstrumpor"). Den syns i
  // temaredigerarens presetväljare. Döps om, inte bort — Shopify vill ha minst
  // en preset.
  if (d.presets && typeof d.presets === 'object') {
    for (const nyckel of Object.keys(d.presets)) {
      if (nyckel !== 'OPS') {
        d.presets.OPS = d.presets[nyckel];
        delete d.presets[nyckel];
        tomda.push(`presets["${nyckel}"] → presets["OPS"]`);
      }
    }
  }
  // App-embeds: BARA Judge.me får följa med. Klaviyo är källbutikens
  // e-postverktyg — samma verktyg som driver popupen Axel såg. Den appen är
  // inte ens installerad i en ny butik, så referensen är död OCH fel firma.
  const blocks = c.blocks;
  if (blocks && typeof blocks === 'object') {
    for (const [id, blk] of Object.entries(blocks)) {
      const typ = String(blk?.type ?? '');
      if (typ && !/judge-?me/i.test(typ)) {
        delete blocks[id];
        tomda.push(`app-embed ${typ.split('/').slice(0, 3).join('/')}`);
      }
    }
  }
  d.current = c;
  return { json: d, tomda };
}

/** Löften och påståenden som tillhör KÄLLBUTIKEN, inte fabriken.
 *
 *  De står i pipe-separerade listor (USP-raden, marquee, annonsraden) och i
 *  FAQ:n. Tre sorter, alla lika fel i en ny butik:
 *
 *   • PRESENTLÖFTEN  "Levereras presentklart", "Presenten som alltid landar
 *     rätt" — källbutiken säljer presenter, OPS-butiken säljer en pryl.
 *   • FALSKT SOCIALT BEVIS  "Älskad av tusentals svenskar". En butik som
 *     öppnade i förrgår har inga tusentals kunder. Det är inte bara fel
 *     brand, det är ett påstående som inte är sant.
 *   • KÄLLANS VILLKOR  "Fri frakt i hela Sverige", "30 dagars öppet köp" —
 *     samma sorts fel som i annonserna: ett löfte butiken kanske inte håller.
 *     OPS-butikerna har 14 dagars ångerrätt enligt lag. Villkoren skrivs av
 *     frakt.mjs och policyer.mjs ur butikens EGEN konfig.
 *   • STRUMPSTORLEKAR  "En storlek passar de flesta", "Strl 36–44" i FAQ:n
 *     och produktmallen.
 */
export const KALLANS_LOFTEN = [
  'Levereras presentklart',
  'Älskad av tusentals svenskar',
  'Presenten som alltid landar rätt',
  'Fri frakt i hela Sverige',
  'Fri frakt i Sverige',
  '30 dagars öppet köp',
  'En storlek passar de flesta',
  'Strl 36–44',
];

const arLofte = (rad, loften) => {
  // Ikonprefixet hör till listan, inte till löftet: `gift:Levereras presentklart`.
  const text = String(rad).replace(/^\s*[a-z_-]+:/i, '').trim().toLowerCase();
  return loften.some((l) => text === l.toLowerCase() || text.includes(l.toLowerCase()));
};

/** Rensar källans löften ur ETT pipe-separerat värde.
 *
 *  Listan hanteras som en LISTA — inte som text. Ett textutbyte lämnade
 *  `refresh:` kvar som ett ensamt ikonprefix när löftet efter kolonet togs
 *  bort, och ett halvt listelement är värre än hela. */
export function rensaPipelista(varde, loften = KALLANS_LOFTEN) {
  if (!varde.includes('|')) return arLofte(varde, loften) ? '' : varde;
  return varde.split('|').filter((rad) => rad.trim() && !arLofte(rad, loften)).join('|');
}

/** Tar bort MENINGEN som bär löftet ur löpande text.
 *
 *  "En storlek passar de flesta. Strl 36–44." blev ". ." med ett rakt
 *  textutbyte. Skiljetecknet hör till meningen som försvinner. */
export function rensaMening(text, loften = KALLANS_LOFTEN) {
  let ut = text;
  for (const l of loften) {
    const esc = l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Meningen: löftet plus allt fram till nästa punkt/utrop/frågetecken,
    // och det efterföljande mellanslaget.
    ut = ut.replace(new RegExp(`\\s*${esc}[^.!?"]*[.!?]?\\s*`, 'gi'), ' ');
  }
  return ut.replace(/\s{2,}/g, ' ').replace(/\s+([.,!?])/g, '$1').trim();
}

/** Tar bort källans löften ur en hel fil: pipe-listor som listor, löpande
 *  text som meningar. Rör bara innehållet i citerade strängar, så JSON och
 *  Liquid-strukturen står kvar. */
export function taBortLoften(text, loften = KALLANS_LOFTEN) {
  const bar = (s) => loften.some((l) => s.toLowerCase().includes(l.toLowerCase()));
  return text.replace(/"((?:[^"\\]|\\.)*)"/g, (hel, inne) => {
    if (!bar(inne)) return hel;
    const rensat = inne.includes('|') ? rensaPipelista(inne, loften) : rensaMening(inne, loften);
    return `"${rensat}"`;
  });
}

/** Byter källbutikens text mot neutrala platshållare i en JSON-mall.
 *  startsida.mjs skriver ändå om hela index.json vid bygget — men källan får
 *  inte bära en annan firmas kunder om det steget aldrig hinner köras. */
export function neutraliseraText(text) {
  // Ordningen är inte utbytbar: de långa, KUNDSYNLIGA strängarna först, annars
  // äter en kortare regel upp dem och lämnar en trasig mening.
  //
  // Ersättningarna är valda så att KOMMENTARER förblir läsbara. Ett tomt
  // utbyte gav "ms-ab.js — A/B-testmotorn för .se", vilket är sämre än att
  // låta bli. Källbutiken heter "källbutiken" i kod, inte ingenting.
  const regler = [
    // ---- kundsynlig text (renderas i butiken) ----
    // ms-compare.liquid har källbutikens namn som schema-DEFAULT i två fält.
    // Utan de här två raderna står "Matstrumpor" i jämförelsetabellen.
    [/Matstrumpor mot en vanlig present/g, 'Oss mot ett vanligt alternativ'],
    [/("us_label"[^}]*?"default":\s*)"Matstrumpor"/g, '$1"Oss"'],
    // Fyra riktiga kunder hos källbutiken. De får aldrig följa med.
    [/\bWide Pia\b/g, 'Kund 1'], [/\bGittan\b/g, 'Kund 2'],
    [/\bAnnika\b/g, 'Kund 3'], [/\bJonas\b/g, 'Kund 4'],
    // Handles som pekar rakt in i deras butik.
    //
    // BILDERNA FÖRST, och de TÖMS — de byter inte namn. `shop_images` är per
    // butik: en ny butik har inte källbutikens filer, så referensen är död
    // oavsett vad den heter. Tom sträng ger sektionens egen platshållare,
    // vilket är ärligt; ett omdöpt filnamn hade sett rätt ut i koden och
    // ändå visat ingenting för kunden. (Axel 2026-09-09 om TackleBay: "den
    // har kvar massa gamla bilder".)
    //
    // ⚠️ Ordgräns funkar INTE här: filnamnen ser ut som
    // `matstrumpor_61_dorrmattan.jpg`, och `\b` matchar inte mellan ordet och
    // ett understreck. Därför matchas hela referensen, inte brandnamnet.
    [/"shopify:\\?\/\\?\/shop_images\\?\/[^"]*"/g, '""'],
    [/shopify:\\?\/\\?\/collections\\?\/strumporna/g, ''],
    [/shopify:\\?\/\\?\/products\\?\/sushi-strumpor/g, ''],
    [/\bSushi-Strumpor\b/g, 'en flervariantsprodukt'],
    [/\bsushi-strumpor\b/g, ''],
    // Supportmejlen blir en PLATSHÅLLARE, inte tom. Ett tomt mailto är en
    // trasig länk i kundens vy — sämre än originalet. `avbranda.mjs` byter
    // SUPPORTMEJL mot butikens egen adress i varje bygge.
    [/kundsupport@matstrumpor\.se/gi, 'SUPPORTMEJL'],
    // ---- brandnamnet ----
    [/\bMatstrumpor\.se\b/g, 'källbutiken'], [/\bmatstrumpor\.se\b/g, 'källbutiken'],
    [/\bMatstrumpor\b/g, 'källbutiken'], [/\bmatstrumpor\b/g, 'källbutiken'],
    // ---- produktordet i löpande text ----
    [/\bStrumporna\b/g, 'Varorna'], [/\bstrumporna\b/g, 'varorna'],
    [/\bStrumpor\b/g, 'Varor'], [/\bstrumpor\b/g, 'varor'],
    [/\bStrumpan\b/g, 'Varan'], [/\bstrumpan\b/g, 'varan'],
  ];
  let ut = text;
  const traffade = [];
  for (const [re, ers] of regler) {
    const n = (ut.match(re) || []).length;
    if (n) { traffade.push(`${re.source} ×${n}`); ut = ut.replace(re, ers); }
  }
  // Löftena sist, och som listor/meningar — inte som textutbyten.
  const bar = KALLANS_LOFTEN.filter((l) => new RegExp(l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(ut));
  if (bar.length) {
    ut = taBortLoften(ut);
    traffade.push(`löften: ${bar.join(', ')}`);
  }
  // Ett borttaget löfte får ALDRIG lämna en blank schema-default efter sig.
  const { text: utanBlanka, antal } = rensaBlankaDefaults(ut);
  if (antal) { ut = utanBlanka; traffade.push(`blanka schema-defaults borttagna ×${antal}`); }
  return { text: ut, traffade };
}

/** Tar bort `"default": ""` ur `{% schema %}`-block.
 *
 *  MÄTT 2026-09-10 (AdventLane, första bygget ur den rensade zip:en): när
 *  löftet i en defaultsträng togs bort blev värdet tomt — och Shopify avvisar
 *  ett schema med blank default ("Invalid schema: setting with id="items"
 *  default can't be blank"). Vid uppackningen av zip:en säger Shopify ingenting:
 *  filen lämnas bara utanför temat. Sex sektionsfiler (ms-usp-bar, ms-marquee,
 *  ms-review-slider, ms-reviews, ms-guarantee-section, blocks/ms-guarantee)
 *  saknades i butiken, och startsidan stoppade på "Section type does not
 *  refer to an existing section file". Utan default väljer Shopify tomt själv —
 *  det är samma sak för kunden, men schemat är giltigt. */
export function rensaBlankaDefaults(text) {
  let antal = 0;
  const ut = String(text).replace(/({%-?\s*schema\s*-?%})([\s\S]*?)({%-?\s*endschema\s*-?%})/g, (hel, start, json, slut) => {
    // Bara PLATTA inställningsobjekt ({ "type": "text", … } utan inre klamrar).
    // En select med options är inte platt och rörs inte — där är "" ett giltigt
    // alternativ (ab_variant "Visas för variant" = alla), och Shopify tog emot
    // fem sådana filer (mätt 2026-09-10). Det är textfälten som avvisas.
    const rensat = json.replace(/\{[^{}]*\}/g, (obj) => {
      if (/"type":\s*"(select|radio|checkbox|range|number)"/.test(obj)) return obj;
      return obj
        .replace(/,\s*"default":\s*""(?=\s*[,}])/g, () => { antal += 1; return ''; })
        .replace(/"default":\s*"",\s*/g, () => { antal += 1; return ''; });
    });
    return `${start}${rensat}${slut}`;
  });
  return { text: ut, antal };
}

// ------------------------------------------------------------------ körning

function main() {
  if (!existsSync(ZIP)) { console.error(`✗ ${ZIP} saknas.`); process.exit(1); }
  const arbete = join(ROT, '.rensa-kalla');
  if (existsSync(arbete)) rmSync(arbete, { recursive: true, force: true });
  mkdirSync(arbete, { recursive: true });
  execFileSync('unzip', ['-q', ZIP, '-d', arbete]);

  const filer = [];
  const ga = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? ga(p) : filer.push(p); } };
  ga(arbete);
  const rel = (p) => p.slice(arbete.length + 1);
  console.log(`Bas-temat: ${filer.length} filer\n`);

  const andrade = [];

  // 1. Sektionsgrupperna — popupen och cookierutan.
  for (const grupp of ['sections/footer-group.json', 'sections/header-group.json']) {
    const p = join(arbete, grupp);
    if (!existsSync(p)) continue;
    const { json, borttaget } = rensaSektionsgrupp(readFileSync(p, 'utf8'));
    if (borttaget.length) {
      console.log(`${grupp}: tar bort ${borttaget.join(', ')}`);
      if (!TORR) writeFileSync(p, JSON.stringify(json, null, 2));
      andrade.push(grupp);
    }
  }

  // 2. Inställningarna — deras logga, sociala länkar, brandtext.
  const sp = join(arbete, 'config/settings_data.json');
  if (existsSync(sp)) {
    const { json, tomda } = rensaInstallningar(readFileSync(sp, 'utf8'));
    if (tomda.length) {
      console.log(`\nconfig/settings_data.json: tömmer ${tomda.length} fält`);
      for (const t of tomda) console.log(`   • ${t}`);
      if (!TORR) writeFileSync(sp, JSON.stringify(json, null, 2));
      andrade.push('config/settings_data.json');
    }
  }

  // 2b. Filer som ska bort helt, inte bara ur grupperna.
  for (const namn of TA_BORT_FILER) {
    const p = join(arbete, namn);
    if (!existsSync(p)) continue;
    console.log(`\n${namn}: TAS BORT (källbutikens e-postkampanj)`);
    if (!TORR) rmSync(p);
    andrade.push(namn);
  }

  // 3. Texten i alla filer — deras kunder, produkt, kollektion, domän.
  //    assets/ms-paket.js undantas: fabriken äger den och ett test kräver att
  //    zip:ens kopia är byte-identisk med factory/tema/assets/ms-paket.js.
  console.log('');
  let textfiler = 0;
  for (const p of filer) {
    const namn = rel(p);
    if (namn === 'assets/ms-paket.js') continue;
    if (!/\.(liquid|json|js|css|md|txt)$/.test(namn)) continue;
    // Fillistan byggdes före steg 2b, så den innehåller filer som just tagits
    // bort. Utan den här raden kraschar körningen mitt i och lämnar zip:en
    // oförändrad — den gamla, smutsiga.
    if (!existsSync(p)) continue;
    const fore = readFileSync(p, 'utf8');
    const { text, traffade } = neutraliseraText(fore);
    if (text !== fore) {
      console.log(`${namn}: ${traffade.length} regler träffade`);
      if (!TORR) writeFileSync(p, text);
      andrade.push(namn); textfiler++;
    }
  }

  if (TORR) {
    console.log(`\n(torrkörning — ${andrade.length} filer skulle ändras, ${textfiler} av dem texträttningar)`);
    rmSync(arbete, { recursive: true, force: true });
    return;
  }

  // Packa om. Flaggorna är inte valfria:
  //   -r  rekursivt      -X  inga plattformsspecifika extrafält (reproducerbart)
  //   -D  INGA katalogposter — originalet har 397 poster, alla filer. Utan -D
  //       blir det 406, för zip lägger till en post per mapp. Shopify klarar
  //       troligen båda, men "troligen" är inte ett svar när en temauppladdning
  //       som misslyckas syns som en tom butik och inte som ett felmeddelande.
  // Vi packar INIFRÅN mappen så sökvägarna blir relativa som i originalet.
  const ny = `${ZIP}.ny`;
  if (existsSync(ny)) rmSync(ny);
  execFileSync('zip', ['-qrXD', ny, '.'], { cwd: arbete });

  const forePost = execFileSync('unzip', ['-l', ZIP], { encoding: 'utf8' }).trim().split('\n').pop();
  const efterPost = execFileSync('unzip', ['-l', ny], { encoding: 'utf8' }).trim().split('\n').pop();
  console.log(`\nfore:  ${forePost.trim()}`);
  console.log(`efter: ${efterPost.trim()}`);

  // Byte-jämför ms-paket.js: skulle den ha ändrats är fabrikens köpruta trasig.
  const iZip = execFileSync('unzip', ['-p', ny, 'assets/ms-paket.js'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  const iRepo = readFileSync(join(ROT, 'factory', 'tema', 'assets', 'ms-paket.js'), 'utf8');
  if (iZip !== iRepo) { console.error('\n✗ assets/ms-paket.js skiljer sig — packar INTE om.'); process.exit(1); }
  console.log('✓ assets/ms-paket.js oförändrad');

  writeFileSync(ZIP, readFileSync(ny));
  rmSync(ny); rmSync(arbete, { recursive: true, force: true });
  console.log(`\n✓ ${andrade.length} filer rensade. Kör nu: node factory/kallskanning.mjs --tema-zip\n`);
}

if (process.argv[1] && process.argv[1].endsWith('rensa-kalla.mjs')) main();
