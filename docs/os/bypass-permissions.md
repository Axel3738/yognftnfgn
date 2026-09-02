# Bypass permissions – hur Claude körs helt utan frågor

Verifierat mot Claude Codes officiella dokumentation 2026-09-02
(`code.claude.com/docs/en/permission-modes`, `…/desktop`).

## Windows-appen (Claude Desktop, fliken Code)

⚠️ **Bypass finns bara i sessioner som körs LOKALT på datorn.** Startar man
sessionen med miljön **Cloud** (rullistan i promptrutan) visar lägesväljaren bara
Accept edits / Plan / Auto, oavsett vad som är påslaget i inställningarna. Mätt
2026-09-02: Axels sessioner från appen kör i molnet (`origin: desktop_app`,
`environment_kind: anthropic_cloud`) – därför "går det inte att välja läget".
Lösningen är att välja **Local** i miljörullistan när sessionen skapas.
Lokala sessioner kräver Git for Windows och en lokal klon av repot.

Bypass-läget finns i appen men är avstängt tills det slås på i inställningarna.

1. **Settings → Claude Code** → slå på **Allow bypass permissions mode**
   (Pro/Max. På Team/Enterprise styrs det av org-policyn i stället.)
2. I sessionen: lägesväljaren **bredvid Skicka-knappen** → välj **Bypass permissions**.
3. Valet **sparas per mapp** och gäller alla nya sessioner i den mappen.
   Det går före `defaultMode` i settings-filerna. (Plan är undantaget – det gäller bara sessionen.)

Första gången visas en varningsdialog som ska accepteras en gång.

Alternativ via fil (samma effekt, men bara i användarfilen):
`C:\Users\<namn>\.claude\settings.json` → `"permissions": { "defaultMode": "bypassPermissions" }`.
⚠️ Värdet **ignoreras** i projektets `.claude/settings.json` och `.claude/settings.local.json`
– sätts det där startar sessionen i Manual. Därför ligger det inte i repot.

Repots `.claude/settings.json` har `defaultMode: dontAsk` + `disableAutoMode` för rutinerna.
Det stör inte bypass: ett val i lägesväljaren går före, och bypass slås på i appens
inställningar, inte i repofilen.

## Molnet (claude.ai/code)

**Bypass permissions finns inte i molnsessioner.** `defaultMode: "bypassPermissions"`
och `"dontAsk"` från settings-filer ignoreras tyst. Lägena som finns i rullistan
bredvid promptrutan: **Accept edits**, **Plan**, **Auto**.

Närmast bypass är **Auto**: en klassificerare granskar i stället för att fråga, och
valet kommer ihåg till nästa session. Auto syns bara när organisationen tillåter det
och modellen stödjer det.

## Skillnaden i korthet

| Läge | Frågar | Allow/deny-listor |
|---|---|---|
| Bypass permissions | aldrig (utom ett fåtal spärrar) | deny gäller, allow saknar betydelse |
| Auto | aldrig – klassificerare avgör | gäller |
| dontAsk | aldrig – nekar det som inte är tillåtet | bara allow gäller |
