# Kundmejl för majavakauppa.fi (finska)

*Skapad 2026-08-23. Finska versioner av mallarna i `email/mallar/` —
samma design (Impulse-temat är samma export: rött `#dd1d1d`, svart, Anton),
men innehållet är grundat i **majavakauppa.fi:s egna policysidor**, inte
de svenska. Klistras in i majavakauppa.fi:s admin på samma sätt som i
`email/README.md`.*

## Faktaskillnader mot svenska butiken (viktiga!)

| | baverbutiken.se | majavakauppa.fi |
|---|---|---|
| Leveranstid i mejlen | 1–2 / 5–10 arbetsdagar | **Inga dagssiffror** — "arvioitu toimitusaika näytettiin kassalla" (policyn anger inga dagar) |
| Retur | 30 dagars returpolicy + 14 d ångerrätt | **Endast 14 päivän peruuttamisoikeus** (kuluttajansuojalaki) |
| Återbetalning | inom 10 arbetsdagar, eskalering efter 15 | **senast 14 päivän kuluessa**, ingen eskaleringsregel |
| Moms | oklart läge (fråga Axel) | ingår, 25,5 % — inga tullavgifter (EU) |

Skriv **aldrig** in svenska dagssiffror i de finska mallarna — finska
policysidorna lovar inga, och då får mejlen inte heller göra det.

## Ämnesrader

| Mejl | Ämnesrad |
|---|---|
| Orderbekräftelse | `{{ customer.first_name }}, {{ name }} on vastaanotettu – pakkaamme sitä` |
| Fraktbekräftelse | `{{ customer.first_name }}, tilauksesi on pakattu` |
| Ute för leverans | `{{ customer.first_name }}, {{ name }} saapuu sinulle tänään` |
| Levererad | `{{ customer.first_name }}, {{ name }} on perillä` |
| Order annullerad | `Tilaus {{ name }} on peruutettu` |
| Drip "På väg" (automation, +4 d) | `Pakettisi on matkalla` |
| Recensionsmejl (automation, +14 d) | `1, 2 vai 5 tähteä — minkä annat?` |

## Länkmål (verifierade 2026-08-23)

- Nyhetsbrev: `{{ shop.url }}/#newsletter-footer` — formuläret finns i footern ✅
- Recensionsmejlets 1–3 stjärnor: `/pages/ota-yhteytta` (kontaktsidan) ✅
- 4–5 stjärnor: `https://fi.trustpilot.com/evaluate/majavakauppa.fi` —
  **overifierat**, kolla att Trustpilot-profilen finns. Samma gating-varning
  som i `email/README.md` gäller.

## ⚠️ Två saker Axel måste reda ut

1. **Två olika supportadresser:** Shopify-inställningen (det mallarna
   använder via `{{ shop.email }}`) säger `asiakastuki@majavakauppa.fi`,
   men policysidorna på sajten säger `asiakaspalvelu@majavakauppa.fi`.
   Bestäm en och rätta den andra — annars pekar mejlen och sajten åt olika
   håll.
2. **Rabattkoden är skapad** (2026-08-23, via Shopify-kopplingen):
   `TERVETULOA10` — 10 % på allt, alla kunder, ingen slutdatum, **max en
   användning per kund**. Kvar för Axel: sätt upp välkomstautomationen
   (Marknadsföring → Automatiseringar) som mejlar koden till nya
   prenumeranter — utan den lovar nyhetsbrevs-blocket i mejlen en kod som
   aldrig kommer. Obs: en delad kod kan läcka till rabattkodssajter;
   uppgradera till automationens unika engångskoder när det blir aktuellt.

Setup-stegen (klistra in, automationer, välkomstrabatt) är identiska med
`email/README.md` — bara i majavakauppa.fi:s admin i stället.
