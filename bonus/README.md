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
| Tvist besvarad i tid med bevis | $3 | Tvisten är besvarad när deadline passerar |
| Vunnen tvist | $10 | Shopify säger won |
| Tom inkorg på fredag | $15 | Under 10 obesvarade i veckorapporten |
| Svar inom ett halvt dygn | $10 | Mediansvarstid under 12 h |

### Head of customer support
Tio procent av vad VA-teamet tjänar, plus $25 när ett brands risk går under 25
och $20 för full SOP-täckning. **Chefen tjänar på att lära teamet, inte på att
göra jobbet själv.**

### Produkttest
Trappan: $2 godkänd för test → $5 fick sin chans → $25 går med vinst →
$100 skalas. En produkt som går hela vägen ger $132 till den som hittade den.

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

Trustpilots publika sida svarar 403 på maskiner (mätt 2026-09-21), så
automatisk läsning kräver `TRUSTPILOT_API_KEY` + `TRUSTPILOT_BUSINESS_UNITS`
i miljön. Utan dem fungerar allt ändå: VA:n klistrar in recensionslänken på
Min sida och chefen godkänner. Judge.me läses automatiskt redan i dag.

## Personer utan konto

Mätt 2026-09-21: **Josh Naelga (13) och Annabelle Gonzales (12)** står som
Ansvarig på produkttester i Notion men har bara rollen redigerare. Ska de
tjäna på produkttest också sätts `extraRoller: ["produkttest"]` på dem — det
går att klicka i under Konton. Systemet gör det inte av sig självt: det är ett
beslut om pengar, och sådana fattar Axel.
