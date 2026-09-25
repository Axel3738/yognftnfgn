# Sista stegen: Klaviyo för Bäverbutiken

Allt som går att göra utan nyckel och utan inloggning är klart (2026-09-24 natt).
Kvar är tre saker i ordning: **Cowork** gör klicken i Klaviyo och hos Loopia, **Axel**
lägger in nyckeln, och **en Claude Code-session** laddar upp allt som utkast.

---

## 1. Prompten till Cowork (klistra in hela rutan)

```
You are setting up the Klaviyo account for the Swedish web shop Bäverbutiken (baverbutiken.se). Klaviyo account public ID: QZ4jLG. Do ONLY the steps below, in order. Never send an email, never turn on a flow, never schedule a campaign, never delete anything, never touch MX, SPF or DKIM records that already exist. Do not type or copy any API key or password — if a step needs one, stop and tell Axel. After each step, write one line: done / not done + why.

1. Log in to Klaviyo (klaviyo.com) and check that the account's public API key / site ID is QZ4jLG (Settings → API keys, "Public API key"). If it is not QZ4jLG: STOP and report.

2. Billing: open Settings → Billing and write down the plan name, the profile limit and the current number of active profiles. Change nothing.

3. Attribution: Settings → Attribution (search "attribution" in Settings if the menu differs). For EMAIL set: conversions count on CLICKS only, window 5 days; opens do NOT count; turn ON "exclude Apple Mail Privacy Protection opens" (or equivalent). Save. Write down the old and new values.

4. Default sender: Settings → Brand / Account → Contact information (the place that says "default sender"). Set sender name "Bäverbutiken", sender email "kundsupport@baverbutiken.se", reply-to "kundsupport@baverbutiken.se". The sender is probably empty in this account. Never use kundsupport@baverkoppling.se — that domain has no mail server. Save. If Klaviyo asks to verify the address, trigger the verification email and tell Axel it is waiting in the kundsupport@baverbutiken.se inbox (Loopia webmail).

5. Branded sending domain: Settings → Domains (or "Sending domains") → Add sending domain → subdomain "send", domain "baverbutiken.se" (send.baverbutiken.se). If Klaviyo offers both "NS records" and "CNAME records", choose CNAME. Copy every DNS record Klaviyo shows (type, host/name, value) into your report.

6. Loopia DNS: log in to Loopia Kundzon (customerzone.loopia.se) → Domains → baverbutiken.se → DNS editor. Add EXACTLY the records from step 5 (under the subdomain "send" or the host names Klaviyo gives). Then add ONE more record if it does not already exist: host "_dmarc" on baverbutiken.se, type TXT, value "v=DMARC1; p=none;". Do not change or remove any existing record (MX, SPF "v=spf1 include:spf.loopia.se -all", A, CNAME www). Save. Screenshot the final record list.

7. Back in Klaviyo → Domains: press Verify. DNS can take up to 48 hours — if it is not verified yet, write "pending" and move on.

8. Subscriber list: Audience → Lists & segments. If a list named exactly "LISTA_nyhetsbrev" does not exist, create it (type: list, single opt-in). Then Integrations → Shopify → Settings: under "Sync email subscribers to Klaviyo" (or "Collect email subscribers"), choose the list "LISTA_nyhetsbrev" and make sure email consent sync is ON. Save.

9. Check Integrations → Shopify shows "Connected", and write down the date of the last sync.

10. Report back in one table: step, done/not done, values written down (plan, profile limit, old/new attribution, old/new sender, the DNS records, DMARC added yes/no, domain verified/pending, list id if visible).
```

## 2. Axels eget klick: nyckeln (Cowork får inte hantera nycklar)

1. Klaviyo → **Settings → API keys → Create Private API Key**.
2. Namn: `Claude motor`. Välj **Full Access**. Tryck **Create**.
3. Kopiera nyckeln (börjar med `pk_`). Den visas bara en gång.
4. På claude.ai: öppna miljömenyn i sessionens titelrad → **Edit** → lägg till en miljövariabel med namnet **`KLAVIYO_API_KEY_BAVERBUTIKEN`** och klistra in nyckeln som värde. Spara.
5. Klistra ALDRIG in nyckeln i en chatt.

## 3. Prompten till en ny Claude Code-session (klistra in hela rutan)

```
Klaviyo för Bäverbutiken: ladda upp allt som utkast. Allt är byggt och testat på grenen claude/bold-hopper-a95yg9 i Axel3738/yognftnfgn. Läs klaviyo/README.md, klaviyo/ARKITEKTUR.md och .claude/commands/klaviyo.md först, och följ /klaviyo exakt.

1. git fetch origin claude/bold-hopper-a95yg9 och checka ut grenen. Kör node --test klaviyo/test/*.test.mjs, allt ska vara grönt.
2. Kontrollera att miljövariabeln KLAVIYO_API_KEY_BAVERBUTIKEN finns (bara namnet, skriv aldrig ut värdet). Saknas den: stoppa och säg exakt var Axel lägger in den (klaviyo/SISTA-STEGEN.md steg 2).
3. node klaviyo/kolla.mjs och sedan node klaviyo/kolla.mjs --prov. public_api_key måste vara QZ4jLG, annars STOPP. Skriv in varje mätt punkt under "Obekräftat" i klaviyo/ARKITEKTUR.md med datum. Rätta motorn om en mätning visar att den gissat fel (t.ex. kassametrikens namn, content-type, send_strategy, fältet ItemNames för F07:s produktfilter i placed_order_egenskaper), med test.
4. node klaviyo/bygg.mjs (live-priser + Judge.me). Måste gå ut med 0 fel.
5. node klaviyo/ladda-upp.mjs (torrt). Läs planen. Kampanjer vars planerade datum redan passerat: flytta datumet i kampanjfilen till nästa lediga tisdag eller torsdag 18:00, i samma ordning, bygg om, och notera det i klaviyo/logg/baverbutiken/kampanjlogg.md.
6. node klaviyo/ladda-upp.mjs --skarpt. Allt ska bli utkast: kampanjer Draft, flödesmejl draft. Inget send-job, inget live. Kör om vid avbrott; motorn är idempotent (konto/baverbutiken/uppladdat.jsonl).
7. Verifiera med node klaviyo/kolla.mjs att segmenten, mallarna, kampanjerna och flödena finns och att inget är live eller schemalagt. Läs antalet profiler i SEG_samtycke och SEG_uppvarmning_steg1 och skriv in dem i docs/os/EPOST-STRATEGI.md med datum.
8. Uppdatera klaviyo/README.md (läget) och Klaviyo-avsnittet i CLAUDE.md med det du mätt. Committa, pusha grenen, skapa en PR mot main och merga den när klaviyo-testerna är gröna och npm test inte har fler fel än main (2026-09-24 var ett fel redan rött på main: factory/test/kassabild.test.mjs, inte Klaviyos). CLAUDE.md: main är den enda som gäller.
9. Slutrapport till Axel på svenska, kort: vad som finns i Klaviyo nu (länkar till flödena och kampanjerna), och hans uppgifter sist, numrerade:
   a) svara vilka som får kampanjer (A bara subscribed, rekommenderas; B + köpare i kategoriflöden; C alla köpare),
   b) kolla i Shopify admin → Inställningar → Kassa om rutan för e-postreklam är förikryssad,
   c) godkänn att flödena slås på i den här ordningen: F02 kassa, F04 efter köp, F07 motorhölje → båtmotorskydd, F05 vinback, F06 sunset. Samma dag som F02 går live stänger han av Shopifys egen notis (Inställningar → Aviseringar → Övergiven kassa),
   d) godkänn K01 (29 sep eller nästa lediga dag) för schemaläggning.
Skicka ingenting och slå inte på något själv. Bygg inga schemalagda rutiner.
```

---

## Utfall, Cowork 2026-09-25 (steg 1–5 klara, stopp vid Loopia-inloggningen)

| Steg | Resultat |
|---|---|
| 1 | Kontot är **QZ4jLG** (företaget "Bäverbutiken"), inte TMFt7M. Sajten laddar också QZ4jLG sedan 2026-09-25, så QZ4jLG är rätt konto. |
| 2 | ⚠️ **Gratisplanen: gräns 250 profiler, 0 aktiva profiler.** Shopify-kunderna (6 186 med samtycke) finns alltså inte i kontot än, och gratisplanen rymmer dem inte. En betald plan är Axels beslut. |
| 3 | ✅ Attributionen är ändrad från öppning 5 d / klick 5 d till **bara klick, 5 dagar**, med Apple MPP-öppningarna uteslutna. Klaviyo låser inställningen i upp till 36 h. |
| 4 | ✅ Avsändaren var redan "Bäverbutiken" / kundsupport@baverbutiken.se. Kontot har ingen global reply-to, så svaren går till avsändaren. |
| 5 | ✅ Sändardomänen send.baverbutiken.se är vald, med typen Marketing och routingen Dynamic. Klaviyo erbjöd **bara NS-poster**, inte CNAME. Klaviyos egen DMARC är avslagen, eftersom vi lägger in vår egen. |
| 6 | ❌ Loopia kräver inloggning, och Cowork skriver inte lösenord. |

**Posterna som ska in hos Loopia** (domänen baverbutiken.se):

| Typ | Namn | Värde |
|---|---|---|
| NS | send | ns1.klaviyo.com |
| NS | send | ns2.klaviyo.com |
| NS | send | ns3.klaviyo.com |
| NS | send | ns4.klaviyo.com |
| TXT | @ | klaviyo-site-verification=QZ4jLG |
| TXT | _dmarc | v=DMARC1; p=none; |

MX, SPF, A och www rörs inte. TXT-posten på @ läggs bredvid SPF-posten och ersätter den inte.

## Utfall, Cowork 2026-09-25 (steg 6–9)

| Steg | Resultat |
|---|---|
| 6 | ✅ `_dmarc` TXT `v=DMARC1; p=none;` inlagd hos Loopia. ❌ NS-posterna för `send` gick inte: Loopias DNS-editor kan inte delegera en underdomän. ❌ TXT @ `klaviyo-site-verification=QZ4jLG` inte inlagd än. |
| 7 | ⏳ Verify står på **pending**, eftersom NS-posterna saknas. |
| 8 | ✅ Listan `LISTA_nyhetsbrev` (`ThfZj2`) är kopplad till Shopify-synken med samtyckessynk på. |
| 9 | ✅ Shopify ansluten. Importen av kunderna pågick (11 %) vid rapporten. |

**Val för sändardomänen (Axels beslut 2026-09-25, rekommendation A):**
A) Be Loopias support lägga in de fyra NS-posterna för `send` + TXT @ (de kan göra det som editorn inte kan).
B) Låt Cowork byta routing i Klaviyo från Dynamic till Static och se om Klaviyo då ger CNAME-poster, som Loopias editor klarar.
Tills domänen är verifierad skickar Klaviyo från sin delade domän. Det fungerar, men sämre leveransbarhet; inga utskick innan den är klar.

---

# Matstrumpor (kontot UV6Rqg), skrivet 2026-09-25

Motorn är brand-parametriserad och allt för Matstrumpor ligger i Klaviyo som utkast
(`klaviyo/README.md` → Matstrumpor). Tre saker kan API:t inte göra, och en fjärde
(DNS) gör vi i en SEPARAT körning på Axels ord. Ordningen: **Cowork** gör klicken i
Klaviyo, **Axel** läser av resultatet, och **en Claude Code-session** slår på flödena
och schemalägger K01 när villkoren nedan är uppfyllda.

## Villkoren för att slå på något (Axels beslut 2026-09-25)

Flödena får slås på (`node klaviyo/sla-pa.mjs --brand matstrumpor <namn …> --ja`) och
K01 schemaläggas (`node klaviyo/schemalagg.mjs --brand matstrumpor K01 --ja`) BARA om
alla fem stämmer. Mätt 2026-09-25 av sessionen som byggde:

| Villkor | Läge 2026-09-25 | Vad som löser det |
|---|---|---|
| Kontot har postadress | ❌ **Saknas**: `contact_information.street_address` är tom, landet står på "United States" | Cowork-prompten steg 4 |
| Planen rymmer volymen | ❓ **Går inte att läsa via API:t.** Kontot har 4 357 profiler; november kräver cirka 20 000 mejl (`innehall/matstrumpor/KALENDER-2026.md`) | Cowork-prompten steg 2 läser Billing och skriver in planen |
| Köparflödena har kundundantag | ✅ F04, F05, F07 bär `kundundantag` (Fulfilled/Placed Order), uppladdaren stoppar annat | — |
| Kampanjerna går bara till subscribed | ✅ Alla 14 går till `SEG_*`-segment med samtyckesvillkoret; uppladdaren stoppar annat | — |
| Ett renderat testmejl ser rätt ut | ❌ Kan inte mätas förrän adressen finns (`template-render` fyller inte `organization.full_address`) | Cowork-prompten steg 5 |

**Allt ligger därför som utkast.** Ingenting är påslaget, ingenting schemalagt.

## Klubben och fonten (2026-09-25 eftermiddag, Axels två order)

Listan är **Matstrumpor-klubben** och alla mallar bär butikens font Mochiy Pop P One
(`klaviyo/README.md` → Matstrumpor, raderna Fonten och Klubben). Alla sju flöden är
**v2** (v1-utkasten raderade), kampanjerna patchade på plats. Sajtens anmälningsruta i
sidfoten säger "Gå med i Matstrumpor-klubben" / "Gå med" sedan 16:35 CEST (live, läst
tillbaka). Två saker är Axels, inte byggda:

- **Namnet.** "Matstrumpor-klubben" är sessionens val. Vill Axel ha ett annat: byt
  `klubb.namn` + `klubb.sajt` + `sidfot_varfor` i `brands/matstrumpor.json`, skriv om
  F01 E1/F06 (`_v3`), bygg om, `ladda-upp --skarpt --uppdatera`, `stada.mjs --ja`,
  `klubb-sajt.mjs --skarpt`.
- **Ett anmälningsformulär i Klaviyo** (popup eller inbäddat "Gå med i klubben"). Klaviyos
  Forms API kan inte skapa formulär, så det är ett klick i Klaviyo (Sign-up forms → Create
  form). Axels beslut för Bäverbutiken 2026-09-24 var "ingen popup än"; för Matstrumpor
  finns inget beslut. Sidfotens Shopify-formulär räcker tills vidare: den som fyller i det
  hamnar på Email List och får F01 när flödet är på.

## 1. Prompten till Cowork (klistra in hela rutan)

```
You are setting up the Klaviyo account for the Swedish web shop Matstrumpor (matstrumpor.se). Klaviyo account public ID: UV6Rqg. Do ONLY the steps below, in order. Never send an email, never turn on a flow, never schedule a campaign, never delete anything, never touch DNS in this run. Do not type or copy any API key or password — if a step needs one, stop and tell Axel. After each step, write one line: done / not done + why.

1. Log in to Klaviyo (klaviyo.com) and check that the account's public API key / site ID is UV6Rqg (Settings → API keys, "Public API key"). If it is not UV6Rqg: STOP and report. Never touch the account QZ4jLG (that is another shop).

2. Billing: open Settings → Billing and write down the plan name, the profile limit, the monthly email limit and the current number of active profiles. Change nothing. Note for Axel: the account has 4 357 profiles and November needs about 20 000 emails, so the plan must cover at least 4 357 profiles (the 4 001–5 000 tier gives 50 000 emails/month).

3. Attribution: Settings → Attribution (search "attribution" in Settings if the menu differs). For EMAIL set: conversions count on CLICKS only, window 5 days; opens do NOT count; turn ON "exclude Apple Mail Privacy Protection opens" (or equivalent). Save. Write down the old and new values.

4. Contact information and sender: Settings → Account → Contact information (or Settings → Brand). Organization name "Matstrumpor". Street address: Sjöhed 160, postal code 442 74, city Harestad, country Sweden (this is the company address in Shopify; the field currently says United States). Default sender name "Matstrumpor", sender email "kundsupport@matstrumpor.se", reply-to "kundsupport@matstrumpor.se". Save. If Klaviyo asks to verify the address, trigger the verification email and tell Axel it is waiting in the kundsupport@matstrumpor.se inbox (Loopia webmail).

5. Check the address in a real email: Content → Templates → open the template named TPL_k01-de-tror-att-det-ar-sushi_v1 → Preview → Send test email to Axel's address. Open the email and confirm the footer shows "Matstrumpor, Sjöhed 160, 442 74 Harestad, Sweden" (or the same address in Klaviyo's format) and an unsubscribe link. Write down exactly what the footer says.

6. Shopify integration: Integrations → Shopify. Confirm it shows "Connected" and that "Sync email subscribers to Klaviyo" points to the list "Email List". Write down the date of the last sync. Change nothing.

7. Sending domain, READ ONLY in this run: Settings → Domains. Write down whether a branded sending domain exists. If not, open "Add sending domain", type subdomain "send" and domain "matstrumpor.se", and copy every DNS record Klaviyo shows (type, host/name, value) into your report — then CANCEL without saving if Klaviyo would start a verification, or leave it pending. Do NOT log in to Loopia and do NOT change any DNS record in this run.

8. Report back in one table: step, done/not done, values written down (plan, limits, active profiles, old/new attribution, the footer text from step 5, last Shopify sync, the DNS records from step 7).
```

## 2. DNS för send.matstrumpor.se och DMARC (SEPARAT körning, bara på Axels ord)

Mätt 2026-09-25 med dns.google: `matstrumpor.se` NS = **ns1.loopia.se / ns2.loopia.se**,
A = **23.227.38.65** (Shopify), MX = **10 mailcluster.loopia.se / 20 mail2.loopia.se**,
SPF `v=spf1 include:spf.loopia.se -all`, **DMARC saknas** (`_dmarc.matstrumpor.se` NXDOMAIN),
`send.matstrumpor.se` finns inte.

⛔ **Byt ALDRIG namnservrar för matstrumpor.se.** 2026-09-25 lade Loopia in Klaviyos
namnservrar på HELA baverbutiken.se i stället för bara på `send`, och sajten, mejlen och
kundtjänstboten slutade fungera. Därför:

- Klaviyos poster läggs bara på underdomänen `send.matstrumpor.se`, som vanliga poster i
  Loopias DNS-editor (NS-poster med namnet `send`, eller CNAME/TXT om Klaviyo erbjuder det).
- Skriv aldrig en text till Loopia som ber dem "byta namnservrar". Går inte posterna in i
  editorn: stoppa och fråga Axel, aldrig en support-begäran som kan misstolkas.
- DMARC: host `_dmarc`, typ TXT, värde `v=DMARC1; p=none;` på matstrumpor.se. Rör inte MX,
  SPF, A eller CNAME www.
- **Mät efter varje ändring:** `https://dns.google/resolve?name=matstrumpor.se&type=NS`
  ska svara ns1.loopia.se/ns2.loopia.se, `type=A` 23.227.38.65 och `type=MX` Loopia.
  Svarar NS något annat: ring Loopia direkt och återställ.
- Tills domänen är verifierad skickar Klaviyo från sin delade domän. Det fungerar, men
  sämre leveransbarhet.

## 3. Prompten till en ny Claude Code-session när villkoren är gröna (klistra in hela rutan)

```
Klaviyo för Matstrumpor: slå på flödena och schemalägg K01. Läs klaviyo/README.md (Matstrumpor-avsnittet), klaviyo/SISTA-STEGEN.md (Matstrumpor) och .claude/commands/klaviyo.md först.

1. node klaviyo/kolla.mjs --brand matstrumpor --profiler. public_api_key måste vara UV6Rqg. Kontrollera att kontot nu HAR postadress (varningen "saknar postadress" ska vara borta) — annars STOPP, ingenting slås på.
2. Kontrollera planen som Cowork skrev in i klaviyo/innehall/matstrumpor/KALENDER-2026.md: rymmer den 4 357 profiler och cirka 20 000 mejl i november? Annars STOPP.
3. node klaviyo/sla-pa.mjs --brand matstrumpor FLOW_checkout_overgiven_v2 FLOW_order_efterkop_v2 FLOW_order_aterkop-sushi_v2 FLOW_order_vinback_v2 FLOW_segment_sunset_v2 FLOW_lista_valkomst_v2 FLOW_visad-produkt_webbhistorik_v2 (torrt — det är v2-flödena, v1-utkasten är raderade), läs planen, sedan samma med --ja. Samma dag: stäng av Shopifys egen notis om övergiven kassa i Matstrumpors admin (Inställningar → Aviseringar → Övergiven kassa) — det är Axels klick, säg det.
4. node klaviyo/schemalagg.mjs --brand matstrumpor K01 (torrt) och sedan --ja. Är 29/9 passerat: flytta K01:s "planerad" i kampanjfilen till nästa tisdag 18:00, bygg om, ladda upp med --uppdatera, och skriv det i klaviyo/logg/matstrumpor/kampanjlogg.md.
5. Läs tillbaka med kolla, uppdatera klaviyo/README.md (Matstrumpor-läget), committa och pusha.
Slå aldrig på något om steg 1 eller 2 är rött. Bygg inga schemalagda rutiner.
```

## Läget 2026-09-25 förmiddag: det som återstår är Axels (Bäverbutiken)

Allt som går att göra utan Axel är gjort. I Klaviyo ligger 14 kampanjer (Draft), 7 flöden (draft) och 14 segment.
Flödena är F01 XY5QXa, F02 XgrxZ9, F03 XMi5Wa, F04 TyH2jg, F05 VgvDum, F06 TTsxRQ och F07 QXZzvn.
De gamla köparflödena YgzScd, XyVzec och WLDZUM får aldrig slås på.

Kvar, i ordning:
1. **Postadress + avsändare sparade** (Settings → Account → Contact information, land Sweden, Save). Kontroll: rendera en mall (`POST /api/template-render`) och läs sidfoten. API:t `contact_information` var tomt även när fälten syntes ifyllda.
2. **Sändardomänen:** Loopia lägger in NS för `send` (Axel har begärt det). TXT @ och DMARC finns (mätt i DNS). Därefter Klaviyo → Settings → Domains → Verify.
3. **Betald plan** (Axel valde en 2026-09-25). Mät `SEG_samtycke` igen när Shopify-importen är klar.
4. **Axels ok** på att flödena slås på i ordningen F02, F04, F07, F05, F06, F01, F03. Samma dag som F02 går live stängs Shopifys egen notis om övergiven kassa av.
5. **Axels ok** på K01 för schemaläggning. B- och C-ämnesraderna läggs in som A/B-test för hand.
