// Bygger veckorapporten. Ren strängbyggnad — inget nätverk, inga sidoeffekter.

import { TROSKLAR } from './konfig.mjs';

const IKON = {
  rod: '🔴',
  gul: '🟡',
  gron: '🟢',
  'for-lite-data': '⚪',
};

// Status bärs alltid av ikon OCH text, aldrig av färg ensam.
const ORD = {
  rod: 'ÖVER GRÄNSEN',
  gul: 'VARNING',
  gron: 'OK',
  'for-lite-data': 'för lite data',
};

export function procent(rate, decimaler = 2) {
  if (rate === null || rate === undefined) return '–';
  return `${(rate * 100).toFixed(decimaler).replace('.', ',')} %`;
}

export function kronor(belopp) {
  if (belopp === null || belopp === undefined) return '–';
  return `${Math.round(belopp).toLocaleString('sv-SE')} kr`;
}

function trendpil(forandring) {
  if (forandring === null || forandring === undefined) return '';
  if (forandring > 0) return ` ↑${forandring}`;
  if (forandring < 0) return ` ↓${Math.abs(forandring)}`;
  return ' →';
}

export function byggRapport({
  datum,
  butik,
  produkter = [],
  larm = [],
  arenden = [],
  mailStatus,
  fonsterDagar,
}) {
  const rader = [];
  const akuta = larm.filter((l) => l.allvar === 'akut');
  const hoga = larm.filter((l) => l.allvar === 'hog');

  rader.push(`# Kundvakten — ${datum}`);
  rader.push('');
  rader.push(
    `Underlag: ${fonsterDagar} dagar bakåt. Butik: Bäverbutiken (bäverbutiken.se).`
  );
  rader.push('');

  // Larmet först — det är hela poängen med rutinen.
  if (mailStatus && !mailStatus.ok) {
    rader.push(`> ⚠️ **Mailen gick inte att läsa: ${mailStatus.fel}**`);
    rader.push('> Allt nedan bygger bara på Shopify. Mailärendena saknas.');
    rader.push('');
  }

  rader.push('## Läget');
  rader.push('');
  // Tre decimaler här med flit: butiksraten ligger ofta så nära en tröskel att
  // två decimaler får nivån att se fel ut (0,899 % avrundas till 0,90 % men är
  // gul, inte röd).
  rader.push(
    `${IKON[butik.niva]} Butikens chargeback-rate: **${procent(butik.rate, 3)}** ` +
      `(${butik.tvister} tvister på ${butik.ordrar} ordrar) — ${ORD[butik.niva]}`
  );
  rader.push('');
  rader.push(
    `Gränserna: grön under ${procent(TROSKLAR.rate_gul, 1)}, ` +
      `gul ${procent(TROSKLAR.rate_gul, 1)}–${procent(TROSKLAR.rate_rod, 1)}, ` +
      `röd från ${procent(TROSKLAR.rate_rod, 1)}. ` +
      'Kortnätverken sätter butiker i övervakningsprogram runt den röda nivån.'
  );
  rader.push('');
  rader.push(`Akuta larm: **${akuta.length}**. Höga: **${hoga.length}**.`);
  rader.push('');

  // 1. Åtgärdslistan
  rader.push('## Åtgärda nu');
  rader.push('');
  if (akuta.length === 0 && hoga.length === 0) {
    rader.push('Inget akut. Inga obesvarade tvister, inga liggande ordrar.');
  } else {
    for (const l of [...akuta, ...hoga].slice(0, 25)) {
      const markor = l.allvar === 'akut' ? '🔴' : '🟡';
      const belopp = l.belopp ? ` (${kronor(l.belopp)})` : '';
      rader.push(`- ${markor} ${l.text}${belopp}`);
    }
    const kvar = akuta.length + hoga.length - 25;
    if (kvar > 0) rader.push(`- … och ${kvar} till.`);
  }
  rader.push('');

  // 2. Produktrankningen
  rader.push('## Chargeback-risk per produkt');
  rader.push('');
  rader.push(
    'Rangordnad på **pengar i risk**, inte på rate. En hög rate på fyra ordrar ' +
      'är inte ett problem — den är för lite data.'
  );
  rader.push('');
  rader.push(
    '⚠️ Raterna är ett **golv, inte ett tak**. En tvist kommer typiskt veckor ' +
      'efter ordern, så ordrar från fönstrets slut har inte hunnit få sina ' +
      'tvister än. Ju nyare produkten är, desto mer underskattad är dess rate.'
  );
  rader.push('');
  rader.push('| | Produkt | Tvister | Ordrar | Rate | Pengar i risk | Obesvarade |');
  rader.push('|---|---|---:|---:|---:|---:|---:|');
  for (const p of produkter.slice(0, 20)) {
    const namn = p.blandadeOrdrar > 0
      ? `${p.produkt} ¹`
      : p.produkt;
    rader.push(
      `| ${IKON[p.niva]} | ${namn} | ${p.tvister} | ${p.ordrar ?? '–'} | ` +
        `${procent(p.rate)} | ${kronor(p.pengarIRisk)} | ${p.obesvarade} |`
    );
  }
  rader.push('');
  if (produkter.some((p) => p.blandadeOrdrar > 0)) {
    rader.push(
      '¹ Minst en tvist kom från en order med flera produkter. Vilken produkt ' +
        'som utlöste tvisten går inte att veta — beloppet är delat mellan dem.'
    );
    rader.push('');
  }

  // 3. Mailärendena
  rader.push('## Vad kunderna mailar om');
  rader.push('');
  if (mailStatus && !mailStatus.ok) {
    rader.push('Kunde inte läsas den här körningen.');
  } else if (arenden.length === 0) {
    rader.push('Inga mail i fönstret.');
  } else {
    rader.push('| Ärende | Antal | Mot förra veckan |');
    rader.push('|---|---:|---|');
    for (const a of arenden) {
      rader.push(`| ${a.namn} | ${a.antal} |${trendpil(a.forandring) || ' –'} |`);
    }
  }
  rader.push('');

  return rader.join('\n');
}

// Kort version till Discord. Max det som får plats utan att scrollas bort.
export function byggDiscordtext({ datum, butik, larm = [], produkter = [] }) {
  const akuta = larm.filter((l) => l.allvar === 'akut');
  const varst = produkter.find((p) => p.niva === 'rod' || p.niva === 'gul');
  const delar = [
    `**Kundvakten ${datum}**`,
    `${IKON[butik.niva]} Chargeback-rate: ${procent(butik.rate)} ` +
      `(${butik.tvister}/${butik.ordrar}) — ${ORD[butik.niva]}`,
    `🔴 Akut: ${akuta.length} st`,
  ];
  if (varst) {
    delar.push(
      `Sämst: ${varst.produkt} — ${procent(varst.rate)}, ${kronor(varst.pengarIRisk)} i risk`
    );
  }
  for (const l of akuta.slice(0, 5)) delar.push(`• ${l.text}`);
  if (akuta.length > 5) delar.push(`• … och ${akuta.length - 5} till`);
  return delar.join('\n');
}
