import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { klassa, NIVA } from '../klassa.mjs';
import { maska, maskaTaggar, maskaKontakt } from '../maska.mjs';
import { tolkaAnnonsnamn, verksamhetFor, handleUrLank, marknadUrSokvag, normaliseraPrefix } from '../koppla.mjs';
import { byggRad, sammanstall, kontrolleraDom, brandnyckel } from '../samla.mjs';
import { rapportSv, rapportEn, leadsSektion } from '../rapport.mjs';
import { sedanUnix, rensaSedda, skrivLogg, lasLogg } from '../lage.mjs';
import { skapaKlient, hamtaKommentarer, arOmforsok, lankUrCreative } from '../meta.mjs';

const KONFIG = JSON.parse(readFileSync(new URL('../konfig.json', import.meta.url), 'utf8'));

// ------------------------------------------------------------------ klassa

test('riktiga kommentarer 2026-09-24 hamnar i rätt hink', () => {
  const fall = [
    ['Fukten då???', NIVA.INVANDNING, 'fukt/mögel/ventilation'],
    ['Finns på Temu för 300👍', NIVA.INVANDNING, 'pris/konkurrent'],
    ['Värsta tunna skräpet som går sönder direkt', NIVA.INVANDNING, 'skepsis/kritik'],
    ['Vadkostar 9.5m', NIVA.FRAGA, 'pris'],
    ['Vad kostar den?', NIVA.FRAGA, 'pris'],
    ['Bäverbukten finns det även till helintegrerade husbilar?', NIVA.FRAGA, 'storlek/passform'],
    ['Jag har beställt men inte fått något på 3 veckor', NIVA.ALLVARLIGT, 'ej levererat'],
    ['Bluff!! Köp inte', NIVA.ALLVARLIGT, 'bluff-anklagelse'],
    ['I bought one and it broke after a week', NIVA.ALLVARLIGT, 'missnöjd köpare'],
    ['Is this legit?', NIVA.INVANDNING, 'förtroende'],
    ['How much for the 21ft?', NIVA.FRAGA, 'pris'],
    ['@…', NIVA.OVRIGT, 'tagg/vän'],
    ['Beställde en, kom idag, supernöjd!', NIVA.OVRIGT, 'beröm'],
  ];
  for (const [text, niva, kategori] of fall) {
    const k = klassa(text);
    assert.equal(k.niva, niva, text);
    assert.equal(k.kategori, kategori, text);
  }
});

test('"Sebra" är inte beröm — korta berömord kräver ordgräns', () => {
  const k = klassa('Den husbilen kommer att se ut som en Sebra till sommaren. Blåsten kommer att göra så banden vibrerar och nöter.');
  assert.equal(k.niva, NIVA.INVANDNING);
});

test('en köpfråga som jämför med Temu är en prisinvändning, inte en fråga', () => {
  assert.equal(klassa('Varför kostar den 500 när den finns på Temu?').niva, NIVA.INVANDNING);
});

// ------------------------------------------------------------------ maska

test('taggade namn byts mot @… med message_tags, e-post och telefon maskeras', () => {
  const text = 'Ulla Tönnerfors Ett heltäckande drar man på';
  assert.equal(maskaTaggar(text, [{ offset: 0, length: 15, type: 'user' }]), '@… Ett heltäckande drar man på');
  assert.equal(maskaKontakt('mejla kalle.anka@gmail.com'), 'mejla ka***@gmail.com');
  assert.equal(maskaKontakt('ring 070-123 45 67'), 'ring [telefon]');
  assert.equal(maskaKontakt('order #6898 och YT2512345678901'), 'order #6898 och YT2512345678901');
  assert.equal(maska('A  B\n C', []), 'A B C');
});

test('en sidtagg (type page) maskeras inte — det är butikens namn, inte en person', () => {
  assert.equal(maskaTaggar('Bäverbutiken hej', [{ offset: 0, length: 12, type: 'page' }]), 'Bäverbutiken hej');
});

// ------------------------------------------------------------------ koppla

test('annonsnamnet i delar: prefix, marknad, vinkel, format', () => {
  assert.deepEqual(tolkaAnnonsnamn('Takoverdrag_PD_10_H1'), { prefix: 'Takoverdrag', vinkel: 'PD', format: 'video', marknad: null, nr: 10 });
  assert.deepEqual(tolkaAnnonsnamn('CaraShellRoof_NO_PD_106_H1'), { prefix: 'CaraShellRoof', vinkel: 'PD', format: 'video', marknad: 'NO', nr: 106 });
  assert.equal(tolkaAnnonsnamn('DryTrek_Damasker_PD_14_1').vinkel, 'PD');
  assert.equal(tolkaAnnonsnamn('Solcellslampa_SP_3').format, 'bild');
  assert.equal(tolkaAnnonsnamn('Motorhölje_OB_2_C1').format, 'karusell');
  assert.equal(normaliseraPrefix('Motorhölje'), 'motorholje');
});

test('verksamheten följer landningslänken — och en annons på fel sida är en konflikt', () => {
  const ops = [{ brand: 'CaraShell', bas: 'carashell' }];
  const cs = verksamhetFor({ lank: 'https://carashell.se/nb/products/takskyddet?country=NO', sida: '1381171778405935', kontoId: '915422744950975', annonsnamn: 'CaraShellRoof_NO_PD_106_H1' }, { konfig: KONFIG, ops });
  assert.equal(cs.verksamhet, 'CaraShell');
  assert.equal(cs.marknad, 'NO');
  assert.equal(cs.konflikt, null);
  const fel = verksamhetFor({ lank: 'https://carashell.se/products/takskyddet', sida: '678639638662543', kontoId: '1867947880635861', annonsnamn: 'X_PD_1_1' }, { konfig: KONFIG, ops });
  assert.equal(fel.verksamhet, 'CaraShell');
  assert.match(fel.konflikt, /Bäverbutiken/);
  const bv = verksamhetFor({ lank: 'https://baverbutiken.se/products/x', sida: '678639638662543', kontoId: '1867947880635861', annonsnamn: 'Batmotor_SP_1_H11' }, { konfig: KONFIG, ops });
  assert.deepEqual([bv.verksamhet, bv.marknad, bv.konflikt], ['Bäverbutiken', 'SE', null]);
});

test('handle och marknad ur länken', () => {
  assert.deepEqual(handleUrLank('https://carashell.com/en/products/takskyddet?country=US'), { typ: 'products', handle: 'takskyddet' });
  assert.deepEqual(handleUrLank('https://baverbutiken.se/pages/axelbalte-lagerrensning'), { typ: 'pages', handle: 'axelbalte-lagerrensning' });
  assert.equal(marknadUrSokvag('https://carashell.se/fi/products/x'), 'FI');
  assert.equal(marknadUrSokvag('https://carashell.se/products/x'), null);
  assert.equal(lankUrCreative({ object_story_spec: { video_data: { call_to_action: { value: { link: 'https://a.se/p' } } } } }), 'https://a.se/p');
});

// ------------------------------------------------------------------ samla + rapport

const ANNONS = { id: '1', name: 'Takoverdrag_PD_10_H1', lank: 'https://baverbutiken.se/products/takoverdrag?utm=x', kampanj: 'Taköverdrag', konto: '1867947880635861', spend: 50, status: 'ACTIVE' };
const rad = (id, message, extra = {}) => byggRad(
  { id, message, message_tags: [], created_time: '2026-09-24T08:00:00+0000', like_count: 0, comment_count: 0, post: '678639638662543_9', sida: '678639638662543', ...extra },
  { annonser: [ANNONS], konfig: KONFIG, hamtad: '2026-09-24T09:00:00Z' },
);

test('loggraden bär ingen avsändare och ingen utm-parameter', () => {
  const r = rad('9_1', 'Fukten då???', { from: { name: 'Anna Andersson' } });
  assert.equal(JSON.stringify(r).includes('Anna'), false);
  assert.equal(r.lank, 'https://baverbutiken.se/products/takoverdrag');
  assert.equal(r.verksamhet, 'Bäverbutiken');
  assert.equal(r.kategori, 'fukt/mögel/ventilation');
});

test('sammanställningen: obesvarade frågor, invändningar per produkt, 🆕 bara med historik', () => {
  const nya = [rad('9_1', 'Fukten då???'), rad('9_2', 'Vad kostar den?'), rad('9_3', 'Vad kostar 9 m?', { comment_count: 2 }), rad('9_4', 'Bluff!! Köp inte')];
  const forsta = sammanstall({ nya, trend: nya, annonser: [{ name: 'Takoverdrag_OB_4_H1', verksamhet: 'Bäverbutiken', prefix: 'Takoverdrag', vinkel: 'OB', status: 'ACTIVE' }], konfig: KONFIG });
  const v = forsta['Bäverbutiken'];
  assert.equal(v.nya, 4);
  assert.deepEqual(v.fragor.map((r) => r.id), ['9_2']); // 9_3 har redan svar i tråden
  assert.deepEqual(v.allvarliga.map((r) => r.id), ['9_4']);
  const p = v.produkter.find((x) => x.prefix === 'Takoverdrag');
  assert.deepEqual(p.ob_aktiva, ['Takoverdrag_OB_4_H1']);
  assert.equal(p.kluster[0].ny_invandning, false, 'första körningen: inget är "nytt"');
  const gammal = { ...rad('8_1', 'Går den sönder?'), tid: '2026-09-20T08:00:00+0000' };
  const andra = sammanstall({ nya, trend: [gammal, ...nya], annonser: [], konfig: KONFIG });
  assert.equal(andra['Bäverbutiken'].produkter[0].kluster.find((k) => k.kategori === 'fukt/mögel/ventilation').ny_invandning, true);
});

test('domen: utan belägg, påhittade belägg, fel verksamhet, gammal dom eller svar utan engelska stoppas', () => {
  const kandaIds = new Set(['9_1', '9_2', 'cs_1']);
  const nyaIds = new Set(['9_2']);
  const verkPerId = new Map([['9_1', 'Bäverbutiken'], ['9_2', 'Bäverbutiken'], ['cs_1', 'CaraShell']]);
  const { fel, dom } = kontrolleraDom({
    hamtad: 'H1',
    leads: [
      { verksamhet: 'Bäverbutiken', typ: 'invändning', lead: 'Fukt', belagg: ['9_1'] },
      { verksamhet: 'Bäverbutiken', typ: 'hook', lead: 'Utan belägg', belagg: [] },
      { verksamhet: 'Bäverbutiken', typ: 'vinkel', lead: 'Påhittat', belagg: ['finns_inte'] },
      { verksamhet: 'CaraShell', typ: 'invändning', lead: 'Bäver-belägg i CaraShell', belagg: ['9_1'] },
      { verksamhet: 'Carashel', typ: 'invändning', lead: 'Felstavad', belagg: ['cs_1'] },
    ],
    svar: [
      { id: '9_2', text: 'Den kostar 999 kr.', en: 'It costs 999 SEK.', fakta: 'produktsidan' },
      { id: '9_2', text: 'Utan källa', en: 'x' },
      { id: '9_2', text: 'Utan engelska', fakta: 'produktsidan' },
    ],
    atgarder: { '9_2': { sv: 'Svara', en: 'Reply' }, '9_1': { sv: 'gammal' } },
  }, { kandaIds, nyaIds, verkPerId, hamtad: 'H1', verksamheter: new Set(['Bäverbutiken', 'CaraShell']) });
  assert.equal(dom.leads.length, 1);
  assert.equal(dom.svar.length, 1);
  assert.deepEqual(Object.keys(dom.atgarder), ['9_2']);
  assert.equal(fel.length, 7);
  assert.ok(fel.some((f) => /annan verksamhet/.test(f)));
  assert.ok(fel.some((f) => /Carashel/.test(f)));
  const gammal = kontrolleraDom({ hamtad: 'H0', leads: [] }, { kandaIds, nyaIds, hamtad: 'H1' });
  assert.match(gammal.fel[0], /dagens hämtning är H1/);
});

test('ett falsklarm som sessionen dömt pingar inte VA:n och står inte under 🔴', () => {
  const nya = [rad('9_4', 'Köp inte detta.'), rad('9_5', 'Har inte fått min order')];
  const v = sammanstall({ nya, trend: nya, annonser: [], konfig: KONFIG })['Bäverbutiken'];
  const dom = { atgarder: { '9_4': { falsklarm: true, sv: 'ingen kund', en: 'not a customer' }, '9_5': { sv: 'VA', en: 'VA replies' } } };
  const en = rapportEn(v, { datum: '2026-09-24', dom, va: ['123'] });
  assert.match(en, /Needs a human today \(1\)/);
  assert.match(en, /<@123> 1 comment needs you today/);
  assert.doesNotMatch(en, /Köp inte detta/);
  assert.match(rapportSv({ datum: '2026-09-24', sedan: '2026-09-23T00:00:00Z', lasning: {}, sammanstallning: { Bäverbutiken: v } }, dom), /falsklarm \(1\)/);
});

test('svenska rapporten säger vad som inte gick att läsa, i stället för noll', () => {
  const sv = rapportSv({ datum: '2026-09-24', sedan: '2026-09-21T20:00:00Z', lasning: { konton: [{ namn: 'nya kungen', fel: 'nyckel saknas' }], sidor: [] }, sammanstallning: {} });
  assert.match(sv, /Gick inte att läsa/);
  assert.match(sv, /nya kungen: nyckel saknas/);
  assert.match(sv, /Inga nya kommentarer/);
});

test('leadsektionen bär källan och kalla=voc', () => {
  const s = leadsSektion('2026-09-24', [{ verksamhet: 'Bäverbutiken', prefix: 'Batmotor', typ: 'invändning', lead: '"Går sönder direkt" ×3', belagg: ['1', '2', '3'] }]);
  assert.match(s, /^## 2026-09-24/);
  assert.match(s, /`kalla=voc`/);
  assert.match(s, /belägg: 1, 2, 3/);
  assert.equal(leadsSektion('2026-09-24', []), null);
});

test('brandnyckeln matchar bonus/personer.json och stonebite', () => {
  assert.equal(brandnyckel('Bäverbutiken'), 'baverbutiken');
  assert.equal(brandnyckel('CaraShell'), 'carashell');
});

// ------------------------------------------------------------------ lage

test('fönstret: första körningen 72 h bakåt, sedan förra hämtningen minus överlapp', () => {
  const nu = Date.parse('2026-09-24T10:00:00Z');
  assert.equal(sedanUnix({ senast_hamtat: null }, nu, { forstaTimmar: 72 }), (nu - 72 * 3600e3) / 1000);
  assert.equal(sedanUnix({ senast_hamtat: '2026-09-23T10:00:00Z' }, nu, { overlappTimmar: 3 }), Date.parse('2026-09-23T07:00:00Z') / 1000);
  assert.deepEqual(rensaSedda({ a: '2026-09-01', b: '2026-09-20' }, '2026-09-24', 21), { b: '2026-09-20' });
});

test('loggen skrivs per månad och senaste raden per id vinner', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'komm-'));
  skrivLogg([{ id: 'a', tid: '2026-09-30T10:00:00+0000', v: 1 }, { id: 'b', tid: '2026-10-01T10:00:00+0000' }], mapp);
  skrivLogg([{ id: 'a', tid: '2026-09-30T10:00:00+0000', v: 2 }], mapp);
  assert.ok(existsSync(join(mapp, 'logg', '2026-09.jsonl')) && existsSync(join(mapp, 'logg', '2026-10.jsonl')));
  const rader = lasLogg('2026-09-15', mapp);
  assert.equal(rader.find((r) => r.id === 'a').v, 2);
  assert.equal(rader.length, 2);
});

// ------------------------------------------------------------------ meta (utan nät)

test('batch: ett tak på en del av batchen tas om, resten behålls; delade trådar räknas en gång', async () => {
  let anrop = 0;
  const fetchFn = async (url, opt) => {
    anrop += 1;
    if (!opt?.method) return { ok: true, status: 200, json: async () => ({ access_token: 'SIDTOKEN', name: 'Sida' }) };
    const batch = JSON.parse(new URLSearchParams(opt.body).get('batch'));
    return {
      ok: true, status: 200,
      json: async () => batch.map((b, i) => {
        if (anrop === 2 && i === 1) return { code: 400, body: JSON.stringify({ error: { code: 17, message: 'User request limit reached' } }) };
        return { code: 200, body: JSON.stringify({ data: [{ id: '111_5', message: 'Fukten då???', created_time: '2026-09-24T08:00:00+0000' }] }) };
      }),
    };
  };
  const klient = skapaKlient({ token: 'T', fetchFn, sov: async () => {}, logg: () => {} });
  const inlagg = new Map([['9_111', []], ['9_222', []]]);
  const { kommentarer, sidor } = await hamtaKommentarer(klient, inlagg, { sedanUnix: 0, logg: () => {} });
  assert.equal(kommentarer.length, 1, 'samma kommentar på två inlägg räknas en gång');
  assert.equal(kommentarer[0].post, '9_111', 'inlägget som äger kommentaren blir post');
  assert.deepEqual(kommentarer[0].poster.sort(), ['9_111', '9_222']);
  assert.equal(sidor[0].kommentarer, 1);
  assert.equal(anrop, 3, 'sidtoken + batch + omtag av den strypta delen');
});

test('en sida utan sidtoken rapporteras med orsak, aldrig som noll kommentarer', async () => {
  const fetchFn = async () => ({ ok: false, status: 400, json: async () => ({ error: { code: 10, message: 'This endpoint requires the pages_read_engagement permission. Refer to https://x' } }) });
  const klient = skapaKlient({ token: 'T', fetchFn, sov: async () => {}, logg: () => {} });
  const { sidor } = await hamtaKommentarer(klient, new Map([['77_1', []]]), { sedanUnix: 0, logg: () => {} });
  assert.equal(sidor[0].kommentarer, null);
  assert.match(sidor[0].fel, /pages_read_engagement/);
  assert.doesNotMatch(sidor[0].fel, /Refer to/);
});

test('omförsök bara på tak och tillfälliga fel', () => {
  assert.equal(arOmforsok({ code: 17 }), true);
  assert.equal(arOmforsok({ code: 613 }), true);
  assert.equal(arOmforsok({ code: 100 }), false);
  assert.equal(arOmforsok({ code: 190 }), false);
});

test('negationer vänder inte en kommentar till allvarlig (granskningens falsklarm 2026-09-24)', () => {
  for (const t of ['Köpte en, skit bra!', 'Köpte två förra året, inget dåligt att säga', 'Köpte en, den har inte gått sönder', 'I bought one, not cheap but worth it', 'Great for a trip offroad', 'Det här är ingen bluff', 'Helt ofarligt?', 'Är den ogiftig?', 'Har inte fått chansen att testa', 'Prisvärd och bra!', 'Ska beställa två direkt!']) {
    assert.notEqual(klassa(t).niva, NIVA.ALLVARLIGT, t);
  }
  assert.equal(klassa('Finns på temu https://temu.com/x').kategori, 'pris/konkurrent');
  assert.equal(klassa('Kolla https://spam.site').kategori, 'spam/länk');
  assert.equal(klassa('Köpte en, gick sönder efter en vecka').kategori, 'missnöjd köpare');
  assert.equal(klassa('utrusta båten').niva, NIVA.OVRIGT);
});

test('namn, adress och telefon i fritext maskeras (granskningens läckor 2026-09-24)', () => {
  const ut = maska('Har inte fått min order. Mvh Kalle Svensson, Storgatan 5, 123 45 Umeå, tel (070) 123 45 67');
  assert.doesNotMatch(ut, /Kalle|Svensson|Storgatan|123 45|070/);
  assert.equal(maska('mejla åsa.öberg@telia.se', []), 'mejla ås***@telia.se');
  assert.equal(maska('@kalle_88 kolla', []), '@… kolla');
  assert.equal(maska('Hej 😀 Anna Berg du', [{ offset: 5, length: 9, type: 'user', name: 'Anna Berg' }]), 'Hej 😀 @… du');
  assert.equal(maska('Hej Anna Berg du', [{ offset: 99, length: 9, type: 'user', name: 'Anna Berg' }]), 'Hej @… du', 'fel offset: namnet maskeras ändå');
  assert.equal(maska('Anna Bergström hej', [{ offset: 0, length: 9, type: 'user', name: 'Anna Berg' }, { offset: 0, length: 14, type: 'user', name: 'Anna Bergström' }]), '@… hej', 'överlappande taggar');
});

test('fönstret flyttas bara när allt lästes och hämtningen började där förra slutade', async () => {
  const { farFlytta } = await import('../kor.mjs');
  const ok = { lasning: { konton: [{ namn: 'SE' }], sidor: [{ id: 'fi', permanent: true, fel: 'ingen sidtoken' }], instagram: { id: 'instagram' } }, sedan: '2026-09-23T07:00:00Z' };
  assert.equal(farFlytta(ok, { senast_hamtat: '2026-09-23T10:00:00Z' }).ja, true, 'en sida utan sidtoken är permanent och stoppar inte');
  assert.equal(farFlytta({ ...ok, lasning: { ...ok.lasning, konton: [{ namn: 'SE', fel: 'token' }] } }, {}).ja, false);
  assert.equal(farFlytta({ ...ok, lasning: { ...ok.lasning, sidor: [{ id: 'x', fel: '3 inlägg: tak' }] } }, {}).ja, false);
  assert.equal(farFlytta({ ...ok, lasning: { ...ok.lasning, konton: [{ namn: 'nya kungen', valfri: true, fel: 'nyckel saknas' }, { namn: 'SE' }] } }, {}).ja, true, 'ett valfritt konto utan nyckel stoppar inte');
  const glapp = farFlytta({ ...ok, sedan: '2026-09-24T07:00:00Z' }, { senast_hamtat: '2026-09-21T10:00:00Z' });
  assert.equal(glapp.ja, false, '--timmar 24 efter tre dagars uppehåll får inte hoppa över två dygn');
});

test('Instagram: kommentarerna normaliseras, fönstret filtreras här och username begärs aldrig', async () => {
  const { hamtaIgKommentarer } = await import('../meta.mjs');
  let fraga = '';
  const fetchFn = async (url, opt) => {
    const batch = JSON.parse(new URLSearchParams(opt.body).get('batch'));
    fraga = batch[0].relative_url;
    return { ok: true, status: 200, json: async () => batch.map(() => ({ code: 200, body: JSON.stringify({ permalink: 'https://instagram.com/p/x', comments: { data: [
      { id: '1', text: 'Fukten då?', timestamp: '2026-09-24T08:00:00+0000', like_count: 2 },
      { id: '2', text: 'gammal', timestamp: '2026-09-01T08:00:00+0000' },
    ] } }) })) };
  };
  const klient = skapaKlient({ token: 'T', fetchFn, sov: async () => {}, logg: () => {} });
  const { kommentarer, status } = await hamtaIgKommentarer(klient, new Map([['m1', { post: '9_1', sida: '9' }]]), { sedanUnix: Date.parse('2026-09-20T00:00:00Z') / 1000, logg: () => {} });
  assert.doesNotMatch(fraga, /username/);
  assert.equal(kommentarer.length, 1);
  assert.deepEqual([kommentarer[0].id, kommentarer[0].kanal, kommentarer[0].message, kommentarer[0].post], ['ig_1', 'instagram', 'Fukten då?', '9_1']);
  assert.equal(status.kommentarer, 1);
});

test('svar föreslås på allt utom tomma kommentarer, taggade vänner och spam, med tak', () => {
  const rader = [rad('9_1', 'Vad kostar den?'), rad('9_2', 'Värsta skräpet'), rad('9_3', 'Har inte fått min order'), rad('9_4', 'Bra produkt!'), rad('9_5', 'Bluff!! Köp inte')];
  const ej = [{ ...rad('9_6', ''), kategori: 'tom' }, { ...rad('9_7', '@…'), kategori: 'tagg/vän' }, { ...rad('9_8', 'Köp här http://x'), kategori: 'spam/länk' }];
  const alla = [...rader, ...ej];
  const raderPerId = new Map(alla.map((r) => [r.id, r]));
  const ids = new Set(alla.map((r) => r.id));
  const svar = (id) => ({ id, text: 'x', en: 'x', fakta: 'produktsidan' });
  const { fel, dom } = kontrolleraDom({ svar: alla.map((r) => svar(r.id)) }, { kandaIds: ids, nyaIds: ids, raderPerId, maxSvar: 30 });
  assert.deepEqual(dom.svar.map((x) => x.id), ['9_1', '9_2', '9_3', '9_4', '9_5']);
  assert.equal(fel.length, 3);
  const manga = [...Array(8)].map((_, i) => rad(`8_${i}`, 'Vad kostar den?'));
  const m = kontrolleraDom({ svar: manga.map((r) => svar(r.id)) }, { kandaIds: new Set(manga.map((r) => r.id)), nyaIds: new Set(manga.map((r) => r.id)), raderPerId: new Map(manga.map((r) => [r.id, r])), maxSvar: 6 });
  assert.equal(m.dom.svar.length, 6);
});
