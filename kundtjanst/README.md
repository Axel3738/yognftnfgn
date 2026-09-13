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

**Hemsidan** (Axels beslut 2026-09-12: "en hemsida som lagrar all data"):
`rapportsida.mjs` bakar alla rapporter i `korningar/` och alla tal i
`historik/` till `rapport-publicerad.html` — en självbärande sida (mall:
`rapport-sida.html`) med ett kort per brand, riskkurvan vecka för vecka,
rankingen och varje veckas rapport på svenska (Axel) och engelska (VA:n).
Rutinen publicerar om den varje måndag mot **samma länk** (står i
`rapportsida.json`; utan `url` blir det en ny sida). Sidan räknar aldrig om
något och har ingen runtime-capability, så länken funkar utan Claude-konto.
Bygg: `node kundtjanst/rapportsida.mjs`.

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
| `KUNDTJANST_WEBMAIL_URL_<ID>` | bara om webbmejlen inte är `https://webmail.loopia.se/` (annan Roundcube) | nej |
| `SHOPIFY_SHOP_<ID>` + `SHOPIFY_ADMIN_TOKEN_<ID>` | ordrar + tvister (custom app: `read_orders`, `read_shopify_payments_disputes`). Värdet är **"Admin API access token"** (`shpat_…`, visas en gång efter *Install app*) — inte API key, inte API secret key. Skriptet säger vilket av dem som klistrats in om butiken svarar 401. `SHOPIFY_SHOP_<ID>` behövs bara om brandfilen saknar `shop` | nej — utan dem är tvister "okända" |
| `SHOPIFY_CLIENT_ID_<ID>` + `SHOPIFY_CLIENT_SECRET_<ID>` | **den vanliga vägen** (samma som fabriken): Client ID + Client secret från appen på dev.shopify.com, token mintas per körning (24 h). Appen behöver scopes `read_orders,read_shopify_payments_disputes` **och** "Protected customer data access" begärd under API access — annars svarar Shopify 403 "requires merchant approval for read_orders" (mätt 2026-09-12 med fabrikens app). ⚠️ En `atkn_…`-token (Shopify CLI) fungerar aldrig mot Admin API och ignoreras | nej |
| `NOTION_TOKEN` | SOP-täckning + rapportsida | nej |
| `DISCORD_BOT_TOKEN` (eller `DISCORD_WEBHOOK_URL[_<ID>]`) | posta rapporten | nej |
| `ANTHROPIC_NYCKEL` | modellen för "övrigt" och sammanfattningarna | nej |

`node kundtjanst/setup.mjs` skriver ut exakt vilka som saknas, per brand.

Heter Shopify-nycklarna något annat än `<ID>` — Bäverbutiken har en egen app bara
för kundtjänsten, `SHOPIFY_CLIENT_ID_BAVERBUTIKEN_EMAILSCRAPER` (Axels namn
2026-09-13) — sätt `shopify.env_suffix` i brandfilen. Bara Shopify-namnen byter
svans; mejlens `KUNDTJANST_MAIL_PASS_<ID>` heter alltid som brandet.

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
| **A. Webbmejlen (HTTPS)** — `mail.via: auto` väljer den när IMAP spärras | rutinen på claude.ai | Loopias webbmejl `https://webmail.loopia.se/` (Roundcube 1.7, avläst 2026-09-12), samma inloggning som brevlådan | bara `KUNDTJANST_MAIL_PASS_<ID>`. Ingen vidarebefordran, ingen Gmail |
| **B. IMAP direkt** | Claude Code lokalt, en cron på en dator, Railway, self-hosted environment | Loopia | `KUNDTJANST_MAIL_PASS_<ID>` och öppen port 993 |
| **C. `--jobb <fil.json>`** | valfritt konto med en mejl-connector (Gmail) | JSON som sessionen skriver ur connectorn | bara om brevlådan inte är på Loopia/Roundcube |
| **D. `--fixtur <mapp>`** | var som helst | `.eml`-filer | bara tester och demo |

Shopify, Notion, Discord och modellen går över HTTPS och fungerar överallt.
Väg A är standard på claude.ai: `kundtjanst/webmail.mjs` loggar in i webbmejlen
precis som VA:n gör i webbläsaren, listar mejlen nyast först, hämtar råkällan
(`viewsource`) och loggar ut. Läs-bara. ⚠️ Webbmejlen är ett gränssnitt för
människor, inte ett API: byter Loopia Roundcube-version kan ett steg sluta
stämma. Varje steg kastar då ett fel som säger vilket steg (1–6) som inte
kände igen svaret, så det går att rätta utan att gissa. Testerna i
`test/webmail.test.mjs` spelar upp de svar som avlästes 2026-09-12.

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
