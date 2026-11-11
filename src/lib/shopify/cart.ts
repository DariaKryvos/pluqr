import { packs } from './packs.ts';
import 'server-only';
import { storefrontQuery } from './client.ts';
import { ShopifyError } from './errors.ts';
import { CART_ADD, CART_CREATE, CART_QUERY, CART_REMOVE, CART_UPDATE } from './queries.ts';
import type { CartMutationResult, ShopifyCart } from './types.ts';
export async function getCart(id: string) {
  const data = await storefrontQuery<{cart: ShopifyCart | null}>(CART_QUERY, {id});
  return data.cart?normalizeCart(data.cart):null;
}
function result(payload: CartMutationResult) {
  if (payload.userErrors.length) throw new ShopifyError('CART_REJECTED', 'Deze winkelmandwijziging is niet mogelijk. Controleer de voorraad en productkeuze.', 422);
  if (!payload.cart) throw new ShopifyError('CART_UNAVAILABLE', 'De winkelmand is niet beschikbaar. Vernieuw de pagina.', 409);
  return {cart: normalizeCart(payload.cart), warnings: payload.warnings};
}
export async function addCartLines(cartId: string | null, lines: {merchandiseId: string; quantity: number; attributes?: {key:string;value:string}[]}[]) {
  if (!cartId) {
    const data = await storefrontQuery<{cartCreate: CartMutationResult}>(CART_CREATE, {lines});
    return result(data.cartCreate);
  }
  const data = await storefrontQuery<{cartLinesAdd: CartMutationResult}>(CART_ADD, {cartId, lines});
  // An expired cart comes back as null; replace it instead of paying for a lookup on every add.
  if (!data.cartLinesAdd.cart) return addCartLines(null, lines);
  return result(data.cartLinesAdd);
}
export async function updateCartLines(cartId: string, lines: {id: string; quantity: number; attributes?: {key:string;value:string}[]}[]) {
  if(lines.some(line=>line.attributes)){
    const cart=await getCart(cartId);
    lines=lines.map(line=>{
      if(!line.attributes)return line;
      const existing=cart?.lines.nodes.find(item=>item.id===line.id);
      if(!existing)throw new ShopifyError('CART_REJECTED','Dit product staat niet meer in je winkelmand.',422);
      return {...line,attributes:[...(existing.attributes||[]).filter(item=>item.key!=='Variatie'),...line.attributes]};
    });
  }
  const data = await storefrontQuery<{cartLinesUpdate: CartMutationResult}>(CART_UPDATE, {cartId, lines});
  return result(data.cartLinesUpdate);
}
export async function removeCartLines(cartId: string, lineIds: string[]) {
  const data = await storefrontQuery<{cartLinesRemove: CartMutationResult}>(CART_REMOVE, {cartId, lineIds});
  return result(data.cartLinesRemove);
}

function normalizeCart(cart:ShopifyCart):ShopifyCart{
 if(!cart.lines)return cart;
 return {...cart,lines:{...cart.lines,nodes:cart.lines.nodes.map(line=>{
  const product=line.merchandise.product;
  const pack=packs[product.handle];
  const title=pack?.title||product.title;
  const raw=product.packCountMetafield?.value;
  const count=raw?Number(raw):pack?.count;
  const featuredImage=pack&&count===pack.count?{url:pack.photo,altText:`${count} oliebollen op een bord — ${title}`,width:1280,height:1280}:product.featuredImage;
  return {...line,merchandise:{...line.merchandise,product:{...product,title,featuredImage}}};
 })}};
}
