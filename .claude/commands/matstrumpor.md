# /matstrumpor – Annonsuppladdaren för Matstrumpor (och BARA Matstrumpor)

Argument: `$ARGUMENTS` — inget (kör hela kön) eller `--torr` (planera, ladda
inte upp). Exempel: `/matstrumpor` · `/matstrumpor --torr`

Laddar upp färdiga creatives ur **Matstrumpors egen Notion-hub** till
**samma CBO Axel redan kör**, i rätt adset. Rör aldrig någon annan
verksamhet, aldrig något annat konto, aldrig en annan kampanj.

| | |
|---|---|
| Konto | **"nya kungen" `730973156224390`** (portfölj Matstrumpor.se, SEK) |
| Kampanj | `MATSTRUMP_SALES_20260826` — `120251217860260023`, CBO 1 000 kr/dag |
| Hub | `Matstrumpor creative hub` `3a7270ab-908c-80d2-9f35-e73e51e457ff` |
| Kö | Status **`To be Reviewed`** → uppladdad → **`Approved`** |
| Facit | `matstrumpor/konfig.json` — ändra tal DÄR, aldrig i den här filen |

⚠️ **Kontot HETER "nya kungen", inte Matstrumpor.** Kolla alltid
`ad_account_id`. Fem konton i Axels portföljer heter nästan samma sak och
fel konto kostar riktiga pengar.

⚠️ **`META_ACCESS_TOKEN` NEKAS på det här kontot** (mätt 2026-09-21:
`(#200) Ad account owner has NOT granted ads_management`). Allt som SKRIVER
i Meta går därför genom **Adsmanager-MCP:n** (`mcp__Adsmanager__*`) i en
session Axel startar. Finns inte de verktygen: **avbryt**, säg det rakt ut,
ladda inte upp något. En schemalagd rutin har inga `mcp__*`-verktyg — den
här kan alltså inte bli en nattrutin förrän kontot släppt in token:en.

---

## De fyra hinkarna

Allt går i **samma CBO**. Adsetet väljs UR ANNONSNAMNET, aldrig ur
filändelsen:

| Namnet innehåller | Adset | Id |
|---|---|---|
| vinkel `jul` + videoformat | `broad_advplus_purchase_jul_video` | skapas första gången |
| vinkel `jul` + bildformat | `broad_advplus_purchase_jul_bilder` | skapas första gången |
| annan vinkel + videoformat | `broad_advplus_purchase_nya16` | `120251218118710023` |
| annan vinkel + bildformat | `broad_advplus_purchase_bilder` | `120251218829760023` |

Videoformat: `ugc`, `beforeafter`, `comparison`, `lifestyle`, `anim`.
Bildformat: `static`, `product`, `textheavy`.

Kampanjens övriga aktiva adsets (`nya8`, `nya20`, `alla17`, `batch03_bilder`,
`09-17 UGC`) bär gamla batcher och **rörs aldrig** av uppladdaren.

---

Gör i ordning, utan att invänta godkännande mellan stegen:

1. **Läge och konto.**
   ```bash
   node matstrumpor/kor.mjs --kolla
   ```
   Visar konto, kampanj, adsets, nycklar och break-even. Verifiera kampanjen
   live med `mcp__Adsmanager__ads_get_ad_entities` (`level: "campaign"`,
   `object_ids: ["120251217860260023"]`, fältet `effective_status`).
   **Är kampanjen något annat än ACTIVE: ladda inte upp.** Rapportera det.
   **PAUSED med spend är ett beslut** — aktivera aldrig något som är pausat.

2. **Kön.**
   ```bash
   node matstrumpor/kor.mjs --ko
   ```
   Tre högar ut: `klara` (namn OK + fil finns), `behöver namn` 🏷️ och
   `stoppade` ⛔. Skriv ut ALLA tre i svaret — en rad som försvinner tyst är
   värre än en rad som stoppas.

3. **Döp de odöpta.** Redigerarna döper sina rader `022`, `023` … (Gilz fyra
   videor 2026-09-15). Ett sådant namn är inte ett fel, det är ett jobb:
   - Hämta creativen (Drive-länken sist på raden; `python3 tools/drive-ls.py`
     listar mappen, `tools/qa-frames.py` drar frames ur videon).
   - **Titta på den.** Välj vinkel och format ur vad du SER — vilken vinkel
     den faktiskt kör, inte vilken den borde köra. Julpynt, julmusik,
     "julklapp" i tal eller text ⇒ vinkeln `jul`.
   - Nästa lediga nummer (räknat ur kontot + hubben, aldrig i huvudet):
     ```bash
     node matstrumpor/kor.mjs --namn <vinkel> <format> [antal]
     ```
   - Döp raden i Notion, så namnet bor på ETT ställe:
     ```bash
     node matstrumpor/kor.mjs --dop <notion-sid-id> <nytt namn>
     ```
   - Kör `--ko` igen. Nu ska raden ligga i `klara`.

   ⚠️ Räkna numret ur BÅDE kontot och hubben. Namn utanför mönstret
   (`09-17 Nathalie captions musik`) räknas aldrig som upptagna nummer och
   döps aldrig om — de är Axels egna uppladdningar.

4. **Jul-adseten — skapa dem en gång, om kön kräver dem.**
   Kräver planen `jul_video` eller `jul_bild` och id:t saknas i konfigen:
   skapa adsetet med `mcp__Adsmanager__ads_create_ad_set` i kampanjen
   `120251217860260023`, som en **kopia av mallen** i
   `konfig.json → meta.malgrupp_mall` (avläst ur `batch03_bilder`):
   SE, 18–65, Advantage+ broad, `OFFSITE_CONVERSIONS`, `IMPRESSIONS`,
   `promoted_object` = pixel `1785935302094082` + `PURCHASE`.
   **Ingen egen budget** — kampanjen är CBO. Status `ACTIVE`.
   Läs tillbaka adsetet, skriv in id:t i `matstrumpor/konfig.json` och
   committa i samma push. Nästa körning skapar då inget nytt.

5. **Ladda upp, en creative i taget, och verifiera varje.**
   - Hämta filen: bilaga (`tools/notion-fil.mjs`) eller Drive-mappen
     (`tools/drive-ls.py`). Signerade Notion-URL:er är kortlivade — hämta vid
     körning, cacha aldrig.
   - `mcp__Adsmanager__ads_creative_upload_media` → `ads_create_creative` →
     `ads_create_ad` i **rätt adset enligt planen**.
   - Länken är radens `Landing page`, annars
     `https://matstrumpor.se/products/sushi-strumpor`. Pekar raden på en annan
     butik: **stoppa raden** (fel pixel bokför köpen på fel verksamhet, och
     det syns aldrig som ett felmeddelande).
   - Annonsen laddas upp **ACTIVE** — samma som Bäverbutikens leveransrunda.
   - **Läs tillbaka annonsen** (`ads_get_ad_entities`, `level: "ad"`) och visa
     id + namn + adset + status i svaret. En uppladdning utan tillbakaläsning
     är inte gjord.
   - Sätt radens status till **`Approved`** i Notion (Matstrumpor har ingen
     översättningskö — NO- och FI-kontona i portföljen saknar betalmetod).
   - Logga en rad per uppladdning:
     ```bash
     node -e 'import("./matstrumpor/kor.mjs").then(m=>m.skrivRad({kod:"UPPLADDAD",annons:"<namn>",annons_id:"<id>",adset:"<nyckel>",notion:"<sid-id>",datum:"<YYYY-MM-DD>"}))'
     ```

6. **Stoppreglerna** (samma två som `/notionkorning`, inget mer):
   - **Pris som avviker mer än 20 %** från produktsidan ⇒ kommentar i Notion,
     status `Draft`, ingen uppladdning. (Priset läses live ur
     `matstrumpor.se` — Sushi-Strumpor 399 kr för 5-pack, 369 kr för 3-pack,
     avläst 2026-09-21.)
   - **Fel landningssida** (annan butik) ⇒ samma sak.
   För bild är varje fel ett problem; för video bara priset — felstavningar i
   en video laddas upp ändå, med anmärkning till redigeraren.
   ⚠️ **En annons som redan är live stängs aldrig av i efterhand** (Axels
   beslut 2026-09-15). Hittar du ett fel efteråt blir det en anmärkning för
   nästa version, aldrig en paus.

7. **Committa och pusha** `matstrumpor/logg.jsonl` och en eventuellt ändrad
   `konfig.json`. En rutin som inte pushar har inte lärt sig något.

8. **Rapportera i två listor.** "Gjort av mig" (varje uppladdning: namn, id,
   adset, tillbakaläst) / "Väntar på en människa" (stoppade rader, adsets som
   behövde skapas, kön som inte hanns med). Axels uppgifter sist, numrerade,
   en mening per rad.

---

## DEFINITION OF DONE

- [ ] `ad_account_id` verifierat = `730973156224390` (aldrig på kontonamnet)
- [ ] Kampanjens `effective_status` läst live INNAN något laddades upp
- [ ] Alla tre högarna redovisade: klara / behöver namn / stoppade
- [ ] Varje odöpt rad döpt efter att creativen FAKTISKT setts — aldrig gissat
- [ ] Numret räknat ur kontot + hubben; inget namn krockar
- [ ] Jul-video och jul-bild i var sitt adset, resten i de två vanliga
- [ ] Nytt adset (om något skapades) kopierat ur mallen, utan egen budget, id inskrivet i konfigen
- [ ] Varje uppladdad annons tillbakaläst: id, namn, adset, status
- [ ] Prisspärren körd; stoppade rader kommenterade i Notion och satta till `Draft`
- [ ] Uppladdade rader satta till `Approved`
- [ ] Inget PAUSED aktiverat, inget annat adset rört, ingen annan kampanj rörd
- [ ] `logg.jsonl` (+ konfigen) committad och pushad
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
