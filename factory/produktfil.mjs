// produktfil.mjs — hitta produktfilen på produkt-ID, inte på filnamn.
//
// Filnamnet är inte alltid id:t: `tacklebay-spohallaren.yaml` bär
// `produkt.id: fiskespohallare-4-pack` (flerproduktsbutik, 2026-09-09).
// Fyra fas-2-verktyg slog upp `produkter/<id>.yaml` rakt av och dog med
// ENOENT på TackleBay (2026-09-10). Ett uppslag, en modul, noll beroenden.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

/** Sökvägen till produktfilen för `produktId` — filnamnet först, sen produkt.id. null om ingen. */
export function hittaProduktfil(produktId, { mapp = join(FACTORY_ROT, 'produkter') } = {}) {
  if (!text(produktId) || !existsSync(mapp)) return null;
  const direkt = join(mapp, `${produktId}.yaml`);
  const kandidater = [direkt, ...readdirSync(mapp).filter((f) => f.endsWith('.yaml')).map((f) => join(mapp, f))];
  for (const fil of kandidater) {
    if (!existsSync(fil)) continue;
    try {
      if (lasYaml(readFileSync(fil, 'utf8'))?.produkt?.id === produktId) return fil;
    } catch {
      // en trasig fil i mappen ska inte stoppa uppslaget
    }
  }
  return null;
}

/** Läser produktfilen. Kastar med ett läsbart skäl när den saknas. */
export function lasProduktfil(produktId, alternativ = {}) {
  const fil = hittaProduktfil(produktId, alternativ);
  if (!fil) throw new Error(`Ingen produktfil med produkt.id "${produktId}" i factory/produkter/ — stoppar. Leta aldrig upp butiken på gissning.`);
  return { fil, p: lasYaml(readFileSync(fil, 'utf8')) };
}
