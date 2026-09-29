// konkurrenter/annonsfall.mjs — ärendet ur konkurrentens ANNONSER (Axels
// fall 2026-09-29: "han har snott asmycket ads … men han har ingenting på
// hemsidan"). Metas annonsbibliotek går inte att läsa härifrån, så Axel (eller
// sessionen) skriver ner annonserna: länken, texten, ev. bilder/skärmdumpar.
// Här jämförs de mot ALLA våra annonstexter och produkttexter, och bilderna
// mot våra annonsbilder. Rena funktioner — hämtning och hashning sker i kor.mjs.
//
// Indata (konkurrenter/output/<datum>.annonser.json, eller valfri fil med --annonser):
// {
//   "deras": { "sidnamn": "Kopian", "sida_id": "1299101096626433", "doman": "kopian.se", "url": "https://kopian.se", "mottagare": "info@kopian.se", "foretag": "Kopian AB", "orgnr": "556677-8899" },
//   "annonser": [
//     { "lank": "https://www.facebook.com/ads/library/?id=…", "text": "…deras primärtext…", "rubrik": "…", "bilder": ["https://…/bild.jpg", "/sökväg/skärmdump.png"], "video": true, "start": "2026-09-01", "exponeringar": "12 345" }
//   ]
// }
//
// `exponeringar` (även `rackvidd`/`reach`/`visningar`, tal eller "12,3 tn") är
// det Axel läser av i annonsbibliotekets EU-ruta ("Total reach") — fakturan
// räknar exponeringar × vår CPM per annons (faktura.mjs). Utan tal: schablon.

import { jamforText, jamforBilder, sammanvag } from './likhet.mjs';
import { nyckelFor } from './arenden.mjs';
import { domanUr } from './sok.mjs';

/**
 * Ett antal som Axel skrivit av: 12345, "12 345", "12,3 tn", "12.3K", "1,2 M".
 * null när det inte går att läsa. Ren.
 */
export function tolkaAntal(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? Math.round(v) : null;
  const s = String(v).trim().toLowerCase().replace(/\s+/g, '');
  const m = s.match(/^([\d.,]+)(k|tn|tusen|m|mn|milj(?:oner)?)?$/);
  if (!m) return null;
  let tal = m[1];
  // "12,3" och "12.3" är decimaler när det står ett suffix; "12.345"/"12,345" utan suffix är tusental.
  if (m[2]) tal = tal.replace(',', '.'); else tal = tal.replace(/[.,]/g, '');
  const n = Number(tal);
  if (!Number.isFinite(n) || n <= 0) return null;
  const faktor = !m[2] ? 1 : /^(k|tn|tusen)$/.test(m[2]) ? 1000 : 1_000_000;
  return Math.round(n * faktor);
}

/** Exponeringarna ur en annonsrad — Ad Library-rutans "Total reach"/räckvidd eller riktiga visningar. Ren. */
export function exponeringarUr(a) {
  for (const nyckel of ['exponeringar', 'visningar', 'impressions', 'rackvidd', 'räckvidd', 'reach', 'total_reach']) {
    const n = tolkaAntal(a?.[nyckel]);
    if (n) return { antal: n, kalla: nyckel };
  }
  return { antal: null, kalla: null };
}

/**
 * Live eller inte, som läsaren/Axel skrev det: `aktiv` (bool), `is_active`,
 * eller `status` "active"/"inactive". null = okänt, räknas som live (en annons
 * Axel klistrar in ur listan "aktiva" är live). Ren.
 */
export function aktivUr(a) {
  if (typeof a?.aktiv === 'boolean') return a.aktiv;
  if (typeof a?.is_active === 'boolean') return a.is_active;
  const s = String(a?.status ?? a?.aktiv ?? '').trim().toLowerCase();
  if (/^(aktiv|active|live|ja|yes)$/.test(s)) return true;
  if (/^(inaktiv|inactive|paus(ad|ed)?|nej|no|avslutad|ended)$/.test(s)) return false;
  return null;
}

const fmtSv = (n) => Number(n).toLocaleString('sv-SE').replace(/[  ]/g, ' ');
const fmtEn = (n) => Number(n).toLocaleString('en-GB');

/**
 * AXELS KRITERIER (2026-09-29) för när en Facebook-sida är värd att jaga:
 * minst EN av de kopierande annonserna har ÖVER `min_rackvidd_en_annons` i
 * räckvidd, ELLER minst `min_antal_live` av dem är live. Räknas bara på
 * annonserna som återger VÅRT material — "en general store som kör massa
 * ads, men bara en annons på min produkt med hundra reach" är inte värd att
 * ta ner. Under tröskeln: inget ärende, inget brev, ingen faktura, inga
 * anmälningar. Okänd räckvidd är okänd — den räknas aldrig som över. Ren.
 */
export function vardAttJaga(traffar, trosk = {}) {
  const minRackvidd = Number(trosk?.min_rackvidd_en_annons ?? 10000);
  const minLive = Number(trosk?.min_antal_live ?? 10);
  const live = traffar.filter((t) => t.aktiv !== false);
  const medTal = traffar.filter((t) => Number(t.exponeringar) > 0);
  const storst = medTal.reduce((b, t) => (!b || t.exponeringar > b.exponeringar ? t : b), null);
  const maxRackvidd = storst?.exponeringar ?? null;
  const viaRackvidd = maxRackvidd !== null && maxRackvidd > minRackvidd;
  const viaAntal = live.length >= minLive;
  const utanRackvidd = traffar.length - medTal.length;
  const vard = viaRackvidd || viaAntal;
  let orsak; let orsakEn;
  if (viaRackvidd) { orsak = `annons ${storst.nr} har ${fmtSv(maxRackvidd)} i räckvidd (över ${fmtSv(minRackvidd)})`; orsakEn = `ad ${storst.nr} reached ${fmtEn(maxRackvidd)} people (over ${fmtEn(minRackvidd)})`; }
  else if (viaAntal) { orsak = `${live.length} kopierande annonser live (minst ${minLive})`; orsakEn = `${live.length} copying ads live (at least ${minLive})`; }
  else {
    orsak = `${live.length} kopierande annons(er) live (färre än ${minLive}) och största räckvidden ${maxRackvidd !== null ? fmtSv(maxRackvidd) : 'okänd'} (inte över ${fmtSv(minRackvidd)})${utanRackvidd ? ` — ${utanRackvidd} annons(er) utan räckvidd` : ''}`;
    orsakEn = `${live.length} copying ad(s) live (fewer than ${minLive}) and the largest reach ${maxRackvidd !== null ? fmtEn(maxRackvidd) : 'unknown'} (not over ${fmtEn(minRackvidd)})${utanRackvidd ? ` — ${utanRackvidd} ad(s) without a reach figure` : ''}`;
  }
  return { vard, viaRackvidd, viaAntal, live: live.length, annonser: traffar.length, maxRackvidd, storstNr: storst?.nr ?? null, utanRackvidd, minRackvidd, minLive, orsak, orsakEn };
}

/** Läser och kontrollerar indatafilen. Kastar med klartext om något saknas. Ren. */
export function tolkaAnnonsinput(data) {
  const deras = data?.deras ?? {};
  const annonser = Array.isArray(data?.annonser) ? data.annonser : [];
  const doman = deras.doman ? String(deras.doman).toLowerCase().replace(/^www\./, '') : (deras.url ? domanUr(deras.url) : null);
  if (!deras.sidnamn && !doman) throw new Error('annonsfilen saknar deras.sidnamn och deras.doman — en av dem behövs.');
  const rader = annonser
    .map((a, i) => { const e = exponeringarUr(a); return { nr: i + 1, lank: a.lank ?? null, text: String(a.text ?? '').trim(), rubrik: String(a.rubrik ?? '').trim(), bilder: Array.isArray(a.bilder) ? a.bilder.filter(Boolean) : [], video: Boolean(a.video), start: a.start ?? null, slut: a.slut ?? null, aktiv: aktivUr(a), exponeringar: e.antal, exponeringarKalla: e.kalla }; })
    .filter((a) => a.text || a.bilder.length);
  if (!rader.length) throw new Error('annonsfilen har inga annonser med text eller bilder.');
  // Landet annonsbiblioteket lästes för (adlibrary.mjs skriver det i filen) — ett norskt fynd är ett eget ärende.
  const land = typeof data?.land === 'string' && /^[A-Z]{2}$/.test(data.land) ? data.land : null;
  return { deras: { ...deras, doman, url: deras.url ?? (doman ? `https://${doman}` : null) }, annonser: rader, land };
}

/**
 * Bästa träffen för EN av deras annonser: mot våra annonstexter (min 6 ord i
 * följd) och mot produkttexterna. Returnerar { text, varAnnons, produkt, bilder }.
 */
export function jamforAnnons(a, { egnaAnnonser, egnaProdukter, konfig, derasHashar = new Map(), egnaHashar = new Map() }) {
  const trosk = { ...konfig.trosklar.text, min_passage: 6, trolig_langsta: 7 };
  const text = `${a.rubrik}\n${a.text}`.trim();
  let basta = null;
  if (text) {
    for (const e of egnaAnnonser) {
      const egen = `${e.rubrik ?? ''}\n${e.text ?? ''}`.trim();
      if (egen.split(/\s+/).length < 6) continue;
      const j = jamforText(egen, text, { trosklar: trosk, generiska: konfig.generiska_fraser });
      if (!j.styrka) continue;
      if (!basta || j.langsta > basta.text.langsta) basta = { text: j, varAnnons: { id: e.id, namn: e.namn, text: e.text, bild: e.bild, handle: e.handle, verksamhet: e.verksamhet }, produkt: null };
    }
    for (const p of egnaProdukter) {
      const j = jamforText(p.text, text, { trosklar: trosk, generiska: konfig.generiska_fraser });
      if (!j.styrka) continue;
      if (!basta || j.langsta > basta.text.langsta) basta = { text: j, varAnnons: null, produkt: { handle: p.handle, titel: p.titel, url: p.url, butik: p.butik, verksamhet: p.verksamhet, bilder: (p.bilder ?? []).slice(0, 12) } };
    }
  }
  // Bilderna: deras annonsbilder mot våra annonsbilder + den träffade produktens bilder.
  // Varje bildträff bär VÅR annons (id, namn, produkt) — anmälan per annons pekar på rätt original.
  const deras = a.bilder.map((u) => ({ url: u, hash: derasHashar.get(u)?.hash })).filter((x) => x.hash);
  const egnaBilder = [...egnaAnnonser.map((e) => e.bild).filter(Boolean), ...(basta?.produkt?.bilder ?? [])].map((u) => ({ url: u, hash: egnaHashar.get(u)?.hash })).filter((x) => x.hash);
  const bilder = jamforBilder(egnaBilder, deras, konfig.trosklar.bild).map((b) => { const e = egnaAnnonser.find((x) => x.bild === b.egen); return e ? { ...b, egenAnnons: { id: e.id, namn: e.namn, handle: e.handle ?? null, verksamhet: e.verksamhet ?? null } } : b; });
  const varAnnons = basta?.varAnnons ?? bilder.find((b) => b.egenAnnons)?.egenAnnons ?? null;
  const produkt = basta?.produkt ?? produktRad(varAnnons?.handle ? egnaProdukter.find((p) => p.handle === varAnnons.handle) : null);
  return { text: basta?.text ?? null, varAnnons, produkt, bilder };
}

/** Produktraden som fyndet bär (aldrig hela produkttexten). Ren. */
function produktRad(p) {
  return p ? { handle: p.handle, titel: p.titel, url: p.url, butik: p.butik, verksamhet: p.verksamhet, bilder: (p.bilder ?? []).slice(0, 12) } : null;
}

/**
 * Uppföljningen av ett annonsfall: är de anmälda annonserna kvar? Kopian är
 * ANNONSERNA, och deras sajt säger ingenting. ORVO hade inget på hemsidan, och
 * uppföljningen jämförde sajten med vår produktsida. Den hade alltså stängt ärendet
 * som "åtgärdat" morgonen efter brevet, medan annonserna rullade (mätt 2026-09-29).
 * `bibliotek` = hamtaAdLibrary() för sidan och landet. Oläst eller fel ⇒ kvar: null
 * (okänt), aldrig "borta". Ren.
 */
export function annonsUppfoljning(bevisAnnonser, bibliotek) {
  const idn = [...new Set((bevisAnnonser ?? []).filter((t) => t.aktiv !== false).map((t) => String(t.lank ?? '').match(/[?&]id=(\d+)/)?.[1]).filter(Boolean))];
  if (!idn.length) return { kvar: null, detalj: 'inga aktiva annonser i bevisen — kan inte följas upp automatiskt', aktiva: [] };
  if (!bibliotek || (!(bibliotek.annonser ?? []).length && (bibliotek.fel ?? []).length)) return { kvar: null, detalj: `annonsbiblioteket gick inte att läsa${bibliotek?.fel?.[0] ? `: ${bibliotek.fel[0]}` : ''}`, aktiva: [] };
  const aktiva = new Set((bibliotek.annonser ?? []).filter((x) => x.aktiv).map((x) => String(x.id)));
  const kvar = idn.filter((id) => aktiva.has(id));
  return kvar.length
    ? { kvar: true, detalj: `${kvar.length} av ${idn.length} anmälda annonser är fortfarande aktiva`, aktiva: kvar }
    : { kvar: false, detalj: `ingen av de ${idn.length} anmälda annonserna är aktiv längre`, aktiva: [] };
}

/**
 * Hela fyndet för en konkurrent: en rad per annons som matchar, styrkan ur den
 * bästa, skälen på svenska + engelska. null om ingen annons matchar.
 */
export function byggAnnonsfynd(input, { egnaAnnonser, egnaProdukter, konfig, derasHashar, egnaHashar, sida = null, nu = new Date().toISOString(), kalla = 'axel' }) {
  const traffar = [];
  for (const a of input.annonser) {
    const j = jamforAnnons(a, { egnaAnnonser, egnaProdukter, konfig, derasHashar, egnaHashar });
    if (!j.text && !j.bilder.length) continue;
    traffar.push({ nr: a.nr, lank: a.lank, derasText: a.text.slice(0, 2000), video: a.video, start: a.start, slut: a.slut, aktiv: a.aktiv ?? null, exponeringar: a.exponeringar ?? null, exponeringarKalla: a.exponeringarKalla ?? null, text: j.text, varAnnons: j.varAnnons, produkt: j.produkt, bilder: j.bilder });
  }
  if (!traffar.length) return null;
  traffar.sort((x, y) => (y.text?.langsta ?? 0) - (x.text?.langsta ?? 0) || y.bilder.length - x.bilder.length);
  const basta = traffar[0];
  const allaBilder = traffar.flatMap((t) => t.bilder);
  const v = sammanvag({ annons: basta.text, bilder: allaBilder });
  const medText = traffar.filter((t) => t.text?.styrka).length;
  const skal = []; const skalEn = [];
  if (medText) { skal.push(`${medText} av deras annonser återger våra annonstexter ordagrant (längsta sviten ${basta.text?.langsta ?? 0} ord)`); skalEn.push(`${medText} of their ads reproduce our ad copy verbatim (longest run ${basta.text?.langsta ?? 0} words)`); }
  if (allaBilder.length) { skal.push(`${allaBilder.length} annonsbilder identiska eller mycket lika våra`); skalEn.push(`${allaBilder.length} ad images identical or near-identical to ours`); }
  const exponeringar = traffar.reduce((s, t) => s + (t.exponeringar ?? 0), 0);
  const utanExp = traffar.filter((t) => !t.exponeringar).length;
  const expKalla = kalla === 'adlibrary' ? 'enligt annonsbibliotekets EU-ruta' : 'enligt Axels avläsning';
  if (exponeringar) { skal.push(`${fmtSv(exponeringar)} exponeringar ${expKalla}${utanExp ? ` (${utanExp} annons(er) utan tal — går på schablon)` : ''}`); skalEn.push(`${fmtEn(exponeringar)} impressions as read off the Ad Library${utanExp ? ` (${utanExp} ad(s) without a figure — flat rate)` : ''}`); }
  // Axels kriterier: värd att jaga eller inte — står sist bland skälen, och som eget fält.
  const varde = vardAttJaga(traffar, konfig.trosklar?.annons);
  skal.push(varde.vard ? `värd att jaga: ${varde.orsak}` : `under Axels tröskel: ${varde.orsak}`);
  skalEn.push(varde.vard ? `worth pursuing: ${varde.orsakEn}` : `below the threshold: ${varde.orsakEn}`);
  // Flera annonser som matchar är i sig starkt — en är en slump, tre är ett mönster. Men bara STARKA
  // textträffar (ordagranna stycken) räknas dit: två 7-ordssviter är "trolig". Två identiska bilder är
  // stark — ORVO 2026-09-29 hade 14 av 19 bildpar på avstånd 0–4: våra egna videor med nya undertexter.
  const medStarkText = traffar.filter((t) => t.text?.styrka === 'stark').length;
  const identiska = allaBilder.filter((b) => b.grad === 'identisk').length;
  const styrka = medStarkText >= 2 || identiska >= 2 || v.styrka === 'stark' ? 'stark' : v.styrka;
  // Huvudprodukten = den med flest kopierande annonser LIVE (sedan flest totalt) — inte den med längsta textsviten.
  // ORVO 2026-09-29: 14 inaktiva IBC-annonser mot 10 live takskyddsannonser ⇒ brevet och sidan handlar om takskyddet.
  const perProdukt = new Map();
  for (const t of traffar) { const h = t.produkt?.handle ?? t.varAnnons?.handle ?? null; if (!h) continue; const r = perProdukt.get(h) ?? { live: 0, alla: 0, t }; r.alla++; if (t.aktiv !== false) r.live++; perProdukt.set(h, r); }
  const topp = [...perProdukt.values()].sort((x, y) => y.live - x.live || y.alla - x.alla)[0]?.t ?? basta;
  const produkt = topp.produkt ?? produktRad(topp.varAnnons?.handle ? egnaProdukter.find((p) => p.handle === topp.varAnnons.handle) : null) ?? basta.produkt ?? null;
  const verksamhet = produkt?.verksamhet ?? topp.varAnnons?.verksamhet ?? basta.varAnnons?.verksamhet ?? Object.keys(konfig.verksamheter)[0];
  const huvudAnnons = topp.varAnnons ?? basta.varAnnons ?? null;
  const deras = input.deras;
  // Nyckeln bär landet utanför Sverige: samma sida i Norge är ett EGET ärende, aldrig en uppdatering
  // av det svenska (mätt 2026-09-29: ORVO:s 13 norska annonser hade annars skrivit över bevisen i
  // KD-2026-001 — efter att brevet gått).
  const land = input.land && input.land !== 'SE' ? input.land : null;
  return {
    nyckel: nyckelFor({ typ: 'annons', doman: deras.doman, sidaId: deras.doman ? null : deras.sidnamn, handle: land ? `annonser-${land}` : 'annonser' }),
    verksamhet, typ: 'annons', kalla, ...(land ? { land } : {}),
    var: {
      produkt: produkt ? { handle: produkt.handle, titel: produkt.titel, url: produkt.url, butik: produkt.butik, bilder: (produkt.bilder ?? []).slice(0, 12) } : { handle: 'annonser', titel: `${traffar.length} ${traffar.length === 1 ? 'annons' : 'annonser'}`, url: null, butik: null, bilder: [] },
      annons: huvudAnnons ? { id: huvudAnnons.id, namn: huvudAnnons.namn, bild: huvudAnnons.bild ?? egnaAnnonser.find((e) => e.id === huvudAnnons.id)?.bild ?? null } : null,
    },
    deras: {
      url: deras.url, doman: deras.doman, sidnamn: deras.sidnamn ?? null, sidaId: deras.sida_id ?? deras.sidaId ?? deras.page_id ?? null, foretag: deras.foretag ?? null, adress: deras.adress ?? null,
      titel: sida?.titel ?? null, lang: sida?.lang ?? deras.lang ?? null, plattform: sida?.plattform ?? null,
      epost: sida?.epost ?? [], orgnr: deras.orgnr ? [{ typ: 'SE', nr: deras.orgnr }] : (sida?.orgnr ?? []),
      kontakt: sida?.kontakt ?? { epost: [], kallor: [] }, mottagare: deras.mottagare ?? sida?.mottagare ?? null,
      bilder: traffar.flatMap((t) => t.bilder.map((b) => b.deras)).slice(0, 6), snapshot: basta.lank ?? null,
    },
    bevis: {
      text: null, annons: basta.text, bilder: allaBilder,
      // Live först, sedan störst räckvidd — brevets bevislista och anmälningarnas numrering följer den ordningen.
      annonser: [...traffar].sort((x, y) => Number(y.aktiv !== false) - Number(x.aktiv !== false) || (y.exponeringar ?? 0) - (x.exponeringar ?? 0)).map((t) => ({ nr: t.nr, lank: t.lank, video: t.video, start: t.start, slut: t.slut, aktiv: t.aktiv, exponeringar: t.exponeringar, exponeringarKalla: t.exponeringarKalla, text: t.text, varAnnons: t.varAnnons ? { id: t.varAnnons.id, namn: t.varAnnons.namn, handle: t.varAnnons.handle ?? null } : null, produkt: t.produkt ? { handle: t.produkt.handle, titel: t.produkt.titel, url: t.produkt.url, butik: t.produkt.butik ?? null, verksamhet: t.produkt.verksamhet ?? null } : null, bilder: t.bilder, derasText: t.derasText })),
      skarmdump: null, nar: nu,
    },
    styrka, skal, skalEn, varde, miniatyrer: {},
  };
}
