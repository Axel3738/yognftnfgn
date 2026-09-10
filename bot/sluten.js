// Var får boten prata om verksamheten? Ren funktion, testad utan nätverk.
//
// Boten sitter i flera servrar — Bäverbutiken (hemma), Snart nappar de,
// Grillkliniken, HeimGuard m.fl. — och kan bjudas in till fler. Allt som
// står i affärskontexten (spend, ROAS, budgetar, produkter, kampanjer,
// teamet, filer) är internt och får bara synas HEMMA. Överallt annars, och
// i DM, kör boten SLUTEN: ingen affärskontext i prompten, inget filverktyg.
// Det den inte har kan den inte läcka — en regel i prompten räcker inte.
//
// Öppna servrar styrs av env DISCORD_OPPNA_SERVRAR (kommaseparerade
// guild-id). Default: bara Bäverbutiken.

export const HEMSERVER = '1540322130388983921'; // Bäverbutiken

export function oppnaServrar(env = process.env) {
  const lista = (env.DISCORD_OPPNA_SERVRAR || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  return lista.length ? lista : [HEMSERVER];
}

/** Sant när verksamhetens data får användas i det här sammanhanget. */
export function arOppen({ guildId, oppna = oppnaServrar() }) {
  if (!guildId) return false;            // DM: alltid sluten
  return oppna.includes(String(guildId));
}
