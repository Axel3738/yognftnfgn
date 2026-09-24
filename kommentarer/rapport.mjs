// kommentarer/rapport.mjs — rapporten i två språk. Rena funktioner.
//
//   rapportSv  → kommentarer/rapporter/<datum>.md, till Axel (svenska)
//   rapportEn  → Discord #ad-comments per verksamhet (engelska — teamet läser engelska)
//
// Kundens ord citeras ordagrant inom `backticks`: engelskaspärren
// (tools/lib/engelska.mjs) räknar inte kodspann, och en översättning rör dem inte.
// Rapporten räknar aldrig om något — den läser sammanstall() och sessionens dom.

import { NIVA } from './klassa.mjs';

export const KATEGORI_EN = Object.freeze({
  'ej levererat': 'order not received',
  'bluff-anklagelse': 'scam accusation',
  'hot om anmälan': 'threat to report us',
  'fara/säkerhet': 'safety',
  'spam/länk': 'spam / link',
  'missnöjd köpare': 'unhappy buyer',
  'fukt/mögel/ventilation': 'moisture / mould / ventilation',
  'skepsis/kritik': 'scepticism / "junk"',
  'pris/konkurrent': 'price / cheaper elsewhere',
  'förtroende': 'trust',
  'kvalitet/material': 'quality / material',
  'fungerar det': 'does it work?',
  'storlek/passform': 'size / fit',
  'frakt/leverans': 'shipping',
  'retur/garanti': 'returns',
  'betalning': 'payment (Klarna etc.)',
  'önskemål': 'feature wish',
  'pris': 'price',
  'köpfråga': 'buying question',
  'fråga': 'question',
});
const en = (k) => KATEGORI_EN[k] ?? k;

const citat = (t, max = 180) => {
  const s = String(t ?? '').replace(/`/g, "'").replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};
/** 🔴 som sessionen inte dömt som falsklarm. Ren. */
export const verkligaAllvarliga = (v, dom) => v.allvarliga.filter((r) => !dom?.atgarder?.[r.id]?.falsklarm);
const falsklarm = (v, dom) => v.allvarliga.filter((r) => dom?.atgarder?.[r.id]?.falsklarm);
const procent = (x) => `${Math.round(x * 100)} %`;
const lank = (r) => `${r.kanal === 'instagram' ? ' · IG' : ''}${r.permalink ? ` · <${r.permalink}>` : ''}`;

/** Svensk datumrad "25 sep". Ren. */
export function kortDatum(iso) {
  const m = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const d = new Date(`${String(iso).slice(0, 10)}T12:00:00Z`);
  return `${d.getUTCDate()} ${m[d.getUTCMonth()]}`;
}

/**
 * Den svenska rapporten. Ren.
 * @param s   { datum, sedan, lasning: {konton, sidor}, sammanstallning, nya: antal }
 * @param dom sessionens kontrollerade dom (kan vara null)
 */
export function rapportSv(s, dom = null) {
  const ut = [];
  const sam = s.sammanstallning ?? {};
  const verk = Object.values(sam);
  const totalt = verk.reduce((a, v) => a + v.nya, 0);
  ut.push(`# Kommentarsgranskning ${s.datum}`);
  ut.push('');
  ut.push(`Nya kommentarer sedan ${s.sedan.replace('T', ' ').slice(0, 16)} UTC: **${totalt}** på ${verk.reduce((a, v) => a + v.annonser_med_nya, 0)} annonser. Läs-bart — rutinen svarar, döljer och raderar aldrig.`);
  const olasta = [...(s.lasning?.konton ?? []).filter((k) => k.fel), ...(s.lasning?.sidor ?? []).filter((x) => x.fel)];
  if (olasta.length) {
    ut.push('');
    ut.push('⚠️ **Gick inte att läsa** (räknas inte som noll):');
    for (const o of olasta) ut.push(`- ${o.namn ?? o.id}: ${o.fel}`);
  }
  if (dom?.sammanfattning) { ut.push(''); ut.push(`**Kort:** ${dom.sammanfattning}`); }
  if (!totalt) { ut.push(''); ut.push('Inga nya kommentarer i fönstret.'); return `${ut.join('\n')}\n`; }

  for (const v of verk) {
    ut.push('');
    ut.push(`## ${v.verksamhet} — ${v.nya} nya (🔴 ${v.per_niva[NIVA.ALLVARLIGT] ?? 0} · 🟡 ${v.per_niva[NIVA.INVANDNING] ?? 0} · 🔵 ${v.per_niva[NIVA.FRAGA] ?? 0} · beröm ${v.berom} · taggade vänner ${v.taggar})`);
    for (const k of v.konflikter) ut.push(`- ⛔ **Fel sida/länk:** ${k} — köpen bokförs på fel verksamhet.`);

    ut.push('');
    const allv = verkligaAllvarliga(v, dom);
    ut.push(`### 🔴 Kräver en människa i dag (${allv.length})`);
    if (!allv.length) ut.push('Inget.');
    for (const r of allv) {
      const a = dom?.atgarder?.[r.id];
      ut.push(`- **${r.kategori}** · \`${r.annons}\` · "${citat(r.text)}"${r.likes ? ` (${r.likes} likes)` : ''}${lank(r)}${a?.sv ? `\n  → ${a.sv}` : ''}`);
    }

    const fa = falsklarm(v, dom);
    if (fa.length) ut.push(`*Regelträffar som sessionen dömde som falsklarm (${fa.length}): ${fa.map((r) => `"${citat(r.text, 60)}" — ${dom.atgarder[r.id].sv ?? ''}`).join(' · ')}*`);

    ut.push('');
    ut.push(`### 🔵 Köpfrågor utan svar i tråden (${v.fragor.length}) — svara i tråden`);
    if (!v.fragor.length) ut.push('Inga.');
    for (const r of v.fragor) ut.push(`- ${r.kategori} · \`${r.annons}\` · "${citat(r.text, 140)}"${lank(r)}`);

    const medInv = v.produkter.filter((p) => p.kluster.length);
    ut.push('');
    ut.push('### 🟡 Invändningar per produkt (nya / 14 dagar, andel av produktens invändningar)');
    if (!medInv.length) ut.push('Inga invändningar.');
    for (const p of medInv) {
      const ob = p.ob_aktiva.length ? `OB-annonser live: ${p.ob_aktiva.length}` : '**inga OB-annonser live**';
      ut.push(`- **${p.prefix}**${p.produkt ? ` (${p.produkt})` : ''} — ${p.invandningar_dagar} invändningar på 14 d · ${ob}${p.produktmapp ? ` · minne: \`products/${p.produktmapp}/\`` : ''}`);
      for (const k of p.kluster.slice(0, 4)) {
        ut.push(`  - ${k.ny_invandning ? '🆕 ' : ''}${k.kategori}: ${k.nya} / ${k.dagar} (${procent(k.andel)}) — ${k.citat.slice(0, 2).map((c) => `"${citat(c.text, 110)}"`).join(' · ')}`);
      }
    }

    if (v.resonans.length) {
      ut.push('');
      ut.push(`### 👍 Kommentarer med likes (resonans — andra håller med)`);
      for (const r of v.resonans.slice(0, 5)) ut.push(`- ${r.likes} likes · ${r.kategori} · \`${r.annons}\` · "${citat(r.text, 140)}"`);
    }

    const leads = (dom?.leads ?? []).filter((l) => l.verksamhet === v.verksamhet);
    ut.push('');
    ut.push(`### 🟢 Nya leads — vinklar, hookar, invändningar (${leads.length})`);
    if (!leads.length) ut.push(dom ? 'Inga nya leads den här gången.' : 'Ingen dom från sessionen — leads saknas.');
    for (const l of leads) ut.push(`- **${l.typ}** · ${l.prefix ?? ''} — ${l.lead}${l.forslag ? ` → ${l.forslag}` : ''} *(belägg: ${l.belagg.length} kommentar${l.belagg.length === 1 ? '' : 'er'})*`);

    const svar = (dom?.svar ?? []).filter((x) => (v.rader ?? []).some((r) => r.id === x.id));
    if (svar.length) {
      ut.push('');
      ut.push('### ✍️ Förslag på svar (VA:n klistrar in från sidan — rutinen svarar aldrig själv)');
      for (const x of svar) ut.push(`- ${x.id}: "${citat(x.text, 400)}" *(fakta: ${x.fakta})*`);
    }
  }
  return `${ut.join('\n')}\n`;
}

/**
 * Den engelska Discord-rapporten för EN verksamhet. Ren.
 * @param va  Discord-id:n som ska pingas när en köpare behöver kundtjänst (allowed_mentions låser dem)
 */
export function rapportEn(v, { datum, dom = null, va = [] } = {}) {
  const ut = [];
  const allv = verkligaAllvarliga(v, dom);
  const kund = allv.filter((r) => ['ej levererat', 'missnöjd köpare', 'bluff-anklagelse', 'hot om anmälan'].includes(r.kategori));
  ut.push(`**Ad comments — ${v.verksamhet} — ${kortDatum(datum)}** · ${v.nya} new on ${v.annonser_med_nya} ads (🔴 ${allv.length} · 🔵 ${v.fragor.length} questions with no reply)`);
  if (dom?.summary_en?.[v.verksamhet]) ut.push(dom.summary_en[v.verksamhet]);
  for (const k of v.konflikter) ut.push(`⛔ Wrong page/link: \`${k}\``);
  if (kund.length && va.length) ut.push(`${va.map((id) => `<@${id}>`).join(' ')} ${kund.length} comment${kund.length === 1 ? '' : 's'} need${kund.length === 1 ? 's' : ''} you today (see 🔴).`);

  if (allv.length) {
    ut.push('');
    ut.push(`🔴 **Needs a human today (${allv.length})**`);
    for (const r of allv) {
      const a = dom?.atgarder?.[r.id];
      ut.push(`• ${en(r.kategori)} · \`${r.annons}\` · \`${citat(r.text, 160)}\`${a?.en ? ` → ${a.en}` : ''}${lank(r)}`);
    }
  }
  if (v.fragor.length) {
    ut.push('');
    ut.push(`🔵 **Buying questions with no reply in the thread (${v.fragor.length})** — reply from the page`);
    for (const r of v.fragor) ut.push(`• ${en(r.kategori)} · \`${r.annons}\` · \`${citat(r.text, 120)}\`${lank(r)}`);
  }
  const medInv = v.produkter.filter((p) => p.kluster.some((k) => k.nya > 0));
  if (medInv.length) {
    ut.push('');
    ut.push('🟡 **Objections (new / 14 days)**');
    for (const p of medInv.slice(0, 8)) {
      const kl = p.kluster.filter((k) => k.nya > 0).slice(0, 3).map((k) => `${k.ny_invandning ? '🆕 ' : ''}${en(k.kategori)} ${k.nya}/${k.dagar} (${procent(k.andel)})`).join(' · ');
      ut.push(`• \`${p.prefix}\`: ${kl} — ${p.ob_aktiva.length ? `${p.ob_aktiva.length} OB ads live` : '**no OB ad live**'}`);
    }
  }
  const leads = (dom?.leads ?? []).filter((l) => l.verksamhet === v.verksamhet && l.lead_en);
  if (leads.length) {
    ut.push('');
    ut.push('🟢 **New leads for the next briefs**');
    for (const l of leads) ut.push(`• ${l.typ_en ?? l.typ} · \`${l.prefix ?? ''}\` — ${l.lead_en}`);
  }
  const svar = (dom?.svar ?? []).filter((x) => (v.rader ?? []).some((r) => r.id === x.id));
  if (svar.length) {
    ut.push('');
    ut.push('✍️ **Suggested replies** — paste as-is from the page (the routine never replies itself)');
    for (const x of svar) {
      const r = (v.rader ?? []).find((y) => y.id === x.id);
      ut.push(`• \`${r?.annons ?? ''}\` → \`${citat(x.text, 400)}\` (means: ${citat(x.en, 300)})${r ? lank(r) : ''}`);
    }
  }
  return ut.join('\n');
}

/** Första inlägget i en nyskapad #ad-comments — teamet ska förstå kanalen utan att fråga. */
export const KANAL_INTRO = [
  '**What this channel is** — every morning a routine reads every new comment on our live ads and posts one report per store here.',
  '🔴 **Needs a human today**: order not received, unhappy buyer, scam accusation, threat to report us, safety, spam. Open the link and handle it from the page. Never promise a refund in a comment — ask the customer to email support with their order number.',
  '🔵 **Buying questions with no reply in the thread**: nobody (customer or page) has replied yet. A suggested reply is included when the answer is on the product page — paste the text in backticks as-is; "means:" is the English meaning for you.',
  '🟡 **Objections** and 🟢 **leads** feed the next creative briefs.',
  'The routine only reads. It never replies, hides or deletes a comment — people do that.',
].join('\n');

/** Leadsektionen som läggs överst i kommentarer/leads.md. Ren. */
export function leadsSektion(datum, leads) {
  if (!leads?.length) return null;
  const ut = [`## ${datum}`, ''];
  for (const l of leads) {
    ut.push(`- [ ] **${l.verksamhet} · ${l.prefix ?? '?'}** · ${l.typ} — ${l.lead}${l.forslag ? ` → ${l.forslag}` : ''}`);
    ut.push(`  - Källa: ${l.kalla ?? `kommentarer (${l.belagg.length} st)`} · \`kalla=voc\` · belägg: ${l.belagg.join(', ')} · status: väntar`);
  }
  return `${ut.join('\n')}\n`;
}
