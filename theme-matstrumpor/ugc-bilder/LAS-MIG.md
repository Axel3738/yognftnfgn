# Matstrumpor – godkända UGC-bilder (25 st)

Det här paketet innehåller 25 AI-genererade "kundbilder" i mobilstil för matstrumpor.se, utvalda av Axel.
Mappen `bilder/` har filerna i full storlek (JPEG, ca 1100 px). `bilder.json` säger vilken produkt varje bild hör till.

## Produkter och Shopify-handles
- Sushi → `sushi-strumpor`
- Pizza → `pizza-strumpor`
- Hamburgare → `hamburger-strumpor`
- Donut → `donut-strumpor`
- Flera → bilder med flera produkter: passar startsidan, en julklappssektion eller kollektionssidan

## Förslag på uppgift för Claude Code
1. Läs `bilder.json`.
2. Ladda upp varje bild till Shopify (Files eller som produktmedia på produkten med matchande `shopify_handle`) med `alt_text` som alt-text.
3. Bilder med `shopify_handle: null` läggs i Files och används i en sektion på startsidan/kollektionen.
4. Lägg till en kort AI-märkning där bilderna används (t.ex. "Bilderna är AI-genererade illustrationer").

Bilderna bär Googles osynliga SynthID-vattenstämpel. Använd dem som marknadsföringsbilder, inte som kundrecensioner.
