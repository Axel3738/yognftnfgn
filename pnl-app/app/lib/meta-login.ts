/**
 * Klientsäkra delar av Meta-inloggningen: konstanter, typer och små rena
 * funktioner som både UI-komponenterna och servern behöver. Allt som pratar
 * med databasen eller Meta ligger i meta-login.server.ts — en komponent som
 * importerar därifrån stoppar Remix-bygget ("Server-only module referenced
 * by client").
 */

/** Så länge räknas en inloggnings-token som "snart slut" i UI:t. */
export const VARNA_DAGAR = 14;

/**
 * Graph API-versionen — EN konstant för både annonskostnaden och
 * inloggningen. v21.0 släpptes 2024-10 och dras in kring 2027-01; då svarar
 * varje anrop med fel 2635 och både spend och inloggning stannar i alla
 * tjänster på en gång. Bumpa här, ingen annanstans.
 */
export const GRAPH_VERSION = "v21.0";

export interface Annonskonto {
  /** Siffrorna utan act_-prefix — samma form som ShopSettings.metaAdAccountId. */
  accountId: string;
  name: string;
  currency: string;
  /** Metas account_status: 1 = aktivt. Allt annat visas med etikett. */
  status: number;
}

/** Normaliserar ett annonskonto-ID: "act_123 " och "123" är samma konto. */
export function kontoId(v: string | null | undefined): string {
  return String(v ?? "").trim().replace(/^act_/i, "");
}

/** Dagar kvar till utgång, avrundat nedåt. Null = okänt. */
export function dagarKvar(expiresAt: Date | string | null | undefined): number | null {
  if (!expiresAt) return null;
  const t = typeof expiresAt === "string" ? Date.parse(expiresAt) : expiresAt.getTime();
  if (!Number.isFinite(t)) return null;
  return Math.floor((t - Date.now()) / 86_400_000);
}
