#!/usr/bin/env python3
"""Bygger om CLIN_GG_SALES_20260818 enligt Axels struktur 2026-08-18:
   ETT ADSET PER ANNONS (koncept). Bade produktside- och listicle-versionen av
   varje hook ligger i SAMMA adset -> destinationen star i annonsnamnet.
   Aterbrukar befintliga creatives dar de finns, skapar bara det som saknas."""
import json, os, sys, time, urllib.parse, urllib.request

T=os.environ["META_ACCESS_TOKEN"]; ACT="act_918424617391896"
API="https://graph.facebook.com/v21.0"; PAGE="1334949959694822"; PIXEL="776922878287560"
CAMP="120252844116050349"
SCR=os.path.dirname(os.path.abspath(__file__))
SP=f"{SCR}/mx_rebuild_state.json"
S=json.load(open(SP)) if os.path.exists(SP) else {"adsets":{}, "ads":{}, "creatives":{}, "deleted":[]}
def save(): json.dump(S, open(SP,"w"), indent=1)

UTM=("?utm_source=fb&utm_medium=paid&utm_campaign=clin_mx_2026q3"
     "&utm_content={{ad.name}}&utm_term={{adset.name}}")
PDP="https://laclinicadelasador.mx/products/roterande-grillkorg-i-rostfritt-stal-perfekt-for-gronsaker-kott-tillbehor"
LST={n: f"https://laclinicadelasador.mx/pages/{n}" for n in (1,8,11,13,22)}

def call(path, params=None, method="POST"):
    for _ in range(40):
        p=dict(params or {}); p["access_token"]=T
        data=urllib.parse.urlencode(p).encode(); url=f"{API}/{path}"
        if method=="GET": url+="?"+data.decode(); data=None
        try:
            with urllib.request.urlopen(urllib.request.Request(url,data=data,method=method)) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            b=e.read().decode()
            if '"code":17' in b or "request limit" in b:
                print("   (rate limit, vantar 60s)", flush=True); time.sleep(60); continue
            print(f"!! {method} {path}\n   {b[:800]}", file=sys.stderr); raise SystemExit(1)
    raise SystemExit("rate limit")

# ---------------------------------------------------------------- annonstexter
C={}
C["01"]=("""Cierras el paquete de aluminio y adentro pasa esto: se hace vapor, no fuego.

Tus camarones y verduras se cuecen al vapor — sin rayas de asador, sin sabor ahumado.

Con la canasta giratoria de acero inoxidable, la flama llega directo a la comida y nada se cae por el asador.

Le echas todo, cierras, giras. Directo al lavavajillas al terminar.

Hasta 42% de descuento + envío gratis a todo México + garantía de por vida. 4.8 estrellas y más de 240 reseñas.""",
 "Nada de vapor. Puro sabor a asador.","Rayas de asador de verdad","SHOP_NOW")
C["02"]=("""Esta canasta fue lo único que me hizo dejar el aluminio en la carne asada.

Antes mis camarones salían crudos por dentro o quemados por fuera — nunca esas rayas de asador de verdad.

Ahora nomás le echo todo, cierro, giro — y sale parejo cada vez.

Directo al lavavajillas, con garantía de por vida.

Compré dos con el paquete: una para mí, otra de regalo para mi esposa. Ya nunca asamos sin ella.

Hasta 42% de descuento + envío gratis a todo México. 4.8 estrellas y más de 240 reseñas.""",
 "Un regalo que usan los dos","Ideal para regalo, 2 pack","SHOP_NOW")
C["04"]=("""Cocinaste 20 minutos. Vas a tallar la plancha otros 10.

Una plancha cerrada bloquea el fuego por completo — los jugos se quedan ahí, nada agarra humo.

La canasta giratoria es de acero inoxidable, tan ligera que la levantas con una mano.

La malla abierta deja pasar la flama y el humo — pero los agujeros son tan chicos que nada se te cae.

Desatornillas el mango y va directo al lavavajillas.

Hasta 42% de descuento + garantía de por vida. 4.8 estrellas y más de 240 reseñas.""",
 "Más ligera. Más limpia. Más sabor.","Se levanta con una mano","LEARN_MORE")
C["05"]=("""Muchos todavía usan aluminio como si no hubiera nada mejor. Sí lo hay.

Te recomiendo la canasta giratoria: le echas camarones, verduras, todo lo chico para el asador — y salen rayas de asador de verdad, cada vez.

Directo al lavavajillas al terminar.

Hasta 42% de descuento + envío gratis a todo México + garantía de por vida.""",
 "Sí hay algo mejor que el aluminio","Rayas de verdad, cada vez","SHOP_NOW")
C["06"]=("""Aluminio, tapetes o canasta giratoria: probamos los tres para asar camarones y verduras chicas.

#1 el aluminio: no se cae nada, pero bloquea el calor y la flama.

#2 los tapetes: es como cocinar en un sartén, pero afuera.

#3 la canasta giratoria de acero inoxidable: la flama llega directo a la comida y nada se cae por el asador.

Directo al lavavajillas.

Hasta 42% de descuento + envío gratis a todo México + garantía de por vida.""",
 "El #3 sí le da sabor de verdad","Top 3 para asar comida chica","SHOP_NOW")
C["07"]=("""El verano pasado tiré comida por el asador — como dos mil pesos, calculando de volada.

La mitad de mis verduras y camarones se me caían directo a las brasas, y lo demás se pegaba o se quemaba.

El aluminio y los tapetes no resolvieron nada — nunca esas rayas de asador de verdad.

Con la canasta giratoria nada se cae, y la comida tiene contacto directo con la flama. Nomás le echas, giras, y directo al lavavajillas.

Cómprala una vez y ahorra en cada carne asada. Hasta 42% de descuento + garantía de por vida.""",
 "Deja de tirar dinero al asador","Nada se cae. Nunca más.","SHOP_NOW")
C["08"]=("""Si sazonas tus brochetas, estás tirando tu sazón a la basura.

En cuanto las volteas, la mitad se raspa contra el asador — ese sabor se va a las brasas, no a tu comida.

En la canasta giratoria todo va junto en un solo lugar: sazonas una vez y el sazón se queda en la comida.

Los agujeros son tan chicos que nada se te cae.

Desatornillas el mango en dos segundos — directo al lavavajillas.

Hasta 42% de descuento + envío gratis a todo México + garantía de por vida.""",
 "Una sazonada. Sabor real.","Tu sazón, no las brasas","LEARN_MORE")
C["03"]=("""Quemadas de un lado, crudas del otro. Otra vez.

No es que cocines mal. Es que la parrilla sola pega calor por abajo, y tú te la pasas rezando volteo tras volteo.

La canasta giratoria de GreatGrill da calor parejo desde todos lados. Nada se pega, nada se cae, nada te sale a medias.

Le echas todo, cierras la tapa y la giras en el asador. Se acabó eso de estar picando cada pedazo con las pinzas para adivinar si ya.

Es de acero inoxidable resistente, con cierre seguro que no se abre solo — y se enjuaga en segundos.

4.8 estrellas y más de 240 reseñas ya lo confirmaron.

Hoy con hasta 42% de descuento, envío gratis a todo México y garantía de por vida. Dale clic abajo.""",
 "Calor parejo desde todos lados","Nada crudo. Nada quemado.","SHOP_NOW")
C["10"]=("""Cuando por fin se sienta el que hizo la carne asada para todos, la fiesta ya casi se acabó.

Toda la tarde de pie, volteando cada pieza para que no salga cruda por dentro y quemada por fuera.

Mientras los demás están con la cheve en la mano, tú vigilando el carbón.

La canasta giratoria de GreatGrill gira sola sobre las brasas. Cierras la tapa con el cierre seguro y le das una vuelta cada rato — no se te abre aunque la muevas.

Nada de esas tapas que se zafan a medio asado. Es acero inoxidable, no el clip de plástico que se rompe desde el primer uso.

Por fin te sientas con tu cheve, mientras la carne se cocina pareja por los cuatro lados.

Hasta 42% de descuento, envío gratis a todo México, garantía de por vida y 4.8 estrellas y más de 240 reseñas.""",
 "Por fin te vas a sentar","Gira sola sobre las brasas","SHOP_NOW")
C["11"]=("""El trompo del pastor no se detiene ni un segundo.

Gira contra la lumbre todo el tiempo — por eso el pastor sale dorado parejo, de la primera rebanada a la última.

Con los camarones y las verduras casi siempre hacemos lo contrario: los envolvemos en aluminio y los sellamos. Ahí adentro no hay lumbre, hay vapor.

La cebollita en aluminio con mantequilla sigue igual de rica — a esa no le tocamos nada. Pero el camarón, la calabacita, el elote... esos se merecen la flama directa, no una bolsa de vapor a 100°C.

Y a temperatura alta, con limón o sal, el aluminio puede migrar a la comida. ¿Para qué arriesgarte si hay otra forma?

Por eso hicimos una canasta giratoria de acero inoxidable: mismo principio que el trompo. Le echas todo, cierras la tapa, la giras — y nada se cae por el asador. Al terminar, se enjuaga en segundos.

Hoy con hasta 42% de descuento, envío gratis a todo México y garantía de por vida. 4.8 estrellas y más de 240 reseñas.""",
 "El secreto del trompo, en tu asador","Fuego directo, no vapor","SHOP_NOW")
C["09"]=C["02"]   # ad 9 ar samma fru/present-vinkel som koncept 2 - egen copy skrivs nar den ska skalas
C["B"] =("""Cierre seguro, acero inoxidable y gira 360° — nada se te cae por el asador.

Le echas todo, cierras la tapa, la giras. Rayas de asador de verdad, sin aluminio y sin tapetes que bloqueen el fuego.

Mango desmontable, malla fina, se enjuaga en un minuto — o directo al lavavajillas.

Sirve para gas, carbón o pellets. Garantía de por vida.

Hasta 42% de descuento + envío gratis a todo México. 4.8 estrellas y más de 240 reseñas.""",
 "Gira 360°. Nada se cae.","Envío gratis a México","SHOP_NOW")

# ------------------------------------------- ett adset per annons (koncept)
# adsetnamn -> (copy-nyckel, listicle-nr, [(mediafil, basnamn pa annonsen)])
PLAN=[
 ("GG - 01 foilstop","01",8,[("1 HOOK A.mp4","GG_01_H1_pain_ugc_foilstop"),
                             ("1 HOOK B.mp4","GG_01_H2_pain_ugc_vaporadentro"),
                             ("1 HOOK C.mp4","GG_01_H3_pain_ugc_cebollita")]),
 ("GG - 02 familia","02",8,[("2 HOOK A.mp4","GG_02_H1_pain_ugc_familia"),
                            ("2 HOOK B.mp4","GG_02_H2_pain_ugc_alvapor"),
                            ("2 HOOK C.mp4","GG_02_H3_pain_ugc_esposa")]),
 ("GG - 03 crudoquemado","03",11,[("3 clin_greatgrill_curiosity_ugc_crudoquemado_v1.mov","GG_03_H1_curiosity_ugc_crudoquemado"),
                                   ("3 clin_greatgrill_curiosity_ugc_otravez_v1.mov","GG_03_H2_curiosity_ugc_otravez"),
                                   ("3 clin_greatgrill_curiosity_ugc_orgullo_v1.mov","GG_03_H3_curiosity_ugc_orgullo")]),
 ("GG - 04 plancha","04",22,[("4 H1.mp4","GG_04_H1_pain_comparison_plancha"),
                             ("4 H2.mp4","GG_04_H2_pain_comparison_tallar"),
                             ("4 H3.mp4","GG_04_H3_pain_comparison_humopagado")]),
 ("GG - 05 quickrec","05",1,[("clin_greatgrill_benefit_ugc_quickrec_v1.mov","GG_05_H1_benefit_ugc_quickrec"),
                             ("clin_greatgrill_benefit_ugc_pov_v1.mov","GG_05_H2_benefit_ugc_pov"),
                             ("clin_greatgrill_offer_ugc_oferta_v1.mov","GG_05_H3_offer_ugc_oferta")]),
 ("GG - 06 top3","06",8,[("Ad 6 H1 v2.mp4","GG_06_H1_curiosity_comparison_top3"),
                         ("Ad 6 H2 v2.mp4","GG_06_H2_curiosity_comparison_dosdetres"),
                         ("Ad 6 H3 v2.mp4","GG_06_H3_fomo_comparison_antesdecomprar")]),
 ("GG - 07 dinero","07",11,[("7 H1.mp4","GG_07_H1_pain_ugc_dinero"),
                            ("7 H2.mp4","GG_07_H2_pain_ugc_diezpesos"),
                            ("7 H3.mp4","GG_07_H3_pain_ugc_asadorcome")]),
 ("GG - 08 sazon","08",13,[("8 HOOK A.mp4","GG_08_H1_curiosity_ugc_sazon"),
                           ("8 HOOK B.mp4","GG_08_H2_curiosity_ugc_miraparrilla"),
                           ("8 HOOK C.mp4","GG_08_H3_curiosity_ugc_fuegosabor")]),
 ("GG - 09 esposa","09",8,[("9.mp4","GG_09_H1_social_ugc_esposa")]),
 ("GG - 10 porfinsesienta","10",11,[("clin_greatgrill_identity_ugc_porfinsesienta_v1.mov","GG_10_H1_identity_ugc_porfinsesienta")]),
 ("GG - 11 trompo","11",8,[("clin_greatgrill_curiosity_ugc_trompo_v1.mov","GG_11_H1_curiosity_ugc_trompo")]),
]
# bildannonserna: egen listicle per bild enligt testmatris.md
STATICS=[("clin_greatgrill_pain_beforeafter_crudoquemado_v1.png","GG_B1_pain_beforeafter_crudoquemado",11),
         ("clin_greatgrill_benefit_collage_features_v1.png","GG_B2_benefit_collage_features",1),
         ("clin_greatgrill_identity_lifestyle_3idiomas_v1.png","GG_B3_identity_lifestyle_3idiomas",11),
         ("clin_greatgrill_benefit_product_medidas_v1.png","GG_B4_benefit_product_medidas",1),
         ("clin_greatgrill_offer_comparison_nogira_v1.png","GG_B5_offer_comparison_nogira",1),
         ("clin_greatgrill_social_ugc_esposo_v1.png","GG_B6_social_ugc_esposo",8)]

# -------------------------------------------------- 0. spara befintliga creatives
if not S["creatives"]:
    print("0) Sparar befintliga creatives (annonsnamn + destination -> creative-id)")
    for a in call(f"{CAMP}/adsets", {"fields":"id,name","limit":"30"}, "GET")["data"]:
        for ad in call(f"{a['id']}/ads", {"fields":"name,creative{id,object_story_spec}","limit":"15"}, "GET")["data"]:
            s=ad["creative"]["object_story_spec"]
            inner=s.get("video_data") or s.get("link_data")
            dest=inner["call_to_action"]["value"]["link"].split("?")[0]
            S["creatives"][f"{ad['name']}|{dest}"]=ad["creative"]["id"]
    save(); print(f"   {len(S['creatives'])} creatives sparade\n")

print("\n2) Laser mediabiblioteket")
VIDEO={}
for v in call(f"{ACT}/advideos", {"fields":"id,title","limit":"200"}, "GET")["data"]:
    VIDEO.setdefault(v.get("title",""), v["id"])
IMAGE={}
for i in call(f"{ACT}/adimages", {"fields":"hash,name","limit":"200"}, "GET")["data"]:
    n=i.get("name") or ""
    if n and n != "untitled":
        IMAGE[n]=i["hash"]
        IMAGE[n.split(".png")[0]+".png"]=i["hash"]   # Meta lagger pa "_105" efter filandelsen
THUMB={}
def thumb(vid):
    if vid not in THUMB:
        for _ in range(12):
            d=call(f"{vid}/thumbnails", {"fields":"uri,is_preferred"}, "GET").get("data",[])
            if d: THUMB[vid]=next((t["uri"] for t in d if t.get("is_preferred")), d[0]["uri"]); break
            time.sleep(5)
    return THUMB[vid]

DOF=json.dumps({"creative_features_spec":{k:{"enroll_status":"OPT_OUT"} for k in [
 "image_touchups","video_auto_crop","image_auto_crop","text_optimizations","text_generation",
 "image_enhancement","adapt_to_placement","add_text_overlay","media_type_automation",
 "image_templates","video_highlight","music_generation","translate_voiceover","text_translation",
 "enhance_cta","description_automation","dynamic_cta_text","image_animation","video_to_image"]}})

def creative(adname, media, dest, copy):
    key=f"{adname}|{dest}"
    if key in S["creatives"]: return S["creatives"][key], "aterbrukad"
    msg,title,desc,cta=copy
    cta_obj={"type":cta,"value":{"link":dest+UTM}}
    if media.endswith(".png"):
        spec={"page_id":PAGE,"link_data":{"image_hash":IMAGE[media],"link":dest+UTM,
              "message":msg,"name":title,"description":desc,"call_to_action":cta_obj}}
    else:
        vid=VIDEO[media]
        spec={"page_id":PAGE,"video_data":{"video_id":vid,"message":msg,"title":title,
              "link_description":desc,"call_to_action":cta_obj,"image_url":thumb(vid)}}
    r=call(f"{ACT}/adcreatives", {"name":adname,"object_story_spec":json.dumps(spec),
                                  "degrees_of_freedom_spec":DOF})
    S["creatives"][key]=r["id"]; save()
    return r["id"], "ny"

TARGETING=json.dumps({"geo_locations":{"countries":["MX"]},"age_min":25,"age_max":65,
                      "targeting_automation":{"advantage_audience":1}})

def make_adset(name):
    if name in S["adsets"]: return S["adsets"][name]
    r=call(f"{ACT}/adsets", {"name":name,"campaign_id":CAMP,"billing_event":"IMPRESSIONS",
        "optimization_goal":"OFFSITE_CONVERSIONS",
        "promoted_object":json.dumps({"pixel_id":PIXEL,"custom_event_type":"PURCHASE"}),
        "targeting":TARGETING,
        "attribution_spec":json.dumps([{"event_type":"CLICK_THROUGH","window_days":7},
                                       {"event_type":"VIEW_THROUGH","window_days":1}]),
        "status":"ACTIVE"})
    S["adsets"][name]=r["id"]; save(); return r["id"]

def make_ad(adset_id, adname, media, dest, copy):
    if adname in S["ads"]: return
    cid,how=creative(adname, media, dest, copy)
    ad=call(f"{ACT}/ads", {"name":adname,"adset_id":adset_id,
                           "creative":json.dumps({"creative_id":cid}),"status":"ACTIVE"})
    S["ads"][adname]=ad["id"]; save()
    print(f"      + {adname:52} ({how})")

print("\n3) Bygger ett adset per annons - bada destinationerna inuti\n")
for aname, ckey, lst, items in PLAN:
    aid=make_adset(aname)
    print(f"   {aname}   (produktsidan + /pages/{lst})")
    for media, base in items:
        make_ad(aid, f"{base}_PROD",       media, PDP,      C[ckey])
        make_ad(aid, f"{base}_LIST{lst}",  media, LST[lst], C[ckey])

aid=make_adset("GG - BILDANNONSER")
print("   GG - BILDANNONSER   (produktsidan + egen listicle per bild)")
for media, base, lst in STATICS:
    make_ad(aid, f"{base}_PROD",      media, PDP,      C["B"])
    make_ad(aid, f"{base}_LIST{lst}", media, LST[lst], C["B"])

print(f"\nKLART: {len(S['ads'])} annonser i {len(S['adsets'])} adsets. Kampanjen ar fortfarande PAUSED.")
