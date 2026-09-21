# Regi rad för rad — mallen för varje videobrief (från 2026-09-21)

Axels beslut 2026-09-21 (SKALNINGSKUNGEN-FORSLAG §2.9 / §4.2, Axels lucka 2):
**varje videobrief får EN regitabell med EN rad per manusrad.** Redigeraren ska
kunna klippa utan att fråga — varje beat säger vad som syns, vad som hörs, vad
som står på skärmen, vilken effekt, var klippet finns och hur mycket frihet hon
har. `tools/briefgranskning.mjs` mäter tabellen och stoppar briefen innan
Notion-raden skapas (`--rad <brief.md>` / `--manifest <manifest.json>`).

**Varför:** en videobrief utan bild per rad ger en revisionsrunda per
Manila-dygn, och en annons som inte är live kan inte bli breakthrough. Mätt
2026-09-21 på `DryTrek_Damasker_ID_2_H1` och rutinens `Takoverdrag_PD_10_H1`:
"Edit map" med fem tidsblock och en mening var — ingen shot-typ, ingen effekt,
inget källklipp med sekund, ingen text-på-skärm per klipp, ingen frihet.

Regin skrivs av **huvudsessionen** (CLAUDE.md regel 6 gäller texten —
subagenten skriver de svenska raderna, sessionen bestämmer bilden).

---

## Tabellen (engelska rubriker — redigerarna läser den)

I briefens huvud (efter taggraden och `Memo:`) står dessutom raden
**`AI content:`** — `person` (AI-genererad person/avatar), `voice` (AI-röst,
t.ex. HeyGen-dubbning eller ElevenLabs), `image only` (bara AI-bild/
produktanimation) eller `none`. US-översättningssteget läser den och bränner
in "Contains AI-generated content" på de engelska filerna när det är person
eller röst (CS-KLART punkt 27, `tools/ai-rad.mjs`). Saknas raden behandlas
videon som person.

Ovanför tabellen tre fasta rader:

```
**Assets:** Drive folder <namn> (id <id>) · CDN: <url>, <url>
**Reference ads:** parent `<Prefix>_<K>_<n>_H1` (Notion row <url>) — Replicate: <vad> / Do not replicate: <vad>   ← eller "none — new concept"
**Editor latitude:** MAY: cut order within a beat, b-roll within the motif, music, transitions, caption placement within the middle 80 %. MUST NOT: change a Swedish line, the price, the hook line or its timing, product in frame after second 4, name the store, any field in VARIABELTAGGAR. Cannot find a source: comment on this row and set it back to Draft — never replace the product shot with a generic one.
```

Sedan tabellen — **en rad per rad i manustabellen, samma svenska text
ordagrant**:

```
| # | Time | Script line (Swedish) | Audio | On-screen text | Picture | Effect + length | Source | Reference | Latitude |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0:00–0:03 | Samma tur. Ett ben med, ett utan. | VO | Samma tur. Ett ben med, ett utan. | Close-up from the front, both boots on a wet trail, left leg with the gaiter (hook in the lacing visible), right leg bare. First frame: this shot, both boots. | freeze 0.5 s then cut-in | OUR AD DryTrek_Damasker_PD_1_H1 0:00–0:03 | parent hook, same framing | none |
| 2 | 0:03–0:08 | … | VO | NO TEXT | … | slow-mo 0.5× 2 s | DRIVE 1AbC… 0:14 | — | b-roll order free |
```

**Kolumnerna:**

| Kolumn | Regel |
|---|---|
| **Time** | mm:ss–mm:ss, samma som manustabellen. |
| **Script line** | manusraden ordagrant (svenska). Spärren matchar den mot manustabellen. |
| **Audio** | `VO` (raden läses) eller `NO VO` (bara musik/ljud). |
| **On-screen text** | exakt text (standard: manusraden — feeden är tyst) eller `NO TEXT`. **Aldrig tom.** Skiljer sig on-screen-hooken från VO-hooken: skriv båda. |
| **Picture** | vad som FYSISKT syns: produktdelens namn från produktsidan (krok i snörning, rem under foten), shot-typ (close-up / medium / wide / top-down), vad händerna gör. **"or/eller" är förbjudet** — bestäm. Inga adjektiv ("snygg", "stämningsfull"). |
| **Effect + length** | `slow-mo 0.5× 2 s` · `reverse 3 s` · `slider before/after 2 s` · `zoom-in 1 s` · `cut-in` · `freeze 0.5 s` · `none`. **Aldrig tom.** |
| **Source** | ett av fem format, **aldrig tom**: `OUR AD <namn> mm:ss–mm:ss` (obligatorisk sekund — hämta videon ur Meta, `tools/qa-frames.py` 1 frame/s, läs av) · `DRIVE <fil-id> mm:ss` · `DRIVE <fil-id> [EDITOR PICKS: leta efter <konkret bild>]` när klippet finns men inte kunnat läsas · `NEW FOOTAGE: <exakt vad, av vem>` (raden stannar i Draft tills materialet finns) · `CDN <url>` för en stillbild. **En påhittad tidsstämpel är ett FEL; `[EDITOR PICKS]` är giltigt.** |
| **Reference** | vad i förälderns/referensannonsens klipp som ska efterliknas, eller `—`. |
| **Latitude** | radens egen frihet (`none`, `b-roll order free`, `music free`). |

**Hookraden (rad 1)** anger dessutom **First frame** (thumbnailen — det feeden
visar innan play). Är On-screen text `NO TEXT` får Effect inte vara `none`
(en tyst, stilla beat). **Två H-varianter på samma koncept har olika
`hook-mekanik`** i VARIABELTAGGAR (none | reverse | slow-mo | slider | zoom-in
| cut-in | freeze).

Text på skärm = manusraden som standard (Bäverbutikens feed är tyst, captions
bär budskapet). Kursens "no text on hooks" bara som märkt undantag (`NO TEXT`
på rad 1 med en effekt som bär hooken).

**Bildbriefer** behåller "Exact text" + Design brief och får raderna
**Reference** + **Editor latitude** — ingen regitabell.

Manustabellen får vara samma tabell utökad med kolumnerna, eller en egen
tabell direkt efter den. Verktyget hittar regitabellen på rubrikraden: den har
både en `Source`- och en `On-screen text`-kolumn.

---

## Spärren (`tools/briefgranskning.mjs`)

Körs av rond-auto 4b, Nattvakten (`/notionscalercs` steg 7), `/cs` och
`/forsta-batch` på varje egen videobrief **innan Notion-raden skapas**:

```
node tools/briefgranskning.mjs --rad products/<id>/batch-NN/video-ads-briefs/<namn>/brief.md [--prefix <Prefix>] [--pris 599 --jamforpris 678]
node tools/briefgranskning.mjs --manifest products/<id>/batch-NN/manifest.json [--prefix <Prefix>]
```

Exit 1 = skapa ingen Notion-rad, rätta briefen. Inget nät, ingen Notion.

**FEL** (redigeraren måste veta — blir kommentar på raden i `/briefgranskning`):
ingen regitabell · en manusrad utan regirad · Source tom eller utanför de fem
formaten · `OUR AD` utan mm:ss · On-screen text tom · Effect tom · Picture tom ·
ingen Editor latitude med MAY + MUST NOT.
**Anmärkning** (skrivarens sak): "or/eller" i Picture · `NO TEXT` + `none` ·
Assets / Reference ads saknas · first frame inte nämnd.

I spärrläget stoppar dessutom anmärkningar med kod `regi`, `taggar` och
`komponent` — där är skrivaren sessionen själv och kan rätta.

**Kalibrering:** briefer skrivna före 2026-09-21 (`skapad_dag` < `REGI_FRAN`)
får den saknade regin som anmärkning, aldrig som kommentar till redigeraren —
regeln fanns inte när de skrevs. En brief utan datum (spärrläget) döms fullt.

---

## Mät från dag 1 — annars finns ingen före-siffra

Per annons i `products/<id>/batch-log.md`, fylls i av varje `/cs`-läsning och
etikettronden (rond-auto 3c):

| Fält | Källa | Regel |
|---|---|---|
| **rev** | antal läsningar där raden stått i `In progress 2` (Notion har ingen statushistorik — ackumulera vid varje läsning) | `okänd` när raden inte lästs, aldrig 0 av slentrian |
| **brief → live (dagar)** | Notion-radens `Skapad` → Metas `created_time` på annonsen (ETIKETT-radens `d0`) | två äkta tidsstämplar, aldrig påhittade |

Jämför före/efter över ≥ 2 batcher innan något sägs om effekten. Effekten går
inte att bevisa om 30 dagar utan före-siffran.
