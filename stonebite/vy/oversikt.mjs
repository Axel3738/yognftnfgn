// vy/oversikt.mjs — förstasidan efter inloggning: hela bolaget på en skärm.
//
// Ordningen är medveten: det som avgör dagen står först, maskineriets läge
// sist. EN hjältesiffra (dagens försäljning), sedan fyra kort, sedan
// butikerna, annonserna och driften.
//
// Varje kort bär en mening på svenska som förklarar talet. Den som läser ska
// inte behöva veta vad ROAS eller CPA betyder för att förstå om dagen är bra.
//
// ⚠️ Tre fällor som är medvetet undvikna här:
//
//   1. DAGEN MOT GÅRDAGEN I PROCENT. Klockan tio är dagen en tredjedel gången
//      och gårdagen hel — en sådan jämförelse visar −70 % varje förmiddag och
//      betyder ingenting. Procenttalen räknas därför bara på HELA dygn
//      (7 dagar mot veckan innan). Dagens tal står med gårdagens totala
//      summa bredvid sig, som text.
//   2. FÖRSÄLJNING MINUS REKLAM NÄR EN BUTIK INTE GÅR ATT LÄSA. Reklamen
//      läses ur Meta och syns alltid; försäljningen läses per butik. Saknas
//      en enda butik blir skillnaden negativ av fel skäl. Då visas ingen
//      sådan siffra alls — bara varför.
//   3. ROAS UR VÅR EGEN DIVISION. ROAS hämtas ur Meta, som mäter köpen mot
//      annonsen. Att dela butikernas omsättning med spenden ger ett annat
//      (och falskt) tal så fort en butik saknas eller säljer utan annonser.

import { esc, hjalte, kort, panel, tabell, tomt, block, spark, status, tal, pengar } from './delar.mjs';
import { sidhuvud, fornamn } from './layout.mjs';
import { oversikt as raknaOversikt, allaKampanjer, kallolage, produktlista } from '../data.mjs';
import { forandring, sedan } from '../berakna.mjs';
import { harRatt } from '../roller.mjs';
import { forklaraFel, kallnamn, kortMotivering, atgardsnamn } from '../forklaring.mjs';

const HUVUDVALUTA = 'SEK';

function halsning(nu) {
  const t = Number(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: 'numeric', hour12: false }).format(nu));
  if (t < 5) return 'God natt';
  if (t < 10) return 'God morgon';
  if (t < 13) return 'God förmiddag';
  if (t < 18) return 'God eftermiddag';
  return 'God kväll';
}

function farskhet(byggd) {
  if (!byggd) return '<b>Ingen data hämtad än</b>';
  const gammal = Date.now() - new Date(byggd).getTime() > 6 * 3600_000;
  return `${gammal ? '⚠️ ' : ''}Hämtat <b>${esc(sedan(byggd))}</b>`;
}

/** ROAS för alla konton i en valuta, vägd med spenden. Metas egna tal. */
function vagdRoas(konton, valuta, period = 'vecka') {
  const rader = konton.filter((k) => k.valuta === valuta && k[period]?.roas);
  const spend = rader.reduce((s, k) => s + k[period].spend, 0);
  if (!spend) return null;
  return rader.reduce((s, k) => s + k[period].spend * k[period].roas, 0) / spend;
}

function butiksrad(b) {
  const j = forandring(b.vecka.omsattning, b.forraVeckan.omsattning);
  return `<tr>
    <td>
      <span class="namn">${esc(b.namn)}</span>
      <span class="bi">${esc(b.land || '')}${b.valuta ? ` · ${esc(b.valuta)}` : ''}</span>
    </td>
    <td class="tal">${b.idag ? pengar(b.idag.omsattning, b.valuta) : '–'}</td>
    <td class="tal">${pengar(b.vecka.omsattning, b.valuta)}</td>
    <td class="tal">${tal(b.vecka.ordrar)}</td>
    <td class="tal">${j ? `<span class="delta ${j.riktning === 'upp' ? 'upp' : j.riktning === 'ner' ? 'ner' : ''}">${j.riktning === 'upp' ? '↑' : j.riktning === 'ner' ? '↓' : '→'} ${esc(j.text)}</span>` : '–'}</td>
    <td style="width:130px">${spark(b.serie, { titel: `${b.namn} 30 dagar` }) || ''}</td>
  </tr>`;
}

function kampanjrad(k) {
  const bidrag = k.vinstbidrag === null ? null : Math.round(k.vinstbidrag);
  const ton = bidrag === null ? 'neutral' : bidrag > 0 ? 'bra' : 'kritisk';
  const ord = bidrag === null ? 'ingen break-even' : bidrag > 0 ? 'tjänar pengar' : 'går back';
  return `<tr>
    <td>
      <span class="namn">${esc(k.namn)}</span>
      <span class="bi">${esc(k.konto)}${k.breakEvenRoas ? ` · break-even ${k.breakEvenRoas.toLocaleString('sv-SE', { maximumFractionDigits: 2 })}` : ''}</span>
    </td>
    <td class="tal">${pengar(Math.round(k.spend), k.valuta)}</td>
    <td class="tal">${tal(k.kop)}</td>
    <td class="tal">${k.roas ? k.roas.toLocaleString('sv-SE', { maximumFractionDigits: 2 }) : '–'}</td>
    <td class="tal">${bidrag === null ? '–' : pengar(bidrag, k.valuta)}</td>
    <td>${status(ton, ord)}</td>
  </tr>`;
}

export function oversiktSida({ snapshot, anvandare, nu = new Date() }) {
  const o = raknaOversikt(snapshot, { nu });
  const halsa = kallolage(snapshot);
  const serRatt = harRatt(anvandare, 'pengar');
  const serSpend = harRatt(anvandare, 'spend');

  const huvud = o.rader.find((r) => r.valuta === HUVUDVALUTA) ?? o.rader[0] ?? null;
  const ovriga = o.rader.filter((r) => r !== huvud);
  const lasbara = o.butiker.filter((b) => b.status === 'ok');
  const olasbara = o.olasbara;
  const spend = huvud?.spend ?? null;
  const roas7 = serSpend ? vagdRoas(o.konton, HUVUDVALUTA, 'vecka') : null;

  // ------------------------------------------------------------ hjälten
  const veckoJamfor = huvud ? forandring(huvud.vecka.omsattning, huvud.forraVeckan?.omsattning ?? null) : null;
  const hjaltedel = huvud && huvud.idag
    ? hjalte({
      etikett: `Sålt i dag · ${huvud.valuta}`,
      varde: pengar(Math.round(huvud.idag.omsattning), huvud.valuta),
      forklaring: `${tal(huvud.idag.ordrar)} ordrar hittills i dag, i ${tal(huvud.butiker)} ${huvud.butiker === 1 ? 'butik' : 'butiker'} som säljer i ${huvud.valuta}. Hela gårdagen: ${pengar(Math.round(huvud.igar?.omsattning ?? 0), huvud.valuta)}.${olasbara.length ? ` Gäller bara de butiker vi kommer åt — ${tal(olasbara.length)} saknas.` : ''}`,
      serie: huvud.serie,
      sida: veckoJamfor ? `<p class="mini" style="text-align:right;margin-top:10px">7 dagar: ${esc(pengar(Math.round(huvud.vecka.omsattning), huvud.valuta))} · ${esc(veckoJamfor.text)} mot veckan innan</p>` : '',
    })
    : `<div class="hjalte"><div>
        <div class="etikett">Sålt i dag</div>
        <div class="varde">–</div>
        <p class="forklaring">Ingen försäljning gick att läsa.${olasbara.length ? ` ${esc(String(olasbara.length))} butiker svarade inte — se längst ned.` : ' Kör hämtningen igen.'}</p>
      </div></div>`;

  // -------------------------------------------------------------- korten
  // "Kvar efter annonser" beräknas BARA när alla butiker gick att läsa.
  // Annars jämförs hela reklamkostnaden med en del av försäljningen.
  const kvarGarAttRakna = serRatt && spend && huvud?.idag && olasbara.length === 0;
  const korten = [
    kort({
      etikett: 'Ordrar i dag',
      varde: huvud?.idag ? tal(huvud.idag.ordrar) : '–',
      forklaring: huvud?.igar ? `Hela gårdagen blev det ${tal(huvud.igar.ordrar)} stycken.` : 'Ingen jämförelse att göra än.',
      fot: huvud ? `7 dagar: ${tal(huvud.vecka.ordrar)} ordrar` : '',
    }),
    serSpend ? kort({
      etikett: 'Reklam i dag',
      varde: spend ? pengar(Math.round(spend.idag), HUVUDVALUTA) : '–',
      forklaring: spend ? `Så mycket har vi lagt på annonser hittills i dag. Hela gårdagen: ${pengar(Math.round(spend.igar), HUVUDVALUTA)}.` : 'Meta gick inte att läsa.',
      serie: spend?.serie,
    }) : null,
    serSpend ? kort({
      etikett: 'ROAS 7 dagar',
      varde: roas7 ? roas7.toLocaleString('sv-SE', { maximumFractionDigits: 2 }) : '–',
      forklaring: 'Metas eget mått: så många kronor in för varje krona vi lägger på reklam. 2,00 = dubbla pengarna tillbaka.',
      status: roas7 ? status(roas7 >= 2 ? 'bra' : roas7 >= 1.5 ? 'varning' : 'kritisk', roas7 >= 2 ? 'stabilt' : roas7 >= 1.5 ? 'tunt' : 'lågt') : null,
      fot: spend ? `${pengar(Math.round(spend.vecka), HUVUDVALUTA)} reklam · ${tal(spend.kop7)} köp` : '',
    }) : null,
    kvarGarAttRakna ? kort({
      etikett: 'Kvar efter reklam i dag',
      varde: pengar(Math.round(huvud.kvarIdag), HUVUDVALUTA),
      forklaring: 'Försäljning minus reklam i dag. Detta är INTE vinst — varor, frakt och avgifter är inte avdragna.',
      status: status(huvud.kvarIdag >= 0 ? 'bra' : 'kritisk', huvud.kvarIdag >= 0 ? 'plus' : 'minus'),
    }) : (serRatt ? kort({
      etikett: 'Kvar efter reklam',
      text: true,
      varde: 'Går inte att räkna',
      forklaring: `Reklamen syns för alla konton, men ${tal(olasbara.length)} ${olasbara.length === 1 ? 'butik' : 'butiker'} går inte att läsa just nu. Då skulle siffran bli fel åt minus-hållet.`,
      status: status('varning', 'väntar på butikerna'),
    }) : null),
  ].filter(Boolean).join('');

  // ------------------------------------------------------- andra valutor
  const valutadel = ovriga.length ? block({
    titel: 'Butiker i andra valutor',
    under: 'Kronor, norska kronor, danska kronor och euro räknas aldrig ihop — de står var för sig.',
    innehall: panel({
      innehall: tabell(
        [{ titel: 'Valuta' }, { titel: 'Butiker', tal: true }, { titel: 'I dag', tal: true }, { titel: '7 dagar', tal: true }, { titel: 'Ordrar 7 d', tal: true }],
        ovriga.map((r) => `<tr>
          <td><span class="namn">${esc(r.valuta)}</span></td>
          <td class="tal">${tal(r.butiker)}</td>
          <td class="tal">${r.idag ? pengar(Math.round(r.idag.omsattning), r.valuta) : '–'}</td>
          <td class="tal">${pengar(Math.round(r.vecka.omsattning), r.valuta)}</td>
          <td class="tal">${tal(r.vecka.ordrar)}</td>
        </tr>`),
      ),
    }),
  }) : '';

  // ------------------------------------------------------------ butiker
  const butiksdel = block({
    titel: 'Butikerna',
    under: 'Sju hela dygn mot veckan innan. Kurvan är 30 dagar.',
    innehall: lasbara.length
      ? panel({
        innehall: tabell(
          [{ titel: 'Butik' }, { titel: 'I dag', tal: true }, { titel: '7 dagar', tal: true }, { titel: 'Ordrar', tal: true }, { titel: 'Mot förra veckan', tal: true }, { titel: '30 dagar' }],
          lasbara.sort((a, b) => b.vecka.omsattning - a.vecka.omsattning).map(butiksrad),
        ),
        fot: `${lasbara.length} butiker lästes.`,
      })
      : tomt('Inga butiker lästes', 'Kör hämtningen igen, eller kolla Shopify-nycklarna.'),
  });

  const stangdaDorrar = olasbara.length ? block({
    titel: 'Butiker vi inte kommer åt',
    under: 'De säljer förmodligen som vanligt — vi får bara inte ut siffrorna. Det här är vad som behöver fixas.',
    innehall: panel({
      innehall: `<ul class="lista">${olasbara.map((b) => {
        const f = forklaraFel(b.orsak);
        return `<li>
          <span>${status('varning', 'stängd dörr')}</span>
          <span>
            <span class="namn">${esc(b.namn)}</span>
            <span class="bi">${esc(f.text)}${f.atgard ? ` — ${esc(f.atgard)}` : ''}</span>
          </span>
        </li>`;
      }).join('')}</ul>`,
    }),
  }) : '';

  // ----------------------------------------------------------- annonser
  const kampanjer = serSpend ? allaKampanjer(snapshot, produktlista(snapshot)).slice(0, 6) : [];
  const annonsdel = serSpend ? block({
    titel: 'Bäst vinstbidrag, 7 dagar',
    under: 'Rangordnat på hur mycket pengar kampanjen lämnar efter break-even — aldrig på ROAS ensamt.',
    innehall: kampanjer.length
      ? panel({
        innehall: tabell(
          [{ titel: 'Kampanj' }, { titel: 'Reklam', tal: true }, { titel: 'Köp', tal: true }, { titel: 'ROAS', tal: true }, { titel: 'Vinstbidrag', tal: true }, { titel: 'Läge' }],
          kampanjer.map(kampanjrad),
        ),
        fot: 'Vinstbidrag = reklamkostnad × (ROAS ÷ break-even − 1). Break-even står i kampanjnamnet.',
      })
      : tomt('Inga kampanjer lästes', 'Meta svarade inte, eller så har inget konto spenderat de senaste sju dagarna.'),
  }) : '';

  // --------------------------------------------------------- nattvakten
  const beslut = (snapshot?.budgetlogg?.beslut ?? []).slice(0, 6);
  const nattdel = serSpend && beslut.length ? block({
    titel: 'Vad maskinen gjorde senast',
    under: 'Nattvakten höjer, sänker och stänger av själv varje natt. Här är de senaste besluten.',
    innehall: panel({
      innehall: `<ul class="lista">${beslut.map((b) => `
        <li>
          <span class="tid">${esc(b.datum)}</span>
          <span>
            <span class="namn">${esc(atgardsnamn(b.atgard))} · ${esc(b.namn ?? '')}</span>
            <span class="bi">${esc(kortMotivering(b.motivering))}</span>
          </span>
        </li>`).join('')}</ul>`,
    }),
  }) : '';

  // -------------------------------------------------------------- drift
  const problem = halsa.kallor.filter((k) => k.status === 'fel' || k.status === 'saknas');
  const driftdel = block({
    titel: 'Drift',
    under: 'Var siffrorna kommer ifrån, och vad som inte gick att läsa.',
    innehall: panel({
      innehall: `<ul class="lista">${halsa.kallor.map((k) => {
        const f = k.orsak ? forklaraFel(k.orsak) : null;
        return `<li>
          <span aria-hidden="true">${k.ikon}</span>
          <span><span class="namn">${esc(kallnamn(k.id))}</span>${f ? `<span class="bi">${esc(f.text)}${f.atgard ? ` — ${esc(f.atgard)}` : ''}</span>` : ''}</span>
          <span class="tid" style="margin-left:auto">${esc(sedan(k.tid))}</span>
        </li>`;
      }).join('')}</ul>`,
      fot: problem.length ? `${problem.length} ${problem.length === 1 ? 'källa' : 'källor'} behöver ses över.` : 'Alla källor svarade.',
    }),
  });

  return {
    titel: 'Översikt',
    innehall: `${sidhuvud({
      rubrik: `${halsning(nu)}, ${fornamn(anvandare.namn)}.`,
      under: 'Så här går bolaget just nu.',
      farsk: farskhet(halsa.byggd),
    })}
    ${hjaltedel}
    <div class="kort-rad">${korten}</div>
    ${valutadel}
    ${butiksdel}
    ${annonsdel}
    ${nattdel}
    ${stangdaDorrar}
    ${driftdel}`,
  };
}
