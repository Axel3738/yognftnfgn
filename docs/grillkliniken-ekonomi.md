# Grillklinikens ekonomi (legacy)

Grillkliniken är **inte** en del av Bäverbutikens Creative Strategy OS. Den här filen
finns för att siffrorna inte ska försvinna, och för att en session som får en fråga om
Mastern ska slippa gissa. Rör ingenting här utan att Axel bett om det.

Ad account: **SnarkLös** `1346450049878358` (SEK). Kampanj Mastern `120242897371730074`.

---

## Momsen — den vanligaste felkällan

**Grillkliniken säljer utan moms.** Marginalen räknas rakt på priset.
Mastern kostar 999 kr, och 999 kr är det tal som ska in i marginalberäkningen —
inte 799 kr.

Drar du reflexmässigt av 25 % blir break-even-ROAS 1,41 i stället för 1,30, och
annonser som faktiskt går med vinst ser ut att gå med förlust. Det har hänt.

⚠️ Bäverbutikens momsläge är en **annan fråga** och står ingenstans i repot.
Break-even-talen i `products/products.json` står och faller med svaret. Fråga Axel.

---

## Inpriser och marginaler

Källa: leverantörsoffert **2026-07-07**, kurs **1 USD = 9,6376 SEK**.
56 rader (produkt + variant), varav **9 saknar inpris** och visas som `–`.

Rådatan ligger på grenen `claude/kostnader-produkter-jbxijn`:

| Fil | Vad |
|-----|-----|
| `dashboard/kostnader.json` | De 56 raderna, inkl. målpris för 60 % marginal |
| `dashboard/prisforslag-60.csv` | Nuvarande pris → nypris för minst 60 % marginal |
| `dashboard/GRILLKLINIKEN_PRODUKTER.xlsx` | Ursprungligt offertblad |
| `dashboard/index.html` | Panelen, data inbäddad som `DATA`-konstant |

Hämta med `git show origin/claude/kostnader-produkter-jbxijn:<sökväg>`.
⚠️ Hämta **inte** hela grenen — dess `dashboard/` är ett annat program än `main`:s
och skriver över redigerarpanelen.

Inpris = landat inköp (produktpris + frakt i USD) omräknat med kursen ovan.
**24 av 47 produkter behöver prishöjas** för att nå 60 % marginal.

### Annonseringsspärr — produkter som inte tål betald trafik

Marginalen räcker inte till en CPA. Annonsera inte dessa utan att priset höjts först:

| Produkt | Pris | Marginal |
|---|---|---|
| Grillborste – Lätt & enkel | 99 kr | **12,4 %** |
| Grilltänger – Flera storlekar (39 cm) | 99 kr | 20,2 % |
| Grilltänger – Flera storlekar (34 cm) | 99 kr | 24,1 % |
| Grilltänger – Flera storlekar (27 cm) | 99 kr | 27,0 % |
| Majskolvshållare – 10-pack | 99 kr | 40,6 % |

Färgband i panelen: grön ≥ 60 %, gul 45–60 %, röd < 45 %.

---

## Vad som INTE gick att verifiera

En granskning 2026-08-12 påstod att Grillkliniken har tre Notion-hubbar och att det
finns ytterligare två annonskonton ("Sushi kanske?", "NYC Grill" i USD), med
konkreta ID:n. **Ingen av de siffrorna finns någonstans i repots historik** — sökning
över samtliga grenar gav noll träffar.

De är därför inte inskrivna här. Behöver du dem: läs av dem i Meta respektive Notion
och skriv in dem med datum. Skriv aldrig in ett ID du inte själv har sett i källan.

---

## Grillöverdraget (2026-08-29, på Axels begäran)

**Grillöverdrag 420D – 5 Storlekar med Snörning** skapades som **UTKAST** i
grillkliniken.se via Shopify-connectorn (`gid://shopify/Product/15651270558020`,
handle `grilloverdrag-420d-5-storlekar-med-snorning`). Temu-källa: goods
601103374896256. 5 storleksvarianter (80×66×100, 100×60×150 hög, 145×61×117,
170×61×117, 190×70×117), SKU `TEMU-601103374896256-<80|100H|145|170|190>`,
taxable false, CONTINUE, svensk storleksguide-infografik genererad och inlagd
i beskrivningen, publicerad mot alla 5 kanaler (syns när status blir ACTIVE).

**CWD-offert kom 2026-08-29** (CANWANGDA 089, 26/08/26): 80-storleken landad
$11,2 och 190-storleken $14,5 (420D Oxford + silver coating, 6–10 dagar, YUN).
Offerten rättade också 190-måttet till **190×71×117** (Temu-bilden sa 70).
Priserna höjdes på Axels begäran till **399/449/499/549/599 kr** = 73–77 %
marginal på de offererade storlekarna (mellanstorlekarna interpolerade).
AKTIVERAD 2026-08-29 på Axels begäran — live på grillkliniken.se/products/grilloverdrag-420d-5-storlekar-med-snorning. Silverbeläggningen beskrivs som glatt insida (skonsam mot lock/lack), enligt Axels produktkännedom.
