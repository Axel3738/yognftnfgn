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

## Öppna frågor — ALLA STÄNGDA (Axel 2026-08-20)

1. ✅ Villkoren bekräftade: 30 dagars öppet köp gäller, fri frakt över 300 kr — de
   villkorade fraserna i videorna ("ved større bestillinger" etc.) stämmer.
2. ✅ Tomma svarta plattan i SO/SP-källorna: OK att lämna som den är.
3. ✅ Garantinormaliseringen (nöjd kundgaranti → öppet köp/returret på NO/DK/UK): godkänd.

Ingen omrendering behövs. Batchen är slutgiltigt godkänd för launch-förberedelse.

## Filer

- `sessions.json` — proofread- + render-ID:n för alla 60 (redo.json i scratchpaden för de 2 omgjorda).
- `srt/` — HeyGens råtranskript (översatta + svenska original).
- `srt-loc/` — de levererade lokaliserade transkripten (det som faktiskt renderades).
- `bands-final.json` — första (för breda) bandmätningen; den snäva ligger i scratchpadens
  `bands-tight.json` och parametrarna står i körloggen.
