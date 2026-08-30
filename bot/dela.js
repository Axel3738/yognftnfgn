// Delar text i Discord-lagom bitar. Samma logik som agent/discord-post.mjs —
// medvetet kopierad hit, eftersom Railway bara bygger den här mappen och
// bot/ därför måste vara självbärande. Båda kopiorna har egna tester.

// Discords hårda gräns är 2000 tecken för bottar. Marginalen rymmer rubrik,
// sidnumrering och de ``` splittern själv lägger till.
export const MAX_TECKEN = 1900;

/**
 * Delar på radgräns, aldrig mitt i en rad, och lämnar aldrig ett kodblock
 * öppet — ett öppet ``` färgar resten av kanalen som kod hos alla som läser.
 */
export function dela(text, max = MAX_TECKEN) {
  const rent = String(text ?? '').trim();
  if (!rent) return [];
  if (rent.length <= max) return [rent];

  const bitar = [];
  let nuvarande = '';
  let iKodblock = false;

  const spola = () => {
    if (!nuvarande.trim()) { nuvarande = ''; return; }
    bitar.push(iKodblock ? `${nuvarande.trimEnd()}\n\`\`\`` : nuvarande.trimEnd());
    nuvarande = iKodblock ? '```\n' : '';
  };

  for (const rad of rent.split('\n')) {
    // En ensam rad längre än taket måste huggas hårt.
    const delar = rad.length > max ? rad.match(new RegExp(`.{1,${max - 10}}`, 'g')) : [rad];
    for (const del of delar) {
      if (nuvarande.length + del.length + 1 > max) spola();
      nuvarande += `${del}\n`;
      if (del.trimStart().startsWith('```')) iKodblock = !iKodblock;
    }
  }
  spola();
  return bitar;
}
