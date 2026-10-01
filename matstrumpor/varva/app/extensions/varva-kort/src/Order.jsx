// Orderstatussidan (customer-account.order-status.block.render) — kunden kommer
// tillbaka via mejlet eller kundkontot och hittar länken igen. En avbruten
// order visar inget kort (Kort.jsx).
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { Kort } from './Kort.jsx';

export default function extension() {
  render(<Kort plats="orderstatus" />, document.body);
}
