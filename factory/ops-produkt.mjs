#!/usr/bin/env node
// ops-produkt.mjs — förarbetet när en NY produkt ska in i en BEFINTLIG
// OPS-butik. Motorn bakom /ops-produkt.
//
//   node factory/ops-produkt.mjs <butik> <källänk> [--id <produkt-id>]
//                                [--prefix <CreativePrefix>] [--torr]
//
//   <butik>     butikens id: carashell, tacklebay, hemvakten … (factory/butiker/<id>.yaml)
//   <källänk>   produktsidan på Bäverbutiken, t.ex.
//               https://baverbutiken.se/products/<handle>
//   --id        produktens id i fabriken (små bokstäver, siffror, bindestreck).
//               Utan flaggan föreslås ett ur titeln och du får bekräfta i filen.
//   --prefix    annonsprefixet. Utan flaggan föreslås ett ur brand + produkt.
//   --torr      visa allt, skriv ingen fil.
//
// Skriptet LÄSER källbutiken över HTTPS och SKRIVER en enda lokal fil:
// factory/produkter/<id>.yaml (utkast ur produkt-mall.yaml). Det rör aldrig
// Shopify, Meta, Notion eller Discord — bygget är `ops.mjs` och annonserna
// är `/ny-annonser`. Kommandot skriver ut exakt vilka rader som ska köras.
//
// VARFÖR DET HÄR FINNS: en andra produkt i en butik är en fälla på tre sätt
// som alla är tysta (factory/FLERPRODUKT.md, mätt 2026-09-09):
//   1. Startsidan och menyn byggs om ur PRODUKTERNA I KÖRNINGEN. Kör man
//      bygget med bara den nya produktfilen försvinner den gamla produkten
//      ur butiken utan felmeddelande. Därför skriver skriptet alltid ut
//      körraden med SAMTLIGA produktfiler.
//   2. `creative_prefix` är det enda fyra system skiljer produkter på. Två
//      produkter med samma prefix ger fel i leveranskön, översättningskön,
//      adsetuppslaget och commission samtidigt. Skriptet vägrar ett prefix
//      som redan används.
//   3. Så fort butiken bär två produkter faller brandnamnet bort som
//      annonsfilter (`register.mjs` → `enprodukt`). Prefixen MÅSTE stämma.
//
// Noll npm-beroenden. Kräver nät mot källbutiken.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lasYaml } from './yaml.mjs';

const FACTORY = dirname(fileURLToPath(import.meta.url));
const ROT = join(FACTORY, '..');

// ------------------------------------------------------------- ren logik
// Allt här nedanför är utan nät och fs — det är det som testas.

/** Produkt-id ur en titel: små bokstäver, siffror, bindestreck, max 40 tecken.
 *  "Taköverdrag Husvagn 6,5 × 3 m – Skyddar…" → "takoverdrag-husvagn". */
export function idUrTitel(titel, ord = 2) {
  const rent = String(titel ?? '')
    .toLowerCase()
    .replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((o) => o && !/^\d+$/.test(o));
  return rent.slice(0, ord).join('-').slice(0, 40);
}

/** Handle ur en produktlänk. Tål query, språkprefix och avslutande slash. */
export function handleUrLank(lank) {
  const m = /\/products\/([^/?#]+)/.exec(String(lank ?? ''));
  return m ? m[1] : null;
}

/** JSON-url för en produktlänk — behåller värd och språkprefix. */
export function produktJsonUrl(lank) {
  const u = String(lank ?? '').split(/[?#]/)[0].replace(/\/+$/, '');
  return /\/products\/[^/]+$/.test(u) ? `${u}.json` : null;
}

/** Prefixförslag: brand + produktens första ord, versal i varje ord, inga å/ä/ö.
 *  ("CaraShell", "Markisen för husvagn") → "CaraShellMarkis". */
export function prefixForslag(brand, titel) {
  const b = String(brand ?? '').replace(/[^A-Za-z0-9]/g, '');
  const ord = idUrTitel(titel, 1).replace(/-/g, '');
  if (!ord) return b;
  return `${b}${ord.charAt(0).toUpperCase()}${ord.slice(1)}`;
}

/** Priser ur produkt-JSON: lägsta variantpris + jämförpris. Tal, inte text. */
export function priserUr(produkt) {
  const v = produkt?.variants ?? [];
  if (!v.length) return { pris: null, jamforpris: null };
  const tal = (x) => (x === null || x === undefined || x === '' ? null : Number(x));
  const priser = v.map((x) => tal(x.price)).filter((x) => x !== null && !Number.isNaN(x));
  const jamf = v.map((x) => tal(x.compare_at_price)).filter((x) => x !== null && !Number.isNaN(x));
  return { pris: priser.length ? Math.min(...priser) : null, jamforpris: jamf.length ? Math.max(...jamf) : null };
}

/** Varianterna som fabriken vill ha dem. En enda "Title/Default Title" = ingen variant. */
export function varianterUr(produkt) {
  const v = produkt?.variants ?? [];
  if (v.length <= 1) return [];
  return v.map((x) => ({ namn: String(x.title ?? '').trim(), sku: String(x.sku ?? '').trim() }))
    .filter((x) => x.namn && !/^default title$/i.test(x.namn));
}

/** Bild-URL:er utan query-sträng (Shopifys ?v=… byts vid varje uppdatering). */
export function bilderUr(produkt) {
  return (produkt?.images ?? []).map((b) => String(b?.src ?? '').split('?')[0]).filter(Boolean);
}

/** Krockar prefixet med en produkt som redan finns? Skiftlägesokänsligt.
 *  `befintliga` = [{ fil, id, prefix, brand }]. */
export function prefixKrock(prefix, befintliga) {
  const p = String(prefix ?? '').trim().toLowerCase();
  if (!p) return null;
  return befintliga.find((x) => String(x.prefix ?? '').trim().toLowerCase() === p) ?? null;
}

/** Körraden för ops.mjs: ALLA produktfiler, aldrig bara den nya.
 *  Stegen som måste tvingas om är de som byggs ur produkterna i körningen. */
export const OMSTEG = ['kollektion', 'startsida', 'meny', 'tema'];
export function byggKorrad(butiksfil, produktfiler) {
  return `node factory/ops.mjs ${butiksfil} ${produktfiler.join(' ')} --resume --igen ${OMSTEG.join(',')}`;
}

/** Fyller mallen med det som gick att läsa maskinellt. Returnerar { yaml, ifyllda, kvar }.
 *  Allt som kräver en människa lämnas tomt och listas i `kvar`. */
export function fyllMall(mall, d) {
  const rader = String(mall).split('\n');
  const ifyllda = [];
  // Sätter ett skalärt fält på EXAKT en rad, inom ett givet toppblock.
  const satt = (block, falt, varde, etikett = null) => {
    if (varde === null || varde === undefined || varde === '') return;
    let iBlock = block === null;
    for (let i = 0; i < rader.length; i += 1) {
      const r = rader[i];
      if (block !== null) {
        if (new RegExp(`^${block}:`).test(r)) { iBlock = true; continue; }
        if (iBlock && /^[a-zA-ZåäöÅÄÖ_]/.test(r) && !new RegExp(`^${block}:`).test(r)) break;
      }
      if (!iBlock) continue;
      // Platshållaren är `""` för text och `0` för tal — båda ska kunna fyllas.
      const m = new RegExp(`^(\\s*)${falt}:\\s*(""|''|0|)\\s*(#.*)?$`).exec(r);
      if (m) {
        const text = typeof varde === 'number' ? String(varde) : `"${String(varde).replace(/"/g, "'")}"`;
        rader[i] = `${m[1]}${falt}: ${text}${m[3] ? `    ${m[3]}` : ''}`;
        ifyllda.push(etikett ?? `${block ?? ''}${block ? '.' : ''}${falt}`);
        return;
      }
    }
  };

  satt('produkt', 'namn', d.titel);
  satt('produkt', 'id', d.id);
  satt('brand', 'namn', d.brand);
  satt('ekonomi', 'pris', d.pris);
  satt('ekonomi', 'jamforpris', d.jamforpris);
  satt('kalla', 'produkt_id', d.kallaProduktId);
  satt('kalla', 'produkt_handle', d.kallaHandle);
  satt('kalla', 'produkt_url', d.kallaUrl);
  satt('meta', 'creative_prefix', d.prefix);

  // Bilderna: ersätt mallens tomma listrad under media.bilder.
  if (d.bilder?.length) {
    const i = rader.findIndex((r) => /^\s*bilder:\s*(#.*)?$/.test(r) && rader.slice(0, 40).length);
    if (i !== -1) {
      const ind = /^(\s*)/.exec(rader[i])[1];
      const tom = rader.findIndex((r, j) => j > i && /^\s*-\s*""\s*(#.*)?$/.test(r));
      if (tom !== -1 && tom <= i + 3) {
        rader.splice(tom, 1, ...d.bilder.map((b) => `${ind}  - "${b}"`));
        ifyllda.push(`media.bilder (${d.bilder.length} st)`);
      }
    }
  }

  const kvar = [
    'ekonomi.inkopskostnad — KRITISKT, stoppar bygget. Axels COGS per styck, inklusive frakt in.',
    'vinkel.huvudvinkel — KRITISKT. Vinkeln + källa (playbook, winning line eller swipe).',
    'malgrupp.beskrivning — KRITISKT. Vem köper, med kundens eget språk.',
    'problem / benefits — KRITISKT, minst ett vardera.',
    'leverantor.url — KRITISKT. Länk till leverantören.',
    'beskrivning.* — block 1 och 3 på produktsidan.',
    'media.gif_problem / media_losning — demo-mp4:erna, krav vid launch.',
    'kalla.annonsprefix + kampanj — källans annonser, fylls av /ny-annonser steg 1.',
    'meta.page_id / pixel_id — butikens, kopieras ALDRIG från en annan verksamhet.',
  ];
  if (!d.varianter?.length) kvar.push('varianter — källan hade en enda variant; fyll i om produkten har fler.');
  else kvar.push(`varianter — källan har ${d.varianter.length} st (${d.varianter.map((v) => v.namn).join(', ')}); skriv in dem i listan.`);
  if (!d.jamforpris) kvar.push('ekonomi.jamforpris — källan saknade jämförpris.');

  return { yaml: rader.join('\n'), ifyllda, kvar };
}

// ------------------------------------------------------------- nät och fs

async function hamtaProdukt(lank) {
  const url = produktJsonUrl(lank);
  if (!url) throw new Error(`"${lank}" ser inte ut som en produktlänk (/products/<handle>).`);
  const res = await fetch(url, { headers: { 'user-agent': 'ops-factory/1.0' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`${url} svarade HTTP ${res.status}. Kontrollera länken.`);
  const json = await res.json();
  if (!json?.product) throw new Error(`${url} innehöll ingen produkt.`);
  return json.product;
}

/** Alla produktfiler som hör till butiken: brand.namn == butikens brand. */
export function produktfilerFor(brand, mapp = join(FACTORY, 'produkter')) {
  const ut = [];
  for (const fil of readdirSync(mapp).filter((f) => f.endsWith('.yaml'))) {
    try {
      const y = lasYaml(readFileSync(join(mapp, fil), 'utf8'));
      const b = y?.brand?.namn ?? '';
      if (String(b).trim().toLowerCase() !== String(brand).trim().toLowerCase()) continue;
      ut.push({ fil: `factory/produkter/${fil}`, id: y?.produkt?.id ?? '', prefix: y?.meta?.creative_prefix ?? '', brand: b });
    } catch { /* trasig yaml — hoppas över, valideringen fångar den */ }
  }
  return ut.sort((a, b) => a.fil.localeCompare(b.fil));
}

async function huvud() {
  const arg = process.argv.slice(2);
  const flagga = (n) => { const i = arg.indexOf(`--${n}`); return i !== -1 && arg[i + 1] && !arg[i + 1].startsWith('--') ? arg[i + 1] : null; };
  const TORR = arg.includes('--torr') || arg.includes('--dry');
  const fria = arg.filter((a, i) => !a.startsWith('--') && !['id', 'prefix'].some((n) => arg[i - 1] === `--${n}`));
  const [butiksId, lank] = fria;
  const do_ = (m) => { console.error(`✗ ${m}`); process.exit(1); };

  if (!butiksId || !lank) {
    console.error('Använd: node factory/ops-produkt.mjs <butik> <källänk> [--id <id>] [--prefix <Prefix>] [--torr]');
    console.error('Exempel: node factory/ops-produkt.mjs carashell https://baverbutiken.se/products/markis-husvagn');
    process.exit(2);
  }

  // 1. Butiken.
  const butiksfil = `factory/butiker/${butiksId}.yaml`;
  if (!existsSync(join(ROT, butiksfil))) {
    const finns = readdirSync(join(FACTORY, 'butiker')).filter((f) => f.endsWith('.yaml')).map((f) => f.replace('.yaml', ''));
    do_(`Butiken "${butiksId}" finns inte. Butiker: ${finns.join(', ')}`);
  }
  const butik = lasYaml(readFileSync(join(ROT, butiksfil), 'utf8'));
  const brand = butik?.butik?.brand;
  if (!brand) do_(`${butiksfil} saknar butik.brand.`);
  const byggd = existsSync(join(FACTORY, 'state', `${butiksId}--_butik.json`));
  console.log(`Butik: ${brand} (${butiksId}) · ${butik?.butik?.myshopify ?? 'ingen myshopify'} · ${byggd ? 'byggd' : '⚠️ INTE byggd än'}`);
  if (!byggd) do_(`${butiksId} har ingen butiksstate — den är inte byggd. Kör /ny-ops för en ny butik i stället.`);

  // 2. Butikens nuvarande produkter.
  const befintliga = produktfilerFor(brand);
  console.log(`Produkter i butiken i dag: ${befintliga.length ? befintliga.map((p) => `${p.id} [${p.prefix || 'INGET PREFIX'}]`).join(' · ') : 'inga'}`);

  // 3. Källan.
  console.log(`\nHämtar ${produktJsonUrl(lank)} …`);
  const kalla = await hamtaProdukt(lank);
  const { pris, jamforpris } = priserUr(kalla);
  const varianter = varianterUr(kalla);
  const bilder = bilderUr(kalla);
  console.log(`Källa: "${kalla.title}"`);
  console.log(`  pris ${pris ?? '—'} · jämförpris ${jamforpris ?? '—'} · ${bilder.length} bilder · ${varianter.length ? `${varianter.length} varianter` : 'ingen variant'}`);

  // 4. Id och prefix.
  const id = flagga('id') ?? idUrTitel(kalla.title);
  if (!/^[a-z0-9-]+$/.test(id)) do_(`Produkt-id "${id}" får bara innehålla små bokstäver, siffror och bindestreck. Ange --id.`);
  if (befintliga.some((p) => p.id === id)) do_(`Produkt-id "${id}" används redan i butiken. Ange ett annat med --id.`);
  const malfil = `factory/produkter/${id}.yaml`;
  if (existsSync(join(ROT, malfil))) do_(`${malfil} finns redan. Ange ett annat --id.`);

  const prefix = flagga('prefix') ?? prefixForslag(brand, kalla.title);
  if (/[åäöÅÄÖ\s]/.test(prefix)) do_(`Prefixet "${prefix}" får inte bära å/ä/ö eller mellanslag (docs/naming-convention.md). Ange --prefix.`);
  const krock = prefixKrock(prefix, befintliga);
  if (krock) do_(`Prefixet "${prefix}" används redan av ${krock.id} (${krock.fil}). Två produkter med samma prefix ger tysta fel i leveranskön, översättningskön, adsetuppslaget och commission. Ange ett eget med --prefix.`);
  console.log(`\nProdukt-id: ${id}${flagga('id') ? '' : ' (föreslaget ur titeln)'}`);
  console.log(`Annonsprefix: ${prefix}${flagga('prefix') ? '' : ' (föreslaget)'} — ledigt i butiken`);

  // 5. Utkastet.
  const mall = readFileSync(join(FACTORY, 'produkt-mall.yaml'), 'utf8');
  const { yaml, ifyllda, kvar } = fyllMall(mall, {
    titel: kalla.title, id, brand, pris, jamforpris, bilder, varianter, prefix,
    kallaProduktId: String(kalla.id), kallaHandle: kalla.handle,
    kallaUrl: String(lank).split(/[?#]/)[0],
  });
  console.log(`\nIfyllt ur källan: ${ifyllda.join(', ')}`);
  if (!TORR) { writeFileSync(join(ROT, malfil), yaml); console.log(`✓ Skrev ${malfil}`); }
  else console.log(`[--torr] Skulle skrivit ${malfil} (${yaml.split('\n').length} rader).`);

  // 6. Vad som återstår, och körordningen.
  const allaFiler = [...befintliga.map((p) => p.fil), malfil];
  console.log(`\n${'—'.repeat(64)}\nKVAR ATT FYLLA I — ${malfil}`);
  for (const k of kvar) console.log(`  · ${k}`);
  console.log(`\nSedan, i ordning:`);
  console.log(`  1. node factory/validera.mjs ${malfil}`);
  console.log(`  2. ${byggKorrad(butiksfil, allaFiler)} --dry-run`);
  console.log(`  3. samma rad utan --dry-run`);
  console.log(`  4. node factory/register.mjs skriv-in     → nyckeln ${butiksId}/${id}`);
  console.log(`  5. /ny-annonser ${id}                     → kampanj + annonser`);
  console.log(`  6. /notionscalercs setup ${butiksId}/${id} → hub + de tre rutinerna`);
  console.log(`\n⚠️ Körraden bär ALLA ${allaFiler.length} produktfilerna med flit. Startsidan, menyn`);
  console.log(`   och produktmallen byggs om ur produkterna i körningen — kör du bara den nya`);
  console.log(`   filen försvinner ${befintliga.map((p) => p.id).join(', ') || 'de gamla produkterna'} ur butiken utan felmeddelande.`);
  if (befintliga.length === 1) {
    console.log(`\n⚠️ Butiken blir FLERPRODUKTS nu. Två följder (factory/FLERPRODUKT.md):`);
    console.log(`   · Brandnamnet "${brand}" slutar gälla som annonsfilter — prefixen är allt som skiljer produkterna.`);
    console.log(`   · Pixeln är delad och Metas köp-event bär ingen produkt. Egen kampanj per produkt,`);
    console.log(`     och break-even per produkt i produktfilen — aldrig ett butiksgemensamt tal.`);
    if (!butik?.butik?.kollektion) {
      console.log(`\n⚠️ ${butiksfil} saknar ett kollektion:-block. Utan det hoppar bygget över`);
      console.log(`   sortimentskollektionen ("enproduktsbutik") och startsidan får ingen sortimentssektion.`);
      console.log(`   Lägg till, som factory/butiker/tacklebay.yaml:`);
      console.log(`     kollektion:\n       handle: sortimentet\n       titel: "Sortimentet"\n       beskrivning: "<p>…</p>"`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
