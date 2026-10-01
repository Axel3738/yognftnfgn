# Taiwan: tull-ID:t i kassan (EZ WAY) — och varför Japan inte har samma problem

Underlag för ett beslut. Inget är byggt, inget är ändrat. Allt nedan är läst 2026-10-01:
Taiwans och Japans myndigheter först, sedan fraktbolag och butiker, sedan Shopify, sedan
Matstrumpors egen data (Shopify-läsning med enbart GraphQL-queries, repot och den publika
spårningssidan). Citat står på originalspråk. Det som är osäkert är märkt som osäkert.

---

## Kort svar

1. **Det Axel kallar "ett speciellt spårningsnummer" är inget spårningsnummer.** Det är Taiwans
   krav på att mottagaren av ett expresspaket (快遞) ska vara identifierad med riktigt namn
   och vara registrerad i tullens app **EZ WAY 易利委**. Registreringen görs med det taiwanesiska
   ID-numret (身分證字號) eller uppehållstillståndets nummer (統一證號) och kundens taiwanesiska
   mobilnummer. **Sedan 2026-03-01 måste kunden dessutom bekräfta VARJE paket i appen
   ("申報相符") innan tullen tar emot deklarationen.** Utan bekräftelse får paketet inte
   föras in, och det skickas tillbaka (returneras).
2. **Kravet gäller inte bara Kina.** Det gäller alla expresspaket till privatpersoner, oavsett
   avsändarland. Tullens officiella skäl är identitetsstöld (冒名報關), bluffpaket
   (幽靈詐騙包裹) och olagliga varor som förs in i någon annans namn. Kina har ändå med saken
   att göra, på två sätt. Över 90 % av Taiwans små expresspaket kommer från Fastlandskina
   och Hongkong. Matstrumpors paket skickas dessutom från Kina med YunExpress.
3. **Taiwans tull säger själv att ID-numret inte ska behövas för den som har EZ WAY.** Paketet
   identifieras med **namn + det mobilnummer som är registrerat i EZ WAY**. Det som MÅSTE finnas
   på fraktsedeln är alltså kundens kinesiska namn exakt som i appen och mobilnumret. Kunden
   måste också trycka "申報相符". Om ID-numret ändå behövs avgör fraktbolaget/leverantören.
   Det vet vi inte, eftersom leverantören aldrig har fått frågan.
4. **Shopify har ett inbyggt kassafält för Taiwan, "National ID Number".** Fältet är i
   *early access*, och man får det bara genom att be Shopify Support om det. Shopify skriver
   att fälten slås på "for all applicable countries and regions together". Det kan alltså
   betyda att Spanien (NIF/DNI) och Portugal (NIF) också får fältet. Båda är aktiva marknader
   med kampanjer. **Fråga Support först.**
5. **Butiken har inte Plus** (plan "Shopify", `shopifyPlus: false`). Därför finns inga egna
   fält i informations- eller fraktsteget i kassan och ingen egen valideringsfunktion. Det som
   går på vår plan är fält i varukorgen (cart attributes), text i kassan per språk, tacksidan
   eller orderstatussidan och mejlen.
6. **Japan har inget motsvarande krav.** Japan har ingen app och inget ID-nummer. Strumpor
   ligger inom Japans tullfria gräns på 10 000 yen och står inte på undantagslistan.
   **Tull och ID är alltså inget skäl att hålla inne Japan.** Det som är öppet för Japan är
   affärsfrågor: leverantören har inte bekräftat frakt, pris eller leveranstid till Japan.
7. **Butiken tar redan emot taiwanesiska ordrar.** Marknaden Taiwan är `ACTIVE`, och
   fraktzonen "Japan och Taiwan" har aktiv fri frakt. Hittills har det kommit 0 ordrar till
   TW och 0 till JP, av 4 233 ordrar totalt.

---

## 1. Vad Taiwan kräver 2025–2026 (källor och citat)

### 1.1 Själva kravet: EZ WAY och "預先確認委任"

**Lagen: 空運快遞貨物通關辦法** (flygexpress; samma regler finns i 海運快遞貨物通關辦法 för
sjöexpress). Senast ändrad **2026-02-23** (民國115年2月23日). Texten är läst via
6laws.net-spegeln av den officiella databasen:
https://6laws.net/6law/law3/空運快遞貨物通關辦法.htm

- Art. 17(1): en förenklad deklaration (簡易申報單) via tullombud kräver ombudsuppdrag
  (報關委任) på ett av tre sätt: skriftligt, via Single Window, eller
  「三、經由經營通關網路業者建置之實名認證平臺辦理線上個案委任。」 (= EZ WAY).
- **Art. 17(2):** 「未依前項各款方式之一完成報關委任，並於海關通關資訊系統記錄有案者，海關得不受理報關。」
  Tullen får alltså vägra att ta emot deklarationen.
- **Art. 17-1:** 「進口簡易申報貨物未放行出倉前，經確認無法依第十七條第一項及第二項辦理報關委任 … 得於貨物進倉或報關之翌日起七個工作日內，由快遞業者申請更正為納稅義務人後退運出口。」
  Expressbolaget får alltså returnera paketet inom 7 arbetsdagar.
- Art. 18(2): för 低價應稅 och 高價 (över NT$2 000) ska mottagarens 「身分證統一編號、外僑居留證統一證號或護照號碼」 deklareras.
- **Art. 18(3):** 「以進口簡易申報單申報收貨人實名認證行動通訊門號號碼者，得免依前項規定申報收貨人身分證統一編號…」
  Med EZ WAY-mobilnumret behövs alltså inget ID-nummer på deklarationen.

**Tullens FAQ (財政部關務署, publicerad 2020-07-08, sidan uppdaterad 2026-10-01):**
https://web.customs.gov.tw/singlehtml/3150?cntId=cus1_3150_3150_1150
- 「實名認證註冊完成後，進口快遞貨物若採快遞簡易申報形式，報關時可僅填實名認證手機門號及姓名，將作為快遞簡易申報通關時之個人身分識別號碼，辦理進口報關委任，所以免再提供身分證文件或字號予報關業者。」
- 「另海關已於109年5月1日…及109年12月15日…函向相關業者宣導，採快遞簡易申報者勿向已實名認證註冊之民眾索要身分證統一編號。」
  Tullen har alltså bett ombuden att INTE fråga EZ WAY-registrerade efter ID-numret.
- 「公司行號不適用實名認證，請於進口報關時採紙本委任方式」
  Företag kan inte använda EZ WAY.
- Kunden ser i appen 「報關日期、報單號碼、分提單號碼、申報金額(購買金額+運費)及貨物品項與名稱」
  och trycker 「申報相符」 eller 「申報不符」.
  ⚠️ Kunden ser alltså **deklarerat belopp och varubeskrivning**. Om leverantören deklarerar
  ett lägre värde än det kunden betalade, kan en noggrann kund trycka "不符", och då stoppas
  paketet.

**Pressmeddelande 2025-12-19 (關務署):**
https://web.customs.gov.tw/singlehtml/2222?cntId=e507d33802614cc18a49c9a6d73b10b2
- 「為防杜冒名報關，維護民眾個資安全及防止幽靈詐騙包裹，海關自110年起分階段推動進口快遞貨物預先委任，截至本（114）年11月30日止，已有超過300萬民眾加入預先委任；預先委任占簡易申報單比率超過8成，關務署爰規劃自明（115）年3月1日起全面實施預先委任。」
- 「所謂預先委任，係指民眾網購境外貨物後，利用「EZ WAY 易利委」APP…先行確認報關業者推播資料與實際購買貨物相符後，海關始受理報關，倘未確認相符，貨物即不得報關進口。」
- 「過去偶有貨物通關後，民眾才得知個資遭盜用報關進口違法管制物品或幽靈詐騙包裹，導致後續受到行政或刑事調查。」

**Pressmeddelande 2026-02-24 (關務署):**
https://web.customs.gov.tw/singlehtml/2222?cntId=5b7a9da7e7674b4e90e0cee314f85191
- 「財政部於115年2月23日修正發布空運快遞貨物通關辦法及海運快遞貨物通關辦法相關規定，明定自115年3月1日起，就個人進口簡易申報快遞貨物採取「實名認證」線上委任者，全面實施「預先確認委任」…制度。」
- 「先由報關業者透過「EZ Way易利委」APP推播貨物資訊予民眾，經民眾確認與實際購買之貨物相符並完成線上委任後，再由報關業者辦理後續報關程序」
- 「並請報關業者配合於貨物抵臺前儘速推播資訊予民眾」 (pushen ska komma INNAN paketet landar).
- 「務必詳實核對貨物品項及申報金額等資訊，若資訊無誤請於EZ Way APP點選「申報相符」；若有誤或遭冒名，請點選「申報不符」」

**EZ WAY för utlänningar med uppehållstillstånd (MOF, engelska, 2021-03-30):**
https://web.customs.gov.tw/en/singlehtml/1865?cntId=0d6a8a091ace45ddbf17d5b70e25534c
"the APP for Real-Name Authentication of the Consignees of Import Express Shipments". Registreringen
kräver "ARC numbers (new or old version), name, cell phone number, and birth date".

**När det började:** 2020-05-16. Första månaden stoppades nästan 30 000 paket.
PTS 2020-07-03: https://news.pts.org.tw/article/485551
- 「海關從5月16日開始實施實名制的報關規定」
- 「頭一個月就發現有將近3萬件的空運貨品有問題，需要補全資料才可以通關」
- Paket som saknade uppgifter släpptes 「文件補正後就可放行，但會被列觀察名單」.

### 1.2 Belopp, skatt och frekvensgräns

- **Expressklasser (Art. 11(2), samma lag):** 「進口低價免稅快遞貨物：完稅價格新臺幣二千元以下」,
  「進口低價應稅快遞貨物：完稅價格新臺幣二千零一元至五萬元」, 「進口高價快遞貨物：完稅價格超過新臺幣五萬元」.
  I branschen kallas klasserna X2, X3 och G2.
- **Skatteportalen (財政部稅務入口網, uppdaterad 2026-09-11):**
  https://www.etax.nat.gov.tw/etwmain/tax-info/network-transaction-taxtation-area/consumer/oversea-online-shopping-notice
  - 「完稅價格在新臺幣2,000元以下者，免徵關稅、貨物稅及營業稅」
  - 「同一納稅義務人於半年內進口貨物適用關稅法第49條第2項之免稅規定逾6次者，第7次起不適用前開免稅規定」
    En kund som redan har fått 6 tullfria paket under halvåret betalar alltså skatt från det sjunde.
    Spårningen av antalet sker på kundens identitet.
- **Postpaket har samma gräns** (郵包物品進出口通關辦法 Art. 7: 「完稅價格在新臺幣二千元以內者，免徵關稅、貨物稅及營業稅」, Art. 12: frekvensgränsen 6 per halvår).
- **Matstrumpors TW-priser** (`matstrumpor/marknader/README.md` rad 659): NT$1 690 (5 par) /
  1 490 / 1 190 / 1 790 / 1 190 / 209.
  - **En låda ryms under NT$2 000.** Den är tullfri om den deklareras till det kunden betalade.
  - **"Köp 2 – få 2" (två betalda 5-parslådor) blir NT$3 380.** Det ger tull plus moms
    (營業稅) för kunden, om inte frakten är DDP. Det är okänt, och det är just fråga 4 i
    `LEVERANTOR-FRAGA-JP-TW.md`.

### 1.3 Post (中華郵政) jämfört med express

- **Postpaket regleras av en annan lag**, 郵包物品進出口通關辦法 (senast ändrad 2020-04-01):
  https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0350072
  Verktyget läste hela lagtexten och hittade **ingen artikel som kräver ID-nummer, mobilnummer
  eller realnamnsautentisering**.
  Kommersiell källa: "透過郵政系統寄送的貨物是「郵包」，理應是不需要使用EZ WAY委任報關"
  (0523.tw, 2026-09-01: https://0523.tw/express-postal-customs-taiwan). Där står också
  「依個案與規定辦理」.
  **Osäkert:** detta kommer inte från tullen själv.
- **Kinesiska e-handelsplattformar går inte som post.** Tullen sade enligt 中時/旺得富
  2025-10-27 (https://wantrich.chinatimes.com/news/20251027900635-420501) att 「拚多多、淘寶貨品並非於郵局通關」.
  中華郵政 sköter bara den inrikes utkörningen efter att 海運快遞 har förtullats. Den typiska
  vägen från Kina till Taiwan är alltså express, och då gäller EZ WAY.

### 1.4 Vad som händer med ett paket utan bekräftelse

| Steg | Källa |
|---|---|
| Tullen får vägra ta emot deklarationen | Art. 17(2) (citat ovan) |
| 「倘未確認相符，貨物即不得報關進口」 | 關務署 2025-12-19 |
| Expressbolaget får returnera paketet (退運出口) inom 7 arbetsdagar från inleverans eller deklaration | Art. 17-1 |
| Paketet står kvar i lagret och drar lagerhyra tills det returneras | 0523.tw 2026-09-14 (sekundär): 「會滯留在倉庫並持續產生倉儲費」 |
| Erfarenheten från 2020: paketet släpps först när uppgifterna kompletterats, och mottagaren hamnar på bevakningslista | PTS 2020-07-03 |
| Shopify: "Packages without additional information on the shipping label might be destroyed or returned." | Shopify Help Center (se 3.1) |

Om kunden inte bekräftar i EZ WAY har vi alltså betalat varan och frakten för en order som
inte kommer fram. Kunden väntar på ett paket som går tillbaka. Det ger risk för återbetalning
eller chargeback, och kanske en returavgift. Vem som betalar returen bestämmer leverantörens
och fraktbolagets villkor. Det är okänt.

Hur andra gör:
- **JLCPCB** skickar från Fastlandskina (uppdaterad 2026-08-27):
  https://jlcpcb.com/help/article/shipping-information-for-china-taiwan
  "consignees that hold China Taiwan Identity Card will need to perform real-name authentication".
  Namn, ID och mobil "must be exactly the same as what you filled in on the APP".
  "Failure to provide required documentation may result in customs clearance delay or rejection."
- **Shopee Taiwan** (gränsöverskridande): ordern skickas först när köparen har bekräftat i
  EZ WAY. Ordrar som stickprovsgranskas måste bekräftas inom 7 dagar, annars avbryts de
  (chwang.com: https://www.chwang.com/news/201824575269 — sekundär källa).

### 1.5 Är det "på grund av Kina"?

- **Officiellt: nej.** Båda pressmeddelandena motiverar regeln med identitetsstöld, skydd av
  personuppgifter och bluffpaket. Kina nämns inte. Regeln gäller "境外貨物", alltså varor
  från vilket land som helst.
- **I praktiken: ja, det är Kina-flödet som har format regeln.**
  - Tullens statistik (via 數位時代 2026-03-26,
    https://www.bnext.com.tw/article/90428/2025-taiwan-cross-border-ecommerce):
    「台灣小型快遞包裹主要來源國依序為中國大陸、香港、南韓、日本及美國，其中中國大陸與香港合計進口佔比逾 90%」
    och 「完稅價格低於 NT$2000 元免稅門檻的低價包裹總量佔整體快遞包裹進口規模比例已逾 80%」.
  - 2025 kom över 65 miljoner små paket, värda NT$75,2 miljarder (工商時報 2026-03-30:
    https://www.ctee.com.tw/news/20260330700136-430502).
  - Frekvensgränsen (6 per halvår) infördes efter lagändringen 2016. Rubriken då var
    「淘寶買家注意！「關稅法」三讀通過，進口頻繁買家不適用包裹 3000 元以內免稅」
    (techbang 2016-10-22). Den var riktad mot uppdelning av större köp i många små paket
    (化整為零).
  - Matstrumpors paket ingår själva i Kina-flödet. Se avsnitt 2.
- Att Taiwan kräver verifierad annonsör i Meta är **ett annat krav**. Det kommer från Taiwans
  bedrägerilag och står redan i `matstrumpor/marknader/README.md` rad 716–727. Båda kraven
  stoppar Taiwan var för sig.

---

## 2. Hur Matstrumpor skickar i dag

| Fakta | Bevis |
|---|---|
| **Alla paket går med YunExpress**: 523 av 525 i minnet (17TRACK-kod 190008), 2 utan bolag, alla nummer börjar på `YT` | `sparning/butiker/matstrumpor/lage.json` (räknat 2026-10-01) |
| **Paketen kommer från Kina**: i den publika spårningsdatan är länderna `['Nederländerna','Kina','Sverige']`, och alla 144 paket med landsmärkt händelse har sin FÖRSTA händelse i Kina. Vägen är Kina → Nederländerna (Rozenburg) → Sverige (CityMail, PostNord, Early Bird, Instabee) | https://matstrumpor.se/pages/spara, datablocket `bb-spar-data`, läst 2026-10-01 |
| Shopify-leveranserna markeras "Manual" på platsen "Stenkolsgatan 1B" (Göteborg), med `trackingInfo.company` = YunExpress. Platsen är kontorets adress, inte avsändningsorten | Shopify GraphQL (query) 2026-10-01, de 5 senaste skickade ordrarna |
| Leverantören har inte fått frågan om Japan och Taiwan: om de skickar dit, med vilket bolag, vad det kostar, hur lång tid det tar och om det är DDU/DDP. Frågan är parkerad: "vi ska bara vänta tills vi får försäljning" | `matstrumpor/marknader/LEVERANTOR-FRAGA-JP-TW.md` rad 3–8 |
| Det finns ingen kostnadsrad för JP eller TW | `matstrumpor/cogs.json` (bara SE, Big 5 och Norden) |
| **0 ordrar till TW, 0 till JP**, av 4 233 ordrar (2025-08-04 → 2026-10-01). 4 230 gick till SE och 3 saknar adress | Shopify GraphQL: alla ordrar räknade lokalt |
| ⚠️ Sökfiltret `shipping_address_country_code:TW OR …` fungerar INTE i Shopify. Det gav bara de 50 första ordrarna, alla till SE. Räkna lokalt i stället | Samma läsning |
| Marknaderna Japan (`jp`) och Taiwan (`tw`) är `ACTIVE`. Fraktzonen "Japan och Taiwan" (JP, TW) har "Fri frakt", aktiv, 0 SEK | Shopify GraphQL 2026-10-01 |
| **Telefon är frivilligt i kassan i dag** (slutsats av datan): bara 24 av de 250 senaste ordrarna har telefonnummer i leveransadressen | Shopify GraphQL 2026-10-01 (bara antal, inga värden) |
| Den taiwanesiska produktsidan lovar 「免運費，5–10 個工作天到貨」 och 「30 天內可退貨」. EZ WAY nämns inte | https://matstrumpor.com/zh-tw/products/sushi-strumpor?country=TW |

**Okänt och avgörande:**
- Skickar leverantören/YunExpress alls till Taiwan?
- Går det som express (då gäller EZ WAY och förhandsbekräftelse) eller som post (inget ID-krav enligt lagtexten)?
- Vilka mottagaruppgifter måste stå på fraktsedeln: kinesiskt namn, mobil, ID?
- Deklarerar leverantören det belopp kunden betalade (se varningen i 1.1)?

YunExpress har ingen publik sida om import till Taiwan. tw.yunexpress.com är ett säljkontor
för export FRÅN Taiwan (till USA, UK, DE och AU).

---

## 3. Shopify: så kan en butik samla in uppgiften

### 3.1 Det inbyggda fältet "National ID Number" (early access)

Källa: Shopify Help Center → International considerations → *Additional tax fields in checkout*,
läst ordagrant 2026-10-01:
https://help.shopify.com/en/manual/international/shipping/international-considerations

- Raden för Taiwan i tabellen *"Countries and regions with additional tax fields that are in
  early access"*: **"Taiwan — Destination is Taiwan, fulfilled from outside Taiwan — National ID Number"**.
  På samma lista står **Spanien** ("NIF or DNI"), **Portugal** ("NIF"), Turkiet, Chile,
  Colombia, Costa Rica, Ecuador, Guatemala, Indonesien, Malaysia, Paraguay, Peru och Mexiko
  (fakturafält).
- "Some additional tax fields are in early access, and are available only by request. To request access, contact Shopify Support."
- "Additional tax fields are activated by default for all stores, except for the fields that are in early access. Early access fields are activated only when you request them. Your Shopify admin doesn't have a setting to activate or deactivate additional tax fields, and your checkout form options don't control them."
- ⚠️ "You can't choose which countries, regions, or individual fields are displayed. Additional tax fields are activated or deactivated for all applicable countries and regions together."
  **Oklart** om det betyder att Spaniens och Portugals fält också slås på när vi ber om Taiwan.
  Shopify-personal svarade 2026-05-21 att vägen är Support och att det inte finns någon
  inställning per nyckel ("There isn't a merchant-facing Admin setting for enabling that
  individual key at this time"):
  https://community.shopify.dev/t/how-do-i-enable-the-checkout-input-field-for-localizedfield-tax-credential-es-in-a-store/34495
- "These fields are displayed after the customer enters a complete, valid shipping address, grouped with the payment details in a section titled Additional Information."
- "You can't edit an order's tax fields in the admin. Updates can only be made using the orderUpdate mutation."
- "If you purchase shipping labels through a third-party shipping carrier, or a supplier purchases labels on your behalf, then contact your service to ensure that they add the additional information to shipping labels."
  Det är vårt fall: leverantören köper YunExpress-etiketterna.
- "If you sell to customers in any of the following regions, and you've modified your checkout to collect additional information, then remove your customizations. If you keep your customizations, then your customer must enter their information twice."
- Värdet hamnar på ordern som `localizedFields` med nyckeln **`SHIPPING_CREDENTIAL_TW`**
  (enum `LocalizedFieldKey`, Admin GraphQL 2026-10):
  https://shopify.dev/docs/api/admin-graphql/latest/enums/localizedfieldkey
  Enumen har också `SHIPPING_CREDENTIAL_ES` / `_PT` och `TAX_CREDENTIAL_ES` / `_PT`.
- Det inbyggda fältet **löser inte** EZ WAY-bekräftelsen. Det löser inte heller mobilnumret.
  Det samlar bara in numret.

### 3.2 Det som kräver Plus (butiken har inte Plus)

- Butikens plan, läst 2026-10-01: `{"displayName":"Shopify","shopifyPlus":false}`.
- "Checkout UI extensions for the information, shipping, and payment steps are available only to stores on a Shopify Plus plan."
  (shopify.dev, api_version 2026-07: https://shopify.dev/docs/api/checkout-ui-extensions)
- "Stores on any plan can use public apps that are distributed through the Shopify App Store and contain functions. Only stores on a Shopify Plus plan can use custom apps that contain Shopify Function APIs."
  (https://shopify.dev/docs/apps/build/functions). En egen valideringsfunktion som stoppar
  kassan utan ID kräver alltså Plus. En **publik** app i App Store fungerar på alla planer.
  Jag hittade ingen sådan app för just Taiwan, och det är inte utrett.

### 3.3 Det som går utan Plus

| Väg | Vad den ger | Nackdel | Bevis för att den fungerar här |
|---|---|---|---|
| **A. Fält i varukorgen som bara visas för TW** (cart attributes i varukorgslådan och på varukorgssidan): kinesiskt namn som i EZ WAY, taiwanesiskt mobilnummer, ID bara om fraktbolaget kräver det | Kommer med på ordern ("Additional details") och syns i API:t | Kan inte tvingas på servern: den som hoppar över korgen eller lämnar fältet tomt kommer ändå till kassan. TW-ordrar måste därför kontrolleras innan leverantören skickar | Butiken skickar redan cart attributes vidare till ordrar: nycklarna `AB paket` (33) och `AB sortval` (128) fanns på de 250 senaste ordrarna. Varukorgslådan är formuläret `CartDrawer-Form` → `/zh-tw/cart` med `name="checkout"`. Produktsidan har ingen "Köp nu"-knapp (0 `shopify-payment-button`) |
| **B. Kassans text på zh-TW** (Kassaspråk → Redigera kassainnehåll), t.ex. etiketten på telefonfältet: 「手機號碼（須與 EZ WAY 註冊相同）」 | Kunden ser kravet där den skriver | Bara text, inget nytt fält. Inställningen Obligatorisk/Frivillig gäller hela butiken. Exakta nycklar är inte verifierade | `klaviyo/samtyckesruta.mjs` rad 12–19: kassans text ändrades per språk via temats locale-innehåll (`shopify.checkout.*`) och lästes tillbaka som kund (CaraShell, Grow-plan) |
| **C. Gör telefon obligatoriskt** i Inställningar → Kassa | Mobilnumret, som EZ WAY behöver, kommer alltid med | **Gäller alla marknader, också Sverige**: "Other than those additional address fields, the Customer information settings apply to every country and market that you sell to." (https://help.shopify.com/en/manual/checkout-settings/checkout-form-options) | I dag har 24 av 250 ordrar telefonnummer |
| **D. Tacksidan och orderstatussidan** (checkout UI extension, målen `purchase.thank-you.block.render` och `customer-account.order-status.block.render`, finns på alla planer) | Ett kort till TW-kunder: "registrera dig i EZ WAY, tryck 申報相符 när pushen kommer" | Att samla in ID här kräver en egen server för att ta emot och lagra numret, och det ger mer integritetsansvar | Matstrumpor har redan en app med båda målen: `matstrumpor/varva/app/extensions/varva-kort/shopify.extension.toml` rad 14–19. Den är inte deployad (CLAUDE.md, Axels app). CaraShells tacksida finns live på Grow (`factory/tacksida/README.md` rad 20 och 42–45) |
| **E. Orderbekräftelsen på zh-TW** med ett TW-block: EZ WAY-instruktion, och "svara med ditt mobilnummer om det saknas" | Når alla TW-köpare direkt | Kunden kan missa mejlet | Matstrumpors notismejl finns redan på zh-TW (README rad 690: "39 av 39 lästa tillbaka") |
| **F. Adressrad 2 eller företagsnamn som ID-fält** | — | **Dåligt:** inställningen gäller hela butiken, uppgiften hamnar i fel fält och kan tryckas på fraktsedeln. Shopify ber dessutom butiker ta bort egna lösningar när det inbyggda fältet finns (annars "must enter their information twice") | — |
| **G. Skicka TW som post (郵包)** i stället för express | Lagtexten för post kräver inget ID och ingen EZ WAY | Leverantören måste erbjuda det. Leveranstid och spårning är okända. Kinas e-handel går i dag som sjöexpress, inte post | 1.3 ovan |

**Personuppgifter:** ett taiwanesiskt ID-nummer i Shopify-ordrar och hos leverantören är en
personuppgift som vi måste kunna motivera (GDPR för oss, PDPA i Taiwan). Enligt Taiwans tull
behövs numret inte för den som använder EZ WAY: namn och mobil räcker (1.1). Om fraktbolaget
inte kräver ID-numret är det lägsta insamlingen också den säkraste. Det här är ingen juridisk
bedömning, bara en notering.

---

## 4. Japan: inget motsvarande krav

- **Inget ID, ingen app.** Japans tull beskriver privatimport med post och kurir: tullfria
  postpaket "delivered directly to the consignee from the nearest post office", och vid kurir
  "A customs broker clears the goods through customs for you". Inget ID-nummer, ingen
  registrering och ingen app nämns.
  (Customs Answer 3002, engelska: https://www.customs.go.jp/english/c-answer_e/kojin/3002_e.htm).
  Japan finns inte heller i Shopifys tabell över länder som kräver extra ID-fält (3.1).
  Taiwan, Kina, Sydkorea, Brasilien och Mexiko finns där.
- **Tullfri gräns 10 000 yen** (Customs Answer 1006, https://www.customs.go.jp/tetsuzuki/c-answer/imtsukan/1006_jr.htm):
  「課税価格の合計額が1万円以下の物品の輸入については、その関税及び消費税が免税されます。」
  Undantagen: 「革製のカバン、ハンドバッグ、手袋等、編物製衣類（Ｔシャツ、セーター等）、スキー靴、革靴…」, i detalj i 関税定率法施行令第16条の3.
- **Strumpor står INTE på undantagslistan.** 施行令16条の3 punkt 十一 lyder
  「法の別表第六一一五・一〇号の一又は第六一一五・二一号から第六一一五・二九号までに掲げる物品」.
  Det är bara kompressionsstrumpor och strumpbyxor/tights. Vanliga strumpor (6115.94–6115.99)
  saknas, och punkt 八 och 十 täcker 61.01–61.10 och 61.12–61.14, inte 61.15.
  Läst ordagrant hos Japan Tariff Association: https://www.kanzei.or.jp/kanzei_law/329CO0000000155.ja.html
- **Privatimport värderas till 60 % av priset** (Customs Answer 1405,
  https://www.customs.go.jp/tetsuzuki/c-answer/imtsukan/1405_jr.htm):
  「輸入者が個人的に使用する貨物は…（海外小売価格（※）×0.6）を課税価格とします。」
  - En låda ¥7 980 × 0,6 = ¥4 788, alltså tullfri.
  - "Köp 2 – få 2" med två betalda lådor: ¥15 960 × 0,6 = ¥9 576, alltså fortfarande under
    10 000 och tullfri.
  - Detta förutsätter att leverantören deklarerar det belopp kunden betalade. Hur leverantören
    deklarerar vet vi inte.
- **Ändringar framåt, båda 2028:**
  - Finansdepartementets lagförslag (令和8年2月): 「個人使用貨物に限り課税価格を海外小売価格の６割にする特例を廃止。」, 施行日 **令和10年4月1日** (2028-04-01).
    https://www.mof.go.jp/about_mof/bills/221diet/kz20260220g.html
  - Konsumtionsskatt på distansköp ≤ 10 000 yen tas ut av en registrerad utländsk säljare
    eller plattform, för transaktioner från **2028-04-01**. Tullfriheten ≤ 10 000 yen ligger
    kvar. Källa: Nagashima Ohno & Tsunematsu 2025-12-24, https://www.nagashima.com/publications/publication20251224-1/
  - (En blogg, global-scm.com 2026-04-03, påstår att 0,6-regeln försvann 2026-04-01.
    Finansdepartementets egen sammanfattning säger 2028-04-01, och den väger tyngre.)
- **Japans öppna frågor gäller affären, inte tullen.** Leverantören har inte bekräftat frakt,
  pris eller leveranstid till Japan (`LEVERANTOR-FRAGA-JP-TW.md`, parkerad). Det finns ingen
  JP-rad i `cogs.json`, så break-even går inte att räkna. Sajten lovar 「日本全国送料無料」 och
  5–10 arbetsdagar, eftersom Axel sade "Det är 5 - 10 arbetsdagar japan osv"
  (README rad 650).

---

## 5. Japan och Taiwan sida vid sida, och vägen framåt

| | Japan | Taiwan |
|---|---|---|
| ID eller app för privatpersonens paket | **Nej** | **Ja**: EZ WAY, och sedan 2026-03-01 en bekräftelse per paket före ankomst |
| Vad som måste stå på fraktsedeln | Namn, adress (och telefon för fraktbolaget) | Kinesiskt namn exakt som i EZ WAY + det registrerade mobilnumret. ID bara om fraktbolaget kräver det |
| Tullfri gräns | ≤ ¥10 000 (privatimport ×0,6 till 2028-04-01). Strumpor omfattas | ≤ NT$2 000 och högst 6 tullfria paket per halvår och person |
| Vår vanligaste order | ¥7 980: tullfri | NT$1 690: tullfri. "Köp 2 – få 2" NT$3 380: skattepliktig |
| Annonser | Inget extra krav. Enligt `matstrumpor/marknader/annonser/marknader.json` i arbetsträdet (ändrad, inte committad 2026-10-01) är kampanjen schemalagd till fre 2026-10-02 00:01 | Meta kräver verifierad annonsör (README rad 716–727). `lansering_stopp` står i `marknader.json` |
| Leverantören bekräftad? | Nej (parkerad fråga) | Nej (parkerad fråga) |

### Rekommenderad väg, rangordnad efter insats och risk (inget av detta är gjort)

1. **Leverantörsfrågan för Taiwan (liten insats, avgör allt annat).** Lägg tre frågor till i
   den parkerade `LEVERANTOR-FRAGA-JP-TW.md`:
   - (a) Går TW-paket som express (EZ WAY) eller som post?
   - (b) Exakt vilka mottagaruppgifter vill ni ha: kinesiskt namn, taiwanesiskt mobilnummer, ID-nummer?
   - (c) Deklarerar ni det belopp kunden betalade? Vad kostar ett paket som tullen inte tar emot (retur, lagerhyra, förstöring)?

   Utan svaren går det inte att bygga rätt sak. Ingen kassalösning hjälper om leverantören
   inte skickar till Taiwan eller inte för över uppgifterna till fraktsedeln.
2. **Telefonen är ett måste för TW, ID-numret kanske inte.** Enligt Taiwans tull räcker namn
   och mobil med EZ WAY. Minsta lösningen utan Plus är väg A (fält för namn och mobil i
   varukorgen, bara för TW), D eller E (EZ WAY-instruktion på tacksidan och i
   orderbekräftelsen) och en kontroll av varje TW-order innan leverantören skickar. Insatsen
   är medel och kostar inga pengar.
3. **Om fraktbolaget kräver ID-numret:** be Shopify Support om early access-fältet "National
   ID Number", men fråga först om Spanien, Portugal och de andra följer med. Om de gör det:
   välj väg A med ett TW-fält för ID i stället. Värdet ska ändå föras över till leverantören,
   antingen med en export eller för hand.
4. **Att göra telefon obligatoriskt i hela butiken** (väg C) är ett klick, men det påverkar
   Sverige och alla marknader. Det är Axels beslut.
5. **Inte rekommenderat:** adressrad 2 eller företagsnamn som ID-fält (väg F), Plus enbart för
   Taiwan, eller en egen server för att samla in ID på tacksidan.

### Det Axel måste avgöra

1. Ska leverantörsfrågan för Japan och Taiwan skickas nu, trots att den är parkerad "tills
   marknaden sålt"? Taiwan kan inte sälja förrän svaret finns.
2. Ska Taiwan-marknaden vara öppen i Shopify under tiden? Den är `ACTIVE` med fri frakt, så en
   taiwanesisk besökare kan redan beställa utan mobilnummer. Alternativen är att hantera en
   sådan order för hand eller att stänga marknaden tills lösningen finns.
3. Ska telefon bli obligatoriskt i hela butiken, eller bara samlas in för Taiwan?
4. Får vi lagra taiwanesiska ID-nummer i Shopify och skicka dem till leverantören, om
   fraktbolaget kräver dem?
5. DDU eller DDP för TW-ordrar över NT$2 000 (som "Köp 2 – få 2")? Kunden betalar annars tull
   och moms.
6. Japan: inget tull- eller ID-hinder. Det som återstår är leverantörens bekräftelse av frakt,
   pris och tid, som också är parkerad. Repot säger: "För Japan och Taiwan vet vi inte ens om
   leverantören skickar dit, vad det kostar eller hur lång tid det tar"
   (`LEVERANTOR-FRAGA-JP-TW.md` rad 5–8). Axel har själv sagt "Det är 5 - 10 arbetsdagar
   japan osv" (README rad 650). Om JP-kampanjen startar 2/10: fråga Axel om det svaret
   kommer från leverantören. Om det inte gör det, kan den första japanska ordern bli den
   som visar om leverantören alls skickar dit.

---

## Öppna frågor (inte utredda eller inte möjliga att verifiera här)

- Skickar leverantören eller YunExpress till Taiwan och Japan? Med express eller post? Vilka uppgifter? DDU eller DDP?
- Slår Shopifys TW-fält (early access) också på fälten för Spanien och Portugal? Visas fältet med Shop Pay, Apple Pay och PayPal?
- Exakt vilka nycklar i kassans text som kan ändras för zh-TW (telefonetiketten).
- Får strumpor tillverkade i Fastlandskina föras in i Taiwan i små paket (大陸物品輸入規定 för 6115)?
  Inte verifierat. Volymen av kinesisk e-handel talar för att det går, men det är en slutsats, ingen källa.
- Hur leverantören deklarerar värde och varubeskrivning. I EZ WAY-pushen ser kunden 「申報金額(購買金額+運費)及貨物品項」.

## Hur detta mättes (läs-bart)

- Shopify: `sparning/butik.mjs` → `skapaKlient(lasButik('matstrumpor'))`, bara queries
  (skripten `las.mjs`, `telefon.mjs`, `marknad.mjs` i samma mapp; de vägrar strängen
  "mutation"). Inga kundnamn, adresser eller telefonnummer skrevs ut, bara antal.
- Publika sidor: matstrumpor.se/pages/spara, matstrumpor.com/zh-tw/products/sushi-strumpor?country=TW.
- Inget skrevs i Meta, Shopify, Judge.me eller repot.
