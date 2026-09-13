// Visar vilken Shopify-app nyckeln i miljön tillhör och vilka behörigheter
// den har. Kör efter att Axel bytt nyckel i Environments — svaret säger rakt
// ut om rabatter och ordrar går att nå.
//
//   node mejl/nyckelkoll.mjs

import { kravProxy, kravEnv, graphql } from './shopify.mjs';

kravProxy();

const { nyApp } = kravEnv();
const d = await graphql(`{ currentAppInstallation { app { title } accessScopes { handle } } }`);
const app = d.currentAppInstallation.app.title;
const scopes = d.currentAppInstallation.accessScopes.map((s) => s.handle).sort();
console.log(`App: ${app} (${nyApp ? 'nya namnet _SE_BAVER_SE' : 'gamla namnet _SE'})`);
console.log(`Behörigheter (${scopes.length}): ${scopes.join(' ')}`);

const KRAV = { rabatter: 'write_discounts', ordrar: 'read_orders', kunder: 'read_customers', sidor: 'write_content', teman: 'write_themes', filer: 'read_files' };
for (const [vad, scope] of Object.entries(KRAV)) {
  console.log(`${scopes.includes(scope) ? '✅' : '❌'} ${vad} (${scope})`);
}
