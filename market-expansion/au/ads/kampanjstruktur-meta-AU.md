# Meta-kampanj AU — byggark (The BBQ Clinic)

Byggs i Ads Manager. Allt nedan är färdigbestämt — bara att klicka in.

## Kampanjnivå
| Inställning | Värde |
|---|---|
| Namn | `AU — Mastern — CBO — Video — v1` |
| Mål | Försäljning (Sales/Conversions) |
| Budgettyp | **CBO** (Advantage campaign budget) |
| Daglig budget | **2 000 kr** |
| Budstrategi | Högsta volym (lowest cost), inget budtak |

## Adset (ETT, alla videor i samma)
| Inställning | Värde |
|---|---|
| Namn | `AU — Video — All — Broad` |
| Pixel | **Grillkliniken Pixel** |
| Händelse | Purchase |
| Geografi | Australien |
| Ålder | 25–65+ (bred — inga intressen, låt CBO+broad jobba) |
| Språk | lämna tomt (broad) |
| Placeringar | Advantage+ (auto) |
| Attribution | 7 dagars klick / 1 dags visning |

## Annonser (18 st — en per video, samma copy på alla)
| Inställning | Värde |
|---|---|
| Facebook-sida | **The Barbecue Clinic** |
| Destination | `https://thebbqclinic.com/products/the-master-electric-bbq-brush` |
| CTA-knapp | Shop Now |
| Namngivning | `AU_<videonamn>` (samma som filnamnet, t.ex. `AU_110_H1`) |

Videor: AU_001, AU_050, AU_110_H1–H3, AU_128B_H1–H5, AU_235_H1–H4, AU_Mastern_ad01, AU_Meta_AQO, AU_Rea_01.

## Copy (en-AU — 1:1 av den svenska körande annonsen)

**Primary text:**
Been putting off cleaning the BBQ since last summer?

The electric BBQ brush from The BBQ Clinic does the job for you — press a button and the grates are clean in minutes. No scrubbing, zero effort.

✔ Cordless and rechargeable
✔ Rotates 180° — gets into every corner
✔ Interchangeable brush heads, easy to wash

Click the link and order yours today.

**Headline (≤40 tecken):**
`Clean grates in minutes — no wire bristles` *(42 tkn — kortvariant: `Clean grates in minutes, no bristles` = 36)*

**Description:**
Electric BBQ brush with interchangeable heads. Cordless, rechargeable and easy to use. Order yours today.

## Listicle-adsetet (det du duplicerar själv)
1. Duplicera adsetet → döp till `AU — Video — Listicles`
2. Byt destination per annons:
   - 110-videorna (`AU_110_H1–H3`) → listicle **110**-sidans URL
   - `AU_Rea_01` → **Brynis**-sidans URL (rea-vinkeln)
   - farfars-vinkeln (om någon video matchar) → listicle **100**
   - övriga videor utan matchande listicle lämnas i original-adsetet
3. Samma copy — men på listicle-annonserna kan CTA:n gärna vara **Learn More** i stället för Shop Now (advertorial-klick konverterar bättre med mjukare knapp)

## Kontrollpunkter innan du trycker publicera
- [ ] Pixeln som är vald heter **Grillkliniken Pixel** och tar emot events från **thebbqclinic.com** (kolla Events Manager — om pixeln bara sitter på grillkliniken.se mäter kampanjen NOLL köp)
- [ ] Valutan i annonskontot är SEK (annars är "2000" fel belopp)
- [ ] Facebook-sidan The Barbecue Clinic har profilbild + omslagsbild (naken sida sänker trust)
- [ ] En testbeställning på thebbqclinic.com ger Purchase-event i Events Manager
