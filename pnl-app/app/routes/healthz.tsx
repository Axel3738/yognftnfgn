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
  /* `build` sätts för hand och säger VAD som skulle ut. `commit` sätts av
     Railway och säger vad som FAKTISKT kör — utan den gick det inte att
     skilja "deployen har inte gått igenom" från "någon glömde bumpa
     märket". 2026-09-22 stod bygget stilla i en halvtimme och det var
     precis den frågan som inte gick att svara på. */
  const commit = (process.env.RAILWAY_GIT_COMMIT_SHA ?? "").slice(0, 7);
  return json({ ok: true, build: "marknadsoversikt-v116", commit, db });
}
