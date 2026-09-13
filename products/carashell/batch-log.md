# Batch-logg — CaraShell (taköverdraget)

En rad per batch: vad som launchades, vilken hypotes varje annons bar, och vad
utfallet blev. **Hypotesen skrivs när batchen launchas, utfallet när den lästs
av.** Saknas en hypotes skrivs `hypotes: ej loggad` — den hittas aldrig på i
efterhand.

Nyckel `carashell/takskyddet` · konto **MagiBorsten DK `915422744950975`** ·
hub `CaraShell creative hub` (`3d9270ab-908c-819d-be0f-c6cb71320871`).

---

## Batch #1 — 2026-09-11, launchad av `/ny-annonser` (16 annonser SE + 9 NO)

Byggd som översättning av Bäverbutikens källannonser till CaraShells brand,
inte som ett eget koncepttest. Kampanj `CARASHELL_SE_Taköverdraget`, CBO
1 000 kr/dag, fyra adsets = fyra vinklar.

**hypotes: ej loggad.** `/ny-annonser` körde 2026-09-11 utan att skriva
produktminne (mappen `products/carashell/` fanns inte förrän 2026-09-12).
Hypoteserna nedan är **rekonstruerade ur annonstexterna**, avlästa i kontot
2026-09-12 — de är alltså vad annonserna säger, inte vad någon skrev i förväg.
Märk dem som rekonstruktion i varje feedback-loop.

| Annons | Typ | Vinkel | Bärande rad (rekonstruerad) | Ärvd förälder |
|---|---|---|---|---|
| `CaraShellRoof_PD_1_H1` · `_2_H1` · `_3_H1` | video | PD | "Taket på husvagnen är den ytan du aldrig kollar – och den som kostar mest att laga." Mekanismen omskriven till elastiska spännband + 30–40 cm kant. | `Takoverdrag_PD_*` |
| `CaraShellRoof_PD_2_1` | bild | PD | Samma copy som PD-videorna. | `Takoverdrag_PD_2_1` (bild, CPA 121 kr) |
| `CaraShellRoof_SP_1_H1` · `_2_H1` · `_3_H1` | video | SP | "Passar bra och skyddar taket mot väder." – Lars. "Ett av 16 omdömen – alla fem stjärnor." 14 dagars ångerrätt. | `Takoverdrag_SP_*` |
| `CaraShellRoof_SP_2_1` | bild | SP | Samma copy. | `Takoverdrag_SP_2_1` (bild, 8 köp) |
| `CaraShellRoof_GT_1_H1` · `_2_H1` · `_3_H1` | video | GT | "Presenten han faktiskt blir glad för." Ordagrant från källan. | `Takoverdrag_GT_2_H1` (14 köp) |
| `CaraShellRoof_GT_2_1` | bild | GT | Samma copy. | `Takoverdrag_GT_2_1` |
| `CaraShellRoof_CS_1_H1` · `_2_H1` · `_3_H1` | video | CS | "🔥 23% RABATT … – IDAG 🔥 · 1469 → 1129". Lagerbristen struken, betalsätt + ångerrätt + leveranstid tillagt. | `Takoverdrag_CS_2_H1` (CPA 81 kr) |
| `CaraShellRoof_CS_2_1` | bild | CS | Samma copy. | `Takoverdrag_CS_2_1` |

NO-uppsättningen (`CaraShellRoof_NO_PD_1-3`, `_SP_1-3`, `_G_1-3`) ligger i
`CARASHELL_NO_Takovertrekket` i samma konto. Norska SP bär ett eget riktigt citat
("Veldig fornøyd. God beskyttelse når campingvogna står ute." – Johan).

### Utfall per 2026-09-12 (efter 3 dygn)

**314 kr spend, 0 köp, 0 av 16 annonser bedömbara.** Ingen dom, ingen ranking,
ingen kill-kandidat — grinden går vid 300 kr **och** 3 köp per annons.
Mest spend: `PD_2_H1` 114 kr · `PD_1_H1` 46 · `SP_2_H1` 46 · `SP_3_H1` 29 ·
`PD_3_H1` 22 · `GT_1_H1` 18 · `CS_1_H1` 13 · övriga under 10 kr.

Enda avläsbara signalen så här långt är diagnosmetrik, och den är **inte** ett
köpmått: hook 3 s ligger 25–54 %, CTR 4,5–8,6 %, CPC 0,81–3,29 kr, CPM 52–190 kr.
`PD_1_H1` har bäst CPC (0,81 kr) och högst CTR (8,60 %) av allt som fått
tillräckligt med visningar för att siffran ska betyda något.

⚠️ CBO:n har lagt 61 % av de 314 kronorna på PD — samma vinkel som redan tog
mest i källan, medan CS och GT (bäst CPA i källan) fått 31 respektive 20 kr.
Det är mönster 1 i `dna.md` som upprepar sig, och det är skälet till att
kommande tester ska ligga i eget test-ABO med lika budget per annons, inte i
skalningens CBO.

### Att läsa av nästa briefdag

1. Håller PD sin volym när mekanismraden är utbytt (dna.md ändring 1)?
2. Replikerar bilderna som i källan (mönster 3) — får `*_2_1`-raderna köp?
3. Får CS och GT någon spend alls i CBO:n, eller måste de testas separat?

---

## Batch #2 — planerad

Skrivs av första briefdagen som faller efter 2026-09-12
(`/notionscalercs carashell/takskyddet`, onsdag eller söndag). Storlek **7**
briefer så länge ingen redigerare är tilldelad butiken; 21 när en är det.
