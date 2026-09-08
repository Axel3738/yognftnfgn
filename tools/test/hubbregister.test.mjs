import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { laddaRegister, prefixAvAnnons, prefixnyckel, RegisterFel, STANDARDBUTIK } from '../hubbregister.mjs';

// ------------------------------------------------------------------ fixtur

/** Skriver ett minimalt repo och lämnar tillbaka roten (med avslutande /). */
function bygg({ butiker, hubbar = [], produkter = [], alias = null }) {
  const rot = mkdtempSync(join(tmpdir(), 'hubbreg-'));
  mkdirSync(join(rot, 'commission'));
  mkdirSync(join(rot, 'products'));
  writeFileSync(join(rot, 'commission/hubbar.json'), JSON.stringify({ butiker, hubbar }));
  writeFileSync(join(rot, 'products/products.json'), JSON.stringify({ products: produkter }));
  if (alias) writeFileSync(join(rot, 'products/prefix-alias.json'), JSON.stringify({ alias }));
  return `${rot}/`;
}

const SE = { namn: 'Bäverbutiken', marknad: 'SE', annonskonto: '1867947880635861', commission: true };
const DK = { namn: 'Bäverbutiken DK', marknad: 'DK', annonskonto: '915422744950975', commission: false };
const OPS = { namn: 'HeimGuard', marknad: 'SE', annonskonto: '915422744950975', commission: true, prefix: ['HeimGuard'] };

const standardButiker = { [STANDARDBUTIK]: SE, 'baverbutiken-dk': DK, heimguard: OPS };

const stad = [];
test.after(() => { for (const r of stad) rmSync(r, { recursive: true, force: true }); });
const nytt = (opt) => { const r = bygg(opt); stad.push(r); return r; };

// ------------------------------------------------------------------ prefix

test('prefixet läses ur annonsnamnet, aldrig ur något annat fält', () => {
  assert.equal(prefixAvAnnons('Enginecover_PD_22_H1'), 'enginecover');
  assert.equal(prefixAvAnnons('HeimGuard_TR_1_H1'), 'heimguard');
  assert.equal(prefixAvAnnons('Beachslippers_PD_2_8 – COPY ONLY: text'), 'beachslippers');
  assert.equal(prefixAvAnnons('MC-Kapell_PD_1_H1'), 'mc-kapell');
  // Grillklinikens löpnummernamn har inget prefix — de kopplas på nummer.
  assert.equal(prefixAvAnnons('235 H1'), null);
  assert.equal(prefixAvAnnons(''), null);
  assert.equal(prefixAvAnnons(null), null);
});

test('prefixnyckeln struntar i skiftläge och avslutande understreck', () => {
  assert.equal(prefixnyckel('Enginecover_'), 'enginecover');
  assert.equal(prefixnyckel('  HeimGuard  '), 'heimguard');
  assert.equal(prefixnyckel(''), null);
});

// ------------------------------------------------------------------ butiker

test('butiken slås upp på id, och en okänd butik är ett avbrott', () => {
  const reg = laddaRegister(nytt({ butiker: standardButiker }));
  assert.equal(reg.butik(STANDARDBUTIK).annonskonto, '1867947880635861');
  assert.equal(reg.kanskeButik('hittepa'), null);
  assert.throws(() => reg.butik('hittepa'), RegisterFel);
});

test('en butik utan annonskonto avvisas — kontot får aldrig bli undefined', () => {
  const rot = nytt({ butiker: { ...standardButiker, trasig: { namn: 'X', marknad: 'SE' } } });
  assert.throws(() => laddaRegister(rot), /saknar annonskonto/);
});

test('standardbutiken måste finnas, annars vet rutiner utan --butik ingenting', () => {
  const rot = nytt({ butiker: { heimguard: OPS } });
  assert.throws(() => laddaRegister(rot), /Standardbutiken/);
});

test('två butiker på samma konto redovisas som delat konto', () => {
  const reg = laddaRegister(nytt({ butiker: standardButiker }));
  const delat = reg.butikerPaKonto('915422744950975').map((b) => b.id).sort();
  assert.deepEqual(delat, ['baverbutiken-dk', 'heimguard']);
});

// ------------------------------------------------------------------ hubbar

test('hubben hittas på id och på namn, och bär sin butik', () => {
  const reg = laddaRegister(nytt({
    butiker: standardButiker,
    hubbar: [{ id: '3b0270ab-908c-80a7-8793-fa11d8c0f6e4', namn: 'Boat cover 420D creative hub', butik: STANDARDBUTIK, prefix: ['enginecover'] }],
  }));
  // Notion skriver id:t både med och utan bindestreck.
  assert.equal(reg.butikForHubb({ id: '3b0270ab908c80a78793fa11d8c0f6e4' }).id, STANDARDBUTIK);
  assert.equal(reg.butikForHubb({ namn: 'boat cover 420D CREATIVE HUB' }).id, STANDARDBUTIK);
  // En hub som inte står i registret ger null — den ska köras som standardbutiken
  // och rapporteras, aldrig gissas till en annan verksamhet.
  assert.equal(reg.butikForHubb({ namn: 'Damasker vandring' }), null);
});

test('en hub som pekar på en butik som inte finns är ett avbrott', () => {
  const rot = nytt({
    butiker: standardButiker,
    hubbar: [{ id: 'a', namn: 'Spökhubben', butik: 'finns-inte' }],
  });
  assert.throws(() => laddaRegister(rot), /finns-inte/);
});

// ------------------------------------------------------------- prefixkartan

test('butikens egna prefix binder annonsen till butiken i ett delat konto', () => {
  const reg = laddaRegister(nytt({ butiker: standardButiker }));
  assert.equal(reg.butikForAnnons('HeimGuard_TR_1_H1').id, 'heimguard');
  assert.equal(reg.butikForAnnons('HeimGuard_TR_1_H1').annonskonto, '915422744950975');
});

test('products.json creative_prefix knyts till butiken som äger kontot', () => {
  const reg = laddaRegister(nytt({
    butiker: standardButiker,
    produkter: [{ id: 'motorholjet', ad_account_id: '1867947880635861', creative_prefix: 'Enginecover_' }],
  }));
  assert.equal(reg.butikForPrefix('enginecover').id, STANDARDBUTIK);
});

test('prefix i ett DELAT konto härleds aldrig ur kontot', () => {
  // Två butiker på 915422744950975 → produkten kan inte tilldelas någon av dem
  // automatiskt. Prefixet måste stå explicit, annars förblir det okänt.
  const reg = laddaRegister(nytt({
    butiker: standardButiker,
    produkter: [{ id: 'dansk', ad_account_id: '915422744950975', creative_prefix: 'Nagot_' }],
  }));
  assert.equal(reg.butikForPrefix('nagot'), null);
});

test('prefix-alias.json tar med både nyckeln och kontots prefix', () => {
  const reg = laddaRegister(nytt({
    butiker: standardButiker,
    alias: { beltgrinder: { kampanj_id: '1', kontots_prefix: 'Balteslipmaskin' } },
  }));
  assert.equal(reg.butikForPrefix('beltgrinder').id, STANDARDBUTIK);
  assert.equal(reg.butikForPrefix('balteslipmaskin').id, STANDARDBUTIK);
});

test('samma prefix på två butiker är ett avbrott, aldrig en gissning', () => {
  const rot = nytt({
    butiker: {
      ...standardButiker,
      krock: { namn: 'Krock', marknad: 'SE', annonskonto: '999', prefix: ['HeimGuard'] },
    },
  });
  assert.throws(() => laddaRegister(rot), /pekar på två butiker/);
});

// -------------------------------------------------------- riktiga registret

test('repots eget register laddar och håller ihop', () => {
  const reg = laddaRegister();
  assert.ok(reg.butik(STANDARDBUTIK).annonskonto === '1867947880635861',
    'standardbutiken måste vara Bäverbutiken på MagiBorsten — rutiner utan --butik kör där');
  assert.equal(reg.butik('heimguard').annonskonto, '915422744950975');
  // Delat konto: OPS-butiken och Bäverbutikens danska annonser.
  assert.ok(reg.butikerPaKonto('915422744950975').length >= 2);
  // Varje hub i registret pekar på en butik som finns.
  for (const h of reg.hubbar) {
    assert.ok(h.butik, `hubben "${h.namn}" saknar butik i registret`);
    assert.ok(reg.kanskeButik(h.butik), `hubben "${h.namn}" pekar på okänd butik ${h.butik}`);
  }
  // De fyra skalningsprodukternas prefix ska höra till Bäverbutiken.
  for (const p of ['enginecover', 'trimmerbelt', 'seatcover', 'beachslippers']) {
    assert.equal(reg.butikForPrefix(p)?.id, STANDARDBUTIK, `${p} ska höra till ${STANDARDBUTIK}`);
  }
});
