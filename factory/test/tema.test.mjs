// Tester för metafälten och temats sektioner. Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { kundUnderrubrik, byggKortBeskrivning } from '../sida.mjs';
import { byggMetafalt, snittbetyg } from '../metafalt.mjs';
import { byggJudgeMeCsv, byggJudgeMeAppCsv, judgeMeDatum, JUDGEME_KOLUMNER, JUDGEME_APP_KOLUMNER } from '../judgeme.mjs';
import { fileURLToPath } from 'node:url';
import {
  SEKTIONER,
  opfMedia,
  OPF_MEDIA_SKRIPT,
  SEKTIONSORDNING_TEMA,
  TEMAFILER,
  byggProduktTemplate,
  byggHeaderGroup,
  annonsrader,
  rensaSettings,
  settingsSchemaMedAb,
  patchaMsPaket,
  msHeadGallerifilter,
  GALLERIFILTER_MARKE,
  leveransdagar,
  fraktRad,
  paketBlock,
  paketTest,
  gemensamtPaketTest,
  STANDARD_PAKETTEST,
  harTillagg,
  tillaggTexter,
  JUDGEME_EMBED,
} from '../tema.mjs';
import { dummy, medButiksfrakt, rabutik } from './hjalp.mjs';
import { execFileSync } from 'node:child_process';

const ZIP = fileURLToPath(new URL('../tema/ops-tema.zip', import.meta.url));
const urZip = (fil) => execFileSync('unzip', ['-p', ZIP, fil], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });

// Det SMUTSIGA bas-temat som fixtur. Källan rensades 2026-09-09
// (factory/rensa-kalla.mjs), så den bär inget att hitta längre — men de här
// testerna ska bevisa att funktionerna STÄDAR smutsig indata. Mot en ren zip
// hade de blivit gröna för att det inte fanns något att städa, vilket är
// samma falska grönt som gav "14 gröna, 0 fel" på en trasig butik.
const urSmutsigt = (fil) =>
  readFileSync(fileURLToPath(new URL(`./fixtur-smutsigt-tema/${fil}`, import.meta.url)), 'utf8');

const butikMedNorge = () => {
  const b = rabutik();
  b.butik.marknader = [{ land: 'NO', locale: 'nb', valuta: 'NOK' }];
  return b;
};

const falt = (p) => Object.fromEntries(byggMetafalt(p, { kundUnderrubrik }).map((m) => [m.key, m]));

test('metafälten ligger i namespace opf med rätt typer', () => {
  const m = falt(dummy());
  assert.equal(m.benefits.namespace, 'opf');
  assert.equal(m.benefits.type, 'list.single_line_text_field');
  assert.equal(m.problem_rubrik.type, 'single_line_text_field');
  assert.equal(m.problem_text.type, 'multi_line_text_field');
  assert.equal(m.gif_problem.type, 'url');
  assert.equal(m.faq.type, 'json');
});

test('beskrivningsblockens metafält bär text och media ur produktfilen', () => {
  const m = falt(dummy());
  assert.equal(m.problem_rubrik.value, 'Klockan är 15 och nacken är redan stel.');
  assert.ok(m.gif_problem.value.endsWith('nackmagneten-problem.gif'));
  assert.ok(m.media_losning.value.endsWith('nackmagneten-losning.gif'));
  assert.ok(m.bild_lifestyle.value.endsWith('nackmagneten-soffa.jpg'));
});

test('recensioner blir ALDRIG ett metafält — de ägs av Judge.me', () => {
  const m = falt(dummy());
  assert.ok(!('reviews' in m));
});

test('listfält skickas som JSON-arrayer', () => {
  const m = falt(dummy());
  assert.deepEqual(JSON.parse(m.benefits.value), [
    'Löser upp spänningarna på 10 minuter hemma i soffan',
    'Engångskostnad i stället för återkommande massagebesök',
  ]);
});

// Fraktraderna kommer ur butikskonfigen, så testet ändrar den och inte produkten.
test('fraktraderna byggs av butikens betalda frakt och fri frakt-gräns', () => {
  const p = medButiksfrakt({
    leveranstid: '5–8 arbetsdagar',
    fri_globalt: false,
    standardpris: 39,
    fri_over: 499,
    express: { aktiv: true, namn: 'Express', pris: 99, tid: '1–2 arbetsdagar' },
  });
  assert.deepEqual(JSON.parse(falt(p).frakt.value), [
    'Leveranstid: 5–8 arbetsdagar',
    'Frakt: 39 kr',
    'Fri frakt över 499 kr',
    'Express: 99 kr, 1–2 arbetsdagar',
  ]);
});

test('fri frakt globalt skrivs ut som fri frakt, inte 0 kr', () => {
  const p = medButiksfrakt({ leveranstid: '5–8 arbetsdagar', fri_globalt: true });
  const rader = JSON.parse(falt(p).frakt.value);
  assert.ok(rader.includes('Fri frakt till alla länder'));
  assert.ok(!rader.some((r) => r.includes('0 kr')));
});

test('tomma fält skickas inte alls', () => {
  const p = dummy();
  p.features = [];
  p.media.bild_lifestyle = '';
  const m = falt(p);
  assert.ok(!('features' in m));
  assert.ok(!('bild_lifestyle' in m));
});

test('url-metafält kräver riktiga URL:er', () => {
  const p = dummy();
  p.media.gif_problem = 'inte-en-url.gif';
  assert.ok(!('gif_problem' in falt(p)));
});

test('snittbetyget räknas ur recensionerna', () => {
  assert.deepEqual(snittbetyg(dummy()), { snitt: 4.7, antal: 3 });
  assert.equal(snittbetyg({ reviews: [] }), null);
});

// --- Judge.me-underlaget ---

test('judgeme-csv har husets kolumner och en rad per recension', () => {
  const csv = byggJudgeMeCsv(dummy());
  const rader = csv.trim().split('\n');
  assert.equal(rader[0], JUDGEME_KOLUMNER.join(','));
  assert.equal(rader.length, 1 + 3);
  assert.ok(rader[1].includes('"Första natten på månader jag sovit utan värk."'));
  assert.ok(rader[1].includes('"Eva L."'));
});

test('judgeme-csv hittar aldrig på datum eller mejl — fälten lämnas tomma', () => {
  const csv = byggJudgeMeCsv(dummy());
  const kolumner = csv.trim().split('\n')[1].split('","');
  const datum = kolumner[JUDGEME_KOLUMNER.indexOf('review_date')];
  const mejl = kolumner[JUDGEME_KOLUMNER.indexOf('reviewer_email')];
  assert.equal(datum, '');
  assert.equal(mejl, '');
});

test('judgeme-csv klämmer betyg till 1–5 och citerar citattecken', () => {
  const p = dummy();
  p.reviews = [{ namn: 'X', betyg: 9, text: 'Sa "wow" direkt' }];
  const csv = byggJudgeMeCsv(p);
  assert.ok(csv.includes('"5"'));
  assert.ok(csv.includes('"Sa ""wow"" direkt"'));
});

test('judgeme-csv är null utan recensioner', () => {
  assert.equal(byggJudgeMeCsv({ produkt: { id: 'x' }, reviews: [] }), null);
});

// Appens importfil: originaldatum i dd/mm/yyyy, produkt-id + handle, och de
// översatta raderna i samma fil. Utan datum stoppar den — aldrig "nyss".
test('judgeme-app-csv skriver källans datum som dd/mm/yyyy med produkt-id och handle', () => {
  const p = { produkt: { id: 'tankoverdraget' }, reviews: [{ namn: 'Anders', betyg: 5, text: 'Bra', titel: 'Bra produkt', datum: '2026-08-10' }] };
  const csv = byggJudgeMeAppCsv(p, { produktId: '15989715108184', oversattningar: { nb: { 'recension.0.text': 'Bra trekk', 'recension.0.namn': 'Kari' } } });
  const rader = csv.trim().split('\n');
  assert.equal(rader[0], JUDGEME_APP_KOLUMNER.join(','));
  assert.equal(rader.length, 3);
  assert.ok(rader[1].includes('"10/08/2026"') && rader[1].includes('"15989715108184"') && rader[1].includes('"tankoverdraget"'));
  assert.ok(rader[2].includes('"Kari"') && rader[2].includes('"Bra trekk"') && rader[2].includes('"10/08/2026"'));
});

test('judgeme-app-csv stoppar på en recension utan originaldatum', () => {
  const p = { produkt: { id: 'x' }, reviews: [{ namn: 'Utan', betyg: 5, text: 'Hej' }] };
  assert.throws(() => byggJudgeMeAppCsv(p), /saknar originaldatum/);
  assert.equal(judgeMeDatum('2026-08-19T08:00:00.000Z'), '19/08/2026');
  assert.equal(judgeMeDatum('nyss'), null);
  assert.equal(judgeMeDatum('2026-13-01'), null);
});

// --- Temafilerna ---

test('sektionerna är exakt beskrivningsstrukturens sex filer', () => {
  assert.deepEqual(Object.keys(SEKTIONER).sort(), [
    'sections/opf-faq.liquid',
    'sections/opf-funktioner.liquid',
    'sections/opf-garanti.liquid',
    'sections/opf-lifestyle.liquid',
    'sections/opf-losning.liquid',
    'sections/opf-problem.liquid',
  ]);
  for (const [namn, innehall] of Object.entries(SEKTIONER)) {
    assert.ok(innehall.includes('{% schema %}'), `${namn} saknar schema`);
    assert.ok(/"name":\s*"OPF/.test(innehall), `${namn} saknar namn`);
  }
});

test('det finns ingen egen recensionssektion och ingen egen sticky', () => {
  assert.ok(!('sections/opf-reviews.liquid' in SEKTIONER));
  assert.ok(!('sections/opf-sticky-atc.liquid' in SEKTIONER));
  for (const innehall of Object.values(SEKTIONER)) {
    assert.ok(!innehall.includes('opf.reviews'), 'en sektion läser reviews-metafältet');
  }
});

test('sektionerna läser opf-metafälten och använder temats ms-klasser', () => {
  assert.ok(SEKTIONER['sections/opf-problem.liquid'].includes('product.metafields.opf.problem_rubrik'));
  assert.ok(SEKTIONER['sections/opf-losning.liquid'].includes('product.metafields.opf.media_losning'));
  assert.ok(SEKTIONER['sections/opf-faq.liquid'].includes('product.metafields.opf.faq'));
  for (const [namn, innehall] of Object.entries(SEKTIONER)) {
    assert.ok(innehall.includes('ms-scope'), `${namn} saknar ms-scope (temats designtokens)`);
  }
});

test('media-sektionerna döljer sig utan media i stället för att rendera trasigt', () => {
  // Villkoret läser metafältet direkt sedan 2026-09-09 (renderingen väljer
  // video eller bild på filändelsen, så mellanvariabeln föll bort). Kravet är
  // detsamma: tomt fält = ingen tagg alls, aldrig en tom src.
  const lifestyle = SEKTIONER['sections/opf-lifestyle.liquid'];
  assert.ok(/if product\.metafields\.opf\.bild_lifestyle\.value != blank/.test(lifestyle));
  const problem = SEKTIONER['sections/opf-problem.liquid'];
  assert.ok(/if product\.metafields\.opf\.gif_problem\.value != blank/.test(problem), 'median ska villkoras, aldrig tom src');
  const losning = SEKTIONER['sections/opf-losning.liquid'];
  assert.ok(/if product\.metafields\.opf\.media_losning\.value != blank/.test(losning));
});

test('produkttemplaten lägger innehållsblocken efter main och FAQ:n efter Judge.me', () => {
  const original = JSON.stringify({
    sections: {
      main: { type: 'main-product', settings: {} },
      judgeme_widget: { type: 'apps', settings: {} },
      ms_sticky: { type: 'ms-sticky-atc', settings: {} },
    },
    order: ['main', 'judgeme_widget', 'ms_sticky'],
  });
  const ut = JSON.parse(byggProduktTemplate(original));
  assert.deepEqual(ut.order, [
    'main',
    'opf_problem',
    'opf_losning',
    'opf_funktioner',
    'opf_lifestyle',
    'opf_garanti',
    'judgeme_widget',
    'opf_faq',
    'ms_sticky',
  ]);
  assert.equal(ut.sections.ms_sticky.type, 'ms-sticky-atc');
});

test('produkttemplaten städar bort temats hårdkodade FAQ och gamla opf-sektioner', () => {
  const original = JSON.stringify({
    sections: {
      main: { type: 'main-product', settings: {} },
      ms_faq_section: { type: 'ms-faq-section', blocks: {}, settings: {} },
      opf_reviews: { type: 'opf-reviews', settings: {} },
    },
    order: ['main', 'opf_reviews', 'ms_faq_section'],
  });
  const ut = JSON.parse(byggProduktTemplate(original));
  assert.ok(!('ms_faq_section' in ut.sections));
  assert.ok(!('opf_reviews' in ut.sections));
  assert.equal(ut.order.filter((id) => id === 'opf_faq').length, 1);
});

test('produkttemplaten klarar Shopifys autogenererade kommentar och körs om utan dubbletter', () => {
  const original = `/*\n * auto-generated\n */\n${JSON.stringify({
    sections: { main: { type: 'main-product', settings: {} } },
    order: ['main'],
  })}`;
  const forsta = byggProduktTemplate(original);
  const andra = JSON.parse(byggProduktTemplate(forsta));
  assert.equal(andra.order.filter((id) => id === 'opf_faq').length, 1);
  assert.equal(andra.order.length, 1 + SEKTIONSORDNING_TEMA.length);
});

test('produktbeskrivningen är kort och dubblerar inte sektionerna', () => {
  const html = byggKortBeskrivning(dummy());
  assert.ok(html.includes('Stel nacke efter en dag vid skärmen'));
  assert.ok(!html.includes('Vanliga frågor'));
  assert.ok(!html.includes('opf-sticky'));
  assert.ok(html.length < 500);
});

test('sektionerna innehåller inga backslash-escaper', () => {
  // En CSS-escape som "\2212" blir "\\2212" på vägen genom JSON till Shopify
  // och renderas då som text. Använd literala tecken i stället.
  for (const [namn, innehall] of Object.entries(SEKTIONER)) {
    assert.ok(!innehall.includes('\\'), `${namn} innehåller en backslash`);
  }
});

test('hårdkodad icon-with-text plockas bort ur produktmallen', () => {
  const original = JSON.stringify({
    sections: {
      main: {
        type: 'main-product',
        blocks: {
          price: { type: 'price', settings: {} },
          'icon-row': { type: 'icon-with-text', settings: { heading_1: 'Fri frakt över 499 kr' } },
        },
        block_order: ['price', 'icon-row'],
        settings: {},
      },
    },
    order: ['main'],
  });
  const ut = JSON.parse(byggProduktTemplate(original));
  assert.ok(!('icon-row' in ut.sections.main.blocks));
  // Svensk varumärkes-strip (opf_svensk) läggs alltid till i main-blocken.
  assert.deepEqual(ut.sections.main.block_order, ['price', 'opf_svensk']);
});

// --- Köprutans JS: varukorgsbuggen 2026-09-09 ------------------------------
// Buggen kostade riktiga pengar på två butiker som stod live. Testerna finns
// för att den inte ska kunna smyga tillbaka via en ny bas-zip eller en klon.

test('fabriken äger ms-paket.js och skriver den till varje butik', () => {
  assert.ok(TEMAFILER['assets/ms-paket.js'], 'ms-paket.js ska ligga i TEMAFILER');
  assert.ok(TEMAFILER['assets/ms-paket.js'].includes('ms-paket.js — paketnivåerna'));
});

test('bas-zip:ens ms-paket.js är samma fil som fabrikens', async () => {
  // En zip som halkat efter ger nya butiker den gamla, trasiga koden.
  const { execFileSync } = await import('node:child_process');
  const url = new URL('../tema/ops-tema.zip', import.meta.url);
  const ur_zip = execFileSync('unzip', ['-p', fileURLToPath(url), 'assets/ms-paket.js'], {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(ur_zip, TEMAFILER['assets/ms-paket.js']);
});

test('gömt A/B-kort köper aldrig, och samma submit körs bara en gång', () => {
  const js = TEMAFILER['assets/ms-paket.js'];
  // A/B-motorn gömmer förloraren med hidden i stället för att ta bort den.
  assert.match(js, /doljd\(\)\s*\{/);
  assert.match(js, /if \(this\.doljd\(\)\) return;/);
  assert.match(js, /if \(ev\.msPaketHanterad\) return;/);
  // stopPropagation når inte syskonlyssnaren på samma nod.
  assert.match(js, /ev\.stopImmediatePropagation\(\);/);
  assert.ok(!/ev\.stopPropagation\(\);/.test(js), 'stopPropagation räcker inte här');
  // Det gömda kortet ska inte heller skriva antal i det delade formuläret.
  assert.match(js, /if \(this\.form && !this\.doljd\(\)\)/);
});

test('varorna läggs i FÖRE rabattkoden — koden fäster inte på en tom vagn', () => {
  const js = TEMAFILER['assets/ms-paket.js'];
  const add = js.indexOf("fetch(rutt + 'cart/add.js'");
  // Bara koden i själva köpkedjan räknas — reservvägen laddaOm() pekar också
  // på /discount, men den skickar kunden till /cart och ligger tidigare i filen.
  const rabatt = js.indexOf("encodeURIComponent('/cart.js')");
  assert.ok(add > 0 && rabatt > 0, 'båda anropen ska finnas');
  assert.ok(add < rabatt, 'cart/add.js måste komma före /discount/<kod>');
  // Lådan hämtas färsk efter att koden fäst, annars visar den fullpris.
  assert.match(js, /rutt \+ '\?sections=' \+ idn/);
});

// --- Köprutan ur konfigen (förenat ur tema-mall.mjs 2026-09-09, KEDJAN.md) ---

test('utan produkt/butik rörs inte köprutans block — bara opf-sektionerna läggs till', () => {
  const ut = JSON.parse(byggProduktTemplate(urSmutsigt('templates/product.json')));
  const bo = ut.sections.main.block_order;
  assert.ok(bo.includes('ms_paket') && !bo.includes('ms_paket_a'));
  assert.ok(ut.sections.main.blocks.ms_trust.settings.custom_liquid.includes('Fri frakt i Sverige'));
});

test('med offer.paket.test byggs A/B-paketblocken på ms_pakets plats, plus fullpris-kryssrutan när bonusen säger det', () => {
  const produkt = { offer: { paket: { test: 'paket' }, bonus_produkt: { handle: 'skyltar', tillagg_kryssruta: true, kortnamn: 'varningsskyltar' } }, varianter: [] };
  const ut = JSON.parse(byggProduktTemplate(urZip('templates/product.json'), { produkt, butik: butikMedNorge() }));
  const main = ut.sections.main;
  const bo = main.block_order;
  assert.ok(!bo.includes('ms_paket'));
  assert.equal(bo.indexOf('ms_paket_a'), bo.indexOf('variant_picker') + 1);
  assert.deepEqual(bo.slice(bo.indexOf('ms_paket_a'), bo.indexOf('ms_paket_a') + 4), ['ms_paket_a', 'ms_paket_b', 'opf_tillagg', 'buy_buttons']);
  assert.ok(main.blocks.ms_paket_a.settings.custom_liquid.includes("variant: 'a'"));
  assert.ok(main.blocks.ms_paket_b.settings.custom_liquid.includes("test: 'paket', variant: 'b'"));
  assert.equal(main.blocks.opf_tillagg.settings.custom_liquid, "{% render 'opf-tillagg' %}");
  assert.ok(harTillagg(produkt));
  assert.deepEqual(tillaggTexter(produkt), { label: 'Lägg till varningsskyltar', info: 'Fullpris – gratis bara i paketen' });
  // Idempotent: andra varvet ger samma blockordning.
  const igen = JSON.parse(byggProduktTemplate(JSON.stringify(ut), { produkt, butik: butikMedNorge() }));
  assert.deepEqual(igen.sections.main.block_order, bo);
});

test('utan eget test: standardstegen är a/b under "paket" — mallen bygger A/B-blocken med SAMMA namn', () => {
  // Till 2026-09-10 använde mallen '' medan paket.mjs skrev nivåer under
  // "paket" — ms-paket.liquid renderade då noll nivåer (TackleBay).
  const blk = paketBlock('', 'product', { tillagg: false });
  assert.deepEqual(Object.keys(blk), ['ms_paket'], 'tomt test ger fortfarande ett enkelt block när det begärs uttryckligen');
  assert.equal(paketTest({ offer: {}, varianter: [] }), STANDARD_PAKETTEST);
  assert.equal(paketTest({ offer: { paket: { nivaer: [{ antal: 1 }] } } }), '', 'egna nivåer utan test = inget A/B');
  assert.equal(paketTest({ offer: { paket: { test: 'buybox' } } }), 'buybox');
  const ut = JSON.parse(byggProduktTemplate(urZip('templates/product.json'), { produkt: { offer: {}, varianter: [] } }));
  const bo = ut.sections.main.block_order;
  assert.ok(bo.includes('ms_paket_a') && bo.includes('ms_paket_b') && !bo.includes('ms_paket') && !bo.includes('opf_tillagg'));
  assert.ok(ut.sections.main.blocks.ms_paket_b.settings.custom_liquid.includes("test: 'paket', variant: 'b'"));
});

test('flerprodukt: gemensamt test ger A/B-blocken i den delade mallen, olika test ger inga', () => {
  const p1 = { offer: {}, varianter: [] };
  const p2 = { offer: { bonus_produkt: { handle: 'x', tillagg_kryssruta: true, kortnamn: 'x' } }, varianter: [] };
  assert.equal(gemensamtPaketTest([p1, p2]), 'paket');
  assert.equal(gemensamtPaketTest([p1, { offer: { paket: { test: 'annat' } } }]), null);
  assert.equal(gemensamtPaketTest([]), null);
  const ut = JSON.parse(byggProduktTemplate(urZip('templates/product.json'), { produkter: [p1, p2], butik: butikMedNorge() }));
  const bo = ut.sections.main.block_order;
  assert.ok(bo.includes('ms_paket_a') && bo.includes('ms_paket_b'), 'paketblocken finns i flerproduktsmallen');
  assert.ok(!bo.includes('opf_tillagg'), 'fullpris-kryssrutan är produktbunden och byggs inte i en delad mall');
  assert.ok(ut.sections.main.blocks.ms_paket_a.settings.custom_liquid.includes('product: product'), 'Liquid filtrerar på product.id själv');
  // Olika test: inga block, och den gamla ms_paket lämnas kvar som temat hade den.
  const utan = JSON.parse(byggProduktTemplate(urZip('templates/product.json'), { produkter: [p1, { offer: { paket: { test: 'annat' } } }], butik: butikMedNorge() }));
  assert.ok(!utan.sections.main.block_order.includes('ms_paket_a'));
  // Idempotent.
  const igen = JSON.parse(byggProduktTemplate(JSON.stringify(ut), { produkter: [p1, p2], butik: butikMedNorge() }));
  assert.deepEqual(igen.sections.main.block_order, bo);
});

test('trygghetsraden och leveransdagarna kommer ur butiks-/produktfilen, med norsk gren', () => {
  const produkt = { offer: {}, varianter: [], leveranstid: '6–10 arbetsdagar' };
  const nb = { 'liquid.trust.0': 'Gratis frakt – Sverige & Norge', 'liquid.delivery.text': 'Beregnet levering' };
  const ut = JSON.parse(byggProduktTemplate(urZip('templates/product.json'), { produkt, butik: butikMedNorge(), nb }));
  const trust = ut.sections.main.blocks.ms_trust.settings.custom_liquid;
  assert.ok(trust.includes("items: 'truck:Fri frakt – Sverige & Norge|refresh:14 dagars ångerrätt|lock:Trygg betalning'"));
  assert.ok(trust.includes("request.locale.iso_code == 'nb'") && trust.includes('truck:Gratis frakt – Sverige & Norge'));
  assert.ok(!trust.includes('30 dagars öppet köp') && !trust.includes('Fri frakt i Sverige'));
  const lev = ut.sections.main.blocks.ms_delivery.settings.custom_liquid;
  assert.ok(lev.includes('min_days: 6, max_days: 10'));
  assert.ok(lev.includes('Beregnet levering') && lev.includes('6–10 virkedager'));
  assert.deepEqual(leveransdagar('5–8 arbetsdagar'), { min: 5, max: 8 });
  assert.deepEqual(leveransdagar('7 dagar'), { min: 7, max: 7 });
});

test('Judge.me-widgeten flyttar in i temats Appyta (ms-app-slot) med blocken kvar, och FAQ:n ligger efter', () => {
  const ut = JSON.parse(byggProduktTemplate(urZip('templates/product.json'), { butik: rabutik() }));
  assert.equal(ut.sections.judgeme_widget.type, 'ms-app-slot');
  assert.deepEqual(Object.keys(ut.sections.judgeme_widget.blocks), ['w']);
  assert.equal(ut.order.indexOf('opf_faq'), ut.order.indexOf('judgeme_widget') + 1);
  assert.ok(!('ms_faq_section' in ut.sections), 'källbutikens FAQ ska bort');
});

test('produkt med riktiga varianter får variantväljaren synlig', () => {
  const med = JSON.parse(byggProduktTemplate(urZip('templates/product.json'), { produkt: dummy() }));
  assert.equal(med.sections.main.settings.hide_variants, false);
  const utan = JSON.parse(byggProduktTemplate(urZip('templates/product.json'), { produkt: { offer: {}, varianter: [] } }));
  assert.equal(utan.sections.main.settings.hide_variants, true);
});

// --- header-group ---

test('annonsraden byggs ur butikens egna villkor, med länderna synliga', () => {
  const b = butikMedNorge();
  assert.equal(fraktRad(b), 'Fri frakt – Sverige & Norge');
  assert.deepEqual(annonsrader(b), ['Fri frakt – Sverige & Norge', '14 dagars ångerrätt', 'Trygg betalning med Klarna']);
  b.startsida = { usp: ['truck:Fri frakt', 'shield:2 års garanti', 'star:Bäst i test', 'lock:Fjärde raden'] };
  assert.deepEqual(annonsrader(b), ['Fri frakt', '2 års garanti', 'Bäst i test']);
});

test('byggHeaderGroup på zip:ens riktiga header-group: källannonserna ersätts, väljarna på när butiken har fler marknader', () => {
  const ut = JSON.parse(byggHeaderGroup(butikMedNorge(), { befintlig: urZip('sections/header-group.json') }));
  const bar = ut.sections['announcement-bar'];
  assert.deepEqual(bar.block_order, ['opf_a1', 'opf_a2', 'opf_a3']);
  assert.equal(bar.blocks.opf_a1.settings.text, 'Fri frakt – Sverige & Norge');
  assert.ok(!JSON.stringify(ut).includes('Levereras presentklart'));
  assert.equal(bar.settings.enable_language_selector, true);
  assert.equal(ut.sections.header.settings.enable_country_selector, true);
  assert.equal(ut.sections.header.settings.menu, 'main-menu');
  assert.deepEqual(ut.order, ['announcement-bar', 'header']);
});

test('byggHeaderGroup utan befintlig fil bygger gruppen från skelettet; en marknad = väljarna av', () => {
  const ut = JSON.parse(byggHeaderGroup(rabutik()));
  assert.deepEqual(ut.order, ['announcement-bar', 'header']);
  assert.equal(ut.sections['announcement-bar'].blocks.opf_a1.settings.text, 'Fri frakt i Sverige');
  assert.equal(ut.sections['announcement-bar'].settings.enable_language_selector, false);
  assert.equal(ut.sections.header.settings.enable_language_selector, false);
});

// --- rensaSettings ---

test('rensaSettings på zip:ens riktiga settings_data: sociala länkar tömda, brand-text, enbart Judge.me, källoggan bort', () => {
  const b = butikMedNorge();
  b.branding = { positionering: 'Nackvärk borta på 10 minuter' };
  const j = rensaSettings(JSON.parse(urSmutsigt('config/settings_data.json')), { butik: b, produkt: { offer: { paket: { test: 'paket' } } } });
  const c = j.current;
  for (const k of Object.keys(c).filter((x) => /^social_.*_link$/.test(x))) assert.equal(c[k], '', k);
  assert.equal(c.brand_description, '<p>Nackvärk borta på 10 minuter</p>');
  assert.deepEqual(Object.keys(c.blocks), ['judgeme_karna']);
  assert.equal(c.blocks.judgeme_karna.type, JUDGEME_EMBED);
  assert.equal(c.logo, '');
  assert.equal(c.brand_image, '');
  assert.equal(c.ms_ab_tests, 'paket');
  assert.equal(c.currency_code_enabled, true, 'NOK-marknad ⇒ valutakoden visas');
  assert.ok('Matstrumpor' in j.presets, 'presetnamnet är avbranda.stadaSettings sak, inte rensaSettings');
});

test('rensaSettings sätter logga/favicon när de ges och lämnar en riktig logga i fred annars', () => {
  const med = rensaSettings({ current: { logo: 'x', blocks: {} } }, { logga: 'shopify://shop_images/a-logga.png', favicon: 'shopify://shop_images/a-favicon.png' });
  assert.equal(med.current.logo, 'shopify://shop_images/a-logga.png');
  assert.equal(med.current.brand_image, 'shopify://shop_images/a-logga.png');
  assert.equal(med.current.favicon, 'shopify://shop_images/a-favicon.png');
  const kvar = rensaSettings(med, {});
  assert.equal(kvar.current.logo, 'shopify://shop_images/a-logga.png');
  // Utan butik: tom brand-text, Judge.me-inbäddningen läggs till ändå. Sträng in ⇒ sträng ut.
  const tom = rensaSettings({ current: {} }, {});
  assert.equal(tom.current.brand_description, '');
  assert.deepEqual(Object.keys(tom.current.blocks), ['judgeme_karna']);
  assert.equal(typeof rensaSettings('{"current":{}}', {}), 'string');
  assert.equal(typeof rensaSettings({ current: {} }, {}), 'object');
});

test('Klaviyo-inbäddningen åker ut, Judge.me behålls med sitt id', () => {
  const j = rensaSettings({ current: { blocks: { klaviyo: { type: 'shopify://apps/klaviyo-email-marketing-sms/blocks/x/1', disabled: false }, judgeme_karna: { type: JUDGEME_EMBED, disabled: true } } } }, {});
  assert.deepEqual(Object.keys(j.current.blocks), ['judgeme_karna']);
  assert.equal(j.current.blocks.judgeme_karna.disabled, false);
});

// --- settings_schema, ms-paket, gallerifilter ---

test('A/B-gruppen läggs till i settings_schema en gång — andra varvet ger null', () => {
  const forsta = settingsSchemaMedAb(urZip('config/settings_schema.json'));
  assert.ok(forsta && forsta.includes('ms_ab_tests'));
  assert.equal(settingsSchemaMedAb(forsta), null);
});

test('ms-paket-snippetens svenska ord locale-branchas en gång', () => {
  const ra = urZip('snippets/ms-paket.liquid');
  const patchad = patchaMsPaket(ra);
  assert.ok(patchad && patchad.includes("request.locale.iso_code == 'nb'"));
  assert.ok(patchad.includes('Gratis med på kjøpet'));
  assert.ok(patchad.includes('aria-label="{% if request.locale.iso_code == \'nb\' %}Velg pakke{% else %}Välj paket{% endif %}"'));
  assert.equal(patchaMsPaket(patchad), null);
});

test('gallerifiltret döljer de andra språkens märken per locale, märkt för idempotens', () => {
  const liquid = msHeadGallerifilter(['sv', 'nb']);
  assert.ok(liquid.includes(GALLERIFILTER_MARKE));
  assert.ok(liquid.includes("iso_code == 'sv'") && liquid.includes("iso_code == 'nb'"));
  const svGren = liquid.split("iso_code == 'nb'")[0];
  assert.ok(svGren.includes('[NO]') && !svGren.includes('alt^="[SV]"'));
  const tre = msHeadGallerifilter(['sv', 'nb', 'da']);
  assert.ok(tre.includes('[DK]'));
  assert.ok(msHeadGallerifilter().includes('[NO]'), 'default = sv + nb');
  assert.ok(!liquid.includes('\\'), 'inga backslash-escaper på väg genom JSON');
});

// -------------------------------------------------- demot i beskrivningen
//
// Axels beslut 2026-09-09: demot ska vara en MP4 som loopar, inte en GIF och
// inte en WebP. Metafältsnamnen ändras INTE (gif_problem, media_losning,
// bild_lifestyle) — de ligger live på heimguard.se och tankguard.se, och ett
// nyckelbyte hade tömt båda butikernas beskrivningar tyst. Det är renderingen
// som väljer, på filändelsen.

test('en mp4 blir en loopad video, en jpg blir en bild', () => {
  const liquid = opfMedia('produkt.media');
  // Båda vägarna ska finnas — annars slutar gamla GIF:ar och WebP:ar fungera.
  assert.ok(liquid.includes('<video'), 'ingen videogren');
  assert.ok(liquid.includes('<img'), 'ingen bildgren');
  assert.ok(/opf_ext == 'mp4'/.test(liquid), 'mp4 känns inte igen');
  assert.ok(/opf_ext == 'webm'/.test(liquid) && /opf_ext == 'mov'/.test(liquid));
});

test('videon startar själv, är ljudlös och rullar om', () => {
  const liquid = opfMedia('produkt.media');
  // Utan muted + playsinline vägrar iOS och Chrome spela, och kunden ser en
  // svart ruta i stället för demot. De är alltså inte valfria attribut.
  for (const attr of ['autoplay', 'muted', 'loop', 'playsinline']) {
    assert.ok(new RegExp(`<video[^>]*\\b${attr}\\b`, 's').test(liquid), `saknar ${attr}`);
  }
  assert.ok(!/<video[^>]*\bcontrols\b/s.test(liquid), 'demot ska inte ha spelarkontroller');
  assert.ok(/preload="metadata"/.test(liquid), 'första bildrutan ska ritas utan att hela filen laddas');
});

test('filändelsen läses även när URL:en bär frågetecken', () => {
  // Shopify Files lägger på ?v=1234 — utan split på '?' blir ändelsen "mp4?v=1234".
  const liquid = opfMedia('x');
  assert.ok(/split: '\?'/.test(liquid), 'frågesträngen strippas inte före ändelsen');
  assert.ok(/downcase/.test(liquid), 'MP4 med versaler skulle inte kännas igen');
});

test('mov får rätt mime-typ, inte "video/mov"', () => {
  const liquid = opfMedia('x');
  assert.ok(liquid.includes('video/quicktime'), 'video/mov finns inte som mime-typ');
  assert.ok(liquid.includes('video/webm') && liquid.includes('video/mp4'));
});

test('alla tre beskrivningssektioner kan visa både video och bild', () => {
  for (const namn of ['sections/opf-problem.liquid', 'sections/opf-losning.liquid', 'sections/opf-lifestyle.liquid']) {
    const s = SEKTIONER[namn];
    assert.ok(s.includes('<video'), `${namn} saknar videogrenen`);
    assert.ok(s.includes('<img'), `${namn} saknar bildgrenen`);
  }
});

test('metafältsnamnen är orörda — de ligger live i två butiker', () => {
  // Ett nyckelbyte hade tömt HeimGuards och TankGuards beskrivningar utan
  // felmeddelande. Renderingen bytte, inte fälten.
  assert.ok(SEKTIONER['sections/opf-problem.liquid'].includes('opf.gif_problem'));
  assert.ok(SEKTIONER['sections/opf-losning.liquid'].includes('opf.media_losning'));
  assert.ok(SEKTIONER['sections/opf-lifestyle.liquid'].includes('opf.bild_lifestyle'));
});

test('den som stängt av rörelse får en stillbild, inte en loop', () => {
  assert.ok(OPF_MEDIA_SKRIPT.includes('prefers-reduced-motion'));
  assert.ok(OPF_MEDIA_SKRIPT.includes('opfMediaRedan'), 'skriptet ska bara köra en gång per sida');
});

test('patchaMsPaketValuta: fastpris_valutor vinner i kundens valuta, idempotent', async () => {
  const { patchaMsPaketValuta, MS_PAKET_VALUTA_MARKE } = await import('../tema.mjs');
  const snippet = `{%- liquid\n              assign fast = niva.fastpris.value\n              if kod != '' and fast != blank\n              endif\n-%}`;
  const p = patchaMsPaketValuta(snippet);
  assert.ok(p.includes(MS_PAKET_VALUTA_MARKE));
  assert.ok(p.includes("cart.currency.iso_code != shop.currency"));
  assert.ok(p.includes('assign fast = opf_fvd[1] | times: 1.0'));
  // Raden som fanns ligger kvar först, patchen efter — inuti liquid-blocket.
  assert.ok(p.indexOf('assign fast = niva.fastpris.value') < p.indexOf(MS_PAKET_VALUTA_MARKE));
  assert.equal(patchaMsPaketValuta(p), null);
  assert.equal(patchaMsPaketValuta('inget fastpris här'), null);
});
