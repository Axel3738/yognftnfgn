# Prompt: bygg speglingens rutiner (kontot `claude5@stonebite.org`)

Speglingen är byggd och mergad till `main` 2026-09-18 (PR #93 + två rättningar).
Det som återstår är att **bygga de två rutinerna**, och de måste byggas på det
konto där CaraShells övriga rutiner redan ligger — `claude5@stonebite.org`.
Härifrån (`subscriptions@stonebite.org`) syns de inte: `list_triggers` är tom.

Klistra in allt nedanför linjen i en ny chatt på det kontot.

---

Läs CLAUDE.md först. Allt du behöver finns i `main`, inget ligger på en gren.

**Vad som är byggt (2026-09-18, Axels beslut):** Taköverdraget och Termoskyddet
briefas bara i **Bäverbutikens** teamspace. CaraShells egna briefronder är
pausade. Rutinen `/ops-spegla` tar varje rad i Bäverbutikens hub som är klar i
Sverige och översatt till Norge, laddar upp den **svenska** filen live i
CaraShells SE-kampanj och Bäverbutikens redan renderade **norska** version i
NO-kampanjen, kopierar raden till CaraShells hub så butikens US-rutin gör
engelskan, och flyttar källraden. Läs `.claude/commands/ops-spegla.md` — den är
facit.

Gör i ordning, och stoppa aldrig tyst.

## 1. Kolla att du sitter på rätt konto

`list_triggers`. Du ska se HeimGuard, TankGuard, DryTrek, AdventLane, TackleBay,
CaraShell och CatCabin. Ser du dem inte sitter du på fel konto — säg det och
avbryt. **Bygg aldrig en rutin du inte kan se i `list_triggers` i samma körning**
(CLAUDE.md, lärdomen från CaraShell och CatCabin).

## 2. Kolla att Axel har lagt in de två stegen i Notion

```
node tools/ops-spegla.mjs --kallor
node tools/ops-spegla.mjs carashell/takskyddet
```

Den andra raden läser kön och säger högst upp om källhubben saknar
statusalternativen `CaraShell SE ready to be active` och
`CaraShell EN ready to be active`. **Saknas de: bygg ingenting.** Skriv i stället
Axels uppgift sist i svaret, numrerad, med exakt stavning — Notions API kan inte
skapa status-alternativ, det är hans klick i hubbens `Status`-kolumn.

Samma koll för `carashell/termoskyddet` (källhubben är "BÄVER Termoskyddet för
Husbil").

## 3. Bygg de två rutinerna

Exakt enligt `.claude/commands/rutin.md`. Tiderna räknar skriptet ut:

```
node factory/rutin.mjs --tider carashell/takskyddet
node factory/rutin.mjs --tider carashell/termoskyddet --flerprodukt
```

| Produkt | Svensk tid | Cron sommar | Cron vinter |
|---|---|---|---|
| `carashell/takskyddet` | 16:45 | `45 14 * * *` | `45 15 * * *` |
| `carashell/termoskyddet` | 16:55 | `55 14 * * *` | `55 15 * * *` |

För var och en:

```
node factory/rutin.mjs --tid <tid> --kommando "/ops-spegla <nyckel>" --butik <nyckel>
```

Följ utskriften: `create_session` (repot som källa, `outcome_branch: "main"`,
taggarna ur utskriften) → `create_trigger` med `persistent_session_id` →
`list_triggers` igen och visa raden. Inga connectors — allt går via env-nycklar.

## 4. Kör efterjusteringen EN gång, per produkt

Raderna som blev klara innan stegen fanns ligger kvar i sina gamla statusar.
Mätt 2026-09-18: Taköverdraget hade 18 rader i `Translation in review`,
Termoskyddet 16 i `SE-ACTIVE to be translated` (de senare tar Bäverbutikens
egen NO-rutin först — rör dem inte).

```
UT=factory/output/carashell/takskyddet/spegla-$(node -e "import('./factory/register.mjs').then(m=>console.log(m.svenskDatum()))")
node tools/ops-spegla.mjs carashell/takskyddet --fran "Translation in review" --kor --ut $UT --torr
node tools/ops-spegla.mjs carashell/takskyddet --fran "Translation in review" --kor --ut $UT
```

Torrt först, läs utskriften rad för rad, sedan skarpt. Mätt i torrkörningen
2026-09-18: 15 rader, 13 gröna, 2 stoppade för att copyn säger
"recensioner på baverbutiken.se" — de två ska stoppas, det är regeln som
fungerar. Varje uppladdning tar ett par minuter; hela körningen tar en timme.

Rapportera per rad: speglad / hoppad med skäl / fel med skäl.

## 5. Skriv upp rutinerna och pusha

Raden "16:20 Speglingen" i CLAUDE.md:s rutintabell säger i dag att rutinerna
**inte** är byggda. Byt ut den texten mot trigger-id, session-id och byggdatum —
men bara för det du själv sett i `list_triggers`. Committa och pusha till `main`.

## Definition of done

- [ ] Rätt konto verifierat med `list_triggers`
- [ ] Båda statusstegen finns i båda Bäver-hubbarna — annars ingenting byggt och Axels uppgift skriven sist
- [ ] Två rutiner byggda, var och en sedd i `list_triggers` efteråt
- [ ] Efterjusteringen körd torrt och sedan skarpt, varje rad redovisad
- [ ] CLAUDE.md uppdaterad med riktiga id:n, committad och pushad till `main`
- [ ] Svar till Axel: kort, hans uppgifter sist och numrerade
