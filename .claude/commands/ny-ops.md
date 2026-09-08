# /ny-ops – Bygg en komplett one-product-store (OPS Factory)

Argument: `$ARGUMENTS` — källänk till produkten (Bäverbutik-produktsida eller
annan källa) + ev. önskat brandnamn. SE (huvudspråk svenska) + NO
(locale nb) är ALLTID standard i varje butik — marknads-argument används
bara för YTTERLIGARE marknader utöver dessa.
Exempel: `/ny-ops https://bäverbutiken.se/products/lastnat`

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
   ⚠️ SPÄRR MOT GAMMAL MILJÖ: har `SHOPIFY_SHOP`-butiken redan en
   state-fil under `factory/state/` är miljön inte uppdaterad för den
   nya butiken — stoppa och be VA:n skriva över de tre variablerna.
   Verifiera med fabrikens anslutningskontroll att domänen är DEN NYA
   butiken — fel butik = stoppa direkt.
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
   (bundle-widgeten renderas där) — aldrig via MCP mot källbutiken.
   Går de inte att läsa: fråga Axel efter nivåerna, växla aldrig butik.
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
   exempelprodukt i kundvyn; trial-lösenordet skyddar butiken):
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
10. **"Store ready: <namn>"** från VA:n = slutsteget: recensionerna
    (fabrikens `recensioner`-steg skriver `output/<id>/judgeme-app-import.csv`
    i Judge.mes mallformat med källans ORIGINALDATUM — VA:n laddar upp den i
    appen: Settings → Import reviews → Import from apps → Judge.me format.
    ALDRIG via API:t: det sätter importögonblicket som datum och "för 12
    minuter sedan" på allt skriker fejk — Axels regel 2026-09-08. En delmängd
    av recensionerna översätts ALLTID till norska och ligger i samma fil
    med norska namn — Norge är standardmarknad i varje butik; Judge.mes
    auto-översättning är paid och köps ALDRIG, se PROCESS.md fas 3. Efter
    hennes import: verifiera i kundvyn att datumen är originalen),
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
12. **Dokumentera:** state-fil under `factory/state/`, och varje NYTT bevisat
    steg in i `factory/PROCESS.md` i samma session. Committa och pusha.

## DEFINITION OF DONE
- [ ] Rätt Shopify-butik verifierad innan första skrivningen
- [ ] Brand-config byggd från produkt + målgrupp, inte återanvänd
- [ ] Namnregeln: helst helt engelskt namn (läsbart för svenskar/norrmän), ingen å/ä/ö, domän kollad
- [ ] Produktsida med alla opf-sektioner + Judge.me i Appyta, ostylad
- [ ] Paket A/B med riktiga koder, mitten förvald, bonus + korg-upsell inne
- [ ] Bilder utan engelsk text, svensk vektortext pålagd
- [ ] Marknad Norge + locale nb publicerad, allt översatt via translationsRegister, trippelkollat mot /nb
- [ ] CHECKLISTA.md genererad och överlämnad till VA:n
- [ ] Recensioner: app-CSV med originaldatum byggd och överlämnad; efter VA:ns import verifierade datum i kundvyn (aldrig "nyss")
- [ ] Trippelkollat mot kundens vy — annars står det "delvis klart"
- [ ] state + PROCESS.md uppdaterade, pushat
