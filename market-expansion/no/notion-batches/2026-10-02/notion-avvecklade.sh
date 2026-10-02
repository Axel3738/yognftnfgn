#!/usr/bin/env bash
# De rader vars NORSKA kampanj är AVVECKLAD (PAUSED med spend) flyttas till
# `Approved` så kön slutar växa.
#
# Axels beslut 2026-09-19: "en avstängd NO-kampanj startas aldrig om bara för
# att produkten skalar i Sverige — frågan ställs inte längre". Körningen
# 2026-09-30 gjorde precis det här med 46 rader; 2026-10-01 lät dem ligga, och
# då stod kön på 59. I dag är de 107. Varje dygn lägger `/notionkorning` nya
# svenska annonser i `SE-ACTIVE to be translated` oavsett om produkten har en
# levande norsk kampanj, så raderna ackumuleras för evigt om ingen stänger dem.
#
# ⛔ Bara rader med skäl "är PAUSED med … kr spend" tas. De två HÅLLNA
# FD_3-raderna och allt annat rörs aldrig.
#
# ⚠️ `notion-aterkoppling.mjs` VÄGRAR en statusändring utan kommentar ("en rad
# som flyttas utan förklaring är ett mysterium för redigeraren") — och det är
# rätt här: kommentaren är den SISTA på raden, inte en daglig upprepning.
# Raden lämnar kön när den blir Approved, så den kommenteras aldrig igen.
# Kampanjens namn står i kommentaren, så redigeraren ser exakt varför.
#
# ⚠️ Statusen avgörs av hubbens ID läst LIVE ur Notion, aldrig ur titeln:
# en speglad hub får `CaraShell SE ready to be active`.
#
#   bash market-expansion/no/notion-batches/2026-10-02/notion-avvecklade.sh [--torr]
set -euo pipefail
B="$(cd "$(dirname "$0")" && pwd)"
R="$(cd "$B/../../../.." && pwd)"
TORR="${1:-}"

python3 - "$B" "$R" "$TORR" <<'PY'
import json, os, re, subprocess, sys, urllib.request
B, R, torr = sys.argv[1], sys.argv[2], sys.argv[3]
SPEGLAD = "7ec270ab-908c-82f6-a2a8-0153159b20fa"   # CaraShell takskyddet
_TOKEN = os.environ.get("NOTION_TOKEN", "")
_hub = {}


def hub_id(sid):
    if sid not in _hub:
        r = urllib.request.Request(f"https://api.notion.com/v1/pages/{sid}",
                                   headers={"Authorization": f"Bearer {_TOKEN}",
                                            "Notion-Version": "2022-06-28"})
        with urllib.request.urlopen(r) as f:
            _hub[sid] = json.load(f)["parent"].get("database_id", "")
    return _hub[sid]


AVVECKLAD = re.compile(r"är PAUSED med [\d.]+ kr spend")
jobb = json.load(open(f"{B}/jobb.json", encoding="utf-8"))["jobb"]
rader = [j for j in jobb
         if j["status"] == "HOPPA" and AVVECKLAD.search(j.get("skal", ""))]
print(f"{len(rader)} rader med avvecklad norsk kampanj\n")

ok = fel = 0
for j in rader:
    sid = j["notion"]["id"]
    status = ("CaraShell SE ready to be active"
              if hub_id(sid) == SPEGLAD else "Approved")
    kampanj = j.get("skal", "").split(" är PAUSED")[0].strip('"')
    kommentar = (f"Ikke oversatt til norsk: den norske kampanjen {kampanj} er "
                 "avviklet (satt på pause etter at den hadde brukt penger). "
                 "Raden lukkes derfor i oversettelseskøen. Blir kampanjen "
                 "startet igjen, sier eieren til.")
    cmd = ["node", f"{R}/tools/notion-aterkoppling.mjs", sid,
           "--kommentar", kommentar, "--status", status]
    if torr == "--torr":
        cmd.append("--torr")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0:
        ok += 1
        print(f"✓ {j['namn']} → {status}")
    else:
        fel += 1
        print(f"✗ {j['namn']}: {(r.stderr or r.stdout).strip()[-200:]}")
print(f"\n{ok} ok · {fel} fel")
PY
