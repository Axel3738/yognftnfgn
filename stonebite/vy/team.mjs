// vy/team.mjs — redigerarna (topplistan), Min sida och Konton.
//
// ⚠️ Järnregeln: redigerare ser ALDRIG spend. Topplistan visar ersättning i
// USD och antal annonser — aldrig hur mycket kontot har spenderat, och aldrig
// procentsatsen (av sats + belopp går spenden att räkna ut baklänges).
// Ägare och chef ser satsen; ingen annan.

import { esc, attr, kort, panel, tabell, tomt, block, status, stapel, tal, pengar } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { sedan, datum } from '../berakna.mjs';
import { ROLLER, ROLLNYCKLAR, roll as hamtaRoll, menyFor, harRatt, personIdFor } from '../roller.mjs';

const USD = (v) => (v === null || v === undefined ? '–' : `$${Number(v).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

function flyttMarke(flytt) {
  if (!flytt) return '<span class="mini">–</span>';
  return flytt > 0
    ? `<span class="delta upp">↑ ${tal(flytt)}</span>`
    : `<span class="delta ner">↓ ${tal(Math.abs(flytt))}</span>`;
}

// ------------------------------------------------------------ topplistan

export function redigerareSida({ snapshot, anvandare }) {
  const r = snapshot?.redigerare ?? { status: 'saknas', rader: [], folk: [] };
  const serSats = harRatt(anvandare, 'spend');
  const mittId = personIdFor(anvandare);

  if (r.status !== 'ok' || !r.rader?.length) {
    return {
      titel: 'Redigerare',
      innehall: `${sidhuvud({ rubrik: 'Redigerare', under: 'Topplistan för månaden.' })}
      ${tomt('Ingen topplista än', r.orsak ?? 'commission-körningen har inte sparat någon lista den här månaden.')}`,
    };
  }

  const max = Math.max(1, ...r.rader.map((x) => x.usd ?? 0));
  const rader = r.rader.map((x) => `<tr${x.id === mittId ? ' style="background:var(--yta-2)"' : ''}>
    <td class="tal" style="width:44px">${tal(x.plats)}</td>
    <td>
      <span class="namn">${esc(x.namn)}${x.id === mittId ? ' · du' : ''}</span>
      ${x.basta ? `<span class="bi">Bästa annons: ${esc(x.basta.namn)}</span>` : ''}
    </td>
    <td class="tal">${USD(x.usd)}</td>
    <td style="width:120px">${stapel(((x.usd ?? 0) / max) * 100)}</td>
    <td class="tal">${tal(x.annonser)}</td>
    <td class="tal">${flyttMarke(x.flytt)}</td>
  </tr>`);

  const topp = r.rader[0];

  return {
    titel: 'Redigerare',
    innehall: `${sidhuvud({
      rubrik: 'Redigerare',
      under: `Ersättning för ${esc(r.manad ?? '')}${r.period ? ` (${esc(r.period.fran)} – ${esc(r.period.till)})` : ''}. Beloppen är i dollar.`,
      farsk: r.uppdaterad ? `Räknat <b>${esc(sedan(r.uppdaterad))}</b>` : '',
    })}
    <div class="kort-rad">
      ${kort({
        etikett: 'Etta just nu',
        varde: esc(topp.namn),
        forklaring: `${USD(topp.usd)} så här långt den här månaden, på ${tal(topp.annonser)} annonser.`,
      })}
      ${kort({
        etikett: 'Redigerare med ersättning',
        varde: tal(r.rader.filter((x) => (x.usd ?? 0) > 0).length),
        forklaring: `Av ${tal(r.folk?.filter((f) => f.roll === 'editor').length ?? r.rader.length)} redigerare i teamet.`,
      })}
      ${kort({
        etikett: 'Annonser den här månaden',
        varde: tal(r.rader.reduce((s, x) => s + (x.annonser ?? 0), 0)),
        forklaring: 'Antal annonser som redigerarna har levererat och som har fått visas för kunder.',
      })}
      ${serSats && r.sats ? kort({
        etikett: 'Sats',
        varde: `${(r.sats * 100).toLocaleString('sv-SE', { maximumFractionDigits: 2 })} %`,
        forklaring: 'Andel av annonsspenden som går till redigeraren. Visas bara för ägare och chef.',
      }) : ''}
    </div>

    ${block({
      titel: 'Topplistan',
      under: 'Samma siffror som betalas ut. Listan nollställs den 1:a varje månad.',
      innehall: panel({
        innehall: tabell(
          [{ titel: '#', tal: true }, { titel: 'Redigerare' }, { titel: 'Ersättning', tal: true }, { titel: '' }, { titel: 'Annonser', tal: true }, { titel: 'Flytt', tal: true }],
          rader,
        ),
        fot: r.slutavrakning ? 'Månaden är slutavräknad.' : 'Månaden pågår — siffrorna växer varje dag.',
      }),
    })}`,
  };
}

// -------------------------------------------------------------- min sida

export function migSida({ snapshot, anvandare, meddelande = '', fel = '', csrf }) {
  const r = hamtaRoll(anvandare.roll);
  const mittId = personIdFor(anvandare);
  const minRad = mittId ? (snapshot?.redigerare?.rader ?? []).find((x) => x.id === mittId) : null;

  const minaSiffror = minRad ? `<div class="kort-rad">
    ${kort({ etikett: 'Din plats', varde: `#${tal(minRad.plats)}`, forklaring: minRad.flytt ? `Du har flyttat dig ${minRad.flytt > 0 ? 'uppåt' : 'nedåt'} ${tal(Math.abs(minRad.flytt))} steg sedan sist.` : 'Samma plats som sist.' })}
    ${kort({ etikett: 'Din ersättning', varde: USD(minRad.usd), forklaring: `Den här månaden, på ${tal(minRad.annonser)} annonser.` })}
    ${minRad.basta ? kort({ etikett: 'Din bästa annons', varde: esc(minRad.basta.namn), forklaring: `Den har gett dig ${USD(minRad.basta.usd)} den här månaden.` }) : ''}
  </div>` : '';

  const koppling = !mittId && anvandare.roll === 'redigerare'
    ? tomt('Ditt konto är inte kopplat till dina annonser än', 'Be Axel koppla kontot till ditt namn i teamlistan, så dyker dina siffror upp här.')
    : '';

  return {
    titel: 'Min sida',
    innehall: `${sidhuvud({ rubrik: 'Min sida', under: `Inloggad som ${esc(anvandare.namn)}.` })}
    ${meddelande ? `<div class="ok-ruta">${esc(meddelande)}</div>` : ''}
    ${fel ? `<div class="fel-ruta">${esc(fel)}</div>` : ''}
    ${minaSiffror}
    ${koppling}

    ${block({
      titel: 'Ditt konto',
      innehall: panel({
        innehall: `<ul class="lista">
          <li><span style="min-width:140px;color:var(--ink-3)">Namn</span><span class="namn">${esc(anvandare.namn)}</span></li>
          <li><span style="min-width:140px;color:var(--ink-3)">E-post</span><span class="namn">${esc(anvandare.epost)}</span></li>
          <li><span style="min-width:140px;color:var(--ink-3)">Roll</span><span><span class="namn">${esc(r?.namn ?? anvandare.roll)}</span><span class="bi">${esc(r?.beskrivning ?? '')}</span></span></li>
          <li><span style="min-width:140px;color:var(--ink-3)">Du ser</span><span>${menyFor(anvandare).map((s) => `<span class="tagg">${esc(s.titel)}</span>`).join(' ')}</span></li>
        </ul>`,
      }),
    })}

    ${block({
      titel: 'Byt lösenord',
      under: 'Du loggas ut från alla andra enheter när du byter.',
      innehall: panel({
        innehall: `<form method="post" action="/app/mig/losenord" style="padding:20px;max-width:420px">
          <input type="hidden" name="csrf" value="${attr(csrf)}">
          <label class="falt"><span>Nuvarande lösenord</span><input type="password" name="gammalt" required autocomplete="current-password"></label>
          <label class="falt"><span>Nytt lösenord (minst 8 tecken)</span><input type="password" name="nytt" required minlength="8" autocomplete="new-password"></label>
          <label class="falt"><span>Nytt lösenord igen</span><input type="password" name="nytt2" required minlength="8" autocomplete="new-password"></label>
          <button class="knapp" type="submit">Spara nytt lösenord</button>
        </form>`,
      }),
    })}`,
  };
}

// ---------------------------------------------------------------- konton

export function kontonSida({ konton, anvandare, folk = [], meddelande = '', fel = '', nyttLosenord = null, csrf }) {
  const rader = konton.map((k) => {
    const r = hamtaRoll(k.roll);
    const jag = k.id === anvandare.id;
    return `<tr>
      <td>
        <span class="namn">${esc(k.namn)}${jag ? ' · du' : ''}</span>
        <span class="bi">${esc(k.epost)}${k.personId ? ` · kopplad till ${esc(k.personId)}` : ''}</span>
      </td>
      <td>
        <form method="post" action="/app/konton/roll" style="display:flex;gap:6px;align-items:center">
          <input type="hidden" name="csrf" value="${attr(csrf)}">
          <input type="hidden" name="id" value="${attr(k.id)}">
          <select name="roll" class="falt" style="height:34px;padding:0 8px;font-size:13px;border-radius:6px;border:1px solid var(--linje-stark);background:var(--papper);color:var(--ink)">
            ${ROLLNYCKLAR.map((rn) => `<option value="${attr(rn)}"${rn === k.roll ? ' selected' : ''}>${esc(ROLLER[rn].namn)}</option>`).join('')}
          </select>
          <button class="knapp liten tyst" type="submit">Spara</button>
        </form>
      </td>
      <td>${k.aktiv === false ? status('kritisk', 'avstängd') : status('bra', 'aktiv')}</td>
      <td class="tal"><span class="mini">${k.senastInloggad ? esc(sedan(k.senastInloggad)) : 'aldrig'}</span></td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
          <form method="post" action="/app/konton/nytt-losenord">
            <input type="hidden" name="csrf" value="${attr(csrf)}"><input type="hidden" name="id" value="${attr(k.id)}">
            <button class="knapp liten tyst" type="submit">Nytt lösenord</button>
          </form>
          ${jag ? '' : `<form method="post" action="/app/konton/aktiv">
            <input type="hidden" name="csrf" value="${attr(csrf)}"><input type="hidden" name="id" value="${attr(k.id)}">
            <input type="hidden" name="aktiv" value="${k.aktiv === false ? '1' : '0'}">
            <button class="knapp liten tyst" type="submit">${k.aktiv === false ? 'Slå på' : 'Stäng av'}</button>
          </form>`}
          ${jag ? '' : `<form method="post" action="/app/konton/ta-bort" onsubmit="return confirm('Ta bort ${attr(k.namn)} helt?')">
            <input type="hidden" name="csrf" value="${attr(csrf)}"><input type="hidden" name="id" value="${attr(k.id)}">
            <button class="knapp liten fara" type="submit">Ta bort</button>
          </form>`}
        </div>
      </td>
    </tr>`;
  });

  const rollkort = ROLLNYCKLAR.map((rn) => `<article class="kort" style="min-height:0">
    <div class="etikett">${esc(ROLLER[rn].namn)}</div>
    <p class="forklaring" style="margin-top:8px">${esc(ROLLER[rn].beskrivning)}</p>
    <div class="botten"><div class="etiketter">${ROLLER[rn].sidor.map((s) => `<span class="tagg">${esc(s)}</span>`).join('')}</div></div>
  </article>`).join('');

  return {
    titel: 'Konton',
    innehall: `${sidhuvud({ rubrik: 'Konton', under: 'Vem som kan logga in, och hur mycket de ser.' })}
    ${meddelande ? `<div class="ok-ruta">${esc(meddelande)}</div>` : ''}
    ${fel ? `<div class="fel-ruta">${esc(fel)}</div>` : ''}
    ${nyttLosenord ? `<div class="ok-ruta"><b>Lösenord till ${esc(nyttLosenord.namn)}:</b> <code style="font-size:16px">${esc(nyttLosenord.losenord)}</code><br>Skicka det till personen nu — det visas bara den här gången.</div>` : ''}

    ${block({
      titel: 'Inloggningar',
      innehall: panel({
        innehall: tabell(
          [{ titel: 'Person' }, { titel: 'Roll' }, { titel: 'Läge' }, { titel: 'Senast inne', tal: true }, { titel: '' }],
          rader,
        ),
        fot: `${konton.length} konton. Ett avstängt konto loggas ut direkt.`,
      }),
    })}

    ${block({
      titel: 'Lägg till någon',
      under: 'Lösenordet skapas åt dig och visas en gång. Personen byter det själv på Min sida.',
      innehall: panel({
        innehall: `<form method="post" action="/app/konton/ny" style="padding:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;align-items:end">
          <input type="hidden" name="csrf" value="${attr(csrf)}">
          <label class="falt" style="margin:0"><span>Namn</span><input name="namn" required></label>
          <label class="falt" style="margin:0"><span>E-post</span><input type="email" name="epost" required inputmode="email"></label>
          <label class="falt" style="margin:0"><span>Roll</span>
            <select name="roll" required>
              ${ROLLNYCKLAR.map((rn) => `<option value="${attr(rn)}"${rn === 'redigerare' ? ' selected' : ''}>${esc(ROLLER[rn].namn)} — ${esc(ROLLER[rn].beskrivning)}</option>`).join('')}
            </select>
          </label>
          <label class="falt" style="margin:0"><span>Koppla till person (valfritt)</span>
            <select name="personId">
              <option value="">— ingen —</option>
              ${folk.map((f) => `<option value="${attr(f.id)}">${esc(f.namn)} (${esc(f.roll)})</option>`).join('')}
            </select>
          </label>
          <button class="knapp" type="submit">Skapa konto</button>
        </form>`,
        fot: 'Kopplingen till person gör att redigeraren ser SINA siffror på Min sida — aldrig någon annans.',
      }),
    })}

    ${block({
      titel: 'Vad rollerna ser',
      innehall: `<div class="kort-rad">${rollkort}</div>`,
    })}`,
  };
}
