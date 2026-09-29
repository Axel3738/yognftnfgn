# Startsidans collage "Matstrumpor i världen" (2026-09-29)

Axels beställning: bilder med UGC-kreatörer och flaggor för länderna vi säljer i,
strumporna lite överallt i världen — **bara på startsidan**.

- `collage.json` — promptarna (12 länder + en globbild), referensbilderna är butikens egna produktfoton.
- `bilder.mjs` — genererar bilderna via kie.ai (`--igen <id>` gör om en). Bilderna i `bilder/` är krympta till 900 px.
- `ms-varlden.liquid` + `tema.mjs --skarpt` — lägger bilderna som assets, sektionen och raden i `templates/index.json` (efter "berattelse") i det publicerade temat.

Rubriken följer butikens språk (12 språk, Liquid-`case`), landsnamnen står på landets eget språk,
och besökarens eget land läggs först (orange etikett).

⚠️ Personerna är AI-genererade. Rutorna bär bara landets namn — aldrig citat, namn eller "kund".
⚠️ AI-kartor blev fel två gånger (strumpor i Afrika, Sydamerika, Kina) — därför en globbild i stället för en karta.

Läst som kund 2026-09-29: SE (sv, Sverige först), NO (nb, Norge först), US (en, USA först), 0 trasiga bilder, dator + mobil.
Ta bort: radera sektionen "Matstrumpor i världen" på startsidan i temaredigeraren.
