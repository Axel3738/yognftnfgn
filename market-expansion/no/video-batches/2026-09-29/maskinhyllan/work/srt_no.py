import re,glob,os
CS_BODY7=["Vegghengt verktøyhylle.","Plass til fire elektroverktøy, pluss batterier og tilbehør.","Akkurat nå tjuetre prosent rabatt.","Men bare i dag. Frakten er gratis.","Ikke gå glipp av sjansen, bestill før tilbudet er over.","Trykk på knappen under."]
CS_BODY8=["Vegghengt verktøyhylle.","Plass til fire elektroverktøy, pluss batterier og tilbehør.","Akkurat nå tjuetre prosent rabatt, men bare i dag.","Og frakten er gratis.","Ikke gå glipp av sjansen.","Bestill før tilbudet er over.","Trykk på knappen under."]
CS_BODY8_H3=["Vegghengt verktøyhylle.","Plass til fire elektroverktøy, pluss batterier og tilbehør.","Akkurat nå tjuetre prosent rabatt.","Men bare i dag. Frakten er gratis.","Ikke gå glipp av sjansen.","Bestill før tilbudet er over.","Trykk på knappen under."]
GT_BODY=["Har han allerede alt?","Han har ikke denne.","En verktøyhylle til elektroverktøyene hans.","Plass til fire, pluss batterier og tilbehør.","Se for deg ansiktet hans når han åpner pakken.","Ikke et slips, ikke sokker.","Noe han faktisk vil ha.","Noe han kommer til å bruke hver helg i garasjen.","Den perfekte gaven til pappa, mannen eller verkstedentusiasten i livet ditt.","Trykk på knappen under."]
PD_BODY=["Lei av å lete etter drillen?","Denne hyllen løser det.","Fire plasser til elektroverktøyene dine, pluss hylle til batterier og tilbehør.","Skru den fast på veggen, heng opp verktøyet.","Ferdig!","Ikke mer rot på benken, ikke mer leting på gulvet.","Alt du trenger på ett og samme sted.","Vegghengt verktøyhylle med plass til fire."]
SP_BODY=["Jeg hadde fire elektroverktøy og null orden.","Drillen på gulvet, skrutrekkeren på benken, laderen et sted.","Så skaffet jeg denne verktøyhyllen.","Nå henger alt på veggen.","Hvert verktøy har sin egen plass.","Jeg finner det jeg trenger med en gang.","Og benken, den er faktisk ledig igjen.","Beste pengene jeg har brukt på garasjen i år."]
MANUS={
 'CS_1_H1':["I dag: stor rabatt på verktøyhyllen."]+CS_BODY7,
 'CS_1_H2':["Rabatten gjelder bare i dag."]+CS_BODY8,
 'CS_1_H3':["Siste sjanse til å få denne til redusert pris."]+CS_BODY8_H3,
 'GT_1_H1':["Vet du ikke hva du skal gi ham i år?"]+GT_BODY,
 'GT_1_H2':["Denne julegaven får ham til å smile hele julaften."]+GT_BODY,
 'GT_1_H3':["Endelig en gave han faktisk kommer til å bruke."]+GT_BODY,
 'PD_1_H1':["Ligger elektroverktøyene dine og slenger overalt i garasjen?"]+PD_BODY,
 'PD_1_H2':["Slik får du orden på alle elektroverktøyene dine."]+PD_BODY,
 'PD_1_H3':["Fire elektroverktøy, ett stativ, null kaos."]+PD_BODY,
 'SP_1_H1':["Jeg angrer på at jeg ikke kjøpte denne før."]+SP_BODY,
 'SP_1_H2':["Garasjen min har aldri sett så bra ut."]+SP_BODY,
 'SP_1_H3':["Denne lille greia forandret hele verkstedet mitt."]+SP_BODY,
}
tot=0
for k,rader in MANUS.items():
    sv=open(f'srt-sv/Maskinhylla_{k}.srt').read().strip().split('\n\n')
    assert len(sv)==len(rader),(k,len(sv),len(rader))
    out=[]
    for b,r in zip(sv,rader):
        l=b.split('\n'); out.append(f"{l[0]}\n{l[1]}\n{r}\n")
    open(f'srt-no/Maskinhylla_{k}.srt','w').write('\n'.join(out))
    n=sum(len(r) for r in rader); tot+=n; print(k,len(rader),n)
print('totalt tecken',tot)
