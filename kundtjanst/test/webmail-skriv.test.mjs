// Tester för SKRIVVÄGEN i webbmejlen (svara, utkast, flagga, flytta, skapa
// mapp). Ingen nätverkstrafik: en falsk Roundcube som svarar med de former
// Roundcubes källkod ger (master 2026-09-21: program/actions/mail/{compose,
// send,mark,move}.php, settings/folder_save.php, rcmail_output_html
// get_js_commands för framed-svaren, app.js submit_messageform).
//
// Formerna är avlästa ur källkoden och MÄTTA LIVE mot Loopia 2026-09-21 (första
// torrkörningen av autosvaret). Två saker skilde sig och den falska servern
// härmar dem nu: compose utan _id svarar 302 till samma sida med ett nytt _id,
// och alla mappar ligger under namnrymden "INBOX." (save-folder "VA-PRIO" ger
// "INBOX.VA-PRIO"). Stämmer något annat inte: rätta den falska servern här
// mot det riktiga svaret först, sen koden.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WebmailKlient, tolkaKompose, tolkaSandsvar, felUrSvar, tolkaRemoteSvar, plockaFalt, plockaIdentiteter, jsAnrop } from '../webmail.mjs';
import { Brevlada } from '../brevlada.mjs';
import { korKommando, skrivUt, tolkaArgv } from '../mail.mjs';
import { skapaServer, VERKTYG } from '../mail-mcp.mjs';

const LOGIN_HTML = `<html><body><form action="/?_task=login"><input type="hidden" name="_token" value="TOK1"></form>
<script>rcmail.set_env({"task":"login","rcversion":10703,"request_token":"TOK1"});</script></body></html>`;
const mailHtml = (mappar) => `<html><body><script>rcmail.set_env({"task":"mail","rcversion":10703,"mailbox":"INBOX","mailboxes_list":${JSON.stringify(mappar)},"request_token":"RT1","unread_counts":{"INBOX":1}});</script></body></html>`;

// Svarsformuläret så som Roundcube 1.7 (elastic) skriver det: compose_id i
// set_env och som hidden _id, identiteten i <select name="_from">, mottagaren
// i en <textarea name="_to"> (recipient-input-widgeten), ämnet i <input
// name="_subject">, citatet i <textarea name="_message">. Tecken escapas med
// htmlspecialchars (rcube::Q) — ä är ä, men < > & " blir entiteter.
const COMPOSE_HTML = (uid) => `<!DOCTYPE html><html><head>
<script>rcmail.set_env({"task":"mail","action":"compose","compose_id":"68cf1a2b3c4d5","reply_msgid":"<w${uid}@gmail.com>","drafts_mailbox":"Drafts","request_token":"RT1","mailbox":"INBOX"});</script>
</head><body><form name="form" method="post" action="./?_task=mail&amp;_action=send" id="compose-form">
<input type="hidden" name="_token" value="RT1">
<input type="hidden" name="_task" value="mail"><input type="hidden" name="_action" value="send">
<input type="hidden" name="_id" value="68cf1a2b3c4d5"><input type="hidden" name="_attachments" value="">
<select name="_from" id="_from" onchange="rcmail.change_identity(this)"><option value="1" selected="selected">Kundsupport &lt;kundsupport@baverbutiken.se&gt;</option><option value="2">Annan &lt;annan@baverbutiken.se&gt;</option></select>
<textarea name="_to" id="_to" data-recipient-input="true">Anna &lt;anna@gmail.com&gt;</textarea>
<input name="_subject" id="compose-subject" value="Re: Var är min order #1042 &amp; #1043?" type="text">
<input type="hidden" name="_draft_saveid" value=""><input type="hidden" name="_draft" value=""><input type="hidden" name="_is_html" value="0"><input type="hidden" name="_framed" value="1">
<textarea name="_message" id="composebody" data-html-editor="true">
Den 12 sep. 2026 kl 10:00 skrev Anna &lt;anna@gmail.com&gt;:
&gt; Har inte fått någon spårning på paketet.
</textarea>
</form></body></html>`;

const FRAMED = (rader) => `<!DOCTYPE html><html><head><script type="text/javascript">if (window.parent && parent.rcmail) {\n${rader.map((r) => `\tparent.rcmail.${r};`).join('\n')}\n}\n</script></head><body></body></html>`;

/**
 * Falsk Roundcube med tillstånd: flaggor, mappar, utkast, skickat. Loggar
 * varje anrop så testerna kan se exakt vad som postades.
 */
function falskWebmail({ mappar = ['INBOX', 'INBOX.Drafts', 'INBOX.Sent', 'INBOX.Spam', 'INBOX.Trash'], nekaSandning = null } = {}) {
  const anrop = [];
  const tillstand = { mappar: [...mappar], flaggor: {}, flyttade: [], skickade: [], utkast: [], nastaUtkastUid: 77, kompose: {} };
  const svar = (status, kropp, cookies = [], typ = 'text/html', location = null) => ({
    status, ok: status >= 200 && status < 300,
    headers: { getSetCookie: () => cookies, get: (n) => (n.toLowerCase() === 'content-type' ? typ : n.toLowerCase() === 'location' ? location : null) },
    text: async () => kropp,
    arrayBuffer: async () => { const b = Buffer.from(kropp, 'utf8'); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); },
  });
  const json = (obj) => svar(200, JSON.stringify(obj), [], 'application/json');
  const fetchFn = async (url, opts = {}) => {
    const u = new URL(url);
    const q = u.searchParams;
    const body = opts.body ? new URLSearchParams(opts.body) : null;
    anrop.push({ url, metod: opts.method ?? 'GET', headers: opts.headers ?? {}, body, q });
    if (!u.search) return svar(200, LOGIN_HTML, ['roundcube_sessid=s1; path=/']);
    if (q.get('_task') === 'login' && opts.method === 'POST') return svar(302, '', ['roundcube_sessid=s2; path=/']);
    if (q.get('_task') === 'logout') return svar(200, LOGIN_HTML);
    if (q.get('_task') === 'mail' && !q.get('_action')) return svar(200, mailHtml(tillstand.mappar));
    // Alla POST-anrop måste bära token i kroppen (Roundcube kräver det för skrivning).
    if (opts.method === 'POST' && body?.get('_token') !== 'RT1') return svar(403, 'Invalid request token');
    const action = q.get('_action');
    if (action === 'list') return json({ action: 'list', env: { messagecount: 0, pagecount: 1, current_page: 1 }, exec: '' });
    if (action === 'compose') {
      // Som compose.php (mätt live 2026-09-21): utan _id mintas ett id, parametrarna
      // läggs i sessionen och svaret är 302 till samma sida med _id. Formuläret
      // kommer först på den sidan.
      if (!q.get('_id')) {
        const id = '68cf1a2b3c4d5';
        tillstand.kompose[id] = { replyUid: q.get('_reply_uid') };
        return svar(302, '', [], 'text/html', `/?_task=mail&_action=compose&_id=${id}`);
      }
      const k = tillstand.kompose[q.get('_id')];
      if (!k) return svar(200, LOGIN_HTML);
      if (!k.replyUid) return svar(200, '<html>nytt mejl</html>');
      if (k.replyUid === '99') return svar(200, COMPOSE_HTML(99).replace(/<textarea name="_to"[^>]*>[^<]*<\/textarea>/, '<textarea name="_to" id="_to"></textarea>'));
      return svar(200, COMPOSE_HTML(k.replyUid));
    }
    if (action === 'send' && opts.method === 'POST') {
      if (body.get('_id') !== '68cf1a2b3c4d5') return svar(200, FRAMED(['iframe_loaded("0")', 'display_message("Invalid compose ID","error")']));
      if (nekaSandning) return svar(200, FRAMED(['iframe_loaded("0")', `display_message(${JSON.stringify(nekaSandning)},"error")`]));
      if (body.get('_draft') === '1') {
        const uid = tillstand.nastaUtkastUid++;
        tillstand.utkast.push({ uid, body });
        return svar(200, FRAMED(['iframe_loaded("0")', 'display_message("Message saved to Drafts.","confirmation")', `set_draft_id(${uid})`, 'compose_field_hash(true)', 'auto_save_start()']));
      }
      tillstand.skickade.push(body);
      return svar(200, FRAMED(['iframe_loaded("0")', 'remove_compose_data("68cf1a2b3c4d5")', 'sent_successfully("confirmation","Message sent successfully.",["INBOX","Sent"],false)']));
    }
    if (action === 'mark' && opts.method === 'POST') {
      if (!body.get('_uid') || !body.get('_flag')) return json({ action: 'mark', exec: 'this.display_message("Could not flag the message(s).","error");' });
      tillstand.flaggor[body.get('_uid')] = body.get('_flag');
      return json({ action: 'mark', unlock: '0', env: { last_flag: body.get('_flag').toUpperCase() }, exec: 'this.set_unread_count("INBOX",1,true);' });
    }
    if (action === 'move' && opts.method === 'POST') {
      const mal = body.get('_target_mbox');
      if (!tillstand.mappar.includes(mal)) return json({ action: 'move', exec: 'this.display_message("Could not move the message(s).","error");' });
      tillstand.flyttade.push({ uid: body.get('_uid'), fran: body.get('_mbox'), till: mal });
      return json({ action: 'move', unlock: '0', exec: `this.remove_message_row("${body.get('_uid')}");this.set_rowcount("Messages 1 to 2 of 2","INBOX");` });
    }
    if (q.get('_task') === 'settings' && action === 'save-folder' && opts.method === 'POST') {
      // Som folder_save.php → mod_folder('in'): mappen hamnar under namnrymden "INBOX." (Loopia, mätt 2026-09-21).
      const namn = `INBOX.${body.get('_name')}`;
      if (tillstand.mappar.includes(namn)) return svar(200, FRAMED(['iframe_loaded("0")', 'display_message("A folder with that name already exists.","error")']));
      tillstand.mappar.push(namn);
      return svar(200, FRAMED(['iframe_loaded("0")', 'display_message("Folder created successfully.","confirmation")', `add_folder_row("${namn}","${body.get('_name')}","${namn}",false,false)`]));
    }
    return svar(404, 'okänt');
  };
  return { fetchFn, anrop, tillstand };
}

const KONFIG = { id: 'baverbutiken', brand: 'Bäverbutiken', mail: { user: 'kundsupport@baverbutiken.se', pass: 'rätt', webmail: 'https://webmail.loopia.se/', inkorg: 'INBOX', konfigurerad: true, saknas: [] } };
const ny = (o) => { const f = falskWebmail(o); return { b: new Brevlada(KONFIG, { fetchFn: f.fetchFn, paus: 0 }), f }; };

// ------------------------------------------------------------------ rena tolkare

test('tolkaKompose: compose-id, identitet, mottagare, ämne och citat ur svarsformuläret', () => {
  const k = tolkaKompose(COMPOSE_HTML(3));
  assert.equal(k.id, '68cf1a2b3c4d5');
  assert.equal(k.fran, '1', 'den valda identiteten');
  assert.equal(k.identiteter.length, 2);
  assert.equal(k.identiteter[0].text, 'Kundsupport <kundsupport@baverbutiken.se>');
  assert.equal(k.till, 'Anna <anna@gmail.com>');
  assert.equal(k.amne, 'Re: Var är min order #1042 & #1043?', 'entiteterna avkodas');
  assert.match(k.citat, /^Den 12 sep\. 2026 kl 10:00 skrev Anna <anna@gmail.com>:\n> Har inte fått/);
  assert.equal(k.utkastUid, '');
  assert.equal(k.arHtml, false);
  assert.equal(k.replyMsgid, '<w3@gmail.com>');
  assert.equal(k.utkastMapp, 'Drafts');
  // Utan compose-id: tydligt fel med steget.
  assert.throws(() => tolkaKompose('<html><form><textarea name="_to">x</textarea></form></html>'), /inget compose-id \(steg 7\)/);
  assert.throws(() => tolkaKompose('<html><input type="hidden" name="_id" value="abc"></html>'), /saknar fältet _to \(steg 7\)/);
  // Hidden _id räcker när set_env saknar compose_id; hidden _from räcker utan select.
  const k2 = tolkaKompose('<html><input type="hidden" name="_id" value="abc"><input type="hidden" name="_from" value="5"><textarea name="_to">a@b.se</textarea></html>');
  assert.equal(k2.id, 'abc');
  assert.equal(k2.fran, '5');
});

test('plockaFalt + plockaIdentiteter: input och textarea, saknat fält är null', () => {
  assert.equal(plockaFalt('<input name="_x" value="a &quot;b&quot; &amp; c">', '_x'), 'a "b" & c');
  assert.equal(plockaFalt('<input type="hidden" name="_x">', '_x'), '', 'utan value = tom sträng');
  assert.equal(plockaFalt('<textarea name="_y">rad1\n&gt; rad2</textarea>', '_y'), 'rad1\n> rad2');
  assert.equal(plockaFalt('<p>inget</p>', '_z'), null);
  assert.deepEqual(plockaIdentiteter('<select name="_from"><option value="3">A</option><option value="4" selected>B</option></select>'), [{ id: '3', text: 'A', vald: false }, { id: '4', text: 'B', vald: true }]);
  assert.deepEqual(plockaIdentiteter('<p>ingen</p>'), []);
});

test('jsAnrop läser Roundcubes JSON-serialiserade argument, även med arrayer och strängar med parenteser', () => {
  assert.deepEqual(jsAnrop('x.sent_successfully("confirmation","Sent (ok) :)",["INBOX","Sent"],false);', 'sent_successfully'), ['confirmation', 'Sent (ok) :)', ['INBOX', 'Sent'], false]);
  assert.deepEqual(jsAnrop('parent.rcmail.set_draft_id(77);', 'set_draft_id'), [77]);
  assert.deepEqual(jsAnrop('set_draft_id("78")', 'set_draft_id'), ['78']);
  assert.equal(jsAnrop('inget här', 'set_draft_id'), null);
});

test('tolkaSandsvar: skickat, utkast, fel och okänt svar', () => {
  const s = tolkaSandsvar(FRAMED(['iframe_loaded("0")', 'sent_successfully("confirmation","Message sent successfully.",["INBOX"],false)']));
  assert.deepEqual(s, { typ: 'skickat', meddelande: 'Message sent successfully.', utkastUid: null, sparfel: false });
  const sf = tolkaSandsvar(FRAMED(['sent_successfully("confirmation","Message sent successfully.",[],true)']));
  assert.equal(sf.sparfel, true, 'skickat men inte sparat i Sent');
  const u = tolkaSandsvar(FRAMED(['display_message("Message saved to Drafts.","confirmation")', 'set_draft_id(77)', 'compose_field_hash(true)']));
  assert.deepEqual(u, { typ: 'utkast', meddelande: 'Message saved to Drafts.', utkastUid: 77, sparfel: false });
  assert.throws(() => tolkaSandsvar(FRAMED(['display_message("Could not send message.","error")'])), (e) => e.kod === 'SANDNING_NEKAD' && /Could not send message/.test(e.message));
  assert.throws(() => tolkaSandsvar('<html>okänt</html>'), /kändes inte igen \(steg 8\)/);
  assert.throws(() => tolkaSandsvar(LOGIN_HTML), /inloggningssidan \(steg 8\)/);
});

test('felUrSvar + tolkaRemoteSvar: error-meddelanden hittas, confirmation gör det inte', () => {
  assert.equal(felUrSvar('this.display_message("Could not move the message(s).","error");'), 'Could not move the message(s).');
  assert.equal(felUrSvar('this.display_message("Folder created.","confirmation");'), null);
  assert.equal(felUrSvar('parent.rcmail.display_message("Rad \\"citat\\"","error")'), 'Rad "citat"');
  assert.throws(() => tolkaRemoteSvar('<html>utloggad</html>', { steg: 9, vad: 'flagga' }), /inte JSON \(steg 9\)/);
  assert.throws(() => tolkaRemoteSvar('{"exec":"this.display_message(\\"Nej\\",\\"error\\");"}', { steg: 10, vad: 'flytta' }), (e) => e.kod === 'ATGARD_NEKAD' && /kunde inte flytta \(steg 10\): Nej/.test(e.message));
  assert.equal(tolkaRemoteSvar('{"exec":"this.set_unread_count(1);","env":{"a":1}}', { steg: 9, vad: 'flagga' }).env.a, 1);
});

// ------------------------------------------------------------------ klienten mot den falska servern

test('svara: öppnar svarsformuläret, postar rätt fält med token, citerar kunden, tråden via _reply_uid', async () => {
  const { b, f } = ny();
  const r = await b.svara(3, { text: 'Hej Anna!\n\nDitt paket är på väg.\n\nVänliga hälsningar\nKundtjänst' });
  assert.equal(r.typ, 'skickat');
  assert.equal(r.till, 'Anna <anna@gmail.com>');
  assert.equal(r.amne, 'Re: Var är min order #1042 & #1043?');
  assert.equal(r.utkastUid, null);
  const composer = f.anrop.filter((a) => a.q.get('_action') === 'compose');
  assert.equal(composer.length, 2, 'första anropet får 302, det andra (med _id) är formuläret');
  assert.equal(composer[0].q.get('_reply_uid'), '3', 'tråden sätts av Roundcube ur _reply_uid');
  assert.equal(composer[0].q.get('_mbox'), 'INBOX');
  assert.equal(composer[1].q.get('_id'), '68cf1a2b3c4d5', 'omdirigeringen följs till sidan med compose-id');
  assert.equal(composer[1].q.get('_reply_uid'), null);
  const send = f.anrop.find((a) => a.q.get('_action') === 'send');
  assert.equal(send.metod, 'POST');
  assert.equal(send.q.get('_framed'), '1');
  assert.equal(send.body.get('_token'), 'RT1');
  assert.equal(send.body.get('_id'), '68cf1a2b3c4d5');
  assert.equal(send.body.get('_from'), '1');
  assert.equal(send.body.get('_to'), 'Anna <anna@gmail.com>');
  assert.equal(send.body.get('_subject'), 'Re: Var är min order #1042 & #1043?');
  assert.equal(send.body.get('_is_html'), '0');
  assert.equal(send.body.get('_draft'), '', 'inte utkast');
  assert.match(send.body.get('_message'), /^Hej Anna!\n\nDitt paket är på väg\.\n\nVänliga hälsningar\nKundtjänst\n\n\nDen 12 sep\. 2026 kl 10:00 skrev Anna <anna@gmail.com>:\n> Har inte fått/);
  assert.equal(f.tillstand.skickade.length, 1);
  assert.equal(b.inloggningar, 1);
});

test('utkast: samma formulär, _draft=1, sparas i Drafts med uid — inget skickas', async () => {
  const { b, f } = ny();
  const r = await b.utkast(3, { text: 'Utkastet', amne: 'Eget ämne', medCitat: false });
  assert.equal(r.typ, 'utkast');
  assert.equal(r.utkastUid, 77);
  assert.equal(r.utkastMapp, 'Drafts');
  assert.equal(r.amne, 'Eget ämne');
  const send = f.anrop.find((a) => a.q.get('_action') === 'send');
  assert.equal(send.body.get('_draft'), '1');
  assert.equal(send.body.get('_subject'), 'Eget ämne');
  assert.equal(send.body.get('_message'), 'Utkastet\n', 'utan citat');
  assert.equal(f.tillstand.skickade.length, 0, 'inget skickat');
  assert.equal(f.tillstand.utkast.length, 1);
});

test('svara: tom text skickas aldrig, Roundcubes fel kommer igenom, mejl utan mottagare stoppas', async () => {
  const { b, f } = ny();
  await assert.rejects(() => b.svara(3, { text: '   ' }), /texten är tom/);
  assert.equal(f.anrop.filter((a) => a.q.get('_action') === 'send').length, 0);
  await assert.rejects(() => b.svara(99, { text: 'x' }), /ingen mottagare \(steg 7\)/);
  const nekad = ny({ nekaSandning: 'Could not send message.' });
  await assert.rejects(() => nekad.b.svara(3, { text: 'x' }), (e) => e.kod === 'SANDNING_NEKAD');
  assert.equal(nekad.f.tillstand.skickade.length, 0);
});

test('svara: följer Roundcubes 302 till _id-adressen med sessionscookien (steg 7, mätt live 2026-09-21)', async () => {
  const { b, f } = ny();
  await b.svara(3, { text: 'Hej' });
  const compose = f.anrop.filter((a) => a.q.get('_action') === 'compose');
  assert.equal(compose.length, 2, 'första anropet får 302, andra hämtar formuläret');
  assert.equal(compose[0].q.get('_reply_uid'), '3');
  assert.equal(compose[1].q.get('_id'), '68cf1a2b3c4d5');
  assert.equal(compose[1].q.get('_reply_uid'), null, 'andra anropet är exakt Location-adressen');
  assert.match(compose[1].headers.Cookie, /roundcube_sessid=s2/, 'samma session');
  assert.equal(f.tillstand.skickade.length, 1);
});

test('svara: forvantadTill — går svaret till en annan adress än kundens skickas inget (MOTTAGARE_AVVIKER)', async () => {
  const { b, f } = ny();
  await assert.rejects(() => b.svara(3, { text: 'Hej', forvantadTill: 'kund@annan.se' }), (e) => e.kod === 'MOTTAGARE_AVVIKER' && /anna@gmail\.com/.test(e.message));
  assert.equal(f.anrop.filter((a) => a.q.get('_action') === 'send').length, 0, 'inget postat');
  const r = await b.utkast(3, { text: 'Hej', forvantadTill: 'ANNA@gmail.com' });
  assert.equal(r.typ, 'utkast', 'skiftläge spelar ingen roll');
});

test('förhandsgranska: visar till, ämne och citat utan att posta något', async () => {
  const { b, f } = ny();
  const v = await b.forhandsgranskaSvar(3);
  assert.equal(v.till, 'Anna <anna@gmail.com>');
  assert.equal(v.fran, 'Kundsupport <kundsupport@baverbutiken.se>');
  assert.match(v.citat, /Har inte fått/);
  assert.equal(f.anrop.filter((a) => a.metod === 'POST' && a.q.get('_task') !== 'login').length, 0, 'inga skrivande anrop');
});

test('flagga: POST mark med _flag=flagged (och unflagged med av), token i kropp och header', async () => {
  const { b, f } = ny();
  assert.deepEqual(await b.flagga(3), { uid: 3, mapp: 'INBOX', flaggad: true });
  const mark = f.anrop.find((a) => a.q.get('_action') === 'mark');
  assert.equal(mark.metod, 'POST');
  assert.equal(mark.q.get('_remote'), '1');
  assert.equal(mark.headers['X-Roundcube-Request'], 'RT1');
  assert.equal(mark.body.get('_uid'), '3');
  assert.equal(mark.body.get('_mbox'), 'INBOX');
  assert.equal(mark.body.get('_flag'), 'flagged');
  assert.equal(f.tillstand.flaggor['3'], 'flagged');
  await b.flagga(3, { av: true });
  assert.equal(f.tillstand.flaggor['3'], 'unflagged');
  await assert.rejects(() => b.flagga('x'), /positivt heltal/);
});

test('flytta: saknad mapp är ett fel utan --skapa; med skapa skapas mappen (save-folder) och mejlet flyttas', async () => {
  const { b, f } = ny();
  await assert.rejects(() => b.flytta(3, { till: 'VA-PRIO' }), (e) => e.kod === 'MAPP_SAKNAS' && /VA-PRIO.*finns inte/.test(e.message));
  assert.equal(f.anrop.filter((a) => a.q.get('_action') === 'move').length, 0, 'inget flyttat');
  const r = await b.flytta(3, { till: 'VA-PRIO', skapa: true });
  // Människan säger VA-PRIO; brevlådan skapar INBOX.VA-PRIO och dit flyttas mejlet (mätt 2026-09-21).
  assert.deepEqual(r, { uid: 3, fran: 'INBOX', till: 'INBOX.VA-PRIO', skapad: true });
  const skapa = f.anrop.find((a) => a.q.get('_action') === 'save-folder');
  assert.equal(skapa.q.get('_task'), 'settings');
  assert.equal(skapa.body.get('_name'), 'VA-PRIO');
  assert.equal(skapa.body.get('_parent'), '');
  assert.equal(skapa.body.get('_mbox'), '', 'tom _mbox = ny mapp, inte omdöpning');
  const move = f.anrop.find((a) => a.q.get('_action') === 'move');
  assert.equal(move.body.get('_uid'), '3');
  assert.equal(move.body.get('_target_mbox'), 'INBOX.VA-PRIO', 'flytten går till IMAP-namnet, inte människans');
  assert.deepEqual(f.tillstand.flyttade, [{ uid: '3', fran: 'INBOX', till: 'INBOX.VA-PRIO' }]);
  // Andra gången finns mappen: inget save-folder. Både "VA-PRIO" och "INBOX.VA-PRIO" hittar den.
  const r2 = await b.flytta(4, { till: 'VA-PRIO', skapa: true });
  assert.deepEqual(r2, { uid: 4, fran: 'INBOX', till: 'INBOX.VA-PRIO', skapad: false });
  const r3 = await b.flytta(5, { till: 'INBOX.VA-PRIO' });
  assert.equal(r3.till, 'INBOX.VA-PRIO');
  assert.equal(f.anrop.filter((a) => a.q.get('_action') === 'save-folder').length, 1);
  await assert.rejects(() => b.flytta(3, { till: '' }), /--till/);
  await assert.rejects(() => b.flytta(3, { till: 'INBOX' }), /samma som källan/);
});

test('hittaMapp: exakt namn, eller namnet under INBOX. — aldrig en gissning', async () => {
  const { f } = ny();
  const k = new WebmailKlient({ user: 'x', pass: 'rätt', fetchFn: f.fetchFn, paus: 0 });
  await k.loggaIn();
  assert.equal(k.hittaMapp('INBOX'), 'INBOX');
  assert.equal(k.hittaMapp('Drafts'), 'INBOX.Drafts');
  assert.equal(k.hittaMapp('INBOX.Drafts'), 'INBOX.Drafts');
  assert.equal(k.hittaMapp('VA-PRIO'), null);
  assert.equal(k.hittaMapp(''), null);
  assert.equal(k.hittaMapp('Draft'), null, 'ingen prefixmatchning på delnamn');
});

test('skapaMapp: ny mapp syns i mapplistan efteråt (under INBOX.); befintlig ger fannsRedan; ogiltigt namn stoppas', async () => {
  const { b, f } = ny();
  const r = await b.skapaMapp('VA-PRIO');
  assert.equal(r.fannsRedan, false);
  assert.equal(r.imap, 'INBOX.VA-PRIO');
  assert.ok(r.mappar.includes('INBOX.VA-PRIO'));
  assert.deepEqual(await b.skapaMapp('VA-PRIO'), { namn: 'VA-PRIO', imap: 'INBOX.VA-PRIO', fannsRedan: true, mappar: r.mappar });
  assert.equal(f.anrop.filter((a) => a.q.get('_action') === 'save-folder').length, 1);
  await assert.rejects(() => b.skapaMapp('a/b'), /inte ett giltigt mappnamn/);
  // Roundcube nekar (t.ex. namnkrock den själv upptäcker): felet kommer igenom.
  const k = new WebmailKlient({ user: 'x', pass: 'rätt', fetchFn: f.fetchFn, paus: 0 });
  await k.loggaIn();
  await assert.rejects(() => k.skapaMapp('VA-PRIO'), (e) => e.kod === 'MAPP_NEKAD');
});

test('ingenting i skrivvägen raderar eller markerar som läst', async () => {
  const { b, f } = ny();
  await b.utkast(3, { text: 'x' });
  await b.flagga(3);
  await b.flytta(3, { till: 'VA-PRIO', skapa: true });
  for (const a of f.anrop) {
    assert.ok(!/_action=(delete|purge|expunge)/.test(a.url), a.url);
    if (a.body) assert.ok(!['read', 'unread', 'delete', 'undelete'].includes(a.body.get('_flag') ?? ''), `flaggan ${a.body.get('_flag')}`);
  }
});

// ------------------------------------------------------------------ CLI + MCP

test('CLI: utkast/svara/flagga/flytta/mapp går till brevlådan och skrivs ut läsbart', async () => {
  assert.deepEqual(tolkaArgv(['utkast', '3', '--text', 'Hej', '--utan-citat']), { _: ['utkast', '3'], text: 'Hej', 'utan-citat': true });
  assert.deepEqual(tolkaArgv(['flytta', '3', '--till', 'VA-PRIO', '--skapa']), { _: ['flytta', '3'], till: 'VA-PRIO', skapa: true });
  assert.deepEqual(tolkaArgv(['svara', '3', '--visa']), { _: ['svara', '3'], visa: true });
  const { b, f } = ny();
  const visa = await korKommando('svara', { _: ['svara', '3'], visa: true }, b);
  assert.match(skrivUt('visa', visa), /inget skickat[\s\S]*Till:  Anna <anna@gmail.com>/);
  const u = await korKommando('utkast', { _: ['utkast', '3'], text: 'Hej' }, b);
  assert.match(skrivUt('svara', u), /📝 Utkast sparat i Drafts \(uid 77\)/);
  assert.equal(f.tillstand.skickade.length, 0);
  const s = await korKommando('svara', { _: ['svara', '3'], text: 'Hej' }, b);
  assert.match(skrivUt('svara', s), /✉️  Skickat till Anna <anna@gmail.com>/);
  const fl = await korKommando('flagga', { _: ['flagga', '3'] }, b);
  assert.match(skrivUt('flagga', fl), /🚩 Flaggad: uid 3/);
  const m = await korKommando('mapp', { _: ['mapp', 'VA-PRIO'] }, b);
  assert.match(skrivUt('mapp', m), /Mappen "VA-PRIO" skapad/);
  const fy = await korKommando('flytta', { _: ['flytta', '3'], till: 'VA-PRIO' }, b);
  assert.match(skrivUt('flytta', fy), /uid 3 flyttad INBOX → INBOX\.VA-PRIO\./, 'utskriften visar IMAP-namnet — det VA:n ser i webbmejlen');
  await assert.rejects(() => korKommando('svara', { _: ['svara', '3'] }, b), /behöver --text/);
  await assert.rejects(() => korKommando('flytta', { _: ['flytta'] }, b), /behöver ett uid/);
  await assert.rejects(() => korKommando('mapp', { _: ['mapp'] }, b), /behöver ett namn/);
});

test('MCP: fyra skrivverktyg annonseras rätt och går till brevlådan', async () => {
  const skriv = VERKTYG.filter((t) => ['mail_reply', 'mail_draft', 'mail_flag', 'mail_move'].includes(t.name));
  assert.equal(skriv.length, 4);
  for (const t of skriv) assert.equal(t.annotations.readOnlyHint, false, t.name);
  assert.equal(VERKTYG.find((t) => t.name === 'mail_reply').annotations.destructiveHint, true, 'skicka går inte att ångra');
  assert.equal(VERKTYG.find((t) => t.name === 'mail_draft').annotations.destructiveHint, false);
  assert.deepEqual(VERKTYG.find((t) => t.name === 'mail_reply').inputSchema.required, ['uid', 'text']);
  assert.deepEqual(VERKTYG.find((t) => t.name === 'mail_move').inputSchema.required, ['uid', 'till']);

  const { b, f } = ny();
  const s = skapaServer({ env: { KUNDTJANST_MAIL_PASS_BAVERBUTIKEN: 'x' }, oppna: () => b });
  const req = (id, name, args) => s.hantera({ jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } });
  const visa = await req(1, 'mail_reply', { uid: 3, text: 'Hej', visa: true });
  assert.equal(visa.result.isError, false);
  assert.match(visa.result.content[0].text, /inget skickat/);
  assert.equal(f.tillstand.skickade.length, 0);
  const utkast = await req(2, 'mail_draft', { uid: 3, text: 'Hej Anna' });
  assert.equal(utkast.result.structuredContent.typ, 'utkast');
  assert.equal(utkast.result.structuredContent.utkastUid, 77);
  const svar = await req(3, 'mail_reply', { uid: 3, text: 'Hej Anna', utanCitat: true });
  assert.equal(svar.result.structuredContent.typ, 'skickat');
  assert.equal(f.tillstand.skickade.length, 1);
  const flag = await req(4, 'mail_flag', { uid: 3 });
  assert.deepEqual(flag.result.structuredContent, { uid: 3, mapp: 'INBOX', flaggad: true });
  const move = await req(5, 'mail_move', { uid: 3, till: 'VA-PRIO' });
  assert.equal(move.result.isError, true, 'mappen saknas och skapa är inte satt');
  assert.match(move.result.content[0].text, /finns inte/);
  const move2 = await req(6, 'mail_move', { uid: 3, till: 'VA-PRIO', skapa: true });
  assert.equal(move2.result.structuredContent.skapad, true);
  const tom = await req(7, 'mail_reply', { uid: 3, text: ' ' });
  assert.equal(tom.result.isError, true);
});
