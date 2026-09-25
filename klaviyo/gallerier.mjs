// Gallerierna: tre sidor per brand som visar ALLT som är byggt, färdigrenderat, i
// butikens eget brand — kampanjerna i datumordning, flödena som kedjor och alla
// mallar. Axels beställning 2026-09-25: "skicka massa gallerier till mig med alla
// mallar, alla flows, alla kampanjer färdiggenererade, jävligt nice".
//
//   node klaviyo/gallerier.mjs --brand matstrumpor [--lankar <fil.json>]
//
// Läser output/<brand>/manifest.json + <id>.exempel.html (skrivna av bygg.mjs) och
// innehall/<brand>/. Skriver output/<brand>/galleri-kampanjer.html, galleri-floden.html
// och galleri-mallar.html (gitignorerade). Publiceras som Artifacts av sessionen; med
// `--lankar` ({ kampanjer, floden, mallar, schema, galleri }) får sidorna en meny
// som pekar på varandra. Varje mejl visas i en telefonram (iframe srcdoc), som
// bygg.mjs galleri, men sidan är byggd för att titta på, inte för att felsöka.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { esk, ROT } from './mallar.mjs';
import { lasInnehall } from './bygg.mjs';
import { delar, STATUS, SEGMENT_ORD, ENHET, triggerText } from './schema-sida.mjs';

const FLODESNAMN = { f01: 'Välkomst', f02: 'Övergiven kassa', f03: 'Webbhistorik', f04: 'Efter köp', f05: 'Vinna tillbaka', f06: 'Sunset', f07: 'Återköp' };
const FILTER_ORD = { samtycke: 'bara den som sagt ja till mejl', kundundantag: 'alla köpare som inte tackat nej', ej_kopt_sedan_start: 'stannar om personen köper', ej_checkout_sedan_start: 'stannar om personen går till kassan', ej_i_flodet_7d: 'inte i flödet senaste 7 dagarna', ej_i_flodet_14d: 'inte i flödet senaste 14 dagarna', ej_i_flodet_30d: 'inte i flödet senaste 30 dagarna', kopt_minst_en_gang: 'har köpt minst en gång' };
const STIL_FALLBACK = { farg_rod: '#dd821d', farg_svart: '#1b1611', farg_ram: '#e4dbc9' };

function flodesNamn(id, namn) {
  const k = String(id).slice(0, 3);
  return FLODESNAMN[k] ? `${k.toUpperCase()} ${FLODESNAMN[k]}` : namn;
}

function telefon(html, titel) {
  return `<figure class="telefon"><div class="skarm"><iframe title="${esk(titel)}" srcdoc="${esk(html)}" loading="lazy" scrolling="no"></iframe></div></figure>`;
}

function huvud({ brand, sida, titel, ingress, lankar }) {
  const meny = [['kampanjer', 'Kampanjer'], ['floden', 'Flöden'], ['mallar', 'Mallar'], ['schema', 'Schemat'], ['galleri', 'Galleriet']]
    .map(([k, t]) => (k === sida ? `<span class="nu">${t}</span>` : lankar?.[k] ? `<a href="${esk(lankar[k])}">${t}</a>` : ''))
    .filter(Boolean)
    .join('');
  return `<header class="topp">
  <p class="eyebrow">${esk(brand.namn)} · e-post</p>
  <h1>${esk(titel)}</h1>
  <p class="ingress">${esk(ingress)}</p>
  ${meny ? `<nav class="meny" aria-label="Gallerierna">${meny}</nav>` : ''}
</header>`;
}

function stil(brand, s) {
  const accent = s.farg_rod ?? '#dd821d';
  return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap">
<style>
  :root { --grund: #f7f2e8; --kort: #fffdf8; --text: #1b1611; --svag: #6a6156; --linje: #e4dbc9; --accent: ${accent}; --accent-text: #8a4d0a; --ok: #1d7a3a; --varn: #8a6100; --ok-bg: #e4f2e8; --varn-bg: #f6ecd2; --ram: #1b1611; --skarm: #f2f2f2; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; --grund: #1a1612; --kort: #24201b; --text: #f4ede2; --svag: #b3a999; --linje: #3d362e; --accent: #f09a3a; --accent-text: #f7c48a; --ok: #6fd28e; --varn: #f0c050; --ok-bg: #1e3326; --varn-bg: #3a3012; --ram: #0e0c0a; --skarm: #2a2622; } }
  :root[data-theme="dark"] { color-scheme: dark; --grund: #1a1612; --kort: #24201b; --text: #f4ede2; --svag: #b3a999; --linje: #3d362e; --accent: #f09a3a; --accent-text: #f7c48a; --ok: #6fd28e; --varn: #f0c050; --ok-bg: #1e3326; --varn-bg: #3a3012; --ram: #0e0c0a; --skarm: #2a2622; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--grund); color: var(--text); font: 18px/1.55 "Atkinson Hyperlegible", "Segoe UI", Arial, sans-serif; }
  main { max-width: 1120px; margin: 0 auto; padding-block: 24px 80px; padding-inline: 16px; }
  h1, h2, h3 { font-family: Fredoka, "Trebuchet MS", Verdana, sans-serif; font-weight: 600; text-wrap: balance; margin: 0; }
  h1 { font-size: 40px; line-height: 1.1; color: var(--accent-text); }
  h2 { font-size: 26px; }
  h3 { font-size: 21px; }
  p { margin: 0; }
  .svag { color: var(--svag); font-size: 16px; }
  .eyebrow { font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-text); }
  .ingress { font-size: 19px; max-width: 65ch; margin-top: 8px; }
  .topp { display: grid; gap: 6px; padding-bottom: 20px; border-bottom: 2px solid var(--accent); margin-bottom: 26px; }
  .meny { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .meny a, .meny .nu { font-family: Fredoka, sans-serif; font-weight: 600; font-size: 16px; padding: 8px 16px; border-radius: 999px; border: 2px solid var(--accent); color: var(--accent-text); text-decoration: none; }
  .meny .nu { background: var(--accent); color: #fff; border-color: var(--accent); }
  .meny a:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
  .hopp { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 24px; padding: 0; list-style: none; }
  .hopp a { font-size: 15px; font-weight: 700; padding: 5px 12px; border-radius: 8px; background: var(--kort); border: 1px solid var(--linje); color: var(--text); text-decoration: none; }
  .kort { display: grid; grid-template-columns: minmax(0, 1fr) 420px; gap: 24px; align-items: start; background: var(--kort); border: 1px solid var(--linje); border-radius: 18px; padding: 22px 24px; margin-bottom: 22px; }
  .kort.enkel { grid-template-columns: minmax(0, 1fr); }
  .meta { display: grid; gap: 10px; min-width: 0; }
  .datum { display: inline-flex; align-items: baseline; gap: 8px; font-family: Fredoka, sans-serif; color: var(--accent-text); }
  .datum b { font-size: 34px; line-height: 1; }
  .datum span { font-size: 16px; text-transform: uppercase; letter-spacing: .06em; }
  .amne { font-size: 24px; font-weight: 700; line-height: 1.25; overflow-wrap: anywhere; }
  .fht { font-size: 17px; color: var(--svag); font-style: italic; }
  .rad { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 8px; font-size: 16px; padding-top: 8px; border-top: 1px dashed var(--linje); }
  .rad dt { color: var(--svag); }
  .rad dd { margin: 0; overflow-wrap: anywhere; }
  .rad ol { margin: 0; padding-left: 18px; }
  .brickor { display: flex; flex-wrap: wrap; gap: 6px; }
  .bricka { display: inline-block; font-size: 14px; font-weight: 700; padding: 3px 12px; border-radius: 999px; }
  .bricka.ok { background: var(--ok-bg); color: var(--ok); } .bricka.sen { background: var(--varn-bg); color: var(--varn); } .bricka.varn { background: var(--varn-bg); color: var(--varn); }
  .tagg { font-size: 14px; padding: 3px 10px; border: 1px solid var(--linje); border-radius: 8px; color: var(--svag); }
  .telefon { margin: 0; width: 100%; max-width: 420px; justify-self: end; }
  .skarm { border: 10px solid var(--ram); border-radius: 30px; background: var(--skarm); overflow: hidden; box-shadow: 0 18px 40px rgba(0,0,0,.18); }
  .skarm iframe { display: block; width: 100%; height: 900px; border: 0; background: var(--skarm); }
  .flode { background: var(--kort); border: 1px solid var(--linje); border-radius: 18px; padding: 22px 24px; margin-bottom: 26px; }
  .flode-huvud { display: grid; gap: 6px; margin-bottom: 16px; }
  .kedja { display: flex; gap: 18px; overflow-x: auto; padding: 6px 2px 14px; scroll-snap-type: x proximity; }
  .kedja > * { flex: 0 0 auto; scroll-snap-align: start; }
  .steg { width: min(420px, 86vw); display: grid; gap: 10px; }
  .steg .amne { font-size: 20px; }
  .vanta { align-self: center; display: grid; justify-items: center; gap: 6px; width: 120px; text-align: center; font-family: Fredoka, sans-serif; font-size: 16px; color: var(--accent-text); }
  .vanta .pil { width: 100%; height: 3px; background: var(--accent); border-radius: 2px; position: relative; }
  .vanta .pil::after { content: ""; position: absolute; right: -2px; top: -5px; border: 6px solid transparent; border-left: 10px solid var(--accent); }
  .start { align-self: center; width: 200px; padding: 14px 16px; border-radius: 14px; background: var(--accent); color: #fff; font-family: Fredoka, sans-serif; font-weight: 600; line-height: 1.3; }
  .start small { display: block; font-family: "Atkinson Hyperlegible", sans-serif; font-weight: 400; font-size: 14px; margin-top: 4px; color: #fff3e2; }
  .rutnat { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 22px; }
  .rutnat .kort { grid-template-columns: minmax(0, 1fr); padding: 16px; margin: 0; }
  .rutnat .telefon { justify-self: stretch; max-width: none; }
  .rutnat .namn { font-size: 14px; font-weight: 700; overflow-wrap: anywhere; }
  @media (max-width: 860px) { .kort { grid-template-columns: minmax(0, 1fr); } .telefon { justify-self: stretch; max-width: 460px; } }
  @media (max-width: 480px) { h1 { font-size: 32px; } .kort { padding: 16px; border-radius: 14px; } .rad { grid-template-columns: 1fr; gap: 2px; } .amne { font-size: 21px; } }
  @media (prefers-reduced-motion: no-preference) { .meny a:hover { transform: translateY(-1px); transition: transform .15s; } }
</style>`;
}

const AUTOSIZE = `<script>
  for (const f of document.querySelectorAll('iframe')) {
    f.addEventListener('load', () => { try { const h = f.contentDocument.documentElement.scrollHeight; if (h > 200) f.style.height = h + 'px'; } catch (e) {} });
  }
</script>`;

function kampanjKort({ k, mejl, html, brand }) {
  const d = delar(k.planerad, brand.tidszon ?? 'Europe/Stockholm');
  const [st, kl] = STATUS[k.status_plan] ?? [k.status_plan ?? 'Utkast', 'sen'];
  const kod = (k.id.match(/^k(\d+)/i) ? `K${k.id.match(/^k(\d+)/i)[1]}` : k.id);
  const amnen = mejl.amnesrader ?? [];
  const seg = (k.segment ?? []).map((s) => SEGMENT_ORD[s] ?? s).join(', ');
  return `<article class="kort" id="${esk(k.id)}">
  <div class="meta">
    <p class="datum">${d ? `<b>${d.dag}</b><span>${esk(d.man)} · ${esk(d.veckodag)} kl ${esk(d.tid)}</span>` : '<span>inget datum</span>'}</p>
    <p class="eyebrow">${esk(kod)}</p>
    <p class="amne">${esk(amnen[0]?.text ?? k.namn)}</p>
    <p class="fht">${esk(mejl.forhandstext ?? '')}</p>
    <dl class="rad"><dt>Testas mot</dt><dd><ol>${amnen.slice(1).map((a) => `<li>${esk(a.text)}</li>`).join('')}</ol></dd></dl>
    <dl class="rad"><dt>Går till</dt><dd>${esk(seg || '?')}</dd></dl>
    <dl class="rad"><dt>Läge</dt><dd class="brickor"><span class="bricka ${kl}">${esk(st)}</span>${(mejl.taggar?.urgency && mejl.taggar.urgency !== 'ingen') ? `<span class="tagg">brådska: ${esk(mejl.taggar.urgency)}</span>` : ''}</dd></dl>
    <dl class="rad"><dt>Hypotes</dt><dd class="svag">${esk(String(mejl.memo ?? '').replace(/^\s*hypotes:\s*/i, ''))}</dd></dl>
    <p class="svag">${esk(k.namn)}</p>
  </div>
  ${telefon(html, `${kod} i mobilen`)}
</article>`;
}

export function galleriKampanjer({ brand, kampanjer, htmlFor, lankar }) {
  const s = STIL_FALLBACK;
  const sorterade = [...kampanjer].sort((a, b) => String(a.planerad).localeCompare(String(b.planerad)));
  const hopp = sorterade.map((k) => { const d = delar(k.planerad, brand.tidszon); const kod = k.id.match(/^k(\d+)/i) ? `K${k.id.match(/^k(\d+)/i)[1]}` : k.id; return `<li><a href="#${esk(k.id)}">${esk(kod)} · ${d ? `${d.dag} ${esk(d.man)}` : ''}</a></li>`; }).join('');
  return `<title>${esk(brand.namn)} kampanjer</title>
${stil(brand, s)}
<main>
${huvud({ brand, sida: 'kampanjer', titel: 'Alla kampanjer, färdiga', ingress: `${sorterade.length} kampanjer i datumordning, renderade som de ser ut i mobilen. Ämnesrad A är den som står överst; B och C testas mot den. Allt ligger som utkast i Klaviyo tills du säger till.`, lankar })}
<ul class="hopp">${hopp}</ul>
${sorterade.map((k) => kampanjKort({ k, mejl: k, html: htmlFor(k.id), brand })).join('\n')}
</main>
${AUTOSIZE}
`;
}

export function galleriFloden({ brand, floden, htmlFor, lankar }) {
  const s = STIL_FALLBACK;
  const hopp = floden.map((f) => `<li><a href="#${esk(f.id)}">${esk(flodesNamn(f.id, f.namn))}</a></li>`).join('');
  const sektioner = floden.map((f) => {
    let n = 0;
    const filt = (f.filter ?? []).map((x) => FILTER_ORD[x] ?? x).join(' · ');
    const ater = f.ateintrade?.enhet === 'alltime' ? 'en gång per person' : f.ateintrade?.varaktighet ? `kan gå in igen efter ${f.ateintrade.varaktighet} ${ENHET[f.ateintrade.enhet + 's'] ?? ENHET[f.ateintrade.enhet] ?? f.ateintrade.enhet}` : '';
    const steg = (f.steg ?? []).map((st) => {
      if (st.typ === 'vanta') return `<div class="vanta"><span>vänta ${esk(st.varde)} ${esk(ENHET[st.enhet] ?? st.enhet)}</span><div class="pil"></div></div>`;
      n += 1;
      const m = st.mejl ?? {};
      const id = m.id ?? `${f.id}-e${n}`;
      return `<div class="steg"><p class="eyebrow">Mejl ${n}</p><p class="amne">${esk(m.amnesrader?.[0]?.text ?? id)}</p><p class="fht">${esk(m.forhandstext ?? '')}</p>${telefon(htmlFor(id), `${id} i mobilen`)}</div>`;
    }).join('');
    return `<section class="flode" id="${esk(f.id)}">
  <div class="flode-huvud">
    <h2>${esk(flodesNamn(f.id, f.namn))}</h2>
    <p class="svag">${esk(f.namn)} · ${esk(filt)}${ater ? ` · ${esk(ater)}` : ''}</p>
    <p class="svag">${esk(f.memo ?? '')}</p>
  </div>
  <div class="kedja"><div class="start">Startar<small>${esk(triggerText(f.trigger))}</small></div>${steg}</div>
</section>`;
  }).join('\n');
  return `<title>${esk(brand.namn)} flöden</title>
${stil(brand, s)}
<main>
${huvud({ brand, sida: 'floden', titel: 'Alla flöden, steg för steg', ingress: `${floden.length} automatiska serier. Varje rad är ett flöde: vad som startar det, väntetiderna och varje mejl renderat i mobilen. Dra i sidled i kedjan på en liten skärm.`, lankar })}
<ul class="hopp">${hopp}</ul>
${sektioner}
</main>
${AUTOSIZE}
`;
}

export function galleriMallar({ brand, manifest, htmlFor, lankar }) {
  const s = STIL_FALLBACK;
  const mejl = manifest.mejl ?? [];
  const kort = mejl.map((m) => `<article class="kort" id="${esk(m.id)}">
  <p class="eyebrow">${m.kalla === 'kampanj' ? 'Kampanj' : `Flöde · ${esk(flodesNamn(m.flode_id ?? '', m.flode_id ?? ''))}`}</p>
  <p class="amne" style="font-size:19px">${esk(m.amnesrader?.[0]?.text ?? m.id)}</p>
  <p class="namn svag">TPL_${esk(m.id)}_v${esk(m.version ?? 1)}</p>
  ${telefon(htmlFor(m.id), `${m.id} i mobilen`)}
</article>`).join('\n');
  return `<title>${esk(brand.namn)} mallar</title>
${stil(brand, s)}
<main>
${huvud({ brand, sida: 'mallar', titel: 'Alla mallar, renderade', ingress: `${mejl.length} mallar i Klaviyo, som de ser ut i mobilen. Namnet under varje mall är mallens namn i Klaviyo (Content → Templates).`, lankar })}
<div class="rutnat">${kort}</div>
</main>
${AUTOSIZE}
`;
}

function arg(namn) {
  const i = process.argv.indexOf(namn);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const brandId = arg('--brand') ?? 'baverbutiken';
  const brand = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'brands', `${brandId}.json`), 'utf8'));
  const ut = join(ROT, 'klaviyo', 'output', brandId);
  const manifestFil = join(ut, 'manifest.json');
  if (!existsSync(manifestFil)) throw new Error(`${manifestFil} saknas — kör node klaviyo/bygg.mjs --brand ${brandId} först.`);
  const manifest = JSON.parse(readFileSync(manifestFil, 'utf8'));
  const innehall = lasInnehall(join(ROT, 'klaviyo', 'innehall', brandId));
  if (innehall.fel.length) throw new Error(innehall.fel.join('\n'));
  const lankarFil = arg('--lankar');
  const lankar = lankarFil && existsSync(lankarFil) ? JSON.parse(readFileSync(lankarFil, 'utf8')) : null;
  const htmlFor = (id) => {
    const fil = join(ut, `${id}.exempel.html`);
    if (!existsSync(fil)) throw new Error(`${fil} saknas — kör node klaviyo/bygg.mjs --brand ${brandId} igen.`);
    return readFileSync(fil, 'utf8');
  };
  mkdirSync(ut, { recursive: true });
  const filer = {
    'galleri-kampanjer.html': galleriKampanjer({ brand, kampanjer: innehall.kampanjer, htmlFor, lankar }),
    'galleri-floden.html': galleriFloden({ brand, floden: innehall.floden, htmlFor, lankar }),
    'galleri-mallar.html': galleriMallar({ brand, manifest, htmlFor, lankar }),
  };
  for (const [namn, html] of Object.entries(filer)) {
    writeFileSync(join(ut, namn), html);
    console.log(`${namn}: ${Math.round(Buffer.byteLength(html, 'utf8') / 1024)} kB`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
