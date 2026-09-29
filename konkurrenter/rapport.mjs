// konkurrenter/rapport.mjs — det Axel läser (svenska, kort, hans uppgifter
// sist) och det teamet ser i Discord (engelska, bara när ett nytt ärende
// finns). Inga påhittade tal: allt kommer ur körningens output och
// ärendeloggen.

import { STATUS } from './arenden.mjs';
import { tid, bevisStatus } from './klipp.mjs';

export const KANAL_INTRO = [
  'This channel gets a post when the copycat watch (Konkurrentdödaren) finds a store or an ad that copied our product texts or photos.',
  'Every case is reviewed by Axel before anything is sent. Nothing here is automatic towards the other party.',
].join('\n');

const datumKort = (iso) => (iso ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '?');
const motpart = (a) => (a.typ === 'annons' ? `${a.deras?.sidnamn ?? 'sida'}${a.deras?.domaner?.length ? ` (${a.deras.domaner[0]})` : ''}` : (a.deras?.doman ?? '?'));

/** Källornas läge på en rad var — vad som lästes och vad som inte gick. Ren. */
export function kallrader(korning = {}) {
  const ut = [];
  const b = korning.bing ?? {};
  const w = korning.websearch ?? null;
  if (w) ut.push(`Webbsök (sessionens WebSearch): ${w.rader ?? 0} kandidater på ${korning.sok?.fraser ?? '?'} fraser, ${b.kandidater ?? 0} sidor lästa${w.orsak ? ` — ${w.orsak}` : ''}`);
  if (b.fraser) ut.push(`Bing: ${b.fraser} fraser sökta, ${b.traffar ?? 0} träffar${b.fel?.length ? ` — ${b.fel.length} sökningar gick inte (${b.fel[0]})` : ''}`);
  const ab = korning.annonsbibliotek ?? null;
  if (ab) ut.push(`Annonsbiblioteket: sidan "${ab.sidnamn ?? '?'}" (${ab.sida ?? '?'}) läst i Chromium härifrån — ${ab.antal?.lasta ?? 0} annonser (${ab.antal?.aktiva ?? 0} aktiva), räckvidd läst för ${ab.antal?.rackvidd_last ?? 0}${ab.antal?.rackvidd_saknas ? `, saknas för ${ab.antal.rackvidd_saknas}` : ''}${ab.fel?.length ? ` — ${ab.fel.length} fel (${ab.fel[0]})` : ''}`);
  if (korning.annonsfil) ut.push(`Annonser ur ${korning.annonsfil} ${ab ? '(annonsbiblioteket)' : '(Axels lista)'} jämförda mot ${korning.sok?.produkter ?? '?'} produkter och ${korning.sok?.annonser ?? '?'} av våra aktiva annonser`);
  else if (!w && !b.fraser) ut.push(`Webbsök: ingen kandidatfil för dagen — bara Ad Library och egna länkar (${b.kandidater ?? 0} sidor lästa)`);
  const al = korning.adLibrary ?? {};
  if (al.status === 'ok') ut.push(`Ad Library: ${al.annonser ?? 0} främmande annonser lästa på ${al.termer ?? 0} söktermer`);
  else if (al.status === 'saknar_behorighet') ut.push('Ad Library: SAKNAR BEHÖRIGHET — Metas API släpper inte in token:en förrän identiteten är bekräftad (Axels klick, se uppgifterna nedan)');
  else if (al.status) ut.push(`Ad Library: ${al.status}${al.fel ? ` — ${al.fel}` : ''}`);
  const bi = korning.bilder ?? {};
  ut.push(bi.status === 'ok' ? `Bilder: ${bi.hashade ?? 0} bilder jämförda i Chromium` : `Bilder: EJ jämförda${bi.orsak ? ` — ${bi.orsak}` : ''}`);
  if (korning.egnaAnnonser?.fel?.length) ut.push(`Egna annonser: ${korning.egnaAnnonser.fel.map((f) => `${f.namn}: ${f.fel}`).join(' · ')}`);
  return ut;
}

/** Ett ärende som tre–fyra rader till Axel. Ren. */
export function arendeRader(a, { sidaUrl = null } = {}) {
  const ut = [];
  ut.push(`**${a.id}** · ${a.var?.produkt?.titel ?? a.var?.produkt?.handle ?? '?'} ← ${motpart(a)} · ${String(a.styrka ?? '?').toUpperCase()}`);
  for (const s of (a.skal ?? []).slice(0, 3)) ut.push(`   – ${s}`);
  const p = a.bevis?.text?.passager?.[0] ?? a.bevis?.annons?.passager?.[0];
  if (p) ut.push(`   ”${p.text.slice(0, 160)}${p.text.length > 160 ? '…' : ''}”`);
  ut.push(`   Deras sida: ${a.deras?.url ?? a.deras?.snapshot ?? '?'}`);
  if (a.status === STATUS.NY) {
    ut.push(`   Mottagare: ${a.brev?.mottagare ?? 'INGEN ADRESS HITTAD — skriv den själv: --till <adress>'}`);
    ut.push(`   Skicka: /konkurrentdodaren skicka ${a.id}${a.brev?.mottagare ? '' : ' --till <adress>'}   ·   Ingen kopia: /konkurrentdodaren avfarda ${a.id} "varför"`);
  } else if (a.status === STATUS.SKICKAD || a.status === STATUS.PAMIND) {
    ut.push(`   Brev ${a.status === STATUS.PAMIND ? 'och påminnelse ' : ''}skickat ${datumKort(a.brev?.skickat?.nar)} till ${a.brev?.skickat?.till ?? '?'}${a.uppfoljning ? ` · kollad ${datumKort(a.uppfoljning.nar)}: ${a.uppfoljning.kvar ? 'kopian ligger KVAR' : 'kopian är borta'}` : ''}`);
  }
  if (sidaUrl) ut.push(`   Granska: ${sidaUrl}#${a.id}`);
  return ut;
}

/**
 * Rapporten till Axel. `nya`/`uppdaterade`/`oppna` är ärenden, `korning` är
 * körningens räkneverk, `sidaUrl` granskningssidan.
 */
export function rapportSv({ datum, korning = {}, nya = [], uppdaterade = [], oppna = [], sidaUrl = null, atgardade = [], pamindKlara = [], ejVarda = [] } = {}) {
  const r = [];
  r.push(`# Konkurrentdödaren ${datum}`);
  r.push('');
  const s = korning.sok ?? {};
  r.push(`Sökte ${s.produkter ?? 0} produkter (${s.fraser ?? korning.bing?.fraser ?? 0} fraser) → ${korning.bing?.kandidater ?? 0} främmande sidor lästa → **${nya.length} nya ärenden**, ${uppdaterade.length} sedda igen.`);
  for (const k of kallrader(korning)) r.push(`- ${k}`);
  r.push('');
  if (nya.length) {
    r.push(`## Nya kopior — väntar på ditt beslut (${nya.length})`);
    for (const a of nya) { r.push(...arendeRader(a, { sidaUrl })); r.push(''); }
  } else {
    r.push('## Inga nya kopior i dag.');
    r.push('');
  }
  if (ejVarda.length) {
    // Axels kriterier (2026-09-29): kopior finns, men sidan är inte värd att jaga — inget ärende, inget brev.
    r.push(`## Under din tröskel — inget ärende (${ejVarda.length})`);
    for (const f of ejVarda) {
      const v = f.varde ?? {};
      r.push(`- ${f.deras?.sidnamn ?? f.deras?.doman ?? '?'} (${f.verksamhet ?? '?'}): ${f.bevis?.annonser?.length ?? 0} annons(er) återger vårt, men ${v.orsak ?? 'under tröskeln'}. Tröskeln är en annons över ${Number(v.minRackvidd ?? 10000).toLocaleString('sv-SE').replace(/[  ]/g, ' ')} i räckvidd eller ${v.minLive ?? 10} live. Vill du jaga ändå: \`node konkurrenter/kor.mjs --rapport --tvinga\`.`);
    }
    r.push('');
  }
  if (atgardade.length) {
    r.push(`## Borta efter brevet (${atgardade.length})`);
    for (const a of atgardade) r.push(`- ${a.id} · ${motpart(a)} — kopian är borta vid kontrollen ${datumKort(a.uppfoljning?.nar)}`);
    r.push('');
  }
  if (pamindKlara.length) {
    r.push(`## Fristen har gått ut, kopian ligger kvar (${pamindKlara.length})`);
    for (const a of pamindKlara) r.push(`- ${a.id} · ${motpart(a)} — brev ${datumKort(a.brev?.skickat?.nar)}, kollad ${datumKort(a.uppfoljning?.nar)}. Påminnelse: /konkurrentdodaren paminn ${a.id}`);
    r.push('');
  }
  const ovriga = oppna.filter((a) => !nya.some((n) => n.id === a.id) && !pamindKlara.some((n) => n.id === a.id));
  if (ovriga.length) {
    r.push(`## Öppna sedan tidigare (${ovriga.length})`);
    for (const a of ovriga) r.push(`- ${a.id} · ${a.status.toUpperCase()} · ${a.var?.produkt?.titel ?? '?'} ← ${motpart(a)}${a.brev?.skickat ? ` · brev ${datumKort(a.brev.skickat.nar)}` : ''}`);
    r.push('');
  }
  const fel = korning.fel ?? [];
  if (fel.length) {
    r.push(`## Gick inte (${fel.length})`);
    for (const f of fel.slice(0, 12)) r.push(`- ${f}`);
    r.push('');
  }
  // Axels uppgifter — sist, numrerade, en per rad.
  const uppgifter = [];
  if (sidaUrl && (nya.length || pamindKlara.length)) uppgifter.push(`Öppna granskningssidan: ${sidaUrl}`);
  for (const a of nya) uppgifter.push(`${a.id}: titta på bevisen. Är det en kopia: skriv \`/konkurrentdodaren skicka ${a.id}${a.brev?.mottagare ? '' : ' --till <deras mejladress>'}\` i chatten. Är det inte det: \`/konkurrentdodaren avfarda ${a.id} "varför"\`.`);
  for (const a of pamindKlara) uppgifter.push(`${a.id}: fristen har gått ut och kopian ligger kvar. Skicka påminnelsen: \`/konkurrentdodaren paminn ${a.id}\` — eller anmäl vidare (Meta/Shopify) och skriv \`/konkurrentdodaren eskalera ${a.id}\`.`);
  if (korning.adLibrary?.status === 'saknar_behorighet') uppgifter.push('Ad Library (konkurrenternas ANNONSER, inte bara deras sidor): bekräfta din identitet på https://www.facebook.com/ID och klicka "Kom igång" på https://www.facebook.com/ads/library/api. Tar 1–2 dagar hos Meta. Rutinen börjar läsa annonserna av sig själv när det är klart.');
  r.push('## Dina uppgifter');
  if (!uppgifter.length) r.push('Inget för dig i dag.');
  uppgifter.forEach((u, i) => r.push(`${i + 1}. ${u}`));
  return r.join('\n');
}

/** Discord-posten (engelska). Bara när det finns något nytt att titta på. */
export function rapportEn({ datum, nya = [], pamindKlara = [], sidaUrl = null } = {}) {
  if (!nya.length && !pamindKlara.length) return null;
  const r = [];
  r.push(`**Copycat watch ${datum}** — ${nya.length} new suspected ${nya.length === 1 ? 'copy' : 'copies'} awaiting review${pamindKlara.length ? `, ${pamindKlara.length} past deadline` : ''}.`);
  for (const a of nya) {
    r.push(`• ${a.id} — \`${a.var?.produkt?.titel ?? a.var?.produkt?.handle ?? '?'}\` copied by \`${motpart(a)}\` (${String(a.styrka ?? '?').toUpperCase()}: ${(a.skalEn ?? [])[0] ?? 'see the review page'})`);
  }
  for (const a of pamindKlara) r.push(`• ${a.id} — \`${motpart(a)}\`: deadline passed, material still up.`);
  if (sidaUrl) r.push(`Review page: ${sidaUrl}`);
  r.push('Nothing is sent to the other party until Axel approves the case.');
  return r.join('\n');
}

// ------------------------------------------------------------------ ärendefilen

/** konkurrenter/arenden/<id>.md — bevisen och historiken som läsbar fil (committas). Ren. */
export function arendeMd(a) {
  const prod = a.var?.produkt ?? {};
  const deras = a.deras ?? {};
  const r = [];
  r.push(`# ${a.id} — ${prod.titel ?? prod.handle ?? '?'} ← ${motpart(a)}`);
  r.push('');
  r.push(`Status: **${a.status}** · Styrka: **${a.styrka ?? '?'}** · Verksamhet: ${a.verksamhet ?? '?'} · Typ: ${a.typ}`);
  r.push(`Hittad ${a.skapad} · senast sedd ${a.senast_sedd} (${a.sedd_ganger ?? 1} ggr) · källa: ${a.kalla ?? '?'}`);
  r.push('');
  r.push('## Vårt');
  r.push(`- Produkt: ${prod.titel ?? '?'} — ${prod.url ?? '?'}`);
  if (a.var?.annons?.namn) r.push(`- Annons: ${a.var.annons.namn} (${a.var.annons.id ?? '?'})`);
  r.push('');
  r.push('## Deras');
  r.push(`- Sida: ${deras.url ?? deras.snapshot ?? '?'}`);
  if (deras.titel) r.push(`- Titel: ${deras.titel}`);
  if (deras.sidnamn) r.push(`- Facebook-sida: ${deras.sidnamn} (${deras.sidaId ?? '?'})`);
  r.push(`- Plattform: ${deras.plattform ?? '?'} · språk: ${deras.lang ?? '?'}`);
  if (deras.orgnr?.length) r.push(`- Org.nr: ${deras.orgnr.map((o) => `${o.typ} ${o.nr}`).join(', ')}`);
  if (deras.kontakt?.epost?.length) r.push(`- Adresser: ${deras.kontakt.epost.join(', ')} (${(deras.kontakt.kallor ?? []).join(', ')})`);
  r.push(`- Vald mottagare: ${a.brev?.mottagare ?? 'ingen hittad'}`);
  r.push('');
  r.push('## Skäl');
  for (const s of a.skal ?? []) r.push(`- ${s}`);
  const text = a.bevis?.text?.styrka ? a.bevis.text : null;
  if (text) {
    r.push('');
    r.push(`## Kopierad text — ${text.kopieradeOrd} ord, längsta sviten ${text.langsta}, täckning ${Math.round((text.tackning ?? 0) * 100)} %`);
    for (const p of text.passager ?? []) r.push(`> ${p.text}\n> _(${p.ord} ord)_`);
  }
  const annons = a.bevis?.annons?.styrka ? a.bevis.annons : null;
  if (annons) {
    r.push('');
    r.push(`## Vår annonstext hos dem — längsta sviten ${annons.langsta} ord`);
    for (const p of annons.passager ?? []) r.push(`> ${p.text}\n> _(${p.ord} ord)_`);
  }
  if (a.bevis?.bilder?.length) {
    r.push('');
    r.push(`## Samma bilder (${a.bevis.bilder.length})`);
    r.push('| Vår | Deras | Avstånd | Grad |');
    r.push('|---|---|---|---|');
    for (const b of a.bevis.bilder) r.push(`| ${b.egen} | ${b.deras} | ${b.avstand}/64 | ${b.grad} |`);
  }
  // Klippen (Axel 2026-09-29): rutorna ur våra egna klipp per annons — miniatyrträffen är det lånade klippet och används inte som bevis.
  const medKlipp = (a.bevis?.annonser ?? []).filter((t) => t.klipp?.antal);
  if (medKlipp.length) {
    r.push('');
    r.push(`## Rutorna ur våra egna klipp (${medKlipp.length} annonser)`);
    r.push('| Annons | Vår film | Par (deras ↔ vår, avstånd) | Andel av deras rutor som matchar |');
    r.push('|---|---|---|---|');
    for (const t of medKlipp) r.push(`| ${t.lank ?? t.nr} | ${(t.klipp.filmer ?? []).join(', ') || t.varAnnons?.namn || '?'} | ${(t.klipp.par ?? []).map((p) => `${p.bokstav} ${tid(p.derasT)} ↔ ${p.film ? `${p.film} ` : ''}${p.egenT === null || p.egenT === undefined ? 'thumbnail' : tid(p.egenT)} (${p.avstand}/64)`).join(', ')} | ${t.klipp.andel} %${t.klipp.jamforda ? ` (${t.klipp.jamforda} filmer jämförda)` : ''} |`);
    r.push('');
    r.push('Miniatyrträffen (annonsens förhandsbild) är ett lånat klipp och används inte som bevis (Axel 2026-09-29).');
    const obevisade = (a.bevis?.annonser ?? []).filter((t) => !bevisStatus(t).bevisad);
    if (obevisade.length) { r.push(''); r.push(`**Inte bevisade med vårt eget material (${obevisade.length}) — tas inte med i brev, faktura eller anmälan:** ${obevisade.map((t) => `annons ${t.nr} (${bevisStatus(t).orsak})`).join('; ')}`); }
  }
  if (a.bevis?.skarmdump?.fil) { r.push(''); r.push(`Skärmdump: \`${a.bevis.skarmdump.fil}\` (${a.bevis.skarmdump.nar ?? ''})`); }
  if (a.brev?.skickat) {
    r.push('');
    r.push('## Brevet');
    r.push(`- Skickat ${a.brev.skickat.nar} till ${a.brev.skickat.till} från ${a.brev.skickat.fran ?? '?'} (${a.brev.skickat.sprak ?? '?'})`);
    r.push(`- Ämne: ${a.brev.skickat.amne}`);
    if (a.brev.frist) r.push(`- Frist: ${a.brev.frist}`);
    if (a.brev.paminnelse) r.push(`- Påminnelse ${a.brev.paminnelse.nar} till ${a.brev.paminnelse.till}`);
  }
  if (a.uppfoljning) { r.push(''); r.push(`## Uppföljning\n- ${a.uppfoljning.nar}: ${a.uppfoljning.kvar ? 'kopian ligger kvar' : 'kopian är borta'} (${a.uppfoljning.detalj ?? ''})`); }
  r.push('');
  r.push('## Historik');
  for (const h of a.historik ?? []) r.push(`- ${h.nar}: ${h.fran ?? '—'} → ${h.till} (${h.av})${h.not ? ` — ${h.not}` : ''}`);
  r.push('');
  return r.join('\n');
}
