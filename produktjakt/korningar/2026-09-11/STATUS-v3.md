# Produktjakt 2026-09-11 (vecka 37) — V3 valideringskörning (manuell, eftermiddag)

Första körningen av produktfabriken V3 (`V3-FLODE.md`). Morgonens V2-körning (2 produkter, `STATUS.md`) står kvar;
den här körningen levererade **11 produkter** på samma sida (URL oförändrad, version 15) med arket
`Leverantorsoffert-2026-09-11-v3.xlsx`. Filer: `v3/kandidater-A…D.json`, `v3/batch.json`, `fynd-v3.json`, `sida-v3.html`.

## Steg 0 — lärde före sökningen

**0A Axels svar:** 17 totalt (9 ja / 5 kanske / 3 nej), 2 nya i dag: Snöslungehuven **ja**, Hönsgårdstaket **ja**.
Nej-läsning (alla tre): COB-arbetslampa = *kommersiellt* (kedjan har den, för dyr) · navskydd = *svagt koncept* (tråkig, för dyr) ·
ramper = *"ägaren har redan en"* (standardutrustning, SIGNALER.md). Inga kategorier svartlistade — konceptens id bär nejet.

**0B Metas facit** (`facit/FACIT.md`, snapshot `facit/snapshots/2026-09-11.json`): 84 kampanjer → 76 produkter.
**18 REAL WINNER · 21 REAL LOSER · 33 INSUFFICIENT DATA · 4 UNTESTED.** Forskningsprodukterna:

| Koncept | Band | Klass | Spend | Köp | ROAS/BE |
|---|---|---|---:|---:|---|
| Taköverdraget husvagn (K0001) | MEANINGFUL | REAL_WINNER prel. | 2 661 | 15 | 6,36/1,63 |
| Utekattkojan (K0002) | MEANINGFUL | REAL_WINNER prel. | 2 885 | 9 | 2,46/1,62 |
| Adventskalendern racingbilar (K0003) | HIGH | REAL_WINNER prel. | 3 305 | 16 | 3,06/1,62 |
| Staketstolpslagaren (K0046) | TOO_EARLY | INSUFFICIENT (negativ) | 1 052 | 0 | — |
| Stegstödet (K0037) | TOO_EARLY | INSUFFICIENT (negativ) | 961 | 1 | 0,25/1,63 |
| Solcellslarmet (K0226), Termoskyddet husbil (K0227) | UNTESTED | — | 130 / 138 | 0 | — |

Bekräftelse (två snapshots ≥ 3 dygn) kommer tidigast 2026-09-14. Rättelse: Staketstolpslagarens `product_id` i `utfall.json`
pekade på regnvattenuppsamlaren — rättad till stolpbygeln ur fynd-omgang3 09-09 (trolig, märkt).

**0C LEARNING_STATE.md** (nyskriven): starka signaler B_SKYDDA_DYRT 7 V/1 F · objekt ute 15/5 · dyr > 10 tkr 7/2 ·
form överdrag 7/1 · 500–999 kr 7/2 · flerköp 4/0 · material 2 → 4/0; förlorare: objekt inne 3/16 · latent behov 1/14 ·
ingen deadline 6/19 · montering/app 1/5 · form "annat" 0/13. Prediktion vs verklighet: researchen refuterade taköverdraget
(lagerdjup) och hade killat adventskalendern (STOPPORD) — båda REAL WINNERS ⇒ 7 motbevisade antaganden i `hypoteser.json`.
Hypoteser: H01 stärkt (7 vinnare), H06/H08 aktiva med bevis, H07 (verktyg förlorar) väntar på band.

**0D Säsong** (`SASONG.md`): 30 fönster NOW. Styrde sökningen: uppställning husvagn/båt 4,1 v · älgjakt syd 3,9 v ·
första snö norr 6,3 v / mellan 10 v · utedjurens fönster 9,3 v · fars dag 8,3 v · 1 december 10,6 v.

## Steg 1–3 — discovery, fyra linser (subagenter enligt `V3-AGENTPROTOKOLL.md`)

| Lins | Fokus | Kandidater | Fällda (i filen med orsak) |
|---|---|---|---|
| A | B_SKYDDA_DYRT-kusiner, nya objekt | 4 | 13 (robotgarage Jula-form, hjulskydd PE, båt 600D över ankaret, elverk, pizzaugn BE < 300 …) |
| B | djur ute (H09) | 3 | 7 (utekattvärmeplatta — formen finns fortfarande inte, hönsvattenvärmare Lantbutiken 324, kaninburshuv måste mäta …) |
| C | Q4-gåva / hobby (H05) | 2 | 6 (golfkalender Fyndiq 423 samma form, klosskalender under LEGO, jaktkalender ingen listning …) |
| D | nya former (H06/H08/H10) | 3 | 15 (laddboxhuv latent + kinesisk text, hägerskydd 398 samma form, dragkulehuv "alla har" …) |

Alla 12 LIVE_VERIFIED (produktsida öppnad, hero nedladdad och sedd, pris ur sökträff, UTC-stämpel). Golv/ankare med URL per rad.
Mätfynd: biltema.se, jula.se och pricerunner.se svarar 403/tomt via proxyn — två golvpriser står som `null`, aldrig gissade.
Nya ankare skrivna i `objekt.json`: snöskoter 3 790, ATV 3 045 (+ 240 000 ägare — K11 "< 100 000" var fel), släpkärra 2 916,
takluckehuv 380. Backlog: luftvärmepump löst (styv form hittad), robotgarage parkerad (Jula 499 samma form), igelkottshus (BE-CPA 187).

## Steg 4 — rankning (`rank.py`)

12 → 11 klarade grindarna (igelkottshuset BE-CPA 187 < 190). Adventskalender dinosaurier prissattes om av huvudsessionen
399 → 499 (samma pris som racingbilarna, BE-CPA 105 → 205–258) så att H05 testas med temat som enda skillnad — märkt i raden.
Batch **11**: 3 exploitation (under minimum 5 — inte utfyllt), 6 exploration (4 + 2 asymmetriska), 2 säsong.

| # | Koncept | Slot | Arketyp | Pris | Säkerhet | Rank-förklaring |
|---|---|---|---|---:|---|---|
| 1 | Snöskoterkapellet 600D (K0228) | exploit | B_SKYDDA_DYRT | 1 499 | MEDEL | H04-test > 1 000 kr; Ski-Doo 3 790 = 2,5×; första snö norr 6,3 v |
| 2 | Släpkärrekapellet 220×125 (K0229) | exploit | B_SKYDDA_DYRT | 899 | LÅG | Fogelsta 2 916 = 3,2×; måste mäta |
| 3 | Värmepumpsskyddet i aluminium (K0230) | exploit · asym | B_SKYDDA_DYRT | 1 499 | LÅG | styva formen backloggen saknade; Clas 2 499 = 1,67×; volymfrakt risk |
| 4 | Takluckehuven 40×40 2-pack (K0231) | explore | H_VISUELL_NYHET | 499 | MEDEL | ingen kedja har formen; Hindermann 360–380/st; flerköp; uppställning 4,1 v |
| 5 | Gårdshundens plastkoja (K0209) | explore | E_VADER_SASONG | 999 | MEDEL | H09; Kerbl 1 909 = 1,9×; ingen hund i heron |
| 6 | Isfria vattenskålen 2,2 L (K0232) | explore | E_VADER_SASONG | 699 | LÅG | H09 + flerköp; form "annat" (0/13) |
| 7 | Viltsläden dragmatta (K0233) | explore | H_VISUELL_NYHET | 649 | LÅG | H10; syskon till vilthissen (Axel ja); dött djur i heron |
| 8 | ATV-kapellet (K0234) | säsong | B_SKYDDA_DYRT | 899 | MEDEL | älgjakt 3,9 v; Polaris 3 045 = 3,4×; Jula 399/499 golv |
| 9 | Adventskalender dinosaurier (K0126, syskon K0003) | säsong · asym | G_Q4_GAVA | 499 | MEDEL | H05 rent test; NatGeo 495 = 0,99× (ankaret ligger PÅ priset, inte över) |
| 10 | Hjulskydden 4-pack (K0235) | explore · asym | I_FLERKOP | 599 | LÅG | H08; Hindermann 240–289/st; tum-mått mot svenska däck |
| 11 | Motorlåset utombordare (K0236) | explore · asym | B_SKYDDA_DYRT | 599 | LÅG | H06; Watski 709–1 361; collage-hero |

Strukna: igelkottshuset (BE-CPA 187, Vivara 299,90 golv) → backlog v 38.

## Steg 5–8

- `v3_till_fynd.py`: koncept-id per rad; dinosaurierna blev **syskon** till K0003 (samma objekt + form men redan launchat/dömt —
  mäts för sig). Regeln kodad i `v3_till_fynd.py`.
- Ark byggt (11 block, prisfälten tomma). Sida publicerad mot samma URL (version 15) med `downloads` + `db`; korten visar slot,
  timing, säkerhet, frågan, "kan gå för att", "största risken".
- Discord: **ingen `DISCORD_WEBHOOK_URL` i den här sessionens miljö** — rapporten inte skickad. Rutinsessionen har nyckeln.
- Rutinen `trig_01ER8txR7LN7QegEuARvzue6` är oförändrad (06:30, fast session, läser kommandofilen = V3 från i morgon).

## Metodfynd i dag

1. **Uppslag ≠ rank, bekräftat igen:** lins A:s bästa kandidat (snöskoterkapell) hade lägst uppslag i sin lins.
2. **BE-CPA-grinden fäller kalendrar prissatta under ankaret** — för G_Q4_GAVA gäller "pris ÷ N delar mot defaultens styckpris", inte 0,4–0,85× ankaret. Skrivet i raden; bör in i V3-KANDIDATSCHEMA vid nästa körning.
3. **Kedjornas sajter (Jula/Biltema/PriceRunner) svarar 403/tomt i containern** — golv läses ur söksnippets eller andra återförsäljare (duab, campingvaruhuset, zooplus). Skriv källan per pris; gissa aldrig.
4. **Verktyg som Axel launchat själv (Stegstödet, Staketstolpslagaren) ligger negativt vid ~1 000 kr** — H07 får sitt första band om 2–3 dagar.

## Definition of done (kommandofilen V3)

- ✅ 0A svar inlästa (17), varje nej läst med orsakstyp
- ✅ 0B facit hämtat i dag (snapshot finns), utfall.json + koncept.json uppdaterade, 7 nya kampanjer taggade
- ✅ 0C LEARNING_STATE.md skriven och läst; prediktion vs verklighet kommenterad; hypoteser.json med 10 hypoteser + 7 motbevisade
- ✅ 0D SASONG.md; bara NOW-fönster jagade
- ✅ Discovery från ägare → objekt → friktion, 4 linser; utfall 3 exploit / 6 explore / 2 säsong (exploit under minimum — ej utfyllt)
- ✅ 11/11 LIVE_VERIFIED med UTC-stämpel, hero sedd
- ✅ Svenska golvet med URL per rad (två golvpriser null pga 403, märkta)
- ✅ Materialklass per rad
- ✅ Ekonomi som intervall; BE-CPA ≥ 190 på alla 11
- ✅ Batch 11 av 15; ingen utfyllnad
- ✅ Ark + sida publicerad mot samma URL med downloads + db
- ✅ koncept.json bär alla 11 med id, listning, verifiering, leverans
- ✅ LEARNING_STATE-raden, STATUS-v3.md, RUTIN-KVITTO.md; committat och pushat
- ❌ Discord — ingen webhook i sessionen (skrivet ovan)
