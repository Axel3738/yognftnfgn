// sprakkoll.mjs — står den norska butiken faktiskt på norska?
//
//   node factory/sprakkoll.mjs <butik-id> <produkt-handle> [--losenord X]
//                              [--sprak nb] [--land NO] [--sidor /,/products/x]
//
// Axels bakläxa 2026-09-09 (DryTrek): butiken var byggd, marknaden Norge var
// uppe, paketnivåerna var översatta — och ändå stod halva butiken på svenska
// när en norrman öppnade den. Menyn, sidfoten, sidorna, färgnamnen,
// fraktmetoderna och hela produktbeskrivningen låg kvar på svenska.
//
// Varför ingen kontroll fångade det: `marknad.mjs` svarar på frågan "finns
// locale nb?" och `oversatt.mjs` på "gick raderna in?". Ingen av dem svarar
// på "vad ser kunden?". Shopify FALLER TILLBAKA på originalspråket för varje
// sträng som saknar översättning — tyst, utan felmeddelande, mitt inne i en
// annars norsk sida. Det syns bara om man läser sidan.
//
// Kontrollen är därför gjord på riktig HTML från /nb, inte på API-svar.
//
// ⚠️ Ordlistan letar efter SVENSKA former som inte finns i bokmål. Den kan
// aldrig bevisa att texten är BRA norska — bara att den inte är svenska.
// Ett tomt utslag betyder "inga svenska rester", inte "korrekturläst".

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';
import { hamtaStartsida } from './kundvy-kor.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

// Svenska former som INTE finns i bokmål. Varje rad: [mönster, vad det borde
// stå]. Ordgränser (\b) överallt — "för" ligger inne i "förvald" och "og"
// ligger inne i "hundreds".
export const SVENSKA_SPAR = [
  [/\boch\b/i, 'og'],
  [/\bär\b/i, 'er'],
  [/\bför\b/i, 'for'],
  [/\bmellan\b/i, 'mellom'],
  [/\bköp(a|et|knapp)?\b/i, 'kjøp'],
  [/\bvarukorg(en)?\b/i, 'handlekurv'],
  [/\bångerrätt\b/i, 'angrerett'],
  [/\böppet köp\b/i, 'angrerett'],
  [/\bkäng(a|an|or|orna)\b/i, 'støvel'],
  [/\bdamask(er|erna)?\b/i, 'gamasjer'],
  [/\bfärg(er|erna|en)?\b/i, 'farger'],
  [/\barbetsdag(ar|arna)?\b/i, 'virkedager'],
  [/\bväta\b/i, 'fukt'],
  [/\bblöt(a|t)?\b/i, 'våt'],
  [/\bsnör(ning|ningen)\b/i, 'snøring'],
  [/\bkardborre(n|band)?\b/i, 'borrelås'],
  [/\bstrump(a|an|or|orna)\b/i, 'sokk'],
  [/\bvandring\b/i, 'tur / fjelltur'],
  [/\bhela Sverige\b/i, 'hele Norge'],
  [/\binom Sverige\b/i, 'i Norge'],
  [/\bfrakt(policy)? till\b/i, 'frakt til'],
  [/\bhem\b(?![a-zåäö])/i, 'hjem'],
  [/\bkontakta oss\b/i, 'kontakt oss'],
  [/\bleveranstid\b/i, 'leveringstid'],
  [/\bvit\b/i, 'hvit'],
  [/\bröd\b/i, 'rød'],
  [/\blila\b/i, 'lilla'],
  [/\bgrön\b/i, 'grønn'],
  [/\bljusblå\b/i, 'lyseblå'],
  [/\bmarinblå\b/i, 'marineblå'],
];

// Priser i fel valuta är samma sorts fel som fel språk: siffran kommer ur
// den svenska mallen och stämmer inte med det kunden betalar.
export function svenskaPriser(text, forbjudna) {
  const ut = [];
  for (const p of forbjudna) {
    const re = new RegExp(`\\b${String(p).replace('.', '[.,]')}\\b`);
    if (re.test(text)) ut.push(p);
  }
  return ut;
}

// HTML → läsbar text. Script, style och JSON-LD räknas inte: de innehåller
// alltid butikens originalsträngar och skulle ge falsklarm på varje sida.
export function synligText(html) {
  return String(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Meningen omkring en träff, så fyndet går att åtgärda utan att leta.
function sammanhang(text, index, bredd = 70) {
  const fran = Math.max(0, index - bredd);
  return (fran > 0 ? '…' : '') + text.slice(fran, index + bredd).trim() + '…';
}

export function granska(html, { forbjudnaPriser = [] } = {}) {
  const text = synligText(html);
  const fynd = [];
  for (const [monster, borde] of SVENSKA_SPAR) {
    const re = new RegExp(monster.source, 'gi');
    const traffar = [...text.matchAll(re)];
    if (traffar.length === 0) continue;
    fynd.push({
      ord: traffar[0][0],
      borde,
      antal: traffar.length,
      exempel: sammanhang(text, traffar[0].index),
    });
  }
  const priser = svenskaPriser(text, forbjudnaPriser);
  return { gron: fynd.length === 0 && priser.length === 0, fynd, priser, tecken: text.length };
}

export function rapport(sida, r) {
  const rad = [`${r.gron ? '✅' : '❌'} ${sida} — ${r.tecken} tecken text`];
  for (const f of r.fynd) {
    rad.push(`   ❌ "${f.ord}" ×${f.antal} — ska vara "${f.borde}"`);
    rad.push(`        ${f.exempel}`);
  }
  for (const p of r.priser) rad.push(`   ❌ svenskt pris ${p} står kvar på den norska sidan`);
  return rad.join('\n');
}

if (process.argv[1] && process.argv[1].endsWith('sprakkoll.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const flagga = (n, s = null) => (arg.includes(n) ? arg[arg.indexOf(n) + 1] : s);
  const fria = arg.filter((a, i) => !a.startsWith('--') && !String(arg[i - 1] ?? '').startsWith('--'));
  const [butikId, handle] = fria;
  if (!butikId || !handle) {
    throw new Error('Användning: node factory/sprakkoll.mjs <butik-id> <produkt-handle> [--losenord X] [--sprak nb] [--land NO]');
  }
  const sprak = flagga('--sprak', 'nb');
  const land = flagga('--land', 'NO');
  const produkt = lasYaml(readFileSync(join(ROT, 'produkter', `${handle}.yaml`), 'utf8'));
  const forbjudnaPriser = [produkt?.ekonomi?.pris, produkt?.ekonomi?.jamforpris].filter(Boolean);

  const d = await graphql(`query { shop { myshopifyDomain primaryDomain { url } } }`);
  const bas = flagga('--url') ?? d.shop.primaryDomain?.url ?? `https://${d.shop.myshopifyDomain}`;
  const losenord = flagga('--losenord');

  // Sidhandtagen är butikens egna (factory/sida.mjs): contact, returpolicy,
  // fraktpolicy, kopvillkor. Policysidorna ligger under /policies/.
  const sidor = (flagga('--sidor') ??
    `/,/products/${handle},/pages/contact,/pages/returpolicy,/pages/fraktpolicy,/pages/kopvillkor,/policies/refund-policy,/policies/shipping-policy,/policies/terms-of-service`
  ).split(',');
  console.log(`SPRÅKKOLL — ${bas} · /${sprak} · country=${land}`);
  console.log(`Förbjudna priser (svenska): ${forbjudnaPriser.join(', ') || '(inga)'}\n`);

  let allaGrona = true;
  for (const s of sidor) {
    const vag = `/${sprak}${s === '/' ? '/' : s}?country=${land}`;
    let svar;
    try {
      svar = await hamtaStartsida(bas, losenord, vag);
    } catch (e) {
      console.log(`❌ ${vag} — gick inte att hämta: ${e.message.slice(0, 90)}`);
      allaGrona = false;
      continue;
    }
    if (svar.status !== 200) {
      console.log(`❌ ${vag} — HTTP ${svar.status}`);
      allaGrona = false;
      continue;
    }
    const r = granska(svar.html, { forbjudnaPriser });
    if (!r.gron) allaGrona = false;
    console.log(rapport(vag, r));
    console.log('');
  }

  console.log(allaGrona
    ? '✅ Inga svenska rester på de kontrollerade sidorna.'
    : '❌ Butiken står delvis på svenska för en norsk kund. Den får INTE annonser förrän listan är tom.');
  process.exit(allaGrona ? 0 : 1);
}
