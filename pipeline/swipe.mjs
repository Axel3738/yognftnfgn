import sharp from 'sharp';
import axios from 'axios';

const W=1080, H=1350;
const COL={ bg0:'#2A0E1E', bg1:'#120A12', ember:'#FF6A2C', pink:'#FF4D8D', cream:'#F6EFEA', smoke:'#C9BCC4' };
const FONT="'DejaVu Sans','Liberation Sans',sans-serif";
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function wrap(t,max){const w=t.split(/\s+/);const L=[];let l='';for(const x of w){if((l+' '+x).trim().length>max&&l){L.push(l.trim());l=x;}else l=(l+' '+x).trim();}if(l)L.push(l.trim());return L;}

const IMG='https://cdn.shopify.com/s/files/1/0947/0174/8548/files/IMG_4362.jpg?v=1777697274';
let prod=null;
try{const r=await axios.get(IMG,{responseType:'arraybuffer',validateStatus:()=>true});if(r.status===200)prod=Buffer.from(r.data);}catch(e){console.log('img fail',e.message);}

const body="Tillverkningskostnaden på de borstlösa motorerna i Mastern har just höjts kraftigt. Vi har hållit vårt pris så länge vi kunnat — men vi kan inte hålla det längre. Har du väntat på att testa Mastern, grillborsten som rengör gallret på 60 sekunder utan lösa borststrån, så är det nu.";
const bodyLines=wrap(body,46);
const bodyStart=330, bodyLead=44;
const bodyTs=bodyLines.map((l,i)=>`<tspan x="${W/2}" y="${bodyStart+i*bodyLead}">${esc(l)}</tspan>`).join('');
let y=bodyStart+bodyLines.length*bodyLead+66;
const offer1Y=y, offer2Y=y+56, signY=y+112;

// produktkort (rundade hörn) längst ner
const cardW=560, cardTop=H-500;
let prodLayer=null, cardH=0;
if(prod){
  const img=await sharp(prod).resize(cardW,440,{fit:'cover',position:'centre'}).png().toBuffer();
  const m=await sharp(img).metadata(); cardH=m.height;
  const mask=Buffer.from(`<svg width="${m.width}" height="${m.height}"><rect width="${m.width}" height="${m.height}" rx="28" ry="28"/></svg>`);
  const rounded=await sharp(img).composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
  prodLayer={input:rounded,top:cardTop,left:Math.round((W-m.width)/2)};
}

const svg=Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" xml:space="preserve">
 <defs>
  <radialGradient id="bg" cx="50%" cy="34%" r="85%"><stop offset="0" stop-color="${COL.bg0}"/><stop offset="1" stop-color="${COL.bg1}"/></radialGradient>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${COL.pink}" stop-opacity="0.4"/><stop offset="1" stop-color="${COL.pink}" stop-opacity="0"/></radialGradient>
 </defs>
 <rect width="${W}" height="${H}" fill="url(#bg)"/>
 <ellipse cx="${W/2}" cy="${cardTop+220}" rx="440" ry="360" fill="url(#glow)"/>
 <text text-anchor="middle" x="${W/2}" y="160" font-family="${FONT}" font-weight="800" font-size="76" letter-spacing="1"><tspan fill="${COL.cream}">VI SÄGER</tspan><tspan fill="${COL.ember}"> HEJDÅ</tspan><tspan fill="${COL.cream}">…</tspan></text>
 <text text-anchor="middle" font-family="${FONT}" font-weight="400" font-size="33" fill="${COL.smoke}">${bodyTs}</text>
 <text text-anchor="middle" x="${W/2}" y="${offer1Y}" font-family="${FONT}" font-weight="800" font-size="50" fill="${COL.ember}">40 % RABATT</text>
 <text text-anchor="middle" x="${W/2}" y="${offer2Y}" font-family="${FONT}" font-weight="800" font-size="42" fill="${COL.ember}">+ POLÉRHUVUD PÅ KÖPET</text>
 <text text-anchor="middle" x="${W/2}" y="${signY}" font-family="${FONT}" font-weight="700" font-size="29" fill="${COL.cream}">Med kärlek, Team Grillkliniken</text>
</svg>`);

const base=await sharp({create:{width:W,height:H,channels:4,background:COL.bg1}}).png().toBuffer();
const layers=[{input:svg,top:0,left:0}];
if(prodLayer)layers.push(prodLayer);
await sharp(base).composite(layers).png().toFile('output/swipe_clearskin_GRILL_mastern_v1.png');
console.log('klar. offer y=',offer1Y,'cardTop=',cardTop);
