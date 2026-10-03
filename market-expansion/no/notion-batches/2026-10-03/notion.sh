#!/usr/bin/env bash
# Notion-återkopplingen för 2026-10-03.
#
#   bash market-expansion/no/notion-batches/2026-10-03/notion.sh [--torr]
#
# Uppladdade rader: norsk fil i radens filfält + kommentar + `Translated url` +
# status. Hållna rader: kommentar med skälet, status ORÖRD så de ligger kvar i
# kön till nästa körning.
#
# ⚠️ Statusen avgörs av hubbens ID läst LIVE ur Notion, aldrig ur titeln:
# Takovertrekk-raderna ligger i den SPEGLADE hubben och ska till
# `CaraShell SE ready to be active` — går de till `Approved` når de aldrig
# CaraShells engelska led.
set -euo pipefail
B="$(cd "$(dirname "$0")" && pwd)"
R="$(cd "$B/../../../.." && pwd)"
TORR="${1:-}"

python3 - "$B" "$R" "$TORR" <<'PY'
import json, os, subprocess, sys, urllib.request
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


# Skälet per hållen video. Varje rad är MÄTT i dag, inte antagen.
HEYGEN = ("Holdt tilbake i dag. Videoen er dubbet til norsk og stemmen er "
          "kontrollert, men kildevideoen har de svenske tekstene brent inn i "
          "BILDET, blant annet prisen 459 og 599 svenske kroner og en stor "
          "grafikk med Bestill 459 kr. HeyGen oversetter bare lyden, aldri "
          "bildet. Den trenger egne målte tekstlag, og tas i neste kjøring. "
          "Raden blir liggende i køen.")
ELEVEN = ("Holdt tilbake i dag. Videoen er dubbet til norsk og tekstboblene er "
          "byttet, men sluttbildets store tekst 1 129 kr i stället för 1 469 kr "
          "ligger brent inn i bildet over fotoet, og to bobler på slutten ble "
          "stående svenske fordi den norske replikken er kortere etter "
          "omtidingen. Den trenger egne målte tekstlag, og tas i neste kjøring. "
          "Raden blir liggende i køen.")
MUSIK = ("Holdt tilbake i dag. Videoen har ingen tale, bare musikk: Scribe fant "
         "ett eneste ord på 25 sekunder, og HeyGen svarte at ingen stemme ble "
         "funnet. Den skal derfor ikke dubbes i det hele tatt. Men den har de "
         "svenske tekstene brent inn i bildet, så den trenger et eget tekstlag "
         "uten omdubbing, og tas i neste kjøring. Raden blir liggende i køen.")
HALLNA = {
    "Sotarset_FD_3_H1": HEYGEN, "Sotarset_FD_3_H2": HEYGEN,
    "Sotarset_FD_3_H3": HEYGEN, "Sotarset_PD_1_H5": HEYGEN,
    "Takoverdrag_CS_2_H3": HEYGEN,
    "Takoverdrag_FD_3_H1": ELEVEN, "Takoverdrag_FD_3_H2": ELEVEN,
    "Takoverdrag_OB_6_H1": ELEVEN, "Takoverdrag_OB_7_H1": ELEVEN,
    "Takoverdrag_OB_9_H1": ELEVEN,
    "Takoverdrag_CS_2_H2": MUSIK,
}

jobb = json.load(open(f"{B}/jobb.json", encoding="utf-8"))["jobb"]
ok = fel = 0

for j in jobb:
    mal = j.get("mal") or {}
    namn, sid = j["namn"], j["notion"]["id"]

    if mal.get("annonsId"):
        malnamn = mal["annonsNamn"]
        fil = f"{B}/no/{malnamn}.jpg"
        status = ("CaraShell SE ready to be active"
                  if hub_id(sid) == SPEGLAD else "Approved")
        kommentar = (f"Norsk versjon lastet opp: {malnamn} (Magiborsten NO, "
                     f"{mal.get('adsetNamn', '')}). Priser lest fra "
                     f"beverbutikken.no 2026-10-03.")
        url = ("https://business.facebook.com/adsmanager/manage/ads"
               f"?selected_ad_ids={mal['annonsId']}")
        if os.path.exists(fil) and torr != "--torr":
            fr = subprocess.run(["node", f"{R}/tools/notion-fil-upp.mjs", sid, "--fil", fil],
                                capture_output=True, text=True)
            if fr.returncode != 0:
                print(f"  ⚠️ bilagan gick inte upp för {malnamn}: "
                      f"{(fr.stderr or fr.stdout).strip()[-140:]}")
        cmd = ["node", f"{R}/tools/notion-aterkoppling.mjs", sid,
               "--kommentar", kommentar, "--egenskap", f"Translated url={url}",
               "--status", status]
        etikett = f"{malnamn} → {status}"
    elif namn in HALLNA:
        cmd = ["node", f"{R}/tools/notion-aterkoppling.mjs", sid,
               "--kommentar", HALLNA[namn]]
        etikett = f"{namn} → hålls i kön"
    else:
        continue

    if torr == "--torr":
        cmd.append("--torr")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0:
        ok += 1
        print(f"✓ {etikett}")
    else:
        fel += 1
        print(f"✗ {etikett}: {(r.stderr or r.stdout).strip()[-200:]}")

print(f"\n{ok} ok · {fel} fel")
PY
