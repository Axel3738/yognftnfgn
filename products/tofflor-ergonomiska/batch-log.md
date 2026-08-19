# Batch-logg – Tofflor Ergonomiska

Kampanj `120249742782850291` (Ergonomiska Tofflorna) · MagiBorsten `1867947880635861`.
Namngivning från batch #2: `Ergoslippers_<KONCEPT>_<ADID>_<VARIANT>`.

---

## Batch #1 — launchbatchen (2026-08-13) · 21 annonser · EJ skapad ur repot

Skapades i en session som aldrig pushade sitt minne — inga briefer eller manus finns i
repot. Struktur: 4 ABO-adset (PD/SP/CS/G), 1 000 kr/dag totalt, opt. köp.
Namnen följer inte namnkonventionen (saknar engelskt produktprefix och variant).

**Avläsning 2026-08-19 (dag 6):** 5 641 kr · 26 köp · CPA 217 kr · ROAS 1,79.

| Utfall | Annons | Resultat |
|---|---|---|
| ✅ Vinnare (preliminär) | Tofflor_SP_2 | 15 köp · CPA 167 · ROAS 2,30 · benchmark |
| ✅ Lovande | Tofflor_SP_1 | 8 köp · CPA 199 · ROAS 2,01 |
| ⏳ Nära grind | Tofflor_SP_3 | 267 kr · 1 köp · CTR 2,59 % |
| ❌ Kill 2026-08-19 | Tofflor_PD_1 | 565 kr · 0 köp (emballage-hook) |
| ⚠️ Får ej återanvändas | Tofflor_SP_2_1 | Påhittad recension i bild |
| ⏳ Odömt | övriga 16 | 0–157 kr styck, CS/G-adseten fick nästan inget |

Lärdomar → `dna.md` (mönster 1–4). Kill-beslutet togs först mot proxy-BE 228 kr och
står sig mot den verifierade break-even (216 kr, Axels COGS-besked 2026-08-19).

---

## Batch #2 — `/forsta-batch`-batchen (briefad 2026-08-19, ej launchad)

14 briefer: `docs/briefs/tofflor-ergonomiska-batch2/`. Copy skriven av sonnet-subagent
mot `docs/copy-regler.md`. Struktur vid launch: **separat test-ABO**, 2–3 annonser per
adset, lika budget. Kvoten (proxy-target 131 kr): 5 creatives/3-dagarscykel — batchen
täcker ~3 cykler.

| Annons | Format | Hypotes (isolerad variabel) |
|---|---|---|
| Ergoslippers_SP_4_H1 | Video (rå UGC) | Sul-makro som hook slår "Det här är tofflorna" (hook isolerad, samma body) |
| Ergoslippers_SP_4_H2 | Video (rå UGC) | Pain-hook (trötta fötter) vs nyfikenhet — hook isolerad |
| Ergoslippers_SP_4_H3 | Video (rå UGC) | Sann social proof-hook (översålt lager) — hook isolerad |
| Ergoslippers_SP_6_H1 | Video (polerad) | Omklippt SP_1: innersulan trycks ihop i sek 1 — räddar polerat footage |
| Ergoslippers_SP_6_H2 | Video (polerad) | Trygga steg/halkfritt-vinkel på samma footage — angle isolerad |
| Ergoslippers_PD_4_H1 | Video (demo) | Mekanism-demo "gå på moln"-testet (tryck → kliv i → gå ut) |
| Ergoslippers_SO_1_H1 | Video (story) | Rak lagerberättelse: 28 ordrar v.1, översålt, nu påfyllt |
| Ergoslippers_SP_5_1 | Statisk | Vinnarens stillbild + komfortpåstående + garanti (format-transfer) |
| Ergoslippers_PD_7_1 | Statisk | Orange sulan rakt mot kameran (sula-mot-kamera, bevisat mönster strandtofflorna #8) |
| Ergoslippers_PD_8_1 | Statisk | Jämförelse tunn platt vs tjock stötdämpande |
| Ergoslippers_SO_2_1 | Statisk | Sann social proof-fakta som rubrik + "Nu påfyllt" |
| Ergoslippers_PD_9_1 | Statisk | Listicle 4 punkter |
| Ergoslippers_SO_3_1 | Statisk | Pris/värde: 309 kr, 400 kr överstruket, spara 91 kr, Klarna, 30 dagar |
| Ergoslippers_PD_10_1 | Statisk | Risk/cost-of-inaction: stegen landar i hälar och knän |

Utfall: fylls i vid nästa `/cs`-körning.
