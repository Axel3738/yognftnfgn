import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brytpunkter, kostnadPerOrder, linje, dom, vinstbidrag, rangordna } from '../ekonomi.mjs';
import { lasKonfig } from '../kor.mjs';

const KONFIG = lasKonfig();
const GRINDAR = KONFIG.grindar;

test('tullen räknas om ur EUR och läggs på inköpet', () => {
  assert.equal(kostnadPerOrder({ kostnad_per_order_sek: 120.92, tull_eur: 2.9, eur_sek: 11.275 }), 153.62);
});

test('tull utan kurs kastar hellre än gissar', () => {
  assert.throws(() => kostnadPerOrder({ kostnad_per_order_sek: 100, tull_eur: 2.9, eur_sek: 0 }), /eur_sek saknas/);
});

test('break-even-ROAS = AOV / täckningsbidrag', () => {
  const l = linje(462.1, 153.62, false);
  assert.equal(l.break_even_cpa_sek, 308.48);
  assert.equal(l.break_even_roas, 1.498);
});

test('med moms i priset blir break-even klart högre', () => {
  const utan = linje(462.1, 153.62, false);
  const med = linje(462.1, 153.62, true);
  assert.ok(med.break_even_roas > utan.break_even_roas);
  assert.equal(med.break_even_roas, 2.139);
});

test('negativt täckningsbidrag ger inget break-even-tal, bara en varning', () => {
  const l = linje(100, 150, false);
  assert.equal(l.break_even_roas, null);
  assert.match(l.varning, /går inte att annonsera lönsamt/);
});

test('konfigen ger båda linjerna och ingen gällande förrän momsen är besvarad', () => {
  const b = brytpunkter(KONFIG);
  assert.ok(b.utan_moms.break_even_roas > 0);
  assert.ok(b.med_moms.break_even_roas > b.utan_moms.break_even_roas);
  assert.equal(b.gallande, null, 'moms_antagen är öppen ⇒ ingen ensam linje lämnas ut');
  assert.equal(b.oppen_fraga, true);
});

test('AOV som saknas kastar — den hittas aldrig på', () => {
  assert.throws(() => brytpunkter({ ekonomi: { kostnad_per_order_sek: 120 } }), /aov_sek saknas/);
});

test('ingen dom under grinden', () => {
  const b = brytpunkter(KONFIG);
  const d = dom({ namn: 'A', spend_sek: 120, kop: 1, roas: 0.4 }, b, GRINDAR);
  assert.equal(d.dom, 'FOR_TIDIGT');
  assert.equal(d.bedombar, false);
});

test('en annons mellan momslinjerna rörs inte', () => {
  const b = brytpunkter(KONFIG);
  const d = dom({ namn: 'MELLAN', spend_sek: 2000, kop: 6, roas: 1.8 }, b, GRINDAR);
  assert.equal(d.dom, 'BEROR_PA_MOMS');
});

test('under båda linjerna är under break-even, över båda är över', () => {
  const b = brytpunkter(KONFIG);
  assert.equal(dom({ namn: 'LAG', spend_sek: 2000, kop: 6, roas: 0.9 }, b, GRINDAR).dom, 'UNDER_BREAK_EVEN');
  assert.equal(dom({ namn: 'HOG', spend_sek: 2000, kop: 6, roas: 3.0 }, b, GRINDAR).dom, 'OVER_BREAK_EVEN');
});

test('vinstbidrag räknas på den försiktiga linjen när momsen är öppen, och märks', () => {
  const b = brytpunkter(KONFIG);
  const v = vinstbidrag({ namn: 'A', spend_sek: 1000, kop: 5 }, b);
  assert.equal(v.forsiktigt, true);
  assert.match(v.motivering, /MED-moms-linjen/);
});

test('rankingen går på vinstbidrag och pekar ut benchmarken', () => {
  const b = brytpunkter(KONFIG);
  const r = rangordna([
    { namn: 'TOP', spend_sek: 7776, kop: 17, roas: 0.93 },
    { namn: 'LITEN', spend_sek: 2873, kop: 10, roas: 2.05 },
    { namn: 'FOR_TIDIG', spend_sek: 50, kop: 0, roas: null },
  ], b, GRINDAR);
  assert.deepEqual(r.for_tidigt, ['FOR_TIDIG']);
  assert.equal(r.rader[0].namn, 'LITEN', 'högst vinstbidrag först — aldrig högst spend');
  // Siffrorna är kontots riktiga 2026-09-21: på den försiktiga linjen går INGEN
  // av dem plus. Då faller benchmark-skyddet tillbaka på spendandelen.
  const top = r.rader.find((x) => x.namn === 'TOP');
  assert.ok(top.benchmark, 'top spendern skyddas även när ingen går plus');
  assert.equal(top.benchmark_pa_spend, true);
});

test('när någon går plus är benchmarken den med störst andel av VINSTEN, inte av spenden', () => {
  const b = { ...brytpunkter(KONFIG), gallande: { break_even_cpa_sek: 500, break_even_roas: 1.2 }, oppen_fraga: false };
  const r = rangordna([
    { namn: 'STOR_SPEND_TUNN', spend_sek: 8000, kop: 17, roas: 1.3 },
    { namn: 'LITEN_FET', spend_sek: 2000, kop: 12, roas: 3.5 },
  ], b, GRINDAR);
  assert.equal(r.rader[0].namn, 'LITEN_FET');
  assert.ok(r.rader[0].benchmark);
  assert.equal(r.rader[0].benchmark_pa_spend, undefined);
});

test('vinstbidraget räknas på annonsens EGET ordervärde — annars säger dom och ranking emot varandra', () => {
  const b = brytpunkter({ ...KONFIG, ekonomi: { ...KONFIG.ekonomi, moms_antagen: true } });
  // Riktiga tal 2026-09-21: ROAS 2,214 ≥ break-even 2,139 ⇒ OVER_BREAK_EVEN.
  // Kunderna handlade för 665 kr, inte kampanjens 462 — vinstbidraget MÅSTE då bli positivt.
  const a = { namn: 'MATSTRUMP_sushi_gift_ugc_s001h1_v2', spend_sek: 901.15, kop: 3, roas: 2.213838 };
  assert.equal(dom(a, b, GRINDAR).dom, 'OVER_BREAK_EVEN');
  const v = vinstbidrag(a, b);
  assert.ok(v.vinstbidrag_sek > 0, `vinstbidraget blev ${v.vinstbidrag_sek} kr trots ROAS över break-even`);
  assert.equal(v.ordervarde_sek, 665);
});

test('en top spender som blöder är RIKTMÄRKE men inte skyddad', () => {
  const b = brytpunkter({ ...KONFIG, ekonomi: { ...KONFIG.ekonomi, moms_antagen: true } });
  const r = rangordna([
    { namn: 'TOP', spend_sek: 7776.19, kop: 17, roas: 0.926207 },
    { namn: 'LITEN', spend_sek: 900, kop: 2, roas: 0.5 },
  ], b, GRINDAR);
  const top = r.rader.find((x) => x.namn === 'TOP');
  assert.equal(top.benchmark, true);
  assert.equal(top.skydd, false, 'skyddet gäller vinstandelen, inte spendandelen');
});

test('den som bär > 30 % av vinsten är skyddad', () => {
  const b = { ...brytpunkter(KONFIG), gallande: { break_even_cpa_sek: 500, break_even_roas: 1.2, tackningsbidrag: 500 }, oppen_fraga: false };
  const r = rangordna([{ namn: 'VINNARE', spend_sek: 2000, kop: 12, roas: 3.5 }], b, GRINDAR);
  assert.equal(r.rader[0].skydd, true);
});
