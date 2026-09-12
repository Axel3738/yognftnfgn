# /kundtjanst — veckorapporten: toppärenden + chargeback-varningar, alla brands

Argument: `$ARGUMENTS` — normalt `--alla --discord` (rutinen). `--brand <id>` (eller
`a,b,c`) = bara de brandsen. `--dagar 14` = längre period. `--torr` = läs och
räkna, skriv ingen fil, posta inget. `--notion` = lägg rapporten som sida i
brandets Notion-databas. `--kolla` = bara: vilka brands, vilka nycklar saknas.

```
/kundtjanst --alla --discord         rutinen (måndag 07:00)
/kundtjanst --brand tacklebay        ett brand, till chatten och repot
/kundtjanst --kolla                  vad går att läsa här?
```

Uppdraget i en mening: **läs supportmejlen (Loopia) och Shopify för varje brand,
säg vilka ärenden som återkommer vecka efter vecka, vilka signaler som leder till
chargebacks, ranka brandsen på risk — och ge VA:n en numrerad lista.**

CONNECTORS: inga — mejlen läses med brevlådans lösenord (`KUNDTJANST_MAIL_PASS_<ID>`):
IMAP där nätet tillåter det, annars Loopias webbmejl över HTTPS (se nätet nedan).
Shopify läses med `SHOPIFY_ADMIN_TOKEN_<ID>` eller `SHOPIFY_CLIENT_ID_<ID>` +
`SHOPIFY_CLIENT_SECRET_<ID>`, Notion med `NOTION_TOKEN`, Discord med
`DISCORD_BOT_TOKEN`, modellen (valfri) med `ANTHROPIC_NYCKEL`. Koppla ingen
connector på rutinen — det är så den slipper godkännandeklick.

## ⚠️ Nätet: IMAP går INTE från claude.ai — webbmejlen gör det

Mätt 2026-09-12: containern släpper bara HTTPS genom sin proxy. `CONNECT` till
port 993 svarar 200 men tunneln bryts under TLS-handskakningen — mot Loopia,
Gmail **och** Office 365, så det är nätverkspolicyn, inte Loopia. Därför läser
skriptet på claude.ai brevlådan genom **Loopias webbmejl**
(`https://webmail.loopia.se/`, Roundcube) i stället — samma inloggning, port
443, läs-bara. `mail.via: auto` i brandfilen sköter bytet själv: IMAP provas,
och bara när svaret är `PROXY_SPARRAR_PORTEN` går den till webbmejlen. Fel
lösenord provas aldrig två gånger. Inget vidarebefordras, ingen Gmail behövs.

Säger skriptet `Webbmejl … (steg N)`: Loopia har ändrat något i Roundcube.
Steget står i felet — läs `kundtjanst/webmail.mjs`, rätta det steget, kör om.
Rapportera det till Axel som orsak; gissa aldrig fram en rapport utan mejl.

Reserv om brevlådan inte är på Loopia: `--jobb <fil.json>` med mejlen ur en
mejl-connector — formatet står i `kundtjanst/run.mjs`. Öppet nät (Claude Code
lokalt, Railway): IMAP direkt, ingen skillnad i rapporten.

## Noll godkännanden

Repots `.claude/settings.json` står på `dontAsk`. Fråga aldrig om lov. Skriptet
frågar inte heller: ett brand vars nycklar saknas hoppas över med orsak, de andra
körs. En körning där **inget** brand kunde läsas ger exit 1 — den är inte grön.

## ⚠️ Rutinen är läs-bara mot mejlen och Shopify

Den markerar inget som läst (EXAMINE + BODY.PEEK), flyttar inget, svarar på inget,
ändrar ingen order och rör ingen tvist. VA:n ska se exakt samma inkorg efter som
före. Ser du dig själv skriva mot IMAP eller Shopify i det här kommandot: avbryt.

Den skriver: `kundtjanst/korningar/<brand>/<vecka>.md` (+ `.en.md`),
`kundtjanst/korningar/_ranking/<vecka>.md`, `kundtjanst/historik/<brand>.jsonl`
— och pushar till `main`. Historiken är det som gör "återkommande" mätbart:
utan den vet nästa vecka ingenting.

## Gör i ordning

1. **Kör skriptet.** Det gör allt — läsa, klassa, räkna, ranka, skriva, posta:
   ```bash
   node kundtjanst/run.mjs $ARGUMENTS
   ```
   Läs stderr-raderna: ett `⚠️ hoppad:` per brand som inte gick att läsa, med
   variabelnamnet som saknas. Det är inte ett fel att rätta i koden — det är en
   nyckel som ska in i Environments (`node kundtjanst/setup.mjs` listar dem).
   Står det `Webbmejl … (steg N)`: se avsnittet om nätet ovan — rätta steget
   eller rapportera det som orsaken. Gissa aldrig fram en rapport utan mejl.

2. **Läs rapporten som skrevs** (stdout är den svenska; `.en.md` den engelska).
   Rapporten är facit — räkna aldrig om något i huvudet, hitta aldrig på ett tal
   som saknas. Står det "— (ej läsbart)" så är det så.

3. **Discord** (`--discord`): den engelska korta rapporten postas i brandets server,
   kanal `customer-service` (skapas av boten om den saknas). Rankingen postas i
   `customer-service-ranking` på Bäverbutikens server när fler än ett brand lästes.
   Stoppas ett skick (svensk text, exit 3): skriv om på engelska — hoppa aldrig
   över rapporten. Allt i Discord är på engelska (Axels order 2026-09-05).

4. **Committa och pusha till `main`**: korningar, historik och ranking.
   ```bash
   git add kundtjanst/korningar kundtjanst/historik
   git commit -m "Kundtjänst <vecka>: <N> brands lästa, <M> hoppade"
   git push -u origin main
   ```

5. **Svara Axel** kort, på svenska: rankingen (brand, nivå, poäng), de tre
   toppärendena totalt, och sist — numrerat, omöjligt att missa — det som är HANS
   (SOP som saknas, återkommande problem som är produkt/leverans, nycklar som
   saknas för ett brand). VA:ns lista står redan i rapporten på engelska.

## Reglerna

- **Enmetriks-domar är förbjudna även här.** Risken är summan av signaler med tak,
  aldrig en enda siffra. Ett brand är inte "farligt" för att det har flest mejl —
  det är farligt när tvistgraden, hoten och de obesvarade ligger högt samtidigt.
- **Tvistgraden mäts mot Visa/Mastercards nivåer** (gult 0,5 %, rött 0,9 % i
  brandfilen). Tvister som inte går att läsa (Shopify saknar scope eller Payments)
  rapporteras som okända, aldrig som noll.
- **"Återkommande" kräver tre veckors historik.** De första veckorna säger
  rapporten det rakt ut i stället för att stämpla allt som återkommande.
- **Modellen är reserv, inte domare.** Reglerna i `kundtjanst/klassificering.mjs`
  ger samma kategori varje vecka; modellen får bara "övrigt"-högen och skriver en
  mening per toppärende. Saknas nyckeln funkar allt ändå.
- **Kundernas adresser maskeras** (`ka***@gmail.com`) i allt som skrivs eller
  postas. Ordernumret är nyckeln VA:n söker på.
- **Nytt brand = ny fil, inte ny kod.** Fabriksbutiker upptäcks av sig själva;
  annat läggs i `kundtjanst/brands/<id>.yaml` (mall: `kundtjanst/brand-mall.yaml`).
  Ett annat Claude-konto kör exakt samma sak med sina egna nycklar:
  `node kundtjanst/setup.mjs --nytt-konto` är receptet.

## DEFINITION OF DONE

- [ ] `node kundtjanst/run.mjs` körd — varje brand antingen läst eller hoppat med orsak
- [ ] Minst ett brand läst (annars exit 1 och det står i svaret vilken nyckel som saknas)
- [ ] Rapporten per brand skriven i `kundtjanst/korningar/<brand>/<vecka>.md` + `.en.md`
- [ ] Rankingen skriven i `kundtjanst/korningar/_ranking/<vecka>.md`
- [ ] Historiken uppdaterad i `kundtjanst/historik/<brand>.jsonl`
- [ ] Discord postat på engelska (om `--discord`) — eller orsaken till att det inte gick står i svaret
- [ ] Committat och pushat till `main`
- [ ] Svaret till Axel: ranking, tre toppärenden, och HANS uppgifter sist och numrerade
