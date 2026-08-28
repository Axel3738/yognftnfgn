#!/usr/bin/env node
// kaching-cli — automate Kaching Bundles (Shopify embedded app) from the command line.
//
// Public (no login needed):
//   list    --store <s>                       All deal blocks from the deal_blocks shop metafield.
//   verify  --store <s> [--product <handle>]  Lint deal blocks + compare against the live product page.
//
// Browser-backed (needs one manual `login` first; windows are headed because
// admin.shopify.com's Cloudflare check blocks headless Chrome):
//   login                                     Open Chrome; log in to Shopify admin once by hand.
//   status                                    Is the saved profile still logged in?
//   recon     --store <s> [--seconds N]       Open the Kaching app, record all its network traffic.
//   record    --store <s> [--seconds N]       Same, headed + long: a human clicks around while it records.
//   api       --store <s> --url <u> [--method M] [--body f.json]
//                                             fetch() INSIDE the app iframe (App Bridge injects auth).
//   admin-api --store <s> --query <graphql|@file> [--variables @file]
//                                             Admin GraphQL via Shopify's web proxy (full Admin API).
//
// Store names live in stores.json.

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, adminUrl, isLoginUrl, waitForAppFrame, adminGraphql } from './lib/browser.mjs';
import { withApp, assertOk, API } from './lib/api.mjs';
import { fetchDealBlocks, fetchProductPageSettings, summarizeDealBlock, lintDealBlock } from './lib/storefront.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
// Kaching's App Store handle is bundle-deals; some stores expose it as kaching-bundles.
const APP_HANDLES = ['bundle-deals', 'kaching-bundles'];

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { args[key] = next; i++; }
      else args[key] = true;
    } else args._.push(a);
  }
  return args;
}

function storeInfo(name) {
  if (!name) die('saknar --store');
  const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'stores.json'), 'utf8'));
  if (reg[name]) return { name, ...reg[name] };
  const hit = Object.entries(reg).find(([, v]) => v.handle === name || v.myshopify?.startsWith(name));
  if (hit) return { name: hit[0], ...hit[1] };
  return { name, handle: name, myshopify: `${name}.myshopify.com`, publicUrl: null };
}

function die(msg) { console.error(`kaching-cli: ${msg}`); process.exit(1); }
function ts() { return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); }
function readArgValue(v) {
  if (typeof v !== 'string') return null;
  return v.startsWith('@') ? fs.readFileSync(v.slice(1), 'utf8') : v;
}

// ---------------------------------------------------------------- login
async function cmdLogin() {
  const context = await launch({ headed: true });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://admin.shopify.com', { waitUntil: 'domcontentloaded' });
  console.log('Ett Chrome-fönster är öppet. Logga in på Shopify admin där (inkl. captcha/2FA om det frågas).');
  console.log('Fönstret stänger sig självt när inloggningen är klar. Timeout: 10 min.');
  const start = Date.now();
  while (Date.now() - start < 10 * 60 * 1000) {
    await page.waitForTimeout(2000);
    const url = page.url();
    if (/admin\.shopify\.com\/store\//.test(url) && !isLoginUrl(url)) {
      console.log(`Inloggad. (${url})`);
      await context.close();
      return;
    }
  }
  await context.close();
  die('timeout: ingen inloggning inom 10 minuter');
}

// ---------------------------------------------------------------- status
async function cmdStatus(args) {
  const store = args.store ? storeInfo(args.store) : storeInfo(Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'stores.json'), 'utf8'))).filter((k) => !k.startsWith('_'))[0]);
  const context = await launch({ headed: true });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(adminUrl(store.handle), { waitUntil: 'domcontentloaded' });
  let verdict = 'UNKNOWN';
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1500);
    const url = page.url();
    if (isLoginUrl(url)) { verdict = 'NOT LOGGED IN'; break; }
    const title = await page.title();
    if (title && !/^(Loading|Just a moment)/.test(title)) { verdict = `LOGGED IN (${title})`; break; }
  }
  await context.close();
  console.log(verdict);
  if (verdict === 'NOT LOGGED IN') { console.log('Kör: node kaching.mjs login'); process.exit(2); }
}

// ------------------------------------------------------------------ list
async function cmdList(args) {
  const store = storeInfo(args.store);
  const { dealBlocks, updatedAt } = await fetchDealBlocks(store);
  console.log(`# ${store.name} — ${dealBlocks.length} deal block(s), metafield uppdaterad ${updatedAt}\n`);
  for (const b of dealBlocks) console.log(summarizeDealBlock(b) + '\n');
  if (args.json) {
    const file = path.join(ROOT, 'exports', `deal-blocks-${store.name}-${ts()}.json`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(dealBlocks, null, 2));
    console.log(`Export: ${file}`);
  }
}

// ---------------------------------------------------------------- verify
async function cmdVerify(args) {
  const store = storeInfo(args.store);
  const { dealBlocks, config } = await fetchDealBlocks(store);
  let failed = false;
  console.log(`# ${store.name} — verifierar ${dealBlocks.length} deal block(s)\n`);
  for (const b of dealBlocks) {
    const { errors, notes } = lintDealBlock(b);
    const label = `${b.blockTitle} (${b.nanoId}${b.abTestVariantNumber ? `, A/B ${b.abTestVariantNumber}` : ''})`;
    if (errors.length) {
      failed = true;
      console.log(`FEL ${label}:`);
      for (const p of errors) console.log(`  - ${p}`);
    } else {
      console.log(`OK  ${label}`);
    }
    for (const n of notes) console.log(`  OBS: ${n}`);
  }
  if (args.product) {
    const pageBlocks = await fetchProductPageSettings(store, String(args.product));
    console.log(`\nProduktsidan /products/${args.product} renderar ${pageBlocks.length} deal block(s):`);
    for (const b of pageBlocks) {
      console.log(summarizeDealBlock(b));
      const { errors, notes } = lintDealBlock(b);
      for (const p of errors) { failed = true; console.log(`  FEL: ${p}`); }
      for (const n of notes) console.log(`  OBS: ${n}`);
      const inMetafield = dealBlocks.some((mb) => mb.id === b.id && mb.versionId === b.versionId);
      if (!inMetafield) console.log('  OBS: sidans version matchar ingen metafield-version — CDN-cache? (kan ta några minuter)');
    }
    if (pageBlocks.length === 0) console.log('  OBS: INGA kaching-block på sidan — app-embed av, eller produkten inte vald i något block.');
  }
  console.log(config ? '' : '');
  process.exit(failed ? 3 : 0);
}

// ------------------------------------------------------- traffic capture
function attachRecorder(context) {
  const events = [];
  context.on('request', (req) => {
    const rt = req.resourceType();
    if (rt !== 'xhr' && rt !== 'fetch' && rt !== 'document') return;
    events.push({
      kind: 'request', t: Date.now(), method: req.method(), url: req.url(),
      resourceType: rt, headers: req.headers(), postData: req.postData(),
    });
  });
  context.on('response', async (res) => {
    const req = res.request();
    const rt = req.resourceType();
    if (rt !== 'xhr' && rt !== 'fetch') return;
    const entry = {
      kind: 'response', t: Date.now(), method: req.method(), url: res.url(),
      status: res.status(), headers: res.headers(),
    };
    try {
      const ct = res.headers()['content-type'] || '';
      if (/json|text/.test(ct)) {
        const body = await res.text();
        entry.body = body.length > 500_000 ? body.slice(0, 500_000) + '…[truncated]' : body;
      }
    } catch { /* body unavailable after navigation */ }
    events.push(entry);
  });
  return events;
}

function saveRecon(store, label, events, extra = {}) {
  const dir = path.join(ROOT, 'recon');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${label}-${store}-${ts()}.json`);
  fs.writeFileSync(file, JSON.stringify({ store, captured: events.length, ...extra, events }, null, 1));
  console.log(`Sparade ${events.length} händelser -> ${file}`);
  return file;
}

async function openApp(context, store) {
  const page = context.pages()[0] || (await context.newPage());
  for (const handle of APP_HANDLES) {
    await page.goto(adminUrl(store.handle, `/apps/${handle}`), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    if (isLoginUrl(page.url())) die('inte inloggad — kör: node kaching.mjs login');
    const frame = await waitForAppFrame(page, { timeoutMs: 20000 });
    if (frame) return { page, frame, appHandle: handle };
    const text = await page.evaluate(() => document.body?.innerText?.slice(0, 200) || '');
    if (/finns inte|not found|404/i.test(text)) continue;
  }
  return { page, frame: null, appHandle: null };
}

// ---------------------------------------------------------------- recon
async function cmdRecon(args) {
  const store = storeInfo(args.store);
  const seconds = Number(args.seconds || 25);
  const context = await launch({ headed: true });
  const events = attachRecorder(context);
  const { page, frame, appHandle } = await openApp(context, store);
  console.log(`App-handle: ${appHandle} | iframe: ${frame ? frame.url() : 'HITTADES INTE'}`);
  await page.waitForTimeout(seconds * 1000);
  let appBridge = null;
  if (frame) {
    try {
      appBridge = await frame.evaluate(async () => {
        const out = { origin: location.origin, href: location.href, hasShopifyGlobal: !!window.shopify };
        if (window.shopify && typeof window.shopify.idToken === 'function') {
          try { out.idToken = await window.shopify.idToken(); } catch (e) { out.idTokenError = String(e); }
        }
        return out;
      });
    } catch (e) { appBridge = { error: String(e) }; }
  }
  saveRecon(store.name, 'recon', events, { appFrameUrl: frame?.url() || null, appHandle, appBridge });
  await context.close();
}

// ---------------------------------------------------------------- record
async function cmdRecord(args) {
  const store = storeInfo(args.store);
  const seconds = Number(args.seconds || 300);
  const context = await launch({ headed: true });
  const events = attachRecorder(context);
  const { frame, appHandle } = await openApp(context, store);
  console.log(`App-handle: ${appHandle} | iframe: ${frame ? frame.url() : 'HITTADES INTE'}`);
  console.log(`Spelar in i ${seconds}s — klicka runt i Kaching-appen nu (skapa/ändra en bundle).`);
  await new Promise((r) => setTimeout(r, seconds * 1000));
  saveRecon(store.name, 'record', events, { appFrameUrl: frame?.url() || null, appHandle });
  await context.close();
}

// ------------------------------------------------------------------ api
async function cmdApi(args) {
  const store = storeInfo(args.store);
  if (!args.url) die('saknar --url');
  const method = (String(args.method || 'GET')).toUpperCase();
  const body = args.body ? fs.readFileSync(String(args.body), 'utf8') : null;
  const context = await launch({ headed: true });
  const { frame } = await openApp(context, store);
  if (!frame) { await context.close(); die('hittade ingen app-iframe'); }
  const result = await frame.evaluate(async ({ url, method, body }) => {
    // App Bridge's fetch interceptor injects a fresh session-token Authorization
    // header on every fetch made inside the iframe; explicit idToken is backup.
    const headers = { 'content-type': 'application/json' };
    if (window.shopify && typeof window.shopify.idToken === 'function') {
      try { headers.authorization = `Bearer ${await window.shopify.idToken()}`; } catch { /* interceptor/cookies */ }
    }
    const res = await fetch(url, { method, headers, credentials: 'include', body: body || undefined });
    const text = await res.text();
    return { status: res.status, headers: Object.fromEntries(res.headers.entries()), text };
  }, { url: String(args.url), method, body });
  await context.close();
  console.log(JSON.stringify(result, null, 2));
  if (result.status >= 400) process.exit(3);
}

// ------------------------------------------------------------- admin-api
async function cmdAdminApi(args) {
  const store = storeInfo(args.store);
  const query = readArgValue(args.query);
  if (!query) die('saknar --query (GraphQL-sträng eller @fil)');
  const variables = args.variables ? JSON.parse(readArgValue(args.variables)) : {};
  const context = await launch({ headed: true });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(adminUrl(store.handle), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  if (isLoginUrl(page.url())) { await context.close(); die('inte inloggad — kör: node kaching.mjs login'); }
  const result = await adminGraphql(page, store.handle, query, variables);
  await context.close();
  console.log(JSON.stringify(result, null, 2));
  if (result.status >= 400 || result.json?.errors) process.exit(3);
}

// ------------------------------------------------- deal block CRUD (API)
async function cmdBlocks(args) {
  const store = storeInfo(args.store);
  const out = await withApp(store.handle, async (call) => assertOk('GET deal_blocks', await call('GET', `${API}/deal_blocks`)));
  for (const b of out) {
    console.log(`${b.id} | ${b.status} | "${b.blockName}" | ${b.dealBars.length} rader: ${b.dealBars.map((d) => d.title).join(' / ')}`);
  }
  if (!out.length) console.log('(inga deal blocks)');
}

async function cmdGet(args) {
  const store = storeInfo(args.store);
  if (!args.id) die('saknar --id');
  const out = await withApp(store.handle, async (call) =>
    assertOk('GET deal_block', await call('GET', `${API}/deal_blocks/${args.id}`)));
  console.log(JSON.stringify(out.deal_block ?? out, null, 2));
}

// Create + read-back verification in a single browser session.
//
// There is no POST route: the app generates the UUID client-side and PUTs to
// /deal_blocks/<uuid>, which upserts. `publish: true` makes it active in the same
// call. Confirmed by reading the app's own DealBlock editor bundle.
async function cmdCreate(args) {
  const store = storeInfo(args.store);
  if (!args.file) die('saknar --file <payload.json>');
  const payload = JSON.parse(fs.readFileSync(String(args.file), 'utf8'));
  delete payload._comment;
  const id = payload.id || crypto.randomUUID();
  payload.id = id;
  const publish = args.draft ? false : true;

  const result = await withApp(store.handle, async (call) => {
    // The scaffold supplies shop-level defaults (start timestamp, custom styles).
    const scaffold = assertOk('GET deal_blocks/new', await call('GET', `${API}/deal_blocks/new`));
    if (payload.startTimestamp == null) payload.startTimestamp = scaffold.startTimestamp;
    if (payload.shopCustomStyles == null) payload.shopCustomStyles = scaffold.shopCustomStyles ?? '';

    const vis = await call('POST', `${API}/deal_blocks/${id}/validate_visibility`, {
      visibility: {
        blockVisibility: payload.blockVisibility,
        selectedProductGIDs: (payload.selectedProducts || []).map((p) => p.id),
        selectedCollectionGIDs: (payload.selectedCollections || []).map((c) => c.id),
        excludedProductGIDs: (payload.excludedProducts || []).map((p) => p.id),
        excludedCollectionGIDs: (payload.excludedCollections || []).map((c) => c.id),
      },
    });
    if (vis.status < 400 && vis.json) console.log(`validate_visibility: ${JSON.stringify(vis.json)}`);

    const created = assertOk('PUT deal_block', await call('PUT', `${API}/deal_blocks/${id}`, {
      deal_block: payload,
      ab_test_variants: [],
      ab_test_traffic_allocation: null,
      test_type: 'manual',
      publish,
    }));
    const readBack = assertOk('GET deal_block', await call('GET', `${API}/deal_blocks/${id}`));
    const list = assertOk('GET deal_blocks', await call('GET', `${API}/deal_blocks`));
    return { id, created, readBack: readBack.deal_block ?? readBack, list };
  });

  const b = result.readBack;
  console.log(`Skapade deal block ${result.id}`);
  console.log(`  namn: "${b.blockName}" | rubrik: "${b.blockTitle}" | synlighet: ${b.blockVisibility}`);
  console.log(`  produkter: ${(b.selectedProducts || []).map((p) => p.id).join(', ') || '(inga)'}`);
  for (const bar of b.dealBars || []) {
    console.log(`  rad ${bar.id}: "${bar.title}" | qty ${bar.quantity} | ${bar.discountType}=${bar.discountValue} | badge "${bar.badgeText}"`);
  }
  const status = result.list.find((x) => x.id === result.id)?.status;
  console.log(`  status: ${status}`);

  const drift = [];
  for (const [i, want] of (payload.dealBars || []).entries()) {
    const got = (b.dealBars || [])[i];
    if (!got) { drift.push(`rad ${i} saknas i svaret`); continue; }
    for (const k of ['title', 'subtitle', 'quantity', 'discountType', 'discountValue', 'badgeText']) {
      if (JSON.stringify(got[k]) !== JSON.stringify(want[k])) drift.push(`rad ${i} ${k}: skickade ${JSON.stringify(want[k])}, fick ${JSON.stringify(got[k])}`);
    }
  }
  if (drift.length) { console.log('\nAVVIKELSER mot det som skickades:'); for (const d of drift) console.log('  - ' + d); }
  else console.log('  read-back matchar payloaden exakt.');
  if (status !== 'active') console.log(`\nOBS: status är "${status}" — kör: node kaching.mjs activate --store ${store.name} --id ${result.id}`);
}

async function cmdUpdate(args) {
  const store = storeInfo(args.store);
  if (!args.id || !args.file) die('kräver --id och --file');
  const payload = JSON.parse(fs.readFileSync(String(args.file), 'utf8'));
  delete payload._comment;
  payload.id = String(args.id);
  const out = await withApp(store.handle, async (call) => {
    // Same envelope the app's own editor sends; a partial one can reset A/B state.
    const res = assertOk('PUT deal_block', await call('PUT', `${API}/deal_blocks/${args.id}`, {
      deal_block: payload,
      ab_test_variants: [],
      ab_test_traffic_allocation: null,
      test_type: 'manual',
      publish: args.draft ? false : true,
    }));
    return assertOk('GET deal_block', await call('GET', `${API}/deal_blocks/${args.id}`)).deal_block ?? res;
  });
  console.log(`Uppdaterade ${args.id}: ${(out.dealBars || []).map((d) => `${d.title} qty${d.quantity}=${d.discountValue}`).join(' | ')}`);
  console.log(`  spacing=${out.spacing} cornerRadius=${out.cornerRadius}`);
}

async function cmdActivate(args) {
  const store = storeInfo(args.store);
  if (!args.id) die('saknar --id');
  const status = args.status ? String(args.status) : 'active';
  const out = await withApp(store.handle, async (call) => {
    const attempts = [
      ['PUT', `${API}/deal_blocks/${args.id}`, { deal_block: { status } }],
      ['PUT', `${API}/deal_blocks/${args.id}/status`, { status }],
      ['POST', `${API}/deal_blocks/${args.id}/publish`, {}],
    ];
    const log = [];
    for (const [method, path, body] of attempts) {
      const res = await call(method, path, body);
      log.push(`${method} ${path.replace(API, '')} -> ${res.status}`);
      const list = await call('GET', `${API}/deal_blocks`);
      const now = list.json?.find?.((x) => x.id === args.id)?.status;
      if (now === status) return { ok: true, log, status: now };
    }
    const list = await call('GET', `${API}/deal_blocks`);
    return { ok: false, log, status: list.json?.find?.((x) => x.id === args.id)?.status };
  });
  for (const l of out.log) console.log(l);
  console.log(out.ok ? `Status är nu "${out.status}"` : `Kunde inte sätta status (står kvar på "${out.status}")`);
  if (!out.ok) process.exit(3);
}

async function cmdDelete(args) {
  const store = storeInfo(args.store);
  if (!args.id) die('saknar --id');
  const out = await withApp(store.handle, async (call) => call('DELETE', `${API}/deal_blocks/${args.id}`));
  console.log(`DELETE -> ${out.status} ${out.text.slice(0, 200)}`);
}

// ----------------------------------------------------------------- main
const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);
const commands = {
  login: cmdLogin, status: cmdStatus, list: cmdList, verify: cmdVerify,
  recon: cmdRecon, record: cmdRecord, api: cmdApi, 'admin-api': cmdAdminApi,
  blocks: cmdBlocks, get: cmdGet, create: cmdCreate, update: cmdUpdate,
  activate: cmdActivate, delete: cmdDelete,
};
if (!cmd || !commands[cmd]) {
  console.log('Usage: node kaching.mjs <login|status|list|verify|recon|record|api|admin-api> [--store <name>] [options]');
  process.exit(1);
}
commands[cmd](args).catch((e) => { console.error(e); process.exit(1); });
