# Produktsidans copy, två versioner (2026-10-02) — ✅ LIVE: Fable omskriven i butikens röst, 08:21 UTC

⛔ **Axels dom 08:15 UTC på den första live-versionen:** "I USA gav 32 procent ett presentkort för
att de inte visste vad de annars skulle köpa, enligt Bankrate 2024." är "inte bra copy … fan va
keft". Han hade godkänt Fable utan att läsa raden. Alla tre statistikmeningar (Wolt, Bankrate,
YouGov) är strukna; problemet är de tråkiga presenterna (ljus, tvål, grå strumpor — samma bild som
UGC-brief 2), lösningen Fables rader utan "verifierad köpare … på Judge.me", 234 ord. Regeln står i
`docs/copy-regler.md` → "Statistik på produktsidan" och som spärr i `matstrumpor/produktsida.mjs`
(stoppar "enligt", "procent" och %). Tre kontroller 08:21–08:25 UTC: API tillbakaläst, publika
`.json`, publika HTML-sidan via curl (0 statistikrader, nya texten 5 träffar). Chromium-läsningen
fick Shopifys "Vänta…"-mellansida efter tre besök på tio minuter — kundvyn är därför curl, inte
skärmdump, den här gången. Säkerhetskopia av 08:08-versionen:
`matstrumpor/produktsida/backup/2026-10-02T08-21-35-200Z-sushi-strumpor.html`.

## Lärdom (sessionens)

Tre-frågorstestet och domarpanelen släppte igenom tre rader som klarade "se / falsk / bara vi"
men lät som en uppsats. Faktabladet sa redan "fakta lever i bild, rubrik, mejl" — workflowens
instruktion krävde ändå "minst två fynd" i copyn, och det kravet var fel. Nästa gång: läs sidan
högt som en kund innan den visas för Axel, och be aldrig en skribent väva in en källa i
produktcopy.

**Utfall:** Axel valde Fable ("jag gillar fables version") med kravet att beskrivningen följer hans
struktur **Problem → gif → Lösning → gif/bild → Funktioner → bild → Garanti** (samma skelett som
den gamla texten). Fables ord ordnades om i den följden (inget nytt påstående; "Många ger bort den
till jul" och "Det var långt före jul" sitter nu i novemberstycket före bilden), videorna och
bilden står kvar på sina platser, garantiblocket är orört. Filen: `matstrumpor/produktsida/
sushi-strumpor.html`, verktyget `node matstrumpor/produktsida.mjs [--skarpt]` (kontrollerar
tankstreck, parenteser, "mest beställda", andra lådor, pris och material innan den skriver; sparar
den gamla texten i `produktsida/backup/` och läser tillbaka via API + publika `.json`). Säkerhets-
kopia: `matstrumpor/produktsida/backup/2026-10-02T08-08-13-879Z-sushi-strumpor.html` — återställ
med `--aterstall <fil> --skarpt`. Läst som svensk mobilkund i Chromium 08:10 UTC: fyra rubriker i
rätt ordning, 3 media, 302 ord, `lang=sv`.

⏰ **Påminnelse satt** (`trig_01X2fCvnnheQh7fpghkiLtDL`, mån 26/10 07:45 CET): Axels ord "vi får
inte glömma att uppdatera den innan november" — novemberraderna ses över mot lagret innan 1/11.
✅ **De tretton språken bär den nya texten sedan 2026-10-02 ~09:30 UTC** (sonnet-översättare +
infödd granskare per språk, `granska.mjs` 0 fel, `bygg.mjs --steg oversattningar --skarpt`,
`--steg kontroll` 13 av 13 rätt; `marknader/README.md` → "Produktbeskrivningen på tretton
språk"). ATC-graden mäts om i rutinen (5,5 % var utgångsläget).

Axels beställning 2026-10-02: "Ge mig copyn innan du lanserar, och ge mig två versioner, en där den
är skriven av sonnet 4.6 och en där den är skriven av fable 5.1 ultracode." Sidan som ska bytas:
https://matstrumpor.se/products/sushi-strumpor (bara `body_html`, temats block rörs inte).
Underlaget är workflow-körningen `wf_b17ebc96-70c` (resumed med ny informationen): hela resultatet
med faktablad, tre Fable-utkast, tre domare, syntes och kontroll i
`2026-10-02-v2-med-ny-information.json`. Jämförelsesidan till Axel:
https://claude.ai/artifact/DN6qLRcQeN1GSPhycSMuSu (dagens text · Sonnet · Fable).

**Sessionens förslag: Fables version.** Skäl: samma sak som Nathalies video i videons ordning
(november, ditt tecken, favoriträtten, lådan på bordet, nypet, säkra dina); de tre fynden (Wolt
topp tre 2025, Bankrate 32 % 2024, YouGov 44 % 2025) kontrollerade av huvudsessionen mot
`ny-information.md` rad 44, 84 och 141; citatet verifierat (Judge.me 4★ 2026-09-28); 0 tankstreck,
0 parenteser, inget pris, inget material, ingen annan låda; 301 ord. Sonnets utkast bär ett
faktafel (YouGov-raden påstår "visar att man lyssnat", källan säger "hellre överraskad än
tillfrågad"), två tankstreck (36–44), fyra parenteser med källnamn och "mest beställda rätterna"
(källan säger kategorier). Sonnets kontrollsteg kraschade (`[kontroll:sonnet] failed`), så
granskningen av Sonnet är huvudsessionens.

Enkäten gick inte att läsa (lösenordet `KUNDTJANST_MAIL_PASS_MATSTRUMPOR` finns bara i rutinens
miljö) — antalet svar är okänt, inte noll.

## Så läggs den valda in (efter Axels ok)

1. `body_html` byts via Shopify Admin API (appen Fabriken, `SHOPIFY_CLIENT_ID/SECRET_1r46tp_qx`);
   de två videoslingorna och bilden behålls på sina platser mellan blocken
   (`ms-loop-beskr` efter block 1, `ms-loop-avslojandet` efter nyp-blocket, bilden efter
   november-blocket).
2. Slutblocket "30 dagar att ändra dig. 30 dagars öppet köp …" behålls som i dag — det är
   Matstrumpors publicerade policy (brandfilen `returfonster_dagar: 30`); annonserna säger 14.
3. Punkten "Fri frakt i Sverige – framme på 5–10 arbetsdagar" utgår ur listan (fraktrutan under
   köpknappen säger datumet själv) — ⚠️ fråga Axel om den ska stå kvar.
4. Läs tillbaka som kund (Chromium, `?country=SE`), sedan ATC-graden i `kor.mjs --hamta`
   (Chadbot: under 8 % = glapp annons/sida). I dag: Nathalie 5,5 % ATC, d3-bilden 12,9 %.
5. De elva översättningarna (`marknader/output/underlag-<locale>.json`) bär den GAMLA texten —
   en ny svensk `body_html` måste översättas om innan `bygg.mjs --steg kontroll`, annars glider
   svenska och utland isär. Eget steg.

---

## Version A — Sonnet 4.6 (claude-sonnet-4-6), oredigerad

**Titel:** Sushi-Strumpor
**Underrubrik:** Fem par. Tio sushibitar. Ätpinnar ingår.

**Du visste ju vad de alltid beställer.**
Sushi landade bland de tre mest beställda rätterna på Wolt i Sverige 2025. Det är vad folk väljer
när de kan välja vad som helst.
Den här lådan innehåller tio sushibitar i fem sorter, packade i ett tråg med genomskinligt lock.
Mottagaren tror att det är sushi. Sedan lyfter de locket.

**Dom sålde slut i november förra året.**
Förra hösten stod det 'slut i lager' på den här sidan. Det gick fort.
Nu finns de igen.

**Räck den inte över. Duka fram den.**
Ätpinnar av trä ingår i varje låda. Det gör plastgräset också.
Ställ tråget på bordet. Lägg ätpinnarna bredvid. Låt mottagaren hitta det själv.
44 procent av britterna uppger att de helst vill ge en present som visar att man lyssnat (YouGov
2025). Det är vad en låda sushi på fötterna gör. ⛔ FEL: källan (YouGov UK 2025-11-28) säger 44 %
vill hellre bli överraskade, 32 % tillfrågade först.

**Rolig att öppna. På fötterna dagen efter.**
Förpackningen öppnas. Strumporna har på sig. Sedan är det gjort.
57 procent i USA vill helst ge något praktiskt när de ger presenter. 25 procent vill ge något
roligt (Talker Research 2025). Den här lådan är båda på en gång.
Skämtet sitter på lådan, inte på personen. One size passar storlek 36–44. Levereras presentklart.

Punkter: 5 par sushistrumpor (tio bitar, fem sorter) · Sorter: laxnigiri, tamago, laxmaki,
gurkmaki, röd maki · Ätpinnar av trä (ingår i alla lådor) · Tråg med genomskinligt lock ·
Plastgräs · One size 36–44 · Levereras presentklart

---

## Version B — Fable 5.1 ultracode (tre utkast → tre domare → syntes → kontroll), sessionens förslag

**Titel:** Sushi-Strumpor
**Underrubrik:** Tio sushibitar med ätpinnar i trä. Du visste ju deras favoriträtt.

**Förra året tog sushilådan slut i november.**
Det var långt före jul. Vill du ge bort den i år finns den att köpa nu. Så det här är ditt tecken.
Ge bort deras favoriträtt. Fast som strumpor.

**Lådan säger: jag vet vad du alltid beställer.**
Du känner någon som alltid beställer sushi. Och de är många. Sushi låg topp tre på Wolt i Sverige
2025.
Ett presentkort säger: jag vet inte. I USA gav 32 procent ett presentkort för att de inte visste vad
de annars skulle köpa, enligt Bankrate 2024. Lådan säger tvärtom. Du visste.

**Räck den inte över. Duka fram den.**
Lådan är ett riktigt takeaway-tråg med genomskinligt lock, och ätpinnar i trä följer med. Så ställ
den på bordet, bland den riktiga maten. På fikat, på middagen eller på julbordet. Inget
presentpapper behövs.

**Tio sushibitar. Två av varje sort.**
Varje strumpa är rullad som en sushibit. Fem par blir tio bitar, två av varje sort.

**Genom locket är det sushi. I handen är det en strumpa.**
Den som öppnar lådan nyper i en bit. Det är en strumpa. En verifierad köpare skrev på Judge.me:
"Mycket uppskattad julklapp till sushiälskande dotter!"
Den överraskningen vill många ha. I Storbritannien vill 44 procent hellre bli överraskade med en
present än tillfrågade först, enligt YouGov 2025.

**Många ger bort den till jul.**
Ta med den till kalaset, eller köp den nu och spara den till julstrumpan. Den tog slut i november
förra året. Säkra dina innan det händer igen.

Punkter: 5 par strumpor, rullade som tio sushibitar · Två bitar av varje sort: laxnigiri, tamago,
laxmaki, gurkmaki och röd rulle · Ätpinnar i trä · Takeaway-tråg med genomskinligt lock, plastgräs
och kulor som wasabi och ingefära · One size, passar storlek 36 till 44 · Levereras presentklart

Tre-frågorstestet per rad, domarnas poäng (91 / 80 / 76 för utkast 1–3) och kontrollens två
rättningar ("ätpinnarna ligger redan i" → "följer med"; "är det nu den finns" → "finns den att köpa
nu") står i JSON-filen.
