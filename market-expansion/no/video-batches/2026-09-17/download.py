import json, subprocess, os

BASE = os.path.dirname(os.path.abspath(__file__))
batch = json.load(open(os.path.join(BASE, 'batch.json')))
for slug, p in batch.items():
    updir = os.path.join(BASE, slug, 'up')
    os.makedirs(updir, exist_ok=True)
    for name, fid in p['videos'].items():
        out = os.path.join(updir, name + '.mp4')
        if os.path.exists(out) and os.path.getsize(out) > 100000:
            print('finns redan', out)
            continue
        url = f"https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t"
        subprocess.run(['curl', '-sL', url, '-o', out])
        size = os.path.getsize(out) if os.path.exists(out) else 0
        print(slug, name, size)
