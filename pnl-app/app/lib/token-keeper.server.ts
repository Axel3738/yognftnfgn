/**
 * Håller butikernas offline-nycklar vid liv.
 *
 * Sedan `expiringOfflineAccessTokens` slogs på är nycklarna färskvara — de
 * gick ut efter ett dygn. Biblioteket förnyar dem bara inne i
 * `authenticate.admin`, alltså när någon öppnar just den butikens panel.
 * Gruppsummeringen läser däremot nycklarna direkt ur den delade Session-
 * tabellen, så en butik ingen besökt fick sin nyckel att tyst gå ut: Norge och
 * Finland svarade 401 mitt på dagen, deras dagsrader frös på morgonens
 * nollor, och den gemensamma vyn visade 0 kr försäljning bredvid full
 * annonskostnad. Två butiker såg ut som rena förluster medan de sålde.
 *
 * Varför en vakt per tjänst och inte en central: varje butik har sin EGEN
 * app-registrering, så en nyckel kan bara förnyas med den registreringens
 * client_id/secret. Sveriges tjänst får `invalid_request: This request
 * requires an active refresh_token` när den försöker förnya Norges nyckel —
 * bara Norges egen tjänst kan göra det. Alla sex tjänster kör därför den här
 * vakten, var och en lagar sin egen butik, och eftersom databasen är delad
 * ser alla andra resultatet direkt.
 */

import prisma from "../db.server";
import { giltigToken } from "./daily.server";

const INTERVALL_MS = 15 * 60 * 1000;
/** Förnya i god tid — en nyckel som går ut om en timme är redan ett problem. */
const MARGINAL_MS = 3 * 60 * 60 * 1000;
/** "Inte min butik" ändrar sig inte. Tröttna länge, men inte för alltid. */
const FRAMMANDE_MS = 12 * 60 * 60 * 1000;

const frammande = new Map<string, number>();
let igang = false;

async function runda(): Promise<void> {
  const gransen = new Date(Date.now() + MARGINAL_MS);
  const rader = await prisma.session.findMany({
    where: {
      isOnline: false,
      expires: { not: null, lte: gransen },
      refreshToken: { not: null },
    },
    select: { shop: true },
  });

  for (const { shop } of rader) {
    const sist = frammande.get(shop) ?? 0;
    if (Date.now() - sist < FRAMMANDE_MS) continue;
    const fore = await prisma.session.findFirst({
      where: { shop, isOnline: false },
      select: { accessToken: true },
    });
    const ny = await giltigToken(shop, true);
    if (!ny || ny === fore?.accessToken) {
      // Misslyckades: nästan alltid "inte den här tjänstens butik".
      frammande.set(shop, Date.now());
    } else {
      frammande.delete(shop);
    }
  }
}

/** Startas en gång per process. Fel får aldrig fälla tjänsten. */
export function startaTokenVakt(): void {
  if (igang) return;
  igang = true;
  const tick = () =>
    runda().catch((e) => console.error("Tokenvakten misslyckades:", e));
  // Strax efter start, sedan med jämna mellanrum.
  setTimeout(tick, 20_000).unref?.();
  setInterval(tick, INTERVALL_MS).unref?.();
}
