#!/usr/bin/env python3
"""bygg-output.py — bilder-copy.json (subagentens rader) → bilder/oversatt-output.json
i det format oversatt-batch.py läser. Ordningen MÅSTE vara samma som former-listan i
se-texter.json, annars hamnar rubriken i knappen."""
import json, pathlib
H = pathlib.Path(__file__).parent
ROLLER = ["rubrik", "underrad", "etikett", "pris", "knapp"]   # = former[] i se-texter.json
c = json.loads((H / "bilder-copy.json").read_text(encoding="utf-8"))
se = json.loads((H / "bilder/se-texter.json").read_text(encoding="utf-8"))
ut = {"_kalla": "Skriven av en sonnet-subagent 2026-09-26 mot docs/copy-regler.md, "
      "briefens COPY CARD och products/carashell/takskyddet/dna.md. Priset ur "
      "ekonomi.marknadspriser USD 199/249 (besparingen 50 USD = 20 % är de två talens "
      "egen differens, inget påhittat); måttet i fot; inget butiksnamn; inget om "
      "förvaringspåse, dragsko, vattentäthet eller andningsförmåga (förbjudet i "
      "produktminnet). Medgivandet ligger först i primärtexten, som i den svenska."}
for namn, rader in c.items():
    n = len(se[namn]["former"])
    if n != len(ROLLER):
        raise SystemExit(f"{namn}: se-texter har {n} former, ROLLER har {len(ROLLER)}")
    ut[namn] = {"former": [{"texter": [{"rader": [0], "text": rader[r]}]} for r in ROLLER]}
(H / "bilder/oversatt-output.json").write_text(
    json.dumps(ut, indent=1, ensure_ascii=False), encoding="utf-8")
print("skrev bilder/oversatt-output.json")
for r in ROLLER:
    print(f"  {r:9s} {c['CaraShellRoof_OB_112_1'][r]}")
