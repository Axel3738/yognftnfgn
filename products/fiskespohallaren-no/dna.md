# Creative DNA — Fiskespöhållaren NO (Fiskestangholder 4-pakning, norska marknaden)

Skapad 2026-08-31 av `/forsta-batch` (körning nr 1, NORSK marknad — utlöst av
`agent/rond.mjs`-flaggan `forsta_batch`: kampanjen passerat 1 500 kr spend
utan att någonsin fått en riktig creative-batch).
Datakälla: Magiborsten NO `1050941584152547`, kampanj `120251856983860233`
("Fiskestangholder NO | BE-ROAS 1,36 | 2026-08-20"), avläst 2026-08-31.
3-dagarsfönster: 2 989 kr / ROAS 2,40 / 25 köp. Livstid (`date_preset: maximum`):
10 271,68 kr spenderat (verifierat mot annonsradernas summa: 10 281,68 kr,
skillnad normal avrundning/valutakonvertering), ROAS 2,28, 71 köp.

⚠️ **Detta är samma fysiska produkt som svenska "Fiskespöhållaren"**
(kampanj `120249850522830291`, break-even-ROAS 1,50) — men **egen NO-produkt,
eget minne**. Blanda aldrig ihop siffrorna mellan marknaderna. SE-produkten har
INGET eget `dna.md` ännu (obriefad enligt CLAUDE.md — historisk skuld, inte
denna körnings uppgift).

## Produktfakta — ⚠️ OSÄKRA, tre olika prisuppgifter hittade
- **Fiskestangholder 4-pakning – Kraftig Oppbevaring**
  (`fiskestangholder-4-pakning-kraftig-oppbevaring`), Bäverbutikken/Marin.
  SKU `BEVER-MARIN-049`, supplier-sku `TEMU-601104615671651`.
- **Shopify-åtkomst till beverbutikken.no var NERE hela sessionen** (token
  expired) — priset går INTE att verifiera live. Tre olika siffror hittade i
  källor, alla från 2026-08:
  1. `market-expansion/no/output/catalog.no.json` (byggdata 2026-08-06): **149 kr**
  2. Sex levande NO-annonser i denna kampanj (`NO_CS_1_*`, `NO_SO_1_*`,
     `Fiskespöhållare_CS_2_1_NO`) skriver **269 kr** i primärtexten.
  3. SE-briefer i Drive (Google Docs, `Rodholder_PROD_V01–V10`, byggda
     2026-08-25) skriver **289 kr** i sin footer.
  → **Ingen av de tre är bekräftad mot en levande sida.** Nya briefer i denna
  batch skriver **inget pris alls** tills Axel bekräftar rätt siffra.
- Produkten: 4 st klämmor som håller ihopfällda fiskespön samlade
  (INTE väggmontering — trots att produktbeskrivningen säger "monteres på
  vegg eller i båten", visar det verkliga annonsmaterialet klämmor som
  fästs direkt på spöspetsarna, se FAS 0).
- Garanti **"30 dagers åpent kjøp"** är bekräftad äkta policy
  (`market-expansion/BESLUT.md` 2026-08-06, punkt 8) — säker att använda.
- Klarna "Betal senere" är bekräftad live (syns i on-screen text i
  `NO_SP_1_H1`) — säker att använda.

## Datakvalitet
- Meta-data: hämtad direkt ur `ads_get_ad_entities`/`ads_get_creatives`,
  `date_preset: maximum`. Summan av alla 20 annonsraders `amount_spent`
  (10 281,68 kr) matchar det angivna livstidsspendet (10 271 kr) inom normal
  avrundning.
- Shopify (beverbutikken.no): **INTE nåbar** — `mcp__Shopify__*` gav
  "requires re-authorization (token expired)" på både `get-shop-info` och
  `search_products`. Ingen försäljning kunde korsvalideras.
- Judge.me/recensioner: inte kontrollerat (inget dedikerat verktyg
  tillgängligt denna session) — sociala bevis-koncept i denna batch är därför
  BLOCKERAT, se `backlog.md` och Notion-item `Rodholder_NO_SO_3_1`.
- Meta Ad Library (norska sökord "fiskestangholder"): 8 träffar, samtliga
  egna annonser (page_id 879054088633562, Beverbutikken). Ingen norsk
  konkurrent hittad på denna sökterm.
- Video: kunde inte öppnas (bara thumbnail + primärtext via API). Ingen
  fullständig transkribering av tal/voiceover gjord — bedömningen bygger på
  primärtext + visuell thumbnail, inte ord-för-ord-manus.

## Siffrorna (bedömbara annonser, ≥300 kr SPEND OCH ≥3 köp; BE-ROAS 1,36)

Vinstbidrag räknat som `spend × (ROAS − break-even-ROAS)` — matematiskt
ekvivalent med `(break-even-CPA − CPA) × köp` när AOV är konstant, och
används här eftersom AOV/pris inte kunde verifieras (se ovan).

| Annons | Format | Vinkel | Spend | Andel av spend | Köp | CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|---|---|
| **NO_PD_1_H3** (benchmark/top spender) | video | pain→demo, klämma, utomhus/sjökant | 6 624 kr | 64,4 % | **55** | 120 kr | **2,62** | **+8 346 kr** |
| Fiskespöhållare_SO_2_1_NO | static | benefit+pris(269kr)+garanti | 454 kr | 4,4 % | 4 | 114 kr | **3,89** | **+1 151 kr** |
| NO_PD_1_H2 (samma manus som H3, inomhus/soffa) | video | pain→demo, klämma, INOMHUS | 2 502 kr | 24,3 % | 8 | 313 kr | **1,24** ⚠️ under BE | **−291 kr** |

**Övriga 17 annonser** (NO_CS_1_H1/H2, NO_SO_1_*, NO_GT_1_*, NO_SP_1_*,
Fiskespöhållare_PD/CS/GT/SP_2_1_NO) ligger alla under 300 kr spend — **för
lite data för dom**, ingen ska döma dem. Kampanjen har kört 11 dagar men
Metas leverans har koncentrerat 92,9 % av spendet (9 240 av 10 282 kr) till
enda annonsen NO_PD_1 (H1+H2+H3) — resten av vinklarna har aldrig fått en
riktig chans. Det här är rotorsaken till att `forsta_batch`-flaggan
triggades: kontot har "kört" i 11 dagar men bara EN vinkel har testats på
riktigt.

## Rotorsak — vad som faktiskt driver resultatet
**Samma manus, olika miljö, total kontrast:** NO_PD_1_H3 (sjökant/utomhus,
POV-händer, äkta miljö) ger ROAS 2,62. NO_PD_1_H2 kör **exakt samma
primärtext** men filmad inomhus (soffa) — ROAS faller till 1,24, UNDER
break-even. Manuset är alltså inte variabeln — miljön/äktheten är det.
Detta är den viktigaste enskilda lärdomen i denna batch och styr FAS 7–9:
alla nya PD-varianter håller sig till äkta, oiscenesatta miljöer.

## Winning DNA — behåll alltid
- Pain-first hook om trassliga spön ("Floker fiskestengene seg i båten –
  igjen?") + snabb klämdemo, POV-händer, **äkta utomhusmiljö**. Bevisat 55
  köp / ROAS 2,62.
- Ingen prissiffra i de bäst presterande annonserna (NO_PD_1_H3 nämner
  aldrig pris) — säkrast väg framåt tills priset är bekräftat.
- "30 dagers åpent kjøp" + Klarna "betal senere" — båda bekräftat äkta,
  säkra att bygga risk-reversal-vinklar kring utan prisrisk.

## Losing DNA — undvik
- **Samma manus, inomhus/iscensatt miljö** — bevisat sämre (ROAS 1,24 vs
  2,62 på identisk text). Filma aldrig PD-familjen i en studio-liknande miljö.
- **Att skriva ett exakt pris i annonstexten** utan bekräftad källa — tre
  motstridiga prisuppgifter (149/269/289 kr) cirkulerar redan i systemet.
  Samma misstag har hänt förut på SE-sidan (`ZZ_GAMMAL_..._(fel pris)`-
  annonser i SE-kontot är bevis på att detta redan kostat pengar en gång).

## Testa kontrollerat
- Gåva-vinkeln (GT): enda köpet i gruppen kostade 58,91 kr CPA — lägst i hela
  kampanjen, men bara 58,91 kr spend totalt. För lite data för dom, men
  värt en riktig chans (se FAS 7/8 i rapporten och Notion-item
  `Rodholder_NO_GT_3_H1`).
- Risk-reversal utan pris (Klarna + garanti) som eget koncept, video och
  static — testar om SE:s bästa högspend-vinkel ("40% RABATT", ROAS 3,13)
  går att återskapa utan att röra prisfrågan alls.

## Obevisat
- Allt utanför PD_1-familjen (CS, SO, GT, SP, samt de lokaliserade
  `_2_1_NO`-portarna) — under 300 kr spend vardera, ingen dom möjlig ännu.
