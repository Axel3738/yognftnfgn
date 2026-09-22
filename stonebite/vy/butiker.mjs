// vy/butiker.mjs — en rad per butik, och ett kort per butik som går att läsa
// på tre sekunder: sålt i dag, sålt i veckan, snittorder, kurva.

import { esc, attr, kort, panel, tabell, tomt, block, spark, status, tal, pengar } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { allaButikslagen, butikerPerValuta } from '../data.mjs';
import { forandring, pengarKort, sedan } from '../berakna.mjs';
import { forklaraFel } from '../forklaring.mjs';

export function butikerSida({ snapshot, nu = new Date() }) {
  const butiker = allaButikslagen(snapshot, { nu });
  const ok = butiker.filter((b) => b.status === 'ok');
  // Avstängda med flit (stonebite/butiker-av.json) är Axels beslut, inte ett fel — egen lista längst ned.
  const avstangda = butiker.filter((b) => b.status === 'av');
  const trasiga = butiker.filter((b) => b.status !== 'ok' && b.status !== 'av');
  const valutor = butikerPerValuta(butiker);

  const kortRad = ok
    .slice()
    .sort((a, b) => b.vecka.omsattning - a.vecka.omsattning)
    .map((b) => kort({
      etikett: b.namn,
      varde: pengarKort(b.vecka.omsattning, b.valuta),
      forklaring: `Sålt de senaste 7 dagarna. ${tal(b.vecka.ordrar)} ordrar, snitt ${pengar(Math.round(b.aov ?? 0), b.valuta)} per order.`,
      serie: b.serie,
      jamfor: forandring(b.vecka.omsattning, b.forraVeckan.omsattning),
    }))
    .join('');

  const rader = ok.map((b) => `<tr>
    <td>
      <span class="namn">${b.url ? `<a href="${attr(b.url)}" rel="noopener" style="border-bottom:1px solid var(--linje-stark)">${esc(b.namn)}</a>` : esc(b.namn)}</span>
      <span class="bi">${esc(b.land || '')}</span>
    </td>
    <td class="tal">${b.idag ? pengar(b.idag.omsattning, b.valuta) : '–'}</td>
    <td class="tal">${b.idag ? tal(b.idag.ordrar) : '–'}</td>
    <td class="tal">${pengar(b.vecka.omsattning, b.valuta)}</td>
    <td class="tal">${pengar(b.manad.omsattning, b.valuta)}</td>
    <td class="tal">${b.aov ? pengar(Math.round(b.aov), b.valuta) : '–'}</td>
    <td style="width:130px">${spark(b.serie, { titel: `${b.namn} 30 dagar` }) || ''}</td>
  </tr>`);

  const trasigaDel = trasiga.length ? block({
    titel: 'Butiker som inte gick att läsa',
    under: 'De säljer förmodligen som vanligt — vi kommer bara inte åt siffrorna. Orsaken står i klartext.',
    innehall: panel({
      innehall: `<ul class="lista">${trasiga.map((b) => {
        const f = forklaraFel(b.orsak);
        return `<li>
          <span>${status('varning', 'stängd dörr')}</span>
          <span><span class="namn">${esc(b.namn)}</span><span class="bi">${esc(f.text)}${f.atgard ? ` — ${esc(f.atgard)}` : ''}</span></span>
        </li>`;
      }).join('')}</ul>`,
      fot: 'Så länge dörren är stängd räknas butiken inte med i några summor — den syns som saknad, aldrig som noll.',
    }),
  }) : '';

  const avstangdaDel = avstangda.length ? block({
    titel: 'Avstängda med flit',
    under: 'Butiker som inte säljer längre. De hämtas inte och räknas varken som lästa eller saknade. Registret: stonebite/butiker-av.json.',
    innehall: panel({
      innehall: `<ul class="lista">${avstangda.map((b) => `<li>
          <span>${status('neutral', 'avstängd')}</span>
          <span><span class="namn">${esc(b.namn)}</span><span class="bi">${esc(b.orsak ?? '')}</span></span>
        </li>`).join('')}</ul>`,
    }),
  }) : '';

  return {
    titel: 'Butiker',
    innehall: `${sidhuvud({
      rubrik: 'Butiker',
      under: `${ok.length} butiker lästes${trasiga.length ? `, ${trasiga.length} svarade inte` : ''}${avstangda.length ? `, ${avstangda.length} avstängd${avstangda.length === 1 ? '' : 'a'} med flit` : ''}.`,
      farsk: snapshot?.byggd ? `Hämtat <b>${esc(sedan(snapshot.byggd))}</b>` : '',
    })}
    ${kortRad ? `<div class="kort-rad">${kortRad}</div>` : tomt('Inga butiker gick att läsa', 'Kör hämtningen igen, eller kolla nycklarna.')}
    ${ok.length ? block({
      titel: 'Allt i siffror',
      under: 'I dag, 7 dagar, 30 dagar och snitt per order.',
      innehall: panel({
        innehall: tabell(
          [{ titel: 'Butik' }, { titel: 'Sålt i dag', tal: true }, { titel: 'Ordrar i dag', tal: true }, { titel: '7 dagar', tal: true }, { titel: '30 dagar', tal: true }, { titel: 'Snitt per order', tal: true }, { titel: '30 dagar' }],
          rader,
        ),
        fot: valutor.map((v) => `${v.valuta}: ${pengar(Math.round(v.manad.omsattning), v.valuta)} på 30 dagar`).join('  ·  '),
      }),
    }) : ''}
    ${trasigaDel}
    ${avstangdaDel}`,
  };
}
