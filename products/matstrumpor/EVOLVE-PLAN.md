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
| 7 | **UGC-beställningen: fyra briefer, tre videor per kreatör.** Kopian, problemet först, mannen som ger bort, fikaskämtet. Ingen filmar det hon redan filmat. 9 kreatörer + 4 reserver med färdiga meddelanden, från Axel själv, utan pris. | `products/matstrumpor/ugc/2026-10-briefer.md`, `factory/ugc/` |

Facit för siffrorna: 151 tester gröna, och en läsning mot Meta 2026-10-01 (15 kampanjer, 131 + 112 annonser).

---

## 🌙 I kväll (Axel, 10 minuter)

1. **Skicka DM:en/mejlen till kreatörerna.** Texterna står färdiga i
   `factory/ugc/utskick/2026-10-01-matstrumpor.md` (9 st + 4 reserver; listan i
   `factory/ugc/kreatorer.md`). Sofie och Katarina först, sedan de nya.
2. **Skriv "merga"** här i chatten. Annars kör rutinen lör 3/10 07:00 på den gamla koden.
3. **ROUTING, A eller B:** A = nya UGC-videor laddas upp i `09-17 UGC` (Nathalies adset,
   85 % av spenden); B = som förut (`nya16`/`jul_video`, där Gilz 11 videor fick 35 kr på en vecka).

## ☀️ I morgon fre 2/10 (Axel, 15 minuter)

4. **Dela briefsidan** med Lovely och kreatörerna som sagt ja:
   https://claude.ai/artifact/NrD4m6BmZ8E7kupZXk5CWn → **Share** → **Anyone with the link**.
5. **Skicka Lovely-meddelandet** (`products/matstrumpor/ugc/LOVELY-2026-10-01.md`): hon
   sköter paket, brief, deadline och råfiler för de som sagt ja. Hon letar inga kreatörer.
6. **Klistra in Chadbot-frågan** (`products/matstrumpor/CHADBOT-2026-10-02.md`, utan brand)
   och klistra tillbaka svaret här. Fyra frågor: UGC-vinnare med bara en video, spend
   winner med hög hold men låg konvertering, hit rate per idékälla, och om nya annonser ska
   testas i vinnarens adset.
7. **Ett regelbeslut:** Evolves hookregel säger "jämför aldrig med ett märke, skriv först/enda",
   vår `copy-regler.md` säger "jämför med det kunden redan känner". **A** = Evolves regel
   vinner, **B** = vår står kvar. Sedan skrivs Evolves sju prompt-regler in i copy-reglerna.
8. **Fiverr-ordrarna** (Wallin Twins, ev. Sami/Andrea) är köp och görs av dig när de svarat.

## 🤖 Mitt (sessionen eller rutinen, inget för Axel)

- **Lör 3/10 07:00:** första ronden på den nya koden (`--hamta` alla marknader, `--dom-alla
  --logga`, `--arkiv`, playbook-taggar). Jag läser utfallet och rättar det som brister.
- **När en kreatör sagt ja:** rad i UGC-pipelinen i Notion med deadlines (`/ugc`, SOP-03), och
  uppladdaren loggar `--kreator <namn>` så arkivet räknar vinst per kreatör.
- **Research in i briefen** (läcka 3): kungen läser enkäten, kommentarerna och recensionerna
  före varje brief. Byggs i nästa session.
- **Evolves sju prompt-regler** in i `docs/copy-regler.md` + `docs/os/BRIEF-REGI.md` efter
  Axels A/B i punkt 7.
- **Samma rättning till Bäverbutiken:** hook/hold-måttet och Evolve-etiketterna (vecka 2–3,
  spend mot veckan före) in i Skalnings kungens `agent/etikett.mjs`.
- **Kreatörslistan:** djupkollen (3 videor per kreatör, poängmallen) görs när någon svarat,
  innan pengar skickas.

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
