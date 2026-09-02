#!/usr/bin/env node
// notion-aterkoppling.mjs — skriver feedback på en Notion-rad, och flyttar den
// vid behov tillbaka till "Draft". Används av /notionkorning när en creative
// stoppas i brief-kontrollen.
//
//   node tools/notion-aterkoppling.mjs <page-id> --kommentar "Priset 799 kr, sidan säger 599 kr"
//   node tools/notion-aterkoppling.mjs <page-id> --kommentar "..." --status Draft
//   node tools/notion-aterkoppling.mjs <page-id> --kommentar "..." --status Draft --torr
//
// Axels regler 2026-09-02:
//   • Bildannons med problem  → kommentar + status "Draft" (20:00-rutinen gör om den).
//   • Videoannons med problem → bara kommentar. Statusen rörs inte; redigeraren
//     och managern hanterar revisionen.
//
// Kommentaren skrivs alltid FÖRE statusbytet, så att raden aldrig hamnar i Draft
// utan förklaring om något går fel halvvägs. --torr visar bara vad som skulle göras.
//
// Kräver env NOTION_TOKEN (integration inbjuden till hubben, med rätt att
// skriva kommentarer och uppdatera innehåll).

const API = 'https://api.notion.com/v1';
const args = process.argv.slice(2);
const flagga = (n, s = null) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s;
};
const finns = (n) => args.includes(`--${n}`);
const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

const pageId = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const kommentar = flagga('kommentar');
const nyStatus = flagga('status');
const torr = finns('torr');

if (!pageId) dö('Ange <page-id>. Exempel: node tools/notion-aterkoppling.mjs 3cc270ab908c817b97c2f74bc93ceaf7 --kommentar "..." --status Draft');
if (!kommentar) dö('--kommentar är obligatorisk. En rad som flyttas utan förklaring är ett mysterium för redigeraren.');

const token = process.env.NOTION_TOKEN;
if (!token) dö('NOTION_TOKEN saknas i miljön.');

async function notion(sökväg, { method = 'GET', body = null } = {}) {
  const res = await fetch(`${API}/${sökväg}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'notion-version': '2022-06-28',
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Notion ${res.status}: ${json.message || res.statusText}`);
  return json;
}

const id = pageId.replace(/-/g, '');
const sida = await notion(`pages/${id}`);
const poster = Object.entries(sida.properties ?? {});
const titel = poster.find(([, v]) => v.type === 'title')?.[1]?.title?.map(t => t.plain_text).join('') ?? id;

// Samma fältuppslag som notion-kalla.mjs: "Status" av typ status eller select.
const [statusNamn, statusProp] =
  poster.find(([n, v]) => n === 'Status' && (v.type === 'status' || v.type === 'select'))
  ?? poster.find(([, v]) => v.type === 'status')
  ?? [null, null];
const nuStatus = statusProp?.[statusProp.type]?.name ?? '';

console.log(`Rad: ${titel}`);
console.log(`Status nu: ${nuStatus || '(tomt)'}`);
console.log(`Kommentar: ${kommentar}`);
if (nyStatus) console.log(`Statusbyte: ${nuStatus || '(tomt)'} → ${nyStatus}`);

if (torr) { console.log('\n--torr: inget skrivet.'); process.exit(0); }

// 1. Kommentaren först.
await notion('comments', {
  method: 'POST',
  body: { parent: { page_id: sida.id }, rich_text: [{ text: { content: kommentar.slice(0, 2000) } }] },
});
console.log('✓ Kommentar skriven.');

// 2. Statusbytet, om begärt.
if (nyStatus) {
  if (!statusNamn) dö(`Raden har inget Status-fält — kommentaren är skriven men statusen kunde inte ändras.`);
  const värde = statusProp.type === 'status' ? { status: { name: nyStatus } } : { select: { name: nyStatus } };
  await notion(`pages/${id}`, { method: 'PATCH', body: { properties: { [statusNamn]: värde } } });
  // Läs tillbaka — ett PATCH som svarar 200 men inte bytte status har hänt förr.
  const efter = await notion(`pages/${id}`);
  const blev = efter.properties?.[statusNamn]?.[statusProp.type]?.name ?? '';
  if (blev !== nyStatus) dö(`Statusen blev "${blev}", inte "${nyStatus}". Kontrollera att alternativet finns i hubben.`);
  console.log(`✓ Status: ${nuStatus || '(tomt)'} → ${blev}`);
}
