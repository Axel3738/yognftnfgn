# Uppdrag: rätta de norska SRT:erna (11 videor)

Källa: `srt-orig/<namn>.srt` = HeyGens egen norska översättning.
Mål:   `srt-no/<namn>.srt` = samma fil, rättad.

`<namn>.orig.srt` i samma mapp är den SVENSKA transkriptionen — läs den när du
är osäker på vad som sägs.

## Järnregler

1. **Exakt samma antal block och exakt samma tidkoder.** Ändra bara texten.
   Ett block som byter längd bryter läppsynken.
2. **Ungefär samma taltid.** En rättad rad får inte bli mycket längre än
   originalet — rösten hinner inte. Hellre kortare.
3. **Priserna är de NORSKA.** Aldrig ett svenskt pris, aldrig ett tal HeyGen
   hört fel.
4. **Hitta aldrig på ett faktum.** Bara det som står nedan eller i den svenska
   källan.
5. Naturlig norsk bokmål. Tal som sägs högt skrivs som siffror när det är
   naturligt ("3,69 meter", "1 189 kroner") — HeyGens utskrivna talord
   ("ettusen etthundretjue-ni") låter fel och ska bli siffror.
6. Inga tankestreck (— eller –). Punkt eller komma.

## Priser per produkt (NORSKA, verifierade mot butiken i dag)

| Produkt | Pris | Jämförpris | Spar |
|---|---|---|---|
| IBC-tanktrekk (`ibctank_*`) | 439 kr | 586 kr | 147 kr |
| Feiesett (`feiesett_*`) | 389 kr | 509 kr | 120 kr |
| Takovertrekk (`takovertrekk_*`) | 1 189 kr | 1 549 kr | 360 kr |

## Fel jag redan hittat — rätta dem, och leta efter fler av samma sort

- `ibctank_PD_12_H2` block 4: "Kraftig **260D** Oxford-stoff" → **210D**.
- `ibctank_PD_12_H3` block 2: "Kraftig **to hundre og tiD** Oxford-stoff" → "Kraftig **210D** Oxford-stoff".
- `feiesett_PD_9_H1` block 2: "3,69 meter **gang** når frem" → "**bøyelig stang**".
- `feiesett_PD_9_H1` block 4: "Bestill **Såta-settet**" → "Bestill **feiesettet ditt**".
- `feiesett_*`: produkten heter **feiesett**, aldrig "feiersett"/"feiersettet".
  (Personen som sotar heter feier: "mellom feierens besøk" är rätt.)
- `takovertrekk_SP_4_H2` block 6: "To hundre **Jodeväv**" → "**210D-vev**".
- `takovertrekk_SP_4_H4` block 3: "to hundre og ti D-vev" → "**210D-vev**".
- `takovertrekk_SP_4_H3` block 7: "holder hele vintersesongen **ut**" → "**ute**".
- Alla `takovertrekk_*`: prisen 1129 / 1469 / 1460 / "ettusen firehundre seksten"
  → **1 189 kr** respektive **1 549 kr**.
- `takovertrekk_CS_12_H1` block 3: "**Beskyttelsestaket** 1129 kroner" →
  "Beskytt taket. 1 189 kroner."

## Verifierade produktfakta (norska produktsidan)

**IBC-tanktrekk:** 210D oxfordstoff, glidelås, åpning på toppen så du når lokket,
mål 120 × 100 × 116 cm, passer standard 1000-liters tank, stenger lyset ute så
alger ikke kommer i gang, tar UV-strålingen i stedet for plasten.

**Feiesett:** 9 fleksible stenger à 41 cm som skrus sammen til 3,69 meter,
nylonbørste 100 mm, sekskantadapter, stengene følger svingene i røret i stedet
for å stoppe, soten børstes løs (ikke skrapes), når bak ovnen eller tørketrommelen.

**Takovertrekk:** 210D-duk (ikke tynn presenning som sprekker i frost), dekker
bare takflaten 6,5 × 3 m (ikke hele vognen), strammes med reim og strammesnor i
kanten, håndteres av én person, tåler en hel vintersesong ute, oppbevaringspose
følger med, 30 dagers åpent kjøp.

## Videor som ska rättas (11 — `ibctank_CS_9_H1` hoppas över, den hålls)

feiesett_PD_7_H1 · feiesett_PD_8_H1 · feiesett_PD_8_H2 · feiesett_PD_9_H1
ibctank_PD_12_H1 · ibctank_PD_12_H2 · ibctank_PD_12_H3
takovertrekk_CS_12_H1 · takovertrekk_SP_4_H2 · takovertrekk_SP_4_H3 · takovertrekk_SP_4_H4
