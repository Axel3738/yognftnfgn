// kampanj.mjs — bygger OPS-butikens kampanj i det gemensamma annonskontot.
//
//   node factory/kampanj.mjs <produkt-id> --marknad SE|NO|US [--torr]
//   node factory/kampanj.mjs <produkt-id> --marknad US --tom [--vinklar SP,PD,GT,CS] [--torr]
//
// Steg 8 i `/ny-annonser`. ALLT föds PAUSED, på alla tre nivåer.
// `--tom` bygger kampanj + adsets utan annonser (CBO) för en marknad utan
// källannonser — USA (2026-09-16). Kontot per marknad: factory/opsmarknader.mjs.
//
// ⚠️ STRUKTUREN ÄR ABO MED ETT ADSET PER VINKEL — aldrig CBO med ett adset.
// Axels bakläxa 2026-09-09: DryTreks första svenska kampanj byggdes som CBO
// med alla 16 annonser i EN annonsuppsättning. Två fel i ett:
//   1. Det bryter CLAUDE.md regel 11 (nya tester = separat test-ABO med lika
//      budget per annons). I en CBO går pengarna dit Meta vill, och tre
//      vinklar svälter ihjäl bredvid en — precis mönster 5 i motorhöljets DNA.
//   2. Med alla vinklar i samma adset går datan inte att skära per vinkel.
//      Hela poängen med namnkonventionen är att kunna svara "vilken vinkel
//      bär den här produkten" — en enda uppsättning gör den frågan omöjlig.
// Källkampanjen som gav ROAS 2,83 har ett adset per vinkel. Vi speglar den.
//
// ⚠️ Kontokartan kontrolleras på ID, aldrig på namn:
//   källa SE  MagiBorsten      1867947880635861
//   källa NO  Magiborsten NO   1050941584152547
//   MÅL       MagiBorsten DK    915422744950975   ← båda marknaderna
// Målkontot är INTE tomt — Bäverbutikens danska kampanjer ligger där med
// deras sida och pixel. Därför prefixas kampanjnamnet alltid med brandet
// OCH marknaden, och sida/pixel tas ur produktfilen, aldrig ur kontot.
//
// Media ska redan ligga i målkontot (factory/media-upload.mjs) — image_hash
// och video_id är per konto och går inte att referera från källkontot.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { api, ingaEnhancements, väntaPåThumb } from '../tools/meta-lib.mjs';
import { MALKONTO } from './kallannonser.mjs';
import { OPS_MARKNADSKODER, marknadFor, marknadslank } from './opsmarknader.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

// Vinkeln ur annonsnamnet: Damasker_PD_2_1 → PD, Damasker_SP_4_H1 → SP4.
//
// ⚠️ Prefixet måste skickas med när det är fler än ett ord. Det norska
// prefixet är `Gamasjer_NO`, så Gamasjer_NO_PD_2_1 ger "NO" som vinkel om
// man bara tar andra ordet — och då hittas ingen copy alls.
/**
 * Butiksfilen som hör till produkten: `brand.namn` mot butikens `butik.brand`,
 * samma koppling som `factory/register.mjs paraIhop()` använder. Skiftläges-
 * okänsligt. Kastar hellre än gissar — fel butik ger fel brand i kampanjnamnet
 * och fel domän i annonslänken, och inget av det syns som ett fel i Meta.
 */
export function butikForProdukt(p, mapp = join(ROT, 'butiker')) {
  const brand = String(p?.brand?.namn ?? '').trim().toLowerCase();
  if (!brand) throw new Error('Produktfilen saknar brand.namn — butiken går inte att härleda.');
  const traffar = [];
  for (const fil of readdirSync(mapp).filter((f) => f.endsWith('.yaml'))) {
    const y = lasYaml(readFileSync(join(mapp, fil), 'utf8'));
    if (String(y?.butik?.brand ?? '').trim().toLowerCase() === brand) traffar.push({ butikId: y.butik.id, butik: y });
  }
  if (traffar.length === 1) return traffar[0];
  if (traffar.length === 0) throw new Error(`Ingen butik i factory/butiker/ har brand "${p?.brand?.namn}". Sätt brand.namn i produktfilen till butikens brand.`);
  throw new Error(`Flera butiker har brand "${p?.brand?.namn}": ${traffar.map((t) => t.butikId).join(', ')}. Brandet måste vara unikt per butik.`);
}

/** Produktens handle i butiken — `produkt.handle` när det skiljer sig från id. */
export const handleFor = (p) => String(p?.produkt?.handle || p?.produkt?.id || '').trim();

export function vinkelAv(namn, prefix = '') {
  let rest = String(namn);
  if (prefix && rest.startsWith(`${prefix}_`)) rest = rest.slice(prefix.length + 1);
  else rest = rest.split('_').slice(1).join('_');
  const del = rest.split('_');
  const kod = del[0] ?? '';
  if (kod === 'SP' && del[1] === '4') return 'SP4';
  return kod;
}

/** Annonsnamnet i OPS-kontot: produktens EGET prefix (meta.creative_prefix,
 *  brandet som reserv) + källnamnet utan källprefixet, med `NO_` framför på
 *  den norska marknaden — `CaraShellFront_PD_2_1` / `CaraShellFront_NO_PD_1`.
 *  Till 2026-09-16 hette annonsen `${brand}_${källnamn}`
 *  (`CaraShell_Termoskydd_PD_2_1`): i en enproduktsbutik är brandet prefixet,
 *  så det höll, men i en tvåproduktsbutik matchar registrets prefixfilter
 *  (`carashellfront_`) aldrig — nattvakten, leveranskön och commission hade
 *  inte sett en enda annons. docs/naming-convention.md + FLERPRODUKT.md. */
export function annonsnamnAv(p, kallnamn, kallprefix = '', marknad = 'SE') {
  const prefix = String(p?.meta?.creative_prefix || p?.brand?.namn || '').replace(/[^A-Za-z0-9]/g, '');
  if (!prefix) throw new Error('Produktfilen saknar meta.creative_prefix och brand.namn.');
  let rest = String(kallnamn);
  if (kallprefix && rest.startsWith(`${kallprefix}_`)) rest = rest.slice(kallprefix.length + 1);
  else rest = rest.split('_').slice(1).join('_');
  if (marknad === 'NO' && !/^NO_/.test(rest)) rest = `NO_${rest}`;
  return `${prefix}_${rest}`;
}

/**
 * Ren: kampanjnamnet per konventionen `{BRAND}_{MARKNAD}_{Produktnamn} | BE-ROAS x | datum`.
 * Produktnamnet är det svenska (kampanjnamn är interna) — före första
 * bindestrecket, som förut.
 */
export function kampanjnamnFor({ brand, marknad, produkt, datum }) {
  const namn = String(produkt?.produkt?.namn ?? '').split(/[–—-]/)[0].trim();
  const pris = Number(produkt?.ekonomi?.pris);
  const inkop = Number(produkt?.ekonomi?.inkopskostnad);
  const be = pris > 0 && inkop > 0 && pris > inkop ? (pris / (pris - inkop)).toFixed(2) : '?';
  return `${String(brand).toUpperCase()}_${String(marknad).toUpperCase()}_${namn} | BE-ROAS ${be} | ${datum}`;
}

/** Ren: vinklarna för en TOM kampanj — ur --vinklar, annars ur SE-kampanjens adsets (" - PD" / "_PD"). */
export function vinklarFor({ flagga = null, seAdsets = [] } = {}) {
  const urFlagga = String(flagga ?? '').split(/[,\s]+/).map((v) => v.trim().toUpperCase()).filter((v) => /^[A-Z]{1,4}[0-9]?$/.test(v));
  if (urFlagga.length) return [...new Set(urFlagga)].sort();
  const urAdsets = (seAdsets ?? [])
    .map((a) => /(?:\s-\s|_)([A-Z]{1,4}[0-9]?)$/.exec(String(a?.name ?? '').trim())?.[1] ?? null)
    .filter(Boolean)
    .map((v) => v.toUpperCase());
  return [...new Set(urAdsets)].sort();
}

export function byggSpec({ typ, media, copy, pageId, igId, lank }) {
  const cta = { type: 'SHOP_NOW', value: { link: lank } };
  const gemensamt = {
    message: copy.message,
    name: copy.headline,
    ...(copy.description ? { description: copy.description } : {}),
    link: lank,
    call_to_action: cta,
  };
  const spec = { page_id: pageId, ...(igId ? { instagram_actor_id: igId } : {}) };
  if (typ === 'video') {
    spec.video_data = {
      video_id: media.id,
      image_url: media.thumb,
      message: copy.message,
      title: copy.headline,
      ...(copy.description ? { link_description: copy.description } : {}),
      call_to_action: cta,
    };
  } else {
    spec.link_data = { ...gemensamt, image_hash: media.id };
  }
  return spec;
}

if (process.argv[1] && process.argv[1].endsWith('kampanj.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const produktId = arg.find((a) => !a.startsWith('--') && !String(arg[arg.indexOf(a) - 1] ?? '').startsWith('--'));
  const marknad = arg.includes('--marknad') ? arg[arg.indexOf('--marknad') + 1] : 'SE';
  const torr = arg.includes('--torr');

  const p = lasYaml(readFileSync(join(ROT, 'produkter', `${produktId}.yaml`), 'utf8'));
  // Butiken härleds ur produktens brand — den stod som `const butikId =
  // 'drytrek'` till 2026-09-14, alltså byggdes VARJE butiks kampanj med
  // DryTreks brand i namnet och drytrek.se i länken. Inget kastade.
  const { butikId, butik } = butikForProdukt(p);

  // --- spärrarna, före allt annat. Butikens identitet är OPS-kontot; MÅLET
  //     är marknadens konto (opsmarknader.mjs) — US ligger i Magiborsten UK.
  const baskonto = String(p.meta?.ad_account_id ?? '');
  if (baskonto !== MALKONTO.id) throw new Error(`ad_account_id är ${baskonto}, ska vara ${MALKONTO.id} (${MALKONTO.namn}). Stoppar.`);
  const pageId = String(p.meta?.page_id ?? '');
  const pixelId = String(p.meta?.pixel_id ?? '');
  if (!pageId) throw new Error('meta.page_id är tom — kampanjen kan inte byggas utan sidan.');
  if (!pixelId) throw new Error('meta.pixel_id är tom.');
  if (pixelId === '1554276343018184') throw new Error('Det är BÄVERBUTIKENS pixel. Stoppar.');

  if (!OPS_MARKNADSKODER.includes(marknad)) throw new Error(`--marknad ${marknad} finns inte. Välj ${OPS_MARKNADSKODER.join(', ')}.`);
  const marknaden = marknadFor(marknad);
  const act = marknaden.act;
  const suffix = marknad === 'SE' ? '' : `-${marknad.toLowerCase()}`;
  // --tom: kampanj + ett adset per vinkel, INGA annonser. För en marknad som
  // saknar källannonser (USA: Bäverbutiken har inga engelska) — annonserna
  // fylls på av /ops-oversatt <nyckel> --marknad US, en om dagen. Byggs som
  // CBO (budgeten på kampanjen), för uppladdaren (tools/ops-till-meta.mjs +
  // meta-lib.hittaEllerSkapaAdset) klonar bara adsets utan egen budget —
  // samma form som butikens SE/NO-kampanjer har i kontot (mätt 2026-09-16:
  // CARASHELL_NO daily 2 000 kr på kampanjen, adseten utan budget).
  const tom = arg.includes('--tom');
  const vinkelflagga = arg.includes('--vinklar') ? arg[arg.indexOf('--vinklar') + 1] : null;

  // Marknadens annonser ska landa på MARKNADENS sida (/nb, /en …) med
  // `?country=` — utan parametern får kunden marknadens språk men SVENSKA
  // priser (DryTrek 2026-09-10: 16 norska annonser en dag på /nb utan country).
  // Regeln bor i opsmarknader.lankFor; en marknad med egen domän
  // (butik.marknader[].doman — carashell.com för USA) får den utan språkmapp.
  const lank = marknadslank(butik, { handle: handleFor(p), kod: marknad });

  let media = {};
  let copyblock = {};
  if (!tom) {
    const mediaFil = join(ROT, 'output', produktId, `media-i-malkontot${suffix}.json`);
    if (!existsSync(mediaFil)) throw new Error(`${mediaFil.split('/').pop()} saknas — kör factory/media-upload.mjs --marknad ${marknad} först (eller bygg tom: --tom).`);
    media = JSON.parse(readFileSync(mediaFil, 'utf8'));
    const copyFil = join(ROT, 'annonscopy', `${produktId}-${marknad.toLowerCase()}.json`);
    if (!existsSync(copyFil)) throw new Error(`${copyFil.split('/').pop()} saknas — copyn för ${marknad} är inte skriven.`);
    copyblock = JSON.parse(readFileSync(copyFil, 'utf8')).vinklar;
  }

  const brand = butik.butik.brand;
  // Datumet är byggdagen (svensk tid) — stod hårdkodat "2026-09-09" till
  // 2026-09-16, så varje kampanj byggd efter DryTrek bar fel datum i namnet.
  const idag = new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 10);
  const kampanjnamn = kampanjnamnFor({ brand, marknad, produkt: p, datum: idag });
  const budget = Math.round((p.meta?.testbudget_per_dag ?? 1000) * 100);

  console.log(`Mål: ${marknaden.kontonamn} ${act} (kontovaluta ${marknaden.kontovaluta}) · geo ${marknaden.geo.join(',')}`);
  console.log(`Sida: ${pageId} · Pixel: ${pixelId}`);
  console.log(`Länk: ${lank}`);
  console.log(`Kampanj: ${kampanjnamn}`);
  console.log(tom
    ? `Budget: ${budget / 100} ${marknaden.kontovaluta}/dag på KAMPANJEN (CBO) — tom kampanj, annonserna kommer från /ops-oversatt\n`
    : `Budget: ${budget / 100} ${marknaden.kontovaluta}/dag, fördelad lika över adseten (ABO)\n`);

  if (tom) {
    // Vinklarna: --vinklar, annars butikens SE-kampanj i OPS-kontot (samma
    // adsets ska finnas här, så leveransen hittar sitt koncept-adset).
    let seAdsets = [];
    if (!vinkelflagga) {
      const seKampanjer = await api(`act_${MALKONTO.id}/campaigns`, { params: { fields: 'id,name,status', limit: 200 } });
      // PRODUKTENS SE-kampanj, inte butikens alla (CaraShell bär två produkter
      // sedan 2026-09-16 — termoskyddets adsets ska inte in i takskyddets US).
      const seBas = kampanjnamnFor({ brand, marknad: 'SE', produkt: p, datum: '' }).split(' | ')[0].toUpperCase();
      const se = (seKampanjer.data ?? []).filter((k) => String(k.name).toUpperCase().startsWith(seBas));
      for (const k of se) seAdsets.push(...((await api(`${k.id}/adsets`, { params: { fields: 'id,name,status', limit: 100 } })).data ?? []));
    }
    const vinklar = vinklarFor({ flagga: vinkelflagga, seAdsets });
    if (!vinklar.length) throw new Error('Inga vinklar: ange --vinklar SP,PD,GT,CS eller se till att butikens SE-kampanj har adsets.');
    // Idempotent: finns PRODUKTENS kampanj för marknaden redan i kontot
    // återanvänds den och bara saknade adsets skapas — ett avbrutet bygge
    // (Meta 400 på första adsetet, CaraShell US 2026-09-16) får aldrig ge två
    // kampanjer. ⚠️ Matchningen är på produktens kampanjbas, inte butikens:
    // med bara `CARASHELL_US_` hittade termoskyddets bygge takskyddets
    // US-kampanj och hade fyllt den (torrkörning 2026-09-16). Adsetnamnen
    // (`bas` + vinkel) är däremot butikens, som i SE.
    const bas = `${brand.toUpperCase()}_${marknad}_`;
    const produktBas = kampanjnamnFor({ brand, marknad, produkt: p, datum: '' }).split(' | ')[0].toUpperCase();
    const befintliga = ((await api(`act_${act}/campaigns`, { params: { fields: 'id,name,status,daily_budget,bid_strategy', limit: 200 } })).data ?? [])
      .filter((k) => String(k.name).toUpperCase().split(' | ')[0].trim() === produktBas);
    if (befintliga.length > 1) throw new Error(`${befintliga.length} kampanjer i kontot heter ${produktBas}: ${befintliga.map((k) => `${k.name} (${k.id})`).join(' · ')} — vet inte vilken. Rensa först.`);
    const aterbruk = befintliga[0] ?? null;
    const harAdsets = aterbruk ? ((await api(`${aterbruk.id}/adsets`, { params: { fields: 'id,name,status', limit: 100 } })).data ?? []) : [];
    const saknade = vinklar.filter((v) => !harAdsets.some((a) => String(a.name).toUpperCase() === `${bas}${v}`));
    console.log(`Tom kampanj med ${vinklar.length} adsets: ${vinklar.join(', ')}${aterbruk ? ` — kampanjen "${aterbruk.name}" (${aterbruk.id}, ${aterbruk.status}) finns redan, ${harAdsets.length} adsets, ${saknade.length} saknas` : ''}`);
    if (torr) { console.log('\n(torrkörning — inget skapades i Meta)'); process.exit(0); }
    // CBO: budget OCH budstrategi på kampanjen. Adseten får ingen bid_strategy —
    // Meta svarar annars 400 "bid_amount krävs" (mätt 2026-09-16, Magiborsten UK).
    const kampanj = aterbruk ?? (await api(`act_${act}/campaigns`, {
      form: { name: kampanjnamn, objective: 'OUTCOME_SALES', status: 'PAUSED', special_ad_categories: '[]', buying_type: 'AUCTION', daily_budget: String(budget), bid_strategy: 'LOWEST_COST_WITHOUT_CAP' },
    }));
    // En återanvänd kampanj kan sakna budget eller budstrategi (första
    // US-bygget 2026-09-16 skapade kampanjen utan bid_strategy, och varje
    // adset fick då 400 "bid_amount krävs"). Rätta på kampanjen, aldrig på adsetet.
    if (aterbruk && (!Number(aterbruk.daily_budget) || aterbruk.bid_strategy !== 'LOWEST_COST_WITHOUT_CAP')) {
      await api(`${kampanj.id}`, { form: { ...(Number(aterbruk.daily_budget) ? {} : { daily_budget: String(budget) }), bid_strategy: 'LOWEST_COST_WITHOUT_CAP' } });
      console.log(`   kampanjen ${Number(aterbruk.daily_budget) ? 'saknade budstrategi' : 'saknade budget'} — satt: ${budget / 100}/dag (CBO), LOWEST_COST_WITHOUT_CAP`);
    }
    console.log(`\n✅ Kampanj ${kampanj.id} (${aterbruk ? 'återanvänd' : 'PAUSED, CBO ' + budget / 100 + '/dag'})`);
    for (const v of saknade) {
      const adset = await api(`act_${act}/adsets`, {
        form: {
          name: `${bas}${v}`,
          campaign_id: kampanj.id,
          status: 'PAUSED',
          billing_event: 'IMPRESSIONS',
          optimization_goal: 'OFFSITE_CONVERSIONS',
          destination_type: 'WEBSITE',
          promoted_object: JSON.stringify({ pixel_id: pixelId, custom_event_type: 'PURCHASE' }),
          targeting: JSON.stringify({ geo_locations: { countries: marknaden.geo }, age_min: 25, age_max: 65, targeting_automation: { advantage_audience: 1 } }),
        },
      });
      console.log(`✅ Adset ${v}: ${adset.id} (PAUSED, geo ${marknaden.geo.join(',')}, ingen egen budget)`);
    }
    const iKontot = await api(`${kampanj.id}/adsets`, { params: { fields: 'id,name,status', limit: 100 } });
    console.log(`\n─── RÄKNING ───\n  adsets i kampanjen: ${(iKontot.data ?? []).length}  ← läst ur Meta\n  annonser: 0 (fylls av /ops-oversatt ${butikId} --marknad ${marknad})`);
    process.exit(0);
  }

  const kallprefix = marknad === 'NO'
    ? (p.kalla?.no_annonsprefix ?? p.kalla?.annonsprefix ?? '')
    : (p.kalla?.annonsprefix ?? '');

  const attBygga = Object.entries(media).map(([namn, m]) => ({
    namn,
    typ: m.typ === 'video_id' ? 'video' : 'bild',
    id: m.id,
    vinkel: vinkelAv(namn, kallprefix),
  }));
  const utanCopy = attBygga.filter((a) => !copyblock[a.vinkel]);
  if (utanCopy.length > 0) {
    throw new Error(`Saknar copy för vinklarna: ${[...new Set(utanCopy.map((a) => a.vinkel))].join(', ')}`);
  }
  // Ett adset per vinkel, lika budget i varje (regel 11 + källans struktur).
  const vinklar = [...new Set(attBygga.map((a) => a.vinkel))].sort();
  const perAdset = Math.round(budget / vinklar.length);
  console.log(`${attBygga.length} annonser i ${vinklar.length} annonsuppsättningar (ABO, ${perAdset / 100} ${marknaden.kontovaluta}/dag styck):`);
  for (const v of vinklar) {
    const i = attBygga.filter((a) => a.vinkel === v);
    console.log(`   ${v.padEnd(4)} ${i.length} annonser: ${i.map((a) => a.namn).join(', ')}`);
  }

  if (torr) { console.log('\n(torrkörning — inget skapades i Meta)'); process.exit(0); }

  // --- kampanjen. IDEMPOTENT på namn sedan 2026-09-16: finns kampanjen redan
  // fylls DEN (/ny-annonser steg 8: "aldrig en ny bredvid"). Förut skapades en
  // ny kampanj vid varje körning, så en andra omgång annonser (bildfixar,
  // omdubbade videor) hade blivit en dubblettkampanj.
  //
  // Budgetmodell: `--cbo` = budgeten på kampanjen (den låsta OPS-strukturen i
  // /ny-annonser steg 8, Axels beslut 2026-09-10). Utan flaggan ABO: budgeten
  // bor i adseten, lika per adset (regel 11, test-ABO). En BEFINTLIG kampanj
  // avgör själv: har den daily_budget är den CBO och adseten får ingen budget.
  const cbo = arg.includes('--cbo');
  const befintliga = await api(`act_${act}/campaigns`, { params: { fields: 'id,name,daily_budget,status', limit: 200 } });
  let kampanj = (befintliga.data ?? []).find((k) => k.name === kampanjnamn) ?? null;
  if (kampanj) {
    console.log(`\n♻️  Kampanj ${kampanj.id} finns redan (${kampanj.status}${kampanj.daily_budget ? `, CBO ${kampanj.daily_budget / 100} kr/dag` : ', ABO'}) — fyller den, skapar ingen ny.`);
  } else {
    kampanj = await api(`act_${act}/campaigns`, {
      form: {
        name: kampanjnamn,
        objective: 'OUTCOME_SALES',
        status: 'PAUSED',
        special_ad_categories: '[]',
        buying_type: 'AUCTION',
        ...(cbo
          ? { daily_budget: String(budget), bid_strategy: 'LOWEST_COST_WITHOUT_CAP' }
          // ⚠️ Meta KRÄVER det här fältet så fort kampanjen saknar egen budget.
          // FALSKT med flit: sant låter adseten låna 20 % av varandras budget,
          // och då är budgeten inte längre lika per annons — hela poängen med
          // ett test-ABO faller (regel 11).
          : { is_adset_budget_sharing_enabled: 'false' }),
      },
    });
    kampanj.daily_budget = cbo ? String(budget) : null;
    console.log(`\n✅ Kampanj ${kampanj.id} (PAUSED, ${cbo ? `CBO ${budget / 100} kr/dag` : 'ABO utan budgetdelning'})`);
  }
  const kampanjArCbo = Boolean(kampanj.daily_budget);

  // --- adseten, ett per vinkel. Targeting sätts EXPLICIT — ingen fallback-geo.
  // Återanvänds på namn inom kampanjen.
  const adsetAv = new Map();
  const befintligaAdsets = await api(`${kampanj.id}/adsets`, { params: { fields: 'id,name', limit: 100 } });
  for (const v of vinklar) {
    const adsetnamn = `${brand.toUpperCase()}_${marknad}_${v}`;
    const redan = (befintligaAdsets.data ?? []).find((a) => a.name === adsetnamn);
    if (redan) {
      adsetAv.set(v, redan.id);
      console.log(`♻️  Adset ${v}: ${redan.id} finns redan`);
      continue;
    }
    const adset = await api(`act_${act}/adsets`, {
      form: {
        name: adsetnamn,
        campaign_id: kampanj.id,
        status: 'PAUSED',
        ...(kampanjArCbo ? {} : { daily_budget: String(perAdset) }),
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'OFFSITE_CONVERSIONS',
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        destination_type: 'WEBSITE',
        promoted_object: JSON.stringify({ pixel_id: pixelId, custom_event_type: 'PURCHASE' }),
        targeting: JSON.stringify({
          geo_locations: { countries: marknaden.geo },
          age_min: 25,
          age_max: 65,
          targeting_automation: { advantage_audience: 1 },
        }),
      },
    });
    adsetAv.set(v, adset.id);
    console.log(`✅ Adset ${v}: ${adset.id} (PAUSED, geo ${marknaden.geo.join(',')}, ${perAdset / 100} ${marknaden.kontovaluta}/dag)`);
  }

  // --- annonserna. En annons som redan finns i kampanjen (samma namn) hoppas
  // över — så en andra omgång media (bildfixar, omdubbade videor) kan köras
  // genom samma kommando utan dubbletter.
  const byggda = [];
  const misslyckade = [];
  const redanUppe = new Set(((await api(`${kampanj.id}/ads`, { params: { fields: 'name', limit: 200 } })).data ?? []).map((x) => x.name));
  let hoppade = 0;
  for (const a of attBygga) {
    const copy = copyblock[a.vinkel].slutlig ?? copyblock[a.vinkel];
    const adsetId = adsetAv.get(a.vinkel);
    const annonsnamn = annonsnamnAv(p, a.namn, kallprefix, marknad);
    if (redanUppe.has(annonsnamn)) {
      console.log(`   ♻️  ${annonsnamn} finns redan i kampanjen`);
      hoppade += 1;
      continue;
    }
    try {
      const m = { id: a.id };
      if (a.typ === 'video') m.thumb = await väntaPåThumb(a.id);
      const spec = byggSpec({ typ: a.typ, media: m, copy, pageId, igId: null, lank });
      const creative = await api(`act_${act}/adcreatives`, {
        form: {
          name: annonsnamn,
          object_story_spec: JSON.stringify(spec),
          degrees_of_freedom_spec: JSON.stringify(ingaEnhancements()),
        },
      });
      const annons = await api(`act_${act}/ads`, {
        form: {
          name: annonsnamn,
          adset_id: adsetId,
          creative: JSON.stringify({ creative_id: creative.id }),
          status: 'PAUSED',
        },
      });
      byggda.push({ namn: a.namn, annonsId: annons.id });
      console.log(`   ✅ ${a.namn} → annons ${annons.id}`);
    } catch (e) {
      misslyckade.push({ namn: a.namn, fel: e.message.slice(0, 160) });
      console.log(`   ❌ ${a.namn}: ${e.message.slice(0, 160)}`);
    }
  }

  // --- RÄKNINGEN, läst ur Meta och inte ur minnet
  const iKontot = await api(`${kampanj.id}/ads`, { params: { fields: 'id,name,status', limit: 100 } });
  console.log('\n─── RÄKNING ───');
  console.log(`  media i målkontot   : ${attBygga.length}`);
  console.log(`  annonser byggda     : ${byggda.length}`);
  console.log(`  fanns redan         : ${hoppade}`);
  console.log(`  misslyckade         : ${misslyckade.length}`);
  console.log(`  annonser i kampanjen: ${(iKontot.data ?? []).length}  ← läst ur Meta`);
  for (const m of misslyckade) console.log(`     ❌ ${m.namn}: ${m.fel}`);
  console.log(`\nStatus i kontot: ${[...new Set((iKontot.data ?? []).map((x) => x.status))].join(', ') || '(inga)'}`);
}
