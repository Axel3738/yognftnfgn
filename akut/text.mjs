// akut/text.mjs — larmet som text i Slack. Svenska: läsaren är Axel.
//
// Formen är bestämd av hans dyslexi (CLAUDE.md): kort, konkret, och hans egna
// klick sist under en egen rubrik, numrerade, en mening per rad. Rubriken
// först så att kanalen går att skumma. Inga tankstreck.
//
// Två renderingar av samma text: `text` (Markdown, det Slack-connectorn tar)
// och `mrkdwn` (Slacks eget, det bot-token/webhook tar). Bara fetstilen skiljer.

import { VERKSAMHETSNAMN, klockan } from './kontroller.mjs';
import { arTillstand } from './minne.mjs';

const namn = (vm) => VERKSAMHETSNAMN[vm] ?? (vm ? String(vm) : 'Bolaget');

function bygg(rubrik, rader, gor, fet) {
  const ut = [fet(rubrik)];
  for (const r of rader ?? []) ut.push(String(r));
  if (gor?.length) {
    ut.push('');
    ut.push(fet('Det här gör du:'));
    gor.forEach((g, i) => ut.push(`${i + 1}. ${g}`));
  }
  return ut.join('\n').replace(/—|–/g, '-');
}

/** Ett larm → { text, mrkdwn }. */
export function formulera(larm) {
  const rubrik = `🚨 AKUT · ${namn(larm.verksamhet)} · ${larm.rubrik}`;
  return {
    text: bygg(rubrik, larm.rader, larm.gor, (s) => `**${s}**`),
    mrkdwn: bygg(rubrik, larm.rader, larm.gor, (s) => `*${s}*`),
  };
}

/** Ett löst tillstånd → { text, mrkdwn }. `post` är minnesraden (nyckel, rubrik, verksamhet, tid). */
export function formuleraLost(post, { nu = new Date() } = {}) {
  const sedan = post.tid ? new Date(post.tid).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : '?';
  const rubrik = `✅ Löst · ${namn(post.verksamhet)} · ${post.rubrik ?? post.nyckel}`;
  const rad = `Larmat ${sedan}, borta ${klockan(nu)}. Inget mer att göra.`;
  return { text: bygg(rubrik, [rad], [], (s) => `**${s}**`), mrkdwn: bygg(rubrik, [rad], [], (s) => `*${s}*`) };
}

/** Typer där flera larm i samma körning slås ihop till ETT meddelande (sex spårningsrutiner som stannar samtidigt är en händelse). */
const GRUPPERAS = Object.freeze({
  rutin: { rubrik: (n) => `${n} rutiner står still`, lost: (n) => `${n} rutiner kör igen` },
  'nyckel:shopify': { rubrik: (n) => `${n} Shopify-nycklar fungerar inte längre`, lost: (n) => `${n} Shopify-nycklar fungerar igen` },
});
const grupp = (l) => (l.typ === 'rutin' ? 'rutin' : String(l.nyckel ?? '').startsWith('nyckel:shopify:') ? 'nyckel:shopify' : null);

/**
 * Nya larm + lösta tillstånd → meddelanden [{ id, slag: 'nytt'|'lost', typ, nycklar, poster, text, mrkdwn }].
 * Varje meddelande bär de nycklar det täcker, så minnet kan skriva in exakt
 * det som postades. Ordning: nya larm först (butik, konto, pengar …), lösta sist.
 */
export function grupperaMeddelanden(nya = [], losta = [], { nu = new Date() } = {}) {
  const ut = [];
  let n = 0;
  const id = () => `m${++n}`;

  const grupper = new Map();
  for (const l of nya) {
    const g = grupp(l);
    if (!g) {
      const t = formulera(l);
      ut.push({ id: id(), slag: 'nytt', typ: l.typ, nycklar: [l.nyckel], poster: [l], ...t });
      continue;
    }
    if (!grupper.has(g)) grupper.set(g, []);
    grupper.get(g).push(l);
  }
  for (const [g, lista] of grupper) {
    if (lista.length === 1) {
      const t = formulera(lista[0]);
      ut.push({ id: id(), slag: 'nytt', typ: lista[0].typ, nycklar: [lista[0].nyckel], poster: lista, ...t });
      continue;
    }
    const verksamheter = [...new Set(lista.map((l) => namn(l.verksamhet)))];
    const rubrik = `🚨 AKUT · ${verksamheter.length === 1 ? verksamheter[0] : 'Bolaget'} · ${GRUPPERAS[g].rubrik(lista.length)}`;
    const rader = lista.flatMap((l) => (l.rader ?? []).slice(0, 1).map((r) => `• ${r}`));
    const gor = [...new Set(lista.flatMap((l) => l.gor ?? []))];
    ut.push({
      id: id(), slag: 'nytt', typ: lista[0].typ, nycklar: lista.map((l) => l.nyckel), poster: lista,
      text: bygg(rubrik, rader, gor, (s) => `**${s}**`),
      mrkdwn: bygg(rubrik, rader, gor, (s) => `*${s}*`),
    });
  }

  const lostGrupper = new Map();
  for (const p of losta) {
    if (!arTillstand(p.typ)) continue;
    const g = grupp(p);
    if (!g) {
      const t = formuleraLost(p, { nu });
      ut.push({ id: id(), slag: 'lost', typ: p.typ, nycklar: [p.nyckel], poster: [p], ...t });
      continue;
    }
    if (!lostGrupper.has(g)) lostGrupper.set(g, []);
    lostGrupper.get(g).push(p);
  }
  for (const [g, lista] of lostGrupper) {
    if (lista.length === 1) {
      const t = formuleraLost(lista[0], { nu });
      ut.push({ id: id(), slag: 'lost', typ: lista[0].typ, nycklar: [lista[0].nyckel], poster: lista, ...t });
      continue;
    }
    const rubrik = `✅ Löst · Bolaget · ${GRUPPERAS[g].lost(lista.length)}`;
    const rader = lista.map((p) => `• ${p.rubrik ?? p.nyckel}`);
    rader.push(`Borta ${klockan(nu)}. Inget mer att göra.`);
    ut.push({
      id: id(), slag: 'lost', typ: lista[0].typ, nycklar: lista.map((p) => p.nyckel), poster: lista,
      text: bygg(rubrik, rader, [], (s) => `**${s}**`), mrkdwn: bygg(rubrik, rader, [], (s) => `*${s}*`),
    });
  }
  return ut;
}
