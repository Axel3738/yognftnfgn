# `matstrumpor/ugc-loopar/` — rörliga UGC-loopar på matstrumpor.se (FÖRSLAG, inget live)

Axels beställning 2026-10-01: MatSokker (kopian i Norge, KD-2026-004) hade gjort sin sida
"lite mer nice" med GIF:ar ur VÅRA UGC-filmer. Axel vill ha samma sak på matstrumpor.se, "lite all
over", med våra egna filmer. **Förslag först, inget publiceras förrän vi är överens.**

Förslagssidan (privat): https://claude.ai/artifact/EHsQMJJ7jq4z3wG9uLip3Z — looparna spelar,
före/efter per förslag, Ja/Nej per förslag. Källan är `forslag.html`.

## Läget

| Datum | Vad |
|---|---|
| 2026-10-01 | 8 loopar klippta, 7 förslag byggda i en lokal kopia av sidan, skärmdumpar mobil + dator. **Inget ändrat i butiken.** Väntar på Axels Ja/Nej per förslag. |

## Looparna (`loopar.txt`)

| Namn | Källa | Språk |
|---|---|---|
| avslojandet | Sofie H1 0:10.6–0:13.95, nigirin rullas ut till en strumpa | alla |
| rullen | Nathalie 0:00–0:02.4, rullen vid ansiktet, strumpan faller, skratt | alla |
| uppackningen | Nathalie 0:05.8–0:08.95, håller upp lådan och skrattar | alla |
| ladan | Sofie H2 0:03.5–0:08, närbilder på lådan, locket av | alla |
| soffan | Nathalie 0:22.35–0:24.4, soffan med strumporna på | alla |
| strumpan_sv | Katarina "Sushiälskaren" 0:16.5–0:18.8 | ⛔ bara svenska |
| reaktionen_sv | Katarina "Sushigalen ungen" 0:09–0:11.8 | ⛔ bara svenska |
| tamago_sv | Katarina "Sushiälskaren" 0:25.3–0:27.1 | ⛔ bara svenska |

Mätt 2026-10-01: alla åtta tillsammans 2,2 MB som mp4 (600 × 600, 30 bilder/s).
MatSokkers två GIF:ar på produktsidan väger 19,6 MB (500 × 500, 10 bilder/s).

### Tre regler som sitter i klippen

1. **Ingen inbränd svensk text.** Alla fem källfilmerna har svenska captions inbrända, med
   överkanten kring y ≈ 820 av 1280 (mätt på tre filmer). Kvadraten 720 × 720 läggs därför med
   överkanten på y = 0–80, så den slutar ovanför texten. En loop med text i bild hade visat
   svenska för kunder på de andra tretton språken.
2. **⛔ Katarina syns bara för svenska kunder** (Axels regel 2026-09-27: hennes UGC lämnar aldrig
   Sverige). På sajten betyder det ett villkor på `localization.country.iso_code == 'SE'` och
   svenskt språk; annars byts hennes loop mot en av Nathalies eller Sofies.
3. **Video, inte GIF.** `<video autoplay muted loop playsinline>` ser ut och beter sig som en GIF
   men väger en tiondel. Poster-bilden (`<namn>.jpg`) visas tills videon spelar och för den som
   stängt av rörelse.

## De sju förslagen

| Nr | Var | Vad |
|---|---|---|
| 1 | Startsidan, toppbilden | Mobil: avslöjandet i stället för fotot. Dator: fotot kvar, loopen som kort bredvid texten |
| 2 | Startsidan, under Trustpilot-raden | Nytt band "Så ser det ut när lådan öppnas", fem loopar att svepa |
| 3 | Startsidan, "Strumpor man aldrig blandar ihop" | Rullen ovanför texten, halva rubriken orange |
| 4 | Startsidan, "Som de används" | Fyra loopar i stället för AI-illustrationerna; raden "Miljöbilderna är AI-genererade illustrationer." försvinner |
| 5 | Produktsidan, under leveransrutan | Tre små loopar: Lådan, Avslöjandet, Reaktionen |
| 6 | Produktsidan, beskrivningen | Leverantörens `ezgif-…webp` (samma film som MatSokker har) → Uppackningen; Avslöjandet under "Ser ut som sushi. Är strumpor." |
| 7 | Produktsidan, före recensionerna | Mörkt block: Rullen + orange knapp "Lägg i varukorgen" + hjältetextens egna ord |

All text i förslagen finns redan på sajten, utom etiketterna (Lådan, Avslöjandet …) och
bandets rubrik "Så ser det ut när lådan öppnas".

## Verktygen

```bash
bash matstrumpor/ugc-loopar/klipp.sh                      # källorna ur kontot + looparna → output/loopar/
node matstrumpor/ugc-loopar/mockup.mjs start 390          # före/efter i en lokal kopia av startsidan (mobil)
node matstrumpor/ugc-loopar/mockup.mjs produkt 1440       # … produktsidan på dator
python3 matstrumpor/ugc-loopar/collage.py                 # före/efter-collagen + jpg-kopior (pip install pillow)
```

`mockup.mjs` laddar matstrumpor.se som svensk kund (`?country=SE`), tar en bild av varje område,
lägger in förslagen i DOM:en och tar en bild till. Looparna serveras lokalt via `page.route`, så
inget hämtas från eller skrivs till butiken. ⚠️ Headless-Chromium hoppar inte pålitligt i en
video (alla skärmdumpar visade första rutan), så skärmdumparna visar loopens valda bildruta som
`<img>`. I butiken blir det video.

## När Axel sagt Ja (nästa session)

1. Ladda upp looparna (mp4 + jpg) i Matstrumpors Shopify Files.
2. En sektion + snippet i temat (`ms-loop`), med Katarina-villkoret och `loading`-logik som bara
   spelar loopen när den syns (IntersectionObserver).
3. Bygg i en **kopia av det publicerade temat** och visa Axel förhandsvisningen. Publiceras först
   på hans ord.
4. Läs som kund i Sverige och i minst ett annat land (`matstrumpor/marknader/kundvy.mjs`):
   Katarina syns i SE och inte utomlands, inga svenska ord läcker.
