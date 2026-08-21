# Batch-logg — Fiskespöhållaren 4-Pack

## Batch #1 — originallaunchen (2026-08-18, +våg 2 2026-08-19)

**Struktur:** CBO 4 000 kr/dag (`Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18`, id 120249850522830291), 5 koncept-adsets: PD (demo), CS (rea-urgency), SP (social proof), SO (pris-offer), GT (gåva). 21 creatives våg 1 + 5 genuint nya våg 2 (2 extra PD_EXTRA-råklipp + 3 H3-omtag; SO-omuppladdningarna med rättat pris räknas som revisioner). Loggat i kvoten: 21 (18/8) + 5 (19/8). Briefades utanför repot — H1/H2/H3-manusen saknas här (begärda).

**Hypoteser (rekonstruerade — batchen briefades innan produktminnet fanns):**
- PD: rå demo säljer utan polish → **UTFALL: JA, preliminärt.** 23 köp, CPA 63–145.
- CS: urgency/rabatt driver köp → **Oklart:** CPA 143,80 (4 köp) = demo-nivå; claimen dessutom osann → ersätts.
- SP/SO/GT: ingen data — CBO-svälta (<100 kr styck).

**Avläsning 2026-08-21 (~2,5 dygn):** 3 705 kr, 33 köp, CPA 112,28, ROAS 3,93, CTR 4,21 %, CPM 143. Funnel 25 933 → 717 LPV → 62 ATC → 33 köp. Shopify: 37 ordrar/17 918 kr sedan 17/8. Full analys: `docs/briefs/rodholder-batch2-2026-08-21/RAPPORT.md`.

**Åtgärder 2026-08-21 (denna session):**
- Pausade 5 felpris-annonser (149 kr mot sidans 289 kr): 120249850587690291, 120249850594370291, 120249850597910291, 120249850596710291, 120249856850670291. Den sista hade rättad body men "4-PACK – 149 KR" inbränt i bilden.
- Registrerade produkten i products.json (BE 1,50/285 kr, target 2,40/178 kr, budget 4 000 kr/dag → kvot 14/cykel).
- Flaggade jämförpriset 148,75 kr (bakvänt) → Axel beslutade "ta bort det" samma dag; compareAtPrice satt till null via Shopify API (pris 289 kr orört, verifierat). CS-annonserna med "40 % RABATT" (CS_1_H1/H2/H3) kör vidare tills batch #2-ersättarna är live — claimen saknar nu helt stöd på sidan, byt så fort Rodholder_CS_3_1/SO_3_H1 är producerade.

**Notion-hub skapad av Axel 2026-08-21:** "Fish rod holder" (database `3c3270ab-908c-80f8-824d-eed3c4aa94e1`, collection `3c3270ab-908c-8356-ad6c-87ff779e647d`) — registrerad i products.json med `scaling: true` (hub + 4 000 kr/dag = redigerarflödet). Batch #2-brieferna laddas upp dit via `/notion`.

## Batch #2 — briefad 2026-08-21 (EJ launchad ännu)

15 creatives (7 video, 6 statics, 2 hook-varianter), briefer i `docs/briefs/rodholder-batch2-2026-08-21/`. Launchas i **nytt separat test-ABO** (lika budget ~100 kr/dag/annons), INTE i skalnings-CBO:n.

| Annons | Hypotes | Status |
|---|---|---|
| Rodholder_PD_3_H1/H2 | Fler råklipp = fler vinnare (variabel: klippet + hooken) | Redo |
| Rodholder_PD_4_H1 | Captions på vinnarklipp höjer hold utan CVR-tapp | Redo |
| Rodholder_PD_5_H1 | Situationshook "när det hugger" slår förvaringshook | Redo |
| Rodholder_PD_8_H1/H2 | Trasselhärva som hook-objekt stoppar scrollen hårdare | Redo |
| Rodholder_SO_3_H1 | Sann värde-framing (72 kr/st) ersätter osann rabatt | Redo |
| Rodholder_PD_9_H1 | Före/efter garagevägg öppnar förvaringssegmentet | Redo |
| Rodholder_GT_3_H1 | Gift-vinkeln (MÄRKT GISSNING — ingen datakälla) | Tier 3 |
| Rodholder_PD_6_1 | Demo-static (b020-stil) | Redo |
| Rodholder_PD_7_1 | Utan/Med-jämförelse | Redo |
| Rodholder_SP_3_1 | Testimonial med RIKTIG recension | **BLOCKER: recensionstext** |
| Rodholder_SO_4_1 | Listicle "4 hållare, 4 platser" | Redo |
| Rodholder_CS_3_1 | Sann offer-static 289 kr/72 kr per st | Redo |
| Rodholder_PD_10_1 | Risk/skydda ditt dyraste spö | Redo |

**Notion-uppladdning 2026-08-21 (`/notion`):** alla 15 annonser uppladdade till Fish rod holder-hubben som items i Draft + `Video - Pending Approval`, hela briefen inklistrad i varje item + länk till brief-filen i repot. OBS: ingen Drive-mapp finns för batch #2 — brief-källan är repot (`docs/briefs/rodholder-batch2-2026-08-21/`) + zipparna som levererades i chatten. SP_3_1-itemet är märkt ⛔ BLOCKED (väntar på riktig recensionstext), GT_3_H1 märkt Tier 3.

**Utfall:** fylls i vid nästa `/cs`-avläsning (tidigast 3 dygn efter launch, ≥5 köp för marginal-CPA — 2b-grinden).
