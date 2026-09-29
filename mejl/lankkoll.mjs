// Provar fraktmejlets knapp som kund, ett språk i taget: öppnar länken
// precis som mejlet bär den (spårningssidan i språkmappen + ?nummer=<MS-…>
// för ett RIKTIGT paket ur spårningsminnet) i Chromium och läser vad kunden
// ser — sidans språk, att paketet hittas, att texten inte är svensk.
// Läs-bart: rör inget i Shopify. Noll beroenden utöver den förinstallerade
// Playwright/Chromium.
//
//   node mejl/lankkoll.mjs matstrumpor              # alla språk i mejl_sprak + svenska
//   node mejl/lankkoll.mjs matstrumpor --bara de,fr
//
// ⚠️ Containern går ut på nätet från USA. Shopify geo-omdirigerar inte
// matstrumpor.se/<mapp>/ (mätt 2026-09-29), men skulle det ske syns den
// slutliga adressen i utskriften — den är det kunden landade på.

import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { byggButik } from './bygg-butik.mjs';
import { lasButik, filerFor } from '../sparning/butik.mjs';
import { bavernummer } from '../sparning/bavernummer.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const PLAYWRIGHT = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROME = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'];
const sov = (ms) => new Promise((ok) => setTimeout(ok, ms));

// Sidans egna ord på språket: "Vi hittar inte det numret" (syns när paketet
// inte hittas).
function sidord(kod) {
  if (kod === 'sv') return { saknas: 'Vi hittar inte det numret' };
  const ord = JSON.parse(readFileSync(join(ROT, '..', 'sparning', 'sprak', `${kod}.json`), 'utf8')).ord;
  return { saknas: ord['Vi hittar inte det numret'] };
}

// Ett riktigt paket på väg, ur spårningsrutinens minne.
export function riktigtNummer(id) {
  const butik = lasButik(id);
  const lage = JSON.parse(readFileSync(filerFor(butik).lage, 'utf8'));
  const [nr] = Object.entries(lage.paket ?? {}).find(([, p]) => p.status === 'IN_TRANSIT') ?? [];
  if (!nr) throw new Error(`${id}: inget paket på väg i spårningsminnet.`);
  return { tracking: nr, nummer: bavernummer(nr, butik.prefix) };
}

export async function kor(id, { bara = null, logg = console.log } = {}) {
  const b = byggButik(id);
  const { nummer } = riktigtNummer(id);
  const fall = [
    { locale: b.sprak.kod, kod: b.sprak.kod, sida: `${b.reg.url}/pages/${b.reg.handle}` },
    ...b.oversattningar.map((o) => ({ locale: o.locale, kod: o.kod, sida: o.sida })),
  ].filter((f) => !bara || bara.includes(f.kod) || bara.includes(f.locale));
  const pw = await import(PLAYWRIGHT);
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  let browser;
  for (const exe of [null, ...CHROME]) {
    if (exe && !existsSync(exe)) continue;
    try {
      browser = await pw.chromium.launch({ headless: true, args: ['--no-sandbox', '--ignore-certificate-errors'], proxy, ...(exe ? { executablePath: exe } : {}) });
      break;
    } catch { /* nästa */ }
  }
  if (!browser) throw new Error('Chromium startade inte.');
  const ut = [];
  const bildMapp = join(ROT, 'output', 'butiker', id, 'lankkoll');
  mkdirSync(bildMapp, { recursive: true });
  try {
    for (const f of fall) {
      const url = `${f.sida}?nummer=${nummer}`;
      const ord = sidord(f.kod);
      const rad = { locale: f.locale, url };
      for (let forsok = 1; forsok <= 4; forsok++) {
        const sida = await browser.newPage({ viewport: { width: 390, height: 900 } });
        try {
          const svar = await sida.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
          rad.status = svar?.status();
          if (rad.status === 429) { await sida.close(); await sov(15000 * forsok); continue; }
          await sida.waitForTimeout(1500);
          rad.slutadress = sida.url();
          rad.lang = await sida.evaluate(() => document.documentElement.lang);
          const text = await sida.evaluate(() => document.body.innerText);
          rad.saknas = Boolean(ord.saknas) && text.includes(ord.saknas);
          rad.nummerSyns = text.replace(/\s/g, '').includes(nummer.replace(/\s/g, ''));
          rad.svenska = f.kod !== 'sv' && /Spåra ditt paket|Paketet är på väg|Vi hittar inte/.test(text);
          await sida.screenshot({ path: join(bildMapp, `${f.locale}.png`) });
        } catch (e) {
          rad.fel = e.message.split('\n')[0];
        } finally {
          await sida.close();
        }
        break;
      }
      const langOk = (rad.lang ?? '').toLowerCase().startsWith(f.kod.toLowerCase());
      // Hittat = paketnumret står på sidan och "hittar inte" gör det inte.
      // (Ordet "Ditt paket" är sidans rubrik för sökrutan, inte ett kvitto —
      // första körningen 2026-09-29 dömde tolv rätta sidor fel på det.)
      rad.ok = rad.status === 200 && langOk && rad.nummerSyns && !rad.saknas && !rad.svenska;
      ut.push(rad);
      logg(`${rad.ok ? '✅' : '❌'} ${f.locale.padEnd(5)} ${rad.status ?? '—'} lang=${rad.lang ?? '—'} ${rad.nummerSyns && !rad.saknas ? 'paketet visas' : 'paketet visas INTE'}${rad.svenska ? ', SVENSK text' : ''}${rad.fel ? `, fel: ${rad.fel}` : ''} — ${rad.slutadress ?? url}`);
      await sov(4000);
    }
  } finally {
    await browser.close();
  }
  return { nummer, rader: ut, ok: ut.every((r) => r.ok) };
}

const arDirekt = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (arDirekt) {
  const args = process.argv.slice(2);
  const id = args.find((a) => !a.startsWith('--')) ?? 'matstrumpor';
  const i = args.indexOf('--bara');
  const bara = i >= 0 ? args[i + 1].split(',') : null;
  const r = await kor(id, { bara });
  console.log(`${r.ok ? '✅ Alla' : '❌ Inte alla'} länkar landar rätt som kund (paket ${r.nummer}).`);
  process.exit(r.ok ? 0 : 1);
}
