// konkurrenter/bevisbild.mjs — bevisbilden som följer med varje Meta-anmälan
// (Axels tips 2026-09-29: skärmdump i anmälan höjer träffsäkerheten). Ett
// kort per annons: vårt original till vänster, deras annons till höger, den
// kopierade texten markerad, ärendenummer, länkar och tidsstämpel. Byggs som
// HTML (rent) och renderas till PNG i Chromium — samma väg som fakturan.
// Bilderna ligger som data-URI:er (miniatyrerna i ärendet), inga externa
// anrop när kortet renderas. Här också verifieringssidan Axel läser innan
// allt skickas in: en gång, alla anmälningar, varje fält.

import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nar = (iso) => (iso ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Stockholm' }).format(new Date(iso)) : '?');

/** Markerar den kopierade passagen i deras text (ordagrann, skiftlägesokänslig, tolerant för skiljetecken). Ren. */
export function markera(text, passage) {
  const t = String(text ?? '');
  if (!passage) return esc(t);
  const ord = String(passage).split(/\s+/).filter(Boolean).map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (ord.length < 3) return esc(t);
  const re = new RegExp(ord.join('[\\s\\p{P}]*'), 'iu');
  const m = t.match(re);
  if (!m) return esc(t);
  const i = m.index; const j = i + m[0].length;
  return `${esc(t.slice(0, i))}<mark>${esc(t.slice(i, j))}</mark>${esc(t.slice(j))}`;
}

/**
 * Kortet för EN annons. `miniatyr(url)` ger en data-URI eller null.
 * Fast ljust tema med flit — bilden ska se likadan ut hos Metas granskare.
 */
export function bevisbildHtml(arende, annons, { miniatyr = () => null, nu = new Date().toISOString(), nr = 1, antal = 1 } = {}) {
  const prod = arende.var?.produkt ?? {};
  const varBild = miniatyr(annons.varAnnons?.bild) ?? miniatyr(prod.bilder?.[0]) ?? miniatyr(arende.var?.annons?.bild);
  const derasBild = annons.bilder?.map((b) => miniatyr(b.deras)).find(Boolean) ?? null;
  const passage = annons.text?.passager?.[0]?.text ?? null;
  const derasText = annons.derasText ?? '';
  const varText = annons.varAnnons?.text ?? arende.var?.annons?.text ?? '';
  const bild = (src, alt) => (src ? `<img src="${esc(src)}" alt="${esc(alt)}">` : '<div class="tom">No image in this ad</div>');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Evidence ${esc(arende.id)} — ad ${nr}</title>
<style>
body{margin:0;background:#fff;color:#151a21;font:15px/1.45 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;width:1200px}
.ram{padding:28px 32px}
h1{font-size:22px;margin:0 0 4px}
.meta{color:#5b6570;font-size:13px;margin:0 0 18px}
.par{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.kol{border:1px solid #d5dad2;border-radius:10px;padding:14px;background:#f7f8f6}
.kol h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#5b6570;margin:0 0 10px}
.kol.deras h2{color:#a24a08}
img{width:100%;max-height:440px;object-fit:contain;background:#fff;border-radius:6px;display:block;margin-bottom:10px}
.tom{height:200px;display:grid;place-items:center;color:#5b6570;background:#fff;border-radius:6px;margin-bottom:10px;border:1px dashed #d5dad2}
p{margin:0 0 8px}
.text{background:#fff;border-radius:6px;padding:10px 12px;font-size:14px;white-space:pre-wrap;max-height:260px;overflow:hidden}
mark{background:#ffe08a;padding:0 2px}
.rad{font-size:13px;color:#5b6570;word-break:break-all}
.fot{margin-top:16px;font-size:12px;color:#5b6570;border-top:1px solid #d5dad2;padding-top:10px;display:flex;justify-content:space-between;gap:20px}
.dom{margin-top:14px;padding:10px 14px;border-left:4px solid #a24a08;background:#fbe9d8;font-size:14px}
</style></head><body><div class="ram">
<h1>Copyright infringement evidence — case ${esc(arende.id)}, ad ${nr} of ${antal}</h1>
<p class="meta">Rights owner: Stonebite Ecom AB · Product: ${esc(prod.titel ?? prod.handle ?? '')} · Prepared ${esc(nar(nu))} (Stockholm)</p>
<div class="par">
  <div class="kol"><h2>Our original${annons.varAnnons?.namn ? ` — ${esc(annons.varAnnons.namn)}` : ''}</h2>${bild(varBild, 'Our original ad image')}<div class="text">${markera(varText, passage)}</div><p class="rad">${esc(prod.url ?? '')}</p></div>
  <div class="kol deras"><h2>Reported ad${arende.deras?.sidnamn ? ` — page "${esc(arende.deras.sidnamn)}"` : ''}</h2>${bild(derasBild, 'The reported ad')}<div class="text">${markera(derasText, passage)}</div><p class="rad">${esc(annons.lank ?? '')}${annons.exponeringar ? ` · EU reach ≈ ${Number(annons.exponeringar).toLocaleString('en-GB')}` : ''}${annons.start ? ` · running since ${esc(annons.start)}` : ''}</p></div>
</div>
${annons.text?.styrka ? `<div class="dom">${annons.text.kopieradeOrd} words copied verbatim — longest identical run ${annons.text.langsta} consecutive words (highlighted).${annons.bilder?.length ? ` ${annons.bilder.length} image(s) identical or near-identical to ours.` : ''}</div>` : annons.bilder?.length ? `<div class="dom">${annons.bilder.length} image(s) identical or near-identical to our copyrighted product photographs (perceptual hash distance ${annons.bilder.map((b) => b.avstand).join(', ')}/64).</div>` : ''}
<div class="fot"><span>Measured by an automated text/image comparison; passages are exact word-for-word matches.</span><span>${esc(arende.id)} · report ${nr}/${antal}</span></div>
</div></body></html>`;
}

/** HTML → PNG i Chromium (bredd 1200). Returnerar filen eller kastar med orsak. */
export async function bevisbildPng(html, fil, { playwrightSokvag = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs', kandidater = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'] } = {}) {
  let pw;
  try { pw = await import(playwrightSokvag); } catch (e) { throw new Error(`Playwright saknas (${e.message.split('\n')[0]}) — bevisbilden kan inte göras här`); }
  const exe = kandidater.find((k) => existsSync(k));
  const browser = await pw.chromium.launch({ headless: true, args: ['--no-sandbox'], ...(exe ? { executablePath: exe } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'load' });
    mkdirSync(dirname(fil), { recursive: true });
    await page.screenshot({ path: fil, type: 'png', fullPage: true });
    return fil;
  } finally { await browser.close().catch(() => {}); }
}

/**
 * Verifieringssidan (svenska, Axels): alla anmälningar för ett ärende, varje
 * fält som det kommer att fyllas i, bevisbilden, och EN instruktion. Ren.
 * `bilder` = { [nr]: dataUri } för bevisbilderna.
 */
export function verifieringHtml({ arende, anmalningar, bilder = {}, uppdaterad = new Date().toISOString() }) {
  const n = anmalningar.length;
  const kort = anmalningar.map((a) => {
    const f = a.falt;
    const rad = (k, v) => `<tr><th>${esc(k)}</th><td>${esc(v ?? '—')}</td></tr>`;
    return `<article>
<h2>Anmälan ${a.nr} av ${n} — annons ${a.libraryId ?? a.annonsNr ?? '?'}</h2>
<p class="meta"><a href="${esc(a.lank)}" target="_blank" rel="noopener">${esc(a.lank)}</a>${a.exponeringar ? ` · ${Number(a.exponeringar).toLocaleString('sv-SE').replace(/[  ]/g, ' ')} exponeringar` : ''}${a.video ? ' · video' : ''} · formulär: <a href="${esc(a.formular)}" target="_blank" rel="noopener">Metas upphovsrättsformulär</a></p>
${bilder[a.nr] ? `<img src="${esc(bilder[a.nr])}" alt="Bevisbild anmälan ${a.nr}">` : '<p class="varning">Ingen bevisbild — anmälan går utan skärmdump.</p>'}
<table>
${rad('Fullständigt namn', f.reporter.fullName)}${rad('E-post', f.reporter.email)}${rad('Telefon', f.reporter.phone ?? '(tomt)')}${rad('Postadress', f.reporter.address)}
${rad('Rättighetshavare', `${f.rightsOwner.name} (org.nr ${f.rightsOwner.registrationNumber})`)}${rad('Relation', f.rightsOwner.relationship)}
${rad('Anmäld annons (URL)', f.contentUrls.join(' '))}${rad('Beskrivning av intrånget', f.contentDescription)}
${rad('Vårt verk', f.originalWorkDescription)}${rad('Originalets länkar', f.originalWorkUrls.join(' · '))}${rad('Övrig information', f.additionalInfo)}
${rad('Försäkringar (kryssas i)', f.declarations.join(' | '))}${rad('Elektronisk underskrift', f.signature)}${rad('Bilaga', a.bevisbild ? `${a.bevisbild}${a.bevisbildUrl ? ` · ${a.bevisbildUrl}` : ''}` : '(ingen)')}
</table></article>`;
  }).join('\n');
  return `<title>Anmälningar ${esc(arende.id)}</title>
<style>
:root{--bg:#f2f4f1;--yta:#fff;--text:#151a21;--dis:#5b6570;--linje:#d5dad2;--accent:#0e6a86;--varning:#a24a08;--mark:#fbe9d8}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){color-scheme:dark;--bg:#0e1216;--yta:#161c23;--text:#e6eaef;--dis:#9aa5b1;--linje:#2a343f;--accent:#5fbcd9;--varning:#f0a35c;--mark:#3a2410}}
:root[data-theme="dark"]{color-scheme:dark;--bg:#0e1216;--yta:#161c23;--text:#e6eaef;--dis:#9aa5b1;--linje:#2a343f;--accent:#5fbcd9;--varning:#f0a35c;--mark:#3a2410}
body{background:var(--bg);color:var(--text);font:17px/1.5 "Source Sans 3","Segoe UI",system-ui,sans-serif;margin:0}
.ram{max-width:1000px;margin:0 auto;padding:24px 16px 64px;display:grid;gap:22px}
h1{font-size:clamp(28px,5vw,40px);line-height:1.05;margin:0}h2{font-size:22px;margin:0 0 6px}
.meta{color:var(--dis);font-size:15px;word-break:break-all;margin:0 0 10px}a{color:var(--accent)}
.gor{background:var(--mark);border-left:4px solid var(--varning);padding:12px 16px;border-radius:0 8px 8px 0}
article{background:var(--yta);border:1px solid var(--linje);border-radius:12px;padding:18px;display:grid;gap:10px}
img{width:100%;border-radius:8px;border:1px solid var(--linje)}
table{border-collapse:collapse;width:100%;font-size:15px}th{text-align:left;vertical-align:top;color:var(--dis);font-weight:600;padding:6px 10px 6px 0;width:190px;border-top:1px solid var(--linje)}td{padding:6px 0;border-top:1px solid var(--linje);word-break:break-word}
.varning{color:var(--varning);font-weight:600}
</style>
<div class="ram">
<header><p class="meta">Konkurrentdödaren · Meta-anmälningar · ${esc(arende.id)} · byggda ${esc(new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Stockholm' }).format(new Date(uppdaterad)))}</p>
<h1>${n} ${n === 1 ? 'anmälan' : 'anmälningar'} till Meta — en per annons</h1></header>
<div class="gor"><strong>Det enda du gör:</strong> läs igenom. Stämmer allt skriver du <code>kör anmälningarna ${esc(arende.id)}</code> i chatten, så fyller jag i och skickar in alla ${n} i din webbläsare, en i taget, och skriver tillbaka Metas referensnummer. Ska något ändras: skriv vad, så bygger jag om.</div>
${kort}
</div>`;
}
