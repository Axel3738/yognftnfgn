#!/usr/bin/env python3
# koncept.py — V2.1: skiljer PRODUKTKONCEPT från LISTNING.
# Körs EFTER konsolidera.py. Läser dataset.json, grupperar listningar till koncept, sätter statusmodellen
# (PASS / FAIL / UNKNOWN / BLOCKED_SOURCE / PENDING_VERIFICATION / ALTERNATIVE_LISTING_REQUIRED),
# räknar KONCEPT-tratten och LISTNINGS-tratten, skriver koncept.json och de nya fälten tillbaka i
# dataset.json + dataset.csv. En svag listning dödar aldrig ett starkt koncept: koncept-FAIL kräver att
# felet sitter i gate 1–3, i strukturen (variant/hook/publik) eller är inbyggt i produkten.
# Hittar aldrig på data: saknat = UNKNOWN, Temu-blockerat = BLOCKED_SOURCE.
import json, os, re, csv, glob, collections, datetime, unicodedata
H = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(H, "dataset.json"), encoding="utf-8"))
rows = D["candidates"]
by_id = {str(r.get("goods_id")): r for r in rows}

def slug(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:48] or "x"

# ---------- 1. Gruppera listningar → koncept ----------
group_of = {}          # goods_id → group-key
group_name = {}        # group-key → namn
alt_alias = {}         # alt-filens concept_id → gruppnyckel
def join(ids, name, key=None):
    ids = [str(i) for i in ids if str(i) in by_id]
    if not ids: return
    existing = [group_of[i] for i in ids if i in group_of]
    key = existing[0] if existing else (key or slug(name))
    for i in ids: group_of[i] = key
    group_name.setdefault(key, name)

# (a) hyllverifieringens konceptlistor
for f in sorted(glob.glob(os.path.join(H, "hylla", "h*.json"))):
    for c in json.load(open(f, encoding="utf-8")):
        name = re.sub(r"^\d+[ab]?\.\s*", "", c.get("concept") or "")
        join(c.get("goods_ids") or [], name)
# (b) alternativa-listnings-filer (alt/*.json): kända + funna listningar hör till konceptet
for f in sorted(glob.glob(os.path.join(H, "alt", "*.json"))):
    try: a = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    ids = [str(x) for x in (a.get("known_listings") or [])] + [str(l.get("goods_id")) for l in (a.get("listings") or []) if l.get("goods_id")]
    known = [i for i in ids if i in by_id]
    join(known, a.get("concept") or a.get("concept_id"), key=a.get("concept_id"))
    if known: alt_alias[a.get("concept_id")] = group_of[known[0]]
# (c) slutdomens "dubblett av … <id>"
for r in rows:
    m = re.search(r"dubblett av .*?(\d{12,18})", r.get("tier_reason") or "", re.I)
    if m and m.group(1) in by_id:
        main = by_id[m.group(1)]
        join([m.group(1), str(r["goods_id"])], main.get("title_temu") or main.get("title") or main.get("title_from_search") or main.get("object") or "")
# (d) resten: samma kluster + samma objekt + samma hook = samma koncept (agenterna skrev identisk hook på dubbletter)
for r in rows:
    gid = str(r.get("goods_id"))
    if gid in group_of: continue
    hook = ((r.get("gates") or {}).get("hook") or {}).get("text") if isinstance((r.get("gates") or {}).get("hook"), dict) else None
    key = "auto:" + slug(f"{r.get('kluster')}-{r.get('object')}-{hook or gid}")
    join([gid], r.get("title_temu") or r.get("title") or r.get("title_from_search") or r.get("object") or gid, key=key)

concepts = collections.OrderedDict()
for gid, key in group_of.items():
    concepts.setdefault(key, []).append(gid)

# ---------- 2. Statusmodell ----------
ST = ("PASS", "FAIL", "UNKNOWN", "BLOCKED_SOURCE", "PENDING_VERIFICATION", "ALTERNATIVE_LISTING_REQUIRED")
def gate(r, g):
    x = (r.get("gates") or {}).get(g)
    return x if isinstance(x, dict) else {}
def norm(res, verified=None, needs_verify=False):
    v = str(res or "").upper().strip()
    if not v or v.startswith("UNKNOWN") or v == "—": return "UNKNOWN"
    if v.startswith("STRONG") or v.startswith("PASS"):
        if "VILLKOR" in v or "EJ VERIFIERAD" in v or (needs_verify and not verified): return "PENDING_VERIFICATION"
        return "PASS"
    if v.startswith("FAIL"): return "FAIL"
    if v.startswith("BORDERLINE"): return "PENDING_VERIFICATION"
    return "PENDING_VERIFICATION"   # UNCERTAIN / OSÄKER / KANSKE
TIER_RANK = {"A": 0, "NA": 1, "B": 2, "C": 3, "ELIM": 4}
def tier_class(r):
    t = (r.get("tier") or "ELIM").upper()
    if t.startswith("A"): return "A"
    if "NÄRMAST" in t: return "NA"
    if t.startswith("B"): return "B"
    if t.startswith("C"): return "C"
    return "ELIM"
STRUKTURELLA = ("latent behov", "want, inte need", "< 199", "ankare under vårt pris", "> 1 000", "lågt fackhandelsankare",
                "generisk old way", "osynligt objekt", "commodity", "publik + mått", "tre flaggor", "fel objekt", "spänning",
                "personlig passform", "överdrag + marketplace", "omtest", "strukturellt")

fetched = lambda r: bool(r.get("temu_us")) or r.get("temu_price_sek") not in (None, "", "UNKNOWN")
listing_rows = {}
for r in rows:
    gid = str(r.get("goods_id"))
    sh = gate(r, "shelf"); mat = gate(r, "material"); ec_us = gate(r, "economics_us"); ec = gate(r, "economics")
    s_obj = norm(gate(r, "object").get("result")); s_pre = norm(gate(r, "presence").get("result"))
    s_sh = norm(sh.get("result"), verified=sh.get("verified"), needs_verify=True)
    s_var = norm(gate(r, "variant").get("result")); s_hook = norm(gate(r, "hook").get("result")) if gate(r, "hook").get("result") else ("PASS" if gate(r, "hook").get("text") else "UNKNOWN")
    s_aud = norm(gate(r, "audience").get("result"))
    # material: bara verifierad om något faktiskt setts (a-kandidater/agentfil)
    if mat.get("verified_by"):
        s_mat = norm(mat.get("result")); mat_ver = True
    elif fetched(r):
        s_mat = "PENDING_VERIFICATION"; mat_ver = False     # data hämtad men ingen granskning gjord
    else:
        s_mat = "BLOCKED_SOURCE"; mat_ver = False
    # ekonomi: SE-pris > US-proxy > titelpris (agent) > blockerad
    if r.get("temu_price_sek") not in (None, "", "UNKNOWN") and ec.get("result"):
        s_ec = norm(ec.get("result")); ec_ver = True; ec_src = "se"
    elif ec_us.get("result"):
        s_ec = norm(ec_us.get("result")); ec_ver = True; ec_src = "us-proxy"
        if s_ec == "PASS": s_ec = "PENDING_VERIFICATION" if ec_us.get("result") == "BORDERLINE" else "PASS"
    elif ec.get("result") and str(ec.get("result")).upper().startswith(("PASS", "FAIL")):
        s_ec = norm(ec.get("result")); ec_ver = False; ec_src = "titelpris/uppskattning"
    else:
        s_ec = "BLOCKED_SOURCE"; ec_ver = False; ec_src = None
    ts = r.get("temu_fetched") or (mat.get("source") and "2026-09-04T07:22:00Z") or (sh.get("verified") and "2026-09-04T06:00:00Z") or None
    listing_rows[gid] = dict(s_obj=s_obj, s_pre=s_pre, s_sh=s_sh, s_var=s_var, s_hook=s_hook, s_aud=s_aud, s_mat=s_mat, s_ec=s_ec,
                             mat_ver=mat_ver, ec_ver=ec_ver, ec_src=ec_src, ts=ts, tier=tier_class(r))

# ---------- 3. Konceptstatus ----------
def best(vals, order=("PASS", "PENDING_VERIFICATION", "UNKNOWN", "BLOCKED_SOURCE", "FAIL")):
    # konceptets gate = bästa verifierade läget bland listningarna, men FAIL vinner om ALLA säger FAIL
    vals = list(vals)
    if vals and all(v == "FAIL" for v in vals): return "FAIL"
    for o in order:
        if o in vals: return o
    return "UNKNOWN"
out_concepts = []
dom_alt = {}
for f in glob.glob(os.path.join(H, "material", "*.json")):
    try:
        for c in json.load(open(f, encoding="utf-8")):
            if c.get("goods_id"): dom_alt[str(c["goods_id"])] = c.get("material_result")
    except Exception: pass
alt_files = {}
for f in glob.glob(os.path.join(H, "alt", "*.json")):
    try:
        a = json.load(open(f, encoding="utf-8")); alt_files[alt_alias.get(a.get("concept_id"), a.get("concept_id"))] = a
    except Exception: pass
for key, ids in concepts.items():
    L = [listing_rows[i] for i in ids]; R = [by_id[i] for i in ids]
    c_obj = best(l["s_obj"] for l in L); c_pre = best(l["s_pre"] for l in L); c_sh = best(l["s_sh"] for l in L)
    c_var = best(l["s_var"] for l in L); c_hook = best(l["s_hook"] for l in L); c_aud = best(l["s_aud"] for l in L)
    tiers = sorted(L, key=lambda l: TIER_RANK[l["tier"]]); c_tier = tiers[0]["tier"]
    main = sorted(R, key=lambda r: (TIER_RANK[tier_class(r)], -(r.get("structure_match") or 0)))[0]
    reason = main.get("tier_reason") or main.get("biggest_risk") or ""
    tl = (main.get("tier") or "").lower()
    # ett strukturellt fel som satts på NÅGON av konceptets listningar (slutdomen sätts på huvudlistningen,
    # dubbletter ligger ofta kvar som "B (dubblett)") fäller konceptet
    struct_rows = [r for r in R if any(k in (r.get("tier") or "").lower() for k in STRUKTURELLA)]
    if struct_rows and not tl.startswith(("a",)):
        main = struct_rows[0]; tl = (main.get("tier") or "").lower(); reason = main.get("tier_reason") or reason
    structural = any(k in tl for k in STRUKTURELLA)
    alt = alt_files.get(key) or {}
    alt_n = len(alt.get("listings") or [])
    alt_rows = []
    for l in alt.get("listings") or []:
        aid = str(l.get("goods_id") or ""); rawf = os.path.join(H, "raw", "us", f"{aid}.json")
        d = None
        if os.path.exists(rawf):
            try: d = json.load(open(rawf, encoding="utf-8"))
            except Exception: d = None
        if d and not d.get("blocked"):
            usd = d.get("price_sek") if d.get("currency") == "USD" else None
            ek = None
            try:
                usd_f = float(usd); se_lo, se_hi = round(usd_f * 6.96), round(usd_f * 8.16)
                la_lo, la_hi = round(se_lo * 1.5), round(se_hi * 1.5)
                pris = ((gate(main, "economics_us") or {}).get("se_price_used_sek")) or None
                if pris:
                    m_lo, m_hi = pris / la_hi, pris / la_lo
                    ek = {"landed_est_sek": [la_lo, la_hi], "se_price_used_sek": pris, "multiple": [round(m_lo, 2), round(m_hi, 2)],
                          "result": "PASS" if m_lo >= 2.4 else "BORDERLINE" if m_hi >= 2.4 else "FAIL"}
            except Exception: ek = None
            mat = dom_alt.get(aid)
            alt_rows.append({"goods_id": aid, "title": d.get("title"), "price_usd": usd,
                             "rating": d.get("rating"), "review_count": d.get("review_count"), "images": len(d.get("images") or []),
                             "video": bool(d.get("video_url")), "fetched": d.get("fetched"), "economics_us": ek,
                             "material": mat, "listing_status": ("FAIL" if (ek and ek["result"] == "FAIL") or (mat and str(mat).upper().startswith("FAIL")) else
                                                                 "PASS" if (ek and ek["result"] == "PASS" and mat and str(mat).upper().startswith("PASS")) else "PENDING_VERIFICATION")})
        else:
            alt_rows.append({"goods_id": aid, "title": l.get("title_from_search"), "snippet_price": l.get("snippet_price"),
                             "snippet_rating": l.get("snippet_rating"), "fetched": None, "listing_status": "BLOCKED_SOURCE"})
    c_provisorisk = tl.startswith("c") and any(k in tl for k in ("provisorisk", "ej hämtat", "ej verifierad", "tips"))
    c_listning = tl.startswith("c") and "us-pris" in tl          # ekonomi fälld på EN listnings pris = listningsfel
    if tl.startswith("c") and not c_provisorisk and not c_listning: structural = True
    # listningsnivå
    n_fetched = sum(1 for r in R if fetched(r)); n_mat_pass = sum(1 for l in L if l["s_mat"] == "PASS")
    n_ec_pass = sum(1 for l in L if l["s_ec"] == "PASS"); n_both = sum(1 for l in L if l["s_mat"] == "PASS" and l["s_ec"] == "PASS")
    listing_fail = [i for i, l in zip(ids, L) if l["s_mat"] == "FAIL" or l["s_ec"] == "FAIL"]
    # status
    if c_obj == "FAIL" or c_pre == "FAIL" or c_sh == "FAIL" or c_tier == "ELIM":
        status = "FAIL"; fail_structural, fail_listing = True, False
        why = "fälld i gate 1–3 (objekt/presens/hylla)" if c_tier == "ELIM" else reason
    elif structural or c_var == "FAIL" or c_aud == "FAIL":
        status = "FAIL"; fail_structural, fail_listing = True, False; why = reason
    elif n_both > 0 or any(a.get("listing_status") == "PASS" for a in alt_rows):
        status = "PASS"; fail_structural = fail_listing = False
        why = "minst en listning klarar material + ekonomi" + ("" if n_both else " (alternativ listning)")
    elif listing_fail and n_fetched > 0:
        # material/ekonomi föll på en listning — fel i listningen, inte konceptet, tills flera listningar fallit på samma sak
        if len(listing_fail) >= 2 and len(set(("mat" if listing_rows[i]["s_mat"] == "FAIL" else "ec") for i in listing_fail)) == 1 and len(listing_fail) == n_fetched:
            status = "FAIL"; fail_structural, fail_listing = True, False; why = f"{len(listing_fail)} listningar föll på samma gate"
        else:
            status = "ALTERNATIVE_LISTING_REQUIRED"; fail_structural, fail_listing = False, True; why = reason
    elif c_sh == "PENDING_VERIFICATION" or c_var == "PENDING_VERIFICATION" or c_aud == "PENDING_VERIFICATION":
        status = "PENDING_VERIFICATION"; fail_structural = fail_listing = False; why = "hylla/variant/publik ej verifierad"
    elif all(l["s_mat"] == "BLOCKED_SOURCE" and l["s_ec"] == "BLOCKED_SOURCE" for l in L):
        status = "BLOCKED_SOURCE"; fail_structural = fail_listing = False; why = "Temu blockerat — material och pris ej hämtade"
    else:
        status = "PENDING_VERIFICATION"; fail_structural = fail_listing = False; why = "data hämtad men gate 4/5 ej bedömda"
    best_listing = next((i for i, l in zip(ids, L) if l["s_mat"] == "PASS" and l["s_ec"] == "PASS"), None) or \
                   next((a["goods_id"] for a in alt_rows if a.get("listing_status") == "PASS"), None)
    ts = max([l["ts"] for l in L if l["ts"]] or [None], key=lambda x: x or "")
    out_concepts.append({"concept_id": key, "name": group_name.get(key, key), "kluster": main.get("kluster"), "object": main.get("object"),
        "listing_ids": ids, "listing_count": len(ids), "alternate_listing_count": len(ids) - 1 + alt_n,
        "alt_listings_found": alt_n, "alt_listings_checked": alt.get("checked_listings_count"), "alt_listings": alt_rows,
        "tier": c_tier, "concept_status": status, "status_reason": why,
        "gates": {"object": c_obj, "presence": c_pre, "shelf": c_sh, "variant": c_var, "hook": c_hook, "audience": c_aud},
        "shelf_verified": any((gate(r, "shelf") or {}).get("verified") for r in R),
        "listings_fetched": n_fetched, "material_pass": n_mat_pass, "economics_pass": n_ec_pass, "best_listing_id": best_listing,
        "failure_is_structural": fail_structural, "failure_is_listing_specific": fail_listing,
        "verification_timestamp": ts, "hook": (gate(main, "hook") or {}).get("text"), "structure_match": main.get("structure_match")})
    for i, l in zip(ids, L):
        r = by_id[i]
        if l["s_mat"] == "FAIL" or l["s_ec"] == "FAIL": ls = "FAIL"
        elif status == "FAIL": ls = "FAIL"
        elif l["s_mat"] == "PASS" and l["s_ec"] == "PASS": ls = "PASS"
        elif "BLOCKED_SOURCE" in (l["s_mat"], l["s_ec"]): ls = "BLOCKED_SOURCE"
        else: ls = "PENDING_VERIFICATION"
        r.update({"concept_id": key, "listing_id": i, "concept_status": status, "listing_status": ls,
                  "alternate_listing_count": len(ids) - 1 + alt_n, "material_verified": l["mat_ver"], "economics_verified": l["ec_ver"],
                  "economics_source": l["ec_src"], "source_blocked": not fetched(r), "verification_timestamp": l["ts"],
                  "failure_is_structural": fail_structural if ls == "FAIL" else False,
                  "failure_is_listing_specific": (ls == "FAIL" and not fail_structural),
                  "gate_status": {"object": l["s_obj"], "presence": l["s_pre"], "shelf": l["s_sh"], "material": l["s_mat"],
                                  "economics": l["s_ec"], "variant": l["s_var"], "hook": l["s_hook"], "audience": l["s_aud"]}})

# ---------- 4. Trattarna ----------
C = out_concepts
def cnt(pred): return sum(1 for c in C if pred(c))
concept_funnel = collections.OrderedDict([
    ("listningar", len(rows)), ("koncept", len(C)),
    ("objekt PASS", cnt(lambda c: c["gates"]["object"] != "FAIL")),
    ("presens PASS", cnt(lambda c: c["gates"]["object"] != "FAIL" and c["gates"]["presence"] != "FAIL")),
    ("hyllkvalificerade (verifierad PASS)", cnt(lambda c: c["gates"]["object"] != "FAIL" and c["gates"]["presence"] != "FAIL" and c["gates"]["shelf"] == "PASS")),
    ("hylla PENDING_VERIFICATION", cnt(lambda c: c["gates"]["object"] != "FAIL" and c["gates"]["presence"] != "FAIL" and c["gates"]["shelf"] == "PENDING_VERIFICATION")),
    ("strukturkvalificerade (variant/hook/publik ej FAIL, ej strukturellt fällda)", cnt(lambda c: c["concept_status"] != "FAIL" and c["gates"]["shelf"] in ("PASS", "PENDING_VERIFICATION"))),
    ("slutliga konceptöverlevare (status ≠ FAIL)", cnt(lambda c: c["concept_status"] != "FAIL")),
])
status_count = collections.Counter(c["concept_status"] for c in C)
surv = [c for c in C if c["concept_status"] != "FAIL"]
listing_funnel = collections.OrderedDict([
    ("kandidatkoncept (≠ FAIL)", len(surv)),
    ("listningar i dem", sum(c["listing_count"] for c in surv)),
    ("listningar hämtade (Temu-data)", sum(c["listings_fetched"] for c in surv)),
    ("material PASS", sum(c["material_pass"] for c in surv)),
    ("ekonomi PASS", sum(c["economics_pass"] for c in surv)),
    ("bästa listning vald (material + ekonomi PASS)", sum(1 for c in surv if c["best_listing_id"])),
    ("koncept ALTERNATIVE_LISTING_REQUIRED", status_count.get("ALTERNATIVE_LISTING_REQUIRED", 0)),
    ("koncept BLOCKED_SOURCE", status_count.get("BLOCKED_SOURCE", 0)),
])
D["concept_funnel"] = concept_funnel; D["listing_funnel"] = listing_funnel; D["concept_status_count"] = dict(status_count)
D["schema_version"] = "2.1"; D["generated"] = datetime.datetime.utcnow().isoformat() + "Z"
json.dump(D, open(os.path.join(H, "dataset.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump({"generated": D["generated"], "n_concepts": len(C), "concept_funnel": concept_funnel, "listing_funnel": listing_funnel,
           "status_count": dict(status_count), "concepts": sorted(C, key=lambda c: (TIER_RANK[c["tier"]], -(c["structure_match"] or 0)))},
          open(os.path.join(H, "koncept.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
# csv med de nya kolumnerna
GATES = ["object", "presence", "shelf", "material", "economics", "variant", "hook", "audience"]
with open(os.path.join(H, "dataset.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["concept_id", "listing_id", "kluster", "title", "concept_status", "listing_status", "tier", "alternate_listing_count",
                "material_verified", "economics_verified", "economics_source", "source_blocked", "verification_timestamp",
                "failure_is_structural", "failure_is_listing_specific", "temu_price_sek", "price_usd", "rating", "review_count",
                "structure_match", "hook", "url_se"] + ["gate_" + g for g in GATES])
    for r in rows:
        gs = r.get("gate_status") or {}
        w.writerow([r.get("concept_id"), r.get("listing_id"), r.get("kluster"), r.get("title_temu") or r.get("title") or r.get("title_from_search"),
                    r.get("concept_status"), r.get("listing_status"), r.get("tier"), r.get("alternate_listing_count"),
                    r.get("material_verified"), r.get("economics_verified"), r.get("economics_source"), r.get("source_blocked"), r.get("verification_timestamp"),
                    r.get("failure_is_structural"), r.get("failure_is_listing_specific"), r.get("temu_price_sek"), (r.get("temu_us") or {}).get("price_usd"),
                    r.get("rating"), r.get("review_count"), r.get("structure_match"), ((r.get("gates") or {}).get("hook") or {}).get("text") if isinstance((r.get("gates") or {}).get("hook"), dict) else None,
                    r.get("url_se")] + [gs.get(g) for g in GATES])
print(json.dumps({"koncept": len(C), "concept_funnel": concept_funnel, "listing_funnel": listing_funnel, "status": dict(status_count)}, ensure_ascii=False, indent=1))
print("\nKONCEPT ≠ FAIL:")
for c in sorted(surv, key=lambda c: (TIER_RANK[c["tier"]], -(c["structure_match"] or 0))):
    print(f"  {c['tier']:4} {c['concept_status']:28} sm={c['structure_match']} [{c['kluster']}] {c['concept_id']} · {c['name'][:60]} · listningar {c['listing_count']} (+{c['alt_listings_found']} alt) · hämtade {c['listings_fetched']} · hylla {c['gates']['shelf']}")
