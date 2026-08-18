#!/usr/bin/env python3
"""ABO -> CBO. Meta kan inte vaxla i efterhand, sa vi bygger en ny CBO-kampanj
som ateranvander exakt samma creatives, och raderar ABO-kampanjen sist."""
import json, os, sys, time, urllib.parse, urllib.request

T = os.environ["META_ACCESS_TOKEN"]; ACT = "act_918424617391896"
API = "https://graph.facebook.com/v21.0"; PIXEL = "776922878287560"
OLD = "120252843641270349"
SCR = os.path.dirname(os.path.abspath(__file__))
st = json.load(open(f"{SCR}/mx_launch_state.json"))
new_state_path = f"{SCR}/mx_cbo_state.json"
ns = json.load(open(new_state_path)) if os.path.exists(new_state_path) else {"adsets": {}, "ads": {}}
def save(): json.dump(ns, open(new_state_path, "w"), indent=1)

def call(path, params=None, method="POST"):
    for _ in range(30):
        p = dict(params or {}); p["access_token"] = T
        data = urllib.parse.urlencode(p).encode(); url = f"{API}/{path}"
        if method == "GET": url += "?" + data.decode(); data = None
        try:
            with urllib.request.urlopen(urllib.request.Request(url, data=data, method=method)) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            b = e.read().decode()
            if '"code":17' in b or "request limit" in b:
                print("   (rate limit, vantar 60s)"); time.sleep(60); continue
            print(f"!! {method} {path}\n   {b[:800]}", file=sys.stderr); raise SystemExit(1)
    raise SystemExit("rate limit")

ADSETS = {  # adsetnamn -> annonsnamn i det adsetet
 "GG PRODUKTSIDA - 01 foilstop": ["GG_01_H1_pain_ugc_foilstop","GG_01_H2_pain_ugc_vaporadentro","GG_01_H3_pain_ugc_cebollita"],
 "GG PRODUKTSIDA - 02 familia":  ["GG_02_H1_pain_ugc_familia","GG_02_H2_pain_ugc_alvapor","GG_02_H3_pain_ugc_esposa"],
 "GG PRODUKTSIDA - 06 top3":     ["GG_06_H1_curiosity_comparison_top3","GG_06_H2_curiosity_comparison_dosdetres","GG_06_H3_fomo_comparison_antesdecomprar"],
 "GG PRODUKTSIDA - 07 dinero":   ["GG_07_H1_pain_ugc_dinero","GG_07_H2_pain_ugc_diezpesos","GG_07_H3_pain_ugc_asadorcome"],
 "GG PRODUKTSIDA - 08 sazon":    ["GG_08_H1_curiosity_ugc_sazon","GG_08_H2_curiosity_ugc_miraparrilla","GG_08_H3_curiosity_ugc_fuegosabor"],
 "GG PRODUKTSIDA - BILDANNONSER":["GG_B1_pain_beforeafter_crudoquemado","GG_B2_benefit_collage_features","GG_B3_identity_lifestyle_3idiomas","GG_B4_benefit_product_medidas","GG_B5_offer_comparison_nogira","GG_B6_social_ugc_esposo"],
}

print("0) Hamtar creative-id fran ABO-annonserna")
CREATIVE = {}
for name, ad_id in st["ads"].items():
    CREATIVE[name] = call(ad_id, {"fields": "creative{id}"}, "GET")["creative"]["id"]
print(f"   {len(CREATIVE)} creatives ateranvands\n")

if "campaign" not in ns:
    call(OLD, {"name": "ZZ_GAMMAL_ABO_raderas"})          # frigor namnet
    r = call(f"{ACT}/campaigns", {
        "name": "CLIN_GG_SALES_20260818",
        "objective": "OUTCOME_SALES", "status": "PAUSED",
        "special_ad_categories": "[]", "buying_type": "AUCTION",
        "daily_budget": "200000",                          # 2 000 kr pa KAMPANJNIVA = CBO
        "bid_strategy": "LOWEST_COST_WITHOUT_CAP"})
    ns["campaign"] = r["id"]; save()
print(f"1) CBO-kampanj CLIN_GG_SALES_20260818 = {ns['campaign']} (2 000 kr/dag, PAUSED)\n")

TARGETING = json.dumps({"geo_locations": {"countries": ["MX"]}, "age_min": 25, "age_max": 65,
                        "targeting_automation": {"advantage_audience": 1}})
print("2) Adsets (ingen egen budget - kampanjen fordelar)")
for aname, ads in ADSETS.items():
    if aname not in ns["adsets"]:
        r = call(f"{ACT}/adsets", {
            "name": aname, "campaign_id": ns["campaign"],
            "billing_event": "IMPRESSIONS", "optimization_goal": "OFFSITE_CONVERSIONS",
            "promoted_object": json.dumps({"pixel_id": PIXEL, "custom_event_type": "PURCHASE"}),
            "targeting": TARGETING,
            "attribution_spec": json.dumps([{"event_type": "CLICK_THROUGH", "window_days": 7},
                                            {"event_type": "VIEW_THROUGH", "window_days": 1}]),
            "status": "ACTIVE"})
        ns["adsets"][aname] = r["id"]; save()
    print(f"   {aname:34} {ns['adsets'][aname]}")
    for adname in ads:
        if adname in ns["ads"]: continue
        ad = call(f"{ACT}/ads", {"name": adname, "adset_id": ns["adsets"][aname],
                                 "creative": json.dumps({"creative_id": CREATIVE[adname]}),
                                 "status": "ACTIVE"})
        ns["ads"][adname] = ad["id"]; save()
        print(f"        + {adname}")

print("\n3) Raderar den gamla ABO-kampanjen")
call(OLD, method="DELETE")
print("   klart")
print(f"\nKLART: {len(ns['ads'])} annonser i {len(ns['adsets'])} adsets, CBO 2 000 kr/dag, kampanjen PAUSED.")
