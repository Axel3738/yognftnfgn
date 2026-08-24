# VoC-mining — Reddit-trådar till behovskategorier (Axels framework)

**Skapat 2026-08-24 på Axels instruktion.** Första körningen: fiskespöhållaren,
9 trådar (~360 sidor skärmdumpar). Detta dokument är normativt för hur
kundundersökningsmaterial i trådform tas in i systemet. `/cs` steg 1 och 3
refererar hit.

## Varför

Ett koncept får aldrig födas ur tomma intet (CLAUDE.md). VoC-mining gör riktiga
kundröster till den tredje källtypen vid sidan av playbook-vinnare och
konkurrentsignaler — och den starkaste, eftersom den ger kundens EGNA ord att
bygga hooks och copy på. Hårsnodds-annonsen (Rodholder_PD_18) föddes ur exakt
en sådan insikt.

## Flödet

### 1. Insamling (Axel eller VA — ingen Claude-inblandning)

- Hitta trådar där målgruppen pratar om produktens problemdomän: subreddits för
  nischen + angränsande situationer (transport, förvaring, resor, DIY-hack).
  Sök på engelska; problemet är globalt även om annonsen är svensk.
- Skärmdumpa HELA tråden (t.ex. GoFullPage → PDF). Ju fler kommentarer desto
  bättre — frekvens är signalen.
- Släpp PDF:erna i en Claude-session med `/cs <produkt-id>` eller be om
  VoC-mining rakt av.

### 2. Extraktion (parallella subagenter — mekanik, inte strategi)

- Dela varje PDF i sidintervall om max 20 sidor; en subagent per intervall
  (modell: sonnet — extraktion är mekanik, se modellpolicyn).
- Varje agent returnerar strukturerat per påstående:
  `quote` (kort ordagrant citat, engelska) · `paraphrase_sv` (omskrivet som
  fristående påstående på svenska — ALDRIG ett svar på trådens fråga) ·
  `need` (behovet i 2–6 ord) · `context` (situation: bil, båt, cykel, resa...).
- Järnregler: hitta ALDRIG på eller fyll i; hoppa över skämt/off-topic;
  samma poäng från flera användare tas med varje gång — **frekvens är signal**.
- Okänt sidantal (skärmdumps-PDF:er ser ut som 2 sidor för pypdf men pagineras
  vid läsning, ~96 KB/sida): uppskatta via filstorlek, låt agenten trimma
  intervallet när sidorna tar slut.

### 3. Kategorisering (huvudsessionen — detta är analysen)

- Gruppera påståendena per behov/önskemål, inte per tråd.
- Räkna frekvens per kategori (antal röster) — det är prioriteringsordningen.
- Skilj: vad de VILL (önskemål), vad de GÖR i dag (hack/workarounds — våra
  "fiender" i konflikt typ A), vad de ÄR RÄDDA för (risk/skydd), vad de
  IRRITERAS av (pain).
- Kundens egna ord bevaras i citaten — de är råmaterial för hooks och copy.

### 4. Leverans och lagring

- **Repo:** `docs/voc-reddit-<produkt-id>-<datum>.md` — kategorier, frekvens,
  omskrivna påståenden + originalcitat, källtrådar. Detta är källdokumentet
  som `/cs` läser.
- **Till Axel:** enkel PDF — svart text, rubriker per kategori, punktlistor
  med de omskrivna påståendena. Ingen färg, inga visuella element.
- **dna.md:** topp-3-behoven skrivs in under Winning DNA/kundspråk med källa
  "VoC Reddit <datum>" och märkning bevisad-i-VoC (≥3 oberoende röster) eller
  enstaka-röst.

### 5. Användning i batcher (`/cs` steg 3)

- Varje nytt koncept ska när VoC finns peka på sin behovskategori + minst ett
  citat. Ett koncept utan källa är en gissning och märks så.
- Kundens workarounds (hack) är färdiga fiender för konflikt typ A-annonser.
- Copy-subagenten får relevanta citat + paraphrase_sv som faktabas — den får
  använda kundens formuleringar men aldrig fabricera citat eller påstå att
  "en kund sa" i annonstext (recensioner ≠ Reddit-röster).

## Grindar

- Ingen VoC-kategori får presenteras utan minst ett verifierbart citat bakom.
- Reddit-röster är research, inte recensioner — de får forma vinklar och språk
  men aldrig visas som kundomdömen i annonser.
- Engelska citat översätts i copy-arbetet, aldrig ordagrant i annons utan
  omskrivning till svenska.
