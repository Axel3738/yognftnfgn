// webmail.mjs — läser brevlådan genom Loopias webbmejl (Roundcube) över
// HTTPS, precis som VA:n gör i webbläsaren. Noll beroenden (inbyggd fetch).
//
// Varför filen finns: claude.ai-containern släpper bara HTTPS, så IMAP (993)
// går inte därifrån (mätt 2026-09-12, se imap.mjs SPARRAD_PORT). Axel vill
// inte vidarebefordra mejlen någon annanstans (2026-09-12: "jag får dom på
// loopia"). Webbmejlen ligger på https://webmail.loopia.se/ och är Roundcube
// 1.7 (avläst 2026-09-12: rcversion 10703, skin loopia_elastic) — samma
// inloggning som brevlådan, och den svarar på port 443.
//
// LÄS-BARA: bara inloggning, lista, hämta råkälla (viewsource) och utloggning.
// Inget markeras som läst (viewsource sätter ingen \Seen-flagga i Roundcube),
// inget flyttas, inget raderas.
//
// Flödet mot Roundcube:
//   1. GET  /                           → cookie roundcube_sessid + _token i formuläret
//   2. POST /?_task=login               → 302 vid lyckad inloggning, ny sessionscookie
//   3. GET  /?_task=mail&_mbox=INBOX    → request_token ur rcmail.set_env({...})
//   4. GET  /?_task=mail&_action=list&_mbox=…&_page=N&_sort=date_DESC&_remote=1
//        + header X-Roundcube-Request   → JSON { env: {pagecount…}, exec: "this.add_message_row(uid, {…}, {…}, …);" }
//   5. GET  /?_task=mail&_action=viewsource&_uid=…&_mbox=…   → råmejlet (text/plain), samma form som IMAP ger
//   6. GET  /?_task=logout
//
// ⚠️ Det här är ett gränssnitt byggt för människor, inte ett API. Byter Loopia
// Roundcube-version kan något steg sluta stämma. Varje steg kastar därför ett
// fel som säger exakt VILKET steg som inte kände igen svaret — så nästa
// session kan rätta det på tio minuter i stället för att gissa.

export const LOOPIA_WEBMAIL = 'https://webmail.loopia.se/';

// ------------------------------------------------------------------ rena hjälpare

/** Set-Cookie-rader → { namn: värde } (bara namn=värde, inga attribut). */
export function tolkaCookies(rader = []) {
  const ut = {};
  for (const r of rader) {
    const forsta = String(r).split(';')[0];
    const i = forsta.indexOf('=');
    if (i > 0) ut[forsta.slice(0, i).trim()] = forsta.slice(i + 1).trim();
  }
  return ut;
}

/** `_token` ur inloggningsformuläret, eller request_token ur rcmail.set_env. null om inget hittas. */
export function plockaToken(html) {
  const s = String(html ?? '');
  const form = s.match(/name="_token"\s+value="([^"]+)"/) ?? s.match(/value="([^"]+)"\s+name="_token"/);
  if (form) return form[1];
  const env = s.match(/"request_token":"([^"]+)"/);
  return env ? env[1] : null;
}

/** rcmail.set_env({...}) ur en sida → objekt (balanserade klamrar, strängar respekteras). null om det inte går. */
export function plockaSetEnv(html) {
  const s = String(html ?? '');
  const start = s.indexOf('rcmail.set_env(');
  if (start === -1) return null;
  const obj = plockaObjekt(s, s.indexOf('{', start));
  if (!obj) return null;
  try { return JSON.parse(obj.text); } catch { return null; }
}

/** Ett JSON-objekt som börjar vid index `i` ('{'). Returnerar { text, slut } eller null. */
export function plockaObjekt(s, i) {
  if (i < 0 || s[i] !== '{') return null;
  let djup = 0;
  let iStrang = false;
  for (let j = i; j < s.length; j++) {
    const c = s[j];
    if (iStrang) {
      if (c === '\\') j++;
      else if (c === '"') iStrang = false;
      continue;
    }
    if (c === '"') iStrang = true;
    else if (c === '{') djup++;
    else if (c === '}') { djup--; if (djup === 0) return { text: s.slice(i, j + 1), slut: j + 1 }; }
  }
  return null;
}

/**
 * Roundcubes list-svar → { rader: [{ uid, kolumner, flaggor }], env }.
 * `svar` är JSON-texten ({"action":"list","env":{…},"exec":"this.add_message_row(…);…"}).
 * Kastar med tydlig text om formen inte känns igen.
 */
export function tolkaListSvar(svar) {
  let json;
  try { json = typeof svar === 'string' ? JSON.parse(svar) : svar; } catch { throw new Error('Roundcube list-svaret var inte JSON — är sessionen utloggad? (steg 4)'); }
  const exec = String(json?.exec ?? '');
  const rader = [];
  let pos = 0;
  const NYCKEL = 'add_message_row(';
  while ((pos = exec.indexOf(NYCKEL, pos)) !== -1) {
    pos += NYCKEL.length;
    const m = exec.slice(pos).match(/^\s*"?(\d+)"?\s*,\s*/);
    if (!m) continue;
    const uid = Number(m[1]);
    let i = pos + m[0].length;
    const kol = plockaObjekt(exec, i);
    if (!kol) continue;
    i = exec.indexOf('{', kol.slut);
    const fl = plockaObjekt(exec, i);
    let kolumner = {};
    let flaggor = {};
    try { kolumner = JSON.parse(kol.text); } catch { /* lämna tomt */ }
    try { flaggor = fl ? JSON.parse(fl.text) : {}; } catch { /* lämna tomt */ }
    rader.push({ uid, kolumner, flaggor });
    pos = fl ? fl.slut : kol.slut;
  }
  return { rader, env: json?.env ?? {} };
}

/** Mappnamnen ur mailsidans set_env (olika Roundcube-versioner lägger dem olika). */
export function mapparUrEnv(env) {
  if (!env) return [];
  if (Array.isArray(env.mailboxes_list)) return env.mailboxes_list.map(String);
  if (env.mailboxes && typeof env.mailboxes === 'object') return Object.keys(env.mailboxes);
  return [];
}

// ------------------------------------------------------------------ klienten

export class WebmailKlient {
  constructor({ url = LOOPIA_WEBMAIL, user, pass, fetchFn = fetch, logg = () => {}, paus = 120 } = {}) {
    this.url = String(url).replace(/\/+$/, '') + '/';
    this.user = user;
    this.pass = pass;
    this.fetchFn = fetchFn;
    this.logg = logg;
    this.paus = paus;
    this.cookies = {};
    this.token = null;
    this.mappar = [];
  }

  cookieRad() {
    return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  async anrop(sokvag, { metod = 'GET', kropp = null, ajax = false, redirect = 'manual' } = {}) {
    if (this.paus) await new Promise((r) => setTimeout(r, this.paus));
    const headers = {
      Cookie: this.cookieRad(),
      'User-Agent': 'Mozilla/5.0 (kundtjanst-rutinen; read-only)',
      Accept: ajax ? 'application/json, text/javascript, */*; q=0.01' : 'text/html,*/*',
    };
    if (kropp) headers['Content-Type'] = 'application/x-www-form-urlencoded';
    if (ajax && this.token) { headers['X-Roundcube-Request'] = this.token; headers['X-Requested-With'] = 'XMLHttpRequest'; }
    const svar = await this.fetchFn(this.url + sokvag.replace(/^\//, ''), { method: metod, headers, body: kropp, redirect });
    const nya = typeof svar.headers.getSetCookie === 'function' ? svar.headers.getSetCookie() : [];
    Object.assign(this.cookies, tolkaCookies(nya));
    return svar;
  }

  /** Steg 1–3. Kastar med steget i texten om något inte stämmer. */
  async loggaIn() {
    const start = await this.anrop('');
    const startHtml = await start.text();
    const token = plockaToken(startHtml);
    if (!token || !this.cookies.roundcube_sessid) {
      throw new Error(`Webbmejlen ${this.url} gav ingen inloggningssida med _token och sessionscookie (steg 1, HTTP ${start.status}). Är adressen rätt? Sätt mail.webmail i brandfilen om Loopia flyttat den.`);
    }
    const form = new URLSearchParams({ _token: token, _task: 'login', _action: 'login', _timezone: 'Europe/Stockholm', _url: '', _user: this.user, _pass: this.pass });
    const login = await this.anrop('?_task=login', { metod: 'POST', kropp: form.toString() });
    const text = login.status === 302 || login.status === 303 ? '' : await login.text();
    if (login.status === 401 || /name="_pass"/.test(text)) {
      throw Object.assign(new Error(`Webbmejlen nekade inloggningen för ${this.user} (steg 2, HTTP ${login.status}). Kontrollera KUNDTJANST_MAIL_PASS — Loopia: användarnamnet är hela mejladressen.`), { kod: 'LOGIN_NEKAD' });
    }
    if (!(login.status === 302 || login.status === 303 || /"task":"mail"/.test(text))) {
      throw new Error(`Webbmejlen svarade oväntat på inloggningen (steg 2, HTTP ${login.status}): ${text.replace(/\s+/g, ' ').slice(0, 160)}`);
    }
    const mail = await this.anrop('?_task=mail&_mbox=INBOX');
    const mailHtml = await mail.text();
    const env = plockaSetEnv(mailHtml);
    this.token = env?.request_token ?? plockaToken(mailHtml);
    if (!this.token || env?.task !== 'mail') {
      throw new Error(`Inloggad, men mailsidan gav ingen request_token (steg 3, HTTP ${mail.status}, task=${env?.task ?? '?'}). Roundcube-versionen kan ha ändrats.`);
    }
    this.mappar = mapparUrEnv(env);
    this.logg(`Webbmejl: inloggad som ${this.user} (Roundcube ${env?.rcversion ?? '?'}, ${this.mappar.length} mappar kända)`);
    return this;
  }

  /** En sida ur listan i en mapp, nyast först. Kastar vid okänd mapp. */
  async listaSida(mapp, sida = 1) {
    const q = new URLSearchParams({ _task: 'mail', _action: 'list', _mbox: mapp, _page: String(sida), _sort: 'date_DESC', _remote: '1', _unlock: '0', _token: this.token });
    const svar = await this.anrop(`?${q}`, { ajax: true });
    const text = await svar.text();
    if (svar.status === 403) throw new Error(`Roundcube nekade listningen (403, steg 4) — request_token stämde inte. Roundcube-versionen kan ha ändrats.`);
    if (!svar.ok) throw new Error(`Roundcube list gav HTTP ${svar.status} (steg 4) för mappen ${mapp}.`);
    const r = tolkaListSvar(text);
    // Okänd mapp: Roundcube svarar med ett felmeddelande i exec i stället för rader.
    if (!r.rader.length && /display_message\("[^"]*(not exist|finns inte|does not|error)/i.test(String(JSON.parse(text)?.exec ?? ''))) {
      throw Object.assign(new Error(`Mappen ${mapp} finns inte i webbmejlen.`), { kod: 'MAPP_SAKNAS' });
    }
    return r;
  }

  /** Råmejlet för ett uid — samma form som IMAP:s BODY[]. */
  async hamtaRa(mapp, uid) {
    const q = new URLSearchParams({ _task: 'mail', _action: 'viewsource', _uid: String(uid), _mbox: mapp, _token: this.token });
    const svar = await this.anrop(`?${q}`);
    if (!svar.ok) throw new Error(`Roundcube viewsource gav HTTP ${svar.status} (steg 5) för uid ${uid} i ${mapp}.`);
    const ra = Buffer.from(await svar.arrayBuffer()).toString('latin1');
    if (/^\s*<!DOCTYPE|<html/i.test(ra.slice(0, 200))) throw new Error(`Roundcube viewsource gav en HTML-sida i stället för råmejlet (steg 5, uid ${uid}) — sessionen kan ha gått ut.`);
    return ra;
  }

  /**
   * Alla mejl i en mapp sedan `sedan` (Date): [{ uid, ra, datum }]. Går sida för
   * sida (nyast först) och slutar när ett mejl är äldre än gränsen.
   * `datumUr(ra)` avgör datumet ur råmejlet (mime.tolkaDatum på Date-rubriken).
   */
  async hamtaSedan(mapp, sedan, { datumUr, maxSidor = 20 } = {}) {
    const gr = new Date(sedan).getTime();
    const ut = [];
    for (let sida = 1; sida <= maxSidor; sida++) {
      const { rader, env } = await this.listaSida(mapp, sida);
      if (!rader.length) break;
      let aldre = false;
      for (const rad of rader) {
        const ra = await this.hamtaRa(mapp, rad.uid);
        const d = datumUr ? datumUr(ra) : null;
        if (d && d.getTime() < gr) { aldre = true; break; }
        ut.push({ uid: rad.uid, ra, datum: d });
      }
      if (aldre) break;
      const sidor = Number(env?.pagecount ?? 1);
      if (sida >= sidor) break;
    }
    return ut;
  }

  /** Första mappen i listan som finns. null om ingen. */
  async valjForstaMapp(kandidater) {
    const kanda = this.mappar.length ? kandidater.filter((k) => this.mappar.includes(k)) : kandidater;
    for (const namn of kanda.length ? kanda : kandidater) {
      try { await this.listaSida(namn, 1); return namn; } catch (e) { if (e.kod !== 'MAPP_SAKNAS') throw e; }
    }
    return null;
  }

  async loggaUt() {
    try { if (this.token) await this.anrop(`?_task=logout&_token=${encodeURIComponent(this.token)}`); } catch { /* sessionen dör ändå på 30 min */ }
    this.token = null;
  }
}

/**
 * Det run.mjs anropar: { mapp, antal, mejl: [{ uid, ra }] } — samma form som
 * imap.hamtaMapp, så resten av flödet inte vet vilken väg mejlen kom.
 */
export async function hamtaMappViaWebmail(klient, mappar, sedan, { datumUr } = {}) {
  const mapp = await klient.valjForstaMapp(Array.isArray(mappar) ? mappar : [mappar]);
  if (!mapp) return { mapp: null, antal: 0, mejl: [] };
  const mejl = await klient.hamtaSedan(mapp, sedan, { datumUr });
  return { mapp, antal: mejl.length, mejl };
}
