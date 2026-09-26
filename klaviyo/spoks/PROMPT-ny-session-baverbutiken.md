Fortsätt Bäverbutikens mejl i Spoks och gör klart det i dag. Förra sessionen tog sju timmar och gav mig klick som inte fanns i appen. Nu ska det gå snabbt.

Börja så här:
1. Hämta förra sessionens arbete in i din gren: git fetch origin claude/spock-email-integration-pryz0w och git merge origin/claude/spock-email-integration-pryz0w. Där finns koden, de rättade utkasten och listan klaviyo/spoks/baverbutiken/KVAR.md.
2. Läs klaviyo/spoks/baverbutiken/KVAR.md och Bäverbutiken-delen av klaviyo/spoks/README.md. Inget annat behövs.
3. Spoks storeId är f716ae36-68ae-4f1c-a45e-96c35d5637a0. Läs läget med get_flows, get_flow och search_campaigns innan du säger något till mig.

Regler:
- Alla 13 flöden och F04 v2 är LIVE. MCP:n kan inte ändra ett live-flöde med inrullade kontakter. Bygg därför en rättad kopia (till exempel "F01 v2") som inaktivt flöde via MCP, precis som F04 v2 byggdes. Jag slår själv på sändstegen och flödet, och stänger av sändstegen i det gamla. Be mig aldrig skriva om text i appen.
- Ge mig klick med EXAKT de namn jag ser i appen: flödets namn ur get_flows och stegets namn ur get_flow (parameters.name). Skriv aldrig "mejl 2". Saknar ett steg namn, beskriv det med ämnesraden och ordningen. Ge alltid direktlänk: https://app.spoks.com/baverbutiken/flows/<id> eller https://app.spoks.com/baverbutiken/post/<id>/edit.
- Högst fem klick åt gången, en mening per rad, sist i svaret. Kontrollera varje klick jag gjort med get_flow eller search_campaigns innan du går vidare.
- Kör inga långa workflows. Gör jobbet direkt. Korta svar på svenska.
- Rör inte väntetiderna i F08 till F14, de är mina ändringar. Rör inte Shopify-mejlen (Cowork sköter dem).

Ordning, deadline först:
1. F01 Välkomst (b8165fed-50a2-42e4-a275-494433d3f7f0): steget "Tanköverdraget, slipmaskinen och två till" går ut måndag 28/9 cirka 09:03 till 37 personer, med två falska "verifierad kund"-citat (Karin och Erik, importerade recensioner, inte köp). Be mig först stänga av just det steget med reglaget till höger om namnet, samma sak jag gjorde i gamla F04. Bygg sedan F01 v2 utan citaten, med filtret "inte köpt sedan start" och den rättade texten i "Så funkar det när du handlar hos oss" (se KVAR.md).
2. K01: gamla K01 (51c37c20-e00c-48c2-b144-089e62f62d14) är schemalagd tisdag 29/9 18:00 och har samma falska citat. K01 v2 (0c760c3e-3eec-4fc0-b40f-3ec16b37e330) är klar som utkast. Ge mig två länkar: avbryt gamla, schemalägg v2 med Warmup tier 1 tisdag 18:00.
3. F14 Recension Trustpilot: stjärna 1 till 3 går till Judge.me och 4 till 5 till Trustpilot. Det är review gating och förbjudet hos Trustpilot. Fråga mig A (alla fem till Trustpilot) eller B (alla fem till Judge.me) och bygg sedan F14 v2.
4. F04 Efter köp v2 (kredit): mejl 1 lovar "exakt var ditt paket är" fast sidan kräver att man skriver numret, mejl 2 har rubriken "Andra som köpte det du köpte, köpte även det här" över samma tre produkter till alla, och återinträdet ger KREDIT100 igen till den som redan använt koden. Bygg F04 v3.
5. Resten i KVAR.md: F02 Övergiven kassa (produktblocket i mejl 2, återinträde 7 dagar), F05, F07, F13.
6. Skriv in det som är live i klaviyo/spoks/README.md och CLAUDE.md, committa, pusha, öppna en PR till main och merga den.

Klart betyder: inga falska citat och ingen review gating i något som skickas, K01 v2 schemalagd, alla v2-flöden på och de gamla avstängda, README uppdaterad och mergad.
