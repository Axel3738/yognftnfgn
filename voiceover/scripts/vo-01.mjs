// Manus-våg 01. Varje klipp: { name, text (svenska — det som läses upp), voice?, model? }.
//
// eleven_v3 förstår audio-tags i hakparenteser mitt i texten, t.ex. [paus], [allvarligt],
// [viskar], [glad]. Använd sparsamt — de färgar leveransen, de läses inte upp.

export const clips = [
  {
    name: 'VO-01-exempel',
    text:
      'Hej [glad] — det här är rösten Svensk Martin på modellen eleven v3. ' +
      '[paus] Byt ut den här texten mot ditt eget manus.',
  },
];
