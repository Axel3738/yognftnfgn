#!/usr/bin/env bash
# Kommentar på de rader som HÅLLS KVAR i kön, med skälet. Statusen rörs inte —
# kommandot säger uttryckligen "Rad som hoppades: kommentar med skälet, status
# oförändrad", så raderna ligger kvar i `SE-ACTIVE to be translated` och tas av
# nästa körning.
#
# ⚠️ De 107 raderna med AVVECKLAD norsk kampanj kommenteras INTE här. De är ett
# stående läge, de är redan kommenterade i tidigare körningar, och en kommentar
# per rad och dygn hade gett över hundra nya kommentarer varje dag. De står i
# stället i Discord-briefen och i STATUS.md med antal per produkt.
#
#   bash market-expansion/no/notion-batches/2026-10-02/notion-hallna.sh [--torr]
set -euo pipefail
B="$(cd "$(dirname "$0")" && pwd)"
R="$(cd "$B/../../../.." && pwd)"
TORR="${1:-}"

python3 - "$B" "$R" "$TORR" <<'PY'
import json, subprocess, sys
B, R, torr = sys.argv[1], sys.argv[2], sys.argv[3]
HALLNA = {"Takoverdrag_FD_3_H1", "Takoverdrag_FD_3_H2"}
SKAL = ("Holdt tilbake i dag. Kildevideoen har tre svenske elementer brent inn i "
        "bildet som ikke byttes av tekstbyttet: den røde overskriften, hele "
        "størrelsestabellen og boblen med lengdene. De krever egne målte lag og "
        "tas i neste kjøring. Raden blir liggende i køen.")

jobb = json.load(open(f"{B}/jobb.json", encoding="utf-8"))["jobb"]
ok = fel = 0
for j in jobb:
    if j["namn"] not in HALLNA:
        continue
    cmd = ["node", f"{R}/tools/notion-aterkoppling.mjs", j["notion"]["id"], "--kommentar", SKAL]
    if torr == "--torr":
        cmd.append("--torr")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0:
        ok += 1
        print(f"✓ {j['namn']}")
    else:
        fel += 1
        print(f"✗ {j['namn']}: {(r.stderr or r.stdout).strip()[-200:]}")
print(f"\n{ok} ok · {fel} fel")
PY
