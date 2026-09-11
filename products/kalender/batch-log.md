# Batch-logg — AdventLane (Adventskalender Racingbilar)

OPS-butik nr 5 (nischbutik för adventskalendrar). Butiks-id `kalender`
(tekniskt, byts inte), produkt-id `adventskalender-racingbilar`, brand
**AdventLane**, adventlane.se. Produkten är samma fysiska kalender som
Bäverbutiken säljer.

Annonskonto: **MagiBorsten DK `915422744950975`** (OPS Factorys gemensamma konto,
SEK). Kampanjprefix `ADVENTLANERACING_`, annonsprefix `AdventLaneRacing_`.
Sida och pixel: står inte i produktfilen (`meta.page_id`/`pixel_id` tomma) —
läs dem ur kampanjen i kontot, kopiera aldrig från en annan butik.
⚠️ Förväxla aldrig med MagiBorsten `1867947880635861` = Bäverbutiken.

---

## Batch #1 — 2026-09-10 · ÄRVD från Bäverbutiken

**Inte en ny batch i vanlig mening.** Kampanjerna
`ADVENTLANERACING_SE_Racingkalendern | BE-ROAS 1,62 | 2026-09-10` (15 annonser,
4 adsets: PD, GT, CS, SP) och `ADVENTLANERACING_NO_Racingkalendern | BE-ROAS 1,62 |
2026-09-10` (13 annonser) skapades 2026-09-10 ur Bäverbutikens annonser för
samma produkt.

⚠️ **Bygget är inte loggat i repot.** Det finns ingen `byggda-annonser.json`,
`brand-detektor.md` eller `se-copy.md` för kalender (kontrollerat 2026-09-11
i `factory/output/kalender/` och `git log --all`). Det som står här är läst
ur kontot och ur källan i efterhand. **Hypotes: ej loggad.** Vad som ändrades
i copyn (brådska, citat, 30-dagarslöftet, länk) är okänt tills copyn läses ur
kontot.

**Källa:** `Adventskalendern Racingbilar | BE ROAS 1.62 | Launch 2026-09-08`
(MagiBorsten SE, `120250134672020291`), 16 ACTIVE-annonser.
**Källans utfall vid avläsning 2026-09-11 (≈ 3 dygn):** 3 147 kr, 16 köp,
ROAS 3,21, AOV 632 kr. Rådata `factory/output/adventskalender-racingbilar/kallannonser.json`.

### Ärvd historik — vad källan faktiskt bevisade

Grinden (≥ 300 kr OCH ≥ 3 köp) passeras av **två** annonser. Vinstbidrag mot
AdventLanes BE-CPA 323 kr (kvitterad 2026-09-11).

| Källannons | Typ | Spend | Köp | CPA | ROAS | Vinstbidrag | Vad det säger |
|---|---|---:|---:|---:|---:|---:|---|
| `Adventskalender_PD_2_1` | bild | 1 376 kr | 8 | 172 kr | 3,85 | 1 208 kr | **Top spender och bevisad vinnare.** 44 % av spenden, 50 % av köpen. Chokladkonflikten som stillbild. |
| `Adventskalender_PD_2_H1` | video | 898 kr | 6 | 150 kr | 3,85 | 1 038 kr | **Bevisad.** Samma copy som PD_2_1, video. Lägst CPA, högst CVR (4,92 %). |
| `Adventskalender_GT_1_H1` | video | 594 kr | 2 | 297 kr | 2,27 | — | Presentvinkeln. Under 3 köp — ingen dom. CPA 26 kr under break-even 323. |
| `Adventskalender_GT_2_1` | bild | 59 kr | 0 | — | — | — | för tidigt |
| `Adventskalender_CS_2_1` | bild | 54 kr | 0 | — | — | — | för tidigt |
| `Adventskalender_GT_2_H1` | video | 39 kr | 0 | — | — | — | för tidigt |
| `Adventskalender_SP_2_1` | bild | 36 kr | 0 | — | — | — | för tidigt — **finns inte i OPS SE-kampanjen**, skäl ej loggat |
| `Adventskalender_PD_1_H1` | video | 28 kr | 0 | — | — | — | för tidigt (hook 28,8 %, hold 34,2 % — brus på 28 kr) |
| 8 annonser under 21 kr | — | 62 kr | 0 | — | — | — | ingen data (PD_3_H1, GT_3_H1, CS_3_H1, SP_1_H1, CS_1_H1, CS_2_H1, SP_2_H1, SP_3_H1) |

**Vinkelrangordning på spend i källan:** PD 2 322 kr (14 köp) · GT 709 kr (2) ·
CS 70 kr (0) · SP 45 kr (0). CS och SP är i praktiken otestade.

⚠️ **Källans ROAS går att döma AdventLane på i det här fallet** — BE-ROAS är
1,62 i källan mot 1,54 hos AdventLane (kvitterad COGS 2026-09-11), samma pris. Men copyn måste
ändras (brådska, citat, villkor — se `dna.md`), så SP- och CS-utfallen hos
AdventLane är **nya hypoteser**, inte fortsättningar.

### Vad som (borde ha) ändrats i överföringen

| Yta | Läge i källan | Krav hos AdventLane | Verifierat i kontot? |
|---|---|---|---|
| Länk | baverbutiken.se | adventlane.se | ❌ ej läst |
| Pris | 499 / 649 kr | identiskt | — |
| Brådska (CS) | "bara idag", "slut innan jul" | bort — stående pris, ingen hype | ❌ ej läst |
| Social proof (SP) | citat ingen kund sagt, "Verifierad kund, 34 år" | en av de tio riktiga recensionerna, ordagrant | ❌ ej läst |
| Villkor (SP) | "30 dagars öppet köp – nöjd eller pengarna tillbaka" | 14 dagars ångerrätt, inget eget löfte | ❌ ej läst |
| Fraktvillkor | ej nämnt i copyn | fri frakt SE + NO | — |
| Norska kampanjen | — | egna norska annonser för kalendern | ✅ copyn är kalenderns, på norska, länk adventlane.se/nb (läst 2026-09-11) |
| Norskt pris (CS) | — | 439 kr i Norge (Axel 2026-09-11) | ✅ `_NO_CS_*` säger "579 kr → 439 kr" — rätt pris. ⚠️ Brådskan ("i dag", "begrenset lager") strider mot brandets ton; Axels beslut 2026-09-11: pausas inte |

### Ekonomi

Pris 499 kr, COGS 142,27 kr + 3 EUR tull per order (= 33,60 kr, ECB 2026-09-10),
utan moms. **TB 323 kr · BE-ROAS 1,54 · BE-CPA 323 kr · target-CPA 198 kr.**
Kvitterat av Axel 2026-09-11 (ersätter det härledda 191 kr). Facit `factory/produkter/adventskalender-racingbilar.yaml`.

### Hypoteser att pröva i första `/cs`

1. Håller PD-vinkeln (chokladkonflikten, 74 % av källans spend, 14 köp) hos
   AdventLane med samma copy? Källans två vinnare har 0 resp. 2 kr på OPS —
   CBO:n har inte gett dem chansen än.
2. Bild eller video? Källan säger "lika ROAS, bilden skalar, videon
   konverterar". Första riktiga testet: samma PD-koncept som bild OCH video i
   samma batch, allt annat lika.
3. GT-vinkeln (hook 32 %, CPA 297 kr på 2 köp) — konverterar den när den får
   ett skäl att köpa nu (leveranstid 5–10 dagar → "beställ före …"), utan att
   bli falsk brådska?
4. CS och SP med rättad copy (stående pris, riktig recension, 14 dagar) — helt
   nya hypoteser, 0 kr bakom sig.

### Utfall vid avläsning 2026-09-11 (setup, ≈ 1 dygn)

SE: **372 kr, 0 köp.** Ingen annons över grinden. Per annons (data, ingen dom):

| Annons | Spend | Köp | Hook 3 s | Hold | CTR | Länkklick | Status |
|---|---:|---:|---:|---:|---:|---:|---|
| AdventLaneRacing_PD_1_H1 | 226 kr | 0 | 23,3 % | 23,4 % | 3,79 % | 31 | ACTIVE — 61 % av spenden |
| AdventLaneRacing_GT_3_H1 | 53 kr | 0 | 23,8 % | 17,5 % | 2,45 % | 6 | ACTIVE |
| AdventLaneRacing_CS_1_H1 | 25 kr | 0 | 43,8 % | 15,4 % | 2,25 % | 0 | ACTIVE |
| AdventLaneRacing_GT_2_H1 | 24 kr | 0 | 32,1 % | 8,9 % | 2,14 % | 2 | ACTIVE |
| AdventLaneRacing_CS_3_H1 | 13 kr | 0 | 25,9 % | 0 % | 3,45 % | 1 | ACTIVE |
| AdventLaneRacing_SP_1_H1 | 9 kr | 0 | 29,5 % | 16,7 % | 1,64 % | 1 | ACTIVE |
| AdventLaneRacing_SP_3_H1 | 8 kr | 0 | 17,0 % | 11,1 % | 0 % | 0 | ACTIVE |
| AdventLaneRacing_GT_1_H1 | 8 kr | 0 | 34,9 % | 13,3 % | 2,33 % | 1 | ACTIVE |
| 7 annonser ≤ 2 kr | 6 kr | 0 | — | — | — | — | ACTIVE (PD_3_H1, **PD_2_H1 2 kr**, CS_2_1, SP_2_H1, **PD_2_1 0 kr**, GT_2_1, CS_2_H1) |

NO: 16 annonser (13 med spend), ≈ 445 kr, 0 köp (`AdventLaneRacing_NO_PD_2_1`
373 kr, CTR 3,25 %). Copyn verifierad som kalenderns; norskt pris 439 kr är rätt
(Axel 2026-09-11) — `dna.md` rotorsak 3.

Nästa avläsning: första briefdagen (söndag 2026-09-13 enligt registret).

---

## Leveransrunda `/ops-leverans` 2026-09-11 — 0 uppladdade, STOPP: Facebook-sidan opublicerad

Kön: 4 videorader i `To be Reviewed` i hubben "Racing Car Advent Calendar creative hub"
(alla flyttade från Bäverbutiken, prefix `Adventskalender_` → ommärkta `AdventLaneRacing_`):
`PD_4_H1`, `PD_6_H1`, `AU_1_H1`, `FM_1_H1`. Två filer per rad (`_1` = 4:5, `_2` = 9:16).

QA (frames lästa, `tools/qa-frames.py`): alla fyra visar 649 → 499 kr = butikens pris
(499 kr, jämförpris 649 kr, läst live), produkt i bild före sekund 4, inget
Bäverbutiken-brand. Anmärkningar (video ⇒ inte stopp): `PD_6_H1` captions
"649 nio"/"499 nio" och "Jock den"; `AU_1_H1` "och pappor" (av papper), "beställd
december"; `FM_1_H1` saknar prisskylt (inget pris = grönt); längder 8–13 s mot
briefarnas 10–20 s.

**Stopp: Facebook-sidan `1304279782771044` (AdventLane) är opublicerad.** Meta pausade
10 av 16 SE-annonser och 7 av 16 NO-annonser 08:00–08:35 CEST med HARD_ERROR 2446095
"Sidan har inte publicerats". Kvar ACTIVE/ACTIVE: `SP_1/2/3_H1`, `GT_2_H1`,
`CS_1/2_H1` (SE) — samma sida, väntas följa. Nya annonser skulle ärva samma sida
(`ops-till-meta` steg 6) och blockeras direkt. **Beslut: ingen uppladdning**, status
orörd, kommentar på varje rad. Kön tar dem automatiskt när sidan är publicerad.
Inget pausat, inget aktiverat (Metas pauser är inte körningens egna — regeln).

Copy förberedd och sparad i `factory/output/kalender/leverans-2026-09-11.json`
(`rader[].copy`): `PD_4_H1` återanvänder kontots PD-copy (briefen isolerar format,
inte ord); `PD_6_H1`, `AU_1_H1`, `FM_1_H1` skrivna av subagent (sonnet) med
tre-frågorstestet grönt. Nästa körning kan läsa dem därifrån.

Verifierat ur kontot samtidigt (dna.md rotorsak 5 stängd): SE-copyn per adset är
källans ordagrant för PD och GT; **CS bär fortfarande "23% rabatt – bara idag" och
"Begränsat lager – slut innan jul"** (falsk brådska, ej rättad); SP är rättad
("Sonen längtar till varje dag" – Johan, 14 dagars ångerrätt). Ingen ändring gjord.

---

## Översättning NO `/ops-oversatt` 2026-09-11 — 0 rader, inget att göra

Kön: **0 rader** i `SE-ACTIVE to be translated` i hubben "Racing Car Advent Calendar
creative hub" (Typ ~ pending approval). Skälet är dagens leveransrunda ovan: 0 uppladdade
(Facebook-sidan opublicerad) ⇒ inget hamnade i översättningskön.

NO-kampanjen hittad, exakt en ACTIVE: `ADVENTLANERACING_NO_Racingkalendern | BE-ROAS 1,62 |
2026-09-10` (`120249031977180172`), fyra adset CS / PD / G / SP, ärvd länk
`adventlane.se/nb/products/adventskalender-racingbilar`, butikspris 499 SEK på `/nb`
(kontots NO-annonser säger 439 kr — Axels besked, se `dna.md` rotorsak 3; **kommandots
regel 4 "norsk copy utan pris" och Axels 439 kr-besked krockar** — avgörs när första
raden faktiskt ska översättas). Inget översatt, inget renderat, 0 HeyGen-credits,
kontot orört. Metas 7 NO-pauser (sidan) lämnade som de är.

Discord-rapport postad i `#annons-uppladdning` (AdventLane), Axel pingad under ACTION
NEEDED med samma blocker som 13:40: publicera sidan `1304279782771044`.

Bifynd, fixat i `tools/meta-lib.mjs`: väntraden vid Metas rate limit gick till stdout och
hamnade i `jobb.json` (fyra rader, filen blev ogiltig JSON). Nu stderr. Kontoläsningen tog
≈ 18 min p.g.a. rate limit (försök 6/8) — normalt, inte hängning.

---

## Batch #2 — 2026-09-12 · första briefronden (`/notionscalercs kalender/adventskalender-racingbilar`, körning nr 2) · KALLSTART

**Läge vid briefning:** OPS-kampanjen SE har **0 bedömbara annonser** (≥ 300 kr OCH
≥ 3 köp) — se "Utfall vid avläsning 2026-09-12" nedan. Ingen feedback-loop, ingen
dom över en enda AdventLane-annons. Hela ronden är nya koncept ur ärvd DNA
(`dna.md`, ÄRVD-tabellen) + backloggen. Kadens: **7** (ingen redigerare tilldelad).

**Hubben bar redan 20 rader** (`Adventskalender_`-prefix, Bäverbutikens `/cs`-briefer
som följde med flytten): PD_4/5/6/7, CO_1/2, BF_1/2/3, RI_1(+_1), RV_1/2, TR_1/2,
LI_1, UG_1, AU_1, FM_1, CS_4. Batch #2 dubblerar ingen av dem — fyra backlog-idéer
var redan täckta och briefades inte igen (se `backlog.md`).

**Lediga AD-ID:n lästes ur** OPS-kontot (PD/GT/CS/SP 1–3) **och** hubben (PD t.o.m.
7, CS 4, övriga koder 1–3). Nya koder: SO (socker), MR (morgonrutin), SY (syskon),
FF (farmor/farfar), EF (efter jul). Prefix `AdventLaneRacing_` (produktfilen).

**Copy A/B (Axels beslut 2026-09-10):** varannan brief `copy_model: fable`, varannan
`sonnet`, i briefordning 1–7 ⇒ fable 4, sonnet 3. Väg: Agent-verktyget (fanns i
sessionen) med `model: "fable"` resp. `"sonnet"`, `tools/copy-agent.mjs` behövdes inte.

| # | Annons | Typ | Koncept / hypotes | Isolerad variabel | Källa | copy_model |
|---|---|---|---|---|---|---|
| 1 | `AdventLaneRacing_PD_2_H2` | video | Hook-byte på ärvda vinnaren PD_2_H1: första 3 s = tomt chokladomslag i pappersåtervinningen, resten av filmen orörd | hook | winning line `Adventskalender_PD_2_H1` (898 kr, 6 köp, ROAS 3,85) + `creative-strategy.md` §3 | fable |
| 2 | `AdventLaneRacing_MR_1_H1` | video | Morgonrutinen: köksbordet kl 07 den 1 december, en lucka, en bil bredvid gårdagens | scen/hook-typ (rutin i stället för produkt) | `BRAND.md` kärnscen + 3/10 recensioner nämner morgonen — **gissning** | sonnet |
| 3 | `AdventLaneRacing_SO_1_1` | bild | Sockeromramningen av chokladkonflikten: 24 morgnar utan choklad före frukost (tidsramen bytt) | hook-typ (tidsram) inom bevisad vinkel; format bild | winning line PD (2 322 kr, 14 köp) + Sara "ett bra alternativ till godis" | fable |
| 4 | `AdventLaneRacing_SY_1_H1` | video | Syskonbråket: två barn, en lucka → 2-pack som lösning, aldrig som rabatt | vinkel (pain: turordning) + paket utan pris | källkontots verkliga AOV 632 kr > 499 kr (paketen säljer) | sonnet |
| 5 | `AdventLaneRacing_PD_8_H1` | video | Könsneutral re-voice av PD_2_H1: samma klipp, inget "honom" | målgruppslåsning i orden | winning line `PD_2_H1` + `BRAND.md` (brandet får inte låsas vid pojkar) | fable |
| 6 | `AdventLaneRacing_FF_1_1` | bild | Från farmor och farfar: givaren i orden, oöppnad presentkartong bredvid kaffekopp | givare (GT-vinkeln riktad om) | `Adventskalender_GT_1_H1` (594 kr, 2 köp, hook 32 %) under grinden — **gissning** | sonnet |
| 7 | `AdventLaneRacing_EF_1_1` | bild | Den 25 december: chokladkalendern platt i återvinningen, 24 bilar på golvet i lek | hook-typ (tidsram efter jul) + split-visuell | winning line PD ("kvar den 24:e", 14 köp) + Sofia "Bilarna blev snabbt favoriter." | fable |

Hypoteser i klartext:
1. **H1 (PD_2_H2):** ett fysiskt, "äckligt" föremål i sekund 0 (tomt omslag) lyfter
   hook rate över PD_2_H1:s 28,7 % utan att sänka CVR. Mäts mot PD_2_H1 rakt av.
2. **H2 (MR_1_H1):** scen före produkt håller kvar längre (hold > 28 %) — gissning.
3. **H3 (SO_1_1):** "24 morgnar" slår "10 sekunder" som siffra i en bild. Mäts mot PD_2_1.
4. **H4 (SY_1_H1):** konflikt-motiverat paket ger högre AOV än 632 kr utan att CPA stiger.
5. **H5 (PD_8_H1):** neutral form tappar inte CVR mot PD_2_H1 (4,92 %). Om lika: bredare.
6. **H6 (FF_1_1):** givarvinkeln konverterar bättre än GT:s CPA 297 kr — gissning.
7. **H7 (EF_1_1):** "efter jul" är ett starkare skäl än "den 24:e" — hypotes.

Alla sju döms nästa briefdag (ons 2026-09-16 enligt kadens) enbart om de passerat
grinden (≥ 300 kr OCH ≥ 3 köp). Kill mot BE-CPA 323 kr / BE-ROAS 1,54.
