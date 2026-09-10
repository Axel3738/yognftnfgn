// Startskottet till Discord: texten som postas, pingen, gränsen. Inga nätanrop.
import test from 'node:test';
import assert from 'node:assert/strict';
import { byggDiscordText, DISCORD_MAXLANGD, valjServer, STARTSKOTT_SERVER } from '../startskott.mjs';

const SERVRAR = [
  { id: '1540322130388983921', name: 'Bäverbutiken' },
  { id: '1547541533476257803', name: 'AdventLane' },
];

test('servern väljs på namn eller id, default Bäverbutiken, aldrig första bästa', () => {
  assert.equal(valjServer(SERVRAR).id, '1540322130388983921');
  assert.equal(STARTSKOTT_SERVER, 'Bäverbutiken');
  assert.equal(valjServer(SERVRAR, 'adventlane').name, 'AdventLane');
  assert.equal(valjServer(SERVRAR, '1547541533476257803').name, 'AdventLane');
  assert.equal(valjServer(SERVRAR, 'TankGuard'), null);
  assert.equal(valjServer([], ''), null);
});

test('Discord-texten pingar Axel först och bär hela startskottet', () => {
  const text = byggDiscordText('**KLAR FÖR OPS: Motorhöljet**\nSiffror…', { pingId: '123' });
  assert.ok(text.startsWith('<@123>\n'));
  assert.match(text, /KLAR FÖR OPS: Motorhöljet/);
});

test('utan ping-id postas texten ändå — men larmet säger det', () => {
  const text = byggDiscordText('KLAR FÖR OPS: X', {});
  assert.ok(!text.includes('<@'));
  assert.match(text, /DISCORD_AXEL_ID saknas/);
});

test('texten kapas aldrig tyst över Discords gräns', () => {
  const lang = 'x'.repeat(DISCORD_MAXLANGD + 50);
  const text = byggDiscordText(lang, { pingId: '1' });
  assert.ok(text.length <= DISCORD_MAXLANGD);
  assert.match(text, /\[kapad\]$/);
});
