# Flerproduktsbutik — vad som krävs, och den fälla som inte syns

> ## ⚠️ Läget 2026-09-11 — tabellen "det som måste byggas" är delvis inaktuell
>
> AdventLane gick den här dagen från en kalender till tolv, och då byggdes
> fyra av de fem punkterna. Läs uppdateringen här innan du tror på tabellen:
>
> | # | Vad | Läge |
> |---|---|---|
> | 1 | `ops.mjs` tar flera produktfiler | ✅ **finns** — `for (const steg of STEG) { if (steg.niva === 'produkt') for (const pk of ctx.produkter) … }` (ops.mjs, huvudflödet). Butikssteg körs en gång, produktsteg per produkt. |
> | 2 | Startsidesteg som skriver `templates/index.json` | ✅ **finns** — `startsida.mjs`, och `sortiment` pekar på butikens egen kollektion. Bas-zip:ens Matstrumpor-värden är borta. |
> | 3 | `meny`-steget: en länk per produkt | ✅ **finns — men regeln är omvänd sedan 2026-09-11.** En meny med tolv produktrader är ingen meny. `produkt.i_meny` styr: nämner någon produktfil flaggan gäller bara de som står `true`, annars alla som förr. Kollektionsraden avgörs alltid av HELA sortimentet. |
> | 4 | `kontroll.mjs` blir butikskontroll + produktkontroll | ✅ **finns** — QA körs butiken en gång och varje produkt för sig. |
> | 5 | Korg-upsellen blir korgmedveten | ⬜ **kvar** — fortfarande en hårdkodad handle. |
>
> **Nytt sedan dess: gåvoguiden** (`sections/ms-gavoguide.liquid` +
> `factory/gavoguide.mjs`). Med tolv produkter är kundens problem inte att
> hitta butiken utan att välja i den. Guiden frågar om MOTTAGAREN och svarar
> med en produkt ur kollektionen, matchad på produktens metafält `opf.quiz`.
> En ny produkt med det fältet är med utan kodändring — och två av reglerna
> är spärrar, inte poäng: alkoholtema når aldrig barn, smådelar aldrig den
> som svarat "under tre år". De testas i `factory/test/gavoguide.test.mjs`.
>
> **Fällan i avsnittet "annonsdatan" nedan gäller fortfarande fullt ut.**
> `creative_prefix` står nu per produkt i AdventLane, men den delade pixeln
> är oförändrad: tolv kalendrar mellan 349 och 549 kr har tolv olika
> break-even, och Metas Purchase-event bär ingen produkt. Läs köp per produkt
> ur Shopify, aldrig ur pixeln.


**Frågan (Axel 2026-09-09):** vissa produkter med samma målgrupp ska dela en
OPS-butik. Första fallet: Fiskespöhållaren + Fiskekalendern.

**Svaret:** butiksbygget är billigt — ungefär en dags arbete. Annonsdatan är
det som kostar, och den kostar på ett sätt som inte syns som ett fel.

Kartlagt 2026-09-09 med tre parallella granskare över `factory/`, annonsflödet
och strategilagret.

---

## Det goda: fabriken är redan nästan där

Fabriken är inte en enproduktsmotor. Den är en **butiksmotor med ett
enproduktsomslag**:

- `butik.mjs` delar redan butik från produkt (`sammanfoga(butik, produkt)`).
- **Sju av nio steg** i `ops.mjs` rör bara butiken — bara `produkt`,
  `metafalt` och `recensioner` är produktspecifika.
- Produktsidan är redan produktneutral: alla opf-sektioner läser
  `product.metafields.opf.*` och döljer sig själva när fältet saknas.
  **En `product.json` fungerar redan för N produkter.**
- Paketnivåerna är redan produktbundna i Liquid
  (`ms-paket.liquid`: `if niva.produkt.value.id == p.id`).
- `state.mjs` nycklar redan på paret butik+produkt.
- Startsidemallen har redan en flerproduktssektion (`sortiment` =
  featured-collection) som ingen använder.

## Det som måste byggas

| # | Vad | Svårighet |
|---|---|---|
| 1 | `ops.mjs` tar flera produktfiler: dela `STEG` i `BUTIKSSTEG` (körs en gång) och `PRODUKTSTEG` (loopas) | medel |
| 2 | Ett **startsidesteg** som skriver `templates/index.json` ur konfigen | medel |
| 3 | `meny`-steget skriver även `main-menu` — en länk per produkt | lätt |
| 4 | `kontroll.mjs` blir butikskontroll + produktkontroll per produkt | medel |
| 5 | Korg-upsellen blir korgmedveten i stället för en hårdkodad handle | medel |

⚠️ **Punkt 2 är en bugg redan i dag, inte bara en flerproduktsfråga.**
Bas-zip:ens `templates/index.json` bär källbutikens värden:
`produkt.product = "sushi-strumpor"`, `sortiment.collection = "strumporna"`.
Ingen kod rör filen — varje ny OPS-butik startar med en startsida som pekar på
Matstrumpors produkt tills en människa rättar den för hand.

⚠️ **Punkt 4 är samma bakläxa som TankGuard gav 2026-09-08.** QA kan bli grön
medan produkt 2 är DRAFT eller saknar bilder, och `--launch` publicerar bara
EN produkt. En tvåproduktsbutik kan gå live med halva sortimentet i 404.

---

## Fällan: annonsdatan

Två fynd som båda gör beslut systematiskt fel utan att synas som fel.

### 1. `creative_prefix` står på BRANDET, inte produkten

I dag: `creative_prefix: "TankGuard"` respektive `"HeimGuard"`. Det håller så
länge butiken bär en produkt.

Men prefixet är det **enda** fyra system använder för att skilja produkter åt:
prefixkartan (`leveranskon.mjs`), översättningskön (`oversattningskon.mjs`),
adsetuppslaget (`notion-till-meta.mjs`) och commission (`koppling.mjs`).

**Regeln som ska gälla:** en butik = ett brand = en pixel — men **en kampanj
och ett prefix PER PRODUKT**. Brandet hör hemma i kampanjnamnet
(`FISKE_RODHOLDER_…`, `FISKE_KALENDER_…`), prefixet i produkten.

Sätts prefixet per brand får man tysta fel i fyra system samtidigt.

### 2. Den delade pixeln gör kill- och skalningsbeslut fel

Pixeln är per butik, och **Metas Purchase-event bär ingen produkt**.

Två fiskeprodukter har helt olika break-even — en spöhållare och en kalender
ligger inte i närheten av varandra i pris. När båda köpen räknas mot samma
pixel subventionerar den billiga produktens köpvolym den dyra produktens
annonser i siffrorna. CPA ser bra ut. ROAS ser bra ut.

Och `docs/os/ANALYSMETOD.md` rangordnar på vinstbidrag
`(break-even-CPA − CPA) × köp` — med ett break-even-tal som inte gäller för
hälften av köpen. Ingen kod i repot delar upp köp per produkt, så felet är
osynligt tills lönsamheten är borta.

Det är samma felmönster som fel pixel: det syns inte som ett felmeddelande,
bara som konstig data.

**Motmedel innan en flerproduktsbutik launchas:**
- Egen kampanj per produkt (aldrig gemensam) — då kan spend delas upp.
- Läs köp per produkt ur **Shopify**, inte ur pixeln, när CPA räknas.
- Skriv break-even per produkt i produktfilen, aldrig ett butiksgemensamt tal.

---

## Rekommendation

**Bygg fiskebutiken — men i den här ordningen:**

1. Fixa startsidesteget (punkt 2) — det är en bugg som drabbar varje butik nu.
2. Flytta `creative_prefix` till produktnivå, i alla butiker.
3. Bygg produktloopen i `ops.mjs` + menyn + QA per produkt (punkt 1, 3, 4).
4. Först därefter: två produkter i en butik, med egen kampanj per produkt.

**Alternativet om det ska gå snabbt:** bygg fiskebutiken som en huvudprodukt
plus tillbehör i stället för två jämlika produkter. Fabriken klarar det redan
(Q4-bonusen är ju en andra produkt i butiken), och pixelfällan uteblir
eftersom bara en produkt annonseras. Nackdelen är att den andra produkten
aldrig får egen annonsering med full kraft.
