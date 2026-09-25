# Produktfakta som inte står på produktsidan

Svar från Axel (och senare leverantören) på kundfrågor ur annonskommentarerna.
Varje rad har källa och datum. Säger den här filen emot produktsidan gäller
den här filen, och produktsidan ska rättas (står under "Rätta på sidan").
Läses av `/kommentarer` innan svaren skrivs.

## Taköverdraget (Bäverbutiken `Takoverdrag` / `Takovertrekk`, CaraShell `CaraShellRoof`)

- **AC-aggregat, ventilhattar eller annat som sticker upp på taket:**
  överdraget läggs över, och det dras upp lite på sidorna. Rådet är att
  **välja en storlek längre** (ca 1 m / 3 ft) så att längden räcker. Axel
  2026-09-25, *"det är det som jag gissar i alla fall"* — ej bekräftat av
  leverantören.
- **Solceller på taket:** överdraget täcker solcellerna. Axel 2026-09-25:
  *"de täcker ju solcellerna, tyvärr. Men man kan ju sätta solcellerna
  ovanför dem."* Oklart vad "ovanför" betyder — fråga Axel innan det citeras.
- **Banden skaver inte på lacken:** de är gjorda av ett mjukt material.
  Axel 2026-09-25. **Leverantören 2026-09-25:** "will not damage the car
  paint".
- **Banden är vävda remmar (webbing), INTE elastiska.** Leverantören
  2026-09-25: *"We use webbing, not elastic band. Elastic band tends to lose
  its elasticity over time and becomes impractical."* Skriv aldrig
  "elastiska band"/"strikk". Kunder som skriver att gummibanden töjs ut och
  plastkrokarna går sönder beskriver alltså en annan produkt (eller ett
  annat parti) — svara vänligt, säg inte emot, be köpare om ordernumret.
- **Vattentät och tål sol.** Leverantören 2026-09-25 ("waterproof and
  sunproof").
- **Rutorna: kanten täcker bara övre delen, nedre halvan av glaset täcks
  aldrig.** Leverantören 2026-09-25 (med bild på en husbil där kanten hänger
  över överkanten av vindrutan och sidorutorna): *"Due to the product design,
  it's inherently the lower half of the glass and cannot provide any cover."*
  Svar till den som vill skydda rutorna: överdraget skyddar taket och övre
  delen av rutorna, inte hela rutorna.
- **Hur långt ner på sidorna:** beror på husvagnens/husbilens bredd
  (överdraget är 3 m brett). Axel 2026-09-25.
- **Fifth wheel (US):** en släpvagn som kopplas i flaket på en pickup, med
  en upphöjd framdel över flaket. Takets huvudyta är platt; framdelen är ett
  steg högre. Mät takets längd och välj efter den. (Allmän kunskap, inte
  testat på produkten.)
- **Andas väven? Tål den hagel? Kommer man in genom dörren?** — okänt, fråga
  leverantören.

## Sotarset / Feiesett (`Sotarset`)

- **Den runda borsten fungerar i fyrkantiga skorstenar/rör.** Det finns
  ingen fyrkantig borste — borsten snurrar och är därför rund. Axel
  2026-09-25: *"det är klart att den runda borsten funkar till fyrkantiga
  rör. Det är ju bara att köra"*. Nämn aldrig en "fyrkantig borste".
- **150 mm rör:** borsthuvudet är 100 mm (produktsidan). Om det räcker för
  150 mm är okänt — fråga leverantören.

## Bälteslipmaskin (`Beltgrinder` / `Balteslipmaskin`)

- **Vinkeln går inte att ändra** (fast 15°). Axel 2026-09-25.
- **Flera olika slipband följer med** — se produktbilderna. Axel 2026-09-25.
- **Reservdelar:** ett kit med nya slipband och slipskivor är på väg från
  leverantören. Det får sägas att vi håller på att lansera ett kit med
  förslitningsdelarna. Axel 2026-09-25.

## Solcellslampa (`Solcellslampa`)

- **Ingen fjärrkontroll.** En av videorna visade av misstag en fjärrkontroll
  (fel variant i videon). Svaret: det var fel i videon, lampan har ingen
  fjärrkontroll. Axel 2026-09-25.

## Termoskydd husbil (`Termoskydd`)

- **Smårutorna:** det finns en egen produkt för smårutorna, nyss upplagd i
  butiken (Axel 2026-09-25). Länken/namnet saknas här — hämta ur butiken
  innan den nämns.

## Fiskespöhållare (`Fiskespöhållare`)

- **Inte byggda för vägg eller båt.** Axel 2026-09-25. ⚠️ Produktsidan
  säger "Monteras på vägg eller i båten" — se "Rätta på sidan".

## Båtmotorskydd (`Batmotor`)

- **Leverantören 2026-09-25:** skickade en 23 s video (svart skydd, hopvikt i
  plastpåse) med texten *"This is the version currently being shipped … It
  appears to be well-ventilated in the picture."* Axel tycker den ser bra ut.
  ⚠️ Inte ett svar på frågorna: tyget (420D Oxford eller tunnare?), om det
  finns ventilationshål, och om remmar/spänne följer med är fortfarande okänt.
  Svara aldrig kunder "den är ventilerad" förrän leverantören sagt det rakt ut.

## Rätta på sidan

- CaraShells takskydd: "elastiska spännband" ändrat till "vävda spännband
  (inte gummi, töjs inte ut)" på sv/nb/en/fi/da i `factory/produkter/takskyddet.yaml`
  och `factory/output/carashell/oversattning-*.json` (Axels ja 2026-09-25).
  ✅ UPPLADDAT 2026-09-25 (`ops.mjs … --igen metafalt,oversatt`, nycklarna
  heter `_yitrbk_m3` med små bokstäver). Bildens alt-text i Shopify sa
  fortfarande "Elastiska spännband" på alla språk. Den är rättad till "Vävda
  spännband" med `productUpdateMedia`, så den matchar produktfilen. Mätt som
  kund samma dag på carashell.se (SE), carashell.com (US), /nb, /fi och /da:
  vävda/webbing/vevde/kudotut/vævede syns 7 gånger per sida. "Elastisk" finns
  bara kvar i "not elastic" (US).

- Fiskespöhållare 4-pack (baverbutiken.se): texten "Monteras på vägg eller i
  båten" och "Monteras enkelt på vägg eller i båten" stämmer inte enligt
  Axel 2026-09-25.
