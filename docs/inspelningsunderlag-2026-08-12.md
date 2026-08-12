# Inspelningsunderlag — toppvideorna i Axelbältet + Sätesöverdragaren

**Skapat:** 2026-08-12 · **Syfte:** Axel spelar in egna UGC-videor och vill återskapa
de bäst presterande annonserna med högre produktionskvalitet.
**Data:** Meta ad-level insights, livstid (Axelbältet 22 juli–12 aug,
Sätesöverdragaren 20 juli–12 aug). Rangordnat på vinstbidrag enligt
`docs/os/ANALYSMETOD.md`. Datakvalitetskontrollen ren på alla rader.

Publicerad läsvänlig version: https://claude.ai/code/artifact/c429710d-29a1-4b9c-a621-3f7def6e12d2

**De två videor som faktiskt ska spelas in har varsitt eget dokument:**

| Video | Produkt | Fältkort | Fil i repot |
|---|---|---|---|
| `Seatcover_PD_16_H1` | Sätesöverdragaren | https://claude.ai/code/artifact/990017fd-0dc6-4088-a659-f5038b62d197 | `products/satesoverdragaren/briefs/video-ads/Seatcover_PD_16_H1/inspelning-axel.md` |
| `Trimmerbelt_PD_12_1_H1` | Axelbältet | https://claude.ai/code/artifact/cd7db6f0-8eab-4deb-9bf4-e680af24d21f | `products/axelbaltet/briefs/video-ads/Trimmerbelt_PD_12_1_H1/inspelning-axel.md` |

Övriga toppannonser kräver ingen ny inspelning: `PD_13_H1` är redan live,
`PD_3_H1` är AI-material, `PD_2_1_H1` rekommenderas bort, och `SO_1_H2` kan inte
återskapas utan att klippet granskas i Ads Manager först.

---

## Det viktigaste fyndet

**Axelbältets mest lönsamma video är rått telefonfilmat UGC — en riktig man i ett
riktigt garage**, verktyg och cykel i bakgrunden, inbrända svenska captions i vit
rundad ruta i nedre tredjedelen. Det är den **enda** videon med en riktig människa i
hela kontot; allt annat är AI-genererat eller leverantörsmaterial. Den bär 72 % av
kampanjens vinstbidrag ensam.

⚠️ **"Högre kvalitet" får inte betyda mer polerat.** Kontots bevisade stil är
dokumentär råhet. Skarpare bild och bättre ljud — ja. Reklamlook — nej.

---

## Sätesöverdragaren (break-even-CPA 478 kr)

| # | Annons | Spend | Intäkt | Köp | CPA | Vinstbidrag | Brief |
|---|---|---|---|---|---|---|---|
| 1 | `Seatcover_PD_1_3_H1` | 22 081 kr | 57 375 kr | 81 | 273 kr | **16 637 kr** | ❌ finns ej |
| 2 | `Seatcover_PD_13_H1` | 2 064 kr | 3 894 kr | 6 | 344 kr | 804 kr | ✅ Notion |
| 3 | `Seatcover_PD_2_1_H1` | 1 307 kr | 1 947 kr | 3 | 436 kr | 127 kr | ❌ finns ej |

**1 — `PD_1_3_H1`:** 38 s rå leverantörsvideo, genomgående inbrända svenska captions,
ingen person i bild, produkten fyller rutan från sekund 0, gul/grå färgsättning
(John Deere-igenkänning). Byggd i batch 1 innan OS:et — ingen brief skrevs.
**Ersättningsbriefen `Seatcover_PD_16_H1` (Notion, status Draft, ej inspelad) är
rekonstruktionen** och är byggd för exakt detta: samma manus, nytt material.
Största publiktappet ligger 3s→9,5s.

**2 — `PD_13_H1`:** ~20 s, vinnarkroppen från sekund 4 med ny öppning (handduken på
sätet). Launchad 2026-08-09, bedömbar efter tre dygn. Högsta hook-rate i kampanjen,
55,4 % mot vinnarens 41,2 %. Full brief med manus + shotlista i Notion.

**3 — `PD_2_1_H1`:** 33 s före/efter, batch 1, ingen brief. Rekommenderas **inte**
som inspelningsobjekt — 127 kr vinst på 1 307 kr spend, och vinkeln finns bättre
exekverad i PD_13.

### Manus `Seatcover_PD_16_H1` (~20 s, 9:16 + 4:5)

| # | Tid | Svenska (använd denna) | English meaning |
|---|---|---|---|
| 1 | 0–2s | Kallt och blött redan på morgonen? | Cold and wet already in the morning? |
| 2 | 2–4s | Och glödhett efter en dag i solen. | And scorching hot after a day in the sun. |
| 3 | 4–7s | Vårt sätesöverdrag träs rakt över din dyna. | Our seat cover slides right over your cushion. |
| 4 | 7–9s | ✅ 600D Oxford – vattenavvisande tyg | Water-repellent fabric |
| 5 | 9–11s | ✅ Vadderad insida som mjukar upp guppen | Padded inside that softens the bumps |
| 6 | 11–14s | ✅ Justerbara remmar sitter kvar på ojämn mark | Adjustable straps stay put |
| 7 | 14–17s | ✅ Klart på under 60 sekunder, inga verktyg – passar de flesta åkgräsklippare | Done in under 60 seconds, no tools |
| 8 | 17–20s | 👉 Tryck på länken och se hur enkelt det sitter på | Tap the link and see how easily it fits |

**Shotlista:** 0–2s CU bart säte med dagg · 2–4s samma säte i hårt solljus ·
4–9s överdraget dras över dynan, remmar knäpps (pengabilden, en ren rörelse) ·
9–14s CU tyg + hand som trycker på vadderingen · 14–17s vidbild · 17–20s hjältebild
+ slutkort. Inga personer i bild, bara händer.
**Kravet:** materialet ska synbart vara en annan gräsklippare i en annan miljö än
originalet — annars säger testet ingenting.
Brief: https://app.notion.com/p/3b7270ab908c81b58505ccdc9bc4965c

### Hook `Seatcover_PD_13_H1` (0–4s, resten = vinnarens manus)

| # | Tid | Svenska (använd denna) | English meaning |
|---|---|---|---|
| 1 | 0–2s | Lägger du en handduk på sätet innan du kör? | Do you put a towel on the seat before driving? |
| 2 | 2–4s | Den håller typ en dag. | It lasts about a day. |

**Shotlista 0–4s:** CU hopvikt handduk/filt på ett bart säte, fuktig och skrynklig,
handhållet vardagsläge, mulet ljus — måste se använd ut, inte stylad. Handen lyfter
bort handduken → blött säte syns. Hårt klipp vid 4,0 s till överdraget som glider på.
Brief: https://app.notion.com/p/3b4270ab908c81a3ad66e8b9a578425b

---

## Axelbältet (break-even-CPA 299 kr)

| # | Annons | Spend | Intäkt | Köp | CPA | Vinstbidrag | Brief |
|---|---|---|---|---|---|---|---|
| 1 | `Axelbälte_PD_1_H1` | 13 864 kr | 31 396 kr | 53 | 262 kr | **1 983 kr** | ❌ finns ej |
| 2 | `Axelbälte_SO_1_H2` | 12 617 kr | 25 052 kr | 43 | 293 kr | 240 kr | ❌ finns ej |
| 3 | `Trimmerbelt_PD_3_H1` | 1 014 kr | 1 797 kr | 3 | 338 kr | −117 kr | ✅ uppföljare |

**1 — `PD_1_H1`:** rått telefonfilmat UGC, riktig man i riktigt garage. Att detta var
den vinnande ingrediensen upptäcktes först vid visuell granskning 2026-08-09.
Replikeringsbriefen är `Trimmerbelt_PD_12_1_H1` (manus nedan).

**2 — `SO_1_H2`:** video på säsongs-/erbjudandevinkeln. Ingen dokumentation av
videoinnehållet finns — bara annonstexten. **Får inte återskapas på gissning**;
klippet måste granskas i Ads Manager först.

**3 — `PD_3_H1`:** AI-genererad, 25–35 s, voiceover + undertexter, **inga ansikten** —
bara händer, selen bakifrån, trimmern, trädgården. Högsta completion rate i kontot.
Har försämrats sedan 2026-08-09 (då 827 kr / CPA 276 kr / +151 kr): +187 kr spend
utan nya köp, nu under break-even. Bevisade ändå regeln: **AI-material fungerar i
detta konto så länge inga ansikten syns.** AI med ansikten (`PD_2_1`, `SF_2_1`) har
dödats för artefakter.

### Manus `Trimmerbelt_PD_12_1_H1` (30–40 s, 9:16 + 4:5)

⚠️ Skrivet för **kvinnlig creator 45–65** (kontot har aldrig kört kvinnofrontat).
Filmar Axel själv är det en avvikelse — raderna 1–2 och 9 måste skrivas om, och
testet mäter då något annat än briefen anger.

| # | Svenska (talas + brinns in som caption) | English meaning |
|---|---|---|
| 1 | Jag älskar trädgården… | I love gardening… |
| 2 | …men efter typ 20 minuter är jag slut | …but after like 20 minutes I'm done |
| 3 | Det är inte musklerna som ger upp | It's not my muscles that give out |
| 4 | Det är axeln, hela tiden | It's my shoulder, the whole time |
| 5 | Trimmern väger ju faktiskt en del | The trimmer actually weighs a fair bit |
| 6 | Så jag testade det här bältet | So I tried this belt |
| 7 | Vikten fördelas över axeln istället | The weight spreads across the shoulder instead |
| 8 | Jag håller på mycket längre nu | I keep going much longer now |
| 9 | Justerbart, så det satt perfekt direkt | Adjustable, so it fit perfectly right away |
| 10 | Länken finns här nere | The link is down here |

**Filmstil:** egen telefon, egen trädgård/garage/uppfart, handhållet, stående,
naturligt ljus, rumsljud. Kameraskak är en fördel. Produkten bärs på riktigt —
visa höftplattan och den röda kroken vid justering. Captions: inbrända, vit rundad
ruta, nedre tredjedelen, kopiera originalets stil exakt.
Brief: https://app.notion.com/p/3b7270ab908c81858fb6e585745e2287

---

## ⚠️ Copyn som ligger live matchar inte brieferna

Kontrollerat direkt mot Meta 2026-08-12:

- Alla tre Sätesöverdrag-videor kör **identisk primärtext** — batch 1:s block.
  Även `PD_13_H1`, vars brief hade egen handduks-text ("Handduken på sätet håller
  typ en dag…") och egen rubrik ("Handduken håller inte – överdraget gör").
  Den texten har aldrig gått live.
- Axelbältet: tolv annonser launchade 2026-08-05 och 2026-08-09 återanvände alla
  samma två textblock från batch 1. Efter 37 665 kr spend har kampanjen **aldrig
  testat en enda copyvariant.**

Detta är samma rotorsak som redan står i `products/satesoverdragaren/dna.md`.
Konsekvens: PD_13:s 6 köp uppnåddes med fel text — vinsten är ett golv, inte ett tak.

---

## Regler som gäller oavsett vilken video som spelas in

1. **Priser Axelbältet:** 599 kr · ord. 678 kr · spara 79 kr (11,65 %). ALDRIG
   509/636/"20 %".
2. **Priser Sätesöverdraget:** 649 kr · ord. 811 kr. Genomstrykning måste vara en
   riktig linje — en tidigare annons skrev ut ordet "överstruket" som text i bilden.
3. **Priset renderas aldrig in i videon** — det bor i annonstexten.
4. **Produkten i bild före sekund 4.** Undantagslöst.
5. **Captions i varje video**, ord för ord från manustabellen, måste fungera helt
   utan ljud. Dyrast betalda lärdomen i kontot: samma video utan captions gav
   ROAS 0,53 mot 2,60.
6. **Längd 20–40 s.** Videor på 79–146 s har noll köp i kontot trots högst CTR.
7. **Inga påhittade citat, recensioner eller "verifierad kund".** Har gått fel två
   gånger; en annons flaggades av Meta. Godkända claims: "4,75 av 5 i snittbetyg",
   "Justerbart", "30 dagars öppet köp", "Fri frakt".
8. **Inga medicinska påståenden** utöver att vikten fördelas.
9. **Export 9:16 + 4:5.**
10. **Svenska rader exakt som skrivna**, med korrekta å/ä/ö.
