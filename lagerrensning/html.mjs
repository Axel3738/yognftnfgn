// html.mjs — sidan som ren HTML. Byggdes 2026-09-16 när Axel trodde att
// GemPages tog HTML att klistra in; samma dag visade det sig att GemPages
// bara importerar .gempages-filer. HTML:en lever kvar som UNDERLAGET FÖR
// FÖRHANDSVISNINGEN (forhandsvisning.mjs tar skärmdumpar av den) — det är så
// sessionen ser sidan innan filen levereras. Skulle GemPages få ett
// HTML-element som duger går fragmentet att klistra in som det är.
//
// Samma innehåll och samma ordning som mallen (mall/platser.json), samma
// typsnitt (Anton för rubriker, Inter för brödtext), samma färger, knappar och
// mått som GemPages-exporten bär i sina stilar (avlästa 2026-09-16):
//   rubrik 57/32 px, punktrubriker 32/28 px, brödtext 16/14 px, text #151515,
//   knapp #FF3B00 → hover #3D50FF, pill 100px, 450 px bred på desktop,
//   punkternas container 790 px, bilder 340 px höga med 12 px radie,
//   författarfotot runt 110/76 px, ikoner "numrerad cirkel" i #DA420E.
//
// Utdata är ETT fragment: <style> + <div class="lr">…</div>. All CSS är
// scopad under .lr så den inte färgar resten av sidan. Fragmentet går att
// öppna direkt i en webbläsare också (förhandsvisningen gör det).
//
// Texterna skrivs med samma regler som .gempages-vägen: htmlAv() escapar allt
// och gör **fet** till <strong>. Ingen annan HTML släpps igenom från copyn.

import { htmlAv, styckenAv, svensktDatum, lasCopy, allaElement, brandProfil } from './gempages.mjs';

const IKONER = {
  1: 'M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218ZM138,80v96a6,6,0,0,1-12,0V91.21L111.33,101a6,6,0,0,1-6.66-10l24-16A6,6,0,0,1,138,80Z',
  2: 'M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm24-95.95-36,48h36a6,6,0,0,1,0,12H104a6,6,0,0,1-4.8-9.6l43.17-57.56A18,18,0,1,0,111,98a6,6,0,1,1-11.31-4A30,30,0,1,1,152,122.05Z',
  3: 'M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm30-66a34,34,0,0,1-58.29,23.79,6,6,0,0,1,8.58-8.39A22,22,0,1,0,124,130a6,6,0,0,1-4.92-9.44L140.48,90H104a6,6,0,0,1,0-12h48a6,6,0,0,1,4.92,9.44l-22.53,32.18A34.06,34.06,0,0,1,158,152Z',
  4: 'M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm32-72H150V80a6,6,0,0,0-10.74-3.68l-56,72A6,6,0,0,0,88,158h50v18a6,6,0,0,0,12,0V158h10a6,6,0,0,0,0-12Zm-22,0H100.27L138,97.49Z',
  5: 'M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218ZM117.08,86l-5,30A36,36,0,0,1,124,114a34,34,0,0,1,0,68,33.6,33.6,0,0,1-24.29-9.8,6,6,0,1,1,8.58-8.4A21.65,21.65,0,0,0,124,170a22,22,0,0,0,0-44,21.65,21.65,0,0,0-15.71,6.2A6,6,0,0,1,98.08,127l6.2-37A6,6,0,0,1,110.2,85H152a6,6,0,0,1,0,12H115.24Z',
};

const ikon = (n) => `<svg class="lr-ikon" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="${IKONER[n] ?? IKONER[1]}"/></svg>`;

export const CSS = `
.lr,.lr *{box-sizing:border-box}
.lr{font-family:Inter,Arial,Helvetica,sans-serif;color:#151515;background:#fff;line-height:1.5;margin:0;-webkit-font-smoothing:antialiased}
.lr p{margin:0 0 1em;font-size:16px;line-height:1.5}
.lr p:last-child{margin-bottom:0}
.lr strong{font-weight:700}
.lr-topp{background:#121212;height:10px}
.lr-hero{padding:80px 20px}
.lr-hero .lr-inre{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:minmax(0,760px) 1fr;gap:8px}
.lr-h1{font-family:Anton,Impact,'Arial Narrow',sans-serif;font-weight:400;font-size:57px;line-height:1.3;margin:0 0 16px;color:#151515}
.lr-ingress{padding-bottom:32px}
.lr-cta{display:flex;align-items:center;justify-content:center;background:#FF3B00;color:#fff!important;text-decoration:none!important;border-radius:100px;font-family:Inter,Arial,sans-serif;font-size:24px;font-weight:600;line-height:1.2;min-height:72px;width:450px;max-width:100%;padding:16px 40px;margin:0 0 56px;text-align:center;transition:background .15s}
.lr-cta:hover{background:#3D50FF}
.lr-hero-rad{display:grid;grid-template-columns:minmax(0,450px) minmax(260px,1fr);gap:16px;align-items:start}
.lr-forfattare{display:grid;grid-template-columns:110px 1fr;gap:12px;align-items:center;margin-bottom:32px}
.lr-forfattare img{width:110px;height:110px;border-radius:50%;object-fit:cover;display:block}
.lr-forfattare p{margin:0;font-size:16px}
.lr-forfattare .lr-datum{color:#999;font-size:14px}
.lr-sammanfattning p{color:#000}
.lr-punkt{padding:0 20px 80px}
.lr-punkt .lr-inre{max-width:790px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start}
.lr-punkt.lr-omvand .lr-media{order:2}
.lr-media img{width:100%;height:340px;object-fit:cover;border-radius:12px;display:block}
.lr-h2{display:flex;gap:10px;align-items:flex-start;font-family:Anton,Impact,'Arial Narrow',sans-serif;font-weight:700;font-size:32px;line-height:1.3;margin:0 0 16px;color:#151515}
.lr-ikon{width:20px;height:20px;flex:none;color:#DA420E;margin-top:11px}
.lr-text{padding-bottom:32px}
.lr-slut{padding:32px 20px}
.lr-slut .lr-inre{max-width:790px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.lr-slut .lr-h2{margin-bottom:16px}
.lr-slut .lr-media img{height:auto;max-height:none;margin-bottom:24px}
.lr img{max-width:100%}
.lr-slut .lr-block{margin-bottom:32px}
.lr-sidfot{padding:80px 20px}
.lr-sidfot .lr-inre{max-width:790px;margin:0 auto}
.lr-sidfot .lr-logga{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:center;margin-bottom:24px}
.lr-sidfot .lr-logga img{width:100%;max-width:395px;height:auto;display:block}
.lr-sidfot .lr-logga span{font-size:12px;color:#1D1C20;text-align:center;display:block}
.lr-sidfot hr{border:0;border-top:1px solid #A4C4C0;margin:0 0 24px}
.lr-sidfot .lr-kontakt{text-align:center;font-size:13px;color:#1D1C20}
.lr-sidfot .lr-kontakt a{color:#1D1C20}
@media (max-width:767px){
  .lr p{font-size:14px}
  .lr-hero{padding:40px 20px 72px}
  .lr-hero .lr-inre,.lr-hero-rad,.lr-punkt .lr-inre,.lr-slut .lr-inre,.lr-sidfot .lr-logga{grid-template-columns:1fr}
  .lr-h1{font-size:32px}
  .lr-cta{width:100%;min-height:0;font-size:14px;padding:16px 32px;margin-bottom:16px}
  .lr-forfattare{grid-template-columns:76px 1fr}
  .lr-forfattare img{width:76px;height:76px}
  .lr-forfattare p{font-size:14px}
  .lr-punkt{padding-bottom:72px}
  .lr-punkt.lr-omvand .lr-media{order:0}
  .lr-media img{margin-bottom:28px}
  .lr-h2{font-size:28px;margin-bottom:12px}
  .lr-ikon{margin-top:9px}
  .lr-text{padding-bottom:28px}
}
`.trim();

const stycken = (v) => styckenAv(v).map((s) => `<p>${htmlAv(s)}</p>`).join('\n');
const knapp = (text, url) => `<a class="lr-cta" href="${htmlAv(url)}">${htmlAv(styckenAv(text).join(' '))}</a>`;
const bildTag = (b, alt, klass = '') =>
  `<img${klass ? ` class="${klass}"` : ''} src="${htmlAv(b.src)}"${b.width ? ` width="${b.width}"` : ''}${b.height ? ` height="${b.height}"` : ''} alt="${htmlAv(alt)}" loading="lazy">`;

/** Mallens egna bilder per plats (författarfoto, lager, logga … och motorhöljets punktbilder som reserv). */
export function mallBilder(mall, platser) {
  const perCid = new Map(mall.pageSections.map((s) => [s.cid, JSON.parse(s.component)]));
  const ut = {};
  for (const [plats, p] of Object.entries(platser.bilder ?? {})) {
    const el = allaElement(perCid.get(p.cid)).find((e) => p.uids.includes(e.uid) && e.tag === 'Image');
    const im = el?.settings?.image;
    if (im?.src) ut[plats] = { src: im.src, width: im.width, height: im.height };
  }
  return ut;
}

/**
 * Sidan som ett HTML-fragment (<style> + <div class="lr">). Bildplatserna
 * fylls: `bilder` (produktens) vinner, `fasta` (mallens) är reserv. Loggan
 * kommer ur brandprofilen, aldrig ur `fasta` — obrandad sida har ingen.
 *
 *   renderaHtml({ copy, produkt: { url, kortTitel }, bilder, fasta, datum, brand })
 */
export function renderaHtml({ copy, produkt, bilder = {}, fasta = {}, datum, brand = null }) {
  if (!produkt?.url) throw new Error('renderaHtml: produkten saknar url.');
  const b = brandProfil(brand);
  const bild = (plats) => {
    const b = bilder[plats]?.src ? bilder[plats] : fasta[plats];
    if (!b?.src) throw new Error(`renderaHtml: ingen bild för platsen "${plats}".`);
    return b;
  };
  const text = (nyckel) => {
    const v = lasCopy(copy, nyckel);
    if (v == null || styckenAv(v).length === 0) throw new Error(`renderaHtml: copyn saknar "${nyckel}".`);
    return v;
  };
  const rubrik = (nyckel) => htmlAv(styckenAv(text(nyckel)).join(' '));
  const url = produkt.url;
  const namn = produkt.kortTitel ?? '';

  const sammanfattning = (() => {
    const st = styckenAv(text('hero.sammanfattning')).map((s) => s.replace(/^\**\s*Sammanfattning:\s*\**\s*/i, ''));
    const [a, ...rest] = st;
    return `<p><strong>Sammanfattning:</strong> ${htmlAv(a)}${rest.length ? `<br>${rest.map(htmlAv).join('<br>')}` : ''}</p>`;
  })();

  const punkter = (copy.punkter ?? []).map((p, i) => {
    const n = i + 1;
    const b = bild(`punkt${n}`);
    return `
<section class="lr-punkt${n % 2 === 0 ? ' lr-omvand' : ''}" id="lr-punkt-${n}">
  <div class="lr-inre">
    <div class="lr-media">${bildTag(b, `${namn} – punkt ${n}`)}</div>
    <div class="lr-kropp">
      <h2 class="lr-h2">${ikon(n)}<span>${rubrik(`punkt${n}.rubrik`)}</span></h2>
      <div class="lr-text">${stycken(text(`punkt${n}.text`))}</div>
      ${knapp(text(`punkt${n}.knapp`), url)}
    </div>
  </div>
</section>`;
  }).join('\n');

  const html = `<!-- Lagerrensnings-sida: ${htmlAv(namn)} · genererad ${datum} av lagerrensning/bygg.mjs · HTML-version för förhandsvisning; leveransen är .gempages-filen -->
<style>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700&display=swap');
${CSS}
</style>
<div class="lr">
<div class="lr-topp"></div>
<section class="lr-hero">
  <div class="lr-inre">
    <div>
      <h1 class="lr-h1">${rubrik('hero.rubrik')}</h1>
      <div class="lr-ingress">${stycken(text('hero.ingress'))}</div>
      <div class="lr-hero-rad">
        <div>${knapp(text('hero.knapp'), url)}</div>
        <div class="lr-forfattare">
          ${bildTag(bild('hero'), b.forfattare)}
          <div>
            <p>Av <strong>${htmlAv(b.forfattare)}.</strong></p>
            <p class="lr-datum">Senast uppdaterad ${svensktDatum(datum)}.</p>
          </div>
        </div>
      </div>
      <div class="lr-sammanfattning">${sammanfattning}</div>
    </div>
    <div></div>
  </div>
</section>
${punkter}
<section class="lr-slut">
  <div class="lr-inre">
    <div>
      <div class="lr-block">
        <h2 class="lr-h2">${rubrik('lyckas.rubrik')}</h2>
        <div class="lr-media">${bildTag(bild('lyckas'), namn)}</div>
        <div class="lr-text">${stycken(text('lyckas.stycken'))}</div>
        ${knapp(text('lyckas.knapp'), url)}
      </div>
      <div class="lr-block">
        <h2 class="lr-h2">${rubrik('arlig.rubrik')}</h2>
        <div class="lr-media">${bildTag(bild('arlig'), 'Lagret')}</div>
        <div class="lr-text">${stycken(text('arlig.stycken'))}</div>
      </div>
      <div class="lr-block">
        <h2 class="lr-h2">${rubrik('riskfritt.rubrik')}</h2>
        <div class="lr-text">${stycken(text('riskfritt.text'))}</div>
        ${knapp(text('riskfritt.knapp'), url)}
      </div>
    </div>
    <div></div>
  </div>
</section>
<footer class="lr-sidfot">
  <div class="lr-inre">
${b.logga ? `    <div class="lr-logga">
      ${bildTag(b.logga, b.namn)}
      <span>|</span>
    </div>
` : ''}    <hr>
    <p class="lr-kontakt">${[
      b.support ? `<a href="mailto:${htmlAv(b.support)}">${htmlAv(b.support)}</a>` : null,
      b.doman ? htmlAv(b.doman) : null,
      'OBS: Detta är reklam.',
    ].filter(Boolean).join('<br>')}</p>
  </div>
</footer>
</div>`;
  return html;
}

/** Ett komplett dokument runt fragmentet — för förhandsvisning och för att öppna filen lokalt. */
export function somDokument(fragment, { titel = 'Lagerrensning' } = {}) {
  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${htmlAv(titel)}</title>
</head>
<body style="margin:0;background:#fff">
${fragment}
</body>
</html>
`;
}
