# /autosvar — kundtjänstverktyget som svarar på enkla mejl själv och lugnar arga kunder

Argument: `$ARGUMENTS` — `--brand <id>` (eller `--alla`) är obligatoriskt.
`--torr` = svaren sparas som UTKAST i brevlådans Drafts, inget skickas (standard tills
Axel sagt annat). `--skarpt` = svaren skickas. `--discord` = rapport i butikens
`#customer-service`. `--loop 60` = kör om var 60:e sekund (minut-servern).
`--kolla` = vad går att läsa/skriva, vilka nycklar saknas. `--max 20`, `--fonster 72`.

```
/autosvar --brand baverbutiken --torr --discord    rutinen i torrläge (Axels steg 5: 20 utkast i rad rätt först)
/autosvar --brand baverbutiken --skarpt --discord  skarpt på Bäverbutiken (bara efter Axels ok)
/autosvar --alla --skarpt --discord                alla butiker (steg 3 i Axels ordning)
/autosvar --kolla
```

Uppdraget i en mening: **läs de nya kundmejlen i varje butiks brevlåda, svara
själv på de ENKLA (var är min order, leveranstid, adressbyte före leverans,
öppettider) med fakta ur Shopify + 17TRACK, ge ARGA kunder Axels lugnande rad
inom en minut och lägg dem överst i VA:ns kö, och flagga allt SVÅRT till VA:n
utan att röra det.** Axels spec 2026-09-21.

CONNECTORS: inga. Brevlådan via `KUNDTJANST_MAIL_PASS_<ID>` (Loopias webbmejl,
Roundcube — samma väg som `/kundtjanst`), Shopify via brandets nycklar (eller
`SHOPIFY_CLIENT_ID_<suffix>` vars `SHOPIFY_SHOP_<suffix>` bär butikens domän),
17TRACK via `TRACK17_API_KEY` (valfri — utan den bär svaren skickdatum + länk
till spårningssidan, inga skanningar), Discord via `DISCORD_BOT_TOKEN`.
**Ingen modell** — reglerna dömer (`kundtjanst/autosvar/hinkar.mjs`), mallarna
skriver (`kundtjanst/autosvar/svar.mjs`). Koppla ingen connector på rutinen.

## Järnreglerna (testade i `kundtjanst/test/autosvar.test.mjs`, inte diskuterbara)

- **Max ETT automatiskt svar per tråd, någonsin.** Ett svar från oss i tråden
  (Sent), ett utkast (Drafts) eller en rad i loggen ⇒ inget nytt svar. Andra
  mejlet i samma tråd går alltid till VA:n. En kund får dessutom högst ett
  automatiskt svar per dygn, oavsett tråd.
- **Svara aldrig på** autosvar, nyhetsbrev/listmejl, Shopifys egna notiser,
  butikens egna adresser, tvister (chargeback, dispute, ARN, Klarna-tvist,
  tvist) eller mejl med bilagor motorn inte läst.
- **Lova aldrig** återbetalning, ersättning, rabatt eller datum som inte kommer
  ur Shopify/17TRACK (`harForbjudet` stoppar svaret före sändning). Nämn aldrig
  en annan kunds order — orderns e-post måste vara avsändarens.
- **Kundens språk** (sv/nb/da/fi/en) avgör svarets språk. Signatur = butikens
  supportnamn ur brandfilen (`svar.signatur`), aldrig "AI". Rätt butiksnamn.
- **Loggen** `kundtjanst/autosvar/logg/<butik>.jsonl` bär hink, klassificering,
  ordernummer, Message-ID och kundens adress MASKERAD (+ en hash för
  dygnsregeln). Aldrig svarstexten — den finns i Sent.
- `--torr` = utkast i Drafts. Skarpt kräver `--skarpt` uttryckligen.
- **Shopifys kontaktformulär ÄR kundmejl.** "Nytt kundmeddelande den …" från
  `mailer@shopify.com` bär kunden i Reply-To och kundens ord under `Text:` —
  motorn läser dem som kundens eget mejl (`autosvar/kontaktformular.mjs`), och
  svaret går till kunden (Roundcube svarar till Reply-To; `forvantadTill`-spärren
  i `brevlada.svara` stoppar allt annat). Shopifys notiser OM butiken (ny order,
  tvist öppnad) hoppas fortfarande. Mätt 2026-09-21: 10 av de 30 senaste mejlen
  var kontaktformulär.
- **Ett svar från oss syns i mejlet självt:** References från butikens domän
  eller vår adress i citatet ⇒ tråden är besvarad ⇒ VA:n. Sent-mappen är för
  stor (~50 mejl/dag) för att sökningen ska vara enda vakten.
- **Gammal fakta är ingen fakta:** passerat leveransfönster, inga skanningar 5
  dagar efter skick, oskickad order äldre än packtid + 3 dagar, eller en tvist på
  ordern ⇒ inget ENKELT svar (`fakta.staltFakta`). Retur/återbetalning/fel vara/
  defekt i mejlet ⇒ aldrig ENKEL, även om kunden också nämner spårning.

⚠️ **En brevlåda, EN session i taget.** 2026-09-21 23:28 körde två sessioner
torrkörningen samtidigt: Drafts fick sex utkast (fyra från den ena, ett från
den andra), flaggorna sattes av båda, och den ena såg därför inte mejlen den
andra redan flaggat. Kör aldrig `/autosvar` i två sessioner mot samma butik —
loggen och flaggorna är minnet, och de delas inte mellan containrar förrän
loggen är pushad.

Mappnamnen i Loopia är `INBOX.Drafts`, `INBOX.Sent`, `INBOX.VA-PRIO` (webbmejlen
visar dem utan `INBOX.`). `mail.mjs lista --mapp Drafts` säger "finns inte" —
skriv `INBOX.Drafts`. Motorn känner båda formerna.

## Gör i ordning

1. **Kör skriptet:**
   ```bash
   node kundtjanst/autosvar.mjs $ARGUMENTS
   ```
   stderr visar per butik: `ENKEL n · ARG n · SVÅR n · hoppade n` och en rad per
   hanterat mejl (hink, åtgärd, ordernummer, maskerad kund, ämne, varför).
   `▶ <butik>: hoppad — saknar KUNDTJANST_MAIL_PASS_…` är en nyckel som ska in i
   Environments, inte ett kodfel. `Webbmejl … (steg N)` = Loopia har ändrat
   Roundcube; steget står i felet, rätta `kundtjanst/webmail.mjs`.

2. **Discord** (`--discord`): den engelska rapporten postas i butikens server,
   kanal `customer-service` — bara när något hänt (tyst körning = inget inlägg).
   Den säger hur många ENKLA som svarades, vilka ARGA som fick lugnande svar
   (ordernummer + en rad) och VA:ns prioriterade lista. Allt i Discord är på
   engelska (Axels order 2026-09-05).

3. **Committa loggen och pusha** (rutinen på claude.ai):
   ```bash
   git add kundtjanst/autosvar/logg
   git commit -m "Autosvar <butik> <datum>: <n> svar, <m> flaggade"
   git push -u origin main
   ```
   Loggen är minnet som gör "ett svar per tråd" sant mellan körningar. Pushas
   den inte finns Sent/Drafts-kollen som andra vakt, men committa den ändå.

4. **Svara Axel** kort, på svenska: hur många som svarades (ENKEL), hur många
   ARGA som fick lugnande svar och ligger i VA-mappen, hur många som flaggades.
   Sist, numrerat: det som är HANS (nycklar som saknas, ett brand vars
   brevlåda inte gick att läsa, ett svar som stoppades av löftesspärren).

## Definition of done

- [ ] `node kundtjanst/autosvar.mjs $ARGUMENTS` kördes utan att kasta
- [ ] Varje brand redovisat: ENKEL/ARG/SVÅR/hoppade, eller hoppad med orsak
- [ ] Torrläge: alla svar ligger som utkast i Drafts, inget skickat (`skickade: 0`)
- [ ] ARGA trådar flaggade och flyttade till VA-mappen (`svar.va_mapp`, standard VA-PRIO)
- [ ] Discord-post per brand som hade något — på engelska — inte annars
- [ ] Loggen committad och pushad (rutinen) — inga kundadresser i klartext i den
- [ ] Svaret till Axel är på svenska, kort, hans klick numrerade sist
