// Delad testhjälp: läser butikskonfig + produktfil och väver ihop dem som
// ops.mjs gör. Testerna ska mäta samma objekt som fabriken faktiskt bygger på.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from '../yaml.mjs';
import { sammanfoga } from '../butik.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const BUTIKSFIL = join(ROT, 'butiker', 'testbutiken.yaml');
export const PRODUKTFIL = join(ROT, 'produkter', 'dummyprodukten.yaml');

export const rabutik = () => lasYaml(readFileSync(BUTIKSFIL, 'utf8'));
export const raprodukt = () => lasYaml(readFileSync(PRODUKTFIL, 'utf8'));

// Den sammanvävda produkten — det resten av fabriken läser.
export const dummy = () => sammanfoga(rabutik(), raprodukt());

// Samma produkt men med ett annat fraktupplägg, för tester som mäter
// fraktlogiken och inte butikens aktuella priser.
export const medButiksfrakt = (frakt) => sammanfoga({ ...rabutik(), frakt }, raprodukt());
