// konvertera.mjs: Bäverbutikens utfall oförändrat, CaraShells språk och Spoks-form.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROT, skapaKonverterare, lasBrand, lasProduktIds, lasRecensioner, fornamn, recensionerUrYaml } from '../spoks/konvertera.mjs';

const las = (f) => JSON.parse(readFileSync(f, 'utf8'));

// ---------------------------------------------------------------- Bäverbutiken

function baverKonverterare() {
  const brand = lasBrand('baverbutiken');
  const erbjudande = las(join(ROT, 'mejl', 'konfig.json')).erbjudande;
  const recCache = lasRecensioner(brand, 'baverbutiken');
  return { K: skapaKonverterare({ brand, produktIds: lasProduktIds('baverbutiken'), recCache, erbjudande }), harCache: Object.keys(recCache).length > 0 };
}

test('Bäverbutiken: varje committad payload är exakt vad konverteraren ger i dag', () => {
  const { K, harCache } = baverKonverterare();
  const inn = join(ROT, 'klaviyo', 'innehall', 'baverbutiken');
  const payload = join(ROT, 'klaviyo', 'spoks', 'baverbutiken', 'payload');
  const mejl = [];
  for (const f of readdirSync(join(inn, 'floden'))) for (const s of las(join(inn, 'floden', f)).steg) if (s.typ === 'mejl') mejl.push(s.mejl);
  for (const f of readdirSync(join(inn, 'kampanjer'))) { const d = las(join(inn, 'kampanjer', f)); const m = d.mejl ?? d; mejl.push({ ...m, id: m.id ?? d.id }); }
  let jamforda = 0, hoppade = 0;
  for (const m of mejl) {
    const fil = join(payload, `${m.id}.json`);
    if (!existsSync(fil)) continue;
    // Recensionscachen är gitignorerad: utan den utgår citatblocken, och de mejlen jämförs bara när cachen finns.
    if (!harCache && (m.block ?? []).some((b) => b.typ === 'citat')) { hoppade++; continue; }
    assert.deepEqual(K.konverteraMejl(m), las(fil), `${m.id} skiljer sig från den committade payloaden`);
    jamforda++;
  }
  assert.ok(jamforda >= 30, `bara ${jamforda} payloads jämförda (${hoppade} hoppade utan recensionscache)`);
});

test('Bäverbutiken: fornamn-reserven är "där" och fakta-blocket bär brandets texter', () => {
  const { K } = baverKonverterare();
  assert.equal(fornamn('Hej {{fornamn}}'), "Hej {{ contact.first_name | default: 'där' }}");
  const [fakta] = K.konverteraBlock({ typ: 'fakta' }, []);
  assert.equal(fakta.columns[0].blocks[1].text, '14 dagars ångerrätt');
  assert.match(fakta.columns[1].blocks[1].text, /baverbutiken\.se\/pages\/spara/);
});

// ------------------------------------------------------------------- CaraShell

function caraKonverterare() {
  const brand = lasBrand('carashell');
  return { brand, K: skapaKonverterare({ brand, produktIds: lasProduktIds('carashell'), recCache: lasRecensioner(brand, 'carashell'), erbjudande: null }) };
}

test('CaraShell: språket styr förnamnsreserv, länkbas, spårningssida och villkorstext', () => {
  const { K } = caraKonverterare();
  const sv = K.konverteraMejl({ id: 'x', sprak: 'sv', amnesrader: [{ text: 'Hej {{fornamn}}' }], block: [{ typ: 'fakta' }, { typ: 'knapp', text: 'k', lank: 'produkt:takskyddet' }] });
  const nb = K.konverteraMejl({ id: 'x', sprak: 'nb', amnesrader: [{ text: 'Hei {{fornamn}}' }], block: [{ typ: 'fakta' }, { typ: 'knapp', text: 'k', lank: 'produkt:takskyddet' }] });
  const en = K.konverteraMejl({ id: 'x', sprak: 'en', amnesrader: [{ text: 'Hi {{fornamn}}' }], block: [{ typ: 'fakta' }, { typ: 'knapp', text: 'k', lank: 'produkt:takskyddet' }] });
  assert.equal(sv.emailTitle, "Hej {{ contact.first_name | default: 'där' }}");
  assert.equal(nb.emailTitle, "Hei {{ contact.first_name | default: 'der' }}");
  assert.equal(en.emailTitle, "Hi {{ contact.first_name | default: 'there' }}");
  assert.equal(sv.blocks[1].url, 'https://carashell.se/products/takskyddet');
  assert.equal(nb.blocks[1].url, 'https://carashell.se/nb/products/takskyddet?country=NO');
  assert.equal(en.blocks[1].url, 'https://carashell.com/products/takskyddet');
  assert.equal(sv.blocks[0].columns[0].blocks[1].text, '14 dagars ångerrätt');
  assert.equal(nb.blocks[0].columns[0].blocks[1].text, '14 dagers angrerett');
  assert.equal(en.blocks[0].columns[0].blocks[1].text, '90-day guarantee');
  assert.match(nb.blocks[0].columns[1].blocks[1].text, /carashell\.se\/nb\/pages\/spara/);
  assert.match(en.blocks[0].columns[1].blocks[1].text, /carashell\.com\/pages\/spara/);
  assert.equal(sv.sprak, 'sv');
});

test('CaraShell: produktkort blir bild + rubrik + knapp på nb/en, produktblock på sv', () => {
  // Utan Spoks-id:n (före uppladdningen) blir platshållaren synlig.
  const K = skapaKonverterare({ brand: lasBrand('carashell'), produktIds: {}, recCache: {}, erbjudande: null });
  const sv = K.konverteraMejl({ id: 'x', sprak: 'sv', amnesrader: [{ text: 'a' }], block: [{ typ: 'produkt', handle: 'takskyddet', knapp: 'Köp' }] });
  assert.equal(sv.blocks[0].type, 'products');
  assert.equal(sv.blocks[0].products[0].id, '{{spoks:id:takskyddet}}', 'Spoks-id saknas tills uppladdningen: synlig platshållare, inte ett tyst bortfall');
  assert.ok(sv.varningar.some((v) => /finns inte i Spoks/.test(v)));
  const en = K.konverteraMejl({ id: 'x', sprak: 'en', amnesrader: [{ text: 'a' }], block: [{ typ: 'produkt', handle: 'takskyddet', knapp: 'See it' }, { typ: 'produktrad', rubrik: 'Both', handles: ['takskyddet', 'termoskyddet'] }] });
  assert.deepEqual(en.blocks.slice(0, 3).map((b) => b.type), ['image', 'h2', 'link']);
  assert.equal(en.blocks[1].text, 'Roof Cover for Travel Trailers & Motorhomes 18–44 ft');
  assert.equal(en.blocks[0].fileId, '{{spoks:media:takskyddet}}');
  const rad = en.blocks.find((b) => b.type === 'columns');
  assert.equal(rad.columns.length, 2);
  assert.equal(rad.columns[1].blocks[1].text, 'Windshield Thermal Cover for Motorhome 211 × 171 cm');
  // Kassablocket döljer priset på bild-språken (katalogen är i SEK).
  const kassa = K.konverteraBlock({ typ: 'dynamisk', kalla: 'checkout_rader' }, [], 'en')[0];
  assert.equal(kassa.isProductPriceVisible, false);
  assert.equal(kassa.buttonText, 'Back to checkout');
});

test('CaraShell: produkter.json:s Spoks-id och bild-fileId hamnar i blocken', () => {
  const ids = lasProduktIds('carashell');
  if (!ids.takskyddet?.id || !ids.takskyddet?.bild) return; // före uppladdningen: täckt av testet ovan
  const { K } = caraKonverterare();
  const sv = K.konverteraMejl({ id: 'x', sprak: 'sv', amnesrader: [{ text: 'a' }], block: [{ typ: 'produkt', handle: 'takskyddet', knapp: 'Köp' }] });
  assert.equal(sv.blocks[0].products[0].id, ids.takskyddet.id);
  assert.ok(!sv.varningar.some((v) => /finns inte i Spoks/.test(v)));
  const en = K.konverteraMejl({ id: 'x', sprak: 'en', amnesrader: [{ text: 'a' }], block: [{ typ: 'produkt', handle: 'takskyddet', knapp: 'See it' }] });
  assert.equal(en.blocks[0].fileId, ids.takskyddet.bild);
});

test('CaraShell: citat ur produktfilen på sv, aldrig på en; grundare på språket; stjärnorna till Trustpilot per språk', () => {
  const { K, brand } = caraKonverterare();
  const rec = lasRecensioner(brand, 'carashell');
  assert.ok((rec.takskyddet ?? []).length >= 5, 'produktfilens recensioner läses');
  const sv = K.konverteraBlock({ typ: 'citat', handle: 'takskyddet', antal: 2 }, [], 'sv');
  assert.equal(sv.length, 2);
  assert.match(sv[0].text, /verifierad kund$/);
  const varn = [];
  assert.deepEqual(K.konverteraBlock({ typ: 'citat', handle: 'takskyddet' }, varn, 'en'), []);
  assert.equal(varn.length, 1);
  assert.equal(K.konverteraBlock({ typ: 'grundare', text: 'Hei' }, [], 'nb')[0].text, 'Hei\nAxel, grunnlegger');
  const st = K.konverteraBlock({ typ: 'stjarnor', lank: 'trustpilot:' }, [], 'nb');
  assert.match(st[0].text, /no\.trustpilot\.com\/evaluate\/carashell\.se\?stars=1/);
});

test('recensionerUrYaml läser reviews-listan och sorterar 5 före 4', () => {
  const yaml = 'produkt:\n  namn: "x"\nreviews:\n  - namn: "Karin Berg"\n    betyg: 4\n    text: "Bra."\n    datum: "2026-09-08"\n  - namn: "Erik"\n    betyg: 5\n    text: "Nöjd."\n    datum: "2026-09-08"\n  - namn: "Sur"\n    betyg: 2\n    text: "Nej."\n    datum: "2026-09-08"\nfaq:\n  - fraga: "q"\n';
  const r = recensionerUrYaml(yaml);
  assert.deepEqual(r.map((x) => [x.namn, x.betyg]), [['Erik', 5], ['Karin B.', 4]]);
});

test('CaraShell: Spoks-filtret per språk och flödesdefinitionen', () => {
  const { K } = caraKonverterare();
  const sv = K.spoksFilter(['samtycke', 'sprak'], 'sv');
  assert.equal(sv.type, 'conjunction');
  assert.equal(sv.operator, 'and');
  assert.deepEqual(sv.filters[0], { type: 'filter', field: 'emailMarketingConsent', operator: 'in', value: ['subscribed'] });
  assert.equal(sv.filters[1].operator, 'or', 'svenskan tar Sverige, Danmark och kontakter utan land');
  assert.deepEqual(sv.filters[1].filters[0].value, ['Sweden', 'Denmark']);
  assert.deepEqual(sv.filters[1].filters[1], { type: 'filter', field: 'country', operator: 'nis' });
  const nb = K.spoksFilter(['ej_avregistrerad', 'sprak'], 'nb');
  assert.deepEqual(nb.filters[0], { type: 'filter', field: 'emailMarketingConsent', operator: 'nin', value: ['unsubscribed'] });
  assert.deepEqual(nb.filters[1], { type: 'filter', field: 'country', operator: 'in', value: ['Norway'] });
  assert.equal(K.spoksFilter(['sprak'], 'en').value.length, 6);
  assert.equal(K.spoksFilter([], 'sv'), null);
  assert.deepEqual(K.spoksFilter(['ej_kopt_sedan_start'], 'sv'), { type: 'filter', field: 'lastPurchase', operator: 'lt', value: '__flow_triggered__' });

  const flode = K.spoksFlode({ id: 'f', namn: 'F', sprak: 'nb', spoks: { event: 'order_delivered', filter: ['ej_avregistrerad', 'sprak'], triggerFilter: { externalId: ['takskyddet'] }, reenroll: true, reenrollEfter: 'P90D', tilHour: '18:00' }, steg: [{ typ: 'vanta', enhet: 'days', varde: 10 }, { typ: 'mejl', mejl: { id: 'm1', amnesrader: [{ text: 'Hva synes du?' }] } }] });
  assert.equal(flode.trigger.event, 'order_delivered');
  assert.deepEqual(flode.trigger.triggerFilter, { type: 'filter', field: 'externalId', operator: 'in', value: ['gid://shopify/Product/16084174242124'] });
  assert.equal(flode.allowReenrolmentAfter, 'P90D');
  assert.deepEqual(flode.steg[0], { type: 'delay', parameters: { delay: 864000000, tilHour: '18:00' } });
  assert.deepEqual(flode.steg[1], { type: 'publish_flow_post_to_contact', mejl: 'm1', namn: 'Hva synes du?' });
});

test('CaraShell: 13 segment, alla kampanjsegment kräver samtycke', () => {
  const { K } = caraKonverterare();
  const seg = K.segment();
  assert.equal(seg.length, 13);
  for (const s of seg.filter((x) => x.kampanj_ok)) {
    const forsta = s.filter.filters?.[0] ?? s.filter;
    assert.deepEqual(forsta, { type: 'filter', field: 'emailMarketingConsent', operator: 'in', value: ['subscribed'] }, s.namn);
  }
  assert.equal(seg.find((s) => s.namn === 'SEG_oengagerade_180d').kampanj_ok, false);
});

test('CaraShell: copykontrollen stoppar tankstreck, leveranstid, belopp, butiksnamn, årstider och ofylld copy', () => {
  const { K } = caraKonverterare();
  const bas = { id: 't', sprak: 'sv', amnesrader: [{ text: 'a' }, { text: 'b' }, { text: 'c' }], forhandstext: 'f', block: [], tretest: [{ rad: 'a', visualisera: true, falsifiera: true, ingen_annan: true }] };
  assert.deepEqual(K.kontrollera(bas), []);
  const fel = (m) => K.kontrollera({ ...bas, ...m });
  assert.match(fel({ forhandstext: 'Taket – ytan du aldrig ser' })[0], /tankstreck/);
  assert.match(fel({ forhandstext: 'Leverans på 5-10 arbetsdagar' })[0], /leveranstid/);
  assert.match(fel({ forhandstext: 'Bara 1 129 kr' })[0], /belopp/);
  assert.match(fel({ forhandstext: 'CaraShell täcker taket' })[0], /butikens namn/);
  assert.deepEqual(fel({ forhandstext: 'Mejla hello@carashell.com' }), [], 'mejladressen är tillåten');
  assert.match(fel({ forhandstext: 'Med garanti' })[0], /garanti/);
  assert.match(fel({ sprak: 'en', forhandstext: 'Before winter' })[0], /årstid/);
  assert.match(fel({ block: [{ typ: 'text', text: '__COPY__: x' }] })[0], /ofylld/);
  assert.match(fel({ block: [{ typ: 'punkter', punkter: ['elastiska band'] }] })[0], /vävda/);
  assert.deepEqual(fel({ sprak: 'nb', block: [{ typ: 'punkter', punkter: ['Vevde bånd, ikke strikk som strekker seg ut'] }] }), [], 'negationen är faktabladets egen text');
  assert.match(fel({ sprak: 'nb', block: [{ typ: 'punkter', punkter: ['Bånd av strikk'] }] })[0], /vävda/);
  assert.match(fel({ tretest: [{ rad: 'a', visualisera: true, falsifiera: false, ingen_annan: true }] })[0], /klarar inte/);
  assert.deepEqual(K.kontrollera({ ...bas, id: 'f14-recension-e1', tretest: [{ rad: 'a', visualisera: true, falsifiera: true, ingen_annan: false }] }), [], 'recensionsmejlet får ha ingen_annan false');
});
