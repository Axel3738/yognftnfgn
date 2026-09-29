// akut/kontroller.mjs — domarna. Rena funktioner: de får det som hämtats och
// säger vad som är akut. Inget nät här, så varje regel går att testa med en
// fixtur (akut/test/kontroller.test.mjs).
//
// Regeln för att något ska stå här (Axels ord 2026-09-27): "akuta grejer som
// inte min VA, inte mina videoredigerare, ingen kan påverka förutom jag, som
// verkligen påverkar performancen av hur businessen går, och viktiga
// backend- eller frontend-problem". Allt annat har Discord.
//
// Varje larm bär { typ, nyckel, verksamhet, rubrik, rader, gor, data }:
//   typ       — butik | konto | spendcap | pengar | pixel | backend | rutin |
//               nyckel | tvistgrad | utbetalning (minne.mjs vet vilka som är tillstånd)
//   nyckel    — stabil för tillstånd, med datum/vecka för händelser
//   rubrik    — det Axel läser först
//   rader     — vad som mättes, med siffror
//   gor       — hans klick, i ordning
// Varje domare returnerar dessutom `friska`: nycklar den mätt och funnit OK,
// så ett postat tillstånd kan få sitt "✅ Löst". En kontroll som inte kunde
// mätas ger varken larm eller frisk — bara en notering.

import { breakEvenUrNamn, dagnyckel } from '../stonebite/berakna.mjs';
import { kampanjTillhor, butikenAr } from '../stonebite/data.mjs';

const DAG = 86_400_000;
const SV = 'sv-SE';

export const VERKSAMHETSNAMN = Object.freeze({
  baverbutiken: 'Bäverbutiken', carashell: 'CaraShell', matstrumpor: 'Matstrumpor', grillkliniken: 'Grillkliniken',
  ops: 'OPS-butikerna', bolaget: 'Bolaget',
});

/** Metas account_status (developers.facebook.com → Ad Account → account_status). */
export const KONTOSTATUS = Object.freeze({
  1: 'aktivt', 2: 'AVSTÄNGT av Meta', 3: 'OBETALT (unsettled — betalningen gick inte igenom)', 7: 'under riskgranskning',
  8: 'väntar på betalning', 9: 'i respit (grace period)', 100: 'på väg att stängas', 101: 'STÄNGT', 201: 'aktivt (any active)', 202: 'stängt (any closed)',
});
export const AVSTANGNINGSORSAK = Object.freeze({
  0: null, 1: 'annonspolicy (ads integrity)', 2: 'IP-granskning', 3: 'betalrisk (risk payment)', 4: 'gray account shut down',
  5: 'AFC-granskning', 6: 'business integrity', 7: 'permanent stängt', 8: 'oanvänt återförsäljarkonto', 9: 'oanvänt konto',
  10: 'paraplykonto', 11: 'Business Manager-policy', 12: 'misrepresentation', 13: 'sen betalning',
});

export const TROSKLAR = Object.freeze({
  pengar_noll_kop_spend: 5000, pengar_under_be_spend: 10000, pengar_be_andel: 0.5, pengar_roas_utan_be: 0.75,
  pixel_min_ordrar: 15, pixel_min_spend: 2000, autosvar_max_omstarter: 5,
  tvistgrad_procent: 0.75, tvistgrad_dagar: 30, tvistgrad_min_ordrar: 200, utbetalning_dagar: 14,
});

// ------------------------------------------------------------ små hjälpare

// Vanliga mellanslag i talen: sv-SE ger hårda (U+00A0/U+202F), och de gör
// att en sökning på "18 512 kr" i Slack eller ett test inte träffar.
const mellanslag = (s) => String(s).replace(/[  ]/g, ' ');
export function kr(v, valuta = 'SEK') {
  const n = mellanslag(Math.round(Number(v) || 0).toLocaleString(SV));
  return valuta === 'SEK' ? `${n} kr` : `${n} ${valuta}`;
}
export function tal(v, dec = 2) { return mellanslag(Number(v).toLocaleString(SV, { maximumFractionDigits: dec, minimumFractionDigits: 0 })); }
/**
 * "sön 27/9 17:29" i svensk tid — veckodag och datum står alltid med. Axel
 * läser larmet i Slack en eller två dagar senare, och första versionen skrev
 * bara "Mätt 17:29" + "i dag": söndagens larm lästes tisdag 29/9 som om det
 * gällt i dag eller i går (hans fråga samma morgon).
 */
export function klockan(nu = new Date()) {
  return `${dagText(nu)} ${new Intl.DateTimeFormat(SV, { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit', hour12: false }).format(nu)}`;
}
/** "sön 27/9" i svensk tid. Tar ett Date eller Metas eget dygn som "YYYY-MM-DD" (tolkas mitt på dagen, så datumet är samma i alla tidszoner). */
export function dagText(d = new Date()) {
  const dat = /^\d{4}-\d{2}-\d{2}$/.test(String(d)) ? new Date(`${d}T12:00:00Z`) : new Date(d);
  const delar = Object.fromEntries(new Intl.DateTimeFormat(SV, { timeZone: 'Europe/Stockholm', weekday: 'short', day: 'numeric', month: 'numeric' }).formatToParts(dat).map((p) => [p.type, p.value]));
  return `${String(delar.weekday ?? '').replace(/\.$/, '')} ${delar.day}/${delar.month}`;
}
export function stockholmTimme(nu = new Date()) {
  const h = new Intl.DateTimeFormat(SV, { timeZone: 'Europe/Stockholm', hour: '2-digit', hour12: false }).format(nu);
  return Number(h) % 24;
}
/** ISO-vecka som "2026-W39". Ren. */
export function isoVecka(d = new Date()) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dag = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dag);
  const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const v = Math.ceil(((t - start) / DAG + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(v).padStart(2, '0')}`;
}
/** Kampanjnamnet utan svansen "| BE ROAS 1.63 | Launch …" — det Axel söker på i Ads Manager. */
export function kortNamn(namn, max = 60) {
  const n = String(namn ?? '').split(/\s*\|\s*/)[0].trim() || String(namn ?? '');
  return n.length > max ? `${n.slice(0, max - 1)}…` : n;
}
export function domanUr(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return String(url ?? ''); }
}

/** Varumärket en snapshot-butik hör till (varumarken.json `butiker`, id eller myshopify-namn). */
export function verksamhetForButik(varumarken = [], butik) {
  for (const vm of varumarken) {
    if ((vm.butiker ?? []).some((id) => id === butik?.id || butikenAr(id, butik))) return vm.id;
  }
  return null;
}
/** Varumärket ett konto (och en kampanj i ett delat konto) hör till. */
export function verksamhetForKonto(varumarken = [], kontoId, kampanjnamn = null) {
  const traffar = varumarken.filter((vm) => (vm.konton ?? []).some((k) => String(k.id) === String(kontoId)));
  if (!traffar.length) return null;
  if (traffar.length === 1 || kampanjnamn === null) return traffar[0].id;
  const ratt = traffar.find((vm) => kampanjTillhor((vm.konton ?? []).find((k) => String(k.id) === String(kontoId)), kampanjnamn));
  return (ratt ?? traffar[0]).id;
}

// ------------------------------------------------------------------ sajterna

/**
 * sajter: [{ id, namn, url, verksamhet, resultat: { ok, status, slutUrl, fel, losenord, forsok } }]
 * En sajt som svarar är frisk. En som inte gör det på alla försöken är akut:
 * kunderna kan inte handla, annonserna spenderar mot en död sida.
 */
export function domSajter(sajter = [], { nu = new Date() } = {}) {
  const larm = [];
  const friska = [];
  for (const s of sajter) {
    const r = s.resultat;
    if (!r) continue;
    const nyckel = `butik:${s.id}`;
    if (r.ok) { friska.push(nyckel); continue; }
    const doman = domanUr(s.url);
    let rubrik; let rader; let gor;
    if (r.status === 402) {
      rubrik = `${doman} är STÄNGD av Shopify (402)`;
      rader = [`Shopify svarar "Unavailable Shop" på ${s.url}. Det betyder oftast obetald Shopify-faktura eller stängd butik. Mätt ${klockan(nu)}.`, 'Ingen kund kan handla, och annonserna spenderar mot en stängd sida.'];
      gor = ['Öppna admin.shopify.com → butiken → Settings → Billing och betala det som ligger.', 'Ligger ingen faktura där: Settings → Plan — butiken kan vara pausad.'];
    } else if (r.losenord) {
      rubrik = `${doman} är lösenordsskyddad`;
      rader = [`${s.url} skickar besökaren till lösenordssidan. Kunderna ser en låst butik. Mätt ${klockan(nu)}.`];
      gor = ['Shopify admin → Online Store → Preferences → Password protection: bocka ur "Restrict access" → Save.'];
    } else {
      const vad = r.status ? `svarar ${r.status}` : `svarar inte (${r.fel ?? 'okänt fel'})`;
      rubrik = `${doman} svarar inte`;
      rader = [`${s.url} ${vad} på ${r.forsok ?? 1} försök i rad. Mätt ${klockan(nu)}.`, 'Kunderna kan inte handla, och annonserna spenderar mot en död sida.'];
      gor = [
        `Öppna ${s.url} i mobilen. Kommer den upp där var det tillfälligt — vänta på "Löst" här.`,
        'Kommer den inte upp: status.shopify.com. Är Shopify grönt är det domänen — Loopia → Domäner → DNS-inställningar.',
      ];
    }
    larm.push({ typ: 'butik', nyckel, verksamhet: s.verksamhet ?? null, rubrik, rader, gor, data: { url: s.url, status: r.status ?? null, fel: r.fel ?? null, forsok: r.forsok ?? null } });
  }
  return { larm, friska };
}

// ------------------------------------------------------------- annonskonton

/**
 * konton: [{ id, namn, verksamhet, konto: { account_status, disable_reason, currency, spend_cap, amount_spent } | null, fel: { kod, message } | null }]
 * Kontot avstängt/obetalt = allt stannar, och bara Axel kan betala eller överklaga.
 * Token-fel (kod 190) = ALLA rutiner är blinda — ett larm, inte sju.
 */
export function domKonton(konton = [], { nu = new Date() } = {}) {
  const larm = [];
  const friska = new Set();
  let tokenFel = null;
  for (const k of konton) {
    if (k.fel) {
      if (Number(k.fel.kod) === 190) tokenFel = k.fel;
      continue; // strypt eller nekad — inte mätt, varken larm eller frisk
    }
    if (!k.konto) continue;
    friska.add('nyckel:meta');
    const st = Number(k.konto.account_status);
    const valuta = k.konto.currency ?? 'SEK';
    if (st === 1 || st === 201) {
      friska.add(`konto:${k.id}`);
    } else {
      const orsak = AVSTANGNINGSORSAK[Number(k.konto.disable_reason)] ?? null;
      larm.push({
        typ: 'konto', nyckel: `konto:${k.id}`, verksamhet: k.verksamhet ?? null,
        rubrik: `Annonskontot ${k.namn} är ${KONTOSTATUS[st] ?? `i status ${st}`}`,
        rader: [
          `Meta säger status ${st} (${KONTOSTATUS[st] ?? 'okänd'})${orsak ? `, orsak: ${orsak}` : ''}. Konto-id ${k.id}. Mätt ${klockan(nu)}.`,
          'Inga annonser levererar från kontot förrän det är löst. Ingen session eller rutin kan göra något åt det.',
        ],
        gor: [
          `Öppna business.facebook.com → Ads Manager → kontot ${k.namn} och läs Metas besked överst.`,
          st === 3 || Number(k.konto.disable_reason) === 3 || Number(k.konto.disable_reason) === 13
            ? 'Betalningen: Billing & payments → Payment settings → betala saldot eller byt kort.'
            : 'Avstängt: Account quality (business.facebook.com/accountquality) → kontot → Request review.',
        ],
        data: { status: st, orsak, valuta },
      });
    }
    const cap = Number(k.konto.spend_cap ?? 0);
    const spent = Number(k.konto.amount_spent ?? 0);
    if (cap > 0 && spent >= cap) {
      larm.push({
        typ: 'spendcap', nyckel: `spendcap:${k.id}`, verksamhet: k.verksamhet ?? null,
        rubrik: `Annonskontot ${k.namn} har nått sitt utgiftstak`,
        rader: [`Spend cap ${kr(cap / 100, valuta)} är nådd (kontot har dragit ${kr(spent / 100, valuta)} totalt). Annonserna står stilla. Mätt ${klockan(nu)}.`],
        gor: [`Ads Manager → kontot ${k.namn} → Settings → Account spending limit: höj eller ta bort taket.`],
        data: { cap, spent, valuta },
      });
    } else {
      friska.add(`spendcap:${k.id}`);
    }
  }
  if (tokenFel && !friska.has('nyckel:meta')) {
    larm.push({
      typ: 'nyckel', nyckel: 'nyckel:meta', verksamhet: 'bolaget',
      rubrik: 'Meta-nyckeln är död — alla rutiner är blinda',
      rader: [`Meta svarar "${String(tokenFel.message ?? '').slice(0, 140)}" (kod 190) på META_ACCESS_TOKEN. Mätt ${klockan(nu)}.`, 'Nattvakten, Skalnings kungen, leveransrundorna, kommentarsgranskningen och sajten läser ingenting förrän nyckeln byts.'],
      gor: [
        'business.facebook.com → Business settings → Users → System users → "API LONG TERM" → Generate new token (samma rättigheter som förut).',
        'claude.ai → Environments: byt META_ACCESS_TOKEN i VARJE miljö (claude5, Barkås, claude6) och på Railway → Variables.',
      ],
      data: { kod: 190 },
    });
  }
  return { larm, friska: [...friska] };
}

// ------------------------------------------------------------ pengar brinner

/**
 * konton: samma lista, med kampanjer: [{ id, namn, spend, kop, roas, dag }] för i DAG.
 * Två regler, båda med höga trösklar med flit — Skalnings kungen och
 * nattvakterna dömer annonser; det här larmar bara när det brinner:
 *   1. ≥ pengar_noll_kop_spend i dag och NOLL köp
 *   2. ≥ pengar_under_be_spend i dag och ROAS under halva break-even (ur namnet)
 * Nyckelns datum är Metas eget dygn (`dag` = insights date_start, kontots
 * tidszon), svenskt datum bara som reserv: UK-kontot går på London, så vid
 * svensk midnatt är det fortfarande samma dygn hos Meta — och samma larm.
 */
export function domPengar(konton = [], { nu = new Date(), trosklar = TROSKLAR, varumarken = [] } = {}) {
  const datum = dagnyckel(nu);
  const larm = [];
  for (const k of konton) {
    if (k.fel || !Array.isArray(k.kampanjer)) continue;
    const valuta = k.konto?.currency ?? k.valuta ?? 'SEK';
    for (const c of k.kampanjer) {
      const spend = Number(c.spend) || 0;
      const kop = Number(c.kop) || 0;
      const roas = c.roas === null || c.roas === undefined ? null : Number(c.roas);
      const be = breakEvenUrNamn(c.namn);
      let regel = null;
      if (spend >= trosklar.pengar_noll_kop_spend && kop === 0) regel = 'noll';
      else if (spend >= trosklar.pengar_under_be_spend) {
        const grans = be ? be * trosklar.pengar_be_andel : trosklar.pengar_roas_utan_be;
        if ((roas ?? 0) < grans) regel = be ? 'under' : 'under_okand';
      }
      if (!regel) continue;
      const vm = verksamhetForKonto(varumarken, k.id, c.namn) ?? k.verksamhet ?? null;
      const roasText = roas === null ? 'ROAS saknas' : `ROAS ${tal(roas)}`;
      const beText = be ? `break-even ${tal(be)}` : 'break-even står inte i kampanjnamnet';
      // Dygnet är Metas (kontots tidszon) när insights ger date_start, annars svenskt.
      const dag = /^\d{4}-\d{2}-\d{2}$/.test(c.dag ?? '') ? c.dag : datum;
      const dagen = dagText(dag);
      const rader = regel === 'noll'
        ? [`"${c.namn}" har dragit ${kr(spend, valuta)} ${dagen} utan ett enda köp (${beText}). Mätt ${klockan(nu)}, konto ${k.namn}.`]
        : [`"${c.namn}" har dragit ${kr(spend, valuta)} ${dagen} med ${kop} köp, ${roasText} (${beText}). Mätt ${klockan(nu)}, konto ${k.namn}.`];
      rader.push('Ingen session eller rutin rör dina budgetar — det här är ditt beslut.');
      larm.push({
        typ: 'pengar', nyckel: `pengar:${k.id}:${c.id}:${dag}`, verksamhet: vm,
        rubrik: regel === 'noll' ? `Pengar brinner ${dagen}: ${kr(spend, valuta)}, 0 köp` : `Pengar brinner ${dagen}: ${kr(spend, valuta)}, ROAS ${roas === null ? '–' : tal(roas)}`,
        rader,
        gor: [
          `Ads Manager → kontot ${k.namn} → kampanjen "${kortNamn(c.namn)}".`,
          'Sänk dagsbudgeten eller stäng av kampanjen. Kolla placeringarna: natten 26→27/9 låg 96 % av spenden i Instagram Stories.',
        ],
        data: { konto: k.id, kampanj: c.id, spend, kop, roas, be, regel, valuta },
      });
    }
  }
  return { larm, friska: [] };
}

// ------------------------------------------------------------------- pixeln

/**
 * Butiken tar ordrar men Meta ser noll köp trots spend ⇒ pixeln/CAPI är död.
 * Då optimerar Meta blint och all analys blir fel — utan felmeddelande.
 * butiker = snapshot.butiker (ordrar per dag), konton = dagens kampanjer.
 */
export function domPixel({ butiker = [], konton = [], varumarken = [], nu = new Date(), trosklar = TROSKLAR } = {}) {
  const datum = dagnyckel(nu);
  const larm = [];
  for (const vm of varumarken) {
    const mina = butiker.filter((b) => b.status === 'ok' && (vm.butiker ?? []).some((id) => id === b.id || butikenAr(id, b)));
    if (!mina.length || !(vm.konton ?? []).length) continue;
    const ordrar = mina.reduce((s, b) => s + (Number((b.dagar ?? []).find((d) => d.datum === datum)?.ordrar) || 0), 0);
    let spend = 0; let kop = 0; let lasta = 0;
    for (const post of vm.konton) {
      const k = konton.find((x) => String(x.id) === String(post.id));
      if (!k || k.fel || !Array.isArray(k.kampanjer)) continue;
      lasta += 1;
      for (const c of k.kampanjer) if (kampanjTillhor(post, c.namn)) { spend += Number(c.spend) || 0; kop += Number(c.kop) || 0; }
    }
    if (!lasta) continue;
    if (ordrar >= trosklar.pixel_min_ordrar && kop === 0 && spend >= trosklar.pixel_min_spend) {
      larm.push({
        typ: 'pixel', nyckel: `pixel:${vm.id}:${datum}`, verksamhet: vm.id,
        rubrik: `Pixeln ser inga köp ${dagText(nu)}: ${ordrar} ordrar i butiken, 0 köp i Meta`,
        rader: [`${vm.namn}: butikerna har ${ordrar} ordrar ${dagText(nu)}, men Meta rapporterar 0 köp på ${kr(spend)} spend. Mätt ${klockan(nu)}.`, 'Meta optimerar blint och all annonsanalys blir fel, utan något felmeddelande.'],
        gor: [
          'Shopify admin → Apps → Facebook & Instagram → Settings → Data sharing: pixeln ska vara på (Maximum).',
          'business.facebook.com/events_manager → pixeln → Test events: lägg en vara i varukorgen och se om händelsen kommer.',
        ],
        data: { ordrar, spend, kop, konton: lasta },
      });
    }
  }
  return { larm, friska: [] };
}

// ------------------------------------------------------------------ backend

/**
 * halsa: { url, svar: { ok, status, json, fel }, reserv, svarReserv }
 * Bolagets sajt + kundtjänstboten på Railway. Bara Axel når Railway.
 */
export function domBackend(halsa, { nu = new Date(), trosklar = TROSKLAR } = {}) {
  const larm = [];
  const friska = [];
  if (!halsa) return { larm, friska };
  const s = halsa.svar ?? {};
  if (!s.ok) {
    const reservOk = Boolean(halsa.svarReserv?.ok);
    larm.push({
      typ: 'backend', nyckel: 'backend:sajten', verksamhet: 'bolaget',
      rubrik: reservOk ? 'stonebite.org svarar inte — men Railway gör det (domänen)' : 'stonebite.org är nere (Railway svarar inte)',
      rader: [
        `${halsa.url} ${s.status ? `svarar ${s.status}` : `svarar inte (${s.fel ?? 'okänt fel'})`}. ${reservOk ? `Direktadressen ${halsa.reserv} svarar — felet sitter i domänen.` : `Direktadressen ${halsa.reserv} svarar inte heller.`} Mätt ${klockan(nu)}.`,
        'Sajten, dashboarden och kundtjänstboten (autosvaret) ligger på samma tjänst.',
      ],
      gor: reservOk
        ? ['Squarespace → Domains → stonebite.org → DNS: CNAME www ska peka på daz9hn85.up.railway.app.', 'Railway → strong-solace → yognftnfgn → Settings → Domains: står www.stonebite.org som verifierad?']
        : ['railway.app → strong-solace → yognftnfgn → Deployments: läs senaste bygget. Rött = kraschat → öppna loggen, tryck Redeploy.', 'Står bygget i "Waiting for build slot": ett annat projekt bygger — koppla bort dess GitHub-källa.'],
      data: { status: s.status ?? null, fel: s.fel ?? null, reservOk },
    });
    return { larm, friska };
  }
  friska.push('backend:sajten');
  const a = s.json?.autosvar;
  if (a && Array.isArray(a.brands) && a.brands.length && a.kor === false) {
    larm.push({
      typ: 'backend', nyckel: 'backend:autosvar', verksamhet: 'bolaget',
      rubrik: 'Kundtjänstboten är AV på Railway',
      rader: [`/halsa säger autosvar.kor: false för ${a.brands.join(', ')}. Arga kunder får inget svar inom minuten. Mätt ${klockan(nu)}.${a.saknar?.length ? ` Saknar: ${a.saknar.join(', ')}.` : ''}`],
      gor: ['railway.app → strong-solace → yognftnfgn → Variables: AUTOSVAR_BRANDS och KUNDTJANST_MAIL_PASS_* ska finnas.', 'Deployments → senaste → Deploy logs: leta "autosvar" — raden säger varför vakten inte startade.'],
      data: { brands: a.brands, saknar: a.saknar ?? [] },
    });
  } else if (a) {
    friska.push('backend:autosvar');
  }
  if (a && Number(a.omstarter) >= trosklar.autosvar_max_omstarter) {
    larm.push({
      typ: 'backend', nyckel: 'backend:autosvar-krasch', verksamhet: 'bolaget',
      rubrik: `Kundtjänstboten kraschar om och om igen (${a.omstarter} omstarter)`,
      rader: [`/halsa: ${a.omstarter} omstarter sedan ${a.startad ?? '?'}${a.senasteUtgang ? `, senaste utgång ${String(a.senasteUtgang).slice(0, 120)}` : ''}. Mätt ${klockan(nu)}.`],
      gor: ['railway.app → strong-solace → yognftnfgn → Deployments → Deploy logs: läs raden före varje omstart.', 'Oftast ett lösenord Loopia nekar eller en Shopify-nyckel — byt den i Variables.'],
      data: { omstarter: a.omstarter },
    });
  } else if (a) {
    friska.push('backend:autosvar-krasch');
  }
  return { larm, friska };
}

// ------------------------------------------------------------------ rutiner

/**
 * lage = rutinlage() ur stonebite/kallor/rutiner.mjs. En rutin som står
 * "saknas" har lämnat inget spår på tre intervall — och bara Axel kan slå på
 * den igen (den ligger i Routines-vyn på hans konto). "omatbar" och
 * "avstangd" är inte fel. Kontot per rutin ur konfig.rutinkonton.
 *
 * Akutlarmet dömer aldrig sig självt (egenId): står det still kan det inte
 * posta, och när det postar kör det ju. Mätt 2026-09-28 15:57: triggern
 * fyrade varje timme men sessionen låg still i sex timmar, och första
 * körningen efteråt köade "Akutlarmet står still" — om sig självt, medan det
 * körde. Rutinvakten på sajten (stonebite.org → System) ser det i stället.
 */
export function domRutiner(lage, { nu = new Date(), rutinkonton = {}, egenId = 'akut' } = {}) {
  const larm = [];
  const friska = [];
  if (!lage || !Array.isArray(lage.rutiner) || lage.status === 'fel' || lage.status === 'saknas') {
    return { larm, friska, notering: `rutinvakten kunde inte döma: ${lage?.orsak ?? 'ingen git-logg'}` };
  }
  const kontoFor = (id) => {
    const traff = Object.entries(rutinkonton).find(([prefix]) => prefix !== 'kommentar' && String(id).startsWith(prefix));
    return traff ? traff[1] : null;
  };
  for (const r of lage.rutiner) {
    const nyckel = `rutin:${r.id}`;
    if (r.id === egenId) continue;
    if (r.status === 'saknas') {
      const konto = kontoFor(r.id);
      larm.push({
        typ: 'rutin', nyckel, verksamhet: r.brand && VERKSAMHETSNAMN[r.brand] ? r.brand : 'bolaget',
        rubrik: `Rutinen "${r.namn}" står still`,
        rader: [`${r.namn} (${r.kommando ?? r.id}, ${r.schematext ?? ''}): ${r.ord ?? 'inget spår'}. Mätt ${klockan(nu)}.`],
        gor: [`claude.ai → Routines${konto ? ` (kontot ${konto})` : ''} → "${r.namn}": är den på? Läs senaste körningen — röd = öppna sessionen och läs felet.`],
        data: { id: r.id, senast: r.senast ?? null, konto },
      });
    } else if (r.status === 'ok' || r.status === 'sen' || r.status === 'ny') {
      friska.push(nyckel);
    }
  }
  return { larm, friska, notering: lage.status === 'delvis' ? lage.orsak : null };
}

// -------------------------------------------------------------- nycklarna

/** Notion: svar { status } på GET /v1/users/me. 401 = nyckeln är död. */
export function domNotion(svar, { nu = new Date() } = {}) {
  if (!svar || svar.fel) return { larm: [], friska: [], notering: svar?.fel ? `Notion gick inte att nå: ${svar.fel}` : null };
  if (svar.status === 200) return { larm: [], friska: ['nyckel:notion'] };
  if (svar.status !== 401) return { larm: [], friska: [], notering: `Notion svarade ${svar.status}` };
  return {
    larm: [{
      typ: 'nyckel', nyckel: 'nyckel:notion', verksamhet: 'bolaget',
      rubrik: 'Notion-nyckeln är död — leveransrundor och briefer stannar',
      rader: [`Notion svarar 401 på NOTION_TOKEN (integrationen "Bäverbutiken RUTINER"). Mätt ${klockan(nu)}.`, 'Leveransrundan, översättningarna, briefgranskningen och commission läser ingenting förrän den byts.'],
      gor: ['notion.so → Settings → Connections → Develop or manage integrations → "Bäverbutiken RUTINER" → Internal Integration Secret → Refresh.', 'claude.ai → Environments: byt NOTION_TOKEN i varje miljö.'],
      data: { status: 401 },
    }],
    friska: [],
  };
}

/**
 * Shopify-nycklar: en butik som var i drift (minne.butiker, senaste 7 dygnen)
 * men som snapshoten inte längre kan läsa ⇒ appen är avinstallerad, nekad
 * eller nyckeln borta. 402 tas av sajtkollen (butiken är stängd, inte nyckeln).
 */
/** Svar som säger att vägen dit brast, inte att nyckeln nekades. */
export function arTillfalligtNatfel(orsak) {
  return /\b50[0234]\b|DNS resolution|transient|timeout|timed out|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN|ENOTFOUND|fetch failed|socket hang up/i.test(String(orsak ?? ''));
}

export function domShopifyNycklar({ butiker = [], minne = { butiker: {} }, nu = new Date(), varumarken = [] } = {}) {
  const larm = [];
  const friska = [];
  const grans = nu.getTime() - 7 * DAG;
  for (const b of butiker) {
    if (b.status === 'av') continue;
    const nyckel = `nyckel:shopify:${b.id}`;
    if (b.status === 'ok') { friska.push(nyckel); continue; }
    if (b.status !== 'fel') continue;
    const m = minne.butiker?.[b.id];
    if (!m?.senastOk || Date.parse(m.senastOk) < grans) continue; // aldrig läst, eller död sedan länge — inte akut
    if (/\b402\b|Unavailable Shop/i.test(String(b.orsak ?? ''))) continue;
    // Nätfel är inte en död nyckel (mätt 2026-09-29 18:04: "503: DNS resolution
    // failed (transient resolver error)" för Norge i snapshoten, nyckeln läste
    // butiken live två minuter senare). Varken larm eller "löst".
    if (arTillfalligtNatfel(b.orsak)) continue;
    larm.push({
      typ: 'nyckel', nyckel, verksamhet: verksamhetForButik(varumarken, b) ?? null,
      rubrik: `Shopify-nyckeln till ${m.namn ?? b.id} fungerar inte längre`,
      rader: [`${b.namn ?? b.id} gick att läsa ${new Date(m.senastOk).toLocaleString(SV, { timeZone: 'Europe/Stockholm' })} men inte nu: ${String(b.orsak ?? '').slice(0, 200)}. Mätt ${klockan(nu)}.`, 'Spårningen, sajten, tvistkollen och kundtjänstboten står utan data för butiken.'],
      gor: ['dev.shopify.com → appen som orsaken namnger → Install / godkänn "Protected customer data".', 'Är appen borta: skapa nycklarna igen och lägg in SHOPIFY_CLIENT_ID/SECRET i claude.ai → Environments.'],
      data: { orsak: b.orsak ?? null, senastOk: m.senastOk },
    });
  }
  return { larm, friska };
}

// ----------------------------------------------------------- tvistgraden

/**
 * Chargebacks (inte inquiries) de senaste 30 dagarna ÷ ordrar samma 30 dagar.
 * Visa varnar från 0,9 %, Mastercard 1 % — och då kan Shopify Payments
 * stänga. tvister = hamtaAllaTvister() (lista + butiker), butiker = snapshot.
 */
export function domTvistgrad({ butiker = [], tvister = null, nu = new Date(), trosklar = TROSKLAR, varumarken = [] } = {}) {
  if (!tvister || !Array.isArray(tvister.lista)) return { larm: [], friska: [], notering: 'tvisterna lästes inte i den här körningen' };
  const larm = [];
  const grans = nu.getTime() - trosklar.tvistgrad_dagar * DAG;
  const vecka = isoVecka(nu);
  for (const b of butiker) {
    if (b.status !== 'ok') continue;
    const lage = (tvister.butiker ?? []).find((x) => x.id === b.id);
    if (!lage || lage.status !== 'ok') continue;
    const ordrar = (b.dagar ?? []).filter((d) => Date.parse(`${d.datum}T12:00:00Z`) >= grans).reduce((s, d) => s + (Number(d.ordrar) || 0), 0);
    if (ordrar < trosklar.tvistgrad_min_ordrar) continue;
    const cb = tvister.lista.filter((t) => t.brand === b.id && t.typ === 'chargeback' && t.initierad && Date.parse(t.initierad) >= grans).length;
    const grad = Math.round((cb / ordrar) * 10000) / 100;
    if (grad < trosklar.tvistgrad_procent) continue;
    larm.push({
      typ: 'tvistgrad', nyckel: `tvistgrad:${b.id}:${vecka}`, verksamhet: verksamhetForButik(varumarken, b) ?? null,
      rubrik: `Chargeback-graden i ${b.namn ?? b.id} är ${tal(grad)} %`,
      rader: [`${cb} chargebacks på ${ordrar} ordrar de senaste ${trosklar.tvistgrad_dagar} dagarna = ${tal(grad)} %. Visa varnar vid 0,9 %, Mastercard vid 1 % — då kan Shopify Payments hålla inne pengar eller stänga. Mätt ${klockan(nu)}.`, 'VA:n svarar på tvisterna; det som sänker GRADEN är leveranstid, spårningsmejl och produktkvalitet — det är ditt bord.'],
      gor: ['Shopify admin → Orders → Disputes: läs orsakerna (product not received / not as described) och se vilka produkter som återkommer.', 'Är det leveranstiden: kolla att spårningsrutinen kör och att fraktmejlen går ut (rutinvakten på stonebite.org).'],
      data: { cb, ordrar, grad },
    });
  }
  return { larm, friska: [] };
}

// --------------------------------------------------------- utbetalningar

/** lista: [{ id, namn, verksamhet, status: 'ok'|'hoppad', orsak, payouts: [{ id, status, date, amount, currency }] }] */
export function domUtbetalningar(lista = [], { nu = new Date(), trosklar = TROSKLAR } = {}) {
  const larm = [];
  const grans = nu.getTime() - trosklar.utbetalning_dagar * DAG;
  for (const b of lista) {
    if (b.status !== 'ok') continue;
    for (const p of b.payouts ?? []) {
      if (String(p.status) !== 'failed') continue;
      if (p.date && Date.parse(p.date) < grans) continue;
      larm.push({
        typ: 'utbetalning', nyckel: `utbetalning:${b.id}:${p.id}`, verksamhet: b.verksamhet ?? null,
        rubrik: `Utbetalningen från ${b.namn ?? b.id} MISSLYCKADES (${kr(p.amount, p.currency ?? 'SEK')})`,
        rader: [`Shopify Payments: utbetalning ${p.id} daterad ${p.date ?? '?'} har status failed. Pengarna ligger kvar hos Shopify. Mätt ${klockan(nu)}.`],
        gor: ['Shopify admin → Settings → Payments → Shopify Payments → View payouts: läs felet på raden.', 'Oftast bankkontot: Settings → Payments → Manage → Bank account → uppdatera.'],
        data: { payout: p.id, belopp: p.amount, valuta: p.currency ?? null, datum: p.date ?? null },
      });
    }
  }
  return { larm, friska: [] };
}

// ---------------------------------------------------------------- allt

/** Alla domare i ett svep. `in` bär det hämtade; det som saknas hoppas med notering. */
export function domAllt(inp, { nu = new Date(), trosklar = TROSKLAR, varumarken = [], rutinkonton = {}, minne = { butiker: {} }, dagligt = true } = {}) {
  const delar = [
    domSajter(inp.sajter ?? [], { nu }),
    domKonton(inp.konton ?? [], { nu }),
    domPengar(inp.konton ?? [], { nu, trosklar, varumarken }),
    domPixel({ butiker: inp.butiker ?? [], konton: inp.konton ?? [], varumarken, nu, trosklar }),
    domBackend(inp.halsa ?? null, { nu, trosklar }),
    domRutiner(inp.rutiner ?? null, { nu, rutinkonton }),
    domNotion(inp.notion ?? null, { nu }),
    domShopifyNycklar({ butiker: inp.butiker ?? [], minne, nu, varumarken }),
    // De dagliga (Shopify-tunga) kontrollerna körs bara i 07-körningen — en
    // timkörning utan dem ska inte notera "tvisterna lästes inte", det är rätt.
    ...(dagligt ? [
      domTvistgrad({ butiker: inp.butiker ?? [], tvister: inp.tvister ?? null, nu, trosklar, varumarken }),
      domUtbetalningar(inp.utbetalningar ?? [], { nu, trosklar }),
    ] : []),
  ];
  const larm = delar.flatMap((d) => d.larm);
  const friska = new Set(delar.flatMap((d) => d.friska ?? []));
  const noteringar = delar.map((d) => d.notering).filter(Boolean);
  // Ett larm är aldrig friskt i samma körning (två domare kan inte säga olika om samma nyckel).
  for (const l of larm) friska.delete(l.nyckel);
  return { larm, friska, noteringar };
}
