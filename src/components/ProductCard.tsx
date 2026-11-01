import Link from 'next/link';
import { productPath } from '../lib/seo/site';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import { formatMoney } from '../lib/shopify/money';
import type { ShopifyProduct } from '../lib/shopify/types';
interface Props { product: ShopifyProduct; index: number; onSelect: (product: ShopifyProduct) => void }
export default function ProductCard({product,index,onSelect}:Props) {
 const image=product.featuredImage;
 const variedPrice=product.priceRange.minVariantPrice.amount!==product.priceRange.maxVariantPrice.amount;
 return <article className="shop-card">
  <button className="shop-card-image" onClick={()=>onSelect(product)} aria-label={`Bekijk ${product.title}`}><span className="shop-card-number">{String(index+1).padStart(2,'0')}</span><img src={image?.url||'/videos/oliebol-slicing-poster.webp'} width={image?.width||1280} height={image?.height||720} alt={image?.altText||product.title} loading="lazy"/><span className="shop-card-image-link" aria-hidden="true"><ArrowUpRight size={19}/></span></button>
  <div className="shop-card-body"><p className="shop-card-note">PLUQR · Met liefde gemaakt</p><div className="shop-card-title"><h3><Link href={productPath(product.handle)} prefetch={false}>{product.title}</Link></h3><span>{variedPrice?'Vanaf ':''}{formatMoney(product.priceRange.minVariantPrice)}</span></div><p className="shop-card-description">{product.description}</p><button className="product-buy-button" aria-label={`Bekijk opties voor ${product.title}`} onClick={()=>onSelect(product)}>{product.availableForSale?'Bestel nu':'Bekijk product'} <ShoppingBag size={17} aria-hidden="true"/></button></div>
 </article>;
}
