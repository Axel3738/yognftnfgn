// vy/bonus.mjs — pengarna vid sidan av lönen.
//
// Två vyer: Bonus (ägare, chef och Head of support ser alla) och delarna som
// byggs in i Min sida (var och en ser sitt eget).
//
// Sidan är byggd för att göra folk hungriga, och det betyder tre saker:
//   1. SIFFRAN FÖRST. "Du har tjänat 25 dollar" — inte en tabell att tolka.
//   2. NÄSTA STEG SYNS. Varje uppdrag säger exakt vad man gör för att tjäna
//      mer, med belopp bredvid. Ett program ingen förstår betalar aldrig ut.
//   3. BEVISET LIGGER FRAMME. Varje krona pekar på recensionen, tvisten eller
//      produkten som gav den. Ingen behöver lita på systemet — man kan titta.

import { esc, attr, kort, panel, tabell, tomt, block, status, stapel, tal, t, sprak } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { sedan, datum } from '../berakna.mjs';
import { harRatt, personIdFor, ROLLER } from '../roller.mjs';
import { uppdragForRoll } from '../../bonus/motor.mjs';

const USD = (v) => (v === null || v === undefined ? '–' : `$${Number(v).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
const USD0 = (v) => (v === null || v === undefined ? '–' : `$${Number(v).toLocaleString('sv-SE', { maximumFractionDigits: 0 })}`);

/** Ett sparat uppdrags-id → namnet på läsarens språk. */
function uppdragsnamn(program, insats) {
  const u = (program ?? []).flatMap((p) => p.uppdrag ?? []).find((x) => x.id === insats.uppdrag);
  return u ? txt(u, 'namn') : (insats.uppdragNamn ?? insats.uppdrag);
}

/** Uppdragets text på läsarens språk. Saknas engelskan visas svenskan. */
function txt(u, falt) {
  return (sprak() === 'en' ? u?.en?.[falt] : null) ?? u?.[falt] ?? '';
}

/** Ett uppdragskort: vad det ger, hur man gör, hur det mäts. */
function uppdragskort(u, mitt = null, veckoLage = null) {
  const belopp = u.andel ? `${(u.belopp * 100).toLocaleString('sv-SE', { maximumFractionDigits: 2 })} %` : USD0(u.belopp);
  const mall = u.mall ? `
    <div style="margin-top:12px;padding:12px;border:1px dashed var(--linje-stark);border-radius:var(--radie);background:var(--yta-2)">
      <div class="etikett" style="margin-bottom:6px">${esc(t('Be om recensionen så här'))}</div>
      <p class="mini" id="mall-${esc(u.id)}" style="color:var(--ink-2);line-height:1.5">${esc(sprak() === 'en' ? (u.mall.en ?? u.mall.sv) : u.mall.sv)}</p>
      <button class="knapp liten tyst" type="button" data-kopiera="mall-${esc(u.id)}" data-klar="${attr(t('Kopierat!'))}" style="margin-top:10px">${esc(t('Kopiera texten'))}</button>
      <p class="mini" style="margin-top:8px">${esc(t('Skicka EFTER att kundens problem är löst — aldrig före.'))}</p>
    </div>` : '';
  const vecka = veckoLage ? `<p class="mini mellan">${esc(t('Den här veckan'))}: <b>${tal(veckoLage.antal)}</b> ${esc(t('av'))} ${tal(veckoLage.mal)} ${esc(t('recensioner med ditt namn'))}</p>` : '';
  return `<article class="kort" style="min-height:0">
    <div class="etikett">${esc(txt(u, 'namn'))}</div>
    <div class="varde">${esc(belopp)}</div>
    <p class="forklaring">${esc(txt(u, 'enhet'))}</p>
    <p class="forklaring" style="margin-top:10px"><b>${esc(t('Så gör du:'))}</b> ${esc(txt(u, 'hur'))}</p>
    ${mall}
    ${vecka}
    <div class="botten">
      <div>${mitt ? status('bra', `${sprak() === 'en' ? 'you' : 'du'}: ${USD(mitt.summa)} · ${tal(mitt.antal)}`) : `<span class="mini">${esc(txt(u, 'mats'))}</span>`}</div>
    </div>
  </article>`;
}

/** Bevislistan — det som gör utbetalningen kontrollerbar. */
function bevislista(rader) {
  const alla = rader.flatMap((r) => (r.bevis ?? []).map((b) => ({ ...b, uppdrag: r.namn })));
  if (!alla.length) return '';
  return `<ul class="lista">${alla.slice(0, 30).map((b) => `
    <li>
      <span class="tid">${esc(b.datum || '')}</span>
      <span>
        <span class="namn">${esc(b.vad)}</span>
        <span class="bi">${esc(b.uppdrag)}${b.text ? ` · ${esc(b.text)}` : ''}${b.av ? ` · ${esc(b.av)}` : ''}</span>
      </span>
      ${b.lank ? `<a class="mini" href="${attr(b.lank)}" rel="noopener" style="margin-left:auto;border-bottom:1px solid var(--linje-stark)">öppna</a>` : ''}
    </li>`).join('')}</ul>`;
}

// ------------------------------------------------------------- Bonus-sidan

export function bonusSida({ snapshot, anvandare, csrf, meddelande = '', fel = '' }) {
  const b = snapshot?.bonus ?? null;
  const program = snapshot?.bonusProgram?.program ?? {};
  const serAlla = harRatt(anvandare, 'bonus-alla');
  const farGodkanna = harRatt(anvandare, 'godkanna');
  const mittId = personIdFor(anvandare);

  // Godkännandekön byggs FÖRE allt annat och visas även när ingen uträkning
  // hunnit köras: någon väntar på sina pengar, och det får inte hänga på att
  // en hämtning gått igenom.
  const vantandeNu = (snapshot?.insatser ?? []).filter((i) => i.status === 'vantar');
  const kon = (rubrik) => (farGodkanna && vantandeNu.length ? block({
    titel: rubrik,
    under: 'Insatser folk rapporterat in själva. Kontrollera länken innan du godkänner — pengarna betalas ut på ditt klick.',
    innehall: panel({
      innehall: `<ul class="lista">${vantandeNu.map((i) => `
        <li>
          <span class="tid">${esc(String(i.datum ?? '').slice(0, 10))}</span>
          <span>
            <span class="namn">${esc(i.personNamn ?? i.personId)} · ${esc(i.uppdragNamn ?? i.uppdrag)}</span>
            <span class="bi">${esc(String(i.text ?? '').slice(0, 160))}${i.referens ? ` · ${esc(i.referens)}` : ''}</span>
          </span>
          ${i.lank ? `<a class="mini" href="${attr(i.lank)}" rel="noopener" style="border-bottom:1px solid var(--linje-stark)">${esc(t('öppna'))}</a>` : ''}
          <span style="display:flex;gap:6px;margin-left:auto">
            <form method="post" action="/app/bonus/godkann">
              <input type="hidden" name="csrf" value="${attr(csrf)}"><input type="hidden" name="id" value="${attr(i.id)}"><input type="hidden" name="beslut" value="godkand">
              <button class="knapp liten" type="submit">${esc(t('Godkänn'))}</button>
            </form>
            <form method="post" action="/app/bonus/godkann">
              <input type="hidden" name="csrf" value="${attr(csrf)}"><input type="hidden" name="id" value="${attr(i.id)}"><input type="hidden" name="beslut" value="nekad">
              <button class="knapp liten tyst" type="submit">${esc(t('Neka'))}</button>
            </form>
          </span>
        </li>`).join('')}</ul>`,
    }),
  }) : '');

  if (!b) {
    return {
      titel: 'Bonus',
      innehall: `${sidhuvud({ rubrik: 'Bonus', under: 'Vad alla tjänar utöver lönen.' })}
      ${meddelande ? `<div class="ok-ruta">${esc(meddelande)}</div>` : ''}
      ${fel ? `<div class="fel-ruta">${esc(fel)}</div>` : ''}
      ${kon('Att godkänna')}
      ${tomt('Ingen bonus uträknad än', 'Kör "node bonus/kor.mjs" — eller vänta på nästa hämtning. Inrapporterade insatser går att godkänna ändå.')}`,
    };
  }

  const personer = serAlla ? b.personer : b.personer.filter((p) => p.id === mittId);
  const medPengar = personer.filter((p) => p.summa > 0);
  const vantande = vantandeNu;

  // Summering per uppdrag: vilket program som faktiskt betalar ut.
  const perUppdrag = new Map();
  for (const p of personer) {
    for (const r of p.rader) {
      const u = perUppdrag.get(r.uppdrag) ?? { uppdrag: r.uppdrag, namn: r.namn, antal: 0, summa: 0, personer: 0 };
      u.antal += r.antal;
      u.summa += r.summa;
      u.personer += 1;
      perUppdrag.set(r.uppdrag, u);
    }
  }
  const uppdragsrader = [...perUppdrag.values()].sort((a, b2) => b2.summa - a.summa);
  const maxUppdrag = Math.max(1, ...uppdragsrader.map((u) => u.summa));

  const kortRad = [
    kort({
      etikett: `Utbetalas för ${b.period?.namn ?? ''}`,
      varde: USD(personer.reduce((s, p) => s + p.summa, 0)),
      forklaring: `${tal(medPengar.length)} av ${tal(personer.length)} personer har tjänat något den här månaden.`,
    }),
    kort({
      etikett: 'Största enskilda',
      varde: medPengar[0] ? esc(medPengar[0].namn) : '–',
      forklaring: medPengar[0] ? `${USD(medPengar[0].summa)} — ${medPengar[0].rader.map((r) => r.namn).join(', ')}.` : 'Ingen har tjänat något än.',
    }),
    kort({
      etikett: 'Recensioner med namn',
      varde: tal(snapshot?.recensioner?.medNamn ?? null),
      forklaring: `Av ${tal(snapshot?.recensioner?.antal ?? null)} recensioner senaste 60 dagarna. Varje sådan är pengar till någon i teamet.`,
      status: (snapshot?.recensioner?.medNamn ?? 0) === 0 ? status('varning', 'ingen får betalt') : status('bra', 'betalas ut'),
    }),
    farGodkanna ? kort({
      etikett: 'Väntar på godkännande',
      varde: tal(vantande.length),
      forklaring: vantande.length ? 'Inrapporterade insatser som ingen godkänt än. De betalas först när du klickar.' : 'Ingenting ligger och väntar.',
      status: vantande.length ? status('varning', 'kräver ett klick') : status('bra', 'tomt'),
    }) : null,
  ].filter(Boolean).join('');

  const personrader = personer.map((p) => `<tr>
    <td>
      <span class="namn">${esc(p.namn)}${p.id === mittId ? ' · du' : ''}</span>
      <span class="bi">${esc(ROLLER[p.roll]?.namn ?? p.roll)}${p.programs?.length > 1 ? ` · ${p.programs.map((x) => x.namn).join(' + ')}` : ''}</span>
    </td>
    <td class="tal">${USD(p.summa)}</td>
    <td>${p.rader.length ? `<span class="mini">${esc(p.rader.map((r) => `${r.namn} ×${r.antal}`).join(' · '))}</span>` : '<span class="mini">inget än</span>'}</td>
  </tr>`);

  const godkannande = kon('Att godkänna');

  const otilldelat = serAlla && b.otilldelat?.length ? block({
    titel: 'Pengar ingen fick',
    under: 'Träffar som inte gick att koppla till en person. Oftast: recensionen nämner inget namn, eller så saknar personen konto.',
    innehall: panel({
      innehall: `<ul class="lista">${Object.entries(
        b.otilldelat.reduce((acc, o) => { const k = `${o.uppdrag} · ${o.orsak}`; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {}),
      ).sort((a, c) => c[1] - a[1]).slice(0, 8).map(([text, antal]) => `
        <li><span class="tid">${tal(antal)} st</span><span class="namn">${esc(text)}</span></li>`).join('')}</ul>`,
      fot: 'En recension utan namn kan ingen få betalt för. Det är själva poängen med att be kunden skriva namnet.',
    }),
  }) : '';

  const programdel = block({
    titel: 'Programmen',
    under: 'Vad som går att tjäna, och vad det kostar bolaget.',
    innehall: Object.entries(program).map(([id, p]) => `
      <div style="margin-bottom:22px">
        <h3 style="font-size:16px;margin-bottom:4px">${esc(txt(p, 'namn'))}</h3>
        <p class="under" style="margin-bottom:12px">${esc(txt(p, 'beskrivning'))}</p>
        <div class="kort-rad">${p.uppdrag.map((u) => uppdragskort(u)).join('')}</div>
      </div>`).join(''),
  });

  return {
    titel: 'Bonus',
    innehall: `${sidhuvud({
      rubrik: 'Bonus',
      under: serAlla ? 'Allt som betalas ut utöver lönen, och vad som driver det.' : 'Dina pengar utöver lönen.',
      farsk: b.raknat ? `Räknat <b>${esc(sedan(b.raknat))}</b>` : '',
    })}
    ${meddelande ? `<div class="ok-ruta">${esc(meddelande)}</div>` : ''}
    ${fel ? `<div class="fel-ruta">${esc(fel)}</div>` : ''}
    <div class="kort-rad">${kortRad}</div>
    ${godkannande}

    ${block({
      titel: serAlla ? 'Vem tjänar vad' : 'Din intjäning',
      innehall: personer.length ? panel({
        innehall: tabell([{ titel: 'Person' }, { titel: 'Intjänat', tal: true }, { titel: 'På vad' }], personrader),
        fot: `Perioden ${b.period?.fran ?? ''} – ${b.period?.till ?? ''}. Beloppen är i ${b.valuta ?? 'USD'}.`,
      }) : tomt('Ingen i registret än', 'Lägg till folk under Konton.'),
    })}

    ${uppdragsrader.length ? block({
      titel: 'Vad pengarna går till',
      under: 'Vilket uppdrag som faktiskt betalar ut — och vilket som är ett löfte ingen använder.',
      innehall: panel({
        innehall: tabell(
          [{ titel: 'Uppdrag' }, { titel: 'Gånger', tal: true }, { titel: 'Summa', tal: true }, { titel: '' }],
          uppdragsrader.map((u) => `<tr>
            <td><span class="namn">${esc(u.namn)}</span></td>
            <td class="tal">${tal(u.antal)}</td>
            <td class="tal">${USD(u.summa)}</td>
            <td style="width:130px">${stapel((u.summa / maxUppdrag) * 100)}</td>
          </tr>`),
        ),
      }),
    }) : ''}

    ${otilldelat}
    ${serAlla ? programdel : ''}`,
  };
}

// ------------------------------------------------- delarna för Min sida

/**
 * Lönen går varannan vecka, 1–15 och 16–månadens slut (Joshs önskan
 * 2026-09-24). Talen är motorns (`halvor` i utfallet) — vyn räknar aldrig om.
 * Commission räknas på hela månadens spend och har ingen egen halva: den får
 * ett eget kort i stället för en påhittad uppdelning.
 */
function halvkort(mitt, period) {
  const h = mitt?.halvor;
  if (!h) return '';
  const manad = String(period?.fran ?? '').slice(0, 7);
  const sista = String(period?.till ?? '').slice(8, 10) || '31';
  const kortet = (etikett, belopp, forklaring) => kort({ etikett, varde: USD(belopp ?? 0), forklaring });
  return [
    kortet(`${t('Löneperiod')} 1–15`, h.forsta, `${manad}-01 – ${manad}-15`),
    kortet(`${t('Löneperiod')} 16–${sista}`, h.andra, `${manad}-16 – ${manad}-${sista}`),
    h.manad > 0 ? kortet(t('Andel av spenden (hela månaden)'), h.manad, t('Räknas på hela månaden och delas inte på perioderna.')) : '',
  ].join('');
}

/** "Du har tjänat X" + dina uppdrag + dina bevis + rapporteringsknappen. */
export function minBonus({ snapshot, anvandare, person, csrf }) {
  const b = snapshot?.bonus ?? null;
  const regler = snapshot?.bonusProgram ?? null;
  const mittId = personIdFor(anvandare);
  const mitt = b?.personer?.find((p) => p.id === mittId) ?? null;
  const roller = [...new Set([anvandare.roll, ...(person?.extraRoller ?? [])])];
  const program = regler ? uppdragForRoll(regler, roller) : [];

  if (!program.length) return '';

  const perUppdrag = new Map((mitt?.rader ?? []).map((r) => [r.uppdrag, r]));
  const minaInsatser = (snapshot?.insatser ?? []).filter((i) => i.personId === mittId);

  // Veckoläget för recensionerna: "2 av 3 den här veckan" är det som får
  // någon att skicka en fråga till innan fredagen.
  const nu = new Date();
  const veckostart = new Date(nu);
  veckostart.setDate(nu.getDate() - ((nu.getDay() + 6) % 7));
  const veckansBevis = (perUppdrag.get('recension_med_namn')?.bevis ?? [])
    .filter((b) => String(b.datum ?? '') >= veckostart.toISOString().slice(0, 10));

  const rapportera = `<form method="post" action="/app/mig/rapportera" style="padding:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;align-items:end">
    <input type="hidden" name="csrf" value="${attr(csrf)}">
    <label class="falt" style="margin:0"><span>${esc(t('Vad gäller det?'))}</span>
      <select name="uppdrag" required>
        ${program.flatMap((p) => p.uppdrag).filter((u) => !u.andel).map((u) => `<option value="${attr(u.id)}">${esc(txt(u, 'namn'))}</option>`).join('')}
      </select>
    </label>
    <label class="falt" style="margin:0"><span>${esc(t('Länk eller ordernummer'))}</span><input name="referens" placeholder="https://… / #5763" required></label>
    <label class="falt" style="margin:0"><span>${esc(t('Kort beskrivning'))}</span><input name="text" placeholder="${attr(t('Kunden nämnde mig vid namn'))}"></label>
    <button class="knapp" type="submit">${esc(t('Skicka in'))}</button>
  </form>`;

  return `${block({
    titel: 'Dina pengar den här månaden',
    under: mitt && mitt.summa > 0
      ? 'Varje rad går att klicka fram beviset för. Inget betalas utan underlag.'
      : 'Du har inte tjänat något än den här månaden — uppdragen nedan visar hur du gör.',
    innehall: `<div class="kort-rad">
      ${kort({
        etikett: 'Intjänat',
        varde: USD(mitt?.summa ?? 0),
        forklaring: `${b?.period?.fran ?? ''} – ${b?.period?.till ?? ''}. ${t('Betalas ut med lönen.')}`,
        status: (mitt?.summa ?? 0) > 0 ? status('bra', 'på väg till dig') : status('neutral', 'inget än'),
      })}
      ${halvkort(mitt, b?.period)}
      ${(mitt?.rader ?? []).slice(0, 3).map((r) => kort({
        etikett: r.namn,
        varde: USD(r.summa),
        forklaring: `${tal(r.antal)} ${t(r.antal === 1 ? 'gång' : 'gånger')} ${t('den här månaden.')}`,
      })).join('')}
    </div>`,
  })}

  ${program.map((p) => block({
    titel: `${t('Så tjänar du mer')} — ${txt(p, 'namn')}`,
    under: txt(p, 'beskrivning'),
    innehall: `<div class="kort-rad">${p.uppdrag.map((u) => uppdragskort(
      u,
      perUppdrag.get(u.id),
      u.mal_per_vecka ? { antal: veckansBevis.length, mal: u.mal_per_vecka } : null,
    )).join('')}</div>`,
  })).join('')}

  ${mitt?.rader?.length ? block({
    titel: 'Dina bevis',
    under: 'Varje krona, och vad den kom ifrån.',
    innehall: panel({ innehall: bevislista(mitt.rader) }),
  }) : ''}

  ${block({
    titel: 'Hittade du något systemet missade?',
    under: 'En Trustpilot-recension som nämner dig, eller en tvist du svarat på. Skicka in den så godkänner din chef — och pengarna dyker upp här.',
    innehall: panel({
      innehall: rapportera,
      fot: 'Systemet läser Judge.me automatiskt. Trustpilot måste rapporteras in tills API-nyckeln finns på plats.',
    }),
  })}

  ${minaInsatser.length ? block({
    titel: 'Dina inrapporterade insatser',
    innehall: panel({
      innehall: `<ul class="lista">${minaInsatser.slice(0, 12).map((i) => `
        <li>
          <span class="tid">${esc(String(i.datum ?? '').slice(0, 10))}</span>
          <span><span class="namn">${esc(uppdragsnamn(program, i))}</span><span class="bi">${esc(String(i.text ?? i.referens ?? '').slice(0, 120))}</span></span>
          <span style="margin-left:auto">${i.status === 'godkand' ? status('bra', 'godkänd') : i.status === 'nekad' ? status('kritisk', 'nekad') : status('varning', 'väntar')}</span>
        </li>`).join('')}</ul>`,
    }),
  }) : ''}`;
}
