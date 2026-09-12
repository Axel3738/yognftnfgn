import os, subprocess, imageio_ffmpeg

BASE = os.path.dirname(os.path.abspath(__file__))
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
LIMIT = 31 * 1024 * 1024

for slug in ['jetvifte', 'solcellslarm', 'termoskydd']:
    updir = os.path.join(BASE, slug, 'up')
    for name in sorted(os.listdir(updir)):
        if not name.endswith('.mp4'):
            continue
        path = os.path.join(updir, name)
        size = os.path.getsize(path)
        if size <= LIMIT:
            continue
        tmp = path + '.tmp.mp4'
        print(f'komprimerar {slug}/{name} ({size/1e6:.1f} MB)...')
        cmd = [FFMPEG, '-y', '-nostdin', '-i', path, '-c:v', 'libx264', '-crf', '25', '-preset', 'fast',
               '-c:a', 'aac', '-b:a', '128k', tmp]
        r = subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL)
        if r.returncode != 0:
            print('FEL:', r.stderr[-2000:])
            continue
        newsize = os.path.getsize(tmp)
        os.replace(tmp, path)
        print(f'  -> {newsize/1e6:.1f} MB')
