# CaraShell – Taköverdraget: svensk ad copy (4 block)

Källa: Bäverbutikens bevisade annonser (Takoverdraget_PD/SP/CS/GT). Regel: ändra
bara det som är fel för CaraShell, rör inget som fungerar. Butikens sanningar:
`factory/butiker/carashell.yaml` + `factory/produkter/takskyddet.yaml`.
Tre-frågorstestet: `docs/copy-regler.md`.

Länk (alla fyra block): https://carashell.se/products/takskyddet

---

## Block PD (problem/demo)

**Message:**
```
Taket på husvagnen är den ytan du aldrig kollar – och den som kostar mest att laga. 🏕️
✅ Skyddar mot regn, snö och UV hela vintern
✅ Spänns fast med elastiska spännband som hakar under karossens kant – klart på minuter
✅ En person klarar det helt själv
✅ Täcker hela taket – kanten hänger ner 30–40 cm över sidorna
Skydda husvagnens tak innan vintern gör det dyrt. 👇
```

**Headline:** Husvagnstaket – helt skyddat i vinter

**Description (bildannons):** Enkelt taköverdrag, 6,5 × 3 m. Fri frakt.

**Tre-frågorstestet (endast ändrade rader):**

| Rad | Visualisera | Falsifiera | Ingen annan kan säga det |
|---|---|---|---|
| Rad 2: "Spänns fast med elastiska spännband som hakar under karossens kant – klart på minuter" | ✅ | ✅ | ✅ |
| Rad 4: "Täcker hela taket – kanten hänger ner 30–40 cm över sidorna" | ✅ | ✅ | ✅ |

**Ändrat:** Rad 2 – "rem och dragsko" (obelagt, står inte i produktfakta) bytt mot
den verkliga fästmetoden: elastiska spännband med plastkrokar under karossens
kant. Rad 4 – "ryms i egen förvaringspåse" (obelagt, butiken kan inte belägga
det) bytt mot ett mått som går att peka på: kanten hänger 30–40 cm ner över
sidorna. Rad 1, rad 3, rad 5, headline och description är orörda.

---

## Block SP (social proof)

**Message:**
```
"Passar bra och skyddar taket mot väder." – Lars 🙌
Ett av 10 omdömen om vårt taköverdrag – alla fem stjärnor.
✅ Skyddar taket mot regn, snö och smuts
✅ En person sätter på det själv – ingen hjälp behövs
✅ 14 dagars ångerrätt enligt svensk lag
Läs varför husvagnsägare väljer det här inför varje vinter. 👇
```

**Headline:** Taköverdraget kunderna ger 5 stjärnor

**Description (bildannons):** Betygsatt av riktiga kunder. Fri frakt.

**Tre-frågorstestet (endast ändrade rader):**

| Rad | Visualisera | Falsifiera | Ingen annan kan säga det |
|---|---|---|---|
| Öppningscitat: "Passar bra och skyddar taket mot väder." – Lars | ✅ | ✅ | ✅ |
| Rad 2: "Ett av 10 omdömen om vårt taköverdrag – alla fem stjärnor." | ✅ | ✅ | ✅ |
| Rad 5: "14 dagars ångerrätt enligt svensk lag" | ✅ | ✅ | ❌ (lagstadgad, alla svenska butiker kan säga samma sak) |
| Headline: "Taköverdraget kunderna ger 5 stjärnor" | ✅ | ✅ | ✅ |

**Ändrat:** Öppningscitatet – det opåvisade citatet bytt mot Lars riktiga
recension, ordagrant, med namn. Rad 2 – "fler och fler" (obelagd trend) bytt
mot den faktiska siffran: 10 recensioner, alla fem stjärnor. Rad 5 – "30 dagars
öppet köp" (fel, butiken har 14 dagars ångerrätt enligt svensk lag) bytt mot
rätt villkor. Headline skriven om eftersom "älskar" antydde volym – ny headline
pekar på det faktiska betyget i stället. Rad 3, rad 4, sista raden och
description är orörda.

---

## Block CS (erbjudandet)

**Message:**
```
🔥 23% RABATT PÅ HUSVAGNENS TAKÖVERDRAG – IDAG 🔥
1469 kr → 1129 kr
Betala med Klarna, kort, Apple Pay eller Google Pay – och 14 dagars ångerrätt om det inte passar.
Vintern kommer oavsett – se till att taket är skyddat innan det är för sent.
Beställ nu – leverans på 5–10 arbetsdagar. 👇
```

**Headline:** Husvagnstaket – helt skyddat i vinter

**Description (bildannons):** 23% rabatt just nu. Fri frakt till Sverige och Norge.

**Tre-frågorstestet (endast ändrade rader):**

| Rad | Visualisera | Falsifiera | Ingen annan kan säga det |
|---|---|---|---|
| Rad 3: "Betala med Klarna, kort, Apple Pay eller Google Pay – och 14 dagars ångerrätt om det inte passar." | ✅ | ✅ | ❌ (betalsätt och lagstadgad ångerrätt är branschstandard) |
| Rad 5: "Beställ nu – leverans på 5–10 arbetsdagar." | ✅ | ✅ | ✅ |
| Description: "23% rabatt just nu. Fri frakt till Sverige och Norge." | ✅ | ✅ | ✅ |

**Ändrat:** Rad 3 – den falska lagerbristen ("Lagret är begränsat och priset
gäller bara ett tag till") bytt mot villkor som är sanna och konkreta:
betalsätt + 14 dagars ångerrätt. Rad 5 – "Säkra ditt innan det är slut i
lager" (falsk brådska) bytt mot den faktiska leveranstiden, 5–10 arbetsdagar,
med samma 👇-avslut. Description – "inom Sverige" bytt mot "till Sverige och
Norge" (frakten gäller båda länderna). Rad 1, rad 2 (pris exakt: 1469 kr →
1129 kr, orört), rad 4 och headline är orörda.

**OBS (ingen ändring gjord, bara flaggat):** Rad 1 (🔥-emoji, versaler) ligger
utanför CaraShells vanliga tonalitet ("saklig och lugn ... inga adjektiv utan
något att peka på"), men var inte en av de två rader uppdraget pekade ut som
fel – lämnad orörd enligt regeln "ändra bara det som är fel".

---

## Block GT (presenten)

Inget fel hittat mot butikens sanningar eller tonalitet. Levereras ordagrant.

**Message:**
```
Han pratar om husvagnen som om den vore ett husdjur. 😅 I år hittade jag äntligen något han faktiskt blir glad för.
🎁 Ett taköverdrag som skyddar hans husvagn hela vintern
🎁 Något han faktiskt använder – om och om igen
🎁 Levereras enkelt hem, klart att slå in
Ge en present som visar att du fattar vad han bryr sig om. 👇
```

**Headline:** Presenten han faktiskt blir glad för

**Description (bildannons):** Perfekt present till husvagnsägaren. Fri frakt.

**Tre-frågorstestet:** Ej tillämpligt – inga nya eller ändrade rader.

**Ändrat:** Inget. Blocket levererat ordagrant som bekräftelse på att det är
läst och kontrollerat mot butikens sanningar.

---

## Rättelse av huvudsessionen 2026-09-11

Block PD levererades med TRE ✅-rader. Källan har FYRA, och raden
"✅ Skyddar mot regn, snö och UV hela vintern" var varken utpekad som fel eller
nämnd under "Ändrat" — den hade tappats bort. Den är återinsatt som rad 2, i
källans ordning. NO-blocket behöll alla fyra, så marknaderna matchar nu igen.
Regeln som gäller: en rad som inte är fel för butiken ändras inte — och tas
inte bort heller.
