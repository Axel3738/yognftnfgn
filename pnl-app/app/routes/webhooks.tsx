import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { decrypt } from "../lib/crypto.server";
import { aterkallaToken, farAterkallas, META_TOMT } from "../lib/meta-login.server";

export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, session } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED": {
      // Sessionen är redan ogiltig; städa så att en ominstallation börjar rent.
      if (session) await prisma.session.deleteMany({ where: { shop } });
      /* Meta-token från inloggningen följer med ut: en avinstallerad butik
         ska inte ha en giltig 60-dagarsnyckel liggande som vakten dessutom
         förnyar. Databasen nollas FÖRST (Shopify ger webhooken fem sekunder;
         Meta får inte stå i vägen), återkallelsen går i bakgrunden — och bara
         när ingen annan butik delar samma Facebook-användare, eftersom den
         gäller hela användaren. shop/redact kommer först ~48 h senare, och
         bara där compliance-topics finns. */
      const s = await prisma.shopSettings.findUnique({ where: { shop } });
      if (s?.metaAccessToken) {
        const token = s.metaTokenSource === "login" ? decrypt(s.metaAccessToken) : null;
        const aterkalla = token ? await farAterkallas(shop, s.metaUserId) : false;
        await prisma.shopSettings.update({ where: { shop }, data: META_TOMT });
        if (token && aterkalla) void aterkallaToken(token, 3_000);
      }
      await prisma.metaLoginState.deleteMany({ where: { shop } });
      break;
    }

    // GDPR-krav för App Store. Appen lagrar ingen kunddata — bara aggregerad
    // försäljning per dag — så det finns inget att lämna ut eller radera.
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
      break;

    case "SHOP_REDACT":
      /* ALLT som hör till butiken ska bort — en radering som lämnar cacher
         och kopplingskoder kvar är ingen radering. Det här är också vad vi
         intygat i dataskyddsdeklarationen. */
      await prisma.$transaction([
        prisma.dailySpend.deleteMany({ where: { shop } }),
        prisma.costChange.deleteMany({ where: { shop } }),
        prisma.costTier.deleteMany({ where: { shop } }),
        prisma.pnlCache.deleteMany({ where: { shop } }),
        prisma.dailyPnl.deleteMany({ where: { shop } }),
        prisma.catalogCache.deleteMany({ where: { shop } }),
        prisma.fixedCost.deleteMany({ where: { shop } }),
        prisma.storeLinkCode.deleteMany({ where: { createdBy: shop } }),
        prisma.metaLoginState.deleteMany({ where: { shop } }),
        prisma.session.deleteMany({ where: { shop } }),
        prisma.shopSettings.deleteMany({ where: { shop } }),
      ]);
      break;

    default:
      throw new Response("Ohanterad webhook", { status: 404 });
  }
  return new Response();
}
