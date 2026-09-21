// Tester för brevlådebiblioteket (kundtjanst/brevlada.mjs) och CLI:ns
// kommandon (mail.mjs). Ingen nätverkstrafik: samma falska Roundcube som
// webmail.test.mjs, med listkolumnerna i den HTML-form Roundcube 1.7 skickar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Brevlada, tolkaListrad, valjBrevlada, utdragKring, arSessionsfel, datumUrRa } from '../brevlada.mjs';
import { korKommando, skrivUt, tolkaArgv } from '../mail.mjs';

const LOGIN_HTML = `<html><body><form action="/?_task=login"><input type="hidden" name="_token" value="TOK1"></form>
<script>rcmail.set_env({"task":"login","rcversion":10703,"request_token":"TOK1"});</script></body></html>`;
const MAIL_HTML = `<html><body><script>rcmail.set_env({"task":"mail","rcversion":10703,"mailbox":"INBOX","mailboxes_list":["INBOX","Drafts","Sent","Spam","Trash"],"request_token":"RT1","unread_counts":{"INBOX":1}});</script></body></html>`;

const fromto = (namn, adress) => `<span class="adr"><span title="${adress}" class="rcmContactAddress">${namn}</span></span>`;
const listJson = (rader, env) => JSON.stringify({
  action: 'list', env,
  exec: rader.map((r) => `this.add_message_row(${r.uid},${JSON.stringify({ subject: r.subject, fromto: r.fromto, date: r.date, size: '2 KB' })},${JSON.stringify({ seen: r.seen ? 1 : 0, ctype: r.ctype ?? 'text/plain', mbox: 'INBOX', flagged: 0 })},false);`).join('\n'),
});

const RA = {
  3: 'From: Anna <anna@gmail.com>\r\nTo: kundsupport@baverbutiken.se\r\nSubject: Var =?UTF-8?Q?=C3=A4r?= min order #1042?\r\nDate: Sat, 12 Sep 2026 10:00:00 +0200\r\nMessage-ID: <w3@gmail.com>\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nHar inte fått någon spårning på paketet.\r\n\r\n> Tidigare citat\r\n',
  2: 'From: Ola <ola@online.no>\r\nTo: kundsupport@baverbutiken.se\r\nSubject: Pakken har ikke kommet\r\nDate: Wed, 09 Sep 2026 09:00:00 +0200\r\nMessage-ID: <w2@online.no>\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nOrdre 1038 har ikke kommet. Jeg vurderer chargeback.\r\n',
  1: 'From: Gammal <gammal@x.se>\r\nTo: kundsupport@baverbutiken.se\r\nSubject: Gammalt\r\nDate: Sat, 01 Aug 2026 09:00:00 +0200\r\nMessage-ID: <w1@x.se>\r\n\r\nFör länge sedan.\r\n',
};

const SIDA1 = [
  { uid: 3, subject: 'Var &auml;r min order #1042?', fromto: fromto('Anna', 'anna@gmail.com'), date: 'Today 10:00', seen: 0 },
  { uid: 2, subject: 'Pakken har ikke kommet', fromto: fromto('Ola', 'ola@online.no'), date: '2026-09-09 09:00', seen: 1, ctype: 'multipart/mixed' },
];
const SIDA2 = [{ uid: 1, subject: 'Gammalt', fromto: fromto('Gammal', 'gammal@x.se'), date: '2026-08-01 09:00', seen: 1 }];

/** Falsk Roundcube. `dodaSessionEfter` = antal ajax-anrop innan sessionen "går ut" en gång. */
function falskWebmail({ dodaSessionEfter = 0 } = {}) {
  const anrop = [];
  let ajax = 0;
  let dod = false;
  const svar = (status, kropp, cookies = [], typ = 'text/html') => ({
    status, ok: status >= 200 && status < 300,
    headers: { getSetCookie: () => cookies, get: (n) => (n.toLowerCase() === 'content-type' ? typ : null) },
    text: async () => kropp,
    // Servern skickar UTF-8-bytes; klienten läser dem som latin1 och mime.mjs avkodar med charset.
    arrayBuffer: async () => { const b = Buffer.from(kropp, 'utf8'); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); },
  });
  const fetchFn = async (url, opts = {}) => {
    const u = new URL(url);
    const q = u.searchParams;
    anrop.push({ url, metod: opts.method ?? 'GET', headers: opts.headers ?? {}, body: opts.body ?? null });
    if (!u.search) return svar(200, LOGIN_HTML, ['roundcube_sessid=s1; path=/']);
    if (q.get('_task') === 'login' && opts.method === 'POST') {
      const f = new URLSearchParams(opts.body);
      if (f.get('_pass') !== 'rätt') return svar(401, LOGIN_HTML.replace('</form>', '<div class="error">Login failed.</div></form>'));
      dod = false;
      return svar(302, '', ['roundcube_sessid=s2; path=/', 'roundcube_sessauth=A; path=/']);
    }
    if (q.get('_task') === 'logout') return svar(200, LOGIN_HTML);
    if (q.get('_task') === 'mail' && !q.get('_action')) return svar(200, MAIL_HTML);
    if (dodaSessionEfter && ++ajax === dodaSessionEfter) dod = true;
    if (dod) return q.get('_action') === 'list' ? svar(200, LOGIN_HTML) : svar(200, '<!DOCTYPE html><html>login</html>');
    if (q.get('_action') === 'list') {
      const mbox = q.get('_mbox');
      const sida = Number(q.get('_page'));
      if (mbox !== 'INBOX') return svar(200, JSON.stringify({ action: 'list', env: {}, exec: 'this.display_message("Mailbox does not exist","error");' }), [], 'application/json');
      return svar(200, listJson(sida === 1 ? SIDA1 : sida === 2 ? SIDA2 : [], { messagecount: 3, pagecount: 2, current_page: sida, unread_counts: { INBOX: 1 } }), [], 'application/json');
    }
    if (q.get('_action') === 'viewsource') return RA[q.get('_uid')] ? svar(200, RA[q.get('_uid')], [], 'text/plain') : svar(404, 'Not found');
    return svar(404, 'okänt');
  };
  return { fetchFn, anrop };
}

const KONFIG = { id: 'baverbutiken', brand: 'Bäverbutiken', mail: { user: 'kundsupport@baverbutiken.se', pass: 'rätt', webmail: 'https://webmail.loopia.se/', inkorg: 'INBOX', konfigurerad: true, saknas: [] } };
const ny = (o) => { const f = falskWebmail(o); return { b: new Brevlada(KONFIG, { fetchFn: f.fetchFn, paus: 0 }), f }; };

test('tolkaListrad: HTML-kolumnerna blir text, adressen ur title, flaggorna booleska', () => {
  const r = tolkaListrad({ uid: '3', kolumner: { subject: 'Var &auml;r min order #1042?', fromto: fromto('Anna', 'anna@gmail.com'), date: 'Today 10:00', size: '2 KB' }, flaggor: { seen: 0, flagged: 1, ctype: 'multipart/mixed' } });
  assert.deepEqual(r, { uid: 3, amne: 'Var är min order #1042?', fran: 'Anna', franAdress: 'anna@gmail.com', datum: 'Today 10:00', storlek: '2 KB', last: false, flaggad: true, bilaga: true });
});

test('tolkaListrad: avsändare utan HTML men med adress i texten', () => {
  const r = tolkaListrad({ uid: 5, kolumner: { fromto: 'Ola <ola@online.no>', subject: 'Hei' }, flaggor: { seen: 1 } });
  assert.equal(r.franAdress, 'ola@online.no');
  assert.equal(r.last, true);
  assert.equal(r.bilaga, false);
});

test('mappar + lista: loggar in en gång, listar nyast först utan att hämta råmejl', async () => {
  const { b, f } = ny();
  assert.deepEqual(await b.mappar(), ['INBOX', 'Drafts', 'Sent', 'Spam', 'Trash']);
  const r = await b.lista({ antal: 20 });
  assert.equal(r.mapp, 'INBOX');
  assert.equal(r.sidor, 2);
  assert.equal(r.totalt, 3);
  assert.equal(r.olasta, 1);
  assert.deepEqual(r.rader.map((x) => x.uid), [3, 2]);
  assert.equal(r.rader[0].amne, 'Var är min order #1042?');
  assert.equal(r.rader[0].last, false);
  assert.equal(b.inloggningar, 1);
  assert.equal(f.anrop.filter((a) => a.url.includes('viewsource')).length, 0, 'listningen ska inte hämta råmejl');
  // antal klipper
  assert.equal((await b.lista({ antal: 1 })).rader.length, 1);
  assert.equal(b.inloggningar, 1, 'sessionen återanvänds');
});

test('las: tolkat mejl med citat bortklippt, ra ger råkällan, fel uid är ett fel', async () => {
  const { b } = ny();
  const m = await b.las(3);
  assert.equal(m.amne, 'Var är min order #1042?');
  assert.equal(m.fran.adress, 'anna@gmail.com');
  assert.equal(m.datum, '2026-09-12T08:00:00.000Z');
  assert.equal(m.text, 'Har inte fått någon spårning på paketet.');
  assert.match(m.helText, /Tidigare citat/);
  assert.equal(m.ra, undefined);
  const r = await b.las('3', { ra: true, maxTecken: 200 });
  assert.match(r.ra, /^From: Anna/);
  const k = await b.las(2, { maxTecken: 200 });
  assert.equal(k.text.includes('[klippt'), false, 'kort text klipps inte');
  await assert.rejects(() => b.las('abc'), /uid måste vara ett positivt heltal/);
  await assert.rejects(() => b.las(99), /HTTP 404/);
});

test('sok: ämne/avsändare utan att hämta råmejl; kropp söker texten och ger utdrag', async () => {
  const { b, f } = ny();
  const r = await b.sok('order 1042');
  assert.equal(r.traffar.length, 1);
  assert.equal(r.traffar[0].uid, 3);
  assert.equal(r.traffar[0].traff, 'ämne/avsändare');
  assert.equal(r.lasta, 3);
  assert.equal(r.sidorLasta, 2);
  assert.equal(f.anrop.filter((a) => a.url.includes('viewsource')).length, 0);
  const adr = await b.sok('ola@online.no');
  assert.deepEqual(adr.traffar.map((x) => x.uid), [2]);
  const tom = await b.sok('chargeback');
  assert.equal(tom.traffar.length, 0, 'ordet står bara i kroppen');
  const kropp = await b.sok('chargeback', { kropp: true });
  assert.equal(kropp.traffar.length, 1);
  assert.equal(kropp.traffar[0].traff, 'text');
  assert.match(kropp.traffar[0].utdrag, /vurderer chargeback/);
  await assert.rejects(() => b.sok('  '), /minst ett ord/);
  const max = await b.sok('a', { max: 1 });
  assert.equal(max.klippt, true);
  assert.equal(max.traffar.length, 1);
});

test('sok: maxSidor begränsar hur långt bakåt', async () => {
  const { b } = ny();
  const r = await b.sok('gammalt', { maxSidor: 1 });
  assert.equal(r.traffar.length, 0);
  assert.equal(r.sidorLasta, 1);
  const r2 = await b.sok('gammalt', { maxSidor: 5 });
  assert.equal(r2.traffar.length, 1);
});

test('medSession: går sessionen ut loggas in igen en gång och anropet görs om', async () => {
  const { b } = ny({ dodaSessionEfter: 2 });
  await b.lista();                        // ajax 1
  const r = await b.lista();              // ajax 2 → "utloggad" → ny inloggning → ajax 3
  assert.equal(r.rader.length, 2);
  assert.equal(b.inloggningar, 2);
  const m = await b.las(3);
  assert.equal(m.uid, 3);
  assert.equal(b.inloggningar, 2, 'sessionen lever efter ominloggningen');
});

test('parallella anrop före inloggningen ger EN inloggning (mätt skarpt 2026-09-21: annars 403)', async () => {
  const { b, f } = ny();
  const [m, l, s] = await Promise.all([b.mappar(), b.lista(), b.sok('order')]);
  assert.equal(m.length, 5);
  assert.equal(l.rader.length, 2);
  assert.equal(s.traffar.length, 1);
  assert.equal(b.inloggningar, 1);
  assert.equal(f.anrop.filter((a) => a.metod === 'POST').length, 1, 'exakt en login-POST');
  // Ett fel i ett anrop blockerar inte nästa.
  await assert.rejects(() => b.las(99), /HTTP 404/);
  assert.equal((await b.lista()).rader.length, 2);
});

test('tolkaListrad: citattecken i avsändarnamnet skalas av', () => {
  assert.equal(tolkaListrad({ uid: 1, kolumner: { fromto: fromto('Bäverbutiken.se &quot;(Shopify)&quot;', 'x@y.se') }, flaggor: {} }).fran, 'Bäverbutiken.se (Shopify)');
});

test('arSessionsfel känner igen Roundcubes utloggningstexter men inte andra fel', () => {
  assert.equal(arSessionsfel(new Error('Roundcube list-svaret var inte JSON — är sessionen utloggad? (steg 4)')), true);
  assert.equal(arSessionsfel(new Error('… i stället för råmejlet (steg 5, uid 3) — sessionen kan ha gått ut.')), true);
  assert.equal(arSessionsfel(new Error('Roundcube nekade listningen (403, steg 4) — request_token stämde inte.')), true);
  assert.equal(arSessionsfel(new Error('Mappen X finns inte i webbmejlen.')), false);
  assert.equal(arSessionsfel(new Error('Roundcube viewsource gav HTTP 404 (steg 5)')), false);
});

test('okänd mapp är ett tydligt fel, inte en tom lista', async () => {
  const { b } = ny();
  await assert.rejects(() => b.lista({ mapp: 'Finnsinte' }), /Mappen Finnsinte finns inte/);
});

test('fel lösenord: tydligt fel med variabelnamnet, ingen ominloggningsloop', async () => {
  const f = falskWebmail();
  const b = new Brevlada({ ...KONFIG, mail: { ...KONFIG.mail, pass: 'fel' } }, { fetchFn: f.fetchFn, paus: 0 });
  await assert.rejects(() => b.lista(), /nekade inloggningen/);
  assert.equal(f.anrop.filter((a) => a.metod === 'POST').length, 1);
});

test('valjBrevlada: angivet id vinner, enda konfigurerade väljs, annars tydligt fel', () => {
  const brands = [
    { id: 'baverbutiken', brand: 'Bäverbutiken', supportmail: 'kundsupport@baverbutiken.se', aktiv: true, mail: {}, shopify: {}, trosklar: {}, tvister: {} },
    { id: 'carashell', brand: 'CaraShell', supportmail: 'hello@carashell.se', aktiv: true, mail: {}, shopify: {}, trosklar: {}, tvister: {} },
  ];
  assert.throws(() => valjBrevlada(null, { env: {}, brands }), /Ingen brevlåda är konfigurerad.*KUNDTJANST_MAIL_PASS_BAVERBUTIKEN/);
  const en = valjBrevlada(null, { env: { KUNDTJANST_MAIL_PASS_BAVERBUTIKEN: 'x' }, brands });
  assert.equal(en.id, 'baverbutiken');
  assert.equal(en.mail.user, 'kundsupport@baverbutiken.se');
  const bada = { KUNDTJANST_MAIL_PASS_BAVERBUTIKEN: 'x', KUNDTJANST_MAIL_PASS_CARASHELL: 'y' };
  assert.throws(() => valjBrevlada(null, { env: bada, brands }), /Flera brevlådor.*--brand/);
  assert.equal(valjBrevlada('CaraShell', { env: bada, brands }).id, 'carashell');
  assert.throws(() => valjBrevlada('carashell', { env: { KUNDTJANST_MAIL_PASS_BAVERBUTIKEN: 'x' }, brands }), /saknar KUNDTJANST_MAIL_PASS_CARASHELL/);
  assert.throws(() => valjBrevlada('finnsinte', { env: bada, brands }), /finns inte\. Kända: baverbutiken, carashell/);
});

test('utdragKring + datumUrRa', () => {
  assert.equal(utdragKring('a'.repeat(200) + ' TRÄFF ' + 'b'.repeat(200), 'träff', 10), '…aaaaaaaaa TRÄFF bbbbbbbbb…');
  assert.equal(utdragKring('kort text', 'saknas'), 'kort text');
  assert.equal(datumUrRa(RA[2]).toISOString(), '2026-09-09T07:00:00.000Z');
  assert.equal(datumUrRa('Subject: x\r\n\r\nhej'), null);
});

test('CLI: tolkaArgv, kommandona och utskriften', async () => {
  assert.deepEqual(tolkaArgv(['las', '3', '--mapp', 'Sent', '--ra', '--json']), { _: ['las', '3'], mapp: 'Sent', ra: true, json: true });
  assert.deepEqual(tolkaArgv(['sok', 'order', '1042', '--kropp', '--sidor', '2']), { _: ['sok', 'order', '1042'], kropp: true, sidor: '2' });
  const { b } = ny();
  const kolla = await korKommando('kolla', { _: ['kolla'] }, b);
  assert.equal(kolla.ok, true);
  assert.match(skrivUt('kolla', kolla), /✅ baverbutiken: inloggad som kundsupport@baverbutiken.se, 5 mappar/);
  const lista = await korKommando('lista', { _: ['lista'], antal: '5' }, b);
  const ut = skrivUt('lista', lista);
  assert.match(ut, /INBOX — sida 1 av 2, 3 mejl, 1 olästa/);
  assert.match(ut, /3\s+•\s+Today 10:00\s+Anna\s+Var är min order #1042\?/);
  const las = await korKommando('las', { _: ['las', '3'] }, b);
  assert.match(skrivUt('las', las), /Från:  Anna <anna@gmail.com>\nTill:  kundsupport@baverbutiken.se\nDatum: 2026-09-12T08:00:00.000Z\nÄmne:  Var är min order #1042\?/);
  const sok = await korKommando('sok', { _: ['sok', 'chargeback'], kropp: true }, b);
  assert.match(skrivUt('sok', sok), /1 träffar på "chargeback" i INBOX \(3 mejl lästa/);
  assert.match(skrivUt('sok', sok), /↳ .*vurderer chargeback/);
  await assert.rejects(() => korKommando('las', { _: ['las'] }, b), /behöver ett uid/);
  await assert.rejects(() => korKommando('sok', { _: ['sok'] }, b), /behöver ett eller flera ord/);
  await assert.rejects(() => korKommando('radera', { _: ['radera'] }, b), /Okänt kommando "radera"/);
  await b.loggaUt();
});
