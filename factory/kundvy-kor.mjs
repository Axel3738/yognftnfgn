// kundvy-kor.mjs — kör kundvy-kontrollen mot butikens RIKTIGA startsida.
//
//   node factory/kundvy-kor.mjs <butik-id> <produkt-handle> [--url <adress>]
//                                          [--losenord <storefront-lösenord>]
//                                          [--fil <sparad.html>]
//
// `kundvy.mjs` är ren logik. Det här hämtar HTML:en och kör den.
//
// TRE SÄTT ATT FÅ TAG PÅ HTML:EN, i fallande ordning:
//   1. Butiken är öppen → hämta direkt.
//   2. Butiken är lösenordsskyddad → `--losenord` postar lösenordet, tar
//      emot storefront_digest-kakan och hämtar sen sidan som en kund.
//   3. `--fil` läser en sparad HTML-fil (den en människa laddat ner).
//
// ⚠️ Utan lösenord går det INTE att kontrollera en skyddad butik. Skriptet
// säger då det rakt ut och avslutar med felkod — det gissar aldrig grönt.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';
import { kontrolleraKundvy, rapport } from './kundvy.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

// Hämtar startsidan. Med lösenord: posta det först och behåll kakan.
export async function hamtaStartsida(bas, losenord = null) {
  const huvuden = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
    'Accept-Language': 'sv-SE,sv;q=0.9',
  };
  let kaka = '';

  if (losenord) {
    const form = new URLSearchParams({ form_type: 'storefront_password', utf8: '✓', password: losenord });
    const r = await fetch(`${bas}/password`, {
      method: 'POST',
      headers: { ...huvuden, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      redirect: 'manual',
    });
    // ⚠️ Behåll ALLA kakor. Shopify sätter numera sessionen i
    // `_shopify_essential`, inte i `storefront_digest` — ett filter på det
    // gamla namnet kastar bort den enda kaka som betyder något (mätt
    // 2026-09-09: rätt lösenord gav 302 till "/" och exakt en kaka).
    kaka = (r.headers.getSetCookie?.() ?? [r.headers.get('set-cookie')])
      .filter(Boolean)
      .map((c) => String(c).split(';')[0])
      .join('; ');
    // Rätt lösenord ger 302 till startsidan. Fel lösenord renderar om
    // /password med 200 och ett felmeddelande.
    const dit = r.headers.get('location') ?? '';
    if (r.status !== 302 || /\/password/.test(dit)) {
      throw new Error(`Lösenordet avvisades (HTTP ${r.status}, location ${dit || 'saknas'}).`);
    }
    if (!kaka) throw new Error('Inloggningen gav ingen kaka tillbaka.');
  }

  const svar = await fetch(`${bas}/`, { headers: kaka ? { ...huvuden, Cookie: kaka } : huvuden });
  const html = await svar.text();
  return { status: svar.status, url: svar.url, html };
}

if (process.argv[1] && process.argv[1].endsWith('kundvy-kor.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const flagga = (n) => (arg.includes(n) ? arg[arg.indexOf(n) + 1] : null);
  const [butikId, handle] = arg.filter((a, i) => !a.startsWith('--') && !String(arg[i - 1] ?? '').startsWith('--'));
  if (!butikId || !handle) {
    throw new Error('Användning: node factory/kundvy-kor.mjs <butik-id> <produkt-handle> [--losenord X] [--fil f.html]');
  }

  const butik = lasYaml(readFileSync(join(ROT, 'butiker', `${butikId}.yaml`), 'utf8'));
  const produkt = lasYaml(readFileSync(join(ROT, 'produkter', `${handle}.yaml`), 'utf8'));

  let html;
  const fil = flagga('--fil');
  if (fil) {
    html = readFileSync(fil, 'utf8');
    console.log(`Kundvy läst ur fil: ${fil} (${html.length} tecken)\n`);
  } else {
    const d = await graphql(`query { shop { myshopifyDomain primaryDomain { url } } onlineStore { passwordProtection { enabled } } }`);
    const bas = flagga('--url') ?? d.shop.primaryDomain?.url ?? `https://${d.shop.myshopifyDomain}`;
    const losenord = flagga('--losenord');
    const skyddad = d.onlineStore?.passwordProtection?.enabled;

    if (skyddad && !losenord) {
      console.error(
        [
          '❌ KUNDVYN GÅR INTE ATT KONTROLLERA.',
          '',
          `   ${bas} är lösenordsskyddad, och Admin-API:t lämnar inte ut`,
          '   lösenordet (OnlineStorePasswordProtection har bara fältet `enabled`).',
          '',
          '   Kör om med   --losenord <butikens storefront-lösenord>',
          '   eller spara sidans HTML och kör med   --fil <fil.html>',
          '',
          '   Rapportera ALDRIG butiken som klar utan den här kontrollen.',
        ].join('\n')
      );
      process.exit(2);
    }

    const svar = await hamtaStartsida(bas, losenord);
    html = svar.html;
    console.log(`Kundvy hämtad: ${svar.url} — HTTP ${svar.status}, ${html.length} tecken\n`);
    if (svar.status === 429 || /Verifying your connection/i.test(html)) {
      console.error('❌ Shopify svarade med en bot-kontroll (HTTP 429). Sidan gick inte att läsa som en kund.');
      process.exit(2);
    }
  }

  const res = kontrolleraKundvy(html, butik, produkt);
  console.log(rapport(res));
  process.exit(res.gron ? 0 : 1);
}
