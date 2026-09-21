// vy/system.mjs — kartan över allt som är byggt.
//
// Axel har byggt fyrtio kommandon och ett trettiotal rutiner över ett halvår.
// Den här sidan är svaret på "vad har jag egentligen?" — systemen i kategorier,
// vad var och ett gör, var koden ligger och vilket kommando som startar det.
// Plus dygnet: vilken rutin som går när.
//
// Innehållet ligger i stonebite/system.json. Bygger du något nytt: lägg till
// det där, så syns det här. Sidan hittar aldrig på ett system.

import { esc, panel, tomt, block, status, tal } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { datum } from '../berakna.mjs';

const STATUSTON = { drift: 'bra', nytt: 'bra', byggs: 'varning', delvis: 'varning', pausad: 'kritisk' };
const STATUSORD = { drift: 'i drift', nytt: 'nytt', byggs: 'byggs', delvis: 'delvis klart', pausad: 'pausad' };

export function systemSida({ snapshot, nu = new Date() }) {
  const s = snapshot?.system ?? null;
  if (!s) {
    return {
      titel: 'System',
      innehall: `${sidhuvud({ rubrik: 'System', under: 'Allt som är byggt.' })}
      ${tomt('Ingen systemkarta', 'stonebite/system.json saknas i snapshoten.')}`,
    };
  }

  const antal = (s.kategorier ?? []).reduce((n, k) => n + (k.system?.length ?? 0), 0);

  const kategorier = (s.kategorier ?? []).map((k) => block({
    titel: k.namn,
    under: k.vad,
    innehall: panel({
      innehall: `<ul class="lista">${(k.system ?? []).map((x) => `
        <li>
          <span style="flex:none;min-width:150px">
            <span class="namn">${esc(x.namn)}</span>
            ${x.kommando ? `<span class="bi"><code>${esc(x.kommando)}</code></span>` : ''}
          </span>
          <span>
            <span>${esc(x.vad)}</span>
            ${x.var ? `<span class="bi">${esc(x.var)}</span>` : ''}
          </span>
          <span style="margin-left:auto">${status(STATUSTON[x.status] ?? 'neutral', STATUSORD[x.status] ?? x.status ?? '')}</span>
        </li>`).join('')}</ul>`,
    }),
  })).join('');

  return {
    titel: 'System',
    innehall: `${sidhuvud({
      rubrik: 'Systemen',
      under: `${tal(antal)} system i ${tal((s.kategorier ?? []).length)} kategorier, och ${tal((s.rutiner ?? []).length)} rutiner som går av sig själva.`,
      farsk: s.uppdaterad ? `Kartan uppdaterad <b>${esc(datum(s.uppdaterad, { nu }))}</b>` : '',
    })}

    ${block({
      titel: 'Dygnet',
      under: 'Rutinerna som kör utan att någon startar dem. Tiderna är svensk tid.',
      innehall: panel({
        innehall: `<ul class="lista">${(s.rutiner ?? []).map((r) => `
          <li>
            <span class="tid" style="min-width:110px">${esc(r.tid)}</span>
            <span>
              <span class="namn">${esc(r.namn)}</span>
              <span class="bi">${esc(r.vad)}${r.kommando ? ` · ${esc(r.kommando)}` : ''}</span>
            </span>
          </li>`).join('')}</ul>`,
        fot: s.rutiner_kommentar ?? '',
      }),
    })}

    ${kategorier}`,
  };
}
