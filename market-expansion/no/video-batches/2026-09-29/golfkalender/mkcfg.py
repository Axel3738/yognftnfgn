import json,re
o=json.load(open('adcopy/no.json'))
o['SP']['headline']='Golfgaven med 24 luker'
json.dump(o,open('adcopy/no.json','w'),ensure_ascii=False,indent=1)
bad=re.compile(r'[äöÄÖ]|\b(och|är|inte|kronor|beställ\w*|luckor?|julklapp\w*|sverige|svensk\w*|golfare|idag|också|bäver\w*|nästan|slutsåld|bare i dag|utsolgt|favoritt\w*|549|719|170)\b|–|—',re.I)
for k in ['CS','G','PD','SP']:
    t='\n'.join(o[k].values())
    if bad.search(t): print('FEL',k,bad.search(t).group())
    open(f'adcopy/ADCOPY_NO_{k}.txt','w').write(f"PRIMÆRTEKST\n{o[k]['message']}\n\nOVERSKRIFT\n{o[k]['headline']}\n\nBESKRIVELSE\n{o[k]['description']}\n")
ads=[]
for k in ['PD','SP','CS','G']:
    c=o[k]
    rows=',\n'.join("        { name: 'Golfkalender_NO_%s_1_H%d', file: 'NO_golfkalender_%s_1_H%d.mp4' }"%(k,h,k,h) for h in (1,2,3))
    ads.append("""    {
      name: 'Golfkalender NO - %s',
      copy: {
        message: %s,
        headline: %s,
        description: %s,
      },
      ads: [
%s,
      ],
    }"""%(k,json.dumps(c['message'],ensure_ascii=False),json.dumps(c['headline'],ensure_ascii=False),json.dumps(c['description'],ensure_ascii=False),rows))
cfg="""// Kampanj: Golfkalender NO — videobatch 2026-09-29 (rutinen /translate-no, röst ElevenLabs).
// Norsk copy av sonnet (claude-sonnet-5 via API, Agent-verktyget fanns inte) ur svenska
// ADCOPY-docsen i Drive, verifierad mot beverbutikken.no: pris 619 kr (før 809 = 23 %%),
// 30 dagers åpent kjøp OK. Overifierat i källan (bara i dag, nästan slutsåld, [X] golfare,
// kundcitat, stjärnor, favorit) borttaget.
// COGS: Kalenderkungen Batch, NORWAY Qty 1 = 18,58 EUR × 10,8367 = 201,35 NOK ⇒ BE-ROAS 1,48.
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Golfkalender NO | BE-ROAS 1,48 | 2026-09-29',
  link: 'https://beverbutikken.no/products/golf-adventskalender-24-golftilbehor',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-29/golfkalender/final', // relativt pipeline/
  adsets: [
%s,
  ],
};
"""%(',\n'.join(ads))
open('/home/user/yognftnfgn/pipeline/waves/no-golfkalender-video.config.mjs','w').write(cfg)
