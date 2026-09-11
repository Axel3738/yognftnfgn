# CaraShell — Creative DNA

Produkt: Taköverdrag Husvagn & Husbil 6,5 × 3 m (`takskyddet`).
Butik: carashell.se. Konto: MagiBorsten DK `915422744950975` (SEK).
**Status 2026-09-11: noll egen data.** Allt nedan är ÄRVT från Bäverbutikens
källkampanj och ska bekräftas eller falsifieras av CaraShells egna siffror.

---

## Ekonomin (räknad, inte gissad)

`factory/ekonomi.mjs` på produktfilens tal, `ekonomi.moms_antagen: false`:

| | Utan moms (husets antagande) | Med moms 25 % |
|---|--:|--:|
| Täckningsbidrag | 693 kr | 467 kr |
| Break-even-ROAS | **1,63** | 2,42 |
| Break-even-CPA | **693 kr** | 467 kr |
| Target-ROAS | 2,75 | 4,68 |
| Target-CPA | 411 kr | 241 kr |

⚠️ **`inkopskostnad: 436 kr` är HÄRLEDD, inte kvitterad.** Talet är baklängesräknat
ur källkampanjens namn ("BE ROAS 1.63"), inte läst på ett Temu-kvitto. Kill-beslut
mäts mot break-even — bekräfta talet mot kvittot innan det får döma en annons.

⚠️ Butiksfilen säger `moms_i_pris: true`, produktfilen `moms_antagen: false`.
Det är INTE en motsägelse: `factory/ekonomi.mjs` slår fast att `moms_i_pris`
styr butikens PRISVISNING och aldrig en kill-linje. Ändra inte det ena för att
"matcha" det andra.

---

## Vinklarna, i ärvd styrkeordning

1. **PD — "taket är ytan du aldrig ser, och den som kostar mest att laga."**
   Källans bärare: 2 205 kr spend, 9 köp över tre hooks (`PD_1/2/3_H1`), plus
   bildannonsen `PD_2_1`. Enda vinkeln som passerar signifikansgrinden.
   Konflikt typ A mot helöverdraget: tungt, kräver två personer, skaver mot lacken.
2. **GT — presenten till husvagnsägaren.** `GT_2_H1`: 499 kr, 4 köp, ROAS 9,04.
   Under grinden på spend men över på köp. Säsongsberoende (jul).
3. **CS — erbjudandet 1 469 → 1 129 kr, 23 %.** Låg spend, hög ROAS i källan.
4. **SP — social proof.** Svagast i källan. ⚠️ CaraShell har TIO recensioner,
   alla fem stjärnor, alla importerade från källproduktens Judge.me samma minut
   (2026-09-08 22:48 UTC). Det är källans originaldatum, inte kunddatum, och
   butiken har sålt noll enheter. Varje volympåstående ("tusentals", "fler och
   fler") är därför falskt och får aldrig skrivas.

---

## Rotorsaker och regler som gäller den här produkten

**1. Priset är identiskt med källans — kolla ändå varje gång.**
1 129 kr / 1 469 kr / 23 % hos båda. Noll pristal behövde ändras 2026-09-11.
HeimGuard hade samma tur; TankGuard hade det inte. Kontrollen är gratis.

**2. Det som är fel är VILLKOREN, inte brandnamnet.**
0 av 28 källannonser nämner Bäverbutiken någonstans. Men "30 dagars öppet köp"
satt i copy, i tal OCH inbränt i bild — CaraShell har 14 dagars ångerrätt.
Leta efter villkoren först; brandnamnet är ofta redan borta.

**3. ⚠️ Tre påståenden om produkten får ALDRIG skrivas:**
"dragsko", "medföljande förvaringspåse", och vikt/exakta vagnlängder. Källans
egen produkttext och dess PD-manus påstår de två första, men de syns inte i
leverantörsbilderna och butiken kan inte belägga dem. **De står kvar i det
uttalade manuset i `CaraShellRoof_PD_1/2/3_H1`** — copyn är rättad, talet inte.
Ingen kod fångar det: det är varken brand, pris eller butiksvillkor. Läs den
här raden före varje ny brief.

**4. Det som FÅR påstås:** 6,5 × 3 m täcker hela takytan · svart väv 210D ·
elastiska spännband med plastkrokar som hakar under karossens kant · kanten
hänger 30–40 cm ner över sidorna · en person sätter på det själv · passar både
husvagn och husbil.

**5. Ingen brådska, ingen lagerbrist.** Butikens brandkonfig: "Lugna verb —
Lägg i varukorgen, Köp nu. Aldrig SISTA CHANSEN, ingen nedräkningstimer."
Källans CS-material bröt mot det i både bild och tal; båda är städade.

**6. Den norska marknaden säljer i SEK.** `factory/butiker/carashell.yaml`:
`marknader[0].valuta: SEK`. Ingen norsk annons får nämna pris förrän Axel slagit
på NOK i Shopify admin och satt NOK-paketnivåer. Källans norska CS-videor läser
upp 1 469 → 1 129 **kroner** och hålls därför tillbaka.

---

## Kvarstående blockerare 2026-09-11

| Blockerar | Vad | Löses av |
|---|---|---|
| ALLA annonser, båda marknaderna | Meta-sidan `1381171778405935` går inte att annonsera med (`error_subcode 1815813`). Sidan finns varken i businessens `owned_pages`, `client_pages` eller i `me/accounts`. Ett testanrop med HeimGuards sida går igenom — det är sidan, inte kontot. | Axel ger sig själv rollen på sidan i Business Manager |
| NO CS ×3 | NOK-paketnivåer saknas | Axel slår på NOK i Shopify admin |
| Kill-beslut | `inkopskostnad` 436 kr obekräftad | Axel mot Temu-kvittot |
| Talet i PD ×3 | säger "dragsko" och "förvaringspåse" | omdubb, eller Axels besked att det får stå |
