// Tester för worldwide/ — ren logik, inget nät.
//   node --test worldwide/test/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PATCHAR, patchaFil, MARKOR } from '../tema/patch.mjs';
import { fraktplan, saknadeScopes, vardeKarta, produktKarta, KONFIG } from '../bygg.mjs';
import { granskaProdukt, siffror } from '../oversattning/granska.mjs';
import { wwNamn, geoFor, farAktiveras, kampanjNamn } from '../annonser/bygg.mjs';
import { narmasteFormat, prompt } from '../annonser/bilder.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIG = join(ROT, 'tema', 'original', '210420334941');
const original = (fil) => readFileSync(join(ORIG, fil.replace(/\//g, '__')), 'utf8');

test('temapatchen går på Bäverbutikens riktiga temafiler, en gång', () => {
  for (const fil of Object.keys(PATCHAR)) {
    const r = patchaFil(fil, original(fil));
    assert.equal(r.lage, 'patchad', fil);
    assert.ok(r.text.includes(MARKOR), `${fil} saknar markören`);
    assert.equal(patchaFil(fil, r.text).lage, 'redan', `${fil} patchas två gånger`);
  }
});

test('temapatchen lägger bara till: varje svensk rad i originalet står kvar', () => {
  // Raderna som patchen medvetet skriver om (if → elsif, span inom gren) räknas bort.
  const omskrivna = /block\.settings\.logo -%\}$|<img src="\{\{ block\.settings\.logo \| img_url: footer_logo_size|\{\{ shop\.name \}\}$|&ndash; \{\{ shop\.name \}\}|og:site_name|page_title contains shop\.name|av 5|recensioner från kunder|'Recensioner'|från riktiga kunder|block\.settings\.titel \}\}<\/span>|block\.settings\.rad != blank|Recensioner från kunder|stjärnor|Verifierat köp|Föregående recensioner|Fler recensioner|visually-hidden">\{\{ shop\.name/;
  for (const fil of Object.keys(PATCHAR)) {
    const ny = patchaFil(fil, original(fil)).text;
    const saknas = original(fil).split('\n').map((l) => l.trim()).filter((l) => l && !omskrivna.test(l)).filter((l) => !ny.includes(l));
    assert.deepEqual(saknas, [], `${fil}: rader som försvann`);
  }
});

test('temapatchen: den svenska texten finns kvar i else-grenen', () => {
  const f = patchaFil('sections/footer.liquid', original('sections/footer.liquid')).text;
  assert.ok(f.includes('Bäverbutiken. Alla rättigheter förbehållna.'));
  const r = patchaFil('sections/bb-recensioner.liquid', original('sections/bb-recensioner.liquid')).text;
  for (const s of ['Verifierat köp', 'av 5 i snitt, baserat på', 'Föregående recensioner']) assert.ok(r.includes(s), s);
  const p = patchaFil('snippets/product-template.liquid', original('snippets/product-template.liquid')).text;
  assert.ok(p.includes('<span>{{ block.settings.text }}</span>'));
});

test('fraktplan: ny zon, länderna släpps ur de gamla, tom zon raderas', () => {
  const zoner = [
    { id: 'z1', namn: 'Sverige', lander: ['SE'], metoder: [] },
    { id: 'z2', namn: 'Internationell', lander: ['US', 'NO', 'DE'], metoder: [] },
    { id: 'z3', namn: 'EU', lander: ['FR'], metoder: [] },
  ];
  const p = fraktplan(zoner, { zon: 'WW', metod: 'Free', pris_sek: 0, lander: ['US', 'DE', 'FR'] });
  assert.equal(p.skapa.namn, 'WW');
  assert.deepEqual(p.uppdatera, [{ id: 'z2', namn: 'Internationell', efter: ['NO'], bort: ['US', 'DE'] }]);
  assert.deepEqual(p.radera.map((z) => z.id), ['z3']);
  assert.ok(!p.uppdatera.some((u) => u.id === 'z1'), 'Sverige rörs aldrig');
});

test('fraktplan: zonen finns redan rätt ⇒ inget', () => {
  const p = fraktplan([{ id: 'w', namn: 'WW', lander: ['US', 'DE'], metoder: [{ pris: 0, aktiv: true }] }], { zon: 'WW', lander: ['DE', 'US'] });
  assert.equal(p.redan, true);
  assert.equal(p.skapa, null);
});

test('konfig: Sverige och de nordiska Bäverbutikerna ligger aldrig i Worldwide', () => {
  for (const c of ['SE', 'NO', 'DK', 'FI']) assert.ok(!KONFIG.marknad.lander.includes(c), c);
  assert.equal(new Set(KONFIG.marknad.lander).size, KONFIG.marknad.lander.length, 'dubbletter');
});

test('saknadeScopes och kartorna', () => {
  assert.deepEqual(saknadeScopes(KONFIG.butik.kravda_scopes), []);
  assert.ok(saknadeScopes(['read_products']).includes('write_markets'));
  const k = vardeKarta({ ' Startsida ': 'Home' });
  assert.equal(k.get('Startsida'), 'Home');
  assert.deepEqual(produktKarta({ title: 'T', descriptionHtml: '<p>x</p>', seo_title: null }), { title: 'T', body_html: '<p>x</p>', meta_title: null, meta_description: null });
});

test('granska: siffror, taggar, svenska och förbjudna ord', () => {
  assert.deepEqual(siffror('2,5 m och 72 420 lm'), ['2.5', '72420']);
  assert.deepEqual(siffror('2.5 m and 72,420 lm'), ['2.5', '72420']);
  const kalla = { handle: 'h', title: 'Tratt 2 st', descriptionHtml: '<p>Håller 2,5 liter.</p>', options: [{ name: 'Färg', values: ['Svart'] }] };
  const bra = { handle: 'h', title: 'Funnel 2-pack', descriptionHtml: '<p>Holds 2.5 liters.</p>', options: [{ name: 'Färg', name_en: 'Color', values: { Svart: 'Black' } }] };
  assert.deepEqual(granskaProdukt(kalla, bra), []);
  assert.ok(granskaProdukt(kalla, { ...bra, descriptionHtml: '<div>Holds 2.5 liters.</div>' }).some((f) => f.includes('HTML')));
  assert.ok(granskaProdukt(kalla, { ...bra, descriptionHtml: '<p>Holds liters. Pay with Klarna.</p>' }).some((f) => f.includes('siffror') || f.includes('förbjudet')));
  assert.ok(granskaProdukt(kalla, { ...bra, descriptionHtml: '<p>Håller 2.5 liter och det är bra.</p>' }).length > 0);
});

test('alla 250 engelska produkttexter (248 + garantin och Kachings Blanda & Spara) klarar granskningen', () => {
  const kallmapp = join(ROT, 'oversattning', 'kalla');
  let n = 0;
  for (const f of readdirSync(kallmapp).filter((x) => x.startsWith('produkter-'))) {
    for (const p of JSON.parse(readFileSync(join(kallmapp, f), 'utf8'))) {
      const en = JSON.parse(readFileSync(join(ROT, 'oversattning', 'en', `${p.handle}.json`), 'utf8'));
      assert.deepEqual(granskaProdukt(p, en), [], p.handle);
      n++;
    }
  }
  assert.equal(n, 250);
});

test('annonserna: namn, länder, aktiveringsspärr', () => {
  assert.equal(wwNamn('Batmotor_SP_1_H5'), 'Batmotor_WW_SP_1_H5');
  assert.equal(wwNamn('Seatcover_PD_1_3_H1 – kopia'), 'Seatcover_WW_PD_1_3_H1_kopia');
  assert.equal(wwNamn('Seatcover bryn swipe 1'), 'Seatcover_WW_bryn_swipe_1');
  for (const c of ['US', 'GB', 'CA', 'AU', 'NZ']) assert.ok(!geoFor('takoverdraget').includes(c), `CaraShells ${c}`);
  assert.ok(geoFor('batmotorskyddet').includes('US'));
  assert.ok(!geoFor('batmotorskyddet').includes('SE'));
  assert.equal(farAktiveras({ budget_beslut: null }, [{}]).ok, false);
  assert.equal(farAktiveras({ budget_beslut: '500 kr/dag' }, []).ok, false);
  assert.equal(farAktiveras({ budget_beslut: '500 kr/dag' }, [{}]).ok, true);
  assert.match(kampanjNamn({ namn: 'Sotarsetet', be: 1.61 }, '2026-09-30'), /^BEAVERSTORE_WW_Sotarsetet \| BE ROAS 1\.61 \| 2026-09-30$/);
});

test('bilderna: format och prompt utan priser', () => {
  assert.equal(narmasteFormat(1080, 1350), '4:5');
  assert.equal(narmasteFormat(1080, 1080), '1:1');
  assert.equal(narmasteFormat(1080, 1920), '9:16');
  const p = prompt({ layout_en: 'x', rader: [{ sv: '909 kr', en: '' }, { sv: 'Slöa knivar?', en: 'Dull knives?' }] });
  assert.ok(p.includes('"909 kr" → REMOVE'));
  assert.ok(p.includes('"Slöa knivar?" → "Dull knives?"'));
});

test('apptexterna (bw-appord): reglerna i det genererade skriptet behåller sina snedstreck', async () => {
  // 2026-10-01: mallsträngen åt upp \( och \d, så "Recensioner på andra språk" blev "Reviews på andra språk".
  const { byggAppord } = await import('../tema/patch.mjs');
  const t = byggAppord();
  const skript = t.split('<script>')[1].split('</script>')[0];
  const par = new Function(`return ${/var par = (\/.*?\/)\.exec/.exec(skript)[1]};`)();
  assert.equal(par.exec('Recensioner på andra språk'), null, 'en vanlig mening får aldrig delas på första ordet');
  assert.deepEqual([...par.exec('2x Skyddshölje (-€6,10)')].slice(1), ['2x Skyddshölje', ' (-€6,10)']);
  const rabatt = new Function(`return ${/(\/\^\\d\+x .*?\/)\.test/.exec(skript)[1]};`)();
  assert.ok(rabatt.test('2x Skyddshölje') && !rabatt.test('dx Skyddshölje'));
  // Varje språkgren parsas och bär bara sitt språk.
  for (const l of ['en', 'de', 'pl']) {
    const re = l === 'en' ? /\{%- else -%\}\{% raw %\}([\s\S]*?)\{% endraw %\}/ : new RegExp(`\\{%- when '${l}' -%\\}\\{% raw %\\}([\\s\\S]*?)\\{% endraw %\\}`);
    const O = new Function(`${re.exec(skript)[1]}; return O;`)();
    assert.equal(typeof O.exakt['1x Skyddshölje'], 'string', `${l}: Kachings paketnamn saknas`);
    assert.ok(!/[åäö]/.test(O.exakt['Fri Frakt & 30 Dagars Öppet Köp']) && !/30/.test(O.exakt['Fri Frakt & 30 Dagars Öppet Köp']), `${l}: 30 dagar eller svenska kvar`);
    // Färgvärdena i korgens rad ("Color: Grön") — kopplade till Shopifys färgkategori, inte översättningsbara.
    for (const f of ['Grön', 'Blå', 'Grått', 'Rött', 'Vitt']) assert.ok(O.varden[f] && !/[åäö]/.test(O.varden[f]), `${l}: färgen ${f} saknas eller är svensk`);
  }
  // Färgvärdena byts bara i väljaren och korgens alternativrad, aldrig i inputens value.
  assert.match(skript, /var VARDEN = '\.cart__item--variants, \.variant-input-wrap, \.variant__label-info'/);
  assert.ok(!/\.value\s*=/.test(skript), 'skriptet får aldrig skriva om en inputs value');
  // "Recently viewed": bara /products/<handle>.js får språkprefixet.
  const medRot = new Function(`${/(function medRot\(u, rot\) \{[^\n]*\})/.exec(skript)[1]}; return medRot;`)();
  assert.equal(medRot('/products/abc.js', '/de/'), '/de/products/abc.js');
  assert.equal(medRot('/products/abc.js?x=1', '/pt-pt/'), '/pt-pt/products/abc.js?x=1');
  assert.equal(medRot('/products/abc.js', '/'), '/products/abc.js', 'engelska roten rörs inte');
  assert.equal(medRot('/cart/add.js', '/de/'), '/cart/add.js');
  assert.equal(medRot('/de/products/abc.js', '/de/'), '/de/products/abc.js');
  assert.equal(medRot('/products/abc', '/de/'), '/products/abc');
  assert.ok(Buffer.byteLength(t, 'utf8') < 250 * 1024, 'snippeten måste rymmas under Shopifys gräns för en Liquid-fil');
});
