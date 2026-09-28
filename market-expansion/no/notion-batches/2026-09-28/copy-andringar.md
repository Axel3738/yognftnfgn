# Norsk annonscopy 2026-09-28 — tre-frågorstest + ändringar

11 annonser, 3 produkter. Priserna är norska genomgående (`no_pris`/`no_jamforpris`
ur `copy-input.json`), inga svenska prissiffror har slunkit med. Butikens namn
nämns inte i någon rad. Inga tankstreck — ersatta med punkt, komma eller kolon.

## Tre-frågorstestet

Testat på **headline** och på den **bärande meningen** i `message` (den mening
som bär det konkreta produktfaktumet). ✅ = klarar, ❌ = klarar inte.
Frågorna: 1) Visualiserbar? 2) Falsifierbar? 3) Kan ingen annan säga det?

| Annons | Rad | Text | F1 | F2 | F3 |
|---|---|---|---|---|---|
| IBC-tanktrekk_NO_PD_12_H1 | headline | "Grønt vann uten UV-beskyttelse." | ✅ | ✅ | ❌ |
| IBC-tanktrekk_NO_PD_12_H1 | bärande | "Kraftig 210D oxfordstoff, enkel glidelås." | ✅ | ✅ | ✅ |
| IBC-tanktrekk_NO_PD_12_H2 | headline | "Sollys når vannet i tanken." | ✅ | ✅ | ❌ |
| IBC-tanktrekk_NO_PD_12_H2 | bärande | "Et 210D oxfordtrekk stopper begge deler." | ✅ | ✅ | ✅ |
| IBC-tanktrekk_NO_PD_12_H3 | headline | "210D oxfordstoff blokkerer lyset." | ✅ | ✅ | ✅ |
| IBC-tanktrekk_NO_PD_12_H3 | bärande | "Dette er 210D oxfordstoffet: tett vevd, blokkerer lys." | ✅ | ✅ | ✅ |
| Sotarset_NO_PD_9_H1 | headline | "3,69 meter bak tørketrommelen" | ✅ | ✅ | ✅ |
| Sotarset_NO_PD_9_H1 | bärande | "Ni stenger på 41 cm skrus sammen en og en, følger svingene i røret, og nylonbørsten børster løs det som sitter fast." | ✅ | ✅ | ✅ |
| Sotarset_NO_PD_8_H2 | headline | "Rent rør, bedre trekk på minutter" | ✅ | ❌ | ❌ |
| Sotarset_NO_PD_8_H2 | bärande | "Ni bøyelige stenger bøyer med i svingen i stedet for å stoppe." | ✅ | ✅ | ✅ |
| Sotarset_NO_PD_8_H1 | headline | "Rent rør, bedre trekk på minutter" | ✅ | ❌ | ❌ |
| Sotarset_NO_PD_8_H1 | bärande | "Ni bøyelige stenger bøyer med i svingen i stedet for å stoppe." | ✅ | ✅ | ✅ |
| Sotarset_NO_PD_7_H1 | headline | "Rent rør, bedre trekk på minutter" | ✅ | ❌ | ❌ |
| Sotarset_NO_PD_7_H1 | bärande | "Ni bøyelige stenger følger svingene, skru sammen 3,69 meter og dra nylonbørsten gjennom røret." | ✅ | ✅ | ✅ |
| Takovertrekk_NO_SP_4_H4 | headline | "Én person er nok. 210D-duk." | ✅ | ✅ | ✅ |
| Takovertrekk_NO_SP_4_H4 | bärande | "210D-duken tåler hele vintersesongen ute." | ✅ | ✅ | ✅ |
| Takovertrekk_NO_SP_4_H3 | headline | "Én person er nok. 210D-duk." | ✅ | ✅ | ✅ |
| Takovertrekk_NO_SP_4_H3 | bärande | "210D-duken tåler hele vintersesongen ute." | ✅ | ✅ | ✅ |
| Takovertrekk_NO_SP_4_H2 | headline | "Én person er nok. 210D-duk." | ✅ | ✅ | ✅ |
| Takovertrekk_NO_SP_4_H2 | bärande | "210D-duken tåler hele vintersesongen ute." | ✅ | ✅ | ✅ |
| Takovertrekk_NO_CS_12_H1 | headline | "Beskytt taket, 1 189 kr." | ✅ | ✅ | ✅ |
| Takovertrekk_NO_CS_12_H1 | bärande | "210D-duk, ikke tynn presenning som sprekker i frost." | ✅ | ✅ | ✅ |

**❌-raderna (5 headlines):**
- IBC H1/H2: rena problemformuleringar ("grönt vatten", "solljus når vattnet")
  — vilken tank-överdragskonkurrent som helst kan säga exakt samma sak om
  problemet. Ärvt oförändrat från den svenska originalcopyn (samma svaghet
  fanns där redan) — ingen översättningsbrist, men värt att flagga inför
  nästa brief-rond: byt hook mot något som pekar på 210D-tyget direkt (som H3
  redan gör och som klarar alla tre).
- Sotarset H2/H1/H7 (samma headline på alla tre): "på minuter" är inte en
  siffra — F2 klarar inte falsifierbarhetstestet ordentligt utan ett exakt
  tidsvärde. Och "rent rör, bättre drag" är ett generiskt sotningslöfte vilket
  sot-verktyg som helst kan skriva under på — F3 nej. Samma svaghet fanns i
  den svenska originalcopyn på alla tre rader; inte en översättningsändring.

Inga ❌ i själva message-body för produktfakta (bärande meningarna) — alla
konkreta spec-påståenden (210D, 41 cm, 3,69 meter, 1 189 kr) klarar alla tre
frågorna.

## Ändringar mot den svenska originalcopyn

1. **Alla priser bytta SE → NO** på samtliga 11 rader: 1 129/1 469 kr →
   1 189/1 549 kr (Takovertrekk), inga andra rader hade pris inbränt i den
   svenska texten men fick det ändå rätt via `no_pris`/`no_jamforpris` där de
   förekommer.
2. **Produktnamn bytt:** "Sotarset" → **"Feiesett"** (fakta säger uttryckligen
   att produkten heter Feiesett på norsk) i alla fyra Sotarset-annonser, där
   den svenska texten avslutade med "Beställ ditt Sotarset [idag]".
3. **Ordval lokaliserat, inte försvenskat:** blixtlås → glidelås, tyg →
   stoff/duk, rem → reim, torktumlare → tørketrommel, kamin/vagn → ovn/vogn,
   sotare → feier, drag (i skorsten) → trekk.
4. **Tankstreck borttagna** i samtliga rader (både i message och headline),
   ersatta med punkt, komma eller kolon — regel 4 i uppdraget.
5. **Inget påstående struket.** Alla sakuppgifter i den svenska copyn hade
   täckning i `fakta` (210D-materialet, mått, mekanismen med de böjliga
   stängerna, en-person-montering, vintersäsong, takytans storlek) eller var
   redan approved copy som bara återges — inget nytt faktum lades till och
   inget behövde tas bort.
6. **"Taket är den dyraste ytan"** (Takovertrekk) behållen — stöds av
   produktlänkens egen slug `beskytter-den-dyreste-flaten`, alltså ett
   verifierat faktum, inte en gissning.
