import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

/**
 * Integritetspolicy — offentlig, oautentiserad. App Store-listningen kräver en
 * publik URL; att servera den från appen själv slipper extern hosting.
 */
export async function loader() {
  /* Adressen bor i miljön, inte i repot — och saknas den faller sidan
     tillbaka på listningen i stället för att visa ett tomt "Support:". */
  return json({ supportEpost: process.env.SUPPORT_EMAIL?.trim() ?? "" });
}

export default function Privacy() {
  const { supportEpost } = useLoaderData<typeof loader>();
  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 720, margin: "6vh auto", padding: 16, lineHeight: 1.6 }}>
      <h1>Integritetspolicy / Privacy Policy — P&L</h1>
      <p><em>Senast uppdaterad: 2026-09-12</em></p>

      <h2>Vilken data appen läser</h2>
      <p>
        Appen läser ordersummor (belopp, rabatter, frakt, återbetalningar), orderrader
        (produkt, variant, antal), produktkatalogens inköpspriser samt butikens valuta och
        tidszon — för att beräkna butikens lönsamhet. För kundvärdesanalysen (LTV) läser
        appen även kund-ID per order, och lagrar det enbart som en nyckelhashad pseudonym
        tillsammans med orderns datum och belopp. Inga namn, adresser, e-postadresser eller
        telefonnummer efterfrågas, lagras eller visas. Pseudonymen används för att koppla
        ihop en kunds ordrar över tid; den kan inte vändas till kund-ID utan appens
        serverhemlighet och delas inte.
      </p>
      <p lang="en">
        <em>English:</em> The app reads order totals, line items, product costs and the
        store's currency and time zone to calculate profitability. For customer lifetime
        value (LTV) it also reads the customer ID per order and stores it only as a keyed
        hash (pseudonym) together with the order's date and amounts. No names, addresses,
        e-mail addresses or phone numbers are requested, stored or shown.
      </p>

      <h2>Vad som lagras</h2>
      <p>
        Aggregerade dagssummor per butik (försäljning, kostnader, annonsutgifter), en
        pseudonymiserad orderrad per order (kund-hash, datum, belopp, täckningsbidrag) och
        butikens inställningar (tull per order, avgiftssats, målmarginal). Rådata från
        ordrar cachas i högst 10 minuter. Annonsutgifter hämtas från Meta endast om
        handlaren själv kopplar sitt annonskonto, och kan raderas när som helst.
      </p>

      <h2>Delning</h2>
      <p>Ingen data säljs eller delas med tredje part. Ingen data lämnar appens server
      förutom anrop till Shopifys och Metas API:er på handlarens uppdrag.</p>

      {/* Metas App Review läser den här sidan och kräver att den säger exakt
          vad Facebook-inloggningen hämtar och hur en person raderar det.
          Engelska i samma stycke — granskaren läser inte svenska. */}
      <h2>Facebook / Meta</h2>
      <p>
        Kopplingen till Meta är frivillig och sker genom att handlaren själv loggar in med
        Facebook. Appen begär en enda behörighet, <code>ads_read</code>, och använder den för
        att en gång per dag läsa <strong>annonskostnad, visningar och klick per dag</strong>
        från det annonskonto handlaren väljer. Appen skapar, ändrar eller publicerar aldrig
        något i annonskontot, och läser varken målgrupper, kunddata eller annonsinnehåll.
        Det som lagras är: en krypterad åtkomstnyckel, Facebook-användarens app-specifika ID
        och namn (för att visa vem som är kopplad) samt dagssummorna ovan. Siffrorna visas
        bara för den butik som kopplade kontot och delas inte med någon.
      </p>
      <p lang="en">
        <em>English:</em> Connecting Meta is optional and done by the merchant logging in with
        Facebook. The app requests one permission, <code>ads_read</code>, and uses it to read
        the merchant's own <strong>ad spend, impressions and clicks per day</strong> from the
        ad account they choose, once a day. The app never creates, changes or publishes
        anything in the ad account and does not read audiences, customer data or ad creative.
        Stored: an encrypted access token, the Facebook user's app-scoped ID and name, and the
        daily totals above. The figures are shown only to the store that connected the account
        and are never shared or sold.
      </p>
      <p lang="en">
        <em>Deleting it:</em> disconnect under Settings in the app, or remove StonePNL under
        your Facebook settings (Settings &amp; privacy → Settings → Apps and websites) — the
        connection is then removed automatically. A deletion request sent through Facebook
        deletes the access token, the Facebook user ID and name, and the ad spend read with
        that token, and returns a status link you can open at any time.
      </p>

      <h2>Radering</h2>
      <p>
        Vid avinstallation raderas åtkomstnycklar omedelbart. Vid Shopifys
        shop/redact-webhook raderas all lagrad data för butiken permanent, och vid
        customers/redact raderas den kundens pseudonymiserade orderrader. Handlare och
        kunder kan begära radering eller utlämning när som helst via supportadressen.
      </p>

      <h2>Kontakt</h2>
      {/* Metas granskning kräver en adress som går att skriva till. Den sätts
          med SUPPORT_EMAIL i miljön så att den inte behöver ligga i repot. */}
      <p>
        Support:{" "}
        {supportEpost ? <a href={`mailto:${supportEpost}`}>{supportEpost}</a> : "se listningen i Shopify App Store"}.
      </p>
    </main>
  );
}
