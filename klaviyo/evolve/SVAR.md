# Evolve-botens svar om e-post (minnet, så nästa session slipper fråga igen)

Evolve är communityt Axel är med i (Discord). Servern har en AI-bot som kan hela
Evolve-kursen. Svaren nedan klistrade Axel in ordagrant i chatten. `[C1]`–`[C4]` är
botens egna källhänvisningar till Discord-inlägg. Vi har inte läst de inläggen själva.

## Svar 1, 2026-09-24: ska vi använda Klaviyo?

> Klaviyo is the clear answer — Shopify's native email and flow apps are too limited on
> customizability, and everyone in the community defaults to Klaviyo. [C1][C2]
>
> Billy's recommended tech stack [C3]:
> * Email: Klaviyo
> * SMS (US/CA): OneText — or Postscript as an all-in-one alternative for all countries
> * SMS (rest of world): Klaviyo
> * Popups: AliaLearn (superior) or Optimonk (simpler)
> * Anonymous emails: OpenSend (monitor deliverability)
> * 1st-party email data: Aimerce
>
> Walkthrough: https://www.loom.com/share/e96772698a394b76b1d52e8b2a8020e0 [C3]
>
> One thing to do once you're in Klaviyo: Change attribution settings from the default
> 5-day open / 5-day click to click-only (5-day or shorter), and exclude Apple Mail
> Privacy opens — otherwise your attribution gets inflated by Apple users who never
> actually opened the email [C4].
>
> If you're not at scale yet, don't overcomplicate with granular segmentation and A/B
> testing. The highest-leverage tests are subject line, sender name, preview text, topic,
> and the core idea of the email [C3].

Billys Loom heter "Building an In-House Email and SMS Strategy for Brands". Enligt
beskrivningen gäller den varumärken under 10 miljoner dollar om året. Rådet är att ha
en designer och en retention-strateg in-house, och att lära upp en person från grunden.
Transkriptet går inte att läsa härifrån, eftersom Loom kräver en Atlassian-koppling.
Allt vi vet står i beskrivningen, läst 2026-09-24.

### Vad vi gjort med svaret

| Råd | Hos oss |
|---|---|
| Klaviyo | Redan valt, kontot TMFt7M finns. |
| Attribution bara på klick, högst 5 dagar, Apple-öppningar exkluderade | Axels klick i Klaviyo (Settings → Attribution). Står i `sop/E00`, `sop/E06` och kommandot `kolla`. `rapport.mjs` dömer redan aldrig på öppningar. |
| Inte för många segment eller A/B-tester före skala | Vi kör med bara 3 kampanjsegment (uppvärmningstrappan). Enda A/B-testet är ämnesraden, och den finns redan i varje kampanj. |
| Testa ämnesrad, avsändarnamn, förhandstext, ämne och kärnidé | Ämnesrad A/B/C finns. Ämne och kärnidé är varje kampanjs `memo`. Avsändarnamnet testas senare, ett i taget. |
| Popup (AliaLearn/Optimonk) | Axels beslut, kostar pengar. Kontot saknar formulär helt (mätt 2026-09-24). |
| ⚠️ OpenSend ("anonymous emails") | **Använd inte i Sverige.** Verktyget hittar e-postadresser till besökare som aldrig lämnat dem. Att mejla dem reklam bryter mot marknadsföringslagen 19 §, som kräver samtycke, och GDPR. Rådet kommer från en amerikansk stack. |
| SMS | Inte nu. Klaviyo SMS utanför USA om det blir aktuellt. |
