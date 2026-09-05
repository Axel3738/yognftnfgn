#!/usr/bin/env node
// notion-fil.mjs — hämtar hem creativen från en Notion-rad så den går att QA:a och
// ladda upp. Två vägar, i ordning:
//   1. Bilaga i "Filer och media" (/bildannonser lagger bilden dar; bildannonser/
//      output/ ar gitignorerat och dor med containern, sa bilagan ar enda kopian).
//   2. Drive-mapp lankad sist i sidans kropp ("Link for approval: …") — sa levererar
//      redigerarna sina videor. Hamtas publikt via Drives export-URL.
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
import { execFileSync } from 'node:child_process';
import { hämtaFil, driveLankarIKropp } from './notion-kalla.mjs';

const ROT = new URL('..', import.meta.url).pathname;

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

// Ingen bilaga: redigerarnas videor ligger i en Drive-mapp lankad sist i sidan
// ("Link for approval: …"). Sidan bar aven brief-mappen, sa lankarna provas sista
// forst och den forsta med media vinner. Hamtas via Drives publika export-URL.
if (!filer.length) {
  const lankar = await driveLankarIKropp(pageId);
  if (!lankar.length) dö(`Raden "${titel}" har varken fil i "Filer och media" eller Drive-länk i sidan — inget att hämta. Fråga redigeraren.`);
  let hittade = [];
  for (const k of lankar) {
    if (k.typ === 'fil') { hittade = [{ id: k.id, titel: `${titel}.mp4` }]; break; }
    let rader = [];
    try {
      rader = execFileSync('python3', [`${ROT}tools/drive-ls.py`, k.id], { encoding: 'utf8', timeout: 60000 })
        .trim().split('\n').filter(Boolean).map(r => { const [typ, id, ...t] = r.split('\t'); return { typ, id, titel: t.join('\t') }; });
    } catch { continue; }
    hittade = rader.filter(r => r.typ === 'fil' && /\.(mp4|mov|m4v|jpg|jpeg|png)$/i.test(r.titel));
    if (hittade.length) break;
  }
  if (!hittade.length) dö(`Raden "${titel}": Drive-länk finns (${lankar.map(k => k.id).join(', ')}) men ingen video i mappen — inte klar.`);
  let m = 0;
  for (const f of hittade) {
    const bas = hittade.length > 1 ? `${titel}_${++m}` : titel;
    const mål = join(ut, `${bas.replace(/[^\w åäöÅÄÖ.-]/g, '_')}${extname(f.titel) || '.mp4'}`);
    try {
      await hämtaDrive(f.id, mål);
      console.log(mål);
    } catch (e) {
      dö(`${titel}: ${e.message}`);
    }
  }
  process.exit(0);
}

/** Publik Drive-nedladdning. Stora filer far en "virus scan"-sida i stallet for
 *  bytes — da hamtas om via usercontent-vagen med confirm=t. */
async function hämtaDrive(id, mål) {
  const { writeFileSync } = await import('node:fs');
  const försök = [
    `https://drive.google.com/uc?export=download&id=${id}`,
    `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`,
  ];
  for (const url of försök) {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`Drive svarade ${res.status} för ${id}`);
    const typ = res.headers.get('content-type') || '';
    const buf = Buffer.from(await res.arrayBuffer());
    if (/text\/html/i.test(typ)) continue;            // bekraftelsesida, prova nasta vag
    writeFileSync(mål, buf);
    return mål;
  }
  throw new Error(`Drive gav bara en bekräftelsesida för ${id} — filen är för stor eller inte publik.`);
}

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
