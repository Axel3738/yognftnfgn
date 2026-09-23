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

// ------------------------------------------------------------ autosvaret
//
// Kundtjänstboten (kundtjanst/autosvar.mjs) loggar varje mejl den läst:
// ENKEL besvaras, ARG får ett lugnande svar och flaggas till VA:n, SVÅR bara
// flaggas. Här visas det Axel bad om (2026-09-22): "alla cases som AI-botten
// har svarat på, där det är arga kunder, ska komma upp som en lista på
// kundtjänst-taben". Talen är oversikt.mjs:s (snapshot.autosvar), aldrig
// omräknade. Utkast ≠ skickat — en bot som bara skriver utkast är inte igång,
// och det står i klartext.

/** Butikens namn ur snapshoten — brandet i loggen är butiks-id:t (baverbutiken …). */
export function butiksnamnFor(snapshot, id) {
  const k = String(id ?? '');
  return (snapshot?.butiker ?? []).find((b) => b.id === k)?.namn
    ?? (snapshot?.kundtjanst?.brands ?? []).find((b) => b.id === k)?.namn
    ?? k;
}

/** Vad boten faktiskt gör just nu, ur loggens tal. Ren. */
export function autosvarLage(b, nu = new Date()) {
  const a = b?.antal ?? {};
  const senast = b?.senasteKorning ? new Date(b.senasteKorning).getTime() : null;
  const stilla = senast === null || nu.getTime() - senast > DAG;
  // Fel = boten kunde inte skriva i brevlådan (utkast, flagga, flytt). Utan den
  // raden ser en bot som inte FÅR skriva (Loopia nekar Railways adress, fel
  // lösenord) exakt ut som en bot som inte HADE något att skriva.
  if ((a.fel ?? 0) > 0) return { ton: 'kritisk', ord: 'kunde inte skriva i brevlådan', skarpt: (a.svar ?? 0) > 0, stilla, fel: a.fel };
  if ((a.svar ?? 0) > 0) return { ton: stilla ? 'varning' : 'bra', ord: stilla ? 'skickar svar — men stod stilla senaste dygnet' : 'skickar svar', skarpt: true, stilla, fel: 0 };
  if ((a.utkast ?? 0) > 0) return { ton: 'varning', ord: 'bara utkast — inget skickas', skarpt: false, stilla, fel: 0 };
  return { ton: 'neutral', ord: 'inget svar skrivet', skarpt: false, stilla, fel: 0 };
}

/**
 * Autosvarsblocket: ett kort per butik med läget, sedan listan över arga
 * kunder (nyast först). `bara` begränsar till vissa butiks-id:n (varumärkets
 * flik). Ingen logg ⇒ "har inte kört", aldrig noll.
 */
export function autosvarBlock(autosvar, { nu = new Date(), namnFor = (id) => id, bara = null } = {}) {
  const brands = Object.entries(autosvar?.brands ?? {}).filter(([id]) => !bara || bara.includes(id));
  const titel = 'Autosvaret';
  const under = 'Kundtjänstboten som svarar på enkla mejl själv och lugnar arga kunder. De arga hamnar här — VA:n tar över varje ärende i listan.';
  if (!brands.length) {
    const ingenAlls = !Object.keys(autosvar?.brands ?? {}).length;
    return block({ titel, under, innehall: tomt('Autosvaret har inte kört', ingenAlls ? 'Ingen logg finns — boten är inte igång för någon butik.' : 'Ingen logg finns för de här butikerna — boten är inte igång här.') });
  }
  const en = sprak() === 'en';
  const dagar = autosvar?.dagar ?? 30;
  const korten = brands.map(([id, b]) => {
    const a = b.antal ?? {};
    const lage = autosvarLage(b, nu);
    return kort({
      etikett: namnFor(id),
      varde: `${tal(a.ARG ?? 0)} <span class="mini">${esc(t('arga kunder'))}</span>`,
      text: true,
      forklaring: en
        ? `${tal(a.mejl ?? 0)} emails read in ${dagar} days · ${tal(a.svar ?? 0)} sent · ${tal(a.utkast ?? 0)} drafts · ${tal(a.tillVa ?? 0)} handed to the VA without a reply.${(a.fel ?? 0) > 0 ? ` <strong>${tal(a.fel)} write errors</strong> — see the VA list.` : ''}`
        : `${tal(a.mejl ?? 0)} mejl lästa på ${dagar} dagar · ${tal(a.svar ?? 0)} skickade · ${tal(a.utkast ?? 0)} utkast · ${tal(a.tillVa ?? 0)} till VA:n utan svar.${(a.fel ?? 0) > 0 ? ` <strong>${tal(a.fel)} skrivfel</strong> — se VA-listan.` : ''}`,
      status: status(lage.ton, lage.ord),
      fot: b.senasteKorning ? `${t('Senaste körning')} ${sedan(b.senasteKorning)}` : t('Har aldrig kört'),
    });
  }).join('');

  const arga = brands.flatMap(([id, b]) => (b.arga ?? []).map((r) => ({ ...r, butik: namnFor(id) })))
    .sort((a, b) => String(b.tid ?? '').localeCompare(String(a.tid ?? '')));
  const rader = arga.slice(0, 30).map((r) => {
    const order = r.ordernummer?.[0] ? `#${r.ordernummer[0]}` : t('order saknas i mejlet');
    const varfor = en ? (r.orsakEn || r.orsak || r.x || '—') : (r.orsak || r.orsakEn || r.x || '—');
    const svar = r.atgard === 'svar' ? status('bra', 'skickat')
      : r.atgard === 'utkast' ? status('varning', 'utkast — inte skickat')
        : r.atgard === 'fel' ? status('kritisk', 'fel')
          : status('neutral', 'inget svar');
    const va = [r.flaggad ? t('flaggad') : null, r.flyttad ? `→ ${r.flyttad}` : null].filter(Boolean).join(' · ');
    return `<tr>
      <td class="tal"><span class="mini">${esc(sedan(r.tid))}</span></td>
      <td><span class="namn">${esc(r.butik)}</span>${r.sprak ? `<span class="bi">${esc(r.sprak)}</span>` : ''}</td>
      <td><span class="namn">${esc(order)}</span>${r.amne ? `<span class="bi">${esc(r.amne)}</span>` : ''}</td>
      <td>${esc(varfor)}</td>
      <td>${svar}${va ? `<span class="bi">${esc(va)}</span>` : ''}</td>
    </tr>`;
  });

  return block({
    titel,
    under,
    innehall: `<div class="kort-rad">${korten}</div>
    ${arga.length ? panel({
      titel: 'Arga kunder',
      under: 'Nyast först. Boten har svarat lugnande — VA:n tar över ärendet och svarar kunden själv.',
      innehall: tabell(
        [{ titel: 'När' }, { titel: 'Butik' }, { titel: 'Order' }, { titel: 'Vad kunden var arg över' }, { titel: 'Botens svar' }],
        rader,
      ),
      fot: `Utkast betyder att svaret ligger i Drafts och inte har nått kunden. Skickat betyder att kunden fått det.${arga.length > 30 ? ` Visar 30 av ${arga.length}.` : ''}`,
    }) : tomt('Inga arga kunder i loggen', 'Boten har inte klassat något mejl som argt de senaste 30 dagarna.')}`,
  });
}

// ------------------------------------------------------------ kundtjänst

/**
 * Tvisterna sidan visar. Finns `snapshot.tvister` (lästa direkt ur Shopify i
 * varje timhämtning) är det de raderna — bara de som väntar på VÅRT svar;
 * `under review` är redan inskickade och går inte att röra. Annars
 * veckorapportens rader som förut. Ren.
 */
export function tvisterForSidan(snapshot, nu = new Date()) {
  const live = snapshot?.tvister ?? null;
  const k = snapshot?.kundtjanst ?? { brands: [] };
  const alla = live
    ? (snapshot?.oppnaTvister ?? [])
      .filter((tv) => tv.oppen !== false && !tv.besvarad && tv.deadline)
      .map((tv) => ({ ...tv, brand: butiksnamnFor(snapshot, tv.brand), kvar: dagarKvar(tv.deadline, nu) }))
    : (k.brands ?? []).flatMap((b) => (b.tvister ?? [])
      .filter((tv) => tv.deadline)
      .map((tv) => ({ ...tv, brand: b.namn, kvar: dagarKvar(tv.deadline, nu) })));
  const lasta = live ? live.butiker.filter((b) => b.status === 'ok' || b.status === 'saknas') : [];
  const olasta = live ? live.butiker.filter((b) => !lasta.includes(b)) : [];
  return {
    fran: live ? 'shopify' : 'veckorapport',
    hamtad: live?.hamtad ?? null,
    lasta,
    olasta,
    bradskande: alla.filter((tv) => tv.kvar !== null && tv.kvar >= 0 && tv.kvar <= 7).sort((a, b) => a.kvar - b.kvar),
    passerade: alla.filter((tv) => tv.kvar !== null && tv.kvar < 0),
  };
}

function tvistblock(tv, { nu, rapportAlder = null }) {
  const { bradskande, passerade } = tv;
  const passeratBelopp = passerade.reduce((s, x) => s + (Number(x.belopp) || 0), 0);
  const tvistrader = bradskande.slice(0, 12).map((x) => `<tr>
    <td>
      <span class="namn">${esc(ordertext(x.order))}</span>
      <span class="bi">${esc(x.brand)}${x.typ ? ` · ${esc(tvisttyp(x.typ, sprak()))}` : ''}</span>
    </td>
    <td class="tal">${pengar(x.belopp, x.valuta)}</td>
    <td class="tal">${esc(datum(x.deadline, { nu }))}</td>
    <td>${status(x.kvar <= 2 ? 'kritisk' : x.kvar <= 4 ? 'varning' : 'neutral', tidKvar(x.kvar))}</td>
  </tr>`);
  const kalla = tv.fran === 'shopify'
    ? `${t('Läst direkt ur Shopify')} ${t(sedan(tv.hamtad))}: ${tv.lasta.map((b) => b.namn).join(', ') || '–'}.${tv.olasta.length ? ` ${t('Gick inte att läsa')}: ${tv.olasta.map((b) => b.namn).join(', ')}.` : ''}`
    : t('Ur kundtjänstens veckorapport.');
  return `${block({
    titel: 'Tvister som brådskar',
    under: 'Sorterade efter hur lite tid som är kvar. Chargebacks är de som faktiskt förloras.',
    innehall: bradskande.length
      ? panel({
        innehall: tabell(
          [{ titel: 'Order' }, { titel: 'Belopp', tal: true }, { titel: 'Sista svarsdag', tal: true }, { titel: 'Tid kvar' }],
          tvistrader,
        ),
        fot: `En obesvarad förfrågan förloras inte på plats — den eskalerar till chargeback med ny deadline. Alla förluster hittills har varit chargebacks.${bradskande.length > 12 ? ` Visar 12 av ${bradskande.length}.` : ''} ${kalla}`,
      })
      : tomt('Inget brådskar just nu', `Ingen tvist som väntar på vårt svar har svarsdag inom sju dagar. ${kalla}`),
  })}

    ${passerade.length ? block({
      titel: 'Passerade svarsdagar',
      innehall: tomt(
        `${passerade.length} tvister har passerat sin svarsdag (${pengar(Math.round(passeratBelopp), passerade[0].valuta ?? 'SEK')} sammanlagt)`,
        `De går inte att svara på längre. Förfrågningar som inte besvarats eskalerar till chargeback med en NY svarsdag — de dyker upp igen i listan ovan.${rapportAlder !== null && rapportAlder > 2 ? ` Obs: rapporten är ${rapportAlder} dagar gammal, så läget kan ha ändrats.` : ''}`,
      ),
    }) : ''}`;
}

export function kundtjanstSida({ snapshot, nu = new Date() }) {
  const autosvaret = autosvarBlock(snapshot?.autosvar, { nu, namnFor: (id) => butiksnamnFor(snapshot, id) });
  const k = snapshot?.kundtjanst ?? { status: 'saknas', brands: [] };
  const tv = tvisterForSidan(snapshot, nu);
  if (k.status !== 'ok' || !k.brands.length) {
    return {
      titel: 'Kundtjänst',
      innehall: `${sidhuvud({ rubrik: 'Kundtjänst', under: 'Mejl, ärenden och tvister.' })}
      ${autosvaret}
      ${tv.fran === 'shopify' ? tvistblock(tv, { nu }) : ''}
      ${tomt('Ingen veckorapport än', k.orsak ?? 'Kundtjänstrutinen har inte kört klart en vecka.')}`,
    };
  }

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

    ${autosvaret}

    ${tvistblock(tv, { nu, rapportAlder: tv.fran === 'veckorapport' ? rapportAlder : null })}

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
