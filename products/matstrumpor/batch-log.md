# Batch-logg — Matstrumpor

En rad per batch: hypotes → utfall → lärdom. Skrivs av `/matstrumporkungen`
och `/matstrumpor`. Minnet ligger här, aldrig i chatten.

---

## 2026-09-21 — systemet byggt (ingen batch)

Ingen brief skriven, ingen annons uppladdad. Det här är nollpunkten:
uppladdaren `/matstrumpor` och ronden `/matstrumporkungen` byggdes, och
läget mättes.

**Ärvd historik i kontot** (fanns före systemet, byggd av Axel och
redigerarna): 60 aktiva annonser i `MATSTRUMP_SALES_20260826`, varav 5
bedömbara. Siffrorna står i `dna.md`. Ingen av dem har en skriven lärdom —
det är den kö som ska betas av först.

**Kön i Notion vid mätningen:** 4 rader i `To be Reviewed`, alla videor från
Gilz Bruce Biazon (2026-09-15), döpta `022`, `023`, `024`, `025` med
Drive-länkar. De är **odöpta, inte trasiga** — uppladdaren namnger dem efter
att creativen setts.

**Etiketter:** noll. **Lärdomar:** noll. **Brieftak:** 0 tills lärdomarna finns.

---

## 2026-09-21 — första leveransen: 11 annonser live (Gilz batch, rad 022–025)

**Kön:** fyra odöpta rader i `To be Reviewed` (`022`–`025`, Gilz Bruce Biazon,
levererade 2026-09-15) med 11 videofiler i Drive. Uppladdaren tittade på varje
creative, valde vinkel och format ur det som FAKTISKT syns, och döpte dem.

| Rad | Hook (ordagrant, frame 1) | Vinkel | Annonser | Adset |
|---|---|---|---|---|
| 022 | "Den här julklappen är inte vad den ser ut som" · "…kommer med ätpinnar" · "Presenten de faktiskt kommer ihåg" | `jul` | `MATSTRUMP_sushi_jul_ugc_044h1/h2/h3_v1` | jul_video |
| 023 | "Min brorsa kommer ALDRIG gissa vad som finns i lådan" · "När din brorsa nämnde det för flera år sedan…" · "När din present visar sig vara hans favorit" | `gift` | `MATSTRUMP_sushi_gift_ugc_045h1/h2/h3_v1` | nya16 |
| 024 | "Gissa vad jag la i julstrumpan?" (julstrumpor över öppen spis) | `jul` | `MATSTRUMP_sushi_jul_ugc_046v1/v2_v1` | jul_video |
| 025 | "När du verkligen har slut på julklappsidéer" · "Barn i den här åldern är omöjliga att köpa julklappar till" · "Något roligt eller något praktiskt?" | `jul` | `MATSTRUMP_sushi_jul_ugc_047h1/h2/h3_v1` | jul_video |

**Byggt samma dag:** adsetet `broad_advplus_purchase_jul_video`
(`120251657101850023`, ACTIVE, 8 annonser) och
`broad_advplus_purchase_jul_bilder` (`120251657107430023`, PAUSED och tomt tills
en julbild finns). Båda kopierade ur `batch03_bilder`: SE, 18–65, Advantage+
broad, pixel `1785935302094082`, PURCHASE, ingen egen budget (CBO).

**Copy:** kontots befintliga, ordagrant ("Ingen jublar åt tvättmedel…",
rubrik "Rolig i kväll. På fötterna i morgon.", SHOP_NOW →
`/products/sushi-strumpor`). Ingen ny copy skrevs.

**Utfall dag 7:** läses 2026-09-28. Etiketten sätts då, lärdomen skrivs då.

⚠️ **Två saker att veta till nästa gång:** Meta kräver en thumbnail på varje
videoannons och tar bara publika URL:er, så frames läggs på butikens egen CDN
(`matstrumpor/thumbnails.mjs` → Shopify Files). Och Drive-delningslänken
fungerar inte, men `drive.usercontent.google.com/download?id=…&confirm=t` gör
det — mätt på alla elva.

---

## 2026-09-21 — domen på top spendern (Axels fråga)

`MATSTRUMP_sushi_gift_ugc_haikuh3_v1`, kontots största annons:

- **Etikett dag 7** (egna fönstret 27/8–2/9): **SPEND_WINNER** — 3 681 kr =
  **43 %** av kampanjens spend, men budgeten höjdes inte och ROAS 1,08 låg
  under break-even 1,498. Alltså **inte** breakthrough och **inte** loser.
- **Läget 14 dagar:** 7 776 kr, 17 köp, ROAS 0,93, CPA 457 kr mot break-even-CPA
  308 kr ⇒ **vinstbidrag −2 968 kr**.
- **Var den faller:** hook rate **95,2 %** (17 972 plays på 18 876 visningar —
  kontots bästa), hold rate 21,2 %, men bara **2,8 % köp per
  landningssidevisning** (9 köp på 321 LPV). Hooken bär; säljdelen och sidan
  faller.
- **Ordervärde 424 kr** mot kampanjens AOV 462 kr — den drar köpare till den
  mindre ordern.

Beslutet är Axels (han skalar själv). Ronden föreslog: pausa för att stoppa
blödningen, eller behåll hooken och bygg om det som händer efter sekund 3.

---

## Format för kommande rader

```
## <datum> — batch #N (<antal> annonser)

**Hypotes:** …
**Mix:** X vidarebyggen / Y nya vinklar — <varför, ur etiketterna>
**Lärdomar bakom:** L-<annons> …
**Annonser:** namn · typ (N/IM/I) · förälder · iteration · källa
**Uppladdat:** <datum>, adset per annons
**Utfall (dag 7):** etikett per annons, breakthrough-frekvens som bråk
**Lärdom:** länk till products/matstrumpor/lardomar.md#<id>
```
