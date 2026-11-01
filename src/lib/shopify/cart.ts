import 'server-only';
import { storefrontQuery } from './client.ts';
import { ShopifyError } from './errors.ts';
import { CART_ADD, CART_CREATE, CART_QUERY, CART_REMOVE, CART_UPDATE } from './queries.ts';
import type { CartMutationResult, ShopifyCart } from './types.ts';
export async function getCart(id: string) {
  const data = await storefrontQuery<{cart: ShopifyCart | null}>(CART_QUERY, {id});
  return data.cart;
}
function result(payload: CartMutationResult) {
  if (payload.userErrors.length) throw new ShopifyError('CART_REJECTED', 'Deze winkelmandwijziging is niet mogelijk. Controleer de voorraad en productkeuze.', 422);
  if (!payload.cart) throw new ShopifyError('CART_UNAVAILABLE', 'De winkelmand is niet beschikbaar. Vernieuw de pagina.', 409);
  return {cart: payload.cart, warnings: payload.warnings};
}
export async function addCartLines(cartId: string | null, lines: {merchandiseId: string; quantity: number}[]) {
  if (!cartId) {
    const data = await storefrontQuery<{cartCreate: CartMutationResult}>(CART_CREATE, {lines});
    return result(data.cartCreate);
  }
  const data = await storefrontQuery<{cartLinesAdd: CartMutationResult}>(CART_ADD, {cartId, lines});
  return result(data.cartLinesAdd);
}
export async function updateCartLines(cartId: string, lines: {id: string; quantity: number}[]) {
  const data = await storefrontQuery<{cartLinesUpdate: CartMutationResult}>(CART_UPDATE, {cartId, lines});
  return result(data.cartLinesUpdate);
}
export async function removeCartLines(cartId: string, lineIds: string[]) {
  const data = await storefrontQuery<{cartLinesRemove: CartMutationResult}>(CART_REMOVE, {cartId, lineIds});
  return result(data.cartLinesRemove);
}
