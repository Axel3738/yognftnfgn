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
| Täckningsbidrag | **749,93 kr** | 524 kr |
| Break-even-ROAS | **1,51** | 2,15 |
| Break-even-CPA | **750 kr** | 524 kr |
| Target-ROAS | **2,41** | 3,88 |
| Target-CPA | **468 kr** | 291 kr |

✅ **Inköpspriset är KVITTERAT av Axel 2026-09-11: 379,07 kr.**
348,73 kr varukostnad + 2,70 EUR tull. Tullen räknades om på ECB-dagskursen
2026-09-11 (1 EUR = 11,2373 SEK, `api.frankfurter.dev` — samma källa som
`commission/valuta.mjs`, kursen gissas aldrig) = 30,34 kr.

⚠️ **Det gamla talet var 436 kr och det var 57 kr FÖR HÖGT.** Det var
baklängesräknat ur källkampanjens namn ("BE ROAS 1.63") och gjorde break-even
hårdare än den är — BE-CPA 693 kr i stället för 750 kr. Varje dom som fattas mot
1,63 är alltså för sträng. Kampanjerna är omdöpta till "BE-ROAS 1,51".

⚠️ **Tullen är i EUR.** Rör sig kursen eller tullbeloppet ska talet räknas om,
och den nya kursen skrivas in i produktfilen.

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

## Priset per marknad (mätt i kundens riktiga vy 2026-09-11)

| Marknad | Pris | Jämförpris | Rabatt |
|---|--:|--:|---|
| SE | 1 129,00 kr | 1 469,00 kr | **23,1 %** |
| NO | 1 106,00 NOK | 1 382,50 NOK | **20,0 %** |

Mätt 2026-09-11 med `curl https://carashell.se/products/takskyddet.js?country=NO`
— den endpointen svarar per marknad och bär både `price` och `compare_at_price`.

⚠️ **Sök ALDRIG priset i sidans HTML.** Temat renderar priserna på klientsidan,
så rå-HTML:en bär varken pris eller jämförpris — på någon marknad. En tom
HTML-sökning bevisar ingenting; den gav samma tomma svar på SE, som har ett
jämförpris. Det misstaget gjordes en gång här.

⚠️ **20 %, inte 25 %.** Axels instruktion var "jämförpris 25 % högre än
ordinarie pris". Det ger 20 % rabatt för kunden, inte 25. Norsk copy och norskt
tal säger därför **20 %** — aldrig 25, och aldrig källans 23.

⚠️ **Den norska marknaden har inget jämförpris.** Shopify visar 1 106 NOK rakt av,
utan överstruket pris. Mätt på den publika sidan med `?country=NO` — utan den
parametern svarar sidan i SEK, eftersom valutan följer besökarens land och inte
locale-sökvägen `/nb`. Det gör att **hela CS-konceptet inte går att köra på
norska:** källans tre NO CS-videor bygger ord för ord på "Ordinær pris 1469
kroner, i dag 1129 kroner" och en 23-procentig rabatt som inte finns hos
CaraShell. Ett prisbyte räddar dem inte — det finns ingen rabatt att peka på.

## Kvarstående blockerare 2026-09-11

| Blockerar | Vad | Löses av |
|---|---|---|
| ~~Meta-sidan~~ | **LÖST 2026-09-11.** Axel gav sig själv rollen på `1381171778405935`; ett skarpt `adcreatives`-anrop går igenom och sidan är läsbar. | — |
| ~~NOK~~ | **LÖST 2026-09-11.** Norska marknaden säljer i NOK (1 106). | — |
| NO CS ×3 | Norska marknaden har inget jämförpris ⇒ ingen rabatt att annonsera. Videorna säger dessutom "Tretti dagers åpent kjøp" (butiken har 14 dagars ångerrätt). | **Axels beslut:** ska den norska marknaden ha ett jämförpris? Utan det är CS-konceptet dött på NO. |
| Kill-beslut | `inkopskostnad` 436 kr är HÄRLEDD. Axel säger att han lagt in COGS — men talet i repot är oförändrat. | Axel ger siffran han lade in, så `factory/produkter/takskyddet.yaml` och kampanjnamnens BE-ROAS kan rättas |
| Talet i PD ×3 | säger "dragsko" och "förvaringspåse" — påståenden produktfilen förbjuder | omdubb, eller Axels besked att det får stå |

---

## Första dygnet live — trattens läge 2026-09-12 kl 00:35

Mätt ur kontot och pixeln, inte gissat.

| Steg | Antal |
|---|--:|
| Spend | 314,75 kr |
| Visningar | 3 412 |
| Klick | 208 (**CTR 6,1 %**) |
| PageView | ~147 |
| ViewContent | 79 |
| **AddToCart** | **1** |
| InitiateCheckout | 0 |
| Purchase | 0 |

**Ingen dom är fälld.** ANALYSMETOD:s signifikansgrind är 300 kr spend *eller*
3 köp, och break-even-CPA är 750 kr — 0 köp på 314 kr är under halva
break-even och säger ingenting ännu. Creativen fungerar: CTR 6,1 % är högt.

⚠️ **Det som sticker ut är AddToCart: 1 av 79 som såg produkten.** Normalt
ligger det på 5–10 %. Två saker är uteslutna: pixeln är inte trasig (den
skickar PageView, ViewContent OCH AddToCart), och produktsidan är hel
(varianten är `available`, `/cart/add`-formuläret finns, köpknappen renderas).

### Hypotes som ska testas, inte tros

`assets/ms-paket.js` (paketwidgeten, används av ALLA OPS-butiker) kapar
köpknappen så här:

```js
kopplaKnapp(){ … document.addEventListener("submit", this.kop.bind(this), true) }
kop(ev){ … ev.preventDefault(); ev.stopImmediatePropagation();
          fetch(rutt+"cart/add.js", …) }
```

Lyssnaren sitter på `document` i **capture-fasen** (tredje argumentet `true`),
alltså före i stort sett alla andra, och `stopImmediatePropagation()` dödar
sedan varje annan submit-lyssnare på sidan — inklusive sådant som kan fyra av
spårning eller annan appfunktionalitet.

⚠️ **Det är en HYPOTES.** Den motsägs delvis av att en AddToCart faktiskt gick
igenom, och Shopifys egen Web Pixel lyssnar på `cart/add.js` oberoende av
DOM-lyssnare. Skriv aldrig upp det här som orsaken förrän någon har gjort
köpet i en riktig webbläsare.

### Varför det inte gick att avgöra härifrån

Kundvyn kördes mot Chromium i containern, men agentproxyn släpper inte igenom
webbläsartrafik (`ERR_CONNECTION_RESET` mot carashell.se, medan `curl` mot
samma URL svarar 200). Repots självtest säger redan samma sak om det här
steget: *"Varukorgen i kundens vy — hoppad: kräver en människa i en
webbläsare."* Det är alltså en mänsklig kontroll, inte en lucka i den här
körningen — men den är nu det enda som står mellan hypotes och svar.
