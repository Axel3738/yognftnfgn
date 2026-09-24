# Google Ads-kopplingen

Annonskostnaden från Google Ads läggs i **samma** `DailySpend`/`HourlySpend`
som Metas, med kontot `g:<kundnummer>`. Därför räknar panelen, gruppsumman,
timgrafen, MER, ROAS och break-even redan med Google — utan att en enda rad i
räknemotorn ändrades. En butik som kör båda näten får **en** annonskostnad,
inte två tal att lägga ihop i huvudet.

## Vad handlaren gör

Ett klick: **Inställningar → Google Ads → Koppla Google Ads**. Fönstret öppnas
utanför Shopify-iframen (Google renderar inte sin inloggning i en iframe),
handlaren godkänner, och finns exakt ett Google Ads-konto väljs det direkt.
Finns flera väljer hen i listan i samma kort. Flera konton får vara kopplade
samtidigt — kostnaden är summan.

## Vad servern behöver (engångsjobb)

Två miljövariabler på **alla sex Railway-tjänsterna**:

| Variabel | Var den kommer ifrån |
|---|---|
| `GOOGLE_ADS_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials → **Create credentials → OAuth client ID** → typ **Web application** |
| `GOOGLE_ADS_CLIENT_SECRET` | samma ställe |

**Authorized redirect URI** i samma OAuth-klient måste vara exakt:

```
<SHOPIFY_APP_URL>/google/callback
```

Saknas variablerna döljs knappen helt. Är bara **en** av dem satt vägrar
appen starta — en halv konfiguration syns annars först när en handlare
klickar och får ett kryptiskt svar från Google.

`GOOGLE_ADS_DEVELOPER_TOKEN` är **frivillig**. Googles REST-dokumentation
säger fortfarande att huvudet `developer-token` krävs vid varje anrop, medan
Googles ändringslogg (läst 2026-09-24) säger att token sunsattes 2026-09-09
och numera ignoreras till förmån för åtkomstnivå per Cloud-projekt. Sidan som
skulle avgöra saken gav 404. Därför skickas huvudet **när det är satt** och
utelämnas annars — det fungerar under båda reglerna.

## Så hänger delarna ihop

| Fil | Vad |
|---|---|
| `app/lib/google-ads.ts` | Ren logik: kontoprefix, miljondelar, batchar, felmeddelanden. Testad (14 tester). |
| `app/lib/google-ads.server.ts` | OAuth, kontolistning, GAQL. Ingen databaslogik utöver kopplingens egna rader. |
| `app/lib/google-spend.server.ts` | Skriver `DailySpend`/`HourlySpend`. Backoff, nollrader, valutaomräkning. |
| `app/routes/google.start.tsx` | Steg 1: engångsrad → nonce-cookie → Googles dialog. |
| `app/routes/google.callback.tsx` | Steg 2: kod → refresh-token, autoval av enda kontot. |
| `app/routes/app.settings.tsx` | Kortet: koppla, välj konto, koppla bort. |

Inloggningsmaskineriet är **Metas**, med en `provider`-kolumn på
`MetaLoginState`: samma engångsrad, samma nonce-cookie, samma spärr mot
vidarebefordrade länkar. En egen andra variant hade betytt två uppsättningar
säkerhetsspärrar att hålla i synk.

## Saker som är lätta att göra fel

- **`cost_micros` är miljondelar.** Utan delningen blir annonskostnaden en
  miljon gånger för hög och vinsten lika mycket för låg. Eget test.
- **Prefixet `g:` är inte kosmetiskt.** Både Metas konto-id och Googles
  kundnummer är rena siffror; utan prefixet kunde de skriva över varandras
  dagar i den delade tabellen utan att något såg fel ut. Eget test.
- **`searchStream` svarar med en lista av batchar.** Läses bara den första
  tappas allt efter de första tusen raderna — tyst.
- **Marknaden är alltid `""`.** Google-kampanjer har ingen marknadsmärkning
  ännu (Meta har det via kampanjfiltret), så kostnaden syns i vyn "alla
  marknader" och räknas inte in när en enskild marknad är vald. Samma regel
  som omärkta Meta-kampanjer.
- **Timmarna ligger i KONTOTS tidszon**, precis som Metas. Skiljer sig
  zonerna åt mellan kopplade konton visar timgrafen ingen ROAS alls — hellre
  ingen än en förskjuten.
- **`prompt=consent` får inte tas bort ur dialogadressen.** Utan den ger
  Google ingen refresh-token till den som redan gett samtycke, och
  kopplingen dör efter en timme.
