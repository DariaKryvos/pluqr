import { packs } from './packs.ts';
import 'server-only';
import { storefrontQuery } from './client.ts';
import { PRODUCT_QUERY, PRODUCTS_QUERY, SHOP_QUERY } from './queries.ts';
import type { PageInfo, ShopifyProduct } from './types.ts';
export async function getProducts(first = 12, after: string | null = null) {
  const data = await storefrontQuery<{products: { nodes: ShopifyProduct[]; pageInfo: PageInfo }}>(PRODUCTS_QUERY, {first, after});
  return {products: data.products.nodes.map(normalizeProduct), pageInfo: data.products.pageInfo};
}
export async function getProduct(handle: string) {
  const data = await storefrontQuery<{product: ShopifyProduct | null}>(PRODUCT_QUERY, {handle});
  return data.product?normalizeProduct(data.product):null;
}
export async function getShop() {
  return storefrontQuery<{shop: {name: string; description: string; primaryDomain: {url: string}}}>(SHOP_QUERY);
}

function normalizeProduct(product:ShopifyProduct):ShopifyProduct{
 const pack=packs[product.handle];
 const title=pack?.title||product.title.replace(/\bolliebollen\b/gi,'Oliebollen').replace(/\s+0\d+$/,'').trim();
 const raw=product.packCountMetafield?.value;
 const count=raw?Number(raw):pack?.count;
 const featuredImage=pack&&count===pack.count?{url:pack.photo,altText:`${count} oliebollen op een bord — ${title}`,width:1280,height:1280}:product.featuredImage;
 return {...product,title,featuredImage,...(count&&Number.isInteger(count)&&count>0&&count<=1000?{packCount:count}:{})};
}
