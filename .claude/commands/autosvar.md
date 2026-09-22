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

## Var boten kör (Axels krav 2026-09-22: "svara arga kunder på 60 sekunder")

**Minutservern på Railway är den som kör** — inte en rutin på claude.ai. En
rutin kör som tätast en gång i timmen; 60 sekunder kräver en process som
snurrar hela tiden, och sajten (`stonebite/server.mjs`) kör redan dygnet runt
på Railway. `stonebite/autosvar-vakt.mjs` startar därför
`node kundtjanst/autosvar.mjs --brand <AUTOSVAR_BRANDS> --torr --loop 60` som
barnprocess när `AUTOSVAR_BRANDS` är satt på tjänsten, och startar om den när
den dör. Torrt tills `AUTOSVAR_LAGE=skarpt` står uttryckligen. Loggen ligger på
volymen (`AUTOSVAR_LOGGMAPP`, standard `<STONEBITE_DATA>/autosvar/logg`) så
minnet "ett svar per tråd någonsin" överlever varje deploy, och sajten läser
den live (Kundtjänst-fliken visar de arga kunderna inom minuten). Slås på med
Cowork-prompten `stonebite/cowork/5-autosvar.txt`; `/halsa` på sajten säger
om den snurrar (`autosvar.kor`).

⛔ **När vakten är på för en butik kör INGEN session det här kommandot mot
samma brevlåda** — två autosvar på en brevlåda är ett dubbelsvar (mätt
2026-09-21, två sessioner i samma minut). Kalibrering (`--igen --torr`) görs
bara när vakten är av för butiken (`AUTOSVAR_BRANDS` utan den) eller mot en
annan butik. Loggen i repot (`kundtjanst/autosvar/logg/`) är historiken från
sessionskörningarna — Railways logg står på volymen och committas inte.

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

- **VA:ns SOP:er styr svaren** (Axels order 2026-09-21, Notion "Bäverkoppling.se",
  läst via kopian "Customer support bäverbutiken"): WISMO säger var paketet ÄR
  (ombud / ute för leverans / framme i landet, sista biten 1–2 arbetsdagar) och
  att en stilla spårning är normal (SOP 36/37); levererat-men-inte-mottaget får
  checklistan brevlåda/avi/ombud/grannar, aldrig "borttappat" (SOP 06); skadad,
  fel eller för få varor får bildförfrågan (SOP 05/07/08/15) — som ENKEL `foton`
  när kunden är lugn, inne i ARG-svaret när hen är arg; saknad bekräftelse
  ⇒ skräppost-raden (SOP 11/30); företagsuppgifter ur brandfilen (SOP 38);
  säger kunden att spårningen står still ⇒ lugnande raden, aldrig "borta"
  (SOP 02); byte och storlek ("för litet", "en storlek större") är SVÅR (SOP 21).
  Allt som kräver ägarens beslut i SOP:en (retur, återbetalning, avbeställning,
  byte, tvist, tull, rabatt) är SVÅR. Tabellen: `kundtjanst/README.md` → SOP-avstämningen.
- **ARG är riktig ilska, inte en kategori** (Axels kalibrering 2026-09-22 efter
  Jan-Olofs artiga "överdraget är för litet", som fick eskaleringsmallen: "jag
  tyckte inte riktigt att han verkade så himla sur"): argt ordval, eskaleringsord,
  hot om bank/anmälan, versaler, utropstecken eller tredje mejlet utan svar.
  "Aldrig fått paketet" och "trasig vara" i sig räcker inte — lugnt är de WISMO
  resp. `foton`. Det arga svaret bär dessutom **läget ur spårningen** ("Det här
  ser jag just nu om din order …") när faktan är färsk och ordern kundens egen,
  så en arg WISMO-kund får veta var paketet är utan att vänta på VA:n.
- **Axels feedback på utkasten 2026-09-22 (mallarna):** ARG börjar med
  hälsning + *"Jag förstår helt din frustration"* + problemet i klartext,
  minst lika argt som kunden ("helt oacceptabelt, och det är inget vi står
  för"), sen eskaleringen som brådskande ärende och "svar inom de kommande
  dagarna", "har du mer information … svara" + bilderna på alla
  produktklagomål. Aldrig "jag eskalerar detta" som första rad. Opostad
  order ⇒ antalet dagar i klartext. **Returen:** vill kunden returnera och
  frågar hur ⇒ returinformationen direkt (lugn: ENKEL `retur`; arg: i
  ARG-svaret), ur brandfilens `tvister` (adress rad för rad, 30 dagar,
  policylänk; fraktkostnaden bara när `returfrakt_betalas_av` är ifyllt),
  flaggad + VA-PRIO. **WISMO:** aldrig avsändningsdatum, aldrig första
  sträckans fraktbolag, aldrig "framme i Sverige" eller en ort — bara var
  paketet ÄR, bävernumret och länken.
- **Andra rundan samma natt:** **inga tankstreck i mejl** ("det märker man
  direkt att det är AI"; testet felar på ett enda "—" eller "–" i en mall),
  **"svar inom 48 timmar"** (`svar.eskalering_timmar`), **ordernumret
  efterfrågas när det saknas** i stället för "har du mer information" (ARG
  hämtar alltid faktan så ordern hittas på e-posten), och returen säger
  **"posta direkt till adressen, inte till ett ombud"**. Returfönstret är 30
  dagar från mottagandet enligt SOP 18 och policyn (EU:s 14 dagars ångerrätt
  gäller parallellt).
- **Kunden är VA:ns i 14 dagar** (`hinkar.VA_KUND_DAGAR`): har VA:n skrivit
  till adressen i Skickat de senaste 14 dagarna — i vilken tråd som helst — får
  kunden inget automatiskt svar, bara flagga. Ulf 2026-09-22: fyra VA-svar i
  kontaktformulärstråden, nytt mejl som svar på en Judge.me-förfrågan ⇒
  trådregeln såg inget, eskaleringsmallen gick i munnen på VA:n. Rättat.
- **`--igen` är kalibreringsläget** (bara med `--torr`): flaggor och loggen
  ignoreras så fönstrets mejl bedöms på nytt, utkasten läggs i Drafts och Axel
  ger feedback på dem. Aldrig i rutinen — skarpt + `--igen` vägras av koden.

⚠️ **En brevlåda, EN session i taget.** 2026-09-21 23:28 körde två sessioner
torrkörningen samtidigt: Drafts fick sex utkast (fyra från den ena, ett från
den andra), flaggorna sattes av båda, och den ena såg därför inte mejlen den
andra redan flaggat. Kör aldrig `/autosvar` i två sessioner mot samma butik —
loggen och flaggorna är minnet, och de delas inte mellan containrar förrän
loggen är pushad.

Mappnamnen i Loopia är `INBOX.Drafts`, `INBOX.Sent`, `INBOX.VA-PRIO` (webbmejlen
visar dem utan `INBOX.`). Sedan 2026-09-22 slår `Brevlada` upp människans namn
mot brevlådans kända mappar (`Sent` ⇒ `INBOX.Sent`) och kastar `MAPP_SAKNAS`
för ett okänt namn — Roundcube själv svarar med en TOM lista för en mapp som
inte finns, och det gjorde Skickat- och Drafts-vakterna blinda i två körningar
(Ulf fick eskaleringsmallen fast VA:n mejlat honom fyra gånger den veckan; Hans
fick två utkast). Lita aldrig på "0 rader" från en mapp utan att veta att
mappen finns.

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
