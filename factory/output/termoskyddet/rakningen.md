# Räkningen — termoskyddet · 2026-09-16

Annonser räknade ur `act_915422744950975/ads` — aldrig ur `advideos`/`adimages`. Media i kontot är inte en annons.

## SE

```
Källannonser:       16
  rena               2  → ska bli 2 annonser
  bara-copy          1  → ska bli 1 annonser
  kräver-omdubb     12  → ska bli 12 annonser
  slutkortsbygge     1  → ska bli 1 annonser
  okänd              0  → ska INTE laddas upp
  odömd              0  → ska INTE laddas upp
  uteslutna          0  → var och en NAMNGIVEN med vad som krävs
Uppladdade i kontot:   5  ← läst ur Meta, inte ur minnet
```

| Dom | Källa | Ska bli | Uppe | Saknas |
|---|--:|--:|--:|--:|
| `ren` | 2 | 2 | 2 | 0 |
| `bara-copy` | 1 | 1 | 0 | 1 |
| `kräver-omdubb` | 12 | 12 | 3 | 9 |
| `kräver-slutkortsbygge` | 1 | 1 | 0 | 1 |
| `okänd` | 0 | 0 | 0 | 0 |
| `odömd` | 0 | 0 | 0 | 0 |
| **Summa** | **16** | **16** | **5** | **11** |

### Saknas i kontot — 11 st, var och en namngiven

| Annons | Dom | Orsak |
|---|---|---|
| `Termoskydd_CS_3` | kräver-omdubb | VÄNTAR PÅ NYTT MANUS + OMDUBB — samma som CS_1 ('Sista chansen att fixa husbilen innan säsongen… rabatterat pris. Spara i dag… Lagret minskar snabbt… från Bäverbutiken'). ⚠️ Källans TOP SPENDER: 4 430 kr, 21 köp, CPA 211 kr — den viktigaste videon att göra om. |
| `Termoskydd_SP_2` | kräver-omdubb | VÄNTAR PÅ NYTT MANUS + OMDUBB — samma vittnesmål i vi-form ('Efter en sommar med det här skulle vi aldrig åka utan… Vi satte upp… förra sommaren') + 'från Bävebutiken'. Källans tredje bästa (755 kr, 5 köp, CPA 151 kr). |
| `Termoskydd_CS_2` | kräver-omdubb | VÄNTAR PÅ NYTT MANUS + OMDUBB — samma som CS_1 ('Och kvar i lager. Just nu till rabatterat pris… bara i dag… Lagret minskar snabbt… från Bäverbutiken'). Källans näst bästa annons (8 köp, CPA 67 kr). |
| `Termoskydd_SP_2_1` | kräver-slutkortsbygge | VÄNTAR PÅ BILDFIX (kie.ai + bildannonser/text.py) — inbränt direkt på fotot: citat 'Sover mycket bättre nu, helt mörkt och svalt i husbilen!' – 'Verifierad kund, 58 år' (påhittad attribution), '✅ 30 dagars öppet köp' (butiken ger 14 dagars ångerrätt) och en renderingsartefakt 'Knapp: "Beställ nu"' i bild. Nytt citat finns att ta ur Judge.me-underlaget (t.ex. 'Skyddar bra och mörklägger fint.' – Sofia). |
| `Termoskydd_CS_2_1` | bara-copy | VÄNTAR PÅ BILDFIX (kie.ai + bildannonser/text.py) — inbränt direkt på fotot: '40% RABATT – IDAG ENDAST' och röd banderoll 'Få kvar i lager – beställ innan det är slut!'. 40 % stämmer mot jämförpriset (559 av 932), men 'IDAG ENDAST' och lagerlarmet är en kampanj butiken inte kör. Texten sitter på himlen, inte på en platta, så oversatt-bild.py kan inte byta den (analys 2026-09-16: bara fotoytor hittades som 'former'). |
| `Termoskydd_G_1` | kräver-omdubb | VÄNTAR PÅ NYTT MANUS + OMDUBB — G-hooken ('Stort prisfall…') följs av exakt CS-manuset (rabatterat pris bara idag, lagret minskar, beställ innan slut) + 'från Bäverbutiken'. |
| `Termoskydd_CS_1` | kräver-omdubb | VÄNTAR PÅ NYTT MANUS + OMDUBB — talet är en kampanj butiken inte kör: 'Idag stort prisfall', 'rabatterat pris bara idag', 'Lagret minskar snabbt. Beställ nu innan det är slut', och slutar 'från Bäverbutiken'. Samma rader inbrända som captions. Kräver nytt CS-manus (butikens sanna erbjudande: 559 kr, jämförpris 932, fri frakt SE/NO, 14 dagars ångerrätt) + HeyGen-omdubb + omgjorda captions. ⚠️ Källans bästa vinkel: CS bär 31 av källans 40 köp. |
| `Termoskydd_SP_1` | kräver-omdubb | VÄNTAR PÅ NYTT MANUS + OMDUBB — kundvittnesmål i vi-form ('Vi satte upp Termoskydd Husbil förra sommaren… vi sov bättre än på länge') uppläst av någon som inte är kund, + 'från Bäbebutiken'. Butiken har 10 riktiga recensioner (Judge.me-underlaget) — ett nytt SP-manus kan citera dem. |
| `Termoskydd_SP_3` | kräver-omdubb | VÄNTAR PÅ NYTT MANUS + OMDUBB — 'Tusentals husbilsägare har redan bytt till det här' + samma vittnesmål + 'från Bäverbutiken'. Antalet är falskt för butiken. |
| `Termoskydd_G_2` | kräver-omdubb | VÄNTAR PÅ NYTT MANUS + OMDUBB — presenthooken ('presenten som får dem att säga äntligen') är sann, men resten av talet är CS-manuset (rabatterat pris bara i dag, lagret minskar) + 'från Bäverbutiken'. Bara hooken går att behålla. |
| `Termoskydd_G_3` | kräver-omdubb | VÄNTAR PÅ NYTT MANUS + OMDUBB — 'Den bästa julklappen…' + CS-manuset (rabatterat pris, spara i dag, lagret minskar) + 'från Bäverbutiken'. |

---

**DELVIS KLART**
- SE: 11 saknas: Termoskydd_CS_3, Termoskydd_SP_2, Termoskydd_CS_2, Termoskydd_SP_2_1, Termoskydd_CS_2_1, Termoskydd_G_1, Termoskydd_CS_1, Termoskydd_SP_1, Termoskydd_SP_3, Termoskydd_G_2, Termoskydd_G_3.
