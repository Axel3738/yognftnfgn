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
- [x] Temabilder fixade 2026-08-23: 5 saknade shop_images uppladdade (hero Namnlos_design_55 m.fl.) →
      startsidans bildreferenser löser nu. 4 kollektionsbilder satta.
- [x] The Master prissatt $179.95 / compareAt $299.95 (Axel delegerade; BE-ROAS 1,40 vid COGS $27,5 USD + 5 % avgifter)
- [x] GRIND (Sydney NSW 2000): 1× The Master = $179.95 AUD, frakt "Free Shipping" 0 ✓
- [x] Fas 9: fullständig sanningskontroll KÖRD 2026-08-23 — se LAUNCH-CHECK.md
      (alla kärnkontroller ✅, Melbourne-grind 29.90 AUD/frakt 0, 1 blockerare + 9 varningar)
- [x] Blockeraren FIXAD 2026-08-23: kundeservice@grillklinikken.com → hello@thebbqclinic.com
      på alla 6 sidor (26 förekomster inkl. 13 mailto-länkar; verifierat 0 gamla / 26 nya; temat innehåller 0 mejladresser)
- [x] GST-formuleringen FIXAD 2026-08-23: shipping-sidans falska "GST is collected at checkout" ersatt
      med "include any applicable taxes — the price you see at checkout is the total price you pay"
      (+ importtröskel AUD $1 000); samma neutrala formulering i terms-of-service. Ingen sida lovar
      längre GST-uppbörd som inte sker (checkouten tar 0 skatt tills GST-registrering ev. konfigureras).
- [x] **Handle-bytet 2026-08-23: alla 42 produkt-URL:er svenska → engelska.**
      Karta: `handles/handle-map-v2.tsv` (GID, gammal, ny, titel). 42 `productUpdate`, 0 fel.
      42 `urlRedirect` gamla→nya skapade (API:t gör dem INTE automatiskt).
      Hero: `/products/elektrisk-grillborste` → **`/products/the-master-electric-bbq-brush`**.
      17 av namnen justerades av en granskningsagent: `flipgrill-bbq-basket`→`flipgrill-charcoal-bbq`
      (produkten är en kolgrill, inte en korg), de fyra Master-tillbehören fick
      `the-master-`-prefix (var kolliderande: brush-head/polishing-head/brush-safe-head/
      brush-polishing-head), `sailor-moon-apron`→`anime-sailor-bbq-apron` (IP-risk i annonslänk),
      `bbq`-token tillagd på förkläden, `safe-shipping-guarantee`→`shipping-protection`.
- [x] "CharBreaker" (leverantörens bildfilnamn, ej vårt varumärke) borttaget ur 2 SEO-beskrivningar
- [x] Judge.me-recensionerna var REDAN importerade (429 st: 247/77/50/21/16/13/5) — importera INTE igen.
      CSV:n uppdaterad med nya handles + korrekta AU-produkt-ID:n som arkiv/backup.
- [ ] MANUELLT (Axel): startsidans andra "Featured product" pekar fortfarande på gamla `stekbord`
      → välj om produkten (Stainless Steel BBQ Hotplate) i temaredigeraren. Alternativt publicera
      det förberedda temat `bbq-clinic-au-v2` (gid://shopify/OnlineStoreTheme/198851854719).

## AU-fällor
1. Basvaluta DKK + AUD-siffror i priserna → DK/SE-marknaderna MÅSTE förbli av (annars $29.95 = 29.95 DKK!).
2. Metoden "Levering med DAO"/"Posten"/"Normal" i övriga zoner är kvar på dansk/svenska — irrelevant så länge de marknaderna är av.
3. Judge.me/Kaching-appstatus i denna butik okänd (Judge.me fanns för DK-recensioner? Axel kollar).
