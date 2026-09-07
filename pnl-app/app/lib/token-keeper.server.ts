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
import { decrypt, encrypt } from "./crypto.server";
import { bestamUtgang, forlangToken, metaLoginConfig } from "./meta-login.server";

const INTERVALL_MS = 15 * 60 * 1000;
/** Förnya i god tid — en nyckel som går ut om en timme är redan ett problem. */
const MARGINAL_MS = 3 * 60 * 60 * 1000;
/** "Inte min butik" ändrar sig inte. Tröttna länge, men inte för alltid. */
const FRAMMANDE_MS = 12 * 60 * 60 * 1000;

const frammande = new Map<string, number>();
let igang = false;

/* ---- Meta-token från Logga in med Facebook ----
   Long-lived användartoken lever ~60 dagar. Meta låter en giltig long-lived
   token bytas mot en ny 60-dagarstoken, så handlaren ska inte behöva logga in
   igen varannan månad. Försöket görs när mindre än 30 dagar återstår, högst en
   gång per dygn och process; lyckas det flyttas utgången fram och butiken
   faller ur fönstret. Misslyckas det (Meta har ändrat regeln, token
   återkallad) återstår varningen i panelen — inget värre. Meta-appen är
   gemensam för alla tjänster, så vilken process som helst kan förnya vilken
   butik som helst; delad databas gör resultatet synligt för alla. */
const META_FONSTER_MS = 30 * 24 * 60 * 60 * 1000;
const META_PAUS_MS = 24 * 60 * 60 * 1000;

async function fornyaMetaNycklar(): Promise<void> {
  const cfg = metaLoginConfig();
  if (!cfg) return;
  const nu = Date.now();
  const rader = await prisma.shopSettings.findMany({
    where: {
      metaTokenSource: "login",
      metaAccessToken: { not: null },
      /* Bara token från SAMMA Meta-app som den här tjänsten: en tjänst med
         fel META_APP_ID skulle annars ta dagens försök och bränna det. */
      metaAppId: cfg.appId,
      metaTokenExpiresAt: { gt: new Date(nu), lte: new Date(nu + META_FONSTER_MS) },
      OR: [{ metaTokenRefreshAttemptAt: null }, { metaTokenRefreshAttemptAt: { lt: new Date(nu - META_PAUS_MS) } }],
      /* Bara butiker som fortfarande har appen installerad — en avinstallerad
         butiks token ska dö, inte hållas vid liv. */
      shop: { in: (await prisma.session.findMany({ where: { isOnline: false }, select: { shop: true } })).map((s) => s.shop) },
    },
    select: { shop: true, metaAccessToken: true, metaTokenExpiresAt: true, metaTokenRefreshAttemptAt: true },
  });
  for (const rad of rader) {
    /* Dekryptera INNAN stämpeln: en tjänst med fel TOKEN_ENCRYPTION_KEY ska
       inte ta dagens försök från den som kan. */
    const token = decrypt(rad.metaAccessToken);
    if (!token) continue;
    /* Atomisk stämpling: sex tjänster läser samma rad inom samma minut, och
       bara den som hinner sätta stämpeln gör Meta-anropet. */
    const tagen = await prisma.shopSettings.updateMany({
      where: { shop: rad.shop, metaTokenRefreshAttemptAt: rad.metaTokenRefreshAttemptAt },
      data: { metaTokenRefreshAttemptAt: new Date() },
    });
    if (tagen.count !== 1) continue;
    try {
      const ny = await forlangToken(cfg, token);
      /* Den nya tokens verkliga utgång: fb_exchange_token flyttar INTE
         dataåtkomstens ~90 dagar från senaste inloggning — så utgången som
         sparas är det tidigaste av de två, och varningen kommer på rätt dag. */
      const utgang = await bestamUtgang(cfg, ny.token, ny.expiresAt);
      const gammalUtgang = rad.metaTokenExpiresAt?.getTime() ?? 0;
      if (utgang && utgang.getTime() > gammalUtgang) {
        /* Villkorad skrivning: har handlaren hunnit logga in på nytt (eller
           en annan tjänst hunnit förnya) sedan raden lästes, rörs inget. */
        await prisma.shopSettings.updateMany({
          where: { shop: rad.shop, metaTokenExpiresAt: rad.metaTokenExpiresAt },
          data: { metaAccessToken: encrypt(ny.token), metaTokenExpiresAt: utgang },
        });
        console.log(`Meta-token för ${rad.shop} förnyades till ${utgang.toISOString().slice(0, 10)}.`);
      } else {
        console.log(
          `Meta-token för ${rad.shop}: ingen senare utgång (dataåtkomsten kräver ny inloggning) — panelen varnar.`,
        );
      }
    } catch (e) {
      console.error(`Meta-token för ${rad.shop} kunde inte förnyas:`, (e as Error).message);
    }
  }
}

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
  const tick = () => {
    runda().catch((e) => console.error("Tokenvakten misslyckades:", e));
    fornyaMetaNycklar().catch((e) => console.error("Meta-tokenvakten misslyckades:", e));
  };
  // Strax efter start, sedan med jämna mellanrum.
  setTimeout(tick, 20_000).unref?.();
  setInterval(tick, INTERVALL_MS).unref?.();
}
