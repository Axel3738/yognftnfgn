// Tester för MCP-servern (kundtjanst/mail-mcp.mjs). Dispatchen testas utan
// stdio med en falsk brevlåda; stdio-transporten testas genom att starta den
// riktiga processen och prata JSON-RPC med den (initialize + tools/list
// kräver ingen inloggning, så inget nät behövs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { skapaServer, VERKTYG, PROTOKOLL, startaStdio } from '../mail-mcp.mjs';
import { PassThrough } from 'node:stream';

const ROT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

/** En falsk Brevlada som svarar med fasta data och räknar anropen. */
function falskBrevlada(id = 'baverbutiken') {
  const anrop = [];
  return {
    id, user: 'kundsupport@baverbutiken.se', anrop, utloggad: false,
    async mappar() { anrop.push('mappar'); return ['INBOX', 'Sent']; },
    async lista(o) { anrop.push(['lista', o]); return { mapp: o.mapp ?? 'INBOX', sida: 1, sidor: 1, totalt: 1, olasta: 0, rader: [{ uid: 3, amne: 'Order #1042', fran: 'Anna', franAdress: 'anna@gmail.com', datum: 'Today', storlek: '2 KB', last: false, flaggad: false, bilaga: false }] }; },
    async las(uid, o) { anrop.push(['las', uid, o]); if (Number(uid) !== 3) throw new Error(`Roundcube viewsource gav HTTP 404 (steg 5) för uid ${uid} i INBOX.`); return { uid: 3, mapp: 'INBOX', messageId: '<x>', fran: { namn: 'Anna', adress: 'anna@gmail.com' }, till: [{ namn: '', adress: 'kundsupport@baverbutiken.se' }], amne: 'Order #1042', datum: '2026-09-12T08:00:00.000Z', text: 'Var är paketet?', helText: 'Var är paketet?', autosvar: false, listmejl: false, ...(o.ra ? { ra: 'From: Anna\r\n\r\nVar är paketet?' } : {}) }; },
    async sok(fraga, o) { anrop.push(['sok', fraga, o]); return { mapp: 'INBOX', fraga, lasta: 1, sidorLasta: 1, sidor: 1, traffar: [], klippt: false }; },
    async loggaUt() { this.utloggad = true; },
  };
}

const ENV = { KUNDTJANST_MAIL_PASS_BAVERBUTIKEN: 'hemligt' };
const req = (id, method, params) => ({ jsonrpc: '2.0', id, method, ...(params ? { params } : {}) });

test('initialize: förhandlar protokoll, annonserar tools, ger instruktioner', async () => {
  const s = skapaServer({ env: ENV, oppna: falskBrevlada });
  const r = await s.hantera(req(1, 'initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '0' } }));
  assert.equal(r.id, 1);
  assert.equal(r.result.protocolVersion, '2024-11-05');
  assert.equal(r.result.serverInfo.name, 'loopia-mail');
  assert.ok(r.result.capabilities.tools);
  assert.match(r.result.instructions, /maskera/);
  const r2 = await s.hantera(req(2, 'initialize', { protocolVersion: '1999-01-01' }));
  assert.equal(r2.result.protocolVersion, PROTOKOLL[0], 'okänd version → vår nyaste');
  assert.equal(await s.hantera({ jsonrpc: '2.0', method: 'notifications/initialized' }), null, 'notiser besvaras inte');
  assert.deepEqual((await s.hantera(req(3, 'ping'))).result, {});
});

test('tools/list: fem läs-bara verktyg med giltiga scheman', async () => {
  const s = skapaServer({ env: ENV, oppna: falskBrevlada });
  const r = await s.hantera(req(1, 'tools/list'));
  assert.deepEqual(r.result.tools.map((t) => t.name), ['mail_brands', 'mail_folders', 'mail_list', 'mail_read', 'mail_search']);
  for (const t of VERKTYG) {
    assert.equal(t.inputSchema.type, 'object', t.name);
    assert.equal(t.annotations.readOnlyHint, true, `${t.name} ska vara läs-bart`);
    assert.equal(t.annotations.destructiveHint, false, t.name);
    assert.ok(t.description.length > 40, t.name);
  }
  assert.deepEqual(VERKTYG.find((t) => t.name === 'mail_read').inputSchema.required, ['uid']);
  assert.deepEqual(VERKTYG.find((t) => t.name === 'mail_search').inputSchema.required, ['fraga']);
});

test('tools/call: varje verktyg går till brevlådan med rätt argument och svarar med text + structuredContent', async () => {
  const b = falskBrevlada();
  const s = skapaServer({ env: ENV, oppna: () => b });
  const mappar = await s.hantera(req(1, 'tools/call', { name: 'mail_folders', arguments: {} }));
  assert.equal(mappar.result.isError, false);
  assert.match(mappar.result.content[0].text, /INBOX/);
  assert.deepEqual(mappar.result.structuredContent, { brand: 'baverbutiken', mappar: ['INBOX', 'Sent'] });

  const lista = await s.hantera(req(2, 'tools/call', { name: 'mail_list', arguments: { mapp: 'Sent', sida: 2, antal: 5 } }));
  assert.match(lista.result.content[0].text, /Order #1042/);
  assert.deepEqual(b.anrop[1], ['lista', { mapp: 'Sent', sida: 2, antal: 5 }]);

  const las = await s.hantera(req(3, 'tools/call', { name: 'mail_read', arguments: { uid: 3, ra: true } }));
  assert.match(las.result.content[0].text, /Från:  Anna <anna@gmail.com>/);
  assert.match(las.result.content[0].text, /From: Anna/, 'ra visas när den begärs');
  assert.deepEqual(b.anrop[2], ['las', 3, { mapp: undefined, ra: true, maxTecken: 0 }]);

  const sok = await s.hantera(req(4, 'tools/call', { name: 'mail_search', arguments: { fraga: 'order 1042', kropp: true, sidor: 2 } }));
  assert.match(sok.result.content[0].text, /0 träffar på "order 1042"/);
  assert.deepEqual(b.anrop[3], ['sok', 'order 1042', { mapp: undefined, maxSidor: 2, kropp: true, max: 50 }]);

  const brands = await s.hantera(req(5, 'tools/call', { name: 'mail_brands', arguments: {} }));
  const rad = brands.result.structuredContent.brands.find((x) => x.id === 'baverbutiken');
  assert.equal(rad.lasbar, true);
  assert.equal(rad.user, 'kundsupport@baverbutiken.se');
  assert.equal(JSON.stringify(brands.result).includes('hemligt'), false, 'lösenordet läcker aldrig');
  assert.match(brands.result.content[0].text, /✅ baverbutiken/);
});

test('tools/call: fel i brevlådan blir isError-resultat, okänt verktyg blir JSON-RPC-fel', async () => {
  const s = skapaServer({ env: ENV, oppna: falskBrevlada });
  const r = await s.hantera(req(1, 'tools/call', { name: 'mail_read', arguments: { uid: 99 } }));
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /HTTP 404/);
  const okand = await s.hantera(req(2, 'tools/call', { name: 'mail_delete', arguments: {} }));
  assert.equal(okand.error.code, -32602);
  const metod = await s.hantera(req(3, 'resources/list'));
  assert.equal(metod.error.code, -32601);
  const trasig = await s.hantera({ id: 4, method: 'ping' });
  assert.equal(trasig.error.code, -32600);
});

test('brevlådan saknas i miljön: verktyget svarar med variabelnamnet, inte en krasch', async () => {
  const s = skapaServer({ env: {}, oppna: falskBrevlada });
  const r = await s.hantera(req(1, 'tools/call', { name: 'mail_list', arguments: {} }));
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /KUNDTJANST_MAIL_PASS_BAVERBUTIKEN/);
  const brands = await s.hantera(req(2, 'tools/call', { name: 'mail_brands', arguments: {} }));
  assert.equal(brands.result.structuredContent.brands.find((x) => x.id === 'baverbutiken').lasbar, false);
});

test('en brevlåda per brand, återanvänd mellan anrop, utloggad vid stang()', async () => {
  const oppnade = [];
  const s = skapaServer({ env: ENV, oppna: (id) => { const b = falskBrevlada(id); oppnade.push(b); return b; } });
  await s.hantera(req(1, 'tools/call', { name: 'mail_folders', arguments: {} }));
  await s.hantera(req(2, 'tools/call', { name: 'mail_folders', arguments: { brand: 'baverbutiken' } }));
  assert.equal(oppnade.length, 1, 'utelämnat brand och samma id delar session');
  await s.stang();
  assert.equal(oppnade[0].utloggad, true);
});

test('stdio-transporten: rader in, rader ut, parallella anrop, utloggning när stdin stängs', async () => {
  const b = falskBrevlada();
  const s = skapaServer({ env: ENV, oppna: () => b });
  const in_ = new PassThrough();
  const ut = new PassThrough();
  let text = '';
  ut.on('data', (d) => { text += d; });
  const klar = startaStdio(s, { in_, ut });
  in_.write(JSON.stringify(req(1, 'initialize', { protocolVersion: '2025-06-18' })) + '\n');
  in_.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  in_.write('inte json\n');
  in_.write(JSON.stringify(req(2, 'tools/call', { name: 'mail_folders', arguments: {} })) + '\n' + JSON.stringify(req(3, 'ping')) + '\n');
  in_.end();
  await klar;
  const rader = text.trim().split('\n').map((r) => JSON.parse(r));
  assert.deepEqual(rader.map((r) => r.id).sort(), [1, 2, 3, null].sort());
  assert.equal(rader.find((r) => r.id === null).error.code, -32700);
  assert.equal(rader.find((r) => r.id === 2).result.isError, false);
  assert.equal(b.utloggad, true);
});

test('den riktiga processen: initialize + tools/list över stdio utan nät', async () => {
  const p = spawn(process.execPath, [join(ROT, 'kundtjanst', 'mail-mcp.mjs')], { cwd: ROT, env: { ...process.env, HTTPS_PROXY: '', https_proxy: '', NODE_USE_ENV_PROXY: '1' }, stdio: ['pipe', 'pipe', 'pipe'] });
  let ut = '';
  let fel = '';
  p.stdout.on('data', (d) => { ut += d; });
  p.stderr.on('data', (d) => { fel += d; });
  p.stdin.write(JSON.stringify(req(1, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } })) + '\n');
  p.stdin.write(JSON.stringify(req(2, 'tools/list')) + '\n');
  p.stdin.end();
  const kod = await new Promise((r) => p.on('close', r));
  assert.equal(kod, 0, fel);
  const rader = ut.trim().split('\n').map((r) => JSON.parse(r));
  assert.equal(rader[0].result.serverInfo.name, 'loopia-mail');
  assert.equal(rader[1].result.tools.length, 5);
  assert.match(fel, /loopia-mail 1\.0\.0: 5 verktyg/);
  assert.equal(ut.includes('·'), false, 'stdout är bara JSON-RPC');
});
