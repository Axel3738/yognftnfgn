# /plan – Lägg dagens plan för redigerarna

> **Innan du frågar användaren något:** fråga dig själv om det finns ett sätt att
> ta reda på svaret som du inte provat än — repo + git-historik, Drive, Notion,
> Meta, Shopify, product sheetet. Fråga bara när svaret kräver ägaren (pris,
> rabatt, target-CPA). Den som kör kan vara helt icke-teknisk: en fråga i taget,
> enkel svenska utan fackord, och ge alltid ett rekommenderat svar att säga ja till.

Argument: `$ARGUMENTS` — valfritt datum och/eller redigerare.
Exempel: `/plan` · `/plan maria` · `/plan 2026-08-07`

Detta är managerns morgonrutin. Den ska ta under tio minuter.

## Gör följande

### 1. Räkna ut vad som behövs
- Kör `node pipeline/quota.mjs` — vilka produkter ligger 🔴 och hur mycket?
- Kör `node dashboard/cli.mjs status` — vad släpar från igår (blockerat, sent, oavslutat)?
- Räkna hur många creatives som saknas per produkt för att komma ikapp kvoten.

### 2. Föreslå fördelningen
Bygg ett förslag per redigerare och visa det som tabell innan något skapas:

| Redigerare | Tasks | Creatives | Produkter | Motivering |

Regler:
- **Oavslutat från igår går först** — nya tasks ovanpå en släpande dag skapar bara mer försening.
- Respektera `defaultDailyCreativeTarget` i `dashboard/data/team.json`. Lägg inte 6 creatives på någon vars mål är 3.
- Blockerade tasks räknas inte som kapacitet — de äter tid utan att leverera.
- Ligger en produkt 🔴 flera cykler i rad: säg det rakt ut, det är ett kapacitetsproblem och inte något managern löser genom att fylla på fler tasks.

### 3. Skapa tasksen
För varje ny task:
```
node dashboard/cli.mjs new --title "..." --product <id> --editor <id> \
  --type <tasktyp> --brief <url> --creatives <n> --priority <high|normal|low> \
  --due YYYY-MM-DD --as anna
```
**Brief-länk är obligatorisk.** Finns ingen brief: skapa den först med `/cs` eller `/koncept` — en task utan brief blir alltid en revision.

### 4. Publicera planen
```
node dashboard/cli.mjs plan <editor> --as anna --notes "..."
```
Skriv en kort not till den som har en högprio-task ("Start with AXE-013 — it ships first").

### 5. Bygg dashboarden och skriv morgonmeddelandena
- `node dashboard/build.mjs`
- Skriv ett Slack-utkast per redigerare på engelska enligt mallen i
  `docs/os/SOP-07-dashboard.md`. **Skicka inte** utan managerns godkännande.

## DEFINITION OF DONE
- [ ] Kvot och släpande arbete kontrollerat innan planen lades
- [ ] Fördelningsförslag visat som tabell med motivering
- [ ] Alla tasks har brief-länk
- [ ] Ingen redigerare över sitt dagsmål utan att det sagts uttryckligen
- [ ] Planer publicerade och dashboarden ombyggd
- [ ] Morgonmeddelanden skrivna som utkast, inte skickade
