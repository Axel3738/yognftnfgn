// mime.mjs — gör ett rått mejl (RFC 5322 + MIME) till { fran, till, amne,
// datum, text, ... }. Noll beroenden, rena funktioner, allt testbart.
//
// Vad som stöds: rubriker med veckning och RFC 2047-kodning (=?UTF-8?B?…?=),
// multipart (nästlat), text/plain och text/html (HTML → text), base64 och
// quoted-printable, teckenkodningarna utf-8 / iso-8859-1 / windows-1252
// (TextDecoder i Node). Bilagor hoppas över — vi läser vad kunden SKREV.
//
// Citerade svar ("Den 3 sep skrev …", "> …", "-----Original Message-----")
// klipps bort så klassificeringen bara ser den nya texten, inte hela tråden.

const decoderCache = new Map();
function decoder(charset) {
  const namn = String(charset || 'utf-8').trim().toLowerCase().replace(/^"|"$/g, '') || 'utf-8';
  const alias = { 'utf8': 'utf-8', 'latin1': 'iso-8859-1', 'us-ascii': 'iso-8859-1', 'ascii': 'iso-8859-1', 'iso-8859-15': 'iso-8859-15', 'cp1252': 'windows-1252' }[namn] || namn;
  if (!decoderCache.has(alias)) {
    let d;
    try { d = new TextDecoder(alias); } catch { d = new TextDecoder('utf-8'); }
    decoderCache.set(alias, d);
  }
  return decoderCache.get(alias);
}

/** Quoted-printable → bytes. `=XX` blir en byte, `=\r\n` (mjuk radbrytning) försvinner. */
export function avkodaQuotedPrintable(text, { rubrik = false } = {}) {
  let s = String(text ?? '');
  if (rubrik) s = s.replace(/_/g, ' '); // RFC 2047: `_` är mellanslag i Q-kodning
  s = s.replace(/=\r?\n/g, '');
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '=' && /^[0-9A-Fa-f]{2}$/.test(s.slice(i + 1, i + 3))) {
      bytes.push(parseInt(s.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(c.charCodeAt(0) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

/** RFC 2047: `=?charset?B|Q?…?=` i en rubrik → läsbar text. Ord som inte är kodade lämnas. */
export function avkodaRubrik(varde) {
  const s = String(varde ?? '').replace(/\r?\n[ \t]+/g, ' ').trim();
  // Två kodade ord med bara blanksteg emellan slås ihop (RFC 2047 §6.2).
  const ihop = s.replace(/(\?=)\s+(=\?)/g, '$1$2');
  const ut = ihop.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, charset, kod, data) => {
    try {
      const bytes = kod.toUpperCase() === 'B' ? Buffer.from(data, 'base64') : avkodaQuotedPrintable(data, { rubrik: true });
      return decoder(charset).decode(bytes);
    } catch {
      return data;
    }
  });
  return raUtf8(ut);
}

/** Rå 8-bitars UTF-8 i en rubrik (mot standarden, men vanligt) som läst som
 *  latin1 blir "tvÃ¥". Är strängen bara latin1-tecken OCH giltig UTF-8 om den
 *  tolkas som bytes, så var det UTF-8. Redan korrekt text ("två") faller
 *  igenom fatal-avkodningen och lämnas som den är. */
export function raUtf8(s) {
  if (!/[-ÿ]/.test(s) || /[Ā-￿]/.test(s)) return s;
  try { return new TextDecoder('utf-8', { fatal: true }).decode(Buffer.from(s, 'latin1')); } catch { return s; }
}

/** Rubrikblocket → Map(namn i gemener → värde med veckning borttagen). Upprepade rubriker (Received) blir en lista. */
export function tolkaRubriker(block) {
  const karta = new Map();
  const rader = String(block ?? '').split(/\r?\n/);
  let namn = null;
  let varde = '';
  const spara = () => {
    if (!namn) return;
    const tidigare = karta.get(namn);
    if (tidigare === undefined) karta.set(namn, varde.trim());
    else karta.set(namn, [].concat(tidigare, varde.trim()));
  };
  for (const rad of rader) {
    if (/^[ \t]/.test(rad) && namn) { varde += ' ' + rad.trim(); continue; }
    const m = rad.match(/^([!-9;-~]+):[ \t]*(.*)$/);
    if (!m) continue;
    spara();
    namn = m[1].toLowerCase();
    varde = m[2];
  }
  spara();
  return karta;
}

const forsta = (v) => (Array.isArray(v) ? v[0] : v) ?? '';

/** "Content-Type: text/plain; charset=utf-8; boundary=\"x\"" → { typ, parametrar }. */
export function tolkaContentType(varde) {
  const s = String(varde ?? '').trim();
  if (!s) return { typ: 'text/plain', parametrar: {} };
  const [typ, ...rest] = s.split(';');
  const parametrar = {};
  for (const del of rest) {
    const m = del.trim().match(/^([^=]+)=\s*(?:"([^"]*)"|([^;]*))$/);
    if (m) parametrar[m[1].trim().toLowerCase()] = (m[2] ?? m[3] ?? '').trim();
  }
  return { typ: typ.trim().toLowerCase() || 'text/plain', parametrar };
}

/** Adress ur "Namn <x@y.se>" / "x@y.se" / '"Namn" <x@y.se>' → { namn, adress }. */
export function tolkaAdress(varde) {
  const s = avkodaRubrik(varde);
  const m = s.match(/^\s*(?:"?([^"<]*)"?\s*)?<([^>]+)>\s*$/);
  if (m) return { namn: (m[1] || '').trim(), adress: m[2].trim().toLowerCase() };
  const e = s.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/);
  return { namn: e ? s.replace(e[0], '').replace(/[<>"]/g, '').trim() : s.trim(), adress: e ? e[0].toLowerCase() : '' };
}

/** HTML → läsbar text: block-element blir radbrytningar, taggar bort, entiteter avkodas. */
export function htmlTillText(html) {
  let s = String(html ?? '');
  s = s.replace(/<(script|style|head)[\s\S]*?<\/\1>/gi, ' ');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(p|div|tr|li|h[1-6]|blockquote|table|pre)>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  const entiteter = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', aring: 'å', auml: 'ä', ouml: 'ö', Aring: 'Å', Auml: 'Ä', Ouml: 'Ö', oslash: 'ø', aelig: 'æ', Oslash: 'Ø', AElig: 'Æ', eacute: 'é', hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”' };
  s = s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (hel, kod) => {
    if (kod[0] === '#') {
      const n = kod[1].toLowerCase() === 'x' ? parseInt(kod.slice(2), 16) : parseInt(kod.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : hel;
    }
    return entiteter[kod] ?? hel;
  });
  return s.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Avkodar en dels kropp enligt Content-Transfer-Encoding + charset. */
function avkodaKropp(rakropp, rubriker, charset) {
  const cte = String(forsta(rubriker.get('content-transfer-encoding')) ?? '').trim().toLowerCase();
  let bytes;
  if (cte === 'base64') bytes = Buffer.from(rakropp.replace(/[^A-Za-z0-9+/=]/g, ''), 'base64');
  else if (cte === 'quoted-printable') bytes = avkodaQuotedPrintable(rakropp);
  else bytes = Buffer.from(rakropp, 'latin1');
  // 7bit/8bit utan charset: pröva utf-8 först, latin1 om det inte är giltig utf-8.
  if (!charset && (cte === '' || cte === '7bit' || cte === '8bit')) {
    const utf8 = new TextDecoder('utf-8', { fatal: true });
    try { return utf8.decode(bytes); } catch { return decoder('iso-8859-1').decode(bytes); }
  }
  return decoder(charset).decode(bytes);
}

/** Delar ett råmejl i (rubrikblock, kropp) vid första tomma raden. */
export function delaRubrikOchKropp(ra) {
  const s = String(ra ?? '');
  const i = s.search(/\r?\n\r?\n/);
  if (i === -1) return { rubrikblock: s, kropp: '' };
  const skiljelangd = s.slice(i).match(/^\r?\n\r?\n/)[0].length;
  return { rubrikblock: s.slice(0, i), kropp: s.slice(i + skiljelangd) };
}

/** Går igenom MIME-trädet och samlar text/plain + text/html. Bilagor hoppas över. */
export function samlaTextdelar(rubriker, kropp, ut = { plain: [], html: [] }, djup = 0) {
  if (djup > 10) return ut;
  const ct = tolkaContentType(forsta(rubriker.get('content-type')));
  const disposition = String(forsta(rubriker.get('content-disposition')) ?? '').toLowerCase();
  if (ct.typ.startsWith('multipart/')) {
    const boundary = ct.parametrar.boundary;
    if (!boundary) return ut;
    const delar = kropp.split(new RegExp(`(?:^|\\r?\\n)--${boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:--)?[ \\t]*(?=\\r?\\n|$)`));
    // delar[0] är preamble; sista delen efter --boundary-- är epilog.
    for (const del of delar.slice(1)) {
      if (!del.trim()) continue;
      const { rubrikblock, kropp: k } = delaRubrikOchKropp(del.replace(/^\r?\n/, ''));
      samlaTextdelar(tolkaRubriker(rubrikblock), k, ut, djup + 1);
    }
    return ut;
  }
  if (disposition.startsWith('attachment')) return ut;
  if (ct.typ === 'text/plain') ut.plain.push(avkodaKropp(kropp, rubriker, ct.parametrar.charset));
  else if (ct.typ === 'text/html') ut.html.push(htmlTillText(avkodaKropp(kropp, rubriker, ct.parametrar.charset)));
  else if (ct.typ === 'message/rfc822') {
    const inre = tolkaMejl(kropp);
    if (inre.text) ut.plain.push(inre.text);
  }
  return ut;
}

/** Klipper bort citerad tidigare tråd så bara det nya står kvar. */
export function taBortCitat(text) {
  const rader = String(text ?? '').split('\n');
  const ut = [];
  const start = [
    /^-{2,}\s*(original message|ursprungligt meddelande|opprinnelig melding|oprindelig meddelelse|alkuperäinen viesti)\s*-{2,}/i,
    // Gmail på engelska: "On Tue, Sep 8, 2026 at 10:00 AM Namn <x> wrote:"
    // Gmail på svenska:  "Den ons 9 sep. 2026 kl 14:00 skrev Namn <x>:" — verbet före namnet.
    /^(on|den|le|am|på|pe)\s.{3,160}\b(wrote|skrev|schrieb|kirjoitti)\b.*:\s*$/i,
    /^(from|från|fra|von|lähettäjä):\s.+/i,
    /^_{5,}\s*$/,
    /^sent from my (iphone|ipad|samsung|android)/i,
    /^skickat från min (iphone|ipad|samsung|android)/i,
  ];
  for (const rad of rader) {
    const r = rad.trim();
    if (r.startsWith('>')) break;
    if (start.some((re) => re.test(r))) break;
    ut.push(rad);
  }
  return ut.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** "Re: Sv: Fwd: VS: Ang: Ordern" → "ordern" — nyckeln som trådar ihop mejl. */
export function normaliseraAmne(amne) {
  return avkodaRubrik(amne)
    .replace(/^(\s*(re|sv|fwd?|fw|vs|vb|ang|aw|wg|tr|rv|svar|vidarebefordrat)\s*:\s*)+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Datumrubriken → Date, eller null när den inte går att tolka. */
export function tolkaDatum(varde) {
  const s = String(forsta(varde) ?? '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Hela mejlet → ett platt objekt. Det är detta klassificeringen läser. */
export function tolkaMejl(ra, { uid = null, mapp = null } = {}) {
  const { rubrikblock, kropp } = delaRubrikOchKropp(ra);
  const rubriker = tolkaRubriker(rubrikblock);
  const delar = samlaTextdelar(rubriker, kropp);
  const helText = (delar.plain.join('\n\n').trim() || delar.html.join('\n\n').trim());
  const fran = tolkaAdress(forsta(rubriker.get('from')));
  const till = String(forsta(rubriker.get('to')) ?? '').split(',').map(tolkaAdress).filter((a) => a.adress);
  const amne = avkodaRubrik(forsta(rubriker.get('subject')));
  const references = [...new Set(`${forsta(rubriker.get('references')) ?? ''} ${forsta(rubriker.get('in-reply-to')) ?? ''}`
    .match(/<[^>]+>/g) ?? [])];
  return {
    uid,
    mapp,
    messageId: (String(forsta(rubriker.get('message-id')) ?? '').match(/<[^>]+>/) ?? [''])[0],
    references,
    fran,
    till,
    amne,
    amneNyckel: normaliseraAmne(amne),
    datum: tolkaDatum(rubriker.get('date')),
    text: taBortCitat(helText),
    helText,
    autosvar: /^(auto|auto-replied|auto-generated|auto-notified)/i.test(String(forsta(rubriker.get('auto-submitted')) ?? ''))
      || /^(yes|all)$/i.test(String(forsta(rubriker.get('x-autoreply')) ?? ''))
      || /^(auto-?reply|autosvar|out of office|frånvaro|automatic reply|automatiskt svar)/i.test(amne),
    listmejl: rubriker.has('list-unsubscribe') || rubriker.has('list-id'),
  };
}
