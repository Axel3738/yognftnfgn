// Tester för webbmejl-läsaren (Roundcube över HTTPS). Ingen nätverkstrafik:
// en falsk fetch spelar Loopias webbmejl, med de svar som avlästes 2026-09-12
// (Roundcube 1.7.3, formulärfälten _token/_task/_action/_timezone/_url/_user/_pass,
// request_token i rcmail.set_env, cookie roundcube_sessid).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tolkaCookies, plockaToken, plockaSetEnv, plockaObjekt, tolkaListSvar, mapparUrEnv, WebmailKlient, hamtaMappViaWebmail } from '../webmail.mjs';
import { datumUrRa } from '../run.mjs';

const LOGIN_HTML = `<html><head><title>Loopia Webmail :: Welcome</title></head><body>
<form id="login-form" name="login-form" method="post" class="propform" action="/?_task=login">
<input type="hidden" name="_token" value="ildBvkyHYJZCdQTjn7vTNKYA7BWjs4XP">
<input type="hidden" name="_task" value="login">
<input name="_user" id="rcmloginuser" required type="text">
<input name="_pass" id="rcmloginpwd" required type="password">
</form>
<script>rcmail.set_env({"task":"login","rcversion":10703,"skin":"loopia_elastic","comm_path":"/?_task=login","request_token":"ildBvkyHYJZCdQTjn7vTNKYA7BWjs4XP"});</script></body></html>`;

const MAIL_HTML = `<html><body><script>rcmail.set_env({"task":"mail","rcversion":10703,"mailbox":"INBOX","mailboxes_list":["INBOX","Drafts","Sent","Junk","Trash"],"request_token":"RT-efter-login","unread_counts":{"INBOX":2},"labels":{"x":"a \\"citat\\" {klammer}"}});</script></body></html>`;

// Roundcube JSON-kodar kolumnobjekten i exec-strängen — citattecken i ämnen kommer som \".
const listJson = (rader, env) => JSON.stringify({
  action: 'list', unlock: '0', env,
  exec: rader.map((r) => `this.add_message_row(${r.uid},${JSON.stringify({ subject: r.subject, fromto: r.from, date: r.date, size: '2 KB' })},${JSON.stringify({ seen: r.seen ? 1 : 0, ctype: 'text/plain', mbox: r.mbox, flagged: 0 })},false);`).join('\n') + '\nthis.set_rowcount("Messages 1 to 2 of 2");',
});

const RA = {
  3: 'From: Anna <anna@gmail.com>\r\nTo: kundsupport@baverkoppling.se\r\nSubject: Var är min order #1042?\r\nDate: Sat, 12 Sep 2026 10:00:00 +0200\r\nMessage-ID: <w3@gmail.com>\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nHar inte fått någon spårning.\r\n',
  2: 'From: Ola <ola@online.no>\r\nTo: kundsupport@baverkoppling.se\r\nSubject: Pakken har ikke kommet\r\nDate: Wed, 09 Sep 2026 09:00:00 +0200\r\nMessage-ID: <w2@online.no>\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nOrdre 1038 har ikke kommet.\r\n',
  1: 'From: Gammal <gammal@x.se>\r\nTo: kundsupport@baverkoppling.se\r\nSubject: Gammalt\r\nDate: Sat, 01 Aug 2026 09:00:00 +0200\r\nMessage-ID: <w1@x.se>\r\n\r\nFör länge sedan.\r\n',
  9: 'From: Kundsupport <kundsupport@baverkoppling.se>\r\nTo: ola@online.no\r\nSubject: Re: Pakken har ikke kommet\r\nDate: Thu, 10 Sep 2026 09:00:00 +0200\r\nMessage-ID: <s9@baverkoppling.se>\r\nIn-Reply-To: <w2@online.no>\r\n\r\nHei Ola, her er sporing.\r\n',
};

/** Falsk fetch som spelar Roundcube. Loggar varje anrop så testet kan se cookies och headers. */
function falskWebmail({ nekaLogin = false } = {}) {
  const anrop = [];
  const svar = (status, kropp, cookies = [], typ = 'text/html') => ({
    status, ok: status >= 200 && status < 300,
    headers: { getSetCookie: () => cookies, get: (n) => (n.toLowerCase() === 'content-type' ? typ : null) },
    text: async () => kropp,
    // Exakt de bytes kroppen består av — Buffer.from(str).buffer är hela poolen, inte strängen.
    arrayBuffer: async () => { const b = Buffer.from(kropp, 'latin1'); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); },
  });
  const fetchFn = async (url, opts = {}) => {
    const u = new URL(url);
    const q = u.searchParams;
    anrop.push({ url, metod: opts.method ?? 'GET', headers: opts.headers ?? {}, body: opts.body ?? null });
    if (!u.search) return svar(200, LOGIN_HTML, ['roundcube_sessid=fore-login; path=/; secure; HttpOnly']);
    if (q.get('_task') === 'login' && opts.method === 'POST') {
      const f = new URLSearchParams(opts.body);
      if (f.get('_token') !== 'ildBvkyHYJZCdQTjn7vTNKYA7BWjs4XP') return svar(403, 'Invalid request');
      if (nekaLogin || f.get('_pass') !== 'rätt') return svar(401, LOGIN_HTML.replace('</form>', '<div class="error">Login failed.</div></form>'));
      return svar(302, '', ['roundcube_sessid=efter-login; path=/', 'roundcube_sessauth=S123; path=/']);
    }
    if (q.get('_task') === 'logout') return svar(200, LOGIN_HTML);
    if (q.get('_task') === 'mail' && !q.get('_action')) return svar(200, MAIL_HTML);
    if (q.get('_action') === 'list') {
      const mbox = q.get('_mbox');
      const sida = Number(q.get('_page'));
      if (mbox === 'INBOX' && sida === 1) return svar(200, listJson([{ uid: 3, subject: 'Var är min order #1042?', from: 'Anna', date: 'Today 10:00', mbox, seen: 0 }, { uid: 2, subject: 'Pakken har ikke kommet', from: 'Ola', date: '2026-09-09 09:00', mbox, seen: 1 }], { messagecount: 3, pagecount: 2, current_page: 1 }), [], 'application/json');
      if (mbox === 'INBOX' && sida === 2) return svar(200, listJson([{ uid: 1, subject: 'Gammalt', from: 'Gammal', date: '2026-08-01 09:00', mbox, seen: 1 }], { messagecount: 3, pagecount: 2, current_page: 2 }), [], 'application/json');
      if (mbox === 'Sent') return svar(200, listJson([{ uid: 9, subject: 'Re: Pakken har ikke kommet', from: 'Ola', date: '2026-09-10 09:00', mbox, seen: 1 }], { messagecount: 1, pagecount: 1, current_page: 1 }), [], 'application/json');
      return svar(200, JSON.stringify({ action: 'list', env: {}, exec: 'this.display_message("Mailbox does not exist.","error");' }), [], 'application/json');
    }
    if (q.get('_action') === 'viewsource') return svar(200, RA[Number(q.get('_uid'))] ?? '', [], 'text/plain');
    return svar(404, 'okänd');
  };
  return { fetchFn, anrop };
}

test('cookies, token och set_env plockas ur de riktiga sidorna', () => {
  assert.deepEqual(tolkaCookies(['roundcube_sessid=abc; path=/; secure', 'x=1']), { roundcube_sessid: 'abc', x: '1' });
  assert.equal(plockaToken(LOGIN_HTML), 'ildBvkyHYJZCdQTjn7vTNKYA7BWjs4XP');
  assert.equal(plockaToken(MAIL_HTML), 'RT-efter-login');
  assert.equal(plockaToken('<p>inget</p>'), null);
  const env = plockaSetEnv(MAIL_HTML);
  assert.equal(env.task, 'mail');
  assert.equal(env.request_token, 'RT-efter-login');
  assert.equal(env.labels.x, 'a "citat" {klammer}', 'strängar med citat och klamrar bryter inte klammerräkningen');
  assert.deepEqual(mapparUrEnv(env), ['INBOX', 'Drafts', 'Sent', 'Junk', 'Trash']);
  assert.deepEqual(mapparUrEnv({ mailboxes: { INBOX: 1, Sent: 1 } }), ['INBOX', 'Sent']);
  assert.deepEqual(mapparUrEnv(null), []);
  assert.equal(plockaObjekt('x{a:{b:"}"}}y', 1).text, '{a:{b:"}"}}');
});

test('list-svaret: add_message_row-raderna blir uid + kolumner + flaggor', () => {
  const r = tolkaListSvar(listJson([{ uid: 42, subject: 'Hej "du"', from: 'A', date: 'Today', mbox: 'INBOX', seen: 0 }], { pagecount: 3 }));
  assert.equal(r.rader.length, 1);
  assert.equal(r.rader[0].uid, 42);
  assert.equal(r.rader[0].kolumner.subject, 'Hej "du"');
  assert.equal(r.rader[0].flaggor.seen, 0);
  assert.equal(r.env.pagecount, 3);
  assert.throws(() => tolkaListSvar('<html>utloggad</html>'), /inte JSON/);
});

test('hela flödet mot den falska webbmejlen: login, token, sidor, viewsource, stopp vid gammalt', async () => {
  const { fetchFn, anrop } = falskWebmail();
  const k = new WebmailKlient({ user: 'kundsupport@baverkoppling.se', pass: 'rätt', fetchFn, paus: 0 });
  await k.loggaIn();
  assert.equal(k.token, 'RT-efter-login');
  assert.equal(k.cookies.roundcube_sessid, 'efter-login', 'sessionscookien byts vid inloggning');
  assert.equal(k.cookies.roundcube_sessauth, 'S123');
  assert.deepEqual(k.mappar, ['INBOX', 'Drafts', 'Sent', 'Junk', 'Trash']);
  const loginAnrop = anrop.find((a) => a.metod === 'POST');
  assert.match(loginAnrop.body, /_user=kundsupport%40baverkoppling\.se/);
  assert.match(loginAnrop.headers.Cookie, /roundcube_sessid=fore-login/, 'inloggningen skickar cookien från startsidan');

  const sedan = new Date('2026-09-07T00:00:00Z');
  const inb = await hamtaMappViaWebmail(k, 'INBOX', sedan, { datumUr: datumUrRa });
  assert.equal(inb.mapp, 'INBOX');
  assert.deepEqual(inb.mejl.map((m) => m.uid), [3, 2], 'uid 1 är äldre än gränsen och stoppar bläddringen');
  assert.match(inb.mejl[0].ra, /^From: Anna/);
  const listAnrop = anrop.filter((a) => a.url.includes('_action=list'));
  assert.ok(listAnrop.every((a) => a.headers['X-Roundcube-Request'] === 'RT-efter-login'), 'varje list-anrop bär request_token i headern');
  assert.ok(listAnrop.every((a) => a.headers.Cookie.includes('roundcube_sessid=efter-login')));

  const ut = await hamtaMappViaWebmail(k, ['Skickat', 'Sent', 'INBOX.Sent'], sedan, { datumUr: datumUrRa });
  assert.equal(ut.mapp, 'Sent', 'mappar som inte finns i set_env provas inte');
  assert.equal(ut.antal, 1);
  await k.loggaUt();
  assert.ok(anrop.some((a) => a.url.includes('_task=logout')));
  assert.ok(anrop.every((a) => !a.url.includes('_action=delete') && !a.url.includes('_action=mark')), 'aldrig något som ändrar brevlådan');
});

test('fel lösenord ger LOGIN_NEKAD med Loopias regel, aldrig ett andra försök', async () => {
  const { fetchFn, anrop } = falskWebmail();
  const k = new WebmailKlient({ user: 'kundsupport@baverkoppling.se', pass: 'fel', fetchFn, paus: 0 });
  await assert.rejects(k.loggaIn(), (e) => e.kod === 'LOGIN_NEKAD' && /hela mejladressen/.test(e.message));
  assert.equal(anrop.filter((a) => a.metod === 'POST').length, 1);
});

test('datumUrRa läser Date-rubriken ur ett råmejl', () => {
  assert.equal(datumUrRa(RA[2]).toISOString(), '2026-09-09T07:00:00.000Z');
  assert.equal(datumUrRa('Subject: utan datum\r\n\r\nx'), null);
});
