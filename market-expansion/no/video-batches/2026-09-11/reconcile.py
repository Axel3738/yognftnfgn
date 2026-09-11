import json, os

BASE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(BASE, 'batch.json.state.json')
render_dir = os.path.join(BASE, 'render')

d = json.load(open(state_path))
on_disk = set(f[:-4] for f in os.listdir(render_dir) if f.endswith('.mp4'))

for key in on_disk:
    if key in d:
        d[key]['downloaded'] = True

json.dump(d, open(state_path, 'w'), indent=1)
print('reconciled', len(on_disk), 'nedladdade mot state.json')

missing = [k for k, v in d.items() if v.get('renderId') and not v.get('downloaded')]
print('saknar fortfarande nedladdning:', missing)
