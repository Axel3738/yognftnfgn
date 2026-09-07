# OPS Factory — planen framåt

**Skriven:** 2026-09-05 (Axels muntliga plan, nedtecknad samma kväll)
**Gäller:** alla OPS-butiker som byggs ur fabriken. Hemvakten är butik nr 1.
Bäverbutiken och Grillkliniken berörs inte.

## 0. Namnregeln (Axels beslut 2026-09-07)

Varje ny OPS-butik får ett brandnamn som **funkar på alla marknader**:
läsbart och uttalbart på både svenska och engelska, aldrig å/ä/ö, och samma
namn ska kunna användas i .se, .no, .dk och .com utan att brandas om.
Valideringen varnar på å/ä/ö. Hemvakten byggdes före regeln och behålls —
Axels beslut 2026-09-07: Hemvakten är ett RENT SVENSKT brand och positioneras
aldrig som norskt. Norge-marknaden finns tekniskt men marknadsförs inte.

## 1. Annonsöversättaren: Bäverbutikens annonser → OPS-brandet

Varje OPS-produkt har redan bevisade annonser på Bäverbutiken. De ska
återanvändas — men allt som säger **Bäverbutiken** (uttalat i voiceover,
inbränt i text, i captions) måste bytas till OPS-butikens brand innan de
får användas.

- Bygg som en **brand-swap-variant av befintliga `/translate`-pipelinen**
  (HeyGen röstklon + lip-sync, `pipeline/localize.mjs`) — samma flöde,
  men samma språk och bara brandnamnet ändras. Bygg inget nytt system.
- Järnregeln ärvs: skanna källvideon efter inbränd "Bäverbutiken"-text
  före leverans — HeyGen byter bara ljudet.
- Fel pixel-regeln gäller annonserna med: OPS-butikens annonser går ALDRIG
  mot Bäverbutikens page/pixel/konto.
- Status: **inte byggd.** Första körning: motorhöljets/kamerans vinnare →
  Hemvakten när ad account + pixel finns.

## 2. En redigerare per OPS-butik

- Varje OPS-butik får en egen dedikerad redigerare (samma modell som
  Bäverbutikens team, men 1:1 butik–redigerare).
- Alla FRAMTIDA annonser till OPS-butikerna skapas med **Palmier Pro**
  (bekräftat av Axel 2026-09-05). Konto/åtkomst finns inte i repot ännu —
  be Axel om inlogg/API när första annonsbatchen ska göras.
- Redigerarens briefer, kvot och commission följer husets befintliga system
  (Notion creative hub per butik, `/commission`-satsen beslutas separat).

## 3. UGC-planen

- Planen byggs ur **UGC-cheat-listan** (Axels lista — under arbete 2026-09-05,
  läggs in i repot när den finns; koppla till befintliga `/ugc` och SOP-03).
- Tre kommandon bär flödet, i ordning:
  1. `/ugc-research` — bygger vetting-ramverket (`factory/ugc/vetting-framework.md`)
     ur Santiagos micro-influencer-kurs (Happy Flops-grundaren; hämtas med
     `whop-downloader/`) översatt till UGC, plus öppen research och husets playbook.
  2. `/ugc-scout <butik>` — hittar svenska kreatörer (hälften män, hälften
     kvinnor), filtrerar genom ramverket, skriver personliga outreach-meddelanden.
     Skickar aldrig utan Axels ok per batch. Villkoren måste stå i
     `factory/ugc/villkor.md` först.
  3. `/ugc` — befintliga pipelinen tar över när en kreatör tackat ja.
- OPS-butikens redigerare sköter själv kommunikationen med UGC-kreatörerna
  för sin butik — inte Axel, inte VA:n.

## 4. Rekryteringsmotorn: standby-pool av redigerare

Målet: aldrig vänta på en redigerare när en ny OPS-butik launchar.

1. **Spamma ut jobbannonser** löpande (samma kanaler som gav filippinska
   teamet) — inte när behovet uppstår, utan hela tiden. Kanalen är
   **OnlineJobs.ph** och annonsen som gav teamet ligger ordagrant i
   `factory/rekrytering/jobbannons-video-editor.md` (codeword-test,
   3-stegsfunnel, lönetrappa) — återanvänd den, byt bara codeword.
2. Kandidater som klarar testet läggs i en **standby-lista**.
3. Standby-avtal: **100–200 kr/månad** i beredskapsersättning — de förbinder
   sig att vara redo att börja direkt när en butik behöver dem.
4. Ny OPS-butik → plocka nästa namn ur listan → anställ på riktigt.

⚠️ Beredskapsersättningen är Axels beslut 2026-09-05. Nivån (100 eller 200)
och vad "redo" betyder i avtalet är inte spikat — spika före första utskicket.

## 4b. Discord-server per OPS-butik (Axels beslut 2026-09-07)

Varje ny OPS-butik får en egen Discord-server, byggd av boten — och boten
plockar samtidigt nästa lediga redigerare ur standby-listan.

- Motorn: `factory/discord.mjs` (byggd, testad). Kräver **DISCORD_BOT_TOKEN**
  i env — Axel skapar boten på discord.com/developers och klistrar in token.
- Kanalstrukturen (fast, samma för varje butik):
  PRODUKTION: `#creative-strategy` · `#ads-to-do` · `#annons-uppladdning` · `#ads`
  DRIFT: `#konton` (PRIVAT — lösenord ses bara av ägaren + butikens redigerare)
  · `#customer-support`
- Redigerarplockningen: första raden med status `redo` i
  `factory/redigerare/standby.md` märks `tilldelad <butik> <datum>`.
- ⚠️ En bot kan bara SKAPA servrar så länge den sitter i < 10 (Discords
  gräns). Därefter: Axel skapar servern, boten bygger kanalerna med `--guild`.

```bash
node factory/discord.mjs factory/butiker/<butik>.yaml --torr   # visa planen
node factory/discord.mjs factory/butiker/<butik>.yaml          # skarpt
```

## 5. Rutinfrågan: egen rutin, inte samma

Rekommendation (Axel frågade 2026-09-05): **kör rekryteringen som en EGEN
rutin**, skild från annonsproduktionens rutiner.

- Produktionsrutinerna (bildannonser, notionkörning, leveransrundan) är
  dagliga och produktbundna. Rekrytering är veckovis och personbunden —
  olika takt, olika verktyg (jobbplattformar/Slack, inte Meta/Notion).
- En trasig jobbannons-körning får aldrig stoppa en leveransrunda.
- Förslag: veckorutin "OPS-rekrytering" — kollar inkorgen med ansökningar,
  uppdaterar standby-listan, flaggar när poolen är tunn (< 2 lediga).
- Standby-listan bor i repot (fil, inte chatt) så varje session ser läget.

## 6. Q4-ramverket (Axels beslut 2026-09-07, standard för varje OPS)

Från Q4-genomgången Axel skickade. Tre delar, i prioritetsordning:

1. **Bonus i stället för djupare rabatt.** Varje butik får en billig
   komplementprodukt som (a) läggs som GRATIS bonus i paketnivåerna —
   "köp mer, få mer" trappat på ordervärdet — och (b) säljs som betald
   upsell i varukorgslådan. Rabattkoderna höjs med bonusens värde så
   kassapriset stämmer på öret. ✅ Byggt och bevisat på HeimGuard
   (varningsskyltar 149 kr): mall i `produkt-mall.yaml` →
   `offer.bonus_produkt`, temakoden i `tema.mjs` → `byggKorgUpsell`.
2. **Banka creatives i förväg.** Inför säsong (Q4, sommar) produceras
   DUBBLA mängden creatives innan trycket börjar — testkön får aldrig
   stå tom när CPM:erna är som dyrast och volymen som störst.
3. **Större PO före säsong.** Lagret/leverantörskapaciteten säkras i
   förväg så en vinnare kan skalas utan att sälja slut. För dropshipping:
   bekräfta leverantörens kapacitet och leveranstid INNAN skalning.

## 7. Delegeringen: Axel ska inte jobba (Axels mål 2026-09-07)

Slutläget: **Axels enda jobb per ny butik är att skapa den och betala.**
Allt annat gör en VA med fabriken. Uppdelningen:

**Engångs-setup (Axel, en gång totalt):**
1. Shopify-personal till VA:n med fem behörigheter: Onlinebutik, Appar
   och försäljningskanaler, Hantera inställningar, Domäner,
   Betalningsinställningar.
2. VA:n kör på AXELS Claude-konto (Axels beslut 2026-09-07: "jag bryr
   mig inte" — en egen plats kostade ~300 kr/mån; invändningen att kontot
   når Meta-kontona och minnet framfördes och överkördes). Nycklarna
   hennes byggen behöver (META_ACCESS_TOKEN, DISCORD_BOT_TOKEN,
   KIE_API_KEY + butikens egen SHOPIFY_ADMIN_TOKEN) bor i `factory/.env`.
3. Loopia-inlogg till VA:n med företagskortet sparat → domänköp +
   mejlvidarebefordran delegerat.
4. Företagskortet in i Meta Business Manager EN gång + VA:n som anställd
   → nya annonskonton drar från samma kort utan att VA:n ser kortet.
5. VA:n använder sitt eget Discord-konto — boten bygger kanalerna.

**Per ny butik:**
- 🖐 Axel: skapar Shopify-butiken (betalningen). Klart — inget mer.
- ⚙️ VA:n: kör fabriksrutinen i Claude (PROCESS.md), bockar CHECKLISTA.md,
  inklusive Shopify Payments-aktiveringen (bolagsuppgifterna står i
  butik-mallen: STONEBITE ECOM AB, 559576-2401).
- Claude bygger allt via API som i dag; VA:n är händerna för de klick
  API:t inte når.

## Ordningen

1. Färdigställ Hemvakten (Judge.me + domän + språk + v2-temat publicerat).
2. Brand-swap-pipelinen (punkt 1) — behövs före första annonskörningen.
3. Rekryteringsannonserna ut (punkt 4) — ledtiden är längst där.
4. Redigerare + UGC-plan när Hemvakten har spend.
