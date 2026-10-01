// vy/fakturor.mjs — fakturorna: var och en laddar upp sina, ägaren hämtar allas.
//
// Två delar: `minaFakturor` är blocket på Min sida (alla roller) där man
// laddar upp och ser sina egna; `fakturorSida` är ägarens/chefens sida med en
// panel per person, senaste fakturan överst och en knapp som laddar ner hela
// månaden som zip. Inga belopp — sidan läser inte fakturorna, den förvarar dem.

import { esc, attr, panel, tabell, tomt, block, kort, tal, t, sprak } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { harRatt } from '../roller.mjs';
import { perPerson, manaderMedFakturor, MAX_BYTES } from '../fakturor.mjs';

const MANADSNAMN = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

function manadsnamn(m) {
  const [ar, mm] = String(m ?? '').split('-').map(Number);
  return ar && mm ? `${t(MANADSNAMN[mm - 1])} ${ar}` : String(m ?? '');
}

/** Förra månaden som "ÅÅÅÅ-MM" — det är den man oftast fakturerar för. */
export function forraManaden(nu = new Date()) {
  const d = new Date(Date.UTC(nu.getUTCFullYear(), nu.getUTCMonth() - 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function storlek(b) {
  const n = Number(b) || 0;
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toLocaleString(sprak() === 'en' ? 'en-GB' : 'sv-SE', { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(n / 1024))} kB`;
}

function datum(iso) {
  return String(iso ?? '').slice(0, 10);
}

/** Uppladdningsformuläret — samma på Min sida och (för ägaren) på Fakturor. */
function formular({ csrf, nasta, forvald, personer = [] }) {
  const personval = personer.length ? `<label class="falt"><span>${esc(t('Vems faktura?'))}</span>
      <select name="personId"><option value="">${esc(t('Min egen'))}</option>${personer.map((p) => `<option value="${attr(p.id)}">${esc(p.namn)}</option>`).join('')}</select></label>` : '';
  return `<form method="post" action="/app/fakturor/ladda-upp" enctype="multipart/form-data" class="formular" style="display:grid;gap:12px;max-width:520px">
    <input type="hidden" name="csrf" value="${attr(csrf)}">
    <input type="hidden" name="nasta" value="${attr(nasta)}">
    ${personval}
    <label class="falt"><span>${esc(t('Vilken månad gäller fakturan?'))}</span>
      <input type="month" name="manad" value="${attr(forvald)}" required></label>
    <label class="falt"><span>${esc(t('Fakturan (PDF eller bild)'))}</span>
      <input type="file" name="fil" accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,application/pdf,image/*" multiple required></label>
    <label class="falt"><span>${esc(t('Anteckning (frivillig)'))}</span>
      <input type="text" name="anteckning" maxlength="300" placeholder="${attr(t('t.ex. lön september + bonus'))}"></label>
    <div><button class="knapp" type="submit">${esc(t('Ladda upp fakturan'))}</button>
      <span class="mini" style="margin-left:10px">${esc(t('Max'))} ${Math.round(MAX_BYTES / 1024 / 1024)} MB. ${esc(t('Har du två fakturor för samma månad: välj båda filerna på en gång, eller ladda upp igen.'))}</span></div>
  </form>`;
}

function fakturatabell(rader, { medPerson = false, farTaBort = false, csrf = '', nasta = '' } = {}) {
  const kolumner = [
    { titel: 'Månad' },
    ...(medPerson ? [{ titel: 'Person' }] : []),
    { titel: 'Fil' },
    { titel: 'Uppladdad' },
    { titel: '' },
  ];
  return tabell(kolumner, rader.map((r) => `<tr>
    <td><span class="namn">${esc(manadsnamn(r.manad))}</span></td>
    ${medPerson ? `<td><span class="namn">${esc(r.personNamn || r.personNyckel)}</span></td>` : ''}
    <td><span class="namn">${esc(r.namn)}</span><span class="bi">${esc(storlek(r.storlek))}${r.anteckning ? ` · ${esc(r.anteckning)}` : ''}</span></td>
    <td><span class="mini">${esc(datum(r.uppladdad))}</span></td>
    <td style="white-space:nowrap"><a class="knapp liten" href="${attr(`/app/fakturor/fil/${r.id}`)}">${esc(t('Ladda ner'))}</a>${farTaBort ? `
      <form method="post" action="/app/fakturor/ta-bort" style="display:inline;margin-left:6px">
        <input type="hidden" name="csrf" value="${attr(csrf)}"><input type="hidden" name="id" value="${attr(r.id)}"><input type="hidden" name="nasta" value="${attr(nasta)}">
        <button class="knapp liten tyst" type="submit">${esc(t('Ta bort'))}</button>
      </form>` : ''}</td>
  </tr>`));
}

/** Blocket på Min sida: ladda upp + dina egna fakturor. */
export function minaFakturor({ rader = [], csrf, nu = new Date() }) {
  return block({
    id: 'fakturor',
    titel: 'Dina fakturor',
    under: 'Ladda upp varje faktura du någonsin skickat bolaget här — även gamla månader — märkt med månaden den gäller. Ägaren hämtar dem härifrån till bokföringen, så du behöver inte mejla dem. Bara du och ägaren ser dina.',
    innehall: `${panel({ titel: 'Ladda upp en faktura', innehall: formular({ csrf, nasta: '/app/mig#fakturor', forvald: forraManaden(nu) }) })}
      <div style="height:14px"></div>
      ${rader.length
        ? panel({ titel: 'Uppladdade', under: `${tal(rader.length)} ${t(rader.length === 1 ? 'faktura' : 'fakturor')}.`, innehall: fakturatabell(rader) })
        : tomt('Inga fakturor uppladdade än', 'Ladda upp alla du har — även gamla månader. Varje faktura du någonsin skickat bolaget ska finnas här.')}`,
  });
}

/** Ägarens sida: alla personer, senaste fakturan överst, hämta en månad som zip. */
export function fakturorSida({ rader = [], anvandare, csrf, manad = null, meddelande = '', fel = '', personer = [], nu = new Date() }) {
  const serAlla = harRatt(anvandare, 'fakturor-alla');
  const manader = manaderMedFakturor(rader);
  const vald = manader.includes(manad) ? manad : null;
  const visade = vald ? rader.filter((r) => r.manad === vald) : rader;
  const grupper = perPerson(visade);

  const kortRad = `<div class="kort-rad">
    ${kort({ etikett: 'Personer med fakturor', varde: tal(perPerson(rader).length), forklaring: `${tal(rader.length)} ${t('fakturor totalt')}.` })}
    ${kort({ etikett: vald ? `${t('Fakturor')} ${manadsnamn(vald)}` : 'Senaste månaden', varde: tal(vald ? visade.length : rader.filter((r) => r.manad === manader[0]).length), forklaring: vald ? '' : (manader[0] ? manadsnamn(manader[0]) : t('Inga fakturor än.')) })}
  </div>`;

  const manadsval = manader.length ? `<nav class="flikar" aria-label="${attr(t('Månad'))}">
    <a class="flik" href="/app/fakturor"${vald ? '' : ' aria-current="page"'}>${esc(t('Alla'))}</a>
    ${manader.map((m) => `<a class="flik" href="${attr(`/app/fakturor?manad=${m}`)}"${m === vald ? ' aria-current="page"' : ''}>${esc(manadsnamn(m))}</a>`).join('')}
  </nav>` : '';

  const zip = vald ? `<p style="margin:-10px 0 20px"><a class="knapp" href="${attr(`/app/fakturor/zip?manad=${vald}`)}">${esc(t('Ladda ner alla för'))} ${esc(manadsnamn(vald))} (zip)</a>
    <span class="mini" style="margin-left:10px">${esc(t('Samma fil som Claude hämtar till redovisningsbyrån.'))}</span></p>` : '';

  const perPersonDel = grupper.length ? grupper.map((g) => panel({
    titel: g.namn,
    under: `${tal(g.fakturor.length)} ${t(g.fakturor.length === 1 ? 'faktura' : 'fakturor')} · ${t('senaste')}: ${manadsnamn(g.senaste.manad)} (${datum(g.senaste.uppladdad)})`,
    verktyg: `<a class="knapp liten" href="${attr(`/app/fakturor/fil/${g.senaste.id}`)}">${esc(t('Ladda ner senaste'))}</a>`,
    innehall: fakturatabell(g.fakturor, { farTaBort: serAlla, csrf, nasta: vald ? `/app/fakturor?manad=${vald}` : '/app/fakturor' }),
  })).join('<div style="height:14px"></div>') : tomt('Inga fakturor uppladdade än', 'De anställda laddar upp sina på Min sida. Den här sidan fylls av sig själv.');

  return {
    titel: 'Fakturor',
    innehall: `${sidhuvud({ rubrik: 'Fakturor', under: 'De anställdas fakturor, en panel per person. Ladda ner senaste, eller hela månaden som zip till bokföringen.' })}
    ${meddelande ? `<div class="ok-ruta">${esc(meddelande)}</div>` : ''}
    ${fel ? `<div class="fel-ruta">${esc(fel)}</div>` : ''}
    ${kortRad}
    ${manadsval}
    ${zip}
    ${block({ titel: vald ? `${t('Fakturor för')} ${manadsnamn(vald)}` : 'Alla fakturor', innehall: `<div style="display:grid;gap:0">${perPersonDel}</div>` })}
    ${block({ titel: 'Ladda upp åt någon', under: 'Om en anställd mejlat fakturan i stället: välj personen och ladda upp den här, så hamnar den på rätt person.', innehall: panel({ innehall: formular({ csrf, nasta: '/app/fakturor', forvald: forraManaden(nu), personer }) }) })}`,
  };
}
