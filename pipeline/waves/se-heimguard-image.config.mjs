// se-heimguard-image.config.mjs — HeimGuard SE, byggd av /ny-annonser 2026-09-08.
//
// Källa: Bäverbutikens ACTIVE-annonser i "Övervakningskameran | BE ROAS 1.57"
// (MagiBorsten 1867947880635861). Samma bevisade creatives, ommärkta för
// HeimGuard: egen sida, egen pixel, egen produktsida, egen copy.
// ⚠️ MÅLET är MagiBorsten DK 915422744950975 — OPS Factorys gemensamma konto.
// Kontot heter DK men bär alla OPS-butiker och kontots valuta är SEK.
// Förväxla ALDRIG med MagiBorsten 1867947880635861 (Bäverbutiken).
//
// Priset 799/1 000 kr är IDENTISKT i källan och hos HeimGuard (läst ur
// heimguard.se/products/overvakningskameran.json 2026-09-08) — inga pristal
// har därför ändrats. Det som ändrats i copyn: Bäverbutikens fraktgräns
// "över 300 kr" (HeimGuard har fri frakt utan gräns) och påhittad social
// proof ("tusentals hushåll", citat ingen kund sagt) → butikens tio riktiga
// femstjärniga recensioner. Copyn skriven av copy-subagent (sonnet) mot
// docs/copy-regler.md, tre-frågorstestet redovisat i
// factory/output/overvakningskameran/brand-rapport.md.
//
// BE-ROAS 2,11 = 799 / (799/1,25 − 261). Butikskonfigen säger moms_i_pris:
// true och produktsidan säger "Inklusive moms", så marginalen räknas efter
// moms. ⚠️ Bäverbutiken säljer UTAN moms — kopiera aldrig dess tal hit.
// Utan moms i priset vore BE-ROAS 1,49. Bekräfta med Axel före skalning.
//
// Allt föds PAUSED — VA:n granskar och sätter ACTIVE.
export default {
  act: 'act_915422744950975', // MagiBorsten DK = OPS Factory (SEK)
  page: '1262406533629248',   // HeimGuard (BM MagiBorsten, owned_page)
  pixel: '1125401473242596',  // HeimGuard-pixeln, verifierad avfyrad 2026-09-09
  country: 'SE',
  campaignName: 'HEIMGUARD_SE_Övervakningskameran | BE-ROAS 2,11 | 2026-09-08',
  link: 'https://heimguard.se/products/overvakningskameran',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  adsets: [
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - SP', // SP — social proof
      ads: [
        { adName: "HeimGuard_SP_2_1", img: "HeimGuard_SP_2_1.jpg",
          copy: { message: "\"Bra kamera och smidigt att kunna följa det som händer.\"\nDet är vad en av våra kunder skriver om kameran.\n✅ Två linser som täcker hela tomten\n✅ AI som bara larmar när det gäller\n✅ Direkt notis i mobilen var du än är\n✅ 30 dagars nöjd-kund-garanti\n10 recensioner. Alla fem stjärnor.\nLäs vad de skriver – köp när du är redo.",
                  headline: "", description: "" } },
        { adName: "HeimGuard_SP_7_1", img: "HeimGuard_SP_7_1.jpg",
          copy: { message: "Ljudet som väckte dig syns nu på skärmen – inte bara i mörkret.\nAI-spårningen skiljer människa från katt – färre falsklarm.\n799 kr. 30 dagars garanti.",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - BOF', // BOF — garanti/trygghet
      ads: [
        { adName: "HeimGuard_BOF_2_1", img: "HeimGuard_BOF_2_1.jpg",
          copy: { message: "30 dagars öppet köp. Inte nöjd? Pengarna tillbaka.\nFri frakt i hela Sverige.\n799 kr i dag, betala senare med Klarna.",
                  headline: "", description: "" } },
        { adName: "HeimGuard_BOF_1_1", img: "HeimGuard_BOF_1_1.jpg",
          copy: { message: "799 kr i stället för 1 000 kr. Kameran har två linser och AI som skiljer människa från husdjur.",
                  headline: "", description: "" } },
        { adName: "HeimGuard_BOF_3_1", img: "HeimGuard_BOF_3_1.jpg",
          copy: { message: "Inte nöjd? Skicka tillbaka kameran inom 30 dagar – du får hela summan tillbaka.",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - CS', // CS — erbjudande
      ads: [
        { adName: "HeimGuard_CS_4_1", img: "HeimGuard_CS_4_1.jpg",
          copy: { message: "1 000 kr blir 799 kr — ingen kod, inget krångel.\nFri frakt i hela Sverige, och Klarna om du vill dela upp.\n30 dagars garanti om den inte känns rätt.",
                  headline: "", description: "" } },
        { adName: "HeimGuard_CS_2_1", img: "HeimGuard_CS_2_1.jpg",
          copy: { message: "799 kr i stället för 1 000 kr – 20 % rabatt.\n✅ Fri frakt i hela Sverige\n✅ Klarna – få den nu, betala sen\n✅ 30 dagars öppet köp\nKöp nu, eller läs mer och bestäm i lugn och ro.",
                  headline: "", description: "" } },
        { adName: "HeimGuard_CS_5_1", img: "HeimGuard_CS_5_1.jpg",
          copy: { message: "799 kr i stället för 1 000 kr.\nSer skillnad på människa och husdjur – larmar bara när det gäller.\nKlarna, fri frakt och 30 dagars öppet köp.\nTvå linser täcker 355° runt huset.",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - RI', // RI — notisen
      ads: [
        { adName: "HeimGuard_RI_2_1", img: "HeimGuard_RI_2_1.jpg",
          copy: { message: "Notisen kommer innan du hinner undra.\nDubbellinsen och AI-spårningen ser det ögat missar.\n799 kr (jämförpris 1 000 kr). 30 dagars öppet köp.",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - CO', // CO — jämförelse
      ads: [
        { adName: "HeimGuard_CO_2_1", img: "HeimGuard_CO_2_1.jpg",
          copy: { message: "En fast kamera filmar samma hörn i evighet.\nDen här vrider sig 355° och följer rörelsen dit den går.\n799 kr (ord. 1 000 kr). 30 dagars garanti.",
                  headline: "", description: "" } },
        { adName: "HeimGuard_CO_3_1", img: "HeimGuard_CO_3_1.jpg",
          copy: { message: "Gammal kamera mot AI-kamera. Se skillnaden själv.\nTvå linser, 355° täckning · Ser skillnad på människa och husdjur · 30 dagars garanti.\nTesta det i din egen trädgård.",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - LI', // LI — listan
      ads: [
        { adName: "HeimGuard_LI_1_1", img: "HeimGuard_LI_1_1.jpg",
          copy: { message: "De flesta kameror klarar en eller två av punkterna i bilden.\nDen här har dubbellins, AI-spårning, notis, väderskydd och garanti — samtidigt.\n799 kr (ord. 1 000 kr).",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - PD', // PD — problem/lösning
      ads: [
        { adName: "HeimGuard_PD_2_1", img: "HeimGuard_PD_2_1.jpg",
          copy: { message: "Ett ljud på tomten klockan tre på natten.\nÄr det katten – eller något annat?\n✅ Två linser, 355° täckning – inga döda vinklar\n✅ AI som skiljer människor från katter och grenar\n✅ Larmar bara på riktiga hot – inga falsklarm\n✅ Direkt notis i mobilen, var du än är\nSluta gissa vad som händer hemma. Se det.\nBeställ din i dag.",
                  headline: "", description: "" } },
        { adName: "HeimGuard_PD_4_1", img: "HeimGuard_PD_4_1.jpg",
          copy: { message: "En lins för dagsljus, en för mörker – samma skärpa dag och natt.\n355° täckning betyder att den vrider sig dit rörelsen är, inte tvärtom.\n799 kr, jämförpris 1 000 kr. 30 dagars öppet köp.",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - G', // G — present
      ads: [
        { adName: "HeimGuard_G_2_1", img: "HeimGuard_G_2_1.jpg",
          copy: { message: "Jag visste precis vad han skulle bli glad för.\nHan har pratat om en kamera vid garaget i månader. Jag lyssnade – och beställde en åt honom.\n✅ Ingen krånglig installation – bara app, wifi, klart\n✅ En present han faktiskt behöver\n✅ 30 dagars nöjd-kund-garanti\nHan blev glad när han öppnade paketet. Det är den bästa känslan – att ge något som verkligen betyder något.\nGe bort trygghet idag.",
                  headline: "", description: "" } },
      ],
    },
  ],
};
