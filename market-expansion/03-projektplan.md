# 3. Projektplan i faser

Varje fas avslutas med en kontrollpunkt. Fas 0–1 kan börja direkt när frågorna i
`07-fragor-att-besvara.md` är besvarade. Tidsangivelser är arbetsinsats, inte kalendertid.

## Fas 0 — Definition & beslut *(blockerande, kräver dig)*
- Besvara definitionsfrågorna (källbutik, marknad, språk, sortiment, valuta, varumärke,
  leverans/retur, rättigheter, åtkomst, datum, budget).
- Beslut: **Markets i samma butik** vs **separat butik** (påverkar allt nedan).
- ✅ Klart när: alla B-frågor i dok 01 har svar.

## Fas 1 — Säkerhetskopiering & export *(Claude)*
- Full produktexport (CSV via API) av källbutiken, sparas i repot.
- Export av kollektioner, menyer, sidor, policytexter (redan delvis gjort i inventeringen).
- Temaexport/duplicering innan någon temaändring.
- ✅ Klart när: allt innehåll finns versionerat i git innan första skrivoperationen.

## Fas 2 — Katalog: produkter, varianter, SKU, priser *(Claude bygger, du godkänner stickprov)*
- Urval enligt beslutat sortiment; legacy-produkter (Bäverkoppling/matstrumpor) exkluderas
  om inget annat sägs.
- Översätt/anpassa titlar, beskrivningar, fördelar, alt-texter till målspråket —
  omskrivning med lokal ton, inte maskinöversättning rakt av.
- Ny SKU-struktur: `<BRAND>-<KATEGORI>-<LÖPNR>[-<VARIANT>]`, med TEMU-id:t bevarat i
  metafält för inköpsspårning.
- Prissättning enligt beslutad modell (valutafaktor + avrundning till lokal priskänsla),
  compare-at-priser konsekventa och juridiskt hållbara `[JURIDISK GRANSKNING]` vid rea-påståenden.
- Varianter städas (konsekventa namn, storleksskalor för målmarknaden).
- ✅ Klart när: hela katalogen ligger i målbutiken som DRAFT och du godkänt ett stickprov (~10 produkter).

## Fas 3 — Struktur: kollektioner, navigation, sidor *(Claude)*
- Kollektioner återskapas med översatta namn, beskrivningar + bilder; smarta regler (taggar)
  i stället för manuellt underhåll där det går.
- Huvudmeny med kategorier; sidfot med korrekta policylänkar och rätt supportmail.
- Sidor: Startsida-innehåll, Om oss, Kontakt, FAQ, leveransinformation.
- ✅ Klart när: hela klickstrukturen fungerar i utkastläge.

## Fas 4 — Visuell identitet & tema *(Claude föreslår, du beslutar)*
- Temaval: återanvänd befintligt (om rättigheter klargjorts) eller nytt (Horizon är gratis;
  Shrine är betalt = ditt köpbeslut).
- Allt temaarbete sker i **opublicerad kopia**.
- Logotyp, färger, typografi enligt beslutad varumärkesriktning; banners och startsidesektioner.
- Mobil + desktop-genomgång av alla sidtyper.
- ✅ Klart när: du godkänt förhandsvisning av tema-kopian.

## Fas 5 — Policyer & juridik *(Claude utkast → extern granskning)*
- Integritetspolicy, köpvillkor, retur-/ångerrätt, fraktpolicy och cookies anpassade till
  målmarknadens regler (EU-ångerrätt 14 dagar, lokal konsumentlag, prisinformation).
- Alla mallvariabler ersatta; en enda källa per policy (ingen dubblering sida/policy).
- Produktpåståenden gås igenom (inga ogrundade effekt-/säkerhetspåståenden, CE-märkning
  där relevant). Allt känsligt märks `[JURIDISK GRANSKNING]` i en samlad lista till dig.
- ✅ Klart när: granskningslistan är överlämnad och texterna publicerbara i utkast.

## Fas 6 — Butiksinställningar *(delat)*
- Claude (konfiguration): marknad, språk, valutaformat, fraktzoner/-priser enligt beslut,
  skatteinställningar (moms inkl. i pris), e-postmallar/notiser på målspråket, checkout-texter.
- Du (kräver ägare/köp): domän, Shopify Payments/Klarna-aktivering, ev. appar, ev. betalt tema.
- ✅ Klart när: testorder går att lägga i testläge.

## Fas 7 — Kvalitetssäkring av kundresan *(Claude, du gör slutlig testorder)*
- Hela flödet: annons/inträde → startsida → kollektion → produkt → varukorg → checkout →
  ordermail, på mobil och desktop, på målspråket.
- Kontroll av brutna länkar, blandspråk, valutafel, bildfel, SEO-grunder (titlar, metabeskrivningar).
- Fullständig felrapport + åtgärd innan lansering.
- ✅ Klart när: lanseringschecklistan (dok 05) är grön.

## Fas 8 — Lansering *(endast på ditt uttryckliga godkännande)*
- Publicering av tema/butik, lösenordsskydd av, domän live.
- Efterkontroll första 48 h: ordrar, mail, betalflöde, 404:or.
