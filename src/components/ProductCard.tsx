'use client';
import {useEffect,useRef,useState} from 'react';
import {useCart} from './CartProvider';
import Link from 'next/link';
import { productPath } from '../lib/seo/site';
import { ShoppingBag, Check } from 'lucide-react';
import { formatMoney } from '../lib/shopify/money';
import type { ShopifyProduct } from '../lib/shopify/types';
interface Props { product: ShopifyProduct }
export default function ProductCard({product}:Props){
 const {add,busy,open}=useCart();
 const card=useRef<HTMLElement>(null);
 const [added,setAdded]=useState(false);
 const [failed,setFailed]=useState(false);
 const [adding,setAdding]=useState(false);
 const reset=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(reset.current)clearTimeout(reset.current);},[]);
 const variant=product.variants.nodes.find(item=>item.availableForSale);
 async function quickAdd(){
  if(!variant||busy)return;
  setFailed(false);setAdding(true);
  // Animate on tap so the add feels instant; the server reply only confirms or reports failure.
  const request=add(variant.id,1,variant.title==='Default Title'?'Naturel':undefined);
  flyToCart();
  const success=await request;
  setAdding(false);
  if(reset.current)clearTimeout(reset.current);
  if(!success){setFailed(true);reset.current=setTimeout(()=>setFailed(false),3500);return;}
  setAdded(true);
  if(reset.current)clearTimeout(reset.current);
  reset.current=setTimeout(()=>setAdded(false),3500);
 }
 function flyToCart(){
  const source=card.current?.querySelector('img');
  const target=document.querySelector('.nav-cart-button');
  if(source&&target&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   const from=source.getBoundingClientRect(),to=target.getBoundingClientRect();
   const flying=source.cloneNode() as HTMLImageElement;
   Object.assign(flying.style,{position:'fixed',left:`${from.left+from.width/2-32}px`,top:`${from.top+from.height/2-32}px`,width:'64px',height:'64px',objectFit:'cover',borderRadius:'50%',zIndex:'1000',pointerEvents:'none',boxShadow:'0 5px 20px #0003'});
   flying.alt='';flying.setAttribute('aria-hidden','true');document.body.appendChild(flying);
   const dx=to.left+to.width/2-(from.left+from.width/2),dy=to.top+to.height/2-(from.top+from.height/2);
   flying.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx*.45}px,${dy*.6-45}px) scale(.8)`,opacity:1,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(.2)`,opacity:0}],{duration:650,easing:'cubic-bezier(.25,.1,.25,1)'}).finished.then(()=>{flying.remove();target.animate([{transform:'scale(1)'},{transform:'scale(1.2)',offset:.45},{transform:'scale(1)'}],{duration:300,easing:'ease-out'});},()=>flying.remove());
  }
 }
 const count=product.packCount;
 const recommended=count===10;
 const varied=product.priceRange.minVariantPrice.amount!==product.priceRange.maxVariantPrice.amount;
 return <article ref={card} className={`shop-card golden-product-card${recommended?' is-recommended':''}`}>
  <Link className="shop-card-image" href={productPath(product.handle)} prefetch={false} aria-label={`Bekijk ${product.title}`}><img src={product.featuredImage?.url||'/videos/oliebol-slicing-poster.webp'} width={product.featuredImage?.width||1280} height={product.featuredImage?.height||720} alt={product.featuredImage?.altText||product.title} loading="lazy"/>{recommended&&<span className="pack-card-badge">Meest populair</span>}</Link>
  <div className="shop-card-body"><div className="shop-card-title"><h3><Link className="shop-card-page-link" href={productPath(product.handle)} prefetch={false}>{product.title}</Link></h3></div>{count&&<p className="clean-pack-count">{count} stuks{variant?.title==='Default Title'?' · Naturel':''}</p>}<div className="pack-card-purchase"><div className="shop-card-price"><strong>{varied&&<small>Vanaf </small>}{formatMoney(product.priceRange.minVariantPrice)}</strong></div>{(added||failed)&&<span className={`card-add-feedback${failed?' is-error':''}`}>{failed?'Toevoegen mislukt. Probeer opnieuw.':<>In je winkelmand <button type="button" className="card-view-cart" onClick={open}>Bekijk →</button></>}</span>}<button className="pack-card-add" type="button" disabled={adding||!variant} aria-label={`Voeg ${product.title} toe aan je winkelmand${variant?.title==='Default Title'?' — Naturel':''}`} title="Direct in je winkelmand" onClick={()=>void quickAdd()}>{added?<Check size={18} aria-hidden="true"/>:<ShoppingBag size={18} strokeWidth={1.6} aria-hidden="true"/>}</button></div><span className="sr-only" role="status" aria-live="polite">{failed?'Toevoegen mislukt. Probeer opnieuw.':added?`${product.title} in je winkelmand${variant?.title==='Default Title'?' · Naturel':''}`:''}</span></div>
 </article>;
}
