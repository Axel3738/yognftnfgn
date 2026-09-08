# Standby-listan — redigerare redo att ta en OPS-butik

Byggs av rekryteringsmotorn (factory/PLAN.md punkt 4) och läses av
`factory/discord.mjs`, som plockar FÖRSTA raden med status `redo` när en ny
butik får sin Discord-server, och märker den `tilldelad <butik> <datum>`.

Status: `redo` · `tilldelad <butik> <datum>` · `slutat`.

⚠️ **Listan är medvetet tom (Axels beslut 2026-09-08): standby-poolen är
SKIPPAD.** Ingen beredskapsersättning betalas och ingen pool hålls varm —
rekrytering sker först när en butik faktiskt behöver en redigerare.
`factory/discord.mjs` bygger servern ändå och rapporterar plockningen som
manuell. En rutin som hittar noll rader här ska skriva "ingen redigerare
tilldelad än", aldrig "bjud in redigeraren".

| Namn | Kontakt | Status |
|---|---|---|
