# SOP-07: Redigerardashboarden — managerns dag

**Ägare:** Managern. **Tid:** ~10 min på morgonen, ~5 min mitt på dagen, ~15 min på eftermiddagen.

Dashboarden är **systemets sanning**. Slack är bara ett sätt att prata med den.
En fil ligger klar att öppna: `dashboard/index.html`.

## Dagen i fyra steg

| När | Skriv | Vad som händer |
|-----|-------|----------------|
| Morgon | `/plan` | Claude räknar kvoten, föreslår fördelning, skapar tasks, skriver morgonmeddelanden |
| Mitt på dagen | `/dashboard` | Ser vem som ligger efter och vad som blockerar |
| Eftermiddag | `/rapport <namn>: <slack-texten>` | Slutrapporter tolkas och registreras |
| Kväll | `/granska` | Betar av review-kön, godkänner eller skickar tillbaka |

Du behöver aldrig öppna en kodfil. Claude kör kommandona åt dig.

## 1. Så skapar du dagens plan

Skriv `/plan`. Claude visar ett förslag som tabell **innan** något skapas. Titta på:
- Ligger någon över sitt dagsmål? Säg till, det håller inte i längden.
- Har alla tasks en brief-länk? Utan brief blir det alltid en revision.
- Är oavslutat arbete från igår med? Det ska ligga först.

Godkänn, så skapas tasksen och morgonmeddelandena skrivs som utkast.

## 2. Så följer du upp mitt på dagen

Skriv `/dashboard`. Fliken **Behöver din uppmärksamhet** är hela poängen — allt
annat rullar utan dig. Ordningen är blockers, sena tasks, review-kön.

Ser du en blocker: den har redan ett fält för *vad som behövs* och *vem som ska
agera*. Är det du — gör det nu. Är det Axel — skicka vidare direkt.

## 3. Så granskar du leveranser

Skriv `/granska`. Per task:
- Öppna leveranslänken.
- Gå igenom checklistan. Är en obligatorisk punkt obesvarad står frågan färdig-
  formulerad — skicka den till redigeraren. **Bocka aldrig av åt dem.**
- Godkänn, eller skicka tillbaka med feedback.

En task kan inte bli godkänd med röd checklista. Vill du ändå: override, med
skriven motivering som hamnar i loggen.

## 4. Så skickar du feedback

Feedback ska gå att agera på. Skriv **vad**, **var** och **vad du vill i stället**:

> ✅ "Padding close-up is out of focus from 0:04. Reshoot that shot, keep the rest."
> ❌ "Ser inte bra ut, gör om."

Feedbacken sparas på tasken och visas nästa gång samma person levererar den.

## 5. Så ser du om en produkt ligger efter

Fliken **Översikt** → tabellen *Produkter mot creative-målet*.
🟢 över mål · 🟡 exakt på mål · 🔴 under mål.

Kvoten är samma formel som resten av systemet (SOP-02): 20 % av dagsbudgeten
(10 % över 5 000 kr) ÷ target-CPA × 3.

**Bara godkända creatives räknas.** Levererat är inte samma sak som godkänt.

## 6. Så hanterar du en blocker

1. Läs *vad som behövs* och *vem som ska agera*.
2. Kan du lösa det: gör det och be redigeraren fortsätta.
3. Kan du inte: skicka till rätt person med deadline.
4. Ligger tasken kvar blockerad över en dag — flytta den till någon annan eller
   ändra plan. En blockerad task äter kapacitet utan att leverera.

## 7. Så avslutar du dagen

Dagen är grön när:
- Alla slutrapporter är inne (dashboarden flaggar den som saknas).
- Review-kön är tom eller har en tydlig anledning att vänta.
- Inga obesvarade underkännanden är äldre än ett dygn.
- Kvotläget är 0 eller plus — eller så finns en konkret ikappkörningsplan.

## Slack

Workspace: **stonebite**. En kanal per produkt för redigerarna, plus en för UGC.
Claude läser och skriver där via Slack-anslutningen — ingen egen app behövs.

### Mallar

**Morgon** (en per redigerare):
> Good morning, Maria. You have 4 tasks today for Axelbältet and Motorhöljet.
> The goal is 6 finished creatives. Start with AXE-013 — it ships first.
> Your list: [länk] · Reply START when you begin.

**Mitt på dagen:**
> You have completed 1 of 4 tasks. Are you still on track to finish today?
> 1) Yes, on track 2) No, I need more time 3) I am blocked 4) I need help prioritising

Svarar någon *blockerad*, fråga alltid dessa fyra:
1. What is blocking you? 2. Which task? 3. What do you need to continue? 4. Who needs to act?

**Slutrapport:**
> End of day. Please send: tasks finished, creatives delivered, what is not done and why,
> anything blocked, and your delivery links.

**Godkänt:**
> AXE-013 approved. 2 creatives. Nice work — the hooks were clearly different this time.

**Ändringar krävs:**
> AXE-013 needs changes: [feedbacken]. Please re-upload to the same folder and reply DONE.

## Om något går fel

| Problem | Gör så här |
|---------|-----------|
| Dashboarden visar gammalt datum | `node dashboard/build.mjs` — den byggs inte om av sig själv |
| En task har fastnat i fel status | `node dashboard/cli.mjs history <id>` visar hela kedjan |
| Fel person fick tasken | `node dashboard/cli.mjs assign <id> --as anna --to <editor>` |
| Deadline måste flyttas | `node dashboard/cli.mjs due <id> --as anna --date YYYY-MM-DD` |
| Du vill se en annan dag | `node dashboard/build.mjs --date 2026-08-01` |
| Du vill ha siffrorna i Excel | `node dashboard/cli.mjs export-csv kpi --from D --to D > kpi.csv` |

Strular Claude: `docs/os/SOP-05-nar-claude-inte-lyssnar.md`.
