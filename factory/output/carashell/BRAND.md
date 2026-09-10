# CaraShell — brandsteget (fas 1, steg 2–3)

Datum: 2026-09-10. Källa: `/ny-ops` med EN Bäverbutik-länk + kravet att butiken
är `yitrbk-m3.myshopify.com`. Steg 0: **Connected: yitrbk-m3.myshopify.com ✓**
("My Store 4", SEK, Horizon, inga produkter, appen "Factory" med alla 16 scopes).
Enproduktsbutik i dag; brandet bär nischen **skydd för husvagn och husbil**, så
nästa produkt (hjulskydd, termoskydd, dragkulsskydd …) är bara en produktfil till.

## Källprodukten

| | Taköverdrag Husvagn 6,5 × 3 m – Skyddar Den Dyraste Ytan |
|---|---|
| Handle | `takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan` (id 16516659937629) |
| Pris | 1 129 kr (jämförpris 1 469 kr) |
| SKU | `TEMU-5050206311352` — 13 siffror, inte ett Temu goods_id (de har 15). Leverantörslänken kan inte härledas; **Axel bekräftar leverantören** |
| Bilder | 4 (husbil med överdrag snett framifrån, framifrån, hopvikt + detaljer, spännband med krokar) + GIF (övertoningar mellan samma bilder). **Ingen inbränd text** på någon av dem (lästa 2026-09-10) |
| Recensioner | 10 st i Judge.me, snitt 5,00 — **alla med tidsstämpel 2026-09-08 22:48 UTC** inom 12 sekunder, alltså API-importerade i källan. Alla titlar tomma. Det är källans `created_at`; inga äkta kunddatum finns |
| Källkampanj | MagiBorsten `120250147343350291` "Taköverdraget för Husvagn 6,5 × 3 m \| BE ROAS 1.63 \| Launch 2026-09-09", 1 800 kr/dag, 16 annonser ACTIVE, prefix `Takoverdrag_`, **2 563 kr spend / 15 köp / ROAS 6,61** t.o.m. 2026-09-10. Vinnare: `Takoverdrag_PD_2_H1` (1 451 kr, 6 köp) |

Kaching-nivåer ur källsidans JSON (`output/takskyddet/kalla-kaching-paket.json`):
1 st 0 % · **2 st 15 % "Mest populär" (förvald)** · 3 st 20 %. Identiskt med
fabrikens standard-A, så `offer.paket` lämnas på defaults. Mitten förvald.

**Inköpskostnaden är HÄRLEDD, inte kvitterad:** kampanjnamnets BE ROAS 1,63 och
formeln i `docs/temu-launch-flow.md` (pris / (pris − inköp)) ger
1 129 − 1 129/1,63 = **436 kr**. Axel bekräftar mot Temu-kvittot innan talet
får döma annonser.

## Bilderna är facit

Helintegrerad husbil (vit) med ett svart överdrag som täcker taket och hänger
ner 30–40 cm över sidorna. Elastiska spännband med svarta plastkrokar går ner
längs karossen och hakar under kanten — sex–åtta band synliga per sida.
Detaljbild: hopvikt/hoprullat paket i famnstorlek, vävstruktur, två krokar på
band. **Källtexten säger "husvagn", bilderna visar en husbil** — produkten
passar båda och copyn säger båda. **Okänt och därför aldrig påstått:**
förvaringspåse (nämns i källtexten, syns inte), dragsko (syns inte, bara
elastiska band), vikt, exakt vilka vagnlängder måtten passar.

## Köparanalys

Husvagns- eller husbilsägare 45–70 som ställer upp fordonet utomhus över
vintern — på tomten, uppställningsplatsen eller campingens vinterplats.
Fordonet är värt 200 000–1 000 000 kr och är familjens sommar. Rädslan är
**fuktskadan**: taket är ytan ingen går upp och kollar, regnvattnet står kvar
kring takluckor och skarvar hela vintern, tätmassan mjuknar, och fukttestet vid
vårservicen är stunden man fruktar. Alternativet alla känner är helöverdraget:
tungt, kräver två personer, skaver mot lacken hela vintern. Recensionerna säger
"skyddar taket", "när husvagnen står ute", "lätt att använda" — skydd + stå
stilla + en person.

Emotionen: att ha gjort det ansvarsfulla för något dyrt. Lugn hela vintern,
ingen klump i magen vid fukttestet.

Förväntat brand: en saklig utrustningsleverantör i husvagnsvärlden — Isabella,
Kama Fritid, Thule. Inte reaskrik, inte lifestyle med leende familjer.
Känsla: **trygg, robust, omsorgsfull, saklig.**

## Namnet

Namnregeln: helt engelskt, läsbart för svenskar och norrmän, aldrig å/ä/ö.

| Kandidat | Utfall |
|---|---|
| CaraCover | ❌ Brittisk husvagnsöverdragstillverkare (caracover.com, York) — samma nisch |
| CaraTop | ❌ Tyskt skyddstak för husvagn (klimatop.de) |
| RoofKeeper / VanRoof / CampRoof | Bara taket — låser brandet vid första produkten |
| **CaraShell** | ✅ Noll webbträffar. carashell.se / .no / .com utan DNS, .com ledigt i RDAP (2026-09-10) |

⚠️ RDAP för .se och .no går inte att nå härifrån: `rdap.org` svarar 404 även på
tankguard.se och google.se, `rdap.norid.no` 404 på tankguard.no. Kollen för
.se/.no är alltså DNS (tomt) — Axel ser det slutgiltiga svaret i Loopia.

**Tagline i loggan:** CARAVAN PROTECTION.

## Paletten

Väven och vädret. Grafit `#22282E` (som överdraget) bär allvaret i header,
sidfot och logga; ljus grus `#F1F2EF` bär ytorna — uppställningsplatsen efter
regn; **regnblå `#1F6F8E`** är den enda färgen som får ropa: skydd mot väder,
inte rea. Medvetet skild från de andra butikerna: inga skogsgröna
(TankGuard/DryTrek), ingen marinblå (HeimGuard/AdventLane), ingen mässing
(TackleBay). Typsnitt Barlow Bold (smal, teknisk, fordon) + Source Sans.

## Loggan

Loggfeedbacken före genereringen (`logga-feedback.mjs --sammanfatta`): 1 val,
c vann (TackleBay: "liv i den"), a och b aldrig valda. Regeln säger byt ut det
som aldrig valts mot något nytt — därför fick generatorn ett **nytt motiv `tak`**
(taklinje under en regnblå båge med två spännband) som a och b bär.
Tre varianter i `output/carashell/loggor-jamforelse.png`:
a emblem (grafit, motiv + CARASHELL + tagline) · b sigill (ljus, CARA/SHELL i två
rader) · c monogram (CS).

**Axel valde c** (2026-09-10, under bygget): "den mest neutrala — de andra två
passade inte produkten". Loggat med `logga-feedback.mjs carashell c --motiv tak`.
Lärdom för nästa butik: takmotivet (a/b) föll — Axel har nu valt c två gånger
av två, båda gångerna det rena ordmärket utan symbol. Faviconen genererades om
med `--motiv ingen` så den bär initialen C, inte taket.

## Bonusprodukt (Q4-ramverket)

Ingen komplementprodukt hittas på. **Kandidat i källbutiken:** "Termoskydd
Husbil 211 × 171 cm – Utvändigt och Mörkläggande", 559 kr, 3 bilder
(`termoskydd-husbil-211-171-cm-utvandigt-och-morklaggande`). Passar husbils-
köparen som betald korg-upsell (TackleBay-modellen: ingen gratis bonus), men
är en hel andra produkt med eget pris — Axels beslut. Tills dess körs paketen
utan gratisdel och bonussteget står som manuellt.
