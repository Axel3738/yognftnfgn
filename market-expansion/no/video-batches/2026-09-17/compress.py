import os, subprocess, imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
BASE = os.path.dirname(os.path.abspath(__file__))
LIMIT = 31_000_000

for slug in ('fagelmatare', 'solcellslampa'):
    updir = os.path.join(BASE, slug, 'up')
    for name in sorted(os.listdir(updir)):
        if not name.endswith('.mp4'):
            continue
        path = os.path.join(updir, name)
        size = os.path.getsize(path)
        if size <= LIMIT:
            print('OK', slug, name, size)
            continue
        tmp = path + '.tmp.mp4'
        subprocess.run([FFMPEG, '-y', '-i', path, '-c:v', 'libx264', '-crf', '25',
                         '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '128k', tmp],
                        check=True, capture_output=True)
        newsize = os.path.getsize(tmp)
        os.replace(tmp, path)
        print('KOMPRIMERAD', slug, name, size, '->', newsize)
