# /akut — Akutlarmet: det som bara Axel kan påverka, i Slack #urgent (varje timme)

Argument: `$ARGUMENTS` — inget = rutinen. `--torr` = mät och visa, posta inget,
skriv inget. `--dagligt` = tvinga de dagliga kontrollerna (tvister,
utbetalningar) i den här körningen.

```
/akut               rutinen (varje timme :28)
/akut --torr        se vad som skulle postas
/akut --dagligt     kör även tvistgraden och utbetalningarna nu
```

Uppdraget i en mening: **mät det som ingen annan än Axel kan göra något åt och
som slår direkt mot pengarna, och posta BARA det i Slack #urgent, en gång per
händelse, med hans klick numrerade.** Axels beställning 2026-09-27: "legit
akuta grejer som inte min VA, inte mina videoredigerare, ingen kan påverka
förutom jag … jag kommer att kolla den varje dag. Discorden vägrar jag kolla."

CONNECTORS: Slack — postningen går via `mcp__Slack__slack_send_message` till
kanalen i `akut/konfig.json` (`#urgent`, `C0C4MTQNMT7`, privat, bara Axel).
Allt annat läses via env-nycklar och REST: `META_ACCESS_TOKEN`,
`NOTION_TOKEN`, `SHOPIFY_*`. Finns en Slack-nyckel i miljön (se
`akut/README.md`) postar skriptet själv och steg 3 blir tomt.

## Vad som mäts (reglerna: `akut/kontroller.mjs`, trösklarna: `akut/konfig.json`)

| Larm | När | Varför bara Axel |
|---|---|---|
| Butiken svarar inte | sajten ger 5xx/timeout tre gånger, 402 (stängd av Shopify) eller lösenordssidan | Shopify-fakturan, domänen, butiksinställningen |
| Annonskontot | `account_status` ≠ aktivt, eller utgiftstaket nått | betalning och överklagan i Business Manager |
| Pengar brinner | en kampanj ≥ 5 000 kr i dag utan köp, eller ≥ 10 000 kr med ROAS under halva break-even | budgeten är hans (sessioner pausar aldrig hans annonser) |
| Pixeln | butiken har ≥ 15 ordrar i dag men Meta ser 0 köp på ≥ 2 000 kr | pixel/CAPI i Shopify-appen |
| Backend | stonebite.org svarar inte, kundtjänstboten är av eller kraschar (≥ 5 omstarter) | Railway och Squarespace |
| Rutin står still | rutinvakten (`stonebite/kallor/rutiner.mjs`) säger `saknas` | Routines-vyn på hans konton |
| Nyckel död | Meta 190, Notion 401, en Shopify-butik i drift som inte längre går att läsa | nya nycklar i Environments |
| Chargeback-graden | ≥ 0,75 % chargebacks på 30 dagar (Visa varnar vid 0,9 %) — dagligen | leverans och produkt, inte VA:ns svar |
| Utbetalning | en Shopify Payments-payout med status `failed` — dagligen | bankuppgifterna |

Butikerna som mäts är de med ordrar de senaste sju dygnen (snapshoten) plus
marknadsdomänerna (carashell.com) och `sajter_extra` (grillkliniken.se). En
nedlagd OPS-butik utan ordrar larmar aldrig.

## Järnreglerna

- **Läs-bara.** Pausar, ändrar och skapar ingenting i Meta, Shopify, Notion
  eller Railway. Larmet säger vad Axel ska klicka; det klickar aldrig själv.
- **Ett larm en gång.** Minnet `akut/data/larm.json` committas. Ett tillstånd
  (sajt nere, konto avstängt, rutin still) får ett "✅ Löst" när det är över —
  först då kan det larma igen. En händelse (pengar, pixel) bär datumet.
- **Aldrig "allt lugnt" på gissning.** Det som inte gick att mäta står som
  ⚠️ notering i rapporten till Axel — aldrig som tystnad i Slack.
- **Svenska i Slack.** Läsaren är Axel. Rubrik först, siffror, hans klick
  numrerade sist. Inga tankstreck.
- **Bara #urgent.** Kanalen är privat med flit: larmen bär spend och ROAS, och
  redigerarna får aldrig se spend. Posta aldrig larmet i en annan kanal.

## Gör i ordning

1. **Hämta main först** — spårningsrutinerna pushar varje timme, och snapshoten
   (`stonebite/data/snapshot.json`) ska vara färsk:
   ```bash
   cd /home/user/yognftnfgn && git pull --rebase origin main
   ```

2. **Mät:**
   ```bash
   node akut/kor.mjs $ARGUMENTS
   ```
   Rapporten säger per kontroll vad som mättes, `Larm: N nya · M lösta · K
   redan postade`, och skriver ut varje meddelande. `--torr` stannar här.

3. **Posta det som står i kön.** Skriver rapporten `ATT POSTA via
   Slack-connectorn` finns `akut/output/att-posta.json` med `kanalId` och
   meddelandena (`id`, `text`). För VARJE meddelande, ett i taget:
   - `mcp__Slack__slack_send_message` med `channel_id` = filens `kanalId` och
     `message` = meddelandets `text`, ordagrant — skriv aldrig om texten.
   - Lyckades det: `node akut/kor.mjs --postat <id>` direkt. Kvittera aldrig
     ett meddelande som inte gick iväg, och posta aldrig samma id två gånger.

   Saknas Slack-verktyget i sessionen: posta inget, låt filen ligga (nästa
   körning postar den) och skriv i rapporten att connectorn Slack måste kopplas
   på rutinen i Routines-vyn. Det är Axels klick.

4. **Committa minnet och pusha** (bara `akut/data/larm.json` — `akut/output/`
   är gitignorerad och ska aldrig läggas till):
   ```bash
   git add akut/data/larm.json
   git commit -m "Akutlarmet <YYYY-MM-DD HH:MM>: <N> nya, <M> lösta"
   git push -u origin main
   ```
   Nekas pushen: `git pull --rebase origin main` och försök igen (2 s, 4 s,
   8 s, 16 s). Minnet MÅSTE upp — annars postas samma larm nästa timme.

5. **Rapportera till Axel, kort, på svenska.** Inget nytt: en rad
   (`Akutlarmet 16:28: inget nytt. 7 sajter, 7 konton, backend ok.`). Nytt:
   vad som postades (rubrikerna) och noteringarna ordagrant. Sist, numrerat,
   bara det som är HANS (connector som saknas, nyckel som saknas).

## Rutinen

Varje timme `:28` (cron `28 * * * *`, samma i CEST och CET), fast session med
repot som källa och `main` som utgren, prompt `/akut`, connector **Slack**
kopplad på triggern. De dagliga kontrollerna går i 07-körningen
(`dagliga_kontroller_timme` i konfig). Minuten är vald så den inte krockar
med `/stonebite` (:04) eller spårningsrutinerna (:16/:24/:32/:40/:48/:56).

## Definition of done

- [ ] `git pull --rebase origin main` gjord före mätningen
- [ ] `node akut/kor.mjs` kördes med exit 0 och rapporten lästes
- [ ] Varje meddelande i `akut/output/att-posta.json` postat i #urgent (`C0C4MTQNMT7`) och kvitterat med `--postat`, eller orsaken skriven i rapporten
- [ ] Ingenting pausat, ändrat eller skapat i Meta, Shopify, Notion eller Railway
- [ ] `akut/data/larm.json` committad och pushad till `main`; `akut/output/` inte med
- [ ] Rapporten till Axel på svenska, kort, noteringarna ordagrant, hans klick numrerade sist
