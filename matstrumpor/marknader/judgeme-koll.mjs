// judgeme-koll.mjs — Judge.me-rutan som kund på alla tolv språk (Chromium, läs-bart).
//
//   node matstrumpor/marknader/judgeme-koll.mjs                 # sushi-strumpor, alla tolv språk
//   node matstrumpor/marknader/judgeme-koll.mjs --produkt <handle>
//
// Axel slog på Judge.me:s flerspråk + "Translate reviews automatically" 2026-09-29. Samma kväll var
// rutans texter översatta på alla språk men recensionerna inte (Judge.me: upp till 48 h). Skriptet
// räknar per språk: recensioner som visas översatta (knappen säger "Visa original"), recensioner som
// bara har knappen "Översätt …" (inte översatta), och recensioner utan knapp (samma språk som sidan,
// enligt Judge.me — Shop-appens svenska recensioner är märkta engelska, se README).
// Läser också inställningen ur sidans jdgmSettings, så att "avstängt" och "inte klart än" skiljs åt.

const PLAYWRIGHT = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const arg = process.argv.slice(2);
const handle = arg.includes('--produkt') ? arg[arg.indexOf('--produkt') + 1] : 'sushi-strumpor';
const SIDOR = [
  ['sv', 'https://matstrumpor.se', 'SE'], ['nb', 'https://matstrumpor.se/nb', 'NO'], ['da', 'https://matstrumpor.se/da', 'DK'],
  ['fi', 'https://matstrumpor.se/fi', 'FI'], ['en', 'https://matstrumpor.com', 'US'], ['de', 'https://matstrumpor.eu/de', 'DE'],
  ['fr', 'https://matstrumpor.eu/fr', 'FR'], ['nl', 'https://matstrumpor.eu/nl', 'NL'], ['es', 'https://matstrumpor.eu/es', 'ES'],
  ['it', 'https://matstrumpor.eu/it', 'IT'], ['pl', 'https://matstrumpor.eu/pl', 'PL'], ['pt-PT', 'https://matstrumpor.eu/pt-pt', 'PT'],
];
const ORIGINAL = /original|alkuperäinen|oryginał|originál/i;

const { chromium } = await import(PLAYWRIGHT);
const b = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--ignore-certificate-errors'], proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const ut = [];
async function las([sprak, bas, land]) {
  const s = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const url = `${bas}/products/${handle}?country=${land}`;
  const r = { sprak, url };
  try {
    await s.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    for (let y = 0; y < 14; y++) { await s.mouse.wheel(0, 900); await s.waitForTimeout(350); }
    await s.waitForSelector('.jm-review-item__body', { timeout: 20000 }).catch(() => {});
    await s.waitForTimeout(3500);
    Object.assign(r, await s.evaluate((orig) => {
      const rent = (x) => (x ?? '').replace(/\s+/g, ' ').trim();
      const skript = [...document.scripts].find((x) => x.textContent.includes('window.jdgmSettings'))?.textContent ?? '';
      const falt = (n) => new RegExp(`"${n}":("?[^,"]*"?)`).exec(skript)?.[1]?.replace(/"/g, '') ?? null;
      const rev = [...document.querySelectorAll('.jm-review-item__body')].map((e) => rent(e.querySelector('.jdgm-translate-button')?.innerText));
      return {
        titel: falt('widget_title'), paslagen: falt('widget_translate_review_content_enabled'), metod: falt('widget_translate_review_content_method'),
        lang: document.documentElement.lang,
        oversatta: rev.filter((k) => k && new RegExp(orig, 'i').test(k)).length,
        barKnapp: rev.filter((k) => k && !new RegExp(orig, 'i').test(k)).length,
        utanKnapp: rev.filter((k) => !k).length,
      };
    }, ORIGINAL.source));
  } catch (e) { r.fel = e.message.split('\n')[0]; }
  ut.push(r);
  await s.close();
}
const ko = [...SIDOR];
await Promise.all([0, 1, 2].map(async () => { while (ko.length) await las(ko.shift()); }));
await b.close();
ut.sort((a, c) => SIDOR.findIndex((x) => x[0] === a.sprak) - SIDOR.findIndex((x) => x[0] === c.sprak));
let klara = 0;
for (const r of ut) {
  if (r.fel) { console.log(`❌ ${r.sprak.padEnd(5)} ${r.fel}`); continue; }
  const ok = r.barKnapp === 0 && r.oversatta + r.utanKnapp > 0;
  if (ok) klara++;
  console.log(`${ok ? '✅' : '⏳'} ${r.sprak.padEnd(5)} "${r.titel}" · översatta ${r.oversatta}, bara knapp ${r.barKnapp}, samma språk ${r.utanKnapp} · inställning ${r.paslagen}/${r.metod}`);
}
console.log(`\n${klara} av ${ut.length} språk visar recensionerna utan att kunden klickar "Översätt".`);
