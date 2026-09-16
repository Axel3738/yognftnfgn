# /vi-testade – "Vi testade PRODUKTEN i N dagar" (listicle) för en produkt

Argument: `$ARGUMENTS` — länken till produktsidan på Bäverbutiken, eller
flera länkar (en sida per länk, i tur och ordning — reglerna i
`/lagerrensning` → "Flera produkter i samma kommando" gäller). Valfritt
`--butik <id>` (standard: Bäverbutiken när länken är baverbutiken.se; annars
ett OPS-id som `carashell`), `--torr` (visa planen, bygg inget, rör inte
butiken), `--igen <plats>` (generera om en bild), `--gempages` (dessutom en
.gempages-fil), `--brand baverbutiken` (brandad — BARA om Axel ber om det),
`--marknad <KOD>` (samma sida på en annan marknad, t.ex. `US` — reglerna i
`/lagerrensning` → "Samma sida på en annan marknad"; copyn heter
`copy.en.json`, författarraden blir "Anders, who tested it himself").

```
/vi-testade https://baverbutiken.se/products/satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford
/vi-testade https://baverbutiken.se/products/strandtofflor-for-herr-halkfria-tradgardsskor --torr
/vi-testade https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan --butik carashell
```

**Det här är ett syskon till `/lagerrensning`.** Samma mall, samma motor
(`listicle/bygg.mjs --koncept vi-testade`), samma leverans: **sidan läggs
upp direkt i butiken** som `/pages/<slug>-vi-testade`, utan header, footer
eller meny (Axels beslut 2026-09-16: inga GemPages-kostnader per butik).
**Järnreglerna 2–7, läsbarhetstestet och stegen 0–1 och 4–8 är identiska
med `/lagerrensning` — läs `.claude/commands/lagerrensning.md` FÖRST och
följ den, med `--koncept vi-testade` i varje `bygg.mjs`-anrop och
utdatamappen `listicle/output/vi-testade/<handle>/`.** Det här dokumentet
är bara det som skiljer: konceptet, perioden och copy-skelettet.

## Konceptet

En person (Anders) berättar hur det gick när han använde produkten under en
bestämd period. Sidan läses som en testrapport, inte som en rea. Därför:

- **Rubriken bär perioden.** "Vi testade [produkten] i [period] — det här
  hände." Motorn varnar om rubriken saknar dag/vecka/månad/vinter/sommar/
  säsong. Perioden återkommer i ingressen, i punkt 5 och i domen.
- **Inga påhittade mätvärden.** Den enda siffran på sidan är priset (och
  jämförpriset om produktsidan har ett). Inga grader, procent, timmar,
  "mätte", "vägde", inga daterade väderhändelser, inga konkurrentnamn.
  Observationerna ska gå att härleda ur produktsidans fakta (material,
  funktion, mått, passform) och DNA:ts bevisade vinklar — det är samma
  regel som "Hitta aldrig på data" i CLAUDE.md, tillämpad på en berättelse.
- **Sidfoten säger "OBS: Detta är reklam."** som på alla listiclar. Det är
  sidans ärlighet; berättelsen får inte lova mer än produktsidan gör.
- Priset är inte poängen. `jämförpris` behöver inte stå i rubriken (motorn
  varnar inte). Finns ett jämförpris får det nämnas i lyckas-blocket.

## Perioden väljs efter produkten (Axels regel 2026-09-16)

"X antal dagar ska ju då vara i hänsyn till vad det är för produkt."
Kortaste period som räcker för att produktens löfte ska synas — inte längre.

| Produkttyp | Period i rubriken | Varför |
|---|---|---|
| Skydd/överdrag/kapell som står ute (motorhölje, sätesöverdrag, taköverdrag, tanköverdrag) | **en hel vinter** / **en hel säsong** / **hela hösten** | Slitaget syns först efter regn, sol och kyla; 14 dagar bevisar inget |
| Redskap som används per pass (axelbälte, spöhållare, damasker) | **en hel sommar** / **hela fiskesäsongen** | Nyttan är summan av många pass |
| Förbrukning och vardag (tofflor, disktrasor, kläder) | **14 dagar** eller **30 dagar** | Vanan sätter sig på två veckor; en vinter är orimligt |
| Teknik med batteri/uppkoppling (kamera, glasögon) | **30 dagar** | Batteri, larm och app visar sig på en månad |
| Säsongsvara (adventskalender) | **hela december** | Perioden är produktens egen |

Skriv perioden i vardagsord ("en hel vinter", inte "en vinterperiod om 90
dagar"). Passar ingen rad: välj närmaste och säg i rapporten varför.

**Skyddsprodukter får dessutom jämförelsen "vad hade hänt utan den":** vad
man annars hade fått göra (skrapa, polera, byta, sy, torka, köpa nytt) och
vad det kostar i tid — utan påhittade kronor eller timmar. Det är hela
poängen med en lång period: läsaren ser slitaget som INTE kom.

## De fem punkterna (skelettet)

| Punkt | Rubrikform | Vad punkten gör |
|---|---|---|
| 1 | "1. Dag 1: …" / "1. Första passet: …" | Uppackningen och första användningen — hur den satt/passade/kändes, en konkret detalj ur produktbilderna |
| 2 | "2. Första [regnet/veckan/passet med tung trimmer]: …" | Första gången det spelade roll — problemet produkten finns för dök upp, och vad som hände |
| 3 | "3. Det här hade hänt utan den" | Jämförelsen: vad man annars hade fått göra eller stått ut med (skydd: slitaget som uteblev; redskap: tröttheten/krånglet som uteblev; vardag: rutinen som blev enklare) |
| 4 | "4. Det som förvånade" | Detaljen man inte väntade sig — ett material, en passform, ett spänne — OCH en ärlig anmärkning (något som var sämre än väntat, utan att sänka köpet) |
| 5 | "5. Efter [perioden]: domen" | Så såg det ut / så kändes det i slutet av perioden; vad som återstod att önska; om produkten var värd priset ("599 kr på en hel sommar" är ok — det är produktens pris) |

Punkt 1 → 5 är en berättelse i tidsordning, inte fem argument. Varje punkt
slutar med en knapp till produktsidan (knappen får vara lugn: "Se
axelbältet →", inte "Köp nu").

**Lyckas-blocket** heter "Så vad säger vi efter [perioden]?" — domen i två
stycken: vad produkten faktiskt gjorde + produktsidans fakta (material,
passform, garanti). **Ärlig-blocket** ("Jag ska vara ärlig:") är här den
viktigaste ärlighetsmarkören: vem produkten INTE passar och vad som inte var
perfekt — skrivet så att rätt köpare känner igen sig. **Riskfritt** = 30
dagars garanti från produktsidan, som vanligt.

## Copy — skillnader mot /lagerrensning

- Rubriken: perioden i stället för priserna. Priset får stå i en knapp och i
  domen, aldrig som "istället för" om produktsidan saknar jämförpris.
- Formen: `listicle/mall/exempel-copy.json` (samma nycklar, 5 punkter).
- Författarraden på en obrandad sida blir "Av **Anders, som testade den
  själv.**" (konceptets standard; brandad sida: brandets författare).
- Inget butiksnamn, inga betyg, inga kunder, ingen procent — som förut.
- Läsbarhetstestet gäller varje stycke. En testberättelse som hackar låter
  påhittad. Läs hela sidan högt en sista gång: låter det som en person som
  faktiskt haft grejen i en vinter?

## Bilderna

Rollerna följer berättelsen: punkt 1 = produkten nyss uppackad/påsatt
(produktbild), punkt 2 = i väder/i bruk (produktbild eller kie: produkten i
miljön, regn/sol/gräs, inga människor), punkt 3 = det slitna alternativet
(kie: en oskyddad/utsliten motsvarighet — samma roll som lagerrensningens
punkt 1), punkt 4 = närbild på detaljen (produktbild), punkt 5 = produkten
efter perioden i sin miljö (produktbild). `lyckas` = hela produkten på ljus
bakgrund. Lagerbilden (`arlig`) får bytas här om en produktbild passar bättre
som "efter perioden"-bild — skriv den i bildplanen med `"arlig": { … }`.

## Rapport till Axel (kort, svenska)

Som `/lagerrensning`, plus: vilken period som valdes och varför (raden i
tabellen), och vilka jämförelser "utan den" som gjordes. Sist:

1. Öppna `https://<butik>/pages/<slug>-vi-testade` och läs igenom en gång.
2. Peka annonserna med "vi testade"-vinkeln på den adressen.

## DEFINITION OF DONE
- [ ] Underlag hämtat; pris (och ev. jämförpris) lästa ur butiken; inget betyg
- [ ] Perioden vald ur tabellen, motiverad, och samma i rubrik, ingress, punkt 5 och domen
- [ ] Fem punkter i tidsordning; punkt 3 bär "utan den"-jämförelsen (skydd/redskap) eller rutinskillnaden (vardag)
- [ ] Inga siffror utom priset; inga daterade händelser; inga konkurrenter; observationerna spårbara till produktsidan/DNA
- [ ] Copy skriven av huvudsessionen; läsbarhetstest + tre-frågorstest redovisade
- [ ] Obrandad (inget butiksnamn), "Anders, som testade den själv"
- [ ] `--torr` utan ❌; skarp körning: bilder på CDN, sidan uppe i butiken och läst tillbaka utan header/footer
- [ ] Skärmdumpar tittade på; batch-log uppdaterad om produkten har minne; committat och pushat
- [ ] Rapport + Axels klick sist, numrerade
