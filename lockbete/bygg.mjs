// bygg.mjs — lockkampanjerna (Axels beslut 2026-09-26).
// Engagemang i Indien med Bäverbutikens gamla svenska annonsinlägg, för att
// lura kopierare i Ad Library. Återanvänder befintliga inlägg (object_story_id),
// så inga nya creatives och ingen ny copy. Skapar allt PAUSED; --aktivera slår
// på exakt det skriptet självt skapat (id:n ur lockbete/skapat.json).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const KONTO = 'act_1867947880635861'; // MagiBorsten = Bäverbutiken
const V = 'v21.0';
const TOKEN = process.env.META_ACCESS_TOKEN;
const FIL = new URL('./skapat.json', import.meta.url);
const konfig = JSON.parse(readFileSync(new URL('./konfig.json', import.meta.url)));

async function meta(vag, params = {}, metod = 'POST') {
  const body = new URLSearchParams({ access_token: TOKEN });
  for (const [k, v] of Object.entries(params)) body.set(k, typeof v === 'string' ? v : JSON.stringify(v));
  const url = `https://graph.facebook.com/${V}/${vag}`;
  const svar = metod === 'GET' ? await fetch(`${url}?${body}`) : await fetch(url, { method: 'POST', body });
  const j = await svar.json();
  if (j.error) throw new Error(`${vag}: ${j.error.message} ${j.error.error_user_msg ?? ''}`);
  return j;
}

if (process.argv.includes('--aktivera')) {
  const s = JSON.parse(readFileSync(FIL));
  for (const k of s) {
    for (const id of [k.kampanj, k.adset, ...k.annonser.map(a => a.id)]) await meta(id, { status: 'ACTIVE' });
    const las = await meta(k.kampanj, { fields: 'name,effective_status,daily_budget' }, 'GET');
    console.log(las.effective_status, las.daily_budget / 100, 'kr/dag', las.name);
  }
  process.exit(0);
}

if (existsSync(FIL)) throw new Error('skapat.json finns redan — kampanjerna är byggda, bygg inte dubbletter');
const skapat = [];
for (const p of konfig.produkter) {
  const kampanj = await meta(`${KONTO}/campaigns`, {
    name: `LOCK_IN_${p.namn} | Engagemang Indien | ${konfig.datum}`,
    objective: 'OUTCOME_ENGAGEMENT', status: 'PAUSED', special_ad_categories: [],
    daily_budget: String(konfig.dagsbudget_kr * 100), bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
  });
  const adset = await meta(`${KONTO}/adsets`, {
    name: `LOCK_IN_${p.namn} | IN 18-65`, campaign_id: kampanj.id, status: 'PAUSED',
    optimization_goal: 'POST_ENGAGEMENT', billing_event: 'IMPRESSIONS', destination_type: 'ON_POST',
    targeting: { geo_locations: { countries: konfig.lander }, age_min: 18, age_max: 65 },
  });
  const annonser = [];
  for (const inl of p.inlagg) {
    const cr = await meta(`${KONTO}/adcreatives`, { name: `LOCK_IN_${inl.namn}`, object_story_id: inl.post });
    const ad = await meta(`${KONTO}/ads`, { name: `LOCK_IN_${inl.namn}`, adset_id: adset.id, creative: { creative_id: cr.id }, status: 'PAUSED' });
    annonser.push({ namn: inl.namn, id: ad.id, post: inl.post });
  }
  skapat.push({ produkt: p.namn, kampanj: kampanj.id, adset: adset.id, annonser });
  console.log('byggd', p.namn, kampanj.id, annonser.length, 'annonser');
  writeFileSync(FIL, JSON.stringify(skapat, null, 2) + '\n');
}
