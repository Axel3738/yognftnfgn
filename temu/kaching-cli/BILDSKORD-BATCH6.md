# Bildskörd batch 6 — klistra in ALLT nedanför strecket i Cowork på din dator

Uppdaterad 2026-09-07 kväll. Fem produkter (taköverdraget är klart och hoppas över).
Offertarket: https://docs.google.com/spreadsheets/d/1zGcVdwHVdvTD3t894FdFw--9fL8B5v5oMH5kK2XWM-I/edit

---

Vi ska ladda ner ALLA produktbilder, GIF:ar och videor från Temu för fem produkter.
Temu blockerar molnet men inte den här datorn, så skörden körs här. Fråga mig inget —
kör klart och säg till när allt är pushat.

**Steg 1 — hämta repot.** Om mappen `yognftnfgn` redan finns: gå in i den och kör
`git fetch origin claude/batch6-product-pages-rebuild-wj328a && git checkout claude/batch6-product-pages-rebuild-wj328a && git pull`.
Annars klona: `git clone -b claude/batch6-product-pages-rebuild-wj328a https://github.com/Axel3738/yognftnfgn.git`

**Steg 2 — förbered.** `cd temu/kaching-cli` och kör `npm install` om `node_modules`
saknas. Rör inte `profile-temu/`-mappen.

**Steg 3 — hitta rätt produktsida.** Fyra av länkarna nedan är Temu-SÖKSIDOR
(slutar på `-s.html`), inte produktsidor. Gör så här för var och en av dem:
öppna länken i Chrome, leta upp den produkt som ser ut som bilden i offertarket
(kolumn A eller D på produktens rad), klicka på den, och kopiera adressen till
produktsidan — den slutar på `-g-<långt nummer>.html`. Använd DEN adressen i steg 4.
Länken till vedklyven är redan en produktsida och används som den är.

| Mappnamn | Länk i arket | Så ser rätt produkt ut (arket) |
|---|---|---|
| kattkoja | https://www.temu.com/ie/outdoor-cat-house-5030003647894-s.html | boxig tygkoja med sadeltak, står på marken, öppning på kortsidan — grå/svart/grön, INTE kamouflage |
| staketbygel | https://www.temu.com/mu/fence-post-repair-spike-5040027499285-s.html | svart stålspett med bygel som skruvas mot stolpen, säljs som 2-pack |
| vedklyv | https://www.temu.com/10-x-14-5--splitter-xl-9lbs-heavy-duty-firewood-splitter-cast-steel-manual-log-splitter-w-unique-half-ring-design-no--easy-portability-wood-splitter-tool-g-601099561039096.html | tändvedsklyv i gjutjärn, ring upptill och kil i botten |
| solpanel | https://www.temu.com/ca/solar-panel-for-trail-camera-5050234381764-s.html | solpanel med ledat fäste för åtelkamera — ingen kamera ingår, grön version |
| racingkalender | https://www.temu.com/se/24-racingbil-julkalender-24-stilar-av-julnedr%C3%A4kningspresenter-0-navidad-present-g-601099694788256.html | blå adventskalender "Advent Calendar" med 24 racingbilar (denna länk är redan en produktsida) |

**Steg 4 — kör skörden, ett kommando i taget.** Ett Chrome-fönster öppnas per
körning; dyker en captcha upp, lös den i fönstret så fortsätter skörden själv.
Vänta tills skriptet skriver "N filer →" innan nästa körs. Byt ut adressen mot
produktsidans adress från steg 3:

```
node temu-bilder.mjs '<produktsidans adress>' kattkoja
node temu-bilder.mjs '<produktsidans adress>' staketbygel
node temu-bilder.mjs 'https://www.temu.com/10-x-14-5--splitter-xl-9lbs-heavy-duty-firewood-splitter-cast-steel-manual-log-splitter-w-unique-half-ring-design-no--easy-portability-wood-splitter-tool-g-601099561039096.html' vedklyv
node temu-bilder.mjs '<produktsidans adress>' solpanel
node temu-bilder.mjs 'https://www.temu.com/se/24-racingbil-julkalender-24-stilar-av-julnedr%C3%A4kningspresenter-0-navidad-present-g-601099694788256.html' racingkalender
```

**Steg 5 — grovgranska.** Öppna varje mapp under `temu/bildskord/` och släng bilder
som hör till ANDRA produkter ("liknande produkter"-sektionen smiter ibland med) och
rent skräp. Behåll GIF:ar och videor — de är det viktigaste. Skriv i `manifest.json`-
mappen inget för hand; bara radera filer.

**Steg 6 — skicka upp.** I repots rot:
`git add temu/bildskord && git commit -m "bildskörd batch 6" && git push`

Strular git: zippa `temu/bildskord/` och skicka zip-filen i chatten i stället.
Sen tar molnsessionen över och bygger gallerier, GIF:ar och beskrivningar av
de riktiga bilderna.
