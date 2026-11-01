import { ShoppingBag, ArrowRight } from 'lucide-react';
import { getProducts } from '../lib/shopify/catalog';
import { homepageSchema } from '../lib/seo/structured-data';
import JsonLd from '../components/JsonLd';
import Navbar from '../components/Navbar';
import CartProvider from '../components/CartProvider';
import DeliveryChecker from '../components/DeliveryChecker';
import ScrollExperience from '../components/ScrollExperience';
import EditorialSection from '../components/EditorialSection';
export const dynamic='force-dynamic';
export default async function HomePage(){
 let catalog;
 try{catalog=await getProducts(12);}catch{catalog=undefined;}
 return <CartProvider><JsonLd data={homepageSchema(catalog?.products||[])}/><a className="skip-content" href="#producten">Skip animation</a><div className="opening-header"><DeliveryChecker/><Navbar/></div><main><ScrollExperience/><EditorialSection initialCatalog={catalog}/></main><a className="story-order-button floating-order-button" href="#producten" lang="nl">Bestel nu <ShoppingBag size={19} aria-hidden="true"/><ArrowRight size={18} aria-hidden="true"/></a></CartProvider>;}
