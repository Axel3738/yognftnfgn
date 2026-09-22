#!/usr/bin/env node
// kopiera-annonser.mjs — kopierar annonser från EN kampanj till en annan i samma
// konto, med en NY landningssida. Creativen byggs om från grunden: samma video,
// samma copy, samma bild — bara länken byts.
//
//   node tools/kopiera-annonser.mjs --fran <kampanj-id> --till <kampanj-id> \
//        --lank <url> [--torr] [--max N] [--status ACTIVE|PAUSED]
//
// Varför den finns (Axels order 2026-09-22): leveransrundan hade lagt 64
// Taköverdrags-annonser i "Taköverdraget LISTICLE LAGERRENSNING" i stället för i
// produktens vanliga kampanj, eftersom prefixuppslaget väljer kampanjen med flest
// annonser på prefixet (64 mot 34) — se tools/lib/kampanjval.mjs. Annonserna var
// briefade mot PRODUKTSIDAN men pekar på listicle-sidan. De ska finnas i den
// vanliga kampanjen också, med produktsidans länk.
//
// ⚠️ Originalen rörs ALDRIG. De är live, de spenderar och de går plus — och
// CLAUDE.md är tydlig: en annons som redan är live stängs aldrig av i efterhand.
// Det här verktyget skapar nytt, det flyttar ingenting.
//
// Adsets paras på VINKELN i namnet (CS, GT, PD, SP, BOF, CO, LI, RI, TR, UG, OB).
// Saknas vinkelns adset i målkampanjen skapas det som en kopia av källans, med
// samma inriktning — aldrig gissad.
//
// Kräver env: META_ACCESS_TOKEN.

const V = process.env.META_API_VERSION || 'v21.0';
const API = `https://graph.facebook.com/${V}`;
const T = process.env.META_ACCESS_TOKEN;

const arg = process.argv.slice(2);
const flagga = (n, s = null) => {
  const i = arg.indexOf(`--${n}`);
  return i !== -1 && arg[i + 1] && !arg[i + 1].startsWith('--') ? arg[i + 1] : s;
};
const TORR = arg.includes('--torr');
const FRAN = flagga('fran');
const TILL = flagga('till');
const LANK = flagga('lank');
const MAX = Number(flagga('max', '500'));
const STATUS = (flagga('status', 'ACTIVE') || 'ACTIVE').toUpperCase();

const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };
if (!T) dö('META_ACCESS_TOKEN saknas i miljön.');
if (!FRAN || !TILL || !LANK) dö('Kräver --fran <kampanj-id> --till <kampanj-id> --lank <url>.');

/** Vinkeln ur ett annonsnamn: "Takoverdrag_CS_8_H1" -> "CS". Tvåbokstavskoderna
 *  står i docs/naming-convention.md; OB = invändning (PR #106). */
export const vinkelAv = (namn) => (String(namn ?? '').match(/^[^_]+_([A-Z]{2,3})_/) || [])[1] ?? null;

/** Vinkeln ur ett adsetnamn. Två former i kontot, båda avlästa 2026-09-22:
 *  "OB | Notionrunda 2026-09-18" och "Taköverdrag Husvagn 6,5 × 3 m | CS | 2026-09-09". */
export function vinkelUrAdset(namn) {
  const delar = String(namn ?? '').split('|').map((s) => s.trim());
  for (const d of delar) if (/^[A-Z]{2,3}$/.test(d)) return d;
  return null;
}

/** Metas kod 17 är genomströmning, inte ett fel. Backa av och försök igen. */
async function meta(vag, { method = 'GET', body = null, forsok = 0 } = {}) {
  const url = `${API}/${vag}${vag.includes('?') ? '&' : '?'}access_token=${T}`;
  const r = await fetch(url, body
    ? { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : { method });
  const j = await r.json();
  if (j.error) {
    const kod = j.error.code;
    if ((kod === 17 || kod === 4 || kod === 613 || kod === 80004) && forsok < 6) {
      const vanta = Math.min(2 ** forsok * 30, 600);
      console.error(`   ⏳ Meta strypte (kod ${kod}) — väntar ${vanta}s (försök ${forsok + 1}/6)`);
      await new Promise((res) => setTimeout(res, vanta * 1000));
      return meta(vag, { method, body, forsok: forsok + 1 });
    }
    throw new Error(`Meta ${kod}: ${j.error.message}`);
  }
  return j;
}

async function allaSidor(vag) {
  const ut = [];
  let j = await meta(vag);
  ut.push(...(j.data || []));
  while (j.paging?.next) {
    const r = await fetch(j.paging.next);
    j = await r.json();
    if (j.error) break;
    ut.push(...(j.data || []));
  }
  return ut;
}

/** Creativen med NY länk. Videons id, copyn, bilden och opt-out-inställningarna
 *  följer med oförändrade — bara call_to_action-länken byts. Returnerar null när
 *  formen inte känns igen, så den annonsen rapporteras i stället för att gissas. */
export function byggSpec(creative, lank) {
  const s = creative?.object_story_spec;
  if (!s) return null;
  const kopia = JSON.parse(JSON.stringify(s));
  let bytt = false;
  for (const nyckel of ['video_data', 'link_data', 'photo_data']) {
    const d = kopia[nyckel];
    if (!d) continue;
    // ⚠️ Meta LÄSER ut både image_url och image_hash, men SKAPAR bara med ett av
    // dem: "Endast ett av image_url och image_hash bör anges i fältet video_data"
    // (kod 100, subkod 1443051, mätt 2026-09-22 — elva videoannonser föll på det).
    // Hashen är den stabila; url:en är en signerad länk som går ut.
    if (d.image_hash && d.image_url) delete d.image_url;
    if (d.call_to_action?.value) { d.call_to_action.value.link = lank; bytt = true; }
    if (d.link) { d.link = lank; bytt = true; }
    if (Array.isArray(d.child_attachments)) {
      for (const c of d.child_attachments) { c.link = lank; bytt = true; }
    }
  }
  return bytt ? kopia : null;
}

// --- körningen --------------------------------------------------------------

const F = 'name,effective_status,adset{id,name},creative{id,object_story_spec,degrees_of_freedom_spec}';
const kallAnnonser = await allaSidor(`${FRAN}/ads?fields=${F}&limit=100`);
const malAnnonser = await allaSidor(`${TILL}/ads?fields=name&limit=200`);
const malAdsets = await allaSidor(`${TILL}/adsets?fields=name,effective_status&limit=100`);
const kallAdsets = await allaSidor(`${FRAN}/adsets?fields=name&limit=100`);

const finns = new Set(malAnnonser.map((a) => a.name.trim().toLowerCase()));
const adsetPerVinkel = {};
for (const a of malAdsets) { const v = vinkelUrAdset(a.name); if (v) adsetPerVinkel[v] ??= a; }

console.log(`Från: ${kallAnnonser.length} annonser · Till: ${malAnnonser.length} annonser, ${malAdsets.length} adsets`);
console.log(`Ny länk: ${LANK}`);
console.log(`Status på nya annonser: ${STATUS}${TORR ? '  (TORRKÖRNING — inget skapas)' : ''}\n`);

const plan = [];
for (const a of kallAnnonser) {
  const vinkel = vinkelAv(a.name) ?? vinkelUrAdset(a.adset?.name);
  const spec = byggSpec(a.creative, LANK);
  let hinder = null;
  if (finns.has(a.name.trim().toLowerCase())) hinder = 'finns redan i målkampanjen';
  else if (!vinkel) hinder = 'ingen vinkel i namnet';
  else if (!spec) hinder = 'creative-formen känns inte igen (ingen länk att byta)';
  else if (!adsetPerVinkel[vinkel]) hinder = `målkampanjen saknar adset för vinkeln ${vinkel}`;
  plan.push({ a, vinkel, spec, hinder });
}

const gör = plan.filter((p) => !p.hinder).slice(0, MAX);
const hoppa = plan.filter((p) => p.hinder);
for (const p of hoppa) console.log(`  ⤫ ${p.a.name} — ${p.hinder}`);
console.log(`\n${gör.length} att kopiera, ${hoppa.length} hoppas över.`);

const saknadeVinklar = [...new Set(hoppa.filter((p) => /saknar adset/.test(p.hinder)).map((p) => p.vinkel))];
if (saknadeVinklar.length) {
  console.log(`\n⚠️ Vinklar utan adset i målkampanjen: ${saknadeVinklar.join(', ')}`);
  console.log(`   Källans adsets: ${kallAdsets.map((a) => vinkelUrAdset(a.name)).filter(Boolean).join(', ')}`);
  console.log('   Skapa adsetet först (kopiera källans inriktning) och kör om.');
}

if (TORR) {
  for (const p of gör) console.log(`  ✓ ${p.a.name} → adset ${p.vinkel} (${adsetPerVinkel[p.vinkel].id})`);
  console.log('\n--torr: ingenting skapades.');
  process.exit(0);
}

const konto = (await meta(`${TILL}?fields=account_id`)).account_id;
let ok = 0; const fel = [];
for (const [i, p] of gör.entries()) {
  try {
    const cr = await meta(`act_${konto}/adcreatives`, {
      method: 'POST',
      body: {
        name: `${p.a.name} (produktsida)`,
        object_story_spec: p.spec,
        ...(p.a.creative?.degrees_of_freedom_spec ? { degrees_of_freedom_spec: p.a.creative.degrees_of_freedom_spec } : {}),
      },
    });
    const ny = await meta(`act_${konto}/ads`, {
      method: 'POST',
      body: { name: p.a.name, adset_id: adsetPerVinkel[p.vinkel].id, creative: { creative_id: cr.id }, status: STATUS },
    });
    ok++;
    console.log(`  ✅ ${i + 1}/${gör.length} ${p.a.name} → ${ny.id} (adset ${p.vinkel})`);
  } catch (e) {
    fel.push({ namn: p.a.name, fel: e.message });
    console.error(`  ❌ ${p.a.name}: ${e.message}`);
  }
}

console.log(`\nKlart: ${ok} skapade, ${fel.length} fel, ${hoppa.length} hoppade.`);
if (fel.length) { for (const f of fel) console.log(`  ${f.namn}: ${f.fel}`); process.exit(1); }
