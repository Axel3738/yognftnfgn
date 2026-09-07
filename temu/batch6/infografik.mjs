// Måttinfografiker med sharp + SVG. Låsta räkneord ur temu/batch6/README.md.
import sharp from 'sharp';
const S=process.argv[2] || '/tmp/b6'; // utmapp: <S>/galleri/
const F='DejaVu Sans, sans-serif';
const esc=(s)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
async function bygg({bild, ut, rubrik, rader, bildBox, W=1200, H=1000, sprak}) {
  // bild till vänster, textkolumn till höger
  const img = await sharp(bild).resize(bildBox.w, bildBox.h, {fit:'contain', background:'#ffffff'}).png().toBuffer();
  const tx = bildBox.x + bildBox.w + 40;
  let y = 150;
  const linjer = rader.map((r)=>{ const s=`<text x="${tx}" y="${y}" font-family="${F}" font-size="38" fill="#1a1a1a">${esc(r.v)}</text><text x="${tx}" y="${y+40}" font-family="${F}" font-size="26" fill="#555">${esc(r.l)}</text>`; y+=115; return s; }).join('');
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <text x="60" y="80" font-family="${F}" font-size="44" font-weight="bold" fill="#1a1a1a">${esc(rubrik)}</text>
    <line x1="60" y1="100" x2="${W-60}" y2="100" stroke="#ddd" stroke-width="2"/>
    ${linjer}</svg>`;
  await sharp(Buffer.from(svg)).composite([{input: img, left: bildBox.x, top: bildBox.y}]).jpeg({quality:92}).toFile(ut);
  console.log('skrev', ut);
}
const T = {
  sv: { staket: { rubrik:'Staketstolpslagare – 2-pack', rader:[{v:'80 cm',l:'per bygel'},{v:'40 cm',l:'spett ner i marken'},{v:'40 cm',l:'bygel upp längs stolpen'},{v:'8 skruvar · 6 bultar · 6 muttrar',l:'ingår i förpackningen'},{v:'Skiftnyckel + insexnyckel',l:'ingår'},{v:'Lackerat stål',l:'rostskyddat för att stå ute'}] },
        klyv: { rubrik:'Tändvedsklyv i gjutjärn', rader:[{v:'27 cm',l:'höjd'},{v:'12,5 cm',l:'innerdiameter i ringen'},{v:'13,7 cm',l:'ytterdiameter'},{v:'14,5 cm',l:'gjuten fot'},{v:'0,72 kg',l:'gjutjärn genom hela klyven'},{v:'Ingen yxa i handen',l:'slå ovanifrån med klubba'}] } },
  no: { staket: { rubrik:'Gjerdestolpebøyle – 2-pk', rader:[{v:'80 cm',l:'per bøyle'},{v:'40 cm',l:'spyd ned i bakken'},{v:'40 cm',l:'bøyle opp langs stolpen'},{v:'8 skruer · 6 bolter · 6 muttere',l:'følger med i pakken'},{v:'Skiftenøkkel + unbrakonøkkel',l:'følger med'},{v:'Lakkert stål',l:'rustbeskyttet for å stå ute'}] },
        klyv: { rubrik:'Tennvedkløyver i støpejern', rader:[{v:'27 cm',l:'høyde'},{v:'12,5 cm',l:'innvendig diameter i ringen'},{v:'13,7 cm',l:'utvendig diameter'},{v:'14,5 cm',l:'støpt fot'},{v:'0,72 kg',l:'støpejern gjennom hele kløyveren'},{v:'Ingen øks i hånden',l:'slå ovenfra med klubbe'}] } },
};
for (const sprak of ['sv','no']) {
  await bygg({ bild:'/home/user/yognftnfgn/temu/batch6/bilder/staketstolps-reparationsbygel-med-marksp.jpg', ut:`${S}/galleri/staketbygel-info-${sprak}.jpg`, ...T[sprak].staket, bildBox:{x:40,y:130,w:480,h:820} });
  await bygg({ bild:'/home/user/yognftnfgn/temu/batch6/bilder/tandvedsklyv-i-gjutjarn-ring-kil.jpg', ut:`${S}/galleri/vedklyv-info-${sprak}.jpg`, ...T[sprak].klyv, bildBox:{x:40,y:130,w:480,h:820} });
}
