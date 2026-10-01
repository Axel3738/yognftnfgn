# Värva en vän — Matstrumpor

Axels beställning 2026-09-30: Ty Chapmans reel om appen Redeemly
(instagram.com/reels/Dd5G-J6zEyv, "Get insane Shopify referrals") —
"Kan du implementera detta på matstrumpor". Hans val samma kväll:
**"Egen, 50 kr / 100 kr"**.

- **Vännen** får **50 kr rabatt på sitt första köp**.
- **Kunden som delade länken** får **100 kr i butikskredit** (Shopifys egen, i
  kundens valuta) när vännens paket har skickats, och Shopifys mejl om det.

## Varför inte Redeemly

Mätt 2026-09-30 (App Store-sidan och Matstrumpors ordrar): största planen tar
**800 ordrar i månaden** och Matstrumpor hade **1 617 i december 2025**, 799 i
januari och redan 490 i september 2026. Appen finns **bara på engelska**, och
butiken säljer på 14 språk. Dessutom ger Redeemly vännen butikskredit, som
kräver att vännen skapar ett konto och loggar in. Här får vännen en rabattkod
som läggs på av sig själv.

## Så fungerar det

```
Tacksidan (kortet)                 matstrumpor.se/?van=GR85LGHYQ
  "Ge en vän 50 kr i rabatt"   ──►  temats skript ms-varva.js:
  länk + "Kopiera länken"            • vännens kod VAN-BPKS6U i varukorgen
                                     • varukorgen märks van=GR85LGHYQ
                                     • rutan "Din vän har gett dig 50 kr …"
                                              │
                                              ▼
                                   vännens order bär attributet van
                                              │
 /sparning matstrumpor (varje timme, steg 2c): node matstrumpor/varva.mjs --skarpt
   första köpet? betalt? skickat? inte återbetalt? inte samma person?
   ⇒ storeCreditAccountCredit 100 kr (kundens valuta, notify) + tagg på vännens order
```

Numret i länken är **kundens bekräftelsenummer** (`Order.confirmationNumber`,
slumpat av Shopify). Ordernumret (#5209) används aldrig, för det går att gissa.
Koden står **aldrig** i länken, bara i temats skript.

## Filerna

| Fil | Vad |
|---|---|
| `konfig.json` | Facit: koden, beloppen, golvet, taket, valutorna, länkarna per språk |
| `sprak.json` | Texterna på 14 språk. sv är källan, de andra är översatta av Sonnet och granskade av en andra agent 2026-09-30 |
| `../varva.mjs` | Motorn: `--kolla`, `--kod`, `--aterstall`, `--mat`, `--bygg`, `--tema`, krediteringen |
| `ms-varva.js` | Temaskriptets KÄLLA. Temats kopia byggs av `--tema --skarpt`, ändra aldrig i temat |
| `app/` | Tacksidekortet (checkout UI extension, Preact, api 2026-07). `src/data.js` och `locales/` byggs av `--bygg` |
| `deploy.sh` | Deployar kortet till appen "Matstrumpor Tacksida" |
| `kundvy.mjs` | Landar som vän i Chromium och läser varukorgen, rutan och kassan |
| `cowork/1-tacksidan.txt` | Axels klick: appen, token, och blocket i kassaredigeraren |
| `lage.json` | Kodens id, originalen för `--aterstall`, senaste valutamätningen |
| `krediterat.jsonl` | Minnet. En rad `forsok` före krediten och en rad `klar` efter. Committas varje gång den ändras |

## Paketkoderna — det som måste vara sant för att vännen ska få sina 50 kr

**466 av 490 ordrar i september 2026 bar en paketkod** (SUSHI-K1F1,
STRUMPOR-K1F1 …). De tillät ingen annan rabatt, och när två rabatter inte får
kombineras drar Shopify av den som är bäst för kunden, alltså paketet. Vännens
50 kr hade därför nästan aldrig dragits av.

`--kod --skarpt` gjorde därför tre saker 2026-09-30, lästa tillbaka:

1. Skapade `VAN-BPKS6U`: 50 kr på ordern, en gång per kund, minst 200 kr i
   varukorgen, kombineras med produktrabatter (paketen) och frakt men inte med
   andra orderrabatter.
2. Öppnade de **16 paketkoderna** för orderrabatter.
3. Stängde produktkombinationen på **GLÖMD** (10 % på ordern, den enda andra
   orderrabatten som stod öppen). Utan det hade GLÖMD börjat kombineras med
   paketen. Nu beter den sig exakt som före.

Black Week-trappan (automatisk, orderrabatt) kombinerades aldrig med
produktrabatter och är orörd. KLUBB10, SUSHI-2FOR499 och SUSHI-4FOR799
kombineras inte med något och är orörda. Originalen står i
`lage.json → aterstall`, och `node matstrumpor/varva.mjs --aterstall --skarpt`
lägger tillbaka dem.

**Mätt i riktig kassa 2026-09-30** (Chromium, `kundvy.mjs --kassa`):
Sverige, 2 lådor sushi + 2 par ätpinnar med SUSHI-K1F1 och vännens kod:
Delsumma 399,00 kr, **Orderrabatt VAN-BPKS6U −50,00 kr, Totalt 349,00 kr**.
Norge: 469 NOK → 420 NOK.

⚠️ En ny orderrabatt som Axel skapar i admin och som får kombineras med
produktrabatter börjar kombineras med paketen. `--kolla` säger det
("andra orderrabatter som annars börjar kombineras med paketen").

## Beloppen i varje valuta

Rabatten är 50 SEK i butiken, och Shopify räknar om den till kundens valuta.
`--mat --skriv` lägger en vara i en riktig varukorg i varje land (Shopifys
landformulär, eftersom containern står i USA) och läser vad kassan drar av.
Kortet och rutan visar det mätta beloppet **golvat med 1,5 % marginal** för
kursrörelser, så de lovar aldrig mer än kassan ger (SEK exakt 50). Krediten
är ett runt belopp nära 100 kr, och det är exakt det kunden får.

| Valuta | Kassan gav (mätt) | Visas | Kredit |
|---|---|---|---|
| SEK | 50 | 50 kr | 100 kr |
| NOK | 49 | 48 kr | 100 kr |
| DKK | 33,60 | 33 kr | 65 kr |
| EUR | 4,49 | 4 € | 9 € |
| USD | 5,09 | $5 | $10 |
| GBP | 3,84 | £3,50 | £8 |
| AUD / CAD / NZD | 7,33 / 7,24 / 9,04 | 7 / 7 / 8,50 | 15 / 14 / 18 |
| CHF | 4,25 | 4 | 9 |
| CZK / HUF / ISK | 109,83 / 1 647 / 616 | 100 / 1 600 / 600 | 220 / 3 300 / 1 200 |
| PLN / RON | 19,61 / 23,70 | 19 / 23 | 40 / 45 |
| JPY | 801 | ¥780 | ¥1 600 |
| TWD | 162,34 | NT$150 | NT$320 |

Japanska och kinesiska belopp innehåller aldrig siffran 4 (四). Samma regel
som annonserna. En valuta utan rad i konfigen visar inget kort och får ingen
kredit, och krediteringen säger "kräver en människa".

## Spärrarna (testade, `matstrumpor/test/varva.test.mjs`)

- Bara vännens **första** order (kundens äldsta order = den här).
- Betald, **skickad** (FULFILLED/PARTIALLY_FULFILLED), inte avbruten, inte
  återbetald alls. Inte skickad än ⇒ prövas nästa timme.
- Inte samma kund, samma e-post eller samma gata + postnummer (egen länk).
- Vännens order får inte vara äldre än kundens.
- **Högst 10 krediterade vänner per kund** (sessionens beslut 2026-09-30, i
  konfigen): en länk som hamnar på en rabattkodssajt betalar annars ut utan
  gräns till en person.
- **Aldrig två gånger:** minnet skrivs FÖRE krediten, taggen
  `varva-krediterad` sätts på vännens order efteråt, och en rad som påbörjats
  men aldrig kvitterats prövas aldrig igen av sig själv. Den blir "kräver en
  människa". Kontrollera då kundens butikskredit i Shopify innan något görs.
- **En enda körare:** `/sparning matstrumpor` (steg 2c). Den rutinen bär
  butikens nycklar och vet när paketet gått. Kör aldrig `--skarpt` från en
  annan rutin eller session.

Läckan som INTE går att stänga: vännens kod är en kod. Hamnar den ute kan en
kund som inte fått någon länk ta 50 kr en gång. Krediteringen räknar sådana
ordrar ("vännens kod användes N gång(er) utan länk"). Blir de många: ny kod i
`konfig.json → kod`, `--kod --skarpt`, `--bygg`, `deploy.sh`, `--tema --skarpt`.

## Tacksidekortet

`app/extensions/varva-kort/` visar kortet på **tacksidan**
(`purchase.thank-you.block.render`) och **orderstatussidan**
(`customer-account.order-status.block.render`), på kundens språk och i
kundens valuta, med länken och knappen "Kopiera länken" (Shopifys
`s-clipboard-item`). Inget kort när numret, valutan eller språket saknas, och
inte för en avbruten order. I kassaredigeraren visar det exempelnumret
`EXEMPEL1`, så att blocket går att se när det läggs in.

✅ **Deployat och releasat 2026-09-30 23:36 CEST** som `matstrumpor-tacksida-2`
i appen **"Matstrumpor Tacksida"** (org Matstrumpor.se, Client ID i
`konfig.json → app_client_id`, inga rättigheter — `shopify.app.matstrumpor.toml`
läst tillbaka med `scopes = ""`). Blocket syns för kunden först när det lagts in
på tacksidan och orderstatussidan i kassaredigeraren (`cowork/1-tacksidan.txt`,
steg 5–7). ⚠️ Token (`SHOPIFY_APP_AUTOMATION_TOKEN_MATSTRUMPOR`) som lades in i
Environments medan sessionen körde syntes INTE i den sessionens skal (mätt tre
gånger 21:25–21:33 UTC); en ny session i samma miljö såg den direkt. Deploya
alltid från en session som startats efter att nyckeln lagts in.

Deploya om (efter ändrade belopp, språk eller kod), i en session med token i
miljön:

```bash
bash matstrumpor/varva/deploy.sh --torr   # konfigen hämtas, bygger lokalt
bash matstrumpor/varva/deploy.sh          # deployar och releasar
```

Egen app-mapp med flit: `factory/tacksida/app/` deployar allt i sin mapp, och
en gemensam mapp hade skickat CaraShells kort till Matstrumpor och tvärtom.

## Temat

`--tema --skarpt` skrev `assets/ms-varva.js` och en rad före `</body>` i
`layout/theme.liquid` (markör `<!-- ms-varva -->`) i temat "Matstrumpor CRO +
storleksrad 2026-09-17" 2026-09-30 kväll, tillbakaläst. Domäntemat
(`marknader/domantema.mjs`) byter bara exakta rader i layouten, så raden står
kvar.

Rutan ligger längst ner och **lyfter sig ovanför produktsidans fasta köpknapp**
(`.ms-sticky`). Mätt på 390 px bredd: utan lyftet överlappade de. Rutan ligger
under varukorgslådan (z-index 999).

**Kundvyn live 2026-09-30** (`kundvy.mjs`, provnumret PROV0VARVA1, ingen
order lagd): Sverige (sv, SEK, "50 kr"), Norge (nb, NOK, "48 kr", kassan
469 → 420 NOK), Tyskland (de, EUR, "4 €"), Japan (ja, JPY, "￥780"). Koden och
märkningen låg i varukorgen i alla fyra.

## Kör

```bash
node matstrumpor/varva.mjs --kolla                  # rättigheter, koden, kombinationerna, valutorna
node matstrumpor/varva.mjs                          # krediteringen torrt
node matstrumpor/varva/kundvy.mjs [--land NO] [--kassa]
node --test matstrumpor/test/varva.test.mjs matstrumpor/test/varva-kort.test.mjs
```
