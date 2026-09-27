# Veckans dragning: textblocket i tisdagskampanjerna (Matstrumpor)

Skrivet 2026-09-27 av en Sonnet-subagent mot `docs/copy-regler.md`, granskat av
huvudsessionen (inga tankstreck, ingen leveranstid, inga påhittade förmåner, inga
siffror utöver tre). Omskrivet samma eftermiddag när Axel ändrade mekaniken från tio
vinnare + bild till **tre vinnare + kort video** (en andra Sonnet-subagent, 0 ❌).
Blocket läggs in som ett vanligt textstycke sist i brödtexten i varje tisdagskampanj
från och med den första tisdag dragningen körts skarpt (`klaviyo/klubb/dragning.mjs
--skarpt`, kommandot `/klubbdragning kör`). Dragningen går på morgonen, kampanjen
18:00, så "i morse" stämmer.

**Regel:** blocket får bara stå i en kampanj om dragningen faktiskt körts samma
morgon (loggen `klaviyo/konto/matstrumpor/dragningar.jsonl` har en skarp rad med
dagens datum). Ingen dragning ⇒ inget block. Första gången används Premiär, sedan
Återkommande.

## Premiär (första kampanjen efter den första skarpa dragningen)

I morse drog vi de första tre medlemmarna i Matstrumpor-klubben. Ett skript slumpar fram namnen bland alla medlemmar som inte redan vunnit, ingen anmälan behövs. Vinnarna får sushilådan utan kostnad, mot att de filmar en kort video av sig själva med strumporna. Det här händer varje tisdag från och med nu, så länge du är medlem kan du bli en av de tre.

## Återkommande (varje tisdag därefter)

I morse drog vi tre nya medlemmar i Matstrumpor-klubben. Fick du inget mejl från oss den här gången var det inte du som drogs. Nästa dragning är på tisdag, så länge du är medlem är du med då också.

## Tre-frågorstestet

| Rad | Visualisera | Falsifiera | Ingen annan kan säga det |
|---|---|---|---|
| I morse drog vi de första tre medlemmarna i Matstrumpor-klubben. | ✅ | ✅ | ✅ |
| Vinnarna får sushilådan utan kostnad, mot att de filmar en kort video av sig själva med strumporna. | ✅ | ✅ | ✅ |
| Det här händer varje tisdag från och med nu, så länge du är medlem kan du bli en av de tre. | ✅ | ✅ | ✅ |
| I morse drog vi tre nya medlemmar i Matstrumpor-klubben. | ✅ | ✅ | ✅ |
| Fick du inget mejl från oss den här gången var det inte du som drogs. | ✅ | ✅ | ✅ |
| Nästa dragning är på tisdag, så länge du är medlem är du med då också. | ✅ | ✅ | ✅ |

## När vinnarvideorna finns

Från och med den första videon med skriftligt ja (svaret på E1/E2) byts blocket mot
videon + förnamn och stad, bara om vinnaren sagt ja till det, aldrig efternamn.
Videorna sparas av VA:n enligt SOP:en "Club draw winners" (kommentar med bilaga på
orderns tidslinje i Shopify) och laddas upp i Spoks mediebibliotek (`upload_media`,
Spoks har ett videoblock) av sessionen som bygger kampanjen. Ägaren väljer vilka
videor som går in i mejl och annonser.
