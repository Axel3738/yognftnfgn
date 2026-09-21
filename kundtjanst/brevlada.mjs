// brevlada.mjs — EN brevlåda som ett litet läs-bara API ovanpå webbmejlen
// (kundtjanst/webmail.mjs). Det är det som både CLI:n (mail.mjs) och
// MCP-servern (mail-mcp.mjs) anropar, så de två kan aldrig bete sig olika.
//
// Varför en egen fil: webmail.mjs är byggd för veckorapporten (hämta ALLT
// sedan ett datum). Här behövs det en människa eller en Claude-session vill
// göra i en inkorg: se mapparna, bläddra nyast först, läsa ETT mejl, söka.
// Listningen använder Roundcubes egna listkolumner (ämne, avsändare, datum,
// läst/oläst) och hämtar inte råmejlet — det gör att en sida med 50 mejl tar
// en sekund i stället för en minut.
//
// Läsningen är läs-bar precis som i webmail.mjs: inget markeras som läst,
// Roundcubes viewsource sätter ingen \Seen-flagga.
//
// SKRIVNINGEN (2026-09-21, autosvaret): svara(), utkast(), flagga(), flytta()
// och skapaMapp() — fem verb, inget annat. Ingen radering, ingen läst-
// markering. Varje skrivning läser tillbaka det den kan (utkastets uid,
// mapplistan) och kastar när Roundcube inte bekräftar. `svara()` bygger
// kroppen som "vår text + tom rad + Roundcubes eget citat av kundens mejl"
// så tråden ser ut som ett vanligt svar i kundens klient.
//
// Sessionen mot Roundcube dör efter ~30 min utan trafik. Varje metod går via
// `medSession`, som loggar in vid behov och loggar in IGEN en gång om
// webbmejlen svarar som om sessionen gått ut — MCP-servern lever länge, och
// utan det hade första anropet efter en lunch alltid felat.

import { WebmailKlient } from './webmail.mjs';
import { tolkaMejl, htmlTillText, delaRubrikOchKropp, tolkaRubriker, tolkaDatum } from './mime.mjs';
import { upptackBrands, korkonfig } from './brands.mjs';

/** Datumet ur ett råmejl (Date-rubriken), utan att tolka hela mejlet. */
export function datumUrRa(ra) {
  const { rubrikblock } = delaRubrikOchKropp(String(ra ?? '').slice(0, 20_000));
  return tolkaDatum(tolkaRubriker(rubrikblock).get('date'));
}

/**
 * Roundcubes listkolumner → en rad som går att visa. Kolumnerna kommer som
 * HTML-fragment (avläst 2026-09-12 och 2026-09-21): `fromto` är
 * `<span class="adr"><span title="anna@gmail.com" class="rcmContactAddress">Anna</span></span>`
 * och `subject` är HTML-escapad text (ibland inlindad i en <a>). Taggarna
 * skalas av och entiteterna avkodas med samma funktion som mejlkroppar.
 */
export function tolkaListrad(rad) {
  const k = rad?.kolumner ?? {};
  const f = rad?.flaggor ?? {};
  const fromto = String(k.fromto ?? k.from ?? '');
  const adress = (fromto.match(/title="([^"]+@[^"]+)"/) ?? fromto.match(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/) ?? [])[1] ?? '';
  return {
    uid: Number(rad?.uid),
    amne: htmlTillText(String(k.subject ?? '')).replace(/\s+/g, ' ').trim(),
    // Roundcube visar vissa namn citerade: `Bäverbutiken.se "(Shopify)"`. Citattecknen bär ingen information.
    fran: htmlTillText(fromto).replace(/"/g, '').replace(/\s+/g, ' ').trim(),
    franAdress: adress.toLowerCase(),
    datum: htmlTillText(String(k.date ?? '')).trim(),
    storlek: htmlTillText(String(k.size ?? '')).trim(),
    last: Boolean(Number(f.seen ?? 0)),
    flaggad: Boolean(Number(f.flagged ?? 0)),
    bilaga: Boolean(f.ctype && /multipart\/mixed|application\//i.test(String(f.ctype))),
  };
}

/** Ett tolkat mejl → det som visas/returneras (ingen intern MIME-data). */
export function formateraMejl(m, { ra = null, maxTecken = 0 } = {}) {
  const klipp = (s) => (maxTecken > 0 && s.length > maxTecken ? s.slice(0, maxTecken) + `\n… [klippt vid ${maxTecken} tecken av ${s.length}]` : s);
  const ut = {
    uid: m.uid,
    mapp: m.mapp,
    messageId: m.messageId,
    fran: m.fran,
    till: m.till,
    amne: m.amne,
    datum: m.datum ? m.datum.toISOString() : null,
    text: klipp(m.text ?? ''),
    helText: klipp(m.helText ?? ''),
    autosvar: Boolean(m.autosvar),
    listmejl: Boolean(m.listmejl),
  };
  if (ra !== null) ut.ra = ra;
  return ut;
}

/** Felen som betyder "sessionen gick ut" hos Roundcube — då loggas in igen. */
export function arSessionsfel(e) {
  return /sessionen (kan ha )?gått ut|utloggad|request_token stämde inte|403/i.test(String(e?.message ?? ''));
}

/**
 * Vilket brand brevlådan tillhör. Ett angivet id vinner; annars det ENDA
 * brandet som har mejl konfigurerat i miljön; finns flera eller inget: fel
 * med listan, aldrig en gissning.
 */
export function valjBrevlada(onskat, { env = process.env, brands = upptackBrands() } = {}) {
  const konfar = brands.filter((b) => b.aktiv !== false).map((b) => korkonfig(b, env));
  if (onskat) {
    const id = String(onskat).trim().toLowerCase();
    const k = konfar.find((b) => b.id === id || b.brand.toLowerCase() === id);
    if (!k) throw new Error(`Brandet "${onskat}" finns inte. Kända: ${konfar.map((b) => b.id).join(', ')}.`);
    if (!k.mail.konfigurerad) throw new Error(`Brandet ${k.id} har ingen brevlåda i miljön — saknar ${k.mail.saknas.join(', ')}.`);
    return k;
  }
  const klara = konfar.filter((k) => k.mail.konfigurerad);
  if (klara.length === 1) return klara[0];
  if (!klara.length) throw new Error(`Ingen brevlåda är konfigurerad. Lägg in ${konfar.map((k) => k.envNamn.mailPass).join(' eller ')} i Environments.`);
  throw new Error(`Flera brevlådor är konfigurerade (${klara.map((k) => k.id).join(', ')}) — ange vilken med --brand <id>.`);
}

export class Brevlada {
  /**
   * @param {object} konfig  körkonfigen ur valjBrevlada (id, brand, mail.{user,pass,webmail,inkorg})
   * @param {object} val     fetchFn (tester), logg (stderr), paus (ms mellan anrop)
   */
  constructor(konfig, { fetchFn = fetch, logg = () => {}, paus = 120 } = {}) {
    this.konfig = konfig;
    this.id = konfig.id;
    this.brand = konfig.brand;
    this.user = konfig.mail.user;
    this.inkorg = konfig.mail.inkorg || 'INBOX';
    this.logg = logg;
    this.klient = new WebmailKlient({ url: konfig.mail.webmail, user: konfig.mail.user, pass: konfig.mail.pass, fetchFn, logg, paus });
    this.inloggad = false;
    this.inloggningar = 0;
    this.ko = Promise.resolve();
  }

  async loggaIn() {
    await this.klient.loggaIn();
    this.inloggad = true;
    this.inloggningar++;
  }

  /**
   * Kör `fn` med en levande session: loggar in vid behov, en gång till om
   * sessionen gått ut. Anropen körs ETT I TAGET per brevlåda — mätt skarpt
   * 2026-09-21: två MCP-anrop som kom samtidigt före inloggningen loggade in
   * parallellt, och det andra fick 403 av Roundcube (samma cookie, två tokens).
   */
  medSession(fn) {
    const kor = this.ko.then(() => this.#medSession(fn));
    this.ko = kor.catch(() => {});
    return kor;
  }

  async #medSession(fn) {
    if (!this.inloggad) await this.loggaIn();
    try {
      return await fn(this.klient);
    } catch (e) {
      if (!arSessionsfel(e)) throw e;
      this.logg(`Webbmejl: sessionen verkar ha gått ut (${e.message.slice(0, 80)}) — loggar in igen`);
      this.inloggad = false;
      await this.loggaIn();
      return fn(this.klient);
    }
  }

  /** Mappnamnen (INBOX, Sent, Drafts …) som webbmejlen känner till. */
  async mappar() {
    return this.medSession(async (k) => (k.mappar.length ? [...k.mappar] : [this.inkorg]));
  }

  /**
   * En sida ur en mapp, nyast först: { mapp, sida, sidor, antal, rader }.
   * `antal` begränsar raderna som returneras (Roundcube ger ~50 per sida).
   */
  async lista({ mapp = this.inkorg, sida = 1, antal = 50 } = {}) {
    return this.medSession(async (k) => {
      const { rader, env } = await k.listaSida(mapp, Math.max(1, Number(sida) || 1));
      return {
        mapp,
        sida: Number(env?.current_page ?? sida),
        sidor: Number(env?.pagecount ?? 1),
        totalt: Number(env?.messagecount ?? rader.length),
        olasta: Number(env?.unread_counts?.[mapp] ?? env?.unreadcount ?? NaN),
        rader: rader.slice(0, Math.max(1, Number(antal) || 50)).map(tolkaListrad),
      };
    });
  }

  /** Ett mejl, tolkat. `ra: true` ger även råkällan. `maxTecken` klipper texten. */
  async las(uid, { mapp = this.inkorg, ra = false, maxTecken = 0 } = {}) {
    const n = kollaUid(uid);
    return this.medSession(async (k) => {
      const rakalla = await k.hamtaRa(mapp, n);
      const m = tolkaMejl(rakalla, { uid: n, mapp });
      return formateraMejl(m, { ra: ra ? rakalla : null, maxTecken });
    });
  }

  /**
   * Sök i en mapp, nyast först. Matchar ämne + avsändare ur listkolumnerna
   * (billigt); med `kropp: true` hämtas råmejlet för varje rad och texten
   * söks också (en hämtning per mejl — dyrt, håll `maxSidor` lågt).
   * Flera ord = alla måste finnas (i valfri ordning, skiftlägesokänsligt).
   */
  async sok(fraga, { mapp = this.inkorg, maxSidor = 4, kropp = false, max = 50 } = {}) {
    const ord = String(fraga ?? '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!ord.length) throw new Error('Sökningen behöver minst ett ord.');
    const traffar = (s) => ord.every((o) => s.includes(o));
    return this.medSession(async (k) => {
      const ut = [];
      let sidor = 1;
      let lasta = 0;
      for (let sida = 1; sida <= maxSidor && sida <= sidor; sida++) {
        const { rader, env } = await k.listaSida(mapp, sida);
        sidor = Number(env?.pagecount ?? 1);
        if (!rader.length) break;
        for (const rad of rader) {
          lasta++;
          const r = tolkaListrad(rad);
          const hoLista = `${r.amne} ${r.fran} ${r.franAdress}`.toLowerCase();
          if (traffar(hoLista)) { ut.push({ ...r, traff: 'ämne/avsändare' }); }
          else if (kropp) {
            const rakalla = await k.hamtaRa(mapp, r.uid);
            const m = tolkaMejl(rakalla, { uid: r.uid, mapp });
            if (traffar(`${m.amne} ${m.fran.namn} ${m.fran.adress} ${m.helText}`.toLowerCase())) {
              ut.push({ ...r, amne: m.amne || r.amne, traff: 'text', utdrag: utdragKring(m.helText, ord[0]) });
            }
          }
          if (ut.length >= max) return { mapp, fraga, lasta, sidorLasta: sida, sidor, traffar: ut, klippt: true };
        }
      }
      return { mapp, fraga, lasta, sidorLasta: Math.min(maxSidor, sidor), sidor, traffar: ut, klippt: false };
    });
  }

  // ---------------------------------------------------------------- skrivningen

  /**
   * Svarsformuläret för ett mejl, utan att skicka: vem svaret går till, ämnet
   * Roundcube satt ("Re: …") och citatet. Det autosvaret tittar på innan det
   * bestämmer sig, och det CLI:n visar med `svara --visa`.
   */
  async forhandsgranskaSvar(uid, { mapp = this.inkorg } = {}) {
    const n = kollaUid(uid);
    return this.medSession(async (k) => {
      const kompose = await k.oppnaSvar(mapp, n);
      return { uid: n, mapp, till: kompose.till, amne: kompose.amne, fran: kompose.identiteter.find((i) => i.id === kompose.fran)?.text ?? kompose.fran, citat: kompose.citat, replyMsgid: kompose.replyMsgid };
    });
  }

  /**
   * Svarar på mejlet `uid` i tråden (In-Reply-To/References sätts av
   * Roundcube). `text` är vårt svar; citatet hängs på efter en tom rad om
   * `medCitat` (standard). `utkast: true` sparar i Drafts i stället för att
   * skicka. Returnerar { typ: 'skickat'|'utkast', till, amne, utkastUid }.
   */
  async svara(uid, { mapp = this.inkorg, text, amne = null, utkast = false, medCitat = true } = {}) {
    const n = kollaUid(uid);
    const egen = String(text ?? '').replace(/\r\n/g, '\n').trim();
    if (!egen) throw new Error('svara: texten är tom — ett tomt svar skickas aldrig.');
    return this.medSession(async (k) => {
      const kompose = await k.oppnaSvar(mapp, n);
      const citat = medCitat && kompose.citat.trim() ? `\n\n${kompose.citat.replace(/\r\n/g, '\n').trim()}` : '';
      const r = await k.skickaSvar(kompose, { text: `${egen}\n${citat}`, amne, utkast });
      return { uid: n, mapp, typ: r.typ, till: kompose.till, amne: amne ?? kompose.amne, utkastUid: r.utkastUid, sparfel: r.sparfel, meddelande: r.meddelande, utkastMapp: kompose.utkastMapp };
    });
  }

  /** Samma som svara() men alltid som utkast i Drafts — --torr-läget. */
  utkast(uid, val = {}) {
    return this.svara(uid, { ...val, utkast: true });
  }

  /** Flaggar (\Flagged) mejlet, eller tar bort flaggan med `av: true`. */
  async flagga(uid, { mapp = this.inkorg, av = false } = {}) {
    const n = kollaUid(uid);
    return this.medSession(async (k) => {
      await k.markera(mapp, n, av ? 'unflagged' : 'flagged');
      return { uid: n, mapp, flaggad: !av };
    });
  }

  /**
   * Flyttar mejlet till mappen `till`. Saknas mappen skapas den bara när
   * `skapa: true` — annars är det ett fel med mappnamnen i texten, så ett
   * stavfel aldrig ger en ny mapp av misstag.
   */
  async flytta(uid, { mapp = this.inkorg, till, skapa = false } = {}) {
    const n = kollaUid(uid);
    const mal = String(till ?? '').trim();
    if (!mal) throw new Error('flytta: ange målmappen med --till <mapp>.');
    return this.medSession(async (k) => {
      let skapad = false;
      if (k.mappar.length && !k.mappar.includes(mal)) {
        if (!skapa) throw Object.assign(new Error(`Mappen "${mal}" finns inte i brevlådan (${k.mappar.join(', ')}). Skapa den med --skapa, eller välj en som finns.`), { kod: 'MAPP_SAKNAS' });
        await k.skapaMapp(mal);
        skapad = true;
      }
      await k.flytta(mapp, n, mal);
      return { uid: n, fran: mapp, till: mal, skapad };
    });
  }

  /** Skapar en mapp på toppnivå. Finns den redan: ingen ändring, `fannsRedan: true`. */
  async skapaMapp(namn) {
    return this.medSession(async (k) => {
      const n = String(namn ?? '').trim();
      if (k.mappar.length && k.mappar.includes(n)) return { namn: n, fannsRedan: true, mappar: [...k.mappar] };
      const r = await k.skapaMapp(n);
      return { namn: r.namn, fannsRedan: false, mappar: r.mappar };
    });
  }

  async loggaUt() {
    if (this.inloggad) await this.klient.loggaUt();
    this.inloggad = false;
  }
}

function kollaUid(uid) {
  const n = Number(uid);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`uid måste vara ett positivt heltal, fick "${uid}".`);
  return n;
}

/** ~160 tecken runt första träffen av `ord` i texten — så sökträffen går att bedöma utan att öppna mejlet. */
export function utdragKring(text, ord, bredd = 80) {
  const s = String(text ?? '').replace(/\s+/g, ' ');
  const i = s.toLowerCase().indexOf(String(ord).toLowerCase());
  if (i === -1) return s.slice(0, bredd * 2).trim();
  const start = Math.max(0, i - bredd);
  const slut = Math.min(s.length, i + ord.length + bredd);
  return `${start > 0 ? '…' : ''}${s.slice(start, slut).trim()}${slut < s.length ? '…' : ''}`;
}

/** Öppna en brevlåda ur miljön: brand-id (valfritt) → Brevlada. */
export function oppnaBrevlada(brandId, { env = process.env, fetchFn = fetch, logg = () => {}, paus = 120 } = {}) {
  const konfig = valjBrevlada(brandId, { env });
  return new Brevlada(konfig, { fetchFn, logg, paus });
}
