# Batch #8 — de svenska raderna (2026-10-01)

⚠️ **Modellpolicy-avvikelse, samma som batch #1–#3 och #7:** inget Agent/Task-verktyg
fanns i sessionen (`ToolSearch "Agent"` gav noll träffar) och `ANTHROPIC_NYCKEL` saknades
i miljön, så ingen sonnet-subagent kunde skriva raderna. Huvudsessionen skrev dem själv,
taggade varje brief `copy_model=huvudsession` (aldrig `sonnet` när det inte är sant) och
körde tre-frågorstestet rad för rad i varje brief (tabellen står i respektive `brief.md`).
Filen heter `copy-sonnet.md` för att nästa session ska hitta den på samma plats som i
batch-07-formatet.

**Underlaget raderna skrevs mot:** ⛔-blocket överst i `dna.md` (Axel 2026-09-29), sidans
tillåtna fakta (420D Oxford-tyg utan värdeord · täcker kåpan ner över riggen · spänns med
en rem · nio storlekar 0–5 till 250–350 hk, mät först · dras på utan verktyg · håller regn,
smuts och löv borta · övertäckt syns motorn mindre från vägen), priset läst live 2026-10-01
(579 / 965 kr, nio varianter), `docs/copy-regler.md`, `copy/GEMENSAMT.md` +
`copy/BOF-GEMENSAMT.md` (FD-blocket), Brief review 2026-09-29:s tre regler (inget UV/vinter/
vattendemo; intervall med båda ändarna; aldrig lova framkomst) och kundrösten
(`agent/leads.mjs --prefix Batmotor`: "600 spänn för en plastpåse", "inga spännband, bara ett
snöre" — en rem, nämnd en gång, aldrig mer).

Kontroll i generatorn (`bygg-batch08.mjs`, sessionens scratchpad): varje svensk rad kördes
mot en förbudslista (vinter, sex månader, slitstark, kraftig, tålig, premium, hållbar,
vattentät, tätt, rinner av, UV, storm, blåst, ventilation, dragkedja, fodrad, vadderad,
dragsko, snö, frost, salt, fågelskit, andas, tankstreck) och mot ordtaket tre ord per sekund.

## Rundan (4)

| Annons | Hook (use this) | Alternativ |
|---|---|---|
| `Batmotor_SP_1_H16` | Regn, löv och smuts lägger sig på motorn när båten står still. | Båten står still. Regn, löv och smuts lägger sig på motorn. · Motorn står bar. Regn, löv och smuts lägger sig på kåpan. |
| `Batmotor_SP_1_H17` | 579 kr. Ett tygöverdrag som håller regn, smuts och löv borta. | Ett tygöverdrag för motorn. 579 kr. · 579 kr för att hålla regn, smuts och löv borta. |
| `Batmotor_OB_4_H1` | Ett tygöverdrag för 579 kr. Inte ett kapell. | Det här är ett tygöverdrag. 579 kr. · Ett tygöverdrag. Inte mer. 579 kr. |
| `Batmotor_BF_15_1` | Regn, löv och smuts. Rakt på motorn. (rubrik) | underrad: Ett tygöverdrag från kåpan ner över riggen. |

Gemensam kropp SP_1_H16/H17 (rad 2–5): "Dra skyddet över motorn. Från kåpan ner över riggen." ·
"Spänn remmen runt mitten. Inga verktyg." · "Ett tygöverdrag i 420D Oxford. Det håller regn, smuts
och löv borta." · "579 kr. Ordinarie pris 965 kr. Beställ ditt båtmotorskydd."

OB_4_H1 rad 2–5: "Det dras över kåpan och ner över riggen." · "En rem runt mitten. Inga verktyg." ·
"Det håller regn, smuts och löv borta när båten står still." · "Inte mer än så. 579 kr, ordinarie
pris 965 kr."

## Fars dag-blocket (FD_5 video ×3, FD_6 bild ×4) — invändningen "behöver han ett skydd alls?"

| | Rad |
|---|---|
| FD_5_H1 (invändningen besvarad) | Fars dag: regn och löv lägger sig på motorn. |
| FD_5_H2 (priset först) | Ord. 965 kr. Till fars dag: 579 kr. |
| FD_5_H3 (sista dagen först) | Beställ senast 19 oktober. Ett motorskydd till fars dag. |
| rad 2 | Skyddet håller regn, smuts och löv borta. |
| rad 3 | Övertäckt syns motorn mindre från vägen. |
| rad 4 | Fars dag-rea: 579 kr, ord. 965 kr. Beställ senast 19 oktober. |
| FD_6_1 invändningen | Regn och löv lägger sig på motorn. / Övertäckt syns den mindre från vägen. Fars dag-present. |
| FD_6_2 priset först | 579 kr för ett tygöverdrag till motorn. / Täcker kåpan ner över riggen. Fars dag-rea. |
| FD_6_3 sista dagen | Fars dag: beställ motorskyddet senast 19 oktober. / Dras på utan verktyg och spänns med en rem. |
| FD_6_4 vad han får | Ett tygöverdrag i 420D Oxford, nio storlekar. / Mät motorn först. Till fars dag. |

COPY CARD (alla sju): "Regn och löv lägger sig på motorn när båten står still. Skyddet håller regn,
smuts och löv borta, och övertäckt syns motorn mindre från vägen. Fars dag-rea: 579 kr, ord. 965 kr.
Beställ senast 19 oktober." · rubrik "Ett skydd för motorn, fars dag" · beskrivning "Fars dag-rea:
579 kr, ord. 965 kr".

Tre-frågorstestet: varje rad ovan ✅ visualisera · ✅ falsifiera · ❌ konkurrent kan signera —
tabellerna med motivering per rad står i varje `brief.md`.
