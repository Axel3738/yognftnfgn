# Lärdomar — Golf Adventskalendern

En per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs normalt av `node agent/lardom.mjs --skriv`; varje brief pekar på ett id här (`lardom=L-…`). **De första blocken nedan är preliminära** (skrivna för hand 2026-09-27 på Axels beslut att bygga förstabatchen före dag 7-etiketten) och ersätts av dag 7-lärdomarna 2026-10-01.

### Lärdom L-120250349281960291 — Golfkalender_PD_1 (PRELIMINÄR, ingen etikett än — dag 4 av 7, skriven 2026-09-27 på Axels beslut "NU")

> ⚠️ **Preliminär lärdom.** Annonsen har ingen etikett (dag 7 = 2026-10-01). Axel beslutade 2026-09-27 att förstabatchen skrivs nu ("1. NU"), och CS-KLART punkt 6 kräver att varje brief pekar på en lärdom. Det här blocket är därför skrivet för hand ur Metas livstidsdata (`agent/hamta-annonser`-uttag 2026-09-27 07:30 UTC, 7d_click), inte av `lardom.mjs --skriv`, och **ersätts av dag 7-lärdomen 2026-10-01** (samma id). Inget här är en dom — allt är hypotes.

| Fält | Värde |
|---|---|
| Batch | 0 (produkttestet, launch 2026-09-24) |
| Utfall | PRELIMINÄR — top spender och enda bedömbara, förälder för förstabatchen; över grinden 300 kr / 3 köp men etikett saknas |
| Fönster | 2026-09-24 – 2026-09-27 07:30 UTC (dag 1–4, 7d_click) |
| Spend annons / kampanj | 2,969 kr / 3,278 kr (91 %) |
| Köp | 13 |
| ROAS / CPA | 3.05 / 228 kr — kampanjens ROAS 3.05; break-even-CPA 452 kr (AOV ÷ 1,58) |
| Konverteringsgrad | 3.3 % (13 köp / 396 LPV) |
| Hook rate / hold rate | ej läsbar (Meta ger starter, inte 3-sekundersvisningar) / 12 % (thruplay ÷ visningar) |
| Bedömbar | ja på volym, nej på etikett |

**Koncept:** PD produktdemonstration · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringen 2026-09-24 (briefen ligger i Product test center i Notion, inte i repot)

**Hookar (ordagrant):**
- Primärtext, rad 1 (live 2026-09-27): "Glöm chokladkalendern. Det här är för golfaren. ⛳" · rubrik: "24 dagar av golfglädje"
- Första frame (thumbnail, läst 2026-09-26): tät närbild på den gröna kalenderkartongen med numrerade luckor (17, 21, 10, 03, 11, 18, 08, 12, 04), järneksblad i tryck, caption-ruta "pitchgaffel," — videon räknar upp innehållet som captions
- VO/inbränd text i videon: okänd — manuset finns inte i repot och videon är inte transkriberad (ingen ffmpeg i containern)

**Planerat mot utfört** (lanseringsbriefen finns inte i repot — bara den live annonsen går att läsa):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | okänd (PTC-raden) | läst ur copyn: nybörjaren som "alltid velat prova" resp. den som köper till golfaren | okänd |
| Vinkel | PD | PD enligt namnkoden och copyn | ja |
| Medvetandenivå | okänd | problem-medveten (copyn öppnar på längtan/konflikten) | okänd |
| Mekanism | okänd | ur copyn: innehållslistan ("allt i ett" / "24 luckor med …") | okänd |
| Tro | okänd | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | okänd | produkt, inte pris | okänd |
| Brådska | okänd | ingen i copyn | okänd |

**Utförandet föll:** okänd

**Hypotes (gissning):** Enda annonsen med leverans (91 % av spenden); systrarna PD_2 och PD_3 med samma text fick 4 respektive 14 kr. Hypotes: det är videon/öppningen Meta valde — chokladkonflikten ('Glöm chokladkalendern') plus innehållet som captions över luckorna. Hold 12 % och konvertering 3,3 % säger att den som stannar köper; öppningen är det som ska varieras (H4–H6).

**Nästa (namngivna platser — förstabatchen, Axels beslut 2026-09-27):**
- `Golfkalender_PD_1_H4` (typ I, iteration 1): ny hook — lucka 1 öppnas, peggen i handen; resten som föräldern
- `Golfkalender_PD_1_H5` (typ I, iteration 2): längre problemdel — 'golfbagen tömmer sig i det tysta' före kartongen
- `Golfkalender_PD_1_H6` (typ I, iteration 3): in media res — sidofacket fullt först
- `Golfkalender_SO_1_H1`, `Golfkalender_GT_4_H1`, `Golfkalender_PD_4_H1`, `Golfkalender_PD_5_H1`, `Golfkalender_OB_1_H1`, `Golfkalender_SP_4_H1` (typ N, kalla=backlog): sex nya videokoncept ur backlog.md — gissningar tills egen etikett; `RI_1_H1` (datum i copy) väntar på Axels ok
- `Golfkalender_PD_4_1`, `Golfkalender_SO_1_1`, `Golfkalender_LI_1_1`, `Golfkalender_CS_4_1`, `Golfkalender_OB_1_1`, `Golfkalender_GT_4_1` (typ N, statiska): demo, jämförelse, listicle, pris utan brådska, risk, present
- `Golfkalender_BOF_1_1`, `Golfkalender_BOF_2_1`, `Golfkalender_OB_2_1`: pris, ångerrätt, vem-är-den-för — bara retargeting
- Ingen review-bild: sidans 8 recensioner är importrader (created_at 8 minuter före launch, verified_buyer false — dna.md)
