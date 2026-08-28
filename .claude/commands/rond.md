# /rond – Dagens rond på annonskontot

Argument: `$ARGUMENTS` — valfritt datum (`YYYY-MM-DD`). Utan argument: idag.

Ersätter den manuella rundan i Bäverpanelen. Gäller **bara Bäverbutiken /
MagiBorsten `1867947880635861`**. Grillkliniken (SnarkLös `1346450049878358`)
rörs aldrig av det här kommandot.

**Ronden ändrar ingenting i Meta.** Den läser, räknar och föreslår. Axel
godkänner rad för rad. Först när han skrivit vilka rader som ska köras får du
ändra något — och då loggas varje ändring.

Räkningen görs av `agent/besked.mjs`, aldrig i huvudet. Din uppgift är att
hämta rätt siffror, mata in dem oförändrade och leverera svaret.

## 1. Hämta läget ur Meta

Alla anrop går till `mcp__ADsmanagaer__ads_get_ad_entities` med
`ad_account_id: "1867947880635861"`.

**a) Aktiva kampanjer, senaste 3 dagarna** — `level: "campaign"`,
`date_preset: "last_3d"`, `filtering` på `campaign.effective_status IN ["ACTIVE"]`,
`fields: ["id","name","effective_status","daily_budget","amount_spent","purchase_roas","omni_purchase","created_time"]`.

**b) Samma kampanjer sedan start** — samma anrop med `date_preset: "maximum"`.
Ger `spend_total`.

**c) Dygn för dygn, senaste 7 dagarna** — samma anrop med
`date_preset: "last_7d"` och `time_increment: "1"`. Ger serien som
back-dagsräknaren behöver.

Fältnamnen är exakta: `amount_spent`, `purchase_roas`, `omni_purchase`.
Inte `spend` eller `purchases`. Använd **aldrig** `omni_purchase_values` —
den har returnerat intäkt 100× för lågt (se CLAUDE.md).

## 2. Skriv `agent/kontodata.json`

Klistra in siffrorna **ordagrant** som Meta gav dem, inklusive formatet
`"1 000,00 kr (SEK)"`. Räkna inte om något, avrunda inte, fyll inte i
tomma fält. Saknas ett värde: låt det vara `null`.

```json
{
  "hamtad": "<tidsstämpel för anropet, ISO>",
  "ad_account_id": "1867947880635861",
  "ad_account_namn": "MagiBorsten",
  "idag": "<YYYY-MM-DD>",
  "kampanjer": [
    {
      "id": "120249850522830291",
      "namn": "Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18",
      "effective_status": "ACTIVE",
      "daily_budget": "2 500,00 kr (SEK)",
      "spend_3d": "20 304,78 kr (SEK)",
      "roas_3d": "1.456467",
      "kop_3d": 70,
      "spend_total": "51 663,22 kr (SEK)",
      "dygn": [{ "datum": "2026-08-27", "roas": 1.316813 }]
    }
  ]
}
```

Är en kampanj aktiv men saknas i `agent/produktkarta.json`: lägg till den där
med `lage` (`test` eller `drift`) och en motivering. Regeln står i filen.
Gissa aldrig ett break-even-tal — står det `TBC` i kampanjnamnet ska det
förbli tomt, och ronden säger då själv att domen inte går att fälla.

## 3. Kör ronden

```bash
node agent/rond.mjs
```

Avbryter den med `RONDEN AVBRÖTS` — läs felet och åtgärda. Kör aldrig vidare
på halv data. Vanligaste orsaken är fel konto i `kontodata.json`.

## 4. Leverera

Ge Axel rapporten **ordagrant som skriptet skrev den**. Korta inte ner den,
skriv inte om beskeden, lägg inte till egna domar. Har du något eget att säga
kommer det efter rapporten, tydligt märkt.

Rader märkta ⚠ ligger nära en zongräns — säg uttryckligen att just de bör
kollas i Ads Manager först.

## 5. Logga

Skriv en rad per kampanj i `agent/budgetlogg.jsonl` med `agent/logg.mjs`
(`skrivRad`). Loggen är systemets minne — utan den fungerar varken
"högst var tredje dag" eller "7 dygn i rad back".

```json
{
  "datum": "2026-08-28",
  "kampanj_id": "120249850522830291",
  "kampanj_namn": "Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18",
  "ad_account_id": "1867947880635861",
  "kod": "HALVERA",
  "gammal_budget": 2500,
  "ny_budget": 1250,
  "genomford": false,
  "roas_3d": 1.456467,
  "spend_3d": 20304.78,
  "kop_3d": 70,
  "break_even": 1.5,
  "break_even_kalla": "kampanjnamnet",
  "hamtad": "2026-08-28T13:20:00Z",
  "motivering": "<beskedets motivering>",
  "godkand_av": null
}
```

`genomford: false` betyder "föreslaget, inte kört". Sätt `true` och
`godkand_av: "Axel"` **först** när han sagt ja och ändringen faktiskt är
gjord i Meta. Ett förslag som aldrig godkändes ska inte bromsa nästa rond.

## 6. Om Axel godkänner rader

Ändra budgeten med `mcp__ADsmanagaer__ads_update_entity` — aldrig med
`pipeline/meta.mjs` (den wrappern defaultar till Grillklinikens konto).
Ändra bara de rader han namngett. Uppdatera loggraden till `genomford: true`.
Committa loggen.

## DEFINITION OF DONE
- [ ] Alla tre Meta-anropen gjorda mot `1867947880635861`
- [ ] `agent/kontodata.json` skriven med ordagranna siffror
- [ ] Aktiva kampanjer som saknades tillagda i `agent/produktkarta.json`
- [ ] `node agent/rond.mjs` kört utan avbrott
- [ ] Rapporten levererad ordagrant, ⚠-rader utpekade
- [ ] En loggrad per kampanj i `agent/budgetlogg.jsonl`
- [ ] Loggen committad och pushad
