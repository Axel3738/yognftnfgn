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

**`DEST` (frivilligt, tillagt 2026-08-17)** — bara när samma creative körs mot flera
landningssidor. Utan destinationstest utelämnas fältet helt.

| Kod | Betydelse |
|-----|-----------|
| `pdp` | Produktsidan |
| `lst<N>` | Advertorial/listicle nr N (`lst8`, `lst11`, `lst22`, `lst1`, `lst13`) |

Regeln: **byt aldrig destination på en annons som fått data** — skapa en ny annons med
annat `DEST`. Annars går det inte att avgöra om skillnaden kom från sidan eller från tiden.

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
