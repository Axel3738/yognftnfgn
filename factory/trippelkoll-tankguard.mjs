import { säkerställProxy, api, alla, spend } from '/home/user/yognftnfgn/tools/meta-lib.mjs';
import { writeFileSync } from 'node:fs';
säkerställProxy();
const K='120248995235740172', SIDA='1399193996606775', PIXEL='2196132151319625';
const LÄNK='https://tankguard.se/products/tankoverdraget';

const k=await api(K,{params:{fields:'id,name,status,effective_status,objective,daily_budget,bid_strategy'}});
console.log('KAMPANJ');
console.log(`  ${k.name}`);
console.log(`  status ${k.status}/${k.effective_status} · budget ${Number(k.daily_budget)/100} kr/dag · ${k.objective} · ${k.bid_strategy}`);
console.log(`  spend ${await spend(K)} kr`);

const adsets=await alla(`${K}/adsets`,{fields:'id,name,status,effective_status,daily_budget,promoted_object,targeting'},50);
console.log(`\nADSETS (${adsets.length})`);
let adsetFel=0;
for(const a of adsets.sort((x,y)=>x.name.localeCompare(y.name))){
  const pixelOk=a.promoted_object?.pixel_id===PIXEL, geoOk=JSON.stringify(a.targeting?.geo_locations?.countries)==='["SE"]';
  const pausOk=a.status==='PAUSED', cboOk=!a.daily_budget;
  if(!(pixelOk&&geoOk&&pausOk&&cboOk)) adsetFel++;
  console.log(`  ${pixelOk&&geoOk&&pausOk&&cboOk?'✅':'❌'} ${a.name.padEnd(40)} ${a.status} pixel${pixelOk?'✓':'✗'} geo${geoOk?'✓':'✗'} CBO${cboOk?'✓':'✗'}`);
}

const ads=await alla(`${K}/ads`,{fields:'id,name,status,effective_status,adset_id,creative{object_story_spec}'},100);
console.log(`\nANNONSER (${ads.length})`);
let fel=0; const rader=[];
for(const a of ads.sort((x,y)=>x.name.localeCompare(y.name))){
  const s=a.creative?.object_story_spec||{}, v=s.video_data||{}, l=s.link_data||{};
  const cta=v.call_to_action||l.call_to_action||{};
  const länk=cta.value?.link||l.link||null;
  const sidaOk=s.page_id===SIDA, länkOk=länk===LÄNK, pausOk=a.status==='PAUSED';
  const media = v.video_id?('video '+v.video_id):(l.image_hash?('bild '+l.image_hash.slice(0,8)):'?');
  if(!(sidaOk&&länkOk&&pausOk)) fel++;
  console.log(`  ${sidaOk&&länkOk&&pausOk?'✅':'❌'} ${a.name.padEnd(22)} ${a.status.padEnd(7)} sida${sidaOk?'✓':'✗'} länk${länkOk?'✓':'✗'} ${media}`);
  rader.push({namn:a.name,id:a.id,status:a.status,adset_id:a.adset_id,sida:s.page_id,länk,media});
}
writeFileSync('/home/user/yognftnfgn/factory/output/tankguard/byggda-annonser.json',JSON.stringify({datum:'2026-09-09',kampanj:k.name,kampanj_id:K,annonser:rader},null,2));
console.log(`\nSUMMA: ${adsets.length} adsets (${adsetFel} fel) · ${ads.length} annonser (${fel} fel)`);
console.log(fel===0&&adsetFel===0 ? '✅ Allt stämmer mot butikens konfig.' : '❌ Något stämmer inte — rätta och läs om.');
