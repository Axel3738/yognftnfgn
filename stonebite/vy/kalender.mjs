// vy/kalender.mjs — kalendern: den personliga sidan och blocket per varumärke.
//
// Axels krav 2026-09-22: "som Google Calendar fast bättre … simpel, annars
// kommer jag inte använda den … väldigt lätt att lägga in vad man ska planera
// och när". Därför EN rad högst upp: skriv vad, datumordet förstås ("imorgon
// kl 14", "fredag", "15/10"), tryck Enter. Sedan tre vyer på samma sida:
// Kommande (lista), Månaden (rutnät) och Gjort. Ingen drag-and-drop, inga
// färgkoder att lära sig.
//
// Det systemet redan vet (tvister, rutiner, uppföljningar) ligger i samma
// lista med en liten etikett — de går inte att bocka av, de försvinner när
// saken är gjord.

import { esc, attr, panel, tomt, block, status, t, sprak } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { datum as datumtext, sedan } from '../berakna.mjs';
import { TYPER, idag, plusDagar, manadsdagar } from '../kalender.mjs';

const VECKODAGAR = ['mån', 'tis', 'ons', 'tors', 'fre', 'lör', 'sön'];
const MANADSNAMN = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

function kallaEtikett(h) {
  if (!h.kalla) return '';
  const ord = { tvist: t('tvist'), rutin: t('rutin'), kontakt: t('kontakt') }[h.kalla] ?? h.kalla;
  return `<span class="kalla kalla-${esc(h.kalla)}">${esc(ord)}</span>`;
}

function typEtikett(h) {
  if (!h.typ || h.typ === 'plan' || h.kalla) return '';
  return `<span class="kalla kalla-${esc(h.typ)}">${esc(TYPER[h.typ]?.[sprak()] ?? h.typ)}</span>`;
}

/** Snabbinmatningen. `brandval` = lista av varumärken att välja mellan (agare/chef). */
function snabbform({ csrf, brand = null, brandval = [], nasta, nu }) {
  return `<form method="post" action="/app/kalender/ny" class="snabbform">
    <input type="hidden" name="csrf" value="${attr(csrf)}">
    <input type="hidden" name="nasta" value="${attr(nasta)}">
    ${brand ? `<input type="hidden" name="brand" value="${attr(brand)}">` : ''}
    <input class="snabbform-text" name="text" required maxlength="220" autocomplete="off" placeholder="${attr(t('Vad ska hända? T.ex. "Ring leverantören imorgon kl 14"'))}" aria-label="${attr(t('Vad ska hända?'))}">
    <input class="snabbform-datum" type="date" name="datum" value="${attr(idag(nu))}" aria-label="${attr(t('Datum'))}">
    <input class="snabbform-tid" type="time" name="tid" aria-label="${attr(t('Tid'))}">
    <select name="typ" aria-label="${attr(t('Typ'))}">${Object.entries(TYPER).map(([id, n]) => `<option value="${id}">${esc(n[sprak()] ?? n.sv)}</option>`).join('')}</select>
    ${!brand && brandval.length ? `<select name="brand" aria-label="${attr(t('Varumärke'))}"><option value="">${esc(t('Personligt'))}</option>${brandval.map((v) => `<option value="${attr(v.id)}">${esc(v.namn)}</option>`).join('')}</select>` : ''}
    <button class="knapp" type="submit">${esc(t('Lägg till'))}</button>
    <p class="mini snabbform-hjalp">${esc(t('Datumordet i texten vinner: "imorgon", "fredag", "15/10", "om 3 dagar", "kl 14". Utan datumord gäller datumfältet.'))}</p>
  </form>`;
}

function knappar(h, { csrf, nasta }) {
  if (h.kalla) return `<span class="mini">${esc(t('automatiskt'))}</span>`;
  return `<form method="post" action="/app/kalender/${h.klar ? 'oklar' : 'klar'}" class="kal-knappar">
    <input type="hidden" name="csrf" value="${attr(csrf)}"><input type="hidden" name="id" value="${attr(h.id)}"><input type="hidden" name="nasta" value="${attr(nasta)}">
    <button class="knapp liten ${h.klar ? 'tyst' : ''}" type="submit">${esc(h.klar ? t('Ångra') : t('Klar'))}</button>
    <button class="knapp liten fara" type="submit" formaction="/app/kalender/bort">${esc(t('Ta bort'))}</button>
  </form>`;
}

function dagrubrik(d, nu) {
  const dag0 = idag(nu);
  if (d === dag0) return t('I dag');
  if (d === plusDagar(dag0, 1)) return t('I morgon');
  return datumtext(`${d}T12:00:00Z`, { nu });
}

/** Listan: grupperad per dag. */
function lista(handelser, { csrf, nasta, nu, brandnamn = () => '' }) {
  const perDag = new Map();
  for (const h of handelser) {
    if (!perDag.has(h.datum)) perDag.set(h.datum, []);
    perDag.get(h.datum).push(h);
  }
  return `<ul class="kal-lista">${[...perDag.entries()].map(([d, rader]) => `
    <li class="kal-dagblock${d < idag(nu) ? ' kal-forsenat' : ''}">
      <h4>${esc(dagrubrik(d, nu))} <span class="mini">${esc(d)}</span></h4>
      <ul>${rader.sort((a, b) => (a.tid ?? '').localeCompare(b.tid ?? '')).map((h) => `
        <li class="kal-h${h.klar ? ' kal-klar' : ''}">
          <span class="kal-tid">${h.tid ? esc(h.tid) : ''}</span>
          <span class="kal-text">${h.lank ? `<a href="${attr(h.lank)}">${esc(h.titel)}</a>` : esc(h.titel)}${h.brand ? ` <span class="mini">· ${esc(brandnamn(h.brand))}</span>` : ''} ${kallaEtikett(h)}${typEtikett(h)}${h.anteckning ? `<span class="bi">${esc(h.anteckning)}</span>` : ''}</span>
          <span class="kal-atgard">${knappar(h, { csrf, nasta })}</span>
        </li>`).join('')}</ul>
    </li>`).join('')}</ul>`;
}

/** Månadsrutnätet. */
function manadsrutnat(handelser, { ar, manad, nu, basLank }) {
  const { dagar, startVeckodag } = manadsdagar(ar, manad);
  const dag0 = idag(nu);
  const perDag = new Map();
  for (const h of handelser) {
    if (!perDag.has(h.datum)) perDag.set(h.datum, []);
    perDag.get(h.datum).push(h);
  }
  const forra = manad === 1 ? `${ar - 1}-12` : `${ar}-${String(manad - 1).padStart(2, '0')}`;
  const nasta = manad === 12 ? `${ar + 1}-01` : `${ar}-${String(manad + 1).padStart(2, '0')}`;
  const celler = [];
  for (let i = 0; i < startVeckodag; i++) celler.push('<div class="kal-cell kal-tom"></div>');
  for (const d of dagar) {
    const rader = (perDag.get(d) ?? []).sort((a, b) => (a.tid ?? '').localeCompare(b.tid ?? ''));
    celler.push(`<div class="kal-cell${d === dag0 ? ' kal-idag' : ''}${d < dag0 ? ' kal-passerad' : ''}">
      <div class="kal-nr">${Number(d.slice(-2))}</div>
      ${rader.slice(0, 3).map((h) => `<div class="kal-chip${h.klar ? ' kal-klar' : ''}${h.kalla ? ` kal-chip-${esc(h.kalla)}` : ''}${h.typ === 'larm' || h.typ === 'deadline' ? ` kal-chip-${esc(h.typ)}` : ''}" title="${attr(`${h.tid ? `${h.tid} ` : ''}${h.titel}`)}">${h.tid ? `<b>${esc(h.tid)}</b> ` : ''}${esc(h.titel)}</div>`).join('')}
      ${rader.length > 3 ? `<div class="mini">+${rader.length - 3}</div>` : ''}
    </div>`);
  }
  return `<div class="kal-manad">
    <div class="kal-manad-huvud">
      <a class="knapp liten tyst" href="${attr(`${basLank}manad=${forra}`)}">← ${esc(t('Förra'))}</a>
      <h3>${esc(t(MANADSNAMN[manad - 1]))} ${ar}</h3>
      <a class="knapp liten tyst" href="${attr(`${basLank}manad=${nasta}`)}">${esc(t('Nästa'))} →</a>
    </div>
    <div class="kal-rutnat">
      ${VECKODAGAR.map((v) => `<div class="kal-veckodag">${esc(t(v))}</div>`).join('')}
      ${celler.join('')}
    </div>
  </div>`;
}

/**
 * Kalenderblocket: snabbform + kommande + månad + gjort. Används både på den
 * personliga sidan och i varje varumärkes flik.
 */
export function kalenderBlock({ handelser = [], harledda = [], brand = null, brandval = [], brandnamn = () => '', csrf, nu = new Date(), manad = null, nasta, rubrik = null }) {
  const dag0 = idag(nu);
  const [ar, man] = (manad && /^\d{4}-\d{2}$/.test(manad) ? manad : dag0.slice(0, 7)).split('-').map(Number);
  const basLank = `${nasta}${nasta.includes('?') ? '&' : '?'}`;

  const oppna = handelser.filter((h) => !h.klar);
  const kommande = [...oppna.filter((h) => h.datum <= plusDagar(dag0, 14)), ...harledda.filter((h) => h.datum >= dag0 && h.datum <= plusDagar(dag0, 14))]
    .sort((a, b) => (a.datum + (a.tid ?? '')).localeCompare(b.datum + (b.tid ?? '')));
  const senare = oppna.filter((h) => h.datum > plusDagar(dag0, 14)).sort((a, b) => a.datum.localeCompare(b.datum));
  const gjorda = handelser.filter((h) => h.klar).sort((a, b) => b.datum.localeCompare(a.datum)).slice(0, 20);
  const iManaden = [...handelser, ...harledda].filter((h) => h.datum.startsWith(`${ar}-${String(man).padStart(2, '0')}`));

  return `${rubrik ? `<h2 class="kal-rubrik">${esc(rubrik)}</h2>` : ''}
  ${panel({ innehall: snabbform({ csrf, brand, brandval, nasta, nu }) })}
  ${block({
    titel: 'Kommande två veckor',
    under: 'Det du lagt in och det systemet vet kommer hända. Försenat står överst.',
    innehall: kommande.length ? panel({ innehall: lista(kommande, { csrf, nasta, nu, brandnamn }) }) : tomt('Ingenting planerat', 'Skriv en rad ovan.'),
  })}
  ${block({ titel: 'Månaden', innehall: panel({ innehall: manadsrutnat(iManaden, { ar, manad: man, nu, basLank }) }) })}
  ${senare.length ? block({ titel: 'Längre fram', innehall: panel({ innehall: lista(senare, { csrf, nasta, nu, brandnamn }) }) }) : ''}
  ${gjorda.length ? block({ titel: 'Gjort', under: 'Det du bockat av. Senaste först.', innehall: panel({ innehall: lista(gjorda, { csrf, nasta, nu, brandnamn }) }) }) : ''}`;
}

/** Den personliga sidan: egna rader + (för ägare/chef) alla varumärkens. */
export function kalenderSida({ anvandare, handelser = [], harledda = [], varumarken = [], allaBrands = false, csrf, manad = null, nu = new Date(), rutiner = null }) {
  const brandnamn = (id) => varumarken.find((v) => v.id === id)?.namn ?? id;
  const idagRader = handelser.filter((h) => !h.klar && h.datum === idag(nu)).length + harledda.filter((h) => h.datum === idag(nu)).length;
  return {
    titel: 'Kalender',
    innehall: `${sidhuvud({
      rubrik: 'Kalender',
      under: allaBrands ? 'Dina egna rader och alla varumärkens, på ett ställe.' : 'Dina egna rader. Bara du ser dem.',
      farsk: idagRader ? `${status('neutral', `${idagRader} ${t(idagRader === 1 ? 'sak i dag' : 'saker i dag')}`)}` : '',
    })}
    ${kalenderBlock({ handelser, harledda, brandval: allaBrands ? varumarken : [], brandnamn, csrf, nu, manad, nasta: '/app/kalender', anvandare })}
    ${rutiner?.status === 'ok' && allaBrands ? block({
      titel: 'Rutinerna i dag',
      under: 'Vad maskinen gör själv i dag, i tidsordning. Syns här så det aldrig behöver planeras för hand.',
      innehall: panel({ innehall: `<ul class="lista">${(rutiner.rutiner ?? []).filter((r) => r.nasta && r.status !== 'avstangd' && r.schema?.typ !== 'timme' && r.nasta.slice(0, 10) <= plusDagar(idag(nu), 1)).sort((a, b) => a.nasta.localeCompare(b.nasta)).map((r) => `<li><span class="tid">${esc(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(r.nasta)))}</span><span><span class="namn">${esc(r.namn)}</span><span class="bi">${esc(brandnamn(r.brand))} · ${esc(r.vad ?? '')}${r.senast ? ` · ${esc(t('senast'))} ${esc(sedan(r.senast))}` : ''}</span></span></li>`).join('') || `<li><span>${esc(t('Inga schemalagda rutiner det närmaste dygnet.'))}</span></li>`}</ul>` }),
    }) : ''}`,
  };
}
