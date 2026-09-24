// kommentarer/samla.mjs — från Metas råsvar till loggrader, och från loggrader
// till det rapporten säger. Rena funktioner — testas utan nät.

import { maska } from './maska.mjs';
import { klassa, NIVA, prioritet } from './klassa.mjs';
import { tolkaAnnonsnamn, verksamhetFor, handleUrLank, rensaLank, normaliseraPrefix } from './koppla.mjs';

/** Verksamhet → nyckeln bonus/personer.json och stonebite använder. Ren. */
export const brandnyckel = (verksamhet) => normaliseraPrefix(verksamhet).replace(/[^a-z0-9]/g, '');

/**
 * En loggrad per kommentar. Ren.
 * @param k Metas kommentar + { post, sida }
 * @param annonser alla annonser som bär inlägget (samma creative kan ligga i flera adset)
 */
export function byggRad(k, { annonser, konfig, ops = [], produktmappar = new Map(), hamtad }) {
  const huvud = [...annonser].sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0) || String(a.name).localeCompare(String(b.name)))[0] ?? {};
  const namn = tolkaAnnonsnamn(huvud.name);
  const v = verksamhetFor({ lank: huvud.lank, sida: k.sida, kampanj: huvud.kampanj, kontoId: huvud.konto, annonsnamn: huvud.name }, { konfig, ops });
  const text = maska(k.message, k.message_tags).slice(0, 600);
  const kl = klassa(text);
  const prod = handleUrLank(huvud.lank);
  return {
    id: k.id,
    kanal: k.kanal ?? 'facebook',
    tid: k.created_time,
    hamtad,
    verksamhet: v.verksamhet,
    marknad: v.marknad,
    konto: huvud.konto ?? null,
    sida: k.sida,
    post: k.post,
    annons: huvud.name ?? null,
    annons_id: huvud.id ?? null,
    annonser: annonser.length,
    kampanj: huvud.kampanj ?? null,
    prefix: namn.prefix,
    produktmapp: namn.prefix ? (produktmappar.get(normaliseraPrefix(namn.prefix)) ?? null) : null,
    vinkel: namn.vinkel,
    format: namn.format,
    produkt: prod?.handle ?? null,
    lank: rensaLank(huvud.lank),
    text,
    likes: k.like_count ?? 0,
    svar: k.comment_count ?? 0,
    svar_pa: k.parent?.id ?? null,
    permalink: k.permalink_url ?? null,
    dold: k.is_hidden === true,
    bilaga: k.attachment?.type ?? null,
    niva: kl.niva,
    kategori: kl.kategori,
    allvar: kl.allvar,
    kopare: kl.kopare,
    fraga: kl.fraga,
    konflikt: v.konflikt,
  };
}

const rakna = (rader, nyckel) => {
  const m = new Map();
  for (const r of rader) { const k = nyckel(r); m.set(k, (m.get(k) ?? 0) + 1); }
  return m;
};

/**
 * Det rapporten säger, per verksamhet. Ren.
 * @param nya       loggrader som är nya den här körningen
 * @param trend     loggrader för trendfönstret (14 d), INKLUSIVE de nya
 * @param annonser  alla lästa annonser: [{ name, verksamhet, prefix, vinkel, status }]
 */
export function sammanstall({ nya, trend, annonser = [], konfig }) {
  const r = konfig?.rapport ?? {};
  const likesGrans = r.resonans_likes ?? 3;
  const nyaIds = new Set(nya.map((x) => x.id));
  // 🆕 betyder "aldrig sett förut" — utan tidigare körningar i loggen är allt nytt, och då säger märket ingenting.
  const harHistorik = trend.some((x) => !nyaIds.has(x.id));
  const verksamheter = [...new Set([...nya.map((x) => x.verksamhet)])].sort((a, b) => a.localeCompare(b, 'sv'));
  const ut = {};
  for (const verk of verksamheter) {
    const n = nya.filter((x) => x.verksamhet === verk);
    const t = trend.filter((x) => x.verksamhet === verk);
    const fore = t.filter((x) => !nyaIds.has(x.id));

    const allvarliga = n.filter((x) => x.niva === NIVA.ALLVARLIGT).sort(prioritet).slice(0, r.max_allvarliga ?? 25);
    // Obesvarade köpfrågor: toppnivå, ingen har svarat i tråden (comment_count 0).
    // Meta visar inte VEM som svarat, så ett svar från en annan kund räknas som svar.
    const fragor = n.filter((x) => x.niva === NIVA.FRAGA && !x.svar_pa && (x.svar ?? 0) === 0).sort(prioritet).slice(0, r.max_fragor ?? 15);

    // Invändningar per produkt (prefix) och kluster: nya / 14 dagar / andel av produktens invändningar.
    const produkter = {};
    for (const prefix of [...new Set(t.filter((x) => x.niva === NIVA.INVANDNING || nyaIds.has(x.id)).map((x) => x.prefix ?? '(okänd)'))]) {
      const tp = t.filter((x) => (x.prefix ?? '(okänd)') === prefix);
      const np = n.filter((x) => (x.prefix ?? '(okänd)') === prefix);
      const inv = tp.filter((x) => x.niva === NIVA.INVANDNING);
      const perKat = rakna(inv, (x) => x.kategori);
      const nyaPerKat = rakna(np.filter((x) => x.niva === NIVA.INVANDNING), (x) => x.kategori);
      const forePerKat = rakna(fore.filter((x) => (x.prefix ?? '(okänd)') === prefix && x.niva === NIVA.INVANDNING), (x) => x.kategori);
      const kluster = [...perKat.entries()].map(([kategori, antal]) => ({
        kategori,
        nya: nyaPerKat.get(kategori) ?? 0,
        dagar: antal,
        andel: inv.length ? antal / inv.length : 0,
        ny_invandning: harHistorik && (nyaPerKat.get(kategori) ?? 0) > 0 && !(forePerKat.get(kategori) > 0),
        citat: inv.filter((x) => x.kategori === kategori).sort((a, b) => (Number(nyaIds.has(b.id)) - Number(nyaIds.has(a.id))) || prioritet(a, b)).slice(0, r.max_citat_per_invandning ?? 3).map((x) => ({ id: x.id, text: x.text, likes: x.likes, annons: x.annons, permalink: x.permalink })),
      })).sort((a, b) => b.nya - a.nya || b.dagar - a.dagar);
      const aktivaOB = annonser.filter((a) => a.verksamhet === verk && normaliseraPrefix(a.prefix) === normaliseraPrefix(prefix) && a.vinkel === 'OB' && a.status === 'ACTIVE').map((a) => a.name);
      const exempel = tp.find((x) => x.produkt) ?? tp[0];
      produkter[prefix] = {
        prefix,
        produkt: exempel?.produkt ?? null,
        produktmapp: exempel?.produktmapp ?? null,
        nya: np.length,
        dagar: tp.length,
        invandningar_dagar: inv.length,
        kluster,
        ob_aktiva: [...new Set(aktivaOB)].sort(),
      };
    }

    const resonans = n.filter((x) => (x.likes ?? 0) >= likesGrans && x.kategori !== 'tagg/vän').sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 10);
    ut[verk] = {
      verksamhet: verk,
      nya: n.length,
      annonser_med_nya: new Set(n.map((x) => x.annons_id)).size,
      per_niva: Object.fromEntries(rakna(n, (x) => x.niva)),
      allvarliga,
      fragor,
      produkter: Object.values(produkter).sort((a, b) => b.nya - a.nya || b.dagar - a.dagar),
      resonans,
      taggar: n.filter((x) => x.kategori === 'tagg/vän').length,
      berom: n.filter((x) => x.kategori === 'beröm').length,
      konflikter: [...new Set(n.map((x) => x.konflikt).filter(Boolean))],
      dolda: n.filter((x) => x.dold).length,
      rader: [...n].sort(prioritet),
    };
  }
  return ut;
}

/**
 * Kontrollerar sessionens dom innan den skrivs någonstans. Ren.
 * Varje lead måste bära belägg (kommentars-id i loggen) — och alla belägg måste
 * höra till leadens egen verksamhet, annars hamnar en Bäverbutiks-lead i
 * CaraShells Discord. Domen måste vara skriven för just den här hämtningen
 * (`hamtad`), så en gammal dom aldrig postas två gånger.
 * @returns {{ fel: string[], dom: object }}
 */
export function kontrolleraDom(dom, { kandaIds, nyaIds, verkPerId = new Map(), hamtad = null, verksamheter = null }) {
  const fel = [];
  if (!dom || typeof dom !== 'object') return { fel: ['domen saknas eller är inte ett objekt'], dom: null };
  if (hamtad && dom.hamtad !== hamtad) fel.push(`domen gäller hämtningen ${dom.hamtad ?? '(saknas)'}, men dagens hämtning är ${hamtad} — skriv "hamtad": "${hamtad}" i domen efter att du läst dagens kommentarer`);
  const leads = [];
  for (const [i, l] of (dom.leads ?? []).entries()) {
    const belagg = (l.belagg ?? []).map(String);
    const namn = `lead ${i + 1} (${String(l.lead ?? '').slice(0, 40)})`;
    if (!l.lead || !l.typ) { fel.push(`lead ${i + 1}: saknar "lead" eller "typ"`); continue; }
    if (verksamheter && !verksamheter.has(l.verksamhet)) { fel.push(`${namn}: verksamheten "${l.verksamhet}" finns inte i dagens rapport (${[...verksamheter].join(', ')})`); continue; }
    if (!belagg.length) { fel.push(`${namn}: inga belägg — en lead måste peka på kommentarer`); continue; }
    const okanda = belagg.filter((id) => !kandaIds.has(id));
    if (okanda.length) { fel.push(`${namn}: belägg som inte finns i loggen: ${okanda.join(', ')}`); continue; }
    const andra = belagg.filter((id) => verkPerId.has(id) && verkPerId.get(id) !== l.verksamhet);
    if (andra.length) { fel.push(`${namn}: belägg från en annan verksamhet (${andra.map((id) => `${id} = ${verkPerId.get(id)}`).join(', ')}) — blanda aldrig verksamheterna`); continue; }
    leads.push({ ...l, belagg });
  }
  const svar = [];
  for (const [i, s] of (dom.svar ?? []).entries()) {
    if (!s.id || !s.text) { fel.push(`svar ${i + 1}: saknar id eller text`); continue; }
    if (!nyaIds.has(String(s.id))) { fel.push(`svar ${i + 1}: ${s.id} är inte en av körningens nya kommentarer`); continue; }
    if (!s.fakta) { fel.push(`svar ${i + 1}: saknar "fakta" — ett svar utan källa på produktsidan får inte föreslås`); continue; }
    if (!s.en) { fel.push(`svar ${i + 1}: saknar "en" — VA:n läser engelska och måste veta vad hon klistrar in`); continue; }
    svar.push({ ...s, id: String(s.id) });
  }
  const atgarder = {};
  for (const [id, a] of Object.entries(dom.atgarder ?? {})) {
    if (!nyaIds.has(String(id))) { fel.push(`åtgärd för ${id}: inte en av körningens nya kommentarer`); continue; }
    atgarder[id] = a;
  }
  return { fel, dom: { ...dom, leads, svar, atgarder } };
}
