#!/usr/bin/env node
// notion-kalla.mjs — Notion som leveranskälla, vid sidan av Drive.
//
// Bakgrund: /bildannonser (20:00) genererar bildannonser med kie.ai och lämnar dem
// som BILAGA i Notion-radens "Filer och media" med status "To be Reviewed".
// bildannonser/output/ är gitignorerat och dör med containern — Notion-bilagan är
// darfor ENDA kopian i världen. Läses den inte här är arbetet borta.
//
// Anvands av tools/leveranskon.mjs. Kan även köras fristående:
//   node tools/notion-kalla.mjs                 lista klara Notion-rader
//   node tools/notion-kalla.mjs --hubbar        bara hubblistan
//   node tools/notion-kalla.mjs --json
//
// Kräver env NOTION_TOKEN (integration inbjuden till hubbarna).

const API = 'https://api.notion.com/v1';

/** Titeln pa en creative hub. Mallen raknas aldrig som en hub. */
export const ÄR_HUB = (titel) =>
  /creative hub\s*$/i.test((titel || '').trim()) && !/\bMALL\b/i.test(titel || '');

/** Statusar som betyder "redigeraren/rutinen ar klar, vantar pa upplaggning". */
export const KLAR_STATUS = ['to be reviewed'];

let sist = 0;
async function notion(sökväg, { method = 'GET', body = null } = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    const e = new Error('NOTION_TOKEN saknas i miljön.');
    e.saknarToken = true;
    throw e;
  }
  const vänta = 350 - (Date.now() - sist);        // Notion stryper till ~3/s
  if (vänta > 0) await new Promise(r => setTimeout(r, vänta));
  sist = Date.now();
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
  if (!res.ok) { const e = new Error(json.message || res.statusText); e.status = res.status; throw e; }
  return json;
}

const text = (rika = []) => rika.map(r => r.plain_text ?? '').join('');

function värde(prop) {
  if (!prop) return '';
  switch (prop.type) {
    case 'title':        return text(prop.title);
    case 'rich_text':    return text(prop.rich_text);
    case 'select':       return prop.select?.name ?? '';
    case 'status':       return prop.status?.name ?? '';
    case 'multi_select': return (prop.multi_select ?? []).map(o => o.name).join(', ');
    case 'people':       return (prop.people ?? []).map(p => p.name || p.id).join(', ');
    case 'date':         return prop.date?.start ?? '';
    case 'url':          return prop.url ?? '';
    default:             return '';
  }
}

/** Hubbarna delar mall: Namn (title), Status (status), Typ (select). */
function hittaFält(sida) {
  const poster = Object.entries(sida.properties ?? {});
  const titelFält = poster.find(([, v]) => v.type === 'title')?.[0] ?? null;
  const statusFält =
    poster.find(([n, v]) => n === 'Status' && (v.type === 'status' || v.type === 'select'))?.[0]
    ?? poster.find(([, v]) => v.type === 'status')?.[0] ?? null;
  const typFält =
    poster.find(([n, v]) => n === 'Typ' && (v.type === 'select' || v.type === 'multi_select'))?.[0]
    ?? poster.find(([n]) => /^(typ|type)$/i.test(n))?.[0] ?? null;
  return { statusFält, typFält, titelFält };
}

/** Alla creative hub-databaser integrationen ser. Ingen handskriven lista —
 *  nya produkter tillkommer standigt och ska komma med av sig sjalva. */
export async function hittaHubbar() {
  const ut = [];
  let cursor;
  do {
    const r = await notion('search', {
      method: 'POST',
      body: {
        query: 'creative hub',
        filter: { value: 'database', property: 'object' },
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      },
    });
    for (const d of r.results ?? []) {
      const titel = text(d.title ?? []);
      if (ÄR_HUB(titel)) ut.push({ id: d.id, titel, url: d.url });
    }
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return ut;
}

async function allaSidor(databaseId) {
  const ut = [];
  let cursor;
  do {
    const r = await notion(`databases/${databaseId}/query`, {
      method: 'POST',
      body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    ut.push(...(r.results ?? []));
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return ut;
}

/** Rader som ar klara att laddas upp: Typ "… Pending Approval" (INKLUDERING, aldrig
 *  uteslutning), status i KLAR_STATUS, OCH minst en fil i "Filer och media".
 *  Kravet pa fil ar avgorande — utan den finns ingen creative att ladda upp. */
export async function klaraRader(hub) {
  const sidor = await allaSidor(hub.id);
  const ut = [];
  for (const s of sidor) {
    const { statusFält, typFält, titelFält } = hittaFält(s);
    const namn = titelFält ? värde(s.properties[titelFält]) : '';
    if (!namn || /^Skärmavbild/i.test(namn)) continue;
    const typ = typFält ? värde(s.properties[typFält]) : '';
    if (!/pending approval/i.test(typ)) continue;
    const status = statusFält ? värde(s.properties[statusFält]) : '';
    if (!KLAR_STATUS.includes(status.toLowerCase())) continue;

    const filer = Object.values(s.properties)
      .filter(p => p.type === 'files')
      .flatMap(p => (p.files ?? []).map(f => ({
        namn: f.name ?? '',
        url: f.file?.url ?? f.external?.url ?? null,      // signerad, kort livslangd
      })))
      .filter(f => f.url);
    if (!filer.length) continue;                          // ingen fil = inget att ladda upp

    ut.push({ id: s.id, namn, status, typ, filer, url: s.url,
              skapad: s.created_time, redigerad: s.last_edited_time, hub: hub.titel });
  }
  return ut;
}

/** Notions fil-URL ar signerad och kortlivad — den maste hamtas NU, aldrig cachas
 *  och aldrig skickas vidare som en flagga till ett annat verktyg. */
export async function hämtaFil(url, målsökväg) {
  const { writeFileSync } = await import('node:fs');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Kunde inte hämta bilagan (${res.status}). Signerade Notion-URL:er går ut — hämta om raden.`);
  writeFileSync(målsökväg, Buffer.from(await res.arrayBuffer()));
  return målsökväg;
}

/** Alla klara rader i alla hubbar. Fel per hub samlas i stallet for att stoppa allt —
 *  404 betyder "integrationen ar inte inbjuden", inte att databasen saknas. */
export async function allaKlaraRader() {
  const hubbar = await hittaHubbar();
  const rader = [];
  const fel = {};
  for (const h of hubbar) {
    try { rader.push(...await klaraRader(h)); }
    catch (e) {
      fel[h.titel] = e.status === 404
        ? `404 — integrationen är inte inbjuden till "${h.titel}" (••• → Connections)`
        : e.message;
    }
  }
  return { hubbar, rader, fel };
}

// ------------------------------------------------------------- fristående CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const finns = (n) => args.includes(`--${n}`);
  try {
    if (finns('hubbar')) {
      const h = await hittaHubbar();
      console.log(`${h.length} creative hub(bar):`);
      for (const x of h) console.log(`  ${x.titel}  ${x.id}`);
      process.exit(0);
    }
    const { hubbar, rader, fel } = await allaKlaraRader();
    if (finns('json')) { console.log(JSON.stringify({ hubbar, rader, fel }, null, 2)); process.exit(0); }
    console.log(`${hubbar.length} hubbar genomsökta · ${rader.length} rader klara för uppladdning\n`);
    for (const r of rader) {
      console.log(`  • ${r.namn}  [${r.status}]  ${r.filer.length} fil(er)   (${r.hub})`);
      console.log(`    ${r.url}`);
    }
    for (const [h, f] of Object.entries(fel)) console.log(`\n  ✗ ${h}: ${f}`);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
}
