# KD-2026-004: MatSokker kör Matstrumpors annonser i Norge och vår film på sin sajt (2026-10-01)

**Axels order:** "Jag vill att du också kollar för matstrumpor.se då jag tror det är den
butiken vi kan bli rippade mest på". Sessionen hittade MatSokker och frågade A (anmäl) eller
B (vänta), och Axel svarade "A". Han skrev också: "Vi måste också göra en DMCA via Shopify
eftersom de har snott våra UGC videos och skit och lagt på sin hemsida. Anmäla allt."

## Vad som mättes

- **Sidan:** MatSokker, sid-id `1338643506004296`, butiken matsokker.shop. Shopify-butiken
  skapades 2026-09-30 kl 18:02 CEST, och temat är "Shrine PRO", inte vårt. E-posten är
  matsokker@hotmail.com.
- **Hittad med** annonsbibliotekets sökord `sushisokker` (NO).
- **9 aktiva annonser i Norge**, alla startade 2026-09-30: 6 filmer och 3 bilder.
- `--hamta --annonser-sida 1338643506004296 --land NO` gav STARK: 7 av 9 förhandsbilder och
  annonsbilder var lika våra (dHash 0–8). Det blev ingen text-träff, eftersom texten är
  översatt till norska.
- **Ärendet skapades med `--rapport --tvinga`.** Det låg under Axels tröskel: 7 kopierande
  annonser live, och räckvidden syns inte utanför EU. Axels "A" är överstyrningen.
- Annonstexten är vår `043`, översatt ord för ord. Våra egna NO-kampanjer har 0 visningar,
  så kopiorna är deras egna översättningar från svenskan, inte en läcka.

## De nio annonserna: alla bevisade

Anmälningarna i `anmalan/<nr>.json`. Filmerna är bevisade med rutor ur VÅRA klipp
(`--klipp`), och bilderna med bildjämförelse. Originalet är vår annons i annonsbiblioteket
(`--original`). För bilderna är det vår sidas lista, eftersom en bildannons inte söks fram
på samma sätt.

| Nr | Deras annons | Vårt material | Mätt | Originalet |
|---|---|---|---|---|
| 1 | film | Sofie H1 Sushi Captions Ingen musik | 55 % av rutorna | `1684992010012039` |
| 2 | film | 09-24 Katarina Sushigalen unge | 34 % | `1660194462177066` |
| 3 | film | 09-17 Nathalie captions musik | 68 % | `2127001151229429` |
| 4 | film | haikuh1, haikuh3, fomo november | 51 % | `2244688169808902` |
| 5 | film | haikuh2, haikuh3 | 54 % | `863619966705432` |
| 6 | bild | 036 (julstrumpan) med norsk text | nästan identisk, 7/64 | sidans lista |
| 7 | bild | d3 (Köp 2 – få 2) med norsk text | nästan identisk, 8/64 | sidans lista |
| 8 | film | s001h1, 039h1 | 76 % | `1025151246952508` |
| 9 | bild | d4 (Ser ut som mat), texten omsatt | bilden under texten: 2/64, fint 20/256 | sidans lista |

- **Annons 3 (filmen med s-serien)** hade varken text- eller förhandsbildsträff och togs in
  som kandidat med `--lagg-till`. Klippen avgjorde.
- **Annons 9 (d4)** matchade inte som hel bild, eftersom deras norska text täcker en stor
  del. Därför finns `delbild.mjs`: vår bilds mittparti (MITTPARTI, utan textraderna) söks i
  deras bild över skala och läge. Grovt 2/64 (gräns 6) och fint 20/256 (gräns 64) vid skala
  0,96. Kontrollerna mot andra bilder gav 10–15/64 och 100–131/256. Annonsen lades till med
  `--lagg-till-bild`.
- **Bild 6 och 7 heter "near-identical", aldrig "identical"** (rättat samma dag): bilden är
  vår, men texten är omsatt till norska och d3 har ett något smalare utsnitt (7–8/64). De
  500 tecknen och kortet sa "identical" och säger nu "nearly identical" / "nästan identisk".

### Paren pekar på filmer som faktiskt visats

Matstrumpors utlandsversioner `MATSTRUMP_<LAND>_*` (NO, DK, US …) är PAUSED och har aldrig
visats, så de finns inte i annonsbiblioteket. Ett par mot en sådan film går inte att
kontrollera för Metas granskare. Därför kördes `--klipp` med `--utan-film
'^MATSTRUMP_[A-Z]{2}_'`, så att alla par kommer ur våra svenska annonser som gått. Med tio
försök hittade `--original` inte alla, eftersom flera svenska annonser delar text. Med
`--max-prova 15` hittades 8 av 9 filmer. Fomo november saknar original i biblioteket, men i
anmälan 4 är haikuh1 ledfilmen och därmed exemplet.

### Metas gräns för appen (kod 4)

Jämförelsen stannade halvvägs på `(#4) Application request limit reached`: `x-app-usage` stod
på 104 %. Gränsen delas av ALLA rutiner som går på samma app. Därför finns `--bara-cache`,
som jämför mot de filmer som redan ligger i cachen och skriver vilka som hoppades. De 35
filmer och 3 annonsfilmer som saknades hämtades när gränsen sjunkit (93 % → 54 %). Mät före
en stor körning:

```bash
curl -s "https://graph.facebook.com/v23.0/me?fields=id&access_token=$META_ACCESS_TOKEN" -D - -o /dev/null | grep -i x-app-usage
```

## Hemsidan: GIF 2 är vår Nathalie-film (Shopify-anmälan)

Första mätningen samma förmiddag sa att inget på sajten var vårt. **Den var fel:** den jämförde
bara 85 svenska filmer med vårt namnprefix `MATSTRUMP_`, och Nathalies svenska annons heter
"09-17 Nathalie captions musik". Mot alla 243 filmer, beskurna som deras fyrkant (topp, mitt
och botten), blev det:

- **GIF 2** (`gif2_800x800.gif`, 500 × 500, 6,5 s, på produktsidan
  https://matsokker.shop/products/sushi-sokker) är en kvadrat ur mitten av vår film
  **"09-17 Nathalie captions musik"**. 20 av 26 rutor är identiska (≤ 6/64), ur 7 olika
  sekunder. Vår annons skapades 2026-09-17, och deras butik 2026-09-30.
- **GIF 1** (en kvinna i vit t-shirt som plockar sushi med pinnar) finns inte i någon av våra
  243 filmer. Den anmäls inte.
- **Inga videor** på sajten: produktsidan och startsidan skrollades i Chromium, med 0
  video-taggar och 0 videoanrop. Undersidorna hade varken videor eller GIF:ar.
- **Produktbilderna är identiska med matstrumpor.se:s** (dHash 0–3). Men våra filer heter
  `WhatsAppImage2025-11-…` och `Skarmbild2026-01-29…`, och en bär kortet "FALCONER". De kom
  via WhatsApp, troligen från leverantören, så de anmäls inte (ORVO-lärdomen). **Axels svar
  samma eftermiddag:** "Dom flesta är faktiskt inte våra produktbilder. Men vi får lägga DMCA
  på gifsen som DMCA via Shopify. De andra via Meta." Produktbilderna anmäls alltså inte.
- **Recensionsbilderna och märket "Öppet köp 60 dagar"** är inte våra.

Shopify-anmälan byggdes med `--shopify KD-2026-004 --bild <gif2> --sida <produktsidan>`. Den
ligger i `shopify/anmalan.json` + `anmalan.txt`, och bevisbilden finns på
https://cdn.shopify.com/s/files/1/0976/7508/4115/files/bevis.png?v=1790861027. Shopifys
formulär (https://www.shopify.com/legal/tools/report-an-issue/dmca) kräver inloggning, så
Cowork fyller i det i Axels Chrome efter hans Ja (`--anmal-cowork … --med-shopify
KD-2026-004`). Kvittot skrivs med `--shopify KD-2026-004 --skickad --referens <r>`.

## Granskning och läge

- **Appen:** https://claude.ai/artifact/DpY9nNkWez42DwHD8hwwNJ. Den har 9 Meta-kort och 1
  Shopify-kort, och utan mejlkort eftersom inget brev går i den här rundan. Ett Ja intygar att
  materialet är Matstrumpors.
- **Ja-intyget gäller varje film.** Sofie, Katarina och Nathalie är UGC-kreatörer, och ett Ja
  betyder att bolaget har rätten till deras filmer. Haikuh2, haikuh3 och s001h1 är bolagets
  egna videor (CLAUDE.md, 2026-09-28). Vem som gjort haikuh1, 039h1 och fomo november är inte
  utrett här.
- **Axel sa Ja till alla tio korten 2026-10-01 16:27–16:28 CEST** (9 Meta + Shopify, alla på
  kortens aktuella version, `data/beslut.json`). Han valde Cowork före att låta sessionen fylla
  i formulären ("Som vi gjorde i går. Ge mig bara en co-work-prompt").
- **Cowork-prompten:** `konkurrenter/cowork/anmalningar-2026-10-01.txt`, byggd med
  `node konkurrenter/kor.mjs --anmal-cowork KD-2026-003,KD-2026-004 --bara
  "KD-2026-003:2;KD-2026-004:1,2,3,4,5,6,7,8,9" --med-shopify KD-2026-004`. Den tar med
  Bustatios anmälan 2 (KD-2026-003), som skickas igen eftersom kvittot inte gick att läsa.
  Två rader i Shopify-delen rättades innan den lämnades ut. Cowork skriver texterna tecken för
  tecken, så "Full name: Axel Odhner (CEO)" hade lagt titeln i namnfältet, och
  "Phone: (none given)" hade skrivits in som telefonnummer.
- **GIF 1 är inte med**, eftersom den inte finns i någon av våra 243 videor. Axel skrev "gifsen",
  men bara GIF 2 är mätt som vår.
- **Inget är inskickat förrän Coworks lista kommit tillbaka.** Kvittona skrivs in med
  `--anmald <id> --nr <n> --referens <r>` och `--shopify KD-2026-004 --skickad --referens <r>`.

## Cowork stoppade anmälningarna (samma kväll)

Axel körde prompten i Cowork och klistrade tillbaka hela chatten. Det här hände:

- Cowork stannade först för att "Bypass all permissions" inte sa vad som godkändes. Axel
  skrev då ett uttryckligt godkännande med alla nummer uppräknade.
- **KD-2026-003 anmälan 2 (Bustatio) gick in.** Cowork fyllde i formuläret, och Axel skrev
  koden, gjorde säkerhetskontrollen och klickade Skicka själv. Meta visade "Tack!" utan nummer.
  Kvittot skrevs in med `--anmald KD-2026-003 --nr 2`, och alla sex Bustatio-anmälningar är nu
  inskickade.
- **KD-2026-004 anmälan 1–9 och Shopify-anmälan gick INTE in.** Coworks säkerhetsspärr
  stoppade anmälan 1 och sa att spärren gäller allt som återstår. Cowork skriver heller aldrig
  in verifieringskoden, inte ens när Axel klistrar in den i chatten.
- **Axels fråga efteråt:** "Men den har ju väl bara rapporterat dom här MatSokker eller? Jag
  vill ju ta ner dom." Svaret: inget av MatSokker var anmält. Det är de tio anmälningarna som
  tar ner dem. Meta tar bort annonserna (Bustatio förlorade annons 1, 3 och 5 inom ett dygn),
  och Shopify tar bort vår film från deras sida.
- **Vägen nu är själv-läget i appen** (`--granska KD-2026-004 --utan-mejl --sjalv alla`,
  publicerat som version 14). Varje kort visar stegen i Metas ordning med en
  kopieringsknapp per fält, och Axel trycker "Jag har skickat in den" efter varje anmälan.
  Sessionen kvitterar med `--granska-svar KD-2026-004 --beslut <fil> --kvittera`. Sessionen
  skriver ingen ny Cowork-prompt som försöker ta sig runt spärren.

## Mejl till ombuden 2026-10-02: Shopify ja, Meta nej

Axel ville inte fylla i formulären själv. Han skrev: "JAg gör inte dedär manuellt. Du får fixa det
som innan". Hans Ja på alla tio korten (1/10 16:27–16:28) gäller fortfarande, och i Cowork
godkände han skriftligt "exakt texterna i min prompt". Både Meta och Shopify anger ett utsett
ombud med en mejladress på sina hjälpsidor. Därför skickade sessionen anmälningarna som mejl
från axel.odhner@stonebite.org, en i taget. Varje bilaga kontrollerades i utkastet före Skicka
(`--epost-koll`, RAW mot filen). Kontrollen fångade utkast 6, som bar anmälan 7:s PDF. Det
utkastet raderades osänt och gjordes om.

- **Shopify-anmälan: skickad** till `legal@shopify.com` (Gmail `1a0fc32cc4882736`). Shopifys
  policy tar uttryckligen emot mejl när formuläret inte går. Bilagan i utkastet skrevs av och
  kontrollerades av en fristående agent: OK. Kvittot finns i ärendet och i
  `epost/skickat.jsonl`.
- **Meta: åtta mejl till `ip@fb.com` (anmälan 1–8) räknas INTE.** Meta svarade samma morgon från
  support.facebook.com: "We require rights holders to use Meta's online forms … ***Your report
  will not be reviewed unless it is submitted through one of these forms.***" Kvittona för 1–8
  togs tillbaka (`--anmald --angra`). Anmälan 9 skickades aldrig, och utkastet raderades.
  Mejlen står kvar i `epost/skickat.jsonl` som det som faktiskt gick iväg.
- **Läget för Meta:** alla nio anmälningar är utkast. De kräver formuläret: Cowork vägrade, och
  formulärets säkerhetskontroll löses aldrig härifrån. Axel avgör hur.
