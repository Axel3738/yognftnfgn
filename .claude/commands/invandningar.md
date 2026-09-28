# /invandningar – "Innan du köper" (listicle): en sida som svarar på marknadens invändningar, med hela prislistan

Argument: `$ARGUMENTS` — länken till produktsidan (Bäverbutikens eller
OPS-butikens egen, t.ex. `https://carashell.se/products/takskyddet`),
valfritt `5` (fem punkter; standard är **sju**), `--butik <id>`, `--torr`,
`--igen <plats>`, `--brand baverbutiken` (bara om Axel ber om det),
**`--marknad <KOD> --egen-sida`** (en EGEN sida på marknaden, t.ex. USA —
se nedan), `--handle <x>` (sidans adress; på en marknad: skriv en engelsk).

```
/invandningar https://carashell.se/products/takskyddet --butik carashell --marknad US --egen-sida --handle rv-roof-cover-before-you-buy
/invandningar https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan --torr
```

**Syskon till `/lagerrensning`.** Samma mall, samma motor
(`listicle/bygg.mjs --koncept invandningar`), samma leverans: sidan läggs
upp direkt i butiken utan header/footer/meny, som `/pages/<slug>-innan-du-koper`
(svenska) eller `/pages/<handle>` med `--handle` på en marknad (engelska:
suffixet `before-you-buy`). **Järnreglerna 2–7, läsbarhetstestet och stegen
0–1 och 4–8 är identiska med `/lagerrensning` — läs
`.claude/commands/lagerrensning.md` FÖRST och följ den, med `--koncept
invandningar` i varje `bygg.mjs`-anrop och utdatamappen
`listicle/output/invandningar/<handle>/`.** Här står bara det som skiljer.

Första sidan byggdes 2026-09-27 för takskyddet i USA (Axels beställning
efter USA-rapporten i `kommentarer/rapporter/usa-2026-09-27.md`: "en landing
page som kommer hantera alla invändningar vi har fått på den amerikanska
marknaden … inte på samma länk, byggd på samma sätt som en page på min
butik"): https://carashell.com/pages/rv-roof-cover-before-you-buy?country=US.
⛔ **Den sidan är FRYST som original** (Axels order samma kväll: "Nej ändra
inget på den publicerade sidan … Behåll den sidan som original … Reversera
alla ändringar på den"). Han gillar den men använder den inte; kör aldrig
`bygg.mjs` mot den handlen igen. Dess "we have asked the maker"-meningar står
kvar på hans order fast ingen fråga skickats (de 17 frågorna skickas inte,
hans beslut). **I varje NY sida står det obekräftade som "we don't have the
maker's answer" — aldrig "we've asked" om frågan inte är skickad.** Axels
uppföljare är `/anledningar` i den invändningsvända varianten
(`rv-roof-cover-5-reasons`, se `.claude/commands/anledningar.md`).

## Konceptet

Kunderna har redan skrivit sidan — i kommentarsfältet. Varje punkt är EN
invändning ur `/kommentarer`-rapporten (eller `products/<id>/kommentarer.md`),
i fallande ordning efter hur många som frågade, och svaret bär BARA det
belagda: produktsidan, `kommentarer/produktfakta.md` (Axels och leverantörens
svar), `dna.md`. **Det som saknas står som "we asked the maker" / "vi har
frågat tillverkaren"** — aldrig som en gissning, aldrig utelämnat. Sidan
vinner förtroende genom att säga vad vi inte vet; det är hela greppet.

Tre saker skiljer den från de andra listiclarna:

1. **Pristabellen** (`copy.pristabell`): en rad per variant — storlek, pris,
   jämförpris, knapp som öppnar just den varianten (`?variant=id`). Raderna
   ritas av BUTIKEN vid varje visning (`[[PRISTABELL]]` i sidans body byts
   av `templates/page.listicle.liquid` ur `all_products[handle].variants`),
   så priset aldrig blir gammalt och valutan följer besökaren. Motorn
   skriver tabellen själv bara i förhandsvisningen. Copyn styr rubrik, text,
   knappordet och en fotnot; motorn kräver ≥ 2 varianter. Bakgrund: åtta
   amerikaner nämnde 22–44 ft, annonsen sa $199, kassan $338 — "Scam".
2. **Frågedelen** (`copy.fragor`): rubrik + lista `{ fraga, svar }` efter
   punkterna, före slutblocket. Korta svar på resten av frågorna. Samma
   spärrar som all copy (priser, procent, HTML, butiksnamn).
3. **Egen sida på en marknad** (`--marknad US --egen-sida`): en sida om
   USA-invändningar har ingen svensk förlaga att översätta. Sidan byggs med
   marknadens språk i grundspråket och egen handle, copyn i `copy.en.json`,
   bildplanen i `bildplan.json` (eller `bildplan.en.json`), och läses
   tillbaka på marknadens domän med `?country=` — tabellen måste vara ritad
   (`class="lr-pris-tabell"`, ingen `[[PRISTABELL]]` kvar).

Hero-rubriken bär **från-priset** (lägsta varianten; motorn varnar annars).
Alla variantpriser och deras jämförpriser är tillåtna i copyn — inget annat.
Punkterna numreras "1." … "7.". Författarraden: "Anders på lagret" /
"Anders from the warehouse". Lyckas-blocket = "vad gör de som beställer
ändå" (mät, välj längd, använd garantin som test). Ärlig-blocket = **det vi
inte vet** (listat) + vem produkten inte passar. Riskfritt = marknadens
garanti ur produktsidan (USA: 90 dagar, return or refund; Sverige: 14 dagars
ångerrätt).

## De sju punkterna (skelettet)

| Punkt | Bär | Källa |
|---|---|---|
| 1 | Den vanligaste köpfrågan som stoppar köpet (USA: "bara en storlek" — hur väljaren funkar, hur man mäter) | rapporten + produktsidan |
| 2 | Den största produktinvändningen, även när svaret är "vi har frågat" (USA: AC-aggregatet på taket) | rapporten + produktfakta |
| 3 | Det kunderna själva bränt sig på förut (USA: banden) — leverantörens ord, attribuerade | produktfakta (leverantören) |
| 4 | Den obekväma sanningen (USA: fukt under överdraget — "det kan den") + vad kunden kan göra | produktfakta (Axel) |
| 5 | Alternativet kunden jämför med (USA: helöverdraget) — utan konkurrentpriser | produktsidan |
| 6 | Resten av det som sitter på taket / passformen (fifth wheel, solceller, antenn) — mätråd + "vi har frågat" | produktfakta + rapporten |
| 7 | Förtroendet: vad kunden får om det inte passar (garanti, frakt, leveranstid), och sanningen om recensionerna | produktsidan |

Vid fem punkter: slå ihop 6 i 1 (mätrådet) och 7 i riskfritt-blocket.

## Hårda regler utöver `/lagerrensning`s

- **Aldrig en gissning som fakta.** Axels "välj en storlek längre" om AC står
  i produktfakta som *hans gissning* — den får inte stå på sidan. Samma sak
  med vindgräns, snölast, andning/kondens, dörren, hagel: säg "vi har frågat".
- **Kundcitat bara som deras egna ord i tredje person** ("Several of you
  wrote …"), aldrig som påhittade amerikanska kunder, aldrig översatta svenska
  recensioner som ser amerikanska ut. Inga betyg.
- **Inget om varifrån varan skickas**, inget butiksnamn, inga procent, inga
  konkurrentpriser, inga kronor på en dollarsida.
- **Bilderna får inte ljuga om det obesvarade:** ingen kie-bild på överdraget
  över ett AC-aggregat förrän leverantören visat hur det sitter. Visa kundens
  tak (AC, fifth wheel, solcell) UTAN överdraget i stället. Leverantörens
  gamla foton med elastiska band (`tak-spanne.jpg`, `tak-hopvikt.jpg`)
  används aldrig — de motsäger "woven webbing".
- **Tabellens knappar pekar på produktsidan med varianten förvald.**
  Paketrutan där förväljer det Axel bestämt (2-pack 2026-09-27, A/B-frågan
  öppen) — skriv därför "pick 1 pack if you have one RV", aldrig "no bundle
  is preselected".

## Bilderna

Punkt 1 produkten i sin miljö (hela längden syns), punkt 2 kundens tak med
det som sticker upp (kie, utan överdrag), punkt 3 bandet och kroken i närbild
(produktbild), punkt 4 väven i regn (produktbild), punkt 5 före/efter eller
helöverdragets motsats (produktbild), punkt 6 kundens vagntyp (kie, utan
överdrag), punkt 7 produkten hopvikt/"det som kommer" (produktbild), `lyckas`
produkten på ljus bakgrund. Produktbilder först, kie bara där ingen passar.

## Rapport till Axel (kort, svenska)

Som `/lagerrensning`, plus: vilka invändningar som fick en punkt (och antal
kommentarer bakom var och en), vilka svar som är "vi har frågat", och att
tabellen ritas av butiken. Sist:

1. Öppna adressen och läs igenom en gång.
2. Peka annonserna för marknaden på adressen (med `?country=`).
3. Skicka leverantörsfrågorna som saknas — sidan uppdateras med svaren (kör kommandot igen, det kostar inga credits).

## DEFINITION OF DONE
- [ ] Underlag hämtat ur butiken (och ur marknadens sida med `--marknad`); alla varianter med pris lästa där, aldrig ur minnet; inget betyg
- [ ] Varje punkt = en invändning ur kommentarerna, i fallande ordning, med källa; det obesvarade står som "vi har frågat", aldrig som gissning
- [ ] `copy.pristabell` (rubrik, text, knapp, fot) och `copy.fragor` skrivna; hero bär från-priset; bara variantpriser i copyn
- [ ] Copy skriven av huvudsessionen; läsbarhetstest + tre-frågorstest redovisade, ❌ bara med motivering
- [ ] Obrandad; inget butiksnamn, ingen ursprungsort, inga procent, inga konkurrentpriser
- [ ] Bildplan: kundens tak utan överdrag för det obesvarade; aldrig leverantörens elastiska band; alla platser för antalet punkter
- [ ] `--torr` utan ❌; skarp körning: bilder på CDN, sidan uppe med mallen `page.listicle`, läst tillbaka utan header/footer/meny, tabellen ritad av butiken (ingen `[[PRISTABELL]]` kvar)
- [ ] Skärmdumpar tittade på (hero, tabell, punkt 1–2, frågedel, slut, sidfot — desktop + mobil); varje kie-bild tittad på
- [ ] batch-log uppdaterad om produkten har minne; committat och pushat
- [ ] Rapport + Axels klick sist, numrerade
