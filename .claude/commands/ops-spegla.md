# /ops-spegla – Speglingen: Bäverbutikens hub → EN OPS-butik (16:20 + plats, varje dag)

Argument: `$ARGUMENTS` — produktens nyckel i OPS-registret. `--torr` = allt
utom uppladdning och Notion-skrivning. `--fran "<status>"` = efterjustering
(se steg 1).

```
/ops-spegla carashell/takskyddet
/ops-spegla carashell/termoskyddet --torr
```

CONNECTORS: inga. Nycklar: `NOTION_TOKEN`, `META_ACCESS_TOKEN`,
`DISCORD_BOT_TOKEN`. Använd ALDRIG `mcp__Notion__*`. Ingen HeyGen, ingen
kie.ai — här översätts ingenting.

**Vad rutinen gör (Axels beslut 2026-09-18):** produkten briefas bara i
**Bäverbutikens** hub. Varje rad där som gått hela vägen (live i Sverige,
översatt till Norge av Bäverbutikens `/oversatt NO`) hamnar i steget
**`<Brand> SE ready to be active`**. Rutinen tar de raderna och gör exakt
det `/ops-oversatt` gör — fast utan att översätta: den **svenska** filen
laddas upp **live** i butikens SE-kampanj i OPS-kontot, Bäverbutikens redan
renderade **norska** version i NO-kampanjen (0 krediter), raden kopieras
till butikens egen hub i `SE-ACTIVE to be translated` så butikens US-rutin
gör engelskan, och källraden flyttas till **`<Brand> EN ready to be active`**.
När US-annonsen finns i Magiborsten UK sätter rutinen källraden till
**`Approved`**. Butikens egna briefronder är pausade (`briefantal … paus`).

Allt sitter i `tools/ops-spegla.mjs`. Speglingen står i `register.json`
(`node factory/register.mjs spegling <nyckel> <bäver-hub-id> <namn>`), och
statusnamnen kommer därifrån — skriv dem aldrig ur minnet:
`node tools/ops-spegla.mjs --kallor`.

## Järnregler

1. **Priset.** Creativen bär Bäverbutikens pris (briefens "Price exactly …",
   annars Bäverbutikens produktsida). Avviker det > 20 % från butikens eget
   pris (läst live) laddas inget upp — kommentar på källraden, status orörd,
   raden under ACTION NEEDED. Samma för NO mot butikens NO-pris. Okänt pris
   är aldrig grönt. Verktyget dömer; du läser domen.
2. **Brandet i texten.** Nämner copyn eller briefens annonstext Bäverbutiken
   stoppas raden. En OPS-butik säger aldrig vilken butik den är.
2b. **Brandet i bilden — slutkortet** (`factory/bildbrand.mjs`, 2026-09-20).
   Regel 2 läser text; den ser inte de sista sekunderna. Nio av källans
   videor slutar med ett 3,0 s slutkort och åtta av dem bär Bäverbutikens
   logga — de gick live i Norge med loggan kvar. Både den svenska och den
   norska filen granskas nu FÖRE uppladdning, ~0,7 s per video. Tre domar:
   `ren` (inget kort) laddas upp tyst; `slutkort-utan-brand` laddas upp men
   **namnges i rapporten** (kortet kan vara på fel språk för marknaden);
   `slutkort-med-brand` (butiksnamn eller domän i bild, **även butikens
   eget** — PD_5_H1 bar "carashell.se") laddas **inte** upp: namngiven rad
   under ACTION NEEDED, kommentar på källraden, status orörd. En video som
   inte gick att läsa blir `okand` — laddas upp, men namnges. **Inget som
   redan är live rörs** (Axels beslut 2026-09-15); spärren gäller före
   uppladdning och stoppar alltid bara sin egen rad, aldrig körningen.
3. **Rätt konto.** SE och NO i OPS-kontot `915422744950975`, via
   `tools/ops-till-meta.mjs` (kastar på allt annat). Bäverbutikens konton
   LÄSES bara (copy + NO-fil). US rörs inte här — det är `/ops-oversatt
   --marknad US`.
4. **Källkön är ALDRIG `SE-ACTIVE to be translated`.** Den är Bäverbutikens
   NO-kö. Verktyget vägrar.
5. **PAUSED med spend är ett beslut.** Uppladdaren laddar aldrig upp i en
   avvecklad kampanj; ingenting aktiveras utom det körningen skapade.
6. **Discord på engelska** i butikens server, kanal `#annons-uppladdning`.
   Axel pingas bara under `🔴 ACTION NEEDED`.
7. Kör klart utan att fråga. Axels uppgifter sist, numrerade.

## Gör i ordning

Färsk `main`: `git fetch origin main && git checkout main && git reset --hard origin/main`.
`IDAG` = `node -e "import('./factory/register.mjs').then(m=>console.log(m.svenskDatum()))"`.
`UT` = `factory/output/<butik>[/<produkt>]/spegla-$IDAG` (media, gitignorerat).

### 1. Kön — läs den först
```
node tools/ops-spegla.mjs <nyckel>
```
Utskriften visar källhub, butikens hub, SE-/NO-kampanj, båda priserna och
varje rad med dom (✅/⛔ + skäl). Läs den innan något skrivs.

- **`⛔ Källhubben saknar statusalternativen …`** ⇒ steget finns inte i
  Notion än. Inget kan speglas. Rapportera under ACTION NEEDED: Axel lägger
  till båda alternativen i hubbens `Status`-fält (`•••` på kolumnen → Edit
  property → Add option) — exakt stavning ur `--kallor`. Avsluta med DoD.
- **Tom kö** ⇒ "Nothing to mirror", DoD, klart. Ingen Discord-ping.
- **Efterjustering** (rader som var NO-klara innan steget fanns — Taköverdraget
  hade 18 i `Translation in review` 2026-09-18): kör EN gång med
  `--fran "Translation in review,Approved"`. Rader som redan speglats hoppas
  över på namnet (`finns redan`), så det går att köra om.

### 2. Speglingen
```
node tools/ops-spegla.mjs <nyckel> --kor --ut $UT --torr
node tools/ops-spegla.mjs <nyckel> --kor --ut $UT
```
Torrt först: läs att varje rad får rätt spegelnamn (`CaraShellRoof_BOF_103_1`
för `Takoverdrag_BOF_3_1`), rätt kampanj och rätt adset, och att
uppladdaren svarar `ok`. Sedan skarpt. Per rad, i ordning: SE live → NO live
(om NO-versionen finns och priset håller; annars översätter butikens
NO-rutin själv) → rad i butikens hub (kallout + briefen kopierad + SE- och
NO-filen bifogad, status `SE-ACTIVE to be translated`) → källraden får
kommentar med annons-id:n och status `<Brand> EN ready to be active`. Sist:
källrader i `<Brand> EN ready to be active` vars US-annons finns → `Approved`.

Resultatet skrivs till `$UT.json` och Discord-jobbet till `$UT.discord.json`.
Rader med `utfall: fel` (Meta nekade, Notion nekade) står med skälet —
rätta och kör om; verktyget hoppar det som redan gjorts.

### 3. Rapport, logg, push
```
node tools/discord-rapport.mjs --jobb $UT.discord.json
node factory/register.mjs log <nyckel> <antal speglade> $IDAG
```
Rad i `products/<butik>[/<produkt>]/batch-log.md`: datum, vilka källrader
som speglades (källnamn → spegelnamn, SE/NO-id), vilka som stoppades och
varför. Committa `$UT.json`, `$UT.discord.json`, `register.json`, batch-log —
aldrig media. Pusha till `main`.

## DEFINITION OF DONE

- [ ] Färsk `main`; spegling läst ur registret; källhub och butikens hub hittade, ingen i papperskorgen
- [ ] Båda statusstegen finns i källhubben — annars redovisat under ACTION NEEDED med exakt stavning
- [ ] Kön läst och visad; varje rad redovisad: speglad / hoppad med skäl / fel med skäl
- [ ] Pris kollat per rad (creativen mot butikens SE-pris, NO mot NO-pris); avvikelse > 20 % eller okänt ⇒ inte uppladdad
- [ ] Ingen rad som nämner Bäverbutiken uppladdad
- [ ] Torrkörning före skarp; tillbakaläst ACTIVE/ACTIVE i rätt kampanj; rätt konto
- [ ] Rad skapad i butikens hub med filer bifogade; källraden kommenterad + flyttad till `<Brand> EN ready to be active`
- [ ] Källrader med US uppe flyttade till `Approved`
- [ ] Discord-rapport på engelska i `#annons-uppladdning`; ping bara under ACTION NEEDED
- [ ] Logg, batch-log, commit + push till `main`
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
