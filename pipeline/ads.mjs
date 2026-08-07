// CLI mot Ads Manager (via meta.mjs). Allt skapas PAUSED — godkänn i Ads Manager innan spend.
//   node ads.mjs verify                                   -> testa token + kontoåtkomst
//   node ads.mjs accounts                                 -> status för SnarkLös + MagiBorsten
//   node ads.mjs campaigns --account=magi                 -> lista kampanjer
//   node ads.mjs adsets    --account=magi [--campaign=ID] -> lista adsets
//   node ads.mjs ads       --account=magi [--adset=ID]    -> lista annonser
//   node ads.mjs create-campaign --account=magi --name=MAGI_SALES_20260807
//   node ads.mjs create-adset    --account=magi --campaign=ID --name=SE_BOF --budget=200
//   node ads.mjs push --account=magi --wave=01 --adset=ID [--link=URL] [--only=NAMN] [--dry]
//   node ads.mjs pause --id=AD_ID   /   node ads.mjs resume --id=AD_ID
//   node ads.mjs insights --account=magi [--date=last_7d]
import { readFile, readdir } from 'node:fs/promises';
import * as meta from './meta.mjs';

const args = process.argv.slice(2);
const cmd = args.find(a => !a.startsWith('--'));
const flag = (name, fallback = null) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};
const has = (name) => args.includes(`--${name}`);

const DEFAULT_LINK = 'https://grillkliniken.se';

async function push() {
  const acct = meta.resolveAccount(flag('account'));
  const wave = flag('wave', '01');
  const adsetId = flag('adset');
  const only = flag('only');
  const dry = has('dry');
  if (!adsetId && !dry) throw new Error('Ange --adset=ID (eller kör --dry). Skapa ett med create-adset.');

  // Copy per annons hämtas från vågens `copy`-fält; flaggor/defaults fyller luckorna.
  const { ads: waveAds } = await import(`./waves/wave-${wave}.mjs`);
  const outDir = new URL(`./output/wave-${wave}/`, import.meta.url);
  const files = (await readdir(outDir.pathname)).filter(f => f.endsWith('.png'));
  let queue = only ? files.filter(f => f.includes(only)) : files;
  console.log(`Push wave ${wave} → ${acct.label}: ${queue.length} statics ${dry ? '(DRY — inget skickas)' : `→ adset ${adsetId}`}`);

  for (const file of queue) {
    const name = file.replace(/\.png$/, '');
    const def = waveAds.find(a => a.name === name) || {};
    const copy = def.copy || {};
    const link = flag('link', copy.link || DEFAULT_LINK);
    const message = flag('message', copy.message || def.overlay?.headline || name);
    const headline = flag('headline', copy.headline || 'Mastern — elektrisk grillborste');
    try {
      if (dry) { console.log(`  · ${name} — "${message}" → ${link}`); continue; }
      const buffer = await readFile(new URL(file, outDir));
      const hash = await meta.uploadImage(acct, buffer);
      const creative = await meta.createCreative(acct, { name: `${name}_creative`, imageHash: hash, link, message, headline });
      const ad = await meta.createAd(acct, { name, adsetId, creativeId: creative.id });
      console.log(`  ✓ ${name} — ad ${ad.id} (PAUSED)`);
    } catch (e) {
      console.log(`  ✗ ${name} — ${e.message}`);
    }
  }
}

function table(rows, cols) {
  for (const r of rows) console.log('  ' + cols.map(c => `${r[c] ?? '—'}`).join(' · '));
}

try {
  switch (cmd) {
    case 'verify': {
      const me = await meta.verify();
      console.log(`Token OK — inloggad som ${me.name} (${me.id})`);
      for (const key of Object.keys(meta.ACCOUNTS)) {
        const acct = meta.resolveAccount(key);
        try {
          const a = await meta.adAccount(acct);
          console.log(`  ✓ ${acct.label}: status ${a.account_status}, ${a.currency}, spend ${a.amount_spent}`);
        } catch (e) {
          console.log(`  ✗ ${acct.label}: ${e.message}`);
        }
      }
      break;
    }
    case 'accounts': {
      for (const key of Object.keys(meta.ACCOUNTS)) {
        const acct = meta.resolveAccount(key);
        const a = await meta.adAccount(acct);
        console.log(`${acct.label} (${acct.id}) — status ${a.account_status}, ${a.currency}, spend ${a.amount_spent}`);
      }
      break;
    }
    case 'campaigns': {
      const acct = meta.resolveAccount(flag('account'));
      const { data } = await meta.listCampaigns(acct);
      console.log(`${acct.label}: ${data.length} kampanjer`);
      table(data, ['id', 'name', 'status', 'objective']);
      break;
    }
    case 'adsets': {
      const acct = meta.resolveAccount(flag('account'));
      const { data } = await meta.listAdSets(acct, flag('campaign'));
      console.log(`${acct.label}: ${data.length} adsets`);
      table(data, ['id', 'name', 'status', 'daily_budget', 'optimization_goal']);
      break;
    }
    case 'ads': {
      const acct = meta.resolveAccount(flag('account'));
      const { data } = await meta.listAds(acct, flag('adset'));
      console.log(`${acct.label}: ${data.length} annonser`);
      table(data, ['id', 'name', 'status', 'effective_status']);
      break;
    }
    case 'create-campaign': {
      const acct = meta.resolveAccount(flag('account'));
      const name = flag('name');
      if (!name) throw new Error('Ange --name= (enligt namnkonventionen, t.ex. MAGI_SALES_20260807).');
      const c = await meta.createCampaign(acct, { name, objective: flag('objective', 'OUTCOME_SALES') });
      console.log(`✓ Kampanj ${c.id} "${name}" (PAUSED) på ${acct.label}`);
      break;
    }
    case 'create-adset': {
      const acct = meta.resolveAccount(flag('account'));
      const campaignId = flag('campaign');
      const name = flag('name');
      if (!campaignId || !name) throw new Error('Ange --campaign=ID och --name=.');
      const budgetSek = parseInt(flag('budget', '200'), 10);
      const a = await meta.createAdSet(acct, {
        name, campaignId,
        dailyBudget: budgetSek * 100, // Meta räknar i öre
        optimizationGoal: flag('goal', 'LINK_CLICKS'),
      });
      console.log(`✓ Adset ${a.id} "${name}" (PAUSED, ${budgetSek} kr/dag) på ${acct.label}`);
      break;
    }
    case 'push':
      await push();
      break;
    case 'pause':
    case 'resume': {
      const id = flag('id');
      if (!id) throw new Error('Ange --id= (ad/adset/kampanj-id).');
      await meta.setStatus(id, cmd === 'pause' ? 'PAUSED' : 'ACTIVE');
      console.log(`✓ ${id} → ${cmd === 'pause' ? 'PAUSED' : 'ACTIVE'}`);
      break;
    }
    case 'insights': {
      const acct = meta.resolveAccount(flag('account'));
      const { data } = await meta.insights(acct, { level: flag('level', 'ad'), datePreset: flag('date', 'last_7d') });
      console.log(`${acct.label} — ${flag('level', 'ad')}-nivå, ${flag('date', 'last_7d')}: ${data.length} rader`);
      table(data, ['ad_name', 'spend', 'impressions', 'clicks', 'ctr', 'cpc']);
      break;
    }
    default:
      console.log('Okänt kommando. Se kommentaren högst upp i pipeline/ads.mjs för alla kommandon.');
  }
} catch (e) {
  console.error(`Fel: ${e.message}`);
  process.exit(1);
}
