#!/usr/bin/env node
// larm.mjs — pingen till VA:n i Discord (Axels beslut 2026-09-22, alternativ A).
//
// Axels fråga: "vilket sätt hade du tänkt använda för att kontakta vår riktiga
// VA med de här urgent cases med sura kunder?" Svaret han valde: en Discord-
// ping från timrutinen. Två regler, inget annat:
//   1. En människa skrev i en eskaleringskanal och ingen ANNAN människa har
//      svarat på två timmar ⇒ pinga VA:n i samma kanal, med länk till raden.
//   2. En öppen tvist har deadline inom tre dagar (eller passerad) ⇒ pinga
//      VA:n i varumärkets eskaleringskanal.
// Varje ärende pingas EN gång — minnet är stonebite/data/larm.json och
// committas av rutinen. Utan minne hade samma tvist pingats varje timme i
// tre dagar, och då slutar någon läsa.
//
// Läser BARA snapshoten (hamta.mjs har redan läst Discord och Shopify) — den
// här filen gör inga egna läsningar, bara skrivningar till Discord.
// Mottagarna kommer ur bonus/personer.json: rollen support_chef eller va med
// ett discord.id, för varumärket ("*" = alla). Mechile är VA för allt.
// Texten är engelsk (VA:n läser den); det citerade meddelandet är data och
// står på det språk det skrevs.
//
//   node stonebite/larm.mjs            skarpt: pinga, skriv minnet
//   node stonebite/larm.mjs --torr     visa vad som skulle pingas

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandForKundtjanst } from './kalender.mjs';
import { skickaTillKanal } from './kallor/discord.mjs';
import { lasPersoner } from '../bonus/kor.mjs';

export const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
const TIMME = 3_600_000;
const DAG = 24 * TIMME;

export const REGLER = Object.freeze({
  obesvaratTimmar: 2,   // en människa skrev, ingen annan människa svarade på två timmar
  maxAlderTimmar: 72,   // äldre än så är historik, inte ett ärende — pingas inte
  inlaggMinuter: 60,    // rader från samma person inom en timme är ETT inlägg (Axel skrev sex rader på fyra minuter)
  samtalTimmar: 24,     // ett inlägg direkt efter någon ANNANS inlägg (inom ett dygn) är ett svar, inte en ny fråga
  tvistDagar: 3,        // deadline inom tre dagar, eller redan passerad
  behallDagar: 30,      // så länge minns filen vad som skickats
  utdragTecken: 160,
});

/**
 * Kanalens människor, grupperade till inlägg: rader från samma person med
 * mindre än inlaggMinuter emellan hör ihop. Botar räknas bort. Ren.
 * Mätt 2026-09-22 (torrt): Axel skrev sex rader på fyra minuter i
 * #norway-customer-support — utan grupperingen hade det blivit sex pingar.
 */
export function inlagg(meddelanden = []) {
  const m = meddelanden.filter((x) => x && !x.bot && x.tid).sort((a, b) => String(a.tid).localeCompare(String(b.tid)));
  const ut = [];
  for (const x of m) {
    const vem = String(x.avId ?? x.av ?? '');
    const sist = ut.at(-1);
    if (sist && sist.vem === vem && new Date(x.tid).getTime() - new Date(sist.slut).getTime() <= REGLER.inlaggMinuter * 60_000) {
      sist.rader.push(x);
      sist.slut = x.tid;
    } else {
      ut.push({ vem, av: x.av, avId: x.avId ?? null, start: x.tid, slut: x.tid, rader: [x] });
    }
  }
  return ut;
}

export const BRANDNAMN = Object.freeze({ baverbutiken: 'Bäverbutiken', carashell: 'CaraShell', grillkliniken: 'Grillkliniken', matstrumpor: 'Matstrumpor', ops: 'OPS' });

export function larmfil(rot = ROT) { return join(rot, 'stonebite', 'data', 'larm.json'); }

/** Minnet: { skickade: [{ nyckel, typ, brand, kanal, kanalId, tid, text, meddelandeId, mottagare }] }. */
export function lasSkickade(rot = ROT) {
  const fil = larmfil(rot);
  if (!existsSync(fil)) return { skickade: [] };
  try {
    const d = JSON.parse(readFileSync(fil, 'utf8'));
    return { skickade: Array.isArray(d.skickade) ? d.skickade : [] };
  } catch {
    return { skickade: [] };
  }
}

export function sparaSkickade(data, rot = ROT) {
  const fil = larmfil(rot);
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, `${JSON.stringify({ uppdaterad: new Date().toISOString(), skickade: data.skickade ?? [] }, null, 1)}\n`);
  return fil;
}

/** Glöm det som är äldre än behallDagar — nyckeln kan inte återkomma efter det. */
export function rensa(skickade, { nu = new Date() } = {}) {
  const grans = nu.getTime() - REGLER.behallDagar * DAG;
  return (skickade ?? []).filter((s) => new Date(s.tid ?? 0).getTime() >= grans);
}

/** Vem som pingas för ett varumärke: support_chef och va med discord.id, för brandet eller "*". */
export function mottagareFor(personer, brand) {
  const roll = (p) => p.roll === 'support_chef' || p.roll === 'va' || (p.extraRoller ?? []).includes('support_chef') || (p.extraRoller ?? []).includes('va');
  return (personer ?? []).filter((p) => roll(p) && p.discord?.id && (p.brands ?? []).some((b) => b === '*' || b === brand));
}

/**
 * Kanalen ett varumärkes tvistlarm postas i: varumärkets första
 * eskaleringskanal. Utan egen server (Matstrumpor) går det till Bäverbutikens
 * #customer-service — Mechile är VA för alla butiker, och kanalen är hennes.
 */
export function kanalFor(kanaler, brand) {
  const egna = (kanaler ?? []).filter((k) => k.brand === brand && k.roll === 'eskalering');
  if (egna.length) return egna[0];
  return (kanaler ?? []).find((k) => k.brand === 'baverbutiken' && k.kanal === 'customer-service')
    ?? (kanaler ?? []).find((k) => k.roll === 'eskalering') ?? null;
}

/**
 * Larmen ur snapshoten. Ren funktion — testas utan nät.
 * @returns { larm: [...], varningar: [...] }
 */
export function hittaLarm({ snapshot, skickade = [], personer = [], nu = new Date() }) {
  const redan = new Set((skickade ?? []).map((s) => s.nyckel));
  const kanaler = snapshot?.eskalering?.kanaler ?? [];
  const nuMs = nu.getTime();
  const larm = [];
  const varningar = [];
  const vaIds = new Set((personer ?? []).flatMap((p) => (p.discord?.id ? [String(p.discord.id)] : [])));

  // 1. Obesvarat i eskaleringskanalerna: kanalens SENASTE inlägg är det som
  //    kan vänta på svar. Är det VA:ns eget, färskare än två timmar, äldre än
  //    tre dygn, eller ett svar i ett samtal mellan två andra människor — då
  //    pingas inget. Allt före det senaste inlägget har någon redan svarat på.
  const arVa = (avId) => Boolean(avId) && vaIds.has(String(avId));
  for (const k of kanaler.filter((x) => x.roll === 'eskalering')) {
    const alla = inlagg(k.meddelanden ?? []);
    const sista = alla.at(-1);
    if (!sista || arVa(sista.avId)) continue;
    const alder = nuMs - new Date(sista.slut).getTime();
    if (alder < REGLER.obesvaratTimmar * TIMME) continue;
    if (nuMs - new Date(sista.start).getTime() > REGLER.maxAlderTimmar * TIMME) continue;
    const forra = alla.at(-2);
    // Josh svarar Axel "jag kollar" ⇒ ett samtal, inte en fråga till VA:n. Men
    // skriver Axel efter VA:n är det VA:n som är skyldig ett svar.
    if (forra && forra.vem !== sista.vem && !arVa(forra.avId)
      && new Date(sista.start).getTime() - new Date(forra.slut).getTime() <= REGLER.samtalTimmar * TIMME) continue;
    const forsta = sista.rader[0];
    const nyckel = `eskalering:${k.kanalId}:${forsta.id ?? forsta.tid}`;
    if (redan.has(nyckel)) continue;
    const text = sista.rader.map((r) => String(r.text ?? '').replace(/\s+/g, ' ').trim()).find(Boolean) ?? '';
    larm.push({
      nyckel, typ: 'eskalering', brand: k.brand, kanalId: k.kanalId, kanal: k.kanal, server: k.server,
      tid: sista.slut, timmar: Math.floor(alder / TIMME), av: sista.av, antal: sista.rader.length,
      utdrag: text.slice(0, REGLER.utdragTecken),
      bilagor: sista.rader.reduce((s, r) => s + (r.bilagor ?? 0), 0),
      lank: forsta.id ? `${k.lank}/${forsta.id}` : k.lank,
      mottagare: mottagareFor(personer, k.brand),
    });
  }

  // 2. Tvister med deadline inom tre dagar (eller passerad).
  for (const tv of snapshot?.oppnaTvister ?? []) {
    if (tv.oppen === false || !tv.deadline) continue;
    const kvar = Math.ceil((new Date(tv.deadline).getTime() - nuMs) / DAG);
    if (kvar > REGLER.tvistDagar) continue;
    const brand = brandForKundtjanst(tv.brand) ?? tv.brand;
    const nyckel = `tvist:${tv.brand}:${tv.order}:${tv.deadline}`;
    if (redan.has(nyckel)) continue;
    const kanal = kanalFor(kanaler, brand);
    if (!kanal) { varningar.push(`${tv.order} (${tv.brand}): ingen Discord-kanal att posta i`); continue; }
    larm.push({
      nyckel, typ: 'tvist', brand, kanalId: kanal.kanalId, kanal: kanal.kanal, server: kanal.server,
      order: tv.order, butik: tv.brand, tvisttyp: tv.typ, belopp: tv.belopp, valuta: tv.valuta, deadline: tv.deadline, kvar,
      mottagare: mottagareFor(personer, brand),
    });
  }

  return { larm, varningar };
}

/** Engelsk text till VA:n. Citatet är kundens/kollegans ord och står som de skrevs. */
export function formulera(l) {
  const ping = (l.mottagare ?? []).map((p) => `<@${p.discord.id}>`).join(' ');
  const brand = BRANDNAMN[l.brand] ?? l.brand;
  if (l.typ === 'tvist') {
    const typ = l.tvisttyp === 'chargeback' ? '🔴 **Chargeback deadline' : '🟡 **Bank inquiry deadline';
    const belopp = l.belopp ? `${Number(l.belopp).toLocaleString('en-US')} ${l.valuta ?? ''}`.trim() : 'amount unknown';
    // Utan ordernamn bär snapshoten Shopifys interna order-id — säg det, så VA:n inte söker på fel sak.
    const order = String(l.order ?? '').startsWith('#') ? l.order : `Shopify order id ${l.order}`;
    const tid = l.kvar < 0 ? `OVERDUE by ${Math.abs(l.kvar)} day${Math.abs(l.kvar) === 1 ? '' : 's'}` : l.kvar === 0 ? 'due TODAY' : `${l.kvar} day${l.kvar === 1 ? '' : 's'} left`;
    const konsekvens = l.tvisttyp === 'chargeback'
      ? 'Unanswered, the money is lost for good.'
      : 'Unanswered, it escalates into a chargeback.';
    return `${ping} ${typ} — ${order} (${brand})** · ${belopp} · evidence due ${l.deadline} · ${tid}. ${konsekvens} Shopify admin → Orders → Disputes; the handbook is in Notion (Customer support → Chargebacks). Reply here once it is submitted.`.trim();
  }
  const h = l.timmar >= 48 ? `${Math.floor(l.timmar / 24)} days` : `${l.timmar} h`;
  const citat = l.utdrag ? `"${l.utdrag}${l.utdrag.length >= REGLER.utdragTecken ? '…' : ''}"` : (l.bilagor ? `[${l.bilagor} attachment${l.bilagor === 1 ? '' : 's'}]` : '(no text)');
  const fler = (l.antal ?? 1) > 1 ? ` (+${l.antal - 1} more message${l.antal - 1 === 1 ? '' : 's'})` : '';
  return `${ping} ⏰ **Unanswered for ${h} in #${l.kanal}** (${brand}) — ${l.av} wrote: ${citat}${fler}. Please pick it up and reply in the channel so everyone can see it is handled. ${l.lank}`.trim();
}

/**
 * Hela körningen: snapshot → larm → Discord → minnet. `skicka` byts ut i
 * tester. Utan token blir varje larm `fel` med orsaken, och inget minns —
 * det pingas nästa körning i stället.
 */
export async function korLarm({ rot = ROT, env = process.env, nu = new Date(), torr = false, skicka = null, logg = () => {} } = {}) {
  const snapshotFil = join(rot, 'stonebite', 'data', 'snapshot.json');
  if (!existsSync(snapshotFil)) throw new Error('stonebite/data/snapshot.json saknas — kör node stonebite/hamta.mjs först.');
  const snapshot = JSON.parse(readFileSync(snapshotFil, 'utf8'));
  let personer = [];
  try { personer = lasPersoner(join(rot, 'bonus', 'personer.json')); } catch (e) { logg(`⚠️ bonus/personer.json: ${e.message}`); }
  const minne = lasSkickade(rot);
  minne.skickade = rensa(minne.skickade, { nu });
  const { larm, varningar } = hittaLarm({ snapshot, skickade: minne.skickade, personer, nu });
  if (!mottagareFor(personer, 'baverbutiken').length) varningar.push('ingen support_chef/va med discord.id i bonus/personer.json — larmen postas utan @-ping');

  const sand = skicka ?? ((kanalId, text, ids) => skickaTillKanal(kanalId, text, { env, mentions: ids }));
  const resultat = [];
  for (const l of larm) {
    const text = formulera(l);
    const ids = (l.mottagare ?? []).map((p) => String(p.discord.id));
    if (torr) { resultat.push({ ...l, text, status: 'torr' }); continue; }
    try {
      const svar = await sand(l.kanalId, text, ids);
      resultat.push({ ...l, text, status: 'skickad', meddelandeId: svar?.id ?? null });
      minne.skickade.push({ nyckel: l.nyckel, typ: l.typ, brand: l.brand, kanal: l.kanal, kanalId: l.kanalId, tid: nu.toISOString(), text, meddelandeId: svar?.id ?? null, mottagare: ids });
      logg(`  ✅ ${l.typ} → #${l.kanal} (${l.server}): ${l.typ === 'tvist' ? l.order : `${l.av}, ${l.timmar} h`}`);
    } catch (e) {
      resultat.push({ ...l, text, status: 'fel', fel: e.message });
      varningar.push(`${l.nyckel}: ${e.message}`);
      logg(`  ❌ ${l.typ} → #${l.kanal}: ${e.message}`);
    }
  }
  if (!torr) sparaSkickade(minne, rot);
  return { larm: resultat, varningar, iMinnet: minne.skickade.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const torr = process.argv.includes('--torr');
  korLarm({ torr, logg: console.log })
    .then((r) => {
      const n = (s) => r.larm.filter((x) => x.status === s).length;
      console.log(torr
        ? `Torrt: ${r.larm.length} larm skulle pingas (${r.larm.filter((x) => x.typ === 'tvist').length} tvister, ${r.larm.filter((x) => x.typ === 'eskalering').length} obesvarade).`
        : `Pingar till VA:n: ${n('skickad')} skickade · ${n('fel')} fel · ${r.iMinnet} i minnet (30 dagar).`);
      for (const l of r.larm) console.log(`  ${l.status.padEnd(7)} ${l.typ.padEnd(11)} #${l.kanal.padEnd(24)} ${l.text.replace(/<@\d+>\s*/g, '').slice(0, 140)}`);
      for (const v of r.varningar) console.log(`  ⚠️ ${v}`);
    })
    .catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
