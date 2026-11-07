'use client';

import Link from 'next/link';
import { productPath } from '../lib/seo/site';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { formatMoney } from '../lib/shopify/money';
import type { ShopifyProduct } from '../lib/shopify/types';
import { useCart } from './CartProvider';
import ProductShare from './ProductShare';
import TrustpilotBadge from './TrustpilotBadge';
import IngredientList from './IngredientList';
import ProductCard from './ProductCard';
interface Props { product: ShopifyProduct; related: ShopifyProduct[]; headingLevel?: 'h1'|'h2'; onAdded?: () => void; minimal?: boolean }
export default function ProductDetails({product,related,headingLevel='h2',onAdded,minimal=false}:Props){
 const Heading=headingLevel;
 const title=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{title.current?.focus({preventScroll:true});},[]);
 const [variantId,setVariantId]=useState((product.variants.nodes.find(item=>item.availableForSale)||product.variants.nodes[0])?.id);
 const [quantity,setQuantity]=useState(1);
 const [added,setAdded]=useState(false);
 const {add,open,busy,error}=useCart();
 const variant=product.variants.nodes.find(item=>item.id===variantId);
 useEffect(()=>{setAdded(false);},[variant?.price.amount,variant?.price.currencyCode,variant?.availableForSale]);
 const flavourLabels=['Naturel','Rozijnen','Mix van naturel & rozijnen'];
 const hasFlavourVariants=product.variants.nodes.some(item=>item.title!=='Default Title');
 const productFlavour=product.title.toLowerCase().includes('mix')?flavourLabels[2]:product.title.toLowerCase().includes('naturel')?flavourLabels[0]:product.title.toLowerCase().includes('rozijn')?flavourLabels[1]:null;
 const [flavour,setFlavour]=useState(productFlavour||flavourLabels[0]);
 const image=product.featuredImage;
 const price=variant?.price||product.priceRange.minVariantPrice;
 async function addSelection(){
  if(!variant)return;
  const success=await add(variant.id,quantity,hasFlavourVariants?undefined:flavour);
  if(!success)return;
  setAdded(true);
  onAdded?.();
 }
 return <><div className={`product-detail-layout${minimal?' quick-order-layout':''}`}><div className="product-detail-photo"><img src={image?.url||'/videos/oliebol-slicing-poster.webp'} alt={image?.altText||product.title} width={image?.width||1280} height={image?.height||720}/>{!minimal&&<span>Vegan · Glutenvrij · Vers gebakken</span>}</div><div className="product-detail-content">{!minimal&&<p className="scene-eyebrow">PLUQR · Mijn winkel</p>}<Heading ref={title} tabIndex={-1} id="product-dialog-title">{product.title}</Heading><p className="product-detail-price">{formatMoney(price)} <span>{price.currencyCode}</span></p>{product.packCount&&<p className="detail-pack-summary">{product.packCount} oliebollen · {formatMoney({...price,amount:String(Number(price.amount)/product.packCount)})} per stuk</p>}{!minimal&&<p className="product-detail-description">{product.description}</p>}
  {(product.variants.nodes.length>1||variant?.title!=='Default Title')&&product.variants.nodes.length>0&&<fieldset className="product-options"><legend>Variatie</legend><div className="variation-options">{product.variants.nodes.map(option=><label key={option.id} className={variantId===option.id?'is-active':''}><input type="radio" name="product-variant" value={option.id} checked={variantId===option.id} disabled={!option.availableForSale||busy} onChange={()=>{setVariantId(option.id);setAdded(false);}}/><span>{option.title}{!option.availableForSale?' · Uitverkocht':''}</span></label>)}</div></fieldset>}
  {!hasFlavourVariants&&<fieldset className="product-options"><legend>Variatie</legend><div className="variation-options">{flavourLabels.map(label=><label key={label} className={flavour===label?'is-active':''}><input type="radio" name="product-flavour" checked={flavour===label} disabled={busy} onChange={()=>{setFlavour(label);setAdded(false);}}/><span>{label}</span></label>)}</div></fieldset>}
  <div className="product-quantity-row"><div><span className="detail-field-label" id="quantity-label">Aantal</span><div className="quantity-control"><button aria-label="Eén minder" disabled={quantity<=1||busy} onClick={()=>{setQuantity(value=>value-1);setAdded(false);}}><Minus size={14}/></button><output aria-labelledby="quantity-label">{quantity}</output><button aria-label="Eén meer" disabled={quantity>=99||busy} onClick={()=>{setQuantity(value=>value+1);setAdded(false);}}><Plus size={14}/></button></div></div><span className="detail-subtotal">{formatMoney(price,quantity)}</span></div>
  <button className="product-buy-button detail-add-button" disabled={busy||!variant?.availableForSale} onClick={()=>void addSelection()}>{busy?'Even geduld…':!variant?.availableForSale?'Uitverkocht':added?<><Check size={18}/>Nogmaals toevoegen</>:<>Aan winkelwagen toevoegen <ShoppingBag size={18}/></>}</button><div className="detail-cart-feedback" role="status" aria-live="polite">{error?<span>{error}</span>:added&&<><span>Toegevoegd aan je winkelmand.</span><button onClick={open}>Bekijk winkelmand <ArrowUpRight size={14}/></button></>}</div>
  <div className="product-detail-secondary"><ProductShare handle={product.handle} title={product.title}/><TrustpilotBadge/></div>
  {!minimal&&<><div className="product-detail-description-block"><h3>Met liefde gemaakt</h3><p>Heerlijke oliebollen die bij jouw voorkeuren passen, met alle smaak die je kent.</p><ul><li>Vegan en glutenvrij</li><li>Vers gebakken</li><li>Vol van smaak</li></ul></div>
  <section className="product-detail-ingredients" aria-labelledby="detail-ingredients-title"><h3 id="detail-ingredients-title">Ingrediënten basisrecept</h3><IngredientList/>{product.title.toLowerCase().includes('rozijn')&&<p className="variant-ingredient-note">Dit is het basisrecept. De volledige ingrediëntenlijst voor de rozijnenvarianten volgt.</p>}</section></>}
 {minimal&&<Link className="quick-order-details-link" href={productPath(product.handle)} prefetch={false}>Bekijk productinformatie <ArrowUpRight size={13} aria-hidden="true"/></Link>}
 </div></div>{!minimal&&related.length>1&&<section className="related-products" aria-labelledby="related-title"><p className="scene-eyebrow">Nog meer om van te genieten</p><h3 id="related-title">Dit vind je misschien ook lekker.</h3><div className="shop-grid related-card-grid">{related.filter(item=>item.id!==product.id).map(item=><ProductCard key={item.id} product={item}/>)}</div></section>}</>;
}
