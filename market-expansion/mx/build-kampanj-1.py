#!/usr/bin/env python3
"""Bygger CLIN_SALES_20260817 i Meta (act_918424617391896).
Kampanjen skapas PAUSED. Adsets och annonser skapas ACTIVE -> Axel slaar paa
EN switch (kampanjen) foer att gaa live. Skriptet aer resumebart via state.json.
"""
import json, os, sys, time, urllib.parse, urllib.request

TOKEN = os.environ["META_ACCESS_TOKEN"]
ACT = "act_918424617391896"
PAGE = "1334949959694822"
PIXEL = "776922878287560"
API = "https://graph.facebook.com/v21.0"
BASE_URL = "https://laclinicadelasador.mx/products/roterande-grillkorg-i-rostfritt-stal-perfekt-for-gronsaker-kott-tillbehor"
STATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build-kampanj-1-state.json")

state = json.load(open(STATE)) if os.path.exists(STATE) else {}
def save(): json.dump(state, open(STATE, "w"), indent=1)

def call(path, params, method="POST"):
    params = dict(params); params["access_token"] = TOKEN
    data = urllib.parse.urlencode(params).encode()
    url = f"{API}/{path}"
    if method == "GET":
        url += "?" + data.decode(); data = None
    req = urllib.request.Request(url, data=data, method=method)
    try:
        with urllib.request.urlopen(req) as r: return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"!! {method} {path}\n   {body[:900]}", file=sys.stderr)
        raise SystemExit(1)

def utm(adname):
    return (f"{BASE_URL}?utm_source=fb&utm_medium=paid"
            f"&utm_campaign=clin_mx_2026q3&utm_content={adname}")

# ---------------------------------------------------------------- annonstexter
COPY = {
"c2familia": dict(
 msg="""Esta canasta fue lo único que me hizo dejar el aluminio en la carne asada.

Antes mis camarones salían crudos por dentro o quemados por fuera — nunca esas rayas de asador de verdad.

Ahora nomás le echo todo, cierro, giro — y sale parejo cada vez.

Directo al lavavajillas, con garantía de por vida.

Compré dos con el paquete: una para mí, otra de regalo para mi esposa. Ya nunca asamos sin ella.

Hasta 42% de descuento + envío gratis a todo México. 4.8 estrellas y más de 240 reseñas.""",
 title="Un regalo que usan los dos", desc="Ideal para regalo, 2 pack", cta="SHOP_NOW"),
"c6top3": dict(
 msg="""Aluminio, tapetes o canasta giratoria: probamos los tres para asar camarones y verduras chicas.

#1 el aluminio: no se cae nada, pero bloquea el calor y la flama.

#2 los tapetes: es como cocinar en un sartén, pero afuera.

#3 la canasta giratoria de acero inoxidable: la flama llega directo a la comida y nada se cae por el asador.

Directo al lavavajillas.

Hasta 42% de descuento + envío gratis a todo México + garantía de por vida.""",
 title="El #3 sí le da sabor de verdad", desc="Top 3 para asar comida chica", cta="SHOP_NOW"),
"c1foilstop": dict(
 msg="""Cierras el paquete de aluminio y adentro pasa esto: se hace vapor, no fuego.

Tus camarones y verduras se cuecen al vapor — sin rayas de asador, sin sabor ahumado.

Con la canasta giratoria de acero inoxidable, la flama llega directo a la comida y nada se cae por el asador.

Le echas todo, cierras, giras. Directo al lavavajillas al terminar.

Hasta 42% de descuento + envío gratis a todo México + garantía de por vida. 4.8 estrellas y más de 240 reseñas.""",
 title="Nada de vapor. Puro sabor a asador.", desc="Rayas de asador de verdad", cta="SHOP_NOW"),
"c7dinero": dict(
 msg="""El verano pasado tiré comida por el asador — como dos mil pesos, calculando de volada.

La mitad de mis verduras y camarones se me caían directo a las brasas, y lo demás se pegaba o se quemaba.

El aluminio y los tapetes no resolvieron nada — nunca esas rayas de asador de verdad.

Con la canasta giratoria nada se cae, y la comida tiene contacto directo con la flama. Nomás le echas, giras, y directo al lavavajillas.

Cómprala una vez y ahorra en cada carne asada. Hasta 42% de descuento + garantía de por vida.""",
 title="Deja de tirar dinero al asador", desc="Nada se cae. Nunca más.", cta="SHOP_NOW"),
"c8sazon": dict(
 msg="""Si sazonas tus brochetas, estás tirando tu sazón a la basura.

En cuanto las volteas, la mitad se raspa contra el asador — ese sabor se va a las brasas, no a tu comida.

En la canasta giratoria todo va junto en un solo lugar: sazonas una vez y el sazón se queda en la comida.

Los agujeros son tan chicos que nada se te cae.

Desatornillas el mango en dos segundos — directo al lavavajillas.

Hasta 42% de descuento + envío gratis a todo México + garantía de por vida.""",
 title="Una sazonada. Sabor real.", desc="Tu sazón, no las brasas", cta="LEARN_MORE"),
"statics": dict(
 msg="""Cierre seguro, acero inoxidable y gira 360° — nada se te cae por el asador.

Le echas todo, cierras la tapa, la giras. Rayas de asador de verdad, sin aluminio y sin tapetes que bloqueen el fuego.

Mango desmontable, malla fina, se enjuaga en un minuto — o directo al lavavajillas.

Sirve para gas, carbón o pellets. Garantía de por vida.

Hasta 42% de descuento + envío gratis a todo México. 4.8 estrellas y más de 240 reseñas.""",
 title="Gira 360°. Nada se cae.", desc="Envío gratis a México", cta="SHOP_NOW"),
}

# ------------------------------------------------------- adsets och deras annonser
# (media_kaella, annonsnamn) -- video = titel i mediabiblioteket, bild = filnamn
ADSETS = [
 ("broad_advplus_purchase_c2familia", "c2familia", "video", [
   ("2 HOOK A.mp4", "clin_greatgrill_pain_ugc_familia_v1_pdp"),
   ("2 HOOK B.mp4", "clin_greatgrill_pain_ugc_alvapor_v1_pdp"),
   ("2 HOOK C.mp4", "clin_greatgrill_pain_ugc_esposa_v1_pdp")]),
 ("broad_advplus_purchase_c6top3", "c6top3", "video", [
   ("Ad 6 H1 v2.mp4", "clin_greatgrill_curiosity_comparison_top3_v1_pdp"),
   ("Ad 6 H2 v2.mp4", "clin_greatgrill_curiosity_comparison_dosdetres_v1_pdp"),
   ("Ad 6 H3 v2.mp4", "clin_greatgrill_fomo_comparison_antesdecomprar_v1_pdp")]),
 ("broad_advplus_purchase_c1foilstop", "c1foilstop", "video", [
   ("1 HOOK A.mp4", "clin_greatgrill_pain_ugc_foilstop_v1_pdp"),
   ("1 HOOK B.mp4", "clin_greatgrill_pain_ugc_vaporadentro_v1_pdp"),
   ("1 HOOK C.mp4", "clin_greatgrill_pain_ugc_cebollita_v1_pdp")]),
 ("broad_advplus_purchase_c7dinero", "c7dinero", "video", [
   ("7 H1.mp4", "clin_greatgrill_pain_ugc_dinero_v1_pdp"),
   ("7 H2.mp4", "clin_greatgrill_pain_ugc_diezpesos_v1_pdp"),
   ("7 H3.mp4", "clin_greatgrill_pain_ugc_asadorcome_v1_pdp")]),
 ("broad_advplus_purchase_c8sazon", "c8sazon", "video", [
   ("8 HOOK A.mp4", "clin_greatgrill_curiosity_ugc_sazon_v1_pdp"),
   ("8 HOOK B.mp4", "clin_greatgrill_curiosity_ugc_miraparrilla_v1_pdp"),
   ("8 HOOK C.mp4", "clin_greatgrill_curiosity_ugc_fuegosabor_v1_pdp")]),
 ("broad_advplus_purchase_statics", "statics", "image", [
   ("clin_greatgrill_pain_beforeafter_crudoquemado_v1.png", "clin_greatgrill_pain_beforeafter_crudoquemado_v1_pdp"),
   ("clin_greatgrill_benefit_collage_features_v1.png", "clin_greatgrill_benefit_collage_features_v1_pdp"),
   ("clin_greatgrill_identity_lifestyle_3idiomas_v1.png", "clin_greatgrill_identity_lifestyle_3idiomas_v1_pdp"),
   ("clin_greatgrill_benefit_product_medidas_v1.png", "clin_greatgrill_benefit_product_medidas_v1_pdp"),
   ("clin_greatgrill_offer_comparison_nogira_v1.png", "clin_greatgrill_offer_comparison_nogira_v1_pdp"),
   ("clin_greatgrill_social_ugc_esposo_v1.png", "clin_greatgrill_social_ugc_esposo_v1_pdp")]),
]

# ---------------------------------------------------------------- mediabibliotek
print("Laeser mediabiblioteket ...")
vids = call(f"{ACT}/advideos", {"fields": "id,title", "limit": "200"}, "GET")["data"]
VIDEO = {}
for v in vids: VIDEO.setdefault(v.get("title", ""), v["id"])  # nyast vinner
imgs = call(f"{ACT}/adimages", {"fields": "hash,name", "limit": "200"}, "GET")["data"]
IMAGE = {i.get("name", ""): i["hash"] for i in imgs}

missing = [m for _, _, k, ads in ADSETS for m, _ in ads
           if (m not in VIDEO if k == "video" else m not in IMAGE)]
if missing:
    print("SAKNAS I MEDIABIBLIOTEKET:", missing); raise SystemExit(1)
print(f"  {len(VIDEO)} videor, {len(IMAGE)} bilder -- alla 21 creatives hittade\n")

# ------------------------------------------------------------------- thumbnails
THUMB = {}
def thumb(video_id):
    if video_id in THUMB: return THUMB[video_id]
    for attempt in range(12):
        d = call(f"{video_id}/thumbnails", {"fields": "uri,is_preferred"}, "GET").get("data", [])
        if d:
            uri = next((t["uri"] for t in d if t.get("is_preferred")), d[0]["uri"])
            THUMB[video_id] = uri; return uri
        time.sleep(5)
    raise SystemExit(f"ingen thumbnail foer video {video_id}")

# kreativa foerbaettringar AV -- annars aendrar Meta creativen och hook-testet blir olaesbart
DOF = {"creative_features_spec": {k: {"enroll_status": "OPT_OUT"} for k in [
    "image_touchups", "video_auto_crop", "image_auto_crop",
    "text_optimizations", "text_generation", "image_enhancement", "adapt_to_placement",
    "add_text_overlay", "media_type_automation", "image_templates", "video_highlight",
    "music_generation", "translate_voiceover", "text_translation", "enhance_cta",
    "description_automation", "dynamic_cta_text", "image_animation", "video_to_image"]}}

# ------------------------------------------------------------------- 1. kampanj
if "campaign" not in state:
    r = call(f"{ACT}/campaigns", {
        "name": "CLIN_SALES_20260817",
        "objective": "OUTCOME_SALES",
        "status": "PAUSED",                 # <- hela spaerren ligger haer
        "special_ad_categories": "[]",
        "buying_type": "AUCTION",
        # budgetdelning AV: adseten maaste ha exakt lika budget foer att testet ska gaa att laesa
        "is_adset_budget_sharing_enabled": "false"})
    state["campaign"] = r["id"]; save()
    print(f"Kampanj CLIN_SALES_20260817 = {state['campaign']} (PAUSED)")
else:
    print(f"Kampanj finns redan = {state['campaign']}")
CAMP = state["campaign"]

TARGETING = json.dumps({
    "geo_locations": {"countries": ["MX"]},
    "age_min": 25, "age_max": 65,
    "targeting_automation": {"advantage_audience": 1}})

state.setdefault("adsets", {}); state.setdefault("ads", {})

for adset_name, copy_key, kind, ads in ADSETS:
    if adset_name not in state["adsets"]:
        r = call(f"{ACT}/adsets", {
            "name": adset_name,
            "campaign_id": CAMP,
            "daily_budget": "33300",                 # 333,00 SEK
            "billing_event": "IMPRESSIONS",
            "optimization_goal": "OFFSITE_CONVERSIONS",
            "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
            "promoted_object": json.dumps({"pixel_id": PIXEL, "custom_event_type": "PURCHASE"}),
            "targeting": TARGETING,
            "attribution_spec": json.dumps([
                {"event_type": "CLICK_THROUGH", "window_days": 7},
                {"event_type": "VIEW_THROUGH", "window_days": 1}]),
            "status": "ACTIVE"})
        state["adsets"][adset_name] = r["id"]; save()
        print(f"\nAdset {adset_name} = {r['id']} (333 kr/dag)")
    else:
        print(f"\nAdset {adset_name} finns redan = {state['adsets'][adset_name]}")
    ADSET = state["adsets"][adset_name]
    c = COPY[copy_key]

    for media, adname in ads:
        if adname in state["ads"]:
            print(f"   = {adname} finns redan"); continue
        cta = {"type": c["cta"], "value": {"link": utm(adname)}}
        if kind == "video":
            vid = VIDEO[media]
            spec = {"page_id": PAGE, "video_data": {
                "video_id": vid, "message": c["msg"], "title": c["title"],
                "link_description": c["desc"], "call_to_action": cta,
                "image_url": thumb(vid)}}
        else:
            spec = {"page_id": PAGE, "link_data": {
                "image_hash": IMAGE[media], "link": utm(adname),
                "message": c["msg"], "name": c["title"],
                "description": c["desc"], "call_to_action": cta}}
        cr = call(f"{ACT}/adcreatives", {
            "name": adname,
            "object_story_spec": json.dumps(spec),
            "degrees_of_freedom_spec": json.dumps(DOF)})
        ad = call(f"{ACT}/ads", {
            "name": adname, "adset_id": ADSET,
            "creative": json.dumps({"creative_id": cr["id"]}),
            "status": "ACTIVE"})
        state["ads"][adname] = ad["id"]; save()
        print(f"   + {adname} = {ad['id']}")

print(f"\nKLART. {len(state['ads'])} annonser i {len(state['adsets'])} adsets.")
print(f"Kampanj {CAMP} aer PAUSED -- inget spenderas foerraen den slaas paa.")
