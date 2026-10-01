// konkurrenter/bevisbild.mjs — bevisbilden som följer med varje Meta-anmälan
// (Axels tips 2026-09-29: skärmdump i anmälan höjer träffsäkerheten). Ett
// kort per annons: vårt original till vänster, deras annons till höger, den
// kopierade texten markerad, ärendenummer, länkar och tidsstämpel. Byggs som
// HTML (rent) och renderas till PNG i Chromium — samma väg som fakturan.
// Bilderna ligger som data-URI:er (miniatyrerna i ärendet), inga externa
// anrop när kortet renderas. Här också verifieringssidan Axel läser innan
// allt skickas in: en gång, alla anmälningar, varje fält.
//
// Klippen (Axel 2026-09-29, andra vändan): när ärendet bär valda rutor ur
// våra EGNA klipp (klipp.mjs) visar kortet dem — tre par ur olika scener,
// vår filmruta till vänster och samma ruta i deras annons till höger — och
// aldrig miniatyrträffen, för den är det lånade klippet.

import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { tid, bevisStatus } from './klipp.mjs';
import { startadeFore } from './original.mjs';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nar = (iso) => (iso ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Stockholm' }).format(new Date(iso)) : '?');
/** "12 Aug 2026" / "12 aug. 2026" — när vår film publicerades (annonsens created_time). Ren. */
export const dag = (iso, sprak = 'en') => (iso ? new Intl.DateTimeFormat(sprak === 'sv' ? 'sv-SE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Stockholm' }).format(new Date(iso)) : null);

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

/** Var i vår film rutan sitter: en tid, eller "frame 7" när våra rutor är Metas thumbnails. Ren. */
export const egenPlats = (v, { sprak = 'en' } = {}) => (v.egenT === null || v.egenT === undefined
  ? `${sprak === 'sv' ? 'ruta' : 'frame'} ${Number(v.egenI ?? 0) + 1}`
  : tid(v.egenT));

/**
 * Kortet för EN annons. `miniatyr(url)` ger en data-URI eller null.
 * `klipp` = { val: [{ bokstav, derasT, egenT, egenI, avstand, scen, egenData, derasData }], statistik }
 * (ur klipp.mjs) — då byggs kortet av paren, inte av miniatyren.
 * Fast ljust tema med flit — bilden ska se likadan ut hos Metas granskare.
 */
export function bevisbildHtml(arende, annons, { miniatyr = () => null, nu = new Date().toISOString(), nr = 1, antal = 1, klipp = null, original = null } = {}) {
  const val0 = klipp?.val?.length ? klipp.val : null;
  // Produkten: filmernas när kortet bärs av våra klipp (paren pekar på vår film), annars fyndets.
  const prod = (val0 && annons.klipp?.produkt?.url ? annons.klipp.produkt : null) ?? annons.produkt ?? arende.var?.produkt ?? {};
  const passage = annons.text?.styrka ? annons.text?.passager?.[0]?.text ?? null : null;
  const derasText = annons.derasText ?? '';
  // Vår text: annonsens egen om ärendet bär den, annars de ordagranna passagerna (de är per definition identiska med vår text).
  const varText = annons.varAnnons?.text ?? arende.var?.annons?.text ?? (annons.text?.styrka ? (annons.text.passager ?? []).map((x) => x.text).join(' … ') : '');
  const bild = (src, alt) => (src ? `<img src="${esc(src)}" alt="${esc(alt)}">` : '<div class="tom">No image in this ad</div>');
  const derasRad = `${esc(annons.lank ?? '')}${annons.exponeringar ? ` · EU reach ≈ ${Number(annons.exponeringar).toLocaleString('en-GB')}` : ''}${annons.start ? ` · running since ${esc(annons.start)}` : ''}`;
  const val = klipp?.val?.length ? klipp.val : null;
  let kropp; let dom;
  if (val) {
    const st = klipp.statistik ?? {};
    const filmer = [...new Set(val.map((v) => v.egenFilm?.namn).filter(Boolean))];
    const filmnamn = (v) => v.egenFilm?.namn ?? null;
    const filmdag = (v) => (v.egenFilm?.skapad ? ` (ours since ${esc(dag(v.egenFilm.skapad))})` : '');
    // Var granskaren ser vår film: vår egen annons i annonsbiblioteket (kor.mjs --original), verifierad ruta för ruta —
    // bara en annons som startade FÖRE deras (ORVO Norge 2026-09-29: vår US-kopia startade 27/9, deras 24/9).
    const bibl = (v) => { const o = original?.[filmnamn(v)]; return o?.lank && !o.externa && startadeFore(o, annons.start) ? ` · our original in the Ad Library: ${esc(o.lank)}` : ''; };
    // Anspråket 'redigering' (Bustatio 2026-09-30): vår färdiga annons uppladdad igen — klippningen och texten är våra, filmklippen under kan vara andras.
    const redigering = arende.ansprak === 'redigering';
    kropp = `<p class="ingress">The reported video is ${redigering ? 'a re-upload of' : 'cut from'} our own advertising film${filmer.length === 1 ? ` "${esc(filmer[0])}"` : filmer.length > 1 ? `s (${filmer.map((f) => `"${esc(f)}"`).join(', ')})` : annons.varAnnons?.namn ? ` "${esc(annons.varAnnons.namn)}"` : ''}${redigering ? ' — the same edit, with our Swedish on-screen text at the same timestamps' : ''}. Below: ${val.length} still${val.length === 1 ? '' : 's'} from different scenes of the reported ad (right) next to the same frame${val.length === 1 ? '' : 's'} in our film${filmer.length > 1 ? 's' : ''} (left).</p>
<div class="rader">${val.map((v) => `<div class="klipprad"><div class="kol"><h2>Our film${filmnamn(v) ? ` — ${esc(filmnamn(v))}` : ''}${filmdag(v)} · ${esc(egenPlats(v))}</h2>${bild(v.egenData, 'Frame from our ad film')}</div><div class="kol deras"><h2>Reported ad · ${esc(tid(v.derasT))}</h2>${bild(v.derasData, 'The same frame in the reported ad')}</div><p class="parrad">Pair ${esc(v.bokstav)} · perceptual-hash distance ${esc(v.avstand)}/64${v.scen ? ` · scene ${esc(tid(v.scen.tFran))}–${esc(tid(v.scen.tTill))} of the reported ad` : ''}${bibl(v)}</p></div>`).join('')}</div>
${passage
    ? `<div class="par texter"><div class="kol"><h2>Our ad text</h2><div class="text">${markera(varText, passage)}</div><p class="rad">${esc(prod.url ?? '')}</p></div><div class="kol deras"><h2>Reported ad text</h2><div class="text">${markera(derasText, passage)}</div><p class="rad">${derasRad}</p></div></div>`
    : `<div class="texter"><div class="kol deras"><h2>Reported ad${arende.deras?.sidnamn ? ` — page "${esc(arende.deras.sidnamn)}"` : ''}</h2>${derasText ? `<div class="text">${esc(derasText)}</div>` : ''}<p class="rad">${derasRad}</p></div></div>`}`;
    const d = annons.klipp?.datum ?? null;
    const publicerad = d ? `, published by us ${d.forsta === d.sista ? `on ${esc(dag(d.forsta))}` : `between ${esc(dag(d.forsta))} and ${esc(dag(d.sista))}`}${annons.start ? ` — before the reported ad started running on ${esc(dag(annons.start))}` : ''}` : '';
    dom = `<div class="dom">The reported video is ${redigering ? 'a re-upload of' : 'cut from'} our own advertising film${filmer.length > 1 ? 's' : ''}${publicerad}: ${val.length} still frame${val.length === 1 ? '' : 's'} from different scenes of the reported ad (at ${val.map((v) => tid(v.derasT)).join(', ')}) ${val.length === 1 ? 'is' : 'are'} identical to frames of our film${filmer.length > 1 ? 's' : ''}${redigering ? ', including our on-screen text' : ''} (perceptual-hash distance ${val.map((v) => v.avstand).join(', ')}/64). ${redigering ? 'Claimed: our edit and our on-screen text — not the underlying product footage.' : 'Only these frames are claimed.'}${annons.text?.styrka ? ` The ad copy also repeats ${annons.text.kopieradeOrd} of our words verbatim (longest identical run ${annons.text.langsta} words, highlighted).` : ''}</div>`;
  } else {
    // Vänster: den bild av VÅR som faktiskt matchade (annonsbilden/filmrutan) — inte produktfotot. ORVO 2026-09-29:
    // första bygget visade produktfotot bredvid deras filmruta, fast träffen var vår egen filmruta (avstånd 1/64).
    // En films miniatyr visas bara när den är det enda (och då overifierat) — annars kan den vara ett lånat klipp (Axel 2026-09-29).
    const st = bevisStatus(annons);
    const bildBevis = st.bild || st.overifierad;
    const visaBilder = bildBevis || !annons.video;
    const traffadEgen = bildBevis ? (annons.bilder ?? []).map((b) => miniatyr(b.egen)).find(Boolean) ?? null : null;
    const varBild = traffadEgen ?? miniatyr(annons.varAnnons?.bild) ?? miniatyr(prod.bilder?.[0]) ?? miniatyr(arende.var?.annons?.bild);
    const derasBild = bildBevis ? annons.bilder?.map((b) => miniatyr(b.deras)).find(Boolean) ?? null : null;
    kropp = `<div class="par">
  <div class="kol"><h2>Our original${annons.varAnnons?.namn ? ` — ${esc(annons.varAnnons.namn)}` : ''}</h2>${visaBilder ? bild(varBild, 'Our original ad image') : ''}<div class="text">${markera(varText, passage)}</div><p class="rad">${esc(prod.url ?? '')}</p></div>
  <div class="kol deras"><h2>Reported ad${arende.deras?.sidnamn ? ` — page "${esc(arende.deras.sidnamn)}"` : ''}</h2>${visaBilder ? bild(derasBild, 'The reported ad') : ''}<div class="text">${markera(derasText, passage)}</div><p class="rad">${derasRad}</p></div>
</div>`;
    dom = annons.text?.styrka
      ? `<div class="dom">${annons.text.kopieradeOrd} words copied verbatim — longest identical run ${annons.text.langsta} consecutive words (highlighted).${bildBevis && annons.bilder?.length ? ` ${annons.bilder.length} image(s) identical or near-identical to ours.` : ''}</div>`
      : bildBevis && annons.bilder?.length
        ? annons.bilder.every((b) => b.del === 'mittparti')
          ? `<div class="dom">Our advertising image on the left; the reported ad on the right is the same image with its text re-set in another language — the picture under the text is identical (perceptual hash distance ${annons.bilder.map((b) => `${b.avstand}/64, fine check ${b.fin}/256`).join('; ')} on that part).</div>`
          : `<div class="dom">${annons.bilder.length} image(s) identical or near-identical to our own copyrighted advertising images — the still frame on the left is taken from our ad (perceptual hash distance ${annons.bilder.map((b) => b.avstand).join(', ')}/64).</div>`
        : '';
  }
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Evidence ${esc(arende.id)} — ad ${nr}</title>
<style>
body{margin:0;background:#fff;color:#151a21;font:15px/1.45 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;width:1200px}
.ram{padding:28px 32px}
h1{font-size:22px;margin:0 0 4px}
.meta{color:#5b6570;font-size:13px;margin:0 0 18px}
.ingress{margin:0 0 14px;font-size:15px}
.par{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.texter{margin-top:16px}
.rader{display:grid;gap:14px}
.klipprad{display:grid;grid-template-columns:1fr 1fr;gap:20px;border:1px solid #d5dad2;border-radius:10px;padding:12px 14px 6px;background:#fff}
.klipprad .kol{border:0;padding:0;background:transparent}
.klipprad img{max-height:400px}
.parrad{grid-column:1 / -1;margin:0;font-size:13px;color:#5b6570;border-top:1px solid #e7eae4;padding-top:6px}
.kol{border:1px solid #d5dad2;border-radius:10px;padding:14px;background:#f7f8f6}
.kol h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#5b6570;margin:0 0 10px}
.kol.deras h2{color:#a24a08}
img{width:100%;max-height:440px;object-fit:contain;background:#fff;border-radius:6px;display:block;margin-bottom:10px}
.tom{height:200px;display:grid;place-items:center;color:#5b6570;background:#fff;border-radius:6px;margin-bottom:10px;border:1px dashed #d5dad2}
p{margin:0 0 8px}
.text{background:#fff;border-radius:6px;padding:10px 12px;font-size:14px;white-space:pre-wrap;max-height:260px;overflow:hidden}
.texter .text{max-height:170px;font-size:13px}
mark{background:#ffe08a;padding:0 2px}
.rad{font-size:13px;color:#5b6570;word-break:break-all}
.fot{margin-top:16px;font-size:12px;color:#5b6570;border-top:1px solid #d5dad2;padding-top:10px;display:flex;justify-content:space-between;gap:20px}
.dom{margin-top:14px;padding:10px 14px;border-left:4px solid #a24a08;background:#fbe9d8;font-size:14px}
</style></head><body><div class="ram">
<h1>Copyright infringement evidence — case ${esc(arende.id)}, ad ${nr} of ${antal}</h1>
<p class="meta">Rights owner: Stonebite Ecom AB · Product: ${esc(prod.titel ?? prod.handle ?? '')}${arende.deras?.sidnamn ? ` · Reported page: "${esc(arende.deras.sidnamn)}"` : ''} · Prepared ${esc(nar(nu))} (Stockholm)</p>
${kropp}
${dom}
<div class="fot"><span>Measured by an automated ${val ? 'frame-by-frame video comparison (perceptual hashes, one frame every 0.5 s)' : 'text/image comparison; passages are exact word-for-word matches'}.</span><span>${esc(arende.id)} · report ${nr}/${antal}</span></div>
</div></body></html>`;
}

/**
 * HTML → PNG i Chromium (bredd 1200, skala 2 — det Meta får). Med `jpg` skrivs också en lätt JPEG i
 * skala 1 för verifieringssidan: tio PNG:er inbäddade gav 34,6 MB (mätt 2026-09-29), gränsen är 16 MB.
 * Returnerar PNG-filen eller kastar med orsak.
 */
export async function bevisbildPng(html, fil, { jpg = null, bredd = 1200, playwrightSokvag = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs', kandidater = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'] } = {}) {
  let pw;
  try { pw = await import(playwrightSokvag); } catch (e) { throw new Error(`Playwright saknas (${e.message.split('\n')[0]}) — bevisbilden kan inte göras här`); }
  const exe = kandidater.find((k) => existsSync(k));
  const browser = await pw.chromium.launch({ headless: true, args: ['--no-sandbox'], ...(exe ? { executablePath: exe } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: bredd, height: 900 }, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'load' });
    mkdirSync(dirname(fil), { recursive: true });
    await page.screenshot({ path: fil, type: 'png', fullPage: true });
    if (jpg) await page.screenshot({ path: jpg, type: 'jpeg', quality: 80, fullPage: true, scale: 'css' });
    return fil;
  } finally { await browser.close().catch(() => {}); }
}

/**
 * Verifieringssidan (svenska, Axels): alla anmälningar för ett ärende, varje
 * fält som det kommer att fyllas i, bevisbilden, och EN instruktion. Ren.
 * `bilder` = { [nr]: dataUri } för bevisbilderna; `klippen` = { [annonsNr]:
 * { val, uteslutna, statistik } } när kortet är byggt ur våra egna klipp —
 * då står också det lånade klippet som utesluts, så Axel ser att rätt scen
 * kastats.
 */
export function verifieringHtml({ arende, anmalningar, bilder = {}, klippen = {}, hoppade = [], uppdaterad = new Date().toISOString() }) {
  const n = anmalningar.length;
  const medKlipp = anmalningar.filter((a) => klippen[a.annonsNr]?.val?.length).length;
  const kort = anmalningar.map((a) => {
    const f = a.falt;
    const rad = (k, v) => `<tr><th>${esc(k)}</th><td>${esc(v ?? '—')}</td></tr>`;
    const kl = klippen[a.annonsNr] ?? null;
    const klippBlock = kl?.val?.length ? `<div class="klipp"><p><strong>Rutorna på bevisbilden är ur våra egna klipp:</strong> ${kl.val.map((v) => `${esc(v.bokstav)} = deras ${esc(tid(v.derasT))} ↔ vår ${v.egenFilm?.namn ? `${esc(v.egenFilm.namn)} ` : ''}${v.egenFilm?.skapad ? `(publicerad ${esc(dag(v.egenFilm.skapad, 'sv'))}) ` : ''}${esc(egenPlats(v, { sprak: 'sv' }))} (${esc(v.avstand)}/64)`).join(' · ')}.${kl.statistik?.andel !== undefined ? ` ${esc(kl.statistik.andel)} % av deras rutor matchar våra filmer${kl.statistik.filmer ? ` (${esc(kl.statistik.filmer)} av våra filmer jämförda)` : ''}.` : ''}</p>${kl.uteslutna?.length ? `<p class="lanat">Lånat klipp som INTE används (uteslutet med flit): ${kl.uteslutna.map((u) => `deras ${esc(tid(u.derasT))}`).join(', ')}</p><div class="lanatbilder">${kl.uteslutna.slice(0, 2).map((u) => `${u.egenData ? `<img src="${esc(u.egenData)}" alt="Lånat klipp, vår version">` : ''}${u.derasData ? `<img src="${esc(u.derasData)}" alt="Lånat klipp, deras version">` : ''}`).join('')}</div>` : ''}</div>` : '';
    return `<article>
<h2>Anmälan ${a.nr} av ${n} — annons ${a.libraryId ?? a.annonsNr ?? '?'}</h2>
<p class="meta"><a href="${esc(a.lank)}" target="_blank" rel="noopener">${esc(a.lank)}</a>${a.exponeringar ? ` · ${Number(a.exponeringar).toLocaleString('sv-SE').replace(/[  ]/g, ' ')} exponeringar` : ''}${a.video ? ' · video' : ''} · formulär: <a href="${esc(a.formular)}" target="_blank" rel="noopener">Metas upphovsrättsformulär</a></p>
${bilder[a.nr] ? `<img src="${esc(bilder[a.nr])}" alt="Bevisbild anmälan ${a.nr}">` : '<p class="varning">Ingen bevisbild — anmälan går utan skärmdump.</p>'}
${klippBlock}
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
.klipp{background:var(--mark);border-radius:8px;padding:10px 14px;font-size:15px}.klipp p{margin:0 0 6px}.lanat{color:var(--varning);font-weight:600}
.lanatbilder{display:flex;gap:8px;flex-wrap:wrap}.lanatbilder img{width:110px;height:auto;border-radius:6px;opacity:.85}
table{border-collapse:collapse;width:100%;font-size:15px}th{text-align:left;vertical-align:top;color:var(--dis);font-weight:600;padding:6px 10px 6px 0;width:190px;border-top:1px solid var(--linje)}td{padding:6px 0;border-top:1px solid var(--linje);word-break:break-word}
.varning{color:var(--varning);font-weight:600}
</style>
<div class="ram">
<header><p class="meta">Konkurrentdödaren · Meta-anmälningar · ${esc(arende.id)} · byggda ${esc(new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Stockholm' }).format(new Date(uppdaterad)))}</p>
<h1>${n} ${n === 1 ? 'anmälan' : 'anmälningar'} till Meta — en per annons</h1></header>
<div class="gor"><strong>Det enda du gör:</strong> läs igenom. Stämmer allt skriver du <code>kör anmälningarna ${esc(arende.id)}</code> i chatten, så fyller jag i och skickar in alla ${n} härifrån, en i taget, och skriver tillbaka Metas referensnummer. Ska något ändras: skriv vad, så bygger jag om.${medKlipp ? ` Bevisbilderna visar rutor ur våra egna klipp (A, B, C med tider); det lånade klippet står utanför. Är någon ruta ändå lånad: skriv <code>anmälan 3 ruta B är lånad</code>, så byter jag den.` : ''}</div>
${kort}
${hoppade.length ? `<article><h2>Anmäls inte (${hoppade.length})</h2><p class="meta">Bara annonser som är bevisade med vårt eget material anmäls. En annons som inte är bevisad tas inte heller med i brevet eller fakturan.</p><ul>${hoppade.map((h) => `<li>Annons ${esc(h.nr)}: ${esc(h.orsak)}</li>`).join('')}</ul></article>` : ''}
</div>`;
}
