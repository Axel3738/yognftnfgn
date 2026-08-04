# P4 – Daglig check-in (körs VARJE dag, per produkt)

**När:** Varje morgon, en gång per aktiv produkt. Tar ~5 min av managerns tid.
**Hur:** Fyll i produktnamnet, klistra in allt under strecket i en ny Claude Code-session i detta repo.

---

Kör daglig check-in för produkten **[PRODUKTNAMN]**. Gör följande i ordning och redovisa varje steg:

## 1. Brief-kvoten (mål nr 1)

- Hämta aktuell daglig budget för produktens aktiva kampanjer via Ads Manager (MCP).
- Om budgeten skiljer sig från `products/products.json`: uppdatera filen och säg vad som ändrades.
- Kör `node pipeline/quota.mjs` och visa outputen. Ligger vi 🔴 EFTER plan: räkna ut exakt hur många briefer som måste levereras idag och imorgon för att komma ikapp, och lista vilka briefer i Notion som är närmast klara.

## 2. Redigerarnas läge (Slack + Notion)

- Läs de senaste meddelandena i redigerarnas Slack-kanal(er) sedan igår.
- För varje redigerare som rapporterat en klar task: ställ kontrollfrågorna nedan mot det de levererat. Om allt stämmer → uppdatera Notion-itemet till **Klar – Godkänd (grön)**. Om något saknas → skriv ett utkast på ett Slack-svar (på engelska) som säger exakt vad som saknas, och låt mig godkänna innan det skickas.

Kontrollfrågor per leverans:
1. Följer filnamnet naming-strukturen exakt?
2. Är exportformaten kompletta (video: 9:16 + 4:5 · bild: 1:1 + 1080×1350)?
3. Är alla svenska texter/captions tagna ord-för-ord från briefen (inga egna översättningar)?
4. Stämmer priset i annonsen med landningssidan?
5. Är produkten i bild före sekund 4 (video)?

## 3. Performance-larm

- Hämta gårdagens siffror för produktens aktiva annonser. Flagga: annonser över 2× target-CPA med >500 kr spend (kill-kandidater), och annonser under target-CPA med >3 köp (skalnings-kandidater). Ingen dom under 300 kr / 3 köp.

## 4. UGC-läget

- Läs UGC-databasen i Notion (se `docs/os/SOP-03-ugc-pipeline.md`): finns leveranser som passerat deadline? Lista dem med antal dagar försenade.

## 5. Sammanfattning

Avsluta med en tabell: Produkt · Kvotläge (+/−) · Tasks godkända idag · Tasks underkända · Performance-larm · UGC-förseningar. Grönmarkera dagen (✅) bara om kvotläget är 0 eller plus OCH inga obehandlade underkännanden finns.

## DEFINITION OF DONE

- [ ] Kvotskriptet kört med FÄRSK budget från Ads Manager
- [ ] Varje "klar"-rapport i Slack har fått kontrollfrågorna körda
- [ ] Notion uppdaterat för godkända tasks
- [ ] Slack-svar för underkända tasks skrivna som utkast (inte skickade utan godkännande)
- [ ] Sammanfattningstabellen levererad med ✅ eller ❌ för dagen
