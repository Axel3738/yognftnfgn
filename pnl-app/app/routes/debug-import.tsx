/**
 * TILLFÄLLIG importrutt. Tas bort när flerpackspriserna är inlagda.
 *
 * Kör samma kostnadsimport som Kostnader-sidan, fast med butikens sparade
 * offline-nyckel — så att alla fem butiker kan fyllas från ett ställe utan
 * att någon öppnar deras admin. Nyckelskyddad, bara POST, ingen kunddata.
 */

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { adminFromToken, giltigToken } from "../lib/daily.server";
import { importCostCsv } from "../lib/cost-import.server";
import { asLang, t } from "../lib/texts";

const NYCKEL = "imp-Xq7vR2mN9-tillfallig";

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  if (String(form.get("key")) !== NYCKEL) throw new Response("Not found", { status: 404 });
  const shop = String(form.get("shop") ?? "");
  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(shop)) return json({ error: "shop" }, { status: 400 });

  const token = await giltigToken(shop);
  if (!token) return json({ error: "ingen nyckel för butiken" }, { status: 400 });
  const settings = await prisma.shopSettings.findUnique({ where: { shop } });
  const T = t(asLang(settings?.language));
  const csv = String(form.get("csv") ?? "").replace(/^﻿/, "");

  const res = await importCostCsv(adminFromToken(shop, token), shop, prisma, csv, "", T);
  return json(res);
}
