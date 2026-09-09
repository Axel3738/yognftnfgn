# /ny-ops – Bygg en komplett one-product-store (OPS Factory)

Argument: `$ARGUMENTS` — källänk till produkten (Bäverbutik-produktsida eller
annan källa) + ev. önskat brandnamn. SE (huvudspråk svenska) + NO
(locale nb) är ALLTID standard i varje butik — marknads-argument används
bara för YTTERLIGARE marknader utöver dessa.
Exempel: `/ny-ops https://bäverbutiken.se/products/lastnat`

**Flera länkar = en nischbutik med flera produkter** (Axels beslut 2026-09-09,
underlag i `factory/FLERPRODUKT.md`). Skickas två länkar bygger du EN butik som
bär båda — förutsatt att de delar målgrupp. Vad som ändras:
- **Brandet** ska bära nischen, inte en enskild produkt (`fiske`, inte `spöhållare`).
- **Startsidan** blir en kollektion (`sortiment`-sektionen), inte en produkt.
- **Huvudmenyn** får en rad per produkt.
- **Varje produkt får eget `creative_prefix` och egen kampanj** — brandet bor i
  kampanjnamnet. Delas prefixet går fyra system sönder tyst.
- **Break-even skrivs per produkt**, aldrig ett gemensamt butikstal.
⚠️ `ops.mjs` tar i dag EN produktfil (produktloopen är inte byggd, se
FLERPRODUKT.md). Tills den finns: säg det rakt ut och fråga om butiken ska
byggas som huvudprodukt + tillbehör i stället — hitta aldrig på en väg runt.

Kommandot körs EFTER att VA:n gjort checklistans steg 1–2: butiken är
skapad på free trial och appen är kopplad via miljövariablerna
`SHOPIFY_SHOP` + `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET`
(Axels ordning 2026-09-08). Kommandot bygger sen FÄRDIGT hela butiken
utan att vänta — bara klicken i checklistan återstår för VA:n.

Detta är fabrikens huvudrutin. Processen i sin helhet står i
`factory/PROCESS.md` — det dokumentet är facit, det här kommandot är
körordningen. Den som kör är oftast **VA:n (engelsktalande)** — svara henne
på engelska, korta rader; svara Axel på svenska enligt CLAUDE.md.
VA:ns egna klick står i `factory/VA-CHECKLIST.md`; fabriken genererar den
ifylld till `factory/output/<id>/CHECKLISTA.md`.

Gör i ordning, utan att invänta godkännande mellan stegen:

1. **Rätt butik — kommandots FÖRSTA handling, före allt annat.**
   Gör BARA anslutningskontrollen först: hämta token, läs butikens namn
   + myshopify-domän, och rapportera direkt i chatten:
   "Connected: <domän> ✓". Blanda aldrig ihop kontrollen med andra
   läsningar (baseline, produktdata, mallar) — kontrollen ska ta
   sekunder och synas som eget steg, sen börjar resten.
   Kopplingen är butikens EGEN app (VA:n skapar en per
   butik — custom distribution låses till EN butik utanför Plus, mätt
   2026-09-08). Läs `SHOPIFY_SHOP` + `SHOPIFY_CLIENT_ID` +
   `SHOPIFY_CLIENT_SECRET` ur miljön — VA:n har lagt in dem
   (checklistans steg 2). Saknas de: be henne göra steg 2, aldrig
   klistra nycklar i chatten (mätt 2026-09-08: en klistrad CLI-token
   var fel typ och stoppade bygget). Hämta Admin-token med
   klientuppgifterna och skriv `SHOPIFY_STORE_DOMAIN` +
   `SHOPIFY_ADMIN_TOKEN` i `factory/.env` — och spara även en rad
   `SHOPIFY_ADMIN_TOKEN_<butiks-id>` där (det blir MÅNGA butiker:
   miljöns tre variabler skrivs över per bygge, men varje butiks egen
   token ska finnas kvar så gamla butiker förblir nåbara).
   ⚠️ SPÄRR MOT GAMMAL MILJÖ, i den här ordningen:
   (a) **Butikens NAMN ur anslutningskontrollen är facit.** Svarar den ett
   brandnamn som redan finns i `factory/butiker/` eller `factory/output/`
   är miljön kvar på en tidigare butik — stoppa direkt. En ny butik på
   free trial heter aldrig något färdigt brand.
   (b) State-fil under `factory/state/` för samma butik = samma sak.
   ⚠️ (b) ENSAM RÄCKER INTE. Mätt 2026-09-09: miljön stod kvar på
   **TankGuard** (`y1sj1i-3d.myshopify.com`), som saknar state-fil — bara
   HeimGuard har en. State-filstestet hade släppt igenom bygget rakt in i
   förra butiken; namnet var det som fångade det.
   Stoppa och be VA:n skriva över de tre variablerna. Fel butik = stoppa
   direkt, före första skrivningen.
   ⚠️ **Shopify-MCP:n är FÖRBJUDEN i hela den här rutinen** (incident
   2026-09-07: MCP:n i molnsessionen stod på HeimGuard och rutinen
   försökte växla butik med `switch-shop`). MCP:n pekar på fel butik,
   och `switch-shop` kan rikta den mot Bäverbutiken — använd ALDRIG
   `get-shop-info`, `switch-shop` eller något annat `mcp__*`-Shopify-verktyg
   här. ALL Shopify-åtkomst går genom token i `factory/.env`.
   Rör ALDRIG pzjagy-mz (HeimGuard) eller Bäverbutiken från den här rutinen.
2. **Hämta produktdata** från källänken (`/products/<handle>.json` +
   Judge.me-recensioner). Aldrig påhittade specs. Pris från produktsidan.
   Källans Kaching-paketnivåer läses ur den PUBLIKA produktsidans HTML
   — aldrig via MCP mot källbutiken, och aldrig genom att rendera sidan
   i en webbläsare (Playwright når inte ut genom proxyn, mätt 2026-09-09).
   Nivåerna ligger som ren JSON i taggen
   `<script class="kaching-bundles-deal-block-settings" type="application/json">`:
   `dealBars[]` ger antal + `discountType`/`discountValue`, och
   `preselectedDealBarId` säger vilken nivå källan har förvald.
   Spara råkonfigen som `output/<id>/kalla-kaching-paket.json`.
   Går de inte att läsa: fråga Axel efter nivåerna, växla aldrig butik.
   ⚠️ Källan kan ha NOLL recensioner — kolla både Judge.me
   (`number_of_reviews`) och Loox-metafälten i sidans HTML. Är båda tomma
   finns det inget att importera i steg 10: säg det rakt ut i
   slutrapporten, hitta aldrig på recensioner.
3. **Brand-steget** (`factory/PROCESS.md` fas 1): analysera köpare, emotion
   och förväntat brand → positionering, tonalitet, färger, typografi i
   `branding:`-blocket. **Brandingen byggs från noll utifrån produkten och
   målgruppen — strukturen återanvänds, brandingen ALDRIG** (Axels regel).
   Namnregeln (skärpt 2026-09-08): helst ett HELT engelskt namn som svenskar
   och norrmän ändå kan läsa och uttala, aldrig å/ä/ö. Kolla domänen
   med whois INNAN namnet spikas. Rund logga, brandnamnet, seriöst —
   gör 3 loggvarianter, välj bäst och VISA bilden i chatten innan den
   sätts i butiken (Axels krav 2026-09-08).
   När namnet är spikat: meddela VA:n STORE NAME + DOMAIN direkt —
   hon köper domänen och sätter butiksnamnet (checklistans steg 4–5)
   medan bygget fortsätter.
4. **Konfig:** skriv `factory/butiker/<id>.yaml` + `factory/produkter/<id>.yaml`
   från mallarna, validera via `node factory/ops.mjs ... --dry-run` (den
   sammanfogar butik + produkt — kör ALDRIG validera.mjs fristående på
   bara produktfilen, den saknar butiksfälten och stoppar falskt).
5. **Bygg i Shopify** (fas 2, produkten som ACTIVE — DRAFT ger 404 och
   exempelprodukt i kundvyn; trial-lösenordet skyddar butiken).
   ⚠️ Varje variant: `inventoryPolicy: CONTINUE` + `inventoryItem.tracked:
   false` (Axels regel 2026-09-09 — Shopifys default DENY stoppar
   försäljningen tyst när saldot tar slut medan annonserna kostar pengar).
   ⚠️ Testa varukorgen på RIKTIGT innan "klart": tom korg → lägg i varan →
   lådan ska glida in, inte skicka kunden till `/cart` (öppen bugg
   2026-09-09, se PROCESS.md).
   ⚠️ **KÄLLSKANNINGEN — obligatorisk innan butiken lämnas.** Bas-temat är
   exporterat från Matstrumpor, och TRE mallar bär källbutikens text:
   `templates/index.json` (hela startsidan — hero, rubriker, kollektionen
   `strumporna`, produkten `sushi-strumpor`), `sections/footer-group.json`
   (bolagsblocket med `kundsupport@matstrumpor.se`) och
   `templates/product.json` (samma supportmejl). Kör
   `factory/kallskanning.mjs` mot ALLA temats filer och skriv om varje träff
   till butikens eget innehåll. Rapporten ska vara tom.
   (Axels bakläxa 2026-09-09: DryTrek gick till förhandsvisning med
   "Kilometer fyra. Fortfarande torr strumpa." som hero.)
   CRO-temat från `factory/tema/ops-tema.zip`
   (ligger i repot — hämta ALDRIG tema från HeimGuard, Dawn eller
   publika assets) → produkt → metafält →
   opf-sektioner → startsida → meny → policysidor → frakt. Judge.me-widgeten
   i temats **Appyta** (ms-app-slot), aldrig egen styling (minnesregeln).
   Kopiera `current.blocks` (app-embeds) från live-temat in i klonen.
6. **Paketen + Q4-ramverket:** ms_paketniva-metaobjekt (translatable PÅ),
   riktiga rabattkoder som ger exakt paketpriserna, A = källans Kaching-nivåer,
   B = testoffer. **Mitten alltid förvald** (⌈n/2⌉), aldrig första.
   Bonusprodukt: gratis i paketen + betald korg-upsell
   (`tema.mjs → byggKorgUpsell`, `offer.bonus_produkt`).
7. **Bilder:** inbränd engelska bort — kie.ai RENSAR text, sharp lägger
   svensk vektortext (kie klarar INTE svenska direkt). Gif = redigerarjobb.
8. **Marknader** (ALLTID — SE + NO är standard i varje butik, Axels beslut
   2026-09-08): fas 4 i PROCESS.md — marknad Norge + locale nb, webPresence,
   translationsRegister på ALLT, språkversionerade bilder med
   [SV]/[NO]-alt-märkning. Fler marknader läggs till på samma sätt.
   Trippelkolla mot kundens riktiga vy.
9. **Värdena till VA:n.** Hon sitter redan i den här chatten och följer
   sitt Google-dokument — skicka ALDRIG en checklistfil till Axel och be
   ingen vidarebefordra något. Skriv värdena rakt i chatten till henne:
   STORE NAME, DOMAIN och STORE EMAIL (hello@domänen) + "continue at
   step 4". `output/<id>/CHECKLISTA.md` skrivs bara som arkivkopia.
   Ändrades mallen (VA-CHECKLIST.md/checklista.mjs) i sessionen: för in
   ändringen i VA:ns Google-dokument också (länken står i VA-CHECKLIST.md).
   Fortsätt bygga det som inte kräver hennes klick under tiden.
10. **"Store ready: <namn>"** från VA:n = slutsteget: importera recensionerna
    (`tools/judgeme-import.mjs --mejlsuffix <domän>.invalid` med hennes token —
    en delmängd av recensionerna översätts ALLTID till norska och importeras
    med norska namn — Norge är standardmarknad i varje butik; Judge.mes
    auto-översättning är paid och köps ALDRIG, se PROCESS.md fas 3),
    skapa pixeln (`skapaPixel` i `factory/meta-setup.mjs`, kräver
    META_ACCESS_TOKEN i `factory/.env`) i det gemensamma OPS-annonskontot
    **MagiBorsten DK 915422744950975** — samma konto för varje OPS-butik,
    döps aldrig om; kampanjnamn prefixas med brandet — bygg Discord-kanalerna
    (`factory/discord.mjs --guild <id> --ikon <logga>`). Säg sen exakt vilket
    tema VA:n ska publicera (tema-publicering är API-spärrad — det klicket är
    hennes, checklistans steg 8) och ge henne pixel-ID:t för WeTracked.
11. **Trippelkolla innan "klart"** — tre kontroller mot kundens riktiga vy
    (markörskanning, regression, visuell mobilkontroll). Delvis klart heter
    delvis klart.
    ⚠️ **Slutrapporten i chatten ska ha TVÅ listor, aldrig en** (Axels
    bakläxa 2026-09-08 på TankGuard): "Gjort av mig" och "Väntar på en
    människa". Ett steg där en person ska klicka står ALDRIG i den första
    listan — pixeln var skapad men WeTracked-kopplingen var inte gjord,
    och rapporten sa bara "Pixeln är klar".
    ⚠️ **Nämn aldrig en person som inte finns.** `factory/discord.mjs`
    bygger servern även när `factory/redigerare/standby.md` saknar en rad
    med status `redo` — då rapporteras plockningen som manuell. Skriv i så
    fall "ingen redigerare i standby-listan än", aldrig "bjud in
    redigeraren". (Mätt 2026-09-08: listan har noll rader.)
12. **Dokumentera:** state-fil under `factory/state/`, och varje NYTT bevisat
    steg in i `factory/PROCESS.md` i samma session. Committa och pusha.

## DEFINITION OF DONE
- [ ] Rätt Shopify-butik verifierad innan första skrivningen
- [ ] Brand-config byggd från produkt + målgrupp, inte återanvänd
- [ ] Namnregeln: helst helt engelskt namn (läsbart för svenskar/norrmän), ingen å/ä/ö, domän kollad
- [ ] Produktsida med alla opf-sektioner + Judge.me i Appyta, ostylad
- [ ] Varje variant säljer vidare vid slut i lager (CONTINUE, tracked false)
- [ ] Varukorgen testad med TOM korg: lådan glider in, ingen redirect till /cart
- [ ] Källskanningen REN: ingen Matstrumpor-text kvar i något temaläge
      (`node factory/kallskanning.mjs` — startsida, footer, produktmall)
- [ ] Paket A/B med riktiga koder, mitten förvald, bonus + korg-upsell inne
- [ ] Bilder utan engelsk text, svensk vektortext pålagd
- [ ] Marknad Norge + locale nb publicerad, allt översatt via translationsRegister, trippelkollat mot /nb
- [ ] CHECKLISTA.md genererad och överlämnad till VA:n
- [ ] Recensioner importerade när token kommit
- [ ] Trippelkollat mot kundens vy — annars står det "delvis klart"
- [ ] state + PROCESS.md uppdaterade, pushat
