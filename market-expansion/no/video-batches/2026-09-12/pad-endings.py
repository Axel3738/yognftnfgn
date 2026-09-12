import subprocess, os, glob

BASE = os.path.dirname(os.path.abspath(__file__))
PAD = 0.3

# Videor som INTE ska paddas (redan gröna i röstkollen)
SKIP = {'jetvifte_SP_3'}

failed = []
for slug in ['jetvifte', 'solcellslarm', 'termoskydd']:
    for f in sorted(glob.glob(f'{BASE}/final/{slug}/NO_{slug}_*.mp4')):
        name = os.path.basename(f)[3:-4]  # strip NO_ prefix and .mp4
        if name in SKIP:
            print('hoppar (redan grön):', name)
            continue
        tmp = f + '.padded.mp4'
        vf = f'tpad=stop_mode=clone:stop_duration={PAD}'
        af = f'apad=pad_dur={PAD}'
        cmd = ['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', f,
               '-vf', vf, '-af', af,
               '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k',
               tmp]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print('FEL', name, r.stderr[-1000:])
            failed.append(name)
            continue
        os.replace(tmp, f)
        print('paddad', name)

print('KLART. Misslyckade:', failed or 'inga')
