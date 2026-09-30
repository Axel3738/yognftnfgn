// fyll-urval.mjs — fyller varje produkt i urval.json till TIO annonser som går att ladda upp.
//
//   node worldwide/annonser/fyll-urval.mjs <insikter.json>            # torrt: vilka som skulle läggas till
//   node worldwide/annonser/fyll-urval.mjs <insikter.json> --skarpt   # hämtar creative och skriver urval.json
//
// Axels order 2026-09-30 kväll: "det ska ju vara top 10 annonser per produkt". Första urvalet tog
// bara annonser med ≥ 300 kr, ≥ 3 köp och positivt vinstbidrag (fyllt till fem), och efter de
// hoppade (kronor i bild, Specialised Covers klipp, butiksnamn) låg i snitt fyra per produkt uppe.
//
// Insikterna är MagiBorstens annonsnivå, hela livstiden (samma fil som första urvalet byggdes ur:
// level ad, date_preset maximum, fälten ad_id/ad_name/spend/actions/action_values).
// Ordningen: vinstbidrag = spend × (ROAS ÷ break-even − 1), störst först, bland annonser med minst
// ett köp. En annons utan köp tas aldrig (den har bevisat att den inte säljer). En annons vars film
// eller bild redan finns i produkten tas inte (samma creative under nytt namn). Takskyddets filmer
// med Specialised Covers klipp (konkurrenter/arenden/KD-2026-001/specialised-covers.json) tas aldrig.
// Befintliga annonser rörs inte; de nya märks "fyllnad10": true.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROT, '..', '..');
const URVAL = join(ROT, '..', 'urval.json');
const lasJson = (f, def) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : def);
export const MAL = 10;

const kop = (r) => Number((r.actions ?? []).find((x) => x.action_type === 'omni_purchase')?.value ?? 0);
const varde = (r) => Number((r.action_values ?? []).find((x) => x.action_type === 'omni_purchase')?.value ?? 0);

/** Annonser per namn ur insiktsraderna (samma namn kan ha flera annons-id). */
export function perNamn(rader, prefix) {
  const per = new Map();
  for (const r of rader) {
    if (!prefix.includes(String(r.ad_name).split(/[_ ]/)[0])) continue;
    const o = per.get(r.ad_name) ?? { namn: r.ad_name, spend: 0, kop: 0, varde: 0, ids: [] };
    const s = Number(r.spend);
    o.spend += s; o.kop += kop(r); o.varde += varde(r); o.ids.push({ id: r.ad_id, s });
    per.set(r.ad_name, o);
  }
  return [...per.values()];
}

/** Kandidaterna i ordning: minst ett köp, störst vinstbidrag först. */
export function kandidater(per, be, uteslut) {
  return per.filter((o) => !uteslut.has(o.namn) && o.kop >= 1 && o.spend > 0).map((o) => {
    const roas = o.varde / o.spend;
    return { namn: o.namn, spend: Math.round(o.spend), kop: o.kop, roas: +roas.toFixed(2), cpa: Math.round(o.spend / o.kop), vinstbidrag: Math.round(o.spend * (roas / be - 1)), ad_id: o.ids.sort((a, b) => b.s - a.s)[0].id, fyllnad10: true };
  }).sort((a, b) => b.vinstbidrag - a.vinstbidrag);
}

/** Andra steget (Axels order 2026-09-30 kväll: "ta topp fem spenders, förutom vinnarna"): produkter
 * som inte når tio med köp fylls med de annonser som spenderat mest, även utan köp (minst 100 kr;
 * --min-spend 1 i tredje rundan samma kväll, när golfkalendern och värmesulorna stod på 1 och 3). */
export function spenders(per, be, uteslut, minSpend = 100) {
  return per.filter((o) => !uteslut.has(o.namn) && o.spend >= minSpend).map((o) => {
    const roas = o.spend ? o.varde / o.spend : 0;
    return { namn: o.namn, spend: Math.round(o.spend), kop: o.kop, roas: +roas.toFixed(2), cpa: o.kop ? Math.round(o.spend / o.kop) : null, vinstbidrag: Math.round(o.spend * (roas / be - 1)), ad_id: o.ids.sort((a, b) => b.s - a.s)[0].id, fyllnad10: true, spender: true };
  }).sort((a, b) => b.spend - a.spend);
}

/** Annonser i produkten som faktiskt kan laddas upp (inte hoppade i copy eller media). */
export function anvandbara(p, copy, media) {
  return p.annonser.filter((a) => !copy[a.namn]?.hoppa && !media[a.namn]?.hoppa);
}

async function creative(api, a) {
  const ad = await api(a.ad_id, { params: { fields: 'id,effective_status,creative{id,object_type,video_id,image_url,image_hash,body,title,object_story_spec,asset_feed_spec,call_to_action_type,link_url}' } });
  const c = ad.creative ?? {};
  const oss = c.object_story_spec ?? {};
  const vd = oss.video_data, ld = oss.link_data, afs = c.asset_feed_spec;
  return {
    ...a,
    status: ad.effective_status,
    typ: vd || c.video_id || afs?.videos?.length ? 'video' : 'bild',
    video_id: vd?.video_id || c.video_id || afs?.videos?.[0]?.video_id || null,
    image_hash: ld?.image_hash || vd?.image_hash || c.image_hash || afs?.images?.[0]?.hash || null,
    image_url: c.image_url || vd?.image_url || null,
    text: vd?.message || ld?.message || c.body || afs?.bodies?.[0]?.text || null,
    rubrik: vd?.title || ld?.name || c.title || afs?.titles?.[0]?.text || null,
    beskrivning: ld?.description || vd?.link_description || afs?.descriptions?.[0]?.text || null,
    lank: vd?.call_to_action?.value?.link || ld?.link || c.link_url || afs?.link_urls?.[0]?.website_url || null,
    cta: vd?.call_to_action?.type || ld?.call_to_action?.type || c.call_to_action_type || afs?.call_to_action_types?.[0] || null,
    karusell: (ld?.child_attachments?.length ?? 0) > 1,
  };
}

async function huvud() {
  const a = process.argv.slice(2);
  const skarpt = a.includes('--skarpt');
  const insikter = a.find((x) => !x.startsWith('--'));
  if (!insikter) { console.error('Ange insiktsfilen (annonsnivå, hela livstiden).'); process.exit(2); }
  const rader = JSON.parse(readFileSync(insikter, 'utf8'));
  const U = JSON.parse(readFileSync(URVAL, 'utf8'));
  const copy = lasJson(join(ROT, 'copy-en.json'), {});
  const media = lasJson(join(ROT, 'media.json'), {});
  const sc = lasJson(join(REPO, 'konkurrenter/arenden/KD-2026-001/specialised-covers.json'), { filmer: [] });
  const scFilmer = new Set(sc.filmer.map((f) => f.namn));
  const { api, säkerställProxy } = skarpt ? await import('../../tools/meta-lib.mjs') : {};
  if (skarpt) säkerställProxy();
  for (const p of U.produkter) {
    if (p.under) continue;
    const har = anvandbara(p, copy, media).length;
    const behov = MAL - har;
    if (behov <= 0) { console.log(`${p.id}: ${har} användbara — klar`); continue; }
    const uteslut = new Set([...p.annonser.map((x) => x.namn), ...scFilmer]);
    const per = perNamn(rader, p.prefix);
    const kopkand = kandidater(per, p.be, uteslut);
    const kand = a.includes('--spenders') ? [...kopkand, ...spenders(per, p.be, new Set([...uteslut, ...kopkand.map((k) => k.namn)]), a.includes('--min-spend') ? Number(a[a.indexOf('--min-spend') + 1]) : 100)] : kopkand;
    // Två extra i marginal: en del faller i copy- eller textkollen (kronor i bild m.m.).
    const onskat = behov + 2;
    if (!skarpt) {
      console.log(`${p.id}: ${har} användbara, behöver ${behov}, ${kand.length} kandidater → ${kand.slice(0, onskat).map((k) => `${k.namn} (${k.vinstbidrag} kr, ${k.kop} köp)`).join(', ') || 'INGA'}`);
      continue;
    }
    const sedda = new Set(p.annonser.flatMap((x) => [x.video_id, x.image_hash]).filter(Boolean));
    const nya = [];
    for (const k of kand) {
      if (nya.length >= onskat) break;
      let c;
      try { c = await creative(api, k); } catch (e) { console.log(`  ⚠️ ${k.namn}: ${e.message.slice(0, 120)}`); continue; }
      const nyckel = c.video_id || c.image_hash;
      if (!nyckel) { console.log(`  · ${k.namn}: ingen film eller bild (dynamisk/katalog) — hoppas`); continue; }
      if (c.karusell) { console.log(`  · ${k.namn}: karusell — hoppas`); continue; }
      if (sedda.has(nyckel)) { console.log(`  · ${k.namn}: samma creative som en annan annons — hoppas`); continue; }
      if (c.lank && !/baverbutiken\.se/.test(c.lank)) { console.log(`  · ${k.namn}: länkar till ${c.lank.slice(0, 60)} — hoppas`); continue; }
      sedda.add(nyckel);
      nya.push(c);
      console.log(`  + ${p.id}: ${c.namn} ${c.typ} (${c.spender ? `spender ${c.spend} kr, ` : ''}${c.vinstbidrag} kr, ${c.kop} köp)`);
    }
    p.annonser.push(...nya);
    console.log(`${p.id}: ${har} → ${har + nya.length} (mål ${MAL}${har + nya.length < MAL ? `, bara ${kand.length} annonser med köp finns` : ''})`);
  }
  if (skarpt) {
    U.fyllnad10 = 'Fyllt till tio användbara per produkt 2026-09-30 kväll (Axels order), fyll-urval.mjs: minst ett köp, vinstbidrag störst först, unik creative, aldrig Specialised Covers klipp.';
    writeFileSync(URVAL, JSON.stringify(U, null, 1));
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
