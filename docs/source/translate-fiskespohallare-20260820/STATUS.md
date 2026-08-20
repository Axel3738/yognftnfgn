# /translate-körning — Fiskespöhållare → NO + DK + FI + UK

**Status: ✅ KLAR 2026-08-20.** Alla 60 videor (15 × 4 marknader) renderade, cover-behandlade
och levererade i chatten (44 zippar). Körloggen: `docs/video-localization.md`.

## Vad som gjordes

- 60 proofread-sessioner (alla gamla från den pausade körningen var döda och nyskapades).
- Lokalisering per marknad av subagenter + central regex-verifiering tills allt grönt.
- Produktnamn: NO **Fiskestangholder** · DK **Fiskestangsholder** · FI **Kalastusvapateline** ·
  UK **Fishing Rod Holder** — fulla namnet vid första omnämnandet per fil.
- Alla belopp strukna (inkl. HeyGen-hallucinationer: 129/199/94 kr, jättetal i FI_SO_1_H2) →
  rabattbudskap utan siffror. Frifrakt-tröskeln villkorad utan belopp. Enda siffra: "30".
- Järnregel 2: alla 15 källor hade inbrända svenska ord-för-ord-captions →
  blur-cover (band ommätt snävt per video, `bands-tight` ≈ y480 315–356, ~80 px)
  + lokaliserade captions i cover-stil (svart text, vit platta).
- Persist-buggen (PUT /srt → 200 utan effekt) slog till på FI_SO_1_H1 + FI_SP_1_H3:
  nya sessioner + omlokalisering mot färska transkript. Inga extra renderingar.

## Kreditekonomi

13 064 → 8 004 api-credits för hela körningen (transkribering ~1 020 + rendering ~4 040),
≈ 84 credits per levererad video.

## Öppna frågor till Axel (flaggade i leveransrapporten)

1. "Fri frakt (ved større bestillinger)" + "med Klarna får du varan först" + "30 dagars
   öppet köp/nöjd kundgaranti" är kvar i talet på alla marknader — bekräfta att villkoren
   gäller i NO/DK/FI/UK innan launch.
2. SO/SP-källvideorna har en TOM svart platta i övre delen (censurruta i källmaterialet,
   ingen text). Lämnad orörd — vill Axel ha bort den krävs nytt källmaterial.
3. SO-annonsernas "nöjd kundgaranti" normaliserades till öppet köp/returret-fras på
   NO/DK/UK — säg till om garantiformuleringen ska tillbaka.

## Filer

- `sessions.json` — proofread- + render-ID:n för alla 60 (redo.json i scratchpaden för de 2 omgjorda).
- `srt/` — HeyGens råtranskript (översatta + svenska original).
- `srt-loc/` — de levererade lokaliserade transkripten (det som faktiskt renderades).
- `bands-final.json` — första (för breda) bandmätningen; den snäva ligger i scratchpadens
  `bands-tight.json` och parametrarna står i körloggen.
