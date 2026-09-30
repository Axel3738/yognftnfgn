n=$1; shift
python3 capsrt.py $n && python3 /home/user/yognftnfgn/pipeline/no-captions.py dub/$n.mp4 dub/$n.cap.srt final/NO_golfkalender_$n.mp4 "$@" </dev/null > final/$n.cap.log 2>&1; echo "$n cap exit $?"; grep -E "✓|⚠|❌|band" final/$n.cap.log | head -3
bash qa.sh $n
python3 /home/user/yognftnfgn/pipeline/rostkoll.py --kalla src/$n.mp4 --ny final/NO_golfkalender_$n.mp4 --srt dub/$n.mp4.srt --omtajmad 2>&1 | grep -E "^(✅|❌|⚠️ [^G])" | head -5
