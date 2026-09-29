// konkurrenter/sida.mjs — granskningssidan: alla ärenden med bevisen sida
// vid sida (vår text ↔ deras, våra bilder ↔ deras, skärmdumpen), mottagaren
// och exakt det kommando Axel skriver för att skicka eller avfärda. Byggs
// som en fil (konkurrenter/output/sida.html) och publiceras som artifact av
// sessionen på samma länk varje gång (konkurrenter/sida.json).
//
// Bilderna är inbäddade som data-URI:er (artifact-visaren blockerar bilder
// från andra domäner, lärdomen från Klaviyo-gallerierna 2026-09-25). Inga
// externa skript. Svenska — sidan är Axels.

import { STATUS } from './arenden.mjs';
import { belopp } from './faktura.mjs';
import { bevisStatus } from './klipp.mjs';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attr = esc;
const datumLang = (iso) => (iso ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '?');
const motpart = (a) => (a.typ === 'annons' ? (a.deras?.sidnamn ?? 'annonssida') : (a.deras?.doman ?? '?'));

const STYRKA = { stark: 'Stark kopia', trolig: 'Trolig kopia' };
const STATUSORD = { ny: 'Väntar på dig', skickad: 'Brev skickat', pamind: 'Påminnelse skickad', atgardad: 'Borta', avfardad: 'Avfärdat', eskalerad: 'Anmält vidare' };

const CSS = `
:root{--bg:#f2f4f1;--yta:#ffffff;--yta2:#e9ecE6;--text:#151a21;--dis:#5b6570;--linje:#d5dad2;--accent:#0e6a86;--accent-text:#ffffff;--stark:#a24a08;--stark-bg:#fbe9d8;--trolig:#2f5f8f;--trolig-bg:#e1ecf7;--ok:#2b7a4b;--ok-bg:#def0e3;--av:#6b7280;--av-bg:#e7e9ec;--kod:#0f1720;--kod-text:#e6edf3;--mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;--disp:'Barlow Condensed','Arial Narrow',Arial,sans-serif;--brod:'Source Sans 3','Segoe UI',system-ui,sans-serif}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){color-scheme:dark;--bg:#0e1216;--yta:#161c23;--yta2:#1e262f;--text:#e6eaef;--dis:#9aa5b1;--linje:#2a343f;--accent:#5fbcd9;--accent-text:#0a1a22;--stark:#f0a35c;--stark-bg:#3a2410;--trolig:#8ab8e6;--trolig-bg:#14283b;--ok:#6fc48f;--ok-bg:#12301d;--av:#9aa5b1;--av-bg:#232b34;--kod:#050a0f;--kod-text:#dbe4ec}}
:root[data-theme="dark"]{color-scheme:dark;--bg:#0e1216;--yta:#161c23;--yta2:#1e262f;--text:#e6eaef;--dis:#9aa5b1;--linje:#2a343f;--accent:#5fbcd9;--accent-text:#0a1a22;--stark:#f0a35c;--stark-bg:#3a2410;--trolig:#8ab8e6;--trolig-bg:#14283b;--ok:#6fc48f;--ok-bg:#12301d;--av:#9aa5b1;--av-bg:#232b34;--kod:#050a0f;--kod-text:#dbe4ec}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:var(--brod);font-size:17px;line-height:1.5;margin:0}
.ram{max-width:1080px;margin:0 auto;padding-inline:16px;padding-block:24px 64px;display:grid;gap:28px}
h1,h2,h3{font-family:var(--disp);font-weight:700;letter-spacing:.01em;text-wrap:balance;margin:0}
h1{font-size:clamp(34px,6vw,54px);line-height:1.02}
h2{font-size:clamp(24px,4vw,32px);line-height:1.1}
h3{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:var(--dis);font-weight:600}
p{margin:0}
a{color:var(--accent)}
.eyebrow{font-family:var(--mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--dis)}
.topp{display:grid;gap:12px}
.meta{color:var(--dis);font-size:15px}
.summa{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
.tal{background:var(--yta);border:1px solid var(--linje);border-radius:8px;padding:10px 14px;min-width:132px;display:grid;gap:2px}
.tal b{font-family:var(--disp);font-size:30px;line-height:1;font-variant-numeric:tabular-nums}
.tal span{font-size:13px;color:var(--dis);text-transform:uppercase;letter-spacing:.06em}
.hur{background:var(--yta2);border-radius:10px;padding:14px 18px;display:grid;gap:6px;font-size:16px}
.hur ol{margin:0;padding-left:22px;display:grid;gap:4px}
.arende{background:var(--yta);border:1px solid var(--linje);border-radius:12px;padding:20px;display:grid;gap:18px;scroll-margin-top:16px}
.arende.stangd{opacity:.82}
.arende > header{display:grid;gap:8px}
.rad{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.id{font-family:var(--mono);font-size:14px;background:var(--yta2);padding:3px 8px;border-radius:6px}
.chip{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:4px 10px;border-radius:999px;border:1px solid transparent}
.chip.stark{background:var(--stark-bg);color:var(--stark)}
.chip.trolig{background:var(--trolig-bg);color:var(--trolig)}
.chip.ny{background:var(--stark-bg);color:var(--stark)}
.chip.skickad,.chip.pamind{background:var(--trolig-bg);color:var(--trolig)}
.chip.atgardad{background:var(--ok-bg);color:var(--ok)}
.chip.avfardad,.chip.eskalerad{background:var(--av-bg);color:var(--av)}
.skal{margin:0;padding-left:20px;display:grid;gap:4px}
.par{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media (max-width:700px){.par{grid-template-columns:1fr}}
.kol{display:grid;gap:8px;align-content:start;border:1px solid var(--linje);border-radius:10px;padding:12px;background:var(--bg)}
.kol img{width:100%;height:auto;border-radius:6px;display:block;background:#fff}
.kol .lank{font-family:var(--mono);font-size:13px;word-break:break-all}
.citat{display:grid;gap:10px}.obevisade{margin:10px 0 0;font-size:14px;color:var(--varning, #a24a08)}
.citat blockquote{margin:0;padding:10px 14px;border-left:4px solid var(--stark);background:var(--yta2);border-radius:0 8px 8px 0;font-size:16px}
.citat blockquote small{display:block;color:var(--dis);font-size:13px;margin-top:4px;font-family:var(--mono)}
.bildpar{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.bildpar figure{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:6px;border:1px solid var(--linje);border-radius:8px;padding:8px;background:var(--bg)}
.bildpar img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:4px;background:#fff}
.bildpar figcaption{grid-column:1/-1;font-size:13px;color:var(--dis);font-family:var(--mono)}
.gor{display:grid;gap:10px;border-top:1px dashed var(--linje);padding-top:14px}
.kommando{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.kommando code{font-family:var(--mono);font-size:15px;background:var(--kod);color:var(--kod-text);padding:8px 12px;border-radius:8px;word-break:break-all}
.kommando small{color:var(--dis);font-size:14px;flex-basis:100%}
button.kopiera{font:600 14px var(--brod);background:var(--accent);color:var(--accent-text);border:0;border-radius:8px;padding:8px 14px;cursor:pointer}
button.kopiera:focus-visible{outline:3px solid var(--stark);outline-offset:2px}
details{border:1px solid var(--linje);border-radius:8px;padding:8px 12px;background:var(--bg)}
details summary{cursor:pointer;font-weight:600}
details pre{white-space:pre-wrap;font-family:var(--brod);font-size:15px;margin:10px 0 0;line-height:1.45}
.mottagare{font-family:var(--mono);font-size:15px}
.varning{color:var(--stark);font-weight:600}
.kallor{display:grid;gap:4px;font-size:14px;color:var(--dis)}
.tom{background:var(--yta);border:1px dashed var(--linje);border-radius:12px;padding:28px;text-align:center;color:var(--dis)}
@media (prefers-reduced-motion:no-preference){button.kopiera{transition:transform .08s}button.kopiera:active{transform:scale(.97)}}
`;

const JS = `
document.addEventListener('click',function(e){var b=e.target.closest('button.kopiera');if(!b)return;var t=b.getAttribute('data-text')||'';var klar=function(){var g=b.textContent;b.textContent='Kopierat';setTimeout(function(){b.textContent=g},1400)};
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(klar,function(){valj(b)})}else{valj(b)}
function valj(b){var c=b.parentElement.querySelector('code');if(!c)return;var r=document.createRange();r.selectNodeContents(c);var s=window.getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Markerat — kopiera med Ctrl+C'}});
`;

function bildBlock(bild, { miniatyr }) {
  const src = bild ? miniatyr(bild) : null;
  return src ? `<img src="${attr(src)}" alt="">` : '<p class="meta">Ingen bild sparad.</p>';
}

function arendeHtml(a, { miniatyr, skarmdump, brevtext }) {
  const oppet = [STATUS.NY, STATUS.SKICKAD, STATUS.PAMIND].includes(a.status);
  const prod = a.var?.produkt ?? {};
  const deras = a.deras ?? {};
  const text = a.bevis?.text?.styrka ? a.bevis.text : (a.bevis?.annons?.styrka ? a.bevis.annons : null);
  const passager = (text?.passager ?? []).slice(0, 5);
  // Bara det som är bevisat med vårt eget material (bevisStatus) räknas; resten står för sig med orsak.
  const allaAnnonser = Array.isArray(a.bevis?.annonser) ? a.bevis.annonser.filter((t) => t.text?.styrka || t.bilder?.length || t.klipp?.antal || t.klippStatus) : [];
  const annonser = allaAnnonser.filter((t) => bevisStatus(t).bevisad);
  const obevisade = allaAnnonser.filter((t) => !bevisStatus(t).bevisad);
  const bilder = a.bevis?.bilder ?? [];
  const sd = skarmdump(a);
  const mottagare = a.brev?.mottagare ?? null;
  const skickaKommando = `/konkurrentdodaren skicka ${a.id}${mottagare ? '' : ' --till <deras mejladress>'}`;
  const avfardaKommando = `/konkurrentdodaren avfarda ${a.id} "ingen kopia"`;
  const brev = brevtext ? brevtext(a) : null;
  const faktura = a.faktura ?? null;
  const fakturaGrund = faktura?.berakning === 'exponeringar' && faktura.cpm?.sek ? ` — ${esc(String(faktura.exponeringar).replace(/\B(?=(\d{3})+(?!\d))/g, ' '))} exponeringar × CPM ${esc(belopp(faktura.cpm.sek, 'SEK', 'sv', 1))}${faktura.momsProcent ? `, moms ${faktura.momsProcent} %` : ''}` : faktura ? ` — schablontaxa${faktura.momsProcent ? `, moms ${faktura.momsProcent} %` : ''}` : '';
  const fakturaRad = faktura ? `Fakturan ${esc(faktura.nr)} på <strong>${esc(belopp(faktura.brutto, faktura.valuta, faktura.sprak))}</strong>${fakturaGrund} (förfaller ${esc(faktura.forfaller)}) följer med brevet som PDF.` : 'Fakturan byggs ur bevisen när du skickar: deras exponeringar × vår uppmätta CPM per annons, schablon när exponeringar saknas (konkurrenter/konfig.json).';
  const paket = a.brev?.paket && !a.brev?.skickat ? a.brev.paket : null;
  const skickadKommando = `/konkurrentdodaren skickad ${a.id}${mottagare ? '' : ' --till <deras mejladress>'}`;

  const beslut = a.status === STATUS.NY ? `
    <section class="gor">
      <h3>Ditt beslut</h3>
      <p>Brevet går från <span class="mottagare">${esc(a.brev?.fran ?? '?')}</span> (Stonebite-mejlen) till ${mottagare ? `<span class="mottagare">${esc(mottagare)}</span>` : '<span class="varning">ingen adress hittad — skriv den själv i kommandot</span>'}. ${fakturaRad} Inget går ut förrän du skrivit kommandot: då lägger sessionen brevet och fakturan som utkast i din Gmail, och du trycker Skicka där.</p>
      ${paket ? `<p class="varning">Sändpaketet är byggt ${esc(datumLang(paket.nar))}${paket.stoppad ? ` men stoppat: ${esc(paket.stoppad.join('; '))}` : ' — ligger som utkast i Gmail om sessionen hann dit. När det gått ut, kvittera:'}</p>${paket.stoppad ? '' : `<div class="kommando"><code>${esc(skickadKommando)}</code><button class="kopiera" type="button" data-text="${attr(skickadKommando)}">Kopiera</button><small>Kvittot: ärendet blir "brev skickat" och fristen börjar räknas.</small></div>`}` : ''}
      <div class="kommando"><code>${esc(skickaKommando)}</code><button class="kopiera" type="button" data-text="${attr(skickaKommando)}">Kopiera</button><small>Är det en kopia: skicka (brev + faktura).</small></div>
      <div class="kommando"><code>${esc(avfardaKommando)}</code><button class="kopiera" type="button" data-text="${attr(avfardaKommando)}">Kopiera</button><small>Är det ingen kopia: avfärda, så kommer den inte upp igen.</small></div>
      ${brev ? `<details><summary>Brevet som skickas (${brev.sprak === 'sv' ? 'svenska' : 'engelska'})</summary><pre>${esc(brev.amne)}\n\n${esc(brev.text)}</pre></details>` : ''}
    </section>` : `
    <section class="gor">
      <h3>Läge</h3>
      <p>${esc(STATUSORD[a.status] ?? a.status)}${a.brev?.skickat ? ` — brev skickat ${esc(datumLang(a.brev.skickat.nar))} till <span class="mottagare">${esc(a.brev.skickat.till)}</span>${a.brev.skickat.via ? ` via ${esc(a.brev.skickat.via)}` : ''}` : ''}${faktura && a.brev?.skickat ? `, faktura ${esc(faktura.nr)} på ${esc(belopp(faktura.brutto, faktura.valuta, faktura.sprak))} förfaller ${esc(faktura.forfaller)}` : ''}${a.uppfoljning ? `. Kollad ${esc(datumLang(a.uppfoljning.nar))}: ${a.uppfoljning.kvar ? '<span class="varning">kopian ligger kvar</span>' : 'kopian är borta'}` : ''}.</p>
      ${a.status === STATUS.SKICKAD && a.uppfoljning?.kvar ? `<div class="kommando"><code>/konkurrentdodaren paminn ${esc(a.id)}</code><button class="kopiera" type="button" data-text="/konkurrentdodaren paminn ${attr(a.id)}">Kopiera</button><small>Fristen har gått ut. Påminnelsen är brev nummer två.</small></div>` : ''}
      ${[STATUS.SKICKAD, STATUS.PAMIND].includes(a.status) ? `<div class="kommando"><code>/konkurrentdodaren eskalera ${esc(a.id)}</code><button class="kopiera" type="button" data-text="/konkurrentdodaren eskalera ${attr(a.id)}">Kopiera</button><small>När du anmält vidare till Meta/Shopify själv.</small></div>` : ''}
    </section>`;

  return `
<article class="arende${oppet ? '' : ' stangd'}" id="${attr(a.id)}">
  <header>
    <div class="rad"><span class="id">${esc(a.id)}</span><span class="chip ${attr(a.styrka ?? 'trolig')}">${esc(STYRKA[a.styrka] ?? a.styrka ?? '?')}</span><span class="chip ${attr(a.status)}">${esc(STATUSORD[a.status] ?? a.status)}</span></div>
    <h2>${esc(prod.titel ?? prod.handle ?? '?')} ← ${esc(motpart(a))}</h2>
    <p class="meta">Hittad ${esc(datumLang(a.skapad))} · sedd ${a.sedd_ganger ?? 1} ${a.sedd_ganger === 1 ? 'gång' : 'gånger'} · ${esc(a.verksamhet ?? '')}${deras.plattform ? ` · deras plattform: ${esc(deras.plattform)}` : ''}${deras.orgnr?.length ? ` · org.nr ${esc(deras.orgnr.map((o) => o.nr).join(', '))}` : ''}</p>
  </header>
  <ul class="skal">${(a.skal ?? []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
  <div class="par">
    <div class="kol"><h3>Vårt</h3>${bildBlock(prod.bilder?.[0] ?? a.var?.annons?.bild, { miniatyr })}<p><a href="${attr(prod.url ?? '#')}" target="_blank" rel="noopener">${esc(prod.titel ?? prod.url ?? '?')}</a></p>${a.var?.annons?.namn ? `<p class="meta">Annons: ${esc(a.var.annons.namn)}</p>` : ''}</div>
    <div class="kol"><h3>Deras</h3>${sd ? `<img src="${attr(sd)}" alt="Skärmdump av ${attr(motpart(a))}">` : bildBlock(bilder[0]?.deras ?? deras.bilder?.[0] ?? null, { miniatyr })}<p class="lank"><a href="${attr(deras.url ?? deras.snapshot ?? '#')}" target="_blank" rel="noopener">${esc(deras.url ?? deras.snapshot ?? '?')}</a></p>${deras.titel ? `<p class="meta">${esc(deras.titel)}</p>` : ''}${deras.kontakt?.epost?.length ? `<p class="meta">Adresser på deras sida: ${esc(deras.kontakt.epost.slice(0, 4).join(', '))}</p>` : ''}</div>
  </div>
  ${annonser.length ? `<section class="citat"><h3>Deras annonser som återger våra — ${annonser.length} st${annonser.some((t) => t.aktiv !== undefined && t.aktiv !== null) ? ` (${annonser.filter((t) => t.aktiv !== false).length} live)` : ''}</h3>${[...annonser].sort((x, y) => (y.aktiv === false ? 0 : 1) - (x.aktiv === false ? 0 : 1) || (y.exponeringar ?? 0) - (x.exponeringar ?? 0)).map((t) => `<blockquote>${t.text?.passager?.[0] ? `”${esc(t.text.passager[0].text)}”` : '<em>ingen ordagrann text — bilden är beviset</em>'}<small>${t.lank ? `<a href="${attr(t.lank)}" target="_blank" rel="noopener">annons ${t.nr}</a>` : `annons ${t.nr}`}${bevisStatus(t).text && t.varAnnons?.namn ? ` ← vår ${esc(t.varAnnons.namn)}` : ''}${bevisStatus(t).text ? ` · ${t.text.langsta} ord i följd, ${t.text.kopieradeOrd} ord totalt` : ''}${t.klipp?.antal ? ` · filmen klippt ur våra ${esc((t.klipp.filmer ?? []).join(', '))} (${t.klipp.antal} rutor ur olika scener, ${t.klipp.andel} % matchar)` : bevisStatus(t).overifierad ? ' · ⚠️ bara miniatyren matchar — klippen inte kontrollerade' : bevisStatus(t).bild ? ` · ${t.bilder.length} bild(er) lika våra` : ''}${t.video ? ' · video' : ''}${t.aktiv === false ? ' · AVSTÄNGD' : t.aktiv === true ? ' · LIVE' : ''}${t.exponeringar ? ` · räckvidd ${esc(String(t.exponeringar).replace(/\B(?=(\d{3})+(?!\d))/g, ' '))}` : ''}${t.produkt?.titel ? ` · vår produkt: ${esc(t.produkt.titel)}` : ''}</small></blockquote>`).join('')}${obevisade.length ? `<p class="obevisade"><strong>Inte med i brev, faktura eller anmälan (${obevisade.length}):</strong> ${obevisade.map((t) => `annons ${esc(t.nr)} — ${esc(bevisStatus(t).orsak)}`).join(' · ')}</p>` : ''}</section>` : passager.length ? `<section class="citat"><h3>Kopierad text — ${esc(text.kopieradeOrd)} ord ordagrant, längsta sviten ${esc(text.langsta)} ord</h3>${passager.map((p) => `<blockquote>”${esc(p.text)}”<small>${p.ord} ord i följd${text === a.bevis?.annons ? ' · ur vår annonstext' : ' · ur vår produktsida'}</small></blockquote>`).join('')}</section>` : ''}
  ${bilder.length ? `<section><h3>Samma bilder — ${bilder.length} st</h3><div class="bildpar">${bilder.slice(0, 8).map((b) => `<figure>${bildBlock(b.egen, { miniatyr })}${bildBlock(b.deras, { miniatyr })}<figcaption>vår ↔ deras · ${esc(b.grad)} (avstånd ${b.avstand}/64)</figcaption></figure>`).join('')}</div></section>` : ''}
  ${beslut}
</article>`;
}

/**
 * Hela sidan. `miniatyr(url)` ger en data-URI eller null, `skarmdump(arende)`
 * en data-URI eller null, `brevtext(arende)` { sprak, amne, text } eller null.
 */
export function byggSida({ arenden = [], datum, korning = {}, kallrader = [], miniatyr = () => null, skarmdump = () => null, brevtext = null, uppdaterad = new Date().toISOString() } = {}) {
  const oppna = arenden.filter((a) => [STATUS.NY, STATUS.SKICKAD, STATUS.PAMIND].includes(a.status));
  const stangda = arenden.filter((a) => ![STATUS.NY, STATUS.SKICKAD, STATUS.PAMIND].includes(a.status)).slice(0, 10);
  const n = (s) => arenden.filter((a) => a.status === s).length;
  const ordning = [...oppna.filter((a) => a.status === STATUS.NY), ...oppna.filter((a) => a.status !== STATUS.NY)];
  return `<title>Konkurrentdödaren</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Mono:wght@400;500&family=Source+Sans+3:wght@400;600&display=swap">
<style>${CSS}</style>
<div class="ram">
  <header class="topp">
    <p class="eyebrow">Konkurrentdödaren · granskning</p>
    <h1>${n(STATUS.NY) ? `${n(STATUS.NY)} ${n(STATUS.NY) === 1 ? 'kopia väntar' : 'kopior väntar'} på ditt beslut` : 'Inga kopior väntar på beslut'}</h1>
    <p class="meta">Uppdaterad ${esc(datumLang(uppdaterad))}${datum ? ` · körning ${esc(datum)}` : ''}. Inget brev går ut förrän du skriver kommandot i chatten.</p>
    <div class="summa">
      <div class="tal"><b>${n(STATUS.NY)}</b><span>Väntar på dig</span></div>
      <div class="tal"><b>${n(STATUS.SKICKAD) + n(STATUS.PAMIND)}</b><span>Brev ute</span></div>
      <div class="tal"><b>${n(STATUS.ATGARDAD)}</b><span>Borta efter brev</span></div>
      <div class="tal"><b>${n(STATUS.AVFARDAD)}</b><span>Avfärdade</span></div>
    </div>
  </header>
  <section class="hur">
    <strong>Så gör du</strong>
    <ol>
      <li>Titta på bevisen: den kopierade texten står ordagrant, bilderna ligger par om par, deras sida är fotad.</li>
      <li>Är det en kopia: kopiera skicka-kommandot och klistra in det i chatten. Sessionen bygger brevet och fakturan och lägger dem som utkast i Stonebite-Gmail; du trycker Skicka där (eller skriver "skicka direkt").</li>
      <li>Är det ingen kopia: kopiera avfärda-kommandot. Då dyker den inte upp igen.</li>
    </ol>
  </section>
  ${ordning.length ? ordning.map((a) => arendeHtml(a, { miniatyr, skarmdump, brevtext })).join('\n') : '<div class="tom">Inga öppna ärenden. Rutinen letar varje morgon.</div>'}
  ${stangda.length ? `<section><h3>Avslutade (senaste ${stangda.length})</h3></section>${stangda.map((a) => arendeHtml(a, { miniatyr, skarmdump, brevtext: null })).join('\n')}` : ''}
  <footer class="kallor">
    <strong>Källorna den här körningen</strong>
    ${kallrader.map((k) => `<span>${esc(k)}</span>`).join('')}
    ${korning.adLibrary?.status === 'saknar_behorighet' ? '<span class="varning">Konkurrenternas annonser (Ad Library) läses inte förrän identiteten är bekräftad hos Meta — se uppgifterna i rapporten.</span>' : ''}
  </footer>
</div>
<script>${JS}</script>
`;
}
