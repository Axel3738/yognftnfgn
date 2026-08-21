#!/usr/bin/env node
// Laddar upp Matstrumpor-temat till ett NYTT, OPUBLICERAT tema på matstrumpor.se.
// Följer docs/uppladdning.md steg 2–7. Rör aldrig temat med role MAIN.
//
//   node theme-matstrumpor/tools/ladda-upp.mjs teman        — lista temana i butiken
//   node theme-matstrumpor/tools/ladda-upp.mjs las <temaId> — visa temats verkliga struktur
//   node theme-matstrumpor/tools/ladda-upp.mjs allt [--fran <temaId>]
//
// "allt" kör hela kedjan: duplicera bastemat → ladda upp filerna → koppla in dem
// → bygg produktmallen → skriv ut förhandslänken.
//
// Kräver att appen har read_themes + write_themes. Saknas de svarar Shopify
// "requires merchant approval for read_themes scope" och skriptet stannar direkt.

import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gql, kontrolleraButik } from './shopify.mjs';
import {
  KNAPP_MÖNSTER, byggMall, hittaProduktsektion, kopplaInHead, plockaSchema, slåIhopInställningar,
} from './mall.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KOPIANS_NAMN = 'Matstrumpor CRO';
const BASTEMAN = ['horizon', 'dawn'];

const args = process.argv.slice(2);
const kommando = args.find(a => !a.startsWith('--')) ?? 'teman';
const flagga = n => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? undefined : args[i + 1];
};

const gid = id => (String(id).startsWith('gid://') ? id : `gid://shopify/OnlineStoreTheme/${id}`);
const kortId = id => String(id).split('/').pop();

/* ── Läsa och skriva temafiler ─────────────────────────────────────────── */

async function listaTeman() {
  const d = await gql('{ themes(first: 30) { nodes { id name role } } }');
  return d.themes.nodes;
}

const FIL_FRÅGA = `query($id: ID!, $namn: [String!]) {
  theme(id: $id) {
    files(first: 250, filenames: $namn) {
      nodes {
        filename
        body {
          ... on OnlineStoreThemeFileBodyText { content }
          ... on OnlineStoreThemeFileBodyBase64 { contentBase64 }
          ... on OnlineStoreThemeFileBodyUrl { url }
        }
      }
    }
  }
}`;

async function hämtaFiler(temaId, namn) {
  const d = await gql(FIL_FRÅGA, { id: gid(temaId), namn });
  const ut = new Map();
  for (const n of d.theme.files.nodes) {
    let innehåll = n.body.content;
    if (innehåll == null && n.body.contentBase64) {
      innehåll = Buffer.from(n.body.contentBase64, 'base64').toString('utf8');
    }
    // Stora filer levereras som länk i stället för innehåll.
    if (innehåll == null && n.body.url) innehåll = await (await fetch(n.body.url)).text();
    ut.set(n.filename, innehåll ?? '');
  }
  return ut;
}

async function skrivFiler(temaId, filer) {
  const d = await gql(
    `mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
       themeFilesUpsert(themeId: $id, files: $files) {
         upsertedThemeFiles { filename }
         userErrors { filename code message }
       }
     }`,
    {
      id: gid(temaId),
      files: filer.map(([filename, value]) => ({ filename, body: { type: 'TEXT', value } })),
    },
  );
  const fel = d.themeFilesUpsert.userErrors;
  if (fel?.length) throw new Error(fel.map(f => `${f.filename}: ${f.message}`).join('\n'));
  return d.themeFilesUpsert.upsertedThemeFiles.map(f => f.filename);
}

/* ── Steg 2: duplicera bastemat ────────────────────────────────────────── */

function väljBastema(teman, önskatId) {
  if (önskatId) {
    const t = teman.find(x => kortId(x.id) === kortId(önskatId));
    if (!t) throw new Error(`Hittade inget tema med id ${önskatId}.`);
    return t;
  }
  const träff = teman
    .filter(t => t.role !== 'MAIN')
    .find(t => BASTEMAN.some(b => t.name.toLowerCase().includes(b)));
  if (träff) return träff;

  // Sista utväg: duplicera det publicerade temat. Kopian är opublicerad, så
  // originalet är orört — men Axel ska få veta att det blev så.
  const main = teman.find(t => t.role === 'MAIN');
  if (!main) throw new Error('Butiken har inget tema alls att utgå från.');
  console.log(`⚠️  Inget opublicerat Horizon/Dawn hittades. Duplicerar det publicerade "${main.name}".`);
  console.log('   Kopian blir opublicerad. Originalet rörs inte.');
  return main;
}

async function duplicera(bas) {
  const d = await gql(
    `mutation($id: ID!, $name: String!) {
       themeDuplicate(id: $id, name: $name) {
         theme { id name role }
         userErrors { field message }
       }
     }`,
    { id: gid(bas.id), name: KOPIANS_NAMN },
  );
  const fel = d.themeDuplicate.userErrors;
  if (fel?.length) throw new Error(fel.map(f => f.message).join('; '));

  const tema = d.themeDuplicate.theme;
  if (tema.role === 'MAIN') throw new Error('Kopian blev PUBLICERAD. Avbryter innan något skrivs.');

  // Duplicering är asynkron: temat finns men filerna kan dröja några sekunder.
  for (let i = 0; i < 30; i++) {
    const filer = await hämtaFiler(tema.id, ['layout/theme.liquid']);
    if (filer.get('layout/theme.liquid')) return tema;
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Kopian blev aldrig färdig — layout/theme.liquid dök aldrig upp.');
}

/* ── Steg 3: läs basetemats verkliga struktur ──────────────────────────── */

async function läsStruktur(temaId) {
  const filer = await hämtaFiler(temaId, ['templates/product.json', 'layout/theme.liquid']);
  const råMall = filer.get('templates/product.json');
  if (!råMall) {
    throw new Error('Temat har ingen templates/product.json — mallen är troligen .liquid, och då måste steg 6 göras för hand.');
  }

  const mall = JSON.parse(råMall);
  const huvud = hittaProduktsektion(mall);
  if (!huvud) {
    throw new Error(
      'Hittade ingen produktsektion med köpknapp i templates/product.json.\n' +
      `Sektioner i mallen: ${Object.entries(mall.sections ?? {}).map(([id, s]) => `${id} (${s.type})`).join(', ')}\n` +
      'Steg 6 måste göras för hand mot den här mallen.',
    );
  }

  const [huvudId, huvudSektion] = huvud;
  const sektionsfil = `sections/${huvudSektion.type}.liquid`;
  const sektionsLiquid = (await hämtaFiler(temaId, [sektionsfil])).get(sektionsfil) ?? '';
  const schema = plockaSchema(sektionsLiquid);

  const blockTyper = (schema?.blocks ?? []).map(b => b.type);
  return {
    mall, råMall, huvudId, huvudSektion, sektionsfil, schema, blockTyper,
    tarEmotTemablock: blockTyper.includes('@theme'),
    layout: filer.get('layout/theme.liquid'),
  };
}

/* ── Steg 4: våra filer ────────────────────────────────────────────────── */

async function våraFiler() {
  const ut = [];
  for (const mapp of ['assets', 'snippets', 'blocks', 'sections']) {
    for (const namn of await readdir(join(ROT, mapp))) {
      if (!namn.startsWith('ms-')) continue;
      ut.push([`${mapp}/${namn}`, await readFile(join(ROT, mapp, namn), 'utf8')]);
    }
  }
  return ut;
}

/* ── Körningen ─────────────────────────────────────────────────────────── */

// Saknad behörighet är det enda fel som är väntat här, och det ser ut som ett
// kraschat skript om man inte fångar det. Säg i stället vad som ska göras.
function förklara(fel) {
  const scope = fel.message.match(/`?(read|write)_(themes|files)`?/)?.[0]?.replace(/`/g, '');
  if (!scope && !/merchant approval/.test(fel.message)) return null;
  return [
    '❌ Appen får inte läsa eller skriva teman i den här butiken.',
    '',
    `   Shopify svarade: ${fel.message.split('\n')[0]}`,
    '',
    '   Så här öppnas det (tar en minut, i Shopify-adminen för matstrumpor.se):',
    '     Inställningar → Appar och försäljningskanaler → Utveckla appar',
    '     → appen som används här → Konfiguration → Admin API-omfattning',
    '     → kryssa i read_themes och write_themes → Spara → Installera om appen',
    '',
    '   Vill du att jag även ska kunna läsa trafiken: kryssa i read_orders och',
    '   read_reports samtidigt, så slipper du gå tillbaka.',
  ].join('\n');
}

const butik = await kontrolleraButik();
console.log(`Butik: ${butik.name} · ${butik.myshopifyDomain}\n`);

process.on('uncaughtException', fel => {
  const text = förklara(fel);
  console.error(text ?? `❌ ${fel.message}`);
  process.exit(1);
});
process.on('unhandledRejection', fel => {
  const text = förklara(fel);
  console.error(text ?? `❌ ${fel.message}`);
  process.exit(1);
});

if (kommando === 'teman') {
  for (const t of await listaTeman()) {
    console.log(`${t.role === 'MAIN' ? '🔴 PUBLICERAT ' : '⚪ opublicerat'}  ${kortId(t.id).padEnd(14)} ${t.name}`);
  }
  console.log('\nKör "allt" för att duplicera ett bastema och ladda upp.');
  process.exit(0);
}

if (kommando === 'las') {
  const id = flagga('tema') ?? args[1];
  if (!id) throw new Error('Ange tema-id: las <temaId>');
  const s = await läsStruktur(id);
  console.log(`Produktsektion : ${s.huvudId} (${s.huvudSektion.type})`);
  console.log(`Sektionsfil    : ${s.sektionsfil}`);
  console.log(`Tar temablock  : ${s.tarEmotTemablock ? 'JA' : 'NEJ'}`);
  console.log(`custom_liquid  : ${s.blockTyper.includes('custom_liquid') ? 'JA — den vägen används i stället' : 'NEJ'}`);
  console.log(`Blocktyper     : ${Object.values(s.huvudSektion.blocks ?? {}).map(b => b.type).join(', ')}`);
  console.log(`Köpknappen     : ${Object.values(s.huvudSektion.blocks ?? {}).find(b => KNAPP_MÖNSTER.test(b.type ?? ''))?.type ?? 'HITTAD EJ'}`);
  console.log(`\ntemplates/product.json:\n${s.råMall}`);
  process.exit(0);
}

if (kommando !== 'allt') {
  console.error(`Okänt kommando "${kommando}". Använd: teman | las <id> | allt`);
  process.exit(1);
}

// Steg 2
const teman = await listaTeman();
const bas = väljBastema(teman, flagga('fran'));
console.log(`Steg 2  Bastema: ${bas.name} (${bas.role})`);
const kopia = await duplicera(bas);
console.log(`        Kopia: ${KOPIANS_NAMN} · id ${kortId(kopia.id)} · role ${kopia.role}\n`);

// Steg 3
const struktur = await läsStruktur(kopia.id);
console.log(`Steg 3  Produktsektion: ${struktur.huvudId} (${struktur.huvudSektion.type})`);
console.log(`        Väg in i köprutan: ${struktur.tarEmotTemablock ? 'temablock' : 'custom_liquid'}\n`);

// Steg 4
const skrivna = await skrivFiler(kopia.id, await våraFiler());
console.log(`Steg 4  ${skrivna.length} filer uppladdade.\n`);

// Steg 5
const inkoppling = [];
const nyLayout = kopplaInHead(struktur.layout);
if (nyLayout) inkoppling.push(['layout/theme.liquid', nyLayout]);

const fragment = JSON.parse(await readFile(join(ROT, 'config/settings_schema.fragment.json'), 'utf8'));
const råSchema = (await hämtaFiler(kopia.id, ['config/settings_schema.json'])).get('config/settings_schema.json');
if (råSchema) inkoppling.push(['config/settings_schema.json', slåIhopInställningar(råSchema, fragment)]);

if (inkoppling.length) await skrivFiler(kopia.id, inkoppling);
console.log(`Steg 5  ${inkoppling.map(([f]) => f).join(', ') || 'ms-head fanns redan, inget att ändra'}\n`);

// Steg 6
await skrivFiler(kopia.id, [['templates/product.json', JSON.stringify(byggMall(struktur), null, 2)]]);
console.log('Steg 6  templates/product.json byggd.\n');

// Steg 7
console.log('Steg 7  Förhandslänk:');
console.log(`        https://matstrumpor.se/?preview_theme_id=${kortId(kopia.id)}`);
console.log('\nTemat är OPUBLICERAT. Publicera bara efter Axels ord.');
