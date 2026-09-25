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
