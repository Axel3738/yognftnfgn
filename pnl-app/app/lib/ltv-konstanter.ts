/** Delas av räknemotorn (server) och LTV-sidan (klient). Ingen serverkod här. */

/** Dagar efter kundens första order. */
export const HORISONTER = [30, 60, 90, 180] as const;
export type Horisont = (typeof HORISONTER)[number];

/** Kohortrad visas bara med minst så många nya kunder. */
export const MIN_KOHORT = 50;
/** Prognos/max-CPA kräver minst så många mogna kohorter i poolen … */
export const MIN_POOL_KOHORTER = 2;
/** … med minst så många kunder sammanlagt … */
export const MIN_POOL_KUNDER = 300;
/** … och minst så många återköpsordrar (annars räknas AOVr på en handfull köp). */
export const MIN_POOL_ATERKOP = 30;
/** Standardhorisont för max-CPA när butiken inte valt någon. */
export const STANDARD_HORISONT: Horisont = 90;
