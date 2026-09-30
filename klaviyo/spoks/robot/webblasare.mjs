// Robotwebbläsaren mot Spoks-appen (app.spoks.com). Spoks MCP och Spoks publika API kan inte
// schemalägga (docs: "publish or schedule it from the app"), så roboten klickar i appen som en
// människa. Appen är Flutter webb: den ritar på canvas och har knappar i DOM:en först när
// tillgänglighetsläget slås på (flt-semantics-placeholder). Byggd 2026-09-30.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { X509Certificate, createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Profilen bär inloggningen (Firebase i IndexedDB) och ligger aldrig i repot.
export const PROFIL = process.env.SPOKS_PROFIL ?? join(homedir(), '.cache', 'spoks-robot', 'profil');
const CA_BUNDLE = '/root/.ccr/ca-bundle.crt';

// Roboten trycker aldrig på en knapp som skickar direkt, oavsett vad den blir tillsagd.
export const SKICKA_NU = /publicera nu|skicka nu|send now|publish now/i;

function laddaPlaywright() {
  const req = createRequire(import.meta.url);
  try { return req('playwright'); } catch { /* inte lokalt installerat */ }
  const global = execSync('npm root -g', { encoding: 'utf8' }).trim();
  return req(join(global, 'playwright'));
}

// claude.ai-containerns proxy skriver om TLS. Chromium litar bara på proxyns egna CA:er
// (SPKI-hashar ur containerns bundle), inte på allt: ingen certifikatkontroll stängs av.
export function spkiHashar(bundleText) {
  const pem = String(bundleText).match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) ?? [];
  const ut = [];
  for (const p of pem) {
    try {
      const c = new X509Certificate(p);
      if (!/Anthropic/.test(c.subject)) continue;
      const der = c.publicKey.export({ type: 'spki', format: 'der' });
      ut.push(createHash('sha256').update(der).digest('base64'));
    } catch { /* trasigt certifikat i bundeln */ }
  }
  return [...new Set(ut)];
}

export async function starta({ headless = true } = {}) {
  const { chromium } = laddaPlaywright();
  mkdirSync(PROFIL, { recursive: true });
  const args = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
  if (existsSync(CA_BUNDLE)) {
    const h = spkiHashar(readFileSync(CA_BUNDLE, 'utf8'));
    if (h.length) args.unshift('--ignore-certificate-errors-spki-list=' + h.join(','));
  }
  const exe = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
  const ctx = await chromium.launchPersistentContext(PROFIL, {
    headless,
    executablePath: exe,
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 900 },
    locale: 'sv-SE',
    timezoneId: 'Europe/Stockholm',
    args,
  });
  const page = ctx.pages()[0] ?? await ctx.newPage();
  page.__put = [];
  page.on('request', (q) => { if (q.method() === 'PUT' && /frontend\.spoks\.com/.test(q.url())) page.__put.push(q.url()); });
  return { ctx, page };
}

export async function semantik(page) {
  await page.evaluate(() => { const p = document.querySelector('flt-semantics-placeholder'); if (p) p.click(); });
  await page.waitForTimeout(800);
}

export async function texter(page) {
  await semantik(page);
  return page.evaluate(() => [...document.querySelectorAll('flt-semantics, input, textarea')]
    .map((e) => ({ role: e.getAttribute('role') ?? e.tagName.toLowerCase(), t: ((e.getAttribute('aria-label') ?? '') || (e.textContent ?? '')).trim().replace(/\s+/g, ' ').slice(0, 120) }))
    .filter((e) => e.t));
}

export async function vantaPaText(page, text, ms = 30000) {
  const slut = Date.now() + ms;
  while (Date.now() < slut) {
    if ((await texter(page)).some((e) => e.t.includes(text))) return true;
    await page.waitForTimeout(1000);
  }
  return false;
}

// Minsta noden vars text är exakt `text` (eller börjar med den när exakt=false).
export async function nod(page, text, { exakt = true, roll = null } = {}) {
  await semantik(page);
  const h = await page.evaluateHandle(({ text, exakt, roll }) => {
    const alla = [...document.querySelectorAll('flt-semantics')].filter((e) => {
      const t = ((e.getAttribute('aria-label') ?? '') || (e.textContent ?? '')).trim();
      if (roll && e.getAttribute('role') !== roll) return false;
      return exakt ? t === text : t.startsWith(text);
    });
    const yta = (e) => { const b = e.getBoundingClientRect(); return b.width * b.height; };
    alla.sort((a, b) => yta(a) - yta(b));
    return alla[0] ?? null;
  }, { text, exakt, roll });
  return h.asElement();
}

export async function klicka(page, text, opt = {}) {
  if (SKICKA_NU.test(text)) throw new Error('Spärr: roboten trycker aldrig på något som skickar direkt.');
  const el = await nod(page, text, opt);
  if (!el) throw new Error(`Hittar inte "${text}" på sidan.`);
  const b = await el.boundingBox();
  if (!b) throw new Error(`"${text}" syns inte på sidan.`);
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await page.waitForTimeout(1200);
}
