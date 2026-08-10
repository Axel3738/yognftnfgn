# HANDOFF — ta över bygget av Bäverbutikens Creative Strategy OS

Detta dokument finns för att en **ny Claude-session på ett annat konto** ska kunna
fortsätta bygga utan att ha varit med i chatten där systemet byggdes.

Läs detta först, sedan `CLAUDE.md`, sedan `docs/os/ACTIONPLAN.md`.

---

## 1. Var systemet ligger

| | |
|---|---|
| Repo | `Axel3738/yognftnfgn` |
| Branch | `claude/bäverbutiken-creative-kpi-0g4dn9` |
| Default-branch | **finns inte** — repot har 22 branches, alla `claude/*`. Checka alltid ut branchen ovan explicit. |

```bash
git clone <repo> && cd yognftnfgn
git checkout claude/bäverbutiken-creative-kpi-0g4dn9
```

Node 22, **noll npm-beroenden**. Inget att installera.

```bash
node pipeline/quota.mjs                  # brief-kvoten (mål nr 1)
node dashboard/notion-import.mjs         # Notion-rader → tasks
node dashboard/build.mjs                 # bygger dashboard/index.html
node dashboard/cli.mjs status            # läget i terminalen
node --test dashboard/test/rules.test.mjs   # 17 tester, ska vara gröna
```

`dashboard/index.html` är självbärande — öppna den i en webbläsare, inget konto behövs.

---

## 2. Vad systemet är

Managern (**Anna Odhner**, icke-teknisk, Excel/HR-bakgrund) ska kunna driva
creative strategy för Bäverbutiken helt själv genom att skriva slash-kommandon.
Axel ska vara utfasad **före 31 augusti 2026**.

Tre lager:

1. **`.claude/commands/`** — managerns gränssnitt. 13 kommandon. Detta är produkten.
2. **`docs/os/`** — SOP:erna och analysmetoden som kommandona lutar sig mot.
3. **`dashboard/`** — spårningslagret. Notion är sanningen för *vad* som finns;
   dashboarden lägger på *vem, när, hur mycket*.

**Endast Bäverbutiken.** Ad account MagiBorsten `1867947880635861` (SEK).
Mastern/Grillkliniken/SnarkLös är en annan verksamhet — allt sådant i `docs/` och
`pipeline/` (utom `pipeline/quota.mjs`) är legacy och ska inte röras.

---

## 3. Regler som INTE får brytas

Dessa är inte stilpreferenser. Var och en finns för att en tidigare chatt gjorde fel.

1. **Enmetriks-domar är förbjudna.** Rangordna alltid på vinstbidrag
   `(break-even-CPA − CPA) × köp`. Aldrig på ROAS eller CPA ensamt.
   En chatt dömde ut top spendern för låg ROAS — den stod för ~50 % av all vinst.
   Följ `docs/os/ANALYSMETOD.md` punkt för punkt.
2. **Kill-beslut mäts mot break-even, aldrig mot target.**
3. **Ingen dom under 300 kr spend eller 3 köp.** Säg att data saknas istället.
4. **Meta-fältnamn:** `amount_spent`, `actions:omni_purchase`,
   `cost_per_omni_purchase`, `purchase_roas`. INTE `spend`/`purchases`.
   `omni_purchase_values` är buggig — den returnerade intäkt **100× för lågt på 5
   av 8 rader**. Korskolla alltid mot `amount_spent × purchase_roas`.
5. **Modellpolicy:** all slutgiltig ad copy, svenska manusrader och voiceovers
   skrivs av en subagent med `model: "sonnet"` (eller `"haiku"` för bulk).
   Strategi, analys och briefstruktur görs alltid av huvudsessionen. Aldrig tvärtom.
6. **Levererat ≠ godkänt.** Bara godkända creatives räknas mot kvoten.
7. **Hitta aldrig på siffror.** Allt kommer ur Notion, Meta, Shopify eller
   `products/products.json`.
8. **Korta svar till managern.** Inga bibelsvar. Axel har sagt det två gånger.

---

## 4. Verkliga data — hitta inte på egna

### Notion-status betyder detta

| Status | Betydelse |
|--------|-----------|
| `In progress` | Första versionen, jobbas på just nu |
| `In progress 2` | **REVISION** — annonsen underkändes och görs om. Inte "längre kommen". |

Full tabell i `docs/os/NOTION-FORMAT.md`.

### Slack — workspace Stonebite

| Kanal | ID | Vad |
|-------|-----|-----|
| `#bäver-scaling-products` | `C0BNJC83DMF` | De 4 skalningsprodukterna + dagsrapporter före 21:30 |
| `#video-editors` | `C0BGQBGDZBQ` | Hela redigerarteamet, även produkter utanför detta OS |

### Människorna

| Namn | Roll | Slack | Notion |
|------|------|-------|--------|
| Axel Odhner | admin | `U0B3MADDQR5` | ✅ |
| Josh Naelga | editor | `U0BHPPC8X16` | ✅ |
| Annabelle Gonzales | editor | `U0BGP6ERDV1` | ❌ |
| Gilz Bruce Biazon | editor | `U0BGVDLRH42` | ❌ |
| Carl Vicente | editor | `U0BGVDQH7PU` | ❌ |
| Anna Odhner (**managern**) | manager | ❌ finns inte i Stonebite | ❌ |

⚠️ **Annabelle Gonzales heter "Anna" i Slack. Hon är INTE Anna Odhner.**
Två olika personer, och den ena ska godkänna den andras arbete. Blanda inte ihop dem.

---

## 5. Vad som är byggt och fungerar

- 13 slash-kommandon i `.claude/commands/`
- Kvotskriptet med 10 %-tröskeln vid ≥5000 kr/dag (`pipeline/quota.mjs`)
- Analysmetoden (`docs/os/ANALYSMETOD.md`) — den som stoppar enmetriks-domar
- SOP-01 t.o.m. SOP-07 + Editor-SOP på engelska
- Dashboard: import från Notion, KPI-beräkning, CLI, statisk HTML-build
- 17 tester, gröna
- Notion-koppling mot 4 creative hubs (collection-ID i `products/products.json`)
- Slack-koppling mot Stonebite — läsbar och skrivbar
- Riktiga break-even-tal från Axels COGS-beräkning 2026-08-05

Aktuellt läge vid överlämning: **105 annonser, 89 godkända, 16 öppna**
(Motorhöljet 11 varav 9 revisioner, Axelbältet 5).

---

## 6. Vad som återstår — börja här

Ordnat efter vad som faktiskt blockerar. **Fråga Axel om 1, 2 och 5** — de kräver
beslut eller åtkomst som ingen Claude-session kan lösa själv.

### 1. Anna Odhner finns inte någonstans 🔴
Hon är managern som ska ta över hela systemet, men hon finns varken i Stonebite
eller i Notion. Hela överlämningen står och faller på detta.
→ Axel måste bjuda in henne. Sedan: lägg in Slack-ID och Notion-ID i
`dashboard/data/team.json`.

### 2. Tre redigerare saknas i Notion 🔴
Annabelle, Gilz och Carl finns i Slack men inte i Notion. Därför saknar
**63 av 105 annonser `Ansvarig`**, och per-redigerare-KPI:er går inte att räkna
för någon utom Josh. Dashboarden är halvblind tills detta är löst.
→ Axel bjuder in dem till Notion → fyll `notionUserId` i `team.json` → kör
`/dashboard` så löser sig resten av sig självt.

### 3. Sätesöverdragarens target-CPA är en gissning 🟡
`target_cpa_sek: 300` i `products/products.json` är ett platshållarvärde satt av
en tidigare chatt, inte Axels siffra. Break-even (478 kr) är däremot verklig.
Kvoten för produkten räknas alltså på fel tal.
→ Fråga Axel efter rätt target-CPA.

### 4. SOP-06 har hål 🟡
Processteg 1–3 och kriterierna för "vilken produkt testar vi härnäst" saknas —
de fanns i en Loom-inspelning som aldrig skrevs ner.
→ Fråga Axel, skriv in i `docs/os/SOP-06-produkttest.md`.

### 5. Ingen `main`-branch 🟡
22 branches, alla `claude/*`. Varje ny session måste få branchnamnet manuellt.
Axel har fått förslaget att skapa `main` men inte svarat ännu.
→ **Skapa inte `main` utan att fråga honom först.**

### 6. Systemet har aldrig körts skarpt av managern 🔴
Ingen har gått igenom en hel dag: `/plan` → redigerarna jobbar → `/rapport` →
`/granska` → `/checkin` → `/dashboard`. Allt är byggt men otestat i verkligheten.
→ Detta är det som avgör om OS:et faktiskt fungerar. Prioritera det så snart
punkt 1 och 2 är lösta.

---

## 7. Connectors som måste kopplas på det nya kontot

Dessa följer **inte** med repot och måste kopplas separat:

- **Notion** — de 4 creative hub-databaserna
- **Slack** — workspace **Stonebite**. ⚠️ Ett annat Slack-workspace ger tyst noll
  träffar, inte ett felmeddelande. Verifiera med
  `slack_search_channels("bäver")` — får du inget svar sitter du på fel workspace.
- **Meta Ads** — ad account MagiBorsten `1867947880635861`
- **Shopify** — bäverbutiken.se, för verklig AOV

Utan dessa går det att bygga och testa koden, men inte att hämta data.

---

## 8. Artifact-länken

Dashboarden är publicerad på
`https://claude.ai/code/artifact/c5de7201-3df5-4944-9b90-6c7f19d37d3b`
— den länken tillhör **Axels konto**. Ett annat konto som publicerar får en egen
URL och kan inte skriva över hans. Bygg gärna om `dashboard/index.html` och
committa den; publicera bara om Axel ber om det.

---

## 9. När arbetet är klart på det andra kontot

Committa och pusha till `claude/bäverbutiken-creative-kpi-0g4dn9`.
Skriv sedan här i filen, under en ny rubrik **"Ändrat i session <datum>"**:
vad som gjordes, vad som återstår, och vad nästa session behöver veta.

Det är så nästa session slipper börja om.
