'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveRefresh } from '../hooks/useLiveRefresh';
import { shopifyApi } from '../lib/shopify/browser';
import { productPath } from '../lib/seo/site';
import type { ShopifyProduct } from '../lib/shopify/types';
import ProductDetails from './ProductDetails';
export default function ProductPageView({initialProduct,related}:{initialProduct:ShopifyProduct;related:ShopifyProduct[]}){
 const [product,setProduct]=useState(initialProduct);
 const router=useRouter();
 useLiveRefresh(()=>{void shopifyApi<{product:ShopifyProduct}>(`products/${encodeURIComponent(initialProduct.handle)}`).then(data=>setProduct(data.product)).catch(()=>{});});
 return <ProductDetails key={initialProduct.id} product={product} related={related} headingLevel="h1" onSelect={item=>router.push(productPath(item.handle))}/>;
}
