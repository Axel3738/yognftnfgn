import json,os
Q={q["name"]:q for q in json.load(open("quotes.json"))}
M={
 "Uteduschen – Bärbar Campingdusch USB":"Uteduschen – Bärbar Campingdusch med USB-laddning",
 "Golfskoväska – Nylon med Dragkedja":"Golfskoväska – Nylon med Dragkedja",
 "Magnetfiskesats 320lb – med 10m Rep":"Magnetfiskesats 320lb – Neodymmagnet med 10m Rep",
 "Golfbollsplockare 80 cm – med Bärväska":"Golfbollsplockare 80 cm – med Bärväska",
 "Tofflor Ergonomiska – Tjocksulade":"Tofflor Ergonomiska – Tjocksulade för Inne & Ute",
 "Fritidsskor Herr – Låga & Lätta":"Fritidsskor Herr – Låga & Lätta med Halkfri Sula",
 "Mobilskal Magnetiskt – iPhone 12–17":"Mobilskal Magnetiskt med Ställ – iPhone 12–17",
 "Surfplatteställ – Roterande & Justerbart":"Surfplatteställ – Roterande & Justerbart",
 "14-i-1 Multiverktygshammare":"14-i-1 Multiverktygshammare – Camping & Nödläge",
 "Gräsklippartäcke 600D Oxford":"Gräsklippartäcke 600D Oxford – med Dragsko",
 "Fiskespöhållare för Båt – 2-pack":"Fiskespöhållare för Båt – 2-pack i Kraftig Nylon",
 "Skoreparationslappar – Lagar Hälslitage & Mesh":"Skoreparationslappar – Lagar Hälslitage & Mesh",
 "Övervakningskamera Trådlös – Dubbellins PTZ med AI-Spårning":"Övervakningskamera Trådlös – Dubbellins PTZ med AI-Spårning",
 "Första Hjälpen-Kit 260 Delar – Hem, Bil & Camping":"Första Hjälpen-Kit 260 Delar – Hem, Bil & Camping",
 "Stänkskärm MTB – Lätt i Kolfiberlook":"Stänkskärm MTB – Lätt i Kolfiberlook",
 "Boxboll med Pannband – Reflex- & Speedträning":"Bollpannband – Kvällens Roligaste Duell",
 "Bordtennistränare – Pingis Utan Bord":"Bordtennisnät Infällbart – 2 Rack & 6 Bollar",
 "Sneakers Herr – Lätta med EVA-Dämpning":"Sneakers Herr – Lätta med EVA-Dämpning",
 "Linupprullare Aluminium – Snabbt Linbyte på Rullen":"Linupprullare Aluminium – Snabbt Linbyte på Rullen",
 "Mini Fiskespö Set – Teleskopiskt & Dubbelsidigt":"Mini Fiskespö Set – Teleskopiskt & Dubbelsidigt",
 "Vandringssneakers Herr – Sköna för Stig & Stad":"Vandringskängor Herr – Grepp & Stöd på Stigen",
 "Hopfällbar Såg – Industriell med Halkfritt Grepp":"Hopfällbar Såg – Industriell med Halkfritt Grepp",
 "Cykelshorts Herr – Vadderade med Kompression":"Cykelshorts Herr – Vadderade med Kompression",
 "Vandringskängor Herr – Lätta med Tjock Sula":"Vandringskängor Herr – Lätta med Tjock Sula",
 "Bälteslipmaskin Mini 3-i-1 – Knivslip & Polerare":"Bälteslipmaskin Mini 3-i-1 – Knivslip & Polerare",
 "motorcycle cover":"MC-Kapell 218×118 cm – Regn, Damm & UV",
 "Dörrbottensäkringsremsor för Ljudisolering":"Dörrbottenlist – Tätar mot Ljud, Drag & Damm",
 "Anti freeze cover for water tap":"Kranskydd Frost 420D – Skyddar Utekranen i Vinter",
 "Warm slipper inside":"Plyschtofflor Herr – Varma med TPR-Sula för Inne & Ute",
 "Gravstenspenna/ Gravestone pen":"Gravstenspenna – Återställer Blekt Text på Sten",
 "Funny swim shorts":"Badshorts med Skämttryck – Rumpan Bak",
 "Water tank cover":"IBC-tanköverdrag 1000 L – Stoppar Alger & UV",
 "Big football":"Jättefotboll 60 cm – Uppblåsbar för Trädgård & Pool",
 "benskydd vandring":"Damasker Vandring – Håller Snö, Väta & Grus Ute",
 "kamoflauge tejp":"Kamouflagetejp 3-pack – Självhäftande Väv 5 × 450 cm",
 "Work light for Makita battery (no battery included)":"Arbetslampa för Makita-batteri – 15 LED med USB-uttag",
 "Two-tier dish rack":"Diskställ i Två Våningar – Hela Diskens Torkyta på 42 cm",
 "Countertop shelf with pull-out basket":"Bänkhylla med Utdragbar Korg – Dubbel Yta på Samma Bänk",
 "Wooden noughts & crosses game":"Luffarschack i Trä – Klassikern som Ligger Framme",
 "Ice cream pints with lids, 2-pack":"Glasspints med Lock 2-pack – Gör Glassen Direkt i Burken",
 "Toss & catch basket game set":"Kasta & Fånga-set – 4 Korgar och Bollar på Lina",
 "Motocentric motorcycle tail bag 37 L":"Motocentric Bakväska 37 L – Hjälmen Går i Väskan",
 "Sewing kit 104 pcs":"Sömnadskit 104 Delar – Allt i Ett Fodral",
 "Pocket pill box, 7 compartments":"Medicinask i Fickformat – 7 Fack med Tätslutande Lock",
 "Weekly pill organizer, 21 compartments":"Veckodosett 21 Fack – Morgon, Middag och Kväll i Sju Dagar",
 "3D moving sandscape 20 cm":"3D-sandbild 20 cm – Nytt Landskap Varje Gång Du Vänder Den",
 "Pet brush kit for Dyson vacuums":"Pälsborste till Dyson-dammsugare – Borsta och Sug i Samma Drag",
 "Turbo jet fan for Makita battery (no battery included)":"Jetfläkt för Makita-batteri – Blås Rent utan Sladd",
 "Magnetic side shelf for washer/fridge":"Magnethylla för Tvättmaskin och Kylskåp – Förvaring Utan Borr",
 "fiskespöhållare 4 pack":"Fiskespöhållare 4-Pack – Kraftig Förvaring",
}
special={"Magnetic tiles building set 46/60 pcs":("Magnetplattor i Storformat – Byggset i Låda med Handtag",[0,1])}
K={k:json.load(open(f"katalog-{k}.json"))["products"] for k in ["se","no","fi","uk","dk"]}
se_by_title={p["title"]:p for p in K["se"]}
for n,t in M.items(): assert n in Q, n; assert t in se_by_title, t
def imgkeys(p): return set(os.path.basename(i["src"]).split("?")[0] for i in p.get("images",[]))
se_img={}
for p in K["se"]:
    for k in imgkeys(p): se_img.setdefault(k,set()).add(p["title"])
X={}
for st in ["no","fi","uk","dk"]:
    for p in K[st]:
        m=set()
        for i in imgkeys(p): m|=se_img.get(i,set())
        if len(m)==1: X.setdefault(m.pop(),{})[st]=p
rates={"se":9.5118,"no":9.3271,"fi":0.8617,"dk":6.442,"uk":0.73768}
cur={"se":"SEK","no":"NOK","fi":"EUR","dk":"DKK","uk":"GBP"}
files={st:[] for st in rates}; saknas={st:[] for st in rates}
def cell(qs,fx): return "|".join(f"{q*fx:.2f}" for q in qs if q)
for n,t in M.items():
    q=Q[n]
    for st in rates:
        if st not in q:
            if st!="se": saknas[st].append(t)
            continue
        if st=="se": title=t
        else:
            p=X.get(t,{}).get(st)
            if not p: saknas[st].append(t+" (ingen bildmatch)"); continue
            title=p["title"]
        files[st].append(f"{title};;{cell(q[st],rates[st])}")
n,(t,idx)=list(special.items())[0]; q=Q[n]
for st in rates:
    if st not in q: continue
    p=se_by_title[t] if st=="se" else X.get(t,{}).get(st)
    if not p: continue
    for k,i in enumerate(idx):
        files[st].append(f"{p['title']};{p['variants'][i]['title']};{q[st][k]*rates[st]:.2f}")
for st,fn in [("se","sverige"),("no","norge"),("fi","finland"),("dk","danmark"),("uk","uk")]:
    for l in open(f"cogs-motorholjen-{fn}.csv",encoding="utf-8").read().splitlines():
        if l and not l.lstrip("﻿").startswith("#"): files[st].append(l)
    L=["﻿# Inköpspriser — produkttitel;varianttitel;kostnad",
       f"# Alla leverantörsofferter (aug–sep 2026), vara + frakt exkl. moms, USD x {rates[st]} = {cur[st]}.",
       "# Kostnad = totalpris för 1|2|3 st i samma orderrad. Tom variant = alla varianter."]+files[st]
    open(f"cogs-flerpack-{fn}.csv","w",encoding="utf-8").write("\n".join(L)+"\n")
    print(st, len(files[st]), "rader; utan offert för butiken:", len(saknas[st]))
json.dump(saknas,open("saknas-offert.json","w"),ensure_ascii=False,indent=1)
print(open("cogs-flerpack-norge.csv",encoding="utf-8").read())
