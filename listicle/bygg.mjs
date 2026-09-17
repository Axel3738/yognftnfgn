#!/usr/bin/env node
// bygg.mjs — motorn bakom /lagerrensning, /vi-testade och /anledningar (och
// /listiclar som kör alla tre): mallen → en ny produkts listicle → in i butiken.
//
//   node listicle/bygg.mjs <produktlänk> --underlag [--koncept id] [--punkter n]   # produktfakta → output/<koncept>/<handle>/underlag.json
//   node listicle/bygg.mjs <produktlänk> --torr [--koncept id] [--punkter n]       # planen: copy-granskning, bildplan, inget nät mot kie/Shopify
//   node listicle/bygg.mjs <produktlänk> [--koncept id] [--punkter n] [--butik id]  # skarpt: bilder → CDN, sidan → BUTIKEN (temafiler + sida + trippelkoll), förhandsvisning
//   node listicle/bygg.mjs <produktlänk> --gempages …                             # dessutom en .gempages-fil (GemPages-import — tillval sedan 2026-09-16)
//   node listicle/bygg.mjs <produktlänk> --utan-publicering …                     # bygg bara filerna, rör inte butiken
//   node listicle/bygg.mjs --kolla <fil.gempages>                                 # läs en .gempages: texter, länkar, bilder, checksummor
//   node listicle/bygg.mjs --exempel                                              # mallens copy som JSON (formen copyn ska följa)
//
// Flaggor: --koncept lagerrensning|vi-testade|anledningar (standard lagerrensning)
//          --punkter 5|7           bara /anledningar tillåter 7 (sektionerna klonas)
//          --butik <id>            baverbutiken (standard när länken är baverbutiken.se) eller ett OPS-id (carashell …)
//          --marknad <KOD>         samma sida på en annan MARKNAD i samma butik (US = carashell.com, engelska, USD):
//                                  copyn ur copy.<locale>.json, priset ur marknadens egen produktsida, sidan får en
//                                  ÖVERSÄTTNING (Translations API) — ingen dubblettsida. Kräver att den svenska sidan finns.
//          --land <CC>             ett LAND inom marknaden (--marknad US --land GB): egen valuta (GBP), egen adress
//                                  (?country=GB), EGEN sida (handle + "-gb"), copyn ur copy.<locale>-<CC>.json med
//                                  prisplatserna [[PRIS]]/[[JAMFORPRIS]] som butiken byter i besökarens valuta.
//          --handle <handle>       sidans handle uttryckligen (annars plan.json:s handle om sidan redan byggts, annars <slug>-<suffix>)
//          --opublicerad           sidan skapas men visas inte för kunder
//          --lank <url|/products/x> knapparnas länk (standard: /products/<handle> i butiken — OPS-handlen slås upp ur factory/produkter/)
//          --brand <id>            brandad sida (listicle/brand/<id>.json) — standard är OBRANDAD
//          --copy <fil> --bildplan <fil> --ut <fil> --datum YYYY-MM-DD --igen plats,… --behall-idn --utan-forhandsvisning
// Standardfiler: listicle/output/<koncept>/<handle>/{underlag,copy,bildplan,bilder,plan}.json
//                listicle/output/<koncept>/<handle>/<slug>-<suffix>.html        ← förhandsvisningens underlag (inline CSS)
//                listicle/output/<koncept>/<handle>/<slug>-<suffix>.sida.html   ← exakt det som ligger i butikens sida (CSS:en är temafilen)
//                listicle/output/<koncept>/<handle>/<slug>-<suffix>.gempages    ← bara med --gempages
//                listicle/output/<koncept>/<handle>/forhandsvisning/{desktop,mobil}.png + utsnitt (gitignorerat)
//
// Stoppar (exit 1) på: pris i copyn som inte står på produktsidan, procentsats,
// HTML i copyn, förbjuden fras, butiksnamn på obrandad sida, saknad text- eller
// bildplats, fel antal punkter. Publicerar aldrig en sida som inte läses tillbaka
// rätt från butiken (ingen header, ingen footer, listiclen på plats).

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { hamtaProdukt } from './produkt.mjs';
import {
  lasMall, byggSida, granskaCopy, copyUrMall, tillGempages, urGempages, granskaChecksummor, lasAvSida, idag,
  brandProfil, kandaBrand, lasKoncept, valjPunkter, konceptText, konceptHandle, platserForPunkter, kandaKoncept, htmlAv, styckenAv,
} from './gempages.mjs';
import { granskaBildplan, losBilder } from './bilder.mjs';
import { renderaHtml, mallBilder } from './html.mjs';
import { forhandsvisa } from './forhandsvisning.mjs';
import { arBaverbutiken, BAVERBUTIKEN, marknadForButik, landForMarknad, marknadsProduktLank, marknadsSidlank } from './butik.mjs';
import { sprakFor, konceptForSprak, ersattPrisTokens, harPrisTokens, PRIS_TOKEN, JAMFORPRIS_TOKEN } from './sprak.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..');
export const OUTPUT_MAPP = join(HAR, 'output');
const FLAGGOR_MED_VARDE = ['--copy', '--bildplan', '--ut', '--datum', '--igen', '--kolla', '--brand', '--lank', '--koncept', '--punkter', '--butik', '--marknad', '--land', '--handle'];

function arg(argv, namn) {
  const i = argv.indexOf(namn);
  return i === -1 ? null : argv[i + 1] ?? null;
}

const lasJsonFil = (fil) => JSON.parse(readFileSync(fil, 'utf8'));

/**
 * products/<id>/dna.md om produkten har ett minne — faktakälla nr 2 för copyn.
 * Bäverbutikens produkter står i products.json; OPS-butikernas minne ligger i
 * products/<butik>/dna.md eller products/<butik>/<produkt>/dna.md (TackleBay,
 * CaraShell) och nås inte via products.json — därför läses alla dna.md-filer
 * två nivåer ner. Träff = filen nämner produktens /products/<handle>.
 * (Porterat från sessionen som byggde takskyddets sida 2026-09-16.)
 */
export function hittaDna(handle, rot = ROT) {
  const mapp = join(rot, 'products');
  if (!existsSync(mapp)) return null;
  const kandidater = [];
  const karta = join(mapp, 'products.json');
  if (existsSync(karta)) for (const p of lasJsonFil(karta).products ?? []) kandidater.push(p.id);
  for (const d of readdirSync(mapp, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    kandidater.push(d.name);
    for (const u of readdirSync(join(mapp, d.name), { withFileTypes: true })) if (u.isDirectory()) kandidater.push(`${d.name}/${u.name}`);
  }
  for (const id of [...new Set(kandidater)]) {
    const dna = join(mapp, id, 'dna.md');
    if (!existsSync(dna)) continue;
    const text = readFileSync(dna, 'utf8');
    if (text.includes(`/products/${handle}`)) return { id, fil: `products/${id}/dna.md` };
  }
  return null;
}

/** Är produktlänken Bäverbutikens? Annars är den butikens egen produktsida (OPS-butik). */
export const arBaverLank = (url) => { try { return /(^|\.)baverbutiken\.se$/.test(new URL(url).host); } catch { return false; } };

/**
 * OPS-butikens egen handle för en Bäverbutiks-produkt: factory/produkter/<x>.yaml
 * bär `kalla.produkt_handle` (källan) och `produkt.id` (handlen i OPS-butiken).
 */
export function opsHandleForKalla(kallaHandle, { produkterMapp = join(ROT, 'factory', 'produkter') } = {}) {
  if (!existsSync(produkterMapp)) return null;
  for (const f of readdirSync(produkterMapp)) {
    if (!f.endsWith('.yaml')) continue;
    const text = readFileSync(join(produkterMapp, f), 'utf8');
    if (!new RegExp(`^\\s*produkt_handle:\\s*"?${kallaHandle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"?\\s*$`, 'm').test(text)) continue;
    const m = /^produkt:\s*\n(?:[ \t]+.*\n)*?[ \t]+id:\s*"?([a-z0-9-]+)"?/m.exec(text);
    if (m) return m[1];
  }
  return null;
}

/** Butiken ur flaggan eller länken: baverbutiken.se → baverbutiken, annars måste --butik ges. */
export function valjButik(argv, produktUrl) {
  const flagga = arg(argv, '--butik');
  if (flagga) return arBaverbutiken(flagga) ? BAVERBUTIKEN : String(flagga).trim().toLowerCase();
  try { return /(^|\.)baverbutiken\.se$/.test(new URL(produktUrl).host) ? BAVERBUTIKEN : null; } catch { return null; }
}

const produktSammandrag = (p) => ({
  titel: p.titel, kortTitel: p.kortTitel, handle: p.handle, url: p.url, typ: p.typ, valuta: p.valuta,
  pris: p.pris, jamforpris: p.jamforpris, prisText: p.prisText, jamforprisText: p.jamforprisText,
  flerPriser: p.flerPriser, alternativ: p.alternativ, antalVarianter: p.varianter.length,
  bilder: p.bilder.map((b, i) => ({ index: i + 1, src: b.src, width: b.width, height: b.height })),
  beskrivning: p.beskrivning,
});

/**
 * Filtaggen för en marknadsversion: "en" (marknaden) eller "en-GB" (ett land i
 * marknaden). Svenska sidan har ingen tagg.
 */
const marknadsTagg = (marknad) => (marknad ? (marknad.egetLand ? `${marknad.locale}-${marknad.land}` : marknad.locale) : null);

/**
 * Handlen sidan redan ligger på: plan.json i handle-mappen bär den. Produkt-
 * titeln (och därmed slugen) kan ändras efter att sidan byggts — takskyddet
 * hette "6,5 × 3 m" när sidan byggdes och "5,5–13,5 m" dagen efter — och då
 * skulle en ny körning annars skapa en NY sida på en ny adress och lämna den
 * gamla, som annonserna pekar på, orörd.
 */
export function befintligHandle(mapp) {
  const fil = join(mapp, 'plan.json');
  if (!existsSync(fil)) return null;
  try { return lasJsonFil(fil)?.sida?.handle ?? null; } catch { return null; }
}

/** Sidans handle: --handle, annars plan.json, annars <slug>-<suffix>. Ett land i en marknad får "-<cc>" på slutet. */
function valjHandle(argv, mapp, koncept, produkt, n, marknad) {
  const uttryckligt = arg(argv, '--handle');
  const beraknat = konceptHandle(koncept, produkt, n);
  const bas = uttryckligt ? String(uttryckligt).trim().replace(/-[a-z]{2}$/, '') : befintligHandle(mapp) ?? beraknat;
  const kalla = uttryckligt ? '--handle' : bas === beraknat ? null : 'plan.json';
  const handle = marknad?.egetLand ? `${bas}-${marknad.land.toLowerCase()}` : bas;
  return { handle, bas, kalla, beraknat };
}

/**
 * Produktfakta ur butiken → underlag.json (svenska) eller underlag.<tagg>.json
 * (en marknad / ett land). Med `marknad` läses produkten DESSUTOM från marknadens
 * egen adress (carashell.com/products/x?country=US → USD-priser, engelsk text;
 * ?country=GB → GBP) — det är den copyn skrivs mot. Spärr: svarar marknadens
 * adress med samma tal som den svenska sidan i en annan valuta är domänen inte
 * kopplad till marknaden, och priset på sidan hade blivit fel.
 */
async function underlag(lank, { torr = false, koncept, n, marknad = null, argv = [] } = {}) {
  const produkt = await hamtaProdukt(lank);
  const mapp = join(OUTPUT_MAPP, koncept.id, produkt.handle);
  const dna = hittaDna(produkt.handle);
  const h = valjHandle(argv, mapp, koncept, produkt, n, marknad);
  const ut = {
    hamtat: new Date().toISOString(),
    koncept: koncept.id, kommando: koncept.kommando, punkter: n,
    produkt: produktSammandrag(produkt),
    dna,
    sidhandle: h.handle,
    sidhandle_kalla: h.kalla,
  };
  let marknadsProdukt = null;
  if (marknad) {
    const mLank = marknadsProduktLank(marknad, produkt.handle);
    marknadsProdukt = await hamtaProdukt(mLank, { valuta: marknad.valuta });
    if (marknad.valuta !== produkt.valuta && marknadsProdukt.pris === produkt.pris && (marknadsProdukt.jamforpris ?? null) === (produkt.jamforpris ?? null)) {
      throw new Error(`${mLank} gav samma tal som den svenska sidan (${produkt.prisText}) — ${marknad.egetLand ? `landet ${marknad.land}` : `marknaden ${marknad.kod}`} svarar inte i ${marknad.valuta}. Är ${marknad.doman} kopplad till marknaden ${marknad.namn} i Shopify (Inställningar → Marknader)?`);
    }
    ut.marknad = { kod: marknad.kod, land: marknad.land, egetLand: !!marknad.egetLand, locale: marknad.locale, valuta: marknad.valuta, doman: marknad.doman, lank: mLank, sidlank: marknadsSidlank(marknad, h.handle), produkt: produktSammandrag(marknadsProdukt) };
  }
  if (!torr) {
    mkdirSync(mapp, { recursive: true });
    const tagg = marknadsTagg(marknad);
    writeFileSync(join(mapp, tagg ? `underlag.${tagg}.json` : 'underlag.json'), JSON.stringify(ut, null, 2) + '\n');
  }
  return { produkt, marknadsProdukt, ut, mapp, handle: h };
}

/** --marknad <KOD> [--land <CC>] → marknaden (och landet i den) ur butiksfilen + landstabellen, eller null. Kräver en butik (OPS-id). */
function valjMarknad(argv, butik) {
  const kod = arg(argv, '--marknad');
  const land = arg(argv, '--land');
  if (!kod) {
    if (land) throw new Error(`--land ${land} kräver en marknad: skriv --marknad US --land ${land}.`);
    return null;
  }
  if (!butik) throw new Error(`--marknad ${kod} kräver en butik med marknader: skriv --butik carashell (eller ett annat OPS-id).`);
  const m = marknadForButik(butik, kod);
  return land ? landForMarknad(m, land) : m;
}

async function bygg(lank, argv) {
  const torr = argv.includes('--torr');
  const koncept = lasKoncept(arg(argv, '--koncept') ?? undefined);
  const n = valjPunkter(koncept, arg(argv, '--punkter'));
  // Butiken ur flaggan eller länken — före underlaget, för marknaden hänger på butiken.
  const butik = valjButik(argv, lank);
  const marknad = valjMarknad(argv, butik);
  const locale = marknad?.locale ?? 'sv';
  const sprak = sprakFor(locale);
  const kSprak = konceptForSprak(koncept, locale);
  const { produkt, marknadsProdukt, ut: underlagObj, mapp, handle: handleVal } = await underlag(lank, { torr, koncept, n, marknad, argv });
  // Sidan byggs ur marknadens produkt (pris i marknadens valuta, titel på marknadens
  // språk) men med den svenska sidans handle/slug — det är samma sida som översätts.
  const sidProduktBas = marknad ? { ...marknadsProdukt, handle: produkt.handle, slug: produkt.slug } : produkt;
  const { mall, platser: basPlatser, manifest } = lasMall();
  const platser = platserForPunkter(basPlatser, n);
  const tagg = marknadsTagg(marknad);
  const sprakFil = (namn, ext) => join(mapp, tagg ? `${namn}.${tagg}.${ext}` : `${namn}.${ext}`);
  const copyFil = arg(argv, '--copy') ?? sprakFil('copy', 'json');
  // Bildplanen delas med den svenska sidan om marknaden inte har en egen (bildplan.<tagg>.json).
  const planFil = arg(argv, '--bildplan') ?? (marknad && existsSync(sprakFil('bildplan', 'json')) ? sprakFil('bildplan', 'json') : join(mapp, 'bildplan.json'));
  const cacheFil = join(mapp, 'bilder.json');
  const datum = arg(argv, '--datum') ?? idag();
  const igen = (arg(argv, '--igen') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const medGempages = argv.includes('--gempages');
  const utanPublicering = argv.includes('--utan-publicering');

  // Butiken och knapparna. Obrandad sida som standard (Axels beslut 2026-09-16).
  const brand = brandProfil(arg(argv, '--brand'), { forfattareObrandad: kSprak.forfattare_obrandad });
  const publicera = !torr && !utanPublicering;
  if (publicera && !butik) throw new Error(`Länken är inte Bäverbutikens — säg vilken butik sidan ska in i: --butik baverbutiken | carashell | … (eller --utan-publicering).`);
  // Knapparna: relativa i butiken. En Bäverbutiks-länk som ska in i en OPS-butik
  // får OPS-handlen ur factory/produkter/; en länk till OPS-butikens egen
  // produktsida (carashell.se/products/takskyddet) är redan rätt handle.
  // På en marknad: marknadens egen produktlänk (?country= pekar ut marknaden).
  let knapparTill = arg(argv, '--lank');
  let opsHandle = null;
  if (!knapparTill) {
    if (marknad) knapparTill = marknadsProduktLank(marknad, produkt.handle);
    else if (!butik) knapparTill = produkt.url;
    else if (butik === BAVERBUTIKEN || !arBaverLank(produkt.url)) knapparTill = `/products/${produkt.handle}`;
    else {
      opsHandle = opsHandleForKalla(produkt.handle);
      if (!opsHandle) throw new Error(`Hittar ingen OPS-produkt med källan ${produkt.handle} i factory/produkter/ — ange knapparnas länk: --lank /products/<handle-i-${butik}>.`);
      knapparTill = `/products/${opsHandle}`;
    }
  }
  if (butik === BAVERBUTIKEN && !arBaverLank(produkt.url)) throw new Error(`Länken ${produkt.url} är inte Bäverbutikens men sidan skulle in i Bäverbutiken — ange rätt butik med --butik.`);
  if (!/^(https:\/\/[^/\s]+\/.+|\/products\/[a-z0-9-]+)/.test(knapparTill)) throw new Error(`--lank ska vara /products/<handle> eller en https-länk, fick "${knapparTill}".`);
  const suffix = konceptText(koncept.suffix, { produkt, n });
  const filBas = `${handleVal.bas}${tagg ? `.${tagg}` : ''}`;
  const utFil = arg(argv, '--ut') ?? join(mapp, `${filBas}.gempages`);
  const sidhandle = handleVal.handle;

  console.log(`Koncept: ${koncept.kommando} (${koncept.namn}) · ${n} punkter · datumrad ${datum}${marknad ? ` · språk ${sprak.namn} (${locale})` : ''}`);
  console.log(`Produkt: ${produkt.titel}`);
  console.log(`   ${produkt.url}`);
  console.log(`   pris ${produkt.prisText}${produkt.jamforprisText ? ` · jämförpris ${produkt.jamforprisText}` : ' · INGET jämförpris på sidan'}${produkt.flerPriser ? ` · ⚠ flera priser (${produkt.flerPriser.join(', ')}), lägsta används` : ''}`);
  console.log(`   ${produkt.bilder.length} produktbilder · dna: ${underlagObj.dna?.fil ?? 'saknas'}`);
  if (handleVal.kalla) console.log(`   handle ${handleVal.bas} ur ${handleVal.kalla} (titeln ger i dag ${handleVal.beraknat} — sidan behåller sin adress)`);
  if (marknad) {
    console.log(`Marknad: ${marknad.kod} ${marknad.egetLand ? `· land ${marknad.land} ${marknad.namn} (inom marknaden, egen valuta och egen sida)` : marknad.namn} · ${marknad.doman} · ${sprak.namn} · ${marknad.valuta}`);
    console.log(`   ${underlagObj.marknad.lank}`);
    console.log(`   ${marknadsProdukt.titel}`);
    console.log(`   pris ${marknadsProdukt.prisText}${marknadsProdukt.jamforprisText ? ` · jämförpris ${marknadsProdukt.jamforprisText}` : ' · INGET jämförpris på marknadens sida'} (läst ur marknadens egen produktsida — copyn skrivs mot den${marknad.egetLand ? '; automatisk kursomräkning — skriv [[PRIS]]/[[JAMFORPRIS]] i copyn så butiken byter dem vid visning' : ''})`);
  }
  if (kSprak.jamforpris_behovs && !sidProduktBas.jamforpris) console.log('   ⚠ Utan jämförpris finns inget "istället för" — sätt compare-at i Shopify eller skriv copyn utan.');
  console.log(`Brand: ${brand.namn ? `${brand.namn} (--brand ${brand.id})` : `OBRANDAD — "${sprak.av} ${brand.forfattare}.", ingen logga, bara "${sprak.reklam}" i sidfoten.${kandaBrand().length ? ` Brandad: --brand ${kandaBrand().join(' | ')}` : ''}`}`);
  if (marknad?.egetLand) console.log(`Butik: ${butik} → EGEN sida /pages/${sidhandle} för ${marknad.namn} (engelska i sidans grundspråk) · läses av kunden på ${marknadsSidlank(marknad, sidhandle)}${torr ? ' (torr)' : utanPublicering ? ' (--utan-publicering)' : ''}`);
  else if (marknad) console.log(`Butik: ${butik} → ÖVERSÄTTNING (${locale}) av /pages/${sidhandle} (ingen ny sida) · läses av kunden på ${marknadsSidlank(marknad, sidhandle)}${torr ? ' (torr)' : utanPublicering ? ' (--utan-publicering)' : ''}`);
  else console.log(`Butik: ${butik ?? '— (ingen publicering)'}${publicera ? ` → sidan läggs upp som /pages/${sidhandle}` : utanPublicering ? ' (--utan-publicering)' : torr ? ' (torr)' : ''}`);
  console.log(`Knappar: → ${knapparTill}${opsHandle ? ` (OPS-handlen ur factory/produkter/)` : ''}`);

  if (!existsSync(copyFil)) {
    console.log(`\n❌ Copyn saknas: ${copyFil}\n   Skriv den själv (se .claude/commands/${koncept.id}.md), formen finns i listicle/mall/exempel-copy.json (${n} punkter)${marknad ? ` — på ${sprak.namn}, mot marknadens produktsida (${underlagObj.marknad.lank}), priserna som ${marknadsProdukt.prisText}${marknadsProdukt.jamforprisText ? ` / ${marknadsProdukt.jamforprisText}` : ''}` : ''}.`);
    process.exit(1);
  }
  const copy = lasJsonFil(copyFil);
  const g = granskaCopy(copy, sidProduktBas, basPlatser, { brand, koncept, punkter: n, locale, valuta: sidProduktBas.valuta });
  console.log(`\nCopy: ${copyFil}`);
  const medTokens = harPrisTokens(copy);
  if (medTokens) console.log(`   prisplatser: ${PRIS_TOKEN}${/\[\[JAMFORPRIS\]\]/.test(JSON.stringify(copy)) ? ` + ${JAMFORPRIS_TOKEN}` : ''} i copyn — butiken byter dem vid visning (i dag ${sidProduktBas.prisText}${sidProduktBas.jamforprisText ? ` / ${sidProduktBas.jamforprisText}` : ''} på ${marknad ? underlagObj.marknad.lank : produkt.url})`);
  else if (marknad?.egetLand) console.log(`   ⚠ inga prisplatser i copyn — landet ${marknad.land} får priset genom automatisk kursomräkning, så en inbränd siffra kan vara fel i morgon. Skriv [[PRIS]] / [[JAMFORPRIS]].`);
  for (const v of g.varningar) console.log(`   ⚠ ${v}`);
  for (const f of g.fel) console.log(`   ❌ ${f}`);
  if (g.fel.length) { console.log(`\n❌ ${g.fel.length} fel i copyn — rätta och kör igen.`); process.exit(1); }
  console.log(`   ✓ priser (${sidProduktBas.valuta}), procent, fraser, brandnamn och alla ${Object.keys(platser.text).length} textplatser kontrollerade`);

  let plan = {};
  if (existsSync(planFil)) plan = lasJsonFil(planFil);
  else console.log(`\n⚠ Ingen bildplan (${planFil}) — alla ${platser.bilder_som_byts.length} bildplatser måste stå där.`);
  const gb = granskaBildplan(plan, sidProduktBas, platser);
  console.log(`\nBildplan: ${existsSync(planFil) ? planFil : '—'}`);
  for (const v of gb.varningar) console.log(`   ⚠ ${v}`);
  for (const f of gb.fel) console.log(`   ❌ ${f}`);
  if (gb.fel.length) { console.log(`\n❌ ${gb.fel.length} fel i bildplanen — rätta och kör igen.`); process.exit(1); }

  const cache = existsSync(cacheFil) ? lasJsonFil(cacheFil) : {};
  let generera = null;
  let laddaUpp = null;
  if (!torr) {
    const kie = await import('../bildannonser/kie.mjs');
    const shopify = await import('./shopify.mjs');
    generera = async ({ prompt, referenser, format }) => {
      const r = await kie.genereraBild({ prompt, referensBilder: referenser, bildformat: format, filformat: 'png' });
      return { url: r.urler[0], taskId: r.taskId };
    };
    laddaUpp = shopify.laddaUppBild;
  }
  const hamta = async (url) => Buffer.from(await (await fetch(url)).arrayBuffer());
  const bildMapp = join(mapp, 'bilder');
  const sparaLokalt = (plats, buf) => { mkdirSync(bildMapp, { recursive: true }); const f = join(bildMapp, `${plats}.png`); writeFileSync(f, buf); return f; };

  console.log('\nBilder:');
  const { bilder, cache: nyCache } = await losBilder(gb.poster, sidProduktBas, {
    cache, igen, torr, generera, laddaUpp, hamta, sparaLokalt, logg: (r) => console.log(r), filnamnBas: filBas,
  });
  if (!torr) writeFileSync(cacheFil, JSON.stringify(nyCache, null, 2) + '\n');

  // GemPages-sidan byggs alltid (den är gratis och ger --kolla-läsningen), men
  // filen skrivs bara med --gempages. Nya sid-id:n som standard.
  const nyaIdn = !argv.includes('--behall-idn');
  const sidProdukt = { ...sidProduktBas, url: knapparTill };
  const bilderKlara = torr ? Object.fromEntries(Object.entries(bilder).filter(([, b]) => b.src && b.width > 0)) : bilder;
  const { sida, rapport } = byggSida({ mall, platser: basPlatser, produkt: sidProdukt, copy, bilder: bilderKlara, datum, brand, koncept, punkter: n, nyaIdn, locale, handle: sidhandle });
  if (rapport.handle !== sidhandle) throw new Error(`Sidans handle blev ${rapport.handle}, väntat ${sidhandle}.`);

  console.log(`\nSida: "${rapport.namn}" · handle ${rapport.handle} · ${rapport.punkter} punkter · ${rapport.brand.namn ? `brand ${rapport.brand.namn}` : 'obrandad'}`);
  console.log(`   ${rapport.texter.length} texter, ${rapport.lankar} knappar → ${knapparTill}, ${rapport.bilder.length} bilder bytta, författarrad "${sprak.av} ${rapport.brand.forfattare}.", logga ${rapport.brand.logga ? 'visas' : 'dold'}`);
  const kvarMotor = lasAvSida(sida).filter((r) => /motorhölje|motorhöljen|kåpa|utombordare|båtägar/i.test(String(r.text ?? '')));
  if (kvarMotor.length && produkt.handle !== 'marin-motorholje-420d-universellt-skydd') {
    console.log(`\n⚠ ${kvarMotor.length} text(er) nämner fortfarande motorhöljet/båtar — läs copyn igen:`);
    for (const r of kvarMotor) console.log(`   ${r.uid}: ${String(r.text).slice(0, 100)}`);
  }

  // HTML: förhandsvisningens underlag (inline CSS) och sidans body (utan CSS).
  const fasta = mallBilder(mall, basPlatser);
  for (let i = 6; i <= n; i += 1) fasta[`punkt${i}`] = fasta[`punkt${i}`] ?? fasta[i % 2 === 0 ? 'punkt4' : 'punkt5'];
  const htmlFil = join(mapp, `${filBas}.html`);
  const bodyFil = join(mapp, `${filBas}.sida.html`);
  const htmlArgs = { copy, produkt: sidProdukt, bilder: bilderKlara, fasta, datum, brand, koncept, locale };
  if (torr) {
    console.log(`\n[--torr] Ingen bild genererad, ingen fil skriven, butiken orörd. Skulle skriva ${htmlFil}${medGempages ? ` och ${utFil}` : ''}${butik ? (marknad?.egetLand ? ` och lägga upp landets egen sida /pages/${rapport.handle} i ${butik}` : marknad ? ` och lägga översättningen (${locale}) på /pages/${rapport.handle} i ${butik}` : ` och lägga upp /pages/${rapport.handle} i ${butik}`) : ''}. Texterna som skulle sättas:`);
    for (const rad of lasAvSida(sida)) if (rad.tag !== 'Image') console.log(`   ${rad.tag.padEnd(7)} ${String(rad.text ?? '').slice(0, 90)}${rad.link ? `  → ${rad.link}` : ''}`);
    return;
  }
  // Förhandsvisningen får dagens pris inskrivet; butikens body behåller prisplatserna
  // så templates/page.listicle.liquid byter dem i besökarens valuta vid varje visning.
  const html = renderaHtml({ ...htmlArgs, stil: 'inline', prisTokens: 'ersatt' });
  const body = renderaHtml({ ...htmlArgs, stil: 'ingen', prisTokens: 'behall' });
  writeFileSync(htmlFil, html);
  writeFileSync(bodyFil, body);
  console.log(`\n✅ ${htmlFil} (${Buffer.byteLength(html)} byte) — förhandsvisningens underlag`);
  console.log(`✅ ${bodyFil} (${Buffer.byteLength(body)} byte) — sidans body (det som ligger i butiken)`);

  let gempagesFil = null;
  if (medGempages) {
    const zip = tillGempages(sida, manifest);
    mkdirSync(dirname(resolve(utFil)), { recursive: true });
    writeFileSync(utFil, zip);
    const tillbaka = urGempages(readFileSync(utFil));
    const trasiga = granskaChecksummor(tillbaka.sidor[0]);
    if (trasiga.length || tillbaka.sidor.length !== 1) { console.log(`\n❌ .gempages-filen läses inte tillbaka rent (${trasiga.length} checksummor fel).`); process.exit(1); }
    gempagesFil = utFil;
    console.log(`✅ ${utFil} (${zip.length} byte) — .gempages (GemPages → Pages → Import page), ${nyaIdn ? 'nya id:n' : 'mallens id:n'}, ${tillbaka.sidor[0].pageSections.length} sektioner, alla checksummor stämmer.`);
  }

  let fv = null;
  if (!argv.includes('--utan-forhandsvisning')) {
    try {
      fv = await forhandsvisa(produkt.handle, { logg: (r) => console.log(r), htmlFil, mapp, undermapp: tagg ? `forhandsvisning-${tagg}` : 'forhandsvisning', lang: sprak.lang });
    } catch (e) {
      console.log(`   ⚠ förhandsvisningen misslyckades: ${e.message}`);
    }
  }

  // Butiken: temafilerna (en gång), sidan, trippelkollen — eller, på en marknad,
  // översättningen av den befintliga sidan och tillbakaläsning på marknadens domän.
  let publicerat = null;
  if (publicera) {
    console.log('\nButiken:');
    const titel = `${konceptText(kSprak.sidtitel, { produkt: sidProduktBas, n })}${marknad?.egetLand ? ` (${marknad.landEn})` : ''}`;
    // Sidans hero-rubrik MÅSTE synas när sidan läses tillbaka — samma handle bär
    // flera språk, så en strukturellt riktig sida på fel språk är ändå fel. Med
    // prisplatser i copyn jämförs mot dagens pris (det butiken byter in), och
    // platserna själva får inte synas: då har mallen inte bytt dem.
    const rubrikHtml = (c, p = sidProduktBas) => htmlAv(styckenAv(ersattPrisTokens(c?.hero?.rubrik ?? '', p)).join(' '));
    const svenskCopyFil = join(mapp, 'copy.json');
    const svensk = marknad && existsSync(svenskCopyFil) ? lasJsonFil(svenskCopyFil) : null;
    const farInte = [PRIS_TOKEN, JAMFORPRIS_TOKEN, ...(svensk && rubrikHtml(svensk, produkt) && rubrikHtml(svensk, produkt) !== rubrikHtml(copy) ? [rubrikHtml(svensk, produkt)] : [])];
    if (marknad?.egetLand) {
      // Ett land i marknaden: egen sida (engelska i grundspråket), läst tillbaka på marknadens domän med landets ?country=.
      const { publicera: publiceraIButik } = await import('./butik.mjs');
      const sidlank = marknadsSidlank(marknad, rapport.handle);
      publicerat = await publiceraIButik({
        butik, handle: rapport.handle, titel, body, maste: [rubrikHtml(copy)], farInte,
        lasBas: sidlank.replace(/^(https?:\/\/[^/]+).*$/, '$1'), lasSokvag: sidlank.replace(/^https?:\/\/[^/]+/, ''),
        publicerad: !argv.includes('--opublicerad'), logg: (r) => console.log(r),
      });
      publicerat.sida.url = sidlank;
      console.log(`\n✅ ${sidlank} — ${publicerat.sida.skapad ? 'ny sida' : 'sidan uppdaterad'} för ${marknad.namn} i ${publicerat.butik.namn}, läst tillbaka med ?country=${marknad.land}: rätt språk, dagens pris (${sidProduktBas.prisText}) inskrivet av butiken, ingen header/footer.`);
    } else if (marknad) {
      const { publiceraMarknad } = await import('./butik.mjs');
      publicerat = await publiceraMarknad({ butik, marknad, handle: rapport.handle, titel, body, maste: [rubrikHtml(copy)], farInte, logg: (r) => console.log(r) });
      console.log(`\n✅ ${publicerat.sida.url} — översättningen (${locale}) ligger på sidan i ${publicerat.butik.namn}, läst tillbaka på ${marknad.doman} på rätt språk utan header/footer.`);
    } else {
      const { publicera: publiceraIButik } = await import('./butik.mjs');
      publicerat = await publiceraIButik({
        butik, handle: rapport.handle, titel, body, maste: [rubrikHtml(copy)], farInte,
        publicerad: !argv.includes('--opublicerad'), logg: (r) => console.log(r),
      });
      console.log(`\n✅ ${publicerat.sida.url} — ${publicerat.sida.skapad ? 'ny sida' : 'sidan uppdaterad'} i ${publicerat.butik.namn}, läst tillbaka som kund utan header/footer.`);
    }
  }

  const planFilUt = sprakFil('plan', 'json');
  const planObj = {
    byggd: new Date().toISOString(), koncept: koncept.id, punkter: n, datumrad: datum, locale, prisplatser: medTokens, produkt: underlagObj.produkt, marknad: underlagObj.marknad ?? null, copy: copyFil, bildplan: planFil,
    brand: rapport.brand, knappar: knapparTill, butik: butik ?? null,
    bilder: rapport.bilder, html: htmlFil, body: bodyFil, gempages: gempagesFil, forhandsvisning: fv,
    sida: { id: String(sida.id).replace(/^__stort_tal__:/, ''), namn: rapport.namn, handle: rapport.handle },
    publicerat: publicerat ? { url: publicerat.sida.url, sidaId: publicerat.sida.id, skapad: publicerat.sida.skapad ?? false, tema: publicerat.tema ?? null, oversattning: publicerat.oversattning ?? null, kontroll: publicerat.kontroll } : null,
    bildUrler: [...new Set(lasAvSida(sida).filter((r) => r.tag === 'Image').map((r) => r.src))],
  };
  writeFileSync(planFilUt, JSON.stringify(planObj, null, 2) + '\n');
  console.log(`   plan: ${planFilUt}`);
  if (fv?.desktop) console.log(`   titta: ${fv.desktop} och ${fv.mobil ?? '(ingen mobil-skärmdump)'}`);
}

function kolla(fil) {
  const { manifest, info, sidor } = urGempages(readFileSync(fil));
  console.log(`Manifest: ${JSON.stringify(manifest)}`);
  console.log(`Sidor i pages_info: ${JSON.stringify(info).replace(/__stort_tal__:/g, '')}`);
  for (const sida of sidor) {
    const trasiga = granskaChecksummor(sida);
    console.log(`\n"${sida.name}" · handle ${sida.handle} · ${sida.pageSections.length} sektioner · checksummor: ${trasiga.length ? `❌ ${trasiga.length} fel (${trasiga.map((t) => t.cid).join(', ')})` : '✓ alla stämmer'}`);
    for (const rad of lasAvSida(sida)) {
      const dold = rad.dold ? ' (DOLD på alla skärmar)' : '';
      if (rad.tag === 'Image') console.log(`   Image   ${rad.width}×${rad.height} ${rad.src}${dold}`);
      else console.log(`   ${rad.tag.padEnd(7)} ${String(rad.text ?? '').slice(0, 110)}${rad.link ? `  → ${rad.link}` : ''}${dold}`);
    }
  }
}

async function huvud(argv) {
  if (argv.includes('--exempel')) {
    const { mall, platser } = lasMall();
    const copy = copyUrMall(mall, platser);
    const fil = join(HAR, 'mall', 'exempel-copy.json');
    writeFileSync(fil, JSON.stringify(copy, null, 2) + '\n');
    console.log(`✓ ${fil}`);
    return;
  }
  const kollaFil = arg(argv, '--kolla');
  if (kollaFil) return kolla(kollaFil);
  const lank = argv.find((a) => !a.startsWith('--') && !FLAGGOR_MED_VARDE.includes(argv[argv.indexOf(a) - 1]));
  if (!lank) {
    console.error(`Användning: node listicle/bygg.mjs <produktlänk> [--underlag | --torr] [--koncept ${kandaKoncept().join('|')}] [--punkter 5|7] [--butik baverbutiken|<ops-id>] [--marknad US] [--gempages] [--utan-publicering] [--opublicerad] [--lank /products/x] [--brand id] [--copy fil] [--bildplan fil] [--datum YYYY-MM-DD] [--igen plats,…] [--behall-idn] [--utan-forhandsvisning]\n           node listicle/bygg.mjs --kolla <fil.gempages> | --exempel`);
    process.exit(1);
  }
  if (argv.includes('--underlag')) {
    const koncept = lasKoncept(arg(argv, '--koncept') ?? undefined);
    const n = valjPunkter(koncept, arg(argv, '--punkter'));
    const marknad = valjMarknad(argv, valjButik(argv, lank));
    const { produkt, marknadsProdukt, ut, mapp } = await underlag(lank, { koncept, n, marknad, argv });
    const tagg = marknadsTagg(marknad);
    console.log(`✓ ${join(mapp, tagg ? `underlag.${tagg}.json` : 'underlag.json')}`);
    console.log(`   ${koncept.kommando} · ${n} punkter · ${produkt.titel} · ${produkt.prisText}${produkt.jamforprisText ? ` (jämförpris ${produkt.jamforprisText})` : ''} · ${produkt.bilder.length} bilder · dna: ${ut.dna?.fil ?? 'saknas'} · adress /pages/${ut.sidhandle}${ut.sidhandle_kalla ? ` (ur ${ut.sidhandle_kalla})` : ''}`);
    if (marknad) console.log(`   ${marknad.egetLand ? `land ${marknad.land} i marknaden ${marknad.kod}` : `marknad ${marknad.kod}`}: ${marknadsProdukt.titel} · ${marknadsProdukt.prisText}${marknadsProdukt.jamforprisText ? ` (jämförpris ${marknadsProdukt.jamforprisText})` : ''}${marknad.egetLand ? ' (automatisk kursomräkning — skriv [[PRIS]]/[[JAMFORPRIS]] i copyn)' : ''} · ${ut.marknad.lank} · sidan läses på ${ut.marknad.sidlank} · copyn skrivs i copy.${tagg}.json`);
    return;
  }
  await bygg(lank, argv);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Inbyggda fetch följer HTTPS_PROXY bara med NODE_USE_ENV_PROXY — samma omstart som mejl/ och tools/.
  const { spawnSync } = await import('node:child_process');
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
    process.exit(r.status ?? 1);
  }
  huvud(process.argv.slice(2)).catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
