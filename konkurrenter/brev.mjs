// konkurrenter/brev.mjs — varningsbrevet. Skrivs ur ärendets bevis, aldrig ur
// huvudet: varje rad i bevislistan pekar på något rutinen mätt (en passage,
// en bild, en annons). Svenska till svenska butiker (.se eller svensk sida),
// engelska till alla andra. Aldrig VD:ns namn — bolaget skriver.
//
// Tonen (Axels beställning 2026-09-27: brevet ska bita): saklig, hård,
// juridiskt korrekt. Kraven är de ett ombud ställer — borttagning inom
// fristen, skriftlig bekräftelse, inget mer i framtiden — och följderna är
// de som faktiskt finns: anmälan till Meta/Shopify, registrar, Patent- och
// marknadsdomstolen, ersättning enligt 54 § URL. Inga hot utöver det.
//
// Lagrummen: upphovsrättslagen (1960:729), 54 § för ersättningen. Mål prövas av
// Patent- och marknadsdomstolen vid Stockholms tingsrätt.
//
// ORVO-lärdomen (Eoka AB:s bestridande 2026-09-29, KD-2026-001): brevet påstår
// BARA det som är bevisat, sekvens för sekvens. Tre saker brevet sa tidigare föll
// på en enda TikTok-länk:
//  - "Texterna, fotografierna och filmerna är framställda av oss". Vår film bar
//    Specialised Covers klipp.
//  - "59 % av er film matchar våra filmer". Andelen räknade de lånade rutorna.
//  - "våra produktsidor" och marknadsföringslagen (vilseledande efterbildning,
//    renommésnyltning). Ingen produktsida var kopierad, och ingen "känd och
//    särpräglad" produkt var visad.
// Nu räknar brevet upp varje kopierad sekvens med tidskod hos dem, vår annons
// (länk och startdatum) och tidskod hos oss, och kravet gäller bara det som
// står uppräknat.

import { belopp } from './faktura.mjs';
import { bevisStatus, tid } from './klipp.mjs';
import { startadeFore } from './original.mjs';

const FRISTFORMAT = { sv: 'sv-SE', en: 'en-GB' };

/** Svenska eller engelska? Svensk sida (lang sv) eller .se-domän ⇒ svenska. Ren. */
export function valjSprak({ lang = null, doman = null, tvinga = null } = {}) {
  if (tvinga === 'sv' || tvinga === 'en') return tvinga;
  if (lang === 'sv') return 'sv';
  if (/\.se$/i.test(String(doman ?? ''))) return 'sv';
  return 'en';
}

/** Fristen som klartext i svensk tid: "måndag 29 september 2026 kl. 14:00". Ren. */
export function fristText(fran, timmar, sprak = 'sv') {
  const d = new Date(new Date(fran).getTime() + timmar * 3_600_000);
  const dag = new Intl.DateTimeFormat(FRISTFORMAT[sprak] ?? 'sv-SE', { timeZone: 'Europe/Stockholm', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  const tid = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(d);
  return sprak === 'sv' ? `${dag} kl. ${tid} (svensk tid)` : `${dag} at ${tid} (Swedish time)`;
}

/** Datum i klartext för det språket. Ren. */
export function datumText(iso, sprak = 'sv') {
  return new Intl.DateTimeFormat(FRISTFORMAT[sprak] ?? 'sv-SE', { timeZone: 'Europe/Stockholm', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

/** Så många annonser listas med sina sekvenser; fler står som "… och N till". */
export const MAX_ANNONSER = 40;

const citat = (s, max = 220) => { const t = String(s).trim(); return `”${t.length > max ? `${t.slice(0, max).trim()}…` : t}”`; };

/** Butikens hemsida ur en butiks- eller produktlänk (utan språkmapp). null om den inte går att läsa. Ren. */
export function hemsida(url) {
  try { const u = new URL(url); return `${u.protocol}//${u.hostname}`; } catch { return null; }
}

/**
 * EN kopierad sekvens som klartext: deras tid = vår annons (länk + start) eller vår film (namn + datum) och vår tid.
 * `original` = original.json:s `filmer`. En film som bär externa klipp länkas aldrig (originalFor-regeln). Ren.
 */
export function sekvensRad(par, annons, original = null, sprak = 'sv') {
  const sv = sprak === 'sv';
  const o = original?.[par.film];
  const lank = o?.lank && !o.externa && startadeFore(o, annons?.start) ? o : null;
  const vart = lank
    ? `${sv ? 'vår annons' : 'our ad'} ${lank.lank}${lank.start ? ` (${sv ? 'visas sedan' : 'running since'} ${datumText(lank.start, sprak)})` : ''}`
    : `${sv ? 'vår film' : 'our film'} "${par.film ?? '?'}"${par.skapad ? ` (${sv ? 'publicerad' : 'published'} ${datumText(par.skapad, sprak)})` : ''}`;
  const varTid = par.egenT === null || par.egenT === undefined ? (sv ? '(stillbild)' : '(still frame)') : `${sv ? 'vid' : 'at'} ${tid(par.egenT)}`;
  return `${sv ? 'er' : 'your'} ${tid(par.derasT)} = ${vart} ${varTid}`;
}

/** Bevislistan ur ärendet, på valt språk. Bara det som mättes. `original` = original.json:s `filmer` (valfritt). Ren. */
export function bevisrader(arende, sprak = 'sv', { original = null } = {}) {
  const b = arende.bevis ?? {};
  const ut = [];
  const text = b.text?.styrka ? b.text : null;
  if (text) {
    const pass = (text.passager ?? []).slice(0, 3);
    ut.push(sprak === 'sv'
      ? `• Text: ${text.kopieradeOrd} ord löpande text på er sida är hämtade ordagrant från vår produktsida ${arende.var?.produkt?.url}. Bland annat:`
      : `• Text: ${text.kopieradeOrd} words of running text on your page are taken verbatim from our product page ${arende.var?.produkt?.url}. Among them:`);
    for (const p of pass) ut.push(`    ${citat(p.text)} (${p.ord} ${sprak === 'sv' ? 'ord i följd' : 'consecutive words'})`);
  }
  // Flera annonser (ärende ur Ad Library eller Axels lista): en rad per annons —
  // bara de som är BEVISADE med vårt eget material (bevisStatus, Axel 2026-09-29:
  // miniatyrträffen var ett lånat klipp och nämns aldrig).
  const flera = Array.isArray(b.annonser) ? b.annonser.filter((a) => bevisStatus(a).bevisad) : [];
  if (flera.length) {
    const st = flera.map((a) => bevisStatus(a));
    const sv = sprak === 'sv';
    const delar = [
      st.some((x) => x.text) && (sv ? 'text' : 'copy'),
      st.some((x) => x.film) && (sv ? 'sekvenser ur våra egna reklamfilmer' : 'sequences from our own advertising films'),
      st.some((x) => x.bild || x.overifierad) && (sv ? 'bild' : 'image'),
    ].filter(Boolean);
    const vad = delar.length > 1 ? ` (${delar.join(sv ? ' och/eller ' : ' and/or ')})` : delar[0] === (sv ? 'text' : 'copy') ? (sv ? ' ordagrant' : ' verbatim') : ` (${delar[0]})`;
    ut.push(sv
      ? `• Annonser: ${flera.length} av era annonser på Facebook/Instagram återger vårt material${vad}. Per annons, med tidskoder:`
      : `• Ads: ${flera.length} of your ads on Facebook/Instagram reproduce our material${vad}. Per ad, with timecodes:`);
    // Varje annons och varje sekvens (Eoka AB:s krav 2026-09-29 — "identifiera, med tidskoder, exakt vilket inslag"). Ingen andel.
    for (const a of flera.slice(0, MAX_ANNONSER)) {
      const s = bevisStatus(a);
      const p = s.text ? a.text?.passager?.[0] : null;
      ut.push(`    ${a.lank ?? `${sv ? 'annons' : 'ad'} ${a.nr}`}${p ? `: ${citat(p.text, 140)} (${p.ord} ${sv ? 'ord i följd ur vår annonstext' : 'consecutive words from our ad copy'}${a.varAnnons?.namn ? ` "${a.varAnnons.namn}"` : ''})` : ''}`);
      if (s.film) for (const par of a.klipp?.par ?? []) ut.push(`      – ${sekvensRad(par, a, original, sprak)}`);
      else if ((s.bild || s.overifierad) && a.bilder?.length) ut.push(`      – ${a.bilder.length} ${sv ? 'bild(er) identiska med vår annonsbild' : 'image(s) identical to our ad image'}${a.varAnnons?.namn ? ` "${a.varAnnons.namn}"` : ''}`);
    }
    if (flera.length > MAX_ANNONSER) ut.push(`    … ${sprak === 'sv' ? `och ${flera.length - MAX_ANNONSER} till (fullständig lista på begäran)` : `and ${flera.length - MAX_ANNONSER} more (full list on request)`}`);
  } else {
    const annons = b.annons?.styrka ? b.annons : null;
    if (annons) {
      ut.push(sprak === 'sv'
        ? `• Annons: er annons${arende.deras?.snapshot ? ` (${arende.deras.snapshot})` : ''} återger vår annonstext${arende.var?.annons?.namn ? ` för ${arende.var.produkt?.titel ?? arende.var.annons.namn}` : ''} ordagrant:`
        : `• Ad: your ad${arende.deras?.snapshot ? ` (${arende.deras.snapshot})` : ''} reproduces our ad copy${arende.var?.produkt?.titel ? ` for ${arende.var.produkt.titel}` : ''} verbatim:`);
      for (const p of (annons.passager ?? []).slice(0, 2)) ut.push(`    ${citat(p.text)} (${p.ord} ${sprak === 'sv' ? 'ord i följd' : 'consecutive words'})`);
    }
  }
  // Annonsärendets bilder står redan per annons ovan — och deras "bild" kan vara
  // Axels egen skärmdump (en lokal sökväg), som aldrig ska stå i brevet.
  const bilder = flera.length ? [] : (b.bilder ?? []);
  if (bilder.length) {
    const identiska = bilder.filter((x) => x.grad === 'identisk').length;
    ut.push(sprak === 'sv'
      ? `• Bilder: ${bilder.length} av bilderna på er sida är våra egna produktbilder (${identiska} identiska, ${bilder.length - identiska} beskurna eller färgjusterade kopior):`
      : `• Images: ${bilder.length} of the images on your page are our own product photos (${identiska} identical, ${bilder.length - identiska} cropped or recolored copies):`);
    for (const x of bilder.slice(0, 5)) ut.push(`    ${x.deras}`);
  }
  return ut;
}

/**
 * Brevet. `arende` = ärendet (bevis, var, deras), `avsandare` = { brand, mail, butikUrl },
 * `foretag` = { namn, orgnr, adress }, `paminnelse` = andra brevet efter fristen.
 * @returns {{ sprak, amne, text, mottagare, fran }}
 */
/** Fakturastycket i brevet — bara när en faktura finns. Ren. */
export function fakturastycke(faktura, sprak, { fristTimmar = 48 } = {}) {
  if (!faktura) return [];
  const summa = belopp(faktura.brutto, faktura.valuta, sprak);
  const exp = faktura.berakning === 'exponeringar' && faktura.exponeringar > 0 && faktura.cpm?.sek > 0;
  const expSv = exp ? ` Beloppet är räknat på annonsernas ${faktura.exponeringar.toLocaleString('sv-SE').replace(/[  ]/g, ' ')} exponeringar enligt Metas annonsbibliotek och vår uppmätta kostnad per tusen visningar i samma kanal (CPM ${belopp(faktura.cpm.sek, 'SEK', 'sv', 1)}), det vill säga det annonsutrymme ni fått med vårt material.` : '';
  const expEn = exp ? ` The amount is calculated from the ads' ${faktura.exponeringar.toLocaleString('en-GB')} impressions as reported by the Meta Ad Library and our measured cost per thousand impressions in the same channel (CPM ${belopp(faktura.cpm.sek, 'SEK', 'en', 1)}), i.e. the advertising exposure you obtained with our material.` : '';
  return sprak === 'sv'
    ? [
      `Bifogat finns faktura ${faktura.nr} på ${summa}${faktura.momsProcent ? ` inklusive moms` : ''} avseende skälig ersättning för nyttjandet fram till i dag (54 § upphovsrättslagen), förfallodag ${faktura.forfaller}.${expSv} Betalas fakturan i tid och materialet tas bort inom ${fristTimmar} timmar avslutar vi ärendet utan vidare åtgärd.`,
      '',
    ]
    : [
      `Attached is invoice ${faktura.nr} for ${summa}${faktura.momsProcent ? ` including VAT` : ''}, being reasonable compensation for the use up to today (section 54 of the Swedish Copyright Act), due ${faktura.forfaller}.${expEn} If the invoice is paid on time and the material is removed within ${fristTimmar} hours, we will close the matter without further action.`,
      '',
    ];
}

/**
 * Meningen om Meta-anmälningarna i brevet. `n` = antalet som anmäls (Axels ja i
 * granskningsappen), `antal` = antalet byggda; färre än alla ⇒ "7 av de 10".
 * Tom sträng när inget anmäls. Samma text i appens förhandsvisning och i brevet. Ren.
 */
export function metaRad({ n, antal = n, baraAktiva = false, redanAnmalt = false, sprak = 'sv' }) {
  if (!(n > 0)) return '';
  const alla = n >= antal;
  if (sprak === 'sv') {
    const aktiva = baraAktiva ? 'aktiva ' : '';
    const verb = redanAnmalt ? (n === 1 ? 'är anmäld' : 'är anmälda') : 'anmäls samtidigt';
    const vem = alla ? (n === 1 ? `Den ${aktiva}annonsen` : `De ${n} ${aktiva}annonserna`) : `${n} av de ${antal} ${aktiva}annonserna`;
    return `${vem} ${verb} till Meta (Facebook och Instagram) för upphovsrättsintrång${n > 1 ? ', en anmälan per annons' : ''}.`;
  }
  const aktiva = baraAktiva ? 'active ' : '';
  const verb = redanAnmalt ? (n === 1 ? 'has been reported' : 'have been reported') : (n === 1 ? 'is being reported at the same time' : 'are being reported at the same time');
  const vem = alla ? (n === 1 ? `The ${aktiva}ad` : `The ${n} ${aktiva}ads`) : `${n} of the ${antal} ${aktiva}ads`;
  return `${vem} ${verb} to Meta (Facebook and Instagram) for copyright infringement${n > 1 ? ', one report per ad' : ''}.`;
}

export function byggBrev(arende, { avsandare, foretag, sprak = null, nu = new Date(), fristTimmar = 48, paminnelseTimmar = 24, paminnelse = false, mottagare = null, faktura = null, anmalanSamtidigt = false, anmalanAntal = null, utanMeta = false, original = null } = {}) {
  const s = valjSprak({ lang: arende.deras?.lang, doman: arende.deras?.doman, tvinga: sprak });
  const deras = arende.deras ?? {};
  const doman = deras.doman ?? deras.sidnamn ?? '?';
  // Annonsärendet: kopian sitter i annonserna, inte på sajten — brevet pekar på
  // Facebook-sidan och annonserna, aldrig på en sajt som kan vara ren.
  const annonsfall = arende.typ === 'annons';
  const annonsPlats = annonsfall
    ? { sv: `era annonser på Facebook och Instagram${deras.sidnamn ? ` (sidan "${deras.sidnamn}")` : ''}`, en: `your ads on Facebook and Instagram${deras.sidnamn ? ` (page "${deras.sidnamn}")` : ''}` }
    : null;
  const derasUrl = annonsfall ? annonsPlats.sv : (deras.url ?? deras.snapshot ?? doman);
  const brand = avsandare?.brand ?? arende.verksamhet ?? '';
  // Butiken vars material kopierats (produktens butik, utan språkmapp) — annars verksamhetens första.
  const butik = hemsida(arende.var?.produkt?.butik ?? arende.var?.produkt?.url) ?? avsandare?.butikUrl ?? '';
  const mail = avsandare?.mail ?? '';
  const till = mottagare ?? arende.brev?.mottagare ?? deras.mottagare ?? null;
  const forstaSedd = arende.skapad ?? nu.toISOString();
  const shopify = deras.plattform === 'shopify';
  const skarmdump = Boolean(arende.bevis?.skarmdump?.fil);
  const rader = bevisrader(arende, s, { original });
  const id = arende.id;
  const fakt = faktura ?? arende.faktura ?? null;
  const fakturarader = fakturastycke(fakt, s, { fristTimmar });
  // Meta-anmälan: går den in samtidigt som brevet (Axels "kör anmälningarna" i samma veva, --med-anmalan) eller
  // har den redan gått in, säger brevet det rakt ut — och hotar inte med den som om den vore villkorad.
  const redanAnmalt = (arende.anmalan?.rapporter ?? []).some((r) => r.inskickad || r.referens);
  // `anmalanAntal`: hur många Axel sagt ja till i granskningsappen (null = alla byggda).
  const antalByggda = arende.anmalan?.antal ?? 0;
  const nAnm = anmalanAntal ?? antalByggda;
  // `utanMeta` (Axel 2026-09-29: "vi borde inte säga att vi har skickat DMCA-takedowns … han kommer att försöka få ner
  // våra annonser"): brevet nämner inte Meta alls — varken att annonserna anmäls/är anmälda eller som ett villkorat hot,
  // för ett hot om något som redan är gjort vore vilseledande.
  const metaNu = !utanMeta && annonsfall && (anmalanSamtidigt || redanAnmalt) && nAnm > 0;
  const metaArg = { n: nAnm, antal: antalByggda, baraAktiva: Boolean(arende.anmalan?.baraAktiva), redanAnmalt };
  const metaRadSv = metaNu ? [metaRad({ ...metaArg, sprak: 'sv' }), ''] : [];
  const metaRadEn = metaNu ? [metaRad({ ...metaArg, sprak: 'en' }), ''] : [];

  if (!paminnelse) {
    if (s === 'sv') {
      const amne = `Upphovsrättsintrång på ${doman} – krav på borttagning inom ${fristTimmar} timmar${fakt ? ` och faktura ${fakt.nr}` : ''} (ärende ${id})`;
      const text = [
        `Till företagsledningen / ansvarig för ${doman}`,
        '',
        `${foretag.namn} (org.nr ${foretag.orgnr}) driver ${brand}${butik ? ` (${butik})` : ''}. Vi har den ${datumText(forstaSedd, 'sv')} dokumenterat att ni ${annonsfall ? 'i' : 'på'}`,
        '',
        `    ${annonsfall ? annonsPlats.sv : derasUrl}`,
        '',
        'använder material som vi har skapat och äger rättigheterna till:',
        '',
        ...rader,
        '',
        'Materialet som räknas upp ovan är framställt av oss och skyddas av lagen (1960:729) om upphovsrätt till litterära och konstnärliga verk. Kravet gäller enbart det uppräknade materialet.',
        '',
        `Vi kräver att ni senast ${fristText(nu, fristTimmar, 'sv')}, det vill säga inom ${fristTimmar} timmar från detta mejl:`,
        '',
        annonsfall
          ? '1. tar bort det uppräknade materialet från alla era annonser, er webbplats, sociala kanaler och marknadsplatser där det används,'
          : `1. tar bort det uppräknade materialet från ${doman} och från alla annonser, sociala kanaler och marknadsplatser där det används,`,
        `2. skriftligen bekräftar till ${mail} att så har skett, och`,
        '3. avstår från all framtida användning av vårt material.',
        '',
        ...fakturarader,
        ...metaRadSv,
        `${fakt ? 'Uteblir borttagningen eller betalningen' : 'Sker inte det'} kommer vi utan ytterligare påminnelse att:`,
        '',
        metaNu || utanMeta
          ? `– anmäla intrånget till ${shopify ? 'Shopify' : 'er e-handelsplattform'} enligt deras rutiner för immaterialrättsintrång, vilket normalt leder till att butiker stängs av,`
          : `– anmäla intrånget till Meta (Facebook och Instagram)${shopify ? ' och till Shopify' : ' och till er e-handelsplattform'} enligt deras rutiner för immaterialrättsintrång, vilket normalt leder till att annonser och butiker stängs av,`,
        '– anmäla intrånget till er domänregistrar och ert webbhotell, och',
        '– överlämna ärendet till vårt ombud för talan vid Patent- och marknadsdomstolen om vitesförbud, skälig ersättning och skadestånd enligt 54 § upphovsrättslagen, för hela den tid materialet använts.',
        '',
        `Bevisen är säkrade ${annonsfall ? 'med kopior av annonserna och deras länkar i Metas annonsbibliotek' : skarmdump ? 'med tidsstämplade skärmdumpar och kopior av era sidor' : 'med kopior av era sidor'} per ${datumText(forstaSedd, 'sv')}.`,
        '',
        'Detta brev är inte en fullständig redogörelse för våra rättigheter. Vi förbehåller oss samtliga rättigheter och anspråk.',
        '',
        'Med vänlig hälsning',
        '',
        foretag.namn,
        `${brand}${butik ? ` – ${butik}` : ''}`,
        foretag.adress,
        mail,
        `Ärende: ${id}`,
      ].join('\n');
      return { sprak: s, amne, text, mottagare: till, fran: mail };
    }
    const amne = `Copyright infringement on ${doman} – removal required within ${fristTimmar} hours${fakt ? ` and invoice ${fakt.nr}` : ''} (case ${id})`;
    const text = [
      `To the management / person responsible for ${doman}`,
      '',
      `${foretag.namn} (Swedish company reg. no. ${foretag.orgnr}) operates ${brand}${butik ? ` (${butik})` : ''}. On ${datumText(forstaSedd, 'en')} we documented that ${annonsfall ? 'in' : 'at'}`,
      '',
      `    ${annonsfall ? annonsPlats.en : derasUrl}`,
      '',
      'you are using material that we created and hold the rights to:',
      '',
      ...rader,
      '',
      'The material listed above was produced by us and is protected under the Swedish Act on Copyright in Literary and Artistic Works (1960:729) and internationally under the Berne Convention. This demand concerns only the listed material.',
      '',
      `We require that no later than ${fristText(nu, fristTimmar, 'en')}, i.e. within ${fristTimmar} hours of this email, you:`,
      '',
      annonsfall
        ? '1. remove the listed material from every ad, your website, social channel and marketplace where it is used,'
        : `1. remove the listed material from ${doman} and from every ad, social channel and marketplace where it is used,`,
      `2. confirm in writing to ${mail} that this has been done, and`,
      '3. refrain from any future use of our material.',
      '',
      ...fakturarader,
      ...metaRadEn,
      `${fakt ? 'Should the removal or the payment not take place' : 'Failing that'}, we will without further notice:`,
      '',
      metaNu || utanMeta
        ? `– report the infringement to ${shopify ? 'Shopify' : 'your e-commerce platform'} under their intellectual property procedures, which normally results in stores being taken down,`
        : `– report the infringement to Meta (Facebook and Instagram)${shopify ? ' and to Shopify' : ' and to your e-commerce platform'} under their intellectual property procedures, which normally results in ads and stores being taken down,`,
      '– report the infringement to your domain registrar and hosting provider, and',
      '– hand the matter to our counsel for proceedings before the Swedish Patent and Market Court for an injunction under penalty of a fine, reasonable compensation and damages under section 54 of the Copyright Act, for the entire period the material has been used.',
      '',
      `Evidence has been secured ${annonsfall ? 'with copies of the ads and their links in the Meta Ad Library' : skarmdump ? 'with time-stamped screenshots and copies of your pages' : 'with copies of your pages'} as of ${datumText(forstaSedd, 'en')}.`,
      '',
      'This letter is not a complete statement of our rights. All rights and claims are reserved.',
      '',
      'Kind regards',
      '',
      foretag.namn,
      `${brand}${butik ? ` – ${butik}` : ''}`,
      foretag.adress,
      mail,
      `Case: ${id}`,
    ].join('\n');
    return { sprak: s, amne, text, mottagare: till, fran: mail };
  }

  // Påminnelsen: fristen har gått ut, materialet ligger kvar.
  const skickat = arende.brev?.skickat?.nar ?? forstaSedd;
  const kollad = arende.uppfoljning?.nar ?? nu.toISOString();
  if (s === 'sv') {
    const amne = `Påminnelse: upphovsrättsintrång på ${doman} – fristen har löpt ut (ärende ${id})`;
    const text = [
      `Till företagsledningen / ansvarig för ${doman}`,
      '',
      `Den ${datumText(skickat, 'sv')} krävde vi att ni tar bort vårt upphovsrättsskyddade material från ${annonsfall ? annonsPlats.sv : derasUrl}. Fristen löpte ut ${fristText(skickat, fristTimmar, 'sv')}. Vid vår kontroll ${datumText(kollad, 'sv')} ligger materialet kvar:`,
      '',
      ...rader,
      '',
      `Ni får en sista frist till ${fristText(nu, paminnelseTimmar, 'sv')}. ${utanMeta ? `Därefter anmäler vi intrånget till ${shopify ? 'Shopify' : 'er e-handelsplattform'}` : redanAnmalt ? `Annonserna är redan anmälda till Meta. Därefter anmäler vi intrånget till ${shopify ? 'Shopify' : 'er e-handelsplattform'}` : `Därefter anmäler vi intrånget till Meta${shopify ? ' och Shopify' : ' och er e-handelsplattform'}`} och lämnar ärendet till vårt ombud för talan vid Patent- och marknadsdomstolen, med krav på ersättning enligt 54 § upphovsrättslagen för hela den tid materialet använts.`,
      '',
      `Bekräfta borttagningen skriftligen till ${mail}.`,
      '',
      foretag.namn,
      `${brand}${butik ? ` – ${butik}` : ''}`,
      foretag.adress,
      `Ärende: ${id}`,
    ].join('\n');
    return { sprak: s, amne, text, mottagare: till, fran: mail };
  }
  const amne = `Reminder: copyright infringement on ${doman} – deadline has passed (case ${id})`;
  const text = [
    `To the management / person responsible for ${doman}`,
    '',
    `On ${datumText(skickat, 'en')} we required you to remove our copyrighted material from ${annonsfall ? annonsPlats.en : derasUrl}. The deadline expired ${fristText(skickat, fristTimmar, 'en')}. At our check on ${datumText(kollad, 'en')} the material is still in use:`,
    '',
    ...rader,
    '',
    `You have a final deadline of ${fristText(nu, paminnelseTimmar, 'en')}. ${utanMeta ? `After that we will report the infringement to ${shopify ? 'Shopify' : 'your e-commerce platform'}` : redanAnmalt ? `The ads have already been reported to Meta. After that we will report the infringement to ${shopify ? 'Shopify' : 'your e-commerce platform'}` : `After that we will report the infringement to Meta${shopify ? ' and Shopify' : ' and your e-commerce platform'}`} and hand the matter to our counsel for proceedings before the Swedish Patent and Market Court, claiming compensation under section 54 of the Copyright Act for the entire period the material has been used.`,
    '',
    `Confirm the removal in writing to ${mail}.`,
    '',
    foretag.namn,
    `${brand}${butik ? ` – ${butik}` : ''}`,
    foretag.adress,
    `Case: ${id}`,
  ].join('\n');
  return { sprak: s, amne, text, mottagare: till, fran: mail };
}

/** Kontroll före sändning: allt som får ett brev att stoppas står här, som klartext. Ren. */
export function kontrolleraBrev(brev, { egna = [] } = {}) {
  const fel = [];
  const till = String(brev?.mottagare ?? '').trim().toLowerCase();
  if (!till) fel.push('ingen mottagare — sätt en med --till <adress>');
  else if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(till)) fel.push(`mottagaren "${till}" är ingen mejladress`);
  else {
    const dom = till.split('@')[1];
    if (egna.some((e) => dom === e || dom.endsWith(`.${e}`))) fel.push(`mottagaren ${till} är en av våra egna adresser`);
  }
  if (!String(brev?.text ?? '').trim()) fel.push('brevet är tomt');
  if (!String(brev?.amne ?? '').trim()) fel.push('ämnesraden är tom');
  if (!String(brev?.fran ?? '').includes('@')) fel.push('ingen avsändaradress för verksamheten');
  if (/undefined|null|\?\s*$/m.test(String(brev?.text ?? ''))) fel.push('brevet innehåller ett tomt fält (undefined/null) — ärendet saknar data');
  return fel;
}
