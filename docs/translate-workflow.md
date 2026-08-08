# Översättningsflöde — bildannonser till nya marknader

Chatten fungerar som översättare för färdiga bildannonser. Dumpa filer, ange målspråk
(norska / finska / engelska), få tillbaka lokaliserade versioner med **samma filnamn**.

## Så funkar det

```
  1. DUMPA        → släpp bildfilerna i chatten (en eller flera)
  2. ANGE SPRÅK   → "norska", "finska" eller "engelska"
  3. LÄS AV       → Claude läser all text i varje bild (rubrik, USP:ar, CTA, badges)
  4. ÖVERSÄTT     → Claude gör en korrekt, idiomatisk översättning FÖRST
  5. GENERERA     → Higgsfield får bilden som referens + de exakta måltexterna:
                    "Återskapa exakt denna bild, byt bara ut texten mot: …"
  6. LEVERERA     → filerna skickas tillbaka med samma namngivningsstruktur
```

## Varför översättningen görs före genereringen

Om man bara ber bildmodellen "translate this image to Norwegian" översätter den
rakt av och stavar ofta fel. Därför görs den korrekta översättningen separat,
och Higgsfield får de **exakta strängarna** att rendera — inget lämnas åt modellen.

Regler för översättningen:
- Idiomatisk, inte ordagrann — copy ska låta som copy på målspråket.
- Valuta/priser konverteras INTE automatiskt (999 kr lämnas orörd om inget annat sägs).
- Varumärkesnamn (Mastern, Grillkliniken) översätts aldrig.
- Håll samma tonalitet och ungefärliga textlängd så layouten håller.

## Modellval i Higgsfield

`nano_banana_pro` — bäst på att rendera text korrekt i bild. Källbilden laddas upp
och skickas som referens så att layout, färger, produkt och komposition bevaras 1:1.

## Namngivning av output

Samma filnamn som källan (enligt `naming-convention.md`), men med **landskoden som
prefix** först i filnamnet — alltid, på varje fil:

```
NO_Enginecover_SO_5_1.png   ← norska
FI_Enginecover_SO_5_1.png   ← finska
UK_Enginecover_SO_5_1.png   ← engelska
```

Landskoder: `NO`, `FI`, `UK`. Leveransen sker som zip per marknad
(t.ex. `Motorholjet_annonser_NO.zip`) så att original och översättning aldrig krockar.

## Kvalitetskontroll

Varje genererad bild granskas innan leverans:
- Är all text på målspråket och korrekt stavad?
- Är layout, produktbild och färger intakta?
- Blev något textelement tappat eller tillagt?

Fel → regenerera med skärpt prompt innan filen skickas tillbaka.
