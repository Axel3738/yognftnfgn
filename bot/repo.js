// Hämtar verksamhetens filer ur GitHub-repot. Boten läser ALDRIG containerns
// filsystem: Railway bygger bara bot/-mappen, och även om den byggde hela
// repot skulle filerna frysas vid deploy. GitHub Contents API ger alltid det
// som faktiskt ligger på grenen just nu.
//
// Verifierat under research: artefakt-dashboarden går INTE att hämta
// server-side (returnerar ett tomt JS-skal), så den är ingen datakälla.

const ÄGARE = 'Axel3738';
const REPO = 'yognftnfgn';
const GREN = process.env.GITHUB_GREN || 'claude/daily-agent-discussion-uos5df';

// Hur länge en hämtad fil får återanvändas innan vi frågar GitHub igen.
const TTL_MS = 60_000;

// Filer boten aldrig får läsa, hur den än blir tillsagd. Repot ska inte
// innehålla hemligheter — det här är bältet till hängslet.
const FÖRBJUDET = [/\.env/i, /secret/i, /credential/i, /\.pem$/i, /\.key$/i, /discord-bot\.json$/i];

const cache = new Map(); // sökväg -> { etag, text, hämtad }

/**
 * Riktiga GitHub-tokens börjar med github_pat_ (fine-grained) eller ghp_/gho_
 * (klassiska). Skickar man något annat som Bearer får man 401 — ett svar som
 * ser ut som "fel behörighet" fast det egentligen är "det där är ingen token".
 * Den fällan kostade en felsökning under bygget; nu säger felet vad som är fel.
 */
export function serUtSomToken(v) {
  return typeof v === 'string' && /^(github_pat_|ghp_|gho_|ghu_|ghs_)[A-Za-z0-9_]{20,}$/.test(v.trim());
}

function huvuden(etag) {
  const h = {
    Accept: 'application/vnd.github.raw',
    'X-GitHub-Api-Version': '2022-11-28',
    // Utan User-Agent svarar GitHub 403. Node:s fetch sätter ingen.
    'User-Agent': 'bavern-discord-bot',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    if (!serUtSomToken(token)) {
      throw new Error(
        'GITHUB_TOKEN ser inte ut som en GitHub-token (ska börja med github_pat_ eller ghp_). '
        + 'Skapa en fine-grained token med Contents: Read-only på repot och lägg den i Railway.',
      );
    }
    h.Authorization = `Bearer ${token}`;
  }
  if (etag) h['If-None-Match'] = etag;
  return h;
}

export function ärFörbjuden(sökväg) {
  return FÖRBJUDET.some((r) => r.test(sökväg));
}

/**
 * 403 från GitHub betyder två helt olika saker och felmeddelandet måste skilja
 * dem åt: slut på rate limit (utan token: 60 anrop/timme och boten läser fler
 * än så på en dag) eller saknad behörighet. Under bygget gick en felsökning åt
 * att tro att "403" var behörighet när det var rate limit.
 */
export function felorsak(svar) {
  const kvar = svar.headers?.get?.('x-ratelimit-remaining');
  if (kvar === '0') {
    const reset = Number(svar.headers.get('x-ratelimit-reset') || 0) * 1000;
    const min = reset ? Math.max(1, Math.ceil((reset - Date.now()) / 60000)) : null;
    return process.env.GITHUB_TOKEN
      ? `Rate limit slut${min ? `, öppnar om ~${min} min` : ''}.`
      : `Rate limit slut${min ? `, öppnar om ~${min} min` : ''}. Utan GITHUB_TOKEN `
        + 'får boten bara 60 anrop/timme — lägg in en token i Railway.';
  }
  return process.env.GITHUB_TOKEN
    ? 'GITHUB_TOKEN kan vara utgången eller sakna Contents:Read på repot.'
    : 'Repot kan vara privat och GITHUB_TOKEN saknas i Railway.';
}

/**
 * Hämtar en fil. Använder ETag: oförändrad fil ger 304, kostar ingen
 * rate limit och återanvänder texten vi redan har.
 * Returnerar null om filen inte finns — aldrig ett kastat fel för 404,
 * eftersom Claude ska kunna gissa på en sökväg utan att boten dör.
 */
export async function lasFil(sökväg) {
  const ren = String(sökväg || '').replace(/^\/+/, '').trim();
  if (!ren) throw new Error('Tom sökväg.');
  if (ren.includes('..')) throw new Error('Sökvägar med .. är inte tillåtna.');
  if (ärFörbjuden(ren)) throw new Error(`Filen ${ren} är skyddad och läses aldrig.`);

  const träff = cache.get(ren);
  if (träff && Date.now() - träff.hämtad < TTL_MS) return träff.text;

  const url = `https://api.github.com/repos/${ÄGARE}/${REPO}/contents/${encodeURI(ren)}?ref=${encodeURIComponent(GREN)}`;
  let svar;
  try {
    svar = await fetch(url, { headers: huvuden(träff?.etag) });
  } catch (nätfel) {
    // Nätverket hickar. Har vi filen sedan tidigare är den nästan säkert
    // fortfarande sann — bättre än att svara "det sket sig".
    if (träff) {
      console.warn(`[repo] nätfel för ${ren}, använder cachad kopia: ${nätfel.message}`);
      return träff.text;
    }
    throw nätfel;
  }

  if (svar.status === 304 && träff) {
    träff.hämtad = Date.now();
    return träff.text;
  }
  if (svar.status === 404) return null;
  if (svar.status === 401 || svar.status === 403 || svar.status >= 500) {
    if (träff) {
      console.warn(`[repo] ${svar.status} för ${ren}, använder cachad kopia. ${felorsak(svar)}`);
      return träff.text;
    }
    // Tyst gammal data är värre än ett tydligt fel — säg vad som är trasigt.
    throw new Error(`GitHub nekade läsning av ${ren} (${svar.status}). ${felorsak(svar)}`);
  }
  if (!svar.ok) throw new Error(`GitHub svarade ${svar.status} för ${ren}.`);

  const text = await svar.text();
  cache.set(ren, { etag: svar.headers.get('etag'), text, hämtad: Date.now() });
  return text;
}

/**
 * Budgetloggen är 69+ rader och växer varje dag. Bara SENASTE beslutet per
 * kampanj är intressant för en fråga som "hur går det" — det kapar kontexten
 * ~85 % utan att tappa något som fortfarande gäller.
 */
export function komprimeraLogg(jsonl, maxPerKampanj = 1) {
  const perKampanj = new Map();
  for (const rad of String(jsonl || '').split('\n')) {
    if (!rad.trim()) continue;
    let r;
    try { r = JSON.parse(rad); } catch { continue; }
    const nyckel = r.kampanj_id || r.kampanj_namn || 'okänd';
    const lista = perKampanj.get(nyckel) || [];
    lista.push(r);
    perKampanj.set(nyckel, lista);
  }
  const ut = [];
  for (const [, rader] of perKampanj) {
    // Datumen blandar tre format i loggen — parsa alltid, sortera aldrig som sträng.
    rader.sort((a, b) => Date.parse(b.hamtad || b.datum || 0) - Date.parse(a.hamtad || a.datum || 0));
    ut.push(...rader.slice(0, maxPerKampanj));
  }
  return ut;
}

/**
 * tasks.json är 487 kB. Skickas den rå kapas den på 60 000 tecken — 12 % —
 * och boten svarade tvärsäkert "allt är motorhöljet" när fyra axelbälte-drafts
 * låg utanför snittet. Ett självsäkert fel är värre än inget svar.
 *
 * Godkända tasks är historik och intresserar ingen som frågar vad som ska
 * göras. Kvar blir 16 rader i stället för 105, och hela filen får plats.
 *
 * notionStatus är fältet som betyder något för Axel: Draft = ska göras,
 * "In progress 2" = underkänd och görs om (INTE "längre kommen").
 */
export function komprimeraTasks(rå) {
  const t = JSON.parse(rå);
  const alla = Array.isArray(t) ? t : (t.tasks || Object.values(t)[0] || []);
  const räkning = {};
  for (const x of alla) {
    const k = x.notionStatus || x.status || 'okänd';
    räkning[k] = (räkning[k] || 0) + 1;
  }
  const öppna = alla
    .filter((x) => x.status !== 'approved')
    .map((x) => ({
      id: x.id,
      titel: x.title,
      produkt: x.productId,
      notionStatus: x.notionStatus,
      redigerare: x.assignedEditorId,
      plandatum: x.plannedDate,
      deadline: x.dueDate,
      blockerad: x.blockerReason || undefined,
    }));
  return {
    _om: `${alla.length} tasks totalt, ${öppna.length} ej godkända. Godkända är `
      + 'bortsållade som historik. Draft = ska göras, "In progress 2" = revision.',
    antal_per_status: räkning,
    oppna: öppna,
  };
}

/**
 * Den fasta affärskontexten som läggs i systemprompten. Hämtas om var 30:e
 * minut, aldrig per meddelande — annars rasar prompt-cachen.
 */
export async function hamtaAffarskontext() {
  // CLAUDE.md är regelverket. Utan det är boten inte Bävern utan en generisk
  // chatt som gissar om annonskonton — därför får det felet bubbla upp.
  const [regler, produktkarta, logg, produkter] = await Promise.all([
    lasFil('CLAUDE.md'),
    lasFil('agent/produktkarta.json').catch(() => null),
    lasFil('agent/budgetlogg.jsonl').catch(() => null),
    lasFil('products/products.json').catch(() => null),
  ]);
  if (!regler) throw new Error(`CLAUDE.md hittades inte på grenen ${GREN}.`);

  const senaste = logg ? komprimeraLogg(logg) : [];
  const delar = [
    '# Verksamhetens regelverk (CLAUDE.md)\n',
    regler,
    '\n\n# Kampanjer och kalkyler (agent/produktkarta.json)\n```json\n',
    produktkarta || '(saknas)',
    '\n```\n\n# Senaste beslutet per kampanj (ur agent/budgetlogg.jsonl)\n```json\n',
    JSON.stringify(senaste, null, 1),
    '\n```\n',
  ];
  if (produkter) delar.push('\n# products/products.json\n```json\n', produkter, '\n```\n');

  return delar.join('');
}
