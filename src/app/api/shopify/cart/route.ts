import { NextResponse } from 'next/server';
import { addCartLines, getCart, removeCartLines, updateCartLines } from '../../../../lib/shopify/cart';
import { ShopifyError } from '../../../../lib/shopify/errors';
import { apiResponse, json, readMutation } from '../../../../lib/shopify/http';
import { parseAddLines, parseRemoveLines, parseUpdateLines } from '../../../../lib/shopify/validation';
import { CART_COOKIE as COOKIE, getCartSessionId as cartId } from '../../../../lib/shopify/session';
import type { ShopifyCart } from '../../../../lib/shopify/types';

function cartResponse(cart: ShopifyCart, warnings: {code: string}[] = []) {
  const {id, ...publicCart} = cart;
  const response = NextResponse.json({cart: publicCart, warnings: warnings.map(({code}) => ({code}))}, {headers: {'Cache-Control':'no-store'}});
  response.cookies.set(COOKIE, id, {httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge:60*60*24*7});
  return response;
}
async function existingCartId() {
  const id = await cartId();
  if (!id) throw new ShopifyError('CART_NOT_FOUND', 'Je winkelmand is nog leeg. Voeg eerst een product toe.', 404);
  return id;
}
export async function GET() {
  return apiResponse(async () => {
    const id = await cartId();
    if (!id) return json({cart:null});
    const cart = await getCart(id);
    if (cart) return cartResponse(cart);
    const response = NextResponse.json({cart:null}, {headers:{'Cache-Control':'no-store'}});
    response.cookies.delete(COOKIE);
    return response;
  });
}
export async function POST(request: Request) {
  return apiResponse(async () => {
    const lines = parseAddLines(await readMutation(request));
    // An expired Shopify cart is replaced only when adding a new selection.
    const result = await addCartLines(await cartId(), lines);
    return cartResponse(result.cart, result.warnings);
  });
}
export async function PATCH(request: Request) {
  return apiResponse(async () => {
    const lines = parseUpdateLines(await readMutation(request));
    const result = await updateCartLines(await existingCartId(), lines);
    return cartResponse(result.cart, result.warnings);
  });
}
export async function DELETE(request: Request) {
  return apiResponse(async () => {
    const lineIds = parseRemoveLines(await readMutation(request));
    const result = await removeCartLines(await existingCartId(), lineIds);
    return cartResponse(result.cart, result.warnings);
  });
}
