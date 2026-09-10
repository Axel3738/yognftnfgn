# AdventLane — brandsteget (fas 1, steg 2–3)

Datum: 2026-09-10. Källa: `/ny-ops` med EN Bäverbutik-länk + `Butiks-id: kalender`.
Butik: `ikf0tu-5e.myshopify.com` ("My Store 5", SEK, Horizon, inga produkter).
Nischbutik (Axels beslut i prompten): brandet bär nischen **adventskalendrar**,
fler kalendrar läggs till senare. `creative_prefix` per produkt, aldrig per brand.

## Källprodukten

| | Adventskalender Racingbilar – 24 Bilar Bakom 24 Luckor |
|---|---|
| Handle | `adventskalender-racingbilar-24-bilar-bakom-24-luckor` (id 16516660691293) |
| Pris | 499 kr (jämförpris 649 kr) |
| SKU | `TEMU-601099694788256` — Temu-sidan svarar **"This item was discontinued"** (mätt 2026-09-10) |
| Bilder | 3 (kartong + bilar, öppnad kalender, julmiljö = AI-illustration) + en GIF (hand öppnar lucka 22) |
| Recensioner | 10 st i Judge.me, snitt 5,00 — **alla med samma tidsstämpel 2026-09-08 04:34–04:35**, alltså API-importerade i källan. Det är källans `created_at`, inga äkta kunddatum finns. |
| Källkampanj | MagiBorsten `120250134672020291` "Adventskalendern Racingbilar \| BE ROAS 1.62 \| Launch 2026-09-08", 16 annonser ACTIVE, prefix `Adventskalender_`, 2 145 kr spend / 11 köp t.o.m. 2026-09-10 |

Kaching-nivåer ur källsidans JSON (`kalla-kaching-paket.json`): 1 st 0 % ·
**2 st 15 % "Mest populär" (förvald)** · 3 st 20 %. Identiskt med fabrikens
standard-A, så `offer.paket` lämnas på defaults. Mitten förvald = husregeln.

**Inköpskostnaden är HÄRLEDD, inte kvitterad:** kampanjnamnets BE ROAS 1,62 och
formeln i `docs/temu-launch-flow.md` (pris / (pris − inköp)) ger
499 − 499/1,62 = **191 kr**. Axel bekräftar mot Temu-kvittot.

## Bilderna är facit

Kartong: "ADVENT CALENDAR – 24 SURPRISES INSIDE", rutiga flaggor, röd racerbil,
CE + CPC, varning "Choking hazard — small parts, not for children under 3".
Framsidan: 24 numrerade luckor i blandad ordning. Bakom varje lucka en liten
leksaksbil, alla olika (startnummer 67, 33, 07, 23, 51, 88, 74 …, rutmönster,
flammor). Hjulen rullar (källtext + GIF). **Okänt och därför aldrig påstått:**
storlek i cm, material, pull-back. Bild 3 (`racing-jul.jpg`, 2048²) har
förvrängd text på kartongen — AI-genererad, märks som illustration.

## Köparanalys

Köparen är en vuxen (förälder, mor-/farförälder, 28–65) som köper till ett barn
3–10 år. Alla tio recensioner är skrivna av den vuxne om barnet ("sonen längtar
till varje dag", "min dotter gillar den"). Tre av tio nämner självmant
alternativet: "ett bra alternativ till godis". Konflikten är chokladkalendern:
öppnas på trettio sekunder, uppäten före frukost, den 25:e finns inget kvar.
Emotionen är att vara den som hittade något bättre — och att december får en
morgonrutin. Sekundärt: julklappen är löst, kartongen är färdig att ge bort.

Nischen ska rymma fler kalendrar (vuxna, husdjur, hobby) — brandtexterna får
därför aldrig låsa sig vid bilar eller barn; det gör bara produkttexterna.

## Namnet

**AdventLane.**

- Helt engelskt, inga å/ä/ö. "Advent" är samma ord på svenska och norska;
  "lane" är grundengelska (memory lane, fast lane).
- Bär nischen, inte produkten: en rad av luckor.
- Seriöst utan att bli kallt. Inte ett fjärde "-Guard".

**Bortvalda:** *AdventHouse* — två befintliga amerikanska kalendermärken
("The Advent House", "Christmas Advent House", sökning 2026-09-10).
*24Doors*, *AdventBox* — generiska, siffra först respektive produktord.

**Domänkoll 2026-09-10** (RDAP via rdap.org, `.se`/`.no` svarar 404 = ledig;
DNS utan A-post): `adventlane.se` LEDIG · `adventlane.no` LEDIG ·
`adventlane.com` TAGEN (som drytrek.com — .se är huvuddomän).
Kontrolleras skarpt när VA:n köper.

## Palett

| Roll | Hex | Varför |
|---|---|---|
| Mörk | `#152444` | Decembernatt, midnattsblå. Header, sidfot, loggan. |
| Yta | `#F7F2EA` | Varm papperston — stearinljus, aldrig kall grå. |
| Accent | `#A8283A` | Lingon. Den enda färgen som ropar; festlig utan rea-röd. |
| God | `#2F6B4F` | Grangrön bock. |
| Stjärnor | `#00B77F` | Husregel — Judge.me, varje butik. |

Typografi: Poppins Bold (`poppins_n7`) i versaler för ordmärket, DM Sans i
brödtext. Poppins installerades i containern från google/fonts (GitHub raw —
jsDelivr saknade Bold-filen) för att sharp skulle kunna rastrera loggan.

## Loggan

Tre varianter, se `loggor-jamforelse.png`. Nytt motiv i `logga-generera.mjs`:
**`--motiv lucka`** — en öppnad kalenderlucka (ram, tonad öppning, lingonröd
flik). Droppen är TankGuards motiv och passar inte en kalenderbutik.

- **A — emblem** (`kalender-logga-a.png`): midnattsblå disk, lucka, ADVENTLANE,
  ADVENT CALENDARS spärrat under. Mest komplett. **VALD av Axel 2026-09-10**
  ("Den vänstra loggan"). Byte är ett API-anrop (`--igen logga`).
- **B — sigill** (`kalender-logga-b.png`): ljus disk, ADVENT / LANE i två rader.
- **C — monogram** (`kalender-logga-c.png`): AL stort, ordmärket litet.
- Favicon: luckan ensam på mörk disk.

## Demot (MP4-regeln)

GIF:en konverterades till en 6-sekunders loopad MP4 (283 kB, h264). Uppladdning
till Shopify Files som Video **går inte på trial**: `fileCreate` svarar "The
file is not supported on trial accounts" (mätt 2026-09-10, `API-GRANSER.md`).
Källans GIF bär demot tills ägaren valt plan; sedan `node factory/filer.mjs
<mp4>` + `--igen metafalt`.
