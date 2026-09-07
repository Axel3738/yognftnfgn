# /ny-ops – Bygg en komplett one-product-store (OPS Factory)

Argument: `$ARGUMENTS` — källänk till produkten (Bäverbutik-produktsida eller
annan källa) + ev. önskat brandnamn. SE (huvudspråk svenska) + NO
(locale nb) är ALLTID standard i varje butik — marknads-argument används
bara för YTTERLIGARE marknader utöver dessa.
Exempel: `/ny-ops https://bäverbutiken.se/products/lastnat`

Detta är fabrikens huvudrutin. Processen i sin helhet står i
`factory/PROCESS.md` — det dokumentet är facit, det här kommandot är
körordningen. Den som kör är oftast **VA:n (engelsktalande)** — svara henne
på engelska, korta rader; svara Axel på svenska enligt CLAUDE.md.
VA:ns egna klick står i `factory/VA-CHECKLIST.md`; fabriken genererar den
ifylld till `factory/output/<id>/CHECKLISTA.md`.

Gör i ordning, utan att invänta godkännande mellan stegen:

1. **Rätt butik.** Kopplingen till den nya butiken är appen **Fabriken**
   på dev.shopify.com (VA-checklistans steg 4). Be VA:n om TRE värden:
   butikens `.myshopify.com`-adress, appens **Client ID** och **Client
   secret**. ⚠️ Be ALDRIG om en klistrad token (mätt 2026-09-08:
   VA:n klistrade en Shopify CLI-token — fel typ, stoppade bygget).
   Hämta Admin-token med klientuppgifterna, installera appen i butiken
   (ge VA:n installänken), skriv `SHOPIFY_STORE_DOMAIN` +
   `SHOPIFY_ADMIN_TOKEN` i `factory/.env`. Verifiera med fabrikens
   anslutningskontroll att domänen är DEN NYA butiken — fel butik =
   stoppa direkt.
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
   med whois INNAN namnet spikas. Rund logga, brandnamnet, seriöst.
4. **Konfig:** skriv `factory/butiker/<id>.yaml` + `factory/produkter/<id>.yaml`
   från mallarna, validera via `node factory/ops.mjs ... --dry-run` (den
   sammanfogar butik + produkt — kör ALDRIG validera.mjs fristående på
   bara produktfilen, den saknar butiksfälten och stoppar falskt).
5. **Bygg i Shopify** (fas 2): CRO-temat från zip → produkt → metafält →
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
9. **Checklistan:** generera `output/<id>/CHECKLISTA.md` och ge VA:n den.
   Ändrades mallen (VA-CHECKLIST.md/checklista.mjs) i sessionen: för in
   ändringen i VA:ns Google-dokument också (länken står i VA-CHECKLIST.md).
   Vänta på hennes klick — fortsätt bygga det som inte kräver dem under tiden.
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
- [ ] Recensioner importerade när token kommit
- [ ] Trippelkollat mot kundens vy — annars står det "delvis klart"
- [ ] state + PROCESS.md uppdaterade, pushat
