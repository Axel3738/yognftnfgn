#!/usr/bin/env python3
"""cjk.py — japanska och kinesiska i bild- och videotexterna (2026-09-30, Matstrumpor i Japan och Taiwan).

Två saker går sönder när en text på japanska eller kinesiska ritas med verktygen som byggdes för
latinska språk:
  1. Typsnittet: Poppins och DejaVu saknar tecknen, så PIL ritar tomma rutor (tofu).
  2. Radbrytningen: det finns inga mellanslag, så en hel mening blev ETT ord som sprack ut över kanten.

  font_for(text, fontfil)  → Noto Sans CJK JP/TC Bold när texten är japansk/kinesisk, annars fontfil
  radbryt(text, font, max) → rader som får plats; bryter mellan tecken men aldrig så att en rad börjar
                              med 。、」 eller liten kana, och aldrig mitt i ett latinskt ord

Typsnitten (OFL) hämtas första gången till ~/.fonts från notofonts/noto-cjk via jsdelivr och läggs
i fontconfig (fc-cache), så att libass (no-captions.py) hittar samma typsnitt med namn.
"""
import os, re, subprocess, urllib.request

CJK = re.compile(r'[぀-ヿ㐀-鿿豈-﫿ｦ-ﾟ]')
KANA = re.compile(r'[぀-ヿ]')
BORJAR_EJ = '。、，．,.！？!?：:；;」』）)】〉》・ー…〜ゃゅょっぁぃぅぇぉャュョッァィゥェォ%％'
SLUTAR_EJ = '「『（(【〈《'
KATALOG = os.path.expanduser('~/.fonts')
TYPSNITT = {
    'ja': ('NotoSansCJKjp-Bold.otf', 'Japanese', 'Noto Sans CJK JP'),
    'zh': ('NotoSansCJKtc-Bold.otf', 'TraditionalChinese', 'Noto Sans CJK TC'),
}
KALLA = 'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/{mapp}/{fil}'


def sprak(text):
    """'ja' om texten bär kana, 'zh' om den bär kinesiska tecken utan kana, annars None."""
    t = str(text or '')
    if len(CJK.findall(t)) < 2: return None
    return 'ja' if KANA.search(t) else 'zh'


def typsnittsfil(lang):
    fil, mapp, _ = TYPSNITT[lang]
    sokvag = os.path.join(KATALOG, fil)
    if not os.path.exists(sokvag) or os.path.getsize(sokvag) < 1_000_000:
        os.makedirs(KATALOG, exist_ok=True)
        tmp = sokvag + '.del'
        urllib.request.urlretrieve(KALLA.format(mapp=mapp, fil=fil), tmp)
        os.replace(tmp, sokvag)
        subprocess.run(['fc-cache', '-f', KATALOG], capture_output=True)
    return sokvag


def typsnittsnamn(lang):
    """Namnet libass/fontconfig känner typsnittet under (efter typsnittsfil())."""
    typsnittsfil(lang)
    return TYPSNITT[lang][2]


def font_for(text, fontfil, lang=None):
    """Typsnittsfilen för texten: Noto Sans CJK (fet) för japanska/kinesiska, annars fontfil."""
    lang = lang or sprak(text)
    return typsnittsfil(lang) if lang in TYPSNITT else fontfil


def _enheter(text):
    """Tecken för tecken, men latinska ord och tal hålls ihop."""
    return re.findall(r'[A-Za-z0-9À-ÿ][A-Za-z0-9À-ÿ\'’.,%–-]*|\s+|.', text)


def radbryt(text, font, max_bredd):
    """Rader som får plats i max_bredd px (PIL-font med getlength)."""
    rader, rad = [], ''
    for e in _enheter(text):
        if e.isspace():
            if rad: rad += ' '
            continue
        prov = rad + e
        if font.getlength(prov.strip()) <= max_bredd or not rad.strip():
            rad = prov; continue
        # Kinsoku: skiljetecken och liten kana följer med raden före; en öppnande parentes med raden efter.
        if e[0] in BORJAR_EJ:
            rad = prov; continue
        flytt = ''
        while rad and rad[-1] in SLUTAR_EJ: flytt = rad[-1] + flytt; rad = rad[:-1]
        rader.append(rad.strip()); rad = flytt + e
    if rad.strip(): rader.append(rad.strip())
    return rader


if __name__ == '__main__':
    import sys
    from PIL import ImageFont
    t = ' '.join(sys.argv[1:]) or '本物のお寿司だと思ったでしょ？実はソックスなんです。'
    f = ImageFont.truetype(font_for(t, None), 40)
    print(sprak(t), font_for(t, None))
    for r in radbryt(t, f, 400): print(r, int(f.getlength(r)))
