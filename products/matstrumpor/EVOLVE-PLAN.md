# Matstrumpor: Evolve-planen (checklistan)

Axel 2026-10-01: "jag kör så många tasks så det är viktigt att du är strukturerad, annars glömmer
jag allt". Det här är EN lista. Den uppdateras av sessionen som gör något på den, aldrig av minnet.
Bakgrunden står i `docs/os/evolve/EVOLVE-GAP-ANALYS.md`.

Senast uppdaterad: 2026-10-02 kväll (Axels tre beslut: C, produktsidan, A).

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
| 7 | **UGC-beställningen: fyra briefer, tre videor per kreatör.** Kopian, problemet först, mannen som ger bort, fikaskämtet. Ingen filmar det hon redan filmat. 9 kreatörer + 4 reserver med färdiga meddelanden, från Axel själv, utan pris. | `products/matstrumpor/ugc/2026-10-briefer.md`, `factory/ugc/` |

Facit för siffrorna: 151 tester gröna, och en läsning mot Meta 2026-10-01 (15 kampanjer, 131 + 112 annonser).

---

## ✅ Axels beslut 2026-10-02 kväll

| # | Beslut | Vad det betyder | Vem gör |
|---|---|---|---|
| 1 | **"merga"** | Grenen ligger på `main` (3d764c01). Rutinen lör 3/10 07:00 kör den nya koden. | klart |
| 2 | **ROUTING = C, 3:2:2** ("Jag gillar chadbots sätt") | ⚠️ Läst i kursen 2026-10-02 (lektionen "How To Set Up a 3:2:2 Campaign" + Media Buying Structure 2026): ordet DCT/dynamic creative finns INTE i kursen. 3:2:2 = **tre vanliga annonser per adset (samma koncept, tre hookar), var och en med 2 rubriker + 2 primärtexter**, i EN CBO med ett Champions-adset och flera testadsets; ett koncept = ett adset; bild och video aldrig i samma adset. Under några hundra dollar/dag **max 5 adsets inkl. champions**, varje adset ska kunna få 3 × CPA per dag (≈ 925 kr), test 7 dagar, stäng på ADSET-nivå, aldrig annons; vinnare = adsetet tar majoriteten av spenden vid KPI eller kampanjens ROAS förbättras; flytt till champions vid 20–30 % budgetandel. Under $1k/dag: fokus på vinnarannonser, ingen ABO-skalning. Så för Matstrumpor (~2 700 kr/dag): champions + högst 2–3 testadsets i taget. | sessionen bygger om `/matstrumpor` (Adsmanager-MCP:n) OCH `/matstrumporkungen` (domen per adset, 7-dagarsregeln, flyttregeln, max 5 adsets) |
| 2b | **Growth sheet i Matstrumpors teamspace** (Axels ord: "lägg gärna notiondatabasen i matstrumpors teamspace") | Arkivet (`arkiv.md`) är bara läsbart och skrivs över av koden. Byggs som en Notion-databas "Matstrumpor Growth Guide": rutinen skriver mätkolumnerna (etikett, typ, förälder, hook/hold, spend, köp, ROAS, playbook), människor äger kolumnerna Anteckning/Beslut/Nästa steg som koden aldrig rör. Axel ser den i Notion. | ✅ **Byggd 2026-10-02** under Axels sida (han skapade sidan och bjöd in integrationen samma förmiddag): databasen `3ed270ab-908c-811a-9eff-feddb5f5e2de`, 128 rader, https://www.notion.so/3ed270ab908c811a9efffeddb5f5e2de. `matstrumpor/growthguide.mjs --skarpt` körs i kungens rond efter `--arkiv`; koden skriver bara mätkolumnerna, Anteckning/Beslut/Nästa steg/Ägare är människornas. Id i `matstrumpor/growthguide.json` |
| 3 | **Produktsidans copy ändras så den säger samma sak som Nathalies video** (present, favoriträtt, "sålde slut i november") + NY INFORMATION och MEKANISM ur `ny-information.md`/`mekanismer.md` (Axel 2026-10-02: "detta kommer bli bra eftersom vi nyss fått all denna information"); två versioner, Sonnet 4.6 och Fable 5.1 ultracode, före lansering | Inte en ny sida: den vanliga `matstrumpor.se/products/sushi-strumpor`. Axels fråga står kvar: är kunderna de som har svårt för presenter, eller de som köper tusen julklappar? **Svaret mäts, gissas inte:** enkäten (`enkat/`), Judge.me-recensionerna, annonskommentarerna och ordermönstret (par per order, decemberandel, presentmeddelanden). Sedan skrivs copyn av huvudsessionen (landningssideundantaget, regel 6), visas som före/efter, och går live på Axels ok. ATC-graden efteråt är facit (5,5 % nu). | sessionen: research (workflow, 7 källor + ny informationen) → faktablad → två versioner → Axels val → live. v1 utan ny informationen ligger i `products/matstrumpor/produktsida/2026-10-02-v1-utan-ny-information.json` |
| 4 | **Copyregeln = A** (Evolves: aldrig ett märke som referens) | Inskriven i `docs/copy-regler.md` + `docs/os/BRIEF-REGI.md` med de sex andra prompt-reglerna. Vardagsreferenser (takeaway, julstrumpa) kvar. | klart |

| 5 | **Tre videor per kreatör, paketpris** (Axels val A 2026-10-02: "vi kan lowkey köra 3 videor per kreatör så får vi paketpris") | Varje kreatör filmar brief 1, 2 och 3 eller 4; priset förhandlas som ett paket. Saras svar skickat av sessionen via Gmail samma förmiddag. | klart |

## ☀️ Kvar för Axel

1. **Nathalie:** skicka meddelandet (utskick 0 i `factory/ugc/utskick/2026-10-01-matstrumpor.md`), om det inte redan gått.
2. **Produktsidan:** när förslaget kommer (före/efter), säg ok eller ändra. Inget går live innan dess.
3. ✅ Growth Guide-sidan skapad och integrationen inbjuden (Axel 2026-10-02 förmiddag); databasen byggd.
4. ✅ **Ätpinnarna ligger i alla lådor** (Axels svar 2026-10-02: "Ätpinnar ligger egentligen i alla lådor. Men jag har dom som en gratis gåva, men de ingår i alla lådor"). "Ätpinnar i trä ingår" får stå i copyn; gåvoraden i kassan är bara hur de bokförs.

## 🤖 Mitt (sessionen eller rutinen, inget för Axel)

- **Lör 3/10 07:00:** första ronden på den nya koden (`--hamta` alla marknader, `--dom-alla
  --logga`, `--arkiv`, playbook-taggar). Jag läser utfallet och rättar det som brister.
- **När en kreatör sagt ja:** rad i UGC-pipelinen i Notion med deadlines (`/ugc`, SOP-03), och
  uppladdaren loggar `--kreator <namn>` så arkivet räknar vinst per kreatör.
- **ATC-graden i rutinen** (Chadbot fråga 2): `kor.mjs --hamta` läser `add_to_cart` + `landing_page_view`,
  domen skriver ATC % för varje spend winner, tröskel 8 %. Byggs i nästa session.
- **DCT-uppladdaren** (ROUTING C, beslutat 2026-10-02): ett dynamic creative-adset per batch,
  3:2:2, promovering vid 20–30 % budgetandel. Bygg i `.claude/commands/matstrumpor.md` + motorn.
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
| Mån 12/10 07:45 | Push till Axel: är Sofies och Katarinas råfiler inne? (`trig_01AvCmc4qrFPQNAaakezRxTX`) |
| Tis 20/10 07:45 | Push till Axel: tre dagar kvar att beställa UGC till Black Friday (23/10), med beställningen färdigskriven (`trig_01TLJbdZ9nCC9EVTCUFYc7PU`). |

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

## 🔧 Nästa bygg (kvar av de fem läckorna)

1. **Svälten** (läcka 2): hälften av allt vi laddat upp har aldrig fått leverans. Beslutat 2026-10-02: DCT 3:2:2 (ROUTING C). Bygget är nästa.
2. **Research in i briefen** (läcka 3): 0 av 12 briefer kom ur kundernas egna ord. Kungen ska läsa enkäten, kommentarerna och recensionerna innan den briefar.
3. ✅ **Copyreglerna ur Evolves prompter** (läcka 5) inskrivna 2026-10-02, Axels val A.
4. ✅ Chadbot-frågorna ställda och besvarade 2026-10-01 (`CHADBOT-SVAR-2026-10-02.md`).
