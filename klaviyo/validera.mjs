// Kontrollerna på varje byggt Klaviyo-mejl (ARKITEKTUR.md → Järnregler 4, 6, 7).
//
//   validera(mejl, { html, text, produkter, brand, lage, kalla, segment, trigger })
//     → { fel: [], varningar: [] }
//
// `fel` stoppar bygget (bygg.mjs går ut med 1). `varningar` visas i galleriet
// men stoppar inget. Varje rad säger VAR i mejlet felet sitter, på svenska,
// så Axel och copy-agenten kan rätta utan att läsa kod.
//
// `kalla` ('kampanj' | 'flode'), `segment` (kampanjens segmentnamn) och
// `trigger` (flödets trigger) används för block som bara får finnas i ett
// visst sammanhang: dynamiska block kräver ett metrikflöde, erbjudandet
// kräver köpare.

import { handlesI } from './mallar.mjs';

// Samma idé som kundtjanst/autosvar/svar.mjs: ett enda tankstreck syns direkt
// som AI-text (Axels feedback 2026-09-22). Intervall skrivs "5-10".
const TANKSTRECK = /[—–]/;

const FORBJUDNA_LOFTEN = [
  [/\b30\s*dagar/i, '"30 dagar" (returrätten heter "14 dagars ångerrätt")'],
  [/öppet\s*köp/i, '"öppet köp" (returrätten heter "14 dagars ångerrätt")'],
  [/garanterar/i, '"garanterar" (inga garantier i copyn)'],
  [/garanti/i, '"garanti" (ordet får inte stå ensamt, skriv "14 dagars ångerrätt")'],
  [/\blovar\b/i, '"lovar" (inga löften i copyn)'],
  [/\b7\s*[-–—]\s*14\b|\b7\s+till\s+14\s+dagar/i, '"7-14 dagar" (leveransen skrivs "5-10 arbetsdagar")'],
];

const ANDRA_VERKSAMHETER = /grillkliniken|mastern|snarkl[öo]s|grill/i;

const FALSK_BRADSKA = [/bara\s+i\s*dag/i, /endast\s+i\s*dag/i, /sista\s+chansen/i, /priset\s+går\s+upp/i, /bara\s+idag/i, /endast\s+idag/i];

// En summa i copyn: "299 kr", "1 299 kronor", "299:-", "299 SEK".
const KR_SUMMA = /\d[\d\s.,]*\s*(kr\b|kronor|:-|sek\b)/i;

// Prisbesparing, inte "spara tid": spara + summa/pengar, du sparar, rea,
// rabatt, nedsatt, ordinarie pris.
const SPARA = /\bspara\s+(\d|pengar|in\b)|\bdu\s+sparar\b|\bsparar\s+du\b|\brea\b|rabatt|nedsatt|ordinarie\s+pris/i;

const KOPARSEGMENT = /^(SEG_kopare(_\w+)?|SEG_flerkopare|SEG_vinback_90d)$/;

// All text kunden läser, med en etikett som säger var den står.
export function kundtexter(mejl) {
  const ut = [];
  (mejl.amnesrader ?? []).forEach((a, i) => ut.push({ var: `ämnesrad ${'ABCDEFG'[i] ?? i + 1}`, text: a?.text ?? '' }));
  ut.push({ var: 'förhandstext', text: mejl.forhandstext ?? '' });
  (mejl.block ?? []).forEach((b, i) => {
    const var_ = `block ${i + 1} (${b.typ})`;
    for (const [nyckel, varde] of [
      ['rubrik', b.rubrik],
      ['text', b.text],
      ['knapp', typeof b.knapp === 'string' ? b.knapp : b.knapp?.text],
    ]) {
      if (varde) ut.push({ var: `${var_} ${nyckel}`, text: String(varde) });
    }
    (b.punkter ?? []).forEach((p, j) => ut.push({ var: `${var_} punkt ${j + 1}`, text: String(p) }));
  });
  return ut;
}

// Djangotaggarna ska gå jämnt ut: {% if %}…{% endif %}, {% for %}…{% endfor %}.
export function kollaTaggar(html) {
  const PAR = { if: 'endif', for: 'endfor', catalog: 'endcatalog', with: 'endwith', block: 'endblock' };
  const SLUT = new Set(Object.values(PAR));
  const stack = [];
  const fel = [];
  for (const m of String(html ?? '').matchAll(/\{%-?\s*(\w+)/g)) {
    const tag = m[1];
    if (PAR[tag]) stack.push(tag);
    else if (SLUT.has(tag)) {
      const oppen = stack.pop();
      if (!oppen) fel.push(`{% ${tag} %} utan öppnande tagg`);
      else if (PAR[oppen] !== tag) fel.push(`{% ${oppen} %} stängs med {% ${tag} %}`);
    }
  }
  for (const o of stack) fel.push(`{% ${o} %} stängs aldrig`);
  const oppnaVar = (String(html ?? '').match(/\{\{/g) ?? []).length;
  const stangdaVar = (String(html ?? '').match(/\}\}/g) ?? []).length;
  if (oppnaVar !== stangdaVar) fel.push(`${oppnaVar} "{{" mot ${stangdaVar} "}}"`);
  return fel;
}

export function validera(mejl, { html = null, text = null, produkter = [], brand = null, lage = 'klaviyo', kalla = null, segment = null, trigger = null } = {}) {
  const fel = [];
  const varningar = [];
  const lista = Array.isArray(produkter) ? produkter : [...(produkter?.values?.() ?? [])];
  const perHandle = new Map(lista.map((p) => [p.handle, p]));
  const texter = kundtexter(mejl);

  // Metadata
  if (!String(mejl.memo ?? '').trim()) fel.push('Memo saknas (hypotesen: vad testas och varför).');
  const amnen = mejl.amnesrader ?? [];
  if (amnen.length < 3) fel.push(`Bara ${amnen.length} ämnesrader, minst 3 krävs (A/B/C).`);
  amnen.forEach((a, i) => {
    const n = String(a?.text ?? '').length;
    const var_ = `Ämnesrad ${'ABCDEFG'[i] ?? i + 1}`;
    if (!n) fel.push(`${var_} är tom.`);
    else if (n > 70) fel.push(`${var_} är ${n} tecken, max 70.`);
    else if (n > 50) varningar.push(`${var_} är ${n} tecken, mobilen klipper runt 50.`);
    if (!String(a?.begar ?? '').trim()) varningar.push(`${var_} saknar "begar" (vilket begär raden spelar på).`);
  });
  if (!String(mejl.forhandstext ?? '').trim()) fel.push('Förhandstexten är tom.');
  if (!Array.isArray(mejl.tretest) || !mejl.tretest.length) varningar.push('Tre-frågorstestet (tretest) är inte redovisat.');
  for (const t of mejl.tretest ?? []) {
    const nej = ['visualisera', 'falsifiera', 'ingen_annan'].filter((k) => t?.[k] === false);
    if (nej.length) fel.push(`Tre-frågorstestet: "${t.rad}" klarar inte ${nej.join(', ')}.`);
  }

  // Copyn
  const urgency = mejl.taggar?.urgency ?? 'ingen';
  for (const { var: var_, text: t } of texter) {
    if (TANKSTRECK.test(t)) fel.push(`Tankstreck i ${var_}: "${t.slice(0, 80)}". Skriv om utan — och –.`);
    for (const [re, vad] of FORBJUDNA_LOFTEN) if (re.test(t)) fel.push(`Förbjudet i ${var_}: ${vad}.`);
    if (ANDRA_VERKSAMHETER.test(t)) fel.push(`Annan verksamhet nämns i ${var_} (Grillkliniken/Mastern/SnarkLös/grill).`);
    if (urgency === 'ingen') for (const re of FALSK_BRADSKA) if (re.test(t)) fel.push(`Falsk brådska i ${var_}: "${t.match(re)[0]}" utan orsak i taggar.urgency.`);
    if (KR_SUMMA.test(t)) fel.push(`Kronbelopp i copyn (${var_}): "${t.match(KR_SUMMA)[0].trim()}". Priser kommer ur produktblocken.`);
    const mall = t.replace(/\{\{fornamn\}\}/g, '');
    if (/\{\{|\{%/.test(mall)) fel.push(`Mallspråk i copyn (${var_}): bara {{fornamn}} är tillåtet.`);
    if (/\{\{\s*f[oö]rnamn\s*\}\}/i.test(t) && !t.includes('{{fornamn}}')) fel.push(`Felstavad platshållare i ${var_}: skriv exakt {{fornamn}}.`);
  }

  // Blocken
  const handles = handlesI(mejl);
  for (const h of handles) if (!perHandle.has(h)) fel.push(`Produkten "${h}" finns inte i Shopify-datan (fel handle, eller avpublicerad).`);
  for (const h of handles) {
    const p = perHandle.get(h);
    if (p && p.kopbar === false) varningar.push(`Produkten "${h}" går inte att köpa just nu (slut).`);
  }
  const harSparaProdukt = [...handles].some((h) => {
    const p = perHandle.get(h);
    return p && p.jamforpris && p.jamforpris > p.pris;
  });
  (mejl.block ?? []).forEach((b, i) => {
    const egna = [b.handle, ...(b.handles ?? []), ...[b.bild, b.knapp?.lank, b.lank].map((x) => /^produkt:(.+)$/.exec(String(x ?? ''))?.[1])].filter(Boolean);
    const blocktext = [b.rubrik, b.text, typeof b.knapp === 'string' ? b.knapp : b.knapp?.text, ...(b.punkter ?? [])].filter(Boolean).join(' ');
    if (SPARA.test(blocktext)) {
      for (const h of egna) {
        const p = perHandle.get(h);
        if (p && !(p.jamforpris && p.jamforpris > p.pris)) fel.push(`Block ${i + 1} (${b.typ}) säger spara/rea, men "${h}" har inget jämförpris över priset.`);
      }
    }
    if (b.typ === 'dynamisk' && kalla === 'kampanj') fel.push(`Block ${i + 1}: dynamiska block fungerar bara i metrikstyrda flöden, inte i en kampanj.`);
    if (b.typ === 'dynamisk' && kalla === 'flode' && trigger && trigger.typ !== 'metrik') fel.push(`Block ${i + 1}: dynamiska block kräver ett flöde som startas av en metrik (händelsedata finns inte i list-/segmentflöden).`);
    if (b.typ === 'erbjudande') {
      if (kalla === 'kampanj') {
        const seg = segment ?? [];
        if (!seg.length || !seg.every((x) => KOPARSEGMENT.test(x))) varningar.push(`Block ${i + 1}: erbjudandet gäller bara köpare, men kampanjens segment (${seg.join(', ') || 'inga'}) är inte bara köparsegment (SEG_kopare*, SEG_flerkopare, SEG_vinback_90d).`);
      }
      if (kalla === 'flode') {
        const namn = [].concat(trigger?.metrik ?? []);
        if (trigger?.typ !== 'metrik' || !namn.some((n) => /placed order/i.test(n))) varningar.push(`Block ${i + 1}: erbjudandet gäller bara köpare, men flödet startas inte av Placed Order.`);
      }
    }
    if (b.typ === 'citat' && !b.handle) fel.push(`Block ${i + 1} (citat) saknar handle.`);
  });
  const mejlnivaText = [...amnen.map((a) => a?.text), mejl.forhandstext].join(' ');
  if (SPARA.test(mejlnivaText) && handles.size && !harSparaProdukt) fel.push('Ämnesrad eller förhandstext säger spara/rea, men ingen produkt i mejlet har jämförpris över priset.');

  // Den byggda HTML:en
  if (html != null) {
    const bytes = Buffer.byteLength(html, 'utf8');
    if (bytes > 100 * 1024) fel.push(`HTML:en är ${Math.round(bytes / 1024)} kB, Gmail klipper mejl över 102 kB. Max 100 kB.`);
    else if (bytes > 80 * 1024) varningar.push(`HTML:en är ${Math.round(bytes / 1024)} kB, nära Gmails gräns på 102 kB.`);
    if (lage === 'klaviyo') {
      if (!/\{%\s*unsubscribe/.test(html)) fel.push('Avregistreringslänken ({% unsubscribe %}) saknas i HTML:en.');
      if (!/organization\.full_address/.test(html)) fel.push('Adressen ({{ organization.full_address }}) saknas i HTML:en.');
      if (html.includes('{{fornamn}}')) fel.push('{{fornamn}} står kvar oersatt i HTML:en.');
      for (const f of kollaTaggar(html)) fel.push(`Mallspråket går inte jämnt ut i HTML:en: ${f}.`);
    }
  }
  if (text != null && lage === 'klaviyo') {
    if (text.includes('{{fornamn}}')) fel.push('{{fornamn}} står kvar oersatt i textversionen.');
    for (const f of kollaTaggar(text)) fel.push(`Mallspråket går inte jämnt ut i textversionen: ${f}.`);
  }
  if (brand && !brand.leverans_text) varningar.push('Brandfilen saknar leverans_text.');

  return { fel: [...new Set(fel)], varningar: [...new Set(varningar)] };
}
