# Lockbete — falska vinnare i Ad Library (Axels beslut 2026-09-26)

Tre engagemangskampanjer i MagiBorsten `1867947880635861` med Bäverbutikens
gamla svenska annonsinlägg för de tre produkter som har sämst vinstbidrag
(90 dagar). Tanken är att kopierare ska ta dem för vinnare.

- Produkter: Bordtennisnätet (-2 949 kr), Spabadskapellet (-2 075 kr), Bänkhyllan (-1 903 kr).
- 500 kr/dag per kampanj, bara Indien, optimerat på inläggsengagemang.
- Inga nya creatives: annonserna pekar på de befintliga inläggen (`object_story_id`),
  så likes och kommentarer hamnar på samma inlägg som Ad Library visar.
- Alla namn börjar med `LOCK_`. Commission räknar dem inte (`commission/berakning.mjs`).
- `konfig.json` = vad som byggs, `skapat.json` = id:n. `node lockbete/bygg.mjs` vägrar
  bygga om skapat.json finns. `--aktivera` slår bara på id:n ur skapat.json.

⚠️ Ad Library visar räckvidd bara för annonser som visats i EU. Visningarna i Indien
syns inte där, bara likes och kommentarer på inlägget. Sverige läggs till senare
(Axels plan): adsetets `targeting.geo_locations.countries` → `["IN","SE"]`.
