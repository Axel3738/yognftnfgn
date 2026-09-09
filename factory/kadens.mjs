// KADENSEN — produktionstakten per OPS-butik och rond.
//
// Axels tal 2026-09-09, ordagrant: "vi kan typ pumpa 7 videos per dag per butik
// ops då alltså. Hälften new concept hälften variations iterations osv då vi ska
// ha en redigerare för varje."
//
//   7 videor per dag × 3 dagar = 21 per rond (ronden går var tredje dag)
//   hälften NYA KONCEPT · hälften VARIANTER av det som redan vunnit
//   en redigerare per butik
//
// Ren logik, noll beroenden, inga nätanrop. Filen räknar och fördelar — den
// skriver aldrig en brief och hittar aldrig på ett annonsnamn ur luften.
//
//   node factory/kadens.mjs                 → visar fördelningen med standardtalen
//   node factory/kadens.mjs --per-dag 5     → räkna om
//
// ⚠️ TVÅ REGLER SOM INTE FÅR TUMMAS PÅ
//
// 1. **En variant utan namngiven förälder är inget variant.** Den ska peka på
//    VILKEN vinnare den itererar och VILKEN variabel som ändras (hook, angle
//    eller format enligt docs/naming-convention.md). Utan förälder är den ett
//    nytt koncept, och då ska den räknas som ett — annars ser rapporten ut som
//    om vi itererade på bevisad data när vi i själva verket gissade.
//
// 2. **Ett nytt koncept får aldrig födas ur tomma intet** (CLAUDE.md, "Så lär
//    sig systemet"). Varje koncept ska peka på en av tre källor: en
//    playbook-vinnare, en winning line som redan spenderat pengar bra, eller
//    en konkurrent-signal ur docs/swipes/. Kan det inte det är det en gissning
//    — och då märks det `gissning: true` och syns i rapporten. Vi tar bort
//    inte gissningen; vi vägrar dölja den.

import { pathToFileURL } from 'node:url';

/** Axels tal. Ändras bara på hans besked. */
export const VIDEOR_PER_DAG = 7;
export const RONDDAGAR = 3;

/** Variablerna en variant får isolera. Vokabulären står i docs/naming-convention.md. */
export const VARIABLER = Object.freeze(['hook', 'angle', 'format']);

/** Källtyperna ett nytt koncept får peka på. Allt annat är en gissning. */
export const KONCEPTKALLOR = Object.freeze(['playbook', 'winning-line', 'swipe']);

const finns = (v) => typeof v === 'string' && v.trim() !== '';

/**
 * Halvorna. Udda totalsumma: **den extra går till VARIANTHALVAN.**
 *
 * Motivering (två skäl, båda mätbara):
 *  1. En variant itererar på pengar som redan bevisat sig. ANALYSMETOD steg 5
 *     visar varför: top spendern i motorhölje-kampanjen stod för 47 % av allt
 *     vinstbidrag. Marginalkronan är bättre placerad bredvid det som vinner än
 *     bredvid ett obeprövat koncept.
 *  2. Nya koncept kräver var sin namngiven källa (regel 2 högst upp). Källorna
 *     tar slut före slotarna, och en extra konceptslot utan källa blir per
 *     definition en gissning. Varianthalvan har ingen sådan brist.
 *
 * Finns INGEN bevisad vinnare går allt till nya koncept — det finns inget att
 * iterera på, och en "variant" utan förälder vore en gissning med finare namn.
 */
export function delaHalvor(total, harVinnare) {
  if (!Number.isInteger(total) || total <= 0) {
    throw new Error(`delaHalvor: totalen måste vara ett heltal > 0 (fick ${total}).`);
  }
  if (!harVinnare) return { varianter: 0, koncept: total, extraTill: null };
  const varianter = Math.ceil(total / 2);
  return {
    varianter,
    koncept: total - varianter,
    extraTill: total % 2 === 1 ? 'varianter' : null,
  };
}

/**
 * Delar upp ett annonsnamn enligt docs/naming-convention.md:
 *   {BRAND}_{PRODUCT}_{ANGLE}_{FORMAT}_{HOOK}[_{MARKET}]_v{N}
 * Returnerar null när namnet inte följer konventionen — då ska varianten döpas
 * för hand, inte gissas fram. Kontot är fullt av namn från tiden före
 * konventionen, så det här är ett normalt utfall och inget fel.
 */
export function delaNamn(namn) {
  if (!finns(namn)) return null;
  const delar = namn.trim().split('_');
  const sista = delar.at(-1);
  if (!/^v\d+$/i.test(sista ?? '')) return null;
  const version = Number(sista.slice(1));
  const kropp = delar.slice(0, -1);
  // Marknadskoden är en tvåbokstavskod sist i kroppen (no, dk, fi …).
  const harMarknad = kropp.length === 6 && /^[a-z]{2}$/i.test(kropp.at(-1));
  const marknad = harMarknad ? kropp.at(-1) : null;
  const falt = harMarknad ? kropp.slice(0, -1) : kropp;
  if (falt.length !== 5) return null;
  const [brand, produkt, angle, format, hook] = falt;
  return { brand, produkt, angle, format, hook, marknad, version };
}

/**
 * Namnet på en variant. En variant byter EXAKT ett fält (naming-convention
 * regel 2) och får ett nytt namn — en annons som fått data döps aldrig om
 * (regel 3).
 *
 * @param {string} foralderNamn  vinnarens annonsnamn
 * @param {string} variabel      'hook' | 'angle' | 'format'
 * @param {string|null} nyttVarde  det nya fältvärdet. null ⇒ namnet kan inte
 *                                 byggas färdigt och ronden fyller i det.
 * @returns {{namn: string|null, mall: string, skal: string|null}}
 */
export function variantnamn(foralderNamn, variabel, nyttVarde = null) {
  if (!VARIABLER.includes(variabel)) {
    throw new Error(`variantnamn: okänd variabel "${variabel}" — tillåtna är ${VARIABLER.join(', ')}.`);
  }
  const delat = delaNamn(foralderNamn);
  if (!delat) {
    return {
      namn: null,
      mall: '{BRAND}_{PRODUCT}_{ANGLE}_{FORMAT}_{HOOK}_v{N}',
      skal: `föräldern "${foralderNamn}" följer inte namnkonventionen — döp varianten för hand enligt docs/naming-convention.md`,
    };
  }
  const falt = { angle: delat.angle, format: delat.format, hook: delat.hook };
  // Byts fältet till ett nytt värde börjar serien om på v1. Behålls värdet
  // (eller är det ännu okänt) bumpas versionen i stället.
  const nytt = finns(nyttVarde) ? nyttVarde.trim().toLowerCase() : null;
  const bytt = nytt !== null && nytt !== falt[variabel];
  falt[variabel] = nytt ?? `<nytt ${variabel}>`;
  const version = bytt ? 1 : delat.version + 1;
  const bitar = [delat.brand, delat.produkt, falt.angle, falt.format, falt.hook];
  if (delat.marknad) bitar.push(delat.marknad);
  bitar.push(`v${version}`);
  return {
    namn: nytt === null ? null : bitar.join('_'),
    mall: bitar.join('_'),
    skal: nytt === null ? `${variabel}-värdet bestäms i ronden — sätt det innan briefen skickas` : null,
  };
}

/**
 * Bygger rondens produktionsplan.
 *
 * @param {object} inpar
 * @param {number} [inpar.antalPerDag=7] videor per dag och butik (Axels tal)
 * @param {number} [inpar.dagar=3]       dagar per rond
 * @param {Array}  [inpar.vinnare=[]]    bevisade vinnare ur klassificeringen:
 *                                       [{ namn, kop, cpa, vinstbidrag }]
 * @param {Array}  [inpar.koncept=[]]    konceptkandidater ur backlog/playbook/swipes:
 *                                       [{ ide, kalla: { typ, referens } }]
 * @param {string|null} [inpar.redigerare=null] butikens redigerare ur registret
 * @returns {object} planen
 */
export function byggKadens({
  antalPerDag = VIDEOR_PER_DAG,
  dagar = RONDDAGAR,
  vinnare = [],
  koncept = [],
  redigerare = null,
} = {}) {
  if (!Number.isFinite(antalPerDag) || antalPerDag <= 0) throw new Error('byggKadens: antalPerDag måste vara > 0.');
  if (!Number.isFinite(dagar) || dagar <= 0) throw new Error('byggKadens: dagar måste vara > 0.');
  const total = Math.round(antalPerDag * dagar);

  const varningar = [];

  // Bara vinnare med NAMN kan bli föräldrar. En namnlös rad är inte en
  // förälder — se regel 1 högst upp.
  const foraldrar = (vinnare ?? []).filter((v) => finns(v?.namn));
  const namnlosa = (vinnare ?? []).length - foraldrar.length;
  if (namnlosa > 0) {
    varningar.push(`${namnlosa} vinnarrad(er) saknar annonsnamn och kan inte bli förälder till en variant — de räknas inte.`);
  }

  const halvor = delaHalvor(total, foraldrar.length > 0);
  if (foraldrar.length === 0) {
    varningar.push(
      'Ingen bevisad vinnare att iterera på — hela ronden blir nya koncept. '
      + 'Det är rätt för butikens första rond, men efter en rond med bedömbar data är det ett tecken '
      + 'på att klassificeringen inte hittade något över break-even.'
    );
  }

  // ---- varianthalvan: round robin över vinnarna, en variabel isolerad per variant
  const varianter = [];
  for (let i = 0; i < halvor.varianter; i += 1) {
    const foralder = foraldrar[i % foraldrar.length];
    // Variabeln roteras så att varje förälder får hook, angle och format i
    // tur och ordning. Två varianter av samma förälder testar alltså aldrig
    // samma variabel i samma rond — det är det som gör datan läsbar per
    // variabel (docs/naming-convention.md, "Varför det här funkar för analys").
    const variabel = VARIABLER[Math.floor(i / foraldrar.length) % VARIABLER.length];
    const namn = variantnamn(foralder.namn, variabel, null);
    varianter.push({
      plats: i + 1,
      typ: 'variant',
      foralder: foralder.namn,
      foralderns_utfall: {
        kop: foralder.kop ?? null,
        cpa: foralder.cpa ?? null,
        vinstbidrag: foralder.vinstbidrag ?? null,
      },
      variabel,
      hall_konstant: VARIABLER.filter((v) => v !== variabel),
      namnmall: namn.mall,
      namn: namn.namn,
      namn_oklart: namn.namn === null,
      anmarkning: namn.skal,
    });
  }

  // ---- konceptvhalvan: varje slot får en källa, annars märks den gissning
  const kallor = (koncept ?? []).filter(Boolean);
  const nyaKoncept = [];
  for (let i = 0; i < halvor.koncept; i += 1) {
    const k = kallor[i] ?? null;
    const typ = k?.kalla?.typ ?? null;
    const giltig = KONCEPTKALLOR.includes(typ) && finns(k?.kalla?.referens);
    nyaKoncept.push({
      plats: i + 1,
      typ: 'koncept',
      ide: k?.ide ?? null,
      kalla: giltig ? { typ, referens: k.kalla.referens } : null,
      gissning: !giltig,
      anmarkning: giltig
        ? null
        : k
          ? `källan saknas eller är okänd (${typ ?? 'ingen typ'}) — märkt gissning, tillåtna typer är ${KONCEPTKALLOR.join(', ')}`
          : 'ingen konceptkandidat fanns för den här platsen — ronden måste hitta en källa eller märka konceptet som gissning',
    });
  }
  const gissningar = nyaKoncept.filter((k) => k.gissning).length;
  if (gissningar > 0) {
    varningar.push(
      `${gissningar} av ${halvor.koncept} nya koncept saknar källa och är märkta GISSNING. `
      + 'Ett koncept ska peka på en playbook-vinnare, en winning line eller en swipe (CLAUDE.md).'
    );
  }

  if (!finns(redigerare)) {
    // Nämn ALDRIG en person som inte finns. factory/redigerare/standby.md har
    // noll rader (avläst 2026-09-09), så det finns ingen att peka ut.
    varningar.push('Ingen redigerare tilldelad butiken — planen visar VAD som ska göras, inte av vem.');
  }

  return {
    antalPerDag,
    dagar,
    total,
    perDagText: `${antalPerDag} videor/dag × ${dagar} dagar`,
    fordelning: {
      varianter: halvor.varianter,
      koncept: halvor.koncept,
      extraTill: halvor.extraTill,
      motivering: halvor.extraTill === 'varianter'
        ? 'Udda total — den extra platsen går till varianthalvan (iterationer på bevisad vinst).'
        : null,
    },
    varianter,
    nyaKoncept,
    redigerare: finns(redigerare) ? redigerare : null,
    varningar,
  };
}

/** Planen som text — samma innehåll som objektet, för en rapport i chatten. */
export function skrivKadens(plan) {
  const rader = [];
  rader.push(`Kadens: ${plan.perDagText} = ${plan.total} creatives den här ronden.`);
  rader.push(`  Varianter/iterationer: ${plan.fordelning.varianter}   ·   Nya koncept: ${plan.fordelning.koncept}`);
  if (plan.fordelning.motivering) rader.push(`  ${plan.fordelning.motivering}`);
  rader.push(`  Redigerare: ${plan.redigerare ?? 'ingen redigerare tilldelad'}`);
  rader.push('');
  rader.push('| # | Typ | Förälder / källa | Variabel som ändras | Namn |');
  rader.push('|---|---|---|---|---|');
  for (const v of plan.varianter) {
    rader.push(`| ${v.plats} | variant | ${v.foralder} | ${v.variabel} (håll ${v.hall_konstant.join(' + ')} konstant) | ${v.namn ?? v.namnmall} |`);
  }
  for (const k of plan.nyaKoncept) {
    const kalla = k.kalla ? `${k.kalla.typ}: ${k.kalla.referens}` : '⚠️ GISSNING — ingen källa';
    rader.push(`| ${k.plats} | koncept | ${kalla} | — | (döps i briefen) |`);
  }
  if (plan.varningar.length) {
    rader.push('');
    for (const v of plan.varningar) rader.push(`⚠️ ${v}`);
  }
  return rader.join('\n');
}

// ------------------------------------------------------------------- CLI

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = process.argv.slice(2);
  const flagga = (namn, standard) => {
    const i = arg.indexOf(`--${namn}`);
    return i >= 0 && arg[i + 1] ? Number(arg[i + 1]) : standard;
  };
  console.log('');
  console.log(skrivKadens(byggKadens({
    antalPerDag: flagga('per-dag', VIDEOR_PER_DAG),
    dagar: flagga('dagar', RONDDAGAR),
  })));
  console.log('\n(Utan vinnare och utan konceptkällor blir hela ronden nya koncept, alla märkta gissning.');
  console.log(' Det är avsiktligt: /skalningskungen matar in klassificeringen och backloggen.)\n');
}
