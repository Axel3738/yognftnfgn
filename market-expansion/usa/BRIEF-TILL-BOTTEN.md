# Beslutsunderlag: ska Bäverbutiken öppna USA — eller ska vi bygga vidare på det vi har?

*Skrivet 2026-09-24 av Claude Code-sessionen åt Axel (ägare, Stonebite Ecom AB).
Till den som ska utvärdera. Siffrorna är mätta ur sajtens snapshot
`stonebite/data/snapshot.json`, hämtad 2026-09-24 03:05 UTC. Allt som inte är
mätt står som okänt.*

---

## Din uppgift

Utvärdera två vägar och rekommendera EN:

- **A. Öppna USA som en Shopify Markets-marknad i Bäverbutikens befintliga butik**
  och testa produkter där (general store-test, alla produkter i en kampanj).
- **B. Låt bli USA nu** och lägg samma tid och pengar på att utveckla och skala
  de system och marknader vi redan har.

Svara med: rekommendation, de tre starkaste skälen, de största riskerna med ditt
val, vad som måste vara sant för att det andra valet ska vara bättre, och en
konkret första vecka. Hitta inte på siffror. Saknas något: säg vad och varför det
spelar roll.

---

## Axels egna villkor för USA

- **Samma butik, inte en ny.** Skäl: slippa vänta på utbetalningar i en ny butik,
  slippa kassaflödesproblem, slippa bygga upp förtroende hos Shopify Payments
  från noll. Han gillar Markets-funktionen.
- **Bara produkter med snittorder över 60 USD** (~630 kr).
- **Större påslag i USA än i Sverige.** Målet är break-even-ROAS ~1,3 i USA.
  (Sveriges produkter ligger på 1,34–2,00.)
- **Mejladressen och de svenska systemen får inte röras.** Axel vill inte byta
  avsändaradress i Shopify. Allt som byggts för Sverige ska fortsätta fungera.
- Han vet inte själv om en general store i USA är värd det. Han tror att vissa
  produkter kan flyga där.

---

## Läget i dag (mätt, 7 dagar 17–23 sep)

### Butikerna

| Butik | Marknad | Omsättning 7 d | Ordrar 7 d |
|---|---|---|---|
| Bäverbutiken | Sverige | 637 901 SEK | 737 |
| CaraShell (husbil/husvagn) | SE + NO + **USA, UK, CA, AU, NZ** | 400 616 SEK | 251 |
| Beverbutikken | Norge | 198 120 NOK | 209 |
| Majavakauppa | Finland | 2 389 EUR | 17 |
| Matstrumpor | Sverige | 23 320 SEK | 54 |
| Bæverbutiken | Danmark | 0 DKK | 0 |

Bäverbutikens omsättning per dag har ungefär fördubblats på en månad: runt
35 000–45 000 kr/dag i början av september, 75 000–112 000 kr/dag 18–23 sep.
**Butiken växer kraftigt just nu, i sin nuvarande form.**

### Annonskontona (Meta, 7 dagar)

| Konto | Används för | Spend 7 d | ROAS |
|---|---|---|---|
| MagiBorsten `1867947880635861` | Bäverbutiken Sverige | 214 166 kr | 2,55 |
| Magiborsten NO | Norge | 84 236 kr | 2,32 |
| Magiborsten DK `915422744950975` | OPS-butikerna (mest CaraShell SE/NO) | 77 356 kr | 2,49 |
| **Magiborsten UK `1107817401910319`** | **USA-annonserna för OPS-butikerna (CaraShell)** | 72 905 kr | **1,54** |
| Magiborsten FI | Finland | 12 091 kr | 1,25 |

⚠️ Vi kör alltså redan USA, via CaraShell på carashell.com. **Det är det enda
riktiga datat vi har om USA.** ROAS i det kontot (1,54) är sämre än i Sverige,
men CaraShells break-even i USA är inte räknad här, så vi vet inte om det är
lönsamt. Kontot kan också bära annat än USA-trafik. Nästa steg för den som
utvärderar: be om USA-kampanjernas egna siffror mot deras break-even.

### Produkterna i Bäverbutiken och 60 USD-gränsen

Snittorder i SEK (products.json) mot gränsen ~630 kr:

| Produkt | Snittorder | Break-even-ROAS SE | Klarar 60 USD? |
|---|---|---|---|
| AI-glasögon (testprodukt) | 1 869 kr | 1,34 | ✅ |
| Säteöverdragaren | 702 kr | 1,47 | ✅ |
| Väggfästet (testprodukt) | 569 kr | 2,00 | bara med högre USA-pris |
| Axelbältet | 514 kr | 1,72 | bara med högre USA-pris |
| Strandtofflorna | 411 kr | 1,70 | ❌ |
| Motorhöljet | 342 kr | 1,63 | ❌ |

Taköverdraget och Termoskyddet säljs redan i USA via CaraShell och ska inte
dubbleras (samma kunder, två butiker som bjuder mot varandra).
Butiken har fler produkter än de sex ovan (46 annonsprefix i kontot 30 aug);
listan är inte hela sortimentet.

### Tvister och chargebacks (180 dagar)

- Bäverbutiken: **59 tvister, 20 öppna, 18 väntar på svar.**
- Mätt på 50 av Bäverbutikens tvister: inquiries vinns 29 av 29, chargebacks
  bara 1 av 4. Förlusterna är alltid chargebacks.
- Allt i en butik = **alla tvister räknas på samma Shopify Payments-konto.**
  Går USA över kortnätverkens gränser (Visa ~0,9 %, Mastercard ~1 %) drabbas
  också den svenska verksamheten. Längre leveranstid till USA ger typiskt fler
  "har inte fått paketet"-tvister.
- Leveranstiden i Sverige i dag: 5–10 arbetsdagar, uppmätt median ~10 dygn.
  Leveranstid till USA från samma leverantör är **inte mätt** för Bäverbutiken.

### Systemen som byggts för Sverige (det Axel inte vill förstöra)

Allt här är byggt för eller kring Bäverbutiken och körs automatiskt:

- **Kundtjänstbot (autosvar)** — skarp sedan 23 sep. Svarar själv på "var är
  min order", lugnar arga kunder på en minut, flaggar svåra ärenden. Kan redan
  engelska.
- **Spårningssidan** baverbutiken.se/pages/spara + fraktnotiser, varje timme.
  Svensk i dag. Flerspråkig version finns redan på CaraShell (sv/nb/en/fi).
- **Kundmejlen** — svenska mallar. CaraShell har en mall som byter språk efter
  leveranslandet, så det går att göra i Bäverbutiken också.
- **Tvistkoll varje dag + tvisthandbok för VA:n.**
- **Leveransrundan** — laddar upp redigerarnas färdiga annonser i rätt kampanj.
  Kampanjen väljs efter annonsnamnets början. ⚠️ Läggs USA-kampanjer i samma
  annonskonto med samma namnbörjan kan svenska annonser hamna i USA. USA måste
  ligga i ett annat konto.
- **Commission till redigerarna** — betalas bara för svenska annonser. USA
  skulle inte ge redigerarna något utan ett nytt beslut.
- **Creative strategy-loopen, brief-kvoten, briefgranskning.**
- **Stonebite-sajten** med dashboards per butik och marknad. Valutor summeras
  aldrig, så USD skulle stå för sig.

### Vad USA i samma butik skulle kräva (uppskattat, inte byggt)

1. En egen engelsk domän kopplad till USA-marknaden (som carashell.com). Svenska
   kunder ser då ingen skillnad.
2. Engelsk översättning av butiken, USD-priser satta för hand (Axels beslut),
   frakttext och policy för USA.
3. Engelska fraktmejl som väljs efter leveransland. Avsändaren i Shopify står
   kvar. Svar från amerikanska kunder landar i den svenska brevlådan (boten och
   VA:n läser engelska).
4. Engelska på spårningssidan.
5. USA-annonser i ett eget konto, en testkampanj med ett adset per produkt.
6. Tvister i USA mätta separat från dag 1.

Mycket av detta finns redan som färdiga lösningar från CaraShells USA-bygge
(16–17 sep). Engångsjobbet är ändå inte gratis, och varje system ovan får en
marknad till att hålla reda på.

---

## Frågorna utvärderingen bör svara på

1. Bäverbutiken har fördubblats i Sverige på en månad. Är det rätt läge att
   splittra fokus, eller bör all kraft gå till att skala det som redan växer?
2. Är 60 USD-gränsen + BE-ROAS 1,3 realistisk när bara 2–4 av de kända
   produkterna klarar den, och CaraShell i USA ligger på ROAS ~1,5?
3. Hur stor är chargeback-risken för den svenska huvudbutiken om USA går dåligt?
   Är den värd samlade utbetalningar och ett kassaflöde?
4. Finns det billigare sätt att få samma svar, till exempel att först testa
   USA-intresset för en eller två produkter via CaraShells befintliga USA-uppsättning,
   eller vänta tills leveranstiden till USA är mätt?
5. Vilka av de befintliga systemen ger mest om de utvecklas i stället? (T.ex.
   Norge och Danmark som redan har butiker, Danmark med 0 ordrar, Finland med
   ROAS 1,25, 18 obesvarade tvister, briefkvoten.)

## Det som inte är mätt (säg till om det avgör)

- Produktkostnad per produkt vid frakt till USA, och alltså vilket USD-pris som
  ger BE-ROAS 1,3.
- Leveranstid till USA för Bäverbutikens leverantör.
- CaraShells USA-kampanjer var för sig, mot sin break-even.
- Bäverbutikens chargeback-grad i procent just nu (antal tvister finns, kvoten
  mot ordrar är inte räknad här).
