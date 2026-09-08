/**
 * Integritetspolicy — offentlig, oautentiserad. App Store-listningen kräver en
 * publik URL; att servera den från appen själv slipper extern hosting.
 */
export default function Privacy() {
  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 720, margin: "6vh auto", padding: 16, lineHeight: 1.6 }}>
      <h1>Integritetspolicy / Privacy Policy — P&L</h1>
      <p><em>Senast uppdaterad: 2026-09-08</em></p>

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

      <h2>Radering</h2>
      <p>
        Vid avinstallation raderas åtkomstnycklar omedelbart. Vid Shopifys
        shop/redact-webhook raderas all lagrad data för butiken permanent, och vid
        customers/redact raderas den kundens pseudonymiserade orderrader. Handlare och
        kunder kan begära radering eller utlämning när som helst via supportadressen.
      </p>

      <h2>Kontakt</h2>
      <p>Support: se listningen i Shopify App Store.</p>
    </main>
  );
}
