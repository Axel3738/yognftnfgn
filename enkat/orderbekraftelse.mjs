#!/usr/bin/env node
// enkat/orderbekraftelse.mjs — Matstrumpors svenska orderbekräftelse med enkätrutan.
//
//   node enkat/orderbekraftelse.mjs     läser mallen i Shopify (bara läsning),
//                                       lägger rutan före sidfoten och skriver
//                                       enkat/cowork/orderbekraftelse.liquid
//
// Shopify har inget API för notismallarnas huvudspråk: filen klistras in av
// Cowork i admin (enkat/cowork/1-lansering.txt). Mallen är Shopifys egen
// standardmall (mätt 2026-10-01: 218 886 tecken, inga egna markörer), så den
// enda ändringen är rutan. De 13 andra språken rörs inte: de bär Shopifys egna
// översättningar och får ingen enkät i fas 1.

import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';
import { lasKonfig, infogaRuta } from './enkat.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const k = lasKonfig();

async function main() {
  const klient = await skapaKlient(lasButik(k.butik));
  const d = await klient.graphql(
    `query enkatOb($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key value locale digest } } }`,
    { id: k.orderbekraftelse_id }
  );
  const innehall = d.translatableResource?.translatableContent ?? [];
  const body = innehall.find((c) => c.key === 'body_html');
  const titel = innehall.find((c) => c.key === 'title');
  if (!body?.value) throw new Error(`Hittar inte orderbekräftelsens body (${k.orderbekraftelse_id}).`);
  if (body.locale !== 'sv') throw new Error(`Mallens huvudspråk är ${body.locale}, väntat sv.`);
  const ny = infogaRuta(body.value, k);
  mkdirSync(join(HAR, 'cowork'), { recursive: true });
  const fil = join(HAR, 'cowork', 'orderbekraftelse.liquid');
  writeFileSync(fil, ny);
  const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);
  console.log(`Orderbekräftelsen "${titel?.value}" i Shopify: ${body.value.length} tecken, sha ${sha(body.value)}`);
  console.log(`Med enkätrutan: ${ny.length} tecken (+${ny.length - body.value.length}), sha ${sha(ny)}`);
  console.log(`Skriven: enkat/cowork/orderbekraftelse.liquid`);
}

main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
