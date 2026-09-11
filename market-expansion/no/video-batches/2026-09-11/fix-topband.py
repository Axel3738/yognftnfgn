import subprocess, os

BASE = os.path.dirname(os.path.abspath(__file__))

jobs = [
    ('utekattkoja', 'CS_1', 15.0, 16.08),
    ('utekattkoja', 'CS_2', 16.0, 17.12),
    ('utekattkoja', 'CS_3', 16.0, 17.12),
]

TOP_PX = 160

for slug, name, start, end in jobs:
    f = f'{BASE}/final/{slug}/NO_{slug}_{name}.mp4'
    tmp = f + '.topfix.mp4'
    vf = (f"split[a][b];[b]crop=iw:{TOP_PX}:0:0,boxblur=30:10[blurred];"
          f"[a][blurred]overlay=0:0:enable='between(t,{start},{end})'")
    cmd = ['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', f,
           '-filter_complex', vf,
           '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-c:a', 'copy',
           tmp]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print('FEL', name, r.stderr[-1500:])
        continue
    os.replace(tmp, f)
    print('fixad', slug, name)
