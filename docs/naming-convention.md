# Namnkonvention

Målet: att man ska kunna läsa av datan **per variabel** i efterhand. Om alla annonser
heter "Annons 1, kopia, kopia (2)" går det inte att lära sig något. Om namnet kodar
*angle, format och hook* kan vi gruppera insights och se vad som faktiskt driver
resultat.

## De tre nivåerna på Meta

```
CAMPAIGN  →  ADSET  →  AD
```

### Campaign
```
{BRAND}_{OBJECTIVE}_{YYYYMMDD}
```
Exempel: `MAGI_SALES_20260703`

- **BRAND** — kort kod: `MAGI`, `SNARK`, `MATSTRUMP`
- **OBJECTIVE** — `SALES`, `TRAFFIC`, `LEADS`, `AWARENESS`, `ENGAGE`
- **YYYYMMDD** — startdatum

### Ad set
```
{AUDIENCE}_{PLACEMENT}_{OPTIMIZATION}
```
Exempel: `broad_advplus_purchase` eller `LAL1-purchasers_reels_purchase`

- **AUDIENCE** — `broad`, `LAL1-purchasers`, `int-grilling`, `retarget-atc`
- **PLACEMENT** — `advplus` (Advantage+ alla placeringar), `feed`, `reels`, `stories`
- **OPTIMIZATION** — `purchase`, `atc`, `lpv`, `lead`, `traffic`

### Ad  ← här bor testandet
```
{BRAND}_{PRODUCT}_{ANGLE}_{FORMAT}_{HOOK}[_{MARKET}]_v{N}
```
Exempel: `MAGI_brush_pain_beforeafter_stains_v1`

- **MARKET** (valfritt) — ISO-landskod i gemener för lokaliserade varianter: `no`, `dk`,
  `fi`, `de` … Utelämnas för svenska original. Sätts av lokaliserings­processen i
  `video-localization.md`. Exempel: `GRILL_mastern_pain_comparison_ruinsgrill_no_v1`.

Varje fält kommer från en **kontrollerad vokabulär** nedan. Håll dig till listorna —
det är det som gör datan grupperbar. Ny variant = bumpa `v{N}`. Ny idé = nytt hook.

---

## Vokabulärer (fältvärden)

### ANGLE — persuasionsvinkeln
| Kod | Betydelse |
|-----|-----------|
| `pain` | Problem/smärtpunkt vi löser |
| `benefit` | Konkret nytta/resultat |
| `social` | Social proof, recensioner, "10 000 sålda" |
| `offer` | Rabatt/deal/kampanj |
| `curiosity` | Nyfikenhet, "det här visste du inte" |
| `authority` | Expert, testvinnare, garanti |
| `fomo` | Rädsla att missa, brådska, slut i lager |
| `identity` | "För dig som är X" |

### FORMAT — det visuella formatet
| Kod | Betydelse |
|-----|-----------|
| `product` | Ren produktbild på bakgrund |
| `lifestyle` | Produkt i verklig miljö/användning |
| `ugc` | Ser ut som kund-content, mobilfoto |
| `beforeafter` | Före/efter, split |
| `meme` | Meme/humor-format |
| `textheavy` | Grafik med stor rubriktext |
| `comparison` | Vi vs dem / gammalt vs nytt |
| `collage` | Flera bilder/feature-callouts |

### HOOK — den primära kroken (kort slug, fritt men konsekvent)
Det första ögat/hjärnan fastnar på. Håll det till 1–2 ord: `stains`, `2sec`,
`grossout`, `winter`, `giftidea`, `soldout`, `guarantee`.

---

## Varför det här funkar för analys

När insights kommer in parsar vi namnet på `_` och får kolumner:

```
MAGI_brush_pain_beforeafter_stains_v1
│    │     │    │           │      └ iteration
│    │     │    │           └ hook
│    │     │    └ format
│    │     └ angle
│    └ product
└ brand
```

Då kan vi svara på: *"Vinner `pain` eller `benefit`? Slår `beforeafter` `ugc`?
Vilket hook har lägst CPA?"* — istället för att bara stirra på en enda siffra.

## Regler

0. **Speglade annonser bär källans nummer + 100** (Axels beslut 2026-09-18,
   `tools/ops-spegla.mjs`): `Takoverdrag_BOF_3_1` i Bäverbutiken blir
   `CaraShellRoof_BOF_103_1` i CaraShell. Butikens egna briefer numrerar
   under 100, så namnen krockar aldrig, koncept/nummer/variant går fortfarande
   att skära på, och `nummer − 100` pekar tillbaka på källraden. Numrera
   aldrig en egen brief ≥ 100.
1. **Bara små bokstäver** i ad-namn, `_` mellan fält, `-` inom ett fält.
2. **Ändra en variabel i taget** när du testar rent (håll allt annat lika, byt bara `angle`).
3. **Döp aldrig om** en annons som fått data — skapa en ny med bumpat `v{N}`.
4. Om ett fält inte passar in i vokabulären: lägg till det i listan här *först*, kör sen.

---

## Vinkelkoderna som faktiskt används i kontot (Axels beslut 2026-09-21)

⚠️ Tabellerna ovan (`pain`, `benefit`, `social` …) är det ursprungliga
systemet. Annonserna i MagiBorsten-kontot använder **tvåbokstavskoder** i
stället: `Takoverdrag_CS_2_H1`, `MC-Kapell_OB_3_1`. De hade aldrig skrivits
ner någonstans. Det här är de som bär mest spend, avlästa ur kontot
2026-09-21 (1 682 annonser, 29 olika koder):

| Kod | Antal annonser | Vad den betyder |
|---|---|---|
| `PD` | 484 | Produktdemonstration |
| `SP` | 332 | Social proof |
| `CS` | 223 | Prisankare / cost-saving |
| `SO` | 115 | Lösningen på problemet |
| `GT` | 100 | Present (gift) |
| `BOF` | 48 | **Funnelposition**, inte vad annonsen gör — se varningen nedan |
| `OB` | 4 | **Invändning.** Annonsen bemöter en sak publiken faktiskt säger |

### `OB` betyder invändning

Axels beslut 2026-09-21, efter att han läst copyn på alla fyra OB-annonser i
kontot. De är invändningsannonser allihop:

| Annons | Invändningen den bemöter |
|---|---|
| `Takoverdrag_OB_1_H1` | "Blåser det inte av?, tänker du" |
| `MC-Kapell_OB_3_1` | "passar den min moped?" |
| `MC-Kapell_OB_4_1` | "får hela hojen plats?" |
| `MC-Kapell_OB_1_1` | (samma familj) |

Koden hade aldrig dokumenterats. Den används från och med nu för varje annons
vars uppgift är att bemöta en invändning, och `kalla=voc` när invändningen är
läst ur kommentarerna.

### ⚠️ Använd INTE `BOF` för invändningar

`BOF` säger var i funneln annonsen ligger, inte vad den gör. Axels formulering:
**"med BOF går invändningsannonserna inte att skära ut ur datan."**

Problemet finns redan i historiken. Fyra av Taköverdragets nio BOF-annonser är
i själva verket invändningsannonser — `BOF_3_1` ("räcker det inte med en
presenning?"), `BOF_5_1` (samma), `BOF_6_1` ("klarar jag det själv?") och
`BOF_8_1` ("var bor den på sommaren?"). Det står i produktens `batch-log.md`,
men namnen säger det inte, så ingen uträkning kan hitta dem.

**De döps inte om.** De är live, och ett namnbyte i Meta bryter kopplingen
mellan annonsen och alla rader som redan pekar på den. Konsekvensen är att en
OB-analys bara gäller framåt: annonser före 2026-09-21 måste läsas för hand
ur batch-loggarna.

⚠️ `arBof()` i `agent/etikett.mjs` läser fortfarande enbart `BOF` och är
oförändrad — den handlar om funnelposition, och det är rätt.
