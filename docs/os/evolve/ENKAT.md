# Köparenkäten: planen (2026-09-30)

> **Axels beslut 2026-10-01: alternativ A, BARA Matstrumpor, ingen belöning.**
> Bäverbutiken och CaraShell får ingen enkät; raderna om dem nedan är historik.
> Bygget och läget står i `enkat/README.md`.

Ingenting är byggt. Planen utgår från förslaget "Tre frågor direkt efter köpet". Det fick högst betyg av tre domare (22 poäng, mot 21, 11 och 9). Delar är lånade från de andra förslagen, och allt domarna fällde är rättat. Axels rättelse 2026-09-30 väger tyngst.

## Varför

Vi vet inte varför köparna köper. Kommentarerna visar vad publiken invänder, och kundtjänsten får mest leveransfrågor (cirka 70 % i Bäverbutiken, W38). I kursen gav en köparenkät huvudbegäret, när 43-46 % angav samma köpskäl (Dec 5 [17:54]). Samma samtal berättar om en invändningsannons som blev top spender ([18:40]). Chad säger att enkäten ska hitta köpare man inte visste om [C5].

## Frågorna

Alla frågor är fritext och frivilliga, och alla går att svara på före leveransen. Ingen fråga gäller själva produkten.

| Nr | Fråga på svenska | Typ | Vad svaret matar | Källa |
|---|---|---|---|---|
| 1 | Vad hände som gjorde att du köpte det här just nu? *(din version: "Vad hände som gjorde att du letade efter det här?")* | Fritext | Begär, vinkel, cold hook, avatar. Varje köpskäl som återkommer blir en hooktext | Din rättelse, Dec 5 [17:54], Chad [C4] [C5], Video Hooks [10:13] |
| 2 | Var såg du produkten? Skriv gärna vilken app eller sida, eller vem som tipsade dig. | Fritext | Kanal. Undantagen (en vän, TikTok, ett forum) är köpare som kom utanför annonserna | Din rättelse, dina tips punkt 2 |
| 3 | Köpte du det till dig själv eller till någon annan? Om det är en present: till vem (till exempel pappa, en vän, en kollega) och vid vilket tillfälle? | Fritext | Avatar när köparen inte är användaren, presentvinklar och tillfällen (fars dag, jul). Bär mest i Matstrumpor | Din rättelse. Chad: gåvoköpare "not covered", så vi mäter själva |
| Reserv | Var det något som nästan fick dig att låta bli att köpa? | Fritext | Köparens egen invändning, som blir en OB-annons. Invändningen väljer formatet: pris ger produktbild, "funkar det?" ger transformation, förtroende ger testimonial | Dec 5 [18:40], Art of 1 Frame [16:28] [18:50], Feb 27 [32:51] |

**Här säger vår data emot rättelsen. Du avgör i frågan nedan.**
- Fråga 1: nästan all trafik kommer från Meta-annonser, så de flesta köpare letade aldrig. Med "köpte det här just nu" fångar vi både den som letade och den som fastnade för en annons.
- Fråga 2: av samma skäl blir svaret mest "Facebook". Kursen säger att annonserna styr vilka kunder vi får (Dec 5 [10:02]). Förslaget är därför en bytesregel: säger minst 80 % av de 50 första svaren bara Facebook, Instagram eller annons, byts fråga 2 mot reservfrågan. Regeln är vår egen.
- Chads "noll svar efter leveransen" vilar på ett citat som kan betyda att enkäten aldrig blev av [C3], och kursen säger bara "post purchase survey" (Shaun & Spencer [44:31]). Vi följer ändå rättelsen. Vår egen data pekar åt samma håll: 77 av 84 svar på Judge.me:s mejl före paketet gällde leveransen (W38).

**Struket, och varför**
- Ålder: det blir flerval, och köparens ålder finns redan i Metas spend per ålder (Apr 24 [10:59]).
- "Vad gör du?" och "Vad är viktigt för dig?": för vaga. Fråga 1 täcker det som bär.
- "Hur används den?", "Vad ska vi bli bättre på?" och "Vad mer vill du köpa?": de kräver att paketet har kommit, så de väntar.

## Var och när

Alla vägar leder till samma dolda sida i butiken, **/pages/enkat**. Den är gömd för sökmotorer och ligger inte i någon meny. Svaren skickas med Shopifys vanliga kontaktformulär, så ingen ny server och ingen ny app behövs. Länken bär bara kanalen (`k=`) och produktens handle (`p=`). Den bär aldrig e-post, ordernummer eller annons. Överst på sidan står "Frågor om din order? Skriv till oss här", med en länk till kontaktsidan.

| Butik | Var | När | Fas 1 |
|---|---|---|---|
| CaraShell | Ett eget kort på **tacksidan**, bredvid erbjudandekortet i appen CaraShell Tacksida som redan finns (`k=tack`). Kortet ligger inte inne i erbjudandet, eftersom erbjudandet gömmer sig självt ibland. Appen får inga nya rättigheter, och network_access förblir av | Sekunder efter betalningen | Ja, sv/nb/da/en/fi |
| Bäverbutiken | En ruta i **orderbekräftelsen** (mallen v14 i `mejl/`), under kreditrutan (`k=ob`) | Inom en minut | Ja, svenska |
| Matstrumpor | En ruta i den svenska **orderbekräftelsen** (`k=ob`) | Inom en minut | Ja, svenska kunder |
| NO, DK, FI | Inget än. Brevlådelösenorden saknas i miljön, autosvaret läser inte deras lådor, och Beverbutikkens webbmejl hos Domeneshop är inte prövat | | Nej |

- **Orderstatussidan får inget kort i fas 1.** Kunden kommer dit medan hen väntar på paketet, och extensionen läser i dag inte orderns datum. Därför går kortet inte att gömma i tid.
- **Tacksidan är inte bevisad i CaraShell.** Rapporten för 30 dagar gav 1 tilläggsorder via orderstatussidan och 0 via tacksidan. Cowork kontrollerar blocket och lägger in det om det saknas.
- **Fas 2** avgörs efter 14 dagar. Ger orderbekräftelsen under 2 svar per 100 ordrar, i en butik med minst 500 ordrar, får du frågan om egna tacksidesappar för Bäverbutiken och Matstrumpor. För Matstrumpor gäller det alla 14 språk före fars dag 8/11. Gränsen 2 per 100 är vår egen, eftersom ingen källa har svarsfrekvenser.

## Språk

- **CaraShell:** sv, nb, da, en och fi, samma språk som extensionen redan har. Sidan byter språk med locale-grenar och har svenska som reserv.
- **Bäverbutiken och Matstrumpor:** bara svenska i fas 1. Matstrumpors andra språk får i dag Shopifys egen standardöversättning av notiserna. En svensk ruta når alltså bara svenska kunder. Sessionen läser översättningarna före och efter, så att inget annat språk ändras.
- **Fas 2 för Matstrumpor:** 13 språk till. Alla utländska länkar går till matstrumpor.com/<mapp> (engelska i roten), aldrig .se/<språk> eller .eu. Portugisiskan heter pt-PT och ligger på /pt. Taiwan ligger på .com/zh-tw. Adresserna tas ur `sparning/butiker.json`.
- **Texterna:** sessionen skriver svenskan. Sonnet-subagenter översätter mot `matstrumpor/marknader/REGLER.md`, och en skeptisk granskare läser efter. Varje språk läses tillbaka ensamt som kund, eftersom en batchläsning har gett fel språk förut.
- **Svaren** sparas på originalspråket, med en svensk översättning bredvid. De räknas per produkt över alla språk. Ett mönster som bara finns i ett land märks, till exempel "bara NO".

## Belöning och samtycke

- **Ingen belöning i fas 1.** Det följer rättelsen punkt 5 och Chad [C6] ("just no need" för en kort enkät). Då mäter vi också svarsgraden rent.
- **Inget samtycke behövs i fas 1.** Kortet på tacksidan är inget mejl. Orderbekräftelsen går redan till alla köpare, och enkätrutan har inget säljande och ingen belöning. Bäverbutikens orderbekräftelse bär redan ett säljande block (KREDIT100), så påståendet gäller bara att **enkäten inte lägger till något säljande**. Det är inte juridiskt prövat.
- **Rutan och sidan säger aldrig** vinn, pris, rabatt, utlottning eller KREDIT100. Ett test vaktar det.
- **Ingen review gating.** Inga stjärnor och ingen länk till Trustpilot eller Judge.me. Svaren styr aldrig vem som får recensionsmejlen.
- **Ett svar blir aldrig ett kundcitat,** en recension eller "verifierad kund" i ett mejl, på sajten eller i en annons. Det används bara som språk i en brief.
- **GDPR-raden under formuläret:** "Vi frågar inte efter namn eller e-post. Skriv inga namn och inget om din hälsa. Vi sparar svaren i högst 12 månader och använder dem för att förbättra produkter och annonser. Avidentifierade citat utan namn kan sparas längre. Läs mer i vår integritetspolicy." Raden länkar till butikens policy. En kort ruta säger vem som frågar: STONEBITE ECOM AB, Stenkolsgatan 1B, 417 07 Göteborg.
- **Integritetspolicyn måste nämna enkäten innan första länken går live.** Policyerna sköts automatiskt av Shopify. Cowork lägger in ett stycke om det går utan att stänga av automatiken. Går det inte stannar Cowork, och du får välja.
- **Gallring:** fritextsvaren committas ALDRIG till repot (git kan inte glömma). De ligger i mappen INBOX.ENKAT i högst 12 månader. Till repot går bara kodningen och citat som sessionen läst och rensat från namn och hälsa. Rutinen pingar VA:n första vardagen varje månad på engelska i butikens `#customer-service` med hur många mejl som passerat 12 månader, och hon raderar dem i webbmejlen. Sessionen raderar aldrig själv.
- **Om du väljer en utlottning (alternativ C):**
  - EN tidsbegränsad utlottning av ett presentkort, med fast dragningsdatum och oförändrade priser.
  - Den syns bara när sidan öppnats från CaraShells tacksida (`k=tack`), aldrig från orderbekräftelsen (`k=ob`): orderbekräftelsen går till alla köpare utan avregistreringslänk och skulle bli reklam. Bäverbutikens och Matstrumpors köpare kan alltså inte vara med förrän fas 2 har egna tacksidesappar.
  - Villkoren står fullt ut (MFL 9-10 §): arrangör, vem som får delta, att inget ytterligare köp krävs, priset och dess värde, sista dag, hur och när vinnaren lottas och meddelas, och en kontaktadress.
  - Den kräver e-post i ett eget frivilligt fält som inte heter "E-post"/"Email"; `contact[email]` är fortfarande noreply så att autosvaret aldrig svarar. GDPR-raden skrivs om för utlottningen. Uppgifterna raderas efter dragningen, och vinnaren skrivs som förnamn plus initial.
  - Den står aldrig i orderbekräftelsen. Ett enkätmejl med utlottning är reklam och går bara i ett köparflöde till dem som inte tackat nej, med avregistreringslänk. Till Norge går det bara med samtycke.
  - Ingen utlottning varje månad, eftersom det är en gråzon.
  - Detta är ingen juridisk rådgivning.

## Svaren blir voc

**Kedjan**
1. Formuläret skickar alltid från en fast adress, `noreply@` plus supportdomänen (baverbutiken.se, carashell.com, matstrumpor.se). Formuläret har ett dolt fält med markören `ENKAT-v1 · butik · språk · kanal · produkt`. JavaScript lägger också markören och svaren i textfältet, som reserv, eftersom bara textfältet är mätt i notisen.
2. Shopify skickar "Nytt kundmeddelande" till butikens supportlåda. Autosvaret hoppar över mejlet som systemavsändare. Det är provkört i alla tre butikerna, och ingen rad i autosvaret ändras.
3. Ett eget skript, `enkat/las.mjs`, körs varje timme :36. Det hittar enkäten på markören i råmejlet, aldrig på ämne eller svenska etiketter, eftersom notisens språk skiftar. Det flyttar mejlet till INBOX.ENKAT.
4. **Klagomål göms aldrig.** Ett svar med ett ordernummer eller ett orderärende (var är ordern, inte levererad, fel vara, trasig, retur, återbetalning, ilska) stannar flaggat i inkorgen hos VA:n.

**Formatet:** råsvaren stannar i INBOX.ENKAT. Till repot (`enkat/kodning/<butik>/<ÅÅÅÅ-MM>.jsonl`, committas bara när något ändrats) går en rad per svar efter måndagens läsning:
- id (sha256 av Message-ID, 16 tecken)
- vecka (aldrig dag), butik, språk, kanal och produkt; landet bara när produkten har minst 10 svar därifrån, annars "övrigt"
- koderna för fråga 1-3, plus citat som sessionen läst och rensat
- `kalla=voc`, `voc=enkat` och flaggorna problem och spam

**Strykning**
- Persondata tas bort med `kommentarer/maska.mjs`: e-post, telefon, gatuadress, postnummer och signatur. Ordernummer, personnummer och länkar tas också bort.
- `enkat/stryk.mjs` byter alla våra butiksnamn och domäner mot `[butiken]`, också böjda och felstavade former. Den är testad. "matstrumpor" är också ett vanligt ord, så sessionen läser varje citat innan det hamnar i en brief.
- Hälsa raderas när sessionen ser den.
- Repot får aldrig e-post, ordernummer, klockslag eller annons-id. Git sparar gamla versioner, så det får aldrig komma in.
- Svar med länkar och tomma svar räknas som spam.

**Hur /cs läser dem**
- Varje måndag kodar huvudsessionen de nya svaren. Fråga 1 kodas som utlösare eller begär, fråga 2 som kanal, fråga 3 som själv eller present, mottagare och tillfälle. Varje kod märks "redan" om den står i produktens `dna.md`, annars "ny".
- Leads skrivs i `enkat/leads.md` i samma form som `kommentarer/leads.md`: "Källa: enkät · kalla=voc · voc=enkat · lead: <lead-id> · status: väntar". Svars-id:na står bara i leadet, aldrig i en brief. Varje lead bär de rensade citaten som bär mönstret.
- `/cs`, `/matstrumporkungen` och nattvakten läser filen i steg 1, med en rad i varje kommandofil. Varje rond väljer eller avfärdar ett väntande enkätlead med ett skäl. Kommentarernas 26 leads har stått öppna utan att bockas av (kartläggningen 2026-09-30).
- **Mönsterregeln** är vår egen, eftersom ingen källa har en tröskel.
  - Ingen andel räknas förrän en produkt har 30 svar.
  - Ett mönster kräver minst 6 svar, minst 20 % av svaren och svar från två kalenderveckor.
  - Ett huvudbegär är minst 35 %.
  - Ett mönster märkt "redan" blir en iteration med köparnas ord. Ett mönster märkt "ny" blir ett nytt koncept.
- **Udda svar**, 1-5 stycken om en köpare ingen annons talar till, testas som EN hooktext på en video vi redan har. Det blir högst en per produkt och rond, märkt `voc=enkat-udda` (Video Hooks [10:13], Chad [C5]).

## Så mäter vi om det ger vinnare

1. **Svarsgrad:** svar per 100 ordrar per butik, kanal och vecka. Ordrarna tas ur `stonebite/data/snapshot.json`. Andelen svar med minst 5 ord mäts för sig (Spencer [C4]). Första avläsningen görs efter 14 dagar.
2. **Taggen:** en brief ur enkäten bär `kalla=voc · voc=enkat · lead=<lead-id>`, aldrig ett enskilt svars-id. Briefer ur kommentarsleads får `voc=kommentar`. Regeln att minst 1 av 5 koncept bär voc gäller som förut.
3. **Etiketten dag 7:** etikettraderna bär inte kalla (0 av 3 709 i Bäverbutikens och CaraShells logg, 0 av 96 i Matstrumpors). Därför kopplar `enkat/traff.mjs` etiketten till briefens taggrad via annonsnamnet. Marknadskoden tas bort, och CaraShells spegelnummer räknas ned med 100. Det som inte går att koppla står som "okänd". Etikettmotorn rörs inte.
4. **Tabellen** visar källa per produkt: testade, INGEN_LEVERANS, bedömbara (minst 300 kr OCH minst 3 köp, ANALYSMETOD), vinnare (KPI_WINNER, SPEND_WINNER och BREAKTHROUGH), andel av spend och vinstbidrag. Hit rate är vinnare delat med bedömbara (Overview [28:14]).
5. **När vi dömer:** talen skrivs som "X av Y" tills varje källa har 30 bedömbara annonser. 95-98 % av annonserna förlorar (Nov 21 [32:39]). Matstrumpor har 5 vinnare på 96 etiketter, varav 51 INGEN_LEVERANS. En dom tar alltså månader.
6. **Tratten per butik:** svar, kodade, leads, briefer, live och etikett. Då syns var det stannar.
7. **Larm för tysta fel:** 0 svar på 72 timmar i en butik med ordrar ger en kontroll som kund av sidan, kortet och rutan. Enkätsvar som ligger kvar i inkorgen efter en körning betyder att flytten står still. Erbjudandekortets take-rate mäts före och efter med `factory/tacksida/rapport.mjs`.

## Byggordning

**Sessionen**
1. Läser, ändrar inget:
   - Spoks-verktygen: finns ett formulär som sparar svar?
   - Vilken miljö som bär CaraShell-appens deploynycklar.
   - Matstrumpors översättningar av orderbekräftelsen.
2. Prov som kund: en dold provsida i de tre butikerna och ett svar per butik i Chromium. Det här mäts:
   - om Shopify visar captcha
   - om noreply-adressen godtas
   - om egna fält syns i notisen
   - notisens språk
   - om formuläret skapar en kund i Shopify eller Spoks
   - att inget svar hamnar i Skickat eller Drafts
   - att svarstexten inte skickas till någon pixel
   - om flytten får 403 medan Railway-vakten kör

   Stoppar något byggs inget mer, och du får en rapport. Provsidan avpubliceras.
3. Bygger `enkat/`: konfig, las.mjs, stryk.mjs, traff.mjs och tester. Ett vakttest i `npm test` kräver att autosvaret hoppar över enkätens adress.
4. Bygger sidan /pages/enkat i de tre butikerna, med texter och översättningar, och läser den som kund på varje språk.
5. Bygger CaraShells kort (Tack.jsx) avstängt i en inställning, och Bäverbutikens orderbekräftelse v14 och Matstrumpors svenska stycke. Inget når en kund ännu.
6. Skriver VA-SOP:en "Survey answers" på engelska i Notion, plus en rad i Store facts.
7. Lägger en rad i /cs, /matstrumporkungen och nattvakten, och taggen voc=enkat i ANALYSMETOD. Mergar till main.
8. Bygger rutinen /enkat (:36) och ser den i list_triggers. Rutinen ska vara igång innan någon länk går live.
9. Skriver Cowork-prompten `enkat/cowork/1-lansering.txt`. **Integritetspolicyns stycke kommer FÖRST**; går det inte stannar Cowork innan något annat ändras. Sedan orderbekräftelserna med testmejl. CaraShells kort slås på sist, när policyn är tillbakaläst som kund och rutinen syns i `list_triggers`. Kortets länk byggs ur kundens språk: engelska till carashell.com/pages/enkat, övriga till carashell.se/<mapp>/pages/enkat?country=.
10. Efter lanseringen: läser ett riktigt svar per butik. Efter 14 dagar kommer första svarsgraden.

**Dina klick**
1. Svara på frågan nedan.
2. Klistra in `enkat/cowork/1-lansering.txt` i Cowork.
3. Bara om sessionen säger att de saknas: lägg in `TACKSIDA_CLIENT_ID_CARASHELL` och `SHOPIFY_APP_AUTOMATION_TOKEN_CARASHELL` i claude.ai under Environments.
4. Bara om Cowork stannar vid integritetspolicyn: säg om automatiken får stängas av.

## Risker och hur vi stänger dem

| Risk | Så stänger vi den |
|---|---|
| Captcha, krav på riktig e-post, kund som skapas i Spoks, svar som skickas till en pixel | Provet som kund i steg 2. Stoppar något byggs inget mer |
| Autosvaret svarar ändå om regeln för noreply ändras | Vakttestet i `npm test`. Autosvarets kod rörs inte |
| Flytten får 403 bredvid Railway-vakten | Torrkörs först. Vid 403 flyttas flytten in i vakten, isolerad så att den aldrig stoppar de andra butikerna |
| Svar ligger upp till en timme i inkorgen och tar plats bland de 50 mejl autosvaret läser | Flytt varje timme. VA-SOP:en säger "rör inte" |
| Rutan i orderbekräftelsen blir kundtjänst när kunden letar paketet senare | Raden "Frågor om din order? Skriv till oss här". Orderärenden stannar flaggade hos VA:n |
| Svaren är anonyma, så VA:n kan inte svara | SOP:en: finns ett ordernummer i texten mejlar hon kunden från ordern |
| En felaktig inklistring förstör orderbekräftelsen | Cowork skickar testmejl och jämför med förhandsvisningen. Matstrumpors översättningar läses före och efter |
| Tacksidesblocket saknas i CaraShell | Cowork kontrollerar och lägger in det |
| Erbjudandekortets försäljning sjunker | Take-raten mäts före och efter |
| Temabyte tar bort sidans mall | Larmet vid 0 svar på 72 timmar ger en kontroll som kund |
| Urvalet speglar våra egna annonser (Dec 5 [10:02]) | Märkningen "redan" eller "ny": ett eko blir en iteration, inte en ny vinkel |
| Maskningen missar ett namn | Sessionen läser varje citat före en brief. Briefgranskningen stoppar butiksnamn |
| Juridiken är sessionens läsning, inte prövad | Ingen belöning i fas 1. En utlottning bara med villkoren fullt ut |
| En dom om hit rate tar månader | "X av Y" tills 30 bedömbara per källa. Det sägs rakt ut |

## Vad vi INTE gör

- Ingen fråga efter leveransen, och inga frågor om själva produkten, i fas 1.
- Inga flervalsfrågor och ingen åldersfråga.
- Ingen belöning i fas 1. Aldrig en utlottning varje månad.
- Inget Spoks-flöde, inget Klaviyo och ingen popup.
- Inga nya appar och ingen network_access i fas 1.
- Inget kort på orderstatussidan i fas 1.
- Autosvarets kod rörs inte.
- Ett svar kopplas aldrig till en annons, en order eller en e-postadress.
- Ett svar blir aldrig ett kundcitat eller en recension. Ingen Trustpilot-länk.
- Inga svar från NO, DK och FI, och Matstrumpors utländska kunder får ingen enkät, förrän fas 2.
- Ingen dom om enkätens hit rate före 30 bedömbara annonser per källa.
## Granskningen (2026-10-01)

En granskare läste planen mot CLAUDE.md och Axels rättelse och fällde tre stopp och fyra viktiga fel. Alla är inlagda ovan: fritextsvaren committas aldrig, policyn kommer först och CaraShells kort sist, utlottningen syns aldrig via orderbekräftelsen, fråga 3 ber inte om namn, vecka i stället för dag, briefen pekar på leadet och inte på ett svar, och "bedömbar" är 300 kr OCH 3 köp. Ett citat ur planen (Deep Market Research [9:21]) fanns inte i `fynd.json` och är struket. Två av tre granskare kunde inte köras (kontots veckogräns), så planens tekniska påståenden är kontrollerade av verifieringen i scratchpaden men inte av en andra läsare. Provet som kund (byggordning steg 2) är därför obligatoriskt innan något byggs.

**Öppet:** vem som skriver Bäverbutikens briefer ur enkätleads. Skalnings kungen läser inga leads-filer, och dess prompt kan bara Axel ändra.
