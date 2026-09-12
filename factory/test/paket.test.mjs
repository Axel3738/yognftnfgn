// Tester för paketnivåerna (paket.mjs) och bonusprodukten (bonus.mjs).
// Ren logik, ingen nätverkstrafik. Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasYaml } from '../yaml.mjs';
import {
  fastprisValutorText,
  METAOBJEKT_TYP, TYP, FALT, NIVAER, forvaldIndex, paketPrefix, lasNivaer,
  byggPaketplan, byggPaket, paketRader, nivaFalt, rabattkodInput,
} from '../paket.mjs';
import { byggBonusInput, skrivIdnIText, skrivTillbakaIdn, hittaProduktfil, sakerstallBonus } from '../bonus.mjs';
import { dummy } from './hjalp.mjs';

const ROT = join(fileURLToPath(new URL('.', import.meta.url)), '..');

// En produkt med egna nivåer, gratis bonus och A/B — TankGuards upplägg i miniatyr.
const medPaket = (extra = {}) => ({
  produkt: { id: 'tanken', namn: 'Tanken' },
  brand: { namn: 'TestBrand' },
  ekonomi: { pris: 489, valuta: 'SEK' },
  offer: {
    bonus_produkt: { titel: 'Kranskydd', handle: 'kranskydd', pris: 199, bilder: ['https://x/kran.jpg'] },
    paket: {
      test: 'paket',
      nivaer: [
        { variant: 'a', antal: 1, rubrik: '1 överdrag' },
        { variant: 'a', antal: 2, rubrik: '2 överdrag', pris: 831, kod: 'PAKET2', bricka: 'Spara 15 %', gratis_antal: 2, gratis_text: '2 × Kranskydd', forvald: true },
        { variant: 'a', antal: 3, rubrik: '3 överdrag', pris: 1159, kod: 'PAKET3', gratis_antal: 3, gratis_text: '3 × Kranskydd' },
        { variant: 'b', antal: 1, rubrik: '1 överdrag' },
        { variant: 'b', antal: 2, rubrik: '2 överdrag', pris: 799, kod: 'PAKET2B', gratis_antal: 2, forvald: true },
        { variant: 'b', antal: 3, rubrik: '3 överdrag', pris: 1099, kod: 'PAKET3B', gratis_antal: 3 },
      ],
    },
  },
  ...extra,
});

test('konstanterna: typ, fält och standardnivåer', () => {
  assert.equal(METAOBJEKT_TYP, 'ms_paketniva');
  assert.equal(TYP, METAOBJEKT_TYP);
  const nycklar = FALT.map((f) => f.key);
  for (const k of ['produkt', 'ab_variant', 'antal', 'rubrik', 'underrubrik', 'bricka', 'fastpris', 'rabattkod', 'forvald', 'bogo_gratis', 'gratis_produkt', 'gratis_antal', 'gratis_text']) {
    assert.ok(nycklar.includes(k), `fältet ${k} saknas`);
  }
  assert.ok(FALT.find((f) => f.key === 'produkt').required);
  assert.deepEqual(Object.keys(NIVAER), ['a', 'b']);
  assert.equal(NIVAER.a.length, 3);
});

test('forvaldIndex: mitten enligt ⌈n/2⌉, aldrig första', () => {
  assert.equal(forvaldIndex(1), 0);
  assert.equal(forvaldIndex(2), 0);
  assert.equal(forvaldIndex(3), 1);
  assert.equal(forvaldIndex(4), 1);
  assert.equal(forvaldIndex(5), 2);
});

test('paketPrefix: annonsprefix eller id, bara A–Z/0–9, max 12', () => {
  assert.equal(paketPrefix({ produkt: { id: 'damasker' }, meta: { creative_prefix: 'Damasker' } }), 'DAMASKER');
  assert.equal(paketPrefix({ produkt: { id: 'fiskespohallare-4-pack' } }), 'FISKESPOHALL');
  assert.equal(paketPrefix({ produkt: { id: 'x' }, meta: { creative_prefix: 'TackleBay Rod!' } }), 'TACKLEBAYROD');
});

test('standardstegen A/B när produktfilen saknar egna nivåer', () => {
  const p = dummy();
  const { kalla, test: t, perVariant } = lasNivaer(p);
  assert.equal(kalla, 'standard');
  assert.equal(t, 'paket');
  assert.deepEqual([...perVariant.keys()], ['a', 'b']);

  const plan = byggPaketplan(p);
  assert.equal(plan.poster.length, 6);
  assert.equal(plan.A.length, 3);
  assert.equal(plan.B.length, 3);
  // Mitten förvald i båda varianterna, aldrig första.
  assert.deepEqual(plan.A.map((x) => x.forvald), [false, true, false]);
  assert.deepEqual(plan.B.map((x) => x.forvald), [false, true, false]);
  // Procent på styckpris × antal, räknat i öre.
  const pris = p.ekonomi.pris;
  const a2 = plan.A[1];
  assert.equal(a2.ordinarie, pris * 2);
  assert.equal(a2.fastpris, Math.round(pris * 2 * 0.85 * 100) / 100);
  assert.equal(a2.rabatt, Math.round((pris * 2 - a2.fastpris) * 100) / 100);
  assert.equal(a2.kundpris, a2.fastpris);
  assert.equal(a2.sparProcent, 15);
  // Koden ur prefixet, per antal och variant; 1 st har ingen kod.
  assert.equal(plan.A[0].kod, '');
  assert.equal(a2.kod, `${paketPrefix(p)}2A`);
  assert.equal(plan.B[2].kod, `${paketPrefix(p)}3B`);
  assert.equal(plan.koder.length, 4);
  assert.equal(plan.koder.find((k) => k.kod === a2.kod).minstAntal, 2);
  // Handle på produkt-id, variant och antal.
  assert.equal(a2.handle, `${p.produkt.id}-a-2`);
});

test('egna nivåer: gratis bonus räknas in i rabattbeloppet och minsta antal', () => {
  const plan = byggPaketplan(medPaket());
  assert.equal(plan.kalla, 'produktfil');
  assert.equal(plan.test, 'paket');
  assert.equal(plan.poster.length, 6);
  const a2 = plan.poster.find((x) => x.handle === 'tanken-a-2');
  // 2 × 489 + 2 × 199 − 831 = 545
  assert.equal(a2.ordinarie, 1376);
  assert.equal(a2.fastpris, 831);
  assert.equal(a2.rabatt, 545);
  assert.equal(a2.kundpris, 831);
  assert.equal(a2.gratisAntal, 2);
  assert.equal(a2.gratisText, '2 × Kranskydd');
  assert.equal(a2.forvald, true);
  // Spara-procenten mäter produkten, inte bonusen: (978 − 831) / 978 = 15 %
  assert.equal(a2.sparProcent, 15);
  const k = plan.koder.find((x) => x.kod === 'PAKET2');
  assert.equal(k.belopp, 545);
  assert.equal(k.minstAntal, 4);
  // 3 × 489 + 3 × 199 − 1159 = 905, min 6
  const k3 = plan.koder.find((x) => x.kod === 'PAKET3');
  assert.equal(k3.belopp, 905);
  assert.equal(k3.minstAntal, 6);
  // B-varianten
  assert.equal(plan.koder.find((x) => x.kod === 'PAKET2B').belopp, 577);
  assert.equal(plan.koder.find((x) => x.kod === 'PAKET3B').belopp, 965);
  // Nivå 1 är ordinarie: ingen kod, inget fastpris, inte förvald.
  const a1 = plan.poster.find((x) => x.handle === 'tanken-a-1');
  assert.equal(a1.kod, '');
  assert.equal(a1.fastpris, null);
  assert.equal(a1.kundpris, 489);
  assert.equal(a1.forvald, false);
});

test('ören: 389 × 2 − 661,30 blir exakt 116,70 (inte 116.70000000000005)', () => {
  const p = medPaket({
    ekonomi: { pris: 389 },
    offer: { paket: { nivaer: [
      { antal: 1, rubrik: '1 par' },
      { antal: 2, rubrik: '2 par', pris: 661.3, kod: 'DAMASKER2PACK', forvald: true, handle: 'damasker-a2' },
      { antal: 3, rubrik: '3 par', pris: 933.6, kod: 'DAMASKER3PACK' },
    ] } },
  });
  const plan = byggPaketplan(p);
  assert.equal(plan.test, '');
  assert.equal(plan.koder.find((k) => k.kod === 'DAMASKER2PACK').belopp, 116.7);
  assert.equal(plan.koder.find((k) => k.kod === 'DAMASKER3PACK').belopp, 233.4);
  // Variant tom ⇒ handle "-x-", utom där filen sätter ett eget handle.
  assert.deepEqual(plan.poster.map((x) => x.handle), ['tanken-x-1', 'damasker-a2', 'tanken-x-3']);
  assert.equal(nivaFalt(plan.poster[1], 'gid://p/1').find((f) => f.key === 'fastpris').value, '661.30');
});

test('förval som inte är satt i filen räknas fram som mitten', () => {
  const p = medPaket();
  for (const n of p.offer.paket.nivaer) delete n.forvald;
  const plan = byggPaketplan(p);
  assert.deepEqual(plan.A.map((x) => x.forvald), [false, true, false]);
  assert.deepEqual(plan.B.map((x) => x.forvald), [false, true, false]);
});

test('vägrar: första nivån förvald', () => {
  const p = medPaket();
  p.offer.paket.nivaer[1].forvald = false;
  p.offer.paket.nivaer[0].forvald = true;
  assert.throws(() => byggPaketplan(p), /första nivån är förvald/);
});

test('vägrar: två förvalda i samma variant', () => {
  const p = medPaket();
  p.offer.paket.nivaer[2].forvald = true;
  assert.throws(() => byggPaketplan(p), /2 nivåer är förvalda/);
});

test('vägrar: fastpris högre än ordinarie', () => {
  const p = medPaket();
  p.offer.paket.nivaer[1].pris = 979; // 2 × 489 = 978
  assert.throws(() => byggPaketplan(p), /HÖGRE än ordinarie/);
});

test('vägrar: gratis_antal utan bonuspris', () => {
  const p = medPaket();
  delete p.offer.bonus_produkt;
  assert.throws(() => byggPaketplan(p), /gratis_antal utan offer\.bonus_produkt\.pris/);
});

test('vägrar: samma kod på två nivåer, och kod utan verklig rabatt', () => {
  const p = medPaket();
  p.offer.paket.nivaer[2].kod = 'PAKET2';
  assert.throws(() => byggPaketplan(p), /PAKET2 används på två nivåer/);
  const q = medPaket();
  q.offer.paket.nivaer[1].pris = 1376; // = ordinarie inkl. bonus
  q.offer.paket.nivaer[1].gratis_antal = 0;
  q.offer.paket.nivaer[1].pris = 978;
  assert.throws(() => byggPaketplan(q), /inte lägre än ordinarie/);
});

test('rabatt i procent på egna nivåer, med bonus ovanpå', () => {
  const p = medPaket({
    ekonomi: { pris: 100 },
    offer: {
      bonus_produkt: { pris: 50 },
      paket: { nivaer: [
        { antal: 1, rubrik: '1' },
        { antal: 2, rubrik: '2', rabatt: 0.1, gratis_antal: 2 },
        { antal: 3, rubrik: '3', rabatt: 0.2 },
      ] },
    },
  });
  const plan = byggPaketplan(p);
  const n2 = plan.poster[1];
  assert.equal(n2.fastpris, 180);
  assert.equal(n2.ordinarie, 300);
  assert.equal(n2.rabatt, 120);
  assert.equal(n2.kod, 'TANKEN2');
  assert.equal(plan.koder[0].minstAntal, 4);
  assert.equal(plan.poster[2].kod, 'TANKEN3');
});

test('nivaFalt: exakt de fält snippeten läser, gratis_produkt bara med bonus', () => {
  const plan = byggPaketplan(medPaket());
  const a2 = plan.poster.find((x) => x.handle === 'tanken-a-2');
  const f = Object.fromEntries(nivaFalt(a2, 'gid://shopify/Product/1', 'gid://shopify/Product/2').map((x) => [x.key, x.value]));
  assert.deepEqual(Object.keys(f).sort(), FALT.map((x) => x.key).sort());
  assert.equal(f.produkt, 'gid://shopify/Product/1');
  assert.equal(f.gratis_produkt, 'gid://shopify/Product/2');
  assert.equal(f.fastpris, '831.00');
  assert.equal(f.forvald, 'true');
  assert.equal(f.ab_variant, 'a');
  assert.equal(f.gratis_antal, '2');
  assert.equal(f.bogo_gratis, '0');
  const a1 = plan.poster.find((x) => x.handle === 'tanken-a-1');
  const g = Object.fromEntries(nivaFalt(a1, 'gid://shopify/Product/1', 'gid://shopify/Product/2').map((x) => [x.key, x.value]));
  assert.equal(g.gratis_produkt, '');
  assert.equal(g.fastpris, '');
  assert.equal(g.rabattkod, '');
});

test('rabattkodInput: fast belopp, minsta antal, låst till produkten + bonusen', () => {
  const plan = byggPaketplan(medPaket());
  const k = plan.koder.find((x) => x.kod === 'PAKET2');
  const i = rabattkodInput(k, 'gid://p/1', { bonusGid: 'gid://p/2' });
  assert.equal(i.code, 'PAKET2');
  assert.equal(i.customerGets.value.discountAmount.amount, '545.00');
  assert.equal(i.customerGets.value.discountAmount.appliesOnEachItem, false);
  assert.deepEqual(i.customerGets.items.products.productsToAdd, ['gid://p/1', 'gid://p/2']);
  assert.equal(i.minimumRequirement.quantity.greaterThanOrEqualToQuantity, '4');
  assert.equal(i.combinesWith.shippingDiscounts, true);
  // Utan gratisrad: bara produkten.
  const u = rabattkodInput({ kod: 'X', belopp: 10, minstAntal: 2, gratisAntal: 0, titel: 't' }, 'gid://p/1', { bonusGid: 'gid://p/2' });
  assert.deepEqual(u.customerGets.items.products.productsToAdd, ['gid://p/1']);
});

test('byggPaket torr: planen utan nätverk, med rapportrader', async () => {
  const r = await byggPaket({ butik: { butik: { valuta: 'SEK', brand: 'B' } } }, medPaket(), { torr: true });
  assert.equal(r.skrivet, false);
  assert.equal(r.nivaer.length, 6);
  assert.equal(r.koder.length, 4);
  assert.ok(r.rapport.some((rad) => rad.includes('FÖRVALD')));
  assert.ok(r.rapport.at(-1).startsWith('Rabattkoder: PAKET2'));
  assert.equal(paketRader(r).length, 7);
});

test('damasker.yaml: DryTreks nivåer ligger i offer.paket och ger källans koder', () => {
  const p = lasYaml(readFileSync(join(ROT, 'produkter', 'damasker.yaml'), 'utf8'));
  const plan = byggPaketplan(p);
  assert.equal(plan.kalla, 'produktfil');
  assert.equal(plan.test, '');
  assert.deepEqual(plan.poster.map((x) => x.handle), ['damasker-a1', 'damasker-a2', 'damasker-a3']);
  assert.deepEqual(plan.poster.map((x) => x.kundpris), [389, 661.3, 933.6]);
  assert.deepEqual(plan.poster.map((x) => x.forvald), [false, true, false]);
  assert.equal(plan.poster[1].bricka, 'Mest populär');
  assert.deepEqual(plan.koder.map((k) => [k.kod, k.belopp, k.minstAntal]), [['DAMASKER2PACK', 116.7, 2], ['DAMASKER3PACK', 233.4, 3]]);
});

test('alla produktfiler med offer.paket ger en giltig plan', () => {
  for (const f of readdirSync(join(ROT, 'produkter')).filter((x) => x.endsWith('.yaml'))) {
    const p = lasYaml(readFileSync(join(ROT, 'produkter', f), 'utf8'));
    if (!p.offer?.paket?.nivaer?.length) continue;
    assert.doesNotThrow(() => byggPaketplan(p), f);
  }
});

// --- bonus.mjs -------------------------------------------------------------

test('byggBonusInput: ACTIVE, pris med två decimaler, bilder som files', () => {
  const i = byggBonusInput(medPaket());
  assert.equal(i.status, 'ACTIVE');
  assert.equal(i.handle, 'kranskydd');
  assert.equal(i.variants[0].price, '199.00');
  assert.equal(i.files[0].originalSource, 'https://x/kran.jpg');
  assert.equal(i.vendor, 'TestBrand');
  assert.throws(() => byggBonusInput({ offer: { bonus_produkt: { titel: 'x', handle: '', pris: 1 } } }), /saknar titel, handle eller pris/);
  assert.throws(() => byggBonusInput({ offer: { bonus_produkt: { titel: 'x', handle: 'y', pris: 1, bilder: [] } } }), /bilder är tom/);
});

test('skrivIdnIText: ersätter befintliga id-rader, rör inget annat', () => {
  const t = [
    'offer:',
    '  bundle: "x"',
    '  bonus_produkt:',
    '    titel: "Kranskydd"',
    '    handle: "kranskydd"',
    '    produkt_id: ""            # skrivs av bonus.mjs',
    '    variant_id: ""',
    '    pris: 199',
    'reviews:',
  ].join('\n');
  const ny = skrivIdnIText(t, '15989725593944', '58420897481048');
  assert.equal(ny, [
    'offer:',
    '  bundle: "x"',
    '  bonus_produkt:',
    '    titel: "Kranskydd"',
    '    handle: "kranskydd"',
    '    produkt_id: "15989725593944"',
    '    variant_id: "58420897481048"',
    '    pris: 199',
    'reviews:',
  ].join('\n'));
  const y = lasYaml(ny);
  assert.equal(y.offer.bonus_produkt.produkt_id, '15989725593944');
  assert.equal(y.offer.bonus_produkt.pris, 199);
});

test('skrivIdnIText: lägger till raderna när de saknas (damaskers fil), och kraschar inte utan block', () => {
  const t = [
    'offer:',
    '  # kommentar',
    '  bonus_produkt:',
    '    titel: "Reflexband"',
    '    handle: ""',
    '    pris: 149',
    '',
    'reviews:',
    '  - namn: "A"',
  ].join('\n');
  const ny = skrivIdnIText(t, '1', '2');
  const y = lasYaml(ny);
  assert.equal(y.offer.bonus_produkt.produkt_id, '1');
  assert.equal(y.offer.bonus_produkt.variant_id, '2');
  assert.equal(y.offer.bonus_produkt.pris, 149);
  assert.equal(y.reviews[0].namn, 'A');
  assert.match(ny, /handle: ""\n    produkt_id: "1"\n    variant_id: "2"\n    pris: 149/);
  // Inget bonus_produkt-block ⇒ null, ingen krasch.
  assert.equal(skrivIdnIText('offer:\n  bundle: "x"\n', '1', '2'), null);
});

test('skrivTillbakaIdn på fil: true när blocket finns, false annars, aldrig krasch', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'bonus-'));
  const med = join(mapp, 'med.yaml');
  writeFileSync(med, 'produkt:\n  id: x\noffer:\n  bonus_produkt:\n    handle: "h"\n');
  assert.equal(skrivTillbakaIdn(med, '10', '20'), true);
  assert.equal(lasYaml(readFileSync(med, 'utf8')).offer.bonus_produkt.variant_id, '20');
  const utan = join(mapp, 'utan.yaml');
  writeFileSync(utan, 'produkt:\n  id: y\n');
  assert.equal(skrivTillbakaIdn(utan, '10', '20'), false);
  assert.equal(readFileSync(utan, 'utf8'), 'produkt:\n  id: y\n');
});

test('hittaProduktfil: på produkt.id, även när filnamnet är ett annat', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'produkter-'));
  writeFileSync(join(mapp, 'a.yaml'), 'produkt:\n  id: alfa\n');
  writeFileSync(join(mapp, 'annat-namn.yaml'), 'produkt:\n  id: beta\n');
  writeFileSync(join(mapp, 'trasig.yaml'), 'produkt:\n    - x\n  id: :\n');
  assert.equal(hittaProduktfil('alfa', { mapp }), join(mapp, 'a.yaml'));
  assert.equal(hittaProduktfil('beta', { mapp }), join(mapp, 'annat-namn.yaml'));
  assert.equal(hittaProduktfil('gamma', { mapp }), null);
  assert.equal(hittaProduktfil('', { mapp }), null);
  assert.equal(hittaProduktfil('fiskespohallare-4-pack'), join(ROT, 'produkter', 'tacklebay-spohallaren.yaml'));
});

test('sakerstallBonus torr: validerar och rör varken nät eller fil', async () => {
  const r = await sakerstallBonus({}, medPaket(), { torr: true });
  assert.equal(r.skrivet, false);
  assert.equal(r.produkt_id, null);
  assert.equal(r.input.handle, 'kranskydd');
  await assert.rejects(() => sakerstallBonus({}, { offer: {} }, { torr: true }), /saknar titel/);
});

// --- Paketpris per valuta + procentkoder (CaraShell 2026-09-12) --------------

const utanBonus = () => ({
  produkt: { id: 'takskyddet', namn: 'Taköverdrag' },
  brand: { namn: 'CaraShell' },
  ekonomi: { pris: 1129, valuta: 'SEK', marknadspriser: [{ valuta: 'NOK', pris: 1106, jamforpris: 1382.5 }] },
  meta: { creative_prefix: 'CaraShellRoof' },
  offer: { paket: { test: 'paket' } },
});

test('marknadspriser: hel procent utan bonus ger procentkod och NOK-tal i fastpris_valutor', () => {
  const plan = byggPaketplan(utanBonus());
  const a2 = plan.poster.find((x) => x.handle === 'takskyddet-a-2');
  // 2 × 1129 × 0,85 = 1919,30 SEK på sidan i SEK; 2 × 1106 × 0,85 = 1880,20 i NOK.
  assert.equal(a2.fastpris, 1919.3);
  assert.deepEqual(a2.fastprisValutor, { NOK: 1880.2 });
  const f = Object.fromEntries(nivaFalt(a2, 'gid://p/1').map((x) => [x.key, x.value]));
  assert.equal(f.fastpris_valutor, 'NOK:1880.20');
  const k = plan.koder.find((x) => x.kod === 'CARASHELLROO2A');
  assert.equal(k.procent, 15);
  assert.equal(k.belopp, 338.7);
  const i = rabattkodInput(k, 'gid://p/1');
  assert.deepEqual(i.customerGets.value, { percentage: 0.15 });
  assert.ok(paketRader(plan).at(-1).includes('CARASHELLROO2A = −15 %'));
  const b3 = plan.poster.find((x) => x.handle === 'takskyddet-b-3');
  assert.deepEqual(b3.fastprisValutor, { NOK: 2488.5 });
  // Nivå 1 (ordinarie): inga valutatal, ingen kod.
  const a1 = plan.poster.find((x) => x.handle === 'takskyddet-a-1');
  assert.deepEqual(a1.fastprisValutor, {});
});

test('marknadspriser: med gratis bonus stannar koden som belopp och valutatalen uteblir', () => {
  const plan = byggPaketplan(medPaket({ ekonomi: { pris: 489, valuta: 'SEK', marknadspriser: [{ valuta: 'NOK', pris: 480 }] } }));
  const k = plan.koder.find((x) => x.kod === 'PAKET2');
  assert.equal(k.procent, null);
  assert.equal(rabattkodInput(k, 'gid://p/1').customerGets.value.discountAmount.amount, '545.00');
  const a2 = plan.poster.find((x) => x.handle === 'tanken-a-2');
  assert.deepEqual(a2.fastprisValutor, {});
  assert.equal(Object.fromEntries(nivaFalt(a2, 'gid://p/1', 'gid://p/2').map((x) => [x.key, x.value])).fastpris_valutor, '');
});

test('fastprisValutorText: format och tomt', () => {
  assert.equal(fastprisValutorText({ NOK: 1880.2, dkk: 1300 }), 'NOK:1880.20;DKK:1300.00');
  assert.equal(fastprisValutorText({}), '');
  assert.equal(fastprisValutorText(undefined), '');
});
