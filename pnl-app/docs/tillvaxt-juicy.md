# Få över Juicy-användare till StonePNL — så nära gråzonen det går utan att bli av med appen

Skrivet 2026-09-08 på Axels fråga ("så enkelt och nästan grey hat som möjligt").
Regeln: allt nedan är sådant Shopify **inte** stänger av appen för. Det som ligger
utanför står sist, med skälet — en avstängd App Store-listning är slutet på
StonePNL, och det är inte värt tio installationer.

## 1. Var Juicy-användarna redan är (och där vi får synas)

| Kanal | Vad vi gör | Varför det funkar |
|---|---|---|
| **App Store-sök på "Juicy"** | Nyckelorden i listningens rubrik/undertitel: *"profit, P&L, COGS, LTV — alternative to Juicy"* får INTE innehålla varumärket i titeln (Shopify avvisar), men **beskrivningen** får jämföra sakligt: "Coming from Juicy? Import your costs in 3 clicks." | Sök i App Store viktar titel + beskrivning; "Juicy alternative" är en riktig sökfras. |
| **Google: "Juicy Shopify app alternative / review / pricing"** | En jämförelsesida på stonebite.se: *StonePNL vs Juicy* — tabell funktion för funktion, pris, och en ärlig kolumn "där Juicy är bättre". | Jämförelsesidor rankar snabbt på low-volume-fraser; ärlighet ger länkar. |
| **Juicys egna recensioner** (apps.shopify.com/juicy/reviews) | Läs alla 1–3-stjärniga. Varje klagomål = en feature/text i vår listning ("No per-market COGS? We have one store per market with daily FX."). | Deras missnöjda kunder skriver exakt vad de saknar. Gratis produktresearch. |
| **Reddit r/shopify, r/dropship, r/ecommerce** | Svara på frågor om "how do you track real profit" med en ärlig jämförelse där StonePNL nämns som *ett* alternativ — aldrig som första svar på egen tråd. | Reddit straffar reklam, belönar hjälp. 1 bra svar/vecka i 3 månader. |
| **Svenska e-handelsgrupper (Facebook: E-handel Sverige, Dropshipping Sverige)** | Juicy är svenskt (Dagens E-handel Sverige AB) — deras kunder är där. Ett inlägg: "Vi byggde en P&L-app för våra egna fem butiker, nu i App Store. Så här skiljer den sig från Juicy." | Hemmaplan. Grundarberättelse slår annons. |
| **Shopify Community forum** | Svara i trådar om COGS/profit tracking; signatur med appen. | Indexeras av Google, lever i år. |

## 2. Övergångserbjudandet (det som får dem att faktiskt byta)

1. **"Switch from Juicy" — privat plan med 60 dagars gratis** (Shopify App Pricing
   tillåter privata planer, se `foretag-admin.md`). Länken bara på jämförelsesidan.
   Kostar oss inget; Juicy kostar dem 29–49 USD/mån under tiden.
2. **Vi flyttar din COGS åt dig.** Knappen "Kommer du från Juicy?" finns redan
   (scenario A). Erbjud dessutom *concierge*: "Skicka din Juicy-export eller en
   skärmbild av kostnadstabellen till support@… — vi lägger in allt inom 24 h."
   Manuellt i början = vi lär oss Juicys exportformat gratis (scenario B byggs
   sedan på riktiga filer, `juicy-import.md` avsnitt 6).
3. **Sidan visar Juicy-jämförelsen i appen**: i Kostnader-kortet läge B, en rad
   "Juicy costs 29–49 USD/mo — StonePNL 5." Sakligt, med källa.
4. **Multi-butik gratis**: Juicy tar per butik. Vår grupp-vy (fem butiker, fem
   valutor, en summa) är argumentet för alla med NO/DK/FI-kloner. Skriv det överst.

## 3. COGS-flytten — enklast möjligt, i ordning

1. Öppna Kostnader i StonePNL. Kortet säger om kostnaderna redan finns i Shopify
   (då är det klart — Juicy eller du själv skrev till "Cost per item").
2. Annars: i Juicy → kostnadssidan → Export (finns knappen). Släpp filen i
   StonePNL:s importruta. Kolumnerna behöver ha titel/variant + kostnad.
3. Finns ingen export: markera Juicys tabell, kopiera, klistra in i textfältet
   (tabbseparerat tolkas). Flerpack skrivs som `88|134|180`.
4. Tryck **Skriv till Shopify**. Kostnaderna blir butikens egendom (Shopifys
   fält), inte inlåsta i vår app — det är säljargumentet mot Juicy.

**Det vi behöver från Axel för att bygga den automatiska Juicy-tolken:** en riktig
exportfil från Juicy (Bäverbutiken har Juicy). Utan den gissar vi inte kolumner.

## 4. Gråzonen — vad som INTE görs, och varför

- **Skrapa Juicys kunder** (t.ex. via "Similar apps"/BuiltWith/Storeleads) och
  mejla dem oombett: bryter mot Shopify Partner Program Agreement (ingen
  oönskad kontakt med handlare via data från plattformen) och mot
  marknadsföringslagen (B2B-mejl till enskild firma kräver samtycke). En
  anmälan = avstängning.
- **Köpa "Juicy" som Google-sökord**: tillåtet i Sverige/EU så länge annonstexten
  inte använder varumärket eller vilseleder. Låg volym, hög CPC — testa med
  500 kr, inte mer.
- **Negativa recensioner på Juicy**, falska recensioner på oss, eller att be
  vänner recensera utan att de använder appen: Shopify upptäcker mönstret och
  tar bort både recensionerna och i värsta fall listningen.
- **Kopiera Juicys texter/UI**: upphovsrätt. Kopiera *funktionslistan* som krav
  på oss själva — det är lagligt och rätt.

## 5. Ordning att göra det i (två veckor)

1. Läs Juicys 1–3-stjärniga recensioner → lista → 3 texter i vår listning.
2. Jämförelsesidan *StonePNL vs Juicy* på stonebite.se (en kväll).
3. Privat plan "Switch from Juicy" 60 dagar (Partner Dashboard, Cowork-prompt
   i `cowork-prompts.md` — byt pris till 0 och trial till 60).
4. Ett inlägg i varje svensk e-handelsgrupp, ett Reddit-svar per vecka.
5. Första Juicy-exporten från Bäverbutiken → bygg tolken → "3 klick" på riktigt.
