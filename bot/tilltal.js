// Avgör om ett meddelande är riktat till boten. Ren funktion utan
// discord.js-typer så den går att testa utan nätverk.
//
// Boten svarade förut på varenda rad i servern. I en kanal där teamet pratar
// med varandra betyder det att den lägger sig i varje samtal — och varje
// svar kostar ett Claude-anrop. Nu krävs att någon faktiskt vänder sig till
// den: taggar den, svarar på ett av dess inlägg, eller skriver i DM.

/** `<@123>` och `<@!123>` är Discords två sätt att skriva en användartagg. */
const tagg = (botId) => new RegExp(`<@!?${botId}>`, 'g');

export function ärTilltalad({ innehåll, botId, nämnda = [], svarPåBot = false, dm = false }) {
  if (dm) return true;
  if (svarPåBot) return true;
  if (nämnda.includes(botId)) return true;
  // @everyone/@here och roll-taggar räknas inte — de är inte riktade till boten.
  return tagg(botId).test(String(innehåll ?? ''));
}

/** Texten utan själva taggen, så Claude inte ser `<@123>` i frågan. */
export function utanTilltal(innehåll, botId) {
  return String(innehåll ?? '').replace(tagg(botId), ' ').replace(/\s+/g, ' ').trim();
}
