n=$1; f=final/NO_golfkalender_$n.mp4; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)
ffmpeg -v error -y -i $f -vf "fps=10/$d,crop=1080:560:0:1030,scale=432:224,tile=2x5" -frames:v 1 qa/$n.jpg
ffmpeg -v error -y -sseof -0.3 -i $f -frames:v 1 -vf scale=360:640 qa/${n}_slut.jpg
