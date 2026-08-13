# -*- coding: utf-8 -*-
"""
M = { exakt gammal textsträng ur källans JSON : ny textsträng }

Nycklarna är kopierade tecken för tecken ur Motorhölje-listiclen.
Värdena är strandtoffel-copyn, skriven av sonnet-subagent enligt CLAUDE.md regel 5.

Behålls oförändrat (samma avsändare / samma juridik):
  - "Jag ska vara ärlig:"
  - "Därför kan du testa helt riskfritt."
  - bylinen "Av Anders från Bäverbutiken."
  - footern med "OBS: Detta är reklam."
  - profilbilden
"""

M = {

    # ---------------------------------------------------------------- 1. H1
    'Vi beställde in för många motorhöljen och nu får du ditt för 299 kr istället för 367 kr så länge lagret räcker':
        'Vi beställde in för många strandtofflor, nu säljer vi ut lagret för 349 kr '
        'istället för 420 kr.',

    # ---------------------------------------------------------------- 2. Dek
    '<p>Vår senaste beställning blev större än planerat och lagret är fullpackat. Din motor, och dess andrahandsvärde, tjänar på det.</p>':
        '<p>Vi räknade fel vid beställningen och fick in fler tofflor än vi behöver, därför '
        'säljer vi nu ut lagret till ett lägre pris.</p>',

    # ---------------------------------------------------------------- 4. Datum
    '<p>Senast uppdaterad 4 augusti 2026.</p>':
        '<p>Senast uppdaterad 13 augusti 2026.</p>',

    # ---------------------------------------------------------------- 5. Sammanfattning
    '<p><span style="color:#000000;"><strong>Sammanfattning:</strong> Vår senaste beställning blev större än planerat och lagret är helt fullpackat. Därför rear vi ut motorhöljena: 299 kr istället för ordinarie 367 kr, så länge lagret räcker.&nbsp;</span><br><span style="color:#000000;">Om din kåpa redan börjat blekna, eller om du vill vara säker på att den aldrig gör det, är det här lösningen. Ett hölje som håller motorn i originalskick. Och originalskick är det som håller värdet den dag båten ska säljas.</span></p>':
        '<p><span style="color:#000000;"><strong>Sammanfattning:</strong> Vi beställde in fler '
        'strandtofflor än vi behövde och säljer nu ut lagret för 349 kr istället för ordinarie '
        '420 kr.</span><br><span style="color:#000000;">Perfekt för dig som halkar till på altanen, '
        'bryggan eller poolkanten och vill ha bättre grepp under fötterna.</span></p>',

    # ---------------------------------------------------------------- Punkt 1
    '1. Din kåpa ser fin ut. Det gör den inte länge till.':
        '1. Du märker det inte förrän foten redan glidit',

    '<p>Ingen bestämmer sig för att slita ut sin motor. Man bara skjuter upp skyddet. Båten ligger vid bryggan, du ska ut igen på fredag, och kåpan ser ju fin ut. Men medan du väntar jobbar solen på ytskiktet, saltet torkar in efter varje tur och regnet letar sig in i varje skarv. Motorn är den enda delen av båten som hänger helt <strong>oskyddad</strong>, <strong>dygnet runt</strong>, <strong>hela säsongen</strong>. Du skulle aldrig låta mobilen ligga utan skal. Men det dyraste du hänger på akterspegeln får klara sig naket. Inte för att du bestämt det, utan för att du aldrig bestämt något alls.</p>':
        '<p>Du kliver ut på altanen en tidig morgon, kaffet i handen, och känner ingenting konstigt '
        'under foten. Ytan ser ut som vanligt. Men precis där trädäcket är som fuktigast bildas ett '
        'tunt <strong>vattenlager</strong> som du inte ser förrän foten redan har börjat glida, och '
        'sulan under dig hittar inget <strong>grepp</strong> att bromsa mot. Steget blir en halv '
        'sekund för sent. Sen tänker du att du nog bara klev fel. Men det är inte du. Det är att en '
        'vanlig sula är slät nog för att bete sig som is så fort ytan blir våt, oavsett hur '
        'försiktig du är.</p>',

    '<p>Skydda kåpan medan den fortfarande är fin →</p>':
        '<p>Sluta halka på altanen →</p>',

    # ---------------------------------------------------------------- Punkt 2
    '2. En vaxning om året stoppar inte solen':
        '2. Du sparkar av dig skorna och går barfota istället',

    '<p>Handen på hjärtat: ingen spolar av utombordaren efter varje tur. På sin höjd blir det en avtorkning och lite vax eller polish någon gång per år, oftast inför sjösättningen. Sen hänger motorn där resten av säsongen och får klara sig själv. Under tiden torkar saltet in efter varje körning och solens UV-strålar jobbar på ytskiktet varje ljus timme, och de bryr sig inte om att kåpan fick vax i april. En omsorg per år mot hundratals dagar av väder är en ojämn match. Skillnaden mellan en kåpa i originalskick och en som åldras är inte hur ofta du putsar den. Det är hur många timmar den står exponerad.</p>':
        '<p>Du bestämmer dig för att strunta i skor helt. Barfota känns säkrare, tänker du, för då '
        'känner du åtminstone underlaget under fötterna. Men på våt betong och alger på bryggan ger '
        'huden ännu mindre <strong>friktion</strong> än en gammal gymnastiksko, och utan någon sula '
        'som kompenserar möter foten ytan helt oskyddad. Samma sak med de urtvättade joggingskorna '
        'från hallen, sulan är plan efter hundratals mil och ger inget extra <strong>grepp</strong> '
        'bara för att den sitter på foten. Sen tänker du att du nog bara var oförsiktig. Men det är '
        'inte du. Det är att varken bara fötter eller vardagsskor är gjorda för blött underlag.</p>',

    '<p>Ge motorn ett skydd som håller hela säsongen →</p>':
        '<p>Ge fötterna riktigt grepp →</p>',

    # ---------------------------------------------------------------- Punkt 3
    '3. Glans går att bevara. Inte att polera tillbaka.':
        '3. Det där ögonblicket går inte att ta tillbaka',

    '<p>Det här är det dolda misstaget. En smutsig kåpa förlåter, den blir fin igen med tvätt och vax. En blekt kåpa gör det inte. När solen väl brutit ner ytskiktet är glansen borta på riktigt, och inget polermedel i världen bygger upp det igen. Du står där en lördag med rubbing och trasa, lägger timmar på att gnugga, och får tillbaka en yta som är blank i vissa vinklar och matt i andra. Sen tänker du att du nog bara är dålig på att polera. Men det är inte du. Det är att polering aldrig kan återskapa ett ytskikt som redan är nedbrutet. Originalskick går att bevara, aldrig att återställa.</p>':
        '<p>Det tar en sekund. Foten glider vid poolkanten, du kastar ut armarna för att hålla '
        '<strong>balansen</strong> och landar med hela kroppen i vattnet, telefonen i fickan och '
        'allt. De som sitter vid grillbordet ser det hända och skrattar innan de hinner tänka sig '
        'för. Du kan byta om, torka telefonen och skratta med, men själva ögonblicket, det du '
        'snubblade i mitten av ett vanligt samtal, går inte att sudda ut. Det finns inget '
        '<strong>omtag</strong>. Sen tänker du att du nog borde ha koncentrerat dig bättre. Men det '
        'är inte du. Det är att ett halt underlag inte ger någon <strong>förvarning</strong> innan '
        'foten redan är på väg åt fel håll.</p>',

    '<p>Bevara glansen medan den finns kvar →</p>':
        '<p>Undvik nästa halkande steg →</p>',

    # ---------------------------------------------------------------- Punkt 4
    '4. Värdet försvinner inte på en dag. Det försvinner varje dag. (det här missar nästan alla)':
        '4. Det är inte engångshändelsen som kostar dig mest (det här missar nästan alla)',

    '<p>Det här är misstaget som kostar dig mest, inte på en gång utan varje dag. En dag i solen märks inte. En regnskur märks inte. Lite salt som torkar in märks inte. Men motorn hänger där ute dygnet runt, och det som inte syns på en dag blir fullt synligt efter några år: en kåpa som tappat glansen, plast som gulnat, detaljer med den där trötta grågamla tonen. Och den dag du ställer båten till försäljning står köparen precis där, vid motorn, och drar av tusenlappar i huvudet medan han tittar. Det är inte vädret som är dramatiskt. Det är summan av alla dagar du tänkte att det inte spelade någon roll.</p>':
        '<p>Det är inte den där gången du halkade till som egentligen kostar dig något. Det är alla '
        'gånger innan dess. Varje gång du ska ut i två minuter för att hämta något från trädgården '
        'och först snör fast ett par vanliga skor för säkerhets skull. Varje gång du går barfota '
        'istället och drar in <strong>gräs</strong> och jord över hela köksgolvet efteråt. Varje '
        'gång du tar omvägen runt den våta bryggan i stället för genvägen, eller helt enkelt låter '
        'bli att gå ut alls för att det känns onödigt krångligt. Sen tänker du att du nog bara är '
        'lite bekväm av dig. Men det är inte du. Det är att varje liten omväg och varje snörning '
        'summeras till en <strong>friktion</strong> du bär med dig hela sommaren.</p>',

    '<p>Behåll värdet till den dag du säljer →</p>':
        '<p>Slipp friktionen varje dag →</p>',

    # ---------------------------------------------------------------- Punkt 5
    '<strong>5. Ett billigt hölje är dyrare än inget</strong>':
        '<strong>5. Du köper de billigaste tofflorna i matbutikens korg</strong>',

    '<p>Många som väl bestämmer sig beställer reflexmässigt det billigaste som dyker upp. Det kommer hem tunt och fladdrigt, sömmarna släpper efter några blåsiga veckor, passformen är som en soppåse och efter första höstblåsten ligger det i vattnet bredvid bryggan. Efter tredje gången ligger det längst bak i stuvfacket bredvid alla andra prylar som "skulle lösa det". Du löste aldrig problemet, du betalade en femtiolapp för att bekräfta att det fanns. Ett hölje fungerar bara om det är byggt för sol, salt och säsong efter säsong av användning.</p>':
        '<p>Du står i kassakön och ser en hög med tunna skumtofflor för en femtiolapp och tänker att '
        'de duger. De känns mjuka i handen och priset är rätt. Men sulan är helt <strong>platt</strong>, '
        'utan mönster som kan leda undan vatten, så de blir precis lika hala som golvet under dig så '
        'fort de blir blöta. Efter några veckor i solen och saltvattnet ger formen efter, skummet '
        'plattas ut och tofflan vrider sig under foten vid varje steg. Sen tänker du att du nog bara '
        'valde fel modell. Men det är inte du. Det är att skum utan <strong>grepp</strong> löser '
        'precis noll av problemet, det bara ser ut som en lösning i butikshyllan.</p>',

    '<p>Se höljet i 420D Oxfordtyg → 299 kr</p>':
        '<p>Ja, jag vill ha mina för 349 kr →</p>',

    # ---------------------------------------------------------------- Lösningen
    'Så vad gör båtägarna som lyckas?':
        'Så vad gör de som slipper halka på altanen och bryggan hela sommaren?',

    '<p>De slutar skjuta upp det och ger motorn ett skydd som är gjort för just utombordare. Ett följsamt hölje med dragsko runt hela kanten: tätt nog att stänga ute sol, salt och regn, följsamt nog att sitta kvar även när det blåser på bryggan. På sommaren skyddar det vid bryggan mellan turerna. På vintern följer det med in i förvaringen och håller kåpan skyddad där också. Över kåpan, strama åt dragskon, klart. Tio sekunder, året runt.</p><p>&nbsp;</p><p>Bäverbutikens marina motorhölje är sytt i kraftigt 420D Oxfordtyg för att klara säsong efter säsong utan att tappa formen. Det passar utombordare från 6 till 250 hk och backas av 30 dagars nöjd-kund-garanti så du inte riskerar något. Skillnaden syns varje gång du drar av det: en kåpa i originalskick, en motor som ser omhändertagen ut och ett andrahandsvärde du slipper förhandla ner.</p>':
        '<p>Lösningen är inte att gå försiktigare, det är att byta ut sulan mot en som faktiskt är '
        'byggd för blött underlag. En tjock sula med ett grovt, däckliknande mönster leder undan '
        'vatten i stället för att glida på det, och ger dig ett fäste som håller oavsett om du står '
        'på trädäck, klippa eller poolkant. Ingen inkörningsperiod, inga snören att knyta, du kliver '
        'bara i den på två sekunder på väg ut genom dörren.</p><p>&nbsp;</p><p>Det är precis det '
        'Bäverbutikens strandtofflor för herr är gjorda för. De är formgjutna i mjuk, lätt EVA som '
        'torkar snabbt och sköljs rena på sekunder, med en tjock sula som dämpar varje steg och ett '
        'halkfritt mönster som greppar på blött underlag. De finns i storlek 36 till 47 och i svart, '
        'kaki eller vit, för 349 kr.</p>',

    '<p>Gör som dem → ta ett hölje för 299 kr</p>':
        '<p>Skaffa strandtofflorna för 349 kr →</p>',

    # ---------------------------------------------------------------- Ärlighetssektionen
    '<p>vi köpte in för mycket. Inför säsongen tog vi hem ett större parti motorhöljen än vi någonsin beställt, och nu står pallarna kvar på lagret medan sommaren rullar på. Istället för att låta dem samla damm gör vi det enkelt: 299 kr istället för ordinarie 367 kr, tills partiet är slut.</p><p>&nbsp;</p><p>Det är hela anledningen till priset. Ingen påhittad jätterabatt och ingen klocka som räknar ner. Vi har helt enkelt fler höljen än hyllplats, och din motor har mer nytta av ett av dem än vårt lager har.</p><p>&nbsp;</p><p>Och priset är ärligt åt andra hållet också: 367 kr är vad höljet kostar hos oss i vanliga fall. När partiet är slut går det tillbaka dit.</p>':
        '<p>vi råkade helt enkelt beställa in fler strandtofflor än vi behövde. Nu sitter vi med '
        'mer lager än vi vill ha, och därför säljer vi ut dem till ett lägre pris. Det är hela '
        'anledningen.</p><p>&nbsp;</p><p>Ingen påhittad jätterabatt och ingen klocka som räknar '
        'ner, det här handlar bara om ett lager vi vill bli av med. Och för att vara tydlig: det '
        'här är inte skyddsskor, och de är inte gjorda för att gå långa sträckor i. De är gjorda '
        'för att du ska slippa halka när du rör dig på blöta ytor nära vattnet.</p><p>&nbsp;</p>'
        '<p>420 kr är vad tofflorna kostar i vanliga fall, och när lagret är slut går priset '
        'tillbaka dit. Just nu, medan lagret räcker, får du dem för 349 kr, med 30 dagars '
        'nöjd-kund-garanti om de inte känns rätt.</p>',

    # ---------------------------------------------------------------- Riskavlastning
    '<p>Vill du ha ett är det bara att trycka på knappen här nedanför. Passar det inte din motor har du 30 dagar på dig att ångra köpet, så du riskerar ingenting. Men det gäller bara så länge lagret räcker.</p>':
        '<p>Tryck på knappen och beställ din storlek. Passar tofflorna inte som du tänkt dig har du '
        '30 dagar på dig att höra av dig, helt utan krångel. Storlek 36 till 47 finns i lager.</p>',

    '<p>Ja tack, ett hölje för 299 kr → 30 dagars garanti</p>':
        '<p>Prova för 349 kr med 30 dagars garanti →</p>',

    # ---------------------------------------------------------------- Hero-knapp
    '<p>Visa lagerrensningen → 299 kr</p>':
        '<p>Få strandtofflorna för 349 kr →</p>',
}
