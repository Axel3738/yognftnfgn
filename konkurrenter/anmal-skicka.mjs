// konkurrenter/anmal-skicka.mjs — fyller i och skickar Metas upphovsrättsformulär
// HÄRIFRÅN, i Chromium, en anmälan i taget (Axels order 2026-09-29: "du fyller i
// allting, och det enda jag vill göra är att bara verifiera … sen skickar du in
// allting"). Klickar på Submit BARA med `ja: true`, som kor.mjs sätter på hans
// "kör anmälningarna <id>". Torrläget fyller i allt, tar skärmdumpen och stannar.
//
// Formuläret kartlagt 2026-09-29 (https://www.facebook.com/help/contact/1758255661104383
// → help.meta.com/requests/1523801815366035, engelska med locale en-GB; svarar 200
// utan inloggning från containern):
//   Steg 1  "What right is being violated or infringed?"   radio Copyright / Trademark / Counterfeit → Next
//   Steg 2  "Select the platform …"                        radio Facebook / Instagram / Threads / … → Next
//   Steg 3  "Tell us more about the copyright owner"       combobox "Where are you asserting rights?" (landet),
//           radio "Are you the rights owner?" Yes / "No, but I'm authorised to represent the rights owner" / No,
//           text "What is the name of the rights owner?" (dyker upp efter ombud-valet) → Next
//   Steg 4  "Tell us more about what you're reporting and submit your report":
//           textarea "Provide the URLs/IDs leading directly to the content that you're reporting" (≤ 30 — vi ger EN)
//           text     "Provide an example of your copyrighted work that you believe has been infringed" (EN URL, max 250)
//           textarea "Describe how you believe that this content infringes your intellectual property rights" (max 500)
//           checkbox "(Optional) If you have a court order …" (rörs inte)
//           text     "Your full name" (max 100) · "Email" · "Confirm email address"
//           knapp    "Request code" → engångskod till e-postadressen → fält för koden
//           text     "Electronic signature" (max 100) · försäkringarna står som text under "Declaration statement"
//           knapp    "Submit"
// Koden landar i Axels Stonebite-Gmail. Skriptet kan inte läsa Gmail: det skriver
// `<kodfil>.begard.json`, SESSIONEN hämtar koden ur Gmail och skriver den i kodfilen,
// skriptet väntar (upp till 8 min) och fyller i. Fälten paras på aria-label/etikett —
// Meta byter dem utan förvarning; ett fält som inte hittas stoppar med klartext,
// det fylls aldrig med en gissning. Referensnumret i kvittot läses ur sidans text.

import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { startaWebblasare } from './adlibrary.mjs';

export const MAX = Object.freeze({ original: 250, beskrivning: 500, namn: 100, signatur: 100 });

const korta = (s, n) => { const t = String(s ?? '').trim(); return t.length <= n ? t : `${t.slice(0, n - 1).trimEnd()}…`; };

/**
 * Beskrivningen (max 500 tecken) ur anmälans fält: vad som kopierats, originalet,
 * bevisbildens länk, referensen. Passagen kortas tills allt får plats. Ren.
 */
export function beskrivning500(a, max = MAX.beskrivning) {
  const f = a.falt ?? {};
  const m = f.contentDescription?.match(/(\d+) words of our advertising copy appear verbatim[\s\S]*?longest identical run is (\d+) consecutive words: "([^"]+)"/);
  const bilder = /image[s]? in the ad (?:is|are) our own copyrighted advertising image/.test(f.contentDescription ?? '');
  // Klippen (anmalan.mjs): rutor ur våra egna klipp — antal, tiderna hos dem och andelen matchande rutor.
  const klipp = f.contentDescription?.match(/video is cut from our own ad film[^:]*: (\d+) still frames from different scenes of the reported video \(at ([^)]+)\)[\s\S]*?and (\d+)% of the reported video/);
  const video = /The ad is a video that uses our material/.test(f.contentDescription ?? '');
  // Källan: filmerna paren kommer ur (anmalan.mjs lägger dem som fält), annars annonsen texten/bilden kommer ur.
  const filmer = Array.isArray(a.filmer) && a.filmer.length ? a.filmer : null;
  const kallor = f.contentDescription?.match(/It copies our ads? ((?:"[^"]+"(?:, )?)+)/)?.[1] ?? null;
  const produkt = a.produkt ?? f.contentDescription?.match(/for the product "([^"]+)"/)?.[1] ?? null;
  const flera = (filmer?.length ?? 0) > 1 ? 's' : '';
  // Originalen i annonsbiblioteket (kor.mjs --original): länkarna till våra egna annonser säger granskaren mer än våra interna filmnamn.
  const org = Array.isArray(a.originaler) ? a.originaler.filter((o) => o?.lank) : [];
  // Kortas i steg när 500 inte räcker — länk-/filmlistan och etiketterna först, så att referensen i slutet alltid får plats
  // (mätt 2026-09-29: tre filmnamn + CDN-länken gav 500 tecken jämnt och "Ref KD-2026-001…" klipptes).
  const bygg = (passage, { antalFilmer = 3, tider = true, bevis = 'Evidence screenshot (ours left, theirs right):', produktNamn = true } = {}) => [
    m ? `Verbatim copy of our ad copy: ${m[2]} consecutive identical words ("${passage}"), ${m[1]} words in total.` : null,
    klipp ? `Its video is cut from our own ad film${flera}: ${klipp[1]} stills from different scenes${tider ? ` (at ${klipp[2]})` : ''} are identical to ours; ${klipp[3]}% of its frames match our film${flera}.` : bilder ? 'It uses our own advertising image (a still frame from our ad video).' : null,
    !m && !bilder && !klipp && video ? 'The video uses our material.' : null,
    org.length
      ? `Original: our ad${Math.min(org.length, antalFilmer) > 1 ? 's' : ''} in the Ad Library ${org.slice(0, antalFilmer).map((o) => o.lank).join(' ')}${produkt && produktNamn ? ` for "${produkt}"` : ''}, published by us before this ad.`
      : filmer
        ? `Original: our ad film${flera} ${filmer.slice(0, antalFilmer).map((x) => `"${x}"`).join(', ')}${filmer.length > antalFilmer ? ' and others' : ''}${produkt && produktNamn ? ` for "${produkt}"` : ''}, published before this ad.`
        : `Original: ${kallor ? `our ad ${kallor}` : 'our ad'}${produkt && produktNamn ? ` for "${produkt}"` : ''}, running before this ad.`,
    a.bevisbildUrl ? `${bevis} ${a.bevisbildUrl}` : null,
    `Ref ${a.arende} ${a.nr}/${a.antal}.`,
  ].filter(Boolean).join(' ');
  // Två länkar till våra annonser väger tyngst, sedan tiderna i deras film (där granskaren ska titta) — produktnamnet
  // står redan på bevisbilden (mätt 2026-09-29, ORVO: två länkar + tiderna utan produktnamn = 483 tecken).
  const steg = [{}, { bevis: 'Evidence (ours left, theirs right):' }, { bevis: 'Evidence (ours left, theirs right):', antalFilmer: 2 }, { bevis: 'Evidence:', antalFilmer: 2 }, { bevis: 'Evidence:', antalFilmer: 2, produktNamn: false }, { bevis: 'Evidence:', antalFilmer: 2, tider: false, produktNamn: false }, { bevis: 'Evidence:', antalFilmer: 1, tider: false, produktNamn: false }];
  let passage = m ? m[3] : '';
  let text = bygg(passage);
  for (const o of steg) { text = bygg(passage, o); if (text.length <= max) break; }
  const sista = steg.at(-1);
  while (text.length > max && passage.length > 20) { passage = korta(passage, passage.length - 20); text = bygg(passage, sista); }
  return text.length > max ? korta(text, max) : text;
}

/** Fälten i formuläret, i den ordning de fylls. Ren. */
export function formularVarden(a, { land = 'Sweden' } = {}) {
  const f = a.falt ?? {};
  const fel = [];
  const v = {
    ratt: 'Copyright', plattform: a.plattform === 'instagram' ? 'Instagram' : 'Facebook', land,
    ombud: true, rattighetshavare: korta(f.rightsOwner?.name, MAX.namn),
    urls: (f.contentUrls ?? []).join('\n'), original: korta((f.originalWorkUrls ?? [])[0], MAX.original), beskrivning: beskrivning500(a),
    namn: korta(f.reporter?.fullName, MAX.namn), epost: String(f.reporter?.email ?? '').trim(), signatur: korta(f.signature ?? f.reporter?.fullName, MAX.signatur),
  };
  if (!v.rattighetshavare) fel.push('rättighetshavarens namn saknas');
  if (!v.urls) fel.push('annonsens URL saknas');
  if (!v.original) fel.push('länken till originalet saknas');
  if (!v.namn) fel.push('undertecknarens namn saknas');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.epost)) fel.push(`e-postadressen "${v.epost}" är inte en adress`);
  if (!v.signatur) fel.push('underskriften saknas');
  return { ...v, fel };
}

/** Engångskoden ur ett mejl från Meta: talet efter ordet code/kod, annars första fristående 5–8-siffriga talet. Ren. */
export function kodUrText(text) {
  const t = String(text ?? '');
  const m = t.match(/\b(?:code|kod)\b[^0-9]{0,60}?(\d{4,8})\b/i) ?? t.match(/\b(\d{5,8})\b/);
  return m ? m[1] : null;
}

/** Talet ur "N required fields remaining" (0 om knappen saknas — då är allt ifyllt). */
export function kvarUrText(text) {
  const m = String(text ?? '').match(/(\d+)\s+required fields? remaining/i);
  return m ? Number(m[1]) : 0;
}

/** Referensnumret ur kvittots text: efter report/reference/case, annars ett tal om minst 9 siffror. null om inget. Ren. */
export function referensUrText(text) {
  const t = String(text ?? '');
  const m = t.match(/(?:report|reference|case|ticket|ärende)[^\n\d]{0,60}?(?:#|no\.?|number|nummer|id)?[^\n\d]{0,20}(\d{6,})/i) ?? t.match(/\b(\d{9,})\b/);
  return m ? m[1] : null;
}

const sidtext = async (page) => { try { return await page.evaluate(() => document.body?.innerText ?? ''); } catch { return ''; } };
const vantaKod = async (kodFil, { vantaMs, pollMs, logg }) => {
  const t0 = Date.now();
  while (Date.now() - t0 < vantaMs) {
    if (existsSync(kodFil)) {
      const kod = readFileSync(kodFil, 'utf8').trim();
      if (/^\d{4,10}$/.test(kod)) { try { unlinkSync(kodFil); } catch { /* ok */ } return kod; }
      logg(`  kodfilen bär inte en kod ("${kod.slice(0, 20)}") — väntar vidare`);
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
  return null;
};

/**
 * Fyller i formuläret för EN anmälan. `ja: false` = torrt: allt ifyllt utom koden,
 * skärmdump, ingen kod begärs, inget skickas. `ja: true` = begär koden, väntar på
 * kodfilen, fyller i, klickar Submit, läser kvittot.
 * Returnerar { status: 'torr'|'skickad', kvar, kvarText, skarmdump, kvittoFil, referens, text, nar }.
 */
export async function skickaAnmalan(a, { ja = false, kodFil, vantaKodMs = 8 * 60_000, pollMs = 5000, logg = () => {}, skarmdumpar = null, land = 'Sweden', playwrightSokvag, kandidater } = {}) {
  const v = formularVarden(a, { land });
  if (v.fel.length) throw new Error(`anmälan ${a.nr}: ${v.fel.join('; ')}`);
  if (!a.formular) throw new Error(`anmälan ${a.nr}: formulärets adress saknas (anmalan.mjs FORMULAR)`);
  const { browser, ctx } = await startaWebblasare({ playwrightSokvag, kandidater, locale: 'en-GB' });
  const dumpa = async (page, namn) => {
    if (!skarmdumpar) return null;
    mkdirSync(skarmdumpar, { recursive: true });
    const fil = join(skarmdumpar, `${a.nr}-${namn}.png`);
    try { await page.screenshot({ path: fil, fullPage: true }); return fil; } catch { return null; }
  };
  const steg = async (namn, fn) => { try { return await fn(); } catch (e) { throw new Error(`anmälan ${a.nr}, ${namn}: ${e.message.split('\n')[0]}`); } };
  try {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15_000);
    await steg('öppna formuläret', async () => {
      await page.goto(a.formular, { waitUntil: 'load', timeout: 60_000 });
      await page.locator('label').filter({ hasText: /^Copyright/ }).first().waitFor();
    });
    const klickaEtikett = (re) => page.locator('label').filter({ hasText: re }).first().click();
    const nasta = async (vantaPa) => { await page.getByRole('button', { name: /^Next$/ }).first().click(); await vantaPa.waitFor(); await page.waitForTimeout(600); };
    // Steg 1 + 2
    await steg('steg 1 (rättighet)', async () => { await klickaEtikett(/^Copyright/); await nasta(page.locator('label').filter({ hasText: new RegExp(`^${v.plattform}$`) }).first()); });
    await steg('steg 2 (plattform)', async () => { await klickaEtikett(new RegExp(`^${v.plattform}$`)); await nasta(page.locator('[role=combobox]').first()); });
    // Steg 3
    await steg('steg 3 (rättighetshavaren)', async () => {
      const cb = page.locator('[role=combobox]').first();
      await cb.click(); await page.waitForTimeout(500);
      await page.keyboard.type(v.land, { delay: 30 }); await page.waitForTimeout(1200);
      const opt = page.getByRole('option', { name: new RegExp(`^${v.land}$`) }).first();
      if (await opt.count()) await opt.click(); else { const alt = page.getByText(new RegExp(`^${v.land}$`)).last(); if (await alt.count()) await alt.click(); else await page.keyboard.press('Enter'); }
      await page.waitForTimeout(500);
      await klickaEtikett(v.ombud ? /authori[sz]ed to represent the rights owner/ : /^Yes$/);
      const namnFalt = page.locator('input[type=text]').first();
      await namnFalt.waitFor(); await namnFalt.fill(v.rattighetshavare);
      await page.waitForTimeout(400);
      const kvar = kvarUrText(await sidtext(page));
      if (kvar > 0) throw new Error(`${kvar} obligatoriskt fält kvar efter landet, ombud-valet och namnet — formuläret har ändrats`);
      await nasta(page.locator('textarea[aria-label^="Provide the URLs"]').first());
    });
    // Steg 4
    const falt = (sel, namn) => ({ sel, namn });
    const FALT = {
      urls: falt('textarea[aria-label^="Provide the URLs"]', 'URL-fältet'), original: falt('input[aria-label^="Provide an example of your copyrighted work"]', 'originalets URL'),
      beskrivning: falt('textarea[aria-label^="Describe how"]', 'beskrivningen'), namn: falt('input[aria-label="Your full name"]', 'namnet'), signatur: falt('input[aria-label="Electronic signature"]', 'underskriften'),
    };
    await steg('steg 4 (anmälan)', async () => {
      for (const [nyckel, f] of Object.entries(FALT)) {
        const loc = page.locator(f.sel).first();
        if (!(await loc.count())) throw new Error(`${f.namn} hittades inte (${f.sel}) — Meta har bytt formuläret, fyll inte i på en gissning`);
        await loc.fill(v[nyckel]);
      }
      // E-post + bekräftelse: de två textfälten utan aria-label, i ordning ("Email", "Confirm email address").
      const epostFalt = page.locator('input[type=text]:not([aria-label])');
      const n = await epostFalt.count();
      if (n < 2) throw new Error(`e-postfälten hittades inte (${n} textfält utan etikett)`);
      await epostFalt.nth(0).fill(v.epost); await epostFalt.nth(1).fill(v.epost);
      await page.waitForTimeout(500);
    });
    const textFore = await sidtext(page);
    const kvarFore = kvarUrText(textFore);
    const skarmdump = await dumpa(page, ja ? 'formular' : 'torr');
    if (!ja) return { status: 'torr', kvar: kvarFore, kvarText: textFore.match(/\d+\s+required fields? remaining/i)?.[0] ?? 'inget obligatoriskt fält kvar', skarmdump, nar: new Date().toISOString() };
    if (!kodFil) throw new Error('kodfil saknas — utan den kan koden inte tas emot');
    // Koden: begär, vänta på sessionen, fyll i.
    await steg('engångskoden', async () => {
      const knapp = page.getByRole('button', { name: /Request code/i }).first();
      if (!(await knapp.count())) { logg('  ingen "Request code"-knapp — formuläret kräver ingen kod den här gången'); return; }
      await knapp.click(); await page.waitForTimeout(2500);
      mkdirSync(join(kodFil, '..'), { recursive: true });
      writeFileSync(`${kodFil}.begard.json`, JSON.stringify({ nar: new Date().toISOString(), epost: v.epost, anmalan: a.nr, arende: a.arende, kodfil: kodFil }, null, 2));
      logg(`  kod begärd till ${v.epost} — väntar på ${basename(kodFil)} (sessionen läser Gmail och skriver koden dit)`);
      const kod = await vantaKod(kodFil, { vantaMs: vantaKodMs, pollMs, logg });
      try { unlinkSync(`${kodFil}.begard.json`); } catch { /* ok */ }
      if (!kod) throw new Error(`ingen kod i ${kodFil} inom ${Math.round(vantaKodMs / 60_000)} min`);
      let kodFalt = page.locator('input[aria-label*="code" i], input[placeholder*="code" i], input[name*="code" i]').first();
      if (!(await kodFalt.count())) {
        // Reserv: det nya tomma textfältet som inte är något av de vi redan fyllt.
        const tomma = page.locator('input[type=text]').filter({ hasNot: page.locator('[aria-label="Your full name"], [aria-label="Electronic signature"], [aria-label^="Provide an example"]') });
        const antal = await tomma.count(); let valt = null;
        for (let i = 0; i < antal; i++) { const e = tomma.nth(i); if (!(await e.inputValue())) valt = e; }
        if (!valt) throw new Error('kodfältet hittades inte efter "Request code"');
        kodFalt = valt;
      }
      await kodFalt.fill(kod); await page.waitForTimeout(800);
      const bekrafta = page.getByRole('button', { name: /^(Verify|Confirm|Submit code|Verify code)$/i }).first();
      if (await bekrafta.count()) { await bekrafta.click(); await page.waitForTimeout(2500); }
    });
    const textMitt = await sidtext(page);
    const kvar = kvarUrText(textMitt);
    if (kvar > 0) { await dumpa(page, 'stopp'); throw new Error(`${kvar} obligatoriskt fält kvar före Submit (${textMitt.match(/\d+\s+required fields? remaining/i)?.[0]}) — inget skickat`); }
    // Submit — bara här, bara med ja.
    const nar = new Date().toISOString();
    await steg('Submit', async () => {
      const knapp = page.getByRole('button', { name: /^Submit$/ }).first();
      if (!(await knapp.count())) throw new Error('Submit-knappen saknas');
      await knapp.click();
      const t0 = Date.now();
      while (Date.now() - t0 < 30_000) { await page.waitForTimeout(1500); const t = await sidtext(page); if (!/Electronic signature/.test(t) || /thank you|received|submitted|report number|reference/i.test(t)) break; }
    });
    const text = await sidtext(page);
    const kvittoFil = await dumpa(page, 'kvitto');
    const referens = referensUrText(text);
    logg(`  kvitto: ${text.replace(/\s+/g, ' ').slice(0, 300)}`);
    return { status: 'skickad', referens, text: text.replace(/\s+/g, ' ').slice(0, 2000), skarmdump, kvittoFil, nar };
  } finally { await browser.close().catch(() => {}); }
}
