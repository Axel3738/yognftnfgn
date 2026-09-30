n=$1; f=final/NO_dorrlarm_$n.mp4; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)
ffmpeg -v error -y -i $f -vf "fps=10/$d,crop=1080:420:0:1100,scale=540:210,tile=2x5" -frames:v 1 qa/$n.jpg
# slutkort: sista 0.5 s helbild
ffmpeg -v error -y -sseof -0.3 -i $f -frames:v 1 -vf scale=360:640 qa/${n}_slut.jpg
