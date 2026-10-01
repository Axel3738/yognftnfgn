# `matstrumpor/ugc-loopar/` — rörliga UGC-loopar på matstrumpor.se (LIVE sedan 2026-10-01, förslag 1–6)

Axels beställning 2026-10-01: MatSokker (kopian i Norge, KD-2026-004) hade gjort sin sida
"lite mer nice" med GIF:ar ur VÅRA UGC-filmer. Axel vill ha samma sak på matstrumpor.se, "lite all
over", med våra egna filmer. **Förslag först, inget publiceras förrän vi är överens.**

Förslagssidan (privat): https://claude.ai/artifact/EHsQMJJ7jq4z3wG9uLip3Z — looparna spelar,
före/efter per förslag, Ja/Nej per förslag. Källan är `forslag.html`.

## Läget

| Datum | Vad |
|---|---|
| 2026-10-01 | 8 loopar klippta, 7 förslag byggda i en lokal kopia av sidan, skärmdumpar mobil + dator. |
| 2026-10-01 kväll | **LIVE: förslag 1–6** (Axels order: "Kör allt förutom det mörka blocket … på produktsidan så ändrar du allt i produktbeskrivningen"). Förslag 7 (mörka blocket) är INTE byggt. Läst som kund i SE, NO, DE, US och JP: Katarina bara i SE, texterna på kundens språk, 0 Liquid-fel. |

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

## Live: vad som ändrades 2026-10-01

```bash
bash matstrumpor/ugc-loopar/klipp.sh                              # looparna (mp4 + jpg) ur kontot
node matstrumpor/ugc-loopar/filer.mjs --skarpt                    # in i filarkivet → filer.json (committas)
node matstrumpor/ugc-loopar/live.mjs --steg tema --skarpt         # startsidan, förslag 1–4
node matstrumpor/ugc-loopar/live.mjs --steg rubrik --skarpt       # orange del i berättelsens rubrik, 13 översättningar
node matstrumpor/ugc-loopar/live.mjs --steg produkt --skarpt      # produktbeskrivningen, förslag 5–6, alla 14 språk
node matstrumpor/ugc-loopar/kundvy.mjs --bilder                   # som kund: SE/NO/DE/US/JP, exit 1 = Katarina utomlands
node matstrumpor/ugc-loopar/live.mjs --aterstall --skarpt         # ÅNGRA: originalen ur backup/ tillbaka
```

Utan `--skarpt` skriver inget skript något. Originalen (image-banner, rich-text, index.json,
produktbeskrivningen på 14 språk, rubrikens 13 översättningar) sparades i `backup/` före första
skrivningen och committas.

**Temat** (publicerat: "Matstrumpor CRO + storleksrad 2026-09-17"): nya `snippets/ms-loop.liquid`
(videon + Katarina-spärren), `ms-loop-text.liquid` (texterna ur `sprak.json`, 14 språk),
`ms-loop-hero.liquid`, `sections/ms-loop-band.liquid`, `ms-loop-grid.liquid`,
`assets/ms-loopar.css`, `ms-loopar.js` (laddar en loop först när den syns, pausar när den lämnar
skärmen, spelar inget vid "minska rörelse"). `image-banner.liquid` och `rich-text.liquid` fick en
inställning `ms_loop` (rullista, "Matstrumpor: loop") — utan värde beter de sig som förut.
`index.json`: hero `ms_loop: avslojandet`, berättelsen `ms_loop: rullen` + `<em>` i rubriken,
`ms_loop_band` efter Trustpilot-raden, `ms_loop_grid` efter `ugc_galleri`, och `ugc_galleri` +
`ugc_markning` (AI-raden) står kvar med `disabled: true`.

**Produktbeskrivningen** (sushi-strumpor, sv + 13 översättningar via `translationsRegister`):
bandet med tre loopar överst, Uppackningen i stället för leverantörens `ezgif-…webp` (med dess
alt-text), Avslöjandet under "Ser ut som sushi. Är strumpor.". Videorna har `autoplay muted loop
playsinline` i HTML:en, för beskrivningen kan inte ladda temats skript.

### Mätt och lärt samma kväll

- ⛔ **Leverantörens webp i beskrivningen vägde 15,7 MB** (`content-length` 15 735 106). De fem
  looparna som ersätter den väger 1,4 MB tillsammans (uppackningen 239 kB).
- **Produkten har ingen egen SEO-beskrivning**, så Shopify tar meta- och delningstexten ur
  beskrivningens början. Etiketterna i bandet ritas därför av CSS ur `data-t` (en `<style>` i
  beskrivningen, som `strip_html` tar bort med innehåll) — meta-texten börjar fortfarande "Ingen
  jublar åt tvättmedel…". `kundvy.mjs` visar meta-texten per språk.
- **Dawns `.media > *:not(.zoom)…` (0,3,0) sätter `display:block`** på allt i bildytan: mobilloopen
  syntes bakom textrutan på dator tills regeln fick id + `!important` (`ms-loop-hero.liquid`).
- **Shopify vill ha sektionsnamn på max 25 tecken** ("Invalid schema: name is too long").
- **En video får staged-filnamnet av sig själv**; `fileUpdate` på filnamn vägras för video.
- **Ändrad svensk rubrik gör översättningarna inaktuella** (alla 13 var markerade efter
  temaskrivningen) — `--steg rubrik` registrerar dem igen med nya digesten, läst tillbaka.
- **Shopifys robotspärr ("Verify you are human")** slog till mot containern en gång; `kundvy.mjs`
  väntar och försöker igen.
- ⚠️ **Chromium här spelar inte H.264**, så ingen loop har setts RÖRA sig härifrån — bara postern.
  Filerna är vanlig mp4 (H.264 High, faststart) som spelas i Safari, Chrome och Firefox.

## Förslag 7 (inte byggt)

Det mörka blocket med knapp före recensionerna valde Axel bort 2026-10-01. Mockupen finns kvar i
`mockup.mjs` (`#ms-loop-mork`) om det ska prövas senare.
