# Backlog — CatCabin (utekattkojan)

Koncept som väntar. Ett koncept får aldrig födas ur tomma intet — varje rad
pekar på sin källa: playbook-vinnare, winning line som spenderat pengar bra,
eller konkurrent-signal i `docs/swipes/`.

---

## Väntar på åtgärd (inte koncept — arbete)

| Vad | Varför det ligger här | Källa |
|---|---|---|
| **Norska kampanjen** | Ingen `CATCABIN_NO_…` finns i kontot (avläst 2026-09-12). `/ops-oversatt` har inget mål förrän `/ny-annonser` byggt den. Butiken tar dessutom betalt i SEK på /nb — NOK-paketnivåer krävs i Shopify först. | Meta-kontot 915422744950975, avläst 2026-09-12 |
| **CS-kön: 4 annonser som aldrig byggdes — nu upplåsta av Axels beslut** | `CS_1_H1`, `CS_2_H1`, `CS_3_H1` läser upp "från 1059 ner till 809"; butiken tar 789/1 039. `CS_2_1` har 24 % + "IDAG" + lagerlarm inbränt. **Tidsbegränsningen är numera sann** (`erbjudande.tidsbegransat: true`, Axel 2026-09-12) — det enda som faktiskt är fel är priset. De tre videorna kräver omdubb av prisraden; `CS_2_1` kräver bara att bannerns tal stämmer (24 % stämmer redan mot 789/1 039). Ta upp dem i batch #2. | `batch-log.md` batch #1, `factory/butiker/catcabin.yaml`, `factory/output/utekattkojan/brand-detektor.md` |
| **Inköpskostnaden 302 kr är härledd, inte kvitterad** | Break-even-CPA 487 kr vilar på den. Tills Axel bekräftar mot Temu-kvittot står varje kill-beslut på ett antagande. | `factory/BESLUT-VANTAR.md` punkt 1 |
| **Ingen redigerare tilldelad** | Briefronden går på 7 per rond i stället för 21. Sätts med `node factory/register.mjs redigerare catcabin/utekattkojan "<namn>" <discord-id>`. | `factory/produkter/register.json` |

---

## Koncept

| Idé | Varför den kan funka | Källa |
|---|---|---|
| **Varianter av `PD_2_H1`, en variabel i taget** | Den enda bedömbara ärvda annonsen: 2 189 kr, 6 köp, CPA 365 kr mot break-even 487 kr, vinstbidrag +733 kr. Vinkeln "katten sover under bilen igen" bär 72 % av spenden. Att variera hook/öppningsbild/längd på en bevisad vinnare är den billigaste vägen till fler vinnare. | ärvd historik, `dna.md` mönster 1 |
| **Bildversion av PD-vinkeln** | Bild fick en fjärdedel av spenden men samma CPA som video (342 vs 352 kr). Formatet är underutforskat, inte sämre. `PD_2_1` gjorde 884 kr / 2 köp och ligger strax under domgränsen. | ärvd historik, `dna.md` mönster 3 |
| **Kvällsvinkeln — "du ser kojan från köksfönstret"** *(märkt gissning)* | Står som produktens emotionella kärna i brandfilen ("oro som blir lättnad, synlig från köksfönstret") och i målgruppstexten, men finns inte som egen vinkel i någon av de 16 ärvda annonserna. Obruten mark. | `factory/butiker/catcabin.yaml` branding, `factory/produkter/utekattkojan.yaml` malgrupp |
| **Vintervinkeln — upphöjd från snön, ingen el** | Säsongen går åt rätt håll och "ingen el, ingen sladd ut i trädgården" är produktens faktiska särdrag mot uppvärmda alternativ. Klarar tre-frågorstestet: går att visualisera, går att falsifiera, och en konkurrent med elvärme kan inte säga det. | `factory/produkter/utekattkojan.yaml` benefits + features |
| **Den hemlösa katten** *(märkt gissning)* | Produktfilen pekar ut den som sekundär målgrupp ("den som matar en hemlös katt som dyker upp i trädgården"). Starkt emotionellt, helt oprövat i materialet. | `factory/produkter/utekattkojan.yaml` malgrupp |

⚠️ **CS-vinkeln är oprövad, inte utdömd.** 365 kr och 0 köp ligger under
domgränsen (300 kr OCH 3 köp) — det är ingen dom. Tidsbegränsningen är sann för
CatCabin (Axel 2026-09-12), så vinkeln får byggas; det som måste rättas är
**priset** (789 / 1 039 kr, aldrig 809 / 1 059).
