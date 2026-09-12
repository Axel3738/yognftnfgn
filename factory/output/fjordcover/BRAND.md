# FjordCover — brandunderlag

Skrivet 2026-09-12 i `/ny-ops`-körningen mot butiken `j0p8qz-kp.myshopify.com`
(butiksadressen stod i prompten och är facit; steg 0 svarade
`Connected: j0p8qz-kp.myshopify.com ✓`, butiksnamn "My Store 4", SEK, noll
produkter, tema Horizon, appen "Factory" med alla 16 krävda scopes).

Källa: `baverbutiken.se/products/batmotorskydd-420d-heltackande-for-utombordare`
(produkt-id 16443175731549). Allt nedan är läst ur källan, kontot eller
bilderna — ingenting är påhittat.

---

## 1. Produkten, som den faktiskt är

Ett heltäckande skydd för utombordsmotorn i 420D Oxford-tyg. Dras över hela
motorn, från kåpan ner över riggen, och spänns med en rem runt midjan.
Nio storlekar: 0–5, 6–15, 15–20, 20–30, 30–60, 60–100, 100–150, 175–225 och
250–350 hk. 579 kr (jämförpris 965 kr).

**Bilderna är facit** (fyra stycken, lästa 2026-09-12):

| Bild | Vad den visar | Inbränd text |
|---|---|---|
| `batmotorskydd-svart.jpg` | Produktbild på vit botten: svart skydd med två spännband, brett upptill, insvängd midja, utskjutande fot | Ingen |
| `batmotor-pa-bat.jpg` | Två motorer på en båt vid uppställningsplatsen — en täckt, en oskyddad Mercury 150 | Ingen |
| `batmotor-tabell-sv.jpg` | Storleksguide: omkrets och höjd per motorstorlek | **JA — svensk.** "Storleksguide – utombordarskydd", "Motor / Omkrets / Höjd", "Omkrets mäts runt motorkåpan." |
| `batmotorskydd-vinter-tackt.jpg` | Aluminiumbåt på trailer i höstväder, motorn under skyddet, grus och björklöv | Ingen |

⚠️ Storleksguiden bär svensk text och kan därför inte visas rå på `/nb`.
Den märks `[SV]` i produktfilen, precis som CatCabins infografik.
⚠️ Tabellen listar **sju** rader (6–15 t.o.m. 175–225) medan butiken säljer
**nio** storlekar. 0–5 och 250–350 saknas i guiden — det påstås inget om
deras mått.

**Okänt och därför aldrig påstått:** vikt, fodrets material, om skyddet är
vattentätt (källan säger "håller väder och smuts ute", inte vattentätt),
UV-klass, om det tål körning/transport med skyddet på, färgalternativ
utöver svart.

## 2. Vem köper

Båtägare med utombordare i Sverige och Norge, 35–70 år. Har en jolle,
styrpulpetbåt eller mindre fritidsbåt som tas upp på hösten och står på
trailer, i sjöbod eller på uppställningsplats till våren. Många har inte
garage — båten står ute, synlig från vägen. Talar om "uppläggning",
"vinterförvaring", "torrsättning", "riggen", "kåpan", "hk".

Sekundärt: den som har båten i sjön hela säsongen och vill hålla motorn ren
mellan turerna.

## 3. Problemet och emotionen

Två problem, och kontot visar att **båda** säljer:

1. **Vädret.** Sex månader med regn, snö, frost och UV på en oskyddad motor.
2. **Tjuven.** En blank motor på en upplagd båt är det första som syns från
   vägen. Källan säger det rakt ut: "en övertäckt motor är ett betydligt
   tråkigare byte än en öppen."

Emotionen är inte rädsla utan **avslut**: att göra klart det sista innan man
lämnar båten för säsongen. Motorn är dyraste delen av båten och den enda man
inte kan låsa in.

## 4. Vad kontot faktiskt bevisat (MagiBorsten `1867947880635861`)

Kampanj `120250009325850291` — "Båtmotorskyddet 420D | BE ROAS 1.62 |
Launch 2026-08-29", ACTIVE. Avläst 2026-09-12: **20 078 kr spend, 83 köp,
46 annonser**, annonsprefix `Batmotor_`.

Break-even-CPA = 579 − 222 = **357 kr**. Rangordnat på vinstbidrag
`(BE-CPA − CPA) × köp` (ANALYSMETOD.md — aldrig på ROAS eller CPA ensamt),
bara annonser över 300 kr spend / 3 köp får dömas:

| Annons | Spend | Köp | CPA | ROAS | Vinstbidrag |
|---|---|---|---|---|---|
| `Batmotor_SP_1_H1` | 2 410 kr | 16 | 151 kr | 4,35 | **≈ 3 300 kr** |
| `Batmotor_CS_2_1` | 2 874 kr | 16 | 180 kr | 3,43 | ≈ 2 830 kr |
| `Batmotor_BF_3_1` | 1 960 kr | 10 | 196 kr | 3,05 | ≈ 1 610 kr |
| `Batmotor_FM_1_H1` | 792 kr | 5 | 158 kr | 3,36 | ≈ 995 kr |
| `Batmotor_SP_1_H3` (top spender) | 4 919 kr | 16 | 307 kr | 2,28 | ≈ 800 kr |
| `Batmotor_RV_1_H1` | 643 kr | 4 | 161 kr | 3,60 | ≈ 784 kr |

`Batmotor_SP_1_H2` (1 116 kr, 2 köp, ROAS 0,83) och `Batmotor_PD_1_H3`
(968 kr, 2 köp, ROAS 1,20) ligger UNDER break-even — samma copy som H1/H3,
alltså är det hooken som skiljer, inte texten.

Vinnarens text, ordagrant ur kontot (`SP_1_H1` = `SP_1_H3`):

> "En motor som håller längre / Så många svenska båtägare har redan bytt till
> det här skyddet. ⛵ Fiskare, skärgårdsbor och fritidsbåtsägare litar på
> Båtmotorskydd 420D …"

**Slutsats för brandet:** den vinnande vinkeln är inte tekniken utan
**tillhörigheten** — "det här är vad båtfolk gör med motorn på hösten".
Näst starkast är erbjudandet (CS) och passformen/storleksguiden (BF: "0–350 hk.
En skyddar din."). Recensionsvinkeln (RV) fungerar på liten spend.

⚠️ `Batmotor_CS_2_1` är "40% RABATT – ENDAST IDAG". Priset 579/965 = 40 % är
sant även här, men **tidsbegränsningen är det inte** — FjordCover har ingen
`erbjudande.tidsbegransat`-flagga satt, till skillnad från CatCabin. Källans
CS-annonser måste skrivas om innan de får köras i den här butiken.

Norge: `Magiborsten NO` `act_1050615...`/`act_1050941584152547`, kampanj
`120252047563660233` "Båtmotortrekk NO | BE-ROAS 1,63 | 2026-09-02" (PAUSED,
47 annonser, prefix `Batmotortrekk_NO_`).

## 5. Recensioner

8 stycken i källans Judge.me, alla 5 stjärnor (snitt 5,00). Namn, titlar och
texter lästa ur produktsidans server-renderade widget 2026-09-12 och sparade i
`factory/output/batmotorskyddet/kalla-recensioner.json`.

⚠️ Alla åtta har `datetime` 2026-08-29 mellan 08:38:43 och 08:38:52 UTC —
källan API-importerade dem inom nio sekunder. Det är källans originaldatum,
inget kunddatum, och inget hittas på. `reviews_for_widget` svarade 404 för den
här produkten (mätt 2026-09-12, båda domänformerna) — HTML:en var enda vägen.

## 6. Namnet

**FjordCover.** Regeln (Axel 2026-09-07): funkar på svenska OCH engelska,
aldrig å/ä/ö. "Fjord" läses likadant i Sverige, Norge och på engelska och
placerar brandet i båtlandet; "Cover" är det källan säljer och det kunden
söker. Brandet bär **kategorin** — skydd för båten när den inte är i sjön —
inte just det här motorskyddet, så nästa produkt (kapell, batterifrånskiljare,
motorlås) blir bara en produktfil till.

RDAP via rdap.org 2026-09-12: `fjordcover.se` 404 och `fjordcover.no` 404
(bägge lediga), och ingen A-post i DNS för någondera.
Bortvalda av samma kontroll: `fjordgear`, `nordcover`, `sterncover` — lediga
de med, men "Gear" riskerar att läsas fel av svenskar och "Nord"/"Stern" säger
inget om vad butiken gör.

## 7. Paletten och känslan

Bilderna sätter tonen: grå oktoberhimmel, grus, björklöv, aluminium och ett
svart tygskydd. Inget hav i solsken. Paletten är därför **skiffergrå-blå**
(vatten i november) med **EN varm signalorange** accent — sjöräddningens och
flytvästens färg, och samma orange som källans egen storleksguide.

De fem första OPS-butikerna är mörkblå eller mörkgröna, CatCabin är varm
beige. Skiffergrått med orange är nytt i familjen och är dessutom sant mot
produktbilderna.

|  | Värde | Varför |
|---|---|---|
| `mork` | `#1B2A33` | Vattnet och himlen på trailerbilden. Header, sidfot, logga. |
| `yta` | `#F1F4F5` | Kall ljusgrå — dimman, aluminiumbåten. |
| `accent` | `#E0620F` | Signalorange. Sjösäkerhetens färg, källans egen guidefärg. Enda färgen som ropar. |
| `god` | `#2E7D5B` | Bocken i trust-raderna. |

Typografi: **Oswald SemiBold** i rubriker — smal, rak, skyltmässig, samma
känsla som text på en uppställningsplats eller en marinabod; **Lato Regular**
i brödtext för långa spec- och villkorsstycken. Ingen av dem används av någon
annan OPS-butik.

Tonalitet: kort, konkret, säsongsbunden. Skriv om hösten, uppläggningen och
motorn — inte om tygets förträfflighet. Inga utropstecken, ingen nedräkning.

## 8. Loggan

Nytt motiv `motor` i `factory/logga-generera.mjs`: produktbildens egen
silhuett — bred rundad kåpa, insvängd midja, utskjutande fot — med
spännremmen och spännet i orange tvärs över midjan. Remmen är det enda kunden
gör: dra över, spänn fast.

`factory/LOGGA-FEEDBACK.md` sa före genereringen: **a 0, b 0, c 3**.
Regeln är att en variant som aldrig valts ska bytas mot något nytt, inte
visas igen. Därför är a och b omgjorda i den här körningen (bara när brandet
har ett eget motiv — droppen och de fem butiker som redan står i produktion
ritas oförändrat):

- **a — band:** motivet stort på mörk disk, ordmärket på ett massivt
  orange band tvärs över nederdelen. (Var: litet motiv + spärrat ordmärke + tagline.)
- **b — badge:** ljus disk med mörk ring, motivet i mitten, ordmärket böjt
  längs ringens nederkant. (Var: ordet delat på två rader.)
- **c — motivet stort, ordmärket litet under en tunn linje.** Oförändrad;
  det är den som vunnit tre gånger.

## 9. Bonusprodukten (Q4-ramverket)

**Batterifrånskiljare 12/24V, 189 kr** — `baverbutiken.se/products/
batterifranskiljare-huvudstrombrytare-12-24v`, taggad "Båt", jämförpris
236,25 kr, SKU `TEMU-605778442314132`.

Källans egen första mening är exakt vårt scenario: "Står bilen, båten eller
husbilen oanvänd en längre tid laddas batteriet lätt ur." Det är samma
uppläggningskväll som motorskyddet — man drar över skyddet och vrider av
strömmen. Gratis i paketnivåerna, betald kryssruta i varukorgen på nivå 1.
