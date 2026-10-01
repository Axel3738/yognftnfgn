# Matstrumpor: Evolve-planen (checklistan)

Axel 2026-10-01: "jag kör så många tasks så det är viktigt att du är strukturerad, annars glömmer
jag allt". Det här är EN lista. Den uppdateras av sessionen som gör något på den, aldrig av minnet.
Bakgrunden står i `docs/os/evolve/EVOLVE-GAP-ANALYS.md`.

Senast uppdaterad: 2026-10-01 kväll.

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
| 7 | **UGC-beställningen till Sofie och Katarina.** Tre videor var: kopia, ny version, eget format. | `products/matstrumpor/ugc/` |

Facit för siffrorna: 151 tester gröna, och en läsning mot Meta 2026-10-01 (15 kampanjer, 131 + 112 annonser).

---

## ⏳ Väntar på Axel

1. **Skicka Lovely-meddelandet** (`ugc/LOVELY-2026-10-01.md`) och dela sidan med henne.
2. **Merga** grenen `claude/funny-cannon-pu0t89` till `main`, annars kör 07:00-rutinen den gamla koden.
3. **ROUTING:** ska nya UGC-videor (Sofie, Katarina, Gilz) laddas upp i `09-17 UGC`, där Nathalie ligger? Det adsetet tog 85 % av spenden på 14 dagar, och nya videor i andra adsets får nästan ingenting (Gilz 11 videor: 35 kr på sju dygn). Förslaget står i loggen sedan 30/9.

---

## 🔔 Påminnelser (sessionen påminner, Axel behöver inte komma ihåg)

| När | Vad |
|---|---|
| Varje ny kreatör | **Ge Nathalies manus** (`ugc/NATHALIE-MANUS.md`) som video A. Står i kungens steg 6, så rutinen tar med det i varje UGC-förslag. |
| Mån 5/10 07:45 | Push till Axel: Lovely-meddelandet, merge, ROUTING (`trig_01DNvip1ELUUsGDSFNDYDXoU`). |
| Från fre 9/10 | Rutinen 07:00 ger utlandets första etiketter per land, när kampanjerna gått en vecka. |
| Mån 12/10 07:45 | Push till Axel: är Sofies och Katarinas råfiler inne? (`trig_01AvCmc4qrFPQNAaakezRxTX`) |
| Tis 20/10 07:45 | Push till Axel: tre dagar kvar att beställa UGC till Black Friday (23/10), med beställningen färdigskriven (`trig_01TLJbdZ9nCC9EVTCUFYc7PU`). |

---

## 👩‍💻 Kan läggas på VA:erna (inte startat)

Ur Evolve-kursen (A10 UGC, A3 Research). Allt på engelska, en SOP per rad innan det lämnas över.

| Uppgift | Vem i dag | Kurslektion |
|---|---|---|
| Hitta och kontakta nya kreatörer, skicka manus, följa upp, ladda upp råfiler | Lovely (delvis) | A10: Process Creators, Sending Frameworks, Follow Up & Upload |
| Research-dokument per produkt (Reddit, TikTok, Amazon-recensioner) | ingen | A3 Research action items |
| Svara på Matstrumpors annonskommentarer | Axel | — |
| Judge.me-rättningarna (polskan, felmärkta recensioner) | Axel | — |
| Schemalägga Spoks-utkasten | Axel | — |

---

## 🔧 Nästa bygg (kvar av de fem läckorna)

1. **Svälten** (läcka 2): hälften av allt vi laddat upp har aldrig fått leverans. Löses av ROUTING-beslutet ovan.
2. **Research in i briefen** (läcka 3): 0 av 12 briefer kom ur kundernas egna ord. Kungen ska läsa enkäten, kommentarerna och recensionerna innan den briefar.
3. **Copyreglerna ur Evolves prompter** (läcka 5): sju regler (hook ~5 ord, kall trafik 0–3–8–35 s, slippery slope …). En krockar med våra regler ("jämför aldrig med ett märke" mot "jämför med det kunden känner"). Där behövs Axels val.
4. **Tre frågor till Chadbot** som inte är ställda (gap-analysen avsnitt 8).
