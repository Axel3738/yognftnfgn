// Vilka recensioner ett citatblock visar. Delas av Klaviyo-mallarna (mallar.mjs)
// och Spoks-paketet (spoks-paket.mjs), så båda visar samma citat.
//
// Standard: de första `antal` (högst 2) i recensionslistan — bästa betyg, sedan
// nyast. Den listan flyttar sig varje gång en ny recension kommer in, så ett
// mejl vars ämnesrad bygger på ett visst citat ("Recensionerna säger att
// mottagaren blev glad") tappar sitt belägg utan att någon märker det
// (K03 2026-09-29: tre nya recensioner efter K15 sköt ut Kents citat).
//
// Med `valj` (lista med ordbitar ur recensionstexten, högst två) visas exakt de
// recensionerna, i den ordningen, hur många nya som än kommer in. Ett valt citat
// som inte finns bland de hämtade recensionerna rapporteras i `saknas` — då
// bygger mejlet på något som inte går att visa, och anroparen stoppar.

export const MAX_CITAT = 2;

export function valjCitat(b, alla = []) {
  const lista = Array.isArray(alla) ? alla : [];
  const antal = Math.min(Number(b?.antal ?? MAX_CITAT) || MAX_CITAT, MAX_CITAT);
  if (!Array.isArray(b?.valj) || !b.valj.length) return { lista: lista.slice(0, antal), saknas: [] };
  const valda = [];
  const saknas = [];
  for (const ord of b.valj.slice(0, MAX_CITAT)) {
    const nal = String(ord).toLowerCase();
    const r = lista.find((x) => !valda.includes(x) && String(x?.text ?? '').toLowerCase().includes(nal));
    if (r) valda.push(r);
    else saknas.push(String(ord));
  }
  return { lista: valda, saknas };
}
