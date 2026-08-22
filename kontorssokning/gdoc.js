// Bygger ett HTML-dokument av objekt.json som Google Drive konverterar till ett Google-dokument.
//
//   node kontorssokning/gdoc.js > /tmp/kontorslistan.html
//
// HTML används för att Drive behåller rubriker, tabeller och klickbara länkar
// vid konverteringen. Markdown skulle bli en enda grå textmassa.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const alla = JSON.parse(readFileSync(join(HAR, 'objekt.json'), 'utf8'));
const params = JSON.parse(readFileSync(join(HAR, 'parametrar.json'), 'utf8'));

// --max-kvm=220 ger en delmängd. Annonser som anger ett spann ("180-1000 kvm")
// tas med om spannets undre gräns ryms, för då går den mindre ytan att hyra.
const maxArg = process.argv.find((a) => a.startsWith('--max-kvm='));
const MAX_KVM = maxArg ? Number(maxArg.split('=')[1]) : null;
const ryms = (o) =>
  (o.kvm != null && o.kvm <= MAX_KVM) ||
  (Array.isArray(o.kvm_intervall) && o.kvm_intervall[0] <= MAX_KVM);
const objekt = MAX_KVM ? alla.filter(ryms) : alla;
const viaSpann = MAX_KVM ? objekt.filter((o) => !(o.kvm != null && o.kvm <= MAX_KVM)) : [];

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const tal = (n) => (n == null ? '—' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
const hyra = (o) =>
  o.hyra_kr_man != null
    ? `${tal(o.hyra_kr_man)} kr/mån`
    : o.hyra_kr_kvm_ar != null
      ? `${tal(o.hyra_kr_kvm_ar)} kr/kvm/år`
      : '—';

const NIVANAMN = { 1: 'Hisingen', 2: 'Kungälv', 3: 'E6-korridoren' };

const perNiva = objekt.reduce((a, o) => ((a[o.niva] = (a[o.niva] || 0) + 1), a), {});
const perTyp = objekt.reduce((a, o) => ((a[o.typ] = (a[o.typ] || 0) + 1), a), {});
const saknar = (f) => objekt.filter((o) => o.okanda_falt.includes(f)).length;
const andel = (n) => Math.round((n / objekt.length) * 100);

const rader = [];
const ut = (s) => rader.push(s);

ut(`<h1>Kontorslokaler — Hisingen och Kungälv${MAX_KVM ? ` · max ${MAX_KVM} kvm` : ''}</h1>`);
ut(`<p><i>${objekt.length} lediga kontorslokaler${MAX_KVM ? ` på ${MAX_KVM} kvm eller mindre, utvalda ur den fullständiga listan på ${alla.length}` : ''}, hämtade ${alla[0]?.hamtad_datum ?? ''} och kontrollerade mot sina levande annonser. Sorterade på matchpoäng.</i></p>`);
if (MAX_KVM && viaSpann.length) {
  ut(`<p><i>${viaSpann.length} av dem är egentligen större lokaler vars annons erbjuder ett spann som börjar under ${MAX_KVM} kvm — de går alltså att hyra i mindre delar. De är märkta i tabellen.</i></p>`);
}

ut(`<h2>Sökkriterier</h2>`);
ut(`<table border="1" cellpadding="6" cellspacing="0"><tbody>`);
ut(`<tr><td><b>Verksamhet</b></td><td>${esc(params.verksamhet.bransch)}, ${params.verksamhet.antal_medarbetare.join('–')} personer, inget lagerbehov</td></tr>`);
ut(`<tr><td><b>Yta</b></td><td>minst ${params.skallkrav.min_kvm} kvm, riktvärde ${params.verksamhet.riktvarde_kvm.join('–')} kvm</td></tr>`);
ut(`<tr><td><b>Budget</b></td><td>ingen gräns satt — hyran redovisas rakt av</td></tr>`);
ut(`<tr><td><b>Tillträde</b></td><td>omgående föredras</td></tr>`);
ut(`<tr><td><b>Parkering</b></td><td>krav</td></tr>`);
ut(`<tr><td><b>Absolut nej</b></td><td>${esc(params.absoluta_nej.join(', '))}</td></tr>`);
ut(`</tbody></table>`);

ut(`<h2>Sammanfattning</h2>`);
ut(`<table border="1" cellpadding="6" cellspacing="0"><tbody>`);
ut(`<tr><td><b>Nivå 1 — Hisingen, Göteborg</b></td><td>${perNiva[1] || 0} objekt</td></tr>`);
ut(`<tr><td><b>Nivå 2 — Kungälvs kommun</b></td><td>${perNiva[2] || 0} objekt</td></tr>`);
ut(`<tr><td><b>Nivå 3 — E6-korridoren</b></td><td>${perNiva[3] || 0} objekt</td></tr>`);
ut(`<tr><td><b>Typ</b></td><td>${Object.entries(perTyp).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${k}`).join(', ')}</td></tr>`);
const park = (v) => objekt.filter((o) => o.parkering_status === v).length;
ut(`<tr><td><b>Parkering</b></td><td>${park('ja')} bekräftade · ${park('okant')} ej angivna · ${park('nej')} saknar bilparkering</td></tr>`);
ut(`<tr><td><b>Dusch nämnd</b></td><td>${objekt.filter((o) => o.plus.some((p) => /dusch/i.test(p))).length} objekt</td></tr>`);
ut(`</tbody></table>`);

ut(`<h2>Läs det här innan du ringer</h2>`);
ut(`<p>De stora luckorna i annonserna, räknat på alla ${objekt.length} objekt:</p><ul>`);
ut(`<li><b>Hyra saknas i ${saknar('hyra')} annonser (${andel(saknar('hyra'))} %).</b> Normalt på svensk lokalmarknad — priset sätts i förhandling. Hyra går alltså inte att sortera på.</li>`);
ut(`<li><b>Antal kontorsrum saknas i ${saknar('antal_kontorsrum')} annonser (${andel(saknar('antal_kontorsrum'))} %).</b> Det väger 25 av 100 poäng, så dessa har fått halv poäng. Flera kan ha fler rum än topplistan.</li>`);
ut(`<li><b>Parkering är obekräftad i ${park('okant') + park('nej')} annonser (${andel(park('okant') + park('nej'))} %)</b> — och parkering är ditt skallkrav. ${park('nej')} av dem nämner uttryckligen bara cykelparkering eller ingen alls.</li>`);
ut(`<li>Tillträde saknas i ${saknar('tilltrade')}, kontaktuppgifter i ungefär hälften.</li>`);
ut(`</ul>`);
ut(`<p>Fråga tre saker när du ringer: <b>hyra per månad inklusive drift</b>, <b>antal avskilbara rum</b>, och <b>om parkering ingår</b>.</p>`);
ut(`<p>Objektvision, Sveriges största marknadsplats, går inte att läsa maskinellt — deras bot-skydd blockerar allt. Ensamt på Hisingen har de 319 kontorsannonser som alltså <b>inte</b> finns i den här listan. Öppna <a href="https://objektvision.se/kontorslokaler/g%C3%B6teborg/hisingen">objektvision.se/kontorslokaler/göteborg/hisingen</a> i webbläsaren och titta själv.</p>`);

// Topp 10 med plus och minus. Delade kontorshotell är ett absolut nej och
// utesluts här - de finns kvar i den fullständiga tabellen, märkta.
const utanDelat = objekt.filter((o) => o.typ !== 'delat');
const antalDelat = objekt.length - utanDelat.length;
ut(`<h2>Topp 10</h2>`);
if (antalDelat) {
  ut(`<p><i>${antalDelat} delade kontorshotell är bortsorterade ur topplistan eftersom de är ett absolut nej. De finns kvar längre ner i den fullständiga tabellen, märkta "delat".</i></p>`);
}
for (const [i, o] of utanDelat.slice(0, 10).entries()) {
  ut(`<h3>${i + 1}. ${esc(o.adress)} — ${o.matchpoang} poäng</h3>`);
  ut(
    `<p>${esc(o.omrade)} (nivå ${o.niva}) · <b>${Array.isArray(o.kvm_intervall) ? `${tal(o.kvm_intervall[0])}–${tal(o.kvm_intervall[1])}` : tal(o.kvm)} kvm</b> · ${o.antal_kontorsrum != null ? `<b>${o.antal_kontorsrum} kontorsrum</b>` : 'rumsantal ej angivet'} · ${hyra(o)} · tillträde ${esc(o.tilltrade || 'ej angivet')}<br>` +
      `Hyresvärd: ${esc(o.hyresvard || 'ej angiven')}${o.kontakt.namn ? ` · ${esc(o.kontakt.namn)}` : ''}${o.kontakt.telefon ? ` · ${esc(o.kontakt.telefon)}` : ''}${o.kontakt.epost ? ` · ${esc(o.kontakt.epost)}` : ''}<br>` +
      `<a href="${esc(o.kalla_url[0])}">Öppna annonsen</a></p>`
  );
  ut(`<p>${esc(o.beskrivning)}</p>`);
  if (o.plus.length) ut(`<p><b>Plus:</b> ${o.plus.slice(0, 4).map(esc).join(' · ')}</p>`);
  if (o.minus.length) ut(`<p><b>Minus:</b> ${o.minus.slice(0, 4).map(esc).join(' · ')}</p>`);
}

// Hela listan
ut(`<h2>${MAX_KVM ? `Alla ${objekt.length} objekt på max ${MAX_KVM} kvm` : `Alla ${objekt.length} objekt`}</h2>`);
ut(`<p><i>Klicka på adressen för att öppna annonsen. Streck betyder att annonsen inte anger uppgiften.</i></p>`);
ut(`<table border="1" cellpadding="4" cellspacing="0"><thead><tr>` +
  `<th>#</th><th>Poäng</th><th>Adress</th><th>Område</th><th>Kvm</th><th>Rum</th><th>Hyra</th><th>Parkering</th><th>Hyresvärd</th>` +
  `</tr></thead><tbody>`);
for (const [i, o] of objekt.entries()) {
  const parkCell = { ja: 'ja', nej: 'nej', okant: '?' }[o.parkering_status] ?? '?';
  ut(
    `<tr><td>${i + 1}</td><td>${o.matchpoang}</td>` +
      `<td><a href="${esc(o.kalla_url[0])}">${esc(o.adress)}</a></td>` +
      `<td>${esc(o.omrade)} (N${o.niva}${o.typ !== 'kontor' ? ', ' + o.typ : ''})</td>` +
      `<td>${Array.isArray(o.kvm_intervall) ? `${tal(o.kvm_intervall[0])}–${tal(o.kvm_intervall[1])}` : tal(o.kvm)}</td><td>${o.antal_kontorsrum ?? '—'}</td>` +
      `<td>${hyra(o)}</td><td>${parkCell}</td>` +
      `<td>${esc((o.hyresvard || '—').split('(')[0].trim().slice(0, 40))}</td></tr>`
  );
}
ut(`</tbody></table>`);

ut(`<h2>Så räknas poängen</h2>`);
ut(`<p>Vikterna summerar till 100: yta ≥150 kvm ger 25, minst 5 kontorsrum ger 25, öppen planlösning 20, geografi 15 (nivå 1 full, nivå 2 halv, nivå 3 kvarts), hyra inom budget 10, tillträde 5.</p>`);
ut(`<p><b>Framgår något inte av annonsen ges halv poäng.</b> Ingen uppgift är framräknad eller gissad — saknas hyran står det streck, inte ett antagande. Eftersom ingen budgetgräns är satt får alla objekt full poäng på hyra, vilket gör att hyran just nu inte skiljer objekten åt.</p>`);
ut(`<p>Alla ${objekt.length} objekt är kontrollerade mot sin levande annons: sidan svarar, adressen står där och ytan står där.</p>`);

console.log(`<html><head><meta charset="utf-8"><title>Kontorslokaler — Hisingen och Kungälv</title></head><body>${rader.join('\n')}</body></html>`);
