// "Fråga Claude"-läget: i vissa servrar gör boten EN sak. Den läser allt, och
// när någon ställer en fråga svarar den bara "Fråga Claude." med en pik om att
// fråga Claude i stället för att fråga hela servern hela tiden.
// Den svarar aldrig på själva frågan och aldrig på tagg.
//
// Frågor känns igen i två steg: först gratis (frågetecken eller frågeord),
// sedan — för allt annat — en liten ja/nej-klassning med Claude, för många
// glömmer frågetecknet. Klassningen får ingen affärskontext och inga
// verktyg, så inget internt kan läcka den vägen.
//
// Servrar: env DISCORD_FRAGA_KLAR_SERVRAR (kommaseparerade guild-id).
// Default: Snart nappar de.

export const FRAGA_KLAR_DEFAULT = ['1432314381114282118']; // Snart nappar de

export function fragaKlarServrar(env = process.env) {
  const lista = (env.DISCORD_FRAGA_KLAR_SERVRAR || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  return lista.length ? lista : FRAGA_KLAR_DEFAULT;
}

export function arFragaKlarServer(guildId, lista = fragaKlarServrar()) {
  return Boolean(guildId) && lista.includes(String(guildId));
}

// Frågeord som inleder en svensk eller engelsk fråga utan frågetecken.
const FRAGEORD = /^(vem|vad|var|vart|när|hur|varför|vilken|vilket|vilka|kan|får|finns|är|ska|har|vet|någon som|nån som|who|what|where|when|how|why|which|can|could|does|do|is|are|anyone)\b/i;

/** Säker fråga utan att fråga någon: frågetecken, eller frågeord först. */
export function arFraga(text) {
  const t = String(text ?? '').trim();
  if (!t) return false;
  if (/\?/.test(t)) return true;
  return FRAGEORD.test(t) && t.split(/\s+/).length >= 3;
}

/** Värt att låta Claude avgöra? Inte tomt, inte en länk, minst tre ord. */
export function vardAttKlassa(text) {
  const t = String(text ?? '').trim();
  if (!t || /^https?:\/\/\S+$/.test(t)) return false;
  return t.split(/\s+/).length >= 3;
}

/**
 * Fråga eller inte. Gratisvägen först; annars klassaren (Claude), som får
 * skickas in av anroparen så det här går att testa utan nätverk.
 */
export async function arFragaAnalys(text, klassa) {
  if (arFraga(text)) return true;
  if (!klassa || !vardAttKlassa(text)) return false;
  try { return Boolean(await klassa(text)); } catch { return false; }
}

export const SVAR = [
  'Fråga Claude. Den svarar snabbare än hela servern, dummer.',
  'Fråga Claude, din dumbom. Sluta fråga alla här hela tiden.',
  'Fråga Claude. Skriv hela frågan där så får du svar direkt.',
  'Fråga Claude. Ingen här orkar, dummer.',
  'Fråga Claude. Det är därför den finns.',
];

/** Ett av svaren. Slumpen gör att det inte ser ut som en autosvarare. */
export function fragaKlarSvar(slump = Math.random) {
  return SVAR[Math.floor(slump() * SVAR.length) % SVAR.length];
}

// Den som taggar boten i en sådan server får ett konstigt svar och en pik.
// Taggen vinner över frågan: taggar du och frågar får du det här, inte
// "Fråga Claude".
export const TAGG_SVAR = [
  'Du taggade mig. Grattis. Jag har aldrig fångat en fisk, jag är en bäver.',
  'Tagga mig igen så byter jag ut all din lina mot spaghetti.',
  'Ja? Jag var mitt i ett viktigt gnag. Fråga Claude, den har inga tänder.',
  'Taggar du en bäver? Modigt. Bävrar taggar tillbaka. Det slutar aldrig bra.',
  'Jag hörde dig. Jag valde att bygga en damm i stället.',
  'Folk taggar mig för att slippa tänka själva. Fråga Claude, dummer.',
  'Meddelandet togs emot av en bäver. Bävern har inga händer. Fråga Claude.',
  'Vad vill du? Jag har 40 000 kubikmeter kvist att sortera, din dumbom.',
];

export function taggSvar(slump = Math.random) {
  return TAGG_SVAR[Math.floor(slump() * TAGG_SVAR.length) % TAGG_SVAR.length];
}
