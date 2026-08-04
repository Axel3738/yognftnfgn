# P5 – Logga launchade creatives

**När:** Varje gång nya annonser faktiskt launchas i Ads Manager (inte när briefen skrivs – när annonsen är live/schemalagd).
**Hur:** Fyll i, klistra in i valfri Claude Code-session i detta repo.

---

Vi har launchat nya creatives för **[PRODUKTNAMN]**: **[ANTAL]** stycken, launchade **[DATUM eller "idag"]**.

Gör följande:

1. Verifiera mot Ads Manager (MCP) att annonserna faktiskt finns i kontot (aktiva eller schemalagda). Lista deras namn och kontrollera att de följer naming-strukturen.
2. Logga dem: `node pipeline/quota.mjs log [produkt-id] [antal]`
3. Kör `node pipeline/quota.mjs` och visa plus/minus-läget.
4. Committa och pusha ändringen i `products/products.json` med meddelande "Logga N creatives för [produkt]".

## DEFINITION OF DONE

- [ ] Annonserna verifierade i Ads Manager (inte bara tagna på ordet)
- [ ] Antalet loggat i kvotskriptet
- [ ] Nytt plus/minus-läge visat
- [ ] Ändringen pushad till repot
