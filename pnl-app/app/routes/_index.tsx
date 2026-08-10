/**
 * Rotrutten. Shopify admin laddar en embedded app på "/" med id_token i
 * query-strängen — panelen bor på /app. Utan den här omdirigeringen renderar
 * roten en tom sida (vitt) och tokenen följer aldrig med till /app.
 *
 * Hela query-strängen måste bevaras: id_token är det som låter /app byta till
 * sig en session utan en extra rundresa.
 */

import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    return redirect(`/app?${url.searchParams.toString()}`);
  }
  // Direktbesök utanför Shopify (ingen shop-parameter): visa installationssidan.
  return redirect("/auth/login");
}
