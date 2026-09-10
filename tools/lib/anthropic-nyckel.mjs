// Nyckeln till Messages API — läses från två namn, för att Claude Code
// GÖMMER `ANTHROPIC_API_KEY` för allt som körs via Bash.
//
// Mätt 2026-09-10 i en claude.ai-session: variabeln stod i environmentet
// (syntes i Claude-processen, /proc/<pid>/environ) men saknades i skalet som
// skripten körs i, medan NOTION_TOKEN, META_ACCESS_TOKEN, KIE_API_KEY osv.
// släpptes igenom. Klienten reserverar exakt det namnet för sin egen
// inloggning. Därför finns ett andra namn, `ANTHROPIC_NYCKEL`, som klienten
// inte rör — det är det Axel sätter i Environments på claude.ai.
//
// Ordningen: ANTHROPIC_API_KEY (lokalt, i CI, hos den som kör för hand) →
// ANTHROPIC_NYCKEL (rutiner och sessioner på claude.ai).

export const NYCKELNAMN = ['ANTHROPIC_API_KEY', 'ANTHROPIC_NYCKEL'];

/** Nyckeln, eller '' om inget av namnen är satt. */
export function anthropicNyckel(env = process.env) {
  for (const namn of NYCKELNAMN) {
    const v = env[namn];
    if (v && String(v).trim()) return String(v).trim();
  }
  return '';
}

/** Feltexten postarna visar — nämner båda namnen så ingen letar efter fel variabel. */
export const NYCKEL_SAKNAS = 'ANTHROPIC_API_KEY saknas (eller ANTHROPIC_NYCKEL — det namn som fungerar i claude.ai-sessioner)';
