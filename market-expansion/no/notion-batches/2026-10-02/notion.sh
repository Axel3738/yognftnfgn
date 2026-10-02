#!/usr/bin/env bash
# Notion-återkoppling för 2026-10-02: bilaga + kommentar + Translated url + status.
#
# ⚠️ Statusen avgörs av hubbens ID, aldrig av dess NAMN. Takovertrekk-raderna
# ligger i 7ec270ab-908c-82f6-a2a8-0153159b20fa, som är den SPEGLADE hubben
# (CaraShell takskyddet) — men hubben heter numera "BÄVER Taköverdraget för
# Husvagn" i Notion, medan `tools/ops-spegla.mjs --kallor` kallar den "BÄVER For
# CARL Taköverdraget för Husvagn". Hade jag gått på namnet hade de 14 raderna
# fått "Approved" och aldrig nått CaraShells engelska led.
#
#   bash market-expansion/no/notion-batches/2026-10-02/notion.sh [--torr]
set -euo pipefail
B="$(cd "$(dirname "$0")" && pwd)"
R="$(cd "$B/../../../.." && pwd)"
TORR="${1:-}"

python3 - "$B" "$TORR" <<'PY'
import json, os, subprocess, sys
B, torr = sys.argv[1], sys.argv[2]
R = os.path.abspath(os.path.join(B, '..', '..', '..', '..'))
SPEGLAD = "7ec270ab-908c-82f6-a2a8-0153159b20fa"   # CaraShell takskyddet

# Hubben läses ur SIDAN, inte ur jobbfilen och aldrig ur namnet: jobb.json bär
# bara hubbens titel, och den speglade hubben heter numera "BÄVER Taköverdraget
# för Husvagn" i Notion medan ops-spegla.mjs kallar den "BÄVER For CARL …".
# Ett namnbyte i Notion hade annars skickat raderna till "Approved" och
# CaraShells engelska led hade aldrig fått dem.
import urllib.request
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


jobb = json.load(open(f"{B}/jobb.json", encoding="utf-8"))["jobb"]
ok = fel = 0
for j in jobb:
    mal = j.get("mal") or {}
    if not mal.get("annonsId"):
        continue
    namn, sid = mal["annonsNamn"], j["notion"]["id"]
    bild = f"{B}/no/{namn}.jpg"
    video = f"{B}/no-video-txt/{namn.replace('_NO_', '_NO_')}.mp4"
    fil = bild if os.path.exists(bild) else (video if os.path.exists(video) else None)
    status = ("CaraShell SE ready to be active"
              if hub_id(sid) == SPEGLAD else "Approved")
    kommentar = (f"Norsk versjon lastet opp: {namn} (Magiborsten NO, "
                 f"{mal.get('adsetNamn', '')}). Priser lest fra beverbutikken.no "
                 f"2026-10-02.")
    url = f"https://business.facebook.com/adsmanager/manage/ads?selected_ad_ids={mal['annonsId']}"
    # den norska filen läggs på radens "Filer och media" — REST kan bara lägga
    # till block sist i sidan, och `insert_content position start` finns bara i
    # Notion-MCP:n, som kostar ett godkännandeklick per anrop.
    if fil and torr != "--torr":
        fr = subprocess.run(["node", f"{R}/tools/notion-fil-upp.mjs", sid, "--fil", fil],
                            capture_output=True, text=True)
        if fr.returncode != 0:
            print(f"  ⚠️ bilagan gick inte upp för {namn}: "
                  f"{(fr.stderr or fr.stdout).strip()[-140:]}")
    cmd = ["node", f"{R}/tools/notion-aterkoppling.mjs", sid,
           "--kommentar", kommentar, "--egenskap", f"Translated url={url}",
           "--status", status]
    if torr == "--torr":
        cmd.append("--torr")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0:
        ok += 1
        print(f"✓ {namn} → {status}")
    else:
        fel += 1
        print(f"✗ {namn}: {(r.stderr or r.stdout).strip()[-200:]}")
print(f"\n{ok} ok · {fel} fel")
PY
