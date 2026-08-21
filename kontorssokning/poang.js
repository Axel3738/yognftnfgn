// Poängmotorn för kontorsjakten.
//
// Läser rådata (raa.json) + Axels kriterier (parametrar.json) och skriver objekt.json
// med matchpoang 0–100 och en poangmotivering som visar uträkningen.
//
//   node kontorssokning/poang.js            # raa.json -> objekt.json
//   node kontorssokning/poang.js --tyst     # utan sammanfattning i terminalen
//
// Viktbordet kommer ur uppdraget:
//   Yta ≥150 kvm 25 | Kontorsrum ≥5 25 | Öppen yta 20 | Geografi 15 | Hyra 10 | Tillträde 5
//
// Regeln för okända uppgifter: framgår något inte av annonsen ges HALV poäng och
// fältet flaggas i okanda_falt. Vi räknar aldrig fram en uppgift som saknas.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));

export const VIKTER = { yta: 25, rum: 25, oppen_yta: 20, geografi: 15, hyra: 10, tilltrade: 5 };

// Grov körtid med bil från Kungälv centrum. Uppskattning per område – kommer INTE
// ur någon annons och påverkar inte matchpoang, den flaggar bara objekt som
// ligger klart över Axels 35-minutersgräns.
const RESTID_KUNGALV = {
  rollsbo: 5, ytterby: 8, kareby: 10, arntorp: 7, solgarde: 6, solbracke: 6,
  skalebracke: 7, kongahalla: 4, 'kungalv centrum': 4, kungalv: 5, marstrand: 30,
  save: 15, karra: 15, tagene: 17, tuve: 20, bjorlanda: 25, torslanda: 28, amhult: 28,
  'hisings backa': 18, brunnsbo: 20, backaplan: 22, kvillebacken: 23, kville: 23,
  bramaregarden: 24, lundby: 24, rambergsstaden: 24, lindholmen: 26, eriksberg: 27,
  sannegarden: 27, ringon: 22, tingstad: 21, biskopsgarden: 25, lansmansgarden: 25,
  arendal: 30, sorred: 30, exportgatan: 24, backebol: 18, angered: 28,
  gamlestaden: 28, marieholm: 27, surte: 22, nodinge: 20, ale: 22,
};

const nyckla = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();

export function restidFranKungalv(omrade) {
  const n = nyckla(omrade);
  if (!n) return null;
  if (RESTID_KUNGALV[n] != null) return RESTID_KUNGALV[n];
  for (const [omr, min] of Object.entries(RESTID_KUNGALV)) {
    if (n.includes(omr) || omr.includes(n)) return min;
  }
  return null;
}

// --- Tillträde -------------------------------------------------------------

export function tolkaTilltrade(text) {
  if (!text) return { kategori: 'okant', datum: null };
  const t = String(text).toLowerCase();
  if (/omg[åa]ende|omedelbart|ledig nu|inflyttningsklar|direkt/.test(t)) {
    return { kategori: 'omgaende', datum: null };
  }
  if (/enligt [öo]verenskommelse|efter [öo]verenskommelse|enl\.? [öo]k/.test(t)) {
    return { kategori: 'overenskommelse', datum: null };
  }
  const iso = t.match(/(20\d{2})-(\d{2})(?:-(\d{2}))?/);
  if (iso) return { kategori: 'datum', datum: `${iso[1]}-${iso[2]}-${iso[3] || '01'}` };
  const manader = {
    januari: '01', februari: '02', mars: '03', april: '04', maj: '05', juni: '06',
    juli: '07', augusti: '08', september: '09', oktober: '10', november: '11', december: '12',
  };
  const sv = t.match(new RegExp(`(${Object.keys(manader).join('|')})\\s*(20\\d{2})`));
  if (sv) return { kategori: 'datum', datum: `${sv[2]}-${manader[sv[1]]}-01` };
  const kvartal = t.match(/q([1-4])\s*[- ]?\s*(20\d{2})/);
  if (kvartal) {
    return { kategori: 'datum', datum: `${kvartal[2]}-${String((+kvartal[1] - 1) * 3 + 1).padStart(2, '0')}-01` };
  }
  const bartAr = t.match(/\b(20\d{2})\b/);
  if (bartAr) return { kategori: 'datum', datum: `${bartAr[1]}-01-01` };
  return { kategori: 'okant', datum: null };
}

// --- Delpoäng --------------------------------------------------------------

function poangYta(o) {
  const kvm = o.kvm;
  if (kvm == null) return { p: VIKTER.yta / 2, okant: true, text: 'yta okänd' };
  if (kvm >= 150) return { p: VIKTER.yta, okant: false, text: `${kvm} kvm` };
  // 100 kvm ger 10 p, 150 kvm ger full pott – linjärt däremellan.
  const p = Math.max(0, 10 + (15 * (kvm - 100)) / 50);
  return { p: Math.round(p * 10) / 10, okant: false, text: `${kvm} kvm` };
}

function poangRum(o) {
  const rum = o.antal_kontorsrum;
  if (rum == null) return { p: VIKTER.rum / 2, okant: true, text: 'rumsantal okänt' };
  if (rum >= 5) return { p: VIKTER.rum, okant: false, text: `${rum} rum` };
  return { p: rum * 5, okant: false, text: `${rum} rum` };
}

function poangOppenYta(o) {
  if (o.oppen_yta == null) return { p: VIKTER.oppen_yta / 2, okant: true, text: 'öppen yta okänd' };
  if (o.oppen_yta === false) return { p: 0, okant: false, text: 'ingen öppen yta' };
  if (o.oppen_yta_kvm == null) return { p: 15, okant: false, text: 'öppen yta, storlek okänd' };
  if (o.oppen_yta_kvm >= 40) return { p: VIKTER.oppen_yta, okant: false, text: `öppen yta ${o.oppen_yta_kvm} kvm` };
  return { p: 12, okant: false, text: `öppen yta bara ${o.oppen_yta_kvm} kvm` };
}

function poangGeografi(o) {
  const p = { 1: VIKTER.geografi, 2: VIKTER.geografi / 2, 3: VIKTER.geografi / 4 }[o.niva] ?? 0;
  return { p, okant: false, text: `nivå ${o.niva}` };
}

function poangHyra(o, params) {
  const b = params.budget;
  if (b.typ === 'ingen_grans') {
    return { p: VIKTER.hyra, okant: false, text: 'ingen budgetgräns satt' };
  }
  const man = o.hyra_kr_man;
  const kvmAr = o.hyra_kr_kvm_ar;
  if (man == null && kvmAr == null) return { p: VIKTER.hyra / 2, okant: true, text: 'hyra okänd' };
  if (b.max_kr_man != null && man != null) {
    return man <= b.max_kr_man
      ? { p: VIKTER.hyra, okant: false, text: `${man} kr/mån inom budget` }
      : { p: 0, okant: false, text: `${man} kr/mån över budget` };
  }
  if (b.max_kr_kvm_ar != null && kvmAr != null) {
    return kvmAr <= b.max_kr_kvm_ar
      ? { p: VIKTER.hyra, okant: false, text: `${kvmAr} kr/kvm/år inom budget` }
      : { p: 0, okant: false, text: `${kvmAr} kr/kvm/år över budget` };
  }
  return { p: VIKTER.hyra / 2, okant: true, text: 'hyran går inte att jämföra med budgeten' };
}

function poangTilltrade(o, params) {
  const { kategori, datum } = tolkaTilltrade(o.tilltrade);
  if (kategori === 'okant') return { p: VIKTER.tilltrade / 2, okant: true, text: 'tillträde okänt' };
  if (kategori === 'omgaende') return { p: VIKTER.tilltrade, okant: false, text: 'omgående' };
  if (kategori === 'overenskommelse') return { p: VIKTER.tilltrade, okant: false, text: 'enligt överenskommelse' };
  const senast = params.tilltrade.senast_datum;
  if (senast && datum <= senast) return { p: 4, okant: false, text: `tillträde ${datum}` };
  return { p: 2, okant: false, text: `tillträde först ${datum}` };
}

// --- Plus, minus och flaggor ----------------------------------------------

function berikaFlaggor(o, params, restid) {
  const plus = [...(o.plus || [])];
  const minus = [...(o.minus || [])];
  const okanda = new Set(o.okanda_falt || []);

  // Parkering är ett skallkrav i Axels parametrar men står inte i alla annonser.
  const p = (o.parkering || '').toLowerCase();
  if (!o.parkering) {
    okanda.add('parkering');
    minus.push('parkering ej angiven — måste kollas (krav)');
  } else if (/saknas|ingen p|ej parkering|inga p-platser/.test(p)) {
    minus.push('ingen parkering — bryter mot kravet');
  } else if (!plus.some((x) => /parkering|p-plats/i.test(x))) {
    plus.push(`parkering: ${o.parkering}`);
  }

  const text = `${o.beskrivning || ''} ${(o.plus || []).join(' ')} ${o.titel || ''}`.toLowerCase();
  if (/dusch/.test(text) && !plus.some((x) => /dusch/i.test(x))) plus.push('dusch finns');

  if (o.typ === 'delat') minus.unshift('delat kontorshotell — absolut nej enligt kriterierna');
  if (o.typ === 'kombilokal') minus.push('kombilokal med lagerdel — lagret behövs inte vid dropshipping');
  if (o.typ === 'raa_yta') minus.push('rå yta — rummen måste byggas');
  if (o.typ === 'nyproduktion') minus.push('nyproduktion — tillträdet ligger längre fram');

  if (o.kvm != null && o.kvm < 150) minus.push(`${o.kvm} kvm är i underkant för 8–12 personer`);
  if (o.kvm != null && o.kvm > 400) minus.push(`${o.kvm} kvm är mer yta än 8–12 personer behöver`);

  if (restid != null && restid > params.max_restid_kungalv_min) {
    minus.push(`ca ${restid} min från Kungälv — över gränsen på ${params.max_restid_kungalv_min} min`);
  }

  if (o.hyra_kr_man == null && o.hyra_kr_kvm_ar == null) okanda.add('hyra');
  if (o.antal_kontorsrum == null) okanda.add('antal_kontorsrum');
  if (o.oppen_yta == null) okanda.add('oppen_yta');
  if (o.tilltrade == null) okanda.add('tilltrade');
  if (!o.kontakt_epost) okanda.add('kontakt.epost');
  if (!o.kontakt_telefon) okanda.add('kontakt.telefon');

  return { plus: [...new Set(plus)], minus: [...new Set(minus)], okanda_falt: [...okanda] };
}

// --- Huvudfunktion ---------------------------------------------------------

// Alla fält i datamodellen, så objekt.json alltid har samma form och appen slipper gissa.
const MALL = {
  titel: null, adress: null, omrade: null, niva: null, typ: 'kontor', kvm: null,
  kvm_intervall: null, antal_kontorsrum: null, oppen_yta: null, oppen_yta_kvm: null,
  motesrum: null, hyra_kr_man: null, hyra_kr_kvm_ar: null, hyra_anmarkning: null,
  tilltrade: null, vaning: null, parkering: null, kollektivtrafik: null, hyresvard: null,
  bild_url: null, kalla_url: [], hamtad_datum: null, beskrivning: null,
};

export function poangsatt(raaObjekt, params) {
  const o = { ...MALL, ...raaObjekt };
  const delar = {
    yta: poangYta(o),
    rum: poangRum(o),
    oppen_yta: poangOppenYta(o),
    geografi: poangGeografi(o),
    hyra: poangHyra(o, params),
    tilltrade: poangTilltrade(o, params),
  };
  const summa = Object.values(delar).reduce((s, d) => s + d.p, 0);
  const etiketter = { yta: 'Yta', rum: 'Rum', oppen_yta: 'Öppen yta', geografi: 'Geografi', hyra: 'Hyra', tilltrade: 'Tillträde' };
  const motivering = Object.entries(delar)
    .map(([k, d]) => `${etiketter[k]} ${(Math.round(d.p * 10) / 10).toString().replace('.', ',')}/${VIKTER[k]}${d.okant ? ' (okänt → halv poäng)' : ''}`)
    .join(', ');

  const restid = restidFranKungalv(o.omrade);
  const flaggor = berikaFlaggor(o, params, restid);

  // Hyra per kvm/år räknas fram när bara månadshyran står i annonsen – markerat som beräknat.
  let kvmAr = o.hyra_kr_kvm_ar ?? null;
  let anm = o.hyra_anmarkning ?? null;
  if (kvmAr == null && o.hyra_kr_man != null && o.kvm) {
    kvmAr = Math.round((o.hyra_kr_man * 12) / o.kvm);
    anm = `${anm ? anm + '. ' : ''}kr/kvm/år är beräknat från månadshyran, inte hämtat ur annonsen`;
  }

  return {
    ...o,
    kontakt: {
      namn: o.kontakt_namn ?? null,
      telefon: o.kontakt_telefon ?? null,
      epost: o.kontakt_epost ?? null,
    },
    kontakt_namn: undefined,
    kontakt_telefon: undefined,
    kontakt_epost: undefined,
    granskning: undefined,
    verifierad: o.verifierad === true,
    hyra_kr_kvm_ar: kvmAr,
    hyra_anmarkning: anm ?? null,
    restid_kungalv_min_uppskattad: restid,
    matchpoang: Math.round(summa),
    poangmotivering: motivering,
    poangdelar: Object.fromEntries(Object.entries(delar).map(([k, d]) => [k, Math.round(d.p * 10) / 10])),
    ...flaggor,
  };
}

function slug(s) {
  return nyckla(s).replace(/\s+/g, '-').slice(0, 40);
}

export function byggObjekt(raa, params, hamtadDatum) {
  const seen = new Map();
  const objekt = [];
  for (const o of raa) {
    const id = `${(o.kalla_url?.[0] || '').includes('lokalnytt') ? 'ln' : (o.kalla_url?.[0] || '').includes('verksamhetslokaler') ? 'vl' : (o.kalla_url?.[0] || '').includes('lokalguiden') ? 'lg' : 'ext'}-${slug(o.adress || o.titel)}-${o.kvm ?? 'x'}`;
    if (seen.has(id)) continue;
    seen.set(id, true);
    const p = poangsatt(o, params);
    objekt.push({ id, ...p, hamtad_datum: p.hamtad_datum ?? hamtadDatum ?? null });
  }
  return objekt.sort((a, b) => b.matchpoang - a.matchpoang);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const params = JSON.parse(readFileSync(join(HAR, 'parametrar.json'), 'utf8'));
  const raa = JSON.parse(readFileSync(join(HAR, 'raa.json'), 'utf8'));
  const hamtadDatum = new Date().toISOString().slice(0, 10);
  const objekt = byggObjekt(Array.isArray(raa) ? raa : raa.objekt, params, hamtadDatum);
  writeFileSync(join(HAR, 'objekt.json'), JSON.stringify(objekt, null, 2) + '\n');
  if (!process.argv.includes('--tyst')) {
    const perNiva = objekt.reduce((a, o) => ((a[o.niva] = (a[o.niva] || 0) + 1), a), {});
    console.log(`${objekt.length} objekt skrivna till objekt.json`);
    console.log(`Nivå 1: ${perNiva[1] || 0} | Nivå 2: ${perNiva[2] || 0} | Nivå 3: ${perNiva[3] || 0}`);
    console.log('\nTopp 5:');
    for (const o of objekt.slice(0, 5)) {
      console.log(`  ${String(o.matchpoang).padStart(3)} p  ${o.adress} (${o.omrade}) — ${o.kvm ?? '?'} kvm, ${o.antal_kontorsrum ?? '?'} rum`);
    }
  }
}
