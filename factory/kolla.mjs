// Trippelkollen mot kundens riktiga vy (regeln från 2026-09-07: säg aldrig
// "klart" utan tre kontroller): markörskanning på /nb, svensk regression och
// en strukturkontroll av det renderade utkasttemat — allt via riktiga
// HTTP-anrop mot butiken, aldrig via API-läsning av filer.
//
//   node factory/kolla.mjs factory/butiker/<butik>.yaml factory/produkter/<id>.yaml [--tema <id>]
//
// Butiken ligger bakom lösenordssida under trial (kan inte tas bort förrän
// plan är vald). Lösenordet läses ur env SHOPIFY_STOREFRONT_PASSWORD (VA:n
// lägger det i miljön, checklistans steg 2) och postas till /password med
// en kakburk. preview_theme_id kräver också kakburken — utan den redirectas
// man tyst till live-temat (curl-läxan 2026-09-07). Noll beroenden.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { hamtaUtkastTema, kontrolleraAnslutning } from './shopify.mjs';

// Svenska ord som ALDRIG ska synas på /nb (utanför untranslatedTitle-metadata).
const SVENSKA_MARKORER = [
  'Köp nu', 'Fri frakt', 'öppet köp', 'Vanliga frågor', 'Beräknad leverans', 'Lägg i varukorgen',
  'Trygg betalning', 'Passar', 'Känner du igen det', 'Lösningen', 'Det här får du', 'arbetsdagar',
  'Handla tryggt', 'Vad kunderna säger', 'Ur recensionerna', 'Gratis på köpet', 'värde', 'Spara',
  'överdrag', 'Företaget', 'drivs av', 'Returpolicy', 'Fraktpolicy', 'Köpvillkor', 'Kontakt',
];

class Kakburk {
  constructor() { this.kakor = new Map(); }
  ta(svar) {
    const rader = svar.headers.getSetCookie?.() ?? [];
    for (const r of rader) {
      const [par] = r.split(';');
      const i = par.indexOf('=');
      if (i > 0) this.kakor.set(par.slice(0, i).trim(), par.slice(i + 1).trim());
    }
  }
  header() { return [...this.kakor].map(([k, v]) => `${k}=${v}`).join('; '); }
}

export async function hamtaSida(bas, sokvag, burk, temaId) {
  const url = new URL(sokvag, bas);
  if (temaId) url.searchParams.set('preview_theme_id', String(temaId).split('/').pop());
  let svar = await fetch(url, { headers: { cookie: burk.header(), 'user-agent': 'Mozilla/5.0 (OPS Factory kolla)' }, redirect: 'manual' });
  burk.ta(svar);
  for (let i = 0; i < 5 && svar.status >= 300 && svar.status < 400; i++) {
    const till = new URL(svar.headers.get('location'), url);
    if (till.pathname === '/password') return { status: 401, html: '', url: String(url) };
    svar = await fetch(till, { headers: { cookie: burk.header(), 'user-agent': 'Mozilla/5.0 (OPS Factory kolla)' }, redirect: 'manual' });
    burk.ta(svar);
  }
  return { status: svar.status, html: await svar.text(), url: String(url) };
}

export async function loggaInLosenord(bas, burk, losenord) {
  const forsta = await fetch(new URL('/password', bas), { headers: { cookie: burk.header() }, redirect: 'manual' });
  burk.ta(forsta);
  const svar = await fetch(new URL('/password', bas), {
    method: 'POST',
    headers: { cookie: burk.header(), 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ form_type: 'storefront_password', utf8: '✓', password: losenord }),
    redirect: 'manual',
  });
  burk.ta(svar);
  return svar.status;
}

// Tar bort allt som inte är synlig text: script, style, kommentarer, attribut.
export function synligText(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

export function skannaMarkorer(html, markorer = SVENSKA_MARKORER) {
  const t = synligText(html);
  return markorer.filter((m) => t.includes(m));
}

export function strukturkoll(html, { produktHandle, bonusHandle }) {
  const fynd = [];
  const har = (s) => String(html).includes(s);
  fynd.push([`opf-sektionerna renderas`, ['opf-problem', 'opf-losning', 'opf-funktioner', 'opf-garanti', 'opf-faq'].every(har)]);
  fynd.push([`paketväljaren (ms-paket) finns`, har('ms-paket__opt')]);
  fynd.push([`A/B-block (data-ms-ab)`, har('data-ms-ab="paket:a"') && har('data-ms-ab="paket:b"')]);
  fynd.push([`gratis-raden i paketen`, har('ms-paket__gava')]);
  fynd.push([`Judge.me-widget i Appyta`, har('jdgm-widget') || har('judgeme')]);
  fynd.push([`sticky köpknapp`, har('ms-sticky')]);
  fynd.push([`svenskt varumärke-strippen`, har('opf-svensk')]);
  fynd.push([`opf-brand.css laddad`, har('opf-brand.css')]);
  fynd.push([`gallerifilter i head`, har('[alt^=') || har('opf-gallerifilter')]);
  if (bonusHandle) fynd.push([`korg-upsellen (${bonusHandle})`, har('opf-korg-upsell') || har('opf-upsell') || har('sections=cart-drawer')]);
  fynd.push([`produktlänken`, har(`/products/${produktHandle}`)]);
  return fynd;
}

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const [butiksfil, produktfil] = arg.filter((a) => !a.startsWith('--') && a.endsWith('.yaml'));
  if (!butiksfil || !produktfil) {
    console.error('Användning: node factory/kolla.mjs factory/butiker/<butik>.yaml factory/produkter/<id>.yaml [--tema <id>]');
    process.exit(1);
  }
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const p = lasYaml(readFileSync(produktfil, 'utf8'));
  const shop = await kontrolleraAnslutning();
  console.log(`Connected: ${shop.myshopifyDomain} ✓`);
  const bas = `https://${shop.primaryDomain?.host ?? shop.myshopifyDomain}`;
  const temaId = arg.includes('--tema') ? arg[arg.indexOf('--tema') + 1] : (await hamtaUtkastTema())?.id;
  console.log(`Bas ${bas} · tema ${temaId ?? 'LIVE'}`);

  const burk = new Kakburk();
  const losen = process.env.SHOPIFY_STOREFRONT_PASSWORD;
  const prov = await hamtaSida(bas, '/', burk, temaId);
  if (prov.status === 401) {
    if (!losen) {
      console.error('\n❌ Butiken har lösenordssida och SHOPIFY_STOREFRONT_PASSWORD saknas i miljön — kontrollen mot kundens vy kan inte göras. Be VA:n lägga in lösenordet (Online Store → Preferences → Password) i sessionens Environment.');
      process.exit(2);
    }
    await loggaInLosenord(bas, burk, losen);
  }

  const handle = p.produkt.id;
  const bonusHandle = p.offer?.bonus_produkt?.handle ?? null;
  const locales = ['', ...((butik?.butik?.marknader ?? []).map((m) => m.locale).filter(Boolean))];
  let fel = 0;
  for (const loc of locales) {
    const pre = loc ? `/${loc}` : '';
    for (const sokvag of [`${pre}/`, `${pre}/products/${handle}`]) {
      const s = await hamtaSida(bas, sokvag, burk, temaId);
      if (s.status !== 200) { console.log(`❌ ${sokvag}: HTTP ${s.status}`); fel++; continue; }
      const rendTema = (s.html.match(/cdn\/shop\/t\/(\d+)\//) ?? [])[1];
      console.log(`\n${sokvag}  (HTTP ${s.status}, tema-katalog t/${rendTema ?? '?'})`);
      if (sokvag.includes('/products/')) {
        for (const [namn, ok] of strukturkoll(s.html, { produktHandle: handle, bonusHandle })) {
          console.log(`   ${ok ? '✅' : '❌'} ${namn}`);
          if (!ok) fel++;
        }
      }
      if (loc) {
        const lackor = skannaMarkorer(s.html);
        if (lackor.length > 0) { console.log(`   ⚠️  svenska markörer på ${sokvag}: ${lackor.join(', ')}`); fel++; }
        else console.log(`   ✅ 0 svenska markörer av ${SVENSKA_MARKORER.length}`);
      } else {
        const t = synligText(s.html);
        const forv = [p.produkt.namn, String(p.ekonomi.pris)].filter((x) => !t.includes(x));
        if (forv.length > 0) { console.log(`   ❌ saknas i svenska vyn: ${forv.join(' | ')}`); fel++; }
        else console.log(`   ✅ svensk vy: produktnamn + pris syns`);
      }
    }
  }
  console.log(fel === 0 ? '\n✅ Trippelkollen grön (markörer + regression + struktur). Mobilkontrollen är ett ögonjobb i temaredigeraren.' : `\n❌ ${fel} fynd — inte klart.`);
  process.exit(fel === 0 ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
