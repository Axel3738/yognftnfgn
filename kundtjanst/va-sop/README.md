# VA:ns SOP-bas — filerna är källan, Notion är visningen

Den här mappen är innehållet i Notion-databasen **"Customer support bäverbutiken"**
(`3aa270ab-908c-8057-a8a0-cc691d9e956b`). Skriven till Axel; allt innehåll i
SOP-filerna är på engelska, för VA:n läser engelska.

Byggd 2026-09-21, när spårningssidan gick live i sex butiker och SOP:erna
fortfarande sa åt VA:n att börja hos fraktbolaget.

---

## Varför filer och inte bara Notion

Tre skäl, alla mätta i den här basen:

1. **Innehållet låg i PDF-bilagor.** Varje rad hade Notions tomma svenska mall i
 kroppen (Bakgrund / Analys / Rekommendationer / Implementering) och hela SOP:en
 som en Word-export i `Filer och media`. En VA som ska slå upp något mitt i ett
 kundmejl laddar inte ner en PDF, och ingen kan söka i dem. Nu står texten i
 sidan; bilagan ligger kvar orörd.
2. **Q4 kräver fyra brands.** Samma text ska gälla Bäverbutiken, CaraShell,
 Matstrumpor och Grillkliniken. Då måste butiksvärdena ligga på **ett** ställe,
 annars driver de isär — och det märks först när en VA skickar fel adress.
3. **Notion har ingen historik man kan läsa.** En diff visar exakt vad som ändrades
 och varför. Det är hela skillnaden mellan en SOP-bas som lever och en som ruttnar.

---

## Så hänger det ihop

| Fil | Vad |
|---|---|
| `start-here.md` | **Startsidan.** Routningstabell: vad kunden frågar → vilken sida. Fyra järnregler. Var den nyanställda börjar |
| `00-STORE-FACTS.md` | **Den enda sidan som ändras per brand.** Butikstabell, avsändarland, ägarens värden (returfönster, svarstidsmål, vem som godkänner vad) |
| `01-TRACKING-PAGE.md` | Uppslagsrutinen: Shopify-tidslinjen → butikens spårningssida → fraktbolagets portal som reserv. Alla leverans-SOP:ar pekar hit |
| Övriga 33 | En SOP per kundfråga. Ingen av dem nämner ett butiksnamn, en domän, ett fraktbolag eller en adress — de säger "ta värdet ur Store facts" |
| `notion.json` | Vilken fil som är vilken Notion-sida |
| `skriv.mjs` | Skriver filerna till Notion |

**Tre saker som var värre än formuleringar, och som är borta:**

1. `LOG IN TO EMAIL ACCOUNT` hade **lösenordet i klartext, tre gånger** — och bara
   Grillklinikens brevlådor, mitt i Bäverbutikens bas. ⚠️ **Byt det lösenordet.**
2. `Technical issues during purchase` hade meningen "the customer is actually really
   stupid" i sin AI-prompt.
3. `Refund 3 step proccess` sa åt VA:n att skriva "vi diskuterade det internt" till
   varje kund. Det är osant, och det syns direkt när någon får samma mening två
   gånger. Samma sida körde dessutom ångerrätten rakt in i ett
   delåterbetalningserbjudande.

```bash
node kundtjanst/va-sop/skriv.mjs --torr # visa vad som skulle hända
node kundtjanst/va-sop/skriv.mjs # skarpt
node kundtjanst/va-sop/skriv.mjs --bara where-is-my-package.md
```

⚠️ **Skrivaren vägrar skriva över en sida som bär riktigt innehåll.** Den känner
igen Notions tomma standardmall och bara den; allt annat hoppas över med en rad om
varför. Vill man ändå skriva över: `--ersatt-allt`. Bilagor i `Filer och media` är
en egenskap på raden och rörs aldrig.

---

## Den här basen mot tvisthandboken

Två olika saker, med flit:

| | `kundtjanst/va-sop/` (den här) | `kundtjanst/sop/` |
|---|---|---|
| Vad | Vardagen: var är paketet, retur, fel vara, avbeställning | Betalningstvister: chargebacks och inquiries |
| Var VA:n läser den | I Notion | I repot (och som PDF) |
| Butiksvärden | Sidan **Store facts** | `{{PLATSHÅLLARE}}` ur brandfilen `kundtjanst/brands/<id>.yaml` |
| Vakt | — | `npm run sop` |

Chargeback-SOP:en i den här basen är den korta vägen in: den säger vad VA:n gör
första timmen och skickar henne sedan till tvisthandboken.

---

## Ny butik inför Q4

1. Duplicera Notion-databasen till det nya brandets teamspace.
2. Ändra **bara** sidan Store facts: en rad i butikstabellen, en kolumn i
 ägarvärdena.
3. Kontrollera två saker som annars går sönder tyst: att spårningssidan hittar ett
 riktigt paket, och att supportadressen tar emot mejl.
4. Vill du att basen ska kunna skrivas om från repot också: kopiera `notion.json`,
 byt `databas` mot den nya databasens id och nolla `notion_id` på raderna.

Ändrar du en procedur för ETT brand har du hittat ett värde som hör hemma i Store
facts. Flytta det dit i stället.

---

## Öppna frågor som bara ägaren kan svara på

De står i SOP-texten märkta **⚠️ OWNER** — sök på ordet i Notion, då får du hela
listan. Sexton stycken 2026-09-21, de tyngsta:

- Vem betalar returfrakten? Basen säger nu **kunden**, som butikens befintliga retur-SOP alltid sagt. Säg till om du vill byta till butiken.
- CaraShells sajt säger "Skickas från Sverige" medan paketen skeppas från utlandet.
- Tull vid dörren i US/GB/CA/AU/NZ — vad ska VA:n säga innan kunden köper?
- Klarna-tvister syns inte i Shopify. Vem loggar in i Klarnas portal, och med vilken deadline?
