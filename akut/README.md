# akut/ — Akutlarmet: det som bara Axel kan påverka, i Slack #urgent

Axels beställning 2026-09-27: "en rutin som trackar allt i min business och
bara uppdaterar mig om det händer akuta grejer — legit akuta grejer som inte
min VA, inte mina videoredigerare, ingen kan påverka förutom jag, som
verkligen påverkar performancen av hur businessen går och viktiga backend-
eller frontend-problem. Jag kommer att kolla den varje dag. Discorden vägrar
jag kolla, det är så många meddelanden."

Det är hela kravet: **hög tröskel, en kanal, en gång per händelse, hans klick
sist.** Allt som VA:n, redigerarna eller en rutin kan lösa själva hör inte
hemma här — de har Discord.

```bash
node akut/kor.mjs --torr        # mät och visa, skriv ingenting
node akut/kor.mjs               # skarpt (rutinen): mät, posta/köa, skriv minnet
node akut/kor.mjs --dagligt     # tvinga tvister + utbetalningar nu
node akut/kor.mjs --postat m1   # kvittera ett meddelande som sessionen postat via connectorn
node --test akut/test/*.test.mjs
```

Kommandot är `/akut` (`.claude/commands/akut.md`), rutinen går varje timme :28.

## Vad som mäts

| Kontroll | Källa | Larmar när | Typ |
|---|---|---|---|
| Butikerna svarar | GET på varje butik i drift (ordrar senaste 7 dygnen), marknadsdomänerna (carashell.com), `sajter_extra` | 5xx/timeout tre gånger, 402 Unavailable Shop, lösenordssidan | tillstånd |
| Annonskontona | Meta `act_<id>` (status, disable_reason, spend_cap) — kontona ur `stonebite/varumarken.json` | status ≠ aktivt; utgiftstaket nått | tillstånd |
| Pengar brinner | Meta insights `today`, kampanjnivå | ≥ 5 000 kr utan köp, eller ≥ 10 000 kr med ROAS < halva break-even (ur namnet `BE ROAS 1.63`) | händelse (per kampanj och Metas dygn) |
| Pixeln | snapshotens ordrar i dag mot Metas köp i dag, per varumärke (delade konton på kampanjprefix, `kampanjTillhor`) | ≥ 15 ordrar men 0 köp på ≥ 2 000 kr | händelse (per dag) |
| Backend | `https://www.stonebite.org/halsa`, direktadressen som reserv | sajten svarar inte (säger om det är domänen eller Railway); `autosvar.kor: false`; ≥ 5 omstarter | tillstånd |
| Rutinerna | `stonebite/kallor/rutiner.mjs` (git-loggen mot `stonebite/rutiner.json`) | status `saknas` — aldrig `omatbar` eller `avstangd` | tillstånd |
| Nycklarna | Meta kod 190, Notion `GET /v1/users/me` 401, snapshotens butiksstatus | nyckeln död; en butik som var i drift men inte längre går att läsa | tillstånd |
| Chargeback-graden | Shopify `disputes.json` (dagligen, 07-körningen) | chargebacks/ordrar på 30 dagar ≥ 0,75 % med ≥ 200 ordrar | händelse (per vecka) |
| Utbetalningarna | Shopify `payouts.json` (dagligen; 403 ⇒ hoppad med orsak) | en payout `failed` de senaste 14 dagarna | händelse (per payout) |

Mätt vid bygget 2026-09-27 16:27: 7 sajter svarar, 7 annonskonton aktiva, 43
kampanjer med spend i dag, backend ok, 18 rutiner ok, Notion ok — och ETT
larm: CaraShells US-kampanj hade dragit 18 728 kr med ROAS 0,32 mot break-even
1,63. Utbetalningarna gick att läsa för CaraShell, HeimGuard och AdventLane;
Bäverbutikens fyra appar saknar `read_shopify_payments_payouts` och hoppas
med orsak.

## Hur det hänger ihop

```
kor.mjs        körningen: läser snapshot + minne, hämtar, dömer, postar/köar, skriver minnet
hamta.mjs      allt nät (sajter, Meta, /halsa, Notion, payouts) — kastar aldrig, svarar med läge
kontroller.mjs domarna, rena funktioner: (hämtat) → { larm, friska, notering }
text.mjs       larm → svensk Slack-text; rutiner och Shopify-nycklar grupperas till ETT meddelande
minne.mjs      akut/data/larm.json: postade nycklar, lösta tillstånd, butiker i drift
slack.mjs      reservvägen med nyckel i miljön; huvudvägen är connectorn (kommandofilen)
konfig.json    kanalen, trösklarna, extra sajter, vilket konto som bär vilken rutin
```

**Tillstånd mot händelse.** `butik`, `konto`, `spendcap`, `backend`, `rutin`
och `nyckel` är tillstånd: stabil nyckel, ett larm när det börjar, ett
"✅ Löst" när kontrollen ser att det är över (`friska`), och först då kan det
larma igen. `pengar`, `pixel`, `tvistgrad` och `utbetalning` är händelser:
nyckeln bär datum/vecka/payout-id, nästa dag är ett nytt larm. Ett larm postas
aldrig två gånger — minnet committas av rutinen.

**Inget mäts på gissning.** En kontroll som inte kunde köras (Meta strypt,
git-loggen oläsbar, appen utan rättighet) ger varken larm eller frisk — bara
en ⚠️ notering i rapporten till Axel. Ett postat tillstånd löses bara av en
kontroll som faktiskt mätte nyckeln som frisk.

## Slack: huvudväg och reserv

Kanalen `#urgent` (`C0C4MTQNMT7`) är privat och Axel är enda medlemmen —
larmen bär spend och ROAS, och redigerarna får aldrig se spend (Axels beslut
2026-09-02). Den skapades 2026-09-27 via Slack-connectorn, som är kopplad
med Axels eget konto; meddelandena postas alltså som honom.

- **Huvudvägen (rutinen):** `kor.mjs` skriver `akut/output/att-posta.json`,
  sessionen postar med `mcp__Slack__slack_send_message` och kvitterar med
  `--postat <id>`. Connectorn Slack måste vara kopplad på rutinen (den ärvs
  inte). Kvitteringen är det som skriver minnet — ett meddelande som inte gick
  iväg ligger kvar i kön till nästa körning.
  ✅ **Mätt i drift 2026-09-27 17:30 CEST: rutinen postar själv.** Första
  cron-körningen (:28) postade CaraShell-larmet i `#urgent` två minuter
  senare, som Axel via Claude, utan något klick — och kvitterade det i nästa
  körning (`skickade` i `larm.json`). `create_trigger` avvisar visserligen
  `connectors` ("not available for this organization") och triggern visar
  `mcp_connections: []`, men rutinens session har Slack-connectorn ändå (den
  skapades från en session som hade den). ⚠️ `get_session` →
  `turn_handoff.tools` listar ALDRIG `mcp__*`-verktyg, inte ens i en session
  som bevisligen postar i Slack — den listan säger inget om connectors, och
  bygget skrev fel i ett dygn på grund av den ("rutinen köar tills Axel
  kopplat Slack"). Postar rutinen någon gång inte: kön ligger kvar i
  `att-posta.json`, det som inte kvitterats är "nytt" nästa timme igen, och
  en session med Slack postar och kvitterar.
- **Reserven:** finns `SLACK_BOT_TOKEN` (en Slack-app med `chat:write`,
  inbjuden i kanalen) eller `SLACK_WEBHOOK_URL` (Incoming Webhook låst till
  kanalen) i miljön postar `kor.mjs` själv. Då behövs inget verktygsanrop
  alls. Texten är samma; bara fetstilen renderas olika (`mrkdwn`).

## Lägga till en kontroll

1. Skriv en ren domare i `kontroller.mjs` som får det hämtade och svarar
   `{ larm, friska, notering }`. Varje larm: `typ`, `nyckel`, `verksamhet`,
   `rubrik`, `rader` (siffror + "Mätt HH:MM"), `gor` (Axels klick, exakta
   namn på menyer och knappar).
2. Är det ett tillstånd: lägg typen i `TILLSTAND` i `minne.mjs` och
   friskförklara nyckeln när det är ok. Är det en händelse: bär datumet i nyckeln.
3. Hämtaren i `hamta.mjs` svarar alltid med ett läge, kastar aldrig.
4. Koppla in i `domAllt` och `korAkut`, tröskeln i `konfig.json`, ett test i
   `test/kontroller.test.mjs` med en fixtur.
5. Fråga dig: kan VA:n, en redigerare eller en rutin lösa det själv? Då hör
   det inte hemma här.

## Fällor som redan är mätta

- Sajtkollen följer omdirigeringar: containern surfar från USA, så
  `carashell.se` svarar med carashell.com (302) — det är 200 och rätt.
- `toLocaleString('sv-SE')` sätter hårda mellanslag i talen; `kr()` byter till
  vanliga så "18 512 kr" går att söka på.
- **Veckodag och datum står i varje larm** (`klockan()` → "sön 27/9 17:29",
  och pengar-rubriken bär dygnet: "Pengar brinner sön 27/9: 19 299 kr, ROAS
  0,31"). Första versionen skrev "19 299 kr i dag … Mätt 17:29": Axel läste
  söndagens larm på tisdag morgon 29/9 och frågade om det var i dag eller i
  går. Slack visar tiden bredvid, inte i texten han läser. Skriv aldrig
  "i dag" i ett larm.
- Metas `today` räknas i kontots tidszon (UK-kontot: London). Nyckeln för
  "pengar brinner" bär därför Metas eget `date_start` (`dag` på kampanjen),
  svenskt datum bara som reserv. Första versionen byggde nyckeln på svenskt
  datum och kallade timmen vid midnatt "ofarlig" — mätt 2026-09-28 00:29:
  samma USA-kampanj, samma London-dygn, kom tillbaka som ett NYTT larm med
  22 419 kr, en timme efter att 27/9-larmet postats. Ett dygn är kontots dygn.
- `kampanjTillhor` matchar prefixet som ORD i namnet (`AU LISTICLE Taköverdrag
  CARASHELL` är CaraShells) — samma regel som sajtens MER.
- Rutinvakten i en grund klon: `rutinlage` fördjupar historiken själv
  (`fordjupaHistorik`), och en rutin utan spår i för kort historik blir
  `omatbar`, aldrig `saknas` — så larmet aldrig går på mätarens fel.
