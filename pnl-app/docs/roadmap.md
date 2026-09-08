# Roadmap — PNL-appen efter App Store-lanseringen

Axels önskelista, skickad 2026-09-08 (ordagrant i andemening, sorterad).
Appen är **publicerad på Shopify App Store** — checklistan i `app-store.md`
är avklarad. Det här är vad som byggs härnäst.

## Läget i koden 2026-09-08 (mätt, inte gissat)

- **Ingen växelkurs finns.** Panelen visar allt i butikens valuta
  (`shop.currencyCode`). Meta-spend hämtas rakt från annonskontot utan
  omräkning — ett NOK-annonskonto mot en SEK-butik summeras alltså fel.
  Det finns en färdig ECB-hämtare i `commission/valuta.mjs` (dagskurs,
  cachad per dygn) att porta.
- **Meta kopplas med inklistrad long-lived token** (Inställningar). Ingen
  OAuth-knapp.
- Billing: 9,99 USD/mån via Shopify Billing API, en plan (`STANDARD_PLAN`).
  Ingen tilläggsplan ännu.

## 1. Meta-knapp (OAuth) i stället för inklistrad token

Två delar, olika tidsskalor:

| Del | Tid | Vem |
|---|---|---|
| Koden: Facebook Login → välj annonskonto → spara token per butik, förnya automatiskt | ~1 arbetsdag | Claude |
| Meta App Review för `ads_read` (Advanced Access) + företagsverifiering | 2–6 veckor, kan avslås | Axel klickar, Claude skriver texterna + screencast-manus |

Utan godkänd review fungerar knappen bara för konton med roll i Meta-appen
(Axel själv). Därför: **videoinstruktion för token-vägen nu**, knappen byggs
och skickas till review parallellt. Videon blir inte bortkastad — den
behövs som screencast i review-ansökan.

## 2. Live växelkurs, uppdateras dagligen

- Kurs per dygn från ECB (samma källa som commission-leaderboarden).
- Meta-spend räknas om från annonskontots valuta till butikens valuta
  per dag med den dagens kurs. Kursdatum visas i panelen.
- Butiker som säljer i flera valutor (Shopify Markets): orderbelopp finns
  redan i butiksvaluta via `presentmentMoney`/`shopMoney` — verifiera att
  vi läser `shopMoney`.

## 3. COGS-överföring från Juicy (max 3 klick)

Mål: en handlare som redan använder Juicy ska få in alla sina inköpspriser
utan manuellt arbete.

- Först att mäta: **skriver Juicy till Shopifys `unitCost`?** Gör den det
  läser vår app redan allt, noll klick — då är verktyget en "Hittade N
  inköpspriser, klart"-ruta.
- Annars: importera Juicys CSV-export (befintlig CSV-import i Kostnader-
  fliken, plus en mappning av Juicys kolumnnamn) och skriv till `unitCost`
  så datan blir butikens egen.
- Onboardingen ska kännas som en flytt, inte en installation:
  "Kommer du från Juicy?" som första fråga i Kom igång-checklistan.

## 4. LTV-prognos som tilläggsplan (+5 USD/mån)

- Andra plan i Billing (`PREMIUM_PLAN`), låses upp i panelen.
- Räknar kundens livstidsvärde per kohort (första köpmånad): återköpsgrad,
  tid till andra köp, prognos 90/180/365 dagar.
- Kräver ordrar äldre än 60 dagar → scope `read_all_orders` måste sökas.
- Kräver kund-ID per order (bara ID:t, inga namn/adresser) → uppdatera
  Protected Customer Data-ansökan innan koden skrivs.
- Ska vara låst på riktig data: kohorter med för få kunder visas som
  "för lite data", aldrig som en siffra.
