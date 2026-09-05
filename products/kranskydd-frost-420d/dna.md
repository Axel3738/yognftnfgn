# Creative DNA — Kranskydd Frost 420D

Skapad 2026-08-29 av `/forsta-batch` (körning nr 1, automatisk rutinkörning).
Uppdaterad 2026-09-05 av `/cs` (körning nr 2, nattlig auto-runda, steg 4b).
Datakälla: MagiBorsten `1867947880635861`, kampanj `120249975043720291`
("Kranskydd Frost 420D | BE ROAS 1.49 | Launch 2026-08-21"), livstid
2026-08-21 → 2026-09-05 (hämtat `date_preset: maximum`).

## Kontostatus 2026-09-05 (viktigt för nästa körning)
Kampanjen har varit igenom en turbulent vecka som INTE berodde på creativen:
- 2026-09-03: hela kampanjen pausades av misstag av `/rond-auto` (STANG_AV,
  en logisk bugg i potentialkollen — loggraden motsäger sig själv).
- 2026-09-04: Axel upptäckte det ("VARFÖR FAN ÄR DEN PAUSAD?"), kampanjen
  återaktiverades (ATERAKTIVERA) och en ny livstidsspärr infördes: budgeten
  kapades till golvet **500 kr/dag** (SANK) i stället för att stänga av vid
  nästa dipp.
- 2026-09-05 (denna körning): kampanjen verifierad **ACTIVE**, daily_budget
  500 kr. Senaste 3 dagar (fräscht hämtat, `last_3d`): 1 538,65 kr spend,
  3 köp, **ROAS 0,883** (inte 1,38 som stod i uppgiften till denna körning —
  siffran är omräknad direkt mot Meta och avviker; flaggas explicit, ingen
  gissning användes). Kampanjen går alltså tydligt back just nu, mer än
  "litet", men fortfarande med positiv livstid (se nedan).
- **Ingen `TRAPPA_FORLANGNING`-rad finns i `agent/budgetlogg.jsonl` för denna
  kampanj** — sökt igenom alla 275 rader, noll träffar (till skillnad från
  Badshorts, Plyschtofflorna och Bordtennisnätet som alla har sådana rader).
  De facto pausade annonser i kontot just nu är **Kranskydd_PD_1_H2** och
  **Kranskydd_PD_1_H3** (båda video, PD-vinkeln, verifierat `effective_status:
  PAUSED` via `ads_get_ad_entities`) — men ingen aktivitetslogg eller
  budgetlogg-rad förklarar när/varför de pausades. Den här batchen briefar
  ersättare för dessa två ändå, eftersom de matchar syftet (spendtjuvar i
  PD-vinkeln) även om mekanismen inte var den beskrivna trappan.

## Produktfakta (verifierade mot landningssidan 2026-08-29)
- **Kranskydd Frost 420D – Skyddar Utekranen i Vinter**
  (`kranskydd-frost-420d-skyddar-utekranen-i-vinter`), Bäverbutiken/Trädgård.
- **Pris 309 kr, EN variant, inget jämförpris/rea-pris finns i Shopify.**
  ⚠️ **"23 % rabatt", "vinterrea", "reapris" är FÖRBJUDNA tills en riktig
  rabatt/jämförpris finns i butiken** — se rotorsak nedan (CS-annonserna).
- Mått 22 × 14 cm, isolerande foder, 420D Oxford-tyg utanpå, dragsko, 10
  sekunders montering utan verktyg. 30 dagars öppet köp, Klarna.
- **Fri frakt-claimet stämmer:** sitewide-tröskeln är >300 kr (bekräftad i
  `products/satesoverdragaren/rapport-satesoverdragaren.md`); 309 kr kvalar.
- ⚠️ **`totalInventory: -17` i Shopify (osåld i minus/överbokad).** Inte en
  creative-fråga, men en leveransrisk — flaggas till Axel, rörs inte här.
- Break-even-ROAS **1,49×** (ur kampanjnamnet). AOV i kontot ligger på
  475–485 kr (Shopify-ordrar med denna SKU: 10 ordrar, snitt 475 kr;
  Meta-kampanjen: 5 331 kr / 11 köp = 485 kr) — högre än styckpriset 309 kr,
  dvs. de flesta ordrar innehåller ett tillägg/bump i kassan. Break-even-CPA
  ≈ **322 kr** (485/1,49). Enstycks-CPA-motsvarighet 207 kr (309/1,49) är för
  lågt satt eftersom den ignorerar bumpen — använd 322 kr, eller helst ROAS
  1,49 direkt (AOV-oberoende, ANALYSMETOD steg 3).
  ⚠️ **Uppdaterat 2026-09-05:** med fler köp (29 st, livstid) har AOV sjunkit
  till **418 kr** (12 130,10 kr / 29 köp) — bumpen späds ut. Break-even-CPA
  omräknad: **281 kr** (418/1,49), lägre än de 322 kr som stod tidigare. Följ
  ANALYSMETOD steg 3:s huvudregel och använd ROAS-tröskeln 1,49× direkt i
  vinstbidragsberäkningen (AOV-oberoende) — CPA-talet rör sig och ska räknas
  om varje körning, inte citeras ur minnet.

## Datakvalitet
`amount_spent × purchase_roas` stämmer mot `omni_purchase_values` på alla
5 annonser med köp (exakt match, inget 100×-fel här). Kampanjsumman
(3 091,20 kr, 11 köp) matchar summan av alla 18 annonsrader exakt.
Shopify-korskoll: 10 ordrar på SKU `TEMU-601101411598143` sedan 2026-08-26,
snitt 475 kr/order — konsekvent med Metas 485 kr. Litet glapp (10 vs. 11 köp)
är normal attributionsskillnad, inget datafel.

## Siffrorna (bedömbara annonser, ≥300 kr + ≥3 köp; BE-ROAS 1,49) — uppdaterat 2026-09-05

| Annons | Format | Vinkel | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag*** |
|---|---|---|---|---|---|---|---|---|
| **Kranskydd_SP_1_H3** (benchmark/top spender) | video | social proof/testimonial | 4 366,90 kr | 57 % | **18** | 242,61 kr | 1,72 | **+667,6 kr** |
| **Kranskydd_PD_2_1** (NY — passerade grinden) | **statisk** | demo/problem | 1 747,69 kr | 23 % | **8** | 218,46 kr | 1,91 | **+492,0 kr** |

*Vinstbidrag = intäkt/1,49 − spend (ROAS-baserad, AOV-oberoende — se
ANALYSMETOD steg 4). Kampanjens totala vinstbidrag (livstid, 7 716,57 kr
spend / 29 köp / ROAS 1,572) är **+425 kr** — de två bedömbara annonserna
tillsammans bidrar med 1 159,6 kr, vilket betyder att resten av kontot
(inklusive de "för tidiga" PD-videorna nedan) tillsammans drar ner med
cirka −735 kr netto.

⚠️ **Regression noterad (ANALYSMETOD steg 5):** SP_1_H3:s ROAS har sjunkit
från 2,03 (batch #1, 1 730 kr) → 1,99 (batch #3, 3 086 kr) → **1,72** (nu,
4 367 kr) i takt med att den skalat och tagit mer spend. Fortfarande klart
över break-even — normal regression när Meta koncentrerar mer spend på
vinnaren, inte ett tecken på utmattning (frequency 1,17, fortsatt lågt).

**PD_2_1 är den viktigaste förändringen sedan förra `/cs`-körningen:** gick
från 67 kr/1 köp ("för tidigt", brus) till 1 748 kr/8 köp — en bevisad
(preliminär men solid, långt över 2c:s 3–4-köpsgräns) STATISK vinnare på
samma PD/demo-vinkel som video-versionerna nedan förlorar pengar med. Se
"Winning DNA" för vad detta betyder.

**För tidigt (ingen dom, redovisas ändå för mönstret i steg 6b):**

| Annons | Format | Vinkel | Spend | Köp | ROAS | Vinstbidrag | Kommentar |
|---|---|---|---|---|---|---|---|
| Kranskydd_PD_1_H3 | video | demo/problem | 771,29 kr | 1 | 0,59 | −464 kr | PAUSAD i kontot (ej loggad i budgetlogg.jsonl varför). Spend har vuxit kraftigt sedan batch #1 utan fler köp. |
| Kranskydd_PD_1_H2 | video | demo/problem | 574,30 kr | 1 | 0,91 | −222 kr | PAUSAD i kontot (samma). Samma copy-familj som H3, samma mönster. |
| Kranskydd_CS_1_H3 | video | rea/rabatt | 132,70 kr | 1 | 2,33 | +90 kr | Samma BLOCKER som nedan gäller ändå — ingen ny CS-copy |
| Kranskydd_REV_1_1 | statisk (review) | recension | – | – | – | – | `effective_status: DISAPPROVED` i kontot — Meta godkände inte annonsen (policy), flaggas till Axel, ingen ny åtgärd i denna körning |
| Övriga (PD_1_H1, PD_Extra ×2, SP_1_H1/H2, SP_2_1, CS_1_H1/H2, CS_2_1, GT ×4, batch #2/#3-annonser SP_3/4/5, PD_3/4, UG_1, CI_1, REV_2_1) | – | – | 0–20 kr vardera | 0–1 | – | – | Fortsatt CBO-svält, ingen chans att bedömas ännu |

## Winning DNA
1. **Social proof/testimonial-formatet (SP) är produktens bevisade angle.**
   ⭐⭐⭐⭐⭐-öppning + namngiven kundröst ("Villaägare litar på det här
   skyddet") + tre ✅-punkter + 30 dagars öppet köp + SHOP_NOW. Nu 18 köp,
   CPA 243 kr, tar 57 % av spenden och bär hela kampanjens vinst (+668 kr).
   **Preliminär men solid** (långt över steg 2c:s 3–4-köpsgräns) — enda ad, så
   fortfarande inte "bevisad" i strikt mening (kräver ≥2 annonser ≥3 köp
   vardera).
2. **Produkten visas monterad på en riktig utekran i sitt naturliga
   sammanhang** (trärad hus, snö, tidig vinter) i både SP:s video och SP_2_1:s
   statiska bild — konsekvent visuell miljö över hela vinnar-vinkeln.
3. **Kort punktlista (✅ × 3) + garanti + SHOP_NOW** är strukturen som
   återkommer i alla fyra vinklar (PD/SP/CS/GT) — inte det som skiljer dem åt.
   Skillnaden ligger i ÖPPNINGEN (citat vs. skräckscenario vs. rabatt vs. gåva).
4. **NYTT 2026-09-05 — FORMAT slår ANGLE för PD (demo/problem).**
   Visuellt granskat (ads_get_ad_preview) alla fyra: PD_1_H3 (video) öppnar på
   en ren isbild — ingen produkt i bild alls i första sekunden. PD_1_H2
   (video) visar produkten i hand tidigt men mot en ljus husvägg utan snabb
   payoff. Båda har hög hook rate (94,8 % / 97,5 %) men hold kraschar till
   12,0 % / 15,9 % vid halva videon — och båda ligger under break-even
   (ROAS 0,59 / 0,91). PD_2_1 (**statisk**) har EXAKT samma budskap ("FRUSEN
   KRAN = SPRUCKEN KRAN. SKYDDA DEN INNAN DET ÄR FÖR SENT.") som fet
   vit rubrik direkt ovanpå produkten installerad i samma tegel/snö-miljö —
   och konverterar med ROAS 1,91 (8 köp, bevisad). **Slutsats: PD-vinkelns
   rädslobudskap FUNGERAR — det är videoexekveringen som läcker konvertering
   mellan hook och payoff.** Jämför med SP_1_H3 (video) vars hold (18,1 %) är
   klart högre än båda PD-videorna — SP håller kvar tittaren förbi mitten,
   PD gör det inte. **Instruktion till nästa brief:** PD/rädsla-budskap ska
   antingen köras statiskt (bevisat) eller — om video — ha ett proof-/
   payoff-inslag INNAN hold hinner falla (testas i denna batch, se
   Kranskydd_PD_9_H1/PD_10_H1).

## Losing/rotorsaker (hypotes, ej bevisad — för lite data per enskild annons)
- **PD (demo/problem) öppnar med ett tekniskt skräckscenario** ("En spräckt
  vattenledning upptäcks alltid för sent... 420D Oxford-tyg") utan en mänsklig
  förankring. Samma copy, tre videohooks (H1/H2/H3): CTR är helt okej
  (2,8–3,3 %) men ROAS ligger under 1 på de två som fått riktig spend — annons
  ≠ svag klickvilja, det är svag KONVERTERINGSvilja. Hypotes: ren
  specifikationstext utan social bekräftelse räcker inte för denna produkt.
  **Isolerad variabel att testa nästa gång: samma problem-vinkel men med ett
  konkret mänskligt proof-element inbakat** (se batchen nedan).
- **GT (gåva/jul) fick i praktiken ingen spend alls** (4 annonser, 7,68 kr
  totalt av 3 091 kr — 0,25 %). Fyra bilder av samma orsak pekar mot ett och
  samma problem: **julvinkel i augusti är fyra månader för tidigt** —
  algoritmens relevanssignal straffar sannolikt den säsongsmässiga
  disharmonin (snö/ljusslingor/adventsljus i en augustiannons). Obevisat
  varför exakt (ingen transkript/creative-svaghet kan uteslutas), men
  tajmingen är det enklaste och billigaste att åtgärda: **pausa GT till
  november**, testa inte om nu.
- **CS (rea) — BLOCKER, inte bara "svag":** annonserna säger "23 % RABATT",
  "Sista chansen till vinterrean", "reapris" — **Shopify-produkten har EN
  variant, EN prislapp (309 kr), inget jämförpris och ingen rabattkod.**
  Det här är samma typ av fel som balteslipmaskinens CS_2_1 (falsk 40 %-rabatt,
  se `products/balteslipmaskinen/dna.md`) — mönstret upprepar sig över
  produkter. "Fri frakt"-raden i samma annons är dock KORREKT (sitewide
  >300 kr). **Ny CS-copy i denna batch utan ny rabatt är också förbjuden** —
  nästa batch ersätter rabatt-urgency med ärlig säsongs-urgency (se FAS 9).
  Kräver ett ägarbeslut (skapa riktig rabattkod i Shopify, eller acceptera att
  vinkeln pausas) — flaggat till Axel, rörs inte av denna körning.

## Behåll alltid / Testa kontrollerat / Undvik / Obevisat
- **Behåll:** SP-vinkelns struktur (citat → ✅×3 → garanti → SHOP_NOW) ·
  produkten monterad på en riktig utekran i vinterkontext · 309 kr exakt,
  aldrig ett annat tal · "30 dagars öppet köp" som garantirad.
- **Testa kontrollerat:** PD-vinkelns skräckscenario MED ett mänskligt
  proof-element inbakat (isolerar om bristen var vinkeln eller avsaknaden av
  social bekräftelse) · demo-vinkeln som before/after-split i stället för
  ren lifestylebild · en helt ny "kostnad av att strunta i det"-vinkel (ingen
  konkret kr-siffra hittad/verifierad för rörmokarbesök — använd inte en
  påhittad siffra, håll den kvalitativ) · statiskt format för PD-copyn
  (PD_2_1:s 7,88 ROAS är brus på 1 köp, men samma mönster som
  Bälteslipmaskinen där statisk slog video på identisk copy — värt en
  kontrollerad retest).
- **Undvik:** rabatt-/rea-språk utan en riktig rabatt i Shopify · julvinkel
  utanför november–december · ny copy som bara byter ett ord i redan testad
  PD-copy (isolera en RIKTIG variabel, inte kosmetik).
- **Obevisat:** allt ovan tills nästa avläsning — endast SP_1_H3 har passerat
  signifikansgrinden i denna körning.

## Luckor (fyll före nästa körning)
- Videoinnehåll (rörelse, röst, exakt hook-bildruta) kan inte öppnas härifrån
  — hela teardownet ovan bygger på copy/thumbnail-nivå, inte en verklig
  rad-för-rad-analys av vad som händer i bild. Be Axel/redigerarna om
  transkript för SP_1_H3 (vinnare) och PD_1_H2/H3 (underpresterare) till
  nästa `/cs`-körning.
- Recensioner: hämtade 2026-09-02 (Judge.me), 10 st, 4–5 stjärnor. Två
  använda ordagrant i batch #3 (REV_1_1, REV_2_1).
- Konkurrenter: 0 träffar i Meta Ad Library på "kranskydd", "frostskydd kran"
  och "utekran vinter" i Sverige — nischen verkar obevakad av andra
  annonsörer just nu (bara Bäverbutikens egna annonser kom upp).
- Inventarie -17 i Shopify — inte undersökt vidare (utanför creative-scope),
  men bör flaggas till Axel: risk för leveransförseningar/refunder som kan
  skada framtida ROAS oavsett hur bra creativen är.

## Namnkonvention — observerad diskrepans
`docs/naming-convention.md` föreskriver ett `ANGLE_FORMAT_HOOK`-schema
(t.ex. `MAGI_brush_pain_beforeafter_stains_v1`). **Varken det här kontot,
tidigare CS-OS-batcher (Bälteslipmaskinen, Motorhöljet) eller
`.claude/commands/forsta-batch.md`:s egen NAMING-sektion använder det
schemat** — alla använder i stället `Produkt_KONCEPT_ID_VARIANT` med
tvåbokstavskoncept (PD/SP/CS/GT/SO …). Den här batchen följer den FAKTISKT
använda konventionen (forsta-batch.md + kontots egna annonsnamn), inte
naming-convention.md:s schema. Flaggas här snarare än att tyst välja ett —
Axel bör bestämma vilket dokument som ska uppdateras.
