// Hämtar ALLT från Notion via API:t: alla hubbar, alla sidor, alla kommentarer.
//
// Detta är det som kräver NOTION_TOKEN. Utan token går det bara att hämta en
// sida i taget för hand — med token tar hela workspacet ett par minuter.
//
// Notions API har en takt på ca 3 anrop/sekund. Koden stryper sig själv och
// backar av på 429 i stället för att bli utslängd.

const API = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';

let lastCall = 0;
async function throttled(url, token, init = {}) {
  const gap = 350; // ~3 anrop/s
  const wait = Math.max(0, lastCall + gap - Date.now());
  if (wait) await new Promise(r => setTimeout(r, wait));
  lastCall = Date.now();

  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        'notion-version': VERSION,
        'content-type': 'application/json',
        ...(init.headers || {}),
      },
    });
    if (res.status === 429) {
      const retry = Number(res.headers.get('retry-after') || 2);
      await new Promise(r => setTimeout(r, retry * 1000 * (attempt + 1)));
      continue;
    }
    const json = await res.json();
    if (!res.ok) throw new Error(`Notion ${res.status}: ${json.message || JSON.stringify(json)}`);
    return json;
  }
  throw new Error('Notion svarar 429 även efter fem försök — sänk takten.');
}

/** Alla sidor i en databas. */
export async function fetchDatabaseRows(databaseId, token) {
  const out = [];
  let cursor;
  do {
    const body = { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) };
    const res = await throttled(`${API}/databases/${databaseId}/query`, token, {
      method: 'POST', body: JSON.stringify(body),
    });
    out.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return out;
}

/** Alla kommentarer på en sida. */
export async function fetchComments(pageId, token) {
  const out = [];
  let cursor;
  do {
    const qs = new URLSearchParams({ block_id: pageId, page_size: '100' });
    if (cursor) qs.set('start_cursor', cursor);
    const res = await throttled(`${API}/comments?${qs}`, token);
    out.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return out;
}

/** Slår upp riktiga namn på användare — det MCP-kopplingen inte klarar för gäster. */
export async function fetchUsers(token) {
  const out = [];
  let cursor;
  do {
    const qs = new URLSearchParams({ page_size: '100' });
    if (cursor) qs.set('start_cursor', cursor);
    const res = await throttled(`${API}/users?${qs}`, token);
    out.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return out.filter(u => u.type === 'person').map(u => ({
    id: u.id, name: u.name, email: u.person?.email || null,
  }));
}

function plain(rich) {
  return (rich || []).map(r => r.plain_text).join('');
}

/**
 * Hämtar allt för en lista hubbar och returnerar rader + kommentarer i exakt
 * det format som `ingest notion-rows` och `ingest notion-comments` läser.
 */
export async function fetchEverything({ token, workspaces, onProgress = () => {} }) {
  const bundles = [];

  for (const ws of workspaces) {
    for (const hub of ws.hubs || []) {
      onProgress(`Hämtar ${ws.name} / ${hub.name} …`);
      const pages = await fetchDatabaseRows(hub.databaseId, token);

      const rows = pages.map(p => {
        const props = p.properties || {};
        const get = name => props[name];
        return {
          url: p.url,
          Namn: plain(get('Namn')?.title),
          Status: get('Status')?.status?.name ?? null,
          Typ: get('Typ')?.select?.name ?? null,
          Prioritet: get('Prioritet')?.select?.name ?? null,
          Ansvarig: (get('Ansvarig')?.people || []).map(u => u.id),
          createdTime: p.created_time,
          godkand: get('Godkänd datum')?.date?.start ?? null,
        };
      });

      onProgress(`  ${rows.length} rader · hämtar kommentarer …`);
      const comments = [];
      let withComments = 0;
      for (const [i, p] of pages.entries()) {
        const cs = await fetchComments(p.id, token);
        if (cs.length) withComments++;
        for (const c of cs) {
          comments.push({
            page: p.id.replace(/-/g, ''),
            task: plain(p.properties?.Namn?.title),
            author: c.created_by?.id,
            datetime: c.created_time,
            text: plain(c.rich_text),
          });
        }
        if ((i + 1) % 25 === 0) onProgress(`  ${i + 1}/${pages.length} sidor …`);
      }

      onProgress(`  ${comments.length} kommentarer på ${withComments} av ${pages.length} sidor.`);
      bundles.push({
        workspace: ws.id, hub: hub.name, databaseId: hub.databaseId,
        rows, comments,
        checkedPages: pages.map(p => p.id.replace(/-/g, '')),
      });
    }
  }

  return bundles;
}
