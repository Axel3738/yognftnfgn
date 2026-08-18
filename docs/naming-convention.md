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
{BRAND}_{PRODUCT}_{ANGLE}_{FORMAT}_{HOOK}_v{N}[_{DEST}]
```
Exempel: `MAGI_brush_pain_beforeafter_stains_v1`
Med destinationstest: `clin_greatgrill_pain_ugc_foilstop_v1_pdp`

Varje fält kommer från en **kontrollerad vokabulär** nedan. Håll dig till listorna —
det är det som gör datan grupperbar. Ny variant = bumpa `v{N}`. Ny idé = nytt hook.

**Destination hör hemma i ADSET-namnet, inte i annonsnamnet** *(beslut 2026-08-18,
ersätter det `DEST`-fält som lades till 2026-08-17)*. Skälet: samma creative ska heta
exakt likadant oavsett vilken sida den pekar på — då kan man ställa adset mot adset och
få ett rent destinationssvar, i stället för att ha två olika namn på samma annons.
Det är också så Axel redan namnger på Snark-kontot (`… - Rikaste områdena  LISTICLE`).

```
GG PRODUKTSIDA - 02 familia          ← alla annonser här går till produktsidan
GG LISTICLE 8 - 02 familia           ← samma annonser, mot advertorial 8
```

`utm_content` och `utm_term` sätts med Metas makron `{{ad.name}}` och `{{adset.name}}`,
aldrig hårdkodat. Då kan namn och attribution inte glida isär.

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

1. **Bara små bokstäver** i ad-namn, `_` mellan fält, `-` inom ett fält.
2. **Ändra en variabel i taget** när du testar rent (håll allt annat lika, byt bara `angle`).
3. **Döp aldrig om** en annons som fått data — skapa en ny med bumpat `v{N}`.
4. Om ett fält inte passar in i vokabulären: lägg till det i listan här *först*, kör sen.

---

## MX-varianten (GreatGrill, konto Snark mexico)

Kortare än standardnamnet ovan, eftersom kampanjen redan bär brand och produkt:

```
GG_02_H2_pain_ugc_alvapor
│  │  │  └───────────────── angle_format_hook (samma vokabulär som ovan)
│  │  └ hook-variant A/B/C = H1/H2/H3
│  └ annonsnummer = redigerarnas filnummer = Google-dokumentet
└ GreatGrill
```

Bildannonser: `GG_B1`–`GG_B6` i stället för nummer + hook.
`_v1` skrivs inte ut — versionen bumpas först när en v2 faktiskt finns.
