/**
 * Metas "Deauthorize Callback" — Facebook POSTar hit när en person tar bort
 * StonePNL under sina Facebook-inställningar.
 *
 * Token är då redan död hos Meta. Ligger den kvar hos oss visar panelen en
 * kopplad butik som tyst slutar få annonskostnad, och handlaren letar efter
 * felet på fel ställe. Kopplingen rensas därför direkt; butikens egna
 * siffror (försäljning, kostnader) rörs inte — bara Meta-delen.
 *
 * Ingen radering av annonsdata här: det här är "jag vill inte längre dela",
 * inte "radera det ni har". Det senare går genom /meta/deletion.
 */

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { META_TOMT, metaLoginConfig } from "../lib/meta-login.server";
import { glomMetaFel } from "../lib/meta.server";
import { lasSignedRequest, signedRequestUrKropp } from "../lib/meta-signed.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return json({ error: "method not allowed" }, { status: 405 });
  const cfg = metaLoginConfig();
  if (!cfg) return json({ error: "not configured" }, { status: 404 });

  const data = lasSignedRequest(await signedRequestUrKropp(request), cfg.appSecret);
  if (!data?.user_id) return json({ error: "bad signed_request" }, { status: 400 });

  const butiker = await prisma.shopSettings.findMany({
    where: { metaUserId: String(data.user_id) },
    select: { shop: true },
  });
  for (const b of butiker) {
    await prisma.shopSettings.update({ where: { shop: b.shop }, data: META_TOMT });
    glomMetaFel(b.shop);
  }
  console.log(`Meta-avkoppling: ${butiker.length} butik(er) kopplades bort av användaren.`);
  return json({ ok: true });
}
