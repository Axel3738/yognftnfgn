# Prompt: recensionsmejlet (Trustpilot) för Matstrumpor

Skriven 2026-09-25 efter att Bäverbutikens F14 byggdes. Kör den först när
Matstrumpor-sessionen (`klaviyo/PROMPT-matstrumpor.md`) är klar och mergad.
Allt under strecket är prompten.

---

Bygg recensionsflödet för **Matstrumpor** (Klaviyo-kontot UV6Rqg), på samma
sätt som Bäverbutikens F14 (`klaviyo/innehall/baverbutiken/floden/f14-recension-trustpilot.json`,
flödet `UAKPrr`). Läs `klaviyo/README.md` (raden om F14) först.

1. Kopiera F14 till `klaviyo/innehall/matstrumpor/floden/f14-recension-trustpilot.json`. Trigger Fulfilled Order, 14 dagar, filter `kundundantag`, blocket `stjarnor`.
2. Trustpilot-länken: `https://se.trustpilot.com/evaluate/matstrumpor.se`. Om det inte går att verifiera att profilen finns, skriv det i memot och i rapporten.
3. Copyn skrivs av en sonnet-subagent enligt `docs/copy-regler.md`, med tre-frågorstestet ärligt redovisat. Inga tankstreck, ingen leveranstid, inga priser, inga påhittade fakta. Rubrikerna ska peka på kundens eget paket (samma bedömning som F14).
4. ⛔ **Ingen review gating.** ALLA stjärnor går till Trustpilot. Missnöjda får aldrig skickas till ett annat ställe (Judge.me, formulär, mejl) i stället för Trustpilot. Det är förbjudet enligt Trustpilots regler och vilseledande. Raden "svara på mejlet om något blev fel" är tillåten, eftersom den inte tar bort Trustpilot-länken.
5. Kör `bygg.mjs --brand matstrumpor`, sedan `ladda-upp.mjs --brand matstrumpor --bara mallar` och `--bara floden` torrt, och sedan `--skarpt`. Läs tillbaka ur kontot att flödet är `draft`.
6. **Slå INTE på flödet.** Det är ett utkast tills jag säger till.
7. Dokumentera i `klaviyo/README.md`. Committa, pusha, öppna en PR och merga till `main`.

Avsluta med en ✅/❌-checklista och en skärmdump av mejlet. Mina egna klick står sist, numrerade.
