# bonus/ — alla i bolaget ska kunna tjäna pengar

Redigerarna hade redan sin andel av annonsspenden. Produkttestarna hade en
uppgörelse. VA:erna hade ett löfte om fem dollar per Trustpilot-recension —
**och drog noll recensioner.**

Det här är motorn som gör alla tre till samma sak: mätbara uppdrag, med
beloppet skrivet bredvid, och pengarna synliga på personens egen sida varje
dag.

```bash
node bonus/kor.mjs                  # räkna den här månaden och spara utfallet
node bonus/kor.mjs --torr           # räkna och visa, skriv ingen fil
node bonus/kor.mjs --manad 2026-08  # en gången månad
node bonus/kor.mjs --utan-nat       # bara det repot redan vet
npm test                            # 24 tester för motorn
```

Sajten kör den här automatiskt vid varje hämtning (`node stonebite/hamta.mjs`).

---

## Varför VA:erna inte drog några recensioner

Tre saker saknades, och alla tre är åtgärdade i systemet:

| Saknades | Nu |
|---|---|
| **De såg aldrig pengarna.** Ett löfte i ett samtal är inte en lön. | Min sida visar "Du har tjänat $X den här månaden" och varje uppdrag med sitt belopp. |
| **Ingen visste exakt hur man gör.** "Be om en recension" är inte en instruktion. | Varje uppdrag har ett *Så gör du*, och recensionsuppdraget har en **färdig text att kopiera** — på svenska och engelska. |
| **Det fanns inget mål.** | "Den här veckan: 1 av 3 recensioner med ditt namn" plus tio dollar extra för tre på samma vecka. |

Mätt 2026-09-21: av **1 210 recensioner** de senaste 60 dagarna nämnde **2**
någon i teamet. Det är hela problemet i en siffra — och den siffran står nu
överst på sidan Recensioner.

---

## Programmen

Beloppen ligger i `regler.json` och ändras där. Motorn och sajten följer med.

### Kundtjänst (VA och Head of support)
| Uppdrag | Belopp | Mäts |
|---|---|---|
| Recension med ditt namn | $5 | Judge.me/Trustpilot automatiskt, eller inrapporterad + godkänd |
| Tre recensioner på en vecka | $10 | Räknas per kalendervecka |
| Tvist besvarad i tid med bevis | $1 | Tvisten är besvarad när deadline passerar |
| Vunnen tvist | $5 | Shopify säger won |
| Tom inkorg när veckan är slut | $15 | Under 10 obesvarade i **alla** personens butiker, en utbetalning per vecka |
| Svar inom ett halvt dygn | $10 | Mediansvarstid under 12 h i alla butiker, en utbetalning per vecka |

Tvistbeloppen halverades 2026-09-21 på Axels ord ("alldeles för mycket").
Veckobonusarna betalas **en gång per vecka, inte per butik** — Mechile svarar
för alla butiker (`brands: ["*"]`), och en missad butik stoppar veckan.

### Head of customer support
Tio procent av vad VA-teamet tjänar — **utan chefens egna rader** — plus $25
per butik vars risk är under 25 vid månadens sista rapport och $20 när varje
vecka i månaden hade full SOP-täckning. **Chefen tjänar på att lära teamet,
inte på att göra jobbet själv.** Är chefen ensam i teamet (som Mechile i dag)
är andelen noll tills fler anställs.

### Produkttest
**$15 per färdig produkt** — raden i Product test center nådde `Ads review`
eller längre (Axels beslut 2026-09-21; ersatte trappan 2 / 5 / 25 / 100).
Redigerar testaren annonserna själv får hen dessutom 0,4 % av spenden på dem
(bara Sverige) — det är redigerarprogrammet, inte ett andra produkttestbelopp.
Josh och Annabelle bär båda rollerna (`extraRoller: ["produkttest"]`).

### Videoredigerare
0,4 % av annonsspenden på godkända annonser — samma som förut, nu synlig på
samma ställe som allt annat.

---

## Tre regler som sitter i koden

1. **Hellre okopplad än fel person.** Nämner en recension två namn betalas den
   till ingen — den hamnar i "Pengar ingen fick" så en människa kan avgöra.
2. **Ingen utbetalning utan underlag.** Varje krona pekar på en recension, en
   tvist, en Notion-rad eller en spendrad. Bevisen ligger framme på Min sida.
3. **Anspråk verifieras mot datan.** En VA som säger "jag svarade på tvist
   #5763" får betalt först när tvistdatan säger att den faktiskt är besvarad.
   Anspråket pekar ut personen, datan avgör om det hände.

Och en fjärde, i praktiken: **ingen godkänner sina egna pengar.** En VA kan
rapportera in en insats, men bara ägare, chef eller Head of support kan
godkänna den. Ett test loggar in som VA och försöker — och får 403.

---

## Filerna

| Fil | Vad |
|---|---|
| `regler.json` | Programmen, beloppen, instruktionerna och mallen. Svenska + engelska. |
| `personer.json` | Folkregistret: roll, förnamn (för recensionsmatchning), butiker. |
| `motor.mjs` | Räknandet. Rena funktioner, inget nät — därför testbart. |
| `kallor.mjs` | Judge.me, Trustpilot, kundtjänstrapporterna, Notion, commission. |
| `kor.mjs` | Körningen: hämtar, räknar, skriver `utfall/<månad>.json`. |
| `test/motor.test.mjs` | 24 tester. Pengar räknas här, så de är hårdare än andra. |

Föränderliga filer (`insatser.jsonl`, `personer-extra.json`) ligger i
dataspegeln — `STONEBITE_DATA`, i drift en volym som överlever en deploy.
Utan det försvinner inrapporterade insatser vid varje ny version.

---

## Trustpilot

Trustpilots publika sida svarar 403 på maskiner (mätt 2026-09-21 med curl och
headless Chromium; 2026-09-27 gick den att läsa via WebFetch i en session, men
det är inget en rutin kan bygga på), så automatisk läsning kräver
`TRUSTPILOT_API_KEY` + `TRUSTPILOT_BUSINESS_UNITS` i miljön. Utan dem fungerar
allt ändå: VA:n klistrar in recensionslänken på Min sida och chefen godkänner.
Judge.me läses automatiskt redan i dag.

**Mätt 2026-09-27, samma dag som recensionskampanjen i Spoks gick ut (Axels
val A: claima profilen):** Bäverbutikens profil
https://se.trustpilot.com/review/www.baverbutiken.se var **oclaimad** ("Ej
registrerad profil"), 2 recensioner, båda 1 stjärna, TrustScore 2,9. Business
unit-id **`6a8fefb70fa83ca3905331e9`** (ur sidans HTML) — det är värdet för
`TRUSTPILOT_BUSINESS_UNITS` den dag en nyckel finns.

⚠️ **API-nyckeln finns inte i gratisplanen.** Trustpilots prissida (läst
2026-09-27) listar API-åtkomst som ett **tillägg från Plus-planen, 319 dollar
i månaden per domän**; Free och Starter saknar det, och tilläggets eget pris
står inte på sidan. Det är Axels pengabeslut, inte något en session eller
Cowork köper. `stonebite/cowork/8-trustpilot.txt` claimar profilen gratis
(kontot `kundsupport@baverbutiken.se`), slår på mejlnotis vid ny recension och
läser av tilläggets pris utan att köpa; skickar aldrig Trustpilot-inbjudningar
och kopplar aldrig Shopify (kunderna får redan förfrågan från Spoks — två mejl
om samma sak). **Cowork öppnar bara trustpilot.com** (Axels krav 2026-09-27:
"bara den inte knullar min hemsida som förra gången" — Loopia-incidenten
2026-09-25, då Klaviyos namnservrar hamnade på hela baverbutiken.se): aldrig
Loopia, Axel klickar aktiveringslänken själv; aldrig Shopify-admin; ingen
TrustBox eller kodsnutt på sajten; domänverifiering bara via mejllänk; och
steg 5 läser efteråt att butiken laddar och att NS är ns1/ns2.loopia.se.
Facit före körningen, mätt 2026-09-27 14:22 UTC med Cloudflare DoH: NS
ns1/ns2.loopia.se, A 23.227.38.65 (Shopify), MX Loopia, en SPF-rad, www A
23.227.38.65, butiken svarar 200. Variablerna hör hemma i miljön `/stonebite`-rutinen kör i
(Barkås-kontot), för det är `hamta.mjs` → `bonus/kor.mjs` som läser källorna.

**Gratisvägen till automatisk räkning:** notismejlen landar i
`kundsupport@baverbutiken.se`, som `kundtjanst/webmail.mjs` redan läser varje
timme. När första notisen ligger i brevlådan byggs `trustpilotMejl()` här i
`kallor.mjs` ur det riktiga mejlet (samma radform som `trustpilot()`: källa,
butik, betyg, kund, text, datum, länk) — aldrig ur en gissad mall.
`kundtjanst/arenden.mjs arSystem` räknar `trustpilot.com` som systemavsändare
sedan 2026-09-27, så autosvaret och veckorapporten hoppar notiserna.

## Personer utan konto

Mätt 2026-09-21: **Josh Naelga (13) och Annabelle Gonzales (12)** står som
Ansvarig på produkttester i Notion men har bara rollen redigerare. Ska de
tjäna på produkttest också sätts `extraRoller: ["produkttest"]` på dem — det
går att klicka i under Konton. Systemet gör det inte av sig självt: det är ett
beslut om pengar, och sådana fattar Axel.
