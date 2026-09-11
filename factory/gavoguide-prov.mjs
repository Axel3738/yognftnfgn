// gavoguide-prov.mjs — klickar igenom gåvoguiden som en kund, i en riktig
// webbläsare.
//
//   node factory/gavoguide-prov.mjs                    # skriver HTML-sidan
//   <chromium> --headless=new --dump-dom file://<sidan>  # kör scenarierna
//
// Varför den finns: enhetstesterna i factory/test/gavoguide.test.mjs bevisar
// poängmodellen, men inte att kunden kan KLICKA sig fram — att rätt fråga
// dyker upp, att grenarna hoppar rätt, att resultatet ritas och att "gör om"
// nollställer. Det syns bara i en webbläsare.
//
// Den har redan betalat sig en gång: 2026-09-11 visade den att den som
// svarade "golf" och "under 400 kr" fick HOCKEYkalendern, för budgeten var
// ett filter och golfkalendern kostar 549. Inget enhetstest hade den frågan.
// Budgeten är sedan dess en poäng, inte ett filter (factory/gavoguide.mjs).
//
// Sidan byggs ur butikens RIKTIGA frågor (butiksfilen → startsida.mjs) och
// temats RIKTIGA JS (tema.mjs → TEMAFILER). Markupen speglar sektionen.
// Ändras sektionens markup måste den speglas här — det är priset för att
// slippa en webbserver.
import { readFileSync, writeFileSync } from 'node:fs';
import { TEMAFILER } from './tema.mjs';
import { lasYaml } from './yaml.mjs';
import { byggStartsida } from './startsida.mjs';

const ROT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const UT = process.env.GUIDE_PROV_UT || '/tmp';

const butik = lasYaml(readFileSync(`${ROT}/factory/butiker/kalender.yaml`, 'utf8'));
const racing = lasYaml(readFileSync(`${ROT}/factory/produkter/adventskalender-racingbilar.yaml`, 'utf8'));
const mall = JSON.parse(String(byggStartsida(butik, [racing, racing], { kollektion: 'kalendrarna' })).replace(/^\s*\/\*[\s\S]*?\*\//, '').trim());
const g = mall.sections.gavoguide;

// Sortimentet som det kommer se ut när alla tolv ligger uppe.
const PRODUKTER = [
  ['adventskalender-racingbilar', 'Racingkalendern', 499, ['mottagare:barn', 'alder:3-5', 'alder:6-8', 'alder:9-12', 'intresse:bilar', 'egenskap:varar', 'egenskap:overraskning'], true, false],
  ['dinosaurie', 'Dinosauriekalendern', 399, ['mottagare:barn', 'alder:3-5', 'alder:6-8', 'alder:9-12', 'intresse:dinosaurier', 'egenskap:varar', 'egenskap:overraskning'], true, false],
  ['gor-din-egen', 'Gör din egen', 449, ['mottagare:vemsomhelst', 'mottagare:barn', 'mottagare:tonaring', 'mottagare:vuxen', 'intresse:pyssel', 'egenskap:personlig', 'egenskap:fyll-sjalv', 'egenskap:brett'], false, false],
  ['pussel', 'Pusselkalendern', 449, ['mottagare:vuxen', 'mottagare:tonaring', 'mottagare:vemsomhelst', 'alder:9-12', 'intresse:pussel', 'egenskap:varar', 'egenskap:brett'], true, false],
  ['whisky', 'Whiskykalendern', 349, ['mottagare:vuxen', 'intresse:whisky', 'egenskap:dekor'], true, true],
  ['golf', 'Golfkalendern', 549, ['mottagare:vuxen', 'intresse:golf', 'egenskap:varar'], true, false],
  ['cocktail', 'Cocktailkalendern', 349, ['mottagare:vuxen', 'intresse:cocktail', 'egenskap:dekor'], true, true],
  ['smycken', 'Smyckeskalendern', 449, ['mottagare:vuxen', 'mottagare:tonaring', 'intresse:smycken', 'egenskap:varar'], true, false],
  ['barnsmycken', 'Barnens smyckeskalender', 379, ['mottagare:barn', 'mottagare:tonaring', 'alder:6-8', 'alder:9-12', 'intresse:smycken-barn', 'intresse:pyssel', 'egenskap:varar'], true, false],
  ['ishockey', 'Hockeykalendern', 399, ['mottagare:barn', 'mottagare:tonaring', 'mottagare:vuxen', 'alder:9-12', 'intresse:hockey', 'egenskap:varar', 'egenskap:dekor'], true, false],
  ['ol', 'Ölkalendern', 349, ['mottagare:vuxen', 'intresse:ol', 'intresse:whisky', 'egenskap:dekor'], true, true],
  ['sprit', 'Spritkalendern', 349, ['mottagare:vuxen', 'intresse:whisky', 'egenskap:dekor'], true, true],
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const d = g.settings;

const fragorHtml = g.block_order.map((bid, i) => {
  const b = g.blocks[bid].settings;
  const etiketter = b.svar.split('\n');
  const taggar = b.taggar.split('\n');
  const alt = etiketter.map((e, j) => `
      <label class="ms-guide__alternativ">
        <input type="radio" name="guide-${bid}" value="${j + 1}" data-taggar="${esc(taggar[j] ?? '')}" data-etikett="${esc(e)}">
        <span>${esc(e)}</span>
      </label>`).join('');
  return `
    <fieldset class="ms-guide__fraga" data-guide-fraga data-vikt="${b.vikt}" data-visa-om="${esc(b.visa_om)}" hidden>
      <legend class="ms-guide__legend">${esc(b.fraga)}</legend>
      ${b.hjalptext ? `<p class="ms-guide__hjalp">${esc(b.hjalptext)}</p>` : ''}
      <div class="ms-guide__svar">${alt}</div>
      ${i > 0 ? `<button type="button" class="ms-guide__tillbaka" data-guide-tillbaka>${esc(d.text_tillbaka)}</button>` : ''}
    </fieldset>`;
}).join('');

const produktHtml = PRODUKTER.map(([h, t, pris, taggar, sma, alk]) => `
  <div hidden data-guide-produkt="${esc(JSON.stringify({ taggar, mening: `Därför passar ${t}.`, sma_delar: sma, alkoholtema: alk }))}"
    data-handle="${h}" data-titel="${esc(t)}" data-url="/products/${h}" data-bild=""
    data-pris="${pris}" data-pris-text="${pris},00 kr" data-jamfor-text="" data-variant="999${pris}"></div>`).join('');

const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><title>Gåvoguide — provkörning</title>
<style>:root{--ms-accent:#A8283A;--ms-ink:#181F2E;--ms-surface:#fff;--ms-surface-2:#F7F2EA;--ms-surface-3:#EDE4D6;--ms-line:#E1D9CB;--ms-radius:16px;--ms-radius-sm:8px}
body{font-family:system-ui;max-width:820px;margin:24px auto;padding:0 16px}</style></head><body>
<div class="ms-scope ms-section">
  <h2>${esc(d.rubrik)}</h2>
  <div class="ms-guide" data-ms-gavoguide hidden
    data-kollektion-url="/collections/kalendrarna"
    data-text-match="${esc(d.text_match)}" data-text-ocksa="${esc(d.text_ocksa)}"
    data-text-kop="${esc(d.text_kop)}" data-text-las="${esc(d.text_las)}"
    data-text-om="${esc(d.text_om)}" data-text-lagger="${esc(d.text_lagger)}"
    data-text-lagd="${esc(d.text_lagd)}" data-text-ingen="${esc(d.text_ingen)}"
    data-text-alla="${esc(d.text_alla)}" data-text-budget="${esc(d.text_budget)}"
    data-text-tidigare="${esc(d.text_tidigare)}">
    <div class="ms-guide__progress" data-guide-progress><span class="ms-guide__raknare" data-guide-raknare></span></div>
    ${fragorHtml}
    <div class="ms-guide__resultat" data-guide-resultat hidden aria-live="polite"></div>
    <p class="ms-guide__tidigare" data-guide-tidigare hidden></p>
    ${produktHtml}
  </div>
  <p data-guide-fallback><a href="/collections/kalendrarna">${esc(d.text_alla)}</a></p>
</div>
<pre id="logg"></pre>
<script>${TEMAFILER['assets/ms-gavoguide.js']}</script>
<script>
// Provkörningen: klicka som en kund, skriv ned vad som händer.
const logg = [];
const L = (s) => logg.push(s);
const rot = document.querySelector('[data-ms-gavoguide]');
const synlig = () => [...rot.querySelectorAll('[data-guide-fraga]')].find((f) => !f.hidden);
function svara(text) {
  const f = synlig();
  if (!f) { L('FEL: ingen synlig fråga när jag skulle svara "' + text + '"'); return false; }
  const fraga = f.querySelector('legend').textContent;
  const val = [...f.querySelectorAll('input')].find((i) => i.dataset.etikett === text);
  if (!val) { L('FEL: alternativet "' + text + '" finns inte i "' + fraga + '" (fanns: ' + [...f.querySelectorAll('input')].map(i=>i.dataset.etikett).join(', ') + ')'); return false; }
  L('  fråga: ' + fraga + '  → svar: ' + text);
  val.click();
  return true;
}
function resultat() {
  const r = rot.querySelector('[data-guide-resultat]');
  if (r.hidden) return null;
  return {
    traff: (r.querySelector('.ms-guide__namn') || {}).textContent,
    alternativ: [...r.querySelectorAll('.ms-guide__altnamn')].map((x) => x.textContent),
    not: (r.querySelector('.ms-guide__not') || {}).textContent || '',
    kopknapp: !!r.querySelector('[data-guide-kop]'),
  };
}
const scenarier = [
  { namn: 'Sjuåring som gillar dinosaurier', svar: ['Ett barn', '6–8 år', 'Dinosaurier och djur', 'Att det finns kvar efter jul', 'Spelar ingen roll'] },
  { namn: 'Vuxen whiskyvän', svar: ['En vuxen', 'Whisky', 'Att den är snygg att ställa fram', 'Spelar ingen roll'] },
  { namn: 'Barn under tre år', svar: ['Ett barn', 'Under 3 år', 'Dinosaurier och djur', 'Att det finns kvar efter jul', 'Spelar ingen roll'] },
  { namn: 'Tonåring som gillar whisky (ska INTE ge alkohol)', svar: ['En tonåring', 'Hockey', 'Att det finns kvar efter jul', 'Spelar ingen roll'] },
  { namn: 'Vuxen golfare med snål budget (ska ge GOLF + prisnotis)', svar: ['En vuxen', 'Golf', 'Att det finns kvar efter jul', 'Under 400 kr'] },
  { namn: 'Vet inte än', svar: ['Vet inte än', 'Vet inte riktigt', 'Att den känns personlig', 'Spelar ingen roll'] },
];
(async () => {
  // Guiden startar på DOMContentLoaded — vänta in den, annars är alla
  // frågor fortfarande hidden när första klicket kommer.
  for (let i = 0; i < 100 && !synlig(); i++) await new Promise((r) => setTimeout(r, 100));
  for (const s of scenarier) {
    L('### ' + s.namn);
    for (const svarText of s.svar) { if (!svara(svarText)) break; await new Promise((r) => setTimeout(r, 240)); }
    await new Promise((r) => setTimeout(r, 300));
    L('  RESULTAT: ' + JSON.stringify(resultat()));
    const om = rot.querySelector('[data-guide-om]');
    if (om) { om.click(); await new Promise((r) => setTimeout(r, 300)); }
    else L('  FEL: ingen "gör om"-knapp');
  }
  const t = rot.querySelector('[data-guide-tidigare]');
  L('TIDIGARE-RADEN: ' + (t.hidden ? '(dold)' : t.textContent.trim()));
  document.getElementById('logg').textContent = logg.join('\\n');
  document.title = 'KLAR';
})();
</script></body></html>`;

writeFileSync(`${UT}/guide-test.html`, html);
console.log('skrev', `${UT}/guide-test.html`, html.length, 'tecken');
