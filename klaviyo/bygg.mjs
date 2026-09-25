// Bygger alla Klaviyo-mejl för ett brand: innehållsfilerna + Shopify-priser +
// riktiga recensioner → HTML (Klaviyo-läge och exempel), textversion,
// manifest.json åt uppladdaren och ett galleri (index.html) åt Axel.
//
//   node klaviyo/bygg.mjs                       # Bäverbutiken, live Shopify + Judge.me
//   node klaviyo/bygg.mjs --offline             # cachade produkter/recensioner
//   node klaviyo/bygg.mjs --bara f02-overgiven-kassa   # en kampanj, ett flöde eller ett mejl
//   node klaviyo/bygg.mjs --innehall <mapp> --ut <mapp> --produkter <fil.json>   # tester/fixturer
//
// Utdata i klaviyo/output/<brand>/ (gitignorerad). Exit 1 om något mejl har fel.
// Kontraktet för allt som skrivs står i klaviyo/ARKITEKTUR.md.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { byggMejl, laddaBrandResurser, esk, ROT } from './mallar.mjs';
import { validera } from './validera.mjs';
import { hamtaProdukterCache } from './produkter.mjs';
import { hamtaRecensionerCache } from './recensioner.mjs';
import { nyttRegister, medPlatshallare, bildSkript } from './bilder.mjs';

const STATUS_PLAN = new Set(['klar', 'utkast-skrivs-om-efter-lardom', 'kraver-axel']);

function lasMapp(mapp, fel) {
  if (!existsSync(mapp)) return [];
  return readdirSync(mapp)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      try {
        return { fil: f, data: JSON.parse(readFileSync(join(mapp, f), 'utf8')) };
      } catch (e) {
        fel.push(`${f}: går inte att läsa som JSON (${e.message}).`);
        return null;
      }
    })
    .filter(Boolean);
}

// Kampanj- och flödesfilerna → en platt lista mejl med sitt sammanhang.
export function lasInnehall(innehallDir) {
  const fel = [];
  const kampanjer = lasMapp(join(innehallDir, 'kampanjer'), fel).map(({ fil, data }) => ({ ...data, id: data.id ?? basename(fil, '.json') }));
  const floden = lasMapp(join(innehallDir, 'floden'), fel).map(({ fil, data }) => ({ ...data, id: data.id ?? basename(fil, '.json') }));
  return { kampanjer, floden, fel };
}

export function planeraMejl({ kampanjer, floden }) {
  const mejl = [];
  for (const k of kampanjer) mejl.push({ mejl: k, kalla: 'kampanj', kampanj: k });
  for (const f of floden) {
    let n = 0;
    (f.steg ?? []).forEach((st, i) => {
      if (st.typ !== 'mejl') return;
      n += 1;
      const m = st.mejl ?? {};
      mejl.push({ mejl: { ...m, id: m.id ?? `${f.id}-e${n}` }, kalla: 'flode', flode: f, steg_index: i });
    });
  }
  return mejl;
}

export async function bygg({
  brandId = 'baverbutiken',
  rot = ROT,
  offline = false,
  bara = null,
  innehallDir = null,
  utDir = null,
  produkter = null,
  recensioner = null,
  nu = new Date(),
  logg = () => {},
} = {}) {
  const brand = JSON.parse(readFileSync(join(rot, 'klaviyo', 'brands', `${brandId}.json`), 'utf8'));
  const { stil, erbjudande } = laddaBrandResurser(brand, rot);
  const inDir = innehallDir ?? join(rot, 'klaviyo', 'innehall', brandId);
  const ut = utDir ?? join(rot, 'klaviyo', 'output', brandId);
  mkdirSync(ut, { recursive: true });

  const toppFel = [];
  const toppVarningar = [];
  const innehall = lasInnehall(inDir);
  toppFel.push(...innehall.fel);

  let lista = produkter;
  if (!lista) {
    const r = await hamtaProdukterCache({ brand, offline, rot });
    lista = r.produkter;
    toppVarningar.push(...r.varningar);
  }
  let rec = recensioner;
  if (!rec) {
    const r = await hamtaRecensionerCache({ brand, produkter: lista, offline, rot });
    rec = r.recensioner;
    toppVarningar.push(...r.varningar);
  }

  let plan = planeraMejl(innehall);
  if (bara) plan = plan.filter((p) => p.mejl.id === bara || p.kampanj?.id === bara || p.flode?.id === bara);
  if (bara && !plan.length) toppFel.push(`--bara ${bara}: ingen kampanj, inget flöde och inget mejl med det id:t.`);

  const sedda = new Map();
  const mejlUt = [];
  for (const p of plan) {
    const m = p.mejl;
    const id = String(m.id ?? '');
    if (!/^[a-z0-9][a-z0-9-_]*$/i.test(id)) {
      toppFel.push(`Mejl-id "${id}" duger inte som filnamn (bara a-z, 0-9, - och _).`);
      continue;
    }
    if (sedda.has(id)) toppFel.push(`Mejl-id "${id}" finns två gånger (${sedda.get(id)} och ${p.kalla}).`);
    sedda.set(id, p.kalla);
    const indata = { brand, stil, erbjudande, produkter: lista, recensioner: rec };
    const k = byggMejl(m, { ...indata, lage: 'klaviyo' });
    const ex = byggMejl(m, { ...indata, lage: 'exempel' });
    const v = validera(m, {
      html: k.html,
      text: k.text,
      produkter: lista,
      brand,
      lage: 'klaviyo',
      kalla: p.kalla,
      segment: p.kampanj?.segment ?? null,
      trigger: p.flode?.trigger ?? null,
    });
    const fel = [...v.fel];
    const varningar = [...new Set([...k.varningar, ...v.varningar])];
    if (p.kampanj) {
      const kp = p.kampanj;
      if (!kp.planerad || Number.isNaN(Date.parse(kp.planerad))) fel.push('Kampanjen saknar giltigt datum i "planerad".');
      if (!Array.isArray(kp.segment) || !kp.segment.length) fel.push('Kampanjen saknar segment.');
      if (!STATUS_PLAN.has(kp.status_plan)) varningar.push(`Okänd status_plan "${kp.status_plan}".`);
      if (kp.status_plan === 'kraver-axel' && !kp.kraver_axel) varningar.push('status_plan är kraver-axel men kraver_axel säger inte vad.');
    }
    writeFileSync(join(ut, `${id}.html`), k.html);
    writeFileSync(join(ut, `${id}.exempel.html`), ex.html);
    writeFileSync(join(ut, `${id}.txt`), k.text);
    mejlUt.push({
      post: {
        id,
        namn: m.namn ?? id,
        // Mallnamnet är TPL_<id>_v<version>: ändrad text i ett mejl som redan
        // laddats upp måste få en högre version, annars återanvänds den gamla mallen.
        ...(m.version ? { version: m.version } : {}),
        amnesrader: (m.amnesrader ?? []).map((a) => ({ text: a.text, begar: a.begar ?? null })),
        forhandstext: m.forhandstext ?? '',
        html: `${id}.html`,
        text: `${id}.txt`,
        kalla: p.kalla,
        ...(p.flode ? { flode_id: p.flode.id, steg_index: p.steg_index } : {}),
        taggar: m.taggar ?? {},
        memo: m.memo ?? '',
      },
      fel,
      varningar,
      exempelHtml: ex.html,
      mejl: m,
    });
    logg(`${fel.length ? '❌' : '✅'} ${id}${fel.length ? `: ${fel.length} fel` : ''}${varningar.length ? `, ${varningar.length} varningar` : ''}`);
  }

  const ids = new Set(mejlUt.map((x) => x.post.id));
  const kampanjer = innehall.kampanjer
    .filter((k) => ids.has(k.id))
    .map((k) => ({
      id: k.id,
      namn: k.namn ?? k.id,
      planerad: k.planerad ?? null,
      segment: k.segment ?? [],
      exkludera: k.exkludera ?? [],
      mejl_id: k.id,
      status_plan: k.status_plan ?? null,
      kraver_axel: k.kraver_axel ?? null,
    }));
  const floden = innehall.floden
    .filter((f) => (f.steg ?? []).some((st, i) => st.typ === 'mejl' && mejlUt.some((x) => x.post.flode_id === f.id && x.post.steg_index === i)))
    .map((f) => {
      let n = 0;
      return {
        id: f.id,
        namn: f.namn ?? f.id,
        memo: f.memo ?? '',
        trigger: f.trigger ?? null,
        filter: f.filter ?? [],
        ateintrade: f.ateintrade ?? null,
        steg: (f.steg ?? []).map((st) => {
          if (st.typ === 'vanta') return { typ: 'vanta', enhet: st.enhet, varde: st.varde };
          if (st.typ === 'mejl') {
            n += 1;
            return { typ: 'mejl', mejl_id: st.mejl?.id ?? `${f.id}-e${n}` };
          }
          toppFel.push(`Flödet ${f.id}: okänd stegtyp "${st.typ}".`);
          return { typ: st.typ };
        }),
      };
    });
  for (const f of innehall.floden) {
    if (!f.trigger?.typ) toppFel.push(`Flödet ${f.id} saknar trigger.`);
    if (!String(f.memo ?? '').trim()) toppFel.push(`Flödet ${f.id} saknar memo.`);
  }

  const allaFel = [...toppFel, ...mejlUt.flatMap((x) => x.fel.map((f) => `${x.post.id}: ${f}`))];
  const allaVarningar = [...new Set(toppVarningar), ...mejlUt.flatMap((x) => x.varningar.map((v) => `${x.post.id}: ${v}`))];
  const manifest = {
    brand: brand.id,
    byggd: nu.toISOString(),
    mejl: mejlUt.map((x) => x.post),
    kampanjer,
    floden,
    fel: allaFel,
    varningar: allaVarningar,
  };
  writeFileSync(join(ut, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(join(ut, 'index.html'), galleri({ brand, manifest, mejlUt, toppFel, toppVarningar, nu }));
  return { manifest, mejlUt, utDir: ut };
}

// ---------------------------------------------------------------------------
// Galleriet (index.html) — för Axel: stort, enkelt, svenska, fungerar offline
// ---------------------------------------------------------------------------

const DAGAR = ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'];
const MAN = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function svensktDatum(iso, tidszon = 'Europe/Stockholm') {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'inget datum';
  const delar = Object.fromEntries(
    new Intl.DateTimeFormat('sv-SE', { timeZone: tidszon, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(d)
      .map((p) => [p.type, p.value])
  );
  const vd = new Date(Date.UTC(Number(delar.year), Number(delar.month) - 1, Number(delar.day))).getUTCDay();
  return `${DAGAR[vd]} ${Number(delar.day)} ${MAN[Number(delar.month) - 1]} kl ${delar.hour}:${delar.minute}`;
}

const ENHET = { minutes: ['minut', 'minuter'], hours: ['timme', 'timmar'], days: ['dag', 'dagar'], weeks: ['vecka', 'veckor'], minute: ['minut', 'minuter'], hour: ['timme', 'timmar'], day: ['dag', 'dagar'], week: ['vecka', 'veckor'] };
const enhetOrd = (enhet, varde) => (ENHET[enhet] ? ENHET[enhet][Number(varde) === 1 ? 0 : 1] : enhet);
const STATUS_ORD = { klar: 'Klar', 'utkast-skrivs-om-efter-lardom': 'Skrivs om efter lärdom', 'kraver-axel': 'Kräver Axel' };

function triggerText(t) {
  if (!t) return 'ingen trigger';
  if (t.typ === 'metrik') return `när någon gör: ${[].concat(t.metrik).join(' / ')}`;
  if (t.typ === 'lista') return `när någon hamnar på listan ${t.lista}`;
  if (t.typ === 'segment') return `när någon hamnar i segmentet ${t.segment}`;
  return JSON.stringify(t);
}

// Med `reg` (bilder inbäddade, klaviyo/bilder.mjs) skrivs ramarna som data-srcdoc
// med platshållare; utan skrivs srcdoc rakt av, som när bygg.mjs själv skriver galleriet.
function mejlKort(x, reg = null) {
  const p = x.post;
  const status = x.fel.length ? `<span class="bricka fel">${x.fel.length} fel</span>` : '<span class="bricka ok">Inga fel</span>';
  const amnen = p.amnesrader
    .map((a, i) => `<li><b>${'ABCDEFG'[i] ?? i + 1}</b> ${esk(a.text)}${a.begar ? ` <span class="svag">(${esk(a.begar)})</span>` : ''}</li>`)
    .join('');
  const taggar = Object.entries(p.taggar ?? {})
    .filter(([k, v]) => !k.startsWith('_') && v !== null && v !== '')
    .map(([k, v]) => `<span class="tagg">${esk(k)}: ${esk(v)}</span>`)
    .join(' ');
  const lista = (rader, klass) => (rader.length ? `<ul class="${klass}">${rader.map((r) => `<li>${esk(r)}</li>`).join('')}</ul>` : '');
  const src = reg ? esk(medPlatshallare(x.exempelHtml, reg)) : esk(x.exempelHtml);
  const attr = reg ? 'data-srcdoc' : 'srcdoc';
  return `
    <article class="mejl" id="m-${esk(p.id)}">
      <header>
        <h3>${esk(p.id)}</h3>
        ${status}
      </header>
      <p class="svag namn">${esk(p.namn)}</p>
      <div class="info">
        <div>
          <h4>Ämnesrader</h4>
          <ol class="amnen">${amnen}</ol>
          <h4>Förhandstext</h4>
          <p>${esk(p.forhandstext)}</p>
          <h4>Hypotes (memo)</h4>
          <p>${esk(p.memo)}</p>
          <p class="taggar">${taggar}</p>
          ${x.fel.length ? `<h4 class="rod">Måste rättas</h4>${lista(x.fel, 'fellista')}` : ''}
          ${x.varningar.length ? `<h4>Att titta på</h4>${lista(x.varningar, 'varnlista')}` : ''}
        </div>
      </div>
      <div class="vyer">
        <figure><figcaption>Mobil (390 px)</figcaption><div class="ram"><iframe title="${esk(p.id)} mobil" width="390" height="900" ${attr}="${src}" loading="lazy"></iframe></div></figure>
        <figure><figcaption>Dator (600 px)</figcaption><div class="ram"><iframe title="${esk(p.id)} dator" width="640" height="900" ${attr}="${src}" loading="lazy"></iframe></div></figure>
      </div>
    </article>`;
}

export function galleri({ brand, manifest, mejlUt, toppFel = [], toppVarningar = [], nu = new Date(), bilder = null }) {
  const reg = bilder ? nyttRegister() : null;
  const perId = new Map(mejlUt.map((x) => [x.post.id, x]));
  const kampanjer = [...manifest.kampanjer].sort((a, b) => String(a.planerad).localeCompare(String(b.planerad)));
  const tidslinje = kampanjer
    .map((k) => {
      const x = perId.get(k.mejl_id);
      const fel = x?.fel.length ?? 0;
      return `
      <li>
        <a href="#m-${esk(k.mejl_id)}">
          <span class="datum">${esk(svensktDatum(k.planerad, brand.tidszon))}</span>
          <span class="titel">${esk(x?.post.amnesrader[0]?.text ?? k.namn)}</span>
          <span class="svag">${esk(k.segment.join(', '))}${k.exkludera.length ? ` · utom ${esk(k.exkludera.join(', '))}` : ''}</span>
          <span class="bricka ${fel ? 'fel' : 'ok'}">${fel ? `${fel} fel` : esk(STATUS_ORD[k.status_plan] ?? k.status_plan ?? 'Klar')}</span>
          ${k.kraver_axel ? `<span class="axel">Du behöver: ${esk(k.kraver_axel)}</span>` : ''}
        </a>
      </li>`;
    })
    .join('');
  const floden = manifest.floden
    .map((f) => {
      const kedja = f.steg
        .map((st) => {
          if (st.typ === 'vanta') return `<li class="vanta">Vänta ${esk(st.varde)} ${esk(enhetOrd(st.enhet, st.varde))}</li>`;
          const x = perId.get(st.mejl_id);
          return `<li class="steg"><a href="#m-${esk(st.mejl_id)}">${esk(x?.post.amnesrader[0]?.text ?? st.mejl_id)}</a>${x?.fel.length ? ` <span class="bricka fel">${x.fel.length} fel</span>` : ''}</li>`;
        })
        .join('');
      return `
      <section class="flode">
        <h3>${esk(f.namn)}</h3>
        <p><b>Startar</b> ${esk(triggerText(f.trigger))}</p>
        <p class="svag">${esk(f.memo)}</p>
        <ol class="kedja">${kedja}</ol>
      </section>`;
    })
    .join('');
  const kampanjMejl = mejlUt.filter((x) => x.post.kalla === 'kampanj').map((x) => mejlKort(x, reg)).join('');
  const flodesMejl = mejlUt.filter((x) => x.post.kalla === 'flode').map((x) => mejlKort(x, reg)).join('');
  const antalFel = manifest.fel.length;
  return `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esk(brand.namn)} mejlplan</title>
<style>
  :root { --bg: #f4f4f1; --kort: #ffffff; --text: #111111; --svag: #5d5d5d; --ram: #dcdcd4; --rod: #c8161b; --gron: #1d7a3a; --gul: #8a6100; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #141414; --kort: #1f1f1f; --text: #f1f1f1; --svag: #a9a9a9; --ram: #3a3a3a; --rod: #ff5a5f; --gron: #5ed283; --gul: #f0c050; } }
  :root[data-theme="dark"] { --bg: #141414; --kort: #1f1f1f; --text: #f1f1f1; --svag: #a9a9a9; --ram: #3a3a3a; --rod: #ff5a5f; --gron: #5ed283; --gul: #f0c050; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 19px/1.55 Arial, Helvetica, sans-serif; overflow-wrap: anywhere; }
  main { max-width: 1400px; margin: 0 auto; padding: 24px 16px 80px; }
  h1 { font-size: 34px; margin: 0 0 6px; } h2 { font-size: 28px; margin: 48px 0 16px; } h3 { font-size: 22px; margin: 0; } h4 { font-size: 17px; margin: 18px 0 6px; text-transform: uppercase; letter-spacing: .5px; color: var(--svag); }
  a { color: inherit; }
  .svag { color: var(--svag); }
  .rod { color: var(--rod) !important; }
  .bricka { display: inline-block; padding: 3px 12px; border-radius: 999px; font-size: 15px; font-weight: bold; border: 2px solid currentColor; white-space: nowrap; }
  .bricka.ok { color: var(--gron); } .bricka.fel { color: var(--rod); }
  .sammanfattning { font-size: 21px; padding: 16px 20px; border-radius: 12px; background: var(--kort); border: 2px solid var(--ram); }
  .sammanfattning.fel { border-color: var(--rod); }
  .tidslinje { list-style: none; padding: 0; margin: 0; border-left: 4px solid var(--rod); }
  .tidslinje li a { display: grid; gap: 4px; padding: 14px 18px; margin: 0 0 12px 18px; background: var(--kort); border: 1px solid var(--ram); border-radius: 10px; text-decoration: none; position: relative; }
  .tidslinje li a::before { content: ""; position: absolute; left: -29px; top: 22px; width: 16px; height: 16px; border-radius: 50%; background: var(--rod); }
  .tidslinje .bricka, .tidslinje .axel { justify-self: start; }
  .datum { font-weight: bold; font-size: 20px; } .titel { font-size: 20px; } .axel { color: var(--gul); font-weight: bold; }
  .flode { background: var(--kort); border: 1px solid var(--ram); border-radius: 12px; padding: 18px 20px; margin-bottom: 16px; }
  .kedja { list-style: none; display: flex; flex-wrap: wrap; gap: 10px; padding: 0; margin: 12px 0 0; }
  .kedja li { padding: 10px 14px; border-radius: 10px; border: 2px solid var(--ram); }
  .kedja li.steg { border-color: var(--rod); font-weight: bold; }
  .kedja li + li::before { content: "→ "; color: var(--svag); }
  .mejl { background: var(--kort); border: 1px solid var(--ram); border-radius: 14px; padding: 20px; margin-bottom: 28px; }
  .mejl header { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .namn { font-size: 14px; word-break: break-all; margin: 4px 0 0; }
  .amnen { padding-left: 0; list-style: none; margin: 0; } .amnen li { margin: 4px 0; }
  .tagg { display: inline-block; font-size: 14px; padding: 2px 10px; border-radius: 6px; border: 1px solid var(--ram); margin: 2px 2px 0 0; }
  .fellista li { color: var(--rod); font-weight: bold; } .varnlista li { color: var(--gul); }
  .vyer { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 18px; }
  figure { margin: 0; min-width: 0; max-width: 100%; } figcaption { font-weight: bold; margin-bottom: 6px; }
  .ram { max-width: 100%; overflow-x: auto; border: 1px solid var(--ram); border-radius: 8px; background: #f2f2f2; }
  iframe { display: block; border: 0; background: #f2f2f2; }
  .tema { float: right; font-size: 16px; padding: 8px 14px; border-radius: 8px; border: 2px solid var(--ram); background: var(--kort); color: var(--text); cursor: pointer; }
</style>
</head>
<body>
<main>
  <button class="tema" type="button" id="tema">Ljust / mörkt</button>
  <h1>${esk(brand.namn)}: mejlplanen</h1>
  <p class="svag">Byggd ${esk(svensktDatum(manifest.byggd, brand.tidszon))}. ${manifest.mejl.length} mejl, ${manifest.kampanjer.length} kampanjer, ${manifest.floden.length} flöden. Allt laddas upp som utkast, inget skickas av sig självt.</p>
  <p class="sammanfattning ${antalFel ? 'fel' : ''}">${antalFel ? `<b class="rod">${antalFel} fel måste rättas</b> innan något laddas upp. De står i rött vid varje mejl.` : '<b>Inga fel.</b> Alla mejl klarar kontrollerna.'}</p>
  ${toppFel.length ? `<ul class="fellista">${toppFel.map((f) => `<li>${esk(f)}</li>`).join('')}</ul>` : ''}
  ${toppVarningar.length ? `<ul class="varnlista">${toppVarningar.map((f) => `<li>${esk(f)}</li>`).join('')}</ul>` : ''}

  <h2>Kampanjerna, i datumordning</h2>
  ${tidslinje ? `<ol class="tidslinje">${tidslinje}</ol>` : '<p class="svag">Inga kampanjer än.</p>'}

  <h2>Flödena</h2>
  ${floden || '<p class="svag">Inga flöden än.</p>'}

  <h2>Kampanjmejlen</h2>
  ${kampanjMejl || '<p class="svag">Inga.</p>'}

  <h2>Flödesmejlen</h2>
  ${flodesMejl || '<p class="svag">Inga.</p>'}
</main>
${reg ? bildSkript(reg, bilder) : ''}
<script>
  // Ramarna får mejlets höjd, så inget behöver skrollas inuti.
  for (const f of document.querySelectorAll('iframe')) {
    f.addEventListener('load', () => { try { f.style.height = f.contentDocument.documentElement.scrollHeight + 'px'; } catch (e) {} });
  }
  document.getElementById('tema').addEventListener('click', () => {
    const r = document.documentElement;
    const mork = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    r.dataset.theme = mork ? 'light' : 'dark';
  });
</script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function arg(namn) {
  const i = process.argv.indexOf(namn);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const offline = process.argv.includes('--offline');
  const produkterFil = arg('--produkter');
  if (!offline && !produkterFil) {
    // Undici läser inte HTTPS_PROXY själv; samma knep som mejl/bygg.mjs.
    const { kravProxy } = await import('../mejl/shopify.mjs');
    kravProxy();
  }
  const brandId = arg('--brand') ?? 'baverbutiken';
  const r = await bygg({
    brandId,
    offline,
    bara: arg('--bara'),
    innehallDir: arg('--innehall'),
    utDir: arg('--ut'),
    produkter: produkterFil ? JSON.parse(readFileSync(produkterFil, 'utf8')) : null,
    recensioner: arg('--recensioner') ? JSON.parse(readFileSync(arg('--recensioner'), 'utf8')) : null,
    logg: (t) => console.log(t),
  });
  const m = r.manifest;
  console.log(`\n${m.mejl.length} mejl, ${m.kampanjer.length} kampanjer, ${m.floden.length} flöden → ${r.utDir}`);
  console.log(`Galleriet: ${join(r.utDir, 'index.html')}`);
  if (m.varningar.length) console.log(`\n${m.varningar.length} varningar:\n${m.varningar.map((v) => `  ⚠️  ${v}`).join('\n')}`);
  if (m.fel.length) {
    console.error(`\n❌ ${m.fel.length} fel:\n${m.fel.map((f) => `  ${f}`).join('\n')}`);
    process.exit(1);
  }
  if (!m.mejl.length) console.log('Inga mejl hittades i innehållsmappen.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
