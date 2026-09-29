# Norska repliker cue för cue (samma antal cues som srt-sv/). Priser ur beverbutikken.no 2026-09-29: 519 / 679 kr.
CS_BODY=["Rulleknivsliperen i tre, nå til kraftig nedsatt pris.",
 "Fra seks hundre og syttini til bare fem hundre og nitten kroner.",
 "Og frakten er gratis.",
 "Fast tjue graders vinkel, magnetisk blokk, to diamantskiver,",
 "skarpe kniver uten at du trenger å gjette vinkelen.",
 "Trykk på knappen under.",
 "Den kommer i svart eske med bruksanvisning."]
GT_BODY=["Du har prøvd å gi ham slipesteiner før.",
 "De ligger fortsatt i skapet, ubrukte, for kronglete.",
 "Denne gangen gir du ham noe annet.",
 "Rulleknivsliperen i tre, fin nok til å stå fremme,",
 "enkel nok til at den faktisk blir brukt.",
 "Ingen teknikk å lære, bare rull, og kniven blir skarp.",
 "Se for deg ansiktet hans når han åpner den svarte esken, og stoltheten din når han bruker gaven hver uke.",
 "Det er ikke bare en knivsliper, det er beviset på at du kjenner ham."]
PD_BODY=["Du har sikkert prøvd å slipe kniven på en slipestein.",
 "Hånden skjelver, vinkelen endrer seg.",
 "Resultatet blir aldri det samme.",
 "Med rulleknivsliperen i tre slipper du å gjette.",
 "Blokken holder kniven magnetisk på plass i tjue graders vinkel.",
 "Så ruller du trerullen frem og tilbake langs eggen.",
 "Lett trykk, jevn bevegelse.",
 "Ingen ferdigheter kreves.",
 "Etter noen drag har du en kniv som skjærer igjen, og den ser like bra ut på benken som den fungerer.",
 "Rulleknivsliperen i tre.",
 "Skarpe kniver hver gang."]
SP_MID=["Jeg trodde det var for godt til å være sant.",
 "En trerull som sliper kniven uten at jeg trenger å kunne noe.",
 "Så jeg testet den på den sløveste kniven jeg har.",
 "Tjue graders vinkel, hver gang.",
 "Så enkelt.",
 "Skulle ønske jeg hadde kjøpt den før.",
 "Rulleknivsliperen i tre, med to diamantskiver på rullen."]
SP_END_A=["Ingen slipestein, ingen øvelse.","Bare en fast tjue graders vinkel som gjør jobben for deg.","Se selv hvor lett det går, trykk på knappen under."]
SP_END_B=["Ingen slipestein, ingen øvelse,","bare en fast tjue graders vinkel som gjør jobben for deg.","Se selv hvor lett det går, trykk på knappen under."]
GT_KNIV=["Du vet hvordan det er.","Han elsker å lage mat, men knivene hans, aldri helt skarpe."]
MANUS={
 'CS_1_H1':["Sjekk prisen på denne før du scroller videre."]+CS_BODY,
 'CS_1_H2':["Fem hundre og nitten kroner.","Se hva du får."]+CS_BODY,
 'CS_1_H3':["Denne knivsliperen er satt kraftig ned i pris."]+CS_BODY,
 'GT_1_H1':["Leter du etter gaven han faktisk kommer til å bruke?"]+GT_KNIV+GT_BODY,
 'GT_1_H2':["Dette er gaven som får ham til å si wow,","hvordan visste du dette?"]+GT_KNIV+GT_BODY,
 'GT_1_H3':["Lei av å gi gaver som havner i en skuff?","Du vet hvordan det er.","Han elsker å lage mat, men knivene hans?","Aldri helt skarpe."]+GT_BODY,
 'PD_1_H1':["Slik sliper du kniven uten å kunne noe som helst."]+PD_BODY,
 'PD_1_H2':["Slutt å gjette vinkelen hver gang du sliper kniven."]+PD_BODY,
 'PD_1_H3':["Dette er grunnen til at knivene dine aldri blir helt skarpe."]+PD_BODY,
 'SP_1_H1':["Jeg måtte teste denne knivsliperen selv."]+SP_MID+SP_END_A,
 'SP_1_H2':["Jeg var skeptisk.","Så jeg prøvde den selv."]+SP_MID+SP_END_B,
 'SP_1_H3':["Jeg byttet ut slipesteinen min med denne."]+SP_MID+SP_END_B,
}
import re
SV=re.compile(r"[äöÄÖ]|\b(och|inte|jag|också|bara att|sen|vassa|knivar|kronor|idag|imorgon|Sverige|svensk\w*|Bäver\w*|lagret|slutsåld|midnatt|mycket|någon\w*|något|slipsten\b|trä\b)\b",re.I)
SEK=re.compile(r"\b(579|759|SEK)\b|\d")
tot=0;fel=0
for k,rader in MANUS.items():
    sv=open(f'srt-sv/Rullknivslipen_{k}.srt').read().strip().split('\n\n')
    assert len(sv)==len(rader),(k,len(sv),len(rader))
    out=[]
    for b,r in zip(sv,rader):
        for m in (SV.search(r),SEK.search(r)):
            if m: print('GRIND',k,repr(m.group()),r); fel+=1
        l=b.split('\n'); out.append(f"{l[0]}\n{l[1]}\n{r}\n")
    open(f'srt-no/Rullknivslipen_{k}.srt','w').write('\n'.join(out))
    n=sum(len(r) for r in rader); tot+=n; print(k,len(rader),n)
uniq=set(r for v in MANUS.values() for r in v)
print('totalt tecken',tot,'unika',sum(len(r) for r in uniq),'grindfel',fel)
