// notion.mjs — kundtjänstens Notion: VA:ns SOP-databas och veckorapporten.
// REST med NOTION_TOKEN, noll beroenden. Integrationen måste vara inbjuden
// till databaserna (••• → Connections); 404 betyder "inte inbjuden".
//
// Två saker, båda valfria (saknas id i brandfilen hoppas de över):
//   1. SOP-TÄCKNING: vilka av rapportens toppkategorier har VA:n redan en SOP
//      för, och vilka saknar en? Matchas på SOP-sidornas titlar mot en
//      ordlista per kategori (SOP_ORD nedan). En kategori som återkommer
//      vecka efter vecka UTAN SOP är en uppgift för Axel/VA:n.
//   2. RAPPORTSIDA: veckorapporten (engelska) som en sida i en Notion-databas
//      så VA:n har den där hon jobbar. Titeln bär brand + vecka.

import { KATEGORI } from './klassificering.mjs';

const API = 'https://api.notion.com/v1';

/** Ord i en SOP-titel som betyder att kategorin är täckt. Gemener, engelska + svenska. */
export const SOP_ORD = Object.freeze({
  // Orden är avlästa mot VA:ns databas "Customer support bäverbutiken" 2026-09-13
  // ("Package missing after tracking shows delivered", "Money charged but no
  // order visible", "Wrong product delivered", "Order not arrived within …").
  chargeback_hot: ['chargeback', 'dispute', 'tvist', 'bank', 'escalat', 'angry', 'threat'],
  // Ordningen är prioritet: första ordet som träffar en titel vinner, så det
  // mest specifika står först ('missing' före 'not received', som annars
  // träffar "Refund not received after approved return").
  okand_debitering: ['double charge', 'duplicate', 'unknown charge', 'charged', 'dubbel', 'debiter', 'unauthorized', 'fraud'],
  ej_levererad: ['missing', 'not arrived', 'never arrived', 'shows delivered', 'returned to sender', 'not received', 'lost', 'ej levererad', 'försvunn', 'aldrig'],
  fel_vara: ['wrong product', 'wrong item', 'wrong size', 'not as described', 'fel vara', 'fel storlek', 'incorrect'],
  var_ar_ordern: ['wismo', 'where is my order', 'delivery time', 'not arrived within', 'shipping status', 'tracking', 'spårning', 'leverans'],
  skadad_defekt: ['damaged', 'defective', 'broken', 'warranty', 'skadad', 'defekt', 'reklamation', 'trasig'],
  aterbetalning: ['refund', 'återbetal', 'money back'],
  avbestallning: ['cancel', 'avbeställ', 'annuller'],
  retur_angerratt: ['return', 'retur', 'ånger', 'withdrawal', 'exchange'],
  faktura_klarna: ['invoice', 'faktura', 'klarna', 'payment'],
  produktfraga: ['product question', 'faq', 'pre-sale', 'produktfråga', 'compatib', 'size guide'],
  rabatt_kod: ['discount', 'promo', 'rabatt', 'coupon', 'code'],
});

/** Ren: SOP-titlar + kategorier → { tackta: [{id, sop}], saknas: [id] }. */
export function sopTackning(titlar = [], kategorier = []) {
  const gemener = titlar.map((t) => ({ titel: t, g: String(t).toLowerCase() }));
  const tackta = [];
  const saknas = [];
  for (const id of kategorier) {
    if (id === 'spam' || id === 'ovrigt') continue;
    const ord = SOP_ORD[id] ?? [];
    let traff = null;
    for (const o of ord) { traff = gemener.find((t) => t.g.includes(o)); if (traff) break; }
    if (traff) tackta.push({ id, sop: traff.titel });
    else saknas.push(id);
  }
  return { tackta, saknas };
}

let sist = 0;
async function notion(sokvag, { method = 'GET', body = null, token = process.env.NOTION_TOKEN, fetchFn = fetch } = {}) {
  if (!token) throw new Error('NOTION_TOKEN saknas i miljön.');
  const vanta = 350 - (Date.now() - sist);
  if (vanta > 0) await new Promise((r) => setTimeout(r, vanta));
  sist = Date.now();
  const res = await fetchFn(`${API}/${sokvag}`, {
    method,
    headers: { authorization: `Bearer ${token}`, 'notion-version': '2022-06-28', 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(res.status === 404 ? 'Notion svarade 404 — integrationen är inte inbjuden till databasen (••• → Connections).' : json.message || res.statusText);
    e.status = res.status;
    throw e;
  }
  return json;
}

const titelAv = (sida) => {
  const p = Object.values(sida.properties ?? {}).find((x) => x.type === 'title');
  return (p?.title ?? []).map((r) => r.plain_text ?? '').join('').trim();
};

/** Typ-värden som är dokumentation. Allt annat i en hubb är annonser och räknas aldrig som SOP. */
export const SOP_TYPER = /sop|guideline|riktlinje|rutin|policy|playbook/i;

/** Radens Typ (select eller multi_select), eller null när databasen saknar kolumnen. */
export function typAv(sida) {
  const p = sida.properties?.Typ ?? sida.properties?.Type ?? null;
  if (!p) return null;
  if (p.type === 'select') return p.select?.name ?? '';
  if (p.type === 'multi_select') return (p.multi_select ?? []).map((x) => x.name).join(' / ');
  if (p.type === 'status') return p.status?.name ?? '';
  return null;
}

/** Rubrikrad i en SOP-databas: versaler rakt igenom och tom Kategori (när kolumnen finns). */
export function arAvdelningsrad(sida, titel) {
  const k = sida.properties?.Kategori ?? sida.properties?.Category ?? null;
  if (!k) return false;
  const tom = k.type === 'multi_select' ? !(k.multi_select ?? []).length : k.type === 'select' ? !k.select : false;
  return tom && titel === titel.toUpperCase() && /[A-ZÅÄÖ]/.test(titel);
}

/**
 * Alla SOP-titlar i en databas (paginerat). En ren SOP-databas saknar Typ-kolumn
 * och då räknas varje rad. Pekar brandfilen på en creative hub (mätt 2026-09-12:
 * Bäverbutikens länk var "Creative Hub master", 215 rader varav 1 SOP) räknas
 * bara raderna vars Typ är dokumentation — annonsraderna är inte SOP:er.
 */
export async function hamtaSopTitlar(databasId, alternativ = {}) {
  const ut = [];
  let cursor;
  do {
    const svar = await notion(`databases/${databasId}/query`, { method: 'POST', body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }, ...alternativ });
    for (const s of svar.results ?? []) {
      const typ = typAv(s);
      if (typ !== null && !SOP_TYPER.test(typ)) continue;
      const t = titelAv(s);
      if (!t) continue;
      // VA:ns databas har avdelningsrader ("PAYMENT", "RETURN & REFUND") utan
      // Kategori och i versaler — de är rubriker, inte SOP:er.
      if (arAvdelningsrad(s, t)) continue;
      ut.push(t);
    }
    cursor = svar.has_more ? svar.next_cursor : null;
  } while (cursor);
  return ut;
}

/** Markdown-liknande engelska rader → Notion-block (rubriker, punkter, stycken). Max 100 block per anrop. */
export function tillBlock(rader) {
  const block = [];
  for (const rad of String(rader ?? '').split('\n')) {
    const r = rad.replace(/\*\*/g, '').trimEnd();
    if (!r.trim()) continue;
    const text = (t) => [{ type: 'text', text: { content: t.slice(0, 1900) } }];
    if (/^#{1,3}\s/.test(r)) {
      const n = r.match(/^(#+)/)[1].length;
      block.push({ object: 'block', type: `heading_${Math.min(3, n)}`, [`heading_${Math.min(3, n)}`]: { rich_text: text(r.replace(/^#+\s*/, '')) } });
    } else if (/^(•|-|\d+\.)\s/.test(r.trim())) {
      block.push({ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: text(r.trim().replace(/^(•|-|\d+\.)\s*/, '')) } });
    } else {
      block.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: text(r.trim()) } });
    }
  }
  return block.slice(0, 100);
}

/** Skapar rapportsidan. Titelfältet hittas på typ (databaser döper det olika). Returnerar { id, url }. */
export async function skapaRapportsida(databasId, titel, textEn, alternativ = {}) {
  const db = await notion(`databases/${databasId}`, alternativ);
  const titelFalt = Object.entries(db.properties ?? {}).find(([, p]) => p.type === 'title')?.[0] ?? 'Name';
  const sida = await notion('pages', {
    method: 'POST',
    body: {
      parent: { database_id: databasId },
      properties: { [titelFalt]: { title: [{ type: 'text', text: { content: titel.slice(0, 200) } }] } },
      children: tillBlock(textEn),
    },
    ...alternativ,
  });
  return { id: sida.id, url: sida.url };
}

export const kategoriNamnEn = (id) => KATEGORI[id]?.en ?? id;
