// Schemasidan: kampanjkalendern och flödena för ett brand som EN sida Axel kan
// öppna (Artifact). Läser innehållsfilerna (inte Klaviyo), så sidan visar det som
// är byggt: datum, ämnesrad A, segment, status_plan, flödenas trigger och steg.
//
//   node klaviyo/schema-sida.mjs --brand matstrumpor [--villkor <fil.json>] [--ut <fil.html>]
//
// Utdata: klaviyo/output/<brand>/schema.html (gitignorerad). Publiceras som
// Artifact av sessionen, samma URL varje gång (länken står i klaviyo/README.md).
// `--villkor` är en JSON-fil { "rader": [{ "text", "lage": "ok"|"saknas"|"okant", "not" }] }
// med villkoren för påslagning, så sidan säger vad som stoppar.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { esk, ROT } from './mallar.mjs';
import { lasInnehall } from './bygg.mjs';

const DAGAR = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const MAN = ['jan', 'feb', 'mars', 'april', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];

function delar(iso, tidszon) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const p = Object.fromEntries(new Intl.DateTimeFormat('sv-SE', { timeZone: tidszon, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d).map((x) => [x.type, x.value]));
  const vd = new Date(Date.UTC(+p.year, +p.month - 1, +p.day)).getUTCDay();
  return { dag: +p.day, man: MAN[+p.month - 1], veckodag: DAGAR[vd], tid: `${p.hour}:${p.minute}`, iso: `${p.year}-${p.month.padStart(2, '0')}-${p.day.padStart(2, '0')}` };
}

const STATUS = { klar: ['Klar', 'ok'], 'utkast-skrivs-om-efter-lardom': ['Skrivs om efter lärdom', 'sen'], 'kraver-axel': ['Kräver Axel', 'varn'] };
const SEGMENT_ORD = { SEG_uppvarmning_steg1: 'uppvärmning: aktiva senaste 30 dagarna', SEG_engagerade_60d: 'engagerade 60 dagar', SEG_engagerade_90d: 'engagerade 90 dagar', SEG_samtycke: 'alla som sagt ja', SEG_kopare: 'alla köpare som sagt ja' };
const ENHET = { minutes: 'minuter', hours: 'timmar', days: 'dagar', weeks: 'veckor' };

function triggerText(t) {
  if (!t) return 'ingen trigger';
  if (t.typ === 'metrik') return `när någon gör: ${[].concat(t.metrik).join(' / ')}${t.produkt_innehaller ? ` med ${[].concat(t.produkt_innehaller).join(', ')} i ordern` : ''}`;
  if (t.typ === 'lista') return `när någon hamnar på listan ${t.lista}`;
  if (t.typ === 'segment') return `när någon hamnar i segmentet ${t.segment}`;
  return JSON.stringify(t);
}

export function schemaHtml({ brand, kampanjer, floden, villkor = null, nu = new Date() }) {
  const tz = brand.tidszon ?? 'Europe/Stockholm';
  const kal = brand.kalender ?? {};
  const markorer = [
    kal.fars_dag_sista_bestallning && { iso: kal.fars_dag_sista_bestallning, text: 'Sista beställningsdag för fars dag' },
    kal.fars_dag && { iso: kal.fars_dag, text: 'Fars dag' },
    kal.black_week?.[0] && { iso: kal.black_week[0], text: 'Black Week börjar' },
    kal.black_week?.[1] && { iso: kal.black_week[1], text: 'Black Week sista dagen' },
    kal.jul_sista_bestallning && { iso: kal.jul_sista_bestallning, text: 'Sista beställningsdag för jul' },
  ].filter(Boolean);
  const rader = [
    ...kampanjer.map((k) => ({ typ: 'kampanj', d: delar(k.planerad, tz), k })),
    ...markorer.map((m) => ({ typ: 'markor', d: delar(`${m.iso}T12:00:00+01:00`, tz), m })),
  ].filter((r) => r.d).sort((a, b) => a.d.iso.localeCompare(b.d.iso) || (a.typ === 'markor' ? -1 : 1));
  const kod = (k) => (k.id.match(/^k(\d+)/i) ? `K${k.id.match(/^k(\d+)/i)[1]}` : k.id);
  const lista = rader.map((r) => {
    if (r.typ === 'markor') {
      return `<li class="rad markor"><div class="datum"><span class="dag">${r.d.dag}</span><span class="man">${esk(r.d.man)}</span></div><div class="inre"><p class="titel">${esk(r.m.text)}</p><p class="svag">${esk(r.d.veckodag)}</p></div></li>`;
    }
    const k = r.k;
    const [st, kl] = STATUS[k.status_plan] ?? [k.status_plan ?? 'Utkast', 'sen'];
    const seg = (k.segment ?? []).map((s) => SEGMENT_ORD[s] ?? s).join(', ');
    return `<li class="rad"><div class="datum"><span class="dag">${r.d.dag}</span><span class="man">${esk(r.d.man)}</span></div><div class="inre">
      <p class="eyebrow">${esk(kod(k))} · ${esk(r.d.veckodag)} kl ${esk(r.d.tid)}</p>
      <p class="titel">${esk(k.amnesrader?.[0]?.text ?? k.namn)}</p>
      <p class="svag">Går till: ${esk(seg || '?')}</p>
      <p class="taggar"><span class="bricka ${kl}">${esk(st)}</span>${(k.block ?? []).filter((b) => b.typ === 'produkt' || b.typ === 'hero').map((b) => b.handle ?? (b.bild ?? '').replace(/^produkt:/, '')).filter(Boolean).filter((h, i, a) => a.indexOf(h) === i).map((h) => `<span class="tagg">${esk(h.replace(/-strumpor$/, '').replace(/^hamburger$/, 'hamburgare'))}</span>`).join('')}</p>
    </div></li>`;
  }).join('\n');
  const flodenHtml = floden.map((f) => {
    const steg = (f.steg ?? []).map((s) => (s.typ === 'vanta' ? `<li class="vanta">vänta ${esk(s.varde)} ${esk(ENHET[s.enhet] ?? s.enhet)}</li>` : `<li class="steg">${esk(s.mejl?.amnesrader?.[0]?.text ?? s.mejl?.id ?? 'mejl')}</li>`)).join('');
    return `<section class="flode"><h3>${esk(f.namn)}</h3><p class="svag">Startar ${esk(triggerText(f.trigger))}</p><ol class="kedja">${steg}</ol></section>`;
  }).join('\n');
  const villkorHtml = villkor?.rader?.length
    ? `<section class="villkor"><h2>Innan något slås på</h2><ul>${villkor.rader.map((v) => `<li class="v ${esk(v.lage)}"><span class="ikon" aria-hidden="true"></span><div><p class="vt">${esk(v.text)}</p>${v.not ? `<p class="svag">${esk(v.not)}</p>` : ''}</div></li>`).join('')}</ul>${villkor.slutsats ? `<p class="slutsats">${esk(villkor.slutsats)}</p>` : ''}</section>`
    : '';
  const byggd = delar(nu.toISOString(), tz);
  const antal = kampanjer.length;
  return `<title>${esk(brand.namn)} mejlschema</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap">
<style>
  :root { --grund: #f7f2e8; --kort: #fffdf8; --text: #1b1611; --svag: #6a6156; --linje: #e4dbc9; --accent: #dd821d; --accent-text: #8a4d0a; --ok: #1d7a3a; --varn: #8a6100; --stopp: #b3261e; --ok-bg: #e4f2e8; --varn-bg: #f6ecd2; --stopp-bg: #f8e1df; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; --grund: #1a1612; --kort: #24201b; --text: #f4ede2; --svag: #b3a999; --linje: #3d362e; --accent: #f09a3a; --accent-text: #f7c48a; --ok: #6fd28e; --varn: #f0c050; --stopp: #ff7a70; --ok-bg: #1e3326; --varn-bg: #3a3012; --stopp-bg: #43201d; } }
  :root[data-theme="dark"] { color-scheme: dark; --grund: #1a1612; --kort: #24201b; --text: #f4ede2; --svag: #b3a999; --linje: #3d362e; --accent: #f09a3a; --accent-text: #f7c48a; --ok: #6fd28e; --varn: #f0c050; --stopp: #ff7a70; --ok-bg: #1e3326; --varn-bg: #3a3012; --stopp-bg: #43201d; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--grund); color: var(--text); font: 19px/1.55 "Atkinson Hyperlegible", "Segoe UI", Arial, sans-serif; }
  main { max-width: 860px; margin: 0 auto; padding-block: 28px 80px; padding-inline: 16px; }
  h1, h2, h3 { font-family: Fredoka, "Trebuchet MS", Verdana, sans-serif; font-weight: 600; text-wrap: balance; margin: 0; }
  h1 { font-size: 40px; line-height: 1.1; color: var(--accent-text); }
  h2 { font-size: 26px; margin: 44px 0 14px; }
  h3 { font-size: 20px; }
  p { margin: 0; }
  .svag { color: var(--svag); font-size: 16px; }
  .ingress { font-size: 20px; max-width: 65ch; margin-top: 10px; }
  .eyebrow { font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-text); }
  .tidslinje { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
  .rad { display: grid; grid-template-columns: 76px 1fr; gap: 14px; align-items: start; background: var(--kort); border: 1px solid var(--linje); border-radius: 14px; padding: 14px 16px; }
  .rad.markor { background: transparent; border-style: dashed; }
  .datum { display: grid; justify-items: center; align-content: start; padding: 4px 0; border-right: 2px solid var(--accent); }
  .dag { font-family: Fredoka, "Trebuchet MS", sans-serif; font-size: 34px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
  .man { font-size: 14px; text-transform: uppercase; letter-spacing: .08em; color: var(--svag); }
  .inre { display: grid; gap: 4px; min-width: 0; }
  .titel { font-size: 21px; font-weight: 700; line-height: 1.3; overflow-wrap: anywhere; }
  .markor .titel { color: var(--accent-text); }
  .taggar { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; align-items: center; }
  .bricka { display: inline-block; font-size: 14px; font-weight: 700; padding: 3px 12px; border-radius: 999px; }
  .bricka.ok { background: var(--ok-bg); color: var(--ok); } .bricka.sen { background: var(--varn-bg); color: var(--varn); } .bricka.varn { background: var(--stopp-bg); color: var(--stopp); }
  .tagg { font-size: 14px; padding: 3px 10px; border: 1px solid var(--linje); border-radius: 8px; color: var(--svag); }
  .villkor { background: var(--kort); border: 1px solid var(--linje); border-radius: 14px; padding: 18px 20px 20px; margin-top: 28px; }
  .villkor h2 { margin: 0 0 12px; }
  .villkor ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
  .v { display: grid; grid-template-columns: 26px 1fr; gap: 10px; align-items: start; }
  .v .ikon { width: 22px; height: 22px; border-radius: 50%; margin-top: 3px; }
  .v.ok .ikon { background: var(--ok); } .v.saknas .ikon { background: var(--stopp); } .v.okant .ikon { background: var(--varn); }
  .v .vt { font-weight: 700; }
  .v.ok .vt::before { content: "Klart: "; color: var(--ok); } .v.saknas .vt::before { content: "Saknas: "; color: var(--stopp); } .v.okant .vt::before { content: "Okänt: "; color: var(--varn); }
  .slutsats { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--linje); font-weight: 700; }
  .floden { display: grid; gap: 12px; }
  .flode { background: var(--kort); border: 1px solid var(--linje); border-radius: 14px; padding: 14px 16px; }
  .kedja { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; padding: 0; margin: 10px 0 0; }
  .kedja li { font-size: 15px; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--linje); }
  .kedja li.steg { border-color: var(--accent); font-weight: 700; }
  .kedja li + li::before { content: "→ "; color: var(--svag); }
  @media (max-width: 480px) { h1 { font-size: 32px; } .rad { grid-template-columns: 64px 1fr; padding: 12px; } .dag { font-size: 28px; } .titel { font-size: 19px; } }
</style>
<main>
  <p class="eyebrow">${esk(brand.namn)} · e-post</p>
  <h1>Mejlschemat hösten 2026</h1>
  <p class="ingress">${antal} kampanjer och ${floden.length} flöden, allt som utkast i Klaviyo. En rad per utskick med datum, ämnesraden och vilka som får den. Byggd ${esk(byggd.veckodag)} ${byggd.dag} ${esk(byggd.man)} kl ${esk(byggd.tid)}.</p>
  ${villkorHtml}
  <h2>Kampanjerna, i datumordning</h2>
  <ol class="tidslinje">${lista}</ol>
  <h2>Flödena</h2>
  <div class="floden">${flodenHtml || '<p class="svag">Inga flöden byggda.</p>'}</div>
</main>
`;
}

function arg(namn) {
  const i = process.argv.indexOf(namn);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const brandId = arg('--brand') ?? 'baverbutiken';
  const brand = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'brands', `${brandId}.json`), 'utf8'));
  const innehall = lasInnehall(join(ROT, 'klaviyo', 'innehall', brandId));
  if (innehall.fel.length) { console.error(innehall.fel.join('\n')); process.exit(1); }
  const villkorFil = arg('--villkor');
  const villkor = villkorFil && existsSync(villkorFil) ? JSON.parse(readFileSync(villkorFil, 'utf8')) : null;
  const ut = arg('--ut') ?? join(ROT, 'klaviyo', 'output', brandId, 'schema.html');
  mkdirSync(join(ut, '..'), { recursive: true });
  writeFileSync(ut, schemaHtml({ brand, kampanjer: innehall.kampanjer, floden: innehall.floden, villkor }));
  console.log(`${innehall.kampanjer.length} kampanjer, ${innehall.floden.length} flöden → ${ut}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
