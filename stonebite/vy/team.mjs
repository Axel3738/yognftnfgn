// vy/team.mjs — redigerarna (topplistan), Min sida och Konton.
//
// ⚠️ Järnregeln: redigerare ser ALDRIG spend. Topplistan visar ersättning i
// USD och antal annonser — aldrig hur mycket kontot har spenderat, och aldrig
// procentsatsen (av sats + belopp går spenden att räkna ut baklänges).
// Ägare och chef ser satsen; ingen annan.
//
// Min sida är den viktigaste sidan i hela sajten för alla utom Axel: den
// säger vad man tjänat, vad man kan tjäna, och exakt hur man gör.

import { esc, attr, kort, panel, tabell, tomt, block, status, stapel, tal, t, sprak } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { sedan } from '../berakna.mjs';
import { ROLLER, ROLLNYCKLAR, roll as hamtaRoll, menyFor, harRatt, personIdFor } from '../roller.mjs';
import { minBonus } from './bonus.mjs';
import { SPRAKEN } from '../sprak.mjs';

const USD = (v) => (v === null || v === undefined ? '–' : `$${Number(v).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

/** `*` i brands betyder alla butiker (bonus/motor.mjs svararFor) — visas med ord, inte som en stjärna. */
const butiksnamn = (b) => (b === '*' ? t('Alla butiker') : b);

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
  const person = (snapshot?.personer ?? []).find((p) => p.id === mittId) ?? null;
  const minRad = mittId ? (snapshot?.redigerare?.rader ?? []).find((x) => x.id === mittId) : null;

  const topplistedel = minRad ? `<div class="kort-rad">
    ${kort({ etikett: 'Din plats på topplistan', varde: `#${tal(minRad.plats)}`, forklaring: minRad.flytt ? `Du har flyttat dig ${minRad.flytt > 0 ? 'uppåt' : 'nedåt'} ${tal(Math.abs(minRad.flytt))} steg sedan sist.` : 'Samma plats som sist.' })}
    ${minRad.basta ? kort({ etikett: 'Din bästa annons', varde: esc(minRad.basta.namn), forklaring: `Den har gett dig ${USD(minRad.basta.usd)} den här månaden.` }) : ''}
  </div>` : '';

  const koppling = !mittId
    ? tomt('Ditt konto är inte kopplat till en person än', 'Utan koppling kan systemet inte veta vilka recensioner, tvister eller produkter som är dina. Be Axel koppla kontot under Konton.')
    : '';

  return {
    titel: 'Min sida',
    innehall: `${sidhuvud({ rubrik: 'Min sida', under: `${t('Inloggad som')} ${esc(anvandare.namn)}.` })}
    ${meddelande ? `<div class="ok-ruta">${esc(meddelande)}</div>` : ''}
    ${fel ? `<div class="fel-ruta">${esc(fel)}</div>` : ''}
    ${koppling}
    ${minBonus({ snapshot, anvandare, person, csrf })}
    ${topplistedel}

    ${block({
      titel: 'Ditt konto',
      innehall: panel({
        innehall: `<ul class="lista">
          <li><span style="min-width:140px;color:var(--ink-3)">${esc(t('Namn'))}</span><span class="namn">${esc(anvandare.namn)}</span></li>
          <li><span style="min-width:140px;color:var(--ink-3)">${esc(t('E-post'))}</span><span class="namn">${esc(anvandare.epost)}</span></li>
          <li><span style="min-width:140px;color:var(--ink-3)">${esc(t('Roll'))}</span><span><span class="namn">${esc(t(r?.namn ?? anvandare.roll))}</span><span class="bi">${esc(t(r?.beskrivning ?? ''))}</span></span></li>
          ${person?.extraRoller?.length ? `<li><span style="min-width:140px;color:var(--ink-3)">${esc(t('Tjänar även i'))}</span><span>${person.extraRoller.map((x) => `<span class="tagg">${esc(t(ROLLER[x]?.namn ?? x))}</span>`).join(' ')}</span></li>` : ''}
          ${person?.brands?.length ? `<li><span style="min-width:140px;color:var(--ink-3)">${esc(t('Dina butiker'))}</span><span>${person.brands.map((b) => `<span class="tagg">${esc(butiksnamn(b))}</span>`).join(' ')}</span></li>` : ''}
          <li><span style="min-width:140px;color:var(--ink-3)">${esc(t('Du ser'))}</span><span>${menyFor(anvandare).map((s) => `<span class="tagg">${esc(t(s.titel))}</span>`).join(' ')}</span></li>
          <li>
            <span style="min-width:140px;color:var(--ink-3)">${esc(t('Språk'))}</span>
            <form method="post" action="/app/mig/sprak" style="display:flex;gap:8px;align-items:center">
              <input type="hidden" name="csrf" value="${attr(csrf)}">
              <select name="sprak" style="height:34px;padding:0 8px;font-size:13px;border-radius:6px;border:1px solid var(--linje-stark);background:var(--papper);color:var(--ink)">
                ${Object.entries(SPRAKEN).map(([kod, namn]) => `<option value="${attr(kod)}"${kod === sprak() ? ' selected' : ''}>${esc(namn)}</option>`).join('')}
              </select>
              <button class="knapp liten tyst" type="submit">${esc(t('Spara'))}</button>
            </form>
          </li>
        </ul>`,
      }),
    })}

    ${block({
      titel: 'Byt lösenord',
      under: 'Du loggas ut från alla andra enheter när du byter.',
      innehall: panel({
        innehall: `<form method="post" action="/app/mig/losenord" style="padding:20px;max-width:420px">
          <input type="hidden" name="csrf" value="${attr(csrf)}">
          <label class="falt"><span>${esc(t('Nuvarande lösenord'))}</span><input type="password" name="gammalt" required autocomplete="current-password"></label>
          <label class="falt"><span>${esc(t('Nytt lösenord (minst 8 tecken)'))}</span><input type="password" name="nytt" required minlength="8" autocomplete="new-password"></label>
          <label class="falt"><span>${esc(t('Nytt lösenord igen'))}</span><input type="password" name="nytt2" required minlength="8" autocomplete="new-password"></label>
          <button class="knapp" type="submit">${esc(t('Spara nytt lösenord'))}</button>
        </form>`,
      }),
    })}`,
  };
}

// ---------------------------------------------------------------- konton

export function kontonSida({ konton, anvandare, personer = [], butiker = [], meddelande = '', fel = '', nyttLosenord = null, csrf }) {
  const rader = konton.map((k) => {
    const jag = k.id === anvandare.id;
    const person = personer.find((p) => p.id === k.personId) ?? null;
    return `<tr>
      <td>
        <span class="namn">${esc(k.namn)}${jag ? ' · du' : ''}</span>
        <span class="bi">${esc(k.epost)}${person ? ` · ${esc(person.namn)}${person.extraRoller?.length ? ` (+${person.extraRoller.map((x) => ROLLER[x]?.namn ?? x).join(', ')})` : ''}` : ' · ingen person kopplad'}</span>
      </td>
      <td>
        <form method="post" action="/app/konton/roll" style="display:flex;gap:6px;align-items:center">
          <input type="hidden" name="csrf" value="${attr(csrf)}">
          <input type="hidden" name="id" value="${attr(k.id)}">
          <select name="roll" style="height:34px;padding:0 8px;font-size:13px;border-radius:6px;border:1px solid var(--linje-stark);background:var(--papper);color:var(--ink)">
            ${ROLLNYCKLAR.map((rn) => `<option value="${attr(rn)}"${rn === k.roll ? ' selected' : ''}>${esc(ROLLER[rn].namn)}</option>`).join('')}
          </select>
          <button class="knapp liten tyst" type="submit">Spara</button>
        </form>
      </td>
      <td>
        <form method="post" action="/app/konton/person" style="display:flex;gap:6px;align-items:center">
          <input type="hidden" name="csrf" value="${attr(csrf)}">
          <input type="hidden" name="id" value="${attr(k.id)}">
          <select name="personId" style="height:34px;padding:0 8px;font-size:13px;border-radius:6px;border:1px solid var(--linje-stark);background:var(--papper);color:var(--ink);max-width:150px">
            <option value="">${esc(t('— ingen —'))}</option>
            ${personer.map((p) => `<option value="${attr(p.id)}"${p.id === k.personId ? ' selected' : ''}>${esc(p.namn)}</option>`).join('')}
          </select>
          <button class="knapp liten tyst" type="submit">${esc(t('Spara'))}</button>
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

  // Personerna som kan tjäna bonus men saknar inloggning — den vanligaste
  // orsaken till att någons pengar inte syns.
  const utanKonto = personer.filter((p) => !konton.some((k) => k.personId === p.id));

  return {
    titel: 'Konton',
    innehall: `${sidhuvud({ rubrik: 'Konton', under: 'Vem som kan logga in, hur mycket de ser och vad de kan tjäna.' })}
    ${meddelande ? `<div class="ok-ruta">${esc(meddelande)}</div>` : ''}
    ${fel ? `<div class="fel-ruta">${esc(fel)}</div>` : ''}
    ${nyttLosenord ? `<div class="ok-ruta"><b>Lösenord till ${esc(nyttLosenord.namn)}:</b> <code style="font-size:16px">${esc(nyttLosenord.losenord)}</code><br>Skicka det till personen nu — det visas bara den här gången.</div>` : ''}

    ${block({
      titel: 'Inloggningar',
      innehall: panel({
        innehall: tabell(
          [{ titel: 'Person' }, { titel: 'Roll' }, { titel: 'Kopplad till' }, { titel: 'Läge' }, { titel: 'Senast inne', tal: true }, { titel: '' }],
          rader,
        ),
        fot: `${konton.length} konton. Kopplingen till person är det som gör att bonusen hamnar rätt — utan den ser personen noll.`,
      }),
    })}

    ${block({
      titel: 'Lägg till någon',
      under: 'Kontot och personen skapas i ett svep. Lösenordet visas en gång — personen byter det själv på Min sida.',
      innehall: panel({
        innehall: `<form method="post" action="/app/konton/ny" style="padding:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;align-items:end">
          <input type="hidden" name="csrf" value="${attr(csrf)}">
          <label class="falt" style="margin:0"><span>Namn</span><input name="namn" required placeholder="Maria Santos"></label>
          <label class="falt" style="margin:0"><span>E-post</span><input type="email" name="epost" required inputmode="email"></label>
          <label class="falt" style="margin:0"><span>Roll</span>
            <select name="roll" required>
              ${ROLLNYCKLAR.map((rn) => `<option value="${attr(rn)}"${rn === 'va' ? ' selected' : ''}>${esc(ROLLER[rn].namn)}</option>`).join('')}
            </select>
          </label>
          <label class="falt" style="margin:0"><span>Förnamn i recensioner</span><input name="fornamn" placeholder="Maria"></label>
          <label class="falt" style="margin:0"><span>Butiker (kommatecken, eller * för alla)</span><input name="brands" placeholder="baverbutiken, carashell — eller *" list="butikslista"></label>
          <datalist id="butikslista">${butiker.map((b) => `<option value="${attr(b)}"></option>`).join('')}</datalist>
          <label class="falt" style="margin:0"><span>Tjänar även i</span>
            <select name="extraroll">
              <option value="">— inget extra —</option>
              ${ROLLNYCKLAR.filter((rn) => !['agare', 'chef'].includes(rn)).map((rn) => `<option value="${attr(rn)}">${esc(ROLLER[rn].namn)}</option>`).join('')}
            </select>
          </label>
          <button class="knapp" type="submit">Skapa konto</button>
        </form>`,
        fot: 'Förnamnet är hur systemet hittar personen i en recension. Butikerna styr veckobonusarna (tom inkorg, svarstid) — en stjärna betyder alla butiker, även de som byggs sen.',
      }),
    })}

    ${utanKonto.length ? block({
      titel: 'Personer utan inloggning',
      under: 'De finns i bonusregistret men kan inte logga in — och ser alltså aldrig sina egna pengar.',
      innehall: panel({
        innehall: `<ul class="lista">${utanKonto.map((p) => `
          <li>
            <span>${status('varning', 'ingen inloggning')}</span>
            <span><span class="namn">${esc(p.namn)}</span><span class="bi">${esc(ROLLER[p.roll]?.namn ?? p.roll)}${p.brands?.length ? ` · ${esc(p.brands.map(butiksnamn).join(', '))}` : ''}</span></span>
          </li>`).join('')}</ul>`,
      }),
    }) : ''}

    ${block({
      titel: 'Vad rollerna ser',
      innehall: `<div class="kort-rad">${rollkort}</div>`,
    })}`,
  };
}
