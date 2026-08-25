# Swipe — svenskhusman_socks × 5 → Sushi-Strumporna (2026-08-25)

**Källa:** 5 statiska feed-annonser från svenskhusman_socks (Meta annonsbibliotek,
skärmdump från Axel). Statics med primärtext + produktbild — **inte video**, så
swiparna är statics-copy, inte videomanus.
**Mål:** Sushi-Strumporna, Matstrumpor.se. 3 par 369 kr / 5 par 399 kr.
**Copy skriven av sonnet-subagent enligt `docs/copy-regler.md` (regel 6), hel-grön
i tre-frågorstestet.**

## Mekanik-karta

| # | Originalets mekanik | Vår översättning | VOC-insikt |
|---|---|---|---|
| 1 | Upptäcks-hook + sinnlig kollektionsstämning ("ljusa kvällar, blommande ängar") | Samma mjuka ton men konkreta bilder: boxen, bitarna, öppningsögonblicket | 3, 5 |
| 2 | Samma copy, produktnära bild (Prinsesstårtan) | Zoom på EN "bit": rullad strumpa = nigiri i sitt fack | 3, 4 |
| 3 | Utforska nyheter + brand-bevisrad ("sedan 2018, 450.000 nöjda kunder") | Utforska boxen + **sann** bevisrad (twist-mekaniken). ⚠️ Deras social proof-siffror har vi inte — ersatt, aldrig påhittad | 3 |
| 4 | Frågehook ("Vilket motiv är din favorit? ❤️") | Frågan riktas mot present-twisten: vem skulle gå på att det är sushi | 1, 3 |
| 5 | Kampanj/rea-copy (50 % sommarrea) + "perfekt för dig som…" ×3 | ⚠️ Ingen rea finns — offret översatt till verklig bundle-matematik: 5 par för 30 kr mer än 3 | 1, 4 |

## Annons 1 — Sushiboxen (kollektionsstämning)

**Primärtext:**
> Öppna locket och det ser ut som en sushibricka — rullade bitar i rad, olika färger, prydligt i varsitt fack.
>
> Titta en gång till. Det är strumpor. Mottagaren ser det på tredje sekunden, inte på första — och den som gav bort den sekunden blir ihågkommen.

**Rubrik:** Sushiboxen som inte är sushi
**Länkbeskrivning:** Strumpor rullade som sushi. matstrumpor.se
**Bild:** Öppen sushibox rakt uppifrån, alla bitar i rad. Mobil + dagsljus räcker.

**Hook-varianter:**
1. "Det ser ut som en sushibricka. Det är strumpor." — boxen halvöppen i hand.
2. "Locket går upp. Ansiktet gör resten." — händer som lyfter locket, boxen mot kameran.

## Annons 2 — Nigiribiten (produktnära)

**Primärtext:**
> En bit ur boxen: hårt rullad, ligger i sitt eget fack, formad precis som en nigiribit.
>
> Rullar du ut den är det ett par strumpor du faktiskt kommer ha på dig i morgon. Ärligt talat — strumpor tar man alltid emot.

**Rubrik:** En nigiribit. Fast strumpa.
**Länkbeskrivning:** Rullad som sushi, funkar som strumpa.
**Bild:** Närbild på EN rullad strumpa mellan två fingrar, boxen oskarp bakom.

**Hook-varianter:**
1. "Ser ut som nigiri. Känns som ett par strumpor." — biten läggs tillbaka i sitt fack.
2. "Den här biten går faktiskt att ha på foten." — biten rullas ut till strumpa.

## Annons 3 — Utforska boxen (nyheter + bevisrad)

**Primärtext:**
> Utforska hela sushiboxen — färgglada par, olika toner, alla rullade och packade som ett äkta sushi-set.
>
> Sushi-Strumpor: den enda strumpkollektionen som får folk att fråga "är det där sushi?"

**Rubrik:** Utforska sushiboxen
**Länkbeskrivning:** Färgglada strumpor, rullade som sushi.
**Bild:** Flatlay: boxen i mitten, några par utrullade runt om så färgerna syns.

**Hook-varianter:**
1. "Olika färger. Samma reaktion varje gång."
2. "Färgerna byter. Tricket byter aldrig."

## Annons 4 — Frågehook

**Primärtext:**
> Vem i din närhet skulle faktiskt tro att det är sushi i paketet?
>
> (Vi har en känsla om vem.)

**Rubrik:** Vem tror att det är sushi?
**Länkbeskrivning:** Öppna, titta, skratta. Sen använder man dem.
**Bild:** Boxen räcks fram mot kameran som en present, locket på glänt.

**Hook-varianter:**
1. "Vem skulle öppna paketet och tro att det var mat?"
2. "Present till någon som 'redan har allt' — den här går man på."

## Annons 5 — Bundle-offret (kampanjmekanik utan rea)

**Primärtext:**
> 3 par sushi-strumpor: 369 kr. 5 par: 399 kr.
>
> Skillnaden är 30 kr — typ priset på en kaffe — för två par till.
>
> Perfekt för dig som vill ge bort ett par, testa ett själv och ha tre kvar när nästa present dyker upp.

**Rubrik:** 2 par till för 30 kr
**Länkbeskrivning:** 3 eller 5 par sushi-strumpor. matstrumpor.se
**Bild:** Enkel kampanjgrafik i originalets stil: boxen + "3 par 369 kr · 5 par 399 kr", skarp vektortext ovanpå foto (compose-metoden).

**Hook-varianter:**
1. "Tre par eller fem — skillnaden är 30 kr."
2. "Fem par kostar nästan lika mycket som tre."

## Färdiga creatives (bildannonserna)

Byggda 2026-08-25, ligger i `docs/briefs/sushi-swipe-2026-08-25/` (1080×1350, 4:5).
Baserna är **riktiga produktfoton** hämtade från matstrumpor.se:s publika produktsida
(sushi-strumpor har 9 bilder där) — inte AI-genererade. A5:s pristext är komponerad
som skarp SVG-vektortext med `sharp` (husmetoden); byggskriptet ligger i samma mapp.

| Annons | Fil | Bas |
|---|---|---|
| 1 | `A1-sushiboxen-stamning.jpg` | Boxen på frukostbord (lifestyle, ljus) |
| 2 | `A2-narbild-bitar.jpg` | Bitar på fat, pastellbakgrund |
| 3 | `A3-hela-kollektionen.jpg` | Box + 5 par utsolfjädrade, vit bakgrund |
| 4 | `A4-bambubricka-illusion.jpg` | Bambubricka — ser mest ut som riktig sushi |
| 5 | `A5-kampanjgrafik.jpg` | Kampanjgrafik: "2 par till för 30 kr" + 369/399 kr + Shoppa nu |

Originalannonserna 1–4 har ingen text i bild (rena produktfoton + primärtext), så
swiparna följer samma mönster. Higgsfield behövdes aldrig — saldot (1,85 credits)
är dessutom för lågt för generering (0,5 credits/bild + omtagsmarginal).

### B-setet: AI-genererade studiobaser (kie.ai, 2026-08-25)

Genererade på Axels begäran via kie.ai (nano-banana-edit) med de riktiga
produktfotona som referens — det ger det originalen har men våra foton saknar:
strumpor **på fötter** i studio på enfärgad bakgrund. Samma mapp, 1080×1350.

| Fil | Motiv | Matchar original |
|---|---|---|
| `B1-fotter-bla.jpg` | Laxrandiga paret på fötter, ljusblå studio | Annons 1 (kanelbulle på blått) |
| `B2-fotter-rosa.jpg` | Maki-paret (prickar/svart band/grön tå) på fötter, rosa | Annons 2/4 (rosa studio) |
| `B3-fotter-gul.jpg` | Tamago-paret på fötter mot bordskant, gul | Annons 3/4 |
| `B4-presentogonblick.jpg` | Händer öppnar boxen mot kameran, hemmiljö | Frågehooken (A4-copyn) |
| `B5-flatlay-rosa.jpg` | Boxen uppifrån + ätpinnar, rosa | Annons 2:s pastellstil |

⚠️ **AI-brasklapp:** B4/B5 är mycket trogna verkliga boxen. B1–B3 har små
designavvikelser mot de riktiga strumporna (tå-/hälfärger) — jämför mot fysisk
produkt innan launch, eller kör A-setet (riktiga foton) där exakthet krävs.
API-nyckeln ligger INTE i repot; genereringsskriptet läser den ur env `KIE_KEY`.

## Tre-frågorstestet

Alla 20 rader (primärtexter, rubriker, hooks) testade: ✅ visualisera / ✅ falsifiera
/ ✅ ingen annan kan säga det — hel-grönt. Inga siffror utöver 369/399/30 kr,
ingen påhittad social proof, ingen påhittad rea.
