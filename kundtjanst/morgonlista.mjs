#!/usr/bin/env node
// morgonlista.mjs — VA:ns väckarklocka. En gång per morgon (Manila-tid) postas
// i butikens Discord #customer-service vad hon ska ta FÖRST: mappen VA-PRIO
// (arga kunder som fått lugnande svar), stjärnmärkta mejl i inkorgen som ännu
// inte besvarats, och tvister med evidence-deadline inom 3 dagar. VA:n taggas
// med sitt Discord-id så inlägget inte kan passera obemärkt.
//
//   node kundtjanst/morgonlista.mjs --torr                 alla brands, skriv listan, posta inget
//   node kundtjanst/morgonlista.mjs --brand baverbutiken   en butik
//   node kundtjanst/morgonlista.mjs --discord              posta (rutinen)
//   node kundtjanst/morgonlista.mjs --json                 maskinläsbart
//
// Axels beslut 2026-09-22: "Michelle ska 100 % garanterat få till sig varje dag
// vilka som är de urgent cases, så att hon alltid tar de first thing in the
// morning." Autosvarets egen Discord-rapport går bara när botten råkar köras
// och bara när något hänt — den här går VARJE morgon, även när listan är tom
// (en tom lista är också ett besked: inget brådskar).
//
// LÄS-BARA mot brevlådan (lista, aldrig läsa/flagga/flytta) och Shopify (GET).
// Skriver inga filer, pushar inget. Kundadresser maskeras alltid.
// Ordning per brand: VA-PRIO → stjärnor i INBOX (obesvarade = utan "replied"-
// status, den vet Roundcube-listan inte om, så alla stjärnor listas) → tvister.

import { upptackBrands, korkonfig } from './brands.mjs';
import { oppnaBrevlada } from './brevlada.mjs';
import { maskeraAdress } from './maskera.mjs';
import { kollaBrand, narText, arChargeback } from './tvistkoll.mjs';
import { postaDiscord } from './run.mjs';

const MAX_RADER = 15;

function flagga(args, n, standard = null) {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : standard;
}
const kort = (s, n = 60) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };

/** VA:ns Discord-id: brandfilen först (discord.va_id), sedan env DISCORD_VA_ID. */
export function vaId(brand, env = process.env) {
  return String(brand?.discord?.va_id ?? env.DISCORD_VA_ID ?? '').trim() || null;
}

/** Läser brevlådans två köer. Kastar aldrig — saknas nyckeln står det i `orsak`. */
export async function lasKoer(brand, { env = process.env, logg = () => {} } = {}) {
  let bl;
  try { bl = oppnaBrevlada(brand.id, { env, logg }); }
  catch (e) { return { tillganglig: false, orsak: e.message, vaPrio: [], stjarnor: [] }; }
  const vaMapp = brand.svar?.va_mapp ?? 'VA-PRIO';
  // mappar() och lista() sköter sessionen själva — aldrig inuti medSession,
  // då väntar anropet på sin egen kö (mätt 2026-09-22: inloggad, sedan tyst).
  try {
    const mappar = await bl.mappar();
    const namn = (m) => mappar.find((x) => x === m || x === `INBOX.${m}` || x.endsWith(`.${m}`)) ?? null;
    const prio = namn(vaMapp);
    const vaPrio = prio ? (await bl.lista({ mapp: prio, antal: 50 })).rader ?? [] : [];
    const inkorg = await bl.lista({ mapp: bl.inkorg, antal: 50 });
    // Stjärna = autosvaret lämnade mejlet till VA:n. Stjärna + \Answered = någon
    // (roboten eller VA:n) har redan svarat i tråden — det är inte VA:ns kö.
    const stjarnor = (inkorg.rader ?? []).filter((r) => r.flaggad && !r.svarat);
    const besvarade = (inkorg.rader ?? []).filter((r) => r.flaggad && r.svarat).length;
    return { tillganglig: true, orsak: prio ? null : `mappen ${vaMapp} finns inte i brevlådan`, vaPrio, stjarnor, besvarade };
  } catch (e) {
    return { tillganglig: false, orsak: e.message, vaPrio: [], stjarnor: [] };
  } finally {
    try { await bl.loggaUt(); } catch { /* utloggningen är artighet, inte krav */ }
  }
}

/** Engelsk text till Discord. Alltid en text — även när allt är tomt. */
export function renderaMorgon({ brand, koer, tvister, nu = new Date(), va = null }) {
  const datum = nu.toISOString().slice(0, 10);
  const tagg = va ? `<@${va}> ` : '';
  const ut = [`${tagg}**Morning list — ${brand.brand ?? brand.id} — ${datum}**`];
  // Shopifys kontaktformulär kommer från mailer@shopify.com — kunden står i
  // Reply-To, som listan inte visar. Säg det i stället för att maskera Shopify.
  const rad = (r) => `• ${/shopify\.com$/i.test(r.franAdress) ? 'contact form' : maskeraAdress(r.franAdress || r.fran)} · "${kort(r.amne)}" · ${r.datum}`;

  const prio = koer.vaPrio ?? [];
  ut.push('', `**1. VA-PRIO — upset customers, answer these first (${prio.length})**`);
  if (!koer.tillganglig) ut.push(`• could not read the mailbox: ${koer.orsak}`);
  else if (!prio.length) ut.push('• empty — nothing waiting');
  else { prio.slice(0, MAX_RADER).forEach((r) => ut.push(rad(r))); if (prio.length > MAX_RADER) ut.push(`• … and ${prio.length - MAX_RADER} more in the folder`); }

  const st = koer.stjarnor ?? [];
  ut.push('', `**2. Starred in INBOX, not yet answered — yours (${st.length})**`);
  if (!koer.tillganglig) ut.push('• (see above)');
  else if (!st.length) ut.push('• none');
  else { st.slice(0, MAX_RADER).forEach((r) => ut.push(rad(r))); if (st.length > MAX_RADER) ut.push(`• … and ${st.length - MAX_RADER} more — oldest first`); }
  if (koer.tillganglig && koer.besvarade) ut.push(`(${koer.besvarade} more starred emails already have a reply in the thread — the replied arrow — and are not listed)`);

  const br = tvister?.bradskande ?? [];
  ut.push('', `**3. Disputes with a deadline within 3 days (${br.length})**`);
  if (tvister && !tvister.tillganglig) ut.push(`• could not read disputes: ${tvister.orsak}`);
  else if (!br.length) ut.push('• none');
  // `kvar` sätts av tvistkollens bradskande(): dagar till evidence-deadline,
  // null när deadline inte gick att läsa (larmas hellre än tigs ihjäl).
  else for (const t of br) ut.push(`• ${arChargeback(t) ? 'CHARGEBACK' : 'inquiry'} ${t.ordernamn ? `#${String(t.ordernamn).replace(/^#/, '')}` : ''} · ${t.belopp ?? '?'} ${t.valuta ?? ''} · ${t.kvar === null ? 'deadline unknown — check in Shopify' : `evidence ${narText(t.kvar)}`} — see 60-ESCALATION`);

  if (koer.orsak && koer.tillganglig) ut.push('', `⚠️ ${koer.orsak}`);
  ut.push('', 'Order of work: 1 → 2 → 3 → Drafts → the rest. Remove the star when answered; move VA-PRIO emails back to INBOX when done.');
  return ut.join('\n');
}

export async function huvud(argv = process.argv.slice(2), env = process.env) {
  const torr = argv.includes('--torr');
  const json = argv.includes('--json');
  const discord = argv.includes('--discord') && !torr;
  const valt = flagga(argv, 'brand');
  const logg = argv.includes('--tyst') ? () => {} : (s) => console.error(s);
  const brands = upptackBrands().filter((b) => !valt || b.id === valt);
  if (!brands.length) { console.error(`Inget brand${valt ? ` "${valt}"` : ''} hittat.`); process.exit(1); }
  const nu = new Date();
  const resultat = [];
  for (const brand of brands) {
    const konfig = korkonfig(brand, env);
    if (konfig.brand?.aktiv === false) continue;
    const koer = await lasKoer(brand, { env, logg });
    if (!koer.tillganglig && /KUNDTJANST_MAIL_PASS/.test(koer.orsak ?? '')) { logg(`▶ ${brand.id}: hoppad — ${koer.orsak}`); resultat.push({ brand: brand.id, hoppad: koer.orsak }); continue; }
    let tvister = null;
    try { tvister = await kollaBrand(brand, { nu, env, logg }); } catch (e) { tvister = { tillganglig: false, orsak: e.message, bradskande: [] }; }
    const va = vaId(brand, env);
    const namn = typeof konfig.brand === 'string' ? konfig.brand : (konfig.brand?.namn ?? brand.brand ?? brand.id);
    const text = renderaMorgon({ brand: { id: brand.id, brand: namn }, koer, tvister, nu, va });
    const r = { brand: brand.id, va, vaPrio: koer.vaPrio.length, stjarnor: koer.stjarnor.length, tvister: tvister?.bradskande?.length ?? null, text };
    if (discord) {
      try { r.discord = await postaDiscord({ brand: konfig.brand ? { ...brand, brand: konfig.brand.namn } : brand }, { text, env }); }
      catch (e) { r.discord = `FEL: ${e.message}`; }
    }
    resultat.push(r);
    if (!json) { console.log(`\n══ ${brand.id}${va ? '' : '  ⚠️ inget VA-id (discord.va_id i brandfilen eller DISCORD_VA_ID) — ingen taggning'}`); console.log(text); if (r.discord) console.log(`→ ${r.discord}`); }
  }
  if (json) console.log(JSON.stringify(resultat, null, 1));
  if (torr) console.error('\n(torrkörning — inget postat)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
