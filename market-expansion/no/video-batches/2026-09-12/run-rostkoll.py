import sys, json
sys.path.insert(0, '/home/user/yognftnfgn/pipeline')
from pathlib import Path
import rostkoll

BASE = Path('/home/user/yognftnfgn/market-expansion/no/video-batches/2026-09-12')
SLUGS = ['jetvifte', 'solcellslarm', 'termoskydd']
KONCEPT = ['CS_1', 'CS_2', 'CS_3', 'G_1', 'G_2', 'G_3', 'PD_1', 'PD_2', 'PD_3', 'SP_1', 'SP_2', 'SP_3']

trasiga = 0
n = 0
for slug in SLUGS:
    for k in KONCEPT:
        n += 1
        kalla = BASE / slug / 'up' / f'{k}.mp4'
        ny = BASE / 'final' / slug / f'NO_{slug}_{k}.mp4'
        srt = BASE / 'srt-fixed' / f'{slug}_{k}.srt'
        kallsrt = BASE / 'srt-orig' / f'{slug}_{k}.orig.srt'
        fel, noter, m = rostkoll.kolla(kalla if kalla.exists() else None, ny,
                                        srt if srt.exists() else None,
                                        kallsrt if kallsrt.exists() else None)
        name = f'{slug}_{k}'
        if fel:
            trasiga += 1
            print(f'❌ {name}')
            for f in fel:
                print(f'     {f}')
        else:
            print(f'✅ {name}')
        for note in noter:
            print(f'     ⚠️ {note}')

print(f'\n{n - trasiga} av {n} klarade röstkollen.')
sys.exit(1 if trasiga else 0)
