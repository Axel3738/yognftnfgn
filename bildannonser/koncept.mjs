// Konceptbasen för Bäverbutikens bildannonser — väljaren.
//
// Problemet den löser (mätt 2026-10-03 i MagiBorsten): 353 aktiva bildannonser
// med varierande vinklar (PD, CS, SP, FD …) men EN enda layout — rubrik i topp,
// produkten i mitten, priset i botten. Briefens fem rader (Headline, Sub-line,
// Badge, Bottom band, CTA) är i sig mallen, och rutinens prompt ber alltid om
// "lugna ytor i topp och botten". Resultatet: 315 av 353 bilder under 300 kr.
//
// Biblioteket ligger i bildannonser/koncept/koncept.json (källa per koncept:
// Evolves 13 mallar, Evolves BFCM-dokument och kontots egna vinnare). Den här
// modulen väljer koncept åt en brief, skriver prompt- och specskelett, och
// stoppar en jobbfil där samma produkt får samma koncept två gånger.
//
//   node bildannonser/koncept.mjs --lista
//   node bildannonser/koncept.mjs --valj --vinkel CS --produkt Takoverdrag [--onskat K07] [--scen "…"] [--produkt-beskrivning "…"]
//   node bildannonser/koncept.mjs --kontroll --jobb <jobb.json>
//   node bildannonser/koncept.mjs --logga --jobb <jobb.json>
//
// Raderna i annonsen kommer ALDRIG härifrån — de är briefens, ordagrant.
import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = path.dirname(fileURLToPath(import.meta.url));
export const BIBLIOTEK = path.join(HAR, 'koncept', 'koncept.json');
export const LOGG = path.join(HAR, 'koncept', 'logg.jsonl');

// Speglar ZONER och STILAR i bildannonser/text.py. Ett test jämför dem mot
// filen, så listan kan inte glida isär tyst.
export const ZONER = new Set(['topp', 'topp-under', 'botten', 'botten-over', 'mitt',
  'vanster-mitt', 'hoger-mitt', 'vanster-nere', 'hoger-nere']);
export const STILAR = new Set(['rubrik', 'underrub', 'brod', 'etikett', 'knapp', 'citat',
  'attrib', 'badge', 'lista', 'pris', 'prisover']);
const BLOCKNYCKLAR = new Set(['zon', 'stil', 'storlek', 'rader', 'meningar', 'platta', 'ljus', 'stjarnor', 'text']);

// Hur många av produktens senaste koncept som är spärrade för nästa val.
export const SPARR_SENASTE = 3;

export function lasKoncept(fil = BIBLIOTEK) {
  const bib = JSON.parse(readFileSync(fil, 'utf8'));
  granskaBibliotek(bib);
  return bib;
}

export function granskaBibliotek(bib) {
  if (!bib || !Array.isArray(bib.koncept) || bib.koncept.length === 0) {
    throw new Error('Biblioteket saknar listan "koncept".');
  }
  const sedda = new Set();
  for (const k of bib.koncept) {
    const var_ = (f) => `Koncept ${k.id ?? '?'} (${k.namn ?? '?'}): ${f}`;
    for (const falt of ['id', 'namn', 'kalla', 'funnel', 'vinklar', 'status', 'bildprompt', 'block', 'kraver']) {
      if (k[falt] === undefined || k[falt] === null || k[falt] === '') throw new Error(var_(`saknar "${falt}".`));
    }
    if (sedda.has(k.id)) throw new Error(var_('id:t finns två gånger.'));
    sedda.add(k.id);
    if (!['klar', 'tillagg'].includes(k.status)) throw new Error(var_(`okänd status "${k.status}".`));
    if (k.status === 'tillagg' && !k.tillagg_text_py) throw new Error(var_('status "tillagg" utan tillagg_text_py.'));
    if (!Array.isArray(k.vinklar) || k.vinklar.length === 0) throw new Error(var_('vinklar är tom.'));
    if (!Array.isArray(k.block) || k.block.length === 0) throw new Error(var_('block är tomt.'));
    for (const b of k.block) {
      for (const nyckel of Object.keys(b)) {
        if (!BLOCKNYCKLAR.has(nyckel)) throw new Error(var_(`blocknyckeln "${nyckel}" läses inte av text.py.`));
      }
      if (!STILAR.has(b.stil)) throw new Error(var_(`okänd stil "${b.stil}".`));
      if (k.status === 'klar' && !ZONER.has(b.zon)) {
        throw new Error(var_(`zonen "${b.zon}" finns inte i text.py — konceptet kan inte vara "klar".`));
      }
    }
  }
  return true;
}

// Produkten är annonsprefixet: allt före första understrecket (naming-convention).
export function produktUr(namn) {
  return String(namn).split('_')[0];
}

export function lasHistorik(loggfil = LOGG) {
  if (!existsSync(loggfil)) return [];
  return readFileSync(loggfil, 'utf8')
    .split('\n')
    .filter((r) => r.trim())
    .map((r) => JSON.parse(r));
}

// Vilket koncept får den här briefen?
//  - Säger briefen själv (raden "Koncept: K07"): det, om det finns och är klart.
//  - Annars: ett klart koncept som passar vinkeln, som produkten inte fått de
//    senaste SPARR_SENASTE gångerna, det minst använda först. Ordningen i filen
//    avgör vid lika.
export function valjKoncept({ vinkel, produkt, historik = [], onskat = null, bib }) {
  const alla = bib.koncept;
  const klara = alla.filter((k) => k.status === 'klar');
  if (onskat) {
    const o = String(onskat).trim().toLowerCase();
    const k = alla.find((x) => x.id.toLowerCase() === o || x.namn.toLowerCase() === o);
    if (!k) throw new Error(`Briefen ber om konceptet "${onskat}" som inte finns i biblioteket.`);
    if (k.status !== 'klar') {
      throw new Error(`Briefen ber om ${k.id} (${k.namn}) som kräver ett tillägg i text.py: ${k.tillagg_text_py}`);
    }
    return { koncept: k, orsak: 'briefen bad om det' };
  }
  const egna = historik
    .filter((r) => r.produkt === produkt)
    .sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
  const senaste = [...new Set(egna.map((r) => r.koncept))].slice(0, SPARR_SENASTE);
  const antal = new Map();
  for (const r of egna) antal.set(r.koncept, (antal.get(r.koncept) || 0) + 1);

  let kandidater = klara.filter((k) => k.vinklar.includes(vinkel));
  let orsak = `vinkeln ${vinkel}`;
  if (kandidater.length === 0) {
    kandidater = klara;
    orsak = `inget koncept bär vinkeln ${vinkel} — hela biblioteket`;
  }
  let fria = kandidater.filter((k) => !senaste.includes(k.id));
  if (fria.length === 0) {
    // Färre koncept än spärren: undvik bara det allra senaste.
    fria = kandidater.filter((k) => k.id !== senaste[0]);
    if (fria.length === 0) fria = kandidater;
  }
  fria.sort((a, b) => (antal.get(a.id) || 0) - (antal.get(b.id) || 0));
  const k = fria[0];
  const g = antal.get(k.id) || 0;
  return {
    koncept: k,
    orsak: `${orsak}; ${g === 0 ? 'aldrig använt' : `använt ${g} gånger`} för ${produkt}; spärrade: ${senaste.join(', ') || 'inga'}`,
  };
}

// Prompten till kie.ai: konceptets skelett med produktbeskrivningen ur
// referensfotot och briefens scen insatta. Null när konceptet inte genererar
// (stickern på vinnaren, textannonsen).
export function promptSkelett(koncept, { produktBeskrivning = '{PRODUKT}', scen = '{SCEN}' } = {}) {
  if (/^\(ingen generering/.test(koncept.bildprompt)) return null;
  return koncept.bildprompt.replaceAll('{PRODUKT}', produktBeskrivning).replaceAll('{SCEN}', scen);
}

// Specskelettet till text.py: konceptets block med tomma textfält. Rutinen
// fyller "text" ordagrant ur briefen — aldrig härifrån.
export function specSkelett(koncept) {
  return koncept.block.map((b) => ({ ...b, text: '' }));
}

// Jobbfilen får inte ge samma produkt samma koncept två gånger i en körning,
// och varje jobb ska bära ett klart koncept. Returnerar en lista med fel.
export function kontrolleraJobbfil(data, bib) {
  const fel = [];
  const jobb = Array.isArray(data?.jobb) ? data.jobb : [];
  const sedda = new Map();
  for (const j of jobb) {
    if (!j.koncept) {
      fel.push(`${j.namn}: saknar koncept.`);
      continue;
    }
    const k = bib.koncept.find((x) => x.id === j.koncept);
    if (!k) {
      fel.push(`${j.namn}: konceptet ${j.koncept} finns inte i biblioteket.`);
      continue;
    }
    if (k.status !== 'klar') {
      fel.push(`${j.namn}: ${k.id} kräver ett tillägg i text.py (${k.tillagg_text_py}).`);
      continue;
    }
    const nyckel = `${produktUr(j.namn)}|${j.koncept}`;
    if (sedda.has(nyckel) && j.koncept_kalla !== 'brief') {
      fel.push(`${j.namn}: ${produktUr(j.namn)} får ${j.koncept} två gånger i samma körning (först ${sedda.get(nyckel)}). Bara en brief som uttryckligen ber om konceptet (koncept_kalla: "brief") får upprepa det.`);
    }
    sedda.set(nyckel, sedda.get(nyckel) || j.namn);
  }
  return fel;
}

export function loggrader(data) {
  const datum = data.datum || new Date().toISOString().slice(0, 10);
  return (data.jobb || [])
    .filter((j) => j.koncept)
    .map((j) => ({ datum, namn: j.namn, produkt: produktUr(j.namn), koncept: j.koncept }));
}

export function loggaJobbfil(data, loggfil = LOGG) {
  const rader = loggrader(data);
  if (rader.length) appendFileSync(loggfil, rader.map((r) => JSON.stringify(r)).join('\n') + '\n');
  return rader.length;
}

function varde(argv, flagga) {
  const i = argv.indexOf(flagga);
  if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1];
  const t = argv.find((a) => a.startsWith(`${flagga}=`));
  return t ? t.slice(flagga.length + 1) : null;
}

export function main(argv = process.argv.slice(2)) {
  const bib = lasKoncept();
  if (argv.includes('--lista')) {
    const rader = bib.koncept.map((k) =>
      `${k.id}  ${k.status === 'klar' ? '✅' : '🔧'}  ${k.namn.padEnd(36)} ${k.funnel.padEnd(4)} ${k.vinklar.join(',')}`);
    console.log(`${bib.koncept.length} koncept (${bib.koncept.filter((k) => k.status === 'klar').length} klara):\n${rader.join('\n')}`);
    return 0;
  }
  if (argv.includes('--valj')) {
    const vinkel = varde(argv, '--vinkel');
    const produkt = varde(argv, '--produkt');
    if (!vinkel || !produkt) throw new Error('--valj kräver --vinkel och --produkt.');
    const val = valjKoncept({ vinkel, produkt, historik: lasHistorik(), onskat: varde(argv, '--onskat'), bib });
    const k = val.koncept;
    console.log(JSON.stringify({
      koncept: k.id,
      namn: k.namn,
      orsak: val.orsak,
      sa_ser_den_ut: k.sa_ser_den_ut,
      kraver: k.kraver,
      regler: k.regler,
      prompt: promptSkelett(k, {
        produktBeskrivning: varde(argv, '--produkt-beskrivning') || '{PRODUKT}',
        scen: varde(argv, '--scen') || '{SCEN}',
      }),
      block: specSkelett(k),
    }, null, 2));
    return 0;
  }
  const jobbfil = varde(argv, '--jobb');
  if (argv.includes('--kontroll')) {
    if (!jobbfil) throw new Error('--kontroll kräver --jobb <fil>.');
    const fel = kontrolleraJobbfil(JSON.parse(readFileSync(jobbfil, 'utf8')), bib);
    if (fel.length) {
      console.error(`❌ ${fel.length} fel i jobbfilen:\n- ${fel.join('\n- ')}`);
      return 1;
    }
    console.log('✅ varje jobb bär ett klart koncept, ingen produkt får samma koncept två gånger.');
    return 0;
  }
  if (argv.includes('--logga')) {
    if (!jobbfil) throw new Error('--logga kräver --jobb <fil>.');
    const n = loggaJobbfil(JSON.parse(readFileSync(jobbfil, 'utf8')));
    console.log(`${n} rader skrivna till ${path.relative(process.cwd(), LOGG)}`);
    return 0;
  }
  console.log('Använd --lista, --valj, --kontroll eller --logga (se filhuvudet).');
  return 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exit(main());
  } catch (fel) {
    console.error(`❌ ${fel.message}`);
    process.exit(1);
  }
}
