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
// Ren logik, inga nätanrop.

export const MALL = /^MATSTRUMP_sushi_([a-zåäö]+)_([a-zåäö]+)_([0-9a-zåäö]+)_v(\d+)$/i;

/** Delar upp ett annonsnamn. Returnerar null om namnet inte följer mönstret. */
export function tolka(namn) {
  const m = MALL.exec(String(namn ?? '').trim());
  if (!m) return null;
  const [, vinkel, format, id, version] = m;
  return {
    namn: String(namn).trim(),
    vinkel: vinkel.toLowerCase(),
    format: format.toLowerCase(),
    id: id.toLowerCase(),
    // Löpnumret är siffrorna id-fältet BÖRJAR med: `038` ⇒ 38, `044h1` ⇒ 44
    // (uppladdarens hookvarianter 2026-09-21), `012v2` ⇒ 12. Ett id som börjar
    // med bokstäver (`haikuh3`, `s001h1`) är ett äldre namn utan nummer.
    // Mätt 2026-09-24: utan det här gav --namn 044 igen fast 044–047 låg live.
    nummer: /^\d/.test(id) ? Number(/^\d+/.exec(id)[0]) : null,
    version: Number(version),
  };
}

/** Bygger ett namn. Kastar hellre än gissar — ett fel namn är ett fel adset. */
export function bygg({ vinkel, format, nummer, version = 1 }, konfig) {
  const n = konfig.namn;
  const v = String(vinkel ?? '').toLowerCase();
  const f = String(format ?? '').toLowerCase();
  if (!n.vinklar.includes(v)) throw new Error(`Okänd vinkel "${vinkel}". Tillåtna: ${n.vinklar.join(', ')} (matstrumpor/konfig.json).`);
  if (!n.format.includes(f)) throw new Error(`Okänt format "${format}". Tillåtna: ${n.format.join(', ')}.`);
  if (!Number.isInteger(nummer) || nummer < 1) throw new Error('nummer måste vara ett heltal ≥ 1 — ta det ur nastaNummer(), räkna aldrig i huvudet.');
  return `${n.prefix}_${v}_${f}_${String(nummer).padStart(3, '0')}_v${version}`;
}

/** Nästa lediga löpnummer ur ALLA kända namn (kontot + Notion i samma lista).
 *  Namn utanför mönstret räknas aldrig som upptagna — Axels egna uppladdningar
 *  ('09-17 Nathalie captions musik') ska inte flytta numreringen. */
export function nastaNummer(kandaNamn = []) {
  let hogst = 0;
  for (const namn of kandaNamn) {
    const t = tolka(namn);
    if (t?.nummer && t.nummer > hogst) hogst = t.nummer;
  }
  return hogst + 1;
}

/** Ger N lediga nummer i rad. */
export function nastaNummer_flera(kandaNamn, antal) {
  const start = nastaNummer(kandaNamn);
  return Array.from({ length: antal }, (_, i) => start + i);
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
