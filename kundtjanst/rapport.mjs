// rapport.mjs — veckorapporten i två språk, rena funktioner över ett
// resultatobjekt. Svenska till Axel (chatten + korningar/), engelska till
// Discord, Notion och VA:n. Samma tal i båda — ingen räknar om något här.
//
// Formkravet (CLAUDE.md, Axels dyslexi): korta rader, tal i tabeller, det
// någon SKA GÖRA sist och numrerat. Discord-versionen håller sig under
// 2 000 tecken: listorna kapas, ACTION-sektionen aldrig.

import { KATEGORI } from './klassificering.mjs';
import { NIVAER } from './chargeback.mjs';

export const DISCORD_MAX = 2000;

/** ISO-vecka "2026-W37" för ett datum (i UTC, veckan börjar måndag). */
export function isoVecka(d = new Date()) {
  const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dag = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dag);
  const arStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const v = Math.ceil(((dt - arStart) / 86_400_000 + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(v).padStart(2, '0')}`;
}

const datum = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? '').slice(0, 10));
const pct = (n) => (n === null || n === undefined ? '—' : `${String(n).replace('.', ',')} %`);
const pctEn = (n) => (n === null || n === undefined ? 'n/a' : `${n}%`);
const trend = (nu, forr) => (forr === null || forr === undefined ? '' : nu > forr ? ` ↑ (${forr})` : nu < forr ? ` ↓ (${forr})` : ` = (${forr})`);

function nivaText(risk, sprak) {
  const n = risk?.niva ?? NIVAER[0];
  return `${n.emoji} ${sprak === 'sv' ? n.sv : n.en} (${risk?.poang ?? 0}/100)`;
}

/**
 * Svensk rapport (Markdown) för ett brand. `r` är run.mjs:s resultatobjekt:
 * { brand, vecka, period, sammanfattning, arenden, risk, ordrar, tvister,
 *   sop, aterkommande, forra, kallor, varningar, modell }.
 */
export function renderaSvensk(r) {
  const s = r.sammanfattning;
  const rad = [];
  rad.push(`# Kundtjänst ${r.brand.brand} — vecka ${r.vecka}`);
  rad.push('');
  rad.push(`Period: **${datum(r.period.fran)} – ${datum(r.period.till)}** · körd ${datum(r.kord)} · källa: ${r.kallor.join(', ') || 'ingen'}`);
  rad.push('');
  if (r.varningar?.length) {
    rad.push('## ⚠️ Kunde inte läsas');
    for (const v of r.varningar) rad.push(`- ${v}`);
    rad.push('');
  }
  rad.push('## Siffrorna');
  rad.push('');
  rad.push('| Vad | Denna vecka | Förra |');
  rad.push('|---|---|---|');
  rad.push(`| Ärenden (spam borträknat) | ${s.antalArenden} | ${r.forra?.antalArenden ?? '—'} |`);
  rad.push(`| Obesvarade just nu | ${s.obesvarade} | ${r.forra?.obesvarade ?? '—'} |`);
  rad.push(`| Obesvarade > ${r.brand.trosklar?.obesvarad_timmar ?? 48} h | ${s.larmObesvarade} | ${r.forra?.larmObesvarade ?? '—'} |`);
  rad.push(`| Median första svarstid | ${s.medianSvarstidTimmar === null ? '— (inga svar hittade)' : `${String(s.medianSvarstidTimmar).replace('.', ',')} h`} | ${r.forra?.medianSvarstidTimmar ?? '—'} |`);
  rad.push(`| Ordrar (${r.brand.trosklar?.ordrar_dagar ?? 30} dagar) | ${r.ordrar?.antal ?? '—'} | |`);
  rad.push(`| Tvister i perioden | ${r.tvister?.tillganglig ? r.tvister.lista.length : '— (ej läsbart)'} | |`);
  rad.push(`| Tvistgrad | ${pct(r.risk?.tvistgrad)} | |`);
  rad.push(`| **Chargeback-risk** | **${nivaText(r.risk, 'sv')}** | ${r.forra?.riskPoang ?? '—'} |`);
  rad.push('');

  rad.push('## Toppärendena (det som återkommer)');
  rad.push('');
  if (!s.topp.length) rad.push('Inga kundärenden i perioden.');
  else {
    rad.push('| # | Kategori | Antal | Obesvarade | Återkommande? |');
    rad.push('|---|---|---|---|---|');
    s.topp.slice(0, 8).forEach((p, i) => {
      const ak = r.aterkommande?.find((x) => x.id === p.id);
      rad.push(`| ${i + 1} | ${KATEGORI[p.id]?.sv ?? p.id} | ${p.antal}${trend(p.antal, r.forra?.perKategori?.[p.id] ?? null)} | ${p.obesvarade} | ${ak ? `JA — topp 3 i ${ak.veckor} av ${ak.av} veckor` : ''} |`);
    });
    rad.push('');
    for (const p of s.topp.slice(0, 5)) {
      const mening = r.sammanfattningar?.[p.id];
      rad.push(`- **${KATEGORI[p.id]?.sv ?? p.id}:** ${mening ? mening : `t.ex. "${p.exempel.slice(0, 2).join('", "')}"`}`);
    }
  }
  rad.push('');

  rad.push('## Chargeback-varningar');
  rad.push('');
  const sig = (r.risk?.signaler ?? []).filter((x) => x.poang > 0 || (x.varde !== null && x.varde > 0));
  if (!sig.length) rad.push('Inga varningssignaler i perioden.');
  const tal = (v) => (typeof v === 'number' ? String(v).replace('.', ',') : v ?? '—');
  for (const x of sig) {
    rad.push(`- **${x.sv}:** ${tal(x.varde)} (${x.poang} p)`);
    for (const d of x.detaljer.slice(0, 5)) rad.push(`  - ${d}`);
    if (x.detaljer.length > 5) rad.push(`  - … +${x.detaljer.length - 5} till`);
  }
  rad.push('');

  if (r.sop) {
    rad.push('## SOP-täckning i Notion');
    rad.push('');
    if (r.sop.fel) rad.push(`⚠️ ${r.sop.fel}`);
    else {
      rad.push(`${r.sop.antalSop} SOP-sidor lästa. Täckta: ${r.sop.tackta.map((t) => `${KATEGORI[t.id]?.sv ?? t.id} → "${t.sop}"`).join('; ') || 'inga'}.`);
      if (r.sop.saknas.length) rad.push(`**SOP saknas för toppärenden:** ${r.sop.saknas.map((id) => KATEGORI[id]?.sv ?? id).join(', ')}.`);
    }
    rad.push('');
  }

  const atg = r.risk?.atgarder ?? [];
  rad.push('## Det här ska VA:n göra, i ordning (på engelska — det är hennes lista)');
  rad.push('');
  if (!atg.length) rad.push('Inget akut. Håll svarstiden under 24 h.');
  atg.forEach((a, i) => rad.push(`${i + 1}. ${a.en}`));
  rad.push('');
  const forLiteHistorik = (r.historikVeckor ?? 0) < 3;
  if (r.sop?.saknas?.length || r.aterkommande?.length || forLiteHistorik) {
    rad.push('## Det här är Axels');
    rad.push('');
    let n = 1;
    if (forLiteHistorik && !r.aterkommande?.length) rad.push(`${n++}. Återkommande-kolumnen fylls först efter tre veckors körningar (${r.historikVeckor ?? 0} hittills). Låt rutinen gå.`);
    for (const ak of r.aterkommande ?? []) rad.push(`${n++}. **${KATEGORI[ak.id]?.sv ?? ak.id}** har varit topp 3 i ${ak.veckor} av ${ak.av} veckor — det är inte kundtjänst, det är produkten/leveransen. Rotorsak, inte fler svar.`);
    for (const id of r.sop?.saknas ?? []) rad.push(`${n++}. Be VA:n skriva en SOP för **${KATEGORI[id]?.sv ?? id}** i Notion (finns ingen sida vars titel nämner det).`);
    rad.push('');
  }
  return rad.join('\n');
}

/** Engelsk rapport (Discord/Notion/VA). Kort. `kort: true` håller Discords tak. */
export function renderaEngelsk(r, { kort = false, pingId = null } = {}) {
  const s = r.sammanfattning;
  const rad = [];
  const n = r.risk?.niva ?? NIVAER[0];
  rad.push(`**📬 ${r.brand.brand} customer service — week ${r.vecka}**`);
  rad.push(`Period ${datum(r.period.fran)} – ${datum(r.period.till)} · sources: ${r.kallor.join(', ') || 'none'}`);
  if (r.varningar?.length) rad.push(`⚠️ Could not read: ${r.varningar.join(' · ')}`);
  rad.push('');
  rad.push('**Numbers**');
  rad.push(`• Tickets: ${s.antalArenden}${trend(s.antalArenden, r.forra?.antalArenden ?? null)} · unanswered now: ${s.obesvarade} · unanswered > ${r.brand.trosklar?.obesvarad_timmar ?? 48}h: ${s.larmObesvarade}`);
  rad.push(`• Median first reply: ${s.medianSvarstidTimmar === null ? 'n/a' : `${s.medianSvarstidTimmar}h`} · orders (${r.brand.trosklar?.ordrar_dagar ?? 30}d): ${r.ordrar?.antal ?? 'n/a'} · disputes: ${r.tvister?.tillganglig ? r.tvister.lista.length : 'n/a'} · dispute rate: ${pctEn(r.risk?.tvistgrad)}`);
  rad.push(`• **Chargeback risk: ${n.emoji} ${n.en} (${r.risk?.poang ?? 0}/100)**`);
  rad.push('');
  rad.push('**Top tickets (recurring problems)**');
  if (!s.topp.length) rad.push('• No customer tickets in the period.');
  s.topp.slice(0, kort ? 5 : 8).forEach((p, i) => {
    const ak = r.aterkommande?.find((x) => x.id === p.id);
    const mening = r.sammanfattningar?.[p.id];
    rad.push(`${i + 1}. ${KATEGORI[p.id]?.en ?? p.id}: ${p.antal}${trend(p.antal, r.forra?.perKategori?.[p.id] ?? null)}${p.obesvarade ? ` (${p.obesvarade} unanswered)` : ''}${ak ? ` — 🔁 recurring, top 3 in ${ak.veckor}/${ak.av} weeks` : ''}${mening && !kort ? `\n   ${mening}` : ''}`);
  });
  rad.push('');
  const sig = (r.risk?.signaler ?? []).filter((x) => x.poang > 0);
  rad.push('**⚠️ Chargeback warning signs**');
  if (!sig.length) rad.push('• None this week.');
  for (const x of sig.slice(0, kort ? 5 : 10)) {
    rad.push(`• ${x.en}: ${x.varde ?? '—'} (${x.poang} pts)`);
    for (const d of x.detaljer.slice(0, kort ? 2 : 5)) rad.push(`   ◦ ${d}`);
    if (x.detaljer.length > (kort ? 2 : 5)) rad.push(`   ◦ +${x.detaljer.length - (kort ? 2 : 5)} more (see full report)`);
  }
  if (r.sop && !r.sop.fel && r.sop.saknas.length) {
    rad.push('');
    rad.push(`**📄 SOP missing in Notion for:** ${r.sop.saknas.map((id) => KATEGORI[id]?.en ?? id).join(', ')}`);
  }
  const atg = r.risk?.atgarder ?? [];
  rad.push('');
  if (!atg.length) rad.push('✅ Nothing urgent. Keep first reply under 24h.');
  else {
    rad.push(`**🔴 ACTION NEEDED${pingId ? ` <@${pingId}>` : ''}**`);
    atg.forEach((a, i) => rad.push(`${i + 1}. ${a.en}`));
  }
  let text = rad.join('\n');
  if (kort && text.length > DISCORD_MAX) text = kapaForDiscord(rad);
  return text;
}

/** Kapar listorna men aldrig ACTION-sektionen (som ligger sist). */
export function kapaForDiscord(rader) {
  const i = rader.findIndex((r) => r.startsWith('**🔴 ACTION') || r.startsWith('✅ Nothing'));
  const huvud = i === -1 ? rader : rader.slice(0, i);
  const svans = i === -1 ? [] : rader.slice(i);
  const svansText = svans.join('\n');
  const markor = '… (cut — see full report)';
  // Budgeten reserverar svansen, markören och de två radbrytningarna runt
  // dem — så att slice() nedan aldrig behöver ta något ur ACTION-sektionen.
  let budget = DISCORD_MAX - svansText.length - markor.length - 4;
  const ut = [];
  for (const r of huvud) {
    if (budget - r.length - 1 < 0) { ut.push(markor); break; }
    ut.push(r);
    budget -= r.length + 1;
  }
  return [...ut, '', ...svans].join('\n').slice(0, DISCORD_MAX);
}

/** Rankingen över alla brands, svensk Markdown. */
export function renderaRanking(rankade, vecka) {
  const rad = [];
  rad.push(`# Chargeback-ranking alla brands — vecka ${vecka}`);
  rad.push('');
  rad.push('Högst risk först. Poängen är summan av signalerna (0–100); nivån 🟢 < 25, 🟡 25–50, 🔴 > 50.');
  rad.push('');
  rad.push('| Plats | Brand | Risk | Ärenden | Obesvarade > gräns | Tvister | Tvistgrad | Toppärende |');
  rad.push('|---|---|---|---|---|---|---|---|');
  for (const r of rankade) {
    if (r.hoppad) { rad.push(`| — | ${r.brand.brand} | hoppad: ${r.orsak} | | | | | |`); continue; }
    const s = r.sammanfattning;
    rad.push(`| ${r.plats} | ${r.brand.brand} | ${nivaText(r.risk, 'sv')} | ${s.antalArenden} | ${s.larmObesvarade} | ${r.tvister?.tillganglig ? r.tvister.lista.length : '—'} | ${pct(r.risk?.tvistgrad)} | ${s.topp[0] ? `${KATEGORI[s.topp[0].id]?.sv ?? s.topp[0].id} (${s.topp[0].antal})` : '—'} |`);
  }
  rad.push('');
  return rad.join('\n');
}

/** Rankingen på engelska (Discord, kort). */
export function renderaRankingEngelsk(rankade, vecka) {
  const rad = [`**🏁 Chargeback risk ranking — week ${vecka}** (highest first)`];
  for (const r of rankade) {
    if (r.hoppad) { rad.push(`• ${r.brand.brand}: skipped (${r.orsak})`); continue; }
    const s = r.sammanfattning;
    const n = r.risk?.niva ?? NIVAER[0];
    rad.push(`${r.plats}. ${n.emoji} **${r.brand.brand}** ${r.risk?.poang ?? 0}/100 · ${s.antalArenden} tickets · ${s.larmObesvarade} unanswered · disputes ${r.tvister?.tillganglig ? r.tvister.lista.length : 'n/a'} · top: ${s.topp[0] ? KATEGORI[s.topp[0].id]?.en ?? s.topp[0].id : '—'}`);
  }
  return rad.join('\n').slice(0, DISCORD_MAX);
}
