# `bildannonser/` — Bäverbutikens bildannonser via kie.ai

Motorn bakom `/bildannonser` (`.claude/commands/bildannonser.md`), rutinen som
kör 20:00 varje kväll. Kommandofilen är facit för *vad* som ska göras; den här
mappen är bara verktyget.

**Egen mapp med flit.** `pipeline/` är Grillklinikens bildpipeline —
`pipeline/brand.mjs` sätter `LOGO_WORDMARK = 'GRILLKLINIKEN'` och egna
grillfärger. Att bygga Bäverbutikens annonser ovanpå den vore precis det
CLAUDE.md förbjuder. Ingenting här importerar från `pipeline/`.

## Kör

```bash
node bildannonser/run.mjs --jobb=<fil.json> --dry   # planen, inga credits
node bildannonser/run.mjs --jobb=<fil.json>         # skarpt
npm test                                            # 19 tester, ska vara gröna
```

Kräver env `KIE_API_KEY`. Noll externa beroenden — bara inbyggda `fetch`.

## Filerna

| Fil | Vad |
|---|---|
| `kie.mjs` | Klient mot kie.ai: `createTask` → polla `recordInfo` → bild-URL |
| `run.mjs` | Läser jobbfilen, granskar, genererar, laddar ner, skriver manifest |
| `output/<datum>/` | Genererade bilder + `_manifest.json` (committas inte) |

## Jobbfilen

Skrivs av rutinen ur Notion, inte för hand:

```json
{
  "datum": "2026-08-30",
  "jobb": [
    {
      "namn": "Beltgrinder_PD_4_1",
      "typ": "Image - Pending Approval",
      "hub": "Belt grinder creative hub",
      "notion_url": "https://app.notion.com/p/...",
      "prompt": "Bright workshop, chisel against the belt. Headline exactly: \"Slöa mejslar? Vässade på 10 sekunder.\"",
      "bildformat": "4:5",
      "referens_bilder": []
    }
  ]
}
```

- `typ` **måste** vara `Image - Pending Approval`. Allt annat avvisas med fel —
  videoannonser görs av redigerarna, aldrig här.
- `referens_bilder` tomt → `google/nano-banana`. Med bilder → `google/nano-banana-edit`,
  som matchar formatet på en Winning Creative.
- `bildformat` default `4:5` (Metas feed, 1080×1350).

## Att veta om kie.ai

Allt är asynkront. En 200:a på `createTask` betyder att jobbet lades i kö —
inte att bilden finns. Klienten pollar `recordInfo` var 5:e sekund med hård
timeout på 5 minuter, så ett hängande jobb aldrig låser nattkörningen.
`resultJson` kommer som JSON-**sträng**, inte objekt.
