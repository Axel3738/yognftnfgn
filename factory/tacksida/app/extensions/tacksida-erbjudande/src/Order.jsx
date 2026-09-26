// Orderstatussidan (customer-account.order-status.block.render) — kunden
// kommer tillbaka via orderbekräftelsen. Samma kort, men gömmer sig när
// giltighetstiden gått (se Erbjudande.jsx).
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { Erbjudande } from './Erbjudande.jsx';

export default function extension() {
  render(<Erbjudande plats="orderstatus" />, document.body);
}
