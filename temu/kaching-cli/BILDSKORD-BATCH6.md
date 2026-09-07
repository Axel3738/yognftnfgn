# Bildskörd batch 6 — klistra in ALLT nedanför strecket i Cowork på din Mac

---

Vi ska skörda produktbilder, GIF:ar och videor från Temu för 6 produkter.
Temu blockerar molnmiljön men inte den här datorn, så skörden körs här.

**Steg 1 — hämta repot.** Om `yognftnfgn` redan finns klonad: gå till mappen och
kör `git fetch origin claude/tem-shopify-product-import-cn7mjt && git checkout
claude/tem-shopify-product-import-cn7mjt && git pull`. Annars klona:
`git clone -b claude/tem-shopify-product-import-cn7mjt https://github.com/Axel3738/yognftnfgn.git`

**Steg 2 — förbered.** `cd temu/kaching-cli` och kör `npm install`
om `node_modules` saknas. Rör inte `profile-temu/`-mappen.

**Steg 3 — kör skörden, ett kommando i taget.** Ett Chrome-fönster öppnas per
körning; dyker en captcha upp, lös den i fönstret så fortsätter skörden själv.
Vänta tills skriptet skriver "N filer →" innan nästa kommando körs:

```
node temu-bilder.mjs 'https://www.temu.com/ie/outdoor-cat-house-5030003647894-s.html' kattkoja
node temu-bilder.mjs 'https://www.temu.com/mu/fence-post-repair-spike-5040027499285-s.html' staketbygel
node temu-bilder.mjs 'https://www.temu.com/10-x-14-5--splitter-xl-9lbs-heavy-duty-firewood-splitter-cast-steel-manual-log-splitter-w-unique-half-ring-design-no--easy-portability-wood-splitter-tool-g-601099561039096.html' vedklyv
node temu-bilder.mjs 'https://www.temu.com/roof-cover-for-travel-trailer-5050206311352-s.html' takoverdrag
node temu-bilder.mjs 'https://www.temu.com/ca/solar-panel-for-trail-camera-5050234381764-s.html' solpanel
node temu-bilder.mjs 'https://www.temu.com/se/24-racingbil-julkalender-24-stilar-av-julnedr%C3%A4kningspresenter-0-navidad-present-g-601099694788256.html' racingkalender
```

**Steg 4 — grovgranska.** Öppna varje mapp under `temu/bildskord/` och släng
bilder som hör till ANDRA produkter ("liknande produkter"-sektionen smiter
ibland med) och rent skräp. Behåll GIF:ar och videor — de är det viktigaste.

**Steg 5 — skicka upp.** I repots rot:
`git add temu/bildskord && git commit -m "bildskörd batch 6" && git push`

Strular git: zippa `temu/bildskord/` och skicka zip-filen i chatten i stället.
Sen tar molnsessionen över och bygger gallerier, GIF:ar och beskrivningar.
