// vy/drift.mjs — Kundtjänst och Leverans. De två sidor VA:n lever i.
//
// ⚠️ Texterna i veckorapporternas åtgärdsplan skrivs om vid varje körning och
// har innehållit ett fel som rättades 2026-09-20 ("en obesvarad tvist förloras
// automatiskt" — falskt för inquiries, de ESKALERAR till chargeback). Därför
// visas planens rubrik och mätvärden, aldrig den sparade brödtexten: en
// dashboard ska inte sprida en gammal felformulering vidare.

import { esc, kort, panel, tabell, tomt, block, status, stapel, tal, pengar, t, sprak } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { sedan, datum, DAG } from '../berakna.mjs';
import { kategorinamn, tvisttyp, forklaraFel } from '../forklaring.mjs';

const RISKTON = (p) => (p >= 50 ? 'kritisk' : p >= 25 ? 'varning' : 'bra');
const RISKORD = (p) => (p >= 50 ? 'hög risk' : p >= 25 ? 'medel' : 'lugnt');

/** "#5763" är ett ordernummer. Ett 14-siffrigt id är Shopifys interna — det
 *  säger ingenting för den som ska leta upp ordern, så det märks ut. */
function ordertext(order) {
  const o = String(order ?? '').trim();
  if (!o) return 'order saknas i rapporten';
  if (o.startsWith('#')) return o;
  if (/^\d{10,}$/.test(o)) return `order-id …${o.slice(-6)}`;
  return o;
}

/** "i dag", "1 dag kvar", "5 dagar kvar" — på läsarens språk och rätt böjt. */
function tidKvar(dagar) {
  if (dagar < 0) return t('passerad');
  if (dagar === 0) return t('i dag');
  if (sprak() === 'en') return `${dagar} ${dagar === 1 ? 'day' : 'days'} left`;
  return `${dagar} ${dagar === 1 ? 'dag' : 'dagar'} kvar`;
}

function dagarKvar(deadline, nu) {
  if (!deadline) return null;
  const t = new Date(deadline).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - nu.getTime()) / DAG);
}

// ------------------------------------------------------------ kundtjänst

export function kundtjanstSida({ snapshot, nu = new Date() }) {
  const k = snapshot?.kundtjanst ?? { status: 'saknas', brands: [] };
  if (k.status !== 'ok' || !k.brands.length) {
    return {
      titel: 'Kundtjänst',
      innehall: `${sidhuvud({ rubrik: 'Kundtjänst', under: 'Mejl, ärenden och tvister.' })}
      ${tomt('Ingen veckorapport än', k.orsak ?? 'Kundtjänstrutinen har inte kört klart en vecka.')}`,
    };
  }

  // Tvister som brådskar, över alla brands — det enda som kostar pengar i dag.
  // Passerade deadlines ligger för sig: de går inte att rädda med ett svar,
  // och de ska inte tränga undan de som fortfarande går att vinna.
  const allaTvister = k.brands.flatMap((b) => b.tvister
    .filter((t) => t.deadline)
    .map((t) => ({ ...t, brand: b.namn, kvar: dagarKvar(t.deadline, nu) })));
  const bradskande = allaTvister.filter((t) => t.kvar !== null && t.kvar >= 0 && t.kvar <= 7).sort((a, b) => a.kvar - b.kvar);
  const passerade = allaTvister.filter((t) => t.kvar !== null && t.kvar < 0);
  const passeratBelopp = passerade.reduce((s, t) => s + (Number(t.belopp) || 0), 0);
  const rapportAlder = k.brands[0]?.kord ? Math.floor((nu.getTime() - new Date(k.brands[0].kord).getTime()) / DAG) : null;

  const brandkort = k.brands.map((b) => {
    const n = b.nyckeltal ?? {};
    return kort({
      etikett: b.namn,
      varde: `${tal(n.risk ?? null)}/100`,
      forklaring: sprak() === 'en'
        ? `${tal(n.obesvarade ?? null)} unanswered out of ${tal(n.arenden ?? null)} tickets in the last ${b.period?.dagar ?? 30} days.`
        : `${tal(n.obesvarade ?? null)} obesvarade av ${tal(n.arenden ?? null)} ärenden senaste ${b.period?.dagar ?? 30} dagarna.`,
      status: status(RISKTON(n.risk ?? 0), RISKORD(n.risk ?? 0)),
      serie: (b.historik ?? []).map((h) => h.obesvarade),
      fot: b.vecka ? `${t('Vecka')} ${b.vecka}` : '',
    });
  }).join('');

  const tvistrader = bradskande.slice(0, 12).map((t) => `<tr>
    <td>
      <span class="namn">${esc(ordertext(t.order))}</span>
      <span class="bi">${esc(t.brand)}${t.typ ? ` · ${esc(tvisttyp(t.typ, sprak()))}` : ''}</span>
    </td>
    <td class="tal">${pengar(t.belopp, t.valuta)}</td>
    <td class="tal">${esc(datum(t.deadline, { nu }))}</td>
    <td>${status(t.kvar <= 2 ? 'kritisk' : t.kvar <= 4 ? 'varning' : 'neutral', tidKvar(t.kvar))}</td>
  </tr>`);

  const kategorirader = k.brands.flatMap((b) => (b.kategorier ?? []).slice(0, 5).map((c) => ({ ...c, brand: b.namn, svenska: kategorinamn(c.id, c.en) })))
    .sort((a, b) => (b.antal ?? 0) - (a.antal ?? 0))
    .slice(0, 8);
  const maxKat = Math.max(1, ...kategorirader.map((c) => c.antal ?? 0));

  return {
    titel: 'Kundtjänst',
    innehall: `${sidhuvud({
      rubrik: 'Kundtjänst',
      under: 'Vad kunderna hör av sig om, och vad som brådskar.',
      farsk: k.brands[0]?.kord ? `${esc(t('Rapport körd'))} <b>${esc(t(sedan(k.brands[0].kord)))}</b>` : '',
    })}
    <div class="kort-rad">${brandkort}</div>

    ${block({
      titel: 'Tvister som brådskar',
      under: 'Sorterade efter hur lite tid som är kvar. Chargebacks är de som faktiskt förloras.',
      innehall: bradskande.length
        ? panel({
          innehall: tabell(
            [{ titel: 'Order' }, { titel: 'Belopp', tal: true }, { titel: 'Sista svarsdag', tal: true }, { titel: 'Tid kvar' }],
            tvistrader,
          ),
          fot: `En obesvarad förfrågan förloras inte på plats — den eskalerar till chargeback med ny deadline. Alla förluster hittills har varit chargebacks.${bradskande.length > 12 ? ` Visar 12 av ${bradskande.length}.` : ''}`,
        })
        : tomt('Inget brådskar just nu', 'Ingen tvist har svarsdag inom sju dagar.'),
    })}

    ${passerade.length ? block({
      titel: 'Passerade svarsdagar',
      innehall: tomt(
        `${passerade.length} tvister har passerat sin svarsdag (${pengar(Math.round(passeratBelopp), passerade[0].valuta ?? 'SEK')} sammanlagt)`,
        `De går inte att svara på längre. Förfrågningar som inte besvarats eskalerar till chargeback med en NY svarsdag — de dyker upp igen i listan ovan.${rapportAlder !== null && rapportAlder > 2 ? ` Obs: rapporten är ${rapportAlder} dagar gammal, så läget kan ha ändrats.` : ''}`,
      ),
    }) : ''}

    ${block({
      titel: 'Vad kunderna frågar om',
      under: 'Störst högar först. En hög som växer är något att fixa i butiken, inte bara i inkorgen.',
      innehall: kategorirader.length
        ? panel({
          innehall: tabell(
            [{ titel: 'Ärende' }, { titel: 'Brand' }, { titel: 'Antal', tal: true }, { titel: '' }, { titel: 'Obesvarade', tal: true }, { titel: 'Rutin finns' }],
            kategorirader.map((c) => `<tr>
              <td><span class="namn">${esc(c.svenska)}</span></td>
              <td><span class="mini">${esc(c.brand)}</span></td>
              <td class="tal">${tal(c.antal)}</td>
              <td style="width:110px">${stapel(((c.antal ?? 0) / maxKat) * 100)}</td>
              <td class="tal">${tal(c.obesvarade)}</td>
              <td>${c.sop === 'covered' ? status('bra', 'ja') : status('varning', 'saknas')}</td>
            </tr>`),
          ),
        })
        : tomt('Inga kategorier', 'Veckorapporten innehöll inga ärendekategorier.'),
    })}

    ${block({
      titel: 'Att göra den här veckan',
      under: 'Ur veckorapporten, i ordning. Listan är VA:ns och står på engelska — det är hennes arbetsspråk.',
      innehall: panel({
        innehall: `<ul class="lista">${k.brands.flatMap((b) => (b.plan ?? []).slice(0, 4).map((p) => `
          <li>
            <span class="tid">${esc(p.hink === 'nu' ? 'NU' : p.hink === 'vecka' ? 'Veckan' : 'Senare')}</span>
            <span>
              <span class="namn">${esc(p.titel)}</span>
              <span class="bi">${esc(b.namn)}${p.matt?.belopp ? ` · ${pengar(Math.round(p.matt.belopp), p.matt.valuta ?? 'SEK')} ${t('i potten')}` : ''}${p.agare ? ` · ${esc(p.agare)}` : ''}</span>
            </span>
          </li>`)).join('')}</ul>`,
      }),
    })}`,
  };
}

// --------------------------------------------------------------- leverans

export function leveransSida({ snapshot }) {
  const l = snapshot?.leverans ?? { status: 'saknas', butiker: [] };
  const ok = (l.butiker ?? []).filter((b) => b.status === 'ok');

  if (!ok.length) {
    return {
      titel: 'Leverans',
      innehall: `${sidhuvud({ rubrik: 'Leverans', under: 'Paket på väg till kund.' })}
      ${tomt('Ingen spårningsdata än', l.orsak ?? 'Spårningsrutinen har inte kört för någon butik.')}`,
    };
  }

  const totalt = ok.reduce((s, b) => s + b.paket, 0);
  const paVag = ok.reduce((s, b) => s + b.paVag, 0);
  const levererade = ok.reduce((s, b) => s + b.levererade, 0);
  const utan = ok.reduce((s, b) => s + b.utanSkanning, 0);
  const senaste = ok.map((b) => b.senasteKorning).filter(Boolean).sort().pop();

  return {
    titel: 'Leverans',
    innehall: `${sidhuvud({
      rubrik: 'Leverans',
      under: 'Paketen vi följer åt kunderna, butik för butik.',
      farsk: senaste ? `${esc(t('Senaste rundan'))} <b>${esc(t(sedan(senaste)))}</b>` : '',
    })}
    <div class="kort-rad">
      ${kort({
        etikett: 'Paket vi följer',
        varde: tal(totalt),
        forklaring: sprak() === 'en'
          ? `Across ${ok.length} stores. Every parcel gets its scan written into Shopify every hour.`
          : `I ${ok.length} butiker. Varje paket får sin skanning inskriven i Shopify varje timme.`,
      })}
      ${kort({ etikett: 'På väg', varde: tal(paVag), forklaring: 'Paket som rör sig men inte är framme än.' })}
      ${kort({ etikett: 'Framme', varde: tal(levererade), forklaring: 'Levererade paket. De slutar följas automatiskt.' })}
      ${kort({
        etikett: 'Utan skanning',
        varde: tal(utan),
        forklaring: 'Registrerade men fraktbolaget har inte skannat dem än. Är talet stort och stiger — kolla att kvoten hos 17TRACK räcker.',
        status: status(utan > totalt * 0.3 ? 'varning' : 'neutral', utan > totalt * 0.3 ? 'kolla kvoten' : 'normalt'),
      })}
    </div>

    ${block({
      titel: 'Per butik',
      innehall: panel({
        innehall: tabell(
          [{ titel: 'Butik' }, { titel: 'Paket', tal: true }, { titel: 'På väg', tal: true }, { titel: 'Framme', tal: true }, { titel: 'Utan skanning', tal: true }, { titel: 'Senaste rundan', tal: true }],
          ok.map((b) => `<tr>
            <td><span class="namn">${esc(b.namn)}</span>${b.url ? `<span class="bi">${esc(String(b.url).replace(/^https?:\/\//, ''))}/pages/spara</span>` : ''}</td>
            <td class="tal">${tal(b.paket)}</td>
            <td class="tal">${tal(b.paVag)}</td>
            <td class="tal">${tal(b.levererade)}</td>
            <td class="tal">${tal(b.utanSkanning)}</td>
            <td class="tal"><span class="mini">${b.senasteKorning ? esc(sedan(b.senasteKorning)) : '–'}</span></td>
          </tr>`),
        ),
        fot: 'Kunden ser samma data på butikens egen spårningssida — med ort och tid, utan land och utan ordernummer.',
      }),
    })}

    ${(l.butiker ?? []).some((b) => b.status !== 'ok') ? block({
      titel: 'Butiker utan spårning',
      innehall: panel({
        innehall: `<ul class="lista">${(l.butiker ?? []).filter((b) => b.status !== 'ok').map((b) => `
          <li><span>${status('varning', 'ingen data')}</span><span><span class="namn">${esc(b.namn)}</span><span class="bi">${esc(b.orsak ?? '')}</span></span></li>`).join('')}</ul>`,
      }),
    }) : ''}`,
  };
}
