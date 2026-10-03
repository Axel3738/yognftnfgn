// notion.mjs — strategrapportens Notion-I/O. Läser Growth Guide (Ad Roadmap) och
// hubben som kompakta rader med created_by/last_edited_by (det enda spåret av
// VEM som skrev något — Notion har ingen ändringshistorik via API:t, mätt
// 2026-10-03), skriver EN Log-rad per vecka och EN kommentar med @-omnämnande.
//
// Skriver aldrig i Ad Roadmap, Ad Results eller hubben. Raderar aldrig.

const NOTION = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';
const sov = (ms) => new Promise((k) => setTimeout(k, ms));

export async function notion(path, { method = 'GET', body, env = process.env } = {}) {
  const tok = env.NOTION_TOKEN;
  if (!tok) throw new Error('NOTION_TOKEN saknas i miljön');
  // Ett POST som SKAPAR (sida, kommentar) görs aldrig om på 5xx: ett 502 från
  // proxyn efter en lyckad skrivning hade gett en dubbel rad eller dubbel ping.
  // Omkörningen är ändå säker: Log-raden återanvänds på titeln, kommentaren
  // hoppas när den redan finns (harKommentar).
  const skapar = method === 'POST' && (path === '/pages' || path === '/comments');
  for (let forsok = 0; forsok < 6; forsok++) {
    const r = await fetch(`${NOTION}${path}`, { method, headers: { Authorization: `Bearer ${tok}`, 'Notion-Version': VERSION, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 429 || (r.status >= 500 && !skapar)) { await sov(1500 * (forsok + 1)); continue; }
    const j = await r.json();
    if (!r.ok) throw new Error(`Notion ${r.status} ${method} ${path}: ${j.message || JSON.stringify(j).slice(0, 300)}`);
    return j;
  }
  throw new Error(`Notion svarade inte på sex försök: ${path}`);
}

export const plain = (p) => (p?.rich_text ?? p?.title ?? []).map((t) => t.plain_text ?? t.text?.content ?? '').join('');
const sel = (p) => p?.select?.name ?? p?.status?.name ?? null;
const nummer = (p) => (p?.number == null ? null : Number(p.number));
const datum = (p) => p?.date?.start ?? null;
const url = (p) => p?.url ?? null;

export async function fraga(dbId, { env } = {}) {
  const ut = [];
  let cursor;
  do {
    const q = await notion(`/databases/${dbId}/query`, { method: 'POST', body: { page_size: 100, start_cursor: cursor }, env });
    ut.push(...(q.results ?? []));
    cursor = q.has_more ? q.next_cursor : undefined;
  } while (cursor);
  return ut;
}

/** En Notion-sida ur Ad Roadmap → kompakt rad. Ren (sida in). */
export function roadmapRad(p) {
  const pr = p.properties ?? {};
  return {
    id: p.id,
    url: p.url ?? null,
    titel: plain(pr['AD CONCEPT']),
    status: sel(pr.STATUS),
    results: sel(pr.RESULTS),
    learnings: plain(pr.LEARNINGS),
    memo: plain(pr['BREAKTHROUGH MEMO']),
    desire: plain(pr['DESIRE/CORE AVATAR']),
    subavatar: plain(pr['SUB AVATAR']),
    angles: plain(pr['ANGLE(S)']),
    awareness: sel(pr['AWARENESS LEVEL']),
    adType: sel(pr['AD TYPE']),
    fileType: sel(pr['FILE TYPE']),
    linkBrief: url(pr['LINK TO BRIEF']),
    linkAd: url(pr['LINK TO AD']),
    batchnr: plain(pr['BATCH #']),
    dateAdded: datum(pr['DATE ADDED']),
    author: plain(pr.AUTHOR),
    spend: nummer(pr['SPEND 14D KR']),
    kop: nummer(pr['PURCHASES 14D']),
    hook: nummer(pr['HOOK RATE']),
    hold: nummer(pr['HOLD RATE']),
    upvote: nummer(pr.UPVOTE),
    system: plain(pr.SYSTEM),
    created_by: p.created_by?.id ?? null,
    created_time: p.created_time ?? null,
    last_edited_by: p.last_edited_by?.id ?? null,
    last_edited_time: p.last_edited_time ?? null,
  };
}

/** En hubbsida → kompakt rad: Ansvarig som id:n OCH namn. Ren (sida in). */
export function hubbRad(p) {
  const pr = p.properties ?? {};
  const titel = Object.values(pr).find((x) => x.type === 'title');
  const folk = pr.Ansvarig?.people ?? [];
  return {
    id: p.id,
    url: p.url ?? null,
    namn: plain(titel),
    status: sel(pr.Status),
    typ: sel(pr.Typ),
    ansvariga: folk.map((x) => x.id).filter(Boolean),
    ansvariga_namn: folk.map((x) => x.name).filter(Boolean),
    created_by: p.created_by?.id ?? null,
    created_time: p.created_time ?? null,
    last_edited_by: p.last_edited_by?.id ?? null,
    last_edited_time: p.last_edited_time ?? null,
  };
}

export async function lasRoadmap(dbId, { env } = {}) {
  return (await fraga(dbId, { env })).map(roadmapRad).filter((r) => r.titel);
}

export async function lasHub(hubId, { env } = {}) {
  return (await fraga(hubId, { env })).map(hubbRad).filter((r) => r.namn);
}

/** Log-raden för veckan: finns titeln redan uppdateras SYSTEM, annars skapas raden. */
export async function skrivLoggrad(dbId, { titel, datum: dag, system }, { env } = {}) {
  const bef = (await fraga(dbId, { env })).find((p) => plain(p.properties?.DAY) === titel);
  const props = { DATE: { date: dag ? { start: String(dag).slice(0, 10) } : null }, SYSTEM: richText(system) };
  if (bef) {
    await notion(`/pages/${bef.id}`, { method: 'PATCH', body: { properties: props }, env });
    return { id: bef.id, url: bef.url, skapad: false };
  }
  const p = await notion('/pages', { method: 'POST', body: { parent: { database_id: dbId }, properties: { DAY: { title: [{ text: { content: titel.slice(0, 200) } }] }, ...props } }, env });
  return { id: p.id, url: p.url, skapad: true };
}

/** NOTES på en Log-rad (människans svar): { ok: true, text } ('' = inget
 *  skrivet) eller { ok: false, fel } när sidan inte gick att läsa — de två
 *  får aldrig blandas ihop i feedbacken. */
export async function lasNotes(pageId, { env } = {}) {
  try {
    const p = await notion(`/pages/${pageId}`, { env });
    if (p.archived || p.in_trash) return { ok: false, fel: 'raden ligger i papperskorgen' };
    return { ok: true, text: plain(p.properties?.NOTES) };
  } catch (e) { return { ok: false, fel: e.message }; }
}

/** Finns redan en kommentar av `av` (integrationens id) på sidan som börjar
 *  med `borjar`? Returnerar kommentarens id eller null. Läs-bart. */
export async function harKommentar(pageId, { av, borjar }, { env } = {}) {
  const r = await notion(`/comments?block_id=${pageId}&page_size=100`, { env });
  const start = String(borjar ?? '').trim();
  for (const k of r.results ?? []) {
    const text = (k.rich_text ?? []).map((t) => t.plain_text ?? '').join('').trim();
    if ((!av || k.created_by?.id === av) && start && text.includes(start)) return k.id;
  }
  return null;
}

/** rich_text i bitar om högst 1 900 tecken (Notions tak är 2 000 per bit). Ren. */
export function richText(s) {
  const str = s == null ? '' : String(s);
  const delar = [];
  for (let i = 0; i < str.length; i += 1900) delar.push({ type: 'text', text: { content: str.slice(i, i + 1900) } });
  return { rich_text: delar };
}

/** Kommentarens rich_text: @-omnämnanden + text, texten delad i bitar. Ren. */
export function kommentarInnehall(delar) {
  const ut = [];
  for (const d of delar) {
    if (d.mention) ut.push({ type: 'mention', mention: { user: { id: d.mention } } });
    else if (d.text != null) ut.push(...richText(d.text).rich_text);
  }
  return ut;
}

/** En kommentar på en sida (mätt 2026-10-03: mention + text ⇒ 200, Notion resolvar namnet). */
export async function kommentera(pageId, delar, { env } = {}) {
  const r = await notion('/comments', { method: 'POST', body: { parent: { page_id: pageId }, rich_text: kommentarInnehall(delar) }, env });
  return { id: r.id, discussion_id: r.discussion_id ?? null };
}
