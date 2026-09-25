# Kampanjschemat hösten 2026 (Matstrumpor)

Skrivet 2026-09-25, samma form som Bäverbutikens. Rytmen är en kampanj i veckan,
tisdag 18:00, plus Black Weeks måndag och fredag. Alla 14 ligger i Klaviyo-kontot
UV6Rqg som utkast sedan 2026-09-25 ~13:10 CEST (se `klaviyo/README.md` för läget).
Inget är schemalagt förrän villkoren i `klaviyo/SISTA-STEGEN.md` → Matstrumpor är
uppfyllda. Sidan: https://claude.ai/artifact/Ljyv3Ye89ipdPNCZbNKKLh. Gallerierna:
kampanjerna https://claude.ai/artifact/VdYq8VLTHqPW4kQm4gMKw1, flödena
https://claude.ai/artifact/WLQKsyRR8soHCDusP8jtYx, mallarna
https://claude.ai/artifact/1KEuzFEai52gahdbpvGShN, galleriet ur `bygg.mjs`
https://claude.ai/artifact/MYCFYWgVAcwugj1tPFrmgR.

**Datum som styr** (brandfilens `kalender`, sista beställning = dagen − 15 dygn, p90 för
leveransen mätt 2026-09-25): fars dag 8/11 (sista beställning **lör 24/10**), Black Week
23–30/11, jul (sista beställning **tis 8/12**).

**Säsongen** (Shopify, hela historiken): dec 2025 1 613 ordrar, jan 799, feb 655, mars
280, april–juli under 10 i månaden, sep 197. Sushilådan tog slut i november 2025.
Därför är oktober uppvärmning och november–december hela affären.

| Vecka | Dag | Kampanj | Produkter | Vinkel | Segment | Läge |
|---|---|---|---|---|---|---|
| 40 | tis 29/9 | K01 | Sushi | De tror att det är riktig sushi (avslöjandet) | uppvärmning steg 1 | utkast, klar |
| 41 | tis 6/10 | K02 | Sushi + tre sorter | Ingen jublar åt tvättmedel (presentproblemet) | uppvärmning steg 1 | utkast, klar |
| 42 | tis 13/10 | K03 | Sushi | Kundernas ord, ordagrant | engagerade 60 d | utkast, klar |
| 43 | tis 20/10 | K04 | Sushi + tre sorter | **Fars dag, beställ senast lör 24/10** | engagerade 60 d | utkast, klar |
| 44 | tis 27/10 | K05 | Sushi | Gissa vad jag la i julstrumpan | engagerade 90 d | utkast |
| 45 | tis 3/11 | K06 | Sushi + tre sorter | I november förra året tog de slut | engagerade 90 d | utkast |
| 46 | tis 10/11 | K07 | Sushi + tre sorter | Två lådor, två personer (köp 1, få 1) | samtycke | utkast |
| 47 | tis 17/11 | K08 | Alla fyra, en per person | Julklappsguiden | samtycke | utkast |
| 48 | **mån 23/11** | K09 | Alla fyra | Black Week, trappan 10/20/30 % | samtycke | utkast, klar |
| 48 | **fre 27/11** | K10 | Alla fyra | Black Friday, trappan gäller till måndag | samtycke | utkast, klar |
| 49 | tis 1/12 | K11 | Alla fyra | Beställ senast tisdag 8/12 för jul | samtycke | utkast |
| 50 | tis 8/12 | K12 | Sushi + tre sorter | Sista dagen i dag | samtycke | utkast |
| 51 | tis 15/12 | K13 | Presentkortet | Julklappen som kommer i mejlen | samtycke | utkast |
| 52 | — | — | — | Ingen kampanj julveckan | — | — |
| 53 | tis 29/12 | K14 | Alla fyra | Vem har födelsedag härnäst? | samtycke | utkast |

**Totalt:** 14 kampanjer på 14 veckor. Vecka 48 har måndag + fredag i stället för tisdag
(Black Week), vecka 52 ingen.

## Räcker prenumerationen?

Klaviyos e-postplan tillåter 10 utskick per profil och månad i den nivå man betalar
för. Kontot har 4 357 profiler, 2 890 med samtycke (mätt 2026-09-25). Värsta månaden är
november: K06 till engagerade 90 d (några hundra) och K07–K10 till högst 2 890 personer
var, alltså cirka 12 000 kampanjmejl plus flödena (efter köp och återköp till
novemberköparna, i december 2025 var det 1 613 ordrar på en månad). December: K11–K13,
cirka 8 700 plus flöden. **Planen måste rymma minst 4 357 profiler och cirka 20 000 mejl
i månaden; nivån 4 001–5 000 profiler ger 50 000.** Vilken plan kontot har går inte att
läsa via API:t; Cowork läser det i Billing (`SISTA-STEGEN.md` → Matstrumpor) och
skriver in det här.

## Regler som gäller hela schemat

- Kampanjer går bara till segment med samtycke (motorn stoppar annat).
- Uppvärmningstrappan: K01–K02 uppvärmning steg 1, K03–K04 engagerade 60 d, K05–K06
  engagerade 90 d, K07–K14 hela listan med samtycke. Faller öppningsgraden under 20 %
  går nästa kampanj tillbaka till 30-dagarssegmentet (EPOST-STRATEGI §4).
- Ingen rabatt utan Axels beslut. **Black Week: Axels beslut 2026-09-25, samma trappa
  som Bäverbutiken på hela sajten:** 10 % på 1 vara, 20 % på 2, 30 % på 3 eller fler,
  23/11 00:00 till 1/12 00:00, som tre schemalagda automatiska rabatter i Shopify.
  ⚠️ Matstrumpors vanliga erbjudande "Köp 1, få 1" är rabattkoder, och automatiska
  rabatter kombineras inte med koder om Axel inte säger annat: se README-avsnittet.
- Leveranstiden skrivs aldrig i ett mejl (spårningssidan visar den).
- Sushin har inget jämförpris över priset: aldrig spara/rea om sushin.
- Nya sorter under hösten får en plats genom att flytta en tisdag, inte genom fler utskick.
