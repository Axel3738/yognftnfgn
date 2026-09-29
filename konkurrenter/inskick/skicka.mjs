#!/usr/bin/env node
// konkurrenter/inskick/skicka.mjs — skickar in EN Meta-anmälan ur ett fältpaket
// (konkurrenter/arenden/<id>/anmalan/<nr>.json) i Metas upphovsrättsformulär,
// från containern, med den förinstallerade Chromium via playwright-core.
//
//   node konkurrenter/inskick/skicka.mjs KD-2026-001 --nr 1 --torr     fyller allt, begär koden, stannar FÖRE Skicka (skärmdump)
//   node konkurrenter/inskick/skicka.mjs KD-2026-001 --nr 1            skarpt: fyller, väntar på koden, skickar, skriver kvittot
//   node konkurrenter/inskick/skicka.mjs KD-2026-001 --nr 1 --kod 123456   koden given direkt (annars väntar skriptet på kodfilen)
//
// Formuläret (mätt 2026-09-29, utloggat, från containern — den andra sessionens
// "403 från containern" gällde inte formuläret): fyra steg på en sida.
//   1. Copyright / Trademark / Counterfeit                → Copyright
//   2. Facebook / Instagram / Threads / …                 → Facebook
//   3. Where are you asserting rights? (land) · Are you the rights owner?
//      (Yes / No, but I'm authorized … / No) · What is the name of the rights owner?
//   4. URLs/IDs (max 30 — vi skickar EN per anmälan) · "Provide an example of
//      your copyrighted work" (EN riktig URL, "Invalid URL" annars, inga
//      molnlagringar) · beskrivning · (valfritt) domstolsbeslut som bilaga —
//      det är det ENDA filfältet, alltså ingen bilaga för bevisbilden: länken
//      till bevisbilden står i beskrivningen · Your full name · Email + Confirm
//      email · "Request code": engångskod till e-posten, som måste skrivas in ·
//      Declaration statement (ingen kryssruta, gäller vid Skicka) ·
//      Electronic signature · Submit.
//
// Koden: formuläret mejlar en engångskod till anmälarens adress. Skriptet kan
// inte läsa mejl — sessionen läser koden (Gmail-connectorn) och skriver den i
// filen arenden/<id>/anmalan/<nr>.kod; skriptet väntar på filen (max 6 min)
// eller tar --kod. Ingen kod ⇒ ingen inskickning.
//
// ⛔ Skarpt bara på Axels "kör anmälningarna <id>" — det är hans enda verifiering
// (kommandofilen). Skriptet skickar aldrig utan att paketet är komplett, och
// aldrig en anmälan som redan har kvitto (<nr>.kvitto.json).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = dirname(dirname(HAR));
const require = createRequire(import.meta.url);

export const CHROME_KANDIDATER = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'];
const FORMULAR = 'https://www.facebook.com/help/contact/1758255661104383';
const KODVANTAN_MS = 6 * 60_000;

const args = process.argv.slice(2);
const har = (f) => args.includes(`--${f}`);
const flagga = (f) => { const i = args.indexOf(`--${f}`); return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null; };
const logg = (s) => console.error(s);
const vanta = (ms) => new Promise((r) => setTimeout(r, ms));

/** Beskrivningen i formuläret: paketets tre texter i ett fält (formuläret har bara ett). Ren. */
export function beskrivning(falt) {
  return [falt.contentDescription, '', `Our copyrighted work: ${falt.originalWorkDescription}`, ...(falt.originalWorkUrls ?? []).slice(1).map((u) => `Also see: ${u}`), '', falt.additionalInfo].filter((r) => r !== undefined && r !== null).join('\n').trim();
}

/** Metas referens ur bekräftelsetexten ("Report number: 123…", "Reference #", "Case ID"). Ren. */
export function referensUr(text) {
  const t = String(text ?? '');
  const m = t.match(/(?:report|reference|case|ticket)\s*(?:number|no\.?|#|id)?\s*[:#]?\s*([A-Z0-9][A-Z0-9-]{5,})/i) ?? t.match(/\b(\d{9,})\b/);
  return m ? m[1] : null;
}

async function main() {
  const id = args.find((a) => /^KD-\d{4}-\d{3}$/.test(a));
  const nr = flagga('nr');
  if (!id || !nr) { console.error('Ange ärende-id (KD-ÅÅÅÅ-NNN) och --nr <n>.'); process.exit(1); }
  const mapp = join(ROT, 'konkurrenter', 'arenden', id, 'anmalan');
  const paketFil = join(mapp, `${nr}.json`);
  if (!existsSync(paketFil)) { console.error(`${paketFil} saknas — kör node konkurrenter/kor.mjs --anmal ${id} först.`); process.exit(1); }
  const kvittoFil = join(mapp, `${nr}.kvitto.json`);
  const torr = har('torr');
  if (!torr && existsSync(kvittoFil)) { console.error(`${id} anmälan ${nr} har redan ett kvitto (${kvittoFil}) — skickas aldrig två gånger.`); process.exit(2); }
  const paket = JSON.parse(readFileSync(paketFil, 'utf8'));
  const f = paket.falt;
  const brist = [];
  if (!f.contentUrls?.[0]) brist.push('contentUrls');
  if (!f.originalWorkUrls?.[0]) brist.push('originalWorkUrls');
  if (!f.reporter?.fullName) brist.push('reporter.fullName');
  if (!f.reporter?.email) brist.push('reporter.email');
  if (!f.rightsOwner?.name) brist.push('rightsOwner.name');
  if (!f.signature) brist.push('signature');
  if (brist.length) { console.error(`Paketet är ofullständigt: ${brist.join(', ')} — inget skickas.`); process.exit(1); }

  const { chromium } = require('playwright-core');
  const exe = CHROME_KANDIDATER.find((p) => existsSync(p));
  if (!exe) { console.error('Chromium saknas (/opt/pw-browsers).'); process.exit(1); }
  const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--ignore-certificate-errors'] });
  const ctx = await b.newContext({ locale: 'en-US', viewport: { width: 1200, height: 2600 } });
  const p = await ctx.newPage();
  const skarm = async (namn) => { const fil = join(mapp, `${nr}.${namn}.png`); await p.screenshot({ path: fil, fullPage: true }).catch(() => {}); return fil; };
  const next = async () => { await p.getByRole('button', { name: /^Next$/ }).first().click(); await vanta(1200); };
  const falt = (aria) => p.locator(`[aria-label="${aria}"]`).first();
  try {
    logg(`Anmälan ${nr}/${paket.antal} för ${id}: ${paket.lank}`);
    await p.goto(FORMULAR, { waitUntil: 'networkidle', timeout: 90_000 });
    await p.getByText('Copyright', { exact: true }).first().click(); await next();
    await p.getByText('Facebook', { exact: true }).first().click(); await next();
    // Steg 3: land, roll, rättighetshavare
    await p.locator('[role=combobox]').first().click(); await vanta(500);
    const sv = p.locator('[role=listbox] [role=option], [role=listbox] div, [role=listbox] li').filter({ hasText: /^Sweden$/ }).first();
    if (await sv.count()) await sv.click(); else { await p.keyboard.type('Sweden'); await p.keyboard.press('Enter'); }
    await vanta(400);
    await p.getByText('No, but I’m authorized to represent the rights owner', { exact: true }).first().click();
    await vanta(400);
    await falt('What is the name of the rights owner?').fill(f.rightsOwner.name);
    await next();
    // Steg 4: innehållet, originalet, beskrivningen, kontakten
    await falt("Provide the URLs/IDs leading directly to the content you're reporting").fill(f.contentUrls.join(' '));
    await falt('Provide an example of your copyrighted work that you believe has been infringed').fill(f.originalWorkUrls[0]);
    await falt('Describe how you believe this content infringes your intellectual property rights').fill(beskrivning(f));
    await falt('Your full name').fill(f.reporter.fullName);
    // E-post + bekräftelse: de två textfälten utan aria-label efter "Your full name"
    const epost = p.locator('input[type=text]:not([aria-label])');
    const n = await epost.count();
    if (n < 2) throw new Error(`hittade ${n} e-postfält, väntade 2 — formuläret har ändrats, stanna`);
    await epost.nth(0).fill(f.reporter.email); await epost.nth(1).fill(f.reporter.email);
    await falt('Electronic signature').fill(f.signature);
    await vanta(600);
    const kvar = await p.evaluate(() => (document.body.innerText.match(/(\d+) required fields? remaining/) ?? [])[1] ?? null);
    logg(`  ifyllt; formuläret säger "${kvar ?? '?'} required field(s) remaining" (koden är det som saknas)`);
    // Engångskoden
    let kod = flagga('kod');
    const kodFil = join(mapp, `${nr}.kod`);
    if (!kod) {
      await p.getByRole('button', { name: /Request code/i }).first().click();
      const begard = new Date().toISOString();
      writeFileSync(join(mapp, `${nr}.kod-begard`), `${begard}\n`);
      logg(`  kod begärd ${begard} till ${f.reporter.email} — väntar på ${kodFil} (sessionen läser mejlet och skriver koden dit), max ${KODVANTAN_MS / 60000} min`);
      const start = Date.now();
      while (!existsSync(kodFil) && Date.now() - start < KODVANTAN_MS) await vanta(5000);
      if (!existsSync(kodFil)) { await skarm('utan-kod'); throw new Error('ingen kod inom väntetiden — inget skickat'); }
      kod = readFileSync(kodFil, 'utf8').trim().match(/\d{4,8}/)?.[0] ?? null;
      if (!kod) throw new Error(`${kodFil} innehåller ingen kod`);
    }
    const kodFalt = p.locator('input[aria-label*="code" i], input[placeholder*="code" i], input[type=text]:not([aria-label])').last();
    await kodFalt.fill(kod);
    await vanta(800);
    const kvar2 = await p.evaluate(() => (document.body.innerText.match(/(\d+) required fields? remaining/) ?? [])[1] ?? '0');
    const fore = await skarm(torr ? 'torr' : 'fore-skick');
    logg(`  koden inskriven; "${kvar2} required field(s) remaining"; skärmdump ${fore}`);
    if (torr) { logg('  --torr: stannar före Submit. Inget skickat.'); await b.close(); return; }
    if (Number(kvar2) > 0) throw new Error(`${kvar2} fält saknas fortfarande — skickar inte`);
    await p.getByRole('button', { name: /^Submit$/ }).first().click();
    await vanta(4000);
    const efter = await p.evaluate(() => document.body.innerText);
    const fil = await skarm('kvitto');
    const referens = referensUr(efter);
    const lyckat = /thank you|we've received|has been received|report (?:has been )?submitted|reference/i.test(efter) && !/required fields? remaining/.test(efter);
    const kvitto = { arende: id, nr: Number(nr), lank: paket.lank, skickad: new Date().toISOString(), lyckat, referens, epost: f.reporter.email, svar: efter.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 40), skarmdump: fil };
    writeFileSync(kvittoFil, `${JSON.stringify(kvitto, null, 1)}\n`);
    console.log(JSON.stringify({ lyckat, referens, kvitto: kvittoFil }));
    if (!lyckat) { logg('  ⚠️ bekräftelsen kunde inte läsas som lyckad — läs kvittot och skärmdumpen innan något kvitteras'); process.exitCode = 3; }
    await b.close();
  } catch (e) {
    await skarm('fel');
    await b.close().catch(() => {});
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && /skicka\.mjs$/.test(process.argv[1])) main();
