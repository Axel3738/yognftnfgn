# Temarunda 2026-09-29 — CARASHELL (husvagn/husbil-butiken)

Axels order (2026-09-29, kl 08): *"Jag fick nyss nys om ett 9-figure ecom-brand som säljer wheel covers för
när de ska storagea sina RVs. Hitta ett tiotal olika produkter. Jag vill verkligen nischa in mig på RVs —
kör en extra sneaky side batch bara för Carashell med 10+ produkter vi kan testa på den butiken."*

Carashell = Axels butik enbart för husvagns-/husbilsägare. Sortimentet där FÅR vara skydd/överdrag —
formtaket är lyft för den här rundan (`rank.py --tema --formtak 1.0`). Det som fortfarande gäller:

## Ägaren
Husvagns-/husbilsägare 55+. 283 840 husvagnar (116 344 avställda står ute), 94 000–300 000 husbilar
(objekt.json). Han ställer upp vagnen **10–31 oktober** (NOW, 1,6 v) — eller kör vintercamping
(Sälen/Åre/Idre, november–april, husvagnen står på skidcampingen i snö och −20°).

## Signalen från USA-brandet
Amerikanska RV-storage-brands säljer hela kedjan runt uppställningen: tire covers, full covers,
windshield covers, propane tank covers, AC covers, hitch covers, spare tire covers, jack pads, gutter
spout extensions, vent covers (öppen ventil i regn), vent insulator pillows, skylight covers, ladder
covers, RV skirting (vinter), sewer hose supports, tank heating pads, heated water hose, faucet covers,
slide-out awning covers, screen door grilles. **Sök samma struktur på svenska objekt — inte USA-former
som kräver USA-vagnar (slide-outs, 30 A-kablar, sewer hose finns inte här).**

## Vad som redan är gjort (läs `REDAN-PROVAT.md` i mappen — 61 koncept)
Vinnare i kontot: taköverdraget (1 129, REAL_WINNER), termoskyddet husbil (559, REAL_WINNER). Ja från Axel:
frontskyddet, takluckehuven, tak-AC-huven, cykelhållarskyddet, fönstertermomattan, däckvaggorna,
husbilskalendern. Kanske: hjulskydden 4-pack (K0235). Nej: nivåramper, stödbensplattor (standardutrustning
/ för dyr). `kandidat` = hittad men aldrig levererad — får levereras om den klarar grindarna i dag
(t.ex. gnagarnäten K0120–K0164 saknade listning under taket).

## Grindarna (som vanligt — V3-AGENTPROTOKOLL.md gäller)
- LIVE_VERIFIED med hero sedd, pris ur sökträffen, UTC-stämpel. BE-CPA ≥ 190.
- Golvet läst med URL: getcamping.se, campingvaruhuset.se, husvagnsexperten.se, kama.se, fritidsfabriken,
  biltema.se, jula.se, pricerunner.se (curl-receptet), Amazon/Fyndiq = "oläst" om 403.
- **Sortiment (20+ varianter i kedja/fackhandel) utan ankare = fäll. En kopia under oss med ankare ≥ 1,6× = H06, leverera.**
- Standardutrustning som varje campare redan har (SIGNALER.md "sett innan") = död: ramper, kulskydd,
  förtältsmatta, avfuktarburk, kabeltrumma, stödbensvev, vattenhink.
- Objektfältet börjar med SAKEN: `"NYTT: Stödhjulet — …"`, aldrig situationen.
- **Skyddsformer: högst TRE per lins, på tre OLIKA objekt** (formtaket är lyft, men syskon i samma form
  max tre per batch gäller). Leta även former som inte är skydd: lås, matta, värmare, sensor, borste, spärr.
- Inga verktyg som läggs i förrådet efter jobbet — om inte verktyget sitter PÅ vagnen (H07).
- Inga priser/ägarantal ur huvudet: "ej mätt".
- Rör aldrig Meta, Shopify, Notion, Discord eller git. Hjälpskript i scratchpad
  `/tmp/claude-0/-home-user-yognftnfgn/97f9f276-dbf1-5f0f-9c24-391f8fe72f0d/scratchpad/<lins>-*.py`, aldrig i repot.

## Leverans
`korningar/2026-09-29-carashell/v3/kandidater-<LINS>.json` (schemat i V3-KANDIDATSCHEMA.md), bilder i
`korningar/2026-09-29-carashell/v3/bilder/<id>.jpg`. Datumfältet i JSON = `"2026-09-29-carashell"`.
Kort STATUS i chatten: antal levererade, strukna med skäl (en rad var), kärnfynd.
