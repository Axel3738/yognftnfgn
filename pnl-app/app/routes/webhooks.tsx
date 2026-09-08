import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, session } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      // Sessionen är redan ogiltig; städa så att en ominstallation börjar rent.
      if (session) await prisma.session.deleteMany({ where: { shop } });
      break;

    // GDPR-krav för App Store. Appen lagrar inga kundfält — LTV-underlaget
    // är kund-ID + orderdag + belopp, cachat högst sex timmar. Vid en
    // raderingsbegäran slängs cachen så kunden inte finns kvar ens där.
    case "CUSTOMERS_DATA_REQUEST":
      break;
    case "CUSTOMERS_REDACT":
      await prisma.pnlCache.deleteMany({ where: { shop, key: "ltv:all" } });
      break;

    case "SHOP_REDACT":
      await prisma.$transaction([
        prisma.dailySpend.deleteMany({ where: { shop } }),
        prisma.pnlCache.deleteMany({ where: { shop } }),
        prisma.fixedCost.deleteMany({ where: { shop } }),
        prisma.costChange.deleteMany({ where: { shop } }),
        prisma.shopSettings.deleteMany({ where: { shop } }),
      ]);
      break;

    default:
      throw new Response("Ohanterad webhook", { status: 404 });
  }
  return new Response();
}
