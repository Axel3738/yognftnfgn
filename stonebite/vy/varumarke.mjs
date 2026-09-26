// vy/varumarke.mjs — varumärkena: en huvudflik per brand, flikar därunder.
//
// Axels beställning 2026-09-22: "en MAIN flik för varje varumärke, dvs
// Matstrumpor, Grillkliniken, Bäverbutiken, Carashell, och sen varje enskilda
// folders därunder … så att allting kommer bli synligt, tydligt och klart, så
// att jag slipper gå och klicka in överallt". Målet är att han ska kunna sitta
// med high-leverage-uppgifter: sidan säger vad som kräver honom, vad som är
// på väg och vad som hände — per varumärke.
//
// Ingenting här hämtas: allt kommer ur snapshoten (Shopify, Meta, kundtjänst,
// spårning, rutinvakten, Discord) plus kalender- och kontaktlagret på
// volymen. Det som inte går att läsa står med orsak, aldrig som en nolla.
// Valutor summeras aldrig ihop. Delade annonskonton delas på kampanjprefix.

import { esc, attr, kort, panel, tabell, tomt, block, spark, status, tal, pengar, t, sprak } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { butiksLage, kontoLage, kampanjrader, butikerPerValuta, produktlista, kampanjTillhor, butikenAr } from '../data.mjs';
import { forandring, pengarKort, sedan, datum as datumtext, DAG } from '../berakna.mjs';
import { forklaraFel, kategorinamn, tvisttyp } from '../forklaring.mjs';
import { harleddaHandelser, brandForKundtjanst, idag, plusDagar } from '../kalender.mjs';
import { STATUSAR, TYPER as KONTAKTTYPER, statusnamn, typnamn } from '../kontakter.mjs';
import { kalenderBlock } from './kalender.mjs';
import { autosvarBlock } from './drift.mjs';

export const FLIKAR = Object.freeze([
  { id: 'oversikt', titel: 'Översikt' },
  { id: 'butiker', titel: 'Butiker' },
  { id: 'annonser', titel: 'Annonser' },
  { id: 'kundtjanst', titel: 'Kundtjänst' },
  { id: 'leverans', titel: 'Leverans' },
  { id: 'rutiner', titel: 'Rutiner' },
  { id: 'kontakter', titel: 'Kontakter' },
  { id: 'kalender', titel: 'Kalender' },
]);

const HUVUDBRANDS = ['baverbutiken', 'grillkliniken', 'matstrumpor', 'carashell'];
const RUTINTON = { ok: 'bra', sen: 'varning', saknas: 'kritisk', avstangd: 'neutral', omatbar: 'neutral', ny: 'neutral' };
const RUTINORD = { ok: 'körde', sen: 'sen', saknas: 'saknas', avstangd: 'avstängd', omatbar: 'går inte att mäta', ny: 'ny' };

function roasText(v) {
  return v === null || v === undefined ? '–' : Number(v).toLocaleString('sv-SE', { maximumFractionDigits: 2 });
}

// ---------------------------------------------------------- datan per brand

/** Allt ett varumärke består av, plockat ur snapshoten. Ren funktion. */
export function brandData(vm, snapshot, { nu = new Date(), kalender = [], kontakter = [] } = {}) {
  const butiker = (snapshot?.butiker ?? []).filter((b) => (vm.butiker ?? []).some((id) => butikenAr(id, b))).map((b) => butiksLage(b, { nu }));
  const perValuta = butikerPerValuta(butiker);
  const produkter = produktlista(snapshot);

  const konton = (vm.konton ?? []).map((post) => {
    const raa = (snapshot?.annonskonton ?? []).find((k) => String(k.id) === String(post.id));
    if (!raa) return { ...post, status: 'saknas', orsak: 'kontot lästes inte vid senaste hämtningen', kampanjer: [], delat: !post.hela };
    const lage = kontoLage(raa, { nu });
    const alla = kampanjrader(lage, produkter);
    const kampanjer = alla.filter((k) => kampanjTillhor(post, k.namn));
    const delat = !post.hela;
    // Delat konto: kontots dagsserie är hela kontots — då räknas bara kampanjerna.
    const spend = delat ? kampanjer.reduce((s, k) => s + (Number(k.spend) || 0), 0) : lage.vecka.spend;
    const kop = delat ? kampanjer.reduce((s, k) => s + (Number(k.kop) || 0), 0) : lage.vecka.kop;
    const intakt = kampanjer.reduce((s, k) => s + (k.roas ? k.spend * k.roas : 0), 0);
    const roas = delat ? (spend > 0 && intakt > 0 ? intakt / spend : null) : lage.vecka.roas;
    return { ...post, namn: post.namn ?? lage.namn, status: 'ok', valuta: lage.valuta, delat, lage, kampanjer, vecka: { spend, kop, roas }, idag: delat ? null : lage.idag };
  });

  const kundtjanst = (snapshot?.kundtjanst?.brands ?? []).filter((b) => (vm.kundtjanst ?? []).includes(b.id));
  const tvister = (snapshot?.oppnaTvister ?? []).filter((tv) => tillhor(vm.id, brandForKundtjanst(tv.brand)) && tv.oppen !== false)
    .map((tv) => ({ ...tv, kvar: tv.deadline ? Math.ceil((new Date(tv.deadline).getTime() - nu.getTime()) / DAG) : null }))
    .sort((a, b) => (a.kvar ?? 999) - (b.kvar ?? 999));
  // Tvistläget per butik ur Shopify (hamtaAllaTvister) — det som gör att
  // "inga öppna tvister" betyder att Shopify svarat, inte att ingen frågat.
  const tvistlage = (snapshot?.tvister?.butiker ?? []).filter((b) => tillhor(vm.id, brandForKundtjanst(b.id)));
  const leverans = (snapshot?.leverans?.butiker ?? []).filter((b) => (vm.leverans ?? []).includes(b.id));
  const rutiner = (snapshot?.rutiner?.rutiner ?? []).filter((r) => r.brand === vm.id);
  const rutinsummering = { ok: 0, sen: 0, saknas: 0, avstangd: 0, omatbar: 0 };
  for (const r of rutiner) rutinsummering[r.status] = (rutinsummering[r.status] ?? 0) + 1;
  const rutinhandelser = (snapshot?.rutiner?.handelser ?? []).filter((h) => h.brand === vm.id);

  const kanaler = (snapshot?.eskalering?.kanaler ?? []).filter((k) => k.brand === vm.id);
  const gransManniska = nu.getTime() - 2 * DAG;
  const manniskor48h = kanaler.flatMap((k) => k.meddelanden.filter((m) => !m.bot && new Date(m.tid).getTime() >= gransManniska).map((m) => ({ ...m, kanal: k.kanal, server: k.server, lank: k.lank, roll: k.roll })));

  const egnaHandelser = kalender.filter((h) => h.brand === vm.id);
  const harledda = harleddaHandelser({ snapshot, kontakter, nu, dagar: 30, brand: vm.id });
  const kontakterHar = kontakter.filter((k) => k.brand === vm.id);

  const beslut = (snapshot?.budgetlogg?.beslut ?? []).filter((b) => String(b.butik ?? '').split('/')[0] === vm.id || (vm.id === 'ops' && !HUVUDBRANDS.includes(String(b.butik ?? '').split('/')[0])));

  // Läget: rött om en tvist brådskar eller en rutin saknas, gult om något är
  // sent eller en människa skrivit i eskaleringskanalen, annars grönt.
  const bradskande = tvister.filter((tv) => !tv.besvarad && tv.kvar !== null && tv.kvar >= 0 && tv.kvar <= 3);
  let lage = 'bra';
  let lageord = 'allt rullar';
  if (rutinsummering.sen || manniskor48h.length) { lage = 'varning'; lageord = 'något att titta på'; }
  if (bradskande.length || rutinsummering.saknas) { lage = 'kritisk'; lageord = 'kräver dig'; }

  // Pingarna till VA:n (stonebite/larm.mjs) — det som faktiskt skickats, nyast först.
  const larm = (snapshot?.larm?.skickade ?? []).filter((l) => l.brand === vm.id).sort((a, b) => String(b.tid).localeCompare(String(a.tid)));

  // Autosvaret (kundtjanst/autosvar.mjs): loggens butiker som hör till varumärket.
  // Brandet i loggen är butiks-id:t — samma karta som tvisterna använder.
  const autosvarBrands = Object.fromEntries(Object.entries(snapshot?.autosvar?.brands ?? {}).filter(([id]) => tillhor(vm.id, brandForKundtjanst(id))));
  const autosvar = snapshot?.autosvar ? { ...snapshot.autosvar, brands: autosvarBrands } : null;
  const butiksnamn = (id) => butiker.find((b) => b.id === id)?.namn ?? (snapshot?.butiker ?? []).find((b) => b.id === id)?.namn ?? kundtjanst.find((b) => b.id === id)?.namn ?? id;

  return { vm, butiker, perValuta, konton, kundtjanst, tvister, tvistlage, bradskande, leverans, rutiner, rutinsummering, rutinhandelser, kanaler, manniskor48h, egnaHandelser, harledda, kontakter: kontakterHar, beslut, larm, autosvar, uppfoljning: snapshot?.uppfoljning ?? {}, butiksnamn, lage, lageord };
}

function tillhor(brandId, kundtjanstBrand) {
  if (!kundtjanstBrand) return false;
  if (brandId === 'ops') return !HUVUDBRANDS.includes(kundtjanstBrand);
  return brandId === kundtjanstBrand;
}

// ------------------------------------------------------------- index

export function varumarkenSida({ snapshot, varumarken, kalender = [], kontakter = [], nu = new Date() }) {
  const data = (varumarken ?? []).map((vm) => brandData(vm, snapshot, { nu, kalender, kontakter }));
  const kort = data.map((d) => {
    const salt = d.perValuta.map((v) => `${pengarKort(v.vecka.omsattning, v.valuta)}`).join(' · ');
    const spend = d.konton.filter((k) => k.status === 'ok');
    const spendText = spend.length ? spend.map((k) => pengarKort(k.vecka.spend, k.valuta)).join(' · ') : (d.vm.konton_saknas ? 'läses inte' : '–');
    const risk = d.kundtjanst[0]?.nyckeltal?.risk;
    const paVag = d.leverans.filter((b) => b.status === 'ok').reduce((s, b) => s + (b.paVag ?? 0), 0);
    const nasta = [...d.egnaHandelser.filter((h) => !h.klar && h.datum >= idag(nu)), ...d.harledda].sort((a, b) => (a.datum + (a.tid ?? '')).localeCompare(b.datum + (b.tid ?? '')))[0];
    const problem = d.rutinsummering.saknas + d.rutinsummering.sen;
    return `<a class="brandkort" href="/app/varumarke/${attr(d.vm.id)}">
      <div class="brandkort-huvud">
        <h3>${esc(d.vm.namn)}</h3>
        ${status(d.lage, t(d.lageord))}
      </div>
      <p class="under">${esc(d.vm.kort ?? '')}</p>
      <dl class="brandkort-rad">
        <div><dt>${esc(t('Sålt 7 d'))}</dt><dd>${salt || (d.vm.butiker_saknas ? esc(t('läses inte')) : '–')}</dd></div>
        <div><dt>${esc(t('Reklam 7 d'))}</dt><dd>${esc(spendText)}</dd></div>
        <div><dt>${esc(t('Kundtjänst'))}</dt><dd>${risk !== undefined ? `${tal(risk)}/100` : esc(t('ej kopplad'))}</dd></div>
        <div><dt>${esc(t('Paket på väg'))}</dt><dd>${d.leverans.length ? tal(paVag) : '–'}</dd></div>
        <div><dt>${esc(t('Rutiner'))}</dt><dd>${d.rutiner.length ? `${tal(d.rutinsummering.ok)} ✅${problem ? ` · ${tal(problem)} ⚠️` : ''}${d.rutinsummering.avstangd ? ` · ${tal(d.rutinsummering.avstangd)} ⏸` : ''}` : '–'}</dd></div>
        <div><dt>${esc(t('Eskalering 48 h'))}</dt><dd>${d.kanaler.length ? tal(d.manniskor48h.length) : esc(t('ej kopplad'))}</dd></div>
      </dl>
      ${nasta ? `<p class="mini mellan">${esc(t('Nästa'))}: ${esc(datumtext(nasta.datum, { nu }))}${nasta.tid ? ` ${esc(nasta.tid)}` : ''} — ${esc(nasta.titel)}</p>` : ''}
    </a>`;
  }).join('');

  const rutinsnap = snapshot?.rutiner;
  return {
    titel: 'Varumärken',
    innehall: `${sidhuvud({
      rubrik: 'Varumärken',
      under: 'Ett kort per verksamhet. Rött betyder att något kräver dig — klicka in.',
      farsk: snapshot?.byggd ? `${esc(t('Hämtat'))} <b>${esc(t(sedan(snapshot.byggd)))}</b>` : '',
    })}
    <div class="brandkort-rutnat">${kort}</div>
    ${rutinsnap ? block({
      titel: 'Rutinvakten — hela bolaget',
      under: 'Varje rutin ska lämna ett spår på main när den kört. Här är det senaste spåret mot schemat.',
      innehall: rutintabell(rutinsnap.rutiner ?? [], { nu, medBrand: true, varumarken, orsak: rutinsnap.orsak ?? null }),
    }) : ''}`,
  };
}

// ------------------------------------------------------------ brandsidan

export function varumarkeSida({ snapshot, vm, varumarken = [], flik = 'oversikt', kalender = [], kontakter = [], anvandare, csrf = '', manad = null, nu = new Date() }) {
  const d = brandData(vm, snapshot, { nu, kalender, kontakter });
  const vald = FLIKAR.some((f) => f.id === flik) ? flik : 'oversikt';
  const fliknav = `<nav class="flikar" aria-label="${attr(t('Flikar'))}">${FLIKAR.map((f) => (
    `<a class="flik" href="/app/varumarke/${attr(vm.id)}?flik=${f.id}"${f.id === vald ? ' aria-current="page"' : ''}>${esc(t(f.titel))}${markering(f.id, d)}</a>`
  )).join('')}</nav>`;

  const innehallPerFlik = {
    oversikt: () => flikOversikt(d, { nu }),
    butiker: () => flikButiker(d, { nu }),
    annonser: () => flikAnnonser(d, { nu }),
    kundtjanst: () => flikKundtjanst(d, { nu, csrf }),
    leverans: () => flikLeverans(d),
    rutiner: () => block({ titel: 'Rutinerna', under: 'Senaste spåret på main mot schemat. En rutin som tyst slutat köra syns här som "saknas".', innehall: d.rutiner.length ? rutintabell(d.rutiner, { nu, orsak: snapshot?.rutiner?.orsak ?? null }) : tomt('Inga rutiner registrerade', 'Det här varumärket har inga nattrutiner i stonebite/rutiner.json.') }),
    kontakter: () => flikKontakter(d, { csrf, nu }),
    kalender: () => kalenderBlock({ handelser: d.egnaHandelser, harledda: d.harledda, brand: vm.id, csrf, nu, manad, nasta: `/app/varumarke/${vm.id}?flik=kalender`, anvandare, rubrik: `${vm.namn}s kalender` }),
  };

  return {
    titel: vm.namn,
    innehall: `${sidhuvud({
      rubrik: vm.namn,
      under: vm.kort ?? '',
      farsk: `${status(d.lage, t(d.lageord))}`,
    })}
    <p class="mini" style="margin:-14px 0 18px"><a href="/app/varumarken">← ${esc(t('Alla varumärken'))}</a></p>
    ${fliknav}
    ${innehallPerFlik[vald]()}`,
  };
}

/** Liten siffra på fliken när något väntar där. */
function markering(flik, d) {
  const n = flik === 'kundtjanst' ? d.bradskande.length + d.manniskor48h.length
    : flik === 'rutiner' ? d.rutinsummering.saknas + d.rutinsummering.sen
      : flik === 'kalender' ? d.egnaHandelser.filter((h) => !h.klar && h.datum <= idag()).length
        : 0;
  return n ? ` <span class="flik-tal">${n}</span>` : '';
}

// ---------------------------------------------------------------- flikar

function flikOversikt(d, { nu }) {
  const dag0 = idag(nu);
  const korten = [
    ...d.perValuta.map((v) => kort({
      etikett: `Sålt 7 d · ${v.valuta}`,
      varde: pengar(Math.round(v.vecka.omsattning), v.valuta),
      forklaring: `${tal(v.vecka.ordrar)} ordrar i ${tal(v.butiker)} ${v.butiker === 1 ? 'butik' : 'butiker'}. I dag hittills: ${v.idag ? pengar(Math.round(v.idag.omsattning), v.valuta) : '–'}.`,
      jamfor: forandring(v.vecka.omsattning, v.forraVeckan.omsattning),
      serie: v.serie,
    })),
    ...(d.perValuta.length ? [] : [kort({ etikett: 'Sålt 7 d', text: true, varde: t('Läses inte'), forklaring: d.vm.butiker_saknas ?? (d.butiker.length ? `${d.butiker.length} butiker svarade inte.` : 'Inga butiker kopplade.') })]),
    ...d.konton.filter((k) => k.status === 'ok').map((k) => kort({
      etikett: `Reklam 7 d · ${k.namn}`,
      varde: pengarKort(k.vecka.spend, k.valuta),
      forklaring: `${tal(k.vecka.kop)} köp, ROAS ${roasText(k.vecka.roas)}.${k.delat ? ' Delat konto — bara det här varumärkets kampanjer räknas.' : ''}`,
      serie: k.delat ? null : k.lage.serie,
    })),
    ...(d.konton.some((k) => k.status !== 'ok') ? [kort({ etikett: 'Annonskonto', text: true, varde: t('Läses inte'), forklaring: d.vm.konton_saknas ?? 'Kontot lästes inte vid senaste hämtningen.', status: status('varning', 'ej kopplat') })] : []),
    ...d.kundtjanst.map((b) => kort({
      etikett: `Kundtjänst · ${b.namn}`,
      varde: `${tal(b.nyckeltal?.risk ?? null)}/100`,
      forklaring: `${tal(b.nyckeltal?.obesvarade ?? null)} obesvarade av ${tal(b.nyckeltal?.arenden ?? null)} ärenden på ${b.period?.dagar ?? 30} dagar.`,
      status: status((b.nyckeltal?.risk ?? 0) >= 50 ? 'kritisk' : (b.nyckeltal?.risk ?? 0) >= 25 ? 'varning' : 'bra', (b.nyckeltal?.risk ?? 0) >= 50 ? 'hög risk' : (b.nyckeltal?.risk ?? 0) >= 25 ? 'medel' : 'lugnt'),
    })),
    ...(d.leverans.filter((b) => b.status === 'ok').length ? [kort({
      etikett: 'Paket på väg',
      varde: tal(d.leverans.filter((b) => b.status === 'ok').reduce((s, b) => s + (b.paVag ?? 0), 0)),
      forklaring: `${tal(d.leverans.filter((b) => b.status === 'ok').reduce((s, b) => s + (b.paket ?? 0), 0))} paket följs i ${d.leverans.length} ${d.leverans.length === 1 ? 'butik' : 'butiker'}.`,
    })] : []),
  ].join('');

  // Kräver dig: det som faktiskt behöver en människa, i ordning.
  const kraver = [
    ...d.bradskande.map((tv) => ({ ton: 'kritisk', text: `${tvisttyp(tv.typ, sprak())} ${tv.order} — svar senast ${datumtext(tv.deadline, { nu })} (${pengar(tv.belopp, tv.valuta)})`, lank: '/app/kundtjanst' })),
    ...d.rutiner.filter((r) => r.status === 'saknas').map((r) => ({ ton: 'kritisk', text: `${r.namn}: ${r.ord}`, lank: `/app/varumarke/${d.vm.id}?flik=rutiner` })),
    ...d.rutiner.filter((r) => r.status === 'sen').map((r) => ({ ton: 'varning', text: `${r.namn}: ${r.ord}`, lank: `/app/varumarke/${d.vm.id}?flik=rutiner` })),
    ...d.manniskor48h.slice(0, 5).map((m) => ({ ton: 'varning', text: `#${m.kanal} · ${m.av}: ${m.text.slice(0, 140)}${m.text.length > 140 ? '…' : ''}`, lank: m.lank, extern: true })),
    ...d.egnaHandelser.filter((h) => !h.klar && h.datum <= dag0).map((h) => ({ ton: h.datum < dag0 ? 'varning' : 'neutral', text: `${h.datum < dag0 ? 'Försenat: ' : 'I dag: '}${h.titel}${h.tid ? ` kl ${h.tid}` : ''}`, lank: `/app/varumarke/${d.vm.id}?flik=kalender` })),
  ];

  const kommer = [...d.egnaHandelser.filter((h) => !h.klar && h.datum > dag0), ...d.harledda.filter((h) => h.datum >= dag0)]
    .filter((h) => h.datum <= plusDagar(dag0, 7))
    .sort((a, b) => (a.datum + (a.tid ?? '')).localeCompare(b.datum + (b.tid ?? '')))
    .slice(0, 10);

  const hande = [
    ...d.rutinhandelser.slice(0, 8).map((h) => ({ tid: h.tid, text: h.rubrik })),
    ...d.beslut.slice(0, 5).map((b) => ({ tid: `${b.datum}T00:00:00Z`, text: `Nattvakten: ${b.atgard} ${b.namn ?? ''} ${b.gammalt && b.nytt ? `${tal(b.gammalt)} → ${tal(b.nytt)} kr` : ''}` })),
  ].sort((a, b) => (a.tid < b.tid ? 1 : -1)).slice(0, 10);

  return `<div class="kort-rad">${korten}</div>
  <div class="tvakolumner">
    ${block({
      titel: 'Kräver dig',
      under: 'Det enda på sidan som behöver en människa.',
      innehall: kraver.length ? panel({ innehall: `<ul class="lista">${kraver.map((k) => `<li><span>${status(k.ton, k.ton === 'kritisk' ? t('nu') : t('titta'))}</span><span><a href="${attr(k.lank)}"${k.extern ? ' target="_blank" rel="noopener"' : ''}>${esc(k.text)}</a></span></li>`).join('')}</ul>` }) : tomt('Ingenting kräver dig just nu', 'Inga brådskande tvister, inga saknade rutiner, ingen har skrivit i eskaleringskanalen på två dygn.'),
    })}
    ${block({
      titel: 'Kommer hända',
      under: 'De närmaste sju dagarna — planerat och det systemet vet.',
      innehall: kommer.length ? panel({ innehall: `<ul class="lista">${kommer.map((h) => `<li><span class="tid">${esc(datumtext(h.datum, { nu }))}${h.tid ? `<br>${esc(h.tid)}` : ''}</span><span><span class="namn">${esc(h.titel)}</span>${h.kalla ? `<span class="bi">${esc(kallnamn(h.kalla))}</span>` : ''}</span></li>`).join('')}</ul>` }) : tomt('Ingenting planerat', 'Lägg in något under Kalender.'),
    })}
  </div>
  ${block({
    titel: 'Hände senast',
    under: 'Rutinernas spår och nattvaktens beslut, nyast först.',
    innehall: hande.length ? panel({ innehall: `<ul class="lista">${hande.map((h) => `<li><span class="tid">${esc(sedan(h.tid))}</span><span>${esc(h.text)}</span></li>`).join('')}</ul>` }) : tomt('Inga spår', 'Ingen rutin har lämnat ett spår för det här varumärket på 14 dagar.'),
  })}`;
}

/**
 * Varför listan är tom — ur Shopifys svar per butik, aldrig en gissning.
 * Lästa butiker ⇒ "Shopify visar inga öppna tvister" med tiden; olästa ⇒
 * orsaken, så att en tom lista aldrig ser ut som noll tvister.
 */
function tvisterTomt(d) {
  const lasta = d.tvistlage.filter((b) => b.status === 'ok' || b.status === 'saknas');
  const olasta = d.tvistlage.filter((b) => !lasta.includes(b));
  if (!d.tvistlage.length) return tomt('Inga öppna tvister', 'Tvisterna har inte lästs ur Shopify för det här varumärket.');
  if (!lasta.length) return tomt('Tvisterna är okända', `Shopify gick inte att läsa: ${olasta.map((b) => `${b.namn} (${String(b.orsak ?? '').slice(0, 140)})`).join('; ')}`);
  const nar = lasta.map((b) => b.hamtad).filter(Boolean).sort().pop();
  const text = `Shopify visar inga öppna tvister (${lasta.map((b) => b.namn).join(', ')}${nar ? `, läst ${sedan(nar)}` : ''}).`;
  return tomt('Inga öppna tvister', olasta.length ? `${text} Okända: ${olasta.map((b) => `${b.namn} (${String(b.orsak ?? '').slice(0, 100)})`).join('; ')}.` : text);
}

function tvistfot(lage) {
  const nar = lage.map((b) => b.hamtad).filter(Boolean).sort().pop();
  const olasta = lage.filter((b) => b.status !== 'ok' && b.status !== 'saknas');
  return `${nar ? `Läst direkt ur Shopify ${sedan(nar)}.` : 'Ur kundtjänstens veckorapport.'}${olasta.length ? ` Okända: ${olasta.map((b) => b.namn).join(', ')}.` : ''}`;
}

function kallnamn(kalla) {
  return { tvist: t('ur tvisterna'), rutin: t('rutin enligt schema'), kontakt: t('uppföljning av kontakt') }[kalla] ?? kalla;
}

function flikButiker(d, { nu }) {
  const lasbara = d.butiker.filter((b) => b.status === 'ok').sort((a, b) => b.vecka.omsattning - a.vecka.omsattning);
  const olasbara = d.butiker.filter((b) => b.status !== 'ok');
  return `${lasbara.length ? block({
    titel: 'Butikerna',
    under: 'Sju hela dygn mot veckan innan. Kurvan är 30 dagar. Valutor står var för sig.',
    innehall: panel({
      innehall: tabell(
        [{ titel: 'Butik' }, { titel: 'I dag', tal: true }, { titel: '7 dagar', tal: true }, { titel: 'Ordrar', tal: true }, { titel: 'Mot förra veckan', tal: true }, { titel: '30 dagar' }],
        lasbara.map((b) => {
          const j = forandring(b.vecka.omsattning, b.forraVeckan.omsattning);
          return `<tr>
            <td><span class="namn">${esc(b.namn)}</span><span class="bi">${esc(b.land || '')}${b.valuta ? ` · ${esc(b.valuta)}` : ''}${b.url ? ` · ${esc(String(b.url).replace(/^https?:\/\//, ''))}` : ''}</span></td>
            <td class="tal">${b.idag ? pengar(b.idag.omsattning, b.valuta) : '–'}</td>
            <td class="tal">${pengar(b.vecka.omsattning, b.valuta)}</td>
            <td class="tal">${tal(b.vecka.ordrar)}</td>
            <td class="tal">${j ? `<span class="delta ${j.riktning === 'upp' ? 'upp' : j.riktning === 'ner' ? 'ner' : ''}">${j.riktning === 'upp' ? '↑' : j.riktning === 'ner' ? '↓' : '→'} ${esc(j.text)}</span>` : '–'}</td>
            <td style="width:130px">${spark(b.serie, { titel: `${b.namn} 30 dagar` }) || ''}</td>
          </tr>`;
        }),
      ),
    }),
  }) : ''}
  ${olasbara.length || d.vm.butiker_saknas ? block({
    titel: 'Butiker vi inte kommer åt',
    innehall: panel({
      innehall: `<ul class="lista">${olasbara.map((b) => { const f = forklaraFel(b.orsak); return `<li><span>${status('varning', t('stängd dörr'))}</span><span><span class="namn">${esc(b.namn)}</span><span class="bi">${esc(f.text)}${f.atgard ? ` — ${esc(f.atgard)}` : ''}</span></span></li>`; }).join('')}
      ${d.vm.butiker_saknas ? `<li><span>${status('varning', t('ej kopplad'))}</span><span><span class="namn">${esc(d.vm.namn)}</span><span class="bi">${esc(d.vm.butiker_saknas)}</span></span></li>` : ''}</ul>`,
    }),
  }) : ''}
  ${!lasbara.length && !olasbara.length && !d.vm.butiker_saknas ? tomt('Inga butiker kopplade', 'Lägg butikens id i stonebite/varumarken.json.') : ''}`;
}

function flikAnnonser(d) {
  const ok = d.konton.filter((k) => k.status === 'ok');
  const kampanjer = ok.flatMap((k) => k.kampanjer).sort((a, b) => (b.vinstbidrag ?? -Infinity) - (a.vinstbidrag ?? -Infinity));
  return `${ok.length ? `<div class="kort-rad">${ok.map((k) => kort({
    etikett: k.namn,
    varde: pengarKort(k.vecka.spend, k.valuta),
    forklaring: `Reklam 7 dagar. ${tal(k.vecka.kop)} köp, ROAS ${roasText(k.vecka.roas)}.${k.delat ? ` Delat konto (${k.prefix ? `kampanjer med ${k.prefix.map((p) => p.replace(/_+$/, '')).join(', ')} i namnet` : `utom kampanjer med ${k.utom.map((p) => p.replace(/_+$/, '')).join(', ')} i namnet`}).` : ''}`,
    serie: k.delat ? null : k.lage.serie,
    fot: k.not ?? '',
  })).join('')}</div>` : ''}
  ${d.konton.filter((k) => k.status !== 'ok').length || d.vm.konton_saknas ? block({
    titel: 'Konton som inte går att läsa',
    innehall: panel({ innehall: `<ul class="lista">${d.konton.filter((k) => k.status !== 'ok').map((k) => `<li><span>${status('varning', t('ej kopplat'))}</span><span><span class="namn">${esc(k.namn ?? k.id)} <span class="mini">${esc(k.id)}</span></span><span class="bi">${esc(d.vm.konton_saknas ?? k.orsak ?? '')}</span></span></li>`).join('')}</ul>` }),
  }) : ''}
  ${block({
    titel: 'Kampanjerna, 7 dagar',
    under: 'Vinstbidrag = reklamkostnad × (ROAS ÷ break-even − 1). Aldrig ROAS ensamt. Under 300 kr eller 3 köp ställs ingen dom.',
    innehall: kampanjer.length ? panel({
      innehall: tabell(
        [{ titel: 'Kampanj' }, { titel: 'Reklam', tal: true }, { titel: 'Köp', tal: true }, { titel: 'ROAS', tal: true }, { titel: 'Vinstbidrag', tal: true }, { titel: 'Läge' }],
        kampanjer.map((k) => `<tr>
          <td><span class="namn">${esc(k.namn)}</span><span class="bi">${esc(k.konto)}${k.breakEvenRoas ? ` · break-even ${roasText(k.breakEvenRoas)}` : ''}</span></td>
          <td class="tal">${pengar(Math.round(k.spend), k.valuta)}</td>
          <td class="tal">${tal(k.kop)}</td>
          <td class="tal">${roasText(k.roas)}</td>
          <td class="tal">${k.vinstbidrag === null ? '–' : pengar(Math.round(k.vinstbidrag), k.valuta)}</td>
          <td>${!k.bedombar?.ok ? status('neutral', t('för lite data')) : k.breakEvenRoas === null ? status('neutral', t('ingen break-even')) : status(k.dom?.ton === 'bra' ? 'bra' : 'kritisk', k.dom?.ton === 'bra' ? t('tjänar pengar') : t('går back'))}</td>
        </tr>`),
      ),
    }) : tomt('Inga kampanjer med spend', ok.length ? 'Inget av kontona har kampanjer med spend för det här varumärket de senaste sju dagarna.' : (d.vm.konton_saknas ?? 'Inget annonskonto gick att läsa.')),
  })}`;
}

function flikKundtjanst(d, { nu, csrf = '' }) {
  const tvistrader = d.tvister.slice(0, 15).map((tv) => `<tr>
    <td><span class="namn">${esc(tv.order)}</span><span class="bi">${esc(tv.brand)} · ${esc(tvisttyp(tv.typ, sprak()))}</span></td>
    <td class="tal">${pengar(tv.belopp, tv.valuta)}</td>
    <td class="tal">${tv.deadline ? esc(datumtext(tv.deadline, { nu })) : '–'}</td>
    <td>${tv.kvar === null ? '–' : status(tv.kvar < 0 ? 'neutral' : tv.kvar <= 2 ? 'kritisk' : tv.kvar <= 4 ? 'varning' : 'neutral', tv.kvar < 0 ? t('passerad') : tv.kvar === 0 ? t('i dag') : `${tv.kvar} ${t(tv.kvar === 1 ? 'dag kvar' : 'dagar kvar')}`)}</td>
    <td>${tv.besvarad ? status('bra', t('besvarad')) : status('varning', t('obesvarad'))}</td>
  </tr>`);
  const kategorier = d.kundtjanst.flatMap((b) => (b.kategorier ?? []).slice(0, 8).map((c) => ({ ...c, svenska: kategorinamn(c.id, c.en) })));

  const eskalering = d.kanaler.length ? d.kanaler.filter((k) => k.roll === 'eskalering').concat(d.kanaler.filter((k) => k.roll !== 'eskalering')).map((k) => panel({
    titel: `#${k.kanal}`,
    under: `${k.server} · ${t(k.roll === 'eskalering' ? 'eskalering' : k.roll === 'annonser' ? 'annonser' : 'övrigt')}`,
    verktyg: `<a class="knapp liten tyst" href="${attr(k.lank)}" target="_blank" rel="noopener">${esc(t('Öppna i Discord'))}</a>`,
    innehall: k.meddelanden.length ? `<ul class="lista eskalering">${k.meddelanden.slice(0, 8).map((m) => `<li class="medd${m.bot ? ' bot' : ''}">
      <span class="tid">${esc(sedan(m.tid))}</span>
      <span><span class="namn">${esc(m.av)}${m.bot ? ` <span class="mini">${esc(t('bot'))}</span>` : ''}</span><span class="bi medd-text">${esc(m.text || (m.bilagor ? `[${m.bilagor} ${t('bilagor')}]` : ''))}</span></span>
    </li>`).join('')}</ul>` : tomt('Tyst', 'Inga meddelanden i kanalen.'),
  })).join('') : '';

  return `${d.kundtjanst.length ? `<div class="kort-rad">${d.kundtjanst.map((b) => kort({
    etikett: b.namn,
    varde: `${tal(b.nyckeltal?.risk ?? null)}/100`,
    forklaring: `${tal(b.nyckeltal?.obesvarade ?? null)} obesvarade av ${tal(b.nyckeltal?.arenden ?? null)} ärenden. Median svarstid ${tal(b.nyckeltal?.medianSvarstidTimmar ?? null)} h. ${tal(b.nyckeltal?.chargebacks ?? 0)} chargebacks på ${b.period?.dagar ?? 30} dagar.`,
    status: status((b.nyckeltal?.risk ?? 0) >= 50 ? 'kritisk' : (b.nyckeltal?.risk ?? 0) >= 25 ? 'varning' : 'bra', (b.nyckeltal?.risk ?? 0) >= 50 ? 'hög risk' : (b.nyckeltal?.risk ?? 0) >= 25 ? 'medel' : 'lugnt'),
    fot: b.kord ? `${t('Rapport körd')} ${sedan(b.kord)}` : '',
  })).join('')}</div>` : tomt('Kundtjänsten är inte kopplad', d.vm.kundtjanst_saknas ?? 'Ingen veckorapport för det här varumärket.')}
  ${block({
    titel: 'Öppna tvister',
    under: 'Minst tid kvar först. Chargebacks är de som faktiskt förloras — en obesvarad förfrågan eskalerar till chargeback.',
    innehall: d.tvister.length
      ? panel({ innehall: tabell([{ titel: 'Order' }, { titel: 'Belopp', tal: true }, { titel: 'Sista svarsdag', tal: true }, { titel: 'Tid kvar' }, { titel: 'Svar' }], tvistrader), fot: tvistfot(d.tvistlage) })
      : tvisterTomt(d),
  })}
  ${kategorier.length ? block({
    titel: 'Vanliga ärenden',
    under: 'Störst högar först, ur senaste veckorapporten. En hög som växer är något att fixa i butiken.',
    innehall: panel({ innehall: tabell([{ titel: 'Ärende' }, { titel: 'Antal', tal: true }, { titel: 'Obesvarade', tal: true }, { titel: 'Rutin finns' }], kategorier.map((c) => `<tr><td><span class="namn">${esc(c.svenska)}</span></td><td class="tal">${tal(c.antal)}</td><td class="tal">${tal(c.obesvarade)}</td><td>${c.sop === 'covered' ? status('bra', t('ja')) : status('varning', t('saknas'))}</td></tr>`)) }),
  }) : ''}
  ${autosvarBlock(d.autosvar, { nu, namnFor: d.butiksnamn, uppfoljning: d.uppfoljning, csrf, nasta: `/app/varumarke/${d.vm.id}?flik=kundtjanst#ai-boten` })}
  ${block({
    titel: 'Pingar till VA:n',
    under: 'Det som skickats till VA:n i Discord de senaste 30 dagarna. Ett ärende pingas en gång, aldrig två.',
    innehall: d.larm.length ? panel({ innehall: tabell(
      [{ titel: 'När' }, { titel: 'Typ' }, { titel: 'Kanal' }, { titel: 'Text' }],
      d.larm.slice(0, 20).map((l) => `<tr>
        <td class="tal"><span class="mini">${esc(sedan(l.tid))}</span></td>
        <td>${status(l.typ === 'tvist' ? 'kritisk' : 'varning', t(l.typ === 'tvist' ? 'tvist' : 'eskalering'))}</td>
        <td><span class="mini">#${esc(l.kanal ?? '')}</span></td>
        <td><span class="bi medd-text">${esc(String(l.text ?? '').replace(/<@\d+>\s*/g, ''))}</span></td>
      </tr>`),
    ) }) : tomt('Inga pingar än', 'Inget har behövt pingas — eller rutinen har inte kört larmsteget än.'),
  })}
  ${block({
    titel: 'Eskaleringskanalen',
    under: 'De senaste meddelandena i varumärkets Discord-kanaler, lästa vid senaste hämtningen. Människor först, botar därefter.',
    innehall: eskalering || tomt('Ingen Discord-kanal kopplad', d.vm.discord_saknas ?? 'Lägg servern och kanalerna i stonebite/varumarken.json.'),
  })}`;
}

function flikLeverans(d) {
  const ok = d.leverans.filter((b) => b.status === 'ok');
  return ok.length ? block({
    titel: 'Paketen',
    under: 'Varje paket får sin skanning inskriven i Shopify varje timme. Kunden ser samma data på butikens spårningssida.',
    innehall: panel({
      innehall: tabell(
        [{ titel: 'Butik' }, { titel: 'Paket', tal: true }, { titel: 'På väg', tal: true }, { titel: 'Framme', tal: true }, { titel: 'Utan skanning', tal: true }, { titel: 'Senaste rundan', tal: true }],
        ok.map((b) => `<tr>
          <td><span class="namn">${esc(b.namn)}</span>${b.url ? `<span class="bi">${esc(String(b.url).replace(/^https?:\/\//, ''))}</span>` : ''}</td>
          <td class="tal">${tal(b.paket)}</td><td class="tal">${tal(b.paVag)}</td><td class="tal">${tal(b.levererade)}</td><td class="tal">${tal(b.utanSkanning)}</td>
          <td class="tal"><span class="mini">${b.senasteKorning?.datum ? esc(sedan(b.senasteKorning.datum)) : b.senasteKorning ? esc(sedan(b.senasteKorning)) : '–'}</span></td>
        </tr>`),
      ),
    }),
  }) : tomt('Ingen spårning för varumärket', d.leverans.length ? (d.leverans[0].orsak ?? 'Spårningsrutinen har inte kört.') : 'Butiken finns inte i sparning/butiker.json.');
}

function flikKontakter(d, { csrf, nu }) {
  const dag0 = idag(nu);
  const aktiva = STATUSAR.filter((s) => s.aktiv).map((s) => s.id);
  const grupper = STATUSAR.map((s) => ({ ...s, rader: d.kontakter.filter((k) => k.status === s.id).sort((a, b) => (a.nastaDatum || '9999').localeCompare(b.nastaDatum || '9999')) })).filter((g) => g.rader.length);
  const val = (lista, valt) => lista.map((s) => `<option value="${attr(s.id)}"${s.id === valt ? ' selected' : ''}>${esc(s[sprak()] ?? s.sv)}</option>`).join('');
  const typval = Object.entries(KONTAKTTYPER).map(([id, n]) => `<option value="${attr(id)}">${esc(n[sprak()] ?? n.sv)}</option>`).join('');
  const nasta = `/app/varumarke/${d.vm.id}?flik=kontakter`;

  const formular = `<form method="post" action="/app/kontakter/ny" class="kontaktform">
    <input type="hidden" name="csrf" value="${attr(csrf)}"><input type="hidden" name="brand" value="${attr(d.vm.id)}"><input type="hidden" name="nasta" value="${attr(nasta)}">
    <label class="falt"><span>${esc(t('Namn'))}</span><input name="namn" required maxlength="120" placeholder="${attr(t('t.ex. @kanalnamn eller företaget'))}"></label>
    <label class="falt"><span>${esc(t('Typ'))}</span><select name="typ">${typval}</select></label>
    <label class="falt"><span>${esc(t('Plattform'))}</span><input name="plattform" maxlength="60" placeholder="TikTok, Instagram, YouTube, mejl …"></label>
    <label class="falt"><span>${esc(t('Länk'))}</span><input name="lank" maxlength="300" placeholder="https://"></label>
    <label class="falt"><span>${esc(t('Kontaktväg'))}</span><input name="kontakt" maxlength="200" placeholder="${attr(t('mejl eller DM-handle'))}"></label>
    <label class="falt"><span>${esc(t('Läge'))}</span><select name="status">${val(STATUSAR, 'att_kontakta')}</select></label>
    <label class="falt"><span>${esc(t('Nästa steg'))}</span><input name="nastaSteg" maxlength="200" placeholder="${attr(t('t.ex. skicka produkt, be om utkast'))}"></label>
    <label class="falt"><span>${esc(t('Följ upp senast'))}</span><input type="date" name="nastaDatum"></label>
    <label class="falt kontaktform-bred"><span>${esc(t('Anteckning'))}</span><input name="anteckning" maxlength="2000" placeholder="${attr(t('pris, villkor, vad som sagts'))}"></label>
    <div class="kontaktform-knapp"><button class="knapp" type="submit">${esc(t('Lägg till kontakt'))}</button></div>
  </form>`;

  const rad = (k) => `<li class="kontakt${aktiva.includes(k.status) ? '' : ' kontakt-inaktiv'}">
    <span class="kontakt-huvud">
      <span class="namn">${k.lank ? `<a href="${attr(k.lank)}" target="_blank" rel="noopener">${esc(k.namn)}</a>` : esc(k.namn)} <span class="tagg">${esc(typnamn(k.typ, sprak()))}</span>${k.plattform ? ` <span class="mini">${esc(k.plattform)}</span>` : ''}</span>
      <span class="bi">${k.kontakt ? `${esc(k.kontakt)} · ` : ''}${k.nastaSteg ? esc(k.nastaSteg) : esc(t('inget nästa steg'))}${k.nastaDatum ? ` · ${k.nastaDatum < dag0 ? `<b>${esc(t('försenat'))} ` : ''}${esc(datumtext(k.nastaDatum, { nu }))}${k.nastaDatum < dag0 ? '</b>' : ''}` : ''}${k.anteckning ? `<br>${esc(k.anteckning)}` : ''}</span>
    </span>
    <form method="post" action="/app/kontakter/andra" class="kontakt-andra">
      <input type="hidden" name="csrf" value="${attr(csrf)}"><input type="hidden" name="id" value="${attr(k.id)}"><input type="hidden" name="nasta" value="${attr(nasta)}">
      <select name="status" aria-label="${attr(t('Läge'))}">${val(STATUSAR, k.status)}</select>
      <input name="nastaSteg" value="${attr(k.nastaSteg ?? '')}" placeholder="${attr(t('Nästa steg'))}" maxlength="200">
      <input type="date" name="nastaDatum" value="${attr(k.nastaDatum ?? '')}">
      <button class="knapp liten tyst" type="submit">${esc(t('Spara'))}</button>
      <button class="knapp liten fara" type="submit" name="radera" value="1">${esc(t('Ta bort'))}</button>
    </form>
  </li>`;

  return `${block({
    titel: 'Ny kontakt',
    under: 'Influencers, UGC-kreatörer, leverantörer och partners. Nästa steg med datum dyker upp i kalendern av sig självt.',
    innehall: panel({ innehall: formular }),
  })}
  ${block({
    titel: 'Kontakterna',
    under: d.kontakter.length ? `${d.kontakter.length} ${t('kontakter')}. ${t('Aktiva först.')}` : '',
    innehall: grupper.length ? grupper.map((g) => panel({ titel: g[sprak()] ?? g.sv, under: `${g.rader.length}`, innehall: `<ul class="lista">${g.rader.map(rad).join('')}</ul>` })).join('') : tomt('Inga kontakter än', 'Lägg in den första ovan.'),
  })}`;
}

// ------------------------------------------------------------ rutintabell

export function rutintabell(rutiner, { nu = new Date(), medBrand = false, varumarken = [], orsak = null } = {}) {
  const brandnamn = (id) => varumarken.find((v) => v.id === id)?.namn ?? id ?? '';
  const ordning = { saknas: 0, sen: 1, ny: 2, ok: 3, omatbar: 4, avstangd: 5 };
  const sorterade = [...rutiner].sort((a, b) => (ordning[a.status] ?? 9) - (ordning[b.status] ?? 9) || String(a.schema?.tid ?? '').localeCompare(String(b.schema?.tid ?? '')));
  return panel({
    // Mätarens egen begränsning står ÖVER tabellen — en grund klon eller en
    // oläsbar logg får aldrig se ut som att rutinerna slutat köra.
    innehall: (orsak ? `<p class="varning-rad">${status('varning', t('Rutinvakten'))} ${esc(orsak)}</p>` : '') + tabell(
      [{ titel: 'Rutin' }, ...(medBrand ? [{ titel: 'Varumärke' }] : []), { titel: 'Schema' }, { titel: 'Senaste spår', tal: true }, { titel: 'Nästa', tal: true }, { titel: 'Läge' }],
      sorterade.map((r) => `<tr>
        <td><span class="namn">${esc(r.namn)}</span><span class="bi">${r.kommando ? `<code>${esc(r.kommando)}</code> · ` : ''}${esc(r.vad ?? '')}</span></td>
        ${medBrand ? `<td><span class="mini">${esc(brandnamn(r.brand))}</span></td>` : ''}
        <td><span class="mini">${esc(r.schematext ?? '')}</span></td>
        <td class="tal"><span class="mini">${r.senast ? esc(sedan(r.senast)) : '–'}</span></td>
        <td class="tal"><span class="mini">${r.nasta && r.status !== 'avstangd' ? esc(nastatext(r.nasta, nu)) : '–'}</span></td>
        <td>${status(RUTINTON[r.status] ?? 'neutral', t(RUTINORD[r.status] ?? r.status))}<span class="bi">${esc(r.ord ?? '')}</span></td>
      </tr>`),
    ),
    fot: `${t('Spåret är en commit på main. En rutin som saknar spår kan ändå ha kört utan att pusha — men då är dess resultat borta med containern.')}`,
  });
}

function nastatext(iso, nu) {
  const d = new Date(iso);
  const diff = d.getTime() - nu.getTime();
  const tid = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  if (diff < 0) return t('förfallen');
  if (diff < 60 * 60_000) return `${t('om')} ${Math.max(1, Math.round(diff / 60_000))} min`;
  if (d.toISOString().slice(0, 10) === nu.toISOString().slice(0, 10)) return `${t('i dag')} ${tid}`;
  return `${datumtext(iso, { nu })} ${tid}`;
}
