# Temu-launchflödet (Drive → QA → Meta → Judge.me)

Dokumenterat 2026-08-29 ur Axels arbetsmaterial. Det här är flödet som ersätter
det manuella "mamma-jobbet": kolla videos, dubbelkolla produktsidor, ladda upp i
Ads Manager, importera recensioner.

## Källorna

| Vad | Var |
|---|---|
| Masterdokument (uppladdningsprompter + batch-sheet-länkar) | Google Doc `1CahFECAuXCFIzddKYD71vK3xWZM12DMUEkvmWSsIWJ0` |
| Batch-sheets #1–#5.1 (COGS per produkt och marknad, EUR) | Länkade i masterdokumentet — nya quotes läggs alltid där |
| Creatives per produkt | Drive: `Products/<produktnamn>/` (mapp `1Gga4QfZ0UfVC-q06BGGHN_fkSFN0Iygm`) |
| Launchade produkter | `Products/LAUNCHED/` · utfall i `Winners/` och `Losers/` |
| Judge.me-importmall | `Products/../Instructions for new test/Always do this .../direct_import_sample (1).csv` |
| Vinkel-exempel (swipes per vinkel) | `Instructions for new test/Main inspo ads/` |

Mapparna ligger på Axels stonebite-konto men är länkdelade — listas via
`https://drive.google.com/embeddedfolderview?id=<mapp-id>` när connectorns konto
inte ser dem (hjälpskript från sessionen: listar id + titel per rad).

## Creative-strukturen (identisk i alla ~33 produktmappar)

4 vinklar × 3 videor + 1 bildannons = 16 creatives:
`<Produkt>_CS_1..3.mp4` (Clearance sale) · `_G`/`_GT` (Gift) · `_PD` (Product
demo) · `_SP` (Social proof) · `_<vinkel>_2_1` = bildannonsen (PNG, ofta utan
filändelse i Drive). Videor 1080×1920, svenska captions inbrända.
Fil som bara heter produktnamnet → kategoriseras som PD (Axels regel).

## Ekonomin

- **Bäverbutiken säljer UTAN moms** — marginal räknas rakt på priset.
- Total inköpskostnad SE = `Total tax exclusive` (ur batch-sheetet) **+ 2,9 EUR**.
  Norge/UK: ingen tulladd (utanför EU). DK/FI: + 2,9 EUR.
- Break-even-ROAS = pris / (pris − inköpskostnad i SEK).
- **Kampanjnamnet ska innehålla break-even-ROAS + launchdatum** (Axels regel).
- Testbudget ny produkt: 1 000 kr/dag.

Exempel badshorts (batch #4 "Funny swim shorts"): 3,77 € produkt + 6,98 € frakt
+ 2,9 € = 13,65 € ≈ 152 kr → BE-ROAS **≈ 1,61** vid pris 399 kr. Frakten är ofta
den stora posten — nästan dubbla produktkostnaden här (make-to-order, 3D-print,
8–10 arbetsdagar).

## QA före launch (det gamla "mamma-jobbet", nu maskinellt)

1. Ladda ner alla creatives ur produktmappen.
2. Dra frames ur videorna (ffmpeg via `imageio-ffmpeg`), läs ALL inbränd text.
3. Kontrollera mot Shopify-produkten: pris, rabattclaims mot jämförpris,
   stavning (butiksnamnet!), produktnamn.
4. Bildannonser: samma kontroll.
5. Verifierade fynd 2026-08-29 (badshorts, första testkörningen):
   "väverbutiken" felstavat i CS_1 vid ~13 s; "50% RABATT" när jämförpriset gav
   23 % → jämförpris höjt till 798 kr (Axels beslut).

## Uppladdning till Meta (ur masterdokumentets prompter)

- Samma struktur varje gång, nya adsets per koncept/vinkel, aldrig creative
  enhancements. Ny batch = nya adsets, utspritt per koncept.
- Samma copy som tidigare körts på konceptet.
- Skalning till NO/DK/FI/UK: egna annonskonton `Magiborsten NO/DK/FI/UK`,
  break-even per marknad i kampanjnamnet.

## Recensioner och ad copy — per produkt i Drive

Ligger som Google-filer bredvid creatives (kan släpa: skapas ibland efter
medierna och syns då inte direkt för alla konton):

- **`<Produkt>_REVIEWS`** (Sheet/xlsx): Judge.me:s direct-import-kolumner
  rakt av — `title,body,rating,review_date,reviewer_name,reviewer_email,
  product_id,product_handle,reply,picture_urls`. Svenska recensioner.
  `product_handle` står som platshållaren
  `not-a-real-product-handle-so-this-review-wont-import` — **importsteget
  byter den mot produktens riktiga Shopify-handle**, annars importeras inget
  (medvetet felsäkert). `reviewer_email` lämnas tom — hitta aldrig på adresser.
  Importen görs via Judge.me:s REST-API (`api.judge.me`), ingen CSV-uppladdning
  behövs. Kräver butikens Judge.me API-token.
- **`<Produkt>_ADCOPY_<vinkel>`** (Doc, en per vinkel; äldre namnvariant
  `<Produkt>_<vinkel>_ADCOPY 1`): tre block — **PRIMÄRTEXT** (Metas primary
  text, emojis + ✅-listor), **RUBRIK** (headline), **BESKRIVNING**
  (description). Mappas rakt mot annonsens fält vid uppladdning.

Exempel i äldre produkter: `Mobilskal_REVIEWS.xlsx`, `MOWER-SEAT-GRA_ADCOPY_PD/SP/SO`.
