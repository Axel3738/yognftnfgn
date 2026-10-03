# bokforing/ — månadens kvitton ur kontoutdraget

Axels beställning 2026-10-03: ge Claude kontoutdraget, låt Claude hämta alla kvitton
ur mejlen, och lägg resten i en Cowork-prompt för det som bara går att ladda ner på sajterna.

## Så gick september 2026 till

1. Lunar-kontoutdraget (PDF) lästes med `pdftotext -layout`. 564 rader. Saldokedjan
   kontrollerades rad för rad: ingående saldo + belopp = utgående på varje rad.
2. Raderna delades på handlare och söktes i Gmail (`axelodhner.business@gmail.com`).
   Bilagorna hämtas med `get_message` i formatet `RAW`. Ett mejl över ~40 kB sparas
   av verktyget som fil i stället för att svara inline, och då avkodas MIME-delarna
   med Python. Mindre mejl läses som `PLAIN_TEXT`. Mejl utan PDF-bilaga renderas
   till PDF i Chromium.
3. Shopify lästes per butik via API: ordrar för september och, där appen har
   `read_shopify_payments_payouts`, utbetalningarna med avgifter.
   Mätt 2026-10-03: bara CaraShell och Matstrumpor har den rättigheten. Deras 25
   utbetalningar stämde mot kontoutdraget på kronan.
4. Meta: spend per annonskonto ur insights. Graph API har ingen väg till
   kvittona (`transactions`-kanten finns inte i v23, mätt), så de hämtas i
   Billing hub via Cowork.

Zip-filen med kvittona committas aldrig. Den innehåller kunders och leverantörers
uppgifter och skickades till Axel i sessionen.

## Mätt i september, inte en evig lag

- Kvitton för Claude, Anthropic, Kie, HeyGen, Google Ads, Workspace, Klaviyo,
  Notion, Skool, WeTracked, Spotify, Discord och OpenAI kom INTE till Gmail-kontot.
  De går till stonebite.org-adresserna eller saknas helt som mejl.
- Metas kvitton fanns inte i Gmail alls.
- Butikernas Loopia-brevlådor gick inte att läsa: lösenorden fanns inte i miljön.

## Cowork

- `cowork/1-september-2026.txt` — hämtar Meta, Shopify-utbetalningar, Google,
  AI-tjänsterna och PayPals månadsutdrag. Läs-bart: betalar, ändrar och raderar aldrig.
