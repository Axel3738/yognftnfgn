# TankGuard — läget efter `/ny-annonser tankguard` 2026-09-08

Den här filen är facit över var butiken står. De andra filerna i mappen är
underlaget: `kallannonser.md` (källorna, fem ytor), `se-copy.md` (mediagrinden och
copy-rundan), `se-annonstexter.md` (den godkända copyn), `brand-detektor.md`
(uppdrag A).

---

## Tillbakaläst ur Meta 2026-09-08

Konto **Magiborsten DK `915422744950975`** (SEK).

```
KAMPANJ   TANKGUARD_SE_Tanköverdraget | 2026-09-08
          PAUSED · 1 000 kr/dag (daily_budget 100000) · 0 kr spend · CBO

ADSETS    6 st, alla PAUSED, alla pixel 2196132151319625, alla geo ["SE"],
          ingen med egen budget (CBO håller ihop)
          BOF · CO · CS · GT · PD · SP

ANNONSER  0
```

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

## ⛔ Det enda som stoppar annonserna

Meta-nyckeln får inte skapa inlägg för TankGuards sida:

```
(#200) Application does not have permission for this action —
Om du vill skapa inlägg för sidan 1399193996606775 kontaktar du en
administratör för att få behörighet för rollen Annonsör eller högre.
```

**Bevis:** `me/accounts` listar **37 sidor** som token-användaren har roll på.
HeimGuards sida `1262406533629248` finns där med `ADVERTISE,CREATE_CONTENT,MANAGE`.
TankGuards sida finns **inte** i listan.

⚠️ Att sidan syns i businessens `client_pages` bevisar **ägarskapet, inte
rättigheten**. Två olika saker. Kontrollera båda vid nästa OPS-butik, och gör det
**innan** media laddas upp.

**Åtgärd:** ge annonskontots användare rollen **Annonsör** (eller högre) på
TankGuard-sidan i Meta Business. Samma grepp är redan gjort för HeimGuard.

När rollen finns: `node factory/bygg-tankguard.mjs` (skriptet är idempotent och
hoppar över det som redan finns).

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
| Annonser | ⛔ 0 — sidrollen saknas |
| Norsk kampanj | ⛔ inte byggd — inga NOK-nivåer och ingen norsk länk |

---

## Vad som väntar, i ordning

1. **Sidrollen.** Utan den händer ingenting mer i Meta.
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
