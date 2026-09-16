#!/usr/bin/env node
// bygg.mjs — motorn bakom /lagerrensning: mallen → en ny produkts .gempages.
//
//   node lagerrensning/bygg.mjs <produktlänk> --underlag              # produktfakta till copy-subagenten → output/<handle>/underlag.json
//   node lagerrensning/bygg.mjs <produktlänk> --torr                  # planen: copy-granskning, bildplan, inget nät mot kie/Shopify
//   node lagerrensning/bygg.mjs <produktlänk>                         # skarpt: bilder → Shopify, .gempages (importeras i GemPages) + HTML-förhandsvisning med skärmdumpar
//   node lagerrensning/bygg.mjs <produktlänk> --igen punkt2,punkt5    # generera om vissa kie-bilder
//   node lagerrensning/bygg.mjs --kolla <fil.gempages>                # läs en byggd fil: texter, länkar, bilder, checksummor
//   node lagerrensning/bygg.mjs --exempel                             # mallens copy som JSON (formen subagenten ska följa)
//
// Flaggor: --copy <fil> --bildplan <fil> --ut <fil> --datum YYYY-MM-DD --behall-idn --utan-forhandsvisning
//          --brand <id>   brandprofil (lagerrensning/brand/<id>.json). UTAN flaggan är sidan OBRANDAD:
//                         "Anders på lagret", ingen logga, bara "OBS: Detta är reklam." i sidfoten —
//                         så samma fil funkar i en annan butik (Axels beslut 2026-09-16).
//          --lank <url>   knapparnas länk (standard: produktsidan i källbutiken). För en annan butik:
//                         den butikens produktlänk. Filen får då suffixet -<butikens värd> så den inte
//                         skriver över källbutikens fil.
// Standardfiler: lagerrensning/output/<handle>/{underlag,copy,bildplan,bilder,plan}.json
//                lagerrensning/output/<handle>/<slug>-lagerrensning.gempages   ← leveransen (GemPages → Pages → Import page), nya id:n
//                lagerrensning/output/<handle>/<slug>-lagerrensning.html       ← samma sida som HTML, bara för förhandsvisningen
//                lagerrensning/output/<handle>/forhandsvisning/{desktop,mobil}.png + utsnitt (gitignorerat)
//
// Stoppar (exit 1) på: pris i copyn som inte står på produktsidan, procentsats,
// HTML i copyn, förbjuden fras, saknad text- eller bildplats. Skriver aldrig
// en fil som inte går att läsa tillbaka med rätt checksummor.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { hamtaProdukt } from './produkt.mjs';
import { lasMall, byggSida, granskaCopy, copyUrMall, tillGempages, urGempages, granskaChecksummor, lasAvSida, idag, brandProfil, kandaBrand } from './gempages.mjs';
import { granskaBildplan, losBilder } from './bilder.mjs';
import { renderaHtml, mallBilder } from './html.mjs';
import { forhandsvisa } from './forhandsvisning.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..');
export const OUTPUT_MAPP = join(HAR, 'output');

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

async function underlag(lank, { torr = false } = {}) {
  const produkt = await hamtaProdukt(lank);
  const mapp = join(OUTPUT_MAPP, produkt.handle);
  const dna = hittaDna(produkt.handle);
  const ut = {
    hamtat: new Date().toISOString(),
    produkt: {
      titel: produkt.titel, kortTitel: produkt.kortTitel, handle: produkt.handle, url: produkt.url, typ: produkt.typ,
      pris: produkt.pris, jamforpris: produkt.jamforpris, prisText: produkt.prisText, jamforprisText: produkt.jamforprisText,
      flerPriser: produkt.flerPriser, alternativ: produkt.alternativ, antalVarianter: produkt.varianter.length,
      bilder: produkt.bilder.map((b, i) => ({ index: i + 1, src: b.src, width: b.width, height: b.height })),
      beskrivning: produkt.beskrivning,
    },
    dna,
    sidhandle: `${produkt.slug}-lagerrensning`,
  };
  if (!torr) {
    mkdirSync(mapp, { recursive: true });
    writeFileSync(join(mapp, 'underlag.json'), JSON.stringify(ut, null, 2) + '\n');
  }
  return { produkt, ut, mapp };
}

async function bygg(lank, argv) {
  const torr = argv.includes('--torr');
  const { produkt, ut: underlagObj, mapp } = await underlag(lank, { torr });
  const { mall, platser, manifest } = lasMall();
  const copyFil = arg(argv, '--copy') ?? join(mapp, 'copy.json');
  const planFil = arg(argv, '--bildplan') ?? join(mapp, 'bildplan.json');
  const cacheFil = join(mapp, 'bilder.json');
  const datum = arg(argv, '--datum') ?? idag();
  const igen = (arg(argv, '--igen') ?? '').split(',').map((s) => s.trim()).filter(Boolean);

  // Brandet: obrandad som standard. Knapparna: produktsidan i källbutiken, eller
  // --lank för en annan butik (då får filen ett suffix så källbutikens fil står kvar).
  const brand = brandProfil(arg(argv, '--brand'));
  const annanLank = arg(argv, '--lank');
  if (annanLank && !/^https:\/\/[^/\s]+\/.+/.test(annanLank)) throw new Error(`--lank måste vara en https-länk till produktsidan i den andra butiken, fick "${annanLank}".`);
  const annanButik = annanLank && new URL(annanLank).host !== new URL(produkt.url).host ? new URL(annanLank).host.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '') : null;
  const knapparTill = annanLank ?? produkt.url;
  const filBas = `${produkt.slug}-lagerrensning${annanButik ? `-${annanButik.replace(/\./g, '-')}` : ''}`;
  const utFil = arg(argv, '--ut') ?? join(mapp, `${filBas}.gempages`);

  console.log(`Produkt: ${produkt.titel}`);
  console.log(`   ${produkt.url}`);
  console.log(`   pris ${produkt.prisText}${produkt.jamforprisText ? ` · jämförpris ${produkt.jamforprisText}` : ' · INGET jämförpris på sidan'}${produkt.flerPriser ? ` · ⚠ flera priser (${produkt.flerPriser.join(', ')}), lägsta används` : ''}`);
  console.log(`   ${produkt.bilder.length} produktbilder · dna: ${underlagObj.dna?.fil ?? 'saknas'}`);
  if (!produkt.jamforpris) console.log('   ⚠ Utan jämförpris finns inget "istället för" — sätt compare-at i Shopify eller skriv copyn utan.');
  console.log(`\nBrand: ${brand.namn ? `${brand.namn} (--brand ${brand.id}: "${brand.forfattare}", logga${brand.support ? `, ${brand.support}` : ''})` : `OBRANDAD — "${brand.forfattare}", ingen logga, bara "OBS: Detta är reklam." i sidfoten. Samma fil funkar i en annan butik.${kandaBrand().length ? ` Brandad sida: --brand ${kandaBrand().join(' | ')}` : ''}`}`);
  console.log(`Knappar: → ${knapparTill}${annanButik ? ` (annan butik: ${annanButik}, filen får suffixet -${annanButik.replace(/\./g, '-')})` : annanLank ? '' : ' (källbutiken — i en annan butik: kör om med --lank https://<butik>/products/<handle>)'}`);

  if (!existsSync(copyFil)) {
    console.log(`\n❌ Copyn saknas: ${copyFil}\n   Skriv den själv (se .claude/commands/lagerrensning.md steg 3), formen finns i lagerrensning/mall/exempel-copy.json.`);
    process.exit(1);
  }
  const copy = lasJsonFil(copyFil);
  const g = granskaCopy(copy, produkt, platser, { brand });
  console.log(`\nCopy: ${copyFil}`);
  for (const v of g.varningar) console.log(`   ⚠ ${v}`);
  for (const f of g.fel) console.log(`   ❌ ${f}`);
  if (g.fel.length) { console.log(`\n❌ ${g.fel.length} fel i copyn — rätta och kör igen.`); process.exit(1); }
  console.log(`   ✓ priser, procent, fraser, brandnamn och alla ${Object.keys(platser.text).length} textplatser kontrollerade`);

  let plan = {};
  if (existsSync(planFil)) plan = lasJsonFil(planFil);
  else console.log(`\n⚠ Ingen bildplan (${planFil}) — alla sex bildplatser måste stå där.`);
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
    cache, igen, torr, generera, laddaUpp, hamta, sparaLokalt, logg: (r) => console.log(r), filnamnBas: `${produkt.slug}-lagerrensning`,
  });
  if (!torr) writeFileSync(cacheFil, JSON.stringify(nyCache, null, 2) + '\n');

  // Nya sid- och sektions-id:n som STANDARD: mallens id:n tillhör motorhöljets
  // riktiga sida i samma butik, och en import som bär dem riskerar att krocka
  // med eller skriva över den. Ett import från en annan butik bär alltid
  // främmande id:n, så det är den vanliga vägen för GemPages. `--behall-idn`
  // finns kvar för att felsöka en avvisad import.
  const nyaIdn = !argv.includes('--behall-idn');
  const sidProdukt = { ...produkt, url: knapparTill };
  const { sida, rapport } = byggSida({ mall, platser, produkt: sidProdukt, copy, bilder: torr ? Object.fromEntries(Object.entries(bilder).filter(([, b]) => b.src && b.width > 0)) : bilder, datum, brand, nyaIdn });

  console.log(`\nSida: "${rapport.namn}" · handle ${rapport.handle} · datumrad ${datum} · ${rapport.brand.namn ? `brand ${rapport.brand.namn}` : 'obrandad'}`);
  console.log(`   ${rapport.texter.length} texter, ${rapport.lankar} knappar → ${knapparTill}, ${rapport.bilder.length} bilder bytta, författarrad "Av ${rapport.brand.forfattare}.", logga ${rapport.brand.logga ? 'visas' : 'dold'}`);

  const htmlFil = join(mapp, `${filBas}.html`);
  if (torr) {
    console.log(`\n[--torr] Ingen bild genererad, ingen fil skriven. Skulle skriva ${utFil} (importfilen) och ${htmlFil} (förhandsvisning). Texterna som skulle sättas:`);
    for (const rad of lasAvSida(sida)) if (rad.tag !== 'Image') console.log(`   ${rad.tag.padEnd(7)} ${String(rad.text ?? '').slice(0, 90)}${rad.link ? `  → ${rad.link}` : ''}`);
    return;
  }

  const zip = tillGempages(sida, manifest);
  mkdirSync(dirname(resolve(utFil)), { recursive: true });
  writeFileSync(utFil, zip);

  // Trippelkoll: läs tillbaka filen och räkna om varje checksumma.
  const tillbaka = urGempages(readFileSync(utFil));
  const trasiga = granskaChecksummor(tillbaka.sidor[0]);
  const kvarMotor = lasAvSida(tillbaka.sidor[0]).filter((r) => /motorhölje|motorhöljen|kåpa|utombordare|båtägar/i.test(String(r.text ?? '')));
  if (trasiga.length || tillbaka.sidor.length !== 1) { console.log(`\n❌ Filen läses inte tillbaka rent (${trasiga.length} checksummor fel).`); process.exit(1); }
  if (kvarMotor.length && produkt.handle !== 'marin-motorholje-420d-universellt-skydd') {
    console.log(`\n⚠ ${kvarMotor.length} text(er) nämner fortfarande motorhöljet/båtar — läs copyn igen:`);
    for (const r of kvarMotor) console.log(`   ${r.uid}: ${String(r.text).slice(0, 100)}`);
  }
  const sidBilder = lasAvSida(tillbaka.sidor[0]).filter((r) => r.tag === 'Image').map((r) => r.src);

  // HTML-versionen: samma copy, samma bilder, samma datum — underlaget för
  // förhandsvisningen (skärmdumparna sessionen tittar på). GemPages tar bara
  // .gempages-filer (Axel 2026-09-16), så HTML:en är kontroll, inte leverans.
  const html = renderaHtml({ copy, produkt: sidProdukt, bilder, fasta: mallBilder(mall, platser), datum, brand });
  writeFileSync(htmlFil, html);
  console.log(`\n✅ ${utFil} (${zip.length} byte) — .gempages att importera (Pages → Import page), ${nyaIdn ? 'nya id:n' : 'mallens id:n'}, ${rapport.brand.namn ? `brand ${rapport.brand.namn}` : 'obrandad'}, läst tillbaka, ${tillbaka.sidor[0].pageSections.length} sektioner, alla checksummor stämmer.`);
  console.log(`✅ ${htmlFil} (${Buffer.byteLength(html)} byte) — HTML-version för förhandsvisningen.`);

  let fv = null;
  if (!argv.includes('--utan-forhandsvisning')) {
    try {
      fv = await forhandsvisa(produkt.handle, { logg: (r) => console.log(r), htmlFil });
    } catch (e) {
      console.log(`   ⚠ förhandsvisningen misslyckades: ${e.message}`);
    }
  }

  const planObj = {
    byggd: new Date().toISOString(), datumrad: datum, produkt: underlagObj.produkt, copy: copyFil, bildplan: planFil,
    brand: rapport.brand, knappar: knapparTill,
    bilder: rapport.bilder, html: htmlFil, fil: utFil, forhandsvisning: fv,
    sida: { id: String(tillbaka.sidor[0].id).replace(/^__stort_tal__:/, ''), namn: rapport.namn, handle: rapport.handle },
    checksummor: tillbaka.sidor[0].pageSections.map((s) => ({ cid: s.cid, checksum: s.checksum })),
    bildUrler: [...new Set(sidBilder)],
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
  const lank = argv.find((a) => !a.startsWith('--') && !['--copy', '--bildplan', '--ut', '--datum', '--igen', '--kolla', '--brand', '--lank'].includes(argv[argv.indexOf(a) - 1]));
  if (!lank) {
    console.error('Användning: node lagerrensning/bygg.mjs <produktlänk> [--underlag | --torr] [--brand id] [--lank https://<annan butik>/products/<handle>] [--copy fil] [--bildplan fil] [--ut fil] [--datum YYYY-MM-DD] [--igen plats,…] [--behall-idn] [--utan-forhandsvisning]\n           node lagerrensning/bygg.mjs --kolla <fil.gempages> | --exempel');
    process.exit(1);
  }
  if (argv.includes('--underlag')) {
    const { produkt, ut, mapp } = await underlag(lank);
    console.log(`✓ ${join(mapp, 'underlag.json')}`);
    console.log(`   ${produkt.titel} · ${produkt.prisText}${produkt.jamforprisText ? ` (jämförpris ${produkt.jamforprisText})` : ''} · ${produkt.bilder.length} bilder · dna: ${ut.dna?.fil ?? 'saknas'}`);
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
