// krymp-bild.cjs — krymper hero-bilder till 640 px JPEG via headless Chromium (ingen PIL/sharp i miljön).
//   NODE_PATH=$(npm root -g) node krymp-bild.cjs <in.jpg> <ut.jpg> [bredd=640] [kvalitet=0.78]
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [inp, out, w = '640', q = '0.78'] = process.argv.slice(2);
  const b64 = fs.readFileSync(inp).toString('base64');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const data = await page.evaluate(async ({ b64, w, q }) => {
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + b64;
    await img.decode();
    const scale = Math.min(1, w / img.naturalWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', q);
  }, { b64, w: Number(w), q: Number(q) });
  fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  await browser.close();
  console.log(out, fs.statSync(out).size, 'bytes');
})();
