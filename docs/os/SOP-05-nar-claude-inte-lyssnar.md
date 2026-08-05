# SOP-05: När Claude inte lyssnar

Gamla SOP:ens steg 5 löd "Most likely claude will mess up here. Just tell it what it
did wrong." Det är sant men går att göra systematiskt. Så här felsöker managern utan
att kunna något om AI.

## Grundprinciper

1. **Peka på checklistan, inte på känslan.** Varje prompt slutar med en
   "Definition of done". Rätt svar när något är fel:
   > *"Gå igenom Definition of done-checklistan i prompten igen. Punkt 3 och 6 är
   > inte uppfyllda. Fixa dem."*
   Fel svar: "det blev inte bra, gör om" (då gissar Claude vad som var dåligt).
2. **En sak i taget.** Be om EN fix per meddelande om det är rörigt.
3. **Starta hellre om än gräl.** Har en session spårat ur (Claude hittar på data,
   ignorerar format): öppna en NY session och kör prompten igen från början.
   Prompterna är byggda för att köras om — det kostar bara minuter.
4. **Ändra prompten, inte bara samtalet.** Gör Claude samma fel två batcher i rad
   är det promptens fel. Säg till ägaren eller be Claude själv:
   > *"Du gjorde fel X igen. Uppdatera kommandofilen i .claude/commands/ så att felet
   > inte kan hända igen, committa och pusha."*
   Så blir varje misstag en permanent förbättring i stället för ett återkommande gräl.

## Vanliga fel och exakta svar

| Fel | Skriv detta |
|-----|-------------|
| Claude gissar performance-data | "Regel 4: hitta inte på siffror. Visa vilka MCP-anrop du gjorde. Saknas data, skriv det som lucka." |
| Claude frågar om lov mitt i | "Regel 10: kör hela kedjan utan att vänta på mig. Fortsätt." |
| Briefer på svenska | "Leveransformat punkt 3: briefer på engelska, svenska rader i Swedish/English-tabell. Gör om brieferna." |
| Färre annonser än kvoten | "Kör node pipeline/quota.mjs. Testplanen måste minst matcha kvoten. Fyll på." |
| Zip-filer saknas | "Leveransformat punkt 4: två zip-filer med README. Leverera dem." |
| Återanvända AD-ID:n | "Naming-regeln: läs av upptagna ID:n i kontot först. Numrera om." |
| Claude dömer annons på 100 kr spend | "Regel 3: ingen dom under 300 kr / 3 köp. Klassa om som osäker." |

## Eskalering

Om samma problem kvarstår efter (1) checklist-pekning, (2) ny session och
(3) prompt-uppdatering → skriv upp det i `docs/os/ACTIONPLAN.md` under "Kända
problem" och ta det med ägaren. Fastna aldrig mer än 30 min på samma fel.
