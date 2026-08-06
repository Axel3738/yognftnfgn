# 4. Vad kan automatiseras vs kräver manuell kontroll

## Kan automatiseras (Claude via Shopify API / skript i repot)

| Område | Hur |
|--------|-----|
| Export/backup av produkter, kollektioner, sidor, policyer, menyer | GraphQL → CSV/JSON i git |
| Skapa/uppdatera produkter, varianter, priser, taggar, status i bulk | API, batchat, alltid som DRAFT först |
| SKU-omläggning enligt ny struktur (med gammalt id i metafält) | Deterministiskt skript — regelverk godkänns först |
| Prisomräkning (valutafaktor + avrundningsregler) | Skript; prislista ut som CSV för granskning innan skrivning |
| Översättning/omskrivning av titlar, beskrivningar, alt-texter | Claude skriver; stickprov godkänns av dig |
| Kollektioner (smarta regler på taggar) + navigation/menyer | API |
| Sidor (Om oss, FAQ, leveransinfo, kontakt) | API, utkast |
| Bildhantering: flytt till CDN, alt-texter, namngivning | API (upload-image) |
| Temaarbete i opublicerad kopia | Temafiler via API (skrivning mot live-tema är blockerad — bra) |
| QA-svep: brutna länkar, blandspråk, saknade bilder, tomma fält, prisavvikelser | Skript + API-läsning, rapport i repot |
| E-postmall-texter (utkast) | Claude skriver, du klistrar in/godkänner |

## Kräver manuell kontroll eller endast dig

| Område | Varför | Vem |
|--------|--------|-----|
| Domänköp, Shopify-abonnemang, betalt tema, appar | Köp/avtal | **Du** |
| Betalningsleverantörer (Shopify Payments, Klarna, Vipps/MobilePay) | Identitetsverifiering, avtal | **Du** |
| Momsregistrering (OSS/lokal), företagsuppgifter | Juridisk person | **Du** |
| Slutlig juridisk granskning av policyer + produktpåståenden | Extern jurist | **Du** ordnar, Claude levererar märkt underlag |
| Rättighetsbeslut: vilka bilder/texter/teman får återanvändas | Endast du vet avtalen (obs: live-temat är en export från trevligtradgard.se) | **Du** |
| Varumärkesnamn + domänval för nya marknaden | Strategiskt + juridiskt | **Du**, Claude tar fram förslag och kollisionskoll |
| Godkännande av tonalitet/copy (stickprov) | Smakbeslut | **Du** |
| Prisstrategi (nivåer, fraktfrigräns) | Affärsbeslut | **Du** beslutar, Claude räknar och implementerar |
| Publicering av butik/tema, borttag av lösenordsskydd | Oåterkalleligt utåt | **Du** godkänner, Claude utför |
| Slutlig testorder med riktigt kort + återbetalning | Riktiga pengar | **Du** |

## Princip

Allt automatiserat körs i ordningen **export → torrkörning/rapport → ditt OK → skrivning**,
och skrivningar sker mot DRAFT/opublicerat där Shopify tillåter det.
