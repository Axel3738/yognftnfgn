// Den rena logiken bakom värva-en-vän-kortet — inget Preact, inget shopify-objekt,
// så den går att testa med node --test (matstrumpor/test/varva-kort.test.mjs).
// Kort.jsx importerar härifrån; ändra aldrig en regel på bara ett ställe.

export const varde = (s) => (s && typeof s === 'object' && 'value' in s ? s.value : s);

/** Värvarens bekräftelsenummer — samma kontroll som varva.mjs refUr. */
export function refFor(nummer) {
  const s = String(nummer ?? '').trim().toUpperCase();
  return /^[A-Z0-9]{6,16}$/.test(s) ? s : null;
}

/** Butikens adress för kundens språk: exakt kod först ("pt-PT"), sedan
 *  grundspråket ("en-US" → "en"). Okänt språk ⇒ null: hellre inget kort än
 *  en länk på fel språk. */
export function basFor(lankar, sprak) {
  const s = String(sprak ?? '');
  if (!s) return null;
  if (lankar[s]) return lankar[s];
  const hittad = Object.keys(lankar).find((k) => k.toLowerCase() === s.toLowerCase());
  if (hittad) return lankar[hittad];
  const grund = s.split('-')[0].toLowerCase();
  const g = Object.keys(lankar).find((k) => k.toLowerCase() === grund);
  if (g) return lankar[g];
  if (grund === 'no' && lankar.nb) return lankar.nb;
  return null;
}

/** Länken vännen får. Bara bekräftelsenumret, aldrig koden. */
export const lankFor = (bas, ref) => `${String(bas).replace(/\/+$/, '')}/?van=${encodeURIComponent(ref)}`;

/** Allt kortet behöver, eller null när kortet inte ska visas. */
export function kortFor({ data, sprak, valuta, nummer, avbruten = false }) {
  if (avbruten) return null;
  const ref = refFor(nummer);
  const bas = basFor(data.lankar, sprak);
  const belopp = data.valutor[String(valuta ?? '').toUpperCase()];
  if (!ref || !bas || !belopp) return null;
  return { ref, url: lankFor(bas, ref), van: belopp.van, kredit: belopp.kredit, valuta: String(valuta).toUpperCase() };
}

/** "{van}" och "{kredit}" i en text byts mot formaterade belopp. */
export const fyll = (text, vars) => String(text ?? '').replace(/\{([a-z_]+)\}/g, (m, k) => (k in vars ? vars[k] : m));

/** Hela belopp utan decimaler, halva med två ("3,50 £"). */
export const decimaler = (belopp) => (Number(belopp) % 1 ? 2 : 0);
