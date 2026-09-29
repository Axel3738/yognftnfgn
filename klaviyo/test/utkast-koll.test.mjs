import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { byggPostData, jamfor, lasLogg } from '../spoks/utkast-koll.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'utkast-koll-'));

const payload = {
  emailTitle: 'Blöta strumpor? 30 % till fredag',
  emailDescription: 'Koden DAMASK30 gäller till och med fredag.',
  blocks: [
    { type: 'h1', text: 'Blöta strumpor', alignment: 'center' },
    { type: 'regular', text: 'Syns i terrängen om du väljer gul.', alignment: 'left' },
    { type: 'products', selectionMode: 'manual', products: [{ id: 'a', button: 'Se damaskerna' }, { id: 'b', button: 'Se produkten' }], productsPerRow: 2 },
    { type: 'divider' },
    { type: 'h1', text: 'DAMASK30', alignment: 'center' },
    { type: 'divider' },
    { type: 'list', text: 'Kroka fast i snörningen.' },
    { type: 'link', text: 'Hämta 30 % med DAMASK30', url: 'https://example.se/discount/DAMASK30', style: 'button' },
  ],
};

function planOchPayload() {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'payload'));
  fs.writeFileSync(path.join(dir, 'payload', 'k07-damasker.json'), JSON.stringify(payload));
  const plan = { kampanjer: [{ id: 'k07-damasker', planerad: '2026-10-20T18:00:00+02:00', segment: ['Warmup tier 2'], mejl: 'k07-damasker' }] };
  return { plan, payloadMapp: path.join(dir, 'payload') };
}

// Så ser Spoks svar ut: id på varje block, produktdata ifylld utan knapptext, korten omkastade,
// vänsterjustering där payloaden utelämnar den.
const spoksSvar = (pd) => ({
  id: 'post-1', status: 'draft', title: pd.title, customizedNotification: { ...pd.customizedNotification, smsFullPostText: null },
  blocks: pd.blocks.map((b, i) => {
    if (b.type === 'products') return { id: `b${i}`, type: 'products', products: [...b.products].reverse().map((p) => ({ id: p.id, title: 'x', price: 1 })), productsPerRow: b.productsPerRow };
    if (b.type === 'link') return { id: `b${i}`, ...b, urlRedirect: 'https://link.example/r/1' };
    return { id: `b${i}`, alignment: b.type === 'divider' ? undefined : 'left', ...b };
  }),
});

test('utkast-koll: titeln byggs som vid uppladdningen (dag, tid, publik, ämnesrad)', () => {
  const { plan, payloadMapp } = planOchPayload();
  const pd = byggPostData(plan, payloadMapp, 'k07');
  assert.equal(pd.title, 'K07 · tis 20/10 18:00 · till: Warmup tier 2 · Blöta strumpor? 30 % till fredag');
  assert.equal(pd.customizedNotification.emailDescription, payload.emailDescription);
});

test('utkast-koll: ett utkast som är exakt payloaden godkänns trots Spoks ifyllda fält', () => {
  const { plan, payloadMapp } = planOchPayload();
  const pd = byggPostData(plan, payloadMapp, 'k07');
  const { brister, varning } = jamfor(spoksSvar(pd), pd, pd);
  assert.deepEqual(brister, []);
  assert.equal(varning, null);
});

test('utkast-koll: en tappad bokstav, ett saknat block och fel knapptext fångas', () => {
  const { plan, payloadMapp } = planOchPayload();
  const pd = byggPostData(plan, payloadMapp, 'k07');
  const svar = spoksSvar(pd);
  svar.blocks[1].text = 'Syns i terängen om du väljer gul.';
  assert.match(jamfor(svar, pd, pd).brister.join('\n'), /block 1:.*terängen/);

  const utanKodruta = spoksSvar({ ...pd, blocks: pd.blocks.filter((b) => b.type !== 'divider') });
  assert.match(jamfor(utanKodruta, pd, pd).brister.join('\n'), /6 block i Spoks, 8 i payloaden/);

  const skickat = { ...pd, blocks: pd.blocks.map((b) => (b.type === 'products' ? { ...b, products: [{ id: 'a', button: 'Se damaskerna!' }, b.products[1]] } : b)) };
  assert.match(jamfor(spoksSvar(pd), pd, skickat).brister.join('\n'), /knapptexter/);

  const { brister, varning } = jamfor(spoksSvar(pd), pd, undefined);
  assert.deepEqual(brister, []);
  assert.match(varning, /okontrollerade/);
});

test('utkast-koll: loggen ger senaste Spoks-svaret per utkast och det som skickades', () => {
  const { plan, payloadMapp } = planOchPayload();
  const pd = byggPostData(plan, payloadMapp, 'k07');
  const fel = { ...spoksSvar(pd), blocks: spoksSvar(pd).blocks.map((b, i) => (i === 1 ? { ...b, text: 'Syns i terängen om du väljer gul.' } : b)) };
  const rader = [
    { message: { content: [{ type: 'tool_use', id: 't1', name: 'mcp__Spoks__update_draft_campaign', input: { postId: 'post-1', postData: pd } }] } },
    { message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: [{ type: 'text', text: JSON.stringify({ postId: 'post-1', campaign: fel }) }] }] } },
    { message: { content: [{ type: 'tool_use', id: 't2', name: 'mcp__Spoks__update_draft_campaign_blocks', input: { postId: 'post-1', blocks: [] } }] } },
    { message: { content: [{ type: 'tool_result', tool_use_id: 't2', content: JSON.stringify({ postId: 'post-1', campaign: spoksSvar(pd) }) }] } },
    { message: { content: [{ type: 'tool_use', id: 't3', name: 'mcp__Annat__verktyg', input: {} }] } },
    { message: { content: [{ type: 'tool_result', tool_use_id: 't3', content: '{"campaign":{"id":"post-2","blocks":[]}}' }] } },
    'inte json',
  ];
  const fil = path.join(tmp(), 'logg.jsonl');
  fs.writeFileSync(fil, rader.map((r) => (typeof r === 'string' ? r : JSON.stringify(r))).join('\n'));
  const { senast, skickat } = lasLogg(fil);
  assert.equal(senast.size, 1);
  assert.deepEqual(jamfor(senast.get('post-1').kamp, pd, skickat.get('post-1')).brister, []);
  assert.equal(skickat.get('post-1').title, pd.title);
});
