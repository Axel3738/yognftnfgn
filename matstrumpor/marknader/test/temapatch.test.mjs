import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grenFor, bytExakt, patchaFil, patchaMallJson, patchaJs, svenskaKvar } from '../temapatch.mjs';

const OV = {
  nb: { 'liquid.ms-paket.lada': 'Boks', 'liquid.ms-paket.gratis': 'gratis', 'liquid.ms-paket.valj_paket': 'Velg pakke', 'liquid.ms-paket.par': 'par', 'liquid.ms-paket.varde': 'verdi', 'liquid.ms-paket.gratis_pa_kopet': 'Gratis med på kjøpet', 'liquid.ms-paket.gratis_per_sushilada': 'Gratis per sushiboks', 'liquid.ms-paket.atpinnar_i_tra': 'Spisepinner i tre', 'liquid.ms-trust-row.fri_frakt': 'Fri frakt til Norge', 'liquid.ms-trust-row.oppet_kop': '30 dagers åpent kjøp', 'liquid.ms-trust-row.trygg_betalning': 'Trygg betaling', 'liquid.ms-compare.ja': 'Ja', 'liquid.ms-compare.nej': 'Nei', 'liquid.ms-compare.egenskap': 'Egenskap', 'liquid.ms-reviews.verifierat_kop': 'Verifisert kjøp', 'liquid.ms-delivery-estimate.arbetsdagar': 'virkedager', 'liquid.ms-delivery-estimate.beraknad_leverans': 'Beregnet levering', 'liquid.product.ms_storlek': 'Passer str. 36–44 · stretchy materiale', 'liquid.index.ugc_markning': 'Miljøbildene er AI-genererte illustrasjoner.' },
  en: { 'liquid.ms-paket.lada': 'Box', 'liquid.ms-paket.gratis': 'free', 'liquid.ms-paket.valj_paket': 'Choose a bundle', 'liquid.ms-paket.par': 'pairs', 'liquid.ms-paket.varde': 'value', 'liquid.ms-trust-row.fri_frakt': 'Free shipping', 'liquid.ms-trust-row.oppet_kop': '30-day returns', 'liquid.ms-trust-row.trygg_betalning': "Secure payment — it's safe", 'liquid.ms-compare.ja': 'Yes', 'liquid.ms-compare.nej': 'No', 'liquid.ms-delivery-estimate.arbetsdagar': 'business days', 'liquid.ms-delivery-estimate.beraknad_leverans': 'Estimated delivery', 'liquid.product.ms_storlek': 'Fits EU 36–44 · stretchy fabric', 'liquid.index.ugc_markning': 'Lifestyle images are AI-generated illustrations.' },
};

test('grenFor: svenskan i else, bara språk som har text, samma text som svenskan hoppas', () => {
  const g = grenFor('Ja', 'liquid.ms-compare.ja', OV);
  assert.equal(g, "{% case request.locale.iso_code %}{% when 'en' %}Yes{% else %}Ja{% endcase %}");
  assert.equal(grenFor('Nej', 'liquid.x', OV), null);
});

test('grenFor citat: apostrofer escapas i Liquid-strängar', () => {
  const g = grenFor('Trygg betalning', 'liquid.ms-trust-row.trygg_betalning', OV, { citat: true });
  assert.ok(g.includes("it\\'s"));
});

test('bytExakt kräver exakt antal och rör inte schemat', () => {
  const kod = 'a Ja b Ja {% schema %}{"label":"Ja"}';
  assert.equal(bytExakt(kod, 'Ja', 'X', 2), 'a X b X {% schema %}{"label":"Ja"}');
  assert.throws(() => bytExakt(kod, 'Ja', 'X', 1), /hittades 2/);
});

test('patchaFil ms-compare: Ja/Nej två gånger var, idempotent — Egenskap utan översättning står kvar (aldrig "null")', () => {
  const kod = '<span class="ms-sr">Egenskap</span><span class="ms-sr">Ja</span><span class="ms-sr">Nej</span><span class="ms-sr">Ja</span><span class="ms-sr">Nej</span>{% schema %}{"a":"Ja"}';
  const r = patchaFil('sections/ms-compare.liquid', kod, OV);
  // Fixturen har bara nb "Egenskap" = svenskan: ingen gren. Före 2026-09-29 blev det <span>null</span>.
  assert.deepEqual(r.byten, ['ja', 'nej']);
  assert.ok(r.hoppade.includes('egenskap: ingen översättning'));
  assert.ok(r.kod.includes('<span class="ms-sr">Egenskap</span>'));
  assert.ok(!r.kod.includes('null'));
  assert.equal((r.kod.match(/{% when 'en' %}Yes/g) ?? []).length, 2);
  assert.ok(r.kod.endsWith('{% schema %}{"a":"Ja"}'));
  const igen = patchaFil('sections/ms-compare.liquid', r.kod, OV);
  assert.deepEqual(igen.byten, []);
  assert.equal(igen.hoppade.length, 3);
});

test('patchaFil ms-sista-dag: raden visas bara på svenska', () => {
  const kod = "{%- liquid\n  assign rad = ''\n-%}\n{%- if rad != '' -%}\n<p>{{ rad }}</p>\n{%- endif -%}";
  const r = patchaFil('snippets/ms-sista-dag.liquid', kod, OV);
  assert.deepEqual(r.byten, ['sista_dag_bara_sv']);
  assert.ok(r.kod.includes("{%- if rad != '' and request.locale.iso_code == 'sv' -%}"));
});

test('patchaFil ms-trust-row: fallback-listan får ett case-block per språk med tre delar', () => {
  const kod = "{%- liquid\n  assign fallback = 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning'\n  assign rows = items | default: fallback | split: '|'\n-%}";
  const r = patchaFil('snippets/ms-trust-row.liquid', kod, OV);
  assert.deepEqual(r.byten, ['trust_row_fallback']);
  assert.ok(r.kod.includes("when 'nb'\n      assign fallback = 'truck:Fri frakt til Norge|refresh:30 dagers åpent kjøp|lock:Trygg betaling'"));
  assert.ok(r.kod.includes("lock:Secure payment — it\\'s safe'"));
  assert.ok(r.kod.includes('  endcase\n  assign rows'));
});

test('patchaFil ms-paket: alla åtta orden byts, ordet "par" bara i ätpinnarraden', () => {
  const kod = [
    '<div class="ms-paket__lista" role="radiogroup" aria-label="Välj paket">',
    '<span class="ms-paket__lada-etikett">Låda {{ n }}{% if n > betalda %} · gratis{% endif %}</span>',
    `<span class="ms-paket__gava-etikett">{% render 'ms-icon', name: 'gift' %} Gratis per sushilåda</span>`,
    '<span>Ätpinnar i trä · <span data-ms-paket-gava-antal>{{ gantal }}</span> par</span>',
    '<span class="ms-paket__gava-varde">värde <span data-ms-paket-gava-varde>{{ gvarde | money }}</span></span>',
    '<span class="ms-paket__gava-varde">värde {{ gvarde | money }}</span>',
    `<span class="ms-paket__gava-etikett">{% render 'ms-icon', name: 'gift' %} Gratis på köpet</span>`,
    'sparar par pengar',
  ].join('\n');
  const r = patchaFil('snippets/ms-paket.liquid', kod, OV);
  assert.equal(r.byten.length, 8);
  assert.ok(r.kod.includes('sparar par pengar'));
  assert.equal(svenskaKvar(r.kod).length, 0);
});

test('patchaMallJson product.json: trust-blocket blir capture + render med variabel, storleksraden får gren', () => {
  const mall = JSON.stringify({ sections: { main: { blocks: {
    ms_trust: { type: 'custom_liquid', settings: { custom_liquid: "{% render 'ms-trust-row', items: 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning' %}" } },
    ms_delivery: { type: 'custom_liquid', settings: { custom_liquid: "{% render 'ms-delivery-estimate', min_days: 5, max_days: 10, cutoff_hour: 0, text: 'Beräknad leverans' %}" } },
    ms_storlek: { type: 'custom_liquid', settings: { custom_liquid: '<p class="ms-storlek">Passar strl 36–44 · stretchigt material</p>' } },
  } } } }, null, 2);
  const r = patchaMallJson('templates/product.json', `/*\n * kommentar\n */\n${mall}`, OV);
  assert.deepEqual(r.byten, ['ms_trust', 'ms_delivery_text', 'ms_storlek']);
  assert.ok(r.kod.startsWith('/*\n * kommentar'));
  const j = JSON.parse(r.kod.replace(/^\s*\/\*[\s\S]*?\*\//, ''));
  const trust = j.sections.main.blocks.ms_trust.settings.custom_liquid;
  assert.ok(trust.includes("{% capture ms_trust_items %}{% case request.locale.iso_code %}{% when 'nb' %}truck:Fri frakt til Norge|refresh:30 dagers åpent kjøp|lock:Trygg betaling{% when 'en' %}truck:Free shipping|refresh:30-day returns|lock:Secure payment — it's safe{% else %}truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning{% endcase %}{% endcapture %}{% render 'ms-trust-row', items: ms_trust_items %}"));
  assert.ok(j.sections.main.blocks.ms_delivery.settings.custom_liquid.includes("text: ms_delivery_text %}"));
  assert.ok(j.sections.main.blocks.ms_storlek.settings.custom_liquid.includes("{% when 'en' %}Fits EU 36–44 · stretchy fabric{% else %}Passar strl 36–44 · stretchigt material{% endcase %}"));
  const igen = patchaMallJson('templates/product.json', r.kod, OV);
  assert.deepEqual(igen.byten, []);
});

test('patchaJs: språk ur <html lang>, valuta via Intl när den inte är butikens, idempotent', () => {
  const js = "(function () {\n  'use strict';\n\n  var TZ = 'Europe/Stockholm';\n  function money(cents, format) {\n    var f = format || '{{amount}} kr';\n    var utanOren = /no_decimals/i.test(f);\n    var kr = utanOren ? Math.round(cents / 100) : cents / 100;\n    var visaOren = !utanOren && Math.round(cents) % 100 !== 0;\n    var text = kr.toLocaleString('sv-SE', {\n      minimumFractionDigits: visaOren ? 2 : 0,\n      maximumFractionDigits: visaOren ? 2 : 0\n    });\n    return f.replace(/\\{\\{\\s*amount[a-z_]*\\s*\\}\\}/gi, text);\n  }\n  function svDate(date, withWeekday) {\n    return new Intl.DateTimeFormat('sv-SE', withWeekday\n      ? { weekday: 'long' } : { day: 'numeric' }).format(date);\n  }\n  function pad(n) { return n < 10 ? '0' + n : String(n); }\n  function ut(from, to, min, max) {\n    return (min === max)\n          ? svDate(from, true)\n          : svDate(from, false) + ' – ' + svDate(to, false);\n  }\n})();";
  const r = patchaJs(js);
  assert.deepEqual(r.byten, ['sprak', 'money', 'datum', 'intervall']);
  assert.ok(r.kod.includes('var LANG = (document.documentElement.lang'));
  assert.ok(r.kod.includes("new Intl.NumberFormat(LANG, { style: 'currency', currency: aktiv"));
  assert.ok(r.kod.includes('new Intl.DateTimeFormat(LANG, withWeekday'));
  assert.ok(!r.kod.includes("'sv-SE', {"));
  // Koden ska fortfarande vara giltig JavaScript.
  assert.doesNotThrow(() => new Function(r.kod));
  assert.deepEqual(patchaJs(r.kod).byten, []);
});

test('patchaJs: leveransfönstret i samma månad skriver månaden en gång, svenska som förut', () => {
  // Språket och beloppen är redan patchade här (var LANG, Intl.NumberFormat(LANG); bara datumdelarna prövas.
  const js = "(function () {\n  var TZ = 'Europe/Stockholm';\n  var LANG = 'sv-SE'; /* Intl.NumberFormat(LANG */\n  function svDate(date, withWeekday) {\n    return new Intl.DateTimeFormat('sv-SE', withWeekday\n      ? { weekday: 'long', day: 'numeric', month: 'long' }\n      : { day: 'numeric', month: 'long' }\n    ).format(date);\n  }\n  function pad(n) { return n < 10 ? '0' + n : String(n); }\n  var x = a ? b\n          : svDate(from, false) + ' – ' + svDate(to, false);\n})();";
  const r = patchaJs(js);
  assert.ok(r.byten.includes('intervall'));
  const hjalp = r.kod.match(/  function svDate[\s\S]*?\n  \}\n/)[0] + r.kod.match(/  var INTERVALL_SPRAK[\s\S]*?\n  function datumIntervall[\s\S]*?\n  \}\n/)[0];
  // Intl sätter smala mellanslag (U+2009) runt tankstrecket över ett månadsskifte; jämför med vanliga.
  const kor = (lang, a, b) => new Function('from', 'to', `var LANG = '${lang}';\n${hjalp}\nreturn datumIntervall(from, to);`)(a, b).replace(/[\u2009\u202f]/g, ' ');
  const d7 = new Date(2026, 9, 7), d14 = new Date(2026, 9, 14), d30 = new Date(2026, 9, 30), n6 = new Date(2026, 10, 6);
  assert.equal(kor('pl', d7, d14), '7–14 października');
  assert.equal(kor('de', d7, d14), '7.–14. Oktober');
  assert.equal(kor('pl', d30, n6), '30 października – 6 listopada', 'över månadsskiftet: båda månaderna');
  assert.equal(kor('sv-SE', d7, d14), '7 oktober – 14 oktober', 'svenskan som förut');
  assert.equal(kor('ja', d7, d14), '10月7日 – 10月14日', 'japanskan som förut, inga siffror med snedstreck');
  assert.equal(kor('it', d7, d14), '7 ottobre – 14 ottobre', 'italienskan som förut');
  assert.deepEqual(patchaJs(r.kod).byten, []);
});

test('patchaFil ms-paket: sortvalets aria-etikett får språkgren, citattecken escapas', () => {
  const kod = '<select class="ms-paket__sort" data-lada="{{ n }}" aria-label="Sort i låda {{ n }}">{{ sort_options }}</select>';
  const ov = { en: { 'liquid.ms-paket.sort_i_lada': 'Choose socks for box' }, fr: { 'liquid.ms-paket.sort_i_lada': 'Chaussettes de la "boîte"' } };
  const r = patchaFil('snippets/ms-paket.liquid', kod, ov);
  assert.deepEqual(r.byten, ['sort_i_lada']);
  assert.ok(r.kod.includes(`aria-label="{% case request.locale.iso_code %}{% when 'en' %}Choose socks for box{% when 'fr' %}Chaussettes de la &quot;boîte&quot;{% else %}Sort i låda{% endcase %} {{ n }}"`));
  assert.deepEqual(patchaFil('snippets/ms-paket.liquid', r.kod, ov).byten, []);
});

test('patchaPaketJs: köpknappens tre texter på kundens språk, svenskan som reserv, ordlistan byts på plats', async () => {
  const { patchaPaketJs } = await import('../temapatch.mjs');
  const js = [
    '(function () {', "  'use strict';", '', '  function kop() {',
    "      knapp.textContent = 'Lägger i…';",
    "              throw new Error(d.description || d.message || 'Kunde inte lägga i varukorgen.');",
    "          fel.textContent = e.message || 'Det gick inte att lägga i varukorgen. Försök igen.';",
    '  }', '  window.msTest = { kop: kop, text: function (n, sv) { return msPaketText(n, sv); } };', '})();',
  ].join('\n');
  const ov = { de: { 'liquid.ms-paket.js.lagger_i': 'Wird hinzugefügt …', 'liquid.ms-paket.js.fel_lagga_i': 'Konnte nicht in den Warenkorb gelegt werden.', 'liquid.ms-paket.js.fel_forsok_igen': 'Das hat nicht geklappt. Bitte versuche es erneut.' }, 'pt-PT': { 'liquid.ms-paket.js.lagger_i': 'A adicionar…' } };
  const r = patchaPaketJs(js, ov);
  assert.deepEqual(r.byten, ['ordlista', 'lagger_i', 'fel_lagga_i', 'fel_forsok_igen']);
  assert.ok(!/'Lägger i…';/.test(r.kod.replace("msPaketText('lagger_i', 'Lägger i…')", '')));
  // Giltig JS som slår upp <html lang>: de, pt-PT, och svenskan när språket saknas.
  const kor = (lang) => { const w = {}; new Function('window', 'document', r.kod)(w, { documentElement: { lang } }); return w.msTest; };
  assert.equal(kor('de').text('lagger_i', 'Lägger i…'), 'Wird hinzugefügt …');
  assert.equal(kor('pt-PT').text('lagger_i', 'Lägger i…'), 'A adicionar…');
  assert.equal(kor('pt-PT').text('fel_lagga_i', 'Kunde inte lägga i varukorgen.'), 'Kunde inte lägga i varukorgen.');
  assert.equal(kor('sv').text('lagger_i', 'Lägger i…'), 'Lägger i…');
  // Idempotent — och en ändrad översättning byter bara ordlistan.
  assert.deepEqual(patchaPaketJs(r.kod, ov).byten, []);
  const ov2 = { ...ov, de: { ...ov.de, 'liquid.ms-paket.js.lagger_i': 'Wird in den Warenkorb gelegt …' } };
  const r2 = patchaPaketJs(r.kod, ov2);
  assert.deepEqual(r2.byten, ['ordlista (uppdaterad)']);
  assert.equal(kor.call(null, 'de') && (() => { const w = {}; new Function('window', 'document', r2.kod)(w, { documentElement: { lang: 'de' } }); return w.msTest.text('lagger_i', 'x'); })(), 'Wird in den Warenkorb gelegt …');
});

test('patchaPaketJs: reservvägen landar i korgen på kundens språk, inte på domänens huvudspråk', async () => {
  // Granskningen 2026-09-30: "korgen blir engelsk". Reservvägen laddade om till
  // /discount/<kod>?redirect=/cart, och en ren /cart på matstrumpor.com är engelska.
  const { patchaPaketJs, patchaPaketKorg } = await import('../temapatch.mjs');
  const js = [
    '(function () {', "  'use strict';",
    '  window.msTest = function (rutt, kod) {',
    '    var gick = {};',
    "    function laddaOm() { gick.href = kod ? rutt + 'discount/' + encodeURIComponent(kod) + '?redirect=' + encodeURIComponent('/cart') : rutt + 'cart'; }",
    "    gick.fetch = rutt + 'discount/' + encodeURIComponent(kod) + '?redirect=' + encodeURIComponent('/cart.js');",
    "    if (false) { knapp.textContent = 'Lägger i…'; }",
    "    if (false) { throw new Error(d.description || d.message || 'Kunde inte lägga i varukorgen.'); }",
    "    if (false) { fel.textContent = e.message || 'Det gick inte att lägga i varukorgen. Försök igen.'; }",
    '    laddaOm(); return gick;',
    '  };', '})();',
  ].join('\n');
  const ov = { de: { 'liquid.ms-paket.js.lagger_i': 'Wird hinzugefügt …' } };
  const r = patchaPaketJs(js, ov);
  assert.ok(r.byten.some((b) => b.startsWith('korgens språkmapp')), r.byten.join(', '));
  assert.ok(!r.kod.includes("encodeURIComponent('/cart')") && !r.kod.includes("encodeURIComponent('/cart.js')"));
  const kor = (kod, rutt, rabatt) => { const w = {}; new Function('window', 'document', kod)(w, { documentElement: { lang: 'de' } }); return w.msTest(rutt, rabatt); };
  assert.equal(kor(r.kod, '/de/', 'SUSHI-K2F2').href, '/de/discount/SUSHI-K2F2?redirect=%2Fde%2Fcart');
  assert.equal(kor(r.kod, '/zh-tw/', 'SUSHI-K2F2').fetch, '/zh-tw/discount/SUSHI-K2F2?redirect=%2Fzh-tw%2Fcart.js');
  assert.equal(kor(r.kod, '/', 'SUSHI-K2F2').href, '/discount/SUSHI-K2F2?redirect=%2Fcart', 'huvudspråket (roten) ska fortfarande landa på /cart');
  // Idempotent: andra körningen byter ingenting.
  assert.deepEqual(patchaPaketJs(r.kod, ov).byten, []);
  assert.deepEqual(patchaPaketKorg(r.kod).byten, []);
  // Utan översättningar lagas korgen ändå.
  assert.ok(patchaPaketJs(js, {}).byten.some((b) => b.startsWith('korgens språkmapp')));
});

test('fabrikens ms-paket.js skickar aldrig kunden till en korg utan språkmapp', async () => {
  const { readFileSync } = await import('node:fs');
  const kod = readFileSync(new URL('../../../factory/tema/assets/ms-paket.js', import.meta.url), 'utf8');
  assert.ok(!/encodeURIComponent\('\/cart(\.js)?'\)/.test(kod), "factory/tema/assets/ms-paket.js bär en '/cart' utan rutt");
});

test('patchaMallJson: en gren byggd med en äldre översättning byts på plats mot den nya', () => {
  const mall = JSON.stringify({ sections: { main: { blocks: { ms_storlek: { type: 'custom_liquid', settings: { custom_liquid: '<p class="ms-storlek">Passar strl 36–44 · stretchigt material</p>' } } } } } }, null, 2);
  const gammal = { en: { 'liquid.product.ms_storlek': 'Fits EU 36–44 · stretchy fabric' } };
  const ny = { en: { 'liquid.product.ms_storlek': 'Fits EU sizes 36–44 · stretchy fabric' } };
  const v1 = patchaMallJson('templates/product.json', mall, gammal).kod;
  // Utan den gamla versionen går det inte att hitta grenen — steget stannar hellre än gissar.
  assert.throws(() => patchaMallJson('templates/product.json', v1, ny), /redan en språkgren/);
  const r = patchaMallJson('templates/product.json', v1, ny, {}, [gammal]);
  assert.deepEqual(r.byten, ['ms_storlek (uppdaterad)']);
  assert.ok(r.kod.includes("{% when 'en' %}Fits EU sizes 36–44 · stretchy fabric{% else %}Passar strl 36–44"));
  assert.ok(!r.kod.includes('Fits EU 36–44'));
  assert.deepEqual(patchaMallJson('templates/product.json', r.kod, ny, {}, [gammal]).byten, []);
});

test('patchaMallJson: en rad utan omslag (bildmarkeringen) uppdateras på plats — aldrig en ny gren inuti den gamla', () => {
  const mall = JSON.stringify({ sections: { m: { type: 'custom_liquid', settings: { custom_liquid: '<p class="ms-ugc-markning">Miljöbilderna är AI-genererade illustrationer.</p>' } } } }, null, 2);
  const gammal = { en: { 'liquid.index.ugc_markning': 'The lifestyle images are AI-generated illustrations.' } };
  const ny = { en: { 'liquid.index.ugc_markning': 'These lifestyle images are AI-generated illustrations.' } };
  const v1 = patchaMallJson('templates/index.json', mall, gammal).kod;
  const r = patchaMallJson('templates/index.json', v1, ny, {}, [gammal]);
  assert.deepEqual(r.byten, ['ugc_markning (uppdaterad)']);
  assert.equal((r.kod.match(/case request\.locale\.iso_code/g) ?? []).length, 1, 'en enda case-sats');
  assert.ok(r.kod.includes('These lifestyle images'));
  // Utan känd gammal version: stopp — inte en ny case-sats i else-grenen.
  assert.throws(() => patchaMallJson('templates/index.json', v1, ny), /redan en språkgren/);
});
