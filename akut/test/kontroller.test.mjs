// Akutlarmets domare: varje regel mot en fixtur, utan nät. Ett larm ska bära
// rubrik, siffror och Axels klick; en frisk nyckel ska kunna lösa ett larm;
// det som inte mättes ska varken larma eller friskförklara.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  domSajter, domKonton, domPengar, domPixel, domBackend, domRutiner, domNotion, domShopifyNycklar, domTvistgrad, domUtbetalningar,
  domAllt, isoVecka, kortNamn, verksamhetForKonto, verksamhetForButik, stockholmTimme, klockan, dagText,
} from '../kontroller.mjs';

const NU = new Date('2026-09-27T14:00:00Z'); // 16:00 svensk tid, söndag
const VARUMARKEN = [
  { id: 'baverbutiken', namn: 'Bäverbutiken', butiker: ['baverbutiken', 'beverbutikken'], konton: [{ id: '1867947880635861', namn: 'MagiBorsten', hela: true }, { id: '1107817401910319', namn: 'Magiborsten UK', utom: ['CARASHELL_'] }] },
  { id: 'carashell', namn: 'CaraShell', butiker: ['carashell'], konton: [{ id: '915422744950975', namn: 'OPS', prefix: ['CARASHELL_'] }, { id: '1107817401910319', namn: 'Magiborsten UK', prefix: ['CARASHELL_'] }] },
  { id: 'matstrumpor', namn: 'Matstrumpor', butiker: ['1r46tp-qx'], konton: [{ id: '730973156224390', namn: 'nya kungen', hela: true }] },
];

const sajt = (id, resultat, url = `https://${id}.se`) => ({ id, namn: id, url, verksamhet: 'baverbutiken', resultat });

test('sajterna: svarar = frisk; 5xx, timeout, 402 och lösenordssidan är tre olika larm med egna klick', () => {
  const { larm, friska } = domSajter([
    sajt('baverbutiken', { ok: true, status: 200, forsok: 1 }),
    sajt('carashell', { ok: false, status: 503, forsok: 3 }),
    sajt('matstrumpor', { ok: false, status: null, fel: 'ingen respons på 20 s', forsok: 3 }),
    sajt('kalender', { ok: false, status: 402, forsok: 3 }),
    sajt('drytrek', { ok: false, status: 200, losenord: true, forsok: 1 }),
  ], { nu: NU });
  assert.deepEqual(friska, ['butik:baverbutiken']);
  assert.deepEqual(larm.map((l) => l.nyckel), ['butik:carashell', 'butik:matstrumpor', 'butik:kalender', 'butik:drytrek']);
  assert.match(larm[0].rubrik, /carashell\.se svarar inte/);
  const strypt = domSajter([sajt('carashell', { ok: false, status: 429, forsok: 3 })]);
  assert.equal(strypt.larm.length, 0, '429 är Shopifys strypning, inte en död sida');
  assert.equal(strypt.friska.length, 0);
  assert.match(larm[0].rader[0], /svarar 503 på 3 försök/);
  assert.match(larm[1].rader[0], /ingen respons på 20 s/);
  assert.match(larm[2].rubrik, /STÄNGD av Shopify/);
  assert.match(larm[2].gor[0], /Billing/);
  assert.match(larm[3].rubrik, /lösenordsskyddad/);
  assert.match(larm[3].gor[0], /Password protection/);
  for (const l of larm) { assert.equal(l.typ, 'butik'); assert.ok(l.gor.length >= 1); assert.match(l.rader[0], /Mätt sön 27\/9 16:00\./); }
});

test('klockan och dagText: veckodag + datum står alltid med — Axel läser larmet dagar senare', () => {
  assert.equal(klockan(NU), 'sön 27/9 16:00');
  assert.equal(klockan(new Date('2026-09-27T22:29:00Z')), 'mån 28/9 00:29', 'svensk tid, inte UTC');
  assert.equal(dagText('2026-09-27'), 'sön 27/9', 'Metas eget dygn som text');
  assert.equal(dagText(new Date('2026-10-03T21:59:00Z')), 'lör 3/10');
  assert.equal(dagText(new Date('2026-10-03T22:01:00Z')), 'sön 4/10', 'midnatt räknas i Stockholm');
});

const konto = (id, namn, konto, extra = {}) => ({ id, namn, verksamhet: 'baverbutiken', konto, kampanjer: [], fel: null, ...extra });

test('annonskontona: aktivt = friskt; avstängt, obetalt och utgiftstak larmar; token död = ETT larm', () => {
  const ok = domKonton([konto('1', 'A', { account_status: 1, disable_reason: 0, currency: 'SEK', spend_cap: '0', amount_spent: '100' })], { nu: NU });
  assert.deepEqual(ok.larm, []);
  assert.deepEqual(new Set(ok.friska), new Set(['nyckel:meta', 'konto:1', 'spendcap:1']));

  const dåligt = domKonton([
    konto('2', 'B', { account_status: 2, disable_reason: 1, currency: 'SEK', spend_cap: '0', amount_spent: '5' }),
    konto('3', 'C', { account_status: 3, disable_reason: 0, currency: 'SEK', spend_cap: '0', amount_spent: '5' }),
    konto('4', 'D', { account_status: 1, disable_reason: 0, currency: 'SEK', spend_cap: '500000', amount_spent: '520000' }),
  ], { nu: NU });
  assert.deepEqual(dåligt.larm.map((l) => l.nyckel), ['konto:2', 'konto:3', 'spendcap:4']);
  assert.match(dåligt.larm[0].rubrik, /AVSTÄNGT av Meta/);
  assert.match(dåligt.larm[0].rader[0], /annonspolicy/);
  assert.match(dåligt.larm[0].gor[1], /Request review/);
  assert.match(dåligt.larm[1].rubrik, /OBETALT/);
  assert.match(dåligt.larm[1].gor[1], /Payment settings/);
  assert.match(dåligt.larm[2].rader[0], /5 000 kr är nådd/);
  assert.ok(dåligt.friska.includes('konto:4') && !dåligt.friska.includes('konto:2'));

  const token = domKonton([
    { id: '1', namn: 'A', konto: null, kampanjer: null, fel: { kod: 190, message: 'Error validating access token: Session has expired' } },
    { id: '2', namn: 'B', konto: null, kampanjer: null, fel: { kod: 190, message: 'Error validating access token' } },
  ], { nu: NU });
  assert.equal(token.larm.length, 1);
  assert.equal(token.larm[0].nyckel, 'nyckel:meta');
  assert.match(token.larm[0].gor[0], /System users/);
  assert.deepEqual(token.friska, []);

  // Strypt (kod 17): inte mätt — varken larm eller frisk. Och ett konto som
  // svarar gör att token-larmet inte går fast ett annat gav 190.
  const strypt = domKonton([{ id: '1', namn: 'A', konto: null, fel: { kod: 17, message: 'User request limit reached' } }], { nu: NU });
  assert.deepEqual(strypt, { larm: [], friska: [] });
  const blandat = domKonton([
    { id: '1', namn: 'A', konto: null, fel: { kod: 190, message: 'x' } },
    konto('2', 'B', { account_status: 1, disable_reason: 0, currency: 'SEK', spend_cap: '0', amount_spent: '5' }),
  ], { nu: NU });
  assert.deepEqual(blandat.larm, []);
});

test('pengar brinner: noll köp över 5 000, eller ROAS under halva break-even över 10 000 — aldrig under trösklarna', () => {
  const k = (kampanjer) => [{ id: '1107817401910319', namn: 'Magiborsten UK', verksamhet: 'baverbutiken', konto: { currency: 'SEK' }, kampanjer, fel: null }];
  const { larm } = domPengar(k([
    { id: 'a', namn: '1 CARASHELL_US_Taköverdrag | BE-ROAS 1.63 | 2026-09-16', spend: 18512.47, kop: 2, roas: 0.32 },
    { id: 'b', namn: 'Tofflorna UK | BE-ROAS 1,35', spend: 6000, kop: 0, roas: null },
    { id: 'c', namn: 'Utan break-even', spend: 12000, kop: 5, roas: 0.7 },
    { id: 'd', namn: 'Utan break-even men ok', spend: 12000, kop: 9, roas: 0.9 },
    { id: 'e', namn: 'Bra | BE ROAS 1.63', spend: 15000, kop: 20, roas: 1.0 },
    { id: 'f', namn: 'Litet | BE ROAS 1.63', spend: 4000, kop: 0, roas: null },
  ]), { nu: NU, varumarken: VARUMARKEN });
  assert.deepEqual(larm.map((l) => l.nyckel), [
    'pengar:1107817401910319:a:2026-09-27', 'pengar:1107817401910319:b:2026-09-27', 'pengar:1107817401910319:c:2026-09-27',
  ]);
  assert.equal(larm[0].verksamhet, 'carashell', 'delat konto: kampanjens prefix avgör verksamheten');
  assert.equal(larm[1].verksamhet, 'baverbutiken');
  assert.equal(larm[0].data.regel, 'under');
  assert.match(larm[0].rader[0], /18 512 kr sön 27\/9 med 2 köp, ROAS 0,32 \(break-even 1,63\)\. Mätt sön 27\/9 16:00, konto Magiborsten UK\./);
  assert.match(larm[0].rubrik, /^Pengar brinner sön 27\/9: 18 512 kr, ROAS 0,32$/);
  assert.equal(larm[1].data.regel, 'noll');
  assert.match(larm[1].rubrik, /^Pengar brinner sön 27\/9: 6 000 kr, 0 köp$/);
  assert.ok(!larm.some((l) => /i dag/.test(l.rubrik) || /i dag/.test(l.rader[0])), 'aldrig "i dag" — larmet läses dagar senare');
  assert.equal(larm[2].data.regel, 'under_okand');
  assert.match(larm[2].rader[0], /break-even står inte i kampanjnamnet/);
  assert.match(larm[0].gor[0], /kampanjen "1 CARASHELL_US_Taköverdrag"/, 'namnet utan BE-svansen');
});

test('pengar brinner: nyckeln bär Metas eget dygn, inte svenskt datum — samma larm efter svensk midnatt', () => {
  const k = (kampanjer) => [{ id: '1107817401910319', namn: 'Magiborsten UK', verksamhet: 'baverbutiken', konto: { currency: 'SEK' }, kampanjer, fel: null }];
  const efterMidnatt = new Date('2026-09-27T22:29:00Z'); // 00:29 svensk tid 28/9, 23:29 i London 27/9
  const { larm } = domPengar(k([
    { id: 'a', namn: '1 CARASHELL_US_Taköverdrag | BE-ROAS 1.63', spend: 22419, kop: 4, roas: 0.52, dag: '2026-09-27' },
    { id: 'b', namn: 'Utan dag | BE-ROAS 1.63', spend: 6000, kop: 0, roas: null },
    { id: 'c', namn: 'Trasig dag | BE-ROAS 1.63', spend: 6000, kop: 0, roas: null, dag: 'igår' },
  ]), { nu: efterMidnatt, varumarken: VARUMARKEN });
  assert.deepEqual(larm.map((l) => l.nyckel), [
    'pengar:1107817401910319:a:2026-09-27',
    'pengar:1107817401910319:b:2026-09-28',
    'pengar:1107817401910319:c:2026-09-28',
  ]);
  // Texten bär samma dygn som nyckeln: Metas dag på a, svensk dag på b — och mättiden är svensk.
  assert.match(larm[0].rubrik, /^Pengar brinner sön 27\/9: 22 419 kr, ROAS 0,52$/);
  assert.match(larm[0].rader[0], /22 419 kr sön 27\/9 med 4 köp, ROAS 0,52 .* Mätt mån 28\/9 00:29, konto Magiborsten UK\./);
  assert.match(larm[1].rubrik, /^Pengar brinner mån 28\/9: 6 000 kr, 0 köp$/);
  for (const l of larm) assert.match(l.rader.at(-1), /ditt beslut/);
});

test('pixeln: ordrar i butiken men noll köp i Meta trots spend — bara när kontona faktiskt lästes', () => {
  const butiker = [
    { id: 'baverbutiken', status: 'ok', dagar: [{ datum: '2026-09-26', ordrar: 80 }, { datum: '2026-09-27', ordrar: 20 }] },
    { id: 'matstrumpor', shop: '1r46tp-qx.myshopify.com', status: 'ok', dagar: [{ datum: '2026-09-27', ordrar: 30 }] },
  ];
  const konton = (kop) => [
    { id: '1867947880635861', namn: 'MagiBorsten', konto: {}, kampanjer: [{ id: 'x', namn: 'Motorhöljet', spend: 3000, kop }], fel: null },
    { id: '1107817401910319', namn: 'UK', konto: {}, kampanjer: [{ id: 'y', namn: '1 CARASHELL_US', spend: 9000, kop: 0 }], fel: null },
    { id: '730973156224390', namn: 'nya kungen', konto: null, kampanjer: null, fel: { kod: 17, message: 'strypt' } },
  ];
  const dod = domPixel({ butiker, konton: konton(0), varumarken: VARUMARKEN, nu: NU });
  assert.deepEqual(dod.larm.map((l) => l.nyckel), ['pixel:baverbutiken:2026-09-27'], 'Matstrumpor lästes inte (strypt) ⇒ inget larm där');
  assert.match(dod.larm[0].rubrik, /20 ordrar i butiken, 0 köp i Meta/);
  assert.match(dod.larm[0].rader[0], /3 000 kr spend/, 'CaraShells kampanj i UK-kontot räknas inte till Bäverbutiken (utom)');
  assert.deepEqual(domPixel({ butiker, konton: konton(1), varumarken: VARUMARKEN, nu: NU }).larm, []);
  const faOrdrar = butiker.map((b) => ({ ...b, dagar: [{ datum: '2026-09-27', ordrar: 5 }] }));
  assert.deepEqual(domPixel({ butiker: faOrdrar, konton: konton(0), varumarken: VARUMARKEN, nu: NU }).larm, []);
});

test('backend: /halsa ok = friskt; nere med och utan Railway; boten av; boten kraschar', () => {
  const bas = { url: 'https://www.stonebite.org/halsa', reserv: 'https://x.up.railway.app/halsa' };
  const ok = domBackend({ ...bas, svar: { ok: true, status: 200, json: { ok: true, autosvar: { brands: ['baverbutiken'], kor: true, omstarter: 0 } } } }, { nu: NU });
  assert.deepEqual(ok.larm, []);
  assert.deepEqual(ok.friska, ['backend:sajten', 'backend:autosvar', 'backend:autosvar-krasch']);

  const doman = domBackend({ ...bas, svar: { ok: false, status: 502 }, svarReserv: { ok: true, status: 200, json: { ok: true } } }, { nu: NU });
  assert.equal(doman.larm[0].nyckel, 'backend:sajten');
  assert.match(doman.larm[0].rubrik, /men Railway gör det/);
  assert.match(doman.larm[0].gor[0], /Squarespace/);

  const nere = domBackend({ ...bas, svar: { ok: false, status: null, fel: 'ingen respons på 20 s' }, svarReserv: { ok: false, status: 503 } }, { nu: NU });
  assert.match(nere.larm[0].rubrik, /nere \(Railway svarar inte\)/);
  assert.match(nere.larm[0].gor[0], /Deployments/);
  assert.deepEqual(nere.friska, []);

  const av = domBackend({ ...bas, svar: { ok: true, status: 200, json: { ok: true, autosvar: { brands: ['baverbutiken', 'carashell'], kor: false, omstarter: 0, saknar: ['KUNDTJANST_MAIL_PASS_CARASHELL'] } } } }, { nu: NU });
  assert.deepEqual(av.larm.map((l) => l.nyckel), ['backend:autosvar']);
  assert.match(av.larm[0].rader[0], /Saknar: KUNDTJANST_MAIL_PASS_CARASHELL/);
  assert.ok(av.friska.includes('backend:sajten') && !av.friska.includes('backend:autosvar'));

  const krasch = domBackend({ ...bas, svar: { ok: true, status: 200, json: { ok: true, autosvar: { brands: ['baverbutiken'], kor: true, omstarter: 7, senasteUtgang: 'kod 1' } } } }, { nu: NU });
  assert.deepEqual(krasch.larm.map((l) => l.nyckel), ['backend:autosvar-krasch']);
  assert.match(krasch.larm[0].rubrik, /7 omstarter/);

  // Vakten av med flit (inga brands) är inte ett larm.
  const ingen = domBackend({ ...bas, svar: { ok: true, status: 200, json: { ok: true, autosvar: null } } }, { nu: NU });
  assert.deepEqual(ingen.larm, []);
  assert.deepEqual(ingen.friska, ['backend:sajten']);
});

test('rutinerna: saknas larmar med kontot ur konfig; ok/sen är friska; avstängd och omätbar är tysta; ingen logg = notering', () => {
  const lage = { status: 'ok', rutiner: [
    { id: 'sparning-baverbutiken', namn: 'Spårningen Bäverbutiken', brand: 'baverbutiken', kommando: '/sparning', schematext: 'varje timme :16', status: 'saknas', ord: 'saknas — senast för 18 h sedan, väntat var 1 h', senast: '2026-09-26T19:21:38Z' },
    { id: 'stonebite', namn: 'Stonebite', brand: 'bolaget', status: 'ok', ord: 'körde för mindre än en timme sedan' },
    { id: 'nattvakt-carashell-takskyddet', namn: 'Nattvakten', brand: 'carashell', status: 'sen', ord: 'sen' },
    { id: 'nattvakt-hemvakten', namn: 'HeimGuard', brand: 'ops', status: 'avstangd', ord: 'avstängd' },
    { id: 'tvistkoll', namn: 'Tvistkollen', brand: 'baverbutiken', status: 'omatbar', ord: 'lämnar inget spår' },
  ] };
  const { larm, friska, notering } = domRutiner(lage, { nu: NU, rutinkonton: { kommentar: 'x', 'sparning-': 'claude5@stonebite.org', stonebite: 'Barkås' } });
  assert.deepEqual(larm.map((l) => l.nyckel), ['rutin:sparning-baverbutiken']);
  assert.equal(larm[0].verksamhet, 'baverbutiken');
  assert.match(larm[0].gor[0], /Routines \(kontot claude5@stonebite.org\)/);
  assert.match(larm[0].rader[0], /senast för 18 h sedan/);
  assert.deepEqual(friska, ['rutin:stonebite', 'rutin:nattvakt-carashell-takskyddet']);
  assert.equal(notering, null);
  assert.match(domRutiner({ status: 'saknas', orsak: 'git-loggen gick inte att läsa', rutiner: [] }, { nu: NU }).notering, /git-loggen/);
  assert.match(domRutiner(null, { nu: NU }).notering, /rutinvakten kunde inte döma/);
});

test('rutiner: akutlarmet dömer aldrig sig självt — varken larm eller frisk', () => {
  const lage = { status: 'ok', rutiner: [
    { id: 'akut', namn: 'Akutlarmet (Slack #urgent)', kommando: '/akut', status: 'saknas', ord: 'senast för 6 h sedan, väntat var 1 h' },
    { id: 'stonebite', namn: 'Stonebite', status: 'saknas', ord: 'senast för 5 h sedan' },
  ] };
  const { larm, friska } = domRutiner(lage, { nu: NU });
  assert.deepEqual(larm.map((l) => l.nyckel), ['rutin:stonebite']);
  assert.deepEqual(friska, []);
});

test('Notion: 200 friskt, 401 larm, annat = notering', () => {
  assert.deepEqual(domNotion({ status: 200 }).friska, ['nyckel:notion']);
  const d = domNotion({ status: 401 }, { nu: NU });
  assert.equal(d.larm[0].nyckel, 'nyckel:notion');
  assert.match(d.larm[0].gor[0], /Internal Integration Secret/);
  assert.match(domNotion({ status: 502 }).notering, /502/);
  assert.match(domNotion({ status: null, fel: 'ECONNRESET' }).notering, /ECONNRESET/);
});

test('Shopify-nycklar: en butik som var i drift och nu inte kan läsas larmar — 402, okänd butik och gammal drift gör det inte', () => {
  const minne = { butiker: {
    baverbutiken: { namn: 'Bäverbutiken', senastOk: '2026-09-27T10:00:00Z' },
    kalender: { namn: 'AdventLane', senastOk: '2026-09-27T10:00:00Z' },
    gammal: { namn: 'Gammal', senastOk: '2026-09-01T10:00:00Z' },
  } };
  const { larm, friska } = domShopifyNycklar({ butiker: [
    { id: 'baverbutiken', namn: 'Bäverbutiken', status: 'fel', orsak: 'SHOPIFY_*_SE: token-svaret var inte JSON (400) — appen är troligen inte installerad' },
    { id: 'kalender', namn: 'AdventLane', status: 'fel', orsak: 'Shopify svarade 402: {"errors":"Unavailable Shop"}' },
    { id: 'gammal', status: 'fel', orsak: '403' },
    { id: 'okand', status: 'fel', orsak: '403' },
    { id: 'carashell', status: 'ok' },
    { id: 'uk', status: 'av' },
  ], minne, nu: NU, varumarken: VARUMARKEN });
  assert.deepEqual(larm.map((l) => l.nyckel), ['nyckel:shopify:baverbutiken']);
  assert.equal(larm[0].verksamhet, 'baverbutiken');
  assert.match(larm[0].rader[0], /inte installerad/);
  assert.deepEqual(friska, ['nyckel:shopify:carashell']);
});

test('Shopify-nycklar: ett tillfälligt nätfel i snapshoten är ingen död nyckel', () => {
  const minne = { butiker: { beverbutikken: { namn: 'Beverbutikken', senastOk: '2026-09-27T10:00:00Z' } } };
  for (const orsak of [
    'Shopify svarade 503: DNS resolution failed (transient resolver error)',
    'fetch failed', 'Shopify svarade 502: Bad Gateway', 'ETIMEDOUT',
  ]) {
    const { larm, friska } = domShopifyNycklar({ butiker: [{ id: 'beverbutikken', status: 'fel', orsak }], minne, nu: NU, varumarken: VARUMARKEN });
    assert.deepEqual(larm, [], orsak);
    assert.deepEqual(friska, [], orsak);
  }
  const { larm } = domShopifyNycklar({ butiker: [{ id: 'beverbutikken', status: 'fel', orsak: 'Shopify svarade 401: Invalid API key' }], minne, nu: NU, varumarken: VARUMARKEN });
  assert.equal(larm.length, 1);
});

test('tvistgraden: chargebacks (inte inquiries) på 30 dagar mot ordrar — bara med underlag, en gång per vecka', () => {
  const butiker = [
    { id: 'baverbutiken', namn: 'Bäverbutiken', status: 'ok', dagar: Array.from({ length: 30 }, (_, i) => ({ datum: `2026-09-${String(i + 1).padStart(2, '0')}`, ordrar: 10 })) },
    { id: 'liten', namn: 'Liten', status: 'ok', dagar: [{ datum: '2026-09-27', ordrar: 50 }] },
  ];
  const tv = (brand, typ, initierad) => ({ brand, typ, initierad, status: 'won' });
  const tvister = { butiker: [{ id: 'baverbutiken', status: 'ok' }, { id: 'liten', status: 'ok' }], lista: [
    tv('baverbutiken', 'chargeback', '2026-09-20'), tv('baverbutiken', 'chargeback', '2026-09-22'), tv('baverbutiken', 'chargeback', '2026-09-25'),
    tv('baverbutiken', 'inquiry', '2026-09-25'), tv('baverbutiken', 'inquiry', '2026-09-26'),
    tv('baverbutiken', 'chargeback', '2026-07-01'),
    tv('liten', 'chargeback', '2026-09-26'), tv('liten', 'chargeback', '2026-09-27'),
  ] };
  const { larm } = domTvistgrad({ butiker, tvister, nu: NU, varumarken: VARUMARKEN });
  assert.deepEqual(larm.map((l) => l.nyckel), ['tvistgrad:baverbutiken:2026-W39'], 'Liten har för få ordrar för en dom');
  assert.match(larm[0].rubrik, /är 1 %/);
  assert.match(larm[0].rader[0], /3 chargebacks på 300 ordrar/);
  const fa = { ...tvister, lista: tvister.lista.slice(0, 1) };
  assert.deepEqual(domTvistgrad({ butiker, tvister: fa, nu: NU }).larm, []);
  assert.match(domTvistgrad({ butiker, tvister: null, nu: NU }).notering, /lästes inte/);
});

test('utbetalningar: failed inom 14 dagar larmar, gamla och betalda inte, hoppade butiker inte', () => {
  const { larm } = domUtbetalningar([
    { id: 'carashell', namn: 'Carashell', verksamhet: 'carashell', status: 'ok', payouts: [
      { id: '1', status: 'paid', date: '2026-09-26', amount: 1000, currency: 'SEK' },
      { id: '2', status: 'failed', date: '2026-09-25', amount: 105465.43, currency: 'SEK' },
      { id: '3', status: 'failed', date: '2026-08-01', amount: 500, currency: 'SEK' },
    ] },
    { id: 'no', status: 'hoppad', orsak: '403', payouts: [{ id: '9', status: 'failed', date: '2026-09-26', amount: 1 }] },
  ], { nu: NU });
  assert.deepEqual(larm.map((l) => l.nyckel), ['utbetalning:carashell:2']);
  assert.match(larm[0].rubrik, /MISSLYCKADES \(105 465 kr\)/);
  assert.match(larm[0].gor[1], /Bank account/);
});

test('domAllt: samlar allt, en nyckel är aldrig både larm och frisk, dagliga kontroller hoppas utan notering', () => {
  const inp = {
    sajter: [sajt('baverbutiken', { ok: false, status: 503, forsok: 3 })],
    konton: [konto('1', 'A', { account_status: 1, disable_reason: 0, currency: 'SEK', spend_cap: '0', amount_spent: '5' })],
    halsa: { url: 'u', reserv: 'r', svar: { ok: true, status: 200, json: { ok: true, autosvar: { brands: ['x'], kor: true, omstarter: 0 } } } },
    rutiner: { status: 'ok', rutiner: [{ id: 'stonebite', namn: 'S', status: 'ok' }] },
    notion: { status: 200 },
  };
  const utan = domAllt(inp, { nu: NU, varumarken: VARUMARKEN, dagligt: false });
  assert.deepEqual(utan.larm.map((l) => l.nyckel), ['butik:baverbutiken']);
  assert.ok(utan.friska.has('konto:1') && utan.friska.has('backend:sajten') && utan.friska.has('rutin:stonebite') && utan.friska.has('nyckel:notion'));
  assert.ok(!utan.friska.has('butik:baverbutiken'));
  assert.deepEqual(utan.noteringar, []);
  const med = domAllt(inp, { nu: NU, varumarken: VARUMARKEN, dagligt: true });
  assert.match(med.noteringar[0], /tvisterna lästes inte/);
});

test('hjälparna: ISO-vecka, kort kampanjnamn, verksamhet per konto/butik, svensk timme', () => {
  assert.equal(isoVecka(new Date('2026-09-27T12:00:00Z')), '2026-W39');
  assert.equal(isoVecka(new Date('2026-09-28T12:00:00Z')), '2026-W40');
  assert.equal(isoVecka(new Date('2027-01-01T12:00:00Z')), '2026-W53');
  assert.equal(kortNamn('1 CARASHELL_US_Taköverdrag Husvagn & Husbil 6,5 × 3 m | BE-ROAS 1.63 | 2026-09-16 – kopia'), '1 CARASHELL_US_Taköverdrag Husvagn & Husbil 6,5 × 3 m');
  assert.equal(kortNamn('x'.repeat(80)).length, 60);
  assert.equal(verksamhetForKonto(VARUMARKEN, '1107817401910319', '1 CARASHELL_US_Tak'), 'carashell');
  assert.equal(verksamhetForKonto(VARUMARKEN, '1107817401910319', 'Tofflorna UK'), 'baverbutiken');
  assert.equal(verksamhetForKonto(VARUMARKEN, '730973156224390'), 'matstrumpor');
  assert.equal(verksamhetForKonto(VARUMARKEN, '999'), null);
  assert.equal(verksamhetForButik(VARUMARKEN, { id: 'matstrumpor', shop: '1r46tp-qx.myshopify.com' }), 'matstrumpor');
  assert.equal(verksamhetForButik(VARUMARKEN, { id: 'beverbutikken' }), 'baverbutiken');
  assert.equal(stockholmTimme(new Date('2026-09-27T05:28:00Z')), 7, '05:28 UTC är 07:28 CEST');
  assert.equal(stockholmTimme(new Date('2026-12-01T06:28:00Z')), 7, '06:28 UTC är 07:28 CET');
});
