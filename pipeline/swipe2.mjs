import sharp from 'sharp';
import axios from 'axios';

const W=1080,H=1350;
const COL={bg:'#0B0B0D',ember:'#FF6A2C',cream:'#F6EFEA',smoke:'#CFC7C2'};
const FONT="'DejaVu Sans','Liberation Sans',sans-serif";
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function wrap(t,max){const w=t.split(/\s+/);const L=[];let l='';for(const x of w){if((l+' '+x).trim().length>max&&l){L.push(l.trim());l=x;}else l=(l+' '+x).trim();}if(l)L.push(l.trim());return L;}

const IMG='https://cdn.shopify.com/s/files/1/0947/0174/8548/files/IMG_4362.jpg?v=1777697274';
let prod=null;try{const r=await axios.get(IMG,{responseType:'arraybuffer',validateStatus:()=>true});if(r.status===200)prod=Buffer.from(r.data);}catch(e){}

const paras=[
"Stigande komponentkostnader är på väg att förändra allt — inklusive priset på Mastern. Priset på de borstlösa motorerna vi bygger Mastern med har nyligen gått upp kraftigt.",
"Vi har hållit vårt pris så länge vi kunnat. Men eftersom kostnaderna fortsätter stiga kommer även våra att göra det — och dagens pris kommer inte finnas kvar särskilt länge.",
"Har du spanat in Mastern — grillborsten som rengör gallret på 60 sekunder utan lösa borststrån — är det här det perfekta tillfället att säkra dagens pris innan höjningen."
];
const x=60; let y=250; const lead=40, size=29;
let tspans='';
for(const p of paras){ for(const ln of wrap(p,52)){ tspans+=`<tspan x="${x}" y="${y}">${esc(ln)}</tspan>`; y+=lead; } y+=26; }
const offerY=y+30, signY=offerY+90;

let prodLayer=null;
if(prod){
  const img=await sharp(prod).resize(420,420,{fit:'cover',position:'centre'}).png().toBuffer();
  const m=await sharp(img).metadata();
  const mask=Buffer.from(`<svg width="${m.width}" height="${m.height}"><rect width="${m.width}" height="${m.height}" rx="26" ry="26"/></svg>`);
  const rounded=await sharp(img).composite([{input:mask,blend:'dest-in'}])
    .rotate(-7,{background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  const rm=await sharp(rounded).metadata();
  prodLayer={input:rounded,top:H-rm.height-70,left:W-rm.width-50};
}

const svg=Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" xml:space="preserve">
 <rect width="${W}" height="${H}" fill="${COL.bg}"/>
 <text x="${x}" y="130" font-family="${FONT}" font-weight="800" font-size="66" fill="${COL.cream}" letter-spacing="1">VI SÄGER HEJDÅ…</text>
 <text font-family="${FONT}" font-weight="400" font-size="${size}" fill="${COL.smoke}">${tspans}</text>
 <text x="${x}" y="${offerY}" font-family="${FONT}" font-weight="800" font-size="38" fill="${COL.ember}">45% RABATT + POLÉRHUVUD PÅ KÖPET</text>
 <text x="${x}" y="${offerY+44}" font-family="${FONT}" font-weight="700" font-size="30" fill="${COL.smoke}">— medan du fortfarande kan.</text>
 <text x="${x}" y="${signY+40}" font-family="${FONT}" font-weight="700" font-size="28" fill="${COL.cream}">Med kärlek, Team Grillkliniken</text>
</svg>`);
const base=await sharp({create:{width:W,height:H,channels:4,background:COL.bg}}).png().toBuffer();
const layers=[{input:svg,top:0,left:0}]; if(prodLayer)layers.push(prodLayer);
await sharp(base).composite(layers).png().toFile('output/swipe_texttung_GRILL_mastern_v1.png');
console.log('klar. offerY=',offerY,'signY=',signY);
