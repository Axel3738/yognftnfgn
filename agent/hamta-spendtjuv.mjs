#!/usr/bin/env node
// Bygger jobbfilerna till spendtjuvsspärren (rond-auto steg 3 och 3b) ur Meta
// och budgetloggen, och kör spärren. Ordagranna annonsrader, inget räknat av
// sessionen — allt som spendtjuv.mjs behöver skrivs av kod.
//
//   node agent/hamta-spendtjuv.mjs --konto SE --idag 2026-09-27
//   node agent/hamta-spendtjuv.mjs --konto NO --idag 2026-09-27
//
// Läser rondens utfall (agent/utdata/rond-<se|no>-<idag>.json) för domar och
// break-even, kontodatan för kampanjens spend/livstid, loggen för etiketter,
// räddningar och ägarbeslut. Skriver agent/utdata/spendtjuv-<idag>/<se|no>/
// jobb-<id>.json + utfall-<id>.json och en sammanfattning.
//
// Trappan (typ trappa i planen): lage saknas ⇒ den gamla grinden.
// Grönt läge (plus-domar ≥ 1 000 kr/3 d): lage "gron".
// Under break-even utan trappa (HALVERA/SANK/RAKNA_BACKDAGAR): körs, utförs aldrig.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { alla, val, tal, spendKr, KONTON } from './hamta-kontodata.mjs';
import { lasLogg, senasteRadMedKod, backDagarIRad } from './logg.mjs';
import { lasBelopp } from './besked.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));
const GRONA = new Set(['LAT_VARA', 'SKALA', 'VANTA_KADENS', 'CPA_STIGER', 'VISNING_AVVAKTA', 'VANTA_KONSEKVENT', 'HOGZON_AVVAKTA', 'MANUELL', 'MANUELL_SANK']);
const RODA_UTAN_TRAPPA = new Set(['HALVERA', 'SANK', 'RAKNA_BACKDAGAR']);
const GRON_MIN_SPEND = 1000;

const flagga = (n, d = null) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const svensktDatum = (iso) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.parse(iso)));
const dagar = (a, b) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86400000);

async function main() {
  const kontoKod = flagga('--konto');
  const idag = flagga('--idag');
  const konto = KONTON[kontoKod];
  if (!konto || !idag) { console.error('Ange --konto SE|NO --idag YYYY-MM-DD'); process.exit(2); }
  const m = kontoKod.toLowerCase();
  const utfall = JSON.parse(readFileSync(join(HÄR, 'utdata', `rond-${m}-${idag}.json`), 'utf8'));
  const kontodata = JSON.parse(readFileSync(join(HÄR, konto.fil), 'utf8'));
  const logg = await lasLogg();
  const utDir = join(HÄR, 'utdata', `spendtjuv-${idag}`, m);
  mkdirSync(utDir, { recursive: true });

  const trappa = new Map(utfall.plan.atgarder.filter((a) => a.typ === 'trappa').map((a) => [a.kampanj_id, a]));
  const kandidater = [];
  for (const r of utfall.rader) {
    const kod = r.dom?.kod;
    const spend3d = lasBelopp(r.spend3d);
    if (trappa.has(r.id)) kandidater.push({ rad: r, lage: 'trappa' });
    else if (GRONA.has(kod) && spend3d >= GRON_MIN_SPEND) kandidater.push({ rad: r, lage: 'gron' });
    else if (RODA_UTAN_TRAPPA.has(kod)) kandidater.push({ rad: r, lage: 'rod_utan_trappa' });
  }
  console.error(`${kontoKod}: ${kandidater.length} kampanjer att köra spärren på (${kandidater.map((k) => `${k.rad.namn.split('|')[0].trim()} [${k.lage}]`).join(', ')})`);

  const act = `act_${konto.id}`;
  const sammanfattning = [];
  for (const { rad, lage } of kandidater) {
    const id = rad.id;
    const k = kontodata.kampanjer.find((c) => c.id === id) || {};
    const filt = [{ field: 'campaign.id', operator: 'IN', value: [id] }];
    const lista = await alla(`${act}/ads`, { fields: 'id,name,effective_status,created_time', filtering: filt });
    const tre = await alla(`${act}/insights`, { level: 'ad', date_preset: 'last_3d', filtering: filt, fields: 'ad_id,spend,actions,purchase_roas', action_attribution_windows: ['7d_click'], limit: 500 });
    const max = await alla(`${act}/insights`, { level: 'ad', date_preset: 'maximum', filtering: filt, fields: 'ad_id,spend,actions,purchase_roas', action_attribution_windows: ['7d_click'], limit: 500 });
    const sju = await alla(`${act}/insights`, { level: 'ad', date_preset: 'last_7d', filtering: filt, fields: 'ad_id,spend,actions,purchase_roas', action_attribution_windows: ['7d_click'], limit: 500 });
    const p3 = new Map(tre.map((x) => [x.ad_id, x]));
    const pm = new Map(max.map((x) => [x.ad_id, x]));
    const p7 = new Map(sju.map((x) => [x.ad_id, x]));
    const be = rad.dom?.breakEven ?? rad.dom?.be ?? null;
    const spendTot = lasBelopp(k.spend_total);
    const roasTot = lasBelopp(k.roas_total);
    const kopTot = k.kop_total;
    const aov = spendTot > 0 && roasTot > 0 && kopTot > 0 ? (spendTot * roasTot) / kopTot : null;
    const beCpa = aov !== null && be ? aov / be : null;

    const annonser = [];
    for (const a of lista) {
      const t = p3.get(a.id) || {};
      const mx = pm.get(a.id) || {};
      const s7 = p7.get(a.id) || {};
      const etikettRad = [...logg].filter((l) => l.kod === 'ETIKETT' && l.annons_id === a.id).sort((x, y) => String(y.datum).localeCompare(String(x.datum)))[0] || null;
      const post = {
        id: a.id,
        namn: a.name,
        spend: spendKr(t.spend ?? '0.00'),
        kop: t.spend !== undefined ? (tal(val(t.actions, 'omni_purchase', '7d_click')) ?? 0) : 0,
        roas: tal(val(t.purchase_roas, 'omni_purchase', '7d_click')) ?? 0,
        status: a.effective_status,
        roas_livstid: tal(val(mx.purchase_roas, 'omni_purchase', '7d_click')) ?? 0,
        spend_livstid: spendKr(mx.spend ?? '0.00'),
        kop_livstid: mx.spend !== undefined ? (tal(val(mx.actions, 'omni_purchase', '7d_click')) ?? 0) : 0,
        alder_dagar: a.created_time ? dagar(idag, svensktDatum(a.created_time)) : null,
        etikett: etikettRad?.etikett ?? null,
        etikett_datum: etikettRad?.datum ?? null,
        spend_7d: spendKr(s7.spend ?? '0.00'),
        roas_7d: tal(val(s7.purchase_roas, 'omni_purchase', '7d_click')) ?? 0,
        backdagar_i_rad: null,
      };
      if (post.etikett === 'BREAKTHROUGH' && be) {
        const serie = await alla(`${act}/insights`, { level: 'ad', date_preset: 'last_14d', time_increment: '1', filtering: [{ field: 'ad.id', operator: 'IN', value: [a.id] }], fields: 'ad_id,spend,purchase_roas', action_attribution_windows: ['7d_click'], limit: 100 });
        const dygn = serie.map((d) => ({ datum: d.date_start, spend: tal(d.spend), roas: tal(val(d.purchase_roas, 'omni_purchase', '7d_click')) ?? 0 }));
        post.backdagar_i_rad = backDagarIRad(dygn, be);
      }
      annonser.push(post);
    }
    const raddning = senasteRadMedKod(logg, id, ['TRAPPA_FORLANGNING'], { maxAlderDagar: 14, idag });
    const raddningar14d = logg.filter((l) => l.kampanj_id === id && l.kod === 'TRAPPA_FORLANGNING' && l.genomford === true && dagar(idag, l.datum) <= 14 && dagar(idag, l.datum) >= 0).length;
    const agarIdag = logg.some((l) => l.kampanj_id === id && l.kod === 'ATERAKTIVERA' && l.genomford === true && l.datum === idag);
    const jobb = {
      ...(lage === 'gron' ? { lage: 'gron', idag } : { idag }),
      kampanj_id: id,
      kampanj_namn: rad.namn,
      break_even: be,
      ...(beCpa !== null ? { break_even_cpa: beCpa } : {}),
      spend_3d: k.spend_3d ?? rad.spend3d,
      raddningar_14d: raddningar14d,
      agarbeslut_idag: agarIdag,
      dom_i_planen: rad.dom?.kod ?? null,
      forlangning_idag: raddning && raddning.datum === idag ? true : false,
      attribution_annonsrader: '7d_click',
      annonser,
    };
    const jobbFil = join(utDir, `jobb-${id}.json`);
    writeFileSync(jobbFil, `${JSON.stringify(jobb, null, 2)}\n`);
    let res;
    try {
      res = JSON.parse(execFileSync('node', [join(HÄR, 'spendtjuv.mjs'), '--jobb', jobbFil, '--json'], { encoding: 'utf8', maxBuffer: 20e6 }));
    } catch (e) {
      res = { fel: String(e.stdout || e.message).slice(0, 500) };
    }
    writeFileSync(join(utDir, `utfall-${id}.json`), `${JSON.stringify(res, null, 2)}\n`);
    sammanfattning.push({ kampanj_id: id, namn: rad.namn.split('|')[0].trim(), lage, dom_i_planen: rad.dom?.kod, annonser: annonser.length, break_even: be, break_even_cpa: beCpa, raddningar_14d: raddningar14d, forlangning_idag: jobb.forlangning_idag, agarbeslut_idag: agarIdag, dom: res.dom ?? null, tjuvar: (res.tjuvar || []).map((t) => `${t.namn} ${t.spend ?? ''} roas ${t.roas ?? ''} ${t.orsak ?? ''}`), vantar: (res.vantar || []).map((v) => `${v.namn}: ${v.vantar_orsak}`), rest: res.rest ?? null, raddade: res.raddade ?? null, motivering: res.motivering ?? res.fel ?? null });
    console.error(`  ${rad.namn.split('|')[0].trim()} [${lage}] → ${res.dom ?? res.fel} (${annonser.length} annonser${(res.tjuvar || []).length ? `, tjuvar: ${res.tjuvar.map((t) => t.namn).join(', ')}` : ''})`);
  }
  writeFileSync(join(utDir, '_sammanfattning.json'), `${JSON.stringify(sammanfattning, null, 2)}\n`);
  console.log(JSON.stringify(sammanfattning, null, 2));
}

main().catch((e) => { console.error(`SPENDTJUVSHÄMTNINGEN AVBRÖTS: ${e.message}`); process.exit(2); });
