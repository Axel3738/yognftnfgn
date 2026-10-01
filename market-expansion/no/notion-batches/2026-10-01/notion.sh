#!/usr/bin/env bash
# Notion-återkoppling för 2026-10-01: bilaga + kommentar + Translated url + status.
#
# ⚠️ Statusen avgörs av hubbens ID, aldrig av dess NAMN. Takovertrekk-raderna
# ligger i 7ec270ab-908c-82f6-a2a8-0153159b20fa, som är den SPEGLADE hubben
# (CaraShell takskyddet) — men hubben heter numera "BÄVER Taköverdraget för
# Husvagn" i Notion, medan `tools/ops-spegla.mjs --kallor` kallar den "BÄVER For
# CARL Taköverdraget för Husvagn". Hade jag gått på namnet hade de 14 raderna
# fått "Approved" och aldrig nått CaraShells engelska led.
#
#   bash market-expansion/no/notion-batches/2026-10-01/notion.sh [--torr]
set -euo pipefail
B="$(cd "$(dirname "$0")" && pwd)"
R="$(cd "$B/../../../.." && pwd)"
TORR="${1:-}"

python3 - "$B" "$TORR" <<'PY'
import json, os, subprocess, sys
B, torr = sys.argv[1], sys.argv[2]
R = os.path.abspath(os.path.join(B, '..', '..', '..', '..'))
SPEGLAD = "7ec270ab-908c-82f6-a2a8-0153159b20fa"   # CaraShell takskyddet

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
              if j["produkt"]["no_prefix"] == "Takovertrekk" else "Approved")
    kommentar = (f"Norsk versjon lastet opp: {namn} (Magiborsten NO, "
                 f"{mal.get('adsetNamn', '')}). Priser lest fra beverbutikken.no "
                 f"2026-10-01.")
    url = f"https://business.facebook.com/adsmanager/manage/ads?selected_ad_ids={mal['annonsId']}"
    cmd = [sys.executable] if False else ["node", f"{R}/tools/notion-aterkoppling.mjs", sid,
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
