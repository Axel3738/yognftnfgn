// "Fråga klar"-läget: i vissa servrar gör boten EN sak. Den läser allt, och
// när någon ställer en fråga svarar den bara "Fråga klar." med en pik om att
// ställa hela frågan direkt i stället för att fråga hela servern om lov.
// Den svarar aldrig på själva frågan, aldrig på tagg, och anropar aldrig
// Claude — noll kostnad, noll risk att något internt läcker.
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

/** Är det här en fråga? Frågetecken räcker; annars ett frågeord först. */
export function arFraga(text) {
  const t = String(text ?? '').trim();
  if (!t) return false;
  if (/\?/.test(t)) return true;
  return FRAGEORD.test(t) && t.split(/\s+/).length >= 3;
}

export const SVAR = [
  'Fråga klar. Ställ hela frågan direkt, dummer — ingen svarar på "får jag fråga en sak".',
  'Fråga klar, din dumbom. Fråga inte om du får fråga. Fråga.',
  'Fråga klar. Du har frågat halva servern nu. Skriv hela frågan så slipper vi gissa.',
  'Fråga klar. Ställer du hela frågan på en gång kanske någon orkar svara, dummer.',
  'Fråga klar. Sluta fråga alla hela tiden — skriv vad du undrar, så får du svar.',
];

/** Ett av svaren. Slumpen gör att det inte ser ut som en autosvarare. */
export function fragaKlarSvar(slump = Math.random) {
  return SVAR[Math.floor(slump() * SVAR.length) % SVAR.length];
}
