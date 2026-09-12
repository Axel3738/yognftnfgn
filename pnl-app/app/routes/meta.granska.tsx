/**
 * `/meta/granska` — ingången för Metas granskare. All HTML och logik ligger i
 * `lib/meta-granska.server.ts`; två rutter ska inte importera varandra.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { metaLoginConfig, skapaInloggning } from "../lib/meta-login.server";
import {
  GRANSKNING,
  granskningSaknasSida,
  granskningsNyckel,
  granskningsStartsida,
} from "../lib/meta-granska.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const nyckel = granskningsNyckel();
  const url = new URL(request.url);
  /* Utan nyckel i miljön finns sidan inte alls, och fel nyckel ser likadant
     ut som ingen sida — en granskningsingång ska inte gå att hitta genom att
     prova sig fram. */
  if (!nyckel || url.searchParams.get("key") !== nyckel) {
    return new Response("Not Found", { status: 404 });
  }
  if (!metaLoginConfig()) return granskningSaknasSida();

  /* Skicka granskaren in i samma OAuth-runda som en handlare. */
  if (url.searchParams.get("start") === "1") {
    return redirect(await skapaInloggning(`review:${url.hostname}`, GRANSKNING));
  }
  return granskningsStartsida(nyckel);
}
