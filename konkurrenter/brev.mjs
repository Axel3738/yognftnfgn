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
// Lagrummen: upphovsrättslagen (1960:729) 1, 2 och 49 a §§ (verk, ensamrätt,
// fotografisk bild) och 54 § (ersättning); marknadsföringslagen (2008:486)
// 5 § (god marknadsföringssed/renommésnyltning), 8 § (vilseledande
// marknadsföring), 14 § (vilseledande efterbildning). Mål om båda prövas av
// Patent- och marknadsdomstolen vid Stockholms tingsrätt.

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

const citat = (s, max = 220) => { const t = String(s).trim(); return `”${t.length > max ? `${t.slice(0, max).trim()}…` : t}”`; };

/** Bevislistan ur ärendet, på valt språk. Bara det som mättes. Ren. */
export function bevisrader(arende, sprak = 'sv') {
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
  const annons = b.annons?.styrka ? b.annons : null;
  if (annons) {
    ut.push(sprak === 'sv'
      ? `• Annons: er annons${arende.deras?.snapshot ? ` (${arende.deras.snapshot})` : ''} återger vår annonstext${arende.var?.annons?.namn ? ` för ${arende.var.produkt?.titel ?? arende.var.annons.namn}` : ''} ordagrant:`
      : `• Ad: your ad${arende.deras?.snapshot ? ` (${arende.deras.snapshot})` : ''} reproduces our ad copy${arende.var?.produkt?.titel ? ` for ${arende.var.produkt.titel}` : ''} verbatim:`);
    for (const p of (annons.passager ?? []).slice(0, 2)) ut.push(`    ${citat(p.text)} (${p.ord} ${sprak === 'sv' ? 'ord i följd' : 'consecutive words'})`);
  }
  const bilder = b.bilder ?? [];
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
export function byggBrev(arende, { avsandare, foretag, sprak = null, nu = new Date(), fristTimmar = 48, paminnelseTimmar = 24, paminnelse = false, mottagare = null } = {}) {
  const s = valjSprak({ lang: arende.deras?.lang, doman: arende.deras?.doman, tvinga: sprak });
  const deras = arende.deras ?? {};
  const doman = deras.doman ?? deras.sidnamn ?? '?';
  const derasUrl = deras.url ?? deras.snapshot ?? doman;
  const brand = avsandare?.brand ?? arende.verksamhet ?? '';
  const butik = avsandare?.butikUrl ?? '';
  const mail = avsandare?.mail ?? '';
  const till = mottagare ?? arende.brev?.mottagare ?? deras.mottagare ?? null;
  const forstaSedd = arende.skapad ?? nu.toISOString();
  const shopify = deras.plattform === 'shopify';
  const skarmdump = Boolean(arende.bevis?.skarmdump?.fil);
  const rader = bevisrader(arende, s);
  const id = arende.id;

  if (!paminnelse) {
    if (s === 'sv') {
      const amne = `Upphovsrättsintrång på ${doman} – krav på borttagning inom ${fristTimmar} timmar (ärende ${id})`;
      const text = [
        `Till företagsledningen / ansvarig för ${doman}`,
        '',
        `${foretag.namn} (org.nr ${foretag.orgnr}) driver ${brand}${butik ? ` (${butik})` : ''}. Vi har den ${datumText(forstaSedd, 'sv')} dokumenterat att ni på`,
        '',
        `    ${derasUrl}`,
        '',
        'använder material som vi har skapat och äger rättigheterna till:',
        '',
        ...rader,
        '',
        'Texterna, fotografierna och filmerna är framställda av oss och skyddas av lagen (1960:729) om upphovsrätt till litterära och konstnärliga verk (1, 2 och 49 a §§). Att kopiera vår marknadsföring och våra produktsidor är dessutom vilseledande efterbildning och renommésnyltning enligt marknadsföringslagen (2008:486), 5, 8 och 14 §§.',
        '',
        `Vi kräver att ni senast ${fristText(nu, fristTimmar, 'sv')}, det vill säga inom ${fristTimmar} timmar från detta mejl:`,
        '',
        `1. tar bort allt kopierat material – text, bilder och film – från ${doman} och från alla annonser, sociala kanaler och marknadsplatser där det används,`,
        `2. skriftligen bekräftar till ${mail} att så har skett, och`,
        '3. avstår från all framtida användning av vårt material.',
        '',
        'Sker inte det kommer vi utan ytterligare påminnelse att:',
        '',
        `– anmäla intrånget till Meta (Facebook och Instagram)${shopify ? ' och till Shopify' : ' och till er e-handelsplattform'} enligt deras rutiner för immaterialrättsintrång, vilket normalt leder till att annonser och butiker stängs av,`,
        '– anmäla intrånget till er domänregistrar och ert webbhotell, och',
        '– överlämna ärendet till vårt ombud för talan vid Patent- och marknadsdomstolen om vitesförbud, skälig ersättning och skadestånd enligt 54 § upphovsrättslagen, för hela den tid materialet använts.',
        '',
        `Bevisen är säkrade ${skarmdump ? 'med tidsstämplade skärmdumpar och kopior av era sidor' : 'med kopior av era sidor'} per ${datumText(forstaSedd, 'sv')}.`,
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
    const amne = `Copyright infringement on ${doman} – removal required within ${fristTimmar} hours (case ${id})`;
    const text = [
      `To the management / person responsible for ${doman}`,
      '',
      `${foretag.namn} (Swedish company reg. no. ${foretag.orgnr}) operates ${brand}${butik ? ` (${butik})` : ''}. On ${datumText(forstaSedd, 'en')} we documented that at`,
      '',
      `    ${derasUrl}`,
      '',
      'you are using material that we created and hold the rights to:',
      '',
      ...rader,
      '',
      'The texts, photographs and videos were produced by us and are protected under the Swedish Act on Copyright in Literary and Artistic Works (1960:729), sections 1, 2 and 49 a, and internationally under the Berne Convention. Copying our marketing and product pages also constitutes misleading imitation and unfair exploitation of our reputation under the Swedish Marketing Act (2008:486), sections 5, 8 and 14.',
      '',
      `We require that no later than ${fristText(nu, fristTimmar, 'en')}, i.e. within ${fristTimmar} hours of this email, you:`,
      '',
      `1. remove all copied material – text, images and video – from ${doman} and from every ad, social channel and marketplace where it is used,`,
      `2. confirm in writing to ${mail} that this has been done, and`,
      '3. refrain from any future use of our material.',
      '',
      'Failing that, we will without further notice:',
      '',
      `– report the infringement to Meta (Facebook and Instagram)${shopify ? ' and to Shopify' : ' and to your e-commerce platform'} under their intellectual property procedures, which normally results in ads and stores being taken down,`,
      '– report the infringement to your domain registrar and hosting provider, and',
      '– hand the matter to our counsel for proceedings before the Swedish Patent and Market Court for an injunction under penalty of a fine, reasonable compensation and damages under section 54 of the Copyright Act, for the entire period the material has been used.',
      '',
      `Evidence has been secured ${skarmdump ? 'with time-stamped screenshots and copies of your pages' : 'with copies of your pages'} as of ${datumText(forstaSedd, 'en')}.`,
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
      `Den ${datumText(skickat, 'sv')} krävde vi att ni tar bort vårt upphovsrättsskyddade material från ${derasUrl}. Fristen löpte ut ${fristText(skickat, fristTimmar, 'sv')}. Vid vår kontroll ${datumText(kollad, 'sv')} ligger materialet kvar:`,
      '',
      ...rader,
      '',
      `Ni får en sista frist till ${fristText(nu, paminnelseTimmar, 'sv')}. Därefter anmäler vi intrånget till Meta${shopify ? ' och Shopify' : ' och er e-handelsplattform'} och lämnar ärendet till vårt ombud för talan vid Patent- och marknadsdomstolen, med krav på ersättning enligt 54 § upphovsrättslagen för hela den tid materialet använts.`,
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
    `On ${datumText(skickat, 'en')} we required you to remove our copyrighted material from ${derasUrl}. The deadline expired ${fristText(skickat, fristTimmar, 'en')}. At our check on ${datumText(kollad, 'en')} the material is still in use:`,
    '',
    ...rader,
    '',
    `You have a final deadline of ${fristText(nu, paminnelseTimmar, 'en')}. After that we will report the infringement to Meta${shopify ? ' and Shopify' : ' and your e-commerce platform'} and hand the matter to our counsel for proceedings before the Swedish Patent and Market Court, claiming compensation under section 54 of the Copyright Act for the entire period the material has been used.`,
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
