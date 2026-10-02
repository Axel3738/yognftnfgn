# /mekanismer – Nya mekanismer mot marknadssofistikeringen (steg 3)

Argument: `$ARGUMENTS` — produkt-id (mapp under `products/`) och produktsidans URL.
Exempel: `/mekanismer matstrumpor https://matstrumpor.se/products/sushi-strumpor`

Facit för metoden: Schwartz fem steg (Breakthrough Advertising). Steg 3 = kunden har
hört löftet, så vinnaren förklarar HUR produkten gör det andra inte gör. Första
körningen 2026-10-01 på Sushi-Strumpor: `products/matstrumpor/mekanismer.md` är
mallen för utfilen, läs den innan du börjar.

## Gör följande, hela kedjan utan att invänta godkännande

### 1. Läs läget (allt ur källor, inget ur huvudet)
- Produktsidan live (`/products/<handle>.json` + HTML: titel, pris, erbjudanden
  ordagrant, vad som ingår, FAQ, recensioner med datum och betyg). Titta på
  produktbilderna själv.
- `products/<id>/dna.md`, `lardomar.md`, `batch-log.md`, alla briefer i
  `batch-*/`, och **transkripten om de finns** (Matstrumpor:
  `matstrumpor/marknader/transkript/*.srt` — där står hookarna för annonser
  `lardomar.md` aldrig läste; `tools/qa-frames.py` på kontots videor annars).
- Metas annonsbibliotek: `mcp__Adsmanager__ads_library_search` på produktens
  kategoriord (svenska + engelska, SE + de marknader produkten säljs i).
  Skriv ner varje konkurrents bärande rad ordagrant.
- `docs/copy-regler.md`, `docs/playbook.md`, `docs/sushi-strumpor-concepts.md`
  (eller motsvarande research för produkten).

### 2. Döm sofistikeringsnivån
En tabell: marknad · nivå 1–5 · belägg (annonsörer och deras rader). Säg vad
kontot redan bevisat (vinnaren, dess mekanism, tro och brådska) och vad som dött.
Utan den här tabellen är resten gissning.

### 3. Fem mekanismer, max
Per mekanism: **Så fungerar den** (en process, ett format, en leveransväg —
inte ett större löfte) · **Varför ny** (vad kontot och konkurrenterna kört, med
annonsnamn och rad) · **Belägg i produkten** (sidan, bilderna, recensionerna) ·
**Anti-positionering** (mot presentpapper, mot presentkort, mot skämtprylen …) ·
**Första test, billigast** (bild i vinnarens layout eller ny öppning på
vinnarens kropp, och vilket adset). Typ enligt dokumentet: NM/NI/NID.

### 4. Skeptikern (obligatorisk, egen subagent, läs-bara)
En subagent med standarden "fäll hellre än fria" läser samma filer PLUS
transkripten och dömer varje mekanism **NY / UPPVÄRMD / FÖRBRUKAD** med
annonsnamn och ordagrann rad som bevis, säger vad som skulle göra den nyare,
och rangordnar på breakthrough-chans givet kontots lärdomar. Skriv in domen i
filen och **rätta dina egna påståenden** där hon fäller dem — första körningen
kallade två redan körda vinklar nya tills skeptikern läste transkripten.

### 5. Hookarna (sonnet, regel 6)
En subagent med `model: "sonnet"` får faktalistan, förbudslistan (butikens namn,
andra siffror än sidans, material/kvalitet/leverans, rader som är live i
kontot) och `docs/copy-regler.md`, och skriver 4 hookar + 2 Ads
Manager-rubriker per mekanism, svenska + engelsk betydelse, med
tre-frågorstestet redovisat per rad. Bara rader med tre ✅ in i filen.

### 6. Skriv filen och minnet
`products/<id>/mekanismer.md` (§1 läget, §2 mekanismerna med hookar, §3
anti-positioneringarna, §4 ordningen EFTER skeptikern, §5 det som aldrig får
påstås, §6 skeptikerns dom). En pekare i `dna.md` under "Nästa steg".
Committa och pusha.

### 7. Rapportera till Axel
Kort: tabell mekanism · bästa hook · dom. Säg ärligt hur många som är genuint
nya. Chadbot-fråga (utan brand, under 2 000 tecken) om något är osäkert.
Hans uppgifter sist, numrerade.

## Regler
- Ingen mekanism får påstå något produktsidan inte säger. "Material?" obesvarad
  på sidan ⇒ ingen annons får nämna material.
- En mekanism som redan burit en live annons är UPPVÄRMD, inte ny — även om
  annonsen svalt. Svält är ett utfall att logga, inte ett bevis för att idén är
  oprövad.
- Rutinen skriver briefer bara om en rond ber om det; den här filen är
  konceptfrön med källa, inte briefer. Nya briefer följer brieftaket (aldrig
  fler än lärdomar).
- Aldrig butikens namn i en hook.

## DEFINITION OF DONE
- [ ] Produktsidan, bilderna, recensionerna och annonsbiblioteket lästa i dag (datum i filen)
- [ ] Transkripten/kontots hookar lästa innan en vinkel kallats oprövad
- [ ] Sofistikeringstabell med belägg
- [ ] ≤ 5 mekanismer, var och en med anti-positionering och första test
- [ ] Skeptikerns dom inskriven och egna fel rättade
- [ ] Hookar av sonnet, tre-frågorstestet redovisat, bara tre ✅ i filen
- [ ] `products/<id>/mekanismer.md` + pekare i `dna.md`, committat och pushat
- [ ] Rapport till Axel med hans uppgifter sist
