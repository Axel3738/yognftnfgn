# /checkin – Daglig check-in per produkt

Argument: `$ARGUMENTS` — produkt-id.
Exempel: `/checkin motorholjet`

Kör daglig check-in för produkten. Allt gäller **Bäverbutiken / MagiBorsten `1867947880635861`**. Gör i ordning och redovisa varje steg:

## 1. Brief-kvoten (mål nr 1)
- Hämta aktuell daglig budget för produktens aktiva kampanjer via Ads Manager. Skiljer den sig från `products/products.json`: uppdatera filen och säg vad som ändrades.
- Kör `node pipeline/quota.mjs` och visa outputen. 🔴 EFTER plan: räkna ut exakt hur många briefer som måste levereras idag/imorgon för att komma ikapp, och lista vilka Notion-items som är närmast klara.

## 2. Redigerarnas läge (Slack + Notion)
- Läs senaste meddelandena i redigerarnas Slack-kanal(er) sedan igår.
- För varje rapporterat klar task: kör kontrollfrågorna. Allt OK → Notion-itemet till **Klar – Godkänd (grön)**. Något saknas → skriv Slack-svar som UTKAST (engelska) med exakt vad som saknas; skicka inte utan godkännande.

Kontrollfrågor per leverans:
1. Filnamn följer naming-strukturen exakt?
2. Exportformat kompletta (video 9:16 + 4:5 · bild 1:1 + 1080×1350)?
3. Svenska texter ord-för-ord från briefen?
4. Pris i annons = pris på landningssidan?
5. Produkt i bild före sekund 4 (video)?

## 3. Performance-larm
- Gårdagens siffror för produktens aktiva annonser. Flagga: CPA >2× target med >500 kr spend (kill-kandidat), CPA under target med ≥3 köp (skalningskandidat). Ingen dom under 300 kr / 3 köp.

## 4. UGC-läget
- UGC-databasen i Notion (se `docs/os/SOP-03-ugc-pipeline.md`): deadlines passerade? Lista med antal dagar försenade.

## 5. Sammanfattning
Tabell: Produkt · Kvotläge (+/−) · Godkända tasks · Underkända · Performance-larm · UGC-förseningar. Grönmarkera dagen (✅) bara om kvotläget ≥ 0 OCH inga obehandlade underkännanden.

## DEFINITION OF DONE
- [ ] Kvot körd med färsk budget
- [ ] Alla "klar"-rapporter kontrollfrågade
- [ ] Notion uppdaterat för godkända
- [ ] Slack-utkast skrivna (ej skickade)
- [ ] Sammanfattningstabell med ✅/❌
