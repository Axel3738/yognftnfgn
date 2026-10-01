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
//
// Och en fjärde sedan 2026-09-28 (Axels beslut): PENGARNA VISAS SOM DE BETALAS
// UT, aldrig som en klumpsumma. Tre utbetalningar med tre takter — produkttest
// varannan vecka (1–15 betalas den 15:e, 16–sista betalas sista dagen i
// månaden), bonusen en gång i månaden, commission för sig. Talen är motorns
// (`utbetalningar` på varje person i utfallet); vyn räknar aldrig om dem.

import { esc, attr, kort, panel, tabell, tomt, block, status, stapel, tal, t, sprak } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { sedan } from '../berakna.mjs';
import { harRatt, personIdFor, ROLLER } from '../roller.mjs';
import { uppdragForRoll, utbetalningarFor, utbetalningFor, utbetalningsdefinitioner, halvmanader } from '../../bonus/motor.mjs';

const MANADSNAMN = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

/** "september 2026" på läsarens språk. */
export function manadsnamn(manad) {
  const [ar, m] = String(manad ?? '').split('-').map(Number);
  if (!ar || !m) return String(manad ?? '');
  return `${t(MANADSNAMN[m - 1])} ${ar}`;
}

/**
 * Månadsväljaren. Förra månadens pengar betalas ut i början av den nya, och
 * då står sidan redan på den nya månaden (Axel 2026-10-01: "ska precis skicka
 * bonus för förra månaden men det kan inte välja datum"). Månaderna är de som
 * har ett sparat kvitto i bonus/utfall/ plus den som räknas just nu.
 */
function manadsval(manader, vald) {
  if (manader.length < 2) return '';
  return `<nav class="flikar" aria-label="${attr(t('Månad'))}">${manader.map((m) => `
    <a class="flik" href="${attr(`/app/bonus?manad=${m}`)}"${m === vald ? ' aria-current="page"' : ''}>${esc(manadsnamn(m))}</a>`).join('')}</nav>`;
}

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

// ------------------------------------------------------- utbetalningarna

/** Betaltexten för en utbetalning (eller en halva av den) på läsarens språk. */
function betalasText(def, halva = null) {
  const valj = (v) => (v && typeof v === 'object' ? v[halva] : v) ?? '';
  return (sprak() === 'en' ? valj(def?.en?.betalas) : '') || valj(def?.betalas) || '';
}

/**
 * Utbetalningarna som DELAR — det som landar på ett konto en viss dag.
 * Produkttest blir två (1–15 och 16–sista, var sin betaldag), bonus och
 * commission en var. Ordningen är reglernas. `nyckel` är fältet i personens
 * `utbetalningar[id]` som bär beloppet.
 */
export function utbetalningsdelar(regler, period) {
  const h = halvmanader(period);
  const sista = String(period?.till ?? '').slice(8, 10).replace(/^0/, '');
  const delar = [];
  for (const [id, def] of Object.entries(utbetalningsdefinitioner(regler))) {
    const namn = txt(def, 'namn') || id;
    if (def.takt === 'halvmanad') {
      delar.push({ id, nyckel: 'forsta', etikett: `${namn} 1–15`, betalas: betalasText(def, 'forsta'), fran: h?.forsta.fran ?? null, till: h?.forsta.till ?? null, betaldag: h?.forsta.betalas ?? null });
      delar.push({ id, nyckel: 'andra', etikett: `${namn} 16–${sista || t('slut')}`, betalas: betalasText(def, 'andra'), fran: h?.andra.fran ?? null, till: h?.andra.till ?? null, betaldag: h?.andra.betalas ?? null });
    } else {
      delar.push({ id, nyckel: 'summa', etikett: namn, betalas: betalasText(def), fran: period?.fran ?? null, till: period?.till ?? null, betaldag: null });
    }
  }
  return delar;
}

/**
 * Personens belopp i en del. Talen är motorns; saknas posten (en snapshot
 * från före bygget) räknas den fram ur raderna med motorns egen funktion.
 */
function beloppI(person, regler, del) {
  if (!person) return 0;
  const u = person.utbetalningar ?? utbetalningarFor(person, regler);
  return Number(u?.[del.id]?.[del.nyckel]) || 0;
}

/** "2026-09-01 – 2026-09-15" — perioden en del täcker. ISO, så den läses lika på båda språken. */
function periodText(del) {
  return del.fran && del.till ? `${del.fran} – ${del.till}` : '';
}

/** Radens uppdrag som gav pengar i just den här delen: "Färdig produkt ×16". */
function paVad(person, regler, del) {
  return (person.rader ?? [])
    .filter((r) => (r.utbetalning ?? utbetalningFor(regler, r.uppdrag)) === del.id)
    .filter((r) => del.nyckel === 'summa' || (Number(r.halvor?.[del.nyckel]) || 0) > 0)
    .map((r) => {
      const n = del.nyckel === 'summa' ? r.antal : r.halvorAntal?.[del.nyckel];
      return n ? `${r.namn} ×${tal(n)}` : r.namn;
    })
    .join(' · ');
}

// ------------------------------------------------------------- Bonus-sidan

export function bonusSida({ snapshot, anvandare, csrf, meddelande = '', fel = '', manad = null, kvitto = null, manader = [] }) {
  // Månaden som räknas just nu ligger i snapshoten; en gången månad läses ur
  // sitt sparade kvitto (bonus/utfall/<manad>.json, skrivet av varje hämtning
  // och fryst när månaden är slut). Vyn räknar aldrig om något.
  const aktuell = snapshot?.bonus ?? null;
  const vald = /^\d{4}-\d{2}$/.test(String(manad ?? '')) ? manad : (aktuell?.period?.namn ?? null);
  const arkiv = Boolean(vald && aktuell?.period?.namn && vald !== aktuell.period.namn);
  const b = arkiv ? (kvitto?.period?.namn === vald ? kvitto : null) : aktuell;
  const allaManader = [...new Set([aktuell?.period?.namn, ...manader].filter(Boolean))].sort().reverse();
  const val = manadsval(allaManader, vald);
  const regler = snapshot?.bonusProgram ?? null;
  const program = regler?.program ?? {};
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
      ${val}
      ${meddelande ? `<div class="ok-ruta">${esc(meddelande)}</div>` : ''}
      ${fel ? `<div class="fel-ruta">${esc(fel)}</div>` : ''}
      ${kon('Att godkänna')}
      ${arkiv
        ? tomt(`${t('Inget kvitto sparat för')} ${manadsnamn(vald)}`, 'Kvittot skrivs av hämtningen varje timme och fryses när månaden är slut. En månad utan kvitto räknades aldrig.')
        : tomt('Ingen bonus uträknad än', 'Kör "node bonus/kor.mjs" — eller vänta på nästa hämtning. Inrapporterade insatser går att godkänna ändå.')}`,
    };
  }

  const personer = serAlla ? b.personer : b.personer.filter((p) => p.id === mittId);
  const vantande = vantandeNu;

  // Utbetalningarna: en del per betaldag, summerad över laget. Den som inte
  // tjänat något i en del står inte med i den.
  const delar = utbetalningsdelar(regler, b.period).map((d) => {
    const rader = personer
      .map((p) => ({ p, belopp: beloppI(p, regler, d) }))
      .filter((x) => x.belopp > 0)
      .sort((x, y) => y.belopp - x.belopp);
    return { ...d, rader, summa: Math.round(rader.reduce((s, x) => s + x.belopp, 0) * 100) / 100 };
  });
  const antalText = (n) => `${tal(n)} ${t(n === 1 ? 'person' : 'personer')}`;

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
    ...delar.map((d) => kort({
      etikett: d.etikett,
      varde: USD(d.summa),
      forklaring: `${d.betalas} ${antalText(d.rader.length)}.`,
    })),
    arkiv ? null : kort({
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

  const godkannande = kon('Att godkänna');

  // En tabell per utbetalning — det Axel tittar på när det är dags att betala.
  const utbetalningsdel = block({
    titel: 'Utbetalningarna',
    under: 'Vem som får vad, och när. Produkttest varannan vecka, bonusen en gång i månaden och commission för sig — de blandas aldrig i en summa.',
    innehall: `<div style="display:grid;gap:14px">${delar.map((d) => panel({
      titel: d.etikett,
      under: [d.betalas, periodText(d)].filter(Boolean).join(' '),
      innehall: d.rader.length ? tabell(
        [{ titel: 'Person' }, { titel: 'Belopp', tal: true }, { titel: 'På vad' }],
        d.rader.map(({ p, belopp }) => `<tr>
          <td>
            <span class="namn">${esc(p.namn)}${p.id === mittId ? ' · du' : ''}</span>
            <span class="bi">${esc(t(ROLLER[p.roll]?.namn ?? p.roll))}</span>
          </td>
          <td class="tal">${USD(belopp)}</td>
          <td><span class="mini">${esc(paVad(p, regler, d))}</span></td>
        </tr>`),
      ) : tomt('Ingen har tjänat något här än.'),
      fot: d.rader.length ? `${t('Summa')}: ${USD(d.summa)} · ${antalText(d.rader.length)}` : '',
    })).join('')}</div>`,
  });

  const otilldelat = serAlla && b.otilldelat?.length ? block({
    titel: 'Pengar ingen fick',
    under: 'Träffar som inte gick att koppla till en person. Oftast: recensionen nämner inget namn, eller så saknar personen konto.',
    innehall: panel({
      innehall: `<ul class="lista">${Object.entries(
        b.otilldelat.reduce((acc, o) => { const k = `${o.uppdrag} · ${o.orsak}`; acc[k] = (acc[k] ?? 0) + (Number(o.antal) || 1); return acc; }, {}),
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
      under: serAlla ? 'Vad som betalas ut, till vem och när — och vad som driver det.' : 'Dina pengar utöver lönen.',
      farsk: arkiv
        ? `${esc(t('Kvitto för'))} <b>${esc(manadsnamn(vald))}</b>${b.raknat ? ` · ${esc(t('räknat'))} ${esc(String(b.raknat).slice(0, 10))}` : ''}`
        : (b.raknat ? `Räknat <b>${esc(sedan(b.raknat))}</b>` : ''),
    })}
    ${val}
    ${meddelande ? `<div class="ok-ruta">${esc(meddelande)}</div>` : ''}
    ${fel ? `<div class="fel-ruta">${esc(fel)}</div>` : ''}
    <div class="kort-rad">${kortRad}</div>
    ${godkannande}
    ${utbetalningsdel}

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
        fot: `Perioden ${b.period?.fran ?? ''} – ${b.period?.till ?? ''}. Beloppen är i ${b.valuta ?? 'USD'}.`,
      }),
    }) : ''}

    ${otilldelat}
    ${serAlla ? programdel : ''}`,
  };
}

// ------------------------------------------------- delarna för Min sida

/** "Dina utbetalningar" + dina uppdrag + dina bevis + rapporteringsknappen. */
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

  // Utbetalningarna som gäller MIG: de mina program pekar på, i reglernas
  // ordning. En produkttestare ser 1–15 och 16–sista med var sin betaldag, en
  // VA ser bonusen per månad, en redigerare commission för sig — och den som
  // bär två roller ser båda. Ett kort visas även på noll: då vet man vad som
  // kommer, och när.
  const mina = new Set(program.map((p) => p.utbetalning ?? 'bonus'));
  const delar = utbetalningsdelar(regler, b?.period).filter((d) => mina.has(d.id));
  const utbetalningskort = delar.map((d) => {
    const belopp = beloppI(mitt, regler, d);
    return kort({
      etikett: d.etikett,
      varde: USD(belopp),
      forklaring: [d.betalas, periodText(d)].filter(Boolean).join(' '),
      status: belopp > 0 ? status('bra', 'på väg till dig') : status('neutral', 'inget än'),
    });
  }).join('');

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
    titel: 'Dina utbetalningar',
    under: mitt && mitt.summa > 0
      ? 'Varje krona pekar på ett bevis. Inget betalas utan underlag.'
      : 'Du har inte tjänat något än den här månaden — uppdragen nedan visar hur du gör.',
    innehall: `<div class="kort-rad">${utbetalningskort}</div>`,
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
