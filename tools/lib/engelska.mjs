// Allt som postas i Discord ska vara på engelska (Axels order 2026-09-05).
// Teamet i servern är engelsktalande, och rutinerna skriver sina rapporter
// på svenska av gammal vana — kommandofilerna och rutinprompterna är på
// svenska, så modellen faller tillbaka till svenska utan att märka det.
//
// Därför sitter spärren i själva postarna, inte i prompterna:
//   1. Ser texten svensk ut?  (ordlista, konservativ — hellre missa än stoppa
//      engelska av misstag; svenska/norska produktnamn räknas inte)
//   2. Ja + ANTHROPIC_API_KEY finns  → översätts automatiskt. (I claude.ai-
//      sessioner heter den ANTHROPIC_NYCKEL — se tools/lib/anthropic-nyckel.mjs.)
//   3. Ja + ingen nyckel              → skickas INTE. Postaren avslutar med
//      exit 3 och säger åt anroparen att skriva om på engelska. Anroparen är
//      en Claude-session, så den gör det.
//   4. DISCORD_TILLAT_SVENSKA=1       → spärren av (Axels egna handposter).
//
// Noll beroenden: rå fetch mot Messages API, som resten av repo-roten.

import { anthropicNyckel, anthropicHeaders, NYCKEL_SAKNAS, WORKSPACE_SAKNAS } from './anthropic-nyckel.mjs';

const MODELL = process.env.DISCORD_OVERSATT_MODELL || 'claude-sonnet-5';

// Svenska funktionsord och rutin-ord som (nästan) aldrig förekommer i
// engelsk text. Ord som också är engelska (under, den, en, med, sen, nu)
// är medvetet utelämnade.
const SVENSKA_ORD = new Set([
  'och', 'inte', 'är', 'att', 'det', 'som', 'på', 'för', 'från', 'till', 'över',
  'av', 'ett', 'nya', 'alla', 'redan', 'klara', 'klart', 'inga', 'ingen', 'inget',
  'väntar', 'väntade', 'saknar', 'saknas', 'finns', 'fanns', 'hade', 'blev', 'kör',
  'körning', 'körningen', 'produkter', 'produkten', 'produkt', 'rader', 'raden',
  'importerade', 'importerades', 'överhoppade', 'hoppades', 'behöver', 'göra',
  'något', 'sedan', 'du', 'jag', 'vi', 'ni', 'dig', 'oss', 'vår', 'våra', 'idag',
  'natt', 'natten', 'inatt', 'dagen', 'igår', 'imorgon', 'hittade', 'hittades',
  'skickat', 'skickades', 'laddades', 'uppladdade', 'uppe', 'aktiverade', 'pausade',
  'stoppade', 'mappen', 'filen', 'filer', 'betyg', 'recensioner', 'recension',
  'kampanj', 'kampanjer', 'annons', 'annonser', 'gick', 'ligger', 'står', 'kvar',
  'avvisad', 'nekad', 'misslyckades', 'lyckades', 'väntas', 'sak', 'saker', 'också',
  'ännu', 'bara', 'allt', 'allting', 'mycket', 'många', 'flera', 'några', 'varje',
]);

// Orden med sin ursprungliga skiftning: ett stort N i Motorhöljet är det som
// skiljer ett produktnamn från ett svenskt ord.
function ord(text) {
  return String(text ?? '')
    .replace(/<@[!&]?\d+>/g, ' ')          // taggar
    .replace(/https?:\/\/\S+/g, ' ')        // länkar
    .replace(/`[^`]*`/g, ' ')               // kod
    .split(/[^A-Za-zÅÄÖåäöØøÆæ]+/)
    .filter(Boolean);
}

/**
 * Konservativ svenskdetektor. Sant först vid ≥ 2 olika markörer, så ett
 * enstaka svenskt produkt- eller kanalnamn i en engelsk rapport inte
 * stoppar den. Versalinledda ord (Motorhöljet, Bäverbutiken) räknas aldrig —
 * det är namn. Norska ø/æ räknas inte heller; de norska handlarna är
 * engelska rapporters vardag.
 */
export function serUtSomSvenska(text) {
  const träffar = new Set();
  for (const o of ord(text)) {
    const gemen = o.toLowerCase();
    if (SVENSKA_ORD.has(gemen)) träffar.add(gemen);
    else if (o === gemen && /[åäö]/.test(gemen) && gemen.length > 2) träffar.add(gemen); // väntar, kör, på …
  }
  return träffar.size >= 2;
}

const INSTRUKTION = `You translate short operational Discord messages from Swedish to natural, concise English for an English-speaking e-commerce team.

Rules:
- Output ONLY the translated message. No preamble, no notes, no quotes around it.
- Keep every emoji, line break, markdown, bullet, code span, URL and <@id> mention exactly where it is.
- Keep names of products, campaigns, channels, people, files and Shopify handles exactly as written, including Swedish and Norwegian spelling (Motorhöljet, #bäver-scaling-products, IBC-tanktrekk, beverbutikken.no).
- Keep numbers, dates, times and amounts unchanged. Currency stays as written (e.g. "1 200 SEK", "299 kr" → "299 SEK").
- Keep it as short as the original. Do not add explanations.
- If the text is already English, return it unchanged.`;

/**
 * Översätter via Messages API. Kastar vid nätverksfel, saknad nyckel eller
 * ett svar som inte går att använda — anroparen avgör vad som händer då.
 */
export async function oversattTillEngelska(text, { nyckel = anthropicNyckel() } = {}) {
  if (!nyckel) throw new Error(NYCKEL_SAKNAS);
  const svar = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: anthropicHeaders(nyckel),
    body: JSON.stringify({
      model: MODELL,
      max_tokens: 4000,
      output_config: { effort: 'low' },
      system: INSTRUKTION,
      messages: [{ role: 'user', content: text }],
    }),
  });
  if (!svar.ok) {
    const feltext = await svar.text();
    if (svar.status === 400 && /anthropic-workspace-id/.test(feltext)) throw new Error(`Messages API svarade 400: ${WORKSPACE_SAKNAS}`);
    throw new Error(`Messages API svarade ${svar.status}: ${feltext.slice(0, 200)}`);
  }
  const kropp = await svar.json();
  if (kropp.stop_reason === 'refusal') throw new Error('modellen avböjde översättningen');
  const ut = (kropp.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  if (!ut) throw new Error('tomt svar från översättningen');
  return ut;
}

/**
 * Det postarna anropar. Returnerar { text, svenska, oversatt, stoppad, orsak }.
 * `stoppad` = texten är svensk och kunde inte översättas; skicka den INTE.
 */
export async function granskaSprak(text, { tillatSvenska = process.env.DISCORD_TILLAT_SVENSKA === '1' } = {}) {
  const svenska = serUtSomSvenska(text);
  if (!svenska || tillatSvenska) return { text, svenska, oversatt: false, stoppad: false };
  try {
    const engelska = await oversattTillEngelska(text);
    return { text: engelska, svenska: true, oversatt: true, stoppad: false };
  } catch (fel) {
    return { text, svenska: true, oversatt: false, stoppad: true, orsak: fel.message };
  }
}

/** Gemensamt felmeddelande, så alla postare säger samma sak. */
export function stoppText(orsak) {
  return [
    'STOPPAT: meddelandet är på svenska, och allt i Discord ska vara på engelska.',
    `Kunde inte översätta automatiskt (${orsak}).`,
    'Skriv om meddelandet på engelska och kör igen — behåll namn, siffror och emojis.',
    'Automatisk översättning: sätt ANTHROPIC_NYCKEL i environmentet (ANTHROPIC_API_KEY göms av Claude Code för skripten).',
  ].join('\n');
}
