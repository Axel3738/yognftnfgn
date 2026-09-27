# Lärdomar — Täljsetet 30 Delar

En per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs normalt av `node agent/lardom.mjs --skriv`; varje brief pekar på ett id här (`lardom=L-…`). **De första blocken nedan är preliminära** (skrivna för hand 2026-09-27 på Axels beslut att bygga förstabatchen före dag 7-etiketten) och ersätts av dag 7-lärdomarna 2026-10-01.

### Lärdom L-120250349207730291 — Taljset_PD_3 (PRELIMINÄR, ingen etikett än — dag 4 av 7, skriven 2026-09-27 på Axels beslut "NU")

> ⚠️ **Preliminär lärdom.** Annonsen har ingen etikett (dag 7 = 2026-10-01). Axel beslutade 2026-09-27 att förstabatchen skrivs nu ("1. NU"), och CS-KLART punkt 6 kräver att varje brief pekar på en lärdom. Det här blocket är därför skrivet för hand ur Metas livstidsdata (`agent/hamta-annonser`-uttag 2026-09-27 07:30 UTC, 7d_click), inte av `lardom.mjs --skriv`, och **ersätts av dag 7-lärdomen 2026-10-01** (samma id). Inget här är en dom — allt är hypotes.

| Fält | Värde |
|---|---|
| Batch | 0 (produkttestet, launch 2026-09-24) |
| Utfall | PRELIMINÄR — högst vinstbidrag dygn 1–2, förälder för förstabatchen; över grinden 300 kr / 3 köp men etikett saknas |
| Fönster | 2026-09-24 – 2026-09-27 07:30 UTC (dag 1–4, 7d_click) |
| Spend annons / kampanj | 1,781 kr / 3,857 kr (46 %) |
| Köp | 8 |
| ROAS / CPA | 3.90 / 223 kr — kampanjens ROAS 4.34; break-even-CPA 612 kr (AOV ÷ 1,52) |
| Konverteringsgrad | 1.8 % (8 köp / 434 LPV) — 3,0 % dygn 1–2 |
| Hook rate / hold rate | ej läsbar (Meta ger starter, inte 3-sekundersvisningar) / 18 % (thruplay ÷ visningar) |
| Bedömbar | ja på volym, nej på etikett |

**Koncept:** PD produktdemonstration · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringen 2026-09-24 (briefen ligger i Product test center i Notion, inte i repot)

**Hookar (ordagrant):**
- Primärtext, rad 1 (live 2026-09-27): "Alltid velat prova tälja, men inte vetat vilka verktyg du behöver? 🪵" · rubrik: "Börja tälja redan i helgen"
- Första frame (thumbnail, läst 2026-09-26): en hand håller upp ett litet järn med trähandtag över en grön skärmatta, en större kniv med kopparholk ligger under — verktyget i handen, inget paket
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

**Hypotes (gissning):** Samma primärtext som PD_1 och PD_2; videon är variabeln. PD_3:s första bild är verktyget i handen (thumbnail) och den konverterade 3,0 % av LPV de två första dygnen mot PD_1:s 1,3 % — dag fyra är båda på 1,8 %, så skillnaden kan vara brus. Hypotes: verktyget i arbete säljer, paketet lockar klick. Prövas av PD_1_H4 (snittet först) mot PD_1:s unboxing.

**Nästa (namngivna platser — förstabatchen, Axels beslut 2026-09-27):**
- `Taljset_PD_1_H4` (typ I, iteration 1 på PD_3): ny hook — första snittet i övningsbiten, handsken på; resten som föräldern
- `Taljset_PD_1_H5` (typ I, iteration 2): längre problemdel — kökslådan (sidans 'letar efter rätt kniv i lådan') före väskan
- `Taljset_PD_1_H6` (typ I, iteration 3): in media res — den snittade övningsbiten först
- `Taljset_SO_1_H1`, `Taljset_OB_1_H1`, `Taljset_GT_4_H1`, `Taljset_PD_4_H1`, `Taljset_PD_5_H1`, `Taljset_SP_4_H1` (typ N, kalla=backlog): sex nya videokoncept ur backlog.md — gissningar tills egen etikett
- `Taljset_PD_4_1`, `Taljset_SO_1_1`, `Taljset_LI_1_1`, `Taljset_CS_4_1`, `Taljset_OB_1_1`, `Taljset_GT_4_1` (typ N, statiska): demo, jämförelse, listicle, pris utan brådska, risk, present — jobbet är att validera formatet
- `Taljset_BOF_1_1`, `Taljset_BOF_2_1`, `Taljset_OB_2_1`: pris, ångerrätt, nybörjarinvändningen — bara retargeting
- Ingen review-bild: sidans 8 recensioner är importrader (dna.md)

### Lärdom L-120250349195630291 — Taljset_PD_1 (PRELIMINÄR, ingen etikett än — dag 4 av 7, skriven 2026-09-27 på Axels beslut "NU")

> ⚠️ **Preliminär lärdom.** Annonsen har ingen etikett (dag 7 = 2026-10-01). Axel beslutade 2026-09-27 att förstabatchen skrivs nu ("1. NU"), och CS-KLART punkt 6 kräver att varje brief pekar på en lärdom. Det här blocket är därför skrivet för hand ur Metas livstidsdata (`agent/hamta-annonser`-uttag 2026-09-27 07:30 UTC, 7d_click), inte av `lardom.mjs --skriv`, och **ersätts av dag 7-lärdomen 2026-10-01** (samma id). Inget här är en dom — allt är hypotes.

| Fält | Värde |
|---|---|
| Batch | 0 (produkttestet, launch 2026-09-24) |
| Utfall | PRELIMINÄR — top spender = benchmark; över grinden 300 kr / 3 köp men etikett saknas |
| Fönster | 2026-09-24 – 2026-09-27 07:30 UTC (dag 1–4, 7d_click) |
| Spend annons / kampanj | 1,850 kr / 3,857 kr (48 %) |
| Köp | 8 |
| ROAS / CPA | 4.35 / 231 kr — kampanjens ROAS 4.34; break-even-CPA 612 kr (AOV ÷ 1,52) |
| Konverteringsgrad | 1.8 % (8 köp / 440 LPV) — 1,3 % dygn 1–2 |
| Hook rate / hold rate | ej läsbar (Meta ger starter, inte 3-sekundersvisningar) / 17 % (thruplay ÷ visningar) |
| Bedömbar | ja på volym, nej på etikett |

**Koncept:** PD produktdemonstration · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringen 2026-09-24 (briefen ligger i Product test center i Notion, inte i repot)

**Hookar (ordagrant):**
- Primärtext, rad 1 (live 2026-09-27): "Alltid velat prova tälja, men inte vetat vilka verktyg du behöver? 🪵" · rubrik: "Börja tälja redan i helgen"
- Första frame (thumbnail, läst 2026-09-26): två händer öppnar en kraftpappskartong, den svarta väskan med orange kantsöm skymtar under, verkstadsbord med träverktyg i bakgrunden — unboxing
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

**Hypotes (gissning):** Top spender med unboxingen som första bild. Lika många köp som PD_3 på dag fyra (8/8) men lägre vinstbidrag första två dygnen. Hypotes: kartongen som öppnas vinner auktionen (klick), verktyget i handen (PD_3) vinner köpet. Ingen dom förrän etiketten.

**Nästa (namngivna platser — förstabatchen, Axels beslut 2026-09-27):**
- Ingen egen plats — PD_1 är benchmark (top spender). Iterationerna byggs på PD_3 (högst vinstbidrag första två dygnen, verktyget i handen som första bild). Dag 7-etiketten avgör om PD_1 tar över som förälder.
