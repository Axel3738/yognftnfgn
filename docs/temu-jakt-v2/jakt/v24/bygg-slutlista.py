#!/usr/bin/env python3
"""Bygger slutlistan och swipe-vyn ur URVAL.json + live/<id>/data.json.

    python3 bygg-slutlista.py [--datum 2026-09-08] [--runda r1]

URVAL.json är huvudsessionens urval: en lista med objekt
  {goods_id, namn, pris_sek, q4, hypotes, print, risk, hook, koncept_id}
Skriptet VÄGRAR varje rad vars live/<goods_id>/data.json saknas, inte är LIVE, inte har hero.jpg eller
hämtades ett annat datum än --datum. Det är den mekaniska garantin bakom REGEL.md avsnitt 3–4: ingen
död länk, ingen blockerad listning, ingen gammal verifiering. Fällda rader listas i utdatan.

Skriver: SLUTLISTA-<datum>.md (sex fält per rad, Axels format), swipe-<runda>.html (kort med hero som
data-URI, krympt via krymp-bild.cjs) och swipe-<runda>.json (samma data utan bilder, för read_db-avstämning).
"""
import base64
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
KRYMP = os.path.join(HERE, "krymp-bild.cjs")
SCRATCH = os.environ.get("TEMU_SCRATCH", "/tmp/claude-0/-home-user-yognftnfgn/6004bb4f-7a35-57f0-8251-e1adf76e9ef8/scratchpad/temu-html")


def arg(flag, default):
    return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default


def krymp(src, dst):
    if os.path.exists(dst) and os.path.getsize(dst) > 0:
        return dst
    env = dict(os.environ)
    env["NODE_PATH"] = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()
    r = subprocess.run(["node", KRYMP, src, dst, "640", "0.78"], capture_output=True, text=True, env=env, timeout=120)
    if not os.path.exists(dst):
        raise RuntimeError(f"krymp misslyckades: {r.stderr[-300:]}")
    return dst


def main():
    datum = arg("--datum", None)
    runda = arg("--runda", "r1")
    urval = json.load(open(os.path.join(HERE, "URVAL.json"), encoding="utf-8"))
    ok, fallda = [], []
    for u in urval:
        gid = str(u["goods_id"])
        p = os.path.join(HERE, "live", gid, "data.json")
        if not os.path.exists(p):
            fallda.append((gid, u["namn"], "ingen live-fil")); continue
        d = json.load(open(p, encoding="utf-8"))
        if d.get("verdict") != "LIVE" or not d.get("verified"):
            fallda.append((gid, u["namn"], f"verdict {d.get('verdict')}")); continue
        if datum and not str(d.get("fetched", "")).startswith(datum):
            fallda.append((gid, u["namn"], f"hämtad {d.get('fetched')}, inte {datum}")); continue
        hero = os.path.join(HERE, "live", gid, "hero.jpg")
        if not os.path.exists(hero) or os.path.getsize(hero) == 0:
            fallda.append((gid, u["namn"], "hero saknas")); continue
        ok.append((u, d, hero))
    datum = datum or (ok[0][1]["fetched"][:10] if ok else "")

    # --- SLUTLISTA (Axels sex fält) ---
    lines = [f"# SLUTLISTA {datum} — {len(ok)} produkter, alla LIVE-verifierade i dag", "",
             "Varje rad uppfyller REGEL.md: stark vinnarhypotes (bedömd + skeptikerprövad) OCH listningen öppnad, sedd och prissatt i den här körningen. "
             "Länken är SE-sajten (pris i SEK). `VERIFIED AT` är hämtningstiden ur `live/<id>/data.json`.", ""]
    for i, (u, d, _) in enumerate(ok, 1):
        pris = d.get("price"); cur = d.get("currency") or ""
        lines += [f"## {i}. {u['namn']}", "",
                  f"**PRODUCT** {u['namn']}  ",
                  f"**LIVE TEMU LINK** {d['url']}  ",
                  f"**VERIFIED AT** {d['fetched']} · {pris} {cur} · ★{d.get('rating')} ({d.get('review_count')} rec, SE-sajten) · {len(d.get('images') or [])} bilder · video {'ja' if d.get('video_url') else 'nej'} · lager {d.get('availability') or 'ej angivet'}  ",
                  f"**WINNER HYPOTHESIS** {u['hypotes']}  ",
                  f"**WHY IT COULD PRINT** {u['print']}  ",
                  f"**MAIN RISK** {u['risk']}  ", "",
                  f"Tänkt pris **{u['pris_sek']} kr** · {u.get('q4', '')} · hook: *{u.get('hook', '')}*", ""]
    if fallda:
        lines += ["---", "", "## Föll i bygget (ingår inte — REGEL.md avsnitt 3)", ""]
        lines += [f"- {n} ({g}): {why}" for g, n, why in fallda]
    open(os.path.join(HERE, f"SLUTLISTA-{datum}.md"), "w", encoding="utf-8").write("\n".join(lines) + "\n")

    # --- swipe-vyn ---
    kort = []
    for u, d, hero in ok:
        gid = str(u["goods_id"])
        small = krymp(hero, os.path.join(HERE, "live", gid, "hero-640.jpg"))
        b64 = base64.b64encode(open(small, "rb").read()).decode("ascii")
        kort.append({"id": gid, "namn": u["namn"], "pris_sek": u["pris_sek"], "temu_pris_sek": round(float(d.get("price") or 0)),
                     "temu_url": d["url"], "verified_at": d["fetched"], "q4": u.get("q4", ""), "hypotes": u["hypotes"],
                     "print": u["print"], "risk": u["risk"], "hook": u.get("hook", ""), "koncept_id": u.get("koncept_id", ""),
                     "hero": "data:image/jpeg;base64," + b64})
    mall = open(os.path.join(HERE, "swipe-mall.html"), encoding="utf-8").read()
    html = mall.replace("/*__DATA__*/[]", json.dumps(kort, ensure_ascii=False)).replace('/*__ROUND__*/""', json.dumps(runda))
    open(os.path.join(HERE, f"swipe-{runda}.html"), "w", encoding="utf-8").write(html)
    json.dump([{k: v for k, v in c.items() if k != "hero"} for c in kort], open(os.path.join(HERE, f"swipe-{runda}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"slutlista: {len(ok)} rader, {len(fallda)} fällda → SLUTLISTA-{datum}.md, swipe-{runda}.html ({os.path.getsize(os.path.join(HERE, f'swipe-{runda}.html')) // 1024} KB)")
    for g, n, why in fallda:
        print(f"  FÄLLD {g} {n}: {why}")


if __name__ == "__main__":
    main()
