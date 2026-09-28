// Hela körningen mot ett låtsasrepo: hämtarna byts ut, ingen nätverkstrafik.
// Bevisar kedjan mät → nytt/redan/löst → att-posta.json eller postare →
// minnet — och att ett larm aldrig postas två gånger.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { korAkut, kvitteraFran, byggSajtlista, annonskontonUr, ATT_POSTA } from '../kor.mjs';
import { lasMinne } from '../minne.mjs';

const NU = new Date('2026-09-27T14:00:00Z'); // 16:00 svensk tid ⇒ inte den dagliga timmen
const KONFIG = JSON.parse(readFileSync(new URL('../konfig.json', import.meta.url), 'utf8'));
const VARUMARKEN = { varumarken: [
  { id: 'baverbutiken', namn: 'Bäverbutiken', butiker: ['baverbutiken'], konton: [{ id: '1867947880635861', namn: 'MagiBorsten', hela: true }] },
  { id: 'carashell', namn: 'CaraShell', butiker: ['carashell'], konton: [{ id: '1107817401910319', namn: 'Magiborsten UK', prefix: ['CARASHELL_'] }] },
] };
const SNAPSHOT = { byggd: '2026-09-27T13:30:00Z', butiker: [
  { id: 'baverbutiken', namn: 'Bäverbutiken', url: 'https://baverbutiken.se', shop: '4snrw0-mg.myshopify.com', status: 'ok', dagar: [{ datum: '2026-09-26', ordrar: 70 }, { datum: '2026-09-27', ordrar: 20 }] },
  { id: 'carashell', namn: 'Carashell', url: 'https://carashell.se', shop: 'yitrbk-m3.myshopify.com', status: 'ok', dagar: [{ datum: '2026-09-27', ordrar: 5 }] },
  { id: 'catcabin', namn: 'CatCabin', url: 'https://catcabin.se', status: 'fel', orsak: 'appen inte installerad', dagar: [] },
] };

function lagRepo({ konfig = KONFIG } = {}) {
  const rot = mkdtempSync(join(tmpdir(), 'akut-kor-'));
  mkdirSync(join(rot, 'akut'), { recursive: true });
  mkdirSync(join(rot, 'stonebite', 'data'), { recursive: true });
  writeFileSync(join(rot, 'akut', 'konfig.json'), JSON.stringify({ ...konfig, sajter_extra: [], slack: { ...konfig.slack, kanalId: 'C-TEST' } }));
  writeFileSync(join(rot, 'stonebite', 'varumarken.json'), JSON.stringify(VARUMARKEN));
  writeFileSync(join(rot, 'stonebite', 'data', 'snapshot.json'), JSON.stringify(SNAPSHOT));
  return rot;
}

const halsaOk = { url: 'h', reserv: 'r', svar: { ok: true, status: 200, json: { ok: true, autosvar: { brands: ['baverbutiken'], kor: true, omstarter: 0 } } } };
const rutinerOk = { status: 'ok', summering: { ok: 2, sen: 0, saknas: 0, avstangd: 0, omatbar: 0, ny: 0 }, rutiner: [{ id: 'stonebite', namn: 'S', status: 'ok' }] };

/** Hämtare där sajterna svarar som `svar` säger och UK-kontot brinner. */
function hamtare({ nere = [], brinner = true, rutiner = rutinerOk, meta = null } = {}) {
  return {
    sajter: async (lista) => lista.map((s) => ({ ...s, resultat: nere.includes(s.id) ? { ok: false, status: 503, forsok: 3 } : { ok: true, status: 200, forsok: 1 } })),
    meta: async (konton) => meta ?? konton.map((k) => ({
      ...k, konto: { account_status: 1, disable_reason: 0, currency: 'SEK', spend_cap: '0', amount_spent: '1' },
      kampanjer: k.id === '1107817401910319' && brinner ? [{ id: 'kamp1', namn: '1 CARASHELL_US_Tak | BE-ROAS 1.63', spend: 18000, kop: 2, roas: 0.32 }] : [{ id: 'k2', namn: 'Motorhöljet | BE ROAS 1.63', spend: 3000, kop: 8, roas: 2.4 }],
      fel: null,
    })),
    halsa: async () => halsaOk,
    notion: async () => ({ status: 200 }),
    rutiner: () => rutiner,
    upptack: () => [],
    tvister: async () => null,
    utbetalningar: async () => [],
  };
}

test('sajtlistan och kontona byggs ur driften och registret', () => {
  const sajter = byggSajtlista({
    iDrift: { baverbutiken: { namn: 'Bäverbutiken', url: 'https://baverbutiken.se/', shop: '4snrw0-mg.myshopify.com' }, carashell: { namn: 'CaraShell', url: 'https://carashell.se', shop: 'yitrbk-m3.myshopify.com' } },
    konfig: { sajter_extra: [{ id: 'grillkliniken', namn: 'Grillkliniken', url: 'https://grillkliniken.se', verksamhet: 'grillkliniken' }, { id: 'dubblett', namn: 'x', url: 'https://carashell.se/' }] },
    varumarken: VARUMARKEN.varumarken,
    marknader: (id) => (id === 'carashell' ? [{ land: 'US', url: 'https://carashell.com' }] : []),
  });
  assert.deepEqual(sajter.map((s) => [s.id, s.url, s.verksamhet]), [
    ['baverbutiken', 'https://baverbutiken.se/', 'baverbutiken'], ['carashell', 'https://carashell.se', 'carashell'], ['carashell-us', 'https://carashell.com', 'carashell'], ['grillkliniken', 'https://grillkliniken.se', 'grillkliniken'],
  ]);
  assert.deepEqual(annonskontonUr(VARUMARKEN.varumarken).map((k) => k.id), ['1867947880635861', '1107817401910319']);
});

test('torrt: mäter och visar, skriver ingenting', async () => {
  const rot = lagRepo();
  try {
    const r = await korAkut({ rot, env: {}, nu: NU, torr: true, hamtare: hamtare({ nere: ['baverbutiken'] }) });
    assert.deepEqual(r.nya.map((l) => l.nyckel), ['butik:baverbutiken', 'pengar:1107817401910319:kamp1:2026-09-27']);
    assert.equal(r.sammanfattning.sajter.matta, 2, 'catcabin är fel-status och inte i drift');
    assert.equal(r.sammanfattning.dagligt, false);
    assert.ok(!existsSync(join(rot, 'akut', 'data', 'larm.json')));
    assert.ok(!existsSync(ATT_POSTA(rot)));
  } finally { rmSync(rot, { recursive: true, force: true }); }
});

test('utan Slack-nyckel: att-posta.json skrivs, minnet väntar på --postat, sedan är larmet "redan"', async () => {
  const rot = lagRepo();
  try {
    const r1 = await korAkut({ rot, env: {}, nu: NU, hamtare: hamtare({ nere: ['baverbutiken'] }) });
    assert.equal(r1.attPosta.length, 2);
    assert.deepEqual(r1.postade, []);
    const ko = JSON.parse(readFileSync(ATT_POSTA(rot), 'utf8'));
    assert.equal(ko.kanalId, 'C-TEST');
    assert.deepEqual(ko.meddelanden.map((m) => m.id), ['m1', 'm2']);
    assert.match(ko.meddelanden[0].text, /baverbutiken\.se svarar inte/);
    let minne = lasMinne(rot);
    assert.deepEqual(minne.skickade, [], 'inget kvitterat än');
    assert.deepEqual(Object.keys(minne.butiker), ['baverbutiken', 'carashell']);
    assert.equal(minne.senasteKorning, NU.toISOString());

    // Sessionen postar m1 och kvitterar. m2 ligger kvar i kön.
    const k = kvitteraFran({ rot, ids: ['m1'], nu: NU });
    assert.deepEqual(k.kvitterade, ['m1']);
    assert.equal(k.kvar, 1);
    minne = lasMinne(rot);
    assert.deepEqual(minne.skickade.map((s) => s.nyckel), ['butik:baverbutiken']);
    assert.equal(JSON.parse(readFileSync(ATT_POSTA(rot), 'utf8')).meddelanden.length, 1);

    // Nästa timme: sajten fortfarande nere ⇒ redan postat; pengar-larmet är fortfarande okvitterat ⇒ i kön igen (inte dubblerat i minnet).
    const r2 = await korAkut({ rot, env: {}, nu: new Date(NU.getTime() + 3_600_000), hamtare: hamtare({ nere: ['baverbutiken'] }) });
    assert.deepEqual(r2.nya.map((l) => l.nyckel), ['pengar:1107817401910319:kamp1:2026-09-27']);
    assert.equal(r2.sammanfattning.larm.redan, 1);
    kvitteraFran({ rot, ids: ['alla'], nu: NU });
    assert.ok(!existsSync(ATT_POSTA(rot)), 'tom kö ⇒ filen bort');

    // Sajten uppe igen ⇒ ett "löst" att posta; kvittera det ⇒ tillståndet är löst i minnet.
    const r3 = await korAkut({ rot, env: {}, nu: new Date(NU.getTime() + 2 * 3_600_000), hamtare: hamtare({ nere: [] }) });
    assert.deepEqual(r3.nya, []);
    assert.deepEqual(r3.losta.map((s) => s.nyckel), ['butik:baverbutiken']);
    assert.equal(r3.attPosta[0].slag, 'lost');
    assert.match(r3.attPosta[0].text, /✅ Löst · Bäverbutiken/);
    kvitteraFran({ rot, ids: ['alla'], nu: NU });
    minne = lasMinne(rot);
    assert.ok(minne.skickade.find((s) => s.nyckel === 'butik:baverbutiken').lost);

    // Går den ner igen är det ett nytt larm.
    const r4 = await korAkut({ rot, env: {}, nu: new Date(NU.getTime() + 3 * 3_600_000), torr: true, hamtare: hamtare({ nere: ['baverbutiken'] }) });
    assert.deepEqual(r4.nya.map((l) => l.nyckel), ['butik:baverbutiken']);
  } finally { rmSync(rot, { recursive: true, force: true }); }
});

test('med postare: postas direkt och skrivs in i minnet; ett fel lämnar meddelandet i kön', async () => {
  const rot = lagRepo();
  try {
    const postat = [];
    const posta = async (m) => { if (m.slag === 'nytt' && m.typ === 'pengar') throw new Error('Slack svarade not_in_channel'); postat.push(m.id); return { ts: '1.2', vag: 'test' }; };
    const r = await korAkut({ rot, env: {}, nu: NU, posta, hamtare: hamtare({ nere: ['baverbutiken'] }) });
    assert.deepEqual(postat, ['m1']);
    assert.deepEqual(r.postade.map((p) => p.id), ['m1']);
    assert.deepEqual(r.fel.map((f) => f.id), ['m2']);
    assert.equal(r.attPosta.length, 1);
    const minne = lasMinne(rot);
    assert.deepEqual(minne.skickade.map((s) => s.nyckel), ['butik:baverbutiken']);
    assert.equal(JSON.parse(readFileSync(ATT_POSTA(rot), 'utf8')).meddelanden[0].id, 'm2');
    const senaste = JSON.parse(readFileSync(join(rot, 'akut', 'output', 'senaste.json'), 'utf8'));
    assert.equal(senaste.sammanfattning.larm.nya, 2);
  } finally { rmSync(rot, { recursive: true, force: true }); }
});

test('en nedlagd butik utan ordrar mäts inte, och en butik som var i drift men inte kan läsas larmar om nyckeln', async () => {
  const rot = lagRepo();
  try {
    // Första körningen: carashell i drift. Sedan blir den "fel" i snapshoten.
    await korAkut({ rot, env: {}, nu: NU, hamtare: hamtare({ brinner: false }) });
    const snap = { ...SNAPSHOT, byggd: '2026-09-27T14:30:00Z', butiker: SNAPSHOT.butiker.map((b) => (b.id === 'carashell' ? { ...b, status: 'fel', orsak: 'SHOPIFY_*_yitrbk_m3: token-svaret var inte JSON (400) — appen är troligen inte installerad', dagar: [] } : b)) };
    writeFileSync(join(rot, 'stonebite', 'data', 'snapshot.json'), JSON.stringify(snap));
    const r = await korAkut({ rot, env: {}, nu: new Date(NU.getTime() + 3_600_000), torr: true, hamtare: hamtare({ brinner: false }) });
    assert.deepEqual(r.nya.map((l) => l.nyckel), ['nyckel:shopify:carashell']);
    assert.equal(r.sammanfattning.sajter.matta, 2, 'carashell.se mäts fortfarande — minnet vet att den var i drift');
  } finally { rmSync(rot, { recursive: true, force: true }); }
});

test('Meta-token död: ett larm, inga konto-larm, och det syns i noteringarna att kontona inte mättes', async () => {
  const rot = lagRepo();
  try {
    const meta = [
      { id: '1867947880635861', namn: 'MagiBorsten', verksamhet: 'baverbutiken', konto: null, kampanjer: null, fel: { kod: 190, message: 'Error validating access token' } },
      { id: '1107817401910319', namn: 'Magiborsten UK', verksamhet: 'baverbutiken', konto: null, kampanjer: null, fel: { kod: 190, message: 'Error validating access token' } },
    ];
    const r = await korAkut({ rot, env: {}, nu: NU, torr: true, hamtare: hamtare({ meta }) });
    assert.deepEqual(r.nya.map((l) => l.nyckel), ['nyckel:meta']);
    assert.equal(r.sammanfattning.meta.lasta, 0);
  } finally { rmSync(rot, { recursive: true, force: true }); }
});
