# Hämta Meta-token till annonskostnaden

Panelen läser annonskostnad per dag från Metas Marketing API. Det kräver en
long-lived access token med behörigheten `ads_read`. Token går ut efter
**60 dagar** och måste förnyas — det här är vägen som fungerar.

## Så hämtar du den

1. **Graph API Explorer** → `developers.facebook.com/tools/explorer`
2. **Meta App**: `Claude API ADs uploader` (app-ID `101664773466718`)
3. **Behörigheter**: lägg till `ads_read`
4. **Generate Access Token** → godkänn i dialogen
5. Kopiera token
6. **Access Token Debugger** → `developers.facebook.com/tools/debug/accesstoken`
7. Klistra in token → **Felsök** → längst ner: **Förläng åtkomsttoken**
8. Kopiera den *förlängda* token (60 dagar) — det är den som ska in i appen

## Var den läggs in

Appen → **Inställningar** → **Access token**. Annonskonto-ID i fältet ovanför:

| Butik | Annonskonto | ID |
| --- | --- | --- |
| Bäverbutiken | MagiBorsten | `1867947880635861` |
| Grillkliniken / Mastern | SnarkLös | `1346450049878358` |

Samma token fungerar för båda kontona så länge ditt Meta-konto har åtkomst till
dem — det är kontot, inte annonskontot, som token tillhör. Token sparas per
butik, så den måste klistras in i varje installation.

Ett tomt token-fält betyder "behåll den befintliga" — fältet raderar aldrig en
sparad token av misstag. När du sparar rensas cachad annonskostnad, så att inget
från det gamla kontot ligger kvar.

## Vägen som *inte* fungerar

Systemanvändare via Business Manager. Den kräver att appen ligger i portföljen,
och `Claude API ADs uploader` gör inte det — försöket att göra anspråk på appen
gav fel. Det är återvändsgränden, inte ett steg som gick att lösa. Använd
Explorer-vägen ovan.

## När token gått ut

Annonskostnaden slutar uppdateras. Panelen räknar då **inte** de dagarna som
noll — de flaggas istället som saknad data, täckningsbidraget markeras som
ofullständigt och en röd banner listar dagarna. Det är designat så med flit:
en tyst nolla ser ut som en fantastisk vinstmarginal.

Åtgärd: gör om stegen ovan och klistra in den nya token.
