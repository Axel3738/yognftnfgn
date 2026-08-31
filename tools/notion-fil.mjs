#!/usr/bin/env node
// notion-fil.mjs — hämtar hem bilagorna från en Notion-rad så de går att QA:a och
// ladda upp. /bildannonser lagger bilden i "Filer och media"; bildannonser/output/
// ar gitignorerat och dor med containern, sa den har bilagan ar enda kopian.
//
//   node tools/notion-fil.mjs <page-id> [--ut <mapp>]
//
// Skriver ut sokvagen till varje hamtad fil, en per rad — mata den vidare till
// qa-frames.py och notion-till-meta.mjs --fil.
//
// Kräver env NOTION_TOKEN.
//
// ⚠️ Notions fil-URL ar SIGNERAD och kortlivad. Den maste hamtas i samma korning som
// raden lastes — cacha den aldrig, skriv aldrig ned den, skicka den aldrig som flagga
// till ett annat verktyg.

import { mkdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { hämtaFil } from './notion-kalla.mjs';

const args = process.argv.slice(2);
const flagga = (n, s = null) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s;
};
const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

const pageId = args.find(a => !a.startsWith('--') && a !== flagga('ut'));
if (!pageId) dö('Ange <page-id>. Exempel: node tools/notion-fil.mjs 3cc270ab908c817b97c2f74bc93ceaf7 --ut /tmp/qa');

const ut = flagga('ut', '.');
if (!existsSync(ut)) mkdirSync(ut, { recursive: true });

const token = process.env.NOTION_TOKEN;
if (!token) dö('NOTION_TOKEN saknas i miljön. Utan den går bilagan inte att hämta.');

const res = await fetch(`https://api.notion.com/v1/pages/${pageId.replace(/-/g, '')}`, {
  headers: { authorization: `Bearer ${token}`, 'notion-version': '2022-06-28' },
});
const sida = await res.json();
if (!res.ok) dö(`Notion ${res.status}: ${sida.message || res.statusText}`);

const titel = Object.values(sida.properties ?? {})
  .find(p => p.type === 'title')?.title?.map(t => t.plain_text).join('') ?? pageId;

const filer = Object.values(sida.properties ?? {})
  .filter(p => p.type === 'files')
  .flatMap(p => (p.files ?? []).map(f => ({
    namn: f.name ?? '', url: f.file?.url ?? f.external?.url ?? null,
  })))
  .filter(f => f.url);

if (!filer.length) dö(`Raden "${titel}" har ingen fil i "Filer och media" — inget att hämta.`);

let n = 0;
for (const f of filer) {
  // Andelsen tas ur filnamnet, annars ur URL:ens sokvag, annars .jpg (kie.ai levererar bild).
  const frånUrl = extname(new URL(f.url).pathname);
  const ändelse = extname(f.namn) || frånUrl || '.jpg';
  const bas = filer.length > 1 ? `${titel}_${++n}` : titel;
  const mål = join(ut, `${bas.replace(/[^\w åäöÅÄÖ.-]/g, '_')}${ändelse}`);
  try {
    await hämtaFil(f.url, mål);
    console.log(mål);
  } catch (e) {
    dö(`${titel}: ${e.message}`);
  }
}
