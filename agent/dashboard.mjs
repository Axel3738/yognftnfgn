#!/usr/bin/env node
// Bygger agent/dashboard.html — Bäverronden för människor.
//
// En sida, ett besked per produkt, klarspråk. Status bärs av ikon OCH text,
// aldrig färg ensam (samma regel som redigerarpanelen). Självbärande fil:
// inga CDN:er, funkar offline, går att mejla.
//
//   node agent/dashboard.mjs        # läser kontodata + produktkarta + logg

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { annonsbehov, bedomKampanj, planera } from './rond.mjs';
import { lasLogg } from './logg.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));
export const UTFIL = join(HÄR, 'dashboard.html');

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (t) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[t]));
}
const kr = (n) => (Number.isFinite(n) ? `${Math.round(n).toLocaleString('sv-SE')} kr` : '—');
const dec = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d).replace('.', ',') : '—');

/**
 * Kod -> vad kortet säger. Klarspråk, presens.
 * ton: ok (grönt), vanta (neutralt), justera (orange), stopp (rött), fel (rött).
 */
export function kortText(rad, uppskjuten, atgard) {
  const d = rad.dom;
  // Kortet visar vad som faktiskt görs. En mildrad åtgärd (halvering som blev
  // 20 %-sänkning nära gränsen) ska stå som det den blev, inte som rådomen.
  if (atgard?.typ === 'budget' && atgard.mildrad) {
    return {
      glyf: '📉', ton: 'justera', rubrik: `Sänks till ${kr(atgard.till_sek)}/dag`,
      text: 'Går knappt back, men siffran ligger för nära gränsen för ett stort beslut. Sänks 20 % nu — halveras om förlusten står kvar om tre dagar.',
    };
  }
  const till = kr(atgard?.typ === 'budget' ? atgard.till_sek : d.nyBudget);
  if (uppskjuten) {
    return { glyf: '🤏', ton: 'vanta', rubrik: 'Nära gränsen — väntar', text: 'Siffran ligger för nära en gräns för att lita på. Omprövas om tre dagar.' };
  }
  switch (d.kod) {
    case 'SKALA': return { glyf: '📈', ton: 'ok', rubrik: `Höjs till ${till}/dag`, text: 'Den tjänar bra — får 20 % mer att jobba med.' };
    case 'SANK': return { glyf: '📉', ton: 'justera', rubrik: `Sänks till ${till}/dag`, text: 'Tjänar för lite just nu — 20 % lägre tills det vänder.' };
    case 'HALVERA': return { glyf: '📉', ton: 'stopp', rubrik: `Halveras till ${till}/dag`, text: 'Går med förlust — budgeten halveras direkt.' };
    case 'STANG_AV': return { glyf: '🛑', ton: 'stopp', rubrik: 'Stängs av', text: 'Sju dagar back i rad på lägsta budgeten. Nu får den vila.' };
    case 'ATGARDSTRAPPAN': return { glyf: '🔧', ton: 'stopp', rubrik: 'Dålig annons letas upp', text: 'Produkten går back. Ronden pausar det minsta som är trasigt först — inte hela produkten.' };
    case 'LAT_VARA': return { glyf: '✅', ton: 'ok', rubrik: 'Går bra — rörs inte', text: 'Precis där vi vill ha den.' };
    case 'VANTA_KADENS': return { glyf: '⏱️', ton: 'vanta', rubrik: 'Nyss ändrad — vilar', text: 'Meta behöver tre dagar på sig efter en ändring.' };
    case 'VANTA_TROSKEL': return { glyf: '⏳', ton: 'vanta', rubrik: 'Testas fortfarande', text: 'Har inte spenderat klart sin testbudget än. Får vara ifred.' };
    case 'FOR_LITE_DATA': return { glyf: '⏳', ton: 'vanta', rubrik: 'För ny — samlar data', text: 'För få köp än för att säga något säkert.' };
    case 'RAKNA_BACKDAGAR': return { glyf: '👀', ton: 'justera', rubrik: 'Bevakas på lägsta budgeten', text: 'Går back på 500 kr/dag. Vid sju dagar i rad stängs den av.' };
    case 'SAKNAR_BREAK_EVEN': return { glyf: '❓', ton: 'fel', rubrik: 'Saknar break-even', text: 'Talet finns inte i kampanjnamnet. Ingen bedömning förrän det är satt.' };
    case 'STOR_SPEND_UTAN_KOP': return { glyf: '🚨', ton: 'fel', rubrik: 'Bränner pengar utan köp', text: 'Mycket spend, nästan inga köp. Något är fel — produktsidan, priset eller lagret. Titta nu.' };
    case 'FRYST': return { glyf: '✋', ton: 'vanta', rubrik: 'Fryst — Axels order', text: d.motivering };
    case 'SAKNAR_SPEND_TOTAL': return { glyf: '⏳', ton: 'vanta', rubrik: 'Väntar på siffra', text: 'Totalspenden saknas — inget görs förrän den finns.' };
    default: return { glyf: '⚠️', ton: 'fel', rubrik: 'Siffrorna ser fel ut', text: d.motivering };
  }
}

const LOGGTEXT = {
  SKALA: (r) => `📈 höjdes till ${kr(r.ny_budget)}/dag`,
  SANK: (r) => `📉 sänktes till ${kr(r.ny_budget)}/dag`,
  HALVERA: (r) => `📉 halverades till ${kr(r.ny_budget)}/dag`,
  STANG_AV: () => '🛑 stängdes av',
  TRAPPA_STEG_1: () => '🔧 sämsta annonsen pausades',
  TRAPPA_STEG_2: () => '🔧 sämsta annonsgruppen pausades',
  TRAPPA_STEG_3: () => '🛑 stängdes av (hela produkten gick back)',
  NAMNBYTE: (r) => `✏️ nytt break-even ${dec(r.break_even)} inskrivet`,
  FORSTA_BATCH_KLAR: () => '🎨 första annonsbatchen klar — briefer i Notion',
  CS_BATCH_KLAR: () => '🎨 ny annonsbatch klar — briefer i Notion',
};

export function bygg({ rader, plan, logg, hamtad, behov = [], filer = {} }) {
  // Dashboarden är också systemets MINNE när körningen inte kan pusha till
  // git: hela budgetloggen bäddas in som JSON och läses tillbaka av nästa
  // körning med agent/minne.mjs. \u003c-escapen hindrar </script>-brytning.
  const minnesBlock = `<script type="application/json" id="budgetlogg">${
    JSON.stringify(logg).replace(/</g, '\\u003c')
  }</script>`;
  // Filutkorgen: minnesfiler (dna.md, batch-log.md ...) som en schemalagd
  // körning inte kunde pusha till git. De ligger med i dashboarden tills en
  // session med push-rättighet synkar dem (agent/minne.mjs) och tömmer utkorgen.
  const filBlock = Object.keys(filer).length === 0 ? '' : `\n<script type="application/json" id="filutkorg">${
    JSON.stringify(filer).replace(/</g, '\\u003c')
  }</script>`;
  const uppskjutnaId = new Set((plan.uppskjutna ?? []).map((u) => u.kampanj_id));
  const atgardMap = new Map((plan.atgarder ?? []).map((a) => [a.kampanj_id, a]));
  const kort = rader.map((r) => ({ rad: r, ...kortText(r, uppskjutnaId.has(r.id), atgardMap.get(r.id)) }));

  const larm = plan.sparrad || kort.some((k) => k.ton === 'fel');
  const banner = plan.sparrad
    ? { glyf: '🚨', text: 'Ronden stoppade sig själv — inga ändringar gjordes. Ring Axel.', ton: 'fel' }
    : larm
      ? { glyf: '⚠️', text: 'En sak behöver en människa — se det röda kortet.', ton: 'fel' }
      : { glyf: '✅', text: 'Allt sköter sig självt. Du behöver inte göra något.', ton: 'ok' };

  const ordning = { fel: 0, stopp: 1, justera: 2, vanta: 3, ok: 4 };
  kort.sort((a, b) => ordning[a.ton] - ordning[b.ton]);

  const senaste = [...logg]
    .filter((r) => r.genomford === true && LOGGTEXT[r.kod])
    .sort((a, b) => (a.datum < b.datum ? 1 : -1))
    .slice(0, 8);

  const kortHtml = kort.map(({ rad, glyf, ton, rubrik, text }) => {
    const namn = esc(rad.namn.split('|')[0].trim());
    const be = rad.dom.breakEven;
    const siffror = Number.isFinite(rad.roas3d) && Number.isFinite(be)
      ? `<div class="siffror"><span>Säljer för <b>${dec(rad.roas3d)} kr</b> per annonskrona</span><span>behöver <b>${dec(be)}</b></span></div>`
      : '';
    const budget = Number.isFinite(rad.budget) ? `<div class="budget">${kr(rad.budget)}<small>/dag just nu</small></div>` : '';
    return `<article class="kort t-${ton}">
  <div class="glyf" aria-hidden="true">${glyf}</div>
  <div class="inneh">
    <h2>${namn}</h2>
    <p class="besked">${esc(rubrik)}</p>
    <p class="forkl">${esc(text)}</p>
    ${siffror}
  </div>
  ${budget}
</article>`;
  }).join('\n');

  const loggHtml = senaste.length === 0
    ? '<p class="tomt">Inga ändringar gjorda ännu.</p>'
    : `<ul class="logg">${senaste.map((r) => `<li><time>${esc(r.datum)}</time> <b>${esc(String(r.kampanj_namn).split('|')[0].trim())}</b> ${esc(LOGGTEXT[r.kod](r))}</li>`).join('')}</ul>`;

  const datum = String(hamtad ?? '').slice(0, 10);

  return `<title>Bäverronden</title>
<style>
:root{
  --grund:#F6F3EE; --kort:#FFFFFF; --bläck:#221C15; --dov:#7C7267; --linje:#E7E0D5;
  --ok:#1B7A4E; --ok-w:#E7F2EB; --justera:#9A5B08; --justera-w:#F7EEDF;
  --stopp:#B3261E; --stopp-w:#F9E9E7; --vanta:#57534E; --vanta-w:#EFECE7;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --grund:#161210; --kort:#201A15; --bläck:#F2EDE5; --dov:#A79C8F; --linje:#373027;
  --ok:#5CC08D; --ok-w:#1E2E25; --justera:#E0A353; --justera-w:#302719;
  --stopp:#F28B82; --stopp-w:#34201E; --vanta:#B0A89F; --vanta-w:#28231F;
}}
:root[data-theme="dark"]{
  --grund:#161210; --kort:#201A15; --bläck:#F2EDE5; --dov:#A79C8F; --linje:#373027;
  --ok:#5CC08D; --ok-w:#1E2E25; --justera:#E0A353; --justera-w:#302719;
  --stopp:#F28B82; --stopp-w:#34201E; --vanta:#B0A89F; --vanta-w:#28231F;
}
*{box-sizing:border-box}
body{margin:0;background:var(--grund);color:var(--bläck);
  font:17px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  -webkit-font-smoothing:antialiased}
.ram{max-width:660px;margin:0 auto;padding:28px 16px 72px}
header h1{font-size:30px;font-weight:800;letter-spacing:-.02em;margin:0}
header .datum{color:var(--dov);margin:2px 0 18px;font-size:15px}
.banner{display:flex;align-items:center;gap:12px;border-radius:14px;padding:16px 18px;
  font-size:19px;font-weight:650;margin-bottom:26px}
.banner.t-ok{background:var(--ok-w);color:var(--ok)}
.banner.t-fel{background:var(--stopp-w);color:var(--stopp)}
.banner .bg{font-size:26px}
.kort{display:flex;gap:14px;align-items:flex-start;background:var(--kort);
  border:1px solid var(--linje);border-radius:14px;padding:16px;margin-bottom:12px}
.kort .glyf{font-size:30px;line-height:1;flex:none;margin-top:2px}
.kort .inneh{flex:1;min-width:0}
.kort h2{font-size:14px;font-weight:650;text-transform:uppercase;letter-spacing:.06em;
  color:var(--dov);margin:0 0 2px}
.kort .besked{font-size:20px;font-weight:800;margin:0;letter-spacing:-.01em}
.t-ok .besked{color:var(--ok)} .t-justera .besked{color:var(--justera)}
.t-stopp .besked,.t-fel .besked{color:var(--stopp)} .t-vanta .besked{color:var(--vanta)}
.kort .forkl{margin:4px 0 0;color:var(--dov);font-size:15px;max-width:44ch}
.siffror{display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font-size:14px;color:var(--dov)}
.siffror b{color:var(--bläck);font-variant-numeric:tabular-nums}
.budget{flex:none;text-align:right;font-size:22px;font-weight:800;
  font-variant-numeric:tabular-nums;white-space:nowrap}
.budget small{display:block;font-size:12px;font-weight:400;color:var(--dov)}
h3{font-size:15px;text-transform:uppercase;letter-spacing:.07em;color:var(--dov);
  margin:34px 0 10px;font-weight:650}
.logg{list-style:none;margin:0;padding:0}
.logg li{padding:9px 2px;border-bottom:1px solid var(--linje);font-size:15px}
.logg time{color:var(--dov);font-variant-numeric:tabular-nums;margin-right:8px}
.tomt{color:var(--dov)}
footer{margin-top:38px;color:var(--dov);font-size:14px;max-width:52ch}
@media(max-width:480px){.budget{display:none}}
</style>
<div class="ram">
<header>
  <h1>Bäverronden</h1>
  <p class="datum">Siffror från ${esc(datum)} · Bäverbutiken</p>
</header>
<div class="banner t-${banner.ton}"><span class="bg" aria-hidden="true">${banner.glyf}</span><span>${esc(banner.text)}</span></div>
${kortHtml}
${behov.length === 0 ? '' : `<h3>🎨 Nya annonser behövs</h3>
<ul class="logg">${behov.map((b) => `<li><b>${esc(b.namn.split('|')[0].trim())}</b> — ${esc(b.orsak)}</li>`).join('')}</ul>`}
<h3>Senast ändrat</h3>
${loggHtml}
<footer>Ronden kör själv varje dag: läser Meta, räknar reglerna och ändrar budgetarna.
Aldrig mer än 20 % åt gången. En produkt ändras högst var tredje dag — utom riktiga
vinnare (ROAS över 3), som får höjas dagligen. Golv 500 kr, tak 4 000 kr per produkt.
Blir något konstigt stoppar ronden sig själv och det står här.</footer>
${minnesBlock}${filBlock}
</div>`;
}

export const UTKORG = join(HÄR, 'utkorg');

async function lasUtkorg() {
  if (!existsSync(UTKORG)) return {};
  const filer = {};
  for (const post of await readdir(UTKORG, { recursive: true, withFileTypes: true })) {
    if (!post.isFile()) continue;
    const rel = join(post.parentPath ?? post.path, post.name).slice(UTKORG.length + 1);
    filer[rel] = await readFile(join(UTKORG, rel), 'utf8');
  }
  return filer;
}

async function main() {
  const data = JSON.parse(await readFile(join(HÄR, 'kontodata.json'), 'utf8'));
  const rå = JSON.parse(await readFile(join(HÄR, 'produktkarta.json'), 'utf8'));
  const karta = Object.fromEntries((rå.kampanjer ?? []).map((k) => [k.campaign_id, k]));
  const logg = await lasLogg();
  const rader = data.kampanjer.map((k) => bedomKampanj(k, { logg, idag: data.idag, karta, fx: rå.valutakurser }));
  const html = bygg({
    rader,
    plan: planera(rader, { logg, idag: data.idag }),
    logg,
    hamtad: data.hamtad,
    behov: annonsbehov(rader, { logg, idag: data.idag }),
    filer: await lasUtkorg(),
  });
  await writeFile(UTFIL, html, 'utf8');
  console.log(`skrev ${UTFIL} (${html.length} tecken)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e.message); process.exit(2); });
}
