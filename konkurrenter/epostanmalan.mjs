// konkurrenter/epostanmalan.mjs — upphovsrättsanmälan via MEJL till plattformens utsedda ombud (2026-10-01).
//
// Vägen när formuläret inte går. Metas formulär kräver en säkerhetskontroll (captcha) vid
// Submit från containern (mätt 2026-09-29, 09-30 och 10-01), och den löses aldrig härifrån.
// Cowork vägrade 2026-10-01 att skicka in anmälningar mot andra bolag, och Axel ville inte
// fylla i dem själv ("Jag gör inte det där manuellt"). Båda plattformarna anger ett utsett
// ombud (designated agent) med mejladress. ⛔ För Meta gick det INTE (se META_OMBUD nedan):
// Meta granskar bara formuläret. Det som står på sidorna, läst 2026-10-01:
//   Meta:    "Meta Platforms, Inc. Attn: Meta Designated Agent 1601 Willow Road Menlo Park,
//            California 94025 … ip@fb.com". Med andra vägar än formuläret "you must include a
//            complete copyright claim" (facebook.com/help/190268144407210).
//   Shopify: "If you can't use the online form, then you can send a notice with the required
//            information to Shopify's designated agent at: … legal@shopify.com"
//            (help.shopify.com/en/manual/compliance/intellectual-property/copyright-policy).
//
// Mejlets brödtext har INGA länkar och domäner: Gmail-connectorn skriver om dem till
// google.com/url?q=… (mätt 2026-09-29). Ändå bär den allt ett komplett anspråk kräver:
// annonserna som id, vårt verk, kontaktuppgifterna, försäkringarna och underskriften.
// Anmälningarna följer ordagrant, med alla länkar, som PDF-bilaga (textpdf.mjs).
// Texterna är exakt de Axel sagt Ja till i granskningsappen (anmalanText / shopifyText).
// Allt här är rent; sändningen sker i sessionen med Gmail-connectorn.

import { createHash } from 'node:crypto';
import { anmalanText } from './anmalan.mjs';
import { shopifyText } from './shopify-anmalan.mjs';
import { harLankbartOrd } from './brevpdf.mjs';
import { TextPdf, radbryt, textbredd } from './textpdf.mjs';

// ⛔ Meta granskar INTE anmälningar som kommer via mejl. Det mättes 2026-10-02: åtta mejl till
// ip@fb.com (KD-2026-004) fick svar från support.facebook.com: "We require rights holders to use
// Meta's online forms … Your report will not be reviewed unless it is submitted through one of
// these forms." För Meta gäller alltså bara formuläret, och `granskar: false` stoppar mejlvägen
// i kor.mjs. Shopify tar emot mejl enligt sin egen policy.
export const META_OMBUD = Object.freeze({ till: 'ip@fb.com', namn: "Meta's Designated Agent", kalla: 'https://www.facebook.com/help/190268144407210/', granskar: false, svar: 'Your report will not be reviewed unless it is submitted through one of these forms.' });
export const SHOPIFY_OMBUD = Object.freeze({ till: 'legal@shopify.com', namn: "Shopify's Designated Agent (Trust & Safety)", kalla: 'https://help.shopify.com/en/manual/compliance/intellectual-property/copyright-policy', granskar: true });

const idUr = (url) => String(url ?? '').match(/[?&]id=(\d+)/)?.[1] ?? null;
const sidaUr = (url) => String(url ?? '').match(/view_all_page_id=(\d+)/)?.[1] ?? null;

/** Anmälans text i PDF:en: samma som anmalanText, utan formulärlänken och den lokala filsökvägen. Ren. */
export function noticeText(a) {
  return anmalanText(a).split('\n')
    .map((r) => r.replace(/^REPORT (\d+)\/(\d+) — case (\S+) — form: .*$/, 'NOTICE $1/$2 — reference $3'))
    .map((r) => r.replace('— Declarations (tick all) —', '— Statements —').replace(/^\[x\] /, '- '))
    .map((r) => (/^Phone: ?$/.test(r) ? null : r))
    .map((r) => (r?.startsWith('Attachment: ') ? (/ · (https?:\/\/\S+)$/.test(r) ? `Evidence image: ${r.match(/ · (https?:\/\/\S+)$/)[1]}` : null) : r))
    .filter((r) => r !== null)
    .join('\n');
}

/** "our original: Ad Library ID x" / "an ad on our Page (Page ID y)" ur anmälans originallänkar. Ren. */
function vartOriginal(a) {
  const urls = a.falt?.originalWorkUrls ?? [];
  const ids = urls.map(idUr).filter(Boolean);
  if (ids.length) return `our original: Ad Library ID ${ids.join(' and ')}`;
  const sida = urls.map(sidaUr).find(Boolean);
  return sida ? `our original: an ad on our Page (Page ID ${sida}) in the Ad Library` : 'our original: see the attached notice';
}

function underskrift(f) {
  return [
    `Electronic signature: ${f.signature ?? f.reporter?.fullName}`,
    '',
    `${f.reporter?.fullName}, ${String(f.rightsOwner?.relationship ?? '').match(/^CEO\b/) ? 'CEO, ' : ''}${f.rightsOwner?.name}`,
    f.reporter?.address,
  ].filter((r) => r !== undefined).join('\n');
}

/**
 * Länkar och domäner ur en text, så att Gmail-connectorn inte gör om dem: en annons i
 * annonsbiblioteket blir "Ad Library ID x", sidans lista "the Ad Library (Page ID y)", en
 * butiksdomän butikens namn och allt annat "(link in the attached notice)". Ren.
 */
export function utanLankar(text) {
  return String(text ?? '')
    .replace(/https?:\/\/(?:www\.)?facebook\.com\/ads\/library\/\?id=(\d+)/g, 'Ad Library ID $1')
    .replace(/https?:\/\/(?:www\.)?facebook\.com\/ads\/library\/\?[^\s"]*view_all_page_id=(\d+)[^\s"]*/g, 'the Ad Library (Page ID $1)')
    .replace(/https?:\/\/[^\s"]+?\.png[^\s"]*/g, '(link in the attached notice)')
    .replace(/https?:\/\/(?:www\.)?([a-z0-9-]+)\.(?:se|com|no|dk|fi|shop|store)\b[^\s"]*/gi, (_, namn) => namn.charAt(0).toUpperCase() + namn.slice(1))
    .replace(/https?:\/\/[^\s"]+/g, '(link in the attached notice)')
    .replace(/\(links below\)/g, '(links in the attached notice)')
    .replace(/\bare at the links below\./g, 'are linked in the attached notice.')
    .replace(/\b([a-z0-9-]+)\.(?:se|com|no|dk|fi|shop|store)\b/gi, (_, namn) => namn.charAt(0).toUpperCase() + namn.slice(1));
}

/**
 * Mejlet till Metas ombud för EN anmälan: en annons per mejl, som en anmälan per annons i
 * formuläret (Axels order 2026-09-29: "tio rippade annonser = tio olika reports"). Bilagan
 * blir liten (en sida), så att base64-texten i verktygsanropet går att skriva av säkert.
 * `a` = anmälans JSON (anmalan/<nr>.json). Kastar om brödtexten bär en länk eller domän. Ren.
 */
export function metaMejlFor({ arende, sidnamn, sidaId, a }) {
  const f = a.falt;
  const ad = idUr(a.lank) ?? a.lank;
  const amne = `Copyright infringement notice ${a.nr}/${a.antal}: ad ${ad} by the Facebook Page "${sidnamn}"`;
  const text = [
    `To ${META_OMBUD.namn},`,
    '',
    `I am the CEO of the rights owner ${f.rightsOwner.name} (Swedish company, reg. no. ${f.rightsOwner.registrationNumber}), and I am writing on its behalf to report copyright infringement on Facebook. This is notice ${a.nr} of ${a.antal} about ads run by the Facebook Page "${sidnamn}" (Page ID ${sidaId}). Each ad is reported in a separate email.`,
    '',
    `Infringing ad: Ad Library ID ${ad} (${a.video ? 'video ad' : 'image ad'}), run by the Page "${sidnamn}" (Page ID ${sidaId}).`,
    `${vartOriginal(a).replace(/^our original/, 'Our original')}.`,
    '',
    `What was copied: ${utanLankar(f.contentDescription)}`,
    '',
    `Our work: ${utanLankar(f.originalWorkDescription)}`,
    '',
    'The attached PDF contains this notice with all links: the reported ad, our original ad, and an evidence image that shows our material next to the same material in the reported ad. Please remove this ad.',
    '',
    ...f.declarations,
    '',
    underskrift(f),
    '',
    `Our reference: ${arende}, notice ${a.nr}/${a.antal}`,
  ].join('\n');
  if (harLankbartOrd(text)) throw new Error(`mejlets brödtext (anmälan ${a.nr}) innehåller en länk eller domän — Gmail-connectorn gör om den`);
  return { till: META_OMBUD.till, amne, text, pdf: { titel: `Copyright infringement notice ${a.nr}/${a.antal} — ${sidnamn} — ${arende}`, block: [noticeText(a)] } };
}

/** Mejlet till Shopifys ombud för Shopify-anmälan (shopify/anmalan.json). Ren. */
export function shopifyMejl({ arende, butiksnamn, an }) {
  const f = an.falt;
  const amne = `Copyright infringement notice (DMCA): our video on the Shopify store "${butiksnamn}"`;
  const m = an.matt;
  const text = [
    `To ${SHOPIFY_OMBUD.namn},`,
    '',
    `I am sending this copyright notice by email to your designated agent, as described in your copyright policy. I am the CEO of the rights owner ${f.foretag.replace(/\s*\(reg\. no\. ([\d-]+)\)/, ' (Swedish company, reg. no. $1)')}.`,
    '',
    `A Shopify store named "${butiksnamn}" shows an animated image on its product page that is cut from our own advertising video "${an.film}"${an.filmSkapad ? `, published by us on ${new Date(an.filmSkapad).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Stockholm' })}` : ''}${m ? `: ${m.traffar} of its ${m.antal} sampled frames are identical to frames of our video` : ''}. The store, the product page, the exact file and our original are listed in the attached notice, with a link to an evidence image that shows our frames next to theirs. Please remove the animated image.`,
    '',
    ...(an.forsakringar ?? []),
    '',
    `Electronic signature: ${f.signatur}`,
    '',
    `${f.namn}${f.titel ? `, ${f.titel}` : ''}, ${f.foretag.replace(/\s*\(reg\. no\. [\d-]+\)/, '')}`,
    f.adress,
    '',
    `Our reference: ${arende}`,
  ].join('\n');
  if (harLankbartOrd(text)) throw new Error('mejlets brödtext innehåller en länk eller domän — Gmail-connectorn gör om den');
  return {
    till: SHOPIFY_OMBUD.till, amne, text,
    pdf: { titel: `Copyright infringement notice — ${butiksnamn} — ${arende}`, block: [`NOTICE — reference ${arende}\n\n${shopifyText(an)}`] },
  };
}

/**
 * PDF-bilagan ur ett Gmail-utkasts RAW (base64url av hela meddelandet, eller en avskriven
 * bit som börjar före bilagans rubriker): { filnamn, bytes, base64 }. En bit som inte börjar
 * på en hel base64-grupp prövas från alla fyra startpunkterna. Kastar när ingen PDF-del finns. Ren.
 */
export function bilagaUrRaw(raw) {
  const s = String(raw ?? '').replace(/\s+/g, '');
  for (let d = 0; d < 4; d++) {
    let t = s.slice(d);
    if (!t.endsWith('=')) t = t.slice(0, t.length - (t.length % 4));
    const b = Buffer.from(t, 'base64');
    const i = b.indexOf('Content-Type: application/pdf');
    if (i < 0) continue;
    const slut = b.indexOf('\r\n\r\n', i);
    if (slut < 0) continue;
    const huvud = b.subarray(i, slut).toString('latin1');
    let kropp = b.subarray(slut + 4);
    const j = kropp.indexOf('\r\n--');
    if (j >= 0) kropp = kropp.subarray(0, j);
    const base64 = kropp.toString('latin1').replace(/\s+/g, '');
    return { filnamn: huvud.match(/filename="?([^"\r\n;]+)/)?.[1] ?? null, bytes: Buffer.from(base64, 'base64'), base64 };
  }
  throw new Error('hittade ingen PDF-bilaga i RAW-texten');
}

/**
 * Kontrollen före Skicka: utkastets bilaga mot filen. `olika` säger vad ett fel är —
 * ett eller ett par tecken = avskriftsfel i RAW-kopian (O mot 0 gav ett 2026-10-02), en lång
 * rad = fel bilaga i utkastet (utkast 6 bar anmälan 7:s PDF 2026-10-02). Ren.
 */
export function kollaBilaga(raw, pdf) {
  const b = bilagaUrRaw(raw);
  const sha = createHash('sha256').update(b.bytes).digest('hex');
  const shaFil = createHash('sha256').update(pdf).digest('hex');
  if (sha === shaFil) return { ok: true, filnamn: b.filnamn, sha, shaFil, olika: 0, forsta: null };
  const fil = pdf.toString('base64');
  let olika = 0; let forsta = null;
  for (let k = 0; k < Math.max(fil.length, b.base64.length); k++) if (fil[k] !== b.base64[k]) { olika++; if (forsta === null) forsta = k; }
  return { ok: false, filnamn: b.filnamn, sha, shaFil, olika, forsta };
}

/** Kvittoraden i epost/skickat.jsonl för ett skickat mejl. Kastar när namnet redan står där — ett mejl skickas aldrig två gånger. Ren. */
export function skickatRad(rader, { namn, till, gmail, trad = null, sha256 = null, nar, kontroll = null }) {
  if (!namn || !gmail) throw new Error('skickatRad kräver namn och gmail-id');
  const fore = (rader ?? []).find((r) => r.namn === namn);
  if (fore) throw new Error(`${namn} är redan skickad (Gmail ${fore.gmail_id}) — ett mejl skickas aldrig två gånger.`);
  return { namn, till, gmail_id: gmail, trad, ...(sha256 ? { sha256 } : {}), nar, ...(kontroll ? { kontroll } : {}) };
}

/**
 * PDF:en med anmälningarna: en ny sida per anmälan, radbruten text i Helvetica, varje
 * länk klickbar. Ren (Buffer ut).
 */
export function noticePdf({ titel, block, skapad = new Date() }) {
  const pdf = new TextPdf();
  const vanster = 56; const bredd = pdf.bredd - 2 * vanster; const botten = pdf.hojd - 56;
  const storlek = 9.5; const radhojd = 13.2;
  block.forEach((text, i) => {
    if (i > 0) pdf.nySida();
    let y = 64;
    pdf.text(vanster, y, titel, { storlek: 8, farg: '#5b6570' }); y += 22;
    for (const stycke of String(text).split('\n')) {
      const rubrik = /^(NOTICE\b|— .* —$)/.test(stycke);
      if (!stycke.trim()) { y += radhojd * 0.6; continue; }
      // Styckets HELA länkar: en länk som radbryts blir klickbar på varje rad den står på, och
      // varje del pekar på hela länken (en halv länk till sidans annonslista hade visat fel sida).
      const hela = [...stycke.matchAll(/https?:\/\/[^\s)"]+/g)].map((u) => u[0].replace(/[.,]$/, ''));
      let kvar = hela.map((u) => ({ u, rest: u }));
      for (const rad of radbryt(stycke, bredd, rubrik ? 10.5 : storlek, { fet: rubrik })) {
        if (y > botten) { pdf.nySida(); y = 64; }
        pdf.text(vanster, y, rad, { storlek: rubrik ? 10.5 : storlek, fet: rubrik });
        for (const k of kvar) {
          if (!k.rest) continue;
          // Början av det som återstår av länken: på raden där länken börjar står den efter text, på
          // en fortsättningsrad står den först.
          const i = rad.indexOf(k.rest.slice(0, Math.min(k.rest.length, 12)));
          if (i < 0) continue;
          let n = 0; while (n < k.rest.length && i + n < rad.length && rad[i + n] === k.rest[n]) n++;
          if (n < Math.min(k.rest.length, 12)) continue;
          pdf.lank(vanster + (i ? textbredd(rad.slice(0, i), storlek) : 0), y - storlek, textbredd(rad.slice(i, i + n), storlek), storlek + 3, k.u);
          k.rest = k.rest.slice(n);
        }
        kvar = kvar.filter((k) => k.rest);
        y += rubrik ? radhojd * 1.25 : radhojd;
      }
    }
  });
  return pdf.bytes({ titel, skapad });
}

