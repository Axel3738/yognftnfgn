// Genererar kontorssokning/kallor.md ur rådatan.
//
//   node kontorssokning/kallor.js
//
// Syftet är att du ska kunna se exakt var jag letat, vad varje källa gav, vilka
// sidor som blockerade mig — och kunna klicka dig vidare manuellt där jag inte kom in.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));

const KALLNAMN = {
  'lokalnytt-hisingen': 'Lokalnytt.se — Hisingen',
  'lokalnytt-kungalv': 'Lokalnytt.se — Kungälv',
  lokalguiden: 'Lokalguiden.se — Hisingen + Kungälv',
  'verksamhetslokaler-lokalfinder': 'Verksamhetslokaler.se / Lokalfinder.se',
  'portally-workaround-kontorsformedling': 'Portally.com, Workaround.io, Kontorsformedling.se',
  'objektvision-kartlaggning': 'Objektvision.se (blockerad — kartlagd)',
  'fastighetsagare-castellum-platzer-balder-wallenstam': 'Fastighetsägare: Castellum/Eklandia, Platzer, Balder, Wallenstam',
  'fastighetsagare-stena-higab-alvstranden-aspelinramm-nextstep': 'Fastighetsägare: Stena, Higab, Älvstranden, Aspelin Ramm, Next Step',
  'fastighetsagare-catena-stendorren-bygggota-palmungmellin-bokab': 'Fastighetsägare: Catena, Stendörren, Bygg-Göta, Palmung Mellin, Bokab',
  'fritext-hisingen': 'Fritextsökningar — Hisingen',
  'fritext-kungalv-och-raa-yta': 'Fritextsökningar — Kungälv, råa ytor, nyproduktion',
  'niva3-e6-korridoren': 'Nivå 3 — E6-korridoren',
};

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();

function lank(url, text) {
  if (!url || !/^https?:\/\//.test(url)) return esc(text || url || '—');
  return `[${esc(text || 'öppna')}](${url})`;
}

export function byggKallor(raa, manuella = {}) {
  const loggar = raa.sokloggar || [];
  const objekt = [...(raa.godkanda || []), ...(raa.underkanda || [])];

  const perKalla = new Map();
  for (const l of loggar) {
    const k = l.kalla || 'okänd';
    if (!perKalla.has(k)) perKalla.set(k, []);
    perKalla.get(k).push(l);
  }

  const objektPerKalla = new Map();
  for (const o of objekt) {
    for (const u of o.kalla_url || []) {
      try {
        const host = new URL(u).hostname.replace(/^www\./, '');
        objektPerKalla.set(host, (objektPerKalla.get(host) || 0) + 1);
      } catch {}
    }
  }

  const rader = [];
  rader.push('# Källor');
  rader.push('');
  rader.push(`Hämtat ${raa.hamtad_datum}. Varje källa jag gått igenom, vad den gav, och en direkt söklänk så du kan titta manuellt.`);
  rader.push('');
  rader.push('Annonser blir inaktuella snabbt — kolla `hamtad_datum` på objektet innan du ringer.');
  rader.push('');

  // Sammanfattning
  rader.push('## Sammanfattning');
  rader.push('');
  rader.push('| Källa | Sökningar | Blockerade | Kandidater |');
  rader.push('|---|---:|---:|---:|');
  for (const [kalla, ls] of perKalla) {
    const blockerade = ls.filter((l) => l.blockerad).length;
    const traffar = ls.reduce((s, l) => s + (l.traffar || 0), 0);
    rader.push(`| ${esc(KALLNAMN[kalla] || kalla)} | ${ls.length} | ${blockerade} | ${traffar} |`);
  }
  rader.push('');

  // Objekt per domän — visar vilka sajter datan faktiskt kom ifrån
  if (objektPerKalla.size) {
    rader.push('## Vilka sajter datan kom ifrån');
    rader.push('');
    rader.push('| Domän | Objekt med käll-URL där |');
    rader.push('|---|---:|');
    for (const [host, n] of [...objektPerKalla].sort((a, b) => b[1] - a[1])) {
      rader.push(`| ${esc(host)} | ${n} |`);
    }
    rader.push('');
  }

  // Blockerade sidor först — det är dem du behöver titta på själv
  const blockerade = loggar.filter((l) => l.blockerad);
  rader.push('## Blockerade sidor — kolla dessa manuellt');
  rader.push('');
  if (!blockerade.length) {
    rader.push('Ingen källa blockerade den här körningen.');
  } else {
    rader.push('Sidorna nedan gick inte att läsa automatiskt (bot-skydd, inloggning eller betalvägg). Länkarna öppnar rätt sökning direkt i webbläsaren.');
    rader.push('');
    rader.push('| Sökning | Källa | Öppna | Notering |');
    rader.push('|---|---|---|---|');
    for (const l of blockerade) {
      rader.push(`| ${esc(l.vad)} | ${esc(KALLNAMN[l.kalla] || l.kalla)} | ${lank(l.url)} | ${esc(l.notering)} |`);
    }
  }
  rader.push('');

  // Manuellt kartlagda sidor jag inte kom in på
  for (const [namn, m] of Object.entries(manuella)) {
    if (namn.startsWith('_')) continue;
    rader.push(`## ${namn.charAt(0).toUpperCase() + namn.slice(1)} — kartlagd, inte hämtad`);
    rader.push('');
    rader.push(`**Varför:** ${esc(m.orsak)}`);
    rader.push('');
    rader.push(`Kontrollerat ${m.kontrollerat}. Länkarna nedan fungerar i din webbläsare — annonsantalen är sajtens egna siffror den dagen.`);
    rader.push('');
    rader.push('| Nivå | Sökning | Annonser | Öppna |');
    rader.push('|---:|---|---:|---|');
    for (const l of m.lankar || []) {
      rader.push(`| ${l.niva} | ${esc(l.vad)} | ${l.annonser ?? '—'} | ${lank(l.url, 'öppna')} |`);
    }
    rader.push('');
    if (m.tips) rader.push(`**Tips:** ${esc(m.tips)}`);
    rader.push('');
  }

  // Full logg
  rader.push('## Full sökningslogg');
  rader.push('');
  for (const [kalla, ls] of perKalla) {
    rader.push(`### ${KALLNAMN[kalla] || kalla}`);
    rader.push('');
    rader.push('| Sökning | Träffar | Läge | Öppna | Notering |');
    rader.push('|---|---:|---|---|---|');
    for (const l of ls) {
      rader.push(
        `| ${esc(l.vad)} | ${l.traffar ?? 0} | ${l.blockerad ? '⛔ blockerad' : l.traffar ? '✅ träff' : '➖ noll'} | ${lank(l.url)} | ${esc(l.notering)} |`
      );
    }
    rader.push('');
  }

  // Bortsorterade objekt
  const bort = raa.underkanda || [];
  rader.push('## Bortsorterade objekt');
  rader.push('');
  if (!bort.length) {
    rader.push('Inga objekt föll bort i granskningen.');
  } else {
    rader.push('Objekt som hittades men inte kom med i `objekt.json`, och varför.');
    rader.push('');
    rader.push('| Objekt | Område | Orsak | Källa |');
    rader.push('|---|---|---|---|');
    for (const o of bort) {
      const orsak = o.granskning?.motivering || o.beskrivning || 'kunde inte verifieras';
      rader.push(`| ${esc(o.titel)} | ${esc(o.omrade)} | ${esc(orsak).slice(0, 180)} | ${lank(o.kalla_url?.[0])} |`);
    }
  }
  rader.push('');

  return rader.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raa = JSON.parse(readFileSync(join(HAR, 'raa.json'), 'utf8'));
  let manuella = {};
  try {
    manuella = JSON.parse(readFileSync(join(HAR, 'manuella-lankar.json'), 'utf8'));
  } catch {}
  const md = byggKallor(raa, manuella);
  writeFileSync(join(HAR, 'kallor.md'), md);
  console.log(`kallor.md skriven (${md.split('\n').length} rader)`);
}
