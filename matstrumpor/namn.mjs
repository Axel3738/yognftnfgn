// namn.mjs — namnmotorn för Matstrumpors annonser.
//
// Mönstret är kontots eget, avläst 2026-09-21 (inte docs/naming-convention.md —
// Matstrumpor har aldrig följt den):
//
//   MATSTRUMP_sushi_<vinkel>_<format>_<nnn>_v<n>
//   MATSTRUMP_sushi_gift_ugc_012v2_v1        ← äldre rader bär bokstäver i id-fältet
//
// Varför namnet spelar roll: adsetet väljs UR NAMNET. Vinkeln `jul` skickar
// annonsen till jul-adsetet, formatet avgör video eller bild. Ett namn utanför
// mönstret går därför aldrig upp automatiskt — det skulle hamna i fel hink utan
// felmeddelande.
//
// Sedan 2026-10-01 bär namnet också iterationskedjan, så att den går att läsa
// ur KONTOT (Evolves `ITER#N_BATCH#ORIG`, docs/os/evolve/ITERATIONS-PLAYBOOK.md
// avsnitt 9). Alla delar efter löpnumret är valfria, och gamla namn tolkas som förut:
//
//   MATSTRUMP_[<LAND>_]sushi_<vinkel>_<format>_<nnn>[_h<k>][_i<N>p<förälder>|_im]_v<n>
//   MATSTRUMP_sushi_gift_ugc_065_h2_i5pnat_v1   ← hookvariant 2, iteration 5 på Nathalie
//   MATSTRUMP_sushi_gift_ugc_066_im_v1          ← imitation av en annan brands annons
//   MATSTRUMP_NO_sushi_gift_ugc_007_v1          ← utlandet, numrerat per marknad
//
// <förälder> är förälderns löpnummer (`p054`) eller ett alias ur konfig.namn.alias
// för Axels egna uppladdningar utan nummer (`pnat` = '09-17 Nathalie captions musik').
// En annons utan i/im-segment är en IDEA (ny idé ur research) — typen står också i
// BRIEF-raden, men namnet är det enda som syns i Ads Manager.
//
// Ren logik, inga nätanrop.

export const MALL = /^MATSTRUMP_(?:([A-Z]{2,3})_)?sushi_([a-zåäö]+)_([a-zåäö]+)_([0-9a-zåäö]+)(?:_h(\d+))?(?:_(?:i(\d+)p([0-9a-zåäö]+)|(im)))?_v(\d+)$/i;

/** Delar upp ett annonsnamn. Returnerar null om namnet inte följer mönstret. */
export function tolka(namn) {
  const m = MALL.exec(String(namn ?? '').trim());
  if (!m) return null;
  const [, land, vinkel, format, id, hook, iteration, foralder, imitation, version] = m;
  return {
    namn: String(namn).trim(),
    land: land ? land.toUpperCase() : null,
    vinkel: vinkel.toLowerCase(),
    format: format.toLowerCase(),
    id: id.toLowerCase(),
    // Löpnumret är siffrorna id-fältet BÖRJAR med: `038` ⇒ 38, `044h1` ⇒ 44
    // (uppladdarens hookvarianter 2026-09-21), `012v2` ⇒ 12. Ett id som börjar
    // med bokstäver (`haikuh3`, `s001h1`) är ett äldre namn utan nummer.
    // Mätt 2026-09-24: utan det här gav --namn 044 igen fast 044–047 låg live.
    nummer: /^\d/.test(id) ? Number(/^\d+/.exec(id)[0]) : null,
    // Hookvarianten: nya segmentet `_h2`, eller den äldre formen inne i id:t (`044h1`).
    hook: hook ? Number(hook) : (/^\d+h(\d+)$/.exec(id) ? Number(/^\d+h(\d+)$/.exec(id)[1]) : null),
    typ: iteration ? 'ITER' : imitation ? 'IMIT' : null,
    iteration: iteration ? Number(iteration) : null,
    foralder: foralder ? foralder.toLowerCase() : null,
    version: Number(version),
  };
}

/** Bygger ett namn. Kastar hellre än gissar — ett fel namn är ett fel adset.
 *  hook, iteration + foralder (eller imitation) är valfria — se huvudet. */
export function bygg({ vinkel, format, nummer, version = 1, hook = null, iteration = null, foralder = null, imitation = false }, konfig) {
  const n = konfig.namn;
  const v = String(vinkel ?? '').toLowerCase();
  const f = String(format ?? '').toLowerCase();
  if (!n.vinklar.includes(v)) throw new Error(`Okänd vinkel "${vinkel}". Tillåtna: ${n.vinklar.join(', ')} (matstrumpor/konfig.json).`);
  if (!n.format.includes(f)) throw new Error(`Okänt format "${format}". Tillåtna: ${n.format.join(', ')}.`);
  if (!Number.isInteger(nummer) || nummer < 1) throw new Error('nummer måste vara ett heltal ≥ 1 — ta det ur nastaNummer(), räkna aldrig i huvudet.');
  if (iteration !== null && imitation) throw new Error('En annons är antingen en iteration eller en imitation, inte båda.');
  let kedja = '';
  if (hook !== null) {
    if (!Number.isInteger(hook) || hook < 1) throw new Error('hook måste vara ett heltal ≥ 1.');
    kedja += `_h${hook}`;
  }
  if (iteration !== null) {
    if (!Number.isInteger(iteration) || iteration < 1) throw new Error('iteration måste vara ett heltal ≥ 1 — räkna det ur loggen (nastaIteration), aldrig i huvudet.');
    const p = foralderToken(foralder, konfig);
    kedja += `_i${iteration}p${p}`;
  } else if (imitation) {
    kedja += '_im';
  }
  return `${n.prefix}_${v}_${f}_${String(nummer).padStart(3, '0')}${kedja}_v${version}`;
}

/** Förälderns token i namnet: ett löpnummer (54 ⇒ '054') eller ett alias ur
 *  konfig.namn.alias ('nat'). Ett okänt alias kastar — en kedja som pekar på
 *  fel förälder är värre än ingen kedja. */
export function foralderToken(foralder, konfig) {
  if (Number.isInteger(foralder) && foralder > 0) return String(foralder).padStart(3, '0');
  const s = String(foralder ?? '').toLowerCase();
  if (/^\d+$/.test(s)) return s.padStart(3, '0');
  const alias = konfig.namn.alias ?? {};
  if (alias[s]) return s;
  // Ett fullständigt namn: Axels egna uppladdningar slås upp baklänges i aliaslistan.
  const traff = Object.entries(alias).find(([, namn]) => String(namn).toLowerCase() === s);
  if (traff) return traff[0];
  const t = tolka(foralder);
  if (t?.nummer && !t.land) return String(t.nummer).padStart(3, '0');
  throw new Error(`Föräldern "${foralder}" är varken ett löpnummer eller ett alias i konfig.namn.alias (${Object.keys(alias).join(', ') || 'tomt'}).`);
}

/** Förälderns fullständiga namn ur en token ('054' eller 'nat'). Letar bland
 *  kända namn efter löpnumret; null om det inte finns. Ren. */
export function foralderNamn(token, kandaNamn, konfig) {
  if (!token) return null;
  const alias = konfig.namn.alias ?? {};
  if (alias[token]) return alias[token];
  if (!/^\d+$/.test(token)) return null;
  const nr = Number(token);
  const traffar = (kandaNamn ?? []).map(tolka).filter((t) => t && !t.land && t.nummer === nr);
  // Huvudversionen först: utan hookvariant och lägst version.
  traffar.sort((a, b) => (a.hook ?? 0) - (b.hook ?? 0) || a.version - b.version);
  return traffar[0]?.namn ?? null;
}

/** Nästa iterationsnummer på en förälder: högsta `_i<N>p<token>` bland kända
 *  namn ELLER högsta `iteration` bland BRIEF-rader vars `parent` är samma
 *  förälder, plus ett. Båda källorna: Nathalies nio första iterationer
 *  (054–063, 2026-09-30) briefades före namnregeln och bär ingen kedja i namnet.
 *  Ren. */
export function nastaIterationPa(foralder, { kandaNamn = [], briefrader = [] } = {}, konfig) {
  const token = foralderToken(foralder, konfig);
  let hogst = 0;
  for (const n of kandaNamn) {
    const t = tolka(n);
    if (t && !t.land && t.foralder === token && t.iteration > hogst) hogst = t.iteration;
  }
  for (const b of briefrader) {
    if (!b?.parent || b.parent === 'ingen') continue;
    let p = null;
    try { p = foralderToken(b.parent, konfig); } catch { p = null; }
    if (p === token && Number(b.iteration) > hogst) hogst = Number(b.iteration);
  }
  return hogst + 1;
}

/** Nästa lediga löpnummer ur ALLA kända namn (kontot + Notion i samma lista).
 *  Namn utanför mönstret räknas aldrig som upptagna — Axels egna uppladdningar
 *  ('09-17 Nathalie captions musik') ska inte flytta numreringen. Utlandets
 *  namn (`MATSTRUMP_NO_…`) numreras per marknad och räknas inte heller. */
export function nastaNummer(kandaNamn = []) {
  let hogst = 0;
  for (const namn of kandaNamn) {
    const t = tolka(namn);
    if (t?.land) continue;
    if (t?.nummer && t.nummer > hogst) hogst = t.nummer;
  }
  return hogst + 1;
}

/** Ger N lediga nummer i rad. */
export function nastaNummer_flera(kandaNamn, antal) {
  const start = nastaNummer(kandaNamn);
  return Array.from({ length: antal }, (_, i) => start + i);
}

/** Alla kända namn ur ALLA källor i EN lista — loggen (UPPLADDAD), ögonblicks-
 *  bilden på disk, kontots annonser ur senaste avläsningen och hubbens titlar.
 *  Dubbletter bort, ordningen stabil. Skälet: 2026-09-24 gav --namn 048 fast
 *  048–053 nyss skapats i hubben (filen var uppdaterad FÖRE raderna skapades),
 *  och 2026-09-25 gav den 048 IGEN åt uppladdaren — fem dubbla namn i hubben
 *  och nio annonser live med rond 2:s nummer. En källa i taget räcker inte;
 *  numret räknas ur unionen. */
export function samlaKandaNamn({ logg = [], fil = [], konto = [], hubb = [] } = {}) {
  const sedda = new Set();
  const ut = [];
  for (const namn of [...logg, ...fil, ...konto, ...hubb]) {
    const n = String(namn ?? '').trim();
    if (!n) continue;
    const nyckel = n.toLowerCase();
    if (sedda.has(nyckel)) continue;
    sedda.add(nyckel);
    ut.push(n);
  }
  return ut;
}

/** video | bild | okand — ur formatet i namnet, aldrig ur filändelsen.
 *  (Filändelsen ljuger: en .mp4 kan vara en animerad bildannons, och en rad utan
 *  fil har ingen ändelse alls.) */
export function mediatyp(namnEllerDelar, konfig) {
  const t = typeof namnEllerDelar === 'string' ? tolka(namnEllerDelar) : namnEllerDelar;
  if (!t) return 'okand';
  if (konfig.namn.video_format.includes(t.format)) return 'video';
  if (konfig.namn.bild_format.includes(t.format)) return 'bild';
  return 'okand';
}

/** Adset-nyckeln ur namnet: jul_video | jul_bild | video | bild.
 *  Null när namnet inte går att tolka eller formatet är okänt — då laddas raden
 *  ALDRIG upp automatiskt, den rapporteras. */
export function adsetNyckel(namn, konfig) {
  const t = tolka(namn);
  if (!t) return null;
  // Utlandets annonser laddas upp av marknader/annonser/bygg.mjs, aldrig av den
  // svenska uppladdaren — ett NO-namn får inte hamna i ett svenskt adset.
  if (t.land) return null;
  const typ = mediatyp(t, konfig);
  if (typ === 'okand') return null;
  return t.vinkel === 'jul' ? (typ === 'video' ? 'jul_video' : 'jul_bild') : typ;
}

/** Granskar ett föreslaget namn mot mönstret och mot upptagna namn. */
export function granska(namn, kandaNamn, konfig) {
  const fel = [];
  const t = tolka(namn);
  if (!t) {
    fel.push(`"${namn}" följer inte mönstret ${konfig.namn.mall}.`);
    return { ok: false, fel, tolkat: null };
  }
  if (!konfig.namn.vinklar.includes(t.vinkel)) fel.push(`Vinkeln "${t.vinkel}" finns inte i konfigen — lägg till den där först om den är ny på riktigt.`);
  if (!konfig.namn.format.includes(t.format)) fel.push(`Formatet "${t.format}" finns inte i konfigen.`);
  if (mediatyp(t, konfig) === 'okand') fel.push(`Formatet "${t.format}" är varken video eller bild i konfigen — adsetet går inte att välja.`);
  if (kandaNamn.some((k) => String(k).toLowerCase() === t.namn.toLowerCase())) fel.push(`Namnet är redan upptaget i kontot eller hubben.`);
  return { ok: fel.length === 0, fel, tolkat: t };
}
