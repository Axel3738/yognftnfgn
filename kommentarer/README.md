# kommentarer/ — kommentarsgranskningen

Motorn bakom `/kommentarer` (Axels beställning 2026-09-24: "en rutin som kan
granska kommentarsfält endast och som jobbar med invändningshantering … rapport
om kommentarer och allvarliga grejer och nya leads på vinklar och hooks och
invändningar"). Noll npm-beroenden.

**Läs-bart mot Meta.** Rutinen svarar, döljer och raderar aldrig en kommentar.

```bash
node kommentarer/kor.mjs --kolla                  # nycklar, konton — vad går att läsa
node kommentarer/kor.mjs --hamta [--timmar 72]    # nya kommentarer → output/<datum>.json (skriver inget minne)
node kommentarer/kor.mjs --rapport --torr         # visa svensk rapport + engelska Discord-texter
node kommentarer/kor.mjs --rapport --discord      # skriv rapport, leads, logg, läge + posta
node kommentarer/kor.mjs --lista Takoverdrag      # loggens kommentarer för en produkt (alla annonser)
```

## Flödet

1. **Hämta** (`meta.mjs`): varje konto i `konfig.json` → ACTIVE-annonser + allt
   med spend senaste 3 dygnen → inläggen (`creative.effective_object_story_id`)
   → en sidtoken per Facebook-sida → kommentarerna via Graphs **batch-API**, 50
   inlägg per anrop, `filter=stream` (svaren kommer med), `since=` förra
   hämtningen minus 3 h. Dubbletter bort på id: flera annonsinlägg kan dela EN
   tråd (34 av 217 kommentarer, mätt 2026-09-24).
2. **Maskera** (`maska.mjs`): `message_tags` → `@…`, e-post → `ka***@gmail.com`,
   telefon → `[telefon]`. Meta ger aldrig avsändaren (`from` saknas i svaret).
3. **Klassa** (`klassa.mjs`, regler, sv/nb/da/fi/en): 🔴 allvarligt (ej
   levererat, bluff-anklagelse, hot om anmälan, fara, spam/länk, missnöjd
   köpare) → 🟡 invändning (samma klusternamn som `tools/annonskommentarer.mjs`)
   → 🔵 köpfråga → övrigt (beröm, taggade vänner).
4. **Koppla** (`koppla.mjs`): verksamhet ur landningslänkens domän (där köpet
   bokförs) → sidan → kampanjnamnet → kontot. Länk och sida som säger olika
   verksamheter = **⛔ fel sida/länk** i rapporten. Prefix/vinkel/format ur
   annonsnamnet, marknad ur namnets kod eller länkens språkprefix (`/nb` = NO).
5. **Sammanställ** (`samla.mjs`): per verksamhet — allvarliga, obesvarade
   köpfrågor (toppnivå, `comment_count` 0), invändningar per produkt (nya / 14
   dagar / andel), aktiva OB-annonser per produkt, kommentarer med likes.
6. **Döm** (sessionen, inte skriptet): `output/<datum>.dom.json` med åtgärd per
   🔴, leads med belägg, svarsförslag med fakta ur produktsidan.
   `kontrolleraDom` stoppar en lead utan belägg eller med ett påhittat id.
7. **Rapportera** (`rapport.mjs`): `rapporter/<datum>.md` (svenska),
   `leads.md` (nyaste överst, `kalla=voc`), en engelsk post per verksamhet i
   Discord `#ad-comments` (kanalen skapas med en förklaring första gången).
   Kundens ord står i backticks — engelskaspärren räknar dem inte.
8. **Minnet sist**: `logg/<månad>.jsonl` + `lage.json` skrivs först när
   rapporten finns. Dör körningen före det hämtas samma kommentarer igen.

## Filer

| Fil | Committas | Vad |
|---|---|---|
| `konfig.json` | ✅ | Konton, domäner, sidor, produktmappar, Discord — facit för verksamheten |
| `lage.json` | ✅ | Senaste hämtning + sedda id:n (21 dagar) |
| `logg/<ÅÅÅÅ-MM>.jsonl` | ✅ | En rad per kommentar, maskerad och klassad. Trenden räknas ur den |
| `rapporter/<datum>.md` | ✅ | Dagens svenska rapport |
| `leads.md` | ✅ | Leads för `/cs` (bockas av när de används) |
| `output/` | ❌ gitignorerad | Rådata + sessionens dom för dagen |

## Läget vid bygget (mätt 2026-09-24)

- `META_ACCESS_TOKEN` har `pages_read_engagement` och når fem konton
  (MagiBorsten, NO, DK/OPS, UK, FI) och tre sidor med annonser: Bäverbutiken.se,
  Beverbutikken och CaraShell. 72 timmar: 217 kommentarer, ~1,5 minut.
- **Oläst:** sidan `1317870104733246` (Majavakauppa, alla 34 FI-annonser) —
  token:en saknar sidrollen. **Matstrumpor** (`730973156224390`) läses bara när
  `META_ACCESS_TOKEN_MATSTRUMPOR` finns i miljön. Båda står i varje rapport
  med orsak, aldrig som noll.
- `?ids=a,b,c` är avvecklat ("deprecated in v26.0+", även mot v21.0) — därav batch-API:t.
- Meta visar inte VEM som svarat i en tråd, så "obesvarad" betyder att ingen
  alls svarat (`comment_count` 0).

## Regler som sitter i koden

- Ingen kommentar skrivs, döljs eller raderas — det finns inget sådant anrop i koden.
- En sida/ett konto som inte går att läsa rapporteras med orsak, aldrig som noll.
- 🆕 (ny invändning) visas först när loggen har tidigare körningar — första dagen är allt nytt.
- En lead måste ha belägg ur loggen; ett svarsförslag måste ha `fakta`.
- Discord-pingar låses med `allowed_mentions` till VA:ns id (`bonus/personer.json`),
  så ett citerat `@everyone` pingar ingen. VA:n pingas bara vid kundärenden.
