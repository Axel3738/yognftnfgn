# Creative DNA – Övervakningskameran (Bäverbutiken)

**Produkt:** Övervakningskamera Trådlös – Dubbellins PTZ med AI-Spårning · 799 kr (jämförpris 1 000 kr, 20,1 %)
**LP:** https://baverbutiken.se/products/overvakningskamera-tradlos-dubbellins-ptz-med-ai-sparning
**Konto:** MagiBorsten `1867947880635861` (SEK) · Kampanj `Övervakningskameran | BE ROAS 1.57 | Launch 2026-08-21` (`120249989799680291`) · Sida `678639638662543`
**Break-even-ROAS (kill):** 1,57 → **break-even-CPA ≈ 509 kr** · **Target-CPA:** ej satt ännu (produkten ligger inte i `products/products.json`, styrs av `agent/produktkarta.json` som testprodukt — fråga Axel innan en target sätts)
**Senast uppdaterad:** 2026-08-31, första körningen (`/forsta-batch` → batch #1 briefad)

---

## ⚠️ Läs detta först

1. **Bara EN annons har passerat signifikansgränsen (300 kr / 3 köp) i hela kontots
   historia för denna produkt:** `Overvakningskamera_SP_2`. Alla domar om vad som
   "fungerar" i denna fil bygger på ett enda bevisat datapunkt (n=9 köp) plus
   nolldata-hypoteser. Ta inget här som slutgiltigt — det är en förstabatch.
2. **Ett faktafel finns i den vinnande annonsens egen copy.** Raden "Tusentals
   nöjda hushåll i Sverige har redan bytt ut sina gamla system" går inte att
   styrka (kampanjen har totalt 10 köp sedan launch). Skriv INTE in den raden
   i fler briefer trots att den sitter i vinnaren — ny copy i batch #1 undviker
   den medvetet och lutar sig på garantin/funktionerna i stället.
3. **Recensionerna i Drive-mappen är seedade, inte organisk kundröst.** 10 rader
   i `Övervakningskamera Trådlös_REVIEW`, alla "Bra kamera" + ett kort generiskt
   citat, skapade av Josh vid produktuppsättningen. Behandla dem inte som VoC.
4. **CBO, inte ABO.** De fyra befintliga adseten (`G`, `CS`, `SP`, `PD`) delar en
   gemensam kampanjbudget. Meta har redan koncentrerat 82 % av spenden till `SP`
   organiskt. Batch #1 launchas i ett **eget test-ABO** (regel 11) för att inte
   drunkna i samma dynamik innan de nya idéerna fått en ärlig chans.

## Winning DNA (bevisad — n=9 köp, `SP_2`)

- **Hook:** citat i jag-form ("Jag sover bättre nu.") — konkret känsloeffekt,
  inte en produktegenskap.
- **Struktur:** citat → "Det är vad våra kunder säger" → 4 konkreta funktions-
  bullets (ingen adjektiv) → garanti → mjuk CTA ("Läs varför... – handla nu").
- **Fakta som används:** dubbellins/355°, AI skiljer människa från katt, direkt
  mobilnotis, 30 dagars nöjd-kund-garanti.
- **Hook rate:** 95,7 % (24 776 videostarter) — men detta är INTE unikt för SP;
  se nedan.
- **Hold vid 50 %:** 14,8 %.
- **CPA:** 324 kr mot break-even 509 kr → **vinstbidrag 1 661 kr** (all vinst i
  kampanjen kommer i praktiken från denna enda annons).

## Viktig nyans: hooken är INTE det som särskiljer vinnaren

Alla fyra koncept (G, CS, SP, PD) har hook rate 90–98 % — i princip identiskt.
Skillnaden ligger nedströms (hold/klick/konvertering), inte i första bilden.
**Skriv inte nästa briefer för att "förbättra hooken"** — det är redan löst.
Fokusera i stället på mitten av manuset och erbjudandets trovärdighet.

## Losing DNA

Inget bevisat än. `G` (Gift) och `PD` (Product Demo) svalts nästan omedelbart
av CBO (21,61 kr respektive 195,59 kr total adset-spend på 10 dagar, 0 köp) —
det är en algoritmsignal, inte en dömd förlorare (för lite spend för att döma).
`CS` (rabatt) fick 467 kr och 1 köp — för tidigt, men den enda mjuka signalen
som finns pekar mot att generisk rabatt-urgency ("snart slut") konverterar
sämre än trygghets-/social proof-vinkeln på just denna produkt.

## Behåll alltid

- Citatformat som hook (jag-form, specifikt, falsifierbart)
- Konkreta funktionsbullets utan adjektiv
- 30 dagars-garantin synlig i varje annons
- Verkligt pris: 799 kr / jämförpris 1 000 kr — verifiera mot Shopify vid varje
  ny batch, ändras priset ska ALLA pågående annonser med gammalt pris flaggas

## Testa kontrollerat (batch #1, se `batch-log.md`)

- SP-formatöverföring (UGC vs. producerad broll)
- SP med kollektiv proof i stället för individuell
- Nya mekanismer: risk/kostnad-av-att-inte-agera, jämförelse (gammal vs. ny
  kamera), auktoritet/teknisk expertis, listicle

## Undvik

- Ogrundade volympåståenden ("tusentals kunder") utan täckning i datan
- Fabricerade brottsstatistik/rädsla-siffror i risk-vinkeln — vi har inte en
  verifierad svensk källa, så risk-briefen håller sig till verifierbara fakta
  (priset, funktionerna) i stället för påhittade "1 av X hem"-siffror

## Obevisat

Allt utom SP-mekanismen. Nästa `/cs`-runda (efter att batch #1 fått data) ska
bygga en riktig variabeltabell (ANALYSMETOD steg 6b) med minst 2 bedömbara
annonser per variabelvärde innan något skrivs in som "bevisad" här.

## Öppna luckor att täcka i nästa körning

- Shopify MCP-kopplingen krävde omauktorisering 2026-08-31 — kunde inte
  korsvalidera Meta-spend mot verklig Shopify-försäljning. Gör det nästa gång.
- Ingen swipe för säkerhetskameror i `docs/swipes/` — Meta Ad Library söktes
  inte av i denna körning (tidsprioriterat bort till förmån för briefer på
  kontots egen data). Gör en riktig konkurrentgenomgång nästa `/cs`.
- Ingen `target_cpa_sek` satt för produkten — den ligger utanför
  `products/products.json` (rond-produkt). Fråga Axel om den ska läggas till
  när/om produkten går mot skalning.
