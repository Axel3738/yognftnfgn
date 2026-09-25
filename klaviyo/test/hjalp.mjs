// Delade fixturer för Klaviyo-testerna. Inget nät.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HAR = dirname(fileURLToPath(import.meta.url));
export const FIXTURER = join(HAR, 'fixturer');
export const ROTEN = join(HAR, '..', '..');
export const lasJson = (fil) => JSON.parse(readFileSync(fil, 'utf8'));
export const PRODUKTER = lasJson(join(FIXTURER, 'produkter.json'));
export const RECENSIONER = lasJson(join(FIXTURER, 'recensioner.json'));
export const BRAND = lasJson(join(ROTEN, 'klaviyo', 'brands', 'baverbutiken.json'));
export const KAMPANJ = lasJson(join(FIXTURER, 'innehall', 'kampanjer', 'k01-test-motorholje.json'));
export const FLODE = lasJson(join(FIXTURER, 'innehall', 'floden', 'f02-test-kassa.json'));

// Ett giltigt minimimejl att bryta sönder i testerna.
export function mejl(over = {}) {
  return {
    id: 'm-test',
    namn: 'MAIL_test',
    memo: 'Hypotes: test.',
    taggar: { urgency: 'ingen' },
    amnesrader: [{ text: 'Rad A', begar: 'x' }, { text: 'Rad B', begar: 'x' }, { text: 'Rad C', begar: 'x' }],
    forhandstext: 'Förhandstext.',
    block: [{ typ: 'text', text: 'Hej {{fornamn}}, här är texten.' }],
    tretest: [{ rad: 'ämnesrad A', visualisera: true, falsifiera: true, ingen_annan: true }],
    ...over,
  };
}
