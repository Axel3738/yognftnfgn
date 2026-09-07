# Bildskörd batch 5.1 — klistra in ALLT nedanför strecket i Cowork på din dator

---

Vi ska skörda produktbilder, GIF:ar och videor från Temu för 15 produkter.
Temu blockerar molnmiljön men inte den här datorn, så skörden körs här.

**Steg 1 — hämta repot.** Om `yognftnfgn` redan finns klonad: gå till mappen och
kör `git fetch origin claude/tem-shopify-product-import-cn7mjt && git checkout
claude/tem-shopify-product-import-cn7mjt && git pull`. Annars klona:
`git clone -b claude/tem-shopify-product-import-cn7mjt <repo-url för axel3738/yognftnfgn>`

**Steg 2 — förbered.** `cd temu/kaching-cli` och kör `npm install playwright`
om `node_modules` saknas. Rör inte `profile-temu/`-mappen.

**Steg 3 — kör skörden, ett kommando i taget.** Ett Chrome-fönster öppnas per
körning; dyker en captcha upp, lös den i fönstret så fortsätter skörden själv.
Vänta tills skriptet skriver "N filer →" innan nästa kommando körs:

```
node temu-bilder.mjs 'https://www.temu.com/se/-f%C3%B6r-makita-18v-kompatibel-led-spotlight-lampa-15-led-handh%C3%A5llen-arbetslampa-med-justerbart-f%C3%A4ste-portabel-lampa-f%C3%B6r-diy-utomhusbruk-kompatibel-med-makita-18v-li-ion-turkos-svart-g-605988157507785.html' arbetslampa
node temu-bilder.mjs 'https://www.temu.com/se/en-stor-dubbellagers-k%C3%B6kskorgst%C3%A4ll-i-kolst%C3%A5l-med-en-f%C3%B6rtjockad-st%C3%B6dram-ett-diskst%C3%A4ll-i-metall-med-bestickh%C3%A5llare-l%C3%A4mpligt-f%C3%B6r-att-placera-sk%C3%A5lar-tallrikar-muggar-och-sk%C3%A4rbr%C3%A4dor--f%C3%B6r-f%C3%B6rvaring-i-hemmet-och--g-601100495932584.html' diskstall
node temu-bilder.mjs 'https://www.temu.com/se/k%C3%B6ksb%C3%A4nk-f%C3%B6rvaringsst%C3%A4ll-med-metall-l%C3%A5da-massivt-tr%C3%A4-metall-utdragbar-organizer-f%C3%B6r-kaffebryggare-mikrov%C3%A5gsugn-och-porslin-modern-svart-vit-st%C3%A5ende-hylla-g-606593194260136.html' bankhylla
node temu-bilder.mjs 'https://www.temu.com/se/-och-b%C3%A5ll-br%C3%A4dspel-klassiskt-familjespel-i-tr%C3%A4-present-till--och-halloween-g-601101920237436.html' luffarschack
node temu-bilder.mjs 'https://www.temu.com/se/2-pack-f%C3%B6r--swirl-glass-och--maskiner-16oz--swirl-pints-och-lock-kompatibla-med-nc700-nc701-serien-diskmaskins%C3%A4kra-g-606152708439387.html' glasspints
node temu-bilder.mjs 'https://www.temu.com/se/1-2-4-st-vaggande-boll-spelset-interaktivt-multiplayer-spelkit-f%C3%B6r-h%C3%B6gtidsfirande-l%C3%A4mpligt-f%C3%B6r-%C3%B6gon-hand-och-k%C3%A4rnkoordinationstr%C3%A4ning--partyspel-%C3%A5terh%C3%A4mtningsutbildning-f%C3%B6r-festliga-sammankomster-utomhusaktiviteter-hemunderh%C3%A5llning-g-601105338361446.html' kastfanga
node temu-bilder.mjs 'https://www.temu.com/se/magnetiska-plattor-magnetleksaker-stor-storlek-stem-leksaker-byggleksaksset-pedagogiska-magnetleksaker-f%C3%B6delsedagspresenter-slumpm%C3%A4ssig-f%C3%A4rgleverans--spel-magnetiska-kubpussel-magnetiskt-kubset-magnetiska-kubleksaker-magnetisk-kub-3x3-g-601099555317731.html' magnetplattor
node temu-bilder.mjs 'https://www.temu.com/se/-37l-h%C3%B6gkapacitets-motorcykel-bakv%C3%A4ska-t%C3%A5lig-f%C3%B6rvaring-f%C3%B6r-%C3%A4te-med-justerbara-remmar-m%C3%A5ngsidig-hj%C3%A4lms%C3%A4ck-f%C3%B6r-gat-sportmotorcyklar--dragkedja-ventilationsn%C3%A4t-motorcykeltillbeh%C3%B6r-utomhus-%C3%A4ventyrsutrustning-smidig-design--konstruktion-g-601099525417124.html' mcvaska
node temu-bilder.mjs 'https://www.temu.com/se/100-delars-multis%C3%B6mnadskit-med-tillbeh%C3%B6r-24-f%C3%A4rgade-tr%C3%A5dar-n%C3%A5lar-och-tr%C3%A5d-f%C3%B6r-sm%C3%A5-reparationer-essential-mini-b%C3%A4rbar-reses%C3%B6mnadskit-f%C3%B6r-n%C3%B6dreparationer-g-601100056763025.html' somnadskit
node temu-bilder.mjs 'https://www.temu.com/se/-7-dagars-medicinl%C3%A5da-med-stor-kapacitet-dammt%C3%A4t-och-fukts%C3%A4ker-medicinf%C3%B6rvaringsl%C3%A5da-idealisk-f%C3%B6r-att-b%C3%A4ra-medicin-utomhus-g-601099583478869.html' reseask
node temu-bilder.mjs 'https://www.temu.com/se/21-facks-veckopillbox-7-dagar-morgon-middag--p%C3%A5minnelse-tabletter-medicin-f%C3%B6rvaringsbox-roterande-sp%C3%A4nndesign-en-av-en-justering-register-n%C3%B6jande-veckovis-behov-stor-pillbox-dubbla-lager-f%C3%B6rsegling-oberoende-f%C3%B6rpackning-pillbox-g-606321420111309.html' veckodosett
node temu-bilder.mjs 'https://www.temu.com/se/3d-flytande-sandm%C3%A5lning-vardagsrum-timglas--ornament-examenspresent-landskapsm%C3%A5lning-kontorssk%C3%A5p-dekoration-utomhus-juldekoration-halloween-dekoration-g-601099652857203.html' sandbild
node temu-bilder.mjs 'https://www.temu.com/se/p%C3%A4lsv%C3%A5rdsborste-kit-f%C3%B6r--dammsugare-v7-v8-v10-v11-v15-dammsugare-ing%C3%A5r-ej-hund-och-kattv%C3%A5rdsborste-h%C3%A5rtrimningsverktyg-f%C3%B6r-hundar-och---g-601099915330362.html' dysonborste
node temu-bilder.mjs 'https://www.temu.com/se/borstl%C3%B6s-elektrisk-turbinfl%C3%A4kt-sladdl%C3%B6s-jetfl%C3%A4kt-luftrenare-l%C3%B6vbl%C3%A5s-f%C3%B6r-bil-m%C3%B6bler-dammtorkare-elverktyg-kompatibel-med--batterier-g-601102600651869.html' jetflakt
node temu-bilder.mjs 'https://www.temu.com/se/1--magnetisk-sidof%C3%B6rvaringshylla-set-f%C3%B6r-kylsk%C3%A5p-tv%C3%A4ttmaskiner-enkel-installation-utan-borrning-elegant-svart-metallfinish-v%C3%A4ggmonterad-kryddorganisat%C3%B6r-g-601099921451643.html' magnethylla
```

**Steg 4 — grovgranska.** Öppna varje mapp under `temu/bildskord/` och släng
bilder som hör till ANDRA produkter ("liknande produkter"-sektionen smiter
ibland med) och rent skräp. Behåll GIF:ar och videor — de är det viktigaste.
Specialfall jetflakt: behåll även batteribilder, molnsessionen sorterar dem.

**Steg 5 — pusha.**
`git add temu/bildskord && git commit -m "bildskörd batch 5.1 (15 produkter)" && git push`

**Om git strular:** zippa hela `temu/bildskord/`-mappen och säg åt Axel att
ladda upp zippen i molnsessionen i stället — det funkar lika bra.

Säg till i molnsessionen när skörden är pushad/uppladdad, så tar den över:
KIE-försvenskning av textbilder, GIF:ar ur videorna och gallerier + beskrivningar
enligt strukturen problem → GIF → lösning → GIF/bild → funktioner → bild → garanti.

*(Lövblåsaren, rad 49, är medvetet INTE med — den är inte skapad än; CWD ska
skicka rena bilder utan batterikit först. Fotokudden väntar på fotoflödet.)*
