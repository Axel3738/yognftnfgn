#!/bin/bash
# Kör omdubben per video, med delad text→mp3-cache så identiska repliker bara syntetiseras en gång.
cd /home/user/yognftnfgn/market-expansion/no/video-batches/2026-09-29/maskinhyllan
ROST="Martin - Clear and Comforting"
for srt in srt-no/Maskinhylla_CS_1_H1.srt; do
  n=$(basename $srt .srt); ut=work/dub/NO_$n.mp4; vo=work/dub/vo/NO_$n
  [ -s $ut ] && { echo "hoppar $n"; continue; }
  mkdir -p $vo
  python3 - "$srt" "$vo" pre <<'PY'
import sys,hashlib,shutil,os
srt,vo,mode=sys.argv[1:]
for i,b in enumerate(open(srt).read().strip().split('\n\n')):
    t=' '.join(b.split('\n')[2:]); h=hashlib.sha1(t.encode()).hexdigest()[:16]
    c=f'work/tts-cache/{h}.mp3'; v=f'{vo}/{i}.mp3'
    if mode=='pre' and os.path.exists(c) and not os.path.exists(v): shutil.copy(c,v)
    if mode=='post' and os.path.exists(v) and not os.path.exists(c): shutil.copy(v,c)
PY
  for try in 1 2 3 4 5; do
    node /home/user/yognftnfgn/pipeline/omdubb/elevenlabs-omdubb.mjs --kalla=src/$n.mp4 --srt=$srt --ut=$ut --rost="$ROST" --vo=$vo > work/dub/$n.log 2>&1 && break
    python3 - "$srt" "$vo" post <<'PY'
import sys,hashlib,shutil,os
srt,vo,mode=sys.argv[1:]
for i,b in enumerate(open(srt).read().strip().split('\n\n')):
    t=' '.join(b.split('\n')[2:]); h=hashlib.sha1(t.encode()).hexdigest()[:16]
    c=f'work/tts-cache/{h}.mp3'; v=f'{vo}/{i}.mp3'
    if os.path.exists(v) and not os.path.exists(c): shutil.copy(v,c)
PY
    echo "$n försök $try misslyckades: $(tail -c 300 work/dub/$n.log)"; sleep $((30*try))
  done
  python3 - "$srt" "$vo" post <<'PY'
import sys,hashlib,shutil,os
srt,vo,mode=sys.argv[1:]
for i,b in enumerate(open(srt).read().strip().split('\n\n')):
    t=' '.join(b.split('\n')[2:]); h=hashlib.sha1(t.encode()).hexdigest()[:16]
    c=f'work/tts-cache/{h}.mp3'; v=f'{vo}/{i}.mp3'
    if os.path.exists(v) and not os.path.exists(c): shutil.copy(v,c)
PY
  echo "== $n"; grep -E "⚠️|Källan|✓" work/dub/$n.log
done
