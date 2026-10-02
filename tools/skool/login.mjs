// Loggar in på Skool med SKOOL_EMAIL/SKOOL_PASSWORD och sparar sessionen i .state/.
import { öppna, GRUPP } from './lib.mjs';

const email = process.env.SKOOL_EMAIL, pass = process.env.SKOOL_PASSWORD;
if (!email || !pass) { console.error('SKOOL_EMAIL/SKOOL_PASSWORD saknas i miljön'); process.exit(2); }

const s = await öppna({ kräverSession: false });
await s.page.goto('https://www.skool.com/login', { waitUntil: 'domcontentloaded' });
await s.page.waitForTimeout(2500);
if (s.page.url().includes('/login')) {
  await s.page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await s.page.locator('input[type="password"]').first().fill(pass);
  await Promise.all([
    s.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {}),
    s.page.keyboard.press('Enter'),
  ]);
  await s.page.waitForTimeout(4000);
}
const url = s.page.url();
await s.stäng();
if (url.includes('/login')) { console.error('inloggningen gick inte igenom:', url); process.exit(1); }
console.log('inloggad:', url, '— gruppen', GRUPP);
