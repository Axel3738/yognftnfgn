# matstrumpor/sop: Bruces tre guider

Bruce (Gilz Bruce Biazon) är Matstrumpors creative strategist i Manila. Han har
INTE tillgång till Evolve-kursen, så guiderna står på egna ben: engelska, en A4
var, korta rader, inga tankstreck. Markdownen är källan. PDF:en och Notion-sidan
byggs ur den, och rättas aldrig för hand.

| Fil | Vad | Notion |
|---|---|---|
| `BRUCE-WEEKLY-SELF-REVIEW.md` | "Your Monday check": måndag 15:00 Manila i Ad Roadmap. Redan skickad till honom som PDF | ingen sida |
| `BRUCE-HOW-WE-TEST-322.md` | "How we test ads: 3:2:2": uppställningen, testet, etiketterna med vad som görs sedan, briefen per koncept | https://www.notion.so/3ee270ab908c81aab3b9fd9a49806702 |
| `BRUCE-GROWTH-GUIDE-HOW-TO.md` | "How to use the Growth Guide": flikarna, vem som skriver vad i Ad Roadmap, STATUS, hans vecka (måndagskollen, tisdagens feedback, när Axel taggas) | https://www.notion.so/3ee270ab908c818db589d1a451295e30 |

De två Notion-sidorna ligger som barnsidor under Growth Guide-sidan
(`growthguide.json` → `sida_id`), skapade 2026-10-03 och tillbakalästa.

## Bygga om

```bash
node matstrumpor/sop/bygg.mjs matstrumpor/sop/<FIL>.md               # PDF bredvid (Chromium, A4)
node matstrumpor/sop/notion.mjs matstrumpor/sop/<FIL>.md             # torrt: blocken + skapa eller ersätta
node matstrumpor/sop/notion.mjs matstrumpor/sop/<FIL>.md --skarpt    # skriv; --ikon 🧪 bara för en NY sida
```

`notion.mjs` hittar sidan på titeln (markdownens H1) bland Growth Guide-sidans
barnsidor och ersätter innehållet: gamla block arkiveras, nya läggs in, allt läses
tillbaka (typ och text per block). Byter du H1 blir det en ny sida, och den gamla
står kvar. Två sidor med samma titel stoppar skriptet. Det rör aldrig databaserna,
raderna eller andra block på Growth Guide-sidan. Kräver `NOTION_TOKEN`.

## Regler när en guide ändras

- **En sida.** Kolla sidantalet efter bygget (Read på PDF:en). Axels dom på första
  versionen av måndagskollen var "hur mycket text som helst": stryk hellre än krymp.
- **Inga tankstreck** (— eller –). Skriv "to" eller kommatecken.
- **Inga andra fakta än repots.** Källorna: `konfig.json → meta.struktur` och
  `kadens`, `.claude/commands/matstrumporkungen.md` (3:2:2-reglerna, steg 4 till 6),
  `docs/os/evolve/ITERATIONS-PLAYBOOK.md` avsnitt 1, 4 till 6 och 11,
  `etikett.mjs` (etiketterna), `growthguide.mjs` (`ROADMAP`, `SEED_SLUT`,
  `SA_LASER_DU`) och `strategrapport/README.md` (tisdagsfeedbacken). Ändras en
  regel där ska guiden byggas om, både PDF och Notion.
- Etiketten för en annons utan leverans heter **⚪ No delivery** i Growth Guide
  (`growthguide.mjs RESULTAT`), så guiden använder samma tecken.
