/**
 * Integritetspolicy — offentlig, oautentiserad. App Store-listningen kräver en
 * publik URL; att servera den från appen själv slipper extern hosting.
 */
export default function Privacy() {
  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 720, margin: "6vh auto", padding: 16, lineHeight: 1.6 }}>
      <h1>Integritetspolicy / Privacy Policy — P&L</h1>
      <p><em>Senast uppdaterad: 2026-08-11</em></p>

      <h2>Vilken data appen läser</h2>
      <p>
        Appen läser ordersummor (belopp, rabatter, frakt, återbetalningar), orderrader
        (produkt, variant, antal), produktkatalogens inköpspriser samt butikens valuta och
        tidszon — enbart för att beräkna butikens lönsamhet. Appen läser inte kunduppgifter:
        inga namn, adresser, e-postadresser eller telefonnummer hämtas, visas eller lagras.
      </p>

      <h2>Vad som lagras</h2>
      <p>
        Aggregerade dagssummor per butik (försäljning, kostnader, annonsutgifter) och
        butikens inställningar (tull per order, avgiftssats, målmarginal). Rådata från
        ordrar cachas i högst 10 minuter. Annonsutgifter hämtas från Meta endast om
        handlaren själv anger en åtkomstnyckel, och kan raderas när som helst.
      </p>

      <h2>Delning</h2>
      <p>Ingen data säljs eller delas med tredje part. Ingen data lämnar appens server
      förutom anrop till Shopifys och Metas API:er på handlarens uppdrag.</p>

      <h2>Radering</h2>
      <p>
        Vid avinstallation raderas åtkomstnycklar omedelbart. Vid Shopifys
        shop/redact-webhook raderas all lagrad data för butiken permanent. Handlare kan
        begära radering när som helst via supportadressen.
      </p>

      <h2>Kontakt</h2>
      <p>Support: se listningen i Shopify App Store.</p>
    </main>
  );
}
