#!/usr/bin/env python3
"""Speglar en Shopify-sida lokalt så den går att rendera utan nät.

Chromium i den här miljön når inte ut. curl gör det. Alltså hämtar vi sidan och
allt den refererar med curl, skriver om länkarna till lokala filer och renderar
från file:// i stället.

    python3 spegla.py <url> <mapp>
"""
import hashlib
import os
import re
import subprocess
import sys
from urllib.parse import urljoin

url, mapp = sys.argv[1], sys.argv[2]
os.makedirs(f"{mapp}/a", exist_ok=True)
JAR = f"{mapp}/jar.txt"

# Förhandsvisning sätts av en kaka vid första anropet. Utan kakburk får vi
# det publicerade temat i stället — och det ser ut att fungera.
subprocess.run(["curl", "-sSL", "-c", JAR, "-b", JAR, "-A", "Mozilla/5.0", url, "-o", "/dev/null"], capture_output=True)


def hamta(u, binar=True):
    """Hämtar en URL med curl och returnerar det lokala filnamnet, eller None."""
    namn = hashlib.md5(u.encode()).hexdigest()[:16]
    slut = re.search(r"\.(css|js|woff2?|png|jpe?g|webp|svg|gif)", u.split("?")[0])
    namn += "." + (slut.group(1) if slut else "bin")
    vag = f"{mapp}/a/{namn}"
    if not os.path.exists(vag):
        r = subprocess.run(["curl", "-sSL", "--max-time", "40", "-c", JAR, "-b", JAR, "-A", "Mozilla/5.0", u, "-o", vag],
                           capture_output=True)
        if r.returncode != 0 or not os.path.exists(vag) or os.path.getsize(vag) == 0:
            return None
    return f"a/{namn}"


html = subprocess.run(["curl", "-sSL", "-c", JAR, "-b", JAR, "-A", "Mozilla/5.0", url],
                      capture_output=True, text=True).stdout
print(f"sida: {len(html)} tecken")

# srcset gör att webbläsaren väljer en fjärr-URL vi inte speglat. Bort med den.
html = re.sub(r'\ssrcset="[^"]*"', "", html)
html = re.sub(r'\ssizes="[^"]*"', "", html)
html = re.sub(r'\sdata-srcset="[^"]*"', "", html)

# Stylesheets läggs in som <style> — då följer även deras egna url() med.
def css_in(m):
    href = urljoin(url, m.group(1))
    lokal = hamta(href)
    if not lokal:
        return ""
    css = open(f"{mapp}/{lokal}", encoding="utf-8", errors="replace").read()

    def url_om(mm):
        u = urljoin(href, mm.group(1).strip("'\""))
        if not u.startswith("http"):
            return mm.group(0)
        f = hamta(u)
        return f'url({f})' if f else "url()"

    css = re.sub(r"url\(([^)]+)\)", url_om, css)
    return f"<style>\n{css}\n</style>"


html = re.sub(r'<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', css_in, html)
html = re.sub(r'<link[^>]+href="([^"]+\.css[^"]*)"[^>]*rel="stylesheet"[^>]*>', css_in, html)

# Typsnitt och bilder som ligger kvar som absoluta URL:er i inline-CSS och taggar.
def absolut_om(m):
    u = m.group(0).strip('"\'')
    f = hamta(u)
    return f if f else u


html = re.sub(r'https://fonts\.shopifycdn\.com/[^"\')\s]+', absolut_om, html)
html = re.sub(r'https://cdn\.shopify\.com/[^"\')\s]+\.(?:png|jpe?g|webp|svg|gif)(?:\?[^"\')\s]*)?',
              absolut_om, html)

ut = f"{mapp}/sida.html"
open(ut, "w", encoding="utf-8").write(html)
print("speglad:", ut, "|", len(os.listdir(f'{mapp}/a')), "filer")
