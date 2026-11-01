import 'server-only';
import { cookies } from 'next/headers';
export const CART_COOKIE = 'pluqr_shopify_cart';
export async function getCartSessionId() {
  const value = (await cookies()).get(CART_COOKIE)?.value;
  return value && value.startsWith('gid://shopify/Cart/') && value.length < 2048 ? value : null;
}
