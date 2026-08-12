# 6. Ansvarsfördelning

## Du (Axel)

**Beslut & köp**
- Val av målmarknad, språk, varumärkesnamn, prisstrategi, sortiment
- Domänköp, Shopify-abonnemang/butik, betalt tema, appar
- Aktivering av betalningsleverantörer (identitetsverifiering, avtal)
- Momsregistrering och företagsuppgifter

**Rättigheter & juridik**
- Klargöra rättigheter till bilder, texter, logotyper och temat
  (särskilt: live-temat är exporterat från trevligtradgard.se)
- Ordna extern juridisk slutgranskning av allt som Claude markerat `[JURIDISK GRANSKNING]`

**Godkännanden (grindar)**
- Stickprov av produktcopy och priser (fas 2)
- Temaförhandsvisning (fas 4)
- Varje skrivkörning mot butiken efter torrkörningsrapport
- Slutlig testorder med riktigt kort
- **Uttryckligt GO för lansering** — utan det publiceras ingenting

## Claude

**Bygger & implementerar**
- Export/backup av allt innehåll innan varje förändring (versionerat i git)
- Produktkatalog: översättning/omskrivning av copy, priser, varianter, SKU-struktur, taggar
- Kollektioner, menyer, sidor (startsida, Om oss, FAQ, kontakt, leveransinfo)
- Temaarbete i opublicerad kopia; visuell anpassning enligt din riktning
- Policyutkast anpassade till målmarknaden, med tydlig märkning av juridiskt känsligt
- Butiksinställningar som inte kräver ägare: marknad, språk, valutaformat, fraktzoner,
  skatteinställningar, mall-texter

**Kvalitetssäkrar & rapporterar**
- QA-svep av hela kundresan (mobil + desktop) med skriftlig felrapport
- Inventerings- och avvikelselistor (som dok 02)
- Torrkörningsrapporter före varje bulk-skrivning
- Uppdaterar lanseringschecklistan löpande

**Claude gör aldrig utan ditt uttryckliga OK**
- Publicerar butik/tema eller tar bort lösenordsskydd
- Genomför köp eller installerar appar
- Raderar data (utan färsk export)
- Skriver mot live-tema (dessutom tekniskt blockerat)
- Publicerar innehåll vars rättigheter är oklara

## Eskalering

Om något upptäcks som är juridiskt tveksamt, rättighetsmässigt oklart eller kan skada
befintlig försäljning → arbetet på den delen pausas och flaggas till dig med förslag,
i stället för att gissa.
