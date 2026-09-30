# lyssna.py — "lyssna själv" så gott det går utan öron (järnregel 3 i /translate: grönt i
# rostkoll.py betyder "inga mätbara fel", inte "godkänd"). Byggt 2026-09-28 för Matstrumpors
# HeyGen-körning till elva marknader, där ingen människa hann lyssna på 33 videor.
#
#   python3 pipeline/lyssna.py <final.mp4> <lokaliserad.srt> <kalla.mp4> <sprakkod>
#
# Skriver EN rad JSON:
#   sprak_hort / sannolikhet — språket faster-whisper hör i dubben (ska vara marknadens)
#   ordtackning             — andel av SRT:ns ord som faktiskt hörs (Whisper small stavar fel
#                              på produktord, så 0,7–0,9 är normalt; under ~0,6 = lyssna).
#                              ja/zh: andel teckenpar (Whisper väljer ofta kana där manuset har
#                              kanji, så där är ~0,5 normalt); zh jämförs i traditionella tecken
#   f0_dub / f0_kalla       — röstens mediantonhöjd i Hz; en klonad kvinnoröst ska ligga
#                              inom ~25 % av källans (byte av person eller kön syns här)
#   hort                    — hela transkriptionen, för att läsa slutet (avhugget sista ord)
# Kräver faster-whisper + modellen "small" (laddas ner första gången) och ffmpeg.
import json, re, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

def ljud(fil, sr=16000):
    p = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', fil, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True)
    return np.frombuffer(p.stdout, dtype=np.int16).astype(np.float32) / 32768.0

def tonhojd(x, sr=16000):
    """Median-F0 över tonande ramar (autokorrelation, 60–400 Hz)."""
    ram, hopp = int(0.04 * sr), int(0.02 * sr)
    f0 = []
    energi = np.sqrt(np.mean(x ** 2)) if len(x) else 0
    for i in range(0, len(x) - ram, hopp):
        r = x[i:i + ram] * np.hanning(ram)
        if np.sqrt(np.mean(r ** 2)) < max(0.02, energi * 0.6): continue
        ac = np.correlate(r, r, 'full')[ram - 1:]
        lo, hi = int(sr / 400), int(sr / 60)
        if ac[0] <= 0: continue
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] / ac[0] > 0.45: f0.append(sr / k)
    return float(np.median(f0)) if len(f0) > 20 else None

CJK = re.compile(r'[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]')

def ord_i(t, sprak=''):
    """Orden att jämföra. Japanska och kinesiska har inga mellanslag (2026-09-30, Japan och
    Taiwan): där är "orden" teckenpar ur de japanska/kinesiska tecknen, annars blev en hel sats
    ett enda "ord" och täckningen nära noll hur rätt rösten än var."""
    if sprak in ('ja', 'zh') or len(CJK.findall(t)) > len(t) // 3:
        tecken = CJK.findall(t)
        return [a + b for a, b in zip(tecken, tecken[1:])]
    return re.findall(r"[\w']+", t.lower())

def traditionell(t):
    """Whisper skriver taiwanesisk mandarin med FÖRENKLADE tecken — jämför i traditionella
    (opencc s2twp, `pip install opencc-python-reimplemented`). Saknas paketet: oförändrat."""
    try:
        import opencc
        return opencc.OpenCC('s2twp').convert(t)
    except ImportError:
        return t

def main():
    fil, srt, kalla, sprak = sys.argv[1:5]
    modell = WhisperModel('small', device='cpu', compute_type='int8')
    segs, info = modell.transcribe(fil, beam_size=5, vad_filter=True)
    hort = ' '.join(s.text.strip() for s in segs)
    srt_text = ' '.join(r for r in open(srt, encoding='utf-8').read().split('\n') if r.strip() and not r.strip().isdigit() and '-->' not in r)
    if sprak == 'zh': hort = traditionell(hort)
    hord, sord = ord_i(hort, sprak), ord_i(srt_text, sprak)
    mangd = set(hord)
    tackning = sum(1 for o in sord if o in mangd) / max(1, len(sord))
    f_dub, f_kalla = tonhojd(ljud(fil)), tonhojd(ljud(kalla))
    print(json.dumps({
        'fil': fil.split('/')[-1], 'sprak_hort': info.language, 'sannolikhet': round(info.language_probability, 2),
        'sprak_ska': sprak, 'ordtackning': round(tackning, 2), 'f0_dub': round(f_dub or 0), 'f0_kalla': round(f_kalla or 0),
        'hort': hort,
    }, ensure_ascii=False))

main()
