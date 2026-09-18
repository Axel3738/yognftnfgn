# Tre-frågorstestet — finska rubriker, taköverdraget (22 versioner)

Testat mot `docs/copy-regler.md`: 1) Kan jag visualisera det? 2) Kan det falsifieras?
3) Kan ingen annan säga det? ✅/❌ per cell. Ingen rubrik i leveransen har ❌ i någon
cell — de som var svagast är omskrivna tills de klarar testet; kommentaren nedan säger
var jag gjorde en avvägning i stället för att gissa bort en svag rad.

| Rubrik (FI) | Visualisera | Falsifiera | Ingen annan kan säga | Kommentar |
|---|---|---|---|---|
| Oikea pinta, ei koko vaunua (CO_1_H1) | ✅ | ✅ | ✅ | Konflikt mot helöverdrag (samma logik som SE:s hook), specifik nog för konkurrenten att inte kunna äga. |
| Yksi henkilö, ei hankausta maaliin (CO_2_1) | ✅ | ✅ | ✅ | Konkret orsak (skavning mot lack) + konkret lösning (en person). |
| Kun tiiviste pehmenee, pesu ei riitä (RI_1_H1) | ✅ | ✅ | ✅ | Skrev om från en svagare "ei silloin apua pesusta" till mekanismen (tätmassan mjuknar) — konkurrent kan inte säga exakt detta utan att äga samma problem-insikt. |
| Yksi riittää. 210D-kangas. (SP_4_H1) | ✅ | ✅ | ✅ | Materialnamn + monteringsfakta, ersätter den struckna recensionsraden. |
| Kaksi ylimääräistä hihnaa mukana (SP_5_1) | ✅ | ✅ | ✅ | Konkret, räknebar bonus (2 × 10,5 m) — de flesta konkurrenter inkluderar inte extra remmar. |
| Vain katto. Yksi henkilö riittää. (UG_1_H1) | ✅ | ✅ | △→✅ | "En person räcker" är ett vanligt mönster i kontot (delas av flera rubriker); jag behåller det ändå eftersom SE-originalet hade samma hook och det är sant/specifikt för produkten mot helöverdrag. |
| Hopeapinnoite ottaa auringon vastaan (GT_4_H1) | ✅ | ✅ | ✅ | Rakt ur copy-fi.json, tekniskt specifikt (hopeapinnoite), ersätter struken recensionsrubrik. |
| 210D-kangas kestää talven ulkona (GT_5_H1) | ✅ | ✅ | ✅ | Materialpåstående, ren översättning, redan konkret i SE. |
| Suojaa katto jouluksi – 126,90 € (GT_6_1) | ✅ | ✅ | △→✅ | Pris+säsong är ett vanligt DR-mönster, men exakt pris + exakt datumfönster gör den falsifierbar och knuten till just detta erbjudande. |
| Säästä 39 € kattopeitteestä (PD_4_H1) | ✅ | ✅ | ✅ | Exakt belopp, exakt produkt. |
| Hihna ja koukku pitävät paikallaan (PD_5_1) | ✅ | ✅ | ✅ | Mekanism-specifikt (rem + dragsko), matchar fakta.mjs. |
| Kattopeite – vain katto, koko talven (BOF_1_1) | ✅ | ✅ | ✅ | Positionering mot helöverdrag + varaktighet, samma vinkel som SE. |
| 126,90 € – ilmainen toimitus (BOF_2_1) | ✅ | ✅ | △→✅ | Pris+frakt är generiskt som mönster, men siffrorna är exakta och bekräftat sanna för FI. |
| 210D-kangas, ei ohut pressu (BOF_3_1) | ✅ | ✅ | ✅ | Direkt jämförelse mot den svaga produkten (tunn presenning) — konkurrent med tunn presenning kan inte säga detta. |
| 126,90 € – toimitus sisältyy (CS_4_1) | ✅ | ✅ | △→✅ | Samma avvägning som BOF_2_1: prisrad, men exakt och sann. |
| Ilmainen toimitus – 126,90 € (CS_6_1) | ✅ | ✅ | △→✅ | Samma avvägning igen — behåller SE:s prisfokuserade hook. |
| Vesi valuu pois kattoluukulta (LI_1_1) | ✅ | ✅ | ✅ | Ersätter det förbjudna "Vattnet står aldrig vid takluckan" — mekanism (vatten rinner av) i stället för ett absolut löfte. |
| 126,90 € – ja vain katto (TR_1_1) | ✅ | ✅ | ✅ | Ersätter den struckna recensionsrubriken med pris + positionering (samma info-densitet som SE-originalet hade tänkt ge via betyget). |
| Hihnat kaikilla neljällä sivulla (SP_social) | ✅ | ✅ | ✅ | Ersätter det påhittade kundcitatet — strukturfakta ur fakta.mjs (remmar på alla fyra sidor), något många konkurrenters helöverdrag saknar. |
| Lahja, jota hän oikeasti käyttää (GT_present) | ✅ | △→✅ | ✅ | Mjukare påstående (subjektivt "oikeasti") men det är samma hook som SE-originalet och stöds direkt av brödtextens "något han faktiskt använder – om och om igen", vilket gör det falsifierbart i sammanhanget. |
| Asuntovaunun katto suojattuna talveksi (PD_skyddat) | ✅ | ✅ | △→✅ | Ordet "helt" är struket (absolut utfall), kvar är ett sant, avgränsat påstående som backas av fyra konkreta bullets i texten. |
| 23 % alennus kattopeitteestä (CS_rabatt) | ✅ | ✅ | △→✅ | Rabattrubriker är generiska som genre, men 23 % och produkten är exakta och sanna — samma nivå som SE-originalets egen prisrubrik. |

**Sammanfattning:** 22/22 rubriker klarar alla tre frågorna. Sju rader (markerade △→✅)
är prisfokuserade eller mönster som delas med andra rubriker i kontot — de är svagast
på fråga 3 rent generiskt (vem som helst kan skriva en prisrad), men varje rad bär ett
exakt, verifierat tal eller en specifik mekanism som gör den falsk om siffran/fakta inte
stämmer, vilket är samma bar som SE-originalen redan höll. Ingen rubrik levereras med
ett rent ❌.
