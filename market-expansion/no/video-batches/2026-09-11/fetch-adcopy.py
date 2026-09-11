import subprocess, os

BASE = os.path.dirname(os.path.abspath(__file__))

docs = {
 'utekattkoja': {
   'CS': '1Y0UHsC-NCFrOlG1QjCFqT6aoSwvQ62E-09BsGl3eqfQ',
   'G': '1qvi0n3urGcA1YX8i_syK9ialMQa0Dw7lpgbsBt7vE9w',
   'PD': '1BIoQKAn18xZdjoUxrIj5IGpjUJIoQ9AiVwVpysKJ6As',
   'SP': '1HZeo5kuicxIIirokZgpfFxLwM_px6PBNAVP-qXOK4Jc',
 },
 'takoverdrag': {
   'CS': '1oIsuMRyRQICYhvLfAX2S8NMF956M_36I9rJ61Af2TFo',
   'G': '1xHRtAdWNeWiLqXkzP6RCWUX221ACtKZFevgdXyEUQBA',
   'PD': '19q6iBW4sbHeHSHlA1ob_AObrt1D-4m_dlrm_aHy1AnI',
   'SP': '1k01C2a0OVkU8U2PwxHr9n3N1z_BOWAXKqbaCt3Dg4VE',
 },
 'stegstod': {
   'CS': '1PBEUx5VnEvCpS8SqsNKMjqP5lTREVsxE9vi6ZDEVmNY',
   'G': '1IWTVc6joLKF6fLtE8Ef-QTlLeR4j3R3DNddD6rdEau8',
   'PD': '1fkXzXBsuIRhxe4K2ZKTZ6Y_TPQBqERzonP33D6MoRaw',
   'SP': '1WPxiBs65qWxBVtrYnoXqCSEgJM0HBHlFvWIUDOVVVpw',
 },
}

for slug, ks in docs.items():
    outdir = os.path.join(BASE, slug, 'adcopy-sv')
    os.makedirs(outdir, exist_ok=True)
    for k, docid in ks.items():
        url = f"https://docs.google.com/document/d/{docid}/export?format=txt"
        out = os.path.join(outdir, k + '.txt')
        r = subprocess.run(['curl', '-sL', url], capture_output=True, text=True)
        open(out, 'w').write(r.stdout)
        print(slug, k, len(r.stdout), 'tecken')
