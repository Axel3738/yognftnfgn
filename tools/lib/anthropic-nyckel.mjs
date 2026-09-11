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

/** Workspace-id för nycklar som inte är knutna till en workspace.
 *  Mätt 2026-09-11: Axels ANTHROPIC_NYCKEL är en organisationsnyckel, och
 *  API:t svarar då "This API key is not scoped to a workspace, so this
 *  request must include the anthropic-workspace-id header". Sätts
 *  ANTHROPIC_WORKSPACE_ID i Environments skickas headern; en nyckel som
 *  redan är skapad inne i en workspace behöver den inte. */
export const WORKSPACE_NAMN = 'ANTHROPIC_WORKSPACE_ID';

/** Headers till Messages API — nyckel, version och workspace när det finns. */
export function anthropicHeaders(nyckel, env = process.env) {
  const headers = {
    'content-type': 'application/json',
    'x-api-key': nyckel,
    'anthropic-version': '2023-06-01',
  };
  const ws = env[WORKSPACE_NAMN];
  if (ws && String(ws).trim()) headers['anthropic-workspace-id'] = String(ws).trim();
  return headers;
}
