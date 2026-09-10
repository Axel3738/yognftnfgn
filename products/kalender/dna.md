# AdventLane (kalender) — Creative DNA

**Skapad 2026-09-10** av `/ny-annonser adventlane` (första körningen).
OPS-butik nr 5, nischbutik för adventskalendrar. Första produkten:
Adventskalender Racingbilar (24 bilar bakom 24 luckor). Ingen egen annons
har kört ännu — allt nedan är **ärvt** från Bäverbutikens annonser för exakt
samma produkt, launchade 2026-09-08 (SE) och 2026-09-09 (NO).

Underlag: Meta Graph 2026-09-10 (`date_preset: maximum`), 16 svenska + 16
norska annonser. Rådata `factory/output/adventskalender-racingbilar/kallannonser.json`,
utfall `products/kalender/batch-log.md`.

---

## Produkten och kunden

**Produkten:** blå presentkartong, 24 numrerade luckor i blandad ordning, en
liten leksaksbil bakom varje — alla olika (startnummer 67, 33, 07, rutmönster,
flammor). Hjulen rullar. CE + CPC. Små delar, inte under 3 år. 499 kr,
jämförpris 649 kr — **samma pris som källan**, inget pristal behöver bytas.

**Kunden:** den vuxne som köper kalendern — förälder eller mor-/farförälder,
28–65 — till ett barn 3–10 år. Alla tio källrecensioner är skrivna av den
vuxne om barnet. Tre av tio säger självmant "ett alternativ till godis".

**Konflikten som bär allt:** chokladkalendern. Öppnas på tio sekunder,
uppäten före frukost, ingenting kvar. Den här lämnar 24 bilar på golvet den
24:e. Den insikten är bevisad i två format på två marknader (se nedan).

**Säsong:** produkten säljer fram till 24 december och är död därefter. Varje
lärdom här gäller Q4 — och nästa kalender i butiken ärver den.

---

## Vad som är bevisat (signifikansgrinden 300 kr / 3 köp, ANALYSMETOD.md)

Källbutikens break-even-CPA: 499 − 191 = **308 kr** (BE-ROAS 1,62, samma
tal som AdventLane räknar med — inköpet är HÄRLETT ur kampanjnamnet, inte
kvitterat). Rangordning på vinstbidrag `(308 − CPA) × köp`.

### 1. PD-vinkeln (chokladen vs bilarna) är vinnaren — i BÅDA format

| Annons | Format | Spend | Köp | CPA | Vinstbidrag |
|---|---|--:|--:|--:|--:|
| `Adventskalender_PD_2_1` | bild | 1 136 kr | 7 | 162 kr | **+1 022 kr** |
| `Adventskalender_PD_2_H1` | video | 475 kr | 3 | 158 kr | +450 kr |

Samma copy, samma motiv (bild 2 = kalendern öppnad med bilarna), bild och
video ger samma CPA. Det är **insikten** som säljer, inte formatet. Copyn:
"Chokladen är uppäten på 10 sekunder / Den här adventskalendern håller hela
december" + "En bil att leka med långt efter att luckan är öppnad".

### 2. GT-vinkeln (gåvogivaren: "han älskar bilar") fungerar men är svagare

`Adventskalender_GT_1_H1` video: 478 kr, 2 köp, CPA 239 kr, +138 kr. Under
tre köp — indikation, inte dom. Copyn talar till den som ska ge bort: "Se
blicken när han öppnar den".

### 3. Norge bekräftar insikten oberoende

Magiborsten NO (NOK, summeras aldrig med SEK): `SP_3` video 487 NOK / 2 köp,
`SP_2_1` bild 315 NOK / 3 köp — och den norska SP-copyn är i praktiken
PD-vinkeln ("Sjokoladekalenderen er ofte tom 2. desember / Denne varer helt
frem til julaften"). Två marknader, samma konflikt, båda köper.

### 4. Under grinden — ingen dom

CS (23 % rabatt, "bara idag") och SP (påhittat kundcitat) har tillsammans
under 100 kr spend i SE. Ingen dom. Men båda bär **källbutikens villkor** som
AdventLane inte får använda (se rotorsaker).

---

## Rotorsaker och regler för den här produkten

- **Källcopyn bär villkor och påståenden AdventLane inte har:** "bara idag",
  "begränsat lager – slut innan jul", "30 dagars öppet köp – nöjd eller
  pengarna tillbaka", citatet "Han sprang ut ur sängen…" från en "verifierad
  kund, 34 år" som inte finns bland butikens tio recensioner, och "årets
  mest efterlängtade". AdventLane: 14 dagars ångerrätt, fri frakt SE + NO,
  riktiga citat med förnamn (Sofia: "Barnen älskar att öppna luckorna.
  Bilarna blev snabbt favoriter."). Copyn skrevs om 2026-09-10 av
  copy-subagent, se `factory/output/adventskalender-racingbilar/se-copy.json`.
- **Bara H1 finns.** Alla tolv videor är `_H1` — ingen hook har testats mot
  en annan. Första egna batchen ska testa hooks på PD-videon, inte nya vinklar.
- **Bild ≈ video på PD.** Nästa batch behöver inte fler videor för att bevisa
  vinkeln; den behöver fler *motiv* (bild 1 kartongen, bild 3 julmiljön) på
  samma copy.
- **NO betalar i NOK, butiken i SEK.** Norska annonser byggs först när
  NOK-paketnivåer finns i butiken (VA:ns klick, NOK i admin). Källans norska
  pris 439/579 NOK är inte AdventLanes.
- **Sidbehörigheten** stoppade annonsskapandet 2026-09-10 (#200, samma som
  TankGuard): sidan 1304279782771044 ligger i owned_pages men användaren
  saknar roll. Löses i Business Manager, inte i kod.
