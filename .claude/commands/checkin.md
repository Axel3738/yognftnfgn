# /checkin – Daglig check-in per produkt

Argument: `$ARGUMENTS` — produkt-id.
Exempel: `/checkin motorholjet`

Kör daglig check-in för produkten. Allt gäller **Bäverbutiken / MagiBorsten `1867947880635861`**. Gör i ordning och redovisa varje steg:

## 1. Brief-kvoten (mål nr 1)
- Hämta aktuell daglig budget för produktens aktiva kampanjer via Ads Manager. Skiljer den sig från `products/products.json`: uppdatera filen och säg vad som ändrades.
- Kör `node pipeline/quota.mjs` och visa outputen. 🔴 EFTER plan: räkna ut exakt hur många briefer som måste levereras idag/imorgon för att komma ikapp, och lista vilka Notion-items som är närmast klara.

## 2. Redigerarnas läge (Slack + Notion)
- Slutrapporterna ligger i **`#rapporter`** i stonebite-workspacet (en per redigerare
  per dag, senast 21:30). Blockers och leveranslänkar ligger i produktens egen kanal.
- Läs meddelandena därifrån sedan igår. Kan Claude inte nå stonebite
  (`slack.connected: false` i `dashboard/data/team.json`): säg det rakt ut och be
  managern klistra in rapporterna via `/rapport` istället för att hoppa över steget.
- För varje rapporterat klar task: kör kontrollfrågorna. Allt OK → Notion-itemet till **Klar – Godkänd (grön)**. Något saknas → skriv Slack-svar som UTKAST (engelska) med exakt vad som saknas; skicka inte utan godkännande.

Kontrollfrågor per leverans:
1. Filnamn följer naming-strukturen exakt?
2. Exportformat kompletta (video 9:16 + 4:5 · bild 1:1 + 1080×1350)?
3. Svenska texter ord-för-ord från briefen?
4. Pris i annons = pris på landningssidan?
5. Produkt i bild före sekund 4 (video)?

## 3. Performance-larm
- Gårdagens siffror för produktens aktiva annonser, enligt `docs/os/ANALYSMETOD.md`.
- **Kill-kandidat:** ROAS under **`break_even_roas`** (eller CPA över `break_even_cpa_sek`) efter ≥500 kr spend. Under target-ROAS är INTE ett kill-skäl.
- **Skalningskandidat:** ROAS över `target_roas_25pct` med ≥3 köp.
- Ingen dom under 300 kr / 3 köp. Rangordna på vinstbidrag, aldrig på ROAS eller CPA ensamt — en top spender med lägre ROAS än en småannons är normalt och oftast din vinstmotor.

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
