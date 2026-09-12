// llm.mjs — modellen som reserv för det reglerna inte känner igen.
// Valfritt: körs bara när ANTHROPIC_NYCKEL (eller ANTHROPIC_API_KEY) finns.
// Rå fetch mot Messages API som resten av repo-roten (tools/lib/engelska.mjs),
// noll beroenden.
//
// Två uppgifter, båda snäva:
//   1. `klassificeraOvrigt` — ärenden som reglerna satte till "ovrigt" får
//      EN av de kända kategorierna (eller "ovrigt" igen). Aldrig en ny
//      kategori: trenden ska gå att läsa vecka mot vecka.
//   2. `sammanfattaToppen` — en mening på engelska per toppkategori om vad
//      kunderna faktiskt skriver (VA:n läser den i Discord).
//
// Modellen: KUNDTJANST_MODELL i miljön, annars claude-sonnet-5 — samma som
// Discord-översättningen; klassificering av korta mejl är bulkarbete
// (CLAUDE.md modellpolicy). Går anropet fel behålls regelresultatet och
// felet skrivs i rapporten — modellen får aldrig stoppa körningen.

import { anthropicNyckel, anthropicHeaders, WORKSPACE_SAKNAS } from '../tools/lib/anthropic-nyckel.mjs';
import { KATEGORIER, KATEGORI } from './klassificering.mjs';

const MODELL = () => process.env.KUNDTJANST_MODELL || 'claude-sonnet-5';

async function anrop({ system, user, maxTokens = 4000, fetchFn = fetch, nyckel = anthropicNyckel() }) {
  if (!nyckel) throw new Error('ANTHROPIC_NYCKEL saknas');
  const svar = await fetchFn('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: anthropicHeaders(nyckel),
    body: JSON.stringify({ model: MODELL(), max_tokens: maxTokens, output_config: { effort: 'low' }, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!svar.ok) {
    const feltext = await svar.text();
    if (svar.status === 400 && /anthropic-workspace-id/.test(feltext)) throw new Error(`Messages API 400: ${WORKSPACE_SAKNAS}`);
    throw new Error(`Messages API svarade ${svar.status}: ${feltext.slice(0, 200)}`);
  }
  const kropp = await svar.json();
  if (kropp.stop_reason === 'refusal') throw new Error('modellen avböjde');
  return (kropp.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
}

/** Plockar ut första JSON-arrayen/objektet ur ett svar som kan ha text runt. Ren. */
export function plockaJson(text) {
  const s = String(text ?? '');
  const i = s.search(/[[{]/);
  if (i === -1) return null;
  for (let slut = s.length; slut > i; slut--) {
    const c = s[slut - 1];
    if (c !== ']' && c !== '}') continue;
    try { return JSON.parse(s.slice(i, slut)); } catch { /* prova kortare */ }
  }
  return null;
}

const TILLATNA = KATEGORIER.map((k) => k.id);

/**
 * Ärenden med kategori "ovrigt" → modellen väljer bland de kända. Returnerar
 * { arenden (nya objekt), andrade, fel }. Max 40 per anrop.
 */
export async function klassificeraOvrigt(arenden, { fetchFn = fetch, nyckel = anthropicNyckel() } = {}) {
  const ovriga = arenden.filter((a) => a.kategori === 'ovrigt');
  if (!ovriga.length || !nyckel) return { arenden, andrade: 0, fel: nyckel ? null : 'ANTHROPIC_NYCKEL saknas — "ovrigt" lämnades som det är' };
  const system = `You classify customer-service emails for a Nordic e-commerce store into exactly one category id from this list:
${KATEGORIER.map((k) => `- ${k.id}: ${k.en}`).join('\n')}
Rules: answer ONLY with a JSON array of {"i": <index>, "kategori": "<id>"}. Use "ovrigt" when nothing fits. Emails may be in Swedish, Norwegian, Danish, Finnish or English.`;
  const nya = new Map();
  let fel = null;
  for (let i = 0; i < ovriga.length; i += 40) {
    const del = ovriga.slice(i, i + 40);
    const user = del.map((a, j) => `[${j}] Subject: ${a.amne}\n${String(a.utdrag ?? '').slice(0, 400)}`).join('\n\n');
    try {
      const svar = plockaJson(await anrop({ system, user, fetchFn, nyckel }));
      for (const r of Array.isArray(svar) ? svar : []) {
        const a = del[Number(r.i)];
        if (a && TILLATNA.includes(r.kategori) && r.kategori !== 'ovrigt') nya.set(a.id, r.kategori);
      }
    } catch (e) {
      fel = e.message;
      break;
    }
  }
  const ut = arenden.map((a) => (nya.has(a.id) ? { ...a, kategori: nya.get(a.id), poang: Math.max(a.poang, KATEGORI[nya.get(a.id)].vikt), viaModell: true } : a));
  return { arenden: ut, andrade: nya.size, fel };
}

/**
 * En engelsk mening per toppkategori om vad kunderna faktiskt skriver.
 * Returnerar { [kategori]: 'mening' } — tomt objekt vid fel eller utan nyckel.
 */
export async function sammanfattaToppen(topp, arenden, { fetchFn = fetch, nyckel = anthropicNyckel(), max = 5 } = {}) {
  if (!nyckel || !topp.length) return {};
  const urval = topp.slice(0, max).map((p) => ({
    id: p.id,
    exempel: arenden.filter((a) => a.kategori === p.id).slice(0, 6).map((a) => `${a.amne} — ${String(a.utdrag ?? '').slice(0, 200)}`),
  }));
  const system = 'You summarize customer-service tickets for an English-speaking support VA. For each category, write ONE plain sentence (max 25 words) saying what customers concretely complain about or ask — specific, no fluff, no advice. Answer ONLY with a JSON object {"<category id>": "<sentence>"}.';
  const user = urval.map((u) => `## ${u.id} (${KATEGORI[u.id]?.en ?? u.id})\n${u.exempel.map((e) => `- ${e}`).join('\n')}`).join('\n\n');
  try {
    const svar = plockaJson(await anrop({ system, user, fetchFn, nyckel, maxTokens: 1500 }));
    return svar && typeof svar === 'object' && !Array.isArray(svar) ? svar : {};
  } catch {
    return {};
  }
}
