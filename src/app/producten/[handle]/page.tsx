import BrandLogo from '../../../components/BrandLogo';
import SocialLinks from '../../../components/SocialLinks';
import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getProducts } from '../../../lib/shopify/catalog';
import { absoluteUrl, productPath, site } from '../../../lib/seo/site';
import { productSchema } from '../../../lib/seo/structured-data';
import CartProvider from '../../../components/CartProvider';
import Navbar from '../../../components/Navbar';
import DeliveryChecker from '../../../components/DeliveryChecker';
import JsonLd from '../../../components/JsonLd';
import ProductPageView from '../../../components/ProductPageView';
export const dynamic='force-dynamic';
type Props={params:Promise<{handle:string}>};
const readProduct=cache(getProduct);
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {handle}=await params;const product=await readProduct(handle);if(!product)notFound();
 const url=absoluteUrl(productPath(product.handle));
 const description=product.description||`${product.title} van PLUQR. Vegan, glutenvrij en vers gebakken. Bekijk de prijs en bestel online.`;
 const image=product.featuredImage?.url||absoluteUrl('/pluqr-social.jpg');
 return {title:product.title,description,alternates:{canonical:url},openGraph:{type:'website',siteName:site.name,locale:'nl_NL',url,title:`${product.title} | PLUQR`,description,images:[{url:image,alt:product.featuredImage?.altText||product.title}]},twitter:{card:'summary_large_image',title:`${product.title} | PLUQR`,description,images:[image]}};
}
export default async function ProductPage({params}:Props){
 const {handle}=await params;const product=await readProduct(handle);if(!product)notFound();
 let related;try{related=(await getProducts(12)).products;}catch{related=[product];}
 return <CartProvider><JsonLd data={productSchema(product)}/><div className="opening-header product-page-header"><DeliveryChecker/><Navbar/></div><main className="product-page"><Link href="/#producten" className="product-page-back">← Alle oliebollen</Link><ProductPageView key={product.id} initialProduct={product} related={related}/><footer className="site-footer product-page-site-footer"><SocialLinks/><div className="cinema-footer"><BrandLogo className="brand-logo-footer brand-logo-inverse"/><span>Vegan. Glutenvrij. Vers gebakken.</span><Link href="/#producten">Alle oliebollen ↗</Link></div><p className="site-credit">Made by Megokruto Tech</p></footer></main></CartProvider>;
}
