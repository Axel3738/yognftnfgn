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
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { hamtaArbetstema, kontrolleraAnslutning } from './shopify.mjs';
import { lasState } from './state.mjs';

// Svenska ord som ALDRIG ska synas på /nb (utanför untranslatedTitle-metadata).
// Ord som råkar vara likadana på norska (Kontakt, Returpolicy …) tas bort
// automatiskt när översättningsfilerna finns (se markorerFor).
const SVENSKA_MARKORER = [
  'Köp nu', 'Fri frakt i ', 'Fri frakt –', 'öppet köp', 'Vanliga frågor', 'Beräknad leverans', 'Lägg i varukorgen',
  'Trygg betalning', 'Känner du igen det', 'Lösningen', 'Det här får du', 'arbetsdagar', 'Lägg till',
  'Handla tryggt', 'Vad kunderna säger', 'Ur recensionerna', 'Gratis på köpet', 'värde ', 'Spara ',
  'överdrag', 'Företaget', 'drivs av', 'Returpolicy', 'Fraktpolicy', 'Kontakt', 'ångerrätt', 'Fullpris',
];

export function markorerFor(produktId) {
  try {
    const mapp = join(dirname(fileURLToPath(import.meta.url)), 'output', produktId);
    const sv = JSON.parse(readFileSync(join(mapp, 'oversattning-sv.json'), 'utf8'));
    const nb = JSON.parse(readFileSync(join(mapp, 'oversattning-nb.json'), 'utf8'));
    const samma = new Set(Object.keys(sv).filter((k) => typeof nb[k] === 'string' && nb[k].trim() === String(sv[k]).trim()).map((k) => String(sv[k]).trim()));
    return SVENSKA_MARKORER.filter((m) => !samma.has(m));
  } catch {
    return SVENSKA_MARKORER;
  }
}

// Judge.me-widgeten visar butikens ALLA recensioner (svenska + norska blandat,
// PROCESS.md fas 3) — den räknas inte som läcka och klipps bort före skanningen.
export function utanJudgeMe(html) {
  // Appytan (ms-app-slot) renderas som <section>, inte <div> (mätt 2026-09-08).
  return String(html)
    .replace(/<(?:div|section) id="shopify-section-[^"]*__judgeme_widget"[\s\S]*?(?=<(?:div|section) id="shopify-section-)/, '')
    .replace(/<div[^>]*class="[^"]*jdgm-[^"]*"[\s\S]*?<\/div>/g, '');
}

const ENTITETER = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ouml: 'ö', auml: 'ä', aring: 'å', Ouml: 'Ö', Auml: 'Ä', Aring: 'Å', oslash: 'ø', aelig: 'æ' };
export function avkodaEntiteter(t) {
  return String(t)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => ENTITETER[n] ?? m);
}

export class Kakburk {
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

const HUVUD = { 'user-agent': 'Mozilla/5.0 (OPS Factory kolla)' };
const vantaMs = (ms) => new Promise((r) => setTimeout(r, ms));

// Storefronten stryper täta anrop (429, mätt 2026-09-08 efter ~10 sidor på
// en minut) — då väntar vi ordentligt och försöker igen i stället för att
// rapportera falskt rött.
async function hamtaMedTalamod(url, init) {
  for (let f = 0; f < 4; f++) {
    const svar = await fetch(url, init);
    if (svar.status !== 429) return svar;
    await vantaMs(15000 * (f + 1));
  }
  return fetch(url, init);
}

export async function hamtaSida(bas, sokvag, burk, temaId) {
  const url = new URL(sokvag, bas);
  if (temaId) url.searchParams.set('preview_theme_id', String(temaId).split('/').pop());
  let svar = await hamtaMedTalamod(url, { headers: { cookie: burk.header(), ...HUVUD }, redirect: 'manual' });
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
  return avkodaEntiteter(
    String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<template[\s\S]*?<\/template>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
  );
}

export function skannaMarkorer(html, markorer = SVENSKA_MARKORER) {
  const t = synligText(utanJudgeMe(html));
  return markorer.filter((m) => t.includes(m));
}

// Köptestet mot riktiga korgen (samma kakburk som lösenordet): varje löfte på
// sidan ska ge exakt det kassapriset. Returnerar rader [namn, ok, detalj].
export async function koptest(bas, burk, { variantId, bonusVariantId, pris, bonuspris, paket }) {
  // Storefronten stryper snabba anropsserier (429 sågs 2026-09-08) — lugnt
  // tempo och tre försök med paus.
  const paus = (ms) => new Promise((r) => setTimeout(r, ms));
  const rot = async (sokvag, init = {}) => {
    for (let f = 0; f < 4; f++) {
      await paus(f === 0 ? 1500 : 15000 * f);
      const svar = await fetch(new URL(sokvag, bas), { ...init, headers: { cookie: burk.header(), accept: 'application/json', 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0 (OPS Factory kolla)', ...(init.headers ?? {}) }, redirect: 'manual' });
      burk.ta(svar);
      // Cloudflares bot-utmaning ("Verifying your connection…", mätt
      // 2026-09-08 på /cart/add.js) ser ut som 429 men går inte att vänta
      // bort och ska inte kringgås — korgen kan inte köras från en molnsession.
      if (svar.headers.get('cf-mitigated') === 'challenge') {
        const e = new Error(`${sokvag}: Cloudflare kräver webbläsarverifiering — köptestet i riktiga korgen kan inte köras härifrån.`);
        e.cloudflare = true;
        throw e;
      }
      if (svar.status !== 429) return svar;
    }
    throw new Error(`${sokvag}: storefronten svarade 429 fyra gånger — kör om kollen om en stund.`);
  };
  const rens = () => rot('/cart/clear.js', { method: 'POST' });
  const lagg = (items) => rot('/cart/add.js', { method: 'POST', body: JSON.stringify({ items }) });
  // /cart.js svarar med content-type text/javascript (mätt 2026-09-08) — tolka
  // kroppen som JSON och larma bara när det inte går (lösenordssidan är HTML).
  const korg = async () => {
    const s = await rot('/cart.js');
    const text = await s.text();
    try { return JSON.parse(text); } catch { throw new Error(`/cart.js gav ${s.status} ${s.headers.get('content-type') || ''} — lösenordskakan saknas?`); }
  };
  const ut = [];
  const kr = (ore) => `${(ore / 100).toFixed(2)} kr`;

  // 1. Korg-upsellen syns när korgen har varor.
  await rens();
  await lagg([{ id: variantId, quantity: 1 }]);
  const sek = await rot('/?sections=cart-drawer');
  const drawer = sek.ok ? (await sek.json())['cart-drawer'] ?? '' : '';
  ut.push(['korg-upsellen i lådan med varor i korgen', /opf-upsell/.test(drawer), drawer ? '' : `HTTP ${sek.status}`]);

  // 2. Nivå 1 + fullpris-kryssrutan: 1 huvudprodukt + 1 bonus utan kod.
  await rens();
  await lagg([{ id: variantId, quantity: 1 }, ...(bonusVariantId ? [{ id: bonusVariantId, quantity: 1 }] : [])]);
  let c = await korg();
  const forv1 = pris * 100 + (bonusVariantId ? bonuspris * 100 : 0);
  ut.push([`nivå 1 + tillval = ${kr(forv1)} i korgen (fullpris, ingen rabatt)`, c.total_price === forv1 && (c.total_discount ?? 0) === 0, `korgen säger ${kr(c.total_price)}, rabatt ${kr(c.total_discount ?? 0)}`]);

  // 3. Varje paketnivå med kod: koden + antal + gratis ⇒ exakt paketpriset.
  for (const n of paket) {
    await rens();
    const r = await rot(`/discount/${encodeURIComponent(n.kod)}?redirect=/cart.js`);
    await lagg([{ id: variantId, quantity: n.antal }, ...(n.gratisAntal > 0 && bonusVariantId ? [{ id: bonusVariantId, quantity: n.gratisAntal }] : [])]);
    c = await korg();
    const koder = (c.discount_codes ?? []).map((d) => `${d.code}${d.applicable ? '' : ' (ej tillämplig)'}`).join(',');
    ut.push([`${n.kod}: ${n.antal} st + ${n.gratisAntal} gratis = ${kr(n.pris * 100)}`, c.total_price === n.pris * 100, `korgen säger ${kr(c.total_price)} (koder: ${koder || 'inga'}, kodsvar ${r.status})`]);
  }
  await rens();
  return ut;
}

// Reservvägen när korgen är stängd för oss (Cloudflare): samma löften
// kontrolleras mot ADMIN — rabattkodernas belopp och minsta antal, produkt-
// och bonuspriset. Det är exakt de definitioner kassan räknar med, så en grön
// kodkoll + ett ögonköp av en människa ersätter korgtestet.
export async function kodkoll(graphql, { produktHandle, bonusHandle, pris, bonuspris, koder }) {
  const ut = [];
  const q = await graphql(
    `query opsFactoryKodkoll($h: String!, $b: String!) {
      produkt: productByIdentifier(identifier: { handle: $h }) { status variants(first: 1) { nodes { price } } }
      bonus: productByIdentifier(identifier: { handle: $b }) { status variants(first: 1) { nodes { price } } }
    }`,
    { h: produktHandle, b: bonusHandle ?? produktHandle }
  );
  const pPris = Number(q.produkt?.variants?.nodes?.[0]?.price);
  ut.push([`produktpriset i admin = ${pris} kr (ACTIVE)`, pPris === Number(pris) && q.produkt?.status === 'ACTIVE', `admin: ${pPris} kr, ${q.produkt?.status ?? '?'}`]);
  if (bonusHandle) {
    const bPris = Number(q.bonus?.variants?.nodes?.[0]?.price);
    ut.push([`bonuspriset i admin = ${bonuspris} kr fullpris (ACTIVE)`, bPris === Number(bonuspris) && q.bonus?.status === 'ACTIVE', `admin: ${bPris} kr, ${q.bonus?.status ?? '?'}`]);
  }
  for (const k of koder) {
    const d = await graphql(
      `query opsFactoryKod($kod: String!) {
        codeDiscountNodeByCode(code: $kod) { codeDiscount { ... on DiscountCodeBasic {
          status
          customerGets { value { ... on DiscountAmount { amount { amount } } ... on DiscountPercentage { percentage } } }
          minimumRequirement { ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity } }
        } } }
      }`,
      { kod: k.kod }
    );
    const cd = d.codeDiscountNodeByCode?.codeDiscount;
    const belopp = Number(cd?.customerGets?.value?.amount?.amount);
    const minst = Number(cd?.minimumRequirement?.greaterThanOrEqualToQuantity);
    const ok = cd?.status === 'ACTIVE' && belopp === Number(k.belopp) && minst === Number(k.minstAntal);
    ut.push([`${k.kod}: −${k.belopp} kr vid minst ${k.minstAntal} varor ⇒ ${k.kundpris} kr i kassan`, ok, cd ? `admin: ${cd.status}, −${belopp} kr, minst ${minst}` : 'koden finns inte']);
  }
  return ut;
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
  // Korg-upsellen renderas bara med varor i korgen — den kollas i köptestet.
  if (bonusHandle) fynd.push([`fullpris-kryssrutan (opf-tillagg)`, har('opf-tillagg-mall') && har('opf-tillagg__kryss')]);
  fynd.push([`inga egna köplöften (öppet köp)`, !/öppet köp|åpent kjøp/i.test(synligText(html))]);
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
  const state = lasState(butik.butik.id, p.produkt.id);
  const tema = await hamtaArbetstema(state.steg?.tema?.temaId ?? state.steg?.brand?.temaId ?? null);
  const temaId = arg.includes('--tema') ? arg[arg.indexOf('--tema') + 1] : tema?.role === 'MAIN' ? null : tema?.id;
  console.log(`Tema: ${tema?.name ?? '—'} (${tema?.role ?? '?'})`);
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
  const markorer = markorerFor(handle);
  let fel = 0;
  const vila = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const loc of locales) {
    const pre = loc ? `/${loc}` : '';
    for (const sokvag of [`${pre}/`, `${pre}/products/${handle}`]) {
      await vila(2500);
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
        const lackor = skannaMarkorer(s.html, markorer);
        if (lackor.length > 0) { console.log(`   ⚠️  svenska markörer på ${sokvag}: ${lackor.join(', ')}`); fel++; }
        else console.log(`   ✅ 0 svenska markörer av ${markorer.length}`);
      } else {
        const t = synligText(s.html);
        const forv = [p.produkt.namn, String(p.ekonomi.pris)].filter((x) => !t.includes(x));
        if (forv.length > 0) { console.log(`   ❌ saknas i svenska vyn: ${forv.join(' | ')}`); fel++; }
        else console.log(`   ✅ svensk vy: produktnamn + pris syns`);
      }
    }
  }

  // Köptestet: riktiga korgen, riktiga koder, exakt kassapris.
  const { graphql } = await import('./shopify.mjs');
  const { byggPaketplan } = await import('./paket.mjs');
  const q = await graphql(
    `query opsFactoryKollaVarianter($h: String!, $b: String!) {
      produkt: productByIdentifier(identifier: { handle: $h }) { variants(first: 1) { nodes { id } } }
      bonus: productByIdentifier(identifier: { handle: $b }) { variants(first: 1) { nodes { id } } }
    }`,
    { h: handle, b: bonusHandle ?? handle }
  );
  const num = (gid) => Number(String(gid).split('/').pop());
  const variantId = num(q.produkt?.variants?.nodes?.[0]?.id);
  const bonusVariantId = bonusHandle ? num(q.bonus?.variants?.nodes?.[0]?.id) : null;
  const plan = p.offer?.paket?.nivaer ? byggPaketplan(p) : { poster: [], koder: [] };
  const paket = plan.poster.filter((x) => x.kod);
  const bonuspris = Number(p.offer?.bonus_produkt?.pris) || 0;
  let korgVag = 'köptest';
  console.log('\nKöptest (riktiga korgen):');
  try {
    for (const [namn, ok, detalj] of await koptest(bas, burk, { variantId, bonusVariantId, pris: p.ekonomi.pris, bonuspris, paket: paket.map((x) => ({ kod: x.kod, antal: x.antal, gratisAntal: x.gratisAntal, pris: x.kundpris })) })) {
      console.log(`   ${ok ? '✅' : '❌'} ${namn}${detalj ? ` — ${detalj}` : ''}`);
      if (!ok) fel++;
    }
  } catch (e) {
    if (!e.cloudflare) throw e;
    // Korgen är stängd för molnsessionen — kontrollera samma löften mot admin.
    console.log(`   ⚠️  ${e.message}`);
    console.log('   Reservväg: rabattkoderna + priserna kontrolleras mot admin (samma definitioner kassan räknar med):');
    korgVag = 'kodkoll mot admin';
    const koder = plan.koder.map((k) => ({ ...k, kundpris: paket.find((x) => x.kod === k.kod)?.kundpris }));
    for (const [namn, ok, detalj] of await kodkoll(graphql, { produktHandle: handle, bonusHandle, pris: p.ekonomi.pris, bonuspris, koder })) {
      console.log(`   ${ok ? '✅' : '❌'} ${namn}${detalj ? ` — ${detalj}` : ''}`);
      if (!ok) fel++;
    }
    console.log('   🖐 Ett ögonköp i kundvyn (lägg paketet i korgen, se kassapriset) görs av en människa — det kan inte scriptas härifrån.');
  }

  console.log(fel === 0 ? `\n✅ Trippelkollen grön (markörer + regression + struktur + ${korgVag}). Mobilkontrollen är ett ögonjobb i temaredigeraren.` : `\n❌ ${fel} fynd — inte klart.`);
  process.exit(fel === 0 ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
