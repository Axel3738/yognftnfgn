# Räkningen — TankGuard, steg 9 i `/ny-annonser`

Körd 2026-09-09, andra körningen. **Annonser räknade ur
`act_915422744950975/ads`** — aldrig ur `advideos`/`adimages`. Media i kontot är
inte en annons. Skriptet är `factory/rakna-tankguard.mjs`.

## Källkontona — svepta på ALLA kampanjer

| Konto | Annonser i kontot | Med IBC-prefix | Kampanjer med prefixet |
|---|--:|--:|--:|
| MagiBorsten SE `1867947880635861` | 1 683 | **40** | 1 |
| Magiborsten NO `1050941584152547` | 581 | **33** | 1 |

SE: `IBC-Tanköverdraget | BE ROAS 1.51 | Launch 2026-08-28` (ACTIVE)
NO: `IBC-tanktrekk NO | BE-ROAS 1,63 | 2026-08-29` (ACTIVE)

⚠️ **Källkampanjen växte under bygget.** Den svenska hade 34 annonser när
brand-detektorn kördes och 40 samma kväll — sex nya videor tillkom mitt i.
Räkningen läser därför om källkontona precis innan den ställs upp. En körning
som räknar mot sin gamla lista säger "klart" om något som saknar sex annonser.

---

## SVERIGE — `TANKGUARD_SE_Tanköverdraget | 2026-09-08` (`120248995235740172`)

| Dom | Källa | Ska bli | Uppe | Saknas |
|---|--:|--:|--:|--:|
| `ren` (bild + video) | 21 | 21 | **21** | 0 |
| `kräver-omdubb` | 13 | 13 | **13** | 0 |
| `kräver-slutkortsbygge` | 5 | 5 | **5** | 0 |
| `okänd` (`PD_Extra`) | 1 | 0 | 1 ⚠️ | — |
| **Summa** | **40** | **39** | **40** | **0** |

**40 av 40. Ingen saknas. Allt PAUSED.**

Sju adsets (BOF, CO, CS, GT, PD, RV, SP), TankGuards egen sida `1399193996606775`
och egen pixel `2196132151319625`, geo SE, CBO 1 000 kr/dag,
länk `https://tankguard.se/products/tankoverdraget`.

### Vad som gjordes med de svenska videorna

| Grupp | Antal | Åtgärd |
|---|--:|---|
| `PD_1_H1/H2/H3` | 3 | Omdubbade. Bara EN talreplik bar brandet — ordet byttes, resten av manuset är produktmekanik. |
| `CS_1_H2/H3`, `GT_1_H1/H2/H3`, `SP_1_H1/H2/H3` | 8 | **Nytt manus.** Deras tal bar hela det falska erbjudandet respektive ett kundvittnesmål. Omdubbade OCH hela captionspåret utbytt. |
| `SP_3_H1`, `CS_4_H1` | 2 | Tillkom senare. `SP_3_H1` läste upp två påhittade recensioner, `CS_4_H1` hela rabatterbjudandet. Nytt manus, omdubb, captionbyte. `CS_4_H1` hade dessutom ett andra inbränt piller mitt i bilden ("489 kr, spara 147 kr") som byttes mot "489 kr per överdrag". |
| `GT_3_H1`, `PD_3_H1`, `GT_4_H1`, `PD_4_H1`, `PD_4_H2` | 5 | Talet var rent. **Slutkortet ombyggt** med `factory/slutkort.py` — ordmärke, recensionsrad och prispar. Noll HeyGen-credits. |

### Två rättelser i efterhand

**Fyra videor renderades om.** `GT_1_H2`, `SP_1_H1`, `SP_1_H2`, `SP_1_H3` fick
replikerna i fel ordning av en bugg i fördelningen — `SP_1_H3` slutade på en
utfyllnadsreplik i stället för sitt avslut. Nya proofread-sessioner, nya
renderingar, nytt captionspår, och annonserna pekades om till de nya
creativesen. Annonsernas id, namn, adset och status står kvar.

**Elva bildannonser fick sina pixlar bytta.** Den första bildgrinden sökte bara
pris, brand och stjärnor. En strikt omgrindning som också täcker frakt,
betalsätt, returrätt och kundetiketter hittade elva smutsiga bilder som redan
låg uppe: `BOF_1_1`, `BOF_2_1`, `BOF_6_1`, `CS_2_1`, `CS_3_1`, `CS_4_1`,
`RV_1_1`, `RV_2_1`, `RV_3_1`, `RV_4_1`, `SP_2_1`. Raderna är utbytta med
`factory/bildplaster.py` och annonserna ompekade.

### `PD_Extra` — uppe men pausad, utan dom
Talet gick aldrig att läsa och det finns inget transkript. Den laddades upp i
den allra första körningen, innan räkningsspärren fanns. **Pausad**
(`120249008687250172`). Ska inte gå ACTIVE förrän någon lyssnat på de tio
sekunderna.

---

## NORGE — `TANKGUARD_NO_Tanktrekket | 2026-09-09` (`120249012213810172`)

Samma konto som den svenska, PAUSED, 1 000 kr/dag, CBO. Sju adsets
(BOF, CO, CS, GT, PD, RV, SP). Targeting läst ur den norska källkampanjens eget
adset — geo `["NO"]`, aldrig en fallback-geo.
Länk: `https://tankguard.se/nb/products/tankoverdraget`. TankGuards egen pixel.

| Dom | Källa | Ska bli | Uppe | Saknas |
|---|--:|--:|--:|--:|
| Bild, media ren | 9 | 9 | **9** | 0 |
| Bild, media omplåstrad | 11 | 11 | **11** | 0 |
| Video, `replikbyte` | 3 | 3 | **3** | 0 |
| Video, nytt manus | 8 | 8 | **8** | 0 |
| Video, slutkort ombyggt | 2 | 2 | **2** | 0 |
| **Summa** | **33** | **33** | **33** | **0** |

**33 av 33. Ingen saknas. Allt PAUSED.**

### Den norska halvan är inte en kopia av den svenska

**Fördelningen är identisk, innehållet är det inte.** Åtta av elva norska videor
behövde nytt manus och tre räckte med ett ordbyte — exakt som Sverige. Men
manusen är egna: den norska copyn och de norska replikerna **nämner inget pris
alls**.

**Varför Norge är prisfritt:** TankGuard har inget känt NOK-pris i repot.
Källans 439/586 kr är Bäverbutiken NO:s tal, ett SEK-tal i en norsk annons
räknar fel, och ett påhittat NOK-tal är förbjudet. Priset står på `/nb`-sidan.
Sätts NOK-nivåer i butiken kan pris läggas till i copyn — då är det en
textändring, inte ett ombygge.

**NO-specifikt fynd:** de fyra norska RV-bilderna bar `baverbutiken.se` inbränd
i bilden. De svenska gör det inte — den norska lokaliseringen lade till domänen.

---

## Summan

| Marknad | Källa | Byggt | Läge |
|---|--:|--:|---|
| Sverige | 40 | **40** | ✅ komplett, allt PAUSED |
| Norge | 33 | **33** | ✅ komplett, allt PAUSED |

**KLART.** Varje källannons i båda kontona ligger uppe i sin marknads kampanj.

### Grindarna som passerades före uppladdning

| Grind | Omfattning | Utfall |
|---|---|---|
| OCR på färdiga svenska videor | 13 videor, 247 frames | 0 träffar |
| OCR på färdiga norska videor | 11 videor, 226 frames | 0 träffar |
| OCR på ombyggda slutkort | 5 videor, 48 frames | 0 träffar |
| OCR på omplåstrade bilder, NO | 11 bilder | 0 träffar |
| OCR på omplåstrade bilder, SE | 11 bilder | 0 träffar |
| Manuslängd mot källans taltid | 21 manus | alla ≤ 1,15× |

### Trippelkollen — tillbakaläst ur Meta 2026-09-09

| Nivå | SE | NO |
|---|---|---|
| Kampanj | PAUSED, 1 000 kr/dag, CBO | PAUSED, 1 000 kr/dag, CBO |
| Adsets | 7 — alla PAUSED, geo `SE`, pixel `2196132151319625` | 7 — alla PAUSED, geo `NO`, samma pixel |
| Annonser | 40 — alla PAUSED, sida `1399193996606775`, länk `/products/tankoverdraget` | 33 — alla PAUSED, samma sida, länk `/nb/products/tankoverdraget` |

Noll avvikelser. Ingen annons pekar på källbutikens sida, länk eller pixel, och
ingenting kan spendera.

### Röstkontrollen (CLAUDE.md järnregel 3)

**⛔ Första omgången underkändes av Axel 2026-09-09:**
*"Dom flesta voiceovers låter helt okej faktiskt"* blev efter mer lyssnande
*"det här må vara de sämsta annonserna jag sett — den saktar ner och sen
speedar upp hela tiden."*

**Orsaken, mätt:** manuset packades med flera repliker i samma cue. HeyGen
läser varje cue på exakt den cuens tid, så en cue med fyra gånger så mycket
text som källan lästes fyra gånger så fort — och nästa, som fick för lite,
drogs ut. Helhetsmåttet dolde det: CS_1_H3 låg på 0,72× över hela filen och
2,52× i cue 8.

`factory/rostkoll.py` mäter nu tecken per sekund per cue och rapporterar
**spridningen** mellan cues. Det är svängningen örat hör.

| | Första omgången | Omtagningen |
|---|---|---|
| Sämsta video | 10,29× (`GT_1_H3` NO) | 2,07× |
| Spann över alla 17 | 2,16–10,29× | 1,31–2,07× |
| HeyGen-läge | `fast` (default) | `quality` — avatar-inferens, munrörelserna renderas om |
| Manus | fri text, fördelad över cues | en replik per cue, inom cuens teckenbudget |

**Sjutton videor gjordes om** — nio svenska och åtta norska. Nya
proofread-sessioner, nya manus skrivna mot varje sessions egen cue-lista, nya
renderingar i quality-läget, nya captionspår, och annonserna ompekade till de
nya creativesen. Annonsernas id, namn, adset och status står kvar.

De sex `replikbyte`-videorna gjordes INTE om: de ligger på 1,45–2,62× och
matchar källvideornas egen spridning på tiondelen. Den svängningen finns i
Bäverbutikens original och är inget vi infört.

⚠️ **Ingen har ännu lyssnat på omtagningen.** Mätningen säger att tempot är
jämnt. Den säger ingenting om hur rösten låter.

⚠️ **Sjutton omdubbade filer är INTE avlyssnade ännu — sex svenska och elva norska:** `SP_3_H1`, `CS_4_H1` och de
fyra omrenderade `GT_1_H2`, `SP_1_H1`, `SP_1_H2`, `SP_1_H3`. De elva norska är
heller inte avlyssnade. En molnsession kan inte lyssna. De ligger PAUSED.

### Öppna ägarfrågor
- **Momsen.** Break-even är 1,46 utan moms i priset och 2,07 med. 42 % isär.
  Ingen annons ska dömas förrän frågan är avgjord.
- **Jämförpriset i annonsen.** Butikssidan visar 1 376 / 2 064 kr som överstruket
  på paketen. Ingen annons använder dem — de är paketsummor, inte enstyckspris.
- **NOK-nivåer.** Saknas. Den norska copyn är prisfri tills de finns.
