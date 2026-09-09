// Registrerar en butiks översättningar mot Shopify.
//
//   node factory/oversatt-butik.mjs factory/oversattningar/<butik>-<locale>.mjs [--dry]
//
// Produkter och metafält matchas på NYCKEL (title, body_html, opf.benefits …).
// Tema-JSON och menyer matchas på VÄRDE: nycklarna där är hashade per sektion
// (`sections.<hash>.settings.heading`) och går inte att skriva i förväg.
// Värdematchningen gör dessutom att en ändrad startsida inte tyst tappar sina
// översättningar — paret finns kvar så länge källtexten gör det.
//
// Allt som INTE översätts skrivs ut. En halvöversatt butik är värre än en
// osvensk: kunden ser en norsk sida med svenska stycken och litar inte på den.

import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { laddaEnv } from './env.mjs';
import { graphql, hamtaProduktViaHandle, hamtaUtkastTema, hamtaMeny } from './shopify.mjs';
import { hamtaOversattbara, registrera } from './marknad.mjs';

// Metafältens gid:er — de är EGNA översättbara resurser, inte en del av
// produkten. Missas det blir hela säljinnehållet oöversatt medan titeln
// är norsk, och det syns inte i adminen.
async function hamtaMetafaltIder(produktId) {
  const data = await graphql(
    `query opsFactoryMetafaltIder($id: ID!) {
      product(id: $id) {
        metafields(namespace: "opf", first: 30) { nodes { id key type value } }
      }
    }`,
    { id: produktId }
  );
  return data.product?.metafields?.nodes ?? [];
}

// Metafältens värden är JSON för list- och json-typer. Översättningen måste
// ha SAMMA form som källan, annars renderar temat en rå sträng.
function metafaltVarde(typ, varde) {
  if (typ.startsWith('list.')) return JSON.stringify(varde.map(String));
  if (typ === 'json') return JSON.stringify(varde);
  return String(varde);
}

async function oversattProdukt(handle, karta, locale, dry) {
  const produkt = await hamtaProduktViaHandle(handle);
  if (!produkt) return { handle, fel: 'finns inte i butiken' };

  const rader = [];
  const innehall = await hamtaOversattbara(produkt.id);
  const nycklar = new Map(innehall.map((c) => [c.key, c]));
  for (const [key, value] of Object.entries(karta.produkt ?? {})) {
    const kalla = nycklar.get(key);
    if (kalla) rader.push({ key, value, digest: kalla.digest });
  }
  if (!dry) await registrera(produkt.id, locale, rader);

  let metaAntal = 0;
  const metafalt = await hamtaMetafaltIder(produkt.id);
  for (const mf of metafalt) {
    const oversatt = (karta.metafalt ?? {})[mf.key];
    if (oversatt === undefined) continue;
    const innehallMf = await hamtaOversattbara(mf.id);
    const kalla = innehallMf.find((c) => c.key === 'value');
    if (!kalla) continue;
    if (!dry) {
      await registrera(mf.id, locale, [
        { key: 'value', value: metafaltVarde(mf.type, oversatt), digest: kalla.digest },
      ]);
    }
    metaAntal += 1;
  }

  const ejOversatta = metafalt.filter((mf) => (karta.metafalt ?? {})[mf.key] === undefined).map((mf) => mf.key);
  return { handle, produktfalt: rader.length, metafalt: metaAntal, ejOversatta };
}

// Värdematchning: går igenom resursens översättbara innehåll och parar ihop
// varje källvärde med sin motsvarighet i listan.
async function oversattPaVarde(resourceId, par, locale, dry, raknas = () => true) {
  const innehall = await hamtaOversattbara(resourceId);
  const karta = new Map(par.map(([fran, till]) => [fran.trim(), till]));
  const rader = [];
  const otraffade = [];
  for (const c of innehall) {
    const varde = String(c.value ?? '').trim();
    if (!varde || !raknas(c.key)) continue;
    const till = karta.get(varde);
    if (till === undefined) {
      otraffade.push(varde.slice(0, 70));
      continue;
    }
    rader.push({ key: c.key, value: till, digest: c.digest });
  }
  if (!dry && rader.length > 0) await registrera(resourceId, locale, rader);
  return { antal: rader.length, otraffade };
}

async function huvud() {
  laddaEnv();
  const argv = process.argv.slice(2);
  const dry = argv.includes('--dry');
  const fil = argv.find((a) => !a.startsWith('--'));
  if (!fil) {
    console.error('Användning: node factory/oversatt-butik.mjs <översättningsfil.mjs> [--dry]');
    process.exit(1);
  }
  const mod = await import(pathToFileURL(resolve(fil)).href);
  const locale = mod.LOCALE;
  console.log(`\nÖversätter till ${locale}${dry ? ' · DRY' : ''}\n`);

  for (const [handle, karta] of Object.entries(mod.PRODUKTER ?? {})) {
    const r = await oversattProdukt(handle, karta, locale, dry);
    if (r.fel) {
      console.log(`❌ ${handle}: ${r.fel}`);
      continue;
    }
    console.log(`✅ ${handle}: ${r.produktfalt} produktfält, ${r.metafalt} metafält`);
    if (r.ejOversatta.length > 0) console.log(`   ⚠️ utan översättning: ${r.ejOversatta.join(', ')}`);
  }

  if (mod.STARTSIDA_PAR) {
    const tema = await hamtaUtkastTema();
    if (!tema) {
      console.log('🖐 Inget utkasttema — startsidan kunde inte översättas.');
    } else {
      // Tema-översättningar är bundna till TEMA-ID: ny klon = registrera om.
      const id = `gid://shopify/OnlineStoreTheme/${String(tema.id).split('/').pop()}`;
      // Bara mallarnas egna strängar räknas. Temats ~4400 gränssnittsrader
      // ("Checkout", "Skip to content" …) kommer ur Dawns locales/nb.json och
      // är redan norska — rapporteras de som "utan översättning" drunknar de
      // rader som faktiskt är butikens innehåll.
      // Mallarnas egna strängar har prefixet `section.<mall>.json.` (singular)
      // — mätt 2026-09-09. `sections.` (plural) är temats schemaetiketter.
      const r = await oversattPaVarde(id, mod.STARTSIDA_PAR, locale, dry, (nyckel) =>
        /^section\.[a-z]+\.json\./.test(nyckel)
      );
      console.log(`✅ temat (${tema.name}): ${r.antal} strängar i mallarna`);
      if (r.otraffade.length > 0) {
        console.log(`   ⚠️ ${r.otraffade.length} mallsträngar utan översättning:`);
        for (const t of r.otraffade.slice(0, 15)) console.log(`      • ${t}`);
      }
    }
  }

  if (mod.MENY_PAR) {
    // Menyns RADER är egna resurser (gid://shopify/Link/…) — själva menyn
    // exponerar bara sin titel. Översätts bara menyn får kunden en norsk
    // sida med svenska menylänkar.
    const karta = new Map(mod.MENY_PAR.map(([fran, till]) => [fran.trim(), till]));
    const data = await graphql(`
      query opsFactoryMenylankar {
        translatableResources(resourceType: LINK, first: 100) {
          nodes { resourceId translatableContent { key value digest } }
        }
      }`);
    let antal = 0;
    const otraffade = [];
    for (const nod of data.translatableResources?.nodes ?? []) {
      for (const c of nod.translatableContent) {
        const till = karta.get(String(c.value ?? '').trim());
        if (till === undefined) {
          otraffade.push(c.value);
          continue;
        }
        if (!dry) await registrera(nod.resourceId, locale, [{ key: c.key, value: till, digest: c.digest }]);
        antal += 1;
      }
    }
    console.log(`✅ menylänkarna: ${antal} rader`);
    if (otraffade.length > 0) console.log(`   ⚠️ utan översättning: ${otraffade.join(', ')}`);
  }

  if (mod.EJ_OVERSATT?.length > 0) {
    console.log('\n⚠️ INTE översatt (medvetet, ska vara känt):');
    for (const rad of mod.EJ_OVERSATT) console.log(`   • ${rad}`);
  }
  console.log(dry ? '\n✅ Dry — inget registrerades.\n' : '\n✅ Översättningarna registrerade.\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
