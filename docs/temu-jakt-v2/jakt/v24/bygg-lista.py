#!/usr/bin/env python3
"""Bygger produktlistan som en sida med SÖKLÄNKAR i stället för enskilda annonslänkar.

    python3 bygg-lista.py

Bakgrund (incident 2026-09-08, REGEL.md avsnitt 8): en länk till EN Temu-annons dör — tre av tre
stickprov var slutsålda inom dagar. En **söklänk** kan inte dö: den visar det som ligger uppe just nu.
Därför är det söklänken Axel får, plus vad han ska leta efter och vad den får kosta.

Bilden bakas in som data-URI där vi har en (v24/live, v23/material eller v24/cdn-hero), annars ritas
en ren platshållare med produktens initial — inget kort utan visuell ankarpunkt.
"""
import base64
import json
import os
import subprocess
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
JAKT = os.path.dirname(HERE)
KRYMP = os.path.join(HERE, "krymp-bild.cjs")


def hero_for(gid):
    if not gid:
        return None
    for p in (os.path.join(HERE, "live", gid, "hero.jpg"),
              os.path.join(JAKT, "v23", "material", gid, "hero.jpg"),
              os.path.join(HERE, "cdn-hero", f"{gid}.jpg")):
        if os.path.exists(p) and os.path.getsize(p) > 0:
            return p
    return None


def krymp(src, dst):
    if os.path.exists(dst) and os.path.getsize(dst) > 0:
        return dst
    env = dict(os.environ)
    env["NODE_PATH"] = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()
    subprocess.run(["node", KRYMP, src, dst, "560", "0.75"], capture_output=True, text=True, env=env, timeout=180)
    return dst if os.path.exists(dst) else None


def main():
    lista = json.load(open(os.path.join(HERE, "LISTA.json"), encoding="utf-8"))
    os.makedirs(os.path.join(HERE, "sma"), exist_ok=True)
    for p in lista:
        # AliExpress-bilden är den varan länken går till — den vinner alltid över ett gammalt Temu-foto.
        h = None
        b = p.get("ali_bast")
        if b:
            cand = os.path.join(HERE, "ali-bild", b["product_id"] + ".jpg")
            if os.path.exists(cand) and os.path.getsize(cand) > 0:
                h = cand
        h = h or hero_for(p.get("bild_id"))
        p["hero"] = None
        if h:
            small = krymp(h, os.path.join(HERE, "sma", os.path.basename(h).replace(".jpg", "") + "-560.jpg"))
            if small:
                p["hero"] = "data:image/jpeg;base64," + base64.b64encode(open(small, "rb").read()).decode("ascii")
        p.setdefault("ali_sok_url", "")
    mall = open(os.path.join(HERE, "lista-mall.html"), encoding="utf-8").read()
    html = mall.replace("/*__DATA__*/[]", json.dumps(lista, ensure_ascii=False))
    out = os.path.join(HERE, "LISTA.html")
    open(out, "w", encoding="utf-8").write(html)
    print(f"LISTA.html: {len(lista)} produkter, {sum(1 for p in lista if p['hero'])} med bild, {os.path.getsize(out)//1024} KB")


if __name__ == "__main__":
    main()
