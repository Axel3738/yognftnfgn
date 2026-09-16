#!/usr/bin/env bash
# kor-video.sh — CaraShell takskyddet, US-videobatch 2026-09-16, hela kedjan efter att
# SRT:erna verifierats (verify-srt.mjs grön):
#   apply (0 kr) → render (DRAR krediter) → download → no-precis captions → rostkoll
# Körs från repo-roten:  bash market-expansion/ops/carashell/2026-09-16-us/kor-video.sh [steg]
# steg = apply | render | download | captions | rostkoll | allt (standard)
set -uo pipefail
ROT="$(cd "$(dirname "$0")/../../../.." && pwd)"
B="$ROT/market-expansion/ops/carashell/2026-09-16-us"
M="$B/video/batch.json"
LANG_HG="English (United States)"
steg="${1:-allt}"
export NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt
f() { grep -v -E 'UNDICI|trace-warnings'; }

if [[ "$steg" == allt || "$steg" == apply ]]; then
  echo "== apply (rättade SRT:er → HeyGen, 0 krediter)"
  node "$ROT/pipeline/translate-batch.mjs" apply --manifest="$M" --srtdir="$B/video/srt-us" --lang="$LANG_HG" --marknad=US 2>&1 | f
  n=$(grep -c '"srtApplied": true' "$M.state.json"); echo "SRT verifierade i HeyGen: $n/12"
  if [[ "$n" != 12 ]]; then echo "✗ inte alla SRT:er persisterade — stannar före render"; grep -B2 MISMATCH "$M.state.json"; exit 2; fi
fi
if [[ "$steg" == allt || "$steg" == render ]]; then
  echo "== render (DRAR krediter)"
  node "$ROT/pipeline/localize.mjs" check 2>&1 | f | tail -1
  node "$ROT/pipeline/translate-batch.mjs" render --manifest="$M" --lang="$LANG_HG" --marknad=US 2>&1 | f
fi
if [[ "$steg" == allt || "$steg" == download ]]; then
  echo "== download"
  node "$ROT/pipeline/translate-batch.mjs" download --manifest="$M" --out="$B/video/render" --lang="$LANG_HG" --marknad=US 2>&1 | f
  ls -la "$B/video/render"
  node "$ROT/pipeline/localize.mjs" check 2>&1 | f | tail -1
fi
if [[ "$steg" == allt || "$steg" == captions ]]; then
  echo "== captions (no-precis.py, engelska cues i det svenska pillrets ruta)"
  mkdir -p "$B/us"
  for k in "$B"/cap/*.json; do
    n=$(basename "$k" .json)
    [[ -f "$B/video/render/carashell_$n.mp4" ]] || { echo "✗ saknar render för $n"; continue; }
    python3 "$ROT/pipeline/no-precis.py" "$k" </dev/null 2>&1 | tail -3
  done
fi
if [[ "$steg" == allt || "$steg" == rostkoll ]]; then
  echo "== rostkoll (per fil: ny mot källa + SRT)"
  : > "$B/rostkoll-us.txt"
  for k in "$B"/cap/*.json; do
    n=$(basename "$k" .json)
    ut="$B/us/CaraShellRoof_US_$n.mp4"
    [[ -f "$ut" ]] || { echo "✗ saknar $ut" | tee -a "$B/rostkoll-us.txt"; continue; }
    python3 "$ROT/pipeline/rostkoll.py" --ny "$ut" --kalla "$B/video/carashell/up/$n.mp4" --srt "$B/video/srt-us/carashell_$n.srt" --kallsrt "$B/video/srt-orig/carashell_$n.orig.srt" --json </dev/null > "$B/cap/rostkoll-$n.json" 2>&1
    head -n 8 "$B/cap/rostkoll-$n.json" | grep -E '✅|❌|⚠️|^\s+[a-zåäö]' | tee -a "$B/rostkoll-us.txt"
  done
  node -e '
    const fs=require("fs"); const B=process.argv[1]; const ut={};
    for (const f of fs.readdirSync(B+"/cap").filter(f=>f.startsWith("rostkoll-")&&f.endsWith(".json"))) {
      const n=f.slice(9,-5); const t=fs.readFileSync(B+"/cap/"+f,"utf8"); const i=t.indexOf("{");
      let j=null; try { j=JSON.parse(t.slice(i)); } catch {}
      const post=j?Object.values(j)[0]:null;
      ut["CaraShellRoof_US_"+n]={ ok: Boolean(post && post.fel.length===0), fel: post?post.fel:["ingen json"], noteringar: post?post.noteringar:[], matvarden: post?post.matvarden:null };
    }
    fs.writeFileSync(B+"/rostkoll-us.json", JSON.stringify(ut,null,2));
    const g=Object.values(ut).filter(v=>v.ok).length; console.log(`röstkoll: ${g}/${Object.keys(ut).length} gröna → rostkoll-us.json`);
  ' "$B"
fi
echo "== klart ($steg)"
