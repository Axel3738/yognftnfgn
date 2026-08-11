/**
 * Hälsokontroll, avsiktligt oautentiserad. Låter oss verifiera utifrån vilken
 * build som kör och om databasen svarar — utan att gå via Shopify-inloggningen.
 * Innehåller inga hemligheter och ingen butiksdata.
 */

import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader() {
  let db = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    db = (e as Error).message;
  }
  return json({ ok: true, build: "billing-v7", db });
}
