// Hämtar en Notion-sidas kropp som markdown, med tabellernas rader (barn till table-blocket).
const T = process.env.NOTION_TOKEN;
const H = { Authorization: `Bearer ${T}`, 'Notion-Version': '2022-06-28' };
const txt = (a) => (a || []).map((x) => x.plain_text).join('');
async function barn(id) {
  const ut = []; let cursor;
  do {
    const u = new URL(`https://api.notion.com/v1/blocks/${id}/children`);
    u.searchParams.set('page_size', '100');
    if (cursor) u.searchParams.set('start_cursor', cursor);
    const r = await fetch(u, { headers: H });
    const j = await r.json();
    ut.push(...(j.results || [])); cursor = j.has_more ? j.next_cursor : null;
    await new Promise((s) => setTimeout(s, 350));
  } while (cursor);
  return ut;
}
async function skriv(blocks, niva = 0) {
  const rader = [];
  for (const b of blocks) {
    const t = b.type, o = b[t] || {};
    if (t === 'table') {
      const rows = await barn(b.id);
      for (const rr of rows) rader.push('| ' + (rr.table_row?.cells || []).map((c) => txt(c)).join(' | ') + ' |');
      rader.push('');
      continue;
    }
    if (o.rich_text) {
      const p = t === 'heading_1' ? '# ' : t === 'heading_2' ? '## ' : t === 'heading_3' ? '### '
        : t === 'bulleted_list_item' ? '- ' : t === 'numbered_list_item' ? '1. ' : '';
      rader.push('  '.repeat(niva) + p + (t === 'code' ? '```\n' : '') + txt(o.rich_text) + (t === 'code' ? '\n```' : ''));
    }
    if (b.has_children && t !== 'table') rader.push(...(await skriv(await barn(b.id), niva + 1)));
  }
  return rader;
}
const id = process.argv[2];
console.log((await skriv(await barn(id))).join('\n'));
