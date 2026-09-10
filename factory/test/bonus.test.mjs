// Bonussteget (bonus.mjs): återanvändning av en befintlig produkt som betald
// korg-upsell (TackleBay 2026-09-10) — inget nätverk, fetch är en stubb.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sakerstallBonus, byggBonusInput } from '../bonus.mjs';

const riktigFetch = globalThis.fetch;

test('bonus utan bilder men med befintlig produkt i butiken: återanvänds, inget skapas, id:n skrivs tillbaka', async () => {
  const rot = mkdtempSync(join(tmpdir(), 'ops-bonus-'));
  const fil = join(rot, 'p.yaml');
  writeFileSync(fil, 'produkt:\n  id: "spo"\noffer:\n  bonus_produkt:\n    titel: "Kalendern"\n    handle: "kalendern"\n    pris: 469\n    i_paket: ""\n');
  const anrop = [];
  process.env.SHOPIFY_STORE_DOMAIN = 'x.myshopify.com';
  process.env.SHOPIFY_ADMIN_TOKEN = 'shpat_test';
  globalThis.fetch = async (url, init) => {
    anrop.push(JSON.parse(init.body).query);
    return {
      ok: true,
      status: 200,
      text: async () => '',
      json: async () => ({ data: { productByIdentifier: { id: 'gid://shopify/Product/9', handle: 'kalendern', title: 'Kalendern', status: 'ACTIVE', media: { nodes: [] }, variants: { nodes: [{ id: 'gid://shopify/ProductVariant/77' }] } } } }),
    };
  };
  try {
    const produkt = { produkt: { id: 'spo' }, offer: { bonus_produkt: { titel: 'Kalendern', handle: 'kalendern', pris: 469, i_paket: '' } } };
    const r = await sakerstallBonus({ produktfil: fil }, produkt, { torr: false });
    assert.equal(r.ateranvand, true);
    assert.equal(r.ny, false);
    assert.equal(r.produkt_id, '9');
    assert.equal(r.variant_id, '77');
    assert.ok(anrop.every((q) => !/productSet|productUpdate|publishablePublish/.test(q)), 'ingen skrivning mot butiken');
    assert.equal(produkt.offer.bonus_produkt.produkt_id, '9');
    assert.ok(readFileSync(fil, 'utf8').includes('produkt_id'), 'id:n skrivs tillbaka i produktfilen');
    // Torr: samma väg säger återanvänd utan nätverk.
    const torr = await sakerstallBonus({}, produkt, { torr: true });
    assert.equal(torr.ateranvand, true);
    assert.equal(anrop.length, 1);
  } finally {
    globalThis.fetch = riktigFetch;
    rmSync(rot, { recursive: true, force: true });
  }
});

test('bonus med bilder går fortfarande genom byggBonusInput (kräver titel, handle, pris, bild)', () => {
  assert.throws(() => byggBonusInput({ offer: { bonus_produkt: { titel: 'X', handle: 'x', pris: 10 } } }), /bilder är tom/);
  const input = byggBonusInput({ offer: { bonus_produkt: { titel: 'X', handle: 'x', pris: 10, bilder: ['https://a/b.jpg'] } } });
  assert.equal(input.handle, 'x');
});
