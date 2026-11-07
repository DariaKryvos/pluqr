import type { MetadataRoute } from 'next';
import { getProducts } from '../lib/shopify/catalog';
import { absoluteUrl, productPath } from '../lib/seo/site';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const entries:MetadataRoute.Sitemap=[{url:absoluteUrl(),changeFrequency:'daily',priority:1},{url:absoluteUrl('/over-pluqr'),changeFrequency:'monthly',priority:.7}];
 let cursor:string|null=null;
 do {
  const data=await getProducts(50,cursor);
  for(const product of data.products)entries.push({url:absoluteUrl(productPath(product.handle)),changeFrequency:'daily',priority:.8});
  cursor=data.pageInfo.hasNextPage?data.pageInfo.endCursor:null;
 }while(cursor);
 return entries;
}
