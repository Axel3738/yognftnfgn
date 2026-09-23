/**
 * Vilken Claude-nyckel appens AI-funktioner ska köra på.
 *
 * Fram till nu låg nyckeln bara i serverns miljö: Axel betalade för varje
 * handlares AI-användning, och saknades variabeln var funktionerna helt dolda
 * för alla. Nu kan varje butik koppla sin EGEN nyckel i Inställningar —
 * samma slags koppling som Meta redan har, och den handlaren betalar då för
 * sin egen användning. *(Axels ask 2026-09-23.)*
 *
 * Ordningen är butikens nyckel först, serverns som reserv. Det betyder att
 * Axels egna butiker fortsätter fungera utan att någon kopplar något, och
 * att en handlare som kopplar sin egen tar över kostnaden från den sekunden.
 *
 * Nyckeln lagras krypterad (`crypto.server.ts`, AES-256-GCM) precis som
 * Meta-token — läcker databasen är raderna obrukbara utan miljöns nyckel.
 * Den lämnar aldrig servern: UI:t får bara veta ATT den finns och de fyra
 * sista tecknen.
 */

import Anthropic from "@anthropic-ai/sdk";

import prisma from "../db.server";
import { decrypt } from "./crypto.server";
import { maskera, serNyckelUt } from "./ai-nyckel";

export { maskera, serNyckelUt };

/** Serverns egen nyckel. Reserv för butiker som inte kopplat någon. */
export const serverNyckel = (): string | null => process.env.ANTHROPIC_API_KEY?.trim() || null;

export interface AiKoppling {
  /** Nyckeln att skicka till SDK:n. Null = ingen AI går att köra. */
  nyckel: string | null;
  /** Var den kom ifrån — avgör vad Inställningar visar. */
  kalla: "butik" | "server" | "ingen";
  /** De fyra sista tecknen i butikens nyckel, för igenkänning. Aldrig mer. */
  slut: string | null;
  sparad: Date | null;
}


/**
 * Läser kopplingen för en butik. `settings` kan skickas med när anroparen
 * redan hämtat raden, så att en chattfråga inte kostar en extra DB-runda.
 */
export async function hamtaKoppling(
  shop: string,
  settings?: { anthropicApiKey: string | null; anthropicKeySavedAt: Date | null } | null,
): Promise<AiKoppling> {
  const rad =
    settings ??
    (await prisma.shopSettings
      .findUnique({ where: { shop }, select: { anthropicApiKey: true, anthropicKeySavedAt: true } })
      .catch(() => null));

  const egen = rad?.anthropicApiKey ? decrypt(rad.anthropicApiKey) : null;
  if (egen) {
    return { nyckel: egen, kalla: "butik", slut: maskera(egen), sparad: rad?.anthropicKeySavedAt ?? null };
  }
  const server = serverNyckel();
  return {
    nyckel: server,
    kalla: server ? "server" : "ingen",
    slut: null,
    sparad: null,
  };
}

/**
 * Duger nyckeln? Kontrolleras mot Anthropic INNAN den sparas — en felklistrad
 * nyckel som sparas tyst gör att AI-rutan slutar fungera dagar senare, utan
 * att någon kopplar ihop det med kopplingen.
 *
 * `models.list()` räcker: den bevisar att nyckeln är giltig utan att generera
 * en enda token, alltså utan att kosta handlaren något.
 */
export async function provaNyckel(nyckel: string): Promise<{ ok: boolean; fel?: string }> {
  try {
    await new Anthropic({ apiKey: nyckel, maxRetries: 1 }).models.list({ limit: 1 });
    return { ok: true };
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return { ok: false, fel: "401" };
    if (e instanceof Anthropic.PermissionDeniedError) return { ok: false, fel: "403" };
    if (e instanceof Anthropic.APIError) return { ok: false, fel: `${e.status ?? ""} ${e.message}`.trim() };
    return { ok: false, fel: (e as Error).message };
  }
}

/** Går AI att köra för den här butiken alls? */
export async function aiTillganglig(shop: string): Promise<boolean> {
  return (await hamtaKoppling(shop)).nyckel !== null;
}
