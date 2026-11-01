import 'server-only';
import { storefrontQuery } from './client.ts';
import { PRODUCT_QUERY, PRODUCTS_QUERY, SHOP_QUERY } from './queries.ts';
import type { PageInfo, ShopifyProduct } from './types.ts';
export async function getProducts(first = 12, after: string | null = null) {
  const data = await storefrontQuery<{products: { nodes: ShopifyProduct[]; pageInfo: PageInfo }}>(PRODUCTS_QUERY, {first, after});
  return {products: data.products.nodes, pageInfo: data.products.pageInfo};
}
export async function getProduct(handle: string) {
  const data = await storefrontQuery<{product: ShopifyProduct | null}>(PRODUCT_QUERY, {handle});
  return data.product;
}
export async function getShop() {
  return storefrontQuery<{shop: {name: string; description: string; primaryDomain: {url: string}}}>(SHOP_QUERY);
}
