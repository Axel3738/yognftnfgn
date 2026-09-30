n=$1; f=final/NO_varmesulorna_$n.mp4; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)
ffmpeg -v error -y -i $f -vf "fps=16/$d,scale=240:427,tile=8x2" -frames:v 1 qa/full_$n.jpg
