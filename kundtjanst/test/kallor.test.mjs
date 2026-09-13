// Tester för Shopify-, Notion- och LLM-hjälparna (bara de rena delarna) och rapporten.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normaliseraOrder, normaliseraTvist, nastaSida, kopplaOrdrar, granskaAdminToken, ShopifyLasare } from '../shopify.mjs';
import { sopTackning, tillBlock, hamtaSopTitlar, typAv } from '../notion.mjs';
import { plockaJson } from '../llm.mjs';
import { isoVecka, renderaEngelsk, renderaSvensk, kapaForDiscord, DISCORD_MAX, renderaRanking, renderaRankingEngelsk } from '../rapport.mjs';
import { NIVAER } from '../chargeback.mjs';

test('Shopify-ordern plattas ut: spårning, återbetalning, avbruten', () => {
  const o = normaliseraOrder({ id: 1, name: '#1042', order_number: 1042, email: 'A@B.se', created_at: '2026-09-02T10:00:00+02:00', financial_status: 'paid', fulfillment_status: 'fulfilled', fulfillments: [{ status: 'success', tracking_numbers: ['PN1'], shipment_status: 'in_transit' }], refunds: [], cancelled_at: null, total_price: '599.00', currency: 'SEK', tags: 'a, b' });
  assert.equal(o.nummer, '1042');
  assert.equal(o.email, 'a@b.se');
  assert.equal(o.sparning, true);
  assert.equal(o.leveransstatus, 'in_transit');
  assert.equal(o.aterbetald, false);
  assert.deepEqual(o.taggar, ['a', 'b']);
  const utan = normaliseraOrder({ id: 2, name: '#1', fulfillments: [{ status: 'cancelled', tracking_numbers: ['X'] }], refunds: [{ id: 9 }], cancelled_at: '2026-09-01' });
  assert.equal(utan.sparning, false, 'avbruten fulfillment räknas inte');
  assert.equal(utan.aterbetald, true);
  assert.equal(utan.avbruten, true);
});

test('tvisten kopplas till ordern och Link-headern ger nästa sida', () => {
  const ordrar = [normaliseraOrder({ id: 7, name: '#1031', order_number: 1031 })];
  const t = normaliseraTvist({ id: 1, order_id: 7, type: 'chargeback', reason: 'product_not_received', status: 'needs_response', amount: '899.00', currency: 'SEK', initiated_at: '2026-09-11T00:00:00Z', evidence_due_by: '2026-09-20T00:00:00Z' }, ordrar);
  assert.equal(t.ordernamn, '#1031');
  assert.equal(t.evidensSenast, '2026-09-20');
  assert.equal(nastaSida('<https://x.myshopify.com/admin/api/2025-07/orders.json?page_info=abc>; rel="next"'), 'https://x.myshopify.com/admin/api/2025-07/orders.json?page_info=abc');
  assert.equal(nastaSida('<https://x/prev>; rel="previous"'), null);
  assert.equal(nastaSida(null), null);
});

test('token-formen känns igen: shpat_ är rätt, API key, secret och CLI-token pekas ut', () => {
  // Påhittade värden utan hex-svans — GitHubs push-skydd stoppar allt som ser ut som en riktig shpat_-token.
  assert.equal(granskaAdminToken('shpat_TESTVARDE'), null);
  assert.match(granskaAdminToken('0123456789abcdef0123456789abcdef'), /API key/);
  assert.match(granskaAdminToken('shpss_TESTVARDE'), /API secret key/);
  assert.match(granskaAdminToken('atkn_abc'), /CLI-/);
  assert.match(granskaAdminToken(' shpat_abc\n'), /mellanslag eller radbrytning/);
  assert.match(granskaAdminToken('hejsan'), /börjar inte med shpat_/);
  assert.equal(granskaAdminToken(''), 'tom');
});

test('401 med admin-token ger ett fel som säger vad som är fel med värdet', async () => {
  const svar401 = { ok: false, status: 401, headers: new Map(), text: async () => '{"errors":"[API] Invalid API key or access token"}' };
  const fel = new ShopifyLasare({ shop: 'x.myshopify.com', adminToken: '0123456789abcdef0123456789abcdef', fetchFn: async () => svar401 });
  await assert.rejects(() => fel.hamtaOrdrar(new Date()), (e) => e.status === 401 && /avvisade token \(401\)\. Värdet är en "API key"/.test(e.message) && /Admin API access token/.test(e.message));
  const ratt = new ShopifyLasare({ shop: 'x.myshopify.com', adminToken: 'shpat_abc', fetchFn: async () => svar401 });
  await assert.rejects(() => ratt.hamtaOrdrar(new Date()), /rätt form \(shpat_…\), så det är fel butik eller så är appen inte installerad/);
  const tv = await ratt.hamtaTvister(new Date());
  assert.equal(tv.tillganglig, false);
  assert.match(tv.orsak, /avvisade token \(401\)/);
});

test('ärenden kopplas till ordrar på nummer först, sen på mejladress', () => {
  const ordrar = [normaliseraOrder({ id: 1, name: '#1042', order_number: 1042, email: 'anna@x.se' }), normaliseraOrder({ id: 2, name: '#1050', order_number: 1050, email: 'karin@x.se' })];
  const [a, b, c] = kopplaOrdrar([
    { kund: { adress: 'nagon@annan.se' }, ordernummer: ['1042'] },
    { kund: { adress: 'karin@x.se' }, ordernummer: [] },
    { kund: { adress: 'okand@x.se' }, ordernummer: ['9999'] },
  ], ordrar);
  assert.equal(a.ordrar[0].namn, '#1042');
  assert.equal(b.ordrar[0].namn, '#1050');
  assert.deepEqual(c.ordrar, []);
});

test('SOP-täckningen matchar titlar mot kategoriorden', () => {
  const t = sopTackning(['SOP – Where is my order (tracking reply)', 'SOP – Returns & refunds', 'Guideline – tone'], ['var_ar_ordern', 'retur_angerratt', 'aterbetalning', 'ej_levererad', 'spam', 'ovrigt']);
  assert.deepEqual(t.tackta.map((x) => x.id), ['var_ar_ordern', 'retur_angerratt', 'aterbetalning']);
  assert.deepEqual(t.saknas, ['ej_levererad']);
});

test('i en creative hub räknas bara Typ SOP/Guideline som SOP; en ren SOP-databas räknar alla rader', async () => {
  const rad = (namn, typ) => ({ properties: { Namn: { type: 'title', title: [{ plain_text: namn }] }, ...(typ === undefined ? {} : { Typ: { type: 'select', select: typ === null ? null : { name: typ } } }) } });
  const hubb = { results: [rad('Enginecover_PD_22_H1', 'Video - Pending Approval'), rad('SOP – Refunds and returns', 'SOP'), rad('Persona & Angles', 'Guideline'), rad('Utan typ', null)], has_more: false };
  const fetchFn = async () => ({ ok: true, status: 200, json: async () => hubb });
  assert.deepEqual(await hamtaSopTitlar('db', { fetchFn, token: 't' }), ['SOP – Refunds and returns', 'Persona & Angles']);
  const ren = { results: [rad('Where is my order (tracking reply)'), rad('Returns & refunds')], has_more: false };
  assert.deepEqual(await hamtaSopTitlar('db', { fetchFn: async () => ({ ok: true, status: 200, json: async () => ren }), token: 't' }), ['Where is my order (tracking reply)', 'Returns & refunds']);
  assert.equal(typAv(rad('x')), null);
  assert.equal(typAv(rad('x', 'SOP')), 'SOP');
  assert.equal(typAv({ properties: { Typ: { type: 'multi_select', multi_select: [{ name: 'SOP' }, { name: 'VA' }] } } }), 'SOP / VA');
});

test('rapporttext blir Notion-block: rubriker, punkter, stycken, max 100', () => {
  const b = tillBlock('# Rubrik\n• punkt ett\n1. punkt två\nett stycke\n\n');
  assert.deepEqual(b.map((x) => x.type), ['heading_1', 'bulleted_list_item', 'bulleted_list_item', 'paragraph']);
  assert.equal(b[0].heading_1.rich_text[0].text.content, 'Rubrik');
  assert.equal(tillBlock(Array.from({ length: 150 }, (_, i) => `rad ${i}`).join('\n')).length, 100);
});

test('JSON plockas ur ett modellsvar med text runt', () => {
  assert.deepEqual(plockaJson('Here you go:\n[{"i":0,"kategori":"retur_angerratt"}]\nDone.'), [{ i: 0, kategori: 'retur_angerratt' }]);
  assert.deepEqual(plockaJson('{"a": "b"}'), { a: 'b' });
  assert.equal(plockaJson('inget json'), null);
});

test('ISO-veckan räknas rätt över årsskiftet', () => {
  assert.equal(isoVecka(new Date('2026-09-14T12:00:00Z')), '2026-W38');
  assert.equal(isoVecka(new Date('2026-01-01T12:00:00Z')), '2026-W01');
  assert.equal(isoVecka(new Date('2027-01-03T12:00:00Z')), '2026-W53');
});

function resultat(extra = {}) {
  return {
    brand: { id: 'demo', brand: 'Demobutiken', trosklar: { obesvarad_timmar: 48, ordrar_dagar: 30 } },
    vecka: '2026-W38', kord: new Date('2026-09-14T12:00:00Z'), period: { fran: new Date('2026-09-07T12:00:00Z'), till: new Date('2026-09-14T12:00:00Z') },
    kallor: ['fixtur'], varningar: [],
    sammanfattning: { antalArenden: 9, obesvarade: 6, larmObesvarade: 4, medianSvarstidTimmar: 3.75, topp: [{ id: 'ej_levererad', antal: 2, obesvarade: 2, exempel: ['Pakken har ikke kommet'] }] },
    risk: { poang: 72, niva: NIVAER[2], tvistgrad: 8.33, signaler: [{ id: 'hot', sv: 'Hot', en: 'Threats', varde: 1, poang: 12, detaljer: ['ja***@outlook.com (#1031)'] }], atgarder: [{ signal: 'hot', poang: 12, en: 'Reply within 24h.' }] },
    ordrar: { antal: 12 }, tvister: { tillganglig: true, lista: [{}] }, sop: { antalSop: 4, tackta: [], saknas: ['ej_levererad'] }, aterkommande: [], forra: null, historikVeckor: 1, sammanfattningar: {},
    ...extra,
  };
}

test('den engelska rapporten bär siffror, toppärenden, varningar och ACTION-sektionen', () => {
  const t = renderaEngelsk(resultat(), { kort: true, pingId: '42' });
  assert.match(t, /Demobutiken customer service — week 2026-W38/);
  assert.match(t, /Tickets: 9/);
  assert.match(t, /Chargeback risk: 🔴 High \(72\/100\)/);
  assert.match(t, /1\. Never delivered: 2 \(2 unanswered\)/);
  assert.match(t, /SOP missing in Notion for:\*\* Never delivered/);
  assert.match(t, /🔴 ACTION NEEDED <@42>/);
  assert.match(t, /1\. Reply within 24h\./);
  assert.ok(t.length <= DISCORD_MAX);
});

test('den svenska rapporten har Axels uppgifter sist och säger när historiken är för kort', () => {
  const t = renderaSvensk(resultat());
  assert.match(t, /# Kundtjänst Demobutiken — vecka 2026-W38/);
  assert.match(t, /\*\*Chargeback-risk\*\* \| \*\*🔴 Hög \(72\/100\)\*\*/);
  assert.match(t, /## Det här ska VA:n göra/);
  assert.match(t, /## Det här är Axels/);
  assert.match(t, /tre veckors körningar \(1 hittills\)/);
  assert.match(t, /Be VA:n skriva en SOP för \*\*Aldrig levererad\*\*/);
});

test('Discord-kapningen kortar listorna men aldrig ACTION-sektionen', () => {
  const rader = [...Array.from({ length: 300 }, (_, i) => `• rad ${i} med lite text i sig`), '**🔴 ACTION NEEDED**', '1. gör detta', '2. och detta'];
  const t = kapaForDiscord(rader);
  assert.ok(t.length <= DISCORD_MAX);
  assert.match(t, /… \(cut — see full report\)/);
  assert.match(t, /\*\*🔴 ACTION NEEDED\*\*\n1\. gör detta\n2\. och detta$/);
});

test('rankingen renderas på båda språken med hoppade brands markerade', () => {
  const rankade = [{ plats: 1, ...resultat() }, { plats: null, hoppad: true, orsak: 'inget lösenord', brand: { brand: 'Tyst AB' } }];
  const sv = renderaRanking(rankade, '2026-W38');
  assert.match(sv, /\| 1 \| Demobutiken \| 🔴 Hög \(72\/100\) \| 9 \| 4 \| 1 \| 8,33 % \| Aldrig levererad \(2\) \|/);
  assert.match(sv, /\| — \| Tyst AB \| hoppad: inget lösenord/);
  const en = renderaRankingEngelsk(rankade, '2026-W38');
  assert.match(en, /1\. 🔴 \*\*Demobutiken\*\* 72\/100 · 9 tickets/);
  assert.match(en, /Tyst AB: skipped/);
});
