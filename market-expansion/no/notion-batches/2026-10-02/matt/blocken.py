#!/usr/bin/env python3
"""Skriver matt/blocken.json: varje textrad i de 16 FD_4-bilderna, uppmätt.

Alla sexton bilderna delar EN mall (Fars dag-rea): röd badge uppe till vänster,
rubrik i 2-3 rader, en underrad, prisraden och en bottenrad. Raderna står
DIREKT på sidan, inte i en platta, så `oversatt-bild.py --analys` hittar bara
badgen — exakt samma fälla som 2026-10-01. Rutorna nedan är därför lästa ur
bilderna med matt/radmatning.py, en rad i taget.

⚠️ Mätningen ger också fotots egna rader (y 476..1031 i de flesta bilderna).
De är INTE text och står inte här. Urvalet gjordes mot bilderna, inte mot en
y-regel: rubrikfältet är 150..480, underraden ligger strax under sista
rubrikraden, prisraden 1067..1163 och bottenraden 1224..1246.

  python3 market-expansion/no/notion-batches/2026-10-02/matt/blocken.py
"""
import json
import os

B = os.path.dirname(os.path.abspath(__file__))

BADGE_INK = [46, 74, 66, 243]          # "Fars dag-rea", samma i alla sexton

# namn → [(svensk text, [y0, y1, x0, x1], roll), ...]
BILDER = {
    "Takoverdrag_FD_4_1": [
        ("Mät vagnen.", [167, 236, 320, 760], "rubrik"),
        ("Ta storleken minst lika", [285, 342, 123, 957], "rubrik"),
        ("lång.", [398, 478, 454, 625], "rubrik"),
        ("Nio längder, 5,5 till 13,5 meter. Alla 3 meter breda.", [539, 568, 187, 891], "under"),
        ("Från 1 129 kr, ord. 1 469 kr", [1092, 1163, 80, 1003], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Takoverdrag_FD_4_2": [
        ("Från 1 129 kr. Ord. 1 469", [156, 221, 96, 985], "rubrik"),
        ("kr.", [285, 341, 499, 579], "rubrik"),
        ("Fars dag-rea: taket täckt, dörr och fönster fria.", [418, 447, 217, 862], "under"),
        ("Från 1 129 kr, ord. 1 469 kr", [1092, 1163, 80, 1003], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Takoverdrag_FD_4_3": [
        ("Beställ senast 19", [164, 221, 229, 854], "rubrik"),
        ("oktober: taköverdrag till", [285, 357, 97, 980], "rubrik"),
        ("fars dag.", [406, 478, 378, 696], "rubrik"),
        ("Bara taket täcks, så han får på det själv.", [535, 568, 259, 820], "under"),
        ("Från 1 129 kr, ord. 1 469 kr", [1092, 1163, 80, 1003], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Takoverdrag_FD_4_4": [
        ("Remmar på alla fyra", [156, 236, 174, 910], "rubrik"),
        ("sidor.", [285, 342, 439, 638], "rubrik"),
        ("Spänne, krok.", [406, 478, 286, 790], "rubrik"),
        ("Kroka under karossens nederkant, dra åt. Bara taket, en person.",
         [535, 566, 86, 993], "under"),
        ("Från 1 129 kr, ord. 1 469 kr", [1092, 1163, 80, 1003], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Sotarset_FD_4_1": [
        ("Rensa själv mellan", [164, 236, 196, 883], "rubrik"),
        ("sotarens besök", [285, 342, 257, 825], "rubrik"),
        ("Stängerna böjer med i kröken i stället för att ta stopp.",
         [418, 447, 166, 912], "under"),
        ("459 kr, ord. 599 kr", [1067, 1151, 135, 943], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Sotarset_FD_4_2": [
        ("459 kr till fars dag. Ord.", [164, 236, 108, 968], "rubrik"),
        ("599 kr.", [285, 342, 421, 656], "rubrik"),
        ("Sotarset med 9 böjliga stänger och nylonborste på 100 mm.",
         [414, 447, 118, 960], "under"),
        ("459 kr, ord. 599 kr", [1067, 1151, 135, 943], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Sotarset_FD_4_3": [
        ("Beställ senast 19", [164, 221, 229, 854], "rubrik"),
        ("oktober: sotarset till fars", [285, 342, 86, 993], "rubrik"),
        ("dag.", [406, 478, 463, 615], "rubrik"),
        ("Sotarset med 9 böjliga stänger som når bakom kaminen.",
         [535, 568, 140, 937], "under"),
        ("459 kr, ord. 599 kr", [1067, 1151, 135, 943], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Sotarset_FD_4_4": [
        ("9 stänger à 41 cm.", [163, 236, 204, 873], "rubrik"),
        ("3,69 meter.", [287, 353, 340, 736], "rubrik"),
        ("Nylonborste på 100 mm. Sexkantsadapter medföljer.",
         [414, 447, 169, 908], "under"),
        ("459 kr, ord. 599 kr", [1067, 1151, 135, 943], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Golfkalender_FD_4_1": [
        ("Luckorna är fyllda med", [164, 236, 118, 961], "rubrik"),
        ("golfbollar och peggar", [285, 357, 144, 936], "rubrik"),
        ("Peggar i plast och trä. Han öppnar en lucka om dagen.",
         [418, 447, 154, 924], "under"),
        ("549 kr, ord. 719 kr", [1067, 1151, 137, 943], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 719], "botten"),
    ],
    "Golfkalender_FD_4_2": [
        ("549 kr till fars dag. Ord.", [164, 236, 109, 968], "rubrik"),
        ("719 kr.", [285, 342, 422, 656], "rubrik"),
        ("24 luckor, färdigfyllda. Ett paket att slå in.",
         [414, 447, 250, 827], "under"),
        ("549 kr, ord. 719 kr", [1067, 1151, 137, 943], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Golfkalender_FD_4_3": [
        ("Beställ senast 19", [164, 221, 229, 854], "rubrik"),
        ("oktober, golfkalender till", [285, 357, 92, 985], "rubrik"),
        ("fars dag", [406, 478, 389, 686], "rubrik"),
        ("Ett paket att slå in, går att skicka direkt som present.",
         [535, 568, 171, 907], "under"),
        ("549 kr, ord. 719 kr", [1067, 1151, 137, 943], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Golfkalender_FD_4_4": [
        ("Golfhandduk,", [164, 232, 292, 786], "rubrik"),
        ("klubbrengöringsborste,", [285, 357, 107, 972], "rubrik"),
        ("greenlagare med spegel", [406, 478, 97, 981], "rubrik"),
        ("Plus bollmarkeringar. 24 luckor, färdigfyllda, inget att fylla i.",
         [539, 568, 127, 952], "under"),
        ("549 kr, ord. 719 kr", [1067, 1151, 137, 943], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Taljset_FD_4_1": [
        ("Skärskyddade handskar", [164, 236, 93, 986], "rubrik"),
        ("ingår i väskan", [277, 357, 285, 795], "rubrik"),
        ("Handskarna skyddar när kniven slinter. Vassa verktyg, använd",
         [418, 447, 101, 978], "under"),
        ("handskarna.", [470, 492, 454, 624], "under"),
        ("869 kr, ord. 1 139 kr", [1067, 1151, 97, 983], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Taljset_FD_4_2": [
        ("869 kr. Ord. 1 139 kr. Fars", [164, 221, 72, 1007], "rubrik"),
        ("dag.", [285, 357, 463, 615], "rubrik"),
        ("6 knivar, 6 järn, strop och handskar i en väska",
         [418, 447, 215, 864], "under"),
        ("869 kr, ord. 1 139 kr", [1067, 1151, 97, 983], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Taljset_FD_4_3": [
        ("Beställ senast 19", [164, 221, 229, 854], "rubrik"),
        ("oktober, täljset till fars", [285, 357, 129, 949], "rubrik"),
        ("dag", [406, 478, 474, 604], "rubrik"),
        ("Väskan med dragkedja hinner fram till fars dag.",
         [539, 568, 205, 872], "under"),
        ("869 kr, ord. 1 139 kr", [1067, 1151, 97, 983], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
    "Taljset_FD_4_4": [
        ("6 knivar och 6 järn för", [164, 236, 138, 943], "rubrik"),
        ("olika snitt", [285, 342, 361, 720], "rubrik"),
        ("Läderstrop, polermedel, träbit att öva på och handskar.",
         [414, 447, 154, 924], "under"),
        ("869 kr, ord. 1 139 kr", [1067, 1151, 97, 983], "pris"),
        ("Beställ senast 19 oktober", [1224, 1246, 362, 718], "botten"),
    ],
}


def main():
    ut = {}
    for namn, rader in BILDER.items():
        block = [{"se": "Fars dag-rea", "matt": BADGE_INK, "roll": "badge"}]
        block += [{"se": t, "matt": m, "roll": r} for (t, m, r) in rader]
        ut[namn] = block
    json.dump(ut, open(f"{B}/blocken.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"{len(ut)} bilder, {sum(len(v) for v in ut.values())} textrader")


if __name__ == "__main__":
    main()
