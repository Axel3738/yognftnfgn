# Creative DNA — Kranskydd Frost 420D

Skapad 2026-08-29 av `/forsta-batch` (körning nr 1, automatisk rutinkörning).
Datakälla: MagiBorsten `1867947880635861`, kampanj `120249975043720291`
("Kranskydd Frost 420D | BE ROAS 1.49 | Launch 2026-08-21"), livstid
2026-08-21 → 2026-08-29 (hämtat `date_preset: maximum`).

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

## Datakvalitet
`amount_spent × purchase_roas` stämmer mot `omni_purchase_values` på alla
5 annonser med köp (exakt match, inget 100×-fel här). Kampanjsumman
(3 091,20 kr, 11 köp) matchar summan av alla 18 annonsrader exakt.
Shopify-korskoll: 10 ordrar på SKU `TEMU-601101411598143` sedan 2026-08-26,
snitt 475 kr/order — konsekvent med Metas 485 kr. Litet glapp (10 vs. 11 köp)
är normal attributionsskillnad, inget datafel.

## Siffrorna (bedömbara annonser, ≥300 kr + ≥3 köp; BE-ROAS 1,49)

| Annons | Format | Vinkel | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag*** |
|---|---|---|---|---|---|---|---|---|
| **Kranskydd_SP_1_H3** (benchmark/top spender) | video | social proof/testimonial | 1 730 kr | 56 % | **7** | 247 kr | **2,03** | **+629 kr** |

*Vinstbidrag = intäkt/1,49 − spend (ROAS-baserad, AOV-oberoende — se
ANALYSMETOD steg 4). Kampanjens totala vinstbidrag är **+487 kr**; SP_1_H3
ensam bidrar med 629 kr (129 % av totalen) — den bär hela kontot och täcker
upp för förlusterna nedan.

**För tidigt (ingen dom, redovisas ändå för mönstret i steg 6b):**

| Annons | Format | Vinkel | Spend | Köp | ROAS | Vinstbidrag | Kommentar |
|---|---|---|---|---|---|---|---|
| Kranskydd_PD_1_H3 | video | demo/problem | 594 kr | 1 | 0,77 | −287 kr | Under BE men <3 köp — kan inte dömas än |
| Kranskydd_PD_1_H2 | video | demo/problem | 558 kr | 1 | 0,94 | −206 kr | Samma copy som H3, samma mönster |
| Kranskydd_PD_2_1 | statisk | demo/problem | 67 kr | 1 | 7,88 | +286 kr | Regressionskandidat — 1 köp på låg spend, INTE en bevisad vinnare |
| Kranskydd_CS_1_H3 | video | rea/rabatt | 54 kr | 1 | 5,76 | +154 kr | Samma BLOCKER som nedan gäller ändå |
| Kranskydd_PD_1_H1, PD_Extra ×2, SP_1_H1/H2, SP_2_1, CS_1_H1/H2, CS_2_1, GT ×4 | – | – | 0–16 kr vardera | 0 | – | – | CBO-svält, aldrig fått en chans |

## Winning DNA
1. **Social proof/testimonial-formatet (SP) är produktens bevisade angle.**
   ⭐⭐⭐⭐⭐-öppning + namngiven kundröst ("Villaägare litar på det här
   skyddet") + tre ✅-punkter + 30 dagars öppet köp + SHOP_NOW. 7 köp, CPA
   247 kr, tar 56 % av spenden och bär hela kampanjens vinst. **Preliminär men
   solid** (7 köp är över steg 2c:s 3–4-köpsgräns) — enda ad, så fortfarande
   inte "bevisad" i strikt mening (kräver ≥2 annonser ≥3 köp vardera).
2. **Produkten visas monterad på en riktig utekran i sitt naturliga
   sammanhang** (trärad hus, snö, tidig vinter) i både SP:s video och SP_2_1:s
   statiska bild — konsekvent visuell miljö över hela vinnar-vinkeln.
3. **Kort punktlista (✅ × 3) + garanti + SHOP_NOW** är strukturen som
   återkommer i alla fyra vinklar (PD/SP/CS/GT) — inte det som skiljer dem åt.
   Skillnaden ligger i ÖPPNINGEN (citat vs. skräckscenario vs. rabatt vs. gåva).

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
- Recensioner: ej försökt hämtas i denna körning (ingen recensionsplattform
  identifierad för produkten) — lucka, inte ett nekat försök.
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
