#!/usr/bin/env node
// lager/kor.mjs — lagerplanen: vad som tar slut, vad som ska beställas, vad som binder pengar.
// LÄS-BARA mot allt: CWD:s ark, Shopify. Beställer ingenting och skriver inget hos någon.
//
//   node lager/kor.mjs                     # hämtar CWD:s ark, visar planen
//   node lager/kor.mjs --skriv             # + lager/rapporter/<datum>.md och .json
//   node lager/kor.mjs --fil ark.xlsx      # läs en nedladdad kopia i stället
//   node lager/kor.mjs --utan-shopify      # hoppa över kostnader och säsongsplanen
//   node lager/kor.mjs --datum 2026-10-01  # räkna som om det vore den dagen
//
// Allt i README.md. Talen (ledtid, säkerhet, nyåret) står i konfig.json.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasXlsx } from './xlsx.mjs';
import { tolkaFlikar, bedom, sortera, sammanfatta, sasongsbehov, iso, dagarMellan } from './berakna.mjs';

const MAPP = dirname(fileURLToPath(import.meta.url));
const arg = (namn) => { const i = process.argv.indexOf(namn); return i > 0 ? process.argv[i + 1] : null; };
const flagga = (namn) => process.argv.includes(namn);

const konfig = JSON.parse(readFileSync(join(MAPP, 'konfig.json'), 'utf8'));
const idag = arg('--datum') ?? iso(new Date());

export async function hamtaArk(id, fetchFn = fetch) {
  const svar = await fetchFn(`https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`, { redirect: 'follow' });
  if (!svar.ok) throw new Error(`Google svarade ${svar.status} på arket ${id} — är det fortfarande delat med länk?`);
  const buf = Buffer.from(await svar.arrayBuffer());
  if (buf.readUInt32LE(0) !== 0x04034b50) throw new Error('Google skickade inte en xlsx (inloggningssida?) — arket är inte längre delat med länk');
  return buf;
}

const kr = (n) => (n === null || n === undefined ? '–' : `${Math.round(n).toLocaleString('sv-SE')} kr`);
const st = (n) => (n === null || n === undefined ? '–' : `${Math.round(n).toLocaleString('sv-SE')} st`);
const dag = (n) => (n === null || n === undefined ? '–' : n >= 999 ? '999+' : String(Math.round(n)));
const per = (n) => (n === null || n === undefined ? '–' : n < 1 ? n.toFixed(2) : n.toFixed(1));
const kortDatum = (d) => (d ? `${Number(d.slice(8))}/${Number(d.slice(5, 7))}${d.slice(0, 4) !== idag.slice(0, 4) ? ` ${d.slice(0, 4)}` : ''}` : '–');

function butikFor(namn) {
  for (const r of konfig.butiksregler) if (new RegExp(r.monster, 'i').test(namn)) return r.butik;
  return 'Övrigt';
}

async function main() {
  const kalla = konfig.kallor[0];
  const buf = arg('--fil') ? readFileSync(arg('--fil')) : await hamtaArk(kalla.ark);
  const flikar = lasXlsx(buf);
  const { dagar, artiklar, hoppade } = tolkaFlikar(flikar, { idag });
  if (!dagar.length) throw new Error('inga daterade flikar i arket — har CWD bytt format?');
  const senasteAvlasning = dagar[dagar.length - 1];
  const alder = dagarMellan(senasteAvlasning, idag);

  // Kostnader ur Shopify (bara där appen får läsa produkter).
  const kartor = [];
  const kostnadsfel = [];
  if (!flagga('--utan-shopify')) {
    const { kostnaderFor } = await import('./shopify.mjs');
    for (const b of konfig.kostnad_butiker) {
      try { kartor.push({ butik: b, ...(await kostnaderFor(b)) }); } catch (e) { kostnadsfel.push(`${b}: ${e.message}`); }
    }
  }
  const { hittaKostnad } = flagga('--utan-shopify') ? { hittaKostnad: () => null } : await import('./shopify.mjs');

  const s = konfig.standard;
  const bedomningar = sortera(artiklar.map((a) => {
    const egen = konfig.artiklar?.[a.sku] ?? {};
    const b = bedom(a, {
      idag,
      ledtid: egen.ledtid_dagar ?? s.ledtid_dagar,
      sakerhet: egen.sakerhet_dagar ?? s.sakerhet_dagar,
      cykel: egen.cykel_dagar ?? s.cykel_dagar,
      overtackning: egen.overtackning_dagar ?? s.overtackning_dagar,
      moq: egen.moq ?? 1,
      sasong: egen.sasongsfaktor ?? 1,
      kostnad: egen.kostnad_sek ?? hittaKostnad(a, kartor),
      kny: konfig.kinesiska_nyaret,
    });
    return { ...b, butik: butikFor(a.namn), notering: egen.notering ?? null };
  }));
  const summa = sammanfatta(bedomningar);

  // Säsongsplanen (varor som skickas men vars lager inte syns i arket).
  const sasonger = [];
  if (!flagga('--utan-shopify')) {
    const { forsaljning } = await import('./shopify.mjs');
    for (const p of konfig.sasong ?? []) {
      try {
        const f = await forsaljning(p.butik, { dagar: 14, nu: new Date(`${idag}T23:59:59Z`) });
        const re = new RegExp(p.monster, 'i');
        const varor = f.varor.filter((v) => re.test(v.vara));
        const enheter = varor.reduce((x, v) => x + v.enheter, 0);
        const enheterPerOrder = f.ordrar ? enheter / f.ordrar : 0;
        const plan = sasongsbehov({ manader: p.manader, enheterPerOrder, scenarier: p.scenarier, idag, kny: konfig.kinesiska_nyaret, ledtid: s.ledtid_dagar, taktPerDag: enheter / 14 });
        sasonger.push({ ...p, ordrar14: f.ordrar, enheter14: enheter, perDag: enheter / 14, enheterPerOrder, varor, plan });
      } catch (e) {
        sasonger.push({ ...p, fel: e.message });
      }
    }
  }

  const rapport = skrivRapport({ idag, kalla, dagar, senasteAvlasning, alder, hoppade, bedomningar, summa, kartor, kostnadsfel, sasonger });
  console.log(rapport);
  if (flagga('--skriv')) {
    mkdirSync(join(MAPP, 'rapporter'), { recursive: true });
    writeFileSync(join(MAPP, 'rapporter', `${idag}.md`), rapport);
    writeFileSync(join(MAPP, 'rapporter', `${idag}.json`), JSON.stringify({ idag, kalla: kalla.id, avlast: senasteAvlasning, flikar: dagar.length, summa, bedomningar, sasonger: sasonger.map(({ varor, ...x }) => ({ ...x, varor: varor?.slice(0, 10) })) }, null, 1));
    console.error(`\nSkrev lager/rapporter/${idag}.md och .json`);
  }
}

function skrivRapport({ idag, kalla, dagar, senasteAvlasning, alder, hoppade, bedomningar, summa, kartor, kostnadsfel, sasonger }) {
  const L = [];
  const s = konfig.standard;
  const kny = konfig.kinesiska_nyaret;
  L.push(`# Lagerplanen ${idag}`);
  L.push('');
  L.push(`Källa: CWD:s ark "${kalla.ark_namn}", ${dagar.length} dagsavläsningar ${kortDatum(dagar[0])}–${kortDatum(senasteAvlasning)}. Senaste avläsningen är ${alder === 0 ? "från i dag" : alder === 1 ? "från i går" : `${alder} dagar gammal`}.`);
  if (alder > 3) L.push(`⚠️ CWD har inte uppdaterat arket på ${alder} dagar. Siffrorna nedan gäller ${kortDatum(senasteAvlasning)}.`);
  if (hoppade.length) L.push(`⚠️ ${hoppade.length} flikar gick inte att datera och räknades inte: ${hoppade.join(', ')}.`);
  L.push(`Antaganden: ledtid ${s.ledtid_dagar} dagar, säkerhet ${s.sakerhet_dagar} dagar, en beställning täcker ${s.cykel_dagar} dagar, överlager över ${s.overtackning_dagar} dagar. Takten = utleveranser per dag medan varan fanns i lager, senaste 14 dagarna (30 om 14 är för tunt).`);
  L.push('');

  const utanfor = new Set(Object.keys(konfig.butiker_utanfor_arket ?? {}));
  // En vara som slutat med 1–2 sålda på en månad är inte en åtgärd, bara en rad i tabellen.
  const atgard = bedomningar.filter((b) => !utanfor.has(b.butik) && ((b.status === 'slut' && b.salt30 >= 3) || ['bestall_nu', 'bestall_snart'].includes(b.status) || b.kny));
  L.push('## Det här behöver göras');
  L.push('');
  for (const [butik, text] of Object.entries(konfig.butiker_utanfor_arket ?? {})) {
    const rader = bedomningar.filter((b) => b.butik === butik && b.status === 'slut');
    if (rader.length) L.push(`- ⚠️ **${butik}: arket stämmer inte.** ${rader.map((b) => b.namn).join(', ')} står på 0. ${text}`);
  }
  if (!atgard.length) L.push('- Ingen annan vara i arket behöver beställas de närmaste 14 dagarna.');
  for (const b of atgard) {
    const vara = `${b.namn}${b.spec ? ` (${b.spec})` : ''}`;
    const pengar = (antal) => (b.kostnad !== null ? ` (${kr(antal * b.kostnad)})` : '');
    if (b.status === 'slut') L.push(`- 🔴 **${vara}** — ${b.varfor}.${b.bestallAntal ? ` Ett lager för ${s.ledtid_dagar + s.sakerhet_dagar + s.cykel_dagar} dagar vore ${st(b.bestallAntal)}${pengar(b.bestallAntal)}.` : ''}${b.notering ? ` ${b.notering}` : ''}`);
    else if (b.status === 'bestall_nu') L.push(`- 🔴 **${vara}** — beställ nu: ${st(b.bestallAntal)}${pengar(b.bestallAntal)}. ${b.varfor}.`);
    else if (b.status === 'bestall_snart') L.push(`- 🟡 **${vara}** — beställ senast ${kortDatum(b.bestallSenast)}: ${st(b.bestallAntal)}${pengar(b.bestallAntal)}.`);
    if (b.kny) L.push(`- 🧧 **${vara}** — ${st(b.lager)} räcker till ${kortDatum(b.slutDatum)}. Fram till ${kortDatum(b.kny.tackas)} (då fabrikerna går för fullt igen efter nyåret) behövs ${st(b.kny.behov)}, alltså ${st(b.kny.saknas)} till${pengar(b.kny.saknas)}. De ska vara beställda senast ${kortDatum(b.kny.bestallSenast)}${b.bestallSenast && b.bestallSenast < b.kny.bestallSenast ? `, och första beställningen senast ${kortDatum(b.bestallSenast)}` : ''}.`);
  }
  L.push('');

  for (const p of sasonger) {
    L.push(`## Säsongen: ${p.namn}`);
    L.push('');
    if (p.fel) { L.push(`⚠️ Gick inte att läsa: ${p.fel}`); L.push(''); continue; }
    L.push(`Senaste 14 dagarna: ${p.ordrar14} ordrar, ${st(p.enheter14)} sålda = ${p.perDag.toFixed(0)} per dag, ${p.enheterPerOrder.toFixed(2)} per order (Shopify, avbrutna borträknade).`);
    L.push(`Lagret för den här varan syns inte i CWD:s ark. Tabellen säger hur mycket som behövs, inte hur mycket som finns.`);
    L.push('');
    L.push(`| Månad | Ordrar förra året | Dagens takt hela månaden | ${p.scenarier.map((x) => `${x}× förra året`).join(' | ')} |`);
    L.push(`|---|---|---|${p.scenarier.map(() => '---').join('|')}|`);
    for (const r of p.plan.rader) {
      if (r.ordrarForra === null) continue;
      L.push(`| ${r.manad} | ${r.ordrarForra.toLocaleString('sv-SE')} | ${st(r.dagensTakt)} | ${p.scenarier.map((x) => st(r.enheter[x])).join(' | ')} |`);
    }
    if (p.plan.knyGap) {
      L.push('');
      L.push(`**Över kinesiska nyåret** (${kortDatum(p.plan.knyGap.fran)}–${kortDatum(p.plan.knyGap.till)}, inget nytt kommer ut ur Kina): ${st(p.plan.knyGap.dagensTakt)} om dagens takt håller, ${p.scenarier.map((x) => `${st(p.plan.knyGap.enheter[x])} vid ${x}× förra året`).join(', ')}. Det ska ligga färdigt i lagret hos leverantören senast ${kortDatum(kny.sista_utskick)}.`);
      L.push('');
      L.push(`Redan oktober går ${st(p.plan.rader[0]?.dagensTakt)} i dagens takt mot ${st(p.plan.rader[0]?.enheter[p.scenarier[p.scenarier.length - 1]])} vid ${p.scenarier[p.scenarier.length - 1]}× förra året: förra året är ett golv, inte ett tak.`);
    }
    L.push('');
    L.push(`Källa för förra året: ${p.manader_kalla}`);
    L.push('');
  }

  const binder = bedomningar.filter((b) => b.status === 'overlager' || b.status === 'stilla');
  L.push('## Pengar som ligger still');
  L.push('');
  L.push(`I arket: ${st(summa.enheter)} i lager. Med känd kostnad: ${kr(summa.bundetKr)} bundet${summa.enheterUtanKostnad ? `, plus ${st(summa.enheterUtanKostnad)} utan kostnad i Shopify` : ''}. Överlager (mer än ${s.overtackning_dagar} dagars behov): ${kr(summa.overlagerKr)} där kostnaden är känd.`);
  L.push('');
  if (binder.length) {
    L.push('| Vara | Lager | Sålt 30 d | Räcker dagar | Överlager | Värde |');
    L.push('|---|---|---|---|---|---|');
    for (const b of binder.slice(0, 15)) L.push(`| ${b.namn.slice(0, 42)}${b.spec ? ` (${b.spec})` : ''} | ${st(b.lager)} | ${b.salt30} | ${b.status === 'stilla' ? 'säljer inte' : dag(b.dagarKvar)} | ${st(b.overlagerSt)} | ${kr(b.overlagerKr)} |`);
    L.push('');
  }

  const matt = bedomningar.filter((b) => b.mattLedtid);
  if (matt.length) {
    L.push('## Uppmätt ledtid');
    L.push('');
    for (const b of matt) L.push(`- ${b.namn}: beställd ${kortDatum(b.mattLedtid.bestalld)}, i lager ${kortDatum(b.mattLedtid.ilager)} = **${b.mattLedtid.dagar} dagar** (${st(b.mattLedtid.antal)}).`);
    L.push('');
  }

  const perButik = new Map();
  for (const b of bedomningar) {
    if (b.status === 'vilande' || b.status === 'okand') continue;
    if (!perButik.has(b.butik)) perButik.set(b.butik, []);
    perButik.get(b.butik).push(b);
  }
  L.push('## Alla varor med lager eller försäljning');
  L.push('');
  const ikon = { slut: '🔴', bestall_nu: '🔴', bestall_snart: '🟡', ok: '🟢', overlager: '🔵', stilla: '⚪' };
  for (const [butik, rader] of perButik) {
    L.push(`### ${butik}`);
    L.push('');
    L.push('| | Vara | Lager | Per dag (14 d) | Sålt 30 d | Räcker dagar | Slut | Styckkostnad |');
    L.push('|---|---|---|---|---|---|---|---|');
    for (const b of rader) L.push(`| ${ikon[b.status] ?? ''} | ${b.namn.slice(0, 45)}${b.spec ? ` (${b.spec})` : ''} | ${b.lager} | ${per(b.takt14 ?? b.takt30)} | ${b.salt30} | ${dag(b.dagarKvar)} | ${kortDatum(b.slutDatum)} | ${b.kostnad === null ? '–' : kr(b.kostnad)} |`);
    L.push('');
  }
  const vilande = bedomningar.filter((b) => b.status === 'vilande').length;
  if (vilande) L.push(`${vilande} rader står på 0 utan försäljning på 30 dagar och visas inte.`);
  L.push('');
  L.push('## Kostnaderna');
  L.push('');
  for (const k of kartor) L.push(`- ${k.butik}: Cost per item ur Shopify (${k.via}), ${k.kostnader.size} varianter.`);
  for (const f of kostnadsfel) L.push(`- ⚠️ ${f}`);
  if (!kartor.length && !kostnadsfel.length) L.push('- Hoppade över Shopify (--utan-shopify).');
  L.push('- Grillklinikens varor saknar kostnad: butiken har inga nycklar i miljön. Sätt `kostnad_sek` per SKU i konfig.json om de ska räknas.');
  return L.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(`Lagerplanen stoppade: ${e.message}`); process.exit(1); });
}
