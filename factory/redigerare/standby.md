# Standby-listan — redigerare redo att ta en OPS-butik

Byggs av rekryteringsmotorn (factory/PLAN.md punkt 4) och läses av
`factory/discord.mjs`, som plockar FÖRSTA raden med status `redo` när en ny
butik får sin Discord-server, och märker den `tilldelad <butik> <datum>`.

Status: `redo` · `tilldelad <butik> <datum>` · `slutat`.

**Läget 2026-09-08 (Axels besked):** jobbannonsen är UTE och ansökningar
kommer in nu. En person står redan på standby — raden fylls i nedan.

⚠️ **Ingen löpande beredskapsersättning betalas** (Axels beslut 2026-09-08).
Poolen hålls inte varm med pengar; den byggs ur ansökningsflödet.

`factory/discord.mjs` bygger servern även när listan saknar en `redo`-rad och
rapporterar då plockningen som manuell. En rutin som hittar noll rader ska
skriva "ingen redigerare tilldelad än", aldrig "bjud in redigeraren".

| Namn | Kontakt | Status |
|---|---|---|
