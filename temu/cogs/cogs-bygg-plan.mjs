// Konsoliderar alla kostnadskällor → /tmp/fix/cogs-plan.json
// Prioritet: 1) exakt landsdata  2) SE-kostnad × landfaktor  3) SE-butikens cogs × landfaktor
import { readFileSync, writeFileSync } from 'node:fs';
const FX = { se: 9.4698, no: 9.2989, dk: 6.3960, fi: 0.856026, uk: 0.73331 };
const LF = { se: 1, no: 1.133, dk: 1.148, fi: 1.272, uk: 0.952 }; // median ur 43 landsuppdelade offertrader
const ark = JSON.parse(readFileSync('/tmp/fix/ark-resultat.json', 'utf8'));
const b5 = JSON.parse(readFileSync('/tmp/fix/cogs-batch5.json', 'utf8'));
const karta = JSON.parse(readFileSync('/tmp/fix/cogs-karta.json', 'utf8'));

// usdPerGid: { gid: {SE,NO,DK,FI,UK} }, usdPerSku: { sku: {...} }, usdGenerell: { gid|sku: usd }
const perGid = {}, perSku = {}, generellGid = {}, generellSku = {}, kallnamn = {};
for (const [gid, v] of Object.entries(b5)) { perGid[gid] = v.usd; kallnamn[gid] = 'offert 5.1 (landsuppdelad)'; }

for (const a of ark) {
  const d = a.data; if (!d) continue;
  for (const r of d.rader) {
    const ant = r.anteckning || '';
    if (/Qty 2|Qty 3/.test(ant)) continue;            // bara styckkostnaden
    const skuM = /SKU\s+([A-ZÅÄÖ0-9-]{4,})/.exec(ant);
    const sku = skuM?.[1];
    const gid = r.goodsId;
    const lands = { SE: r.kostnadSE, NO: r.kostnadNO, DK: r.kostnadDK, FI: r.kostnadFI, UK: r.kostnadUK };
    const harLand = Object.values(lands).some((x) => x != null);
    if (harLand) {
      if (gid && !perGid[gid]) { perGid[gid] = lands; kallnamn[gid] = `${a.ark} (landsuppdelad)`; }
      if (sku && !perSku[sku]) { perSku[sku] = lands; kallnamn[sku] = `${a.ark} (landsuppdelad)`; }
    } else if (r.kostnadGenerell != null) {
      if (gid && generellGid[gid] == null) { generellGid[gid] = r.kostnadGenerell; kallnamn[gid] ??= `${a.ark} (SE-bas)`; }
      if (sku && generellSku[sku] == null) { generellSku[sku] = r.kostnadGenerell; kallnamn[sku] ??= `${a.ark} (SE-bas)`; }
    }
  }
}
console.log(`Kostnadskällor: ${Object.keys(perGid).length} gid landsuppdelat, ${Object.keys(perSku).length} sku landsuppdelat, ${Object.keys(generellGid).length} gid SE-bas, ${Object.keys(generellSku).length} sku SE-bas`);

const rundaAv = (v, land) => land === 'fi' || land === 'uk' ? +v.toFixed(2) : +v.toFixed(2);
const plan = { se: {}, no: {}, dk: {}, fi: {}, uk: {} };
const alla = new Set([...Object.keys(karta.se), ...Object.keys(karta.no), ...Object.keys(karta.dk), ...Object.keys(karta.fi), ...Object.keys(karta.uk)]);
// alla sku-baser vi känner till ur butikerna + källorna
for (const nyckel of new Set([...Object.keys(perGid), ...Object.keys(perSku), ...Object.keys(generellGid), ...Object.keys(generellSku), ...alla])) {
  const gid = /^\d{10,}$/.test(nyckel) ? nyckel : null;
  const skuBas = gid ? `TEMU-${gid}` : nyckel;
  const gidUrSku = /^TEMU-(\d+)/.exec(skuBas)?.[1];
  const g = gid || gidUrSku;
  const land5 = (g && perGid[g]) || perSku[nyckel] || null;
  const seBas = (g && generellGid[g]) ?? generellSku[nyckel] ?? null;
  for (const land of ['se', 'no', 'dk', 'fi', 'uk']) {
    const L = land.toUpperCase();
    let usd = null, kalla = null;
    if (land5?.[L] != null) { usd = land5[L]; kalla = kallnamn[g] || kallnamn[nyckel] || 'offert (landsuppdelad)'; }
    else if (land5?.SE != null) { usd = land5.SE * LF[land]; kalla = `${kallnamn[g] || kallnamn[nyckel]} SE-rad × landfaktor ${LF[land]}`; }
    else if (seBas != null) { usd = seBas * LF[land]; kalla = `${kallnamn[g] || kallnamn[nyckel]} × landfaktor ${LF[land]}`; }
    if (usd == null) continue;
    plan[land][skuBas] = { belopp: rundaAv(usd * FX[land], land), usd: +usd.toFixed(2), kalla };
  }
}
for (const [land, v] of Object.entries(plan)) console.log(`  plan ${land}: ${Object.keys(v).length} sku-baser`);
writeFileSync('/tmp/fix/cogs-plan.json', JSON.stringify(plan, null, 1));
