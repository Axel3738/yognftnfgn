// no-heimguard-se-video.config.mjs — HeimGuard SE, byggd av /ny-annonser 2026-09-08.
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
  videoDir: '../.scratch/heimguard/se/video',
  adsets: [
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - SP', // SP — social proof
      ads: [
        { name: "HeimGuard_SP_2", file: "HeimGuard_SP_2.mp4",
          copy: { message: "\"Bra kamera och smidigt att kunna följa det som händer.\"\nDet är vad en av våra kunder skriver om kameran.\n✅ Två linser som täcker hela tomten\n✅ AI som bara larmar när det gäller\n✅ Direkt notis i mobilen var du än är\n✅ 30 dagars nöjd-kund-garanti\n10 recensioner. Alla fem stjärnor.\nLäs vad de skriver – köp när du är redo.",
                  headline: "10 recensioner. Alla fem stjärnor.", description: "10 recensioner, alla fem stjärnor. 30 dagars öppet köp." } },
        { name: "HeimGuard_SP_3", file: "HeimGuard_SP_3.mp4",
          copy: { message: "\"Bra kamera och smidigt att kunna följa det som händer.\"\nDet är vad en av våra kunder skriver om kameran.\n✅ Två linser som täcker hela tomten\n✅ AI som bara larmar när det gäller\n✅ Direkt notis i mobilen var du än är\n✅ 30 dagars nöjd-kund-garanti\n10 recensioner. Alla fem stjärnor.\nLäs vad de skriver – köp när du är redo.",
                  headline: "10 recensioner. Alla fem stjärnor.", description: "10 recensioner, alla fem stjärnor. 30 dagars öppet köp." } },
        { name: "HeimGuard_SP_11_H1", file: "HeimGuard_SP_11_H1.mp4",
          copy: { message: "Katten går förbi. Tyst.\nEn främling går förbi. Larm.\nTvå linser täcker hela tomten. AI larmar bara på människor.\nTio recensioner, fem stjärnor. Kunderna nämner tydlig bild och enkel installation.\n799 kr i dag (jämförpris 1 000 kr) – 30 dagars öppet köp.",
                  headline: "Larmar på främlingen. Tyst på katten.", description: "" } },
        { name: "HeimGuard_SP_1", file: "HeimGuard_SP_1.mp4",
          copy: { message: "\"Bra kamera och smidigt att kunna följa det som händer.\"\nDet är vad en av våra kunder skriver om kameran.\n✅ Två linser som täcker hela tomten\n✅ AI som bara larmar när det gäller\n✅ Direkt notis i mobilen var du än är\n✅ 30 dagars nöjd-kund-garanti\n10 recensioner. Alla fem stjärnor.\nLäs vad de skriver – köp när du är redo.",
                  headline: "10 recensioner. Alla fem stjärnor.", description: "10 recensioner, alla fem stjärnor. 30 dagars öppet köp." } },
        { name: "HeimGuard_SP_4_H1", file: "HeimGuard_SP_4_H1.mp4",
          copy: { message: "Larmet gick 03:12 i natt. Skärmen visade en katt — inte en inbrottstjuv.\nAI:n skiljer människa från djur, så larmet betyder faktiskt något.\n799 kr istället för 1 000 kr. 30 dagars öppet köp. Handla nu.",
                  headline: "Larmet gick 03:12 i natt", description: "" } },
        { name: "HeimGuard_SP_9_H1", file: "HeimGuard_SP_9_H1.mp4",
          copy: { message: "Direkt notis i mobilen, var du än är.\nTvå linser. AI-spårning som bara larmar när det gäller.\n799 kr i dag. 30 dagars öppet köp.",
                  headline: "Två linser. AI-spårning. 799 kr.", description: "30 dagars öppet köp om det inte känns rätt." } },
        { name: "HeimGuard_SP_6_H1", file: "HeimGuard_SP_6_H1.mp4",
          copy: { message: "Tio recensioner. Fem stjärnor, alla.\nAI:n skiljer människa från djur – färre falsklarm, mer sömn.\n799 kr idag (jämförpris 1 000 kr). 30 dagars öppet köp.",
                  headline: "Tio recensioner. Fem stjärnor, alla.", description: "" } },
        { name: "HeimGuard_SP_13_H1", file: "HeimGuard_SP_13_H1.mp4",
          copy: { message: "\"Kameran fungerar bra och bilden är tydlig.\" – recension hos oss.\nTvå linser ser hela tomten samtidigt, ingen blind vinkel.\n799 kr (ord. 1 000 kr) – 30 dagars nöjd-kund-garanti.",
                  headline: "Bilden är tydlig. Hela tomten.", description: "" } },
        { name: "HeimGuard_SP_12_H1", file: "HeimGuard_SP_12_H1.mp4",
          copy: { message: "\"Smidig kamera och bra bild. Rekommenderas.\" – recension hos oss.\nTvå linser täcker hela tomten. AI larmar bara på människor – aldrig på hunden.\nDirekt notis i mobilen, var du än är.\n799 kr. 30 dagars garanti.",
                  headline: "799 kr – spara 201 kr", description: "" } },
        { name: "HeimGuard_SP_8_H1", file: "HeimGuard_SP_8_H1.mp4",
          copy: { message: "Den ser skillnad på människa och husdjur.\nDu larmas bara när det gäller – inte varje gång katten går förbi.\nTvå linser täcker hela tomten. Notis direkt i mobilen.\n799 kr, jämförpris 1 000 kr. 30 dagars öppet köp.",
                  headline: "Ser skillnad på människa och husdjur", description: "" } },
        { name: "HeimGuard_SP_5_H1", file: "HeimGuard_SP_5_H1.mp4",
          copy: { message: "Jag slutade kolla dörren innan jag la mig.\nKameran ser 355° runt huset och skiljer människor från djur.\n799 kr, 30 dagars garanti om jag ångrar mig.",
                  headline: "Jag sover bättre sen kameran kom upp", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - CS', // CS — erbjudande
      ads: [
        { name: "HeimGuard_CS_3", file: "HeimGuard_CS_3.mp4",
          copy: { message: "799 kr i stället för 1 000 kr – 20 % rabatt.\n✅ Fri frakt i hela Sverige\n✅ Klarna – få den nu, betala sen\n✅ 30 dagars öppet köp\nKöp nu, eller läs mer och bestäm i lugn och ro.",
                  headline: "799 kr i stället för 1 000 kr", description: "Ordinarie pris 1 000 kr. Fri frakt i hela Sverige." } },
        { name: "HeimGuard_CS_2", file: "HeimGuard_CS_2.mp4",
          copy: { message: "799 kr i stället för 1 000 kr – 20 % rabatt.\n✅ Fri frakt i hela Sverige\n✅ Klarna – få den nu, betala sen\n✅ 30 dagars öppet köp\nKöp nu, eller läs mer och bestäm i lugn och ro.",
                  headline: "799 kr i stället för 1 000 kr", description: "Ordinarie pris 1 000 kr. Fri frakt i hela Sverige." } },
        { name: "HeimGuard_CS_1", file: "HeimGuard_CS_1.mp4",
          copy: { message: "799 kr i stället för 1 000 kr – 20 % rabatt.\n✅ Fri frakt i hela Sverige\n✅ Klarna – få den nu, betala sen\n✅ 30 dagars öppet köp\nKöp nu, eller läs mer och bestäm i lugn och ro.",
                  headline: "799 kr i stället för 1 000 kr", description: "Ordinarie pris 1 000 kr. Fri frakt i hela Sverige." } },
        { name: "HeimGuard_CS_6_H1", file: "HeimGuard_CS_6_H1.mp4",
          copy: { message: "Tre personer i bild. En hund bredvid dem.\nKameran larmar för personerna – inte för hunden.\nTvå linser. 355 grader. Hela tomten.\n799 kr i stället för 1 000 kr.",
                  headline: "Larmar för personer. Inte för hunden.", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - AU', // AU — auktoritet
      ads: [
        { name: "HeimGuard_AU_1_H1", file: "HeimGuard_AU_1_H1.mp4",
          copy: { message: "Två linser, 355° täckning, AI som skiljer människa från djur.\nKopplas till wifi 2,4 och 5 GHz — inte mobilnät.\n799 kr istället för 1 000 kr. 30 dagars öppet köp.",
                  headline: "Teknikern visar de två linserna", description: "" } },
        { name: "HeimGuard_AU_2_H1", file: "HeimGuard_AU_2_H1.mp4",
          copy: { message: "3 saker jag kollar innan jag sätter upp en övervakningskamera:\n1. 355° täckning från dubbellinsen – inga döda vinklar i trädgården.\n2. AI:n skiljer människa från husdjur, inte bara rörelse.\n3. Notis direkt i telefonen, inte nästa dag.\n799 kr, jämförpris 1 000 kr. 30 dagars garanti.",
                  headline: "355° täckning. AI ser skillnaden.", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - RI', // RI — notisen
      ads: [
        { name: "HeimGuard_RI_1_H1", file: "HeimGuard_RI_1_H1.mp4",
          copy: { message: "En kamera som bara larmar visar aldrig vad som hände.\nTvå linser täcker 355° runt huset — du ser hela bilden, inte en gissning.\n799 kr. 30 dagars nöjd-kund-garanti.",
                  headline: "Se vad som faktiskt hände vid dörren", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - CO', // CO — jämförelse
      ads: [
        { name: "HeimGuard_CO_1_H1", file: "HeimGuard_CO_1_H1.mp4",
          copy: { message: "Den gamla kameran filmade ett hörn, i evighet.\nDen här vrider sig 355° och följer rörelsen dit den går.\n799 kr (ord. 1 000 kr). 30 dagars garanti.",
                  headline: "Min gamla kamera mot den här", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - PD', // PD — problem/lösning
      ads: [
        { name: "HeimGuard_PD_3", file: "HeimGuard_PD_3.mp4",
          copy: { message: "Ett ljud på tomten klockan tre på natten.\nÄr det katten – eller något annat?\n✅ Två linser, 355° täckning – inga döda vinklar\n✅ AI som skiljer människor från katter och grenar\n✅ Larmar bara på riktiga hot – inga falsklarm\n✅ Direkt notis i mobilen var du än är\nSluta gissa vad som händer hemma. Se det.",
                  headline: "Se hela tomten – utan falsklarm på katten", description: "AI-spårning som skiljer människor från katter och grenar." } },
        { name: "HeimGuard_PD_2", file: "HeimGuard_PD_2.mp4",
          copy: { message: "Ett ljud på tomten klockan tre på natten.\nÄr det katten – eller något annat?\n✅ Två linser, 355° täckning – inga döda vinklar\n✅ AI som skiljer människor från katter och grenar\n✅ Larmar bara på riktiga hot – inga falsklarm\n✅ Direkt notis i mobilen var du än är\nSluta gissa vad som händer hemma. Se det.",
                  headline: "Se hela tomten – utan falsklarm på katten", description: "AI-spårning som skiljer människor från katter och grenar." } },
        { name: "HeimGuard_PD_1", file: "HeimGuard_PD_1.mp4",
          copy: { message: "Ett ljud på tomten klockan tre på natten.\nÄr det katten – eller något annat?\n✅ Två linser, 355° täckning – inga döda vinklar\n✅ AI som skiljer människor från katter och grenar\n✅ Larmar bara på riktiga hot – inga falsklarm\n✅ Direkt notis i mobilen var du än är\nSluta gissa vad som händer hemma. Se det.",
                  headline: "Se hela tomten – utan falsklarm på katten", description: "AI-spårning som skiljer människor från katter och grenar." } },
      ],
    },
    {
      name: 'HEIMGUARD_SE_Övervakningskameran - G', // G — present
      ads: [
        { name: "HeimGuard_G_3", file: "HeimGuard_G_3.mp4",
          copy: { message: "Jag visste precis vad han skulle bli glad för.\nHan har pratat om en kamera vid garaget i månader. Jag lyssnade – och beställde en åt honom.\n✅ Ingen krånglig installation – bara app, wifi, klart\n✅ En present han faktiskt behöver\n✅ 30 dagars öppet köp om det inte känns rätt\nHan kollade garaget samma kväll som paketet kom.\nGe bort trygghet i dag.",
                  headline: "En present han faktiskt behöver", description: "Ingen installation. Bara app, wifi, klart." } },
        { name: "HeimGuard_G_1", file: "HeimGuard_G_1.mp4",
          copy: { message: "Jag visste precis vad han skulle bli glad för.\nHan har pratat om en kamera vid garaget i månader. Jag lyssnade – och beställde en åt honom.\n✅ Ingen krånglig installation – bara app, wifi, klart\n✅ En present han faktiskt behöver\n✅ 30 dagars öppet köp om det inte känns rätt\nHan kollade garaget samma kväll som paketet kom.\nGe bort trygghet i dag.",
                  headline: "En present han faktiskt behöver", description: "Ingen installation. Bara app, wifi, klart." } },
        { name: "HeimGuard_G_2", file: "HeimGuard_G_2.mp4",
          copy: { message: "Jag visste precis vad han skulle bli glad för.\nHan har pratat om en kamera vid garaget i månader. Jag lyssnade – och beställde en åt honom.\n✅ Ingen krånglig installation – bara app, wifi, klart\n✅ En present han faktiskt behöver\n✅ 30 dagars öppet köp om det inte känns rätt\nHan kollade garaget samma kväll som paketet kom.\nGe bort trygghet i dag.",
                  headline: "En present han faktiskt behöver", description: "Ingen installation. Bara app, wifi, klart." } },
      ],
    },
  ],
};
