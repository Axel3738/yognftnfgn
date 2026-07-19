# Kostnad & Marginal – Dashboard

En självständig dashboard som kopplar **inpriser (COGS)** till varje produkt i
Grillklinikens sortiment och räknar fram marginal per produkt/variant.

## Filer

| Fil | Vad |
|-----|-----|
| `index.html` | Dashboarden – öppna direkt i webbläsaren, ingen server behövs. All data ligger inbäddad. |
| `kostnader.json` | Rådatan (56 rader) extraherad från offertbladet, inkl. målpris för 60 % marginal. |
| `prisforslag-60.csv` | Prislista: nuvarande pris → nypris för minst 60 % marginal, per produkt. |
| `GRILLKLINIKEN_PRODUKTER.xlsx` | Ursprungligt offertblad från leverantören. |

## Vad den visar

- **Inpris (SEK)** per produkt = landat inköp (produktpris + frakt i USD) omräknat
  med kursen i offertbladet (`1 USD = 9,6376 SEK`, 2026-07-07).
- **Marginal** = pris − inpris. Priserna räknas **utan moms** (Grillkliniken säljer
  utan moms), så marginalen räknas rakt på priset.
- **Prisläge:** *Nuvarande priser* vs *Målpris 60 %* – det senare visar vilket pris
  varje produkt behöver för minst 60 % marginal (inpris ÷ 0,4, avrundat uppåt till
  “-9”-slut). 24 av 47 produkter behöver höjas; resten ligger redan över.
- Sorterbar/sökbar tabell, statusfilter (aktiva/olistade) och **CSV-export**.

Färgband: grön ≥ 60 %, gul 45–60 %, röd < 45 %.

## Uppdatera datan

Datan är inbäddad som en `DATA`-konstant i `index.html` (och speglad i
`kostnader.json`). När nya inpriser kommer in: uppdatera offertbladet, kör om
extraheringen till JSON och ersätt `DATA`-blocket i `index.html`.

9 produkter saknar ännu inpris i offertbladet (t.ex. Knivset 6-pack, Portabel
Utomhusgrill, Premium Smashburger Kit) och visas som `–`.
