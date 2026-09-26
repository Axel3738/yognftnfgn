// Tacksidan (purchase.thank-you.block.render) — visas direkt efter betalningen.
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { Erbjudande } from './Erbjudande.jsx';

export default function extension() {
  render(<Erbjudande plats="tack" />, document.body);
}
