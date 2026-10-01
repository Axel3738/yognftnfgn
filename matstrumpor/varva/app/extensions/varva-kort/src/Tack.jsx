// Tacksidan (purchase.thank-you.block.render) — visas direkt efter betalningen.
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { Kort } from './Kort.jsx';

export default function extension() {
  render(<Kort plats="tack" />, document.body);
}
