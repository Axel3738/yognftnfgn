# Sätesöverdragaren — Creative DNA

Produkt: Sätesöverdrag för Åkgräsklippare – Slittåligt 600D Oxford (baverbutiken.se)
Kampanj: "Sätesöverdragaren" `120249122415680291` · Konto: MagiBorsten `1867947880635861`
Pris: 649 kr (ord. 811 kr) · Break-even-CPA: **474 kr** · Target-CPA: **300 kr** · AOV (härledd): 697 kr
Senast uppdaterad: 2026-08-05 (efter `/cs`-runda 2, 16 dagars kontodata)

> Denna fil är produktens ackumulerade minne. Data och hypotes hålls isär enligt
> `docs/os/ANALYSMETOD.md`. Uppdateras vid varje `/cs`.

---

## Winning DNA (data — bevisad, ≥2 annonser ≥3 köp vardera med samma slutsats)

- **Format = rå leverantörsvideo med genomgående inbrända svenska captions.**
  `PD_1_3_H1` (49 köp, CPA 287 kr, vinstbidrag 9 169 kr — 91,7 % av allt vinstbidrag
  i kontot) och `PD_2_1_H1` (3 köp, CPA 420 kr, vinstbidrag 163 kr) är de två enda
  videoannonserna som klarat signifikansgränsen, och båda är lönsamma. Video är
  den format-kategori som driver skalan i kontot — CBO lägger 79 % av spenden här.
- **Produkten synlig direkt, ingen talare, ingen musikvideo-stil.** Båda bevisade
  videoannonserna är rena demos utan person i bild.

## Winning DNA (hypotes — starkt signal, men underliggande annonser < 3 köp)

- **Prisanker-vinkeln ("nytt säte kostar tusenlappar, det här 649 kr") har högst
  konverteringseffektivitet per besök i kontot.** `SO_1_1_H1` (statisk offer-grafik)
  har LPV→köp 6,15 % — mer än dubbelt så högt som de bevisade videoannonsernas
  ~2,5–2,8 %. Bara 4 köp bakom siffran, men **samma mönster upprepades i den
  ursprungliga ad-hoc-analysen** (juli) och nu igen under den formella metoden —
  två oberoende mätperioder, samma slutsats. Inte formellt "bevisad" (kräver 2
  annonser ≥3 köp), men tillräckligt konsekvent för att fortsätta bygga SO-spåret.
- **Captions är den enskilt viktigaste variabeln i video**, ursprungligen bevisad
  i den rena A/B:n `PD_1_3_H1` (med captions, ROAS 2,50) vs `PD_1_1_H1` (identisk
  video utan captions, ROAS ~1,0). `PD_1_1_H1` har efter 16 dagar och 1 302 kr
  spend fortfarande bara 2 köp (under signifikansgränsen, ingen formell dom) —
  men gapet mot tvillingen har inte stängts på tre veckor. Behandla captions som
  ett obligatoriskt produktionskrav, inte en variabel att testa om igen.

## Losing DNA (hypotes — konsekvent riktning, ingen enskild annons signifikant)

- **UGC/talare-drivet innehåll ("SP"-spåret) har noll bekräftade köp i hela
  kontots historia**, trots sex annonser och två batcher: `SP_1_1_H1`, `SP_2_1_H1`
  (430 kr spend, 0 köp — högst CTR i kontot men noll konvertering, klassiskt
  nyfikenhetsklick), `SP_3_1_H1` (se policyanmärkning nedan), och batch 2:s
  `SP_4_H1`/`SP_5_H1`/`SP_6_1` (för nya för att bedöma). Ingen enskild SP-annons
  har nått 3 köp. Mönstret är konsekvent men formellt obevisat — nästa `/cs`
  avgör om batch 2:s SP-ads bryter mönstret eller bekräftar det.
- **Lång video (79–146 s) utan cutdown konverterar inte**, trots hög hook/CTR
  (`SP_2_1_H1`: hook enligt ANALYSMETOD-formeln 93 %, CTR 6,7 %, p50/plays bara
  10 %, 0 köp på 430 kr). Regel 9: hög CTR utan CVR är nyfikenhetsklick, inte en
  vinnare.

## Behåll alltid
- Captions i alla videor, ord för ord från brief, vit text/svart kant.
- Produkt synlig < 1 sekund i video, dominant i bild.
- Pris exakt 649 kr / ord. 811 kr — äkta genomstrykning, aldrig ordet "överstruket"
  utskrivet (se Kvalitetskontroll-loggen nedan).
- Rå/dokumentär videostil framför polerad reklamstil.

## Testa kontrollerat (en variabel i taget)
- Persuasion-mekanism: demo (bevisad) vs pris-anker (starkt hypotes) vs
  mekanism/prevention (obevisat, `PD_7_H1` för tidigt) vs identity/gift (helt
  otestat — batch 3).
- Format: video vs statisk vs karusell (karusell aldrig testad).
- Längd: 38 s (bevisad bas) vs 15 s cutdown (`PD_5_H1`, för tidigt).

## Undvik
- Video utan captions.
- Lång UGC (>45 s) utan cutdown.
- **Fabricerade testimonials.** Se Kvalitetskontroll-loggen — inträffat två gånger
  i kontot (`SP_3_1_H1` och `SP_6_1`).

## Ännu obevisat
- Om riktig (verifierad) kundröst konverterar bättre än opersonlig demo —
  kräver Judge.me-export innan det går att testa på riktigt.
- Om mekanism/prevention-vinkeln (`PD_7_H1`) expanderar publiken utöver de med
  redan spruckna säten.
- Karusellformat.
- Identity/gift-vinkel (batch 3, `SO_3_1`).

---

## Kvalitetskontroll-loggen (löpande, viktigt att inte tappa bort)

| Datum | Fynd | Åtgärd |
|---|---|---|
| 2026-07-30 | `SO_1_1_H1` hade AI-textbugg: ordet "överstruket" skrivet ut i bilden i stället för en riktig genomstrykningslinje. | Ersatt med `SO_1_2` (verifierad korrekt vid launch — riktig linje över 811 kr). |
| 2026-07-30 | `SP_3_1_H1` var en fabricerad AI-testimonial ("Verifierad kund, 54 år", påhittat citat, AI-ansikte). | Flaggad, rekommenderad pausad. Fortfarande live (8 kr spend). |
| **2026-08-05** | **`SP_6_1` (launchad 2026-08-04) är ÄNNU en fabricerad testimonial** — "Bättre än väntat, den är vadderad och har flera fickor." – JAKOB, verifierat köp, "En av 20 recensioner". Briefen för denna annons var uttryckligen märkt **BLOCKER: väntar på riktig Judge.me-export** — ingen sådan export har levererats i denna chatt. Namnet "Jakob" och citatet är påhittade. | **Rekommenderas pausad omgående.** Se rapportens åtgärdslista. Samma policyproblem som `SP_3_1_H1`, andra gången i kontot. |
| 2026-08-05 | `SP_4_H1`/`SP_5_H1` (batch 2, UGC-koncept) launchades med den **befintliga** kontocopyn ("Trodde jag skulle behöva byta hela sätet... Det är den vanligaste kommentaren vi får") snarare än ny brief-copy. Denna rad är en overifierad "vanligaste kommentar"-formulering, inte ett nytt påhitt, men har aldrig belagts mot en riktig recension. | Flaggad som stående overifierad claim. Inte lika akut som SP_6 (ingen namngiven falsk person), men bör bytas ut när recensionsdata finns. |
| 2026-08-05 | `PD_10_1` (listicle) launchades med exakt den känslomässiga 4-punktstexten ("Slipp den kalla, blöta känslan...") som levererades i chatten 2026-08-05 — bekräftar att produktionsteamet använder brieferna korrekt. | Ingen åtgärd, positiv kontrollpunkt. |
| 2026-08-05 | `SO_1_2` visuellt verifierad korrekt: riktig genomstrykningslinje över "811 kr", inget textfel. | Buggfixen fungerade. Pausa `SO_1_1_H1` till förmån för `SO_1_2` när den senare når signifikans. |

---

## Öppna frågor till Axel
1. Judge.me-export (riktiga recensioner) — efterfrågades 2026-07-30, saknas fortfarande. Blockerar `SP_6_1` (redan launchad felaktigt, se ovan) och framtida testimonial-briefer.
2. Bekräfta att `SP_4_H1`/`SP_5_H1`:s filmade person är en riktig kund/creator, inte återanvänt leverantörsmaterial — påverkar om "vanligaste kommentaren"-raden får fortsätta användas.
