#!/usr/bin/env python3
"""
whop_dl.py — Personlig backup av en Whop-kurs DU SJÄLV har köpt.

Verktyget använder din egen inloggade webbläsarsession (Playwright). Det lagrar
aldrig ditt lösenord i kod och kringgår ingen betalvägg — du loggar in precis
som vanligt, och skriptet hämtar bara det material du redan har rätt att se.

Tre steg:
  1) login    — öppna en riktig webbläsare, logga in på whop.com EN gång.
                Sessionen sparas i whop_state.json (gitignore:as).
  2) capture  — öppna kursen i din inloggade session och FÅNGA video-strömmarna
                (HLS/Mux) + lektionstext medan lektionerna öppnas. Två lägen:
                  --auto   försöker klicka igenom lektionerna själv (best effort)
                  (default) manuellt: du klickar igenom, skriptet spelar in allt.
                Resultatet skrivs till manifest.json.
  3) fetch    — läs manifest.json och ladda ner alla videor med yt-dlp,
                organiserat per modul/lektion, plus lektionstext som .md.

Exempel:
    python whop_dl.py login
    python whop_dl.py capture --url "https://whop.com/<din-kurs>/..."
    python whop_dl.py fetch

Krav: se requirements.txt. yt-dlp + ffmpeg måste finnas i PATH för steg 3.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

def _import_playwright():
    """Importera Playwright först när det verkligen behövs (så --help funkar utan det)."""
    try:
        from playwright.async_api import async_playwright
        return async_playwright
    except ImportError:
        sys.exit(
            "Playwright saknas. Kör:\n"
            "  pip install -r requirements.txt\n"
            "  python -m playwright install chromium"
        )


HERE = Path(__file__).resolve().parent
STATE_FILE = HERE / "whop_state.json"
MANIFEST_FILE = HERE / "manifest.json"
OUTPUT_DIR = HERE / "output"

# URL-mönster som brukar vara faktiska videoströmmar värda att spara.
MEDIA_PATTERNS = re.compile(
    r"""(
        \.m3u8(\?|$)          # HLS-manifest (Mux m.fl.)
        | \.mpd(\?|$)         # DASH-manifest
        | \.mp4(\?|$)         # progressiv mp4
        | stream\.mux\.com    # Mux streaming
        | \.cloudfront\.net/.*\.(m3u8|mp4)
    )""",
    re.IGNORECASE | re.VERBOSE,
)

# Ignorera korta annons-/preview-snuttar och sprites.
IGNORE_PATTERNS = re.compile(r"(sprite|thumb|poster|/ads?/|preview)", re.IGNORECASE)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load_manifest() -> dict:
    if MANIFEST_FILE.exists():
        return json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
    return {"created": _now(), "course_url": None, "lessons": []}


def _save_manifest(manifest: dict) -> None:
    manifest["updated"] = _now()
    MANIFEST_FILE.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def _slug(text: str, fallback: str = "lektion") -> str:
    text = (text or "").strip() or fallback
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    return (text or fallback)[:80]


# --------------------------------------------------------------------------- #
# 1) LOGIN
# --------------------------------------------------------------------------- #
async def cmd_login(_args) -> None:
    print("Öppnar Chromium. Logga in på whop.com i fönstret som dyker upp.")
    print("När du ser din kurs/dashboard: kom tillbaka hit och tryck ENTER.\n")
    async_playwright = _import_playwright()
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        await page.goto("https://whop.com/login", wait_until="domcontentloaded")

        # Vänta på ENTER från terminalen utan att blockera event-loopen.
        await asyncio.get_event_loop().run_in_executor(
            None, input, ">>> Tryck ENTER när du är inloggad... "
        )

        await context.storage_state(path=str(STATE_FILE))
        await browser.close()
    print(f"\nSession sparad i {STATE_FILE.name}. Nu kan du köra 'capture'.")


# --------------------------------------------------------------------------- #
# 2) CAPTURE
# --------------------------------------------------------------------------- #
def _attach_media_sniffer(page, state: dict) -> None:
    """Lyssna på alla nätverkssvar och samla mediaström-URL:er."""

    def on_response(response):
        url = response.url
        if MEDIA_PATTERNS.search(url) and not IGNORE_PATTERNS.search(url):
            if url not in state["seen"]:
                state["seen"].add(url)
                state["pending"].append(url)
                print(f"    🎥 fångade ström: {url[:110]}")

    page.on("response", on_response)


async def _grab_lesson_meta(page) -> dict:
    """Plocka titel + synlig brödtext + nedladdningslänkar från aktuell lektion."""
    title = await page.title()
    # Försök hitta en tydligare rubrik än fliktiteln.
    for sel in ("h1", "[data-testid*='title']", "header h2", "main h1", "main h2"):
        try:
            el = await page.query_selector(sel)
            if el:
                txt = (await el.inner_text()).strip()
                if txt:
                    title = txt
                    break
        except Exception:
            pass

    body_text = ""
    try:
        main = await page.query_selector("main") or await page.query_selector("body")
        if main:
            body_text = (await main.inner_text()).strip()
    except Exception:
        pass

    attachments = []
    try:
        for a in await page.query_selector_all("a[href]"):
            href = await a.get_attribute("href")
            if href and re.search(r"\.(pdf|zip|docx?|pptx?|xlsx?|csv|mp3|wav)(\?|$)", href, re.I):
                attachments.append(href)
    except Exception:
        pass

    return {
        "title": title,
        "url": page.url,
        "text": body_text,
        "attachments": sorted(set(attachments)),
    }


async def _record_current_lesson(page, manifest: dict, sniff: dict) -> None:
    """Knyt de media-strömmar som fångats sedan förra lektionen till den här sidan."""
    await page.wait_for_timeout(1500)  # låt spelaren börja ladda manifestet
    meta = await _grab_lesson_meta(page)
    videos = list(sniff["pending"])
    sniff["pending"].clear()

    lesson = {
        "index": len(manifest["lessons"]) + 1,
        "title": meta["title"],
        "url": meta["url"],
        "videos": videos,
        "attachments": meta["attachments"],
        "text": meta["text"],
        "captured": _now(),
    }
    manifest["lessons"].append(lesson)
    _save_manifest(manifest)
    print(
        f"  ✔ [{lesson['index']:>2}] {meta['title'][:70]!r} "
        f"— {len(videos)} video(s), {len(meta['attachments'])} bilaga(or)"
    )


async def _auto_walk(page, manifest: dict, sniff: dict) -> None:
    """Best effort: klicka igenom lektionslänkarna i sidomenyn automatiskt.

    Whops DOM ändras då och då, så detta är avsiktligt generöst. Hittar den inga
    lektioner: fall tillbaka på manuellt läge (kör capture utan --auto).
    """
    course_host = urlparse(page.url).netloc

    # Samla in kandidat-länkar: interna länkar i huvudinnehållet/sidomenyn.
    hrefs = await page.eval_on_selector_all(
        "a[href]",
        """els => els
            .map(e => e.getAttribute('href'))
            .filter(h => h && !h.startsWith('#'))
        """,
    )
    # Normalisera till absoluta, unika, samma host, ser ut som lektions-URL:er.
    seen, lessons = set(), []
    for h in hrefs:
        absu = h if h.startswith("http") else f"https://{course_host}{h}"
        if urlparse(absu).netloc != course_host:
            continue
        # Lektioner ligger djupt i sökvägen; hoppa över korta nav-länkar.
        if absu in seen or len(urlparse(absu).path.strip("/").split("/")) < 3:
            continue
        seen.add(absu)
        lessons.append(absu)

    if not lessons:
        print(
            "  ⚠ Hittade inga lektionslänkar automatiskt.\n"
            "    Kör manuellt läge istället: python whop_dl.py capture --url ...\n"
            "    (utan --auto) och klicka igenom lektionerna själv."
        )
        return

    print(f"  Hittade {len(lessons)} kandidat-lektioner. Går igenom dem...")
    for url in lessons:
        try:
            print(f"  → {url}")
            await page.goto(url, wait_until="domcontentloaded")
            await _record_current_lesson(page, manifest, sniff)
        except Exception as exc:  # noqa: BLE001
            print(f"    (hoppar över, fel: {exc})")


async def cmd_capture(args) -> None:
    if not STATE_FILE.exists():
        sys.exit("Ingen session. Kör först: python whop_dl.py login")

    manifest = _load_manifest()
    manifest["course_url"] = args.url or manifest.get("course_url")
    sniff = {"seen": set(), "pending": []}

    async_playwright = _import_playwright()
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False)
        context = await browser.new_context(storage_state=str(STATE_FILE))
        page = await context.new_page()
        _attach_media_sniffer(page, sniff)

        start = args.url or manifest.get("course_url") or "https://whop.com"
        await page.goto(start, wait_until="domcontentloaded")

        if args.auto:
            await _auto_walk(page, manifest, sniff)
        else:
            print(
                "\nMANUELLT LÄGE — bulletproof.\n"
                "  1. Öppna en lektion i fönstret och låt videon börja spela ett par sek.\n"
                "  2. Kom hit och tryck ENTER för att spara den lektionen.\n"
                "  3. Upprepa för varje lektion.\n"
                "  4. Skriv 'q' + ENTER när du är klar.\n"
            )
            loop = asyncio.get_event_loop()
            while True:
                ans = await loop.run_in_executor(
                    None, input, ">>> ENTER = spara lektion, q = klar: "
                )
                if ans.strip().lower() == "q":
                    break
                await _record_current_lesson(page, manifest, sniff)

        await context.storage_state(path=str(STATE_FILE))  # fräscha upp cookies
        await browser.close()

    _save_manifest(manifest)
    n = len(manifest["lessons"])
    print(f"\nKlar. {n} lektion(er) i {MANIFEST_FILE.name}. Kör nu: python whop_dl.py fetch")


# --------------------------------------------------------------------------- #
# 3) FETCH
# --------------------------------------------------------------------------- #
def _cookie_header_from_state() -> str:
    """Bygg en Cookie-header från sparad session, för yt-dlp mot skyddade CDN:er."""
    if not STATE_FILE.exists():
        return ""
    data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    pairs = [f"{c['name']}={c['value']}" for c in data.get("cookies", [])]
    return "; ".join(pairs)


def cmd_fetch(args) -> None:
    if not MANIFEST_FILE.exists():
        sys.exit("Ingen manifest.json. Kör 'capture' först.")
    if not shutil.which("yt-dlp"):
        sys.exit("yt-dlp saknas i PATH. Installera: pip install yt-dlp (+ ffmpeg).")
    if not shutil.which("ffmpeg"):
        print("⚠ ffmpeg hittas inte — HLS→mp4 kan misslyckas. Installera ffmpeg.")

    manifest = _load_manifest()
    lessons = manifest["lessons"]
    if not lessons:
        sys.exit("manifest.json har inga lektioner.")

    OUTPUT_DIR.mkdir(exist_ok=True)
    cookie_header = _cookie_header_from_state()

    ok, fail, skip = 0, 0, 0
    for lesson in lessons:
        idx = lesson["index"]
        folder = OUTPUT_DIR / f"{idx:02d}-{_slug(lesson['title'])}"
        folder.mkdir(parents=True, exist_ok=True)

        # Spara lektionstext.
        if lesson.get("text"):
            (folder / "lektion.md").write_text(
                f"# {lesson['title']}\n\n{lesson['url']}\n\n---\n\n{lesson['text']}\n",
                encoding="utf-8",
            )

        videos = lesson.get("videos", [])
        if not videos:
            print(f"[{idx:02d}] {lesson['title'][:60]!r}: ingen video fångad — hoppar.")
            skip += 1
            continue

        for v_i, url in enumerate(videos, 1):
            out_tmpl = str(folder / f"video-{v_i:02d}.%(ext)s")
            cmd = [
                "yt-dlp",
                "--no-playlist",
                "--concurrent-fragments", "5",
                "--retries", "10",
                "--merge-output-format", "mp4",
                "-o", out_tmpl,
            ]
            if cookie_header:
                cmd += ["--add-header", f"Cookie:{cookie_header}"]
            if args.limit and (ok + fail) >= args.limit:
                print("Nådde --limit, stannar.")
                break
            cmd.append(url)

            print(f"[{idx:02d}.{v_i}] laddar ner: {url[:90]}")
            result = subprocess.run(cmd)
            if result.returncode == 0:
                ok += 1
            else:
                fail += 1
                print(f"    ✗ yt-dlp misslyckades (kod {result.returncode})")

    print(f"\nKlart. {ok} nedladdade, {fail} misslyckade, {skip} utan video.")
    print(f"Allt ligger i: {OUTPUT_DIR}")


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("login", help="Logga in en gång, spara sessionen.")

    cap = sub.add_parser("capture", help="Fånga video-strömmar + text per lektion.")
    cap.add_argument("--url", help="URL till kursen/första lektionen.")
    cap.add_argument("--auto", action="store_true", help="Försök klicka igenom lektioner automatiskt.")

    fet = sub.add_parser("fetch", help="Ladda ner allt med yt-dlp.")
    fet.add_argument("--limit", type=int, default=0, help="Max antal videor (0 = alla).")

    args = p.parse_args()
    if args.cmd == "login":
        asyncio.run(cmd_login(args))
    elif args.cmd == "capture":
        asyncio.run(cmd_capture(args))
    elif args.cmd == "fetch":
        cmd_fetch(args)


if __name__ == "__main__":
    main()
