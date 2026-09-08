import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { decrypt, kundHash } from "../lib/crypto.server";
import { aterkallaToken, farAterkallas, META_TOMT } from "../lib/meta-login.server";

export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, session, payload } = await authenticate.webhook(request);

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
      const token = s?.metaAccessToken && s.metaTokenSource === "login" ? decrypt(s.metaAccessToken) : null;
      const aterkalla = token ? await farAterkallas(shop, s!.metaUserId) : false;
      /* Cachad annonskostnad hör till annonskontot: nollas kontot ska cachen
         bort — annars serveras det gamla kontots dagar under nästa konto
         efter en ominstallation. Allt i en transaktion, inom webhookens
         fem sekunder. */
      await prisma.$transaction([
        ...(s?.metaAccessToken ? [prisma.shopSettings.update({ where: { shop }, data: META_TOMT })] : []),
        prisma.dailySpend.deleteMany({ where: { shop } }),
        prisma.metaLoginState.deleteMany({ where: { shop } }),
      ]);
      if (token && aterkalla) void aterkallaToken(token, 3_000);
      break;
    }

    /* GDPR-krav för App Store. Det enda kundrelaterade appen håller är
       KundOrder: en HMAC-pseudonym per order med dag och belopp. Vid en
       begäran om utlämning loggas den (hashat, aldrig klartext-id) — svaret
       går via supportadressen inom Shopifys 30 dagar. */
    case "CUSTOMERS_DATA_REQUEST": {
      const p = payload as any;
      const hash = kundHash(shop, p?.customer?.id != null ? `gid://shopify/Customer/${p.customer.id}` : null);
      console.log(`customers/data_request från ${shop} ${new Date().toISOString()} kund=${hash ?? "(okänd)"}`);
      break;
    }
    /* Radering: kundens rader via pseudonymen (det är därför hashen är en
       HMAC och inte ren SHA — vi kan hitta raderna när Shopify ber oss, men
       inte själva peka ut personen), plus de order-ID Shopify räknar upp. */
    case "CUSTOMERS_REDACT": {
      const p = payload as any;
      const hash = kundHash(shop, p?.customer?.id != null ? `gid://shopify/Customer/${p.customer.id}` : null);
      const orderIds: string[] = (p?.orders_to_redact ?? []).map((id: unknown) => `gid://shopify/Order/${id}`);
      await prisma.$transaction([
        ...(hash ? [prisma.kundOrder.deleteMany({ where: { shop, kundHash: hash } })] : []),
        ...(orderIds.length ? [prisma.kundOrder.deleteMany({ where: { shop, orderId: { in: orderIds } } })] : []),
      ]);
      break;
    }

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
        prisma.kundOrder.deleteMany({ where: { shop } }),
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
