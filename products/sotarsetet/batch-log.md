# Batch-log — Sotarsetet med Böjliga Stänger

## Batch #1 — 2026-09-19 (Joshs testbatch, före OS:et)

11 annonser launchade 2026-09-19 i kampanj `120250284693380291`, 1 800 kr/dag:
`Sotarset_PD_1_H1–H3`, `G_1_H1–H3`, `CS_1_H1–H3`, `SP_1_H1–H3` (CS_1_H1 syns
inte bland de aktiva 2026-09-21). Utfall efter två dygn: se `dna.md` —
PD_1_H2 + PD_1_H3 bär 95 % av spenden och 23 av 25 köp.
⚠️ SP-annonserna påstår fem stjärnor + "30 dagars öppet köp", CS-annonserna
"lagret är begränsat" / "fri frakt över 300 kr" — inget av det står på sidan.
Live-regeln 2026-09-15: de rörs inte, men anmärkningen går till redigeraren.

## Startskott — 2026-09-21

`OPS_STARTSKOTT` loggat och postat i `#ops-startskott`: 3 058 kr, 25 köp,
CPA 122 kr mot BE-CPA 307, ROAS 4,04, 39,1 % vinst. Inget OPS-konto bär
produkten ännu (`915422744950975` avläst: ingen SOTARSET-kampanj).
Budget samma morgon 1 800 → 2 150 kr (SKALA, verifierad).

## Batch #2 — 2026-09-21 (`/rond-auto` steg 4b, `forsta_batch`, första OS-batchen)

Hub: **Chimney sweep set creative hub** (db `3e2270ab-908c-8171-bbae-fff6adedbe5a`,
datakälla `collection://af6270ab-908c-8256-879b-07429bfd3596`), dubblett av
MALL Creative hub MALL, skapad och omdöpt i samma körning. 14 rader i Draft,
verifierade med notion-fetch (PD_6_1) + SQL. Drive: Joshs produktmapp
`1lJZewCo50svHhA9Cob47VdVVf85EZd9D` (ingen ny batchmapp).

**Läget som batchen byggdes på:** två bedömbara annonser (PD_1_H2 +2 410 kr,
PD_1_H3 +1 714 kr), resten utsvultna. Break-even-CPA 307 kr på AOV 495 kr.
Priset avläst live: 459 kr / 599 kr.

| Annons | Format | Hypotes | Isolerad variabel | Källa |
|---|---|---|---|---|
| `Sotarset_PD_2_H1` | video | räckvidden bakom kaminen/torktumlaren är en egen smärta | vinkeln (räckvidd) | sidraden + PD_1_H2 |
| `Sotarset_PD_3_H1` | video | stel stång fastnar i kröken, böjlig går igenom (konflikt typ A) | vinkeln (jämförelse) | sidraden + copy-regler |
| `Sotarset_PD_4_H1` | video, **villkorad** | riktigt sot på tidningspapper som bevis — bara med äkta material | beviset | PD_1_H2 + gissning |
| `Sotarset_UG_1_H1` | video | UGC-talare vid kaminen, ingen voiceover | formatet (talare) | gissning |
| `Sotarset_PD_5_H1` | video | räknad uppbyggnad 1…9 → 3,69 m, "bygg bara den längd du behöver" | hooken | sidraden + gissning |
| `Sotarset_CS_2_H1` | video | ärligt erbjudande 599 → 459 utan brådska; CS_1 fick aldrig spend | erbjudandet | gissning + sidpriset |
| `Sotarset_PD_1_H4` | video | PD_1_H2:s kropp, nya 0–3 s: borsten kommer ut svart | första 3 sekunderna | förälder PD_1_H2 |
| `Sotarset_PD_1_H5` | video | PD_1_H2:s kropp, nya 0–3 s: stången böjer genom kröken | första 3 sekunderna | förälder PD_1_H2 |
| `Sotarset_PD_2_1` | bild | räckviddsvinkeln validerad billigt som statisk | vinkeln | sidraden |
| `Sotarset_PD_3_1` | bild | stel/böjlig som tvådelad bild | vinkeln | sidraden |
| `Sotarset_PD_4_1` | bild, **villkorad** | sotet på tidningen som foto — bara äkta | beviset | gissning |
| `Sotarset_CS_2_1` | bild | 459 kr med 599 struket, inget annat | erbjudandet | sidpriset |
| `Sotarset_G_2_1` | bild | gåva till honom med kamin — G-videorna svalt | vinkeln (gåva) | befintlig G-copy |
| `Sotarset_PD_6_1` | bild | "Det här får du" — spec-lista på riktigt foto med nio stänger | vinkeln (spec) | sidans Funktioner |

**0 BOF-bilder** (regel 2026-09-20: produkten har inga BOF-etiketter alls).
**0 review-bilder** (de 10 recensionerna är seedade, se dna.md).

**Regler ur Brief review 2026-09-18** (Belt/Boat/Termo — den här hubben är ny
och har ingen egen Feedback-rad än): butiksnamnet aldrig i annonsen,
villkor bara från produktsidan, förälderns CPA + köp mot break-even-CPA.
**Annonsidéer:** inga rader för produkten.

**Modellpolicy följd (CLAUDE.md regel 6):** copy av sonnet-subagent med DNA-fakta,
hooks, formatkrav och `docs/copy-regler.md`; tre-frågorstestet står rad för rad
i varje brief. Strategi, urval och namn av huvudsessionen.

⚠️ **Saknas i den här batchen:** regitabellen (BRIEF-REGI) och komponenttaggarna
ur rond-auto 2.9/2.12 — kravet landade i kommandofilen 06:04 UTC samma
morgon (commit `f1bbba1`), efter att subagenten fått sin brief, och spärren
`tools/briefgranskning.mjs --manifest` finns inte på `main`. Nästa batch ska
bära dem.

**Mät från dag 1:** `rev` och `brief → live` per annons fylls i när raderna
lästs / annonserna gått live.
