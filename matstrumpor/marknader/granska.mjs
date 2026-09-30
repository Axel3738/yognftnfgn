// granska.mjs — den mekaniska granskningen av en översättning mot det svenska
// underlaget. Ren logik, inget nät. Körs av översättningsgranskaren (subagent)
// och av bygg.mjs innan något registreras: en fil med FEL registreras aldrig.
//
//   node matstrumpor/marknader/granska.mjs <sv.json> <locale.json> <locale>
//   exit 0 = inga fel (varningar kan finnas), exit 1 = fel
//
// Vad som mäts (samma regler som REGLER.md i översättningsuppdraget):
//   nycklar   exakt samma nyckelmängd
//   tomt      tomt värde bara där det är tillåtet (ms-sista-dag)
//   html      samma taggar i samma ordning, samma href/src
//   liquid    samma {{ }} / {% %} tecken för tecken
//   forbjudet Sjöhed, Harestad, sushisock, Bäverbutiken
//   sanning   "Sverige" i frakt-/leveransrader, "SEK"/"kr" i belopp, gamla leveranstider
//   siffror   talen i källan finns i översättningen (30, 14, 5–10, 3 700 …)
//   svenska   svenska funktionsord kvar i en text som skulle bytt språk
//   oforandrat text identisk med svenskan där det inte är ett egennamn/tekniskt värde

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BARA_FORENKLAD } from '../../pipeline/sprak.mjs';

export const TILLATET_TOMT = new Set(['liquid.ms-sista-dag.fars_dag', 'liquid.ms-sista-dag.jul']);
export const FORBJUDET = ['Sjöhed', 'Harestad', 'sushisock', 'Bäverbutiken', 'baverbutiken', 'Bäverbutikens'];
// Identiskt med svenskan är okej för egennamn, adresser, e-post, tal och korta tekniska värden.
// "gratis", "Egenskap", "Pris" är samma ord på bokmål och danska (falsklarm 2026-09-27, nb-A2);
// "Share" och "Collections" är redan engelska i källan (temats standardetiketter), så engelskan blir identisk.
const OK_IDENTISKT = /^(Matstrumpor(\.se)?|STONEBITE ECOM AB|Standard|Klarna|Postnord|PostNord|Shop Pay|PayPal|Apple Pay|Google Pay|One Size|Ja|Nej|Par|Pizza|Donuts?|Sushi|Hamburger|gratis|Mest gratis|Egenskap|Pris|Om oss|Share|Collections|Free shipping|kundsupport@matstrumpor\.se|\d[\d ,.:–-]*( kr)?|Info(rmation)?|Kontakt|Profil|Instagram|Facebook|TikTok|Org\.nr.*|Wide Pia|Jonas|Gittan|Annika|Standard)$/i;

const taggar = (s) => [...String(s ?? '').matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?>/g)].map((m) => `${m[0].startsWith('</') ? '/' : ''}${m[1].toLowerCase()}`);
const attr = (s, namn) => [...String(s ?? '').matchAll(new RegExp(`\\s${namn}=["']([^"']*)["']`, 'g'))].map((m) => m[1]);
const liquid = (s) => [...String(s ?? '').matchAll(/\{\{[^}]*\}\}|\{%[^%]*%\}/g)].map((m) => m[0].replace(/\s+/g, ' '));
const tal = (s) => [...String(s ?? '').replace(/<[^>]+>/g, ' ').matchAll(/\d[\d  ]*(?:[.,]\d+)?/g)].map((m) => m[0].replace(/[  ]/g, '').replace(',', '.')).filter((t) => t.length > 0 && !/^\d{4}-\d{2}-\d{2}/.test(t));

const SVENSKA_ORD = {
  // funktionsord som inte finns på målspråket i samma form. ⚠️ Ord som är
  // gemensamma räknas inte: "eller", "vårt" och "kunder" är korrekt bokmål och
  // danska, "med dig" korrekt danska — de gav falska larm 2026-09-27 (da-B).
  nb: /\b(och|att|från|inte|är|också|med dig|våra|beställning|leverans|dagar|frakt inom|öppet köp)\b/i,
  da: /\b(och|att|från|inte|är|också|våra|beställning|leverans|dagar|frakt inom|öppet köp|strumpor)\b/i,
  fi: /\b(och|att|från|inte|är|också|eller|med|för|till|kunder|beställning|leverans|dagar|frakt|strumpor|köp)\b/i,
  en: /\b(och|att|från|inte|är|också|eller|med|för|till|våra|vårt|kunder|beställning|leverans|dagar|frakt|strumpor|köp|kr)\b/i,
};

// Japanska och traditionell kinesiska (2026-09-30, Japan och Taiwan). Ordgränser finns inte, så
// det mäts på skriften och på fasta fraser. REGLER-ASIEN.md är facit.
const CJK_LOCALE = /^(ja|zh)/i;
const KANA = /[\u3040-\u30ff]/u;
const HANGUL = /[\uac00-\ud7af]/u;
const SVERIGE_CJK = /スウェーデン|瑞典|北欧|北歐/u;
const FRAKT_CJK = /送料|配送|発送|お届け|運費|運送|配送|寄送|免運/u;
const VALUTA_CJK = /[¥￥]|NT\$|新台幣|台幣|日圓|日幣|クローナ|克朗|\d[\d,，]*\s*(円|元|ドル)/u;
// Policyer och om oss bär bolagets land; japanskans hero börjar med スウェーデン発のブランド (REGLER-ASIEN
// punkt 5) och får då säga hur lådan kommer fram utan att det blir en fraktrad.
const POLICY_NYCKEL = /^(policy|sida\.(integritetspolicy|retur|fraktpolicy|om-oss|villkor)|tema\.index\.hero\.t\.text$)/;

/** Ren: fynd i en japansk/kinesisk text. Förenklade tecken och kana i taiwanesisk text, hangul, belopp
 *  i en valuta, och Sverige i en frakt-/leveransrad (bolagets land i en policy och det svenska varumärket
 *  i japanskans hero/om oss är rätt). */
export function granskaCjk(k, ren, locale) {
  const ut = [];
  const zh = /^zh/i.test(locale);
  if (zh) {
    const f = ren.match(BARA_FORENKLAD);
    if (f) ut.push({ nyckel: k, typ: 'skrift', text: `förenklade tecken (${[...new Set(f)].join('')}) — Taiwan läser traditionell kinesiska` });
    if (KANA.test(ren)) ut.push({ nyckel: k, typ: 'skrift', text: 'japansk kana i kinesisk text' });
  }
  if (HANGUL.test(ren)) ut.push({ nyckel: k, typ: 'skrift', text: 'koreanska tecken' });
  if (VALUTA_CJK.test(ren)) ut.push({ nyckel: k, typ: 'sanning', text: `ett belopp eller en valuta ("${ren.match(VALUTA_CJK)[0]}") — valutan är aldrig ett belopp (REGLER-ASIEN.md punkt 2)` });
  if (SVERIGE_CJK.test(ren) && FRAKT_CJK.test(ren) && !POLICY_NYCKEL.test(k)) {
    ut.push({ nyckel: k, typ: 'sanning', text: 'nämner Sverige i en frakt-/leveransrad — fraktrutan skriver landet själv (REGLER-ASIEN.md punkt 1)' });
  }
  if (!zh && /スウェーデン製|瑞典製/u.test(ren)) ut.push({ nyckel: k, typ: 'sanning', text: 'スウェーデン製 — varumärket är svenskt, inte strumporna (REGLER-ASIEN.md punkt 5)' });
  return ut;
}

/** Granskar en översättning. → { fel: [{nyckel, typ, text}], varningar: [...] } */
export function granska(sv, mal, locale) {
  const fel = [];
  const varn = [];
  const svN = Object.keys(sv).filter((k) => !k.startsWith('_'));
  const malN = Object.keys(mal ?? {}).filter((k) => !k.startsWith('_'));
  for (const k of svN) if (!(k in (mal ?? {}))) fel.push({ nyckel: k, typ: 'nycklar', text: 'saknas i översättningen' });
  for (const k of malN) if (!(k in sv)) fel.push({ nyckel: k, typ: 'nycklar', text: 'finns inte i svenskan' });
  // Shopify skriver portugisiskan som `pt-PT` — ordlistan slås upp på språkdelen.
  const svenska = SVENSKA_ORD[locale] ?? SVENSKA_ORD[String(locale).split('-')[0]] ?? SVENSKA_ORD.en;

  for (const k of svN) {
    const s = sv[k];
    const m = mal?.[k];
    if (typeof m !== 'string') { if (k in (mal ?? {})) fel.push({ nyckel: k, typ: 'typ', text: 'värdet är inte en sträng' }); continue; }
    if (!m.trim()) {
      if (!TILLATET_TOMT.has(k)) fel.push({ nyckel: k, typ: 'tomt', text: 'tomt värde' });
      continue;
    }
    for (const f of FORBJUDET) if (m.includes(f)) fel.push({ nyckel: k, typ: 'forbjudet', text: `innehåller "${f}"` });

    // HTML: samma taggar, samma href/src.
    const ts = taggar(s), tm = taggar(m);
    if (ts.join(' ') !== tm.join(' ')) fel.push({ nyckel: k, typ: 'html', text: `taggarna skiljer: sv ${ts.length} (${ts.slice(0, 6).join(' ')}…) mot ${tm.length} (${tm.slice(0, 6).join(' ')}…)` });
    for (const a of ['href', 'src']) {
      const as = attr(s, a), am = attr(m, a);
      if (as.join('|') !== am.join('|')) fel.push({ nyckel: k, typ: 'html', text: `${a} skiljer: ${as.join(', ').slice(0, 120)} → ${am.join(', ').slice(0, 120)}` });
    }
    // Liquid tecken för tecken.
    const ls = liquid(s), lm = liquid(m);
    if (ls.join('|') !== lm.join('|')) fel.push({ nyckel: k, typ: 'liquid', text: `Liquid skiljer: ${ls.join(' ').slice(0, 100)} → ${lm.join(' ').slice(0, 100)}` });
    // Listor med | och ikon:-prefix.
    if (s.includes('|') && !/^</.test(s.trim())) {
      const ds = s.split('|'), dm = m.split('|');
      if (ds.length !== dm.length) fel.push({ nyckel: k, typ: 'lista', text: `${ds.length} delar i svenskan, ${dm.length} i översättningen` });
      const ps = ds.map((d) => (d.match(/^\s*([a-z-]+):/) ?? [])[1] ?? ''), pm = dm.map((d) => (d.match(/^\s*([a-z-]+):/) ?? [])[1] ?? '');
      if (ps.join(',') !== pm.join(',')) fel.push({ nyckel: k, typ: 'lista', text: `ikon-prefixen skiljer: ${ps.join(',')} → ${pm.join(',')}` });
    }
    // Marknadens sanning.
    if (/\b(Sverige|Sweden|Sverige|Ruotsi|Sverige)\b/i.test(m) && /(frakt|fragt|shipping|toimitus|lever|deliver|virkedag|hverdag|arkipäiv|business day)/i.test(m) && !/^(policy|sida\.(integritetspolicy|retur|fraktpolicy))/.test(k)) {
      fel.push({ nyckel: k, typ: 'sanning', text: 'nämner Sverige i en frakt-/leveransrad — ska vara marknadens sanning (REGLER.md rad 3)' });
    }
    if (/\bSEK\b/.test(m) && !/^policy\./.test(k)) fel.push({ nyckel: k, typ: 'sanning', text: 'SEK i översättningen' });
    if (/\bSEK\b/.test(m) && /^policy\./.test(k)) varn.push({ nyckel: k, typ: 'sanning', text: 'SEK står kvar i policyn — kolla att det är "kunden betalar i sin valuta", inte ett belopp' });
    if (/\d\s*kr\b/.test(m) && !/150,00 kr/.test(m)) fel.push({ nyckel: k, typ: 'sanning', text: 'ett kronbelopp ("kr") i översättningen' });
    if (/7[–-]14/.test(m)) fel.push({ nyckel: k, typ: 'sanning', text: '7–14 dagar — löftet är 5–10 arbetsdagar (CLAUDE.md)' });
    // Siffror.
    const tS = tal(s), tM = tal(m);
    for (const t of new Set(tS)) {
      if (['150.00'].includes(t)) continue;
      const nS = tS.filter((x) => x === t).length, nM = tM.filter((x) => x === t || x === t.replace('.', ',') || x.replace(/[,.]/g, '') === t.replace(/[,.]/g, '')).length;
      if (nM < nS && !TILLATET_TOMT.has(k)) varn.push({ nyckel: k, typ: 'siffror', text: `talet ${t} står ${nS} gånger i svenskan, ${nM} i översättningen` });
    }
    // Svenska kvar / oförändrat.
    const ren = m.replace(/<[^>]+>/g, ' ').replace(/\{\{[^}]*\}\}|\{%[^%]*%\}/g, ' ');
    if (ren.trim() === s.replace(/<[^>]+>/g, ' ').replace(/\{\{[^}]*\}\}|\{%[^%]*%\}/g, ' ').trim() && !OK_IDENTISKT.test(m.trim()) && m.trim().length > 3) {
      fel.push({ nyckel: k, typ: 'oforandrat', text: `identiskt med svenskan: "${m.slice(0, 60)}"` });
    }
    const svTraff = ren.match(svenska);
    if (svTraff && m.length > 12 && !OK_IDENTISKT.test(m.trim())) {
      // På nb/da är många ord gemensamma — bara ord som INTE finns i målspråket räknas ovan.
      fel.push({ nyckel: k, typ: 'svenska', text: `svenskt ord kvar: "${svTraff[0]}" i "${ren.trim().slice(0, 80)}"` });
    }
    if (/[äö]/.test(ren) && (locale === 'nb' || locale === 'da') && !/^(paket|option|produkt|kollektion)\./.test(k) === false) {
      // ä/ö finns inte i norska/danska (æ/ø/å gör det). Egennamn undantagna.
      if (!/Göteborg|Matstrumpor|Äkta ätpinnar/.test(ren)) varn.push({ nyckel: k, typ: 'svenska', text: 'ä eller ö i norsk/dansk text' });
    }
    if (/[äö]/.test(ren) && (locale === 'nb' || locale === 'da' || locale === 'en') && !/Göteborg|Matstrumpor/.test(ren)) varn.push({ nyckel: k, typ: 'svenska', text: `ä/ö i ${locale}-text: "${ren.trim().slice(0, 60)}"` });
    if (CJK_LOCALE.test(locale)) for (const f of granskaCjk(k, ren, locale)) (f.varning ? varn : fel).push(f);
  }
  return { fel, varningar: varn };
}

export function skrivUt(r) {
  for (const f of r.fel) console.log(`❌ ${f.nyckel} [${f.typ}] ${f.text}`);
  for (const v of r.varningar) console.log(`⚠️  ${v.nyckel} [${v.typ}] ${v.text}`);
  console.log(`${r.fel.length} fel, ${r.varningar.length} varningar`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [svFil, malFil, locale] = process.argv.slice(2);
  if (!svFil || !malFil || !locale) { console.error('Användning: node matstrumpor/marknader/granska.mjs <sv.json> <locale.json> <locale>'); process.exit(2); }
  const r = granska(JSON.parse(readFileSync(svFil, 'utf8')), JSON.parse(readFileSync(malFil, 'utf8')), locale);
  skrivUt(r);
  process.exit(r.fel.length > 0 ? 1 : 0);
}
