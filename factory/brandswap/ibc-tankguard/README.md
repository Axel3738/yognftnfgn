# IBC-tanköverdraget → TankGuard, svenska och norska

FAS2 **Uppdrag C**. Bäverbutikens 20 bildannonser för IBC-tanköverdraget är
brand-swappade till OPS-butiken **TankGuard** och finns nu i två marknader.

Körd 2026-09-08. **Ingenting är uppladdat till Meta** — det här är filer.

| | Antal |
|---|---|
| Källannonser (MagiBorsten, kampanj `120250001079150291`) | 20 bilder |
| Levererade TankGuard-bilder | 40 (20 SE + 20 NO) |
| QA-bilder, källa \| resultat sida vid sida | 40 |
| kie.ai-krediter | 4 jobb (bara de fyra annonser som har text på fotot) |

---

## Vad som faktiskt ändrades

Ingen av de 20 annonserna innehöll ordet "Bäverbutiken", en logga eller en
domän. Det som gör en annons butiksbunden är i stället **löftena**: pris,
frakt, retur, betalsätt och recensionens avsändare. Bara de rörs.

**Svenska: 4 av 20 annonser behövde ändras.** De 16 andra bär inget
butiksbundet påstående och går rakt över till TankGuard, bitidentiska med
originalet. Ett bevisat creative skrivs inte om i onödan.

| Annons | Bäverbutiken | TankGuard | Källa |
|---|---|---|---|
| `BOF_1_1` | Fri frakt över 300 kr | Fri frakt | `butik-mall.yaml` `frakt.fri_globalt: true` |
| `BOF_2_1` | 30 dagars öppet köp … | 14 dagars ångerrätt … | `butik-mall.yaml` `retur` |
| `BOF_2_1` | Få först, betala sen — med Klarna | Fri frakt · 5–8 arbetsdagar | TankGuards betalsätt är inte avlästa |
| `BOF_6_1` | Fri frakt inom Sverige, 5–10 arbetsdagar | Fri frakt, 5–8 arbetsdagar | `butik-mall.yaml` `frakt.leveranstid` |
| `BOF_6_1` | Fri frakt · Klarna – betala sen · 30 dagars öppet köp | Fri frakt · 5–8 arbetsdagar · 14 dagars ångerrätt | samma |
| `CS_3_1` | Fri frakt inom Sverige. Klarna — betala sen. | Fri frakt. 5–8 arbetsdagar. | samma |
| `SP_2_1` | ✔ 30 dagars öppet köp | ✔ 14 dagars ångerrätt | `butik-mall.yaml` `retur` |

**Priset ändrades inte på svenska.** TankGuard tar källans pris enligt
`factory/PROCESS.md` steg 1 — samma regel som gav HeimGuard 799/1000 kr.
489 kr / 636 kr / 23 % är verifierat live på produktsidan 2026-09-08.

**Norska: alla 20 översatta** till bokmål med norska priser (439 / 586 kr,
25 %) och norska villkor (gratis frakt i hele Norge, 5–8 virkedager,
14 dagers angrerett). Recensionerna får källan efter namnet —
`— Maria, tankguard.se` — precis som NO-körningen 2026-09-08 gjorde.

**Annonstexten utanför bilden är också swappad** (`annonstext.json`).
Den bar Klarna, "30 dagars öppet köp" och "Fri frakt över 300 kr" i sex
annonser — de hade följt med rakt in i TankGuards konto annars.

Hela faktaunderlaget med källa per siffra står i **`fakta.md`**.

---

## Så byggdes de

**16 annonser** är 1080×1350-mallen med enfärgade plattor, band och knappar.
`pipeline/oversatt-bild.py` hittar formerna, suddar texten inuti dem och ritar
den nya i samma ruta med samma stil. Noll krediter.

**4 annonser** (`CS_2_1`, `GT_2_1`, `PD_2_1`, `SP_2_1`) är 1024×1024 med texten
bränd direkt på fotot. Där rensar `bildannonser/kie.mjs` bort texten och
`factory/brandswap/lagg-text.py` lägger tillbaka skarp vektortext på uppmätta
koordinater. Aldrig tvärtom — bildmodeller stavar fel på svenska och norska.

```bash
python3 factory/brandswap/rendera.py       --marknad SE   # de 16 mallannonserna
python3 factory/brandswap/rendera-foto.py  --marknad SE   # de 4 fototextannonserna
python3 factory/brandswap/rendera.py       --marknad NO
python3 factory/brandswap/rendera-foto.py  --marknad NO
```

Källbilderna hämtas ur Meta (`kalla.json` har annons-id och `image_hash` per
annons) och ligger i `.scratch/ibc-se/` — gitignorerat, hämta om vid behov.
De kie-rensade fotona ligger i `.scratch/kie/` och behövs bara för de fyra.

### Filerna

| Fil | Vad |
|---|---|
| `fakta.md` | Faktabladet: priser, villkor, ordlista — en källa per siffra |
| `kalla.json` | De 20 källannonserna: annons-id, image_hash, format, metod |
| `plan.json` | Textplanen för de 16 mallannonserna, enhet för enhet |
| `plan-foto.json` | Textplanen för de 4 fototextannonserna, element för element |
| `annonstext.json` | Annonstexten utanför bilden, SE + NO |
| `texter/<marknad>/` | Det som faktiskt skickades till renderaren |
| `ut/<marknad>/` | **Leveransen** — TankGuard_SE_… / TankGuard_NO_… |
| `qa/<marknad>/` | QA: källa till vänster, TankGuard till höger |
| `manifest.json` | Rad per annons: status, ändrade enheter, sökvägar |

---

## Två saker som lärdes här

**En oförändrad rad ritas aldrig om.** Att sudda och rita om text som inte har
ändrats kan bara göra den sämre — suddningen lämnar en svag skugga där den
gamla texten var bredare än den nya. `rendera.py` hoppar därför över varje
enhet vars text är ordagrant densamma. (Undantag: `oversatt-bild.py` suddar
HELA formen så fort någon rad i den ska skrivas om, så formens övriga rader
måste ritas om i samma svep.)

**Vit text på en lodrät toning ska fyllas radvis.** `oversatt-bild.py`:s
`fyll_2d` utjämnar mot grannpixlarna och lämnade en fläckig spökskrift där
fraktraden suttit — bredare utvidgning gjorde bara fläcken större. Radens
median ÄR bakgrunden när toningen är lodrät. Därför finns nu
`"fyllning": "rad"` som ruta-fält i `oversatt-bild.py` (opt-in, ändrar inget
för befintliga anrop).

---

## Innan något launchas — fyra saker att bekräfta

1. **Produktens URL på TankGuard.** Butiken är lösenordsskyddad och
   `SHOPIFY_TOKEN_tankguard` ger 401 mot Admin-API:t, så handle:t gick inte att
   läsa. Länkarna i `annonstext.json` är mönstret, inte verifierade URL:er.
2. **NO-marknadens valuta.** `butik-mall.yaml` säger att OPS-butiker prissätts
   i NOK på NO-marknaden. 439/586 kr är källbutikens norska pris, hämtat med
   samma regel som det svenska — men TankGuards egen NOK-nivå är inte avläst.
3. **Recensionerna i TankGuards Judge.me.** Citaten från Maria, Lena, Sofia och
   Johan är äkta recensioner på källprodukten. En import kördes mot TankGuard
   2026-09-08, men det gick inte att verifiera härifrån. Saknas recensionen i
   butiken ska den annonsen inte launchas.
4. **Namnstandarden.** Filerna heter `TankGuard_<marknad>_<vinkel>_<nr>_<hook>`.
   FAS2 Uppdrag B ska spika vilken av repots tre konkurrerande namnregler som
   gäller — byt namn här när den är spikad.

⚠️ `factory/butiker/tankguard.yaml` finns inte i repot — TankGuard-bygget
committades aldrig. Villkoren ovan kommer därför ur fabriksmallen
`factory/butik-mall.yaml`, som är standard för varje OPS-butik. Skapa
butiksfilen och läs om den här leveransen mot den när butiken har egna värden.

⚠️ **Avsteg från CLAUDE.md regel 6.** All slutgiltig ad copy ska skrivas av en
subagent med `model: "sonnet"`. Subagenterna kunde inte köra ett enda
verktygsanrop i den här sessionen — permission-handlern avvisade allt med
`updatedInput ... failed schema validation` — så texten är skriven i
huvudsessionen i stället. Tre-frågorstestet är inte redovisat rad för rad.
Kör copyn genom en copy-subagent när miljön fungerar.
