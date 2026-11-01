import 'server-only';
import { storefrontQuery } from './client.ts';
import { getShopifyConfig } from './config.ts';
import { ShopifyError } from './errors.ts';

const CHECKOUT_QUERY = `query Checkout($id: ID!) {
  cart(id: $id) { totalQuantity checkoutUrl }
  shop { primaryDomain { url } }
}`;

export function validateCheckoutUrl(value: string, primaryDomain: string) {
  try {
    const url = new URL(value);
    const shop = new URL(getShopifyConfig().endpoint).hostname;
    const primary = new URL(primaryDomain).hostname;
    if (url.protocol !== 'https:' || url.username || url.password || url.port || ![shop, primary, 'checkout.shopify.com'].includes(url.hostname)) throw new Error();
    return url.toString();
  } catch {
    throw new ShopifyError('CHECKOUT_UNAVAILABLE', 'De betaalpagina is tijdelijk niet beschikbaar. Probeer opnieuw.', 502);
  }
}

export async function getCheckoutUrl(id: string) {
  // Fetch a fresh URL only when the buyer chooses to check out, not on every poll.
  const data = await storefrontQuery<{
    cart: { totalQuantity: number; checkoutUrl: string } | null;
    shop: { primaryDomain: { url: string } };
  }>(CHECKOUT_QUERY, {id});
  if (!data.cart) throw new ShopifyError('CART_NOT_FOUND', 'Je winkelmand is verlopen. Voeg je producten opnieuw toe.', 404);
  if (!data.cart.totalQuantity) throw new ShopifyError('CART_EMPTY', 'Je winkelmand is nog leeg.', 400);
  return validateCheckoutUrl(data.cart.checkoutUrl, data.shop.primaryDomain.url);
}
