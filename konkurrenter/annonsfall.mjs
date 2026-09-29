// konkurrenter/annonsfall.mjs — ärendet ur konkurrentens ANNONSER (Axels
// fall 2026-09-29: "han har snott asmycket ads … men han har ingenting på
// hemsidan"). Metas annonsbibliotek går inte att läsa härifrån, så Axel (eller
// sessionen) skriver ner annonserna: länken, texten, ev. bilder/skärmdumpar.
// Här jämförs de mot ALLA våra annonstexter och produkttexter, och bilderna
// mot våra annonsbilder. Rena funktioner — hämtning och hashning sker i kor.mjs.
//
// Indata (konkurrenter/output/<datum>.annonser.json, eller valfri fil med --annonser):
// {
//   "deras": { "sidnamn": "Kopian", "doman": "kopian.se", "url": "https://kopian.se", "mottagare": "info@kopian.se", "foretag": "Kopian AB", "orgnr": "556677-8899" },
//   "annonser": [
//     { "lank": "https://www.facebook.com/ads/library/?id=…", "text": "…deras primärtext…", "rubrik": "…", "bilder": ["https://…/bild.jpg", "/sökväg/skärmdump.png"], "video": true, "start": "2026-09-01" }
//   ]
// }

import { jamforText, jamforBilder, sammanvag } from './likhet.mjs';
import { nyckelFor } from './arenden.mjs';
import { domanUr } from './sok.mjs';

/** Läser och kontrollerar indatafilen. Kastar med klartext om något saknas. Ren. */
export function tolkaAnnonsinput(data) {
  const deras = data?.deras ?? {};
  const annonser = Array.isArray(data?.annonser) ? data.annonser : [];
  const doman = deras.doman ? String(deras.doman).toLowerCase().replace(/^www\./, '') : (deras.url ? domanUr(deras.url) : null);
  if (!deras.sidnamn && !doman) throw new Error('annonsfilen saknar deras.sidnamn och deras.doman — en av dem behövs.');
  const rader = annonser
    .map((a, i) => ({ nr: i + 1, lank: a.lank ?? null, text: String(a.text ?? '').trim(), rubrik: String(a.rubrik ?? '').trim(), bilder: Array.isArray(a.bilder) ? a.bilder.filter(Boolean) : [], video: Boolean(a.video), start: a.start ?? null }))
    .filter((a) => a.text || a.bilder.length);
  if (!rader.length) throw new Error('annonsfilen har inga annonser med text eller bilder.');
  return { deras: { ...deras, doman, url: deras.url ?? (doman ? `https://${doman}` : null) }, annonser: rader };
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
  const deras = a.bilder.map((u) => ({ url: u, hash: derasHashar.get(u)?.hash })).filter((x) => x.hash);
  const egnaBilder = [...egnaAnnonser.map((e) => e.bild).filter(Boolean), ...(basta?.produkt?.bilder ?? [])].map((u) => ({ url: u, hash: egnaHashar.get(u)?.hash })).filter((x) => x.hash);
  const bilder = jamforBilder(egnaBilder, deras, konfig.trosklar.bild);
  return { text: basta?.text ?? null, varAnnons: basta?.varAnnons ?? null, produkt: basta?.produkt ?? null, bilder };
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
    traffar.push({ nr: a.nr, lank: a.lank, derasText: a.text.slice(0, 2000), video: a.video, start: a.start, text: j.text, varAnnons: j.varAnnons, produkt: j.produkt, bilder: j.bilder });
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
  // Flera annonser som matchar är i sig starkt — en är en slump, tre är ett mönster.
  const styrka = medText >= 2 || v.styrka === 'stark' ? 'stark' : v.styrka;
  const produkt = basta.produkt ?? (basta.varAnnons?.handle ? egnaProdukter.find((p) => p.handle === basta.varAnnons.handle) : null) ?? null;
  const verksamhet = produkt?.verksamhet ?? basta.varAnnons?.verksamhet ?? Object.keys(konfig.verksamheter)[0];
  const deras = input.deras;
  return {
    nyckel: nyckelFor({ typ: 'annons', doman: deras.doman, sidaId: deras.doman ? null : deras.sidnamn, handle: 'annonser' }),
    verksamhet, typ: 'annons', kalla,
    var: {
      produkt: produkt ? { handle: produkt.handle, titel: produkt.titel, url: produkt.url, butik: produkt.butik, bilder: (produkt.bilder ?? []).slice(0, 12) } : { handle: 'annonser', titel: `${traffar.length} ${traffar.length === 1 ? 'annons' : 'annonser'}`, url: null, butik: null, bilder: [] },
      annons: basta.varAnnons ? { id: basta.varAnnons.id, namn: basta.varAnnons.namn, bild: basta.varAnnons.bild } : null,
    },
    deras: {
      url: deras.url, doman: deras.doman, sidnamn: deras.sidnamn ?? null, foretag: deras.foretag ?? null, adress: deras.adress ?? null,
      titel: sida?.titel ?? null, lang: sida?.lang ?? deras.lang ?? null, plattform: sida?.plattform ?? null,
      epost: sida?.epost ?? [], orgnr: deras.orgnr ? [{ typ: 'SE', nr: deras.orgnr }] : (sida?.orgnr ?? []),
      kontakt: sida?.kontakt ?? { epost: [], kallor: [] }, mottagare: deras.mottagare ?? sida?.mottagare ?? null,
      bilder: traffar.flatMap((t) => t.bilder.map((b) => b.deras)).slice(0, 6), snapshot: basta.lank ?? null,
    },
    bevis: {
      text: null, annons: basta.text, bilder: allaBilder,
      annonser: traffar.map((t) => ({ nr: t.nr, lank: t.lank, video: t.video, start: t.start, text: t.text, varAnnons: t.varAnnons ? { id: t.varAnnons.id, namn: t.varAnnons.namn } : null, bilder: t.bilder, derasText: t.derasText })),
      skarmdump: null, nar: nu,
    },
    styrka, skal, skalEn, miniatyrer: {},
  };
}
