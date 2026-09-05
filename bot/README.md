# Bävern — Discord-boten

En riktig realtidsbot. Du skriver i Discord, den svarar direkt, och den kan
verksamhetens siffror: CLAUDE.md, produktkartan, senaste budgetbeslutet per
kampanj och varje produkts `dna.md`.

**Den är läsande.** Den ändrar aldrig budgetar, Notion, Drive eller repot. Det
gör Skalningskungen-rutinen och din Claude Code-chatt.

---

## Det här behöver du innan du börjar

Tre nycklar. Två har du, en behöver du hämta.

| Nyckel | Var du hämtar den |
|---|---|
| `DISCORD_BOT_TOKEN` | Har du redan (Developer Portal → Bot → Reset Token) |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys → **Create Key** |
| `GITHUB_TOKEN` | github.com → Settings → Developer settings → Personal access tokens → **Fine-grained** |

**GitHub-token:** välj `Only select repositories` → `yognftnfgn`, och under
Permissions → Repository permissions → **Contents: Read-only**. Inget annat.
Utan den får boten bara 60 filläsningar i timmen och slutar svara mitt på dagen.

⚠️ Ingen av de tre får klistras in i en fil i repot. De skrivs bara in i
Railway. Repot är publikt tills du gjort det privat.

---

## Steg 1 — Slå på MESSAGE CONTENT INTENT

Utan den här kommer meddelanden in tomma och boten ser död ut trots att den kör.

1. discord.com/developers/applications → din app
2. **Bot** i vänsterspalten
3. Scrolla till *Privileged Gateway Intents*
4. Slå på **MESSAGE CONTENT INTENT** → **Save Changes**

## Steg 2 — Bjud in boten till servern

Öppna länken, välj din server, godkänn:

```
https://discord.com/api/oauth2/authorize?client_id=1543628123289952277&permissions=268520464&scope=bot
```

Den ber om sex saker: se kanaler, skicka meddelanden, läsa historik, bädda in
länkar, **hantera kanaler** och **hantera roller**. De två sista behövs bara
för `!bygg`. Den ber aldrig om Administratör och kan inte radera en kanal —
`!bygg` arkiverar i stället.

Vill du inte ge den de två sista: ta bort dem i Discords ruta när du bjuder in.
Allt utom `!bygg` fungerar ändå.

## Steg 3 — Lägg upp den på Railway

1. railway.com → **New Project** → **Deploy from GitHub repo** → `yognftnfgn`
2. Vänta tills den byggt klart (den kommer misslyckas — det är rätt, se punkt 3)
3. **Settings** → *Source* → **Root Directory** → skriv `bot` → Save
4. **Variables** → **New Variable**, en i taget:

   | Namn | Värde |
   |---|---|
   | `DISCORD_BOT_TOKEN` | din bot-token |
   | `ANTHROPIC_API_KEY` | din Anthropic-nyckel |
   | `GITHUB_TOKEN` | din GitHub-token |

5. **Deploy**

Railway kommer säga att tjänsten inte lyssnar på någon port. Det är rätt — en
Discord-bot ringer upp Discord, ingen ringer upp den.

## Steg 4 — Kolla att den lever

Skriv `!ping` i en kanal där boten är med. Den ska svara med modell och hur
länge den varit uppe. Gör den inte det: öppna Railway → **Deployments** →
**View Logs**. Första raden säger vad som saknas.

---

## Kommandon i chatten

| Du skriver | Vad som händer |
|---|---|
| `@Bävern` + vad som helst | Boten svarar med verksamhetens data i huvudet |
| svar på ett av botens inlägg | Samma sak — den ser att du pratar med den |
| vad som helst, utan tagg | Ingenting. Den lägger sig inte i teamets samtal |
| `!bygg <vad du vill ha>` | Bygger om servern. Visar planen först, du trycker Kör |
| `!ping` | "Vaken. Modell: … Uppe i N min." |
| `!glöm` | Nollställer konversationen i den kanalen |

Den minns de senaste 8 turerna per kanal i 2 timmar. Byter du ämne helt är
`!glöm` snabbare än att förklara.

---

## `!bygg` — servern på beskrivning

Du skriver hur du vill ha det. Boten svarar med en lista på exakt vad som
händer, och två knappar. **Ingenting sker förrän du trycker Kör.**

```
!bygg en kanal för varje skalningsprodukt under en ny kategori Produkter
!bygg döp om gammalt-skrap till idébank och flytta den till Produkter
!bygg arkivera alla kanaler vi inte använt sedan i somras
```

Fyra spärrar, och de går inte att prompta bort:

1. **Ingenting raderas, någonsin.** Vill du bli av med en kanal arkiveras den:
   flyttas till kategorin *arkiv* och låses för nya inlägg. Historiken finns
   kvar och kanalen går att flytta tillbaka.
2. **Rutinernas kanaler är skyddade.** `skalning`, `ads-to-edit`,
   `new-products-coing-out` och `allmänt` kan inte döpas om, flyttas eller
   arkiveras — då hade rutinen postat i tomma luften utan felmeddelande.
   Listan läses ur `agent/discord.json`, så lägger du till en kanal där blir
   den skyddad automatiskt.
3. **Bara du kan trycka på din knapp**, och planen går ut efter 5 minuter.
4. **Allt som stryks redovisas.** Kom det med ett förslag boten inte fick köra
   står det under *Struket* med anledningen. En tyst bortsållad åtgärd ser ut
   som att den kördes.

Går ett steg fel fortsätter resten, och du får en lista på vad som gick och vad
som inte gick.

⚠️ Får du "Jag saknar rättigheten Hantera kanaler": gå till Serverinställningar
→ Roller, dra botens roll **högre upp** än de kanaler och roller den ska röra,
och slå på Hantera kanaler. Discord låter aldrig en bot ändra något som ligger
ovanför den i rollistan.

---

## Frivilliga inställningar

Läggs in som Variables i Railway om du vill begränsa boten.

| Variabel | Vad |
|---|---|
| `DISCORD_KANALER` | `skalning,allmänt` — boten svarar bara i de kanalerna. Tom = alla den ser |
| `DISCORD_AGARE` | ditt Discord user-id — då är det bara du som kan prata med den |
| `DISCORD_SVARA_ALLA` | `1` — boten svarar på allt i kanalen, som den gjorde förr. Tom = bara när den taggas |
| `GITHUB_GREN` | vilken gren den läser. Default är arbetsgrenen |

---

## Om något strular

| Symptom | Vad det betyder |
|---|---|
| Boten är online men svarar aldrig | MESSAGE CONTENT INTENT är avslagen (steg 1) |
| `disallowed intents` i loggen | Samma sak |
| "GitHub nekade läsning … Rate limit" | `GITHUB_TOKEN` saknas eller är fel |
| "GITHUB_TOKEN ser inte ut som en GitHub-token" | Fel värde inklistrat — riktiga börjar med `github_pat_` eller `ghp_` |
| Svaren kommer men är gamla | GitHub var nere; boten körde vidare på cachad data. Löser sig själv |
| Tjänsten startar om i loop | Läs första raden i Railway-loggen — den listar exakt vilken variabel som saknas |

---

## Så hänger det ihop

```
Discord  ──►  index.js   (tar emot, kö, typing, delar långa svar, knappar)
                 │
                 ├──►  claude.js  (Opus + prompt-cache + verktygsloop)
                 │         │
                 └──►  server.js  (!bygg: planera → validera → beskriv → utför)
                           │
                           ▼
                        repo.js   (GitHub Contents API — alltid färska filer)
```

Boten läser **aldrig** containerns filsystem. Railway bygger bara `bot/`, och
även om den byggde hela repot skulle filerna frysas vid deploy. GitHub-API:t
ger alltid det som ligger på grenen just nu.

`dela.js` är en medveten kopia av splittern i `agent/discord-post.mjs` —
`bot/` måste vara självbärande eftersom Railway bara bygger den mappen. Båda
kopiorna har egna tester.

Rutinerna postar via `agent/discord-post.mjs`, inte via boten. Den vägen kräver
`DISCORD_BOT_TOKEN` i rutinens environment.

I `server.js` är det `validera()` som är det viktiga. Den står mellan "Claude
föreslog något" och "servern byggdes om", och den är ren kod med egna tester —
hittar modellen på en åtgärdstyp som `radera` dör den där, inte i din server.

Tester: `cd bot && npm test` (29 st, inget nätverk).
