// vy/laget.mjs — Laget: tavlan alla ser. Kreativa arbetet och veckans vinnare.
//
// Byggordningen efter Evolve, steg 2 (stonebite/evolve/SVAR.md, svar 3): två
// lager. Här är lagets lager — kön, vem som äger vad, vad som gick live och
// vilka annonser som vann, med namn, så att laget kan fira. Individens tal
// (ledtid och andel vinnare per person) ser bara ägaren och chefen; de hör
// till det privata scorecardet på Min sida (steg 3).
//
// ⛔ Inga kronor på sidan. Redigerarna ser den och får aldrig se spend.
// Trösklarna är absoluta, aldrig "sämst i gruppen" (CLAUDE.md).

import { esc, kort, panel, tabell, tomt, block, status, tal, sprak } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { sedan } from '../berakna.mjs';
import { harRatt, personIdFor } from '../roller.mjs';

/** Svensk text till ägare och chef, engelsk till alla andra — hela meningar med tal i. */
const L = (sv, en) => (sprak() === 'en' ? en : sv);
/** "2 h ago" — berakna.mjs sedan() är bara svensk. */
const sedanEn = (iso) => {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  return min < 60 ? `${min} min ago` : min < 48 * 60 ? `${Math.round(min / 60)} h ago` : `${Math.round(min / 1440)} days ago`;
};
const procent = (x) => `${Math.round(x * 100)} %`;
const dagar = (x) => (x === null || x === undefined ? '–' : L(`${x.toLocaleString('sv-SE', { maximumFractionDigits: 1 })} d`, `${x.toLocaleString('en-US', { maximumFractionDigits: 1 })} d`));

function vinnarkort(v) {
  return kort({
    etikett: v.person,
    text: true,
    varde: esc(v.annons),
    forklaring: L(
      `Tar ${procent(v.andel)} av sin kampanjs reklam senaste 7 dagarna. Live sedan ${v.dagar} dagar.`,
      `Takes ${procent(v.andel)} of its campaign's ad budget over the last 7 days. Live for ${v.dagar} days.`,
    ),
    status: status('bra', L('vinnare', 'winner')),
  });
}

export function lagetSida({ snapshot, anvandare }) {
  const tv = snapshot?.tavla ?? null;
  const ledning = harRatt(anvandare, 'pengar');
  const mittId = personIdFor(anvandare);
  const rubrik = L('Laget', 'The team');
  const under = L('Det kreativa arbetet just nu, och vilka annonser som vann. Inga kronor, bara arbetet.', 'The creative work right now, and which ads won. No money, just the work.');

  if (!tv || tv.status === 'saknas' || tv.status === 'fel' || !tv.lag) {
    return {
      titel: 'Laget',
      innehall: `${sidhuvud({ rubrik, under })}
      ${tomt(L('Tavlan är inte hämtad än', 'The board has not been loaded yet'), tv?.orsak ?? L('Timhämtningen har inte skrivit någon tavla ännu.', 'The hourly update has not written a board yet.'))}`,
    };
  }

  const lag = tv.lag;
  const trosk = tv.troskel ?? { vinnarandel: 0.2, forsenadDagar: 10 };

  // ---------------------------------------------------- veckans vinnare
  const vinnardel = block({
    titel: L('Veckans vinnare', 'Winners this week'),
    under: L(
      `En ny annons som tar minst ${procent(trosk.vinnarandel)} av sin kampanjs reklam är en vinnare. Det betyder att Meta väljer den framför allt annat i kampanjen.`,
      `A new ad that takes at least ${procent(trosk.vinnarandel)} of its campaign's ad budget is a winner. It means Meta picks it over everything else in the campaign.`,
    ),
    innehall: tv.meta !== 'ok'
      ? tomt(L('Vinnarna går inte att räkna just nu', 'Winners cannot be counted right now'), tv.orsak ?? '')
      : tv.vinnare.length
        ? `<div class="kort-rad">${tv.vinnare.map(vinnarkort).join('')}</div>`
        : tomt(L('Ingen vinnare den här veckan än', 'No winner this week yet'), L('Ingen annons från de senaste 35 dagarna har tagit över sin kampanj. Nästa kan vara din.', 'No ad from the last 35 days has taken over its campaign. The next one could be yours.')),
  });

  // ---------------------------------------------------------- lagets tal
  const traff = lag.lanserade >= 10 ? lag.vinnare / lag.lanserade : null;
  const korten = [
    kort({
      etikett: L('Live senaste 7 dagarna', 'Live last 7 days'),
      varde: tal(lag.live7),
      forklaring: L('Nya annonser från laget som gick live i Meta.', 'New ads from the team that went live in Meta.'),
    }),
    kort({
      etikett: L('Brief till live', 'Brief to live'),
      varde: dagar(lag.ledtidMedian),
      forklaring: L('Medianen, från att raden skapades i Notion till att annonsen gick live. Senaste 30 dagarna.', 'Median, from the Notion row being created to the ad going live. Last 30 days.'),
    }),
    kort({
      etikett: L('Andel vinnare', 'Hit rate'),
      varde: traff === null ? '–' : procent(traff),
      forklaring: traff === null
        ? L('För få nya annonser för att räkna en andel.', 'Too few new ads to count a rate.')
        : L(`${tal(lag.vinnare)} vinnare av ${tal(lag.lanserade)} nya annonser senaste 35 dagarna.`, `${tal(lag.vinnare)} winners out of ${tal(lag.lanserade)} new ads in the last 35 days.`),
    }),
    kort({
      etikett: L(`Över ${trosk.forsenadDagar} dagar`, `Over ${trosk.forsenadDagar} days`),
      varde: tal(lag.forsenade),
      forklaring: L('Annonser som pågått eller legat i revision längre än så.', 'Ads in progress or in revision for longer than that.'),
      status: lag.forsenade > 0 ? status('varning', L('titta', 'check')) : status('bra', L('inget ligger', 'nothing stuck')),
    }),
  ].join('');

  // --------------------------------------------------- vem äger vad
  const kol = [
    { titel: L('Redigerare', 'Editor') },
    { titel: L('Pågår', 'In progress'), tal: true },
    { titel: L('Revision', 'Revision'), tal: true },
    { titel: L('Granskas', 'In review'), tal: true },
    { titel: L('Live 7 d', 'Live 7 d'), tal: true },
    { titel: L('Vinnare 35 d', 'Winners 35 d'), tal: true },
    ...(ledning ? [{ titel: L('Brief till live', 'Brief to live'), tal: true }, { titel: L('Andel vinnare', 'Hit rate'), tal: true }] : []),
    { titel: L('Läge', 'Status') },
  ];
  const rader = tv.personer.map((p) => {
    const dennaAnd = p.lanserade >= 10 ? procent(p.vinnare / p.lanserade) : '–';
    const lage = p.forsenade > 0
      ? status('varning', L(`${p.forsenade} över ${trosk.forsenadDagar} dagar`, `${p.forsenade} over ${trosk.forsenadDagar} days`))
      : p.vinnare > 0 ? status('bra', L('har vinnare', 'has winners')) : status('neutral', L('i fas', 'on track'));
    return `<tr${p.id === mittId ? ' style="background:var(--yta-2)"' : ''}>
      <td><span class="namn">${esc(p.namn)}${p.id === mittId ? L(' · du', ' · you') : ''}</span></td>
      <td class="tal">${tal(p.ko.pagar)}</td>
      <td class="tal">${tal(p.ko.revision)}</td>
      <td class="tal">${tal(p.ko.vantar)}</td>
      <td class="tal">${tal(p.live7)}</td>
      <td class="tal"><b>${tal(p.vinnare)}</b></td>
      ${ledning ? `<td class="tal">${dagar(p.ledtidMedian)}</td><td class="tal">${dennaAnd}</td>` : ''}
      <td>${lage}</td>
    </tr>`;
  });
  const agardel = block({
    titel: L('Vem äger vad', 'Who owns what'),
    under: L('Varje redigerares kö just nu, och vad som gick live. Granskas = levererad, väntar på granskning.', "Each editor's queue right now, and what went live. In review = delivered, waiting for review."),
    innehall: rader.length
      ? panel({
        innehall: tabell(kol, rader),
        fot: [
          lag.attGora ? L(`${tal(lag.attGora)} briefer väntar på en redigerare.`, `${tal(lag.attGora)} briefs are waiting for an editor.`) : '',
          tv.utanAnnonser?.length ? L(`Ingen annonsrad senaste 35 dagarna: ${tv.utanAnnonser.join(', ')}.`, `No ad rows in the last 35 days: ${tv.utanAnnonser.join(', ')}.`) : '',
          ledning ? L('Brief till live och andel vinnare per person ser bara du och chefen.', 'Only the owner and manager see brief-to-live and hit rate per person.') : '',
        ].filter(Boolean).join(' '),
      })
      : tomt(L('Ingen kö att visa', 'No queue to show'), L('Ingen redigerare har annonsrader i Notion senaste 35 dagarna.', 'No editor has ad rows in Notion in the last 35 days.')),
  });

  // ---------------------------------------------- har legat länge
  const langdel = tv.forsenade?.length ? block({
    titel: L('Har legat länge', 'Stuck for a while'),
    under: L(`Pågår eller i revision sedan mer än ${trosk.forsenadDagar} dagar. Räknat från radens skapelsedag, eftersom Notion inte sparar när statusen ändrades.`, `In progress or in revision for more than ${trosk.forsenadDagar} days. Counted from the day the row was created, because Notion does not save when the status changed.`),
    innehall: panel({
      innehall: `<ul class="lista">${tv.forsenade.map((f) => `<li><span>${status('varning', L(`${f.dagar} d`, `${f.dagar} d`))}</span><span><span class="namn">${esc(f.rad)}</span><span class="bi">${esc(f.person)} · ${esc(f.kolumn === 'revision' ? L('revision', 'revision') : L('pågår', 'in progress'))}</span></span></li>`).join('')}</ul>`,
    }),
  }) : '';

  return {
    titel: 'Laget',
    innehall: `${sidhuvud({ rubrik, under, farsk: snapshot?.byggd ? `${L('Hämtat', 'Updated')} <b>${esc(sprak() === 'en' ? sedanEn(snapshot.byggd) : sedan(snapshot.byggd))}</b>` : '' })}
    ${vinnardel}
    <div class="kort-rad">${korten}</div>
    ${agardel}
    ${langdel}
    <p class="mini">${esc(L(
      `Källor: Notion (varje annonsrad med ansvarig) och Meta (nya annonser och deras andel av kampanjen). Bara svenska originalannonser räknas. En översättning är inte en ny annons.${tv.orsak ? ` Saknas: ${tv.orsak}` : ''}`,
      `Sources: Notion (every ad row with an owner) and Meta (new ads and their share of the campaign). Only original Swedish ads count. A translation is not a new ad.${tv.orsak ? ` Missing: ${tv.orsak}` : ''}`,
    ))}</p>`,
  };
}
