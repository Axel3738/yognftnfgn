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
https://discord.com/api/oauth2/authorize?client_id=1543628123289952277&permissions=84992&scope=bot
```

Den ber om fyra saker: se kanaler, skicka meddelanden, läsa historik, bädda in
länkar. Inget mer — den kan inte radera eller ändra något i servern.

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
| vad som helst | Boten svarar med verksamhetens data i huvudet |
| `!ping` | "Vaken. Modell: … Uppe i N min." |
| `!glöm` | Nollställer konversationen i den kanalen |

Den minns de senaste 8 turerna per kanal i 2 timmar. Byter du ämne helt är
`!glöm` snabbare än att förklara.

---

## Frivilliga inställningar

Läggs in som Variables i Railway om du vill begränsa boten.

| Variabel | Vad |
|---|---|
| `DISCORD_KANALER` | `skalning,allmänt` — boten svarar bara i de kanalerna. Tom = alla den ser |
| `DISCORD_AGARE` | ditt Discord user-id — då är det bara du som kan prata med den |
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
Discord  ──►  index.js   (tar emot, kö, typing, delar långa svar)
                 │
                 ▼
              claude.js  (Opus + prompt-cache + verktygsloop)
                 │
                 ▼
              repo.js    (GitHub Contents API — alltid färska filer)
```

Boten läser **aldrig** containerns filsystem. Railway bygger bara `bot/`, och
även om den byggde hela repot skulle filerna frysas vid deploy. GitHub-API:t
ger alltid det som ligger på grenen just nu.

`dela.js` är en medveten kopia av splittern i `agent/discord-post.mjs` —
`bot/` måste vara självbärande eftersom Railway bara bygger den mappen. Båda
kopiorna har egna tester.

Rutinerna postar via `agent/discord-post.mjs`, inte via boten. Den vägen kräver
`DISCORD_BOT_TOKEN` i rutinens environment.

Tester: `cd bot && npm test` (14 st).
