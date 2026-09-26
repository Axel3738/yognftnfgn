# Briefer: CaraShells mejl i Spoks (skrivna 2026-09-26)

Huvudsessionen skrev strategin, källorna och strukturen — de ligger som kod i
`skelett.mjs` (ett objekt per flöde och kampanj med `memo`, `brief`, `taggar`,
block och Spoks-trigger) och som text i `../../spoks/carashell/PLAN.md`. Copyn
skrevs av sex Sonnet-subagenter (CLAUDE.md regel 6): ett språk och en filtyp var,
mot `docs/copy-regler.md`, faktabladet `fakta/<sprak>.json` (butikens egna
produkttexter per språk, lästa ur Shopify 2026-09-26), `factory/output/carashell/BRAND.md`,
`products/carashell/takskyddet/dna.md` och kundernas ord i `kommentarer/leads.md`.
Svenska, norska och engelska skrevs var för sig på det egna språket, aldrig översatta.

**Det här är en KALLSTART.** Butiken är 15 dagar gammal, 0 återköp, 76 kontakter med
samtycke. Inga mejl-lärdomar finns, så alla kampanjer är `utkast-skrivs-om-efter-lardom`
(Evolve: inga fler nya koncept än skrivna lärdomar) utom K09 som är `kraver-axel`
(Black Week). Flödena är motorn, inte ett test av ett koncept.

## Gemensamt för alla mejl

- Fakta bara ur faktabladet på språket. Priser aldrig i copyn: sv får Spoks produktkort
  (SEK), nb/en får bild + rubrik + knapp, för Spoks katalog har en valuta och ett språk.
- Leveranstiden står aldrig i ett mejl (Axel 2026-09-21; spårningssidan visar den).
- Villkoren exakt som butikens policy per marknad (läst 2026-09-26): sv/nb 14 dagars
  ångerrätt från mottagandet, kunden betalar returfrakten, mejla hello@carashell.com;
  en 90-day guarantee, mejla först. Aldrig ordet garanti på sv/nb.
- Aldrig: förvaringspåse, dragsko, elastiska band (vävda spännband), att väven andas
  (leverantören har inte svarat), isolervärde/material/vikt på termoskyddet, antal
  recensioner, falsk brådska. Kondens och ventilation besvaras inte alls.
- Engelskan går till USA, GB, CA, AU och NZ samtidigt: inga årstider, ingen snö.
- Tre ämnesrader = tre begär; tre-frågorstestet redovisas i `tretest`; ett ❌ stoppar
  konverteringen (`konvertera.mjs kontrollera`).
- Butikens namn bara i avsändaren, sidfoten och mejladressen.

## Källorna per koncept

| Mejl | Källa | Kod |
|---|---|---|
| F01 E2, K01 | dna.md mönster 11 (SP/PD är CaraShells vinklar), faktabladets problemtext | PD |
| F02 E2, K02, F03 E2 | kommentarerna 24–26 sep: storleken syns inte, klarar det vinden, remmarna | OB, `kalla=voc` |
| K04 sv/nb, K10 | brandfilens kalender: fars dag 8/11 (sista beställning mån 26/10), jul (mån 7/12) | GT, urgency konsekvens |
| K05, K07 | ny produkt i butiken (adventskalendern, läst 2026-09-26); lucka 1 kräver order senast fre 13/11 | GT |
| K04 en, K06 sv/nb | kommentarerna: "sönderblåst", "Sebra", "straps break off"; leverantören: webbing, not elastic | OB, `kalla=voc` |
| K03, K11 | termoskyddets faktablad; källans CS-manus (falsk brådska) används aldrig | PD |
| K09 | dna.md mönster 11 (SP_2_1 är butikens vinnare) + butikens egna recensioner; en: policyn | SP / CS |
| K12 | kommentarerna: "sönderblåst efter stormen" | M, service |
| F05, K08, K13 | gissning (0 återköp, säsongslogik) | S, `confidence low` |
| F14 | Axels skiss för Bäverbutiken (samma konstruktion, egen copy) | M |
