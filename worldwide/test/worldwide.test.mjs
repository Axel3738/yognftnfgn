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
import { rensa as rensaSvenskaBilder } from '../granskning/svenska-bilder.mjs';
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
  // byt() kört på riktigt: Kaching sparar "1x  MC-Kapell …" med två mellanslag (mätt 2026-10-01),
  // och mönstergrenen får inte skriva över den råa texten den ska ersätta.
  const Oen = new Function(`${/\{%- else -%\}\{% raw %\}([\s\S]*?)\{% endraw %\}/.exec(skript)[1]}; return O;`)();
  const bytKalla = skript.slice(skript.indexOf('function bytVarde('), skript.indexOf('function gå('));
  const [byt, bytVarde] = new Function('O', 'M', 'tr', `${bytKalla}; return [byt, bytVarde];`)(Oen, Oen.monster.map((m) => ({ re: new RegExp(m.sv), m: m.t })), (v) => v || null);
  const nod = (v) => ({ nodeValue: v });
  const a1 = nod('\n  1x  MC-Kapell 218×118 cm  '); byt(a1, false);
  assert.equal(a1.nodeValue.trim(), Oen.exakt['1x MC-Kapell 218×118 cm']);
  const a2 = nod(' 12 recensioner '); byt(a2, false);
  assert.equal(a2.nodeValue, ' 12 reviews ');
  const a3 = nod(' Grön '); bytVarde(a3);
  assert.equal(a3.nodeValue, ' Green ');
  const a5 = nod('Verde - inte tillgängligt'); byt(a5, false);
  assert.equal(a5.nodeValue, 'Verde - unavailable');
  const a4 = nod('Bra köp'); byt(a4, false);
  assert.equal(a4.nodeValue, 'Bra köp', 'okänd text rörs inte');
  // Länkar utan språkprefix ("Mehr über uns" → /pages/om-oss) får besökarens prefix — bara butikens egna sidor.
  const medPrefix = new Function(`${/(function medPrefix\(h, rot, dom\) \{[\s\S]*?\n  \})/.exec(skript)[1]}; return medPrefix;`)();
  const D = 'https://beaverstoreco.com';
  assert.equal(medPrefix(`${D}/pages/om-oss`, '/de/', D), `${D}/de/pages/om-oss`);
  assert.equal(medPrefix('/collections/all?x=1', '/fr/', D), '/fr/collections/all?x=1');
  assert.equal(medPrefix('/de/pages/om-oss', '/de/', D), '/de/pages/om-oss', 'redan rätt språk rörs inte');
  assert.equal(medPrefix('/de', '/de/', D), '/de');
  assert.equal(medPrefix('/pt-PT/pages/x', '/pt-pt/', D), '/pt-PT/pages/x', 'ett annat språkprefix rörs inte');
  assert.equal(medPrefix('/cart', '/de/', D), '/cart', 'korgen och kassan rörs inte');
  assert.equal(medPrefix('https://baverbutiken.se/pages/data-sharing-opt-out', '/de/', D), 'https://baverbutiken.se/pages/data-sharing-opt-out', 'andra domäner rörs inte');
  assert.equal(medPrefix('//cdn.shopify.com/pages/x', '/de/', D), '//cdn.shopify.com/pages/x');
  assert.equal(medPrefix('/pages/om-oss', '/', D), '/pages/om-oss', 'engelska roten rörs inte');
  assert.equal(Oen.exakt['Sätesöverdrag'], 'Seat Cover');
  // "Recently viewed": bara /products/<handle>.js får språkprefixet.
  const medRot = new Function(`${/(function medRot\(u, rot\) \{[^\n]*\})/.exec(skript)[1]}; return medRot;`)();
  assert.equal(medRot('/products/abc.js', '/de/'), '/de/products/abc.js');
  assert.equal(medRot('/products/abc.js?x=1', '/pt-pt/'), '/pt-pt/products/abc.js?x=1');
  assert.equal(medRot('/products/abc.js', '/'), '/products/abc.js', 'engelska roten rörs inte');
  assert.equal(medRot('/cart/add.js', '/de/'), '/cart/add.js');
  assert.equal(medRot('/de/products/abc.js', '/de/'), '/de/products/abc.js');
  assert.equal(medRot('/products/abc', '/de/'), '/products/abc');
  // Bäverlampans bild med svensk text byts mot den andra bilden, med storleken kvar.
  const bytBild = new Function(`${/(var BILDBYTE = [^\n]*)/.exec(skript)[1]} ${/(function bytBild\(v\) \{[^\n]*\})/.exec(skript)[1]}; return bytBild;`)();
  assert.equal(bytBild('//x/cdn/shop/files/3XKraftfulltLEDLjus_600x600.png?v=1'), '//x/cdn/shop/files/WhatsAppImage2026-03-02at09.54.06_1_600x600.jpg?v=1');
  assert.equal(bytBild('/files/3XKraftfulltLEDLjus.png?width=360 360w, /files/3XKraftfulltLEDLjus.png?width=720 720w'), '/files/WhatsAppImage2026-03-02at09.54.06_1.jpg?width=360 360w, /files/WhatsAppImage2026-03-02at09.54.06_1.jpg?width=720 720w');
  assert.equal(bytBild('/files/annan.png'), '/files/annan.png');
  // Galleriets svenska bilder: rätt filer träffas, strandtofflornas "Namnlosdesign-2026-…" och andra rörs inte.
  const GALLERI = new Function(`${/(var GALLERI = [^\n]*)/.exec(skript)[1]}; return GALLERI;`)();
  for (const u of ['//d/cdn/shop/files/mc-matt-sv_{width}x.jpg?v=1', '//d/cdn/shop/files/Namnlosdesign_{width}x.png?v=1', '//d/cdn/shop/files/hf_20260817_053401_5af027d7_{width}x.png', '//d/cdn/shop/files/15-sv_{width}x.jpg', '//d/cdn/shop/files/klart-karborre-benskydd-sv_{width}x.jpg']) assert.ok(GALLERI.test(u), u);
  for (const u of ['//d/cdn/shop/files/Namnlosdesign-2026-07-27T131715.079_{width}x.png', '//d/cdn/shop/files/mc-regn_{width}x.jpg', '//d/cdn/shop/files/hf_20260817_053410_x.png', '//d/cdn/shop/files/115-sv_{width}x.jpg', '//d/cdn/shop/files/damask-se-SV_{width}x.png']) assert.ok(!GALLERI.test(u), u);
  assert.ok(skript.indexOf('galleri(document);') > 0, 'galleriet rensas direkt när skriptet läses, före temats bildspel');
  assert.match(t, /body\.template-collection \.shopify-section\[id\$="__promo-grid"\]\{display:none!important\}/, 'kollektionens svenska banner döljs');
  assert.ok(Buffer.byteLength(t, 'utf8') < 250 * 1024, 'snippeten måste rymmas under Shopifys gräns för en Liquid-fil');
});

test('svenska bilder: tas bort ur översättningen, storlekstabellerna på kundens språk, en gång', () => {
  const html = '<p>A</p><p><img src="//x/files/mc-matt-sv.jpg?v=1" alt=""></p><p>B</p>';
  assert.equal(rensaSvenskaBilder(html, 'mc-kapell-220-120-regn-damm-uv', 'de'), '<p>A</p><p>B</p>');
  const bat = rensaSvenskaBilder('<p><img src="//x/files/batmotor-tabell-sv.jpg"></p>', 'batmotorskydd-420d-heltackande-for-utombordare', 'fr');
  assert.match(bat, /Guide des tailles/); assert.match(bat, /226 cm/); assert.doesNotMatch(bat, /batmotor-tabell-sv/);
  const marin = '<h3>Features</h3><ul><li>x</li></ul><p>14 days</p>';
  const en = rensaSvenskaBilder(marin, 'marin-motorholje-420d-universellt-skydd', 'en');
  assert.match(en, /<\/ul>\n<h3>Size guide/); assert.match(en, /82 cm \/ 32\.3 in/); assert.match(en, /175–250 hp/);
  assert.equal(rensaSvenskaBilder(en, 'marin-motorholje-420d-universellt-skydd', 'en'), en, 'tabellen läggs bara in en gång');
  assert.match(rensaSvenskaBilder(marin, 'marin-motorholje-420d-universellt-skydd', 'pl'), /Pasujące silniki.*175–250 KM/s);
  assert.equal(rensaSvenskaBilder(html, 'annan-produkt', 'de'), html, 'andra produkter rörs inte');
});

test('Impressum: länken i sidfoten ritas bara på tyska, och sidan bär ankaret', async () => {
  const { byggAppord } = await import('../tema/patch.mjs');
  const t = byggAppord();
  const rader = t.split('\n').filter((r) => r.includes('Impressum</a>'));
  assert.equal(rader.length, 1);
  assert.match(rader[0], /\{%- if request\.locale\.iso_code == 'de' -%\}/);
  assert.match(rader[0], /pages\/anvandarvillkor#impressum/);
  const de = JSON.parse(readFileSync(new URL('../oversattning/de/_sidor-2.json', import.meta.url), 'utf8'));
  assert.match(de.anvandarvillkor.body, /<h2 id="impressum">Impressum<\/h2>/);
  assert.match(de.anvandarvillkor.body, /Axel Odhner/);
  // Inget annat språk får Impressum-raden.
  for (const l of ['en', 'fr', 'es', 'it', 'nl', 'pl', 'pt-PT']) {
    const f = new URL(`../oversattning/${l}/_sidor-2.json`, import.meta.url);
    assert.doesNotMatch(readFileSync(f, 'utf8'), /Impressum|Odhner/, l);
  }
});

test('Judge.me-datum: skrivs om med månadsnamn i världsläget, aldrig för amerikaner', async () => {
  const { byggAppord } = await import('../tema/patch.mjs');
  const t = byggAppord();
  const s = t.slice(t.indexOf('<script>') + 8, t.indexOf('</script>')).replace(/\{%-?[^%]*-?%\}/g, '');
  assert.doesNotThrow(() => new Function(s));
  const re = new RegExp(/var DATUM = \/(.+)\/;/.exec(s)[1]);
  assert.ok(re.test('09/24/2026'));
  assert.ok(!re.test('24. Sept. 2026'));
  assert.match(s, /Shopify\.country === 'US'/);
  assert.match(s, /datum\(document\)/);
});

test('färgnamnen: planen översätter bara etikettfältet, på alla åtta språk, och rör aldrig svenskan', async () => {
  const { planFor } = await import('../granskning/fargnamn.mjs');
  const plan = planFor({ resourceId: 'x', translatableContent: [{ key: 'label', value: 'Grön', digest: 'd1' }, { key: 'color', value: '#00ff00', digest: 'd2' }] });
  assert.equal(plan.length, 8);
  assert.deepEqual(plan.find((p) => p.locale === 'de'), { locale: 'de', key: 'label', value: 'Grün', translatableContentDigest: 'd1', kalla: 'Grön' });
  assert.ok(!plan.some((p) => p.locale === 'sv'));
  assert.equal(planFor({ resourceId: 'y', translatableContent: [{ key: 'label', value: 'Orange', digest: 'd' }] }).length, 0);
});
