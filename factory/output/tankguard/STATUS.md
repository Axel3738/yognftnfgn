# TankGuard — läget efter `/ny-annonser tankguard` 2026-09-09

Den här filen är facit över var butiken står. De andra filerna i mappen är
underlaget: `kallannonser.md` (källorna, fem ytor), `se-copy.md` (mediagrinden och
copy-rundan), `se-annonstexter.md` (den godkända copyn), `brand-detektor.md`
(uppdrag A).

---

## Tillbakaläst ur Meta 2026-09-09 — kampanjen är byggd

Konto **Magiborsten DK `915422744950975`** (SEK).

```
KAMPANJ   TANKGUARD_SE_Tanköverdraget | 2026-09-08
          PAUSED · 1 000 kr/dag (daily_budget 100000) · 0 kr spend · CBO

ADSETS    6 st, alla PAUSED, alla pixel 2196132151319625, alla geo ["SE"],
          ingen med egen budget (CBO håller ihop)
          BOF · CO · CS · GT · PD · SP

ANNONSER  10 st, alla PAUSED
          PD  ×5   PD_Extra (video) · PD_2_1 · PD_3_1 · PD_4_1 · PD_5_1
          BOF ×3   BOF_3_1 · BOF_4_1 · BOF_5_1
          CO  ×1   CO_1_1
          GT  ×1   GT_2_1
```

**Trippelkollen, 2026-09-09:**
1. **Struktur** — kampanj, sex adsets: rätt pixel, rätt geo, PAUSED, CBO. 0 fel.
2. **Annonserna** — 10 av 10 med rätt sida `1399193996606775` och rätt länk
   `https://tankguard.se/products/tankoverdraget`. 0 fel.
3. **Texten** — titel och description jämförda ord för ord mot den godkända copyn
   på alla tio. Noll träffar på förbjudna påståenden (jämförpris, rabatt på
   enstyck, frakt, betalsätt, öppet köp, socialt bevis, påhittad brådska,
   butiksnamn). 0 fel.

⚠️ Metas egen förhandsvisning ligger bakom inloggning — `previews`-endpointen ger
bara en signerad iframe-URL. Den fjärde kontrollen, hur annonsen ser ut för
kunden, görs i Ads Manager av den som sätter kampanjen ACTIVE.

**Sidrollen löstes 2026-09-09.** Axel gav full tillgång till TankGuard-sidan och
alla tio annonserna gick igenom direkt.

**De tio är de rena creativesen.** De 24 smutsiga ligger kvar utanför kampanjen
tills mediat är omgjort — se mediagrinden nedan.

Sida `1399193996606775` (TankGuard) och pixel `2196132151319625` är butikens egna
och verifierade. Kontot bär även Bäverbutikens danska kampanjer och deras pixel
`1554276343018184` — därför filtreras allt på prefixet `TANKGUARD_`.

**Kampanjen döptes om** från `TANKGUARD_Tanköverdraget SE | BE-ROAS 1,62 |
2026-09-08`. Det gamla namnet bar ett break-even-tal som stämmer med varken 1,46
(utan moms) eller 2,07 (med moms) — ett falskt tal i kampanjnamnet styr varje
framtida skalningsrunda fel.

**CO och BOF skapades av den här körningen**, klonade ur ett syskonadset och födda
PAUSED. Kampanjen har nu sex adsets mot källans sju (RV saknas — de annonserna
hålls, se nedan).

---

## Sidrollen — löst, men kontrollen ska återanvändas

Kampanjen stod färdig i ett dygn utan en enda annons. Orsaken var inte kontot,
inte pixeln och inte sidan i sig:

```
BIZ/client_pages   → ser businessen sidan?        TankGuard: JA
BIZ/owned_pages    → äger businessen sidan?       TankGuard: NEJ
me/accounts        → har ANVÄNDAREN roll på den?  TankGuard: NEJ  ← den som avgör
```

HeimGuards sida ligger i `owned_pages` med full roll och fungerade därför direkt.
TankGuards låg bara i `client_pages`, och `me/accounts` listade den inte alls —
40 sidor, ingen av dem TankGuard. Varje `adcreatives`-anrop svarade
`(#200) Application does not have permission for this action`.

**Kör `me/accounts`-kontrollen på varje ny OPS-butik innan media laddas upp.**
En ny OPS-sida är inte klar när den existerar — den är klar när `me/accounts`
listar den. Lägg in det som ett eget steg i `/ny-ops`.

Bygget körs med `node factory/bygg-tankguard.mjs`. Skriptet är idempotent och
hoppar över kampanjnamn, adsets och annonser som redan finns.

---

## Klart och kvitterat

| Vad | Läge |
|---|---|
| Källorna lästa, SE + NO | ✅ 34 + 33 annonser, alla ACTIVE |
| Brand-detektor, fem ytor | ✅ SE komplett · NO: ytor 1, 2 och 5 (3 och 4 olästa, `ffmpeg`/OCR saknas i containern) |
| Mediagrinden | ✅ 10 rena creatives av 34 |
| Media uppladdat i målkontot | ✅ 9 bilder + 1 video, nya hashar och video-id |
| Copy | ✅ 19 block: 7 redan rena, 9 omskrivna, 3 hålls |
| Kampanj + adsets | ✅ 1 kampanj, 6 adsets, allt PAUSED och tillbakaläst |
| Annonser | ✅ 10 st, alla PAUSED, trippelkollade |
| Norsk kampanj | ⛔ inte byggd — inga NOK-nivåer och ingen norsk länk |

---

## Vad som väntar, i ordning

1. **VA:n granskar och sätter ACTIVE.** Öppna Ads Manager, kontrollera att länken
   går till TankGuards produktsida, att pixeln är butikens egen och att budgeten
   stämmer. Sätt sedan kampanjen ACTIVE.
2. **De 24 smutsiga creativesen.** 11 bilder städas gratis med
   `pipeline/oversatt-bild.py`; 11 videor kräver omdubb (HeyGen har 16 951
   krediter) plus ett ord bytt i undertexten med `pipeline/no-precis.py`;
   2 slutkort byggs om med `lager.py` — ordmärke, bäversymbol, "10 recensioner"
   och prisparet "636 kr 489 kr" → "489 kr".
   ⚠️ Röstkontrollen är obligatorisk på varje renderad video (CLAUDE.md järnregel 3).
3. **SP-blockets text.** Omklassad från HÅLL till OMSKRIVNING, men inte skriven.
   Fyra fragment ska bytas — och citattecknen kring hooken ska bort tillsammans
   med stjärnorna, annars är det ett vittnesmål utan vittne.
4. **Egna recensioner.** Tio annonser (fyra RV, fyra SP, två slutkort) väntar på
   att butiken får riktiga recensioner. `tools/judgeme-import.mjs`.
5. **Norska halvan.** Kräver NOK-paketnivåer och en norsk produktlänk.

---

## Öppna beslut som är ägarens

1. **Momsfrågan.** Break-even är 1,46 utan moms och 2,07 med moms i priset —
   42 % isär. `factory/butiker/tankguard.yaml` finns inte, och den är det som
   svarar. Ingen annons får dömas förrän frågan är avgjord.
2. **Jämförtalet.** Annonserna säger "2 för 799 kr, spara 18 %" räknat mot
   978 kr. Produktsidan visar överstruket 1 376 kr (= 978 + bonusens 398 kr).
   Ska annonsen följa sidan eller sidan följa annonsen?
3. **Bonusen i kassan.** Fyra annonser lovar gratis Kranskydd Frost 420D. Ingen
   har kontrollerat att den faktiskt hamnar i korgen. En utlovad gratisprodukt
   som inte dyker upp i checkout är värre än något jämförpris.
