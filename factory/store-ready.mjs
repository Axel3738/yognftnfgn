// store-ready.mjs — slutsteget som VA:ns "Store ready: <namn>" utlöser
// (KEDJAN.md, .claude/commands/ny-ops.md steg 10):
//
//   node factory/store-ready.mjs <butik-id> [--torr] [--guild <discord-server-id>]
//   node factory/ops.mjs <butik.yaml> <produkt.yaml …> --store-ready
//
// Tre delar, alla bokförs i butiksstaten (<butik>--_butik.json) under
// steget `store-ready`, och varje del som kräver en människa står som
// manuell — aldrig som gjord (regel 4: pixeln var skapad men WeTracked-
// kopplingen inte gjord, och rapporten sa "Pixeln är klar" — TankGuard
// 2026-09-08):
//
//   1. Recensionerna: app-CSV:n (originaldatum) ligger redan i
//      output/<produkt>/judgeme-app-import.csv från kedjans steg 15. Finns
//      butikens Judge.me-token i env (butik.judgeme.token_env) importeras
//      husets CSV via tools/judgeme-import.mjs; annars är uppladdningen
//      VA:ns klick i appen.
//   2. Pixeln + CAPI: brandets pixel i det GEMENSAMMA OPS-annonskontot
//      (meta-setup.mjs, återanvänds om den finns), CAPI-systemanvändaren får
//      pixeln. Pixel-id:t skrivs tillbaka i produktfilerna (meta.pixel_id).
//      WeTracked-kopplingen och CAPI-tokenen är VA:ns klick.
//   3. Discord: kanalerna byggs i servern VA:n skapat (--guild <id>, boten kan
//      inte skapa servrar). Utan --guild: manuell med auktoriseringslänken
//      som instruktion.
//
// Kräver: META_ACCESS_TOKEN (pixeln), DISCORD_BOT_TOKEN (kanalerna),
// <butik.judgeme.token_env> (API-import). Saknas en nyckel blir DEN delen
// manuell — de andra körs.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { lasState, skrivState, markeraKlart, markeraManuell, BUTIKSNYCKEL, lasArbetstemaNamn } from './state.mjs';
import { produktHandle } from './build-store.mjs';
import { skapaPixel, hamtaPixlar, hittaBrandpixel, tilldelaCapiAnvandare, OPS_ANNONSKONTO, OPS_BUSINESS } from './meta-setup.mjs';
import { byggKanalplan, byggServer } from './discord.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

// Produktfilerna som hör till butiken: statefilerna <butik>--<produkt>.json
// pekar ut id:na, produktfilerna slås upp på produkt.id (filnamnet är inte
// alltid id:t — tacklebay-spohallaren.yaml bär id fiskespohallare-4-pack).
export function produktfilerFor(butikId, { stateMapp = join(FACTORY_ROT, 'state'), produktMapp = join(FACTORY_ROT, 'produkter') } = {}) {
  const ids = existsSync(stateMapp)
    ? readdirSync(stateMapp)
        .filter((f) => f.startsWith(`${butikId}--`) && f.endsWith('.json') && !f.endsWith(`--${BUTIKSNYCKEL}.json`))
        .map((f) => f.slice(butikId.length + 2, -5))
    : [];
  const ut = [];
  if (!existsSync(produktMapp)) return ut;
  for (const fil of readdirSync(produktMapp).filter((f) => f.endsWith('.yaml'))) {
    const sokvag = join(produktMapp, fil);
    let rad = null;
    try {
      rad = lasYaml(readFileSync(sokvag, 'utf8'));
    } catch {
      continue;
    }
    if (ids.includes(String(rad?.produkt?.id))) ut.push({ fil: sokvag, produkt: rad });
  }
  return ut;
}

// Ren logik: pixel-id + annonskonto in i produktfilens text (meta:-blocket).
// Rör bara raderna som finns; saknas raden lämnas filen orörd (aldrig gissa
// var i filen den ska in).
export function skrivPixelIText(yamlText, pixelId, kontoId = OPS_ANNONSKONTO) {
  let ut = String(yamlText);
  ut = ut.replace(/^(\s*ad_account_id:\s*)("[^"]*"|'[^']*'|[^\n#]*)/m, (_, p) => `${p}"${kontoId}"`);
  ut = ut.replace(/^(\s*pixel_id:\s*)("[^"]*"|'[^']*'|[^\n#]*)/m, (_, p) => `${p}"${pixelId}"`);
  return ut;
}

// Ren logik: sammanfattar de tre delarna till { gjort, vantar } — det som
// bokförs i state och skrivs i chatten.
export function bedomStoreReady({ recensioner = [], pixel = null, capi = null, discord = null, sidor = [] } = {}) {
  const gjort = [];
  const vantar = [];
  for (const r of recensioner) {
    if (r.viaApi) gjort.push(`recensioner ${r.produkt}: ${r.antal ?? '?'} importerade via API`);
    else vantar.push(`recensioner ${r.produkt}: ${r.manuell}`);
  }
  if (pixel?.id) {
    gjort.push(`pixel "${pixel.namn}" ${pixel.id} i OPS-kontot ${OPS_ANNONSKONTO}${pixel.redan ? ' (fanns redan)' : ' (skapad)'}`);
    vantar.push(`WeTracked: klistra in pixel-id ${pixel.id} (VA:ns klick)`);
    if (capi?.tilldelad) gjort.push(`CAPI-användaren "${capi.anvandare}" har pixeln`);
    else vantar.push(`CAPI: ${capi?.varfor ?? 'tilldelningen gjordes inte'} — VA:n hämtar tokenen i Events Manager → Data sources → pixeln → Settings → Conversions API → Generate access token → WeTracked`);
    // Sidan är människans jobb — men bara tills den FINNS. Står id:t i
    // produktfilen är den skapad, och att fortsätta lista den som väntande
    // är samma sorts falska rapport som regel 4 finns för (FjordCover
    // 2026-09-12: sidan skapad och verifierad i businessens owned_pages,
    // ändå stod "Meta-sidan skapar VA:n" kvar i staten).
    const utanSida = sidor.filter((s) => !s.pageId);
    if (sidor.length === 0 || utanSida.length > 0) {
      vantar.push('Meta-sidan skapar VA:n i Business Manager (API:t kan inte)');
    } else {
      gjort.push(
        `Meta-sidan finns: ${sidor.map((s) => `${s.pageId} (${s.produkt})`).join(', ')} — skapad för hand, id:t står i produktfilen`
      );
    }
  } else {
    vantar.push(`pixel: ${pixel?.manuell ?? 'inte skapad'}`);
  }
  if (discord?.guildId && discord?.kanaler) {
    gjort.push(`Discord: ${discord.kanaler.length} kanaler i server ${discord.guildId}${discord.invite ? ` (${discord.invite})` : ''}`);
    vantar.push(discord.redigerare ? `Discord: bjud in ${discord.redigerare} till servern och #konton` : 'Discord: ingen redigerare i standby-listan än — plockas för hand');
  } else {
    vantar.push(`Discord: ${discord?.manuell ?? 'kanalerna inte byggda'}`);
  }
  return { gjort, vantar };
}

// ---------------------------------------------------------------------------

async function importeraRecensioner(butik, produkter, { torr }) {
  const tokenEnv = butik.judgeme?.token_env ?? 'JUDGEME_API_TOKEN';
  const shopDomain = text(butik.judgeme?.shop_domain) ?? process.env.JUDGEME_SHOP_DOMAIN ?? null;
  const ut = [];
  for (const { produkt } of produkter) {
    const id = produkt.produkt.id;
    const mapp = join(FACTORY_ROT, 'output', id);
    const appfil = join(mapp, 'judgeme-app-import.csv');
    const husfil = join(mapp, 'judgeme-import.csv');
    const klick = `ladda upp output/${id}/judgeme-app-import.csv i Judge.me → Settings → Import reviews → Import from apps → Judge.me format → Import`;
    if (!existsSync(appfil) && !existsSync(husfil)) {
      ut.push({ produkt: id, viaApi: false, manuell: `ingen recensionsfil i output/${id}/ — kör kedjans recensionssteg (--igen recensioner)` });
      continue;
    }
    if (!process.env[tokenEnv] || !shopDomain) {
      ut.push({ produkt: id, viaApi: false, manuell: `ingen Judge.me-token (env ${tokenEnv}) — ${klick}` });
      continue;
    }
    if (torr) {
      ut.push({ produkt: id, viaApi: false, manuell: `(torr) skulle importera ${husfil} via API mot ${shopDomain}` });
      continue;
    }
    const statefil = join(FACTORY_ROT, 'state', `${butik.butik.id}--${id}.json`);
    const state = existsSync(statefil) ? lasState(butik.butik.id, id) : null;
    const produktId = state?.steg?.produkt?.id ? String(state.steg.produkt.id).split('/').pop() : null;
    const arg = [
      join(FACTORY_ROT, '..', 'tools', 'judgeme-import.mjs'),
      existsSync(husfil) ? husfil : appfil,
      ...(produktId ? ['--product-id', produktId] : ['--product-handle', produktHandle(produkt), '--store-url', `https://${shopDomain}`]),
      '--shop-domain', shopDomain,
      '--token-env', tokenEnv,
    ];
    const kor = spawnSync(process.execPath, arg, { encoding: 'utf8' });
    if (kor.status !== 0) {
      ut.push({ produkt: id, viaApi: false, manuell: `API-importen felade: ${(kor.stderr || kor.stdout).slice(0, 200)} — ${klick}` });
      continue;
    }
    const antal = Number((kor.stdout.match(/(\d+)\s+(?:recensioner|reviews)/i) ?? [])[1]) || null;
    ut.push({ produkt: id, viaApi: true, antal, rapport: kor.stdout.trim().split('\n').slice(-2).join(' · ') });
  }
  return ut;
}

async function sakerstallPixel(butik, produkter, { torr }) {
  const brand = butik.butik.brand;
  if (!process.env.META_ACCESS_TOKEN) return { pixel: { manuell: 'META_ACCESS_TOKEN saknas i miljön — pixeln skapas när nyckeln finns (--igen store-ready)' }, capi: null };
  if (torr) return { pixel: { manuell: `(torr) pixel "${brand}" i OPS-kontot ${OPS_ANNONSKONTO} skulle skapas/återanvändas` }, capi: null };

  // Spärr: produktfilen får aldrig peka på ett annat konto än det gemensamma.
  for (const { produkt, fil } of produkter) {
    const konto = text(String(produkt.meta?.ad_account_id ?? ''));
    if (konto && konto !== OPS_ANNONSKONTO) {
      throw new Error(`${fil}: meta.ad_account_id ${konto} är inte OPS-kontot ${OPS_ANNONSKONTO} — stoppar. Fel konto kostar riktiga pengar.`);
    }
  }
  const befintliga = await hamtaPixlar(OPS_ANNONSKONTO);
  const redan = hittaBrandpixel(befintliga, brand);
  const pixel = redan ?? (await skapaPixel(brand, { kontoId: OPS_ANNONSKONTO, foretagId: OPS_BUSINESS }));
  const capi = await tilldelaCapiAnvandare(pixel.id).catch((e) => ({ tilldelad: false, varfor: e.message }));

  // Skriv tillbaka i produktfilerna — inget får bo bara i chatten.
  const skrivna = [];
  for (const { fil } of produkter) {
    const fore = readFileSync(fil, 'utf8');
    const efter = skrivPixelIText(fore, pixel.id);
    if (efter !== fore) {
      writeFileSync(fil, efter);
      skrivna.push(fil);
    }
  }
  return { pixel: { id: pixel.id, namn: brand, redan: Boolean(redan), skrivna }, capi };
}

async function byggDiscord(butik, { torr, guildId }) {
  const brand = butik.butik.brand;
  const plan = byggKanalplan(brand);
  if (!process.env.DISCORD_BOT_TOKEN) return { manuell: `DISCORD_BOT_TOKEN saknas — kanalerna (${plan.kategorier.flatMap((k) => k.kanaler.map((c) => `#${c.namn}`)).join(', ')}) byggs när nyckeln finns` };
  if (!guildId) {
    return { manuell: `boten kan inte skapa servrar — VA:n skapar "${plan.servernamn}" i Discord, auktoriserar boten (node factory/discord.mjs ${join('factory', 'butiker', `${butik.butik.id}.yaml`)} skriver ut länken) och kör sen node factory/store-ready.mjs ${butik.butik.id} --guild <server-id>` };
  }
  if (torr) return { manuell: `(torr) ${plan.kategorier.flatMap((k) => k.kanaler).length} kanaler skulle byggas i server ${guildId}` };
  const ikon = join(FACTORY_ROT, 'output', butik.butik.id, 'logga.png');
  const r = await byggServer(brand, guildId, existsSync(ikon) ? ikon : null);
  return { guildId: r.guildId, kanaler: r.kanaler, invite: r.invite ?? null, ikon: r.ikon ?? null, redigerare: null };
}

// Hela slutsteget. → { gjort, vantar, delar }
export async function storeReady(butikId, { torr = false, guildId = null } = {}) {
  const butiksfil = join(FACTORY_ROT, 'butiker', `${butikId}.yaml`);
  if (!existsSync(butiksfil)) throw new Error(`Ingen butiksfil: factory/butiker/${butikId}.yaml`);
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const produkter = produktfilerFor(butikId);
  if (produkter.length === 0) throw new Error(`Inga produkter i state för ${butikId} — kör factory/ops.mjs först (store-ready är slutsteget, inte första).`);

  console.log(`\nStore ready · ${butik.butik.brand} · ${produkter.map((x) => x.produkt.produkt.id).join(' + ')}${torr ? ' · TORR' : ''}\n`);

  const recensioner = await importeraRecensioner(butik, produkter, { torr });
  for (const r of recensioner) console.log(r.viaApi ? `✅ recensioner ${r.produkt}: ${r.rapport}` : `🖐 recensioner ${r.produkt}: ${r.manuell}`);

  let pixel = null;
  let capi = null;
  try {
    ({ pixel, capi } = await sakerstallPixel(butik, produkter, { torr }));
  } catch (e) {
    pixel = { manuell: `pixeln gick inte att skapa: ${e.message}` };
  }
  console.log(pixel?.id ? `✅ pixel ${pixel.id} ("${pixel.namn}")${pixel.redan ? ' fanns redan' : ' skapad'}` : `🖐 pixel: ${pixel?.manuell}`);
  if (capi) console.log(capi.tilldelad ? `✅ CAPI-användaren "${capi.anvandare}" har pixeln` : `🖐 CAPI: ${capi.varfor}`);

  let discord = null;
  try {
    discord = await byggDiscord(butik, { torr, guildId });
  } catch (e) {
    discord = { manuell: `Discord felade: ${e.message}` };
  }
  console.log(discord?.kanaler ? `✅ Discord: ${discord.kanaler.length} kanaler${discord.invite ? ` — ${discord.invite}` : ''}` : `🖐 Discord: ${discord?.manuell}`);

  const bedomning = bedomStoreReady({
    recensioner,
    pixel,
    capi,
    discord,
    sidor: produkter.map(({ produkt: rad }) => ({ produkt: rad?.produkt?.id, pageId: text(rad?.meta?.page_id) })),
  });

  // Bokför i butiksstaten (aldrig i torrläge). Steget är "klart" bara när
  // pixeln finns och kanalerna är byggda; annars manuellt med listan.
  if (!torr) {
    const state = lasState(butikId, BUTIKSNYCKEL);
    const extra = { pixelId: pixel?.id ?? null, discordGuild: discord?.guildId ?? null, recensioner: recensioner.map((r) => ({ produkt: r.produkt, viaApi: r.viaApi })), vantar: bedomning.vantar };
    if (pixel?.id && discord?.kanaler) markeraKlart(state, 'store-ready', extra);
    else markeraManuell(state, 'store-ready', bedomning.vantar.join(' · '), extra);
    skrivState(state);
  }

  const temaNamn = lasArbetstemaNamn(lasState(butikId, BUTIKSNYCKEL));
  console.log('\nGJORT AV MIG:');
  for (const g of bedomning.gjort) console.log(`   • ${g}`);
  if (bedomning.gjort.length === 0) console.log('   (inget)');
  console.log('\nVÄNTAR PÅ EN MÄNNISKA:');
  for (const v of bedomning.vantar) console.log(`   • ${v}`);
  if (temaNamn) console.log(`   • Publicera temat "${temaNamn}": Online Store → Themes → ${temaNamn} → Publish (VA:ns klick)`);
  console.log('');
  return { ...bedomning, delar: { recensioner, pixel, capi, discord } };
}

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const guildId = arg.includes('--guild') ? arg[arg.indexOf('--guild') + 1] : null;
  const torr = arg.includes('--torr') || arg.includes('--dry') || arg.includes('--dry-run');
  const butikId = arg.find((a, i) => !a.startsWith('--') && arg[i - 1] !== '--guild');
  if (!butikId) {
    console.error('Användning: node factory/store-ready.mjs <butik-id> [--torr] [--guild <discord-server-id>]');
    process.exit(1);
  }
  await storeReady(butikId, { torr, guildId });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
