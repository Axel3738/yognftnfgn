// kundvy.mjs — läser beaverstoreco.com som KUND i varje land (skriver aldrig).
//
//   node worldwide/kundvy.mjs                       # alla länder i marknaden Worldwide, startsida + en produkt
//   node worldwide/kundvy.mjs --land US,DE,AU       # bara de länderna
//   node worldwide/kundvy.mjs --sverige             # kontroll: baverbutiken.se som svensk kund är orörd
//
// Samma teknik som matstrumpor/marknader/kundvy.mjs och factory/kundvy-kor.mjs: POST /localization
// (form_type=localization, _method=put, country_code, language_code) → kakan → GET sidan och läs
// Shopify.country, Shopify.currency.active, <html lang>, loggan, fri frakt-raden och "A Swedish brand".
// ⚠️ Containern går ut på nätet från USA — utan uttryckligt land hamnar allt i USA-vyn.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = dirname(fileURLToPath(import.meta.url));
const K = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
const U = JSON.parse(readFileSync(join(ROT, 'urval.json'), 'utf8'));
const a = process.argv.slice(2);

const SVENSKA = /\b(och|för|med|inte|köp|fri frakt|varukorg|lägg i|recensioner|beställ|leverans|arbetsdagar)\b|[åäö]/i;

async function vy(bas, land, sprak, sokvag) {
  const r = await fetch(`${bas}/localization`, {
    method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'user-agent': 'Mozilla/5.0' },
    body: new URLSearchParams({ form_type: 'localization', _method: 'put', utf8: '✓', country_code: land, language_code: sprak, return_to: sokvag }),
  });
  const kaka = (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
  const s = await fetch(`${bas}${sokvag}`, { headers: { cookie: kaka, 'user-agent': 'Mozilla/5.0' } });
  const h = await s.text();
  const text = h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '\n').split('\n').map((x) => x.trim()).filter(Boolean);
  const main = text.join(' | ');
  return {
    status: s.status,
    lang: /<html[^>]*lang="([^"]+)"/.exec(h)?.[1],
    land: /Shopify\.country\s*=\s*"([^"]+)"/.exec(h)?.[1],
    valuta: /"active":"([A-Z]{3})"/.exec(h)?.[1],
    logga: /beaver-store-logga/.test(h) ? 'Beaver Store' : /Namnlos_design_44/.test(h) ? 'Bäverbutiken' : '?',
    frifrakt: (/(Free shipping to [^|<]{2,40})/.exec(main) ?? [])[1] ?? null,
    svenskt: /A Swedish brand/.test(main),
    svenska_rader: text.filter((x) => SVENSKA.test(x) && x.length > 3).slice(0, 6),
  };
}

async function huvud() {
  if (a.includes('--sverige')) {
    const v = await vy('https://baverbutiken.se', 'SE', 'sv', '/');
    console.log(`baverbutiken.se som svensk kund: ${v.status} lang ${v.lang} ${v.land}/${v.valuta} logga ${v.logga} · A Swedish brand: ${v.svenskt ? 'SYNS (FEL)' : 'nej (rätt)'}`);
    return;
  }
  const bas = `https://${K.marknad.doman.host}`;
  const lander = a.includes('--land') ? a[a.indexOf('--land') + 1].split(',') : K.marknad.lander;
  const produkt = U.produkter.find((p) => !p.under)?.handle;
  let fel = 0;
  for (const land of lander) {
    for (const sokvag of ['/', `/products/${produkt}`]) {
      try {
        const v = await vy(bas, land, 'en', sokvag);
        const ok = v.status === 200 && v.lang?.startsWith('en') && v.land === land && v.logga === 'Beaver Store' && v.svenskt && v.frifrakt && !v.svenska_rader.length;
        if (!ok) fel++;
        console.log(`${ok ? '✅' : '❌'} ${land} ${sokvag.slice(0, 40).padEnd(40)} ${v.status} lang ${v.lang} ${v.land}/${v.valuta} logga ${v.logga} · ${v.frifrakt ?? 'INGEN fri frakt-rad'} · ${v.svenskt ? 'A Swedish brand' : 'INGEN svensk-rad'}${v.svenska_rader.length ? ` · svenska: ${v.svenska_rader.join(' / ')}` : ''}`);
      } catch (e) { fel++; console.log(`❌ ${land} ${sokvag}: ${e.message}`); }
    }
  }
  console.log(`\n${fel ? `❌ ${fel} vyer avviker` : '✅ alla vyer rätt'}`);
  process.exit(fel ? 1 : 0);
}

huvud();
