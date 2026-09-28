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
| 42 | tis 13/10 | K03 | Sushi | Kundernas ord, ordagrant | engagerade 60 d = de som öppnat K01/K02 i Spoks; **under 300 ⇒ samtycke** | utkast, klar |
| 43 | tis 20/10 | K04 | Sushi + tre sorter | **Fars dag, beställ senast lör 24/10** | **samtycke** (en deadline ska nå alla; ändrat 2026-09-27) | utkast, klar |
| 44 | tis 27/10 | K05 | Sushi | Gissa vad jag la i julstrumpan | **kopare_forra_sasongen** (2 415; ändrat 2026-09-27) | utkast |
| 45 | tis 3/11 | K06 | Sushi + tre sorter | I november förra året tog de slut | **kopare_forra_sasongen** (2 415; ändrat 2026-09-27) | utkast |
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

**Utanför tisdagsrytmen (2026-09-27, omskriven 2026-09-28):** **K15 Recensionen** — bara köpare
(`SEG_kopare`; uteslutningen `SEG_oengagerade_180d` är tom tills fem kampanjer gått), ett kort
personligt mejl som ber om ett omdöme på Judge.me, bra eller dåligt, med **fem klickbara
stjärnor direkt till Judge.me-formuläret** (`&stars=1…5` bara för klickstatistiken), ingen rabatt,
ingen produktbild. Betygssidan `/pages/betyg` (v1:s mellansida med animationen) är avpublicerad
sedan 2026-09-28 på Axels ord. Spoks-utkast `45e8e354-8672-4e83-ac11-c8b2ee3e3b85`. Axels beslut
2026-09-27 kväll: **skickas samma dag som han väljer publik**, publik och Send i appen är hans
klick. Axels beslut 2026-09-28: vårt eget mejl, inte Judge.me:s — `klaviyo/spoks/README.md`
→ Recensionerna.

## Dagliga serien 30/9–25/10: fars dag + Köp 1, få 1 (byggd 2026-09-28, 23 utkast i Spoks)

Axels order 2026-09-28: kampanjer **varje dag**, minst tio fars dag-mejl, REA-mejl för den
pågående rean. "Rean" på Matstrumpor är det stående erbjudandet **Köp 1, få 1** (koderna läggs
på produktsidan, mejlen säger "det står på produktsidan" och aldrig en kod; erbjudandet tar
aldrig slut, så den enda brådskan är sista beställningsdagen **lör 24/10**). Tjugo fars
dag-mejl (FD) och tre Köp 1, få 1-mejl (REA), ett per dag, som **hoppar tisdagarna 6/10, 13/10
och 20/10** där K02–K04 redan ligger. Tillsammans med K01–K04 blir det **ett mejl om dagen 29/9–25/10,
27 dagar utan lucka.** Alla 23 ligger som utkast i Spoks (workspace `71c2d4c8-…`), tillbakalästa
2026-09-28 16:5x UTC; **publik och Schedule per mejl är Axels klick**, inget är schemalagt.
Klockslaget nedan är det planerade (18:00, FD19 09:00 för att sista dagen ska nås på morgonen).
Id:n, faktakollen och stoppregeln: `klaviyo/spoks/README.md` → Dagliga serien.

| Dag | Kort | Segment | Ämnesrad | Spoks-utkast |
|---|---|---|---|---|
| ons 30/9 18:00 | FD01 | `SEG_samtycke` | Han säger nej till presenter. Inte till sushi. | [fe8c9abf](https://app.spoks.com/matstrumpor/post/fe8c9abf-4cbe-41fc-aaca-1d4400717049/edit) |
| tor 1/10 18:00 | FD02 | `SEG_samtycke` | Från barnen: en låda som ser ut som sushi | [4f1d87cf](https://app.spoks.com/matstrumpor/post/4f1d87cf-633d-4ddd-870a-6710e73d7d59/edit) |
| fre 2/10 18:00 | REA01 | `SEG_samtycke` | En till pappa, en till svärfar | [411d7f9e](https://app.spoks.com/matstrumpor/post/411d7f9e-a68b-4b69-a07b-4a9d32bb8b1d/edit) |
| lör 3/10 18:00 | FD03 | `SEG_samtycke` | En pizzalåda pappa inte kan äta | [f915735d](https://app.spoks.com/matstrumpor/post/f915735d-7f9d-41d5-b658-cddb15e02e20/edit) |
| sön 4/10 18:00 | FD04 | `SEG_samtycke` | En burgare han inte kan äta | [35eda39a](https://app.spoks.com/matstrumpor/post/35eda39a-52a8-4c72-8879-dabf3ef28b6e/edit) |
| mån 5/10 18:00 | FD05 | `SEG_samtycke` | En donutlåda åt farfar, inte bara pappa | [11247ac0](https://app.spoks.com/matstrumpor/post/11247ac0-87cf-4b4a-9c52-73e705aeef31/edit) |
| ons 7/10 18:00 | FD06 | `SEG_samtycke` | Sushilådan funkar även om du knappt känner svärfar | [19db626c](https://app.spoks.com/matstrumpor/post/19db626c-e88e-4900-bb19-c2e5ca196144/edit) |
| tor 8/10 18:00 | FD07 | `SEG_samtycke` | Han har allt. Inte en sushilåda med strumpor. | [df000c31](https://app.spoks.com/matstrumpor/post/df000c31-0eb7-4572-b4c0-4891a53df843/edit) |
| fre 9/10 18:00 | REA02 | `SEG_samtycke` | Köp 1, få 1 gäller alla fyra sorterna | [9d41c29d](https://app.spoks.com/matstrumpor/post/9d41c29d-d7e4-42c7-aaaa-b8f49f17da12/edit) |
| lör 10/10 18:00 | FD08 | `SEG_samtycke` | Så här skrev de om lådan till pappa | [f4696d2a](https://app.spoks.com/matstrumpor/post/f4696d2a-8358-4fcd-a67a-4b5ac280c0d5/edit) |
| sön 11/10 18:00 | FD09 | `SEG_samtycke` | Två veckor kvar till 24 oktober | [5317562c](https://app.spoks.com/matstrumpor/post/5317562c-2e88-4549-a23e-13329494c9a3/edit) |
| mån 12/10 18:00 | FD10 | `SEG_kopare_forra_sasongen` | Förra gången jul, den här gången fars dag | [f7e75509](https://app.spoks.com/matstrumpor/post/f7e75509-9397-4ed6-bfb3-aabec4f0ea63/edit) |
| ons 14/10 18:00 | FD11 | `SEG_samtycke` | En sushilåda till pappa, en till dig själv | [9a8e6ea5](https://app.spoks.com/matstrumpor/post/9a8e6ea5-f889-4df1-8109-ca5f665908ed/edit) |
| tor 15/10 18:00 | FD12 | `SEG_kopare` | Du har redan sushin. Ge pappa pizzan. | [69506961](https://app.spoks.com/matstrumpor/post/69506961-866a-4f47-bb09-6c503672f9d8/edit) |
| fre 16/10 18:00 | REA03 | `SEG_samtycke` | En vecka och en helg kvar till 24 oktober | [45aabe88](https://app.spoks.com/matstrumpor/post/45aabe88-d6c9-490d-a634-2ddfb936aeb0/edit) |
| lör 17/10 18:00 | FD13 | `SEG_samtycke` | Exakt en vecka kvar till 24 oktober | [f68abd56](https://app.spoks.com/matstrumpor/post/f68abd56-a4bb-4608-b5ea-610375ca6e05/edit) |
| sön 18/10 18:00 | FD14 | `SEG_ej_kopt` | Du har aldrig sett hans min när lådan öppnas | [faaafae6](https://app.spoks.com/matstrumpor/post/faaafae6-7469-4251-9dfe-0fb88588c461/edit) |
| mån 19/10 18:00 | FD15 | `SEG_samtycke` | Fem dagar kvar att beställa till fars dag | [656f890e](https://app.spoks.com/matstrumpor/post/656f890e-5629-431d-9efa-5f6ef55a95dd/edit) |
| ons 21/10 18:00 | FD16 | `SEG_samtycke` | Tre dagar kvar. Ingen sushi i den här lådan. | [56fb1045](https://app.spoks.com/matstrumpor/post/56fb1045-5139-4d04-bb52-f2fd704c7d10/edit) |
| tor 22/10 18:00 | FD17 | `SEG_samtycke` | Två dagar kvar innan paketet inte hinner fram | [a2529b5a](https://app.spoks.com/matstrumpor/post/a2529b5a-c43b-4fc3-bc1e-5fbe2f5e9f59/edit) |
| fre 23/10 18:00 | FD18 | `SEG_samtycke` | I morgon är sista dagen att beställa till fars dag | [ea849786](https://app.spoks.com/matstrumpor/post/ea849786-ea60-43bc-8d8b-cc6ca4eceea8/edit) |
| lör 24/10 09:00 | FD19 | `SEG_samtycke` | I dag är sista dagen att beställa till fars dag | [b91692ad](https://app.spoks.com/matstrumpor/post/b91692ad-d7ab-4e71-b8db-1799f97af346/edit) |
| sön 25/10 18:00 | FD20 | `SEG_samtycke` | En present till pappa som hinner fram ändå | [385b6fc9](https://app.spoks.com/matstrumpor/post/385b6fc9-f41c-43c3-bb02-96bd0970b849/edit) |

Segmenten är skräddarsydda där segment finns: FD10 till förra säsongens köpare (2 396 vid
bygget), FD12 till köpare (2 700), FD14 till dem som aldrig köpt (300); kategorisegmenten
(sushi 105, pizza 3, hamburgare 2, donut 9) är för små, så sorterna får varsin dag till hela
listan i stället. **Volymen:** ett mejl om dagen till cirka 3 000 personer är cirka 70 000 mejl
på fyra veckor; Spoks-planen är Paid utan tak, men avanmälningarna ska läsas efter varje
utskick (stoppregeln i README). Veckans dragning-blocket hör till tisdagarna (K02 6/10 först),
inte till de dagliga.

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
- Uppvärmningstrappan (Klaviyos, EPOST-STRATEGI §4) var: K01–K02 uppvärmning steg 1,
  K03–K04 engagerade 60 d, K05–K06 engagerade 90 d, K07–K14 samtycke.
  **Ändrat 2026-09-27 för Spoks** (`KUNDRESA.md` §4): Spoks saknar händelsehistorik för
  importerade kontakter, så engagemangssegmenten hade 19 medlemmar, och förra säsongens
  2 415 köpare med samtycke får inget flöde alls. Därför: K01–K02 samtycke (Spoks egen
  uppvärmning gäller), K03 engagerade 60 d om segmentet nått 300 annars samtycke, K04
  samtycke, **K05–K06 `SEG_kopare_forra_sasongen`**, K07–K14 samtycke. Publiken väljs av
  Axel i appen vid schemaläggningen (MCP:n kan inte); sessionen säger vilket segment varje
  vecka.
- Ingen rabatt utan Axels beslut. **Black Week: Axels beslut 2026-09-25, samma trappa
  som Bäverbutiken på hela sajten:** 10 % på 1 vara, 20 % på 2, 30 % på 3 eller fler,
  23/11 00:00 till 1/12 00:00, som tre schemalagda automatiska rabatter i Shopify.
  ⚠️ Matstrumpors vanliga erbjudande "Köp 1, få 1" är rabattkoder, och automatiska
  rabatter kombineras inte med koder om Axel inte säger annat: se README-avsnittet.
- Leveranstiden skrivs aldrig i ett mejl (spårningssidan visar den).
- Sushin har inget jämförpris över priset: aldrig spara/rea om sushin.
- Nya sorter under hösten får en plats genom att flytta en tisdag, inte genom fler utskick.
- **Veckans dragning (2026-09-27):** från och med den första skarpa klubbdragningen
  (`/klubbdragning kör`, tisdag morgon) bär varje tisdagskampanj blocket i
  `VECKANS-DRAGNING.md` sist i brödtexten (Premiär första gången, sedan Återkommande).
  Bara tisdagar med en skarp rad i `klaviyo/konto/matstrumpor/dragningar.jsonl`; ingen
  dragning ⇒ inget block. K01 (schemalagd) rörs inte; K02 6/10 är första kandidaten.
