/**
 * Installations-/inloggningssidan.
 *
 * Catch-all-rutten (auth.$) hanterar bara OAuth-callbacks — ett anrop till
 * /auth/login?shop=... svarade 410 eftersom ingen rutt fanns. Den här startar
 * installationen: med ?shop= i URL:en redirectar login() direkt till Shopifys
 * godkännandesida; utan visas ett formulär där man anger butiksdomänen.
 */

import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { login } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Med ?shop= kastar login() en redirect till OAuth — annars faller vi igenom
  // till formuläret nedan.
  const errors = await login(request);
  return json({ errors });
}

export async function action({ request }: ActionFunctionArgs) {
  const errors = await login(request);
  return json({ errors });
}

export default function Login() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const errors = actionData?.errors ?? loaderData?.errors ?? {};

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 420, margin: "10vh auto", padding: 16 }}>
      <h1 style={{ fontSize: 20 }}>Installera P&L</h1>
      <p style={{ color: "#555" }}>
        Ange butikens .myshopify.com-domän så skickas du till Shopifys godkännandesida.
      </p>
      <Form method="post">
        <label style={{ display: "block", marginBottom: 8 }}>
          Butiksdomän
          <input
            type="text"
            name="shop"
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            placeholder="min-butik.myshopify.com"
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
        {(errors as { shop?: string }).shop ? (
          <p style={{ color: "#b00" }}>{(errors as { shop?: string }).shop}</p>
        ) : null}
        <button type="submit" style={{ padding: "8px 16px" }}>
          Installera
        </button>
      </Form>
    </main>
  );
}
