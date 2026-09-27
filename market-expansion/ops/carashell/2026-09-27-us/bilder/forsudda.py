#!/usr/bin/env python3
"""forsudda.py — (utvidga per ruta sedan 2026-09-21: en 77 px FET rubrik direkt på ett
foto lämnar en antialias-gloria som tre utvidgningar inte når — mätt 2,5 % av rutan över
tröskeln på BOF_108_1. Sätt "utvidga": 6 på såna rutor i overrides.json.
troskel per ruta sedan samma dag: glorian runt BOF_108:s rubrik låg till 13 % i intervallet
30–60 och rördes aldrig av standardtröskeln 60 — "troskel": 25 tar den, mätt.)
 suddar den svenska texten i overrides-rutorna INNAN oversatt-batch.py körs.
rita_box i oversatt-bild.py suddar bara pixlar med RGB-summa < 500 (mörk text) — de ljusgrå
antialias-kanterna runt en 76 px rubrik blir kvar som ett spöke (mätt 2026-09-18 på GT_106_1,
CO_102_1). Här: mask = pixlar som avviker ≥ 60 från radens plattfärg åt textens håll (ingen
övre gräns), utvidgad 3 px, fylld med radens median av omaskade pixlar. Rutor med 'fyll'
(fraktraden) rörs inte — plattan täcker ändå. Skriver över bilder/se/<n>.jpg (originalen
ligger kvar i se/<n>/).
    python3 forsudda.py
"""
import json, os, numpy as np
from PIL import Image
HÄR=os.path.dirname(os.path.abspath(__file__))
o=json.load(open(os.path.join(HÄR,'overrides.json'),encoding='utf-8'))
def sudda(arr,box,ljus,utvidga=3,troskel=60):
    x0,y0,x1,y1=[int(v) for v in box]; b=arr[y0:y1,x0:x1]
    rm=np.percentile(b,80 if ljus else 20,axis=1); s=b.sum(axis=2); d=s-rm.sum(axis=1)[:,None]
    t=(d<-troskel) if ljus else (d>troskel)
    for _ in range(utvidga):
        t2=t.copy(); t2[1:]|=t[:-1]; t2[:-1]|=t[1:]; t2[:,1:]|=t[:,:-1]; t2[:,:-1]|=t[:,1:]; t=t2
    for y in range(b.shape[0]):
        m=t[y]
        if not m.any(): continue
        rena=b[y][~m]; b[y][m]=(np.median(rena,axis=0) if len(rena)>=8 else np.median(b.reshape(-1,3),axis=0)).astype(b.dtype)
    arr[y0:y1,x0:x1]=b
for namn,v in o.items():
    if namn.startswith('_'): continue
    f=os.path.join(HÄR,'se',namn+'.jpg'); arr=np.asarray(Image.open(f).convert('RGB')).astype(int).copy()
    n=0
    for k,boxar in v['box_for_form'].items():
        for bx in boxar:
            if bx.get('fyll'): continue
            ljus=tuple(bx.get('farg',[0,0,0]))!=(255,255,255)   # mörk text ⇒ ljus platta
            sudda(arr,bx['box'],ljus,int(bx.get('utvidga',3)),int(bx.get('troskel',60))); n+=1
    Image.fromarray(arr.astype(np.uint8)).save(f,quality=95); print(namn,n,'rutor försuddade')
