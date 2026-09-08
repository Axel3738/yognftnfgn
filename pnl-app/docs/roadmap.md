# Roadmap — PNL-appen efter App Store-lanseringen

> ⚠️ **Fel gren.** Den här filen och koden runt den skrevs 2026-09-08 mot
> `main`-kopian av `pnl-app/`, som är en gammal snapshot. Den riktiga appen
> (StonePNL) ligger på `claude/bäverbutiken-settkopplingen-nba21z` och hade
> redan Meta-inloggning och växelkurs per dag. Det som är nytt härifrån
> (LTV-motorn, kolumnigenkänningen i importen) portas dit. Läs den grenens
> `pnl-app/CLAUDE.md` och `docs/ltv-tillagg.md` i stället för det här.

Axels önskelista, skickad 2026-09-08. Appen är **publicerad på Shopify App
Store** — checklistan i `app-store.md` är avklarad. Status per punkt nedan;
Axels egna klick står i `axel-klick.md`.

## Läget i koden 2026-09-08 (mätt, inte gissat)

Före dagens bygge fanns ingen växelkurs alls, Meta kopplades bara med
inklistrad token, en enda betalplan, och COGS-importen krävde exakt formatet
`produkttitel;varianttitel;kostnad`. Allt fyra är byggt i dag (commit-serien
på `claude/stonepnl-overview-development-zh06uw`), typecheck grön, bygget
grönt, 13 enhetstester gröna.

## 1. Meta-knapp (OAuth) — ✅ byggd, väntar på Meta-app

| Del | Status |
|---|---|
| Koden: `Koppla Meta` → Facebook-inloggning → long-lived token → välj annonskonto ur lista | ✅ `app/routes/app.meta.connect.tsx`, `meta.callback.tsx`, `lib/meta.server.ts` |
| Utgångsvarning (token ≈ 60 dagar), "Koppla om", "Koppla bort" | ✅ Inställningar |
| Token-fältet finns kvar (hopfällt) för den som hellre klistrar in | ✅ |
| Meta-app + env `META_APP_ID`/`META_APP_SECRET` | 🖐 Axel, `axel-klick.md` steg 1 |
| Meta App Review för externa handlare | 🖐 Axel, steg 3 — 2–6 veckor |

Utan env-variablerna är knappen dold och appen beter sig exakt som förut.

## 2. Live växelkurs, dagligen — ✅ byggd

- Spend sparas i **annonskontots** valuta (`DailySpend.currency`, läses ur
  Metas `account_currency`) och räknas om till butikens valuta **dag för dag**
  med ECB:s dagskurs via Frankfurter. Kurser cachas i `FxRate`; dagens och
  gårdagens sparas inte (ECB publicerar ~16:00 CET) utan hämtas på nytt.
- Butikens valuta läses från Shopify vid varje laddning, inte ur en default.
- Dag utan kurs → dagen rapporteras som **saknad annonskostnad**, aldrig som
  noll. Panelen visar "Annonskostnad (från NOK)" och kursspannet + kursdatum.
- Inte gjort: butiker som säljer i flera valutor via Shopify Markets. Vi läser
  `shopMoney` överallt, så beloppen är redan i butiksvaluta — inget att räkna
  om. Det som saknas är en vy per marknad; kräver `presentmentMoney` +
  marknadsfältet per order. Byggs när någon ber om det.

## 3. COGS-överföring från Juicy (max 3 klick) — ✅ byggd

Sidan **Flytta hit** (`app/routes/app.import.tsx`), tre steg:

1. **Kollen** — hur många varianter har redan inköpspris i Shopifys
   `unitCost`? Är allt ifyllt (appen skrev till Shopify, eller Shopify
   självt) står det "Klart — inget att flytta". Noll klick.
2. **Filen** — släpp exporten eller klistra in. Tolken
   (`lib/cost-import.server.ts`, 7 tester) hittar avgränsare och kolumner
   själv: variant-ID, SKU, produkt, variant, kostnad — engelska eller
   svenska rubriker, komma- eller punktdecimal, valutasymboler.
   Matchning variant-ID → SKU → titel, aldrig närmaste likhet.
3. **Skrivningen** — förhandsgranskning med "matchad via" per rad, sedan en
   knapp. Kostnaderna hamnar i Shopifys `unitCost` = butikens egendom.

Kom igång-checklistan och Kostnader-sidan pekar hit när inköpspriser saknas.

**Öppen fråga att mäta:** exakt vilka kolumnrubriker Juicys export har.
Sajten går inte att nå från byggcontainern. Tolken täcker de vanliga
(`Product`, `Variant`, `SKU`, `Variant ID`, `Cost`/`COGS`/`Unit cost`); har
Juicy en avvikande rubrik läggs den till i `NAMES` i tolken — en rad.

## 4. LTV-prognos som tilläggsplan (+5 USD/mån) — ✅ byggd, väntar på scopes

- Plan `Standard + LTV` 14,99 USD/mån (7 dagars prov) i `shopify.server.ts`.
  Sidan **Kundvärde (LTV)** visar en säljsida med knappen "Lägg till för
  5 USD/mån" tills planen är aktiv; egna butiker (`BILLING_EXEMPT_SHOPS`)
  och custom-deployments ser den direkt.
- Räknemotorn `lib/ltv.server.ts` (6 tester): kohort = första köpmånad,
  ackumulerad nettointäkt per kund månad 0–12, återköpsgrad, ordrar/kund.
  Prognos genom **kurvstapling** ur butikens egna äldre kohorter — inga
  branschsnitt, ingen kurvanpassning. Kohorter < 30 kunder märks "för lite
  data" och påverkar inte prognosen. Saknas underlag visas "—", aldrig en
  siffra. Kurvan får aldrig sjunka.
- Underlag: alla ordrar med kund-ID via bulk-export, cachat 6 h. Vid
  `customers/redact` slängs cachen.
- Kräver scopes `read_customers` + `read_all_orders` och Protected Customer
  Data nivå 1 → 🖐 Axel, `axel-klick.md` steg 2. Utan dem visar sidan felet i
  klartext med vad som ska godkännas.
- Nästa steg när datan finns: max-CPA räknad på kundvärde i stället för
  första ordern (motorn har allt som behövs — `ltv12 × marginal`).
