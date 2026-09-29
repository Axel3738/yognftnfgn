// konkurrenter/faktura.mjs — fakturan som följer med brevet (Axels order
// 2026-09-29: "vi skickar med en färdig faktura"). Skälig ersättning för
// nyttjandet enligt 54 § upphovsrättslagen, räknad ur ärendets BEVIS och
// taxan i konfig.json → faktura.taxa. Inga påhittade rader: en rad per
// kopierad produkttext, annons och bild som rutinen mätt.
//
// Betalas fakturan i tid och materialet tas bort inom fristen avslutas
// ärendet — det är förlikningserbjudandet i brevet. Beloppen är Axels beslut
// (taxan), bankuppgifterna hans (faktura.bankgiro/iban). Utan bankgiro eller
// IBAN vägrar kontrollen: en faktura utan konto att betala till är bara ett hot.
//
// PDF:en görs i Chromium (page.pdf) — inga npm-beroenden.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export const STANDARDTAXA = Object.freeze({ annons: 5000, video: 8000, bild: 3000, produkttext: 5000 });

const ORD = {
  sv: { produkttext: 'Produkttext kopierad från vår produktsida', annons: 'Annonstext kopierad från vår annons', video: 'Annonsfilm kopierad från vår annons', bild: 'Produktbild kopierad', titel: 'FAKTURA', datum: 'Fakturadatum', forfaller: 'Förfallodag', nr: 'Fakturanummer', ref: 'Vår referens', saljare: 'Säljare', kopare: 'Köpare', beskrivning: 'Beskrivning', antal: 'Antal', apris: 'À-pris', belopp: 'Belopp', netto: 'Summa', moms: 'Moms', att_betala: 'Att betala', bankgiro: 'Bankgiro', iban: 'IBAN', bic: 'BIC', orgnr: 'Org.nr', grund: 'Skälig ersättning för olovligt nyttjande av upphovsrättsligt skyddat material enligt 54 § lagen (1960:729) om upphovsrätt till litterära och konstnärliga verk. Ersättningen avser nyttjandet till och med fakturadatum; fortsatt nyttjande faktureras särskilt. Underlag: ärende', villkor: 'Betalningsvillkor', villkorText: (d) => `${d} dagar netto. Vid försenad betalning debiteras dröjsmålsränta enligt räntelagen (referensräntan + 8 procentenheter) samt lagstadgad påminnelseavgift.`, ange: 'Ange fakturanumret som referens vid betalning.' },
  en: { produkttext: 'Product text copied from our product page', annons: 'Ad copy copied from our ad', video: 'Ad video copied from our ad', bild: 'Product photo copied', titel: 'INVOICE', datum: 'Invoice date', forfaller: 'Due date', nr: 'Invoice number', ref: 'Our reference', saljare: 'Seller', kopare: 'Buyer', beskrivning: 'Description', antal: 'Qty', apris: 'Unit price', belopp: 'Amount', netto: 'Subtotal', moms: 'VAT', att_betala: 'Total due', bankgiro: 'Bankgiro (Sweden)', iban: 'IBAN', bic: 'BIC', orgnr: 'Reg. no.', grund: 'Reasonable compensation for unauthorised use of copyright-protected material under section 54 of the Swedish Act on Copyright in Literary and Artistic Works (1960:729). Covers use up to the invoice date; continued use is invoiced separately. Basis: case', villkor: 'Payment terms', villkorText: (d) => `${d} days net. Late payment incurs statutory interest under the Swedish Interest Act (reference rate + 8 percentage points) and a statutory reminder fee.`, ange: 'Quote the invoice number as payment reference.' },
};

/** Fakturanumret: F-<ärende>-<löpnummer>. Ren. */
export const fakturanummer = (arendeId, lopnr = 1) => `F-${arendeId}-${lopnr}`;

/**
 * Belopp som "25 000 kr" / "25,000 SEK". Ren. Intl skriver tusentalsavgränsaren
 * som smalt hårt mellanslag (U+202F) på svenska — det blir en ruta i äldre
 * mejlklienter, så den byts mot ett vanligt mellanslag.
 */
export function belopp(n, valuta = 'SEK', sprak = 'sv') {
  const tal = new Intl.NumberFormat(sprak === 'sv' ? 'sv-SE' : 'en-GB', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0)).replace(/[  ]/g, ' ');
  return sprak === 'sv' && valuta === 'SEK' ? `${tal} kr` : `${tal} ${valuta}`;
}

/** Fakturaraderna ur bevisen. En rad per mätt sak, aldrig mer. Ren. */
export function fakturarader(arende, taxa = {}, sprak = 'sv') {
  const t = { ...STANDARDTAXA, ...(taxa ?? {}) };
  const L = ORD[sprak] ?? ORD.sv;
  const b = arende.bevis ?? {};
  const rader = [];
  if (b.text?.styrka) rader.push({ typ: 'produkttext', beskrivning: `${L.produkttext}${arende.var?.produkt?.titel ? ` (${arende.var.produkt.titel}, ${b.text.kopieradeOrd} ${sprak === 'sv' ? 'ord' : 'words'})` : ''}`, antal: 1, apris: t.produkttext });
  const annonser = Array.isArray(b.annonser) && b.annonser.length ? b.annonser : (b.annons?.styrka ? [{ text: b.annons, video: false, varAnnons: arende.var?.annons ?? null, lank: null }] : []);
  for (const a of annonser) {
    if (!a.text?.styrka && !(a.bilder?.length)) continue;
    const namn = a.varAnnons?.namn ? ` (${a.varAnnons.namn})` : '';
    rader.push({ typ: a.video ? 'video' : 'annons', beskrivning: `${a.video ? L.video : L.annons}${namn}${a.lank ? ` — ${a.lank}` : ''}`, antal: 1, apris: a.video ? t.video : t.annons });
  }
  const bilder = new Set([...(b.bilder ?? []).map((x) => x.deras), ...annonser.flatMap((a) => (a.bilder ?? []).map((x) => x.deras))].filter(Boolean));
  if (bilder.size) rader.push({ typ: 'bild', beskrivning: `${L.bild} (${bilder.size} ${sprak === 'sv' ? 'st' : 'pcs'})`, antal: bilder.size, apris: t.bild });
  return rader.map((r) => ({ ...r, belopp: r.antal * r.apris }));
}

/**
 * Hela fakturan ur ärendet + konfig. `kopare` kan ges av Axel (--kopare
 * "Bolag AB, Gatan 1, 123 45 Stad") när sidan inte säger vem som står bakom.
 */
export function byggFaktura(arende, konfig, { nu = new Date(), lopnr = 1, sprak = 'sv', kopare = null } = {}) {
  const f = konfig.faktura ?? {};
  const rader = fakturarader(arende, f.taxa, sprak);
  const netto = rader.reduce((s, r) => s + r.belopp, 0);
  const momsProcent = Number(f.moms_procent ?? 0);
  const moms = Math.round(netto * momsProcent / 100);
  const datum = nu.toISOString().slice(0, 10);
  const forfaller = new Date(nu.getTime() + (Number(f.betalvillkor_dagar) || 10) * 86_400_000).toISOString().slice(0, 10);
  const deras = arende.deras ?? {};
  const koparen = kopare
    ? (typeof kopare === 'string' ? { namn: kopare.split(',')[0].trim(), adress: kopare.split(',').slice(1).join(',').trim() || null, orgnr: deras.orgnr?.[0]?.nr ?? null, mail: arende.brev?.mottagare ?? deras.mottagare ?? null, doman: deras.doman ?? null } : kopare)
    : { namn: deras.foretag ?? deras.sidnamn ?? deras.doman ?? '?', adress: deras.adress ?? null, orgnr: deras.orgnr?.[0]?.nr ?? null, mail: arende.brev?.mottagare ?? deras.mottagare ?? null, doman: deras.doman ?? null };
  return {
    nr: fakturanummer(arende.id, lopnr), datum, forfaller, valuta: f.valuta ?? 'SEK', sprak, betalvillkor_dagar: Number(f.betalvillkor_dagar) || 10,
    saljare: { ...(konfig.brev?.foretag ?? {}), bankgiro: String(f.bankgiro ?? '').trim(), iban: String(f.iban ?? '').trim(), bic: String(f.bic ?? '').trim(), mail: konfig.brev?.avsandare?.mail ?? '' },
    kopare: koparen, rader, netto, momsProcent, moms, brutto: netto + moms, referens: arende.id,
  };
}

/** Det som stoppar en faktura: inga rader, inget belopp, inget konto att betala till. Ren. */
export function kontrolleraFaktura(f) {
  const fel = [];
  if (!f?.rader?.length) fel.push('inga fakturarader — ärendet har inga mätta bevis att fakturera');
  if (!(f?.brutto > 0)) fel.push('fakturan är på 0 kr — kontrollera taxan i konkurrenter/konfig.json → faktura.taxa');
  if (!f?.saljare?.bankgiro && !f?.saljare?.iban) fel.push('bankgiro eller IBAN saknas i konkurrenter/konfig.json → faktura (Axels uppgift)');
  if (!f?.saljare?.orgnr) fel.push('org.nr saknas i konkurrenter/konfig.json → brev.foretag');
  if (!f?.kopare?.namn || f.kopare.namn === '?') fel.push('köparen saknar namn — ange med --kopare "Bolag AB, adress"');
  return fel;
}

/** Fakturan som textblock i brevet. Ren. */
export function fakturaText(f) {
  const L = ORD[f.sprak] ?? ORD.sv;
  const rader = f.rader.map((r) => `  ${r.beskrivning}: ${r.antal} × ${belopp(r.apris, f.valuta, f.sprak)} = ${belopp(r.belopp, f.valuta, f.sprak)}`);
  const konto = [f.saljare.bankgiro && `${L.bankgiro} ${f.saljare.bankgiro}`, f.saljare.iban && `${L.iban} ${f.saljare.iban}${f.saljare.bic ? ` (${L.bic} ${f.saljare.bic})` : ''}`].filter(Boolean).join(' · ');
  return [`${L.titel} ${f.nr} — ${L.forfaller.toLowerCase()} ${f.forfaller}`, ...rader, `  ${L.att_betala}: ${belopp(f.brutto, f.valuta, f.sprak)}${f.momsProcent ? ` (${L.moms} ${f.momsProcent} %)` : ''}`, `  ${konto}`].join('\n');
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Fakturan som A4-sida (HTML → PDF i Chromium). Ren. */
export function fakturaHtml(f) {
  const L = ORD[f.sprak] ?? ORD.sv;
  const s = f.saljare; const k = f.kopare;
  const rader = f.rader.map((r) => `<tr><td>${esc(r.beskrivning)}</td><td class="tal">${r.antal}</td><td class="tal">${esc(belopp(r.apris, f.valuta, f.sprak))}</td><td class="tal">${esc(belopp(r.belopp, f.valuta, f.sprak))}</td></tr>`).join('');
  return `<!doctype html><html lang="${f.sprak}"><head><meta charset="utf-8"><title>${esc(L.titel)} ${esc(f.nr)}</title>
<style>
@page{size:A4;margin:18mm 16mm}
body{font:11pt/1.45 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:#151a21;margin:0}
h1{font-size:26pt;letter-spacing:.06em;margin:0 0 2mm}
.huvud{display:flex;justify-content:space-between;gap:12mm;border-bottom:2px solid #151a21;padding-bottom:5mm;margin-bottom:6mm}
.meta td{padding:0 6mm 0 0;vertical-align:top}
.parter{display:flex;gap:12mm;margin-bottom:7mm}
.part{flex:1}.part h2{font-size:9pt;text-transform:uppercase;letter-spacing:.08em;color:#5b6570;margin:0 0 1.5mm}
table.rader{width:100%;border-collapse:collapse;margin-bottom:5mm}
table.rader th{text-align:left;font-size:9pt;text-transform:uppercase;letter-spacing:.06em;color:#5b6570;border-bottom:1px solid #151a21;padding:2mm 1mm}
table.rader td{padding:2.5mm 1mm;border-bottom:1px solid #d5dad2;vertical-align:top}
.tal{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.summa{margin-left:auto;width:70mm}.summa td{padding:1.2mm 1mm}.summa .stor td{font-size:14pt;font-weight:700;border-top:2px solid #151a21;padding-top:2.5mm}
.grund{font-size:9.5pt;color:#333;margin:6mm 0;padding:4mm;background:#f2f4f1;border-radius:2mm}
.betal{display:flex;gap:10mm;margin-top:4mm}.betal div{flex:1}
.fot{position:fixed;bottom:0;left:0;right:0;font-size:8.5pt;color:#5b6570;border-top:1px solid #d5dad2;padding-top:2mm}
</style></head><body>
<div class="huvud">
  <div><h1>${esc(L.titel)}</h1><table class="meta"><tr><td>${esc(L.nr)}</td><td><strong>${esc(f.nr)}</strong></td></tr><tr><td>${esc(L.datum)}</td><td>${esc(f.datum)}</td></tr><tr><td>${esc(L.forfaller)}</td><td><strong>${esc(f.forfaller)}</strong></td></tr><tr><td>${esc(L.ref)}</td><td>${esc(f.referens)}</td></tr></table></div>
  <div style="text-align:right"><strong>${esc(s.namn)}</strong><br>${esc(L.orgnr)} ${esc(s.orgnr)}<br>${esc(s.adress)}<br>${esc(s.mail)}</div>
</div>
<div class="parter">
  <div class="part"><h2>${esc(L.kopare)}</h2><strong>${esc(k.namn)}</strong>${k.orgnr ? `<br>${esc(L.orgnr)} ${esc(k.orgnr)}` : ''}${k.adress ? `<br>${esc(k.adress)}` : ''}${k.doman ? `<br>${esc(k.doman)}` : ''}${k.mail ? `<br>${esc(k.mail)}` : ''}</div>
  <div class="part"><h2>${esc(L.saljare)}</h2><strong>${esc(s.namn)}</strong><br>${esc(L.orgnr)} ${esc(s.orgnr)}<br>${esc(s.adress)}</div>
</div>
<table class="rader"><thead><tr><th>${esc(L.beskrivning)}</th><th class="tal">${esc(L.antal)}</th><th class="tal">${esc(L.apris)}</th><th class="tal">${esc(L.belopp)}</th></tr></thead><tbody>${rader}</tbody></table>
<table class="summa"><tr><td>${esc(L.netto)}</td><td class="tal">${esc(belopp(f.netto, f.valuta, f.sprak))}</td></tr><tr><td>${esc(L.moms)} ${f.momsProcent} %</td><td class="tal">${esc(belopp(f.moms, f.valuta, f.sprak))}</td></tr><tr class="stor"><td>${esc(L.att_betala)}</td><td class="tal">${esc(belopp(f.brutto, f.valuta, f.sprak))}</td></tr></table>
<div class="grund">${esc(L.grund)} <strong>${esc(f.referens)}</strong>.</div>
<div class="betal">
  <div><h2 style="font-size:9pt;text-transform:uppercase;letter-spacing:.08em;color:#5b6570;margin:0 0 1.5mm">${esc(L.villkor)}</h2>${esc(L.villkorText(f.betalvillkor_dagar))} ${esc(L.ange)}</div>
  <div>${s.bankgiro ? `<div><strong>${esc(L.bankgiro)}:</strong> ${esc(s.bankgiro)}</div>` : ''}${s.iban ? `<div><strong>${esc(L.iban)}:</strong> ${esc(s.iban)}</div>` : ''}${s.bic ? `<div><strong>${esc(L.bic)}:</strong> ${esc(s.bic)}</div>` : ''}</div>
</div>
<div class="fot">${esc(s.namn)} · ${esc(L.orgnr)} ${esc(s.orgnr)} · ${esc(s.adress)} · ${esc(s.mail)}</div>
</body></html>`;
}

/** HTML → PDF i Chromium. Returnerar filens sökväg, eller kastar med orsak. */
export async function fakturaPdf(html, fil, { playwrightSokvag = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs', kandidater = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'] } = {}) {
  let pw;
  try { pw = await import(playwrightSokvag); } catch (e) { throw new Error(`Playwright saknas (${e.message.split('\n')[0]}) — PDF:en kan inte göras här`); }
  const exe = kandidater.find((k) => existsSync(k));
  const browser = await pw.chromium.launch({ headless: true, args: ['--no-sandbox'], ...(exe ? { executablePath: exe } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    mkdirSync(dirname(fil), { recursive: true });
    await page.pdf({ path: fil, format: 'A4', printBackground: true, preferCSSPageSize: true });
    return fil;
  } finally { await browser.close().catch(() => {}); }
}

/** Skriver HTML-versionen bredvid PDF:en (för granskning utan Chromium). */
export function skrivFakturaHtml(html, fil) { mkdirSync(dirname(fil), { recursive: true }); writeFileSync(fil, html); return fil; }
