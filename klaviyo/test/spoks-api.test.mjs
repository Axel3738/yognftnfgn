// Spoks officiella API: klienten, spärrarna, CLI:n och MCP-servern mot en falsk Spoks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skapaKlient, kollaAlla, vaktaAnrop, vaktaSegment, vaktaAmnesrad, lasKonfig, skrivUt, main } from '../spoks/api.mjs';
import { skapaServer } from '../spoks/api-mcp.mjs';
import { falskSpoks, YTOR } from './falsk-spoks.mjs';

const KONFIG = lasKonfig();
const SEG_A = '11111111-1111-4111-8111-111111111111';
const SEG_B = '22222222-2222-4222-8222-222222222222';
const ENV = { SPOKS_API_KEY_CARASHELL: 'nyckel-cs', SPOKS_API_KEY_BAVERBUTIKEN: 'nyckel-bb' };
const tyst = { vanta: async () => {}, nu: () => 0 };
const klient = (butik, f, env = ENV, extra = {}) => skapaKlient(butik, { env, fetchFn: f.fetchFn, konfig: KONFIG, ...tyst, ...extra });
const patchar = (f) => f.anrop.filter((a) => a.metod === 'PATCH');

test('konfig: varje arbetsyta har egen nyckel, och id:n är Spoks egna', () => {
  const y = KONFIG.arbetsytor;
  assert.equal(y.baverbutiken.arbetsyta_id, YTOR.baverbutiken);
  assert.equal(y.carashell.arbetsyta_id, YTOR.carashell);
  const nycklar = Object.values(y).map((x) => x.nyckel);
  assert.equal(new Set(nycklar).size, nycklar.length);
  assert.equal(KONFIG.bas, 'https://api.spoks.com');
});

test('kolla utan nycklar: varje arbetsyta saknas och inget anrop görs', async () => {
  const f = falskSpoks();
  const r = await kollaAlla({ env: {}, konfig: KONFIG, fetchFn: f.fetchFn, ...tyst });
  assert.ok(r.length >= 3);
  assert.ok(r.every((x) => x.lage === 'saknas'));
  assert.equal(f.anrop.length, 0);
});

test('saknad nyckel säger var den görs, och CaraShells säger varför den saknas', async () => {
  const r = await kollaAlla({ env: {}, konfig: KONFIG, ...tyst });
  const cs = r.find((x) => x.butik === 'carashell');
  assert.match(cs.anteckning, /betald plan/);
  assert.match(skrivUt('kolla', r), /carashell \(CaraShell\): SPOKS_API_KEY_CARASHELL saknas i miljön\. .*betald plan/);
  assert.throws(() => klient('baverbutiken', falskSpoks(), {}), (e) => e.kod === 'NYCKEL_SAKNAS' && /Inställningar → Integrationer/.test(e.message));
});

test('kolla: rätt nyckel ger ok med rättigheter, fel nyckel ger fel utan att kasta', async () => {
  const f = falskSpoks();
  const r = await kollaAlla({ env: { SPOKS_API_KEY_CARASHELL: 'nyckel-cs', SPOKS_API_KEY_BAVERBUTIKEN: 'nyckel-cs' }, konfig: KONFIG, fetchFn: f.fetchFn, ...tyst });
  const cs = r.find((x) => x.butik === 'carashell');
  const bb = r.find((x) => x.butik === 'baverbutiken');
  assert.equal(cs.lage, 'ok');
  assert.equal(cs.rattigheter.posts, 'read-write');
  assert.equal(bb.lage, 'fel');
  assert.equal(bb.kod, 'FEL_ARBETSYTA');
});

test('en nyckel till fel arbetsyta stoppas före första riktiga anropet', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1', feed: YTOR.baverbutiken }] });
  const k = klient('carashell', f, { SPOKS_API_KEY_CARASHELL: 'nyckel-bb' });
  await assert.rejects(k.kampanjer(), (e) => e.kod === 'FEL_ARBETSYTA' && /Bäverbutiken/.test(e.message));
  assert.deepEqual(f.anrop.map((a) => a.sokvag), ['/authorization']);
});

test('arbetsyta utan id i konfig: stoppar och säger vilken arbetsyta nyckeln hör till', async () => {
  const f = falskSpoks({ nycklar: { 'nyckel-no': { feed: { id: 'no-yta-123', name: 'Beverbutikken' }, permissions: {} } } });
  const k = skapaKlient('beverbutikken', { env: { SPOKS_API_KEY_BEVERBUTIKKEN: 'nyckel-no' }, konfig: KONFIG, fetchFn: f.fetchFn, ...tyst });
  await assert.rejects(k.kampanjer(), (e) => e.kod === 'ID_SAKNAS' && /no-yta-123/.test(e.message));
});

test('saknad nyckel: felet namnger variabeln', () => {
  assert.throws(() => skapaKlient('matstrumpor', { env: {}, konfig: KONFIG }), /SPOKS_API_KEY_MATSTRUMPOR/);
  assert.throws(() => skapaKlient('okand', { env: ENV, konfig: KONFIG }), /Okänd butik/);
});

test('varje anrop bär nyckeln och den låsta versionen, och går bara till api.spoks.com', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1' }] });
  await klient('carashell', f).kampanj('k1');
  for (const a of f.anrop) {
    assert.equal(a.host, 'api.spoks.com');
    assert.equal(a.headers['x-api-key'], 'nyckel-cs');
    assert.equal(a.headers['X-Api-Version'], '2026-07');
  }
});

test('kampanjer: utkasten nyast först, publiceringstiden i svensk tid', async () => {
  const f = falskSpoks({ kampanjer: [
    { id: 'k1', title: 'Äldre', status: 'draft', created: '2026-09-01T10:00:00.000Z' },
    { id: 'k2', title: 'Nyare', status: 'draft', created: '2026-09-20T10:00:00.000Z' },
    { id: 'k3', title: 'Skickad', status: 'published', publishDate: '2026-09-29T16:00:00.000Z', created: '2026-09-10T10:00:00.000Z' },
    { id: 'k4', title: 'Annan butik', status: 'draft', feed: YTOR.baverbutiken },
  ] });
  const k = klient('carashell', f);
  const utkast = await k.kampanjer({ status: 'draft' });
  assert.deepEqual(utkast.kampanjer.map((x) => x.id), ['k2', 'k1']);
  const alla = await k.kampanjer();
  assert.equal(alla.kampanjer.find((x) => x.id === 'k3').publicerasSv, '2026-09-29 18:00');
  assert.ok(!alla.kampanjer.some((x) => x.id === 'k4'));
});

test('kampanjer: tar Spoks inte $filter filtreras det här i stället', async () => {
  const f = falskSpoks({ filterStods: false, kampanjer: [
    { id: 'k1', status: 'draft' }, { id: 'k2', status: 'scheduled' },
  ] });
  const r = await klient('carashell', f).kampanjer({ status: 'scheduled' });
  assert.deepEqual(r.kampanjer.map((x) => x.id), ['k2']);
  assert.equal(r.totalt, null);
});

test('publik torrt: visar före och efter men skickar ingen PATCH', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1', title: 'K01' }] });
  const r = await klient('carashell', f).sattPublik('k1', [SEG_A], { torr: true });
  assert.equal(r.torr, true);
  assert.deepEqual(r.efter, [SEG_A]);
  assert.equal(patchar(f).length, 0);
});

test('publik: PATCH med If-Match, sedan tillbakaläst', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1', title: 'K01', recipients: { segmentIds: [SEG_A] } }] });
  const hashFore = f.tillstand.kampanjer.get('k1').hash;
  const r = await klient('carashell', f).sattPublik('k1', [SEG_B, SEG_A, SEG_B]);
  assert.equal(r.andrat, true);
  const [p] = patchar(f);
  assert.equal(p.headers['If-Match'], hashFore);
  assert.deepEqual(p.kropp, { recipients: { segmentIds: [SEG_A, SEG_B] } });
  assert.deepEqual([...f.tillstand.kampanjer.get('k1').recipients.segmentIds].sort(), [SEG_A, SEG_B]);
  assert.equal(f.anrop.at(-1).metod, 'GET');
});

test('publik som redan stämmer: ingen PATCH', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1', recipients: { segmentIds: [SEG_A] } }] });
  const r = await klient('carashell', f).sattPublik('k1', [SEG_A]);
  assert.equal(r.redanRatt, true);
  assert.equal(patchar(f).length, 0);
});

test('publik på en schemalagd kampanj vägras innan något skrivs', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1', status: 'scheduled' }] });
  await assert.rejects(klient('carashell', f).sattPublik('k1', [SEG_A]), (e) => e.kod === 'INTE_UTKAST');
  assert.equal(patchar(f).length, 0);
});

test('publik: ett segmentnamn i stället för id vägras utan ett enda anrop', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1' }] });
  await assert.rejects(klient('carashell', f).sattPublik('k1', ['SEG_samtycke_sv']), /Inte ett segment-id/);
  await assert.rejects(klient('carashell', f).sattPublik('k1', []), /tom: true/);
  assert.equal(f.anrop.length, 0);
});

test('412: någon sparade i appen emellan — inget skrivs och inget görs om', async () => {
  const f = falskSpoks({ bytHashForePatch: true, kampanjer: [{ id: 'k1' }] });
  await assert.rejects(klient('carashell', f).sattPublik('k1', [SEG_A]), (e) => e.status === 412 && /If-Match/.test(e.message));
  assert.equal(patchar(f).length, 1);
  assert.deepEqual(f.tillstand.kampanjer.get('k1').recipients.segmentIds, []);
});

test('429 väntar ut Retry-After och går sedan igenom', async () => {
  const vantat = [];
  const f = falskSpoks({ rateLimit: 1, retryAfter: '3', kampanjer: [{ id: 'k1' }] });
  const k = klient('carashell', f, ENV, { vanta: async (ms) => { vantat.push(ms); } });
  await k.kampanj('k1');
  assert.ok(vantat.includes(3000));
});

test('takten: ingen förfrågan tätare än 1,1 s', async () => {
  const vantat = [];
  let klocka = 0;
  const f = falskSpoks({ kampanjer: [{ id: 'k1' }] });
  const k = klient('carashell', f, ENV, { nu: () => klocka, vanta: async (ms) => { vantat.push(ms); klocka += ms; } });
  await k.kampanj('k1');
  await k.kampanj('k1');
  assert.equal(f.anrop.length, 3);
  assert.deepEqual(vantat, [1100, 1100]);
});

test('5xx: en läsning görs om, en skrivning aldrig', async () => {
  const las = falskSpoks({ serverfel: 1, kampanjer: [{ id: 'k1' }] });
  await klient('carashell', las).kampanj('k1');
  assert.equal(las.anrop.filter((a) => a.sokvag === '/authorization').length, 2);

  const skriv = falskSpoks({ serverfel: 1, serverfelMetod: 'PATCH', kampanjer: [{ id: 'k1' }] });
  await assert.rejects(klient('carashell', skriv).sattPublik('k1', [SEG_A]), (e) => e.status === 503);
  assert.equal(patchar(skriv).length, 1);
});

test('vitlistan: läsning fritt, skrivning bara utkast och avregistrering', () => {
  const utkast = { status: 'draft', blocks: [{ type: 'regular', text: 'x' }] };
  const medProdukt = { status: 'draft', blocks: [{ type: 'unsupported', originalType: 'products' }] };
  const fall = [
    [{ metod: 'GET', sokvag: '/campaigns' }, true],
    [{ metod: 'GET', sokvag: '/collections' }, true],
    [{ metod: 'POST', sokvag: '/contacts-search', data: { limit: 1, offset: 0 } }, true],
    [{ metod: 'POST', sokvag: '/products-search', data: { limit: 1, offset: 0 } }, true],
    [{ metod: 'POST', sokvag: '/campaigns', data: { deliveryChannel: 'email', title: 'x' } }, true],
    [{ metod: 'PATCH', sokvag: '/campaigns/k1', data: { recipients: { segmentIds: [] } }, nuvarande: utkast }, true],
    [{ metod: 'PATCH', sokvag: '/campaigns/k1', data: { blocks: [] }, nuvarande: utkast }, true],
    [{ metod: 'PATCH', sokvag: '/campaigns/k1', data: { title: 'x' }, nuvarande: { status: 'scheduled' } }, false],
    [{ metod: 'PATCH', sokvag: '/campaigns/k1', data: { title: 'x' }, nuvarande: { status: 'published' } }, false],
    [{ metod: 'PATCH', sokvag: '/campaigns/k1', data: { blocks: [] }, nuvarande: medProdukt }, false],
    [{ metod: 'PATCH', sokvag: '/campaigns/k1', data: { text: 'ny text' }, nuvarande: medProdukt }, false],
    [{ metod: 'PATCH', sokvag: '/campaigns/k1', data: { title: 'ny' }, nuvarande: medProdukt }, true],
    [{ metod: 'PATCH', sokvag: '/campaigns/k1', data: { title: 'x' } }, false],
    [{ metod: 'PATCH', sokvag: '/contacts/c1/notification-settings', data: { email: false } }, true],
    [{ metod: 'PATCH', sokvag: '/contacts/c1/notification-settings', data: { email: false, sms: false } }, true],
    [{ metod: 'PATCH', sokvag: '/contacts/c1/notification-settings', data: { email: true } }, false],
    [{ metod: 'PATCH', sokvag: '/contacts/c1/notification-settings', data: { email: false, sms: true } }, false],
    [{ metod: 'PATCH', sokvag: '/contacts/c1/notification-settings', data: {} }, false],
    [{ metod: 'PATCH', sokvag: '/contacts/c1/tags', data: { tagsToAdd: ['x'] } }, false],
    [{ metod: 'POST', sokvag: '/contacts', data: { email: 'a@b.se' } }, false],
    [{ metod: 'POST', sokvag: '/products', data: {} }, false],
    [{ metod: 'POST', sokvag: '/collections', data: {} }, false],
    [{ metod: 'DELETE', sokvag: '/campaigns/k1' }, false],
    [{ metod: 'GET', sokvag: '//evil.example/x' }, false],
    [{ metod: 'GET', sokvag: 'https://evil.example/x' }, false],
    [{ metod: 'GET', sokvag: '/campaigns/../authorization' }, false],
  ];
  for (const [arg, ok] of fall) assert.equal(vaktaAnrop(arg).ok, ok, JSON.stringify(arg));
  assert.match(vaktaAnrop({ metod: 'PATCH', sokvag: '/contacts/c1/notification-settings', data: { email: true } }).skal, /MFL 19 §/);
  assert.match(vaktaAnrop({ metod: 'PATCH', sokvag: '/contacts/c1/tags', data: {} }).skal, /flöde/);
});

test('fritt anrop: nya block på ett utkast med produktkort stoppas innan något skrivs', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1', blocks: [{ type: 'unsupported', originalType: 'products' }] }] });
  await assert.rejects(klient('carashell', f).fritt('PATCH', '/campaigns/k1', { data: { blocks: [{ type: 'regular', text: 'x' }] } }), (e) => e.kod === 'SPARRAT' && /products/.test(e.message));
  assert.equal(patchar(f).length, 0);
});

test('fritt anrop: en skrivning torrt skickas inte, en läsning skickas alltid', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1' }] });
  const k = klient('carashell', f);
  const t = await k.fritt('PATCH', '/campaigns/k1', { data: { title: 'Ny' }, torr: true });
  assert.equal(t.torr, true);
  assert.equal(patchar(f).length, 0);
  const l = await k.fritt('GET', '/campaigns', { torr: true });
  assert.equal(l.torr, false);
  assert.equal(l.status, 200);
  await assert.rejects(k.fritt('DELETE', '/campaigns/k1'), /GET, POST eller PATCH/);
});

test('ämnesraden: 45 tecken går, 46 och radbrytningar vägras', () => {
  assert.deepEqual(vaktaAmnesrad({ amne: 'a'.repeat(45) }), { emailTitle: 'a'.repeat(45) });
  assert.throws(() => vaktaAmnesrad({ amne: 'a'.repeat(46) }), /46 tecken/);
  assert.throws(() => vaktaAmnesrad({ amne: 'rad\nrad' }), /radbrytningar/);
  assert.throws(() => vaktaAmnesrad({ forhand: 'b'.repeat(131) }), /131 tecken/);
  assert.throws(() => vaktaAmnesrad({}), /Ange/);
  assert.deepEqual(vaktaSegment(`${SEG_A}, ${SEG_B}`), [SEG_A, SEG_B]);
});

test('ämnesrad skarpt: bara det angivna fältet skickas och läses tillbaka', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1', title: 'K01', notification: { emailTitle: 'Gammal', emailDescription: 'Kvar' } }] });
  const r = await klient('carashell', f).sattAmnesrad('k1', { amne: 'Ny ämnesrad' });
  assert.equal(r.andrat, true);
  assert.deepEqual(patchar(f)[0].kropp, { notification: { emailTitle: 'Ny ämnesrad' } });
  assert.deepEqual(r.efter, { emailTitle: 'Ny ämnesrad', emailDescription: 'Kvar' });
});

test('kontakter: en adress ger bara sig själv, inte alla som innehåller den', async () => {
  const f = falskSpoks({ kontakter: [
    { id: 'c1', email: 'Anna@exempel.se', feed: YTOR.carashell },
    { id: 'c2', email: 'xanna@exempel.se', feed: YTOR.carashell },
    { id: 'c3', email: 'anna@exempel.se', feed: YTOR.baverbutiken },
  ] });
  const r = await klient('carashell', f).kontakter({ epost: 'anna@exempel.se' });
  assert.deepEqual(r.kontakter.map((x) => x.id), ['c1']);
});

test('CLI: utan --ja skrivs ingenting, med --ja sparas publiken', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1', title: 'K01' }] });
  const opts = { env: ENV, fetchFn: f.fetchFn, konfig: KONFIG, logg: () => {}, ...tyst };
  const rader = [];
  assert.equal(await main(['publik', 'k1', '--butik', 'carashell', '--segment', SEG_A], { ut: (s) => rader.push(s), ...opts }), 0);
  assert.match(rader.join('\n'), /Torrt/);
  assert.equal(patchar(f).length, 0);
  assert.equal(await main(['publik', 'k1', '--butik', 'carashell', '--segment', SEG_A, '--ja'], { ut: (s) => rader.push(s), ...opts }), 0);
  assert.match(rader.at(-1), /sparad och tillbakaläst/);
  assert.equal(patchar(f).length, 1);
  await assert.rejects(main(['kampanjer'], { ut: () => {}, ...opts }), /--butik krävs/);
});

test('MCP: initialize, tools/list, ett anrop och ett fel som modellen ser', async () => {
  const f = falskSpoks({ kampanjer: [{ id: 'k1', title: 'K01', status: 'draft' }] });
  const s = skapaServer({ env: { SPOKS_API_KEY_CARASHELL: 'nyckel-cs' }, konfig: KONFIG, klientOpts: { fetchFn: f.fetchFn, ...tyst } });
  const init = await s.hantera({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } });
  assert.equal(init.result.serverInfo.name, 'spoks-api');
  assert.match(init.result.instructions, /schemalägga/);
  const lista = await s.hantera({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  const namn = lista.result.tools.map((t) => t.name);
  for (const n of ['spoks_kolla', 'spoks_kampanjer', 'spoks_kampanj', 'spoks_publik', 'spoks_amnesrad', 'spoks_kontakter', 'spoks_produkter', 'spoks_taggar', 'spoks_anrop']) assert.ok(namn.includes(n), n);
  const ok = await s.hantera({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'spoks_kampanjer', arguments: { butik: 'carashell' } } });
  assert.equal(ok.result.isError, false);
  assert.match(ok.result.content[0].text, /K01/);
  const fel = await s.hantera({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'spoks_kampanjer', arguments: { butik: 'baverbutiken' } } });
  assert.equal(fel.result.isError, true);
  assert.match(fel.result.content[0].text, /SPOKS_API_KEY_BAVERBUTIKEN/);
  assert.equal(await s.hantera({ jsonrpc: '2.0', method: 'notifications/initialized' }), null);
  const okant = await s.hantera({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'spoks_skicka', arguments: {} } });
  assert.equal(okant.error.code, -32602);
});
