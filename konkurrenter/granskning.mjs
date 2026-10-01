// konkurrenter/granskning.mjs — Axels granskningsapp för ett ärende (2026-09-29):
// "jag kan swipa mellan anmälningarna, läsa igenom all text och bilderna … och så
// kan jag bara klicka ja eller nej … mejlet … fakturan kan jag granska här också …
// och sen så skickas det."
//
// Ett kort per Meta-anmälan, ett för mejlet med fakturan och ett för sms:et.
// Sidan (granskning-sida.html) sparar Axels svar i sin EGEN fil data/beslut.json
// med artifact-kapabiliteten (files-formen). Varje sparning är en ny version av
// artifacten, och den väcker sessionen som bevakar den. Sessionen läser svaret
// (attGora), skickar in det han sagt ja till och publicerar data/status.json —
// sidan skriver aldrig status och sessionen skriver aldrig beslut.
//
// Här ligger de rena delarna: kortens data, status ur ärendet, sms-texten, listan
// över vad som ska göras och sidans HTML. Allt nät och all sändning ligger i kor.mjs.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { formularVarden } from './anmal-skicka.mjs';
import { metaRad } from './brev.mjs';

export const SIDMALL = new URL('./granskning-sida.html', import.meta.url);
/** Platsen i brevets text där meningen om Meta-anmälningarna står; sidan byter den mot rätt antal. */
export const META_PLATS = '[[META]]';

const kort12 = (s) => createHash('sha256').update(String(s)).digest('hex').slice(0, 12);
const tal = (n) => Number(n).toLocaleString('sv-SE').replace(/[  ]/g, ' ');

/** "24 sep" eller "29 sep 14:05" i svensk tid. Ren. */
export function dagSv(iso, { tid = false } = {}) {
  if (!iso) return '';
  const d = new Date(String(iso).length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(+d)) return String(iso);
  const dag = d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' }).replace('.', '');
  if (!tid) return dag;
  return `${dag} ${d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' })}`;
}

/** Vad anmälans engelska beskrivning säger, på svenska, ur samma fält. Ren. */
export function sammanfattning(paket) {
  const d = paket?.falt?.contentDescription ?? '';
  const delar = [];
  const filmer = paket?.filmer ?? [];
  const k = d.match(/(\d+) still frames from different scenes of the reported video \(at ([^)]+)\)/);
  const p = d.match(/(\d+)% of the reported video's sampled frames match/);
  if (k && /video is a re-upload of our own ad film/.test(d)) delar.push(`Annonsens film är vår egen annons, uppladdad igen med samma klippning och vår text i bilden. ${k[1]} bildrutor ur olika scener (vid ${k[2]}) är identiska med våra, texten inräknad. Anmälan gäller vår klippning och vår text, inte filmklippen under texten.`);
  else if (k) delar.push(`Annonsens film är klippt ur ${filmer.length === 1 ? 'en av våra filmer' : `${filmer.length || 'flera'} av våra filmer`}. ${k[1]} bildrutor ur olika scener (vid ${k[2]}) är identiska med våra${p ? `, och ${p[1]} % av annonsens bildrutor matchar våra filmer` : ''}.`);
  const t = d.match(/(\d+) words of our advertising copy appear verbatim[\s\S]*?longest identical run is (\d+) consecutive words/);
  if (t) delar.push(`${t[1]} ord ur vår annonstext står ordagrant i annonsen, som längst ${t[2]} ord i följd.`);
  if (/image[s]? in the ad (?:is|are) our own copyrighted advertising image/.test(d)) {
    const baraNara = /near-identical, distance/.test(d) && !/(?<!near-)identical, distance/.test(d);
    delar.push(baraNara ? 'Bilden i annonsen är vår egen annonsbild, nästan identisk med vår (mätningen säger "near-identical", inte "identical").' : 'Bilden i annonsen är vår egen annonsbild.');
  }
  if (/our own advertising image with its text re-set in another language/.test(d)) delar.push('Bilden i annonsen är vår egen annonsbild med texten omsatt till deras språk. Bilden under texten är identisk med vår.');
  return delar.join(' ');
}

/** Fälten exakt som anmal-skicka.mjs skriver in dem i Metas formulär, med svenska etiketter. Ren. */
export function faltLista(paket, { land = 'Sweden' } = {}) {
  const v = formularVarden(paket, { land });
  // Vad exempellänken är, på svenska (Axel 2026-09-29: den ska vara vår annons i annonsbiblioteket, aldrig produktsidan).
  const o = (paket?.originaler ?? []).find((x) => x?.lank === v.original);
  const orgSv = o
    ? `vår annons ${o.film} i annonsbiblioteket${o.sida ? `, sidan ${o.sida}` : ''}${o.start ? `, igång sedan ${dagSv(o.start)}` : ''} — samma film, kontrollerad ruta för ruta`
    : /view_all_page_id=/.test(v.original ?? '') ? 'vår sidas alla annonser i annonsbiblioteket (ingen enskild annons hittad)' : undefined;
  return {
    fel: v.fel,
    falt: [
      { etikett: 'Typ av intrång', varde: v.ratt, sv: 'upphovsrätt' },
      { etikett: 'Plattform', varde: v.plattform },
      { etikett: 'Land där rätten gäller', varde: v.land },
      { etikett: 'Äger du rättigheten själv?', varde: v.ombud ? "No, but I'm authorised to represent the rights owner" : 'Yes', sv: v.ombud ? 'nej, du företräder bolaget som äger den' : 'ja' },
      { etikett: 'Rättighetsinnehavare', varde: v.rattighetshavare },
      { etikett: 'Annonsen som anmäls', varde: v.urls, lank: true },
      { etikett: 'Exempel på vårt original', varde: v.original, lank: true, ...(orgSv ? { sv: orgSv } : {}) },
      { etikett: `Beskrivning (${v.beskrivning.length} av 500 tecken)`, varde: v.beskrivning, lang: true },
      { etikett: 'Ditt namn', varde: v.namn },
      { etikett: 'E-post (engångskoden kommer hit)', varde: v.epost },
      { etikett: 'Elektronisk underskrift', varde: v.signatur },
    ],
  };
}

/**
 * Kortet för EN anmälan. `version` följer paketets innehåll: byggs anmälan om
 * (en lånad ruta utesluten, en ny bild) gäller ett gammalt ja/nej inte längre. Ren.
 */
export function kortAnmalan(rapport, paket, { annons = null, bild = null, land = 'Sweden' } = {}) {
  const { falt, fel } = faltLista(paket, { land });
  return {
    nyckel: `anmalan-${rapport.nr}`,
    typ: 'anmalan',
    nr: rapport.nr,
    antal: paket.antal ?? null,
    // Versionen följer det Axel SER — även texten som räknas fram ur fälten (500-teckensbeskrivningen): ändras koden efter hans ja gäller ja:t inte.
    version: kort12(JSON.stringify({ falt: paket.falt, bild: paket.bevisbildUrl ?? null, filmer: paket.filmer ?? [], visat: falt.map((f) => f.varde) })),
    annonsNr: paket.annonsNr ?? annons?.nr ?? null,
    lank: paket.lank,
    exponeringar: paket.exponeringar ?? annons?.exponeringar ?? null,
    start: annons?.start ?? null,
    aktiv: annons?.aktiv ?? null,
    produkt: paket.produkt ?? null,
    grund: paket.grund ?? null,
    filmer: paket.filmer ?? [],
    sammanfattning: sammanfattning(paket),
    ansprak: paket.ansprak ?? null,
    bild,
    bildUrl: paket.bevisbildUrl ?? null,
    formular: paket.formular ?? null,
    falt,
    fel,
    forsakran: paket.falt?.declarations ?? [],
  };
}

/**
 * Kortet för mejlet. Brevet byggs med ALLA anmälningar; meningen om Meta byts mot
 * META_PLATS och `meta[n]` bär meningen för n ja — sidan visar den som gäller för
 * Axels svar, och sändningen bygger brevet med --anmalan-antal n (samma text). Ren.
 */
export function kortMejl({ brev, faktura, fran, franNot = null, antalByggda = 0, baraAktiva = false, bild = null }) {
  const sprak = brev.sprak ?? 'sv';
  const alla = metaRad({ n: antalByggda, antal: antalByggda, baraAktiva, sprak });
  const harMeta = Boolean(alla) && brev.text.includes(alla);
  const text = harMeta ? brev.text.replace(alla, META_PLATS) : brev.text;
  const meta = harMeta ? Array.from({ length: antalByggda + 1 }, (_, n) => metaRad({ n, antal: antalByggda, baraAktiva, sprak })) : null;
  const f = faktura ?? null;
  return {
    nyckel: 'mejl',
    typ: 'mejl',
    version: kort12([fran, brev.mottagare, brev.amne.replace(/\d/g, '#'), text.replace(/\d/g, '#'), f?.nr ?? '', f?.brutto ?? ''].join('\n')),
    fran,
    franNot,
    till: brev.mottagare ?? null,
    amne: brev.amne,
    text,
    meta,
    antalByggda,
    sprak,
    faktura: f ? { nr: f.nr, brutto: f.brutto, netto: f.netto, moms: f.moms, momsProcent: f.momsProcent ?? null, valuta: f.valuta ?? 'SEK', forfaller: f.forfaller, exponeringar: f.exponeringar ?? null, cpm: f.cpm?.sek ?? null, fil: f.fil ? f.fil.split('/').pop() : null, bild } : null,
  };
}

/**
 * Kortet för Shopify-anmälan (vårt material på deras egen sajt, shopify-anmalan.mjs). Fälten står som
 * Cowork skriver in dem i Shopifys formulär, med svenska etiketter. `version` följer innehållet. Ren.
 */
export function kortShopify(s, paket, { bild = null } = {}) {
  const f = paket?.falt ?? {};
  const falt = [
    { etikett: 'Butiken som anmäls', varde: f.butik, lank: true },
    { etikett: 'Sidan och filen med vårt material', varde: (f.sidor ?? []).join('\n'), lank: true },
    { etikett: 'Vårt verk', varde: f.verk, lang: true },
    { etikett: 'Var originalet finns', varde: (f.original ?? []).join('\n'), lank: true },
    { etikett: 'Bevisbilden', varde: f.bevis ?? 'ingen länk (bara bilagan)', lank: Boolean(f.bevis) },
    { etikett: 'Rättighetshavare', varde: f.foretag },
    { etikett: 'Din roll', varde: f.rollTillVerket, sv: 'du företräder bolaget som äger rätten' },
    { etikett: 'Ditt namn', varde: `${f.namn ?? ''}${f.titel ? `, ${f.titel}` : ''}` },
    { etikett: 'E-post', varde: f.epost },
    { etikett: 'Telefon', varde: f.telefon ?? 'tomt (Cowork frågar dig om formuläret kräver ett nummer)' },
    { etikett: 'Adress', varde: f.adress },
    { etikett: 'Elektronisk underskrift', varde: f.signatur },
  ];
  return {
    nyckel: 'shopify',
    typ: 'shopify',
    version: kort12(JSON.stringify({ falt: paket?.falt ?? null, bild: paket?.bevisbildUrl ?? null, forsakringar: paket?.forsakringar ?? [] })),
    butik: f.butik ?? null,
    sida: paket?.sida ?? null,
    film: paket?.film ?? null,
    matt: paket?.matt ?? null,
    bild,
    bildUrl: paket?.bevisbildUrl ?? null,
    formular: paket?.formular ?? null,
    falt,
    fel: paket?.fel ?? [],
    forsakran: paket?.forsakringar ?? [],
    status: s?.status ?? null,
  };
}

/**
 * Hela sidans data. `not` = en mening under ingressen (t.ex. varför rundan saknar
 * mejl: brevet gick redan i ett annat ärende mot samma sida). Ren.
 */
export function byggGranskning({ a, kort, byggd = new Date().toISOString(), not = null }) {
  const d = a.deras ?? {};
  return { arende: a.id, verksamhet: a.verksamhet ?? null, deras: { sidnamn: d.sidnamn ?? null, sidaId: d.sidaId ?? null, doman: d.doman ?? null, epost: (d.epost ?? [])[0] ?? null }, land: a.land ?? null, byggd, not: not ?? null, kort };
}

/**
 * Meningen när en runda bara är anmälningar: vilket ärende mot samma Facebook-sida
 * som redan bär brevet (senast skickat vinner). null när inget brev gått. Ren.
 */
export function mejlRedanNot(a, andra) {
  const sida = a?.deras?.sidaId;
  if (!sida) return null;
  const fore = [...(andra ?? [])].filter((x) => x.id !== a.id && x.deras?.sidaId === sida && x.brev?.skickat?.nar)
    .sort((x, y) => String(y.brev.skickat.nar).localeCompare(String(x.brev.skickat.nar)))[0];
  if (!fore) return null;
  return `Inget nytt mejl i den här rundan: brevet och fakturan till ${a.deras?.sidnamn ?? 'dem'} gick redan i ${fore.id} (${dagSv(fore.brev.skickat.nar, { tid: true })}). Här är bara anmälningarna.`;
}

/**
 * Läget per kort ur ärendet: inskickade anmälningar (kvittot) och skickat brev.
 * `pagar` = nycklar sessionen arbetar med just nu, `fel` = { nyckel: text }. Ren.
 */
export function statusFor(a, { pagar = [], fel = {}, notis = null, sms = null, nu = new Date().toISOString() } = {}) {
  const kort = {};
  for (const r of a.anmalan?.rapporter ?? []) {
    const n = `anmalan-${r.nr}`;
    if (r.status === 'inskickad') kort[n] = { lage: 'inskickad', referens: r.referens ?? null, nar: r.inskickad ?? null };
  }
  if (a.brev?.skickat) kort.mejl = { lage: 'skickad', nar: a.brev.skickat.nar ?? null, till: a.brev.skickat.till ?? a.brev.mottagare ?? null, fran: a.brev.skickat.fran ?? null };
  if (a.shopify?.status === 'inskickad') kort.shopify = { lage: 'inskickad', referens: a.shopify.referens ?? null, nar: a.shopify.inskickad ?? null };
  for (const n of pagar) if (!kort[n]) kort[n] = { lage: 'pagar', nar: nu };
  for (const [n, text] of Object.entries(fel)) if (!kort[n]) kort[n] = { lage: 'fel', text: String(text).slice(0, 400), nar: nu };
  return { uppdaterad: nu, notis: notis ?? null, kort, sms: sms ? { text: sms } : null };
}

/**
 * Sms-texten ur ärendets mall (arenden/<id>/sms-mall.txt) och fakturan som
 * faktiskt gick ut. Platshållare: {{FAKTURA_NR}}, {{BELOPP}}, {{EXPONERINGAR}},
 * {{FORFALLER}} och {{META}} (meningen om Meta, tom när inget anmäls). Ren.
 */
export function smsText(mall, { faktura, n, antal }) {
  const forfaller = faktura?.forfaller ? new Date(`${faktura.forfaller}T12:00:00Z`).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }) : '';
  const meta = n > 0
    ? (n >= antal ? (n === 1 ? 'Den aktiva annonsen anmäls till Meta för upphovsrättsintrång.' : `De ${n} aktiva annonserna anmäls till Meta för upphovsrättsintrång, en anmälan per annons.`)
      : `${n} av de ${antal} aktiva annonserna anmäls till Meta för upphovsrättsintrång${n > 1 ? ', en anmälan per annons' : ''}.`)
    : '';
  return String(mall)
    .replaceAll('{{FAKTURA_NR}}', faktura?.nr ?? '')
    .replaceAll('{{BELOPP}}', faktura?.brutto !== undefined ? `${tal(faktura.brutto)} kr` : '')
    .replaceAll('{{EXPONERINGAR}}', faktura?.exponeringar !== undefined && faktura?.exponeringar !== null ? tal(faktura.exponeringar) : '')
    .replaceAll('{{FORFALLER}}', forfaller)
    .replaceAll('{{META}}', meta)
    .replace(/ {2,}/g, ' ')
    .replace(/ +\n/g, '\n')
    .trim();
}

/**
 * Vad sessionen ska göra med Axels svar. Ett svar gäller bara kortets AKTUELLA
 * version. Mejlet går först när varje anmälan har ett svar — brevet säger hur
 * många som anmäls. Aldrig något som redan är inskickat, skickat eller pågår. Ren.
 */
export function attGora({ granskning, beslut, status }) {
  const svar = beslut?.svar ?? {};
  const st = status?.kort ?? {};
  const aktuellt = (k) => { const s = svar[k.nyckel]; return s && s.version === k.version ? s : null; };
  const klar = (k) => ['inskickad', 'skickad'].includes(st[k.nyckel]?.lage);
  const pagar = (k) => st[k.nyckel]?.lage === 'pagar';
  const anm = (granskning?.kort ?? []).filter((k) => k.typ === 'anmalan');
  const anmalningar = anm.filter((k) => aktuellt(k)?.svar === 'ja' && !klar(k) && !pagar(k)).map((k) => k.nr);
  const nej = (granskning?.kort ?? []).filter((k) => aktuellt(k)?.svar === 'nej' && !klar(k)).map((k) => ({ nyckel: k.nyckel, nr: k.nr ?? null, not: String(aktuellt(k).not ?? '').slice(0, 2000), nar: aktuellt(k).nar ?? null }));
  const obesvarade = anm.filter((k) => !aktuellt(k) && !klar(k)).map((k) => k.nr);
  const jaAntal = anm.filter((k) => st[k.nyckel]?.lage === 'inskickad' || aktuellt(k)?.svar === 'ja').length;
  const mk = (granskning?.kort ?? []).find((k) => k.typ === 'mejl');
  let mejl = null; let mejlVantar = null;
  if (mk && aktuellt(mk)?.svar === 'ja' && !klar(mk) && !pagar(mk)) {
    if (obesvarade.length) mejlVantar = `${obesvarade.length} anmälning(ar) saknar svar (nr ${obesvarade.join(', ')})`;
    else mejl = { antal: jaAntal, av: anm.length };
  }
  const sk = (granskning?.kort ?? []).find((k) => k.typ === 'shopify');
  const shopify = Boolean(sk && aktuellt(sk)?.svar === 'ja' && !klar(sk) && !pagar(sk));
  const gamla = Object.keys(svar).filter((n) => { const k = (granskning?.kort ?? []).find((x) => x.nyckel === n); return k && svar[n].version !== k.version; });
  return { anmalningar, mejl, mejlVantar, nej, obesvarade, jaAntal, gamla, shopify };
}

/**
 * Sidans HTML: mallen med kortens data inbakad (säker i ett script-block) och titeln
 * "Anmälningar <ärende>" (stod låst på KD-2026-001 tills den norska rundan). Ren utom läsningen av mallen.
 */
export function sidaHtml(granskning, { mall = readFileSync(SIDMALL, 'utf8') } = {}) {
  const json = JSON.stringify(granskning).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  if (!mall.includes('__GRANSKNING__')) throw new Error('sidmallen saknar __GRANSKNING__');
  const titel = `Anmälningar ${granskning?.arende ?? ''}`.trim().replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  return mall.replace('__TITEL__', () => titel).replace('__GRANSKNING__', () => json);
}
