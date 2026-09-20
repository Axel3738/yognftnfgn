// bildmarknad.mjs — byter KÄLLANS svenska text i en färdig BILDANNONS mot
// MARKNADENS, utan att röra fotot.
//
// Varför det finns
// ----------------
// CaraShells 36 svenska bildannonser ska till Danmark. Mätt 2026-09-20 med OCR
// på /tmp/dk-bild/kalla står tre fel samtidigt i varje bild:
//   fel SPRÅK    "Beställ nu – spara 340 kr", "Fri frakt · Leverans 5–10 arbetsdagar"
//   fel PRIS     1 129 / 1 469 kr är svenskt; danskt är 819 / 1.069 kr.
//   fel VILLKOR  "Fri frakt inom Sverige" och "pengarna tillbaka" är KÄLLBUTIKENS
//                löften — butiken har gratis fragt til Danmark och 14 dages
//                fortrydelsesret (facit: factory/butiker/carashell.yaml).
// Rabatten är det tydligaste exemplet på varför en översättning inte räcker:
// "spara 340 kr" får ALDRIG bli "spar 340 kr.". 1 069 − 819 = 250.
//
// Samma arbetsdelning som videons pipeline/omdubb/inbrand.mjs, och domlogiken
// är DENSAMMA — den importeras därifrån i stället för att skrivas igen:
//   1. factory/bildmarknad-mat.py    MÄTER (OCR, bakgrund, stil). Dömer inget.
//   2. den här filen                 DÖMER (roll, marknadens text, brandspärr).
//   3. factory/bildmarknad-rita.py   RITAR (sudda, skriv).
// Sedan mäts resultatet EN GÅNG TILL. En bild med svensk text kvar blir aldrig
// "klar" — exit ≠ 0, samma regel som inbrand.mjs.
//
//   node factory/bildmarknad.mjs --kalla=<jpg> --ut=<jpg> --marknad=DK \
//        --produkt=factory/produkter/takskyddet.yaml \
//        --butik=factory/butiker/carashell.yaml [--texter=<json>] [--torr] [--matning]
//
//   --torr      mätning + plan, skriver ingen bild
//   --matning   skriver BARA mätningen som JSON på stdout (rad-index, text, box,
//               stil) — underlaget en copywriter skriver sina rader mot
//   --texter    JSON [{"rad": 0, "text": "…"}] med copywriterns rader
//
// Skriver <ut> och <ut>.bildmarknad.json (mätning före, plan, mätning efter, dom).
// Exit 0 = rent, 4 = svensk text kvar eller rad utan ersättning, 2 = fel indata.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { marknadFor } from './opsmarknader.mjs';
import { lasYaml } from './yaml.mjs';
// ⚠️ Domlogiken delas med videon MED FLIT. Samma rad ska få samma dom oavsett
// om den står i en mp4 eller en jpg — annars driver bild och video isär och
// ingen märker det förrän en dansk kund ser två olika priser.
import {
  vik, svenskaTraffar, mappaRad, kallpriser, foljVersaler,
  marknadstexter, brandspärr, efterdom, delaFotrad,
} from '../pipeline/omdubb/inbrand.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

const kor = (argv, { tillat = false } = {}) => {
  const r = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.status !== 0 && !tillat) {
    throw new Error(`${argv[0]} ${argv[1] ?? ''} misslyckades (${r.status}): ${String(r.stderr ?? r.error?.message ?? '').slice(-900)}`);
  }
  return r;
};

/** OCR + bakgrunds- och stilmätning av en bild. */
export function mat(fil, { konf = 0.45, pad = 6 } = {}) {
  const r = kor(['python3', join(ROT, 'factory', 'bildmarknad-mat.py'), fil, `--konf=${konf}`, `--pad=${pad}`]);
  try {
    return JSON.parse(r.stdout);
  } catch {
    throw new Error(`bildmarknad-mat.py svarade inte med JSON:\n${String(r.stdout).slice(0, 400)}\n${String(r.stderr).slice(-400)}`);
  }
}

/** Ett belopp i marknadens valuta. Formatet bor i factory/slutkort.py. */
export function formateraBelopp(belopp, valuta) {
  const r = kor(['python3', join(ROT, 'factory', 'bildmarknad-mat.py'), '--belopp', String(belopp), '--valuta', valuta]);
  return JSON.parse(r.stdout).text;
}

const siffror = (s) => String(s ?? '').replace(/[^0-9]/g, '');

/**
 * Rabatten i kronor — UTRÄKNAD ur marknadens två priser, aldrig översatt.
 *
 * ⚠️ Det här är hela skälet att en översättare inte duger. "Beställ nu – spara
 * 340 kr" blir "Bestil nu – spar 250 kr." eftersom 1 069 − 819 = 250; en
 * översättning hade behållit 340 och ljugit om rabatten i var och en av de
 * 36 annonserna.
 */
export function rabattTal(produkt, valuta, basvaluta = 'SEK') {
  const nod = produkt?.ekonomi ?? {};
  if (String(valuta).toUpperCase() === String(basvaluta).toUpperCase()) {
    if (nod.pris == null || nod.jamforpris == null) return null;
    return Math.round(Number(nod.jamforpris) - Number(nod.pris));
  }
  for (const rad of nod.marknadspriser ?? []) {
    if (String(rad?.valuta ?? '').toUpperCase() !== String(valuta).toUpperCase()) continue;
    if (rad.pris == null || rad.jamforpris == null) return null;
    return Math.round(Number(rad.jamforpris) - Number(rad.pris));
  }
  return null;
}

/** Källans rabatt i BUTIKENS basvaluta — talet som ska kännas igen i bilden. */
export function kallrabatt(produkt) {
  const ut = new Set();
  const lagg = (nod) => {
    if (nod?.pris == null || nod?.jamforpris == null) return;
    ut.add(String(Math.round(Number(nod.jamforpris) - Number(nod.pris))));
  };
  lagg(produkt?.ekonomi);
  for (const v of produkt?.varianter ?? []) lagg(v);
  return [...ut];
}

// Skiljetecken som kan stå MELLAN två pristal utan att vara text på ett språk.
// Avläst 2026-09-20 i CaraShells bildannonser: "1 469 kr → 1 129 kr" (pil) och
// "1 129 kr (ord. 1 469 kr)". Pilen är språklös; "ord." är det inte.
const SPRAKLOSA = /^[\s→⟶>–—\-·|/+()[\]]*$/u;

// Valutaord som hör till TALET och inte till språket. "kr" står likadant på
// svenska och danska (danskan skriver "kr." med punkt, vilket VALUTAFORMAT
// sköter), så ett tal med "kr" efter sig är fortfarande bara ett tal.
const VALUTAORD = /\b(kr|kr\.|sek|dkk|nok|eur|usd|kroner|kronor)\b/gi;

/**
 * Bär raden PROSA — alltså ord som någon har skrivit på ett språk?
 *
 * ⚠️ Den här frågan får INTE ställas till markörlistan i inbrand.mjs. Den
 * listan är gjord för videocaptions och känner inte "Beställ nu – spara 340 kr":
 * mätt 2026-09-20 gav `svenskaTraffar` noll träffar på den raden, varpå
 * rabattregeln nedan gladeligen skrev hela knapptexten till "250 kr." och
 * kastade bort budskapet. Testet är därför språkoberoende: finns det bokstäver
 * kvar när talen och valutaorden strukits, är raden skriven av en människa och
 * ska skrivas om av en människa.
 */
// Löftena i butikens fotrad, med mönstret som känner igen dem i källan.
// Samma tre delar som `delaFotrad` i inbrand.mjs ger: frakt · garanti · leverans.
const FOTMONSTER = [
  ['frakt', /(frifrakt|fraktfritt|gratisfrakt|fraktfri|frileverans)/],
  ['villkor', /(oppetkop|angerratt|returratt|bytesratt|returer|pengarnatillbaka|nojdkundgaranti)/],
  ['leverans', /(arbetsdagar|vardagar|leveranstid|leverans)/],
];

/**
 * Vilka av butikens löften står i raden, och i vilken ordning?
 *
 * Ordningen tas ur KÄLLAN så att den danska raden läses i samma följd som den
 * svenska — annars byter annonsen layout fast den bara skulle byta språk.
 */
export function fotdelar(text, marknadstext) {
  const platt = vik(text);
  const fot = delaFotrad(marknadstext.fotrad);
  const marknad = { frakt: fot.frakt, villkor: marknadstext.badge, leverans: fot.leverans };
  const funna = [];
  for (const [roll, monster] of FOTMONSTER) {
    const m = monster.exec(platt);
    if (m && marknad[roll]) funna.push({ roll, pos: m.index, text: marknad[roll] });
  }
  return funna.sort((a, b) => a.pos - b.pos);
}

export function harProsa(text) {
  const kvar = String(text ?? '')
    .replace(/\d[\d\s.,]*/g, ' ')
    .replace(VALUTAORD, ' ')
    .replace(/[^\p{L}]+/gu, '');
  return kvar.length > 0;
}

/**
 * Vad en uppmätt BILDRAD ska bli på marknaden.
 *
 * Bygger på videons `mappaRad` (pris, jämförpris, frakt, villkor, leverans) och
 * lägger till två roller som bara finns i bilder:
 *   rabatt    ett ensamt tal som är källans prisskillnad ("spara 340 kr")
 *   prispar   en rad som BARA är tal och språklösa tecken ("1 469 kr → 1 129 kr")
 *
 * ⚠️ En rad som blandar tal med svensk prosa ("1 129 kr i stället för 1 469 kr
 * – spara 340 kr") får INGEN automatisk ersättning. Att bara byta siffrorna
 * hade lämnat "i stället för" och "spara" kvar på svenska, och efterkontrollen
 * hade underkänt bilden ändå. Sådana rader är copywriterns (`--texter`).
 */
export function mappaBildrad(text, marknadstext, priser, extra = {}) {
  const { rabatt = null, kallrabatter = [], markorer = [] } = extra;
  const sif = siffror(text);

  // 1. Fotrad som bär FLERA löften — vanligt i bilder, ovanligt i video.
  //    "Fri frakt · Leverans 5–10 arbetsdagar" är två fakta, och videons
  //    mappaRad hade bara sett den första och tappat leveranstiden.
  const delar = fotdelar(text, marknadstext);
  if (delar.length >= 2) {
    return {
      roll: 'fotrad',
      ny: delar.map((d) => d.text).join(' · '),
      regel: `raden bär ${delar.length} av butikens löften (${delar.map((d) => d.roll).join(' + ')}) — `
        + 'var och en hämtad ur butiksfilen i källans ordning',
    };
  }

  // 2. Hela raden är en känd ROLL → videons regler räcker. De byter hela raden
  //    mot en färdig mening på marknadens språk, så prosa är inget problem här.
  const grund = mappaRad(text, marknadstext, priser);
  if (grund.roll !== 'okand') return grund;

  // 2. Bär raden prosa? Då får ingen sifferregel röra den. Ordningen är hela
  //    poängen: stod det här testet efter rabattregeln blev "Beställ nu –
  //    spara 340 kr" till "250 kr." (mätt 2026-09-20 i första torrkörningen).
  if (harProsa(text)) {
    const traffar = svenskaTraffar(text, markorer);
    const kändaTal = [...priser.pris, ...priser.jamforpris, ...kallrabatter];
    const stalePris = sif && kändaTal.some((t) => sif.includes(t));
    if (stalePris) {
      return {
        roll: 'blandad',
        ny: null,
        regel: `raden blandar källans tal (${sif}) med skriven text${traffar.length ? ` (svenska markörer: ${traffar.join(', ')})` : ''} — `
          + 'bara siffrorna bytta hade lämnat språket kvar; raden behöver en skriven rad (--texter). '
          + '⚠️ den bär ett KÄLLPRIS och är därför farligast av alla att lämna',
      };
    }
    return {
      roll: 'prosa',
      ny: null,
      regel: `raden är skriven text${traffar.length ? ` (svenska markörer: ${traffar.join(', ')})` : ''} `
        + '— ingen siffra eller villkorsregel kan skriva den; den behöver en skriven rad (--texter)',
    };
  }

  // 3. Ett ensamt tal som är källans RABATT.
  if (sif && kallrabatter.includes(sif) && rabatt) {
    return { roll: 'rabatt', ny: rabatt, regel: `siffrorna "${sif}" = källans prisskillnad (jämförpris − pris); marknadens är uträknad, inte översatt` };
  }

  // 4. Rad som bara är tal + språklösa tecken: varje tal byts för sig.
  const bitar = String(text ?? '').split(/(\d[\d\s.,]*\d|\d)/);
  const talbitar = bitar.filter((_, i) => i % 2 === 1);
  const mellan = bitar.filter((_, i) => i % 2 === 0);
  const rentMellan = mellan.every((m) => SPRAKLOSA.test(m.replace(VALUTAORD, '')));
  if (talbitar.length >= 2 && rentMellan) {
    const roller = talbitar.map((t) => {
      const s = siffror(t);
      if (priser.pris.includes(s)) return { roll: 'pris', ny: marknadstext.pris };
      if (priser.jamforpris.includes(s)) return { roll: 'jamforpris', ny: marknadstext.jamforpris };
      if (kallrabatter.includes(s) && rabatt) return { roll: 'rabatt', ny: rabatt };
      return null;
    });
    if (roller.every(Boolean)) {
      let ut = '';
      for (let i = 0; i < mellan.length; i++) {
        // Valutaordet följer med talet ur marknadens format — det som står
        // mellan talen i källan ("kr →") får inte skrivas av.
        ut += mellan[i].replace(VALUTAORD, '').replace(/\s+/g, ' ');
        if (roller[i]) ut += roller[i].ny;
      }
      return {
        roll: 'prispar',
        ny: ut.replace(/\s+/g, ' ').trim(),
        regel: `raden är bara tal och språklösa tecken (${talbitar.length} tal: ${roller.map((r) => r.roll).join(' + ')})`,
      };
    }
  }

  // 5. Varken prosa, känt tal eller roll — alltså ingenting som är svenskt.
  //    "−23 %" är samma rabatt i Danmark (de danska priserna är satta med
  //    samma procent, se produktfilens DKK-kommentar), och ett procenttal
  //    stavas likadant. Sådana rader ska lämnas i fred, inte efterlysas som
  //    saknad copy — men de ska sägas högt, inte tigas ihjäl.
  if (!harProsa(text)) {
    return { roll: 'sprakneutral', ny: null, regel: 'raden bär varken bokstäver eller något av källans tal — inget att översätta, lämnas orörd' };
  }
  return grund;
}

// Hur nära plattans kant en rad får komma. 0,04 av plattans bredd är avläst
// 2026-09-20 ur källans egen layout: knappen i BOF_101 är 548 px bred och den
// svenska texten 489 px, alltså ~5 % luft per sida.
const PLATTMARGINAL = 0.04;

/**
 * Hur bred den nya raden får bli innan den måste krympas.
 *
 * ⚠️ Inte källradens egen ruta. Danska rader är ofta längre än svenska, och
 * med källrutan som tak krympte de i onödan fast det fanns tom platta kvar.
 * Den suddade rutan behöver bara täcka den GAMLA texten — den nya får gärna
 * sträcka sig utanför, för där finns ingen text att sudda.
 */
export function tillatenBredd(rad, W) {
  const ink = rad.stil.ink_box;
  const platta = rad.bakgrund.platta;
  const justering = rad.stil.justering ?? 'center';
  // Utan platta (gradient/foto) är bilden gränsen, med källans egen marginal
  // bevarad så raden inte plötsligt går längre ut än originalet gjorde.
  const yta = platta ?? [0, 0, W - 1, 0];
  const marginal = Math.round((yta[2] - yta[0] + 1) * PLATTMARGINAL);
  const v = yta[0] + marginal;
  const h = yta[2] - marginal;
  if (justering === 'vanster') return Math.max(40, h - ink[0]);
  const mitt = (ink[0] + ink[2] + 1) / 2;
  return Math.max(40, Math.round(Math.min(mitt - v, h - mitt) * 2));
}

/** Läser copywriterns rader. Formatet är avsiktligt minimalt. */
export function lasTexter(fil) {
  const data = JSON.parse(readFileSync(fil, 'utf8'));
  const lista = Array.isArray(data) ? data : data.rader;
  if (!Array.isArray(lista)) {
    throw new Error(`--texter ${fil}: väntade [{"rad": 0, "text": "…"}] eller {"rader": [...]}`);
  }
  const karta = new Map();
  for (const post of lista) {
    if (typeof post?.rad !== 'number' || typeof post?.text !== 'string') {
      throw new Error(`--texter ${fil}: varje post behöver {"rad": <nummer>, "text": "<text>"} — fick ${JSON.stringify(post)}`);
    }
    karta.set(post.rad, post.text);
  }
  return karta;
}

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] ?? true] : [a, true];
}));

export async function huvud() {
  for (const k of ['kalla', 'marknad', 'produkt', 'butik']) {
    if (!args[k]) { console.error(`--${k} saknas. Läs huvudet i filen.`); process.exit(2); }
  }
  const kalla = String(args.kalla);
  if (!existsSync(kalla)) { console.error(`Källan finns inte: ${kalla}`); process.exit(2); }
  if (!args.matning && !args.ut) { console.error('--ut saknas (eller kör --matning).'); process.exit(2); }
  const ut = args.ut ? String(args.ut) : null;
  const marknaden = marknadFor(args.marknad);

  const produkt = lasYaml(readFileSync(String(args.produkt), 'utf8'));
  const butik = lasYaml(readFileSync(String(args.butik), 'utf8'));
  const markorer = butik?.butik?.markorer_sv ?? [];
  const basvaluta = butik?.butik?.valuta ?? 'SEK';
  const priser = kallpriser(produkt);
  const kallrabatter = kallrabatt(produkt);

  const fore = mat(kalla, { konf: Number(args.konf ?? 0.45), pad: Number(args.pad ?? 6) });

  // --matning: bara underlaget, inget annat. Det här är filen en copywriter
  // skriver sina rader mot.
  if (args.matning) {
    console.log(JSON.stringify({
      fil: kalla, W: fore.W, H: fore.H,
      rader: fore.rader.map((r) => ({
        rad: r.i, text: r.text, konfidens: r.konfidens, box: r.box, ruta: r.ruta,
        bakgrund: r.bakgrund.klass, fet: r.stil?.fet, storlek: r.stil?.storlek,
        textfarg: r.stil?.textfarg, justering: r.stil?.justering, stryk: r.stil?.stryk,
      })),
    }, null, 1));
    process.exit(0);
  }

  const { texter: mt, kallor } = marknadstexter({
    produkt: String(args.produkt), butik: String(args.butik), marknad: marknaden.kod,
  });
  const rabattal = rabattTal(produkt, marknaden.valuta, basvaluta);
  const rabatt = rabattal == null ? null : formateraBelopp(rabattal, marknaden.valuta);
  const egnaTexter = args.texter ? lasTexter(String(args.texter)) : null;

  console.log(`${basename(kalla)} → ${marknaden.kod} (${marknaden.sprak}, ${marknaden.valuta})  ${fore.W}×${fore.H}`);
  console.log(`  marknadens sanning: pris ${mt.pris} · jämförpris ${mt.jamforpris} · villkor "${mt.badge}"`);
  console.log(`                      fotrad "${mt.fotrad}"`);
  console.log(`                      rabatt ${rabatt ?? '—'} (uträknad: ${mt.jamforpris} − ${mt.pris}, aldrig översatt)`);
  console.log(`  källans tal i produktfilen: pris ${priser.pris.join(', ')} · jämför ${priser.jamforpris.join(', ')} · rabatt ${kallrabatter.join(', ')}`);

  console.log('\nMÄTNING');
  for (const r of fore.rader) {
    const s = r.stil ?? {};
    console.log(`  #${r.i} ${JSON.stringify(r.ruta).padEnd(24)} ${r.bakgrund.klass.padEnd(8)} `
      + `${s.fet ? 'fet   ' : 'normal'} ${String(s.storlek ?? '—').padStart(5)}px ${(s.justering ?? '—').padEnd(7)}`
      + `${s.stryk ? ' STRUKEN' : ''} ${JSON.stringify(r.text)}`);
    console.log(`        bakgrund: ${r.bakgrund.regel}`);
    if (r.varning) console.log(`        ⚠️ ${r.varning}`);
  }

  // ---- planen ----
  const atgarder = [];
  const skrivna = [];
  const utanErsattning = [];
  console.log('\nPLAN');
  for (const r of fore.rader) {
    if (!r.stil) {
      utanErsattning.push({ rad: r.i, text: r.text, regel: r.varning ?? 'stilen gick inte att mäta' });
      console.log(`  #${r.i} ${JSON.stringify(r.text)} → HOPPAS ÖVER (${r.varning ?? 'stilen gick inte att mäta'})`);
      continue;
    }
    let ny = null;
    let roll = 'egen';
    let regel = '';
    if (egnaTexter?.has(r.i)) {
      ny = egnaTexter.get(r.i);
      regel = `skriven rad ur ${basename(String(args.texter))}`;
    } else {
      const m = mappaBildrad(r.text, mt, priser, { rabatt, kallrabatter, markorer });
      roll = m.roll;
      regel = m.regel;
      ny = m.ny == null ? null : foljVersaler(r.text, m.ny);
    }
    if (ny) {
      skrivna.push(ny);
      atgarder.push({
        i: r.i, ruta: r.ruta, bakgrund: r.bakgrund, stil: r.stil,
        kalltext: r.text, ny_text: ny, stryk: Boolean(r.stil.stryk),
        maxbredd: tillatenBredd(r, fore.W),
      });
      console.log(`  #${r.i} ${JSON.stringify(r.text)}\n       → ${JSON.stringify(ny)}  [${roll}] ${regel}`);
    } else if (roll === 'sprakneutral') {
      neutrala.push({ rad: r.i, text: r.text, regel });
      console.log(`  #${r.i} ${JSON.stringify(r.text)}\n       → LÄMNAS ORÖRD [${roll}] ${regel}`);
    } else {
      // ⚠️ En rad utan ersättning TÄCKS ALDRIG TYST. Att sudda den svenska
      // texten och lämna tomt tar bort budskapet ur annonsen utan att någon
      // ser det; därför lämnas pixlarna orörda och raden rapporteras.
      utanErsattning.push({ rad: r.i, text: r.text, regel });
      console.log(`  #${r.i} ${JSON.stringify(r.text)}\n       → INGEN ERSÄTTNING [${roll}] ${regel}`);
    }
  }
  brandspärr(skrivna);

  if (utanErsattning.length) {
    console.log('\n  ⚠️ RADER UTAN ERSÄTTNING — de lämnas ORÖRDA (svensk text står alltså kvar):');
    for (const r of utanErsattning) console.log(`      #${r.rad} ${JSON.stringify(r.text)}`);
    console.log(`      Skriv dem med --texter: ${JSON.stringify(utanErsattning.map((r) => ({ rad: r.rad, text: '…' })))}`);
  }

  const rapport = {
    kalla, ut, marknad: marknaden.kod, sprak: marknaden.sprak, valuta: marknaden.valuta,
    marknadstext: mt, kallor, rabatt, kallpriser: priser, kallrabatter,
    matning_fore: fore, plan: atgarder, utan_ersattning: utanErsattning,
  };

  if (args.torr) {
    if (ut) writeFileSync(`${ut}.bildmarknad.json`, `${JSON.stringify({ ...rapport, dom: 'TORR' }, null, 1)}\n`);
    console.log(`\n(torr: ingen bild skriven.${ut ? ` Planen ligger i ${basename(ut)}.bildmarknad.json` : ''})`);
    process.exit(0);
  }

  if (!atgarder.length) {
    console.log('\nIngen rad att byta.');
    process.exit(utanErsattning.length ? 4 : 0);
  }

  console.log('\nRITAR');
  const planfil = `${ut}.plan.json`;
  writeFileSync(planfil, JSON.stringify({ in: kalla, ut, W: fore.W, H: fore.H, atgarder }, null, 1));
  const res = JSON.parse(kor(['python3', join(ROT, 'factory', 'bildmarknad-rita.py'), planfil]).stdout);
  rapport.rendering = res;
  for (const p of res.atgarder) {
    console.log(`  #${p.i} ${p.suddning}`);
    if (p.ritning?.krympt) {
      console.log(`       ⚠️ STILEN KRYMPTES ${p.ritning.krympt.fran} → ${p.ritning.krympt.till} px: ${p.ritning.krympt.varfor}`);
    }
  }

  console.log('\nEFTERKONTROLL (OCR på resultatet)');
  const efter = mat(ut, { konf: Number(args.konf ?? 0.45), pad: Number(args.pad ?? 6) });
  // Videons efterdom vill ha rörliga mått; en stillbild står alltid still.
  const efterRader = { rader: (efter.rader ?? []).map((r) => ({ ...r, rutor: 99, drift_px: 0, t: [0, 0] })) };
  const kvar = efterdom(efterRader, skrivna, markorer);
  rapport.matning_efter = efter;
  rapport.kvar = kvar;
  for (const k of kvar) {
    console.log(`  ❌ ${JSON.stringify(k.box)} ${JSON.stringify(k.text)} — svenska markörer: ${k.markorer.join(', ')}`);
  }
  if (!kvar.length) console.log('  ✅ ingen svensk markör kvar i bilden');

  const dom = kvar.length ? 'SVENSK TEXT KVAR' : (utanErsattning.length ? 'TÄCKT UTAN ERSÄTTNING' : 'REN');
  rapport.dom = dom;
  writeFileSync(`${ut}.bildmarknad.json`, `${JSON.stringify(rapport, null, 1)}\n`);
  console.log(`\n${kvar.length ? '❌' : (utanErsattning.length ? '⚠️' : '✅')} ${dom} — rapport i ${basename(ut)}.bildmarknad.json`);
  process.exit(kvar.length || utanErsattning.length ? 4 : 0);
}

if (process.argv[1]?.endsWith('bildmarknad.mjs')) await huvud();
