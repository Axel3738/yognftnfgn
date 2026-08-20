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

    // GDPR-krav för App Store. Appen lagrar ingen kunddata — bara aggregerad
    // försäljning per dag — så det finns inget att lämna ut eller radera.
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
      break;

    case "SHOP_REDACT":
      await prisma.$transaction([
        prisma.dailySpend.deleteMany({ where: { shop } }),
        prisma.costChange.deleteMany({ where: { shop } }),
        prisma.shopSettings.deleteMany({ where: { shop } }),
      ]);
      break;

    default:
      throw new Response("Ohanterad webhook", { status: 404 });
  }
  return new Response();
}
