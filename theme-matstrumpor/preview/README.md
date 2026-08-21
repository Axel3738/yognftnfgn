# Förhandsvisningen

Bygger en fristående HTML-sida som visar produktsidan renderad med temats
**riktiga** stilmall och JavaScript — inte en skiss. Används för att få designen
godkänd innan något laddas upp till Shopify.

```bash
node theme-matstrumpor/preview/bygg.mjs
```

Skriptet läser `assets/ms-cro.css` och `assets/ms-cro.js` och bäddar in dem, så
förhandsvisningen kan aldrig glida isär från det som faktiskt körs.

Produktbilderna bäddas in som data-URI:er och läses från en `imgs.json` som
skapas genom att hämta bilderna från matstrumpor.se. Saknas den filen: hämta
`https://matstrumpor.se/products.json`, ladda ner de tre första bilderna för
sushi-strumporna och base64-koda dem till `{ "hero": "...", "b": "...", "c": "..." }`.
