// Källbutiksskanningen: hittar text och sektioner ur bas-temats ursprungsbutik
// som ligger kvar i en ny OPS-butiks tema. Ren logik utan nätverk — plus en
// CLI längst ned som lånar nätverket av kallskanning-kor.mjs.
//
//   node factory/kallskanning.mjs <butik-id> [--tema <id>] [--json]   exit 1 vid träff
//
// Bakgrunden (Axels bakläxa 2026-09-09, DryTrek): ops-tema.zip är exporterat
// från Matstrumpor, och mallarna bär källbutikens innehåll — startsidans hero
// och kollektion (templates/index.json), footerns bolagsblock
// (sections/footer-group.json), produktmallens supportmejl
// (templates/product.json), annonsraden (sections/header-group.json) och
// temainställningarna (config/settings_data.json). Ingen kod rörde dem, så
// varje ny butik ärvde Matstrumpors text tills en människa råkade se den.
// DryTrek gick hela vägen till förhandsvisning med "Kilometer fyra.
// Fortfarande torr strumpa."
//
// Regeln: ingen butik lämnas för publicering förrän skanningen är tom.
//
// Tre buggar rättade 2026-09-09 (AVBRANDNING.md):
//   1. 'collections/strumporna' träffade aldrig — minifierad JSON escapar
//      snedstreck (`collections\/strumporna`). Texten normaliseras nu före
//      matchning (`\/` → `/`, `\uXXXX` → tecknet).
//   2. 'newsletter' i KALLSEKTIONER matchade aldrig — nyhetsbrevet är
//      INSTÄLLNINGEN newsletter_enable på footer-sektionen, inte en sektionstyp.
//      Nu i KALLINSTALLNINGAR, och avbrandaSektionsgrupp slår av den.
//   3. avbrandaSektionsgrupp anropades aldrig — nu kör avbranda.mjs den på
//      både footer-group.json och header-group.json (steget `avbrandning`).
//
// locales/ och config/settings_schema.json är orörd Dawn 15.4.1 — mätt
// 2026-09-09 över alla 51 filer. All smitta i språk/meta-lagret sitter i
// config/settings_data.json och i schema-defaults, inte i språkfilerna.

// Strängar som ENTYDIGT tillhör bas-temats ursprungsbutik.
//
// ⚠️ Skanna aldrig på vanliga produktord. "Strumpa" är källbutikens produkt
// men också en giltig NYTTA för andra produkter — DryTrek säljer damasker,
// och "torra strumpor" är precis vad de gör (Axel 2026-09-09). Ett falskt
// larm som tvingar en session att skriva om korrekt copy är lika dyrt som
// ett missat. Därför bara butiksnamn, mejl, handles, filnamn och hela citat.
//
// ⚠️ Varje ord här MÅSTE ha en regel i avbranda.byggRegler (eller täckas av
// rensaSettings/sektionsrensningen) — annars kan skanningen aldrig bli tom
// och steget `kallskanning` stoppar varje bygge. Testet "zip:en är ren efter
// av-brandning" i test/avbranda.test.mjs vaktar det.
export const KALLORD = [
  'matstrumpor',
  'matstrumpor.se',
  'kundsupport@matstrumpor.se',
  'sushi-strumpor',
  'collections/strumporna',
  'strumpor som ser ut som mat',
  'strumpor man aldrig blandar ihop',
  // Källbutikens presentbutikslöften (annonsrad, USP-rad, marquee, omdömen).
  'levereras presentklart',
  'älskad av tusentals svenskar',
  'presenten som alltid landar rätt',
  // Källbutikens logga i Files och deras Facebook-sida — inget av dem
  // nämner butiken vid namn (AVBRANDNING.md: skanningen är ett golv).
  'namnlos_design_-_2026-03-19t120925',
  'profile.php?id=61584643820493',
  // Sockstorleksguiden i FAQ-defaults.
  'en storlek passar de flesta',
  'strl 36–44',
];

// Sektioner som tillhör källbutikens KAMPANJER, inte OPS-butikens funktion.
// De bär ingen text som skanningen hittar — de är typer i sektionsgrupperna,
// och följer därför tyst med i varje ny butik.
//
// ms-skrapkort  = "skrapa fram rabatten"-popup som byter rabattkod mot en
//                 mejladress. Matstrumpors e-postklubb, inte vår.
// ms-cookies    = källbutikens egen cookieruta (Shopifys samtyckesbanner
//                 används i OPS-butikerna).
//
// Axel tog bort dem för hand på HeimGuard 2026-09-06 ("rensa-popups"), men de
// låg kvar i zip:en och kom tillbaka på nästa butik. Nu rensas de av
// avbrandaSektionsgrupp(), som avbranda.mjs kör i steget `avbrandning`.
export const KALLSEKTIONER = ['ms-skrapkort', 'ms-cookies'];

// Inställningar på sektioner (per sektionsTYP) som slås av. Dawns nyhetsbrev
// är ingen egen sektion — det är footer-sektionens `newsletter_enable`.
export const KALLINSTALLNINGAR = {
  footer: { newsletter_enable: false, newsletter_heading: '' },
};

// Källbutikens annonsblock i header-group (announcement-bar). Texterna är
// zip:ens tre rader ordagrant; fabrikens egna rader (tema.byggHeaderGroup)
// har id-prefixet opf_ och andra texter. Jämförs skiftlägesokänsligt.
export const KALLANNONSER = ['fri frakt i hela sverige', '30 dagars öppet köp', 'levereras presentklart'];

// Filer där källtexten bevisligen bor. Skanna alltid ALLA temats JSON-mallar
// och Liquid-filer — listan är var man börjar leta, inte var man slutar.
export const KANDA_SMITTADE = [
  'templates/index.json',
  'templates/product.json',
  'sections/footer-group.json',
  'sections/header-group.json',
  'config/settings_data.json',
];

// Minifierad tema-JSON escapar snedstreck och ibland icke-ASCII. Matcha på
// den avkodade texten, annars träffar 'collections/strumporna' aldrig.
export function normalisera(s) {
  return String(s ?? '')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replaceAll('\\/', '/')
    .toLowerCase();
}

// Bär strängen något ur KALLORD? Används av tema.rensaSettings för att
// känna igen källbutikens logga i settings_data utan att lista filnamn där.
export function arKalltext(s) {
  const lag = normalisera(s);
  return KALLORD.some((o) => lag.includes(o));
}

function lasJson(rajson) {
  if (typeof rajson !== 'string') return rajson;
  return JSON.parse(String(rajson).replace(/^﻿/, '').replace(/^\s*\/\*[\s\S]*?\*\//, '').trim());
}

// Tar bort källbutikens kampanjsektioner och annonsblock ur en sektionsgrupp
// (footer-group eller header-group) och slår av källinställningarna.
// `behall` = annonstexter som är butikens egna och aldrig får tas bort.
// Returnerar { json, borttaget }.
export function avbrandaSektionsgrupp(rajson, { behall = [] } = {}) {
  const data = lasJson(rajson);
  const borttaget = [];
  const behallLag = new Set(behall.map((t) => String(t).trim().toLowerCase()));
  for (const [namn, sektion] of Object.entries(data.sections ?? {})) {
    if (KALLSEKTIONER.includes(sektion?.type)) {
      delete data.sections[namn];
      borttaget.push(`${namn} (${sektion.type})`);
      continue;
    }
    const spar = KALLINSTALLNINGAR[sektion?.type];
    if (spar) {
      for (const [k, v] of Object.entries(spar)) {
        if (sektion.settings?.[k] !== undefined && sektion.settings[k] !== v) {
          sektion.settings[k] = v;
          borttaget.push(`${namn}.settings.${k} → ${JSON.stringify(v)}`);
        }
      }
    }
    if (sektion?.type === 'announcement-bar' && sektion.blocks) {
      for (const [bid, block] of Object.entries(sektion.blocks)) {
        const t = String(block?.settings?.text ?? '').trim().toLowerCase();
        if (block?.type === 'announcement' && KALLANNONSER.includes(t) && !behallLag.has(t)) {
          delete sektion.blocks[bid];
          borttaget.push(`${namn}.blocks.${bid} ("${block.settings.text}")`);
        }
      }
      if (Array.isArray(sektion.block_order)) {
        sektion.block_order = sektion.block_order.filter((b) => b in sektion.blocks);
      }
    }
  }
  if (Array.isArray(data.order)) {
    data.order = data.order.filter((n) => n in (data.sections ?? {}));
  }
  return { json: data, borttaget };
}

// Skannar en sektionsgrupp efter källsektioner, källinställningar och
// källannonser utan att ändra något. Samma träffformat som skannaFil.
export function skannaSektionsgrupp(namn, rajson) {
  let data;
  try {
    data = lasJson(rajson);
  } catch {
    return [];
  }
  const traffar = [];
  for (const [id, s] of Object.entries(data?.sections ?? {})) {
    if (KALLSEKTIONER.includes(s?.type)) {
      traffar.push({ fil: namn, rad: 0, ord: [s.type], text: `källsektion "${id}" av typen ${s.type}` });
    }
    const spar = KALLINSTALLNINGAR[s?.type];
    if (spar) {
      for (const [k, v] of Object.entries(spar)) {
        if (s.settings?.[k] !== undefined && s.settings[k] !== v) {
          traffar.push({ fil: namn, rad: 0, ord: [k], text: `källinställning ${id}.${k} = ${JSON.stringify(s.settings[k])}` });
        }
      }
    }
    if (s?.type === 'announcement-bar') {
      for (const [bid, block] of Object.entries(s.blocks ?? {})) {
        const t = String(block?.settings?.text ?? '').trim();
        if (KALLANNONSER.includes(t.toLowerCase())) {
          traffar.push({ fil: namn, rad: 0, ord: [t.toLowerCase()], text: `källannons ${id}.${bid} "${t}"` });
        }
      }
    }
  }
  return traffar;
}

const SEKTIONSGRUPPER = new Set(['sections/footer-group.json', 'sections/header-group.json']);

// Skannar en temafil. Returnerar raderna med träff, med radnummer och ett
// citat runt träffen (±80 tecken) — minifierad JSON är EN rad på tusentals
// tecken, så "första 160 tecknen" visade aldrig beviset.
export function skannaFil(namn, innehall) {
  const rader = String(innehall).split(/\r?\n/);
  const traffar = [];
  rader.forEach((rad, i) => {
    const lag = normalisera(rad);
    const ord = KALLORD.filter((o) => lag.includes(o));
    if (ord.length === 0) return;
    const forsta = Math.min(...ord.map((o) => lag.indexOf(o)).filter((x) => x >= 0));
    const start = Math.max(0, forsta - 80);
    const citat = `${start > 0 ? '…' : ''}${rad.slice(start, forsta + 80).trim()}${rad.length > forsta + 80 ? '…' : ''}`;
    traffar.push({ fil: namn, rad: i + 1, ord: [...new Set(ord)], text: citat.slice(0, 200) });
  });
  return traffar;
}

// Skannar hela temat. `filer` är { sokvag: innehall }. Sektionsgrupperna
// skannas dessutom strukturellt (källsektioner, newsletter_enable, annonser).
export function skannaTema(filer) {
  const traffar = [];
  for (const [namn, innehall] of Object.entries(filer)) {
    traffar.push(...skannaFil(namn, innehall));
    if (SEKTIONSGRUPPER.has(namn)) traffar.push(...skannaSektionsgrupp(namn, innehall));
  }
  return { rent: traffar.length === 0, traffar };
}

// Rapport att visa i chatten.
export function rapport(resultat) {
  if (resultat.rent) return '✅ Källskanning ren — ingen text från bas-temats ursprungsbutik.';
  const rader = resultat.traffar.map(
    (t) => `  ❌ ${t.fil}:${t.rad} [${t.ord.join(', ')}] ${t.text}`
  );
  return [
    `❌ ${resultat.traffar.length} rader bär text från bas-temats ursprungsbutik:`,
    ...rader,
    '',
    'Butiken får INTE lämnas för publicering förrän listan är tom.',
  ].join('\n');
}

// Redovisar att de kända smittade filerna faktiskt lästes — annars går det
// inte att skilja "ren" från "aldrig hämtad".
export function tackning(filer) {
  return {
    lasta: KANDA_SMITTADE.filter((f) => f in filer),
    saknade: KANDA_SMITTADE.filter((f) => !(f in filer)),
  };
}

// ---------------------------------------------------------------------------
// CLI. Nätverket lånas av kallskanning-kor.mjs (dynamisk import, så modulen
// förblir ren logik för testerna). Temat är butikens arbetstema ur state
// (KEDJAN.md regel 1), eller --tema <id>; aldrig "första UNPUBLISHED".
async function huvud() {
  const arg = process.argv.slice(2);
  const varde = (flagga) => (arg.includes(flagga) ? arg[arg.indexOf(flagga) + 1] : null);
  const flaggvarden = new Set([varde('--tema')].filter(Boolean));
  const butikId = arg.find((a) => !a.startsWith('--') && !flaggvarden.has(a));
  if (!butikId) {
    console.error('Användning: node factory/kallskanning.mjs <butik-id> [--tema <id>] [--json]');
    process.exit(2);
  }
  const { existsSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const rot = dirname(fileURLToPath(import.meta.url));
  if (!existsSync(join(rot, 'butiker', `${butikId}.yaml`))) {
    console.error(`❌ Ingen butiksfil: factory/butiker/${butikId}.yaml`);
    process.exit(2);
  }
  const { laddaEnv } = await import('./env.mjs');
  const { lasState } = await import('./state.mjs');
  const { hamtaArbetstema } = await import('./shopify.mjs');
  const { hamtaAllaTemafiler } = await import('./kallskanning-kor.mjs');
  laddaEnv();

  const state = lasState(butikId, '_butik');
  const temaIdUrState =
    state.steg?.['tema-upload']?.arbetstemaId ?? state.steg?.['tema-upload']?.temaId ?? state.steg?.tema?.temaId ?? null;
  const tema = await hamtaArbetstema(varde('--tema') ?? temaIdUrState);

  const filer = await hamtaAllaTemafiler(tema.id);
  const res = skannaTema(filer);
  const { lasta, saknade } = tackning(filer);
  if (arg.includes('--json')) {
    console.log(JSON.stringify({ tema: tema.name, roll: tema.role, antalFiler: Object.keys(filer).length, ...res, lasta, saknade }, null, 2));
  } else {
    console.log(`━━━ ${tema.name} (${tema.role}) — ${Object.keys(filer).length} filer skannade ━━━`);
    console.log(rapport(res));
    console.log(`\n  kända smittade filer lästa: ${lasta.join(', ') || '(inga)'}`);
    if (saknade.length > 0) console.log(`  ⚠️ fanns inte i temat: ${saknade.join(', ')}`);
  }
  process.exit(res.rent ? 0 : 1);
}

if (process.argv[1] && /[\\/]kallskanning\.mjs$/.test(process.argv[1])) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(2);
  });
}
