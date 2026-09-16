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
  brandProfil, kandaBrand, lasKoncept, valjPunkter, konceptText, konceptHandle, platserForPunkter, kandaKoncept,
} from './gempages.mjs';
import { granskaBildplan, losBilder } from './bilder.mjs';
import { renderaHtml, mallBilder } from './html.mjs';
import { forhandsvisa } from './forhandsvisning.mjs';
import { arBaverbutiken, BAVERBUTIKEN } from './butik.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..');
export const OUTPUT_MAPP = join(HAR, 'output');
const FLAGGOR_MED_VARDE = ['--copy', '--bildplan', '--ut', '--datum', '--igen', '--kolla', '--brand', '--lank', '--koncept', '--punkter', '--butik'];

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

async function underlag(lank, { torr = false, koncept, n } = {}) {
  const produkt = await hamtaProdukt(lank);
  const mapp = join(OUTPUT_MAPP, koncept.id, produkt.handle);
  const dna = hittaDna(produkt.handle);
  const ut = {
    hamtat: new Date().toISOString(),
    koncept: koncept.id, kommando: koncept.kommando, punkter: n,
    produkt: {
      titel: produkt.titel, kortTitel: produkt.kortTitel, handle: produkt.handle, url: produkt.url, typ: produkt.typ,
      pris: produkt.pris, jamforpris: produkt.jamforpris, prisText: produkt.prisText, jamforprisText: produkt.jamforprisText,
      flerPriser: produkt.flerPriser, alternativ: produkt.alternativ, antalVarianter: produkt.varianter.length,
      bilder: produkt.bilder.map((b, i) => ({ index: i + 1, src: b.src, width: b.width, height: b.height })),
      beskrivning: produkt.beskrivning,
    },
    dna,
    sidhandle: konceptHandle(koncept, produkt, n),
  };
  if (!torr) {
    mkdirSync(mapp, { recursive: true });
    writeFileSync(join(mapp, 'underlag.json'), JSON.stringify(ut, null, 2) + '\n');
  }
  return { produkt, ut, mapp };
}

async function bygg(lank, argv) {
  const torr = argv.includes('--torr');
  const koncept = lasKoncept(arg(argv, '--koncept') ?? undefined);
  const n = valjPunkter(koncept, arg(argv, '--punkter'));
  const { produkt, ut: underlagObj, mapp } = await underlag(lank, { torr, koncept, n });
  const { mall, platser: basPlatser, manifest } = lasMall();
  const platser = platserForPunkter(basPlatser, n);
  const copyFil = arg(argv, '--copy') ?? join(mapp, 'copy.json');
  const planFil = arg(argv, '--bildplan') ?? join(mapp, 'bildplan.json');
  const cacheFil = join(mapp, 'bilder.json');
  const datum = arg(argv, '--datum') ?? idag();
  const igen = (arg(argv, '--igen') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const medGempages = argv.includes('--gempages');
  const utanPublicering = argv.includes('--utan-publicering');

  // Butiken och knapparna. Obrandad sida som standard (Axels beslut 2026-09-16).
  const brand = brandProfil(arg(argv, '--brand'), { forfattareObrandad: koncept.forfattare_obrandad });
  const butik = valjButik(argv, produkt.url);
  const publicera = !torr && !utanPublicering;
  if (publicera && !butik) throw new Error(`Länken är inte Bäverbutikens — säg vilken butik sidan ska in i: --butik baverbutiken | carashell | … (eller --utan-publicering).`);
  // Knapparna: relativa i butiken. En Bäverbutiks-länk som ska in i en OPS-butik
  // får OPS-handlen ur factory/produkter/; en länk till OPS-butikens egen
  // produktsida (carashell.se/products/takskyddet) är redan rätt handle.
  let knapparTill = arg(argv, '--lank');
  let opsHandle = null;
  if (!knapparTill) {
    if (!butik) knapparTill = produkt.url;
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
  const filBas = `${produkt.slug}-${suffix}`;
  const utFil = arg(argv, '--ut') ?? join(mapp, `${filBas}.gempages`);

  console.log(`Koncept: ${koncept.kommando} (${koncept.namn}) · ${n} punkter · datumrad ${datum}`);
  console.log(`Produkt: ${produkt.titel}`);
  console.log(`   ${produkt.url}`);
  console.log(`   pris ${produkt.prisText}${produkt.jamforprisText ? ` · jämförpris ${produkt.jamforprisText}` : ' · INGET jämförpris på sidan'}${produkt.flerPriser ? ` · ⚠ flera priser (${produkt.flerPriser.join(', ')}), lägsta används` : ''}`);
  console.log(`   ${produkt.bilder.length} produktbilder · dna: ${underlagObj.dna?.fil ?? 'saknas'}`);
  if (koncept.jamforpris_behovs && !produkt.jamforpris) console.log('   ⚠ Utan jämförpris finns inget "istället för" — sätt compare-at i Shopify eller skriv copyn utan.');
  console.log(`Brand: ${brand.namn ? `${brand.namn} (--brand ${brand.id})` : `OBRANDAD — "Av ${brand.forfattare}.", ingen logga, bara "OBS: Detta är reklam." i sidfoten.${kandaBrand().length ? ` Brandad: --brand ${kandaBrand().join(' | ')}` : ''}`}`);
  console.log(`Butik: ${butik ?? '— (ingen publicering)'}${publicera ? ` → sidan läggs upp som /pages/${konceptHandle(koncept, produkt, n)}` : utanPublicering ? ' (--utan-publicering)' : torr ? ' (torr)' : ''}`);
  console.log(`Knappar: → ${knapparTill}${opsHandle ? ` (OPS-handlen ur factory/produkter/)` : ''}`);

  if (!existsSync(copyFil)) {
    console.log(`\n❌ Copyn saknas: ${copyFil}\n   Skriv den själv (se .claude/commands/${koncept.id}.md), formen finns i listicle/mall/exempel-copy.json (${n} punkter).`);
    process.exit(1);
  }
  const copy = lasJsonFil(copyFil);
  const g = granskaCopy(copy, produkt, basPlatser, { brand, koncept, punkter: n });
  console.log(`\nCopy: ${copyFil}`);
  for (const v of g.varningar) console.log(`   ⚠ ${v}`);
  for (const f of g.fel) console.log(`   ❌ ${f}`);
  if (g.fel.length) { console.log(`\n❌ ${g.fel.length} fel i copyn — rätta och kör igen.`); process.exit(1); }
  console.log(`   ✓ priser, procent, fraser, brandnamn och alla ${Object.keys(platser.text).length} textplatser kontrollerade`);

  let plan = {};
  if (existsSync(planFil)) plan = lasJsonFil(planFil);
  else console.log(`\n⚠ Ingen bildplan (${planFil}) — alla ${platser.bilder_som_byts.length} bildplatser måste stå där.`);
  const gb = granskaBildplan(plan, produkt, platser);
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
  const { bilder, cache: nyCache } = await losBilder(gb.poster, produkt, {
    cache, igen, torr, generera, laddaUpp, hamta, sparaLokalt, logg: (r) => console.log(r), filnamnBas: filBas,
  });
  if (!torr) writeFileSync(cacheFil, JSON.stringify(nyCache, null, 2) + '\n');

  // GemPages-sidan byggs alltid (den är gratis och ger --kolla-läsningen), men
  // filen skrivs bara med --gempages. Nya sid-id:n som standard.
  const nyaIdn = !argv.includes('--behall-idn');
  const sidProdukt = { ...produkt, url: knapparTill };
  const bilderKlara = torr ? Object.fromEntries(Object.entries(bilder).filter(([, b]) => b.src && b.width > 0)) : bilder;
  const { sida, rapport } = byggSida({ mall, platser: basPlatser, produkt: sidProdukt, copy, bilder: bilderKlara, datum, brand, koncept, punkter: n, nyaIdn });

  console.log(`\nSida: "${rapport.namn}" · handle ${rapport.handle} · ${rapport.punkter} punkter · ${rapport.brand.namn ? `brand ${rapport.brand.namn}` : 'obrandad'}`);
  console.log(`   ${rapport.texter.length} texter, ${rapport.lankar} knappar → ${knapparTill}, ${rapport.bilder.length} bilder bytta, författarrad "Av ${rapport.brand.forfattare}.", logga ${rapport.brand.logga ? 'visas' : 'dold'}`);
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
  const htmlArgs = { copy, produkt: sidProdukt, bilder: bilderKlara, fasta, datum, brand, koncept };
  if (torr) {
    console.log(`\n[--torr] Ingen bild genererad, ingen fil skriven, butiken orörd. Skulle skriva ${htmlFil}${medGempages ? ` och ${utFil}` : ''}${butik ? ` och lägga upp /pages/${rapport.handle} i ${butik}` : ''}. Texterna som skulle sättas:`);
    for (const rad of lasAvSida(sida)) if (rad.tag !== 'Image') console.log(`   ${rad.tag.padEnd(7)} ${String(rad.text ?? '').slice(0, 90)}${rad.link ? `  → ${rad.link}` : ''}`);
    return;
  }
  const html = renderaHtml({ ...htmlArgs, stil: 'inline' });
  const body = renderaHtml({ ...htmlArgs, stil: 'ingen' });
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
      fv = await forhandsvisa(produkt.handle, { logg: (r) => console.log(r), htmlFil, mapp });
    } catch (e) {
      console.log(`   ⚠ förhandsvisningen misslyckades: ${e.message}`);
    }
  }

  // Butiken: temafilerna (en gång), sidan, trippelkollen.
  let publicerat = null;
  if (publicera) {
    console.log('\nButiken:');
    const { publicera: publiceraIButik } = await import('./butik.mjs');
    publicerat = await publiceraIButik({
      butik, handle: rapport.handle, titel: konceptText(koncept.sidtitel, { produkt, n }), body,
      publicerad: !argv.includes('--opublicerad'), logg: (r) => console.log(r),
    });
    console.log(`\n✅ ${publicerat.sida.url} — ${publicerat.sida.skapad ? 'ny sida' : 'sidan uppdaterad'} i ${publicerat.butik.namn}, läst tillbaka som kund utan header/footer.`);
  }

  const planObj = {
    byggd: new Date().toISOString(), koncept: koncept.id, punkter: n, datumrad: datum, produkt: underlagObj.produkt, copy: copyFil, bildplan: planFil,
    brand: rapport.brand, knappar: knapparTill, butik: butik ?? null,
    bilder: rapport.bilder, html: htmlFil, body: bodyFil, gempages: gempagesFil, forhandsvisning: fv,
    sida: { id: String(sida.id).replace(/^__stort_tal__:/, ''), namn: rapport.namn, handle: rapport.handle },
    publicerat: publicerat ? { url: publicerat.sida.url, sidaId: publicerat.sida.id, skapad: publicerat.sida.skapad, tema: publicerat.tema, kontroll: publicerat.kontroll } : null,
    bildUrler: [...new Set(lasAvSida(sida).filter((r) => r.tag === 'Image').map((r) => r.src))],
  };
  writeFileSync(join(mapp, 'plan.json'), JSON.stringify(planObj, null, 2) + '\n');
  console.log(`   plan: ${join(mapp, 'plan.json')}`);
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
    console.error(`Användning: node listicle/bygg.mjs <produktlänk> [--underlag | --torr] [--koncept ${kandaKoncept().join('|')}] [--punkter 5|7] [--butik baverbutiken|<ops-id>] [--gempages] [--utan-publicering] [--opublicerad] [--lank /products/x] [--brand id] [--copy fil] [--bildplan fil] [--datum YYYY-MM-DD] [--igen plats,…] [--behall-idn] [--utan-forhandsvisning]\n           node listicle/bygg.mjs --kolla <fil.gempages> | --exempel`);
    process.exit(1);
  }
  if (argv.includes('--underlag')) {
    const koncept = lasKoncept(arg(argv, '--koncept') ?? undefined);
    const n = valjPunkter(koncept, arg(argv, '--punkter'));
    const { produkt, ut, mapp } = await underlag(lank, { koncept, n });
    console.log(`✓ ${join(mapp, 'underlag.json')}`);
    console.log(`   ${koncept.kommando} · ${n} punkter · ${produkt.titel} · ${produkt.prisText}${produkt.jamforprisText ? ` (jämförpris ${produkt.jamforprisText})` : ''} · ${produkt.bilder.length} bilder · dna: ${ut.dna?.fil ?? 'saknas'} · blivande adress /pages/${ut.sidhandle}`);
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
