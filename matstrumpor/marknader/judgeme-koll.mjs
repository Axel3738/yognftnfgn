// judgeme-koll.mjs — Judge.me-rutan som kund på alla fjorton språk (Chromium, läs-bart, inga klick).
//
//   node matstrumpor/marknader/judgeme-koll.mjs                    # sushi-strumpor, alla fjorton språk
//   node matstrumpor/marknader/judgeme-koll.mjs --produkt <handle>
//   node matstrumpor/marknader/judgeme-koll.mjs --bara de,pl,ja
//   node matstrumpor/marknader/judgeme-koll.mjs --med-webblasare   # som en Chrome-kund, se nedan
//   node matstrumpor/marknader/judgeme-koll.mjs --bara-markning    # bara språkmärkningen, se sist
//
// Axel slog på Judge.me:s flerspråk + "Translate reviews automatically" 2026-09-29. Judge.me översätter
// en recension FÖRST när den rullas fram på skärmen: "Översätter..." och sedan texten på sidans språk
// med knappen "Visa original (svenska)". Översättningen kommer från api.judge.me, eller från
// webbläsarens egen översättare (Chrome Translator API), där den finns. Judge.me skriver själv att de
// använder "a combination of the Chrome Translation API and AI-powered translation".
//
// ⚠️ Första versionen rullade förbi rutan och läste recensionerna innan de visats på skärmen.
// 2026-10-01 14:00 UTC gav den "0 av 12 språk översatta". En mätning 11:04 UTC samma dag, som rullade
// fram varje recension, såg dem översättas. Skriptet rullar därför fram varje recension i tur och
// ordning, stannar tre sekunder vid var och en och väntar tills ingen står på "Översätter..." längre.
//
// Standard är webbläsarens översättare AV, som i Safari och Firefox, så att det är Judge.me:s egen
// översättning som mäts. --med-webblasare låter den vara på. Då syns felet med de svenska
// Shop-app-recensioner som Judge.me märkt som engelska: Chrome översätter dem "från engelska" till rotvälska.
//
// Varje sida räknar recensionerna som kunden ser utan att klicka på något, per tillstånd:
//   översatt  knappen säger "Visa original (…)": texten visas på sidans språk
//   knapp     bara knappen "Översätt …": texten står kvar på originalspråket
//   samma     ingen knapp: Judge.me anser att recensionen redan är på sidans språk
//   pågår / misslyckad  översättningen blev inte klar under väntan, eller Judge.me gav upp
//
// Sist kommer SPRÅKMÄRKNINGEN. Judge.me märkte Shop-appens recensioner som engelska, också de svenska
// (mätt 2026-10-01: 8 av 8, på sushistrumporna och ätpinnarna). En svensk recension märkt engelska
// hamnar överst på den engelska sidan och oöversatt. Listan visar varje recension märkt `en` med
// början av texten, så att den som läser ser vilket språk den faktiskt är skriven på.
// Rättas i Judge.me: Reviews → "⋯" → Review details → "Detected review language".
//
// Allra sist KOPIAN I SHOPIFY. Den svenska sidan (butikens huvudspråk) ritas ur den kopia Judge.me sparar
// i produktens metafält (judgeme.review_widget_data och review_widget_ssr_html), inte ur Judge.me:s data
// just då. Mätt 2026-10-02: kopian på sushistrumporna var skriven 2026-09-30 06:09 UTC, före Coworks
// språkrättning, och bar Kent, Wide Pia och Niklas som engelska fast Judge.me sa svenska. Ett ändrat språk
// skrev alltså inte om kopian. Listan visar varje recension vars språk i kopian skiljer sig från Judge.me:s.

const PLAYWRIGHT = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const arg = process.argv.slice(2);
const varde = (flagga) => (arg.includes(flagga) ? arg[arg.indexOf(flagga) + 1] : null);
const handle = varde('--produkt') || 'sushi-strumpor';
const bara = (varde('--bara') || '').split(',').filter(Boolean);
const medWebblasare = arg.includes('--med-webblasare');
const baraMarkning = arg.includes('--bara-markning');
const BUTIK = '1r46tp-qx.myshopify.com';

// Utlandet går via matstrumpor.com sedan 2026-09-29. .se/<språk> och .eu fungerar kvar, men inget länkar dit.
const SIDOR = [
  ['sv', 'https://matstrumpor.se', 'SE'], ['nb', 'https://matstrumpor.com/nb', 'NO'], ['da', 'https://matstrumpor.com/da', 'DK'],
  ['fi', 'https://matstrumpor.com/fi', 'FI'], ['en', 'https://matstrumpor.com', 'US'], ['de', 'https://matstrumpor.com/de', 'DE'],
  ['fr', 'https://matstrumpor.com/fr', 'FR'], ['nl', 'https://matstrumpor.com/nl', 'NL'], ['es', 'https://matstrumpor.com/es', 'ES'],
  ['it', 'https://matstrumpor.com/it', 'IT'], ['pl', 'https://matstrumpor.com/pl', 'PL'], ['pt-PT', 'https://matstrumpor.com/pt-pt', 'PT'],
  ['ja', 'https://matstrumpor.com/ja', 'JP'], ['zh-TW', 'https://matstrumpor.com/zh-tw', 'TW'],
].filter(([sprak]) => !bara.length || bara.includes(sprak));

// Läser rutan i sidan: texterna kommer ur sidans egen jdgmSettings, så att tillståndet bestäms på sidans språk.
function lasRutan() {
  const rent = (x) => (x ?? '').replace(/\s+/g, ' ').trim();
  const skript = [...document.scripts].find((x) => x.textContent.includes('window.jdgmSettings'))?.textContent ?? '';
  const falt = (n) => {
    const m = new RegExp(`"${n}":"((?:[^"\\\\]|\\\\.)*)"`).exec(skript);
    return m ? JSON.parse(`"${m[1]}"`) : null;
  };
  const fore = (t) => (t ? t.split('{{')[0].trim() : null);
  const T = {
    original: fore(falt('widget_show_original_translation_text')),
    pagar: fore(falt('widget_translating_review_text')),
    misslyckad: fore(falt('widget_translate_review_failed_text')) || fore(falt('widget_failed_translation_text')),
  };
  const recensioner = [...document.querySelectorAll('.jm-review-item')].filter((e) => e.offsetParent !== null).map((e) => {
    const knapp = rent(e.querySelector('.jdgm-translate-button')?.innerText);
    let tillstand = 'samma';
    if (knapp) {
      if (T.original && knapp.startsWith(T.original)) tillstand = 'oversatt';
      else if (T.pagar && knapp.startsWith(T.pagar)) tillstand = 'pagar';
      else if (T.misslyckad && knapp.startsWith(T.misslyckad)) tillstand = 'misslyckad';
      else tillstand = 'knapp';
    }
    return {
      namn: rent(e.querySelector('.jm-reviewer-info__name')?.innerText),
      sektion: e.closest('.jm-other-languages-section') ? 'andra' : 'huvud',
      tillstand,
      fran: tillstand === 'oversatt' ? (/\(([^)]*)\)\s*$/.exec(knapp)?.[1] ?? '') : '',
      knapp,
      text: rent(e.querySelector('.jdgm-review-content__body-content, .jm-review-content__body')?.innerText).slice(0, 90),
    };
  });
  // Antalet i rutans huvud ("11 recenzji"): första synliga textnod med tal + ord i recensionsrutan.
  const rot = document.querySelector('.jdgm-review-widget') ?? document;
  const antalText = [...rot.querySelectorAll('*')].find((e) => e.children.length === 0 && e.offsetParent !== null && /^\d+\s+\S+$/.test(rent(e.textContent)))?.textContent;
  return {
    lang: document.documentElement.lang,
    titel: falt('widget_title'),
    antal: rent(antalText),
    paslagen: /"widget_translate_review_content_enabled":true/.test(skript),
    metod: falt('widget_translate_review_content_method'),
    webblasare: typeof window.Translator !== 'undefined',
    recensioner,
  };
}

// Sidorna: varje språk som kund i Chromium.
async function sidorna() {
const { chromium } = await import(PLAYWRIGHT);
const b = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--ignore-certificate-errors'], proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const ut = [];
async function las([sprak, bas, land]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
  if (!medWebblasare) {
    await ctx.addInitScript(() => {
      for (const n of ['Translator', 'LanguageDetector']) { try { Object.defineProperty(window, n, { value: undefined, configurable: true }); } catch {} }
    });
  }
  const s = await ctx.newPage();
  const url = `${bas}/products/${handle}?country=${land}`;
  const r = { sprak, url, api: 0 };
  s.on('request', (q) => { if (q.url().includes('review_translations')) r.api++; });
  try {
    await s.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    for (let y = 0; y < 14; y++) { await s.mouse.wheel(0, 900); await s.waitForTimeout(300); }
    await s.waitForSelector('.jm-review-item', { timeout: 30000 });
    // Rulla fram varje recension, en i taget, så som kunden läser rutan. Tre sekunder per recension:
    // med 1,2 s startade Judge.me ingen översättning alls på en- och sv-sidan (0 anrop), med 3 s
    // kom anropet och svaret (mätt 2026-10-01).
    const antal = await s.locator('.jm-review-item').count();
    for (let i = 0; i < antal; i++) {
      const el = s.locator('.jm-review-item').nth(i);
      if (await el.isVisible()) { await el.scrollIntoViewIfNeeded().catch(() => {}); await s.waitForTimeout(3000); }
    }
    // Vänta tills ingen recension står på "Översätter..." (högst 25 s).
    let lage = await s.evaluate(lasRutan);
    for (let v = 0; v < 25 && lage.recensioner.some((x) => x.tillstand === 'pagar'); v++) { await s.waitForTimeout(1000); lage = await s.evaluate(lasRutan); }
    Object.assign(r, lage);
  } catch (e) { r.fel = e.message.split('\n')[0]; }
  ut.push(r);
  await ctx.close();
}
const ko = [...SIDOR];
await Promise.all([0, 1, 2].map(async () => { while (ko.length) await las(ko.shift()); }));
await b.close();
ut.sort((a, c) => SIDOR.findIndex((x) => x[0] === a.sprak) - SIDOR.findIndex((x) => x[0] === c.sprak));

console.log(`Webbläsarens översättare: ${medWebblasare ? 'PÅ (som Chrome)' : 'AV (som Safari/Firefox)'}\n`);
let klara = 0;
for (const r of ut) {
  if (r.fel) { console.log(`❌ ${r.sprak.padEnd(5)} ${r.fel}`); continue; }
  const n = (t) => r.recensioner.filter((x) => x.tillstand === t).length;
  const fran = {};
  for (const x of r.recensioner.filter((y) => y.tillstand === 'oversatt')) fran[x.fran] = (fran[x.fran] ?? 0) + 1;
  const franText = Object.entries(fran).map(([k, v]) => `${v} från ${k}`).join(', ');
  const ok = n('knapp') + n('pagar') + n('misslyckad') === 0 && r.recensioner.length > 0;
  if (ok) klara++;
  console.log(`${ok ? '✅' : '⏳'} ${r.sprak.padEnd(5)} "${r.titel}" · "${r.antal}" · ${r.recensioner.length} visas: översatta ${n('oversatt')}${franText ? ` (${franText})` : ''}, bara knapp ${n('knapp')}, samma språk ${n('samma')}, pågår ${n('pagar')}, misslyckade ${n('misslyckad')} · api ${r.api} · inställning ${r.paslagen}/${r.metod}`);
  if (arg.includes('--visa')) for (const x of r.recensioner) console.log(`      ${x.sektion.padEnd(5)} ${x.namn.padEnd(14)} ${x.tillstand.padEnd(10)} ${x.knapp.padEnd(34)} ${x.text}`);
}
console.log(`\n${klara} av ${ut.filter((r) => !r.fel).length} språk visar recensionerna på sidans språk utan att kunden klickar "Översätt".`);
}

// Språkmärkningen: varje recension Judge.me märkt engelska, på alla produkter kunden kan nå (också
// olistade, som ätpinnarna). Produkterna läses ur Shopify när nycklarna finns, annars ur products.json
// (då saknas de olistade, och det står i utskriften). Med primary_language=en ligger de engelskmärkta
// i widgetdatans `primary_language_reviews`.
async function produkterna() {
  try {
    const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
    const k = await skapaKlient(lasButik('matstrumpor'));
    const d = await k.graphql('{ products(first: 100) { nodes { legacyResourceId handle status } } }');
    const nar = d.products.nodes.filter((p) => p.status === 'ACTIVE' || p.status === 'UNLISTED');
    return { kalla: 'Shopify (aktiva och olistade)', produkter: nar.map((p) => ({ id: p.legacyResourceId, handle: p.handle })) };
  } catch (e) {
    const j = await (await fetch('https://matstrumpor.se/products.json?limit=250')).json();
    return { kalla: `products.json, utan olistade produkter (Shopify gick inte: ${e.message.split('\n')[0].slice(0, 120)})`, produkter: j.products.map((p) => ({ id: String(p.id), handle: p.handle })) };
  }
}
async function markningen({ kalla, produkter }) {
  const en = [];
  let totalt = 0;
  for (const p of produkter) {
    const sett = new Set();
    for (let sida = 1; sida <= 20; sida++) {
      const u = `https://judge.me/reviews/reviews_for_widget?url=${BUTIK}&shop_domain=${BUTIK}&platform=shopify&page=${sida}&per_page=10&product_id=${p.id}&primary_language=en&translation_locale=en`;
      const j = await (await fetch(u)).json();
      if (sida === 1) totalt += Number(j.number_of_reviews ?? 0);
      const rader = (j.primary_language_reviews ?? []).filter((r) => r?.uuid && !sett.has(r.uuid));
      if (!rader.length) break;
      for (const r of rader) {
        sett.add(r.uuid);
        if (r.language === 'en') en.push({ produkt: p.handle, namn: r.reviewer_name, kalla: r.source ?? 'judge.me', datum: String(r.created_at ?? '').slice(0, 10), text: String(r.body_html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70) });
      }
    }
  }
  console.log(`\nSpråkmärkningen: ${produkter.length} produkter ur ${kalla}, ${totalt} recensioner, ${en.length} märkta engelska.`);
  for (const r of en) console.log(`  ⚠️ ${r.produkt} · ${r.namn} · ${r.kalla} · ${r.datum} · "${r.text}"`);
  if (en.some((r) => r.kalla === 'shop-app')) {
    console.log('  Shop-appens recensioner kom in märkta engelska också när de var svenska (mätt 2026-10-01). Är texten svensk står den');
    console.log('  överst och oöversatt på den engelska sidan. Rättas i Judge.me: Reviews → "⋯" → Review details → "Detected review language".');
  }
  return en;
}

// Kopian i Shopify mot Judge.me nu, per recension (uuid). Utan Shopify-nycklar går kopian inte att läsa.
async function kopian(produkter) {
  let k;
  try {
    const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
    k = await skapaKlient(lasButik('matstrumpor'));
  } catch (e) {
    console.log(`\nKopian i Shopify gick inte att läsa: ${e.message.split('\n')[0].slice(0, 120)}`);
    return;
  }
  console.log('\nKopian i Shopify, som den svenska sidan ritas ur:');
  for (const p of produkter) {
    const d = await k.graphql(`{ product(id: "gid://shopify/Product/${p.id}") { m: metafield(namespace: "judgeme", key: "review_widget_data") { updatedAt jsonValue } } }`);
    const j = d.product?.m?.jsonValue;
    if (!j) continue;
    const kopia = [...(j.primary_language_reviews ?? []), ...(j.other_language_reviews ?? []), ...(j.reviews ?? [])].filter((r) => r?.uuid);
    const nu = new Map();
    for (let sida = 1; sida <= 20; sida++) {
      const u = `https://judge.me/reviews/reviews_for_widget?url=${BUTIK}&shop_domain=${BUTIK}&platform=shopify&page=${sida}&per_page=10&product_id=${p.id}&primary_language=sv&translation_locale=sv`;
      const x = await (await fetch(u)).json();
      const rader = [...(x.primary_language_reviews ?? []), ...(x.other_language_reviews ?? [])].filter((r) => r?.uuid && !nu.has(r.uuid));
      if (!rader.length) break;
      for (const r of rader) nu.set(r.uuid, r.language);
    }
    const datum = String(j.metafield_updated_at ?? d.product.m.updatedAt).slice(0, 16).replace('T', ' ');
    const avviker = kopia.filter((r) => nu.has(r.uuid) && nu.get(r.uuid) !== r.language);
    if (!avviker.length) console.log(`  ✅ ${p.handle} · skriven ${datum} UTC · språket stämmer i kopian (${kopia.length} recensioner)`);
    else console.log(`  ⚠️ ${p.handle} · skriven ${datum} UTC · ${avviker.map((r) => `${r.reviewer_name} ${r.language} i kopian, ${nu.get(r.uuid)} hos Judge.me`).join(' · ')}`);
  }
}

if (!baraMarkning) await sidorna();
const lista = await produkterna();
await markningen(lista);
await kopian(lista.produkter);
