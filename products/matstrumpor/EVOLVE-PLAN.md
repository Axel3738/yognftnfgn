# Matstrumpor: Evolve-planen (checklistan)

Axel 2026-10-01: "jag kör så många tasks så det är viktigt att du är strukturerad, annars glömmer
jag allt". Det här är EN lista. Den uppdateras av sessionen som gör något på den, aldrig av minnet.
Bakgrunden står i `docs/os/evolve/EVOLVE-GAP-ANALYS.md`.

Senast uppdaterad: 2026-10-02 kväll (Axels tre beslut: C, produktsidan, A; Bygge 1 = 3:2:2 byggt).

---

## ✅ Klart (2026-10-01)

| # | Vad | Var |
|---|---|---|
| 1 | **Hook rate och hold rate räknas rätt.** Förut fel mått (hook ~0,93 på allt). Nu Evolves: Nathalie hook 0,47, hold 0,15. | `matstrumpor/meta.mjs` |
| 2 | **Utlandets 14 kampanjer läses och får etiketter.** Startdagen räknas från kampanjens första krona, så de 112 annonserna får inte "ingen leverans" 8/10. | `meta.mjs`, `kor.mjs --hamta` |
| 3 | **Arkivet.** Allt vi testat, med typ, förälder, varianter, hit rate och vinst per kreatör, vinkel och format. Byggs av koden varje rond. | `products/matstrumpor/arkiv.md` |
| 4 | **Etiketterna som Evolve.** Breakthrough kräver att kampanjens spend växte 10 %, och etiketten kan bli bättre vecka 2–3. Budgethöjningar för hand flaggas. | `matstrumpor/etikett.mjs` |
| 5 | **Namnen bär kedjan.** `_i10pnat` = iteration 10 på Nathalie, `_h2` = hook 2, `_im` = imitation. | `matstrumpor/namn.mjs`, `--namn … --iter nat` |
| 6 | **Playbooken i kungen.** Felkatalogen och iterationerna per utfall, och taket räknas på försök med utfall. | `.claude/commands/matstrumporkungen.md` |
| 7 | **UGC-beställningen: fyra briefer, tre videor per kreatör.** Kopian, problemet först, mannen som ger bort, fikaskämtet. Ingen filmar det hon redan filmat. 9 kreatörer + 4 reserver med färdiga meddelanden, från Axel själv, utan pris. ✅ **Öppningarna i brief 2–4 bytta 2026-10-02 mot mekanismerna** (M1 blicken genom locket, M2 lådan ställs fram utan ett ord, en gåta per brief; tysta tagningar med bildtext, kropparna orörda, inga hoppregler kvar) efter Axels fråga om researchen var inlagd. Kreatörssidan version 5: https://claude.ai/artifact/NrD4m6BmZ8E7kupZXk5CWn | `products/matstrumpor/ugc/2026-10-briefer.md`, `factory/ugc/`, `scratchpad/UGC-OPPNINGAR-M.md` (sessionens underlag) |

Facit för siffrorna: 151 tester gröna, och en läsning mot Meta 2026-10-01 (15 kampanjer, 131 + 112 annonser).

---

## ✅ Axels beslut 2026-10-02 kväll

| # | Beslut | Vad det betyder | Vem gör |
|---|---|---|---|
| 1 | **"merga"** | Grenen ligger på `main` (3d764c01). Rutinen lör 3/10 07:00 kör den nya koden. | klart |
| 2 | **ROUTING = C, 3:2:2** ("Jag gillar chadbots sätt") | ⚠️ Läst i kursen 2026-10-02 (lektionen "How To Set Up a 3:2:2 Campaign" + Media Buying Structure 2026): ordet DCT/dynamic creative finns INTE i kursen. 3:2:2 = **tre vanliga annonser per adset (samma koncept, tre hookar), var och en med 2 rubriker + 2 primärtexter**, i EN CBO med ett Champions-adset och flera testadsets; ett koncept = ett adset; bild och video aldrig i samma adset. Under några hundra dollar/dag **max 5 adsets inkl. champions**, varje adset ska kunna få 3 × CPA per dag (≈ 925 kr), test 7 dagar, stäng på ADSET-nivå, aldrig annons; vinnare = adsetet tar majoriteten av spenden vid KPI eller kampanjens ROAS förbättras; flytt till champions vid 20–30 % budgetandel. Under $1k/dag: fokus på vinnarannonser, ingen ABO-skalning. Så för Matstrumpor (~2 700 kr/dag): champions + högst 2–3 testadsets i taget. | ✅ **Byggt 2026-10-02 kväll** (Bygge 1 nedan): `/matstrumpor` gör ett testadset per koncept via Adsmanager-MCP:n och vägrar det sjätte; `/matstrumporkungen` dömer per adset och föreslår stäng/flytta. Budgeten var 10 000 kr/dag vid bygget (inte 2 700) — den läses live, och taket blev 5 (budgeten bär 10). Champions = `09-17 UGC`. Torrkörd mot kontot: 8 adsets levererar mot taket 5, kungen föreslår att fyra gamla stängs (de som fungerar står kvar — kursen: stäng aldrig det som fungerar). Inget skapat i Meta — första uppladdningen väntar på Axels "kör" |
| 2b | **Growth sheet i Matstrumpors teamspace** (Axels ord: "lägg gärna notiondatabasen i matstrumpors teamspace") | Arkivet (`arkiv.md`) är bara läsbart och skrivs över av koden. Byggs som en Notion-databas "Matstrumpor Growth Guide": rutinen skriver mätkolumnerna (etikett, typ, förälder, hook/hold, spend, köp, ROAS, playbook), människor äger kolumnerna Anteckning/Beslut/Nästa steg som koden aldrig rör. Axel ser den i Notion. | ✅ **Byggd 2026-10-02** under Axels sida (han skapade sidan och bjöd in integrationen samma förmiddag): databasen `3ed270ab-908c-811a-9eff-feddb5f5e2de`, 128 rader, https://www.notion.so/3ed270ab908c811a9efffeddb5f5e2de. `matstrumpor/growthguide.mjs --skarpt` körs i kungens rond efter `--arkiv`; koden skriver bara mätkolumnerna, Anteckning/Beslut/Nästa steg/Ägare är människornas. Id i `matstrumpor/growthguide.json` |
| 3 | **Produktsidans copy ändras så den säger samma sak som Nathalies video** (present, favoriträtt, "sålde slut i november") + NY INFORMATION och MEKANISM ur `ny-information.md`/`mekanismer.md` (Axel 2026-10-02: "detta kommer bli bra eftersom vi nyss fått all denna information"); två versioner, Sonnet 4.6 och Fable 5.1 ultracode, före lansering | Inte en ny sida: den vanliga `matstrumpor.se/products/sushi-strumpor`. Axels fråga står kvar: är kunderna de som har svårt för presenter, eller de som köper tusen julklappar? **Svaret mäts, gissas inte:** enkäten (`enkat/`), Judge.me-recensionerna, annonskommentarerna och ordermönstret (par per order, decemberandel, presentmeddelanden). Sedan skrivs copyn av huvudsessionen (landningssideundantaget, regel 6), visas som före/efter, och går live på Axels ok. ATC-graden efteråt är facit (5,5 % nu). | ✅ **Två versioner levererade 2026-10-02** (workflow `wf_b17ebc96-70c` med ny informationen): jämförelsesidan https://claude.ai/artifact/DN6qLRcQeN1GSPhycSMuSu, texterna + granskningen i `produktsida/2026-10-02-tva-versioner.md`, hela underlaget i `2026-10-02-v2-med-ny-information.json`. Sonnet bar ett faktafel i YouGov-raden. ✅ **Axels val: Fable, LIVE 2026-10-02 08:08 UTC i hans struktur Problem → gif → Lösning → gif/bild → Funktioner → bild → Garanti; ⛔ omskriven 08:21 UTC efter hans dom ("I USA gav 32 procent … enligt Bankrate" = "inte bra copy"): alla statistikmeningar borta, regeln i `docs/copy-regler.md` + spärr i verktyget** (`matstrumpor/produktsida/sushi-strumpor.html`, verktyget `matstrumpor/produktsida.mjs`, säkerhetskopia i `produktsida/backup/`, läst som kund i Chromium). ⏰ Påminnelse 26/10: novemberraderna ses över före 1/11 (Axel: "vi får inte glömma att uppdatera den innan november"). ✅ Tretton språk bär den nya texten sedan samma förmiddag (översättare + granskare per språk, kontroll 13 av 13). v1 utan ny informationen: `2026-10-02-v1-utan-ny-information.json` |
| 4 | **Copyregeln = A** (Evolves: aldrig ett märke som referens) | Inskriven i `docs/copy-regler.md` + `docs/os/BRIEF-REGI.md` med de sex andra prompt-reglerna. Vardagsreferenser (takeaway, julstrumpa) kvar. | klart |

| 5 | **Tre videor per kreatör, paketpris** (Axels val A 2026-10-02: "vi kan lowkey köra 3 videor per kreatör så får vi paketpris") | Varje kreatör filmar brief 1, 2 och 3 eller 4; priset förhandlas som ett paket. Saras svar skickat av sessionen via Gmail samma förmiddag. | klart |

## ☀️ Kvar för Axel

1. ✅ **Nathalie, Sofie och creative strategen:** Axel skickade svaren och WhatsApp-texten 2026-10-02 ("Jag har skickat allt"). Väntar på Nathalies pris för två videor, Sofies pris för tre och strategens feedback på brieferna.
2. ✅ **Produktsidan:** Fable vald, omskriven utan statistik efter Axels dom, live på fjorton språk 2026-10-02.
3. ✅ Growth Guide-sidan skapad och integrationen inbjuden (Axel 2026-10-02 förmiddag); databasen byggd.
4. ✅ **Ätpinnarna ligger i alla lådor** (Axels svar 2026-10-02: "Ätpinnar ligger egentligen i alla lådor. Men jag har dom som en gratis gåva, men de ingår i alla lådor"). "Ätpinnar i trä ingår" får stå i copyn; gåvoraden i kassan är bara hur de bokförs.

## 🤖 Mitt (sessionen eller rutinen, inget för Axel)

- **Lör 3/10 07:00:** första ronden på den nya koden (`--hamta` alla marknader, `--dom-alla
  --logga`, `--arkiv`, playbook-taggar). Jag läser utfallet och rättar det som brister.
- **När en kreatör sagt ja:** rad i UGC-pipelinen i Notion med deadlines (`/ugc`, SOP-03), och
  uppladdaren loggar `--kreator <namn>` så arkivet räknar vinst per kreatör.
- **ATC-graden i rutinen** (Chadbot fråga 2): `kor.mjs --hamta` läser `add_to_cart` + `landing_page_view`,
  domen skriver ATC % för varje spend winner, tröskel 8 %. Byggs i nästa session.
- ✅ **3:2:2-uppladdaren och adsetdomen** (ROUTING C) byggda 2026-10-02 kväll — se Bygge 1.
- **Growth Guide i Notion** (beslut 2b): databas + rutinen skriver mätkolumnerna varje rond.
- **Produktsidans copy** (beslut 3): research ur egen data → copy → före/efter till Axel.
- **Research in i briefen** (läcka 3): kungen läser enkäten, kommentarerna och recensionerna
  före varje brief. Byggs i nästa session.
- ✅ **Evolves sju prompt-regler** inskrivna 2026-10-02 i `docs/copy-regler.md` + `docs/os/BRIEF-REGI.md` (val A).
- **Samma rättning till Bäverbutiken:** hook/hold-måttet och Evolve-etiketterna (vecka 2–3,
  spend mot veckan före) in i Skalnings kungens `agent/etikett.mjs`.
- **Kreatörslistan:** djupkollen (3 videor per kreatör, poängmallen) görs när någon svarat,
  innan pengar skickas.

## 🔔 Påminnelser (sessionen påminner, Axel behöver inte komma ihåg)

| När | Vad |
|---|---|
| Varje ny kreatör | **Ge Nathalies manus** (`ugc/NATHALIE-MANUS.md`) som video A. Står i kungens steg 6, så rutinen tar med det i varje UGC-förslag. |
| Mån 5/10 07:45 | Push till Axel: merge, ROUTING (A/B/C), copyregeln (`trig_01DNvip1ELUUsGDSFNDYDXoU`). |
| Från fre 9/10 | Rutinen 07:00 ger utlandets första etiketter per land, när kampanjerna gått en vecka. |
| Mån 12/10 07:45 | Push till Axel: är Sofies, Saras och Ebbas råfiler inne? (`trig_01AvCmc4qrFPQNAaakezRxTX`; Katarina ersatt av Ebba Nilsson 2/10, Axels beslut) |
| Tis 20/10 07:45 | Push till Axel: tre dagar kvar att beställa UGC till Black Friday (23/10), med beställningen färdigskriven (`trig_01TLJbdZ9nCC9EVTCUFYc7PU`). |
| Mån 26/10 07:45 | Produktsidan före november: novemberraderna ("tog slut i november", "långt före jul", "finns att köpa nu", "säkra dina") ses över mot lagret, förslag före/efter till Axel, inget live utan hans ok; översättningarna på elva språk kontrolleras (`trig_01X2fCvnnheQh7fpghkiLtDL`). |

---

## 👩‍💻 Kan läggas på VA:erna (inte startat)

Ur Evolve-kursen (A10 UGC, A3 Research). Allt på engelska, en SOP per rad innan det lämnas över.

| Uppgift | Vem i dag | Kurslektion |
|---|---|---|
| Hitta och kontakta nya kreatörer, skicka manus, följa upp, ladda upp råfiler | **Axel själv** (hans beslut 2026-10-01: Lovely pratar inte med kreatörerna) | A10: Process Creators, Sending Frameworks, Follow Up & Upload |
| Research-dokument per produkt (Reddit, TikTok, Amazon-recensioner) | ingen | A3 Research action items |
| Svara på Matstrumpors annonskommentarer | Axel | — |
| Judge.me-rättningarna (polskan, felmärkta recensioner) | Axel | — |
| Schemalägga Spoks-utkasten | Axel | — |

---

## 🔧 Nästa bygg (kvar av de fem läckorna) — med en prompt per bygge för en ny session

Axels fråga 2026-10-02: "vad har vi ens lärt oss från allt och från Evolve? Vi har ju inte
implementerat nått i några rutiner". Svaret, mätt mot repot:

**Det som ÄR i rutinerna i dag** (kör utan Axel, varje rond 07:00 i `/matstrumporkungen`):
hook rate och hold rate räknade som Evolve (`meta.mjs`), etiketterna med vecka 2–3 och
breakthrough-kravet (`etikett.mjs`), namnen som bär iterationskedjan (`namn.mjs`), arkivet och
Growth Guide i Notion skrivna av koden varje rond (`kor.mjs --arkiv`, `growthguide.mjs`),
playbooken och felkatalogen i kungens briefsteg, utlandets kampanjer med rätt startdag, och
copyreglerna ur Evolves prompter som varje briefskrivare och `/briefgranskning` läser
(`docs/copy-regler.md`: aldrig ett märke som referens, aldrig en faktarad först i en video,
aldrig statistik på produktsidan). Produktsidan säger samma sak som vinnarvideon på fjorton språk.

**Det som INTE är i rutinerna än** är tre byggen. Varje prompt nedan är skriven för en NY
session på repot (CLAUDE.md läses automatiskt); klistra in den som första meddelande.

### Bygge 1: 3:2:2 i uppladdaren och kungen (svälten, läcka 2) — ✅ BYGGT 2026-10-02 kväll

Gjort (grenen `claude/confident-cannon-c5p7kh`, mergad till `main`):
`matstrumpor/struktur.mjs` (taket, koncepten, adsetnamnet `MATSTRUMP_T<nnn>_<vinkel>_<video|bild>`,
COPY CARD 2 + 2, Meta-specarna, tillbakaläsningen), `matstrumpor/dom.mjs` (domen per adset),
`kor.mjs --struktur/--ko/--creative/--adset-skapad/--kontroll`, adseten i `--hamta` och
`--dom-alla --logga` (`ADSET_DOM` + `FORSLAG` per adset), arkivets och Growth Guidens adsetkolumner,
koncepttaket i `--status`, båda kommandofilerna, `docs/os/BRIEF-REGI.md` (COPY CARD 2 + 2) och
`ITERATIONS-PLAYBOOK.md` avsnitt 11. 233 tester, granskat av fem oberoende granskare med skeptiker (26 fynd rättade). Torrkört mot nya kungen (läs-bart). Kvar:
första skarpa uppladdningen på Axels "kör" — den visar om Meta tar `asset_feed_spec` med två
texter genom MCP:n (`--kontroll` läser tillbaka det; en annons med en text går aldrig upp tyst).

Prompten som byggde det:

```
Bygg om Matstrumpors annonsstruktur till Evolves 3:2:2, Axels beslut ROUTING C 2026-10-02.
Läs först products/matstrumpor/EVOLVE-PLAN.md (beslut 2), docs/os/evolve/ITERATIONS-PLAYBOOK.md,
docs/os/evolve/KURSTRAD.md (lektionen "How To Set Up a 3:2:2 Campaign" + Media Buying Structure
2026, läs dem med tools/skool/lektioner.mjs) och products/matstrumpor/CHADBOT-SVAR-2026-10-02.md.
Reglerna som gäller: EN CBO med ett Champions-adset och högst 4 testadsets (max 5 totalt under
några hundra dollar/dag); ett koncept = ett adset; tre vanliga annonser per adset (samma koncept,
tre hookar), varje annons med 2 rubriker + 2 primärtexter; bild och video aldrig i samma adset;
varje adset ska rymma 3 × CPA per dag (break-even-CPA 308 kr ⇒ ~925 kr); test 7 dagar, max 14;
döm och stäng på ADSET-nivå, aldrig per annons; vinnare = adsetet tar majoriteten av spenden vid
KPI eller kampanjens ROAS förbättras; flytt till Champions vid 20–30 % budgetandel. Ordet DCT finns
inte i kursen — inga dynamic creative-adsets.
Gör: (1) /matstrumpor (.claude/commands/matstrumpor.md + matstrumpor/kor.mjs): en ny batch från
hubbens To be Reviewed blir ett testadset per koncept med tre hookvarianter som tre annonser,
2 rubriker + 2 texter per annons ur briefen; vägra ett sjätte adset; logga adset-id i loggen och
arkivet. Uppladdningen går via Adsmanager-MCP:n som i dag. (2) /matstrumporkungen
(.claude/commands/matstrumporkungen.md + matstrumpor/etikett.mjs, dom.mjs): domen per adset
(7-dagarsregeln, stäng adset, aldrig annons), flyttförslaget till Champions som FORSLAG-rad i
tabellen till Axel (kungen skalar ALDRIG själv, Axels beslut 2026-09-21), och Growth Guide får
kolumnen Adset. (3) Tester för domen och adsetvalet, torrkörning mot kontot nya kungen
730973156224390 (läs-bart), inget skapas i Meta förrän Axel säger kör. Rapportera på svenska i
Axels format (inga tabeller, inga filnamn, inga siffror i prosan, hans uppgifter sist numrerade),
committa, pusha, merga till main.
```

### Bygge 2: ATC-graden och kundernas ord in i rutinen (läcka 3)

```
Bygg in två saker i /matstrumporkungen, enligt products/matstrumpor/EVOLVE-PLAN.md ("Mitt" och
"Nästa bygg") och products/matstrumpor/CHADBOT-SVAR-2026-10-02.md.
(1) ATC-graden: matstrumpor/kor.mjs --hamta läser add_to_cart och landing_page_view per annons ur
Meta (last_14d), domen skriver ATC-procent för varje annons med spend över grinden, tröskeln är
Chadbots: under 8 % = glapp mellan annons och sida (föreslå sidändring, ingen ny annons), 8–12 % =
friktion på sidan, över 12 % = sidan håller. Facit i dag: Nathalies vinnare 5,5 %, erbjudandebilden
d3 12,9 % på samma sida (2026-09-30). Produktsidan byttes 2026-10-02 — jämför före och efter i
rapporten och i Growth Guide (ny kolumn ATC).
(2) Research in i briefen: innan kungen skriver en brief ska den läsa kundernas egna ord:
köparenkäten (enkat/, INBOX.ENKAT — lösenordet KUNDTJANST_MAIL_PASS_MATSTRUMPOR finns bara i
rutinens miljö, så bygg läsningen i rutinen, inte i sessionen), annonskommentarerna
(kommentarer/leads.md, kalla=voc) och recensionerna (Judge.me + Trustpilot, matstrumpor/trustpilot/).
Varje brief ska peka på minst ett citat eller mönster därifrån, annars märks den som gissning
(CLAUDE.md "Så lär sig systemet"). Produktsidans faktablad från 2026-10-02 ligger i
products/matstrumpor/produktsida/2026-10-02-v2-med-ny-information.json som exempel på formen.
Tester utan nät, torrkörning, rapport i Axels format, committa, pusha, merga till main.
```

### Bygge 3: samma rättning till Bäverbutiken (hook/hold och etiketterna)

```
Porta Matstrumpors Evolve-rättningar till Bäverbutikens Skalnings kung. Läs
products/matstrumpor/EVOLVE-PLAN.md (Klart 1 och 4), matstrumpor/meta.mjs (hook rate = 3-sekunders-
visningar ÷ visningar, hold rate = ThruPlay ÷ visningar) och matstrumpor/etikett.mjs (etiketten
kan bli bättre vecka 2–3, breakthrough kräver att kampanjens spend växte 10 % mot veckan före,
budgethöjningar för hand flaggas). Lägg samma mått och samma etikettregler i agent/etikett.mjs och
det Skalnings kungen läser (.claude/commands/skalningskungen.md), utan att ändra dess
budgetbeslut eller trösklar — bara måtten och etiketterna. Kontot är MagiBorsten 1867947880635861,
läs-bart under bygget. Kör de befintliga testerna, lägg till tester för de nya måtten, torrkör mot
kontot, rapport i Axels format, committa, pusha, merga till main.
```

Sedan tidigare (kvar): ✅ copyreglerna ur Evolves prompter (läcka 5) inskrivna 2026-10-02; ✅
Chadbot-frågorna besvarade (`CHADBOT-SVAR-2026-10-02.md`).
