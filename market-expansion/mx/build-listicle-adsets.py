#!/usr/bin/env python3
"""Speglar de 6 PRODUKTSIDA-adseten med LISTICLE-versioner i samma CBO-kampanj.
Samma annonsnamn, samma creative-innehall - enda skillnaden ar landningssidan."""
import json, os, sys, time, urllib.parse, urllib.request

T=os.environ["META_ACCESS_TOKEN"]; ACT="act_918424617391896"
API="https://graph.facebook.com/v21.0"; PIXEL="776922878287560"
SCR=os.path.dirname(os.path.abspath(__file__))
ns=json.load(open(f"{SCR}/mx_cbo_state.json"))
lp=f"{SCR}/mx_listicle_state.json"
ls=json.load(open(lp)) if os.path.exists(lp) else {"adsets":{}, "ads":{}}
def save(): json.dump(ls, open(lp,"w"), indent=1)

UTM=("?utm_source=fb&utm_medium=paid&utm_campaign=clin_mx_2026q3"
     "&utm_content={{ad.name}}&utm_term={{adset.name}}")

def call(path, params=None, method="POST"):
    for _ in range(30):
        p=dict(params or {}); p["access_token"]=T
        data=urllib.parse.urlencode(p).encode(); url=f"{API}/{path}"
        if method=="GET": url+="?"+data.decode(); data=None
        try:
            with urllib.request.urlopen(urllib.request.Request(url,data=data,method=method)) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            b=e.read().decode()
            if '"code":17' in b or "request limit" in b:
                print("   (rate limit, vantar 60s)"); time.sleep(60); continue
            print(f"!! {method} {path}\n   {b[:800]}", file=sys.stderr); raise SystemExit(1)
    raise SystemExit("rate limit")

# (PRODUKTSIDA-adset som speglas, nytt LISTICLE-adset, landningssida)
MIRROR=[
 ("GG PRODUKTSIDA - 01 foilstop",   "GG LISTICLE 8 - 01 foilstop",    "https://laclinicadelasador.mx/pages/8"),
 ("GG PRODUKTSIDA - 02 familia",    "GG LISTICLE 8 - 02 familia",     "https://laclinicadelasador.mx/pages/8"),
 ("GG PRODUKTSIDA - 06 top3",       "GG LISTICLE 8 - 06 top3",        "https://laclinicadelasador.mx/pages/8"),
 ("GG PRODUKTSIDA - 07 dinero",     "GG LISTICLE 11 - 07 dinero",     "https://laclinicadelasador.mx/pages/11"),
 ("GG PRODUKTSIDA - 08 sazon",      "GG LISTICLE 13 - 08 sazon",      "https://laclinicadelasador.mx/pages/13"),
 ("GG PRODUKTSIDA - BILDANNONSER",  "GG LISTICLE 1 - BILDANNONSER",   "https://laclinicadelasador.mx/pages/1"),
]
TARGETING=json.dumps({"geo_locations":{"countries":["MX"]},"age_min":25,"age_max":65,
                      "targeting_automation":{"advantage_audience":1}})

for src_adset, new_adset, page in MIRROR:
    src_id=ns["adsets"][src_adset]
    if new_adset not in ls["adsets"]:
        r=call(f"{ACT}/adsets", {
            "name": new_adset, "campaign_id": ns["campaign"],
            "billing_event":"IMPRESSIONS", "optimization_goal":"OFFSITE_CONVERSIONS",
            "promoted_object": json.dumps({"pixel_id":PIXEL,"custom_event_type":"PURCHASE"}),
            "targeting": TARGETING,
            "attribution_spec": json.dumps([{"event_type":"CLICK_THROUGH","window_days":7},
                                            {"event_type":"VIEW_THROUGH","window_days":1}]),
            "status":"ACTIVE"})
        ls["adsets"][new_adset]=r["id"]; save()
    print(f"\n{new_adset}  ->  {page}")
    for ad in call(f"{src_id}/ads", {"fields":"name,creative{object_story_spec,degrees_of_freedom_spec}","limit":"10"}, "GET")["data"]:
        key=f"{new_adset}::{ad['name']}"
        if key in ls["ads"]: print(f"   = {ad['name']}"); continue
        spec=ad["creative"]["object_story_spec"]
        dof=ad["creative"].get("degrees_of_freedom_spec")
        inner=spec.get("video_data") or spec.get("link_data")
        inner["call_to_action"]["value"]["link"]=page+UTM
        if "link" in inner: inner["link"]=page+UTM
        # Meta returnerar bade image_url och image_hash men accepterar bara en
        if "image_hash" in inner: inner.pop("image_url", None)
        payload={"name":ad["name"],"object_story_spec":json.dumps(spec)}
        if dof: payload["degrees_of_freedom_spec"]=json.dumps(dof)
        cr=call(f"{ACT}/adcreatives", payload)
        new=call(f"{ACT}/ads", {"name":ad["name"],"adset_id":ls["adsets"][new_adset],
                                "creative":json.dumps({"creative_id":cr["id"]}),"status":"ACTIVE"})
        ls["ads"][key]=new["id"]; save()
        print(f"   + {ad['name']}")

print(f"\nKLART: {len(ls['ads'])} listicle-annonser i {len(ls['adsets'])} nya adsets.")
