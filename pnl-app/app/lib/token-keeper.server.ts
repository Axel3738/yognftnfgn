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
import { butikensHorisont, giltigToken, markeraPagaende, returkollHamtning, type HamtUtfall } from "./daily.server";
import { dayInTz } from "./shopify-data.server";
import { resyncFonster } from "./historik";
import {
  RESYNC_BULK_TIMEOUT_MS,
  RESYNC_INTERVALL_MS,
  RESYNC_PER_TICK,
  felLas,
  sqlTid,
  valjResyncButiker,
} from "./returkoll";
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

/* ---- Returkollen ----
   En återbetalning eller avbokning bokas på ORDERNS dag och når siffrorna
   bara när den dagen exporteras om. Panelen och gruppen håller bara de tre
   senaste dagarna färska, och i dropshipping kommer returerna 1–3 veckor
   efter ordern — så gruppens 30-dagarsvinst, MER, break-even och LTV-
   kohorterna bar returer som aldrig drogs av. Här går varje installerad
   butiks senaste 45 dagar om var 6:e timme, i den tjänst som hinner först.

   Returer bokas FORTFARANDE på orderns dag (shopify-data.server.ts) — det är
   rätt för ROAS per kohort. Kollen gör bara att dagen faktiskt hämtas igen. */

/** Butiker den HÄR tjänsten nyss misslyckades med — se `valjResyncButiker`. */
const resyncPaus = new Map<string, number>();
const RESYNC_PAUS_MS = 60 * 60 * 1000;
/* En bulk-export på 45 dagar kan ta minuter. Ett tick som startar medan det
   förra fortfarande kör hade tagit tre butiker till parallellt. */
let resyncPagar = false;

/**
 * Stämplar med RÅ SQL, inte prisma.update: ShopSettings har `updatedAt
 * @updatedAt`, och panelens loader läser om butikens valuta och tidszon när
 * `updatedAt` är över ett dygn gammal. En stämpel var 6:e timme via Prisma
 * hade hållit `updatedAt` färsk för alltid, och en ändrad butiksvaluta hade
 * aldrig nått appen. Tidpunkterna går som text med CAST, så jämförelsen är
 * exakt oavsett databassessionens tidszon.
 */
async function stampla(shop: string, ny: Date | null, om: Date | null): Promise<number> {
  return prisma.$executeRaw`
    UPDATE "ShopSettings"
       SET "refundResyncAt" = CAST(${sqlTid(ny)} AS TIMESTAMP(3))
     WHERE "shop" = ${shop}
       AND "refundResyncAt" IS NOT DISTINCT FROM CAST(${sqlTid(om)} AS TIMESTAMP(3))`;
}

/**
 * Lyckad koll: flyttar låset till klartiden och skriver samma tid i
 * `refundResyncOkAt` — det enda fältet panelen och gruppen visar. Låset
 * stämplas redan när exporten STARTAR; visades det hade panelen sagt
 * "senaste koll 14:00" medan exporten pågick eller skulle misslyckas.
 * Villkorat på vår egen stämpel, som `stampla`.
 */
async function stamplaKlar(shop: string, ny: Date, om: Date): Promise<number> {
  return prisma.$executeRaw`
    UPDATE "ShopSettings"
       SET "refundResyncAt" = CAST(${sqlTid(ny)} AS TIMESTAMP(3)),
           "refundResyncOkAt" = CAST(${sqlTid(ny)} AS TIMESTAMP(3))
     WHERE "shop" = ${shop}
       AND "refundResyncAt" IS NOT DISTINCT FROM CAST(${sqlTid(om)} AS TIMESTAMP(3))`;
}

export async function resyncRunda(): Promise<void> {
  if (resyncPagar) return;
  resyncPagar = true;
  try {
    const nu = Date.now();
    for (const [shop, t] of resyncPaus) if (nu - t > RESYNC_PAUS_MS) resyncPaus.delete(shop);
    /* Bara installerade butiker (en offline-session finns — samma filter som
       Meta-förnyelsen ovan) och bara de vars tidszon är känd: dagarna skrivs
       i butikens tid, och en gissad UTC-dag hade hamnat på fel datum. */
    const installerade = (await prisma.session.findMany({ where: { isOnline: false }, select: { shop: true } })).map(
      (s) => s.shop,
    );
    if (!installerade.length) return;
    const rader = await prisma.shopSettings.findMany({
      where: {
        shop: { in: installerade },
        timezone: { not: null },
        OR: [{ refundResyncAt: null }, { refundResyncAt: { lt: new Date(nu - RESYNC_INTERVALL_MS) } }],
      },
      select: { shop: true, refundResyncAt: true, refundResyncOkAt: true, timezone: true },
    });
    const tur = valjResyncButiker(rader, nu, RESYNC_PER_TICK, new Set(resyncPaus.keys()));
    const tidszon = new Map(rader.map((r) => [r.shop, r.timezone ?? "UTC"]));
    const senasteOk = new Map(rader.map((r) => [r.shop, r.refundResyncOkAt]));

    /* En i taget: butikerna delar ingen bulk-plats, men tjänsten gör det
       inte heller bättre av att elda tre exporter samtidigt. */
    for (const kandidat of tur) {
      const { shop } = kandidat;
      const forra = kandidat.refundResyncAt;
      const stampel = new Date();
      /* Atomisk: sex tjänster läser samma rader inom samma minut — bara den
         som flyttar stämpeln från exakt det värde den läste gör exporten. */
      if ((await stampla(shop, stampel, forra)) !== 1) continue;

      /* Ett kast innan hämtningen ens startat (horisonten, tidszonen) räknas
         som exportfel: det beror inte på vilken tjänst som kör. */
      let utfall: HamtUtfall = "fel";
      try {
        const tz = tidszon.get(shop) ?? "UTC";
        const idag = dayInTz(new Date(), tz);
        const [from, to] = resyncFonster(idag, await butikensHorisont(shop, tz));
        /* Utan force: minutspärren (farStartaBakgrund) och felpausen gäller,
           så kollen krockar aldrig med en panels egen export i den här
           processen. markeraPagaende gör att en panel som öppnas under
           exporten pollar tills de nya siffrorna finns. Längre bulk-gräns än
           panelens 90 s, och ett exportfel här sätter inte felpausen som
           panelen och gruppen läser. */
        utfall = await markeraPagaende(shop, returkollHamtning(shop, from, to, RESYNC_BULK_TIMEOUT_MS));
      } catch (e) {
        console.error(`Returkollen för ${shop} kastade:`, (e as Error).message);
      }

      if (utfall === "ok") {
        /* Stämpeln flyttas till NÄR hämtningen blev klar och skrivs i
           `refundResyncOkAt` — det är den tid panelen visar ("senaste koll
           HH:MM"), och siffrorna är minst så färska. */
        await stamplaKlar(shop, new Date(), stampel);
        resyncPaus.delete(shop);
      } else if (utfall === "fel") {
        /* Exportfel: detsamma i alla tjänster. Gemensam paus i databasen i
           stället för tillbakarullning — annars tog nästa tjänst samma dömda
           export på nästa tick, om och om igen (`felLas`). Villkorat på vår
           egen stämpel. */
        await stampla(shop, felLas(Date.now(), senasteOk.get(shop) ?? null), stampel);
        resyncPaus.set(shop, Date.now());
      } else {
        /* Nyckel eller hoppad: tillbaka till förra värdet. En tjänst som inte
           kan förnya en annan registrerings nyckel får inte hålla butiken i 6
           timmar — den som kan ska ta den på nästa tick. Villkorat på vår
           egen stämpel, så en annan tjänsts senare koll aldrig skrivs över. */
        await stampla(shop, forra, stampel);
        resyncPaus.set(shop, Date.now());
      }
    }
  } finally {
    resyncPagar = false;
  }
}

/** Startas en gång per process. Fel får aldrig fälla tjänsten. */
export function startaTokenVakt(): void {
  if (igang) return;
  igang = true;
  const tick = () => {
    /* Returkollen EFTER nyckelrundan: då exporterar den med nycklar som
       just förnyats, i stället för att misslyckas på en som gick ut. */
    void runda()
      .catch((e) => console.error("Tokenvakten misslyckades:", e))
      .then(() => resyncRunda())
      .catch((e) => console.error("Returkollen misslyckades:", e));
    fornyaMetaNycklar().catch((e) => console.error("Meta-tokenvakten misslyckades:", e));
  };
  // Strax efter start, sedan med jämna mellanrum.
  setTimeout(tick, 20_000).unref?.();
  setInterval(tick, INTERVALL_MS).unref?.();
}
