// kampanjval.mjs — landningssideskampanjerna (listicle / lagerrensning /
// vi-testade / anledningar) är ÄGARENS, inte rutinens.
//
// Axels order 2026-09-22: listicle-kampanjerna rörs bara på hans tillsägelse.
// Leveransrundan fick spärren i PR #120 (tools/lib/kampanjval.mjs på main);
// motorn fick den samma kväll efter att torrkörningen 2026-09-22 visade att
// `Taköverdraget LISTICLE LAGERRENSNING` — som förut räddades av att namnet
// saknade break-even-tal (SAKNAR_BREAK_EVEN) — fick domen SKALA (1 000 →
// 1 200 den 21/9, 2 000 → 3 000 den 22/9) så fort break-even kom ur
// prissheetet. Motorn visste inte att den sortens kampanj fanns.
//
// ⚠️ Mönstret är KOPIERAT från tools/lib/kampanjval.mjs (agent/ finns inte på
// main, tools/ inte här). Ändra båda.

/** Landningssideskampanjer: trafiken går till `/pages/<slug>-…`, inte produktsidan. */
export const LISTICLE_MONSTER = /\b(listicle|lagerrens\w*|vi[- ]testade|anledningar)\b/i;
export const arListiclekampanj = (namn) => LISTICLE_MONSTER.test(String(namn ?? ''));
