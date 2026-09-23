/**
 * Rena hjälpfunktioner för Claude-kopplingen. Ligger utanför
 * `ai-nyckel.server.ts` för att de ska gå att testa utan databas och utan
 * SDK — och för att en klientkomponent aldrig får röra en server-modul.
 */

/**
 * En nyckel som ser ut som en nyckel. Kontrollen är avsiktligt slapp — det är
 * Anthropic som avgör om den är giltig, inte vi — men den stoppar de två
 * vanligaste klistringarna: något som inte är en nyckel alls, och en nyckel
 * som fått med sig radbrytningar eller omkringliggande text.
 */
export function serNyckelUt(s: string): boolean {
  const v = s.trim();
  return v.startsWith("sk-ant-") && v.length >= 20 && !/\s/.test(v);
}

/** Maskerad form för UI:t: aldrig hela nyckeln, bara de fyra sista tecknen. */
export const maskera = (nyckel: string): string => nyckel.trim().slice(-4);
