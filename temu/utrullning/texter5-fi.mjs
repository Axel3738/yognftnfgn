// Batch 5 (2026-08-28) — suomennos av T5_SV (texter5.mjs), 14 produkter.
// Käännetty majavakauppa.fi:tä varten, sävy poimittu texter4.mjs:n fi-lohkoista.
// Räkneord ovat identiska med den svenska mastercopyn — ändra dem ALDRIG vid
// korrläsning: 104 osaa, 24 langan väriä, 46/60 osaa, 37 L, 21 lokeroa,
// 15 diodia, 14,3 cm, 20,2 cm, 9 × 7 × 3,5 cm, 29,5 cm, 42 × 28 cm, 84 cm,
// 16 oz, 13 cm, V7/V8/V10/V11/V15, Makita 18V.
//
// Inga hastighetslöften (ei "nopea toimitus"), inga absoluta löften, inga
// förbjudna superlativ ("mullistava" osv). Arbetslampans batteribudskap
// ("Akku ei sisälly") är kvar tydligt i både losningP och sista bullet.

export const T5_FI = {
  arbetslampa: {
    titel: 'Työvalo Makita-akulle – 15 LED-valoa ja USB-liitäntä',
    problemH: 'Otsalamppu häikäisee ja puhelin kuolee',
    problemP: 'Auton alla, varastossa, mökin pihalla pimeän tultua – valo osuu aina väärään suuntaan, ja akku jonka jo omistat istuu ruuvinvääntimessä tekemättä mitään.',
    losningH: 'Valo, jota käyttää akku jonka jo omistat',
    losningP: 'Työvalo, jossa on 15 diodia ja joka istuu suoraan Makita 18V -kiinnikkeeseen. Kantokahva, tukeva jalka ja kaksi USB-liitäntää, joten puhelin latautuu työn ohessa. Akku ei sisälly – siinä koko juju: sinulla on se jo.',
    bullets: [
      '<strong>Valaisee koko työalueen</strong> – 15 diodia levittää valon kapean kartion sijaan',
      '<strong>Istuu suoraan akkuun jonka jo omistat</strong> – sopii Makita 18V -kiinnikkeeseen',
      '<strong>Lataa puhelimen samalla</strong> – kaksi USB-liitäntää jalassa',
      '<strong>Kulkee mukana sinne missä työ on</strong> – kantokahva, 16 cm korkea',
      '<strong>Akku ei sisälly</strong> – valo toimii omalla Makita 18V -akullasi',
    ],
    option: 'Väri', varden: ['Sininen', 'Keltainen', 'Punainen'],
    alt: { main: 'Työvalo, jossa 15 diodia ja kantokahva', b2: 'Työvalo viistosti edestä, virtakytkin näkyvissä' },
  },

  diskstall: {
    titel: 'Kaksikerroksinen Astiankuivausteline – Koko Tiskierän Kuivaustila 42 cm:llä',
    problemH: 'Tiskit kilpailevat yhdestä valumatelineestä',
    problemP: 'Lautaset tasapainottelevat lasien päällä, ruokailuvälineet ovat kasassa ja leikkuulauta nojaa laattaseinään. Joka päivällinen päättyy samaan tetrikseen tiskialtaalla.',
    losningH: 'Kaksi kerrosta, joissa jokaisella asialla on oma paikkansa',
    losningP: 'Lautaset ja leikkuulauta seisovat pystyssä kuivumassa, lasit roikkuvat ylösalaisin omilla tapeillaan, ruokailuvälineillä on oma lokeronsa – ja kaiken alla valumataso ohjaa veden sinne minne haluat. 42 × 28 cm tasolla, 29 cm korkea.',
    bullets: [
      '<strong>Koko perheen tiskit mahtuvat kerralla</strong> – kaksi kerrosta ahtaan tason sijaan',
      '<strong>Lasit kuivuvat ylösalaisin</strong> – omat tapit, ei vesijuovia pohjassa',
      '<strong>Ei vettä tasolle</strong> – valumataso johtaa veden altaaseen',
      '<strong>Ruokailuvälineillä ja leikkuulaudalla on omat lokeronsa</strong> – mikään ei loju irrallaan',
    ],
    option: 'Väri', varden: ['Musta', 'Valkoinen'],
    alt: { main: 'Kaksikerroksinen astiankuivausteline täynnä tiskiä altaan vieressä', b2: 'Astiankuivausteline lautasineen, laseineen ja ruokailuvälineineen paikoillaan' },
  },

  bankhylla: {
    titel: 'Tasohylly Ulosvedettävällä Korilla – Kaksinkertainen Tila Samalla Tasolla',
    problemH: 'Tasotila loppui kolme laitetta sitten',
    problemP: 'Kahvinkeitin, aamiaistarvikkeet ja purkit tungeksivat samalla puolella metrillä. Ainoa asia joka kasvaa keittiössä on kasa.',
    losningH: 'Hylly, joka luo yhden kerroksen lisää',
    losningP: 'Puulevy tavaroiden alustaksi – ja sen alla metallikori kiskoilla, jonka vedät ulos kuin laatikon. Se mikä oli tiellä saa oman paikkansa, ilman poraamista tai remonttia.',
    bullets: [
      '<strong>Kaksinkertainen tasotila</strong> – aseta päälle, säilytä alle',
      '<strong>Kori liukuu ulos kuin laatikko</strong> – näet kaiken nostamatta mitään pois',
      '<strong>Seisoo tukevasti itsestään</strong> – ei poraamista, ei reikiä seinään',
      '<strong>Puuta ja mustaa metallia</strong> – näyttää huonekalulta, ei varastohyllyltä',
    ],
    option: 'Väri', varden: ['Musta', 'Valkoinen'],
    alt: { main: 'Tasohylly puulevyllä ja ulosvedettävällä korilla keittiötasolla', b2: 'Tasohylly kori ulosvedettynä', b3: 'Tasohylly viistosti edestä' },
  },

  luffarschack: {
    titel: 'Puinen Ristinolla – Klassikko Joka On Aina Esillä',
    problemH: 'Peli-ilta kuolee sovelluskaupassa',
    problemP: 'Kaikki haluavat tehdä jotain yhdessä, mutta pelit ovat laatikossa vaatekaapin perällä ja puhelimet ovat lähempänä.',
    losningH: 'Peli, joka on esillä ja tulee pelatuksi',
    losningP: 'Puinen ristinolla, 14,3 × 14,3 cm, jonka nappulat pysyvät omissa lokeroissaan. Tarpeeksi tyylikäs sohvapöydälle, tarpeeksi yksinkertainen jotta viisivuotias ja isoisä pelaavat samoin säännöin.',
    bullets: [
      '<strong>Kaikenikäiset pelaavat heti</strong> – säännöt osaa jo jokainen',
      '<strong>Pysyy esillä ja tulee käytetyksi</strong> – puuta, joka sopii sohvapöydälle',
      '<strong>Nappuloilla on omat lokeronsa</strong> – ei kantta etsittäväksi, ei mitään mikä katoaa',
      '<strong>14,3 cm leveä</strong> – mahtuu tarjottimelle, parvekepöydälle ja laukkuun',
    ],
    alt: { main: 'Puinen ristinolla mustilla ja valkoisilla nappuloilla', b2: 'Lauta lähikuvassa, nappulat omissa lokeroissaan' },
  },

  glasspints: {
    titel: 'Jäätelöpurkit Kannella 2 kpl – Tee Jäätelö Suoraan Purkkiin',
    problemH: 'Kotitekoinen jäätelö säilyy muovirasiassa jääkuoren alla',
    problemP: 'Kone tekee työn, mutta sitten kaikki kaavitaan purkkiin joka ei pidä tiiviisti eikä näytä miltään – ja puolet erästä pilaantuu pakkasessa.',
    losningH: 'Purkit, jotka kulkevat koneesta pakkaseen kannen kanssa',
    losningP: 'Kaksi 16 oz -kokoista purkkia tiiviisti sulkeutuvalla kannella. Tee jäätelö, laita kansi päälle, pakkaseen – ja tarjoile samasta purkista. Uritettu, läpinäkyvä lasi näyttää minkä maun purkki sisältää.',
    bullets: [
      '<strong>Koneesta pakkaseen ilman välivaihetta</strong> – valmista ja säilytä samassa purkissa',
      '<strong>Kansi pitää tiiviisti</strong> – ei jääkuorta, ei pakastemakua',
      '<strong>Näet mitä sisällä on</strong> – läpinäkyvä lasi anonyymin muovin sijaan',
      '<strong>Kaksi purkkia</strong> – toinen pakkasessa kun toista syödään',
    ],
    alt: { main: 'Kaksi kannellista jäätelöpurkkia keittiötasolla', b2: 'Purkki kansineen useissa väreissä' },
  },

  kastfanga: {
    titel: 'Heitä & Nappaa -setti – 4 Koria ja Palloja Narussa',
    problemH: 'Mölkky-kausi kestää kaksi viikonloppua',
    problemP: 'Pihapelit vaativat tasaisen maan, monta pelaajaa ja tunnin pystytyksen. Loppukesän ne makaavat varastossa.',
    losningH: 'Peli, joka on käynnissä kolmessakymmenessä sekunnissa',
    losningP: 'Neljä koria hihnalla – yksi käteen tai kaulan ympärille – ja pallot 84 cm narussa. Heitä, nappaa koriin, vaihda suuntaa. Toimii nurmikolla, rannalla ja leirintäalueella, kahdelle pelaajalle tai koko seurueelle.',
    bullets: [
      '<strong>Käynnissä kolmessakymmenessä sekunnissa</strong> – ei kenttää merkittäväksi, ei mitään ruuvattavaa',
      '<strong>Kaikki pääsevät heti mukaan</strong> – korilla nappaaminen on helpompaa kuin käsin kiinniottaminen',
      '<strong>Neljä koria setissä</strong> – kaksi ottelua samaan aikaan tai koko perhe piirissä',
      '<strong>Pallo ei katoa</strong> – naru on kiinni korissa, ei etsimistä pensaikosta',
    ],
    alt: { main: 'Neljä vihreää koria palloineen narussa viltillä nurmikolla', b2: 'Mitat – kori on 13 cm leveä ja naru 84 cm' },
  },

  magnetplattor: {
    titel: 'Suurikokoiset Magneettilevyt – Rakennussetti Kantokahvallisessa Laatikossa',
    problemH: 'Rakennuslelut kuolevat kun palat ovat liian pieniä',
    problemP: 'Viisikymmentä mikro-osaa sohvan alla, revennyt ohje ja lapsi joka luovutti kymmenen minuutin jälkeen. Enemmän rakennetaan ruudulla kuin lattialla.',
    losningH: 'Isot levyt, jotka napsahtavat kiinni itsestään',
    losningP: 'Suurikokoiset magneettilevyt vetäytyvät oikeaan suuntaan – tornit, talot ja ajoneuvot syntyvät ilman ohjekirjaa. Tulee kantokahvallisessa laatikossa, joten rakennelma siivotaan yhtä nopeasti kuin se otetaan esiin. Valitse 46 tai 60 osaa.',
    bullets: [
      '<strong>Rakentaminen onnistuu heti</strong> – magneetit asettuvat oikein itsestään',
      '<strong>Isot levyt, ei pikkuosia sohvassa</strong> – tehty pienemmille käsille',
      '<strong>Siivoutuu minuutissa</strong> – kaikki kantokahvalliseen laatikkoon',
      '<strong>Kasvaa lapsen mukana</strong> – geometriaa ja tasapainoa huomaamatta',
    ],
    option: 'Osien määrä', varden: ['46 osaa', '60 osaa'],
    alt: { main: 'Torneja ja rakennelmia värikkäistä magneettilevyistä', b2: 'Suurempi rakennelma magneettilevyistä' },
  },

  mcvaska: {
    titel: 'Motocentric-takalaukku 37 L – Kypärä Mahtuu Laukkuun',
    problemH: 'Kypärä roikkuu ohjaustangossa tai jää kotiin',
    problemP: 'Ajaja tietää: kypärälle ei ole paikkaa mihinkään kun pysäköit, eikä reppuun mahdu sekä se että sadevarusteet.',
    losningH: 'Takalaukku, joka nielaisee koko kypärän',
    losningP: '37 litran Motocentric-takalaukku, joka kiinnitetään istuinpehmusteeseen tai tavaratelineeseen hihnoilla. Kypärä mahtuu sisään, sadevarusteet ja hanskat viereen, ja heijastindetaljit näkyvät pimeässä.',
    bullets: [
      '<strong>Kypärä saa vihdoin oman paikkansa</strong> – 37 litraa nielaisee sen reilusti',
      '<strong>Pysyy kiinni moottoripyörässä</strong> – kiinnityshihnat istuinpehmusteelle tai tavaratelineelle',
      '<strong>Näkyy pimeässä</strong> – heijastindetaljit takana',
      '<strong>Vie mukaan muutakin kuin kypärän</strong> – sadevarusteet, hanskat ja ketjulukko mahtuvat viereen',
    ],
    alt: { main: 'Takalaukku asennettuna moottoripyörään', b2: 'Laukku kiinnitettynä istuinpehmusteeseen' },
  },

  somnadskit: {
    titel: 'Ompelusetti 104 Osaa – Kaikki Yhdessä Kotelossa',
    problemH: 'Nappi irtoaa eikä koko kodista löydy neulaa',
    problemP: 'Auennut helma, nappi kädessä viisi minuuttia ennen lähtöä – ja lähin neula ja lanka löytyvät toisesta asunnosta.',
    losningH: 'Koko ompelurasia yhdessä vetoketjullisessa kotelossa',
    losningP: '104 osaa yhdessä kotelossa: 24 langan väriä, neuloja, saksia, mittanauha, painonapit ja neulanpujotin – lajiteltuna omiin pidikkeisiinsä, joten kotelo näyttää samalta viidennenkin käyttökerran jälkeen. Lipaston laatikkoon kotona tai matkalaukkuun.',
    bullets: [
      '<strong>Nappi on ommeltu kiinni viidessä minuutissa</strong> – lanka, neula ja sakset samassa paikassa',
      '<strong>104 osaa, joilla kaikilla oma paikkansa</strong> – setti näyttää samalta joka käyttökerran jälkeen',
      '<strong>24 langan väriä</strong> – oikea väri vaatteeseen lähimmän sijaan',
      '<strong>Kulkee mukana matkalaukussa</strong> – litteä vetoketjullinen kotelo',
    ],
    alt: { main: 'Ompelusetti avattuna, lankarullat, sakset ja tarvikkeet näkyvissä' },
  },

  reseask: {
    titel: 'Taskukokoinen Lääkerasia – 7 Lokeroa Tiiviisti Sulkeutuvalla Kannella',
    problemH: 'Tabletit matkustavat kolisevassa purkissa',
    problemP: 'Viikonloppulaukku pakataan ja lääkkeet matkustavat mukana alkuperäispakkauksessa joka vie tilaa, tai irrallaan purkissa jossa kaikki sekoittuu.',
    losningH: 'Rasia, joka vie viikon annokset takintaskussa',
    losningP: 'Seitsemän omaa lokeroa tiiviisti sulkeutuvan kannen alla, 9 × 7 × 3,5 cm – rasia katoaa takintaskuun tai toilettilaukkuun. Lokerot pitävät päivät erillään, kansi pitää tabletit kuivina.',
    bullets: [
      '<strong>Viikon annokset takintaskussa</strong> – 9 × 7 cm, pienempi kuin korttipakka',
      '<strong>Seitsemän lokeroa pitää päivät erillään</strong> – ei mitään irrallaan sekoittumassa',
      '<strong>Kansi sulkeutuu tiiviisti</strong> – tabletit pysyvät kuivina laukussa',
      '<strong>Avautuu yhdellä kädellä</strong> – lukitus aukeaa peukalolla',
    ],
    option: 'Väri', varden: ['Valkoinen', 'Vihreä'],
    alt: { main: 'Valkoinen lääkerasia avattuna, tabletit lokeroissa', b2: 'Vihreä lääkerasia, mitat 9 × 7 cm' },
  },

  veckodosett: {
    titel: 'Viikkodosetti 21 Lokeroa – Aamu, Päivä ja Ilta Seitsemäksi Päiväksi',
    problemH: '"Otinko aamuannoksen?" on päivittäinen kysymys',
    problemP: 'Kolme annosta päivässä ja seitsemän purkkia kylpyhuoneen kaapissa – lopulta kukaan ei pidä lukua, ja juuri lukumäärä on koko pointti.',
    losningH: 'Viikko täytetty sunnuntaina, sen jälkeen tarvitsee vain avata',
    losningP: 'Seitsemän päivärasiaa, joissa kolme lokeroa kussakin – aamu, päivä, ilta – kannellisessa kotelossa. Täytä kaikki sunnuntaina. Päivän rasia lähtee mukaan taskuun, loput jäävät kotiin, ja vastaus kysymykseen näkyy lokerosta.',
    bullets: [
      '<strong>Vastaus näkyy lokerosta</strong> – tyhjä lokero tarkoittaa otettua annosta',
      '<strong>Päivän rasia kulkee mukana</strong> – irrota ja ota taskuun, loput jäävät kotiin',
      '<strong>21 lokeroa täytettynä kerralla</strong> – yksi täyttökerta viikossa kolmen sijaan päivässä',
      '<strong>Kansi pitää järjestyksen</strong> – rasiat pysyvät paikoillaan kotelossa',
    ],
    alt: { main: 'Viikkodosetti, seitsemän päivärasiaa kotelossa', b2: 'Päivärasia irrotettuna kotelosta' },
  },

  sandbild: {
    titel: '3D-hiekkataulu 20 cm – Uusi Maisema Joka Kerta Kun Käännät Sen',
    problemH: 'Koriste-esineet ovat näyttäneet samalta siitä lähtien kun ne purettiin pakkauksesta',
    problemP: 'Hylly on kalustettu ja valmis – ja kuollut. Mikään huoneessa ei muutu ennen kuin joku siirtää jotain.',
    losningH: 'Taulu, joka piirtää itsensä uudelleen',
    losningP: 'Käännä kehystä ja hiekka valuu hitaasti nesteen läpi uudeksi vuoristomaisemaksi – joka kerta erilaiseksi kuin edellinen. Pyöreä kehys, 20,2 cm leveä, seisoo jalustalla hyllyllä tai työpöydällä.',
    bullets: [
      '<strong>Uusi kuva joka kerta</strong> – hiekka ei asetu koskaan kahdesti samalla tavalla',
      '<strong>Huoneen rauhallisin katseenvangitsija</strong> – hidasta liikettä yhden paikallaan seisovan koriste-esineen sijaan',
      '<strong>Käännetään yhdellä otteella</strong> – seisoo tukevasti omalla jalustallaan',
      '<strong>20 cm pyöreä</strong> – vie hyllytilaa kuin kirja, näkyy kuin taulu',
    ],
    option: 'Väri', varden: ['Punainen', 'Meripihka'],
    alt: { main: 'Punainen 3D-hiekkataulu hyllyllä', b2: 'Mitat – kehys on 20,2 cm leveä ja 21,4 cm korkea', b3: 'Hiekkataulu meripihkanvärisenä' },
  },

  dysonborste: {
    titel: 'Karvaharja Dyson-pölynimuriin – Harjaa ja Imuroi Samalla Kertaa',
    problemH: 'Karva harjataan irti – ja päätyy lattialle',
    problemP: 'Koira karvaa, harja täyttyy, ja kaikki mitä olet kammannut irti leijailee matolle jonka juuri imuroit. Kaksi askaretta jotka mitätöivät toisensa.',
    losningH: 'Harja, joka istuu pölynimurissa kiinni',
    losningP: 'Harjapää, joka kytketään Dyson V7-, V8-, V10-, V11- tai V15-imuriin – letku ja sovittimet mukana setissä. Piikit irrottavat aluskarvan ja imuri nielaisee sen samalla vedolla. Karva päätyy säiliöön, ei lattialle.',
    bullets: [
      '<strong>Karva päätyy pölynimuriin</strong> – ei lattialle jonka juuri siivosit',
      '<strong>Sopii sinun Dysoniisi</strong> – V7, V8, V10, V11 ja V15 mukana tulevilla sovittimilla',
      '<strong>Letku antaa ulottuvuutta</strong> – harjaa sohvalla nostamatta imuria',
      '<strong>Hellävaraiset piikit</strong> – irrottavat aluskarvan vetämättä ihosta',
    ],
    alt: { main: 'Harjapää pölynimurissa koiran ja kissan vierellä', b2: 'Setin osat – harjapää, letku ja sovittimet, merkitty V7–V15' },
  },

  jetflakt: {
    titel: 'Suihkupuhallin Makita-akulle – Puhalla Puhtaaksi Ilman Johtoa',
    problemH: 'Paineilma spraypurkista loppuu kesken työn',
    problemP: 'Pöly tietokoneessa, lastut työpenkillä, lehdet portailla – purkit maksavat ja loppuvat, ja kompressori letkuineen seisoo varastossa jossa et ole.',
    losningH: 'Turbopuhallin, joka istuu akkuun jonka jo omistat',
    losningP: 'Käsin pidettävä suihkupuhallin, jossa harjaton moottori puhaltaa pois pölyn, lastut ja lehdet suunnatulla ilmavirralla. Pistoolikahva, liipaisin, ja jalka istuu suoraan Makita 18V -kiinnikkeeseen – sama akku kuin ruuvinvääntimessä. Akku ei sisälly: se toimii sillä minkä jo omistat.',
    bullets: [
      '<strong>Puhaltaa puhtaaksi siitä missä purkki loppui</strong> – pöly, lastut ja lehdet ilman kulutustarvikkeita',
      '<strong>Istuu suoraan akkuun jonka omistat</strong> – sopii Makita 18V -kiinnikkeeseen',
      '<strong>Harjaton moottori pistoolikahvassa</strong> – suunnataan yhdellä kädellä',
      '<strong>Akku ei sisälly</strong> – puhallin toimii omalla työkaluakullasi',
    ],
    alt: { main: 'Suihkupuhallin ilman akkua, viistosti edestä' },
  },

  magnethylla: {
    titel: 'Magneettihylly Pesukoneelle ja Jääkaapille – Säilytystä Ilman Poraamista',
    problemH: 'Pesuaine seisoo lattialla oven takana',
    problemP: "Pesutuvassa ei ole yhtään hyllyä ja vuokranantajalla on mielipiteitä porausrei'istä. Niinpä pullot seisovat koneen päällä ja kaatuvat joka linkouksella.",
    losningH: 'Hylly, joka kiinnittyy peltiin itsestään',
    losningP: 'Hylly, jonka magneettinen tausta tarttuu suoraan pesukoneen tai jääkaapin kylkeen. 29,5 cm leveä, reunus pitää pullot paikallaan – ylös sekunneissa, siirtyy yhtä nopeasti, ei jätä reikiä.',
    bullets: [
      '<strong>Ylös sekunneissa, ei reikiä</strong> – magneetti tarttuu suoraan peltiin',
      '<strong>Pullot pysyvät paikallaan</strong> – reunus pitää vastaan koneen linkotessa',
      '<strong>Siirtyy kun haluat</strong> – irrota, kiinnitä seuraavaan peltipintaan',
      '<strong>29,5 cm leveä</strong> – pesuaine, huuhteluaine ja tahranpoistoaine rivissä',
    ],
    option: 'Väri', varden: ['Musta', 'Valkoinen'],
    alt: { main: 'Kaksi mustaa magneettihyllyä pesuaineineen pesukoneen kyljessä', b2: 'Valkoinen hylly, mitat 29,5 × 9,5 × 7,5 cm' },
  },
};
