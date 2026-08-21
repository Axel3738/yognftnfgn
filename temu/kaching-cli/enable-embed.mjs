// Reads a theme's config/settings_data.json through the Shopify admin web proxy,
// and (with --write) adds the Kaching app-embed block to `current.blocks`.
// Read a store that already has Kaching working to get the exact block type.
import fs from 'node:fs';
import { launch, adminUrl, isLoginUrl, adminGraphql } from './lib/browser.mjs';

const store = process.argv[2];
const write = process.argv.includes('--write');
const blockTypeArg = process.argv.find((a) => a.startsWith('--type='))?.slice(7);

const READ = `query($id: ID!) {
  theme(id: $id) { id name files(filenames: ["config/settings_data.json"], first: 1) {
    nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } }
}`;
const MAIN = `{ themes(first: 1, roles: [MAIN]) { nodes { id name } } }`;
const UPSERT = `mutation($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
  themeFilesUpsert(themeId: $themeId, files: $files) {
    upsertedThemeFiles { filename }
    userErrors { filename message }
  }
}`;

const context = await launch({ headed: true });
try {
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(adminUrl(store), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  if (isLoginUrl(page.url())) throw new Error('inte inloggad');

  const themeRes = await adminGraphql(page, store, MAIN);
  const theme = themeRes.json?.data?.themes?.nodes?.[0];
  if (!theme) throw new Error(`hittade inget huvudtema: ${JSON.stringify(themeRes).slice(0, 400)}`);
  console.log(`Tema: ${theme.name} (${theme.id})`);

  const fileRes = await adminGraphql(page, store, READ, { id: theme.id });
  const raw = fileRes.json?.data?.theme?.files?.nodes?.[0]?.body?.content;
  if (!raw) throw new Error(`kunde inte läsa settings_data.json: ${JSON.stringify(fileRes).slice(0, 400)}`);

  const header = raw.match(/^\s*\/\*[\s\S]*?\*\/\s*/)?.[0] ?? '';
  const data = JSON.parse(raw.slice(header.length));
  const blocks = data.current?.blocks ?? {};
  console.log('Befintliga app-embed-block:');
  for (const [k, v] of Object.entries(blocks)) console.log(`  ${k}: ${v.type} (disabled=${v.disabled})`);
  if (!Object.keys(blocks).length) console.log('  (inga)');

  if (!write) { fs.writeFileSync(`recon/settings_data-${store}.json`, raw); process.exit(0); }

  if (!blockTypeArg) throw new Error('--write kräver --type=<block type>');
  const existing = Object.entries(blocks).find(([, v]) => v.type === blockTypeArg);
  if (existing && existing[1].disabled === false) { console.log('Embedden är redan på — rör inget.'); process.exit(0); }

  data.current.blocks = { ...blocks, ...(existing ? { [existing[0]]: { ...existing[1], disabled: false } } : { kaching_bundles: { type: blockTypeArg, disabled: false, settings: {} } }) };
  const next = header + JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(`recon/settings_data-${store}.new.json`, next);

  const up = await adminGraphql(page, store, UPSERT, {
    themeId: theme.id,
    files: [{ filename: 'config/settings_data.json', body: { type: 'TEXT', value: next } }],
  });
  console.log('themeFilesUpsert:', JSON.stringify(up.json?.data?.themeFilesUpsert ?? up).slice(0, 600));
} finally {
  await context.close();
}
