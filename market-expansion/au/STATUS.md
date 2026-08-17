# Australien (The BBQ Clinic) — STATUS

**Butik:** grillklinikken.dk (Basic, basvaluta DKK — fd. danska Grillklinikken, RENSAD 2026-08-15
på Axels order: 30 produkter + 4 kollektioner + 4 sidor raderade. 132 ordrar ORÖRDA i historiken.)
**Källa:** Grillkliniken SE — full export i `../grillkliniken/source-export/`

## Parametrar (Axel-bekräftade via AskUserQuestion 2026-08-15)
| Parameter | Värde |
|---|---|
| Brand | **The BBQ Clinic** ✅ |
| Språk | australisk engelska (en-AU) — REGEL: grill=ugnsgrill i AU, utomhusgrill = BBQ |
| Prisregel | **SEK × 0,15 → närmaste .95 uppåt** ✅ (199→$29.95, 999/Mastern→$149.95) |
| Valuta | AUD via marknad (manuell kurs 1.0), GST 10 % ingår |
| Bolag | STONEBITE ECOM AB |
| Konsumentlag | Australian Consumer Law (ACL)/ACCC, Privacy Act 1988/OAIC |
| Domän | SAKNAS — Axel köper (förslag: thebbqclinic.com.au). E-post tills vidare kundeservice@grillklinikken.com |

## Nycklar
- Location: gid://shopify/Location/104628781439 (sjöhed 160)
- Publication Webbshop: gid://shopify/Publication/288556384639
- Marknad Australia: gid://shopify/Market/113704796543 (AUD, 1.0, GST inkl.) — Danmark+Sverige-marknaderna satta till DRAFT
- Kollektioner: frontpage 702532092287, bbq-tools 702532125055, aprons 702532157823, knives-chopping-boards 702532190591
- Fraktzon Australia: "Free Shipping" 0 (AU utlyft ur Internationell-zonen)
- Live-tema (MAIN, dansk Grillkliniken — rörs ej): 194575565183

## Läge
- [x] Rensning (30 prod + 4 koll + 4 sidor; ordrar kvar)
- [x] Fas 0+2: parametrar + batchar (AUD-priser förberäknade, compareAt-0-buggen förebyggd)
- [x] Fas 3: 42/42 produkter en-AU (7 agenter, 24 juridiska flaggor — se build/out/*.en.json)
- [x] Fas 4.1: kollektioner (4, engelska)
- [x] Fas 4.2: 42/42 produkter pushade (4 agenter, 0 fel, inga handle-krockar)
- [x] Fas 4.4: kanalpublicering 42 produkter + 4 kollektioner → Webbshop (0 fel)
- [x] Fas 4.5: kollektionsbilder satta (frontpage 1, bbq-tools 13, aprons 12, knives 5 produkter)
- [x] GRIND 1: productsCount active vendor:'The BBQ Clinic' = 42 ✓
- [x] GRIND 2: draftOrderCalculate Sydney NSW 2000 → The Master $149.95 AUD, Free Shipping $0 ✓
- [x] Fas 5: marknad Australia AUD ✓
- [x] Fas 6 (zon): Australia "Free Shipping" 0 ✓ — draftOrderCalculate-grind körs efter push
- [x] Fas 4.3: 6 sidor en-AU med ACL-juridik (obligatoriska "cannot be excluded"-formuleringen,
      Privacy Act 1988/OAIC, GST 10 % inkl., ärlig leveranstid 10–20 business days) — se build/pages-report.md
- [x] Fas 4.6: menyer (huvudmeny: 3 kollektioner + About Us; sidfot: 6 juridiksidor)
- [x] Fas 7: tema bbq-clinic-au-dev (198538887551) — themeCreate från export-zip (NY SNABBVÄG!),
      11 filer en-AU (0 svenska strängar), BBQ Clinic-logga i header/footer/checkout/favicon
- [x] Fas 8: Judge.me-CSV en-AU klar (434 recensioner, validerad, levererad till Axel)
- [x] Mastern-bilder: 5 st lokaliserade till engelska och UTBYTTA på produkten (verifierat: 6 media, gamla raderade)
- [ ] Fas 9: sanningskontroll före lansering (körs när Axel gjort språkbyte + apparna)

## AU-fällor
1. Basvaluta DKK + AUD-siffror i priserna → DK/SE-marknaderna MÅSTE förbli av (annars $29.95 = 29.95 DKK!).
2. Metoden "Levering med DAO"/"Posten"/"Normal" i övriga zoner är kvar på dansk/svenska — irrelevant så länge de marknaderna är av.
3. Judge.me/Kaching-appstatus i denna butik okänd (Judge.me fanns för DK-recensioner? Axel kollar).
