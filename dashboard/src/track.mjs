// Produktion eller översättning?
//
// Det är två olika arbeten med olika folk, olika tempo och olika problem. Att
// mäta dem tillsammans döljer båda: översättningarna står nästan still och drar
// ner produktionens siffror, medan produktionens fart döljer att
// översättningsköen växer.
//
// Notion har inget fält som skiljer dem åt, så det får härledas ur två signaler.
// Båda används, eftersom ingen av dem ensam täcker allt: 55 av 96 känns igen
// bara på statusen, 5 bara på titeln.

const BY_STATUS = /translat/i;
const BY_TITLE = /translat|to\s+(norwegian|english|danish|german|swedish|norsk|engelsk)|norwegian|norsk|engelsk/i;

/** 'translation' eller 'production'. */
export function trackOf(task) {
  if (BY_STATUS.test(task.observedStatus || '')) return 'translation';
  if (BY_TITLE.test(task.title || '')) return 'translation';
  return 'production';
}

export const TRACKS = {
  production: 'Produktion',
  translation: 'Översättning',
};
