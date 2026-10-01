# Prompt: granska Beaver Store i alla marknader (egen session)

Klistras in i en NY Claude Code-session på repot `axel3738/yognftnfgn`. Allt nedanför strecket är prompten.

---

Granska Beaver Store (Bäverbutiken worldwide, beaverstoreco.com) som KUND i alla marknader, och rätta det som är fel. Annonserna gick live 2026-10-01 00:01 och spenderar ~16 000 kr/dag, så varje fel kostar pengar nu.

**Steg 0: rätt kod.** Worldwide-arbetet ligger INTE på `main` än. Det ligger på grenen `claude/eager-lovelace-9vxg8l`. Kör `git fetch origin claude/eager-lovelace-9vxg8l` och skapa din egen arbetsgren från den. Läs sedan, i den här ordningen: `CLAUDE.md` (avsnittet `worldwide/`), `worldwide/README.md`, `worldwide/konfig.json`, `worldwide/kundvy.mjs`, `worldwide/tema/patch.mjs`, `worldwide/oversattning/REGLER-*.md` och `worldwide/annonser/konto.json`.

**Fakta.** Det är samma Shopify-butik som baverbutiken.se (`4snrw0-mg`), och marknaden heter Worldwide. Den har 37 länder (`konfig.json → marknad.lander`), åtta språk (en, de, fr, es, it, nl, pl, pt-PT), USD som bas med lokala valutor, +25 % i pris och fri frakt. Annonserna ligger i Magiborsten UK `1107817401910319`: 16 kampanjer `BEAVERSTORE_WW_*` med 151 annonser och sidan Beaver Store `1305042582683792`.

⚠️ Containern går ut på nätet från USA. Utan uttryckligt land ser du bara USA-vyn. Använd `kundvy.mjs`-tekniken (POST `/localization` med `country_code` + `language_code`, sedan kakan), eller `?country=XX` i länken. Chromium kräver `--ignore-certificate-errors`. Läs svenska sidor med `?country=SE`.

**Det här ska granskas, i varje land (alla 37) och på varje språk (alla 8):**
1. **Startsida, alla 16 produktsidor, kollektion, sök, 404, kontakt, policysidorna** (frakt, retur, villkor, integritet) och spårningssidan. Kontrollera:
   - språket och att det inte finns en enda svensk rad;
   - valutan och priset (Shopifys omräkning, inga kronor);
   - loggan Beaver Store, "A Swedish brand" och "Free shipping to <kundens land>" på kundens språk;
   - recensionsrutan (Judge.me) och paketväljaren (Kaching);
   - menyn och sidfoten, och att alla länkar går rätt;
   - cookiebannern och "Dina integritetsval".
2. **Varukorgen och lådan** (upsell, totalsumma, knapptexter).
3. **Kassan som kund:** lägg en vara i korgen och öppna kassan. Kontrollera att:
   - landet är förvalt rätt, och valutan och språket stämmer;
   - frakten är 0;
   - samtyckesrutan och betalsätten stämmer.
   Lägg ALDRIG en order.
4. **Shopifys mejl till utländska kunder.** Läs de sex första ordrarna utanför Sverige sedan 2026-10-01 (#8824–#8837). Ta reda på vilket språk orderbekräftelsen och fraktmejlen går ut på. Bäverbutikens mallar är egna och svenska (`mejl/`). Om en amerikansk kund får svenska mejl är det ett fynd. Se hur Matstrumpor löste det i `mejl/README.md` → "Matstrumpor på tolv språk".
5. **Alla 151 annonser** (läs-bart via `META_ACCESS_TOKEN`). Kontrollera att:
   - länken går till rätt produkt på beaverstoreco.com och svarar 200 som kund i ett par av landets länder;
   - copyn är engelska, utan "Bäverbutiken", utan kronor och utan påhittad brådska;
   - leveransstatusen inte är avvisad eller fastnat i granskning.
6. **Sverige är orört:** `node worldwide/kundvy.mjs --sverige` ska visa Bäverbutiken, svenska och SEK, och inget "A Swedish brand".

Kör `node worldwide/kundvy.mjs` och `node worldwide/oversattning/granska.mjs` först, och gå sedan djupare i Chromium. Ta skärmdumpar på mobil (390 px) och desktop i minst US, GB, DE, FR, ES, IT, NL, PL, PT, AU och JP, och titta på dem själv. Dela gärna ut språken på flera subagenter (en per språk), och låt en skeptisk granskare kontrollera varje fynd innan det räknas.

**Rätta själv, och läs tillbaka efteråt:** översättningar (`translationsRegister`), temats världsläge (`worldwide/tema/`, `patch.mjs --tema <id> --skarpt`), `appord.json`, och trasiga länkar på sidor och i menyer. Varje rättning läses tillbaka som kund i det land där felet syntes.

⛔ **Rör aldrig:**
- Sverige eller baverbutiken.se:s svenska vy;
- DNS;
- Shopify Payments eller skatteinställningarna;
- priser och prispåslaget;
- NO, DK och FI (de har egna butiker).

⛔ **Annonserna:** pausa, aktivera eller ändra aldrig en annons, ett adset, en kampanj eller en budget. Felaktiga annonser listas för Axel. Lägg aldrig en order, och skriv ingen text om moms eller tull.

**Leverans:**
- Skriv `worldwide/granskning/2026-10-01.md` med en tabell över alla fynd: land, språk, sida, vad som var fel, rättat ✅ / kvar ❌ och varför.
- Committa och pusha din gren. Ingen PR.
- Svara Axel på svenska, kort (han har dyslexi). Ge antal fynd, vad som rättades och vad som är kvar.
- Sätt det enda HAN måste göra sist, numrerat. Klick i admin samlas i EN Cowork-prompt i `worldwide/cowork/` som ges sist i ett kodblock.
- Säg aldrig "klart" utan tre kontroller mot kundens riktiga vy.
