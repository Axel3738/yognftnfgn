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

// Mätt 2026-09-11: nyckeln Axel lade in som ANTHROPIC_NYCKEL är äkta men INTE
// bunden till en workspace. Messages API svarar då 400 "This API key is not
// scoped to a workspace, so this request must include the
// anthropic-workspace-id header". Två vägar: en nyckel skapad inne i en
// workspace (då behövs ingen header), eller workspace-id:t i
// ANTHROPIC_WORKSPACE_ID — då skickar alla anrop headern. Båda fungerar.
export const WORKSPACE_NAMN = 'ANTHROPIC_WORKSPACE_ID';

/** Workspace-id:t (wrkspc_…), eller '' om det inte är satt. */
export function anthropicWorkspace(env = process.env) {
  const v = env[WORKSPACE_NAMN];
  return v && String(v).trim() ? String(v).trim() : '';
}

/**
 * Headrarna varje Messages-anrop behöver: nyckel, version och — bara när
 * ANTHROPIC_WORKSPACE_ID är satt — workspace-headern. Ett ställe, så inget
 * skript glömmer den.
 */
export function anthropicHeaders(nyckel, { workspace = anthropicWorkspace() } = {}) {
  const h = { 'x-api-key': nyckel, 'anthropic-version': '2023-06-01' };
  if (workspace) h['anthropic-workspace-id'] = workspace;
  return h;
}

/** Hjälptext när API:t svarar att nyckeln saknar workspace. */
export const WORKSPACE_SAKNAS = `nyckeln är inte bunden till en workspace — skapa nyckeln inne i en workspace på console.anthropic.com, eller sätt ${WORKSPACE_NAMN} (wrkspc_…) i environmentet`;
