# kundtjanst/ — veckorapporten för kundtjänst och chargeback-risk

En rutin, alla brands, noll beroenden. Varje måndag läser den förra veckans
supportmejl (Loopia) och Shopify för varje brand och svarar på tre frågor:

1. **Vilka ärenden återkommer?** Toppkategorierna, vecka mot vecka, och vilka
   som legat topp 3 i tre av fyra veckor — det är inte kundtjänst längre, det
   är produkten eller leveransen.
2. **Vilka varningssignaler leder till chargebacks?** Kunder som hotar med
   banken, "aldrig fått varan", dubbla debiteringar, obesvarade ärenden,
   betalda ordrar som inte skickats, riktiga tvister ur Shopify Payments och
   tvistgraden mot Visa/Mastercards gränser.
3. **Vilket brand ligger sämst till?** En ranking 0–100 med nivå 🟢🟡🔴.

Och sist i varje rapport: en numrerad lista till VA:n (engelska) och en till
Axel (svenska) — SOP:er som saknas i Notion, rotorsaker att ta tag i, nycklar
som fattas.

```bash
node kundtjanst/run.mjs --kolla                       # vad går att läsa här?
node kundtjanst/run.mjs --brand tacklebay --torr      # provkör ett brand, skriv inget
node kundtjanst/run.mjs --alla --discord              # rutinen
node kundtjanst/setup.mjs                             # nycklar som saknas + rutinens cron
node kundtjanst/setup.mjs --nytt-konto                # receptet för ett annat Claude-konto
node kundtjanst/setup.mjs --mappar tacklebay          # brevlådans mappnamn (Skickat?)
node kundtjanst/run.mjs --fixtur kundtjanst/test/fixturer/demo --torr --datum 2026-09-14   # demo utan nät
```

## Så hänger det ihop

```
factory/butiker/*.yaml ─┐                      ┌─ imap.mjs + mime.mjs   (Loopia, läs-bara)
kundtjanst/brands/*.yaml ┴─ brands.mjs ─ run.mjs ┼─ shopify.mjs          (ordrar + tvister, läs-bara)
                                                 ├─ arenden.mjs          (mejl → trådar: obesvarat, svarstid)
                                                 ├─ klassificering.mjs   (regler, 14 kategorier, 5 språk)
                                                 ├─ llm.mjs              (valfri: "övrigt" + en mening per toppärende)
                                                 ├─ chargeback.mjs       (signaler med tak → 0–100, ranking, återkommande)
                                                 ├─ notion.mjs           (SOP-täckning, rapportsida — valfritt)
                                                 └─ rapport.mjs          (svenska till Axel, engelska till VA:n/Discord)
                                                        │
                        kundtjanst/korningar/<brand>/<vecka>.md  + .en.md
                        kundtjanst/korningar/_ranking/<vecka>.md
                        kundtjanst/historik/<brand>.jsonl   ← det som gör "återkommande" mätbart
```

**Brands upptäcks, listas inte.** Varje `factory/butiker/<id>.yaml` är ett brand
(namn, supportmail, myshopify-domän kommer därifrån). Butiker som fabriken inte
byggt — Bäverbutiken — får en egen fil i `kundtjanst/brands/`. Samma id i båda
= den egna filen lägger på (Notion-databas, Discord-kanal, trösklar) eller
stänger av (`aktiv: false`). Mall: `brand-mall.yaml`.

**Hemligheterna ligger i Environments på claude.ai, aldrig i repot.** Namnen
härleds ur brand-id:t (`tacklebay` → `TACKLEBAY`, `my-shop` → `MY_SHOP`):

| Variabel | Vad | Krävs? |
|---|---|---|
| `KUNDTJANST_MAIL_PASS_<ID>` | Loopia-lösenordet för supportbrevlådan | ja |
| `KUNDTJANST_MAIL_USER_<ID>` | bara om användarnamnet inte är supportmailen | nej |
| `KUNDTJANST_MAIL_HOST_<ID>` | bara om det inte är Loopia (`mailcluster.loopia.se`) | nej |
| `SHOPIFY_SHOP_<ID>` + `SHOPIFY_ADMIN_TOKEN_<ID>` | ordrar + tvister (custom app: `read_orders`, `read_shopify_payments_disputes`) | nej — utan dem är tvister "okända" |
| `SHOPIFY_CLIENT_ID_<ID>` + `SHOPIFY_CLIENT_SECRET_<ID>` | alternativet: fabrikens app "Fabriken", token mintas per körning | nej |
| `NOTION_TOKEN` | SOP-täckning + rapportsida | nej |
| `DISCORD_BOT_TOKEN` (eller `DISCORD_WEBHOOK_URL[_<ID>]`) | posta rapporten | nej |
| `ANTHROPIC_NYCKEL` | modellen för "övrigt" och sammanfattningarna | nej |

`node kundtjanst/setup.mjs` skriver ut exakt vilka som saknas, per brand.

## Köra på ett annat Claude-konto (samma repo, andra brands)

Det här är hela poängen med upplägget: koden är densamma, bara nycklarna och
brandfilerna skiljer.

1. Koppla repot `Axel3738/yognftnfgn` (main) till kontot.
2. `node kundtjanst/brands.mjs` — listar brandsen. Saknas ett: kopiera
   `brand-mall.yaml` till `brands/<id>.yaml`. Ska kontot inte köra ett brand:
   `aktiv: false`, eller kör med `--brand a,b`.
3. Lägg in variablerna i kontots Environment (tabellen ovan). Nya variabler
   syns först i en NY container.
4. `node kundtjanst/setup.mjs` → ✅ på varje brand som ska köras.
   `node kundtjanst/run.mjs --brand <id> --torr` → provkörning utan skrivning.
5. `/rutin /kundtjanst --alla --discord 07:00` i chatten (eller stegen setup
   skriver ut). Fast session, `main` som utgren, cron för måndag. Kommandofilen
   är märkt `CONNECTORS: inga` — koppla inga connectors.

`node kundtjanst/setup.mjs --nytt-konto` skriver ut samma recept med kontots
faktiska brands och variabelnamn ifyllda.

## Vad som mäts, exakt

**Kategorier** (`klassificering.mjs`, regler på svenska/norska/danska/engelska/finska):
hot om bank/tvist · okänd/dubbel debitering · aldrig levererad · fel vara/inte som
beskrivet · var är min order (WISMO) · skadad/defekt · återbetalning · avbeställning
· retur/ångerrätt · faktura/Klarna · produktfråga · rabattkod · spam · övrigt.
Vikten 0–3 per kategori följer kortnätverkens fyra stora tvistorsaker (item not
received, not as described, unauthorized/duplicate, credit not processed).
Eskaleringsord ("tredje gången", "ingen svarar", "inom 48 timmar") höjer poängen.

**Ärenden** (`arenden.mjs`): ett ärende = en kund + ett ämne (trådas på
References/In-Reply-To, annars avsändare + normaliserat ämne). Svar = allt från
brandets egen domän eller Skickat-mappen. Obesvarat = sista inkommande utan
senare svar; larm över `obesvarad_timmar` (48). Autosvar, nyhetsbrev och
systemmejl (Shopify, Klarna, PostNord …) räknas aldrig.

**Risk** (`chargeback.mjs`), signaler med tak så ingen ensam färgar brandet:

| Signal | Poäng | Tak |
|---|---|---|
| Tvister i perioden (Shopify Payments) | 15/st + 15 vid gul tvistgrad, +30 vid röd | 40 (+30) |
| Kunder som hotar med bank/tvist | 12/st | 36 |
| Okänd/dubbel debitering | 10/st | 30 |
| Aldrig levererad | 8/st | 24 |
| Fel vara / inte som beskrivet | 6/st | 18 |
| Obesvarade > gräns | 5/st (8 om chargeback-nära) | 25 |
| Betalda ordrar utan fulfillment > 5 dagar | 4/st | 20 |
| Skickade utan spårning | 2/st | 10 |
| Obesvarade återbetalnings-/avbeställningskrav | 3/st | 12 |
| Median första svarstid | +10 över 24 h, +20 över 48 h | 20 |

Summan kapas vid 100. 🟢 < 25, 🟡 25–50, 🔴 > 50. Tvistgrad = tvister / ordrar
senaste 30 dagarna; gult 0,5 %, rött 0,9 % (Visa varnar vid 0,9 %, Mastercard
vid 1 %). Trösklarna ändras per brand i brandfilen.

**Återkommande** = topp 3 i minst 3 av de senaste 4 veckorna. Kräver tre veckors
historik — innan dess säger rapporten det i stället för att gissa.

## Regler som inte får brytas

- **Läs-bara.** EXAMINE + BODY.PEEK mot IMAP, bara GET mot Shopify. Inget
  markeras som läst, inget svaras, ingen order rörs.
- **Aldrig noll för det som inte lästes.** Saknas Shopify står tvisterna som
  "okända". Hoppar ett brand står variabelnamnet som saknas.
- **Kundadresser maskeras** (`ka***@gmail.com`) i allt som skrivs eller postas.
  Rapporterna committas till repot — de ska inte bära personuppgifter i klartext.
- **Reglerna dömer, modellen hjälper.** Samma mejl ska ge samma kategori nästa
  vecka; annars går trenden inte att läsa. Modellen får bara "övrigt".
- **Ingen handskriven brandlista.** Nya fabriksbutiker dyker upp av sig själva.
- **Allt i Discord är på engelska.** Den engelska rapporten genereras direkt;
  `tools/lib/engelska.mjs` stoppar ändå svensk text.

## Nätet: var rutinen kan läsa mejlen

⚠️ **Mätt 2026-09-12 i en claude.ai-container:** direkt TCP mot port 993 får
inget svar; `CONNECT` genom sessionens proxy svarar 200 men tunneln bryts under
TLS-handskakningen — mot `mailcluster.loopia.se`, `imap.gmail.com` **och**
`outlook.office365.com`, medan 443 går fint (riktigt DigiCert-cert, ingen
MITM). Docs bekräftar: "Cloud sessions in Anthropic-hosted environments run
behind an HTTP/HTTPS network proxy … All outbound internet traffic … passes
through this proxy" — även nivån **Full** ("Any domain") är HTTP/HTTPS. IMAP
går alltså inte från claude.ai-rutiner, oavsett nätverksnivå. Klienten upptäcker
det (kod `PROXY_SPARRAR_PORTEN`) och hoppar brandet med en tydlig text i
stället för att hänga.

| Väg | Var | Mejlen kommer från | Krav |
|---|---|---|---|
| **A. `--jobb <fil.json>`** | rutinen på claude.ai | Gmail-connectorn i sessionen (Loopia vidarebefordrar `hello@<brand>` till en Gmail-inkorg) | connector kopplad på rutinen; sessionen skriver JSON, formatet står i `run.mjs` och i kommandofilen |
| **B. IMAP direkt** | Claude Code lokalt, en cron på en dator, Railway, self-hosted environment | Loopia | `KUNDTJANST_MAIL_PASS_<ID>` och öppen port 993 |
| **C. `--fixtur <mapp>`** | var som helst | `.eml`-filer | bara tester och demo |

Shopify, Notion, Discord och modellen går över HTTPS och fungerar överallt.
Väg A är den som gör rutinen helt klickfri på claude.ai; väg B är den enklaste
om Axel eller VA:n ändå kör Claude Code lokalt en gång i veckan.

## Loopia

IMAP `mailcluster.loopia.se`, port 993 (SSL), användarnamn = hela mejladressen,
lösenord = brevlådans lösenord (Loopia Kundzon → E-post → brevlådan → Ändra
lösenord). Skickat-mappen heter normalt `Sent`; rutinen provar `Sent`,
`INBOX.Sent`, `Skickat` och `Sent Items`. Hittar den ingen står det i rapporten
och svarstiderna mäts då bara på svar som råkar ligga i inkorgen —
`node kundtjanst/setup.mjs --mappar <id>` visar det riktiga namnet, som sätts som
`mail.skickat` i brandfilen.

## Tester

```bash
node --test kundtjanst/test/*.test.mjs     # 67 tester, inget nät
npm test                                   # hela repot
```

Fixturen `test/fixturer/demo/demobutiken/` är ett komplett brand: 13 mejl i
inkorgen (8bit, quoted-printable, base64-HTML, multipart, norska, engelska,
autosvar, nyhetsbrev, Shopify-avisering, en tråd med kundens andra mejl), 4
svar i Skickat, `ordrar.json`, `tvister.json` och `sop.json`. Hela flödet körs
mot den i `test/brands-run.test.mjs` och med `--fixtur` från terminalen.

---

## For the customer-service VA (English)

Every Monday a report lands in your brand's Discord channel `#customer-service`
(and the full one in Notion if that is set up). Read it top to bottom:

- **Numbers** — how many tickets, how many still unanswered, your median first
  reply time. Under 24h is the goal.
- **Top tickets** — what customers wrote about most. 🔁 means it has been in the
  top 3 for weeks: tell Axel, it is a product or shipping problem, not a support one.
- **Chargeback warning signs** — each line names a customer (masked) and the
  order number. These are the tickets that turn into disputes if they wait.
- **SOP missing in Notion** — categories we get every week without a written
  SOP. Write one (title must name the problem, e.g. "SOP – Never delivered").
- **🔴 ACTION NEEDED** — your list for the week, in order. Do 1 first.

Nothing in the report changes the inbox: it only reads. Reply to customers the
way you always do.
