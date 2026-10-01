// schemalagg.mjs — startar Matstrumpors utlandskampanjer på en bestämd tid, i två steg. Byggt
// 2026-10-01 på Axels ord: "kan inte du bara schemalägga alla kampanjer … Till 00:01 2 oktober" och
// "Varför skulle vi inte schemalägga alla och japan".
//
// Varför två steg: Meta vägrar ändra starttiden på ett adset som redan finns ("Det går inte att
// redigera starttiden om annonsuppsättningen redan har startats", mätt 2026-10-01 — fast adseten
// aldrig levererat). Därför:
//   1. FÖRBERED (före starttiden): adsetets länder synkas, annonserna (utom hall_av) och adsetet
//      slås på. Kampanjen står kvar PAUSED, så inget levereras och inget kostar — men Meta får
//      granska annonserna i förväg.
//   2. STARTA (vid starttiden, --starta): bara kampanjerna slås på, och allt läses tillbaka.
//      Vägrar före starttiden − 2 min och efter starttiden + 6 h (en gammal väckning startar aldrig).
//
//   node matstrumpor/marknader/annonser/schemalagg.mjs --start 2026-10-02T00:01:00+02:00 --alla                     # torrt
//   node matstrumpor/marknader/annonser/schemalagg.mjs --start 2026-10-02T00:01:00+02:00 --alla --skarpt            # förbered
//   node matstrumpor/marknader/annonser/schemalagg.mjs --start 2026-10-02T00:01:00+02:00 --alla --skarpt --starta   # starta
//   … --marknad NO,DK i stället för --alla
//
// Järnregler (samma som bygg.mjs --aktivera, plus fler):
// - Bara kampanjerna i marknader.json, med exakt namn. Ingen annan kampanj i kontot rörs, och
//   kontonamnet läses tillbaka innan något skrivs.
// - farAktiveras (bygg.mjs) avgör per marknad: lansering_stopp (Taiwan), ⛔/platshållare i
//   budgetbeslutet eller en annons som länkar fel stoppar marknaden med orsak.
// - Kampanjens dagsbudget måste vara exakt marknader.json:s. Skiljer den sig stoppar marknaden —
//   en budget ändras aldrig i förbigående.
// - `hall_av` i marknader.json: annonser som står kvar PAUSED med skäl (Norges 007 hörs "sukker").
// - Adsetets länder synkas mot `geo` (Australien ur WW 2026-10-01 tills Meta godkänt bolaget).
// - --starta slår bara på en kampanj vars adset redan är förberett (ACTIVE). Allt läses tillbaka.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { api, alla } from '../../../tools/meta-lib.mjs';
import { farAktiveras } from './bygg.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const M = JSON.parse(readFileSync(join(ROT, 'marknader.json'), 'utf8'));
const log = (s) => console.log(s);

/** Ren: starttiden som Date, eller ett fel. Kräver tidszon i texten. */
export function lasStart(text) {
  if (!text || !/(Z|[+-]\d\d:?\d\d)$/.test(text)) throw new Error(`--start måste bära tidszon, t.ex. 2026-10-02T00:01:00+02:00 (fick "${text ?? ''}")`);
  const t = new Date(text);
  if (Number.isNaN(t.getTime())) throw new Error(`--start går inte att läsa: "${text}"`);
  return t;
}

/** Ren: får steget köras nu? Förbered: bara före starttiden. Starta: från starttiden − 2 min till
 *  starttiden + 6 h — en väckning som kommer för tidigt eller för sent startar ingenting. */
export function tidOk(steg, start, nu = new Date()) {
  const d = nu.getTime() - start.getTime();
  if (steg === 'forbered') return d < 0 ? { ok: true } : { ok: false, skal: `starttiden ${start.toISOString()} har redan passerat — kör --starta i stället` };
  if (d < -2 * 60_000) return { ok: false, skal: `för tidigt: starttiden är ${start.toISOString()}, klockan ${nu.toISOString()}` };
  if (d > 6 * 3_600_000) return { ok: false, skal: `för sent: starttiden ${start.toISOString()} passerade för mer än 6 timmar sedan — fråga Axel` };
  return { ok: true };
}

/** Ren: vilka annonser som slås på och vilka som står kvar avstängda (`hall_av` i marknader.json). */
export function delaAnnonser(k, annonser) {
  const hall = new Map((k.hall_av ?? []).map((h) => [h.namn, h.skal]));
  return {
    pa: annonser.filter((a) => !hall.has(a.name)),
    av: annonser.filter((a) => hall.has(a.name)).map((a) => ({ ...a, skal: hall.get(a.name) })),
    saknas: [...hall.keys()].filter((n) => !annonser.some((a) => a.name === n)),
  };
}

/** Ren: skiljer adsetets länder från marknadens `geo`? Ordningen spelar ingen roll. */
export function geoSkiljer(k, targeting = {}) {
  const har = [...(targeting.geo_locations?.countries ?? [])].sort().join(',');
  return har !== [...k.geo].sort().join(',');
}

/** Ren: fel i det tillbakalästa läget. Kampanjen ska vara `kampanjSka`, adsetet ACTIVE, varje annons
 *  ACTIVE utom de som hålls av (PAUSED), och länderna marknadens. */
export function lageFel(k, { kampanj, adset, annonser }, kampanjSka, avIds = new Set()) {
  const fel = [];
  if (kampanj.status !== kampanjSka) fel.push(`kampanjen ${kampanj.status} (ska ${kampanjSka})`);
  if (adset.status !== 'ACTIVE') fel.push(`adsetet ${adset.status}`);
  if (geoSkiljer(k, adset.targeting)) fel.push(`länderna ${adset.targeting?.geo_locations?.countries}`);
  for (const a of annonser) {
    const ska = avIds.has(a.id) ? 'PAUSED' : 'ACTIVE';
    if (a.status !== ska) fel.push(`${a.name} ${a.status} (ska ${ska})`);
  }
  return fel;
}

async function lasMarknad(k) {
  const kampanj = ((await api(`act_${M.konto}/campaigns`, { params: { fields: 'id,name,status,effective_status,daily_budget', limit: 200 } })).data ?? []).find((c) => c.name === k.kampanj);
  if (!kampanj) return { skal: `kampanjen ${k.kampanj} finns inte` };
  const adset = ((await api(`${kampanj.id}/adsets`, { params: { fields: 'id,name,status,effective_status,targeting,issues_info', limit: 50 } })).data ?? []).find((a) => a.name === k.adset);
  if (!adset) return { skal: `adsetet ${k.adset} finns inte` };
  const annonser = (await alla(`${adset.id}/ads`, { fields: 'id,name,status,effective_status,creative{object_story_spec}' }, 50)).map((a) => {
    const o = a.creative?.object_story_spec ?? {};
    return { id: a.id, name: a.name, status: a.status, effective_status: a.effective_status, lank: (o.video_data ?? o.link_data)?.call_to_action?.value?.link ?? o.link_data?.link ?? '' };
  });
  return { kampanj, adset, annonser };
}

async function enMarknad(kod, steg, skarpt) {
  const k = M.kampanjer[kod];
  if (!k) throw new Error(`Okänd marknad ${kod}`);
  const l = await lasMarknad(k);
  if (l.skal) return { kod, ok: false, skal: l.skal };
  const { kampanj, adset, annonser } = l;
  const f = farAktiveras(k, annonser);
  if (!f.ok) return { kod, ok: false, skal: f.skal };
  if (Number(kampanj.daily_budget) !== k.budget_sek_dag * 100) return { kod, ok: false, skal: `dagsbudgeten i kontot är ${Number(kampanj.daily_budget) / 100} kr, marknader.json säger ${k.budget_sek_dag} kr` };
  const { pa, av, saknas } = delaAnnonser(k, annonser);
  if (saknas.length) return { kod, ok: false, skal: `hall_av nämner annonser som inte finns i adsetet: ${saknas.join(', ')}` };
  const geo = geoSkiljer(k, adset.targeting);
  if (steg === 'starta' && (adset.status !== 'ACTIVE' || geo)) return { kod, ok: false, skal: `adsetet är inte förberett (${adset.status}${geo ? ', fel länder' : ''}) — kör förberedelsen först` };
  log(`\n── ${kod}: ${k.kampanj} ${kampanj.id} (${kampanj.status}) · ${k.budget_sek_dag} kr/dag · adset ${adset.id} (${adset.status}) · ${pa.length} annonser på${av.length ? `, ${av.length} kvar avstängda (${av.map((a) => a.name).join(', ')})` : ''}${geo ? ` · länder ${adset.targeting?.geo_locations?.countries?.join(',')} → ${k.geo.join(',')}` : ''}`);
  if (!skarpt) return { kod, ok: true, torrt: true };

  if (steg === 'forbered') {
    if (geo) {
      const targeting = { ...adset.targeting, geo_locations: { ...adset.targeting.geo_locations, countries: k.geo } };
      await api(adset.id, { form: { targeting: JSON.stringify(targeting) } });
    }
    for (const a of pa) if (a.status !== 'ACTIVE') await api(a.id, { form: { status: 'ACTIVE' } });
    if (adset.status !== 'ACTIVE') await api(adset.id, { form: { status: 'ACTIVE' } });
  } else if (kampanj.status !== 'ACTIVE') {
    await api(kampanj.id, { form: { status: 'ACTIVE' } });
  }

  const l2 = await lasMarknad(k);
  const avIds = new Set(av.map((a) => a.id));
  const kampanjSka = steg === 'starta' ? 'ACTIVE' : 'PAUSED';
  const fel = lageFel(k, l2, kampanjSka, avIds);
  const rad = {
    kod, steg, ok: !fel.length,
    kampanj: { id: l2.kampanj.id, status: l2.kampanj.status, effective_status: l2.kampanj.effective_status, kr_dag: Number(l2.kampanj.daily_budget) / 100 },
    adset: { id: l2.adset.id, status: l2.adset.status, effective_status: l2.adset.effective_status, lander: l2.adset.targeting?.geo_locations?.countries, issues: (l2.adset.issues_info ?? []).map((i) => `${i.error_code} ${i.error_summary}`) },
    annonser: l2.annonser.map((a) => ({ id: a.id, namn: a.name, status: a.status, effective_status: a.effective_status })),
    fel,
  };
  const paAntal = l2.annonser.filter((a) => a.status === 'ACTIVE').length;
  const eff = [...new Set(l2.annonser.map((a) => a.effective_status))].join('/');
  log(`${fel.length ? '❌' : '✅'} ${kod}: kampanj ${l2.kampanj.status}/${l2.kampanj.effective_status} ${rad.kampanj.kr_dag} kr/dag · adset ${l2.adset.status}/${l2.adset.effective_status} ${rad.adset.lander?.join(',')} · ${paAntal} av ${l2.annonser.length} annonser på (${eff})${fel.length ? ` · FEL: ${fel.join('; ')}` : ''}${rad.adset.issues.length ? ` · Meta: ${rad.adset.issues.join('; ')}` : ''}`);
  return rad;
}

async function huvud() {
  const arg = process.argv.slice(2);
  const skarpt = arg.includes('--skarpt');
  const steg = arg.includes('--starta') ? 'starta' : 'forbered';
  const si = arg.indexOf('--start');
  const start = lasStart(si >= 0 ? arg[si + 1] : undefined);
  const t = tidOk(steg, start);
  if (!t.ok) throw new Error(`${steg}: ${t.skal}`);
  const konto = await api(`act_${M.konto}`, { params: { fields: 'name,currency,timezone_name' } });
  if (konto.name !== M.konto_namn) throw new Error(`Kontot heter "${konto.name}", marknader.json säger "${M.konto_namn}" — fel konto, stopp.`);
  log(`Konto: ${konto.name} (${M.konto}, ${konto.currency}, ${konto.timezone_name}) — ${steg.toUpperCase()} ${skarpt ? 'SKARPT' : 'torrt'} · start ${start.toISOString()}`);
  const koder = arg.includes('--alla') ? Object.keys(M.kampanjer) : (arg[arg.indexOf('--marknad') + 1] ?? '').split(',').filter(Boolean);
  if (!koder.length) throw new Error('Ange --marknad <KOD,KOD> eller --alla');
  const ut = [];
  for (const kod of koder) {
    const r = await enMarknad(kod, steg, skarpt);
    if (r.ok === false && r.skal) log(`⛔ ${kod}: rörs inte — ${r.skal}`);
    ut.push(r);
  }
  if (skarpt) {
    const fil = join(ROT, 'schemalagt.json');
    let forra = {};
    try { forra = JSON.parse(readFileSync(fil, 'utf8')); } catch { /* första gången */ }
    writeFileSync(fil, JSON.stringify({ _om: 'Skrivet av annonser/schemalagg.mjs efter tillbakaläsning ur kontot.', start: start.toISOString(), ...forra, [steg]: { skrivet: new Date().toISOString(), marknader: ut } }, null, 1) + '\n');
  }
  const klara = ut.filter((r) => r.ok && !r.torrt);
  log(`\n${steg}: ${skarpt ? `${klara.length} av ${ut.length} klara` : `${ut.filter((r) => r.ok).length} av ${ut.length} skulle köras`}; ${ut.filter((r) => !r.ok).map((r) => `${r.kod}: ${r.skal ?? r.fel?.join('; ')}`).join(' · ') || 'inga stopp'}`);
  if (ut.some((r) => r.fel?.length)) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
