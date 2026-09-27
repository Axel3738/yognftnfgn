# /klubbdragning – Klubbdragningen: tio medlemmar dras och får en låda (Matstrumpor)

Argument: `$ARGUMENTS` — inget = **torrt** (visar vilka som hade vunnit, skriver
inget i Shopify). `kör` = **skarpt** mot riktiga medlemmar. `test <e-post>` = hela
kedjan på EN egen adress (skarpt, men bara den kunden). Exempel: `/klubbdragning` ·
`/klubbdragning test axel.odhner@stonebite.org` · `/klubbdragning kör`

## Vad det är

Axels beslut 2026-09-27 (alternativ B, efter Evolves svar 9 i `klaviyo/evolve/SVAR.md`):
varje tisdag morgon dras tio medlemmar ur Matstrumpor-klubben av ett skript. Vinnaren
får sushilådan (5 par, 399 kr) hemskickad som en 0-kronorsorder, mot att hen skickar en
bild på sig själv med strumporna som får användas i klubbmejl och annonser. Förturen
är kärnan i klubbkänslan, dragningen är krydda och intäktsmaskin (Evolve).

| | |
|---|---|
| Butik | Matstrumpor (`1r46tp-qx`), appen "Fabriken" via `sparning/butik.mjs` |
| Skript | `klaviyo/klubb/dragning.mjs` (konfig `klaviyo/brands/matstrumpor.json` → `klubb.dragning`) |
| Spoks-flöde | **F08 Klubbdragningen (vinnarna)** `27047445-dcab-4898-9f92-5f55f2b77be3`, startar på kundtaggen `klubb-vinnare` (contact_tags_added) |
| Taggar | kund: `klubb-vinnare` + `klubb-vinnare-<datum>`; order: `klubb-dragning` + `klubb-dragning-<datum>`; VA:n sätter `klubb-bild-klar` när bilden kommit |
| Logg | `klaviyo/konto/matstrumpor/dragningar.jsonl` (inga personuppgifter), VA-listan i `klaviyo/output/matstrumpor/dragningar/<datum>.csv` (gitignorerad) |
| Innehåll | `klaviyo/innehall/matstrumpor/floden/f08-klubbdragning.json`, kampanjblocket `klaviyo/innehall/matstrumpor/VECKANS-DRAGNING.md` |
| VA:ns SOP | `kundtjanst/va-sop/club-draw-winners.md` (Notion: "Club draw winners — photos, consent, missing addresses") |

**CONNECTORS:** Shopify via fabrikens nycklar (`SHOPIFY_CLIENT_ID/SECRET_1r46tp_qx`),
inga MCP-verktyg för själva dragningen. Spoks-MCP:n behövs bara för kontrollen av
flödet (`get_flow`) och är valfri — saknas den, säg det och kör ändå.

## Spärrar (förhandlas inte)

- **Deltagandet är gratis och kräver inget köp.** Annars är det ett lotteri enligt
  spellagen. Skriv aldrig "handla för att vara med".
- **Aldrig handplockat.** Skriptet drar med HMAC-SHA256(frö, kund-id); fröet och
  kandidathashen loggas. Att välja en vinnare för hand är förbjudet, även "bara en".
- **En skarp dragning per datum.** `--igen` bara på Axels ord i klartext.
- **Totalen måste vara 0 kr** innan en order slutförs (skriptet vägrar annars).
- **Inga namn i repot, Discord eller Notion.** Förnamn + stad bara i ett mejl, bara
  med vinnarens ja (svaret på E1/E2). Efternamn aldrig. Bara vuxna på bild.
- **Skarpt utan att flödet är på = vinnare utan mejl.** Steg 2 stoppar då.

## Ordning

Ett kommando per Bash-anrop.

0. **Repot.** `git pull --rebase origin main` (eller grenen du står på), sedan
   `node --test klaviyo/test/dragning.test.mjs` — rött ⇒ stanna.
1. **Torrt först, alltid.** `node klaviyo/klubb/dragning.mjs` — läs: vinsten (rätt
   variant, rätt pris), antal kandidater, hur många utan adress, bortsorterade. Ser
   något konstigt ut (0 kandidater, fel produkt, `ej_samtycke` > 0): stanna och säg det.
2. **Flödet i Spoks** (bara vid `kör`/`test`): `get_flow` på F08 ⇒ `isActive: true` och
   alla tre sändstegen `isEnabled: true`. Annars stanna: det är Axels klick i
   https://app.spoks.com/matstrumpor/flows/27047445-dcab-4898-9f92-5f55f2b77be3.
3. **Skarpt.** `node klaviyo/klubb/dragning.mjs --skarpt` (eller `--test <e-post> --skarpt`).
   Utskriften bär maskerade adresser, ordernamn och eventuella fel. Ett fel på en
   vinnare stoppar inte de andra; felraden går till VA:n.
4. **Efterkoll (inom några minuter):** `get_flow` igen ⇒ inrullade ökade med antalet
   vinnare. Ökade det inte: taggen nådde inte Spoks som händelse ⇒ säg det rakt ut,
   vinnarna har order men inget mejl, VA:n mejlar dem för hand ur CSV:n, och flödet
   byggs om på `order_created` + ordertaggen (reservvägen i `klaviyo/spoks/README.md`).
5. **Committa loggen** (`klaviyo/konto/matstrumpor/dragningar.jsonl`) och pusha.
6. **Rapport.** Svenska till Axel: datum, antal, hur många utan adress, fel, länken
   till Shopify → Customers filtrerat på `klubb-vinnare-<datum>`. Engelska rader till
   VA:n står sist i skriptets utskrift (Matstrumpor har ingen Discord-server, så de
   går via chatten/Notion, aldrig som post).
7. **Kampanjen samma kväll:** tisdagens kampanj får blocket ur `VECKANS-DRAGNING.md`
   (Premiär första gången, sedan Återkommande) — bara om dragningen faktiskt körts.

## Definition of done

- [ ] Torrkörning läst och rimlig (vinst, kandidater, bortsorterade)
- [ ] Flödet F08 aktivt med sändstegen på (vid skarpt)
- [ ] Skarp körning: N ordrar/utkast, N taggade, fel listade
- [ ] Inrullade i F08 ökade med N (eller reservvägen rapporterad)
- [ ] Loggen committad och pushad, inga personuppgifter i repot
- [ ] Rapport till Axel med VA:ns rader på engelska
