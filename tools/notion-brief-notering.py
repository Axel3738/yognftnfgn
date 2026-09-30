#!/usr/bin/env python3
"""Lägger en notering sist i en Notion-brief (ett nytt stycke).

Varför verktyget finns: /bildannonser läser priset live ur produktsidan före
varje rendering, och `bildannonser/verifiera.py` släpper bara igenom en
procentsats i creativen när briefen SJÄLV bär en rad som börjar med
`PRIS VERIFIERAT`. Samma sak gäller `BETYG VERIFIERAT` och, sedan fars
dag-batchen 2026-09-28, `REA BESLUTAD AV ÄGAREN`. Avläsningen måste alltså
skrivas ner i briefen — inte bara i en kommentar — annars stoppas annonsen
nästa gång någon renderar den, och ingen kan se vad som faktiskt mättes.

    python3 tools/notion-brief-notering.py <page-id> --text "PRIS VERIFIERAT ..."

Skriver ingenting om samma första rad redan står i briefen (idempotent, så en
körning som görs om inte fyller sidan med dubbletter). `--torr` visar bara.
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

H = {
    "Authorization": f"Bearer {os.environ.get('NOTION_TOKEN', '')}",
    "Notion-Version": "2025-09-03",
    "Content-Type": "application/json",
}


def api(metod, vag, kropp=None):
    for forsok in range(5):
        try:
            begaran = urllib.request.Request(
                f"https://api.notion.com/v1/{vag}",
                data=json.dumps(kropp).encode() if kropp else None,
                headers=H, method=metod)
            return json.load(urllib.request.urlopen(begaran, timeout=60))
        except urllib.error.HTTPError as fel:
            if forsok == 4:
                raise SystemExit(f"HTTP {fel.code}: {fel.read()[:300]}")
            time.sleep(1.5 * (forsok + 1))


def barn(block_id):
    ut, markor = [], None
    while True:
        svar = api("GET", f"blocks/{block_id}/children?page_size=100"
                   + (f"&start_cursor={markor}" if markor else ""))
        ut += svar["results"]
        if not svar.get("has_more"):
            return ut
        markor = svar["next_cursor"]


def text_i(block):
    typ = block["type"]
    return "".join(x.get("plain_text", "")
                   for x in block.get(typ, {}).get("rich_text", []))


def stycken(text):
    """Notion tar max 2000 tecken per rich_text-bit."""
    return [text[i:i + 1900] for i in range(0, len(text), 1900)] or [""]


def main():
    p = argparse.ArgumentParser(description="Lägger en notering sist i en Notion-brief.")
    p.add_argument("sida", help="Notion-sidans id")
    p.add_argument("--text", required=True, help="Noteringen, hela raden")
    p.add_argument("--torr", action="store_true", help="Visa bara, skriv inget")
    args = p.parse_args()

    if not os.environ.get("NOTION_TOKEN"):
        raise SystemExit("NOTION_TOKEN saknas i miljön.")

    nyckel = args.text.strip().split(":")[0].split(" 2")[0].strip()
    if not nyckel:
        raise SystemExit("Noteringen saknar text.")

    for block in barn(args.sida):
        if text_i(block).strip().startswith(nyckel):
            print(f"  = redan skriven ({nyckel}) — rör inget")
            return 0

    if args.torr:
        print(f"  [torr] hade lagt till: {args.text[:120]}")
        return 0

    api("PATCH", f"blocks/{args.sida}/children", {
        "children": [{"object": "block", "type": "paragraph", "paragraph": {
            "rich_text": [{"type": "text", "text": {"content": bit}}
                          for bit in stycken(args.text)]}}]})
    print(f"  ✓ noteringen tillagd: {nyckel}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
