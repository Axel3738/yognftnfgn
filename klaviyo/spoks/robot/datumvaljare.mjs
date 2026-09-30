// Spoks datumväljare ("Välj datum och tid"): månadspilar utan text, dagknappar, fälten Timme
// och Minut. Markören hoppar till nästa fält efter två siffror, så värdena läses efteråt ur
// fälten, aldrig ur fokus. Mätt 2026-09-30 i 1440×900.
import { nod, klicka, semantik } from './webblasare.mjs';

export const MANAD = { 'jan.': 1, 'feb.': 2, 'mars': 3, 'apr.': 4, 'maj': 5, 'juni': 6, 'juli': 7, 'aug.': 8, 'sep.': 9, 'okt.': 10, 'nov.': 11, 'dec.': 12 };

// Hur många klick på "nästa månad" från det väljaren visar till målet.
export function manadssteg(visad, ar, datum) {
  const [ma, mm] = datum.split('-').map(Number);
  if (!MANAD[visad]) throw new Error(`Okänd månad i datumväljaren: "${visad}".`);
  return (ma - ar) * 12 + (mm - MANAD[visad]);
}

async function visadManad(page) {
  await semantik(page);
  return page.evaluate((namn) => {
    for (const e of document.querySelectorAll('flt-semantics')) {
      const m = (e.textContent ?? '').trim().match(/^(\S+)\s+(\d{4})$/);
      if (m && namn.includes(m[1])) { const b = e.getBoundingClientRect(); return { manad: m[1], ar: Number(m[2]), y: b.y + b.height / 2 }; }
    }
    return null;
  }, Object.keys(MANAD));
}

async function pilar(page, y) {
  return page.evaluate((y) => [...document.querySelectorAll('flt-semantics[role="button"]')]
    .filter((e) => !(e.textContent ?? '').trim() && !(e.getAttribute('aria-label') ?? '').trim())
    .map((e) => e.getBoundingClientRect())
    .filter((b) => Math.abs(b.y + b.height / 2 - y) < 20 && b.width < 80)
    .map((b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 }))
    .sort((a, b) => a.x - b.x), y);
}

async function skrivTid(page, tim, min) {
  const t = await nod(page, 'Timme');
  const m = await nod(page, 'Minut');
  if (!t || !m) throw new Error('Hittar inte fälten Timme och Minut.');
  const bt = await t.boundingBox();
  const bm = await m.boundingBox();
  const topp = bt.y + bt.height + 6;
  for (const [b, v] of [[bt, tim], [bm, min]]) {
    await page.mouse.click(b.x + 80, topp + 19);
    await page.waitForTimeout(400);
    await page.keyboard.press('End');
    for (let i = 0; i < 3; i++) { await page.keyboard.press('Backspace'); await page.waitForTimeout(150); }
    for (const siffra of v) { await page.keyboard.type(siffra); await page.waitForTimeout(250); }
    await page.waitForTimeout(300);
  }
  const rubrik = await nod(page, 'Välj datum och tid');
  const br = await rubrik.boundingBox();
  await page.mouse.click(br.x + br.width / 2, br.y + br.height / 2);
  await page.waitForTimeout(500);
  const varden = await page.evaluate((topp) => [...document.querySelectorAll('input')]
    .map((e) => ({ v: e.value, b: e.getBoundingClientRect() }))
    .filter((o) => Math.abs(o.b.y - topp) < 12)
    .sort((a, b) => a.b.x - b.b.x).map((o) => o.v), topp);
  if (varden.join(':') !== `${tim}:${min}`) throw new Error(`Fälten visar ${varden.join(':') || 'inget'}, inte ${tim}:${min}.`);
}

// datum 'YYYY-MM-DD', tid 'HH:MM', i arbetsytans tid (Stockholm). Trycker inte på Tillämpa.
export async function valjDatumTid(page, datum, tid) {
  const [, , dag] = datum.split('-').map(Number);
  const [tim, min] = tid.split(':');
  let vy = await visadManad(page);
  if (!vy) throw new Error('Datumväljaren är inte öppen.');
  const steg = manadssteg(vy.manad, vy.ar, datum);
  if (steg < 0) throw new Error(`Datumväljaren står på ${vy.manad} ${vy.ar}, efter ${datum}.`);
  for (let i = 0; i < steg; i++) {
    const p = await pilar(page, vy.y);
    if (p.length < 2) throw new Error('Hittar inte pilen till nästa månad.');
    await page.mouse.click(p[p.length - 1].x, p[p.length - 1].y);
    await page.waitForTimeout(900);
    vy = await visadManad(page);
  }
  if (manadssteg(vy.manad, vy.ar, datum) !== 0) throw new Error(`Datumväljaren visar ${vy.manad} ${vy.ar}, inte ${datum}.`);
  await klicka(page, String(dag), { roll: 'button' });
  await skrivTid(page, tim, min);
  return `${vy.manad} ${vy.ar}, dag ${dag}, ${tim}:${min}`;
}
