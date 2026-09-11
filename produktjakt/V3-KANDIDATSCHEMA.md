# V3 — kandidatschemat (det discovery-agenterna och `rank.py` talar)

En kandidat är ett JSON-objekt. Fält märkta ★ är obligatoriska för att raden ska få stå på dagens ark;
allt annat får vara `null` men aldrig gissat. Skriv **"ej mätt"** hellre än en siffra ur huvudet.

```json
{
  "koncept_id": null,                       // sätts av koncept.py när raden tas in; agenten lämnar null
  "namn_sv": "Snöslungehuven 600D",         // ★ kort svenskt namn (≤ 6 ord)
  "objekt": "Snöslungan",                   // ★ objektraden i objekt.json eller ett nytt objekt (skriv då "NYTT: …")
  "form": "överdrag",                       // ★ överdrag | huv | koja | tak | kalenderlåda | sele | klämma | nät | lock | hus | annat
  "arketyp": "B_SKYDDA_DYRT",               // ★ A_AGARE_FRIKTION | B_SKYDDA_DYRT | C_LAGA_ISTALLET | D_SNABBARE_METOD | E_VADER_SASONG | F_HOBBY_IDENTITET | G_Q4_GAVA | H_VISUELL_NYHET | I_FLERKOP
  "arketyp_sekundar": "E_VADER_SASONG",
  "slot": "exploitation",                   // ★ exploitation (liknar en REAL WINNER) | exploration (testar en hypotes) | sasong (Q4/hobby/datum)
  "hypotes_id": "H01",                      // vilken rad i hypoteser.json kandidaten testar (exploration/sasong) — annars null
  "vinnarlikhet": {"likast": "Motorhöljet", "delade_variabler": ["objekt_ute", "dyr>10tkr", "överdrag", "improvisation"], "avvikelser": ["ingen pågående skada"]},

  "sasong": {"fonster_id": "forsta_sno_mellan", "deadline_typ": "första snö", "veckor_kvar": 10.0, "timing": "NOW"},   // ★ ur sasong.py --objekt

  "listning": {                             // ★ LIVE_VERIFIED krävs för arket
    "product_id": "1005009495979403",
    "url": "https://www.aliexpress.com/item/1005009495979403.html",
    "pris_usd": 13.47,                      // ur sökträffen (ali.sok) — produktsidan ger inget pris
    "sald": "",
    "verdict": "LIVE_VERIFIED",             // LIVE_VERIFIED | SOKTRAFF (bara sökträff) | BLOCKED | GONE
    "verifierad_at": "2026-09-11T14:02:11Z",
    "kontroll": {"produktsida_oppnad": true, "titel_stammer": true, "hero_nedladdad": "korningar/<datum>/v3/bilder/<id>.jpg", "hero_sedd": true, "pris_sett": true, "varianter": "universal, en variant", "video": "ej tillgänglig i containern"}
  },

  "material": {"klass": 1, "hero_textfri": false, "hero_i_kontext": true, "samma_produkt": true, "forsta_3s": "ej mätt (ingen video)", "kommentar": "inbränd text uppe till vänster måste beskäras"},

  "marknad": {                              // ★ svenska golvet — bara sådant som lästs i DENNA körning, med URL
    "lagsta_jamforbara": {"aktor": "Stiga/duab.se", "pris_sek": 450, "url": "https://…", "exakt_samma_form": true},
    "premium_ankare": {"namn": "Husqvarna överdrag snöslunga", "pris_sek": 849, "url": "https://…", "i_sortiment": true},
    "ankare_kvot": 1.42,
    "annonsorer_se": "ej mätt",
    "kollade_kallor": ["pricerunner.se", "jula.se", "biltema.se", "duab.se"]
  },

  "ekonomi": {                              // ★ ur VERIFIERAD leverantörsprissättning, som intervall
    "landad_sek": [180, 210], "pris_sek": 599, "brutto_sek": [389, 419], "be_cpa_sek": [389, 419], "be_roas": 1.5,
    "flerkop": false, "returrisk": "låg — universal"
  },

  "meta_tanke": {                           // ★ varför någon slutar scrolla
    "hook": "Står snöslungan ute i höst?",  // ägarfråga ≤ 7 ord
    "objekt_i_bild": "snöslungan under huven",
    "sjalvselekterande": true,              // kan creativen hitta ägaren utan intressetargeting?
    "forstas_3s": true,
    "bevisas_visuellt": "huven på slungan, snö utanpå"
  },

  "varfor": "Husqvarna-ankare 1,42×, objekt 8–25 tkr ute, första snö 10 v — samma struktur som V1 och motorhöljet",   // ★ ≤ 2 meningar
  "huvudrisk": "inbränd text i heron; storlek 'universal' kan slira",                                                   // ★ 1 mening
  "konfidens": "MEDEL",                     // ★ LÅG | MEDEL | HÖG

  "poang": {"vinnarlikhet": 3, "meta_creative": 2, "efterfragan": 2, "lucka": 2, "ekonomi": 2, "sasong": 3, "leverantor": 2, "nyhet": 1, "hypotesvarde": 1},   // ★ 0–3 per axel, rank.py väger
  "per_kriterium": {"K0": "ok", "K1": 14, "K2": 14, "K3": 10, "K4": 8, "K5": 8, "K6": 10, "K7": 5, "K8": 8, "K9": 5, "K10": 2, "K11": 1, "K12": 1},            // gamla poängkortet — bevis, inte dom
  "k0": {"dubblett": false, "kollat": ["katalog-live.txt", "koncept.py sok", "kontot 7 d"]},   // ★
  "kallor": ["https://…"]
}
```

## Poängaxlarna (0–3), så de betyder samma sak för alla

| Axel | 3 | 2 | 1 | 0 |
|---|---|---|---|---|
| vinnarlikhet | delar ≥ 4 variabler med en REAL WINNER (LEARNING_STATE) | 3 | 2 | ≤ 1 |
| meta_creative | textfri hero i kontext + ägarfråga + objekt i bild | två av tre | en | packshot med text, ingen fråga |
| efterfragan | > 200 k ägare med källa + NOW-fönster | 100–200 k eller NOW | > 100 k utan fönster | < 100 k eller okänt |
| lucka | ingen svensk aktör i samma form | golv finns men ankare ≥ 1,6× | golv finns, ankare 1,2–1,6× | golv under oss utan ankare |
| ekonomi | BE-CPA ≥ 450 och pris ≥ 500 | BE-CPA 300–450 | 190–300 | < 190 |
| sasong | NOW, 4–12 v till topp | NOW 2–4 v eller 12–16 v | LATE/EARLY med pågående skada | PASSERAD / inget fönster utan skada |
| leverantor | LIVE_VERIFIED + hero sedd + video sedd | LIVE_VERIFIED + hero sedd | bara sökträff | blockerad/död |
| nyhet | formen finns inte i svenskt flöde (H_VISUELL_NYHET) | ovanlig | vanlig men ny för kontot | kontot har formen |
| hypotesvarde | testar en aktiv hypotes rent (en variabel skiljer) | testar en hypotes | svagt | ingen hypotes |

`rank.py` räknar aldrig ihop allt till EN siffra som får döda en rad: exploitation rankas på
vinnarlikhet + ekonomi + sasong + meta_creative + lucka, exploration på hypotesvarde + nyhet + meta_creative + ekonomi,
sasong på sasong + efterfragan + ekonomi — och en rad med en trea på någon axel märks **asymmetrisk** och visas alltid.
