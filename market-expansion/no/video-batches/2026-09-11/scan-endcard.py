import subprocess, sys, os, glob, json
import numpy as np

BASE = os.path.dirname(os.path.abspath(__file__))

def scan_tail(path, tail_s=2.0, top_px=300):
    pr = subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0', path], capture_output=True, text=True)
    dur = float(pr.stdout.strip())
    start = max(0, dur - tail_s)
    W = 270
    pr2 = subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0', path], capture_output=True, text=True)
    w0, h0 = map(int, pr2.stdout.strip().split(','))
    H = round(h0 * W / w0)
    top_rows = round(top_px * H / h0)
    p = subprocess.run(['ffmpeg','-nostdin','-v','error','-ss', str(start), '-i', path, '-vf', f'fps=5,scale={W}:-1,crop={W}:{top_rows}:0:0',
                        '-f','rawvideo','-pix_fmt','gray','-'], capture_output=True)
    raw = p.stdout
    n = len(raw)//(W*top_rows)
    if n == 0:
        return None
    frames = np.frombuffer(raw[:n*W*top_rows], dtype=np.uint8).reshape(n, top_rows, W)
    white = (frames > 230).sum(axis=2)
    textish = (white > 40) & (white < 240)
    per_frame_hit = textish.any(axis=1)  # nagon rad i denna frame ser ut som text
    hit_frames = [i for i, h in enumerate(per_frame_hit) if h]
    if not hit_frames:
        return None
    fps = 5.0
    times = [round(start + i/fps, 2) for i in hit_frames]
    return {'dur': round(dur,2), 'hits_from': times[0], 'hits_to': times[-1], 'n_hits': len(hit_frames), 'n_total': n}

out = {}
for slug in ['utekattkoja', 'takoverdrag', 'stegstod']:
    for f in sorted(glob.glob(f'{BASE}/final/{slug}/NO_{slug}_*.mp4')):
        name = os.path.basename(f)[3:-4]
        r = scan_tail(f)
        out[name] = r
        print(name, r)

json.dump(out, open(f'{BASE}/endcard-scan.json', 'w'), indent=1)
