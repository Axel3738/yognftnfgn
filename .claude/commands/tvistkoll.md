# /tvistkoll — daglig snabbkoll: tvister med deadline inom 3 dagar

Argument: `$ARGUMENTS` — normalt `--alla --discord` (rutinen). `--brand <id>` =
bara det brandet. `--dagar 5` = larma tidigare (standard 3). `--torr` = läs och
visa, posta inget. `--json` = maskinläsbart.

```
/tvistkoll --alla --discord      rutinen (varje dag 07:00)
/tvistkoll --brand baverbutiken --torr
```

Uppdraget i en mening: **läs Shopify-tvisterna för varje brand, hitta dem som
måste besvaras inom tre dagar, och posta listan i brandets Discord — inget mer.**

⚠️ **Det här är INTE veckorapporten.** `/kundtjanst` läser brevlådan och tar tre
kvart. Den här läser bara tvister och tar sekunder. Den finns för att täppa till
en lucka Axel pekade ut 2026-09-13: veckorapporten går måndag 07:00, så en tvist
som kommer in på tisdag med deadline på torsdag hinner gå ut innan nästa rapport
— och en **chargeback** som inte besvaras förloras.

⚠️ **Rättat 2026-09-20, mätt på 50 tvister:** en obesvarad **inquiry** förloras
INTE automatiskt (29 av 29 avgjorda vunna, 0 förlorade) — den **eskalerar till
chargeback** med ny deadline, och det är där pengarna försvinner (chargebacks:
1 vunnen av 4, alla tre förluster någonsin). Skriv aldrig tillbaka den gamla
meningen "en obesvarad tvist förloras automatiskt"; den stod i Discord-larmet
2026-09-15..20 och fick tre eskalerade tvister att rapporteras som förlorade. Läs aldrig om brevlådan här
och bygg aldrig in ärenden, kategorier eller ranking; då blir den långsam och
slutar köras.

CONNECTORS: inga. Shopify läses med `SHOPIFY_ADMIN_TOKEN_<ID>` eller
`SHOPIFY_CLIENT_ID_<ID>` + `SHOPIFY_CLIENT_SECRET_<ID>`, Discord med
`DISCORD_BOT_TOKEN`. Koppla ingen connector på rutinen.

## Steg

1. `node kundtjanst/tvistkoll.mjs $ARGUMENTS`

   Skriptet gör allt: läser tvisterna 180 dagar bakåt (deadline avgör brådskan,
   inte startdatum), väljer ut de öppna som ska besvaras inom gränsen, hämtar
   ordernumret för just dem, och postar den engelska listan i brandets Discord.

2. Läs utfallet och rapportera **kort** till Axel på svenska:

   - Inga brådskande: en rad. `Tvistkoll: inget som brådskar (N brands lästa).`
     Posta ingenting någonstans, skriv ingen fil, väck ingen. Tystnad är rätt svar.
   - Brådskande: antal, brand, ordernummer, belopp, deadline och dagar kvar.
   - **Ett brand vars tvister inte kunde läsas är OKÄNT, aldrig noll.** Skriptet
     skriver ut orsaken per brand — ta med den raden ordagrant. Ett 403 betyder
     att appen saknar scopet `read_shopify_payments_disputes`; "inte kopplat"
     betyder att nyckeln saknas i Environments.

3. Skriv ingenting i repot och pusha inte. Körningen ska inte lämna spår —
   historiken är veckorapportens jobb.

## Definition of done

- [ ] `node kundtjanst/tvistkoll.mjs $ARGUMENTS` kördes och gav exit 0
- [ ] Varje brand redovisat: brådskande antal, eller okänt med orsak
- [ ] Discord-post gjord för varje brand som hade något brådskande (inte annars)
- [ ] Inget skrivet i repot, ingen push
- [ ] Svaret till Axel är på svenska och får plats på några rader
