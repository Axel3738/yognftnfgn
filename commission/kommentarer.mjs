// kommentarer.mjs — redigerare som inte har något Notion-konto.
//
// Jerzee (Axels besked 2026-09-15) har aldrig fått ett Notion-konto och kan
// därför aldrig stå i kolumnen Ansvarig. Det han gör märks i stället ut i en
// KOMMENTAR på raden — "jerzee is working on this", "By Jerzee". Mätt samma dag
// över alla 18 databaser integrationen ser: 50 rader i 8 hubbar bär en sådan
// kommentar, skrivna från gästkontot 05b30396-13bd-41c1-b205-94169150bde3.
//
// Utan det här steget faller de raderna igenom till produktens ägare i
// koppling.mjs — alltså får någon annan betalt för Jerzees arbete.
//
// Två järnregler:
//   1. Ansvarig VINNER alltid. En kommentar används bara på rader där kolumnen
//      Ansvarig är tom — annars skulle en förbipasserande kommentar kunna
//      flytta pengar från den som faktiskt är satt på jobbet.
//   2. Två personers mönster på samma rad = ingen får raden. Hellre okopplat
//      än fel person.
//
// Personen kopplas via `notionKommentarMonster` i dashboard/data/team.json och
// får ett syntetiskt `notionUserId` (t.ex. "kommentar:jerzee"), så att resten av
// kedjan (koppling.mjs, berakning.mjs) inte behöver veta att raden kom härifrån.

const API = 'https://api.notion.com/v1';

export class KommentarFel extends Error {}

/** Sid-id ur en Notion-URL: https://app.notion.com/<32 hex> → uuid. */
export function sidId(url) {
  const m = String(url ?? '').match(/([0-9a-f]{32})(?:[?#]|$)/i)
    ?? String(url ?? '').match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (!m) return null;
  const h = m[1].replace(/-/g, '').toLowerCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Personer i team.json som har ett kommentarmönster i stället för Notion-konto. */
export function kommentarPersoner(personer) {
  return (personer ?? [])
    .filter((p) => p.kommentarMonster && p.notionUserId)
    .map((p) => ({
      id: p.id,
      namn: p.namn,
      notionUserId: p.notionUserId,
      monster: new RegExp(p.kommentarMonster, 'i'),
    }));
}

/** Vilka mönster träffar den här radens kommentarer? Flera träffar = null. */
export function traff(texter, matchare) {
  const traffade = matchare.filter((m) => texter.some((t) => m.monster.test(t)));
  return traffade.length === 1 ? traffade[0] : null;
}

/** Bara rader utan Ansvarig är värda ett API-anrop — resten är redan kopplade.
 *  Dokumentationsrader (SOP, Guideline …) hoppas över; de är inga annonser. */
export function raderAttKolla(hubbar) {
  const ut = [];
  for (const h of hubbar ?? []) {
    for (const r of h.rader ?? []) {
      if (r.ansvariga?.length) continue;
      if (r.typ && !/pending approval/i.test(r.typ)) continue;
      const id = sidId(r.url);
      if (id) ut.push({ hubb: h.namn, rad: r, id });
    }
  }
  return ut;
}

let sist = 0;
async function hamtaKommentarer(sidId, { fetchImpl = fetch, env = process.env } = {}) {
  if (!env.NOTION_TOKEN) throw new KommentarFel('NOTION_TOKEN saknas i miljön.');
  const vanta = 340 - (Date.now() - sist);
  if (vanta > 0) await new Promise((r) => setTimeout(r, vanta));
  sist = Date.now();
  const res = await fetchImpl(`${API}/comments?block_id=${sidId}&page_size=100`, {
    headers: {
      authorization: `Bearer ${env.NOTION_TOKEN}`,
      'notion-version': '2022-06-28',
      'content-type': 'application/json',
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new KommentarFel(json.message || res.statusText); e.status = res.status; throw e; }
  return (json.results ?? []).map((k) => (k.rich_text ?? []).map((x) => x.plain_text ?? '').join(''));
}

/**
 * Skriver `ansvariga` på de rader vars kommentarer pekar ut en person utan
 * Notion-konto. Muterar raderna i `hubbar` — samma objekt går vidare till
 * koppling.mjs. Returnerar en sammanfattning för rapporten.
 */
export async function berikaMedKommentarer(hubbar, personer, opt = {}) {
  const matchare = kommentarPersoner(personer);
  const sammanfattning = { matchare: matchare.map((m) => m.namn), lasta: 0, traffar: 0, fel: 0, perPerson: {}, rader: [] };
  if (!matchare.length) return sammanfattning;

  for (const { hubb, rad, id } of raderAttKolla(hubbar)) {
    let texter;
    try {
      texter = await hamtaKommentarer(id, opt);
    } catch (e) {
      sammanfattning.fel++;
      continue;
    }
    sammanfattning.lasta++;
    if (!texter.length) continue;
    const t = traff(texter, matchare);
    if (!t) continue;
    rad.ansvariga = [t.notionUserId];
    rad.viaKommentar = t.id;
    sammanfattning.traffar++;
    sammanfattning.perPerson[t.namn] = (sammanfattning.perPerson[t.namn] ?? 0) + 1;
    sammanfattning.rader.push({ hubb, namn: rad.namn, person: t.namn });
  }
  return sammanfattning;
}
