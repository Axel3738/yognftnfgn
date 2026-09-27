# Veckans dragning: textblocket i tisdagskampanjerna (Matstrumpor)

Skrivet 2026-09-27 av en Sonnet-subagent mot `docs/copy-regler.md`, granskat av
huvudsessionen (inga tankstreck, ingen leveranstid, inga påhittade förmåner, inga
siffror utöver tio). Blocket läggs in som ett vanligt textstycke sist i brödtexten
i varje tisdagskampanj från och med den första tisdag dragningen körts skarpt
(`klaviyo/klubb/dragning.mjs --skarpt`, kommandot `/klubbdragning kör`). Dragningen
går på morgonen, kampanjen 18:00, så "i morse" stämmer.

**Regel:** blocket får bara stå i en kampanj om dragningen faktiskt körts samma
morgon (loggen `klaviyo/konto/matstrumpor/dragningar.jsonl` har en skarp rad med
dagens datum). Ingen dragning ⇒ inget block. Första gången används Premiär, sedan
Återkommande.

## Premiär (första kampanjen efter den första skarpa dragningen)

I morse drog vi de första tio medlemmarna i Matstrumpor-klubben. Ett skript slumpar fram namnen bland alla medlemmar som inte redan vunnit, ingen anmälan behövs. Vinnarna får sushilådan utan kostnad, mot att de skickar en bild på sig själva med strumporna. Det här händer varje tisdag från och med nu, så länge du är medlem kan du bli en av de tio.

## Återkommande (varje tisdag därefter)

I morse drog vi tio nya medlemmar i Matstrumpor-klubben. Fick du inget mejl från oss den här gången var det inte du som drogs. Nästa dragning är på tisdag, så länge du är medlem är du med då också.

## Tre-frågorstestet

| Rad | Visualisera | Falsifiera | Ingen annan kan säga det |
|---|---|---|---|
| I morse drog vi de första tio medlemmarna i Matstrumpor-klubben. | ✅ | ✅ | ✅ |
| Vinnarna får sushilådan utan kostnad, mot att de skickar en bild på sig själva med strumporna. | ✅ | ✅ | ✅ |
| Det här händer varje tisdag från och med nu, så länge du är medlem kan du bli en av de tio. | ✅ | ✅ | ✅ |
| I morse drog vi tio nya medlemmar i Matstrumpor-klubben. | ✅ | ✅ | ✅ |
| Fick du inget mejl från oss den här gången var det inte du som drogs. | ✅ | ✅ | ✅ |
| Nästa dragning är på tisdag, så länge du är medlem är du med då också. | ✅ | ✅ | ✅ |

## När vinnarbilderna finns

Från och med den första bilden med skriftligt ja (svaret på E1/E2) byts blocket mot
bilden + förnamn och stad, bara om vinnaren sagt ja till det, aldrig efternamn.
Bilderna sparas av VA:n enligt SOP:en "Club draw winners" och laddas upp i Spoks
mediebibliotek (`upload_media`) av sessionen som bygger kampanjen.
