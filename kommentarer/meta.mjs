// kommentarer/meta.mjs — hämtar kommentarerna på alla annonser som visas just nu.
//
// Läs-bart. Svarar aldrig, döljer aldrig, raderar aldrig en kommentar.
//
// Vägen, mätt 2026-09-24 mot de fem kontona token:en når:
//   1. Annonserna: kontots ACTIVE-annonser + alla annonser med spend i fönstret
//      (en pausad annons får kommentarer i dagar efteråt). Fält: namn, kampanj,
//      creative{effective_object_story_id} + landningslänken.
//      1 178 aktiva annonser → 1 178 inlägg (varje annons har eget inlägg).
//   2. Sidtoken per Facebook-sida: `/<sida>?fields=access_token` med
//      META_ACCESS_TOKEN. `/<inlägg>/comments` svarar 190 med användartoken.
//   3. Kommentarerna: Graphs BATCH-API, 50 inlägg per POST (1,6 s per 50).
//      ⚠️ `?ids=a,b,c` är avvecklat — "The ids query parameter is deprecated in
//      v26.0+" (mätt samma dag, även mot v21.0-adressen).
//      `filter=stream` ger svaren också, `since=` fönstret.
//   4. `from` returneras INTE (sekretess) — vi kan varken se vem som skrev eller
//      om sidan själv svarat. Namn i texten kommer ur taggar: `message_tags`
//      bär offset/längd, och maska.mjs byter dem mot "@…".
//
// Mätt samma dag: 72 timmar gav 204 kommentarer (SE 84, NO 17, OPS/CaraShell
// 54, UK/CaraShell US 49) på ~63 sekunder. En sida (1317870104733246) gav
// ingen sidtoken — den rapporteras som oläst med Metas orsak, aldrig som noll.

// Samma version som tools/meta-lib.mjs. v21.0 (släppt okt 2024) går ur stöd runt okt 2026.
export const V = process.env.META_API_VERSION || 'v23.0';
const GRAPH = `https://graph.facebook.com/${V}`;
const vanta = (ms) => new Promise((r) => setTimeout(r, ms));

// Samma lärdom som tools/meta-lib.mjs: kod 17 lyfter inte på sekunder.
export const BACKOFF_MS = [30_000, 60_000, 120_000, 240_000, 300_000];
const RATE = new Set([4, 17, 32, 613, 80001, 80004]);

/** Är felet ett tak/transient fel som ska vänta och prövas igen? Ren. */
export function arOmforsok(fel, status = 200) {
  if (!fel) return status >= 500;
  return RATE.has(fel.code) || fel.is_transient === true || fel.code === 1 || fel.code === 2
    || /request limit reached|too many calls/i.test(fel.message ?? '') || status >= 500;
}

/**
 * Klienten. `fetchFn` och `sov` går att byta i testerna. Alla väntrader går på
 * stderr — stdout är JSON när kor.mjs körs med --json.
 */
export function skapaKlient({ token, fetchFn = fetch, sov = vanta, logg = (s) => console.error(s), backoff = BACKOFF_MS } = {}) {
  if (!token) throw new Error('META_ACCESS_TOKEN saknas i miljön.');

  async function get(sokvag, tok = token) {
    const url = sokvag.startsWith('http') ? sokvag : `${GRAPH}/${sokvag}${sokvag.includes('?') ? '&' : '?'}access_token=${encodeURIComponent(tok)}`;
    for (let forsok = 0; ; forsok++) {
      let res; let j;
      try {
        // Utan timeout blir ett tappat socket en TYST död (meta-lib.mjs, 2026-09-21).
        res = await fetchFn(url, { signal: AbortSignal.timeout(90_000) });
        j = await res.json().catch(() => ({}));
      } catch (e) {
        if (forsok >= backoff.length) throw new Error(`Meta GET ${sokvag.split('?')[0]}: ${e.message}`);
        logg(`  ⏳ Meta svarade inte (${e.message}) — väntar ${backoff[forsok] / 1000}s`);
        await sov(backoff[forsok]);
        continue;
      }
      if (!j.error && res.ok !== false) return j;
      if (arOmforsok(j.error, res.status) && forsok < backoff.length) {
        logg(`  ⏳ Meta ${j.error?.code ?? res.status}: ${j.error?.message ?? ''} — väntar ${backoff[forsok] / 1000}s`);
        await sov(backoff[forsok]);
        continue;
      }
      const f = j.error ?? {};
      const e = new Error(`Meta ${sokvag.split('?')[0].replace(/access_token=[^&]+/, '')}: (${f.code ?? res.status}) ${f.message ?? 'okänt fel'}`);
      e.meta = f;
      throw e;
    }
  }

  async function allaSidor(sokvag, tok = token, max = 20_000) {
    const ut = [];
    let nasta = sokvag;
    while (nasta && ut.length < max) {
      const j = await get(nasta, tok);
      ut.push(...(j.data ?? []));
      nasta = j.paging?.next ?? null;
    }
    return ut;
  }

  /** Graph-batch: upp till 50 relativa GET. Returnerar [{ok, body|fel}] i samma ordning. */
  async function batch(relativa, tok) {
    const svar = new Array(relativa.length).fill(null);
    let kvar = relativa.map((_, i) => i);
    for (let forsok = 0; kvar.length; forsok++) {
      const del = kvar;
      let arr;
      try {
        const res = await fetchFn(`${GRAPH}/`, {
          method: 'POST',
          body: new URLSearchParams({ access_token: tok, batch: JSON.stringify(del.map((i) => ({ method: 'GET', relative_url: `${V}/${relativa[i]}` }))) }),
          signal: AbortSignal.timeout(120_000),
        });
        arr = await res.json().catch(() => null);
        if (!Array.isArray(arr)) {
          const f = arr?.error;
          if (arOmforsok(f, res.status) && forsok < backoff.length) {
            logg(`  ⏳ Meta batch ${f?.code ?? res.status}: ${f?.message ?? ''} — väntar ${backoff[forsok] / 1000}s`);
            await sov(backoff[forsok]);
            continue;
          }
          throw new Error(`Meta batch: (${f?.code ?? res.status}) ${f?.message ?? 'oväntat svar'}`);
        }
      } catch (e) {
        if (e.message.startsWith('Meta batch:')) throw e;
        if (forsok >= backoff.length) throw new Error(`Meta batch: ${e.message}`);
        logg(`  ⏳ Meta batch svarade inte (${e.message}) — väntar ${backoff[forsok] / 1000}s`);
        await sov(backoff[forsok]);
        continue;
      }
      const omigen = [];
      arr.forEach((s, j) => {
        const i = del[j];
        let body = null;
        try { body = s?.body ? JSON.parse(s.body) : null; } catch { body = null; }
        if (s && s.code === 200 && body && !body.error) { svar[i] = { ok: true, body }; return; }
        const f = body?.error ?? { code: s?.code, message: s ? `HTTP ${s.code}` : 'inget svar i batchen' };
        // Ett null-svar i batchen betyder att Meta inte hann — det prövas igen.
        if ((s === null || arOmforsok(f, s?.code ?? 500)) && forsok < backoff.length) omigen.push(i);
        else svar[i] = { ok: false, fel: `(${f.code ?? '?'}) ${f.message ?? ''}`.trim() };
      });
      kvar = omigen;
      if (kvar.length) {
        logg(`  ⏳ ${kvar.length} av ${del.length} i batchen fick tak/fel — väntar ${backoff[forsok] / 1000}s och tar om dem`);
        await sov(backoff[forsok]);
      }
    }
    return svar;
  }

  return { get, allaSidor, batch, token };
}

/** Landningslänken ur en creative, oavsett format. Ren. */
export function lankUrCreative(c) {
  const s = c?.object_story_spec ?? {};
  return s.link_data?.link
    ?? s.video_data?.call_to_action?.value?.link
    ?? s.template_data?.link
    ?? c?.asset_feed_spec?.link_urls?.[0]?.website_url
    ?? c?.link_url
    ?? null;
}

const ANNONSFALT = 'id,name,effective_status,campaign{id,name},adset{id,name},creative{effective_object_story_id,effective_instagram_media_id,link_url,object_story_spec{link_data{link},video_data{call_to_action{value{link}}},template_data{link}},asset_feed_spec{link_urls{website_url}}}';

/**
 * Annonserna att läsa kommentarer på, för ett konto: ACTIVE + spend i fönstret.
 * @returns {Promise<Array<{id,name,status,kampanj,kampanjId,adset,post,ig,lank,spend}>>}
 */
export async function hamtaAnnonser(klient, kontoId, { dagar = 3, idag }) {
  const act = `act_${String(kontoId).replace(/^act_/, '')}`;
  const aktiva = await klient.allaSidor(`${act}/ads?fields=${ANNONSFALT}&filtering=${encodeURIComponent(JSON.stringify([{ field: 'effective_status', operator: 'IN', value: ['ACTIVE'] }]))}&limit=100`);
  const perId = new Map(aktiva.map((a) => [a.id, a]));

  // Spend i fönstret: en annons som pausades i går får kommentarer i dag.
  const sedan = new Date(Date.parse(`${idag}T00:00:00Z`) - dagar * 86_400_000).toISOString().slice(0, 10);
  const spendRader = await klient.allaSidor(`${act}/insights?level=ad&fields=ad_id,spend&time_range=${encodeURIComponent(JSON.stringify({ since: sedan, until: idag }))}&filtering=${encodeURIComponent(JSON.stringify([{ field: 'spend', operator: 'GREATER_THAN', value: 0 }]))}&limit=500`);
  const spend = new Map(spendRader.map((r) => [r.ad_id, Number(r.spend) || 0]));
  const saknas = [...spend.keys()].filter((id) => !perId.has(id));
  for (let i = 0; i < saknas.length; i += 50) {
    const del = saknas.slice(i, i + 50);
    const rader = await klient.allaSidor(`${act}/ads?fields=${ANNONSFALT}&filtering=${encodeURIComponent(JSON.stringify([{ field: 'id', operator: 'IN', value: del }]))}&limit=100`);
    for (const a of rader) perId.set(a.id, a);
  }
  return [...perId.values()].map((a) => ({
    id: a.id,
    name: a.name ?? '',
    status: a.effective_status ?? null,
    kampanj: a.campaign?.name ?? '',
    kampanjId: a.campaign?.id ?? null,
    adset: a.adset?.name ?? '',
    post: a.creative?.effective_object_story_id ?? null,
    ig: a.creative?.effective_instagram_media_id ?? null,
    lank: lankUrCreative(a.creative),
    spend: spend.get(a.id) ?? 0,
  }));
}

export const KOMMENTARFALT = 'id,message,message_tags,created_time,like_count,comment_count,parent{id},permalink_url,is_hidden,attachment{type}';
const MAX_SIDOR_PER_INLAGG = 20;

/** Följ paging.next, med tak. Ett fel lämnar det som hunnit läsas + felet — det stoppar aldrig resten. */
async function foljSidor(klient, forsta) {
  const rader = [...(forsta.data ?? [])];
  let nasta = forsta.paging?.next ?? null;
  for (let n = 0; nasta && n < MAX_SIDOR_PER_INLAGG; n++) {
    try {
      const j = await klient.get(nasta);
      rader.push(...(j.data ?? []));
      nasta = j.paging?.next ?? null;
    } catch (e) {
      return { rader, fel: `bläddring avbruten: ${e.meta?.message ?? e.message}` };
    }
  }
  return { rader, fel: nasta ? `fler än ${MAX_SIDOR_PER_INLAGG} sidor — resten oläst` : null };
}

/**
 * Kommentarerna på en mängd Facebook-inlägg, sida för sida, sedan `sedanUnix`.
 * `sidor[].permanent` = sidan saknar sidtoken (ändras inte av en omkörning);
 * `sidor[].olasta` > 0 = enskilda inlägg föll (tillfälligt — fönstret ska inte flyttas).
 * @param {Map<string, object>} inlagg post-id → valfri metadata
 */
export async function hamtaKommentarer(klient, inlagg, { sedanUnix, logg = (s) => console.error(s), extraKlienter = [] }) {
  const perSida = new Map();
  for (const post of inlagg.keys()) {
    const sida = post.split('_')[0];
    if (!perSida.has(sida)) perSida.set(sida, []);
    perSida.get(sida).push(post);
  }
  const kommentarer = [];
  const perId = new Map();
  const sidor = [];
  for (const [sidaId, poster] of perSida) {
    // Sidtoken: först med META_ACCESS_TOKEN, sedan med varje extra nyckel
    // (Matstrumpors sida ligger i en annan Business Manager — META_ACCESS_TOKEN_MATSTRUMPOR).
    let sida = null;
    let forstaFel = null;
    for (const k of [klient, ...extraKlienter]) {
      try {
        const s = await k.get(`${sidaId}?fields=access_token,name`);
        if (s.access_token) { sida = s; break; }
        forstaFel ??= 'ingen sidtoken (kontot saknar sidrollen)';
      } catch (e) {
        forstaFel ??= String(e.meta?.message ?? e.message).split(' Refer to ')[0];
      }
    }
    if (!sida) {
      sidor.push({ id: sidaId, namn: null, inlagg: poster.length, kommentarer: null, permanent: true, fel: `ingen sidtoken: ${forstaFel}` });
      continue;
    }
    const sidklient = skapaKlient({ token: sida.access_token, logg });
    let antal = 0;
    const felPoster = [];
    for (let i = 0; i < poster.length; i += 50) {
      const del = poster.slice(i, i + 50);
      const svar = await klient.batch(del.map((p) => `${p}/comments?fields=${KOMMENTARFALT}&filter=stream&since=${sedanUnix}&limit=100`), sida.access_token);
      for (let j = 0; j < del.length; j++) {
        const s = svar[j];
        if (!s?.ok) { felPoster.push({ post: del[j], fel: s?.fel ?? 'okänt' }); continue; }
        const { rader, fel } = await foljSidor(sidklient, s.body);
        if (fel) felPoster.push({ post: del[j], fel });
        for (const k of rader) {
          if (Date.parse(k.created_time) / 1000 < sedanUnix) continue;
          // Flera annonsinlägg kan dela EN kommentarstråd (mätt 2026-09-24: 34 av
          // 217 kommentarer kom tillbaka på två inlägg). Kommentaren räknas en gång;
          // inlägget som äger den (första ledet i kommentarens id) blir `post`.
          const finns = perId.get(k.id);
          if (finns) { if (!finns.poster.includes(del[j])) finns.poster.push(del[j]); continue; }
          const rad = { ...k, kanal: 'facebook', post: del[j], poster: [del[j]], sida: sidaId, sidnamn: sida.name ?? null };
          perId.set(k.id, rad);
          kommentarer.push(rad);
          antal += 1;
        }
      }
    }
    if (felPoster.length) logg(`  ⚠️ ${sida.name}: ${felPoster.length} inlägg gick inte att läsa helt (${felPoster[0].fel})`);
    sidor.push({ id: sidaId, namn: sida.name ?? null, inlagg: poster.length, kommentarer: antal, olasta: felPoster.length, fel: felPoster.length ? `${felPoster.length} inlägg: ${felPoster[0].fel}` : undefined });
  }
  for (const k of kommentarer) {
    const agare = `${k.sida}_${String(k.id).split('_')[0]}`;
    if (k.poster.includes(agare)) k.post = agare;
  }
  return { kommentarer, sidor };
}

/**
 * Instagram-kommentarerna på annonsernas IG-media (effective_instagram_media_id).
 * Mätt 2026-09-24: läsbara med META_ACCESS_TOKEN via batch, 15 kommentarer
 * totalt på 557 media i SE — liten volym, men en arg kund på Instagram är lika arg.
 * IG:s /comments har inget since= — fönstret filtreras här. `username` begärs aldrig.
 * Raderna normaliseras till Facebooks form (message, created_time, comment_count).
 * @param {Map<string, {post, sida}>} media IG-media-id → FB-inlägget (för verksamheten)
 */
export async function hamtaIgKommentarer(klient, media, { sedanUnix, logg = (s) => console.error(s) }) {
  const ids = [...media.keys()];
  const kommentarer = [];
  const perId = new Map();
  let olasta = 0;
  let forstaFel = null;
  for (let i = 0; i < ids.length; i += 50) {
    const del = ids.slice(i, i + 50);
    const svar = await klient.batch(del.map((m) => `${m}?fields=permalink,comments.limit(50){id,text,timestamp,like_count,replies{id}}`), klient.token);
    for (let j = 0; j < del.length; j++) {
      const s = svar[j];
      if (!s?.ok) { olasta += 1; forstaFel ??= s?.fel ?? 'okänt'; continue; }
      const { rader, fel } = await foljSidor(klient, s.body.comments ?? {});
      if (fel) { olasta += 1; forstaFel ??= fel; }
      const bas = media.get(del[j]);
      for (const k of rader) {
        if (Date.parse(k.timestamp) / 1000 < sedanUnix) continue;
        const id = `ig_${k.id}`;
        if (perId.has(id)) continue;
        const rad = {
          id, message: k.text ?? '', message_tags: [], created_time: k.timestamp, like_count: k.like_count ?? 0,
          comment_count: k.replies?.data?.length ?? 0, permalink_url: s.body.permalink ?? null,
          kanal: 'instagram', ig: del[j], post: bas?.post ?? null, poster: bas?.post ? [bas.post] : [], igMedia: del[j], sida: bas?.sida ?? null,
        };
        perId.set(id, rad);
        kommentarer.push(rad);
      }
    }
  }
  if (olasta) logg(`  ⚠️ Instagram: ${olasta} media gick inte att läsa (${forstaFel})`);
  return { kommentarer, status: { id: 'instagram', namn: 'Instagram', inlagg: ids.length, kommentarer: kommentarer.length, olasta, fel: olasta ? `${olasta} media: ${forstaFel}` : undefined } };
}
