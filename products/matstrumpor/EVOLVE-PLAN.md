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
| 2 | **ROUTING = C, DCT 3:2:2** ("Jag gillar chadbots sätt") | Varje ny batch får ett eget adset i `MATSTRUMP_SALES_20260826` med dynamic creative: ≥ 3 videor, 2 rubriker, 2 primärtexter. Flytt till `09-17 UGC` när en video tagit 20–30 % av testadsetets budget. | sessionen bygger om `/matstrumpor` (Adsmanager-MCP:n) |
| 2b | **Growth sheet** som Axel kan se OCH som han och creative strat kan ändra i | Arkivet (`arkiv.md`) är bara läsbart och skrivs över av koden. Byggs som en Notion-databas "Matstrumpor Growth Guide": rutinen skriver mätkolumnerna (etikett, typ, förälder, hook/hold, spend, köp, ROAS, playbook), människor äger kolumnerna Anteckning/Beslut/Nästa steg som koden aldrig rör. Axel ser den i Notion. | sessionen; Axel får en länk när den finns |
| 3 | **Produktsidans copy ändras så den säger samma sak som Nathalies video** (present, favoriträtt, "sålde slut i november") | Inte en ny sida: den vanliga `matstrumpor.se/products/sushi-strumpor`. Axels fråga står kvar: är kunderna de som har svårt för presenter, eller de som köper tusen julklappar? **Svaret mäts, gissas inte:** enkäten (`enkat/`), Judge.me-recensionerna, annonskommentarerna och ordermönstret (par per order, decemberandel, presentmeddelanden). Sedan skrivs copyn av huvudsessionen (landningssideundantaget, regel 6), visas som före/efter, och går live på Axels ok. ATC-graden efteråt är facit (5,5 % nu). | sessionen: research → förslag → Axels ok → live |
| 4 | **Copyregeln = A** (Evolves: aldrig ett märke som referens) | Inskriven i `docs/copy-regler.md` + `docs/os/BRIEF-REGI.md` med de sex andra prompt-reglerna. Vardagsreferenser (takeaway, julstrumpa) kvar. | klart |

## ☀️ Kvar för Axel

1. **Nathalie:** skicka meddelandet (utskick 0 i `factory/ugc/utskick/2026-10-01-matstrumpor.md`), om det inte redan gått.
2. **Produktsidan:** när förslaget kommer (före/efter), säg ok eller ändra. Inget går live innan dess.
3. **Growth sheet:** om integrationen "Bäverbutiken RUTINER" inte får skapa en databas i Matstrumpors teamspace behövs ett klick: skapa en tom sida "Matstrumpor Growth Guide" och bjud in integrationen. Sessionen säger till om det behövs.

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
