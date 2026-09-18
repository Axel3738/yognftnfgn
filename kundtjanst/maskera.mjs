// maskera.mjs — kundadresser maskeras i ALLT som skrivs, postas eller visas.
// Egen fil för att både run.mjs och dashboard.mjs behöver den utan att importera
// varandra. `ka***@gmail.com`: nog för att känna igen kunden, inte nog för att
// sprida adressen. Ordernumret är nyckeln VA:n söker på.

/** ka***@gmail.com — nog för att känna igen, inte nog för att sprida. */
export function maskeraAdress(adress) {
  const s = String(adress ?? '');
  const i = s.indexOf('@');
  if (i === -1) return s ? `${s.slice(0, 2)}***` : '';
  return `${s.slice(0, Math.min(2, i))}***@${s.slice(i + 1)}`;
}

/** Maskerar adresser i en text (rapporter, detaljer). */
export function maskeraText(text) {
  return String(text ?? '').replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, (a) => maskeraAdress(a));
}
