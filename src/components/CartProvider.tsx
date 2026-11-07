'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2, X, LockKeyhole, ArrowRight } from 'lucide-react';
import { useDeliveryPreference } from '../hooks/useDeliveryPreference';
import CartDeliveryOptions from './CartDeliveryOptions';
import { useLiveRefresh } from '../hooks/useLiveRefresh';
import { shopifyApi } from '../lib/shopify/browser';
import { formatMoney } from '../lib/shopify/money';
import type { ShopifyCart } from '../lib/shopify/types';
type PublicCart = Omit<ShopifyCart,'id'>;
interface CartResponse { cart: PublicCart | null; warnings?: {code:string}[] }
interface CartContextValue { count: number; busy: boolean; error: string | null; add: (merchandiseId: string, quantity: number, variation?: string) => Promise<boolean>; open: () => void }
const CartContext = createContext<CartContextValue | null>(null);
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error('CartProvider missing');return value;}
export default function CartProvider({children}:{children:ReactNode}) {
 const {pickup,choosePickup}=useDeliveryPreference();
 const [cartOpen,setCartOpen]=useState(false);
 const [deliveryPostcode,setDeliveryPostcode]=useState<string|null>(null);
 const [cart,setCart]=useState<PublicCart|null>(null);
 const [busy,setBusy]=useState(true);
 const [error,setError]=useState<string|null>(null);
 const [notice,setNotice]=useState('');
 const [checkingOut,setCheckingOut]=useState(false);
 const locked=useRef(true);
 const dialog=useRef<HTMLDialogElement>(null);
 const readController=useRef<AbortController|null>(null);
 const mutationVersion=useRef(0);
 async function refreshCart(){
  if(locked.current||readController.current)return;
  const controller=new AbortController();readController.current=controller;
  const version=mutationVersion.current;
  try{
   const data=await shopifyApi<CartResponse>('cart','GET',undefined,controller.signal);
   if(!controller.signal.aborted&&version===mutationVersion.current){setCart(data.cart);setError(null);}
  }catch{
   if(!controller.signal.aborted&&version===mutationVersion.current)setError('Je winkelmand kon niet worden ververst. Probeer opnieuw.');
  }finally{if(readController.current===controller)readController.current=null;}
 }
 useLiveRefresh(()=>{if(cartOpen)void refreshCart();});
 useEffect(()=>()=>readController.current?.abort(),[]);
 useEffect(()=>{
  let cancelled=false;
  shopifyApi<CartResponse>('cart').then(data=>{if(!cancelled)setCart(data.cart);}).catch(()=>{if(!cancelled)setError('De winkelmand kon niet worden geladen. Probeer opnieuw.');}).finally(()=>{if(!cancelled){locked.current=false;setBusy(false);}});
  return()=>{cancelled=true;};
 },[]);
 async function mutate(method:string,body:unknown){
  if(locked.current)return false;
  mutationVersion.current++;readController.current?.abort();readController.current=null;
  locked.current=true;setBusy(true);setError(null);setNotice('');
  try {
   const data=await shopifyApi<CartResponse>('cart',method,body);
   setCart(data.cart);
   if(data.warnings?.length)setNotice('Je winkelmand is aangepast aan de beschikbare voorraad. Controleer de aantallen.');
   return true;
  }catch(error){setError(error instanceof Error?error.message:'De winkelmand kon niet worden bijgewerkt.');return false;}
  finally{locked.current=false;setBusy(false);}
 }
 async function checkout(){
  if(locked.current||!cart?.totalQuantity)return;
  if(!pickup&&!deliveryPostcode){setError('Controleer je bezorgpostcode of kies gratis afhalen.');return;}
  mutationVersion.current++;readController.current?.abort();readController.current=null;
  locked.current=true;setBusy(true);setCheckingOut(true);setError(null);
  try{
   const data=await shopifyApi<{checkoutUrl:string}>('checkout','POST',{deliveryMethod:pickup?'pickup':'delivery',postcode:deliveryPostcode});
   window.location.assign(data.checkoutUrl);
  }catch(error){setError(error instanceof Error?error.message:'De betaalpagina kon niet worden geopend.');}
  finally{locked.current=false;setBusy(false);setCheckingOut(false);}
 }
 const count=cart?.totalQuantity||0;
 return <CartContext.Provider value={{count,busy,error,add:(merchandiseId,quantity,variation)=>mutate('POST',{lines:[{merchandiseId,quantity,...(variation?{variation}:{})}]}),open:()=>{setCartOpen(true);if(!dialog.current?.open)dialog.current?.showModal();dialog.current?.querySelector('.dialog-scroll-body')?.scrollTo({top:0});void refreshCart();}}}>{children}<dialog ref={dialog} className="basket-dialog" onClose={()=>setCartOpen(false)} aria-labelledby="basket-title" lang="nl" onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}><button className="dialog-close-button" onClick={()=>dialog.current?.close()} aria-label="Winkelmand sluiten"><X/></button><div className="dialog-scroll-body"><header className="basket-header"><h2 id="basket-title">Je winkelmand</h2></header><div role="status" aria-live="polite">{busy&&<p className="basket-note">{checkingOut?'Betaalpagina openen…':'Winkelmand bijwerken…'}</p>}{error&&<p className="shop-error">{error}</p>}{notice&&<p className="basket-note">{notice}</p>}</div>{!cart?.totalQuantity?<p className="empty-basket">Je winkelmand is nog leeg.</p>:<><ul className="basket-lines">{cart.lines.nodes.map(line=><li key={line.id}><img className="basket-product-image" src={line.merchandise.product.featuredImage?.url||'/videos/oliebol-slicing-poster.webp'} alt="" width={88} height={88}/><div className="basket-line-copy"><h3>{line.merchandise.product.title}</h3>{line.merchandise.title!=='Default Title'&&<p>{line.merchandise.title}</p>}{line.merchandise.title==='Default Title'?<label className="cart-flavour-choice"><span>Smaak</span><select aria-label={`Smaak voor ${line.merchandise.product.title}`} disabled={busy} value={line.attributes?.find(item=>item.key==='Variatie')?.value||'Naturel'} onChange={event=>void mutate('PATCH',{lines:[{id:line.id,quantity:line.quantity,variation:event.target.value}]})}><option>Naturel</option><option>Rozijnen</option><option>Mix van naturel &amp; rozijnen</option></select></label>:null}<div className="quantity-control"><button disabled={busy} onClick={()=>void mutate('PATCH',{lines:[{id:line.id,quantity:line.quantity-1}]})} aria-label={`Eén ${line.merchandise.product.title} minder`}><Minus size={14}/></button><span>{line.quantity}</span><button disabled={busy||line.quantity>=99} onClick={()=>void mutate('PATCH',{lines:[{id:line.id,quantity:line.quantity+1}]})} aria-label={`Eén ${line.merchandise.product.title} meer`}><Plus size={14}/></button></div></div><div className="basket-line-end"><span>{formatMoney(line.cost.totalAmount)}</span><button disabled={busy} className="detail-icon-button" aria-label={`${line.merchandise.product.title} verwijderen`} onClick={()=>void mutate('DELETE',{lineIds:[line.id]})}><Trash2 size={17}/></button></div></li>)}</ul>{cartOpen&&<CartDeliveryOptions pickup={pickup} onPickup={choosePickup} onVerified={setDeliveryPostcode}/>}<div className="basket-total"><span>{cart.cost.totalAmountEstimated?'Geschat totaal':'Totaal'}</span><strong>{formatMoney(cart.cost.totalAmount)}</strong></div>{!pickup&&deliveryPostcode&&<p className="basket-note">Bezorgkosten volgen bij het afrekenen.</p>}{(pickup||deliveryPostcode)&&<><button className="basket-checkout-button" disabled={busy} onClick={()=>void checkout()}>{checkingOut?'Betaalpagina openen…':'Verder naar betaling'} <ArrowRight size={18}/></button><p className="basket-secure-note"><LockKeyhole size={13} aria-hidden="true"/> {pickup?'Gratis afhalen · Veilig betalen via Shopify':'Adres invullen en veilig betalen via Shopify'}</p></>}</>}<button className="product-buy-button" onClick={()=>{dialog.current?.close();const products=document.getElementById('producten');if(products){products.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}else{window.location.assign('/#producten');}}}>Verder winkelen <ShoppingBag size={17}/></button></div></dialog></CartContext.Provider>;
}
export function CartButton(){const {count,open}=useCart();return <button className="nav-cart-button" aria-label={`Winkelmand bekijken, ${count} producten`} onClick={open}><ShoppingCart size={21} strokeWidth={1.6} aria-hidden="true"/><span aria-hidden="true">{count}</span></button>;}
