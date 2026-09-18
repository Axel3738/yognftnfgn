# Taköverdraget — finska kampanjen (MagiBorsten FI)

**Uppdrag (Axel 2026-09-18):** hela svenska Meta-kampanjen för taköverdraget (34 annonser i
10 adsets) översätts och lokaliseras till finska och läggs upp i ad-kontot **MagiBorsten FI**.
Kampanj, adsets och annonser skapas **PAUSED — ingenting aktiveras.** Voiceovers görs med
**ElevenLabs API, alltid modellen `eleven_v3`** (inte HeyGen — "rösterna blir hundra gånger
bättre"). Priserna är de nya finska.

Den här filen är hela specen. Bilagan längst ner är exporten av SE-kampanjen (alla 34
annonser med copy, video-ID:n och bild-hash), så uppdraget går att köra utan xlsx-filen.

---

## Fakta att utgå från

| | |
|---|---|
| Källkampanj (läs, rör aldrig) | `120250147343350291` i MagiBorsten SE `act_1867947880635861` |
| Landningssida FI | https://majavakauppa.fi/products/asuntovaunun-kattopeite-9-pituutta-3-m-levea-suojaa-kalleimman-pinnan |
| FI-produktens copy (ordval, termer) | `temu/takoverdrag/copy-fi.json` — *kattopeite, hopeapinnoitettu 210D-oxfordkangas, hihnat, koukku, säilytyspussi, asuntovaunu/matkailuauto* |
| Belagda produktfakta | `temu/takoverdrag/fakta.mjs` — inget annat får påstås |
| Prisstegen FI | `node temu/takoverdrag/fi-priser.mjs` |
| Copy-reglerna | `docs/copy-regler.md` + CLAUDE.md ("Produktcopy på Bäverbutiken") |
| Lokaliseringschecklistan | `docs/video-localization.md`, "Steg 3" — gå igenom **varje mening** |
| Meta-klienten som sätter PAUSED | `pipeline/meta.mjs` (och `pipeline/ads.mjs`). **Aldrig** `batch.mjs`, `multi-batch.mjs`, `uk-wave.mjs`, `mastern-batch.mjs` — de sätter annonser ACTIVE |
| Voiceover-verktyget | `voiceover/` (`vo.mjs`, `elevenlabs.mjs`, README) — default redan `eleven_v3` |
| Captions lokalt (gratis) | `node pipeline/localize.mjs burn --video=… --srt=…` (ffmpeg) |

### Prisöversättningen (SE-annonserna → FI)

Annonserna nämner 6,5 × 3 m. I FI kostar den storleken **126,90 €**, jämförpris **165,90 €**.

| I SE-copyn | I FI-copyn | Kontroll |
|---|---|---|
| 1 129 kr | 126,90 € | live i butiken 2026-09-18 |
| 1 469 kr | 165,90 € | live |
| spara 340 kr | säästät 39 € | 165,90 − 126,90 = 39,00 |
| 23 % rabatt | 23 % | 39 / 165,90 = 23,5 % — håller |
| "från 1 469 till 1 129 kr" | 165,90 € → 126,90 € | |

Hela stegen (om någon annons ska nämna fler storlekar): 5,5 & 6,5 m 126,90 · 7,5 m 144,90 ·
8,5 m 162,90 · 9,5 m 179,90 · 10,5 m 197,90 · 11,5 m 215,90 · 12,5 m 233,90 · 13,5 m 251,90 €.
FI-sidan säljer nio längder — "6,5 × 3 m" i annonsen är fortfarande sant, men det går bra
att skriva "alk. 126,90 €" där SE-copyn bara säger priset.

---

## Hårda regler (läs innan något skapas)

1. **Rätt ad-konto, verifierat.** Lista `GET /me/adaccounts?fields=name,account_id,currency`
   och hitta kontot som heter MagiBorsten **FI** (valuta EUR). Skriv ut namn + ID i svaret
   innan något skapas. Lägg in det i `ACCOUNTS` i `pipeline/meta.mjs` (nyckel `magiborstenfi`).
   Fel konto kostar riktiga pengar — SE-kontot `1867947880635861` får bara LÄSAS.
2. **FI-butikens egen page och pixel.** Kopiera aldrig SE:s `678639638662543` /
   `1554276343018184` rakt av. Läs pixeln ur FI-butikens HTML
   (`curl -sL https://majavakauppa.fi | grep -oE "fbq\('init', *'[0-9]+'"`) och matcha mot
   `/act_<fi>/adspixels`. Sidan: `/me/accounts` — den sida FI-butiken/annonskontot är
   kopplat till. Instagram-konto: `/act_<fi>/instagram_accounts`; finns inget, utelämna.
   Hittas ingen egen FI-pixel eller -sida: **fråga Axel med exakt en fråga** som listar det
   du hittade — gissa inte.
3. **Allt PAUSED**: kampanj (`status: 'PAUSED'`), varje adset, varje annons. Kontrollera
   efteråt med en läsning av `effective_status` på alla tre nivåerna och visa det i svaret.
4. **Copy-regler gäller även annonser.** Inga hastighetslöften, inga absoluta utfall
   (SE-copyn har "vattnet står *aldrig* vid takluckorna" — det skrivs om, t.ex.
   *"vesi valuu pois kattoluukkujen ympäriltä"*, aldrig *"ei koskaan"*). Förbjudna ord:
   mullistava, ultimaattinen, pakollinen, välttämätön, taianomainen. "Vattentät"/"vedenpitävä"
   skrivs aldrig.
5. **Social proof som inte finns i FI stryks.** "5,0 av 5 på 10 recensioner på
   baverbutiken.se" är sant i Sverige — majavakauppa.fi har inga recensioner. Påhittade
   omdömen är förbjudna (CLAUDE.md). Ersätt raden med ett belagt utfall ur fakta.mjs
   (t.ex. remmar på fyra sidor, två 10,5 m-hihnaa ingår) och logga bytet per annons.
6. **"Fri frakt" bara om det är sant i Finland.** Läs FI-butikens fraktprofiler
   (`deliveryProfiles` via Shopify-connectorn eller `temu/api.mjs` `Butik('fi')`). Är
   frakten inte gratis till Finland: stryk "fri frakt"-raderna (och "inget läggs på i
   kassan"), skriv om till "30 päivän palautusoikeus" e.d. "Fri frakt inom Sverige" →
   "Ilmainen toimitus Suomeen" *endast* om det stämmer. Klarna: kontrollera att FI-kassan
   har Klarna innan "Klarna" står i copyn.
7. **Modellpolicy:** all finsk annonscopy och alla finska VO-manus skrivs av en subagent
   (`Agent`, `model: "sonnet"`) som får bilagan nedan + `copy-fi.json` + `docs/copy-regler.md`
   + checklistan i `docs/video-localization.md`. Huvudsessionen granskar: priser, räkneord,
   förbjudna ord, "ei koskaan", recensionsrader, fraktlöften — med ett skript, inte på känn.
   Tre-frågorstestet redovisas per rubrik.
8. **Namn:** varje objekt får SE-namnet med prefixet `FI_` (`FI_Takoverdrag_CO_1_H1`,
   adset `FI | CO | Notionrunda 2026-09-15`). Kampanj:
   `Kattopeite Asuntovaunu | FI | Launch <datum>` — BE ROAS-talet i SE-namnet (1.63)
   utelämnas: metoden bakom det står inte i repot och får inte gissas.
9. **Dagsbudget:** Axel har inte sagt något. Skapa kampanjen som CBO med **100 €/dag som
   platshållare** (den spenderar inget PAUSED) och skriv tydligt i leveransen att budgeten
   ska sättas innan aktivering.
10. **Repot är publikt.** Inga tokens, nycklar eller kund-/persondata i filer eller
    commit-meddelanden. Nycklar bor i miljön (`META_ACCESS_TOKEN`, `ELEVENLABS_API_KEY`,
    Shopify FI). Behöver Axel lägga in något i `.env`: säg vilken nyckel som saknas och
    avsluta med raden **"Skicka inte innehållet till mig."**

---

## Arbetsgången

### 1. Inventera
- Verifiera FI-kontot, pixel, sida (regel 1–2). Kontrollera att ingen FI-kampanj för
  taköverdraget redan finns (`/act_<fi>/campaigns?fields=name,status`).
- Läs SE-kampanjen live (`/120250147343350291/ads?fields=name,adset{name},creative{…}`)
  och stäm av mot bilagan — bilagan är exporten 2026-09-18 08:56, kontot kan ha ändrats.
- Kontrollera frakt och Klarna i FI-butiken (regel 6).

### 2. Copyn (34 annonser)
Subagent skriver finsk rubrik, text och länkbeskrivning per annons enligt regel 4–7.
Samma copy används av flera annonser i SE (t.ex. alla `SP_1/2/3`, alla `GT_1/2/3`,
alla `PD_1/2/3`, alla `CS_1/2/3`) — översätt en gång, återanvänd. Huvudsessionen kör
granskningsskriptet och rättar innan något laddas upp.

### 3. Bildannonserna (15 st, en enda bild)
Alla 15 använder samma bild (hash i bilagan). Hämta den:
`/act_1867947880635861/adimages?hashes=["<hash>"]&fields=url,width,height` → ladda ner →
**titta på den.** Har den svensk text (pris, "fri frakt", rubrik): gör en finsk version
med skarp vektortext via `sharp` (mönster: `temu/batch6/antalsbadge.mjs`), aldrig AI-text.
Har den ingen text: återanvänd som den är. Ladda upp till FI-kontot (`/act_<fi>/adimages`).

### 4. Videoannonserna (19 filer)
Per video, i den här ordningen:
1. **Hämta originalet:** `GET /<video_id>?fields=source,title` med `META_ACCESS_TOKEN`
   (video-ID:n står i bilagan). Nekas `source`: originalen ligger hos redigerarna —
   Notion-hubben (korten för taköverdraget) eller fråga Axel efter Drive-mappen, en gång.
2. **Transkribera svenskan:** ElevenLabs Speech-to-Text (`POST /v1/speech-to-text`,
   `model_id=scribe_v1`, med tidsstämplar) → SRT. Läs den — ElevenLabs stavar egennamn fel.
3. **Lokalisera manuset** (subagent, checklistan i `docs/video-localization.md` Steg 3):
   priser, "Sverige", recensioner, frakt — samma regler som copyn. Behåll segmentens
   tidkoder; finskan är ~15 % längre än svenskan, så korta hellre än att tala fortare.
4. **Titta på videon** (plocka 4–6 stillbilder med ffmpeg): har den **inbränd svensk
   text** (captions, pris, rubrik)? Då kan molnet inte lokalisera bilden. Sådana annonser
   levereras som **FI-voiceover (mp3) + finsk SRT** i en Notion-task till redigerarna, och
   annonsen skapas **inte** i FI förrän redigerarens fil finns. Markera dem i leveransen.
5. **Voiceover:** `voiceover/` med `eleven_v3`. Rösten: `npm run voices` — välj en manlig
   finsk röst i samma varma register som "Martin". Finns ingen finsk röst på kontot: hämta
   en ur Voice Library via API (`GET /v1/shared-voices?language=fi`,
   `POST /v1/voices/add/{public_owner_id}/{voice_id}`). **Samma röst i alla 19.**
   Audio-tags (`[tauko]` osv.) får användas. Lyssna på minst tre klipp innan resten körs.
6. **Ljudet:** har originalet bara VO (eller VO + tystnad) → byt ljudspår med ffmpeg.
   Ligger musik under rösten i samma spår kan den inte separeras rent med ffmpeg — prova
   ElevenLabs Audio Isolation / Dubbing-resursens bakgrundsspår; går det inte, leverera
   FI-VO + SRT till redigerarna (punkt 4) i stället för att ladda upp något med svensk röst
   kvar under. **Aldrig svensk röst hörbar i en FI-annons.**
7. **Captions:** finns ingen inbränd text i originalet → bränn in den finska SRT:n med
   `node pipeline/localize.mjs burn` (gratis).
8. Döp filen `FI_<SE-namn>.mp4`, ladda upp till FI-kontot (`/act_<fi>/advideos`), vänta
   tills `status.video_status == ready`.

### 5. Bygg kampanjen (spegla SE)
- 1 kampanj OUTCOME_SALES, CBO 100 €/dag (platshållare), PAUSED.
- 10 adsets med SE:s namn (prefix `FI |`), länder `FI`, ålder 18–65, Advantage+-målgrupp,
  optimering OFFSITE_CONVERSIONS / PURCHASE, FI-pixeln, attribution 7d klick, PAUSED.
- 34 annonser: samma adset-tillhörighet som SE, finsk copy, FI-creative, länk = FI-
  landningssidan, CTA SHOP_NOW, FI-sidan (+ IG om det finns), PAUSED.
- Annonser som väntar på redigerare (steg 4.4/4.6) skapas inte — de listas i leveransen.

### 6. Logg och leverans
- `temu/takoverdrag/FI-KAMPANJ-LOGG.md`: tabell SE-namn → FI-namn → FI-ad-ID → status
  (uppladdad PAUSED / väntar redigerare + orsak), plus lokaliseringsloggen per annons
  (varje rad som ändrats utöver ren översättning och varför: pris, recension, frakt, "aldrig").
- Lägg raden i tabellen i `docs/video-localization.md` (marknad FI).
- Kvoten (`pipeline/quota.mjs`) gäller inte — taköverdraget finns inte i `products.json`.
  Säg det i leveransen i stället för att hoppa över punkten tyst.
- Committa och pusha till branchen. Inga videofiler i repot (publikt + stort) — de
  ligger i Meta-kontot; mp3/SRT till redigerarna går via Notion.

## Definition of done
- [ ] FI-kontot verifierat med namn + ID + valuta EUR, utskrivet i svaret
- [ ] Pixel och sida är FI-butikens egna (eller Axel har svarat på exakt en fråga)
- [ ] Frakt- och Klarna-påståenden kontrollerade mot FI-butiken; "fri frakt" bara om sant
- [ ] 34 finska copyversioner skrivna av sonnet-subagent, granskade med skript: rätt priser
      (126,90 / 165,90 / 39 €), inga förbjudna ord, inget "ei koskaan", inga recensionsrader,
      inga hastighetslöften — tre-frågorstestet redovisat
- [ ] Bilden granskad visuellt; finsk version om den hade svensk text
- [ ] 19 videor: transkriberade, lokaliserade, `eleven_v3`-VO med samma finska röst,
      ljud bytt, captions inbrända där det gick — de som kräver redigerare listade med orsak
- [ ] Kampanj + 10 adsets + annonser skapade i MagiBorsten FI, ALLA `PAUSED`
      (verifierat via `effective_status`), budget 100 €/dag markerad som platshållare
- [ ] `FI-KAMPANJ-LOGG.md` skriven, `docs/video-localization.md` uppdaterad, kvotläget
      kommenterat, allt committat och pushat
- [ ] Svaret till Axel: kort, på svenska, hans egna punkter numrerade sist (budget,
      ev. page/pixel, ev. redigerarleveranser)

---

## Bilaga — SE-kampanjen (export 2026-09-18 08:56)

Kampanj: `Taköverdraget för Husvagn 6,5 × 3 m | BE ROAS 1.63 | Launch 2026-09-09` — ID `cg:120250147343350291` · Outcome Sales · CBO 8000 kr/dag · länder SE · pixel `tp:1554276343018184` · sida `o:678639638662543` · IG `x:9842061782526648`
Landningssida SE: https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan

10 adsets · 34 annonser (19 video, 15 bild). Alla bildannonser använder samma bild, hash `1867947880635861:12df9f4f602ec775a58448209fdeec1c`.

### Adset `CO | Notionrunda 2026-09-15` (`c:120250230726990291`)
- **Takoverdrag_CO_1_H1** — video, video `v:1077720491316831` (Takoverdrag_CO_1_H1.mp4), CTA SHOP_NOW
  - Rubrik: Rätt yta, inte hela vagnen
  - Text: Ett helöverdrag täcker allt du redan har — det här täcker bara taket. ⏎ Rem och dragsko i kanten håller det på plats, vattnet står aldrig vid takluckorna. ⏎ 1 129 kr mot 1 469 kr, fri frakt och 30 dagars öppet köp.
  - Länkbeskrivning: 1 129 kr, fri frakt
- **Takoverdrag_CO_2_1** — bild, bild-hash `542482f03f3810413083a50bb074fe5d`, CTA SHOP_NOW
  - Rubrik: En person, inget skav mot lacken
  - Text: Ett helvagnskapell är tungt att få på plats själv. ⏎ Det skaver mot lacken hela vintern, ett taköverdrag gör inte det. ⏎ En person klarar monteringen, och det skyddar den dyraste ytan: taket.
  - Länkbeskrivning: Skyddar taket, inte lacken

### Adset `RI | Notionrunda 2026-09-16` (`c:120250242491210291`)
- **Takoverdrag_RI_1_H1** — video, video `v:1393647809607009` (Takoverdrag_RI_1_H1.mp4), CTA SHOP_NOW
  - Rubrik: Ingen tvätt hjälper då
  - Text: Vid takluckan möter tätmassan fukt dag efter dag. ⏎ Till slut mjuknar den, och vatten går rakt in genom taket. ⏎ Då räcker ingen tvätt — bara ett taköverdrag för 1 129 kr.
  - Länkbeskrivning: 30 dagars öppet köp

### Adset `Taköverdrag Husvagn 6,5 × 3 m | SP | 2026-09-09` (`c:120250147382130291`)
- **Takoverdrag_SP_4_H1** — video, video `v:1596124075334669` (Takoverdrag_SP_4_H1.mp4), CTA SHOP_NOW
  - Rubrik: En person räcker. 210D-väv.
  - Text: Ett helöverdrag är tungt att få på plats ensam — det här klarar en person. ⏎ 210D-väv håller hela vintersäsongen ute, och vattnet står aldrig vid takluckorna. ⏎ 5,0 av 5 på 10 recensioner. 1 129 kr i stället för 1 469 kr.
  - Länkbeskrivning: 1 129 kr mot 1 469 kr
- **Takoverdrag_SP_5_1** — bild, bild-hash `c02cb4e87902eda437773f61443cad68`, CTA SHOP_NOW
  - Rubrik: 5,0 av 5 på 10 recensioner
  - Text: 5,0 av 5 på 10 recensioner på baverbutiken.se. ⏎ Vattnet blir aldrig stående kring takluckorna. ⏎ Sitter kvar när det blåser och tål en hel vintersäsong ute.
  - Länkbeskrivning: Betyget säger det mesta
- **Takoverdrag_SP_2_1** — bild, bild-hash `4023053664c33ab3f4f79f7d3c73b300`, CTA SHOP_NOW
  - Rubrik: Husvagnsägare älskar det här skyddet
  - Text: "Ångrar att jag inte köpte det här förra vintern." 🙌 ⏎ Så säger fler och fler husvagnsägare om vårt taköverdrag. ⏎ ✅ Skyddar taket mot regn, snö och smuts ⏎ ✅ En person sätter på det själv – ingen hjälp behövs ⏎ ✅ 30 dagars öppet köp om du inte är nöjd ⏎ Läs varför husvagnsägare väljer det här inför varje vinter. 👇
  - Länkbeskrivning: Betygsatt av riktiga kunder. Fri frakt.
- **Takoverdrag_SP_3_H1** — video, video `v:2239839696801908` (SP_3.mp4), CTA SHOP_NOW
  - Rubrik: Husvagnsägare älskar det här skyddet
  - Text: "Ångrar att jag inte köpte det här förra vintern." 🙌 ⏎ Så säger fler och fler husvagnsägare om vårt taköverdrag. ⏎ ✅ Skyddar taket mot regn, snö och smuts ⏎ ✅ En person sätter på det själv – ingen hjälp behövs ⏎ ✅ 30 dagars öppet köp om du inte är nöjd ⏎ Läs varför husvagnsägare väljer det här inför varje vinter. 👇
  - Länkbeskrivning: Betygsatt av riktiga kunder. Fri frakt.
- **Takoverdrag_SP_2_H1** — video, video `v:1402932001225062` (SP_2.mp4), CTA SHOP_NOW
  - Rubrik: Husvagnsägare älskar det här skyddet
  - Text: "Ångrar att jag inte köpte det här förra vintern." 🙌 ⏎ Så säger fler och fler husvagnsägare om vårt taköverdrag. ⏎ ✅ Skyddar taket mot regn, snö och smuts ⏎ ✅ En person sätter på det själv – ingen hjälp behövs ⏎ ✅ 30 dagars öppet köp om du inte är nöjd ⏎ Läs varför husvagnsägare väljer det här inför varje vinter. 👇
  - Länkbeskrivning: Betygsatt av riktiga kunder. Fri frakt.
- **Takoverdrag_SP_1_H1** — video, video `v:28026609890344616` (SP_1.mp4), CTA SHOP_NOW
  - Rubrik: Husvagnsägare älskar det här skyddet
  - Text: "Ångrar att jag inte köpte det här förra vintern." 🙌 ⏎ Så säger fler och fler husvagnsägare om vårt taköverdrag. ⏎ ✅ Skyddar taket mot regn, snö och smuts ⏎ ✅ En person sätter på det själv – ingen hjälp behövs ⏎ ✅ 30 dagars öppet köp om du inte är nöjd ⏎ Läs varför husvagnsägare väljer det här inför varje vinter. 👇
  - Länkbeskrivning: Betygsatt av riktiga kunder. Fri frakt.

### Adset `UG | Notionrunda 2026-09-16` (`c:120250242462160291`)
- **Takoverdrag_UG_1_H1** — video, video `v:1629374438803173` (Takoverdrag_UG_1_H1.mp4), CTA SHOP_NOW
  - Rubrik: Bara taket. En person klarar det.
  - Text: Tror du att du måste täcka hela husvagnstaket? ⏎ En person klarar det själv — ett helöverdrag är tungt att få på plats ensam. ⏎ Spänns fast med rem och dragsko i kanten. 1 129 kr, fri frakt.
  - Länkbeskrivning: 1 129 kr, fri frakt

### Adset `Taköverdrag Husvagn 6,5 × 3 m | GT | 2026-09-09` (`c:120250147357110291`)
- **Takoverdrag_GT_4_H1** — video, video `v:1481340267178614` (Takoverdrag_GT_4_H1.mp4), CTA SHOP_NOW
  - Rubrik: 5,0/5 hos husvagnsägare
  - Text: 5,0 av 5 i betyg på 10 recensioner – riktiga husvagnsägare. ⏎ 6,5 × 3 meter, en person klarar det själv. ⏎ Vattnet blir aldrig stående vid takluckorna.
  - Länkbeskrivning: 5,0/5 på 10 recensioner
- **Takoverdrag_GT_5_H1** — video, video `v:1615028910329688` (Takoverdrag_GT_5_H1.mp4), CTA SHOP_NOW
  - Rubrik: 210D-väv – tål vintern ute
  - Text: 210D-väv tål en hel vintersäsong utomhus. ⏎ Rem och dragsko i kanten – sitter kvar när det blåser. ⏎ 6,5 × 3 meter, ryms i medföljande påse.
  - Länkbeskrivning: 210D-väv, rem och dragsko
- **Takoverdrag_GT_6_1** — bild, bild-hash `52764c6f6047f148b4d7176380f5ccb9`, CTA SHOP_NOW
  - Rubrik: Skydda taket i jul – 1 129 kr
  - Text: Skydda taket i jul för 1 129 kr. ⏎ 210D-väv tål vintern ute, till skillnad från tunn presenning som spricker i frost. ⏎ Vikt och klart i medföljande påse.
  - Länkbeskrivning: Väv som tål vintern ute
- **Takoverdrag_GT_2_1** — bild, bild-hash `bd60a5e72ffe04bd2c883d313f2ce419`, CTA SHOP_NOW
  - Rubrik: Presenten han faktiskt blir glad för
  - Text: Han pratar om husvagnen som om den vore ett husdjur. 😅 I år hittade jag äntligen något han faktiskt blir glad för. ⏎ 🎁 Ett taköverdrag som skyddar hans husvagn hela vintern ⏎ 🎁 Något han faktiskt använder – om och om igen ⏎ 🎁 Levereras enkelt hem, klart att slå in ⏎ Ge en present som visar att du fattar vad han bryr sig om. 👇
  - Länkbeskrivning: Perfekt present till husvagnsägaren. Fri frakt.
- **Takoverdrag_GT_3_H1** — video, video `v:1075240581763143` (G_3.mp4), CTA SHOP_NOW
  - Rubrik: Presenten han faktiskt blir glad för
  - Text: Han pratar om husvagnen som om den vore ett husdjur. 😅 I år hittade jag äntligen något han faktiskt blir glad för. ⏎ 🎁 Ett taköverdrag som skyddar hans husvagn hela vintern ⏎ 🎁 Något han faktiskt använder – om och om igen ⏎ 🎁 Levereras enkelt hem, klart att slå in ⏎ Ge en present som visar att du fattar vad han bryr sig om. 👇
  - Länkbeskrivning: Perfekt present till husvagnsägaren. Fri frakt.
- **Takoverdrag_GT_2_H1** — video, video `v:1135726582116215` (G_2.mp4), CTA SHOP_NOW
  - Rubrik: Presenten han faktiskt blir glad för
  - Text: Han pratar om husvagnen som om den vore ett husdjur. 😅 I år hittade jag äntligen något han faktiskt blir glad för. ⏎ 🎁 Ett taköverdrag som skyddar hans husvagn hela vintern ⏎ 🎁 Något han faktiskt använder – om och om igen ⏎ 🎁 Levereras enkelt hem, klart att slå in ⏎ Ge en present som visar att du fattar vad han bryr sig om. 👇
  - Länkbeskrivning: Perfekt present till husvagnsägaren. Fri frakt.
- **Takoverdrag_GT_1_H1** — video, video `v:1658293378988495` (G_1.mp4), CTA SHOP_NOW
  - Rubrik: Presenten han faktiskt blir glad för
  - Text: Han pratar om husvagnen som om den vore ett husdjur. 😅 I år hittade jag äntligen något han faktiskt blir glad för. ⏎ 🎁 Ett taköverdrag som skyddar hans husvagn hela vintern ⏎ 🎁 Något han faktiskt använder – om och om igen ⏎ 🎁 Levereras enkelt hem, klart att slå in ⏎ Ge en present som visar att du fattar vad han bryr sig om. 👇
  - Länkbeskrivning: Perfekt present till husvagnsägaren. Fri frakt.

### Adset `Taköverdrag Husvagn 6,5 × 3 m | PD | 2026-09-09` (`c:120250147368540291`)
- **Takoverdrag_PD_4_H1** — video, video `v:4425339637679185` (Takoverdrag_PD_4_H1.mp4), CTA SHOP_NOW
  - Rubrik: Spara 340 kr på taköverdraget
  - Text: 1 129 kr i stället för 1 469 kr – spara 340 kr. ⏎ Rem och dragsko i kanten håller kvar i blåst. ⏎ Fri frakt och 30 dagars öppet köp.
  - Länkbeskrivning: Spara 340 kr
- **Takoverdrag_PD_5_1** — bild, bild-hash `80087b3b290beecf168756f56de98e41`, CTA SHOP_NOW
  - Rubrik: Rem och dragsko håller det på plats
  - Text: Täck bara taket, inte hela vagnen. ⏎ Spänns fast med rem och dragsko i kanten. ⏎ Takluckan hålls torr, vattnet blir aldrig stående där.
  - Länkbeskrivning: Takluckan hålls torr
- **Takoverdrag_PD_2_1** — bild, bild-hash `4ac20e92ce83702a12d939b7bc5c9286`, CTA SHOP_NOW
  - Rubrik: Husvagnstaket – helt skyddat i vinter
  - Text: Taket på husvagnen är den ytan du aldrig kollar – och den som kostar mest att laga. 🏕️ ⏎ ✅ Skyddar mot regn, snö och UV hela vintern ⏎ ✅ Spänns fast med rem och dragsko – klart på minuter ⏎ ✅ En person klarar det helt själv ⏎ ✅ Ryms i egen förvaringspåse när den inte används ⏎ Skydda husvagnens tak innan vintern gör det dyrt. 👇
  - Länkbeskrivning: Enkelt taköverdrag, 6,5 × 3 m. Fri frakt.
- **Takoverdrag_PD_3_H1** — video, video `v:1067361515911303` (PD_3.mp4), CTA SHOP_NOW
  - Rubrik: Husvagnstaket – helt skyddat i vinter
  - Text: Taket på husvagnen är den ytan du aldrig kollar – och den som kostar mest att laga. 🏕️ ⏎ ✅ Skyddar mot regn, snö och UV hela vintern ⏎ ✅ Spänns fast med rem och dragsko – klart på minuter ⏎ ✅ En person klarar det helt själv ⏎ ✅ Ryms i egen förvaringspåse när den inte används ⏎ Skydda husvagnens tak innan vintern gör det dyrt. 👇
  - Länkbeskrivning: Enkelt taköverdrag, 6,5 × 3 m. Fri frakt.
- **Takoverdrag_PD_2_H1** — video, video `v:2388339611978148` (PD_2.mp4), CTA SHOP_NOW
  - Rubrik: Husvagnstaket – helt skyddat i vinter
  - Text: Taket på husvagnen är den ytan du aldrig kollar – och den som kostar mest att laga. 🏕️ ⏎ ✅ Skyddar mot regn, snö och UV hela vintern ⏎ ✅ Spänns fast med rem och dragsko – klart på minuter ⏎ ✅ En person klarar det helt själv ⏎ ✅ Ryms i egen förvaringspåse när den inte används ⏎ Skydda husvagnens tak innan vintern gör det dyrt. 👇
  - Länkbeskrivning: Enkelt taköverdrag, 6,5 × 3 m. Fri frakt.
- **Takoverdrag_PD_1_H1** — video, video `v:29253924880875293` (PD_1.mp4), CTA SHOP_NOW
  - Rubrik: Husvagnstaket – helt skyddat i vinter
  - Text: Taket på husvagnen är den ytan du aldrig kollar – och den som kostar mest att laga. 🏕️ ⏎ ✅ Skyddar mot regn, snö och UV hela vintern ⏎ ✅ Spänns fast med rem och dragsko – klart på minuter ⏎ ✅ En person klarar det helt själv ⏎ ✅ Ryms i egen förvaringspåse när den inte används ⏎ Skydda husvagnens tak innan vintern gör det dyrt. 👇
  - Länkbeskrivning: Enkelt taköverdrag, 6,5 × 3 m. Fri frakt.

### Adset `BOF | Notionrunda 2026-09-15` (`c:120250230574560291`)
- **Takoverdrag_BOF_2_1** — bild, bild-hash `67d852d7529356950404662ced8ea3c5`, CTA SHOP_NOW
  - Rubrik: 1 129 kr – fri frakt och öppet köp
  - Text: 1 129 kr i stället för 1 469 kr, du sparar 340 kr. ⏎ Fri frakt, 30 dagars öppet köp och Klarna. ⏎ Inga tillägg, inga överraskningar i kassan.
  - Länkbeskrivning: Priset du ser är priset
- **Takoverdrag_BOF_1_1** — bild, bild-hash `7512f523b45a98cd119603b9e47249b0`, CTA SHOP_NOW
  - Rubrik: Taköverdrag – bara taket, hela vintern
  - Text: 1 129 kr istället för 1 469 kr, du sparar 340 kr. ⏎ Täcker hela taket, 6,5 × 3 meter, inte hela vagnen. ⏎ 210D-väv håller hela vintersäsongen ute.
  - Länkbeskrivning: Från 1 469 till 1 129 kr
- **Takoverdrag_BOF_3_1** — bild, bild-hash `e439cfa9ab08cf10836df48be1e29606`, CTA SHOP_NOW
  - Rubrik: 210D-väv, inte tunn presenning
  - Text: En vanlig presenning spricker i frost efter en säsong. ⏎ Det här är 210D-väv, byggd för att stå ute hela vintern. ⏎ 1 129 kr, sitter fast med rem och dragsko i kanten.
  - Länkbeskrivning: Klarar frost hela vintern

### Adset `Taköverdrag Husvagn 6,5 × 3 m | CS | 2026-09-09` (`c:120250147343780291`)
- **Takoverdrag_CS_4_1** — bild, bild-hash `dc181b446fdca662b2b04c5a5801aa0b`, CTA SHOP_NOW
  - Rubrik: 1 129 kr – frakten ingår
  - Text: 1 469 kr blir 1 129 kr, du sparar 340 kr. ⏎ Skyddar taket, 6,5 × 3 meter, inte hela husvagnen. ⏎ Frakten ingår, inget läggs på i kassan.
  - Länkbeskrivning: Inget tillägg i kassan
- **Takoverdrag_CS_6_1** — bild, bild-hash `66ee5f76560cc52400a36691532f770f`, CTA SHOP_NOW
  - Rubrik: Fri frakt – 1 129 kr (ord. 1 469 kr)
  - Text: Fri frakt på taköverdrag för husvagn, 6,5 × 3 meter. ⏎ 1 129 kr i stället för 1 469 kr, du sparar 340 kr. ⏎ 30 dagars öppet köp om det inte passar.
  - Länkbeskrivning: 30 dagars öppet köp
- **Takoverdrag_CS_2_1** — bild, bild-hash `c0b54a47d17bef27aebeeb2127893f98`, CTA SHOP_NOW
  - Rubrik: Husvagnstaket – helt skyddat i vinter
  - Text: 🔥 23% RABATT PÅ HUSVAGNENS TAKÖVERDRAG – IDAG 🔥 ⏎ 1469 kr → 1129 kr ⏎ Lagret är begränsat och priset gäller bara ett tag till. ⏎ Vintern kommer oavsett – se till att taket är skyddat innan det är för sent. ⏎ Säkra ditt innan det är slut i lager. 👇
  - Länkbeskrivning: 23% rabatt just nu. Fri frakt inom Sverige.
- **Takoverdrag_CS_3_H1** — video, video `v:28131074066587234` (CS_3.mp4), CTA SHOP_NOW
  - Rubrik: Husvagnstaket – helt skyddat i vinter
  - Text: 🔥 23% RABATT PÅ HUSVAGNENS TAKÖVERDRAG – IDAG 🔥 ⏎ 1469 kr → 1129 kr ⏎ Lagret är begränsat och priset gäller bara ett tag till. ⏎ Vintern kommer oavsett – se till att taket är skyddat innan det är för sent. ⏎ Säkra ditt innan det är slut i lager. 👇
  - Länkbeskrivning: 23% rabatt just nu. Fri frakt inom Sverige.
- **Takoverdrag_CS_2_H1** — video, video `v:1627891502009585` (CS_2.mp4), CTA SHOP_NOW
  - Rubrik: Husvagnstaket – helt skyddat i vinter
  - Text: 🔥 23% RABATT PÅ HUSVAGNENS TAKÖVERDRAG – IDAG 🔥 ⏎ 1469 kr → 1129 kr ⏎ Lagret är begränsat och priset gäller bara ett tag till. ⏎ Vintern kommer oavsett – se till att taket är skyddat innan det är för sent. ⏎ Säkra ditt innan det är slut i lager. 👇
  - Länkbeskrivning: 23% rabatt just nu. Fri frakt inom Sverige.
- **Takoverdrag_CS_1_H1** — video, video `v:1538677984965189` (CS_1.mp4), CTA SHOP_NOW
  - Rubrik: Husvagnstaket – helt skyddat i vinter
  - Text: 🔥 23% RABATT PÅ HUSVAGNENS TAKÖVERDRAG – IDAG 🔥 ⏎ 1469 kr → 1129 kr ⏎ Lagret är begränsat och priset gäller bara ett tag till. ⏎ Vintern kommer oavsett – se till att taket är skyddat innan det är för sent. ⏎ Säkra ditt innan det är slut i lager. 👇
  - Länkbeskrivning: 23% rabatt just nu. Fri frakt inom Sverige.

### Adset `LI | Notionrunda 2026-09-15` (`c:120250231139560291`)
- **Takoverdrag_LI_1_1** — bild, bild-hash `8b17c62a0395de280858b9d800cc24b8`, CTA SHOP_NOW
  - Rubrik: Vattnet står aldrig vid takluckan
  - Text: Täcker hela taket, 6,5 × 3 meter. ⏎ Vattnet blir aldrig stående vid takluckorna. ⏎ Spänns fast med rem och dragsko, sitter kvar när det blåser.
  - Länkbeskrivning: 6,5 × 3 m, sitter kvar i blåst

### Adset `TR | Notionrunda 2026-09-15` (`c:120250231265470291`)
- **Takoverdrag_TR_1_1** — bild, bild-hash `90b50f8ca7a07b5f69457dccf7ed2590`, CTA SHOP_NOW
  - Rubrik: 5,0 av 5 – och 340 kr billigare
  - Text: 5,0 av 5 på 10 recensioner på baverbutiken.se. ⏎ Täck bara taket, inte hela vagnen. ⏎ 1 129 kr i stället för 1 469 kr, du sparar 340 kr.
  - Länkbeskrivning: Bara taket, till rätt pris

