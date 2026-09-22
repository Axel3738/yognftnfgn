// Isolerar den tysta döden i ops-leveranskon.mjs: tre körningar 2026-09-21 slutade
// med exit 0, tom stdout och inget fel, alla på raden efter
// "Läser kontot 1107817401910319 (Magiborsten UK) för US …".
// Skriptet gör BARA den läsningen, sida för sida, och skriver ut var den tar slut.
import { säkerställProxy } from '../../../../tools/meta-lib.mjs';

säkerställProxy();

process.on('unhandledRejection', (e) => { console.error('UNHANDLED REJECTION:', e); process.exit(9); });
process.on('uncaughtException', (e) => { console.error('UNCAUGHT:', e); process.exit(8); });
process.on('beforeExit', (k) => console.error(`beforeExit ${k} — händelsekön tom, inget kvar att vänta på`));
process.on('exit', (k) => console.error(`exit ${k}`));

const KONTO = process.argv[2] ?? '1107817401910319';
const token = process.env.META_ACCESS_TOKEN;
if (!token) { console.error('✗ META_ACCESS_TOKEN saknas'); process.exit(1); }

let url = `https://graph.facebook.com/v21.0/act_${KONTO}/ads?fields=id,name&limit=500&access_token=${token}`;
let sida = 0;
let rader = 0;
while (url) {
  sida += 1;
  const t0 = Date.now();
  const svar = await fetch(url);
  const text = await svar.text();
  let j;
  try { j = JSON.parse(text); } catch {
    console.error(`sida ${sida}: svar gick inte att tolka (${svar.status}), ${text.length} tecken: ${text.slice(0, 300)}`);
    process.exit(7);
  }
  if (j.error) {
    console.error(`sida ${sida}: Meta-fel kod ${j.error.code}/${j.error.error_subcode ?? '-'}: ${j.error.message}`);
    process.exit(6);
  }
  rader += (j.data ?? []).length;
  console.error(`sida ${sida}: ${(j.data ?? []).length} rader (totalt ${rader}) på ${Date.now() - t0} ms · nästa: ${j.paging?.next ? 'ja' : 'nej'}`);
  url = j.paging?.next ?? null;
  if (sida > 200) { console.error('över 200 sidor — avbryter, det är inte normalt'); break; }
}
console.error(`KLART: ${rader} annonser i act_${KONTO} på ${sida} sidor`);
