// Rätt sida svarar på rätt annons (Axels krav 2026-09-25): CaraShells
// kommentarer besvaras från CaraShells sida, Bäverbutikens från Bäverbutikens.
// Varför får raden INTE postas från sin sida? null = den får.
export function felSida(r, sidor) {
  if (!r.sida) return 'raden saknar sida';
  if (sidor[r.sida] !== r.verksamhet) return `sidan ${r.sida} hör till ${sidor[r.sida] ?? 'okänd verksamhet'}, raden till ${r.verksamhet}`;
  if (r.kanal !== 'instagram' && !String(r.post ?? '').startsWith(`${r.sida}_`)) return `inlägget ${r.post} ägs inte av sidan ${r.sida}`;
  if (r.konflikt) return `länk och sida säger olika verksamhet (${r.konflikt})`;
  return null;
}
