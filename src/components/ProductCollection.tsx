'use client';

import { useEffect, useRef, useState } from 'react';
import { Leaf, WheatOff, Croissant, X } from 'lucide-react';
import ProductCard from './ProductCard';
import TrustpilotBadge from './TrustpilotBadge';
import ProductDetails from './ProductDetails';
import { useLiveRefresh } from '../hooks/useLiveRefresh';
import { shopifyApi } from '../lib/shopify/browser';
import type { PageInfo, ShopifyProduct } from '../lib/shopify/types';
export default function ProductCollection({initialCatalog}:{initialCatalog?:{products:ShopifyProduct[];pageInfo:PageInfo}}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [revision,setRevision]=useState(0);
 const [selected,setSelected]=useState<ShopifyProduct|null>(null);
 const [products,setProducts]=useState<ShopifyProduct[]>(initialCatalog?.products||[]);
 const [pageInfo,setPageInfo]=useState<PageInfo|null>(initialCatalog?.pageInfo||null);
 const [loading,setLoading]=useState(!initialCatalog);
 const [error,setError]=useState<string|null>(null);
 const fetching=useRef(false);
 const pages=useRef(1);
 async function load(after?:string, background=false){
  if(fetching.current)return;
  fetching.current=true;
  if(!background)setLoading(true);
  try{
   const page=async(cursor?:string)=>shopifyApi<{products:ShopifyProduct[];pageInfo:PageInfo}>(`products?first=12${cursor?`&after=${encodeURIComponent(cursor)}`:''}`);
   let data=await page(after);
   let refreshed=data.products;
   if(background){
    for(let index=1;index<pages.current&&data.pageInfo.hasNextPage&&data.pageInfo.endCursor;index++){
     data=await page(data.pageInfo.endCursor);
     refreshed=[...refreshed,...data.products];
    }
   }
   if(after)pages.current++;
   setProducts(current=>after?[...current,...refreshed]:refreshed);
   setPageInfo(data.pageInfo);setError(null);
  }catch(error){setError(error instanceof Error?error.message:'De producten konden niet worden geladen.');}
  finally{fetching.current=false;if(!background)setLoading(false);}
 }
 useLiveRefresh(()=>void load(undefined,true));
 const currentSelection=selected?(products.find(item=>item.id===selected.id)||{...selected,availableForSale:false,variants:{...selected.variants,nodes:selected.variants.nodes.map(item=>({...item,availableForSale:false}))}}):null;
 useEffect(()=>{void load();},[]);
 useEffect(()=>{if(!selected)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[selected]);
 function select(product:ShopifyProduct){setRevision(value=>value+1);setSelected(product);if(!dialog.current?.open)dialog.current?.showModal();dialog.current?.querySelector('.dialog-scroll-body')?.scrollTo({top:0});}
 return <section className="product-collection" id="producten" aria-labelledby="collection-title" lang="nl">
  <div className="collection-heading"><h2 id="collection-title">Onze oliebollen</h2>{products.length>0&&<div className="collection-rating"><TrustpilotBadge/><span className="collection-rating-note">Klanten beoordelen PLUQR</span></div>}</div>
  <div className="shop-grid" aria-busy={loading}>{products.map((product,index)=><ProductCard key={product.id} product={product} index={index} onSelect={select}/>)}</div>
  <div className="shop-load-status" role="status" aria-live="polite">{loading&&<p>Onze oliebollen worden geladen…</p>}{error&&<><p className="shop-error">{error}</p><button className="outline-button" onClick={()=>void load(products.length?pageInfo?.endCursor||undefined:undefined)}>Opnieuw proberen</button></>}{!loading&&!error&&!products.length&&<p>Er zijn op dit moment geen producten beschikbaar.</p>}</div>
  {!error&&pageInfo?.hasNextPage&&<button className="outline-button" disabled={loading} onClick={()=>void load(pageInfo.endCursor||undefined)}>Meer oliebollen bekijken</button>}
  <ul className="collection-values" aria-label="Producteigenschappen"><li><Leaf size={16}/>Vegan</li><li><WheatOff size={16}/>Glutenvrij</li><li><Croissant size={16}/>Vers gebakken</li></ul>
  <dialog className="product-dialog product-detail-dialog" ref={dialog} onClose={()=>setSelected(null)} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}} aria-labelledby="product-dialog-title"><button className="product-dialog-close dialog-close-button" onClick={()=>dialog.current?.close()} aria-label="Productdetails sluiten"><X size={21}/></button><div className="dialog-scroll-body">{selected&&<ProductDetails key={`${selected.id}:${revision}`} product={currentSelection!} related={products} onSelect={select} onAdded={()=>dialog.current?.close()} minimal/>}</div></dialog>
 </section>;
}
