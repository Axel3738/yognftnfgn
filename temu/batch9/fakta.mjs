// Batch 9 (ark A "Leverantorsoffert-2026-09-10") och batch 10 (ark B "product batch #10").
// LÅSTA FAKTA per produkt — allt är läst ur offertens variantsträng eller ur
// leverantörsbilderna (drawings i xlsx + =IMAGE()-formlerna i kolumn A, som
// pekar på ae-pic-a1.aliexpress-media.com och GÅR att hämta från molnet).
// Står något inte här får det inte påstås.
//
// ⛔ Byggs INTE (rapporteras till Axel):
//   ark A: Caravan front cover (out of stock) · Deer hanger pulley (out of stock)
//   ark B: Snöskoterkapell (MOQ 50, custom) · Takluckehuv 2-pack (out of stock) ·
//          Viltsläde (MOQ 100) · Fågelmatare med kamera (CWD: "similar" — annan produkt än länken)
// ⚠️ Higgsfield 0,61 credits 2026-09-12 → inga AI-miljöbilder/GIF:ar i den här batchen.

const B = '/tmp/b9/b/bilder', A = '/tmp/b9/a/bilder', ALI = '/tmp/b9/ali';

export const FAKTA = {
  // ---------- ark A = batch 9 ----------
  spakapell: { batch: 9, sku: 'TEMU-B9-SPAKAPELL', kategori: 'gid://shopify/TaxonomyCategory/ha-6-23',
    kalla: `${ALI}/a-S2b98ac777d4a4ae5b0a681efb7e7081fT.jpg (800 px, rund svart huv på badtunna; engelsk text "Dustproof and Rianproof Cover", "FOUR COLORS" — beskärs)`,
    latt: { form: 'runt', diameterCm: 215, hojdCm: 70, tyg: '210D', farg: 'svart', dragsko: true },
    obs: 'Offerten gäller MAXSTORLEKEN 215×70 cm. Offerten listar 6 färger men bilden 4 och vi har bara bild på svart — sälj BARA svart. "Vattentät" får inte påstås (bara "tyg 210D, dragsko i kanten" som syns).', varning: null },
  vedstallskapell: { batch: 9, sku: 'TEMU-B9-VEDSTALLSKAPELL', kategori: 'gid://shopify/TaxonomyCategory/hg-5-9-4',
    kalla: `${ALI}/a-S46593c3e6999493c8eb24fb3f94888afz.jpg (1600 px, svart kapell över vedställ i snö, ingen text)`,
    latt: { langdCm: 122, djupCm: 61, hojdCm: 106, version: 'med fönster: luftventil + uttag', farg: 'svart' },
    obs: 'CWD offererade versionen MED fönster ("air vent + outlet"). Vedstället ingår inte — bara kapellet.', varning: null },
  solcellsladdare: { batch: 9, sku: 'TEMU-B9-SOLCELLSLADDARE', kategori: 'gid://shopify/TaxonomyCategory/vp-1-5-7-3',
    kalla: `${A}/image1.jpg (1200 px: panel + kablar + cigguttagskontakt + batteriklämmor + 4 sugkoppar + manual) · ${ALI}/a-Sbf7d8a030fee4a34b489f30b34986ef6b.jpg (engelsk text "Solar battery charger / For 12V battery system / 10W" — beskärs)`,
    latt: { effektW: 10, systemV: 12, typ: 'MPPT-underhållsladdare', ingar: ['solpanel', 'kabel med cigguttagskontakt', 'kabel med batteriklämmor', '4 sugkoppar', 'manual'] },
    obs: 'Panelens mått står inte i offerten — påstå inga cm. Inget om laddtid eller vilka batterier den räcker till.', varning: null },

  // ---------- ark B = batch 10 ----------
  snoblasarkapell: { batch: 10, sku: 'TEMU-B10-SNOBLASARKAPELL', kategori: 'gid://shopify/TaxonomyCategory/hg-12-4-9-1',
    kalla: `${B}/image14.jpg (800 px, svart kapell över röd snöslunga, ren) · ${ALI}/b-Sf218a2ceb718407d900b0f1387ae3db6g.png (engelsk text "Heavy Duty Snow Blower Cover…" — beskärs)`,
    latt: { langdCm: 120, breddCm: 82, hojdCm: 60, farg: 'svart/silver' },
    obs: 'Måtten 120×82×60 ur offerten. "Vattentät"/"UV" är leverantörens ord på bilden — får inte påstås.', varning: null },
  honsgardsduk: { batch: 10, sku: 'TEMU-B10-HONSGARDSDUK', kategori: 'gid://shopify/TaxonomyCategory/ha-6-23',
    kalla: `${B}/image25.jpg (800 px: plan svart duk 145×110 med öljetter + duken på en burtak) · ${ALI}/b-S837e7b7074fd4b70b5f34d5874f536b3D.jpg (svart duk med hörnfästen)`,
    latt: { langdCm: 145, breddCm: 109, farg: 'svart', fasten: 'öljetter i hörnen' },
    obs: 'Offerten säger 145×109, bilden 145×110 — skriv 145 × 109 cm. Inget om material, vattentäthet eller UV.', varning: null },
  snoflingor: { batch: 10, sku: 'TEMU-B10-SNOFLINGOR', kategori: 'gid://shopify/TaxonomyCategory/hg-3-58',
    kalla: `${B}/image20.png (597 px: rutnät 6+6+6+7 = 25 flingor + garageport med flingorna) · ${B}/image27.jpg (mått 4,1 × 5,0 cm) · ${B}/image15.jpg (collage, INTE förpackningen)`,
    latt: { antal: 25, storlekCm: [4.1, 5.0], motiv: 'snöflingor i vitt, blått och silver', anvandning: 'garageport, fönster, dörr' },
    obs: '⚠️ Axels radnamn säger 25-pack och leverantörens rutnät visar 25 (raderna har 6+6+6+7 flingor — en tidigare räkning sa 24, rättat 2026-09-12 efter zoom på image20.png). Räknebart vinner: 25. Antalet ska synas i titel, som badge på huvudbilden och som första bullet. Inget om häftmassa/magnet/vad de fäster med.', varning: null },
  vattenskal: { batch: 10, sku: 'TEMU-B10-VATTENSKAL', kategori: 'gid://shopify/TaxonomyCategory/ap-2-14',
    kalla: `${B}/image8.png (459 px, EU plug, ren engelsk) · ${B}/image18.jpg (1600 px, samma skål, "EU (欧规)" — kinesiskt tecken beskärs)`,
    latt: { volymL: 2.2, spanning: '220–230 V', kontakt: 'EU-kontakt', farg: 'grön/svart', sladd: 'sladd med metallspiral', etikett: 'Heated Pet Bowl' },
    obs: 'Effekt, temperatur och "fryser inte ner till −X °C" står inte i offerten — påstå bara att den är uppvärmd. Sladdens metallspiral syns på bilden.', varning: null },
  atvkapell: { batch: 10, sku: 'TEMU-B10-ATVKAPELL', kategori: 'gid://shopify/TaxonomyCategory/vp-1-5-3-6',
    kalla: `${B}/image11.png (488 px, ATV under svart kapell + storlekstabell M–XXXL)`,
    latt: { storlek: '3XL (XXXL)', langdCm: 256, breddCm: 110, hojdCm: 120, farg: 'svart' },
    obs: 'Offerten gäller 3XL = 256×110×120 cm enligt tabellen på bilden. Bara den storleken säljs.', varning: null },
  snoskyffel: { batch: 10, sku: 'TEMU-B10-SNOSKYFFEL', kategori: 'gid://shopify/TaxonomyCategory/hg-12-3-13',
    kalla: `${B}/image12.png (600 px, ONEVAN-marknadsbild med engelsk text och två batterier — beskärs hårt) · ${B}/image13.jpg (800 px, 锂电池除雪机 裸机 = bar maskin, kinesisk text beskärs)`,
    latt: { rojbreddCm: 30, rojdjupCm: 15, kastlangdM: 8, ingar: 'BARA maskinen — batteri och laddare ingår inte', batterityp: 'batterier av Makita-typ (Axels radnamn)' },
    obs: '"bare metal" i offerten = utan batteri. Skriv det i titeln och första bulleten. Rojbredd 12"/30 cm, djup 6"/15 cm och 8 m kast är leverantörens siffror på bilden. Bara SE — Norge oversize. Att den passar Makita-batterier är Axels uppgift, inte offertens — säg "Makita-typ".', varning: 'Batteri och laddare ingår inte.' },
  kajakhallare: { batch: 10, sku: 'TEMU-B10-KAJAKHALLARE', kategori: 'gid://shopify/TaxonomyCategory/hg-10-16-9',
    kalla: `${B}/image26.png (1500 px: två krokar, 8 skruvar, 8 pluggar, "15.1 inch", "100 Lbs", kinesisk vattenstämpel — beskärs/undviks) · ${B}/image5.png (576 px, krokarna med kajaker)`,
    latt: { antal: 2, armLangdCm: 38, lastKg: 45, ingar: '2 krokar, 8 skruvar, 8 pluggar', farg: 'svart med gula ändskydd' },
    obs: '2-PACK: antalet i titel, badge på huvudbilden och första bullet. 100 lbs ≈ 45 kg per leverantören. Vikt 0,71 kg netto står på bilden.', varning: null },
  motorlas: { batch: 10, sku: 'TEMU-B10-MOTORLAS', kategori: 'gid://shopify/TaxonomyCategory/ha-9-4',
    kalla: `${B}/image10.png (449 px: rostfri låsbalk, 2 nycklar, gul flytande nyckelring; vattenstämpel "Move Time Store" — beskärs)`,
    latt: { material: 'rostfritt stål', nycklar: 2, nyckelring: 'flytande', anvandning: 'låser utombordarens fästskruvar' },
    obs: 'Inga mått i offerten. CWD-notering: AliExpress-priset saknade frakt — inget som rör kunden.', varning: null },
  varmesits: { batch: 10, sku: 'TEMU-B10-VARMESITS', kategori: 'gid://shopify/TaxonomyCategory/sg-4-2-1-8',
    kalla: `${B}/image17.jpg (900 px, måttbild 90×45 och 45×45, ren) · ${B}/image4.png (574 px, "4 Heated Areas / No Power Bank!!!" — engelsk text beskärs)`,
    latt: { storlekCm: [45, 90], varmezoner: 4, lagen: 3, drift: 'USB', ingar: 'powerbank ingår INTE' },
    obs: 'Offerten är baserad på 45×90-versionen. Tre lägen syns som tre färgade knappar. Inget om temperatur, watt eller tid.', varning: null },
  taljset: { batch: 10, sku: 'TEMU-B10-TALJSET', kategori: 'gid://shopify/TaxonomyCategory/ha-15-5',
    kalla: `${B}/image21.jpg (1543 px: 6 knivar med träskaft, 6 små järn, bladskydd, strop, slippapper, polermedel, träbit, skärskyddshandskar, väska) · ${B}/image3.png (577 px, setet i rullväska)`,
    latt: { delar: 30, knivar: 6, smaJarn: 6, ovrigt: ['bladskydd', 'läderstrop', 'slippapper', 'polermedel', 'träbit att öva på', 'skärskyddade handskar', 'väska med dragkedja'] },
    obs: '"30 delar" är offertens/Axels räkning; bilden visar ~30 delar inkl. skydd och handskar. Säg 6 knivar + 6 små järn (räknade) och "30 delar totalt".', varning: 'Vassa verktyg. Använd handskarna.' },
  varmeljus: { batch: 10, sku: 'TEMU-B10-VARMELJUS', kategori: 'gid://shopify/TaxonomyCategory/hg-3-34',
    kalla: `${B}/image22.jpg (800 px: 24 ljus, "24只 / 暖白色" kinesisk text beskärs) · ${B}/image6.png (visar EN FJÄRR som INTE ingår — använd inte som hero) · /tmp/b9/b/t-tealight.jpg (Temu, 1697 px)`,
    latt: { antal: 24, ljus: 'varmvitt', typ: 'LED-värmeljus, batteridrivna', fjarrkontroll: false },
    obs: '⚠️ CWD offererade "24pcs, No remote control". Axels radnamn "Ljus med fjärrkontroll" stämmer INTE för den här. Ingen fjärr, ingen timer får påstås. 24-PACK: titel + badge + första bullet. Batterityp står inte i offerten.', varning: null },
  blockljus: { batch: 10, sku: 'TEMU-B10-BLOCKLJUS', kategori: 'gid://shopify/TaxonomyCategory/hg-3-34',
    kalla: `${B}/image9.png (800 px: 3 grå blockljus + fjärr, ren) · ${B}/image16.jpg (1200 px, tända på bord) · /tmp/b9/b/t-pillar.jpg (Temu)`,
    latt: { antal: 3, hojdCm: [10, 12.5, 15], diameterCm: 7.8, farg: 'grått glas', fjarrkontroll: true, timer: ['2H', '4H', '6H', '8H'], batterier: '3 × AA per ljus, ingår inte' },
    obs: 'Ur offertens variant: "7.8*10/12.5/15cm, remote control set, requires 3 AA batteries (not included)". 3-PACK: titel + badge + första bullet. "Äkta vax" står bara i Temu-titeln — påstå inte.', varning: null },
};
export const EJ_BYGGDA = {
  'Caravan front protection cover 200×160': 'ark A — out of stock',
  'Deer hanger pulley 700 lbs': 'ark A — out of stock',
  'Snöskoterkapell 600D': 'ark B — MOQ 50, custom order',
  'Takluckehuv 40×40 2-pack': 'ark B — out of stock',
  'Viltsläde rullbar dragmatta': 'ark B — MOQ 100',
  'Fågelmatare med kamera 5MP': 'ark B — CWD skrev "similar": offererat en annan fågelmatare än länken (grön, annan kamera). Byggs inte utan besked.',
};
