// vy/produkter.mjs — Produkttest och Recensioner.
//
// Produkttest är trappan en ny produkt går uppför: godkänd research → fick sin
// chans → går med vinst → skalas. Varje steg är pengar till den som hittade
// produkten, så trappan är både arbetsflöde och lönebesked.
//
// Recensionssidan svarar på EN fråga: får någon betalt för det kunderna
// skriver? Står det noll i "med namn" är bonusprogrammet bara ett löfte.

import { esc, attr, kort, panel, tabell, tomt, block, status, stapel, spark, tal, t, sprak } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { sedan, datum } from '../berakna.mjs';
import { harRatt } from '../roller.mjs';

const STEGNAMN = {
  produkt_godkand: 'Godkänd för test',
  produkt_testad: 'Fick sin chans',
  produkt_lonsam: 'Går med vinst',
  produkt_skalad: 'Skalas',
};

/** Ett steg i trappan på läsarens språk. */
const steg = (id) => t(STEGNAMN[id] ?? id);

// ------------------------------------------------------------- produkttest

export function produkttestSida({ snapshot, anvandare, nu = new Date() }) {
  const p = snapshot?.produkttest ?? null;
  const serPengar = harRatt(anvandare, 'pengar');

  if (!p || !p.antal) {
    return {
      titel: 'Produkttest',
      innehall: `${sidhuvud({ rubrik: 'Produkttest', under: 'Nya produkter på väg genom trappan.' })}
      ${tomt('Ingen produkttestdata', 'Notion svarade inte, eller så är Product test center tomt. Kör hämtningen igen.')}`,
    };
  }

  const stegen = p.steg ?? {};
  const max = Math.max(1, stegen.produkt_godkand ?? 0);
  const trappa = Object.entries(STEGNAMN).map(([id]) => ({
    id, namn: steg(id), antal: stegen[id] ?? 0, andel: ((stegen[id] ?? 0) / max) * 100,
  }));

  const kortRad = [
    kort({
      etikett: 'Produkter i trappan',
      varde: tal(p.antal),
      forklaring: 'Produkter som passerat minst ett steg. Varje steg är pengar till den som hittade den.',
    }),
    kort({
      etikett: 'Fick sin chans',
      varde: tal(stegen.produkt_testad ?? 0),
      forklaring: 'Har spenderat över 2 000 kr i annonser — tillräckligt för att veta något.',
    }),
    kort({
      etikett: 'Går med vinst',
      varde: tal(stegen.produkt_lonsam ?? 0),
      forklaring: 'Märkta Profitable i Notion: de tjänar pengar över break-even.',
      status: (stegen.produkt_lonsam ?? 0) > 0 ? status('bra', 'vinnare hittade') : status('varning', 'ingen än'),
    }),
    kort({
      etikett: 'Skalas nu',
      varde: tal(stegen.produkt_skalad ?? 0),
      forklaring: 'Produkter som fått fortsätta växa — kandidater för en egen butik.',
    }),
  ].join('');

  const rader = (p.rader ?? []).slice(0, 60).map((r) => `<tr>
    <td>
      <span class="namn">${r.lank ? `<a href="${attr(r.lank)}" rel="noopener" style="border-bottom:1px solid var(--linje-stark)">${esc(r.produkt)}</a>` : esc(r.produkt)}</span>
      <span class="bi">${esc(r.butik ?? '')}${r.typ ? ` · ${esc(r.typ)}` : ''}</span>
    </td>
    <td><span class="mini">${esc(r.ansvarig ?? t('ingen ansvarig'))}</span></td>
    <td>${esc(r.status ?? '')}</td>
    <td>${(r.steg ?? []).map((x) => `<span class="tagg">${esc(steg(x))}</span>`).join(' ')}</td>
    <td class="tal"><span class="mini">${esc(String(r.datum ?? '').slice(0, 10))}</span></td>
  </tr>`);

  return {
    titel: 'Produkttest',
    innehall: `${sidhuvud({
      rubrik: 'Produkttest',
      under: 'Trappan från hittad produkt till egen butik.',
      farsk: snapshot?.byggd ? `Hämtat <b>${esc(sedan(snapshot.byggd))}</b>` : '',
    })}
    <div class="kort-rad">${kortRad}</div>

    ${block({
      titel: 'Trappan',
      under: 'Hur många som tagit sig till varje steg. Fallet mellan två steg säger var det tar stopp.',
      innehall: panel({
        innehall: tabell(
          [{ titel: 'Steg' }, { titel: 'Produkter', tal: true }, { titel: '' }],
          trappa.map((t) => `<tr>
            <td><span class="namn">${esc(t.namn)}</span></td>
            <td class="tal">${tal(t.antal)}</td>
            <td style="width:220px">${stapel(t.andel)}</td>
          </tr>`),
        ),
      }),
    })}

    ${block({
      titel: 'Vem hittar produkterna',
      under: 'Ansvarig i Notion. Har personen ett konto här får hen betalt för varje steg produkten klarar.',
      innehall: panel({
        innehall: tabell(
          [{ titel: 'Person' }, { titel: 'Produkter', tal: true }, { titel: 'Lönsamma', tal: true }, { titel: 'Skalade', tal: true }],
          (p.personer ?? []).map((x) => `<tr>
            <td><span class="namn">${esc(x.ansvarig)}</span></td>
            <td class="tal">${tal(x.antal)}</td>
            <td class="tal">${tal(x.lonsamma)}</td>
            <td class="tal">${tal(x.skalade)}</td>
          </tr>`),
        ),
        fot: 'En rad utan ansvarig ger ingen bonus till någon — skriv in Ansvarig i Notion.',
      }),
    })}

    ${block({
      titel: 'Produkterna',
      innehall: panel({
        innehall: tabell(
          [{ titel: 'Produkt' }, { titel: 'Ansvarig' }, { titel: 'Status' }, { titel: 'Klarade steg' }, { titel: 'Datum', tal: true }],
          rader,
        ),
        fot: sprak() === 'en'
          ? `Showing ${Math.min(60, p.rader?.length ?? 0)} of ${tal(p.antal)}.`
          : `Visar ${Math.min(60, p.rader?.length ?? 0)} av ${tal(p.antal)}.`,
      }),
    })}`,
  };
}

// ------------------------------------------------------------- recensioner

export function recensionerSida({ snapshot, anvandare, nu = new Date() }) {
  const r = snapshot?.recensioner ?? null;

  if (!r || !r.antal) {
    return {
      titel: 'Recensioner',
      innehall: `${sidhuvud({ rubrik: 'Recensioner', under: 'Vad kunderna skriver — och vem de tackar.' })}
      ${tomt('Inga recensioner lästes', 'Judge.me-nyckeln saknas, eller så finns inga recensioner de senaste 60 dagarna.')}`,
    };
  }

  const andelMedNamn = r.antal ? (r.medNamn / r.antal) * 100 : 0;
  const kortRad = [
    kort({
      etikett: 'Recensioner (60 dagar)',
      varde: tal(r.antal),
      forklaring: sprak() === 'en'
        ? `Average rating ${r.snitt ? r.snitt.toLocaleString('sv-SE', { maximumFractionDigits: 2 }) : '–'}. ${tal(r.fyraFem)} have four or five stars.`
        : `Snittbetyg ${r.snitt ? r.snitt.toLocaleString('sv-SE', { maximumFractionDigits: 2 }) : '–'}. ${tal(r.fyraFem)} har fyra eller fem stjärnor.`,
      serie: (r.manader ?? []).map((m) => m.antal),
    }),
    kort({
      etikett: 'Nämner någon i teamet',
      varde: tal(r.medNamn),
      forklaring: r.medNamn === 0
        ? t('Ingen enda recension nämner en medarbetare. Då kan heller ingen få de fem dollarna — be kunden skriva ditt namn.')
        : (sprak() === 'en'
          ? `${andelMedNamn.toLocaleString('sv-SE', { maximumFractionDigits: 1 })} % of the reviews. Each one is money to someone.`
          : `${andelMedNamn.toLocaleString('sv-SE', { maximumFractionDigits: 1 })} % av recensionerna. Varje sådan är pengar till någon.`),
      status: r.medNamn === 0 ? status('kritisk', 'ingen får betalt') : status('bra', 'betalas ut'),
      serie: (r.manader ?? []).map((m) => m.medNamn),
    }),
    kort({
      etikett: 'Butiker med recensioner',
      varde: tal((r.butiker ?? []).length),
      forklaring: (r.butiker ?? []).map((b) => `${b.butik}: ${b.antal}`).slice(0, 3).join(' · '),
    }),
    kort({
      etikett: 'Källor',
      varde: esc([...new Set((r.butiker ?? []).flatMap((b) => b.kallor ?? []))].join(' + ') || '–'),
      forklaring: 'Judge.me läses automatiskt. Trustpilot kräver en API-nyckel — tills dess rapporterar VA:n in dem själv.',
    }),
  ].join('');

  const butiksrader = (r.butiker ?? []).map((b) => `<tr>
    <td><span class="namn">${esc(b.butik)}</span><span class="bi">${esc((b.kallor ?? []).join(', '))}</span></td>
    <td class="tal">${tal(b.antal)}</td>
    <td class="tal">${b.snitt ? b.snitt.toLocaleString('sv-SE', { maximumFractionDigits: 2 }) : '–'}</td>
    <td class="tal">${tal(b.fyraFem)}</td>
    <td class="tal">${tal(b.medNamn)}</td>
  </tr>`);

  const medNamn = r.medNamnSenaste ?? [];

  return {
    titel: 'Recensioner',
    innehall: `${sidhuvud({
      rubrik: 'Recensioner',
      under: 'Vad kunderna skriver, och vem de tackar vid namn.',
      farsk: snapshot?.byggd ? `Hämtat <b>${esc(sedan(snapshot.byggd))}</b>` : '',
    })}
    <div class="kort-rad">${kortRad}</div>

    ${r.medNamn === 0 ? block({
      innehall: tomt(
        'Noll recensioner nämner någon i teamet',
        t('Det är därför bonusen aldrig betalas ut. Fem dollar per recension med ditt namn — men kunden skriver bara namnet om du ber om det. Be om det i varje avslutat ärende.'),
      ),
    }) : ''}

    ${medNamn.length ? block({
      titel: 'Recensioner som gav någon pengar',
      under: 'Kunden skrev namnet — då vet systemet vem som ska ha betalt.',
      innehall: panel({
        innehall: `<ul class="lista">${medNamn.map((x) => `
          <li>
            <span class="tid">${esc(String(x.datum ?? '').slice(0, 10))}</span>
            <span>
              <span class="namn">${esc(x.personer.join(', '))} — ${tal(x.betyg)}★</span>
              <span class="bi">${esc(x.text)}</span>
            </span>
          </li>`).join('')}</ul>`,
      }),
    }) : ''}

    ${block({
      titel: 'Per butik',
      innehall: panel({
        innehall: tabell(
          [{ titel: 'Butik' }, { titel: 'Recensioner', tal: true }, { titel: 'Snitt', tal: true }, { titel: '4–5★', tal: true }, { titel: 'Med namn', tal: true }],
          butiksrader,
        ),
      }),
    })}

    ${block({
      titel: 'Senaste recensionerna',
      innehall: panel({
        innehall: `<ul class="lista">${(r.senaste ?? []).slice(0, 20).map((x) => `
          <li>
            <span class="tid">${esc(String(x.datum ?? '').slice(0, 10))}</span>
            <span>
              <span class="namn">${tal(x.betyg)}★ ${esc(x.kund || 'Kund')}${x.butik ? ` · ${esc(x.butik)}` : ''}</span>
              <span class="bi">${esc(x.text)}</span>
            </span>
            ${x.personer?.length ? `<span style="margin-left:auto">${status('bra', x.personer.join(', '))}</span>` : ''}
          </li>`).join('')}</ul>`,
        fot: 'De 60 senaste dagarna. En recension räknas som bonus först vid fyra stjärnor eller mer.',
      }),
    })}`,
  };
}
