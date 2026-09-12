/**
 * Metas "Data Deletion Request Callback" — obligatorisk för en app som
 * använder Facebook-inloggning i Live-läge, och därmed en av sakerna som
 * står mellan StonePNL och en inloggning som fungerar för andra än oss.
 *
 * Facebook POSTar hit med ett `signed_request` när en person begär att få
 * sin data raderad. Vi måste (1) radera det vi har om personen, (2) svara
 * med JSON `{ url, confirmation_code }` där url:en visar status. GET på
 * samma adress är den statussidan.
 *
 * Vad vi faktiskt har om personen: den krypterade Meta-token, deras
 * app-scoped id och namn — plus annonskostnaden som hämtats MED den token.
 * Allt går. Det är samma sak som knappen "Koppla bort" i Inställningar gör,
 * och hellre för mycket än att behålla något vi blivit ombedda att radera.
 *
 * Resursrutt utan Shopify-auth: signaturen är hela skyddet.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createHash, randomBytes } from "node:crypto";
import prisma from "../db.server";
import { META_TOMT, metaLoginConfig } from "../lib/meta-login.server";
import { glomMetaFel } from "../lib/meta.server";
import { lasSignedRequest, signedRequestUrKropp } from "../lib/meta-signed.server";
import { metaLoginSida } from "../lib/meta-login-sida.server";
import { t } from "../lib/texts";

/** Statussidans adress — den Meta visar för användaren. */
const statusUrl = (code: string) =>
  `${process.env.SHOPIFY_APP_URL}/meta/deletion?id=${encodeURIComponent(code)}`;

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return json({ error: "method not allowed" }, { status: 405 });
  const cfg = metaLoginConfig();
  if (!cfg) return json({ error: "not configured" }, { status: 404 });

  const data = lasSignedRequest(await signedRequestUrKropp(request), cfg.appSecret);
  /* Fel eller saknad signatur: 400 utan att säga vilket av felen det var. */
  if (!data?.user_id) return json({ error: "bad signed_request" }, { status: 400 });
  const metaUserId = String(data.user_id);

  /* Koden är slumpad, inte härledd ur användar-id:t — statussidan är öppen,
     och ett gissningsbart id hade avslöjat att en viss person finns här. */
  const code = randomBytes(12).toString("hex");
  const requestedAt = new Date();

  try {
    const butiker = await prisma.shopSettings.findMany({
      where: { metaUserId },
      select: { shop: true },
    });
    for (const b of butiker) {
      await prisma.shopSettings.update({ where: { shop: b.shop }, data: META_TOMT });
      await prisma.dailySpend.deleteMany({ where: { shop: b.shop } });
      glomMetaFel(b.shop);
    }
    await prisma.metaDeletion.create({
      data: {
        code,
        /* Bara en hash av användar-id:t sparas: kvittot ska bevisa att
           raderingen skett, inte återinföra det vi just raderade. */
        userHash: createHash("sha256").update(metaUserId).digest("hex"),
        shops: butiker.length,
        requestedAt,
        completedAt: new Date(),
      },
    });
    console.log(`Meta-raderingsbegäran ${code}: ${butiker.length} butik(er) frånkopplade.`);
  } catch (e) {
    console.error(`Meta-raderingsbegäran ${code} misslyckades:`, e);
    /* Meta ska veta att det INTE gick. Koden pekar på en statussida som
       säger samma sak, i stället för att tyst påstå att allt är klart. */
    await prisma.metaDeletion
      .create({ data: { code, userHash: "", shops: 0, requestedAt } })
      .catch(() => {});
    return json({ url: statusUrl(code), confirmation_code: code }, { status: 500 });
  }

  return json({ url: statusUrl(code), confirmation_code: code });
}

/** Statussidan. Öppen med flit — Meta visar adressen för användaren. */
export async function loader({ request }: LoaderFunctionArgs) {
  const T = t("en");
  const code = new URL(request.url).searchParams.get("id") ?? "";
  const rad = code ? await prisma.metaDeletion.findUnique({ where: { code } }) : null;
  if (!rad) {
    return metaLoginSida("en", { title: T.deletion.unknownTitle, body: T.deletion.unknownBody, status: 404 });
  }
  return metaLoginSida("en", {
    title: rad.completedAt ? T.deletion.doneTitle : T.deletion.pendingTitle,
    body: rad.completedAt
      ? T.deletion.doneBody(rad.completedAt.toISOString().slice(0, 10), rad.shops)
      : T.deletion.pendingBody,
  });
}
