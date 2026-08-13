# Mexiko (GrillForge Co) — STATUS

**Butik:** grillforgeco.com (Shop-plan, basvaluta USD, ägs sedan tidigare — innehåller
Axels gamla FR/USA-experiment: 6 produkter, shrine som live-tema. Dessa RÖRS INTE.)
**Källa:** Grillkliniken (grillkliniken.se) — full export i `../grillkliniken/source-export/`
**Startad:** 2026-08-13

## Parametrar (defaults — Axel har inte bekräftat än, FLAGGADE)

| Parameter | Värde | Status |
|---|---|---|
| Brand | **GrillForge Co** (matchar domänen) | ⚠️ default, ej bekräftad |
| Språk | mexikansk spanska (es-MX) | ok |
| Valuta | MXN via egen marknad, bas USD | ok |
| Prisregel | **SEK × 1,9 → närmaste …9 uppåt** (199→379, 299→569, 349→669) | ⚠️ default, ej bekräftad |
| Bolag i sidfot | STONEBITE ECOM AB | ok |
| Konsumentlag | LFPC/PROFECO, 5 arbetsdagars ångerrätt (butiken lovar 30 d öppet köp) | till sidfas |
| Moms | IVA 16 % ingår i priset | ok |

## Fas 1 — människans checklista
- [x] Butik kopplad (grillforgeco.com)
- [x] Grillklinikens temazip uppladdad (id 196491477332 "theme-export-grillkliniken-se-wetransfer-theme", OPUBLICERAD ✓)
- [ ] ⚠️ **Judge.me + Kaching Bundles installerade?** — kan inte verifieras via API (appInstallations nekas). AXEL: bekräfta/installera.
- [ ] ⚠️ Butikens språk → Spanska i Settings → Languages (API kan inte byta primärspråk)

## Gjort
- [x] Fas 0+2: mx/build-infra, 7 batchar à 6 produkter med MXN-priser förberäknade
- [x] Fas 3 STARTAD: 7 översättningsagenter → es-MX (pågår)
- [x] Fas 4.1: 4 befintliga (franska) kollektioner återanvända → spanska:
  frontpage="Página principal" (691005849940), herramientas-para-asador (712480915796),
  delantales (712481046868), cuchillos-y-tablas (712481177940)

## Nycklar
- Location: gid://shopify/Location/113005527380 (sjöhed 160)
- Publication Webbshop: gid://shopify/Publication/310433808724
- Marknader: Frankrike (EUR), "sver", Usa (USD) — Mexiko SAKNAS, skapas i fas 5
- Tema att bygga på: gid://shopify/OnlineStoreTheme/196491477332

## Kvar
- [x] Fas 3: KLAR — 42/42 produkter es-MX, 15 juridiska flaggor (se build/out/*.es.json)
      Patchat i JSONL: "Por 1399 kr"→"Por $2,659 MXN" (aa), EU-lagpåstående struket (elektrisk-grillborste)
- [~] Fas 4: produktpush PÅGÅR (chunk 0,2,3 via agenter; chunk 1 blockerad av klassificeraren — skickas till färdig agent). Kvar: kanalpublicering, kollektionsbilder, sidor, menyer
- [x] Fas 5: KLAR — Market México (gid://shopify/Market/116428079444), MXN, manuell kurs 1.0, moms i priset. OBS: unified markets → marketUpdate med currencySettings, INTE marketCurrencySettingsUpdate
- [x] Fas 6: México-zon skapad i Allmän profil med 'Envío gratis' 0 (alla andra zoner var redan 0). Grind (draftOrderCalculate) körs när produkterna är inne
- [ ] Fas 7: tema — upsert 464 filer från exporten + ÖVERSÄTT temafilerna (GemPages-sektionerna innehåller svensk säljtext!)
- [ ] Fas 8: Judge.me-recensioner på es-MX
- [ ] Fas 9: sanningskontroll (fri frakt-löften vs verklig fraktzon, betalmetoder)

## ⚠️ Särskilda MX-fällor
1. Basvalutan är USD och USA-marknaden är AKTIV — produkter med MXN-belopp (t.ex. "379")
   skulle visas som $379 USD för USA-besökare. Flagga till Axel: inaktivera USA- och
   Frankrike-marknaderna, eller begränsa produkterna per marknad.
2. De 6 gamla FR/EN-produkterna är ACTIVE — de dyker upp i sök/kollektioner om de inte
   arkiveras. Axel har inte svarat på vad vi gör med dem.
3. Temat på live (shrine) är INTE Grillklinikens tema — publicering av det nya temat är
   ett manuellt Axel-steg när allt är klart.
