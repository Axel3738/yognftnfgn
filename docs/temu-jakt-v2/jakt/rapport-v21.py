#!/usr/bin/env python3
# rapport-v21.py — genererar V2.1-avsnittet (koncept-tratt, listnings-tratt, konceptlista) ur koncept.json
# och skriver in det mellan markörerna <!-- V21:START --> … <!-- V21:END --> i rapporten (md) och artefakten (html).
#   python3 rapport-v21.py <rapport.md> <artefakt.html>
import json, os, sys, html as H_
H = os.path.dirname(os.path.abspath(__file__))
K = json.load(open(os.path.join(H, "koncept.json"), encoding="utf-8"))
D = json.load(open(os.path.join(H, "dataset.json"), encoding="utf-8"))
cf, lf, sc = K["concept_funnel"], K["listing_funnel"], K["status_count"]
C = K["concepts"]; surv = [c for c in C if c["concept_status"] != "FAIL"]
TIER = {"A": "A", "NA": "B (närmast A)", "B": "B", "C": "C", "ELIM": "ELIM"}
fetched_listings = [r for r in D["candidates"] if not r.get("source_blocked")]
gen = K["generated"][:16].replace("T", " ") + " UTC"

def behov(c):
    g = c["gates"]; s = c["concept_status"]
    if s == "PASS": return "—"
    if s == "ALTERNATIVE_LISTING_REQUIRED":
        return f"annan listning: {c['alt_listings_found']} funna" + (f", {sum(1 for a in c.get('alt_listings') or [] if a.get('fetched'))} hämtade" if c.get("alt_listings") else "") + " — " + (c["status_reason"] or "")[:90]
    if s == "BLOCKED_SOURCE": return "Temu-hämtning (material + pris)"
    need = []
    if g["shelf"] != "PASS": need.append("hylla verifierad")
    if g["variant"] == "PENDING_VERIFICATION": need.append("variant/SKU-lista")
    if g["audience"] == "PENDING_VERIFICATION": need.append("publikstorlek")
    if c["listings_fetched"] == 0: need.append("Temu-hämtning")
    elif not c["best_listing_id"]: need.append("materialgranskning")
    return ", ".join(need) or (c["status_reason"] or "")[:80]

# ---------- markdown ----------
md = []
md.append(f"<!-- V21:START -->\n## V2.1 — koncept skilt från listning (patch {gen})\n")
md.append("Axels patch V2.1 är i drift: hyllan verifieras **före** Temu-jakten, PRODUKTKONCEPT och LISTNING är två "
          "entiteter, statusmodellen är `PASS / FAIL / UNKNOWN / BLOCKED_SOURCE / PENDING_VERIFICATION / "
          "ALTERNATIVE_LISTING_REQUIRED`, och ett tekniskt fel (blockerad källa) blir aldrig ett kommersiellt. "
          "Hela pipelinen: `jakt/PIPELINE-V2.1.md`. Koncepttabellen: `jakt/koncept.json`.\n")
md.append("### Koncept-tratten\n\n```")
for k, v in cf.items(): md.append(f"{k:<75} {v:>4}")
md.append("```\n")
md.append("Statusfördelning bland koncepten: " + ", ".join(f"{k} {v}" for k, v in sorted(sc.items(), key=lambda x: -x[1])) + ".\n")
md.append("### Listnings-tratten\n\n```")
for k, v in lf.items(): md.append(f"{k:<55} {v:>4}")
md.append("```\n")
md.append(f"Målet är ett starkt koncept parat med en användbar listning. Hittills har **{lf.get('bästa listning vald (material + ekonomi PASS)', 0)}** koncept en sådan listning.\n")
md.append("### Konceptöverlevare (status ≠ FAIL)\n")
md.append("| Tier | Koncept | Status | Listn. | Alt. | Hämtade | Hylla | Vad som fattas |\n|---|---|---|---|---|---|---|---|")
for c in surv:
    md.append(f"| {TIER[c['tier']]} | {c['name'][:60]} (`{c['concept_id'][:30]}`) | `{c['concept_status']}` | {c['listing_count']} | {c['alt_listings_found']} | {c['listings_fetched']} | {c['gates']['shelf']} | {behov(c)} |")
md.append("")
md.append(f"Koncept med `FAIL`: {sc.get('FAIL', 0)} — alla med orsak i `koncept.json` (`status_reason`, `failure_is_structural`). "
          f"{sum(1 for c in C if c['concept_status']=='FAIL' and not c['shelf_verified'] and c['gates']['shelf']=='FAIL')} av dem föll på en hylla som bara är läst ur sökutdrag/minne "
          "(`shelf_verified = false`) — det är nästa verifieringskö enligt den nya ordningen.\n")
md.append("<!-- V21:END -->")
MD = "\n".join(md)

# ---------- html ----------
def e(x): return H_.escape(str(x))
pill = lambda s: f'<span class="pill {"ok" if s=="PASS" else "fail" if s=="FAIL" else "os"}">{e(s)}</span>'
h = []
h.append("<!-- V21:START -->")
h.append(f'  <h2>V2.1 — koncept skilt från listning</h2>\n  <p>Patch {e(gen)}: hyllan verifieras <em>före</em> Temu-jakten, koncept och listning är två entiteter, sex statusar, och en blockerad källa blir aldrig ett kommersiellt nej. Ett starkt koncept ska paras med en användbar listning — inte fällas av en svag.</p>')
h.append('  <h3>Koncept-tratten</h3>\n  <div class="tratt">')
top = cf["listningar"]
for k, v in cf.items():
    w = max(0.6, 100 * v / top)
    h.append(f'    <div class="steg"><span class="lab">{e(k)}</span><span class="bar"><i style="width:{w:.1f}%"></i></span><span class="v num">{v}</span></div>')
h.append('  </div>')
h.append('  <p class="fot">Status bland koncepten: ' + ", ".join(f"{e(k)} {v}" for k, v in sorted(sc.items(), key=lambda x: -x[1])) + '.</p>')
h.append('  <h3>Listnings-tratten</h3>\n  <div class="tratt">')
top2 = max(lf.values()) or 1
for k, v in lf.items():
    w = max(0.6, 100 * v / top2)
    h.append(f'    <div class="steg{" slut" if k.startswith("bästa") else ""}"><span class="lab">{e(k)}</span><span class="bar"><i style="width:{w:.1f}%"></i></span><span class="v num">{v}</span></div>')
h.append('  </div>')
h.append('  <h3>Konceptöverlevare</h3>\n  <div class="tabell"><table>\n    <thead><tr><th>Tier</th><th>Koncept</th><th>Status</th><th>Listn.</th><th>Alt.</th><th>Hämtade</th><th>Hylla</th><th>Vad som fattas</th></tr></thead>\n    <tbody>')
for c in surv:
    h.append(f'      <tr><td>{e(TIER[c["tier"]])}</td><td>{e(c["name"][:60])}<br><span class="id">{e(c["concept_id"][:34])}</span></td><td>{pill(c["concept_status"])}</td><td class="num">{c["listing_count"]}</td><td class="num">{c["alt_listings_found"]}</td><td class="num">{c["listings_fetched"]}</td><td>{pill(c["gates"]["shelf"])}</td><td>{e(behov(c))}</td></tr>')
h.append('    </tbody>\n  </table></div>')
h.append(f'  <p class="fot">Koncept med FAIL: {sc.get("FAIL", 0)}, alla med orsak i koncept.json. Listningar med Temu-data hittills: {len(fetched_listings)} av {len(D["candidates"])}.</p>')
h.append("<!-- V21:END -->")
HTML = "\n".join(h)

def infoga(path, block, before_marker):
    s = open(path, encoding="utf-8").read()
    if "<!-- V21:START -->" in s:
        a = s.index("<!-- V21:START -->"); b = s.index("<!-- V21:END -->") + len("<!-- V21:END -->")
        s = s[:a] + block + s[b:]
    else:
        i = s.index(before_marker); s = s[:i] + block + "\n\n" + s[i:]
    open(path, "w", encoding="utf-8").write(s)
if len(sys.argv) > 1: infoga(sys.argv[1], MD, "## 1. Objektuniversumet")
if len(sys.argv) > 2: infoga(sys.argv[2], HTML, "  <h2>Tratten</h2>")
print("V2.1-avsnitt:", len(surv), "överlevare;", "md" if len(sys.argv) > 1 else "", "html" if len(sys.argv) > 2 else "")
