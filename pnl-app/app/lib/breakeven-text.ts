/**
 * Klientsäker del av break-even: bara textformatering, inga serverimporter.
 * Räknelogiken bor i breakeven.server.ts.
 */

/** "70 % 1 st · 25 % 2 st · 5 % 3 st" — mixen som text. */
export function mixText(mix: { qty: number; share: number }[], st: string): string {
  return mix.map((r) => `${Math.round(r.share * 100)} % ${r.qty} ${st}`).join(" · ");
}
