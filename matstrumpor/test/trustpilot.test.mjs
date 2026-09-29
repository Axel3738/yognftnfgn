// Trustpilot på hemsidan — de rena funktionerna, utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  valjOmdomen, egenRubrik, klipp, datumSv, betygUr, metafaltJson, laggInPaStartsidan,
  byggSektion, sprakCase, lasMallJson, sidanBar, profilUrl, laggInPaProduktsidan, laggInRad, laggInILadan, temaFiler,
  SPRAKFIL, SEKTIONSFIL, SNIPPETFIL, SPRAK, SEKTION_TYP, SEKTIONSFIL_TEMA, SNIPPETFIL_TEMA, INDEX_FIL, PRODUKT_FIL, KORG_FIL, KOLLEKTION_FIL, LADA_FIL,
} from '../trustpilot.mjs';

const rev = (over = {}) => ({
  id: 'abc123', rating: 5, title: 'Kul att ge till någon som verkligen…',
  text: 'Kul att ge till någon som verkligen uppskattar dessa strumpor.',
  consumer: { displayName: 'Carina Andersson' }, dates: { publishedDate: '2026-09-28T20:50:16.000Z' }, ...over,
});

test('valjOmdomen: bara ≥ 4 stjärnor, nyast först, max, aldrig tomma', () => {
  const r = valjOmdomen([
    rev({ id: 'a', rating: 1, dates: { publishedDate: '2026-09-29T00:00:00Z' } }),
    rev({ id: 'b', rating: 5, dates: { publishedDate: '2026-09-27T00:00:00Z' } }),
    rev({ id: 'c', rating: 4, dates: { publishedDate: '2026-09-28T00:00:00Z' } }),
    rev({ id: 'd', rating: 5, text: '   ' }),
    rev({ id: 'e', rating: 5, dates: { publishedDate: '2026-09-26T00:00:00Z' } }),
  ], { max: 2 });
  assert.deepEqual(r.map((o) => o.id), ['c', 'b']);
  assert.equal(r[0].lank, 'https://se.trustpilot.com/reviews/c');
  assert.equal(r[0].datum, '2026-09-28');
  assert.equal(r[0].datum_sv, '28 sep 2026');
});

test('egenRubrik: Trustpilots egna rubrik (textens början + …) ritas inte, kundens egen rubrik behålls', () => {
  assert.equal(egenRubrik('Kul att ge till någon som verkligen…', 'Kul att ge till någon som verkligen uppskattar dessa strumpor.'), '');
  assert.equal(egenRubrik('Det blev uppskattade presenter!', 'Det blev uppskattade presenter!'), '');
  assert.equal(egenRubrik('Fantastiskt rolig idé', 'Beställde till hela familjen, alla skrattade.'), 'Fantastiskt rolig idé');
  assert.equal(egenRubrik('', 'text'), '');
});

test('klipp: vid ordgräns med …, aldrig mitt i ett ord', () => {
  const lang = 'ord '.repeat(100).trim();
  const k = klipp(lang, 50);
  assert.ok(k.length <= 50 && k.endsWith('…') && !k.endsWith(' …'));
  assert.equal(klipp('kort text', 50), 'kort text');
  assert.equal(klipp('  flera   mellanslag  '), 'flera mellanslag');
});

test('datumSv: svensk kortform, tomt vid skräp', () => {
  assert.equal(datumSv('2026-01-08T13:19:44.000Z'), '8 jan 2026');
  assert.equal(datumSv('nej'), '');
});

const starter = (starsString) => ({ businessUnit: { stars: 4.0, trustScore: 4.2, numberOfReviews: { total: 15, oneStar: 4, twoStars: 0, threeStars: 0, fourStars: 0, fiveStars: 11 } }, starsString });

test('betygUr: poäng med komma och punkt, etiketten per språk, fördelningen', () => {
  const b = betygUr({ sv: starter('Bra'), en: starter('Great'), de: null });
  assert.equal(b.poang, 4.2);
  assert.equal(b.poang_text, '4,2');
  assert.equal(b.poang_en, '4.2');
  assert.equal(b.stjarnor, 4);
  assert.equal(b.antal, 15);
  assert.deepEqual(b.fordelning, { 1: 4, 2: 0, 3: 0, 4: 0, 5: 11 });
  assert.deepEqual(b.etikett, { sv: 'Bra', en: 'Great' });
  assert.throws(() => betygUr({ sv: { businessUnit: {} } }), /trustScore/);
});

test('metafaltJson: profillänk per språk på rätt Trustpilot-domän', () => {
  const m = metafaltJson({ betyg: betygUr({ sv: starter('Bra') }), omdomen: [], hamtad: 'nu' });
  assert.equal(m.hamtad, 'nu');
  assert.equal(m.profil.sv, 'https://se.trustpilot.com/review/www.matstrumpor.se');
  assert.equal(m.profil.en, 'https://www.trustpilot.com/review/www.matstrumpor.se');
  assert.equal(m.profil['pt-PT'], 'https://pt.trustpilot.com/review/www.matstrumpor.se');
  assert.deepEqual(Object.keys(m.profil), Object.keys(SPRAK));
  assert.equal(profilUrl('okänt'), 'https://www.trustpilot.com/review/www.matstrumpor.se');
});

test('laggInPaStartsidan: raden efter marquee:n, korten där slidern står, slidern göms — och ingenting andra gången', () => {
  const index = { sections: { hero: { type: 'image-banner' }, ms_marquee: { type: 'ms-marquee' }, produkt: { type: 'featured-product' }, omdomen: { type: 'ms-review-slider', settings: { visible: true, heading: 'x' } } }, order: ['hero', 'ms_marquee', 'produkt', 'omdomen'] };
  const ny = laggInPaStartsidan(index);
  assert.notEqual(ny, index);
  assert.deepEqual(ny.order, ['hero', 'ms_marquee', 'trustpilot_rad', 'produkt', 'trustpilot', 'omdomen']);
  assert.equal(ny.sections.trustpilot_rad.type, SEKTION_TYP);
  assert.equal(ny.sections.trustpilot_rad.settings.variant, 'rad');
  assert.equal(ny.sections.trustpilot.settings.variant, 'kort');
  assert.equal(ny.sections.omdomen.settings.visible, false);
  assert.equal(ny.sections.omdomen.settings.heading, 'x');
  assert.equal(index.sections.omdomen.settings.visible, true, 'originalet rörs inte');
  assert.equal(laggInPaStartsidan(ny), ny, 'idempotent: samma objekt tillbaka');
});

test('laggInPaStartsidan: utan marquee och slider hamnar raden först och korten sist', () => {
  const ny = laggInPaStartsidan({ sections: { hero: {} }, order: ['hero'] });
  assert.deepEqual(ny.order, ['trustpilot_rad', 'hero', 'trustpilot']);
});

test('laggInPaProduktsidan: raden som custom_liquid-block direkt efter ms_trust, en gång', () => {
  const mall = { sections: { main: { type: 'main-product', blocks: { buy_buttons: { type: 'buy_buttons' }, ms_trust: { type: 'custom_liquid' }, description: { type: 'description' } }, block_order: ['buy_buttons', 'ms_trust', 'description'] } } };
  const ny = laggInPaProduktsidan(mall);
  assert.deepEqual(ny.sections.main.block_order, ['buy_buttons', 'ms_trust', 'ms_trustpilot', 'description']);
  assert.equal(ny.sections.main.blocks.ms_trustpilot.settings.custom_liquid, "{% render 'ms-trustpilot-rad', kompakt: true %}");
  assert.equal(laggInPaProduktsidan(ny), ny);
  assert.throws(() => laggInPaProduktsidan({ sections: {} }), /main-product/);
  const utanTrust = laggInPaProduktsidan({ sections: { main: { type: 'main-product', blocks: { buy_buttons: {} }, block_order: ['buy_buttons', 'x'] } } });
  assert.deepEqual(utanTrust.sections.main.block_order, ['buy_buttons', 'ms_trustpilot', 'x']);
});

test('laggInRad: rad-sektionen efter en given sektion, annars först, aldrig två gånger', () => {
  const korg = laggInRad({ sections: { a: {}, 'cart-footer': {} }, order: ['a', 'cart-footer'] }, { efter: 'cart-footer' });
  assert.deepEqual(korg.order, ['a', 'cart-footer', 'trustpilot_rad']);
  assert.equal(korg.sections.trustpilot_rad.settings.variant, 'rad');
  assert.equal(laggInRad(korg, { efter: 'cart-footer' }), korg);
  assert.deepEqual(laggInRad({ sections: {}, order: ['x'] }, { efter: 'finns-inte' }).order, ['trustpilot_rad', 'x']);
});

test('laggInILadan: raden ovanför Till kassan, idempotent, stopp utan ankare', () => {
  const lada = '<div class="cart-drawer__footer">…</div>\n\n        <!-- CTAs -->\n\n        <div class="cart__ctas">…</div>';
  const ny = laggInILadan(lada);
  assert.ok(ny.includes("{% render 'ms-trustpilot-rad', kompakt: true %}\n        <!-- CTAs -->"));
  assert.equal(laggInILadan(ny), ny);
  assert.throws(() => laggInILadan('<div>inget här</div>'), /ankaret/);
});

test('temaFiler: bara det som skiljer sig skrivs, varje fil med kontrollvärde', () => {
  const sprak = JSON.parse(readFileSync(SPRAKFIL, 'utf8'));
  const mallar = { sektionsmall: readFileSync(SEKTIONSFIL, 'utf8'), snippetmall: readFileSync(SNIPPETFIL, 'utf8') };
  const tom = (o) => '/* kommentar */\n' + JSON.stringify(o);
  const fore = {
    [INDEX_FIL]: tom({ sections: { ms_marquee: {}, omdomen: { settings: { visible: true } } }, order: ['ms_marquee', 'omdomen'] }),
    [PRODUKT_FIL]: tom({ sections: { main: { type: 'main-product', blocks: { ms_trust: {} }, block_order: ['ms_trust'] } } }),
    [KORG_FIL]: tom({ sections: { 'cart-footer': {} }, order: ['cart-footer'] }),
    [KOLLEKTION_FIL]: tom({ sections: { banner: {} }, order: ['banner'] }),
    [LADA_FIL]: 'x\n        <!-- CTAs -->\ny',
  };
  const { filer, rader } = temaFiler(fore, sprak, mallar);
  assert.deepEqual(filer.map((f) => f.filename), [SEKTIONSFIL_TEMA, SNIPPETFIL_TEMA, INDEX_FIL, PRODUKT_FIL, KORG_FIL, KOLLEKTION_FIL, LADA_FIL]);
  assert.ok(rader.some((r) => r.includes('saknas, skapas')));
  // Andra varvet: allt står rätt ⇒ inget att skriva.
  const efter = {};
  for (const f of filer) efter[f.filename] = f.filename.endsWith('.json') ? '/* Shopifys huvud */\n' + f.body.value : f.body.value;
  const igen = temaFiler(efter, sprak, mallar);
  assert.deepEqual(igen.filer, []);
  assert.ok(igen.rader.every((r) => r.endsWith('står redan rätt')));
});

test('lasMallJson: Shopifys kommentarshuvud skalas bort', () => {
  assert.deepEqual(lasMallJson('/*\n * IMPORTANT\n */\n{"a": 1}\n'), { a: 1 });
  assert.throws(() => lasMallJson('inget'), /JSON/);
});

test('sprakCase: en gren per språk, svenskan som else, {n} byts', () => {
  const sprak = JSON.parse(readFileSync(SPRAKFIL, 'utf8'));
  const c = sprakCase(sprak, 'baserat', { n: '{{ d.antal }}' });
  assert.ok(c.startsWith('{% case request.locale.iso_code %}'));
  assert.ok(c.includes("{% when 'en' %}Based on {{ d.antal }} reviews"));
  assert.ok(c.includes("{% when 'pt-PT' %}"));
  assert.ok(c.endsWith('{% else %}Baserat på {{ d.antal }} omdömen{% endcase %}'));
  assert.ok(!c.includes('{n}'));
});

test('sprak.json: tolv språk, åtta nycklar, inga tankstreck, {n} i baserat', () => {
  const sprak = JSON.parse(readFileSync(SPRAKFIL, 'utf8'));
  assert.deepEqual(Object.keys(sprak).sort(), Object.keys(SPRAK).sort());
  for (const [s, o] of Object.entries(sprak)) {
    assert.deepEqual(Object.keys(o).sort(), ['av5', 'baserat', 'eyebrow', 'heading', 'knapp', 'las', 'omdomen', 'pa_trustpilot'], s);
    assert.ok(o.baserat.includes('{n}'), `${s}: baserat saknar {n}`);
    for (const v of Object.values(o)) assert.ok(!/[—–!]/.test(v), `${s}: "${v}"`);
  }
});

test('byggSektion: mallens platshållare blir case-grenar, schema och metafältet står kvar, inget {{{ kvar', () => {
  const sprak = JSON.parse(readFileSync(SPRAKFIL, 'utf8'));
  const ut = byggSektion(readFileSync(SEKTIONSFIL, 'utf8'), sprak);
  assert.ok(!ut.includes('{{{'));
  assert.ok(ut.includes('shop.metafields.matstrumpor.trustpilot.value'));
  assert.ok(ut.includes('{% schema %}') && ut.includes('"presets"'));
  assert.ok(ut.includes("{% when 'de' %}Bewertungen auf Trustpilot"));
  assert.ok(ut.includes("render 'ms-trustpilot-rad'") && ut.includes('ms-tp--kort'));
  const rad = byggSektion(readFileSync(SNIPPETFIL, 'utf8'), sprak);
  assert.ok(!rad.includes('{{{') && rad.includes('ms-tp--rad') && rad.includes('ms-tp--kompakt'));
  assert.ok(rad.includes("{% when 'en' %}out of 5"));
  assert.throws(() => byggSektion('x', { sv: {} }), /saknar nycklar/);
});

test('sidanBar: hittar raden, korten, betyget och namnen i kundens HTML', () => {
  const data = { poang_text: '4,2', omdomen: [{ namn: 'Bosse' }, { namn: 'Ann & Co' }] };
  const html = '<div class="ms-tp ms-tp--rad">4,2 av 5</div><div class="ms-tp--kort"><strong>Bosse</strong><strong>Ann &amp; Co</strong></div>';
  assert.deepEqual(sidanBar(html, data), { rad: true, kort: true, poang: true, omdomen: 2 });
  assert.deepEqual(sidanBar('<p>hej</p>', data), { rad: false, kort: false, poang: false, omdomen: 0 });
});
