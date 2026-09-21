// vy/annonser.mjs — annonskontona och kampanjerna.
//
// Två regler ur CLAUDE.md sitter i den här vyn:
//
//   • Kontona hålls isär per verksamhet. MagiBorsten (Bäverbutiken),
//     MagiBorsten DK (OPS) och Magiborsten UK är tre olika verksamheter med
//     nästan identiska namn — de summeras aldrig ihop utan etikett.
//   • Rangordningen är VINSTBIDRAG, aldrig ROAS eller CPA ensamt, och domen
//     ställs mot break-even — aldrig mot target. En kampanj under 300 kr spend
//     eller 3 köp får ingen dom alls, bara texten "för lite data".

import { esc, kort, panel, tabell, tomt, block, spark, status, stapel, tal, pengar } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { allaKontolagen, allaKampanjer, produktlista } from '../data.mjs';
import { forandring, pengarKort, sedan } from '../berakna.mjs';

function roas(v) {
  return v === null || v === undefined ? '–' : Number(v).toLocaleString('sv-SE', { maximumFractionDigits: 2 });
}

function domRad(k) {
  if (!k.bedombar.ok) return status('neutral', 'för lite data');
  if (k.breakEvenRoas === null) return status('neutral', 'ingen break-even');
  return status(k.dom.ton === 'bra' ? 'bra' : 'kritisk', k.dom.ton === 'bra' ? 'tjänar pengar' : 'går back');
}

export function annonserSida({ snapshot, nu = new Date() }) {
  const konton = allaKontolagen(snapshot);
  const ok = konton.filter((k) => k.status === 'ok');
  const kampanjer = allaKampanjer(snapshot, produktlista(snapshot));
  const maxBidrag = Math.max(1, ...kampanjer.map((k) => Math.abs(k.vinstbidrag ?? 0)));

  const kortRad = ok.map((k) => kort({
    etikett: k.etikett,
    varde: pengarKort(k.vecka.spend, k.valuta),
    forklaring: `Reklam senaste 7 dagarna. ${tal(k.vecka.kop)} köp, ROAS ${roas(k.vecka.roas)}. I dag: ${pengar(Math.round(k.idag?.spend ?? 0), k.valuta)}.`,
    serie: k.serie,
    jamfor: forandring(k.vecka.spend, k.forraVeckan.spend),
    jamforBra: 'upp',
  })).join('');

  const kampanjrader = kampanjer.map((k) => `<tr>
    <td>
      <span class="namn">${esc(k.namn)}</span>
      <span class="bi">${esc(k.konto)}${k.breakEvenRoas ? ` · break-even ${roas(k.breakEvenRoas)}` : ''}</span>
    </td>
    <td class="tal">${pengar(Math.round(k.spend), k.valuta)}</td>
    <td class="tal">${tal(k.kop)}</td>
    <td class="tal">${k.cpa ? pengar(Math.round(k.cpa), k.valuta) : '–'}</td>
    <td class="tal">${roas(k.roas)}</td>
    <td class="tal">${k.vinstbidrag === null ? '–' : pengar(Math.round(k.vinstbidrag), k.valuta)}</td>
    <td style="width:110px">${k.vinstbidrag === null ? '' : stapel((Math.abs(k.vinstbidrag) / maxBidrag) * 100)}</td>
    <td>${domRad(k)}</td>
  </tr>`);

  const perVerksamhet = new Map();
  for (const k of ok) {
    const v = perVerksamhet.get(k.verksamhet) ?? { verksamhet: k.verksamhet, valuta: k.valuta, spend: 0, kop: 0, konton: 0 };
    v.spend += k.vecka.spend;
    v.kop += k.vecka.kop;
    v.konton += 1;
    perVerksamhet.set(k.verksamhet, v);
  }

  return {
    titel: 'Annonser',
    innehall: `${sidhuvud({
      rubrik: 'Annonser',
      under: 'Sju dagar. Kampanjerna ligger i ordning efter hur mycket pengar de lämnar.',
      farsk: snapshot?.byggd ? `Hämtat <b>${esc(sedan(snapshot.byggd))}</b>` : '',
    })}
    ${kortRad ? `<div class="kort-rad">${kortRad}</div>` : tomt('Inga annonskonton lästes', 'META_ACCESS_TOKEN saknas, eller så strypte Meta anropen (kod 17).')}

    ${perVerksamhet.size > 1 ? block({
      titel: 'Per verksamhet',
      under: 'Kontonamnen är nästan identiska men hör till olika verksamheter. De blandas aldrig ihop.',
      innehall: panel({
        innehall: tabell(
          [{ titel: 'Verksamhet' }, { titel: 'Konton', tal: true }, { titel: 'Reklam 7 d', tal: true }, { titel: 'Köp 7 d', tal: true }],
          [...perVerksamhet.values()].map((v) => `<tr>
            <td><span class="namn">${esc(v.verksamhet)}</span></td>
            <td class="tal">${tal(v.konton)}</td>
            <td class="tal">${pengar(Math.round(v.spend), v.valuta)}</td>
            <td class="tal">${tal(v.kop)}</td>
          </tr>`),
        ),
      }),
    }) : ''}

    ${block({
      titel: 'Kampanjerna',
      under: 'Vinstbidrag = reklamkostnad × (ROAS ÷ break-even − 1). Positivt tal betyder att kampanjen lämnar pengar efter att reklamen är betald.',
      innehall: kampanjer.length
        ? panel({
          innehall: tabell(
            [{ titel: 'Kampanj' }, { titel: 'Reklam', tal: true }, { titel: 'Köp', tal: true }, { titel: 'Pris per köp', tal: true }, { titel: 'ROAS', tal: true }, { titel: 'Vinstbidrag', tal: true }, { titel: '' }, { titel: 'Läge' }],
            kampanjrader,
          ),
          fot: 'Under 300 kr reklam eller 3 köp ställs ingen dom — det är för lite för att veta något.',
        })
        : tomt('Inga kampanjer med spend', 'Antingen har inget konto spenderat de senaste sju dagarna, eller så gick Meta inte att läsa.'),
    })}

    ${konton.filter((k) => k.status !== 'ok').length ? block({
      titel: 'Konton som inte gick att läsa',
      innehall: panel({
        innehall: `<ul class="lista">${konton.filter((k) => k.status !== 'ok').map((k) => `
          <li><span>${status('varning', 'Fel')}</span><span><span class="namn">${esc(k.namn)}</span><span class="bi">${esc(k.orsak ?? '')}</span></span></li>`).join('')}</ul>`,
      }),
    }) : ''}`,
  };
}
