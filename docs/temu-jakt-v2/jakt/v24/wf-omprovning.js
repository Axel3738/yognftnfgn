export const meta = {
  name: 'q4-omprovning-batchad',
  description: 'Ompröva koncept i batcher (4 CPU → 2 agenter åt gången per workflow): bedömning → skeptiker; eller discovery → bedömning → skeptiker',
  phases: [
    { title: 'Discover', detail: 'sökbottar, två vinklar per agent' },
    { title: 'Assess', detail: 'en agent per batch om 4–5 koncept' },
    { title: 'Verify', detail: 'en skeptiker per batch, båda linserna' },
  ],
}

const REPO = '/home/user/yognftnfgn'
const V24 = `${REPO}/docs/temu-jakt-v2/jakt/v24`

const VERKTYG = `
SÖKKANALER (mätt 2026-09-08 i den här miljön — följ dem, gissa aldrig):
- WebSearch fungerar men budgeten är delad med många agenter: MAX 2 anrop per koncept.
- WebFetch på https://se.search.yahoo.com/search?p=<svenska+ord> fungerar för svensk hylla (ger domäner, ibland pris).
- WebFetch på https://search.yahoo.com/search?p=site%3Atemu.com+<english+words> ger Temu-goods-id (siffrorna efter g-) + titlar.
- Bash: curl -sS -m 30 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" "https://search.seznam.cz/?q=site%3Atemu.com+<ord+med+plus>" -o s.html; grep -oE 'g-60[0-9]{13}' s.html | sort -u  — ger goods-id, och utdragen bär ofta pris ($) / betyg / recensionsantal (grep -o '\\$[0-9.]*[^<]\\{0,80\\}' s.html). Skriv av exakt, märk "seznam-snippet".
- Butikssidor direkt via WebFetch: bauhaus.se, amazon.se, fyndiq.se, cdon.se, granngarden.se, hylte-lantman.com, spabadsbutiken.se, jaktia.se, widforss.se, hjertmans.se, campingvaruhuset.se, prisjakt.nu m.fl. jula.se, biltema.se, rusta.com, clasohlson.com och pricerunner.se svarar oftast 403/tomt — skriv då "ej läsbar", hitta aldrig på ett pris.
- DuckDuckGo = captcha. Bing = fel resultat. Google = blockerat. facebook.com = blockerat (Meta Ad Library går INTE att nå från den här miljön).
- FÖRBJUDET: att hämta temu.com-produktsidor på något sätt (temu-ld.py, verifiera-live.py, curl, WebFetch på /g-<id>.html, /se/g-<id>.html eller search_result.html). Huvudsessionen har hämtbudgeten (~8 anrop per timme). Du levererar goods-id; live-verifieringen görs centralt.
- Tidsbudget: högst ~20 verktygsanrop per koncept. Prioritera det som avgör: annonsör-proxyn, golv/ankare, listningar.
Arbeta i Bash från ${V24} — skriv inga filer i repot (returnera allt som strukturerad output).`

const REGLER = `
LÄS FÖRST (Read-verktyget): ${REPO}/docs/temu-jakt-v2/REGEL.md (gate-ordningen — recensioner först, annonsörer, hyllan = varning),
${REPO}/docs/temu-vinnar-dna.md avsnitt 6 (negativ rymd) och 12 (fingeravtrycket; rad 148–335), och ${REPO}/docs/temu-jakt-v2/jakt/v23/KATALOG.md (173 produkter butiken redan har — föreslå aldrig något som redan finns där eller är en nära variant).
Ekonomi: SE-Temu-pris ≈ USD × 6,96–8,16; landad ≈ SE-pris × 1,5; svenskt pris ≥ 2,4 × landad och ≥ 300 kr; > 500 kr har aldrig förlorat; landad > 420 kr = över 1 000 kr-taket = kill. Bäverbutiken säljer UTAN moms. Räkna båda ändarna.
Annonsör-proxyn när Ad Library inte nås: räkna svenska DTC-butiker (egen .se-domän, Shopify/one-product-store, INTE kedja, INTE Fyndiq/CDON/Amazon) som säljer samma form. ≥ 3 = kill, 2 = varning, 0–1 = grönt. Skriv vilka du hittade med URL.
Publik: riktigt tal för ägarklassen med källa (SCB, Trafikanalys, Jordbruksverket, Naturvårdsverket, branschorgan). Fingeravtryckets golv är ~100 000 hushåll för problemlösare.
Kranskyddsfällan: en produkt vars skada inträffar nov–feb men säljs i september faller (butiken testade Kranskydd Frost: ROAS 1,59, pausad). Presenter har annan klocka (köps nov–dec).
Konfidens per bärande påstående. UNKNOWN hellre än gissning. Ingen siffra ur huvudet.`

const ASSESS_ITEM = {
  type: 'object',
  properties: {
    concept_id: { type: 'string' },
    product_name_sv: { type: 'string' },
    strong_hypothesis: { type: 'boolean', description: 'true bara om G1–G4 och G6–G7 i REGEL.md passerar (G4 får stå på varning) och hypotesen kan skrivas utan gissning' },
    hypothesis_score: { type: 'number', description: '0–100' },
    winner_hypothesis: { type: 'string', description: 'Svenska. Ägaren + objektet + problemet som finns nu + varför DNA:t säger att den vinner. 2–4 meningar.' },
    why_it_could_print: { type: 'string', description: 'Svenska. 2–4 punkter (ankare, hyllfrånvaro, material, flerköp, prisutrymme) — bara sådant som är mätt, med siffra.' },
    main_risk: { type: 'string', description: 'Svenska. Den ena risken som fäller den. 1–2 meningar.' },
    hook_sv: { type: 'string', description: 'Ägarfrågan på ≤ 7 ord' },
    q4_label: { type: 'string', description: 'Q4 NOW | OCTOBER | BLACK WEEK / GIFT | EVERGREEN' },
    se_price_sek: { type: 'number' },
    landed_low_sek: { type: ['number', 'null'] },
    landed_high_sek: { type: ['number', 'null'] },
    multiple_low: { type: ['number', 'null'] },
    multiple_high: { type: ['number', 'null'] },
    reviews_gate: { type: 'object', properties: { count: { type: ['number', 'null'] }, source: { type: 'string' }, verdict: { type: 'string', description: 'GREEN | OK | WARN | KILL | UNKNOWN' } }, required: ['count', 'source', 'verdict'] },
    advertiser_gate: { type: 'object', properties: { count: { type: ['number', 'null'] }, method: { type: 'string', description: 'adlibrary-prior (datum) | dtc-proxy | unknown' }, evidence: { type: 'array', items: { type: 'string' } }, verdict: { type: 'string', description: 'GREEN | WARN | KILL | UNKNOWN' } }, required: ['count', 'method', 'evidence', 'verdict'] },
    shelf_gate: { type: 'object', properties: { floor_name: { type: 'string' }, floor_price_sek: { type: ['number', 'null'] }, floor_url: { type: 'string' }, anchor_name: { type: 'string' }, anchor_price_sek: { type: ['number', 'null'] }, anchor_url: { type: 'string' }, anchor_in_stock: { type: ['boolean', 'null'] }, verdict: { type: 'string', description: 'PASS | WARN | KILL | UNKNOWN' } }, required: ['floor_name', 'floor_price_sek', 'anchor_name', 'anchor_price_sek', 'verdict'] },
    structural_gate: { type: 'object', properties: { verdict: { type: 'string', description: 'PASS | FAIL' }, reason: { type: 'string' } }, required: ['verdict', 'reason'] },
    audience: { type: 'object', properties: { size: { type: ['number', 'null'] }, source: { type: 'string' }, verdict: { type: 'string' } }, required: ['size', 'source', 'verdict'] },
    variants: { type: 'string' },
    listing_candidates: { type: 'array', description: 'I prioritetsordning för live-verifiering. Max 5.', items: { type: 'object', properties: { goods_id: { type: 'string' }, url_se: { type: 'string' }, title: { type: 'string' }, price_usd: { type: ['number', 'null'] }, reviews: { type: ['number', 'null'] }, source: { type: 'string' }, why_this_one: { type: 'string' } }, required: ['goods_id', 'url_se', 'title', 'source', 'why_this_one'] } },
    priority_for_live_check: { type: 'number', description: '1 = verifiera först … 5 = sist' },
    confidence: { type: 'string', description: 'HIGH | MEDIUM | LOW' },
    notes: { type: 'string' },
  },
  required: ['concept_id', 'product_name_sv', 'strong_hypothesis', 'hypothesis_score', 'winner_hypothesis', 'why_it_could_print', 'main_risk', 'hook_sv', 'q4_label', 'se_price_sek', 'reviews_gate', 'advertiser_gate', 'shelf_gate', 'structural_gate', 'audience', 'listing_candidates', 'priority_for_live_check', 'confidence'],
}
const ASSESS_SCHEMA = { type: 'object', properties: { assessments: { type: 'array', items: ASSESS_ITEM }, searches_used: { type: 'array', items: { type: 'string' } } }, required: ['assessments', 'searches_used'] }

const DISCOVER_SCHEMA = {
  type: 'object',
  properties: {
    candidates: { type: 'array', items: { type: 'object', properties: {
      angle_id: { type: 'string' }, concept_sv: { type: 'string' }, product_en: { type: 'string' }, object: { type: 'string' }, owner: { type: 'string' },
      goods_ids: { type: 'array', items: { type: 'string' } },
      snippet_price_usd: { type: ['number', 'null'] }, snippet_reviews: { type: ['number', 'null'] },
      q4_label: { type: 'string' }, why_dna: { type: 'string' }, quick_shelf: { type: 'string' }, swedish_sellers_seen: { type: ['number', 'null'] },
      rank: { type: 'number' }, sources: { type: 'array', items: { type: 'string' } },
    }, required: ['angle_id', 'concept_sv', 'product_en', 'object', 'owner', 'goods_ids', 'q4_label', 'why_dna', 'quick_shelf', 'rank', 'sources'] } },
    searches_used: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['candidates', 'searches_used'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdicts: { type: 'array', items: { type: 'object', properties: {
      concept_id: { type: 'string' },
      hylla_refuted: { type: 'boolean', description: 'Lins 1 (hylla/annonsörer/ekonomi/katalog): true = fälld. Osäker = true.' },
      hylla_reasons: { type: 'array', items: { type: 'string' } },
      dna_refuted: { type: 'boolean', description: 'Lins 2 (DNA/säsong/publik/material): true = fälld. Osäker = true.' },
      dna_reasons: { type: 'array', items: { type: 'string' } },
      corrections: { type: 'string', description: 'Fält som är fel men inte fällande, med rätt värde och källa' },
      confidence: { type: 'string' },
    }, required: ['concept_id', 'hylla_refuted', 'hylla_reasons', 'dna_refuted', 'dna_reasons', 'corrections', 'confidence'] } },
  },
  required: ['verdicts'],
}

function assessPrompt(entries) {
  return `Du omprövar ${entries.length} produktkoncept för Bäverbutikens Q4-testportfölj under de NYA gaterna. Ett i taget, komplett, innan nästa.
${REGLER}
${VERKTYG}

KONCEPTEN: ${JSON.stringify(entries)}
Källfilerna i "kallor" ligger under ${REPO}/docs/temu-jakt-v2/jakt/ — läs dem (grep på goods-id räcker ofta) så du inte gör om arbete som redan är gjort. ${V24}/UNIVERSUM.csv har alla tidigare rader (grep på goods-id eller namn). ${V24}/KONCEPT.json har hela posten per id.

GÖR PER KONCEPT, I ORDNING:
1. G1 recensioner: använd kända tal (fältet "tidigare", UNIVERSUM.csv, källfilerna, Seznam-utdrag). US-sajtens tal gäller; SE-sajten räknar ~5× högre (kattkojan 72 US / 410 SE) — märk vilken. UNKNOWN om inget finns.
2. G2 annonsörer: Ad Library-tal som redan står i källfilerna (med datum) eller DTC-proxyn via Yahoo SE: sök ägarens svenska ord + "köp"/"fri frakt"/"butik". Lista butikerna.
3. G3 objekt/presens: äger ägaren objektet, står det ute/används kroppsligt, syns problemet i september–november?
4. G4 hyllan: billigaste svenska pris i SAMMA FORM (golv) och märkesankare ≥ 1,6 × tänkt pris i lager. Tidigare fynd står i "tidigare" — bekräfta eller uppdatera med URL där det går.
5. G6 ekonomi på kända priser (båda ändarna). G7 publik med källa.
6. Listningar: primär + alternativ (fältet goods_ids först; sök fler om primären har fel material, fel pris eller > 800 recensioner). Om goods_ids är tomt: hitta 3–5 listningar. Aldrig temu.com direkt.
7. Skriv hypotesen på svenska i tre delar, hooken ≤ 7 ord, sätt strong_hypothesis och priority_for_live_check.

Var hård: "strong_hypothesis" betyder att du skulle sätta 1 000 kr/dag på den i morgon. Ingen siffra utan källa. Returnera en bedömning per koncept i samma ordning.`
}

function discoverPrompt(angles) {
  return `Du är en sökbot i Bäverbutikens produktjakt med ${angles.length} vinklar. Ta dem i tur och ordning:
${angles.map((a, i) => `VINKEL ${i + 1} (angle_id "${a.id}"): ${a.beskrivning}`).join('\n')}
${REGLER}
${VERKTYG}
Redan kända goods-id (föreslå INTE dem): grep i ${REPO}/docs/temu-jakt-v2/jakt/v22/kanda-goods-id.txt och ${V24}/UNIVERSUM.csv innan du levererar (Bash: grep -c <id> …). Kända koncept står i ${V24}/KONCEPT.json — hoppa över dem.
Leverera 6–10 NYA kandidater PER VINKEL med goods-id (från Yahoo site:temu.com eller Seznam), rangordnade inom vinkeln (rank 1 = bäst). Varje kandidat: objektet ägaren redan har, varför problemet finns NU (sep–nov) eller varför den är en present, snabb svensk hyllkoll (1 sökning: finns formen hos kedja/marketplace? hur många svenska butiker?), och vad fingeravtrycket säger. Hitta aldrig på pris eller recensionsantal — skriv null om utdraget inte visar det. Max 3 WebSearch totalt, resten Yahoo/Seznam/butikssidor. Högst ~25 verktygsanrop per vinkel.`
}

function skepticPrompt(list) {
  return `Du är skeptiker på ${list.length} produkthypoteser. Din uppgift är att FÄLLA var och en om det går. Osäker = refuted:true. Två linser per hypotes:
LINS 1 — HYLLA, ANNONSÖRER, EKONOMI, KATALOG: finns formen billigare i Sverige än bedömningen säger (kedja, Fyndiq, Amazon.se, CDON, vidaXL, fackhandel)? Är ankaret verkligen ≥ 1,6× och i lager? Säljer ≥ 3 svenska DTC-butiker samma form (annonsör-proxyn)? Spräcker landad kostnad 2,4× eller 1 000 kr-taket? Finns produkten redan i ${REPO}/docs/temu-jakt-v2/jakt/v23/KATALOG.md eller bland kontots förlorare i ${REPO}/docs/temu-vinnar-dna/data/ground-truth.md? Gör egna sökningar (Yahoo SE, butikssidor) — lita inte på bedömningens länkar utan att se dem.
LINS 2 — DNA, SÄSONG, PUBLIK, MATERIAL: pröva mot ${REPO}/docs/temu-vinnar-dna.md avsnitt 6 och 12 (rad 148–335): äger ägaren objektet, står det ute? Syns problemet i launchmånaden eller är det kranskyddsfällan (skadan i nov–feb)? Är publiken verkligen ≥ 100 000 ägare — kolla källan? Personlig passform, kit, N-i-1, förbrukning, inomhus, montering/inlärning, latent behov? Pris < 300 eller > 1 000? Variant ägaren inte kan utantill (tum, "passar de flesta")? Går hooken att skriva som ägarfråga ≤ 7 ord? Är "why it could print" mätt eller påstått?
${VERKTYG}
BEDÖMNINGARNA DU SKA PRÖVA: ${JSON.stringify(list)}
Svara per concept_id med hylla_refuted / dna_refuted, skäl med källor, och corrections för fält som är fel men inte fällande. Högst ~15 verktygsanrop per hypotes.`
}

function status(a, v) {
  if (!a) return 'MISSING'
  if (!a.strong_hypothesis) return 'WEAK'
  if (!v) return 'UNVERIFIED'
  const n = (v.hylla_refuted ? 1 : 0) + (v.dna_refuted ? 1 : 0)
  return n === 0 ? 'STRONG' : n === 1 ? 'MEDIUM' : 'REFUTED'
}

async function assessAndVerify(entries, label) {
  const r = await agent(assessPrompt(entries), { label: `assess:${label}`, phase: 'Assess', schema: ASSESS_SCHEMA })
  const as = (r && r.assessments) || []
  const strong = as.filter(a => a.strong_hypothesis)
  let verdicts = []
  if (strong.length) {
    const v = await agent(skepticPrompt(strong), { label: `skeptic:${label}`, phase: 'Verify', schema: VERDICT_SCHEMA })
    verdicts = (v && v.verdicts) || []
  }
  return as.map(a => {
    const v = verdicts.find(x => x.concept_id === a.concept_id) || null
    return { assessment: a, verdict: v, status: status(a, v) }
  })
}

function chunk(arr, n) { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out }

const results = []
if (args.ids && args.ids.length) {
  phase('Assess')
  const batches = chunk(args.ids, args.batch || 5)
  const got = await pipeline(batches, (ids, _b, i) => assessAndVerify(ids.map(id => ({ id, fil: `${V24}/KONCEPT.json` })), `k${i + 1}:${ids[0]}`))
  for (const g of got) if (g) results.push(...g)
}
let discovered = []
let freshUnassessed = []
if (args.angles && args.angles.length) {
  phase('Discover')
  const pairs = chunk(args.angles, 2)
  const found = await parallel(pairs.map((p, i) => () => agent(discoverPrompt(p), { label: `discover:${p.map(a => a.id).join('+')}`, phase: 'Discover', schema: DISCOVER_SCHEMA })))
  const seen = new Set()
  for (const d of found.filter(Boolean)) {
    for (const c of (d.candidates || [])) {
      const gids = (c.goods_ids || []).filter(g => /^\d{10,18}$/.test(g) && !seen.has(g))
      if (!gids.length) continue
      gids.forEach(g => seen.add(g))
      discovered.push({ ...c, goods_ids: gids })
    }
  }
  discovered.sort((x, y) => (x.rank || 99) - (y.rank || 99))
  const MAX = args.max_fresh || 25
  log(`discovery: ${discovered.length} nya kandidater, bedömer topp ${Math.min(MAX, discovered.length)}`)
  if (discovered.length > MAX) log(`OBS: ${discovered.length - MAX} discovery-kandidater bedöms inte i den här körningen`)
  freshUnassessed = discovered.slice(MAX)
  const entries = discovered.slice(0, MAX).map((c, i) => ({
    id: `ny-${i + 1}-${(c.concept_sv || '').toLowerCase().replace(/[^a-zåäö0-9]+/g, '-').slice(0, 30)}`,
    namn_sv: c.concept_sv, sok_en: c.product_en, goods_ids: c.goods_ids,
    tidigare: `NY kandidat från discovery-bot "${c.angle_id}": objekt ${c.object}; ägare ${c.owner}; ${c.q4_label}; ${c.why_dna}; snabb hylla: ${c.quick_shelf}; pris ${c.snippet_price_usd} USD, rec ${c.snippet_reviews} (utdrag); svenska säljare sedda: ${c.swedish_sellers_seen}`,
    kallor: [],
  }))
  const got = await pipeline(chunk(entries, args.batch || 5), (es, _b, i) => assessAndVerify(es, `ny${i + 1}`))
  for (const g of got) if (g) results.push(...g)
}
const summary = {}
for (const r of results) summary[r.status] = (summary[r.status] || 0) + 1
log(`klart: ${JSON.stringify(summary)}`)
return { summary, results, discovered, fresh_unassessed: freshUnassessed }
